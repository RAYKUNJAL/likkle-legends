#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/agent-orchestrator.py
============================

Single-cycle orchestrator that bridges the `paperclip` (control-plane) and
`goose` (execution-plane) AI agents via the shared Supabase tables
`agent_messages` and `agent_memory` (created by migration
`supabase/migrations/20260706_agent_coordination.sql`).

What it does (one cycle, not a daemon loop):
  1. Polls `agent_messages` for rows with status='pending' AND to_agent='goose'.
  2. For each pending row:
       a. Marks it 'claimed' (status='claimed', claimed_at=now()).
       b. Extracts the prompt from payload.prompt (fallback: payload.text).
       c. Runs  `ssh trini "docker exec goose goose run --text '<prompt>'"`
          and captures stdout.
       d. Updates the row to status='done', completed_at=now(), and merges the
          goose output into the payload under the 'result' key.
       e. Upserts a summary into `agent_memory` for agent_name='goose' with a
          key derived from the message id, so paperclip (and the Next.js admin
          panel) can later read what goose produced.
  3. Exits. Scheduling is external (cron / systemd timer / paperclip itself).

----------------------------------------------------------------------
SCHEDULING
----------------------------------------------------------------------
This script intentionally runs ONE poll-and-process cycle and exits, so it can
be cron-scheduled externally without leaving a long-lived process around.

Example crontab entries (run every 2 minutes) on the host that has SSH access
to `trini` and the Supabase service_role key:

    # Every 2 minutes: process pending goose messages
    */2 * * * *  SUPABASE_URL=https://yvoyywnxaammsfwgjvkp.supabase.co \
                 SUPABASE_SERVICE_ROLE_KEY=eyJhbG... \
                 SSH_HOST=trini \
                 /usr/bin/python3 /path/to/scripts/agent-orchestrator.py \
                 >> /var/log/agent-orchestrator.log 2>&1

systemd timer equivalent (`/etc/systemd/system/agent-orchestrator.timer`):

    [Unit]
    Description=Run agent-orchestrator every 2 minutes

    [Timer]
    OnBootSec=1min
    OnUnitActiveSec=2min
    Unit=agent-orchestrator.service

    [Install]
    WantedBy=timers.target

and `/etc/systemd/system/agent-orchestrator.service`:

    [Service]
    Type=oneshot
    Environment=SUPABASE_URL=https://yvoyywnxaammsfwgjvkp.supabase.co
    Environment=SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
    Environment=SSH_HOST=trini
    ExecStart=/usr/bin/python3 /path/to/scripts/agent-orchestrator.py

Then:  systemctl enable --now agent-orchestrator.timer

----------------------------------------------------------------------
ENVIRONMENT VARIABLES
----------------------------------------------------------------------
  SUPABASE_URL               Base URL of the Supabase project.
                             Default: https://yvoyywnxaammsfwgjvkp.supabase.co
  SUPABASE_SERVICE_ROLE_KEY  Service-role JWT (REQUIRED for writes, since RLS
                             denies anon/authenticated on these tables).
                             Falls back to SUPABASE_ANON_KEY if set, but that
                             will only work for reads and is not recommended.
  SSH_HOST                   SSH alias for the VPS hosting the goose container.
                             Default: trini
  GOOSE_CONTAINER            Docker container name for goose.
                             Default: goose
  MAX_MESSAGES_PER_CYCLE     Cap on messages processed per run (default 10).

----------------------------------------------------------------------
DEPENDENCIES
----------------------------------------------------------------------
  Python 3.8+ standard library + `requests`.
  Install requests:  pip install requests
  (No other third-party packages required.)

----------------------------------------------------------------------
NOTE ON RLS
----------------------------------------------------------------------
The migration locks both tables to the `service_role` only. The anon key read
from `tmp/ll_anon_key.txt` is NOT sufficient to insert/update rows — you must
supply `SUPABASE_SERVICE_ROLE_KEY`. The script will refuse to run writes
without it (it will still attempt a read-only poll if only the anon key is
present, but will exit early with a clear message when it finds pending rows
it cannot claim).
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import uuid
from typing import Any, Dict, List, Optional

try:
    import requests  # type: ignore
except ImportError:  # pragma: no cover
    sys.stderr.write(
        "ERROR: the 'requests' package is required. Install with: pip install requests\n"
    )
    sys.exit(2)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DEFAULT_SUPABASE_URL = "https://yvoyywnxaammsfwgjvkp.supabase.co"
DEFAULT_SSH_HOST = "trini"
DEFAULT_GOOSE_CONTAINER = "goose"
DEFAULT_MAX_MESSAGES = 10

# Path to the anon key file relative to the repo root, used as a fallback
# only for read-only polling. Writes require the service-role key.
ANON_KEY_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "tmp",
    "ll_anon_key.txt",
)


def _env(name: str, default: str) -> str:
    val = os.environ.get(name)
    return val if val else default


def get_config() -> Dict[str, str]:
    supabase_url = _env("SUPABASE_URL", DEFAULT_SUPABASE_URL).rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "").strip()
    if not anon_key and os.path.isfile(ANON_KEY_FILE):
        try:
            with open(ANON_KEY_FILE, "r", encoding="utf-8") as fh:
                anon_key = fh.read().strip()
        except OSError:
            anon_key = ""
    # The key used for API auth. Prefer service_role; anon is read-only fallback.
    api_key = service_key or anon_key
    return {
        "supabase_url": supabase_url,
        "service_key": service_key,
        "api_key": api_key,
        "ssh_host": _env("SSH_HOST", DEFAULT_SSH_HOST),
        "goose_container": _env("GOOSE_CONTAINER", DEFAULT_GOOSE_CONTAINER),
        "max_messages": _env("MAX_MESSAGES_PER_CYCLE", str(DEFAULT_MAX_MESSAGES)),
    }


# ---------------------------------------------------------------------------
# Supabase REST helpers (PostgREST)
# ---------------------------------------------------------------------------
class SupabaseClient:
    """Thin wrapper around the Supabase/PostgREST REST API."""

    def __init__(self, base_url: str, api_key: str, service_key: str) -> None:
        self.base_url = base_url
        self.api_key = api_key
        self.service_key = service_key
        self.session = requests.Session()
        # Default headers for anon/authenticated key.
        self.session.headers.update(
            {
                "apikey": api_key,
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

    def _service_headers(self) -> Dict[str, str]:
        """Headers using the service-role key (bypasses RLS)."""
        return {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _require_service(self) -> None:
        if not self.service_key:
            raise RuntimeError(
                "SUPABASE_SERVICE_ROLE_KEY is required for this operation. "
                "The agent_* tables have RLS enabled and deny anon/authenticated."
            )

    def fetch_pending_messages(self, limit: int) -> List[Dict[str, Any]]:
        """Fetch pending messages addressed to goose, oldest first."""
        url = f"{self.base_url}/rest/v1/agent_messages"
        params = {
            "select": "id,from_agent,to_agent,message_type,payload,status,created_at",
            "to_agent": "eq.goose",
            "status": "eq.pending",
            "order": "created_at.asc",
            "limit": str(limit),
        }
        resp = self.session.get(url, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def claim_message(self, message_id: str) -> None:
        """Atomically mark a message as claimed so no other worker takes it."""
        self._require_service()
        url = f"{self.base_url}/rest/v1/agent_messages"
        params = {"id": f"eq.{message_id}"}
        body = {
            "status": "claimed",
            "claimed_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
        }
        # Pre-condition: only claim if still pending (PostgREST header).
        headers = self._service_headers()
        headers["Prefer"] = "return=representation"
        headers["x-confirm"] = "true"
        # Use the PATCH; PostgREST applies the filter via the id eq param.
        resp = requests.patch(url, params=params, json=body, headers=headers, timeout=30)
        if resp.status_code == 200:
            rows = resp.json()
            if not rows:
                # Someone else claimed it between our fetch and claim.
                raise RuntimeError(f"message {message_id} was already claimed")
        resp.raise_for_status()

    def complete_message(
        self, message_id: str, payload: Dict[str, Any], status: str = "done"
    ) -> None:
        """Mark a message done/failed and merge the result into its payload."""
        self._require_service()
        url = f"{self.base_url}/rest/v1/agent_messages"
        params = {"id": f"eq.{message_id}"}
        body = {
            "status": status,
            "payload": payload,
            "completed_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
        }
        headers = self._service_headers()
        headers["Prefer"] = "return=minimal"
        resp = requests.patch(url, params=params, json=body, headers=headers, timeout=30)
        resp.raise_for_status()

    def upsert_memory(self, agent_name: str, memory_key: str, memory_value: Dict[str, Any]) -> None:
        """Upsert a row into agent_memory for the given agent + key."""
        self._require_service()
        url = f"{self.base_url}/rest/v1/agent_memory"
        headers = self._service_headers()
        headers["Prefer"] = "resolution=merge-duplicates,return=minimal"
        body = {
            "agent_name": agent_name,
            "memory_key": memory_key,
            "memory_value": memory_value,
        }
        resp = requests.post(url, json=body, headers=headers, timeout=30)
        resp.raise_for_status()


# ---------------------------------------------------------------------------
# Goose execution
# ---------------------------------------------------------------------------
def run_goose(ssh_host: str, container: str, prompt: str, timeout: int = 600) -> str:
    """Run goose via SSH -> docker exec and return its stdout.

    Command:  ssh trini "docker exec goose goose run --text '<prompt>'"
    """
    inner = f"docker exec {container} goose run --text {shell_quote(prompt)}"
    cmd = ["ssh", ssh_host, inner]
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    # goose may write diagnostics to stderr; we capture stdout as the result.
    # If stdout is empty but stderr has content and rc != 0, surface stderr.
    out = proc.stdout
    if not out and proc.returncode != 0:
        out = f"[goose error rc={proc.returncode}]\n{proc.stderr}"
    return out.strip()


def shell_quote(s: str) -> str:
    """Single-quote a string for safe inclusion in a shell command."""
    return "'" + s.replace("'", "'\"'\"'") + "'"


# ---------------------------------------------------------------------------
# Orchestration cycle
# ---------------------------------------------------------------------------
def extract_prompt(payload: Dict[str, Any]) -> str:
    """Pull the prompt text out of a message payload."""
    if isinstance(payload, dict):
        if isinstance(payload.get("prompt"), str):
            return payload["prompt"]
        if isinstance(payload.get("text"), str):
            return payload["text"]
    # Fall back to a JSON dump so goose still gets something actionable.
    return json.dumps(payload)


def process_cycle(cfg: Dict[str, str]) -> Dict[str, int]:
    """Run one poll-and-process cycle. Returns a small stats dict."""
    stats = {"polled": 0, "claimed": 0, "done": 0, "failed": 0}
    client = SupabaseClient(
        base_url=cfg["supabase_url"],
        api_key=cfg["api_key"],
        service_key=cfg["service_key"],
    )
    limit = int(cfg["max_messages"])

    try:
        messages = client.fetch_pending_messages(limit=limit)
    except requests.RequestException as exc:
        sys.stderr.write(f"[orchestrator] failed to fetch pending messages: {exc}\n")
        return stats

    stats["polled"] = len(messages)
    if not messages:
        return stats

    if not cfg["service_key"]:
        sys.stderr.write(
            "[orchestrator] pending messages found but SUPABASE_SERVICE_ROLE_KEY "
            "is not set — cannot claim/write. Set it to process messages.\n"
        )
        return stats

    for msg in messages:
        msg_id = msg.get("id")
        if not msg_id:
            continue
        payload = msg.get("payload") or {}
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except json.JSONDecodeError:
                payload = {"raw": payload}
        if not isinstance(payload, dict):
            payload = {"raw": payload}

        # 1. Claim
        try:
            client.claim_message(msg_id)
            stats["claimed"] += 1
        except (RuntimeError, requests.RequestException) as exc:
            sys.stderr.write(f"[orchestrator] could not claim {msg_id}: {exc}\n")
            continue

        # 2. Run goose
        prompt = extract_prompt(payload)
        try:
            result = run_goose(cfg["ssh_host"], cfg["goose_container"], prompt)
            new_status = "done"
            stats["done"] += 1
        except subprocess.TimeoutExpired:
            result = "[orchestrator] goose run timed out"
            new_status = "failed"
            stats["failed"] += 1
        except Exception as exc:  # noqa: BLE001
            result = f"[orchestrator] goose run failed: {exc}"
            new_status = "failed"
            stats["failed"] += 1

        # 3. Merge result into payload and update the message row.
        new_payload = dict(payload)
        new_payload["result"] = result
        try:
            client.complete_message(msg_id, new_payload, status=new_status)
        except requests.RequestException as exc:
            sys.stderr.write(f"[orchestrator] could not complete {msg_id}: {exc}\n")

        # 4. Upsert a memory summary for goose.
        try:
            memory_key = f"goose_run:{msg_id}"
            memory_value = {
                "message_id": msg_id,
                "from_agent": msg.get("from_agent"),
                "message_type": msg.get("message_type"),
                "status": new_status,
                "result_preview": result[:512],
                "result_len": len(result),
                "completed_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
            }
            client.upsert_memory("goose", memory_key, memory_value)
        except requests.RequestException as exc:
            sys.stderr.write(f"[orchestrator] could not upsert memory for {msg_id}: {exc}\n")

    return stats


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> int:
    cfg = get_config()
    stats = process_cycle(cfg)
    print(
        f"[orchestrator] cycle complete: "
        f"polled={stats['polled']} claimed={stats['claimed']} "
        f"done={stats['done']} failed={stats['failed']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

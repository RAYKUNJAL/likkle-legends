#!/usr/bin/env python3
import json, urllib.request

env = open("/opt/likkle-legends/.env.production").read()
def get(k):
    for line in env.splitlines():
        if line.startswith(k + "="):
            return line.split("=",1)[1].strip().strip('"').strip("'")
    return ""

svc = get("SUPABASE_SERVICE_ROLE_KEY")
uid = "96218dae-d913-41e4-9fa8-e05625a7e4ad"
H = {"apikey": svc, "Authorization": f"Bearer {svc}", "Accept": "application/json"}

def get_json(url):
    req = urllib.request.Request(url, headers=H)
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode()

print("PROFILE", get_json(f"http://127.0.0.1:8800/rest/v1/profiles?id=eq.{uid}&select=*")[:800])
print("USERS", get_json(f"http://127.0.0.1:8800/rest/v1/users?id=eq.{uid}&select=*")[:800])
print("CHILDREN", get_json(f"http://127.0.0.1:8800/rest/v1/children?or=(parent_id.eq.{uid},primary_user_id.eq.{uid})&select=*")[:800])
print("AUTH", get_json(f"http://127.0.0.1:8800/auth/v1/admin/users/{uid}")[:600])

req = urllib.request.Request(
    "http://127.0.0.1:8800/rest/v1/",
    headers={**H, "Accept": "application/openapi+json"},
)
with urllib.request.urlopen(req, timeout=15) as r:
    d = json.load(r)
defs = d.get("definitions", {})
for t in ["profiles", "users", "children"]:
    p = (defs.get(t) or {}).get("properties") or {}
    print(t, "n=", len(p), sorted(p.keys())[:50])

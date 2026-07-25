#!/usr/bin/env python3
"""Seed a child profile for the owner account if missing."""
import json, urllib.request, uuid

env = open("/opt/likkle-legends/.env.production").read()
def get(k):
    for line in env.splitlines():
        if line.startswith(k + "="):
            return line.split("=",1)[1].strip().strip('"').strip("'")
    return ""

svc = get("SUPABASE_SERVICE_ROLE_KEY")
uid = "96218dae-d913-41e4-9fa8-e05625a7e4ad"
H = {
    "apikey": svc,
    "Authorization": f"Bearer {svc}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

def req(method, url, data=None):
    body = None if data is None else json.dumps(data).encode()
    r = urllib.request.Request(url, data=body, headers=H, method=method)
    with urllib.request.urlopen(r, timeout=15) as resp:
        return resp.status, resp.read().decode()

# Ensure children exist
st, body = req("GET", f"http://127.0.0.1:8800/rest/v1/children?or=(parent_id.eq.{uid},primary_user_id.eq.{uid})&select=id,name,first_name,parent_id")
print("existing", st, body)
kids = json.loads(body or "[]")
if kids:
    print("already has", len(kids), "children")
else:
    payload = {
        "parent_id": uid,
        "primary_user_id": uid,
        "first_name": "Legend",
        "name": "Legend",
        "age": 5,
        "age_track": "mini",
        "avatar_id": "lion",
        "primary_island": "trinidad_and_tobago",
        "total_xp": 0,
        "current_level": 1,
        "current_streak": 0,
    }
    try:
        st, body = req("POST", "http://127.0.0.1:8800/rest/v1/children", payload)
        print("insert", st, body[:400])
    except Exception as e:
        print("insert fail", e)
        # minimal
        payload2 = {
            "parent_id": uid,
            "name": "Legend",
            "age": 5,
            "avatar_id": "lion",
            "primary_island": "trinidad_and_tobago",
        }
        st, body = req("POST", "http://127.0.0.1:8800/rest/v1/children", payload2)
        print("minimal insert", st, body[:400])

# Ensure admin flag stuck
st, body = req("PATCH", f"http://127.0.0.1:8800/rest/v1/profiles?id=eq.{uid}", {
    "is_admin": True,
    "role": "super_admin",
    "full_name": "Ray Kunjal",
})
print("profile patch", st, body[:300])
print("DONE")

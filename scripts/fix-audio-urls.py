#!/usr/bin/env python3
"""Rewrite audio URLs from internal to public in stories_library."""
import json, urllib.request

svc = open("/opt/likkle-legends/.env.production").read().split("SUPABASE_SERVICE_ROLE_KEY=")[1].split("\n")[0].strip()
H = {"apikey": svc, "Authorization": f"Bearer {svc}", "Content-Type": "application/json"}

req = urllib.request.Request("http://127.0.0.1:8800/rest/v1/stories_library?select=id,title,content", headers=H)
books = json.load(urllib.request.urlopen(req, timeout=15))

for book in books:
    content = book["content"]
    if isinstance(content, str):
        content = json.loads(content)
    urls = content.get("audio_urls", [])
    if not urls:
        continue
    new_urls = [u.replace("http://supabase-kong:8000", "https://www.likklelegends.com/supabase") if "supabase-kong" in u else u for u in urls]
    content["audio_urls"] = new_urls
    data = json.dumps({"content": content}).encode()
    req2 = urllib.request.Request(
        f'http://127.0.0.1:8800/rest/v1/stories_library?id=eq.{book["id"]}',
        data=data,
        headers={**H, "Prefer": "return=minimal"},
        method="PATCH"
    )
    urllib.request.urlopen(req2, timeout=15)
    print(f'Fixed: {book["title"]} ({len(new_urls)} urls)')

print("ALL FIXED")

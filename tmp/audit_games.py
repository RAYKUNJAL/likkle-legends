import json, urllib.request, sys

key = open('tmp/ll_anon_key.txt').read().strip()
base = 'https://yvoyywnxaammsfwgjvkp.supabase.co/rest/v1'

def q(path):
    req = urllib.request.Request(base + path, headers={'apikey': key, 'Authorization': 'Bearer ' + key})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

# full row for games
games = q('/content_items?content_type=eq.game&select=*&limit=20')
if isinstance(games, dict):
    print('ERROR:', games)
else:
    print(f'{len(games)} games')
    if games:
        print('COLUMNS:', sorted(games[0].keys()))
        for g in games:
            print('-', g.get('id'), '|', g.get('title'), '| slug:', g.get('slug'), '| meta:', json.dumps(g.get('metadata'))[:120])

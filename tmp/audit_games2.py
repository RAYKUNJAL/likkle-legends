import json, urllib.request

key = open('tmp/ll_anon_key.txt').read().strip()
base = 'https://yvoyywnxaammsfwgjvkp.supabase.co/rest/v1'

def q(path):
    req = urllib.request.Request(base + path, headers={'apikey': key, 'Authorization': 'Bearer ' + key})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

games = q('/games?select=id,title,game_type,game_url,is_active&order=created_at.desc&limit=30')
if isinstance(games, dict):
    print('ERROR:', games)
else:
    print(f'{len(games)} rows in games table')
    for g in games:
        print('-', g['id'][:8], '|', g.get('title'), '| type:', g.get('game_type'), '| url:', g.get('game_url'), '| active:', g.get('is_active'))

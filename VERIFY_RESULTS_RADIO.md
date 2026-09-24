# VERIFY RESULTS (Radio)

| Command | Exit Code | Last 15 Lines of Output |
|---|---:|---|
| `npm ci --legacy-peer-deps` | 0 | ```\n217 packages are looking for funding\n  run `npm fund` for details\n\n45 vulnerabilities (5 low, 22 moderate, 16 high, 2 critical)\n\nTo address issues that do not require attention, run:\n  npm audit fix\n\nTo address all issues possible (including breaking changes), run:\n  npm audit fix --force\n\nSome issues need review, and may require choosing\na different dependency.\n\nRun `npm audit` for details.\n``` |
| `npm run build` | 1 | ```\n\napp/layout.tsx\n`next/font` error:\nFailed to fetch `Fredoka` from Google Fonts.\n\napp/layout.tsx\n`next/font` error:\nFailed to fetch `Montserrat` from Google Fonts.\n\napp/layout.tsx\n`next/font` error:\nFailed to fetch `Quicksand` from Google Fonts.\n\n\n> Build failed because of webpack errors\n``` |
| `npx tsx scripts/verify-island-checkout.ts` | 0 | ```\nIsland checkout fail-closed checks passed.\n``` |
| `npx tsx scripts/verify-music-store.ts` | 0 | ```\nmusic store checks passed\n{\n  "skus": {\n    "music_download_1": 1,\n    "music_download_bundle_5": 4,\n    "custom_song_request": 24.99\n  },\n  "playable": [\n    "/assets/youtube/music/drinking-water.mp3",\n    "/assets/youtube/music/saving-money.mp3"\n  ],\n  "missingInventory": 14\n}\n``` |
| `npm run test:webapp-honesty` | 0 | ```\n\n> likkle-legends-mail-club@0.1.0 test:webapp-honesty\n> tsx scripts/test-webapp-honesty.ts\n\nwebapp honesty checks passed\n``` |
| `npx tsx scripts/verify-likkle-radio.ts` | 0 | ```\n    },\n    {\n      "id": "calm-cove",\n      "name": "Calm Cove",\n      "dj": "Benny of Shadows",\n      "tracks": []\n    },\n    {\n      "id": "playtime",\n      "name": "Dilly's Playtime",\n      "dj": "Dilly Doubles",\n      "tracks": []\n    }\n  ]\n}\n``` |
| `grep -rniE 'wipay|fake success|sk_live_|PAYPAL_CLIENT_SECRET *= *["\x27][A-Za-z0-9]' app lib components .next --include=*.ts --include=*.tsx --include=*.js --include=*.html \| grep -v node_modules \| head -20` | 0 | ```\n(no output)\n``` |

- Leftover grep hit count (full scan before `head -20`): **0** (clean)
- Full-scan grep pipeline exit code: **1** (expected when no matches)

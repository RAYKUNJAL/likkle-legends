-- =============================================================================
-- SEED: Tales from the Caribbean — Island Storybooks
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- =============================================================================

INSERT INTO public.storybooks (id, title, summary, content_json, cover_image_url, age_track, tier_required, island_theme, reading_time_minutes, is_active, display_order)
VALUES

-- ── 1. ANANSI AND THE GREAT YAM ──────────────────────────────────────────────
(
  '11111111-1111-1111-1111-111111111111',
  'Anansi and the Great Yam',
  'A clever spider tries to outsmart the whole village during the Great Yam Festival — but hunger teaches him the sweetest lesson of all.',
  '{
    "pages": [
      {"page_number": 1, "text": "Once upon a time in the lush hills of Jamaica, there lived a very clever spider named Anansi. He was known across the island for his quick tongue and even quicker mind.", "illustration_url": "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800"},
      {"page_number": 2, "text": "It was the time of the Great Yam Festival! Every family brought their biggest yam to share. The smell of roasted yams floated all through the village.", "illustration_url": "https://images.unsplash.com/photo-1590779033100-9f60705a413b?w=800"},
      {"page_number": 3, "text": "Anansi was very hungry, but he wanted ALL the yams for himself. He hatched a sneaky plan to trick everyone.", "illustration_url": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800"},
      {"page_number": 4, "text": "He ran to one side of the village and shouted, \"The festival is over there!\" Then he ran to the other side and called everyone the other way.", "illustration_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"},
      {"page_number": 5, "text": "But while Anansi was running back and forth, all his neighbours sat down together and ate every single yam. There was nothing left!", "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"},
      {"page_number": 6, "text": "Poor Anansi came home with an empty belly. His neighbour Mama Tortoise smiled kindly and said, \"Anansi, come share what we saved for you.\"", "illustration_url": "https://images.unsplash.com/photo-1455656678494-4d1b5f3e7ad4?w=800"},
      {"page_number": 7, "text": "She gave him a small bowl of yam porridge. It was the most delicious thing Anansi had ever tasted — because it was made with love.", "illustration_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"},
      {"page_number": 8, "text": "From that day on, Anansi understood: sharing brings more joy than any trick. And every festival, he was the first to bring yams for the whole village.", "illustration_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
    ],
    "glossary": [
      {"word": "Anansi", "meaning": "A famous trickster spider from West African and Caribbean folklore."},
      {"word": "Yam", "meaning": "A starchy root vegetable that is a staple food in the Caribbean."}
    ]
  }',
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600',
  'big', 'free', 'Jamaica', 6, true, 1
),

-- ── 2. THE BRAVE LEATHERBACK TURTLE ──────────────────────────────────────────
(
  '22222222-2222-2222-2222-222222222222',
  'The Brave Leatherback Turtle',
  'Deep in the ocean off Trinidad, a young leatherback turtle named Lara must find the courage to make the long journey home to nest on the beach where she was born.',
  '{
    "pages": [
      {"page_number": 1, "text": "Far beneath the warm Caribbean Sea, a young leatherback turtle named Lara swam with her family. She was the biggest turtle in the ocean — almost as long as a car!", "illustration_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"},
      {"page_number": 2, "text": "One day, Lara felt something deep inside her calling her home. It was time — time to find the beach in Trinidad where she hatched ten years ago.", "illustration_url": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800"},
      {"page_number": 3, "text": "The ocean was wide and full of dangers. A plastic bag drifted by. Lara pushed it away with her flipper. \"That is not a jellyfish,\" she said wisely.", "illustration_url": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800"},
      {"page_number": 4, "text": "She swam past fishing nets and through a roaring storm. Lara was tired but brave. The stars guided her north, then west, then home.", "illustration_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800"},
      {"page_number": 5, "text": "At last! The sandy beach of Grande Riviere glittered under the full moon. Lara crawled up the sand, breathing the warm night air.", "illustration_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
      {"page_number": 6, "text": "She dug a deep nest and laid one hundred round white eggs — each one a new life. Children watching from far away gasped with wonder.", "illustration_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"},
      {"page_number": 7, "text": "A little girl named Kezia whispered, \"Thank you, turtle, for coming home.\" Lara seemed to hear her. She turned her ancient eyes toward the child and blinked.", "illustration_url": "https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?w=800"},
      {"page_number": 8, "text": "Months later, tiny turtles scrambled down to the sea. Kezia waved. Somewhere out there, Lara was already swimming, watching over them all.", "illustration_url": "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800"}
    ],
    "glossary": [
      {"word": "Leatherback", "meaning": "The world''s largest sea turtle, found in Caribbean waters."},
      {"word": "Grande Riviere", "meaning": "A famous beach in Trinidad where leatherback turtles nest every year."},
      {"word": "Nest", "meaning": "A hole a turtle digs in the sand to lay her eggs."}
    ]
  }',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
  'big', 'free', 'Trinidad and Tobago', 7, true, 2
),

-- ── 3. TANTY SPICE AND THE BREADFRUIT TREE ───────────────────────────────────
(
  '33333333-3333-3333-3333-333333333333',
  'Tanty Spice and the Breadfruit Tree',
  'When a great storm threatens the old breadfruit tree in the yard, Tanty Spice tells the children the magical story of how breadfruit first came to the Caribbean.',
  '{
    "pages": [
      {"page_number": 1, "text": "Every evening, the children gathered under the great breadfruit tree in Tanty Spice''s yard. She always had a story ready, warm like the evening breeze.", "illustration_url": "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=800"},
      {"page_number": 2, "text": "One night, a big storm was coming. The wind bent the old tree sideways. \"Tanty, will our tree be okay?\" asked little Marcus, holding her hand.", "illustration_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800"},
      {"page_number": 3, "text": "Tanty smiled her big warm smile. \"That tree has seen a hundred storms, child. Let me tell you how it got so strong.\"", "illustration_url": "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800"},
      {"page_number": 4, "text": "Long ago, she said, the Caribbean islands had a terrible hunger. The great Captain Bligh sailed from the Pacific Ocean carrying small breadfruit plants to bring food to the people.", "illustration_url": "https://images.unsplash.com/photo-1578496781197-b85385c91519?w=800"},
      {"page_number": 5, "text": "The plants survived the long ocean journey. When they were planted in island soil, they grew tall and strong, giving heavy green fruits that fed whole families.", "illustration_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"},
      {"page_number": 6, "text": "\"Our breadfruit tree,\" said Tanty, \"was planted by my grandmother''s grandmother. Every time it drops a fruit, it remembers all the hands that cared for it.\"", "illustration_url": "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=800"},
      {"page_number": 7, "text": "The storm came — loud and rattling. But the old tree held firm, its roots deep in island soil. In the morning, three fat breadfruits had fallen as a gift.", "illustration_url": "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800"},
      {"page_number": 8, "text": "Tanty made oil-down — breadfruit, coconut milk, callaloo, and dumplings — for the whole street. \"Food is love,\" she said. \"And love weathers every storm.\"", "illustration_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"}
    ],
    "glossary": [
      {"word": "Breadfruit", "meaning": "A large green fruit that grows on trees across the Caribbean. When cooked it tastes like fresh bread!"},
      {"word": "Oil-down", "meaning": "The national dish of Grenada — a stew made with breadfruit, coconut milk, and vegetables."},
      {"word": "Callaloo", "meaning": "Leafy green vegetables used in Caribbean cooking, similar to spinach."}
    ]
  }',
  'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600',
  'mini', 'free', 'Trinidad and Tobago', 8, true, 3
),

-- ── 4. DILLY DOUBLES OPENS A BEACH SHOP ──────────────────────────────────────
(
  '44444444-4444-4444-4444-444444444444',
  'Dilly Doubles Opens a Beach Shop',
  'Dilly Doubles wants to sell the best doubles in all of Maracas Bay — but first he has to learn that the secret ingredient is something money cannot buy.',
  '{
    "pages": [
      {"page_number": 1, "text": "Dilly Doubles loved three things: the ocean, his grandmother''s recipe, and making people smile. So he decided to open a doubles shop right on Maracas Beach!", "illustration_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
      {"page_number": 2, "text": "He set up his little cart under a palm tree. \"Best doubles in Trinidad!\" he called out. But no one came. The other shops had bigger signs and louder music.", "illustration_url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"},
      {"page_number": 3, "text": "A little girl walked by. She was crying — her ice cream had fallen in the sand. Dilly gave her a free bara bread and a wide smile. Her face lit up like the sun.", "illustration_url": "https://images.unsplash.com/photo-1503435980610-a51f3ddfee50?w=800"},
      {"page_number": 4, "text": "Her father came to say thank you and bought six doubles. He called his friends over. Soon a long line stretched all the way to the sea!", "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"},
      {"page_number": 5, "text": "\"What is your secret?\" a tourist asked, licking his fingers. Dilly laughed. \"No secret — just chickpeas, pepper sauce, and one big helping of kindness!\"", "illustration_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"},
      {"page_number": 6, "text": "By sunset, Dilly had sold every single doubles. He was tired but his heart was full. He saved the last bara for the little girl who started it all.", "illustration_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"},
      {"page_number": 7, "text": "That night, Dilly wrote in his notebook: \"Day 1: Sold out. Made 47 new friends. The beach smells like happiness.\"", "illustration_url": "https://images.unsplash.com/photo-1455656678494-4d1b5f3e7ad4?w=800"},
      {"page_number": 8, "text": "And from that day on, Dilly Doubles'' beach cart was the most beloved spot on Maracas. Not because of the recipe — because of the heart behind it.", "illustration_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
    ],
    "glossary": [
      {"word": "Doubles", "meaning": "Trinidad''s most famous street food — two pieces of fried bara bread filled with curried chickpeas."},
      {"word": "Bara", "meaning": "Soft fried dough used to make doubles."},
      {"word": "Maracas Bay", "meaning": "The most popular beach in Trinidad, famous for its waves and its bake and shark shops."}
    ]
  }',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
  'mini', 'free', 'Trinidad and Tobago', 6, true, 4
),

-- ── 5. THE LITTLE CRAB WHO LOVED MUSIC ───────────────────────────────────────
(
  '55555555-5555-5555-5555-555555555555',
  'The Little Crab Who Loved Music',
  'Crabby cannot dance — his claws are too big and his legs too sideways. But when Carnival comes to the beach, he discovers that everyone has a rhythm of their own.',
  '{
    "pages": [
      {"page_number": 1, "text": "Crabby lived under a big rock at the edge of the sea in Barbados. He loved music more than anything — the drumming of rain, the swoosh of waves, the chirp of tree frogs at night.", "illustration_url": "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800"},
      {"page_number": 2, "text": "But when the fish danced and the starfish swayed, Crabby sat alone. \"I cannot dance,\" he said sadly. \"My legs go sideways and my claws are too big.\"", "illustration_url": "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800"},
      {"page_number": 3, "text": "One day, a steel pan band set up on the beach for Crop Over Festival. The sound floated right down to the ocean floor and into Crabby''s shell.", "illustration_url": "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=800"},
      {"page_number": 4, "text": "Crabby''s claws started tapping. Click-click-click. Click-click-click. He could not help it — the rhythm took over his whole body.", "illustration_url": "https://images.unsplash.com/photo-1534467788627-71a750b6c2ef?w=800"},
      {"page_number": 5, "text": "The pelican saw him. \"Crabby is playing percussion!\" she shouted. All the sea creatures stopped and listened. The clicking matched the steel pan perfectly.", "illustration_url": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800"},
      {"page_number": 6, "text": "The musicians waved Crabby up onto the stage. He was terrified. But when the drums began, his claws moved on their own — click-click-clack-click!", "illustration_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800"},
      {"page_number": 7, "text": "The crowd cheered! They had never heard crab percussion before. Crabby beamed — his sideways legs were now dancing too, in his own perfectly crabby way.", "illustration_url": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800"},
      {"page_number": 8, "text": "From then on, Crabby played at every beach festival. He learned the best lesson of all: everyone has their own music — you just have to let it out.", "illustration_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
    ],
    "glossary": [
      {"word": "Steel pan", "meaning": "A musical instrument made from oil drums, invented in Trinidad and Tobago. The national instrument of Trinidad!"},
      {"word": "Crop Over", "meaning": "Barbados''s biggest festival, celebrating the end of the sugarcane harvest season."},
      {"word": "Percussion", "meaning": "Musical instruments you hit or tap to make rhythm, like drums or claves."}
    ]
  }',
  'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600',
  'mini', 'free', 'Barbados', 6, true, 5
),

-- ── 6. R.O.T.I. LEARNS TO COUNT COCONUTS ─────────────────────────────────────
(
  '66666666-6666-6666-6666-666666666666',
  'R.O.T.I. Learns to Count Coconuts',
  'R.O.T.I. the robot is very good at counting — until he visits a Caribbean coconut market and discovers that maths is everywhere you look!',
  '{
    "pages": [
      {"page_number": 1, "text": "R.O.T.I. was a friendly learning robot who lived in St Lucia. His name stood for Remarkable Operations Technology Intelligence. His favourite thing was numbers.", "illustration_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"},
      {"page_number": 2, "text": "One Saturday morning, he went to the market with his friend Jade. The market was full of colours, smells, and sounds — and coconuts EVERYWHERE.", "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"},
      {"page_number": 3, "text": "\"R.O.T.I., how many coconuts are in that pile?\" asked Jade. R.O.T.I.''s eyes blinked. \"One, two, three... forty-seven!\" The coconut man clapped. \"Right!\"", "illustration_url": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800"},
      {"page_number": 4, "text": "\"Now,\" said Jade, \"if we buy six coconuts and give two to Tanty Rose, how many do we have left?\" R.O.T.I. beeped. \"Six minus two equals four!\"", "illustration_url": "https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?w=800"},
      {"page_number": 5, "text": "They played maths games all through the market. How many bananas in a bunch? If pineapples cost three dollars each, how much for five? R.O.T.I. loved it!", "illustration_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"},
      {"page_number": 6, "text": "Then an old woman called Miss Violet asked, \"How many waves reach the shore in one minute?\" R.O.T.I. counted carefully. \"Eighteen, Miss Violet.\"", "illustration_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
      {"page_number": 7, "text": "She smiled. \"Maths is not only in books, child. It''s in the ocean, the market, the music — everywhere on this island.\" R.O.T.I.''s circuits glowed warm.", "illustration_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"},
      {"page_number": 8, "text": "Walking home, R.O.T.I. counted everything: birds on a wire (twelve), steps to the house (eighty-three), stars appearing in the sky (too many to count — and that was wonderful).", "illustration_url": "https://images.unsplash.com/photo-1455656678494-4d1b5f3e7ad4?w=800"}
    ],
    "glossary": [
      {"word": "R.O.T.I.", "meaning": "Remarkable Operations Technology Intelligence — a friendly learning robot who lives in the Caribbean."},
      {"word": "Market", "meaning": "A place where people buy and sell fresh food, crafts, and other goods."},
      {"word": "Subtract", "meaning": "To take one number away from another. Example: 6 minus 2 equals 4."}
    ]
  }',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
  'mini', 'free', 'St Lucia', 6, true, 6
),

-- ── 7. THE CARNIVAL COLOUR ADVENTURE ─────────────────────────────────────────
(
  '77777777-7777-7777-7777-777777777777',
  'The Carnival Colour Adventure',
  'Zara is nervous about Carnival — there are so many colours and so much noise! But when she puts on her costume and hears the steel pan, she discovers the magic of belonging.',
  '{
    "pages": [
      {"page_number": 1, "text": "Carnival was coming to Port of Spain and everyone was excited. Everyone except Zara. The colours were too bright, the drums too loud, and the crowds too big.", "illustration_url": "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=800"},
      {"page_number": 2, "text": "Her grandmother brought out a beautiful costume — gold and blue and green, with feathers that reached the sky. \"This was mine when I was your age,\" she said.", "illustration_url": "https://images.unsplash.com/photo-1534467788627-71a750b6c2ef?w=800"},
      {"page_number": 3, "text": "Zara put it on slowly. The feathers tickled her cheeks. The gold cloth shimmered. She looked in the mirror and gasped — she looked like a queen!", "illustration_url": "https://images.unsplash.com/photo-1494790108755-2616b612c830?w=800"},
      {"page_number": 4, "text": "On Carnival Monday, Granny took her hand. The steel pan music floated down the street. Zara''s feet started moving before her brain told them to.", "illustration_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800"},
      {"page_number": 5, "text": "She stepped into the parade. Thousands of colours swirled around her. Blue for the sea. Gold for the sun. Red for the fire in every Caribbean heart.", "illustration_url": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800"},
      {"page_number": 6, "text": "A boy in a green parrot costume waved at her. An old man in a silver King costume smiled. Everyone here was family, even the strangers.", "illustration_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"},
      {"page_number": 7, "text": "By Tuesday evening, Zara was the loudest, happiest child in the whole band. \"Granny!\" she shouted over the music. \"Why was I ever scared?\"", "illustration_url": "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=800"},
      {"page_number": 8, "text": "Granny laughed her big laugh. \"Because the best things in life always feel a little scary at first, darling. That''s how you know they''re worth it.\"", "illustration_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
    ],
    "glossary": [
      {"word": "Carnival", "meaning": "The biggest festival in Trinidad and Tobago — two days of costumes, music, and dancing before Lent."},
      {"word": "Band", "meaning": "In Carnival, a ''band'' is a group of costumed players who march together in the parade."},
      {"word": "Steel pan", "meaning": "The national musical instrument of Trinidad and Tobago, invented from oil drums."}
    ]
  }',
  'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=600',
  'mini', 'free', 'Trinidad and Tobago', 7, true, 7
),

-- ── 8. THE MYSTERY OF THE MISSING MANGO ──────────────────────────────────────
(
  '88888888-8888-8888-8888-888888888888',
  'The Mystery of the Missing Mango',
  'Someone has stolen the biggest, ripest mango from Farmer Brown''s tree — and young detective Kia is on the case! A funny island whodunit for little readers.',
  '{
    "pages": [
      {"page_number": 1, "text": "Every summer, one giant mango grew on Farmer Brown''s tree in Grenada. It was the size of a football, gold and red, and it smelled like sunshine. This summer, it was GONE.", "illustration_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"},
      {"page_number": 2, "text": "Kia pulled out her detective notebook. She had three suspects: the goat next door (always hungry), the wind (very strong lately), and her little brother Marco (always suspicious).", "illustration_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"},
      {"page_number": 3, "text": "Clue 1: Sticky yellow footprints leading from the tree toward the river. Kia measured them with her ruler. Too big for a goat. Too small for a man.", "illustration_url": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800"},
      {"page_number": 4, "text": "Clue 2: A half-eaten mango seed near the mango tree. Something with very sharp teeth had been here. Kia crossed off the wind. Wind has no teeth.", "illustration_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"},
      {"page_number": 5, "text": "Clue 3: A long striped tail disappearing into the bush. Kia spun around. She knew exactly who the thief was!", "illustration_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"},
      {"page_number": 6, "text": "She crept to the mango tree and looked up. There — sitting in the highest branch — was a green Mona monkey, with mango juice all over his face and a very guilty smile.", "illustration_url": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800"},
      {"page_number": 7, "text": "\"Mystery solved!\" said Kia. The monkey chattered and dropped a mango seed right on her head. \"That is your apology, I suppose,\" she laughed.", "illustration_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
      {"page_number": 8, "text": "Farmer Brown laughed too. He planted the seed. \"Next year, there will be two mango trees — one for us, and one for our cheeky monkey neighbour.\"", "illustration_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
    ],
    "glossary": [
      {"word": "Detective", "meaning": "Someone who solves mysteries by finding and following clues."},
      {"word": "Mona monkey", "meaning": "A small, playful monkey with a striped tail that lives in Grenada — the only wild monkey in the Eastern Caribbean."},
      {"word": "Suspect", "meaning": "Someone who might have done something wrong."}
    ]
  }',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600',
  'big', 'free', 'Grenada', 6, true, 8
),

-- ── 9. THE DAY THE OCEAN TURNED BLUE ─────────────────────────────────────────
(
  '99999999-9999-9999-9999-999999999999',
  'The Day the Ocean Turned Blue',
  'Why is the Caribbean Sea so beautifully blue? When curious twins Amara and Kwame ask their grandfather, he tells them a story that stretches back to the very first sunrise.',
  '{
    "pages": [
      {"page_number": 1, "text": "Amara and Kwame sat on the dock in the Bahamas, their feet dangling over the water. The ocean was so blue it hurt to look at — like a jewel the size of the world.", "illustration_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800"},
      {"page_number": 2, "text": "\"Grandpa,\" said Amara, \"why is the sea so blue here? Not grey like in the pictures of England. Not brown. SO blue.\" Grandpa smiled his long slow smile.", "illustration_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
      {"page_number": 3, "text": "\"Long ago,\" he began, \"before your grandmother''s grandmother was born, the sea had no colour at all. It was clear as glass — you could see all the way to the bottom.\"", "illustration_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"},
      {"page_number": 4, "text": "\"Then one morning, the sky woke up and saw its own face in the water. It was so pleased that it decided to give the sea a gift — its finest, deepest shade of blue.\"", "illustration_url": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800"},
      {"page_number": 5, "text": "\"But that is a story,\" said Kwame, frowning. \"What is the REAL reason?\" Grandpa laughed. \"The real reason is the white sand. It reflects the sunlight and makes the shallow water look bright turquoise.\"", "illustration_url": "https://images.unsplash.com/photo-1590779033100-9f60705a413b?w=800"},
      {"page_number": 6, "text": "\"So both are true?\" asked Amara. \"The science story AND the beautiful story?\" \"That,\" said Grandpa, leaning back, \"is exactly how the Caribbean works.\"", "illustration_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"},
      {"page_number": 7, "text": "The twins lay on the warm dock and looked up at the sky, then down at the sea. Two mirrors reflecting each other forever.", "illustration_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"},
      {"page_number": 8, "text": "\"I want to be a marine scientist,\" said Amara. \"I want to be a storyteller,\" said Kwame. \"Good,\" said Grandpa. \"The islands need both.\"", "illustration_url": "https://images.unsplash.com/photo-1455656678494-4d1b5f3e7ad4?w=800"}
    ],
    "glossary": [
      {"word": "Turquoise", "meaning": "A bright blue-green colour — the colour of the Caribbean Sea in shallow water."},
      {"word": "Marine scientist", "meaning": "A scientist who studies the ocean and everything that lives in it."},
      {"word": "Reflect", "meaning": "When light bounces off a surface, like a mirror or water."}
    ]
  }',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600',
  'big', 'free', 'Bahamas', 7, true, 9
),

-- ── 10. STEELPAN SAM AND THE MUSIC PARADE ────────────────────────────────────
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Steelpan Sam and the Music Parade',
  'Sam has never played a note of music in his life — but when the Panorama steel pan competition comes to his village in Trinidad, a surprising gift is discovered.',
  '{
    "pages": [
      {"page_number": 1, "text": "Sam lived in Laventille, on the hills above Port of Spain. Every evening the steel pan music floated up from the yard below — all except for Sam, who had never played a single note.", "illustration_url": "https://images.unsplash.com/photo-1534467788627-71a750b6c2ef?w=800"},
      {"page_number": 2, "text": "\"Steel pan is not for me,\" he always said. His hands were big and clumsy. His ears were good — he could hear every note — but his hands would not cooperate.", "illustration_url": "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=800"},
      {"page_number": 3, "text": "One week before Panorama, the lead tenor pan player fell sick. The band director, Miss Joseph, looked around the yard in panic. Her eyes landed on Sam.", "illustration_url": "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800"},
      {"page_number": 4, "text": "\"Sam. Come here.\" Sam shook his head. \"Miss, I cannot play.\" She handed him the stick anyway. \"Hit this note. Just this one.\" He did. It rang out clear and true.", "illustration_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800"},
      {"page_number": 5, "text": "\"Again.\" He hit it again. Then she showed him two notes. Then three. His hands, it turned out, had been waiting all along for something to do.", "illustration_url": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800"},
      {"page_number": 6, "text": "For six days he practised morning to night, until the melody lived in his hands like breathing. On competition night, the crowd filled the grandstand.", "illustration_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"},
      {"page_number": 7, "text": "The band played. Sam played. The music rose up from Laventille and spread across Port of Spain like a warm wind. When it ended, the crowd was silent — then erupted.", "illustration_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"},
      {"page_number": 8, "text": "They won second place. Sam cried. \"Second!\" laughed Miss Joseph. \"Sam, last week you played zero notes. Tonight you played three hundred. That is a miracle.\"", "illustration_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
    ],
    "glossary": [
      {"word": "Panorama", "meaning": "The biggest steel pan competition in the world, held in Trinidad every Carnival season."},
      {"word": "Tenor pan", "meaning": "The smallest and highest-pitched steel pan, which plays the melody."},
      {"word": "Laventille", "meaning": "A neighbourhood in Trinidad''s capital, Port of Spain, where the steel pan was invented."}
    ]
  }',
  'https://images.unsplash.com/photo-1534467788627-71a750b6c2ef?w=600',
  'big', 'free', 'Trinidad and Tobago', 7, true, 10
)

ON CONFLICT (id) DO NOTHING;

-- Make sure all seeded stories are active
UPDATE public.storybooks SET is_active = true WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

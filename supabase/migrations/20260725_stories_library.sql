-- Stories Library — island-style children's books for Likkle Legends
-- Run on the live self-hosted Supabase DB.

CREATE TABLE IF NOT EXISTS stories_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    cover_image_url TEXT,
    tradition TEXT NOT NULL DEFAULT 'island_adventure',
    reading_level TEXT NOT NULL DEFAULT 'early',
    age_track TEXT NOT NULL DEFAULT 'big',
    island_code TEXT NOT NULL DEFAULT 'TT',
    is_active BOOLEAN DEFAULT true,
    xp_reward INTEGER DEFAULT 10,
    estimated_reading_time_minutes INTEGER DEFAULT 5,
    character TEXT DEFAULT 'tanty_spice',
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stories_library ENABLE ROW LEVEL LEVEL;
CREATE POLICY "Anyone can read active stories" ON stories_library FOR SELECT USING (is_active = true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_stories_library_tradition ON stories_library(tradition) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stories_library_level ON stories_library(reading_level) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stories_library_island ON stories_library(island_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stories_library_age ON stories_library(age_track) WHERE is_active = true;

-- Seed 12 island-style books
INSERT INTO stories_library (title, slug, summary, tradition, reading_level, age_track, island_code, character, content, xp_reward, estimated_reading_time_minutes) VALUES
(
    'Anansi and the Mango Tree',
    'anansi-and-the-mango-tree',
    'Anansi the spider tries to keep all the mangoes for himself, but learns that sharing makes everyone happy.',
    'anansi', 'early', 'big', 'JM', 'tanty_spice',
    '{"pages":[{"text":"Anansi was sitting under the biggest mango tree in Jamaica.","illustration":"A spider sitting under a tall mango tree full of golden mangoes"},{"text":"He wanted all the mangoes for himself!","illustration":"Anansi hugging the tree trunk protectively"},{"text":"But the mangoes were too high to reach.","illustration":"Anansi stretching his legs up the tree, looking frustrated"},{"text":"Along came Tanty Spice with a big stick.","illustration":"A warm grandmother figure carrying a long bamboo stick"},{"text":"She knocked the mangoes down one by one.","illustration":"Mangoes falling like golden rain"},{"text":"Anansi tried to grab them all but they rolled away!","illustration":"Anansi chasing rolling mangoes in every direction"},{"text":"The children came running and helped pick them up.","illustration":"Happy children gathering mangoes in baskets"},{"text":"Anansi shared the mangoes and everyone had a feast.","illustration":"A big picnic under the mango tree with Anansi and children"},{"text":"From that day, Anansi always shared.","illustration":"Anansi smiling, handing a mango to a small child"},{"text":"The End. Remember: sharing makes the sweetest fruit.","illustration":"Sunset over the mango tree with hearts floating up"}]}'::jsonb,
    10, 5
),
(
    'Papa Bois and the Lost Fawn',
    'papa-bois-and-the-lost-fawn',
    'Papa Bois, guardian of the forest, helps a lost baby deer find its mother in the Trinidad mountains.',
    'papa_bois', 'emergent', 'mini', 'TT', 'tanty_spice',
    '{"pages":[{"text":"Deep in the Trinidad forest lived Papa Bois.","illustration":"A wise old man with deer antlers standing among tall green trees"},{"text":"He cared for all the animals.","illustration":"Papa Bois feeding birds and rabbits"},{"text":"One day a baby fawn was lost.","illustration":"A small spotted fawn looking sad under a big leaf"},{"text":"The fawn cried for its mama.","illustration":"Tears rolling down the fawn face"},{"text":"Papa Bois heard the cry.","illustration":"Papa Bois with his hand to his ear listening"},{"text":"He followed the footprints in the mud.","illustration":"Small hoof prints in brown mud"},{"text":"They walked past the river.","illustration":"Papa Bois and fawn walking beside a sparkling river"},{"text":"They walked past the bamboo grove.","illustration":"Tall bamboo swaying in the wind"},{"text":"Mama deer was waiting by the big silk cotton tree!","illustration":"A mother deer nuzzling her baby"},{"text":"The End. Papa Bois always watches over the forest.","illustration":"Papa Bois waving goodbye under a full moon"}]}'::jsonb,
    10, 4
),
(
    'The River Mumma''s Gift',
    'the-river-mummas-gift',
    'A kind girl from Guyana meets the River Mumma who grants her a special gift of always knowing when the river is safe.',
    'river_mumma', 'transitional', 'big', 'GY', 'tanty_spice',
    '{"pages":[{"text":"There was once a girl named Amani who lived by the Essequibo River in Guyana.","illustration":"A young girl standing by a wide beautiful river"},{"text":"Every day she watched the river shimmer in the sunlight.","illustration":"Golden sunlight sparkling on water"},{"text":"The elders told stories of the River Mumma who lived deep below.","illustration":"An old woman telling stories to children around a fire"},{"text":"They said she had a golden comb in her hair.","illustration":"A mermaid-like figure with a shining golden comb"},{"text":"One evening Amani saw something glowing in the water.","illustration":"A soft golden glow beneath the river surface"},{"text":"It was the River Mumma rising up!","illustration":"The River Mumma emerging from the water gracefully"},{"text":"The River Mumma spoke: You are kind to the river. Take this gift.","illustration":"The River Mumma holding out a small glowing pebble"},{"text":"The pebble would glow when the river was calm and dim when it was dangerous.","illustration":"A glowing pebble in Amani palm"},{"text":"Amani used the gift to keep her village safe for many years.","illustration":"Amani holding the pebble up, village behind her"},{"text":"The End. The river always takes care of those who are kind.","illustration":"Amani sitting peacefully by the river at sunset"}]}'::jsonb,
    15, 6
),
(
    'The Chickcharney''s Lesson',
    'the-chickcharneys-lesson',
    'A boy from Andros Island in the Bahamas learns respect when he meets the mysterious Chickcharney birds.',
    'chickcharney', 'early', 'big', 'BS', 'tanty_spice',
    '{"pages":[{"text":"In the pine forests of Andros Island lived strange birds called Chickcharnies.","illustration":"Owl-like bird creatures sitting in pine trees"},{"text":"They had big eyes and could turn their heads all the way around.","illustration":"A Chickcharney turning its head in a circle"},{"text":"A boy named Devon was exploring the forest.","illustration":"A curious boy walking through tall pine trees"},{"text":"He saw a Chickcharney and laughed at its funny face.","illustration":"Devon pointing and laughing"},{"text":"The Chickcharney was not amused.","illustration":"The Chickcharney looking stern with arms crossed"},{"text":"Suddenly Devon could not find his way home!","illustration":"Devon looking lost among identical pine trees"},{"text":"Every path led him back to the same tree.","illustration":"Devon walking in circles looking confused"},{"text":"The Chickcharney appeared again and tilted its head.","illustration":"The Chickcharney looking at Devon with one big eye"},{"text":"Devon said: I am sorry for laughing. Please help me.","illustration":"Devon bowing his head respectfully"},{"text":"The Chickcharney nodded and showed him the path home.","illustration":"The Chickcharney leading Devon through the trees"},{"text":"The End. Always respect the creatures of the forest.","illustration":"Devon waving goodbye to the Chickcharney from his doorstep"}]}'::jsonb,
    10, 5
),
(
    'Dilly Doubles and the Carnival King',
    'dilly-doubles-and-the-carnival-king',
    'Dilly Doubles helps save Carnival when the Carnival King loses his special steelpan.',
    'island_adventure', 'transitional', 'big', 'TT', 'dilly_doubles',
    '{"pages":[{"text":"It was Carnival Monday in Trinidad and the whole island was buzzing with excitement.","illustration":"Colorful Carnival costumes and flags everywhere"},{"text":"Dilly Doubles was getting ready for the parade with his friends.","illustration":"A cheerful boy in a colorful costume holding a flag"},{"text":"But the Carnival King Papa Steelpan was very upset.","illustration":"A tall man in a golden costume looking worried"},{"text":"My special steelpan is gone! he cried.","illustration":"Papa Steelpan holding empty hands up in despair"},{"text":"Without the steelpan there could be no Carnival!","illustration":"Sad people standing around with no music"},{"text":"Dilly thought and thought. Where could it be?","illustration":"Dilly with his hand on his chin thinking hard"},{"text":"He remembered seeing a monkey run off with something shiny.","illustration":"A monkey carrying a shiny pan into the trees"},{"text":"Dilly followed the monkey tracks into the Paramin hills.","illustration":"Footprints leading up a green hillside"},{"text":"There was the monkey playing the steelpan beautifully!","illustration":"A monkey sitting on a branch playing a steelpan"},{"text":"Dilly traded the monkey a big bag of bananas for the steelpan.","illustration":"Dilly handing over bananas while the monkey hands back the pan"},{"text":"Carnival was saved and everyone danced in the streets!","illustration":"A massive Carnival celebration with dancing and music"},{"text":"The End. Sometimes the best adventures start with a missing thing.","illustration":"Fireworks over a Carnival stage at night"}]}'::jsonb,
    15, 7
),
(
    'Tanty Spice and the Pepper Sauce Secret',
    'tanty-spice-and-the-pepper-sauce-secret',
    'Tanty Spice teaches a little girl how to make the perfect pepper sauce but the secret ingredient is love.',
    'island_adventure', 'early', 'big', 'TT', 'tanty_spice',
    '{"pages":[{"text":"Tanty Spice was famous for her pepper sauce.","illustration":"A grandmother in a colourful kitchen surrounded by bottles"},{"text":"Everyone said it was the best in Trinidad.","illustration":"People lining up outside Tanty house"},{"text":"Little Maya wanted to learn the secret.","illustration":"A small girl looking up at Tanty with big eyes"},{"text":"Tanty said: First you need the reddest scotch bonnet peppers.","illustration":"A basket of bright red peppers"},{"text":"Then you need garlic and shadow benny herbs.","illustration":"Fresh garlic and green herbs on a wooden table"},{"text":"Maya chopped and mixed and stirred.","illustration":"Maya with an apron stirring a big pot"},{"text":"But it did not taste right. Something was missing.","illustration":"Maya tasting from a spoon and frowning"},{"text":"Tanty smiled and said: The secret ingredient is love.","illustration":"Tanty hugging Maya from behind"},{"text":"Maya closed her eyes and thought about how much she loved her family.","illustration":"Maya stirring with her eyes closed and a smile"},{"text":"Then she tasted again. It was perfect!","illustration":"Maya tasting and her eyes going wide with joy"},{"text":"The End. The best recipes are made with love.","illustration":"Maya and Tanty holding up jars of pepper sauce together"}]}'::jsonb,
    10, 5
),
(
    'The Mermaid of Carlisle Bay',
    'the-mermaid-of-carlisle-bay',
    'A Barbadian boy meets a mermaid who teaches him to protect the coral reef.',
    'island_adventure', 'transitional', 'big', 'BB', 'tanty_spice',
    '{"pages":[{"text":"Kwame loved fishing in Carlisle Bay in Barbados.","illustration":"A boy on a small wooden boat in turquoise water"},{"text":"One dawn he saw something shimmering near the reef.","illustration":"A silvery glow under the water near coral"},{"text":"It was a mermaid with scales like blue diamonds!","illustration":"A beautiful mermaid with blue scales sitting on a rock"},{"text":"She looked sad. The coral is dying she said.","illustration":"Bleached white coral around the mermaid"},{"text":"Kwame promised to help. He told all the fishermen.","illustration":"Kwame talking to a group of fishermen on the beach"},{"text":"They stopped dropping anchors on the reef.","illustration":"Fishermen carefully placing anchors on sand not coral"},{"text":"Kwame organized a beach cleanup with his school.","illustration":"Children picking up trash from the beach"},{"text":"Slowly the coral came back to life.","illustration":"Colourful coral growing back with little fish swimming around"},{"text":"The mermaid returned and gave Kwame a pearl.","illustration":"The mermaid handing over a glowing white pearl"},{"text":"Thank you for caring for our ocean she whispered.","illustration":"The mermaid smiling and sliding back into the water"},{"text":"The End. The sea takes care of those who take care of it.","illustration":"Kwame holding the pearl up to the sunrise"}]}'::jsonb,
    15, 6
),
(
    'The Rolling Calf of Green Bay',
    'the-rolling-calf-of-green-bay',
    'A brave Jamaican girl overcomes her fear of the legendary Rolling Calf.',
    'island_adventure', 'early', 'big', 'JM', 'tanty_spice',
    '{"pages":[{"text":"In the hills of St Ann Jamaica lived a girl named Zara.","illustration":"A girl standing on a green hillside"},{"text":"The elders warned about the Rolling Calf that came out at night.","illustration":"An old man telling stories by lamplight"},{"text":"They said it had fiery eyes and dragged heavy chains.","illustration":"A shadowy figure with glowing red eyes in the dark"},{"text":"Zara was afraid to walk home after sunset.","illustration":"Zara walking quickly with her eyes wide"},{"text":"One night she heard the chains clanking behind her.","illustration":"Zara looking over her shoulder frightened"},{"text":"Her heart beat fast. But she remembered what Tanty said.","illustration":"Zara clenching her fists and standing tall"},{"text":"Tanty said: Fear is just a shadow. Turn around and face it.","illustration":"Tanty Spice pointing a finger firmly"},{"text":"Zara turned around and stood very still.","illustration":"Zara facing the dark with her chin up"},{"text":"The Rolling Calf stopped. Its eyes were just fireflies!","illustration":"Glowing fireflies arranged like eyes in the bushes"},{"text":"The chains were just old pots clanking in the wind.","illustration":"Old pots hanging from a tree swinging in the breeze"},{"text":"Zara laughed and walked home brave and proud.","illustration":"Zara walking home with a big smile under the stars"},{"text":"The End. Most fears disappear when you face them.","illustration":"Zara waving at her house with fireflies all around"}]}'::jsonb,
    10, 5
),
(
    'Steelpan Sam and the Rhythm of the Rain',
    'steelpan-sam-and-the-rhythm-of-the-rain',
    'Steelpan Sam discovers that the rain has its own music and creates a new song for the village.',
    'island_adventure', 'emergent', 'mini', 'TT', 'tanty_spice',
    '{"pages":[{"text":"Sam loved playing his steelpan.","illustration":"A boy with a big smile playing a shiny steelpan"},{"text":"He played every day in the yard.","illustration":"Sam playing outside his house with palm trees"},{"text":"One day it started to rain.","illustration":"Grey clouds and raindrops falling"},{"text":"Sam could not play outside anymore.","illustration":"Sam looking sad through a window at the rain"},{"text":"He listened to the rain on the roof. Drip drop!","illustration":"Raindrops hitting a tin roof"},{"text":"It sounded like music!","illustration":"Musical notes floating from the raindrops"},{"text":"Sam got his steelpan and played along.","illustration":"Sam playing his pan matching the rain rhythm"},{"text":"Drip drop ding dong!","illustration":"Rain and steelpan notes dancing together"},{"text":"The whole village came to listen.","illustration":"People gathering outside in the rain smiling"},{"text":"The End. Music is everywhere if you listen.","illustration":"A rainbow over the village with musical notes"}]}'::jsonb,
    10, 4
),
(
    'Mango Moko and the Garden Race',
    'mango-moko-and-the-garden-race',
    'Mango Moko and his friends race to grow the biggest garden but learn that working together is better.',
    'island_adventure', 'early', 'big', 'GD', 'tanty_spice',
    '{"pages":[{"text":"Mango Moko lived in Grenada the Spice Isle.","illustration":"A cheerful boy standing on a hill overlooking green fields"},{"text":"He loved growing things more than anything.","illustration":"Mango tending to plants in a garden"},{"text":"One day he challenged his friends to a garden race.","illustration":"Mango and three friends standing with gardening tools"},{"text":"Whoever grows the most food wins!","illustration":"A starting line with plants and vegetables"},{"text":"Everyone worked hard on their own gardens.","illustration":"Each child working separately in their own plot"},{"text":"But Mango Moko garden was not doing well.","illustration":"Mango looking at droopy plants sadly"},{"text":"His friend Kai had too many tomatoes but no carrots.","illustration":"Kai surrounded by tomatoes looking puzzled"},{"text":"His friend Nia had too many carrots but no tomatoes.","illustration":"Nia surrounded by carrots looking puzzled"},{"text":"Tanty Spice said: Why not share and grow together?","illustration":"Tanty with a knowing smile pointing to both gardens"},{"text":"They combined their gardens into one big one!","illustration":"All the children working together in one big garden"},{"text":"They grew more food than ever before and shared it all.","illustration":"Baskets overflowing with vegetables and happy faces"},{"text":"The End. Together we grow stronger.","illustration":"A beautiful community garden at sunset"}]}'::jsonb,
    10, 5
),
(
    'The Legend of the Silk Cotton Tree',
    'the-legend-of-the-silk-cotton-tree',
    'A St Lucian boy learns about the history and spirits of the ancient silk cotton tree from his grandmother.',
    'island_adventure', 'transitional', 'big', 'LC', 'tanty_spice',
    '{"pages":[{"text":"In a village in Saint Lucia there stood an ancient silk cotton tree.","illustration":"A massive tree with a wide trunk and spreading branches"},{"text":"It was taller than every house and older than memory.","illustration":"The tree towering over small village houses"},{"text":"Jaden grandmother told him the tree was sacred.","illustration":"An old woman pointing up at the tree reverently"},{"text":"She said our ancestors gathered under it long ago.","illustration":"Shadowy figures of ancestors gathered under the tree at dusk"},{"text":"They told stories and made plans beneath its branches.","illustration":"People in olden clothes sitting and talking under the tree"},{"text":"Some said spirits lived in the trunk.","illustration":"Glowing shapes inside the trunk of the tree"},{"text":"Jaden was curious but a little scared.","illustration":"Jaden looking at the tree with wide eyes"},{"text":"One night he heard whispering from the tree.","illustration":"Jaden in bed hearing soft whispers on the wind"},{"text":"He was brave and went closer.","illustration":"Jaden tiptoeing toward the tree in moonlight"},{"text":"The whispers were just the wind in the leaves!","illustration":"Leaves rustling in a gentle breeze with moonlight"},{"text":"But he felt a warm peace like a hug from the past.","illustration":"Jaden leaning against the trunk with closed eyes and a smile"},{"text":"The End. The roots of our history make us strong.","illustration":"The silk cotton tree at dawn with Jaden walking home"}]}'::jsonb,
    15, 6
),
(
    'R.O.T.I. and the Lost Words',
    'roti-and-the-lost-words',
    'R.O.T.I. the teaching robot helps children find words that have gone missing from their island dictionary.',
    'island_adventure', 'early', 'big', 'TT', 'tanty_spice',
    '{"pages":[{"text":"R.O.T.I. was a friendly robot who loved teaching words.","illustration":"A cute round robot with a screen face showing letters"},{"text":"He lived in the Likkle Legends library.","illustration":"A cozy library with books and the robot in the middle"},{"text":"One morning some words from the dictionary went missing!","illustration":"A dictionary with blank spaces where words should be"},{"text":"Liming was gone. Bacchanal was gone. Fetê was gone!","illustration":"Blank pages with question marks"},{"text":"R.O.T.I. rolled out to find them.","illustration":"The robot rolling down a village street on wheels"},{"text":"He found liming at the coconut vendor cart.","illustration":"Friends hanging out at a coconut cart with the word floating above"},{"text":"He found bacchanal at the Carnival mas camp.","illustration":"A busy costume workshop with the word floating above"},{"text":"He found fetê at the pan yard rehearsal!","illustration":"A steelpan practice session with the word floating above"},{"text":"The words had gone to the places where they belong!","illustration":"All three words glowing above their respective places"},{"text":"R.O.T.I. put them back in the dictionary.","illustration":"The robot carefully placing words back into the book"},{"text":"The End. Words are alive — they live where we use them.","illustration":"A happy dictionary with all words glowing"}]}'::jsonb,
    10, 5
);

-- Also ensure the stories table (for AI-generated per-user stories) works
-- It already exists but is empty — that's fine, AI agent will populate it.

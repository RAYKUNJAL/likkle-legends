/**
 * Likkle Legends — Content Seed Script
 * Populates the database with starter stories, printables, and songs
 * so the kids portal has content from day one.
 *
 * Run: npx tsx scripts/seed-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── STORIES ────────────────────────────────────────────────────────────────

const STORIES = [
    {
        title: "Anansi and the Pot of Wisdom",
        summary: "Anansi the Spider tricks the sky god to steal all the wisdom in the world — but learns that wisdom must be shared.",
        cover_image_url: "/images/logo.png",
        age_track: "mini",
        tier_required: "free",
        island_theme: "Ghana/Jamaica",
        reading_time_minutes: 5,
        word_count: 320,
        difficulty_level: 1,
        is_active: true,
        display_order: 1,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "Long, long ago in the land where the silk-cotton trees grew tall, there lived a very clever spider named Anansi. Anansi loved stories more than anything in the whole world.",
                    imagePrompt: "Colourful Caribbean forest with a smiling spider sitting on a giant web between tropical trees"
                },
                {
                    pageNumber: 2,
                    text: "One day, Anansi heard that the Sky God, Nyame, kept ALL the stories locked in a golden pot. 'If I had those stories,' thought Anansi, 'I could share them with everyone!' So he climbed high, high, high into the clouds.",
                    imagePrompt: "Tiny spider climbing a rainbow staircase into fluffy clouds, with a golden pot visible at the top"
                },
                {
                    pageNumber: 3,
                    text: "Nyame laughed when he saw the small spider. 'You want my stories? Then bring me three impossible things: the hornets that never stop buzzing, the python that swallows the river, and the leopard whose spots never stay still.'",
                    imagePrompt: "Majestic sky god on a cloud throne with lightning around him, looking down at a tiny spider"
                },
                {
                    pageNumber: 4,
                    text: "Anansi was small, but he was SMART. He tricked the hornets into a hollow gourd by pretending it would rain. He tricked the python by getting him to stretch along a bamboo branch. He trapped the leopard in a pit covered with leaves!",
                    imagePrompt: "Anansi the spider cleverly using a coconut shell to catch hornets, with tropical plants around"
                },
                {
                    pageNumber: 5,
                    text: "Nyame was amazed! He gave Anansi the golden pot. But Anansi didn't keep the stories — he opened the pot and let them fly free, carried by the wind to every person on earth. And THAT is why stories belong to everyone!",
                    imagePrompt: "Golden stories swirling out of a pot like butterflies, spreading to children around the world",
                    patoisWords: [{ word: "Duppy", meaning: "A ghost or spirit in Caribbean folklore" }]
                }
            ],
            moral: "True wisdom is meant to be shared, not hoarded.",
            parentNote: {
                whyItHelps: "This story builds listening comprehension, sequencing, and introduces African-Caribbean folklore traditions.",
                offlineFollowup: "Ask your child: What three impossible things did Anansi have to find? Can they retell the story in their own words?",
                whatToSayAfter: "Anansi chose to share the stories with everyone. Can you think of something you could share with a friend today?"
            },
            metadata: {
                ageTrack: "mini",
                islandTheme: "Jamaica",
                readingTimeMinutes: 5,
                difficultyLevel: 1,
                tierRequired: "free",
                characterId: "tanty_spice",
                culturalElements: ["Anansi", "oral tradition", "African heritage", "Caribbean folklore"]
            }
        }
    },
    {
        title: "Mango Madness: The Alphabet Adventure",
        summary: "Join Dilly Doubles as he discovers a different Caribbean fruit or animal for every letter of the alphabet!",
        cover_image_url: "/images/logo.png",
        age_track: "mini",
        tier_required: "free",
        island_theme: "Caribbean",
        reading_time_minutes: 4,
        word_count: 260,
        difficulty_level: 1,
        is_active: true,
        display_order: 2,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "A is for Ackee — Jamaica's favourite fruit! Bright red outside, yellow and creamy inside. It tastes like scrambled eggs when you cook it!",
                    imagePrompt: "Bright red ackee fruit on a tree with the letter A in Caribbean colours"
                },
                {
                    pageNumber: 2,
                    text: "B is for Breadfruit — round and bumpy like a green football. Captain Bligh brought breadfruit from the Pacific to feed the islands. Now we fry it, boil it, and roast it!",
                    imagePrompt: "Large green breadfruit on a tree with the letter B surrounded by island leaves"
                },
                {
                    pageNumber: 3,
                    text: "C is for Coconut — the most magical fruit in the Caribbean! We drink the cool water inside, eat the white flesh, and use the shell to make music!",
                    imagePrompt: "Coconut cut open with water pouring out, letter C decorated with palm leaves"
                },
                {
                    pageNumber: 4,
                    text: "D is for Dolphin — the friendly sea dancer! Dolphins swim alongside boats and leap out of the turquoise Caribbean Sea. They love to play!",
                    imagePrompt: "Happy dolphin leaping from sparkling Caribbean water, letter D in ocean blue"
                },
                {
                    pageNumber: 5,
                    text: "M is for Mango — the king of Caribbean fruits! Juicy, sweet, and dripping with flavour. Julie mango, Hairy mango, East Indian mango — there are SO many kinds!",
                    imagePrompt: "Colourful mangoes of different varieties with the letter M, sunshine yellow background"
                }
            ],
            moral: "Learning your ABCs is even sweeter when they taste like the Caribbean!",
            parentNote: {
                whyItHelps: "Phonics and letter recognition through Caribbean cultural context. Builds vocabulary and cultural pride simultaneously.",
                offlineFollowup: "Go through the alphabet together. For each letter, can your child name a Caribbean food, animal, or place that starts with it?",
                whatToSayAfter: "Which Caribbean fruit or animal was your favourite? Why?"
            },
            metadata: {
                ageTrack: "mini",
                islandTheme: "Caribbean",
                readingTimeMinutes: 4,
                difficultyLevel: 1,
                tierRequired: "free",
                characterId: "roti",
                culturalElements: ["Caribbean foods", "alphabet", "island animals", "phonics"]
            }
        }
    },
    {
        title: "The Island Explorer's Map",
        summary: "Kai discovers a mysterious map and sets sail to visit five Caribbean islands, learning something special about each one.",
        cover_image_url: "/images/logo.png",
        age_track: "big",
        tier_required: "free",
        island_theme: "Caribbean",
        reading_time_minutes: 8,
        word_count: 520,
        difficulty_level: 2,
        is_active: true,
        display_order: 3,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "Kai found the old map rolled up behind the library bookshelf on a rainy Tuesday. It showed five islands with dotted lines connecting them, and in the corner, written in old ink: 'For the brave explorer who seeks the secrets of the sea.'",
                    imagePrompt: "Child finding an old treasure map in a Caribbean library, hurricane lantern lighting the scene"
                },
                {
                    pageNumber: 2,
                    text: "The first island on the map was Jamaica — the Island of Rhythm. The moment Kai stepped off the boat, she heard drumming. Boom-chicka-boom-chicka! A woman in colourful dress was playing the steeldrum at the market. 'Welcome, pickney!' she called. 'Every heartbeat here sounds like music.'",
                    imagePrompt: "Vibrant Jamaican market with steeldrum player, colourful fruits and flags in background"
                },
                {
                    pageNumber: 3,
                    text: "Next stop: Trinidad and Tobago — the Land of Carnival! Kai arrived just in time for a mas camp rehearsal. Feathered costumes towered six feet tall. Soca music made her feet move without being asked. 'The whole world comes to see we Carnival,' said a boy named Marcus, spinning in his blue-and-gold costume.",
                    imagePrompt: "Spectacular Carnival parade with colourful feathered costumes and excited children dancing"
                },
                {
                    pageNumber: 4,
                    text: "On Barbados, Kai learned that Bajans love cricket more than anything. The ball whizzed through the air with a CRACK at Kensington Oval. 'Sir Garfield Sobers was born right here,' a granddad told her proudly. 'The greatest cricketer who ever lived.' Kai held the bat. It was heavier than she expected.",
                    imagePrompt: "Cricket match at a sunny Caribbean stadium with kids cheering, Barbados flag in background"
                },
                {
                    pageNumber: 5,
                    text: "Back home, Kai pinned the map to her wall. She wrote a word next to each island: Jamaica = Rhythm. Trinidad = Joy. Barbados = Pride. Then she added a fifth island — her own. She wrote: HOME = Everything I've learned, everything I love.",
                    imagePrompt: "Child pinning a map to her bedroom wall with Caribbean flags and island notes around it"
                }
            ],
            moral: "Every island in the Caribbean has its own magic — and when you learn about them all, you become a Legend yourself.",
            parentNote: {
                whyItHelps: "Builds reading comprehension, geography awareness, and cultural pride. Introduces key Caribbean cultural landmarks.",
                offlineFollowup: "Find the Caribbean on a real map or globe. Can your child point to Jamaica, Trinidad, and Barbados? What can they remember about each island?",
                whatToSayAfter: "If YOU were making a map, what word would you write next to your heritage island?"
            },
            metadata: {
                ageTrack: "big",
                islandTheme: "Caribbean",
                readingTimeMinutes: 8,
                difficultyLevel: 2,
                tierRequired: "free",
                characterId: "roti",
                culturalElements: ["Caribbean geography", "cultural exploration", "island identity", "Carnival", "cricket"]
            }
        }
    },
    {
        title: "Nanny's Warriors: The True Story of the Maroons",
        summary: "Discover the incredible true story of Nanny of the Maroons, Jamaica's fearless freedom fighter, and her mountain village.",
        cover_image_url: "/images/logo.png",
        age_track: "big",
        tier_required: "free",
        island_theme: "Jamaica",
        reading_time_minutes: 9,
        word_count: 580,
        difficulty_level: 3,
        is_active: true,
        display_order: 4,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "High in the Blue Mountains of Jamaica, where the mist rolls thick and the trees grow tall as giants, there lived a woman the British soldiers feared more than anyone in the Caribbean. Her name was Nanny.",
                    imagePrompt: "Misty Blue Mountains of Jamaica with ancient trees and a silhouette of a powerful woman warrior"
                },
                {
                    pageNumber: 2,
                    text: "Nanny was a leader of the Maroons — formerly enslaved African people who had escaped to the mountains and built their own free communities. They were warriors, farmers, healers, and families — people who refused to be owned.",
                    imagePrompt: "Mountain village with wooden homes, warriors with shields, and families celebrating freedom"
                },
                {
                    pageNumber: 3,
                    text: "For over three decades, Nanny led her people in the First Maroon War. The British army, with all their guns and cannons, could not defeat the Maroons in the mountains. The Maroons knew every hidden path, every waterfall, every secret.",
                    imagePrompt: "Maroon warriors using the mountainous jungle terrain cleverly against British soldiers below"
                },
                {
                    pageNumber: 4,
                    text: "Legend says Nanny had powerful spiritual gifts. Some say she could catch bullets in her hands. Whether or not that's true, what IS true is that she freed over 800 enslaved people and never once surrendered. In 1740, Britain was forced to sign a peace treaty giving the Maroons their freedom.",
                    imagePrompt: "Powerful woman warrior on a mountain peak with the Jamaican landscape spread below her"
                },
                {
                    pageNumber: 5,
                    text: "Today, Nanny of the Maroons is Jamaica's only female National Hero. Her face is on the Jamaican $500 bill. Accompong Town — the Maroon community she helped build — still exists today, with its own government and traditions. Nanny's spirit lives on.",
                    imagePrompt: "Jamaican $500 bill with Nanny's portrait, surrounded by Jamaican flag and Blue Mountain scenery"
                }
            ],
            moral: "Freedom is worth fighting for — and one brave woman can change the course of history.",
            parentNote: {
                whyItHelps: "Introduces real Caribbean history, female leadership, and the concept of resistance and freedom. Builds historical thinking and cultural pride.",
                offlineFollowup: "Who are the National Heroes of your heritage island? Research one together and make a fact card about them.",
                whatToSayAfter: "Nanny never gave up. What is something you care about so much that you'd never give up on it?"
            },
            metadata: {
                ageTrack: "big",
                islandTheme: "Jamaica",
                readingTimeMinutes: 9,
                difficultyLevel: 3,
                tierRequired: "free",
                characterId: "tanty_spice",
                culturalElements: ["Caribbean history", "Maroons", "Nanny of the Maroons", "Jamaica", "freedom fighters", "African heritage"]
            }
        }
    },
    {
        title: "The Steelpan's Song",
        summary: "How a young boy from Trinidad turned old oil drums into the only acoustic instrument invented in the 20th century.",
        cover_image_url: "/images/logo.png",
        age_track: "big",
        tier_required: "free",
        island_theme: "Trinidad",
        reading_time_minutes: 7,
        word_count: 450,
        difficulty_level: 2,
        is_active: true,
        display_order: 5,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "In the yards of Port of Spain, Trinidad, Elijah had nothing but an old oil drum and a dream. While other children played cricket, Elijah banged on the drum with a stick. BONG! BONG! Different spots made different sounds. This was interesting...",
                    imagePrompt: "Young Trinidadian boy experimenting with an old oil drum in a colourful Port of Spain yard"
                },
                {
                    pageNumber: 2,
                    text: "This wasn't just Elijah's dream — it was the dream of his whole community. In the 1940s, Trinidadian musicians discovered that when you pound different sections of a steel drum and then tune them carefully, each section can play a perfect musical note.",
                    imagePrompt: "Community of musicians carefully denting and tuning steel drums in a workshop"
                },
                {
                    pageNumber: 3,
                    text: "At first, the wealthy people of Trinidad didn't respect the steelpan. They called it 'poor people's music.' But when steelpan bands started playing classical music — Beethoven! Bach! — even the most stubborn critics had to stop and listen.",
                    imagePrompt: "Grand concert hall with steelpan orchestra performing, astonished audience in evening wear"
                },
                {
                    pageNumber: 4,
                    text: "Today, the steelpan is the national instrument of Trinidad and Tobago — the ONLY acoustic instrument invented in the 20th century. The steelpan was born from creativity and necessity. It proves that with imagination, even an old oil drum can become music.",
                    imagePrompt: "Beautiful display of polished steelpans with Trinidad flag colours, sunlight gleaming on the metal"
                }
            ],
            moral: "Innovation comes from unlikely places. Never underestimate what you can create.",
            parentNote: {
                whyItHelps: "Teaches Caribbean cultural innovation, music history, and persistence in the face of criticism.",
                offlineFollowup: "Listen to steelpan music together on YouTube. Can your child identify different notes? Try tapping different spots on a metal bowl to hear how pitch changes.",
                whatToSayAfter: "What would YOU invent if you only had things you found in your backyard?"
            },
            metadata: {
                ageTrack: "big",
                islandTheme: "Trinidad",
                readingTimeMinutes: 7,
                difficultyLevel: 2,
                tierRequired: "free",
                characterId: "dilly_doubles",
                culturalElements: ["steelpan", "Trinidad", "Caribbean music", "innovation", "cultural history"]
            }
        }
    },
    {
        title: "Benny and the Secret of the Silk-Cotton Tree",
        summary: "A quiet child who loves nature discovers that the ancient silk-cotton tree in her yard has been watching over her family for generations.",
        cover_image_url: "/images/logo.png",
        age_track: "mini",
        tier_required: "free",
        island_theme: "Barbados",
        reading_time_minutes: 5,
        word_count: 300,
        difficulty_level: 1,
        is_active: true,
        display_order: 6,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "In Layla's garden stood the biggest tree she had ever seen. Its roots spread out like giant sleeping fingers. Its branches stretched wide enough to shade three houses. Grandma called it the silk-cotton tree. 'Treat it with respect,' she always said.",
                    imagePrompt: "Enormous silk-cotton tree with massive spreading roots in a lush Caribbean garden, child looking up"
                },
                {
                    pageNumber: 2,
                    text: "One evening, Layla sat beneath the tree and watched a green lizard do push-ups on a root. A hummingbird the size of her thumb hovered near a red flower. 'This tree is like a whole neighbourhood,' she thought.",
                    imagePrompt: "Child sitting under a large tree, green lizard nearby, hummingbird hovering, evening Caribbean light"
                },
                {
                    pageNumber: 3,
                    text: "Grandma came and sat beside her. 'This tree was planted by my grandmother's grandmother,' she said. 'Four generations of our family have grown up under its shade. When we were sad, we talked to it. When we were happy, we climbed it.' Layla looked at the tree differently now.",
                    imagePrompt: "Grandmother and grandchild sitting together under a great tree at sunset, warm golden light"
                },
                {
                    pageNumber: 4,
                    text: "That night, the wind blew through the silk-cotton's leaves: swsshhhhh-swsshhhhh. Layla was sure it was whispering. She pressed her ear to the bark. She didn't hear words — but she felt something. Ancient. Safe. Belonging. She was part of something much bigger than herself.",
                    imagePrompt: "Child hugging an ancient tree at night with stars above, the tree glowing softly"
                }
            ],
            moral: "We are connected to our ancestors and to nature in ways deeper than words.",
            parentNote: {
                whyItHelps: "Builds emotional intelligence, connection to nature, and intergenerational thinking. Supports social-emotional learning.",
                offlineFollowup: "Is there a tree, plant, or place in your family that has a special story? Share it with your child.",
                whatToSayAfter: "What would you name the tree if it were yours? What stories do you think it would tell?"
            },
            metadata: {
                ageTrack: "mini",
                islandTheme: "Barbados",
                readingTimeMinutes: 5,
                difficultyLevel: 1,
                tierRequired: "free",
                characterId: "benny_of_shadows",
                culturalElements: ["nature", "ancestral connection", "Caribbean trees", "intergenerational stories", "family heritage"]
            }
        }
    },
    {
        title: "River Mumma's Gift",
        summary: "When a boy disobeys his grandmother and visits the forbidden river, he meets the beautiful River Mumma — and learns why some rules exist to protect us.",
        cover_image_url: "/images/logo.png",
        age_track: "mini",
        tier_required: "free",
        island_theme: "Jamaica",
        reading_time_minutes: 6,
        word_count: 380,
        difficulty_level: 2,
        is_active: true,
        display_order: 7,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "Grandma said never to go to the river alone. But on the hottest afternoon Malik had ever felt, the river called to him like a song. He told himself he would just look. Just one peek.",
                    imagePrompt: "Boy sneaking towards a glittering river through tall tropical grass on a hot sunny day"
                },
                {
                    pageNumber: 2,
                    text: "The river was silver and cool and SO tempting. Malik waded in up to his knees. Then he saw her — a woman sitting on a rock in the middle of the river, combing gold coins from her long hair. She was the most beautiful thing Malik had ever seen. He could not look away.",
                    imagePrompt: "Magical woman with long flowing hair sitting on a river rock, golden coins falling around her"
                },
                {
                    pageNumber: 3,
                    text: "'River Mumma,' Malik breathed. In Jamaican folklore, River Mumma is the spirit guardian of rivers. She looked at him with ancient eyes. 'Child, why do you come to my river alone?' 'I was hot,' Malik admitted. She was quiet for a long time.",
                    imagePrompt: "River spirit looking seriously at a small boy, river flowing peacefully around them"
                },
                {
                    pageNumber: 4,
                    text: "'Your grandmother's rule is not to punish you,' River Mumma said. 'It is because she loves you. Rivers are beautiful — AND they are strong. Even I have seen the river take what it should not have taken, when people forgot to respect it.' She placed a smooth stone in his hand. 'Give this to your grandmother. And tell her you are sorry.'",
                    imagePrompt: "River spirit gently placing a glowing smooth stone in child's hand, warm light surrounding them"
                },
                {
                    pageNumber: 5,
                    text: "Malik ran home. He gave Grandma the stone. He told her the truth. She held him tight for a long time without saying a word. When she finally let go, she said: 'Next time, we go together.' And the next day, they did — and the river was even more beautiful with Grandma beside him.",
                    imagePrompt: "Grandmother and grandson at the river together, happy and safe, splashing in the shallows"
                }
            ],
            moral: "Rules made with love are there to keep us safe. When we disobey, we should be brave enough to tell the truth.",
            parentNote: {
                whyItHelps: "Introduces Caribbean water safety in a culturally resonant way. Builds honesty, responsibility, and respecting family rules.",
                offlineFollowup: "Talk about water safety rules together. Why are rules about swimming or going near water important?",
                whatToSayAfter: "Have you ever broken a rule and then felt sorry? What did you do about it?"
            },
            metadata: {
                ageTrack: "mini",
                islandTheme: "Jamaica",
                readingTimeMinutes: 6,
                difficultyLevel: 2,
                tierRequired: "free",
                characterId: "tanty_spice",
                culturalElements: ["River Mumma", "Jamaican folklore", "water safety", "honesty", "Caribbean mythology"]
            }
        }
    },
    {
        title: "The Haitian Revolution: How a Nation Won Its Freedom",
        summary: "The true, incredible story of how enslaved people in Haiti did what no one in history had ever done — and changed the world forever.",
        cover_image_url: "/images/logo.png",
        age_track: "big",
        tier_required: "free",
        island_theme: "Haiti",
        reading_time_minutes: 10,
        word_count: 640,
        difficulty_level: 3,
        is_active: true,
        display_order: 8,
        content_json: {
            pages: [
                {
                    pageNumber: 1,
                    text: "In 1791, on the island of Saint-Domingue — which we now call Haiti — something happened that had never happened before in the history of the world. Enslaved people rose up against one of the most powerful empires on earth. And they won.",
                    imagePrompt: "Dramatic painting-style image of Haitian landscape with torch lights and determined people gathering"
                },
                {
                    pageNumber: 2,
                    text: "The man who became the greatest general of the revolution was named Toussaint Louverture. He had taught himself to read. He had studied military strategy from books. When the moment came, he was ready. Under his leadership, Haitian armies defeated Spain, Britain, AND France.",
                    imagePrompt: "Portrait of Toussaint Louverture in military uniform with the Haitian countryside behind him"
                },
                {
                    pageNumber: 3,
                    text: "France sent its best general with 40,000 soldiers to retake Haiti. The Haitian army was smaller. They had fewer weapons. But they had something France did not — they were fighting for their own freedom, on land they knew like the backs of their hands.",
                    imagePrompt: "Haitian warriors in the mountains, outnumbered but determined, flag flying above them"
                },
                {
                    pageNumber: 4,
                    text: "On January 1, 1804, Haiti declared independence. It was the first country in the Americas to permanently abolish slavery. The first Black republic in the world. Every enslaved person in the Americas looked at Haiti and felt hope.",
                    imagePrompt: "Celebration of Haitian independence with the blue and red flag, people dancing and crying with joy"
                },
                {
                    pageNumber: 5,
                    text: "The Haitian Revolution terrified enslaving nations around the world. It proved that freedom was not something that could be given — it was something that could be TAKEN. Haiti's story belongs to all of us who believe that every person deserves to be free.",
                    imagePrompt: "Haitian flag waving over Port-au-Prince with children looking up at it in pride and wonder"
                }
            ],
            moral: "Freedom is the most powerful force in the world — and it belongs to everyone.",
            parentNote: {
                whyItHelps: "Introduces the Haitian Revolution — a pivotal moment in world history that is often absent from school curricula. Builds critical thinking about freedom, justice, and Caribbean history.",
                offlineFollowup: "Find Haiti on a map. Read one more fact about Haiti together. What is Haiti known for today?",
                whatToSayAfter: "The Haitian Revolution changed history forever. What is one thing in the world YOU would change if you could?"
            },
            metadata: {
                ageTrack: "big",
                islandTheme: "Haiti",
                readingTimeMinutes: 10,
                difficultyLevel: 3,
                tierRequired: "free",
                characterId: "roti",
                culturalElements: ["Haiti", "Haitian Revolution", "Toussaint Louverture", "Caribbean history", "freedom", "independence"]
            }
        }
    }
];

// ─── PRINTABLES ──────────────────────────────────────────────────────────────

const PRINTABLES = [
    { title: "Caribbean Alphabet A-M", description: "Colour each letter with a Caribbean fruit or animal — A for Ackee, B for Breadfruit, and more!", category: "coloring", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 1 },
    { title: "Caribbean Alphabet N-Z", description: "Complete your alphabet journey — N for Nutmeg, P for Pawpaw, S for Soursop!", category: "coloring", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 2 },
    { title: "Count the Coconuts (1-10)", description: "Count and circle the coconuts on each palm tree. Practise writing the numbers 1-10.", category: "worksheet", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 3 },
    { title: "Island Animals Matching Game", description: "Match each Caribbean animal to its island home — hummingbird, sea turtle, iguana and more!", category: "worksheet", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 4 },
    { title: "My Heritage Island Map", description: "Colour in the Caribbean islands and mark your family's heritage island. Add the name and one thing you love about it.", category: "activity_pack", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 5 },
    { title: "Patois Word Matching", description: "Match the Patois/Creole words to their English meanings. Learn 10 essential Caribbean phrases!", category: "worksheet", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 6 },
    { title: "Caribbean Fruits Colouring Page", description: "Colour in mangoes, guavas, soursops, and sugar apples in bright Caribbean colours!", category: "coloring", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 7 },
    { title: "Anansi Story Sequencing", description: "Cut out the story scenes and put them in the right order. Then retell the Anansi story in your own words!", category: "activity_pack", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 8 },
    { title: "Caribbean Number Bonds (to 10)", description: "Use mangoes and coconuts to practise number bonds to 10. A fun Caribbean twist on maths!",  category: "worksheet", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 9 },
    { title: "My Family Heritage Tree", description: "Fill in your family tree and add the islands or countries your family comes from. Celebrate your roots!", category: "activity_pack", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 10 },
    { title: "Carnival Costume Design Sheet", description: "Design your very own Carnival costume! Draw the colours, feathers, and decorations. What would your mas costume look like?", category: "coloring", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 11 },
    { title: "Caribbean Weather Journal", description: "Track the weather for one week like a real island scientist! Draw clouds, sunshine, and rain on each day.", category: "activity_pack", tier_required: "free", is_active: true, preview_url: "/images/logo.png", pdf_url: "/printables/placeholder.pdf", display_order: 12 },
];

// ─── SONGS ───────────────────────────────────────────────────────────────────

const SONGS = [
    { title: "Soca Alphabet Song", artist: "Likkle Legends", description: "Learn your ABCs to a bouncy soca beat — the Caribbean way!", lyrics: "A B C D E F G... (soca style)", thumbnail_url: "/images/logo.png", audio_url: null, duration_seconds: 120, category: "educational", island_origin: "Trinidad", age_track: "mini", tier_required: "free", is_active: true, display_order: 1 },
    { title: "Count With Me (Caribbean Style)", artist: "Likkle Legends", description: "Count 1-10 using Caribbean fruits and animals. Mathematics never sounded so sweet!", lyrics: "One mango, two coconuts, three hummingbirds in a tree...", thumbnail_url: "/images/logo.png", audio_url: null, duration_seconds: 105, category: "educational", island_origin: "Caribbean", age_track: "mini", tier_required: "free", is_active: true, display_order: 2 },
    { title: "Islands of the Caribbean", artist: "Likkle Legends", description: "A beautiful geography song naming all the Caribbean islands. Sing along and learn the map!", lyrics: "Jamaica, Trinidad, Barbados too, Antigua, St Lucia under skies so blue...", thumbnail_url: "/images/logo.png", audio_url: null, duration_seconds: 150, category: "educational", island_origin: "Caribbean", age_track: "big", tier_required: "free", is_active: true, display_order: 3 },
    { title: "Bless Up Morning Song", artist: "Likkle Legends", description: "Start your learning day right with this energetic morning reggae-inspired wake-up song!", lyrics: "Rise up, rise up, blessed morning is here, put on your smile and have no fear...", thumbnail_url: "/images/logo.png", audio_url: null, duration_seconds: 130, category: "nursery", island_origin: "Jamaica", age_track: "mini", tier_required: "free", is_active: true, display_order: 4 },
    { title: "The Steelpan Dance", artist: "Likkle Legends", description: "Shake your body to the rhythm of the steelpan! A joyful calypso-inspired movement song.", lyrics: "Ding ding dong, the steelpan song, dance along all evening long...", thumbnail_url: "/images/logo.png", audio_url: null, duration_seconds: 140, category: "cultural", island_origin: "Trinidad", age_track: "all", tier_required: "free", is_active: true, display_order: 5 },
    { title: "Goodnight Caribbean Moon", artist: "Likkle Legends", description: "A gentle Caribbean lullaby to wind down the day, guided by Tanty Spice.", lyrics: "Caribbean moon, shine so bright, watch over our legends through the night...", thumbnail_url: "/images/logo.png", audio_url: null, duration_seconds: 180, category: "nursery", island_origin: "Caribbean", age_track: "mini", tier_required: "free", is_active: true, display_order: 6 },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function seedContent() {
    console.log('🌴 Likkle Legends — Content Seeder\n');

    // Seed Stories
    console.log(`📚 Seeding ${STORIES.length} stories...`);
    const { error: storyError } = await supabase
        .from('storybooks')
        .upsert(STORIES, { onConflict: 'title', ignoreDuplicates: true });

    if (storyError) {
        console.error('❌ Story seed error:', storyError.message);
    } else {
        console.log(`✅ ${STORIES.length} stories seeded`);
    }

    // Seed Printables
    console.log(`\n🖨️ Seeding ${PRINTABLES.length} printables...`);
    const { error: printableError } = await supabase
        .from('printables')
        .upsert(PRINTABLES, { onConflict: 'title', ignoreDuplicates: true });

    if (printableError) {
        console.error('❌ Printable seed error:', printableError.message);
    } else {
        console.log(`✅ ${PRINTABLES.length} printables seeded`);
    }

    // Seed Songs
    console.log(`\n🎵 Seeding ${SONGS.length} songs...`);
    const { error: songError } = await supabase
        .from('songs')
        .upsert(SONGS, { onConflict: 'title', ignoreDuplicates: true });

    if (songError) {
        console.error('❌ Song seed error:', songError.message);
    } else {
        console.log(`✅ ${SONGS.length} songs seeded`);
    }

    console.log('\n🏝️ Content seeding complete!');
}

seedContent().catch(console.error);

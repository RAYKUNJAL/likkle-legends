export const siteContent = {
    meta: {
        title: "Likkle Legends | Learning That Feels Like Home",
        description: "Help your child grow academically while staying connected to Caribbean culture—wherever you live. Stories, songs, activities, and monthly character drops for kids 4-8.",
        canonical_url: "https://likklelegends.com",
        og_image: "/images/logo.png"
    },
    notification_bar: {
        enabled: true,
        text: "Limited Time: Get 15% OFF your first month with code LEGEND15",
        subtext: "Ends soon. New members only.",
        countdown: {
            enabled: true,
            duration_hours: 24
        }
    },
    navigation: {
        logo: {
            text: "Likkle Legends",
            href: "/"
        },
        links: [
            { label: "How It Works", href: "/#how-it-works" },
            { label: "What You Get", href: "/#offer" },
            { label: "Characters", href: "/characters" },
            { label: "Blog", href: "/blog" },
            { label: "Pricing", href: "/pricing" },
            { label: "Testimonials", href: "/#testimonials" }
        ],
        auth: {
            login_label: "Login",
            login_href: "/login",
            primary_cta: {
                label: "Try $10 Intro",
                href: "/get-started"
            }
        }
    },
    hero: {
        age_paths: [
            { label: "Mini Legends (4–5)", id: "mini" },
            { label: "Big Legends (6–8)", id: "big" }
        ],
        headline: "Raise Proud, Confident Caribbean Kids.",
        subheadline: "The monthly mail club that delivers personalized letters, cultural activities, and AI-powered stories to help your child love their roots.",
        primary_cta: {
            label: "Start Your Child's Adventure",
            href: "/get-started"
        },
        secondary_cta: {
            label: "Preview a free sample letter",
            href: "#sample-letter"
        },
        trust_row: {
            badges: [
                "500+ happy families",
                "Cancel anytime",
                "Ships worldwide"
            ],
            ticker_text: "Trusted by 500+ families in New York, London, Toronto, and across the Caribbean."
        },
        hero_media: {
            type: "image",
            src: "/images/hero_landing.png",
            alt: "Child reading a Likkle Legends letter"
        },
        new_mission_chip: {
            enabled: true,
            label: "NEW MISSION",
            title: "Island Beat Challenge"
        }
    },
    how_it_works: {
        id: "how-it-works",
        title: "How Likkle Legends works",
        steps: [
            {
                step: 1,
                title: "Choose your child’s age path",
                description: "Pick Mini Legends (4–5) or Big Legends (6–8) so stories and missions match your child’s stage.",
                icon: "age-path"
            },
            {
                step: 2,
                title: "Your child gets their monthly mail",
                description: "A personalized letter, cultural flashcard, and coloring sheet arrive in your mailbox each month with a new Caribbean adventure.",
                icon: "mailbox"
            },
            {
                step: 3,
                title: "Unlock the digital universe",
                description: "Sing along to island nursery songs, explore interactive storybooks, and use the AI Reading Buddy in a kid-safe digital portal.",
                icon: "digital-portal"
            }
        ],
        bottom_note: "Most families start with Mail Club at $10/month, then upgrade once their child is hooked."
    },
    what_you_get: {
        id: "what-you-get",
        title: "What your child gets every month",
        items: [
            {
                label: "PERSONALIZED LETTER",
                title: "Stories that speak to your child",
                description: "A story-driven letter from a Likkle Legend character, tailored to your child’s age track, turning mail time into a moment of connection.",
                media: "/images/letter-preview.png"
            },
            {
                label: "CARD & COLORING",
                title: "Culture they can hold and color",
                description: "Collectible cultural flashcards and creative coloring pages that teach island history, foods, and traditions while they play.",
                media: "/images/flashcard-coloring.png"
            },
            {
                label: "DIGITAL UNIVERSE",
                title: "A kid-safe learning portal",
                description: "Unlock lessons, interactive stories, and Legends Missions in a private age-based portal so screen time actually supports learning.",
                media: "/images/digital-portal.png"
            },
            {
                label: "TANTY'S PORCH",
                title: "Safe AI Chat & Emotional Support",
                description: "Tanty Spice is always online to help children express big feelings, share folklore stories, and learn island wisdom in a safe, moderated environment.",
                media: "/images/tanty_spice_avatar.jpg"
            },
            {
                label: "AI READING BUDDY",
                title: "Reading help when you’re busy",
                description: "A gentle, smart reading buddy that listens as your child reads and offers simple feedback to build confidence and fluency.",
                media: "/images/ai-reading-buddy.png"
            }
        ]
    },
    identity_section: {
        title: "Identity, culture & feelings wrapped in fun.",
        problem_text: "Too many Caribbean children grow up disconnected from their roots or unsure how to express big feelings.",
        solution_text: "Likkle Legends brings emotional literacy and Caribbean pride straight into their hands each month.",
        pillars: [
            {
                icon: "relationship",
                title: "Relationship focused",
                description: "Conversation starters and reflection prompts help parents and children bond over cultural stories and everyday feelings."
            },
            {
                icon: "confidence",
                title: "Confidence building",
                description: "Kids see themselves as the legends of their own stories through personalized missions and character-led encouragement."
            }
        ],
        supporting_media: "/images/parent-child-smiling.png"
    },
    who_it_is_for: {
        title: "Who Likkle Legends is perfect for",
        bullets: [
            "Caribbean diaspora parents who want their children to stay rooted in island culture.",
            "Parents who want screen-free activities that still support learning and emotional literacy.",
            "Multicultural and curious families who want to explore the Caribbean in a joyful, age-appropriate way.",
            "Homeschool and enrichment-focused parents looking for SEL and culture in one place."
        ]
    },
    characters: {
        id: "characters",
        title: "The Guides of the Island",
        characters: [
            {
                id: "roti",
                name: "R.O.T.I.",
                role: "Your Child’s Island Learning Buddy",
                tagline: "“Beep boop! Ready to learn?”",
                description: "A friendly guide who helps children learn step by step through stories, games, and gentle encouragement.",
                brand_role: "Primary guide and onboarding companion",
                parent_value: [
                    "Helps kids stay focused without pressure",
                    "Makes learning routines feel fun and familiar",
                    "Guides children through lessons independently"
                ],
                image: "/images/roti-new.jpg",
                model_3d_url: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
            },
            {
                id: "tanty_spice",
                name: "Tanty Spice",
                role: "Village Heart & Wisdom",
                tagline: "“Everything Cook & Curry, me darlin'.”",
                description: "A warm, caring presence who helps lessons land with kindness, patience, and reassurance.",
                brand_role: "Emotional anchor and trust builder for parents",
                parent_value: [
                    "Supports emotional development and confidence",
                    "Creates a sense of safety and calm",
                    "Balances learning with compassion"
                ],
                image: "/images/tanty_spice_avatar.jpg",
                model_3d_url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
            },
            {
                id: "dilly_doubles",
                name: "Dilly Doubles",
                role: "Joy & Sharing Guide",
                tagline: "“Sharing is the island way!”",
                description: "A playful island friend who teaches curiosity, sharing, and community through fun and laughter.",
                brand_role: "Cultural joy engine and standout IP character",
                parent_value: [
                    "Introduces culture naturally without lectures",
                    "Encourages kids to try new things",
                    "Builds social skills through playful stories"
                ],
                image: "/images/dilly-doubles.jpg"
            },
            {
                id: "mango_moko",
                name: "Mango Moko",
                role: "Nature & Balance Guardian",
                tagline: "“Up high, watching over the rhythm.”",
                description: "A calm, observant guide who helps children slow down, listen, and learn from the world around them.",
                brand_role: "Perspective guide that balances energy with calm",
                parent_value: [
                    "Encourages patience and self-regulation",
                    "Builds respect for nature and balance",
                    "Adds depth without overstimulation"
                ],
                image: "/images/mango_moko.png"
            },
            {
                id: "benny_of_shadows",
                name: "Benny of Shadows",
                role: "Guardian of Secrets & Nature",
                tagline: "“Listen... the earth is speaking.”",
                description: "A mysterious and quiet guide who helps children connect with the hidden wonders of nature and the balance of the island.",
                brand_role: "Quiet guide that balances technology with nature",
                parent_value: [
                    "Encourages curiosity about the natural world",
                    "Builds respect for the environment",
                    "Adds a touch of mystery and wonder to learning"
                ],
                image: "/images/benny-of-shadows.jpg"
            },
            {
                id: "steelpan_sam",
                name: "Steelpan Sam",
                role: "Rhythm & Music Master",
                tagline: "“Feel the beat, learn the rhythm!”",
                description: "A musical genius who turns every lesson into a song, helping children memorize and enjoy their learning.",
                brand_role: "Musical engagement and memory coach",
                parent_value: [
                    "Makes memorization easy through rhythm",
                    "Builds appreciation for Caribbean music",
                    "keeps the energy high and fun"
                ],
                image: "/images/steelpan_sam.png"
            }
        ]
    },
    island_radio: {
        title: "Island Radio",
        subtitle: "A safe listening space for kids—nursery rhymes, island sounds, and learning songs.",
        tagline: "Now Available",
        cta: {
            label: "Preview Island Radio",
            href: "/portal/radio"
        },
        benefits: [
            { label: 'Ad-free', description: 'No interruptions or ads', icon: 'shield' },
            { label: 'Kid-safe', description: 'Curated content only', icon: 'volume' },
            { label: 'Perfect for', description: 'Car rides & mornings', icon: 'car' }
        ]
    },
    monthly_drop: {
        title: "A new island friend every month",
        subtitle: "Each month, children meet a new visiting character with a special story or lesson — giving them something exciting to look forward to.",
        tagline: "Fresh Content",
        image: "/images/mystery-character.png",
        cta: {
            label: "Meet this month’s island friend",
            href: "/characters"
        },
        items: [
            { label: 'New character', icon: 'users' },
            { label: 'New story', icon: 'book' },
            { label: 'New song', icon: 'music' },
            { label: 'New activity', icon: 'palette' }
        ]
    },
    ai_story_studio: {
        title: "Build your custom legend story",
        subtitle: "Personalize an adventure where your child is the hero. Join the club for full books and saved stories.",
        form: {
            fields: [
                {
                    id: "child_name",
                    label: "Child's name",
                    type: "text",
                    placeholder: "Enter name..."
                },
                {
                    id: "island",
                    label: "Island",
                    type: "select",
                    options: [
                        "Anguilla", "Antigua and Barbuda", "Aruba", "Bahamas", "Barbados",
                        "Belize", "Bermuda", "Bonaire", "British Virgin Islands", "Cayman Islands",
                        "Cuba", "Curaçao", "Dominica", "Dominican Republic", "Grenada",
                        "Guadeloupe", "Guyana", "Haiti", "Jamaica", "Martinique",
                        "Montserrat", "Puerto Rico", "Saba", "Saint Barthélemy",
                        "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin",
                        "Saint Vincent and the Grenadines", "Sint Eustatius", "Sint Maarten",
                        "Suriname", "Trinidad and Tobago", "Turks and Caicos Islands", "US Virgin Islands"
                    ]
                },
                {
                    id: "guide",
                    label: "Choose your Island Guide",
                    type: "select",
                    options: ["Tanty Spice", "Dilly Doubles", "Roti"]
                },
                {
                    id: "location",
                    label: "Where are we exploring?",
                    type: "select",
                    options: ["Rainforest", "Beach", "Local Market", "Grandma's Kitchen"]
                },
                {
                    id: "mission",
                    label: "What is our mission?",
                    type: "select",
                    options: ["Folklore Quest", "Number Hunt", "Color Splash", "Random Adventure"]
                }
            ],
            primary_button: {
                label: "Generate Legend Story"
            },
            states: {
                idle_message: "Fill in your child's name and hit 'Generate'.",
                loading_message: "Summoning island magic...",
                error_message: "Oye! The magic is sleeping right now. Please try again in a bit.",
                require_api_key: false
            }
        },
        vibes: [
            {
                id: "silly_funny",
                label: "Silly & Funny",
                kid_prompt: "Make it goofy and fun with jokes kids understand.",
                icon: "laugh",
                color_hint: "bright",
                audio_tone: "playful",
                emoji: "😂"
            },
            {
                id: "brave_adventure",
                label: "Brave Adventure",
                kid_prompt: "A hero moment with exploring and a happy ending.",
                icon: "compass",
                color_hint: "bold",
                audio_tone: "excited",
                emoji: "🧭"
            },
            {
                id: "bedtime_calm",
                label: "Bedtime Calm",
                kid_prompt: "Soft, calm story for bedtime with gentle words.",
                icon: "moon",
                color_hint: "soft",
                audio_tone: "calm",
                emoji: "🌙"
            },
            {
                id: "friendship_kindness",
                label: "Friendship & Kindness",
                kid_prompt: "A story about helping, sharing, and being kind.",
                icon: "heart",
                color_hint: "warm",
                audio_tone: "warm",
                emoji: "❤️"
            },
            {
                id: "mystery_not_scary",
                label: "Mystery (Not Scary)",
                kid_prompt: "A little mystery with no scary parts.",
                icon: "magnifier",
                color_hint: "cool",
                audio_tone: "curious",
                emoji: "🔍"
            },
            {
                id: "carnival_party",
                label: "Carnival Party",
                kid_prompt: "Music, dancing, colorful costumes, big joy.",
                icon: "music",
                color_hint: "vibrant",
                audio_tone: "energetic",
                emoji: "🎭"
            }
        ]
    },
    founders_section: {
        title: "Created by Caribbean parents and educators",
        bullets: [
            "Founded by Caribbean diaspora parents who were tired of not seeing their children represented in kids’ media.",
            "Guided by social-emotional learning principles used in classrooms around the world.",
            "Stories and songs inspired by real Caribbean foods, festivals, and everyday family life."
        ],
        image: "/images/child_reading.png"
    },
    pricing: {
        id: "pricing",
        title: "Start Your Culture Journey",
        subtitle: "Try the Intro Experience for just $10. Most families start here, then upgrade as their legends grow.",
        tabs: [
            { id: "mail", label: "Mail Club", description: "Identity in their hands" },
            { id: "digital", label: "Digital Only", description: "Learning everywhere" }
        ],
        plans: [
            {
                id: "starter_mailer",
                tab: "mail",
                name: "Starter Mailer",
                best_for: "New families wanting the physical connection of monthly letters.",
                price_display: "$10/mo",
                features: [
                    "1 Personalized Physical Letter",
                    "1 Cultural Flashcard & Sticker Pack",
                    "Full Portal Digital Access",
                    "Interactive Island Radio",
                    "Earn Badges & Streaks"
                ],
                badge: "Intro Experience",
                cta: { label: "Get Started", href: "/signup?plan=starter_mailer" }
            },
            {
                id: "legends_plus",
                tab: "mail",
                name: "Legends Plus",
                best_for: "Families looking for integrated cultural learning and SEL support.",
                price_display: "$24/mo",
                features: [
                    "Everything in Starter Mailer",
                    "3 Unlimited AI Story Studio Builds",
                    "Premium Voice & Island Accents",
                    "Monthly Educator Content Drop",
                    "Parent Co-Pilot Dashboard"
                ],
                badge: "Best Value",
                cta: { label: "Choose Plus", href: "/signup?plan=legends_plus" }
            },
            {
                id: "family_legacy",
                tab: "mail",
                name: "Family Legacy",
                best_for: "The ultimate cultural experience for up to 3 children.",
                price_display: "$45/mo",
                features: [
                    "Everything in Legends Plus",
                    "Personalized Letters for 3 Kids",
                    "Unlimited AI Story Builds",
                    "Direct Support for Custom Topics",
                    "Exclusive Seasonal Gift Box"
                ],
                cta: { label: "Choose Legacy", href: "/signup?plan=family_legacy" }
            },
            {
                id: "digital_explorer",
                tab: "digital",
                name: "Digital Explorer",
                best_for: "Simple digital-only access for quick learning.",
                price_display: "$9/mo",
                features: [
                    "Full Digital Portal Access",
                    "Interactive Island Radio",
                    "Basic Progress Tracking",
                    "Weekly Digital Missions"
                ],
                cta: { label: "Start Digital", href: "/signup?plan=digital_explorer" }
            }
        ],
        comparison_table: [
            { label: "Physical Monthly Mail", values: ["Yes", "Yes", "Yes", "No"] },
            { label: "Digital Portal Access", values: ["Yes", "Yes", "Yes", "Yes"] },
            { label: "AI Story Studio", values: ["Basic", "Unlimited", "Unlimited", "Basic"] },
            { label: "Island Radio", values: ["Yes", "Yes", "Yes", "Yes"] },
            { label: "Multiple Child Profiles", values: ["1", "2", "3", "1"] }
        ]
    },
    educator_block: {
        title: "Likkle Legends for Schools",
        description: "Bring Caribbean culture and SEL into your classroom with our institutional plans.",
        cta: {
            label: "Contact Sales",
            href: "/contact/educators"
        }
    }
};

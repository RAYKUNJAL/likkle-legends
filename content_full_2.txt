export const siteContent = {
    meta: {
        title: "Likkle Legends | Learning That Feels Like Home",
        description: "Help your child grow academically while staying connected to Caribbean culture—wherever you live. Stories, songs, activities, and monthly character drops for kids 4-8.",
        canonical_url: "https://likklelegends.com",
        og_image: "/images/logo.png"
    },
    notification_bar: {
        enabled: false,
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
        v2: {
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
                },
                {
                    id: "animal_helpers",
                    label: "Animal Helpers",
                    kid_prompt: "Friendly animals help solve a simple problem.",
                    icon: "paw",
                    color_hint: "natural",
                    audio_tone: "friendly",
                    emoji: "🐾"
                },
                {
                    id: "super_helpers",
                    label: "Super Helpers",
                    kid_prompt: "A kid helps like a hero—simple powers, big heart.",
                    icon: "star",
                    color_hint: "heroic",
                    audio_tone: "confident",
                    emoji: "⭐"
                }
            ],
            loading_steps: [
                { id: "step_story", label: "Writing your story…" },
                { id: "step_art", label: "Drawing pictures…" },
                { id: "step_voice", label: "Recording R.O.T.I.’s voice…" },
                { id: "step_build", label: "Putting your book together…" }
            ],
            fun_facts: [
                "Did you know? Mangos can be sweet or tangy!",
                "Anansi the spider is the most famous trickster in the Caribbean.",
                "Steel pans were originally made from empty oil drums!",
                "Hummingbirds are the smallest birds in the world!",
                "The Caribbean Sea is home to over 700 islands!",
                "Cocoa beans from the Caribbean are used to make some of the world's best chocolate!"
            ]
        },
        upsell_note: "Members can save stories, turn them into printable mini-books, and unlock audio read-aloud with island accents."
    },
    roti_voice: {
        v2: {
            default_voice: "roti_friendly_male",
            speech_rate: 0.88,
            pause_rules: {
                period_ms: 180,
                comma_ms: 120
            },
            sync: {
                word_highlighting_enabled: true,
                fallback: "sentence_highlighting"
            }
        }
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
        title: "Start free. Upgrade when you’re ready.",
        subtitle: "Kid-safe Caribbean learning for ages 4–8. Mail Club ships in the USA (Canada & UK coming soon).",
        global_rules: {
            shipping: {
                supported_countries_now: ["US"],
                coming_soon_countries: ["CA", "UK"],
                copy: {
                    supported_now_short: "Ships in the USA",
                    coming_soon_short: "Canada & UK coming soon",
                    checkout_notice: "Mail Club currently ships within the United States only. Canada and the UK are coming soon."
                }
            },
            ai_story_studio: {
                unit_name: "story_builds",
                reset_period: "monthly",
                hard_enforced: true,
                copy_note: "AI Story Studio uses reset monthly. Upgrade for more builds."
            },
            plans_visibility: {
                show_annual_toggle: false,
                default_billing_period: "monthly"
            }
        },
        tabs: [
            { id: "digital", label: "Digital", description: "Works worldwide" },
            { id: "mail", label: "Mail Club", description: "Ships in the USA" }
        ],
        plans: [
            {
                id: "plan_free_forever",
                tab: "digital",
                name: "Free Forever (Digital)",
                price_display: "$0 / forever",
                best_for: "Trying the platform, quick daily learning, and families outside shipping regions.",
                features: [
                    "Rotating library of island stories + activities",
                    "Island Radio (kid-safe audio)",
                    "1 child profile",
                    "Basic progress badges + streaks",
                    "Limited monthly downloads"
                ],
                limits: {
                    downloads_per_month: 10,
                    child_profiles: 1,
                    ai_story_studio_builds_per_month: 2
                },
                cta: {
                    label: "Start Free (No Card)",
                    href: "/get-started?plan=free_forever"
                }
            },
            {
                id: "plan_digital_legends",
                tab: "digital",
                name: "Digital Legends",
                price_display: "$4.99 / month",
                badge: "Best for worldwide access",
                best_for: "Diaspora families who want full digital access without shipping.",
                features: [
                    "Full digital library (stories, music, missions)",
                    "Unlimited progress saving",
                    "More printables + learning packs",
                    "Parent controls + Island Routine guide"
                ],
                limits: {
                    downloads_per_month: 60,
                    child_profiles: 2,
                    ai_story_studio_builds_per_month: 20
                },
                cta: {
                    label: "Go Digital — $4.99/mo",
                    href: "/checkout?plan=digital_legends_monthly"
                }
            },
            {
                id: "plan_starter_mailer",
                tab: "mail",
                name: "Starter Mailer",
                price_display: "$9.99 / month",
                badge: "Mail Club",
                best_for: "The monthly mail moment — kids run to the mailbox for this.",
                features: [
                    "Personalized monthly letter",
                    "Coloring postcard + sticker sheet",
                    "Cultural flashcard (foods, festivals)",
                    "QR portal access (stories + music)"
                ],
                limits: {
                    child_profiles: 1,
                    ai_story_studio_builds_per_month: 10
                },
                cta: {
                    label: "Start Starter Mailer",
                    href: "/checkout?plan=starter_mailer_monthly"
                },
                notice: "Ships in the USA • Canada & UK coming soon"
            },
            {
                id: "plan_legends_plus",
                tab: "mail",
                name: "Legends Plus",
                price_display: "$19.99 / month",
                badge: "Best Value",
                best_for: "Premium physical + stronger guided support for reading.",
                features: [
                    "Everything in Starter Mailer",
                    "Premium storybook-style insert",
                    "AR overlay activities",
                    "Parent Guided Chat prompts"
                ],
                limits: {
                    child_profiles: 2,
                    ai_story_studio_builds_per_month: 60
                },
                cta: {
                    label: "Upgrade to Legends Plus",
                    href: "/checkout?plan=legends_plus_monthly"
                },
                notice: "Ships in the USA • Canada & UK coming soon"
            },
            {
                id: "plan_family_legacy",
                tab: "mail",
                name: "Family Legacy",
                price_display: "$34.99 / month",
                badge: "Best for families",
                best_for: "Multi-child households + heritage building.",
                features: [
                    "Everything in Legends Plus",
                    "Up to 3 child profiles",
                    "Family Circle access",
                    "Quarterly Heritage Box",
                    "Quarterly ancestry activity kit"
                ],
                limits: {
                    child_profiles: 3,
                    family_circle_members: 2,
                    ai_story_studio_builds_per_month: 120
                },
                cta: {
                    label: "Join Family Legacy",
                    href: "/checkout?plan=family_legacy_monthly"
                },
                notice: "Ships in the USA • Canada & UK coming soon"
            }
        ],
        comparison_table: [
            { label: "Kid-safe, ad-free portal", values: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
            { label: "Mail delivery (USA)", values: ["No", "No", "Yes", "Yes", "Yes"] },
            { label: "Child profiles", values: ["1", "2", "1", "2", "3"] },
            { label: "AI Story Studio builds", values: ["2", "20", "10", "60", "120"] }
        ],
        faq: [
            { q: "Do you ship to Canada or the UK?", a: "Mail Club currently ships within the United States only. Canada and the UK are coming soon." },
            { q: "Is the Free plan really free?", a: "Yes. Free Forever includes a rotating library and kid-safe portal access. No card required." },
            { q: "How does AI Story Studio work?", a: "Each plan includes a monthly number of builds that reset every 30 days." }
        ]
    },
    educator_block: {
        title: "Schools & Educators",
        tagline: "FOR CLASSROOMS",
        description: "Bring Caribbean cultural education to your classroom with our special educator pricing and curriculum resources.",
        price_hint: "Custom licensing available for schools and libraries.",
        cta: {
            label: "Explore Educator Plans",
            href: "/educators"
        }
    },
    testimonials: {
        id: "testimonials",
        title: "What our legends say",
        subtitle: "Real stories from families on their cultural journey.",
        featured_rating: "4.9/5 from parents worldwide",
        items: [
            {
                quote: "My daughter literally waits by the mailbox for her Likkle Legends letter. She’s finally learning about her Trinidadian roots in a way that’s fun and meaningful.",
                headline: "She waits by the mailbox every month.",
                name: "Sarah J.",
                meta: "Mom of a 6-year-old · New York, USA"
            },
            {
                quote: "The emotional literacy component is what sold me. My son is learning how to talk about his feelings while celebrating his culture. It’s beautiful.",
                headline: "Culture and feelings in one place.",
                name: "David R.",
                meta: "Dad of a 7-year-old · London, UK"
            }
        ]
    },
    cta_banner: {
        headline: "Ready to start your child’s Caribbean adventure?",
        subheadline: "Join 500+ families building identity, emotional literacy, and joyful memories each month.",
        primary_cta: {
            label: "Start Mail Club for $10/month",
            href: "/get-started"
        },
        secondary_cta: {
            label: "See what’s inside a letter",
            href: "#sample-letter"
        }
    },
    faq: {
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know about the adventure.",
        items: [
            {
                question: "How does the physical mail work?",
                answer: "Every month, your child receives a personalized envelope addressed directly to them. Inside, they’ll find a letter from a Likkle Legend, a cultural flashcard, and a physical coloring sheet. Subscriptions ship by the 15th of every month."
            },
            {
                question: "Is it suitable for children outside the Caribbean?",
                answer: "Absolutely. Likkle Legends is designed for children everywhere. For those with Caribbean roots, it’s a way to stay connected. For others, it’s a beautiful way to learn about a vibrant culture, emotional literacy, and island pride."
            },
            {
                question: "What age groups are supported?",
                answer: "We have two main tracks: Mini Legends (ages 4–5), which focuses on simple cultural concepts and early SEL, and Big Legends (ages 6–8), which includes more advanced stories and emotional literacy activities."
            },
            {
                question: "How do the digital storybooks work?",
                answer: "Legends Plus and Annual members get access to our digital portal. Each month, new interactive storybooks are unlocked. Kids can read on any tablet or computer and enjoy AI-powered character interactions."
            },
            {
                question: "Can I cancel my subscription?",
                answer: "Yes. You can cancel your monthly subscription at any time through your parent dashboard. Annual plans are billed once and renew every year."
            },
            {
                question: "What if my child is not Caribbean?",
                answer: "Many of our families are multicultural or simply curious about the Caribbean. We focus on universal values like pride, empathy, and joy through a Caribbean lens, so all children feel welcome."
            },
            {
                question: "When will we receive our first letter?",
                answer: "Orders placed before the 10th of the month ship in the current cycle. Most families receive their first letter within 5–10 business days, depending on location."
            }
        ]
    },
    tanty_spice_chat: {
        enabled: true,
        name: "Tanty Spice",
        status_text: "Online & listening",
        welcome_message: "Bless up! I'm Tanty Spice. Ask me about our plans or tell me how you're feeling today!",
        input_placeholder: "Type a message...",
        button_label: "Send message",
        states: {
            idle: {},
            loading: {
                message: "Tanty is thinking..."
            },
            error: {
                message: "Oye! My magic connection is a bit weak right now, darlin'. Please try again soon."
            }
        },
        modes: {
            child_mode: {
                description: "Reflective feelings coach for children. No advice on safety or medical issues.",
                safety_ruleset_id: "child-safe"
            },
            parent_mode: {
                description: "Parent co-pilot that gives conversation prompts and activity ideas based on what your child shares.",
                safety_ruleset_id: "parent-support"
            }
        }
    },
    footer: {
        brand_line: "Bringing Caribbean culture, pride, and emotional literacy to children everywhere through personalized mail and interactive AI learning.",
        columns: [
            {
                title: "Platform",
                links: [
                    { label: "How It Works", href: "/#how-it-works" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Blog", href: "/blog" },
                    { label: "Child Portal", href: "/portal" },
                    { label: "Parent Dashboard", href: "/parent" }
                ]
            },
            {
                title: "Company",
                links: [
                    { label: "About Us", href: "/about" },
                    { label: "Contact", href: "/contact" },
                    { label: "Shipping & Returns", href: "/shipping" }, // Added
                    { label: "FAQ", href: "/faq" }, // Added
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Use", href: "/terms" },
                    { label: "Kids' Safety Policy", href: "/safety" }
                ]
            }
        ],
        copyright: "© 2026 Island Flavors Universe – Likkle Legends Mail Club. All rights reserved."
    }
};

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
                image: "https://www.likklelegends.com/assets/characters/roti.png"
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
                image: "https://www.likklelegends.com/assets/characters/tanty-spice.png"
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
                image: "https://www.likklelegends.com/assets/characters/dilly-doubles.png"
            },
            {
                id: "benny_of_shadows",
                name: "Benny of Shadows",
                role: "Nature & Balance Guardian",
                tagline: "“Listen... the earth is speaking.”",
                description: "A calm guide who helps children slow down, listen, and learn from the world around them.",
                brand_role: "Quiet guide that balances technology with nature",
                parent_value: [
                    "Encourages patience and self-regulation",
                    "Builds respect for nature and balance",
                    "Adds depth without fear or overstimulation"
                ],
                image: "https://www.likklelegends.com/assets/characters/benny-of-shadows.png"
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
        image: "https://www.likklelegends.com/assets/characters/monthly-silhouette.png",
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
                    options: ["Tanty Spice", "Dilly Doubles", "Scorcha"]
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
        upsell_note: "Members can save stories, turn them into printable mini-books, and unlock audio read-aloud with island accents."
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
        title: "Choose your legend journey",
        subtitle: "Start with Mail Club for $10/month and upgrade anytime. Cancel whenever you need.",
        plans: [
            {
                id: "mail_club",
                label: "THE PERFECT STARTER",
                name: "Mail Club",
                price_display: "$10/mo",
                billing_note: "Billed monthly. Cancel anytime.",
                features: [
                    "1 personalized physical letter every month.",
                    "1 cultural flashcard in each envelope.",
                    "1 physical coloring sheet that matches the story.",
                    "Access to 5 Island Nursery Songs.",
                    "Cancel anytime from your parent dashboard."
                ],
                badges: ["Best for trying the magic", "Ships worldwide", "Low commitment"],
                cta: {
                    label: "Start Mail Club",
                    href: "/signup",
                    variant: "primary"
                }
            },
            {
                id: "legends_plus",
                label: "BEST FOR LEARNING",
                name: "Legends Plus",
                price_display: "$24/mo",
                billing_note: "Billed monthly. Upgrade or downgrade anytime.",
                features: [
                    "Everything in Mail Club.",
                    "20+ Island Nursery Songs library for daily rotation.",
                    "Unlimited printable coloring pages for instant activities.",
                    "3 digital storybooks unlocked each month.",
                    "AI Reading Buddy access.",
                    "Parent Co-Pilot Dashboard to track usage."
                ],
                badges: ["Most popular", "Complete learning experience"],
                cta: {
                    label: "Upgrade to Plus",
                    href: "/signup",
                    variant: "secondary"
                }
            },
            {
                id: "annual_plus",
                label: "THE GRAND ADVENTURE",
                name: "Annual Plus",
                price_display: "$19/mo",
                billing_note: "Billed annually ($228). 2 months free.",
                features: [
                    "Everything in Legends Plus.",
                    "2 months free compared to paying monthly.",
                    "Exclusive character welcome box to kick off the journey.",
                    "All digital storybooks archive unlocked.",
                    "Priority access to new songs and content drops.",
                    "Custom child shoutout in a story."
                ],
                badges: ["Best value", "VIP perks"],
                cta: {
                    label: "Choose Annual",
                    href: "/signup",
                    variant: "outline"
                }
            }
        ],
        reassurance_chips: [
            "Ships by the 15th each month.",
            "Designed for ages 4–8.",
            "Perfect for Caribbean and non-Caribbean families.",
            "Pause or cancel anytime. No hidden fees."
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
                    { label: "How It Works", href: "#how-it-works" },
                    { label: "Pricing", href: "#pricing" },
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
        copyright: "© 2025 Island Flavors Universe – Likkle Legends Mail Club. All rights reserved."
    }
};

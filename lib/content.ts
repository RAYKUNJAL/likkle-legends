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
            { label: "Characters", href: "/#characters" },
            { label: "Pricing", href: "/#pricing" },
            { label: "Blog", href: "/blog" },
        ],
        auth: {
            login_label: "Login",
            login_href: "/login",
            primary_cta: {
                label: "Try $10 Intro",
                href: "/signup?plan=starter_mailer"
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
            href: "/signup?plan=starter_mailer"
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
            src: "/images/roti-new.jpg",
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
                title: "Choose your child's age path",
                description: "Pick Mini Legends (4–5) or Big Legends (6–8) so stories and missions match your child's stage.",
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
        bottom_note: "Join 500+ families. Most start with the $10 Intro — upgrade anytime as your child grows."
    },
    what_you_get: {
        id: "what-you-get",
        title: "What your child gets every month",
        items: [
            {
                label: "PERSONALIZED LETTER",
                title: "Stories that speak to your child",
                description: "A story-driven letter from a Likkle Legend character, tailored to your child's age track, turning mail time into a moment of connection.",
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
                title: "Reading help when you're busy",
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
                role: "Your Child's Island Learning Buddy",
                tagline: "\"Beep boop! Ready to learn?\"",
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
                tagline: "\"Everything Cook & Curry, me darlin'.\"",
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
                tagline: "\"Sharing is the island way!\"",
                description: "A playful island friend who teaches curiosity, sharing, and community through fun and laughter.",
                brand_role: "Cultural joy engine and standout IP character",
                parent_value: [
                    "Makes learning feel like play",
                    "Builds curiosity about Caribbean culture",
                    "Encourages kind, social behavior"
                ],
                image: "/images/dilly_doubles_avatar.jpg",
                model_3d_url: "https://modelviewer.dev/shared-assets/models/Duck.glb"
            },
            {
                id: "scholar_supreme",
                name: "Scholar Supreme",
                role: "Knowledge & Adventure",
                tagline: "\"Books are portals!\"",
                description: "A wise, bookish guide who opens doors to stories, history, and discovery on every island.",
                brand_role: "Secondary guide for deeper learning and literacy",
                parent_value: [
                    "Promotes early love of reading",
                    "Makes cultural history accessible",
                    "Develops critical thinking skills"
                ],
                image: "/images/scholar_supreme_avatar.jpg",
                model_3d_url: "https://modelviewer.dev/shared-assets/models/Parrot.glb"
            }
        ]
    },
    pricing: {
        id: "pricing",
        title: "Start Your Culture Journey",
        subtitle: "Most families start with the $10 Intro Pass. Upgrade anytime as your legends grow.",
        tabs: [
            { id: "mail", label: "Mail Club", description: "Identity in their hands", icon: "📬" },
            { id: "digital", label: "Digital Only", description: "Learning everywhere", icon: "📱" }
        ],
        plans: [
            {
                id: "starter_mailer",
                tab: "mail",
                name: "Island Starter",
                best_for: "Your first legend adventure with physical mail and digital access.",
                price_display: "$10/mo",
                features: [
                    "1 Personalized Physical Letter",
                    "1 Cultural Flashcard & Sticker Pack",
                    "Full Portal Digital Access",
                    "Interactive Island Radio",
                    "Earn Badges & Streaks"
                ],
                badge: "MOST POPULAR",
                notice: "First month, then continue at $9.99/mo",
                cta: { label: "Claim Your Child's Passport", href: "/checkout?plan=starter_mailer" }
            },
            {
                id: "legends_plus",
                tab: "mail",
                name: "Legends Plus",
                best_for: "For families who want unlimited creative building and premium features.",
                price_display: "$19.99/mo",
                features: [
                    "Everything in Island Starter",
                    "Unlimited AI Story Studio Builds",
                    "Premium Voice & Island Accents",
                    "Monthly Educator Content Drop",
                    "Parent Co-Pilot Dashboard"
                ],
                cta: { label: "Unlock Premium", href: "/checkout?plan=legends_plus" }
            },
            {
                id: "family_legacy",
                tab: "mail",
                name: "Family Legacy",
                best_for: "The ultimate package for growing families with multiple children.",
                price_display: "$34.99/mo",
                features: [
                    "Everything in Legends Plus",
                    "Personalized Letters for 3 Kids",
                    "Unlimited AI Story Builds",
                    "Direct Support for Custom Topics",
                    "Exclusive Seasonal Gift Box"
                ],
                cta: { label: "Build Your Legacy", href: "/checkout?plan=family_legacy" }
            },
            {
                id: "digital_explorer",
                tab: "digital",
                name: "Digital Explorer",
                best_for: "Full digital access without physical mail.",
                price_display: "$4.99/mo",
                features: [
                    "Full Digital Portal Access",
                    "Interactive Island Radio",
                    "Progress Tracking & Badges",
                    "Weekly Digital Missions"
                ],
                cta: { label: "Start Digital", href: "/checkout?plan=digital_explorer" }
            },
            {
                id: "free_forever",
                tab: "digital",
                name: "Free Explorer",
                best_for: "Explore Caribbean culture and songs at your own pace.",
                price_display: "$0/mo",
                features: [
                    "Core Stories & Songs",
                    "Basic Island Radio",
                    "Community Patois Lessons",
                    "Teacher & School Access"
                ],
                cta: { label: "Explore Free", href: "/signup?plan=free" }
            }
        ],
        comparison_table: [
            { label: "Physical Monthly Mail", values: ["Yes", "Yes", "Yes", "No", "No"] },
            { label: "Digital Portal Access", values: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
            { label: "AI Story Studio", values: ["Basic", "Unlimited", "Unlimited", "Basic", "No"] },
            { label: "Island Radio", values: ["Yes", "Yes", "Yes", "Yes", "Yes"] },
            { label: "Multiple Child Profiles", values: ["1", "2", "3", "1", "1"] }
        ]
    },
    educator_block: {
        title: "Likkle Legends for Schools",
        description: "Bring Caribbean culture and SEL into your classroom with our institutional plans.",
        cta: {
            label: "Explore School Plans",
            href: "/schools"
        }
    },
    testimonials: {
        id: "testimonials",
        title: "What our legends say",
        subtitle: "Real stories from families on their cultural journey.",
        featured_rating: "4.9/5 from parents worldwide",
        items: [
            {
                quote: "My daughter literally waits by the mailbox for her Likkle Legends letter. She's finally learning about her Trinidadian roots in a way that's fun and meaningful.",
                headline: "She waits by the mailbox every month.",
                name: "Sarah J.",
                meta: "Mom of a 6-year-old · New York, USA"
            },
            {
                quote: "The emotional literacy component is what sold me. My son is learning how to talk about his feelings while celebrating his culture. It's beautiful.",
                headline: "Culture and feelings in one place.",
                name: "David R.",
                meta: "Dad of a 7-year-old · London, UK"
            }
        ]
    },
    cta_banner: {
        headline: "Ready to start your child's Caribbean adventure?",
        subheadline: "Join 500+ families building identity, emotional literacy, and joyful memories each month.",
        primary_cta: {
            label: "Start Mail Club for $10/month",
            href: "/get-started"
        },
        secondary_cta: {
            label: "See what's inside a letter",
            href: "#sample-letter"
        }
    },
    faq: {
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know about the adventure.",
        items: [
            {
                question: "How does the physical mail work?",
                answer: "Every month, your child receives a personalized envelope addressed directly to them. Inside, they'll find a letter from a Likkle Legend, a cultural flashcard, and a physical coloring sheet. Subscriptions ship by the 15th of every month."
            },
            {
                question: "Is it suitable for children outside the Caribbean?",
                answer: "Absolutely. Likkle Legends is designed for children everywhere. For those with Caribbean roots, it's a way to stay connected. For others, it's a beautiful way to learn about a vibrant culture, emotional literacy, and island pride."
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
                answer: "Cultural celebration is for everyone! Likkle Legends teaches universal values like kindness, courage, and family through the specific, vibrant lens of the Caribbean. It's a great way to build global perspective."
            }
        ]
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
                    { label: "Shipping & Returns", href: "/shipping" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Use", href: "/terms" },
                    { label: "Kids' Safety Policy", href: "/safety" }
                ]
            }
        ],
        copyright: "© 2026 Island Flavors Universe – Likkle Legends Mail Club. All rights reserved."
    }
};

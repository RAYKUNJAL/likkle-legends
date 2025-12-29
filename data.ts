import { 
  Mail, 
  CreditCard, 
  Palette, 
  Laptop, 
  Award, 
  Truck, 
  Undo, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';
import { Feature, TrustBadge, Character, PricingPlan, Testimonial } from './types';

export const NAV_ITEMS = [
  { label: "How It Works", link: "#how-it-works" },
  { label: "Digital Portal", link: "#digital-portal" },
  { label: "Parent Dashboard", link: "#parents" },
  { label: "Pricing", link: "#pricing" }
];

export const TRUST_BADGES: TrustBadge[] = [
  { icon: Truck, title: "Free Shipping", description: "On orders $75+", color: "#00B4D8" },
  { icon: Undo, title: "Hassle-Free Returns", description: "Easy returns anytime", color: "#FF6B35" },
  { icon: ShieldCheck, title: "100% Guarantee", description: "We'll refund if not happy", color: "#06D6A0" },
  { icon: Lock, title: "Secure Checkout", description: "256-bit SSL encryption", color: "#F72585" }
];

export const FEATURES: Feature[] = [
  {
    icon: Mail,
    title: "Personalized Letter",
    description: "A heartfelt, story-driven message from a Likkle Legends character tailored to your child's age.",
    badge: "Most Loved",
    color: "#FF6B35", // Primary Coral
    bgColor: "#FFF5F0" // Light Coral tint
  },
  {
    icon: CreditCard,
    title: "Physical + Digital Flashcards",
    description: "Collectible cards teaching emotional skills and Caribbean pride. Includes 3D digital versions!",
    color: "#00B4D8", // Secondary Cyan
    bgColor: "#F0FCFF" // Light Cyan tint
  },
  {
    icon: Palette,
    title: "Coloring Page",
    description: "A themed coloring adventure tied to the story of the month. Screen-free creative fun!",
    color: "#F72585", // Accent Pink
    bgColor: "#FFF0F7" // Light Pink tint
  },
  {
    icon: Laptop,
    title: "Private Digital Portal",
    description: "Age-based lessons, read-alongs, Unity Missions, and badges. Unlock new content each month!",
    color: "#023047", // Deep Navy
    bgColor: "#F4F7F9" // Light Navy tint
  },
  {
    icon: Award,
    title: "Unity Mission + Badge",
    description: "Monthly challenge encouraging creativity, pride, and growth. Kids earn digital badges!",
    color: "#FF9F1C", // Golden Yellow (New complementary)
    bgColor: "#FFFBF0" // Light Yellow tint
  }
];

export const CHARACTERS: Character[] = [
  {
    name: "Dilly Doubles",
    role: "The Flavor Explorer",
    description: "Me name's Dilly Doubles, full of spice and cheer! In Trinidad and Tobago, me heart beats here!",
    image: "https://picsum.photos/id/1062/400/400", // Placeholder for character art
    color: "bg-yellow-100"
  },
  {
    name: "Tanty Spice",
    role: "The History Keeper",
    description: "With her magical pot and endless stories, she connects children to their ancestors and traditions.",
    image: "https://picsum.photos/id/1027/400/400",
    color: "bg-orange-100"
  },
  {
    name: "Captain Coconut",
    role: "The Nature Guardian",
    description: "He teaches resilience and environmental care, showing kids how to stand tall like a palm tree.",
    image: "https://picsum.photos/id/1040/400/400",
    color: "bg-green-100"
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Mail Club",
    price: "$10",
    period: "/month",
    description: "Physical mail + Limited Digital Access",
    features: [
      "Monthly Physical Letter",
      "2 Collectible Flashcards (Zaboca & Nutmeg)",
      "1 Digital Story / month",
      "1 AI Reading Session / month",
      "Pay as you go"
    ],
    buttonText: "Join Mail Club",
    isPopular: false
  },
  {
    name: "Legends Plus",
    price: "$24",
    period: "/month",
    description: "The Full Experience (Physical + Unlimited Digital)",
    features: [
      "Everything in Mail Club",
      "Bonus Sticker Sheet",
      "Unlimited AI Reading Buddy",
      "Full Digital Library Access",
      "Feelings & Culture Coach",
      "Parent Co-pilot Dashboard"
    ],
    buttonText: "Join Legends Plus",
    isPopular: true
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah M.",
    role: "Mom of 2",
    content: "My kids absolutely LOVE Dilly Doubles. It's the only mail they get, and they tear it open immediately. I love the cultural connection.",
    avatar: "https://picsum.photos/id/64/100/100",
    rating: 5
  },
  {
    name: "James T.",
    role: "Dad of 6-year-old",
    content: "Finally, something that teaches my son about his Trini roots in a way that is fun and engaging. The emotional lessons are a huge bonus.",
    avatar: "https://picsum.photos/id/91/100/100",
    rating: 5
  },
  {
    name: "Alicia K.",
    role: "Homeschool Mom",
    content: "We use the digital portal lessons as part of our social studies curriculum. High quality, educational, and fun.",
    avatar: "https://picsum.photos/id/177/100/100",
    rating: 5
  }
];
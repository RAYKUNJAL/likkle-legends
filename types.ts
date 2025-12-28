import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  link: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  color: string;
  bgColor: string;
}

export interface TrustBadge {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export interface Character {
  name: string;
  role: string;
  description: string;
  image: string;
  color: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}
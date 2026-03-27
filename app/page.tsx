import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Likkle Legends | Learning That Feels Like Home",
  description:
    "Help your child grow academically while staying connected to Caribbean culture—wherever you live. Stories, songs, activities, and monthly character drops for kids 3-9.",
  alternates: {
    canonical: "https://www.likklelegends.com/",
  },
  openGraph: {
    title: "Likkle Legends | Learning That Feels Like Home",
    description:
      "Caribbean-inspired educational stories, songs, and monthly mail for kids 3-9.",
    url: "https://www.likklelegends.com/",
    siteName: "Likkle Legends",
    type: "website",
  },
};

export { default } from "@/components/landing-v3/LandingPage";

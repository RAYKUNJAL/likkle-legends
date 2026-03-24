import type { Metadata } from "next";
import { TattooLandingPage } from "@/components/tattoo/TattooLandingPage";

export const metadata: Metadata = {
  title: "Island City Tattoos | Custom Tattoo Studio",
  description:
    "Custom tattoo studio in Baltimore with online booking, flash specials, and custom design consultations.",
  alternates: {
    canonical: "https://islandcitytattoos.com/",
  },
  openGraph: {
    title: "Island City Tattoos",
    description:
      "Book bold custom work, claim limited flash offers, and start your tattoo consult online.",
    url: "https://islandcitytattoos.com/",
    siteName: "Island City Tattoos",
    type: "website",
  },
};

export default function Page() {
  return <TattooLandingPage />;
}

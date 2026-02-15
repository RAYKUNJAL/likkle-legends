"use client";

import StoryStudioWizard from "@/components/studio/StoryStudioWizard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function StoryStudioPage() {
    return (
        <div className="min-h-screen bg-[#FFFBF5]">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/portal" className="inline-flex items-center gap-2 text-orange-600 font-black uppercase tracking-widest text-xs hover:underline mb-8">
                    <ChevronLeft size={16} /> Back to Village
                </Link>
                <StoryStudioWizard />
            </div>
        </div>
    );
}

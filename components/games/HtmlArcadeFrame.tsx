'use client';

import Link from 'next/link';

type HtmlArcadeFrameProps = {
  title: string;
  src: string;
  backHref?: string;
};

export default function HtmlArcadeFrame({
  title,
  src,
  backHref = '/games',
}: HtmlArcadeFrameProps) {
  return (
    <div className="flex h-[100dvh] flex-col bg-[#0A1628] text-white">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <Link href={backHref} className="text-sm font-bold text-amber-300 hover:text-amber-200">
          ← Back to Games
        </Link>
        <h1 className="truncate text-sm font-black tracking-wide text-white/90">{title}</h1>
        <span className="w-24" />
      </header>
      <iframe
        title={title}
        src={src}
        className="h-full w-full flex-1 border-0 bg-[#0A1628]"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}

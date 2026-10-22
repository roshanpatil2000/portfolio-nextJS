"use client";

import { useState } from "react";
import { community } from "@/content/home";
import Section, { CellHeader } from "@/components/Section";
import MediaView from "@/components/MediaView";
import { AccentHeading } from "@/components/ui";

const pad = (n: number) => String(n).padStart(2, "0");

export default function CommunityGrid() {
  return (
    <Section id="made-with" index={community.index} title={community.title} side={community.side}>
      <div className="px-6 py-14 md:px-10 md:py-20">
        <AccentHeading
          lead={community.heading}
          accent={community.headingAccent}
          tail={community.headingTail}
          className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong md:text-6xl"
        />
      </div>
      <div data-reveal-group className="grid gap-px border-t border-line bg-line md:grid-cols-3">
        {community.items.map((item, i) => (
          <figure key={i} data-reveal className="bg-bg">
            <CellHeader as="figcaption" left={item.caption} right={pad(i + 1)} />
            <div className="relative aspect-video w-full overflow-hidden bg-bg-sunken">
              <Film youtubeId={item.youtubeId} title={item.title} seed={item.seed} />
            </div>
          </figure>
        ))}
      </div>
    </Section>
  );
}

// Thumbnail that swaps itself for a privacy-friendly YouTube embed on click.
function Film({ youtubeId, title, seed }: { youtubeId: string; title: string; seed: number }) {
  const [playing, setPlaying] = useState(false);

  if (playing && youtubeId) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play ${title}`}>
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <MediaView media={{ kind: "generative", seed }} />
      </div>
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/5" />
      <span className="hud-label absolute bottom-3 left-3 flex items-center gap-1.5 bg-invert-bg px-3 py-1.5 text-invert-fg">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
          <path d="M6 4l14 8-14 8z" />
        </svg>
        Watch
      </span>
    </button>
  );
}

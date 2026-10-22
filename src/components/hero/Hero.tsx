"use client";

import dynamic from "next/dynamic";
import { brand, hero } from "@/content/home";
import Wordmark, { HeroScrim } from "./Wordmark";
import Marquee from "@/components/Marquee";
import { AccentHeading, ArrowIcon, Button, GithubIcon } from "@/components/ui";

const Galaxy = dynamic(() => import("./Galaxy"), { ssr: false });

export default function Hero() {
  return (
    <section id="hero" className="relative">
      <div className="relative flex min-h-[calc(100svh-3rem)] flex-col">
        <Galaxy />
        <div className="pointer-events-none relative z-40 mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center px-6 py-10 md:px-10">
          <div data-reveal-group className="relative flex w-full max-w-2xl flex-col items-center text-center">
            <HeroScrim />
            <Wordmark />
            <AccentHeading
              as="h1"
              lead={hero.headline}
              accent={hero.headlineAccent}
              className="relative mt-8 font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] text-ink-strong md:text-[2.75rem] [&>span]:text-muted"
            />
            <p data-reveal className="relative mt-4 max-w-md text-lg leading-relaxed text-muted">
              {hero.sub}
            </p>
            <div data-reveal className="pointer-events-auto relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button href={hero.primary.href}>
                {hero.primary.label}
                <ArrowIcon className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover/btn:translate-y-0.5" />
              </Button>
              <Button href={hero.secondary.href} variant="outline" className="bg-bg/60 backdrop-blur-sm">
                {hero.secondary.label}
              </Button>
            </div>
            <div data-reveal className="pointer-events-auto relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a
                href={brand.links.github}
                target="_blank"
                rel="noreferrer"
                className="hud-label flex items-center gap-1.5 text-faint transition-colors hover:text-ink"
              >
                <GithubIcon className="h-3 w-3" />
                {hero.meta[0]}
              </a>
              {hero.meta.slice(1).map((m) => (
                <p key={m} className="hud-label text-faint">
                  {m}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-40 bg-bg/70 backdrop-blur-sm">
          <Marquee />
        </div>
      </div>
    </section>
  );
}

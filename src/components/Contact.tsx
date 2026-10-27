import { brand, contact } from "@/content/home";
import Section from "@/components/Section";
import { AccentHeading, ArrowIcon, Button, GithubIcon, LinkedinIcon } from "@/components/ui";

export default function Contact() {
  return (
    <Section id="contact">
      {/* Extra top room so the heading clears the rail's top-right label stack. */}
      <div className="flex flex-col items-center px-6 pt-20 pb-20 text-center md:pt-48 md:pb-28">
        <p className="hud-label flex items-center gap-2 text-faint">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse bg-accent" />
          {contact.eyebrow}
        </p>
        <AccentHeading
          lead={contact.heading}
          accent={contact.headingAccent}
          tail={contact.headingTail}
          className="mt-6 max-w-4xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-ink-strong md:text-7xl"
        />
        <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          {contact.sub}
        </p>
        <div data-reveal className="mt-10 flex w-full max-w-xs flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
          <Button href={contact.primary.href} stretch>
            {contact.primary.label}
            <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Button>
          <Button href={contact.secondary.href} variant="outline" stretch download={brand.resumeFileName}>
            {contact.secondary.label}
          </Button>
        </div>
        {/* Email on its own line on phones, one row from sm up. Links carry py-2 tap padding; the margins absorb it. */}
        <div data-reveal className="mt-6 -mb-2 flex flex-col items-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
          <a href={`mailto:${brand.email}`} className="hud-label py-2 text-faint transition-colors hover:text-ink">
            {brand.email}
          </a>
          <div className="flex items-center justify-center gap-x-6">
            <a href={brand.links.github} target="_blank" rel="noreferrer" className="hud-label flex items-center gap-1.5 py-2 text-faint transition-colors hover:text-ink">
              <GithubIcon className="h-3 w-3" />
              GitHub
            </a>
            <a href={brand.links.linkedin} target="_blank" rel="noreferrer" className="hud-label flex items-center gap-1.5 py-2 text-faint transition-colors hover:text-ink">
              <LinkedinIcon className="h-3 w-3" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

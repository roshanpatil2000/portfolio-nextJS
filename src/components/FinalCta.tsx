import { start } from "@/content/home";
import Section from "@/components/Section";
import { AccentHeading, Button, DesktopIcon } from "@/components/ui";

export default function FinalCta() {
  return (
    <Section id="start">
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
        <p className="hud-label text-faint">{start.eyebrow}</p>
        <AccentHeading
          lead={start.heading}
          accent={start.headingAccent}
          tail={start.headingTail}
          className="mt-6 max-w-4xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.04em] text-ink-strong md:text-7xl"
        />
        <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          {start.sub}
        </p>
        <div data-reveal className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href={start.primary.href}>
            <DesktopIcon className="h-4 w-4" />
            {start.primary.label}
          </Button>
          <Button href={start.secondary.href} variant="outline">
            {start.secondary.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}

import { ownership } from "@/content/home";
import Section from "@/components/Section";
import { AccentHeading, Button, GithubIcon } from "@/components/ui";

export default function OwnershipGrid() {
  return (
    <Section id="ownership" index={ownership.index} title={ownership.title} side={ownership.side}>
      <div className="px-6 py-14 md:px-10 md:py-20">
        <AccentHeading
          lead={ownership.heading}
          accent={ownership.headingAccent}
          tail={ownership.headingTail}
          className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong md:text-6xl"
        />
        <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {ownership.sub}
        </p>
      </div>

      <div data-reveal-group className="grid gap-px border-t border-line bg-line md:grid-cols-3">
        {ownership.items.map((item) => (
          <article key={item.key} data-reveal className="flex flex-col bg-bg p-6 md:p-8">
            <p className="hud-label text-faint">{item.key}</p>
            <h3 className="mt-6 font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
            {item.cta && (
              <Button href={item.cta.href} variant="outline" size="sm" className="mt-6">
                <GithubIcon className="h-3.5 w-3.5" />
                {item.cta.label}
              </Button>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

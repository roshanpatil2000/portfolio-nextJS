import { features } from "@/content/home";
import Section, { CellHeader } from "@/components/Section";
import MediaView from "@/components/MediaView";
import { AccentHeading, ArrowIcon } from "@/components/ui";

const pad = (n: number) => String(n).padStart(2, "0");

export default function FeatureGrid() {
  return (
    <Section id="features" index={features.index} title={features.title} side={features.side}>
      <div className="px-6 py-14 md:px-10 md:py-20">
        <AccentHeading
          lead={features.heading}
          accent={features.headingAccent}
          tail={` ${features.headingTail}`}
          className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong md:text-6xl"
        />
        <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {features.sub}
        </p>
      </div>

      <div data-reveal-group className="grid gap-px border-t border-line bg-line md:grid-cols-2">
        {features.items.map((f, i) => (
          <article key={f.title} data-reveal className="group bg-bg">
            <CellHeader left={f.label} right={pad(i + 1)} />
            <div className="relative aspect-video w-full overflow-hidden bg-bg-sunken">
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                <MediaView media={f.media} />
              </div>
            </div>
            <div className="px-6 py-6 md:px-8">
              <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">{f.title}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted">{f.body}</p>
            </div>
          </article>
        ))}

        <a href={features.more.href} data-reveal className="group flex flex-col bg-bg">
          <CellHeader left={features.more.label} right={pad(features.items.length + 1)} />
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden bg-bg-sunken">
            <span className="flex h-14 w-14 items-center justify-center border border-line-strong text-ink transition-colors duration-200 group-hover:border-ink group-hover:bg-invert-bg group-hover:text-invert-fg">
              <ArrowIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <p className="hud-label text-faint">Explore</p>
            <span aria-hidden className="tick top-2 left-2 opacity-60" />
            <span aria-hidden className="tick right-2 bottom-2 opacity-60" />
          </div>
          <div className="px-6 py-6 md:px-8">
            <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">{features.more.title}</h3>
            <p className="mt-2 max-w-xl leading-relaxed text-muted">{features.more.body}</p>
          </div>
        </a>
      </div>
    </Section>
  );
}

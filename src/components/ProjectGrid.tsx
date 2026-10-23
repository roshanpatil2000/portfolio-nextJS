import { projects } from "@/content/home";
import Section, { CellHeader } from "@/components/Section";
import MediaView from "@/components/MediaView";
import { AccentHeading, ArrowIcon } from "@/components/ui";

const pad = (n: number) => String(n).padStart(2, "0");

export default function ProjectGrid() {
  return (
    <Section id="projects" index={projects.index} title={projects.title} side={projects.side}>
      <div className="px-6 py-14 md:px-10 md:py-20">
        <AccentHeading
          lead={projects.heading}
          accent={projects.headingAccent}
          tail={projects.headingTail}
          className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong md:text-6xl"
        />
        <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {projects.sub}
        </p>
      </div>

      <div data-reveal-group className="grid gap-px border-t border-line bg-line md:grid-cols-2">
        {projects.items.map((p, i) => (
          <article
            key={p.title}
            data-reveal
            data-project-id={p.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}
            className="group flex flex-col bg-bg"
          >
            <CellHeader left={p.label} right={pad(i + 1)} />
            <div className="relative aspect-video w-full overflow-hidden bg-bg-sunken">
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                <MediaView media={p.media} />
              </div>
            </div>
            <div className="flex flex-1 flex-col px-6 py-6 md:px-8">
              <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">{p.title}</h3>
              <p className="mt-2 max-w-xl leading-relaxed text-muted">{p.body}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="hud-label border border-line px-2 py-1 text-faint">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}

        <a href={projects.more.href} target="_blank" rel="noreferrer" data-reveal className="group flex flex-col bg-bg">
          <CellHeader left={projects.more.label} right={pad(projects.items.length + 1)} />
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden bg-bg-sunken">
            <span className="flex h-14 w-14 items-center justify-center border border-line-strong text-ink transition-colors duration-200 group-hover:border-ink group-hover:bg-invert-bg group-hover:text-invert-fg">
              <ArrowIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <p className="hud-label text-faint">GitHub</p>
            <span aria-hidden className="tick top-2 left-2 opacity-60" />
            <span aria-hidden className="tick right-2 bottom-2 opacity-60" />
          </div>
          <div className="px-6 py-6 md:px-8">
            <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">{projects.more.title}</h3>
            <p className="mt-2 max-w-xl leading-relaxed text-muted">{projects.more.body}</p>
          </div>
        </a>
      </div>
    </Section>
  );
}

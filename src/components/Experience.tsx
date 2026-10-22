import { experience } from "@/content/home";
import Section, { CellHeader } from "@/components/Section";
import { AccentHeading } from "@/components/ui";

export default function Experience() {
  return (
    <Section id="experience" index={experience.index} title={experience.title} side={experience.side}>
      <div className="px-6 py-14 md:px-10 md:py-20">
        <AccentHeading
          lead={experience.heading}
          accent={experience.headingAccent}
          tail={experience.headingTail}
          className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong md:text-6xl"
        />
      </div>

      <div data-reveal-group className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-4">
        {experience.stats.map((s) => (
          <div key={s.label} data-reveal className="bg-bg p-6 md:p-8">
            <p className="font-display text-4xl font-medium tracking-[-0.03em] text-ink-strong md:text-5xl">
              {s.value}
              <span className="font-serif text-3xl font-normal italic text-muted md:text-4xl">{s.unit}</span>
            </p>
            <p className="hud-label mt-3 text-faint">{s.label}</p>
          </div>
        ))}
      </div>

      <div data-reveal-group className="grid gap-px border-t border-line bg-line md:grid-cols-2">
        {experience.roles.map((r) => (
          <article key={r.company} data-reveal className="flex flex-col bg-bg">
            <CellHeader left={r.period} right={r.key} />
            <div className="px-6 py-6 md:px-8 md:py-8">
              <h3 className="font-display text-2xl font-medium tracking-[-0.02em] text-ink-strong">{r.role}</h3>
              <p className="mt-1 text-muted">
                <span className="font-serif text-lg italic">at</span> {r.company}
                <span className="text-faint"> · {r.place}</span>
              </p>
              <ul className="mt-5 space-y-3">
                {r.points.map((pt) => (
                  <li key={pt} className="flex gap-3 leading-relaxed text-muted">
                    <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-accent-ink" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div data-reveal-group className="grid gap-px border-t border-line bg-line md:grid-cols-2">
        {experience.education.map((e) => (
          <div key={e.school} data-reveal className="flex items-baseline justify-between gap-4 bg-bg px-6 py-5 md:px-8">
            <div>
              <p className="font-display text-lg font-medium text-ink-strong">{e.degree}</p>
              <p className="text-sm text-muted">{e.school}</p>
            </div>
            <p className="hud-label text-faint">{e.year}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

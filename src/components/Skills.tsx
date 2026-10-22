import { skills } from "@/content/home";
import Section from "@/components/Section";
import { AccentHeading } from "@/components/ui";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Skills() {
  return (
    <Section id="skills" index={skills.index} title={skills.title} side={skills.side}>
      <div className="px-6 py-14 md:px-10 md:py-20">
        <AccentHeading
          lead={skills.heading}
          accent={skills.headingAccent}
          tail={skills.headingTail}
          className="max-w-3xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-ink-strong md:text-6xl"
        />
      </div>
      <div data-reveal-group className="grid gap-px border-t border-line bg-line sm:grid-cols-2 md:grid-cols-3">
        {skills.groups.map((g, i) => (
          <article key={g.key} data-reveal className="bg-bg p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h3 className="hud-label text-muted">{g.key}</h3>
              <p className="hud-label text-faint">{pad(i + 1)}</p>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {g.items.map((s) => (
                <li
                  key={s}
                  className="border border-line px-3 py-1.5 text-sm text-ink transition-colors duration-150 hover:border-ink hover:bg-invert-bg hover:text-invert-fg"
                >
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}

import { brand, footer } from "@/content/home";
import { LogoMark } from "@/components/ui";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1280px] gap-px border-x border-line bg-line md:grid-cols-[2fr_1fr_1fr]">
        <div className="bg-bg p-6 md:p-8">
          <LogoMark className="h-7 w-auto text-ink-strong" />
          <p className="mt-4 font-display text-xl font-medium text-ink-strong">{brand.name}</p>
          <p className="mt-1 max-w-sm text-muted">{footer.blurb}</p>
        </div>
        {footer.columns.map((col) => (
          <nav key={col.title} className="bg-bg p-6 md:p-8">
            <p className="hud-label text-faint">{col.title}</p>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-muted transition-colors hover:text-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between border-x border-t border-line px-6 py-4 md:px-8">
        <p className="hud-label text-faint">© {brand.name}</p>
        <p className="hud-label text-faint">{brand.location}</p>
      </div>
    </footer>
  );
}

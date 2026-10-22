import { brand, footer } from "@/content/home";
import { LogoMark } from "@/components/ui";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1280px] border-x border-line">
        <div className="flex flex-col gap-6 border-b border-line p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <LogoMark className="h-7 w-auto text-ink-strong" />
            <p className="mt-4 max-w-sm text-muted">{footer.blurb}</p>
          </div>
          <a href={`mailto:${brand.email}`} className="hud-label text-faint transition-colors hover:text-ink">
            {brand.email}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
          {footer.columns.map((col) => (
            <nav key={col.title} className="bg-bg p-6 md:p-8">
              <p className="hud-label text-faint">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-muted transition-colors hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line px-6 py-4 md:px-8">
          <p className="hud-label text-faint">
            © {brand.name}
          </p>
          <p className="hud-label text-faint">Open source</p>
        </div>
      </div>
    </footer>
  );
}

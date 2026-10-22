import Link from "next/link";
import { nav } from "@/content/home";
import ThemeToggle from "@/components/ThemeToggle";
import NavLinks from "@/components/NavLinks";
import { Button, LogoMark } from "@/components/ui";

const linkBase = "font-mono text-[11px] font-medium uppercase tracking-[0.15em] px-2 py-1 transition-colors";

export default function Nav() {
  return (
    <nav className="sticky top-0 left-0 z-50 flex h-12 w-full items-stretch border-b border-line bg-bg/95 backdrop-blur-sm">
      <Link href="/" aria-label="Home" className="flex w-14 items-center justify-center border-r border-line text-ink-strong">
        <LogoMark className="h-[18px] w-auto" />
      </Link>

      <NavLinks />
      <div className="flex-1 lg:hidden" />

      <div className="hidden items-center gap-3 border-l border-line px-4 md:flex">
        {nav.secondary.map((l) => (
          <a
            key={l.label}
            href={l.href}
            {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            {...("download" in l ? { download: l.download } : {})}
            className={`${linkBase} text-muted hover:text-ink`}
          >
            {l.label}
          </a>
        ))}
      </div>

      <ThemeToggle />
      <Button href={nav.cta.href} size="sm" className="h-full border-l border-line">
        {nav.cta.label}
      </Button>
    </nav>
  );
}

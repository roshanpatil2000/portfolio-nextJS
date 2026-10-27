import Link from "next/link";
import { nav } from "@/content/home";
import ThemeToggle from "@/components/ThemeToggle";
import NavLinks from "@/components/NavLinks";
import MobileMenu from "@/components/MobileMenu";
import { ScrollProgress, SectionIndicator } from "@/components/SectionIndicator";
import { Button, LogoMark } from "@/components/ui";

const linkBase = "font-mono text-[11px] font-medium uppercase tracking-[0.15em] px-2 py-1 transition-colors";

export default function Nav() {
  return (
    <nav className="sticky top-0 left-0 z-50 flex h-12 w-full items-stretch border-b border-line bg-bg/95 backdrop-blur-sm">
      <Link href="/" aria-label="Home" className="flex w-14 shrink-0 items-center justify-center border-r border-line text-ink-strong">
        <LogoMark className="h-[18px] w-auto" />
      </Link>

      {/* Desktop: section links. Below lg: where you are on the page. */}
      <NavLinks />
      <SectionIndicator />

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
      <MobileMenu />
      <Button href={nav.cta.href} size="sm" className="h-full shrink-0 border-l border-line px-4 sm:px-5">
        {nav.cta.label}
      </Button>
      <ScrollProgress />
    </nav>
  );
}

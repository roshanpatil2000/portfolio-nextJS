"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { brand, nav } from "@/content/home";
import { useLenis } from "@/components/SmoothScroll";
import { useActiveSection } from "@/lib/useActiveSection";
import { ThemeIcon, useTheme } from "@/components/ThemeToggle";

const NAV_H = 48;
const ids = nav.links.map((l) => l.href.slice(1));
const pad = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "closed" | "open" | "closing";

// Full-screen menu for phones and tablets (below `lg`, where the section links
// in the nav are hidden). Rendered into <body> because the nav's
// backdrop-filter would otherwise trap a fixed overlay inside the 48px bar.
export default function MobileMenu() {
  const [phase, setPhase] = useState<Phase>("closed");
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const active = useActiveSection(ids);
  const [theme, toggleTheme] = useTheme();
  const open = phase === "open";

  const close = useCallback(() => setPhase((p) => (p === "open" ? "closing" : p)), []);

  // Lock the page while open: Lenis's stopped state also sets overflow:hidden.
  // Released as soon as closing starts, so a tapped link can glide right away.
  useEffect(() => {
    if (phase !== "open") return;
    const root = document.documentElement;
    if (lenis) lenis.stop();
    else root.style.overflow = "hidden";
    return () => {
      if (lenis) lenis.start();
      else root.style.overflow = "";
    };
  }, [phase, lenis]);

  // Enter / exit choreography, matching the site's blur-up reveals.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-menu-item]");
    if (phase === "open") {
      // Focus once the panel is visible; a hidden ancestor drops focus.
      const focusFirst = () => el.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      if (reducedMotion()) return focusFirst();
      const tl = gsap.timeline();
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.out", onComplete: focusFirst });
      tl.fromTo(
        items,
        { autoAlpha: 0, y: 28, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.05, clearProps: "filter" },
        0.05,
      );
      return () => {
        tl.kill();
      };
    }
    if (phase === "closing") {
      const done = () => {
        setPhase("closed");
        toggle.current?.focus({ preventScroll: true });
      };
      if (reducedMotion()) return done();
      const tl = gsap.timeline({ onComplete: done });
      tl.to(items, { autoAlpha: 0, y: -12, duration: 0.2, ease: "power2.in", stagger: { each: 0.025, from: "end" } });
      tl.to(el, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
      return () => {
        tl.kill();
      };
    }
  }, [phase]);

  // Escape closes; growing to desktop width (where the menu doesn't exist) too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const mq = window.matchMedia("(min-width: 1024px)");
    const onWide = () => mq.matches && close();
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open, close]);

  // Section links: close first, then glide. Lenis ignores scrollTo while stopped.
  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    close();
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    if (lenis) {
      lenis.start();
      lenis.scrollTo(target, { offset: -NAV_H, duration: 1.2 });
    } else {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - NAV_H, behavior: "smooth" });
    }
    history.replaceState(null, "", href);
  };

  return (
    <>
      <button
        ref={toggle}
        type="button"
        onClick={() => (open ? close() : setPhase("open"))}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="relative flex h-full w-12 shrink-0 items-center justify-center border-l border-line text-ink transition-colors hover:text-ink-strong lg:hidden"
      >
        <span aria-hidden className="relative block h-3 w-4">
          <span
            className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0.5"}`}
          />
          <span
            className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`}
          />
        </span>
      </button>

      {phase !== "closed" &&
        createPortal(
          <div
            ref={panel}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-track-location="mobile_menu"
            className="fixed inset-x-0 bottom-0 z-[48] flex flex-col overflow-y-auto bg-bg/95 backdrop-blur-md lg:hidden"
            style={{ top: NAV_H }}
          >
            <ul className="border-b border-line">
              {nav.links.map((l, i) => {
                const on = l.href.slice(1) === active;
                return (
                  <li key={l.href} data-menu-item className="border-t border-line first:border-t-0">
                    <a
                      href={l.href}
                      onClick={(e) => goTo(e, l.href)}
                      aria-current={on ? "location" : undefined}
                      data-track-label={l.label}
                      className="group flex items-baseline gap-4 px-6 py-5 sm:px-10"
                    >
                      <span className="hud-label w-6 text-faint">{pad(i + 1)}</span>
                      <span
                        className={`font-display text-4xl font-medium tracking-[-0.03em] transition-colors ${
                          on ? "text-ink-strong" : "text-muted group-hover:text-ink"
                        }`}
                      >
                        {l.label}
                      </span>
                      {on && <span aria-hidden className="ml-auto h-1.5 w-1.5 -translate-y-1 self-center bg-accent" />}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div data-menu-item className="grid grid-cols-3 gap-px border-b border-line bg-line">
              {nav.secondary.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={close}
                  {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  {...("download" in l ? { download: l.download } : {})}
                  className="hud-label flex items-center justify-center bg-bg py-4 text-muted transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div data-menu-item className="mt-auto flex items-end justify-between gap-4 px-6 py-8 sm:px-10">
              <div className="flex min-w-0 flex-col gap-1">
                <a href={`mailto:${brand.email}`} className="hud-label py-2 break-all text-muted transition-colors hover:text-ink">
                  {brand.email}
                </a>
                <p className="hud-label text-faint">{brand.location}</p>
              </div>
              {/* On phones the nav has no room for the theme toggle; it lives here. */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                className="hud-label flex shrink-0 items-center gap-2 border border-line px-3 py-2.5 text-muted transition-colors hover:border-ink hover:text-ink sm:hidden"
              >
                <ThemeIcon theme={theme} className="h-3.5 w-3.5" />
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

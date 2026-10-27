"use client";

import { useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";

type Theme = "light" | "dark";

// The theme lives on <html data-theme>; subscribe to that attribute.
function subscribe(fn: () => void) {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const getTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

// Current theme plus a toggle; shared by the nav button and the mobile menu.
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as Theme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    track("theme_changed", { theme: next });
  };

  return [theme, toggle] as const;
}

export function ThemeIcon({ theme, className = "h-4 w-4" }: { theme: Theme; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      {theme === "dark" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : (
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      )}
    </svg>
  );
}

// Nav button. Hidden on phones, where the toggle lives in the mobile menu to
// leave room for the section indicator.
export default function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="hidden h-full w-12 shrink-0 items-center justify-center border-l border-line text-muted transition-colors hover:text-ink sm:flex"
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}

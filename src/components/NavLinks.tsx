"use client";

import { useEffect, useState } from "react";
import { nav } from "@/content/home";

const linkBase = "font-mono text-[11px] font-medium uppercase tracking-[0.15em] px-2 py-1 transition-colors duration-200";
const ids = nav.links.map((l) => l.href.slice(1));

// Section links whose inverted pill follows the section you're reading.
export default function NavLinks() {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const update = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="hidden min-w-0 flex-1 items-center gap-3 px-3 lg:flex">
      {nav.links.map((l) => {
        const on = l.href.slice(1) === active;
        return (
          <a
            key={l.label}
            href={l.href}
            aria-current={on ? "location" : undefined}
            className={`${linkBase} ${on ? "bg-invert-bg text-invert-fg" : "text-muted hover:text-ink"}`}
          >
            {l.label}
          </a>
        );
      })}
    </div>
  );
}

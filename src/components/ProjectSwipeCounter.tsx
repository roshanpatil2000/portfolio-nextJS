"use client";

import { useCallback, useSyncExternalStore } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

// Mobile-only position readout for the horizontal projects row, driven by its scrollLeft.
export default function ProjectSwipeCounter({ targetId, count }: { targetId: string; count: number }) {
  const subscribe = useCallback(
    (fn: () => void) => {
      const row = document.getElementById(targetId);
      row?.addEventListener("scroll", fn, { passive: true });
      window.addEventListener("resize", fn);
      return () => {
        row?.removeEventListener("scroll", fn);
        window.removeEventListener("resize", fn);
      };
    },
    [targetId],
  );

  const getIndex = useCallback(() => {
    const row = document.getElementById(targetId);
    const card = row?.firstElementChild as HTMLElement | null;
    if (!row || !card) return 0;
    // The last card can't reach the snap start, so the scroll end counts as the last card.
    if (row.scrollLeft >= row.scrollWidth - row.clientWidth - 1) return count - 1;
    // Cards are separated by the 1px hairline gap.
    return Math.min(count - 1, Math.max(0, Math.round(row.scrollLeft / (card.offsetWidth + 1))));
  }, [targetId, count]);

  const active = useSyncExternalStore(subscribe, getIndex, () => 0);

  return (
    <div aria-hidden className="flex items-center gap-4 border-t border-line px-6 py-4 md:hidden">
      <p className="hud-label shrink-0 tabular-nums text-faint">
        <span className="text-ink">{pad(active + 1)}</span> / {pad(count)}
      </p>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={`h-px flex-1 transition-colors duration-300 ${i <= active ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

// Section frame: a hairline rule that draws across the page, crosshair ticks
// where it meets the side borders, and an optional sticky eyebrow bar.
export default function Section({
  id,
  index,
  title,
  side,
  children,
}: {
  id: string;
  index?: string;
  title?: string;
  side?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-choreo className="relative">
      <span aria-hidden data-draw-rule className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
      <div className="relative mx-auto max-w-[1280px] border-x border-line">
        <span aria-hidden data-draw-tick className="tick tick-half z-[31] -top-[5px] -left-[6px]" />
        <span aria-hidden data-draw-tick className="tick tick-half z-[31] -top-[5px] -right-[5px]" />
        {index && (
          <div data-draw-eyebrow className="sticky top-12 z-30 border-y border-line bg-bg/60 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-6 py-3 md:px-10">
              <p className="hud-label text-muted">
                <span className="text-faint">{index}</span>
                <span className="mx-2 text-faint">/</span>
                {title}
              </p>
              {side && <p className="hud-label hidden text-faint sm:block">{side}</p>}
            </div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// The thin header row on top of every grid cell: label left, number right.
export function CellHeader({ left, right, as: Tag = "p" }: { left: string; right: string; as?: "p" | "figcaption" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-2.5 md:px-8">
      <Tag className="hud-label text-muted">{left}</Tag>
      <p className="hud-label text-faint">{right}</p>
    </div>
  );
}

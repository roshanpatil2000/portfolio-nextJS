import { marquee } from "@/content/home";

export default function Marquee() {
  // The list renders twice so the -50% loop is seamless.
  const items = [...marquee, ...marquee];
  return (
    <div className="marquee border-t border-line">
      <ul className="marquee-track items-center">
        {items.map((label, i) => (
          <li
            key={i}
            aria-hidden={i >= marquee.length}
            className="hud-label flex items-center whitespace-nowrap px-6 py-3 text-muted"
          >
            <span aria-hidden className="mr-6 text-accent-ink">
              ▪
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { AnchorHTMLAttributes, ReactNode, SVGProps } from "react";

// Placeholder brand mark: two offset blades. Swap for your own logo.
export const LOGO_VIEWBOX = { w: 100, h: 90 };

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={`0 0 ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`} fill="currentColor" aria-hidden {...props}>
      <path d="M38 0h34L34 90H0z" />
      <path d="M78 26h22L76 90H54z" opacity={0.55} />
    </svg>
  );
}

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "solid" | "outline";
  size?: "sm" | "md";
  children: ReactNode;
};

export function Button({ variant = "solid", size = "md", className = "", children, ...rest }: ButtonProps) {
  const base =
    "group/btn relative inline-flex w-fit items-center justify-center gap-2 overflow-hidden rounded-none font-mono font-bold uppercase tracking-[0.12em] whitespace-nowrap transition-[opacity,color,border-color,background-color] duration-150";
  const sizes = { sm: "px-5 py-2 text-[11px]", md: "px-5 py-3 text-xs" };
  const variants = {
    solid: "bg-invert-bg text-invert-fg hover:opacity-80",
    outline: "border border-line-strong text-ink hover:border-ink hover:bg-ink/5",
  };
  return (
    <a data-cta className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}

// A section heading with an italic serif accent word, the site's signature move.
export function AccentHeading({
  as: Tag = "h2",
  lead,
  accent,
  tail = "",
  className = "",
  reveal = true,
}: {
  as?: "h1" | "h2";
  lead: string;
  accent: string;
  tail?: string;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <Tag {...(reveal ? { "data-reveal": true } : {})} className={className}>
      {lead} <span className="font-serif font-normal italic">{accent}</span>
      {tail}
    </Tag>
  );
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function DesktopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden {...props}>
      <rect x="3" y="4" width="18" height="12" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

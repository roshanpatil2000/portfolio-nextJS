import { ImageResponse } from "next/og";
import { brand, seo } from "@/content/home";

// The preview card shown when the site is shared (LinkedIn, X, Slack, chats).
export const alt = seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stack = ["React.js", "React Native", "Next.js", "TypeScript", "Tailwind CSS"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 78% 30%, #24324f 0%, #121316 55%)",
          color: "#f2f1ee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="50" viewBox="0 0 100 90" fill="#ffffff">
            <path d="M38 0h34L34 90H0z" />
            <path d="M78 26h22L76 90H54z" opacity={0.55} />
          </svg>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#f2f1ee99" }}>PORTFOLIO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{brand.name}</div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 20, color: "#f2f1eecc" }}>
            {`${seo.jobTitle} · ${seo.locality}, India`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {stack.map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "10px 20px",
                border: "1px solid #f2f1ee40",
                color: "#f2f1eedd",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

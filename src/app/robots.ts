import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site";

// Search and AI crawlers welcome everywhere except the admin page and API.
// AI bots are listed by name so the opt-in is explicit, not just implied by "*".
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

const disallow = ["/admin/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: aiCrawlers, allow: ["/", "/llms.txt"], disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}

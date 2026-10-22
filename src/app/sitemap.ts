import type { MetadataRoute } from "next";
import { seo } from "@/content/home";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: seo.updated, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/llms.txt"), lastModified: seo.updated, changeFrequency: "monthly", priority: 0.5 },
  ];
}

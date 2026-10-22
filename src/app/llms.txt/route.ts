import { brand, contact, experience, projects, seo, skills } from "@/content/home";
import { absoluteUrl } from "@/lib/site";

// /llms.txt: a plain-markdown profile for AI assistants and answer engines
// (https://llmstxt.org). Built from the same content as the page, at build time.
export function GET() {
  const lines = [
    `# ${brand.name}`,
    "",
    `> ${seo.summary}`,
    "",
    `- Role: ${seo.jobTitle}`,
    `- Location: ${seo.locality}, ${seo.region}, India`,
    `- Website: ${absoluteUrl("/")}`,
    `- Email: ${brand.email}`,
    `- GitHub: ${brand.links.github}`,
    `- LinkedIn: ${brand.links.linkedin}`,
    `- Status: ${contact.eyebrow}`,
    "",
    "## Experience",
    "",
    ...experience.roles.flatMap((r) => [
      `### ${r.role}, ${r.company} (${r.place}) — ${r.period}`,
      "",
      ...r.points.map((p) => `- ${p}`),
      "",
    ]),
    "## Projects",
    "",
    ...projects.items.flatMap((p) => [`### ${p.title} (${p.label})`, "", `Stack: ${p.stack.join(", ")}`, "", p.body, ""]),
    "## Skills",
    "",
    ...skills.groups.map((g) => `- ${g.key}: ${g.items.join(", ")}`),
    "",
    "## Highlights",
    "",
    ...experience.stats.map((s) => `- ${s.value}${s.unit} ${s.label.toLowerCase()}`),
    "",
    "## Education",
    "",
    ...experience.education.map((e) => `- ${e.degree}, ${e.school} (${e.year})`),
    "",
    "## Links",
    "",
    `- [Portfolio](${absoluteUrl("/")}): projects, experience and skills`,
    `- [Resume (PDF)](${absoluteUrl(brand.resume)}): downloadable resume`,
    `- [GitHub](${brand.links.github})`,
    `- [LinkedIn](${brand.links.linkedin})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

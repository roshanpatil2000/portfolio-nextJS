import { brand, experience, projects, seo, skills } from "@/content/home";
import { absoluteUrl, siteUrl } from "@/lib/site";

// schema.org JSON-LD describing who this site is about. Search engines use it
// for rich results; AI assistants use it to answer "who is Roshan Patil".
// Everything is derived from src/content/home.ts so it never drifts from the page.
export default function StructuredData() {
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const current = experience.roles[0];

  const graph = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: absoluteUrl("/"),
      name: brand.name,
      description: seo.description,
      inLanguage: "en",
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: absoluteUrl("/"),
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
      dateModified: seo.updated,
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": personId,
      name: brand.name,
      givenName: seo.givenName,
      familyName: seo.familyName,
      jobTitle: seo.jobTitle,
      description: seo.summary,
      url: absoluteUrl("/"),
      image: absoluteUrl("/opengraph-image"),
      email: `mailto:${brand.email}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: seo.locality,
        addressRegion: seo.region,
        addressCountry: seo.country,
      },
      sameAs: [brand.links.github, brand.links.linkedin],
      worksFor: { "@type": "Organization", name: current.company },
      hasOccupation: {
        "@type": "Occupation",
        name: seo.jobTitle,
        occupationLocation: { "@type": "City", name: seo.locality },
        skills: skills.groups.flatMap((g) => g.items).join(", "),
      },
      alumniOf: experience.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
      hasCredential: experience.education.map((e) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: e.degree,
        recognizedBy: { "@type": "CollegeOrUniversity", name: e.school },
        dateCreated: e.year,
      })),
      knowsAbout: skills.groups.flatMap((g) => g.items),
      knowsLanguage: ["en"],
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#projects`,
      name: `Projects by ${brand.name}`,
      itemListElement: projects.items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.title,
          description: p.body,
          genre: p.label,
          keywords: p.stack.join(", "),
          creator: { "@id": personId },
        },
      })),
    },
  ];

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

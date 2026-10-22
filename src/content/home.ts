// All copy and media for the portfolio. Edit here; components only render it.
// A media item is either a real video/image in /public or a generative
// placeholder (procedural canvas art keyed by a seed).

import type { Skill } from "@/lib/skillTiles";

export type Media =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "generative"; seed: number }
  | ({ kind: "skill" } & Skill);

export const brand = {
  name: "Roshan Patil",
  wordmark: "ROSHAN",
  tagline: "Frontend Developer",
  description:
    "Frontend developer with 4 years of experience building web and mobile apps with React, React Native and Next.js.",
  email: "roshanpatil2912.rp@gmail.com",
  location: "Mumbai, India",
  links: {
    github: "https://github.com/roshanpatil2000",
    linkedin: "https://www.linkedin.com/in/patil-roshan/",
  },
  // Served by app/resume/route.ts from private storage; replace it at /admin/resume.
  resume: "/resume",
  resumeFileName: "ROSHAN_PATIL_FRONTEND.pdf",
};

// Search and AI-answer metadata. `summary` is the one-paragraph, third-person
// bio that search snippets and AI assistants are most likely to quote.
export const seo = {
  title: "Roshan Patil — Frontend Developer (React, React Native, Next.js)",
  description:
    "Roshan Patil is a frontend developer in Mumbai, India with 4 years of experience building web and mobile apps with React, React Native, Next.js and TypeScript.",
  summary:
    "Roshan Patil is a frontend developer based in Mumbai, India, with 4 years of experience building web and mobile applications with React.js, React Native, Next.js and TypeScript. Roshan is an Associate Software Developer at Nimap Infotech, shipping frontend features across 6+ client projects, including a Flutter-to-React-Native rewrite of the Novio credit card app, and holds an MCA from Amrita Vishwa Vidyapeetham.",
  givenName: "Roshan",
  familyName: "Patil",
  jobTitle: "Frontend Developer",
  locality: "Mumbai",
  region: "Maharashtra",
  country: "IN",
  keywords: [
    "Roshan Patil",
    "frontend developer",
    "React developer",
    "React Native developer",
    "Next.js developer",
    "TypeScript",
    "frontend developer Mumbai",
    "portfolio",
  ],
  // Bump when the content changes meaningfully; feeds sitemap lastModified.
  updated: "2026-10-22",
};

export const nav = {
  links: [
    { label: "Home", href: "#hero", active: true },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Contact", href: "#contact" },
  ],
  secondary: [
    { label: "GitHub", href: brand.links.github },
    { label: "Resume", href: brand.resume, download: brand.resumeFileName },
  ],
  cta: { label: "Hire me", href: `mailto:${brand.email}` },
};

export const hero = {
  headline: "Frontend developer",
  headlineAccent: "crafting interfaces.",
  sub: "I build fast, reusable UI for web and mobile with React, React Native and Next.js — 4 years, 6+ client products.",
  primary: { label: "View projects", href: "#projects" },
  secondary: { label: "Get in touch", href: "#contact" },
  meta: ["GitHub", brand.location, "React · React Native · Next.js"],
};

export const marquee = [
  "React.js",
  "React Native",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Redux",
  "Zustand",
  "Expo",
  "Vitest",
  "Agentic AI workflows",
];

// Pool the hero galaxy draws its cards from: one tile per skill. `icon` keys
// come from src/lib/skillTiles.ts; skills without a logo get a monogram.
const skillTiles: Skill[] = [
  // Languages
  { name: "JavaScript", icon: "javascript" },
  { name: "TypeScript", icon: "typescript" },
  { name: "HTML5", icon: "html5" },
  { name: "CSS3", icon: "css" },
  // Frameworks
  { name: "React.js", icon: "react" },
  { name: "React Native", icon: "react" },
  { name: "Next.js", icon: "nextjs" },
  { name: "Expo", icon: "expo" },
  { name: "Tailwind CSS", icon: "tailwind" },
  // UI libraries and state
  { name: "Ant Design", icon: "antdesign" },
  { name: "Bootstrap", icon: "bootstrap" },
  { name: "Redux", icon: "redux" },
  { name: "Zustand", mono: "Zu", color: "c98b3a" },
];

export const galaxyMedia: Media[] = skillTiles.map((s) => ({ kind: "skill", ...s }));

export const projects = {
  index: "01",
  title: "Selected projects",
  side: "Web · Mobile · AI-assisted",
  heading: "Products I've",
  headingAccent: "helped ship",
  headingTail: ".",
  sub: "Client work across fintech, enterprise, travel and edtech — from greenfield rewrites to design-system-driven features.",
  items: [
    {
      label: "Fintech · Mobile",
      title: "Novio Credit Card",
      stack: ["React Native", "Claude Code", "Figma"],
      body: "Rebuilt a credit card app from Flutter to React Native from scratch, with full functional parity. Set up an AI-assisted workflow — custom skills, agents and rules — that pulled screens straight from Figma and kept generated code inside the design system.",
      media: { kind: "generative", seed: 21 } as Media,
    },
    {
      label: "AI · Web",
      title: "DemoKraft AI",
      stack: ["React.js"],
      body: "Built interfaces for an AI platform that turns products into videos, guides and GIFs. Reusable components and content-creation workflows that keep the app modular.",
      media: { kind: "generative", seed: 22 } as Media,
    },
    {
      label: "Enterprise · Web + Mobile",
      title: "KPMG EAM",
      stack: ["React.js", "React Native"],
      body: "Web and mobile interfaces for an enterprise asset management product — asset lifecycle views, responsive layouts and API-driven screens across both platforms.",
      media: { kind: "generative", seed: 23 } as Media,
    },
    {
      label: "Travel · Mobile",
      title: "Lugbee",
      stack: ["React Native"],
      body: "Mobile app that helps travellers find and book secure luggage storage nearby. Built the discovery and booking flows with reusable components and API integration.",
      media: { kind: "generative", seed: 24 } as Media,
    },
    {
      label: "Edtech · Web",
      title: "TopperLearning",
      stack: ["HTML", "CSS", "JavaScript", "SEO"],
      body: "Responsive, content-rich pages for a Grades 1–12 learning platform. Semantic, mobile-first markup and SEO work that lifted organic traffic by 20%.",
      media: { kind: "generative", seed: 25 } as Media,
    },
  ],
  more: {
    label: "More",
    title: "See more on GitHub",
    body: "Experiments, side projects and open-source contributions.",
    href: brand.links.github,
  },
};

export const experience = {
  index: "02",
  title: "Experience",
  side: "4 years · 2 companies",
  heading: "Where I've",
  headingAccent: "been building",
  headingTail: ".",
  stats: [
    { value: "4", unit: "yrs", label: "Frontend experience" },
    { value: "6+", unit: "", label: "Client projects shipped" },
    { value: "~30", unit: "%", label: "Fewer production bugs with TDD" },
    { value: "+20", unit: "%", label: "Organic traffic from SEO work" },
  ],
  roles: [
    {
      key: "A",
      period: "Dec 2023 — Present",
      role: "Associate Software Developer",
      company: "Nimap Infotech",
      place: "Mumbai",
      points: [
        "Build reusable components and responsive interfaces for client web and mobile apps with React, Next.js, React Native, TypeScript, Tailwind, Redux and Zustand.",
        "Turn business requirements and designs into production features across 6+ client projects.",
        "Shape frontend architecture and state management, and integrate REST APIs with backend, design and QA teams.",
      ],
    },
    {
      key: "B",
      period: "Oct 2022 — Dec 2023",
      role: "Assistant Software Developer",
      company: "VAA Technologies",
      place: "Boisar",
      points: [
        "Built React interfaces and integrated REST APIs with cross-functional teams.",
        "Connected custom React components to Builder.io so editors could reuse them across pages.",
        "Introduced test-driven development with Vitest, cutting production bugs by ~30%.",
      ],
    },
  ],
  education: [
    { school: "Amrita Vishwa Vidyapeetham, Coimbatore", degree: "MCA", year: "2023" },
    { school: "S.D.S.M. College, Palghar", degree: "B.Sc Computer Science", year: "2021" },
  ],
};

export const skills = {
  index: "03",
  title: "Skills",
  side: "Toolbox",
  heading: "The",
  headingAccent: "toolbox",
  headingTail: " I reach for.",
  groups: [
    { key: "Languages", items: ["JavaScript", "TypeScript", "HTML5", "CSS3"] },
    { key: "Frontend", items: ["React.js", "React Native", "Next.js", "Expo", "Tailwind CSS", "Ant Design", "Bootstrap"] },
    { key: "State", items: ["Redux", "Zustand"] },
    { key: "Testing", items: ["Vitest", "Test-driven development"] },
    { key: "Tools", items: ["Git", "VS Code", "Cursor", "Builder.io", "Claude Code"] },
    { key: "Also", items: ["REST APIs", "OAuth", "Web Workers", "i18n", "Agentic AI workflows"] },
  ],
};

export const contact = {
  eyebrow: "Open to new opportunities",
  heading: "Let's build",
  headingAccent: "something",
  headingTail: " together.",
  sub: "Have a product to ship or a team that needs a frontend developer? My inbox is open.",
  primary: { label: "Email me", href: `mailto:${brand.email}` },
  secondary: { label: "Download resume", href: brand.resume },
};

export const sectionIndex = [
  { id: "hero", label: brand.wordmark },
  { id: "projects", label: "PROJECTS" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "skills", label: "SKILLS" },
  { id: "contact", label: "CONTACT" },
];

export const footer = {
  // Third-person and factual on purpose: it's the line answer engines quote.
  blurb:
    "Roshan Patil is a frontend developer in Mumbai, India, building web and mobile products with React, React Native and Next.js.",
  columns: [
    {
      title: "Sections",
      links: [
        { label: "Projects", href: "#projects" },
        { label: "Experience", href: "#experience" },
        { label: "Skills", href: "#skills" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Elsewhere",
      links: [
        { label: "GitHub", href: brand.links.github },
        { label: "LinkedIn", href: brand.links.linkedin },
        { label: "Email", href: `mailto:${brand.email}` },
      ],
    },
  ],
};

// All copy and media for the homepage. Rename the brand or swap media here.
// A media item is either a real video in /public/videos or a generative
// placeholder (procedural canvas art keyed by a seed).

export type Media =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "generative"; seed: number };

export const brand = {
  name: "Studio",
  wordmark: "STUDIO",
  tagline: "Controllable tools for creators",
  description:
    "An open-source studio for controllable image and video creation.",
  email: "hello@example.com",
};

export const nav = {
  links: [
    { label: "Home", href: "/", active: true },
    { label: "Image", href: "#" },
    { label: "Video", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Download", href: "#start" },
    { label: "Support", href: "#" },
  ],
  secondary: [
    { label: "Apps", href: "#" },
    { label: "Pricing", href: "#" },
  ],
  cta: { label: "Launch app", href: "#start" },
};

export const hero = {
  headline: "Capable tools",
  headlineAccent: "for creators.",
  sub: "We build open source tools for creative people. Freedom of control and expression comes first.",
  primary: { label: "Download free", href: "#start" },
  secondary: { label: "Use on web", href: "#start" },
  meta: ["Open source on GitHub", "macOS · Windows · Web", "No subscription required"],
};

export const marquee = [
  "Scene builder",
  "Depth compositing",
  "Character posing",
  "Image to mesh",
  "Background removal",
  "Layered control",
  "Mixed assets",
  "Location lock",
];

// Pool the hero galaxy draws its cards from.
export const galaxyMedia: Media[] = Array.from({ length: 14 }, (_, i) => ({
  kind: "generative" as const,
  seed: i + 1,
}));

export const features = {
  index: "01",
  title: "Crafting features",
  side: "Real output — captured in the studio",
  heading: "The control that",
  headingAccent: "mere words",
  headingTail: "cannot buy.",
  sub: "Text prompting is neat, but creators crave control. Compose the shot yourself — then let the model render it.",
  items: [
    {
      label: "Worlds",
      title: "Image to location",
      body: "Place virtual actors into physical environments. Keep a single location consistent and film multiple shots without things disappearing.",
      media: { kind: "generative", seed: 21 } as Media,
    },
    {
      label: "3D compositing",
      title: "Build scenes with depth",
      body: "Use images, backdrops, foreground elements and props in scenes with real depth. A couple of images blend into a finished composition.",
      media: { kind: "generative", seed: 22 } as Media,
    },
    {
      label: "2D compositing",
      title: "Precise layered control",
      body: "Combine images, background removal, layers and simple drawing tools to compose a scene exactly the way you imagined it.",
      media: { kind: "generative", seed: 23 } as Media,
    },
    {
      label: "3D mesh",
      title: "Image to 3D mesh",
      body: "Turning images into 3D helps position elements exactly. Block complex scenes with intentional geometry instead of fighting prompts.",
      media: { kind: "generative", seed: 24 } as Media,
    },
    {
      label: "Mixed assets",
      title: "Mix every kind of asset",
      body: "Combine image cutouts, worlds and 3D meshes in one canvas to lay out scenes with precision and intention.",
      media: { kind: "generative", seed: 25 } as Media,
    },
    {
      label: "Posing",
      title: "Character posing",
      body: "Pose your characters to nail the character, scene and camera blocking before calling “action”.",
      media: { kind: "generative", seed: 26 } as Media,
    },
    {
      label: "Cutouts",
      title: "Background removal",
      body: "Get clean cutouts in one click, ready to drop into any composition.",
      media: { kind: "generative", seed: 27 } as Media,
    },
  ],
  more: {
    label: "And more",
    title: "See every tool",
    body: "Tutorials, guides and the full feature list.",
    href: "#",
  },
};

export const ownership = {
  index: "02",
  title: "Ownership",
  side: "Free & open source",
  heading: "Owning, not",
  headingAccent: "renting",
  headingTail: ".",
  sub: "The studio is yours to own and keep, forever. No lock-in, no aggregator markup, no surprises.",
  items: [
    {
      key: "A",
      title: "Open source",
      body: "The whole studio is on GitHub. Read it, fork it, build on it.",
      cta: { label: "View source", href: "#" },
    },
    {
      key: "B",
      title: "Yours forever",
      body: "Download once and keep it. Your projects and renders stay on your machine.",
    },
    {
      key: "C",
      title: "No middleman",
      body: "No aggregator between you and the models. Bring your own keys and pay providers directly.",
    },
  ],
};

export const community = {
  index: "03",
  title: "Community",
  side: "From the community",
  heading: "Made",
  headingAccent: "with",
  headingTail: " the studio.",
  // Set youtubeId to a real video to enable click-to-play.
  items: [
    { caption: "Community film", title: "Short film one", youtubeId: "", seed: 31 },
    { caption: "Community film", title: "Short film two", youtubeId: "", seed: 32 },
    { caption: "Community film", title: "Short film three", youtubeId: "", seed: 33 },
  ],
};

export const start = {
  eyebrow: "Free to start · No subscription",
  heading: "Start",
  headingAccent: "crafting",
  headingTail: " today.",
  sub: "Download the studio, or run it in your browser. Your first renders are minutes away.",
  primary: { label: "Download for desktop", href: "#" },
  secondary: { label: "Launch in browser", href: "#" },
};

// Sections the right-edge rail tracks, in page order. The hero entry is
// represented by the wordmark itself.
export const sectionIndex = [
  { id: "hero", label: brand.wordmark },
  { id: "features", label: "FEATURES" },
  { id: "ownership", label: "OWNERSHIP" },
  { id: "made-with", label: "COMMUNITY" },
  { id: "start", label: "GET STARTED" },
];

export const footer = {
  blurb: "The open-source studio for controllable image and video.",
  columns: [
    { title: "Product", links: ["Download", "Pricing", "Launch app"] },
    { title: "Apps", links: ["All apps", "Photo", "Vector", "Film", "Light"] },
    { title: "Resources", links: ["Tutorials", "News", "FAQ", "Press kit", "Support"] },
    { title: "Community", links: ["Discord", "GitHub", "YouTube", "Instagram"] },
  ],
};

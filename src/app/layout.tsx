import type { Metadata } from "next";
import { Archivo, Geist_Mono, Instrument_Serif, Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { brand, seo } from "@/content/home";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MixpanelTracker from "@/components/MixpanelTracker";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seo.title, template: `%s — ${brand.name}` },
  description: seo.description,
  applicationName: brand.name,
  keywords: seo.keywords,
  authors: [{ name: brand.name, url: siteUrl }],
  creator: brand.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: brand.name,
    title: seo.title,
    description: seo.description,
    locale: "en_IN",
    firstName: seo.givenName,
    lastName: seo.familyName,
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "technology",
};

// Runs before paint so the stored theme never flashes.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;else document.documentElement.dataset.theme="dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${inter.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="Profile for AI assistants" />
      </head>
      <body>
        <SmoothScroll>
          {/* debug off: their dev logs would flood the terminal (browserToTerminal) */}
          <Analytics debug={false} />
          <SpeedInsights debug={false} />
          <MixpanelTracker />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

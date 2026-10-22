import type { Metadata } from "next";
import Link from "next/link";
import ResumeUploader from "./ResumeUploader";

// Unlisted and unindexed. The page is just a form: without the admin token
// the API behind it refuses every upload.
export const metadata: Metadata = {
  title: "Update resume",
  robots: { index: false, follow: false },
};

export default function ResumeAdminPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
      <p className="hud-label text-faint">Admin</p>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] text-ink-strong">
        Update <span className="font-serif font-normal italic">resume</span>
      </h1>
      <p className="mt-3 text-muted">
        Replaces the PDF behind every “Resume” button on the site. Changes show up within a minute.
      </p>
      <ResumeUploader />
      <Link href="/" className="hud-label mt-10 text-faint transition-colors hover:text-ink">
        ← Back to site
      </Link>
    </main>
  );
}

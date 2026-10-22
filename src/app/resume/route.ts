import { connection } from "next/server";
import { RESUME_FILE_NAME, readResume } from "@/lib/resumeStore";

// Public download of whatever resume was uploaded last.
export async function GET() {
  // Always read at request time; never prerender a copy at build.
  await connection();
  const resume = await readResume();
  if (!resume) {
    return new Response("Resume not uploaded yet.", { status: 404, headers: { "Content-Type": "text/plain" } });
  }
  return new Response(resume.body as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(resume.size),
      "Content-Disposition": `attachment; filename="${RESUME_FILE_NAME}"`,
      "Last-Modified": resume.uploadedAt.toUTCString(),
      // Short CDN cache so a new upload shows up within a minute.
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=60",
      "X-Content-Type-Options": "nosniff",
      // Downloadable, but kept out of search results: the PDF carries personal
      // details (like a phone number) that shouldn't surface in snippets.
      "X-Robots-Tag": "noindex",
    },
  });
}

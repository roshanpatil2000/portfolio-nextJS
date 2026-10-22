// Where the current resume lives. On Vercel it's a *private* Blob (no public
// URL; only the /resume route can read it). In local dev without a Blob token
// it falls back to a git-ignored file so the upload flow still works.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

const BLOB_PATH = "resume/current.pdf";
const DEV_FILE = path.join(process.cwd(), ".data", "resume.pdf");

export const RESUME_FILE_NAME = "ROSHAN_PATIL_FRONTEND.pdf";
export const RESUME_MAX_BYTES = 4 * 1024 * 1024; // Vercel caps function request bodies at 4.5 MB

type Stored = { body: ReadableStream<Uint8Array> | Uint8Array; size: number; uploadedAt: Date };

function mode(): "blob" | "disk" {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.NODE_ENV !== "production") return "disk";
  throw new Error("BLOB_READ_WRITE_TOKEN is not set; connect a Vercel Blob store to this project.");
}

export async function readResume(): Promise<Stored | null> {
  if (mode() === "blob") {
    const res = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    return { body: res.stream, size: res.blob.size, uploadedAt: res.blob.uploadedAt };
  }
  try {
    const [buf, info] = await Promise.all([readFile(DEV_FILE), stat(DEV_FILE)]);
    return { body: new Uint8Array(buf), size: buf.byteLength, uploadedAt: info.mtime };
  } catch {
    return null;
  }
}

export async function writeResume(pdf: Uint8Array): Promise<{ size: number; uploadedAt: Date }> {
  if (mode() === "blob") {
    await put(BLOB_PATH, Buffer.from(pdf), {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return { size: pdf.byteLength, uploadedAt: new Date() };
  }
  await mkdir(path.dirname(DEV_FILE), { recursive: true });
  await writeFile(DEV_FILE, pdf);
  return { size: pdf.byteLength, uploadedAt: new Date() };
}

// Every PDF starts with "%PDF-"; checking the bytes beats trusting the
// browser-supplied MIME type.
export function looksLikePdf(bytes: Uint8Array) {
  return bytes.length > 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}

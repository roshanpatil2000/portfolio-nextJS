import { checkAdmin } from "@/lib/adminAuth";
import { RESUME_MAX_BYTES, looksLikePdf, writeResume } from "@/lib/resumeStore";

// Replace the resume. Admin-only: needs `Authorization: Bearer <RESUME_ADMIN_TOKEN>`
// and a multipart body with the PDF in a `file` field.
export async function POST(request: Request) {
  const auth = checkAdmin(request);
  if (!auth.ok) {
    return Response.json(
      { error: auth.error },
      { status: auth.status, headers: auth.status === 401 ? { "WWW-Authenticate": "Bearer" } : undefined },
    );
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "Send the PDF as multipart/form-data in a `file` field." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file received in the `file` field." }, { status: 400 });
  }
  if (file.size > RESUME_MAX_BYTES) {
    return Response.json({ error: `File is too large (max ${RESUME_MAX_BYTES / 1024 / 1024} MB).` }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikePdf(bytes)) {
    return Response.json({ error: "That file isn't a PDF." }, { status: 415 });
  }

  try {
    const saved = await writeResume(bytes);
    return Response.json({ ok: true, size: saved.size, uploadedAt: saved.uploadedAt.toISOString() });
  } catch (err) {
    console.error("Resume upload failed", err);
    return Response.json({ error: "Storage failed; check the server logs." }, { status: 500 });
  }
}

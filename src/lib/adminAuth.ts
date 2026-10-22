// Bearer-token check for admin-only API routes. Fails closed: if the secret
// isn't configured (or is too short to be safe), nobody gets in.
import { createHash, timingSafeEqual } from "node:crypto";

const MIN_SECRET_LENGTH = 24;

export type AuthResult = { ok: true } | { ok: false; status: 401 | 503; error: string };

const digest = (s: string) => createHash("sha256").update(s).digest();

export function checkAdmin(request: Request): AuthResult {
  const secret = process.env.RESUME_ADMIN_TOKEN ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    return { ok: false, status: 503, error: "Uploads are disabled: RESUME_ADMIN_TOKEN is not configured." };
  }
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  // Compare fixed-length digests so the check takes the same time whatever
  // the token, and mismatched lengths don't leak anything.
  if (!token || !timingSafeEqual(digest(token), digest(secret))) {
    return { ok: false, status: 401, error: "Invalid or missing token." };
  }
  return { ok: true };
}

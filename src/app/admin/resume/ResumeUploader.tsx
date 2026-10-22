"use client";

import { useState, type FormEvent } from "react";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

const MAX_MB = 4;

export default function ResumeUploader() {
  const [token, setToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setStatus({ kind: "error", text: `That file is over ${MAX_MB} MB.` });
      return;
    }
    setStatus({ kind: "busy" });
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token.trim()}` },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "error", text: data.error ?? `Upload failed (${res.status}).` });
        return;
      }
      setStatus({ kind: "ok", text: `Uploaded ${(data.size / 1024).toFixed(0)} KB. The site now serves this resume.` });
    } catch {
      setStatus({ kind: "error", text: "Network error; try again." });
    }
  };

  const field = "mt-2 w-full border border-line bg-bg-raised px-3 py-2.5 text-ink outline-none transition-colors focus:border-ink";

  return (
    <form onSubmit={submit} className="mt-10 flex flex-col gap-6">
      <label className="block">
        <span className="hud-label text-muted">Admin token</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className={field}
        />
      </label>
      <label className="block">
        <span className="hud-label text-muted">Resume PDF (max {MAX_MB} MB)</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={`${field} file:mr-3 file:border-0 file:bg-invert-bg file:px-3 file:py-1 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.12em] file:text-invert-fg`}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.kind === "busy" || !file || !token}
          className="inline-flex items-center gap-2 bg-invert-bg px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-invert-fg transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {status.kind === "busy" ? "Uploading…" : "Upload resume"}
        </button>
        <a href="/resume" className="hud-label text-faint transition-colors hover:text-ink">
          Download current
        </a>
      </div>
      {(status.kind === "ok" || status.kind === "error") && (
        <p role="status" className={status.kind === "ok" ? "text-accent-ink" : "text-[#ff6259]"}>
          {status.text}
        </p>
      )}
    </form>
  );
}

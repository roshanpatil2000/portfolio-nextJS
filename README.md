# Roshan Patil — Portfolio

Personal portfolio of Roshan Patil, a frontend developer working with React, React Native and Next.js.

The hero is an interactive WebGL "galaxy" of skill tiles drifting on spiral arms. A section index rides the ruler on the right edge as you scroll, and content reveals with drawn hairlines and a blur fade-up. The resume behind the download buttons can be replaced from a private admin page without redeploying.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) and React 19
- Tailwind CSS v4
- [GSAP](https://gsap.com) + ScrollTrigger for the scroll choreography
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- three.js via [React Three Fiber](https://r3f.docs.pmnd.rs) for the hero galaxy
- [simple-icons](https://simpleicons.org) for the skill logos
- [Vercel Blob](https://vercel.com/docs/vercel-blob) for resume storage

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in RESUME_ADMIN_TOKEN
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment variables

| Variable | Needed for | Where it comes from |
| --- | --- | --- |
| `RESUME_ADMIN_TOKEN` | Uploading a new resume | **You create it.** Any random string of 24+ characters, e.g. `openssl rand -base64 32`. It's the password you type on `/admin/resume`. |
| `BLOB_READ_WRITE_TOKEN` | Storing and serving the resume on Vercel | Added automatically when you connect a Vercel Blob store. |
| `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY` | — | Also added by Vercel Blob. Not used by this code; leave them alone. |

Never paste a `BLOB_*` value into the admin page; it only takes `RESUME_ADMIN_TOKEN`.

Without `BLOB_READ_WRITE_TOKEN` (local dev), the resume is stored in `.data/resume.pdf`, which git ignores. In production it's required.

## Editing content

All copy lives in [`src/content/home.ts`](src/content/home.ts). Components only render it.

- **`brand`:** name, wordmark, email, GitHub/LinkedIn links, resume download name.
- **`hero`, `projects`, `experience`, `skills`, `contact`:** section copy.
- **`skillTiles`:** the skills shown as tiles in the hero galaxy. `icon` keys map to logos in [`src/lib/skillTiles.ts`](src/lib/skillTiles.ts); a skill without a logo uses `mono` and `color` for a lettered tile.
- **`sectionIndex`:** the labels that ride the right-edge ruler.
- **Project media:** generated placeholder art by default. Set a project's `media` to `{ kind: "video", src: "/your-clip.mp4" }` to use real footage from `public/`.

## Updating the resume

The site's Resume buttons download from `/resume`, which always serves the latest upload as `ROSHAN_PATIL_FRONTEND.pdf`.

**From the browser:** open `/admin/resume` (unlisted, not indexed), enter `RESUME_ADMIN_TOKEN`, pick a PDF and upload.

**From a terminal:**

```bash
curl -H "Authorization: Bearer $RESUME_ADMIN_TOKEN" \
  -F file=@ROSHAN_PATIL_FRONTEND.pdf \
  https://your-site.vercel.app/api/resume
```

How it's protected:

- `POST /api/resume` requires the bearer token. The comparison is constant-time, and uploads are refused outright if the token isn't configured or is shorter than 24 characters.
- Only real PDFs (checked by their `%PDF-` header) up to 4 MB are accepted.
- On Vercel the file is a **private** Blob with no public URL; `/resume` is the only way to read it.
- There's no read or list endpoint on `/api/resume`.

After an upload the CDN may serve the previous file for up to a minute.

## Deploying to Vercel

1. Import the repository into Vercel.
2. Under **Storage**, create a Blob store and connect it to the project. This adds the `BLOB_*` variables.
3. Under **Settings → Environment Variables**, add `RESUME_ADMIN_TOKEN` (Production, marked Sensitive). Keep a copy in your password manager; Vercel won't show it again.
4. Redeploy so the variables take effect.
5. Open `/admin/resume` on the live site and upload your resume once. Until then `/resume` returns 404.

## Project structure

```
src/
  app/
    page.tsx                  homepage
    resume/route.ts           GET: download the current resume
    api/resume/route.ts       POST: replace the resume (token-protected)
    admin/resume/             unlisted upload page
  components/
    hero/                     galaxy (WebGL), wordmark intro, shaders, galaxy tuning
    rail/                     right-edge ruler and riding section labels
    Choreography.tsx          data-attribute scroll reveals
    ProjectGrid, Experience, Skills, Contact, Nav, Footer, ...
  content/home.ts             all site copy
  lib/
    resumeStore.ts            Blob storage (disk in dev)
    adminAuth.ts              bearer-token check
    skillTiles.ts             skill logo tiles
    generative.ts             placeholder art
```

## Tuning the motion

- **Hero galaxy:** [`src/components/hero/galaxyConfig.ts`](src/components/hero/galaxyConfig.ts) (arm count, card count, speed, blur, pointer effects, guide lines).
- **Ruler and section labels:** [`src/components/rail/railConfig.ts`](src/components/rail/railConfig.ts) (flip line, label sizes, stagger, snap timing).
- **Intro timing:** [`src/components/intro/clock.ts`](src/components/intro/clock.ts).

Everything respects `prefers-reduced-motion`: reveals are skipped, the galaxy holds still, and the section index becomes a plain list.

## Credits

Visual design and motion inspired by [getartcraft.com](https://getartcraft.com). Skill logos from [simple-icons](https://simpleicons.org) (CC0).

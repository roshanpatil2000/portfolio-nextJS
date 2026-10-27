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
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Mixpanel analytics | Optional. Your Mixpanel project token (Project settings → Access keys). It's public by design; leave empty to disable tracking. |
| `NEXT_PUBLIC_MIXPANEL_API_HOST` | Mixpanel region | Optional. Defaults to US (`https://api.mixpanel.com`). Use `https://api-eu.mixpanel.com` or `https://api-in.mixpanel.com` for EU or India projects. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, structured data | Optional. Set it once you have a custom domain (e.g. `https://roshanpatil.dev`). Without it, Vercel's production URL is used. |

Never paste a `BLOB_*` value into the admin page; it only takes `RESUME_ADMIN_TOKEN`.

Without `BLOB_READ_WRITE_TOKEN` (local dev), the resume is stored in `.data/resume.pdf`, which git ignores. In production it's required.

## Editing content

All copy lives in [`src/content/home.ts`](src/content/home.ts). Components only render it.

- **`brand`:** name, wordmark, email, GitHub/LinkedIn links, resume download name.
- **`seo`:** page title, description, the third-person bio used by search and AI, keywords, last-updated date.
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

## Analytics

- **Vercel Analytics and Speed Insights:** page views and Core Web Vitals, on automatically when deployed to Vercel.
- **Mixpanel:** product analytics, session replay and heatmaps. Set up in [`src/lib/analytics.ts`](src/lib/analytics.ts) and [`src/components/MixpanelTracker.tsx`](src/components/MixpanelTracker.tsx). Events go to the US endpoint (`api.mixpanel.com`) by default; set `NEXT_PUBLIC_MIXPANEL_API_HOST` if the project lives in another region. A mismatch drops events silently. Only Mixpanel's own `$mp_session_record` entries show up, never your events.

### Tracking plan

Event names are snake_case. Clicks, inputs and rage clicks are autocaptured; Mixpanel's own page views are off because `page_view` replaces them.

| Event | Properties | Fired when |
| --- | --- | --- |
| `page_view` | `page_location` | Every page load |
| `contact_intent_submitted` | `intent_type` (`hiring_inquiry`), `landing_page`, `cta_location` | An email link is clicked ("Email me", "Hire me", the address) |
| `resume_download` | `file_name`, `download_location` (`nav`, `contact`), `page_location` | Any Resume button is clicked |
| `content_engaged` | `content_type`, `content_id`, `engagement_action` | A section holds the middle of the screen for 2 s (`portfolio_section` / `viewed`), a project card is 60% on screen for 1.5 s (`project` / `viewed`), the page is half scrolled (`portfolio` / `scrolled_50`). Each fires once per visit; scrolling or jumping past content doesn't count |
| `session_returned` | `return_window_days`, `return_landing_page`, `engaged_feature_on_return` | A visitor returns 1+ days after their last visit; sent as that visit ends. "Engaged" means they contacted you or downloaded the resume |

Supporting UI events: `internal_link_clicked`, `outbound_link_clicked` (`destination`: github, linkedin, …), `skill_tile_clicked`, `theme_changed`.

Click events carry a `location`: the section the click came from (`hero`, `projects`, `contact`, …), or `nav`, `footer`, `rail` (desktop ruler labels) or `mobile_menu` (the phone menu).

**Attribution (on every event as super properties):**

- `landing_source`: first-touch channel: `utm_source`, or from the referrer (`organic_search`, `linkedin`, `github`, `twitter`, `ai_assistant`, `referral`, `direct`). Paid UTMs (`utm_medium=cpc`) become `paid_search` / `paid_<source>`.
- `campaign_id`: first-touch `utm_campaign`.
- `audience_segment`: only from links you share. Add `?audience=recruiter` (or `utm_audience=`) to a link and every event from that visitor carries it. E.g. `https://your-site/?utm_source=linkedin&utm_campaign=job_hunt&audience=recruiter`.

Properties with no value are omitted, never sent as `null` or `"unknown"`.

To add an event, add a typed helper in `src/lib/analytics.ts`. Links need nothing: they're classified automatically.

Privacy: session replays mask everything typed into inputs, and the `/admin` page is never initialised, tracked or recorded.

Data quality: headless and automated browsers (Vercel's deploy checks, crawlers, Lighthouse) aren't tracked, and clicks on the resume and email links aren't reported as dead clicks, since downloading a file or opening mail never changes the page. View timing lives in `SECTION_VIEW` / `PROJECT_VIEW` in `src/components/MixpanelTracker.tsx`.

## SEO and AI discoverability

The site is set up for both search engines (SEO) and AI answer engines like ChatGPT, Claude and Perplexity (GEO). Everything is generated from `src/content/home.ts`, so it stays in sync with the page.

| What | Where | Why |
| --- | --- | --- |
| Title, description, Open Graph, Twitter card, canonical URL | `metadata` in [`src/app/layout.tsx`](src/app/layout.tsx), copy in `seo` | Search snippets and link previews |
| Share image (1200×630) | [`src/app/opengraph-image.tsx`](src/app/opengraph-image.tsx) | Preview card on LinkedIn, X, Slack, chats |
| JSON-LD structured data | [`src/components/StructuredData.tsx`](src/components/StructuredData.tsx) | `Person` (job, employer, education, skills, GitHub/LinkedIn), `ProfilePage`, `WebSite` and an `ItemList` of projects |
| `/llms.txt` | [`src/app/llms.txt/route.ts`](src/app/llms.txt/route.ts) | Plain-markdown profile for AI assistants ([llmstxt.org](https://llmstxt.org)); linked from every page's `<head>` |
| `/robots.txt` | [`src/app/robots.ts`](src/app/robots.ts) | Allows all crawlers, names the major AI crawlers explicitly, blocks `/admin/` and `/api/` |
| `/sitemap.xml` | [`src/app/sitemap.ts`](src/app/sitemap.ts) | Lists the homepage and `/llms.txt` |

On the page itself, the `h1` includes your name for crawlers and screen readers, and the footer has a factual one-line bio. `seo.summary` is the bio that AI answers are most likely to quote; keep it accurate. Bump `seo.updated` when the content changes.

The resume PDF at `/resume` is sent with `X-Robots-Tag: noindex`, so its personal details (like a phone number) stay out of search results while it remains downloadable.

After deploying, check the structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results) and submit `/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

## Deploying to Vercel

1. Import the repository into Vercel.
2. Under **Storage**, create a Blob store and connect it to the project. This adds the `BLOB_*` variables.
3. Under **Settings → Environment Variables**, add `RESUME_ADMIN_TOKEN` (Production, marked Sensitive). Keep a copy in your password manager; Vercel won't show it again.
4. Redeploy so the variables take effect.
5. Open `/admin/resume` on the live site and upload your resume once. Until then `/resume` returns 404.
6. If you add a custom domain, set `NEXT_PUBLIC_SITE_URL` to it and redeploy, so canonical URLs and the sitemap use the domain.

## Project structure

```
src/
  app/
    page.tsx                  homepage
    layout.tsx                fonts, theme, site-wide metadata
    opengraph-image.tsx       generated share image
    robots.ts, sitemap.ts     crawler rules and sitemap
    llms.txt/route.ts         profile for AI assistants
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
    site.ts                   canonical site URL
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

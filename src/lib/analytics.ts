// Mixpanel tracking for the portfolio. The rest of the app calls the typed
// helpers below and never touches the SDK directly. Every call is a no-op
// until initAnalytics() runs with a token, so builds without
// NEXT_PUBLIC_MIXPANEL_TOKEN stay quiet.
//
// Tracking plan (snake_case, one meaning per event):
//   page_view                 every page load, with first-touch attribution
//   contact_intent_submitted  a hiring/contact email link was clicked
//   resume_download           the resume PDF was downloaded
//   content_engaged           a section/project was viewed, or the page half scrolled
//   session_returned          a visitor came back a day or more after their last visit
import mixpanel, { type Dict } from "mixpanel-browser";

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
// Must match the project's data residency, or events are silently dropped:
// US https://api.mixpanel.com (default), EU https://api-eu.mixpanel.com,
// India https://api-in.mixpanel.com.
const apiHost = process.env.NEXT_PUBLIC_MIXPANEL_API_HOST || "https://api.mixpanel.com";
let ready = false;

// Anything marked with this attribute is blocked from session replays.
export const REPLAY_BLOCK_ATTR = "data-mp-block";

// Headless/automated browsers (Vercel's deploy checks, crawlers, test runners)
// would otherwise show up as visitors.
function isAutomated() {
  return navigator.webdriver || /HeadlessChrome|Lighthouse|bot|crawler|spider/i.test(navigator.userAgent);
}

// Links that download a file or open the mail app don't change the page, so
// Mixpanel would report every click on them as a "dead click".
const NO_PAGE_CHANGE_LINKS = 'a[href="/resume"], a[href^="mailto:"]';

export function initAnalytics() {
  if (ready || !token || typeof window === "undefined" || isAutomated()) return;
  mixpanel.init(token, {
    api_host: apiHost,
    // The SDK's own debug output is verbose; send() logs one line per event instead.
    debug: false,
    persistence: "localStorage",
    // Clicks, inputs and rage clicks are autocaptured; page views are not,
    // because page_view below carries the attribution properties instead.
    autocapture: {
      pageview: false,
      // Dead clicks are reported with the original click event ~500ms after
      // it happened; normal clicks are captured immediately. Dropping the late
      // reports on download/mail links keeps their real clicks and heatmaps.
      block_element_callback: (el, ev) =>
        !!el.closest?.(NO_PAGE_CHANGE_LINKS) && performance.now() - ev.timeStamp > 300,
    },
    track_pageview: false,
    record_sessions_percent: 100, // record every session
    record_heatmap_data: true,
    record_mask_all_inputs: true, // never capture what people type
    record_block_selector: `[${REPLAY_BLOCK_ATTR}]`,
  });
  ready = true;
  registerAttribution();
}

// Drop properties with no value instead of sending null/""/"unknown".
function clean(props: Dict): Dict {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

const isDev = process.env.NODE_ENV !== "production";

function send(event: string, props: Dict = {}, options?: { beacon?: boolean }) {
  if (!ready) return;
  const payload = clean(props);
  mixpanel.track(event, payload, options?.beacon ? { transport: "sendBeacon" } : undefined);
  markActivity();
  // Dev only: one readable line per event. Next.js mirrors browser logs to the
  // terminal running `npm run dev`, so this shows up there too. Super
  // properties (landing_source, campaign_id, audience_segment) are added by
  // Mixpanel and aren't repeated here.
  if (isDev) console.log(`[mixpanel] ${event} ${JSON.stringify(payload)}`);
}

/* ---------------- Attribution (super properties) ---------------- */

const SEARCH_ENGINES = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu)\./;

// Where this visitor came from, as a channel name.
function landingSource(params: URLSearchParams): string {
  const source = (params.get("utm_source") ?? "").toLowerCase();
  const medium = (params.get("utm_medium") ?? "").toLowerCase();
  if (/cpc|ppc|paid/.test(medium)) return source && !/google|bing/.test(source) ? `paid_${source}` : "paid_search";
  if (source) return source;
  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {}
  if (!host || host === window.location.hostname) return "direct";
  if (SEARCH_ENGINES.test(host)) return "organic_search";
  if (host.endsWith("linkedin.com") || host === "lnkd.in") return "linkedin";
  if (host.endsWith("github.com")) return "github";
  if (host === "t.co" || host.endsWith("twitter.com") || host.endsWith("x.com")) return "twitter";
  if (/chatgpt\.com|openai\.com|claude\.ai|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com/.test(host)) return "ai_assistant";
  return "referral";
}

// landing_source and campaign_id are first-touch (kept from the first visit);
// audience_segment comes only from links you share, e.g. ?audience=recruiter,
// and is updated whenever a newer link sets it.
function registerAttribution() {
  const params = new URLSearchParams(window.location.search);
  mixpanel.register_once(
    clean({
      landing_source: landingSource(params),
      campaign_id: params.get("utm_campaign") ?? params.get("campaign") ?? undefined,
    }),
  );
  const audience = (params.get("audience") ?? params.get("utm_audience") ?? "").trim().toLowerCase();
  if (audience) mixpanel.register({ audience_segment: audience });
}

/* ---------------- Events ---------------- */

let lastPageView = "";

export function trackPageView(path: string) {
  // React Strict Mode runs effects twice in dev; count each route once.
  if (path === lastPageView) return;
  lastPageView = path;
  send("page_view", { page_location: path });
  noteReturnLanding(path);
}

export type IntentType = "hiring_inquiry";

export function trackContactIntent(props: { intent_type: IntentType; landing_page: string; cta_location?: string }) {
  send("contact_intent_submitted", props);
  noteEngagement();
}

export function trackResumeDownload(props: { file_name: string; download_location?: string; page_location: string }) {
  send("resume_download", props);
  noteEngagement();
}

export type ContentType = "portfolio_section" | "project" | "portfolio";
export type EngagementAction = "viewed" | "scrolled_50";

export function trackContentEngaged(props: {
  content_type: ContentType;
  content_id: string;
  engagement_action: EngagementAction;
}) {
  send("content_engaged", props);
}

// Supporting events outside the plan, kept for UI insight.
export function track(event: "internal_link_clicked" | "outbound_link_clicked" | "skill_tile_clicked" | "theme_changed", props?: Dict) {
  send(event, props);
}

/* ---------------- Returning visitors ---------------- */

const LAST_ACTIVITY_KEY = "pf_last_activity_at";
const DAY_MS = 24 * 60 * 60 * 1000;
const returning = { active: false, days: 0, landing: "", engaged: false, sent: false };

function readLastActivity() {
  try {
    return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

function markActivity() {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  } catch {}
}

// Called once at startup, before anything updates the activity timestamp.
export function detectReturn() {
  if (!ready) return;
  const last = readLastActivity();
  if (last && Date.now() - last >= DAY_MS) {
    returning.active = true;
    returning.days = Math.floor((Date.now() - last) / DAY_MS);
  }
}

function noteReturnLanding(path: string) {
  if (returning.active && !returning.landing) returning.landing = path;
}

function noteEngagement() {
  if (returning.active) returning.engaged = true;
}

// session_returned goes out when the returning visit ends, so it can say
// whether the visitor engaged (contacted or downloaded the resume).
export function flushReturn() {
  if (!returning.active || returning.sent || !ready) return;
  returning.sent = true;
  send(
    "session_returned",
    {
      return_window_days: returning.days,
      return_landing_page: returning.landing,
      engaged_feature_on_return: returning.engaged,
    },
    { beacon: true },
  );
}

export function pauseRecording() {
  if (ready) mixpanel.stop_session_recording();
}

export function resumeRecording() {
  if (ready) mixpanel.start_session_recording();
}

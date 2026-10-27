"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { brand, sectionIndex } from "@/content/home";
import {
  detectReturn,
  flushReturn,
  initAnalytics,
  pauseRecording,
  resumeRecording,
  track,
  trackContactIntent,
  trackContentEngaged,
  trackPageView,
  trackResumeDownload,
} from "@/lib/analytics";

const isAdmin = (path: string) => path.startsWith("/admin");

// Where a click happened: an explicit data-track-location, else nav/footer,
// else the id of the enclosing section.
function locationOf(el: Element) {
  const tagged = el.closest("[data-track-location]");
  if (tagged) return tagged.getAttribute("data-track-location") ?? undefined;
  if (el.closest("nav")) return "nav";
  if (el.closest("footer")) return "footer";
  return el.closest("section[id]")?.id;
}

function destinationOf(url: URL) {
  if (url.hostname.endsWith("github.com")) return "github";
  if (url.hostname.endsWith("linkedin.com")) return "linkedin";
  return url.hostname;
}

function labelOf(a: HTMLAnchorElement) {
  // data-track-label overrides links whose text includes decoration (e.g. "04Skills").
  return (
    a.getAttribute("data-track-label") ||
    (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80) ||
    a.getAttribute("aria-label") ||
    undefined
  );
}

// Turns a link click into the matching plan event.
function trackLink(a: HTMLAnchorElement) {
  const href = a.getAttribute("href") ?? "";
  const location = locationOf(a);
  if (href === brand.resume) {
    return trackResumeDownload({
      file_name: brand.resumeFileName,
      download_location: location,
      page_location: window.location.pathname,
    });
  }
  if (href.startsWith("mailto:")) {
    return trackContactIntent({ intent_type: "hiring_inquiry", landing_page: window.location.pathname, cta_location: location });
  }
  if (href.startsWith("#")) {
    return track("internal_link_clicked", { target: href.slice(1), location, label: labelOf(a) });
  }
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      track("outbound_link_clicked", { url: url.href, destination: destinationOf(url), location, label: labelOf(a) });
    }
  } catch {}
}

// Fires `onSeen` once per element, but only after it has stayed in view for
// `dwellMs` without interruption. Scrolling or jumping past content (e.g. a
// nav link to #contact) restarts the clock, so fly-bys don't count as views.
function observeDwell(
  els: Element[],
  options: { dwellMs: number; threshold?: number; rootMargin?: string },
  onSeen: (el: Element) => void,
) {
  const timers = new Map<Element, number>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (timers.has(el)) continue;
          timers.set(
            el,
            window.setTimeout(() => {
              timers.delete(el);
              // A background tab isn't being read.
              if (document.visibilityState !== "visible") return;
              io.unobserve(el);
              onSeen(el);
            }, options.dwellMs),
          );
        } else {
          window.clearTimeout(timers.get(el));
          timers.delete(el);
        }
      }
    },
    { threshold: options.threshold ?? 0, rootMargin: options.rootMargin },
  );
  els.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
  };
}

// A section is "in view" while it covers the middle of the screen, which works
// for sections of any height (a % threshold never fires on tall ones).
const SECTION_VIEW = { rootMargin: "-45% 0px -45% 0px", dwellMs: 2000 };
// A project card is "in view" when most of it is on screen.
const PROJECT_VIEW = { threshold: 0.6, dwellMs: 1500 };

export default function MixpanelTracker() {
  const pathname = usePathname();

  // Boot once, then a page_view per route. The admin page is never tracked
  // or recorded.
  useEffect(() => {
    if (isAdmin(pathname)) {
      pauseRecording();
      return;
    }
    initAnalytics();
    detectReturn();
    resumeRecording();
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (isAdmin(window.location.pathname)) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (a instanceof HTMLAnchorElement) trackLink(a);
    };
    // A returning visit is reported as it ends, once we know whether they engaged.
    const onHide = () => {
      if (document.visibilityState === "hidden") flushReturn();
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flushReturn);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flushReturn);
    };
  }, []);

  // Content engagement on the homepage: sections, individual projects, 50% scroll.
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = sectionIndex.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const stopSections = observeDwell(sections, SECTION_VIEW, (el) =>
      trackContentEngaged({ content_type: "portfolio_section", content_id: el.id, engagement_action: "viewed" }),
    );
    const projects = Array.from(document.querySelectorAll("[data-project-id]"));
    const stopProjects = observeDwell(projects, PROJECT_VIEW, (el) =>
      trackContentEngaged({
        content_type: "project",
        content_id: el.getAttribute("data-project-id") ?? "",
        engagement_action: "viewed",
      }),
    );

    let halfway = false;
    const onScroll = () => {
      if (halfway) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) {
        halfway = true;
        trackContentEngaged({ content_type: "portfolio", content_id: "home", engagement_action: "scrolled_50" });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stopSections();
      stopProjects();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}

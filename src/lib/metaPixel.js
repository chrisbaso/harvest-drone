const PIXEL_INIT_FLAG = "__harvestDroneMetaPixelInit";
const PIXEL_LAST_PAGEVIEW_FLAG = "__harvestDroneMetaLastPageView";
const PIXEL_ONCE_PREFIX = "harvest-drone-meta-once:";
const DEFAULT_META_PIXEL_ID = "2444444456001084";

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

function getStorage() {
  const currentWindow = getWindow();
  return currentWindow?.sessionStorage ?? null;
}

export function getMetaPixelId() {
  return (
    import.meta.env.NEXT_PUBLIC_META_PIXEL_ID ||
    import.meta.env.VITE_META_PIXEL_ID ||
    DEFAULT_META_PIXEL_ID
  ).trim();
}

export function initMetaPixel() {
  const currentWindow = getWindow();
  const pixelId = getMetaPixelId();

  if (!currentWindow || !pixelId) {
    return false;
  }

  if (currentWindow[PIXEL_INIT_FLAG]) {
    return true;
  }

  /* eslint-disable no-underscore-dangle */
  if (!currentWindow.fbq) {
    const fbq =
      function fbqProxy() {
        fbq.callMethod
          ? fbq.callMethod.apply(fbq, arguments)
          : fbq.queue.push(arguments);
      };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    currentWindow.fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  /* eslint-enable no-underscore-dangle */

  currentWindow.fbq("init", pixelId);
  currentWindow[PIXEL_INIT_FLAG] = true;
  return true;
}

export function trackMetaEvent(eventName, params = {}) {
  const currentWindow = getWindow();

  if (!initMetaPixel() || typeof currentWindow?.fbq !== "function") {
    return false;
  }

  currentWindow.fbq("track", eventName, params);
  return true;
}

export function trackMetaCustomEvent(eventName, params = {}) {
  const currentWindow = getWindow();

  if (!initMetaPixel() || typeof currentWindow?.fbq !== "function") {
    return false;
  }

  currentWindow.fbq("trackCustom", eventName, params);
  return true;
}

export function trackMetaPageView(pageKey) {
  const currentWindow = getWindow();
  const nextPageKey =
    pageKey ||
    `${currentWindow?.location?.pathname || ""}${currentWindow?.location?.search || ""}${currentWindow?.location?.hash || ""}`;

  if (!initMetaPixel() || typeof currentWindow?.fbq !== "function") {
    return false;
  }

  if (currentWindow[PIXEL_LAST_PAGEVIEW_FLAG] === nextPageKey) {
    return false;
  }

  currentWindow.fbq("track", "PageView");
  currentWindow[PIXEL_LAST_PAGEVIEW_FLAG] = nextPageKey;
  return true;
}

export function registerMetaScheduleTracking() {
  const currentWindow = getWindow();

  if (!currentWindow?.document) {
    return () => {};
  }

  const handleClick = (event) => {
    const target = event.target instanceof Element ? event.target.closest(
      '[data-meta-schedule="true"], a[href*="calendly.com"], a[href*="cal.com"], a[href*="calendar.google.com"]',
    ) : null;

    if (!target) {
      return;
    }

    const href =
      target instanceof HTMLAnchorElement
        ? target.href
        : target.getAttribute("href") || "";
    const label = target.textContent?.trim() || "Schedule";
    const key = href || label;

    trackMetaEventOnce(`schedule:${key}`, "Schedule", {
      destination_url: href || undefined,
      trigger_label: label,
    });
  };

  currentWindow.document.addEventListener("click", handleClick);
  return () => currentWindow.document.removeEventListener("click", handleClick);
}

export function trackMetaEventOnce(key, eventName, params = {}) {
  const storage = getStorage();
  const storageKey = `${PIXEL_ONCE_PREFIX}${key}`;

  if (storage?.getItem(storageKey)) {
    return false;
  }

  const tracked = trackMetaEvent(eventName, params);

  if (tracked) {
    storage?.setItem(storageKey, "1");
  }

  return tracked;
}

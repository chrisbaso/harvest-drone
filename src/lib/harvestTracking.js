const HARVEST_TRACKING_KEY = "harvest-drone-tracking-v2";

export const HARVEST_TRACKING_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "campaign",
  "ad_set",
  "ad_name",
];

function getStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function loadHarvestTracking() {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    return JSON.parse(storage.getItem(HARVEST_TRACKING_KEY) || "{}");
  } catch (_error) {
    return {};
  }
}

export function captureHarvestTracking(searchParams, overrides = {}) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams || "");
  const nextTracking = {
    ...loadHarvestTracking(),
  };

  HARVEST_TRACKING_FIELDS.forEach((field) => {
    const value = params.get(field);

    if (value) {
      nextTracking[field] = value;
    }
  });

  if (typeof window !== "undefined") {
    nextTracking.landing_page_url = window.location.href;
    nextTracking.referrer = document.referrer || nextTracking.referrer || "";
  }

  Object.entries(overrides).forEach(([key, value]) => {
    if (value) {
      nextTracking[key] = value;
    }
  });

  const storage = getStorage();
  storage?.setItem(HARVEST_TRACKING_KEY, JSON.stringify(nextTracking));
  return nextTracking;
}

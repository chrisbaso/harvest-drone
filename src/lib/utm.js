const TRACKING_STORAGE_KEY = "harvest-drone-tracking";

export const TRACKING_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "landing_page",
  "page_version",
];

function getStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

function normalizeParams(searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams || "");

  return TRACKING_FIELDS.reduce((accumulator, key) => {
    const value = params.get(key);

    if (value) {
      accumulator[key] = value;
    }

    return accumulator;
  }, {});
}

export function loadTrackingParams() {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  const rawValue = storage.getItem(TRACKING_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return {};
  }
}

export function persistTrackingParams(searchParams, extra = {}) {
  const storage = getStorage();
  const nextValue = {
    ...loadTrackingParams(),
    ...normalizeParams(searchParams),
    ...Object.fromEntries(
      Object.entries(extra).filter(([, value]) => value),
    ),
  };

  if (storage) {
    storage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(nextValue));
  }

  return nextValue;
}

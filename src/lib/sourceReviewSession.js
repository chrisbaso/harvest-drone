const SOURCE_REVIEW_SESSION_KEY = "harvest-drone-source-review-session";

function getStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function saveSourceReviewSession(data) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(SOURCE_REVIEW_SESSION_KEY, JSON.stringify(data));
}

export function loadSourceReviewSession() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(SOURCE_REVIEW_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }
}

const RESULT_SESSION_KEY = "harvest-drone-result-session-v1";

function getStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function saveHarvestResultSession(data) {
  getStorage()?.setItem(RESULT_SESSION_KEY, JSON.stringify(data));
}

export function loadHarvestResultSession() {
  const rawValue = getStorage()?.getItem(RESULT_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }
}

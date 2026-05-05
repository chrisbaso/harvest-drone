import { createEnterpriseWorkspace } from "../../shared/enterpriseWorkspace";

const ENTERPRISE_WORKSPACE_PREFIX = "harvestEnterprise.workspace.";

function storageKey(orgId) {
  return `${ENTERPRISE_WORKSPACE_PREFIX}${orgId || "rdo"}`;
}

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadEnterpriseWorkspace(orgId = "rdo") {
  const storage = getStorage();

  if (!storage) {
    return createEnterpriseWorkspace(orgId);
  }

  try {
    const raw = storage.getItem(storageKey(orgId));
    return raw ? JSON.parse(raw) : createEnterpriseWorkspace(orgId);
  } catch {
    return createEnterpriseWorkspace(orgId);
  }
}

export function saveEnterpriseWorkspace(orgId = "rdo", workspace) {
  getStorage()?.setItem(storageKey(orgId), JSON.stringify(workspace));
}

export function resetEnterpriseWorkspace(orgId = "rdo") {
  getStorage()?.removeItem(storageKey(orgId));
  return createEnterpriseWorkspace(orgId);
}

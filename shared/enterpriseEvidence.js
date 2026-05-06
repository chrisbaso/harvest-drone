export const ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET = "enterprise-credential-evidence";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return UUID_PATTERN.test(String(value || ""));
}

function slugify(value) {
  return String(value || "file")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

function storageTimestamp(value) {
  return String(value || new Date().toISOString()).replace(/[:.]/g, "-");
}

export function buildEnterpriseCredentialEvidencePath({
  organizationId,
  operatorId,
  credentialType,
  fileName,
  timestamp,
}) {
  if (!isUuid(organizationId)) {
    throw new Error("organizationId must be a UUID for enterprise credential evidence storage");
  }

  if (!isUuid(operatorId)) {
    throw new Error("operatorId must be a UUID for enterprise credential evidence storage");
  }

  const credentialSlug = slugify(String(credentialType || "credential").replaceAll("_", "-"));
  const safeFileName = slugify(fileName || "credential-evidence");

  return [
    organizationId,
    "operators",
    operatorId,
    "credentials",
    credentialSlug,
    `${storageTimestamp(timestamp)}-${safeFileName}`,
  ].join("/");
}

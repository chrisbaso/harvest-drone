import assert from "node:assert/strict";
import {
  ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET,
  buildEnterpriseCredentialEvidencePath,
  isUuid,
} from "../shared/enterpriseEvidence.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const organizationId = "11111111-1111-4111-8111-111111111111";
const operatorId = "22222222-2222-4222-8222-222222222222";

run("builds scoped enterprise credential evidence paths", () => {
  const path = buildEnterpriseCredentialEvidencePath({
    organizationId,
    operatorId,
    credentialType: "PESTICIDE_APPLICATOR_LICENSE",
    fileName: "Ben ND License 2026.pdf",
    timestamp: "2026-05-05T12:00:00.000Z",
  });

  assert.equal(ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET, "enterprise-credential-evidence");
  assert.equal(
    path,
    "11111111-1111-4111-8111-111111111111/operators/22222222-2222-4222-8222-222222222222/credentials/pesticide-applicator-license/2026-05-05T12-00-00-000Z-ben-nd-license-2026.pdf",
  );
});

run("requires UUID organization and operator ids for storage policy compatibility", () => {
  assert.equal(isUuid(organizationId), true);
  assert.equal(isUuid("rdo"), false);
  assert.throws(
    () =>
      buildEnterpriseCredentialEvidencePath({
        organizationId: "rdo",
        operatorId,
        credentialType: "FAA_PART_107",
        fileName: "part107.pdf",
      }),
    /organizationId must be a UUID/,
  );
});

import {
  ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET,
  buildEnterpriseCredentialEvidencePath,
} from "../../shared/enterpriseEvidence";
import { supabase, supabaseConfigError } from "./supabase";

function getFileName(file) {
  return file?.name || "credential-evidence";
}

export async function uploadEnterpriseCredentialEvidence({
  organizationId,
  operatorId,
  credentialType,
  file,
  timestamp,
}) {
  if (supabaseConfigError) {
    throw new Error(supabaseConfigError);
  }

  if (!file) {
    throw new Error("A credential evidence file is required");
  }

  const path = buildEnterpriseCredentialEvidencePath({
    organizationId,
    operatorId,
    credentialType,
    fileName: getFileName(file),
    timestamp,
  });

  const { data, error } = await supabase.storage
    .from(ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return {
    bucket: ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET,
    path,
    storagePath: `${ENTERPRISE_CREDENTIAL_EVIDENCE_BUCKET}/${path}`,
    data,
  };
}

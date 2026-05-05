import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const migrationPath = "supabase/migrations/20260505130000_enterprise_org_scoped_rls.sql";
const sql = readFileSync(migrationPath, "utf8");
const compatibilityMigrationPath = "supabase/migrations/20260505140000_enterprise_pilot_schema_storage.sql";
const compatibilitySql = readFileSync(compatibilityMigrationPath, "utf8");

run("enterprise RLS hardening migration creates organization membership", () => {
  assert.match(sql, /create table if not exists public\.organization_members/i);
  assert.match(sql, /organization_id uuid not null references public\.organizations/i);
  assert.match(sql, /user_id uuid not null references auth\.users/i);
});

run("enterprise RLS hardening migration avoids broad authenticated true policies", () => {
  assert.equal(/for all to authenticated using \(true\)/i.test(sql), false);
  assert.equal(/for select to authenticated using \(true\)/i.test(sql), false);
});

run("enterprise RLS hardening migration covers core enterprise tables", () => {
  [
    "organizations",
    "enterprise_divisions",
    "enterprise_operators",
    "operator_credentials",
    "aircraft",
    "application_jobs",
    "application_records",
    "support_tickets",
    "readiness_checks",
  ].forEach((tableName) => {
    assert.match(sql, new RegExp(`public\\.${tableName}`, "i"));
  });
});

run("enterprise pilot compatibility migration bridges legacy training tables to enterprise operators", () => {
  [
    "operator_credentials",
    "training_enrollments",
    "practical_evaluations",
    "training_evidence",
    "readiness_checks",
  ].forEach((tableName) => {
    assert.match(compatibilitySql, new RegExp(`alter table public\\.${tableName}`, "i"));
  });

  assert.match(compatibilitySql, /enterprise_operator_id uuid references public\.enterprise_operators/i);
  assert.match(compatibilitySql, /application_job_id uuid references public\.application_jobs/i);
  assert.match(compatibilitySql, /organization_id uuid references public\.organizations/i);
  assert.match(compatibilitySql, /add column if not exists verification_status text/i);
});

run("enterprise pilot compatibility migration defines scoped credential evidence storage", () => {
  assert.match(compatibilitySql, /enterprise-credential-evidence/i);
  assert.match(compatibilitySql, /insert into storage\.buckets/i);
  assert.match(compatibilitySql, /create policy enterprise_credential_evidence_select/i);
  assert.match(compatibilitySql, /create policy enterprise_credential_evidence_insert/i);
  assert.equal(/storage\.objects[\s\S]*using\s*\(\s*true\s*\)/i.test(compatibilitySql), false);
});

run("enterprise pilot compatibility migration removes legacy broad training policies", () => {
  [
    "operator_credentials",
    "training_enrollments",
    "practical_evaluations",
    "training_evidence",
    "readiness_checks",
  ].forEach((tableName) => {
    assert.match(
      compatibilitySql,
      new RegExp(`drop policy if exists "Authenticated can read ${tableName}" on public\\.${tableName}`, "i"),
    );
    assert.match(
      compatibilitySql,
      new RegExp(`drop policy if exists "Authenticated can manage ${tableName}" on public\\.${tableName}`, "i"),
    );
  });
});

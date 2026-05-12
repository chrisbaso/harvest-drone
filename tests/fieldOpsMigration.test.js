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

const migrationPath = "supabase/migrations/20260508210849_field_operations_module.sql";
const sql = readFileSync(migrationPath, "utf8");

run("field ops migration creates the core operations tables", () => {
  [
    "clients",
    "farms",
    "services",
    "operator_profiles",
    "ops_jobs",
    "job_status_history",
    "job_notes",
    "job_checklists",
    "job_attachments",
    "activity_log",
    "jobber_links",
    "fleet_assets",
    "fleet_location_events",
  ].forEach((tableName) => {
    assert.match(sql, new RegExp(`create table if not exists public\\.${tableName}`, "i"));
  });
});

run("field ops migration extends existing fields table instead of recreating it", () => {
  assert.match(sql, /alter table public\.fields[\s\S]*add column if not exists farm_id uuid references public\.farms/i);
  assert.equal(/create table if not exists public\.fields/i.test(sql), false);
});

run("field ops jobs use a dedicated table so the legacy jobs table remains untouched", () => {
  assert.match(sql, /create table if not exists public\.ops_jobs/i);
  assert.match(sql, /metadata_json jsonb not null default '\{\}'::jsonb/i);
  assert.equal(/alter table public\.jobs/i.test(sql), false);
});

run("field ops migration protects organization scoped data with RLS helpers", () => {
  assert.match(sql, /create or replace function public\.can_manage_field_ops_org/i);
  assert.match(sql, /create or replace function public\.can_access_field_ops_job/i);
  assert.match(sql, /alter table public\.ops_jobs enable row level security/i);
  assert.match(sql, /alter table public\.fleet_assets enable row level security/i);
  assert.match(sql, /alter table public\.fleet_location_events enable row level security/i);
  assert.match(sql, /create policy ops_jobs_select_field_ops/i);
  assert.match(sql, /create policy ops_jobs_operator_update/i);
  assert.match(sql, /create policy fleet_location_events_insert_field_ops/i);
});

run("field ops migration avoids broad authenticated true policies", () => {
  assert.equal(/to authenticated\s+using\s*\(\s*true\s*\)/i.test(sql), false);
  assert.equal(/for all\s+to authenticated\s+using\s*\(\s*true\s*\)/i.test(sql), false);
});

run("field ops migration seeds Harvest Drone demo services and jobs", () => {
  [
    "Drone Application",
    "SOURCE Consultation",
    "Field Scouting",
    "Spot Treatment",
    "Enterprise Drone Program Support",
    "Miller North fungicide application",
    "Nelson West soybean spot treatment",
    "Ares 01",
    "HD-ARES-001",
    "staging_area",
    "wind_limit_mph",
  ].forEach((value) => {
    assert.match(sql, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  });
});

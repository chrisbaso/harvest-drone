import {
  createOpsLoopCandidate,
  summarizeDailyOpsBrief,
} from "../../shared/dailyOps.js";
import {
  fetchCalendarEvents,
  fetchRecentGmailMessages,
  getGoogleAccessToken,
} from "./googleWorkspace.js";
import { sendSlackDailyOpsBrief } from "./slack.js";

const DEFAULT_TIMEZONE = "America/Chicago";

function asDateString(date = new Date(), timezone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dayWindow(dateString) {
  return {
    start: `${dateString}T00:00:00.000Z`,
    end: `${addDays(dateString, 1)}T00:00:00.000Z`,
  };
}

function parseFromHeader(value = "") {
  const match = String(value).match(/^(.*?)\s*<([^>]+)>$/);

  if (!match) {
    return {
      name: "",
      email: String(value || "").trim(),
    };
  }

  return {
    name: match[1].replaceAll('"', "").trim(),
    email: match[2].trim(),
  };
}

function isActionableJobberEvent(event = {}) {
  const eventType = String(event.event_type || "");
  return /quote|request|job|invoice/i.test(eventType);
}

function createJobberLoopCandidate(event) {
  const eventType = String(event.event_type || "");
  const summary = event.payload_summary || {};
  const title = summary.title || summary.name || summary.topic || eventType.replaceAll("_", " ");
  const loopType = /invoice/i.test(eventType)
    ? "invoice_followup"
    : /quote|request/i.test(eventType)
      ? "quote_needed"
      : /job/i.test(eventType)
        ? "job_scheduling_needed"
        : null;

  return createOpsLoopCandidate({
    source: "jobber",
    sourceExternalId: event.external_id || event.id,
    relatedJobberId: event.external_id || null,
    relatedContactName: summary.clientName || summary.client?.name || summary.name || null,
    subject: title,
    summary: `Jobber ${eventType} needs operations review.`,
    loopType,
    priority: /invoice|quote|request/i.test(eventType) ? "high" : "normal",
    receivedAt: event.created_at,
  });
}

function createSmsLoopCandidate(message) {
  return createOpsLoopCandidate({
    source: "twilio",
    sourceExternalId: message.provider_message_id || message.id,
    relatedContactPhone: message.from_number,
    subject: "Customer SMS reply needs response",
    body: message.body_preview || "",
    loopType: "customer_reply_needed",
    priority: "urgent",
    receivedAt: message.created_at,
  });
}

function createEmailLoopCandidate(message) {
  const from = parseFromHeader(message.from);

  return createOpsLoopCandidate({
    source: "gmail",
    sourceExternalId: message.id,
    fromName: from.name,
    fromEmail: from.email,
    subject: message.subject,
    body: message.snippet,
    receivedAt: message.date ? new Date(message.date).toISOString() : null,
  });
}

function createCalendarItem(event, itemType) {
  return {
    source: "calendar",
    item_type: itemType,
    priority: /rdo|hylio|source|enterprise/i.test(`${event.summary} ${event.description}`) ? "high" : "normal",
    title: event.summary || "Calendar event",
    summary: [event.start, event.location, event.description].filter(Boolean).join(" | ").slice(0, 1000),
    suggested_next_action: "Review attendees, agenda, and any customer follow-up needed before the event.",
    payload_summary: {
      id: event.id,
      start: event.start,
      end: event.end,
      link: event.htmlLink,
    },
  };
}

async function safeQuery(label, callback, fallback) {
  try {
    return await callback();
  } catch (error) {
    return {
      error: `${label}: ${error.message || "unavailable"}`,
      value: fallback,
    };
  }
}

async function listExistingOpenLoops({ supabase }) {
  const { data, error } = await supabase
    .from("ops_loops")
    .select("*")
    .in("status", ["open", "assigned"])
    .order("priority", { ascending: false })
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function upsertOpsLoopCandidates({ supabase, candidates }) {
  const rows = candidates.filter((candidate) => candidate.source_external_id);

  if (!rows.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("ops_loops")
    .upsert(rows, { onConflict: "source,source_external_id", ignoreDuplicates: true })
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function listRecentJobberLoopCandidates({ supabase }) {
  const { data, error } = await supabase
    .from("integration_events")
    .select("*")
    .eq("provider", "jobber")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).filter(isActionableJobberEvent).map(createJobberLoopCandidate);
}

async function listRecentSmsLoopCandidates({ supabase }) {
  const { data, error } = await supabase
    .from("sms_message_logs")
    .select("*")
    .eq("direction", "inbound")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data || [])
    .filter((message) => !["opt_out", "opt_in"].includes(message.status))
    .map(createSmsLoopCandidate);
}

async function getGoogleSignals({ supabase, date, fetchImpl = fetch }) {
  const accessToken = await getGoogleAccessToken({ supabase, fetchImpl });

  if (!accessToken) {
    return {
      todayEvents: [],
      tomorrowEvents: [],
      emailLoopCandidates: [],
      warning: "Google Workspace is not connected.",
    };
  }

  const todayWindow = dayWindow(date);
  const tomorrowWindow = dayWindow(addDays(date, 1));
  const [todayEvents, tomorrowEvents, gmailMessages] = await Promise.all([
    fetchCalendarEvents({ accessToken, timeMin: todayWindow.start, timeMax: todayWindow.end, fetchImpl }),
    fetchCalendarEvents({ accessToken, timeMin: tomorrowWindow.start, timeMax: tomorrowWindow.end, fetchImpl }),
    fetchRecentGmailMessages({ accessToken, fetchImpl }),
  ]);

  return {
    todayEvents,
    tomorrowEvents,
    emailLoopCandidates: gmailMessages.map(createEmailLoopCandidate),
    warning: "",
  };
}

async function persistDailyBrief({ supabase, date, timezone, summary, calendarItems, loops }) {
  const { data: brief, error } = await supabase
    .from("ops_daily_brief")
    .upsert(
      {
        brief_date: date,
        timezone,
        summary,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "brief_date" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const itemRows = [
    ...calendarItems,
    ...loops.map((loop) => ({
      loop_id: loop.id || null,
      source: loop.source,
      item_type: loop.loop_type,
      priority: loop.priority,
      title: loop.title,
      summary: loop.summary,
      suggested_next_action: loop.suggested_next_action,
      payload_summary: {
        sourceExternalId: loop.source_external_id,
        status: loop.status,
      },
    })),
  ].map((item) => ({
    ...item,
    brief_id: brief.id,
  }));

  if (itemRows.length) {
    await supabase.from("ops_brief_item").delete().eq("brief_id", brief.id);
    const { error: itemError } = await supabase.from("ops_brief_item").insert(itemRows);

    if (itemError) {
      throw new Error(itemError.message);
    }
  }

  return brief;
}

export async function generateDailyOpsBrief({
  supabase,
  date = asDateString(new Date(), process.env.DAILY_OPS_TIMEZONE || DEFAULT_TIMEZONE),
  timezone = process.env.DAILY_OPS_TIMEZONE || DEFAULT_TIMEZONE,
  postToSlack = false,
  fetchImpl = fetch,
} = {}) {
  if (!supabase) {
    throw new Error("Supabase is required to generate the Daily Ops Brief.");
  }

  const warnings = [];
  const googleResult = await safeQuery("Google Workspace", () => getGoogleSignals({ supabase, date, fetchImpl }), {
    todayEvents: [],
    tomorrowEvents: [],
    emailLoopCandidates: [],
    warning: "Google Workspace is not available.",
  });
  const googleSignals = googleResult.value || googleResult;

  if (googleResult.error) warnings.push(googleResult.error);
  if (googleSignals.warning) warnings.push(googleSignals.warning);

  const jobberResult = await safeQuery("Jobber events", () => listRecentJobberLoopCandidates({ supabase }), []);
  const smsResult = await safeQuery("Twilio SMS", () => listRecentSmsLoopCandidates({ supabase }), []);

  if (jobberResult.error) warnings.push(jobberResult.error);
  if (smsResult.error) warnings.push(smsResult.error);

  const candidates = [
    ...(googleSignals.emailLoopCandidates || []),
    ...(jobberResult.value || jobberResult),
    ...(smsResult.value || smsResult),
  ];
  const createdLoops = await upsertOpsLoopCandidates({ supabase, candidates });
  const existingLoops = await listExistingOpenLoops({ supabase });
  const mergedLoops = [...createdLoops, ...existingLoops].reduce((map, loop) => {
    map.set(loop.id || `${loop.source}:${loop.source_external_id}`, loop);
    return map;
  }, new Map());
  const loops = [...mergedLoops.values()];
  const summary = summarizeDailyOpsBrief({
    date,
    todayEvents: googleSignals.todayEvents || [],
    tomorrowEvents: googleSignals.tomorrowEvents || [],
    loops,
  });
  const calendarItems = [
    ...(googleSignals.todayEvents || []).map((event) => createCalendarItem(event, "today_calendar_event")),
    ...(googleSignals.tomorrowEvents || []).map((event) => createCalendarItem(event, "tomorrow_calendar_event")),
  ];
  const brief = await persistDailyBrief({
    supabase,
    date,
    timezone,
    summary: {
      ...summary,
      warnings,
    },
    calendarItems,
    loops,
  });

  let slackResult = null;

  if (postToSlack) {
    slackResult = await sendSlackDailyOpsBrief({
      brief: {
        ...brief,
        summary,
      },
      supabase,
      fetchImpl,
    });

    await supabase
      .from("ops_daily_brief")
      .update({
        slack_status: slackResult.status,
        slack_error: slackResult.reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", brief.id);
  }

  return {
    brief: {
      ...brief,
      summary: {
        ...summary,
        warnings,
      },
    },
    loops,
    calendarItems,
    slackResult,
  };
}

export async function getLatestDailyOpsBrief({ supabase, date = null } = {}) {
  const query = supabase
    .from("ops_daily_brief")
    .select("*, ops_brief_item(*)")
    .order("generated_at", { ascending: false })
    .limit(1);

  if (date) {
    query.eq("brief_date", date);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
}

export async function updateOpsLoopStatus({
  supabase,
  id,
  status,
  ownerUserId,
  dueAt,
} = {}) {
  if (!id) {
    throw new Error("Open-loop id is required.");
  }

  const patch = {
    updated_at: new Date().toISOString(),
  };

  if (status) {
    patch.status = status;
    patch.resolved_at = ["resolved", "ignored"].includes(status) ? new Date().toISOString() : null;
  }

  if (ownerUserId !== undefined) {
    patch.owner_user_id = ownerUserId || null;
  }

  if (dueAt !== undefined) {
    patch.due_at = dueAt || null;
  }

  const { data, error } = await supabase
    .from("ops_loops")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listOpsLoops({ supabase, status = ["open", "assigned"] } = {}) {
  const statuses = Array.isArray(status) ? status : [status];
  const { data, error } = await supabase
    .from("ops_loops")
    .select("*, user_profiles(full_name, email)")
    .in("status", statuses)
    .order("priority", { ascending: false })
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export function isWeekdayInTimezone(date = new Date(), timezone = DEFAULT_TIMEZONE) {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);

  return !["Sat", "Sun"].includes(day);
}

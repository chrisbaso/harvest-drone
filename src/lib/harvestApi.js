import {
  buildRuleBasedLeadSummary,
  createLeadCsvRows,
  evaluateLead,
} from "../../shared/harvestLeadEngine";
import {
  clearDraft,
  createLocalEvent,
  getLocalLeadDetail,
  listLocalLeads,
  saveEventLocally,
  saveLeadLocally,
  updateLocalLead,
} from "./harvestLocalStore";

function shouldFallbackToLocal(response, payload) {
  return (
    !response ||
    response.status === 404 ||
    response.status === 503 ||
    payload?.mock_mode_available
  );
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}

function createLocalLeadResponse(payload) {
  const lead = saveLeadLocally(payload);
  const evaluation = evaluateLead(payload);
  const summary = lead.lead_summary || buildRuleBasedLeadSummary(lead);

  saveEventLocally(
    createLocalEvent({
      leadId: lead.id,
      eventType: "quiz_submitted",
      eventPayload: {
        lead_score: evaluation.leadScore,
        lead_tier: evaluation.leadTier,
      },
    }),
  );
  clearDraft();

  return {
    lead,
    summary,
    mode: "local",
    evaluation,
  };
}

export async function submitHarvestLead(payload) {
  try {
    const response = await fetch("/api/harvest/submit-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await parseJsonSafely(response);

    if (!response.ok) {
      if (shouldFallbackToLocal(response, result)) {
        return createLocalLeadResponse(payload);
      }

      throw new Error(result?.error || "Unable to submit the lead.");
    }

    clearDraft();
    return {
      ...result,
      mode: "server",
    };
  } catch (error) {
    if (error instanceof TypeError) {
      return createLocalLeadResponse(payload);
    }

    throw error;
  }
}

export async function trackHarvestEvent(eventType, eventPayload = {}, leadId = null) {
  const localEvent = createLocalEvent({ leadId, eventType, eventPayload });
  saveEventLocally(localEvent);

  try {
    await fetch("/api/harvest/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leadId,
        eventType,
        eventPayload,
      }),
    });
  } catch (_error) {
    // Local fallback is enough when the server route is unavailable.
  }

  return localEvent;
}

export async function getHarvestAdminData() {
  try {
    const response = await fetch("/api/harvest/admin-leads");
    const result = await parseJsonSafely(response);

    if (!response.ok) {
      if (shouldFallbackToLocal(response, result)) {
        return { leads: listLocalLeads(), mode: "local" };
      }

      throw new Error(result?.error || "Unable to load Harvest leads.");
    }

    return {
      leads: result?.leads || [],
      mode: "server",
    };
  } catch (error) {
    if (error instanceof TypeError) {
      return { leads: listLocalLeads(), mode: "local" };
    }

    throw error;
  }
}

export async function getHarvestLeadDetail(leadId) {
  try {
    const response = await fetch(`/api/harvest/lead?id=${encodeURIComponent(leadId)}`);
    const result = await parseJsonSafely(response);

    if (!response.ok) {
      if (shouldFallbackToLocal(response, result)) {
        return {
          ...getLocalLeadDetail(leadId),
          mode: "local",
        };
      }

      throw new Error(result?.error || "Unable to load lead detail.");
    }

    return {
      lead: result?.lead || null,
      events: result?.events || [],
      mode: "server",
    };
  } catch (error) {
    if (error instanceof TypeError) {
      return {
        ...getLocalLeadDetail(leadId),
        mode: "local",
      };
    }

    throw error;
  }
}

export async function updateHarvestLead(leadId, updates) {
  try {
    const response = await fetch(`/api/harvest/lead?id=${encodeURIComponent(leadId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });
    const result = await parseJsonSafely(response);

    if (!response.ok) {
      if (shouldFallbackToLocal(response, result)) {
        const currentDetail = getLocalLeadDetail(leadId);
        const updatedLead = updateLocalLead(leadId, updates);

        if (currentDetail.lead?.status !== updates.status && updates.status) {
          saveEventLocally(
            createLocalEvent({
              leadId,
              eventType: "admin_status_changed",
              eventPayload: {
                from: currentDetail.lead?.status,
                to: updates.status,
              },
            }),
          );
        }

        return {
          lead: updatedLead,
          mode: "local",
        };
      }

      throw new Error(result?.error || "Unable to update the lead.");
    }

    return {
      lead: result?.lead || null,
      events: result?.events || [],
      mode: "server",
    };
  } catch (error) {
    if (error instanceof TypeError) {
      const currentDetail = getLocalLeadDetail(leadId);
      const updatedLead = updateLocalLead(leadId, updates);

      if (currentDetail.lead?.status !== updates.status && updates.status) {
        saveEventLocally(
          createLocalEvent({
            leadId,
            eventType: "admin_status_changed",
            eventPayload: {
              from: currentDetail.lead?.status,
              to: updates.status,
            },
          }),
        );
      }

      if (updates.last_contacted_at) {
        saveEventLocally(
          createLocalEvent({
            leadId,
            eventType: "lead_contacted",
            eventPayload: {
              last_contacted_at: updates.last_contacted_at,
            },
          }),
        );
      }

      if (updates.status === "Qualified") {
        saveEventLocally(
          createLocalEvent({
            leadId,
            eventType: "lead_qualified",
            eventPayload: { status: updates.status },
          }),
        );
      }

      if (updates.status === "Bad Fit") {
        saveEventLocally(
          createLocalEvent({
            leadId,
            eventType: "lead_disqualified",
            eventPayload: { status: updates.status },
          }),
        );
      }

      if (updates.status === "Won" || updates.revenue_status === "won") {
        saveEventLocally(
          createLocalEvent({
            leadId,
            eventType: "sale_won",
            eventPayload: { status: updates.status, revenue_status: updates.revenue_status },
          }),
        );
      }

      if (updates.status === "Lost" || updates.revenue_status === "lost") {
        saveEventLocally(
          createLocalEvent({
            leadId,
            eventType: "sale_lost",
            eventPayload: { status: updates.status, revenue_status: updates.revenue_status },
          }),
        );
      }

      return {
        lead: updatedLead,
        mode: "local",
      };
    }

    throw error;
  }
}

export function downloadHarvestLeadsCsv(leads) {
  const rows = createLeadCsvRows(leads);

  if (!rows.length || typeof window === "undefined") {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? "").replaceAll('"', '""');
          return `"${value}"`;
        })
        .join(","),
    ),
  ];

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `harvest-drone-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

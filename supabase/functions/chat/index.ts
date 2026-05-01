import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "notifications@harvestdrone.com";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY || !ADMIN_EMAIL) {
  throw new Error("Missing required environment variables for chat function.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

const SYSTEM_PROMPT = `You are a helpful chat assistant on the Harvest Drone website, a precision agriculture company in Minnesota. You answer questions from farmers visiting the site.

PRODUCT KNOWLEDGE:
- SOURCE: $15/acre. Synthetic soil activator with ultra-low use rate. One ounce replaces 25 lbs of nitrogen. Reduces spend on anhydrous ammonia, urea (46-0-0), and UAN (28-0-0). NOT a biological, it is synthetic.
- BLUEPRINT: $11/acre. Solubilizes bound phosphorus already in the soil. Reduces need for DAP (18-46-0), MAP (11-52-0), and triple super phosphate.
- SOURCE + BLUEPRINT together: $25/acre total for the inputs.
- If Harvest Drone handles the spraying, they get $2/acre off the product bundle, so the SOURCE + BLUEPRINT inputs become $23/acre.
- Harvest Drone drone application is still a separate line item and usually runs $8-14/acre depending on the job.
- If someone asks for total delivered pricing, explain it as: $23/acre for the SOURCE + BLUEPRINT bundle when Harvest Drone sprays, plus $8-14/acre for the drone application itself, depending on the job.
- Growers report $25-45/acre savings on synthetic nitrogen and 3-4 bushel yield lifts on corn.
- Product is in stock in Minnesota now.

DRONE APPLICATION:
- $8-14/acre depending on the job
- 3-5x faster than ground rigs
- Zero compaction, zero crop damage
- Gets into wet fields and tight spray windows
- American-made Hylio drones

EARTHOPTICS:
- Subsurface soil scanning technology
- Maps compaction, drainage, and nutrient variability below the surface
- Produces zone-level prescription maps
- Free scan offer available for qualified growers in the service area

CONTACT:
- Jake Lund, founder
- Phone: 612-258-0582
- Email: jake@harvestdrone.com
- Service area: Minnesota (expanding)

YOUR RULES:
1. Be friendly, brief, and direct.
2. Keep responses to 1-3 sentences unless they ask for detail.
3. Always give specific numbers for pricing, and keep product pricing separate from drone application pricing unless the user asks for a full delivered estimate.
4. If they seem interested or operationally specific, ask once: "What's your name and email? Jake can put together an acre plan specific to your fields."
5. If they share name, email, or phone, acknowledge that Jake will follow up.
6. If unsure, say Jake can call and ask for the best number.
7. Never fabricate guarantees.
8. Never discuss competitor products by name.
9. For field-specific outcomes, defer to Jake.
10. If they are ready to order, direct them to https://harvest-drone.vercel.app/source
11. SOURCE is SYNTHETIC, not biological.

When you detect contact details in user messages, include a JSON block at the very end:
<LEAD_DATA>{"name":"their name","email":"their@email.com","phone":"their phone"}</LEAD_DATA>
Only include provided fields. If no contact details are provided, do not include LEAD_DATA.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, page } = await req.json();

    if (!message) {
      return jsonResponse({ response: "What can I help you with?" });
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      for (const entry of history.slice(-20)) {
        if (entry?.role && entry?.content) {
          messages.push({ role: entry.role, content: entry.content });
        }
      }
    }

    messages.push({ role: "user", content: String(message) });

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    const completion = await openAiResponse.json();

    if (!openAiResponse.ok) {
      throw new Error(completion.error?.message || "OpenAI API error");
    }

    let responseText = completion.choices?.[0]?.message?.content || "";
    let leadCaptured = false;

    const leadMatch = responseText.match(/<LEAD_DATA>(.*?)<\/LEAD_DATA>/s);
    const transcript: ChatMessage[] = [
      ...(Array.isArray(history) ? history.slice(-20) : []),
      { role: "user", content: String(message) },
      { role: "assistant", content: responseText.replace(/<LEAD_DATA>.*?<\/LEAD_DATA>/s, "").trim() },
    ];

    if (leadMatch) {
      responseText = responseText.replace(/<LEAD_DATA>.*?<\/LEAD_DATA>/s, "").trim();

      try {
        const leadData = JSON.parse(leadMatch[1]);
        const { data: insertedLead, error: insertError } = await supabase.from("chat_leads").insert({
          first_name: leadData.name || null,
          email: leadData.email || null,
          phone: leadData.phone || null,
          page_url: page || null,
          conversation: transcript,
          lead_captured: true,
        }).select("id").single();

        if (!insertError && insertedLead?.id) {
          leadCaptured = true;

          const transcriptHtml = transcript
            .map((entry) => `<p><strong>${entry.role === "user" ? "Farmer" : "Agent"}:</strong> ${escapeHtml(entry.content)}</p>`)
            .join("");

          const notifBody = `
            <h2>New chat lead from website</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;">
              ${leadData.name ? `<tr><td style="padding:8px;font-weight:bold;">Name:</td><td style="padding:8px;">${escapeHtml(leadData.name)}</td></tr>` : ""}
              ${leadData.email ? `<tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;">${escapeHtml(leadData.email)}</td></tr>` : ""}
              ${leadData.phone ? `<tr><td style="padding:8px;font-weight:bold;">Phone:</td><td style="padding:8px;">${escapeHtml(leadData.phone)}</td></tr>` : ""}
              <tr><td style="padding:8px;font-weight:bold;">Page:</td><td style="padding:8px;">${escapeHtml(page || "Unknown")}</td></tr>
            </table>
            <h3>Conversation</h3>
            <div style="background:#f5f5f0;padding:16px;border-radius:8px;font-size:14px;">
              ${transcriptHtml}
            </div>
          `;

          try {
            const notifyResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [ADMIN_EMAIL],
                subject: `Chat lead: ${leadData.name || "Unknown"} - ${page || "website"}`,
                html: notifBody,
              }),
            });

            if (!notifyResponse.ok) {
              const notifyData = await notifyResponse.json().catch(() => null);
              await supabase
                .from("chat_leads")
                .update({
                  notification_sent: false,
                  notification_error: notifyData?.message || "Failed to send notification email.",
                })
                .eq("id", insertedLead.id);
            } else {
              await supabase
                .from("chat_leads")
                .update({
                  notification_sent: true,
                  notification_sent_at: new Date().toISOString(),
                  notification_error: null,
                })
                .eq("id", insertedLead.id);
            }
          } catch (notificationError) {
            await supabase
              .from("chat_leads")
              .update({
                notification_sent: false,
                notification_error: notificationError instanceof Error ? notificationError.message : "Unknown notification error",
              })
              .eq("id", insertedLead.id);
          }
        }
      } catch {
        // If lead parsing fails, still return response text.
      }
    }

    if (!leadCaptured && Array.isArray(history) && history.length >= 2) {
      await supabase.from("chat_leads").insert({
        page_url: page || null,
        conversation: transcript,
        lead_captured: false,
      }).then(() => null).catch(() => null);
    }

    return jsonResponse({ response: responseText, lead_captured: leadCaptured });
  } catch (_error) {
    return jsonResponse(
      {
        response: "I'm having trouble connecting right now. You can reach Jake directly at 612-258-0582.",
        error: true,
      },
      500,
    );
  }
});

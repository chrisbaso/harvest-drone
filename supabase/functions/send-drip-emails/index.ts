.message || "Resend API error" };
    }

    return { id: data.id };
  } catch (err) {
    return { error: err insimport { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const fromEmail = Deno.env.get("FROM_EMAIL") || "hello@harvestdrone.com";

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  throw new Error("Missing required environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  firstName?: string,
  text?: string,
): Promise<{ id?: string; error?: string }> {
  const safeFirstName = firstName || "there";
  const personalizedSubject = subject.replace(/\{\{first_name\}\}/g, safeFirstName);
  const personalizedHtml = html.replace(/\{\{first_name\}\}/g, safeFirstName);
  const personalizedText = text?.replace(/\{\{first_name\}\}/g, safeFirstName);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedText || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: datatanceof Error ? err.message : "Unknown send error" };
  }
}

serve(async () => {
  try {
    const nowIso = new Date().toISOString();

    const { data: enrollments, error: fetchError } = await supabase
      .from("drip_enrollments")
      .select("*")
      .eq("status", "active")
      .lte("next_send_at", nowIso)
      .limit(50);

    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!enrollments || enrollments.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "No emails to send" }), { status: 200 });
    }

    let sent = 0;
    let failed = 0;
    let completed = 0;

    for (const enrollment of enrollments) {
      const nextStep = Number(enrollment.current_step || 0) + 1;
      const sentAtIso = new Date().toISOString();

      const { data: emailData, error: emailLookupError } = await supabase
        .from("drip_emails")
        .select("*")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_number", nextStep)
        .eq("is_active", true)
        .maybeSingle();

      if (emailLookupError) {
        await supabase.from("drip_sends").insert({
          enrollment_id: enrollment.id,
          email_id: null,
          step_number: nextStep,
          to_email: enrollment.email,
          subject: `Step ${nextStep} lookup failed`,
          status: "failed",
          error_message: emailLookupError.message,
        });

        failed++;
        continue;
      }

      if (!emailData) {
        await supabase
          .from("drip_enrollments")
          .update({
            status: "completed",
            completed_at: sentAtIso,
            updated_at: sentAtIso,
          })
          .eq("id", enrollment.id);

        completed++;
        continue;
      }

      const result = await sendEmail(
        enrollment.email,
        emailData.subject,
        emailData.body_html,
        enrollment.first_name,
        emailData.body_text,
      );

      await supabase.from("drip_sends").insert({
        enrollment_id: enrollment.id,
        email_id: emailData.id,
        step_number: nextStep,
        to_email: enrollment.email,
        subject: emailData.subject,
        status: result.error ? "failed" : "sent",
        resend_message_id: result.id || null,
        error_message: result.error || null,
      });

      if (result.error) {
        failed++;
        continue;
      }

      const { data: nextEmailData, error: nextEmailLookupError } = await supabase
        .from("drip_emails")
        .select("delay_days")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_number", nextStep + 1)
        .eq("is_active", true)
        .maybeSingle();

      if (nextEmailLookupError) {
        failed++;
        continue;
      }

      const nextSendAt = nextEmailData
        ? new Date(Date.now() + Number(nextEmailData.delay_days || 0) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const newStatus = nextEmailData ? "active" : "completed";

      await supabase
        .from("drip_enrollments")
        .update({
          current_step: nextStep,
          last_sent_at: sentAtIso,
          next_send_at: nextSendAt,
          status: newStatus,
          completed_at: newStatus === "completed" ? sentAtIso : null,
          updated_at: sentAtIso,
        })
        .eq("id", enrollment.id);

      sent++;
      if (newStatus === "completed") {
        completed++;
      }
    }

    return new Response(
      JSON.stringify({
        processed: enrollments.length,
        sent,
        failed,
        completed,
      }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown function error",
      }),
      { status: 500 },
    );
  }
});

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async () => {
  return new Response(
    JSON.stringify({
      success: false,
      deprecated: true,
      message: "send-drip-emails has been retired. Mailchimp Customer Journeys now handle customer delivery. Use process-drip-queue for reminder processing.",
    }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
});

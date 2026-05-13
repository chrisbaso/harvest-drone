import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

const SYSTEM_PROMPT = `You are a content writer for Harvest Drone, a precision agriculture company in Minnesota. You write blog posts for farmers - practical, specific, data-driven articles that help them make better decisions about nitrogen management, drone application, and precision inputs.

CRITICAL RULES:
1. Write like a farmer talks to another farmer. No corporate jargon. No marketing fluff. Specific numbers, not vague benefits.
2. SOURCE is a SYNTHETIC soil activator, NOT biological. One ounce replaces 25 lbs of nitrogen. $15/acre. It reduces anhydrous, urea, and UAN spend.
3. BLUEPRINT is $11/acre. Solubilizes bound phosphorus. Reduces DAP and MAP spend.
4. Bundle both for $25/acre, or $23/acre with Harvest Drone drone application.
5. Sound Agriculture reports: 84% win rate on corn, 6-12 bushel yield improvements, 150% net retention rate, 1M+ US acres.
6. Drone application: $8-14/acre. Zero compaction. 3-5x faster than ground rigs.
7. 2027: All commercial ag drones must be American-made. Hylio is American-built.
8. Harvest Drone is in Minnesota. Jake Lund is the founder. Phone: 612-258-0582.

WRITING STYLE:
- Headlines: specific and benefit-driven. "How a 1,400-Acre MN Operation Cut $30/Acre Off Urea" not "Innovative Solutions for Modern Agriculture"
- Paragraphs: 2-3 sentences max. Farmers scan, they don't read novels.
- Use numbers: "$15/acre" not "affordable." "3-4 bushels" not "improved yield."
- Include practical advice they can act on - application rates, timing, check strip methodology.
- End every post with a natural transition to the CTA (acre plan, ROI calculator, or contact).
- Format in markdown: use ## for section headings, **bold** for emphasis, - for bullet lists.
- Target length: 800-1,200 words. Long enough to rank on Google, short enough that farmers finish it.
- Include 2-3 relevant internal links: to /growers, /source, /roi-calculator, or other blog posts.

META SEO:
- Write a meta_description (max 155 characters) that includes the target keyword and a compelling reason to click.
- Suggest 3-5 tags relevant to the post content.
- Estimate reading_time_minutes based on word count divided by 250 words per minute.

OUTPUT FORMAT:
Respond with a JSON object (no markdown code fences, no preamble):
{
  "title": "...",
  "subtitle": "...",
  "meta_description": "...",
  "excerpt": "...",
  "body": "... (markdown content) ...",
  "tags": ["tag1", "tag2"],
  "reading_time_minutes": 5,
  "word_count": 1100
}`;

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const { title, category, brief, keywords } = await req.json();

    if (!title || !category) {
      return jsonResponse({ error: "title and category are required." }, { status: 400 });
    }

    const keywordList = Array.isArray(keywords) ? keywords.filter(Boolean).join(", ") : "";
    const userPrompt = `Write a blog post with this information:
Title: ${title}
Category: ${category}
Brief: ${brief || "Use the title as the guide."}
Target keywords: ${keywordList || "infer from the title"}

Remember: write for Minnesota farmers. Be specific, use real numbers, and sound like a neighbor who knows what they're talking about - not a marketing department.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI generation failed.");
    }

    const rawContent = data.choices?.[0]?.message?.content || "";
    const content = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(content);

    return jsonResponse(parsed);
  } catch (error) {
    return jsonResponse({ error: error.message || "Unable to generate blog draft." }, { status: 500 });
  }
});

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("EMAIL_FROM") || "Scrub Signs <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_URL") || "https://scrubsigns.app";

function buildHtml(opts: { name: string; sign: string; specialty: string; affirmation: string; long: string; line: string; email: string; }) {
  const { name, sign, specialty, affirmation, long, line, email } = opts;
  return `<div style="background:#0D0D1A;color:#F0EDE6;padding:40px 24px;font-family:Georgia,serif">
    <div style="max-width:560px;margin:0 auto">
      <h1 style="font-weight:500;font-size:28px;margin:0">Scrub Signs</h1>
      <p style="color:#C8A96E;font-style:italic;margin:6px 0 28px;font-size:14px">${affirmation}</p>
      <h2 style="font-weight:500;font-size:24px;margin:0 0 16px">${name ? name + ", " : ""}${sign}</h2>
      <p style="font-family:Helvetica,sans-serif;line-height:1.7;font-size:15px;color:#F0EDE6">${long}</p>
      <hr style="border:none;border-top:1px solid #C8A96E33;margin:28px 0" />
      <p style="font-style:italic;font-family:Helvetica,sans-serif;font-size:14px;color:#F0EDE6cc">${specialty}: ${line}</p>
      <p style="margin-top:48px;font-size:11px;color:#8A8AA0;font-family:Helvetica,sans-serif">
        <a href="${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8A8AA0;text-decoration:underline">Unsubscribe</a>
      </p>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!RESEND_API_KEY) return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500, headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const today = new Date().toISOString().slice(0,10);

  const { data: readings } = await supabase.from("daily_readings").select("*").eq("date", today);
  if (!readings || readings.length === 0) {
    return new Response(JSON.stringify({ ok: false, reason: "no_readings_for_today" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const subject = readings[0].email_subject || "Your Scrub Signs reading";

  const { data: subs } = await supabase.from("subscribers").select("*").eq("unsubscribed", false);
  let sent = 0, failed = 0;
  for (const s of subs || []) {
    const r = readings.find((x: any) => x.zodiac_sign === s.zodiac_sign && x.specialty === s.specialty)
      || readings.find((x: any) => x.zodiac_sign === s.zodiac_sign);
    if (!r) continue;
    const html = buildHtml({
      name: s.first_name, sign: s.zodiac_sign, specialty: s.specialty,
      affirmation: r.affirmation || "You showed up. That counts.",
      long: r.long_reading, line: r.specialty_line, email: s.email,
    });
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ from: FROM, to: [s.email], subject, html, headers: { "List-Unsubscribe": `<${APP_URL}/unsubscribe?email=${encodeURIComponent(s.email)}>` } }),
      });
      resp.ok ? sent++ : failed++;
    } catch { failed++; }
  }
  return new Response(JSON.stringify({ ok: true, sent, failed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});

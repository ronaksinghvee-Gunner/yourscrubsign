import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("EMAIL_FROM") || "Scrub Signs <onboarding@resend.dev>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { email, first_name } = await req.json();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "invalid email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: true, skipped: "no_key" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const name = (first_name || "").toString().slice(0, 80);
    const html = `
      <div style="background:#0D0D1A;color:#F0EDE6;padding:40px 24px;font-family:Georgia,serif">
        <div style="max-width:520px;margin:0 auto">
          <h1 style="font-family:Georgia,serif;font-weight:500;font-size:32px;letter-spacing:-0.01em;margin:0 0 8px">Scrub Signs</h1>
          <p style="color:#C8A96E;font-style:italic;margin:0 0 28px">What the stars say about your shift.</p>
          <p>You're in${name ? `, ${name}` : ""}.</p>
          <p style="color:#8A8AA0">Your first reading lands tomorrow morning. We'll send one every day. No fluff, no ads, no toxic positivity.</p>
          <p style="color:#8A8AA0;font-size:12px;margin-top:40px">Not for you? <a href="https://${req.headers.get("host") || "scrubsigns.app"}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#C8A96E">Unsubscribe</a>.</p>
        </div>
      </div>`;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM, to: [email], subject: "Welcome to Scrub Signs", html }),
    });
    const data = await r.json();
    return new Response(JSON.stringify({ ok: r.ok, data }), { status: r.ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

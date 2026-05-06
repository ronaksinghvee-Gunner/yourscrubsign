import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ZODIAC, WORDS, SPECIALTIES, fallbackReading, FALLBACK_AFFIRMATION } from "@/lib/scrubsigns";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NightSky from "@/components/NightSky";

type Step = "sign" | "words" | "specialty" | "reading";

const Index = () => {
  const [step, setStep] = useState<Step>("sign");
  const [sign, setSign] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [specialty, setSpecialty] = useState<string>("");
  const [reading, setReading] = useState<{ long: string; line: string; affirmation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [shareToast, setShareToast] = useState("");
  const [emailInline, setEmailInline] = useState("");
  const [emailInlineDone, setEmailInlineDone] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  const source = useMemo(() => {
    const p = new URLSearchParams(window.location.search).get("src");
    return p?.slice(0, 80) || "direct";
  }, []);

  useEffect(() => {
    if (step !== "reading" || !sign || !specialty) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    (async () => {
      const { data } = await supabase
        .from("daily_readings")
        .select("long_reading,specialty_line,affirmation,specialty")
        .eq("date", today)
        .eq("zodiac_sign", sign);
      const match = data?.find((r) => r.specialty === specialty) || data?.[0];
      if (match) {
        setReading({ long: match.long_reading, line: match.specialty_line, affirmation: match.affirmation || FALLBACK_AFFIRMATION });
      } else {
        const fb = fallbackReading(sign, specialty);
        setReading({ long: fb.long_reading, line: fb.specialty_line, affirmation: fb.affirmation });
      }
      setLoading(false);
    })();
  }, [step, sign, specialty]);

  const toggleWord = (w: string) =>
    setWords((p) => (p.includes(w) ? p.filter((x) => x !== w) : p.length >= 3 ? p : [...p, w]));

  const scrollToFlow = () => {
    setTimeout(() => flowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleShare = async () => {
    const url = window.location.origin;
    const text = `My Scrub Signs reading. Read yours.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Scrub Signs", text, url }); return; } catch { /* */ }
    }
    try { await navigator.clipboard.writeText(url); setShareToast("Link copied."); setTimeout(() => setShareToast(""), 2400); } catch { /* */ }
  };

  const submitInlineEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailInline)) return;
    // Open modal pre-filled — we still need first name + sign info
    setShowModal(true);
  };

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center px-5 md:px-8 pt-24 pb-16 overflow-hidden">
        <NightSky />
        <div className="relative max-w-4xl mx-auto w-full text-center" style={{ zIndex: 1 }}>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight fade-up">
            What the <span className="text-gold italic">stars</span> say<br className="hidden md:block" /> about your shift.
          </h1>
          <p className="text-muted-foreground mt-6 text-base md:text-lg fade-up stagger-1">
            Daily horoscopes for nurses. Written like one.
          </p>
          <div className="mt-10 fade-up stagger-2">
            <button
              onClick={scrollToFlow}
              className="beam relative inline-flex items-center justify-center px-9 py-3.5 rounded-full bg-gold text-primary-foreground text-sm tracking-wide hover:bg-gold-hover transition-colors"
            >
              Read today's sign
            </button>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section ref={flowRef} className="px-5 md:px-8 pb-20 max-w-3xl w-full mx-auto">
        {step === "sign" && (
          <div className="fade-up">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">Pick your sign.</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {ZODIAC.map((z) => {
                const active = sign === z.name;
                return (
                  <button
                    key={z.name}
                    onClick={() => { setSign(z.name); setTimeout(() => setStep("words"), 220); }}
                    className={`beam group relative bg-surface hover:bg-surface-elevated transition-all duration-300 aspect-[4/5] flex flex-col items-center justify-center p-3 border ${
                      active ? "border-gold gold-glow scale-[1.02]" : "border-border hover:border-gold/40 hover:-translate-y-1"
                    }`}
                  >
                    <span className="text-[40px] text-gold leading-none">{z.glyph}</span>
                    <span className="font-display text-sm md:text-base mt-2">{z.name}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">{z.dates}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "words" && (
          <div className="slide-in-r">
            <h2 className="font-display text-3xl md:text-4xl text-center">Before we look at the stars…</h2>
            <p className="text-center text-muted-foreground mt-3 mb-10 italic">Pick up to 3 that hit.</p>
            <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto">
              {WORDS.map((w) => {
                const active = words.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWord(w)}
                    className={`px-4 py-2.5 text-sm rounded-full border transition-all min-h-[44px] ${
                      active
                        ? "border-gold text-foreground bg-[hsl(var(--gold-soft))]"
                        : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setStep("specialty")}
                disabled={words.length === 0}
                className="beam relative px-9 py-3.5 rounded-full bg-gold text-primary-foreground hover:bg-gold-hover transition disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "specialty" && (
          <div className="slide-in-r">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">What's your unit?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpecialty(s); setStep("reading"); scrollToFlow(); }}
                  className="beam relative bg-surface border border-border hover:border-gold/60 transition-all py-7 font-display text-xl hover:bg-surface-elevated hover:-translate-y-1"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "reading" && (
          <div className="pt-4">
            {loading || !reading ? (
              <p className="text-center text-muted-foreground italic mt-16">Reading the chart…</p>
            ) : (
              <article className="max-w-2xl mx-auto">
                <div className="text-center fade-up">
                  <div className="text-6xl text-gold leading-none">{ZODIAC.find((z) => z.name === sign)?.glyph}</div>
                  <h2 className="font-display text-4xl md:text-5xl mt-3">{sign}</h2>
                </div>
                <p className="text-center text-muted-foreground italic mt-5 mb-10 fade-up stagger-1">
                  — {reading.affirmation}
                </p>
                <div className="mx-auto w-24 h-px bg-gold/40 mb-10 fade-up stagger-2" />
                <div className="space-y-5 text-foreground/90 text-[18px] leading-[1.8] fade-up stagger-3">
                  {reading.long.split(/(?<=[.!?])\s+/).map((s, i) => (
                    <p key={i} className="fade-up" style={{ animationDelay: `${500 + i * 200}ms` }}>{s}</p>
                  ))}
                </div>
                <div className="my-10 flex items-center gap-4 fade-up stagger-5">
                  <div className="flex-1 h-px bg-gold/30" />
                  <span className="text-[11px] text-gold/80 tracking-[0.25em] uppercase">{specialty}</span>
                  <div className="flex-1 h-px bg-gold/30" />
                </div>
                <p className="italic text-foreground/85 text-center fade-up stagger-5">{reading.line}</p>

                <div className="mt-14 grid sm:grid-cols-2 gap-3 fade-up stagger-6">
                  <button
                    onClick={handleShare}
                    className="border border-gold/70 text-gold py-3.5 rounded-full text-sm tracking-wide hover:bg-[hsl(var(--gold-soft))] transition"
                  >
                    Send to your group chat
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="beam relative py-3.5 rounded-full bg-gold text-primary-foreground hover:bg-gold-hover transition text-sm tracking-wide"
                  >
                    Get mine daily
                  </button>
                </div>

                {confirmed && (
                  <p className="mt-8 text-center text-gold/90 italic fade-in">Your reading lands tomorrow morning.</p>
                )}
                {shareToast && (
                  <p className="mt-4 text-center text-muted-foreground text-sm fade-in">{shareToast}</p>
                )}

                <div className="mt-14 text-center">
                  <button
                    onClick={() => { setStep("sign"); setSign(""); setWords([]); setSpecialty(""); setReading(null); scrollToFlow(); }}
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold transition"
                  >
                    Start over
                  </button>
                </div>
              </article>
            )}
          </div>
        )}
      </section>

      {/* ABOUT STRIP */}
      <section className="bg-surface py-20 px-5 md:px-8 border-y border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display text-2xl md:text-3xl leading-snug">
            Scrub Signs is the horoscope nobody else was writing.
          </p>
          <p className="text-muted-foreground italic mt-4">
            Built for the night shift. Written like a nurse.
          </p>
        </div>
      </section>

      {/* STORE PREVIEW */}
      <section className="px-5 md:px-8 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl">The Scrub Signs Shop</h2>
        </div>
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory">
          {[
            { t: "Stones", l: "For grounding between codes." },
            { t: "Merch", l: "Wear the shift." },
            { t: "Affirmation Tools", l: "Things that help." },
          ].map((c) => (
            <div
              key={c.t}
              className="beam relative bg-surface border border-border p-7 min-w-[80%] md:min-w-0 snap-center flex flex-col justify-between min-h-[180px]"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Coming soon</span>
              <div>
                <h3 className="font-display text-2xl mt-2">{c.t}</h3>
                <p className="text-muted-foreground italic text-sm mt-1.5">{c.l}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section style={{ background: "#1A1508" }} className="px-5 md:px-8 py-16 border-y border-border/40">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl">Get yours every morning.</h2>
          <form onSubmit={submitInlineEmail} className="mt-7 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={emailInline}
              onChange={(e) => setEmailInline(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-background/60 border border-border px-4 py-3 text-sm rounded-full focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="beam relative px-7 py-3 rounded-full bg-gold text-primary-foreground hover:bg-gold-hover transition text-sm tracking-wide"
            >
              I'm in
            </button>
          </form>
          {emailInlineDone && (
            <p className="mt-4 text-gold/90 italic text-sm">Your reading lands tomorrow morning.</p>
          )}
        </div>
      </section>

      <Footer />

      {showModal && (
        <SignupModal
          sign={sign || "Aries"}
          specialty={specialty || "ICU"}
          words={words}
          source={source}
          prefillEmail={emailInline}
          onClose={() => setShowModal(false)}
          onDone={() => { setShowModal(false); setConfirmed(true); setEmailInlineDone(true); }}
        />
      )}
    </>
  );
};

function SignupModal({ sign, specialty, words, source, prefillEmail, onClose, onDone }: {
  sign: string; specialty: string; words: string[]; source: string; prefillEmail?: string;
  onClose: () => void; onDone: () => void;
}) {
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState(prefillEmail || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!first.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr("Check your name and email."); return;
    }
    setBusy(true);
    const { error } = await supabase.from("subscribers").insert({
      first_name: first.trim().slice(0, 80),
      email: email.trim().toLowerCase().slice(0, 254),
      zodiac_sign: sign, specialty,
      word_selections: words, source,
    });
    if (error && !String(error.message).toLowerCase().includes("duplicate") && error.code !== "23505") {
      setBusy(false); setErr("Something went sideways. Try again."); return;
    }
    supabase.functions.invoke("send-welcome", { body: { email: email.trim().toLowerCase(), first_name: first.trim() } }).catch(() => { /* */ });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-background/85 backdrop-blur-md" />
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="beam relative bg-surface border border-border max-w-sm w-full p-8 fade-up rounded-sm"
      >
        <h3 className="font-display text-2xl">One more thing.</h3>
        <p className="text-muted-foreground text-sm mt-1.5 mb-6">We'll send yours every morning.</p>
        <input
          value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name"
          className="w-full bg-background/40 border border-border px-3.5 py-3 mb-3 text-sm focus:outline-none focus:border-gold rounded-sm"
        />
        <input
          value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email"
          className="w-full bg-background/40 border border-border px-3.5 py-3 mb-4 text-sm focus:outline-none focus:border-gold rounded-sm"
        />
        {err && <p className="text-destructive text-xs mb-3">{err}</p>}
        <button
          disabled={busy} type="submit"
          className="w-full py-3.5 rounded-full bg-gold text-primary-foreground hover:bg-gold-hover transition text-sm tracking-wide disabled:opacity-50"
        >
          {busy ? "…" : "I'm in."}
        </button>
      </form>
    </div>
  );
}

export default Index;

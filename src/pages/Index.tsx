import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ZODIAC, WORDS, SPECIALTIES, fallbackReading, FALLBACK_AFFIRMATION } from "@/lib/scrubsigns";

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

  const toggleWord = (w: string) => {
    setWords((prev) => prev.includes(w) ? prev.filter(x => x !== w) : prev.length >= 3 ? prev : [...prev, w]);
  };

  const handleShare = async () => {
    const url = window.location.origin;
    const text = `My Scrub Signs reading. Read yours.`;
    if (navigator.share) {
      try { await navigator.share({ title: "Scrub Signs", text, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); setShareToast("Link copied."); setTimeout(() => setShareToast(""), 2400); } catch {}
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 pt-10 pb-6 text-center fade-in">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Scrub Signs</h1>
        {step === "sign" && (
          <p className="text-muted-foreground mt-2 text-sm md:text-base italic">What the stars say about your shift.</p>
        )}
      </header>

      <section className="flex-1 px-5 pb-16 max-w-3xl w-full mx-auto">
        {step === "sign" && (
          <div className="fade-up">
            <h2 className="font-display text-2xl md:text-3xl text-center mb-8">Pick your sign.</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {ZODIAC.map((z) => (
                <button
                  key={z.name}
                  onClick={() => { setSign(z.name); setTimeout(() => setStep("words"), 200); }}
                  className={`group bg-surface hover:bg-surface-elevated border transition-all duration-300 aspect-[4/5] flex flex-col items-center justify-center p-3 ${sign === z.name ? "border-gold gold-glow scale-[1.02]" : "border-border hover:border-gold/40 hover:-translate-y-0.5"}`}
                >
                  <span className="text-3xl md:text-4xl text-gold mb-2">{z.glyph}</span>
                  <span className="font-display text-base md:text-lg">{z.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "words" && (
          <div className="slide-in">
            <h2 className="font-display text-2xl md:text-3xl text-center">Before we look at the stars…</h2>
            <p className="text-center text-muted-foreground mt-2 mb-8">Pick up to 3 that hit.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {WORDS.map((w) => {
                const active = words.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWord(w)}
                    className={`px-4 py-2 text-sm border transition-all ${active ? "border-gold text-gold bg-[hsl(var(--gold-soft))]" : "border-border text-foreground/80 hover:border-gold/50"}`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setStep("specialty")}
                disabled={words.length === 0}
                className="px-8 py-3 bg-gold text-primary-foreground hover:bg-[hsl(var(--primary-hover))] transition disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide"
                style={{ background: "hsl(var(--gold))" }}
              >
                Read my sign
              </button>
            </div>
          </div>
        )}

        {step === "specialty" && (
          <div className="slide-in">
            <h2 className="font-display text-2xl md:text-3xl text-center mb-8">What's your unit?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpecialty(s); setStep("reading"); }}
                  className="bg-surface border border-border hover:border-gold transition-all py-6 font-display text-xl hover:bg-surface-elevated hover:-translate-y-0.5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "reading" && (
          <div>
            {loading || !reading ? (
              <p className="text-center text-muted-foreground italic mt-20">Reading the chart…</p>
            ) : (
              <article className="max-w-2xl mx-auto pt-6">
                <div className="text-center fade-up">
                  <div className="text-5xl text-gold mb-2">{ZODIAC.find(z => z.name === sign)?.glyph}</div>
                  <h2 className="font-display text-3xl md:text-4xl">{sign}</h2>
                </div>
                <p className="text-center text-muted-foreground italic mt-6 mb-8 text-sm fade-up stagger-1">— {reading.affirmation}</p>
                <p className="text-foreground/90 leading-relaxed text-base md:text-lg fade-up stagger-2">{reading.long}</p>
                <div className="my-8 flex items-center gap-4 fade-up stagger-3">
                  <div className="flex-1 h-px bg-gold/30" />
                  <span className="text-xs text-gold/80 tracking-[0.2em] uppercase">{specialty}</span>
                  <div className="flex-1 h-px bg-gold/30" />
                </div>
                <p className="italic text-foreground/80 text-sm md:text-base text-center fade-up stagger-3">{reading.line}</p>

                <div className="mt-12 flex flex-col sm:flex-row gap-3 fade-up stagger-4">
                  <button onClick={handleShare} className="flex-1 border border-gold text-gold py-3 text-sm tracking-wide hover:bg-[hsl(var(--gold-soft))] transition">
                    Send to your group chat
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex-1 py-3 text-sm tracking-wide text-primary-foreground hover:opacity-90 transition"
                    style={{ background: "hsl(var(--gold))" }}
                  >
                    Get mine daily
                  </button>
                </div>

                {confirmed && (
                  <p className="mt-6 text-center text-gold/90 italic fade-in">Your reading lands tomorrow morning.</p>
                )}
                {shareToast && (
                  <p className="mt-4 text-center text-muted-foreground text-sm fade-in">{shareToast}</p>
                )}
              </article>
            )}
          </div>
        )}
      </section>

      {showModal && (
        <SignupModal
          sign={sign} specialty={specialty} words={words} source={source}
          onClose={() => setShowModal(false)}
          onDone={() => { setShowModal(false); setConfirmed(true); }}
        />
      )}
    </main>
  );
};

function SignupModal({ sign, specialty, words, source, onClose, onDone }: {
  sign: string; specialty: string; words: string[]; source: string;
  onClose: () => void; onDone: () => void;
}) {
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
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
    // duplicate email -> silently succeed
    if (error && !String(error.message).toLowerCase().includes("duplicate") && error.code !== "23505") {
      setBusy(false); setErr("Something went sideways. Try again."); return;
    }
    // fire-and-forget welcome email
    supabase.functions.invoke("send-welcome", { body: { email: email.trim().toLowerCase(), first_name: first.trim() } }).catch(() => {});
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="relative bg-surface-elevated border border-border max-w-sm w-full p-7 fade-up">
        <h3 className="font-display text-2xl">One more thing.</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-6">We'll send yours every morning.</p>
        <input
          value={first} onChange={e => setFirst(e.target.value)} placeholder="First name"
          className="w-full bg-surface border border-border px-3 py-2.5 mb-3 text-sm focus:outline-none focus:border-gold"
        />
        <input
          value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email"
          className="w-full bg-surface border border-border px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-gold"
        />
        {err && <p className="text-destructive text-xs mb-3">{err}</p>}
        <button disabled={busy} type="submit"
          className="w-full py-3 text-sm tracking-wide text-primary-foreground disabled:opacity-50"
          style={{ background: "hsl(var(--gold))" }}>
          {busy ? "…" : "I'm in."}
        </button>
      </form>
    </div>
  );
}

export default Index;

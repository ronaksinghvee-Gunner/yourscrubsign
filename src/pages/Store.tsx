import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type CategoryTag = "between-shifts" | "affirmation-tools" | "wear-the-shift";

type Section = {
  number: string;
  title: string;
  description: string;
  tag: CategoryTag;
  body: string[];
  image: string;
  imageAlt: string;
};

const sections: Section[] = [
  {
    number: "01",
    title: "Between Shifts",
    description: "For the shifts that don't leave you when you get home.",
    tag: "between-shifts",
    image: "/assets/between-shifts.jpg",
    imageAlt: "Between Shifts",
    body: [
      "Things you reach for without thinking.",
      "Something small to hold. Something to slow things down. Something that reminds you you're allowed to leave the day behind.",
      "We're working on it.",
    ],
  },
  {
    number: "02",
    title: "Affirmation Tools",
    description: "Small reminders that meet you where you are.",
    tag: "affirmation-tools",
    image: "/assets/affirmation-tools.jpg",
    imageAlt: "Affirmation Tools",
    body: [
      "Not the kind that feel forced.",
      "The kind that sound like something you'd actually say to yourself. On the hard days. On the quiet ones.",
      "Nothing overdone. Just enough.",
    ],
  },
  {
    number: "03",
    title: "Wear the Shift",
    description: "Wear what the shift feels like.",
    tag: "wear-the-shift",
    image: "/assets/wear-the-shift.jpg",
    imageAlt: "Wear the Shift",
    body: [
      "Things that don't need explaining.",
      "If you know, you know. And if you don't, that's kind of the point.",
      "Simple. Quiet. Familiar.",
    ],
  },
];

const getSessionId = (): string => {
  const key = "scrubsigns-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
};

const FadeInImage = ({ src, alt }: { src: string; alt: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="store-hero-image mt-12 w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 600ms ease, transform 600ms ease",
      }}
    >
      <div className="relative w-full overflow-hidden" style={{ borderRadius: 4 }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block w-full h-[280px] md:h-[420px]"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div
          aria-hidden
          className="store-hero-vignette absolute inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.15)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ border: "1px solid rgba(200,169,110,0.2)", borderRadius: 4 }}
        />
      </div>
    </div>
  );
};

const InterestLink = ({ category }: { category: CategoryTag }) => {
  const flagKey = `scrubsigns-interest-${category}`;
  const [noted, setNoted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(flagKey)) setNoted(true);
  }, [flagKey]);

  const handleClick = async () => {
    if (noted) return;
    if (sessionStorage.getItem(flagKey)) {
      setNoted(true);
      return;
    }
    const session_id = getSessionId();
    const storedEmail = localStorage.getItem("scrubsigns-email");
    const email =
      storedEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(storedEmail) ? storedEmail : null;

    sessionStorage.setItem(flagKey, "1");
    setNoted(true);

    await supabase.from("store_interest").insert({
      category,
      session_id,
      email,
    } as never);
  };

  if (noted) {
    return (
      <span className="inline-block mt-8 font-sans text-[13px] text-muted-foreground transition-opacity duration-500">
        Noted.
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group inline-flex items-center gap-2 mt-8 font-sans text-[13px] text-gold hover:text-gold-hover cursor-pointer transition-colors"
    >
      <span className="group-hover:underline underline-offset-4">I'd want this.</span>
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
    </button>
  );
};

const Store = () => (
  <>
    <Nav />
    <main className="pt-32 pb-24">
      <header className="text-center px-6 max-w-2xl mx-auto fade-up">
        <h1 className="font-display text-[40px] md:text-[48px] leading-tight">
          The Scrub Signs Shop
        </h1>
        <p className="font-sans text-[14px] md:text-[16px] text-muted-foreground mt-4">
          Things for the night shift soul.
        </p>
        <p className="font-sans text-[11px] md:text-[13px] text-muted-foreground/60 mt-3 italic">
          We're building this slowly. The right way.
        </p>
        <div
          className="mx-auto mt-12 h-px w-24"
          style={{ background: "rgba(200,169,110,0.2)" }}
        />
      </header>

      <div className="mt-4">
        {sections.map((s, i) => (
          <section
            key={s.tag}
            className={`store-section ${i % 2 === 0 ? "store-section-a" : "store-section-b"} px-12 md:px-8 py-[68px] md:py-[100px]`}
          >
            <div className="max-w-[680px] mx-auto text-center md:text-left">
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Category {s.number}
              </p>
              <h2 className="font-display text-[34px] md:text-[42px] leading-tight mt-4">
                {s.title}
              </h2>
              <p className="font-sans text-[13px] md:text-[15px] italic text-muted-foreground mt-3">
                {s.description}
              </p>

              <div className="mt-10 max-w-[520px] mx-auto md:mx-0 space-y-6">
                {s.body.map((para, idx) => (
                  <p
                    key={idx}
                    className="font-sans text-[14px] md:text-[16px] leading-[2] text-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <FadeInImage src={s.image} alt={s.imageAlt} />

              <InterestLink category={s.tag} />
            </div>

            {i < sections.length - 1 && (
              <div
                className="mx-auto mt-[68px] md:mt-[100px] h-px w-[60%] max-w-[420px]"
                style={{ background: "rgba(200,169,110,0.2)" }}
              />
            )}
          </section>
        ))}
      </div>

      <section className="px-12 md:px-8 pt-20 pb-8">
        <div className="max-w-[400px] mx-auto text-center">
          <p className="font-display italic text-[22px] md:text-[24px] leading-snug">
            Everything here is coming soon.
          </p>
          <p className="font-sans text-[12px] md:text-[14px] text-muted-foreground leading-[1.8] mt-5">
            If it feels like something you'd want after a long shift, we're probably building it.
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Store;

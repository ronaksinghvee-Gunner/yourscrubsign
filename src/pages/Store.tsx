import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Product = { name: string; line: string };
type Category = {
  number: string;
  title: string;
  description: string;
  tag: "between-shifts" | "affirmation-tools" | "wear-the-shift";
  products: Product[];
};

const categories: Category[] = [
  {
    number: "01",
    title: "Between Shifts",
    description: "For the shifts that don't leave you when you get home.",
    tag: "between-shifts",
    products: [
      { name: "Grounding Stone Set", line: "For the shifts that don't leave you when you get home." },
      { name: "Pocket Reset Stone", line: "Keep it in your scrub pocket. You'll know when to reach for it." },
      { name: "Night Shift Reset Kit", line: "A small reset, before you try to sleep." },
      { name: "End-of-Shift Card", line: "Take a breath. You're allowed to leave today behind." },
    ],
  },
  {
    number: "02",
    title: "Affirmation Tools",
    description: "Small reminders that meet you where you are.",
    tag: "affirmation-tools",
    products: [
      { name: "Shift Affirmation Cards", line: "You did enough today." },
      { name: "Pre-Shift Card", line: "Before you walk in again." },
      { name: "Still Showing Up Card", line: "Even when it's hard, you're still here." },
      { name: "5-Minute Reset Card", line: "You don't need an hour. Just take five." },
    ],
  },
  {
    number: "03",
    title: "Wear the Shift",
    description: "Wear what the shift feels like.",
    tag: "wear-the-shift",
    products: [
      { name: "Crewneck", line: "Still showing up." },
      { name: "Crewneck", line: "Running on spite." },
      { name: "Hoodie", line: "For the days you don't want to explain anything." },
      { name: "Tote Bag", line: "You've been carrying a lot." },
    ],
  },
];

const NotifyForm = ({ category }: { category: Category["tag"] }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed) || trimmed.length > 254) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("store_interest").insert({ email: trimmed, category });
    setLoading(false);
    if (error) {
      toast({ title: "Something went wrong", description: "Try again in a moment.", variant: "destructive" });
      return;
    }
    setDone(true);
    setEmail("");
  };

  if (done) {
    return (
      <p className="mt-10 text-sm italic text-muted-foreground">
        We'll let you know the moment it's ready.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Notify me when it's ready"
        className="flex-1 bg-transparent border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gold hover:bg-gold-hover text-primary-foreground text-[11px] tracking-[0.18em] uppercase px-6 py-3 transition-colors disabled:opacity-60"
      >
        {loading ? "Sending" : "Let me know"}
      </button>
    </form>
  );
};

const Store = () => (
  <>
    <Nav />
    <main className="pt-32 pb-20">
      <header className="text-center px-5 md:px-8 max-w-3xl mx-auto mb-20 fade-up">
        <h1 className="font-display text-[42px] md:text-6xl leading-tight">The Scrub Signs Shop</h1>
        <p className="text-muted-foreground mt-4 italic text-base md:text-lg">
          Things for the night shift soul.
        </p>
        <p className="text-muted-foreground/70 mt-3 text-xs md:text-sm">
          Everything here is coming soon. We're building it the right way.
        </p>
      </header>

      {categories.map((cat, i) => (
        <section
          key={cat.tag}
          data-store-section={i % 2 === 0 ? "a" : "b"}
          className={`store-section ${i % 2 === 0 ? "store-section-a" : "store-section-b"} relative px-5 md:px-8 py-[68px] md:py-20`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center md:text-left mb-10">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">
                Category {cat.number}
              </p>
              <h2 className="font-display text-[36px] md:text-[42px] leading-tight">{cat.title}</h2>
              <p className="text-muted-foreground italic mt-3 text-sm md:text-base">{cat.description}</p>
              <p className="text-gold text-[10px] tracking-[0.25em] uppercase mt-4">Coming Soon</p>
            </div>

            <ul className="mt-8">
              {cat.products.map((p, idx) => (
                <li
                  key={idx}
                  className="store-row flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6 px-2 md:px-3 py-5 border-b transition-colors"
                  style={{ borderColor: "var(--store-row-border)" }}
                >
                  <span className="font-sans text-[13px] md:text-[15px] text-foreground">
                    {p.name}
                  </span>
                  <span className="text-[11px] md:text-[13px] italic text-muted-foreground md:text-right md:max-w-md">
                    {p.line}
                  </span>
                </li>
              ))}
            </ul>

            <NotifyForm category={cat.tag} />
          </div>

          {i < categories.length - 1 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[60%] h-px"
              style={{ background: "rgba(200,169,110,0.2)" }}
            />
          )}
        </section>
      ))}
    </main>
    <Footer />
  </>
);

export default Store;

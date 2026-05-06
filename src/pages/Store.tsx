import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const items = [
  { title: "Stones", line: "For grounding between codes." },
  { title: "Merch", line: "Wear the shift." },
  { title: "Affirmation Tools", line: "Things that help." },
];

const Store = () => (
  <>
    <Nav />
    <main className="pt-32 pb-12 px-5 md:px-8 max-w-5xl mx-auto">
      <header className="text-center mb-14 fade-up">
        <h1 className="font-display text-5xl md:text-6xl">The Scrub Signs Shop</h1>
        <p className="text-muted-foreground mt-3 italic">Things for the night shift soul.</p>
      </header>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((it, i) => (
          <div
            key={it.title}
            className={`beam relative bg-surface border border-border p-8 min-h-[220px] flex flex-col justify-between fade-up stagger-${i + 1}`}
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Coming soon</span>
              <h3 className="font-display text-2xl mt-3">{it.title}</h3>
            </div>
            <p className="text-muted-foreground italic">{it.line}</p>
          </div>
        ))}
      </div>
    </main>
    <Footer />
  </>
);

export default Store;

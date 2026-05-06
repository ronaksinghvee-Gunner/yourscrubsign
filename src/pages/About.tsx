import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const About = () => (
  <>
    <Nav />
    <main className="pt-32 pb-12 px-5 md:px-8 max-w-2xl mx-auto">
      <h1 className="font-display text-5xl md:text-6xl mb-12 fade-up">About</h1>
      <div className="space-y-7 text-foreground/90 text-lg leading-relaxed fade-up stagger-1">
        <p>
          Scrub Signs is a daily horoscope for nurses. Not generic. Not inspirational. Written for the people
          who know what a 4am code feels like.
        </p>
        <p>
          Every reading is built around real nurse pain points — burnout, bad management, night shift isolation,
          imposter syndrome. The astrology is the frame. The truth is yours.
        </p>
        <p className="text-gold/90 italic font-display text-xl">
          We are not a wellness brand. We are not a financial product. We are just the horoscope nobody else was
          writing.
        </p>
      </div>
    </main>
    <Footer />
  </>
);

export default About;

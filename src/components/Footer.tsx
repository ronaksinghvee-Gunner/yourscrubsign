const Footer = () => (
  <footer className="border-t border-border/40 mt-24">
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <p className="font-display italic text-xl">Scrub Signs</p>
        <p className="text-muted-foreground text-xs mt-1 tracking-wide">The horoscope nobody else was writing.</p>
      </div>
      <div className="flex items-center gap-5 text-muted-foreground text-xs uppercase tracking-[0.1em]">
        <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-gold transition">TikTok</a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-gold transition">Instagram</a>
      </div>
      <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} Scrub Signs</p>
    </div>
  </footer>
);

export default Footer;

{step === "reading" && (
  <div className="fixed inset-0 z-40 flex flex-col bg-background overflow-hidden" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
    {/* TOP BAR */}
    <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
      <button onClick={() => setStep("words")} className="text-muted-foreground hover:text-foreground transition p-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => <div key={i} className={`rounded-full transition-all ${i === 2 ? "w-5 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-border"}`} />)}
      </div>
      <button onClick={() => { setStep("sign"); setSign(""); setWords([]); setSpecialty(""); setReading(null); }} className="text-muted-foreground hover:text-foreground transition p-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>

    {loading || !reading ? (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-gold animate-pulse mb-3">{ZODIAC.find(z => z.name === sign)?.glyph}</div>
          <p className="text-muted-foreground italic text-sm">Reading the stars...</p>
        </div>
      </div>
    ) : (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* SIGN SECTION */}
          <div className="text-center pt-2 pb-6 flex-shrink-0">
            <div className="text-5xl text-gold leading-none mb-2">{ZODIAC.find(z => z.name === sign)?.glyph + "\uFE0E"}</div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{sign}</div>
            <div className="mx-auto mt-3 w-8 h-px bg-gold/40" />
          </div>

          {/* READING TEXT - expandable */}
          <ReadingText long={reading.long} />

          {/* AFFIRMATION */}
          <p className="italic text-muted-foreground text-sm text-center mt-6 mb-2 leading-relaxed px-2">{reading.affirmation}</p>

          {/* CLOSING LINE */}
          <p className="text-gold italic text-center text-[15px] font-display mt-3 mb-6">This was written for your next shift.</p>

          {/* SHARE CARD */}
          <div className="mx-auto max-w-[340px] mb-4 rounded-[4px] border border-gold/20 p-5 text-center" style={{ background: "#0D0D1A" }}>
            <div className="text-2xl text-gold mb-1">{ZODIAC.find(z => z.name === sign)?.glyph + "\uFE0E"}</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{sign}</div>
            <p className="font-display italic text-[14px] text-foreground/90 leading-relaxed mb-3">{reading.short || reading.long.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}</p>
            <div className="mx-auto w-7 h-px bg-gold/30 mb-2" />
            <div className="text-[9px] text-muted-foreground/50">scrubsigns.com</div>
          </div>
        </div>

        {/* FIXED BOTTOM CTAS */}
        <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-border/30 bg-background">
          <div className="max-w-sm mx-auto space-y-2.5">
            <button
              onClick={handleShare}
              className="w-full py-3.5 border border-gold/70 text-gold text-xs uppercase tracking-[0.12em] hover:bg-gold/10 transition rounded-[2px]"
            >
              Share it
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3.5 bg-gold text-primary-foreground text-xs uppercase tracking-[0.12em] hover:bg-gold-hover transition rounded-[2px]"
            >
              Get mine daily
            </button>
            {confirmed && <p className="text-center text-gold/90 italic text-xs pt-1">You're in. See you tomorrow.</p>}
          </div>
          <button
            onClick={() => { setStep("sign"); setSign(""); setWords([]); setSpecialty(""); setReading(null); }}
            className="block mx-auto mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition"
          >
            ← start over
          </button>
        </div>
      </div>
    )}
  </div>
)}

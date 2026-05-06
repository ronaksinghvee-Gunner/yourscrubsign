import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Today's Reading" },
  { to: "/store", label: "Store" },
  { to: "/about", label: "About" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          scrolled || open ? "bg-background/95 backdrop-blur-sm border-b border-border/40" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" onClick={() => setOpen(false)} className="font-display italic text-2xl text-foreground tracking-tight">
            Scrub Signs
          </Link>
          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `text-[13px] uppercase tracking-[0.1em] transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-11 h-11 flex flex-col items-end justify-center gap-1.5 -mr-2"
          >
            <span className={`block h-px bg-foreground transition-all ${open ? "w-6 translate-y-[7px] rotate-45" : "w-6"}`} />
            <span className={`block h-px bg-foreground transition-all ${open ? "opacity-0" : "w-4"}`} />
            <span className={`block h-px bg-foreground transition-all ${open ? "w-6 -translate-y-[7px] -rotate-45" : "w-5"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 md:hidden bg-background transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <ul className="h-full flex flex-col items-center justify-center gap-8">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="font-display text-3xl text-foreground"
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Nav;

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  color: string;
  sparkle: boolean;
  period: number;
  phase: number;
  kind: "white" | "gold" | "orange";
};

type Cloud = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  darkColor: string;
  lightColor: string;
  offset: number;
};

type Props = { mode?: "dark" | "light" };

const NightSky = ({ mode = "dark" }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const transRef = useRef(mode === "light" ? 1 : 0); // 0 dark, 1 light

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let clouds: Cloud[] = [];
    let orbiters: { angle: number; radius: number; speed: number; size: number }[] = [];
    let raf = 0;
    const start = performance.now();
    let lastT = start;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpColor = (c1: number[], c2: number[], t: number) =>
      `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = [];
      for (let i = 0; i < 80; i++) {
        const roll = Math.random();
        let kind: "white" | "gold" | "orange";
        let color: string;
        if (roll < 0.6) { kind = "white"; color = "rgba(255,255,255,0.8)"; }
        else if (roll < 0.9) { kind = "gold"; color = "rgba(200,169,110,0.9)"; }
        else { kind = "orange"; color = "rgba(255,180,80,0.7)"; }
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(1, 2.5),
          color,
          kind,
          sparkle: false,
          period: rand(2000, 5000),
          phase: Math.random() * Math.PI * 2,
        });
      }
      const idx = [...Array(80).keys()].sort(() => Math.random() - 0.5).slice(0, 20);
      idx.forEach((i) => (stars[i].sparkle = true));

      clouds = [
        { cx: width * 0.2, cy: height * 0.85, rx: width * 0.45, ry: height * 0.18, darkColor: "rgba(120,20,160,0.25)", lightColor: "rgba(255,255,255,0.6)", offset: 0 },
        { cx: width * 0.75, cy: height * 0.92, rx: width * 0.5, ry: height * 0.2, darkColor: "rgba(180,40,200,0.12)", lightColor: "rgba(255,240,200,0.4)", offset: 0 },
        { cx: width * 0.05, cy: height * 0.55, rx: width * 0.3, ry: height * 0.15, darkColor: "rgba(120,20,160,0.25)", lightColor: "rgba(255,255,255,0.6)", offset: 0 },
        { cx: width * 0.95, cy: height * 0.4, rx: width * 0.28, ry: height * 0.14, darkColor: "rgba(180,40,200,0.12)", lightColor: "rgba(255,240,200,0.4)", offset: 0 },
      ];

      orbiters = Array.from({ length: 5 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: rand(60, 110),
        speed: rand(0.0008, 0.0018),
        size: rand(0.8, 1.6),
      }));
    };

    const drawCloud = (c: Cloud, color: string) => {
      const x = c.cx + c.offset;
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - c.rx, c.cy);
      ctx.bezierCurveTo(x - c.rx, c.cy - c.ry, x - c.rx * 0.4, c.cy - c.ry * 1.2, x, c.cy - c.ry * 0.6);
      ctx.bezierCurveTo(x + c.rx * 0.5, c.cy - c.ry * 1.3, x + c.rx, c.cy - c.ry * 0.5, x + c.rx, c.cy);
      ctx.bezierCurveTo(x + c.rx, c.cy + c.ry * 0.6, x - c.rx, c.cy + c.ry * 0.6, x - c.rx, c.cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawSparkle = (x: number, y: number, size: number, alpha: number, color: string) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      const len = size * 4;
      ctx.beginPath();
      ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
      ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
      ctx.lineWidth = size * 0.6;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // dark: [10,10,26] -> [45,10,78] -> [74,10,107]
    // light: [135,206,235] -> [255,179,71] -> [255,140,66]
    const draw = (now: number) => {
      const dt = now - lastT;
      lastT = now;
      const target = modeRef.current === "light" ? 1 : 0;
      const speed = dt / 600;
      transRef.current += Math.max(-speed, Math.min(speed, target - transRef.current));
      const t = transRef.current;

      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, lerpColor([10,10,26], [135,206,235], t));
      g.addColorStop(0.5, lerpColor([45,10,78], [255,179,71], t));
      g.addColorStop(1, lerpColor([74,10,107], [255,140,66], t));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      clouds.forEach((c) => {
        c.offset -= 0.03 * (dt / 16);
        if (c.cx + c.offset + c.rx < 0) c.offset = width + c.rx - c.cx;
        // blend cloud colors
        const dark = c.darkColor.match(/[\d.]+/g)!.map(Number);
        const light = c.lightColor.match(/[\d.]+/g)!.map(Number);
        const r = Math.round(lerp(dark[0], light[0], t));
        const gg = Math.round(lerp(dark[1], light[1], t));
        const b = Math.round(lerp(dark[2], light[2], t));
        const a = lerp(dark[3], light[3], t);
        drawCloud(c, `rgba(${r},${gg},${b},${a})`);
      });

      // Moon -> Sun
      const cx = width / 2;
      const cy = height * 0.22;
      const radius = lerp(28, 40, t);
      const glowRadius = lerp(100, 200, t);
      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      const glowInner = lerpColor([255,180,60], [255,200,0], t);
      const glowAlpha = lerp(0.35, 0.3, t);
      glow.addColorStop(0, glowInner.replace("rgb", "rgba").replace(")", `,${glowAlpha})`));
      glow.addColorStop(1, glowInner.replace("rgb", "rgba").replace(")", ",0)"));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      const bodyColor = lerpColor([255,200,80], [255,220,50], t);
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      // Crescent cutout — fades as we go light
      if (t < 0.95) {
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(cx + radius * 0.45, cy - radius * 0.15, radius * 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const elapsed = now - start;
      stars.forEach((s) => {
        const tt = (elapsed / s.period) * Math.PI * 2 + s.phase;
        let a = 0.2 + (Math.sin(tt) * 0.5 + 0.5) * 0.8;
        let color = s.color;
        if (t > 0) {
          if (s.kind !== "white") {
            // fade out non-white in light mode
            a *= (1 - t);
          } else {
            a *= lerp(1, 0.4, t);
          }
        }
        if (a < 0.02) return;
        if (s.sparkle && t < 0.5) {
          drawSparkle(s.x, s.y, s.r, a, color);
        } else {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (t < 0.5) {
        orbiters.forEach((o) => {
          o.angle += o.speed * dt;
          const ox = cx + Math.cos(o.angle) * o.radius;
          const oy = cy + Math.sin(o.angle) * o.radius;
          const a = (0.4 + (Math.sin(elapsed / 800 + o.angle) * 0.5 + 0.5) * 0.6) * (1 - t * 2);
          drawSparkle(ox, oy, o.size, a, "rgba(255,255,255,0.9)");
        });
      }

      raf = requestAnimationFrame(draw);
    };

    setup();
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      cancelAnimationFrame(raf);
      setup();
      lastT = performance.now();
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden
    />
  );
};

export default NightSky;

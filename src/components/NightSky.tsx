import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  color: string;
  sparkle: boolean;
  period: number;
  phase: number;
};

type Cloud = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  offset: number;
};

const NightSky = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let clouds: Cloud[] = [];
    let orbiters: { angle: number; radius: number; speed: number; size: number }[] = [];
    let raf = 0;
    let frame = 0;
    const start = performance.now();

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Stars
      stars = [];
      for (let i = 0; i < 80; i++) {
        const roll = Math.random();
        let color: string;
        if (roll < 0.6) color = "rgba(255,255,255,0.8)";
        else if (roll < 0.9) color = "rgba(200,169,110,0.9)";
        else color = "rgba(255,180,80,0.7)";
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(1, 2.5),
          color,
          sparkle: false,
          period: rand(2000, 5000),
          phase: Math.random() * Math.PI * 2,
        });
      }
      // Mark 20 as sparkle
      const idx = [...Array(80).keys()].sort(() => Math.random() - 0.5).slice(0, 20);
      idx.forEach((i) => (stars[i].sparkle = true));

      // Clouds — bottom half + edges
      clouds = [
        { cx: width * 0.2, cy: height * 0.85, rx: width * 0.45, ry: height * 0.18, color: "rgba(120,20,160,0.25)", offset: 0 },
        { cx: width * 0.75, cy: height * 0.92, rx: width * 0.5, ry: height * 0.2, color: "rgba(180,40,200,0.12)", offset: 0 },
        { cx: width * 0.05, cy: height * 0.55, rx: width * 0.3, ry: height * 0.15, color: "rgba(120,20,160,0.25)", offset: 0 },
        { cx: width * 0.95, cy: height * 0.4, rx: width * 0.28, ry: height * 0.14, color: "rgba(180,40,200,0.12)", offset: 0 },
      ];

      // Orbiters
      orbiters = Array.from({ length: 5 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: rand(60, 110),
        speed: rand(0.0008, 0.0018),
        size: rand(0.8, 1.6),
      }));
    };

    const drawCloud = (c: Cloud) => {
      const x = c.cx + c.offset;
      ctx.save();
      ctx.fillStyle = c.color;
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
      // Cross
      ctx.beginPath();
      ctx.moveTo(x - len, y);
      ctx.lineTo(x + len, y);
      ctx.moveTo(x, y - len);
      ctx.lineTo(x, y + len);
      ctx.lineWidth = size * 0.6;
      ctx.lineCap = "round";
      ctx.stroke();
      // Center dot
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const draw = (now: number) => {
      // Background gradient
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, "#0A0A1A");
      g.addColorStop(0.5, "#2D0A4E");
      g.addColorStop(1, "#4A0A6B");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Clouds drift
      clouds.forEach((c) => {
        c.offset -= 0.03;
        if (c.cx + c.offset + c.rx < 0) c.offset = width + c.rx - c.cx;
        drawCloud(c);
      });

      // Moon
      const moonX = width / 2;
      const moonY = height * 0.22;
      const moonR = 28;
      // Glow
      const glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 100);
      glow.addColorStop(0, "rgba(255,180,60,0.35)");
      glow.addColorStop(1, "rgba(255,180,60,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 100, 0, Math.PI * 2);
      ctx.fill();
      // Crescent: full moon then subtract
      ctx.fillStyle = "rgba(255,200,80,1.0)";
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(moonX + moonR * 0.45, moonY - moonR * 0.15, moonR * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Stars
      const elapsed = now - start;
      stars.forEach((s) => {
        const t = (elapsed / s.period) * Math.PI * 2 + s.phase;
        const a = 0.2 + (Math.sin(t) * 0.5 + 0.5) * 0.8;
        if (s.sparkle) {
          drawSparkle(s.x, s.y, s.r, a, s.color);
        } else {
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Orbiters around moon
      orbiters.forEach((o) => {
        o.angle += o.speed * 16;
        const ox = moonX + Math.cos(o.angle) * o.radius;
        const oy = moonY + Math.sin(o.angle) * o.radius;
        const a = 0.4 + (Math.sin(elapsed / 800 + o.angle) * 0.5 + 0.5) * 0.6;
        drawSparkle(ox, oy, o.size, a, "rgba(255,255,255,0.9)");
      });

      frame++;
      raf = requestAnimationFrame(draw);
    };

    setup();
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      cancelAnimationFrame(raf);
      setup();
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

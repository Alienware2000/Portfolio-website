/**
 * ParticlesBackground
 * Canvas-based particle network with cursor interaction.
 * - Balanced profile: desktop ~120 particles, mobile ~60
 * - Lines connect within a distance threshold; brightness increases near cursor
 * - DPR-aware, pauses when tab hidden, respects prefers-reduced-motion
 * - Colors come from CSS variables for dark/light themes
 */
import { useEffect, useRef } from "react";

export default function ParticlesBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const lastTsRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      width: 0,
      height: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2), // clamp to 2 for perf
      desktop: true,
      count: 0,
      linkDist: 120,
      nodeRadiusRange: [1.2, 2.2],
      speed: 0.06, // base pixel per ms
    };

    const getVars = () => {
      const cs = getComputedStyle(document.documentElement);
      const node = cs.getPropertyValue("--particle-node").trim() || "169,185,214";
      const link = cs.getPropertyValue("--particle-link").trim() || "126,143,170";
      return {
        node: node,
        link: link,
      };
    };

    const colors = getVars();

    const resize = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      state.desktop = state.width >= 768;
      state.count = state.desktop ? 120 : 60;
      state.linkDist = state.desktop ? 120 : 90;
      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      initParticles();
      draw(0); // draw once on resize
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const initParticles = () => {
      const arr = [];
      for (let i = 0; i < state.count; i++) {
        arr.push({
          x: Math.random() * state.width,
          y: Math.random() * state.height,
          vx: rand(-1, 1) * state.speed,
          vy: rand(-1, 1) * state.speed,
          r: rand(state.nodeRadiusRange[0], state.nodeRadiusRange[1]),
        });
      }
      particlesRef.current = arr;
    };

    const integrate = (p, dt) => {
      // Cursor attraction with gentle spring
      if (mouseRef.current.active) {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist2 = dx * dx + dy * dy;
        const influence = 140;
        if (dist2 < influence * influence) {
          const factor = 0.00015 * (1 - Math.sqrt(dist2) / influence);
          p.vx += dx * factor;
          p.vy += dy * factor;
        }
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Screen wrap
      if (p.x < -10) p.x = state.width + 10;
      else if (p.x > state.width + 10) p.x = -10;
      if (p.y < -10) p.y = state.height + 10;
      else if (p.y > state.height + 10) p.y = -10;
      // Gentle velocity damping
      p.vx *= 0.995;
      p.vy *= 0.995;
    };

    const draw = (ts) => {
      if (pausedRef.current) return;
      const dt = lastTsRef.current ? Math.min(32, ts - lastTsRef.current) : 16;
      lastTsRef.current = ts;
      ctx.clearRect(0, 0, state.width, state.height);

      const parts = particlesRef.current;
      const linkDist2 = state.linkDist * state.linkDist;

      // Integrate positions
      if (!prefersReduced) {
        for (let i = 0; i < parts.length; i++) integrate(parts[i], dt);
      }

      // Draw links
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 <= linkDist2) {
            const dist = Math.sqrt(d2);
            const alphaBase = 1 - dist / state.linkDist; // near = 1, far = 0
            // Boost when near cursor
            let alpha = alphaBase * 0.6;
            if (mouseRef.current.active) {
              const mx = (p.x + q.x) * 0.5 - mouseRef.current.x;
              const my = (p.y + q.y) * 0.5 - mouseRef.current.y;
              const md2 = mx * mx + my * my;
              if (md2 < 160 * 160) alpha = Math.min(1, alpha * 1.5);
            }
            ctx.strokeStyle = `rgba(${colors.link}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        let alpha = 0.9;
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) alpha = 1.0;
        }
        ctx.fillStyle = `rgba(${colors.node}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const handleMouse = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleLeave = () => {
      mouseRef.current.active = false;
    };
    const handleVisibility = () => {
      pausedRef.current = document.hidden;
      if (!pausedRef.current && !rafRef.current) {
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    }, { passive: true });
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("touchend", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    resize();
    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      // Static render: no motion for reduced motion users
      draw(0);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("touchmove", () => {});
      window.removeEventListener("touchend", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-50"
      style={{ backgroundColor: "rgb(var(--bg-page))" }}
    />
  );
}



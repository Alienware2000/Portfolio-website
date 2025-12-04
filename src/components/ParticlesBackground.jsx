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
  const interactionsAttachedRef = useRef(false);

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
      interactive: true, // disabled on mobile
      brownian: false, // enable gentle random drift on mobile
      count: 0,
      linkDist: 120,
      nodeRadiusRange: [1.2, 2.2],
      speed: 0.06, // base pixel per ms (desktop)
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
      // Disable interactivity for ALL devices; enable subtle Brownian motion
      state.interactive = false;
      state.brownian = true;
      state.count = state.desktop ? 120 : 60;
      state.linkDist = state.desktop ? 120 : 110; // keep good fill
      state.nodeRadiusRange = state.desktop ? [1.2, 2.2] : [1.0, 1.8];
      state.speed = state.desktop ? 0.04 : 0.03; // subtle motion everywhere
      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      initParticles();
      draw(0); // draw once on resize
      // Update interaction listeners based on current mode
      updateInteractionListeners();
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const initParticles = () => {
      const arr = [];
      const minDist = 50; // Slightly larger minimum distance
      const maxAttempts = 30; // Max attempts to place a particle
      
      // Improved grid-based distribution for all devices
      const aspectRatio = state.width / state.height;
      const cols = Math.ceil(Math.sqrt(state.count * aspectRatio));
      const rows = Math.ceil(state.count / cols);
      const cellW = state.width / cols;
      const cellH = state.height / rows;
      
      // Reduced jitter for better spacing
      const jitterAmount = 0.2; // Even less jitter
      
      let placed = 0;
      for (let r = 0; r < rows && placed < state.count; r++) {
        for (let c = 0; c < cols && placed < state.count; c++) {
          // Center position in cell
          const baseX = c * cellW + cellW / 2;
          const baseY = r * cellH + cellH / 2;
          
          // Try to place with minimum distance constraint
          let x, y;
          let attempts = 0;
          let valid = false;
          
          while (!valid && attempts < maxAttempts) {
            const jitterX = rand(-jitterAmount, jitterAmount) * cellW;
            const jitterY = rand(-jitterAmount, jitterAmount) * cellH;
            x = baseX + jitterX;
            y = baseY + jitterY;
            
            // Keep particles away from edges (padding)
            const padding = 30; // Increased padding
            if (x < padding || x > state.width - padding || 
                y < padding || y > state.height - padding) {
              attempts++;
              continue;
            }
            
            // Check minimum distance from existing particles
            valid = true;
            for (let i = 0; i < arr.length; i++) {
              const dx = x - arr[i].x;
              const dy = y - arr[i].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDist) {
                valid = false;
                break;
              }
            }
            attempts++;
          }
          
          // If we couldn't find a valid spot, use the base position anyway
          if (!valid) {
            x = baseX;
            y = baseY;
          }
          
          arr.push({
            x,
            y,
            vx: rand(-1, 1) * state.speed * 0.6,
            vy: rand(-1, 1) * state.speed * 0.6,
            r: rand(state.nodeRadiusRange[0], state.nodeRadiusRange[1]),
          });
          placed++;
        }
      }
      
      particlesRef.current = arr;
    };

    const integrate = (p, dt) => {
      // Cursor attraction (if interactive)
      if (state.interactive && mouseRef.current.active) {
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
      
      // Brownian motion - keep it natural
      if (state.brownian) {
        p.vx += rand(-1, 1) * state.speed * 0.015; // Restore natural Brownian
        p.vy += rand(-1, 1) * state.speed * 0.015;
        
        // Cap velocity
        const max = state.speed * 0.8;
        if (p.vx > max) p.vx = max;
        if (p.vx < -max) p.vx = -max;
        if (p.vy > max) p.vy = max;
        if (p.vy < -max) p.vy = -max;
      }
      
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      // Screen wrap with corner avoidance - this is the key fix
      const cornerAvoidDist = 80; // Distance from corner to avoid
      const cornerPush = 0.0003; // Subtle push away from corners
      
      // Check and avoid corners
      const distToTopLeft = Math.sqrt(p.x * p.x + p.y * p.y);
      const distToTopRight = Math.sqrt((state.width - p.x) * (state.width - p.x) + p.y * p.y);
      const distToBottomLeft = Math.sqrt(p.x * p.x + (state.height - p.y) * (state.height - p.y));
      const distToBottomRight = Math.sqrt((state.width - p.x) * (state.width - p.x) + (state.height - p.y) * (state.height - p.y));
      
      // Push away from nearest corner
      if (distToTopLeft < cornerAvoidDist) {
        p.vx += cornerPush;
        p.vy += cornerPush;
      }
      if (distToTopRight < cornerAvoidDist) {
        p.vx -= cornerPush;
        p.vy += cornerPush;
      }
      if (distToBottomLeft < cornerAvoidDist) {
        p.vx += cornerPush;
        p.vy -= cornerPush;
      }
      if (distToBottomRight < cornerAvoidDist) {
        p.vx -= cornerPush;
        p.vy -= cornerPush;
      }
      
      // Screen wrap (natural, no clustering)
      if (p.x < 0) p.x = state.width;
      else if (p.x > state.width) p.x = 0;
      if (p.y < 0) p.y = state.height;
      else if (p.y > state.height) p.y = 0;
      
      // Gentle velocity damping
      p.vx *= 0.998;
      p.vy *= 0.998;
    };

    const draw = (ts) => {
      if (pausedRef.current) return;
      // Consistent frame timing to prevent scroll jitter
      const targetFPS = 60;
      const targetDt = 1000 / targetFPS;
      const dt = lastTsRef.current 
        ? Math.min(targetDt * 2, Math.max(targetDt * 0.5, ts - lastTsRef.current))
        : targetDt;
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
            ctx.lineWidth = state.desktop ? 0.6 : 0.5;
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
      if (!state.interactive) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleLeave = () => {
      mouseRef.current.active = false;
    };
    const handleTouchMove = (e) => {
      if (!state.interactive) return;
      if (e.touches && e.touches[0]) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        pausedRef.current = true;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      } else {
        pausedRef.current = false;
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const addInteractionListeners = () => {
      if (interactionsAttachedRef.current) return;
      window.addEventListener("mousemove", handleMouse, { passive: true });
      window.addEventListener("mouseleave", handleLeave);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleLeave);
      interactionsAttachedRef.current = true;
    };

    const removeInteractionListeners = () => {
      if (!interactionsAttachedRef.current) return;
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleLeave);
      interactionsAttachedRef.current = false;
    };

    const updateInteractionListeners = () => {
      if (state.interactive) addInteractionListeners();
      else {
        removeInteractionListeners();
        mouseRef.current.active = false; // ensure no forces applied
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    // Handle back/forward cache and lifecycle on Safari/iOS
    window.addEventListener("pageshow", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);

    resize();
    // Attach or detach interaction listeners based on initial mode
    updateInteractionListeners();
    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      // Static render: no motion for reduced motion users
      draw(0);
    }

    return () => {
      window.removeEventListener("resize", resize);
      removeInteractionListeners();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
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



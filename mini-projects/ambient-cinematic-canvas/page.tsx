"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

type TimePhase = "night" | "dawn" | "day" | "dusk";

const PHASE_THEME: Record<TimePhase, { from: string; via: string; to: string; glow: string }> = {
  night: { from: "#05010f", via: "#0d0a2b", to: "#1a1035", glow: "99,102,241" },
  dawn: { from: "#1a1035", via: "#5b3a6e", to: "#ff9472", glow: "251,146,60" },
  day: { from: "#123a5f", via: "#1e6fa8", to: "#4facfe", glow: "56,189,248" },
  dusk: { from: "#ff9472", via: "#7a3a6e", to: "#1a1035", glow: "236,72,153" },
};

const QUOTES = [
  "الهدوء ليس غياب الضجيج، بل حضور السكينة.",
  "كل لحظة تمر هي لوحة لا تُرسم مرتين.",
  "استمع إلى الصمت، ففيه أعمق الأصوات.",
  "الوقت نهر هادئ… واقف على ضفته الآن.",
  "Stillness is a language the universe speaks fluently.",
];

function getPhase(hour: number): TimePhase {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  phase: number;
}

export default function AmbientCinematicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const [now, setNow] = useState<Date | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{
    gain: GainNode;
    oscillators: OscillatorNode[];
    noise: AudioBufferSourceNode;
  } | null>(null);

  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springX = useSpring(glowX, { stiffness: 40, damping: 20, mass: 0.6 });
  const springY = useSpring(glowY, { stiffness: 40, damping: 20, mass: 0.6 });

  // Clock tick
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rotating quotes
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // Mouse-driven spotlight
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      glowX.set(e.clientX);
      glowY.set(e.clientY);
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [glowX, glowY]);

  // Canvas particle field (fireflies)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.8 + 0.4,
      baseAlpha: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 0.6;
          p.y -= (dy / dist) * force * 0.6;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const twinkle = Math.sin(t * 1.5 + p.phase) * 0.3 + 0.7;
        const alpha = p.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 244, 214, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(255, 244, 214, 0.8)";
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const stopAmbience = useCallback(() => {
    const ctx = audioCtxRef.current;
    const nodes = audioNodesRef.current;
    if (!ctx || !nodes) return;
    const now = ctx.currentTime;
    nodes.gain.gain.linearRampToValueAtTime(0, now + 1.2);
    setTimeout(() => {
      nodes.oscillators.forEach((o) => o.stop());
      nodes.noise.stop();
      ctx.close();
      audioCtxRef.current = null;
      audioNodesRef.current = null;
    }, 1300);
  }, []);

  const startAmbience = useCallback(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    masterGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2);

    const oscillators = [110, 165, 220].map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.25 / (i + 1);
      lfoGain.connect(oscGain.gain);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start();
      lfo.start();
      return osc;
    });

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 500;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    audioNodesRef.current = { gain: masterGain, oscillators, noise };
  }, []);

  useEffect(() => {
    if (soundOn) startAmbience();
    else if (audioCtxRef.current) stopAmbience();
    return () => {
      if (audioCtxRef.current) stopAmbience();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  const phase = getPhase(now?.getHours() ?? 12);
  const theme = PHASE_THEME[phase];

  const timeString = now
    ? now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : "--:--:--";
  const dateString = now
    ? now.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })
    : "";

  return (
    <main
      className="relative h-screen w-screen overflow-hidden font-sans transition-colors duration-[3000ms]"
      style={{
        background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
      }}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />

      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          left: springX,
          top: springY,
          x: "-50%",
          y: "-50%",
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "9999px",
          background: `radial-gradient(circle, rgba(${theme.glow},0.18) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center text-white">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-sm uppercase tracking-[0.4em] text-white/60"
        >
          {dateString}
        </motion.span>

        <motion.h1
          key={timeString.slice(0, 5)}
          initial={{ opacity: 0.4, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[clamp(3rem,12vw,9rem)] font-light tracking-wide drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        >
          {timeString}
        </motion.h1>

        <div className="h-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1 }}
              className="max-w-xl text-base font-light text-white/80"
            >
              {QUOTES[quoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        onClick={() => setSoundOn((s) => !s)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="absolute bottom-8 right-8 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm text-white/80 backdrop-blur-md hover:bg-white/10"
      >
        <motion.span
          animate={soundOn ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.5 }}
          transition={soundOn ? { duration: 2, repeat: Infinity } : {}}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: soundOn ? `rgb(${theme.glow})` : "rgba(255,255,255,0.4)" }}
        />
        {soundOn ? "إيقاف الصوت المحيطي" : "تشغيل الصوت المحيطي"}
      </motion.button>
    </main>
  );
}

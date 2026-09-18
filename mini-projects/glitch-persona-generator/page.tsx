"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Copy, Check, Download, ShieldAlert, Cpu } from "lucide-react";

interface Persona {
  codename: string;
  title: string;
  faction: string;
  serial: string;
  power: number;
  threat: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  pixels: string[];
}

const PREFIXES = [
  "Neon",
  "Cyber",
  "Ghost",
  "Quantum",
  "Chrome",
  "Void",
  "Nova",
  "Shadow",
  "Static",
  "Drift",
  "Binary",
  "Rogue",
  "Astral",
  "Synth",
  "Iron",
];

const CORES = [
  "Vector",
  "Phantom",
  "Wraith",
  "Circuit",
  "Cipher",
  "Echo",
  "Fracture",
  "Specter",
  "Glitch",
  "Nexus",
  "Prism",
  "Havoc",
  "Pulse",
  "Ronin",
  "Mirage",
];

const JOB_TITLES = [
  "Quantum Code Architect",
  "Sub-space Data Broker",
  "Neural Net Smuggler",
  "Holographic Memory Thief",
  "Chrono-Signal Hacker",
  "Synthetic Dream Curator",
  "Black-Market Firmware Dealer",
  "Orbital Grid Saboteur",
  "Bio-Digital Mercenary",
  "Encrypted Ghost Courier",
  "Neuro-Link Interrogator",
  "Fractal Signal Cartographer",
  "Rogue AI Whisperer",
  "Deep-Net Bounty Hunter",
  "Synaptic Firewall Breaker",
];

const FACTIONS = [
  "Sector 9 Underground",
  "Neo-Kyoto Black Market",
  "Orbital Ring Collective",
  "The Static Choir",
  "Chrome Cathedral Syndicate",
  "Zero-Light District",
  "The Unlisted Network",
  "Ashfall Combine",
];

const PIXEL_COLORS = ["#22d3ee", "#f472b6", "#a855f7", "#facc15", "#34d399", "transparent"];

const DEFAULT_PIXELS = Array.from({ length: 25 }, (_, i) =>
  i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#a855f7" : "transparent"
);

const DEFAULT_PERSONA: Persona = {
  codename: "Neon Vector",
  title: "Quantum Code Architect",
  faction: "Neo-Kyoto Black Market",
  serial: "PX-0001-A0",
  power: 62,
  threat: "HIGH",
  pixels: DEFAULT_PIXELS,
};

const THREAT_STYLES: Record<Persona["threat"], string> = {
  LOW: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  MODERATE: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10",
  HIGH: "text-fuchsia-400 border-fuchsia-400/40 bg-fuchsia-400/10",
  CRITICAL: "text-rose-400 border-rose-400/40 bg-rose-400/10",
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSerial(): string {
  const chars = "0123456789ABCDEF";
  let serial = "PX-";
  for (let i = 0; i < 4; i++) serial += chars[Math.floor(Math.random() * chars.length)];
  serial += "-";
  for (let i = 0; i < 3; i++) serial += chars[Math.floor(Math.random() * chars.length)];
  return serial;
}

function generatePixels(): string[] {
  const half: string[][] = [];
  for (let row = 0; row < 5; row++) {
    const cols: string[] = [];
    for (let col = 0; col < 3; col++) {
      cols.push(randomFrom(PIXEL_COLORS));
    }
    half.push(cols);
  }
  const grid: string[] = [];
  for (let row = 0; row < 5; row++) {
    grid.push(half[row][0], half[row][1], half[row][2], half[row][1], half[row][0]);
  }
  return grid;
}

function threatFromPower(power: number): Persona["threat"] {
  if (power >= 90) return "CRITICAL";
  if (power >= 65) return "HIGH";
  if (power >= 35) return "MODERATE";
  return "LOW";
}

function generatePersona(): Persona {
  const power = Math.floor(Math.random() * 80) + 15;
  return {
    codename: `${randomFrom(PREFIXES)} ${randomFrom(CORES)}`,
    title: randomFrom(JOB_TITLES),
    faction: randomFrom(FACTIONS),
    serial: randomSerial(),
    power,
    threat: threatFromPower(power),
    pixels: generatePixels(),
  };
}

export default function GlitchPersonaGenerator() {
  const [persona, setPersona] = useState<Persona>(DEFAULT_PERSONA);
  const [isGlitching, setIsGlitching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayedPower, setDisplayedPower] = useState(0);
  const glitchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGenerate = useCallback(() => {
    setIsGlitching(true);
    if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
    glitchTimeout.current = setTimeout(() => {
      setPersona(generatePersona());
      setIsGlitching(false);
    }, 380);
  }, []);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  useEffect(() => {
    return () => {
      if (glitchTimeout.current) clearTimeout(glitchTimeout.current);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    const duration = 900;
    const to = persona.power;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedPower(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [persona.power]);

  const summaryText = `CODENAME: ${persona.codename}\nDESIGNATION: ${persona.title}\nAFFILIATION: ${persona.faction}\nSERIAL: ${persona.serial}\nPOWER LEVEL: ${persona.power}\nTHREAT: ${persona.threat}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [summaryText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${persona.codename.replace(/\s+/g, "_").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [summaryText, persona.codename]);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050508] px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050508_85%)]" />

      <motion.div
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[120px]"
        style={{ left: "18%", top: "20%" }}
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.12, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[120px]"
        style={{ right: "16%", bottom: "16%" }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-cyan-400/30 bg-black/70 p-6 shadow-[0_0_60px_-10px_rgba(34,211,238,0.35)] backdrop-blur-xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-400/70">
          <span>Subject File</span>
          <span>{persona.serial}</span>
        </div>

        <div className="mb-6 flex items-center gap-5">
          <div className="relative shrink-0 rounded-lg border border-cyan-400/30 bg-black/60 p-1.5 shadow-[0_0_25px_-5px_rgba(34,211,238,0.5)]">
            <div className="grid grid-cols-5 grid-rows-5 gap-[2px]">
              {persona.pixels.map((color, i) => (
                <div
                  key={i}
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                  style={{ backgroundColor: color === "transparent" ? "rgba(255,255,255,0.04)" : color }}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {isGlitching ? (
                <motion.div
                  key="glitching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlitchLabel text={persona.codename} />
                </motion.div>
              ) : (
                <motion.h1
                  key={persona.codename}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="truncate text-xl font-bold uppercase tracking-wide text-white sm:text-2xl"
                  style={{ textShadow: "0 0 18px rgba(34,211,238,0.5)" }}
                >
                  {persona.codename}
                </motion.h1>
              )}
            </AnimatePresence>
            <p className="mt-1 truncate font-mono text-xs uppercase tracking-wider text-fuchsia-400/80">
              {persona.title}
            </p>
            <p className="mt-1 truncate text-[11px] text-white/40">{persona.faction}</p>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${THREAT_STYLES[persona.threat]}`}
          >
            <ShieldAlert className="h-3 w-3" />
            {persona.threat}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
            <Cpu className="h-3 w-3" />
            Sector {persona.serial.slice(3, 5)}
          </span>
        </div>

        <div className="mb-7">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            <span>Power Level</span>
            <span className="text-cyan-300">{displayedPower}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-rose-400"
              initial={{ width: "0%" }}
              animate={{ width: `${persona.power}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ boxShadow: "0 0 14px rgba(217,70,239,0.55)" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleGenerate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={isGlitching}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)] transition-opacity disabled:opacity-70"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGlitching ? "animate-spin" : ""}`} />
            Generate New Persona
          </motion.button>

          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/10"
            aria-label="Copy persona data"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </motion.button>

          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/10"
            aria-label="Download persona file"
          >
            <Download className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}

function GlitchLabel({ text }: { text: string }) {
  return (
    <div className="relative text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
      <motion.span
        className="absolute inset-0 text-cyan-400 mix-blend-screen"
        animate={{ x: [0, -3, 2, -2, 0], opacity: [0, 1, 0.6, 1, 0] }}
        transition={{ duration: 0.38, times: [0, 0.25, 0.5, 0.75, 1] }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-fuchsia-400 mix-blend-screen"
        animate={{ x: [0, 3, -2, 2, 0], opacity: [0, 1, 0.6, 1, 0] }}
        transition={{ duration: 0.38, times: [0, 0.25, 0.5, 0.75, 1] }}
      >
        {text}
      </motion.span>
      <span className="relative opacity-90">{text}</span>
    </div>
  );
}

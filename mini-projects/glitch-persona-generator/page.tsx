"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Copy, Check, Download, ShieldAlert, Cpu, Languages } from "lucide-react";

type Lang = "en" | "ar";
type Threat = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

interface Persona {
  prefixIndex: number;
  coreIndex: number;
  jobIndex: number;
  factionIndex: number;
  serial: string;
  power: number;
  threat: Threat;
  pixels: string[];
}

const PREFIXES: Record<Lang, string[]> = {
  en: ["Neon", "Cyber", "Ghost", "Quantum", "Chrome", "Void", "Nova", "Shadow", "Static", "Drift", "Binary", "Rogue", "Astral", "Synth", "Iron"],
  ar: ["نيون", "سايبر", "شبح", "كمّي", "كروم", "العدم", "نوفا", "ظل", "ثابت", "انجراف", "ثنائي", "مارق", "نجمي", "تخليقي", "حديدي"],
};

const CORES: Record<Lang, string[]> = {
  en: ["Vector", "Phantom", "Wraith", "Circuit", "Cipher", "Echo", "Fracture", "Specter", "Glitch", "Nexus", "Prism", "Havoc", "Pulse", "Ronin", "Mirage"],
  ar: ["متجه", "فانتوم", "هائم", "دائرة", "شيفرة", "صدى", "كسر", "طيف", "علة", "ترابط", "منشور", "فوضى", "نبضة", "رونين", "سراب"],
};

const JOB_TITLES: Record<Lang, string[]> = {
  en: [
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
  ],
  ar: [
    "مهندس الشيفرة الكمّية",
    "سمسار بيانات الفضاء التحتي",
    "مهرّب الشبكات العصبية",
    "لص الذاكرة الهولوغرافية",
    "مخترق الإشارات الزمنية",
    "أمين الأحلام الاصطناعية",
    "تاجر البرمجيات الثابتة في السوق السوداء",
    "مخرّب الشبكة المدارية",
    "مرتزق حيوي-رقمي",
    "ساعي الأشباح المشفّر",
    "محقق الروابط العصبية",
    "راسم خرائط الإشارات الكسورية",
    "مروّض الذكاء الاصطناعي المارق",
    "صياد جوائز الشبكة العميقة",
    "كاسر جدار الحماية المشبكي",
  ],
};

const FACTIONS: Record<Lang, string[]> = {
  en: [
    "Sector 9 Underground",
    "Neo-Kyoto Black Market",
    "Orbital Ring Collective",
    "The Static Choir",
    "Chrome Cathedral Syndicate",
    "Zero-Light District",
    "The Unlisted Network",
    "Ashfall Combine",
  ],
  ar: [
    "الحي السفلي - القطاع 9",
    "السوق السوداء - نيو كيوتو",
    "تحالف الحلقة المدارية",
    "جوقة التشويش",
    "نقابة كاتدرائية الكروم",
    "حي انعدام الضوء",
    "الشبكة غير المسجّلة",
    "اتحاد الرماد المتساقط",
  ],
};

const THREAT_LABELS: Record<Lang, Record<Threat, string>> = {
  en: { LOW: "LOW", MODERATE: "MODERATE", HIGH: "HIGH", CRITICAL: "CRITICAL" },
  ar: { LOW: "منخفض", MODERATE: "متوسط", HIGH: "مرتفع", CRITICAL: "حرج" },
};

const UI_TEXT: Record<Lang, {
  subjectFile: string;
  powerLevel: string;
  generate: string;
  sector: string;
  copyLabel: string;
  downloadLabel: string;
  summary: { codename: string; designation: string; affiliation: string; serial: string; power: string; threat: string };
}> = {
  en: {
    subjectFile: "Subject File",
    powerLevel: "Power Level",
    generate: "Generate New Persona",
    sector: "Sector",
    copyLabel: "Copy persona data",
    downloadLabel: "Download persona file",
    summary: {
      codename: "CODENAME",
      designation: "DESIGNATION",
      affiliation: "AFFILIATION",
      serial: "SERIAL",
      power: "POWER LEVEL",
      threat: "THREAT",
    },
  },
  ar: {
    subjectFile: "ملف الهوية",
    powerLevel: "مستوى الطاقة",
    generate: "توليد هوية جديدة",
    sector: "قطاع",
    copyLabel: "نسخ بيانات الهوية",
    downloadLabel: "تحميل ملف الهوية",
    summary: {
      codename: "الاسم الرمزي",
      designation: "المسمى الوظيفي",
      affiliation: "الانتماء",
      serial: "الرقم التسلسلي",
      power: "مستوى الطاقة",
      threat: "التهديد",
    },
  },
};

const PIXEL_COLORS = ["#22d3ee", "#f472b6", "#a855f7", "#facc15", "#34d399", "transparent"];

const DEFAULT_PIXELS = Array.from({ length: 25 }, (_, i) =>
  i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#a855f7" : "transparent"
);

const DEFAULT_PERSONA: Persona = {
  prefixIndex: 0,
  coreIndex: 0,
  jobIndex: 0,
  factionIndex: 1,
  serial: "PX-0001-A0",
  power: 62,
  threat: "HIGH",
  pixels: DEFAULT_PIXELS,
};

const THREAT_STYLES: Record<Threat, string> = {
  LOW: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  MODERATE: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10",
  HIGH: "text-fuchsia-400 border-fuchsia-400/40 bg-fuchsia-400/10",
  CRITICAL: "text-rose-400 border-rose-400/40 bg-rose-400/10",
};

function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
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
      cols.push(PIXEL_COLORS[randomIndex(PIXEL_COLORS.length)]);
    }
    half.push(cols);
  }
  const grid: string[] = [];
  for (let row = 0; row < 5; row++) {
    grid.push(half[row][0], half[row][1], half[row][2], half[row][1], half[row][0]);
  }
  return grid;
}

function threatFromPower(power: number): Threat {
  if (power >= 90) return "CRITICAL";
  if (power >= 65) return "HIGH";
  if (power >= 35) return "MODERATE";
  return "LOW";
}

function generatePersona(): Persona {
  const power = Math.floor(Math.random() * 80) + 15;
  return {
    prefixIndex: randomIndex(PREFIXES.en.length),
    coreIndex: randomIndex(CORES.en.length),
    jobIndex: randomIndex(JOB_TITLES.en.length),
    factionIndex: randomIndex(FACTIONS.en.length),
    serial: randomSerial(),
    power,
    threat: threatFromPower(power),
    pixels: generatePixels(),
  };
}

export default function GlitchPersonaGenerator() {
  const [lang, setLang] = useState<Lang>("en");
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

  const t = UI_TEXT[lang];
  const codename = `${PREFIXES[lang][persona.prefixIndex]} ${CORES[lang][persona.coreIndex]}`;
  const jobTitle = JOB_TITLES[lang][persona.jobIndex];
  const faction = FACTIONS[lang][persona.factionIndex];
  const threatLabel = THREAT_LABELS[lang][persona.threat];

  const summaryText = `${t.summary.codename}: ${codename}\n${t.summary.designation}: ${jobTitle}\n${t.summary.affiliation}: ${faction}\n${t.summary.serial}: ${persona.serial}\n${t.summary.power}: ${persona.power}\n${t.summary.threat}: ${threatLabel}`;

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
    link.download = `${codename.replace(/\s+/g, "_").toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [summaryText, codename]);

  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050508] px-4 py-16"
    >
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

      <button
        onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
        dir="ltr"
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/60 backdrop-blur-md transition-colors hover:bg-white/10 sm:right-6 sm:top-6"
        aria-label="Toggle language"
      >
        <Languages className="h-3.5 w-3.5" />
        {lang === "en" ? "عربي" : "EN"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-cyan-400/30 bg-black/70 p-6 shadow-[0_0_60px_-10px_rgba(34,211,238,0.35)] backdrop-blur-xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-400/70">
          <span>{t.subjectFile}</span>
          <span dir="ltr">{persona.serial}</span>
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
                  <GlitchLabel text={codename} />
                </motion.div>
              ) : (
                <motion.h1
                  key={codename + lang}
                  initial={{ opacity: 0, x: lang === "ar" ? 6 : -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="truncate text-xl font-bold uppercase tracking-wide text-white sm:text-2xl"
                  style={{ textShadow: "0 0 18px rgba(34,211,238,0.5)" }}
                >
                  {codename}
                </motion.h1>
              )}
            </AnimatePresence>
            <p className="mt-1 truncate font-mono text-xs uppercase tracking-wider text-fuchsia-400/80">
              {jobTitle}
            </p>
            <p className="mt-1 truncate text-[11px] text-white/40">{faction}</p>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${THREAT_STYLES[persona.threat]}`}
          >
            <ShieldAlert className="h-3 w-3" />
            {threatLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
            <Cpu className="h-3 w-3" />
            {t.sector} <span dir="ltr">{persona.serial.slice(3, 5)}</span>
          </span>
        </div>

        <div className="mb-7">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            <span>{t.powerLevel}</span>
            <span className="text-cyan-300" dir="ltr">{displayedPower}%</span>
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
            {t.generate}
          </motion.button>

          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/10"
            aria-label={t.copyLabel}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </motion.button>

          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition-colors hover:bg-white/10"
            aria-label={t.downloadLabel}
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

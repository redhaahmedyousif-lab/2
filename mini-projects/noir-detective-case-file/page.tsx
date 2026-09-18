"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  ClipboardList,
  ArrowLeft,
  Fingerprint,
  Footprints,
  Cigarette,
  BookOpen,
  Lock,
  Ticket,
  FileText,
  Shirt,
  Eye,
  MapPin,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Siren,
  Quote,
  User,
  Gavel,
  type LucideIcon,
} from "lucide-react";

type Screen = "menu" | "briefing" | "investigate" | "accuse" | "result";
type Tab = "scene" | "suspects" | "evidence";
type ClueIcon = "fingerprint" | "footprints" | "cigarette" | "ledger" | "lock" | "ticket" | "paper" | "fabric" | "eye";

interface SceneSpot {
  id: string;
  label: string;
  icon: ClueIcon;
  clueTitle: string;
  clueText: string;
}

interface Suspect {
  id: string;
  name: string;
  role: string;
  testimony: string;
  isCulprit: boolean;
}

interface CaseFile {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  briefing: string[];
  spots: SceneSpot[];
  suspects: Suspect[];
  successText: string;
  failureText: string;
}

const CLUE_ICONS: Record<ClueIcon, LucideIcon> = {
  fingerprint: Fingerprint,
  footprints: Footprints,
  cigarette: Cigarette,
  ledger: BookOpen,
  lock: Lock,
  ticket: Ticket,
  paper: FileText,
  fabric: Shirt,
  eye: Eye,
};

const SUSPECT_ACCENTS = ["border-amber-500/40 text-amber-400", "border-rose-500/40 text-rose-400", "border-neutral-400/40 text-neutral-300"];

const CASES: CaseFile[] = [
  {
    id: "harbor",
    title: "The Dark Harbor Murder",
    subtitle: "Case File No. 7",
    location: "Pier 7, Blackwater Docks",
    briefing: [
      "Rain hasn't stopped since Tuesday. Sal Moretti, dockside fixer and small-time smuggler, turned up cold between two crate stacks at Pier 7 — no witnesses, no struggle, no mercy.",
      "The harbor keeps its secrets close. You've got a body, a ledger with a page torn out, and a city full of people who wanted Moretti gone. Time to start pulling threads, Detective.",
    ],
    spots: [
      {
        id: "body",
        label: "The Body",
        icon: "fingerprint",
        clueTitle: "Cause of Death",
        clueText:
          "A single puncture wound, close range. No signs of a struggle — Moretti knew whoever did this. He never saw it coming.",
      },
      {
        id: "crates",
        label: "Stacked Crates",
        icon: "fabric",
        clueTitle: "Torn Glove",
        clueText:
          "A torn leather glove wedged between the crates. Stitched inside the cuff: the initials 'R.K.'",
      },
      {
        id: "ledger",
        label: "The Ledger",
        icon: "ledger",
        clueTitle: "Missing Page",
        clueText:
          "Moretti's shipping ledger, one page torn clean out. The ink on the next page is still tacky — someone erased a debt tonight.",
      },
      {
        id: "footprints",
        label: "Muddy Prints",
        icon: "footprints",
        clueTitle: "Boot Prints",
        clueText:
          "Fresh mud, size eleven, worn down at the heel. They lead away from the body and vanish at the warehouse door.",
      },
      {
        id: "cigarette",
        label: "Cigarette Butt",
        icon: "cigarette",
        clueTitle: "Velvet Noir",
        clueText:
          "A lipstick-stained cigarette butt near the railing. The brand is Velvet Noir — expensive, imported, not something you'd find in a dockworker's pocket.",
      },
    ],
    suspects: [
      {
        id: "ruth",
        name: "Ruth Kane",
        role: "Dock Foreman",
        testimony:
          "\"I was at Sully's Tavern till closing, ask anyone. That glove ain't been on my hand in a week — lost it right here on this pier, matter of fact. Somebody's trying to hang this on me.\"",
        isCulprit: false,
      },
      {
        id: "vincent",
        name: "Vincent Cole",
        role: "Rival Smuggler",
        testimony:
          "\"Moretti and I had... business disagreements. But I was at my club all night, surrounded by witnesses. Ask my doorman. I had no reason to get my hands dirty when I could just buy him out.\"",
        isCulprit: false,
      },
      {
        id: "lila",
        name: "Lila Duval",
        role: "Nightclub Singer",
        testimony:
          "\"Sal and I were... close. Everyone saw us arguing outside the club yesterday, but that was about a ring, not murder. I loved him, Detective. Why would I ever—\" Her hand trembles as she reaches for another Velvet Noir.",
        isCulprit: true,
      },
    ],
    successText:
      "You lay the torn ledger page and the Velvet Noir cigarette on the table. Lila Duval's composure cracks like old varnish. 'He was going to leave me with nothing,' she whispers. 'I just wanted my share.' The cuffs click shut. Case closed — the harbor sleeps easier tonight, Detective.",
    failureText:
      "The cell door closes on an innocent name. Somewhere across town, Lila Duval finishes her last cigarette of the night and disappears into the fog — free, and one debt lighter. The real killer got away, Detective.",
  },
  {
    id: "microphone",
    title: "The Case of the Missing Microphone",
    subtitle: "Case File No. 12",
    location: "The Blue Note Jazz Club",
    briefing: [
      "The Blue Note's anniversary show is tomorrow night, and its centerpiece — a legendary vintage microphone once owned by a late jazz great — has vanished from its locked display case.",
      "No forced doors, a club full of suspects, and an owner sweating through his collar. Somebody wanted that microphone gone badly enough to risk everything. Find out who.",
    ],
    spots: [
      {
        id: "case",
        label: "Display Case",
        icon: "lock",
        clueTitle: "Forced Lock",
        clueText:
          "Fresh scratch marks around the lock. Whoever opened this didn't have a key — they were in a hurry, and they were scared.",
      },
      {
        id: "alley",
        label: "Back Alley",
        icon: "ticket",
        clueTitle: "Pawn Ticket",
        clueText:
          "A crumpled pawn shop ticket in the trash bin. Stub number 114, dated this afternoon. Someone needed cash fast.",
      },
      {
        id: "door",
        label: "Backstage Door",
        icon: "fabric",
        clueTitle: "Snagged Scarf",
        clueText:
          "A thread of yellow silk caught on the door hinge. Looks like it tore off in a hurry — or was left there to be found.",
      },
      {
        id: "desk",
        label: "Owner's Desk",
        icon: "paper",
        clueTitle: "Insurance Papers",
        clueText:
          "A freshly signed insurance policy, the microphone listed at triple its worth. The ink's barely dry, and neither is Donnelly's signature.",
      },
      {
        id: "bar",
        label: "The Bar",
        icon: "eye",
        clueTitle: "Overheard",
        clueText:
          "The bartender remembers a hushed argument near closing: '...just need it gone for one night, solve all our money problems fast.'",
      },
    ],
    suspects: [
      {
        id: "jimmy",
        name: "Jimmy 'Fingers' Alvarez",
        role: "Rival Musician",
        testimony:
          "\"That mic's cursed anyway, always overshadowing my playing. Sure, I wanted my shot at the spotlight — but steal? I'd rather outplay the ghost of whoever owned it.\"",
        isCulprit: false,
      },
      {
        id: "sadie",
        name: "Sadie Marlowe",
        role: "Stagehand",
        testimony:
          "\"I was near the case, sure — it's my job to dust it! I heard something in the alley and got spooked, that's all. Please, I need this job.\"",
        isCulprit: false,
      },
      {
        id: "donnelly",
        name: "Mr. Donnelly",
        role: "Club Owner",
        testimony:
          "\"Insurance? Standard practice, Detective, nothing more. This club is my whole life — why would I ever put it at risk?\" He won't quite meet your eyes.",
        isCulprit: true,
      },
    ],
    successText:
      "You slide the pawn ticket and the insurance papers across the desk. Donnelly's bluster collapses like a bad chord. 'The club was going under,' he admits. 'The mic was worth more gone than on that stand.' The Blue Note keeps its legend — and its next show goes on, Detective.",
    failureText:
      "The wrong name goes in the report, and somewhere across town Donnelly quietly collects a very generous insurance check. The house band plays on, one legendary microphone short — and the real thief walks free, Detective.",
  },
];

type Modal = { type: "spot"; data: SceneSpot } | { type: "suspect"; data: Suspect } | null;

export default function NoirDetectiveCaseFile() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [activeCase, setActiveCase] = useState<CaseFile | null>(null);
  const [tab, setTab] = useState<Tab>("scene");
  const [examined, setExamined] = useState<Set<string>>(new Set());
  const [interviewed, setInterviewed] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<Modal>(null);
  const [accusedId, setAccusedId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"success" | "failure" | null>(null);

  const openCase = useCallback((caseFile: CaseFile) => {
    setActiveCase(caseFile);
    setExamined(new Set());
    setInterviewed(new Set());
    setAccusedId(null);
    setOutcome(null);
    setTab("scene");
    setScreen("briefing");
  }, []);

  const examineSpot = useCallback((spot: SceneSpot) => {
    setModal({ type: "spot", data: spot });
    setExamined((prev) => new Set(prev).add(spot.id));
  }, []);

  const interviewSuspect = useCallback((suspect: Suspect) => {
    setModal({ type: "suspect", data: suspect });
    setInterviewed((prev) => new Set(prev).add(suspect.id));
  }, []);

  const confirmAccusation = useCallback(() => {
    if (!activeCase || !accusedId) return;
    const suspect = activeCase.suspects.find((s) => s.id === accusedId);
    setOutcome(suspect?.isCulprit ? "success" : "failure");
    setScreen("result");
  }, [activeCase, accusedId]);

  const backToMenu = useCallback(() => {
    setScreen("menu");
    setActiveCase(null);
    setModal(null);
  }, []);

  const readyToAccuse =
    !!activeCase && examined.size === activeCase.spots.length && interviewed.size === activeCase.suspects.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 font-serif text-neutral-200">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, transparent 0px, transparent 40px, #000 42px, #000 46px)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.10), transparent 55%)" }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.9) 100%)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-100">Noir Detective Bureau</p>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500">Confidential Case Files</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {screen === "menu" && (
            <motion.section
              key="menu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <h1 className="mb-1 text-2xl font-bold uppercase tracking-wide text-neutral-100 sm:text-3xl">
                Select a Case File
              </h1>
              <p className="mb-8 text-sm text-neutral-500">
                Two files sit open on your desk tonight. Pick one, Detective.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                {CASES.map((c) => (
                  <motion.button
                    key={c.id}
                    onClick={() => openCase(c)}
                    whileHover={{ y: -4, rotate: -0.5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex flex-col items-start gap-3 rounded-sm border border-neutral-700/60 bg-gradient-to-b from-neutral-900 to-neutral-900/60 p-5 text-left shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] transition-colors hover:border-amber-500/50"
                  >
                    <span className="rounded-full border border-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-widest text-neutral-500">
                      {c.subtitle}
                    </span>
                    <h2 className="text-lg font-bold uppercase leading-snug tracking-wide text-neutral-100 group-hover:text-amber-400">
                      {c.title}
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {c.location}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500">
                      <FolderOpen className="h-3.5 w-3.5" />
                      Open File
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {screen === "briefing" && activeCase && (
            <motion.section
              key="briefing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col"
            >
              <button
                onClick={backToMenu}
                className="mb-6 flex w-fit items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 transition-colors hover:text-amber-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Case Files
              </button>

              <div className="relative flex-1 rounded-sm border border-neutral-700/60 bg-neutral-900/70 p-6 sm:p-8">
                <span className="absolute -top-3 right-6 -rotate-6 rounded-sm border-2 border-rose-600/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-500/80">
                  Confidential
                </span>
                <p className="mb-1 text-[11px] uppercase tracking-widest text-amber-500">{activeCase.subtitle}</p>
                <h1 className="mb-1 text-2xl font-bold uppercase tracking-wide text-neutral-100 sm:text-3xl">
                  {activeCase.title}
                </h1>
                <p className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {activeCase.location}
                </p>

                <div className="space-y-4 font-mono text-sm leading-relaxed text-neutral-300">
                  {activeCase.briefing.map((paragraph, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.35 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => setScreen("investigate")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 flex items-center justify-center gap-2 rounded-sm bg-amber-600 py-3 text-sm font-bold uppercase tracking-widest text-neutral-950 shadow-[0_0_25px_-5px_rgba(217,119,6,0.6)] transition-colors hover:bg-amber-500"
              >
                <Search className="h-4 w-4" />
                Begin Investigation
              </motion.button>
            </motion.section>
          )}

          {screen === "investigate" && activeCase && (
            <motion.section
              key="investigate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <button
                    onClick={backToMenu}
                    className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 transition-colors hover:text-amber-400"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Abandon Case
                  </button>
                  <h1 className="text-lg font-bold uppercase tracking-wide text-neutral-100 sm:text-xl">
                    {activeCase.title}
                  </h1>
                </div>
                <div className="shrink-0 rounded-sm border border-neutral-700 bg-neutral-900/70 px-3 py-2 text-right text-[11px] uppercase tracking-wider text-neutral-500">
                  <p>
                    Clues{" "}
                    <span className="text-amber-400">
                      {examined.size}/{activeCase.spots.length}
                    </span>
                  </p>
                  <p>
                    Suspects{" "}
                    <span className="text-amber-400">
                      {interviewed.size}/{activeCase.suspects.length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-5 flex gap-2 border-b border-neutral-800 pb-2">
                {(
                  [
                    { id: "scene" as const, label: "Crime Scene", icon: MapPin },
                    { id: "suspects" as const, label: "Suspects", icon: Users },
                    { id: "evidence" as const, label: "Evidence", icon: ClipboardList },
                  ]
                ).map((tabItem) => (
                  <button
                    key={tabItem.id}
                    onClick={() => setTab(tabItem.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      tab === tabItem.id
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                        : "border-neutral-700 text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <tabItem.icon className="h-3.5 w-3.5" />
                    {tabItem.label}
                  </button>
                ))}
              </div>

              <div className="flex-1">
                {tab === "scene" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeCase.spots.map((spot) => {
                      const Icon = CLUE_ICONS[spot.icon];
                      const isDone = examined.has(spot.id);
                      return (
                        <button
                          key={spot.id}
                          onClick={() => examineSpot(spot)}
                          className={`flex items-center gap-3 rounded-sm border p-4 text-left transition-colors ${
                            isDone
                              ? "border-amber-600/40 bg-amber-500/5"
                              : "border-neutral-700/60 bg-neutral-900/60 hover:border-neutral-500"
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                              isDone ? "border-amber-500/50 text-amber-400" : "border-neutral-600 text-neutral-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-neutral-200">{spot.label}</span>
                            <span className="block text-[11px] uppercase tracking-wider text-neutral-500">
                              {isDone ? "Examined" : "Tap to examine"}
                            </span>
                          </span>
                          {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {tab === "suspects" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeCase.suspects.map((suspect, i) => {
                      const isDone = interviewed.has(suspect.id);
                      const accent = SUSPECT_ACCENTS[i % SUSPECT_ACCENTS.length];
                      return (
                        <button
                          key={suspect.id}
                          onClick={() => interviewSuspect(suspect)}
                          className={`flex items-center gap-3 rounded-sm border p-4 text-left transition-colors ${
                            isDone ? "border-neutral-600 bg-neutral-900/80" : "border-neutral-700/60 bg-neutral-900/60 hover:border-neutral-500"
                          }`}
                        >
                          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${accent}`}>
                            <User className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-neutral-200">{suspect.name}</span>
                            <span className="block text-[11px] uppercase tracking-wider text-neutral-500">{suspect.role}</span>
                          </span>
                          {isDone && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {tab === "evidence" && (
                  <div>
                    {examined.size === 0 ? (
                      <p className="rounded-sm border border-dashed border-neutral-700 p-8 text-center text-sm text-neutral-500">
                        No evidence collected yet. Head to the crime scene, Detective.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeCase.spots
                          .filter((spot) => examined.has(spot.id))
                          .map((spot, i) => {
                            const Icon = CLUE_ICONS[spot.icon];
                            return (
                              <motion.div
                                key={spot.id}
                                initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
                                animate={{ opacity: 1, rotate: i % 2 === 0 ? -1.5 : 1.5, scale: 1 }}
                                className="relative rounded-sm border border-neutral-700 bg-neutral-900 p-4 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.8)]"
                              >
                                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
                                <span className="mb-2 flex items-center gap-2 text-amber-400">
                                  <Icon className="h-4 w-4" />
                                  <span className="text-xs font-bold uppercase tracking-wider">{spot.clueTitle}</span>
                                </span>
                                <p className="text-xs leading-relaxed text-neutral-400">{spot.clueText}</p>
                              </motion.div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 mt-6 rounded-sm border border-neutral-700 bg-neutral-950/95 p-4 backdrop-blur">
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-rose-600"
                    animate={{
                      width: `${
                        ((examined.size + interviewed.size) /
                          (activeCase.spots.length + activeCase.suspects.length)) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <motion.button
                  onClick={() => readyToAccuse && setScreen("accuse")}
                  whileHover={readyToAccuse ? { scale: 1.02 } : {}}
                  whileTap={readyToAccuse ? { scale: 0.97 } : {}}
                  disabled={!readyToAccuse}
                  className={`flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                    readyToAccuse
                      ? "bg-rose-700 text-neutral-100 shadow-[0_0_25px_-5px_rgba(190,18,60,0.7)] hover:bg-rose-600"
                      : "cursor-not-allowed bg-neutral-800 text-neutral-600"
                  }`}
                >
                  <Siren className="h-4 w-4" />
                  {readyToAccuse ? "Make Your Accusation" : "Finish Investigating First"}
                </motion.button>
              </div>
            </motion.section>
          )}

          {screen === "accuse" && activeCase && (
            <motion.section
              key="accuse"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col"
            >
              <button
                onClick={() => setScreen("investigate")}
                className="mb-6 flex w-fit items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-500 transition-colors hover:text-amber-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Evidence
              </button>

              <h1 className="mb-1 text-2xl font-bold uppercase tracking-wide text-neutral-100">Name Your Suspect</h1>
              <p className="mb-6 text-sm text-neutral-500">
                There's no turning back once you point the finger, Detective. Choose carefully.
              </p>

              <div className="mb-6 space-y-3">
                {activeCase.suspects.map((suspect, i) => {
                  const accent = SUSPECT_ACCENTS[i % SUSPECT_ACCENTS.length];
                  const isSelected = accusedId === suspect.id;
                  return (
                    <button
                      key={suspect.id}
                      onClick={() => setAccusedId(suspect.id)}
                      className={`flex w-full items-center gap-3 rounded-sm border p-4 text-left transition-colors ${
                        isSelected ? "border-rose-600 bg-rose-950/30" : "border-neutral-700/60 bg-neutral-900/60 hover:border-neutral-500"
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${accent}`}>
                        <User className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-neutral-200">{suspect.name}</span>
                        <span className="block text-[11px] uppercase tracking-wider text-neutral-500">{suspect.role}</span>
                      </span>
                      {isSelected && <Gavel className="h-4 w-4 shrink-0 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {accusedId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mb-4 rounded-sm border border-rose-800/50 bg-rose-950/20 p-3 text-xs text-rose-300">
                      You're about to accuse{" "}
                      <span className="font-bold">{activeCase.suspects.find((s) => s.id === accusedId)?.name}</span>. There's
                      no walking this back.
                    </p>
                    <motion.button
                      onClick={confirmAccusation}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex w-full items-center justify-center gap-2 rounded-sm bg-rose-700 py-3 text-sm font-bold uppercase tracking-widest text-neutral-100 shadow-[0_0_25px_-5px_rgba(190,18,60,0.7)] transition-colors hover:bg-rose-600"
                    >
                      <Siren className="h-4 w-4" />
                      Confirm Accusation
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {screen === "result" && activeCase && outcome && (
            <motion.section
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 2.4, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
                className={`mb-6 flex items-center gap-2 rounded-sm border-4 px-5 py-2 ${
                  outcome === "success" ? "border-amber-500 text-amber-400" : "border-rose-600 text-rose-500"
                }`}
              >
                {outcome === "success" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                <span className="text-xl font-black uppercase tracking-[0.2em]">
                  {outcome === "success" ? "Case Closed" : "Case Unsolved"}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="max-w-lg rounded-sm border border-neutral-700 bg-neutral-900/70 p-6 font-mono text-sm leading-relaxed text-neutral-300"
              >
                <Quote className="mx-auto mb-3 h-5 w-5 text-neutral-600" />
                {outcome === "success" ? activeCase.successText : activeCase.failureText}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                onClick={backToMenu}
                className="mt-8 flex items-center gap-2 rounded-sm border border-neutral-700 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                <FolderOpen className="h-4 w-4" />
                Return to Case Files
              </motion.button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-sm border border-amber-500/30 bg-neutral-900 p-6 shadow-[0_0_60px_-10px_rgba(217,119,6,0.3)]"
            >
              {modal.type === "spot" ? (
                <>
                  <span className="mb-3 flex items-center gap-2 text-amber-400">
                    {(() => {
                      const Icon = CLUE_ICONS[modal.data.icon];
                      return <Icon className="h-5 w-5" />;
                    })()}
                    <span className="text-xs font-bold uppercase tracking-widest">{modal.data.clueTitle}</span>
                  </span>
                  <p className="font-mono text-sm leading-relaxed text-neutral-300">{modal.data.clueText}</p>
                </>
              ) : (
                <>
                  <span className="mb-3 flex items-center gap-2 text-amber-400">
                    <User className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {modal.data.name} — {modal.data.role}
                    </span>
                  </span>
                  <p className="flex items-start gap-2 font-mono text-sm italic leading-relaxed text-neutral-300">
                    <Quote className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" />
                    {modal.data.testimony}
                  </p>
                </>
              )}
              <button
                onClick={() => setModal(null)}
                className="mt-5 w-full rounded-sm border border-neutral-700 py-2 text-xs font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

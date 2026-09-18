# Noir Detective Case File

A dark, cinematic detective mini-game (React/Next.js + Tailwind + Framer
Motion + Lucide). Pick a case, examine the crime scene, interrogate
suspects, review the evidence board, then make your accusation — a
cinematic "Case Closed" or "Case Unsolved" ending follows depending on
whether you named the real culprit.

Ships with two complete cases: **The Dark Harbor Murder** and **The Case
of the Missing Microphone**, each with five examinable clues and three
suspects (one culprit, two red herrings).

## Setup

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm install framer-motion lucide-react
```

Drop `page.tsx` into `app/page.tsx` (replacing the default one) and run:

```bash
npm run dev
```

No extra Tailwind config is required — the component only uses default
utility classes plus inline styles for the vignette and blinds-shadow
background effects.

# Ambient Cinematic Canvas

A calm, cinematic single-page ambient dashboard: a live clock, a firefly particle
canvas that reacts to the cursor, a mouse-follow glow, rotating quotes, and a
generative ambient drone (built with the Web Audio API — no external audio files
needed) that shifts with the time of day.

## Setup

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm install framer-motion
```

Drop `page.tsx` into `app/page.tsx` (replacing the default one) and run:

```bash
npm run dev
```

No extra Tailwind config is required — the component only uses default utility
classes plus inline styles for the dynamic time-of-day gradient.

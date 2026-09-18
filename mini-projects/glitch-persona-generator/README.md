# Glitch Persona Generator

A dark cyberpunk / retro sci-fi identity card generator. Rolls a random
codename, an absurd job title, a faction, a power-level meter, and a
mirrored pixel-glitch avatar — with an RGB-split glitch transition on
regenerate, plus copy-to-clipboard and download-as-file actions.

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
utility classes plus inline styles for the grid backdrop and dynamic glow.

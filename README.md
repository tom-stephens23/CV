# River CV

Personal CV/portfolio site — Amazon river themed, dark rainforest palette, procedural dot-terrain, river-as-timeline.

## Getting started

Requires Node 20+ and npm.

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run format   # Run Prettier
```

## Project structure

```
river-cv/
├── index.html              # Shell: head, fonts, root containers
├── public/
│   └── favicon.svg         # River drop favicon
├── src/
│   ├── styles/
│   │   ├── tokens.css      # Design tokens (colours, type, spacing)
│   │   ├── base.css        # Reset, body, type utilities
│   │   ├── layout.css      # Header, hero, journey, footer
│   │   ├── components.css  # Cards, chips, modal, nodes
│   │   ├── motion.css      # Keyframes and transitions
│   │   └── index.css       # Import orchestration
│   └── scripts/
│       ├── main.js         # Entry point, DOM boot, event handlers
│       └── noise.js        # Seeded Perlin-like noise for terrain
└── vite.config.js          # Vite configuration
```

## Tech stack

- **Vite** — Fast HMR, native ES modules, zero lock-in
- **Vanilla JS** — No framework, no TypeScript
- **Hand-rolled CSS** — No Tailwind, custom property tokens
- **Prettier** — Single quotes, no semicolons, 2-space indent

## Design

The site uses a rainforest palette:
- `--basin` (#0B1B15): deep floor
- `--panel` (#122820): canopy
- `--river` (#2FA38F): primary accent
- `--clay` (#FF6A4D): disruptive accent
- `--gold` (#E5B54B): secondary accent

Terrain is procedurally generated via seeded Perlin-like noise, with a river flowing vertically through the career timeline.

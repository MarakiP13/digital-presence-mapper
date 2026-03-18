# Presence Map — Digital Presence Intelligence

A desktop-first web dashboard that analyzes a brand's digital presence across multiple channels, scoring four trust pillars: **Clarity**, **Consistency**, **Credibility**, and **Conversion**.

Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

---

## Quick Start

```bash
cd presence-map
npx -y serve .
```

Open `http://localhost:3000` in your browser.

---

## Architecture

```
presence-map/
├── index.html            # Single-page app shell (5 view sections)
├── styles.css            # Dark-theme design system (Inter, #0d7ff2 accent)
├── app.js                # View routing, Canvas charts, animations
├── data/
│   └── analysis.json     # Simulated brand presence data
├── README.md
└── test-use-case.md      # Functional test scenarios
```

## Features

| View | Description |
|------|-------------|
| **Dashboard** | Overall score ring, 4-pillar radar chart, channel list with status indicators, intelligence gap alerts, channel performance breakdown, AI-generated narrative summary |
| **Channels** | Expanded channel management grid with per-channel scores, data connection status panel (Google Maps API, LinkedIn Insights, etc.) |
| **Comparison** | Dual-brand pillar comparison bars, radar overlay, competitive advantages / growth opportunities, executive summary, market sentiment breakdown |
| **Insights** | Placeholder — deep-dive analytics (future release) |
| **Settings** | Placeholder — workspace configuration (future release) |

## Design System

| Token | Value |
|-------|-------|
| Theme | Dark (`#060a13` → `#111827`) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) 300–800 |
| Accent | `#0d7ff2` with gradient to `#6c2fff` |
| Radius | 8px (cards), 12px (elevated), 16px (modals) |
| Icons | Material Icons Outlined |
| Animations | CSS transitions + requestAnimationFrame counters |

## Key Technical Details

- **No dependencies** — pure HTML/CSS/JS, served statically
- **Canvas radar chart** — custom 4-axis polygon renderer with glow dots
- **Animated score ring** — SVG circle with `stroke-dashoffset` animation
- **IntersectionObserver** — scroll-reveal animations on cards
- **Responsive** — desktop-first with graceful degradation at 1200px / 900px / 600px breakpoints

## Data Model

All data lives in `data/analysis.json`. Key entities:

- `brand` — name, industry, HQ, rating
- `channels[]` — type, handle, icon, status, score, snippet
- `presenceScores` — clarity / consistency / credibility / conversion (0–100 + delta)
- `intelligenceGaps[]` — title, severity, description, recommendation
- `competitor` — name, scores, advantages, opportunities, sentiment
- `dataConnections[]` — API integrations with status
- `user` — current user profile

## Design Credits

UI designs from **Google Stitch** project *Presence Map App* (ID: `5872141565419823095`).  
Built following the **Omni-Guide** methodology.

## License

Internal project — not for redistribution.

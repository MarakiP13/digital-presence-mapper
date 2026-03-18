# Presence Map — Test Use Cases

Functional test scenarios for verifying the Presence Map application.

---

## Pre-conditions

- Application served locally via `npx -y serve .`
- Opened at `http://localhost:3000` in a modern browser (Chrome/Edge/Firefox)
- `data/analysis.json` is present and unmodified

---

## TC-01: Application Boot

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `http://localhost:3000` | Page loads with dark theme, no console errors |
| 2 | Observe sidebar | "Presence Map" logo with gradient text, 5 nav items (Dashboard active), user "Alex Chen" at bottom |
| 3 | Observe main content | Dashboard view is visible with heading "Dashboard" |

---

## TC-02: Dashboard — Overall Score

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View score ring (left card) | Animated ring fills to **69**, gradient stroke from blue to purple |
| 2 | Observe counter | Number counts up from 0 → 69 smoothly |
| 3 | Check label | "Overall" label beneath the number |

---

## TC-03: Dashboard — Radar Chart

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View radar (right card) | 4-axis polygon with labels: Clarity, Consistency, Credibility, Conversion |
| 2 | Observe shape | Blue filled polygon with dots at each axis vertex |
| 3 | Verify grid rings | 4 concentric diamond-shaped guide rings visible |

---

## TC-04: Dashboard — Pillar Score Cards

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View the 4 pillar cards | Clarity (78 ↑2.1), Consistency (62 ↓0.4), Credibility (91 ↑1.8), Conversion (44 ↓3.2) |
| 2 | Observe animation | Counters animate from 0, progress bars fill to correct width |
| 3 | Check deltas | Up deltas are green, down deltas are red |
| 4 | Hover a card | Top accent bar appears, subtle glow border |

---

## TC-05: Dashboard — Channel List

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to "Added Channels" | 6 channel cards listed vertically |
| 2 | Verify entries | acmecorp.io (82), @acmecorp_official (74), AcmeGlobal (88), @acme_tiktok (61), Acme_Global (45), @acmecorp (38) |
| 3 | Check status dots | Active = green pulsing, Monitoring = yellow pulsing |
| 4 | Hover a card | Background lightens, blue border accent |

---

## TC-06: Dashboard — Intelligence Gaps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to "Key Intelligence Gaps" | 3 gap cards in a 3-column grid |
| 2 | Verify severities | "Narrative Fragmentation" = HIGH (red bar), "Engagement Leakage" = MEDIUM (yellow bar), "Trust but Weak Conversion" = HIGH (red bar) |
| 3 | Check recommendations | Each card has a blue recommendation box with lightbulb icon |

---

## TC-07: Dashboard — Channel Breakdown

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to "Channel Performance Breakdown" | Cards for active channels only (Website, Instagram, LinkedIn, TikTok) |
| 2 | Website card | Shows snippet, HQ "San Francisco, CA", star rating "4.8 (1,242 reviews)" |
| 3 | Hover | Card background elevates, border changes to accent blue |

---

## TC-08: Dashboard — Narrative Summary

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to bottom | Narrative block with gradient top border, psychology icon |
| 2 | Verify text | Quoted text starting with "Acme Corp maintains a complex multi-channel profile..." |
| 3 | Check footer | "© 2024 Presence Map" and "V2.5.0 Build" |

---

## TC-09: Navigation — Switch to Channels

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Channels" in sidebar | Channels nav item becomes active (blue glow), Dashboard deactivates |
| 2 | Observe content | Channels view fades in with heading "Channels" and "Add Channel" button |
| 3 | Verify grid | 6 channel cards in 3-column grid with score bars |
| 4 | Verify connections | 4 data connection entries: Google Maps (connected), LinkedIn (connected), Instagram (pending), Web Analytics (connected) |

---

## TC-10: Navigation — Switch to Comparison

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Comparison" in sidebar | Comparison view fades in with heading "Brand Comparison" |
| 2 | Core Pillars Comparison | 4 pillar cards, each with two bars (Acme vs Competitor X), bars animate in |
| 3 | Presence Overlay | Dual radar chart with blue (Acme) and amber (Competitor X) polygons, legend at bottom |
| 4 | Advantages | 3 green items with "+" icons |
| 5 | Opportunities | 3 red items with "−" icons |
| 6 | Executive Summary | Blue-bordered card with summary text |
| 7 | Market Sentiment | Two cards: Acme Corp (72% positive) and Competitor X (65% positive) with colored bars |

---

## TC-11: Navigation — Placeholder Views

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Insights" | Shows placeholder with query_stats icon and "being calibrated" message |
| 2 | Click "Settings" | Shows placeholder with tune icon and "Coming in the next release" message |

---

## TC-12: Navigation — Return to Dashboard

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Dashboard" in sidebar | Dashboard view reappears with fade animation |
| 2 | Verify animations replay | Score ring re-animates, pillar counters re-count, reveal elements fade in |

---

## TC-13: Responsive — Window Resize

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Resize browser to < 1200px | Pillar grid collapses to 2 columns |
| 2 | Resize to < 900px | Sidebar hides off-screen, content uses full width, grids go single-column |
| 3 | Resize to < 600px | Pillar cards stack to single column, content padding reduces |

---

## TC-14: Add Channel Button

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Channels view | "Add Channel" button visible (top-right, blue) |
| 2 | Click "Add Channel" | Alert dialog appears: "Add Channel modal — coming in next release." |

---

## Summary

| Area | Test Cases | Priority |
|------|-----------|----------|
| Boot & Load | TC-01 | Critical |
| Dashboard Content | TC-02 through TC-08 | High |
| Navigation | TC-09 through TC-12 | Critical |
| Responsive | TC-13 | Medium |
| Interactive | TC-14 | Low |

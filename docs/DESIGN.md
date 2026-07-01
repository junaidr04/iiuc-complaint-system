# Design System — Minimal

This document defines the visual design language used across the University Complaint Management System frontend. All UI components (Student Portal, Authority Portal, Admin Portal) should follow these tokens for consistency.

---

## 🎨 Theme: Minimal

**Vibe:** An airy, restrained interface that establishes information hierarchy through whitespace and clear distinctions in font size, weight, and spacing — rather than color or decoration. Almost no shadows or decorative colors. Gentle contrast and fine, non-sharp typefaces ensure long-term reading comfort.

---

## Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Page background, cards |
| `--bg-secondary` | `#F8F9FB` | Page canvas / subtle layer separation |
| `--text-primary` | `#111827` | Headings, primary body text (dark gray, not pure black) |
| `--text-secondary` | `#6B7280` | Labels, captions, secondary text |
| `--border` | `#E5E7EB` | 1px hairline borders everywhere |
| `--signal` | `#4F46E5` | Selected states, primary buttons, active nav, current status indicator |

**Rule:** Only extremely subtle differences (`--bg-primary` vs `--bg-secondary`) are used to distinguish layers — never a strong background color shift.

### Semantic status colors (used sparingly, only for status dots/badges)

| Status | Color |
|---|---|
| Pending | `#9CA3AF` (neutral gray) |
| In review | `#4F46E5` (signal) |
| Resolved | `#10B981` (green, used only as a status dot — not a background block) |

---

## Typography

**Font family:** Montserrat (variable weight)

```css
@font-face {
  font-family: 'Montserrat';
  src: url('https://resource-static.bj.bcebos.com/fonts/Montserrat-VariableFont_wght.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

| Element | Size | Weight |
|---|---|---|
| Page title | 20px | 600 |
| Panel title | 13–15px | 600 |
| Metric value | 24–28px | 600 |
| Body text | 13–14px | 400–500 |
| Label / caption | 11–12px | 500 |

Letter spacing: slightly tightened (`-0.01em` to `-0.02em`) on headings and large numbers for a crisp, non-decorative look.

---

## Layout Principles

- Content organized into clear modules, separated by generous whitespace — not borders or shadows.
- Left-aligned text throughout. No centered blocks except charts/icons.
- Structured, grid-based image and card layouts — avoid decorative misalignment.
- Cards: `1px solid var(--border)`, `border-radius: 8px`, no box-shadow.
- Buttons: minimal visual weight. Text-forward, not large color blocks. Border ≤ 1px, shadow ≈ 0.

---

## Elements

### Charts
- Minimalist **linear** charts only: line charts, thin bar charts, ring/donut charts.
- Uniform stroke thickness, no fill under lines (except subtle ~10% opacity area fill when explicitly needed).
- One accent hue (`--signal`) for the primary series; gray/neutral for secondary context.
- No gradients, no drop shadows on chart elements.

### Buttons
- Primary button: `--signal` text/border, minimal fill — text does the work, not a large color block.
- Secondary/default: transparent background, `1px solid var(--border)`, hover → `--bg-secondary`.

### Status badges
- Small dot (6px circle) + label. No pill-shaped colored background blocks.

---

## Animation

**Principle:** Minimalist, linear, no bounce or elasticity.

### Entrance
- Page scrolls naturally like a document — `ease-out` timing, no springs.

### Transition (on scroll into view)
- Fade-in + slight vertical displacement (`translateY(16px) → 0`).
- Implementation reference (Tailwind + `tailwindcss-intersect` plugin):

```html
<div class="opacity-0 intersect:opacity-100 intersect:translate-y-0 translate-y-4 transition duration-700 ease-out">
  ...
</div>
```

- Vanilla JS fallback (`IntersectionObserver`):

```css
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
.reveal.in { opacity: 1; transform: translateY(0); }
```

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 60);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

- Alternative: `motion/react` (Framer Motion) can be used for the same effect in React components:

```jsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>
  ...
</motion.div>
```

---

## Tailwind Config Reference

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bgPrimary: '#FFFFFF',
        bgSecondary: '#F8F9FB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        signal: '#4F46E5',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [
    require('tailwindcss-intersect'),
  ],
};
```

---

## Do / Don't

| Do | Don't |
|---|---|
| Use whitespace to separate sections | Use background color blocks to separate sections |
| One accent color (`--signal`) for emphasis | Multiple decorative colors |
| 1px hairline borders | Shadows or elevated cards |
| Text-forward buttons | Large filled color-block buttons |
| Fade + slight translateY on scroll | Bounce, elastic, or spring animations |
| Left-aligned structured layout | Decorative or centered misalignment |

---

## Reference Implementation

See [`admin-dashboard-minimal.html`](./admin-dashboard-minimal.html) for a working example of this theme applied to the Admin Dashboard (metric cards, charts, complaints table, scroll-reveal animation).
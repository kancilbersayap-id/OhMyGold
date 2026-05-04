# Design System: OhMyGold

## 1. Visual Philosophy

The OhMyGold interface balances **technical clarity** with **approachable accessibility**. We use a restrained palette with generous whitespace to maintain focus on data and portfolio insights. The design conveys trust and precision through:

- Clean lines and minimal visual noise
- Subtle depth via soft shadows (cards, modals)
- Softly rounded corners on interactive elements
- Consistent, measured spacing throughout
- High contrast text for accessibility

**Mood:** Confident, modern, trustworthy — emphasizing transparency in gold investment tracking.

---

## 2. Color Tokens & Usage

### Foundation Colors
| Token | CSS Variable | Light | Dark | Usage |
|-------|--------------|-------|------|-------|
| **Background** | `--color-background` | #ffffff | #000000 | Page background, card backgrounds |
| **Background Subtle** | `--color-background-2` | #fafafa | #0a0a0a | Secondary backgrounds, section breaks |
| **Text Primary** | `--color-text` | #171717 | #ededed | Body text, primary text |
| **Text Muted** | `--color-text-muted` | #4d4d4d | #a1a1a1 | Secondary text, labels, captions |
| **Border** | `--color-border` | #d1d5db | #1f1f1f | Card borders, dividers, input borders |

### Brand Colors
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **Primary (Amber)** | `--color-primary` | #bd5200 | Brand accent, highlights, focus states |
| **Secondary (Blue)** | `--color-secondary` | #0070f3 | Links, secondary actions, info badges |
| **Accent (Sky Blue)** | `--color-accent` | #0096ff | Hover states, active states, charts |

### Semantic Colors
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **Success** | `--color-success` | #22c55e | Positive text/icon |
| **Success BG** | `--color-success-bg` | rgba(34,197,94,0.15) | Badge background |
| **Success Border** | `--color-success-border` | rgba(34,197,94,0.3) | Badge border |
| **Danger** | `--color-danger` | #ef4444 | Negative text/icon, destructive actions |
| **Danger BG** | `--color-danger-bg` | rgba(239,68,68,0.15) | Badge background |
| **Danger Border** | `--color-danger-border` | rgba(239,68,68,0.3) | Badge border |

### Surface & Chart Colors
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **Popover BG** | `--color-popover-bg` | #0a0a0a | Dropdown/popover background (always dark) |
| **Popover Hover** | `--color-popover-hover` | #1a1a1a | Popover item hover state |
| **Chart Blue** | `--color-chart-blue` | #52AEFF | Chart lines, data visualization |

### Usage Guide
```css
/* ✅ CORRECT: Use semantic tokens */
.card {
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

/* ❌ WRONG: Don't hardcode colors */
.card {
  border: 1px solid #d1d5db;
}
```

---

## 3. Typography System

### Font Family
- **Primary / Headings:** Geist Mono (`var(--font-mono), Arial, monospace`) — used for all heading and body tokens
- **Fallback:** Arial, system monospace fonts

### Heading Scale
| Scale | CSS Variables | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|---------------|------|--------|-------------|----------------|-------|
| **H1** | `--font-heading-1-*` | 48px | 600 | 48px | -2.28px | Page title (once per page) |
| **H2** | `--font-heading-2-*` | 14px | 500 | 20px | -0.28px | Section heading, card title |
| **H3** | `--font-heading-3-*` | 32px | 600 | 40px | -1.28px | Page subtitle, large section |
| **H4** | `--font-heading-4-*` | 24px | 600 | 32px | -0.96px | Mid-level section heading |
| **H5** | `--font-heading-5-*` | 14px | 400 | 20px | normal | Minor heading, label |

### Body Text Scale
| Scale | CSS Variables | Size | Weight | Line Height | Usage |
|-------|---------------|------|--------|-------------|-------|
| **Body** | `--font-body-*` | 16px | 400 | normal | Default paragraph text |
| **Body Text** | `--font-body-text-*` | 14px | 400 | 16px | Description, secondary text |
| **Inline** | `--font-inline-text-*` | 14px | 400 | 14px | Small inline text, captions |
| **Button** | `--font-button-*` | 14px | **500** | 14px | Button labels |
| **Navigation** | `--font-navigation-*` | 16px | 400 | normal | Nav items, links |
| **Link** | `--font-link-*` | 16px | 400 | normal | Hyperlinks |

### Special Scales
| Scale | CSS Variables | Size | Usage |
|-------|---------------|------|-------|
| **Mono** | `--font-mono-*` | 28px | Numerical metric displays |
| **Modal Title** | `--font-modal-title-*` | 20px / 600w | Modal headings |

### Typography Implementation
```css
/* ✅ CORRECT: Use typography variables */
.pageTitle {
  font-family: var(--font-heading-1-family);
  font-size: var(--font-heading-1-size);
  font-weight: var(--font-heading-1-weight);
  line-height: var(--font-heading-1-line-height);
  letter-spacing: var(--font-heading-1-letter-spacing);
}

/* ❌ WRONG: Don't hardcode values */
.title {
  font-size: 48px;
  font-weight: 600;
}
```

---

## 4. Spacing System

### Spacing Scale
| Scale | CSS Variable | Value | Typical Usage |
|-------|--------------|-------|---------------|
| **3xs** | `--spacing-3xs` | 4px | Hairline gaps (reserved, mostly unused) |
| **2xs** | `--spacing-2xs` | 14px | Base unit — used in `calc()` ratios across the app |
| **xs** | `--spacing-xs` | 30px | Button/input padding, component gaps |
| **sm** | `--spacing-sm` | 52px | Section margins, card margins |
| **md** | `--spacing-md` | 80px | Page section spacing |
| **lg** | `--spacing-lg` | 110px | Major section breaks |
| **xl** | `--spacing-xl` | 8rem (128px) | Layout grid gaps |
| **2xl** | `--spacing-2xl` | 160px | Large page sections |
| **3xl–6xl** | `--spacing-3xl` → `--spacing-6xl` | 11rem–16rem | Hero / full-bleed layouts |

> **⚠️ Do not change `--spacing-2xs`.** Many components use it as a base for `calc(var(--spacing-2xs) * 0.57)`-style ratios.

---

## 5. Border Radius

Aligned to the **Tailwind v3** scale — values in `rem`.

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **None** | `--radius-none` | 0 | Square edges |
| **Small** | `--radius-sm` | 0.125rem (2px) | Badges, tight borders |
| **Medium** | `--radius-md` | 0.375rem (6px) | Cards, inputs, buttons |
| **Large** | `--radius-lg` | 0.5rem (8px) | Popovers, prominent cards |
| **Extra Large** | `--radius-xl` | 0.75rem (12px) | Modals, hero cards |
| **2XL** | `--radius-2xl` | 1rem (16px) | Large containers |
| **3XL** | `--radius-3xl` | 1.5rem (24px) | Extra large containers |
| **Full** | `--radius-full` | 9999px | Pills, avatars |

---

## 6. State Tokens

### Opacity
```css
opacity: var(--opacity-hover);     /* 0.85 — hover */
opacity: var(--opacity-active);    /* 0.7  — pressed */
opacity: var(--opacity-disabled);  /* 0.5  — disabled */
```

### Transitions
```css
transition: opacity var(--transition-fast);   /* 0.12s — press, snap */
transition: opacity var(--transition-base);   /* 0.15s — standard hover */
transition: opacity var(--transition-slow);   /* 0.2s  — badges, complex */
```

---

## 7. Dark Mode Support

All colors use CSS variables that automatically switch based on `prefers-color-scheme`.

### Light Mode (Default)
```
background: #ffffff  |  text: #171717  |  border: #d1d5db
```

### Dark Mode
```
background: #000000  |  text: #ededed  |  border: #1f1f1f
```

```css
/* ✅ CORRECT: Adapts to dark mode automatically */
.card {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* ❌ WRONG: Ignores dark mode */
.card {
  background: #ffffff;
  color: #171717;
}
```

---

## 8. Component Patterns

### Card
```css
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.cardTitle {
  font-size: var(--font-heading-5-size);
  color: var(--color-text);
  margin-bottom: 16px;
}
```

### Button
```css
.button {
  font-size: var(--font-button-size);
  font-weight: var(--font-button-weight);
  border-radius: var(--radius-md);
  transition: opacity var(--transition-base);
}
.button:hover    { opacity: var(--opacity-hover); }
.button:active   { opacity: var(--opacity-active); }
.button:disabled { opacity: var(--opacity-disabled); cursor: not-allowed; }

.button.primary {
  background: var(--color-text);       /* auto-inverts with theme */
  color: var(--color-background);
}
.button.secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
.button.danger {
  background: var(--color-danger);
  color: #ffffff;
}
```

### Badge / Pill
```css
.badge {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-body-text-size);
  font-weight: 500;
  transition: opacity var(--transition-slow);
}
.badge.positive {
  background: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success-border);
}
.badge.negative {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid var(--color-danger-border);
}
.badge.neutral {
  background: var(--color-background-2);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

---

## 9. Accessibility Considerations

- **Color Contrast:** All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- **Focus States:** Interactive elements have visible focus indicators
- **Motion:** Transitions are subtle (0.12s–0.2s) to avoid vestibular triggers
- **Typography:** Heading hierarchy is semantic (H1 > H2 > H3, not styled shortcuts)

---

## 10. Implementation Checklist

When building a new component:

- [ ] Use `--color-*` variables for all colors (no hardcoded hex)
- [ ] Use `--font-*` variables for typography
- [ ] Use `--spacing-*` variables for padding, margin, gap
- [ ] Use `--radius-*` variables for border-radius
- [ ] Use `--opacity-*` and `--transition-*` for interactive states
- [ ] Test in dark mode (DevTools → Rendering → Emulate CSS media feature `prefers-color-scheme`)
- [ ] Verify color contrast with browser inspector
- [ ] Check focus states and keyboard navigation
- [ ] Use CSS Modules (`.module.css`) for component styles

---

## 11. Token Source of Truth

All design tokens are defined in `design-system/tokens/design-token.json` and compiled to:
- `design-system/styles/design-variables.css` — CSS custom properties (`:root`)
- `design-system/styles/vercel-design.css` — Theme block format

**Always edit `design-token.json` first, then verify CSS is generated correctly.**

---

## 12. Common Pitfalls

| ❌ Don't | ✅ Do | Why |
|---------|------|-----|
| Hardcode colors (`#ef4444`) | Use tokens (`var(--color-danger)`) | Enables theme switching, dark mode |
| Hardcode spacing (`16px`) | Use tokens (`var(--spacing-2xs)`) | Maintains rhythm |
| Hardcode font sizes | Use typography variables | Ensures consistency |
| Use `--color-text-secondary` | Use `var(--color-text-muted)` | Correct token name |
| Ignore state tokens | Use `--opacity-*` and `--transition-*` | Consistent interaction feel |
| Skip dark mode testing | Test with `prefers-color-scheme: dark` | Many users prefer dark mode |
| Use custom border radius | Use `--radius-*` tokens | Maintains visual consistency |

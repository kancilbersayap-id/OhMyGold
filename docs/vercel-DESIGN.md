# Design System: OhMyGold

## 1. Visual Philosophy

The OhMyGold interface balances **technical clarity** with **approachable accessibility**. We use a restrained palette with generous whitespace to maintain focus on data and portfolio insights. The design conveys trust and precision through:

- Clean lines and minimal visual noise
- Subtle depth via soft shadows (cards, modals)
- Softly rounded corners (5-20px) on interactive elements
- Consistent, measured spacing throughout
- High contrast text for accessibility

**Mood:** Confident, modern, trustworthy — emphasizing transparency in gold investment tracking.

---

## 2. Color Tokens & Usage

### Foundation Colors
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **Background** | `--color-background` | #ffffff (light) / #000000 (dark) | Page background, card backgrounds |
| **Background Subtle** | `--color-background-2` | #fafafa (light) / #0a0a0a (dark) | Secondary backgrounds, section breaks |
| **Text Primary** | `--color-text` | #171717 (light) / #ededed (dark) | Body text, primary text |
| **Text Muted** | `--color-text-muted` | #4d4d4d (light) / #a1a1a1 (dark) | Secondary text, labels, captions |
| **Border** | `--color-border` | #d1d5db (light) / #1f1f1f (dark) | Card borders, dividers, input borders |

### Brand Colors
| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **Primary (Amber)** | `--color-primary` | #bd5200 | Brand accent, highlights, focus states |
| **Secondary (Blue)** | `--color-secondary` | #0070f3 | Links, secondary actions, info badges |
| **Accent (Sky Blue)** | `--color-accent` | #0096ff | Hover states, active states, charts |
| **Success (Green)** | `--color-success` | #22c55e | Positive changes, gains, increases |
| **Danger (Red)** | `--color-danger` | #ef4444 | Negative changes, losses, errors |
| **Chart Blue** | `--color-chart-blue` | #52AEFF | Chart lines, data visualization |

### Usage Guide
```css
/* ✅ CORRECT: Use semantic tokens */
.card {
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.badge-success {
  color: #22c55e;  /* or define --color-success */
}

/* ❌ WRONG: Don't hardcode colors */
.card {
  border: 1px solid #d1d5db;  /* Use var(--color-border) instead */
}
```

---

## 3. Typography System

### Font Family
- **Primary:** Geist (sans-serif, loaded via next/font/geist)
- **Fallback:** Arial, system fonts
- **Monospace:** Geist Mono or 'Courier New' for code/numbers

### Heading Scale
| Scale | CSS Variables | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|---------------|------|--------|-------------|----------------|-------|
| **H1** | `--font-heading-1-*` | 48px | 600 | 48px | -2.28px | Page title (once per page) |
| **H2** | `--font-heading-2-*` | 14px | 500 | 20px | -0.28px | Section heading, card title |
| **H3** | `--font-heading-3-*` | 32px | 600 | 40px | -1.28px | Page subtitle, large section |
| **H5** | `--font-heading-5-*` | 14px | 400 | 20px | normal | Minor heading, label |

**Note:** Heading-4 is reserved for future use (24px scale between H3 and H5).

### Body Text Scale
| Scale | CSS Variables | Size | Weight | Line Height | Usage |
|-------|---------------|------|--------|-------------|-------|
| **Body** | `--font-body-*` | 16px | 400 | normal | Default paragraph text |
| **Body Text** | `--font-body-text-*` | 14px | 400 | 16px | Description, secondary text |
| **Inline** | `--font-inline-text-*` | 14px | 400 | 14px | Small inline text, captions |
| **Button** | `--font-button-*` | 14px | 400 | 14px | Button labels, labels |
| **Navigation** | `--font-navigation-*` | 16px | 400 | normal | Nav items, links |
| **Link** | `--font-link-*` | 16px | 400 | normal | Hyperlinks |

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

/* ✅ SHORTHAND: Apply heading styles via CSS class */
.heading2 {
  font: var(--font-heading-2-weight) var(--font-heading-2-size) / var(--font-heading-2-line-height) var(--font-heading-2-family);
  letter-spacing: var(--font-heading-2-letter-spacing);
}

/* ❌ WRONG: Don't hardcode values */
.title {
  font-size: 48px;  /* Use var(--font-heading-1-size) */
  font-weight: 600;  /* Use var(--font-heading-1-weight) */
}
```

---

## 4. Spacing System

### Spacing Scale
| Scale | CSS Variable | Value | Typical Usage |
|-------|--------------|-------|---------------|
| **2xs** | `--spacing-2xs` | 14px | Tight spacing, form gaps |
| **xs** | `--spacing-xs` | 30px | Button/input padding, component gaps |
| **sm** | `--spacing-sm` | 52px | Section margins, card margins |
| **md** | `--spacing-md` | 80px | Page section spacing |
| **lg** | `--spacing-lg` | 110px | Major section breaks |
| **xl** | `--spacing-xl` | 8rem / 128px | Layout grid gaps |
| **2xl** | `--spacing-2xl` | 160px | Large page sections |

### Spacing Implementation
```css
/* ✅ CORRECT: Use spacing tokens */
.card {
  padding: var(--spacing-xs);  /* 30px */
  margin-bottom: var(--spacing-sm);  /* 52px */
  gap: var(--spacing-2xs);  /* 14px */
}

/* ❌ WRONG: Don't hardcode spacing */
.card {
  padding: 16px;  /* Use var(--spacing-xs) or var(--spacing-2xs) */
  gap: 8px;  /* Use var(--spacing-2xs) which is 14px */
}
```

---

## 5. Border Radius

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **None** | `--radius-none` | 0 | Square edges (buttons, modals) |
| **Small** | `--radius-sm` | 2px | Tight borders, badges |
| **Medium** | `--radius-md` | 5px | Cards, inputs, standard elements |
| **Large** | `--radius-lg` | 9px | Prominent cards, dialogs |
| **Extra Large** | `--radius-xl` | 20px | Large cards, modal windows |
| **Full** | `--radius-full` | 32px | Pills, avatars, circular buttons |

### Border Radius Implementation
```css
/* ✅ CORRECT: Use radius tokens */
.card {
  border-radius: var(--radius-md);  /* 5px */
}

.button {
  border-radius: var(--radius-sm);  /* 2px */
}

/* ❌ WRONG: Don't hardcode values */
.button {
  border-radius: 6px;  /* Use var(--radius-md) which is 5px */
}
```

---

## 6. Dark Mode Support

The design system supports dark mode via CSS custom properties. Dark mode values are automatically applied when users set `prefers-color-scheme: dark` in their OS settings.

### Light Mode (Default)
```
background: #ffffff
text: #171717
border: #d1d5db
```

### Dark Mode
```
background: #000000
text: #ededed
border: #1f1f1f
```

**Implementation:** All colors must use CSS variables, not hardcoded hex values, to automatically adapt.

```css
/* ✅ CORRECT: Uses tokens, adapts to dark mode */
.card {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* ❌ WRONG: Ignores dark mode */
.card {
  background: #ffffff;
  color: #171717;
  border: 1px solid #d1d5db;
}
```

---

## 7. Component Patterns

### Card Layout
```css
.card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);  /* 30px */
}

.cardTitle {
  font-family: var(--font-heading-5-family);
  font-size: var(--font-heading-5-size);
  font-weight: var(--font-heading-5-weight);
  color: var(--color-text);
  margin-bottom: var(--spacing-2xs);  /* 14px */
}
```

### Button Group
```css
.button {
  font-size: var(--font-button-size);
  padding: var(--spacing-2xs) var(--spacing-xs);  /* 14px 30px */
  border-radius: var(--radius-md);
  transition: opacity 0.15s;
}

.button:hover {
  opacity: 0.85;
}

.button.primary {
  background-color: var(--color-primary);
  color: white;
}

.button.secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.button.danger {
  background-color: var(--color-danger);
  color: white;
}
```

### Badge / Pill
```css
.badge {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--font-body-text-size);
  font-weight: 500;
}

.badge.success {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.badge.error {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
```

---

## 8. Accessibility Considerations

- **Color Contrast:** All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- **Focus States:** Interactive elements have visible focus indicators
- **Motion:** Transitions are subtle (0.15s) to avoid vestibular triggers
- **Typography:** Heading hierarchy is semantic (H1 > H2 > H3, not styled shortcuts)

---

## 9. Implementation Checklist

When building a new component:

- [ ] Use `--color-*` variables for all colors (no hardcoded hex)
- [ ] Use `--font-*` variables for typography
- [ ] Use `--spacing-*` variables for padding, margin, gap
- [ ] Use `--radius-*` variables for border-radius
- [ ] Test in dark mode (DevTools → Rendering → Emulate CSS media feature prefers-color-scheme)
- [ ] Verify color contrast with browser inspector
- [ ] Check focus states and keyboard navigation
- [ ] Use CSS Modules (.module.css) for component styles

---

## 10. Token Source of Truth

All design tokens are defined in `design-system/tokens/design-token.json` and compiled to:
- `design-system/styles/design-variables.css` — CSS custom properties (`:root`)
- `design-system/styles/vercel-design.css` — Theme block format

**Always edit `design-token.json` first, then verify CSS is generated correctly.**

---

## 11. Common Pitfalls

| ❌ Don't | ✅ Do | Why |
|---------|------|-----|
| Hardcode colors (`#bd5200`) | Use tokens (`var(--color-primary)`) | Enables theme switching, dark mode |
| Hardcode spacing (`16px`) | Use tokens (`var(--spacing-xs)`) | Maintains rhythm, easier adjustments |
| Hardcode font sizes | Use typography variables | Ensures consistency, scales better |
| Ignore dark mode | Test with `prefers-color-scheme: dark` | Many users prefer dark mode |
| Use custom border radius | Use `--radius-*` tokens | Maintains visual consistency |
| Skip focus states | Add `:focus`, `:focus-visible` styles | Essential for keyboard navigation |



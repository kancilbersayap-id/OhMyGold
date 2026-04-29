# Design Tokens — Quick Reference

Copy-paste reference for all tokens. Always prefer tokens over hardcoded values.

> The full token set is defined in `design-system/tokens/design-token.json` and exposed as CSS custom properties via `design-system/styles/design-variables.css` (imported by `src/app/globals.css`).

---

## Colors

```css
/* Foundation — adapt to light/dark mode automatically */
var(--color-background)         /* #fff light, #000 dark */
var(--color-background-2)       /* #fafafa light, #0a0a0a dark */
var(--color-text)               /* #171717 light, #ededed dark */
var(--color-text-muted)         /* #4d4d4d light, #a1a1a1 dark */
var(--color-border)             /* #d1d5db light, #1f1f1f dark */

/* Brand — fixed across themes */
var(--color-primary)            /* #bd5200 — amber gold */
var(--color-secondary)          /* #0070f3 — blue */
var(--color-accent)             /* #0096ff — sky blue */

/* Semantic */
var(--color-success)            /* #22c55e */
var(--color-success-bg)         /* tinted bg for success badges */
var(--color-success-border)     /* tinted border for success badges */
var(--color-danger)             /* #ef4444 */
var(--color-danger-bg)          /* tinted bg for danger badges */
var(--color-danger-border)      /* tinted border for danger badges */

/* Surfaces — fixed dark surfaces (popovers, dropdowns) */
var(--color-popover-bg)         /* #0a0a0a */
var(--color-popover-hover)      /* #1a1a1a */

/* Charts */
var(--color-chart-blue)         /* #52AEFF */
```

---

## Typography

### Headings
```css
.heading1 {
  font-family: var(--font-heading-1-family);
  font-size: var(--font-heading-1-size);             /* 48px */
  font-weight: var(--font-heading-1-weight);         /* 600 */
  line-height: var(--font-heading-1-line-height);
  letter-spacing: var(--font-heading-1-letter-spacing);
}
/* Same pattern for: heading-2 (14/500), heading-3 (32/600),
   heading-4 (24/600 — new), heading-5 (14/400) */
```

### Body
```css
font-size: var(--font-body-size);              /* 16px */
font-size: var(--font-body-text-size);         /* 14px */
font-size: var(--font-inline-text-size);       /* 14px */
font-size: var(--font-button-size);            /* 14px */
font-size: var(--font-navigation-size);        /* 16px */
```

### Mono (for numerical displays)
```css
.metric-value {
  font-family: var(--font-mono-family);          /* Geist Mono + fallbacks */
  font-size: var(--font-mono-size);              /* 28px */
  font-weight: var(--font-mono-weight);
  line-height: var(--font-mono-line-height);
  letter-spacing: var(--font-mono-letter-spacing);
}
```

### Modal title
```css
font-size: var(--font-modal-title-size);       /* 20px */
font-weight: var(--font-modal-title-weight);   /* 600 */
```

---

## Spacing

```css
var(--spacing-3xs)   /* 4px   — hairline (currently unused, reserved) */
var(--spacing-2xs)   /* 14px  — base unit, used in calc() ratios */
var(--spacing-xs)    /* 30px  — standard component padding/gap */
var(--spacing-sm)    /* 52px  — section margins */
var(--spacing-md)    /* 80px  — major section spacing */
var(--spacing-lg)    /* 110px — large section breaks */
var(--spacing-xl)    /* 8rem  — layout grid (~128px) */
var(--spacing-2xl)   /* 160px — hero spacing */
var(--spacing-3xl)   /* 11rem */
var(--spacing-4xl)   /* 12rem */
var(--spacing-5xl)   /* 13rem */
var(--spacing-6xl)   /* 16rem */
```

> **⚠️ Don't change `--spacing-2xs`.** Many `*.module.css` files use it as a base for `calc(var(--spacing-2xs) * 0.57)`-style derivations.

---

## Border Radius

Aligned to **Tailwind v3** scale — values in `rem` for parity with Tailwind's documented sizes.

```css
var(--radius-none)   /* 0          — rounded-none */
var(--radius-sm)     /* 0.125rem   — 2px,  rounded-sm  — badges, tight borders */
var(--radius-md)     /* 0.375rem   — 6px,  rounded-md  — standard: buttons, cards, inputs */
var(--radius-lg)     /* 0.5rem     — 8px,  rounded-lg  — popovers, prominent cards */
var(--radius-xl)     /* 0.75rem    — 12px, rounded-xl  — modals, hero cards */
var(--radius-2xl)    /* 1rem       — 16px, rounded-2xl — large containers */
var(--radius-3xl)    /* 1.5rem     — 24px, rounded-3xl — extra large containers */
var(--radius-full)   /* 9999px     — rounded-full      — pills, avatars */
```

---

## State

```css
/* Opacity */
opacity: var(--opacity-hover);     /* 0.85 */
opacity: var(--opacity-active);    /* 0.7 */
opacity: var(--opacity-disabled);  /* 0.5 */

/* Transition durations */
transition: opacity var(--transition-fast);   /* 0.12s — press, hover */
transition: opacity var(--transition-base);   /* 0.15s — color, opacity */
transition: opacity var(--transition-slow);   /* 0.2s  — badges, complex */
```

---

## Component Patterns

### Button (theme-aware primary)
```css
.button {
  padding: 10px 14px;
  font-size: var(--font-button-size);
  font-weight: var(--font-button-weight);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-base);
}
.button:hover    { opacity: var(--opacity-hover); }
.button:active   { opacity: var(--opacity-active); }
.button:disabled { opacity: var(--opacity-disabled); cursor: not-allowed; }

.button.primary {
  background: var(--color-text);          /* auto-inverts with theme */
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

### Card
```css
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}
.card-title {
  font-size: var(--font-heading-5-size);
  color: var(--color-text);
  margin-bottom: 16px;
}
.card-description {
  font-size: var(--font-body-text-size);
  color: var(--color-text-muted);
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

### Popover (always dark surface)
```css
.popover {
  background: var(--color-popover-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.popover-item:hover {
  background: var(--color-popover-hover);
}
.popover-item.delete {
  color: var(--color-danger);
}
```

### Form Input
```css
.input {
  padding: 10px 14px;
  font-size: var(--font-body-size);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
}
.input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.input::placeholder {
  color: var(--color-text-muted);
}
```

---

## Dark Mode Testing

Open DevTools → Rendering tab → Emulate CSS media feature `prefers-color-scheme` → toggle between `light` and `dark`. The app automatically adapts via `globals.css`.

---

## Pre-PR Checklist

- [ ] All colors use `var(--color-*)` (no hex literals in `*.module.css`)
- [ ] All border-radius uses `var(--radius-*)`
- [ ] All transition durations use `var(--transition-*)`
- [ ] Hover/active/disabled states use `var(--opacity-*)`
- [ ] Tested in both light and dark mode
- [ ] CSS Modules used (`.module.css` file)

---

## File Index

| File | Purpose |
|------|---------|
| `design-system/tokens/design-token.json` | Token source of truth |
| `design-system/styles/design-variables.css` | CSS custom properties (loaded via `globals.css`) |
| `design-system/styles/vercel-design.css` | `@theme` block for tooling |
| `src/app/globals.css` | App entry — imports tokens + dark mode media query |
| `docs/vercel-DESIGN.md` | Full design system guide |
| `docs/DESIGN_SYSTEM_AUDIT.md` | Audit history + change log |

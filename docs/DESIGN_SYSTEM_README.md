# OhMyGold Design System

A comprehensive, token-based design system for the OhMyGold gold portfolio dashboard. Built on semantic tokens, CSS variables, and a clear component library.

---

## Quick Start

**Using design tokens in your component:**

```css
/* ✅ Correct: Use CSS variables */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  font-size: var(--font-button-size);
}

/* ❌ Wrong: Hardcoded values */
.button {
  background-color: #bd5200;
  padding: 30px;
  border-radius: 5px;
}
```

---

## Documentation Structure

### 1. **[DESIGN_TOKENS_QUICK_REF.md](DESIGN_TOKENS_QUICK_REF.md)** ← Start here
Quick copy-paste reference for all tokens. Use this when styling components.

### 2. **[vercel-DESIGN.md](vercel-DESIGN.md)** — Full Design System Guide
Complete breakdown of:
- Color palette and usage
- Typography scale and implementation
- Spacing system
- Border radius tokens
- Dark mode support
- Component patterns
- Accessibility guidelines

### 3. **[DESIGN_SYSTEM_AUDIT.md](DESIGN_SYSTEM_AUDIT.md)** — Audit Report
Comprehensive audit identifying:
- 4 critical issues (dark mode, hardcoded colors, spacing)
- 7 high-priority issues (color inconsistencies, missing tokens)
- 5 medium-priority issues (typography gaps, documentation)
- Detailed recommendations and implementation roadmap

### 4. **[vercel-design-system-compact.md](vercel-design-system-compact.md)**
Condensed reference of all token values (auto-generated).

---

## Token Files

These are the source files that define all design tokens:

```
design-system/
├── tokens/
│   └── design-token.json          ← Source of truth for all tokens
└── styles/
    ├── design-variables.css        ← CSS custom properties (compiled)
    └── vercel-design.css           ← Theme block format (compiled)
```

**Never edit CSS files directly.** Edit `design-token.json` and recompile.

---

## Components Using This System

All components in `src/components/ui/` should use design tokens:

| Component | Status | Notes |
|-----------|--------|-------|
| Button | 🟡 Partial | Uses hardcoded colors; should use tokens |
| Card | 🟡 Partial | Padding uses hardcoded values |
| Badge | 🟡 Partial | Colors hardcoded in Card.module.css |
| ActionButton | 🟡 Partial | Uses hardcoded background colors |
| MetricCard | ✅ Good | Well-structured, follows token usage |
| MetricChart | ✅ Good | Uses design variables |
| PageHeader | ✅ Good | Follows design system |
| FormField | 🟡 Partial | Mix of tokens and hardcoded values |
| Modal | 🟡 Partial | Should use tokens consistently |
| Calendar | 🟡 Partial | Some hardcoded spacing |
| LineChart | ✅ Good | Uses chart token |
| BarChart | ✅ Good | Uses chart token |
| Toast | 🟡 Partial | Needs review |
| Table | 🟡 Partial | Needs review |
| DataRow | ✅ Good | Simple, well-structured |
| Section | ✅ Good | Uses tokens |
| CardGrid | ✅ Good | Uses tokens |
| ManageButton | 🟡 Partial | Mix of approaches |

---

## Color Palette

### Foundation
- **Background:** #ffffff (light) / #000000 (dark)
- **Background 2:** #fafafa (light) / #0a0a0a (dark)
- **Text:** #171717 (light) / #ededed (dark)
- **Text Muted:** #4d4d4d (light) / #a1a1a1 (dark)
- **Border:** #d1d5db (light) / #1f1f1f (dark)

### Brand
- **Primary:** #bd5200 (Amber Gold)
- **Secondary:** #0070f3 (Blue)
- **Accent:** #0096ff (Sky Blue)

### Semantic
- **Success:** #22c55e (Green)
- **Danger:** #ef4444 (Red)
- **Chart Blue:** #52AEFF (Lighter blue for charts)

**All colors automatically adapt to light/dark mode via CSS variables.**

---

## Typography

### Heading Scale
- **H1:** 48px / 600w (page titles)
- **H2:** 14px / 500w (section titles)
- **H3:** 32px / 600w (page subtitles)
- **H5:** 14px / 400w (card titles, labels)

### Body Scale
- **Body:** 16px / 400w (default text)
- **Body Text:** 14px / 400w (secondary text)
- **Inline:** 14px / 400w (captions)
- **Button:** 14px / 400w (button labels)
- **Navigation:** 16px / 400w (nav items)

**Note:** H4 is reserved (24px) for future use.

---

## Spacing Scale

| Scale | Value | Usage |
|-------|-------|-------|
| 2xs | 14px | Tight gaps, component spacing |
| xs | 30px | Standard padding, button padding |
| sm | 52px | Section margins, card spacing |
| md | 80px | Page sections |
| lg | 110px | Major section breaks |
| xl | 128px | Layout grid gaps |
| 2xl | 160px | Large page sections |

---

## Border Radius

| Scale | Value | Usage |
|-------|-------|-------|
| none | 0 | Square edges |
| sm | 2px | Tight borders, badges |
| md | 5px | Cards, inputs, standard |
| lg | 9px | Prominent cards |
| xl | 20px | Modals, large cards |
| full | 32px | Pills, avatars |

---

## Dark Mode

The design system fully supports dark mode via CSS variables:

```css
/* Automatically adapts to user preference */
body {
  background-color: var(--color-background);  /* #fff light, #000 dark */
  color: var(--color-text);                   /* #171717 light, #ededed dark */
}
```

**To test:** DevTools → Rendering → Emulate CSS media feature → `prefers-color-scheme: dark`

---

## Implementation Checklist

When building a new component:

1. **Create** `ComponentName.js` and `ComponentName.module.css`
2. **Use tokens** for:
   - All colors → `var(--color-*)`
   - All spacing → `var(--spacing-*)`
   - All typography → `var(--font-*)`
   - All border-radius → `var(--radius-*)`
3. **Test dark mode** in DevTools
4. **Verify** focus states and keyboard navigation
5. **Reference** [DESIGN_TOKENS_QUICK_REF.md](DESIGN_TOKENS_QUICK_REF.md) for copy-paste patterns

---

## Common Issues

### ❌ Hardcoded Colors
```css
.button { color: #171717; }  /* ❌ Won't adapt to dark mode */
.button { color: var(--color-text); }  /* ✅ Correct */
```

### ❌ Hardcoded Spacing
```css
.card { padding: 16px; }  /* ❌ Not using scale */
.card { padding: var(--spacing-xs); }  /* ✅ Correct (30px) */
```

### ❌ Missing Border Radius Token
```css
.button { border-radius: 6px; }  /* ❌ Custom value */
.button { border-radius: var(--radius-md); }  /* ✅ Correct (5px) */
```

### ❌ Font Size Not Using Scale
```css
.title { font-size: 28px; }  /* ❌ Random value */
.title { font-size: var(--font-heading-3-size); }  /* ✅ Correct (32px) */
```

---

## Upcoming Improvements

Based on the audit (see [DESIGN_SYSTEM_AUDIT.md](DESIGN_SYSTEM_AUDIT.md)):

- [ ] Add semantic color tokens (--color-success, --color-error, etc.)
- [ ] Add state tokens (hover, active, disabled, focus)
- [ ] Fix border-radius discrepancy (8px → 5px in globals.css)
- [ ] Add heading-4 to typography scale
- [ ] Define --font-mono properly
- [ ] Convert hardcoded values in Button.module.css to tokens
- [ ] Implement proper dark mode media query
- [ ] Update all components to use consistent spacing tokens
- [ ] Add focus state examples to design documentation

---

## Quick Links

- **Token Source:** `design-system/tokens/design-token.json`
- **CSS Variables:** `design-system/styles/design-variables.css`
- **Component Library:** `src/components/ui/`
- **Full Guide:** [vercel-DESIGN.md](vercel-DESIGN.md)
- **Quick Reference:** [DESIGN_TOKENS_QUICK_REF.md](DESIGN_TOKENS_QUICK_REF.md)
- **Audit & Recommendations:** [DESIGN_SYSTEM_AUDIT.md](DESIGN_SYSTEM_AUDIT.md)

---

## Contributing

When adding new components or modifying existing ones:

1. Follow the patterns in [DESIGN_TOKENS_QUICK_REF.md](DESIGN_TOKENS_QUICK_REF.md)
2. Use CSS Modules (.module.css) for styling
3. Use only design tokens (no hardcoded values)
4. Test in light and dark mode
5. Verify keyboard navigation and focus states
6. Reference the full guide for detailed patterns: [vercel-DESIGN.md](vercel-DESIGN.md)

---

## Questions?

- **"What token should I use for X?"** → Check [DESIGN_TOKENS_QUICK_REF.md](DESIGN_TOKENS_QUICK_REF.md)
- **"How do I style a component?"** → See patterns in [vercel-DESIGN.md](vercel-DESIGN.md)
- **"Are there any known issues?"** → Review [DESIGN_SYSTEM_AUDIT.md](DESIGN_SYSTEM_AUDIT.md)
- **"How do I test dark mode?"** → Read the Dark Mode section above


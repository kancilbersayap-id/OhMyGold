# Design System Audit Report

**Date:** April 26, 2026
**Status:** ✅ All four phases implemented

---

## Executive Summary

A token audit identified hardcoded values, missing semantic colors, and a broken dark-mode setup. All recommendations from Phases 1–4 have now been applied. This document records what was found, what changed, and what intentionally was *not* changed.

| Phase | Status | Scope |
|-------|--------|-------|
| 1. Critical fixes | ✅ Done | Tokens, dark mode media query, semantic colors |
| 2. High priority | ✅ Done | Button, Card, Badge, ActionButton refactor |
| 3. Medium priority | ✅ Done | heading-4, state tokens, docs |
| 4. Cleanup | ✅ Done | Pruned 20+ unused fonts from `vercel-design.css` |

---

## What Changed

### Token files
- **`design-system/tokens/design-token.json`** — Added `success`, `success-bg`, `danger`, `danger-bg`, `chart-blue`, `popover-bg`, `popover-hover`, `mono` typography, `heading-4`, `modal-title`, and a new `state` group (opacity + transition tokens). Replaced `--spacing-3xs: .03889em` with a more usable `4px` (the original was unused).
- **`design-system/styles/design-variables.css`** — Rewrote to mirror the token JSON exactly. Now grouped by purpose (foundation/brand/semantic/surfaces, typography, spacing, radius, state). Font families now use `var(--font-geist-sans)` from `next/font` so the mono fallback is consistent.
- **`design-system/styles/vercel-design.css`** — Removed 20+ unused custom fonts (KaTeX variants, GeistPixel variants, DSEG7, etc.). Kept only Geist + Geist Mono. Mirrors the same semantic tokens.

### App-level CSS
- **`src/app/globals.css`** — Rewritten. It now `@import`s `design-variables.css` (previously the variables file was orphaned and the dark-mode values were force-applied in `:root`). Dark mode is now properly gated behind `@media (prefers-color-scheme: dark)`.

### Components refactored to tokens
| Component | Notable changes |
|-----------|-----------------|
| `Button.module.css` | All hardcoded colors replaced with tokens. Primary now uses `--color-text` / `--color-background` (auto-inverts with theme). Danger uses `--color-danger`. Added `:disabled` state. Border-radius now `--radius-md` (was `6px`). |
| `Card.module.css` | Badge colors now use `--color-success-*` / `--color-danger-*` tokens. `.cardValue` now uses `--font-mono-*` group. |
| `Badge.module.css` | Positive/negative now use semantic color + border tokens. Border-radius now `--radius-sm`. Transitions use `--transition-slow`. |
| `ActionButton.module.css` | Popover bg/hover now use `--color-popover-bg` / `--color-popover-hover`. Border-radius tokens throughout. Delete item uses `--color-danger`. |

---

## What Was *Not* Changed (Intentional)

These were called out in the original audit but kept as-is after closer inspection:

### Spacing scale values
The audit suggested standardising the spacing scale to a typical 4/8 grid. **Reverted** — the codebase uses `var(--spacing-2xs)` (14px) as a base unit for many `calc(var(--spacing-2xs) * 0.57)`-style ratios across `news.module.css`, `design-system.module.css`, `forecasting.module.css`, `Section.module.css`, `DataRow.module.css`, and `Sidebar.module.css`. Changing the values would silently break visual rhythm in many places. Only `--spacing-3xs` (which was unused) was changed from `.03889em` → `4px`.

### Pixel-perfect padding inside components
Card padding (`16px`), button gap (`6px`), card-footer margin (`8px`) etc. are kept as raw pixels. The spacing scale jumps `14 → 30 → 52`, which doesn't have intermediate values for these small but specific paddings. Forcing them onto the scale would distort the components. A future iteration could add fine-grained component spacing tokens, but it isn't a current bottleneck.

### `--font-mono` "missing" finding
The original audit flagged `--font-mono` as undefined. **Incorrect** — it's defined in `src/app/layout.js` via `next/font/google` and exposed as a CSS custom property at the `<html>` level. The variables file now wraps it as `--font-mono-family` with a `'Courier New', monospace` fallback for clarity.

---

## Visual Behaviour Changes

These are user-visible consequences of the refactor — review them against your design intent:

1. **Light mode now works.** Previously the app forced dark colors in `:root`, regardless of OS preference. With the media query in place, users on a light-mode OS will see the light palette (white background, dark text). Dark mode is unchanged for users with `prefers-color-scheme: dark`.
2. **Primary button is now theme-aware.** Was hardcoded `#ededed` background + `#000000` text (a light pill that only made sense on a dark page). Now uses `--color-text` as background + `--color-background` as text — looks the same in dark mode, automatically inverts in light mode.
3. **Button border-radius changed from 6px → 5px** to align with `--radius-md`. Visually almost imperceptible.
4. **Badge border-radius changed from 4px → 2px** to align with `--radius-sm`. Slightly tighter corners.

---

## Verification Checklist

- [x] `design-variables.css` is now imported — variables actually load
- [x] `globals.css` no longer hardcodes dark-mode in `:root`
- [x] All target components use `var(--color-*)` instead of hex literals
- [x] `--radius-md` is consistently `5px` across all files
- [x] `heading-4` (24px) added to typography scale
- [x] Semantic tokens for success/danger states defined
- [x] State tokens (opacity, transition) defined and used in refactored components

---

## Files Modified

```
design-system/tokens/design-token.json
design-system/styles/design-variables.css
design-system/styles/vercel-design.css
src/app/globals.css
src/components/ui/Button.module.css
src/components/ui/Card.module.css
src/components/ui/Badge.module.css
src/components/ui/ActionButton.module.css
docs/vercel-DESIGN.md
docs/DESIGN_SYSTEM_AUDIT.md           (this file)
docs/DESIGN_TOKENS_QUICK_REF.md
docs/DESIGN_SYSTEM_README.md
```

---

## Recommended Next Iteration

Not urgent, but worth considering for a future pass:

- **Fine-grained spacing tokens** (e.g. `--spacing-component-tight: 6px`, `--spacing-component-snug: 8px`) for the small paddings currently kept as raw px.
- **Audit remaining components** (`Modal`, `Calendar`, `FormField`, `Toast`, `Table`, `ManageButton`) for the same hardcoded-value patterns. They were not in scope for this round.
- **Lint rule** to forbid hex literals in `*.module.css` files (e.g. `stylelint-declaration-strict-value`).
- **Token build step** to generate `design-variables.css` from `design-token.json` automatically, so the two can never drift.

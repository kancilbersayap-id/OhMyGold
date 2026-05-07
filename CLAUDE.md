# OhMyGold — Claude Code Instructions

## Project Overview

OhMyGold is a gold portfolio and investment tracking dashboard for Indonesian users. It tracks prices from ANTAM, Logammulia, and Galeri24, supports buy/sell simulation, and displays buyback history. Built with Next.js App Router + Supabase.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** React with CSS Modules
- **Backend / Auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Automation / Scraping:** Playwright, Node.js scripts
- **Path alias:** `@/*` → `./src/*`

---

## Design System

> **Always use the design system.** Never hardcode colors, spacing, font sizes, or border radii.

### Token Files

| File | Purpose |
|---|---|
| `design-system/tokens/design-token.json` | Source of truth for all design tokens |
| `design-system/styles/design-variables.css` | CSS custom properties derived from tokens |
| `design-system/styles/vercel-design.css` | Additional Vercel-inspired variables |
| `docs/vercel-DESIGN.md` | Full design system guide — read before styling |
| `docs/DESIGN_TOKENS_QUICK_REF.md` | Copy-paste token reference |

### Key Tokens (CSS Custom Properties)

**Colors**
- `--color-background` — page background (#fff / #fafafa)
- `--color-text` — primary text (#171717)
- `--color-text-muted` — muted text (#4d4d4d)
- `--color-primary` — brand amber/gold (#bd5200)
- `--color-secondary` — blue (#0070f3)
- `--color-accent` — sky blue (#0096ff)
- `--color-border` — borders (#d1d5db)

**Typography** — use these scale names, never raw px:
`heading-1` → `heading-5`, `body`, `body-text`, `inline-text`, `link`, `button`, `navigation`
Font family: Geist

**Spacing** — `3xs` → `6xl` (0.6px → 16rem)

**Border Radius** — `none`, `sm` (2px), `md` (5px), `lg` (9px), `xl` (20px), `full` (32px)

### Components

Reusable UI components live in `src/components/ui/`. **Always prefer these over writing new ones:**

- Layout: `Card`, `CardGrid`, `PageHeader`, `Section`
- Display: `Badge`, `MetricCard`, `MetricChart`, `DataRow`, `Table`
- Charts: `LineChart`, `BarChart`
- Actions: `Button`, `ActionButton`, `Modal`, `Toast`
- Form: `FormField`, `Calendar`

### Styling Rules

- Use **CSS Modules** (`.module.css`) for all component styles.
- Reference tokens via `var(--token-name)` — never hardcode values.
- Support dark mode via CSS custom properties (already handled in `globals.css`).
- Follow the visual guidelines in `docs/vercel-DESIGN.md` for layout, hierarchy, and tone.

### Common slip-ups (read before styling)

These are the recurring ways changes drift from the design system. Skim before any UI work.

- **Custom controls instead of system components.** Don't roll a toggle, modal, dropdown, or menu inline — use `Toggle`, `Modal`, `FormField`, `Popover`, etc. from `src/components/ui/`. If a component is missing, add it to `src/components/ui/` so the next person reuses it.
- **Hardcoded values.** Every color, font-size, spacing, radius, and font-family must reference a token. No raw hex, px, or system fonts.
- **Hardcoded fonts on `<button>`/`<input>`.** Form elements have their own UA fonts. `globals.css` resets this with `font: inherit`, but if you set `font-size`/`font-weight` without `font-family`, double-check the result. When in doubt, set `font-family: var(--font-mono)` or another token explicitly.
- **Hover/focus states with raw colors.** Use `var(--color-surface-hover)`, `var(--color-danger-bg)`, etc. — not `rgba(0,0,0,0.04)`.
- **Skipping dark mode check.** Verify any new UI in both themes — a hardcoded `#fff` will look fine in light and break in dark.
- **Inline `style={{...}}` for layout.** Prefer CSS Modules. Inline styles bypass the design system and aren't searchable.
- **New SVG icons inline.** Match stroke-width/size of nearby icons (typically 16×16, `strokeWidth=1.5–1.75`). Inconsistent icon weight is the most common visual giveaway.
- **Popovers/menus without outside-click dismissal.** Always use the `Popover` component — it handles outside click + Escape consistently.

If you're unsure whether something belongs in the design system, ask before building it inline.

---

## Committing

Use **Conventional Commits** format:

```
<type>: <short description>
```

**Types:**
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, dependency updates, config
- `refactor:` — code restructure without behavior change
- `style:` — styling / CSS only changes
- `docs:` — documentation changes
- `ci:` — CI/CD workflow changes

**Rules:**
- Lowercase, imperative mood (`add`, `fix`, `update` — not `added`, `fixes`)
- No period at the end
- Keep the subject line under 72 characters
- Example: `feat: add logammulia buyback history chart`

---

## Pushing / Deploying

> **Deploy only via `git push` to `main`. Never use the `vercel` CLI to deploy.**

```bash
# Standard flow
git add <files>
git commit -m "feat: your change"
git push origin main
```

- Pushing to `main` automatically triggers a Vercel production deployment.
- Only one Vercel project should exist: **`ohmygold`** (`prj_nsi2CQym7gd0jmRviAXUnZM1dRT3`).
- Do not create preview deployments via CLI or additional Vercel projects.

---

## Development

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

---

## CI / Automated Scraping

GitHub Actions workflows run on a schedule — do not interfere with them:

- `.github/workflows/daily-scrape.yml` — ANTAM buyback history (daily)
- `.github/workflows/daily-retail-scrape.yml` — Galeri24 retail prices (daily, hourly retries 10:20–17:20 WIB)

These workflows commit scraped data directly back to the repo. Pull before pushing if the scraper may have run.

---

## Important Files

| Path | Notes |
|---|---|
| `AGENTS.md` | Breaking changes warnings — **read before writing code** |
| `src/middleware.ts` | Supabase SSR auth middleware |
| `src/utils/` | Shared helpers (priceActions, supabase client, date formatting) |
| `scripts/` | Manual scraping scripts |
| `.vercel/project.json` | Vercel project config — do not modify |

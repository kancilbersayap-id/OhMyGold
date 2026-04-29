<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# OhMyGold — Agent Instructions

## Project Overview

OhMyGold is a gold portfolio and investment tracking dashboard for Indonesian users. It tracks prices from ANTAM, Logammulia, and Galeri24, supports buy/sell simulation, and displays buyback history. Built with Next.js App Router + Supabase.

---

## Tech Stack

- **Framework:** Next.js (App Router, `src/app/`)
- **UI:** React with CSS Modules (`.module.css`)
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
| `docs/vercel-design-system-compact.md` | Condensed reference |

### Key Tokens (CSS Custom Properties)

**Colors**
- `--color-background` — page background
- `--color-text` — primary text
- `--color-text-secondary` — muted text
- `--color-primary` — brand amber/gold (#bd5200)
- `--color-secondary` — blue (#0070f3)
- `--color-accent` — sky blue (#0096ff)
- `--color-border` — borders

**Typography** — use scale names, never raw px:
`heading-1` → `heading-5`, `body`, `body-text`, `inline-text`, `link`, `button`, `navigation`
Font family: Geist

**Spacing** — `3xs` → `6xl` (0.6px → 16rem)

**Border Radius** — `none`, `sm` (2px), `md` (5px), `lg` (9px), `xl` (20px), `full` (32px)

### Reusable UI Components (`src/components/ui/`)

Always prefer these over writing new ones:

- Layout: `Card`, `CardGrid`, `PageHeader`, `Section`
- Display: `Badge`, `MetricCard`, `MetricChart`, `DataRow`, `Table`
- Charts: `LineChart`, `BarChart`
- Actions: `Button`, `ActionButton`, `Modal`, `Toast`
- Form: `FormField`, `Calendar`

### Styling Rules

- Use **CSS Modules** (`.module.css`) for all component styles.
- Reference tokens via `var(--token-name)` — never hardcode values.
- Dark mode is handled in `src/app/globals.css` via CSS custom properties — do not add separate dark-mode overrides.

---

## Key Source Paths

| Path | Notes |
|---|---|
| `src/app/(pages)/` | Route pages (overview, transactions, settings, etc.) |
| `src/components/ui/` | Shared UI components |
| `src/components/layout/` | MainLayout, Sidebar |
| `src/utils/priceActions.js` | All Supabase data-fetching helpers for prices |
| `src/utils/supabase/` | Supabase client helpers (client.js, server.js) |
| `src/middleware.ts` | Supabase SSR auth middleware — do not break |
| `scripts/` | Manual scraping scripts (Node.js + Playwright) |
| `.vercel/project.json` | Vercel config — **do not modify** |

---

## Supabase Tables (reference)

- `antam_buyback_history` — daily ANTAM buyback price records
- `logammulia_prices` — Logammulia retail/buyback prices
- `galeri24_prices` — Galeri24 retail prices

All data fetching goes through `src/utils/priceActions.js`. Add new queries there.

---

## Committing

Use **Conventional Commits**:

```
<type>: <short description>
```

Types: `feat`, `fix`, `chore`, `refactor`, `style`, `docs`, `ci`

- Lowercase, imperative mood, no period, max 72 chars
- Example: `feat: add logammulia buyback history chart`

---

## Deploying

> **Deploy only via `git push` to `main`. Never use the `vercel` CLI.**

```bash
git add <files>
git commit -m "feat: your change"
git push origin main
```

Pushing to `main` triggers automatic Vercel production deployment.

---

## CI / Automated Scraping

Do not interfere with these GitHub Actions workflows:

- `.github/workflows/daily-scrape.yml` — ANTAM buyback history (daily)
- `.github/workflows/daily-retail-scrape.yml` — Galeri24 retail prices (daily)

These commit scraped data directly to the repo. Always `git pull` before pushing.

---

## Development

```bash
npm run dev      # localhost:3000
npm run build    # production build check
```

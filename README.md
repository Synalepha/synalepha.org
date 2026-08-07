# LoudPage

LoudPage is the expressive, profile-first social network at [synalepha.org](https://synalepha.org): personal pages, mutual friendships, chronological updates, and hard privacy boundaries without follower contests or algorithmic outrage.

## Product surface

- disposable pre-signup page builder with browser-local persistence
- interactive staged product lab at `/u/maya`
- Supabase email signup, confirmation, recovery, and SSR sessions
- age-aware profile defaults and adult/minor discovery separation
- expressive profile composer with themes, typography, density, module arrangements, Page Signal, autosave recovery, and exact saved preview
- public, friends-only, and private audiences
- independent guestbook, discovery, tagging, and search-index controls
- mutual friendships, friend-gated messages, blocks, reports, and report-status tracking
- chronological bulletin neighborhood with no suggested-post insertion
- interactive Trust Console and public Product Status
- responsive, reduced-motion, reduced-data, forced-colors, and coarse-pointer support
- Vercel-compatible Next.js 16 application and versioned Supabase migrations

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Required environment variables are documented in `.env.example`.

## Verification

```bash
npm run check
npm run test:authorization
```

`npm run check` runs ESLint, TypeScript, and the complete production build. The authorization harness requires test-only Supabase credentials and exercises database-boundary behavior.

## Deployment

The repository root deploys directly to the Vercel project serving `synalepha.org`. Supabase migrations in `supabase/migrations` are applied in numeric order.

The product implementation is recorded in `PRODUCT_AUDIT.md`; the evidence and results from ten independent audit cycles are recorded in `AUDIT_CYCLES.md`.

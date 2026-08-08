# Roomtone — Ten iterative audit cycles

Date: August 7, 2026

Each cycle used a distinct test surface. A cycle only passed after discovered defects were corrected and its checks were rerun.

## 1. Repository integrity and product isolation

Checked local/remote commit equality, Git object integrity, tracked artifacts, credential patterns, and teacher-product remnants.

Result: passed. The repository was clean and matched remote `main`; no teacher product strings, secrets, `.env`, `.next`, `node_modules`, or `.vercel` files were tracked.

## 2. Reproducible build and dependency health

Ran a clean `npm ci`, `npm audit --audit-level=moderate`, ESLint, TypeScript, the full Next.js production build, and `git diff --check`.

Result: passed. 358 packages audited, zero vulnerabilities, and all 28 original routes compiled. The final build contains 30 routes after adding robots and sitemap metadata routes.

## 3. Runtime routing and authentication boundary

Requested every public route, missing content, and all protected application routes without cookies.

Finding: protected React routes emitted streamed HTTP 200 responses containing a client redirect digest instead of an HTTP redirect.

Fix: added middleware-boundary protection for home, settings, account, messages, friends, discover, admin, and profile, preserving the requested path in the login `next` parameter.

Retest: passed locally; every protected path returns HTTP 307 to its corresponding login destination.

## 4. Stateful interaction behavior

Used a real browser to change builder fields, persist a local draft, change themes, reorder modules, advance the tour, change Maya’s theme and audience, activate media state, expand content, toggle mobile framing, and exercise Trust Console transitions.

Result: passed. DOM state, rendered previews, and local persistence matched every action. A blocked adult viewer of a public page correctly resolved to `ACCESS DENIED`.

## 5. Responsive and mobile UX

Measured document width and visually inspected the complete landing experience at 320 pixels, then exercised staged profile and Trust Console responsive states.

Result: passed. No horizontal overflow at the 320-pixel edge; forms, cards, navigation, and controls stack correctly. Coarse pointers receive 44-pixel targets and mobile navigation respects safe-area insets.

## 6. Accessibility

Ran Lighthouse accessibility against the homepage, staged profile, Trust Console, and signup.

Findings: low-contrast violet labels; low-contrast Midnight modules; a white-on-white Midnight CTA; and accessible names that did not contain their visible link labels.

Fixes: darkened the light-theme violet, introduced a high-contrast Midnight violet/muted palette, corrected the Midnight CTA and empty state, removed conflicting aria labels, and marked the decorative LP tile hidden.

Retest: passed. All four pages score 100 with zero binary accessibility failures.

## 7. Application security and privacy

Inspected CSP, HSTS, frame denial, permissions denial, referrer controls, cross-origin isolation, Zod validation, destructive actions, session handling, redirect allowlisting, and outbound requests.

Finding: CSS attempted a Google Fonts request that CSP correctly blocked, producing an unnecessary third-party request and console security error.

Fixes: removed the remote font import and added `Cross-Origin-Resource-Policy: same-site`.

Result: passed. Typography is local/system-only and the response hardening policy matches actual resource behavior.

## 8. Database authorization

Tested SQL migration invariants and live anonymous access. The test asserts RLS on all 15 tables; revoked default grants on privileged helpers; age-band, immutable-birth-date, minor-publicity, friend-message, media-pending, and report-owner rules; zero anonymous sensitive reads; and rejected anonymous writes.

Result: passed. Sensitive reads returned no rows and unauthorized bulletin, report, and block inserts were denied. The temporary-account service-role harness remains separately available when an actual test secret is supplied.

## 9. Metadata, indexing, and installability

Inspected titles, descriptions, canonical links, Open Graph URLs, robots directives, manifest content, and icon responses across public and auth routes.

Finding: every public route inherited the homepage canonical and Open Graph URL; Maya’s SEO score was reduced by the mismatch.

Fixes: added route-specific metadata and canonicals, noindexed auth/recovery pages, corrected public profile Open Graph data, and added standards-based `/robots.txt` and `/sitemap.xml` routes.

Retest: passed. Every inspected public route now has its own canonical and Open Graph URL; login is `noindex, nofollow`; robots, sitemap, manifest, and icon return 200.

## 10. Performance and production consistency

Baseline Lighthouse: homepage performance 99, Maya performance 99, zero layout shift, 10–40 ms total blocking time, and 177–179 KiB transfer. Best Practices scored 92 only because the blocked Google Fonts request logged CSP errors; Maya SEO scored 91 because of the canonical defect.

Fixes from cycles 7 and 9 removed both root causes. Final production Lighthouse scores are 100 for Performance, Accessibility, Best Practices, and SEO on both the homepage and Maya. Homepage FCP/LCP are 1.0/1.4 seconds; Maya FCP/LCP are 0.9/1.0 seconds; total blocking time is 10–30 ms; cumulative layout shift is 0; transfer is 176–179 KiB; and every observed request is first-party to `synalepha.org`. Protected routes return HTTP 307, metadata routes return 200, the deployment is Ready, and local `HEAD`, remote `main`, and GitHub agree.

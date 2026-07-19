# Synalepha Language Teacher Hub

A dependency-light Spanish and French teacher hub. Lesson Studio connects context and outcome, source metadata, meaning-focused input, communication, evidence, an editable rubric, feedback, and reassessment. Assessment Review sends a lesson plus one de-identified plain-text response to a same-origin Cloudflare Pages Function for transparent, deterministic evidence indicators and an editable feedback draft.

The global information architecture has two primary directories: `tools.html` groups Lesson Studio, Resource Finder, and Assessment Review by teacher task; `languages.html` groups Spanish and French hubs, exemplars, and filtered resources by language. Existing tool and language URLs remain stable.

## Privacy and architecture

- No account, server database, analytics, advertising, external AI call, or API key.
- Studio drafts and saved lessons remain in browser `localStorage`. A saved lesson can be deleted only through its own labeled action and confirmation; the current draft is not deleted with it.
- Portable JSON export/import uses the versioned `synalepha.lesson` schema. Imports are size-limited, type-checked, enum-checked, and applied only after validation.
- User and imported content is escaped before preview rendering. Source links are restricted to HTTP(S).
- Assessment Review accepts lesson JSON plus `.txt`/`.md` learner work, rejects unsupported formats, limits request size, processes requests in memory, and returns `Cache-Control: no-store`. The application does not intentionally persist submissions.
- The site Content Security Policy permits only same-origin connections so the assessment client can reach `/api/assess`.

Do not enter sensitive student information. Local browser data, JSON files, clipboard contents, printed pages, and PDFs remain under the device user’s control.

## Local preview

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Lesson Studio works there. Assessment Review requires the Pages Function; use a Cloudflare Pages local runtime for manual assessment testing, or run the included end-to-end test, which starts a local adapter around the production function.

## Checks

```sh
node --check site.js
node --check tools.js
node --check resources.js
npm test
```

The browser tests use the installed Google Chrome binary and temporary profiles. They verify the four exemplars and direct links, focus, override reconfirmation, safe rendering, local save/remix/delete, JSON export/import rejection, resource handoff, 320-pixel layout, print isolation, lesson and response file uploads, the live assessment endpoint, rubric indicators, and editable feedback. Run `npx --yes html-validate@10.4.0 '*.html'` for HTML5 validation.

## Lesson document

Exports contain:

- `schema: "synalepha.lesson"` and `schemaVersion: 1`
- an opaque local lesson ID and timestamps
- the complete lesson `fields`
- one to five editable `rubric` criteria
- explicit teacher warning `overrides` plus deterministic `overrideSignatures` tied only to fields used by each rule

An override is cleared when content used by its rule changes and must then be confirmed again. Legacy version-1 files without override signatures still import, but their old overrides are treated as unconfirmed. The schema is intentionally local and portable; no compatibility with an LMS or standards framework is claimed.

## Deployment

The repository root is the deployable output directory for Cloudflare Pages. `functions/api/assess.js` is deployed automatically as `/api/assess`; no database binding or secret is required. `_headers` contains security headers. Update canonical URLs, `robots.txt`, and `sitemap.xml` if the production domain differs from `https://synalepha.org`.

## Known limits

Studio guidance and Assessment Review are deterministic and based on fixed visible-field and wording checks. Assessment Review intentionally does not assign grades or claim rubric levels. Neither tool can verify language accuracy, meaning, pedagogical quality, originality, cultural context, learner fit, source availability, accessibility, or permissions. Teachers must inspect original work and approve or revise feedback. Resource metadata is collection-level and must be checked again for the exact item used.

# Synalepha Lesson Studio — Revision Pass 1

## Product promise

Help Spanish and French teachers build one coherent, source-aware lesson from purpose to evidence without an account or external service.

## Primary workflow

1. Context, learner range, and observable communication outcome
2. Authentic source/resource metadata, regional context, access supports, and licensing plan
3. Interpretive or structured-input meaning task
4. Purposeful interpersonal and/or presentational communication
5. Formative evidence, editable achievement descriptors, feedback, and reassessment
6. Teacher review, local save, portable JSON, and one print/PDF artifact

All steps write to one versioned lesson document. Earlier choices remain visible in guidance and the final artifact.

## Guidance contract

Studio checks are deterministic and transparent. They surface plain-language questions about:

- communication outcomes rather than content coverage
- regional/source context and conservative access/licensing plans
- concrete comprehensibility supports
- meaning-focused processing and accidental forced production
- communicative audience/purpose, outcome-task wording alignment, and obvious learner-range mismatches
- formative next moves, outcome-evidence wording alignment, and separation of behavior/effort from achievement

Every warning can be explicitly overridden by the teacher. Checks do not claim to verify quality, language accuracy, culture, permissions, accessibility, or learner fit.

## Complete exemplars

- Spanish Novice: municipal weather → activity recommendation
- Spanish Intermediate: Radio Ambulante excerpts → listening-committee recommendation
- French Novice: Montréal forecast → negotiated outing
- French Intermediate: RFI news reports → class listening-guide introduction

Each includes source and regional context, conservative access/licensing notes, input processing, communication, differentiation, formative response, observable rubric descriptors, feedback, and fresh-evidence planning.

## Product constraints

- Static, dependency-free, CSP-compatible deployment
- No login, analytics, trackers, external AI/API, student records, or LMS integration
- Escaped preview content, HTTP(S)-only source links, size/type/enum-validated JSON import
- Spanish/French feature parity and no flags as language identities
- Keyboard access, live feedback, visible focus, reduced motion, 320-pixel layout, and print clarity
- No claim that the editable rubric is standards-based
- Collection-level resource notes remain conservative; teachers verify exact items and terms

## Acceptance checks

- Purpose → source → input → communication → evidence → review works without a network request
- Four exemplars load as new remixes and populate the complete artifact
- Local save, duplicate/remix, portable JSON, and print/PDF are available
- Malformed or unsupported JSON fails without replacing the current lesson
- Resource cards carry their metadata into Studio
- Syntax, markup structure, internal links, unsafe rendering patterns, and required content checks pass

# LoudPage living-canvas overhaul

## Product decision

LoudPage is now organized around one loop: make a personal page, choose who may
see it, give it to someone, receive a meaningful response, and return when a
person changes. Consumer surfaces use human language. Operational evidence
remains available on Safety, Trust, and Product Status without interrupting the
emotional path.

## Implemented changes

1. **Living canvas** — the pre-signup page is edited directly. Name, short bio,
   feeling, note, song, style, and audience all update the artifact itself.
2. **No control-panel preview split** — the previous form and miniature preview
   were removed. Context stays on the page.
3. **Human example** — Maya is labeled once as fictional, then behaves as an
   example page with a moment, note, photo treatment, people, and guestbook.
4. **Continuation signup** — signup begins with saving the page. A browser draft
   is detected and acknowledged without publishing or uploading it.
5. **Right Now** — feeling, note, song, audience, and time form the signature
   object in the builder, Maya page, member profile, and sharing language.
6. **Visible audience** — the draft canvas keeps Only me, My people, or Anyone
   visible at its top and again beside the save action. Words accompany state.
7. **My People** — authenticated members can promote up to eight accepted
   connections into My People using existing row-level friendship checks.
8. **Finite home** — the home surface asks what changed, who reached out, and
   what the member wants to change. Its empty state explicitly says the member
   is caught up.
9. **Separated trust layers** — consumer language remains short; detailed beta
   and enforcement evidence stays in the status and trust surfaces.
10. **Media safety foundation** — migration 005 adds quarantine/processing
    state, metadata-stripping proof, alt text, dimensions, focal point, and a
    database trigger that rejects approval unless processing, stripping, and
    description requirements are satisfied.
11. **Sharing language** — sharing is framed as giving a page to someone, not
    broadcasting a signal. Native sharing remains preferred with accessible
    clipboard fallback.
12. **Warm brand center** — consumer copy leads with people, change, and
    belonging. Anti-ranking language remains supporting evidence, not the hero.

## Safety invariants

- Drafts remain local until the member explicitly saves them.
- Under-18 pages remain database-enforced private and separated from adults.
- My People accepts only mutual, unblocked friendships.
- Media remains pending and unreadable publicly until moderator approval.
- Media approval requires `processing_state = ready`, stripped metadata, and
  non-empty alt text.
- Visual themes do not alter semantic reading order.
- Audience state uses text, not color alone.
- Audio never autoplays.

## Deliberate launch boundary

The database and interface contracts for safe images are implemented, but the
upload delivery path and external scanning worker remain unlaunched. Product
Status says this directly. A decorative upload button must never imply that an
unprocessed file is safe or publicly available.

## Sensory layer

The second overhaul pass makes nostalgia experiential rather than decorative:

- The Time Capsule presents three specific, interactive memories: a 1999 away
  message, a 2003 burned CD, and a 2007 photo-booth strip.
- Each memory is framed as a private object made for someone, not content made
  for distribution.
- A short synthesized sound may be played only after explicit activation. It
  never autoplays, loads no media, and stores nothing.
- Page environments are named and rendered as Neon Bedroom, Midnight Mixtape,
  Disposable Sunset, and Paper Letter.
- Paper grain, ruled lines, scan texture, imperfect rotations, ink-like notes,
  and object shadows create tactility without using inaccessible image text.
- Reduced-motion preferences remove entrance animation and positional motion.
- The emotional thesis is explicit: LoudPage does not rewind technology; it
  restores the feeling that a page was made by and belonged to a person.

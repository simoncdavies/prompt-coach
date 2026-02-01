# Enhancements: Prompt Generator

## Forking (core idea)
- Add a “Fork” action on prompt detail and in recent list items.
- Default fork name: “Copy of …” with inline rename.
- Store lineage metadata: `parent_prompt_id`, `fork_depth`, `forked_from_user_id`, `forked_at`.
- Show a fork badge on cards and a link to the parent prompt.
- Optional diff view between parent and fork (prompt text + settings).
- Add filters: “Originals only,” “My forks,” “Most forked.”

## UX & Creation Flow
- Add a “Platform” selector (Web, iOS, Android, Desktop, API, Marketing, Support).
- Add “Output type” selector (JSON, bullets, email, code, checklist, spec).
- Add “Tone + expertise” controls (terse vs detailed; novice vs expert).
- Add a “Constraints” block (length, must/avoid words, formatting rules).
- Provide quick templates (feature spec, bug report, onboarding, outreach, SEO brief).

## Quality & Guidance
- Prompt quality score with tips (missing constraints, unclear audience).
- One‑click refinements (add examples, add edge cases, add success criteria).
- Output preview with a sample response before saving.

## Discovery & Organization
- Tags on prompts (platform, domain, team).
- Filters/presets (Most used, Recently successful, By platform).
- “Similar prompts” suggestions for reuse.

## Collaboration
- Fork lineage view (parent → child chain).
- Optional “change note” on forks to explain intent.
- Fork counts surfaced for discovery.

## Analytics
- Track view → fork conversion.
- Track fork reuse (forked prompts used/enhanced again).

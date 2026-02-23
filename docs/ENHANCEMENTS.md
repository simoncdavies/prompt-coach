# Enhancements: Prompt Generator

## Forking (core idea)
- Add a “Fork” action on prompt detail and in recent list items.
- Default fork name: “Copy of …” with inline rename.
- Store lineage metadata: `parent_prompt_id`, `fork_depth`, `forked_from_user_id`, `forked_at`.
- Show a fork badge on cards and a link to the parent prompt.
- Optional diff view between parent and fork (prompt text + settings).
- Add filters: “Originals only,” “My forks,” “Most forked.”

## UX & Creation Flow
- Add output modes:
  - `Quick`: Generate an enhanced prompt (current lightweight flow).
  - `Build`: Generate a PRD, with optional task list derived from that PRD.
- Monetization fit:
  - Keep `Quick` as baseline/free and gate advanced `Build` options (full PRD depth, auto task breakdown, export formats) behind paid tiers.
- In `Build` mode, structure output as:
  - PRD (problem, users, goals, scope, constraints, acceptance criteria).
  - Task list (epics/tasks with priority and dependencies).
  - Optional prompt pack generated from PRD sections (build/design/test prompts).
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

## Phase 2: Platform Hardening

### Observability & Ops
- Add error monitoring (API + client) with alerting.
- Add structured logs for auth/quota/search failures with request IDs.
- Add uptime checks for critical endpoints (`/api/run`, `/api/usage`, `/api/search`).

### Performance
- Define p95 latency targets for enhancer and search endpoints.
- Add endpoint caching strategy (where safe) and document invalidation.
- Add a lightweight dashboard for latency/error trends.

### Data Lifecycle & Compliance
- Define retention windows for prompt/audit data.
- Add user data export/delete workflow.
- Add scheduled cleanup job(s) for aged audit rows.

### Security Hardening
- Add concrete endpoint rate-limit policies and thresholds.
- Add bot protection policy for public surfaces.
- Add CI secret-scanning guardrails.

### Release Governance
- Add staged rollout checklist (`dev -> staging -> prod`).
- Add rollback playbook for auth/migration regressions.
- Add post-release smoke-check checklist.

### Developer Experience
- Add PR checklist mapped to roadmap items.
- Add migration validation checklist (RLS, grants, smoke queries).
- Add CI quality gates (`lint`, tests, migration checks).

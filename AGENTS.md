# AGENTS.md

Instructions for AI coding agents working in this repository.

## Goals

- Make safe, pragmatic code changes that keep momentum.
- Prefer small, verifiable edits over broad refactors.
- Keep behavior stable unless a change is explicitly requested.

## Workflow

1. Read relevant files before editing.
2. Keep scope tight; do not perform opportunistic refactors unless explicitly requested.
3. Implement the requested change directly.
4. Run validation after changes:
   - `pnpm lint`
   - relevant tests (`pnpm test` or targeted test files) when applicable
5. Report:
   - what changed
   - what was validated
   - any remaining risks/blockers

## Code Quality Standards

- Biome is the source of truth for formatting/linting.
- All code changes must follow Biome rules with no exceptions.
- Before considering work complete, run `pnpm lint` and resolve Biome violations.
- Keep TypeScript types explicit where ambiguity exists.
- Avoid introducing `any` unless unavoidable and justified.
- Preserve existing architectural patterns unless asked to redesign.
- Keep comments minimal and only where they add clear value.

## Safety Rules

- Never run destructive git commands unless explicitly requested:
  - `git reset --hard`
  - `git checkout -- <file>`
  - history rewrites
- Do not revert unrelated local changes.
- If unexpected workspace changes appear, pause and ask before proceeding.

## Project-Specific Rules

- Supabase migrations must be treated as ordered and cumulative.
  - If database setup docs are touched, reference the full migration sequence.
- Do not silently weaken auth/quota behavior.
  - Any auth, RLS, quota, or usage-tracking changes must be called out explicitly.
- Preserve secret-handling behavior (`redactSecrets`) on prompt-processing paths.

## Editing Preferences

- Prefer focused diffs over large rewrites.
- Reuse existing utilities/components before adding new ones.
- Keep naming straightforward and consistent with nearby code.
- Do not upgrade dependencies unless explicitly requested.

## Testing Policy

- Any logic change in `lib/` or `app/api/` must include updated tests or a clear reason tests were not added.

## Docs Policy

- If behavior, setup, or configuration changes, update `README.md` in the same change when relevant.

## Commit Convention

- Use concise commit messages with a prefix:
  - `fix: ...`
  - `feat: ...`
  - `docs: ...`
  - `chore: ...`

## Communication Preferences

- Be concise and direct.
- No fluff.
- Include file paths when explaining changes.
- Ask questions only when genuinely blocked or a decision is required.

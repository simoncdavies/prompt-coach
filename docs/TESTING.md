# Testing Plan

## Implementation Tracker

- [ ] Testing plan execution
  - [x] Unit tests (Vitest) in place for core `lib/` logic
  - [ ] Component tests (`@testing-library/react` + Vitest) in place for UI behavior
    - Current state: minimal coverage only (`components/ui/Button.test.tsx`)
  - [ ] E2E tests (Playwright) for critical auth/enhancer/search flows
  - Remaining: add automated tests/integration tests for quota cycles, auth gates, search pagination/filtering, and nav behavior
  - Agreed stack: `Vitest` (unit/server), `@testing-library/react` (component behavior), `Playwright` (critical E2E user flows)

## Coverage Checklist

- Unauthenticated user can view recent prompts list, but cannot open full prompt details.
- Unauthenticated recent prompt list is capped at 20.
- Unauthenticated user is blocked from enhancer and prompted to log in/register.
- Authenticated user can use enhancer up to 5 times per month.
- 6th attempt in the same month is blocked with a clear message.
- Usage resets on each user's monthly signup anniversary date.
- Authenticated user can access dedicated search and retrieve beyond the 20-item recent cap.
- Search page pagination returns 20 items per batch and supports loading additional pages.
- "Only my prompts" checkbox correctly limits results to the signed-in user's prompts.
- Burger menu icon is visible on all pages and all viewport sizes.
- Burger menu opens/closes correctly via mouse, touch, and keyboard.
- Menu items switch correctly by auth state (Search/Login/Register/Account/Logout).

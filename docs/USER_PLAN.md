# Plan: Enforce Auth for Prompt Enhancer (Keep Recent Prompts Viewable)

## Goals
- Allow anyone to click and view recent prompts in full detail (limited to the latest 20 prompts).
- Require authentication only when a user tries to use the prompt enhancer.
- Support existing users logging in and new users registering.
- Limit prompt enhancer usage to 5 prompts per user per month, resetting on each user's signup day.
- Let authenticated users access a dedicated search page to browse their full prompt history (not just recent ones).
- Consider upsell paths and paid plans for higher monthly limits.

## Scope Assumptions
- “Prompt generator” refers to browsing recent prompts and viewing details.
- “Prompt enhancer” refers to the action that transforms or improves a prompt.
- Supabase is the auth and data backend.

## Plan
1. **Priority first step: auth + 5/month enforcement**
   - Implement authentication flow for enhancer entry points.
   - Enforce per-user 5/month limit server-side as the initial gate.

2. **Confirm product boundaries**
   - Define which UI actions are “view only” vs “enhance.”
   - Confirm whether the monthly limit applies only to the enhancer (recommended).
   - Decide if the limit is per user or per workspace/team.
   - Define “recent prompts” for unauthenticated users (latest 20) vs full-history search for authenticated users.
   - For phase 1, keep search basic with pagination only; defer advanced filtering to phase 2.

3. **Define auth gating rules**
   - No auth required for browsing recent prompts or viewing full details.
   - Auth required when the user submits to the enhancer (button click, API call).
   - If unauthenticated, show a login/register dialog with a clear return path to the enhancer.

4. **Inventory existing flows**
   - Identify the current enhancer entry points (buttons, forms, keyboard actions).
   - Map the enhancer request path (client action → API route/server action → Supabase).
   - Identify where recent prompts are fetched and rendered (must stay unauthenticated).
   - Use `prompt_runs.user_id` as the source of truth for dedicated authenticated search results.

5. **Design the auth UX**
   - If user not signed in, show modal or redirect to auth page with CTA to register or log in.
   - After successful auth, return to the enhancer input with the user’s draft preserved.
   - Ensure logged-in users can log out and re-auth cleanly.

6. **Plan the monthly usage limit (5 per month)**
   - Store usage by user and month in Supabase (e.g., a `prompt_enhancer_usage` table).
   - Create a server-side check on each enhancer request to:
     - Verify authentication.
     - Count usage in the user's current monthly cycle (from signup day).
     - Allow or block when the count reaches 5.
   - Use UTC as the canonical timezone for signup-day reset boundaries.
   - Ensure usage check + increment is atomic/transactional to prevent concurrent overages.
   - If blocked, return a clear message and optionally offer upgrade or wait-until-next-month info.
   - Consider a `user_roles` (or `user_plans`) table that maps role → monthly limit, including an unlimited role for power users.

7. **Server-side enforcement (source of truth)**
   - Ensure the enhancer API/server action checks auth and usage before processing.
   - Do not rely on client-only checks for auth or limits.
   - Make sure recent-prompt read endpoints remain publicly accessible and capped at the latest 20 prompts.

8. **Client-side affordances**
   - Show a “5 per month” limit indicator near the enhancer UI (optional but recommended).
   - If authenticated, show remaining quota for the current month.
   - If unauthenticated, show a brief note that enhancement requires an account.
   - Show CTA for signed-in users to open the dedicated search page for full-history browsing.
   - On the dedicated search page, return results in paginated batches of 20.
   - Include a checkbox to show only the signed-in user's prompts.

9. **Navigation (global burger menu)**
   - Use a standard burger menu icon on all screen sizes (desktop and mobile).
   - The same icon should toggle open/close state for the primary navigation panel.
   - Menu items for phase 1:
     - Recent Prompts
     - Enhancer
     - Search (authenticated only)
     - Login/Register (signed-out only)
     - Account/Logout (signed-in only)
   - Ensure keyboard and screen-reader accessibility (`aria-label`, focus management, and clear open/close state).

10. **Analytics and auditing**
   - Log enhancement attempts (allowed/blocked) for visibility.
   - Track conversion: unauthenticated users who register after hitting enhancer gate.

11. **Testing plan**
   - Unauthenticated user can view recent prompts + details.
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

12. **Monetization and upsell (design + data hooks)**
    - Define free tier as 5 enhancements/month.
    - Provisional paid tiers: £10 for 200 enhancements/month; £20 for 500 enhancements/month.
    - Decide on purchase flow and billing provider (Stripe recommended if not already).
    - Add upsell entry points:
     - When user hits 5/5 quota (blocked state).
     - Subtle badge near the enhancer and quota counter.
     - Pricing link from account/settings.
    - Track conversion and drop-offs on the quota-block screen.
    - Support “power users” who are unrestricted (e.g., admin flag or allowlist).

13. **Rollout considerations**
   - Migrate existing users with no changes to their access except limit enforcement.
   - Add a short release note or tooltip explaining the new monthly limit.

## Extra Recommendations
- Enforce auth + quota server-side only; treat client checks as UX hints.
- Preserve user drafts through auth (redirect with state or save locally).
- Display remaining quota and next reset date for clarity.
- Use a role/plan table for limits, with an allowlist for instant power-user overrides.
- Respect `is_public` for global browsing; ignore it for a user viewing their own prompts.
- Add basic rate limiting for both enhancer and public recent-prompt endpoints, plus bot protection on public endpoints.

## Decisions (answered)
- Limit resets monthly on the user’s signup day (e.g., register on the 3rd, reset on the 3rd next month).
- UTC is the source of truth for monthly reset boundaries.
- Upgrade path should appear when a user hits 5/5 and attempts another enhancement.
- Unauthenticated users can browse only the most recent 20 prompts; authenticated users have a dedicated search page for full-history retrieval.
- Dedicated search is phase 1 basic pagination (20 per page); advanced filtering is phase 2.
- Dedicated search includes an "only my prompts" checkbox.
- No free trial; the 5/month free usage acts as the trial.
- Leave existing runs as-is; optionally hide later if needed.

## Open Questions
- None at this time.

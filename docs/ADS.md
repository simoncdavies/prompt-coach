# Ads Plan

## Google Ads Pilot Checklist

- [ ] Keep GA-only setup for phase 1 (no GTM dependency yet)
- [ ] Add AdSense integration (`<head>` script + `public/ads.txt`)
- [ ] Gate GA + AdSense on cookie consent acceptance (do not load before consent)
- [ ] Enable ads for free users (signed-out and signed-in)
- [ ] Keep signed-in paid-plan enhancer/results experience ad-free
- [ ] Add explicit paid/free flag in usage payload for deterministic ad gating
- [ ] Add ad placements away from prompt input/results content
- [ ] Track ad impressions/clicks + impact on signup/upgrade conversion
- [ ] Review metrics and decide expand/reduce/remove

## Monetization + Ad Decisions

- Phase 1 analytics stack remains GA-only; GTM is optional later.
- Integrate AdSense directly in app code (global script + `ads.txt` + controlled slot components).
- Ensure non-essential tracking/ad scripts are consent-gated (only after user accepts in cookie banner).
- Ad visibility rule: show ads to signed-out users and signed-in free users; keep paid plans ad-free.
- Add a deterministic server-backed paid/free indicator in usage/account payloads for ad gating.

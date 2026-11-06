# Testing and feedback

Owners: Sadiya and Arefa. Log what was tested, what happened, and what to fix.

## Core journey checklist (run before every push to main and before the pitch)
- [ ] Works on the live site
- [ ] Works on a phone-size screen
- [ ] Demo path completes in under 3 minutes

## Test log
| Date and time | Tester | What was tested | Result | Fix needed |
|---|---|---|---|---|
| 2026-11-06 | Claude (automated, desktop browser only) | After the visual redesign (new colours, fonts, live home hero): axe on 11 pages at 320, 390, 1280 px plus open states, Lighthouse mobile on 4 pages, 230 unit tests, 3 end-to-end tests | axe: 0 violations. Lighthouse: Performance 99 to 100, Accessibility 100, Best Practices 100, SEO 100. All tests pass. | None open. Sadiya and Arefa to review the new look on real phones. |
| 2026-11-06 | Claude (automated, desktop browser only) | Layout audit: 13 pages at 320, 360, 390, 430, 768, 1024 and 1280 px | Fixed: pharmacy compare page overflowed sideways at 320 px. After the fix: no overflow anywhere, one heading per page, all controls labelled, all tap targets 44 px or more. | None open. Still needs real phones. |
| 2026-11-06 | Claude (automated, desktop browser only) | Lighthouse mobile on Home, Menu, Grocery, Wallet, Expiry, About | Performance 99 to 100, Accessibility 100, Best Practices 100, SEO 100 (after adding favicon and robots.txt, fixing low-contrast text) | None open |
| 2026-11-06 | Claude (automated, desktop browser only) | axe-core accessibility checks on Compare pages, forms and open sheets at 320, 390, 1280 px | 0 violations (fixed 2 issues: button names not matching visible text, notice outside a landmark) | None open |
| 2026-11-06 | Claude (automated, desktop browser only) | 3 end-to-end journeys + 230 unit tests: judge path, wallet add/edit/delete + expiry, damaged saved data, 404, keyboard (skip link, Escape, focus stays in sheets), scroll to top | All pass | None open |
| 2026-11-06 | Claude (automated) | R2 logic: store v2 with v1 migration, notifications (10 on a fresh device, 24h/72h/168h boundaries, 7-day expired cutoff), search, featured savings (equal engine output), demo basket loader | 322 unit tests and 3 e2e tests pass | None open |
| 2026-11-06 | Claude (automated) | R3 shell and routes: 4 bottom tabs with badges, ☰ menu, desktop sidebar and header search, Alerts page (10 on a fresh device, read state survives reload), search, compare hub, voucher pages, old-link redirects, overflow at 320px | 322 unit tests and 13 e2e tests pass | None open |

| 2026-11-06 | Claude (automated + visual check with temporary test images) | R4 image system: `npm run images` builds logos/photos to WebP 160/480 and a file list; fallbacks when files are missing or requests fail; names checked against the catalogue; no layout shift | 331 unit tests and 16 e2e tests pass. Pipeline verified with temporary images (removed) | None open |

| 2026-11-06 | Claude (automated + screenshots at 390 and 1280px) | R5 Home: hero with two working CTAs, category tiles with counts, live comparison (right rail on desktop), engine-made featured savings (QAR 5.00, 14.75, 47.80), voucher highlights, search pill | 334 unit tests and 25 e2e tests pass; no overflow 320 to 768px | None open |

| 2026-11-06 | Claude (automated + screenshots at 390 and 1280px) | R6 screens: blue ring and pink pill on the winner, prices never wrap, desktop compare side panel (basket, profile, Try a voucher), Best for your Food basket with category switch, Vouchers title, About images and credits | 334 unit tests and 29 e2e tests pass | None open |

| 2026-11-06 | Claude (automated, desktop Chrome only) | R8 QA: axe-core (WCAG 2.0/2.1/2.2 A and AA plus best practice) on 19 routes at 320, 390 and 1280px, plus the profile sheet, ☰ menu and reset confirm. Lighthouse mobile on the production build: Accessibility 100, Best practices 100; Performance 93 with real (devtools) throttling, LCP 2.5s, TBT 70ms; with Lighthouse's default simulated throttling Performance is 74 to 88 because a headless software-GPU paint task is magnified 4x. | axe: 0 violations after fixing 2 issues (icon-link labels that did not contain their visible text; unnamed duplicate landmarks). 334 unit and 29 e2e tests pass | Real Android and iPhone test still needed (Sadiya, Arefa). Check Performance on a real phone |

## User feedback
-

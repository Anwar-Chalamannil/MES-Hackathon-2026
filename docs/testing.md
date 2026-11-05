# Testing and feedback

Owners: Sadiya and Arefa. Log what was tested, what happened, and what to fix.

## Core journey checklist (run before every push to main and before the pitch)
- [ ] Works on the live site
- [ ] Works on a phone-size screen
- [ ] Demo path completes in under 3 minutes

## Test log
| Date and time | Tester | What was tested | Result | Fix needed |
|---|---|---|---|---|
| 2026-11-06 | Claude (automated, desktop browser only) | Layout audit: 13 pages at 320, 360, 390, 430, 768, 1024 and 1280 px | Fixed: pharmacy compare page overflowed sideways at 320 px. After the fix: no overflow anywhere, one heading per page, all controls labelled, all tap targets 44 px or more. | None open. Still needs real phones. |
| 2026-11-06 | Claude (automated, desktop browser only) | Lighthouse mobile on Home, Menu, Grocery, Wallet, Expiry, About | Performance 99 to 100, Accessibility 100, Best Practices 100, SEO 100 (after adding favicon and robots.txt, fixing low-contrast text) | None open |
| 2026-11-06 | Claude (automated, desktop browser only) | axe-core accessibility checks on Compare pages, forms and open sheets at 320, 390, 1280 px | 0 violations (fixed 2 issues: button names not matching visible text, notice outside a landmark) | None open |
| 2026-11-06 | Claude (automated, desktop browser only) | 3 end-to-end journeys + 230 unit tests: judge path, wallet add/edit/delete + expiry, damaged saved data, 404, keyboard (skip link, Escape, focus stays in sheets), scroll to top | All pass | None open |

## User feedback
-

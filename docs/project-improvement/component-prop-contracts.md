# Component prop contract baseline

## Scope

Reusable components had 61 `react/prop-types` errors. This change declares the runtime props contract for 13 card, review, input, pagination, and authentication-provider components only.

No API request, state transition, seat/payment behavior, or props flow was changed.

## Implementation

- The existing `prop-types` package is used; no dependency was added.
- Identifier values accept the existing string-or-number API/fixture shape.
- Review objects, callbacks, and `AuthProvider` children use `shape`, `func`, and `node` contracts matching their actual reads.
- Display values whose requiredness is not established remain optional; no new default values were introduced.

## Result and limits

| Metric | Before | After |
| --- | ---: | ---: |
| lint errors | 95 | 34 |
| lint warnings | 2 | 2 |
| `react/prop-types` errors | 61 | 0 |

The remaining 34 errors are `no-unused-vars` (23), `react/no-unescaped-entities` (9), and `no-useless-escape` (2). The two warnings are `react-hooks/exhaustive-deps`. They require file-level behavior review, so they remain out of scope rather than being globally disabled.

This is a static contract baseline, not a performance or production-quality claim.

## Verification

- `npm run lint`: target rule 0; full baseline 34 errors and 2 warnings
- `npm test`: 72 tests passed
- `npm run build`: production build passed

## Related

- [Issue #37](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/37)

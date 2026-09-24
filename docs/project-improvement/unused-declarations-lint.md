# Unused declaration lint baseline

## Scope

After the props-contract work, `no-unused-vars` still reported 23 errors. Each location was inspected before removal. The set contains JSX-transform-era `React` imports, unconsumed router/context values, callback parameters whose response is not read, a Login state value not rendered, and an unconsumed `Pagination` prop.

No API request, route target, seat/payment state transition, or rendered value is changed.

## Result

| Metric | Before | After |
| --- | ---: | ---: |
| lint errors | 34 | 11 |
| lint warnings | 2 | 2 |
| `no-unused-vars` errors | 23 | 0 |

The remaining errors are `react/no-unescaped-entities` (9) and `no-useless-escape` (2). The remaining warnings are `react-hooks/exhaustive-deps` (2). They are deliberately not disabled or combined into this removal-only change because their fixes require UI text or effect-dependency behavior review.

## Verification

- `npm run lint`: `no-unused-vars` 0; full baseline 11 errors and 2 warnings
- `npm test`: 72 tests passed
- `npm run build`: production build passed

## Related

- [Issue #39](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/39)

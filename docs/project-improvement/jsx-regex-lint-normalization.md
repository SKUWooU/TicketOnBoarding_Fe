# JSX and regex lint normalization

## Scope

The lint baseline had 9 `react/no-unescaped-entities` errors in visible `Md's Pick` text and 2 `no-useless-escape` errors in the SignUp email regex character class.

This change uses `&apos;` in JSX text, which renders the same apostrophe character, and changes `[-_\.]` to `[-_.]` only inside character classes. The email regex still accepts the same hyphen, underscore, and dot characters.

## Result

| Metric | Before | After |
| --- | ---: | ---: |
| lint errors | 11 | 0 |
| lint warnings | 2 | 2 |
| JSX/regex lint errors | 11 | 0 |

`npm run lint` still exits non-zero because its existing `--max-warnings 0` policy rejects the two remaining `react-hooks/exhaustive-deps` warnings. The warnings were not suppressed or modified here: changing effect dependencies needs separate behavior analysis.

## Verification

- `npm run lint`: 0 errors, 2 effect-dependency warnings; non-zero exit is expected under `--max-warnings 0`
- `npm test`: 72 tests passed
- `npm run build`: production build passed

## Related

- [Issue #41](https://github.com/SKUWooU/TicketOnBoarding_Fe/issues/41)

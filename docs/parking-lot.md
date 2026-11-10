# Parking lot — not in the current milestone

Only the user moves an item into a milestone, and only by removing an issue of similar size.

| Date       | Item                                                                                                                                                                          | Source                      | Blocks first payment? |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------- |
| 2026-11-10 | Account update validator checks a cash/prepaid balance for negativity only when the request carries both `balance` and `type`; a request with `balance` alone skips the check | account opening-balance fix | no                    |
| 2026-11-10 | Money is stored as `Float` (`balance`, `openingBalance`, transaction `amount`); move to a decimal type to avoid float rounding                                                | account opening-balance fix | no                    |
| 2026-11-10 | No test runner in the repo, so the opening-balance recompute rule shipped without unit tests; first candidate once one exists                                                 | account opening-balance fix | no                    |

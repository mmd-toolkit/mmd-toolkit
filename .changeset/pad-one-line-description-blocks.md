---
"prettier-plugin-mmd": minor
---

Print a one-line `accDescr { ... }` with one space inside each end, as a
one-line `@{ ... }` already is: `accDescr {a b}` now prints as
`accDescr { a b }`. A block that holds a comment or a directive stays as
written, and so does one that holds `style` or `classDef` with a `;`, and the
blocks of `eventmodeling`, whose Db holds the written characters.

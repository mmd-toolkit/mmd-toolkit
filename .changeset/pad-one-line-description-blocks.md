---
"prettier-plugin-mmd": minor
---

Print a one-line `accDescr { ... }` with one space inside each end, as a
one-line `@{ ... }` already is: `accDescr {a b}` now prints as
`accDescr { a b }`. A block that holds a comment, a directive, or a `;` stays as
written, as does a block on a line kept as written, and the blocks of
`eventmodeling`, whose Db holds the written characters.

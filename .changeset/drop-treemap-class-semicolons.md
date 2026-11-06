---
"prettier-plugin-mmd": minor
---

Drop the `;` that ends a `classDef` line in `treemap`, as in the other diagram
types. `classDef important fill:#f96;` now prints as
`classDef important fill:#f96`. The `;` stays where it is needed: after a
`classDef` without a style, whose next line would become the style, and before
another statement on the same line.

---
"prettier-plugin-mmd": patch
---

Keep a no-break space, U+2028, U+2029, U+3000, a vertical tab, or a byte order
mark at the end of a `classDef` of a `treemap`, and the `;` before a comment
line after U+2028 or U+2029: mermaid.js draws another figure without them, and
the statement took the next one into it. `classDef aa fill:red`, U+00A0, `;` is
printed `classDef aa fill: red`, U+00A0.

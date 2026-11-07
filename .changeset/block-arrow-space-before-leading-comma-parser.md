---
"@mmd-toolkit/parser": patch
---

Reject whitespace between the `(` of a `block` arrow's directions and a `,`
before the first direction, as mermaid.js does: `a<["L"]>( ,x)` is now a syntax
error.

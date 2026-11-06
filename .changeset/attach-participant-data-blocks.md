---
"prettier-plugin-mmd": minor
---

Attach a sequence participant's `@{ ... }` data block to its id.
`participant A @{ "type": "queue" }` now prints as
`participant A@{ "type": "queue" }`, the form in the Mermaid documentation.
mermaid.js reads the same diagram either way. A directive, U+2028, or U+2029
between the id and the block keeps the whitespace as written.

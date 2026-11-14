---
"prettier-plugin-mmd": patch
---

Keep the case of a hex color in a `style` or `classDef` of an `erDiagram` or a
`requirementDiagram` where more characters follow it after whitespace, as
mermaid.js reads the style as one word: `style A fill:#F9F ab` was printed
`fill: #f9f ab`, which changes the style that mermaid.js reads from
`fill:#F9Fab` to `fill:#f9fab`, and is now printed `fill: #F9F ab`. The same
holds in the other diagram types for a color that a U+2028, U+2029, or U+00A0
follows.

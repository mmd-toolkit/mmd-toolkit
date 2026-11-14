---
"prettier-plugin-mmd": patch
---

Keep the case of a hex color in a `style` or `classDef` that mermaid.js reads as
one word with the characters after it: in `erDiagram` and `requirementDiagram`,
`style A fill:#F9F ab` was printed `fill: #f9f ab`, which changes the style that
mermaid.js reads from `fill:#F9Fab` to `fill:#f9fab`, and is now printed
`fill: #F9F ab`; in the other diagram types a color followed by a U+2028,
U+2029, U+00A0, U+3000, or vertical tab and more text stays as written for the
same reason. In `erDiagram`, a letter on the next line that a color followed by
`;` touches is now written in the case of the color.

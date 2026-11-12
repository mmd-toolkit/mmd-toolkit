---
"prettier-plugin-mmd": patch
---

Keep whether whitespace stands before the `color` or `text-align` of a `style`
and a `linkStyle` in `flowchart`, and before the `color` of a `style` in
`classDiagram`: `style A fill:#f00,color:white` was printed
`style A fill: #f00, color: white`, which mermaid.js 10.9.8 draws with another
text colour.

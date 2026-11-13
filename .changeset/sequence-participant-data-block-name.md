---
"prettier-plugin-mmd": patch
---

Keep a `participant` or `actor` whose data block holds none of `:`, `,`, `;`,
and `>` as written: `participant A@{x}` and `participant A  @{ x }` were printed
`participant A@{ x }`, which mermaid.js 10.9.8 and 11.7.0 draw as another name.

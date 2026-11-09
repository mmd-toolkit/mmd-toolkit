---
"prettier-plugin-mmd": minor
---

Print a field of a `sankey` link without quotes when its text is plain (ASCII
letters, digits, `_`, `-`, and `.`, with spaces between them): `"a b",c,"1.0"`
becomes `a b,c,1`. Before, the formatter printed the quotes as written, so one
id or value was printed in two forms depending on how its author wrote it,
although mermaid.js reads both forms the same and its documentation writes the
sources and values of links only without quotes. A field with a comma, a doubled
quote, a line break, a `;`, a `#`, a `%%`, or another character that is not
plain, or with a directive inside it, stays in quotes.

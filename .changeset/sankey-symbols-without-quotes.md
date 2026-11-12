---
"prettier-plugin-mmd": minor
---

Print a `sankey` source or target with `&`, `<`, `>`, `'`, `/`, or `\` without
quotes: `"R&D",Product,10` becomes `R&D,Product,10`. Before, since 0.8.0, these
characters kept the quotes, because it had not been checked that mermaid.js
reads them the same without quotes, so the same name came out in two forms
depending on how its author wrote it. Now such a name is printed like any other
plain name, and a text with a comma keeps its quotes.

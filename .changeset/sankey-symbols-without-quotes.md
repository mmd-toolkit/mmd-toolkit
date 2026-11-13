---
"prettier-plugin-mmd": minor
---

Remove unnecessary quotes from `sankey` source and target names:
`"R&D",Product,10` becomes `R&D,Product,10`. Before, since 0.8.0, names such as
this kept their quotes to preserve names containing punctuation, so the same
source or target came out in two forms depending on how its author wrote it. Now
such names are printed without quotes while a text with a comma keeps them.

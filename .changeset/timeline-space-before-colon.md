---
"prettier-plugin-mmd": minor
---

Print a space before the `:` that follows a period or an event of a `timeline`
that ends without whitespace: `2004: Facebook: Google` becomes
`2004 : Facebook : Google`. Before, since the first release, the whitespace
before a `:` stayed as written, because mermaid.js keeps it in the text of the
period and of the event, so the same timeline came out in different forms
although all of them draw the same. Now every `:` between two texts has a space
before it, as in the examples of the documentation of mermaid.js, and the
whitespace that is already there, such as the padding that aligns the colons,
stays.

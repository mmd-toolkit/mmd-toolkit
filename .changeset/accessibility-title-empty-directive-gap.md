---
"prettier-plugin-mmd": patch
---

Keep what mermaid.js 10.9.8 draws as text before a `%%{` that no word character
follows, such as `%%{}%%`, in a pie chart or a gitGraph: the spaces and tabs of
an `accTitle` line (`accTitle: Value   %%{}%%` was printed
`accTitle: Value %%{}%%`), and a no-break space or another whitespace character
that is no space or tab in a `title` or an `accDescr:` line. Spaces and tabs in
a `title` or an `accDescr:` line are still printed as one space.

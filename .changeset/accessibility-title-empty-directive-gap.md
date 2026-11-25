---
"prettier-plugin-mmd": patch
---

Keep the whitespace before a `%%{}%%` at the end of an `accTitle` line of a pie
chart or a gitGraph as written: `accTitle: Value   %%{}%%` was printed
`accTitle: Value %%{}%%`, and mermaid.js 10.9.8 draws the title of that form as
`Value   %%{}%%`, with the spaces.

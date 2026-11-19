---
"prettier-plugin-mmd": patch
---

Keep the space between the end of a `flow` or `connector` name such as
`Front#fin` and a `;` that a directive follows, so that the text is no longer
rejected by mermaid.js: `flow Front#fin ;  %%{x}%%` now prints
`flow Front#fin ; %%{x}%%`, where it printed `flow Front#fin; %%{x}%%`.

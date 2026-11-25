---
"prettier-plugin-mmd": patch
---

Keep the quotes of the name of a `requirement` element that U+2028 and a comment
separate from its keyword, so that mermaid.js accepts the formatted text: `"e" `
is no longer printed `e `.

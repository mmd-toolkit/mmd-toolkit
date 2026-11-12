---
"prettier-plugin-mmd": minor
---

Print the colon of a `pie` section against its label: `"Dogs" : 386` is now
printed `"Dogs": 386`. The colon was printed with a space on each side, as the
examples in the mermaid.js documentation write it, but a label and its value are
a key and its value, and Prettier prints no space before the colon that follows
a key, so a formatted `pie` looked unlike the keys and values in the rest of a
project. Now the colon touches the label and has one space after it, which
mermaid.js reads the same.

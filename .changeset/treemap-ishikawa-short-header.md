---
"prettier-plugin-mmd": minor
---

Print the header of a `treemap` or `ishikawa` diagram without `-beta`, and the
header of an `ishikawa` diagram in lower case: `ISHIKAWA-BETA` becomes
`ishikawa`. Until now, since 0.6.0, every header stayed as written to avoid
names that older versions of mermaid.js could not read, so these diagrams could
come out in multiple spellings even though every version that the formatter
checks draws those spellings the same. Now the shorter name is printed unless it
would change an `ishikawa` root, as in `ishikawa-beta-beta`.

---
"prettier-plugin-mmd": minor
---

Print the header of a `treemap` or `ishikawa` diagram without `-beta`, and the
header of an `ishikawa` diagram in lower case: `treemap-beta` becomes `treemap`,
and `ISHIKAWA-BETA` becomes `ishikawa`. Until now, since 0.6.0, every header
stayed as written, because some versions of mermaid.js do not read the short
name of some diagrams, but every version that has these two diagrams reads both
names and draws them the same. A header that is followed by a root starting with
the word `-beta` and stays on the line of the header is kept as written, so that
`ishikawa-beta-beta` keeps its root.

---
"prettier-plugin-mmd": minor
---

Leave out the whitespace at the end of the line of a flowchart `subgraph` whose
name has several words: `subgraph S1 S2 ` becomes `subgraph S1 S2`. A name of
one word keeps it, since that whitespace changes the id of the subgraph.

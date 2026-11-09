---
"prettier-plugin-mmd": minor
---

Leave out the whitespace at the end of the line of a flowchart `subgraph` whose
name has several words, and print the whitespace between the name and a
directive after it as one space, also in a swimlane diagram: `subgraph S1 S2 `
becomes `subgraph S1 S2`, and `subgraph S1 S2   %%{init: {}}%%` becomes
`subgraph S1 S2 %%{init: {}}%%`. A name of one word keeps it, since that
whitespace changes the id of the subgraph.

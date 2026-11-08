---
"prettier-plugin-mmd": minor
---

Print a directive in a gap as the gap prints without it, with the space of the
gap before the directive and the directive touching the unit after it:
`A%%{init: {}}%%-->B` and `A  %%{init: {}}%%  --> B` become
`A %%{init: {}}%%--> B`, and `note%%{init: {}}%% for A "t"` becomes
`note %%{init: {}}%%for A "t"`. A `;` that mermaid.js ignores in the same gap
stays against the unit before it. A gap that the line rule of mermaid.js may
read, and a directive at the start or the end of a line, keep whether the gap
holds whitespace, a run becoming one space. A gap with a U+2028 or U+2029 keeps
the whitespace written, and so do the gaps of `kanban`, `mindmap`, `treemap` and
`ishikawa`, where that whitespace is indentation, apart from the directives at
the end of a text.

---
"prettier-plugin-mmd": minor
---

Print the spellings that mermaid.js reads the same and draws the same in the
form that the examples in its documentation use at least twice as often as any
other, unless a version of mermaid.js reads or draws that form differently. A
keyword is printed in the case of the examples (`PARTICIPANT A` becomes
`participant A`), except `style` and `classDef`, which stay as written because
mermaid.js reads a line with them in another case differently when a `;` ends
it. A string between `'` is printed between `"` in the ten diagram types that
read both (`'a'` becomes `"a"`), and a number of a pie chart, an xychart, a
treemap, a radar chart, a sankey diagram, and a Venn diagram is printed in the
shortest form (`1.50` becomes `1.5`). The words of an ER relationship become
symbols (`A only one to zero or more B` becomes `A ||--o{ B`), `Rel_Up`,
`Rel_Down`, `Rel_Left`, and `Rel_Right` of a C4 diagram become `Rel_U`, `Rel_D`,
`Rel_L`, and `Rel_R`, `::=` of the EBNF notation of a railroad diagram becomes
`=`, a range of a packet diagram with equal ends (`4-4`) becomes the position
(`4`), and `switch` of a gitGraph becomes `checkout`. The colon after the header
of a cynefin or a radar diagram is removed. The direction `TD` of an agentflow
or swimlane header becomes `TB` (not when a directive stands between the header
and the direction), and the label of a link is printed between the arrows in an
agentflow diagram (`A -->|x| B` becomes `A -- x --> B`) and between `|` in a
swimlane diagram. The names of a header, the direction of a flowchart header,
and the colon after the header of a gitGraph stay as written, since versions of
mermaid.js read or draw them differently. A spelling that the examples do not
use in one form, or that changes what mermaid.js reads, stays as written, and so
do the `direction` statements. The option `singleQuote` has no effect on these
strings.

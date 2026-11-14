---
"@mmd-toolkit/spec": patch
---

State which names and texts go on across a comment line after a U+2028 or U+2029
in them, as the comment lines of `common.md` define, and which end at the U+2028
instead, in the lexical sections (units, contexts, strings, and comments) of
every diagram document except agentflow, eventmodeling, ishikawa, and sankey: in
`stateDiagram`, `X: A`, U+2028, a line `%% c`, and a line `B` give X the
description `A`, U+2028, `B`, while in `block-beta` the id `a` ends at the
U+2028. An implementation reads the values that go on as one value with the
comment line left out.

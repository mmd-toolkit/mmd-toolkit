---
"@mmd-toolkit/spec": patch
---

Move every fixture citation out of the sentence it backs, in every document of
the specification. An implementation finds the fixtures of a sentence in the
paragraph of citations that follows it, or, for a table row, in its `Fixtures`
cell.

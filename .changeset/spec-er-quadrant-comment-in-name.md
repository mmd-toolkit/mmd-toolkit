---
"@mmd-toolkit/spec": patch
---

State in erDiagram, in Comment regions inside names under Units and contexts,
and in quadrantChart, under Classes, that a name goes on across a comment line
that follows a U+2028 or U+2029 in it, as the comment lines of `common.md`
already define: `A`, U+2028, `%% c`, a line break, and `Bar` is one entity. A
directive at the start of the line after such a comment line lies inside the
name, so the input is rejected as `directive-as-token-boundary`. The tree
documents say under `ErIdentifier` and `QuadrantIdentifier` that the comment
region is left out of the written text of the name.

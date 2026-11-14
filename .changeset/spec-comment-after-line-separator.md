---
"@mmd-toolkit/spec": patch
---

State which names and texts go on across a comment line after a U+2028 or U+2029
in them, as the comment lines of `common.md` define, in the lexical sections
(units, contexts, strings, and comments) of `C4Context` and the other C4 types,
`cynefin-beta`, `erDiagram`, `gitGraph`, `info`, `journey`, `packet`, `pie`,
`quadrantChart`, `radar-beta`, `railroad-beta`, `requirementDiagram`,
`sequenceDiagram`, `timeline`, `treemap-beta`, `treeView-beta`, `usecase-beta`,
`venn-beta`, `wardley-beta`, and `xychart`: in `journey`, `title A`, U+2028, a
line `%% c`, and a line `B` give the title `A`, U+2028, `B`. An implementation
reads the values that go on as one value with the comment line left out.

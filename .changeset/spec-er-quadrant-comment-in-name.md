---
"@mmd-toolkit/spec": patch
---

State in erDiagram (Comment regions inside names, and `ErIdentifier`) and in
quadrantChart (Classes, and `QuadrantIdentifier`) that a name goes on across a
comment line after a U+2028 or U+2029 in it: `A`, U+2028, `%% c`, a line break,
and `Bar` is one entity. An implementation reads such a name as one, leaves the
comment region out of its written text, and rejects a directive inside it, as
`directive-as-token-boundary` says.

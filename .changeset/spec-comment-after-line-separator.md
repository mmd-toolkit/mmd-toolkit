---
"@mmd-toolkit/spec": patch
---

State in each diagram document that a comment line after a U+2028 or U+2029
inside a name or a text is removed and the value goes on after it, as the
comment lines of `common.md` already define, also where the document says that a
`%%` in that value is text or ends it: in `stateDiagram`, `X: a`, U+2028, a line
`%% c`, and a line `b` give X the description `a`, U+2028, `b`.

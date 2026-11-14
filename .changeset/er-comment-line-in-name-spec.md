---
"@mmd-toolkit/spec": minor
---

Accept in `er` (Units and contexts, Comments) a comment line after a U+2028 or
U+2029 that follows a unit on its line, so that a name holding the U+2028 goes
on after it: `A`, U+2028, a line `%% c`, and a line `Bar` is the one entity `A`,
U+2028, `Bar`.

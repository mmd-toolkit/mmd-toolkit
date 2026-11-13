---
"@mmd-toolkit/spec": patch
---

State in `er`, Names, that a name or an attribute word that holds U+2028 or
U+2029 goes on after a comment line that follows it: `A`, U+2028, a line `%% c`,
and a line `Bar` is the one entity `A`, U+2028, `Bar`, and a directive inside
such a name is rejected as in any name.

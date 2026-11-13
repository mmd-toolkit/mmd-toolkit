---
"prettier-plugin-mmd": patch
---

Keep a statement that starts with whitespace other than a space or a tab, such
as a line separator (U+2028 or U+2029) or a no-break space, on its line where a
comment follows it, in an `erDiagram` and a `treeView-beta`: `"Foo"`, a U+2028,
and `%% c` on one line of an `erDiagram` came out on two lines, which lost the
entity that mermaid.js reads from the separator.

---
"prettier-plugin-mmd": patch
---

Keep the whitespace after a directive that is not closed when text follows it on
its line: `%%{x: w B` was printed `%%{x: wB`, which changes the argument of the
directive and drops the `B` from the diagram.

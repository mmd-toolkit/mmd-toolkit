---
"prettier-plugin-mmd": patch
---

Keep whitespace other than a space or a tab, such as a no-break space (U+00A0),
at the end of a `style`, `classDef`, or `linkStyle` line: `classDef c fill:red`
followed by U+00A0 lost the character, and mermaid.js 12.3.0 then drew a class
diagram differently.

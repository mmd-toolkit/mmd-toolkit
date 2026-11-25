---
"prettier-plugin-mmd": patch
---

Fix a `requirement` diagram whose formatted text was rejected when a `style`,
`classDef`, or `class` line ends with a string and the next line is `:::c;`, or
a comment that ends with `;`, followed by U+2028 and a comment.
`style r fill:red "r"` was printed as `style r fill: red` and `"r"` on a line of
its own, and is now printed as written.

---
"prettier-plugin-mmd": patch
---

Fix the whitespace at the start of the line after a `%%{` directive that is not
closed in an `eventmodeling` diagram, which was dropped: ` tf 23 evt End` after
`%%{wrap foo` was printed as `tf 23 evt End`.

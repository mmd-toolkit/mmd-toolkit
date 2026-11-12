---
"prettier-plugin-mmd": patch
---

Print the keywords, strings, and numbers of a line that is printed as written in
the same form as everywhere else: `NOTE OVER A:%%{init: {}}%%  ;ACTOR B` was
printed with its keywords as written, and is now printed
`Note over A:%%{init: {}}%%  ;actor B`. The same spelling came out in two forms,
as written on such a line and in one form on the others, although mermaid.js
reads and draws both the same. Now such a line is printed with the spelling of
the other lines.

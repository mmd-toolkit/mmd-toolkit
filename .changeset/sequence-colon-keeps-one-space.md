---
"prettier-plugin-mmd": patch
---

Keep one space after the `:` of a sequence message or note whose text is only
whitespace: `A->>B:   ` was printed `A ->> B:`. The empty `:` was printed with
nothing after it because mermaid.js 12.3.0 reads both forms the same, but
mermaid.js before 11.7.0 rejects a `:` with nothing after it, so the formatted
diagram stopped drawing there. One space now stays after the `:` of a message, a
note, and a `links`, `link`, `properties`, or `details` statement, and a `:`
written with nothing after it is still printed with nothing.

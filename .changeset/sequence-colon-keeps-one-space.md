---
"prettier-plugin-mmd": patch
---

Keep the first whitespace character after the `:` of a sequence message or note
whose text is only whitespace: `A->>B:   ` was printed `A ->> B:`, and is now
printed `A ->> B: `. The whitespace was dropped because mermaid.js 12.3.0 reads
both forms the same, but mermaid.js 10.9.8 rejects a `:` with nothing after it,
so a diagram that drew there stopped drawing once formatted. Now one whitespace
character stays, the first one as written, which those versions read as the
text, and the formatted diagram draws as it did before.

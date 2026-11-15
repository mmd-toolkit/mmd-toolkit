---
"prettier-plugin-mmd": patch
---

Fix a `sequenceDiagram` whose `title` or `end` has a `;` that the line rule
ignores after it: `accDescr {style:#x} title x;` followed by two spaces and
`A->>B: style:#x;; end;` were printed with the `;` and, formatted again, without
it, and are now printed without it at once. Keep `end` on the line of the text
that its comment needs: `A->>B: x;end #;` is printed `A ->> B: x; end #;`, and
`accDescr {style:#x} end #12; %%{init: {}}%%` stays on one line, where splitting
it printed text that mermaid.js rejects.

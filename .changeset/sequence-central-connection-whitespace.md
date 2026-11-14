---
"prettier-plugin-mmd": patch
---

Keep the whitespace beside the `()` of a `sequenceDiagram` message and before
`<<->>` and `<<-->>` as written: `A ()   <<->> B: x` stays as written. Version
0.5.0 made `()` touch the participant to print message punctuation one way, but
mermaid.js 10.9.8 and 11.7.0 read that form with different participant names,
and 10.9.8 also reads `<<` as part of a name. The whitespace now stays as
written, and activation marks still touch their participant.

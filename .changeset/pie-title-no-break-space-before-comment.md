---
"prettier-plugin-mmd": patch
---

Keep a no-break space or another whitespace character that is no space or tab
before a `%%` comment as written in the `title` of a pie chart and in an
`accDescr` line of a pie chart or a gitGraph, since the oldest supported
mermaid.js draws it as part of the text: `title T` with a no-break space before
`%% c` is no longer printed with a plain space.

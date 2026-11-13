---
"prettier-plugin-mmd": minor
---

Add a missing space before the `:` between a period and an event or between
events of a `timeline`: `2004: Facebook: Google` becomes
`2004 : Facebook : Google`. Before, since the first release, the whitespace
before a `:` stayed as written, because mermaid.js keeps it in the text of the
period and of the event, so the same timeline came out in different forms
although all of them draw the same. Now a missing space is added, as in the
examples of the mermaid.js documentation, and existing whitespace stays as
written.

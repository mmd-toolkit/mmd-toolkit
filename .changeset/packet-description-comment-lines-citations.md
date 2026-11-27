---
"@mmd-toolkit/spec": patch
---

Cite fixtures of comment lines inside a `packet` description block in
`diagrams/packet.md`: a `%%` right after the opening `{` is text of the
description, and a `}` on a comment line goes with the comment, so the block is
closed by a later `}` or, without one, is rejected.

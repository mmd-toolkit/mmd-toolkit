---
"@mmd-toolkit/parser": patch
---

Fix `parse()` stopping with an internal error on an `agentflow-beta` label that
holds only whitespace and a comment, such as `A[ %% c` followed by a line `]`.
The label now has a `RawText` token for each run of whitespace around the
comment.

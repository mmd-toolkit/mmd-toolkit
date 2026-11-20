---
"@mmd-toolkit/parser": patch
---

Fix `parse()` stopping with an internal error on an `agentflow-beta` label that
holds only whitespace and a comment, such as `A[ %% c` followed by a line `]`.

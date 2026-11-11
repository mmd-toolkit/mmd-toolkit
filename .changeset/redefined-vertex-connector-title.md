---
"@mmd-toolkit/eslint-plugin": patch
---

Fix `agentflow-no-redefined-vertex` after a `connector` declaration: its title
is plain text even when written as markdown, so `C["API"]` in a later `flow`
after `connector C["`API`"]` is now reported, and `C["`API`"]` is not.

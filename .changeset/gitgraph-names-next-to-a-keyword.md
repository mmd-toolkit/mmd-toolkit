---
"prettier-plugin-mmd": minor
---

Print `branch "commit-x"` as `branch commit-x` in `gitGraph`. Since 0.8.0, a
name that started with a keyword or spelled one in another case kept its quotes
to avoid being read as a keyword, so the same branch could come out in two forms
that draw the same figure. Now such names lose unnecessary quotes while names
read as keywords, such as `"Merge"`, keep them.

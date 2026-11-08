---
"prettier-plugin-mmd": minor
---

Format a statement that holds a `;` in `architecture`, `c4`, `cynefin`,
`eventmodeling`, `gitgraph`, `info`, `packet`, `pie`, `radar`, `treemap`,
`treeview`, `usecase` and `venn` like any other statement, keeping only the
whitespace that decides which `;` mermaid.js ignores: `commit msg:"style:#x;"`
becomes `commit msg: "style:#x;"`. A statement over several lines is joined
unless joining would change which `;` is ignored, and the whitespace beside an
ignored `;` follows the rule of its gap: `complex "style:#x";"A"` becomes
`complex "style:#x"; "A"` in `cynefin`.

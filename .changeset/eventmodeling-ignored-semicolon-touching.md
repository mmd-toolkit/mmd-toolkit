---
"prettier-plugin-mmd": patch
---

Put no space after a `;` that mermaid.js ignores where a word touches it in an
`eventmodeling` diagram: `/*style:#x*/;title` was printed with a space after the
`;`, which mermaid.js rejects.

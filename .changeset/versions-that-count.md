---
"prettier-plugin-mmd": minor
---

Decide what stays as written from mermaid.js `10.9.8`, `11.7.0`, `11.17.2`,
`12.0.0`, and `12.3.0`: a form is printed only where each of them that has the
diagram type draws it the same. For a diagram type that was added later than the
oldest of these versions of a major version, the first minor version that has
it, at its latest patch, counts in its place for that diagram type alone.

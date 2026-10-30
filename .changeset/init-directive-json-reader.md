---
"@mmd-toolkit/eslint-plugin": minor
---

`no-invalid-init-directive` reports a `'` inside a `"`-quoted string, an
unescaped `"` inside a `'`-quoted string, and `\'` in the JSON of an init
directive, each with a fix, because mermaid.js turns every `'` into `"` before
reading it. Reports of this rule and of `no-duplicate-init-key` point at the
character or key concerned, and `sequence-no-invalid-json` removes trailing
commas only when the value is an object.

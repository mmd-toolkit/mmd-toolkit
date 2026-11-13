---
"prettier-plugin-mmd": patch
---

Keep a tab between the words of an `architecture` label: `["A<tab>B"]` was
printed `[A B]`, which mermaid.js draws as two words instead of one. A tab
beside a quote or a bracket inside the label stays too, as in `["A'<tab>B"]`.

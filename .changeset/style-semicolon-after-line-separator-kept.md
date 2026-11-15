---
"prettier-plugin-mmd": patch
---

Keep a `style` or `classDef` statement from taking the next statement into it
where a U+2028 or U+2029, a `;`, and a comment line follow it: `flowchart`,
`swimlane`, and `agentflow` keep the `;`, and `erDiagram` drops it with the
character, so `style A fill:red`, U+2028, `;`, `%% c`, and `x` is printed
`style A fill: red`, `%% c`, and `x`.

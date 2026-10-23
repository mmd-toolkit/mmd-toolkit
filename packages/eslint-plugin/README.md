# @mmd-toolkit/eslint-plugin

Japanese version: [README.ja.md](./README.ja.md)

An [ESLint](https://eslint.org/) language plugin for Mermaid diagrams: `.mmd`
and `.mermaid` files, and `mermaid` and `mmd` code blocks in Markdown. It gives
ESLint the tree of [`@mmd-toolkit/parser`](../parser), so that rules can read
Mermaid text.

This is a third-party project, not affiliated with mermaid-js. `mmd` here means
the Mermaid diagram syntax, not MultiMarkdown or MikuMikuDance.

The rules are being implemented one diagram type at a time, starting with
flowcharts. [docs/rules/index.md](./docs/rules/index.md) lists every rule and
marks those that are not implemented yet, which report nothing.
`@mmd-toolkit/no-unclosed-directive` is implemented as a trial: it is not in the
recommended configuration, and it will be written again with the other rules
common to every diagram type.

## Installation

The package is not published to npm yet. Once it is, install it next to
ESLint 10. It needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

```sh
npm install --save-dev eslint @mmd-toolkit/eslint-plugin
```

Then add its configuration to `eslint.config.js`. It applies the Mermaid
language to `.mmd` and `.mermaid` files:

```js
import mmd from "@mmd-toolkit/eslint-plugin"

export default [mmd.configs.recommended]
```

## Mermaid code blocks in Markdown

The processor of [`@eslint/markdown`](https://github.com/eslint/markdown) gives
each code block a file name that ends with its language, such as `0.mermaid`.
The configuration above matches the `mermaid` and `mmd` blocks, and ESLint
reports at the places of the Markdown file:

```js
import markdown from "@eslint/markdown"
import mmd from "@mmd-toolkit/eslint-plugin"

export default [...markdown.configs.processor, mmd.configs.recommended]
```

A `mermaid` block that holds no diagram is reported as a parse error.

## Diagram types

The plugin reads these diagram types:

- Flowcharts: `flowchart-v2` (`flowchart` and `graph`), `flowchart-elk`, and
  `swimlane` (`swimlane-beta`).
- Sequence diagrams: `sequence` (`sequenceDiagram`).
- Class diagrams: `classDiagram` (`classDiagram` and `classDiagram-v2`).
- State diagrams: `stateDiagram` (`stateDiagram` and `stateDiagram-v2`).
- Entity relationship diagrams: `er` (`erDiagram`).
- Gantt charts: `gantt` (`gantt`).
- Venn diagrams: `venn` (`venn-beta`).
- Ishikawa diagrams: `ishikawa` (`ishikawa` and `ishikawa-beta`).
- Agent flow diagrams: `agentflow` (`agentflow-beta`).
- Pie charts: `pie` (`pie`).

ER diagrams and Gantt charts have no rules of their own yet. Other diagram types
are reported as parse errors until they are supported.

## Configuration comments

Mermaid comments (`%%` lines) configure ESLint as JavaScript comments do:

```mmd
flowchart LR
  %% eslint-disable-next-line -- the reason
  A --> B
```

`%% eslint-disable`, `%% eslint-enable`, `%% eslint-disable-next-line`, and
`%% eslint <rule>: <config>` are read. A Mermaid comment fills its line, so
`%% eslint-disable-line` applies only to the comment itself.

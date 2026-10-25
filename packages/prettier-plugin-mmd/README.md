# prettier-plugin-mmd

Japanese version: [README.ja.md](./README.ja.md)

A [Prettier](https://prettier.io/) plugin that formats Mermaid diagrams: `.mmd`
and `.mermaid` files, and `mermaid` code blocks in Markdown.

This is a third-party project, not affiliated with mermaid-js. `mmd` here means
the Mermaid diagram syntax, not MultiMarkdown or MikuMikuDance.

## Playground

Preview this plugin's formatting in the browser. The **Formatted** tab updates
as you edit, with **Indent** and **Use tabs** controls. Use **Apply to source**
to replace the input with the result.

Planned public URL:
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

For usage, see the [Playground guide](../playground/README.md).

## Installation

The package is not published to npm yet. Once it is, install it next to
Prettier 3. It needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

```sh
npm install --save-dev prettier prettier-plugin-mmd
```

Then add it to your Prettier configuration. Prettier 3 does not find plugins by
itself, so this entry is required:

```json
{
  "plugins": ["prettier-plugin-mmd"]
}
```

Prettier then formats Mermaid files and Markdown files as usual, for example:

```sh
npx prettier --write "**/*.{mmd,mermaid,md}"
```

## Example

Input
([statements-one-per-line/separated-by-semicolons-input.mmd](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

Output
([statements-one-per-line/separated-by-semicolons-output.mmd](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
  C --> D
  subgraph S
    E
    F
  end
```

## What is formatted

- Files ending in `.mmd` or `.mermaid`.
- Markdown code blocks whose info string has `mermaid` or `mmd` as its first
  word. The match is case-sensitive: `Mermaid` and `mermaidx` are not formatted.
- Flowcharts: diagrams that start with `flowchart`, `graph`, `flowchart-elk`, or
  `swimlane-beta`. The formatting rules, with examples, are in
  [docs/flowchart.md](./docs/flowchart.md).
- Agentflow: diagrams that start with `agentflow-beta`. The formatting rules,
  with examples, are in [docs/agentflow.md](./docs/agentflow.md).
- Sequence diagrams: diagrams that start with `sequenceDiagram`. The formatting
  rules, with examples, are in [docs/sequence.md](./docs/sequence.md).
- Class diagrams: diagrams that start with `classDiagram` or `classDiagram-v2`.
  The formatting rules, with examples, are in [docs/class.md](./docs/class.md).
- State diagrams: diagrams that start with `stateDiagram` or `stateDiagram-v2`.
  The formatting rules, with examples, are in [docs/state.md](./docs/state.md).
- ER diagrams: diagrams that start with `erDiagram`. The formatting rules, with
  examples, are in [docs/er.md](./docs/er.md).
- Gantt charts: diagrams that start with `gantt`. The formatting rules, with
  examples, are in [docs/gantt.md](./docs/gantt.md).
- User journeys: diagrams that start with `journey`. The formatting rules, with
  examples, are in [docs/journey.md](./docs/journey.md).
- Requirement diagrams: diagrams that start with `requirementDiagram`. The
  formatting rules, with examples, are in
  [docs/requirement.md](./docs/requirement.md).
- Mindmaps: diagrams that start with `mindmap`. The formatting rules, with
  examples, are in [docs/mindmap.md](./docs/mindmap.md).
- Timelines: diagrams that start with `timeline`. The formatting rules, with
  examples, are in [docs/timeline.md](./docs/timeline.md).
- Sankey diagrams: diagrams that start with `sankey` or `sankey-beta`. The
  formatting rules, with examples, are in [docs/sankey.md](./docs/sankey.md).
- XY charts: diagrams that start with `xychart` or `xychart-beta`. The
  formatting rules, with examples, are in [docs/xychart.md](./docs/xychart.md).
- Quadrant charts: diagrams that start with `quadrantChart`. The formatting
  rules, with examples, are in [docs/quadrant.md](./docs/quadrant.md).
- Kanban boards: diagrams that start with `kanban`. The formatting rules, with
  examples, are in [docs/kanban.md](./docs/kanban.md).
- C4 diagrams: `C4Context`, `C4Container`, `C4Component`, `C4Dynamic`, and
  `C4Deployment`. The formatting rules, with examples, are in
  [docs/c4.md](./docs/c4.md).
- Venn diagrams: diagrams that start with `venn-beta`. The formatting rules,
  with examples, are in [docs/venn.md](./docs/venn.md).
- Ishikawa diagrams: `ishikawa` and `ishikawa-beta`, including accepted case
  variants. The formatting rules are in [docs/ishikawa.md](./docs/ishikawa.md).
- Usecase diagrams: diagrams that start with `usecase-beta`. The formatting
  rules are in [docs/usecase.md](./docs/usecase.md).
- Pie charts: diagrams that start with `pie`, including `showData`. The
  formatting rules are in [docs/pie.md](./docs/pie.md).
- Info diagrams: diagrams that start with `info`, including `showInfo`. The
  formatting rules are in [docs/info.md](./docs/info.md).
- Git graphs: diagrams that start with `gitGraph`. The formatting rules are in
  [docs/gitgraph.md](./docs/gitgraph.md).
- Architecture diagrams: `architecture-beta`. The formatting rules are in
  [docs/architecture.md](./docs/architecture.md).
- Packet diagrams: `packet` and `packet-beta`. The formatting rules are in
  [docs/packet.md](./docs/packet.md).
- Block diagrams: diagrams that start with `block-beta` or `block`. The
  formatting rules, with examples, are in [docs/block.md](./docs/block.md).
- The YAML frontmatter of these diagrams, with Prettier's YAML formatter.

Other diagram types are not formatted yet (see below).

## Options

- `useTabs` and `tabWidth` set the indentation. The default is two spaces.
- `endOfLine` sets the line endings.
- `printWidth` has no effect: lines are never wrapped.

## When a diagram is not formatted

- Text that mermaid.js rejects is not changed. In a file, Prettier reports a
  syntax error and leaves the file as it is. In Markdown, the code block is left
  to Prettier, which prints it as code it does not format.
- A few inputs that mermaid.js accepts are reported as syntax errors too. For
  example, a directive inside a keyword, as in `sub%%{init: {}}%%graph S`, and a
  `click` that does not start a click statement, as in
  `subgraph Handle click events`: in flowchart, `click` is a reserved word. An
  empty string between tokens, as in `A-->|x""|B`, is reported too. The full
  list is in [docs/compatibility.md](./docs/compatibility.md).
- A diagram type other than flowchart, agentflow, sequence, class, state, ER,
  Gantt, user journey, requirement, mindmap, timeline, sankey, XY chart,
  quadrant chart, kanban, C4, Venn, Ishikawa, usecase, pie, gitgraph, info,
  packet, architecture, and block diagram is not changed, except that line
  endings follow `endOfLine`. In Markdown, it is left to Prettier.

## Guarantees and limitations

- Formatting does not change the diagram: mermaid.js reads the same diagram
  before and after.
- One exception: whitespace at the end of a `style`, `classDef`, or `linkStyle`
  line is removed. mermaid.js keeps it at the end of the last style.
- Formatting a formatted diagram again changes nothing.
- The content of directives, of opaque `@{ ... }` data blocks, and of the
  frontmatter is not checked. A diagram that mermaid.js rejects because of that
  content is still formatted. Directives and data blocks are kept as written;
  the frontmatter is formatted only when Prettier can read it as YAML. Native
  usecase metadata properties are parsed and validated as syntax.
- A flowchart with more edges than mermaid.js allows, 500 by default (its
  `maxEdges` site setting), is rejected by mermaid.js but still formatted: the
  plugin does not know the site settings.
- A byte order mark before the frontmatter is not handled as mermaid.js handles
  it. A diagram that mermaid.js accepts may be reported as a syntax error, and
  one that it rejects may be formatted.
- In Markdown, Prettier removes whitespace at the end of the last line of every
  code block. Where mermaid.js reads that whitespace, as in
  `style A fill:#f00, `, the diagram changes.

The reasons and the details are in
[docs/compatibility.md](./docs/compatibility.md).

## Documentation

- [docs/flowchart.md](./docs/flowchart.md): the formatting rules for flowcharts.
- [docs/agentflow.md](./docs/agentflow.md): the formatting rules for Agentflow.
- [docs/sequence.md](./docs/sequence.md): the formatting rules for sequence
  diagrams.
- [docs/class.md](./docs/class.md): the formatting rules for class diagrams.
- [docs/state.md](./docs/state.md): the formatting rules for state diagrams.
- [docs/er.md](./docs/er.md): the formatting rules for ER diagrams.
- [docs/gantt.md](./docs/gantt.md): the formatting rules for Gantt charts.
- [docs/journey.md](./docs/journey.md): the formatting rules for user journeys.
- [docs/requirement.md](./docs/requirement.md): the formatting rules for
  requirement diagrams.
- [docs/mindmap.md](./docs/mindmap.md): the formatting rules for mindmaps.
- [docs/timeline.md](./docs/timeline.md): the formatting rules for timelines.
- [docs/sankey.md](./docs/sankey.md): the formatting rules for sankey diagrams.
- [docs/xychart.md](./docs/xychart.md): the formatting rules for XY charts.
- [docs/quadrant.md](./docs/quadrant.md): the formatting rules for quadrant
  charts.
- [docs/kanban.md](./docs/kanban.md): the formatting rules for kanban boards.
- [docs/c4.md](./docs/c4.md): the formatting rules for C4 diagrams.
- [docs/venn.md](./docs/venn.md): the formatting rules for Venn diagrams.
- [docs/ishikawa.md](./docs/ishikawa.md): the formatting rules for Ishikawa
  diagrams.
- [docs/usecase.md](./docs/usecase.md): the formatting rules for usecase
  diagrams.
- [docs/info.md](./docs/info.md): the formatting rules for info diagrams.
- [docs/gitgraph.md](./docs/gitgraph.md): the formatting rules for git graphs.
- [docs/pie.md](./docs/pie.md): the formatting rules for pie charts.
- [docs/architecture.md](./docs/architecture.md): the formatting rules for
  architecture diagrams.
- [docs/packet.md](./docs/packet.md): the formatting rules for packet diagrams.
- [docs/block.md](./docs/block.md): the formatting rules for block diagrams.
- [docs/compatibility.md](./docs/compatibility.md): where the plugin differs
  from mermaid.js, and why.
- [docs/development.md](./docs/development.md): the tests and the fixtures, for
  people who work on the plugin.

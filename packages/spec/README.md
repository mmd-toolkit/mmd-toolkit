# @mmd-toolkit/spec

Japanese version: [README.ja.md](./README.ja.md)

A specification of the Mermaid diagram syntax (`.mmd`), as mermaid.js reads it.
For a diagram text, it says whether mermaid.js accepts it, the syntax tree of an
accepted text, and the values that mermaid.js records for it. It is written for
people who implement a parser or write tools for Mermaid text.

This is a third-party project, not affiliated with mermaid-js. The package is
not published to npm; the specification is the set of documents under
[`docs/`](./docs).

## mermaid.js version

The specification follows mermaid 12.2.0, at the commit
[`1fb7869`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b).
Where the specification and that version disagree, mermaid.js is right and the
specification has a bug, except for the deliberate differences listed under
[Known divergences](./docs/known-divergences.md).

## Where to start

1. [`docs/index.md`](./docs/index.md): scope, what a conforming implementation
   does, terminology, and how the other documents are organized.
2. [`docs/common.md`](./docs/common.md): what every diagram type shares, such as
   frontmatter, directives, comments, and line terminators.
3. [`docs/detection.md`](./docs/detection.md): how the diagram type is chosen,
   for every diagram type of mermaid.js.
4. [`docs/ast.md`](./docs/ast.md): the syntax tree shared by all diagram types,
   which loses nothing of the input.
5. [`docs/known-divergences.md`](./docs/known-divergences.md): the inputs for
   which the specification deliberately differs from mermaid.js.
6. The two documents of a diagram type, listed below.

## Diagram types

| Diagram type  | How the text is read                                                 | Nodes of the tree                                          |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| flowchart     | [`docs/diagrams/flowchart.md`](./docs/diagrams/flowchart.md)         | [`docs/ast/flowchart.md`](./docs/ast/flowchart.md)         |
| sequence      | [`docs/diagrams/sequence.md`](./docs/diagrams/sequence.md)           | [`docs/ast/sequence.md`](./docs/ast/sequence.md)           |
| class         | [`docs/diagrams/class.md`](./docs/diagrams/class.md)                 | [`docs/ast/class.md`](./docs/ast/class.md)                 |
| state         | [`docs/diagrams/state.md`](./docs/diagrams/state.md)                 | [`docs/ast/state.md`](./docs/ast/state.md)                 |
| er            | [`docs/diagrams/er.md`](./docs/diagrams/er.md)                       | [`docs/ast/er.md`](./docs/ast/er.md)                       |
| journey       | [`docs/diagrams/journey.md`](./docs/diagrams/journey.md)             | [`docs/ast/journey.md`](./docs/ast/journey.md)             |
| gantt         | [`docs/diagrams/gantt.md`](./docs/diagrams/gantt.md)                 | [`docs/ast/gantt.md`](./docs/ast/gantt.md)                 |
| pie           | [`docs/diagrams/pie.md`](./docs/diagrams/pie.md)                     | [`docs/ast/pie.md`](./docs/ast/pie.md)                     |
| quadrant      | [`docs/diagrams/quadrant.md`](./docs/diagrams/quadrant.md)           | [`docs/ast/quadrant.md`](./docs/ast/quadrant.md)           |
| requirement   | [`docs/diagrams/requirement.md`](./docs/diagrams/requirement.md)     | [`docs/ast/requirement.md`](./docs/ast/requirement.md)     |
| usecase       | [`docs/diagrams/usecase.md`](./docs/diagrams/usecase.md)             | [`docs/ast/usecase.md`](./docs/ast/usecase.md)             |
| gitgraph      | [`docs/diagrams/gitgraph.md`](./docs/diagrams/gitgraph.md)           | [`docs/ast/gitgraph.md`](./docs/ast/gitgraph.md)           |
| c4            | [`docs/diagrams/c4.md`](./docs/diagrams/c4.md)                       | [`docs/ast/c4.md`](./docs/ast/c4.md)                       |
| mindmap       | [`docs/diagrams/mindmap.md`](./docs/diagrams/mindmap.md)             | [`docs/ast/mindmap.md`](./docs/ast/mindmap.md)             |
| timeline      | [`docs/diagrams/timeline.md`](./docs/diagrams/timeline.md)           | [`docs/ast/timeline.md`](./docs/ast/timeline.md)           |
| sankey        | [`docs/diagrams/sankey.md`](./docs/diagrams/sankey.md)               | [`docs/ast/sankey.md`](./docs/ast/sankey.md)               |
| xychart       | [`docs/diagrams/xychart.md`](./docs/diagrams/xychart.md)             | [`docs/ast/xychart.md`](./docs/ast/xychart.md)             |
| block         | [`docs/diagrams/block.md`](./docs/diagrams/block.md)                 | [`docs/ast/block.md`](./docs/ast/block.md)                 |
| packet        | [`docs/diagrams/packet.md`](./docs/diagrams/packet.md)               | [`docs/ast/packet.md`](./docs/ast/packet.md)               |
| kanban        | [`docs/diagrams/kanban.md`](./docs/diagrams/kanban.md)               | [`docs/ast/kanban.md`](./docs/ast/kanban.md)               |
| architecture  | [`docs/diagrams/architecture.md`](./docs/diagrams/architecture.md)   | [`docs/ast/architecture.md`](./docs/ast/architecture.md)   |
| radar         | [`docs/diagrams/radar.md`](./docs/diagrams/radar.md)                 | [`docs/ast/radar.md`](./docs/ast/radar.md)                 |
| eventmodeling | [`docs/diagrams/eventmodeling.md`](./docs/diagrams/eventmodeling.md) | [`docs/ast/eventmodeling.md`](./docs/ast/eventmodeling.md) |
| treemap       | [`docs/diagrams/treemap.md`](./docs/diagrams/treemap.md)             | [`docs/ast/treemap.md`](./docs/ast/treemap.md)             |
| venn          | [`docs/diagrams/venn.md`](./docs/diagrams/venn.md)                   | [`docs/ast/venn.md`](./docs/ast/venn.md)                   |
| ishikawa      | [`docs/diagrams/ishikawa.md`](./docs/diagrams/ishikawa.md)           | [`docs/ast/ishikawa.md`](./docs/ast/ishikawa.md)           |
| wardley       | [`docs/diagrams/wardley.md`](./docs/diagrams/wardley.md)             | [`docs/ast/wardley.md`](./docs/ast/wardley.md)             |
| cynefin       | [`docs/diagrams/cynefin.md`](./docs/diagrams/cynefin.md)             | [`docs/ast/cynefin.md`](./docs/ast/cynefin.md)             |
| treeview      | [`docs/diagrams/treeview.md`](./docs/diagrams/treeview.md)           | [`docs/ast/treeview.md`](./docs/ast/treeview.md)           |
| agentflow     | [`docs/diagrams/agentflow.md`](./docs/diagrams/agentflow.md)         | [`docs/ast/agentflow.md`](./docs/ast/agentflow.md)         |
| info          | [`docs/diagrams/info.md`](./docs/diagrams/info.md)                   | [`docs/ast/info.md`](./docs/ast/info.md)                   |
| railroad      | [`docs/diagrams/railroad.md`](./docs/diagrams/railroad.md)           | [`docs/ast/railroad.md`](./docs/ast/railroad.md)           |

## Examples

Each statement of the specification cites examples as
`[fixture: <category>/<name>]`. They are in
[`packages/tests/fixtures`](../tests/fixtures): each has an input and what
mermaid.js does with it.

How the specification was derived from mermaid.js is described in
[`docs/index.md`](./docs/index.md#sources).

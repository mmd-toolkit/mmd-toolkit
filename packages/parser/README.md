# @mmd-toolkit/parser

Japanese version: [README.ja.md](./README.ja.md)

A parser for the [Mermaid](https://mermaid.js.org/) diagram syntax (`.mmd`). It
turns a diagram's text into a tree that keeps every character of the input, with
the position of every part.

It is a third-party project, not affiliated with
[mermaid-js](https://mermaid.js.org/).

Documentation: [Parser](https://mmd-toolkit.github.io/mmd-toolkit/parser/).

## Playground

Inspect the AST, tokens, comments, directives, and frontmatter returned by this
parser in the browser. Selecting a tree entry highlights its source range, and
moving the source cursor selects the corresponding entry.

Open the [Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

For usage, see the [Playground guide](../playground/README.md).

## Installation

```sh
npm install @mmd-toolkit/parser
```

It is an ES module and needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

To use the TypeScript types, also install [`@mmd-toolkit/ast`](../ast), at the
version of the parser or a later compatible one:

```sh
npm install --save-dev @mmd-toolkit/ast
```

The parser declares it as an optional peer dependency. Without it, `parse()`
returns `any`, and with `skipLibCheck` off TypeScript reports `TS2307` in the
declaration file of the parser.

## Usage

```ts
import { parse } from "@mmd-toolkit/parser"

const root = parse("flowchart LR\nA[Start] --> B")

const diagramType = root.diagramType // "flowchart-v2"
const range = root.range // [0, 27]
const bodyType = root.body.type // "FlowchartDiagram"
const tokenCount = root.tokens.length // 8
```

`root.body` is the diagram. Here it is, with the `loc` field left out of every
object:

```json
{
  "type": "FlowchartDiagram",
  "direction": "LR",
  "body": [
    {
      "type": "FlowchartVertexStatement",
      "first": {
        "type": "FlowchartVertexGroup",
        "vertices": [
          {
            "type": "FlowchartVertex",
            "id": { "type": "Identifier", "name": "A", "range": [13, 14] },
            "shape": {
              "type": "FlowchartShape",
              "name": "rectangle",
              "property": null,
              "label": {
                "type": "FlowchartLabel",
                "kind": "text",
                "value": "Start",
                "range": [15, 20]
              },
              "range": [14, 21]
            },
            "cssClass": null,
            "data": [],
            "range": [13, 21]
          }
        ],
        "range": [13, 21]
      },
      "links": [
        {
          "type": "FlowchartLink",
          "id": null,
          "opening": null,
          "arrow": {
            "type": "FlowchartArrow",
            "value": "-->",
            "startMarker": "none",
            "line": "solid",
            "length": 2,
            "endMarker": "arrow",
            "range": [22, 25]
          },
          "label": null,
          "target": {
            "type": "FlowchartVertexGroup",
            "vertices": [
              {
                "type": "FlowchartVertex",
                "id": { "type": "Identifier", "name": "B", "range": [26, 27] },
                "shape": null,
                "cssClass": null,
                "data": [],
                "range": [26, 27]
              }
            ],
            "range": [26, 27]
          },
          "range": [22, 27]
        }
      ],
      "range": [13, 27]
    }
  ],
  "range": [0, 27]
}
```

The eight tokens are `flowchart`, `LR`, `A`, `[`, `Start`, `]`, `-->`, and `B`.

## Supported diagrams

| Diagram                                  | Type ids (headers)                                                                                                                              | Nodes                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Flowcharts                               | `flowchart-v2` (`flowchart`, `graph`), `flowchart-elk` (`flowchart-elk`), `swimlane` (`swimlane-beta`)                                          | [`ast/flowchart.md`](../spec/docs/ast/flowchart.md)         |
| Sequence diagrams                        | `sequence` (`sequenceDiagram`)                                                                                                                  | [`ast/sequence.md`](../spec/docs/ast/sequence.md)           |
| Class diagrams                           | `classDiagram` (`classDiagram`, `classDiagram-v2`)                                                                                              | [`ast/class.md`](../spec/docs/ast/class.md)                 |
| State diagrams                           | `stateDiagram` (`stateDiagram`, `stateDiagram-v2`)                                                                                              | [`ast/state.md`](../spec/docs/ast/state.md)                 |
| Entity relationship diagrams             | `er` (`erDiagram`)                                                                                                                              | [`ast/er.md`](../spec/docs/ast/er.md)                       |
| Gantt charts                             | `gantt` (`gantt`)                                                                                                                               | [`ast/gantt.md`](../spec/docs/ast/gantt.md)                 |
| User journey diagrams                    | `journey` (`journey`)                                                                                                                           | [`ast/journey.md`](../spec/docs/ast/journey.md)             |
| Requirement diagrams                     | `requirement` (`requirementDiagram`)                                                                                                            | [`ast/requirement.md`](../spec/docs/ast/requirement.md)     |
| Mindmaps                                 | `mindmap` (`mindmap`)                                                                                                                           | [`ast/mindmap.md`](../spec/docs/ast/mindmap.md)             |
| Timelines                                | `timeline` (`timeline`)                                                                                                                         | [`ast/timeline.md`](../spec/docs/ast/timeline.md)           |
| Sankey diagrams                          | `sankey` (`sankey`, `sankey-beta`)                                                                                                              | [`ast/sankey.md`](../spec/docs/ast/sankey.md)               |
| XY charts                                | `xychart` (`xychart`, `xychart-beta`)                                                                                                           | [`ast/xychart.md`](../spec/docs/ast/xychart.md)             |
| Quadrant charts                          | `quadrantChart` (`quadrantChart`)                                                                                                               | [`ast/quadrant.md`](../spec/docs/ast/quadrant.md)           |
| Block diagrams                           | `block` (`block-beta`, `block`)                                                                                                                 | [`ast/block.md`](../spec/docs/ast/block.md)                 |
| Kanban diagrams                          | `kanban` (`kanban`)                                                                                                                             | [`ast/kanban.md`](../spec/docs/ast/kanban.md)               |
| C4 diagrams                              | `c4` (`C4Context`, `C4Container`, `C4Component`, `C4Dynamic`, `C4Deployment`)                                                                   | [`ast/c4.md`](../spec/docs/ast/c4.md)                       |
| Venn diagrams                            | `venn` (`venn-beta`)                                                                                                                            | [`ast/venn.md`](../spec/docs/ast/venn.md)                   |
| Ishikawa diagrams                        | `ishikawa` (`ishikawa`, `ishikawa-beta`)                                                                                                        | [`ast/ishikawa.md`](../spec/docs/ast/ishikawa.md)           |
| Agentflow diagrams                       | `agentflow` (`agentflow-beta`)                                                                                                                  | [`ast/agentflow.md`](../spec/docs/ast/agentflow.md)         |
| Usecase diagrams                         | `usecase` (`usecase-beta`)                                                                                                                      | [`ast/usecase.md`](../spec/docs/ast/usecase.md)             |
| Pie charts                               | `pie` (`pie`)                                                                                                                                   | [`ast/pie.md`](../spec/docs/ast/pie.md)                     |
| Gitgraph diagrams                        | `gitGraph` (`gitGraph`)                                                                                                                         | [`ast/gitgraph.md`](../spec/docs/ast/gitgraph.md)           |
| Info diagrams                            | `info` (`info`)                                                                                                                                 | [`ast/info.md`](../spec/docs/ast/info.md)                   |
| Packet diagrams                          | `packet` (`packet`, `packet-beta`)                                                                                                              | [`ast/packet.md`](../spec/docs/ast/packet.md)               |
| Architecture diagrams                    | `architecture` (`architecture-beta`)                                                                                                            | [`ast/architecture.md`](../spec/docs/ast/architecture.md)   |
| Radar charts                             | `radar` (`radar-beta`)                                                                                                                          | [`ast/radar.md`](../spec/docs/ast/radar.md)                 |
| Treemaps                                 | `treemap` (`treemap`, `treemap-beta`)                                                                                                           | [`ast/treemap.md`](../spec/docs/ast/treemap.md)             |
| Railroad diagrams                        | `railroad` (`railroad-beta`), `railroadEbnf` (`railroad-ebnf-beta`), `railroadAbnf` (`railroad-abnf-beta`), `railroadPeg` (`railroad-peg-beta`) | [`ast/railroad.md`](../spec/docs/ast/railroad.md)           |
| Wardley maps                             | `wardley` (`wardley-beta`)                                                                                                                      | [`ast/wardley.md`](../spec/docs/ast/wardley.md)             |
| Cynefin diagrams                         | `cynefin` (`cynefin-beta`)                                                                                                                      | [`ast/cynefin.md`](../spec/docs/ast/cynefin.md)             |
| Event modeling diagrams                  | `eventmodeling` (`eventmodeling`)                                                                                                               | [`ast/eventmodeling.md`](../spec/docs/ast/eventmodeling.md) |
| Tree views                               | `treeView` (`treeView-beta`)                                                                                                                    | [`ast/treeview.md`](../spec/docs/ast/treeview.md)           |
| The `error` pseudo-diagram of mermaid.js | `error` (`error`)                                                                                                                               | [`ErrorDiagram`](../spec/docs/ast.md#errordiagram)          |

These are all the diagram types of mermaid.js 12.3.0.

## API

The [Parser API](https://mmd-toolkit.github.io/mmd-toolkit/parser/api.html) page
has the full reference.

### `parse(text)`

Returns the `Root` of the tree:

- `diagramType`: the diagram type id that mermaid.js reports, such as
  `flowchart-v2`.
- `body`: the diagram, such as a `FlowchartDiagram`.
- `tokens`: every token, in source order. A token has a `type`, such as
  `Keyword` or `RawText`, and a `value`, the source text of its range. Every
  character that is not whitespace or a line terminator is in a token or a
  comment.
- `comments`: every comment. Its `mark` is the characters of its mark, such as
  `%%`, and its `value` is the text after the mark. The rest of a comment that a
  comment line cuts has the `mark` `null`.
- `directives`: every `%%{ ... }%%` directive, with its `name`, its `value` (the
  text inside), and whether it is `closed`.
- `frontmatter`: the frontmatter, or `null`. Its `value` is the YAML text as
  written; it is not parsed.
- `range` and `loc`: the whole input.

Tokens, comments, directives, and the frontmatter are not nodes. You read them
from these lists. Their fields and the token kinds:
[Tokens](./docs/tokens.md#tokens) and
[Comments, directives, and frontmatter](../spec/docs/ast.md#directives-and-frontmatter).

### Positions

Every node, token, comment, directive, and the frontmatter has a `range` and a
`loc`, as in ESTree:

- `range` is `[start, end]` in UTF-16 code units; `end` is not included.
- `loc` is `{ start, end }`, each with a `line` counted from 1 and a `column`
  counted from 0.

### Errors

- `ParseError` is thrown when the input is rejected. It is a `SyntaxError` with
  `index`, `range`, and `loc`. How the position is chosen:
  [`docs/error-positions.md`](./docs/error-positions.md).

`ParseError` sets `name`, so you can tell it apart without `instanceof`.

```ts
import { parse, ParseError } from "@mmd-toolkit/parser"

try {
  parse(text)
} catch (error) {
  if (error instanceof ParseError) {
    const { line, column } = error.loc.start
    // Report error.message at line and column.
  } else {
    throw error
  }
}
```

### Types

[`@mmd-toolkit/ast`](../ast) (see [Installation](#installation)) exports a
TypeScript type for every node, such as `Root`, `FlowchartVertex`, and
`Identifier`, and `DiagramType`, the union of the diagram type ids; the parser
exports only its own types, such as `Visitor`. The names and fields are those of
the specification's [`ast.md`](../spec/docs/ast.md) and of the node document of
each diagram, linked from [Supported diagrams](#supported-diagrams).

## Walking the tree

```ts
import { parse, traverseNodes, visitorKeys } from "@mmd-toolkit/parser"

traverseNodes(parse(text), {
  enterNode(node, parent) {
    // Before the child nodes of `node`. `parent` is null for the first node.
  },
  leaveNode(node, parent) {
    // After the child nodes of `node`.
  },
})

const childFieldsOfRoot = visitorKeys.Root // ["body"]
```

- `traverseNodes(node, visitor)` visits `node` and every node below it.
- `visitorKeys` lists the child fields of each node type, in the order of the
  walk.
- The walk does not visit tokens, comments, directives, or the frontmatter.
- A list of child nodes can hold `null`, such as the empty part of
  `classDef a,,b`. The walk skips it.

## What the tree keeps

- Nothing of the input is lost. With the text and the ranges, you can rebuild
  the input byte for byte.
- A name or a value that the author wrote, such as an id, a label, or a style,
  is a node with its own range.
- The value of such a node is what the author wrote in its range, without:
  - the directives and comments inside it;
  - a `;` that mermaid.js ignores in a `style` or `classDef` line.
- Nothing else is converted: entities, attribute quotes, and line terminators
  stay as written. A string's value leaves out its quotes. The exact rule:
  [`ast.md`, Nodes](../spec/docs/ast.md#nodes).
- A quoted string (`StringLiteral`) and a number (`NumericLiteral`) also have
  `raw`: the source text of the node, as written, quotes and comments included.
  `click A href "u"` has a URL with the `value` `u` and the `raw` `"u"`.
- The `value` of a token is the source text of its range.

## Differences from mermaid.js

`parse()` accepts and rejects what mermaid.js 12.3.0 accepts and rejects, and
reads an accepted text as the same diagram. The exceptions are the
[known divergences](../spec/docs/known-divergences.md) of the specification. The
document of each one shows the inputs that differ and how to write them so that
both read them the same. For example:

- A directive inside a keyword, as in `sub%%{init: {}}%%graph S`, makes
  `parse()` throw, while mermaid.js reads the text around it as joined.
- In a flowchart, `click` is a reserved word: `parse()` accepts it only at the
  start of a click statement, and throws for it anywhere else, as in
  `subgraph click me`, which mermaid.js accepts and often draws as something
  other than what was written.
- The contents of the frontmatter, of directives, and of `@{ ... }` data blocks
  are not checked, so input that mermaid.js rejects because that content is
  malformed, has the wrong shape, or names something unknown, such as a shape,
  is accepted.

`parse()` does not know the site configuration of mermaid.js, so a flowchart
with more edges than `maxEdges` (500 by default) is accepted too.

A rejection for one of these differences is a `ParseError` like any other.

## Documentation

- [Parser guide](https://mmd-toolkit.github.io/mmd-toolkit/parser/),
  [API](https://mmd-toolkit.github.io/mmd-toolkit/parser/api.html), and
  [Traversing the AST](https://mmd-toolkit.github.io/mmd-toolkit/parser/traversal.html):
  how to use the parser.
- [Compatibility](https://mmd-toolkit.github.io/mmd-toolkit/reference/): what is
  guaranteed, and the differences from mermaid.js.
- The specification: [`ast.md`](../spec/docs/ast.md) (the tree), the node
  document of each diagram (linked from
  [Supported diagrams](#supported-diagrams)), and
  [`common.md`](../spec/docs/common.md) (the rules shared by every diagram).
- [`docs/tokens.md`](./docs/tokens.md): the tokens and the lists of the root,
  and [`docs/positions.md`](./docs/positions.md): positions, the ranges of
  nodes, and the invariants of the tree.
- [`docs/error-positions.md`](./docs/error-positions.md): where a `ParseError`
  points.
- For people who work on the parser:
  [`docs/development.md`](./docs/development.md) and
  [`docs/testing.md`](./docs/testing.md).

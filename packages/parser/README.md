# @mmd-toolkit/parser

Japanese version: [README.ja.md](./README.ja.md)

A parser for the Mermaid diagram syntax (`.mmd`). It turns a diagram's text into
a tree that keeps every character of the input, with the position of every part.

It is a third-party project, not affiliated with mermaid-js.

## Playground

Inspect the AST, tokens, comments, directives, and frontmatter returned by this
parser in the browser. Selecting a tree entry highlights its source range, and
moving the source cursor selects the corresponding entry.

Public URL: [Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

For usage, see the [Playground guide](../playground/README.md).

## Installation

```sh
npm install @mmd-toolkit/parser
```

It is an ES module and needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

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

These are all the diagram types of mermaid.js 12.2.0.

## API

### `parse(text)`

Returns the `Root` of the tree:

- `diagramType`: the diagram type id that mermaid.js reports, such as
  `flowchart-v2`.
- `body`: the diagram, such as a `FlowchartDiagram`.
- `tokens`: every token, in source order: the tokens of the diagram, a
  `Directive` token for each directive outside the other tokens and the
  comments, and first, when there is frontmatter, the tokens of the frontmatter:
  its opening `---` and its closing `---`, `Punctuator` tokens, and between them
  its body, a `RawText` token, unless the body is all whitespace. A token has a
  `type`, such as `Keyword` or `RawText`, and a `value`, the source text of its
  range. Every character that is not whitespace or a line terminator is in a
  token or a comment. A comment lies inside no token: a token that runs across a
  comment line, such as a quoted label over several lines, is cut there into
  pieces, and so is a text or a quoted string with a directive or a `;` that the
  line rule ignores inside it (see [Tokens](./docs/tokens.md#tokens)); the
  pieces of a quoted string are `StringFragment` tokens.
- `comments`: every comment: each `%%` comment line, each line of `%%` alone, or
  `%%{ }%%`, before the header, and each comment that a diagram's own lexer
  reads, such as `#` or `%` in the middle of a line in a sequence diagram, `%%`
  after a statement in a class diagram, or `#` and `%%` in a state diagram. Its
  `mark` is the characters of its mark: `%%` for a comment line or a class
  comment, `#`, `%%`, or `%` for a sequence comment, and `#` or `%%` for a state
  comment. Its `value` is the text after the mark. A comment line after U+2028
  or U+2029 cuts the comment of the diagram's lexer that runs past it, as it
  cuts a token: the part after the comment line is a comment of its own, whose
  `mark` is `null` and whose `value` is its text. In a state diagram, `A %% x`,
  U+2029, a line `%% end`, and a line `B` have the comments `%% x`, `%% end`,
  and `B`, and the only state A.
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

The package exports a TypeScript type for every node, such as `Root`,
`FlowchartVertex`, and `Identifier`, and `DiagramType`, the union of the diagram
type ids. The names and fields are those of the specification's
[`ast.md`](../spec/docs/ast.md) and of the node document of each diagram, linked
from [Supported diagrams](#supported-diagrams).

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

`parse()` accepts and rejects what mermaid.js 12.2.0 accepts and rejects, with
these differences:

- A directive inside a name without whitespace, a keyword, an arrow, a number,
  or punctuation makes `parse()` throw, while mermaid.js reads the text around
  it as joined
  ([`directive-as-token-boundary`](../spec/docs/known-divergences/directive-as-token-boundary.md)).
- So does a `;` that the line rule of `style` and `classDef` lines ignores
  inside such a token, while mermaid.js removes the `;` and reads the text
  around it as joined
  ([`ignored-semicolon-as-token-boundary`](../spec/docs/known-divergences/ignored-semicolon-as-token-boundary.md)).
- The contents of the frontmatter, of directives, and of `@{ ... }` data blocks
  are not checked, so input that mermaid.js rejects because that content is
  malformed, has the wrong shape, or names something unknown, such as a shape,
  is accepted
  ([`embedded-data-opaque`](../spec/docs/known-divergences/embedded-data-opaque.md)).
- An HTML tag that starts in the frontmatter does not change how the diagram's
  text is read
  ([`html-tag-in-frontmatter`](../spec/docs/known-divergences/html-tag-in-frontmatter.md)).
- In a flowchart, `click` is a reserved word: `parse()` accepts it only at the
  start of a click statement, and throws for it anywhere else, as in
  `subgraph click me` or `click A href "u" click "tip"`, which mermaid.js
  accepts and often draws as something other than what was written
  ([`click-reserved-word`](../spec/docs/known-divergences/click-reserved-word.md)).
- In a flowchart, an empty string (`""`) and an empty call (`call ()`) cannot be
  written anywhere, and an empty description block (`accDescr {}`) only where a
  statement starts: elsewhere `parse()` throws, as in `A[""x]` or
  `A call ()-->B`, while mermaid.js accepts such input as if they were not there
  ([`tokenless-empty-forms`](../spec/docs/known-divergences/tokenless-empty-forms.md)).
  In a sequence diagram, the same holds for the empty description block, as in
  `A->>accDescr {}B: x`. In a class diagram, it holds for the empty string, the
  empty call, and the empty description block, and also for an empty backquoted
  name (` `` `) and an empty generic type (`~~`) that does not end a class name,
  as in `class A~~B`; an empty string as a cardinality or a tooltip, and `~~` at
  the end of a class name, are accepted. In a state diagram, it holds for the
  empty description block, as in `A accDescr {} --> B`. In an ER diagram, it
  holds for the empty description block, as in `A accDescr {} ||--o{ B : x`, and
  for empty backquotes inside an attribute, between its type and its name or
  before its keys or its comment; between two attributes they are accepted. In a
  Gantt chart, it holds for the empty href (`href ""`) and the empty call
  wherever they stand, as in a line `href ""` or `click id1 href "" call f()`,
  and for the empty description block inside a click statement, between its ids
  and its first part or between its two parts; where a statement starts, an
  empty description block is accepted as a statement of its own. In a
  requirement diagram, it holds for the empty string wherever it stands, as in a
  line `""` or `id: "" 1`, and for the empty description block inside a
  statement, as in `a - accDescr {} satisfies -> b`; where a statement starts,
  an empty description block is a statement, and on a line of the body of a
  requirement or an element, an item of the body. In a mindmap or kanban
  diagram, it holds for an empty icon (`::icon()`), an empty class line (`:::`
  with nothing after it on its line), and an empty string or empty markdown
  string in a shape, wherever they stand, as in `a[""x]`.
- In a mindmap, kanban diagram, or Ishikawa diagram, empty lines, lines of
  whitespace, and comments change nothing wherever they stand after the header,
  while mermaid.js rejects some of them, as an empty line between the header and
  the first node, or a line `%%` alone followed by an empty line between two
  nodes
  ([`blank-line-after-header-or-comments`](../spec/docs/known-divergences/blank-line-after-header-or-comments.md)).
- In a sequence diagram, a comment starts at its `%%`, and a number may be
  followed by `%%`, while mermaid.js takes the character before the `%%` into
  the comment where a rule would start there: `autonumber 10%% c` starts at 10
  here, and mermaid.js rejects it; a line `C%% c` is rejected here, and
  mermaid.js reads it as a comment. In a Gantt chart, a `%` right after the
  first character of a unit is a character of the unit, while mermaid.js reads
  that character and the rest of the line as a comment: `a% : 1d` is a task here
  and no task in mermaid.js, and `t%itle T` is rejected here. In a journey
  diagram, the same holds for a `%%` right after the first character of a unit:
  `A%%B: 5` is a task here and no task in mermaid.js, and `A: 5;%% c` is
  rejected here; and so in a timeline: `a%% c` is a period here and nothing in
  mermaid.js, and `:%% c` is rejected here
  ([`comment-takes-character`](../spec/docs/known-divergences/comment-takes-character.md)).
- In a class diagram, a comment after a statement ends at the end of its line,
  while mermaid.js takes the line breaks after it and reads the next line as
  part of the same statement: `A --> B %% c` followed by a line `class C` is
  accepted here, and mermaid.js rejects it. In a Gantt chart, a `%` comment in a
  click statement ends at its line too, while mermaid.js takes the line feeds
  after it: `click id1 %c` followed by a line `href "u"` is rejected here, and
  mermaid.js sets the link
  ([`comment-takes-line-break`](../spec/docs/known-divergences/comment-takes-line-break.md)).
- In a Gantt chart, `%%{` that starts no directive is a comment wherever a unit
  starts, while mermaid.js rejects it where its lexer stands right at it, as
  right after a unit: `gantt%%{ }%%` followed by a line `title T` is accepted
  here
  ([`percent-brace-after-unit`](../spec/docs/known-divergences/percent-brace-after-unit.md)).
- In a class diagram, a backquoted name and a generic type may start with any
  character: ``class `note` `` declares the class `note`, which mermaid.js
  rejects, and in ``A `"1"` --> B`` mermaid.js reads the string `"1"` as a
  cardinality, while `parse()` reads a relation from the class `A"1"`
  ([`name-start-reads-unit`](../spec/docs/known-divergences/name-start-reads-unit.md)).
- A class diagram must start with its header, `classDiagram` or
  `classDiagram-v2`, followed by a line break. mermaid.js accepts a text whose
  header word runs into other word characters, as in `classDiagramX`, when the
  text then ends right after `accTitle:` and a few other forms; `parse()` throws
  for it
  ([`headerless-empty-ending`](../spec/docs/known-divergences/headerless-empty-ending.md)).
- `parse()` finds the diagram type at the start of the text only: a text whose
  header is that of another diagram type and that holds `C4Container`,
  `C4Component`, `C4Dynamic`, or `C4Deployment` after it is read as that
  diagram, while mermaid.js hands it to its C4 parser
  ([`c4-keyword-anywhere`](../spec/docs/known-divergences/c4-keyword-anywhere.md)).
- A line of `%%` alone, or `%%{ }%%`, before the header is a comment in every
  diagram type, while mermaid.js rejects such a line before the header of a
  flowchart and of an ER diagram, a line `%%{ }%%` before that of a state
  diagram, and a line of spaces after such a line before that of a class or an
  ER diagram, and every such line, with a line of spaces after it or without,
  before that of a Gantt chart, a journey diagram, a requirement diagram, a
  timeline, and a sankey diagram
  ([`bare-percent-line-before-header`](../spec/docs/known-divergences/bare-percent-line-before-header.md)).
- `parse()` does not know the site configuration, so a flowchart with more edges
  than `maxEdges` (500 by default) is accepted.
- A rejection for one of these differences is a `ParseError` like any other.

## Documentation

- The specification: [`ast.md`](../spec/docs/ast.md) (the tree), the node
  document of each diagram (linked from
  [Supported diagrams](#supported-diagrams)), and
  [`common.md`](../spec/docs/common.md) (the rules shared by every diagram).
- [`docs/tokens.md`](./docs/tokens.md): the tokens and the lists of the root,
  and [`docs/positions.md`](./docs/positions.md): positions, the ranges of
  nodes, and the invariants of the tree.
- [`docs/error-positions.md`](./docs/error-positions.md): where a `ParseError`
  points.
- [`docs/development.md`](./docs/development.md): how the parser is built.
- [`docs/testing.md`](./docs/testing.md): how it is tested.

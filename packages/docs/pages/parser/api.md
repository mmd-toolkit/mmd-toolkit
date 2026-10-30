# Parser API

Import the functions, error classes, and types below from `@mmd-toolkit/parser`.
See [Getting started](./index.md) for installation.

## `parse(text)`

The signature is `parse(text: string): Root`. Pass the source text of one
Mermaid diagram, including its diagram header. The function returns a `Root`
synchronously, or throws an [error](#errors) if it cannot parse the input.

## Return value

`Root` holds the diagram body and the source records needed to work with it:

| Field         | Type                   | Contents                                                   |
| ------------- | ---------------------- | ---------------------------------------------------------- |
| `type`        | `"Root"`               | The root node's type.                                      |
| `diagramType` | `DiagramType`          | The diagram id used by mermaid.js, such as `flowchart-v2`. |
| `body`        | `DiagramBody`          | The diagram's AST node.                                    |
| `frontmatter` | `Frontmatter \| null`  | The frontmatter record, or `null` when absent.             |
| `comments`    | `readonly Comment[]`   | All comments, in source order.                             |
| `directives`  | `readonly Directive[]` | All directives, in source order.                           |
| `tokens`      | `readonly Token[]`     | All tokens, in source order.                               |
| `range`       | `Range`                | The source range of the whole input.                       |
| `loc`         | `Location`             | The location of the whole input.                           |

`comments` and `directives` are empty arrays when none are present. Frontmatter
and directive contents are preserved as text; their YAML or JSON contents are
not parsed into objects.

The AST preserves every part of the input. Whitespace and line terminators are
not nodes; with the original source text and the ranges, you can reproduce the
input exactly.

Tokens and comments are available from `Root.tokens` and `Root.comments`. Their
fields and the token kinds are defined in the [token and comment definitions on
GitHub][tokens]. The root, nodes, tokens, comments, directives, and frontmatter
carry source positions in `range` and `loc`. See the [position definitions on
GitHub][positions] for their format.

## Types and diagram-specific fields

The package exports these types, as well as a type for each diagram node:

| Types                                                       | Purpose                                             |
| ----------------------------------------------------------- | --------------------------------------------------- |
| `Root`                                                      | The result of `parse()`.                            |
| `Node`, `NodeBase`                                          | All AST node types, and the fields common to nodes. |
| `DiagramBody`, `DiagramType`                                | Diagram body node types and diagram ids.            |
| `Token`, `TokenKind`, `Comment`, `Directive`, `Frontmatter` | Source records and token kinds.                     |
| `Range`, `Location`, `Position`                             | Source positions.                                   |
| `Visitor`, `VisitorKeys`                                    | The traversal callbacks and child-field mapping.    |

Use a node's `type` field to narrow its TypeScript type before reading
diagram-specific fields. This example reads the direction and statement count of
a flowchart:

```ts
import { parse } from "@mmd-toolkit/parser"
import type { DiagramBody, Root } from "@mmd-toolkit/parser"

const root: Root = parse("flowchart LR\n  A[Start] --> B\n")
const body: DiagramBody = root.body

if (body.type === "FlowchartDiagram") {
  console.log(body.direction) // "LR"
  console.log(body.body.length) // 1
}
```

The [AST definition on GitHub][ast] describes the individual node types and the
fields of directives and frontmatter.

## Errors

### `ParseError`

`ParseError` extends `SyntaxError`. It is thrown when the input is rejected,
including when no diagram type is recognized. Its `name` is `"ParseError"`, and
its `message` describes the failure.

| Field   | Type       | Contents                                                     |
| ------- | ---------- | ------------------------------------------------------------ |
| `index` | `number`   | The start offset of the reported range, equal to `range[0]`. |
| `range` | `Range`    | The source range reported for the error.                     |
| `loc`   | `Location` | The location corresponding to `range`.                       |

The [error position rules on GitHub][error-positions] explain how the parser
chooses the reported range for each kind of failure.

### Handling errors

Use the exported class to tell a parse error from other errors. This incomplete
flowchart reaches the `ParseError` branch:

```ts
import { parse, ParseError } from "@mmd-toolkit/parser"

try {
  parse("flowchart LR\n  A -->\n")
} catch (error) {
  if (error instanceof ParseError) {
    console.error(error.message, error.range)
  } else {
    throw error
  }
}
```

## Traversal API

`traverseNodes(node: Node, visitor: Visitor): void` visits the starting node and
its descendants. `Visitor` requires `enterNode` and `leaveNode` callbacks.

`visitorKeys`, of type `VisitorKeys`, maps each node type to its child-field
names in traversal order.

[Traversing the AST](./traversal.md) explains callback arguments, visitation
order, and examples of inspecting nodes.

[ast]:
  https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.md
[tokens]:
  https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/tokens.md
[positions]:
  https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/positions.md
[error-positions]:
  https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/parser/docs/error-positions.md

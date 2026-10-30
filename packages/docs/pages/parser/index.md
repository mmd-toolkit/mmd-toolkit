# Parser

`@mmd-toolkit/parser` parses Mermaid diagram text into an abstract syntax tree
(AST) for inspecting and processing diagrams in JavaScript or TypeScript.

You can try the parser
[online in the Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)
without installing anything.

## Installation

Install the parser in your project:

```sh
npm install @mmd-toolkit/parser
```

## Parse a diagram

Pass one diagram's source text, including its diagram header, to `parse()`:

```ts
import { parse } from "@mmd-toolkit/parser"

const root = parse("flowchart LR\n  A[Start] --> B\n")

console.log(root.diagramType) // "flowchart-v2"
```

`parse()` returns the root node of the AST (`Root`) synchronously. In this
example, `diagramType` identifies the parsed diagram as a flowchart.

## Errors

When parsing fails, `parse()` throws the exported error class `ParseError`: the
input is rejected, including when no diagram type is recognized.

## Next steps

- [API](./api.md): input, return value, exported types, and error handling.
- [Traversal](./traversal.md): visit nodes to inspect and analyze a diagram.
- [Compatibility](../reference/index.md): syntax guarantees and known
  differences from mermaid.js.
- [AST definition (GitHub)](https://github.com/mmd-toolkit/mmd-toolkit/blob/main/packages/spec/docs/ast.md):
  detailed node types and fields.

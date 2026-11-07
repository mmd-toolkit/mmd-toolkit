# @mmd-toolkit/ast

Japanese version: [README.ja.md](./README.ja.md)

The TypeScript types of the syntax tree that [`@mmd-toolkit/parser`](../parser)
returns: a type for every node, such as `Root`, `FlowchartVertex`, and
`Identifier`, and `DiagramType`, the union of the diagram type ids. The names
and fields are those of the specification's [`ast.md`](../spec/docs/ast.md).

The package holds types only and no code that runs.

It is a third-party project, not affiliated with mermaid-js.

Documentation: [Parser API](https://mmd-toolkit.github.io/mmd-toolkit/parser/api.html).

## Installation

Install it next to the parser, at the version of the parser or a later
compatible one:

```sh
npm install @mmd-toolkit/parser
npm install --save-dev @mmd-toolkit/ast
```

The parser, `prettier-plugin-mmd`, and `@mmd-toolkit/eslint-plugin` declare this
package as an optional peer dependency, so that their users download it only
when they use the types. The parser asks for `^` of its own version; the two
plugins accept any version.

## Usage

Import the types from this package; the parser does not export them:

```ts
import { parse } from "@mmd-toolkit/parser"
import type { Root } from "@mmd-toolkit/ast"

const root: Root = parse("flowchart LR\nA --> B\n")
```

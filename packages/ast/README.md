# @mmd-toolkit/ast

Japanese version: [README.ja.md](./README.ja.md)

The TypeScript types of the syntax tree that [`@mmd-toolkit/parser`](../parser)
returns: a type for every node, such as `Root`, `FlowchartVertex`, and
`Identifier`, and `DiagramType`, the union of the diagram type ids. The names
and fields are those of the specification's [`ast.md`](../spec/docs/ast.md).

The package holds types only and no code that runs.

It is a third-party project, not affiliated with mermaid-js.

## Installation

Install it next to the parser, at the same version:

```sh
npm install @mmd-toolkit/parser
npm install --save-dev @mmd-toolkit/ast
```

The parser declares this package as an optional peer dependency, so that
`prettier-plugin-mmd` and `@mmd-toolkit/eslint-plugin` do not download it.

## Usage

Import the types from the parser, which exports all of them, or from this
package:

```ts
import { parse } from "@mmd-toolkit/parser"
import type { Root } from "@mmd-toolkit/ast"

const root: Root = parse("flowchart LR\nA --> B\n")
```

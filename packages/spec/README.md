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

The specification follows mermaid 12.0.0, at the commit
[`98a0945`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b).
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

| Diagram type | How the text is read                                         | Nodes of the tree                                  |
| ------------ | ------------------------------------------------------------ | -------------------------------------------------- |
| flowchart    | [`docs/diagrams/flowchart.md`](./docs/diagrams/flowchart.md) | [`docs/ast/flowchart.md`](./docs/ast/flowchart.md) |
| sequence     | [`docs/diagrams/sequence.md`](./docs/diagrams/sequence.md)   | [`docs/ast/sequence.md`](./docs/ast/sequence.md)   |
| class        | [`docs/diagrams/class.md`](./docs/diagrams/class.md)         | [`docs/ast/class.md`](./docs/ast/class.md)         |
| state        | [`docs/diagrams/state.md`](./docs/diagrams/state.md)         | [`docs/ast/state.md`](./docs/ast/state.md)         |
| er           | [`docs/diagrams/er.md`](./docs/diagrams/er.md)               | [`docs/ast/er.md`](./docs/ast/er.md)               |

The other diagram types of mermaid.js are not specified yet.

## Examples

Each statement of the specification cites examples as
`[fixture: <category>/<name>]`. They are in
[`packages/tests/fixtures`](../tests/fixtures): each has an input and what
mermaid.js does with it.

How the specification was derived from mermaid.js is described in
[`docs/index.md`](./docs/index.md#sources).

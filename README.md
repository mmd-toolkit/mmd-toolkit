# mmd-toolkit

<img src="./packages/playground/public/mmd-toolkit.svg" alt="" width="64" height="64" />

Japanese version: [README.ja.md](./README.ja.md)

Third-party tooling for the Mermaid diagram syntax: a formatter, a linter, a
parser, a written specification, and a conformance corpus. Not affiliated with
mermaid-js.

`mmd` refers to the `.mmd` file extension used for Mermaid diagram text. It is
unrelated to MultiMarkdown and MikuMikuDance, which also use the abbreviation.

Flowchart, sequence, class, state, ER, Gantt, and user journey diagrams are
supported so far; the other diagram types follow. The formatter, the linter, and
the parser are not published to npm yet: they will be released once every
diagram type of mermaid.js is supported. The specification and the tests are
used from this repository and are not published.

## Playground

The Playground lets you edit Mermaid text, inspect its syntax tree and tokens,
and preview Prettier formatting in your browser.

Planned public URL:
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

Choose a sample from **Examples** or paste text into **Source**. The **AST** and
**Formatted** tabs update as you edit. Choose **Share**, then **Copy Link**, to
copy a URL that restores the input and indentation settings.

See the [Playground guide](./packages/playground/README.md) for tree navigation,
formatting options, and applying the formatted result.

## Packages

| Package                                                  | What it is for                                                                         |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`prettier-plugin-mmd`](./packages/prettier-plugin-mmd)  | Format `.mmd` files and `mermaid` code blocks in Markdown with Prettier.               |
| [`@mmd-toolkit/eslint-plugin`](./packages/eslint-plugin) | Lint `.mmd` files and `mermaid` code blocks in Markdown with ESLint.                   |
| [`@mmd-toolkit/parser`](./packages/parser)               | Parse Mermaid text into a syntax tree with positions, for linters and other tools.     |
| [`@mmd-toolkit/spec`](./packages/spec)                   | Read how Mermaid text is parsed, as a specification independent of any implementation. |
| [`@mmd-toolkit/tests`](./packages/tests)                 | Test an implementation of the syntax against what mermaid.js does.                     |

## What you can rely on

mermaid.js is the reference, at the version recorded in the
[specification](./packages/spec/docs/index.md).

- The parser accepts and rejects the same text as mermaid.js, and reads an
  accepted text as the same diagram.
- The syntax tree loses nothing of the text: with the tree and the source, the
  text is reproduced byte for byte.
- Formatting a file twice gives the same result as formatting it once, and
  formatting does not change the diagram. The few exceptions are listed in the
  formatter's
  [README](./packages/prettier-plugin-mmd/README.md#guarantees-and-limitations).

The parser differs from mermaid.js on purpose for a few kinds of input, for
example a directive (`%%{ ... }%%`) inside a keyword, which is a syntax error
here, or the word `click` outside a click statement. Each is defined, with its
reason, in the specification's
[Known divergences](./packages/spec/docs/known-divergences.md).

One more difference comes from what the parser is given, not from the syntax: it
does not know the site configuration of mermaid.js, so a flowchart with more
edges than `maxEdges` (500 by default), which mermaid.js rejects, is accepted
and formatted.

## Writing another implementation

The specification and the conformance corpus are kept apart from the parser so
that a parser can be written in another language from them alone. An
implementation follows these documents:

| What the implementation does                        | Documents                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepts and rejects a source                        | [common.md](./packages/spec/docs/common.md), [detection.md](./packages/spec/docs/detection.md), `diagrams/<diagram>.md`, and [known-divergences.md](./packages/spec/docs/known-divergences.md) of the specification                                                                                                                            |
| Builds the tree: its node types, fields, and values | [ast.md](./packages/spec/docs/ast.md) and `ast/<diagram>.md` of the specification                                                                                                                                                                                                                                                              |
| Gives the tree its tokens and positions             | [tokens.md](./packages/parser/docs/tokens.md), `tokens/<diagram>.md`, [positions.md](./packages/parser/docs/positions.md), and `positions/<diagram>.md` of the parser                                                                                                                                                                          |
| Compares its results with the conformance corpus    | [the fixtures](./packages/tests/README.md#what-the-fixtures-contain) and [`ast.json` and `parse-error.json`](./packages/tests/docs/maintaining-fixtures.md#astjson-and-parse-errorjson) of the tests                                                                                                                                           |
| Checks the recorded trees against mermaid.js        | [db-summaries.md](./packages/tests/docs/db-summaries.md), [db-from-tree.md](./packages/tests/docs/db-from-tree.md), `db-from-tree/<diagram>.md`, [check-tree.md](./packages/tests/docs/check-tree.md), [configuration.md](./packages/tests/docs/configuration.md), and [embedded-data.md](./packages/tests/docs/embedded-data.md) of the tests |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to build and test the
repository.

## License

[MIT](./LICENSE)

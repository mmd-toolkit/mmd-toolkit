# Developing the parser

Japanese version: [development.ja.md](./development.ja.md)

For how the parser is tested, see [`testing.md`](./testing.md).

## The parser is the reference implementation of the specification

- Every behavior comes from the specification in
  [`@mmd-toolkit/spec`](../../spec): [`common.md`](../../spec/docs/common.md),
  [`ast.md`](../../spec/docs/ast.md),
  [`detection.md`](../../spec/docs/detection.md), and the diagram documents
  under [`diagrams/`](../../spec/docs/diagrams).
- The fixtures of [`@mmd-toolkit/tests`](../../tests) belong to the
  specification too.
- The source of mermaid.js is not a source of behavior for this package.
- Where the specification is silent, the gap is reported to the specification,
  not filled here.

## What is implemented

The parts shared by every diagram are implemented from the specification, and
read from the source text directly:

- line terminators;
- HTML attribute quotes;
- frontmatter;
- directives;
- comment lines;
- leading whitespace;
- the `style` and `classDef` line rule;
- entities;
- the end of the text;
- diagram type detection, for every diagram type of mermaid.js 12.0.0.

The diagram bodies implemented so far are the `error` pseudo-diagram, the
flowchart (`flowchart-v2`, `flowchart-elk`, and `swimlane`), the sequence
diagram (`sequence`), and the class diagram (`classDiagram`). Every other
detected type throws `UnsupportedDiagramError`.

## How a diagram's parser is built

The parser of each diagram follows its document,
[`diagrams/flowchart.md`](../../spec/docs/diagrams/flowchart.md),
[`diagrams/sequence.md`](../../spec/docs/diagrams/sequence.md), or
[`diagrams/class.md`](../../spec/docs/diagrams/class.md). It has three parts:

- a lexer that divides the diagram text into units, under
  `src/diagrams/<diagram>/units.ts`;
- a recursive-descent parser over the units, under
  `src/diagrams/<diagram>/grammar.ts`;
- the tokens of the diagram's tree document, such as
  [`ast/flowchart.md`](../../spec/docs/ast/flowchart.md), recorded from the
  units.

What every diagram's lexer and parser do in the same way is in one place each: a
unit and how it is read (`src/diagram-units.ts`), reading the units, the place
of a node, the text of a range, the shared leaf nodes, and the tokens of an item
of the grammar (`UnitGrammar` in `src/unit-grammar.ts`), and the empty forms of
`tokenless-empty-forms` (`src/empty-forms.ts`). A rule that two diagram
documents share is in one place too: the direction line of flowchart and class
(`src/direction-line.ts`), and the Unicode letters of their letter rules
(`src/unicode-letters.ts`). A diagram whose lexer reads diagram comments, as the
sequence lexer reads `#` and `%` and the class lexer `%%`, hands them to the
common part, which records them in `Root.comments`. The rejections that
mermaid.js makes while it builds the Db are made by the parser after the
grammar: `subgraph-members.ts` for the flowchart, and `db-rejections.ts` for the
sequence diagram and the class diagram. The class lexer divides each member line
into its parts with the steps of
[Member lines](../../spec/docs/diagrams/class.md#member-lines)
(`src/diagrams/class/member-lines.ts`), both in a class body and in the label of
a member statement, and rejects a method line that cannot be divided.

It reads the diagram text without its directives. A directive inside a unit
whose kind is not `RawText` or `Identifier` makes the input rejected. The tokens
are cut at the directives when they are recorded
([A directive is a token boundary](../../spec/docs/common.md#a-directive-is-a-token-boundary)),
and each directive outside the tokens and the comments is recorded as a
`Directive` token of its own. The frontmatter is recorded first, as its opening
`---`, its body, and its closing `---`
([`ast.md`, Frontmatter](../../spec/docs/ast.md#frontmatter)).

## Tools

`tools/` holds scripts for working on the parser. They are not built and not
published. Run them in `packages/parser`:

- `pnpm run compare-with-mermaid <file>`: `<file>` is a JSON array of input
  strings. For each input, it prints the input and whether `parse()` and the
  pinned mermaid.js agree: `same: accepted, same Db`, `same: rejected`, or
  `DIFF:` with the two acceptances or the two Db summaries. It prints
  `BUG or broken tree:` when `parse()` throws something other than a
  `ParseError` or the tree fails the check of the tree. The Db summary of the
  tree is built as the fixture tests build it, so an input of a known divergence
  prints `DIFF`.
- `pnpm run show-trees <diagram> <fixture>...`: prints the input and the tree of
  each fixture's `ast.json`, one node per line, indented under its parent. A
  line has the node's plain fields, such as a direction or the markers of an
  arrow. For a node with a written value, it also has the value and the range,
  and the source text of the range when that differs from the value. The tokens
  follow.
- `pnpm run diff-trees <copy> <diagram>`: `<copy>` is a copy of
  `packages/tests/fixtures/<diagram>` taken before a change. It compares the
  parse results, `ast.json` and `parse-error.json`. It prints the files that are
  new or removed, such as `new: <fixture>/parse-error.json` for an input that is
  rejected now. It then prints how many fixtures have each kind of difference:
  the same field of the same node type, or of the error, with the list indexes
  left out. Each difference follows, with the value before and after.

# Mermaid syntax specification

Japanese version: [index.ja.md](./index.ja.md)

## Scope

This specification describes the text syntax accepted by mermaid.js: which
inputs are accepted, which are rejected, and what structure an accepted input
denotes. It does not describe rendering or layout. It does not parse or check
embedded data: the frontmatter body, directive arguments, and `@{ ... }` data
blocks are kept as written (see
[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.md)). How
mermaid.js derives its configuration is outside this specification.

The reference for every statement in this document is the behavior of a pinned
mermaid.js version. The pinned version is recorded in
[`@mmd-toolkit/tests`](../../tests).

## The pinned mermaid.js

The pinned version is mermaid 12.0.0. Its tag points to the commit
[`98a0945418c76238f15df2afaddbba4272656c3b`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b),
and every reference to the source of mermaid.js in this specification is a link
into that commit.

The gitgraph definition is in its [syntax](./diagrams/gitgraph.md) and
[tree](./ast/gitgraph.md) documents. [fixture: gitgraph/header-only] [fixture:
gitgraph/gram-all-fields]

The info definition is in its [syntax](./diagrams/info.md) and
[tree](./ast/info.md) documents. [fixture: info/header-lf] [fixture:
info/common-all]

The packet definition is in its [syntax](./diagrams/packet.md) and
[tree](./ast/packet.md) documents. [fixture: packet/gram-mixed] [fixture:
packet/spec-packet-c4580507]

The architecture definition is in its [syntax](./diagrams/architecture.md) and
[tree](./ast/architecture.md) documents. [fixture: architecture/header-beta]
[fixture: architecture/db-mixed]

## Sources

The specification is derived from three sources in the mermaid.js repository:

- the grammar of each diagram, in its directory under
  [`diagrams/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams)
  (for example
  [`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison)),
  including its lexer states; for Langium diagrams, the grammar and its imports
  under
  [language/](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language),
  such as
  [pie.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/pie.langium)
  and
  [common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium);
- the `Db` class of each diagram, which performs part of the parsing (for
  example
  [`destructLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L915-L946)
  in
  [`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts));
- the parser tests (`*.spec.js`), which are imported into
  [`@mmd-toolkit/tests`](../../tests) as conformance fixtures.

## Conformance

An implementation of this specification reads a source text and does two things:

1. It accepts the source exactly when this specification accepts it. That is
   when mermaid.js accepts it, except for the inputs defined in
   [known-divergences.md](./known-divergences.md). Where acceptance depends on
   the configuration, as with the limit on the number of flowchart edges, the
   check is made by whoever holds the configuration; the text alone does not
   decide it.
2. For an accepted source, it produces the tree defined in [ast.md](./ast.md)
   and in the document of its diagram type under `ast/`. The tree loses nothing
   of the source: every character is in a unit, a comment, a directive, the
   frontmatter, an ignored-text node of the diagram, or a `;` that the line rule
   ignores, as defined in [common.md](./common.md) and the diagram documents, or
   it is whitespace, as defined in [Notation](./common.md#notation), or a line
   terminator.

The tokens that an implementation records, the positions of the tree, and how
the tree is checked against the values that the Db of mermaid.js holds, are
outside this specification. The fixtures cited as `[fixture: <category>/<name>]`
show the acceptance and the tree for concrete inputs: `expected.json` records
whether mermaid.js accepts the input, the detected id, and the normalized Db.

## Terminology

- **source** — the complete input text, as given.
- **diagram type** — the kind of diagram, such as a flowchart or a sequence
  diagram. It is selected by the detectors of [detection.md](./detection.md),
  and it is named by the id that mermaid.js reports, such as `flowchart-v2` or
  `sequence` (the DiagramType of [ast.md](./ast.md#root)).
- **trivia** — the parts of the source that are not in the written text of a
  unit (see [Nodes](./ast.md#nodes)): frontmatter, directives, comments, the `;`
  that the line rule ignores, and the whitespace and line terminators outside
  those written texts, as defined in [common.md](./common.md) and
  [ast.md](./ast.md#directives-and-frontmatter).
- **unit** and **context** — a diagram document describes its lexer as reading
  units of the diagram text, in contexts that the units enter and leave.
  mermaid.js parses most diagrams with a Jison lexer that switches between
  exclusive states; the contexts restate what those states do, without following
  them one by one.
- **Db** — the per-diagram object that mermaid.js populates during parsing. Some
  syntax decisions (for example how an arrow string is decomposed) happen inside
  the Db rather than in the grammar.

## How to read a diagram document

Each document under `diagrams/` has the same sections:

1. **Detection** — how the diagram type is recognized.
2. **Lexical structure** — how the lexer divides the diagram text into units,
   and in which contexts.
3. **Grammar** — the statements of the diagram and how they compose, and the
   inputs that mermaid.js rejects after its grammar has accepted them.
4. **Known divergences** — which of the divergences defined in
   [known-divergences.md](./known-divergences.md) apply to the diagram type, and
   how they show in it. A divergence is a group of inputs for which this
   specification deliberately differs from mermaid.js, named by a divergence
   identifier that the affected fixtures carry. Behavior of mermaid.js that is
   merely surprising is described in the other sections and followed.

Each document under `ast/` defines the nodes of one diagram type's tree, with
their fields and child fields. The Grammar section of the diagram document says
which rule makes which node.

## Writing conventions

- Do not write invisible or easily confused characters directly in these
  documents: control characters other than tab, line feed, and carriage return,
  U+00A0, U+00AD, U+FEFF, U+200B–U+200F, U+2028, U+2029, and the other Unicode
  space separators. Name them as `U+XXXX`. Fixture inputs (`input.mmd`) contain
  the real characters, as intended.
- Do not write code in a programming language in the specification: no regular
  expressions and no type definitions in TypeScript or any other language. Data
  structures such as the abstract syntax tree are defined with field tables
  whose types are described in words (see
  [ast.md](./ast.md#how-fields-are-described)). The grammar notation of
  [common.md](./common.md#notation) is part of the specification and may be
  used. Examples of Mermaid text and fixture inputs may be shown as they are.
- Do not introduce symbols: no single-letter names or abbreviations for things,
  and no mathematical notation such as italic single letters or subscripts. Name
  each thing in words every time ("the detection point", "the keyword", "the
  first content line"). When a phrase gets long, give it a name made of
  meaningful words at the start of the section ("the **detection point** is the
  first position …") and use that name.
- Refer to the source of mermaid.js with a link into the pinned commit (see
  [The pinned mermaid.js](#the-pinned-mermaidjs)), in the form
  `https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/<path>#L<first>-L<last>`.
  The link text is the function name or the file name, as in
  [`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8).
  The line range covers exactly what is meant; check it against the file at that
  commit before writing it. A link to a whole file or a directory has no line
  range. Within one section, the first mention of a function carries the link,
  and later mentions may use the name alone. Do not leave a file name or
  function name of mermaid.js without a link.
- In particular, do not write regular expressions. Even where mermaid.js
  implements a rule with a regular expression, state what it accepts in prose
  and, where useful, in the grammar notation of
  [common.md](./common.md#notation). Spell out the boundary behavior that a
  pattern leaves implicit: which characters count as word characters or
  whitespace, whether a repetition takes as much or as little as possible, and
  where a match may not reach. References to mermaid.js source files and
  function names are fine.

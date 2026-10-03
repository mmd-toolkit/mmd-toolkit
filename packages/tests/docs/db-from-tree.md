# Building the Db from a tree

Japanese version: [db-from-tree.ja.md](./db-from-tree.ja.md)

This document explains `dbFromTree()` of `@mmd-toolkit/tests`: it builds the Db
summary that a recorded tree denotes, and so checks a tree against what
mermaid.js records for the same input, without running a parser.

## Why

A fixture records two things about an input: what mermaid.js makes of it (the Db
in `expected.json`, or in `specified.json` where the specification reads the
input differently), and the tree that a parser makes of it (`ast.json`). The two
have to agree: the tree is right when the Db it denotes is the Db of mermaid.js.
`dbFromTree()` makes that check a function of the recorded files alone, so that

- a parser is tested against its tree (`parse(input)` equals `ast.json`), and
  the tree is tested against mermaid.js here, each in the package that owns it,
- a parser in another language has no Db to build: it has to give the tree that
  `ast.json` records, and nothing else.

## What it reads

```ts
dbFromTree(text, tree, embedded, isColor)
```

- `text` is the input as written.
- `tree` is the content of `ast.json`, a `DbTreeRoot`. The types in
  `src/db-from-tree/*-tree.ts` list the fields that the Db reads, and no others;
  they are the fields that an implementation has to give. The tree is plain
  JSON: the function does not use a parser, a lexer, or the units of either. A
  field that is read and not there is reported with the diagram and the type of
  the node.
- `embedded` holds the values that mermaid.js derives from the embedded data of
  the input, which a tree does not hold (see
  [embedded-data.md](./embedded-data.md)). A fixture gives them through
  `embeddedValuesOf()`.
- `isColor` answers whether the colour candidate of a sequence `box` is a
  colour. That is the answer of a browser and is not in the text; the tests give
  `cssSupportsColor()`, the stand-in that the normalizer uses too.

## The converted form

The Db is built from the values of the tree as mermaid.js reads them, and not as
the author wrote them. A tree keeps the written text (ast.md, Nodes), so the
function reads the text again for the **converted form** of
[common.md, Reading a source](../../spec/docs/common.md#reading-a-source): each
line terminator as `\n`, each attribute quote as `'`, and each entity as its
placeholder, for the characters outside directives, comment regions, and the `;`
that the line rule ignores. The directives and the comment lines are found in
the text itself, with the rules of common.md, Where a directive is, and Comment
lines (`scanSource()` in `src/source-scan.ts`, which the check of a recorded
tree uses too, so that the rules are written once): a directive and what its
scan takes after it, and a comment line, which is a `%%` with only whitespace
and directives between it and a comment start, and with a character after it
that is not `{` or a line terminator, from the earliest such comment start to
the end of its line. Any other `%%` is diagram text. The tree gives what the
text cannot give alone:

- the `IgnoredSemicolon` tokens, since which `;` the line rule ignores depends
  on the line segment and on the diagram,
- the end of the frontmatter, where the text starts.

Leading whitespace is not read, and the end of the text is one more `\n`. In
flowchart, the whitespace after a `}` up to its last line feed is one line feed.

Characters inside a diagram comment are not read the way a lexer reads them: the
Db has no value that contains a comment. For the same reason, an entity or the
`;` that the line rule ignores inside a diagram comment does not count. The
tests do not compare the characters inside comments.

## Where the tree gives the text

Some Db values need the text of a range that a node does not give directly. They
are read from the tree like this:

- **Sequence participant ids**: the converted form of the whole range of the
  identifier, since the whitespace that a directive in the id has on its sides
  is part of it (the rule is in
  [db-from-tree/sequence.md](./db-from-tree/sequence.md)).
- **Class names**: the converted form of the tokens of an `Identifier`, joined,
  without the whitespace between them (the name text, the written name, and the
  id are defined in
  [Rejections outside the grammar](../../spec/docs/diagrams/class.md#rejections-outside-the-grammar),
  and the type of a written name in **Names** in
  [db-from-tree/class.md](./db-from-tree/class.md)).
- **Class styles**: the converted form of the texts of the tokens of the
  `ClassLiteral`, joined, split at each `,` (the rules are **Styles** in
  [db-from-tree/class.md](./db-from-tree/class.md)). The tokens of a style carry
  the whitespace that mermaid.js reads as part of the value next to a directive
  (tokens.md, A token that a directive cuts), and not the whitespace between its
  units, so the texts of the tokens joined are the value.
- **State alias without a second description**: whether the statement holds a
  `:` token.
- **State note position**: the `Keyword` token `left of` or `right of` of the
  statement, as written.
- **Flowchart strings**: the delimiters of a string, or of a markdown string,
  that a node starts with are left out of its value. The tree has the tokens of
  the string and not the contexts the lexer is in, so the contexts are read
  again from the converted form, by the rules of
  [diagrams/flowchart.md, Strings](../../spec/docs/diagrams/flowchart.md): the
  opening `"` enters the markdown context when a backtick follows it, the string
  ends when the contexts are left, and the content is the one run between the
  delimiters. A `"` that is an attribute quote is a `'` there, and a comment
  region that cuts the tokens of a string is not there.
- **Flowchart subgraph names**: the name text is the converted form from the
  start of the name to the end that the rule gives (the rule is **Subgraph
  members** in
  [Rejections outside the grammar](../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)),
  without the string delimiters and the leading empty description blocks.
  Comment regions, directives, and the `;` that the line rule ignores are not in
  the converted form, and the whitespace after a `}` is one line feed in it, so
  none of them ends the name.
- **Flowchart edges**: a limit of `maxEdges` is checked on the tree by
  `exceedsMaxEdges()`, since a parser does not know the configuration.

## The check

`tests/db-from-tree.test.ts` builds the Db of every fixture that records a tree
and an accepted result with a Db, and requires it to be the recorded Db
(`specified.json` where there is one, else `expected.json`), key order aside. A
fixture that records neither a tree nor an error of the parser is reported: no
comparison is skipped without a word. The test fails with the name of the
fixture, and with the diagram and the node type when the tree lacks a field.
When it fails, the tree is wrong, the builder here is wrong, or the record
(`embedded`, `specified`) is wrong; the fixture tells which.

## Adding a diagram type

1. Write the types of the fields the Db reads in `<diagram>-tree.ts`, from the
   tree document `docs/ast/<diagram>.md` of the specification.
2. Write `<diagram>.ts` after `db-from-tree/<diagram>.md`, the steps of the
   diagram, one method for each paragraph of "Building the summary from the
   tree", and register it in `index.ts`.
3. Run the test. A failure that the tree explains is a gap of the tree document
   or of the parser; report it with the input.

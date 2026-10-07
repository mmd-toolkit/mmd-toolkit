# Checking a recorded tree

Japanese version: [check-tree.ja.md](./check-tree.ja.md)

This document explains `checkTree()` of `@mmd-toolkit/tests`: it checks a
recorded tree (`ast.json`) against the conditions that the specification states
for a tree, from the tree and the input alone, without running a parser.

## Why

The comparison of [db-from-tree.md](./db-from-tree.md) shows that the ranges and
the texts a Db is built from are right. It cannot show that the other fields of
the tree are: the value of a leaf node, the fields of an arrow, the name of a
shape, the marks of a comment, whether a token starts or ends with whitespace
where it may. A parser could record a wrong value there and the Db would still
be the Db of mermaid.js, because the Db reads the input again. `checkTree()`
closes that gap: a tree that `ast.json` records is a tree in which every such
field is what the specification says it is. A parser in another language has to
give the same trees, and these checks hold it to the same conditions.

## What it reads

```ts
const problems: TreeProblem[] = checkTree(text, tree)
```

- `text` is the input as written, and `tree` the content of `ast.json`
  (`CheckedRoot`). The tree is plain JSON; the checks read the fields that they
  name and report a missing or malformed field as a problem, not as an error.
- The result lists the conditions that do not hold, each with where (a node, a
  token, a record) and a message; it is empty for a tree that satisfies them
  all. Checking all of a tree, not stopping at the first, shows the whole damage
  of a wrong tree.
- The directives and the comment lines are found in the text (`scanSource()` of
  `src/source-scan.ts`, also used for the converted form of
  [db-from-tree.md](./db-from-tree.md)), not taken from the tree, so that a
  comment or a directive that the tree lacks is found. The tree gives the
  `IgnoredSemicolon` tokens: which `;` the line rule ignores depends on the line
  segment and on the diagram.
- The form of a tree is given by a table of the fields of each node type and
  record (`src/check-tree/node-fields.ts`): the name of each field and its kind
  (a value of a type, a node, a node or null, a list of nodes). The
  specification defines the form of a tree in the field tables of ast.md,
  `ast/<diagram>.md`, and parser/docs/tokens.md; the table is its copy, and
  `tests/check-tree-node-fields.test.ts` requires it to agree with those tables.
  A tree that lacks a field, has a field that its type does not have, or has a
  field of another kind (a list for a node, a string for a node or null), or a
  range that is no offset pair, is reported, and the other checks are not run on
  it.
- The children of a node are the fields that the table gives as a node, a node
  or null, or a list of nodes; the one child field of `Root` is `body`. The
  order of the fields of a node is not used, nor the order of the keys inside a
  `loc`.

## The checks

- **Positions.** Every range lies in the input, and every `loc` is the place of
  its `range`; no token, comment, or directive is empty
  ([positions.md](../../parser/docs/positions.md), Positions and Invariants).
- **Every character is placed.** A character outside the tokens and comments is
  whitespace (positions.md, Invariants).
- **Texts.** The `value` of a token, and the text of a comment, a directive, and
  the frontmatter, equal the source of their ranges (positions.md, Invariants;
  [ast.md](../../spec/docs/ast.md)).
- **Comments.** A comment line is where the scan finds it, with the mark `%%`; a
  diagram comment has a mark that its diagram has, and ends where its line ends;
  a fragment without a mark follows a comment region (parser/docs/tokens.md,
  Comment; [common.md](../../spec/docs/common.md#comment-lines), Comment lines).
- **Directives.** The directives of the tree are those of the scan, each with
  its `closed` and the range of the match without the whitespace at its end
  (ast.md, Directive; common.md, Where a directive is).
- **Tokens.** They are in source order and do not overlap. A token starts or
  ends with whitespace only where a value starts or ends, next to a cut (a
  directive, a comment region, or a `;` that the line rule ignores), or where it
  goes on with a value that the token before it starts, or where it is all
  whitespace and a token of the same value follows it. A directive lies in no
  other token, and a comment lies in none (positions.md, Invariants).
- **Tokens that are not cut.** A directive or a `;` that the line rule ignores
  lies in a `String` (which then is `StringFragment` tokens) or a `RawText`
  token, and in no other token (parser/docs/tokens.md, A token that a directive
  cuts).
  - Two tokens of the kind `Identifier` or `Numeric` with a cut and no
    whitespace between them are the fragments of a cut token and are reported,
    as is a node of one token (an arrow, a number, an `Identifier`) with more
    than one. Two `Keyword` tokens are reported only when their texts joined are
    the text of a keyword of the diagram (`src/check-tree/keywords.ts`, a table
    that a test requires to hold every `Keyword` token of a recorded tree and
    the words of the row `Keyword` of the table of Tokens): `sub`, a cut, and
    `graph` are the fragments of `subgraph`, while a pseudostate mark and the
    start of an empty description block, `<<choice>>`, a cut, and `accDescr`,
    are units of their own.
  - The text of a `Punctuator` token other than those of the arrows is one that
    its diagram has (`src/check-tree/punctuators.ts`, a copy of the row
    `Punctuator` of the table of Tokens of each diagram), and no run of two such
    tokens or more, which cuts separate with nothing else between them, is the
    fragments of one text of the table (`:` and `::` for `:::`; `(` and `(` for
    `((`), also when the run starts with a token that the cut attaches, as the
    `)` of `A(x)%%{init: {}}%%:::c` does. The opening and the closing of a shape
    are one token each, and so are the relation ends and the line of a class
    arrow. Two `,` with a cut between are two units, as no text of the table is
    `,,`.
  - A `String` token starts with a quote, and one that a cut follows is closed.
- **Frontmatter.** The first tokens are `---`, the body, and `---`; the body is
  a `RawText` token without the whitespace around it, and there is none when the
  body is all whitespace (positions.md, Invariants).
- **Node ranges.** A node runs from the start of a token to the end of one,
  inside its parent, so every node has a token: a flowchart label that is all
  whitespace has the one `RawText` token of that whitespace. The children of a
  node do not overlap; the body is a diagram of the specification and covers the
  tokens of the diagram (positions.md, Node ranges and Invariants).
- **Literals.** The `raw` of a `StringLiteral` or a `NumericLiteral` is the
  source of its range, and `closed` of a `StringLiteral` is whether its `raw`
  has more than one character and ends with the quote that it starts with
  (positions.md, Invariants; ast.md, StringLiteral).
- **The `error` pseudo-diagram.** Its tokens are `RawText` tokens that hold no
  whitespace or line terminator, and no two of them touch (ast.md,
  ErrorDiagram).
- **Values.** The value of every node that has one is made from the source of
  its range by one rule, which the table of `src/check-tree/values.ts` applies
  type by type (ast.md, Nodes, and `ast/<diagram>.md`); see below.
- **Tokens and value nodes.** The tokens of a value lie in value nodes, and
  keywords and punctuators do not, with the exceptions that the documents state
  (`parser/docs/tokens/<diagram>.md`, Tokens).
- **Fixed words and fields.** The fields that the words and marks of a node
  write are what they write, and are null where nothing is written
  (`ast/<diagram>.md`):
  - flowchart: the markers, the line, and the length of an arrow; the name of a
    shape and whether it has a property; the `kind` of a label; the direction of
    the header, which is null when the token after the header keyword is no
    direction; the direction of a direction statement; the target of a click
    statement; the whitespace that a style or the name of a subgraph holds, and
    the `,` that separates two styles; `closed` of a description block;
  - sequence: `created` and `kind` of a participant; `activation`, which is the
    `+` or `-` of a message and null when it has none; the two central
    connections of a message, each the `()` on its own side of the arrow; the
    arrow of a message; the `wrap` of a text; the parts of a box text; the
    placement of a note; `off` of an autonumber statement; `closed` of a
    description block;
  - class: the markers and the line of an arrow, each one token, and an arrow
    text that is an arrow; the visibility of a member, and its classifier, of
    which a member has at most one mark; the direction and the target;
  - state: the tokens of a terminal and of a divider; the kind of a pseudostate,
    written `<<kind>>` or `[[kind]]`; the position of a note; the words of
    `hide empty description`, one token each; the direction; `closed` of a
    description block and of a string.

The **written text** of a range is its source without the directives, the
comment regions, and the `;` that the line rule ignores (ast.md, Nodes).

The **value rule** says that the value of a node is its written text, and that
the tokens of the node agree with it: the texts of the tokens in its range, the
`Directive` and `IgnoredSemicolon` tokens left out, joined, are the value. This
holds for each type with a value field (`value`, or `name`), except where the
table gives the type another way, each with the sentence of the specification
that says so:

- A value made of units joined (`Identifier`, `ClassIdentifier`, a class arrow,
  a style of a class diagram) leaves out the whitespace between its units; the
  joined tokens are the value. An `Identifier` is one token.
- A string, a label that starts with a string, and a data block have delimiters
  that belong to their own text; the value is the written text without them,
  with the whitespace written inside them, and that whitespace lies in the
  tokens.
- A node of text that mermaid.js does not read (an ignored text or statement)
  shows what was written, the whitespace between its units too, and the comments
  in its range are left out; that whitespace lies in no token, except in a run
  of text (`RawText`), which keeps the whitespace next to a cut. A diagram
  comment runs from its mark to the line feed that ends it (state.md, Comments),
  past the comment lines that cut it, so the value leaves out everything of that
  range: the whitespace before a U+2028 or U+2029, the separator, the comment
  lines with their line terminators, the whitespace after them, and the fragment
  after them. The line feed that ends the comment, and a comment line of its own
  with no diagram comment before it, leave nothing else out.
- The number of a `NumericLiteral` and the name of a `FlowchartShape` follow
  from the text and are not the text; the number is checked against the written
  text, and the name against the delimiters of the shape.

`tests/check-tree-values.test.ts` requires the table to list exactly the value
fields of the field tables, and to agree with the Meaning column of the
specification on which values are simply the written text or the texts of units
joined, so that the exceptions are those the specification states.

The records that the diagrams share are checked once (`leaves.ts`): the `name`
of a directive is its first word, and the `diagramType` of the root is one of
those of its body. The checks of a diagram are the checks of its own nodes.

Every field of every node type is checked, or listed with the reason it is not:
`tests/check-tree-fields.test.ts` breaks each field of each type in a recorded
tree and requires the check to report it. A field that may be null is also made
null where the source writes the word, and a word where it writes none, and the
problem must be one of the node that holds the field.

Not checked:

- The condition that every `;` the line rule ignores has an `IgnoredSemicolon`
  token: the line rule is not written twice, so the tokens are taken as given
  and their correctness is shown by the Db comparison.

## The tests

`tests/check-tree-corpus.test.ts` checks every recorded tree of the corpus and
that every node type in it is classified as a value node or not.
`tests/check-tree-fields.test.ts` is the test of the paragraph above.
`tests/check-tree-values.test.ts` is the test of the value rule: for every node
type with a value, it adds a character to the value at either end and drops one
from either end, and it takes the whitespace off an end of each token in the
nodes of the type, in the recorded trees, and requires each tree so made to be
reported; the types that have no token with whitespace at an end are listed with
the reason. `tests/check-tree-cut-tokens.test.ts` writes a directive, and a `;`
that the line rule ignores, inside a recorded token of each kind of each diagram
(every text of the `Keyword` and `Punctuator` tokens, and the first few
`Identifier`, `Numeric`, and `String` tokens), at every place inside it, as a
parser that cuts the token would record the text, and requires each tree so made
to be reported; for a `String` cut into `StringFragment` tokens and a `RawText`
cut into `RawText` tokens, it requires the tree not to be. The same file makes,
for every text of the table of `Punctuator` tokens of two characters or more of
every diagram, every cut of it at every place, by a directive and by a `;`, with
a `Punctuator` token that a cut attaches before it, after it, or both, and
requires each tree to have more problems than the tree of the whole text with
the same neighbours. `tests/check-tree-punctuators.test.ts` requires the table
of the texts of the `Punctuator` tokens, and the table of the shapes, to agree
with the documents. `tests/check-tree-cut-whitespace.test.ts` takes the
whitespace off the side of each token that touches a cut, in every recorded
tree, and requires each tree so made to be reported. It also makes, from one
recorded tree each, the two negative cases of the other exceptions: a token that
starts with whitespace in a value that began before it, where the token before
it does not touch it, and a token of whitespace that ends with whitespace in the
middle of a value, where no token follows it. The check must report each with
its message. `tests/check-tree-node-types.test.ts` requires the tables of node
types of the check to classify the node types that the tree documents of the
specification define, and no others. `tests/check-tree.test.ts` and
`tests/check-tree-*.test.ts` break a tree, one condition at a time, and require
the check to report it. The conditions that every tree satisfies (positions, the
placement of every character, the order of the tokens, the cuts, the comments,
the directives, and the frontmatter) are broken mostly on hand-made trees
(`check-tree.test.ts`, `check-tree-comments.test.ts`,
`check-tree-cut-units.test.ts`). The form of a tree, its fields and values, the
whitespace at the ends of tokens, the literals, and the conditions of a diagram
are broken on recorded trees, those of a diagram on the recorded trees of named
fixtures.

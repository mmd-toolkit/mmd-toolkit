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
  order of the fields is not used.

## The checks

- **Positions.** Every range lies in the input, and every `loc` is the place of
  its `range` ([positions.md](../../parser/docs/positions.md), Positions).
- **Every character is placed.** A character outside the tokens and comments is
  whitespace (positions.md, Invariants).
- **Texts.** The `value` of a token, and the text of a comment, a directive, and
  the frontmatter, equal the source of their ranges (positions.md, Invariants;
  [ast.md](../../spec/docs/ast.md)).
- **Comments.** A comment line is where the scan finds it, with the mark `%%`; a
  diagram comment has a mark that its diagram has, and ends where its line ends;
  a fragment without a mark follows a comment region (ast.md, Comment;
  [common.md](../../spec/docs/common.md#comment-lines), Comment lines).
- **Directives.** The directives of the tree are those of the scan, each with
  its `closed` and the range of the match without the whitespace at its end
  (ast.md, Directive; common.md, Where a directive is).
- **Tokens.** They are in source order and do not overlap. A token starts or
  ends with whitespace only where a value starts or ends, next to a cut (a
  directive, a comment region, or a `;` that the line rule ignores), or where it
  goes on with a value that the token before it starts. A directive lies in no
  other token, and a comment lies in none (positions.md, Invariants).
- **Tokens that are not cut.** A directive or a `;` that the line rule ignores
  lies in a `String` or a `RawText` token, and in no `Identifier`, `Numeric`, or
  `Keyword` token. Two tokens of one of these kinds with a cut and no whitespace
  between them are the fragments of a cut token and are reported, as is a node
  of one token (an arrow, a number, an `Identifier`) with more than one. A
  `Punctuator` that is no node of its own is not checked, as two of them may
  follow each other, as the `,` of `a,,b` do (parser/docs/tokens.md, A token
  that a directive cuts).
- **Frontmatter.** The first tokens are `---`, the body, and `---`
  (positions.md, Invariants).
- **Node ranges.** A node runs from the start of a token to the end of one,
  inside its parent; the children of a node do not overlap; the body covers the
  tokens of the diagram (positions.md, Node ranges and Invariants).
- **Values.** The value of every node that has one is made from the source of
  its range by one rule, which the table of `src/check-tree/values.ts` applies
  type by type (ast.md, Nodes, and `ast/<diagram>.md`); see below.
- **Tokens and value nodes.** The tokens of a value lie in value nodes, and
  keywords and punctuators do not, with the exceptions that the documents state
  (`ast/<diagram>.md`, Tokens).
- **Fixed words and fields.** The fields that the words and marks of a node
  write are what they write: the markers and the line of an arrow, the name of a
  shape, the visibility and classifier of a member, the placement of a note, the
  kind of a pseudostate, a direction, `closed` (`ast/<diagram>.md`).

The **written text** of a range is its source without the directives, the
comment regions, and the `;` that the line rule ignores (ast.md, Nodes).

The **value rule** says that the value of a node is its written text, and that
the tokens of the node agree with it: the texts of the tokens in its range, the
`Directive` and `IgnoredSemicolon` tokens left out, joined, are the value. This
holds for each type with a value field (`value`, or `name`), except where the
table gives the type another way, each with the sentence of the specification
that says so:

- A value made of units joined (`Identifier`, a class arrow, a style of a class
  diagram) leaves out the whitespace between its units; the joined tokens are
  the value. An `Identifier` is one token.
- A string, a label that starts with a string, and a data block have delimiters
  that belong to their own text; the value is the written text without them,
  with the whitespace written inside them, and that whitespace lies in the
  tokens.
- A node of text that mermaid.js does not read (an ignored text or statement)
  shows what was written, the whitespace between its units too, and the comments
  in its range are left out; that whitespace lies in no token, except in a run
  of text (`RawText`), which keeps the whitespace next to a cut.
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
tree and requires the check to report it.

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
the reason. `tests/check-tree-cut-whitespace.test.ts` takes the whitespace off
the side of each token that touches a cut, in every recorded tree, and requires
each tree so made to be reported. `tests/check-tree-node-types.test.ts` requires
the tables of node types of the check to classify the node types that the tree
documents of the specification define, and no others. `tests/check-tree.test.ts`
and `tests/check-tree-*.test.ts` break a tree, one condition at a time, and
require the check to report it: the breaks of the conditions of every tree are
made on hand-made trees, and those of a diagram on the recorded trees of named
fixtures.

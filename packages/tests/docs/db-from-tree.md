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
  JSON: the function does not use a parser, a lexer, or the units of either. It
  reads the fields without checking them: a tree that lacks one is found by
  [checkTree()](./check-tree.md), and the reading of such a tree fails with the
  error of the missing field.
- `embedded` holds the values that mermaid.js derives from the embedded data of
  the input, which a tree does not hold (see
  [embedded-data.md](./embedded-data.md)). A fixture gives them through
  `embeddedValuesOf()`. Its configuration also decides the
  [replacement of characters](#the-replacement-of-characters).
- `isColor` answers whether the colour candidate of a sequence `box` is a
  colour. That is the answer of a browser and is not in the text; the tests give
  `cssSupportsColor()` of `@mmd-toolkit/tests`, the stand-in that the normalizer
  uses too.

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
the end of its line. [fixture: common/comment-bare-then-u2028] [fixture:
common/comment-bare-then-u2029] Any other `%%` is diagram text. The tree gives
what the text cannot give alone:

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
- **Class names**: the converted form of the tokens of a `ClassIdentifier`
  (`RawText` tokens), joined, without the whitespace between them (the name
  text, the written name, and the id are defined in
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
- **State note position**: the two `Keyword` tokens of the statement after
  `note`, `left` or `right` and `of`, as written, with the one space between
  them that mermaid.js reads.
- **Flowchart strings**: the delimiters of a string, or of a markdown string,
  that a node starts with are left out of its value. The tree has the tokens of
  the string and not the contexts the lexer is in, so the contexts are read
  again from the converted form, by the rules of
  [diagrams/flowchart.md, Strings](../../spec/docs/diagrams/flowchart.md): the
  opening `"` enters the markdown context when a backtick follows it, the string
  ends when the contexts are left, and the content is the one run between the
  delimiters. A `"` that is an attribute quote is a `'` there. [fixture:
  flowchart/db-markdown-string-attribute-quote] A comment region that cuts the
  tokens of a string is not there. [fixture:
  flowchart/lex-comment-line-in-markdown-string]
- **Flowchart subgraph names**: the name text is the converted form from the
  start of the name to the end that the rule gives (the rule is **Subgraph
  members** in
  [Rejections outside the grammar](../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)),
  without the string delimiters and the leading empty description blocks.
  Comment regions, directives, and the `;` that the line rule ignores are not in
  the converted form, and the whitespace after a `}` is one line feed in it, so
  none of them ends the name. [fixture:
  flowchart/lex-comment-line-in-markdown-subgraph-name]
- **Flowchart edges**: a limit of `maxEdges` is checked on the tree by
  `exceedsMaxEdges()`, since a parser does not know the configuration. The
  function reads a `maxEdges` that is a non-negative integer, as the maximum
  number of edges that the configuration documents; its result for any other
  value is not defined (under a `maxEdges` of 1.5, mermaid.js accepts two edges
  and the function rejects them, and a `maxEdges` of `Infinity` makes
  `runMermaid()` throw, so there is no result to compare with). The limit 0
  rejects the first edge, and an input with no edge is accepted under it.
  [fixture: flowchart/config-max-edges-zero-exceeded] [fixture:
  flowchart/config-max-edges-zero-no-edge]

## The replacement of characters

mermaid.js passes each text that its Db keeps through
[`sanitizeText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L85-L97).
The runner of the corpus disables DOMPurify, so what remains is
[`sanitizeMore`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/common.ts#L70-L83)
(see [expected-results.md](./expected-results.md), What remains). It depends on
the configuration alone, which `embedded.config` holds in full (the site
configuration, the frontmatter, and the directives), so `dbFromTree()` makes it
in one place, `textReplacementOf()` (`src/db-from-tree/text-replacement.ts`),
and each diagram applies it to the texts below.

**When.** The replacement is made when HTML labels are enabled and
`securityLevel` is none of `strict`, `loose`, `antiscript`, and `sandbox`.

- Each of the four values keeps the text as written. [fixture:
  flowchart/config-security-level-strict-label-characters] [fixture:
  flowchart/config-security-level-loose-label-characters] [fixture:
  flowchart/config-security-level-antiscript-label-characters] [fixture:
  flowchart/config-security-level-sandbox-label-characters]
- Any other value changes the text. The value is compared as written, so
  `Loose`, the empty text, and a number are none of the four. [fixture:
  flowchart/config-security-level-other-label-characters] [fixture:
  flowchart/config-security-level-capitalized-label-characters] [fixture:
  flowchart/config-security-level-empty-label-characters] [fixture:
  flowchart/config-security-level-number-label-characters]
- Only the site configuration sets `securityLevel`: a directive or the
  frontmatter that sets it does not change the value. [fixture:
  flowchart/config-security-level-other-security-level-directive-strict]
  [fixture:
  flowchart/config-security-level-loose-security-level-directive-other]
  [fixture:
  flowchart/config-security-level-loose-security-level-frontmatter-other]
- HTML labels are enabled by the root `htmlLabels` when it is set (neither
  missing nor `null`), by `flowchart.htmlLabels` when the root one is not set,
  and otherwise they are enabled. [fixture:
  flowchart/config-security-level-other-html-labels-false] [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false] [fixture:
  flowchart/config-security-level-other-html-labels-true-flowchart-false]
  [fixture:
  flowchart/config-security-level-other-html-labels-false-flowchart-true]
  [fixture:
  flowchart/config-security-level-other-html-labels-null-flowchart-false]
- A value disables them when it is `false` or when its text, without the
  whitespace at its ends and in lower case, is `false`, `null`, or `0`; the
  number 0 has the text `0`. [fixture:
  flowchart/config-security-level-other-html-labels-false-text] [fixture:
  flowchart/config-security-level-other-html-labels-zero] [fixture:
  flowchart/config-security-level-other-html-labels-zero-text] [fixture:
  flowchart/config-security-level-other-html-labels-null-text] [fixture:
  flowchart/config-security-level-other-html-labels-false-spaced-upper]
  [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false-text]
  [fixture: flowchart/config-security-level-other-flowchart-html-labels-zero]
  Any other value, such as `true`, `no`, and the empty text, leaves them
  enabled. [fixture:
  flowchart/config-security-level-other-html-labels-true-text] [fixture:
  flowchart/config-security-level-other-html-labels-no-text] [fixture:
  flowchart/config-security-level-other-html-labels-empty-text]
- The configuration is the one of the text, so a directive or the frontmatter
  can set `htmlLabels`, and a directive overrides the site configuration.
  [fixture: flowchart/config-security-level-other-html-labels-false-directive]
  [fixture: flowchart/config-security-level-other-html-labels-false-frontmatter]
  [fixture:
  flowchart/config-security-level-other-flowchart-html-labels-false-directive]
  [fixture:
  flowchart/config-security-level-other-html-labels-true-directive-over-site]
- The same configuration decides in the other diagram types, and `flowchart`
  there is the key of the configuration, not the diagram. [fixture:
  class/config-security-level-other-html-labels-false] [fixture:
  class/config-security-level-other-flowchart-html-labels-false] [fixture:
  state/config-security-level-other-html-labels-false] [fixture:
  sequence/config-security-level-other-html-labels-false] [fixture:
  class/config-security-level-loose-label-and-name] [fixture:
  state/config-security-level-loose-description-and-id] [fixture:
  sequence/config-security-level-loose-title-and-box]

**What.** The replacement writes each line break tag as `#br#`, then each `<`,
`>`, and `=` as `&lt;`, `&gt;`, and `&equals;`, and then each `#br#` as `<br/>`,
so a `#br#` that the author wrote is `<br/>` too. A line break tag is `<`, an
optional `/`, `br` in any case, whitespace, an optional `/`, and `>`. [fixture:
flowchart/config-security-level-other-line-breaks] [fixture:
flowchart/config-security-level-other-line-breaks-spaced] The tags are found
before the `#br#` are replaced, from left to right without overlap. [fixture:
flowchart/config-security-level-other-placeholder-repeated] The directives are
taken out of the text before the replacement, so a directive inside a line break
tag, or inside a `#br#` that the author wrote, does not keep it from being
replaced. [fixture:
flowchart/config-security-level-other-line-break-directive-inside] [fixture:
flowchart/config-security-level-other-placeholder-directive-inside]

**Which texts.** The replacement is made on the text that mermaid.js passes to
`sanitizeText`, and on no other. The texts that it reaches, and those that it
does not, are:

- Flowchart: the label of a vertex and the text of a link, with the text of a
  markdown string and of a string whose quotes are removed after it; the title
  of a subgraph, which is its name when it has no title; the tooltip; the title
  of the frontmatter; `accTitle`; `accDescr`, of a line and of a block.
  [fixture: flowchart/config-security-level-other-label-characters] [fixture:
  flowchart/config-security-level-other-edge-label] [fixture:
  flowchart/config-security-level-other-markdown-label] [fixture:
  flowchart/config-security-level-other-quoted-label] [fixture:
  flowchart/config-security-level-other-subgraph-title] [fixture:
  flowchart/config-security-level-other-subgraph-name-line-break] [fixture:
  flowchart/config-security-level-other-tooltip] [fixture:
  flowchart/config-security-level-other-diagram-title] [fixture:
  flowchart/config-security-level-other-acc-title] [fixture:
  flowchart/config-security-level-other-acc-descr] [fixture:
  flowchart/config-security-level-other-acc-descr-block] The id of a vertex that
  is its text, the id of a subgraph, and the label that a data block sets are
  not reached. [fixture: flowchart/config-security-level-other-id-as-text]
  [fixture: flowchart/config-security-level-other-subgraph-name-line-break]
  [fixture: flowchart/config-security-level-other-data-block-label]
- Class: the title, `accTitle`, and `accDescr`; the label of a class; the
  generic type, and the text of the class that holds it; the id of a class; an
  attribute, a method with its parameters and its return type, and an annotation
  in the body of a class; the cardinalities and the label of a relation; the
  tooltip of a click, a link, and a callback. [fixture:
  class/config-security-level-other-diagram-title] [fixture:
  class/config-security-level-other-acc-title] [fixture:
  class/config-security-level-other-acc-descr] [fixture:
  class/config-security-level-other-acc-descr-block] [fixture:
  class/config-security-level-other-class-label] [fixture:
  class/config-security-level-other-generic-type] [fixture:
  class/config-security-level-other-member-attribute] [fixture:
  class/config-security-level-other-member-method] [fixture:
  class/config-security-level-other-member-annotation] [fixture:
  class/config-security-level-other-relation-titles] [fixture:
  class/config-security-level-other-tooltip] The text of a note is not reached.
  [fixture: class/config-security-level-other-note-as-written] The annotation of
  a statement, and the target of a link, have none of the characters that the
  replacement changes. [fixture:
  class/config-security-level-other-annotation-statement]
- State: the title, `accTitle`, and `accDescr`; the label and the descriptions
  of a state, the text of a note, and the label of a transition. The URL and the
  tooltip of a click are not reached. [fixture:
  state/config-security-level-other-diagram-title] [fixture:
  state/config-security-level-other-acc-title] [fixture:
  state/config-security-level-other-acc-descr] [fixture:
  state/config-security-level-other-acc-descr-block] [fixture:
  state/config-security-level-other-description] [fixture:
  state/config-security-level-other-alias] [fixture:
  state/config-security-level-other-note] [fixture:
  state/config-security-level-other-transition-label] [fixture:
  state/config-security-level-other-click-as-written]
- Sequence: the title, of the frontmatter and of a `title` statement;
  `accTitle`; `accDescr`; the name of a box; the links and the properties of a
  participant. The description of a participant, the text of a message, of a
  note, and of a block are not reached. [fixture:
  sequence/config-security-level-other-diagram-title] [fixture:
  sequence/config-security-level-other-title-statement] [fixture:
  sequence/config-security-level-other-acc-title] [fixture:
  sequence/config-security-level-other-acc-descr] [fixture:
  sequence/config-security-level-other-acc-descr-block] [fixture:
  sequence/config-security-level-other-box-name] [fixture:
  sequence/config-security-level-other-links] [fixture:
  sequence/config-security-level-other-properties] [fixture:
  sequence/config-security-level-other-texts-as-written]

**Where the order of mermaid.js matters.** Some texts are replaced before
mermaid.js reads them further, and the builders do the same.

- Class names: the id and the type of the written name of a class are replaced
  (a backquoted name can hold the characters). Names that become equal are one
  class, and every statement that names a class looks it up by the replaced id,
  in a namespace too. The written name stays in a note's `class`, and in the
  `label` and the `classId` of an interface. [fixture:
  class/config-security-level-other-name-backquoted] [fixture:
  class/config-security-level-other-name-merged] [fixture:
  class/config-security-level-other-name-lookup] [fixture:
  class/config-security-level-other-name-namespace] [fixture:
  class/config-security-level-other-name-note-and-interface-as-written]
- Class members: the replacement is made on the whole member line, before the
  visibility mark is read, so the mark and the name are replaced together: a
  line that starts with `#br#` has no visibility, and `#` followed by anything
  else is the visibility protected. [fixture:
  class/config-security-level-other-member-hash-line-break]
- State ids: the label of a state is the replaced id until a description
  replaces it, and a description replaces it only when the replacement did not
  change the id. Otherwise the replaced id stays the first description, the
  label is the replaced id, and the descriptions follow it. [fixture:
  state/config-security-level-other-id-without-description] [fixture:
  state/config-security-level-other-id-changed-with-description] [fixture:
  state/config-security-level-other-id-unchanged-with-description] [fixture:
  state/config-security-level-other-composite-id]
- Sequence links: the text of `links` is replaced, written with `&equals;` as
  `=` again, and read as JSON; the text of `properties` is replaced and read as
  JSON. The text of `link` is replaced, the position of its `@` is taken in that
  text, and the label and the URL are cut at that position from the text with
  `&equals;` as `=` again, so a `=` before the `@` moves the cut. [fixture:
  sequence/config-security-level-other-links] [fixture:
  sequence/config-security-level-other-properties] [fixture:
  sequence/config-security-level-other-link]

## The check

`tests/db-from-tree.test.ts` builds the Db of every fixture that records a tree
and an accepted result with a Db, and requires it to be the recorded Db
(`specified.json` where there is one, else `expected.json`), key order aside. A
fixture that records neither a tree nor an error of the parser is reported: no
comparison is skipped without a word. The test fails with the name of the
fixture, and with the error of the reading when the tree lacks a field. When it
fails, the tree is wrong, the builder here is wrong, or the record (`embedded`,
`specified`) is wrong; the fixture tells which.

## Adding a diagram type

1. Write the types of the fields the Db reads in `<diagram>-tree.ts`, from the
   tree document `docs/ast/<diagram>.md` of the specification.
2. Write `<diagram>.ts` after `db-from-tree/<diagram>.md`, the steps of the
   diagram, one method for each paragraph of "Building the summary from the
   tree", and register it in `index.ts`.
3. Run the test. A failure that the tree explains is a gap of the tree document
   or of the parser; report it with the input.

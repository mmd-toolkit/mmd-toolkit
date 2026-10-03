# Testing the parser

Japanese version: [testing.ja.md](./testing.ja.md)

The tests are in `tests/`. They check the parser against the fixtures of
[`@mmd-toolkit/tests`](../../tests) and against the pinned mermaid.js (12.0.0).

## Fixtures

The tests parse every fixture in `common/`, `flowchart/`, `sequence/`, `class/`,
and `state/`, and check:

- acceptance;
- the diagram type;
- the Db summary;
- the invariants of the tree (see [Tree invariants](#tree-invariants)).

The Db summary is built from the tree:

- The tests follow the steps of the diagram's Db normalization. For the `error`
  pseudo-diagram, the summary is `{}`.
- The normalization reads each value in converted form. A test helper reads the
  ranges of the tree again with the parser's own lexer to get that form. The
  helper is not public API.
- Every lexical decision that the summary needs comes from the parser's units:
  where a string's content lies, which strings are empty, which `click` in a
  subgraph name is a `click` unit, where the first style of a statement starts,
  in a class diagram, the units of a name, a style, and a generic type, and
  where a backquoted name that is not closed ends, and, in a state diagram, the
  second description of an alias, the text of a note on one line from right
  after its id, and the parts of the styles of `style` and `classDef`, empty
  ones included. The helpers never decide these by rules of their own; a wrong
  unit shows as a Db that differs from mermaid.js.
- The parser does not read embedded data: the frontmatter title, the
  configuration, and what each data block sets. For these, the tests use what
  mermaid.js derives for the same text (`resolveEmbeddedData()` of
  `@mmd-toolkit/tests`).
- The data blocks of the tree are checked against the blocks that mermaid.js
  applied, in number, order, and id.
- Whether the colour candidate of a sequence box is a colour is the answer of
  the browser, not something in the text. The tests take it from the same
  function that the normalizer of `@mmd-toolkit/tests` gives mermaid.js
  (`cssSupportsColor()`).

A fixture marked with a known divergence expects the result of the
specification.

## Known divergences

Every fixture marked with a
[known divergence](../../spec/docs/known-divergences.md) is also checked with a
reference input, or for `comment-takes-character` and `comment-takes-line-break`
with mermaid.js reading the input in another way. The check shows that the
divergence alone explains the difference from mermaid.js:

- `directive-as-token-boundary`: the parser reads the input without its
  directives, and must give what mermaid.js gave for the input.
- `html-tag-in-frontmatter`: the parser must give for the input what mermaid.js
  gives once the frontmatter starts no tag.
- `click-reserved-word`: the parser rejects the input. The reference input is
  the input without its comment regions, without its empty forms, and without
  each `click` that does not start a click statement, with the whitespace that
  its click context reads around it. Where the parser's lexer reads it as the
  units of the input but the removed ones (the click ids of those `click` units
  may be read as other units in their place), the parser accepts it, and the
  text of each of those click ids lies within one leaf node of its tree, the
  parser must give what mermaid.js gave for the input. Which `click` units start
  a click statement is found from the parser's units.
- `tokenless-empty-forms`: the parser rejects the input. The reference input is
  the input without its comment regions and without its empty forms: each empty
  string, each empty call, each empty description block that does not start a
  statement, and, in a class diagram, each empty backquoted name and each empty
  generic type. Where the parser's lexer reads it as the units of the input but
  those of the empty forms, and the parser accepts it, the parser must give what
  mermaid.js gave for the input.
- `comment-takes-character`: the input has a `%%`, outside directives, right
  after a `number` unit or right after a character other than whitespace at
  which the sequence lexer, in the statement context, starts the match of a
  rule, decided on the diagram text; both come from the parser's lexer.
  mermaid.js reads the input with the two rules of its lexer that the divergence
  names changed (`withoutDivergences` of `@mmd-toolkit/tests/mermaid`), and the
  parser must give what it gives: the same acceptance and, for an accepted
  input, the same Db.
- `name-start-reads-unit`: the class diagram has a backquoted name or a generic
  type whose text starts with `"`, `~` (in a backquoted name), `<<`, `>>`, or
  one of the keywords that the divergence names, found from the parser's
  `backquoted` and `generic-text` units. mermaid.js reads the input with the
  rules of its lexer that the divergence names reordered, and the parser must
  give what it gives.
- `comment-takes-line-break`: the class diagram has a diagram comment that
  follows a unit on its line, found from the parser's lexer and units.
  mermaid.js reads the input with the rule of its lexer that the divergence
  names changed, and the parser must give what it gives.

## Tree invariants

On generated inputs, a check asserts the
[invariants of `ast.md`](../../spec/docs/ast.md#invariants). It also asserts:

- the child nodes of a node do not overlap, and they are in source order when
  taken in the order of the child fields, except in a FlowchartLink with text
  between two arrows, whose `label` comes before its `arrow` in the source;
- `loc` agrees with `range`;
- the comments are in source order and do not overlap;
- every comment ends before the line terminator that ends its line, or at the
  end of the text, except that a comment in which a directive takes the rest of
  the text ends where that directive ends, that a fragment of a diagram comment
  before a comment line after U+2028 or U+2029 ends at its last character that
  is not whitespace, and that the last fragment of a diagram comment ends before
  a `;` that the line rule ignores and that is its last character
  ([`ast.md`](../../spec/docs/ast.md#comment));
- the `mark` of a comment line is `%%`, and that of a diagram comment is its
  mark as the source writes it; a comment whose `mark` is `null` is a fragment
  after a comment region, which starts at a character that is not whitespace,
  right after the region and the line whitespace after it, and whose `value` is
  the text of its range.

For a flowchart, it asserts what
[`ast/flowchart.md`](../../spec/docs/ast/flowchart.md) states about the tree:

- The value of every leaf node is the text of its range, or of the part of it
  that its node type names; the name of an Identifier is the texts of its
  tokens, joined in order. Where a string's content lies and which `;` the line
  rule ignores come from the parser's lexer and units.
- Every token of a value lies in a value node. A token of a value is an
  `Identifier`, `RawText`, `Numeric`, or `String` token.
- No `Keyword` or `Punctuator` token lies in a value node, except the delimiters
  of a data block.
- The direction of the header is the first token of the diagram after the header
  keyword; a `Directive` token between them is not one.
- The name of a shape agrees with its delimiters.
- Each arrow of a link is one token, and its fields are what it writes: its
  markers, its line, and, for a closed arrow, the number of its line characters.
  The opening arrow of a link has the line of its closing arrow.
- A description block is closed exactly when its last token is `}`.

For a sequence diagram, it asserts what
[`ast/sequence.md`](../../spec/docs/ast/sequence.md) states about the tree:

- The value of every leaf node is the text of its range, or of the part of it
  that its node type names: the text between `@{` and `}` of a data block, and
  the number that the `raw` of a number writes. The name of a SequenceIdentifier
  is the text of its range, the whitespace inside it included.
- Every token of a value lies in a value node, and no `Keyword` or `Punctuator`
  token does, except the delimiters of a data block.
- The fixed words and operators of a node are its tokens: `create` and the
  keyword of a participant statement, the activation and the central connections
  of a message, the placement of a note, the wrap prefix of a text, `off` of an
  autonumber statement, and the `}` of a closed description block.
- The arrow of a message is one token, and its fields are what it writes: its
  start marker, its line, and its end marker.
- Each part of a box text, the colour candidate and the remainder, is one token,
  unless a directive cuts it into tokens of the same kind, so the tokens of the
  text are those of its parts.

For a class diagram, it asserts what
[`ast/class.md`](../../spec/docs/ast/class.md) states about the tree:

- The value of every leaf node is the text of its range, or of the part of it
  that its node type names: a StringLiteral the text without its quotes, or
  without its opening quote alone when it is not closed, and an arrow the texts
  of its tokens. The name of an Identifier is the texts of its tokens, joined in
  order.
- Every token of a value lies in a value node, and no `Keyword` or `Punctuator`
  token does.
- Each relation end and the line of an arrow are `Punctuator` tokens, at most
  one end on each side of the line, and the fields of the arrow are what they
  write.
- The visibility and classifier marks of a member are its `Punctuator` tokens:
  the visibility mark comes first, and there is at most one classifier mark.
- The keywords of a direction statement are `direction` and its value, and the
  target of a link is its last token.

For a state diagram, it asserts what
[`ast/state.md`](../../spec/docs/ast/state.md) states about the tree:

- The value of every leaf node is the text of its range, or of the part of it
  that its node type names: a StringLiteral, which is always closed here, the
  text between its quotes. The name of an Identifier is the texts of its tokens,
  joined in order.
- Every token of a value lies in a value node, and no `Keyword` or `Punctuator`
  token does, except in a StateIgnoredText, whose range holds the tokens of its
  units whatever their kind: the `accDescr`, `{`, and `}` of an empty
  description block before a body.
- The fixed words and marks of a node are its tokens, written in any case: `[*]`
  and `--` are one `Punctuator` token each, the kind of a pseudostate is the
  word of its mark, the position of a note is the first word of its position
  token, the keywords of a direction statement are `direction` and its value,
  and a description block is closed exactly when its last token is `}`.

For the `error` pseudo-diagram, it asserts that the tokens other than the
`Directive` tokens and the tokens of the frontmatter are `RawText` tokens and
maximal runs:

- no token holds whitespace or a line terminator;
- two tokens touch only when one of them is a `;`;
- every comment is outside the tokens.

A test of the check itself feeds it broken trees.

## What the tests read from the source themselves

A check reads a fact from the source on its own only when nothing else checks
that fact. The `loc` of every node and the value of a comment are compared with
mermaid.js nowhere, so the check of the tree finds lines, columns, the `%%` of a
comment line, the mark of a diagram comment, and where a comment ends from the
source itself. How strings, comment regions, `click` units, and ignored `;` are
read changes the values and so the Db, which is compared with mermaid.js; for
these, the helpers take the parser's lexer and units, and do not read the source
a second way.

## Differential comparison with mermaid.js

The tests compare `parse()` with the pinned mermaid.js through
`@mmd-toolkit/tests/mutation`:

- The rules shared by every diagram are compared on generated inputs, 300 per
  seed; `MMD_DIFFERENTIAL_COUNT=3000 CI=true npx vitest run tests/differential`
  raises the number without editing the test. The diagram type and the Db
  summary must agree.
- The flowchart is compared on mutants of its fixtures, each one edit away from
  a fixture input, one per fixture;
  `MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/flowchart-mermaid.test.ts`
  is the full check, without editing the test. The diagram type and the Db
  summary must agree.
- The sequence diagram is compared in the same way, on mutants of its fixtures
  (`tests/differential/sequence-mermaid.test.ts`), and on the accepted fixture
  inputs with `%% c` inserted after a character, the inputs of
  `comment-takes-character`, leaving out the fixtures of another known
  divergence, which would give inputs of two divergences at once: 300 of them,
  spread evenly over all of them;
  `MMD_COMMENT_INPUTS=1000000 CI=true npx vitest run tests/differential/sequence-mermaid.test.ts`
  compares all of them. Every difference must be a known divergence, explained
  as below.
- The class diagram is compared in the same way, on mutants of its fixtures
  (`tests/differential/class-mermaid.test.ts`), and on the accepted fixture
  inputs with a comment inserted, the inputs of `comment-takes-line-break`:
  ` %% c` at the end of each line and after each space inside a line, and a line
  of `%%` or of `%%{ }%%` after each line, 300 of them, spread evenly over all
  of them; `MMD_COMMENT_INPUTS` raises the number as for the sequence diagram.
  The places where its Db reads text at the boundaries of the units (the space
  after a visibility mark, the units of a style and of a name, a generic type, a
  label, or an annotation line that is all whitespace, and a backquoted name
  that is not closed) are compared with a space, a tab, a directive, and a
  comment line put at every place of such a statement, and the member lines with
  one or two spaces or a tab put at every place of them, in a class body and in
  a label: after a visibility mark, after `)`, after a return type before a
  classifier mark, and after U+2028 and U+2029
  (`tests/differential/class-source-reading.test.ts`).
- The state diagram is compared in the same way, on mutants of its fixtures
  (`tests/differential/state-mermaid.test.ts`), and on the accepted fixture
  inputs without a known divergence with a text inserted where a statement ends
  or starts: `%% c` and `# c` at the end of each line and after each space
  inside a line, and, after each line, a line of `%%`, `%% c`, `# c`, an empty
  description block, or ids that start with a keyword; 300 of them, spread
  evenly over all of them, and `MMD_COMMENT_INPUTS` raises the number. The
  places where its Db reads text at the boundaries of the units (the
  descriptions of an alias, the text of a note on one line, the parts of styles,
  and the values that it trims) are compared with one or two spaces, a tab,
  U+2028, and U+2029 put at every place of such a statement
  (`tests/differential/state-source-reading.test.ts`).

Inputs that once made a test helper take a lexical decision by a rule of its own
are compared as well: the Db built from the tree must be that of mermaid.js, and
the tree must pass the check of the tree.

The parser does not tell the known divergences apart, so the tests declare them.
Every declared difference is checked:

- a rejection for a directive must go away without the directives;
- a rejection for a `click` that does not start a click statement, or for an
  empty form, must give, where the parser accepts the reference input, what
  mermaid.js gave for the input;
- a difference that goes both ways must be what mermaid.js gives for the
  reference input, for `html-tag-in-frontmatter`, or for the input with the
  rules of its lexer that the divergence names changed, for
  `comment-takes-character`, `comment-takes-line-break`, and
  `name-start-reads-unit`;
- a rejection of a class diagram whose first unit is not its header
  (`headerless-empty-ending`, which goes one way and has no reference reading)
  must be of an input that mermaid.js accepts; the parser's lexer decides it;
- a rejection of mermaid.js for embedded data must be one of the errors that the
  specification lists.

## Parse-result snapshots

What `parse()` gives for every fixture is kept as a snapshot, next to the
fixture's input in `packages/tests/fixtures/<diagram>/<fixture name>/`:

- For an input that the parser accepts, `ast.json` holds the tree, as
  `JSON.stringify(root, null, 2)`, locations included.
- For an input that the parser rejects, `parse-error.json` holds the `message`,
  `range`, and `loc` of the `ParseError` (its `index` is the start of `range`).
  It records where the parser reports the rejection: for a known divergence, the
  form that causes it (see [`error-positions.md`](./error-positions.md)), and
  for an input that mermaid.js rejects as well, where the general rules put it.
  A rejection is thus recorded as fully as a tree, and a change of where it is
  reported shows as a change of the file.
- A fixture has one of the two, or neither when its diagram type is not
  supported yet. A test looks at the files alone and checks that no fixture has
  both.
- A change of any tree or error shows as a change of its file.
  `pnpm run test:update`, in `packages/parser`, runs the snapshot test alone
  with `-u` and writes the files anew.
- A test checks that no `ast.json` or `parse-error.json` is left behind: in a
  directory without an input, or where the other file belongs.

### After adding fixtures

A fixture that `@mmd-toolkit/tests` adds has neither file until the parser tests
run. Outside CI, the snapshot test writes the missing file and passes. In CI
(`CI` set), a missing file fails the test.

Whoever adds fixtures therefore:

1. runs the snapshot test once, in `packages/parser`:
   `pnpm run test tests/parse-result-snapshots.test.ts`;
2. reads the new `ast.json` and `parse-error.json` files to see that the trees
   and the errors are what the specification says;
3. commits them with the fixtures.

When a fixture is renamed or removed, its old files go with it. The test that
looks for files left behind names any that remain.

## Other tests

- Every example in the comments of the node types (`src/ast/flowchart.ts`,
  `src/ast/sequence.ts`, `src/ast/class.ts`, and `src/ast/state.ts`) is parsed.
  The range that its `^` marks show is compared with the range of the node.
- `flowchartSubgraphIds()` is compared, on every flowchart fixture whose Db has
  subgraphs, with the ids of the subgraphs of the Db, in order, where converting
  the name text changes nothing.
- The example in the Usage section of the README is parsed, and the values and
  the tree it shows are compared with the result.
- Unit tests cover each rule of `common.md`, the detector table, `visitorKeys`
  and `traverseNodes`, the flowchart tree and its tokens, and the sequence tree,
  the class tree, and the state tree, their tokens, and the rejections outside
  their grammars.

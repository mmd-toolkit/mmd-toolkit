# Testing the parser

Japanese version: [testing.ja.md](./testing.ja.md)

The tests are in `tests/`. They check the parser against the fixtures of
[`@mmd-toolkit/tests`](../../tests): what the parser must do is stated by the
specification and by the fixtures. Whether the recorded trees keep the
conditions of the specification and give the Db of mermaid.js are checks of the
corpus, which `@mmd-toolkit/tests` makes on the recorded trees; the tests of the
parser check that the parser gives those trees, and run neither mermaid.js nor
generated inputs. A case that the corpus lacks is added to it as a fixture, with
the sentence of the specification or of the parser's documents that defines it.

## Fixtures

`tests/fixtures.test.ts` parses every fixture of the diagram directories that
`tests/helpers/recorded-diagrams.ts` lists, once each, and checks:

- the parse result against the one that the fixture records for the parser (see
  [Recorded parse results](#recorded-parse-results));
- the acceptance and the diagram type against what the fixture records of
  mermaid.js, as the `knownDivergence` mark of the fixture asks: the result of
  mermaid.js without a mark, the result of the specification with one.

Neither the tree nor the Db is checked here: `@mmd-toolkit/tests` checks each
recorded tree (`check-tree-corpus.test.ts`; see
[The tree check](#the-tree-check)) and builds its Db and compares it with the Db
that the fixture records (`db-from-tree.test.ts`).

`tests/kanban.test.ts` checks, on named fixtures, cards under columns with their
indentation and ranges, adjacent data blocks, quoted labels with CRLF,
mismatched shape delimiters, ignored semicolons, and the places of rejections.
The parse records and the acceptance, including the common kanban detection
fixture, are compared by `tests/fixtures.test.ts`.

`tests/c4.test.ts` checks, on named fixtures, empty blocks in the header gap and
the boundary gap, bare and quoted arguments, named keys, null entries,
directives in values, title whitespace, and the places of rejections.
`tests/fixtures.test.ts` compares their recorded parse results and acceptance,
including the C4 detection fixtures outside `c4/`.
`tests/ast-c4-examples.test.ts` checks the ranges and tree invariants in the
type comment examples.

`tests/venn.test.ts` checks, on named fixtures, subsets, explicit and implicit
text, style atoms and their token kinds, labels emptied by trivia, line
terminators and numbers, and the places of rejections. `tests/fixtures.test.ts`
compares their recorded parse results and acceptance, including the common venn
detection fixture. `tests/ast-venn-examples.test.ts` checks the ranges in the
type comment examples.

`tests/ishikawa.test.ts` checks, on named fixtures, the indentation of causes,
rootless diagrams, literal text, RawText fragments around directives and ignored
semicolons, diagram comments before a line separator, and the places of
rejections. `tests/fixtures.test.ts` compares their records and acceptance,
including the common Ishikawa detection fixture.
`tests/ast-ishikawa-examples.test.ts` checks the type comment example ranges.

`tests/architecture.test.ts` checks, on named fixtures, structure, token
spelling and ranges, and gap ownership. Acceptance and records, including
applicable common fixtures, are checked by `tests/fixtures.test.ts`.
`tests/ast-architecture-examples.test.ts` checks the ranges of node type comment
examples.

## Known divergences

Every fixture marked with a
[known divergence](../../spec/docs/known-divergences.md) is also checked, with
the parser's own lexer, for the form of its divergence, and, for a divergence
that goes one way, with a reference input without that form. For a divergence
that goes both ways, the reading of the specification is recorded in the corpus
(`specified.json`, where it differs from `expected.json`): the acceptance and
the diagram type that the parser gives are compared with it, and the corpus
compares it with the Db built from the recorded tree.

The common fixture loop calls `expectDivergenceForm` in
`tests/helpers/divergence-form.ts` for every supported diagram. That helper
checks rejecting forms, token-cut reference readings, frontmatter attribute
quotes, passed bare percent lines and C4 keywords after the header. The
agentflow, gitgraph, info, Ishikawa, pie, usecase and venn tests share these
checks through that loop. [fixture: gitgraph/div-directive-in-commit] [fixture:
gitgraph/div-frontmatter-cross-string-enable] [fixture:
usecase/div-comment-preheader-bare] [fixture: venn/div-c4-bare-identifier]

- `directive-as-token-boundary`: the parser reads the input without its
  directives and with each `;` that the line rule ignores moved to the end of
  its line segment (see [Reference inputs](#reference-inputs)), and must give
  what mermaid.js gave for the input: the same acceptance, diagram type, and Db.
  The Db is built from the parser's tree as `@mmd-toolkit/tests` builds it from
  a recorded tree (`dbFromTree`), with the embedded values that the fixture
  records.
- `ignored-semicolon-as-token-boundary`: the parser reads the same reference
  input, and must give what mermaid.js gave for the input, as above. Which `;`
  the line rule ignores is found from the parser's line rule.
- `click-reserved-word`: the parser rejects the input, and, where the
  specification gives its reference input the Db of the input
  ([The difference](../../spec/docs/known-divergences/click-reserved-word.md#the-difference);
  see [Reference inputs](#reference-inputs)), must give the reference input what
  mermaid.js gave for the input, as above. Which `click` units start a click
  statement is found from the parser's units.
- `tokenless-empty-forms`: the parser rejects the input, and, where the
  specification gives its reference input the Db of the input
  ([The difference](../../spec/docs/known-divergences/tokenless-empty-forms.md#the-difference);
  see [Reference inputs](#reference-inputs)), must accept the reference input
  and give it what mermaid.js gave for the input, as above.
- `headerless-empty-ending`: the parser rejects the class diagram for its
  missing header, which the parser's lexer decides.
- `comment-takes-character`: the input has a `%%`, outside directives, right
  after a `number` unit or right after a character other than whitespace at
  which the sequence lexer, in the statement context, starts the match of a
  rule, decided on the diagram text; both come from the parser's lexer. A Gantt
  chart has a `%` right after the first character of a unit, a character other
  than `}` and whitespace, and a journey diagram and a timeline a `%%` there,
  found from the parser's units and diagram text.
- `comment-takes-line-break`: the class diagram has a diagram comment that
  follows a unit on its line, found from the parser's lexer and units. The Gantt
  chart has a comment with the mark `%` that mermaid.js reaches directly, as
  [Comments](../../spec/docs/diagrams/gantt.md#comments) defines it, found from
  the parser's units, comments, and diagram text, with the line feeds of a
  `newline` unit counted as whitespace before the `%`. In C4, the input has a
  diagram comment, found by its lexer, whose following line terminator stays
  outside the comment.
- `percent-brace-after-unit`: the Gantt chart has a `%%{` that starts no
  directive and that mermaid.js reaches directly, found in the same way.
- `blank-line-after-header-or-comments`: the mindmap, kanban, or Ishikawa
  diagram has, after the header or between two statements, blank lines and
  diagram comments in one of the four cases of the divergence, found from the
  lines of the parser's units and diagram comments: a `newline` unit ends a
  line, one of n line feeds ends n lines, and one with no characters ends the
  line of a diagram comment at a U+2028 or a U+2029.
- `name-start-reads-unit`: the class diagram has a backquoted name or a generic
  type whose text starts with `"`, `~` (in a backquoted name), `<<`, `>>`, or
  one of the keywords that the divergence names, found from the parser's
  `backquoted` and `generic-text` units.
- `html-tag-in-frontmatter`: a tag that starts in the frontmatter changes which
  `"` mermaid.js reads as `'`, found from the parser's reading of the
  frontmatter and of the attribute quotes.
- `c4-keyword-anywhere`: the parser detects a diagram type other than C4, and
  the diagram text from the detection point, read by the parser's lexer without
  its directives and comment regions, holds one of the four keywords that
  mermaid.js looks for anywhere.
- `bare-percent-line-before-header`: the parser's detection passes a bare `%%`
  line before the header.

A fixture marked `embedded-data-opaque` has no content check: the parser does
not read its embedded data. In gitgraph, embedded configuration can change
acceptance in either direction; the specified reading decides it. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/div-frontmatter-main-branch-checkout-default-accepted]

### Reference inputs

A reference input is an input with the form of its divergence, as the parser
finds it, taken out or replaced, and, for some divergences, with comment regions
or other forms taken out as well. The list above says how the reference inputs
of `directive-as-token-boundary` and `ignored-semicolon-as-token-boundary` are
made and compared, and the paragraphs below say it for the others; where the
parser and mermaid.js agree across the input and its reference input, the form
explains the difference on the input itself. For `click-reserved-word` and
`tokenless-empty-forms`, a removal can also change what lies around the removed
text, so the reference input is compared only where the specification gives it
the Db of the input, in the section The difference of the document of each
divergence; the paragraphs below say how the test decides it. For each case that
the corpus has, the test checks that a fixture it names falls in that case, so
that the check does not pass without comparing.

The reference input of `click-reserved-word` is the input without its comment
regions, without its empty forms (see `tokenless-empty-forms` below), and
without, for each `click` unit that does not start a click statement, the word
`click`, the whitespace after it, and the one whitespace character with which
the lexer leaves the click context that it entered, if there is one. The test
compares it where the specification gives it the Db of the input
([The difference](../../spec/docs/known-divergences/click-reserved-word.md#the-difference)),
and decides that with the parser: its lexer reads the reference input as the
units of the input other than the removed ones, with the click ids and
`click-comma` units of those `click` units read as units that start and end
where each of them does; the parser accepts it; and the text of each of those
click ids lies within the range of one leaf node of its tree. Where the parser
rejects it, a click id stands where the statement context reads it otherwise, as
the `,` of `subgraph a,b`, and nothing is compared. [fixture:
flowchart/db-subgraph-id-click-comma-blank-line]

The reference input of `tokenless-empty-forms` is the input without its comment
regions and without its empty forms: each empty string, each empty call from its
`call` to its `)`, each empty description block that is not a statement, from
its `accDescr` to its `}`, in a class diagram, each empty backquoted name and
each empty generic type, and in an ER diagram, each `empty-backquotes` unit,
which mermaid.js reads nothing for wherever it lies. An empty description block
is not a statement where it lies inside a statement, neither where a statement
starts nor before the separator of a statement or of the header, and is not held
by the `textBeforeBody` of a state statement. In an ER diagram, where nothing
separates two statements, a block lies inside a statement where the statement
before it has not ended, after a cardinality, a line, `:`, `:::`, `,`, or `[`,
or in the first list of names of a `class` statement, and where the unit after
the blocks continues that statement: a cardinality, `:::`, `{`, `[`, `:`, or
`,`. [fixture: er/div-empty-description-block-in-relationship] [fixture:
er/div-empty-description-block-in-class] [fixture:
er/gram-empty-description-block-between-names] In a Gantt chart, the empty href,
`href` and two `"` with nothing between them, is an empty form too, which
mermaid.js reads nothing for wherever it lies, as an empty call. Nothing
separates two statements there, and an empty description block lies inside a
statement only inside a click statement: between its ids and its first part, and
between its two parts, where the unit after the forms starts the second part.
[fixture: gantt/div-empty-href-before-call] [fixture:
gantt/div-empty-description-block-between-href-and-call] [fixture:
gantt/gram-empty-href-line] [fixture: gantt/gram-click-href-then-empty-href] In
a requirement diagram, an empty string is an empty form wherever it lies, as in
a flowchart. Nothing separates two statements there, and an empty description
block lies inside a statement where a unit of the statement before it follows
it: where that statement has not ended, after a unit that more of it must
follow, a kind of requirement, `element`, `:::`, `,`, the keyword of a field,
`:`, an arrow, or a relation, or after a name that more of its statement must
follow, the name of a requirement or an element and the classes after its `:::`,
a name that starts a relationship or a class shorthand statement, a name of the
first list of a `class` statement, and a name after `style` or `classDef`; and
where the unit after the blocks is a `,` after a class of a class shorthand
statement or of the second list of a `class` statement. A style ends at the line
feed that leaves the style context, so a block after it is a statement. On a
line of the body of a requirement or an element, a block is an item of the body.
[fixture: requirement/div-empty-string-line] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/div-empty-description-block-after-string-class] [fixture:
requirement/div-empty-description-block-before-shorthand-separator] [fixture:
requirement/div-empty-description-block-before-class-next-line] [fixture:
requirement/div-empty-description-block-before-shorthand-class-comma] [fixture:
requirement/div-empty-description-block-before-class-comma-next-line] [fixture:
requirement/gram-empty-description-block-after-shorthand-string-class] [fixture:
requirement/gram-empty-description-block-after-class-string-next-line] [fixture:
requirement/gram-empty-description-block-after-style-line] [fixture:
requirement/gram-empty-description-block-in-body] In a mindmap, the empty
string, the empty markdown string, the empty icon, an `::icon(` unit followed
directly by a `)` unit, and the empty class line, a `:::` unit that no
`class-text` unit follows, are empty forms wherever they lie; the diagram has no
empty description block. [fixture: mindmap/div-empty-string-in-shape] [fixture:
mindmap/div-empty-markdown-string-in-shape] [fixture:
mindmap/div-empty-icon-before-root] [fixture:
mindmap/div-empty-class-before-root] Whether a block is a statement is decided
without the empty forms before it that are left out, and blocks written one
after another, with only whitespace between them, are decided together, by what
follows the last of them: in `""accDescr {}` followed by a line break and `A`,
the block starts a statement once the empty string is left out, so it stays in
the reference input. [fixture:
flowchart/lex-empty-string-before-empty-description-block]

The test compares it where the specification gives it the Db of the input
([The difference](../../spec/docs/known-divergences/tokenless-empty-forms.md#the-difference)),
and decides that with the parser's lexer: it reads the reference input as the
units of the input other than those of the empty forms. There the parser must
accept the reference input: mermaid.js accepts the input and reads it as if its
empty forms were not there, so a reference input that the parser rejects is an
error, which the test reports with the fixture and the reason.

The two divergences share one reference input, so that an input with both forms,
such as `A[style:#x];cl%%{init: {}}%%ick B;b call cb()` in a flowchart, is
decided for each of them. The directives are left out first; then each `;` that
the line rule ignores is moved to the end of its line segment, where it is still
the last `;` of the segment, so the line rule still ignores it, and it lies
after the text of the segment, inside no token. mermaid.js and the specification
read the same diagram text in both inputs.

`html-tag-in-frontmatter` goes both ways, so the fixtures need no reference
input.

## The tree check

The [invariants](./positions.md#invariants) and what the documents of each
diagram type state about the tree are checked by `@mmd-toolkit/tests`
(`checkTree`), which lists the conditions that a tree breaks. It checks every
recorded tree of the corpus, and the tests of the parser use it on the trees of
their own inputs (`tests/helpers/tree-problems.ts`), which expect it to list
nothing.

The order of the child fields is the one that the section of each node type
states ([ast.md, Nodes](../../spec/docs/ast.md#nodes)): a tool that walks the
child fields in the order of `visitorKeys` meets the child nodes in source
order, but in a FlowchartLink with an opening arrow and a label, whose label is
written before its arrow and visited after it, in an AgentflowLink whose label
is written before its closing arrow, and in a GanttClickStatement whose link is
written before its call and visited after it. [fixture:
agentflow/gram-split-edge-id] [fixture: gantt/gram-click-href-then-call]
`tests/traverse.test.ts` reads the sentence of the child fields in the section
of each node type and checks that `visitorKeys` lists the same fields in the
same order for every node type. That the child nodes meet in source order in
that order is checked on every recorded tree by `@mmd-toolkit/tests`.

## Recorded parse results

What `parse()` gives for every fixture is recorded next to the fixture's input
in `packages/tests/fixtures/<diagram>/<fixture name>/`, and
`tests/fixtures.test.ts` compares the result with it:

- For an input that the parser accepts, `ast.json` holds the tree, as
  `JSON.stringify(root, null, 2)`, locations included.
- For an input that the parser rejects, `parse-error.json` holds the `message`,
  `range`, and `loc` of the `ParseError` (its `index` is the start of `range`).
  It records where the parser reports the rejection: for a known divergence, the
  form that causes it (see [`error-positions.md`](./error-positions.md)), and
  for an input that mermaid.js rejects as well, where the general rules put it.
  A rejection is thus recorded as fully as a tree, and a change of where it is
  reported shows as a change of the file.
- A fixture has one of the two. A test looks at the files alone and checks that
  no fixture has both.
- A change of any tree or error shows as a change of its file.
  `pnpm run test:update`, in `packages/parser`, runs the fixture test alone with
  `-u` and writes the files anew.
- A test checks that no `ast.json` or `parse-error.json` is left behind: in a
  directory without an input, or where the other file belongs.

### After adding fixtures

A fixture that `@mmd-toolkit/tests` adds has neither file until its result is
recorded, and a missing file fails the fixture test: the configurations of the
package and of the root of the repository set `update: "none"`, so a run, in CI
or not, writes no record unless one is asked for. Only two commands, run in
`packages/parser`, write the files: `pnpm run test:record` runs the fixture test
alone with `--update=new` and writes the missing files, and
`pnpm run test:update` runs it with `-u` and writes them all anew.

Whoever adds fixtures therefore:

1. writes the missing files once, in `packages/parser`: `pnpm run test:record`;
2. reads the new `ast.json` and `parse-error.json` files to see that the trees
   and the errors are what the specification says;
3. runs the checks of the corpus on the recorded trees, in `packages/tests`:
   `npx vitest run tests/check-tree-corpus.test.ts tests/db-from-tree.test.ts`;
   the parser tests pass with any recorded tree, so only these show a tree that
   breaks a condition or gives another Db;
4. commits them with the fixtures.

When a fixture is renamed or removed, its old files go with it. The test that
looks for files left behind names any that remain.

## Other tests

- Every example in the comments of the node types (`src/ast/flowchart.ts`,
  `src/ast/sequence.ts`, `src/ast/class.ts`, and `src/ast/state.ts`) is parsed.
  The range that its `^` marks show is compared with the range of the node.
- The example in the Usage section of the README is parsed, and the values and
  the tree it shows are compared with the result.
- Unit tests cover each rule of `common.md`, the detector table, `visitorKeys`
  (the order of the child fields too; see [The tree check](#the-tree-check)) and
  `traverseNodes`, the flowchart tree and its tokens, and the sequence tree, the
  class tree, and the state tree, their tokens, and the rejections outside their
  grammars.

`tests/agentflow.test.ts` checks, on named fixtures, the Name, comment, heading,
arrow, metadata, and click-prefix structures. Site maxEdges acceptance is
checked apart from parse(), as for flowchart.
`tests/ast-agentflow-examples.test.ts` checks all node comment examples, and
`tests/fixtures.test.ts` compares the records and the acceptance.

`tests/usecase.test.ts` checks, on named fixtures, declarations, native
metadata, arrow halves, single quotes, CSS padding and opaque JSON.
`tests/ast-usecase-examples.test.ts` checks all 26 node comment examples, and
`tests/fixtures.test.ts` compares the records and the acceptance.

`tests/pie.test.ts` checks, on named fixtures, hidden-form ownership,
common-value padding and nulls, duplicates, both quote kinds and double
conversion. The common fixture loop compares the atomic-boundary references with
the original expected Db (see [Known divergences](#known-divergences)).
`tests/ast-pie-examples.test.ts` checks all eight node comment examples.

`tests/info.test.ts` checks, on named info fixtures and common info detection
fixtures, all hidden-form owners, visible EOL, padding, nulls, repeats and
authored quoted text, and that the tree keeps the frontmatter of the fixtures
whose embedded data mermaid.js rejects and the specification keeps opaque. The
common fixture loop independently locates declared atomic cuts in reference
tokens and compares reference inputs with the original expected Db. [fixture:
info/div-directive-flag-middle] `tests/ast-info-examples.test.ts` checks all
seven node comment examples. [fixture: info/lex-flag-hidden-two] [fixture:
info/lex-hidden-without-flag] [fixture: info/lex-hidden-tail-two] [fixture:
info/lex-hidden-after-visible-eol] [fixture: info/title-tabs] [fixture:
info/lex-title-one-tab] [fixture: info/accdescr-line-repeat] [fixture:
info/title-open-quote] [fixture: info/div-frontmatter-invalid-yaml] [fixture:
info/div-frontmatter-html-invalid-yaml] [fixture: info/div-selected-showinfo]
[fixture: common/detect-minimal-info]

`tests/gitgraph.test.ts` checks, on named fixtures, hidden forms in the header,
option and trailing gaps, repeated options, written escapes, raw line padding,
nullable blocks, and passed bare lines kept as comments.
`tests/fixtures.test.ts` compares the records and the acceptance, including the
common detection fixture, and its common fixture loop checks atomic divergences
independently with reference tokens and readings. [fixture:
gitgraph/gram-all-fields] [fixture: gitgraph/div-directive-in-commit] [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
common/detect-minimal-git-graph]

Records contain the default parse(text) result. The outcomeOf helper applies
only site settings from fixture.config to the same source analysis, in either
acceptance direction. [fixture: gitgraph/config-main-branch] [fixture:
gitgraph/config-gitgraph-html-false] Frontmatter config and init-directive
arguments remain opaque: they do not change the default initial branch or
escaping for acceptance. These two fixtures therefore retain their default
checkout errors and are checked against their specified rejections. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/docs-syntax-gitgraph-2ea99686]

Conversely, default-accepted histories retain their trees when opaque embedded
settings make mermaid.js reject them. Their specified readings supply the Db
comparison. [fixture:
gitgraph/div-frontmatter-main-branch-checkout-default-accepted] [fixture:
gitgraph/div-frontmatter-main-branch-duplicate-default-accepted] [fixture:
gitgraph/div-init-main-branch-duplicate-default-accepted]

`tests/ast-gitgraph-examples.test.ts` checks all eighteen node comment examples.

Packet fixture records and acceptance are checked only by
tests/fixtures.test.ts, using fixtureAccepts and external site configuration in
outcomeOf. The default records keep parse(text)'s result even when site width
rejects that tree. [fixture: packet/config-fraction-reject] [fixture:
packet/config-frontmatter-overrides-site] Unit tests in tests/packet.test.ts
check, on named fixtures, authored block forms, hidden ownership and common
values. [fixture: packet/gram-mixed] [fixture:
packet/gram-hidden-range-gap-spaced] [fixture: packet/lex-hidden-two-suffixes]
[fixture: packet/title-repeat-empty] [fixture:
packet/error-single-rounded-end-wide] The ten node-comment examples are checked
by tests/ast-packet-examples.test.ts.

Radar records and acceptance are checked only by tests/fixtures.test.ts using
fixtureAccepts. The unit checks in tests/radar.test.ts check, on named fixtures,
authored comma groups, hidden-form ownership, both entry forms, token kinds,
repeated/empty common values and double spelling. The nineteen node-comment
examples are checked by tests/ast-radar-examples.test.ts. [fixture:
radar/gram-written-tree] [fixture: radar/lex-hidden-axis-comma] [fixture:
radar/lex-named-entry-hidden-across-lines] [fixture: radar/common-repeat-empty]
[fixture: radar/db-number-rounded] [fixture: common/detect-minimal-radar]

Treemap acceptance and records are checked only by tests/fixtures.test.ts, using
fixtureAccepts. Unit checks in tests/treemap.test.ts check, on named fixtures,
flat row indentation, composite boundaries, empty/repeated common values and
authored numeric/string readings. All nine node-comment examples are checked by
tests/ast-treemap-examples.test.ts. [fixture: treemap/gram-written-tree]
[fixture: treemap/db-leaf-tail-space] [fixture:
treemap/gram-indent-around-global-directive] [fixture:
treemap/common-repeat-empty] [fixture: treemap/db-number-multiple-dots]
[fixture: treemap/lex-string-conversion] [fixture:
common/detect-minimal-treemap]

`tests/wardley.test.ts` checks, on named fixtures, authored structure, component
tokens and named hidden-form ownership. `tests/fixtures.test.ts` checks
acceptance and records, including common Wardley detection cases.
`tests/ast-wardley-examples.test.ts` checks the 28 node type comment examples.
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]
[fixture: common/detect-minimal-wardley]

`tests/cynefin.test.ts` checks, on named fixtures, fields, hidden-form ownership
and component boundaries. Acceptance and records, including common detection
cases, belong to `tests/fixtures.test.ts`. `tests/ast-cynefin-examples.test.ts`
checks the eleven node-comment examples. [fixture: cynefin/db-all-fields]
[fixture: cynefin/hidden-domain-item-members] [fixture:
cynefin/hidden-all-unit-gaps] [fixture: common/detect-minimal-cynefin]

`tests/eventmodeling.test.ts` checks, on named fixtures, structure, token
spelling, ranges and hidden-form ownership. Acceptance and records belong to
`tests/fixtures.test.ts`, including the common detection fixture.
`tests/ast-eventmodeling-examples.test.ts` checks all 22 node comment examples.
[fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/lex-hidden-frame-optional-gaps] [fixture:
eventmodeling/lex-hidden-gwt-required-gaps] [fixture:
common/detect-minimal-eventmodeling]

`tests/treeview.test.ts` checks, on named fixtures, authored fields, assigned
indentation, box-form ownership, block payloads, node ranges and the positions
of errors after decorations. Acceptance and records, including the common
detection fixture, belong to `tests/fixtures.test.ts`.
`tests/ast-treeview-examples.test.ts` checks all thirteen node-comment examples;
ASCII display escapes are decoded before checking their marked source ranges.
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]
[fixture: treeview/ast-annotation-prefixes] [fixture:
common/detect-minimal-tree-view]

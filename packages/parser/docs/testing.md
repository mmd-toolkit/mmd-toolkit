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

`tests/fixtures.test.ts` parses every fixture in `common/`, `flowchart/`,
`sequence/`, `class/`, `state/`, `er/`, `gantt/`, `journey/`, `requirement/`,
`mindmap/`, `timeline/`, `sankey/`, `xychart/`, `quadrant/`, `block/`,
`kanban/`, `c4/`, `venn/`, `ishikawa/`, `agentflow/`, `usecase/`, `gitgraph/`,
and `pie/`, and checks:

- the parse result against the one that the fixture records for the parser (see
  [Recorded parse results](#recorded-parse-results));
- the acceptance and the diagram type against what the fixture records of
  mermaid.js, as the `knownDivergence` mark of the fixture asks: the result of
  mermaid.js without a mark, the result of the specification with one.

Neither the tree nor the Db is checked here: `@mmd-toolkit/tests` checks each
recorded tree (`check-tree-corpus.test.ts`; see
[The tree check](#the-tree-check)) and builds its Db and compares it with the Db
that the fixture records (`db-from-tree.test.ts`).

Kanban fixtures are checked by `tests/kanban.test.ts`: all 2,870 inputs are
compared with their recorded acceptance, applying the declared divergences and
`specified.json` where present. Accepted trees also check token/comment coverage
and exact token text. The parse records, including the common kanban detection
fixture, are compared by `tests/fixtures.test.ts`.

C4 fixtures are checked by `tests/c4.test.ts`: every corpus input is compared
with its recorded acceptance, applying the declared divergences and
`specified.json` where present. Accepted trees also check token/comment
coverage, exact token text, and child-node containment and source order.
`tests/fixtures.test.ts` compares their recorded parse results, including the C4
detection fixtures outside `c4/`. `tests/ast-c4-examples.test.ts` checks the
ranges and tree invariants in the type comment examples.

Venn fixtures are checked by `tests/venn.test.ts`: every corpus input is
compared with its specified acceptance, applying declared divergences and
`specified.json` where present. Accepted trees check token/comment coverage,
exact token text, raw literal text, and child-node containment and source order.
`tests/fixtures.test.ts` compares their recorded parse results, including the
common venn detection fixture. `tests/ast-venn-examples.test.ts` checks the
ranges in the type comment examples.

Ishikawa fixtures are checked and recorded by `tests/ishikawa.test.ts`: every
input is compared with its specified acceptance and declared divergence.
Accepted trees check token/comment coverage, exact token text, child-node
containment, and source order. `tests/fixtures.test.ts` also compares their
records, including the common Ishikawa detection fixture.
`tests/ast-ishikawa-examples.test.ts` checks the type comment example ranges.
The tests package's `checkTree` and `dbFromTree` validate the recorded trees and
their Db content.

`tests/architecture.test.ts` checks corpus-backed structure, token spelling and
ranges, gap ownership and comparable Db values. Acceptance and records,
including applicable common fixtures, are checked by `tests/fixtures.test.ts`.
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
- `click-reserved-word`: the parser rejects the input, and, where the three
  conditions of its reference input hold (see
  [Reference inputs](#reference-inputs)), must give the reference input what
  mermaid.js gave for the input, as above. Which `click` units start a click
  statement is found from the parser's units.
- `tokenless-empty-forms`: the parser rejects the input, and, where the parser's
  lexer reads its reference input as the units of the input but those of the
  empty forms and the parser accepts it (see
  [Reference inputs](#reference-inputs)), must give the reference input what
  mermaid.js gave for the input, as above.
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
text, so the reference input is compared only where the conditions below hold,
and the test requires the reference input of more than half of the marked
fixtures to be compared, so that the check does not pass vacuously.

The reference input of `click-reserved-word` is the input without its comment
regions, without its empty forms (see `tokenless-empty-forms` below), and
without, for each `click` unit that does not start a click statement, the word
`click`, the whitespace after it, and the one whitespace character with which
the lexer leaves the click context that it entered, if there is one. It is
compared where three conditions hold: the parser accepts it; the parser's lexer
reads it as the units of the input other than the removed ones, except the click
ids and `click-comma` units that the click contexts of those `click` units read,
whose text it may read as other units that start and end where each of them
does; and the text of each of those click ids lies within the range of one leaf
node of its tree. `A:click "" b-->C` becomes `A:b-->C`, with the vertex `A:b`
and its edge to C in both, and `subgraph click me` followed by an empty line
becomes `subgraph me`, with the id `me` in both. [fixture:
flowchart/db-vertex-id-bare-click] [fixture:
flowchart/db-subgraph-id-click-blank-line] Otherwise the removal joins what lies
on both sides, or puts the text of a click id where the statement context reads
it otherwise, and mermaid.js may read the reference input otherwise. Some joins
give the same Db: `subgraph click me`, a line break, and `A` becomes
`subgraph meA`, with the id `meA` in both, because mermaid.js joins the click id
and the next line in the same way. Others do not: in `subgraph click m;e`, the
`;` of the click id becomes a separator in the reference input `subgraph m;e`,
which has the id `m` instead of `m;e`, and in `subgraph click a,b` the `,`
becomes a `,` unit, which a name does not take, so mermaid.js rejects
`subgraph a,b`. [fixture: flowchart/gram-subgraph-name-click] [fixture:
flowchart/gram-subgraph-name-click-semicolon-in-id] [fixture:
flowchart/gram-subgraph-name-click-comma]

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
flowchart/lex-empty-string-before-empty-description-block] For one or more
blocks between `direction` and its value on one line in a class diagram, the
reference input also leaves out the whitespace around the blocks, so that
`direction` and the value form one word, as mermaid.js joins the two name parts:
`direction accDescr {} LR` has the reference input `directionLR`, and so has
`direction accDescr {}accDescr {}LR`. [fixture:
class/div-empty-description-block-between-direction-and-value] [fixture:
class/div-empty-description-blocks-between-direction-and-value]

It is compared where the parser's lexer reads it as the units of the input other
than those of the empty forms, and the parser accepts it: `A[""x]` becomes
`A[x]`, and `click A call ()cb` becomes `click A cb`. [fixture:
flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] Otherwise the removal joins
what lies on both sides of a form into other units, and mermaid.js may read the
reference input otherwise. In `style A "" fill:red`, the spaces before and after
the empty string become one `space` unit, so the style of the reference input is
`fill:red` instead of a space and `fill:red`. In `A:""::c`, `:` and `::` become
`:::`, so the reference input has the vertex `A` with the class `c` instead of
the vertex `A:::c`. `flowchart""TD` becomes `flowchartTD`, which mermaid.js
rejects. [fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

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

The order of the child fields is the parser's own: a tool that walks the child
fields in the order of `visitorKeys` meets the child nodes in source order, but
in a FlowchartLink with an opening arrow and a label, whose label is written
before its arrow and visited after it, and in a GanttClickStatement whose link
is written before its call and visited after it. [fixture:
gantt/gram-click-href-then-call] `tests/traverse.test.ts` checks this on the
tree of every fixture that the parser accepts, and that a tree whose child nodes
are out of order fails.

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
- A fixture has one of the two, or neither when its diagram type is not
  supported yet. A test looks at the files alone and checks that no fixture has
  both.
- A change of any tree or error shows as a change of its file.
  `pnpm run test:update`, in `packages/parser`, runs the fixture test alone with
  `-u` and writes the files anew.
- A test checks that no `ast.json` or `parse-error.json` is left behind: in a
  directory without an input, or where the other file belongs.

### After adding fixtures

A fixture that `@mmd-toolkit/tests` adds has neither file until the parser tests
run. Outside CI, the fixture test writes the missing file and passes. In CI
(`CI` set), a missing file fails the test.

Whoever adds fixtures therefore:

1. runs the fixture test once, in `packages/parser`:
   `pnpm run test tests/fixtures.test.ts`;
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

Agentflow fixtures are checked and recorded by `tests/agentflow.test.ts`, with
acceptance taken from expected.json or the declared divergence's specified.json
reading. The test checks character coverage, token boundaries, raw spelling,
child containment and source order, and the Name, comment, heading, arrow,
metadata, and click-prefix structures. Site maxEdges acceptance is checked apart
from parse(), as for flowchart. `tests/ast-agentflow-examples.test.ts` checks
all node comment examples, and `tests/fixtures.test.ts` compares the same
records.

Usecase fixtures are checked and recorded by `tests/usecase.test.ts`, with
specified.json taking precedence, unqualified divergence fixtures rejected, and
embedded-data-opaque fixtures accepted. It checks acceptance, character
coverage, exact token and raw text, node boundaries, child containment and
source order, and calls the corpus tree checker on every accepted tree.
Structure assertions cover native metadata, single quotes, CSS padding, arrow
halves and opaque JSON. `tests/ast-usecase-examples.test.ts` checks all 26 node
comment examples. The tests package supplies the tree checker and Db builder for
the separate corpus comparisons.

Pie fixtures are checked and recorded by `tests/pie.test.ts`: specified.json
takes precedence, opaque-data divergences accept, and other unqualified
divergence fixtures reject. Accepted trees check source coverage, token and raw
spelling, node boundaries, child containment and source order. The recorded Db
is compared directly with `dbFromTree`; atomic-boundary references are also
compared with the original expected Db. Structure checks cover hidden-form
ownership, common-value padding/nulls, both quote kinds and double conversion.
`tests/ast-pie-examples.test.ts` checks all eight node comment examples.

Info fixtures and common info detection fixtures are checked and recorded by
`tests/info.test.ts`, using `fixtureAccepts` and the specified reading when
present. Accepted trees check source coverage, exact token spelling, node
boundaries, child containment and source order; comparable Db values are checked
with `dbFromTree` and `embeddedValuesOf`, with opaque cases explicit. The common
fixture loop independently locates declared atomic cuts in reference tokens and
compares reference inputs with the original expected Db. [fixture:
info/div-directive-flag-middle] Structure checks cover all hidden-form owners,
visible EOL, padding, nulls, repeats and authored quoted text.
`tests/ast-info-examples.test.ts` checks all seven node comment examples.
[fixture: info/lex-flag-hidden-two] [fixture: info/lex-hidden-without-flag]
[fixture: info/lex-hidden-tail-two] [fixture: info/lex-hidden-after-visible-eol]
[fixture: info/title-tabs] [fixture: info/lex-title-one-tab] [fixture:
info/accdescr-line-repeat] [fixture: info/title-open-quote] [fixture:
info/div-frontmatter-invalid-yaml] [fixture: info/div-selected-showinfo]
[fixture: common/detect-minimal-info]

Gitgraph fixtures and their common detection fixture are checked and recorded by
`tests/gitgraph.test.ts`. Acceptance uses fixtureAccepts, with comparison Db
values supplied by dbFromTree and embeddedValuesOf; accepted opaque readings
remain explicit. Coverage, token/raw spelling, containment, source order and
node boundaries are checked on accepted trees. The common fixture loop checks
atomic divergences independently with reference tokens and readings. [fixture:
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
check source coverage, token/raw spelling, node boundaries, containment, source
order, authored block forms, hidden ownership and common values. Comparable Db
readings use dbFromTree and embeddedValuesOf; accepted default trees with a
site-rejected reading have no comparison Db. [fixture: packet/gram-mixed]
[fixture: packet/gram-hidden-range-gap-spaced] [fixture:
packet/lex-hidden-two-suffixes] [fixture: packet/title-repeat-empty] [fixture:
packet/error-single-rounded-end-wide] The ten node-comment examples are checked
by tests/ast-packet-examples.test.ts.

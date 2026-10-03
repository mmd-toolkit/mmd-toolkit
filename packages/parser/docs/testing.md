# Testing the parser

Japanese version: [testing.ja.md](./testing.ja.md)

The tests are in `tests/`. They check the parser against the fixtures of
[`@mmd-toolkit/tests`](../../tests), and run no generated inputs: what the
parser must do is stated by the specification and by the fixtures. Whether the
recorded trees keep the conditions of the specification and give the Db of
mermaid.js are checks of the corpus, which `@mmd-toolkit/tests` makes on the
recorded trees; the tests of the parser check that the parser gives those trees,
and run neither mermaid.js nor generated inputs. The explorations in
`tools/explore/` generate inputs and compare them with the pinned mermaid.js
(12.0.0); they are not tests (see
[Explorations against mermaid.js](#explorations-against-mermaidjs)).

## Fixtures

`tests/fixtures.test.ts` parses every fixture in `common/`, `flowchart/`,
`sequence/`, `class/`, and `state/`, and checks:

- the parse result against the one that the fixture records for the parser (see
  [Recorded parse results](#recorded-parse-results));
- the acceptance and the diagram type against what the fixture records of
  mermaid.js, as the `knownDivergence` mark of the fixture asks: the result of
  mermaid.js without a mark, the result of the specification with one.

Neither the tree nor the Db is checked here: `@mmd-toolkit/tests` checks each
recorded tree (`check-tree-corpus.test.ts`; see
[The tree check](#the-tree-check)) and builds its Db and compares it with the Db
that the fixture records (`db-from-tree.test.ts`).

## Known divergences

Every fixture marked with a
[known divergence](../../spec/docs/known-divergences.md) is also checked, with
the parser's own lexer, for the form of its divergence, and, for a divergence
that goes one way, with a reference input without that form. For a divergence
that goes both ways, the reading of the specification is recorded in the corpus
(`specified.json`, where it differs from `expected.json`): the acceptance and
the diagram type that the parser gives are compared with it, and the corpus
compares it with the Db built from the recorded tree.

- `directive-as-token-boundary`: the parser reads the input without its
  directives, and must give what mermaid.js gave for the input: the same
  acceptance, diagram type, and Db. The Db is built from the parser's tree as
  `@mmd-toolkit/tests` builds it from a recorded tree (`dbFromTree`), with the
  embedded values that the fixture records.
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
  rule, decided on the diagram text; both come from the parser's lexer.
- `comment-takes-line-break`: the class diagram has a diagram comment that
  follows a unit on its line, found from the parser's lexer and units.
- `name-start-reads-unit`: the class diagram has a backquoted name or a generic
  type whose text starts with `"`, `~` (in a backquoted name), `<<`, `>>`, or
  one of the keywords that the divergence names, found from the parser's
  `backquoted` and `generic-text` units.
- `html-tag-in-frontmatter`: a tag that starts in the frontmatter changes which
  `"` mermaid.js reads as `'`, found from the parser's reading of the
  frontmatter and of the attribute quotes.

### Reference inputs

A reference input is an input with the form of its divergence, as the parser
finds it, taken out or replaced, and, for some divergences, with comment regions
or other forms taken out as well. The list above says how the reference input of
`directive-as-token-boundary` is made and compared, and the paragraphs below say
it for the others; where the parser and mermaid.js agree across the input and
its reference input, the form explains the difference on the input itself. For
`click-reserved-word` and `tokenless-empty-forms`, a removal can also change
what lies around the removed text, so the reference input is compared only where
the conditions below hold, and the test requires the reference input of more
than half of the marked fixtures to be compared, so that the check does not pass
vacuously.

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
its `accDescr` to its `}`, and, in a class diagram, each empty backquoted name
and each empty generic type. An empty description block is not a statement where
it lies inside a statement, neither where a statement starts nor before the
separator of a statement or of the header, and is not held by the
`textBeforeBody` of a state statement. Whether a block is a statement is decided
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

`html-tag-in-frontmatter` goes both ways, so the fixtures need no reference
input, but the explorations below compare with mermaid.js on one: the input with
every `<` of its frontmatter replaced by `(`, so that no tag starts there. The
Db of the parser's tree is then built with the values that mermaid.js derived
from the embedded data of the reference input, so that a value from the
frontmatter, such as the title, is the same on both sides.

## The tree check

The [invariants](./positions.md#invariants) and what the documents of each
diagram type state about the tree are checked by `@mmd-toolkit/tests`
(`checkTree`), which lists the conditions that a tree breaks. It checks every
recorded tree of the corpus, and the tests of the parser and the explorations
use it on the trees of their own inputs (`tests/helpers/tree-problems.ts`),
which expect it to list nothing.

The order of the child fields is the parser's own: a tool that walks the child
fields in the order of `visitorKeys` meets the child nodes in source order, but
in a FlowchartLink with an opening arrow and a label, whose label is written
before its arrow and visited after it. `tests/traverse.test.ts` checks this on
the tree of every fixture that the parser accepts, and that a tree whose child
nodes are out of order fails.

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

## Explorations against mermaid.js

The explorations in `tools/explore/` look for what the fixtures lack. They are
not part of the tests: `pnpm run explore`, in `packages/parser`, runs them
(`tools/explore/vitest.config.ts`), when the lexing or the grammar of a diagram
type changes, and a difference from mermaid.js that they find is closed by a
fixture in the corpus, and by a sentence of the specification where it did not
state the reading. They compare `parse()` with the pinned mermaid.js through
`@mmd-toolkit/tests/mutation`: acceptance, the diagram type, and the Db summary
built from the tree, and, for an accepted input, the tree check (see
[The tree check](#the-tree-check)).

- The rules shared by every diagram are compared on generated inputs
  (`common-mermaid.test.ts`, `common-invariants.test.ts`).
- Each diagram type is compared on mutants of its fixtures, each one edit away
  from a fixture input (`<diagram>-mermaid.test.ts`). For the sequence diagram,
  the class diagram, and the state diagram, the same files insert comments, and
  for the state diagram lines, where a statement ends or starts.
- The places where the Db of the flowchart, the class diagram, and the state
  diagram reads text at the boundaries of the units are compared with
  whitespace, directives, and comment lines put at every place of such a
  statement (`<diagram>-source-reading.test.ts`), and the entities with an
  entity put at every position of a link text and an ellipse label
  (`entity-units.test.ts`).
- The state diagram is also compared with texts put at the places of the fixture
  inputs, chosen by the kinds of the places that `@mmd-toolkit/tests` finds
  (`state-insertions.test.ts`, `insertions.ts`): each string of each family at
  one place of each kind of boundary and of place inside a token, sequences and
  the diagram's own lines at one place of each kind at the end of a line, and
  one string at a second place of each kind, in another fixture.

The parser does not tell the known divergences apart, so the explorations
declare them, by the rules of `tests/helpers/known-divergences.ts`, which
`tests/fixtures.test.ts` uses for the marked fixtures too. Every declared
difference is checked:

- a rejection for a directive must go away without the directives;
- a rejection for a `click` that does not start a click statement, or for an
  empty form, must give, where the parser accepts the reference input, what
  mermaid.js gave for the input;
- a difference that goes both ways must be what mermaid.js gives for the
  reference input, for `html-tag-in-frontmatter` (see
  [Reference inputs](#reference-inputs)), or for the input with the rules of its
  lexer that the divergence names changed, for `comment-takes-character`,
  `comment-takes-line-break`, and `name-start-reads-unit`;
- a rejection of a class diagram whose first unit is not its header
  (`headerless-empty-ending`, which goes one way and has no reference reading)
  must be of an input that mermaid.js accepts; the parser's lexer decides it;
- a rejection of mermaid.js for embedded data must be one of the errors that the
  specification lists, and a difference in the Db or in the diagram type is
  never put down to embedded data.

---
name: parser
description:
  Implement a diagram type in @mmd-toolkit/parser from the specification and the
  fixtures only. This covers its node types, its hand-written lexer and
  recursive-descent parser, the tests on the fixtures, and the recorded trees.
  It also covers recording and checking the parse result of each fixture (its
  tree in ast.json, or its error in parse-error.json), finding gaps in the
  specification, and fixing the parser when the pinned mermaid.js is updated.
  Use when a diagram type is added to the parser, when fixtures are added or a
  rule of the specification changes, or when mermaid.js is updated.
---

# Adding the parser of a diagram type (parser)

The steps of the work on `@mmd-toolkit/parser`: implementing a diagram type from
the specification alone (its lexer, its recursive-descent parser, the tests on
the fixtures, the recorded trees), following added fixtures and changed rules,
and updating the pinned mermaid.js. It is written so that the same quality is
reached without the history of earlier work. The policies and criteria of the
package are in the section Policies and criteria; what holds for every package
is in AGENTS.md and in the skill `conventions`. The examples are those of the
flowchart; the steps do not depend on the diagram type.

## Policies and criteria

`packages/parser`:

- Is the reference implementation of the specification. Every behavior it
  implements comes from the specification (`docs/common.md`, `docs/ast.md`,
  `docs/ast/*.md`, `docs/diagrams/*.md`) and the fixtures. mermaid.js's source
  may be read to check what the specification says, never as the source of a
  behavior to implement. When the specification is silent on something, the
  parser does not fill the gap from mermaid's code; it reports the gap to the
  specification's owner.
- Implements the AST as TypeScript types with the same node names and field
  names: the shared part of `docs/ast.md` in `ast.ts`, and each diagram's nodes
  of `docs/ast/<diagram>.md` in `ast/<diagram>.ts`.
- Diagram-type detection and dispatch to per-diagram parsers.
- Per-diagram parsers are hand-written lexers and recursive-descent parsers. No
  parser generators.
- The tests on the fixtures: the parse result of each fixture equals the one
  recorded next to it (`ast.json` or `parse-error.json`), and the acceptance
  agrees with mermaid.js as the marks of known divergences ask. The recorded
  trees are checked by `@mmd-toolkit/tests`: the conditions of the tree
  (`checkTree`), and the Db that it builds from them against the Db that each
  fixture records. The tests run neither mermaid.js nor generated inputs, and no
  command of this package does. Each sentence of the parser's documents that
  defines a behavior has a fixture for each case it distinguishes and for each
  other rule that meets it at its place (AGENTS.md, Principles); a case that the
  corpus lacks is closed by a fixture.

## 1. What to read first

1. The section Policies and criteria of this document (implementing from the
   specification alone, not taking behavior from the source of mermaid.js);
   "Shared interfaces" and "Principles" in AGENTS.md (readability, the proper
   form); and the skill `conventions` (no regular expressions, invisible
   characters, the documents). The criteria change, so read them for each piece
   of work.
2. `packages/parser/docs/development.md` (how the parser is built, and the
   tools), `docs/tokens.md` and `docs/positions.md` (the tokens, the positions,
   and the invariants of the tree), `docs/testing.md` (what the tests check),
   and `docs/error-positions.md` (where a `ParseError` points).
3. The specification: `packages/spec/docs/common.md`, `ast.md`, `detection.md`,
   `diagrams/<diagram>.md`, and `ast/<diagram>.md`, and the fixtures in
   `packages/tests/fixtures/<diagram>/`. The behavior to implement is only what
   these hold.

## 2. The working tree

- The steps of this skill write `packages/parser` and the `ast.json` and
  `parse-error.json` files in `packages/tests/fixtures/<diagram>/<fixture>/`,
  which the fixture test writes. They do not write the other files of a fixture,
  the specification, or the other packages; when one of those must change,
  change it with the steps of that package's skill (spec, tests,
  prettier-plugin).
- The configuration at the root (`package.json`, `pnpm-lock.yaml`,
  `tsconfig.json`, `eslint.config.mjs`, `prettier.config.js`,
  `vitest.config.ts`, `.github/workflows/`, `scripts/`) is used by every
  package. Before changing it, check what the change does to the other packages.
- Do not commit, change what is staged, or use `git mv`, `stash`, `checkout`, or
  `reset`; move and delete files with plain `mv` and `rm`.
- Do not edit a tracked file for a while to change how a check runs, such as the
  number of inputs of a test. When the working tree is shared with other work,
  the file can be staged in that state, and a run that is cut off never restores
  it.
- The Write tool and shell here-documents can turn an escape such as `\u00a0`
  into the real character. The sources and tests of `packages/parser` are ASCII
  only (every other character is written as an escape), except a readable
  character in a comment of `src/code-points.ts` that shows which character a
  constant is (`// À`). So after writing, check with these two commands, at the
  root; the first may print only those comments, and the second nothing:

  ```sh
  grep -rnP '[^\x00-\x7e]' packages/parser/src packages/parser/tests packages/parser/tools
  node scripts/check-invisible-chars.mjs
  ```

- Read the result of `eslint --fix`: it can add empty JSDoc or meaningless
  comments. Turn off a lint rule with `eslint-disable` only where that is right
  by the intent of the rule, with the reason
  (`eslint-comments/require-description` asks for it).
- The tests are heavy. Under a high load (a load average of `uptime` above the
  number of CPUs) a test file can time out. When one does, run that file alone
  before judging. Run long checks in the background, with the output in a file
  outside the repository. When the working tree is shared with other work, stop
  only what you started, by its task id or process id; never by name
  (`pkill -f vitest` stops the runs of others too).

## 3. How to check (in every piece of work)

- Check every claim about the behavior of mermaid.js, your own or another's,
  before writing it. The tests of the parser run neither mermaid.js nor
  generated inputs: they hold the parser to what the fixtures record. When a
  claim needs mermaid.js, run it in a probe outside the repository (in the
  scratchpad), a script run with `node --conditions=source` that imports
  `runMermaidWithEmbeddedData` and `dbFromTree` from the sources of
  `packages/tests`: the first gives the acceptance and the Db of mermaid.js for
  an input, the second the Db built from the parser's tree of the same input.
  What the probe shows goes into the corpus and the sentences, and the probe is
  not kept: an input that a sentence needs becomes a fixture, which the tests
  package adds when given the input and the sentence (the tests skill), or which
  you add with the fixtures CLI and report to the tests package:

  ```sh
  pnpm --filter @mmd-toolkit/tests run fixtures:add <diagram> <name> --note "<the sentence and the case>" < input.mmd
  ```

  An example for a test or a comment is such an input too: in the flowchart, an
  example written by hand for a test was rejected by mermaid.js, because its
  line feed left the click context.

- When a sentence of the parser's documents that defines a behavior is written
  or changed, list the cases that it distinguishes and the other rules that meet
  it at the place that it names (a directive, an ignored `;`, a comment line, an
  empty line, a line separator, an empty description block), and ask for a
  fixture of each case that the corpus lacks (AGENTS.md, Principles). More
  assurance comes from a case that is missing, never from more inputs of a case
  that is there.
- In every result, show for each claim whether it was checked by running
  something, checked by reading code or documents, or not checked.
- For a requested performance review of a newly supported diagram or an existing
  parser, use
  [parser-performance-review](../parser-performance-review/SKILL.md). Its
  standalone measured reproductions are review reports, separate from the
  fixture-based conformance tests described here.
- Run what a change can affect (the skill `conventions`, Running tests). While
  working, run the test files that go with the changed part of the code, in
  `packages/parser` (`npx vitest run <files>`; a diagram's part of
  `tests/fixtures.test.ts` with `-t "<diagram> fixtures"`):

  | Changed part                                                                  | Test files                                                                                                                                                           |
  | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `src/diagrams/<diagram>/`                                                     | `tests/<diagram>.test.ts`, `tests/fixtures.test.ts`                                                                                                                  |
  | `src/ast.ts`, `src/ast/<diagram>.ts`, `src/visitor-keys*`                     | `tests/types.test.ts`, `tests/traverse.test.ts`, `tests/ast-<diagram>-examples.test.ts`, `tests/union-docs.test.ts`, and for flowchart `tests/ast-flowchart.test.ts` |
  | `src/unit-grammar.ts`, `src/empty-forms.ts`, `src/diagram-*.ts`               | `tests/<diagram>.test.ts` of every diagram, `tests/diagram-parsing.test.ts`, `tests/fixtures.test.ts`                                                                |
  | the common rules (`src/source-lexer.ts`, `directives.ts`, `entities.ts`, ...) | the test file of the same name, `tests/fixtures.test.ts`                                                                                                             |
  | `src/diagrams/flowchart/subgraph-ids.ts`                                      | `tests/fixtures.test.ts`                                                                                                                                             |
  | `src/parse.ts`, `src/index.ts`                                                | `tests/parse.test.ts`, `tests/readme-example.test.ts`                                                                                                                |
  | `tests/helpers/reference-inputs.ts`, `tests/helpers/known-divergences.ts`     | `tests/reference-inputs.test.ts`, `tests/fixtures.test.ts`                                                                                                           |

  The tests that read documents, which a change of those documents alone also
  runs: `tests/readme-example.test.ts` (the example of `README.md` and
  `README.ja.md`), `tests/types.test.ts` (the documents of
  `packages/spec/docs/known-divergences/`), and the tests of the examples and
  the unions in the comments of `src/ast.ts` and `src/ast/*.ts`
  (`tests/ast-<diagram>-examples.test.ts`, `tests/union-docs.test.ts`). The
  whole suite is run as 4.8 says.

## 4. Adding a diagram type

### 4.1 Input

- The specification of the diagram is written: the sections of
  `packages/spec/docs/diagrams/<diagram>.md` (Detection, Lexical structure,
  Grammar with its Rejections outside the grammar, and Known divergences) have
  no "To be written", and `packages/spec/docs/ast/<diagram>.md` exists (the spec
  skill).
- The fixtures of the diagram, its Db summary
  (`packages/tests/docs/db-from-tree/<diagram>.md`), and the checks of its
  recorded trees exist in `packages/tests` (the tests skill).

### 4.2 Reading the specification, and its gaps first

1. Read `diagrams/<diagram>.md` and `ast/<diagram>.md` through, and list the
   units of implementation outside the repository: the lexical rules, the
   productions of the grammar, the fields of the nodes, the token kinds.
2. For each line of the list, check that the text of the specification and the
   fixtures decide the implementation in one way. What they do not decide, where
   the specification and a fixture disagree, and where mermaid.js (section 3)
   disagrees with the specification, is a gap in the specification. Do not fill
   it from the source of mermaid.js; fix the specification first, with the input
   and the result of mermaid.js (the spec skill, "When a gap in the
   specification is found"). Examples from the flowchart: an entity in a context
   that reads one character at a time; the token kind of a `click` in a subgraph
   name; the `,` of the click context, which had the same unit name as the `,`
   of the statement context.
3. While a gap is open, implement what it does not touch.
4. The specification can change while you work, also on what you have built
   already (in class, two fields of a node were renamed and one was removed
   during the work). Keep a copy of the documents as you read them, outside the
   repository, and before the checks of 4.8, compare the documents with the copy
   and implement what changed.

### 4.3 Node types and wiring

Add them in this order; the flowchart files are the model.

1. `src/ast/<diagram>.ts`: the nodes of `ast/<diagram>.md`, with the same names
   and fields. The JSDoc of each type names the section of the specification and
   has an example of the syntax with a line of `^` under it for the node's
   range. Add the union of the diagram's nodes (in the flowchart,
   `FlowchartNode`).
2. `src/ast.ts`: add the body node of the diagram to `DiagramBody`.
3. `src/visitor-keys/<diagram>.ts`, spread into `src/visitor-keys.ts`.
4. `src/index.ts`: export the types. The `parse()` API is a shared interface
   (AGENTS.md); show the exported types in the result, since prettier-plugin and
   eslint-plugin build on them.
5. `src/parse.ts`: the `case` of the diagram type ids, calling the diagram's
   parser. Several ids can share one parser (the flowchart has `flowchart-v2`,
   `flowchart-elk`, and `swimlane`). From then on, the diagram type is parsed
   wherever the tests met it as an unsupported type: an example of an
   unsupported type in `tests/parse.test.ts` changes to another type that is
   still unsupported, and the fixtures of this type are recorded as trees (4.7).

### 4.4 The lexer

1. Put the entry in `src/diagrams/<diagram>/index.ts` as
   `parse<Diagram>Diagram(input: DiagramInput): Root`. It opens the diagram text
   with `openDiagramText(input)`, divides it into units with the lexer, makes
   the statements and tokens with the grammar, and passes them to
   `finishDiagram()`. The smallest model is `src/diagrams/error.ts`.
   `finishDiagram()` checks the promises of the tokens, records the tokens with
   the `Directive` tokens and the tokens of the frontmatter, and builds the
   `Root`. A `;` that the line rule ignores is an `IgnoredSemicolon` token in
   every diagram, which the shared lexer records; the diagram gives it no kind.
   The shared lexer cuts a token at a directive and at such a `;` inside it, and
   rejects the input where the token is of a kind that may not be cut, any kind
   but `RawText` and `String` (`SourceLexer.recordTokens`); the diagram does not
   decide this again.
2. The common rules (directives, comment regions, the `style` and `classDef`
   line rule, entities, line terminators, HTML attribute quotes) are already
   applied, at each position, by `DiagramTextReader`; the diagram's lexer reads
   the positions it returns one by one. Do not write the common rules again in
   the diagram. When the diagram document adds a rule of how its text is read,
   wrap the reader in one of the shape `DiagramText` (in the flowchart,
   `FlowchartText`, which reads the whitespace after `}`). Do not make a derived
   text, such as the text without directives, as an intermediate result: in the
   flowchart, a structure that copied the preprocessing passes of mermaid.js was
   built and rebuilt.
3. A rule that the document of another diagram states too (the direction line of
   flowchart and class, with their own lists of values) has one implementation,
   shared by both (`src/direction-line.ts`); move it out of the first diagram
   when the second needs it, and do not write it again.
4. For each context of the Lexical structure, write one method per rule, in the
   order of the specification (in the flowchart, `readInClickContext` and
   `readArrow`). The JSDoc names the section and the rule. Represent the
   specification's lexical contexts with a stack. The lexer extends `UnitLexer`
   (`src/unit-lexer.ts`), which keeps the stack, applies the rules of the
   current context to the end of the text, and throws when the text ends in a
   context that may not end there. Each diagram gives its
   `END_OF_TEXT_MESSAGES`, which `UnitLexer` takes: for each context, the
   message of that error or null. It also gives its `addUnit` and
   `readInContext`. Keep in the diagram only what its document says differently,
   not another way of writing the same thing. Compare characters with the
   constants of `src/code-points.ts`, `src/character-classes.ts`, and
   `src/scanning.ts`; no regular expressions.
5. A unit has the name of the specification. Build it with `readUnit` of
   `src/diagram-units.ts`; the diagram's `Unit` is `DiagramUnit<UnitName>`, with
   fields of its own only where the diagram needs them (in the flowchart, a
   string unit has the range of its content). What the lexer decides while it
   matches a unit and a node holds goes on the unit, so that the grammar does
   not read the text a second way: an arrow unit has the markers and the line of
   its arrow, and in the flowchart the number of its line characters.
6. Where the lexer is case-insensitive (in sequence, every rule), compare words
   with `matchWordIgnoringCase` and `matchWholeWordIgnoringCase` of
   `src/scanning.ts`, which follow Notation, not with lower-casing.
7. When the diagram's lexer reads comments of its own (diagram comments; in
   sequence, `#` and `%` to the end of the line), it returns their ranges and
   where their values start, and the entry passes them to `finishDiagram()` in
   `DiagramAnalysis.comments`; the common part records them in `Root.comments`
   with the directives inside them. The mark of a diagram comment is defined by
   the diagram document.
8. So that the test helpers read the same units, add an entry that is not
   public, `lex<Diagram>(input)`, which returns what the helpers need: the
   diagram text, the units, and where the lexer left a context, for example (in
   the flowchart, `lexFlowchart`; in sequence, `lexSequence`, which also returns
   where the rules of the statement context start their matches, for the places
   of `comment-takes-character`).
9. In a context whose rules read one character at a time, read the placeholder
   of an entity as one unit (common.md, Entities; in the flowchart,
   `afterOneCharacter`).
10. Where no rule matches, throw `ParseError` with that character as the range
    (`docs/error-positions.md`). Where no rule matches only because the text
    ends (only whitespace follows, such as the line feed that the lexer reads
    after the last character), report the end of the text in that context
    instead, at what entered it: in state, `scale 3` was reported as an
    unexpected character with an empty range, at the line feed after the text.
    Keep the contexts that the text may not end in, with their messages, in the
    diagram's `END_OF_TEXT_MESSAGES`, the table over all contexts that
    `UnitLexer` takes (step 4).

### 4.5 The grammar

1. A recursive descent over the units, one method per production of the Grammar,
   whose JSDoc names the production. The grammar extends `UnitGrammar` of
   `src/unit-grammar.ts`, which reads the units (`take`, `takeIf`, `peek`),
   places a node (`placeOf`, `placeFrom`), reads the written text of a value,
   makes the shared leaf nodes, the tokens of an item (`addItem`), and the error
   for a unit that the grammar cannot read (`unexpected()`), with the empty
   forms; the diagram adds its productions and `knownDivergenceAt()`, which
   looks for the cause that a known divergence names (in the flowchart, a
   `click` and an empty form after the `space` units; in sequence, an empty
   form; in class, an empty form, or the unit after an empty generic type). The
   range of a unit's token is `significantRangeOf` of `src/diagram-units.ts`:
   the unit without its whitespace, unless the lexer reads the unit with other
   `UnitEnds`, for the units whose tokens keep whitespace that mermaid.js reads
   as part of a value, which the Tokens section of the parser's
   `docs/tokens/<diagram>.md` names (in sequence, the `title-text` unit of
   `title`, and the box text; in class, the generic text, a backquoted name that
   is not closed, and the parts of a member line, whose division gives each its
   exact range). Where the tokens of an item break is `breaksRun()`: between
   units of other items; a diagram whose whitespace belongs to no unit also
   breaks a run where characters lie between two units (in state, except in a
   `RawText` item, whose token holds the whitespace inside it; in class, the
   items whose tokens are the runs without whitespace, a style and a name of
   name parts, take them from `runsWithNothingBetween()`).
2. The grammar makes the nodes and the tokens (`PendingToken`), with the token
   kind of each item. Take the kinds from the Tokens section of the parser's
   `docs/tokens/<diagram>.md`.
3. The grammar reads every unit; none is skipped. Text that mermaid.js does not
   read is a node where the tree has a place for it; a unit that cannot be
   written where it stands is taken by no rule, so the input is rejected, and
   the error names the form and says where it cannot be written (in the
   flowchart, the empty forms of `tokenless-empty-forms`: empty strings, empty
   calls, and empty description blocks that do not start a statement). They are
   found in one place that the grammar and the test helpers of every diagram
   share, `src/empty-forms.ts`; in sequence, the empty description block is the
   one such form. A unit can still lie in the range of a node and belong to no
   field (in the flowchart, the `call` and the parentheses of a callback in a
   click statement); the specification says where.
4. The value of a leaf node is its written text: the source text of the value
   without the directives, the comment regions, the `;` that the line rule
   ignores, and the empty description blocks that are statements of their own
   (`ast.md`, Nodes; `SourceLexer.textOfRange`). Nothing is converted.
   `StringLiteral` and `NumericLiteral` also have `raw`. The name of an
   `Identifier` is the texts of its tokens joined (`identifierOf`, which takes
   the pieces of its item from `SourceLexer.piecesOf`, the same pieces that the
   tokens are recorded as), so the whitespace between them is not part of it.
5. When the specification lists rejections outside the grammar (made while the
   Db is built), the parser makes them too: in the flowchart, the grammar finds
   a subgraph member after `hasOwnProperty` (`subgraph-members.ts`); in
   sequence, a walk over the statements after the grammar keeps what the Db
   would hold of the participants (`db-rejections.ts`). Where the specification
   does not say which of several waiting statements a check applies to (in
   sequence, two `create` before one message), check with mermaid.js (section 3)
   and report it as a gap.
6. For a new kind of rejection, decide the range of the `ParseError` and add a
   line to `docs/error-positions.md` and its `.ja.md`.

### 4.6 Tests

Use `tests/usecase.test.ts` for corpus-backed structure, token spelling and
range checks, `tests/agentflow.test.ts` for retained ignored text, and
`tests/ast-usecase-examples.test.ts` for node-comment examples. The files to
add, or to add a `case` of the diagram to:

| File                                   | What to add                            |
| -------------------------------------- | -------------------------------------- |
| `tests/helpers/node-types.ts`          | the `Record` of every node type        |
| `tests/types.test.ts`                  | the union of `Node`                    |
| `tests/helpers/recorded-diagrams.ts`   | the diagram in `RECORDED_DIAGRAMS`     |
| `tests/ast-<diagram>-examples.test.ts` | the examples in the node type comments |
| `tests/helpers/reference-inputs.ts`    | the diagram's units for the references |
| `tests/<diagram>.test.ts`              | unit tests of the tree and tokens      |

Use these test steps for every diagram type. Pre-record probes (4.7) and
`tests/fixtures.test.ts` use `fixtureAccepts` from `@mmd-toolkit/tests` for
acceptance. Its shared `DIVERGENCE_PROPERTIES` table defines each identifier's
acceptance direction and specified-reading requirement. A missing required
`specified.json` is an error that fails the probe or test. Specified readings
decide acceptance when present; unmarked fixtures use `expected.json`.

For `embedded-data-opaque`, follow the specified reading in either acceptance
direction and retain the derived title and unaffected embedded values supplied
for Db comparison.

A test of the parser compares a Db only for a reference input, whose tree no
record holds: the token-cut reference readings that `expectDivergenceForm`
checks, and the reference inputs under "marked fixtures differ only by their
divergence" in `tests/fixtures.test.ts`. It compares the Db of the reference
input's tree with the Db that mermaid.js gave for the fixture's input,
`fixture.expected.db`, using `embeddedValuesOf(fixture, fixture.expected)` and
`dbOfTree`. When mermaid.js gave the input no Db (`db` is null), nothing is
compared. Do not substitute written embedded settings for those derived values,
including secure keys that the specification says are removed.

The common fixture loop calls `expectDivergenceForm` in
`tests/helpers/divergence-form.ts` for every supported diagram to check declared
forms and their token-cut reference readings independently of acceptance.

For corpus-backed cases, package tests cite and load fixtures by diagram and
name instead of keeping copies of their inputs and expectations in a local
fixture corpus.

Steps:

1. Only `tests/fixtures.test.ts` writes the corpus records. It compares each
   parse result with its record and checks acceptance with the shared helper
   above (4.7). That the recorded trees keep the conditions of the tree and give
   the Db of mermaid.js is a check of the corpus, which `@mmd-toolkit/tests`
   makes on every recorded tree (`check-tree-corpus.test.ts` and
   `db-from-tree.test.ts`); no test of the parser parses the fixtures again to
   check them. A diagram test names the fixtures of the cases that it checks and
   states what their trees hold; `tests/helpers/tree-problems.ts` wraps the
   check of the tree conditions (`checkTree`) for such a test. When
   `db-from-tree.test.ts` fails for a recorded tree because its accepted reading
   has no embedded values to build the Db with, report it to the specification
   with the input and the recorded reading.
2. Find where text outside a node's range decides a reading. Example from the
   flowchart: the name text of a subgraph runs to its separator, and where empty
   description blocks follow the name, the whitespace between them lies outside
   every node. A unit that is all whitespace at the end of a statement lies
   after the range of the statement, which ends at its last token; find it from
   the units next to a unit of the statement, not inside the range. Each such
   place is a case of the sentence that defines the range: ask for a fixture
   with whitespace, a directive, a comment line, and a `click` at it (section
   3).
3. Every input that was once read wrong becomes a fixture of the corpus: give it
   to the tests package with a note on the failure (the tests skill).

### 4.7 Recorded parse results

The parse result of every fixture is recorded next to its input: the tree of an
accepted input in `ast.json`, and the `message`, `range`, and `loc` of the
`ParseError` of a rejected one in `parse-error.json` (`docs/testing.md`,
Recorded parse results). The fixture test compares each result with its file. A
rejection is thus recorded as fully as a tree: where the parser reports it is
part of the result.

Records contain the default `parse(text)` result, while
`outcomeOf(fixture.input, fixture.config)` applies only external site settings
for acceptance without adding configuration parameters or options to `parse()`.

1. Write and read these files only for fixtures whose rules are implemented. Run
   earlier, the fixture test writes the result of the current parser, which is
   wrong, and it then passes as recorded. Before writing, use `loadFixtures`,
   `fixtureAccepts`, `embeddedValuesOf` and `dbFromTree` to probe the diagram's
   fixed fixtures and applicable common detection fixtures, then inspect the
   trees and tokens of each sentence's cases against the specification (4.6).
   Report each undecided input and its question without recording it.
2. Inventory missing records and run `tests/fixtures.test.ts` once outside CI,
   in `packages/parser`, without `-u`; it writes the missing files (in CI, a
   missing file fails). Use `-u` only for a change that changes existing results
   (step 4):

   ```sh
   pnpm run test tests/fixtures.test.ts
   ```

   Scope the run to an already probed diagram with `-t "<diagram> fixtures"`,
   without temporarily editing tracked tests.

3. Read the new results against the specification, in `packages/parser`:

   ```sh
   pnpm run show-trees <diagram> <fixture> <fixture>
   ```

   It prints each node with its plain fields, its value, its range, and the
   source text of the range when that differs from the value, and then the
   tokens (`docs/development.md`, Tools). Read a new `parse-error.json` as it
   is: its `range` must be where `docs/error-positions.md` puts the rejection,
   for a known divergence the form that causes it, with a message that names the
   cause. When the expected results are known, show them and the results side by
   side in the result, fixture by fixture. When a fixture that should be
   accepted is rejected, or the reverse, do not keep its file, and show that.

4. Use `-u` only for a change that changes existing results. Before such a
   change, copy the fixtures to a new directory outside the repository; after
   the change, rewrite the files with `pnpm run test:update`, which runs
   `tests/fixtures.test.ts` alone with `-u`, and classify the differences, in
   `packages/parser`:

   ```sh
   cp -R ../tests/fixtures/<diagram> <directory>/ast-before
   pnpm run test:update
   pnpm run diff-trees <directory>/ast-before <diagram>
   ```

   Every missing record that `test:update` would write must have been probed.
   Compare serialized records or their byte hashes, not a live tree against
   parsed JSON, and separate new, changed and removed results.

   It prints the files that are new or removed, how many fixtures have each kind
   of difference, the same field of the same node type or of the error, and then
   each difference. Every kind must be explained by the change; if one is not,
   do not accept the result of `-u`, and look into it. A fixture that the change
   makes rejected gets a `parse-error.json`, and its old `ast.json` is left
   behind, which the test that looks for files left behind names; delete it with
   `rm` (and the reverse for a fixture that becomes accepted). `-u` also writes
   the result of every fixture that has none, including fixtures added meanwhile
   for rules not implemented yet; each `new:` line must be a fixture whose rule
   is implemented, and the file of any other is deleted (step 1). Show the
   number of fixtures of each kind in the result. A node whose fields the Db
   does not read shows a wrong change only here (in state, a floating note id
   that a careless edit made end at its first character; the value strings of
   the leaf nodes and the position of a state note are such fields). A snapshot
   comparison alone establishes repeatability, so retain independent
   tree-condition and Db checks when records are rewritten. Complete the parser
   build before starting checks that import its `lib` output, then run the
   corpus checks in `packages/tests`:

   ```sh
   npx vitest run tests/check-tree-corpus.test.ts tests/db-from-tree.test.ts
   ```

### 4.8 Checks before finishing

In `packages/parser`:

```sh
CI=true pnpm run test
```

In `packages/tests`, the checks of the corpus on the recorded trees (4.7, step
4):

```sh
npx vitest run tests/check-tree-corpus.test.ts tests/db-from-tree.test.ts
```

At the root:

```sh
npx tsc --noEmit -p tsconfig.json
npx eslint packages/parser
pnpm --filter @mmd-toolkit/parser build
pnpm run lint
pnpm run format:check
```

Run the whole suite once, before the work is reported as done, not after each
change. It runs no generated inputs (the skill `conventions`, Running tests).

The work is done when every fixture passes the fixture test, the recorded trees
pass the tree check of `@mmd-toolkit/tests` and give the Db that the corpus
records, and every sentence that the work wrote or changed has a fixture for
each of its cases (section 3).

### 4.9 Documents

Change the `.md` and the `.ja.md` in the same change.

- `packages/parser/README.md`: the supported diagrams, and the links to the
  specification for the types.
- `docs/development.md`: what is implemented, and how the diagram's parser is
  built.
- `docs/testing.md`: the list of fixtures, and what the tests of the diagram
  check.
- `docs/error-positions.md`: the positions in the diagram.

Run `npx prettier --write` on them, and pass `pnpm run lint:docs` and
`pnpm run format:check`. Write the line breaks of a `.ja.md` as the skill
`conventions` says.

### 4.10 Output

Show as the result: what was implemented, file by file; the gaps in the
specification that were found, and which of them are still open; the number of
tests and their results; the number of recorded results (new, and changed, by
kind); the exported types; the changed documents. For each claim, show whether
it was run, read, or not checked.

## 5. First-match lexical rules, hidden forms and semantic acceptance

Use this section for diagram types whose specification states the lexical rules
as a first-match priority list with hidden forms; apply the semantic steps only
where the specification defines such conditions. Use section 4 for the inputs,
wiring, tests and records.

1. Follow [conventions](../conventions/SKILL.md#code) for diagram names, and
   name internal modules and helpers after the rules they implement.
2. Implement lexical rules in their stated first-match priority order and split
   composite matches at authored component boundaries, using context stacks,
   longest-match behavior or recovery only where specified. Read common
   conversions through the shared reader and preserve what detection leaves for
   the diagram, without rereading passed bare lines or their accompanying
   trivia.
3. Retain hidden forms in every named AST gap, with the specified kind and
   source spelling, including gaps before the header or an optional header field
   when present. Keep a consumed following LF outside the node range and let EOF
   satisfy EOL only where the specification says so.
4. Apply semantic acceptance checks after shared conversion and grammar using
   direct specification sentences for any necessary initial state and
   statement-by-statement transitions, and report an input and question for each
   missing rule without recording that fixture.
5. Require explicit comparison rules for quote and escape decoding, entities,
   whitespace and case, including replacement order, overlap handling and
   whether replacements are reread, while keeping authored values in the AST.
   Carry lexical comparison values to the semantic check when source-preserving
   leaves do not supply them. Apply each specified numeric conversion and its
   boundary conditions rather than importing another diagram's numeric
   assumptions.
6. Evaluate acceptance under the specification's named defaults with frontmatter
   configuration and init arguments opaque, leaving only external site settings
   to their holder as in 4.7 and keeping the public `parse(text)` interface
   unchanged.
7. Before recording, use the acceptance, Db and shared declared-form checks of
   4.6 and inspect the trees of the specified cases as in 4.7; recording and
   acceptance checks belong to `tests/fixtures.test.ts`.

## 6. When fixtures are added or a rule changes

- Fixtures are added: do 4.7, steps 1 to 3. When a fixture's rule is not
  implemented yet, implement it first.
- The specification changes while you work: take a change in only after it is
  announced to you, with the changed sentences, fields, and fixture names. The
  working tree is shared, so a document that is being written can be seen
  half-way; do not change the implementation from it, and do not take back a
  provisional implementation because of it. In state, an alias rule was taken
  back from a draft of a known divergence that was decided the other way
  afterwards; in class, the same happened before.
- A rule of the specification changes, or a gap is filled: read the changed
  sections, check them as in 4.2, step 2, and implement them. When existing
  trees change, do 4.7, step 4. Before reporting it, check as in 4.8, and show
  the result as in 4.10.
- When shared checks are centralized, compare `(fixture, check)` coverage and
  execution counts before and after, explaining removed duplicate calls and
  added cases without introducing diagram exemptions to equalize totals.
- A change accepts a form where it was rejected, or moves where it may stand:
  before implementing it, list every position where the form can stand, every
  unit that can come before and after it there (whitespace, a separator, a
  comment, another such form, the header), and every place that reads the text
  of a range that can now contain it (the name text of a subgraph, the text of a
  style). Each item of that list is a case of the sentence that accepts the
  form: ask for a fixture of each (section 3), and report every difference to
  the specification at once. When the empty description blocks before a
  separator were accepted in this way one place at a time, the place of a block
  after a subgraph name, the whitespace around the blocks, the text of a style,
  the header line, a comment after a block, and a run of blocks inside a
  statement were found one after another.
- A gap in the specification is found during other work: fix the specification
  first (4.2, step 2), then do the above.
- A known divergence is added (its document `known-divergences/<id>.md`, listed
  in known-divergences.md): the parser does not tell it apart, so the tests do.
  For an existing identifier, reuse `fixtureAccepts` (4.6); adding a diagram
  adds no acceptance table or diagram-local helper. For a new identifier, ask
  the tests package to add its direction and specified-reading requirement to
  the shared `DIVERGENCE_PROPERTIES` table and run its checks. Extend the shared
  declared-form checks through `expectDivergenceForm` in
  `tests/helpers/divergence-form.ts`, called by the common fixture loop for all
  supported diagrams. For a one-way divergence with acceptance and a non-null Db
  recorded in `fixture.expected`, use a reference input in
  `tests/helpers/reference-inputs.ts` whose Db matches that recorded Db. When
  the shared table requires a specified reading, it is recorded in the corpus
  (`specified.json`) through the tests package's shared specified-reading path;
  ask the tests package for it. Add its declaration to
  `tests/helpers/known-divergences.ts`. Take every lexical decision of the
  reference input and of the declaration from the parser's units, not from rules
  of its own. Add it to "Known divergences" in `docs/testing.md` and to the
  differences in the README.
- When the specification claims that its reference reading explains every
  difference (in sequence, `comment-takes-character`), each place where the form
  can stand is a case of that claim: ask for a fixture of each (section 3), and
  report a case that the reading does not explain to the specification with the
  input and the result of mermaid.js.

## 7. Updating mermaid.js

Input: the fixtures regenerated with the new version and their differences,
classified (the tests skill), and the specification updated for it (the spec
skill). The parser does not change behavior before the specification does.

1. Read the changed sections of the specification, and check each changed rule
   as in 4.2, step 2.
2. Fix what is tied to the version. `grep -rn '12\.0\.0' packages/parser` finds
   it: the README and `docs/development.md`, each with its `.ja.md`.
3. When diagram type ids are added or changed: following `detection.md` and the
   DiagramType of `ast.md`, fix `src/detection.ts`, `DiagramType` in
   `src/ast.ts`, `allDiagramTypes` in `tests/types.test.ts`, and
   `tests/detection.test.ts`.
4. Check that tables copied from lists of the specification (in the flowchart,
   the letter ranges of `src/unicode-letters.ts`, which flowchart and class
   share) still agree with it.
5. Classify the differences of the trees as in 4.7, step 4, and check as in 4.8.
6. Show as the result: what was fixed, the number of differences of the trees by
   kind, and the mismatches that remain.

These steps have not been through a real update yet. At the first update, follow
them as written and correct them where they do not hold.

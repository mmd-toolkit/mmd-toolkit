---
name: parser
description:
  Implement a diagram type in @mmd-toolkit/parser from the specification and the
  fixtures only. This covers its node types, its hand-written lexer and
  recursive-descent parser, the four layers of tests, and the AST snapshots. It
  also covers recording and checking the parse result of each fixture (its tree
  in ast.json, or its error in parse-error.json), finding gaps in the
  specification, and fixing the parser when the pinned mermaid.js is updated.
  Use when a diagram type is added to the parser, when fixtures are added or a
  rule of the specification changes, or when mermaid.js is updated.
---

# Adding the parser of a diagram type (parser)

The steps of the work on `@mmd-toolkit/parser`: implementing a diagram type from
the specification alone (its lexer, its recursive-descent parser, the four
layers of tests, the snapshots), following added fixtures and changed rules, and
updating the pinned mermaid.js. It is written so that the same quality is
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
- A test helper checks that the tokens, comments, directives, and frontmatter
  hold the input at their ranges and that only whitespace and line terminators
  lie outside them. It is not public API.
- Per-diagram parsers are hand-written lexers and recursive-descent parsers. No
  parser generators.
- Four test layers: accept/reject agreement, Db-equivalent JSON agreement,
  coverage of the input by the tokens and trivia, mutation diff. AST snapshots
  are kept.

## 1. What to read first

1. The section Policies and criteria of this document (implementing from the
   specification alone, not taking behavior from the source of mermaid.js);
   "Shared interfaces" and "Principles" in AGENTS.md (readability, the proper
   form); and the skill `conventions` (no regular expressions, invisible
   characters, the documents). The criteria change, so read them for each piece
   of work.
2. `packages/parser/docs/development.md` (how the parser is built, and the
   tools), `docs/testing.md` (what the tests check), and
   `docs/error-positions.md` (where a `ParseError` points).
3. The specification: `packages/spec/docs/common.md`, `ast.md`, `detection.md`,
   `diagrams/<diagram>.md`, and `ast/<diagram>.md`, and the fixtures in
   `packages/tests/fixtures/<diagram>/`. The behavior to implement is only what
   these hold.

## 2. The working tree

- The steps of this skill write `packages/parser` and the `ast.json` and
  `parse-error.json` files in `packages/tests/fixtures/<diagram>/<fixture>/`,
  which the snapshot test writes. They do not write the other files of a
  fixture, the specification, or the other packages; when one of those must
  change, change it with the steps of that package's skill (spec, tests,
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
  it. The sizes of the differential tests come from environment variables (4.8).
- The Write tool and shell here-documents can turn an escape such as `\u00a0`
  into the real character. The sources and tests of `packages/parser` are ASCII
  only (every other character is written as an escape), so after writing, check
  with these two commands, at the root; neither may print anything:

  ```sh
  grep -rnP '[^\x00-\x7e]' packages/parser/src packages/parser/tests packages/parser/tools
  node scripts/check-invisible-chars.mjs
  ```

- Read the result of `eslint --fix`: it can add empty JSDoc or meaningless
  comments. Turn off a lint rule with `eslint-disable` only where that is right
  by the intent of the rule, with the reason
  (`eslint-comments/require-description` asks for it).
- The tests are heavy. Under a high load (a load average of `uptime` above the
  number of CPUs) the tests that run mermaid.js time out. When one does, run
  that file alone before judging. Run long checks (the larger sizes of 4.8) in
  the background, with the output in a file outside the repository. When the
  working tree is shared with other work, stop only what you started, by its
  task id or process id; never by name (`pkill -f vitest` stops the runs of
  others too).

## 3. How to check (in every piece of work)

- Check every claim about behavior, your own or another's, by running mermaid.js
  before writing it. Put the inputs, as a JSON array of strings, in a file
  outside the repository, and run, in `packages/parser`:

  ```sh
  pnpm run compare-with-mermaid <file>
  ```

  It prints, for each input, whether `parse()`, the check of the tree, and the
  Db agree with mermaid.js (`docs/development.md`, Tools). An input of a known
  divergence prints `DIFF`; read it against the Known divergences of the
  specification.

- Do not check with hand-written examples alone. For a rule whose boundaries
  matter, generate inputs that put a character or a unit at every position, and
  compare them (4.6). In the flowchart, an example written by hand for a test
  was rejected by mermaid.js, because its line feed left the click context; run
  an example for a test or a comment through the command above before writing
  it.
- In every result, show for each claim whether it was checked by running
  something, checked by reading code or documents, or not checked.
- Run what a change can affect (the skill `conventions`, Running tests). While
  working, run the test files that go with the changed part of the code, in
  `packages/parser` (`npx vitest run <files>`; a diagram's part of
  `tests/fixtures.test.ts` with `-t "<diagram> fixtures"`):

  | Changed part                                                                    | Test files                                                                                                                                                           |
  | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `src/diagrams/<diagram>/`                                                       | `tests/<diagram>.test.ts`, `tests/fixtures.test.ts`, `tests/parse-result-snapshots.test.ts`                                                                          |
  | `src/ast.ts`, `src/ast/<diagram>.ts`, `src/visitor-keys*`                       | `tests/types.test.ts`, `tests/traverse.test.ts`, `tests/ast-<diagram>-examples.test.ts`, `tests/union-docs.test.ts`, and for flowchart `tests/ast-flowchart.test.ts` |
  | `src/unit-grammar.ts`, `src/empty-forms.ts`, `src/diagram-*.ts`                 | `tests/<diagram>.test.ts` of every diagram, `tests/diagram-parsing.test.ts`, `tests/fixtures.test.ts`                                                                |
  | the common rules (`src/source-lexer.ts`, `directives.ts`, `entities.ts`, ...)   | the test file of the same name, `tests/fixtures.test.ts`, `tests/differential/common-invariants.test.ts`                                                             |
  | `src/db-ids.ts`, `src/db-texts.ts`, `src/diagrams/flowchart/subgraph-ids.ts`    | `tests/db-ids.test.ts`, `tests/db-texts.test.ts`, `tests/fixtures.test.ts`                                                                                           |
  | `src/parse.ts`, `src/index.ts`                                                  | `tests/parse.test.ts`, `tests/readme-example.test.ts`                                                                                                                |
  | `tests/helpers/<diagram>-db.ts`, `<diagram>-source.ts`, `check-tree.ts`         | `tests/fixtures.test.ts`, `tests/check-tree.test.ts`                                                                                                                 |
  | `tests/helpers/reference-inputs.ts`, `tests/differential/mermaid-comparison.ts` | `tests/reference-inputs.test.ts`, `tests/fixtures.test.ts`, the differential tests at their default size                                                             |

  The tests that read documents, which a change of those documents alone also
  runs: `tests/readme-example.test.ts` (the example of `README.md` and
  `README.ja.md`), `tests/types.test.ts` (the documents of
  `packages/spec/docs/known-divergences/`), and the tests of the examples and
  the unions in the comments of `src/ast.ts` and `src/ast/*.ts`
  (`tests/ast-<diagram>-examples.test.ts`, `tests/union-docs.test.ts`). The
  whole suite at its default size and the differential tests at full size are
  run as 4.8 says.

## 4. Adding a diagram type (Jison)

### 4.1 Input

- The specification of the diagram is written: the five sections of
  `packages/spec/docs/diagrams/<diagram>.md` have no "To be written", and
  `packages/spec/docs/ast/<diagram>.md` exists (the spec skill).
- The fixtures of the diagram and its normalizer exist in `packages/tests` (the
  tests skill).

### 4.2 Reading the specification, and its gaps first

1. Read `diagrams/<diagram>.md` and `ast/<diagram>.md` through, and list the
   units of implementation outside the repository: the lexical rules, the
   productions of the grammar, the items of the Db normalization, the fields of
   the nodes, the token kinds.
2. For each line of the list, check that the text of the specification and the
   fixtures decide the implementation in one way. What they do not decide, where
   the specification and a fixture disagree, and where mermaid.js (3) disagrees
   with the specification, is a gap in the specification. Do not fill it from
   the source of mermaid.js; fix the specification first, with the input and the
   result of mermaid.js (the spec skill, "When a gap in the specification is
   found"). Examples from the flowchart: an entity in a context that reads one
   character at a time; the token kind of a `click` in a subgraph name; the `,`
   of the click context, which had the same unit name as the `,` of the
   statement context.
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
   still unsupported, and the mutants of the common differential test
   (`tests/differential/common-mermaid.test.ts`) that are of this type are
   compared as trees. A mismatch there is a difference of the diagram, read as
   in 4.2, step 2.

### 4.4 The lexer

1. Put the entry in `src/diagrams/<diagram>/index.ts` as
   `parse<Diagram>Diagram(input: DiagramInput): Root`. It opens the diagram text
   with `openDiagramText(input)`, divides it into units with the lexer, makes
   the statements and tokens with the grammar, and passes them to
   `finishDiagram()`. The smallest model is `src/diagrams/error.ts`.
   `finishDiagram()` checks the promises of the units and tokens, rejects a
   directive inside a unit, records the tokens with the `Directive` tokens and
   the tokens of the frontmatter, and builds the `Root`. Write
   `ignoredSemicolonKindAt` from the Tokens section of `ast/<diagram>.md`: the
   kind of a `;` that the line rule ignores and that stands alone, at its place.
   It is one value when the diagram gives every such `;` one kind (the
   flowchart, `Punctuator`), and depends on the place when the kind does (in
   sequence, `RawText` where the context reads `;` as text, which the lexer
   answers from its units; in class, from the context of the step of the lexer
   that read over the `;`).
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
   `readArrow`). The JSDoc names the section and the rule. A start condition of
   Jison is a context on a stack. Compare characters with the constants of
   `src/code-points.ts`, `src/character-classes.ts`, and `src/scanning.ts`; no
   regular expressions.
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
    Keep the contexts that the text may not end in, with their messages, in one
    table over all contexts (in state, `END_OF_TEXT_MESSAGES`).

### 4.5 The grammar

1. A recursive descent over the units, one method per production of the Grammar,
   whose JSDoc names the production. The grammar extends `UnitGrammar` of
   `src/unit-grammar.ts`, which reads the units (`take`, `takeIf`, `peek`),
   places a node (`placeOf`, `placeFrom`), reads the text of a range, makes the
   shared leaf nodes, the tokens of an item (`addItem`), and the error for a
   unit that the grammar cannot read (`unexpected()`), with the empty forms; the
   diagram adds its productions and `knownDivergenceAt()`, which looks for the
   cause that a known divergence names (in the flowchart, a `click` and an empty
   form after the `space` units; in sequence, an empty form; in class, an empty
   form, or the unit after an empty generic type). The range of a unit without
   its whitespace is `significantRangeOf` of `src/diagram-units.ts`. Where the
   tokens of an item break is `breaksRun()`: between units of other items; a
   diagram whose whitespace belongs to no unit also breaks a run where
   characters lie between two units (in class, except in a `RawText` item, whose
   token holds the whitespace inside it).
2. The grammar makes the nodes, the token kind of each unit that is not all
   whitespace (`UnitWithKind`), and the tokens (`PendingToken`). Take the kinds
   from the Tokens section of `ast/<diagram>.md`.
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
4. The value of a leaf node is the text of its range without the directives, the
   comment regions, and the `;` that the line rule ignores (`ast.md`, Nodes;
   `SourceLexer.textOfRange`). Nothing is converted. `StringLiteral` and
   `NumericLiteral` also have `raw`. The name of an `Identifier` is the texts of
   its tokens joined (`identifierOf`, which takes the pieces of its item from
   `SourceLexer.piecesOf`, the same pieces that the tokens are recorded as), so
   the whitespace between them is not part of it.
5. When the specification lists rejections outside the grammar (made while the
   Db is built), the parser makes them too: in the flowchart, the grammar finds
   a subgraph member after `hasOwnProperty` (`subgraph-members.ts`); in
   sequence, a walk over the statements after the grammar keeps what the Db
   would hold of the participants (`db-rejections.ts`). Where the specification
   does not say which of several waiting statements a check applies to (in
   sequence, two `create` before one message), check with mermaid.js (3) and
   report it as a gap.
6. For a new kind of rejection, decide the range of the `ParseError` and add a
   line to `docs/error-positions.md` and its `.ja.md`.

### 4.6 Tests

The flowchart tests are the model. The files to add, or to add a `case` of the
diagram to:

| File                                           | What to add                            |
| ---------------------------------------------- | -------------------------------------- |
| `tests/helpers/node-types.ts`                  | the `Record` of every node type        |
| `tests/types.test.ts`                          | the union of `Node`                    |
| `tests/helpers/db.ts`                          | the `case` of `dbOf()`                 |
| `tests/helpers/<diagram>-db.ts`                | the steps of the Db normalization      |
| `tests/helpers/<diagram>-source.ts`            | the helper that reads the units        |
| `tests/helpers/check-tree.ts`                  | the checks of the diagram's tree       |
| `tests/check-tree.test.ts`                     | broken trees                           |
| `tests/fixtures.test.ts`                       | the `describe` of the fixtures         |
| `tests/parse-result-snapshots.test.ts`         | the list `diagrams`                    |
| `tests/differential/<diagram>-mermaid.test.ts` | layer 4                                |
| `tests/ast-<diagram>-examples.test.ts`         | the examples in the node type comments |
| `tests/helpers/reference-inputs.ts`            | the diagram's units for the references |
| `tests/<diagram>.test.ts`                      | unit tests of the tree and tokens      |

Steps:

1. Layers 1 to 3 run in `tests/fixtures.test.ts`. The Db summary is built from
   the tree by `tests/helpers/<diagram>-db.ts`: write the items of the Db
   normalization one by one, in the order of the specification. The values are
   read in converted form (`tests/helpers/converted-text.ts`, given the reader
   of the diagram's lexer: in the flowchart `FlowchartText`, in sequence the
   diagram text itself). Steps that several diagrams share are in
   `tests/helpers/db-values.ts`. Values that come from embedded data are taken
   from the argument `embedded`. A value that the specification gives from
   outside the tree and that is not embedded data (in sequence, whether a box's
   colour candidate is a colour) is taken from what `@mmd-toolkit/tests` gives
   mermaid.js; when it is not exported, ask for it, and do not write a stand-in.
   Where the Db depends on a token that no field holds (in sequence, `as` with
   nothing after it gives the empty description), read the token, and report it
   to the specification.
2. The helpers take every lexical decision from the parser's units (where a
   string's content lies, which strings are empty, where a statement ends):
   `<Diagram>Source` (in the flowchart, `FlowchartSource`). A rule of their own
   hides a wrong unit and shows a wrong helper as a difference from mermaid.js;
   in the flowchart, the helpers read the content of strings by rules of their
   own and were rebuilt to take it from the units. A helper reads the source
   itself only for what the comparison with mermaid.js cannot check (`loc`, the
   value of a comment; `docs/testing.md`, "What the tests read from the source
   themselves").
3. Find where text outside a node's range changes the Db. For each item of the
   Db normalization, check whether the text it reads lies inside a node's range;
   for text outside, take its boundaries from the units. Examples from the
   flowchart: the name text of a subgraph runs from the start of the name to the
   `[` (the whitespace after the name included), and the end of the `space` unit
   where the first style of a statement starts. Put whitespace, a directive, a
   comment line, and a `click` at each boundary, compare with mermaid.js (3),
   and add the inputs to a test (in the flowchart,
   `tests/differential/flowchart-source-reading.test.ts`). Generate them: put
   each of these at every place of the statement (in class,
   `tests/differential/class-source-reading.test.ts`). A character that the Db
   reads at a boundary is read in converted form, not from the source: in class,
   the helper read the character after a visibility mark from the source, and a
   directive put after the mark, which mermaid.js leaves out, showed it. A unit
   that is all whitespace at the end of a statement lies after the range of the
   statement, which ends at its last token; find it from the units next to a
   unit of the statement, not inside the range (in state, the second description
   of an alias and the text of a note on one line that are all whitespace).
4. Layer 3 is `tests/helpers/check-tree.ts`. The common invariants are there
   already; add what `ast/<diagram>.md` states about the tree (how value nodes
   and tokens relate, fixed words and their tokens) as checks of the diagram.
   Give the check broken trees in `tests/check-tree.test.ts`.
5. Layer 4 is `tests/differential/<diagram>-mermaid.test.ts`: it compares
   mutants of the fixtures with mermaid.js, as
   `tests/differential/mermaid-comparison.ts` describes.
6. For a rule whose boundaries matter, add a test of generated inputs. Example
   from the flowchart: `tests/differential/entity-units.test.ts` puts an entity
   at every position of a link text and an ellipse label.
7. Keep every input that was once read wrong as a regression input in a test.

### 4.7 Snapshots

The parse result of every fixture is recorded next to its input: the tree of an
accepted input in `ast.json`, and the `message`, `range`, and `loc` of the
`ParseError` of a rejected one in `parse-error.json` (`docs/testing.md`,
Parse-result snapshots). A rejection is thus recorded as fully as a tree: where
the parser reports it is part of the result.

1. Write and read these files only for fixtures whose rules are implemented. Run
   earlier, the snapshot test writes the result of the current parser, which is
   wrong, and it then passes as a snapshot.
2. Run the snapshot test once outside CI, in `packages/parser`, without `-u`; it
   writes the missing files (in CI, a missing file fails). Use `-u` only for a
   change that changes existing results (step 4):

   ```sh
   pnpm run test tests/parse-result-snapshots.test.ts
   ```

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
   change, copy the fixtures outside the repository; after the change, rewrite
   the files with `pnpm run test:update`, which runs the snapshot test alone
   with `-u`, and classify the differences, in `packages/parser`:

   ```sh
   rm -rf <directory>/ast-before && cp -R ../tests/fixtures/<diagram> <directory>/ast-before
   pnpm run test:update
   pnpm run diff-trees <directory>/ast-before <diagram>
   ```

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
   number of fixtures of each kind in the result. Run this also when the fixture
   tests pass: a node that changes nothing in the Db shows a wrong change only
   here (in state, a floating note id that a careless edit made end at its first
   character).

### 4.8 Checks before finishing

In `packages/parser`:

```sh
CI=true pnpm run test
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
change. The full differential checks, run once before a step of the plan is
reported as finished or handed to a review, in `packages/parser`, in the
background with the output in a file. The sizes come from environment variables;
a size below the default makes the guard against a vacuous comparison fail, so
use at least the default (300 inputs per seed, 1 mutant per fixture):

```sh
MMD_DIFFERENTIAL_COUNT=5000 CI=true npx vitest run tests/differential/common-mermaid.test.ts
MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/flowchart-mermaid.test.ts
MMD_COMMENT_INPUTS=1000000 MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/sequence-mermaid.test.ts
MMD_COMMENT_INPUTS=1000000 MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/class-mermaid.test.ts
MMD_COMMENT_INPUTS=1000000 MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/state-mermaid.test.ts
```

Each `<diagram>-source-reading.test.ts` beside it runs with its
`<diagram>-mermaid.test.ts`.

The time limit of each check grows with its number of inputs (`timeoutFor` of
`tests/differential/run-size.ts`); a check that still times out under a high
load is run again when the load is lower, before it is judged.

The work is done when every fixture passes the four layers and the mutation test
shows no new mismatch.

### 4.9 Documents

Change the `.md` and the `.ja.md` in the same change.

- `packages/parser/README.md`: the supported diagrams, and the links to the
  specification for the types.
- `docs/development.md`: what is implemented, and how the diagram's parser is
  built.
- `docs/testing.md`: the list of fixtures, and the checks of the diagram's tree.
- `docs/error-positions.md`: the positions in the diagram.

Run `npx prettier --write` on them, and pass `pnpm run lint:docs` and
`pnpm run format:check`. Write the line breaks of a `.ja.md` as the skill
`conventions` says.

### 4.10 Output

Show as the result: what was implemented, file by file; the gaps in the
specification that were found, and which of them are still open; the number of
tests and their results; the number of snapshots (new, and changed, by kind);
the exported types; the changed documents. For each claim, show whether it was
run, read, or not checked.

## 5. Langium diagrams

To be written with pie, the first Langium diagram. The steps of the lexer (4.4)
and the grammar (4.5) are expected to change with the grammar definition of
Langium.

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
- A change accepts a form where it was rejected, or moves where it may stand:
  before implementing it, list every position where the form can stand, every
  unit that can come before and after it there (whitespace, a separator, a
  comment, another such form, the header), and every place that reads the text
  of a range that can now contain it (the name text of a subgraph, the Db text
  of a style). Compare generated inputs over that whole list with mermaid.js,
  and report every difference to the specification at once. When the empty
  description blocks before a separator were accepted in this way one place at a
  time, the place of a block after a subgraph name, the whitespace around the
  blocks, the Db text of a style, the header line, a comment after a block, and
  a run of blocks inside a statement were found one after another.
- A gap in the specification is found during other work: fix the specification
  first (4.2, step 2), then do the above.
- A known divergence is added (its document `known-divergences/<id>.md`, listed
  in known-divergences.md): the parser does not tell it apart, so the tests do.
  Add its branch to the checks of `tests/fixtures.test.ts`, and its reference
  reading, checked under "marked fixtures differ only by their divergence", as
  the specification defines it: a reference input in
  `tests/helpers/reference-inputs.ts`, or mermaid.js with the divergence removed
  from its lexer (`withoutDivergences` of `@mmd-toolkit/tests/mermaid`, as for
  `comment-takes-character`), which the tests package provides; ask for it. Add
  its declaration and the check of the declared differences to
  `tests/differential/mermaid-comparison.ts` and the differential tests, with a
  guard against a vacuous check. Take every lexical decision of the reference
  input and of the declaration from the parser's units (4.6, step 2). Add it to
  "Known divergences" in `docs/testing.md` and to the differences in the README.
- When the specification claims that its reference reading explains every
  difference (in sequence, `comment-takes-character`), check the claim on
  generated inputs as well as on the fixtures (4.6, step 6): put the form at
  every position of the accepted fixtures and compare `parse()` of each input
  with mermaid.js in the reference reading, in a differential test whose size an
  environment variable raises (`MMD_COMMENT_INPUTS`). The other known
  divergences are declared and checked there as everywhere. Report every
  remaining class to the specification with an example, the result of
  mermaid.js, and the count.

## 7. Updating mermaid.js

Input: the fixtures regenerated with the new version and their differences,
classified (the tests skill), and the specification updated for it (the spec
skill). The parser does not change behavior before the specification does.

1. Read the changed sections of the specification, and check each changed rule
   as in 4.2, step 2.
2. Fix what is tied to the version. `grep -rn '12\.0\.0' packages/parser` finds
   it: the README, `docs/development.md`, `docs/testing.md`, and the comment of
   `tests/differential/common-inputs.ts`, each with its `.ja.md`.
3. When diagram type ids are added or changed: following `detection.md` and the
   DiagramType of `ast.md`, fix `src/detection.ts`, `DiagramType` in
   `src/ast.ts`, `allDiagramTypes` in `tests/types.test.ts`,
   `tests/detection.test.ts`, and the headers in
   `tests/differential/common-inputs.ts`.
4. Check that tables copied from lists of the specification (in the flowchart,
   the letter ranges of `src/unicode-letters.ts`, which flowchart and class
   share) still agree with it.
5. Classify the differences of the trees as in 4.7, step 4, and check as in 4.8.
6. Show as the result: what was fixed, the number of differences of the trees by
   kind, and the mismatches that remain.

These steps have not been through a real update yet. At the first update, follow
them as written and correct them where they do not hold.

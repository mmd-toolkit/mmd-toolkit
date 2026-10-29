---
name: tests
description:
  Extract mermaid.js's truth for a diagram type (the Db normalizer) and collect
  its fixtures in @mmd-toolkit/tests, keep the fixture tools that the other
  packages use, and update the pinned mermaid.js (regenerate, classify the
  differences). Use when a diagram type is added, when a fixture, a rename or a
  known divergence identifier is needed, or when mermaid.js is to be updated.
---

# The truth from mermaid.js, and the fixtures (tests)

The steps of the work on `@mmd-toolkit/tests` and `tools/`: the normalizer and
the fixtures when a diagram type is added, keeping the fixture tools and lists
that the other packages use, and updating the pinned mermaid.js. It is written
so that the work can be done to the same quality from this document alone,
without the conversation history or memory. The policies and criteria of the
package are in section 1; what holds for every package is in AGENTS.md and in
the skill `conventions`, which section 2 points to.

## 1. Policies and criteria

`packages/tests`, with the CLIs in `tools/`:

- Pins mermaid as a devDependency and extracts mermaid's Db in Node (no DOM).
- Defines the fixture format; keeps the loader and the README in step with it.
- Provides the fixture generator. Whatever imports mermaid (Db extraction,
  normalizers) lives in subpaths of `@mmd-toolkit/tests`; the CLIs live in
  `tools/`.
- Provides the CI job that regenerates fixtures and fails when mermaid's
  behavior changed.
- For each diagram type: extracting the truth (normalizer) and collecting
  fixtures.

## 2. What to read first

1. Section 1 of this document; "Shared interfaces" and "Principles" in
   AGENTS.md; and the skill `conventions` before writing code or a document. The
   criteria change, so read them for every piece of work.
2. `packages/tests/README.md`, the five documents in `packages/tests/docs/`, and
   `tools/README.md`. The fixture format, how the expected results are obtained,
   Db summaries, the values from embedded data, and the steps for maintaining
   and collecting fixtures are there.

## 3. The working tree

- The steps of this skill write only `packages/tests`, `tools/`, and the
  documents of this skill. When another package (`packages/spec`,
  `packages/parser`, `packages/prettier-plugin-mmd`) needs a change, make it by
  the steps of that package's skill. When taking inputs from another package's
  tests, only read them.
- Commit and push only when asked to (the "Principles" of AGENTS.md). Rename a
  fixture by moving its whole directory with a plain `mv` (its `ast.json` or
  `parse-error.json` goes with it); `git mv` would also change the staging.
- The shared files at the root (`package.json`, `pnpm-lock.yaml`,
  `eslint.config.mjs`, `prettier.config.js`, `tsconfig.json`,
  `.github/workflows/`, `scripts/`) act on every package. Change them only when
  needed, and after a change run the checks of the whole repository
  (`pnpm run lint` and the whole test suite).
- Put scripts and temporary files for checks in a working directory outside the
  repository, not in the working tree.
- Removing fixture directories may be stopped by the permission check as an
  irreversible deletion. When something must be removed, show the list and the
  commands, and ask for a decision.
- The Write tool and shell here-documents may turn an escape such as `\u00a0`
  into the real character. After writing source or documents, run
  `node scripts/check-invisible-chars.mjs` and make sure there are no invisible
  characters.
- Read the result of `eslint --fix` and of Prettier, as the skill `conventions`
  says.

When the working tree is shared with other work:

- Do not touch files that the other work is editing.
- Do not edit a tracked file temporarily to try something (it may be staged in
  the middle).
- Do not change the git staging or the checked-out files (`git add`, `git mv`,
  `stash`, `checkout`, `reset`). Do not stop processes by name
  (`pkill -f vitest` also stops the tests of the other work).

## 4. How to check (in every piece of work)

- Before taking in a claim, whoever makes it, check it by running mermaid.js.
  Put the following script in the working directory outside the repository as
  `probe.mts`, replace `<repo>` with the absolute path of the root of the
  repository, and run it with `node <working directory>/probe.mts` (Node runs
  TypeScript as it is; this works from any directory). The extension `.mts`
  makes Node read the file as an ES module, where the top-level `await` is
  allowed. Import the source file by its absolute path: from outside the
  repository, the package names do not resolve. Node only removes types, so
  write a type-only import as `import type`, and do not use `enum`, `namespace`
  or parameter properties.

  ```ts
  import { runMermaidWithEmbeddedData } from "<repo>/packages/tests/src/mermaid.ts"

  const texts = ["flowchart LR\n  A --> B\n", "flowchart LR\n  A -->\n"]
  for (const text of texts) {
    const mermaidRun = await runMermaidWithEmbeddedData(text)
    console.log(
      JSON.stringify(text),
      JSON.stringify(mermaidRun.outcome).slice(0, 120),
    )
  }
  ```

- When showing results, say for each claim whether it was checked by running
  something, checked by reading, or not checked.
- Do not settle for a few hand-written examples. Where a rule acts on a value,
  try the whole set of characters at the boundary (for example, the whitespace
  left at the end of a style value was checked by putting each of the 23
  characters of JavaScript's `\s` there and running mermaid.js). Check that
  results do not change across every fixture, or every collected input.
- Which tests to run, and when, follows "Running tests" in the skill
  `conventions`. For this package:

  | Code changed                                                | Test files to run (`tests/`)                                 |
  | ----------------------------------------------------------- | ------------------------------------------------------------ |
  | `src/index.ts` (format, loader, `KNOWN_DIVERGENCES`)        | `fixtures.test.ts`, `expected-changes.test.ts`               |
  | `src/fixture-acceptance.ts`                                 | `fixture-acceptance.test.ts`, `fixtures.test.ts`             |
  | `src/mermaid.ts`, `rejections.ts`, `run-mermaid-options.ts` | `mermaid.test.ts`, `mermaid-run-store.test.ts`               |
  | `src/mermaid-run-store.ts`                                  | `mermaid-run-store.test.ts`                                  |
  | `src/divergence-removals.ts`                                | `divergence-removals.test.ts`, `mermaid.test.ts`             |
  | `src/normalizers/<diagram>.ts`, `normalizers/index.ts`      | `mermaid.test.ts`, `fixtures.test.ts`, then `fixtures:check` |
  | `src/normalizers/data-blocks.ts`                            | `data-blocks.test.ts`, `mermaid.test.ts`                     |
  | `src/normalizers/browser-stand-ins.ts`                      | `browser-stand-ins.test.ts`, `mermaid.test.ts`               |
  | `src/normalizers/json.ts`                                   | `json.test.ts`, then `fixtures:check`                        |
  | `src/expected-changes.ts`                                   | `expected-changes.test.ts`                                   |
  | `src/recorded-embedded.ts`                                  | `recorded-embedded.test.ts`, then `fixtures:check`           |
  | `src/fixture-shapes.ts`                                     | `fixture-shapes.test.ts`                                     |
  | `src/db-from-tree/`                                         | `db-from-tree.test.ts`, `converted-text.test.ts`             |
  | `src/source-scan.ts`                                        | `source-scan.test.ts`                                        |
  | `src/check-tree/`                                           | `check-tree-corpus.test.ts`, `check-tree*.test.ts`           |
  | `tools/src/diagrams.ts`                                     | `tools-diagrams.test.ts`                                     |
  | `tools/src/fixture-store.ts`                                | `tools-fixture-store.test.ts`                                |
  | `tools/src/spec-recorder.ts`                                | `tools-spec-recorder.test.ts`                                |
  | `tools/src/specified-reading.ts`                            | `tools-specified-reading.test.ts`                            |
  | `tools/fixtures.ts`, `tools/collect.ts`                     | no test file; see below                                      |

  The functions of `tools/src` that decide what a fixture's recorded files
  contain are tested by `tests/tools-*.test.ts`, one file for each module; the
  recorder runs in a process of its own there, since it needs Node.js's own
  `import()`. The command-line files (`tools/fixtures.ts`, `tools/collect.ts`)
  have no test file; each command is checked by running it: `add-many`,
  `set-divergence` and `set-note` with `--dry-run`, reading what they would
  change; `generate` with `fixtures:check`; `tools/collect.ts` with `--out`
  pointing outside the repository, reading the file it writes.

  Run one file with
  `pnpm --filter @mmd-toolkit/tests exec vitest run tests/<file>`.
  `fixtures.test.ts` reads both READMEs (each known divergence has an item), so
  it runs after a change to a README as well. The package has no sizes to raise:
  its whole run (`pnpm --filter @mmd-toolkit/tests test`) is the run before a
  completion is reported. `fixtures:check` runs after a change to how a result
  is made or recorded (`src/mermaid.ts`, a normalizer, the format, the
  generator), and before the completion of such a change is reported. After a
  change to `src/`, rebuild `lib/` (below); the other packages run their own
  tests of what they use. A test that reads every fixture in one test gets an
  explicit time limit, set from its measured time alone (do not rely on the
  default of 5 seconds).

- `runMermaid()` gives back stored results for a text it has run before, keyed
  by the code of `src/` or `lib/`, so a change to the code never gets an old
  result (`docs/expected-results.md`). The tests of this package and the
  generator run without the store, but for one test of the store, which runs a
  text through the store of the repository; a probe runs with it unless
  `MMD_TOOLKIT_MERMAID_CACHE=disabled` is set. Only the files of `src/` in
  `RESULT_FILES` are in the key, so changing them makes every stored result
  unused: keep that list right (a test checks it). A change to those files is
  announced, before it is made, to those who run the tests, and is made when no
  long run is going, whose stored results it would throw away; only a fix of a
  wrong result goes in at once, announced all the same.
- Check that the generator changes nothing with the hashes of the files, not
  only with the count it prints (run at the root of the repository).

  Set `WORK` to the working directory outside the repository first.

  ```sh
  find packages/tests/fixtures -type f | sort | xargs shasum > "$WORK/before.sha"
  pnpm --filter @mmd-toolkit/tests run fixtures:generate
  find packages/tests/fixtures -type f | sort | xargs shasum > "$WORK/after.sha"
  cmp "$WORK/before.sha" "$WORK/after.sha"
  ```

- After changing `src/`, rebuild `lib/` with
  `pnpm --filter @mmd-toolkit/tests run build`. Inside this repository, the
  tests of the other packages, the tools and the type check read `src/` (through
  the aliases of the vitest configurations, relative imports and the `paths` of
  the root `tsconfig.json`), so a change to `src/` reaches their next run at
  once. `lib/` is what the name of the package loads anywhere else, as in a
  plain `node` script.

## 5. Adding a diagram type

Diagram types are added one at a time. Each is finished in this order before the
next one starts: the normalizer and the fixtures (this section), the
specification (the spec's skill), the parser (the parser's skill), the printer
(the prettier-plugin's skill). Each piece of work uses the results of the ones
before it: the specification and the parser refer to the list of summary fields
(`docs/db-summaries.md`), and the claims of the specification and the tests of
the parser use the fixtures. The steps that build the summary from a tree are
written here after the tree document of the specification
(`docs/db-from-tree/<diagram>.md` and `src/db-from-tree/<diagram>.ts`).

For a Chevrotain diagram, apply the same procedure with the token definitions as
lexer rules: token order, active modes and explicit `longer_alt` decide the
unit; there is no general longest match. Lexer errors reject before parser
errors, even when the parser recovers a tree. Read the parser's rule methods as
grammar productions and the model builder's validation as acceptance conditions.
Collect distinguishing cases for each of these, including mode transitions and
priority interactions that token counts alone cannot establish.

For a Langium diagram, derive the following from its own grammar and services.
Derive terminal order, boundaries, conversion and publication anew for each
diagram; an imported common rule does not establish how the diagram uses it.

1. Start at the `entry` rule and follow imports and rule calls. Read the
   generated grammar as well as the written grammar, and the service modules
   that inject its token builder and value converter. List only reachable
   terminals in their resulting order, including hidden ones; an imported
   terminal's declaration alone does not make it reachable, and a terminal's
   component rules need not become separate lexer units. If generated files are
   absent from the clone, read the installed pin's bundle source maps and check
   the generated module and grammar against the written service wiring.
2. Read keyword patterns too: list which keywords receive custom boundaries,
   which keep the default ordering, and which have explicit `longer_alt`
   alternatives. The
   [shared token builder](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/tokenBuilder.ts#L7-L31)
   adds whitespace/EOF-or-percent-pair lookahead only to its configured
   keywords. First matching rule, keyword boundaries and explicit alternatives
   decide the unit, rather than a general longest match. Probe glued suffixes,
   keyword prefixes, punctuation attached to keywords, and priority against
   references, numbers, strings and composite common terminals; detection has
   boundaries of its own.
3. Treat hidden terminals as lexer rules with consumed text, not as global
   removals. The imported
   [YAML and DIRECTIVE terminals](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/common.langium#L25-L34)
   consume an immediately following LF, whereas another whitespace boundary is
   only looked at. Probe each unit gap and each statement's EOL and EOF: a
   consumed sole LF prevents a later statement, but consuming the common
   appended LF can leave EOF satisfying EOL. Keep leading frontmatter, common
   directive removal and these body terminals distinct. Derive alternative
   priority before choosing a closer: a body-present alternative can take
   precedence over an adjacent empty close. Probe the detection-to-parser
   handoff for retained prefixes and passed bare-line trivia independently for
   the new diagram.
4. Follow the actual terminal rule name through the injected converter and its
   fallback, including identity, string, integer and double conversion only
   where reachable. The
   [common converter](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/valueConverter.ts#L26-L70)
   gives line and block common values different whitespace readings. For
   example, the pie
   [custom branch](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/pie/valueConverter.ts#L6-L16)
   names PIE_SECTION_LABEL, while its
   [grammar](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/pie/pie.langium#L1-L20)
   calls STRING and reaches the default escape conversion. For reachable units,
   collect both quote styles, unknown escapes, precision, overflow and
   underflow; use rejecting controls and record the reason where a previous
   diagram's unit is unreachable.
5. Read the public acceptance gate, not just the recoverable AST. The
   [public parse wrapper](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L134-L150)
   rejects any lexer or parser error. Then follow the diagram's AST-to-Db
   publication, distinguishing stored values, conditional or skipped
   assignments, unassigned grammar literals and statements the adapter discards.
   Record repeated-assignment order, empty final values, duplicate handling and
   semantic rejection after publication; a diagram may publish nothing and have
   an empty summary. Test errors at the beginning, in a recovered statement and
   after a valid prefix, separately from each reachable Db rejection.
6. Keep the collector's parse stub asynchronous so that specs awaiting parse are
   recorded: `Promise.resolve(record(text))` records the call without running
   Langium or imitating acceptance. Run the spec against this shared recorder
   and check that every recorded location is an actual parse call. A stub-only
   test-body failure after the final input may use the existing explicit
   allowance of §5.3.3 only after proving that no input was lost. Continue with
   the normalizer, fixed-fixture and stable-generation steps in §5.2–5.3; once
   the AST is defined, implement its Db builder and checker with §6.

### 5.1 Input

- The name of the diagram type to add, and the diagram ids that share its Db
  (found in mermaid.js's list of detectors and in the `db` of each diagram
  definition). One detector can stand for several keywords: `classDiagram` and
  `classDiagram-v2` are both detected as `classDiagram`. The diagram type's
  fixtures go in one directory, whatever ids it has. The diagram-type naming
  rules are in [conventions](../conventions/SKILL.md#code).
- A clone of mermaid.js at the tag of the pinned version (in `.work/mermaid`,
  which `.gitignore` lists; how to make it is in `tools/README.md`).

### 5.2 The normalizer

1. In the clone, open the grammar, any AST-to-Db adapter, the Db implementation
   and the renderer. List private or closure-held state and every publication
   call (Jison `yy.` calls or the adapter calls derived above). Look for every
   place the Db reads a browser global (`window`, `document`, `Option`, `CSS`),
   and whether it runs while mermaid parses or only after rendering (class's
   click callbacks and tooltips run after rendering and need nothing).
2. Make a table of the proposed summary fields: for each field, its renderer
   reader, whether the syntax determines it, why it is kept, and what is dropped
   and why. Do not retain parsing or validation state merely because another Db
   method reads it, and do not invent fields for unassigned keywords, discarded
   AST values or build constants; an empty summary is a valid result. Always ask
   whether the following should be dropped (the flowchart and sequence examples
   in parentheses):
   - a drawing-derived value, or one filled in by the renderer (`domId`,
     sequence's `actorCnt` and `rectData`);
   - a value derived from other fields alone (`textStyles`, sequence's message
     `id` and the list of notes);
   - a value that only a site setting changes (`haveCallback`, set only under
     `securityLevel: loose`). A field the syntax determines that a site setting
     also changes is kept, and the Db patch records it as the other settings
     give it (class's link target, `_top` under `securityLevel: sandbox`). Run
     every fixture with a different `securityLevel` and check that the summaries
     do not change;
   - whitespace left in a value where the formatter changes it (the whitespace
     at the end of style values). Compare with the formatting choices of the
     diagram type (`packages/prettier-plugin-mmd/docs/<diagram>.md`). Before
     dropping it, check that mermaid.js does not read the whitespace (a sequence
     title of only whitespace still takes room as a title, so it is kept);
   - a field set only by `@{ ... }` data blocks. Such a field is kept, and
     implementations get it through `dataBlockEffects`
     (`docs/embedded-data.md`);
   - an object whose keys an author writes (the contents of a data block, the
     props of `[|field:value|]`, sequence's links and properties). Check with a
     fixture what a key such as `__proto__` does: it stays an own property
     (flowchart), or it replaces the prototype (sequence's links and
     properties). `toJson` refuses the latter, so record the prototype as a
     first entry `__proto__`;
   - the source of the summary, when the Db holds what it read in more than one
     form. Take the form that holds every element once with what applies to it,
     which is usually what the renderer reads, and write down why the other
     forms are not taken (state: the statement tree keeps statements that change
     nothing, and the table of states holds only the top level, so the summary
     is taken from the layout data `getData()`). Distinguish collection
     iteration order, replacement position and creation sequence, and keep each
     only when its renderer consumer needs it;
   - an id that mermaid.js makes at random (state's region after the last `--`).
     Observe whether each id was authored or generated at publication rather
     than guessing from its spelling, and replace only proven generated identity
     and reference positions in a stated generation order, reserving authored
     placeholder names even in later statements. Do not search authored text for
     id-shaped substrings. If observation precedes a conversion that publication
     uses to decide authorship, document and test the equivalence it relies on
     instead of reproducing the converter. Check reset after rejection and two
     stable generator runs;
   - a value that depends on the time of the run or on chance, not on the text
     (gantt computes dates, in the time zone of the process, and reads today's
     for a start after an id that is no task). The store of earlier results
     (`docs/expected-results.md`) gives back a result made on another day, so
     such a value is either dropped from the summary, or the diagram type's
     results are not stored, or what they depend on goes into the key of the
     store. Gantt's summary leaves the dates out, since the Db computes them
     only when the diagram is drawn. Check by running every fixture again on
     another day and in another time zone (`TZ=...`), and in another order, and
     comparing with `expected.json`.
3. Decide the table before writing. Decide it from the correctness criteria of
   AGENTS.md (for accepted inputs, the Db matches mermaid.js), from the rule
   that a summary keeps only what the syntax determines
   (`docs/db-summaries.md`), and from the effect on what uses it (the Db
   normalization section of the specification, how the parser derives the Db).
   Prototype what is unclear (such as recording data blocks) in the working
   directory outside the repository and check it before deciding.
4. Write the normalizer in `packages/tests/src/normalizers/<diagram>.ts`, and
   register in `src/normalizers/index.ts` every diagram id that shares the Db.
   Check whether a Db patch is needed (the Db stores links through
   `utils.formatUrl()`, or the syntax has data blocks); if so, write it in the
   same file and register it in `dbPatches`, with a text mermaid accepts and
   detects as the diagram id (`classDiagram` alone is rejected; the class sample
   has a class): `runMermaid()` patches every Db class before any input is
   parsed. A Db method that calls a browser function Node lacks (`window`,
   `document`, `Option`) shows as a `MermaidEnvironmentError`. The patch then
   gives a stand-in for that function during that call only
   (`src/normalizers/browser-stand-ins.ts`), without copying mermaid's
   processing. What the stand-in answers decides what implementations are
   compared with, so present the options with a recommendation and ask for a
   decision, then write it in `docs/expected-results.md`. The effect of a data
   block is recorded with `blockEffect` of `data-blocks.ts`, by comparing the
   element summaries without and with the block. How depends on how the grammar
   passes the block: in a call of its own, compare before and after that call
   (flowchart); in the call that adds the element, run that call once without
   the block, put the Db's lists back, and compare with the real call
   (sequence). A Db that is one object shared by every diagram, with its state
   in module variables, has no class (gantt's): register its patch with
   `appliedTo: "object"`, so that it receives the object, and let the patch
   reset what it records in step with the Db's `clear()`. The generated parser
   calls the methods on a copy of the object's properties, so inside a patched
   method `this` is not the Db.
5. Add the diagram type to `DiagramType` in `src/index.ts` and to `diagramIds`
   in `tools/src/diagrams.ts`, and to the per-diagram loading test and the lists
   of the tests that read every fixture in `tests/fixtures.test.ts`. Add the
   normalizer's file to `RESULT_FILES` in
   `packages/tests/src/mermaid-run-store.ts`; `codeIdentityOf` uses this list to
   build the result identity. Announce the new type to the owners of consumer
   lists in other packages rather than editing outside the assigned scope.
6. Add tests in `tests/` (dropped fields do not appear, a patch does not change
   the summary, data block effects). In corpus-backed tests, load fixtures by
   name rather than copying their input strings, and add a missing input through
   the CLI after probing it. Find tests that use the new type as an unsummarized
   carrier and move those assertions to another verified unsummarized fixture.
7. Run `pnpm --filter @mmd-toolkit/tests run fixtures:generate`. Only the
   fixtures of `common/` that carry the diagram type should change (`db: null`
   becomes a summary). If anything else changes, find out why. Those fixtures
   then have a summary and no tree: add the diagram type to
   `DIAGRAM_TYPES_WITHOUT_RECORDED_TREES` in `tests/db-from-tree.test.ts`, and
   remove it when the parser has recorded the trees, and add the diagram type to
   `DIAGRAMS` of the same file then, so that the builder runs on the recorded
   trees. Add also the prefix of the node types of the diagram type
   (`Requirement`) to `NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES` in
   `tests/check-tree-recorded.ts`, which the tests that need a recorded tree of
   every node type leave out, and remove it at the same time, when the rows of
   the value fields of the diagram type (`VALUE_FIELD_REPORTS` and the other
   tables of the tests of fields and values) are written. The list stays empty
   between two diagram types.
8. Write the section of the diagram type in `docs/db-summaries.md` and `.ja.md`
   (what is dropped, and why).
9. Show as the result the summary fields, and the dropped fields with their
   reasons. The specification and the parser refer to this list
   (`docs/db-summaries.md`).

### 5.3 The fixtures

1. Collect inputs from mermaid's tests that pass diagram text to that diagram
   type's syntax, the mermaid blocks of the documentation, and the demos. For
   Langium diagrams, those tests include the diagram type's tests in mermaid's
   parser package. `SPEC_FILES` in `tools/collect.ts` alone lists which test
   files each diagram type collects, with reasons for exclusions. Do not collect
   unrelated tests or end-to-end tests. The scope is described in
   `tools/README.md`.
2. The collection tools (`tools/collect.ts`, `tools/src/spec-recorder.ts`) take
   the diagram type. What differs between diagram types is only which spec files
   are read and which functions receive the text. Add to `SPEC_FILES` in
   `collect.ts` the diagram type's spec files that pass diagram texts to
   mermaid, with the reason for each file left out. Add the stubs of the modules
   the spec files import and of the functions that receive the text (the
   diagram's parser's `parse`, `Diagram.fromText`, ...) to the list in
   `spec-recorder.ts`, which every diagram type shares.
3. What went wrong with the recorder of spec files in flowchart and sequence:
   - Spec files build their inputs in loops and template literals, so reading
     string literals statically misses them. Run each file against stubs and
     record the strings passed to parse.
   - Pointing the imports at stubs with Node's module hooks (`registerHooks`,
     `register`) is stopped by the lint as an experimental feature, and
     transpiling with TypeScript moves the line numbers. Copy the test file into
     a temporary directory, rewrite only what is between the quotes of each
     import path, and import the copy as it is. Paths of `import("...")` calls
     inside tests are rewritten too; a type-only import is left alone, since
     Node removes it.
   - The temporary directory on macOS is a symbolic link, so pass it through
     `realpathSync` to match the real paths in stack traces.
   - Node evaluates a module once per URL, so put the stub modules in a separate
     directory for each test file.
   - Do not swallow errors that could hide inputs. Make a stub turned into a
     string throw, and stop on a test-body error unless its file, test title and
     error message are listed in `ERRORS_AFTER_THEIR_INPUT` in `collect.ts`,
     with proof that it failed only after its final parse call and every input
     was recorded.
   - Tests that check the layout of the drawing do arithmetic on stubs. Make it
     give `NaN`, and stop when a recorded text contains `NaN`.
   - Tests that render through a real DOM and check the drawing cannot run
     against stubs (sequence's `actorBandModel.spec.ts`). Check that their
     inputs are also in the documentation or the demos, and leave the file out
     with the reason.
   - Check that the line recorded for each input really has a call that passes
     the text.
4. From the documentation and the demos, take only the blocks that mermaid.js's
   detectors (`detectDiagramType`) give the diagram type. Make the text of a
   demo what `mermaid.run()` reads (drop the line feed right after `<pre>`,
   decode character references, apply the `ts-dedent` that mermaid uses, trim).
   This can be checked against the real page in a browser (for flowchart, the
   demos were served on localhost and compared).
5. Collected inputs get no `config`. Their names are
   `<source>-<file>-<first 8 hexadecimal digits of the SHA-256 of the input>`
   (`docs/maintaining-fixtures.md`).
6. Try `fixtures:add-many <diagram> <file> --dry-run`, read the output, then run
   it for real.
7. Go through the "rejected by mermaid" list that `add-many` prints, one by one.
   Mark with `fixtures:set-divergence` as `embedded-data-opaque` each input
   rejected only because of embedded data (an unknown shape or malformed YAML in
   a data block, the frontmatter, a directive). Check by hand that an unusual
   error (`TypeError` and the like) is caused by the input. A
   `MermaidEnvironmentError` means mermaid.js uses a feature Node lacks; give a
   stand-in as in 5.2 (`docs/expected-results.md`). Also probe valid embedded
   settings that change acceptance in either direction, and apply the
   specification's marks and required readings through §7.1 rather than treating
   the rejection list as the whole divergence inventory.
8. Run `fixtures:generate` twice, and check with the hash comparison above that
   the second run changes nothing. Run `fixtures:check`. Run the collection
   again and check that it finds nothing new (the names are stable).
9. Hand-written inputs. Each input answers one question, in one line of its
   note. Before writing them, take the kinds of cases that the earlier diagram
   types needed, and apply each kind to the sentences and the fixtures of the
   new diagram type first, as a list; a kind that does not apply is written down
   with its reason, not left out. For every kind, check each place of the syntax
   that holds text (every field, name, string, and block, in quotes or not, on
   the first line and on the later ones) with mermaid.js. Take the cases from
   the fixture names of the earlier diagram types, not from the wording of the
   list: list the names of the hand-written fixtures of the two nearest diagram
   types (`ls` the directories), and give each name a counterpart in the new
   diagram type or a reason. The list holds the kinds:
   - values that the line rule of `style` and `classDef` lines reaches: the last
     `;` of a line that has `style`, later a `:` and a `#`, dropped from any
     text of the line; the keyword in another case, a space between the `:` and
     the `#`, no `#`, and a `;` on another line, which keep the `;`; two `;`,
     where the first ends a character reference; a line inside quotes, which is
     a line of its own;
   - a comment line, a directive line, and an empty line between a keyword and
     its value; and, where a keyword whose line has no text takes a later line
     as its value (the accessibility texts), the line it takes, whatever that
     line says, such as a statement of the diagram (`accTitle:` followed by
     `line [1]` in xychart);
   - the keyword in another case, and a letter, a word character, a `-`, or a
     character outside ASCII glued after it, for the header and for the keyword
     of every statement;
   - the names of `Object.prototype` (`__proto__`, `constructor`) as a name or
     an id;
   - a second and a third definition of the same name: which one stays, and
     whether the other calls of the grammar action work; make the third one meet
     a partner that is not the first definition;
   - an empty description block (or a statement with no text) that keeps the
     value before it;
   - CRLF, a lone CR, U+2028 and U+2029: as a line end, inside a value or
     quotes, and at the end of the text;
   - a tab and a U+FEFF as whitespace, at the start of a line, inside a value,
     and at the end of a line and of the text;
   - character references, in every text and in quotes, and the `#` of one,
     which starts no comment;
   - values that a directive cuts: a directive inside a value, at its start and
     its end, inside quotes, on the line of the header, glued to a keyword, and
     one that is not closed, which takes the word at the start of the next line
     or the rest of the text;
   - a text that ends inside a context that is not closed: after `accTitle:`, in
     a block with no end, in a quote with no end;
   - what stands after each form of a statement, at the end of its line: ` ;`,
     `;`, `;;`, a comment, a directive that is closed, and one that is not;
   - whitespace at the end of a value, a line, and the text, no-break space and
     U+3000 included, and lines of whitespace only;
   - comment lines and directive lines in the middle of a value that runs over
     several lines;
   - numbers that the Db reads from text: a sign, `-0` (the Db has -0 and JSON
     writes 0), `NaN`, `Infinity`, a number too large for a double, and text
     after the number;
   - values of embedded settings read by the Db;
   - `html-tag-in-frontmatter`: acceptance in both directions and value-only
     differences;
   - a hidden form immediately after a statement (a body `---` block or
     `%%{...}%%`): a following statement after its consumed LF, a blank line
     supplying a spare LF, a space after its closer leaving the LF visible, and
     EOF; include line values that absorb the opener as text;
   - adjacent hidden-block fences: a body-present alternative before an empty
     fallback, with a later qualifying closer and with none, including EOF and
     closing whitespace;
   - a statement on the same line after an optional header flag;
   - a duplicate definition whose second value is on a semantic boundary, such
     as `-0`, in both orders: which value is retained, and whether semantic
     rejection precedes duplicate suppression;
   - the four C4 detection words (`C4Container`, `C4Component`, `C4Dynamic`,
     `C4Deployment`) in every text field: labels, titles, accessibility titles,
     and line and block accessibility descriptions; also in EOF comments after a
     statement and on the header line, with LF-terminated controls;
   - whitespace between a passed bare `%%` line and the header: VT, FF, NBSP,
     BOM, U+1680, U+2000–U+200A, U+202F, U+205F, U+3000, LS and PS, each on a
     whitespace-only line and immediately before the header; include ASCII
     space/tab controls;
   - the one-block detection skip: a second block, a block after a bare `%%{`
     line, a block after real frontmatter, a block before and a block after a
     second-scan directive as separate cases, and a block whose opening and
     closing fences share indentation (six cases);
   - a global directive glued immediately after a keyword, with the next keyword
     or value glued after it: judge the keyword boundary in the text without
     global directives and selected semicolons;
   - a global directive or a selected semicolon inside each diagram atom (a
     fixed word, a header keyword, an arrow, a common keyword, or a class name
     or icon value that cannot contain whitespace), and between its authored
     parts. Inside cases accepted by mermaid.js carry
     `directive-as-token-boundary` or `ignored-semicolon-as-token-boundary`:
     these split the atom itself, whereas a directive glued after a keyword
     touches its end.

   When a kind is missing from the list, add it here in the change that needs
   it.

10. Show as the result the number of fixtures per source (accepted and
    rejected), the unusual rejections, the fixtures marked, and the time
    `fixtures:generate` and `fixtures:check` take.

## 6. Langium diagrams

Use §5 to extract the diagram's behavior and collect its fixed fixtures. Before
generating specified readings for retained forms or opaque embedded data, follow
§7.1. Once the syntax and AST are defined, implement the Db builder and tree
checker from those contracts as follows. Paths below are relative to
`packages/tests`.

`checkTree` checks tree fields, ranges, tokens and lexical invariants only;
semantic acceptance belongs to the parser and is checked by comparing recorded
result kinds with `fixtureAccepts`. Name specification-side modules and helpers
after their rules; engine names identify Mermaid's implementation in the
extraction procedure, not the rules that the tree implements.

1. Read the diagram's syntax and AST documents, the parser's token and position
   contracts, `docs/db-from-tree.md` and `docs/check-tree.md`. Require semantic
   acceptance conditions to be direct sentences of the syntax specification,
   rather than delegated to Db extraction documents. Require their comparison
   values and state transitions to be defined there too, including escaping,
   entity conversion, effective identity and updates after each statement.
   Register every declared node and field in the shared dispatch and field/value
   tables, extending the shared table reader when the AST document's declared
   table shape differs.
2. Implement `src/db-from-tree/<diagram>.ts` from the summary and the
   specification's value and state rules, reusing converted-text, number and
   embedded-value helpers and the stated generated-id order instead of copying
   Mermaid's pipeline. Preserve the documented replacement and ordering rules,
   omit unpublished values even when their nodes exist, and allow an empty
   summary without dropping tree coverage. Write fixed hand-built tree tests for
   the builder, and accepted and broken-tree tests for the checker.
3. Implement `src/check-tree/<diagram>.ts` with shared coverage, field, range,
   token and written-value checks. Check each leaf as a complete lexical unit at
   its position, with that position's first-match priority and keyword/component
   boundaries. Check composite forms against their authored keyword, punctuation
   and value components, including the AST's empty/null and whitespace rules.
   Keep the written spelling checked here distinct from the converter's Db
   reading.
4. Check every retained hidden match exactly once, in source order, in its named
   gap or body position. Use explicit character scanning to find the earliest
   closer within the specification's first applicable alternative, trying a
   body-present match before an adjacent empty fallback where that is the rule.
   Check the whole authored form, not just its kind or value field. Enforce the
   AST's boundary between a statement's trailing gap and body, including whether
   a visible EOL precedes the form.
5. Where a hidden terminal consumes the following LF, keep that LF outside the
   retained form's range. Apply its consumption before checking separators: a
   following statement must have the surviving visible EOL its production
   requires. Check spare LF, lookahead-only closing boundaries, the appended LF
   and EOF separately; EOF can satisfy a production without a written EOL.
6. At each native Comment after the header, check that no earlier-priority
   terminal matches at that unit position and that no earlier string or
   composite value encloses its start. Use explicit character scanning for
   terminal matches. Distinguish source comment regions from native Comments.
   Before the header, bare lines passed by detection are Comments and their
   accompanying passed whitespace and line terminators are trivia; do not read
   them again as diagram units. Retained prefixes still follow their own
   terminal rules. Keep ordinary body gaps and hidden closing boundaries as
   strict as the diagram specifies; the detection exception applies only to the
   intervals it passed.
7. Write explicit accepted and broken trees in
   `tests/check-tree-<diagram>.test.ts`. Break ownership by losing, duplicating
   or moving a hidden form; choose a later closer within the selected
   alternative or an adjacent empty close despite a qualifying body match;
   include its consumed LF in its range; remove the surviving EOL; change
   authored components; and disguise an earlier terminal as Comment. Include
   accepted controls for hidden-looking text inside enclosing values, spare LF
   and EOF. Write fixed cases for each retained prefix followed by
   detection-passed bare lines and their Unicode trivia, and with passed trivia
   between retained forms. Include controls without a passed line. Check that
   ordinary body gaps stay strict. Derive these cases from each sentence and its
   rule intersections, not from corpus success alone.
8. Document the builder in `docs/db-from-tree/<diagram>.md` and the checks in
   `docs/check-tree.md`, both with Japanese pairs and fixtures for each
   distinguishing case. While trees are being recorded, implement from the
   specification and fixed hand-built trees rather than waiting to infer the
   contract from records. Once trees are recorded, run the checker on every
   recorded tree and compare every comparable `dbFromTree` result with its
   recorded reading, using the shared embedded-value helpers. Report actual tree
   and Db counts, missing records, and each mismatch with its input; do not
   silently skip a missing tree or an error record for an accepting reading, and
   skip an error record only when its mark's reading rejects. Keep cases without
   a comparison Db explicit as in §7.1.

## 7. Fixture tools and lists for the other packages

The fixtures that back the claims of the specification are added with the tests
generator (`fixtures:add-many` and the others; the policies and the steps are in
the spec's skill). This skill does the following.

1. Keep the tools and the format: the generator, `add`, `add-many`,
   `set-divergence`, `set-note`, the loader and the collection tools work as
   `docs/maintaining-fixtures.md` describes. How to use the tools is in that
   document. When the use of a tool changes, change that document (English and
   Japanese) in the same change.
2. When the Known divergences of the specification
   (`packages/spec/docs/known-divergences.md`) change, update the list of
   identifiers (`KNOWN_DIVERGENCES` in `src/index.ts`, and the list in the
   README) to match. Set each identifier's direction and specified-reading
   requirement explicitly in `DIVERGENCE_PROPERTIES` of
   `src/fixture-acceptance.ts`. Have consumers use `fixtureAccepts()` for
   fixture acceptance. For divergence-form checks, follow §6 of the
   [parser skill](../parser/SKILL.md). The loader rejects an identifier outside
   the list, so to rename an identifier: (1) add the new identifier to the list
   (keep the old one), (2) move the fixtures to the new identifier with
   `fixtures:set-divergence`, (3) remove the old identifier from the list. To
   withdraw an identifier, remove the marks first, then remove it from the list.
   A test checks the list in the README (both READMEs have an item for each
   identifier).
3. To rename a fixture (for example, when a change of the specification makes
   its name wrong), check with mermaid.js that the old name carries no mark and
   that the input gives the result the name says, then move the directory with a
   plain `mv` and run `fixtures:check`. Check with grep that nothing in tests
   and tools refers to the old name. References in the text of the specification
   are fixed by the steps of the spec's skill.
4. To keep an input on which the parser failed (from a review, a generated
   input, a differential run), make it a fixture of the corpus: the input of a
   failure kept in a file of the parser is not kept for the other
   implementations, and every implementation checks the fixtures. The inputs of
   the formatter and of the lint rules stay in their packages. Check the
   expectations (acceptance, Db values) with mermaid.js before adding it. If
   they disagree, do not add it, and show that. If the failure is that the
   specification has no sentence for the form, the specification gets the
   sentence first. Keep one input of each shape, where the shape of an input is
   the input with each run of letters and digits replaced by one mark (a keyword
   is kept in the case it is written in, so `State` and `state` are two shapes)
   and every other character kept: blanks, U+2028, U+2029, punctuation, and the
   text of directives and comments. Inputs are compared with the other inputs of
   the same file of failures only: the same shape found for another kind of
   failure is kept, since it was kept for another reason. When the input comes
   from another package's file, only read it, take the strings out through the
   syntax tree, and match them byte for byte. Follow the existing names
   (prefixes such as `gram-`, `lex-`, `db-`, `tokens-`, `config-`, a name of
   what the input shows and, for many inputs of one topic, the first 8
   hexadecimal digits of the SHA-256 of the input), write in the note what the
   input shows (not the name of the review or the run that found it), and add it
   with `fixtures:add-many` (`fixtures:add` cannot set a mark). The tests of the
   implementations read the new fixture with the others; the file of the
   failure's input is then removed from the package that had it.
5. Show as the result what changed, the names added, the counts, and the result
   of `fixtures:check`.

### 7.1 Specified readings for retained forms and embedded data

1. Before generating `specified.json` for a newly admitted retained form, write
   fixed marked cases where each new retained prefix meets each relevant
   divergence removal, including prefixes before and between passed bare lines
   and their trivia. Run them through the existing `specifiedRunOf` in
   `tools/src/specified-reading.ts` and the fixture CLI's dry-run path. Inspect
   the reference text, acceptance, Db and embedded title, configuration and data
   block effects against the specification's intended reading. Preserve retained
   source text and the shared frontmatter and configuration reading.
2. Take the direction and specified-reading requirement for
   `embedded-data-opaque` from its row in `DIVERGENCE_PROPERTIES`
   (`packages/tests/src/fixture-acceptance.ts`), and implement the reading in
   [The comparison Db](../../../packages/spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
   Exercise `opaqueReferenceInput` and `specifiedRunOf` in
   `tools/src/specified-reading.ts` through the existing CLI path with fixed
   frontmatter and directive cases for the directions in that row. Inspect the
   reference text, the configuration and title returned by
   `readMermaidConfiguration` in `packages/tests/src/mermaid.ts`, and the
   generated acceptance, Db and embedded values against that definition. Check
   `OPAQUE_ACCEPTANCE_KEYS` against the specification's named keys. Include a
   retained title beside an acceptance key and a valid Db setting beside a
   rejected block.
3. If a shared helper needs extending, read its other callers and check their
   marked fixtures, including other diagram types. Add fixed regression tests to
   the shared helper's tests. Hash every existing `specified.json` before and
   after generation, run `generate --check` across all categories, and classify
   every record change before accepting it, including acceptance, Db, embedded
   values and added or removed records. Extend the existing shared path; do not
   add a diagram-local reading or assume the tools already cover a newly
   retained form.
4. After checking the reference path, run the stable-generation steps of §5.3.8.
   Count marks and required readings from the current corpus after the CLI
   operation rather than trusting a handed-down fixture count, and report any
   missing record. Keep opaque-data cases with no comparison Db explicit in
   tests and the report; do not invent a specified reading or Db to make them
   comparable.

## 8. Updating mermaid.js

1. Change the devDependency `mermaid` in `packages/tests/package.json` to the
   new version, and run `pnpm install` (`pnpm-lock.yaml` is a shared file at the
   root). Make the clone again at the tag of the new version. Run every step of
   this section with `MMD_TOOLKIT_MERMAID_CACHE=disabled`, so that what is
   compared is mermaid.js itself; the new version gives new keys to the store
   anyway.
2. Fix what is tied to the version. Find it by searching `packages/tests` and
   `tools/` (without `fixtures/`, `lib/` and `node_modules/`) for the old
   version and the old commit:
   - the version check in `tests/mermaid.test.ts`, the tag of the clone in
     `tools/README.md`, and the version named in `README.md`;
   - the name of the chunk of the bundle that holds the registry of diagrams, in
     `src/mermaid.ts` (`readMermaidConfiguration()`): the bundler names chunks
     by a hash, so it changes with the version. It is the file of
     `dist/chunks/mermaid.core/` of the installed `mermaid` that exports
     `getDiagramLoader`. With the old name, every fixture whose configuration is
     read fails with `Cannot find module`;
   - the permalinks to mermaid.js's source in `docs/` and in `tools/collect.ts`.
     Change the commit (a script that maps each range through a line diff of the
     file between the two tags finds the ranges whose lines did not change; read
     the others), and move the line numbers to the same code in the new version:
     where the same lines appear once in the new file, take their place; where
     the code changed, find the function and choose the range again, then read
     whether the claim of the sentence holds in the new code: if it does not,
     the sentence reports a change of mermaid.js, so classify the change as in
     step 4 and rewrite the sentence; where the file or what the sentence names
     is gone, rewrite the sentence;
   - comments in `src/` that make a claim about the version (the frontmatter
     functions copied in `src/mermaid.ts`, the class name of the YAML error in
     `src/rejections.ts`, the Dbs that call `formatUrl()` in
     `src/normalizers/index.ts`). Check the claim in the new version before
     changing the version.

   A version that is an example of a recorded value (the `ref` of a fixture's
   `source`, in `src/index.ts` and `docs/maintaining-fixtures.md`) stays as it
   is. The commit in the specification's `packages/spec/docs/index.md` is fixed
   by the steps of the spec's skill; until then, `pnpm run lint:docs` reports
   every link of these documents.

3. Check that the patches and the premises still hold with the new version:
   - making DOMPurify the identity: a test checks it;
   - the Db patches (`setLink` and `addVertex` for flowchart): compare the Db
     class between the two tags;
   - the two checks of the data block recording, and the steps of `runMermaid()`
     (`docs/expected-results.md`): the tests do not check these. They are
     checked by running every fixture in step 4. `runMermaid()` throws
     `MermaidEnvironmentError` when `mermaid.parse()` accepts a text that
     `getDiagramFromText()` rejects, and the recording of data blocks throws
     when a block does what it does not expect;
   - the lexer rules of each divergence removal (`src/divergence-removals.ts`,
     the option `withoutDivergences`): `runMermaid()` finds them by their
     compiled pattern (a rule whose order changes, among the rules that only its
     start state tries) and stops with `MermaidEnvironmentError` when one is
     missing or found twice, or when a call cannot tell where the lexer is in
     its line, so the tests fail. Then read the new lexer, and check with the
     steps of the spec's skill whether the divergence still exists; change the
     table or the identifier to match.
4. Run `fixtures:check`. It writes nothing, does not stop at a fixture that
   cannot be generated, and prints each fixture whose `expected.json` would
   change with how it changed, then the fixtures that cannot be generated
   (`docs/maintaining-fixtures.md`). Classify from that list before deciding
   anything:
   - `acceptance` or `Db values`: a change of syntax. It concerns the updates of
     the specification (the spec's skill) and the parser (the parser's skill). A
     diagram type that the new version lacks shows as `acceptance` to
     `UnknownDiagramError` on the `common/` fixtures that use it; that belongs
     with detection below;
   - `summary fields`: a change inside the Db, unless the keys are ones an
     author wrote. Decide, in the same table as in 5.2, whether to change the
     normalizer or to drop the field;
   - `detection`, or a diagram type that is new or gone: it concerns
     `diagramIds` and the specification's `packages/spec/docs/detection.md` (it
     is changed by the steps of the spec's skill);
   - `error name`: check that the new name is still caused by the input (the
     generator lists the names outside the standard rejections);
   - `error message only`: nothing to do, since implementations do not compare
     it;
   - `embedded values`: a change in the title, the data block effects or the
     configuration that an input gives. Check that the implementations still
     build their Db from them; a change of mermaid.js's defaults shows as a
     change of `default-config.json`;
   - `specified.json added`, `removed` or changed: the reading of the
     specification for a fixture with a mark that changes how mermaid.js reads,
     as for `acceptance` and `Db values`;
   - a fixture that cannot be generated because of a `MermaidEnvironmentError`:
     `mermaid.parse()` and `getDiagramFromText()` disagree, or mermaid.js uses a
     feature Node lacks. The steps of `runMermaid()` no longer hold. How to
     record such inputs changes the definition in `docs/expected-results.md` and
     what implementations are compared with, so present the options with the
     fixtures and a recommendation, and ask for a decision before going on;
   - a line marked `knownDivergence`: whether the mark still applies is checked
     by the steps of the spec's skill.

   Then run `fixtures:generate` to write the files.

5. Collect again from the tag of the new version. Names depend on the input, so
   existing names do not change and only new inputs are added. Inputs that
   mermaid.js no longer has stay as fixtures. When the collector stops because a
   test file imports a module without a stub, add the stub in
   `tools/src/spec-recorder.ts` and collect again (`tools/README.md`).
6. Make the CI job `fixtures` pass (it fails when `fixtures:generate` leaves a
   difference). It cannot pass while a `MermaidEnvironmentError` remains.
7. Show as the result the classified differences (the fixture names and what
   changed), grouped by the package they concern.

The steps of this section have not yet been through a real update. At the first
real update, check them as they are followed, together with the update steps in
the skills of spec, parser and prettier-plugin, and correct on the spot what
proves wrong or missing.

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

## 5. Adding a diagram type (Jison)

Diagram types are added one at a time. Each is finished in this order before the
next one starts: the normalizer and the fixtures (this section), the
specification (the spec's skill), the parser (the parser's skill), the printer
(the prettier-plugin's skill). Each piece of work uses the results of the ones
before it: the specification and the parser refer to the list of summary fields
(`docs/db-summaries.md`), and the claims of the specification and the tests of
the parser use the fixtures. The steps that build the summary from a tree are
written here after the tree document of the specification
(`docs/db-from-tree/<diagram>.md` and `src/db-from-tree/<diagram>.ts`).

### 5.1 Input

- The name of the diagram type to add, and the diagram ids that share its Db
  (found in mermaid.js's list of detectors and in the `db` of each diagram
  definition). One detector can stand for several keywords: `classDiagram` and
  `classDiagram-v2` are both detected as `classDiagram`. The diagram type's
  fixtures go in one directory, whatever ids it has.
- A clone of mermaid.js at the tag of the pinned version (in `.work/mermaid`,
  which `.gitignore` lists; how to make it is in `tools/README.md`).

### 5.2 The normalizer

1. In the clone, open the grammar definition (`.jison`) and the Db class of the
   diagram type. List every private field of the Db, and every Db method the
   grammar calls (the `yy.` calls). Look for every place the Db reads a browser
   global (`window`, `document`, `Option`, `CSS`), and whether it runs while
   mermaid parses or only after rendering (class's click callbacks and tooltips
   run after rendering and need nothing).
2. Make a table of the proposed summary fields: for each field, whether the
   syntax determines it, why it is kept, and what is dropped and why. Always ask
   whether the following should be dropped (the flowchart and sequence examples
   in parentheses):
   - a value used only for rendering, or filled in by the renderer (`domId`,
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
     is taken from the layout data `getData()`);
   - an id that mermaid.js makes at random (state's region after the last `--`).
     Replace it, wherever it appears, with a name numbered in a stated order,
     and check with two runs of the generator that the fixtures do not change;
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
   of the tests that read every fixture in `tests/fixtures.test.ts`.
6. Add tests in `tests/` (dropped fields do not appear, a patch does not change
   the summary, data block effects).
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

1. Inputs come from three places: the spec files of the diagram type, the
   mermaid blocks of the documentation, and the demos. Do not collect outside
   them (spec files in other directories, the end-to-end tests). The scope is
   written in `tools/README.md`.
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
   - Do not swallow errors of test bodies. Make a stub turned into a string
     throw, and stop the collection when a test ended with an error (inputs
     would be missing without a trace).
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
   stand-in as in 5.2 (`docs/expected-results.md`).
8. Run `fixtures:generate` twice, and check with the hash comparison above that
   the second run changes nothing. Run `fixtures:check`. Run the collection
   again and check that it finds nothing new (the names are stable).
9. Show as the result the number of fixtures per source (accepted and rejected),
   the unusual rejections, the fixtures marked, and the time `fixtures:generate`
   and `fixtures:check` take.

## 6. Langium diagrams

To be written with pie (the first Langium diagram).

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
   README) to match. The loader rejects an identifier outside the list, so to
   rename an identifier: (1) add the new identifier to the list (keep the old
   one), (2) move the fixtures to the new identifier with
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
4. To keep an input on which the parser failed (found by a review, a generated
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
   - the permalinks to mermaid.js's source in `docs/` and in `tools/collect.ts`.
     Change the commit, and move the line numbers to the same code in the new
     version: where the same lines appear once in the new file, take their
     place; where the code changed, find the function and choose the range
     again; where the file or what the sentence names is gone, rewrite the
     sentence;
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

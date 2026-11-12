---
name: tests
description: >-
  The policies of @mmd-toolkit/tests and tools/, how to check a claim with
  mermaid.js, and the fixture tools and lists that the other packages use
  (adding, renaming, and marking fixtures, known divergence identifiers,
  specified readings). Use for any work on packages/tests or tools/, and when a
  fixture, a rename or a known divergence identifier is needed. Adding a diagram
  type, the tree checks, and updating mermaid.js have skills of their own that
  use this one.
---

# The truth from mermaid.js, and the fixtures (tests)

The steps of the work on `@mmd-toolkit/tests` and `tools/` that every piece of
work follows, and the fixture tools and lists that the other packages use. The
policies and criteria are in section 1; what holds for every package is in
AGENTS.md and the skill `conventions`. Adding a diagram type is in the skill
[tests-diagram-type](../tests-diagram-type/SKILL.md), the Db builder and the
tree checker in [tests-tree-checks](../tests-tree-checks/SKILL.md), and updating
the pinned mermaid.js in
[tests-mermaid-update](../tests-mermaid-update/SKILL.md); sections 1 to 4 of
this skill hold for their steps too.

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
   AGENTS.md; and the skill `conventions` before writing code or a document.
2. `packages/tests/README.md`, the documents in `packages/tests/docs/`, and
   `tools/README.md`. The fixture format, how the expected results are obtained,
   Db summaries, the values from embedded data, and the steps for maintaining
   and collecting fixtures are there.

## 3. The working tree

- The steps of this skill and of the skills `tests-diagram-type`,
  `tests-tree-checks`, and `tests-mermaid-update` write only `packages/tests`,
  `tools/`, and the documents of these skills. When another package
  (`packages/spec`, `packages/parser`, `packages/prettier-plugin-mmd`) needs a
  change, make it by the steps of that package's skill. When taking inputs from
  another package's tests, only read them.
- Commit and push only when asked to (the "Principles" of AGENTS.md). Rename a
  fixture by moving its directory with a plain `mv`; `git mv` also changes the
  staging.
- The shared files at the root (`package.json`, `pnpm-lock.yaml`,
  `eslint.config.mjs`, `prettier.config.js`, `tsconfig.json`,
  `.github/workflows/`, `scripts/`) act on every package. Change them only when
  needed, and after a change run the checks of the whole repository
  (`pnpm run lint` and the whole test suite).
- Put scripts and temporary files for checks in a working directory outside the
  repository.
- Removing fixture directories is irreversible. When something must be removed,
  show the list and the commands, and ask for a decision.
- The Write tool and shell here-documents may turn an escape such as `\u00a0`
  into the real character. After writing source or documents, run
  `node scripts/check-invisible-chars.mjs`.
- Read the result of `eslint --fix` and of Prettier, as the skill `conventions`
  says.
- Do not edit a tracked file temporarily to try something (it may be staged in
  the middle); try it in a copy outside the repository.
- Do not change the git staging or the checked-out files (`git add`, `git mv`,
  `stash`, `checkout`, `reset`).
- Stop only the processes that you started, and not by name (`pkill -f vitest`
  also stops every other run of the tests on the machine).

## 4. How to check (in every piece of work)

- Before taking in a claim, whoever makes it, check it by running mermaid.js.
  Put the following script in the working directory outside the repository as
  `probe.mts`, replace `<repo>` with the absolute path of the root of the
  repository, and run it with `node <working directory>/probe.mts` (Node runs
  TypeScript as it is, from any directory). The extension `.mts` makes it an ES
  module, where top-level `await` is allowed. Import the source file by its
  absolute path: from outside the repository, the package names do not resolve.
  Node only removes types, so write a type-only import as `import type`, and do
  not use `enum`, `namespace` or parameter properties.

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
  try the whole set of characters at the boundary (for example, for the
  whitespace left at the end of a style value, put each character of
  JavaScript's `\s` other than LF and CR (the line whitespace of the
  specification) there and run mermaid.js). Check that results do not change
  across every fixture, or every collected input.
- Which tests to run, and when, follows
  ["Running tests"](../conventions/SKILL.md#running-tests) in the skill
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
  | `src/ordered-json.ts`                                       | `ordered-json.test.ts`, `tools-fixture-store.test.ts`        |
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
  pointing outside the repository, reading the file it writes. What to keep when
  the recorder (`tools/src/spec-recorder.ts`) changes is in step 3 of
  [references/collecting-fixtures.md](../tests-diagram-type/references/collecting-fixtures.md)
  of the skill tests-diagram-type.

  Run one file with
  `pnpm --filter @mmd-toolkit/tests exec vitest run tests/<file>`.
  `fixtures.test.ts` reads both READMEs (each known divergence has an item), so
  it runs after a change to a README as well. The whole run of the package
  (`pnpm --filter @mmd-toolkit/tests test`) is the run before a completion is
  reported. `fixtures:check` runs after a change to how a result is made or
  recorded (`src/mermaid.ts`, a normalizer, the format, the generator), and
  before the completion of such a change is reported. The other packages run
  their own tests of what they use. A test that reads every fixture in one test
  gets an explicit time limit, set from its measured time alone (do not rely on
  the default of 5 seconds).

- `runMermaid()` gives back stored results for a text it has run before, keyed
  by the code of `src/` or `lib/`, so a change to the code never gets an old
  result (`docs/expected-results.md`). The tests of this package and the
  generator run without the store, but for one test of the store, which runs a
  text through the store of the repository; a probe runs with it unless
  `MMD_TOOLKIT_MERMAID_CACHE=disabled` is set. Only the files of `src/` in
  `RESULT_FILES` are in the key, so changing them makes every stored result
  unused: keep that list right (a test checks it). A change to those files is
  made when no long run is going, whose stored results it would throw away; only
  a fix of a wrong result goes in at once.
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
  tests of the other packages, the tools and the type check read `src/`, so a
  change to `src/` reaches their next run at once. `lib/` is what the name of
  the package loads anywhere else, as in a plain `node` script.

## 5. Fixture tools and lists for the other packages

The fixtures that back the claims of the specification are added with the tests
generator (`fixtures:add-many` and the others; the policies and the steps are in
the spec's skill). When `add-many` lists an input as rejected by mermaid.js only
because of embedded data, mark it as step 7 of
[references/collecting-fixtures.md](../tests-diagram-type/references/collecting-fixtures.md)
in the skill tests-diagram-type says. This skill does the following.

1. Keep the tools and the format: the generator, `add`, `add-many`,
   `set-divergence`, `set-note`, the loader and the collection tools work as
   `docs/maintaining-fixtures.md` describes. When the use of a tool changes,
   change that document (English and Japanese) in the same change.
2. When the Known divergences of the specification
   (`packages/spec/docs/known-divergences.md`) change, update the list of
   identifiers (`KNOWN_DIVERGENCES` in `src/index.ts`, and the list in the
   README) to match. Set each identifier's direction and specified-reading
   requirement explicitly in `DIVERGENCE_PROPERTIES` of
   `src/fixture-acceptance.ts`. Have consumers use `fixtureAccepts()` for
   fixture acceptance. For divergence-form checks, follow §6 of the
   [parser skill](../parser/SKILL.md#6-when-fixtures-are-added-or-a-rule-changes).
   The loader rejects an identifier outside the list, so to rename an
   identifier: (1) add the new identifier to the list (keep the old one), (2)
   move the fixtures to the new identifier with `fixtures:set-divergence`, (3)
   remove the old identifier from the list. To withdraw an identifier, remove
   the marks first, then remove it from the list. A test checks the list in the
   README (both READMEs have an item for each identifier).
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
   the same file of failures only: the same shape from another kind of failure
   is kept, since the other file holds it for another reason. When the input
   comes from another package's file, only read it, take the strings out through
   the syntax tree, and match them byte for byte. Follow the existing names
   (prefixes such as `gram-`, `lex-`, `db-`, `tokens-`, `config-`, a name of
   what the input shows and, for many inputs of one topic, the first 8
   hexadecimal digits of the SHA-256 of the input), write in the note what the
   input shows (not the name of the review or the run it came from), and add it
   with `fixtures:add-many` (`fixtures:add` cannot set a mark). The tests of the
   implementations read the new fixture with the others; the file of the
   failure's input is then removed from the package that had it.
5. Show as the result what changed, the names added, the counts, and the result
   of `fixtures:check`.

### 5.1 Specified readings for retained forms and embedded data

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
4. After checking the reference path, run the stable-generation steps of step 8
   of
   [references/collecting-fixtures.md](../tests-diagram-type/references/collecting-fixtures.md)
   of the skill tests-diagram-type. Count marks and required readings from the
   current corpus after the CLI operation rather than trusting a count stated
   elsewhere, and report any missing record. Keep opaque-data cases with no
   comparison Db explicit in tests and the report; do not invent a specified
   reading or Db to make them comparable.

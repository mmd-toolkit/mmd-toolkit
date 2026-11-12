---
name: tests-mermaid-update
description: >-
  Update the mermaid.js that @mmd-toolkit/tests pins: the version and what is
  tied to it, the patches and premises, the regenerated fixtures and the
  classification of their differences, and a new collection. Use when the pinned
  mermaid.js is to be updated, together with the tests skill.
---

# Updating mermaid.js (tests-mermaid-update)

Sections 1 to 4 of the skill [tests](../tests/SKILL.md) (the policies and
criteria, what to read first, the working tree, and how to check) hold for these
steps too. Read them first.

1. Change the devDependency `mermaid` in `packages/tests/package.json` to the
   new version, and run `pnpm install` (`pnpm-lock.yaml` is a shared file at the
   root). Make the clone again at the tag of the new version. Run every step of
   this skill with `MMD_TOOLKIT_MERMAID_CACHE=disabled`, so that what is
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
   - the checks of the data block recording, and the steps of `runMermaid()`
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
     the specification (the spec's skill) and the parser (the parser's skill).
     It also concerns this package: where the new Db reads a text differently (a
     merge of repeated definitions, a comment line that is kept), change
     `src/db-from-tree/<diagram>.ts` and the checks in `src/check-tree/`, and
     their documents `docs/db-from-tree/<diagram>.md` and `docs/check-tree.md`
     with their Japanese pairs, then run the whole test suite of the package. A
     diagram type that the new version lacks shows as `acceptance` to
     `UnknownDiagramError` on the `common/` fixtures that use it; that belongs
     with detection below;
   - `summary fields`: a change inside the Db, unless the keys are ones an
     author wrote. Decide, in the same table as in section 2 of the skill
     [tests-diagram-type](../tests-diagram-type/SKILL.md#2-the-normalizer),
     whether to change the normalizer or to drop the field;
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
   `tools/src/spec-recorder.ts` and collect again (`tools/README.md`). The steps
   of a collection, and what to keep when the recorder changes, are in
   [references/collecting-fixtures.md](../tests-diagram-type/references/collecting-fixtures.md)
   of the skill tests-diagram-type.
6. Make the CI job `fixtures` pass (it fails when `fixtures:generate` leaves a
   difference). It cannot pass while a `MermaidEnvironmentError` remains.
7. Show as the result the classified differences (the fixture names and what
   changed), grouped by the package they concern.

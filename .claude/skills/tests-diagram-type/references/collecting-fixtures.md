# Collecting the fixtures (tests-diagram-type)

Section numbers below are those of [SKILL.md](../SKILL.md).

1. Collect inputs from the tests of mermaid that pass diagram text to the syntax
   of that diagram type (for Langium diagrams, including the diagram type's
   tests in mermaid's parser package), the mermaid blocks of the documentation,
   and the demos. `SPEC_FILES` in `tools/collect.ts` alone lists the test files
   each diagram type collects, with reasons for exclusions; the scope is in
   `tools/README.md`.
2. Between diagram types, the collection tools (`tools/collect.ts`,
   `tools/src/spec-recorder.ts`) differ only in which spec files are read and
   which functions receive the text. Add to `SPEC_FILES` in `collect.ts` the
   diagram type's spec files that pass diagram texts to mermaid, with the reason
   for each file left out. Add the stubs of the modules the spec files import
   and of the functions that receive the text (the diagram's parser's `parse`,
   `Diagram.fromText`, ...) to the list in `spec-recorder.ts`, which every
   diagram type shares.
3. The recorder of spec files (`tools/src/spec-recorder.ts`) runs each spec file
   against stubs. What it relies on, and what to keep when changing it or adding
   a diagram type:
   - Spec files build their inputs in loops and template literals, so reading
     string literals statically misses them. Run each file against stubs and
     record the strings passed to parse.
   - The lint stops Node's module hooks (`registerHooks`, `register`) as an
     experimental feature, and transpiling with TypeScript moves the line
     numbers. So the recorder copies the test file into a temporary directory,
     rewrites only what is between the quotes of each import path, and imports
     the copy as it is. Paths of `import("...")` calls inside tests are
     rewritten too; a type-only import is left alone, since Node removes it.
   - The temporary directory on macOS is a symbolic link, so pass it through
     `realpathSync` to match the real paths in stack traces.
   - Node evaluates a module once per URL, so put the stub modules in a separate
     directory for each test file.
   - Errors must not hide inputs. A stub turned into a string throws, and the
     run stops on a test-body error unless its file, test title and error
     message are listed in `ERRORS_AFTER_THEIR_INPUT` in `collect.ts`, with
     proof that it failed only after its final parse call and every input was
     recorded.
   - Tests that check the layout of the drawing do arithmetic on stubs. The
     stubs give `NaN`, and the run stops when a recorded text contains `NaN`.
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
   This can be checked against the real page in a browser: this one check needs
   the dependencies installed in the clone, which collection does not. Start the
   dev server of the clone (`pnpm run dev`), which builds the `mermaid.esm.mjs`
   that the demo pages import and serves the demos, open the demo page, and
   compare.
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
   stand-in as in section 2 (`docs/expected-results.md`). Also probe valid
   embedded settings that change acceptance in either direction, and apply the
   specification's marks and required readings through section 5.1 of the skill
   [tests](../../tests/SKILL.md#51-specified-readings-for-retained-forms-and-embedded-data)
   rather than treating the rejection list as the whole divergence inventory.
8. Run `fixtures:generate` twice, and check with the hash comparison of section
   4 of the skill
   [tests](../../tests/SKILL.md#4-how-to-check-in-every-piece-of-work) that the
   second run changes nothing. Run `fixtures:check`. Run the collection again
   and check that it finds nothing new (the names are stable).

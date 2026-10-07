# tools

Japanese version: [README.ja.md](./README.ja.md)

Command-line tools for the people who maintain the fixtures of
`@mmd-toolkit/tests`: regenerating them, adding and marking them, collecting
inputs from mermaid.js. Run them through the package scripts of
`packages/tests`; the commands and rules are in
[maintaining-fixtures.md](../packages/tests/docs/maintaining-fixtures.md).

| File          | Script                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `fixtures.ts` | `fixtures:generate`, `fixtures:check`, `fixtures:add`, `fixtures:add-many`, `fixtures:set-divergence`, `fixtures:set-note` |
| `collect.ts`  | `fixtures:collect`                                                                                                         |

## Collecting the inputs of a diagram type from mermaid

`collect.ts` reads the test files, the documentation and the demo pages of a
mermaid checkout, for one diagram type. What it takes is described under "Inputs
taken from mermaid" in
[maintaining-fixtures.md](../packages/tests/docs/maintaining-fixtures.md). Do
this when a diagram type is added, and after mermaid is upgraded, to add the
inputs the new version brings.

Of the test files, it reads only the diagram type's own files that pass diagram
texts to mermaid, listed in `SPEC_FILES` in `collect.ts` with the reason for
each file left out. Texts in other test files of mermaid, such as
`mermaid.spec.ts`, `mermaidAPI.spec.ts`, `diagram.spec.ts`, the tests under
`rendering-util` and the end-to-end tests, are not collected: the inputs come
from the diagram's own test files, its documentation and the demos.

1. Clone mermaid outside this repository, at the tag of the pinned version
   (`mermaid@` followed by the version of the `mermaid` devDependency in
   `packages/tests/package.json`):

   ```sh
   git clone --depth 1 --branch mermaid@12.0.0 https://github.com/mermaid-js/mermaid.git /path/outside/the/repository/mermaid
   ```

   The collector checks that the checkout is at that tag. Nothing needs to be
   installed in the checkout: the test files run against stubs, so no code of
   the checkout other than the test files themselves is loaded, and mermaid's
   detection comes from the pinned mermaid of `packages/tests`.

2. Collect, writing the result outside the repository (here for `sequence`):

   ```sh
   pnpm --filter @mmd-toolkit/tests run fixtures:collect sequence --mermaid /path/outside/the/repository/mermaid --out /tmp/sequence.json
   ```

   For each test file it reports the number of tests run, the inputs recorded
   and the tests that ended with an error; then how many inputs it found, how
   many are new, and how many it left out as already fixtures or repeats. These
   stop the run before anything is written:

   - a test that ended with an error, in its body, a hook or a promise it handed
     to `expect`. It may have stopped before some of its parse calls, so inputs
     would be missing without a trace. The recorder's stubs
     (`src/spec-recorder.ts`) accept any use except being turned into a string,
     which would put the stub into a recorded text, so an upstream test that
     needs more makes itself seen here. Extend the stubs to cover what the
     listed tests use, and collect again;
   - a recorded text that contains `NaN`: arithmetic on a stub gives `NaN`, so a
     stub may have produced it;
   - a test file that imports a module the recorder has no stub for;
   - two different inputs whose names would clash.

3. Add the new inputs, first without writing:

   ```sh
   pnpm --filter @mmd-toolkit/tests run fixtures:add-many sequence /tmp/sequence.json --dry-run
   pnpm --filter @mmd-toolkit/tests run fixtures:add-many sequence /tmp/sequence.json
   ```

4. Check the inputs mermaid rejects, which `add-many` lists with their errors.
   The specification does not read embedded data (Known divergence
   `embedded-data-opaque`), so an input mermaid rejects only because of it is
   accepted there: an unknown shape or malformed YAML in a `@{ ... }` data
   block, malformed frontmatter YAML, or directive contents mermaid cannot use.
   Mark each such fixture:

   ```sh
   pnpm --filter @mmd-toolkit/tests run fixtures:set-divergence divergences.json
   ```

   with `{ "sequence/<name>": "embedded-data-opaque" }`. The parser's acceptance
   comparison reports any that are missed.

5. Check that the fixtures are stable: `fixtures:generate` twice, the second run
   reporting `0 changed`, and `fixtures:check`.

Existing fixtures keep their names, since a name depends only on the input and
the file it was first found in. An input that mermaid no longer has stays a
fixture until someone removes it by hand.

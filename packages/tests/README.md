# @mmd-toolkit/tests

Japanese version: [README.ja.md](./README.ja.md)

Fixtures and tools for testing an implementation of the Mermaid diagram syntax
against mermaid.js. Every fixture records what the pinned mermaid.js
(`mermaid@12.0.0`) does with its input.

This is a third-party project, unrelated to mermaid-js.

## Installation

The package is private and is used inside this repository's workspace. Add it as
a development dependency, and build it once: consumers load the built files in
`lib/`.

```json
{ "devDependencies": { "@mmd-toolkit/tests": "workspace:*" } }
```

```sh
pnpm --filter @mmd-toolkit/tests run build
```

It runs on Node `^22.18.0 || ^24.11.0 || >=26.0.0`.

## Quick start

Find the fixtures that your implementation accepts or rejects differently from
mermaid.js. Here `accepts` stands for your implementation.

```js
import { loadFixtures } from "@mmd-toolkit/tests"

for (const fixture of await loadFixtures("flowchart")) {
  // On these inputs the specification deliberately differs from mermaid.js.
  if (fixture.knownDivergence !== undefined) continue
  if (accepts(fixture.input) !== fixture.expected.accepted) {
    console.log(
      `${fixture.name}: mermaid.js ${fixture.expected.accepted ? "accepts" : "rejects"} it`,
    )
  }
}
```

Ask mermaid.js about any text:

```js
import { runMermaid } from "@mmd-toolkit/tests/mermaid"

const outcome = await runMermaid("flowchart LR\n  A --> B\n")
console.log(outcome.accepted, outcome.diagramType, outcome.db.edges.length)
// true flowchart-v2 1

const rejected = await runMermaid("flowchart LR\n  A -->\n")
console.log(rejected.accepted, rejected.error.name)
// false Error
```

## What the fixtures contain

Each fixture is a directory `fixtures/<diagram>/<name>/` in this package
(`getFixturesRoot()` gives its absolute path). `<diagram>` is a diagram type
(`flowchart`, `sequence`) or `common`, for syntax that every diagram type shares
(frontmatter, directives, comments, diagram detection).

- `input.mmd`: the text under test, byte for byte.
- `expected.json`: what mermaid.js did with it.
- `ast.json`: the tree that the reference implementation (`@mmd-toolkit/parser`)
  returns for the input, present only for inputs it accepts.
- `parse-error.json`: the `message`, `range` and `loc` of the `ParseError` with
  which the reference implementation rejects the input, present only for inputs
  it rejects that way. The specification does not define where an error is; the
  reference implementation chooses it, by the rules in
  [error-positions.md](../parser/docs/error-positions.md).

A fixture has at most one of `ast.json` and `parse-error.json`. An input of a
diagram type that the reference implementation does not support yet
(`UnsupportedDiagramError`) has neither.

The fields of `expected.json`:

| Field             | Meaning                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `source`          | Where the input came from: `{ kind: "mermaid", ref, path, line?, test? }`, or `{ kind: "authored", note }` for one written here.     |
| `config`          | Optional. The site configuration to run the input with, as passed to `mermaid.initialize()`.                                         |
| `knownDivergence` | Optional. The specification deliberately differs from mermaid.js on this input. The rest of the file is still what mermaid.js does.  |
| `accepted`        | Whether mermaid.js accepts the input.                                                                                                |
| `diagramType`     | For accepted inputs: the diagram id mermaid.js detects, such as `flowchart-v2`.                                                      |
| `db`              | For accepted inputs: a summary of mermaid.js's Db, as plain JSON. `null` only in `common/`, for diagram types without a summary yet. |
| `error`           | For rejected inputs: the `name` and `message` of mermaid.js's error. The message is for people; implementations need not match it.   |

For example, `fixtures/flowchart/config-inherit-dir-site/expected.json`, with
the Db shortened:

```json
{
  "source": {
    "kind": "authored",
    "note": "Same input as config-inherit-dir-default with flowchart.inheritDir set in site configuration: the subgraph inherits dir LR."
  },
  "config": { "flowchart": { "inheritDir": true } },
  "accepted": true,
  "diagramType": "flowchart-v2",
  "db": {
    "direction": "LR",
    "subgraphs": [{ "id": "S", "nodes": ["A"], "title": "S", "dir": "LR" }]
  }
}
```

The fields of each diagram type's `db` are specified in the "Db normalization"
section of `docs/diagrams/<diagram>.md` in `@mmd-toolkit/spec`.

## API

### `@mmd-toolkit/tests`

Reads the fixtures. It does not load mermaid.js.

- `loadFixtures(diagram)`: the fixtures of `"common"`, `"flowchart"` or
  `"sequence"`, sorted by name. Each has `diagram`, `name`, `input` (the text of
  `input.mmd`), `source`, `config` and `knownDivergence` (when set), and
  `expected`: either `{ accepted: true, diagramType, db }` or
  `{ accepted: false, error }`.
- `KNOWN_DIVERGENCES`: the identifiers a fixture's `knownDivergence` can have.
  Each is defined in the specification:
  - `directive-as-token-boundary`: see
    [known-divergences.md](../spec/docs/known-divergences.md#directive-as-token-boundary).
  - `html-tag-in-frontmatter`: see
    [known-divergences.md](../spec/docs/known-divergences.md#html-tag-in-frontmatter).
  - `embedded-data-opaque`: see
    [known-divergences.md](../spec/docs/known-divergences.md#embedded-data-opaque).
  - `click-reserved-word`: see
    [known-divergences.md](../spec/docs/known-divergences.md#click-reserved-word).
  - `tokenless-empty-forms`: see
    [known-divergences.md](../spec/docs/known-divergences.md#tokenless-empty-forms).
  - `comment-takes-character`: see
    [known-divergences.md](../spec/docs/known-divergences.md#comment-takes-character).
- `getFixturesRoot()`: the absolute path of the `fixtures/` directory.
- Types: `DiagramType`, `Fixture`, `FixtureSource`, `Expectation`,
  `ExpectedFile`, `DbSummary`, `MermaidConfig`, `MermaidError`.

### `@mmd-toolkit/tests/mermaid`

Runs the pinned mermaid.js in Node.

- `runMermaid(text, { config })`: `{ accepted: true, diagramType, db }` or
  `{ accepted: false, error }`, in the form `expected.json` records.
- `resolveEmbeddedData(text, { config })`: the values mermaid.js derives from
  the frontmatter, the directives and the `@{ ... }` data blocks, for an
  implementation that does not read them; `undefined` when mermaid.js rejects
  the text. See [docs/embedded-data.md](./docs/embedded-data.md).
  - `config`: mermaid.js's whole configuration for the text.
  - `title`: the frontmatter title.
  - `dataBlockEffects`: what each data block did to the Db, as `{ id, set }`.
- `runMermaidWithEmbeddedData(text, { config })`: `{ outcome, embedded }`, the
  two results above from one run.
- `MermaidEnvironmentError`: thrown when mermaid.js needs a browser feature that
  Node does not have.
- `withoutDivergence` in the options of the three functions above: runs
  mermaid.js read without that known divergence, for an implementation that
  checks a divergence is the only cause of a difference. See
  [docs/expected-results.md](./docs/expected-results.md).
- `cssSupportsColor(value)`: what the browser's `CSS.supports("color", value)`
  answers, as the stand-in that runs mermaid.js here gives it (a sequence `box`
  line asks it). For an implementation that takes this answer from outside. See
  [docs/expected-results.md](./docs/expected-results.md).

### `@mmd-toolkit/tests/mutation`

Compares an implementation with mermaid.js on texts one edit away from the
fixtures, or on any texts. See
[docs/mutation-testing.md](./docs/mutation-testing.md).

```js
import { loadFixtures } from "@mmd-toolkit/tests"
import { runMutationDiff } from "@mmd-toolkit/tests/mutation"

const fixtures = await loadFixtures("flowchart")
const report = await runMutationDiff(
  fixtures.map((f) => ({ name: f.name, text: f.input, config: f.config })),
  (text) => ({ accepted: accepts(text) }),
  { count: 20, seed: 1 },
)
console.log(report.compared, report.mismatches.length)
```

- The candidate is called as `(text, config, embedded)` and returns
  `{ accepted, diagramType?, db?, knownDivergence? }`. `embedded` is what
  `resolveEmbeddedData()` returns for the text.
- `diagramType` and `db` are compared when the candidate returns them. With
  `require: ["diagramType", "db"]`, leaving one out is a mismatch.
- `compareAll(inputs, candidate)` compares texts without mutating them.
- `mutate(text, { seed, count })` returns the mutants of one text, without
  comparing them.
- `generatedInputs(generator, seeds, count, prefix)` names the texts of an input
  generator, to pass to `compareAll()` or `runMutationDiff()`.
- The command line:
  `pnpm --filter @mmd-toolkit/tests run mutation --candidate <module>`.

The other exports of the three entry points are used by this repository's tools;
they are listed in
[docs/maintaining-fixtures.md](./docs/maintaining-fixtures.md).

## Guarantees and limits

- Every result is what `mermaid@12.0.0` does, run in Node. When the pinned
  mermaid.js changes, regenerating the fixtures shows each changed result as a
  difference in `expected.json`.
- Labels and other texts are what mermaid.js holds before HTML sanitization, and
  links are the URLs as written. An implementation does not need to reproduce
  DOMPurify or URL sanitization. See
  [docs/expected-results.md](./docs/expected-results.md).
- A Db summary holds only what the syntax determines. The fields it leaves out
  are listed in [docs/db-summaries.md](./docs/db-summaries.md).
- With `securityLevel` set to `strict`, `loose`, `antiscript` or `sandbox`, the
  summary is the same for all four.
- Values that mermaid.js derives from embedded data come from mermaid.js itself.
  Comparing with them does not test how an implementation would derive them.
- In `common/`, `db` is `null` for diagram types without a summary yet. Compare
  Db summaries only where `db` is not `null`.
- Calls to mermaid.js run one at a time, and each starts from mermaid.js's
  default configuration plus the site configuration you pass.
- When mermaid.js needs a browser feature that Node lacks, the call throws
  `MermaidEnvironmentError` instead of reporting a rejection.

## Documentation

- [docs/expected-results.md](./docs/expected-results.md): how the results are
  obtained from mermaid.js, and why texts and links are recorded before
  sanitization.
- [docs/embedded-data.md](./docs/embedded-data.md): the values from embedded
  data, and what comparing with them checks.
- [docs/db-summaries.md](./docs/db-summaries.md): what a Db summary keeps and
  leaves out.
- [docs/mutation-testing.md](./docs/mutation-testing.md): how texts are mutated
  and compared, and the report.
- [docs/maintaining-fixtures.md](./docs/maintaining-fixtures.md): for
  maintainers, adding, changing, renaming and collecting fixtures.
- [tools/README.md](../../tools/README.md): for maintainers, the command-line
  tools and collecting inputs from mermaid.js again.

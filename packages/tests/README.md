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
(`flowchart`, `sequence`, `class`, `state`, `er`, `gantt`, `journey`,
`requirement`, `mindmap`, `timeline`, `sankey`, `xychart`, `quadrant`, `block`,
`kanban`, `c4`, `venn`, `ishikawa`, `agentflow`, `usecase`, `pie`, `gitgraph`,
`info`) or `common`, for syntax that every diagram type shares (frontmatter,
directives, comments, diagram detection).

- `input.mmd`: the text under test, byte for byte.
- `expected.json`: what mermaid.js did with it.
- `specified.json`: what an implementation of the specification gives for the
  input, present only where that is not what mermaid.js did: the result of
  mermaid.js read without the known divergence that changes how it reads the
  input. `DIVERGENCE_PROPERTIES` declares which marks require it. Use
  `fixtureAccepts(fixture)` for acceptance; for a comparable Db, match
  `specified` where present, otherwise `expected`, with `embeddedValuesOf()`.
  Opaque embedded data can be accepted without a comparison Db. See
  [docs/expected-results.md](./docs/expected-results.md).
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

| Field             | Meaning                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`          | Where the input came from: `{ kind: "mermaid", ref, path, line?, test? }`, or `{ kind: "authored", note }` for one written here.                                                                         |
| `config`          | Optional. The site configuration to run the input with, as passed to `mermaid.initialize()`.                                                                                                             |
| `knownDivergence` | Optional. The specification deliberately differs from mermaid.js on this input. The rest of the file is still what mermaid.js does.                                                                      |
| `accepted`        | Whether mermaid.js accepts the input.                                                                                                                                                                    |
| `diagramType`     | For accepted inputs: the diagram id mermaid.js detects, such as `flowchart-v2`.                                                                                                                          |
| `db`              | For accepted inputs: a summary of mermaid.js's Db, as plain JSON. `null` only in `common/`, for diagram types without a summary yet.                                                                     |
| `error`           | For rejected inputs: the `name` and `message` of mermaid.js's error. The message is for people; implementations need not match it.                                                                       |
| `embedded`        | Optional, for accepted inputs. The values mermaid.js derives from the embedded data that the Db depends on: `config`, `title`, `dataBlockEffects`. See [docs/embedded-data.md](./docs/embedded-data.md). |

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

The fields of each diagram type's `db` are described in
[docs/db-summaries.md](./docs/db-summaries.md), and the steps that build them
from a tree in [docs/db-from-tree/](./docs/db-from-tree/).

`fixtures/default-config.json` is mermaid.js's configuration for a text that
changes nothing in it (`getDefaultConfig()`); the `embedded.config` of a fixture
is what the input changes in it.

## API

### `@mmd-toolkit/tests`

Reads the fixtures. It does not load mermaid.js.

- `loadFixtures(diagram)`: the fixtures of `"common"`, `"flowchart"`,
  `"sequence"`, `"class"`, `"state"`, `"er"`, `"gantt"`, `"journey"`,
  `"requirement"`, `"mindmap"`, `"timeline"`, `"sankey"`, `"xychart"`,
  `"quadrant"`, `"block"`, `"kanban"`, `"c4"`, `"venn"`, `"ishikawa"`,
  `"agentflow"`, `"usecase"`, `"pie"`, `"gitGraph"` or `"info"`, sorted by name.
  Each has `diagram`, `name`, `input` (the text of `input.mmd`), `source`,
  `config` and `knownDivergence` (when set), `specified` (when its file is
  present), and `expected`: either `{ accepted: true, diagramType, db }` or
  `{ accepted: false, error }`. It reads the files one at a time, so that test
  files loading the fixtures in parallel workers stay within the system's limit
  of open files.
- `KNOWN_DIVERGENCES`: the identifiers a fixture's `knownDivergence` can have.
  Each is defined in the specification:
  - `directive-as-token-boundary`: see
    [known-divergences/directive-as-token-boundary.md](../spec/docs/known-divergences/directive-as-token-boundary.md).
  - `ignored-semicolon-as-token-boundary`: see
    [known-divergences/ignored-semicolon-as-token-boundary.md](../spec/docs/known-divergences/ignored-semicolon-as-token-boundary.md).
  - `html-tag-in-frontmatter`: see
    [known-divergences/html-tag-in-frontmatter.md](../spec/docs/known-divergences/html-tag-in-frontmatter.md).
  - `embedded-data-opaque`: see
    [known-divergences/embedded-data-opaque.md](../spec/docs/known-divergences/embedded-data-opaque.md).
  - `click-reserved-word`: see
    [known-divergences/click-reserved-word.md](../spec/docs/known-divergences/click-reserved-word.md).
  - `tokenless-empty-forms`: see
    [known-divergences/tokenless-empty-forms.md](../spec/docs/known-divergences/tokenless-empty-forms.md).
  - `comment-takes-character`: see
    [known-divergences/comment-takes-character.md](../spec/docs/known-divergences/comment-takes-character.md).
  - `comment-takes-line-break`: see
    [known-divergences/comment-takes-line-break.md](../spec/docs/known-divergences/comment-takes-line-break.md).
  - `headerless-empty-ending`: see
    [known-divergences/headerless-empty-ending.md](../spec/docs/known-divergences/headerless-empty-ending.md).
  - `name-start-reads-unit`: see
    [known-divergences/name-start-reads-unit.md](../spec/docs/known-divergences/name-start-reads-unit.md).
  - `c4-keyword-anywhere`: see
    [known-divergences/c4-keyword-anywhere.md](../spec/docs/known-divergences/c4-keyword-anywhere.md).
  - `bare-percent-line-before-header`: see
    [known-divergences/bare-percent-line-before-header.md](../spec/docs/known-divergences/bare-percent-line-before-header.md).
  - `percent-brace-after-unit`: see
    [known-divergences/percent-brace-after-unit.md](../spec/docs/known-divergences/percent-brace-after-unit.md).
  - `blank-line-after-header-or-comments`: see
    [known-divergences/blank-line-after-header-or-comments.md](../spec/docs/known-divergences/blank-line-after-header-or-comments.md).
  - `title-digit-after-axis-statement`: see
    [known-divergences/title-digit-after-axis-statement.md](../spec/docs/known-divergences/title-digit-after-axis-statement.md).
- `getFixturesRoot()`: the absolute path of the `fixtures/` directory.
- `DIVERGENCE_PROPERTIES`: a `ReadonlyMap<string, DivergenceProperties>` with
  one explicit `{ direction, requiresSpecifiedReading }` entry per known
  identifier. `direction` is `"accept"`, `"reject"` or `"both"`; the separate
  boolean says whether `specified.json` is required for the comparison reading,
  including accept-only divergences that need a Db reading.
- `fixtureAccepts(fixture)`: whether the specification accepts the fixture. It
  checks the mark's reading requirement first, throwing with the identifier and
  `<diagram>/<name>` if the required `specified.json` is missing. It then uses
  `specified.accepted` where present; otherwise it uses the mark's direction. An
  unmarked fixture uses `expected.accepted`. `embedded-data-opaque` has
  `direction: "both"` and requires a specified reading. That reading can accept
  with `db: null` when no comparison Db can be derived from opaque data, or
  reject when ignoring embedded configuration changes acceptance. Unknown
  identifiers also throw with the fixture name and identifier.
- `getDefaultConfig()`: the configuration that `embedded.config` is a difference
  from (`fixtures/default-config.json`).
- `embeddedValuesOf(fixture)`: the values `resolveEmbeddedData()` gives for the
  input of a fixture, built from what the fixture records, for the reading to
  match (`specified`, else `expected`). `undefined` for a rejection.
- `dbFromTree(text, tree, embedded, isColor)`: the Db summary that a recorded
  tree (`ast.json`) denotes, built without a parser, and
  `exceedsMaxEdges(tree, config)`, `flowchartEdgeCount(tree)` and
  `agentflowEdgeCount(tree)` for the limit on graph-family edges. See
  [docs/db-from-tree.md](./docs/db-from-tree.md).
- `checkTree(text, tree)`: the conditions that the specification states for a
  recorded tree (`ast.json`) that do not hold, none for a tree that satisfies
  them all. See [docs/check-tree.md](./docs/check-tree.md).
- `cssSupportsColor(value)`: what the browser's `CSS.supports("color", value)`
  answers, as the stand-in that runs mermaid.js here gives it (a sequence `box`
  line asks it). For an implementation that takes this answer from outside. See
  [docs/expected-results.md](./docs/expected-results.md).
- Types: `DiagramType`, `Fixture`, `FixtureSource`, `Expectation`,
  `ExpectedFile`, `RecordedEmbedded`, `DbSummary`, `MermaidConfig`,
  `MermaidError`, `DivergenceDirection`, `DivergenceProperties`.

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
- `withoutDivergences` in the options of the three functions above: runs
  mermaid.js read without the listed known divergences, for an implementation
  that checks the divergences are the only cause of a difference. The list holds
  `comment-takes-character`, `comment-takes-line-break`,
  `name-start-reads-unit`, `percent-brace-after-unit` and `c4-keyword-anywhere`
  (the type `DivergenceRemoval`); divergences that change the same part of
  mermaid.js cannot be removed together. See
  [docs/expected-results.md](./docs/expected-results.md).
- Options with a key other than `config` and `withoutDivergences` make every
  function of this module that takes options throw a `TypeError`, so that a
  misspelled option is never ignored.
- The results of `runMermaid()` and `runMermaidWithEmbeddedData()` are kept in a
  store on disk, `node_modules/.cache/mmd-toolkit/mermaid-runs/` at the root of
  the repository, and given back for the same text, options and code. The
  environment variable `MMD_TOOLKIT_MERMAID_CACHE=disabled` turns the store off,
  and removing the directory empties it. See
  [docs/expected-results.md](./docs/expected-results.md).

The other exports of the two entry points are used by this repository's tools;
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
- [docs/db-from-tree.md](./docs/db-from-tree.md): building the Db from a
  recorded tree, and what it reads.
- [docs/check-tree.md](./docs/check-tree.md): checking a recorded tree against
  the conditions of the specification.
- [docs/maintaining-fixtures.md](./docs/maintaining-fixtures.md): for
  maintainers, adding, changing, renaming and collecting fixtures.
- [tools/README.md](../../tools/README.md): for maintainers, the command-line
  tools and collecting inputs from mermaid.js again.

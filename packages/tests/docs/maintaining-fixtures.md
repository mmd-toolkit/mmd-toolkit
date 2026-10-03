# Maintaining the fixtures

Japanese version: [maintaining-fixtures.ja.md](./maintaining-fixtures.ja.md)

This document is for people who add, change, rename or collect fixtures. How to
read the fixtures is in the [README](../README.md).

## What is written by hand

Only `source`, `config` and `knownDivergence` of `expected.json` are written by
hand; the generator keeps those three fields as they are, rewrites the rest from
mermaid.js, and keeps the file in a canonical form (fixed field order, two-space
indentation, trailing newline). Change the note and `knownDivergence` of
existing fixtures with `fixtures:set-note` and `fixtures:set-divergence`.

- `source`: `kind: "mermaid"` for an input taken from the mermaid.js repository
  at `ref`, file `path`, optionally `line` and test title `test`;
  `kind: "authored"` for one written here, with a `note` that says why. For
  example,
  `{ "kind": "mermaid", "ref": "mermaid@12.0.0", "path": "packages/mermaid/src/diagrams/flowchart/parser/flow-edges.spec.js", "line": 71, "test": "[Edges] when parsing > should handle open ended edges" }`.
- `config`: only in fixtures that show behavior depending on a setting the input
  does not make itself, for example the secure key `maxEdges`, or
  `flowchart.inheritDir` set by the site. Inputs taken from mermaid.js have
  none.
- `knownDivergence`: one of `KNOWN_DIVERGENCES`, on an input where the
  specification deliberately departs from mermaid.js. Each identifier is a
  heading of `docs/known-divergences.md` in `@mmd-toolkit/spec`.

## Names

Fixture names are lowercase kebab-case, `<prefix>-<topic>`, with the first 8
hexadecimal digits of the SHA-256 of the input at the end where many inputs
share a topic (as the collector names the inputs it takes from mermaid.js). The
topic names what the input shows: which statement, and where in it what stands.
The prefix tells what a failure on the fixture would be a failure of:

- `lex-`: how the text is divided into units: names, strings, comments, and
  where a directive or a comment can start (the lexical rules of a diagram).
- `gram-`: which statements and nodes the units make (the grammar and the tree).
- `db-`: the values of the Db summary: what it keeps, how a value is made.
- `tokens-`: the tokens and comments of the tree: where a token or a comment
  starts and ends, and what the ranges leave out.
- `div-`: an input that carries a mark of a known divergence.
- `config-`, `frontmatter-`, `directive-`, `comment-`, `entity-`, `detect-`,
  `header-`, `html-`, `error-`: the shared rules of the specification
  (`common.md`) by the rule they show.
- `spec-`, `docs-`, `demo-`: inputs taken from mermaid.js (its tests, its
  documentation, its demos), named by the collector (see "Inputs taken from
  mermaid" below).

An input that shows more than one thing takes the prefix of the thing a failure
on it would be about.

After the topic, a name may carry marks of what the input holds, in this order
where there are several: `u2028` or `u2029` (the character is in the input),
`directive` or `open-directive` (a directive, or one that is not closed), and
`semicolon` (a `;`). A topic that already names the directive does not repeat it
as a mark.

## `ast.json` and `parse-error.json`

`expected.json` comes from mermaid.js, through this package's generator.
`ast.json` and `parse-error.json` come from the reference implementation of the
specification (`@mmd-toolkit/parser`), whose tests write them as file snapshots:
`ast.json` for the inputs the parser accepts, and `parse-error.json` (the
`message`, `range` and `loc` of the `ParseError`) for the inputs it rejects with
a `ParseError`. They sit next to the input so that both can be read together.
Nothing in this package reads, writes or checks them, and this package does not
depend on the parser: the generator, `add`, `add-many`, `set-divergence`,
`set-note`, the collector and `loadFixtures()` handle only `input.mmd`,
`expected.json` and `specified.json`, and leave any other file in a fixture's
directory as it is. A fixture added here has neither file until the parser's
tests run.

## Exports for the tools

The entry points also export functions that only this repository's tools and
tests use. They are not meant for testing an implementation.

- `@mmd-toolkit/tests`:
  - `allowsUnsummarizedDb(diagram)`: whether `db` may be `null` in that
    directory (only in `common`).
  - `parseExpectedFile(json, label)`, `serializeExpectedFile(file)` and
    `fixtureSourceProblem(source)`: read, write and check `expected.json` in its
    canonical form.
- `@mmd-toolkit/tests/mermaid`:
  - `detectDiagramType(text, { config })`: returns a promise of the diagram id
    that mermaid.js's detectors give the text, or of `undefined` when none does.
    The text is not parsed, so it names the diagram type of text that mermaid.js
    rejects.
  - `mermaidVersion`: the version of the pinned mermaid.js.
  - `extractFrontmatterTitle(text)`: the frontmatter title, extracted the way
    mermaid.js does (see [expected-results.md](./expected-results.md)).
- `@mmd-toolkit/tests/mutation`:
  - `compareWithMermaid(text, candidate, config, options)`: compares one text.

## Commands

Run from `packages/tests` (or with `pnpm --filter @mmd-toolkit/tests run ...`).

```sh
# Regenerate every expected.json, specified.json and default-config.json from
# the pinned mermaid.
pnpm run fixtures:generate
# Fail if any of those files would change.
pnpm run fixtures:check
# Add a hand-written fixture (input on stdin or --input).
pnpm run fixtures:add flowchart subgraph-inherits-dir \
  --note "Why this case exists" --config '{"flowchart":{"inheritDir":true}}' < input.mmd
# Add many at once from JSON: [{ "name", "input", "note"? or "source"?,
# "config"?, "knownDivergence"?, "accepted"? }] or { "fixtures": [...] }.
# "source" (kind "mermaid") replaces the note for inputs taken from mermaid.
# --note is the default note; --strip-prefix removes a prefix from the names;
# --dry-run writes nothing.
pnpm run fixtures:add-many common entries.json --note "..." --dry-run
# Collect the inputs of a diagram type from a mermaid checkout at the pinned
# tag, as an add-many file (see "Inputs taken from mermaid" below).
pnpm run fixtures:collect flowchart --mermaid <checkout> --out flowchart.json
pnpm run fixtures:add-many flowchart flowchart.json
# Mark fixtures as known divergences: { "<diagram>/<name>": "<id>" or null }.
# Only that field changes, and specified.json, which depends on it (mermaid.js
# runs for a fixture whose mark has a specified reading).
pnpm run fixtures:set-divergence divergences.json --dry-run
# Replace notes of hand-written fixtures: { "<diagram>/<name>": "<note>" }.
pnpm run fixtures:set-note notes.json --dry-run
```

- `fixtures:add` refuses a fixture whose input and configuration already exist
  under another name.
- `add-many` skips such entries, and writes nothing if any entry is invalid.
  When an entry states `accepted` and mermaid.js disagrees, mermaid.js's result
  is recorded and the disagreement listed. It also lists every entry mermaid.js
  rejects, with the error.
- `generate` (and `fixtures:check`) prints each fixture whose `expected.json`
  changes, with how it changed, and the fixture's `knownDivergence` if it has
  one. When several things changed, the first of these is printed:
  - `acceptance`: mermaid.js accepted the input and now rejects it, or the
    reverse, with the diagram id or the error name on each side;
  - `detection`: still accepted, as another diagram id;
  - `summary fields`: the summary has keys the other lacks, listed with `+` and
    `-`. The keys include those an author writes (data block contents, props),
    so read the list;
  - `Db values`: the same keys with other values;
  - `error name`: still rejected, with another error name;
  - `error message only`: still rejected, with the same name;
  - `file format only`: the same expectation in a file that was not written in
    the canonical form.
- A fixture that cannot be generated (mermaid.js reached for a browser feature
  Node lacks, `mermaid.parse()` and `getDiagramFromText()` disagree, the input
  is detected as a diagram type that does not belong in its directory, or that
  type has no normalizer) does not stop `generate`: it is listed at the end with
  the reason, keeps its file, and makes the run fail.
- `generate`, `add` and `add-many` list the fixtures rejected with an error
  other than `Error`, `MermaidParseError`, `UnknownDiagramError` or
  `YAMLException`. Check each by hand: it should be caused by the input (see
  "Rejection versus a missing browser feature" in
  [expected-results.md](./expected-results.md)).

The CI job `fixtures` regenerates every `expected.json` and fails on any
difference or new file, so a change in mermaid.js's behavior shows up as a diff.

## Renaming and removing

To rename or remove a fixture, move or remove its whole directory with `mv` or
`rm -r` (not `git mv`: staging is left to whoever commits), so that its
`ast.json` or `parse-error.json` goes with it. Then look for references to the
old name, such as fixture links in `@mmd-toolkit/spec`.

## Inputs taken from mermaid

`tools/collect.ts` reads a mermaid.js checkout, which must be at the tag of the
pinned mermaid.js, and writes the inputs of one diagram type it finds as an
`add-many` file. Each fixture records where its input came from as a `source` of
kind `mermaid`: the tag, the path in the repository, the line, and for test
files the test's title path.

- Test files: the diagram type's test files that pass diagram texts to
  mermaid.js, listed in `SPEC_FILES` in `tools/collect.ts`. For flowchart,
  `diagrams/flowchart/parser/*.spec.js` and
  `diagrams/swimlanes/swimlanesDiagram.spec.ts`, without `flow-huge.spec.js`:
  its one skipped test builds about 200,000 characters that mermaid.js rejects
  for exceeding `maxEdges`, which other fixtures cover. For sequence,
  `diagrams/sequence/sequenceDiagram.spec.js`. For class,
  `diagrams/class/classDiagram.spec.ts`,
  `diagrams/class/classDiagram-styles.spec.js` and
  `diagrams/class/parser/class.spec.js`. For state, the test files of
  `diagrams/state/` and `diagrams/state/parser/` that call the parser, without
  `stateRenderer.spec.js`: it passes a text only to the renderer's `draw()`,
  with a stand-in for the diagram, so mermaid.js never parses it. The tests
  build most inputs in loops and template literals, so each file is run against
  stubs and every text it passes to mermaid.js is kept, rejected or not; the
  line is that of the call (`tools/src/spec-recorder.ts`). A text the detectors
  give another diagram type is left out.
- Documentation: the `mermaid`, `mermaid-example` and `mermaid-nocode` blocks of
  `packages/mermaid/src/docs` that mermaid.js's detectors give one of the
  diagram type's ids.
- Demo pages: the `<pre class="mermaid">` blocks of `demos/*.html` that the
  detectors give one of the diagram type's ids. The text is what `mermaid.run()`
  reads: character references decoded, then `dedent()`, then trimmed. `run()`
  then also rewrites every `<br>` variant to `<br/>`; that is mermaid.js's
  processing, not the page's text, so it is not done here.

No input gets a `config`: the settings a test file or a demo page makes are not
part of the diagram's text.

An input already in the diagram type's fixtures is left out, and so is a repeat,
whose first source is kept (test files, then documentation, then demos).

Names are `<source>-<file>-<hash>`, where `<hash>` is the first 8 hexadecimal
digits of the SHA-256 of the input, for example `spec-flow-edges-3f2a9c1b`. A
name depends only on the input and where it was first found, so collecting again
after mermaid.js changes adds only new inputs and renames nothing. Two different
inputs of one file whose hashes begin alike stop the run, to be named by hand.

How to prepare the checkout and run the collection, and how to check the inputs
mermaid.js rejects, is in [tools/README.md](../../../tools/README.md).

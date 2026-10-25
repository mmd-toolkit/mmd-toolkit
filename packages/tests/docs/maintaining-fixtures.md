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
  example:

  ```json
  {
    "kind": "mermaid",
    "ref": "mermaid@12.0.0",
    "path": "packages/mermaid/src/diagrams/flowchart/parser/flow-edges.spec.js",
    "line": 71,
    "test": "[Edges] when parsing > should handle open ended edges"
  }
  ```

- `config`: only in fixtures that show behavior depending on a setting the input
  does not make itself, for example the secure key `maxEdges`, or
  `flowchart.inheritDir` set by the site. Inputs taken from mermaid.js have
  none.
- `knownDivergence`: one of `KNOWN_DIVERGENCES`, on an input where the
  specification deliberately departs from mermaid.js. Each identifier is a row
  of the table in `docs/known-divergences.md` in `@mmd-toolkit/spec`.

`DIVERGENCE_PROPERTIES`, exported from `@mmd-toolkit/tests`, defines each
identifier's `direction` (`"accept"`, `"reject"`, `"both"`) and
`requiresSpecifiedReading` explicitly. Keep its keys and `KNOWN_DIVERGENCES`
aligned with the specification. Use `fixtureAccepts(fixture)` after loading to
check the required reading and decide acceptance; do not keep another direction
or reading-requirement list. A required missing `specified.json` throws with the
identifier and `<diagram>/<name>`, including for accept-only divergences that
need a comparison reading. A present specified reading decides acceptance;
without one, the direction decides. Unmarked fixtures use `expected.accepted`.
The loader reads the files; this function performs the acceptance check.

For comparable Db values, use the recorded reading (`specified`, otherwise
`expected`) and `embeddedValuesOf()`. `embedded-data-opaque` has direction
`"both"` and requires `specified.json` for every marked fixture. Malformed
opaque data can have an accepted reading with `db: null` because no comparison
Db can be derived. Embedded configuration can change acceptance in either
direction. Its comparison reference omits only blocks rejected during Mermaid's
configuration derivation and removes only the specification-named acceptance
keys from valid text configuration. Keep the other derived values, including
Mermaid's frontmatter title and Db settings such as `wrap`. [fixture:
gitgraph/div-frontmatter-main-branch-preserves-title] [fixture:
sequence/div-invalid-frontmatter-preserves-wrap-directive] Keep a missing
comparison Db explicit rather than inventing one or treating mermaid.js's
rejection as the specification's rejection.

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

**The recorded tree is JSON.** A number that JSON cannot write is `null` in
`ast.json`, as `JSON.stringify` writes it: the `value` of a NumericLiteral for a
number that a double cannot hold (`Infinity` or `-Infinity`), and no other
field, since no other field can hold such a number. The `raw` of the node has
the number as written, and `checkTree()` accepts `null`, `Infinity`, and
`-Infinity` for the `value` of a NumericLiteral whose written text is such a
number, and no `null` for any other. `dbFromTree()` reads the number from the
text of the node, so it needs no conversion. [fixture:
xychart/db-plot-values-overflow]

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
  - `embedded values`: the same Db with other `embedded` values;
  - `error name`: still rejected, with another error name;
  - `error message only`: still rejected, with the same name;
  - `file format only`: the same expectation in a file that was not written in
    the canonical form.
- A change of the `specified.json` of a fixture is printed on a line of its own:
  `specified.json added`, `specified.json removed`, or `specified.json:`
  followed by one of the kinds above for how the reading changed.
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

The workflow `NodeCI.yml`, which is kept in `.github/workflows_bk/` (no workflow
is active at present), has a job `fixtures` that regenerates every
`expected.json` and fails on any difference or new file, so that a change in
mermaid.js's behavior shows up as a diff.

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

- Test files: mermaid's tests that pass diagram text to that diagram type's
  syntax, including the diagram type's tests in mermaid's parser package for
  Langium diagrams. `SPEC_FILES` in `tools/collect.ts` alone lists which test
  files each diagram type collects, with reasons for exclusions. The tests build
  most inputs in loops and template literals, so each file is run against stubs
  and every text it passes to mermaid.js is kept, rejected or not; the line is
  that of the call (`tools/src/spec-recorder.ts`). A text the detectors give
  another diagram type is left out.
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

## Choosing inputs by shape

Inputs that other collections hold (the inputs on which a tool found a failure,
which run to a thousand and more) are many, and many differ only in a name, a
string, or a label text. One of them stands for the others.
`shapeOf(text, source)` (`src/fixture-shapes.ts`) gives the shape that decides
it. The source is made from a recorded tree (`ast.json`) or from the tree that
the parser returns by `shapeSourceOf(tree)`: its tokens, and the ranges of its
frontmatter and of its data block nodes (`DATA_BLOCK_NODE_TYPES`, the headings
of the data blocks in the specification's AST documents), which are taken from
the tree and not found again in the text. The shape is the list of the tokens,
each with its type and its text, and of the characters between them:

- The words and the numbers of a token that holds what the author names, an
  `Identifier`, a `RawText`, a `String`, or a `StringFragment`, are numbered as
  they first appear in the text: a run of letters, digits, and underscores is
  `a1`, `a2`, … and a run of digits only `0_1`, `0_2`, …, the same spelling the
  same number. The spelling of a name does not change the reading, but whether
  two names are one does: `A-->B` has two vertices and `A-->A` one. The
  fragments that a directive cuts out of one name are one name:
  `a%%{init: {}}%%b` is `ab`. The other characters of the token stay: a `:`, a
  `#`, a `;` inside a run of text, a quote, whitespace. The reading also depends
  on where the token starts and ends, which the token types and the characters
  between the tokens show: in `subgraph a end`, a line break, and `;`, the name
  token takes the line break (`a end` and the line break), and in
  `subgraph a pend` it does not; `classDef:#x;` has the `;` of an entity in a
  run of text, and `style:#f00;` an `IgnoredSemicolon` of its own.
- Every other token stays as written: a `Keyword` (`end`, `direction`, `box`,
  `LR` and `lr`, in the case written), a `Punctuator` (the letter of an arrow,
  `--o` and `--x`, `-x`), a `Numeric` (`linkStyle 0` and `linkStyle 5`), a
  `Directive`, and an `IgnoredSemicolon`. Their characters are all read by their
  value.
- Every character between the tokens stays as written: the number of spaces, a
  U+2028 or U+2029, a comment, the kind of each line break. The tokens in the
  frontmatter and in a data block `@{ … }` stay as written too, as their words
  are values (`"wrap": true` and `"wrap": false`, `shape: rect` and
  `shape: foo`); the ranges are those of the nodes, so a `}` in a directive in a
  data block, or a byte order mark before the frontmatter, is read as the tree
  reads it.
- A text with no tree (one that the parser rejects) has its words and numbers
  numbered, and nothing else.

There are three exceptions, where the reading depends on whether a word is in a
set, which no token shows; the token stays as written. They are the places known
so far, each found with inputs that show it, and a place of this kind is added
with its inputs; a list of words is not the way to find the places.

- The run of text right after a `box` keyword: a colour for the name of a CSS
  colour and a name for any other word. `box red` has the fill `red`, and
  `box team` the name `team`.
- The runs of text of a `linkStyle` statement, up to its `;` or the end of its
  line: mermaid.js adds `fill:none` to the style of an edge when no style of the
  list is a `fill` one. `linkStyle 0 fill:red` gives the edge the style
  `fill:red`, and `linkStyle 0 color:red` the styles `color:red` and
  `fill:none`.
- A token whose whole text is the id of a state that makes no node (`</choice>`,
  `</join></fork>`, as `IDS_WITHOUT_NODE` of `src/db-from-tree/state.ts` and
  [db-from-tree/state.md](./db-from-tree/state.md) say):
  `state </join></fork> <<fork>>` has no fork state, and
  `state </x></fork> <<fork>>` has one. It is kept in any diagram and position,
  so it only separates shapes that would be one: where no state id is meant, the
  shape is finer than it needs to be.

An input is left out only when its shape, its diagram type, and whether
mermaid.js accepts it are those of a fixture, or of another input of the same
collection, of which the shortest stands for them. Acceptance is part of it
because a number of a text with no tree is not read: `linkStyle 0` of a diagram
with one edge is accepted, and `linkStyle 5` is rejected, as an edge that does
not exist. Each input that is left out is listed with the fixture that stands
for it and the shape.

What a shape does not tell apart is the spelling of what the author named: the
word in a name, the length of a number. Such a difference is a fixture of its
own when it is found to change a reading, with the input that shows it.

The inputs of the parser's first collection were chosen with a shape of the text
alone: every run of letters and digits became one mark, and a word that the
parser had given as a `Keyword` token, for those inputs and for the corpus, was
kept, in lower case. That shape folded the case of the words, did not see the
tokens, and did not keep whether two names are one. Their fixtures are kept as
they are, and the shape above is what later collections use.

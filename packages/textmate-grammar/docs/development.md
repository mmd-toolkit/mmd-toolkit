# Development

Japanese version: [development.ja.md](./development.ja.md)

How the grammar is written, built and tested. Every rule is written from the
[specification](../../spec/README.md) alone, in the version that the
[README](../README.md#diagram-types) names.

## Why a TextMate grammar

A TextMate grammar was chosen over the tokens of the parser because text under
edit in the playground is often rejected by the parser and would lose its
colors. Shiki's own Mermaid grammar is not used: it knows 15 of the 32 diagram
types, some of them only in part (its C4 rules know four of the five headers,
each with part of the calls that all five accept, and it has no `accTitle` and
no `accDescr`), and colors them as it reads them, not as the specification does.
Writing every diagram type from the specification keeps one source for all the
colors.

## Files

- `grammar/common.grammar.json` holds the rules that every diagram type shares:
  the frontmatter (its body colored as YAML), the directives (`%%{ … }%%`), the
  `%%` comment lines, the strings with the HTML tags and entities inside them,
  and the common `title`, `accTitle` and `accDescr` forms. Its top-level
  `comment` states the limits that hold for every rule, which the README lists
  under [Limits](../README.md#limits).
- `grammar/diagrams/<type>.grammar.json` holds the block of one diagram type,
  one file for each document of `packages/spec/docs/diagrams/`. The block begins
  at the header of the type and gives the units of the type the scope of their
  kind (see [Scopes](../README.md#scopes)).
- `src/grammar.ts` puts the files together into one TextMate grammar, and
  `src/shiki-language.ts` turns it into Shiki's language registration.
- The entry of the package, `src/index.ts`, exports that registration, made when
  the entry is imported. The build bundles it, with the grammar files, into
  `lib/index.mjs`, and writes the grammar that the same function returns to
  `lib/mermaid.tmLanguage.json`.

The file names end in `.grammar.json` because the JSON schema check of the
repository's lint takes a schema from SchemaStore by file name, and SchemaStore
has schemas for other files named `block.json` and `info.json`.

## Building

```sh
pnpm --filter @mmd-toolkit/textmate-grammar run build
```

The tests and the playground read the sources and need no build. The
documentation site reads the built package, so build it before running the site
or its tests.

## Comments of the rules

Each rule carries a `comment`: what the rule reads, in the grammar's own words,
with any position hint, and then the sections of the specification that it
follows, named by their anchors, as in
`Follows c4.md#the-top-level-context and detection.md#the-detectors.` The
comment does not copy the sentences of the specification: like the parser, the
grammar implements the sections it names, and the fixtures check what it colors.
The comment of a rule states only what it leaves out beyond the limits of
`grammar/common.grammar.json`.

## Variables

A part of a regular expression that several rules need is written once, as a
variable `{{name}}`, after the variables of Sublime Text's sublime-syntax files.
`grammar/common.grammar.json` declares the forms that common.md or detection.md
of the specification defines, such as the whitespace sets (`{{ws}}`, `{{lws}}`,
`{{separators}}`), the directive (`{{directive}}`), and whitespace in which
directives may stand (`{{gap}}`), and the parts of a shared rule that a diagram
rule or a variant of the shared rule also needs; its top-level comment names the
sentence of each. A form that the document of a diagram type defines stays in
that type, written in place or as a variable of its file with a name that starts
with the type and a dash, even where another type spells it the same. A variable
may use other variables. The assembly substitutes them, and fails on an unknown
name, a cycle, a name declared twice, and a variable of a diagram file whose
name does not start with its type. Each use of a variable is replaced by its
whole value, so the assembled regular expressions, and the grammar file that the
build writes, are much longer than the expressions written in the grammar files.

## Case-insensitive keywords

The rules write the keywords that are compared case-insensitively in `(?i:…)`
groups. Oniguruma's ignore-case also matches the few characters outside ASCII
that fold to a letter, such as a long s for `s`, which the
[notation](../../spec/docs/common.md#notation) of the specification does not
read as the keyword. People do not write these, so the grammar does not guard
against them, and the README's [Limits](../README.md#limits) says so.

## Tests

`pnpm --filter @mmd-toolkit/textmate-grammar test` tokenizes fixed inputs with
Shiki:

- For each diagram type, one input under `tests/fixtures/` (railroad has one for
  each of its four grammars), written from the sentences of the specification
  that define the units of the type and accepted by the parser. Its
  `.expected.json` names the scopes of the header, of the units of each kind, of
  `accTitle` and `accDescr`, and the boundary cases where a token must not get a
  scope; the test checks them and compares all the tokens with the `.tokens`
  record. Inputs that need a character that the repository keeps out of fixture
  files, such as a line separator, are written with escapes in the
  `escapedInputs` of the `.expected.json` and checked the same way, without a
  record.
- For every header spelling, the minimal input of each entry of
  [detection.md](../../spec/docs/detection.md) and the corpus fixtures of the
  further spellings that the documents of the diagram types accept, read with
  `loadFixture` of `@mmd-toolkit/tests`: the header is colored as a keyword.
- Fixed inputs for the leading trivia (the frontmatter, a directive and a
  comment line before the header) and for the boundary cases of the shared
  rules.
- The assembled grammar has the fields of a TextMate grammar file, and no
  pattern holds `{{`.
- In every fixture and escaped input, every character other than whitespace has
  a foreground color other than the default text color of github-light and
  github-dark. The exceptions are a short list in the test, each with its
  reason: the YAML body of a frontmatter, and what the README's Limits state.
- On fixed inputs, units that the colors tell apart keep different colors in
  both themes, such as `[*]` and a state name, or journey's score and a person.

`pnpm --filter @mmd-toolkit/textmate-grammar run test:update` rewrites the
`.tokens` records after a change of the grammar; read the rewritten records
before keeping them.

## Changing it

A rule changes with the section it follows: change the rule, its `comment`, the
fixture of the diagram type if the section names a case that the fixture does
not hold, and its `.expected.json`. A diagram type added to the specification
gets a file `grammar/diagrams/<type>.grammar.json`, its import and its place in
the list of `src/grammar.ts` (in the order of detection.md), and its fixture,
`.expected.json` and `.tokens` record.

When the specification gets a new version, the grammar follows it: read the
change of `packages/spec/docs` between the git tags of the two versions, find
the rules that name a changed section by its anchor, change the rules and the
fixtures, and change the version that the README names.

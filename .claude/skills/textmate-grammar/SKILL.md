---
name: textmate-grammar
description:
  Maintain @mmd-toolkit/textmate-grammar, the TextMate grammar for Mermaid text,
  published on npm and used by the playground and the documentation site,
  written from the specification alone. Use when a rule, a scope, a comment or a
  fixture of the grammar changes, when the specification changes (a sentence, a
  heading, a header in detection.md, a diagram type added or removed), when
  mermaid.js is updated, which reaches the grammar only through the
  specification, and when the build or the published files of the package
  change.
---

# Maintaining the TextMate grammar (textmate-grammar)

How to change `packages/textmate-grammar` and how to follow the specification
when it changes. The grammar reads the specification only, so a change of
mermaid.js reaches it only through a change of the specification.

## Policies and criteria

`packages/textmate-grammar`:

- Every rule comes from the specification (`packages/spec/docs`) alone. Do not
  open, read or copy Shiki's Mermaid grammar (`shiki/langs/mermaid.mjs`,
  `@shikijs/langs`) or its source, vscode-mermaid-syntax-highlight: a rule taken
  from them reads Mermaid as they read it, not as the specification does.
- One file for each document of the specification: the rules of the diagram type
  of `packages/spec/docs/diagrams/<type>.md` are in
  `grammar/diagrams/<type>.grammar.json`, and the rules that every type shares
  are in `grammar/common.grammar.json`. `src/grammar.ts` is the one function
  that puts them together: the published entry calls it when it is imported, and
  the build calls it to write `lib/mermaid.tmLanguage.json`.
- A shared variable or rule is for a form that `common.md` or `detection.md`
  defines, or for a part that a shared rule and a diagram rule (or a variant of
  a shared rule) both need. A form that the document of one diagram type defines
  stays in that type, as a variable of its file named `<type>-<name>` where the
  file repeats it, even where another type spells it the same: the two forms
  follow two documents and change apart.
- Every unit that the specification defines in an accepted input gets the scope
  of its kind, from the one table in the section Scopes of the package's
  `README.md`, in every diagram type. The table is in the README alone; this
  skill does not copy it.
- A rule's `comment` says, in the grammar's own words, what the rule reads and
  any position hint, and then names the sections of the specification that the
  rule follows by their anchors (`Follows c4.md#the-top-level-context.`). It
  does not copy the sentences of the specification: the grammar implements the
  sections it names, as the parser does, and the fixtures check its colors. The
  anchors are how a change of the specification finds the rules it reaches.
- Keywords are compared case-insensitively, and an ASCII letter of a keyword
  matches only its two ASCII cases (`common.md#notation`). The rules write
  `(?i:…)`; `src/grammar.ts` puts Oniguruma's option `(?I)` at the head of every
  pattern. So the grammar needs Shiki's Oniguruma engine; Shiki's JavaScript
  engine rejects `(?I)`. When Shiki is updated, check that the playground still
  creates the Oniguruma engine and that VitePress still uses it by default.
- The tests run fixed inputs only: for each diagram type a fixture under
  `tests/fixtures/` (`<name>.mmd`, its `<name>.expected.json` and its `.tokens`
  record), the header spellings taken from the fixtures of the conformance
  corpus, and the boundary cases of `tests/grammar.test.ts`. An input that needs
  an invisible character goes, written with escapes, into the `escapedInputs` of
  the `.expected.json`, never literally into a file.
- The specification and the parser move ahead first, and the grammar follows
  them later, to a released version of the specification (Changesets gives the
  specification a version, a changelog and the git tag
  `@mmd-toolkit/spec@<version>`; it is not published on npm). The README names
  the version that the grammar follows; section 5 starts from it.
- The limits that hold for every rule are stated once, in the top-level
  `comment` of `grammar/common.grammar.json`, and in the README.
- The package is published on npm. A change that a user of the package can see
  (what a unit is colored as, a scope, a diagram type, the version of the
  specification it follows, its exports or files) ships with a changeset in the
  same change (skill `changesets`). The README is for its users (installation,
  hosts, scopes, limits); `docs/development.md` is for its developers (files,
  comments, variables, build, tests).

## 1. What to read first

1. The section Policies and criteria of this document, the Principles of
   AGENTS.md, and the skill `conventions`.
2. The package's `README.md` (the section Scopes, with the table and what each
   kind holds, and the limits) and its `docs/development.md` (the files, the
   comments, the variables, the build, and the tests).
3. `src/grammar.ts` and the top-level `comment` of `grammar/common.grammar.json`
   (the limits, and the sentence that each common variable stands for).
4. For a diagram type: `packages/spec/docs/diagrams/<type>.md` as a whole, its
   entry in `packages/spec/docs/detection.md`, its grammar file, and its
   fixture.

This work writes only to `packages/textmate-grammar`, its changesets
(`.changeset/`), and this skill. A gap in the specification is fixed with the
spec skill, never by a rule that guesses. Commit and push only when asked
(AGENTS.md). Do not change the staging area; do not use `git mv`, `git stash`,
`git checkout` or `git restore`.

## 2. How the files fit together

- `grammar/common.grammar.json` holds `variables`, the shared rules and the
  limits. `{{name}}` in a regular expression is a variable; a variable may use
  other variables. A diagram file may declare `variables` whose names start with
  its type and a dash.
- `src/grammar.ts` resolves the variables, substitutes them into the `match`,
  `begin`, `end` and `while` fields, puts `(?I)` at the head of each, and throws
  on an unknown name, a cycle, a name declared twice, and a diagram variable
  whose name does not start with its type. The list of diagram files in
  `src/grammar.ts` follows the order of `detection.md`.
- `src/shiki-language.ts` turns the grammar into Shiki's registration (the name
  `mermaid`, the alias `mmd`, the embedded `yaml`). The build
  (`pnpm --filter @mmd-toolkit/textmate-grammar run build`) writes the grammar
  to `lib/mermaid.tmLanguage.json` and bundles the entry `src/index.ts`, with
  the grammar files, into `lib/index.mjs`. The tests and the playground read the
  sources and need no build; the documentation site reads the built package.
- A diagram block begins at its header and runs to the end of the text: the
  diagram type is chosen once, from the header.
- The files are named `*.grammar.json` because the JSON schema check of the lint
  takes a schema from SchemaStore by file name, and SchemaStore has schemas for
  other files named `block.json` and `info.json`.
- Agentflow includes rules of flowchart (agentflow.md reuses flowchart's rules):
  change the two together. Agentflow and eventmodeling receive their comment
  lines, so they use the variants of the shared rules that read no common
  comment.

## 3. How to check (in every piece of work)

- `pnpm --filter @mmd-toolkit/textmate-grammar test` runs the whole test file.
  Run the whole file before reporting: a filter (`-t`) leaves out the header,
  the leading-trivia and the boundary tests.
- Records: `pnpm --filter @mmd-toolkit/textmate-grammar run test:update`
  rewrites every `.tokens` record. When several pieces of work run at the same
  time, each rewrites only its own records:
  `pnpm --filter @mmd-toolkit/textmate-grammar exec vitest run -u -t "colors (<name>|<name>) as its"`.
  Read every rewritten record.
- Read a record's diff against a copy of the package taken before the work
  (`diff -u`), not against the git index: the index can hold an older state than
  the working tree, and its diff then mixes earlier work into this one.
- Every input added to a fixture is accepted by the reference parser (`parse()`
  of `packages/parser/lib/index.mjs` throws on a rejected input).
- When `src/`, the build or the fields of `package.json` change:
  `pnpm --filter @mmd-toolkit/textmate-grammar run build`, then
  `npm pack --dry-run` in the package, which lists only `lib/`, the README files
  and `package.json`; the documentation site's tests and build read the built
  package.
- `pnpm run lint` (with `lint:chars`) and `pnpm run format:check`.

## 4. Changing a rule or a scope

1. Read the sentence that the rule follows, and the units the section defines at
   that place.
2. Give each unit the scope of its kind from the table. A unit that the
   specification reads as both the id and the shown text of an element is a
   label.
3. Write the part that several rules of the file need once (a helper rule or a
   variable of the file); use a common variable where the form is common.md's or
   detection.md's.
4. Write the comment in the decided form.
5. Add a fixture line (or an escaped input) for each case the sentence
   distinguishes, with an assertion of its scopes in the `.expected.json`, and
   rewrite the record.
6. Add a changeset when a user of the package sees the change (skill
   `changesets`).

## 5. When the specification changes

1. Read the change of the specification from the version that the README names
   to the version that the grammar is to follow:
   `git diff @mmd-toolkit/spec@<named version>..@mmd-toolkit/spec@<new version> -- packages/spec/docs`.
2. Read the entries of `packages/spec/CHANGELOG.md` between the two versions,
   for a summary of what changed.
3. For each changed section, find the rules that follow it: search the grammar
   files for its anchor (`<document>.md#<section>`). The change may also hold
   sentences that no rule follows yet (a new keyword, a new form of a
   statement): read them in the diff of step 1 and bring them into the grammar.
4. Change together the rule, its comment, the fixture and the `.expected.json`,
   and rewrite the record. The cases:
   - A sentence changed or added: change the rule if what it reads changed, and
     give the fixture a line (or an escaped input) for each case that the
     sentence distinguishes. A sentence removed: remove a rule that only it
     supported, with its fixture lines and assertions.
   - A heading changed: its anchor changed. Change every comment that names the
     old anchor; where a section was split or merged, name the section that now
     defines what the rule reads.
   - A header in `detection.md` changed (added, renamed or removed): change the
     begin of the type's block (the header spellings of its Detection section),
     its comment, and the header list of `tests/grammar.test.ts` (the diagram
     type and the name of the corpus fixture of each header).
   - A diagram type added: list the kinds of unit that its document defines,
     with the section of each; write `grammar/diagrams/<type>.grammar.json`, a
     block that begins at each header spelling of the Detection section, each
     unit with the scope of its kind and each comment in the decided form; add
     its import and its place in the list of `src/grammar.ts` (the order of
     `detection.md`) and its header fixtures to the header list; write
     `tests/fixtures/<type>.mmd` from the sentences that define its units, with
     at least one unit of each kind, and its `.expected.json` with at least one
     asserted scope of each kind (names and labels always; shape and block
     delimiters and a style value where the type has them), and its record; add
     the type to the list of types in the README (English and Japanese).
   - A diagram type removed: delete its grammar file, its import and list entry,
     its header fixtures in the header list, its fixture files, and its name in
     the README.
5. Change the version that the README names (English and Japanese) to the new
   version, and add a changeset that names it (skill `changesets`).

## 6. When mermaid.js is updated

The grammar takes nothing from mermaid.js. Wait until the specification is
updated with the tests skill and the spec skill, then apply section 5. Nothing
in the grammar is tied to the version of mermaid.js; the playground's examples
(`@mermaid-js/examples`, a dependency of the playground) follow its releases, so
color them again as section 7 says.

## 7. Checking a deliverable

- Read the diff against the copy taken before the work: its scope (only the
  files the work may change), its fit to the table (every unit with the scope of
  its kind), and its fit to the specification (the sections that a comment names
  define what the rule reads).
- Color the playground's examples and read the scopes of their units.
- Running again the commands that the author ran checks nothing new.

## 8. Mistakes to avoid

- Choosing the units to color by lexical kind (keywords, strings, numbers,
  arrows) leaves names and labels without a scope. Give every unit that the
  specification defines the scope of its kind.
- A comment that names a section about another construct sends a later change of
  the specification to the wrong rule, and leaves the rule that it does reach
  unchanged. Name the section that defines what the rule reads.
- Work on several diagram types at the same time that may not change the common
  file copies each shared form it needs into each type, and the copies drift
  apart; text that is only spelled the same in several types is no shared form.
  Add the shared forms first, then the types, and decide shared or local by the
  criterion above.
- A test filter (`-t`) leaves out the header, leading-trivia and boundary tests,
  which check the shared rules for every diagram type. Run the whole file before
  reporting.
- `vitest -u` without a `-t` filter, during parallel work, rewrites the records
  of the other pieces of work.
- A directive written by hand into the expression of each value makes rules long
  and lets the copies drift; use `{{directive}}` and the other common variables.
- A rule with several variants that is fixed one case at a time breaks the
  neighboring cases, because the variants repeat the same parts. List the cases
  that the section distinguishes, set the form of the rule (its parts, as
  variables) once, then build every variant from them.
- Oniguruma's absent operator `(?~|…|…)` and other rare constructs are not read
  on sight; write the expression explicitly.
- Literal line separators and paragraph separators in fixture files break
  `pnpm run lint:chars`; write such inputs with escapes in `escapedInputs`.
- `(?iI:…)` inside a pattern gives empty matches in Oniguruma: `I` is a
  whole-pattern option, which `src/grammar.ts` puts at the head.

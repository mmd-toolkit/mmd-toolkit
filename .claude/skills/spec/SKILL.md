---
name: spec
description:
  Write and maintain the syntax specification under packages/spec/docs/ (the
  diagram documents, the tree documents, and the shared documents) and the
  fixtures that back its claims. Use when a diagram type is added, when a gap in
  the specification is found, for example while implementing the parser, when
  fixtures are needed to back a claim or a rule idea, and when mermaid.js is
  upgraded. Adding a diagram type has a skill of its own, spec-diagram-type,
  that uses this one.
---

# Writing the specification (spec)

How to write the specification under `packages/spec/docs/`, checking every claim
against the pinned mermaid.js and the fixtures. Adding a diagram type is in the
skill [spec-diagram-type](../spec-diagram-type/SKILL.md), which uses the
sections of this skill.

## Policies and criteria

`packages/spec`:

- Defines the abstract syntax tree: in `docs/ast.md`, what every diagram shares
  (the root with its lists of tokens, comments, and directives, the token kinds,
  the leaf nodes for values that an author writes, the invariants); in
  `docs/ast/<diagram>.md`, one document per diagram type, that diagram's nodes.
  Every node type of a diagram starts with the diagram's name
  (`FlowchartVertex`, `FlowchartLink`): node types share one namespace across
  all diagram types, and other diagrams will want the same plain names. Token
  kinds and the shared leaf nodes (`Identifier` for a name or a single bare word
  without whitespace, `StringLiteral` for a quoted string, `NumericLiteral` for
  a number) have the same form in every diagram and carry no prefix. Text
  without quotes that may contain whitespace is read differently by each
  diagram, so it is a literal node of the diagram (`FlowchartLiteral`), and a
  name that may contain whitespace is a name node of the diagram
  (`SequenceIdentifier`). Which of these a field holds is decided by what the
  grammar allows at that position, not by how one example looks. As in ESTree, a
  name or a value that an author writes is such a leaf node with its own range,
  so that a tool can report on it or rewrite it without searching the tokens;
  only words from a fixed set (a direction, a shape name, the marker at an end
  of an arrow) are plain string fields. An arrow is a node of its own
  (`FlowchartArrow`, `SequenceArrow`), with the markers at its ends and the kind
  of its line as such fields, so that a tool reads them without reading the
  characters of the arrow again. A node type says what the node is, never how
  its text is lexed: there is no node type per token kind and no catch-all node.
  Nodes have no generic `children` list; punctuation and keywords appear only as
  tokens. Text that the author writes and mermaid.js does not read is a node of
  the tree wherever it can be one (`FlowchartIgnoredText`); making it a node
  comes before rejecting the input, and an input is rejected for such text only
  when the text has no place of its own in the tree. This is the source of the
  definition; implementations follow it.
- For each diagram type, `docs/diagrams/<diagram>.md` with its four sections
  (detection, lexical structure, grammar with the rejections outside the
  grammar, known divergences), written from mermaid's grammar definition and Db
  class. What decides whether an input is accepted is defined here, also where
  mermaid.js decides it while it builds its Db.
- The specification defines the syntax and the shape of the tree: node types,
  fields, and values. How the tree gets its tokens and positions is the
  specification of the parser (`packages/parser/docs`), and how a recorded tree
  is checked against the Db of mermaid.js is a document of the tests
  (`packages/tests/docs`). The documents of the specification do not refer to
  the parser's specification of tokens and positions: references run from the
  parser's documents to the specification.
- The documents of the specification do not write how mermaid.js reads an input
  into its Db: no defaults, nothing about which entry a value goes to, no
  reading of a number or a type, nothing that a statement adds to the Db, and no
  names in the Db. They point to the summary of the tests package
  (`packages/tests/docs/db-summaries.md`, `packages/tests/docs/db-from-tree.md`)
  instead. What stays is what decides whether an input is accepted (including
  comparison values and state updates), the node types and the values of the
  fields of the tree with their reasons, and how the lexer reads the text.
- Every claim in the specification has a fixture, added through the tests
  package's generator.
- The specification has versions. A change to `packages/spec` ships with a
  changeset for `@mmd-toolkit/spec` in the same pull request; the changesets
  skill says which bump.
- The specification introduces no single-letter or abbreviated symbols (no "let
  _T_ be the text", no italic one-letter names, no subscripts). Every concept is
  named in words each time, or given a meaningful multi-word name at the start
  of its section. Single-letter symbols only make the text harder to read.
- The specification contains no code in any programming language: no regular
  expressions, no TypeScript type definitions. Even where mermaid.js is
  implemented with regular expressions, acceptance conditions are stated in
  prose and grammar; the AST is defined with tables and prose, using
  language-neutral types (integer, string, list of nodes).

## 1. What to read first

1. The section Policies and criteria; AGENTS.md (Project, Principles, Shared
   interfaces); the skill `conventions`. The tree is a shared interface, so the
   result of a change to it says what parser, prettier-plugin, and eslint-plugin
   have to change.
2. In the results of the work, say for each claim whether it was checked by
   running something (mermaid.js, the parser), by reading something (the source
   of mermaid.js, a document), or not checked.
3. `packages/spec/docs/index.md` (the conformance, the four sections of a
   diagram document, the writing conventions, the pinned commit), `common.md`,
   `ast.md`, and the `diagrams/<diagram>.md` and `ast/<diagram>.md` of the other
   diagram types. The principles of the tree and their reasons are under Design
   goals and Shared leaf nodes in `ast.md`.
4. `packages/tests/docs/maintaining-fixtures.md` (the commands and rules for
   fixtures) and `packages/tests/README.md` (the form of a fixture).

The steps of this SKILL and of the skill spec-diagram-type write
`packages/spec/` and, through the tools of `@mmd-toolkit/tests`, its fixtures.
When another package has to change (its documents, the parser, the formatter),
change it with the steps of that package's SKILL.

The working tree is treated as
[The working tree](../conventions/SKILL.md#the-working-tree) in the skill
conventions says.

## 2. Tools

### 2.1 Checking inputs with mermaid.js

The script that runs the pinned mermaid.js on a list of inputs, with how to
write its inputs and how to compare its results with the parser, is in
[references/probe-scripts.md](references/probe-scripts.md), which also says how
to set up and run the scripts.

### 2.2 Finding existing fixtures

The script that lists the fixtures whose input contains a text is in
[references/probe-scripts.md](references/probe-scripts.md).

### 2.3 Adding fixtures

In `packages/tests` (all commands are in maintaining-fixtures.md):

```sh
pnpm run -s fixtures:add-many <diagram> <file.json> --dry-run
pnpm run -s fixtures:add-many <diagram> <file.json>
pnpm run -s fixtures:set-note <notes.json>
pnpm run -s fixtures:set-divergence <divergences.json>
pnpm run -s fixtures:check
```

`<file.json>` is `{ "fixtures": [ { "name", "input", "accepted", "note" } ] }`.

- Put in `accepted` the result you checked. When mermaid.js differs, the run
  does not stop: mermaid.js's result is recorded, and the entry is listed as
  "disagree with the observation". Always read the output to the end.
- An entry whose input already has a fixture is skipped.
- `note` says which rule of which section of the specification the fixture is an
  example of (`flowchart.md Strings: …`) and what happens. Check its reason
  against the specification too, and fix a note with `fixtures:set-note`.
- Put an example of a shared rule in `common`, and an example of a diagram
  type's rule in that diagram type's directory. Name a fixture by the kind of
  rule (`lex-`, `gram-`, `db-`, `tokens-`, `config-`, `entity-`, `comment-`,
  `directive-`, and so on, as the existing names do) and by what its input
  shows.

### 2.4 Checking the specification's documents

After every change, run from the root of the repository
([Running tests](../conventions/SKILL.md#running-tests) in the skill
`conventions`):

```sh
npx prettier --write packages/spec
npx prettier --check packages/spec
pnpm run -s lint:md
pnpm run -s lint:docs
pnpm run -s lint:chars
```

`pnpm run lint:md` fails when a link or its anchor points to nothing.
`pnpm run lint:docs` fails when a fixture citation in the documents of the
specification, the parser, or the tests points to nothing
(`scripts/check-doc-citations.mjs`; it also reads citations wrapped after
`[fixture:`, which a line-by-line search misses), when a link to mermaid.js does
not point to the commit recorded in `packages/spec/docs/index.md`
(`scripts/check-mermaid-links.mjs`), and when a `.ja.md` has no English original
(`scripts/check-ja-docs.mjs`). It only lists a document without a Japanese
version, a Japanese version older than the English, and one whose citations or
heading structure differ (behind). Write the Japanese version of such a document
of the specification then, with the same citations and heading structure.

When fixtures were added, also run `pnpm run -s fixtures:check` in
`packages/tests`, which runs every fixture through mermaid.js again and fails
when a result differs from the recorded one.

Run no tests of the other packages. `packages/parser/tests/types.test.ts` lists
the documents under `docs/known-divergences/`, so the output (section 7) says
when one was added or removed.

### 2.5 Scripts that rewrite documents

Rewrite long paragraphs with a Python script in the working directory outside
the repository, and change the English and Japanese documents with the same
script.

- Prettier wraps prose at 80 columns, so match each anchor text with the spaces
  between its words read as one or more whitespace characters, line breaks
  included. Check that the anchor matches exactly once, and write nothing when
  it does not.
- Write a file only after all its replacements are done. When the script stops
  partway, check which files were written, and remove their part before running
  it again (do not add anything twice).
- Enclose a code span whose example contains a backtick in double backticks
  (``A["`x`"]``). With single backticks, Prettier closes up the spaces around it
  and breaks it. After writing, look once at the rendered form.

## 3. Reading mermaid.js

Read the source in a clone of mermaid.js at the tag of the pinned version (how
to make it is in `tools/README.md`). Every link from the specification is a
permalink to the commit recorded in `packages/spec/docs/index.md`.

Read the grammar with the steps for the engine of the diagram type:
[references/reading-jison.md](references/reading-jison.md),
[references/reading-chevrotain.md](references/reading-chevrotain.md), or
[references/reading-langium.md](references/reading-langium.md).

## 4. Adding the nodes of the tree

`docs/ast/<diagram>.md` and its `.ja.md`.

Use the diagram names and node prefixes defined by
[conventions](../conventions/SKILL.md#code).

1. For each node type: the table of fields (types in language-neutral words;
   short cells, long explanations below the table), the child fields (in the
   order a tool visits them), and the range. Write each node's range in its own
   authored shape, with only the starting and ending forms that node permits.
   State the child fields in one of the two sentences of Nodes in `ast.md`:
   ``Child fields: `a`, `b`.`` or `No child fields.`, and in the Japanese
   document ``子の欄: `a`、`b`。`` or `子の欄はありません。`.
2. Decide the type of a leaf node by what the grammar allows at its position
   (the section Policies and criteria, Shared leaf nodes in ast.md).
3. Decide the shape of the nodes before writing them, once for the whole diagram
   type. First write a proposal outside the repository: every node type with its
   fields, and the points that need a decision, grouped as names, node or
   rejection for text that mermaid.js does not read, candidates for a known
   divergence, and changes to the shared parts (`ast.md`, `common.md`, the
   shared leaf nodes). A change to the shared parts is made as
   [section 10](#10-changing-the-shared-tree) says. Decide the shape by looking
   at the principles (the section Policies and criteria, Design goals and Shared
   leaf nodes in `ast.md`) and at the effect on the packages that use the tree
   (parser, prettier-plugin, eslint-plugin) as a whole. Where the principles
   leave a choice, present the options with examples, their grounds (the
   principles, what mermaid.js reads, the fixtures), and a recommendation, ask
   for a decision, and write the shape that is chosen. Then check every field
   against the principles. When a decided shape turns out to conflict with a
   principle or with mermaid.js, say so with the evidence before changing it.
4. A value is the text of its range, and the tokens and the range of a value
   cover the text that mermaid.js reads as the value, whitespace included where
   mermaid.js reads it (Nodes and Tokens in ast.md): a sequence title, a class
   generic type, and a flowchart style after its `,` keep their whitespace. Only
   where no token can hold what mermaid.js reads, because it runs across other
   nodes, say why in the field's description in `ast/<diagram>.md`;
   `docs/db-from-tree/<diagram>.md` of `@mmd-toolkit/tests` says that the Db
   reads it from the source, written with the steps of the tests-tree-checks
   SKILL. Flowchart example: the whitespace between the empty description blocks
   right after the name of a subgraph.

## 5. Matching claims with fixtures

Each time a claim is written:

1. Check it with mermaid.js (2.1).
2. Look for existing fixtures (2.2). When one has the same input, or an input
   that records the same thing, cite it. Before deciding so, read the `accepted`
   and the values of its `expected.json` and, where required by its divergence,
   `specified.json`; never decide from how the input looks.
3. Otherwise add one (2.3). Add a contrasting example too: the closest input to
   which the rule does not apply.
4. Cite it in the sentence of the specification as
   `[fixture: <category>/<name>]`. Cite the same set in English and in Japanese.
5. Give an input that mermaid.js and the specification decide differently (Known
   divergences) its identifier with `fixtures:set-divergence`. Choose the
   identifier by the definitions in known-divergences.md, and match the existing
   fixtures of the same kind.
6. When the work of another package needs a case of the corpus, cite the
   existing fixture rather than copying its input into another fixture.

## 6. Checking a rule

Do not decide a rule from hand-written examples of its usual form only: decide
it from the cases that its sentences distinguish.

1. List the cases of each sentence. For each sentence that defines a behavior,
   list each case that it distinguishes, and each other rule that meets it at
   the place it names, as
   [the Principles of AGENTS.md](../../../AGENTS.md#principles) list them. Each
   case is one input that answers one question about the sentence. Products of
   places and strings are not written, and no input is chosen by a random source
   or by a number (a seed, a count).
2. Check each case once with mermaid.js and with the parser's `parse()` and
   `dbOf()` (2.1). For a diagram type that the parser does not read yet, compare
   mermaid.js's result with what the sentence says. Each case then has a fixture
   that the sentence cites (section 5). Cite at least one fixture for each case,
   not every fixture of the same case.
3. Sort the cases that the sentence does not explain into kinds, and explain
   each kind with one rule. Write mermaid.js's mechanism as one rule instead of
   adding exceptions (flowchart example: the empty string, the empty call, and
   the empty description block, for which mermaid.js reads no token and the tree
   has no place, are one known divergence in every place they appear, instead of
   one rule for each place).
4. Decide acceptance by one criterion (Project 1 of AGENTS.md and the section
   Policies and criteria): accept and reject what mermaid.js accepts and
   rejects, and give an accepted input mermaid.js's Db. A text that the author
   writes and mermaid.js does not read, or reads otherwise than an author would
   mean, is held by a node (section 8, item 2) and the input is accepted
   (sequence: `title` followed by a line break takes the next line as the title;
   `create destroy A` creates A); list such inputs with mermaid.js's result as
   candidates for lint rules. Only where no node can hold the text, whatever the
   cause of mermaid.js's reading, reject the input or write a direct rule that
   reads it differently, and propose it as a known divergence (section 8;
   sequence: a comment that starts at `%%` keeps the character before it).
5. Before accepting a form in new places, or generalizing a rule, list where the
   rule applies, and only then write it. What to list, and what to check before
   writing it, is in
   [references/accepting-a-form-in-new-places.md](references/accepting-a-form-in-new-places.md).

6. When a rule of the specification rests on behavior of mermaid.js that looks
   like a bug, such as a known divergence or a surprising reading, search the
   issues and pull requests of mermaid-js/mermaid with `gh` (outside the
   sandbox), using short queries of two or three words; long queries find
   nothing. Cite what is found by its number, with only its facts (title, state,
   labels, what it reports, and the date of the check). Write its state with the
   facts of its labels and replies: a label that the report form adds, such as
   `Type: Bug / Error`, is not a judgment of the maintainers; call an issue
   approved or a bug only when it has the `Status: Approved` label or a
   maintainer's reply says so. When nothing is found, say so in the report, with
   the queries used, and write only the behavior in the specification.

## 7. Output

Show as the result of the work: the sections changed, the names of the fixtures
added, what the parser has to fix (acceptance, tokens, the Db derivation), and
the fixtures for which the parser needs an `ast.json`.

The output also names these steps of the other packages:

- For `checkTree`, follow [tests-tree-checks](../tests-tree-checks/SKILL.md).
- For divergence-form checks, follow
  [parser §6](../parser/SKILL.md#6-when-fixtures-are-added-or-a-rule-changes).
- For printer work, follow [prettier-plugin](../prettier-plugin/SKILL.md).
- Where the Db omits authored syntax, require independent structural checks and
  exact expected-output formatting fixtures because Db equality cannot show that
  syntax was preserved.

## 8. Proposing a known divergence

Every proposal of a known divergence, for a new identifier or for adding inputs
to an existing one, writes down these four answers (Project 1 of AGENTS.md); a
proposal without them is not decided:

1. **The text.** Which text mermaid.js does not read, drops, or reads as
   something other than what is written, with its range (from where to where).
2. **The node.** How the tree would hold it: which node and which field, or
   which other form. The forms the tree already has:
   - a field with an ignored text node: `textBefore` and `textAfter` of a
     direction statement and of `ClassMethod`, and the `textBefore…` and
     `textAfter…` fields of the state statements, such as `textBeforeId`,
     `textAfterDescription`, and the `textAfter` of a state alias;
   - a statement: an empty description block where a statement starts or before
     the separator of a statement, and a statement of text that is not read,
     such as `StateIgnoredStatement` and `SequenceIgnoredStatement`;
   - a character that no value includes: the `;` that the line rule ignores;
   - trivia that cuts a token into fragments: a comment region, which cuts a
     `String` token into `StringFragment` tokens and a `RawText` token into
     `RawText` tokens, and a directive inside a `String` or `RawText` token,
     which cuts it in the same way.
3. **The check.** With the text held so, whether acceptance and the Db agree
   with mermaid.js, checked on a fixture for each case that the text
   distinguishes: compare mermaid.js on the input with mermaid.js on the input
   without the text, or with another reference input that mermaid.js reads as
   the tree would.
4. **What stands in the way.** Only where no node can hold it: why, in terms of
   the tree (no position where the text can lie, a value that would have to
   change), or why the rule that would agree with mermaid.js copies the order of
   its pipeline. That nobody would write the text, or that mermaid.js does not
   read it, is no answer.

A new divergence is defined in a document of its own,
`known-divergences/<identifier>.md` and its `.ja.md`, with the parts that
known-divergences.md lists (the syntax, the difference with examples, what it
means for an author, why mermaid.js reads it so, the rule and why, the
documentation and issues of mermaid.js where any were found), and with a row in
the table of known-divergences.md.

- When adding a diagram's paragraph to a divergence document, also add the
  diagram's entry to the section The documentation of mermaid.js and its issues.
- For `embedded-data-opaque`, follow
  [The comparison Db](../../../packages/spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db)
  and
  [DIVERGENCE_PROPERTIES](../../../packages/tests/src/fixture-acceptance.ts).

The document of the divergence (`known-divergences/<identifier>.md`) says, in
"The rule of this specification, and why", why the text is not held as a node.

## 9. When a gap in the specification is found

The steps, and what to show when only fixtures are needed, are in
[references/gaps.md](references/gaps.md).

## 10. Changing the shared tree

A change to the shared part of the tree (`ast.md`: the root, the token kinds,
comments, directives, the frontmatter, the shared leaf nodes, the invariants)
affects every diagram type and every package that reads the tree. Make it in one
pass, with the steps in
[references/changing-the-shared-tree.md](references/changing-the-shared-tree.md).

## 11. When mermaid.js is upgraded

The steps are in
[references/upgrading-mermaid.md](references/upgrading-mermaid.md).

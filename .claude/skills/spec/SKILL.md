---
name: spec
description:
  Write and maintain the syntax specification under packages/spec/docs/ (the
  diagram documents, the tree documents, and the shared documents) and the
  fixtures that back its claims. Use when a diagram type is added (step 3 of the
  plan), when a gap in the specification is found, for example while
  implementing the parser, when fixtures are needed to back a claim or a rule
  idea, and when mermaid.js is upgraded.
---

# Writing the specification (spec)

How to write the specification under `packages/spec/docs/`, checking every claim
against the pinned mermaid.js and the fixtures. It is written so that the same
quality can be reached from this document alone, without the history of a
conversation or memory. The policies and criteria of the package are in the
section Policies and criteria; what holds for every package is in AGENTS.md and
in the skill `conventions`.

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
  instead. What stays is what decides whether an input is accepted, the node
  types and the values of the fields of the tree with their reasons, and how the
  lexer reads the text.
- Every claim in the specification has a fixture, added through the tests
  package's generator.
- The specification introduces no single-letter or abbreviated symbols (no "let
  _T_ be the text", no italic one-letter names, no subscripts). Every concept is
  named in words each time, or given a meaningful multi-word name at the start
  of its section. Single-letter symbols only make the text harder to read.
- The specification contains no code in any programming language: no regular
  expressions, no TypeScript type definitions. Even where mermaid.js is
  implemented with regular expressions, acceptance conditions are stated in
  prose and grammar; the AST is defined with tables and prose, using
  language-neutral types (integer, string, list of nodes). The parser's `ast.ts`
  is an implementation of that definition, not its source. The specification is
  independent of any implementation language.

## 1. What to read first

The criteria change, so read these each time work starts.

1. The policies and criteria.
   - The section Policies and criteria of this document: the principles of the
     tree (the names of node types, the shared leaf nodes, a type decided by
     what the grammar allows at the position), the four sections, a fixture for
     every claim, no symbols, no code in the specification.
   - AGENTS.md, Project: the measure of correctness, and the exceptions of the
     Known divergences.
   - AGENTS.md, Principles.
   - The skill `conventions`: the English and Japanese pairs, invisible
     characters, prose wrapped by Prettier, `mmd` as the info string of a code
     block with Mermaid text, permalinks to the source of mermaid.js.
   - AGENTS.md, Shared interfaces: parser, prettier-plugin, and eslint-plugin
     use the definition of the tree. A change to it is a change for those
     packages too, so the result of the work says what each of them has to
     change.
2. In the results of the work, say for each claim whether it was checked by
   running something (mermaid.js, the parser), by reading something (the source
   of mermaid.js, a document), or not checked.
3. `packages/spec/docs/index.md` (the conformance, the four sections of a
   diagram document, the writing conventions, the pinned commit), `common.md`,
   `ast.md`, and the `diagrams/<diagram>.md` and `ast/<diagram>.md` of the
   diagram types already written. The principles of the tree and their reasons
   are under Design goals and Shared leaf nodes in `ast.md`.
4. `packages/tests/docs/maintaining-fixtures.md` (the commands and rules for
   fixtures) and `packages/tests/README.md` (the form of a fixture).

The steps of this SKILL write `packages/spec/` and, through the tools of
`@mmd-toolkit/tests`, its fixtures. When another package has to change (its
documents, the parser, the formatter), change it with the steps of that
package's SKILL.

When the working tree is shared with other work: make no git operation (commit,
stage, unstage, `git mv`), do not touch files that the other work is editing,
and do not edit a tracked file temporarily.

## 2. Tools

Put scripts in a working directory outside the repository, with the extension
`.mts`, and run them with `node <file>`: Node runs TypeScript as it is, from any
directory. Package names do not resolve from outside the repository, so a script
imports the source files by absolute path; replace `<repo>` in the scripts below
with the absolute path of the root of the repository. Node only removes types
that can be erased: write a type-only import as `import type`, and use no
`enum`, no `namespace`, and no parameter properties. Calls to mermaid.js are
serial and slow (tens of milliseconds each, one to two minutes for all fixtures
in `fixtures:check`). With many inputs, run in the background and write the
output to a file.

### 2.1 Checking inputs with mermaid.js

```ts
// Runs the pinned mermaid.js on each input of a JSON file of the form
// { "<key>": "<input>" } and prints whether it is accepted, with the Db summary
// or the error:
//   node <this file> <inputs.json>
import { readFileSync } from "node:fs"
import { runMermaid } from "<repo>/packages/tests/src/mermaid.ts"

const inputs: Record<string, string> = JSON.parse(
  readFileSync(process.argv[2]!, "utf8"),
)
for (const [key, input] of Object.entries(inputs)) {
  const outcome = await runMermaid(input)
  const result = outcome.accepted
    ? JSON.stringify(outcome.db)
    : `rejected: ${outcome.error.name}: ${outcome.error.message.split("\n")[0]}`
  console.log(`${key}\t${JSON.stringify(input)}\n  ${result}`)
}
```

Write the JSON of inputs with a script, not by hand, so that whitespace at the
end of a line, tabs, and `\r` are exact. After writing, check the bytes with
`od -c`.

To compare with the tree and the Db derivation of the parser, load `parse` from
`<repo>/packages/parser/src/index.ts` and `dbOf` from
`<repo>/packages/parser/tests/helpers/db.ts` in the same script (read only; do
not edit the parser's files). Pass `dbOf` the values that `resolveEmbeddedData`
of `<repo>/packages/tests/src/mermaid.ts` returns for the same text; it returns
undefined when mermaid.js rejects the text.

### 2.2 Finding existing fixtures

```ts
// Lists the fixtures whose input contains a text, with what mermaid.js did:
//   node <this file> "<text>"
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

// The fixture directories; add a diagram type here when its directory exists.
const diagrams: DiagramType[] = ["common", "flowchart", "sequence", "class"]

const wanted = process.argv[2]!
for (const diagram of diagrams) {
  for (const fixture of await loadFixtures(diagram)) {
    if (!fixture.input.includes(wanted)) continue
    const outcome = fixture.expected.accepted
      ? `accepted ${JSON.stringify(fixture.expected.db)}`
      : `rejected ${fixture.expected.error.name}`
    const divergence = fixture.knownDivergence ?? "none"
    console.log(
      `${diagram}/${fixture.name} (divergence: ${divergence})\n  ${JSON.stringify(fixture.input)}\n  ${outcome}`,
    )
  }
}
```

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
  against the specification too (section 7).
- Put an example of a shared rule in `common`, and an example of a diagram
  type's rule in that diagram type's directory. Name a fixture by the kind of
  rule (`lex-`, `gram-`, `db-`, `tokens-`, `config-`, `entity-`, `comment-`,
  `directive-`, and so on, as the existing names do) and by what its input
  shows.

### 2.4 Checking the specification's documents

A change to the specification's documents and fixtures is checked as follows
(see Running tests in the skill `conventions`). After every change, run from the
root of the repository:

```sh
npx prettier --write packages/spec
npx prettier --check packages/spec
pnpm run -s lint:docs
pnpm run -s lint:chars
```

Besides the English and Japanese pairs, `pnpm run lint:docs` checks the links of
the specification's documents and of the parser's and the tests' documents
(`packages/parser/docs`, `packages/tests/docs`), their anchors, the fixture
citations (also those wrapped after `[fixture:`), the same set of citations in
each English document and its Japanese pair, and the same heading structure in
both (`scripts/check-doc-citations.mjs`). It also checks that every link to
mermaid.js in the checked documents points to the commit recorded in
`packages/spec/docs/index.md` (`scripts/check-mermaid-links.mjs`).

When fixtures were added, also run `pnpm run -s fixtures:check` in
`packages/tests`, which runs every fixture through mermaid.js again and fails
when a result differs from the recorded one.

Run no tests of the other packages: the parser, the formatter, and the linter
run their own when they take up the change. One test of the parser reads the
specification: `packages/parser/tests/types.test.ts` lists the documents under
`docs/known-divergences/`, so the result of the work (3.6) says when a known
divergence document was added or removed. The cases of 3.5 are checked with
mermaid.js once, when the sentence is written, and become fixtures, which
`fixtures:check` runs again; no test and no command generates inputs.

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
- After writing, run `npx prettier --write` to wrap the prose again.
- The Write tool and shell here-documents can turn `\uXXXX` into the actual
  character. Never write invisible characters into a document (the skill
  `conventions`); run `pnpm run lint:chars` after writing.
- Enclose a code span whose example contains a backtick in double backticks
  (``A["`x`"]``). With single backticks, Prettier closes up the spaces around it
  and breaks it. After writing, look once at the rendered form.

## 3. Adding a diagram type (step 3)

Input: steps 1 and 2 for the diagram type (the tests SKILL): its Db normalizer
and its collected fixtures. The reading of mermaid.js (3.1) and the proposal of
the tree (item 4 of 3.3) do not need the fixtures and may start while they are
collected; check the claims with inputs written for the purpose (2.1), and turn
them into fixtures once the collected ones have arrived, so that a claim does
not get a second fixture for an input that the collection already has.

### 3.1 Reading mermaid.js

Keep the source of the pinned mermaid.js outside the repository, cloned at the
tag of the pinned version as tools/README.md describes for collecting inputs.
Every link from the specification is a permalink to the commit recorded in
`packages/spec/docs/index.md`.

#### Jison diagrams

1. Read the lexer rules of the grammar definition (`*.jison`) from top to
   bottom, and settle these points:
   - The exclusive states (`%x`), the rules without a state (they match only in
     the initial state), and the `<*>` rules (they match in every state, but the
     rules of that state that come earlier in the file match first). Flowchart
     example: the string rule `<*>["]` also matches in the click state and the
     dir state, which was a gap in the specification.
   - Rules that return no token. Flowchart example: `"click"[\s]+` only enters a
     state, so the grammar never sees the word `click`. The specification makes
     it a `click` unit, which may only start a click statement; the inputs where
     mermaid.js reads it elsewhere, as nothing or as click ids that its grammar
     happens to take, are the known divergence `click-reserved-word`
     (known-divergences.md). The rules for `""`, for `call` with empty
     parentheses, and for `accDescr {}` also return no token, so mermaid.js
     accepts these empty forms in many places. They can lie inside values and
     between any two units, where the tree has no place for them, so the
     specification reads them as units that its grammar does not take, which is
     the known divergence `tokenless-empty-forms`. Not reading a text is no
     reason to reject it: the text that mermaid.js discards around a direction
     statement is a FlowchartIgnoredText node, and an empty description block
     where a statement starts is a statement.
   - Rules that can match the empty string (such as `[^\s\n]*`). At the end of
     the text they return an empty token, which makes the input rejected.
   - Whitespace rules that include line feeds, such as `[\s]+`. They also take
     the line feed that mermaid.js appends to the text (End of text in
     common.md).
2. Read the grammar rules and the action of each (the Db functions it calls).
3. Read the Db class. Look for plain objects used as sets of keys
   (`hasOwnProperty`, `__proto__`), the difference between `Object.assign` and
   spreading, rewrites with regular expressions, the places that throw
   (rejections outside the grammar), and the values that depend on the browser
   rather than on the text, such as `window.CSS` or `document` (sequence: the
   colour of a box). Such a value is not decided by the tree; tell tests, whose
   `docs/db-from-tree/<diagram>.md` says that it is supplied from outside, as a
   site configuration is.
4. Check the order of the preprocessing (Reading a source in common.md) and the
   detection (detection.md).

#### Chevrotain diagrams

For Chevrotain diagrams, read each active mode's token array in order, including
custom matchers, skipped tokens, categories, push/pop transitions, and explicit
`longer_alt`; do not assume longest match or infer precedence from declaration
order outside those arrays. Read parser rule methods, gates and lookahead as the
grammar, then visitor/model validation as acceptance conditions. Distinguish a
composite token's authored components when stating directive and
ignored-semicolon boundaries. Check mode-specific whitespace/comments, custom
matcher failure, category versus exact-unit acceptance, and longer-alternative
controls; Jison's automatic word boundary does not apply. Check full input
consumption and the wrapper's error handling: the first lexer error is reported
before any parser error, and a recovered CST need not be accepted.

#### Langium diagrams

1. Read the entry rule, every imported grammar and all reachable rules. Follow
   the generated grammar, service modules and token builder to the effective
   terminal array. Record its priority order, including inherited terminals,
   custom keyword matchers and longer alternatives. Declaration order alone and
   a general longest-match assumption do not establish that order.
2. Read the actual keyword matcher and its boundary test. State the exact
   characters that satisfy the boundary and distinguish them from whitespace
   skipped between units. Judge the boundary on the diagram text after global
   directives and the semicolons selected by the common line rule are left out.
   Through the tests package's Mermaid runner, probe a global directive glued
   immediately after a keyword and before the next component. Compare cases
   where removal leaves a valid boundary with cases where it joins the two
   components. Do not import Jison's word-boundary rule. Check competing
   keywords and terminals at the same position, including composite line forms
   whose keyword and value are read together.
3. Read hidden terminals in priority order, including their flags and where
   their match ends. Separate them from global preprocessing. Check whether they
   consume a following line feed, use it only as a boundary, or consume the
   appended line feed at EOF. Check an earlier terminal enclosing the same text,
   fallback to comments when a hidden form fails, and matches between complete
   units versus inside an atom. First ask where the tree can hold every skipped
   form; do not propose a divergence merely because it is hidden.
4. Follow the diagram's module to its custom, common and default value
   converters. Match each conversion branch to the grammar rule name that
   actually calls it; an unused branch is not behavior. Record string escapes,
   numeric conversion, trimming and whitespace collapse separately. Keep the
   tree's authored values distinct from converted Db values, and state which
   spelling the tree preserves under 3.3.
5. Follow the public parse wrapper and the diagram's adapter through complete
   consumption and every error check. Determine whether any lexer error or
   parser error prevents publication, including errors attached to a recovered
   tree. Read model validation and Db rejection after conversion too. Do not
   infer acceptance from the existence of a recovered tree or from the grammar
   alone.
6. Read the shared preprocessing and detection rules in
   [common.md](../../../packages/spec/docs/common.md): Reading a source,
   Frontmatter, Leading whitespace and Diagram detection. Read the diagram's
   detector in [detection.md](../../../packages/spec/docs/detection.md). Before
   writing Detection in 3.2, record the following as direct sentences with fixed
   cases:
   - Distinguish real leading frontmatter from the single retained
     frontmatter-shaped block at the detection point. Record the one-block skip
     and its order before bare `%%` lines and the second directive scan.
   - Record the skip's stopping cases: adjacent fences without a body line, a
     missing closer, mismatched indentation, four dashes, closing-fence suffix
     text, a closer without a following line break, and a preceding bare `%%`
     line. Check a second block, both orders of a block and a second-scan
     directive, real frontmatter before a retained block, and leading
     indentation that changes which fences match.
   - Distinguish the detection point from the header position reached. Record
     which retained forms the diagram's lexer still reads from the detection
     point, under its own terminal boundaries and acceptance gate. Record which
     bare `%%` lines and accompanying whitespace and line breaks detection
     passes and the lexer does not read again: shared Comments for the bare
     lines, trivia for that whitespace and those line breaks. Distinguish
     leading trivia before the detection point from later whitespace the diagram
     still reads.
   - List fixed cases with retained forms before and between passed bare lines,
     and with passed lines and trivia between retained forms. Compare Unicode
     whitespace after a passed line with the same whitespace without a passed
     line and with ASCII space/tab and LF controls; include whitespace
     immediately before the header and on a line of its own. Record what
     detection passes or retains, which terminal boundary must match, acceptance
     and tree ownership for each case, using 3.4–3.5.
   - Recheck any shared claim that other diagram types reject a form against
     their current rules and fixed fixtures. State only the scope supported by
     that evidence; do not carry forward a historical list of diagram types.
7. Apply 3.2–3.5 to the resulting detection rules, ordered units, authored
   components, hidden forms, conversions and acceptance gate. Write direct
   sentences and the tree before considering divergences. For each sentence,
   probe explicit cases at its named boundaries and rule intersections through
   the tests package's Mermaid runner; cover hidden-form ownership, delimiters,
   consumed line feeds, EOF and the reverse direction of any divergence. Add
   only the cases the sentence distinguishes, with the fixture CLI. Do not
   generate inputs.

### 3.2 Writing the diagram document

Write `docs/diagrams/<diagram>.md` and its `.ja.md` with the four sections of
"How to read a diagram document" in index.md.

1. Detection: point to the detector in detection.md.
2. Lexical structure: the units and the contexts, with the list of rules of each
   context in the order they are tried. "Units and contexts" in flowchart.md is
   an example of the form.
3. Grammar: in the Notation of common.md, with a table of the node that each
   rule makes, and the inputs that mermaid.js rejects after its grammar has
   accepted them, with all that decides them (Rejections outside the grammar).
4. Known divergences: those of the identifiers in known-divergences.md that
   apply to the diagram type, and how they show in it. A new divergence is
   defined in a document of its own, `known-divergences/<identifier>.md` and its
   `.ja.md`, with the parts that known-divergences.md lists (the syntax, the
   difference with examples, what it means for an author, why mermaid.js reads
   it so, the rule and why, the documentation and issues of mermaid.js where any
   were found), and with a row in the table of known-divergences.md.
   - When adding a diagram's paragraph to a divergence document, also add the
     diagram's entry to the section The documentation of mermaid.js and its
     issues.

The Db summary of a diagram type and how it is built from the tree are documents
of `@mmd-toolkit/tests` (`docs/db-summaries.md` and
`docs/db-from-tree/<diagram>.md`), written by tests; tell tests what they need.

### 3.3 Adding the nodes of the tree

`docs/ast/<diagram>.md` and its `.ja.md`.

1. For each node type: the table of fields (types in language-neutral words;
   short cells, long explanations below the table), the child fields (in the
   order a tool visits them), and the range.
2. The token kind of each unit is defined by the parser, in
   `packages/parser/docs/tokens/<diagram>.md`, and the documents of the
   specification do not refer to it; the specification lists the units of the
   lexical structure and of the grammar, from which the parser gives each unit
   its kind (3.7, item 1).
3. Decide the type of a leaf node by what the grammar allows at its position
   (the section Policies and criteria, Shared leaf nodes in ast.md).
4. Decide the shape of the nodes before writing them, once for the whole diagram
   type. First write a proposal outside the repository: every node type with its
   fields, and the points that need a decision, grouped as names, node or
   rejection for text that mermaid.js does not read, candidates for a known
   divergence, and changes to the shared parts (`ast.md`, `common.md`, the
   shared leaf nodes). Decide the shape by looking at the principles (the
   section Policies and criteria, Design goals and Shared leaf nodes in
   `ast.md`) and at the effect on the packages that use the tree (parser,
   prettier-plugin, eslint-plugin) as a whole. Where the principles leave a
   choice, present the options with examples, their grounds (the principles,
   what mermaid.js reads, the fixtures), and a recommendation, ask for a
   decision, and write the shape that is chosen. Then check every field against
   the principles. When a decided shape turns out to conflict with a principle
   or with mermaid.js, say so with the evidence before changing it.
5. A value is the text of its range, and the tokens and the range of a value
   cover the text that mermaid.js reads as the value, whitespace included where
   mermaid.js reads it (Nodes and Tokens in ast.md): a sequence title, a class
   generic type, and a flowchart style after its `,` keep their whitespace. Only
   where no token can hold what mermaid.js reads, because it runs across other
   nodes, say why in the field's description in `ast/<diagram>.md`, and tell
   tests, whose `docs/db-from-tree/<diagram>.md` says that the Db reads it from
   the source. Flowchart example: the whitespace between the empty description
   blocks right after the name of a subgraph.

### 3.4 Matching claims with fixtures

Each time a claim is written:

1. Check it with mermaid.js (2.1).
2. Look for existing fixtures (2.2). When one has the same input, or an input
   that records the same thing, cite it. Before deciding so, read the `accepted`
   and the values of its `expected.json`; never decide from how the input looks.
3. Otherwise add one (2.3). Add a contrasting example too: the closest input to
   which the rule does not apply.
4. Cite it in the sentence of the specification as
   `[fixture: <category>/<name>]`. Cite the same set in English and in Japanese.
5. Give an input that mermaid.js and the specification decide differently (Known
   divergences) its identifier with `fixtures:set-divergence`. Choose the
   identifier by the definitions in known-divergences.md, and match the existing
   fixtures of the same kind.

### 3.5 Checking a rule

Do not decide a rule from hand-written examples of its usual form only: decide
it from the cases that its sentences distinguish.

1. List the cases of each sentence. For each sentence that defines a behavior,
   list each case that it distinguishes, and each other rule that meets it at
   the place it names: a directive, an ignored `;`, a comment line, an empty
   line, a line separator (U+2028 or U+2029), an empty description block, and
   the end of the text. Each case is one input that answers one question about
   the sentence. Products of places and strings are not written, and no input is
   chosen by a random source or by a number (a seed, a count).
2. Check each case once with mermaid.js and with the parser's `parse()` and
   `dbOf()` (2.1). For a diagram type that the parser does not read yet, compare
   mermaid.js's result with what the sentence says. Each case then has a fixture
   that the sentence cites (3.4): an existing one that records it, or a new one.
   Cite at least one fixture for each case, not every fixture of the same case.
3. Sort the cases that the sentence does not explain into kinds, and explain
   each kind with one rule. Write mermaid.js's mechanism as one rule instead of
   adding exceptions (flowchart example: the empty string, the empty call, and
   the empty description block, for which mermaid.js reads no token and the tree
   has no place, are one known divergence in every place they appear, instead of
   one rule for each place).
4. Decide acceptance by one criterion (Project 1 of AGENTS.md and the section
   Policies and criteria): accept and reject what mermaid.js accepts and
   rejects, and give an accepted input mermaid.js's Db. Rejecting an input that
   mermaid.js accepts needs both facts: mermaid.js accepts it, and the tree has
   no place for what is written. So when a form is found that the author writes
   and mermaid.js does not read, first check whether the tree has a place for it
   as a node: a leaf node of the diagram, such as FlowchartIgnoredText, or a
   statement, such as an empty description block where a statement starts. Only
   where it has none, reject the input as a known divergence, and say in the
   specification why the tree has no place for it. An input that mermaid.js
   accepts but reads otherwise than an author would mean (sequence: `title`
   followed by a line break takes the next line as the title; `create destroy A`
   creates A) is accepted in the same way: the tree shows what is written, and
   the Db is mermaid.js's. List such inputs with mermaid.js's result and report
   them as candidates for lint rules; that an input means something other than
   what is written is no reason to reject it. Ask whether a node can hold the
   text first, also where mermaid.js's reading comes from the order of its
   lexer's rules or from its pipeline rather than from a rule of the syntax.
   Only where no node can hold it, write the direct rule, and list the inputs
   that are then read differently as a known divergence, proposed as 3.8 says
   (sequence: a comment that starts at `%%` keeps the character before it).
5. Before accepting a form in new places, or generalizing a rule, list where the
   rule applies, and only then write it:
   1. Every position where the form can appear, going through every rule of the
      grammar of each diagram type, not only the end of a line: after the
      header, after the heading of a statement with a body (the name of a
      subgraph, a box, a namespace, a composite state), before and after
      whitespace, before a `;`, and at the end of the text.
   2. Every place where a value comes from the text of a range rather than from
      units, such as the name text of a subgraph in flowchart, which is read
      from the source where empty description blocks follow the name, and
      whether the form can lie inside such a range.
   3. A fixture for each kind of position listed in the first item, with each
      kind of whitespace around the form that the rule distinguishes (none,
      whitespace, a line break after it), checked with mermaid.js for acceptance
      and for the Db, the values of the second item included.

   When empty description blocks before a separator were first accepted, only
   the end of a line was looked at; the place after the name of a subgraph, the
   whitespace around the blocks, the text that the Db read for a style, and the
   header line were each found afterwards. Check also that acceptance does not
   change elsewhere (flowchart example: the rule that reads the placeholder of
   an entity as one unit would change acceptance under the letter rule, rule 23,
   so its scope was limited; and skipping every `click` unit joined the click
   ids of two click contexts and accepted inputs that mermaid.js rejects, so the
   rule was narrowed).

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

### 3.6 Output

Show as the result of the work: the sections changed, the names of the fixtures
added, what the parser has to fix (acceptance, tokens, the Db derivation), and
the fixtures for which the parser needs an `ast.json`.

### 3.7 Checks before the parser reads the specification

The parser reads the specification as its only source. Before the diagram
documents go to it, go through these checks for the diagram type; each comes
from a gap that a parser found in an earlier diagram type. Write the result of
each check in the output (3.6).

1. **Unit names.** List every unit name of the lexical structure and the
   grammar, the names of the rules of the grammar included. One name names one
   unit: a keyword unit and a unit of text never share a name (state once used
   `style` for both the keyword and the text of a style; it is `style-text`).
2. **Every character in a unit.** In every context, every character that is not
   whitespace belongs to a unit, a comment, or a stated rejection: separators
   such as the `:` of a one-line note or of an alias, the `;` that the line rule
   ignores, and text that a rule of mermaid.js reads and returns no token for
   (an id that `processId` drops, an empty description block). The parser gives
   each unit a token kind, and the ignored `;` a kind for each context, in
   `packages/parser/docs/tokens/<diagram>.md`; the specification names each unit
   so that it can.
3. **The grammar takes every unit.** Every unit that the lexical structure
   lists, punctuation included, appears in a rule of the grammar, and every unit
   of a rule comes from a rule of the lexical structure.
4. **Comments.** Each diagram comment has its mark (`#`, `%%`) and its value,
   with examples: a comment in an id, a comment after a statement, and a
   directive between the characters of the mark or inside the value.
5. **Forms that are not closed.** A node whose form is accepted without its
   closing part (a description block at the end of the text) has a `closed`
   field, as in the diagram types before it.
6. **The tree document stands alone.** Each node has its own section and table
   of fields in `ast/<diagram>.md`; no section is written as "as
   `<OtherDiagram>Node`". The conditions under which a field is null, and the
   empty forms, are in the table or below it.
7. **The summary, field by field.** For each field of each record of the
   summary, tally over all fixtures of the diagram type the three cases: the key
   is missing, the value is empty, the value is set. Each case that occurs is
   explained, with a fixture, by a sentence of `docs/db-from-tree/<diagram>.md`
   of the tests package; a case that no sentence explains goes to tests. Look in
   the Db class for what is set only on the first visit, what accumulates, and
   what an update leaves as it was (`Object.assign` keeps the keys that the new
   object does not have).
8. **What the Db reads beyond the values.** The tree holds what changes the Db:
   as values (whitespace that mermaid.js reads, also a value that is all
   whitespace), as null elements of a list (an empty item between `,`), or as
   tokens (whether a `:` is there). Only where no node or token can hold it, the
   field's description in `ast/<diagram>.md` says why, and
   `docs/db-from-tree/<diagram>.md` of the tests package says that the Db reads
   it from the source.
9. **Ranges.** Every "any characters" says whether line feeds, U+2028, and
   U+2029 are included, whether as many or as few as possible are read, and
   where the rule is tried again (a rule is tried at every position of its
   context, also after a unit that does not leave it).
10. **Empty units.** For every string and text unit, say whether it may be
    empty, and where the grammar takes an empty one (`string` and
    `string-or-empty`).
11. **Empty ends of lists.** For every list (statements of a body, items between
    `,`, lines, the dividers of a body), say what happens when nothing follows
    its last separator: a body that ends with a divider, a list of ids or styles
    that ends with `,`, a text that ends right after a keyword. Check each with
    mermaid.js and the Db class; mermaid.js often builds a different structure
    when the last part is empty (state does not divide a body whose last
    statement is a divider).
12. **What follows a keyword.** For every keyword, check with mermaid.js what
    happens when a word character, a digit, `-`, `:`, `#`, `%`, `{`, `"`, a line
    feed, or the end of the text follows it, and say in the rule whether the
    keyword may be followed by a word character. In jison, a rule whose pattern
    ends with a word character, such as `"left of"`, gets `\b` at its end, and
    one that ends with `\s+` or `\s*` does not.
13. **Known divergences.** Every input of the diagram type that is a known
    divergence, under a new identifier or an existing one, has the four answers
    of 3.8 written down.

The tally of item 7, over the records of the summary that are lists of objects:

```ts
// node <this file> <diagram> — tallies, for each field of each record of the
// summary, a fixture where the key is missing, one where the value is empty,
// and one where it is set.
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

function kind(value: unknown): "missing" | "empty" | "set" {
  if (value === undefined) return "missing"
  if (value === "" || (Array.isArray(value) && value.length === 0))
    return "empty"
  return "set"
}

const fixtures = (await loadFixtures(process.argv[2] as DiagramType)).filter(
  (fixture) => fixture.expected.accepted,
)
// The fields of each record, over all fixtures.
const fields = new Map<string, Set<string>>()
for (const fixture of fixtures) {
  for (const [record, items] of Object.entries(fixture.expected.db)) {
    if (!Array.isArray(items)) continue
    const names = fields.get(record) ?? new Set<string>()
    for (const item of items)
      for (const name of Object.keys(item)) names.add(name)
    fields.set(record, names)
  }
}
const tally = new Map<string, Map<string, string>>()
for (const fixture of fixtures) {
  for (const [record, names] of fields) {
    for (const item of fixture.expected.db[record] as Record<
      string,
      unknown
    >[]) {
      for (const name of names) {
        const cases =
          tally.get(`${record}.${name}`) ?? new Map<string, string>()
        if (!cases.has(kind(item[name])))
          cases.set(kind(item[name]), fixture.name)
        tally.set(`${record}.${name}`, cases)
      }
    }
  }
}
for (const [key, cases] of tally) console.log(key, Object.fromEntries(cases))
```

A field that never occurs as missing in the fixtures may still be missing for
some input; read the Db class for each field whose value can be `undefined`.

### 3.8 Proposing a known divergence

A known divergence is proposed only after the first question of Project 1 in
AGENTS.md has been answered. Every proposal, for a new identifier or for adding
inputs to an existing one, writes down these four answers; a proposal without
them is not decided:

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

The document of the divergence (`known-divergences/<identifier>.md`) says, in
"The rule of this specification, and why", why the text is not held as a node.

## 4. When a gap in the specification is found

Input: an input that the specification does not decide, or decides differently
from mermaid.js, found while implementing or reviewing the parser, the
formatter, or the rules, or while writing the specification.

1. Reproduce the inputs with mermaid.js and with the parser.
2. Read the cause in the source of mermaid.js (3.1).
3. List the cases of the sentences that the input concerns, as in 3.5, and check
   each once with mermaid.js.
4. Write the rule. When it touches the definition of the tree, follow item 4 of
   3.3.
5. Add fixtures (3.4), contrasting examples included.
6. Show the result as in 3.6.

When only fixtures are needed (such as the grounds of a rule idea), do 3.4 for
each item, and show for each item either the names added or the names of
existing fixtures that suffice, with their `accepted` and values.

## 5. Changing the shared tree

A change to the shared part of the tree (`ast.md`: the root, the token kinds,
comments, directives, the frontmatter, the shared leaf nodes, the invariants)
affects every diagram type and every package that reads the tree. Make it in one
pass:

1. Review the shared part as a whole, not only the sentence that prompted the
   change. List every sentence that depends on what changes, in `ast.md`,
   `common.md`, and every `ast/<diagram>.md` and `diagrams/<diagram>.md`, with
   what it becomes. When the change accepts a form in new places, list its
   places and the values read from ranges first, as item 5 of 3.5 says.
2. Write the proposal outside the repository: the options for each point that
   needs a decision, with a recommendation, and the effect on the packages that
   read the tree. Wait for the decision.
3. Write the revision in one change, in English and in Japanese, and check that
   the fixtures cited by the changed sentences still record what the sentences
   say.
4. Write one list of changes for the packages that read the tree, outside the
   repository: for each package what it must change, which records or ranges
   change, how to find the fixtures whose `ast.json` changes, and the invariants
   that the tree check must test.

## 6. When mermaid.js is upgraded

Input: the pin of mermaid.js is raised, and the differences of `fixtures:check`
are sorted (the tests SKILL).

1. Change the pinned version and commit in index.md (recorded in one place).
2. Move every permalink to the new commit. Collect the URLs with the old commit
   from the documents; for each link, find the function in the same file of the
   new version and adjust the line range. Reread the claim of every link whose
   function moved, disappeared, or was renamed. Then run `pnpm run lint:docs`,
   which reports any link to mermaid.js that still points to another commit.
3. For each fixture that changed, reread the claims that cite it, and follow the
   new reading of mermaid.js.
4. Check that each Known divergence identifier still holds.
5. Check the order and the list of detectors in detection.md against the new
   version.
6. Show the result as in 3.6.

## 7. Where flowchart went wrong

- A rule decided from hand-written examples failed on boundary inputs. → Check
  the cases of each sentence and of the rules that meet it, and give each a
  fixture, as in 3.5.
- An existing fixture was taken as sufficient from the start of its input, and
  it was a rejected input. → Read its `accepted` and values.
- Prettier wrapped citations after `[fixture:`, and a line-by-line search read
  only a third of them. → Do not search line by line; use the check of
  `pnpm run lint:docs` (2.4).
- The reason written in a fixture's note did not match the order of the rules. →
  Check notes as claims of the specification, and fix them with
  `fixtures:set-note`.
- A working file of a check was written inside the repository. → Write every
  output to an absolute path in the working directory outside the repository.
- `add-many` was assumed to stop when `accepted` disagrees. → Read the list in
  its output.
- Do not try something by editing a tracked file temporarily. Copy it to the
  working directory outside the repository and edit the copy.

## 8. Jison, Langium, and Chevrotain

Use the matching procedure in 3.1. For Langium, use step 6 under
[Langium diagrams](#langium-diagrams) to establish the shared preprocessing and
detection boundary before writing Detection in 3.2. Establish the effective
terminal priority and keyword boundaries, the scope and line-feed consumption of
hidden terminals, the active value converters, and the wrapper's acceptance
gate. Apply those findings to the sentences, tree and explicit fixture cases in
3.2–3.5; a recovered tree is not evidence of acceptance.

For Chevrotain, use its procedure and checks of modes, ordered matches,
`longer_alt`, authored boundaries and error handling. Check the actual engine;
neither Jison's boundaries nor Langium's service wiring applies automatically.

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
conversation or memory. Policies and criteria are not repeated here; this
document points to AGENTS.md and to the specification's documents.

## 1. What to read first

The criteria change, so read these each time work starts.

1. AGENTS.md
   - Project: the measure of correctness, and the exceptions of the Known
     divergences.
   - The `packages/spec` section: the principles of the tree (the names of node
     types, the shared leaf nodes, a type decided by what the grammar allows at
     the position), the five sections, a fixture for every claim, no symbols, no
     code in the specification.
   - Principles: the English and Japanese pairs, invisible characters, prose
     wrapped by Prettier, `mmd` as the info string of a code block with Mermaid
     text, permalinks to the source of mermaid.js.
   - Shared interfaces: parser, prettier-plugin, and eslint-plugin use the
     definition of the tree. A change to it is a change for those packages too,
     so the result of the work says what each of them has to change.
2. In the results of the work, say for each claim whether it was checked by
   running something (mermaid.js, the parser), by reading something (the source
   of mermaid.js, a document), or not checked.
3. `packages/spec/docs/index.md` (the documents, the five sections of a diagram
   document, the writing conventions, the pinned commit), `common.md`, `ast.md`,
   and the `diagrams/<diagram>.md` and `ast/<diagram>.md` of the diagram types
   already written. The principles of the tree and their reasons are under
   Design goals and Shared leaf nodes in `ast.md`.
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
const diagrams: DiagramType[] = ["common", "flowchart"]

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

After every change, run from the root of the repository:

```sh
npx prettier --write packages/spec
npx prettier --check packages/spec
pnpm run -s lint:docs
pnpm run -s lint:chars
```

Besides the English and Japanese pairs, `pnpm run lint:docs` checks the links of
the specification's documents, their anchors, the fixture citations (also those
wrapped after `[fixture:`), the same set of citations in each English document
and its Japanese pair, and the same heading structure in both
(`scripts/check-spec-docs.mjs`). It also checks that every link to mermaid.js in
the checked documents points to the commit recorded in
`packages/spec/docs/index.md` (`scripts/check-mermaid-links.mjs`).

When fixtures were added, also run `pnpm run -s fixtures:check` in
`packages/tests`.

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
  character. Never write invisible characters into a document (AGENTS.md); run
  `pnpm run lint:chars` after writing.
- Enclose a code span whose example contains a backtick in double backticks
  (``A["`x`"]``). With single backticks, Prettier closes up the spaces around it
  and breaks it. After writing, look once at the rendered form.

## 3. Adding a diagram type (step 3)

Input: steps 1 and 2 are done for the diagram type: its Db normalizer and its
collected fixtures (the tests SKILL).

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
   colour of a box). Such a value is not decided by the tree; say in the Db
   normalization that it is supplied from outside, as a site configuration is.
4. Check the order of the preprocessing (Reading a source in common.md) and the
   detection (detection.md).

#### Langium diagrams

To be written for pie.

### 3.2 Writing the diagram document

Write `docs/diagrams/<diagram>.md` and its `.ja.md` with the five sections of
"How to read a diagram document" in index.md.

1. Detection: point to the detector in detection.md.
2. Lexical structure: the units and the contexts, with the list of rules of each
   context in the order they are tried. "Units and contexts" in flowchart.md is
   an example of the form.
3. Grammar: in the Notation of common.md, with a table of the node that each
   rule makes.
4. Db normalization: the same items as the tests package's normalizer. For each
   value, say which fields of the tree and which parts of the source it comes
   from.
5. Known divergences: those of the identifiers in known-divergences.md that
   apply to the diagram type, and how they show in it. A new divergence is
   defined in known-divergences.md, with a row in its table.

### 3.3 Adding the nodes of the tree

`docs/ast/<diagram>.md` and its `.ja.md`.

1. For each node type: the table of fields (types in language-neutral words;
   short cells, long explanations below the table), the child fields (in the
   order a tool visits them), the range, and the tokens.
2. In the table of tokens, give every unit of the grammar a token kind and an
   item.
3. Decide the type of a leaf node by what the grammar allows at its position
   (AGENTS.md, Shared leaf nodes in ast.md).
4. Decide the shape of the nodes before writing them, once for the whole diagram
   type. First write a proposal outside the repository: every node type with its
   fields, and the points that need a decision, grouped as names, node or
   rejection for text that mermaid.js does not read, candidates for a known
   divergence, and changes to the shared parts (`ast.md`, `common.md`, the
   shared leaf nodes). Decide the shape by looking at the principles (the
   `packages/spec` section of AGENTS.md, Design goals and Shared leaf nodes in
   `ast.md`) and at the effect on the packages that use the tree (parser,
   prettier-plugin, eslint-plugin) as a whole. Where the principles leave a
   choice, present the options with examples, their grounds (the principles,
   what mermaid.js reads, the fixtures), and a recommendation, ask for a
   decision, and write the shape that is chosen. Then check every field against
   the principles. When a decided shape turns out to conflict with a principle
   or with mermaid.js, say so with the evidence before changing it.
5. A value is the text of its range (Nodes in ast.md). Where whitespace outside
   a range affects mermaid.js's result, do not put it in the value; say that the
   Db steps read it from the source. Flowchart examples: the Db text of a style,
   and the name text of a subgraph (the whitespace before and after the name).

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

Do not decide a rule from hand-written examples only.

1. Generate inputs (hundreds to thousands) that combine small pieces at the
   rule's boundaries: spaces, tabs, line breaks, empty strings, directives,
   comment lines, `;`, keywords, strings, and the end of the text.
2. Run them through mermaid.js and through the parser's `parse()` and `dbOf()`,
   and collect the differences in acceptance and in values. For a diagram type
   that the parser does not read yet, compare mermaid.js's results with what the
   rule written in the specification says, and run the comparison with the
   parser again once it reads the diagram type.
3. Sort the differences into kinds, and explain each kind with one rule. Write
   mermaid.js's mechanism as one rule instead of adding exceptions (flowchart
   example: the empty string, the empty call, and the empty description block,
   for which mermaid.js reads no token and the tree has no place, are one known
   divergence in every place they appear, instead of one rule for each place).
4. Decide acceptance by one criterion (Project 1 and the `packages/spec` section
   of AGENTS.md): accept and reject what mermaid.js accepts and rejects, and
   give an accepted input mermaid.js's Db. Rejecting an input that mermaid.js
   accepts needs both facts: mermaid.js accepts it, and the tree has no place
   for what is written. So when a form is found that the author writes and
   mermaid.js does not read, first check whether the tree has a place for it as
   a node: a leaf node of the diagram, such as FlowchartIgnoredText, or a
   statement, such as an empty description block where a statement starts. Only
   where it has none, reject the input as a known divergence, and say in the
   specification why the tree has no place for it. An input that mermaid.js
   accepts but reads otherwise than an author would mean (sequence: `title`
   followed by a line break takes the next line as the title; `create destroy A`
   creates A) is accepted in the same way: the tree shows what is written, and
   the Db is mermaid.js's. List such inputs with mermaid.js's result and report
   them as candidates for lint rules; that an input means something other than
   what is written is no reason to reject it. Where mermaid.js's reading comes
   from the order of its lexer's rules or from its pipeline rather than from a
   rule of the syntax, write the direct rule instead, and list the inputs that
   both accept and read differently as a known divergence with a reference input
   (sequence: a comment that starts at `%%` keeps the character before it).
5. Before generalizing a rule, list every place it applies to, and check that
   acceptance does not change (flowchart example: the rule that reads the
   placeholder of an entity as one unit would change acceptance under the letter
   rule, rule 23, so its scope was limited; and skipping every `click` unit
   joined the click ids of two click contexts and accepted inputs that
   mermaid.js rejects, so the rule was narrowed).
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

## 4. When a gap in the specification is found

Input: an input that the specification does not decide, or decides differently
from mermaid.js, found while implementing or reviewing the parser, the
formatter, or the rules, or while writing the specification.

1. Reproduce the inputs with mermaid.js and with the parser.
2. Read the cause in the source of mermaid.js (3.1).
3. Generate and list inputs of the same kind, as in 3.5.
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
   what it becomes.
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
  with generated inputs, as in 3.5.
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

## 8. Jison and Langium

Section 3.1 on Jison diagrams was written with flowchart. The steps for Langium
diagrams (pie and others) are to be written for pie, in the Langium part of 3.1,
together with what differs in 3.2 to 3.5.

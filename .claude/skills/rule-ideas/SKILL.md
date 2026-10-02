---
name: rule-ideas
description:
  Find ideas for the rules of eslint-plugin-mmd and decide which rules to keep
  (adoption, name, scope). Use when looking for new rule candidates, reviewing
  proposed candidates, or rechecking existing rules against the adoption
  criteria.
---

# Finding rule ideas and deciding which rules to keep (rule-ideas)

How to find candidate rules for `eslint-plugin-mmd` (an ESLint language plugin
for Mermaid diagram text) and decide whether to keep each one, its name, and its
scope. It is written so that the same decisions can be made from this document
alone, without the conversation history or memory. The adoption criteria
themselves are in AGENTS.md; this document describes how to apply them.

## 1. What this procedure covers, and how to work

- This procedure decides which rules exist, their names, and their scope. The
  decisions are shown in the form of section 6.
- The procedure itself writes no file of the repository. Working scripts and
  their output are kept in a working directory outside the repository.
- The decisions are recorded in the repository by the following procedures,
  which the same person may carry out next:
  - The rule documents (`packages/eslint-plugin-mmd/docs/rules/`) are written
    with the procedure of the eslint-plugin SKILL. Each document belongs to a
    rule file under `packages/eslint-plugin-mmd/src/rules/`; a rule is added,
    renamed, or removed with its document, as the eslint-plugin SKILL describes.
    When a document of a dropped rule exists, it is deleted with its rule file
    by the same procedure.
  - Missing supporting fixtures are added with the generator of the tests
    package (`packages/tests/docs/maintaining-fixtures.md`).
- For each claim, show whether it was run (checked by running it), read (checked
  by reading), or unchecked. When a claim turns out to be wrong, withdraw it in
  those words.
- The specification can change. Read the current file again before relying on
  it. A wrong decision was once made from an old version (the token kind of
  `click` in a subgraph name).
- When the working tree is shared with other work:
  - Do not touch a file that someone else is editing. When two people touch the
    same file, the changes of one are lost, and waiting until the edits stop
    does not prevent that.
  - Read the target before deleting or replacing it.
  - Do not change the git staging area, and do not use git mv or git rm.

## 2. Applying the adoption criteria

The criteria are in the `packages/eslint-plugin-mmd` section of AGENTS.md. Read
them before every decision. This section shows how they are applied, by example.

### Examples of decisions (made on 2026-10-01, run with mermaid 12.0.0)

Kept (an author's mistake that mermaid accepts silently):

| Input                                                                                                | What mermaid does                                                       | Rule                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An empty `%%` line inside lines commented out together                                               | Makes the vertex `%%`                                                   | flowchart/no-bare-comment-marker (could also be read as a mermaid bug, but kept; a borderline case)                                                     |
| `%%{init: {...}}` (the closing `%%` forgotten)                                                       | The directive runs to the end of the text, and the diagram is empty     | no-unclosed-directive (common)                                                                                                                          |
| `%%{init: {"flowchart": {"inheritDir": true},}}%%` (a trailing comma)                                | All init configuration is dropped                                       | no-ignored-init-directive (common)                                                                                                                      |
| `C-->A[End]` after `A[Start]-->B`                                                                    | The label of A becomes End                                              | flowchart/no-redefined-vertex                                                                                                                           |
| `style C fill:red` (C mistyped)                                                                      | Adds a styled vertex C                                                  | flowchart/no-style-unknown-id                                                                                                                           |
| An `accDescr {` block left unclosed                                                                  | The description is empty                                                | flowchart/no-unclosed-description-block                                                                                                                 |
| `accDescr {}` in a diagram without a description (also with only whitespace inside, or on two lines) | Nothing happens (the description stays empty)                           | flowchart/no-empty-description-block                                                                                                                    |
| `accDescr: second` after `accDescr: first`                                                           | The description is replaced by `second` without a word                  | flowchart/no-duplicate-description                                                                                                                      |
| `accTitle: second` after `accTitle: first`                                                           | The title is replaced by `second` without a word                        | flowchart/no-duplicate-title                                                                                                                            |
| `A-->B; direction TB` in a subgraph (the same with or without the `;`)                               | The rest of the direction line is dropped: A, B, and the edge disappear | flowchart/no-ignored-text (a direction statement is written on a line of its own; mermaid drops the statements written on the same line without a word) |

Dropped:

| Input                                                                                                                                                                                                          | Why it was dropped                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A[ ]`, `style A fill:#f00, `, `click-->B`, `A[ /x/]`, `hasOwnProperty` as the last member                                                                                                                     | Stylistic. mermaid reads them as written, and only a later edit breaks them (`A[ ]` and `A[" "]` are the same empty label)                                                                                                                                                                                                                  |
| `A%%{init: {}}%%B-->C`, `A[style:#x;]`                                                                                                                                                                         | Happens only in text that is obscure on purpose                                                                                                                                                                                                                                                                                             |
| `A&B-->C`                                                                                                                                                                                                      | Cannot be told from an intended way of writing. `R&D-->X` is also the vertex `R&D`, the same form as an id with `&` written on purpose                                                                                                                                                                                                      |
| `A[Issue #123; fixed]` (becomes `{`)                                                                                                                                                                           | Cannot be told from an intended way of writing. Numeric entities (`#9829;`) are a documented way of writing                                                                                                                                                                                                                                 |
| `A"Start"-->B` (the `[ ]` forgotten)                                                                                                                                                                           | Comes from not knowing the syntax. Enclosing a label in `[ ]` is defined by the grammar                                                                                                                                                                                                                                                     |
| `style A fill:red;stroke:blue`                                                                                                                                                                                 | Comes from not knowing the syntax. The grammar defines `,` as the separator of styles                                                                                                                                                                                                                                                       |
| `direction LR` outside a subgraph                                                                                                                                                                              | Comes from not knowing the syntax. The specification says it changes nothing outside a subgraph                                                                                                                                                                                                                                             |
| `subgraph S %% group`, `accTitle: T %% note`                                                                                                                                                                   | Comes from not knowing the syntax. The specification says a `%%` in the middle of a line is no comment                                                                                                                                                                                                                                      |
| `%%{config: ...}%%`                                                                                                                                                                                            | Comes from not knowing the syntax. `config` is a key of the frontmatter, not the name of a directive                                                                                                                                                                                                                                        |
| `A---orders` (the arrow `---o` and the vertex `rders`)                                                                                                                                                         | The formatter makes it visible: it prints `A ---o rders`. A rule would be a second thing to maintain beside the formatter                                                                                                                                                                                                                   |
| `A-->B` on the line after an `accTitle:` left empty (the title becomes `A-->B`)                                                                                                                                | The formatter makes it visible: it indents `A-->B` as the continuation of `accTitle:`                                                                                                                                                                                                                                                       |
| `A[<span style='color:#f00;font-weight:bold'>x</span>]` (the `;` after the `#` colour is removed, giving `color:#f00font-weight:bold`; the rewriting meant for `style` lines also hits the `style=` attribute) | Looks like a mermaid bug: mermaid's rewriting breaks correct CSS                                                                                                                                                                                                                                                                            |
| `subgraph Handle click events`, a line break, `A` (in mermaid, the title `Handle eventsA`)                                                                                                                     | A syntax error, so no rule applies: `click` is a reserved word that may only begin a click statement                                                                                                                                                                                                                                        |
| `A-->""B` (an empty string)                                                                                                                                                                                    | A syntax error, so no rule applies: an empty string is not accepted                                                                                                                                                                                                                                                                         |
| `accDescr {`, `%% old description`, `}` (the description lines commented out)                                                                                                                                  | Matches an intended way of writing: the author means the block to do nothing, and mermaid reads it so (the earlier description stays)                                                                                                                                                                                                       |
| `subgraph Front end`, a line break, `A`, a line break, `end` (`A` goes into the name, no members)                                                                                                              | Looks like a mermaid bug: an ordinary name is written correctly, and the word `end` at its end takes the line break after it. Facts: the flowchart docs warn about a lowercase `end` at the top of the page, and [#1444](https://github.com/mermaid-js/mermaid/issues/1444) (closed; Type: Enhancement) calls it a limitation of the markup |
| `box red-team` (the box is red, and its name is `-team`)                                                                                                                                                       | Looks like a mermaid bug: the docs allow a name without a colour, and the name is split at the `-`                                                                                                                                                                                                                                          |
| `link A: Dash@https://x.example` (the label is `Das`)                                                                                                                                                          | Looks like a mermaid bug: one missing space drops the last character of the label. Fact: the docs show the form `<label> @ <url>` only                                                                                                                                                                                                      |
| `subgraph a ` (whitespace at the end of the line makes the id subGraph0)                                                                                                                                       | Looks like a mermaid bug: invisible whitespace at the end of the line changes the id. Fact: its maintainers approved it as a bug in [#3252](https://github.com/mermaid-js/mermaid/issues/3252) (closed; Type: Bug / Error, Status: Approved, P1), and it still happens in 12.0.0                                                            |
| `class 1A:::c` (a name that starts with a digit), `style C fill:red` before `class C`, `classDef fo` applied to the CSS class `foo`                                                                            | Outside the scope of this toolkit: whether a CSS class or a style is applied shows only in the drawn diagram, and this toolkit does not draw. Not judged as a mermaid bug, and not reported to mermaid                                                                                                                                      |
| `` class `a~b` `` (id `a` with the type `b`, drawn as `a<b>`)                                                                                                                                                  | A mermaid bug by its docs: backquotes escape special characters ([syntax/classDiagram.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L161-L168)), but `~` inside them still starts a generic type. Rare in ordinary writing                       |
| `note for A~T~ "x"` after `class A~T~` (a note for a class written with its generic type)                                                                                                                      | Looks like a mermaid bug: the note keeps the name `A~T~`, the class is `A`, and the note is drawn without its line. `note for A "x"` finds the class                                                                                                                                                                                        |
| `+foo(a(b)) int` (in the Db, the method name `foo(a` and the parameters `b)`)                                                                                                                                  | Nothing the user sees: the drawn diagram shows `+foo(a(b)) : int`                                                                                                                                                                                                                                                                           |
| `A x-->B`, `A o-- t -->B` (a start marker different from the end marker)                                                                                                                                       | A mermaid bug, already recognized: mermaid-js/mermaid#1665 (open, approved) says that arrows with different markers at their ends do not work. `A x-->B` is a longer plain arrow, and `A o-- t -->B` is drawn as a plain arrow                                                                                                              |
| `A x-- t x--x B` (the start marker on both the opening and the closing arrow)                                                                                                                                  | Comes from not knowing the syntax. The specification says the edge is `INVALID` (drawn as a plain arrow); `A x-- t --x B` is the way to write it                                                                                                                                                                                            |

### Questions for unclear cases

1. Is the input something that a person who is simply drawing a diagram writes?
   Does it only copy an unusual example of the specification?
2. Does mermaid, now, give a result different from what was written? If only a
   later edit breaks it, the rule is stylistic.
3. Does the condition of the rule also match a documented correct way of
   writing, or a way of writing that an author means? If it does, the rule
   cannot report without false positives, so it is not kept. Always run one
   intended way of writing through mermaid as an example that is not reported.
4. Does the specification's grammar or text say that the way of writing means
   something else? If it does, and an author who knows the syntax would not
   write it, it is not kept for now. Even then, mistakes that an author who
   knows the syntax makes by accident (an unclosed block, a typo, a reused id)
   are kept.
5. Does formatting the reported example make the way mermaid reads it visible?
   If it does, the rule is not kept (it would be a second thing to maintain
   beside the formatter). The formatter does not change the Db, so it does not
   fix the mistake, but after formatting the author can see it. Formatting is
   described in section 4. Weak hints, such as indentation that does not line up
   or a difference in where spaces go, do not count as visible.
6. Does the author write correctly, with a sensible meaning, while mermaid reads
   it wrongly? When, thinking normally, the behavior looks like a bug, it is not
   a rule. This does not depend on whether the maintainers of mermaid treat it
   as a bug, whether its docs mention it, or whether it will be fixed; those are
   facts to record with the decision. A rule is kept only for an author's
   mistake that mermaid accepts silently. Whether to report a behavior to
   mermaid is a separate decision, which the user makes for what can be shown
   with evidence. To record the facts: (a) read the section of mermaid's docs
   for that syntax and the warnings at the top of the page; (b) search the
   issues and pull requests by title (`in:title`) and by body, with the words as
   separate terms, and record the words; (c) say whether the wrong result is
   what the user sees in the drawn diagram, not only a value in the Db. For
   borderline cases (an empty `%%` line, whitespace at the end of a line), ask
   for a decision, with the reasons on both sides.
7. When you cannot decide, ask for a decision, with the reasons on both sides.

## 3. Where to look for ideas

- The specification: `packages/spec/docs/common.md` and
  `packages/spec/docs/diagrams/<diagram>.md`. Pick up the examples of accepted
  but surprising readings that are written as consequences of the rules.
- Fixtures: `packages/tests/fixtures/<diagram>/` (`input.mmd`, `expected.json`,
  `ast.json`). Those whose names start with `lex-`, `gram-`, or `db-` record
  many surprising readings.
- The formatter's limits: `packages/prettier-plugin-mmd/docs/<diagram>.md` and
  `docs/compatibility.md`. They list the places where one space or one `;`
  changes the meaning.
- Existing rules: `packages/eslint-plugin-mmd/docs/rules/`. Do not propose the
  same rule again.
- Your own search: start from an author's mistakes (an unclosed block, a typo, a
  reused id, broken configuration JSON, leftovers of commenting out) and run
  mermaid. Starting from the unusual examples of the specification tends to give
  only inputs that are obscure on purpose. When you find an ordinary way of
  writing that mermaid reads wrongly (the ordinary word `end` in a subgraph name
  taking the line break, for example), show it in the result as a candidate
  mermaid bug, not as a rule.

## 4. Checking with mermaid and parse()

Put the following script in a working directory outside the repository as
`probe.mts`, and replace `<repo>` with the absolute path of the root of the
repository. Package names are not resolved from a file outside the repository,
so the source files are imported by absolute path. The extension must be `.mts`
(the script uses a top-level `await`). Node removes the type annotations before
it runs the script, so an import of types only is written as `import type`, and
`enum`, `namespace`, and parameter properties are not used.

```ts
import { readFileSync } from "node:fs"
import { parse } from "<repo>/packages/parser/src/index.ts"
import type { Root } from "<repo>/packages/parser/src/index.ts"
import { runMermaid } from "<repo>/packages/tests/src/mermaid.ts"

const casesPath = process.argv[2]
if (casesPath === undefined) throw new Error("usage: probe.mts <cases.json>")
const inputs: string[] = JSON.parse(readFileSync(casesPath, "utf8"))

function withoutPositions(key: string, value: unknown): unknown {
  return key === "loc" || key === "range" ? undefined : value
}

for (const input of inputs) {
  console.log("INPUT", JSON.stringify(input))
  const outcome = await runMermaid(input)
  if (outcome.accepted) {
    console.log(
      "MERMAID accepted",
      outcome.diagramType,
      JSON.stringify(outcome.db),
    )
  } else {
    console.log("MERMAID rejected", outcome.error.message.split("\n")[0])
  }
  let root: Root
  try {
    root = parse(input)
  } catch (error) {
    console.log(
      "PARSER error",
      error instanceof Error ? error.message.split("\n")[0] : String(error),
    )
    continue
  }
  console.log(
    "TOKENS",
    root.tokens
      .map((token) => `${token.type}:${JSON.stringify(token.value)}`)
      .join(" "),
  )
  console.log(
    "COMMENTS",
    JSON.stringify(root.comments.map((comment) => comment.value)),
  )
  console.log(
    "DIRECTIVES",
    JSON.stringify(
      root.directives.map((directive) => ({
        name: directive.name,
        closed: directive.closed,
      })),
    ),
  )
  console.log("BODY", JSON.stringify(root.body, withoutPositions))
}
```

- Put the inputs in a JSON file. Written directly in the shell, `\n` and quotes
  go wrong, so create the file with `json.dump` in Python or similar. Inputs
  that need whitespace at the end of a line are made exactly this way too.
- Run `node <working directory>/probe.mts <cases.json>`, from any directory.
  Write the output to a file and read it from there. When the machine is busy,
  starting can take several minutes.
- For each candidate, run these three together:
  - an example that is reported (ordinary writing)
  - an example that is not reported (the corrected writing)
  - an intended way of writing (question 3 of section 2; for example `#9829;` or
    `R&D`)
- `runMermaid` gives a Db summary only for diagram types that have a normalizer
  (flowchart, for now); for other diagram types `db` is null. `parse()` also
  fails for diagram types it does not support yet, with
  `Diagram type "<id>" is not supported yet`. Whether the result changes in
  another diagram type is judged by comparing acceptance and rejection, and by
  the reading of section 5.
- How the tree shows what a rule reports is checked by applying the condition to
  the result of `parse()`. Write the condition with the fields of nodes, the
  kinds and values of tokens, `Root.comments`, and `Root.directives`. Do not
  write a condition that lexes the text again. When the value of a leaf node has
  to be searched, say so explicitly. When the tree and the tokens cannot show
  it, say so.

### Checking by formatting (question 5 of section 2)

Run the reported example through the formatter and see whether the way mermaid
reads it becomes visible. Put the following script in the working directory as
`format.mts`, replace `<repo>` with the absolute path of the root of the
repository, and run it like the probe. prettier is imported by absolute path,
from the copy that the plugin's package depends on. The plugin imports
`@mmd-toolkit/parser`, which resolves to the built `packages/parser/lib`, not to
the parser's source. When the parser's source has changed, rebuild it with
`pnpm --filter @mmd-toolkit/parser run build` before running the script;
otherwise the text is formatted by an old parser. The probe imports the parser's
source directly and is not affected.

```ts
import { readFileSync } from "node:fs"
import { format } from "<repo>/packages/prettier-plugin-mmd/node_modules/prettier/index.mjs"
import plugin from "<repo>/packages/prettier-plugin-mmd/src/index.ts"

const casesPath = process.argv[2]
if (casesPath === undefined) throw new Error("usage: format.mts <cases.json>")
const inputs: string[] = JSON.parse(readFileSync(casesPath, "utf8"))

for (const input of inputs) {
  const formatted = await format(input, {
    parser: "mermaid",
    plugins: [plugin],
  })
  console.log("INPUT    ", JSON.stringify(input))
  console.log("FORMATTED", JSON.stringify(formatted))
}
```

Example: `A---orders` becomes `A ---o rders` (run).

## 5. Common rule or rule of a diagram type

The condition is in the `packages/eslint-plugin-mmd` section of AGENTS.md. Even
when the cause is the shared syntax (a rule of `common.md`), the rule is not
common when the lexer of a diagram type absorbs or rejects the input.

How to check:

1. Take the list of all diagram types from the table of the specification's
   `packages/spec/docs/detection.md` (every entry in the order of detection,
   with the first word of each diagram type). Do not use a list written by hand.
2. For each diagram type, make the smallest diagram that starts with that first
   word, and check that mermaid accepts it. The following 22 diagrams were
   checked to be accepted by mermaid 12.0.0 (run; in parentheses, the diagram
   type id that mermaid returned). For a diagram type not listed, make one and
   check it at the time.
   - `sequenceDiagram`, a line break, `A->>B: hi` (sequence)
   - `classDiagram`, a line break, `class A` (classDiagram)
   - `stateDiagram-v2`, a line break, `[*] --> A` (stateDiagram)
   - `erDiagram`, a line break, `A ||--o{ B : has` (er)
   - `gantt`, a line break, `title T`, a line break, `section S`, a line break,
     `Task :a1, 2024-01-01, 1d` (gantt)
   - `pie`, a line break, `"a" : 1` (pie)
   - `journey`, a line break, `title T`, a line break, `section S`, a line
     break, `Task: 5: Me` (journey)
   - `gitGraph`, a line break, `commit` (gitGraph)
   - `mindmap`, a line break, `root`, a line break, `  A` (mindmap)
   - `timeline`, a line break, `title T`, a line break, `2020 : a` (timeline)
   - `quadrantChart`, a line break, `x-axis Low --> High` (quadrantChart)
   - `requirementDiagram`, a line break, `requirement r {`, a line break,
     `id: 1`, a line break, `}` (requirement)
   - `block`, a line break, `A` (block)
   - `xychart`, a line break, `x-axis [a, b]`, a line break, `bar [1, 2]`
     (xychart)
   - `sankey`, a line break, `A,B,1` (sankey)
   - `packet`, a line break, `0-15: "A"` (packet)
   - `kanban`, a line break, `todo`, a line break, `  a` (kanban)
   - `architecture-beta`, a line break, `service a(server)[A]` (architecture)
   - `C4Context`, a line break, `Person(a, "A")` (c4)
   - `radar-beta`, a line break, `axis a, b, c`, a line break, `curve c1{1,2,3}`
     (radar)
   - `treemap-beta`, a line break, `"A"`, a line break, `  "B": 1` (treemap)
   - `info` (info)
3. Put the same construct in each diagram, run them through mermaid, and compare
   acceptance and rejection for each diagram type. A diagram type that rejects
   it needs no rule.
4. Whether the result changes in a diagram type that accepts it is checked by
   reading the lexer rules of that diagram type in the build of the pinned
   mermaid.
   - They are in
     `node_modules/.pnpm/mermaid@<version>/node_modules/mermaid/dist/chunks/mermaid.core/`.
     Depending on the diagram type, the file name has one of these forms:
     - `<name>Diagram-*.mjs` (sequenceDiagram, pieDiagram, and others)
     - `<name>-definition-*.mjs` (timeline, mindmap, kanban)
     - `diagram-*.mjs` without a name (packet, radar, treemap, and others). Find
       it with `grep -l` for the diagram type id.
   - The lexer rules of a jison diagram are listed as regular expressions of the
     form `/^(?:...)/`, so extract the relevant rules with `grep -o`.
   - The chunk of a Langium diagram has no jison lexer rules (pie, gitGraph,
     info, and architecture had none of that form; run). Comparing acceptance
     and rejection does not tell whether the Db changes, so treat it as
     unchecked.
5. Example: a line that holds only `%%`.
   - Only flowchart-v2 makes the vertex `%%` (run).
   - er and sankey reject it (run).
   - sequence, classDiagram, stateDiagram, gantt, journey, timeline, mindmap,
     kanban, c4, quadrantChart, and xychart have a lexer rule that reads a line
     starting with `%%` as a comment (run; extracted with grep).
   - So this rule became a rule of flowchart.

## 6. What a decision shows

For each rule decided, show:

- The name of the rule (`<diagram>/<name>`, or `<name>` for a common rule), and
  whether it is common or belongs to a diagram type.
- What it reports (one sentence).
- Why: how mermaid reads the input, why it happens in ordinary writing, and why
  the result differs from what was written.
- An example that is reported, an example that is not reported, and an intended
  way of writing, each with the result of mermaid (run). The inputs must be
  accepted. The examples are ordinary writing: a lead-in added only to check the
  behavior (such as an earlier description) is not put in an example, but shown
  in the text of the reason and in the fixtures.
- How the tree shows it: which node, field, or token finds it, with the result
  checked on `parse()` (run).
- The supporting fixtures: their names if they exist; otherwise the smallest
  inputs to add, with a contrasting example.

Show what was decided to be dropped as well, with the name and the criterion of
AGENTS.md under which it was dropped.

When writing a rule document shows a new candidate, a needed change of scope or
name, or that the tree cannot show something, decide it again with the same
criteria and show the result in the same form.

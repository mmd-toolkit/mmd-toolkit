---
name: rule-ideas
description:
  Find ideas for the rules of @mmd-toolkit/eslint-plugin and decide which rules
  to keep (adoption, name, scope, whether `recommended` enables them,
  suggestions). Use when looking for new rule candidates, reviewing proposed
  candidates, or rechecking existing rules against the adoption criteria.
---

# Finding rule ideas and deciding which rules to keep (rule-ideas)

How to find candidate rules for `@mmd-toolkit/eslint-plugin` (an ESLint language
plugin for Mermaid diagram text) and decide whether to keep each one, its name,
and its scope. It is written so that the same decisions can be made from this
document alone, without the conversation history or memory. The adoption
criteria themselves are in "Policies and criteria" in section 2; the rest of
this document describes how to apply them.

## 1. What this procedure covers, and how to work

- This procedure decides which rules exist, their names, their scope, and
  whether the `recommended` configuration enables them. The decisions are shown
  in the form of section 6.
- The procedure itself writes no file of the repository, except the record of
  the decisions on `recommended` in section 7 of this document. Working scripts
  and their output are kept in a working directory outside the repository.
- The decisions are recorded in the repository by the following procedures,
  which the same person may carry out next:
  - The rule documents (`packages/eslint-plugin/docs/rules/`) are written with
    the procedure of the eslint-plugin SKILL. Each document belongs to a rule
    file under `packages/eslint-plugin/src/rules/`; a rule is added, renamed, or
    removed with its document, as the eslint-plugin SKILL describes. When a
    document of a dropped rule exists, it is deleted with its rule file by the
    same procedure.
  - Missing supporting fixtures are requested from the tests package, with the
    smallest input and the claim that the fixture answers; the tests package
    adds them and records what mermaid.js does
    (`packages/tests/docs/maintaining-fixtures.md`), and the names are then
    listed in the rule notes.
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

## 2. The adoption criteria, and how to apply them

### Policies and criteria

- A rule reports a mistake of the author that mermaid.js accepts without a word
  and reads as something other than what was meant: a typing mistake, something
  left unclosed, broken JSON, an id used twice. Each rule is checked by running
  the pinned mermaid.js on an example of ordinary writing, and by formatting the
  example.
- The package holds no rule of these kinds:
  - A stylistic rule: mermaid.js reads the text as written, and only a later
    edit would break it.
  - A rule for text that is obscure on purpose.
  - A rule for a defect of mermaid.js: the author writes something correct and
    meaningful and mermaid.js misreads it (`subgraph Front end`, CSS in a
    label). Whether such a thing is reported to mermaid.js is a separate
    question, which the user decides.
  - A rule whose condition also matches a way of writing that an author means
    (`A[Issue #123; fixed]` has the same form as the entity `#9829;`).
  - A rule for what the formatter of this project already makes visible: when
    the formatted text shows how mermaid.js reads it (`A---orders` is printed as
    `A ---o rders`), a rule would only be a second thing to maintain.
  - For now, a rule for a mistake that comes from not knowing the syntax, where
    the specification's grammar or text says that the way of writing means
    something else (`A"Start"` without brackets, `;` between styles).
- A rule is common only when one definition, over the part of the tree that
  every diagram type shares, covers every diagram type and they all behave the
  same; otherwise it belongs to a diagram type, and its name starts with
  `<diagram>-` (document `docs/rules/<diagram>-<name>.md`).

Read them before every decision. The rest of this section shows how they are
applied, by example.

### Examples of decisions (made on 2026-10-01, run with mermaid 12.0.0)

Kept (an author's mistake that mermaid accepts silently):

| Input                                                                                                | What mermaid does                                                       | Rule                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An empty `%%` line inside lines commented out together                                               | Makes the vertex `%%`                                                   | flowchart-no-bare-comment-marker (could also be read as a mermaid bug, but kept; a borderline case)                                                         |
| `%%{init: {...}}` (the closing `%%` forgotten)                                                       | The directive runs to the end of the text, and the diagram is empty     | no-unclosed-directive (common)                                                                                                                              |
| `%%{init: {"flowchart": {"inheritDir": true},}}%%` (a trailing comma)                                | All init configuration is dropped                                       | no-ignored-init-directive (common)                                                                                                                          |
| `C-->A[End]` after `A[Start]-->B`                                                                    | The label of A becomes End                                              | flowchart-no-redefined-vertex                                                                                                                               |
| `style C fill:red` (C mistyped)                                                                      | Adds a styled vertex C                                                  | flowchart-no-undef                                                                                                                                          |
| `class C foo` or `click C href "…"` (C mistyped)                                                     | Nothing: no vertex gets the class or the link                           | flowchart-no-undef                                                                                                                                          |
| `style C fill:red`, then `class C foo` (C mistyped in both)                                          | `style` adds the vertex C, and the class applies to it                  | flowchart-no-undef, on the `style` only: the first `style` of an id that nothing else defines is reported, and a vertex that `style` adds counts as defined |
| An `accDescr {` block left unclosed                                                                  | The description is empty                                                | flowchart-no-unclosed-description-block                                                                                                                     |
| `accDescr {}` in a diagram without a description (also with only whitespace inside, or on two lines) | Nothing happens (the description stays empty)                           | flowchart-no-empty-description-block                                                                                                                        |
| `accDescr: second` after `accDescr: first`                                                           | The description is replaced by `second` without a word                  | flowchart-no-duplicate-description                                                                                                                          |
| `accTitle: second` after `accTitle: first`                                                           | The title is replaced by `second` without a word                        | flowchart-no-duplicate-title                                                                                                                                |
| `A-->B; direction TB` in a subgraph (the same with or without the `;`)                               | The rest of the direction line is dropped: A, B, and the edge disappear | flowchart-no-ignored-text (a direction statement is written on a line of its own; mermaid drops the statements written on the same line without a word)     |

Dropped:

| Input                                                                                                                                                                                                          | Why it was dropped                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A[ ]`, `style A fill:#f00, `, `click-->B`, `A[ /x/]`, `hasOwnProperty` as the last member                                                                                                                     | Stylistic. mermaid reads them as written, and only a later edit breaks them (`A[ ]` and `A[" "]` are the same empty label)                                                                                                                                                                                                                                                                                                                      |
| `A%%{init: {}}%%B-->C`, `A[style:#x;]`                                                                                                                                                                         | Happens only in text that is obscure on purpose                                                                                                                                                                                                                                                                                                                                                                                                 |
| `A&B-->C`                                                                                                                                                                                                      | Cannot be told from an intended way of writing. `R&D-->X` is also the vertex `R&D`, the same form as an id with `&` written on purpose                                                                                                                                                                                                                                                                                                          |
| `A[Issue #123; fixed]` (becomes `{`)                                                                                                                                                                           | Cannot be told from an intended way of writing. Numeric entities (`#9829;`) are a documented way of writing                                                                                                                                                                                                                                                                                                                                     |
| `A"Start"-->B` (the `[ ]` forgotten)                                                                                                                                                                           | Comes from not knowing the syntax. Enclosing a label in `[ ]` is defined by the grammar                                                                                                                                                                                                                                                                                                                                                         |
| `style A fill:red;stroke:blue`                                                                                                                                                                                 | Comes from not knowing the syntax. The grammar defines `,` as the separator of styles                                                                                                                                                                                                                                                                                                                                                           |
| `direction LR` outside a subgraph                                                                                                                                                                              | Comes from not knowing the syntax. The specification says it changes nothing outside a subgraph                                                                                                                                                                                                                                                                                                                                                 |
| `subgraph S %% group`, `accTitle: T %% note`                                                                                                                                                                   | Comes from not knowing the syntax. The specification says a `%%` in the middle of a line is no comment                                                                                                                                                                                                                                                                                                                                          |
| `%%{config: ...}%%`                                                                                                                                                                                            | Comes from not knowing the syntax. `config` is a key of the frontmatter, not the name of a directive                                                                                                                                                                                                                                                                                                                                            |
| `A---orders` (the arrow `---o` and the vertex `rders`)                                                                                                                                                         | The formatter makes it visible: it prints `A ---o rders`. A rule would be a second thing to maintain beside the formatter                                                                                                                                                                                                                                                                                                                       |
| `A-->B` on the line after an `accTitle:` left empty (the title becomes `A-->B`)                                                                                                                                | The formatter makes it visible: it indents `A-->B` as the continuation of `accTitle:`                                                                                                                                                                                                                                                                                                                                                           |
| `A[<span style='color:#f00;font-weight:bold'>x</span>]` (the `;` after the `#` colour is removed, giving `color:#f00font-weight:bold`; the rewriting meant for `style` lines also hits the `style=` attribute) | Looks like a mermaid bug: mermaid's rewriting breaks correct CSS                                                                                                                                                                                                                                                                                                                                                                                |
| `subgraph Handle click events`, a line break, `A` (in mermaid, the title `Handle eventsA`)                                                                                                                     | A syntax error, so no rule applies: `click` is a reserved word that may only begin a click statement                                                                                                                                                                                                                                                                                                                                            |
| `A-->""B` (an empty string)                                                                                                                                                                                    | A syntax error, so no rule applies: an empty string is not accepted                                                                                                                                                                                                                                                                                                                                                                             |
| `accDescr {`, `%% old description`, `}` (the description lines commented out)                                                                                                                                  | Matches an intended way of writing: the author means the block to do nothing, and mermaid reads it so (the earlier description stays)                                                                                                                                                                                                                                                                                                           |
| `subgraph Front end`, a line break, `A`, a line break, `end` (`A` goes into the name, no members)                                                                                                              | Looks like a mermaid bug: an ordinary name is written correctly, and the word `end` at its end takes the line break after it. Facts: the flowchart docs warn about a lowercase `end` at the top of the page, and [#1444](https://github.com/mermaid-js/mermaid/issues/1444) (closed; Type: Enhancement) calls it a limitation of the markup                                                                                                     |
| `box red-team` (the box is red, and its name is `-team`)                                                                                                                                                       | Looks like a mermaid bug: the docs allow a name without a colour, and the name is split at the `-`                                                                                                                                                                                                                                                                                                                                              |
| `link A: Dash@https://x.example` (the label is `Das`)                                                                                                                                                          | Looks like a mermaid bug: one missing space drops the last character of the label. Fact: the docs show the form `<label> @ <url>` only                                                                                                                                                                                                                                                                                                          |
| `subgraph a ` (whitespace at the end of the line makes the id subGraph0)                                                                                                                                       | Looks like a mermaid bug: invisible whitespace at the end of the line changes the id. Fact: its maintainers approved it as a bug in [#3252](https://github.com/mermaid-js/mermaid/issues/3252) (closed; Type: Bug / Error, Status: Approved, P1), and it still happens in 12.0.0                                                                                                                                                                |
| `class 1A:::c` (a name that starts with a digit), `style C fill:red` before `class C`, `classDef fo` applied to the CSS class `foo`                                                                            | Outside the scope of this toolkit: whether a CSS class or a style is applied shows only in the drawn diagram, and this toolkit does not draw. Not judged as a mermaid bug, and not reported to mermaid                                                                                                                                                                                                                                          |
| `` class `a~b` `` (id `a` with the type `b`, drawn as `a<b>`)                                                                                                                                                  | A mermaid bug by its docs: backquotes escape special characters ([syntax/classDiagram.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L161-L168)), but `~` inside them still starts a generic type. Rare in ordinary writing                                                                                                                           |
| `note for A~T~ "x"` after `class A~T~` (a note for a class written with its generic type)                                                                                                                      | Looks like a mermaid bug: the note keeps the name `A~T~`, the class is `A`, and the note is drawn without its line. `note for A "x"` finds the class                                                                                                                                                                                                                                                                                            |
| `+foo(a(b)) int` (in the Db, the method name `foo(a` and the parameters `b)`)                                                                                                                                  | Nothing the user sees: the drawn diagram shows `+foo(a(b)) : int`                                                                                                                                                                                                                                                                                                                                                                               |
| `A x-->B`, `A o-- t -->B` (a start marker different from the end marker)                                                                                                                                       | A mermaid bug, already recognized: mermaid-js/mermaid#1665 (open, approved) says that arrows with different markers at their ends do not work. `A x-->B` is a longer plain arrow, and `A o-- t -->B` is drawn as a plain arrow                                                                                                                                                                                                                  |
| `A x-- t x--x B` (the start marker on both the opening and the closing arrow)                                                                                                                                  | Comes from not knowing the syntax. The specification says the edge is `INVALID` (drawn as a plain arrow); `A x-- t --x B` is the way to write it                                                                                                                                                                                                                                                                                                |
| `style e1 fill:red` with the id `e1` of a link                                                                                                                                                                 | Comes from not knowing the syntax: `style` applies to vertices and subgraphs, and mermaid.js does nothing with it; a link takes a style from `linkStyle` or a class                                                                                                                                                                                                                                                                             |
| `class A foo` or `click A …` before the vertex `A` is written                                                                                                                                                  | Looks like a mermaid bug: the id is written correctly, and mermaid.js does nothing with it only because of where the statement stands (`style` before the vertex works). Searched with "class before node", "class statement order node", "classes not applied node defined after": no issue found                                                                                                                                              |
| In a state diagram, `A,B --> C` or `A,B:::e --> C` (states listed with `,` in a transition)                                                                                                                    | Comes from not knowing the syntax: the documentation lists states with `,` only in the `class` statement, and a transition takes one state; mermaid.js draws one state `A,B`. `A,:::e` is no form that a person drawing a diagram writes, and a stray `,` in `A, --> B` is no ordinary slip                                                                                                                                                     |
| In a state diagram, `[*]` outside a transition (`state [*] {`, `state "Begin" as [*]`, `note right of [*] : done`)                                                                                             | `state [*] {` is not written. `state "Begin" as [*]` comes from not knowing the syntax: the documentation defines `[*]` in transitions only. `note left of [*] : start here` attaches to the start state as meant, and a note meant for the end state also attaches to the start state, which looks like a defect of mermaid.js; searching issues and pull requests (`note "[*]"`, `"start state"`, `"end state"`, `pseudostate`) found nothing |
| In a state diagram, `state {` on the line after `state "d" as A` (the block becomes the body of A)                                                                                                             | A `state {` without a name is rejected everywhere else (at the start, after a transition, after an empty line); writing it comes from not knowing the syntax, or is a forgotten name, which is no ordinary slip                                                                                                                                                                                                                                 |
| In a state diagram, `classDef a` without styles on the line before `B --> C` (the next line becomes its style, and the transition is lost)                                                                     | The formatter makes it visible: it prints `classDef a B --> C` on one line                                                                                                                                                                                                                                                                                                                                                                      |
| In an ER diagram, `class A a b` (the classes written with a space, so `b` becomes an entity)                                                                                                                   | The formatter makes it visible: it prints `class A a` and `b` on separate lines                                                                                                                                                                                                                                                                                                                                                                 |
| In an ER diagram, `classDef a fill:red stroke:blue` (one style `fill:redstroke:blue`)                                                                                                                          | Comes from not knowing the syntax: the grammar separates styles with `,`, as for `style A fill:red;stroke:blue` in a flowchart                                                                                                                                                                                                                                                                                                                  |
| In a Gantt chart, `a : 2024-01-01, 1d %% note` (the end of the task becomes `1d %% note`, and the bar has no length)                                                                                           | Comes from not knowing the syntax: the documentation of mermaid.js says that comments go on a line of their own, as for `subgraph S %% group` in a flowchart. Fact: authors do write comments at the end of a line ([#5934](https://github.com/mermaid-js/mermaid/issues/5934), open)                                                                                                                                                           |
| In a Gantt chart, two tasks on one line, `a : 2024-01-01, 1d b : 2d` (the end of `a` becomes `1d b : 2d`, and there is no task `b`)                                                                            | Not something a person drawing a chart writes: it comes from deleting a line break. A condition on a `:` in the data would also match a time of day, as in `2024-01-01 10:00`                                                                                                                                                                                                                                                                   |
| In a Gantt chart, an `accDescr {` block that a `}` written later in a text closes (after `accDescr { first`, the line `title Plan {v2}` gives the description `first` and `title Plan {v2`, and no title)      | No ordinary writing: a gantt statement holds a `}` only in a text, which is rare, and without a later `}` mermaid.js rejects the unclosed block                                                                                                                                                                                                                                                                                                 |
| In a user journey, the task `Title page: 5: Me` (the title becomes `page: 5: Me`, and there is no task)                                                                                                        | Looks like a mermaid bug: the author writes a correct task, and the keyword `title`, read in any case, takes its line. Searched the issue titles with `journey` and with "journey title", "journey task", "journey keyword": nothing found. After an earlier title, journey-no-duplicate-title reports the line                                                                                                                                 |
| In a user journey, `title` with no text before the line `Make tea: 5: Me` (the title becomes that line, and there is no task)                                                                                  | The formatter makes it visible: it prints `title   Make tea: 5: Me` on one line                                                                                                                                                                                                                                                                                                                                                                 |
| In a requirement diagram, `id: 1 %% note` in a body (the id becomes `1 %% note`)                                                                                                                               | Comes from not knowing the syntax: the documentation of mermaid.js says that comments go on a line of their own, as for `subgraph S %% group` in a flowchart                                                                                                                                                                                                                                                                                    |

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
- Existing rules: `packages/eslint-plugin/docs/rules/`. Do not propose the same
  rule again.
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
- Each claim of a condition or a suggestion is checked with an input for each
  case that the claim distinguishes, and for each other rule that meets it at
  the place it names (a directive, an ignored `;`, a comment line, an empty
  line, a line separator, an empty description block), as Running tests in the
  conventions SKILL says. The inputs are chosen from these cases; none is
  generated.
- Before the table of the cases of a rule is shown, check it against the kinds
  of case that reviews of earlier tables found missing. Add a row for each kind
  that a sentence of the document touches, and run it through mermaid.js before
  the sentence states it:
  - a statement that takes its value from a later line, with an empty line, a
    comment line, or a directive between them (a second `accTitle:` that takes
    the line after `%% c` or after `%%{init: {}}%%`);
  - a word that a sentence says is read in any case, written in another case
    (`TITLE`, `Until`), and written without the whitespace after it (`untilb1`);
  - for a rule that compares a statement with earlier ones, first decide from
    what mermaid.js keeps and drops which earlier one it is compared with (the
    first, the first of its kind, or the latest), then write three occurrences
    that mix the kinds and the forms that the rule tells apart, so that the
    first statement and the right partner of the third differ (a requirement, an
    element, and a requirement of one name, where the third is compared with the
    second; for a rule that compares with the latest, any third, with a value
    that the rule does not count, such as an empty block, between), and check
    that the message names that partner; the plain third of one form gives two
    reports;
  - each kind of value that a rule does not count (an empty block, a block of
    only a comment line, a block of only directives);
  - an input where the rule meets a neighbouring rule (`A: 5:: x` in a user
    journey, an empty person and ignored text);
  - empty items in a row and a list of separators only (`a,,b`, `,`);
  - the counterpart of each form (`until` beside `after`, the end beside the
    start);
  - a character that ends a value that mermaid.js reads (`.`, a tab, a letter
    outside ASCII), and line ends written as CRLF;
  - data that mermaid.js does not read at all (four items of gantt data), where
    no rule reports.
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

The condition is the last item of "Policies and criteria" in section 2. Even
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

- The name of the rule (`<diagram>-<name>`, or `<name>` for a common rule; its
  id is the name after `@mmd-toolkit/`), and whether it is common or belongs to
  a diagram type.
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
- Whether the `recommended` configuration enables it, and why, decided by
  section 7.
- Its suggestions, or why it has none, decided by section 8.
- Its options, and an option considered for later with the condition under which
  it would be added, recorded in the table below. The rule document's Options
  section says only what the rule has now; an option considered for later is not
  written there.

Show what was decided to be dropped as well, with the name and the item of
"Policies and criteria" in section 2 under which it was dropped.

When writing a rule document shows a new candidate, a needed change of scope or
name, or that the tree cannot show something, decide it again with the same
criteria and show the result in the same form.

Decisions about options (made on 2026-10-07):

| Rule                                                                      | Options | Considered for later                                                                                                        |
| ------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| flowchart-no-empty-description-block, sequence-no-empty-description-block | None    | Also reporting a block that holds only comments, which the rule does not report: added only if users of the rule ask for it |
| Every other rule                                                          | None    | None                                                                                                                        |

## 7. Whether `recommended` enables a rule

Once a rule is kept, decide whether the `recommended` configuration enables it.
As is usual for ESLint plugins, `recommended` is the set of rules that nearly
every user wants on: rules whose reports are nearly always mistakes to fix.
Every rule of this plugin reports such a mistake (the first item of "Policies
and criteria" in section 2), so a rule is enabled unless it fails one of these
four criteria:

1. **Every report is a fact.** At every place the rule reports, mermaid.js reads
   the text differently from what the author meant: it drops the text, reads it
   as something else, rejects it, or replaces an earlier value. A rule that also
   reports places that mermaid.js reads as the author meant is not enabled.
2. **No intended way of writing is reported.** No form that an author writes on
   purpose matches the condition. A kept rule normally meets this, since it is
   also a criterion for keeping a rule; a rule for which a doubt about it
   remains is not enabled.
3. **The reports do not rest on behavior of mermaid.js that is expected to
   change.** A rule is not enabled when a pull request that fixes the behavior
   it relies on is open, or when the maintainers of mermaid.js say they will fix
   it: once mermaid.js changes, users of the new version would get reports that
   are no longer facts.
4. **The fix is clear.** An author who gets a report knows what to write
   instead.

Behavior that looks like a defect of mermaid.js and is reported together with
the mistake, because it lies in the same node, does not keep a rule out (the
text `direction LR` inside a label, which flowchart-no-ignored-text reports
together with the text on a direction line). mermaid.js drops that text too, so
the report is a fact (criterion 1), and the author avoids it by rewriting the
text (criterion 4); the rule is just not kept for it.

The decision is recorded in the table below, with the reason for a rule that is
not enabled or not enabled yet. The rule file keeps `recommended: false` until
the rule is implemented; the implementation sets it from this table. A decision
for a diagram type whose rules are not implemented yet is provisional: it is
made again, with the same criteria, when the rules of that diagram type are
implemented.

Decisions (made on 2026-10-02, with mermaid 12.0.0):

| Rule                                    | Enabled           | Reason when not enabled                                                                                  |
| --------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| flowchart-no-ignored-text               | yes               |                                                                                                          |
| flowchart-no-bare-comment-marker        | no                | Criterion 3: [#7008](https://github.com/mermaid-js/mermaid/pull/7008) (open) reads the line as a comment |
| flowchart-no-unclosed-description-block | yes               |                                                                                                          |
| flowchart-no-empty-description-block    | yes               |                                                                                                          |
| flowchart-no-duplicate-description      | yes               |                                                                                                          |
| flowchart-no-duplicate-title            | yes               |                                                                                                          |
| flowchart-no-redefined-vertex           | yes               |                                                                                                          |
| flowchart-no-undef                      | yes               |                                                                                                          |
| no-unclosed-directive                   | yes (provisional) |                                                                                                          |
| no-ignored-init-directive               | yes (provisional) |                                                                                                          |
| sequence-* (all 8 rules)                | yes (provisional) |                                                                                                          |
| class-no-inline-comment                 | no (provisional)  | Criteria 1 and 3, below                                                                                  |
| class-* (the other 7 rules)             | yes (provisional) |                                                                                                          |
| state-* (all 6 rules)                   | yes (provisional) |                                                                                                          |
| er-* (all 7 rules)                      | yes (provisional) |                                                                                                          |
| gantt-* (all 8 rules)                   | yes (provisional) |                                                                                                          |
| journey-* (all 6 rules)                 | yes (provisional) |                                                                                                          |
| requirement-* (all 8 rules)             | yes (provisional) |                                                                                                          |

class-no-inline-comment: when a line of only whitespace follows the comment and
no comment line follows that line, mermaid.js reads the next line apart, as the
author meant, and the rule reports the comment there too (criterion 1). Whether
mermaid.js will change is not settled: a reply in
[#1646](https://github.com/mermaid-js/mermaid/issues/1646) (closed) says a
comment at the end of a line should be supported, and
[#6401](https://github.com/mermaid-js/mermaid/issues/6401) treats the behavior
as intended (criterion 3).

## 8. Suggestions

Once a rule is kept, decide whether it offers suggestions (edits that are
applied only when the user picks one in the editor), and what they are. A
candidate edit becomes a suggestion only when it meets all five criteria below;
where no candidate meets them, the rule offers none.

1. **The candidates are few, and the reported text decides them (one to
   three).** What an edit writes is decided by the positions of the tree and its
   tokens, and the values of its nodes. An edit that needs a new name (a
   mistyped id changed into another id, a reused id changed into a new one) is
   no candidate: the text does not tell which name was meant.
2. **Every candidate is something the author may have meant.** The result is one
   of the forms that an author who made the mistake meant to write. An edit that
   only silences the rule, whatever the author meant, is no candidate.
3. **The parser accepts the result, the rule no longer reports that place, and
   the edit writes no new mistake.** Closing an unclosed block while it is empty
   is no candidate: the edit writes an empty block, which
   no-empty-description-block reports. Another rule may report the result only
   for a mistake that the text of the author already held and the edit makes
   visible: closing an unclosed block after an earlier description shows that
   the text sets the description twice, which no-duplicate-description reports.
   The tests of a rule list the rules whose reports its suggestions may make
   visible in this way, each with the mistake it shows, and fail on a report of
   any other rule on a result. The rule document says it in a sentence.
4. **The message of the suggestion can say how mermaid.js reads the result.**
   That reading is checked by running an example through mermaid.js (run).
5. **The result does not hang on invisible whitespace.** An edit that changes
   the reading only through whitespace at the end of a line (a space after `%%`)
   is no candidate: an editor that removes such whitespace on saving undoes it.

No rule fixes automatically: the meaning may change, or what the author meant is
not known, and every rule decided so far is in one of these cases. A fix is made
only when the result is beyond doubt what the author meant and mermaid.js then
reads it as meant.

A rule document describes the suggestions in Rule Details, before the examples:
for each suggestion, what it changes and how mermaid.js reads the text after it,
and in one sentence where the rule offers none and why. The notice says that the
rule has suggestions; it is generated.

Decisions (made on 2026-10-02, with mermaid 12.0.0):

| Rule                                    | Suggestions                                                    |
| --------------------------------------- | -------------------------------------------------------------- |
| flowchart-no-unclosed-description-block | Close at the end of this line; close at the end of the text    |
| flowchart-no-empty-description-block    | Remove the empty block                                         |
| flowchart-no-duplicate-description      | Remove this description; remove the description before it      |
| flowchart-no-duplicate-title            | Remove this title; remove the title before it                  |
| flowchart-no-ignored-text               | Split at the `;` so that the direction is on a line of its own |
| flowchart-no-bare-comment-marker        | Remove the `%%` (in a text that spans lines, the line of `%%`) |
| flowchart-no-redefined-vertex           | None: criterion 1 (the likely fix is a new id)                 |
| flowchart-no-undef                      | None: criterion 1 (which id was meant is not known)            |
| sequence-* (all 8 rules)                | None for now (2026-10-08; see the end of this section)         |
| class-* (all 8 rules)                   | None for now (2026-10-08; see the end of this section)         |
| state-* (all 6 rules)                   | None for now (2026-10-08; see the end of this section)         |
| er-* (all 7 rules)                      | None for now (2026-10-14; see the end of this section)         |
| gantt-* (all 8 rules)                   | None for now (2026-10-14; see the end of this section)         |
| journey-* (all 6 rules)                 | None for now (2026-10-14; see the end of this section)         |
| requirement-* (all 8 rules)             | None for now (2026-10-15; see the end of this section)         |

- Close at the end of this line: ` }` at the end of the line of the `{`, only
  when text that is not whitespace follows the `{` on that line. Close at the
  end of the text: a line `}` after the last line, only when the block has text
  on a line after the line of the `{` (with text only on that line, both edits
  give the same result). A directive is not text: there is no closing at the end
  of the line when only directives follow the `{` on its line (the block would
  be empty). A block that holds a directive that is not closed gets neither:
  from that directive on, the directive decides what mermaid.js reads, wherever
  the block is closed, so no message can say how the lines after it are read,
  and some results are rejected (run: after `accDescr { d }`, the lines
  `more %%{init: {}` and `A --> B` give the vertex `more` and no edge; with
  `%%{wrap`, they give `more` and `B`; closing right before `%%{wrap` with a
  line after it is rejected; closing at the end of the text a block with `d`,
  then `more %%{wrap` and `A --> B`, gives the description `d` and
  `more --> B`). `accDescr { Short`, then `A --> B`: closed at the end of the
  line, the description is `Short` and the edge from A to B is read; a block
  left open at the end of the text, with the lines `Long` and `text`, closed at
  the end of the text, has those two lines as its description (run). May make
  visible: no-duplicate-description, when a description is set before the block
  (`accDescr: d`, then `accDescr { x` closed, gives `x`; run) or by a statement
  after it (`accDescr { x`, then `accDescr { y }`, closed at the end of the
  line, gives `y`; run); so the message of the closing at the end of the line
  says that mermaid.js reads the rest of the line as the text of the block, not
  as the description. A `}` is alone on its line when only whitespace and
  directives stand before it there, whatever follows it (`};`, `} C`; run).
  Closing at the end of the line is offered only when the parser reads the
  result: a later line that is no statement, as `second line, more`, is rejected
  once the block is closed above it (run). A block that a later `}` closes is
  reported too: after `accDescr { first`, the lines `B --> C`, `A{y}`, and `D`
  give the description `first`, `B --> C`, `A{y` and only the vertex `D`,
  because the `}` of `A{y}` closes the block (run); the condition is that the
  text of the block holds a `{` on a later line than the `{` of the block and
  the closing `}` does not stand alone on its line (`accDescr {`, `uses { here`,
  `}` closes with the author's `}`; run), so that the `}` that closes the block
  is the one of a shape or data block on that line, also one that spans lines
  (`B{`, then `y}`; run); a `}` on the line of the `{` (`accDescr { a { b }`
  gives `a { b`) and a `}` alone on its line (`accDescr { x {`, then `}`, gives
  `x {`) close the block as written and are not reported (run). Such a block
  gets only the closing at the end of the line of the `{` (`accDescr { first }`,
  then the same lines, reads the edge from B to C and the vertices A and D;
  run).
- Remove: the statement, with its line when nothing else is on the line, or with
  the whitespace up to the next statement on the same line. A `;` after it that
  separates statements is never removed: inside a subgraph, a `;` that stands
  alone is an empty statement, which mermaid.js makes a member `;` of the
  subgraph, so removing it changes the members (run: 40 of 148 removals of a
  duplicate description inside a subgraph or a nested one changed the Db with
  the `;` removed, 0 with it kept; a line of only `;` or `;;B` left behind reads
  as before). A `;` that mermaid.js ignores at the end of the text, as in
  `accTitle: style:#b;`, is removed with the statement: kept alone, it would
  become a member `;` (run: the members `a`, `;` instead of `a`). Removing an
  empty block leaves the Db as it is (run); a block that holds a directive is
  not removed, because the directive's settings would go with it (run: a
  subgraph loses the direction that `inheritDir` gave it). For the duplicates,
  mermaid.js uses the last description or title that remains (run); a
  description inside a subgraph is also a member of the subgraph in the Db, so
  removing it changes the members as well (run). An empty block is removed only
  when it is the first token on its line: after something on its line, removing
  the whitespace before it changes the reading of some statements and keeping it
  changes others (`autonumber ` in a sequence; a subgraph name that ends in a
  space), which the tree does not tell (run: of 49,671 blocks first on their
  line, inserted into the accepted fixtures of the four diagram types, 19 read
  differently after removal, all in forms obscure on purpose: a keyword whose
  value continues on the next line, a subgraph name that ends in `end`, and a
  statement whose reading depends on its column).
- Split at the `;`: offered only when every ignored text on the line is
  separated from the direction by a `;` (the text before it ends with `;`, the
  text after it starts with `;`); the whitespace after each such `;` becomes a
  line break, of the kind that the text uses there (the one that ends the line,
  or, on a last line without one, the one that ends the line before it), and the
  indentation of the line, and the `;` stays, as if the author had broken the
  line after it (removing the `;` can change how mermaid.js reads the line:
  `A[style:#x;];` and `A[style:#x;]` give `A` different labels; run), except
  where the parse of the result does not read the kept `;` as a separator but as
  part of a text, as after `accTitle: What to buy`, whose text runs to the end
  of the line, or after the direction value, where the rest of the line is
  dropped, or where a kept `;` would stand alone as a statement, as after a
  description block (`accDescr { x }; direction TB` in a subgraph, split with
  the `;`, gives the members `x` and `;`; run): there all the `;`s on the line
  are removed with the whitespace (the title is then `What to buy`, not
  `What to buy;`; run); and only when the parser reads the result with the split
  text as statements, the direction as a direction statement, and nothing
  reported on the line (inside a label, `A[x; direction LR; y]`, split, gives a
  label of three lines and no direction; run), because the text before or after
  the `;` may be no statement on its own (`direction TB; -->B`, split, is
  rejected; run). `A --> B; direction TB` in a subgraph, split, gives the edge
  and the direction (run). Without the `;`, whether the text was meant as
  statements is not known, and inside a label (`A[Set direction LR]-->B`) a line
  break changes the label (run). May make visible: any other rule, because the
  text becomes statements, and what they hold is what the author wrote
  (`accTitle: a`, then `accTitle: t; direction LR` in a subgraph, split, gives
  the title `t`, which no-duplicate-title reports; run).
- Remove the `%%`: the `Identifier` token, with its line when only whitespace
  remains; a directive on the line stays. Only where the vertex `%%` is the
  whole statement (`%%` then `A`, `A;` then `%%`, a line in a subgraph): there
  the result is the same diagram without the vertex (run). At the end of a link
  no suggestion is offered (criteria 3 and 4): `A -->` then `%%`, and `%%` then
  `  --> B`, are rejected without it, and `A -->`, `%%`, `  B` gets the link
  from A to B instead of to `%%` (run). In a text that spans lines (a label, a
  description, a title, a string, a data block, and the name or the arguments of
  the function that a `click` statement calls), the line of only `%%` with its
  line break, except where a directive, or its start or its end, is on that
  line: the line would take the directive with it, and the rest of a directive
  that spans lines is then not closed, which mermaid.js rejects (run). Each
  suggestion removes only the line of its own report, and its message speaks of
  that line only: where a value holds several lines of only `%%`, removing one
  leaves the others, so the vertex `%%` stays, a label keeps the other lines,
  and a data block that they make invalid is still rejected until every line is
  removed (run). The line is removed only when its value (the text, the name, or
  the data block) holds something besides lines of only `%%` and whitespace;
  otherwise the line is all of the value, and removing it gives nothing the
  author wrote (criteria 2 and 3): after `accTitle:`, `accDescr:`, or `click A`,
  whose value is the next line (the only statements of a flowchart that take
  their value from the next line; run), mermaid.js takes the line after it as
  the value (`accTitle:`, `%%`, `A` gets the title `A` and no vertex `A`;
  `click A`, `%%`, `cb` gets the name `cb` and no vertex `cb`; `click A`, `%%`
  at the end of the text is rejected), and a data block of only such lines is
  left empty, which mermaid.js rejects (run). In `click A call c`, `%%`, `b()`
  the name holds `c` and `b` too, and the suggestion stays. Not reported: a line
  in a description block that is not closed (the description is empty). The name
  and the arguments were checked by recording what mermaid.js passes to
  `setClickEvent`: `click A call c`, `%%`, `b()` gives the name `c`, `%%`, `b`
  on three lines, and `call f(1,`, `%%`, `2)` gives the arguments `1,`, `%%`,
  `2` (run).

`sequence-*`, `class-*`, and `state-*` (2026-10-08), and `er-*`, `gantt-*`, and
`journey-*` (2026-10-14), and `requirement-*` (2026-10-15): the rules are
implemented without suggestions for now. No suggestion had been decided for them
or described in their documents, and the one planned for the empty block of a
sequence diagram rested on generated inputs. Whether they get suggestions is
decided later, in the form of the flowchart rules, with a fixture for each case.

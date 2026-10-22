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
- For each case that a rule reports, the output of mermaid.js loses, replaces,
  leaves without effect, or adds something, and the case names it: which value
  or which text. An earlier `accTitle` replaced, text on a direction line
  dropped, a closer that has no effect on the shape, and a state that no
  statement writes are such facts. A value outside the range or the words that
  the documentation of mermaid.js defines, as a score above 5 or an unknown word
  of `excludes`, has no effect, and that documentation is the ground. Writing
  that mermaid.js reads by its grammar, with nothing lost, is no rule, also when
  the author probably meant another syntax: `Write ::icon(fa fa-book)` on the
  line of a node is the node `Write ::icon` with the label `fa fa-book`, as
  `X(Foo)` shows `Foo` and not `X`.
- The package holds no rule of these kinds:
  - A stylistic rule: mermaid.js reads the text as written, and only a later
    edit would break it.
  - A rule for text that is obscure on purpose.
  - A rule for a defect of mermaid.js: the author writes something correct and
    meaningful and mermaid.js misreads it (`subgraph Front end`, CSS in a
    label). The author has nothing to fix, and a rule could only tell how to
    avoid the defect; the rule would rest on a defect of the implementation, not
    on the definition of the language, so users of a version with the defect
    fixed would keep getting reports that call correct text a mistake; and the
    place to fix it is a report to mermaid.js, which a lint rule that absorbs it
    leaves undone. Whether such a thing is reported to mermaid.js is a separate
    question, which the user decides. A case is such a defect only where the
    author has nothing to fix: the text is written as the documentation of
    mermaid.js shows, and no other way of writing avoids the loss (a URL with a
    fragment in `links`). Where the documentation shows a form that loses
    nothing, the case stays a mistake (`note left of A:hi`, which the
    documentation writes with a space after the `:`). Such a defect is left out
    of the condition of a kept rule where the tree tells it apart from the
    mistake; where the tree does not, it stays reported with the mistake, as
    section 7 says (the text `direction LR` inside a label).
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
| `%%{init: {...}}` (the closing `%%` forgotten)                                                       | The directive runs to the end of the text, and the diagram is empty     | no-unclosed-directive (common)                                                                                                                              |
| `%%{init: {"flowchart": {"inheritDir": true},}}%%` (a trailing comma)                                | All init configuration is dropped                                       | no-invalid-init-directive (common)                                                                                                                          |
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

| Input                                                                                                                                                                                                          | Why it was dropped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A[ ]`, `style A fill:#f00, `, `click-->B`, `A[ /x/]`, `hasOwnProperty` as the last member                                                                                                                     | Stylistic. mermaid reads them as written, and only a later edit breaks them (`A[ ]` and `A[" "]` are the same empty label)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `A%%{init: {}}%%B-->C`, `A[style:#x;]`                                                                                                                                                                         | Happens only in text that is obscure on purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `A&B-->C`                                                                                                                                                                                                      | Cannot be told from an intended way of writing. `R&D-->X` is also the vertex `R&D`, the same form as an id with `&` written on purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `A[Issue #123; fixed]` (becomes `{`)                                                                                                                                                                           | Cannot be told from an intended way of writing. Numeric entities (`#9829;`) are a documented way of writing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `A"Start"-->B` (the `[ ]` forgotten)                                                                                                                                                                           | Comes from not knowing the syntax. Enclosing a label in `[ ]` is defined by the grammar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `style A fill:red;stroke:blue`                                                                                                                                                                                 | Comes from not knowing the syntax. The grammar defines `,` as the separator of styles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `direction LR` outside a subgraph                                                                                                                                                                              | Comes from not knowing the syntax. The specification says it changes nothing outside a subgraph                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `subgraph S %% group`, `accTitle: T %% note`                                                                                                                                                                   | Comes from not knowing the syntax. The specification says a `%%` in the middle of a line is no comment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `%%{config: ...}%%`                                                                                                                                                                                            | Comes from not knowing the syntax. `config` is a key of the frontmatter, not the name of a directive                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `A---orders` (the arrow `---o` and the vertex `rders`)                                                                                                                                                         | The formatter makes it visible: it prints `A ---o rders`. A rule would be a second thing to maintain beside the formatter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `A-->B` on the line after an `accTitle:` left empty (the title becomes `A-->B`)                                                                                                                                | The formatter makes it visible: it indents `A-->B` as the continuation of `accTitle:`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `A[<span style='color:#f00;font-weight:bold'>x</span>]` (the `;` after the `#` colour is removed, giving `color:#f00font-weight:bold`; the rewriting meant for `style` lines also hits the `style=` attribute) | Looks like a mermaid bug: mermaid's rewriting breaks correct CSS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `subgraph Handle click events`, a line break, `A` (in mermaid, the title `Handle eventsA`)                                                                                                                     | A syntax error, so no rule applies: `click` is a reserved word that may only begin a click statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `A-->""B` (an empty string)                                                                                                                                                                                    | A syntax error, so no rule applies: an empty string is not accepted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `accDescr {`, `%% old description`, `}` (the description lines commented out)                                                                                                                                  | Matches an intended way of writing: the author means the block to do nothing, and mermaid reads it so (the earlier description stays)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `subgraph Front end`, a line break, `A`, a line break, `end` (`A` goes into the name, no members)                                                                                                              | Looks like a mermaid bug: an ordinary name is written correctly, and the word `end` at its end takes the line break after it. Facts: the flowchart docs warn about a lowercase `end` at the top of the page, and [#1444](https://github.com/mermaid-js/mermaid/issues/1444) (closed; Type: Enhancement) calls it a limitation of the markup                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `box red-team` (the box is red, and its name is `-team`)                                                                                                                                                       | Looks like a mermaid bug: the docs allow a name without a colour, and the name is split at the `-`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `link A: Dash@https://x.example` (the label is `Das`)                                                                                                                                                          | Looks like a mermaid bug: one missing space drops the last character of the label. Fact: the docs show the form `<label> @ <url>` only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `subgraph a ` (whitespace at the end of the line makes the id subGraph0)                                                                                                                                       | Looks like a mermaid bug: invisible whitespace at the end of the line changes the id. Fact: its maintainers approved it as a bug in [#3252](https://github.com/mermaid-js/mermaid/issues/3252) (closed; Type: Bug / Error, Status: Approved, P1), and it still happens in 12.0.0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `class 1A:::c` (a name that starts with a digit), `style C fill:red` before `class C`, `classDef fo` applied to the CSS class `foo`                                                                            | Outside the scope of this toolkit: whether a CSS class or a style is applied shows only in the drawn diagram, and this toolkit does not draw. Not judged as a mermaid bug, and not reported to mermaid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `` class `a~b` `` (id `a` with the type `b`, drawn as `a<b>`)                                                                                                                                                  | A mermaid bug by its docs: backquotes escape special characters ([syntax/classDiagram.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L161-L168)), but `~` inside them still starts a generic type. Rare in ordinary writing                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `note for A~T~ "x"` after `class A~T~` (a note for a class written with its generic type)                                                                                                                      | Looks like a mermaid bug: the note keeps the name `A~T~`, the class is `A`, and the note is drawn without its line. `note for A "x"` finds the class                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `+foo(a(b)) int` (in the Db, the method name `foo(a` and the parameters `b)`)                                                                                                                                  | Nothing the user sees: the drawn diagram shows `+foo(a(b)) : int`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `A x-->B`, `A o-- t -->B` (a start marker different from the end marker)                                                                                                                                       | A mermaid bug, already recognized: mermaid-js/mermaid#1665 (open, approved) says that arrows with different markers at their ends do not work. `A x-->B` is a longer plain arrow, and `A o-- t -->B` is drawn as a plain arrow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `A x-- t x--x B` (the start marker on both the opening and the closing arrow)                                                                                                                                  | Comes from not knowing the syntax. The specification says the edge is `INVALID` (drawn as a plain arrow); `A x-- t --x B` is the way to write it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `style e1 fill:red` with the id `e1` of a link                                                                                                                                                                 | Comes from not knowing the syntax: `style` applies to vertices and subgraphs, and mermaid.js does nothing with it; a link takes a style from `linkStyle` or a class                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `class A foo` or `click A …` before the vertex `A` is written                                                                                                                                                  | Looks like a mermaid bug: the id is written correctly, and mermaid.js does nothing with it only because of where the statement stands (`style` before the vertex works). Searched with "class before node", "class statement order node", "classes not applied node defined after": no issue found                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| In a state diagram, `A,B --> C` or `A,B:::e --> C` (states listed with `,` in a transition)                                                                                                                    | Comes from not knowing the syntax: the documentation lists states with `,` only in the `class` statement, and a transition takes one state; mermaid.js draws one state `A,B`. `A,:::e` is no form that a person drawing a diagram writes, and a stray `,` in `A, --> B` is no ordinary slip                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| In a state diagram, `[*]` outside a transition (`state [*] {`, `state "Begin" as [*]`, `note right of [*] : done`)                                                                                             | `state [*] {` is not written. `state "Begin" as [*]` comes from not knowing the syntax: the documentation defines `[*]` in transitions only. `note left of [*] : start here` attaches to the start state as meant, and a note meant for the end state also attaches to the start state, which looks like a defect of mermaid.js; searching issues and pull requests (`note "[*]"`, `"start state"`, `"end state"`, `pseudostate`) found nothing                                                                                                                                                                                                                                                                                                                                   |
| In a state diagram, `state {` on the line after `state "d" as A` (the block becomes the body of A)                                                                                                             | A `state {` without a name is rejected everywhere else (at the start, after a transition, after an empty line); writing it comes from not knowing the syntax, or is a forgotten name, which is no ordinary slip                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a state diagram, `classDef a` without styles on the line before `B --> C` (the next line becomes its style, and the transition is lost)                                                                     | The formatter makes it visible: it prints `classDef a B --> C` on one line                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| In an ER diagram, `class A a b` (the classes written with a space, so `b` becomes an entity)                                                                                                                   | The formatter makes it visible: it prints `class A a` and `b` on separate lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In an ER diagram, `classDef a fill:red stroke:blue` (one style `fill:redstroke:blue`)                                                                                                                          | Comes from not knowing the syntax: the grammar separates styles with `,`, as for `style A fill:red;stroke:blue` in a flowchart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| In a Gantt chart, `a : 2024-01-01, 1d %% note` (the end of the task becomes `1d %% note`, and the bar has no length)                                                                                           | Comes from not knowing the syntax: the documentation of mermaid.js says that comments go on a line of their own, as for `subgraph S %% group` in a flowchart. Fact: authors do write comments at the end of a line ([#5934](https://github.com/mermaid-js/mermaid/issues/5934), open)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| In a Gantt chart, two tasks on one line, `a : 2024-01-01, 1d b : 2d` (the end of `a` becomes `1d b : 2d`, and there is no task `b`)                                                                            | Not something a person drawing a chart writes: it comes from deleting a line break. A condition on a `:` in the data would also match a time of day, as in `2024-01-01 10:00`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| In a Gantt chart, an `accDescr {` block that a `}` written later in a text closes (after `accDescr { first`, the line `title Plan {v2}` gives the description `first` and `title Plan {v2`, and no title)      | No ordinary writing: a gantt statement holds a `}` only in a text, which is rare, and without a later `}` mermaid.js rejects the unclosed block                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a user journey, the task `Title page: 5: Me` (the title becomes `page: 5: Me`, and there is no task)                                                                                                        | Looks like a mermaid bug: the author writes a correct task, and the keyword `title`, read in any case, takes its line. Searched the issue titles with `journey` and with "journey title", "journey task", "journey keyword": nothing found. After an earlier title, journey-no-duplicate-title reports the line                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a user journey, `title` with no text before the line `Make tea: 5: Me` (the title becomes that line, and there is no task)                                                                                  | The formatter makes it visible: it prints `title   Make tea: 5: Me` on one line                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a requirement diagram, `id: 1 %% note` in a body (the id becomes `1 %% note`)                                                                                                                               | Comes from not knowing the syntax: the documentation of mermaid.js says that comments go on a line of their own, as for `subgraph S %% group` in a flowchart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| In a mindmap, an icon line less indented than the node written last before it (`root`, `  child`, then `::icon(x)` at the indentation of `root`; the icon goes to `child`)                                     | The formatter makes it visible: it prints the icon line at the indentation of `child`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| In a mindmap, a node indented between earlier levels (`root`, `    a`, `      b`, `     c`; `c` becomes a child of `a`)                                                                                        | The documentation of mermaid.js explains this reading under "Unclear indentation", and the indentation does not tell what the author meant: a rule would also report intended writing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| A line of only `%%` among lines commented out together (the vertex `%%`)                                                                                                                                       | mermaid.js draws the line, without an error, as a vertex with the id `%%`. Read as a comment that the flowchart documentation defines, "the text from the start of the comment to the next line break" ([syntax/flowchart.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1217-L1219)), the vertex is a defect of mermaid.js, for which no rule is kept, for the reasons above ([#7008](https://github.com/mermaid-js/mermaid/pull/7008) is open). Read as writing outside that documentation, `%%` gives the vertex `%%` by the grammar, with nothing lost, and calling it a mistake needs the guess that a comment was meant. On either reading, no fact shows a mistake without a guess |
| In a mindmap, `Write ::icon(fa fa-book)` or `Write:::urgent` on the line of a node                                                                                                                             | mermaid.js reads both by its grammar and loses nothing: the first is the node `Write ::icon` with the label `fa fa-book`, as `X(Foo)` shows `Foo` and not `X`, and the second is the label `Write:::urgent`. Calling either a mistake rests only on the guess that an icon or a class was meant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a timeline, `#` in a period (`Sprint #3 : planning`: the period `Sprint `, and the comment `#3 : planning`, so the event is lost)                                                                           | A defect of mermaid.js, for the reasons above: the timeline documentation of mermaid.js calls a period and an event "simple text", names no comment `#`, and shows no other way of writing that keeps it (the entity `#35;` appears in the flowchart documentation only). Fact: [#5356](https://github.com/mermaid-js/mermaid/issues/5356) (closed, Type: Bug / Error) reports that `#` starts a comment                                                                                                                                                                                                                                                                                                                                                                          |
| In a timeline, an event line after a section with no period of its own (`section B`, then `: y`; `y` goes to the last period of the section before)                                                            | mermaid.js reads it by its grammar and loses nothing; calling it a mistake needs the guess that the event was meant for section B. So for `section 2020 : a`, the section `2020 ` and an event of the period before                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| In a sankey diagram, two records of the same source and target (`a,b,1` and `a,b,2`)                                                                                                                           | The two links are both kept, and nothing is lost: calling the second a pasted copy is a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| In an XY chart, a text of several words without quotes (`title Two words`, `x-axis [New York, Paris]`; the spaces between the words are lost, as `Twowords`)                                                   | Comes from not knowing the syntax: the documentation of mermaid.js says that a text of several words is written in `"`, as for `subgraph S %% group` in a flowchart. The formatter prints the words as written                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| In an XY chart, a label on a bar (`bar [1 "a"]`) and an `x-axis` after the plots                                                                                                                               | The documentation of mermaid.js says that a label on a bar is accepted and ignored, so writing one comes from not knowing the syntax. An `x-axis` after the plots does not give them its categories, which [#5291](https://github.com/mermaid-js/mermaid/issues/5291) (open, approved) treats as a defect and [#7798](https://github.com/mermaid-js/mermaid/pull/7798) (open) fixes                                                                                                                                                                                                                                                                                                                                                                                               |
| In a quadrant chart, `quadrant-10 A` (the first quadrant, with the text `0 A`)                                                                                                                                 | Comes from not knowing the syntax: the documentation of mermaid.js names `quadrant-1` to `quadrant-4` only, and `quadrant-0` and `quadrant-5` are rejected. After an earlier `quadrant-1`, quadrant-no-redefined-quadrant reports the line                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| In a quadrant chart, an axis with an arrow and no second text (`x-axis Low -->`; the left text `Low ⟶`)                                                                                                        | mermaid.js reads it by its grammar and loses nothing: the arrow is drawn after the text. Calling it a forgotten second text is a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| In a quadrant chart, `stroke-color` without `stroke-width` (the border is drawn with the width `0px`)                                                                                                          | The documentation of mermaid.js calls the colour useless without a width, but its own examples write it so (`Point C`, `Campaign C`): a rule would report a way of writing that the documentation shows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| In a quadrant chart, a colour without `#` (`color: f00`, kept as written)                                                                                                                                      | Outside the scope of this toolkit, as for `classDef fo` above: whether the colour is drawn shows only in the drawn chart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| In a quadrant chart, two points of one name or one position, and a `classDef` that no point uses                                                                                                               | Nothing is lost: both points are kept, and the class is listed. Calling either a mistake is a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| In a quadrant chart, a statement after a `;` on the line of a title (`title Sales; x-axis Low --> High`; the title holds the rest of the line)                                                                 | Not something a person drawing a chart writes: a title is written on a line of its own, and the documentation of mermaid.js shows no `;`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| In a block diagram, a `class` statement whose class no `classDef` defines (`class A blue`)                                                                                                                     | Nothing is lost: the class stays on the block, and the drawing gives it to the block as a CSS class, which the styles of the page can use (read in `getNodeFromBlock()`). This differs from a quadrant chart, which draws no class name of a point                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| In a block diagram, `title` and other words of other diagrams (`title Sales` gives the blocks `title` and `Sales`)                                                                                             | mermaid.js reads them by its grammar as blocks and loses nothing; a block diagram has no title. Calling them a title is a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a block diagram, `%%` after a statement on its line (`A --> B %% note` gives the blocks `%%` and `note`)                                                                                                    | Comes from not knowing the syntax, as for `subgraph S %% group` in a flowchart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| In a block diagram, a `style` or `classDef` list that gives a property twice (`fill:#f00,fill:#00f`), and a `classDef` written twice                                                                           | mermaid.js keeps every style as written; which one the drawing uses is decided by CSS, which this toolkit does not draw                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| In a block diagram, `columns 1.5`, a width or a space of zero, and a width of more digits than a number holds                                                                                                  | `1.5` is the count 1 and a block `.5`, which the formatter prints on a line of its own; zero is kept as written; a number too large to hold is not ordinary writing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| In a block diagram, a correct CSS declaration in an HTML label that loses its `;`                                                                                                                              | A defect of mermaid.js, as for the same label in a flowchart above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| In a block diagram, `class A c` before the block `A` is declared (`A` is not placed, and the class goes to a block outside the diagram)                                                                        | Looks like a mermaid bug, as `class A foo` before the vertex `A` in a flowchart above: the id is written correctly, and only where the statement stands changes the result. Decided the same way as the flowchart, so that one diagram type is not judged apart (2026-10-21); block-no-undef does not report an id declared later                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In a kanban diagram, an icon (`::icon(x)` or `icon:` in the metadata), and an icon written twice                                                                                                               | Nothing is drawn: the drawing of a kanban item uses no icon (read in `kanbanItem.ts`), so neither an icon nor its replacement changes the output; the documentation of kanban names no icon                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| In a kanban diagram, `assigned`, `priority`, or `icon` in the metadata of a column, and a class (`:::c`) on a column or an item                                                                                | The Db keeps them and the board does not show them (run): a column with an owner is sensible writing, and the classes are a gap of mermaid.js with open fixes ([#8119](https://github.com/mermaid-js/mermaid/issues/8119), [#8139](https://github.com/mermaid-js/mermaid/pull/8139), [#8281](https://github.com/mermaid-js/mermaid/pull/8281))                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| In a kanban diagram, two items of one id, `title` or `accTitle:` as a node, and a shape with another closer (`a[A)`)                                                                                           | Two items of one id are both drawn, as the example of the documentation writes them; `title` is a node by the grammar ([#8120](https://github.com/mermaid-js/mermaid/issues/8120) asks for accessibility); every kanban item is drawn in one shape, so a closer changes nothing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a C4 diagram, a relationship to an alias that no element or boundary declares (`Rel(a, typo, "Uses")`)                                                                                                      | Not silent: drawing the diagram stops with an error that names the relationship (read in `drawRels`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| In a C4 diagram, a count of `UpdateLayoutConfig` that is zero, negative, or no number                                                                                                                          | Not something a person drawing a diagram writes: a number of shapes in a row is a positive number                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In a C4 diagram, `accTitle:`, which sets the visible title, and a relationship of one ordered pair written twice (the later one replaces the first)                                                            | Defects of mermaid.js with open fixes: [#8040](https://github.com/mermaid-js/mermaid/issues/8040) and [#8041](https://github.com/mermaid-js/mermaid/pull/8041), and [#8143](https://github.com/mermaid-js/mermaid/pull/8143)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| In a C4 diagram, the index of `RelIndex`, the sprite of a deployment node, a key that is not a known key in another case (`$colour`)                                                                           | The documentation says that the index is not read and that sprites are unfinished; mermaid.js keeps every named attribute, and some unlisted keys (`alias`, `from`, `to`) change what later statements match, so no list of valid keys stands                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| In a venn diagram, a text id used twice (`text A note[First]`, then `text A note[Second]`)                                                                                                                     | Both text nodes are drawn, and a `style` of the id styles both; calling the second a pasted copy is a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| In a venn diagram, an indented `text` meant for another set (`set A`, then `  text B[Backend]`)                                                                                                                | mermaid.js reads it by its grammar as the text node `B` of A and loses nothing; calling `B` a set is a guess                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| In a venn diagram, a size of zero or below, a size of more digits than a number holds, and a name repeated in a union (`union A, A`)                                                                           | Zero is an empty set, which the drawing leaves out; a negative or a too large size is not something a person drawing a diagram writes; the names of a union are kept as written                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In a venn diagram, a union of a name that no earlier `set` declares, a size that is no number, and `accTitle`, `accDescr`, or a description block                                                              | Not silent: mermaid.js rejects them                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| In a venn diagram, a diagram with no set or union                                                                                                                                                              | Not silent: drawing it fails ([#8471](https://github.com/mermaid-js/mermaid/pull/8471), open, makes it a clear error)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| In a venn diagram, a correct CSS declaration in an HTML label that loses its `;`                                                                                                                               | A defect of mermaid.js, as for the same label in a flowchart above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| In a venn diagram, a value with a unit and without quotes (`stroke-width:2px`, kept as `2 px`)                                                                                                                 | Comes from not knowing the syntax: the specification says that the parts of a value without quotes are joined with one space; in quotes, `"2px"` is kept as written                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| In a venn diagram, a style property other than `color` for a text node (`style A1 fill:red`, which the drawing does not use)                                                                                   | The documentation of mermaid.js applies the styles to text nodes without saying which properties a text node takes, so a rule would report a way of writing that the documentation shows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| In a venn diagram, `accTitle` and `accDescr` in the frontmatter, which set neither text                                                                                                                        | A rule would read the YAML of the frontmatter, which waits until after the release, as for kanban                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In an Ishikawa diagram, `title`, `accTitle:`, or `accDescr` written as a cause (the cause `title Delivery causes`; a `{` block gives the causes `accDescr {`, its lines, and `}`)                              | mermaid.js reads each line as a cause by its grammar and loses nothing; the documentation of the Ishikawa diagram shows no title, its first line being the event. The accessibility statements are written as the accessibility documentation of mermaid.js shows, which says that every diagram type supports them, and no other way keeps them (the frontmatter sets neither): a defect of mermaid.js. As for `title` and `accTitle:` in a kanban diagram                                                                                                                                                                                                                                                                                                                       |
| In an Ishikawa diagram, a cause less indented than the first cause, a cause more than one level deeper than the one before, and a tab among spaces (a tab counts as one character)                             | The formatter makes it visible: it prints each cause at the depth that mermaid.js gives it; the indentation does not tell what the author meant, as for the unclear indentation of a mindmap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| In an Ishikawa diagram, two causes of one text under one cause                                                                                                                                                 | Both are drawn, each with its own causes: nothing is lost, and calling the second a copy is a guess. This differs from two columns of one id in a kanban diagram, which list the same items twice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In an Ishikawa diagram, `A@{shape: rect}`, `[]`, `""`, and a `"` that no `"` closes                                                                                                                            | mermaid.js reads them as the text of a cause and loses nothing; calling them a shape, an empty cause, or a quoted text is a guess. `[]` stays text in mermaid.js 12.0.0 ([#7891](https://github.com/mermaid-js/mermaid/pull/7891), open, would make it a gap)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| In an Ishikawa diagram, `%%` after the text of a cause (`Process %% note` is the cause)                                                                                                                        | Comes from not knowing the syntax, as for `subgraph S %% group` in a flowchart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| In an Ishikawa diagram, the `;` lost at the end of a line that starts with `style` or `classDef` (the cause `style R fill:#abc`)                                                                               | A defect of mermaid.js, as for the same rewriting of CSS in a label in a flowchart above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| In an Ishikawa diagram, a directive inside the text of a cause, a second `ishikawa` header, and the header `ishikawa-betaX` (the event `-betaX`)                                                               | A directive inside a word is not ordinary writing, and one at the end of a line is a way of writing a setting; a second header is rejected; a header with a suffix is not ordinary writing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| In an Ishikawa diagram, `title`, `accTitle`, and `accDescr` in the frontmatter (the first line replaces the title, and the accessible texts stay empty)                                                        | A rule would read the YAML of the frontmatter, which waits until after the release, as for kanban                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In an agentflow, a flow, a connector, or a vertex written again without a title or a label                                                                                                                     | Nothing is lost: a flow written again adds its members to the flow of its id, and a reference keeps the label and the shape (run)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In an agentflow, a class that no `classDef` defines, a `classDef` written twice, and a property given twice in one                                                                                             | As in a flowchart and a block diagram above: the class may come from the styles of the page, and CSS decides which declaration the drawing uses                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| In an agentflow, a `linkStyle` index out of range or with a leading zero                                                                                                                                       | Not silent: mermaid.js rejects it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In an agentflow, a label on a reference link (`A -.-\|x\| B`), a `global` block written twice, metadata on the generated id of a link, and extra whitespace at the start of a style                            | mermaid.js keeps them, and nothing is lost (run)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| In an agentflow, a `direction` statement outside a flow                                                                                                                                                        | Comes from not knowing the syntax, as `direction LR` outside a subgraph in a flowchart above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| In an agentflow, a link to a flow or a connector that nothing declares, and a `connectorRef` that names none                                                                                                   | The link adds a vertex, as in a flowchart; the `connectorRef` is in the YAML of a data block, which waits until after the release, as for kanban                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| In an agentflow, `click` in the name of a flow or a connector (`flow Handle click events` loses `click` and takes the next line into the name)                                                                 | A defect of mermaid.js, as the reserved word `click` in the title of a subgraph in a flowchart above: the author writes a correct name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| In an agentflow, an empty string, an empty markdown string, or an empty call in a name or before the URL or the tooltip of `click` (`click A href """u"`)                                                      | They hold nothing, so nothing is lost: the name, the URL, and the tooltip are kept as written (run)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| In an agentflow, a flow and a connector of one id, and a flow and a vertex of one id                                                                                                                           | mermaid.js keeps both records (run); calling the second a mistake is a guess. A connector and a vertex of one id are one element, which agentflow-no-redefined-vertex and agentflow-no-redefined-connector check                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| In an agentflow, a bracket shape that agentflow removed or does not allow (`A((x))`, drawn as a rounded rectangle)                                                                                             | Not silent: mermaid.js gives the diagnostic `SHAPE_REMOVED` or `SHAPE_UNSUPPORTED`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| In an agentflow, a correct CSS declaration in an HTML label that loses its `;`, `direction` inside a correct label, and a comment line in an `accDescr` block (kept as its text)                               | Defects of mermaid.js, as in a flowchart above; agentflow-no-ignored-text reports the second, and agentflow-no-duplicate-description the third where it replaces a description, with the mistakes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| In an agentflow, the shape, the label, or other keys in the YAML of a data block                                                                                                                               | A rule would read the YAML, which waits until after the release, as for kanban                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

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
  - for such a rule, a statement that sets the value it replaces, also in
    another spelling that mermaid.js keeps as the same value (whitespace at the
    ends, a string and the same text, another case), which loses nothing and is
    not reported;
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

Each rule is judged on its own, against its document, case by case:

1. For criterion 1, each case that the document distinguishes is checked for a
   reported place that mermaid.js reads as the author meant, also the cases that
   the document itself names as reported although mermaid.js reads them as
   written.
2. For criterion 2, each case is checked with the question of section 2: the
   report says what the output loses, replaces, leaves without effect, or adds,
   with no guess about what the author meant, and no way of writing that the
   documentation of mermaid.js shows is reported. Where an author may write the
   form on purpose, as an empty block left to be filled in, the note says what
   the report states then.
3. For criterion 3, the issues and the pull requests of mermaid.js are searched
   for each rule, and the words and what they found are recorded.
4. For criterion 4, the document is checked for what it says to write instead.

The decision is recorded in the table below, with the reason for a rule that is
not enabled, and the notes after the table give what was checked for each
criterion. The rule file sets `recommended` from this table. The common rules
are not enabled for now: their documents describe flowchart, sequence, class,
and state only, and the decision is made again when they cover every diagram
type.

Decisions (made on 2026-10-15, with mermaid 12.0.0):

| Rule                                      | Enabled          | Reason when not enabled                                                      |
| ----------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| flowchart-no-ignored-text                 | yes              |                                                                              |
| flowchart-no-unclosed-description-block   | no               | Criterion 1: a description that ends with its own `}` after a `{`            |
| flowchart-no-empty-description-block      | yes              |                                                                              |
| flowchart-no-duplicate-description        | yes              |                                                                              |
| flowchart-no-duplicate-title              | yes              |                                                                              |
| flowchart-no-redefined-vertex             | yes              |                                                                              |
| flowchart-no-undef                        | yes              |                                                                              |
| flowchart-no-duplicate-direction          | yes              |                                                                              |
| no-unclosed-directive                     | no (provisional) | Their documents cover four diagram types only                                |
| no-invalid-init-directive                 | no (provisional) | Their documents cover four diagram types only                                |
| sequence-no-create-destroy                | yes              |                                                                              |
| sequence-no-duplicate-description         | yes              |                                                                              |
| sequence-no-duplicate-title               | yes              |                                                                              |
| sequence-no-empty-description-block       | yes              |                                                                              |
| sequence-no-ignored-text                  | yes              |                                                                              |
| sequence-no-invalid-json                  | yes              |                                                                              |
| sequence-no-link-without-separator        | yes              |                                                                              |
| sequence-no-unclosed-description-block    | no               | Criterion 1: a description that ends with its own `}` after a `{`            |
| class-no-bare-class-name                  | yes              |                                                                              |
| class-no-duplicate-description            | yes              |                                                                              |
| class-no-duplicate-title                  | yes              |                                                                              |
| class-no-ignored-text                     | yes              |                                                                              |
| class-no-inline-comment                   | no               | Criteria 1 and 3                                                             |
| class-no-redefined-class                  | yes              |                                                                              |
| class-no-unclosed-backquote               | yes              |                                                                              |
| class-no-undef                            | yes              |                                                                              |
| state-no-duplicate-description            | yes              |                                                                              |
| state-no-duplicate-title                  | yes              |                                                                              |
| state-no-empty-description-block          | yes              |                                                                              |
| state-no-ignored-text                     | yes              |                                                                              |
| state-no-unclosed-description-block       | no               | Criterion 1: a description that ends with its own `}` after a `{`            |
| state-no-undef                            | yes              |                                                                              |
| er-no-duplicate-description               | yes              |                                                                              |
| er-no-duplicate-title                     | yes              |                                                                              |
| er-no-empty-description-block             | yes              |                                                                              |
| er-no-ignored-text                        | no               | Criterion 3: [#8364](https://github.com/mermaid-js/mermaid/pull/8364) (open) |
| er-no-redefined-entity                    | yes              |                                                                              |
| er-no-unclosed-description-block          | no               | Criterion 1: a description that ends with its own `}` after a `{`            |
| er-no-undef                               | yes              |                                                                              |
| gantt-no-duplicate-description            | yes              |                                                                              |
| gantt-no-duplicate-id                     | yes              |                                                                              |
| gantt-no-duplicate-setting                | yes              |                                                                              |
| gantt-no-duplicate-title                  | yes              |                                                                              |
| gantt-no-empty-description-block          | yes              |                                                                              |
| gantt-no-undef                            | yes              |                                                                              |
| gantt-no-unknown-exclude                  | yes              |                                                                              |
| gantt-no-invalid-tag                      | yes              |                                                                              |
| journey-no-duplicate-description          | yes              |                                                                              |
| journey-no-duplicate-title                | yes              |                                                                              |
| journey-no-empty-description-block        | yes              |                                                                              |
| journey-no-empty-person                   | yes              |                                                                              |
| journey-no-ignored-text                   | yes              |                                                                              |
| journey-no-invalid-score                  | yes              |                                                                              |
| requirement-no-duplicate-description      | yes              |                                                                              |
| requirement-no-duplicate-field            | yes              |                                                                              |
| requirement-no-duplicate-name             | yes              |                                                                              |
| requirement-no-duplicate-title            | yes              |                                                                              |
| requirement-no-empty-description-block    | yes              |                                                                              |
| requirement-no-ignored-text               | yes              |                                                                              |
| requirement-no-unclosed-description-block | no               | Criterion 1: a description that ends with its own `}` after a `{`            |
| requirement-no-undef                      | yes              |                                                                              |
| mindmap-no-duplicate-decoration           | yes              |                                                                              |
| mindmap-no-mismatched-shape               | yes              |                                                                              |
| timeline-no-duplicate-title               | yes              |                                                                              |
| timeline-no-duplicate-description         | yes              |                                                                              |
| timeline-no-empty-description-block       | yes              |                                                                              |
| sankey-no-invalid-value                   | yes              |                                                                              |
| sankey-no-empty-node                      | yes              |                                                                              |
| xychart-no-duplicate-title                | yes              |                                                                              |
| xychart-no-duplicate-description          | yes              |                                                                              |
| xychart-no-empty-description-block        | yes              |                                                                              |
| xychart-no-unclosed-description-block     | yes              |                                                                              |
| xychart-no-invalid-orientation            | yes              |                                                                              |
| xychart-no-redefined-axis                 | yes              |                                                                              |
| xychart-no-extra-value                    | yes              |                                                                              |
| quadrant-no-duplicate-title               | yes              |                                                                              |
| quadrant-no-duplicate-description         | yes              |                                                                              |
| quadrant-no-empty-description-block       | yes              |                                                                              |
| quadrant-no-redefined-axis                | yes              |                                                                              |
| quadrant-no-redefined-quadrant            | yes              |                                                                              |
| quadrant-no-redefined-class               | yes              |                                                                              |
| quadrant-no-undef                         | yes              |                                                                              |
| quadrant-no-duplicate-style               | yes              |                                                                              |
| quadrant-no-invalid-coordinate            | yes              |                                                                              |
| block-no-edge-chain                       | yes              |                                                                              |
| block-no-edge-in-composite-head           | yes              |                                                                              |
| block-no-duplicate-block                  | yes              |                                                                              |
| block-no-spaced-class-id                  | yes              |                                                                              |
| block-no-undef                            | yes              |                                                                              |
| block-no-duplicate-columns                | yes              |                                                                              |
| block-no-redefined-style                  | yes              |                                                                              |
| block-no-mismatched-shape                 | yes              |                                                                              |
| block-no-mismatched-edge                  | yes              |                                                                              |
| block-no-useless-width                    | yes              |                                                                              |
| block-no-invalid-direction                | yes              |                                                                              |
| kanban-no-invalid-metadata-key            | held             |                                                                              |
| kanban-no-invalid-priority                | held             |                                                                              |
| kanban-no-duplicate-section               | yes              |                                                                              |
| c4-no-undef                               | yes              |                                                                              |
| c4-no-invalid-attribute-key               | yes              |                                                                              |
| c4-no-useless-argument                    | yes              |                                                                              |
| c4-no-duplicate-title                     | yes              |                                                                              |
| c4-no-duplicate-description               | yes              |                                                                              |
| c4-no-redefined-element                   | yes              |                                                                              |
| c4-no-duplicate-style                     | yes              |                                                                              |
| venn-no-duplicate-title                   | yes              |                                                                              |
| venn-no-duplicate-subset                  | yes              |                                                                              |
| venn-no-duplicate-style                   | yes              |                                                                              |
| venn-no-invalid-style-key                 | yes              |                                                                              |
| venn-no-undef                             | yes              |                                                                              |
| venn-no-ignored-text                      | yes              |                                                                              |
| agentflow-no-duplicate-title              | yes              |                                                                              |
| agentflow-no-duplicate-description        | yes              |                                                                              |
| agentflow-no-empty-description-block      | yes              |                                                                              |
| agentflow-no-unclosed-description-block   | no               | Criterion 1: a description that ends with its own `}` after a `{`            |
| agentflow-no-ignored-text                 | yes              |                                                                              |
| agentflow-no-redefined-vertex             | yes              |                                                                              |
| agentflow-no-redefined-connector          | yes              |                                                                              |
| agentflow-no-redefined-flow               | yes              |                                                                              |
| agentflow-no-duplicate-direction          | yes              |                                                                              |
| agentflow-no-undef                        | yes              |                                                                              |

The notes give, for each rule or each group of rules that share their cases,
what was checked for criteria 1 to 4, in that order. The readings of criterion 1
are those that the documents state, which were run through mermaid.js when the
documents were written; "run" marks a reading run again for this decision. The
searches ran over the issues and the pull requests of mermaid-js/mermaid on
2026-10-15; the words are quoted, and an item not named found nothing that
changes the reading.

The title and description rules, `<diagram>-no-duplicate-title` and
`<diagram>-no-duplicate-description` of flowchart, sequence, class, state, er,
gantt, journey, and requirement (16 rules):

1. Each reported statement replaces the value set before it: the line form and
   the block form; `accTitle:` or `accDescr:` with no text, which takes the next
   line with text (rejected at the end of the text in class and er); a statement
   inside a subgraph (flowchart, er) or a block (sequence), which sets the value
   of the whole diagram; in journey, a line meant as a task that starts with
   `title` in any case (`Title page: 5: Me`). `title` and `accTitle` are counted
   apart (sequence, gantt, journey); in state, a statement inside a composite
   state is a state and is not counted. A statement that sets the value that the
   diagram already has, compared as mermaid.js keeps it, loses nothing and is
   not reported.
2. None: a second value written on purpose leaves the first with nothing to do,
   and a statement inside a subgraph meant for the subgraph is the mistake
   reported.
3. "accTitle multiple", "title twice", "accDescr multiple", "accTitle",
   "accDescr": the items add the statements to other diagram types
   ([#8437](https://github.com/mermaid-js/mermaid/pull/8437),
   [#8140](https://github.com/mermaid-js/mermaid/pull/8140)) or concern C4
   ([#8040](https://github.com/mermaid-js/mermaid/issues/8040)).
4. Keep one statement; the rules of flowchart suggest removing either.

The empty block rules, `<diagram>-no-empty-description-block` of flowchart,
sequence, state, er, gantt, journey, and requirement (7 rules):

1. The block has no effect: after a description, the block leaves it, and with
   no description before it, the description stays empty. A block of only
   comment lines is not reported.
2. None: a block left to be filled in later is written with a comment in it, as
   `accDescr {`, `%% TODO`, and `}`, which the rule does not report, and the
   documents say so.
3. "accDescr empty", "empty accDescr", "accDescr empty block", "accDescr".
4. Write the description, or remove the block.

The unclosed block rules, `<diagram>-no-unclosed-description-block` of
flowchart, sequence, state, er, and requirement (5 rules):

1. A block that a `}` of a shape, a data block, a body, or JSON closes takes the
   lines up to it, and a block without a `}` (flowchart, sequence, state) leaves
   the description empty. A description that holds a `{` and ends with its own
   `}` on a later line (`accDescr {`, then `a {b }` in flowchart and sequence;
   `accDescr {`, `uses { here`, and `}` in state, er, and requirement) is
   reported too, and mermaid.js reads it as written; the documents say so. Not
   enabled.
2. The same description.
3. "accDescr unclosed", "accDescr brace".
4. Close the block; flowchart suggests where.

The direction line rules, flowchart-no-ignored-text, class-no-ignored-text,
state-no-ignored-text, er-no-ignored-text, and requirement-no-ignored-text:

1. The statements on a direction line, the text glued to the direction value,
   and, in state and er, the other texts that the documents name are dropped. In
   state, the character that mermaid.js drops after the `:` of a note, as in
   `note left of A:hi`, is reported: the documentation of mermaid.js writes a
   note with a space after the `:`, and written so, as `note left of A : hi`,
   nothing is dropped (run) ("state note colon character", "note first character
   missing", "state note text", "note state" in titles: nothing about it).
2. None: text after the direction that the author means as a comment in the
   syntax of another language, as `direction TB // vertical`, is no comment of
   mermaid.js, and it is dropped (run, in each of the five diagram types); the
   report states that, with no guess about what the author meant.
3. "direction subgraph same line", "direction statement ignored", "subgraph
   direction", "classDiagram direction", "stateDiagram direction", "erDiagram
   direction", "requirement direction", "direction label", "direction keyword
   node": the items concern how a direction is laid out, as
   [#8066](https://github.com/mermaid-js/mermaid/issues/8066). For er,
   [#8364](https://github.com/mermaid-js/mermaid/pull/8364) (open, "fix(er):
   parse keywords and numbers as unquoted relationship labels") reads the text
   after the `:` of a relationship as its role, so that
   `A ||--o{ B : direction TB`, which makes no relationship now (run), would no
   longer be a direction line (criterion 3). er-no-ignored-text is decided again
   when that pull request is closed.
4. Write the statement on a line of its own; flowchart suggests the split.

sequence-no-ignored-text: (1) the character is dropped; (2) none; (3) "sequence
message newline parenthesis"; (4) write the end of the message on its line.

journey-no-ignored-text: (1) the people after the third colon are dropped; (2)
none: people are separated by commas; (3) "journey colon", "journey"; (4)
separate the people with commas.

flowchart-no-undef: (1) `style` makes a vertex that the author did not write,
and `class` and `click` do nothing; (2) none; (3) "style undefined node", "class
nonexistent node", "style node":
[#7040](https://github.com/mermaid-js/mermaid/issues/7040) (closed, approved)
asked for an error, and [#7441](https://github.com/mermaid-js/mermaid/pull/7441)
(merged, in 12.0.0) logs a warning and still makes the vertex; (4) correct the
id. An id that mermaid.js gives a link written without one, as `L_A_B_0`, is an
id of the diagram (run: `class L_A_B_0 hot` gives the link the class); using it
is not reported, since it reaches what it names, and that such an id changes
when the links change is no fact of the output (decided on 2026-10-22).

class-no-undef: (1) the statement changes nothing, or the note has no line; (2)
none; (3) "cssClass not applied", "classDiagram style nonexistent", "cssClass",
"note for class": [#2234](https://github.com/mermaid-js/mermaid/issues/2234)
(open, "Status: Awaiting PR") asks for an error or for `link` to declare the
class, and with either a mistyped name stays a mistake; (4) correct the name.

state-no-undef: (1) `style`, `class`, and `click` change nothing, and a note for
a state that no other statement writes adds that state; (2) none: a note for a
state sketched with a note only adds a state that no statement writes, and the
report states that; (3) "state note nonexistent"; (4) correct the name, or write
the state.

er-no-undef: (1) the statement changes nothing, and an alias is no name; (2)
none; (3) "erDiagram style class"; (4) use the name of the entity.

gantt-no-undef: (1) no task becomes a link, and the start or the end is today's
date; (2) none; (3) "gantt after nonexistent", "gantt after today", "after
gantt": [#8254](https://github.com/mermaid-js/mermaid/pull/8254) (merged) logs a
warning and keeps today's date,
[#6376](https://github.com/mermaid-js/mermaid/pull/6376) (open) adds delays to
`after` and `until`, [#8359](https://github.com/mermaid-js/mermaid/pull/8359)
(open) stops ids of an earlier chart on the page from being found, and
[#4424](https://github.com/mermaid-js/mermaid/issues/4424) (open) concerns ids
written later, which the rule does not report; (4) correct the id.

requirement-no-undef: (1) the statement changes nothing, and a relationship has
no box at that end; (2) none; (3) "requirement relationship missing",
"requirement"; (4) correct the name.

flowchart-no-redefined-vertex: (1) a later shape or label replaces the earlier
one; labels that differ only in their line breaks are not reported, and labels
are otherwise compared as written, so two that differ only in the quotes of an
HTML attribute, which mermaid.js keeps the same, are reported, as the document
says (changed on 2026-10-22 from a comparison that converted the quotes, to
follow the decision that rules compare written values); (2) none; (3) "node
label overwritten", "redefine node label", "node label":
[#3789](https://github.com/mermaid-js/mermaid/issues/3789) (open, Type:
Enhancement) proposes another statement for labels; (4) use another id, or write
the label once.

flowchart-no-duplicate-direction: (1) a later `direction` statement in the body
of a subgraph replaces the direction of the subgraph (run in `flowchart`,
`flowchart-elk`, and `swimlane-beta`); two subgraphs of one id are drawn as one
with the direction of the first (read in `getData`, which gives the layout the
subgraphs from the last to the first, and the layout keeps one node for an id),
so a different direction in a later one is lost and reported, although the Db
keeps both; `TD` and `TB` are one direction, as the documentation says; (2)
none; (3) the searches of the direction rules above; (4) write one `direction`
statement for each subgraph. Decided on 2026-10-22 with
agentflow-no-duplicate-direction, which reports the same fact.

class-no-redefined-class: (1) the earlier label is lost; (2) none; (3) "class
label redefine"; (4) use another name, or write the label once.

er-no-redefined-entity: (1) the later alias is ignored; (2) none; (3) "entity
alias", "alias erDiagram"; (4) use another name, or write the alias once.

no-unclosed-directive (provisional): (1) the text after the directive is lost,
or the word after `%%{wrap`; (2) none: a comment that starts with `%%{` is read
as a directive, which is the mistake reported; (3) "directive not closed",
"unclosed directive", "directive": the items concern settings, and the
documentation of mermaid.js replaces directives with the frontmatter
([#7989](https://github.com/mermaid-js/mermaid/pull/7989), merged), which keeps
the reading; (4) close the directive with `}%%`.

no-invalid-init-directive (provisional): (1) every init directive of the text is
ignored; (2) none; (3) "init trailing comma", "init directive ignored",
"directive case sensitive", "init json", "json5", "trailing comma init"; (4)
remove the comma, or write the name in lower case. The name follows the words of
the rules of ESLint itself: a form written incorrectly, so that it does not work
as meant, is invalid there, as in no-invalid-regexp and valid-typeof (a
misspelled type name that silently matches nothing); both reported forms, a JSON
argument with a trailing comma and a name in another case, are such forms, and
the fix is to write them correctly.

class-no-inline-comment: see the paragraph after these notes.

sequence-no-create-destroy: (1) nothing is recorded as destroyed; (2) none; (3)
"create destroy": [#4833](https://github.com/mermaid-js/mermaid/issues/4833)
(open) concerns where `create` stands; (4) write `create` and `destroy` as two
statements.

sequence-no-invalid-json: (1) text that is no JSON object gives nothing, or the
characters or the elements of a string or an array; a text that is a JSON object
with the `#` and what follows it, as a URL with a fragment, is not reported,
since mermaid.js cuts a correct JSON object at the `#`; (2) none: `links A:` and
`properties A:` give nothing, and no scene keeps them to be filled in; (3)
"links json", "properties sequence json", "links", "links hash", "links
fragment", "hash sequence" in titles:
[#5419](https://github.com/mermaid-js/mermaid/issues/5419) (open, Type: Bug /
Error) reports that a `#` empties the texts of a sequence diagram; (4) write a
JSON object.

sequence-no-link-without-separator: (1) the label loses its last two characters,
and `link A:` gives an empty link; (2) none; (3) "link @ sequence menu", "link
sequence"; (4) the document names the form `label @ url`.

class-no-bare-class-name: (1) the statement declares nothing; (2) none; (3)
"classDiagram direction lowercase", "classDiagram title", "class diagram title";
(4) the document names `class Foo`, a relation, a member, and the frontmatter
for a title.

class-no-unclosed-backquote: (1) the rest of the text is one name; (2) none; (3)
"class name backtick", "backtick"; (4) close the backquote.

gantt-no-duplicate-id: (1) the id names the later task; (2) none; (3) "gantt
duplicate id", "gantt id"; (4) give the task another id.

gantt-no-duplicate-setting: (1) a later value replaces the earlier one for the
whole chart; a statement that repeats the value, compared as mermaid.js keeps
it, is not reported; (2) none; (3) "gantt dateFormat twice", "gantt multiple
dateFormat", "dateFormat"; (4) keep one statement.

gantt-no-unknown-exclude: (1) the word leaves out nothing; (2) none; (3)
"excludes weekend", "gantt excludes", "excludes weekdays": the items concern the
end dates of tasks over excluded days, as
[#7038](https://github.com/mermaid-js/mermaid/pull/7038), and excludes for a
section ([#5680](https://github.com/mermaid-js/mermaid/issues/5680)); (4) write
`weekends` or the full name of a day.

gantt-no-invalid-tag: (1) the word in the place of the start or the end is read
as a date, which it is not: the chart is not drawn, or the task has no length
(run); the id is not checked, since mermaid.js reads any word there as an id;
(2) none; (3) "gantt tag case", "gantt done crit":
[#4165](https://github.com/mermaid-js/mermaid/issues/4165) (open) concerns a
missing comma before the start; (4) the document names the form, in lower case
at the front, followed by a comma. The names gantt-no-invalid-tag,
xychart-no-invalid-orientation, and block-no-invalid-direction follow the words
of the rules of ESLint itself, as no-invalid-init-directive does: each reports a
value written incorrectly (in another case, without its comma, with whitespace,
or in a place where it cannot stand), which silently does not work as meant, as
in valid-typeof and no-invalid-regexp; the fix is to write it correctly.

journey-no-empty-person: (1) the journey and its legend get a person with an
empty name; (2) none: `Make tea: 5:`, with the people left to be written, adds a
person that was not written to the journey and its legend, and a task without
people is written `Make tea: 5`; (3) "journey actor empty", "journey"; (4)
remove the comma, or write the name.

journey-no-invalid-score: (1) a score that is no number is lost, with the people
written in it; a number outside the scale has no effect, since the documentation
of mermaid.js defines the score as a number from 1 to 5 that places the face on
the scale; an empty score adds a score 0 that was not written; (2) none: an
empty score left to be decided, as in `Make tea: : Me`, adds a score 0 that was
not written, outside the scale; (3) "journey score", "journey":
[#6262](https://github.com/mermaid-js/mermaid/issues/6262) (open, approved)
concerns how a face outside the scale is drawn, and
[#4248](https://github.com/mermaid-js/mermaid/issues/4248) (open, Type:
Enhancement, Status: Triage) asks for a scale of one's own, with no pull
request; (4) the document names the score, a number from 1 to 5 between the
first and the second colon.

requirement-no-duplicate-field: (1) the first value is kept, and a later field
with the same value, compared as mermaid.js keeps it, is not reported; (2) none:
a second `text:` meant to continue a long text is the mistake reported; (3)
"requirement field", "requirement duplicate"; (4) keep one field.

requirement-no-duplicate-name: (1) a later statement of the same kind loses its
kind or the fields whose values the kept statement does not have; a statement of
the other kind makes a second box of the name, keeps both, and is not reported
(run: two nodes `x`); (2) none; (3) "requirement duplicate", "requirement"; (4)
give one of them another name.

mindmap-no-duplicate-decoration: (1) the last icon line and the last class line
are kept, and a line with the value that the node already has is not reported;
(2) none: no author writes a second icon line to replace the first, and two
class lines for two classes are the mistake reported; (3) "mindmap icon class",
"mindmap": [#7025](https://github.com/mermaid-js/mermaid/pull/7025) (open) and
[#7615](https://github.com/mermaid-js/mermaid/issues/7615) (open) concern how
icons are drawn; (4) the document names one class line, as `:::urgent large`.

mindmap-no-mismatched-shape: (1) the node has the shape of the opener; (2) none;
(3) "mindmap shape", "mindmap"; (4) write the closer of the opener.

The timeline rules, timeline-no-duplicate-title,
timeline-no-duplicate-description, and timeline-no-empty-description-block, have
the notes of the title, description, and empty block rules above; their cases
are those of journey, with a title that takes the whole next line after `title`
at the end of a line, and an empty block before a period or an event (run). The
searches "timeline title", "timeline section", "timeline accTitle", "timeline
colon", and "timeline hash" found nothing that changes the reading.

sankey-no-invalid-value: (1) a value with no number at its start is `NaN`, and
the link has no size; text after the number is dropped, as `"1,234"`, which is 1
(run); text after the number that starts with `%%` is not reported; (2) none: a
unit after the number, as in `5 TWh`, is dropped, and the report states that;
(3) "sankey value", "sankey NaN", "sankey number", "sankey comma", "sankey
parseFloat", "sankey" in titles:
[#5995](https://github.com/mermaid-js/mermaid/issues/5995) (open) asks how
negative values are drawn, which the rule does not report; (4) write the number
alone, without separators or units.

sankey-no-empty-node: (1) a source or a target of whitespace only, also in
quotes, adds a node without a name, with the link to it (run); (2) none: a name
deleted with its space kept is the slip reported, as for
journey-no-empty-person; (3) "sankey" in titles; (4) write the name, or remove
the record.

The XY chart rules have these notes; the searches were "xychart" in titles and
in the text, and found nothing that changes the readings but what is named.

- xychart-no-duplicate-title, xychart-no-duplicate-description,
  xychart-no-empty-description-block: the notes of the title, description, and
  empty block rules above; a title in words is compared as mermaid.js joins it,
  and an `accTitle:` at the end of the text sets the empty title (run).
- xychart-no-unclosed-description-block: (1) the block runs to the end of the
  text, takes the statements after it, and leaves the description empty (run);
  the rule reports only a block without its `}`, so no description that
  mermaid.js reads as written is reported; (2) none; (4) close the block.
- xychart-no-invalid-orientation: (1) `Horizontal` and `HORIZONTAL` give a
  vertical chart, also over the setting `chartOrientation: horizontal` (run);
  (2) none: `vertical` in any case is not reported; (4) the document names
  `horizontal` in lower case.
- xychart-no-redefined-axis: (1) a later statement of an axis replaces the
  title, with the empty title when it has none, and the data when it has data
  (run); a statement that only adds what the axis lacked is not reported; (2)
  none; (4) write one statement for each axis.
- xychart-no-extra-value: (1) the values beyond the categories are dropped
  (run); (2) none; (3) [#7798](https://github.com/mermaid-js/mermaid/pull/7798)
  (open) would give the plots before the last `x-axis` the last x axis, so the
  rule checks only the plots after it, where the reading is the same now and
  with that change; (4) write as many values as categories.

The quadrant chart rules have these notes; the searches were "quadrant" and
"quadrantChart" in titles and in the text, also with the words point, classDef,
coordinates, x-axis, range, lexer, comma, number, NaN, hex, and radius, and
found nothing that changes the readings: the open
[#8084](https://github.com/mermaid-js/mermaid/pull/8084) changes only how the
texts are wrapped when drawn, and
[#7608](https://github.com/mermaid-js/mermaid/issues/7608) (open) asks for other
ranges of the axes.

- quadrant-no-duplicate-title, quadrant-no-duplicate-description,
  quadrant-no-empty-description-block: the notes of the title, description, and
  empty block rules above; a title keeps its quotes and the rest of its line,
  and a description block that is not closed is rejected, so no rule reports it
  (run).
- quadrant-no-redefined-axis, quadrant-no-redefined-quadrant: (1) a later
  statement replaces each text that it sets (run); a text that was empty is not
  counted as lost; (2) none; (4) write one statement for each axis and each
  quadrant.
- quadrant-no-redefined-class: (1) the class has the styles of its last
  definition only, with no merge (run); (2) none; (4) write the styles in one
  definition.
- quadrant-no-undef: (1) the class name stays on the point and no class of that
  name is defined (run); the layout finds no class for it, and the drawn point
  has no CSS class of that name (read); (2) none; (4) define the class, or
  correct its name.
- quadrant-no-duplicate-style: (1) the later value of a style replaces the
  earlier one (run); (2) none: a style of a point and one of its class are not
  compared; (4) give each style once.
- quadrant-no-invalid-coordinate: (1) the coordinate is kept as written (run),
  and the layout converts it with the linear scale of d3, which gives no number
  for `0,3` and 5 for `0x5` (run on d3-scale 4.0.2); the rule reports only a
  coordinate that is no number or a number outside 0 to 1, so `0e5` (0) and
  `0b1` (1), drawn at their place, are not reported; a circle without a number
  gets no `cx` or `cy` (read); (2) none: the documentation of mermaid.js writes
  the coordinates as numbers from 0 to 1 with a decimal point; (3) #7608 asks
  for other ranges, which would not make `0,3` a number; (4) write the decimal
  point.

The block diagram rules have these notes; the searches were "block" in titles
and in the text, also with the words chain, composite, class, styles, columns,
shape, arrow, redefined, whitespace, duplicate, comma, width, edge, before,
direction, label, and link, and found nothing that changes the readings: the
open [#8279](https://github.com/mermaid-js/mermaid/pull/8279) changes a `style`
for an id that no block has, which mermaid.js now rejects, and
[#8310](https://github.com/mermaid-js/mermaid/pull/8310) (open) adds the
accessibility statements.
[#5588](https://github.com/mermaid-js/mermaid/issues/5588) (open, in triage)
asks to reuse an id in two composite blocks, which mermaid.js draws once; no
maintainer has said it will change.

- block-no-edge-chain, block-no-edge-in-composite-head: (1) the chain keeps only
  its last link, with no start, and places neither of its first blocks; the head
  with a link gives a composite with no id and no edge (run); (2) none: the
  documentation of mermaid.js writes one link in an edge and no link after
  `block:`; (4) write one edge for each link, and link the composite after its
  `end`.
- block-no-duplicate-block: (1) a block written again places nothing, and a
  label or shape written again replaces the first one while a width, the
  children, and the `columns` are lost (run); (2) a statement that gives a block
  its first shape is not reported, since it gives the block its label and shape,
  unless it is a block arrow, which gets no directions that way, and neither is
  an edge that repeats the shape; (4) give each block its own id, with the text
  in its label.
- block-no-spaced-class-id, block-no-invalid-direction: (1) the id with its
  whitespace finds no block and makes a new one, whitespace before a comma makes
  the rest of the line the name of the class, and the direction with its
  whitespace is not read by the drawing (run for the Db; the drawing read in
  `blockArrow.ts`); (2) none: the documentation of mermaid.js writes
  `class Backend,Database back` and `(x, down)`, which lose nothing, so the
  whitespace is a way of writing that it does not show, as for
  `note left of A:hi`; (4) write no whitespace there.
- block-no-undef: (1) the class goes to a new block that is not placed (run);
  (2) none: an id declared after the `class` statement is not reported, and a
  class name without a `classDef` is not checked; (4) correct the id.
- block-no-duplicate-columns, block-no-redefined-style: (1) the last `columns`
  sets the count of the whole block, and a later `style` replaces the whole list
  (run); (2) none: the same count and a list that keeps the styles, compared as
  CSS reads whitespace (none at the ends or around the colon, a run as one
  space), are not reported; (4) write one `columns` for each block, and one
  `style` with all the styles.
- block-no-mismatched-shape, block-no-mismatched-edge, block-no-useless-width:
  (1) the block gets no shape, the edge takes its line and markers from the
  arrow after the label only, and the width before a link is dropped with the
  link (run); (2) none: the pairs of the documentation, the same line on both
  sides, and a width equal to the one the block has are not reported; (4) close
  the shape with its pair, write the same line on both sides and the start
  marker on the second arrow, and write the width where the block is declared on
  its own. The name block-no-useless-width follows the words of the rules of
  ESLint itself: there, a value written that has no effect on the result is
  useless, as in no-useless-assignment (a value assigned and never used) and
  no-useless-backreference (a backreference written to match that can match
  nothing), while unused names what is declared and never read. The width is
  read by the grammar (`node SIZE`) and left out of the block by the action of
  the edge (`nodeStatement link node`), so it is a value given that has no
  effect.

The kanban rules have these notes; the searches were "kanban" in titles and in
the text, also with the words metadata, priority, duplicate, and icon, and found
nothing that changes the readings:
[#8117](https://github.com/mermaid-js/mermaid/issues/8117) (open) proposes a key
`status`, which mermaid.js does not read now.

- kanban-no-invalid-metadata-key, kanban-no-invalid-priority: (1) a key other
  than `assigned`, `ticket`, `priority`, `icon`, `label`, and `shape` sets
  nothing, also a key in another case and `ticket:DOC-1` without a space, which
  YAML reads as one key; a priority other than `Very High`, `High`, `Medium`,
  `Low`, and `Very Low` is kept and drawn with no colour (run for the Db; the
  drawing read in `kanbanItem.ts`); (2) none: `Medium`, which the drawing
  handles although the documentation names only four values, and a priority left
  empty are not reported; (4) write the key and the value as the documentation
  writes them. Both rules read the YAML of the metadata, which the tree keeps as
  written, as mermaid.js reads it (JSON_SCHEMA of js-yaml). Their conditions,
  for writing the documents and the fixtures again: the key rule reports each
  key of the metadata of a column or an item that is not one of the six,
  compared with its case after YAML has read it (a key in quotes too), with the
  blocks of one node read as one, as mermaid.js joins them; the priority rule
  reports the priority of an item that is not one of the five, as `high`,
  `" High "`, `Urgent`, `0`, another number, or a list, and not one that is
  missing, `null`, `false`, or empty, and not the priority of a column, which
  mermaid.js does not keep. Both are held until after the release; they are not
  dropped. Their documents and fixtures are kept outside the repository for now,
  and are written again from this note and from runs of mermaid.js if they are
  lost. Reading the YAML needs a dependency of the plugin, and the lint rules
  before the release serve mainly to check the shape of the tree, so whether to
  add one is decided after the release; the dependency would then be
  yaml-eslint-parser. A misspelled key in the data of a flowchart node, as
  `A@{ shpe: circle }`, which gives the node no shape without an error (run), is
  a candidate of the same kind and is held in the same way.
- kanban-no-duplicate-section: (1) every column of one id lists every item of
  that id, so the items are drawn once for each column (run); (2) none: columns
  of one id with no item are not reported; (4) give each column its own id.

The C4 rules have these notes; the searches were "C4" in titles and the words
duplicate, undefined, UpdateLayoutConfig, UpdateElementStyle before, attribute
case, accTitle, sprite, and offset, and found nothing that changes the readings
but what the rows above name.

- c4-no-duplicate-title, c4-no-duplicate-description: the notes of the title and
  description rules above; `accTitle:` is not compared, since it sets the
  visible title by a defect of mermaid.js.
- c4-no-undef: (1) a style update whose target does not exist when it is read
  changes nothing (run), also one written before its target; (2) none: the
  documentation of mermaid.js writes the updates at the end of the diagram, so
  an update before its target is not written as it shows, unlike a `class`
  before its vertex in a flowchart, of whose order the documentation says
  nothing; a relationship to an unknown alias is not reported, since drawing
  stops with an error; (4) correct the alias, or move the update after its
  target.
- c4-no-invalid-attribute-key, c4-no-useless-argument: (1) a style key in
  another case is kept as another field, and an argument beyond the parameters
  of a call is not kept (run); (2) none: other unknown keys, and empty entries
  beyond the parameters, are not reported; (4) write the key in its case, and
  the value in its parameter.
- c4-no-redefined-element: (1) a later declaration of an alias replaces the
  label and the kind of an element, and the label and the type of a boundary
  (run); (2) none: the same label again, a first label, a boundary written again
  to add elements, and a default type that nobody wrote are not reported; (4)
  give each element and boundary its own alias.
- c4-no-duplicate-style: (1) a later style update, or a later argument of the
  same update, that gives a field again replaces the earlier value, also with
  the empty value of an empty argument (run); (2) none: a field given the value
  it has, a field the target has not had, `$alias`, `$from`, `$to`, and values
  of declarations are not reported; (3) "UpdateElementStyle", "UpdateRelStyle":
  [#8087](https://github.com/mermaid-js/mermaid/pull/8087) (open) checks the
  colours, which does not change which value is kept; (4) give each field once,
  with a named attribute for one field. Decided on 2026-10-21, after the venn
  rules: an earlier decision had left a style update written twice out on the
  ground that nothing is lost, which holds only for an update that gives other
  fields (`$bgColor="red"`, then `$bgColor="blue"`, keeps only `blue`; run).

The venn rules have these notes; the searches were "venn" in titles,
"venn-beta", and "venn" with the words style, stroke-width, text, title,
duplicate, comment, union label, and px, and found nothing that changes the
readings: the open [#8089](https://github.com/mermaid-js/mermaid/pull/8089)
sorts the names of a target before the drawing looks up its style or its area,
which the Db already sorts; the open
[#8471](https://github.com/mermaid-js/mermaid/pull/8471) makes a diagram with no
set an error; [#8076](https://github.com/mermaid-js/mermaid/issues/8076) and
[#7692](https://github.com/mermaid-js/mermaid/issues/7692) (open) concern where
texts and circles are placed. The drawing was read in `vennRenderer.ts` and in
@upsetjs/venn.js 2.0.0, whose layout was also run on the Db of the examples (no
SVG was drawn).

- venn-no-duplicate-title: the notes of the title rules above; a title keeps its
  quotes and the rest of its line, and the title of the frontmatter is not
  compared.
- venn-no-duplicate-subset: (1) the drawing draws an area once for each
  statement: a set written again is a second circle in the next colour, a later
  label replaces the earlier one, a later size of a set replaces the earlier
  one, and two sizes of a union give an overlap between them (run for the sizes;
  the circles and the labels read); (2) none: a set written again so that an
  indented `text` follows it is reported, since it is drawn twice, and the
  document gives `text A A3` at the start of a line for it; (4) declare each
  area once. A subset is a `set` or `union` statement, as in the tree
  (VennSubsetStatement) and in the Db of mermaid.js (`getSubsetData`).
- venn-no-duplicate-style, venn-no-invalid-style-key: (1) a later value of a
  property replaces the earlier one, in one statement (run) and across the
  statements of one target (read in `buildStyleByKey`); the drawing reads only
  the five properties that the documentation lists, and mermaid.js keeps any
  other with its name as written (run for the Db; the drawing read); (2) none: a
  value that the target already has, a property that it has not had, and the
  five properties are not reported; (4) give each property once, and write one
  of the five. The name venn-no-invalid-style-key follows the words of ESLint
  itself, as the invalid names above.
- venn-no-undef: (1) the text node of an area that no statement declares is not
  placed, and a style for it styles nothing (run for the areas of the layout;
  read in `renderTextNodes` and in the lookups of the styles); (2) none: an area
  declared later, the pairs that a larger union adds, and the id of a text node
  for a style of one name are not reported; (4) correct the name, or declare the
  area.
- venn-no-ignored-text: (1) the character is dropped with the comment (run); (2)
  none: a space before `%%` and a `%%` inside a label or a quoted name are not
  reported; (4) remove the character, or complete the statement.

The agentflow rules have these notes; the searches were "agentflow" in titles,
"agentflow-beta", and "agentflow" with the words connector, flow title,
direction, accDescr, duplicate, and shape, and found nothing that changes the
readings: [#8443](https://github.com/mermaid-js/mermaid/pull/8443), merged after
mermaid.js 12.0.0, draws `[/…/]` as an input, so that
agentflow-no-redefined-vertex would miss a change to or from it, but would
report nothing that changes nothing.

- agentflow-no-duplicate-title, agentflow-no-duplicate-description,
  agentflow-no-empty-description-block, agentflow-no-unclosed-description-block,
  agentflow-no-ignored-text: the notes of the flowchart rules above, with what
  agentflow reads differently: a comment line is text after `accTitle:` and
  `accDescr:` and in a block (run), so a block of only a comment is not empty
  and sets the description; an empty block in the name of a flow or a connector
  and before the fields of `click` sets no description and is reported too
  (run); the unclosed block rule has the condition of the flowchart rule and is
  not enabled for the same reason.
- agentflow-no-redefined-vertex, agentflow-no-redefined-connector: (1) a shaped
  vertex or a connector declaration replaces the label, the drawn shape, and the
  kind that the id had, and the first declaration of a connector replaces a
  vertex of the id (run); shapes are compared as drawn, the diamond, the
  hexagon, and the subroutine apart and every other bracket shape as a rounded
  rectangle (read in `getTypeFromVertex` and `normaliseNodeShapes`), and kinds
  as agentflow derives them (task, input, decision, action, tool, connector),
  which its default theme `redux-color` draws in their own colours (read in
  `deriveVertexKind` and `styles.ts`; decided on 2026-10-22, since kinds are
  part of the default drawing of agentflow); (2) none: the id that a connector
  without a title shows, a reference, data blocks, and the same label, drawn
  shape, and kind are not reported; (4) give each element its own id. The two
  rules share one record of each id and part by the statement reported.
- agentflow-no-redefined-flow: (1) flows of one id are merged, and a later title
  that is not empty replaces the earlier one, in the order in which the flows
  end (run); (2) none: a flow written again without a title to add members is
  not reported; (4) write one title for each id.
- agentflow-no-duplicate-direction: (1) a later direction of a flow, in its body
  or in a later declaration of its id, replaces the earlier one (run); `TD` and
  `TB` are one direction, as the documentation of the flowchart says; (2) none;
  (4) write one direction for each flow. Two `direction` statements in one
  subgraph of a flowchart behave the same (run), which
  flowchart-no-duplicate-direction reports.
- agentflow-no-undef: the notes of flowchart-no-undef; the names of flows and
  connectors are ids, and an id that mermaid.js gives itself (`subGraph0`,
  `L_A_B_0`) is an id of the diagram and is not reported, since it reaches what
  it names (run; decided on 2026-10-22).

class-no-inline-comment: when a line of only whitespace follows the comment and
no comment line follows that line, mermaid.js reads the next line apart, as the
author meant, and the rule reports the comment there too (criterion 1). Whether
mermaid.js will change is not settled: a reply in
[#1646](https://github.com/mermaid-js/mermaid/issues/1646) (closed) says a
comment at the end of a line should be supported, and
[#6401](https://github.com/mermaid-js/mermaid/issues/6401) treats the behavior
as intended (criterion 3).

Changed from the decision of 2026-10-02:
flowchart-no-unclosed-description-block, from yes to no, for the reports that
its document names where mermaid.js reads the text as written; that decision
recorded no check case by case.

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
| flowchart-no-redefined-vertex           | None: criterion 1 (the likely fix is a new id)                 |
| flowchart-no-undef                      | None: criterion 1 (which id was meant is not known)            |
| flowchart-no-duplicate-direction        | None for now (2026-10-22; see the end of this section)         |
| sequence-* (all 8 rules)                | None for now (2026-10-08; see the end of this section)         |
| class-* (all 8 rules)                   | None for now (2026-10-08; see the end of this section)         |
| state-* (all 6 rules)                   | None for now (2026-10-08; see the end of this section)         |
| er-* (all 7 rules)                      | None for now (2026-10-14; see the end of this section)         |
| gantt-* (all 8 rules)                   | None for now (2026-10-14; see the end of this section)         |
| journey-* (all 6 rules)                 | None for now (2026-10-14; see the end of this section)         |
| requirement-* (all 8 rules)             | None for now (2026-10-15; see the end of this section)         |
| mindmap-* (both rules)                  | None for now (2026-10-15; see the end of this section)         |
| timeline-* (all 3 rules)                | None for now (2026-10-15; see the end of this section)         |
| sankey-no-invalid-value                 | None for now (2026-10-15; see the end of this section)         |
| sankey-no-empty-node                    | None for now (2026-10-15; see the end of this section)         |
| xychart-* (all 7 rules)                 | None for now (2026-10-15; see the end of this section)         |
| quadrant-* (all 9 rules)                | None for now (2026-10-16; see the end of this section)         |
| block-* (all 11 rules)                  | None for now (2026-10-21; see the end of this section)         |
| kanban-* (all 3 rules)                  | None for now (2026-10-21; see the end of this section)         |
| c4-* (all 7 rules)                      | None for now (2026-10-21; see the end of this section)         |
| venn-* (all 6 rules)                    | None for now (2026-10-21; see the end of this section)         |
| agentflow-* (all 10 rules)              | None for now (2026-10-22; see the end of this section)         |

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

`sequence-*`, `class-*`, and `state-*` (2026-10-08), and `er-*`, `gantt-*`, and
`journey-*` (2026-10-14), and `requirement-*`, `mindmap-*`, `timeline-*`,
`sankey-*`, and `xychart-*` (2026-10-15), and `quadrant-*` (2026-10-16), and
`block-*`, `kanban-*`, `c4-*`, and `venn-*` (2026-10-21), and `agentflow-*` and
flowchart-no-duplicate-direction (2026-10-22): the rules are implemented without
suggestions for now. No suggestion had been decided for them or described in
their documents, and the one planned for the empty block of a sequence diagram
rested on generated inputs. Whether they get suggestions is decided later, in
the form of the flowchart rules, with a fixture for each case.

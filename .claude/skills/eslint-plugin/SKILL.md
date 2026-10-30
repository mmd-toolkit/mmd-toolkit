---
name: eslint-plugin
description:
  Write, change, or remove the rule documents of @mmd-toolkit/eslint-plugin
  under packages/eslint-plugin/docs/rules/, and update them when a diagram type
  is added. Use when a rule has been decided and needs its document, when a
  document must follow a change of the tree or the fixtures, or when a diagram
  type is supported. Which rules exist is decided with the rule-ideas skill.
---

# Writing the rule documents (eslint-plugin)

How to write the documents of the rules of `@mmd-toolkit/eslint-plugin` (an
ESLint language plugin for Mermaid diagram text) so that every claim in them is
checked against mermaid.js, the tree of `@mmd-toolkit/parser`, and the fixtures.
It is written so that the same documents can be written from this file alone,
without the conversation history or memory. The implementation of the rules is
in the skill `eslint-plugin-rules`; each document belongs to a rule file under
`src/rules/`, which section 6 deals with.

## Policies and criteria

What holds for the package `packages/eslint-plugin`:

- Writing a rule tests the tree as a tool uses it; what a rule cannot read from
  the tree is settled then, by changing the tree or the parser and not by
  reading the text again in the rule. Besides the rules, the package holds what
  does not depend on a rule (the package, the language that gives ESLint the
  tree, their tests).
- Every rule has one document under `docs/rules/`, written for the users of the
  rule, and a rule file under `src/rules/`, which carries the name, the
  description, and whether the rule is recommended; the list of the rules in
  `docs/rules/index.md` and the generated parts of the rule documents are
  written from these files (`pnpm run update`). `pnpm run lint:docs` fails when
  the rule files and the documents disagree.
- Is an ESLint language plugin (the `languages` of a plugin), not a custom
  parser: it gives ESLint the tree of `@mmd-toolkit/parser`, its tokens and
  comments, and its visitor keys.
- A rule reads the tree and the tokens; it does not lex the text again. How the
  tree shows what a rule reports is checked by applying the condition to the
  result of `parse()`.

## 1. What to read first

1. The section Policies and criteria above, and the criteria of the rule-ideas
   skill (`.claude/skills/rule-ideas/SKILL.md`): which rules the package holds
   and which it does not, and when a rule is common. Read them every time: the
   criteria change.
2. The skill `conventions` (`.claude/skills/conventions/SKILL.md`): English
   documents with a Japanese pair, no invisible characters, prose wrapped by
   Prettier, `mmd` as the info string of code blocks that hold Mermaid text,
   links to mermaid.js source.
3. The tree: `packages/spec/docs/ast.md` and
   `packages/spec/docs/ast/<diagram>.md`. The condition of a rule is written
   with the node types, fields, and token kinds defined there.
4. `packages/eslint-plugin/docs/rules/index.md` and one existing document of the
   same kind.
5. The section "Rules and their documents" of
   `packages/eslint-plugin/docs/development.md`: the rule files, which parts of
   the documents are generated from them, and the commands `update` and
   `check:docs`.

Which rules exist, their names, and their scope are decided first, with the
procedure and the criteria of the rule-ideas skill
(`.claude/skills/rule-ideas/SKILL.md`); this procedure writes the document of a
rule decided that way. When checking shows that the condition does not hold,
that the tree and the tokens cannot show it, or that an example is rejected by
mermaid.js, the rule cannot be written as decided: do not write the document,
and take the evidence back to the decision about the rule.

## 2. Where a document goes, and the rule id

- A common rule: `docs/rules/<name>.md` and `<name>.ja.md`, with the id
  `@mmd-toolkit/<name>`.
- A rule of a diagram type: its name starts with the diagram,
  `<diagram>-<rule>`, and its document is `docs/rules/<name>.md` and
  `<name>.ja.md` as for a common rule, with the id `@mmd-toolkit/<name>`.
  `<diagram>` is the name of the document `packages/spec/docs/ast/<diagram>.md`,
  not a diagram type id: the rules whose names start with `flowchart-` are the
  rules for `flowchart-v2`, `flowchart-elk`, and `swimlane`.
- When two diagram types have the same kind of problem but different syntax and
  nodes, each gets a rule of its own, with the same rule name after its own
  diagram prefix.

## 3. The form of a document

A rule document is for the people who use the rule, and the documentation site
publishes it. It answers what they want to know: what the rule reports, why that
is a mistake, and which forms that look alike it does not report. The form is
that of the rule documents of ESLint (as `no-unsafe-negation` and
`no-unused-vars`): a one-line description, a short motivation, Rule Details with
its sentences and then the examples of incorrect and correct code, Options, and
the optional sections; each part of the form is taken from that precedent. The
English rule document:

    # @mmd-toolkit/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Disallow ….

    <!-- begin auto-generated rule notice -->
    …
    <!-- end auto-generated rule notice -->

    <the motivation, one paragraph>

    ## Rule Details

    <a few short sentences>

    Examples of **incorrect** code for this rule:

    ```mmd
    %% eslint @mmd-toolkit/<name>: error
    …
    ```

    Examples of **correct** code for this rule:

    ```mmd
    %% eslint @mmd-toolkit/<name>: error
    …
    ```

    ## Options

    This rule has no options.

    ## When Not To Use It               (only when there is something real to say)

    ## Related Rules                    (only when there are related rules)

    - [<name>](./<name>.md)

    ## Further Reading                  (only when there are links)

    - [<the page of the documentation, issue, or pull request of mermaid.js>](<link>)

    ## Resources                        (generated)

The Japanese document has the same parts: `英語版: [<name>.md](./<name>.md)`,
`…を禁止する。`, `## 規則の詳細`, `この規則に**反する**コードの例:`,
`この規則に**従う**コードの例:`, `## オプション` with
`この規則にはオプションがない。`, `## 使わないとき`, `## 関連する規則`, and
`## 参考`. Links from a Japanese document to another document point to its
Japanese version (`.ja.md`). When the line with the link to the English version
is wider than 80 columns, break it after `英語版:`.

How each part is written:

- The title is the full rule id (`# @mmd-toolkit/<name>`). There is no line for
  the rule id, because the title holds it. The title is generated: when a new
  document is written, any first line is replaced by `update` (section 6).
- The line with the link to the other language is for readers of the repository;
  the documentation site leaves it out.
- The first paragraph after the line of the other language is one short sentence
  that starts with Disallow (`…を禁止する。` in Japanese), as the description of
  an ESLint rule does. The English sentence is the `meta.docs.description` of
  the rule, word for word, and `check:docs` fails when the two differ; the
  Japanese sentence is the description of the rule in `index.ja.md`. Nothing
  else, such as a list, comes between the title and this sentence.
- The notice: the part between `<!-- begin auto-generated rule notice -->` and
  `<!-- end auto-generated rule notice -->`, after the first paragraph, says
  whether the `recommended` configuration enables the rule, whether it has a
  fix, and whether it offers suggestions. It is generated; it is not written or
  changed by hand. A new document gets it from `update`.
- The motivation: one paragraph that says what the author writes, what
  mermaid.js does with it without an error, and why that is a mistake, in plain
  words.
- Examples: in Rule Details, after its sentences, "Examples of **incorrect**
  code for this rule:" and "Examples of **correct** code for this rule:", each
  followed by code blocks with the info string `mmd`, one example in each block.
  A common rule says before them which diagram type the examples are ("The
  examples are flowcharts."). The examples are ordinary writing of the mistake;
  a lead-in that is added only to observe the behavior, such as an earlier
  description before an empty one, is not put in an example, but recorded in the
  fixtures. An example that needs whitespace at the end of a line is described
  in a sentence, because that whitespace does not survive in a code block. The
  correct examples are chosen to show the boundary of the condition: the correct
  way of writing, and the nearest text that the condition does not match. Every
  `mmd` code block, including correct examples and examples outside these two
  groups, starts with `%% eslint @mmd-toolkit/<name>: error`, using the rule
  documented on that page. Write the comment without indentation, before the
  diagram header and any Mermaid directives. It enables `twoslash-eslint`
  diagnostics on the documentation site, which shows the reports when the reader
  points at the code; do not add an `eslint-check` fence marker or rely on the
  renderer to enable rules. `check:docs` rejects missing or different leading
  comments in either language. After this comment, each code block is the
  formatted input of a fixture (step 4 of section 4), and the prose quotes an
  example as the code block writes it (`A --> B`, not `A-->B`, where the
  formatter prints the spaces), and refers to a line by what it holds, not by
  counting.
- The examples are test cases. The tests of the rule read the English document:
  the `mmd` code blocks after the line "Examples of **incorrect** code for this
  rule:" up to the line "Examples of **correct** code for this rule:" are the
  invalid cases, and those after the second line up to the next `## ` heading,
  `## Options`, the valid cases. So the two lines are written word for word,
  each on a line of its own, the incorrect examples come first, and no other
  `mmd` code block stands between the first line and the next `## ` heading; no
  `###` heading stands before the examples either, so that they do not look as
  if they belonged to it. A code block opens with a line that is exactly
  ` ```mmd ` and closes with a line that is exactly ` ``` `. `check:docs` fails
  when the `mmd` code blocks of the Japanese document are not those of the
  English document, in the same order: every Mermaid example, in the examples
  and elsewhere, is in both documents, unchanged.
- Rule Details: a few short sentences before the examples, in the words of the
  people who use the rule:
  - The diagram types it applies to, in one form: "This rule applies to <name>
    (<headers>)." The name is the one in the table below, and the headers are
    every header that the diagram document of the specification defines
    (`packages/spec/docs/diagrams/<diagram>.md`), joined with commas and "and":
    "This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
    `swimlane-beta`).", "This rule applies to class diagrams (`classDiagram` and
    `classDiagram-v2`)." The headers are not taken from the list of the
    detection (`packages/spec/docs/detection.md`), which gives the prefixes that
    select a diagram type: `requirement` selects requirement diagrams, but the
    header is `requirementDiagram`. A diagram type id that is no header, such as
    `flowchart-v2` or `swimlane`, is not used. A common rule says "This rule
    applies to every diagram type."

    | Diagram type  | Name                         |
    | ------------- | ---------------------------- |
    | agentflow     | agentflow diagrams           |
    | architecture  | architecture diagrams        |
    | block         | block diagrams               |
    | c4            | C4 diagrams                  |
    | class         | class diagrams               |
    | cynefin       | Cynefin diagrams             |
    | er            | entity relationship diagrams |
    | eventmodeling | Event Modeling diagrams      |
    | flowchart     | flowcharts                   |
    | gantt         | Gantt charts                 |
    | gitgraph      | Git graphs                   |
    | journey       | user journey diagrams        |
    | kanban        | Kanban boards                |
    | mindmap       | mind maps                    |
    | packet        | packet diagrams              |
    | pie           | pie charts                   |
    | quadrant      | quadrant charts              |
    | radar         | radar charts                 |
    | railroad      | railroad diagrams            |
    | requirement   | requirement diagrams         |
    | sankey        | Sankey diagrams              |
    | sequence      | sequence diagrams            |
    | state         | state diagrams               |
    | timeline      | timelines                    |
    | treemap       | treemaps                     |
    | treeview      | tree views                   |
    | usecase       | use case diagrams            |
    | venn          | Venn diagrams                |
    | wardley       | Wardley maps                 |
    | xychart       | XY charts                    |

  - What the rule reports.
  - The forms that it does not report and that the people who use it may write,
    with the reason.
  - A way to fix the text is not a part of its own: the correct examples show
    it. A sentence of Rule Details says it only when the correct examples cannot
    show it, and only when it has been checked with mermaid.js.
  - Nothing about fixes or suggestions: the generated notice says that the rule
    has a fix or suggestions, and the message of each suggestion, which the
    editor shows, says what it does.
  - A common rule that has something to say for some diagram types says it in a
    list in Rule Details, one item for each such diagram type, without a heading
    and without a code block. When a diagram type is supported, its item is
    added where it is needed (section 7).
- Options: "This rule has no options." for a rule without options. The section
  says only what the rule has now. An option that may come later is recorded
  with the decision in the rule-ideas SKILL, not in the rule document.
- When Not To Use It: written only when there is something real to say; no
  section is written for a sentence that would fit any rule.
- Related Rules: only when the document has related rules, as a list of links.
- Further Reading: only a list of links to what the people who use the rule can
  read, the pages of the documentation of mermaid.js, its issues, and its pull
  requests, without prose. A permalink to the source of mermaid.js is not for
  them: it is kept in the record of the rule in the rule-ideas skill, not in the
  rule document. A rule with no such link has no Further Reading section.
- Which sentence goes where. A sentence about what mermaid.js does is checked
  against these cases, in this order:
  - It stays in Rule Details when it tells apart, among forms that the people
    who use the rule may write, those that are reported and those that are not:
    that each id of a list is checked, that the ids that mermaid.js gives to
    unnamed links count as defined, that a statement before the vertex is not
    reported, that numbers are compared as numbers, that a count is compared up
    to the limit that mermaid.js draws.
  - A page of the documentation of mermaid.js, an issue, or a pull request goes
    to Further Reading, as a link; a permalink to its source goes to the record
    of the rule in the rule-ideas skill.
  - Anything else is removed: an explanation of how mermaid.js works that tells
    apart no reported forms, a restatement of what an example shows, a sentence
    about forms that the people who use the rule do not write, and the formula
    "It applies to <diagram type id>". The behavior that such a sentence
    described stays in the fixtures and the tests of the rule.
- Words. The rule document says what mermaid.js does in what the author sees: it
  draws something, ignores something, or gives an error. It does not use "the
  Db", "the tree", "token", or a sentence whose subject is the parser of
  mmd-toolkit; it names no node type, field, or token kind, which belong to the
  code of the rule. Where the document must say what mmd-toolkit does, it says
  mmd-toolkit for the whole and its formatter for formatting, not "this
  toolkit". It says what mermaid.js does with a mistake, as "gives no error",
  not "says nothing". A link to a known divergence of the specification is
  written only in a rule whose users meet that divergence. In Japanese,
  "この道具" and "木" are not used.
- Sentences are short, and a paragraph has three or four sentences at most.
- Fixtures: the examples stay in the rule document, and the test reads them from
  it. The inputs written only for the rule are in the fixture directory of the
  rule, `tests/fixtures/rules/<name>/`, under `valid/` or `invalid/` (the skill
  `eslint-plugin-rules`, section 4). A fixture file holds no character that
  `pnpm run lint:chars` checks for (the list is in
  `packages/spec/docs/index.md`): an input that a test needs with one is written
  with escapes, in the test code, never as a `.mmd` file that holds the
  character.
- Resources: `update` writes the section that links to the source and the tests
  of the rule, as the Resources section of an ESLint rule document does, between
  its generated markers. It is not written by hand.

## 4. Checking, before and after writing

The scripts that run mermaid.js, parse a text, and format it are in section 4 of
the rule-ideas skill (`.claude/skills/rule-ideas/SKILL.md`). Put them outside
the repository and run them with `node <file>`. Calls to mermaid.js are
serialized and slow; with many inputs, run the script in the background and
write its output to a file.

1. What mermaid.js does: run every example through `runMermaid(text)` of
   `packages/tests/src/mermaid.ts`. Every example must be accepted (a rejected
   input is a syntax error, which no rule reports), and the values in the Db
   must be the ones the document states.
2. The condition on the tree: write the condition of the rule, in node types,
   fields, token kinds and values, and ranges, as code over the result of
   `parse(text)` of `packages/parser/src/index.ts` (`traverseNodes`,
   `root.tokens`, `root.comments`, `root.directives`), and check that it matches
   every incorrect example and no correct example. Add inputs at the boundary:
   with and without whitespace, `\n` and `\r\n`, the same line and the next
   line, directives, comment lines, inside a string, inside a subgraph,
   statements separated by `;` on one line.
3. Formatting: format every incorrect example with the formatting script, and
   check that the output does not show how mermaid.js reads it (the criteria of
   the rule-ideas skill exclude a rule for what the formatter already makes
   visible). The plugin imports `@mmd-toolkit/parser`, which resolves to the
   built `packages/parser/lib`, not to the source; when the source of the parser
   has changed, rebuild it with `pnpm --filter @mmd-toolkit/parser run build`
   first, or the examples are formatted by the old parser. The formatted output
   of each incorrect example is part of the result of the work (section 9).
4. Examples and fixtures: the diagram content of every example comes from a
   fixture of `packages/tests/fixtures` and is the output of formatting the
   `input.mmd` of that fixture with prettier-plugin-mmd and its default options,
   without the line terminator at the end, when the output ends with one (it
   does not when the text ends inside an unclosed directive) (the skill
   `conventions`: a Mermaid example is written as the formatter prints it;
   formatting does not change the Db, so the fixture records how mermaid.js
   reads the example). Choose the fixture whose input is the text to show,
   format its input with the formatting script, and use the output as it is,
   also where the formatter leaves a line as written. Check it by formatting the
   input of the fixture and comparing the output with the example after removing
   only its leading ESLint configuration comment. Keep that comment when
   checking the published example with the parser or the site's renderer. The
   snapshot test helper removes only this comment because its tester enables the
   same rule under `rule-to-test/`; enabling it under `@mmd-toolkit/` too would
   duplicate every report. The comment belongs to the published example, not to
   the corpus fixture. Do not change the fixture to add it. An example kept as
   written on purpose, where the presence or absence of whitespace is the point,
   is the only exception, and the document says so. When prettier-plugin-mmd has
   no printer for the diagram type yet, write each example by hand in the form
   that the formatting choices decided for that diagram type give, and compare
   the examples with the output of the printer once it exists; when no choices
   are decided yet, follow the form of the flowchart printer (the statements
   after the header one level in). Check that the `expected.json` of each
   fixture used says what the document claims, and use only fixtures whose
   `accepted` is true as examples, also for the correct examples. For every
   example and claim without a fixture, add one by the steps of the skill
   `tests`: give the smallest input that shows it and the claim of the rule
   document that the fixture answers, and add it with `pnpm run fixtures:add`,
   which records what mermaid.js does
   (`packages/tests/docs/maintaining-fixtures.md`); then record its tree in the
   parser (the skill `parser`). Read its `expected.json` and use it in the tests
   of the rule. The document change is not done until the fixture exists.

## 5. Checks after writing

1. Run `npx prettier --write` on the documents written, twice; the second run
   must change nothing.
2. Run `pnpm --filter @mmd-toolkit/eslint-plugin run update` (section 6).
3. `pnpm run lint:docs` (the Japanese pairs, and `check:docs`: the generated
   parts, the rules against the documents, and the English first paragraphs
   against `meta.docs.description`), `pnpm run format:check`, and
   `pnpm run lint:chars` must pass.
4. In the Japanese documents, the line breaks are written by hand, because
   Prettier keeps them as written (`proseWrap: "preserve"` for `*.ja.md`, the
   skill `conventions`): one sentence on a line, and a long sentence broken
   after a `、` where the meaning pauses, so that no line of prose is longer
   than 80 columns, counting a full-width character as two. Tables, code blocks,
   and long links that cannot be broken are not counted. The first paragraph of
   a rule document is written the same way: the index reads it without regard to
   where its lines break.
5. The English and Japanese documents have the same code blocks. Extract the
   lines of the code blocks from both, and compare them.
6. Every relative link has a target.
7. A change to documents only runs these checks and no tests (the skill
   `conventions`, Running tests). The exception is a change to what a test
   reads: the examples (the code blocks after the two lines of section 3) or the
   rule files. Then run `tests/rule-cases.test.ts` and the test of the rule,
   `tests/rules/<name>.test.ts`, and `pnpm run check:docs` for the first
   paragraph and the generated parts. Which tests go with which change is in the
   skill `eslint-plugin-rules`, section 4.

## 6. The rule files and the generated parts

Each document belongs to a rule file under `src/rules/`, and the two are added,
renamed, and removed together, as the section "Rules and their documents" of
`docs/development.md` describes.

- What comes from the rule files: whether a rule exists, its name, its English
  description (`meta.docs.description`), and whether the `recommended`
  configuration enables it. Adding, renaming, or removing a rule, or changing
  the first paragraph of an English document, also changes the rule file.
- `recommended` in the rule file is set from the decision in section 7 of the
  rule-ideas SKILL; a provisional decision there is made again first.
- What `pnpm --filter @mmd-toolkit/eslint-plugin run update` writes: the title
  of every document; the notice of every document; the Resources section at the
  end of every document, between `<!-- begin auto-generated rule resources -->`
  and `<!-- end auto-generated rule resources -->`; and, in `index.md` and
  `index.ja.md`, everything between `<!-- begin auto-generated rules list -->`
  and `<!-- end auto-generated rules list -->`, one table for the common rules
  and one for each diagram type, whose rows hold the English description, the
  first paragraph of the Japanese document, a ✅ for a rule that `recommended`
  enables, a 🔧 for a rule that has a fix, a 💡 for a rule that offers
  suggestions. Do not write these parts by hand; after a change of the first
  paragraph of a Japanese document, run `update`.
- What is written by hand in the index: what comes before the generated list
  (the introduction, with the sentence that says `recommended` enables the rules
  marked ✅, and the section on rule ids). The criteria for `recommended` are in
  `docs/development.md`, not in the index.
- When a document is removed, check with `grep` that no other document refers to
  it.
- A rule is implemented with the skill `eslint-plugin-rules`, which follows the
  section "Writing a rule" of `docs/development.md`.

## 7. When a diagram type is supported

1. Start the names of its rules with `<diagram>-`, the name of
   `packages/spec/docs/ast/<diagram>.md`. The table of the diagram type in the
   index is generated by `update` once its rules exist (section 6). Add the
   diagram type to `DIAGRAM_ORDER` in `tools/rule-docs.ts`, at its place in
   `diagramOrder` of `packages/docs/.vitepress/documents.js`, which the site
   uses for its sidebar; `tests/rule-docs.test.ts` fails when the two orders
   differ, and `update` fails for a rule of a diagram type that is missing.
2. For each common rule, run an ordinary example of the new diagram type through
   mermaid.js. When it behaves as in the other diagram types and the rule has
   something to say for that diagram type, add an item to the list of diagram
   types in its Rule Details (what happens there), and its fixture to the tests
   of the rule. When it behaves differently, or when one definition over the
   shared part of the tree no longer covers it, the rule no longer meets the
   condition for a common rule (the criteria of the rule-ideas skill). Moving it
   to the rules of a diagram type is a decision about the rule: make it with the
   rule-ideas skill first, with the result of mermaid.js as the evidence, and
   then move the document (section 8).
3. Write the documents of the rules of that diagram type with the procedure
   above.

## 8. Removing or moving a document

- Use `rm` and plain `mv`. Do not use git for this (`git mv`, `git rm`, or any
  change to the staging area): the user stages.
- When a document moves, its rule is renamed (section 6): change the sentence of
  Rule Details that names the diagram types and its relative links, and run
  `update`, which writes its title and its row in the index.

## 9. The result of the work

Show, as the result of the work: the files written, the result of the condition
for each example (matched or not), the formatted output of each reported
example, and the fixtures added. Say for each claim whether it was checked by
running something, checked by reading, or not checked.

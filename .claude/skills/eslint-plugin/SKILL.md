---
name: eslint-plugin
description:
  Write, change, or remove the rule documents of @mmd-toolkit/eslint-plugin
  under packages/eslint-plugin/docs/rules/, and update them when a diagram type
  is added. Use when a rule has been decided and needs its document, when a
  document must follow a change of the tree, of the fixtures, or of how the
  formatter prints the examples, when a diagram type is supported, and when a
  rule is implemented, whose steps are in the eslint-plugin-rules skill. Which
  rules exist is decided with the rule-ideas skill.
---

# Writing the rule documents (eslint-plugin)

How to write the documents of the rules of `@mmd-toolkit/eslint-plugin` (an
ESLint language plugin for Mermaid diagram text) so that every claim in them is
checked against mermaid.js, the tree of `@mmd-toolkit/parser`, and the fixtures.
The implementation of the rules is in the skill `eslint-plugin-rules`; each
document belongs to a rule file under `src/rules/`, which section 6 deals with.

## Policies and criteria

What holds for the package `packages/eslint-plugin`:

- Writing a rule tests the tree as a tool uses it; what a rule cannot read from
  the tree is settled then, by changing the tree or the parser and not by
  reading the text again in the rule. Besides the rules, the package holds what
  does not depend on a rule (the package, the language that gives ESLint the
  tree, their tests).
- The English document of a rule is the original. A Japanese document may stand
  next to it and may be missing, and `check:docs` fails only for a Japanese
  document that has no English original. When a rule document has no Japanese
  version, or one older than the English, write the Japanese version then; when
  writing or changing the English document, write the Japanese in the same
  change. Add the language lines to both documents when the Japanese is written.
- Every rule has one document under `docs/rules/`, written for the users of the
  rule, and a rule file under `src/rules/`, which carries the name, the
  description, and whether the rule is recommended; the list of the rules in
  `docs/rules/index.md` and the generated parts of the rule documents are
  written from these files (`pnpm run update`). `pnpm run lint:docs` fails when
  the rule files and the documents disagree.
- The package is an ESLint language plugin (the `languages` of a plugin), not a
  custom parser: it gives ESLint the tree of `@mmd-toolkit/parser`, its tokens
  and comments, and its visitor keys.

## 1. What to read first

1. The section Policies and criteria above, and the
   [criteria](../rule-ideas/SKILL.md#policies-and-criteria) of the rule-ideas
   skill (`.claude/skills/rule-ideas/SKILL.md`): which rules the package holds
   and which it does not, and when a rule is common.
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
(`.claude/skills/rule-ideas/SKILL.md`). When checking shows that the condition
does not hold, that the tree and the tokens cannot show it, or that an example
is rejected by mermaid.js, the rule cannot be written as decided: do not write
the document, and take the evidence back to the decision about the rule.

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
the optional sections. The template of the English document, and the parts of
the Japanese one, are in [references/template.md](references/template.md).

The line `Japanese version: …` is written only when the Japanese document
exists; an English document without one has no such line, since the site would
fail on a link to a missing page (`pnpm run lint:md` reports the link). Links
from a Japanese document to another document point to its Japanese version
(`.ja.md`), or to its English document when it has no Japanese version
(`pnpm run lint:md` reports a link whose target does not exist). When the line
with the link to the English version is wider than 80 columns, break it after
`英語版:`.

How each part is written:

- The title is the full rule id (`# @mmd-toolkit/<name>`). The title is
  generated: when a new document is written, any first line is replaced by
  `update` (section 6).
- The line with the link to the other language is for readers of the repository;
  the documentation site leaves it out. An English document has it only when its
  Japanese version exists.
- The first paragraph after the line of the other language is one short sentence
  that starts with Disallow (`…を禁止する。` in Japanese), as the description of
  an ESLint rule does. The English sentence is the `meta.docs.description` of
  the rule, word for word, and `check:docs` fails when the two differ; the
  Japanese sentence is the description of the rule in `index.ja.md`; a rule
  without a Japanese document is listed there with its English document and its
  English description. Nothing else, such as a list, comes between the title and
  this sentence.
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
  diagram header and any Mermaid directives. It enables the `twoslash-eslint`
  diagnostics of the documentation site; do not add an `eslint-check` fence
  marker. `check:docs` rejects missing or different leading comments in either
  language. After this comment, each code block is the formatted input of a
  fixture (step 4 of
  [section 4](references/checking-before-and-after-writing.md)): `update` prints
  it as the formatter prints it, and `check:docs` fails on an example that it
  would change. That step also covers comparing an example with its fixture, the
  fixtures it may use, and the `<!-- prettier-ignore -->` exception. The prose
  quotes an example as the code block writes it (`A --> B`, not `A-->B`, where
  the formatter prints the spaces), and refers to a line by what it holds, not
  by counting.
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
  when a Japanese document exists and its `mmd` code blocks are not those of the
  English document, in the same order: every Mermaid example, in the examples
  and elsewhere, is in both documents, unchanged.
- Rule Details: a few short sentences before the examples, in the words of the
  people who use the rule:
  - The diagram types it applies to, in one form: "This rule applies to <name>
    (<headers>)." The name is the one in
    [references/diagram-type-names.md](references/diagram-type-names.md),
    searched for the diagram type, and the headers are every header that the
    diagram document of the specification defines
    (`packages/spec/docs/diagrams/<diagram>.md`), joined with commas and "and":
    "This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
    `swimlane-beta`).", "This rule applies to class diagrams (`classDiagram` and
    `classDiagram-v2`)." The headers are not taken from the list of the
    detection (`packages/spec/docs/detection.md`), which gives the prefixes that
    select a diagram type: `requirement` selects requirement diagrams, but the
    header is `requirementDiagram`. A diagram type id that is no header, such as
    `flowchart-v2` or `swimlane`, is not used. A common rule says "This rule
    applies to every diagram type."

  - What the rule reports.
  - The forms that it does not report and that the people who use it may write,
    with the reason.
  - A way to fix the text is not a part of its own: the correct examples show
    it. A sentence of Rule Details says it only when the correct examples cannot
    show it, and only when it has been checked with mermaid.js.
  - Nothing about fixes or suggestions: the generated notice says that the rule
    has them, and the message of each suggestion says what it does.
  - A common rule that has something to say for some diagram types says it in a
    list in Rule Details, one item for each such diagram type, without a heading
    and without a code block. When a diagram type is supported, its item is
    added where it is needed (section 7).
- Options: "This rule has no options." for a rule without options. The section
  says only what the rule has now. An option that may come later is recorded
  with the decision in the rule-ideas SKILL, not in the rule document.
- When Not To Use It: no section is written for a sentence that would fit any
  rule.
- Related Rules: a list of links.
- Further Reading: only a list of links to what the people who use the rule can
  read, the pages of the documentation of mermaid.js, its issues, and its pull
  requests, without prose. A permalink to the source of mermaid.js is kept in
  the records of the rule (`.claude/skills/rule-ideas/references/`, and
  `.claude/skills/rule-ideas-suggestions/references/` for its suggestions), not
  in the rule document.
- Which sentence goes where. A sentence about what mermaid.js does is checked
  against these cases, in this order:
  - It stays in Rule Details when it tells apart, among forms that the people
    who use the rule may write, those that are reported and those that are not:
    that each id of a list is checked, that the ids that mermaid.js gives to
    unnamed links count as defined, that a statement before the vertex is not
    reported, that numbers are compared as numbers, that a count is compared up
    to the limit that mermaid.js draws.
  - A page of the documentation of mermaid.js, an issue, or a pull request goes
    to Further Reading, as a link; a permalink to its source goes to the records
    of the rule (`.claude/skills/rule-ideas/references/`, and
    `.claude/skills/rule-ideas-suggestions/references/` for its suggestions).
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
- Fixtures: the inputs written only for the rule are in the fixture directory of
  the rule, `tests/fixtures/rules/<name>/`, under `valid/` or `invalid/` (the
  skill `eslint-plugin-rules`,
  [section 4](../eslint-plugin-rules/SKILL.md#4-tests-and-fixtures)). A fixture
  file holds no character that `pnpm run lint:chars` checks for (the list is in
  `packages/spec/docs/index.md`): an input that a test needs with one is written
  with escapes, in the test code, never as a `.mmd` file that holds the
  character.
- Resources: `update` writes the section that links to the source and the tests
  of the rule, between its generated markers. It is not written by hand.

## 4. Checking, before and after writing

The steps are in
[references/checking-before-and-after-writing.md](references/checking-before-and-after-writing.md).

## 5. Checks after writing

1. Run `pnpm run build:parser` at the root (the formatter reads the built
   parser), then `npx prettier --write` on the documents written, twice; the
   second run must change nothing.
2. Run `pnpm --filter @mmd-toolkit/eslint-plugin run update` (section 6). It
   builds the parser first (the source of the formatter imports it by name), so
   the examples are printed by the formatter of the working tree; the rule is in
   `docs/prettier.config.js`.
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
5. Every relative link has a target.
6. Which tests a change runs, and when it runs none, is in
   [references/tests-after-writing.md](references/tests-after-writing.md).

## 6. The rule files and the generated parts

Each document belongs to a rule file under `src/rules/`, and the two are added,
renamed, and removed together, as the section "Rules and their documents" of
`docs/development.md` describes.

- What comes from the rule files: whether a rule exists, its name, its English
  description (`meta.docs.description`), and whether the `recommended`
  configuration enables it. Adding, renaming, or removing a rule, or changing
  the first paragraph of an English document, also changes the rule file.
- `recommended` in the rule file is set from the decision of
  [section 7](../rule-ideas/SKILL.md#7-whether-recommended-enables-a-rule) of
  the rule-ideas SKILL, recorded in
  [`.claude/skills/rule-ideas/references/recommended-decisions.md`](../rule-ideas/references/recommended-decisions.md);
  a provisional decision there is made again first.
- What `pnpm --filter @mmd-toolkit/eslint-plugin run update` writes: the title
  of every document; the notice of every document; the Resources section at the
  end of every document, between `<!-- begin auto-generated rule resources -->`
  and `<!-- end auto-generated rule resources -->`; and, in `index.md` and
  `index.ja.md`, everything between `<!-- begin auto-generated rules list -->`
  and `<!-- end auto-generated rules list -->`, one table for the common rules
  and one for each diagram type, whose rows hold the English description, the
  first paragraph of the Japanese document (the English description, with a link
  to the English document, for a rule that has no Japanese document), a ✅ for a
  rule that `recommended` enables, a 🔧 for a rule that has a fix, a 💡 for a
  rule that offers suggestions; and the examples, every `mmd` code block being
  printed as the formatter prints it, except one that `<!-- prettier-ignore -->`
  stands directly before. Do not write the generated parts by hand; after a
  change of the first paragraph of a Japanese document, run `update`.
- When the formatter (`packages/prettier-plugin-mmd`) changes what it prints,
  the examples are out of date and `check:docs` fails. The steps that bring them
  up to date are in
  [references/formatter-changes.md](references/formatter-changes.md).
- What is written by hand in the index: what comes before the generated list
  (the introduction, with the sentence that says `recommended` enables the rules
  marked ✅, and the section on rule ids). The criteria for `recommended` are in
  `docs/development.md`, not in the index.
- A rule is implemented with the skill `eslint-plugin-rules`, which follows the
  section "Writing a rule" of `docs/development.md`.

## 7. When a diagram type is supported

The steps are in
[references/supporting-a-diagram-type.md](references/supporting-a-diagram-type.md).

## 8. Removing or moving a document

The steps are in
[references/removing-or-moving.md](references/removing-or-moving.md).

## 9. The result of the work

Show, as the result of the work: the files written, the result of the condition
for each example (matched or not), the formatted output of each reported
example, and the fixtures added. Say for each claim whether it was checked by
running something, checked by reading, or not checked.

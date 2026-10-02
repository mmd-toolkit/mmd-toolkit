---
name: eslint-plugin
description:
  Write, change, or remove the rule documents of eslint-plugin-mmd under
  packages/eslint-plugin-mmd/docs/rules/, and update them when a diagram type is
  added. Use when a rule has been decided and needs its document, when a
  document must follow a change of the tree or the fixtures, or when a diagram
  type is supported. Which rules exist is decided with the rule-ideas skill.
---

# Writing the rule documents (eslint-plugin)

How to write the documents of the rules of `eslint-plugin-mmd` (an ESLint
language plugin for Mermaid diagram text) so that every claim in them is checked
against mermaid.js, the tree of `@mmd-toolkit/parser`, and the fixtures. It is
written so that the same documents can be written from this file alone, without
the conversation history or memory. The implementation of the rules is not
covered yet; each document belongs to a rule file under `src/rules/`, which
section 6 deals with.

## 1. What to read first

1. The `packages/eslint-plugin-mmd` section of AGENTS.md: which rules the
   package holds and which it does not, when a rule is common, and that a rule
   reads the tree and the tokens without lexing the text again. Read it every
   time: the criteria change.
2. The Principles of AGENTS.md: English documents with a Japanese pair, no
   invisible characters, prose wrapped by Prettier, `mmd` as the info string of
   code blocks that hold Mermaid text, links to mermaid.js source.
3. The tree: `packages/spec/docs/ast.md` and
   `packages/spec/docs/ast/<diagram>.md`. The condition of a rule is written
   with the node types, fields, and token kinds defined there.
4. `packages/eslint-plugin-mmd/docs/rules/index.md` and one existing document of
   the same kind.
5. The section "Rules and their documents" of
   `packages/eslint-plugin-mmd/docs/development.md`: the rule files, which parts
   of the documents are generated from them, and the commands `update` and
   `check:docs`.

Which rules exist, their names, and their scope are decided first, with the
procedure of the rule-ideas skill (`.claude/skills/rule-ideas/SKILL.md`) and the
criteria of AGENTS.md; this procedure writes the document of a rule decided that
way. When checking shows that the condition does not hold, that the tree and the
tokens cannot show it, or that an example is rejected by mermaid.js, the rule
cannot be written as decided: do not write the document, and take the evidence
back to the decision about the rule.

## 2. Where a document goes, and the rule id

- A common rule: `docs/rules/<name>.md` and `<name>.ja.md`, with the id
  `mmd/<name>`.
- A rule of a diagram type: `docs/rules/<diagram>/<name>.md` and `<name>.ja.md`,
  with the id `mmd/<diagram>/<name>`. `<diagram>` is the name of the document
  `packages/spec/docs/ast/<diagram>.md`, not a diagram type id: `flowchart/`
  holds the rules for `flowchart-v2`, `flowchart-elk`, and `swimlane`.
- When two diagram types have the same kind of problem but different syntax and
  nodes, each gets a rule of its own, with the same name, in its own directory.

## 3. The form of a document

The form follows the rule documents of ESLint (a one-line description, Rule
Details with examples of incorrect and correct code, Options, Related Rules). A
rule document is for the users of the rule: it says what the rule reports and
how mermaid.js reads the text that it reports. What implementing the rule needs
(the condition on the tree and the fixtures) is in a second document, the rule
notes, until the rule is implemented. The English rule document:

    # mmd/<diagram>/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Disallow ….

    <!-- begin auto-generated rule notice -->
    …
    <!-- end auto-generated rule notice -->

    <the motivation, in one or two short paragraphs>

    ## Rule Details

    <what the rule reports, the diagram types it applies to, what it does not report>

    ### In each diagram type            (common rules only)

    Examples of **incorrect** code for this rule:

    ```mmd
    …
    ```

    Examples of **correct** code for this rule:

    ```mmd
    …
    ```

    ## Options

    This rule has no options.

    ## Related Rules                    (only when there are related rules)

    - [<name>](./<name>.md)

The English rule notes, `docs/rule-notes/<diagram>/<name>.md` (the same path as
the rule document, under `docs/rule-notes/`):

    # mmd/<diagram>/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Notes for implementing the rule [mmd/<diagram>/<name>](../../rules/<diagram>/<name>.md).

    The rule is not implemented yet. These notes are for implementing it.

    ## How the tree shows it

    ## Fixtures

The Japanese document has the same parts: `英語版: [<name>.md](./<name>.md)`,
`…を禁止する。`, `## 規則の詳細`, `### 図種ごとの現れ方`,
`この規則に**反する**コードの例:`, `この規則に**従う**コードの例:`,
`## オプション` with `この規則にはオプションがない。`, and `## 関連する規則`.
The Japanese rule notes have `英語版: [<name>.md](./<name>.md)`,
`規則 [mmd/<diagram>/<name>](…) を実装するための覚え書き。`,
`この規則はまだ実装していない。` and `ここには、実装するときに要ることを書く。`,
`## 木での現れ方`, and `## fixture`. Links from a Japanese document to another
document point to its Japanese version (`.ja.md`).

How each part is written:

- The title is the full rule id (`# mmd/<name>` for a common rule). There is no
  line for the rule id, because the title holds it. The title is generated: when
  a new document is written, any first line is replaced by `update` (section 6).
- The first paragraph after the line of the other language is one short sentence
  that starts with Disallow (`…を禁止する。` in Japanese), as the description of
  an ESLint rule does. The English sentence is the `meta.docs.description` of
  the rule, word for word, and `check:docs` fails when the two differ; the
  Japanese sentence is the description of the rule in `index.ja.md`. Nothing
  else, such as a list, comes between the title and this sentence.
- The notice: the part between `<!-- begin auto-generated rule notice -->` and
  `<!-- end auto-generated rule notice -->`, after the first paragraph, says
  whether the `recommended` configuration enables the rule. It is generated; it
  is not written or changed by hand. A new document gets it from `update`.
- The motivation: what the author writes, what mermaid.js does with it, and why
  that is a mistake. It is short; the details go to Rule Details.
- Rule Details: what the rule reports exactly, the diagram types it applies to
  ("It applies to every diagram type." for a common rule, the diagram type ids
  for a rule of a diagram type), and what it does not report, with the reason.
  The behavior of mermaid.js is stated with the input and the value that
  mermaid.js stores (the Db). A way to fix the text is written only when it has
  been checked with mermaid.js.
- In each diagram type (common rules only, a subsection of Rule Details): it
  starts with "What the rule finds in a diagram type is added here when that
  diagram type is supported." and has one item for each supported diagram type,
  with what happens there and an example.
- Examples: "Examples of **incorrect** code for this rule:" and "Examples of
  **correct** code for this rule:", each followed by code blocks with the info
  string `mmd`, one example in each block. A common rule says before them which
  diagram type the examples are ("The examples are flowcharts."). The examples
  are ordinary writing of the mistake; a lead-in that is added only to observe
  the behavior, such as an earlier description before an empty one, is not put
  in an example, but stated in Rule Details and recorded in the fixtures. An
  example that needs whitespace at the end of a line is described in a sentence,
  because that whitespace does not survive in a code block. The correct examples
  are chosen to show the boundary of the condition: the correct way of writing,
  and the nearest text that the condition does not match. Each code block is the
  formatted input of a fixture (step 4 of section 4), and the prose quotes an
  example as the code block writes it (`A --> B`, not `A-->B`, where the
  formatter prints the spaces), and refers to a line by what it holds, not by
  counting.
- Options: "This rule has no options." for a rule without options. An option
  that may come later is mentioned only with the condition under which it would
  be added.
- Related Rules: only when the document has related rules, as a list of links.
- When Not To Use It: written only when there is something real to say; no
  section is written for a sentence that would fit any rule.
- The rule document describes what the author writes and how mermaid.js reads
  it. It names no node type, field, or token kind of the tree; those belong to
  the rule notes. The facts of mermaid.js, links to issues and pull requests,
  and links to the known divergences of the specification stay in the rule
  document, because a user needs them too.
- Rule notes: they start with "The rule is not implemented yet. These notes are
  for implementing it." They exist only until the rule is implemented: then the
  condition lives in the code of the rule and the fixtures in its tests, so
  delete the rule notes (both languages), and add to the rule document a section
  that links to the source and the tests of the rule, as the Resources section
  of an ESLint rule document does: `## Resources` with the items
  `[Rule source](../../src/rules/<name>.ts)` and
  `[Tests source](../../tests/rules/<name>.test.ts)` (one more `../` for a rule
  of a diagram type). The fixtures of the examples are then the ones that the
  test uses. Update the sentence at the start of the index that says which rules
  are implemented.
- How the tree shows it (in the rule notes): the condition, in node types,
  fields, token kinds and values, and ranges. A common rule uses only the part
  of the tree that every diagram type shares (Root, its tokens, comments, and
  directives, and the shared leaf nodes); where a diagram type must supply more,
  the section says what, and In each diagram type gives it. Whatever goes beyond
  the tree and the tokens is named as such, with the design question it raises:
  reading the source (whitespace is not in the tree), interpreting a value (HTML
  in a label), reading embedded data (the argument of a directive), repeating a
  derivation of the Db (the id of a subgraph). When the tree and the tokens
  cannot show it at all, do not describe a way to lex the text again: either the
  tree needs to show more, which is a change of the specification of the tree
  (the spec skill), or the rule is not kept (the rule-ideas skill).
- Fixtures (in the rule notes): "The behavior of mermaid.js that the rule relies
  on is recorded in these fixtures of `@mmd-toolkit/tests`:", followed by the
  fixtures that back the claims and the examples. While some have no fixture
  yet, it ends with "Fixtures for the other examples are being added."
  (`ほかの例の fixture は追加中である。`).

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
2. The condition on the tree: write the condition of How the tree shows it as
   code over the result of `parse(text)` of `packages/parser/src/index.ts`
   (`traverseNodes`, `root.tokens`, `root.comments`, `root.directives`), and
   check that it matches every incorrect example and no correct example. Add
   inputs at the boundary: with and without whitespace, `\n` and `\r\n`, the
   same line and the next line, directives, comment lines, inside a string,
   inside a subgraph, statements separated by `;` on one line.
3. Formatting: format every incorrect example with the formatting script, and
   check that the output does not show how mermaid.js reads it (AGENTS.md holds
   no rule for what the formatter already makes visible). The plugin imports
   `@mmd-toolkit/parser`, which resolves to the built `packages/parser/lib`, not
   to the source; when the source of the parser has changed, rebuild it with
   `pnpm --filter @mmd-toolkit/parser run build` first, or the examples are
   formatted by the old parser. The formatted output of each incorrect example
   is part of the result of the work (section 9).
4. Examples and fixtures: every example comes from a fixture of
   `packages/tests/fixtures` and is the output of formatting the `input.mmd` of
   that fixture with prettier-plugin-mmd and its default options, without the
   line terminator at the end, when the output ends with one (it does not when
   the text ends inside an unclosed directive) (AGENTS.md: a Mermaid example is
   written as the formatter prints it; formatting does not change the Db, so the
   fixture records how mermaid.js reads the example). Choose the fixture whose
   input is the text to show, format its input with the formatting script, and
   use the output as it is, also where the formatter leaves a line as written.
   Check it by formatting the input of the fixture and comparing the output with
   the example. An example kept as written on purpose, where the presence or
   absence of whitespace is the point, is the only exception, and the document
   says so. When prettier-plugin-mmd has no printer for the diagram type yet,
   write each example by hand in the form that the formatting choices decided
   for that diagram type give, and compare the examples with the output of the
   printer once it exists; when no choices are decided yet, follow the form of
   the flowchart printer (the statements after the header one level in). Check
   that the `expected.json` of each fixture listed says what the document
   claims, and use only fixtures whose `accepted` is true as examples, also for
   the correct examples. For every example and claim without a fixture, add one:
   take the smallest input that shows it, add it with the generator of
   `@mmd-toolkit/tests` (`pnpm run fixtures:add` in `packages/tests`, as
   `packages/tests/docs/maintaining-fixtures.md` describes), read the
   `expected.json` it writes, and list the new fixture in the rule notes. Until
   it exists, the rule notes end their Fixtures section with the sentence for
   fixtures being added.

## 5. Checks after writing

1. Run `npx prettier --write` on the documents written, twice; the second run
   must change nothing.
2. Run `pnpm --filter eslint-plugin-mmd run update` (section 6).
3. `pnpm run lint:docs` (the Japanese pairs, and `check:docs`: the generated
   parts, the rules against the documents, and the English first paragraphs
   against `meta.docs.description`), `pnpm run format:check`, and
   `pnpm run lint:chars` must pass.
4. In the Japanese documents, the line breaks are written by hand, because
   Prettier keeps them as written (`proseWrap: "preserve"` for `*.ja.md`,
   AGENTS.md): one sentence on a line, and a long sentence broken after a `、`
   where the meaning pauses, so that no line of prose is longer than 80 columns,
   counting a full-width character as two. Tables, code blocks, and long links
   that cannot be broken are not counted. The first paragraph of a rule document
   is written the same way: the index reads it without regard to where its lines
   break.
5. The English and Japanese documents have the same code blocks and the same
   list of fixtures. Extract from both the lines of the code blocks and the
   lines that list a fixture, and compare them.
6. Every fixture listed exists under `packages/tests/fixtures`, and every
   relative link has a target.

## 6. The rule files and the generated parts

Each document belongs to a rule file under `src/rules/`, and the two are added,
renamed, and removed together, as the section "Rules and their documents" of
`docs/development.md` describes. A rule that is not implemented yet is a
skeleton that reports nothing.

- What comes from the rule files: whether a rule exists, its name, its English
  description (`meta.docs.description`), and whether the `recommended`
  configuration enables it. Adding, renaming, or removing a rule, or changing
  the first paragraph of an English document, also changes the rule file.
- What `pnpm --filter eslint-plugin-mmd run update` writes: the title of every
  document; the notice of every document; and, in `index.md` and `index.ja.md`,
  everything between `<!-- begin auto-generated rules list -->` and
  `<!-- end auto-generated rules list -->`, one table for the common rules and
  one for each diagram type, whose rows hold the English description and the
  first paragraph of the Japanese document. Do not write these parts by hand;
  after a change of the first paragraph of a Japanese document, run `update`.
- What is written by hand in the index: what comes before the generated list
  (the introduction, with the sentence that says which rules are implemented,
  and the section on rule ids).
- When a document is removed, check with `grep` that no other document refers to
  it.

## 7. When a diagram type is supported

1. Create `docs/rules/<diagram>/`, named after
   `packages/spec/docs/ast/<diagram>.md`. The table of the diagram type in the
   index is generated by `update` once its rules exist (section 6).
2. For each common rule, run an ordinary example of the new diagram type through
   mermaid.js. When it behaves as in the other diagram types, add an item to In
   each diagram type (what happens, an example, its fixture). When it behaves
   differently, or when one definition over the shared part of the tree no
   longer covers it, the rule no longer meets the condition for a common rule
   (AGENTS.md). Moving it to the rules of a diagram type is a decision about the
   rule: make it with the rule-ideas skill first, with the result of mermaid.js
   as the evidence, and then move the document (section 8).
3. Write the documents of the rules of that diagram type with the procedure
   above.

## 8. Removing or moving a document

- Use `rm` and plain `mv`. When the working tree is shared with other work, do
  not use git for this (`git mv`, `git rm`, or any change to the staging area),
  so that what others have staged stays as they left it.
- When a document moves, its rule is renamed (section 6): change the sentence of
  Rule Details that names the diagram types and its relative links, and run
  `update`, which writes its title and its row in the index.
- The rule notes move and are removed with their rule document; change the link
  to the rule document in them. `update` and `check:docs` read `docs/rules/`
  only and do not touch the rule notes.

## 9. The result of the work

Show, as the result of the work: the files written, the result of the condition
for each example (matched or not), the formatted output of each reported
example, and the fixtures added (or, while they are being added, the smallest
inputs and the results of mermaid.js). Say for each claim whether it was checked
by running something, checked by reading, or not checked.

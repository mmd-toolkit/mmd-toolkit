---
name: eslint-plugin-rules
description:
  Implement, change, or remove a rule of @mmd-toolkit/eslint-plugin (the rule
  file under src/rules/, its messages, fixes, and suggestions, its tests and
  fixtures). Use when a rule has been decided with the rule-ideas skill and is
  to be implemented, when the condition, the messages, the fixes, or the
  suggestions of a rule change, and when the tests or the fixtures of a rule are
  added. The documents of the rules are in the eslint-plugin skill.
---

# Implementing the rules (eslint-plugin-rules)

How to implement, change, or remove a rule of `@mmd-toolkit/eslint-plugin` so
that what the rule reports is a fact about the pinned mermaid.js, and the rule
reads the tree as a tool uses it. The layout of the package, the choices that
every rule follows, and the tests and the fixtures are described in
`packages/eslint-plugin/docs/development.md`.

## 1. What to read first

1. The decision about the rule, made with the rule-ideas skill
   (`.claude/skills/rule-ideas/SKILL.md`): that the rule is kept, its name and
   scope, whether `recommended` enables it, whether it has a fix, and whether it
   offers suggestions. When the implementation shows that a decision cannot hold
   (the condition cannot be read from the tree, a fix or a suggestion cannot be
   checked), take the evidence back to that decision.
2. The English document of the rule, which holds the examples that the tests
   read.
3. The section Policies and criteria of the eslint-plugin skill
   (`.claude/skills/eslint-plugin/SKILL.md`), and the skill `conventions`.
4. The tree: `packages/spec/docs/ast.md` and
   `packages/spec/docs/ast/<diagram>.md`.
5. `packages/eslint-plugin/docs/development.md`: Writing a rule, The fixtures of
   the rules, Snapshots, and Rules and their documents.

## 2. Check the facts independently of the rule

What a rule reports is a fact about mermaid.js, and the rule is not evidence for
itself: check the fact with something that does not use the rule, before and
after writing it.

- Define the fact in terms of mermaid.js alone: the Db with the statement
  removed, the values that a function of the Db receives, whether the input is
  accepted. When the summary of the Db hides the fact, wrap the function of the
  Db that receives it and record what it is given.
- Check each condition for reporting or not reporting, each message, each fix,
  and each suggestion with an input for every case it distinguishes. For each
  sentence of the document of the rule, and of the notes of the rule in section
  7 of the rule-ideas skill, list the cases that the sentence distinguishes
  (which statement the mistake stands in, where in a line, which separator or
  whitespace stands next to it, which context it is in) and the rules of the
  language that meet it at the place it names (a directive, an ignored `;`, a
  comment line, an empty line, a line separator, an empty description block).
  Give each case an input, a fixture of the rule, named after the case. Run
  mermaid.js once on each input, and compare the report of the rule with what it
  does, in both directions: a mistake that is not reported, and a report that is
  not a mistake. A case that mermaid.js rejects gets no fixture. No input is
  chosen by a random source or by a number, and no command generates inputs. A
  failure that the comparison finds is closed by the fixture of its case
  (section 4), and by a sentence of the specification where the specification
  did not state the reading.
- A rule whose condition depends on something defined anywhere in the diagram
  (ids, vertices that a statement creates) needs inputs where the definition
  comes after the use and where it comes before it, and a statement that creates
  the thing before or after the statement that names it. Check each with
  mermaid.js.
- The scripts that run mermaid.js and parse a text are in section 4 of the
  rule-ideas skill. The script below lints a text with one rule, as the tests
  do, and applies each fix and each suggestion; replace `<repo>` with the
  absolute path of the root of the repository, as in those scripts. Put the
  scripts outside the repository and run them with `node <file>`, never with
  `tsx`. Calls to mermaid.js are serialized and slow: run a check that takes
  long in the background, write its output to a file, and read the counts, not
  only a sample.

  ```ts
  import { Linter } from "<repo>/packages/eslint-plugin/node_modules/eslint/lib/api.js"
  import plugin from "<repo>/packages/eslint-plugin/src/index.ts"

  const linter = new Linter({ configType: "flat" })
  const config = {
    ...plugin.configs.recommended,
    rules: { "@mmd-toolkit/flowchart-no-empty-description-block": "error" },
  }
  const text = "flowchart LR\n  A accDescr {}\n"
  for (const message of linter.verify(text, config, "probe.mmd")) {
    console.log(message.ruleId, message.line, message.column, message.message)
    if (message.fix !== undefined) {
      const { range, text: replacement } = message.fix
      const applied =
        text.slice(0, range[0]) + replacement + text.slice(range[1])
      console.log(" fix:", JSON.stringify(applied))
    }
    for (const suggestion of message.suggestions ?? []) {
      const { range, text: replacement } = suggestion.fix
      const applied =
        text.slice(0, range[0]) + replacement + text.slice(range[1])
      console.log(" suggestion:", JSON.stringify(applied))
    }
  }
  ```

## 3. Write the rule

- Follow Writing a rule in `docs/development.md`. The adoption, the scope,
  `recommended`, whether the rule has a fix, and whether it offers suggestions
  come from the rule-ideas skill.
- A fix and a suggestion are each built in a function of its own, apart from
  `create`. A fix is offered only where the edit can be made; elsewhere the
  report has no fix. Check the resulting text of each against what its message
  promises on the fixtures of section 4. The snapshot records the output of each
  fix and each suggestion in full; for a `RuleTester` case, put the output of
  the fix in the `output` field of the case, and that of a suggestion in the
  suggestion's `output` field. A suggestion's message states what is true after
  the suggestion is applied, for every place where it is offered. Check that
  reading independently of the rule as in section 2; a rule test does not run
  mermaid.js. When the condition of a candidate cannot be written in the
  sentences that the record of rule-ideas (section 8) gives, the candidate goes
  back to rule-ideas, and offering no suggestion is an ordinary conclusion: do
  not add a condition or a check to keep it, and do not parse the result of an
  edit or decide it per known divergence.
- The condition is written over the tree and the tokens: node types, fields,
  token kinds and values, and ranges. A common rule uses only the part of the
  tree that every diagram type shares (Root, its tokens, comments, and
  directives, and the shared leaf nodes). Whatever goes beyond the tree and the
  tokens is named as such in the comment above the rule in its file, with the
  design question it raises: reading the source (whitespace is not in the tree),
  interpreting a value (HTML in a label), reading embedded data (the argument of
  a directive), repeating a derivation of the Db (the id of a subgraph). When
  the tree and the tokens cannot show it at all, do not write a way to lex the
  text again: either the tree needs to show more, which is a change of the
  specification of the tree (the spec skill), or the rule is not kept (the
  rule-ideas skill).
- Use the helpers of `src/utils/` before writing another. When a helper rests on
  an assumption that a new rule breaks, read the tree to decide it (not the
  text), and check the other rules that use the helper again.
- One decision in one place. Do not make a constant of what is used once or what
  gains no meaning from a name, do not keep a check that can never hold (check
  it against the specification), and do not repeat a branch that a single choice
  of operands would make unnecessary. Tidying a rule makes it smarter, not
  shorter. Show that the behavior has not changed by running the old and the new
  version on the same fixtures and comparing the reports, the fixes, and the
  suggestions, besides the snapshots.
- An objection to a decided design is stated once, before implementing, with the
  code open; if the answer does not change, implement the design as decided.

## 4. Tests and fixtures

- The snapshot test of a rule is one call of `testRule(name, rule)` (see
  `docs/development.md`). The English document's examples and the input files of
  the rule's fixture directory are its cases. They check whether the rule
  reports and the text that each fix and each suggestion produces.
- Name each input after the case that it checks, and keep an input for each case
  that a sentence of the rule document distinguishes.
- Keep the leading `%% eslint @mmd-toolkit/<rule>: error` comment in every
  document example, correct or incorrect (the eslint-plugin skill). Only the
  snapshot test helper removes it, to avoid enabling the rule twice under the
  tester's alias and `@mmd-toolkit/`. When renaming a rule, update the comments
  of both documents.
- When the behavior changes (the condition, a message, a fix, or a suggestion),
  add the fixtures of the change in the same change, after checking each input
  against mermaid.js. A scratch check does not replace a test input.
- Rule fixture files belong to the rule tests and need no matching corpus
  fixture. Put them under `valid/` or `invalid/`, optionally in a subdirectory,
  and do not duplicate a document example or another input of the same rule. The
  common directive rule keeps its existing named corpus input tables.
- A fixture file holds no carriage return, alone or in a CRLF, and no character
  that `pnpm run lint:chars` checks for. Use ESLint's `RuleTester` for such
  inputs: write `code`, the expected `output` of the fix, and each suggestion's
  expected `output` as template literals. Escape those characters: write a
  carriage return as `\r`, and a CRLF as `\r` followed by an actual line break;
  write U+2028, U+2029, and U+00A0 as `\u2028`, `\u2029`, and `\u00a0`. Write
  any other line break as an actual line break. A tab and whitespace at the end
  of a line may be written as `\t` and `\u0020`, which shows in the code the
  whitespace that a case is about. State the expected reports in `errors`, and
  the full output text of the fix and of each suggestion. Whitespace at the end
  of a line is not among those characters: it stays in a fixture file, where
  `.editorconfig` keeps it.
- Regenerate snapshots with `test:update` when an output intentionally changes.
  Read the differences and account for each one. When adding a case, keep
  existing snapshots and add only its missing snapshot: in the package, run
  `UPDATE_SNAPSHOTS=true npx vitest run <test file>`.

### Which tests to run

The rule of the skill `conventions` (Running tests) applies: while working, run
the test files that the change can affect (`npx vitest run <files>` in
`packages/eslint-plugin`), and the whole suite once, before reporting the work
as done.

| What changed                                                  | Test files to run                                                                                                                                                                                                 |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A rule file `src/rules/<name>.ts`                             | `tests/rules/<name>.test.ts`                                                                                                                                                                                      |
| The handlers of a rule of a diagram type                      | the same, and `tests/diagram-rules.test.ts`                                                                                                                                                                       |
| A helper of `src/utils/`                                      | the tests of the rules that import it (search for the import); `tests/subgraph-ids.test.ts` for `subgraph-ids.ts`, `tests/compact-range.test.ts` for `compact-range.ts`, `tests/removal.test.ts` for `removal.ts` |
| A suggestion `removePrevious`, or a rule added to its list    | `tests/suggestion-history.test.ts`                                                                                                                                                                                |
| `tools/rule-docs.ts`, or the directive that starts an example | `tests/rule-docs.test.ts`                                                                                                                                                                                         |
| The fixture directory of a rule                               | `tests/rules/<name>.test.ts`                                                                                                                                                                                      |
| The examples of the English document of a rule                | `tests/rules/<name>.test.ts` and `tests/rule-cases.test.ts`                                                                                                                                                       |
| A rule added, renamed, or removed                             | the tests above for the rule, and `tests/rules-index.test.ts`                                                                                                                                                     |
| `tests/rule-test.ts` or `tests/rule-cases.ts`                 | every `tests/rules/**/*.test.ts`, `tests/rule-cases.test.ts`                                                                                                                                                      |
| `src/language.ts`, `src/source-code.ts`, token store          | `tests/language.test.ts`, `tests/token-store.test.ts`, `tests/snapshot.test.ts`, `tests/inline-config.test.ts`, `tests/markdown.test.ts`                                                                          |
| The parser, when the plugin reads the changed nodes           | the language tests above, `tests/diagram-rules.test.ts`, and the tests of the rules that read those nodes                                                                                                         |

The tests that read documents are `tests/rule-cases.test.ts` and every
`tests/rules/**/*.test.ts` (they read the examples of the English document of
the rule), and the command `pnpm run check:docs`, which reads the documents of
the rules and the index. A change to a document runs them only when it changes
what they read: the examples, the first paragraph, or the files of the rules.

The tests of the language, `tests/language.test.ts`,
`tests/token-store.test.ts`, and `tests/diagram-rules.test.ts`, run on the
fixtures of `tests/language-inputs.ts`, one for each case that the language
treats on its own. Run them when the change reaches the language, the source
code, a handler of a diagram type, or the parser, and not after a change to one
rule.

A case that section 2 finds gets a test input before the work is reported as
done.

## 5. Finish the change

- For a new rule: give it its messages and its handlers, add its test and its
  fixtures, and write its documents in both languages, in the same change. Set
  `recommended` as decided. Then run `update` and `check:docs`.
- When the behavior of a rule changes, change its English document and its
  Japanese document with it; write the Japanese document if it is missing or
  older than the English one (the eslint-plugin skill).
- Before reporting the work as done, run these checks once, and say which
  failures are not caused by the change:
  - in `packages/eslint-plugin`: `npx vitest run` (the whole suite) and
    `pnpm run check:docs`;
  - from the root of the repository: `npx eslint packages/eslint-plugin` (ESLint
    run inside the package misses the configuration of the root),
    `pnpm run lint:docs`, `pnpm run lint:chars`, `pnpm run format:check`, and
    `npx tsc --noEmit`.
- Do not commit, push, or change the staging area (`git mv` and `git rm` change
  it). Use plain `rm` and `mv`. Put work files outside the repository.

## 6. Report

For each behavior, say whether it was checked by running something, checked by
reading, or not checked. Give what changed in the rule, its inputs and
snapshots, with a reason for each snapshot difference; the document passages
that were read and the inputs that were added; what was run and what was not;
and what remains open or unverified. Fix what a review finds (section 7) and
report again until the review finds nothing.

## 7. Fix what the review finds

For each finding:

1. Check that the finding is right, with the code open and mermaid.js (section
   2). If it is not, do not fix it: return it with the evidence.
2. Before fixing, name the kind the finding belongs to: the same mistake in
   another rule, another diagram type, another form of the input, or the same
   words in another document. Fix the kind, not only the point.
3. Before reporting, check what the fix newly allows or changes. A fix that
   changes behavior is compared with mermaid.js on the fixtures of section 4.
   For a fix to a document, search for the same wording elsewhere.
4. State in the report the range that the fix can affect, and how it was
   checked.

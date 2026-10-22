---
name: eslint-plugin-rules
description:
  Implement, change, or remove a rule of @mmd-toolkit/eslint-plugin (the rule
  file under src/rules/, its messages and suggestions, its tests and fixtures).
  Use when a rule has been decided with the rule-ideas skill and is to be
  implemented, when the condition, the messages, or the suggestions of a rule
  change, and when the tests or the fixtures of a rule are added. The documents
  of the rules are in the eslint-plugin skill.
---

# Implementing the rules (eslint-plugin-rules)

How to implement, change, or remove a rule of `@mmd-toolkit/eslint-plugin` so
that what the rule reports is a fact about the pinned mermaid.js, and the rule
reads the tree as a tool uses it. The layout of the package, the choices that
every rule follows, and the tests and the fixtures are described in
`packages/eslint-plugin/docs/development.md`; this procedure does not copy them.
It adds the rules of the work itself: what is checked, in what order, and what
is reported.

## 1. What to read first

1. The decision about the rule, made with the rule-ideas skill
   (`.claude/skills/rule-ideas/SKILL.md`): that the rule is kept, its name and
   scope, whether `recommended` enables it, and whether it offers suggestions.
   These are not decided here. When the implementation shows that a decision
   cannot hold (the condition cannot be read from the tree, a suggestion cannot
   be checked), do not decide otherwise: take the evidence back to that
   decision.
2. The rule notes (`docs/rule-notes/<name>.md`) while the rule is not
   implemented, and the English document of the rule, which holds the examples
   that the tests read.
3. The section Policies and criteria of the eslint-plugin skill
   (`.claude/skills/eslint-plugin/SKILL.md`), and the skill `conventions`.
4. The tree: `packages/spec/docs/ast.md` and
   `packages/spec/docs/ast/<diagram>.md`.
5. `packages/eslint-plugin/docs/development.md`: Writing a rule, The fixtures of
   the rules, Snapshots, and Rules and their documents.

## 2. Check the facts independently of the rule

What a rule reports is a fact about mermaid.js. The rule is not evidence for
itself, so check the fact with something that does not use the rule, before and
after writing it.

- Define the fact in terms of mermaid.js alone: the Db with the statement
  removed, the values that a function of the Db receives, whether the input is
  accepted. When the summary of the Db hides the fact, wrap the function of the
  Db that receives it and record what it is given.
- Check each condition for reporting or not reporting, each message, and each
  suggestion with an input for every case it distinguishes. For each sentence of
  the document of the rule, and of the notes that decided it, list the cases
  that the sentence distinguishes (which statement the mistake stands in, where
  in a line, which separator or whitespace stands next to it, which context it
  is in) and the rules of the language that meet it at the place it names (a
  directive, an ignored `;`, a comment line, an empty line, a line separator, an
  empty description block). Give each case an input, a fixture of the rule,
  named after the case. Run mermaid.js once on each input, and compare the
  report of the rule with what it does, in both directions: a mistake that is
  not reported, and a report that is not a mistake. A case that mermaid.js
  rejects gets no fixture. No input is chosen by a random source or by a number,
  and no command generates inputs. A failure that the comparison finds is closed
  by the fixture of its case (section 4), and by a sentence of the specification
  where the specification did not state the reading. Say in the report which
  document passages were read and which inputs were added.
- A rule whose condition depends on something defined anywhere in the diagram
  (ids, vertices that a statement creates) needs inputs where the definition
  comes after the use and where it comes before it, and a statement that creates
  the thing before or after the statement that names it. Check each with
  mermaid.js.
- The scripts that run mermaid.js and parse a text are in section 4 of the
  rule-ideas skill. The script below lints a text with one rule, as the tests
  do, and applies each suggestion; replace `<repo>` with the absolute path of
  the root of the repository, as in those scripts. Put the scripts outside the
  repository and run them with `node <file>`, never with `tsx`. Calls to
  mermaid.js are serialized and slow: run a check that takes long in the
  background, write its output to a file, and read the counts, not only a
  sample.

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
  `recommended`, and whether the rule offers suggestions come from the
  rule-ideas skill; a rule has no fix.
- A suggestion is built in a function of its own, apart from `create`. Check its
  resulting text against what its message promises on the fixtures of section 4.
  The snapshot records each suggestion and its complete output; for a
  `RuleTester` case, put that output in the suggestion's `output` field. A
  message states what is true after the suggestion is applied, for every place
  where it is offered. Check that reading independently of the rule as in
  section 2; a rule test does not run mermaid.js.
- Use the helpers of `src/utils/` before writing another. When a helper rests on
  an assumption that a new rule breaks, read the tree to decide it (not the
  text), and check the other rules that use the helper again.
- One decision in one place. Do not make a constant of what is used once or what
  gains no meaning from a name, do not keep a check that can never hold (check
  it against the specification), and do not repeat a branch that a single choice
  of operands would make unnecessary. When asked to tidy a rule, make it
  smarter, not shorter: the aim is that each decision is made once, and a line
  count is not the aim. Show that the behavior has not changed by running the
  old and the new version on the same fixtures and comparing the reports and the
  suggestions, besides the snapshots.
- A defect found in your own code is fixed without waiting to be told. An
  objection to a design that was decided for you is stated once, before
  implementing, with the code open; if the answer does not change, implement
  what was asked.

## 4. Tests and fixtures

- The snapshot test of a rule is one call of `testRule(name, rule)` (see
  `docs/development.md`). The English document's examples and the input files of
  the rule's fixture directory are its cases. They check whether the rule
  reports and the text that each suggestion produces.
- Name each input after the case that it checks, and keep an input for each case
  that a sentence of the rule document distinguishes. Review the cases against
  the sentence; the tests do not hold a separate document-to-input map.
- Keep the leading `%% eslint @mmd-toolkit/<rule>: error` comment in every
  document example, correct or incorrect, as the eslint-plugin skill requires.
  The parser and site checks read it with this comment; only the snapshot test
  helper removes it to avoid enabling the rule twice under the tester's alias
  and `@mmd-toolkit/`. When renaming a rule, update both documents' comments.
- When the behavior changes (the condition, a message, or a suggestion), add the
  fixtures of the change in the same change, after checking each input against
  mermaid.js. A scratch check does not replace a test input.
- Rule fixture files belong to the rule tests and need no matching corpus
  fixture. Put them under `valid/` or `invalid/`, optionally in a subdirectory,
  and do not duplicate a document example or another input of the same rule. The
  common directive rule keeps its existing named corpus input tables.
- A fixture file holds no character that `pnpm run lint:chars` checks for. Use
  ESLint's `RuleTester` for U+2028, U+2029, a lone carriage return, U+00A0, and
  the like. Write `code` and each suggestion's expected `output` as template
  literals, with `\u2028`, `\u2029`, `\u00a0`, or `\r`. State the expected
  reports in `errors`, and the full output text of each suggestion. These cases
  do not read the corpus.
- Regenerate snapshots with `test:update` (without `CI=true`) when an output
  intentionally changes. Read the differences and account for each one. When
  adding a case, keep existing snapshots and add only its missing snapshot.

### Which tests to run

The rule of the skill `conventions` (Running tests) applies: while working, run
the test files that the change can affect (`npx vitest run <files>` in
`packages/eslint-plugin`), and the whole suite once, before reporting the work
as done.

| What changed                                         | Test files to run                                                                                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A rule file `src/rules/<name>.ts`                    | `tests/rules/<name>.test.ts`                                                                                                                                      |
| The handlers of a rule of a diagram type             | the same, and `tests/diagram-rules.test.ts`                                                                                                                       |
| A helper of `src/utils/`                             | the tests of the rules that import it (search for the import); `tests/subgraph-ids.test.ts` for `subgraph-ids.ts`, `tests/text-nodes.test.ts` for `text-nodes.ts` |
| The fixture directory of a rule                      | `tests/rules/<name>.test.ts`                                                                                                                                      |
| The examples of the English document of a rule       | `tests/rules/<name>.test.ts` and `tests/rule-cases.test.ts`                                                                                                       |
| A rule added, renamed, or removed                    | the tests above for the rule, and `tests/rules-index.test.ts`                                                                                                     |
| `tests/rule-test.ts` or `tests/rule-cases.ts`        | every `tests/rules/**/*.test.ts`, `tests/rule-cases.test.ts`                                                                                                      |
| `src/language.ts`, `src/source-code.ts`, token store | `tests/language.test.ts`, `tests/token-store.test.ts`, `tests/snapshot.test.ts`, `tests/inline-config.test.ts`, `tests/markdown.test.ts`                          |
| The parser, when the plugin reads the changed nodes  | the language tests above, `tests/diagram-rules.test.ts`, and the tests of the rules that read those nodes                                                         |

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

The rule tests take their inputs from the rule fixture directories and the
English documents. Their snapshots record the reports and suggestion outputs;
the exceptional `RuleTester` cases keep escaped inputs and expected outputs in
the test source. A case found by section 2 gets a test input before the work is
reported as done.

## 5. Finish the change

- For a rule that is implemented now: give it its messages and its handlers, add
  its test, move the fixtures of its rule notes into its fixture directory, and
  remove the rule notes in both languages, in the same change. Set `recommended`
  as decided. Then run `update` and `check:docs`.
- When the behavior of a rule changes, change its English document and its
  Japanese document with it (the eslint-plugin skill).
- Before reporting the work as done, run these checks once, and say which
  failures are not caused by the change (while working, run only what the change
  can affect, as the table above says):
  - in `packages/eslint-plugin`: `CI=true npx vitest run` (the whole suite) and
    `pnpm run check:docs`;
  - from the root of the repository: `npx eslint packages/eslint-plugin` (ESLint
    run inside the package misses the configuration of the root),
    `pnpm run lint:docs`, `pnpm run lint:chars`, `pnpm run format:check`, and
    `npx tsc --noEmit`.
- Do not commit, push, or change the staging area of a shared working tree. Use
  plain `rm` and `mv`. Put work files outside the repository.

## 6. Report

Report the result to the one who asked for it. For each behavior, say whether it
was checked by running something, checked by reading, or not checked. Give what
changed in the rule, its inputs and snapshots, with a reason for each snapshot
difference; the document passages that were read and the inputs that were added;
what was run and what was not; and what remains open or unverified. Have the
result reviewed, fix what the review finds (section 7), and report again until
the review finds nothing.

## 7. Fix what the review finds

Many rounds on one item are a sign that something goes wrong: a fix that closes
one point, or a review that did not say everything at once. So, for each
finding:

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

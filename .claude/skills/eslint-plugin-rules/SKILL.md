---
name: eslint-plugin-rules
description:
  Implement, change, or remove a rule of eslint-plugin-mmd (the rule file under
  src/rules/, its messages and suggestions, its tests and fixtures). Use when a
  rule has been decided with the rule-ideas skill and is to be implemented, when
  the condition, the messages, or the suggestions of a rule change, and when the
  tests or the fixtures of a rule are added. The documents of the rules are in
  the eslint-plugin skill.
---

# Implementing the rules (eslint-plugin-rules)

How to implement, change, or remove a rule of `eslint-plugin-mmd` so that what
the rule reports is a fact about the pinned mermaid.js, and the rule reads the
tree as a tool uses it. The layout of the package, the choices that every rule
follows, and the tests and the fixtures are described in
`packages/eslint-plugin-mmd/docs/development.md`; this procedure does not copy
them. It adds the rules of the work itself: what is checked, in what order, and
what is reported.

## 1. What to read first

1. The decision about the rule, made with the rule-ideas skill
   (`.claude/skills/rule-ideas/SKILL.md`): that the rule is kept, its name and
   scope, whether `recommended` enables it, and whether it offers suggestions.
   These are not decided here. When the implementation shows that a decision
   cannot hold (the condition cannot be read from the tree, a suggestion cannot
   be checked), do not decide otherwise: take the evidence back to that
   decision.
2. The rule notes (`docs/rule-notes/<path of the rule>.md`) while the rule is
   not implemented, and the English document of the rule, which holds the
   examples that the tests read.
3. The section Policies and criteria of the eslint-plugin skill
   (`.claude/skills/eslint-plugin/SKILL.md`), and the skill `conventions`.
4. The tree: `packages/spec/docs/ast.md` and
   `packages/spec/docs/ast/<diagram>.md`.
5. `packages/eslint-plugin-mmd/docs/development.md`: Writing a rule, The
   fixtures of the rules, Snapshots, and Rules and their documents.

## 2. Check the facts independently of the rule

What a rule reports is a fact about mermaid.js. The rule is not evidence for
itself, so check the fact with something that does not use the rule, before and
after writing it.

- Define the fact in terms of mermaid.js alone: the Db with the statement
  removed, the values that a function of the Db receives, whether the input is
  accepted. When the summary of the Db hides the fact, wrap the function of the
  Db that receives it and record what it is given.
- Generate inputs: insert the text of the mistake at every line of the corpus,
  with the separators, the whitespace, the comments, and the directives that can
  come around it, and mutate the examples of the document. Compare the reports
  of the rule with the fact in both directions: a mistake that is not reported,
  and a report that is not a mistake. Run mermaid.js on every input that the
  comparison needs.
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
  mermaid.js are serialized and slow: run a large check in the background, write
  its output to a file, and read the counts, not only a sample.

  ```ts
  import { Linter } from "<repo>/packages/eslint-plugin-mmd/node_modules/eslint/lib/api.js"
  import plugin from "<repo>/packages/eslint-plugin-mmd/src/index.ts"

  const linter = new Linter({ configType: "flat" })
  const config = {
    ...plugin.configs.recommended,
    rules: { "mmd/flowchart/no-empty-description-block": "error" },
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
  result with mermaid.js: apply it to every input of the generated check, and
  confirm that the parser accepts the text, that the Db is the one that the
  message says (the Db of the text as the author meant it), and that the rule
  reports less. A message states what is true after the suggestion is applied,
  for every place where it is offered.
- Use the helpers of `src/utils/` before writing another. When a helper rests on
  an assumption that a new rule breaks, read the tree to decide it (not the
  text), and check the other rules that use the helper again.
- One decision in one place. Do not make a constant of what is used once or what
  gains no meaning from a name, do not keep a check that can never hold (check
  it against the specification), and do not repeat a branch that a single choice
  of operands would make unnecessary. When asked to tidy a rule, make it
  smarter, not shorter: the aim is that each decision is made once, and a line
  count is not the aim. Show that the behavior has not changed by running the
  old and the new version on the same generated inputs and comparing the reports
  and the suggestions, besides the snapshots.
- A defect found in your own code is fixed without waiting to be told. An
  objection to a design that was decided for you is stated once, before
  implementing, with the code open; if the answer does not change, implement
  what was asked.

## 4. Tests and fixtures

- The test of a rule is one call of `testRule` (see `docs/development.md`). The
  examples of the English document are cases; the inputs of the fixture
  directory are the other cases.
- When the behavior changes (the condition is widened or narrowed, a message or
  a suggestion changes), add the fixtures of the change in the same change,
  after checking each input against mermaid.js. A check in a scratch file does
  not replace a fixture of the repository.
- An input that records what mermaid.js does is a copy of the input of a corpus
  fixture (byte for byte); an input written for the rule alone goes directly
  under `valid/` or `invalid/`. A fixture file holds no character that
  `pnpm run lint:chars` checks for: an input that needs one is written with
  escapes, in the test code or in a JSON fixture.
- The snapshots are regenerated with `test:update` (without `CI=true`). Compare
  the new snapshot with the old one and account for each difference; a
  difference that you did not mean is a defect.

### Which tests to run

The rule of the skill `conventions` (Running tests) applies: while working, run
the test files that the change can affect (`npx vitest run <files>` in
`packages/eslint-plugin-mmd`), and the whole suite once, before reporting the
work as done.

| What changed                                         | Test files to run                                                                                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A rule file `src/rules/<path>.ts`                    | `tests/rules/<path>.test.ts`                                                                                                             |
| The handlers of a rule of a diagram type             | the same, and `tests/diagram-rules.test.ts`                                                                                              |
| A helper of `src/utils/`                             | the tests of the rules that import it (search for the import)                                                                            |
| The fixture directory of a rule                      | `tests/rules/<path>.test.ts` and `tests/rule-fixtures.test.ts`                                                                           |
| The examples of the English document of a rule       | `tests/rules/<path>.test.ts` and `tests/rule-cases.test.ts`                                                                              |
| A rule added, renamed, or removed                    | the tests above for the rule, and `tests/rules-index.test.ts`                                                                            |
| `tests/rule-test.ts` or `tests/rule-cases.ts`        | every `tests/rules/**/*.test.ts` and `tests/rule-cases.test.ts`                                                                          |
| `src/language.ts`, `src/source-code.ts`, token store | `tests/language.test.ts`, `tests/token-store.test.ts`, `tests/snapshot.test.ts`, `tests/inline-config.test.ts`, `tests/markdown.test.ts` |
| The parser, when the plugin reads the changed nodes  | the language tests above, `tests/diagram-rules.test.ts`, and the tests of the rules that read those nodes                                |

The tests that read documents are `tests/rule-cases.test.ts` and every
`tests/rules/**/*.test.ts` (they read the examples of the English document of
the rule), and the command `pnpm run check:docs`, which reads the documents of
the rules and the index. A change to a document runs them only when it changes
what they read: the examples, the first paragraph, or the files of the rules.

The tests that go over every input of the corpus are `tests/language.test.ts`,
`tests/token-store.test.ts`, and `tests/diagram-rules.test.ts`. Run them when
the change reaches the language, the source code, a handler of a diagram type,
or the parser, and not after a change to one rule. The package has no separate
full size: its suite has one size. The generated check of section 2 is the run
at full size: run it on all the inputs once, before reporting the work as done,
and on a few inputs of the change while working.

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
  - in `packages/eslint-plugin-mmd`: `CI=true npx vitest run` (the whole suite)
    and `pnpm run check:docs`;
  - from the root of the repository: `npx eslint packages/eslint-plugin-mmd`
    (ESLint run inside the package misses the configuration of the root),
    `pnpm run lint:docs`, `pnpm run lint:chars`, `pnpm run format:check`, and
    `npx tsc --noEmit`.
- Do not commit, push, or change the staging area of a shared working tree. Use
  plain `rm` and `mv`. Put work files outside the repository.

## 6. Report

Report the result to the one who asked for it. Say for each claim whether it was
checked by running something, checked by reading, or not checked. Give what
changed (the rule, the fixtures, the snapshots with the reason for each
difference), the counts of the generated check, what was run and what was not
(the tests, the checks), and what is still open or unverified. Have the result
reviewed, fix what the review finds (section 7), and report again, until the
review finds nothing.

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
   changes behavior is compared with mermaid.js on generated inputs, as in
   section 2. For a fix to a document, search for the same wording elsewhere.
4. State in the report the range that the fix can affect, and how it was
   checked.

# Development

Japanese version: [development.ja.md](./development.ja.md)

How the language of the plugin is built and tested. The plugin reads diagrams
with [`@mmd-toolkit/parser`](../../parser), and its tests take their inputs from
the fixtures of [`@mmd-toolkit/tests`](../../tests) and of `tests/fixtures/`.

## Running the tests

```sh
pnpm --filter eslint-plugin-mmd run test
```

From the root of the repository, `pnpm vitest run --project eslint-plugin-mmd`
runs the same tests. To write the snapshots again (see [Snapshots](#snapshots)):

```sh
pnpm --filter eslint-plugin-mmd run test:update
```

The tests import the sources of `@mmd-toolkit/parser` and `@mmd-toolkit/tests`,
not their builds (see `vitest.config.ts`), so they need no build step. The build
of the plugin, and a script run with Node that imports its sources, get the
parser from its build in `lib/`: rebuild it with
`pnpm --filter @mmd-toolkit/parser run build` after the parser changes.

## The tests

| File                          | What it checks                                                                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/language.test.ts`      | Every input of the conformance corpus of `@mmd-toolkit/tests`, run through ESLint: a rejected input is reported at the place of the parser's error; for an accepted one, ESLint visits the nodes in the order of `traverseNodes`, and its lines, columns, and parents agree with the tree. |
| `tests/snapshot.test.ts`      | Snapshots of where ESLint sees the nodes, tokens, and comments of some inputs of the corpus.                                                                                                                                                                                               |
| `tests/token-store.test.ts`   | The token methods of the source code, on every input of the corpus that the parser accepts, against answers computed from the ranges of the tree: the tokens and comments inside, before, and after each node, and whether whitespace lies between two tokens.                             |
| `tests/inline-config.test.ts` | Snapshots of the comments that configure ESLint (`%% eslint-disable…`, `%% eslint <rule>: <config>`), with the inputs of `tests/fixtures/inline-config/`.                                                                                                                                  |
| `tests/markdown.test.ts`      | The `mermaid` and `mmd` code blocks of `tests/fixtures/markdown/`, linted through the processor of `@eslint/markdown`: the reports are at the places of the Markdown file.                                                                                                                 |
| `tests/rules/<rule>.test.ts`  | Each rule, with eslint-snapshot-rule-tester, on the inputs of the fixtures that the document of the rule cites.                                                                                                                                                                            |

Tests of rules use eslint-snapshot-rule-tester (see [Snapshots](#snapshots)).
The tests of the language use it where a snapshot shows the result best.

The rules in the tests only observe: they report what ESLint gives them, so that
the tests show what a rule of the plugin will see. They are not rules of the
plugin.

## Snapshots

The tests of the rules, `tests/snapshot.test.ts`, and
`tests/inline-config.test.ts` use
[eslint-snapshot-rule-tester](https://github.com/RunDevelopment/eslint-snapshot-rule-tester).
It writes its snapshots to `__snapshots__/<test file>.eslintsnap` next to the
test file, one for each test case that reports something; a test case without
reports is valid and has no snapshot.

The tester supports Mocha and Jest, not vitest. `tests/setup.ts` makes it take
its Jest path: the tester then needs only `afterAll` and
`expect.getState().testPath`, which vitest provides with `globals: true`. Two
things follow:

- `vitest -u` does not update the snapshots: the tester reads `--update` from
  `process.argv`, which does not reach the workers of vitest. The script
  `test:update` deletes every `__snapshots__` directory under `tests/` and runs
  the tests again, and the tester writes the snapshots that are missing. Run it
  without `CI=true`.
- With `CI=true`, a missing snapshot fails the test, and so does a snapshot that
  no test case uses any more.

The tester has three more limits, which decide where an input is tested:

- It shows the text in lines that end at `\n` or `\r\n`. An input with a lone
  `\r` is not shown; `tests/language.test.ts` checks its positions.
- It fails a test case that has a fatal message. A rejected input, and a
  configuration comment that ESLint cannot read, are checked with ESLint's
  Linter directly.
- It names the rule under test `rule-to-test/<name>`, so the inputs of
  `tests/fixtures/inline-config/` that name a rule use that id.

## How the language is built

- Lines end at `\r\n`, a lone `\r`, or `\n`, as in the tree (ast.md, Positions).
  `TextSourceCodeBase` is given that pattern; its default does not end a line at
  a lone `\r`.
- Columns are counted from 0, as in the tree, and the language says so with
  `columnStart: 0`. ESLint does not apply that to parse errors, so the column of
  a `ParseError` is counted from 1 when it is reported.
- A diagram type that the parser does not support yet is reported as a parse
  error at the start of the file: `UnsupportedDiagramError` has no position.
- The language has no options and ignores what other tools put into
  `languageOptions`: eslint-snapshot-rule-tester puts the options of JavaScript
  there, and so does the `processor` configuration of `@eslint/markdown` for
  every code block.
- Comments are the `%%` lines of `Root.comments`. Those that start with
  `eslint`, `eslint-disable`, `eslint-enable`, `eslint-disable-line`, or
  `eslint-disable-next-line` configure ESLint. Directives and the frontmatter do
  not.
- The source code has the methods of the `TokenStore` of
  [`@ota-meshi/ast-token-store`](https://github.com/ota-meshi/ast-token-store)
  (`getFirstToken`, `getTokenBefore`, `getTokens`, `getCommentsInside`,
  `commentsExistBetween`, `isSpaceBetween`, and the others), over `Root.tokens`
  and `Root.comments`, as the store defines them. The tokens include the
  directives, as tokens of the kind `Directive`, and the frontmatter, as its
  delimiters (`Punctuator`) and its body (`RawText`), so every character that is
  not whitespace or a line terminator lies in a token or a comment, as ESLint
  expects. A rule that looks at the tokens around a node sees them: in
  `A%%{init: {}}%%B`, the token after `A` is the directive, and `isSpaceBetween`
  finds no whitespace between `A` and `B`.
- `traverse()` follows `traverseNodes` of the parser, and `getParent()` returns
  the parent that the walk passed.
- The `recommended` configuration registers the plugin object itself: ESLint
  rejects two different objects under the same plugin name.

## Rules and their documents

The rules are the files under `src/rules/`: a common rule in
`src/rules/<name>.ts`, a rule of a diagram type in
`src/rules/<diagram>/<name>.ts`. Each file exports one rule, named after the
file in camel case (`noIgnoredText` in `no-ignored-text.ts`). Its name in the
plugin is its path without `.ts` (`flowchart/no-ignored-text`), its id is that
name after the namespace (`mmd/flowchart/no-ignored-text`), and its documents
are `docs/rules/<name>.md` and `docs/rules/<name>.ja.md`. The notes for
implementing a rule, how the tree shows what it reports and the fixtures that
record it, are kept apart from the documents for its users, in
`docs/rule-notes/<name>.md` and `docs/rule-notes/<name>.ja.md`. A rule need not
have notes: the notes of a rule are removed when it is implemented. `update` and
`check:docs` read only their paths, to find notes that belong to no rule.

The namespace is `mmd`, not a scoped name such as `@mmd-toolkit`: ESLint splits
an id that starts with `@` into the plugin and the rule at its last `/`, so it
would read `@mmd-toolkit/flowchart/no-ignored-text` as the rule
`no-ignored-text` of a plugin `@mmd-toolkit/flowchart`. An id that does not
start with `@` is split at its first `/`.

The rules hold what the documents list: `meta.docs.description` is the English
description, and `meta.docs.recommended` says whether the `recommended`
configuration enables the rule. Two commands keep the files that come from the
rules up to date:

```sh
pnpm --filter eslint-plugin-mmd run update
pnpm --filter eslint-plugin-mmd run check:docs
```

`update` writes `src/rules/index.ts`, the list of the rules, from the rule files
(`tools/update-rules.ts`), and then the generated parts of the documents
(`tools/update-docs.ts`):

- In `docs/rules/index.md` and `index.ja.md`, everything between
  `<!-- begin auto-generated rules list -->` and
  `<!-- end auto-generated rules list -->`: a table of the rules for the common
  rules and for each diagram type, with the description and a ✅ for the rules
  that the `recommended` configuration enables. The English description is
  `meta.docs.description`; the Japanese one is the first paragraph of the
  Japanese document.
- In each rule document, in both languages, the title (`# mmd/<name>`), and
  everything between `<!-- begin auto-generated rule notice -->` and
  `<!-- end auto-generated rule notice -->` after the first paragraph: whether
  the `recommended` configuration enables the rule.

The rest of the documents is written by hand. `check:docs` writes nothing and
fails when `src/rules/index.ts` or a generated part is out of date, when a rule
has no document in one of the languages, when a document or notes belong to no
rule, or when the first paragraph of an English document is not
`meta.docs.description` of its rule. Line breaks inside a first paragraph do not
matter.

When the rules and the documents do not match in one of these ways, `update`
writes `src/rules/index.ts` but none of the generated parts of the documents,
and fails: the list in the index takes the Japanese descriptions from the
documents, so it cannot be made while a document is missing. Fix the documents
and run `update` again.

To add a rule:

1. Add its file under `src/rules/`. A rule that is not implemented yet is a
   skeleton: its `meta` (`type`, `docs.description`, `docs.recommended`,
   `docs.url`, `schema`, `messages`), and a `create` that returns no handler.
2. Write its documents in both languages. The first paragraph of the English
   document is `meta.docs.description`, word for word.
3. Run `update`, then `check:docs`.

To rename a rule, rename its file, the argument of `ruleDocsUrl` in it, and its
documents together, and run `update`. To remove a rule, remove its file and its
documents, and run `update`. To change the description of a rule, change
`meta.docs.description` and the first paragraph of the English document to the
same sentence, change the first paragraph of the Japanese document, and run
`update`.

## Types for rules

`MermaidRuleDefinition` and `MermaidRuleVisitor` type a rule for Mermaid text:
the handler of a node type gets the node of that type and its parent.

```ts
import type { MermaidRuleDefinition } from "eslint-plugin-mmd"

const rule: MermaidRuleDefinition<{ MessageIds: "identifier" }> = {
  meta: { type: "problem", messages: { identifier: "{{name}}" } },
  create(context) {
    return {
      Identifier(node) {
        context.report({
          loc: node.loc,
          messageId: "identifier",
          data: { name: node.name },
        })
      },
    }
  },
}
```

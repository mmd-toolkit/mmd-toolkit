# Development

Japanese version: [development.ja.md](./development.ja.md)

How the language of the plugin is built and tested. The plugin reads diagrams
with [`@mmd-toolkit/parser`](../../parser), and its tests take their inputs from
the fixtures of [`@mmd-toolkit/tests`](../../tests) and of `tests/fixtures/`.

## Running the tests

```sh
pnpm --filter @mmd-toolkit/eslint-plugin run test
```

From the root of the repository,
`pnpm vitest run --project @mmd-toolkit/eslint-plugin` runs the same tests. To
write the snapshots again (see [Snapshots](#snapshots)):

```sh
pnpm --filter @mmd-toolkit/eslint-plugin run test:update
```

The tests import the sources of `@mmd-toolkit/parser` and `@mmd-toolkit/tests`,
not their builds (see `vitest.config.ts`), so they need no build step. The build
of the plugin, and a script run with Node that imports its sources, get the
parser from its build in `lib/`: rebuild it with
`pnpm --filter @mmd-toolkit/parser run build` after the parser changes.

## The tests

| File                          | What it checks                            |
| ----------------------------- | ----------------------------------------- |
| `tests/language.test.ts`      | Language, through ESLint                  |
| `tests/snapshot.test.ts`      | Where ESLint sees nodes, tokens, comments |
| `tests/token-store.test.ts`   | Token methods of the source code          |
| `tests/inline-config.test.ts` | Comments that configure ESLint            |
| `tests/markdown.test.ts`      | Code blocks in Markdown                   |
| `tests/diagram-rules.test.ts` | Selectors of the rules                    |
| `tests/subgraph-ids.test.ts`  | Subgraph ids from the tree                |
| `tests/text-nodes.test.ts`    | Text node types of the rules              |
| `tests/rule-cases.test.ts`    | Examples of the rule documents            |
| `tests/rules/<rule>.test.ts`  | Each implemented rule                     |

- `tests/language.test.ts`: The inputs of `tests/language-inputs.ts` (see
  below), fixtures of the conformance corpus of `@mmd-toolkit/tests`, run
  through ESLint: a rejected input is reported at the place of the parser's
  error; for an accepted one, ESLint visits the nodes in the order of
  `traverseNodes`, and its lines, columns, and parents agree with the tree.
- `tests/snapshot.test.ts`: Snapshots of where ESLint sees the nodes, tokens,
  and comments of some inputs of the corpus.
- `tests/token-store.test.ts`: The token methods of the source code, on the
  inputs of `tests/language-inputs.ts` that the parser accepts, against answers
  computed from the ranges of the tree: the tokens and comments inside, before,
  and after each node, and whether whitespace lies between two tokens.
- `tests/inline-config.test.ts`: Snapshots of the comments that configure ESLint
  (`%% eslint-disable…`, `%% eslint <rule>: <config>`), with the inputs of
  `tests/fixtures/inline-config/`.
- `tests/markdown.test.ts`: The `mermaid` and `mmd` code blocks of
  `tests/fixtures/markdown/`, linted through the processor of
  `@eslint/markdown`: the reports are at the places of the Markdown file.
- `tests/diagram-rules.test.ts`: The selectors that each rule registers, all of
  which must be node types of the diagram type of the rule.
- `tests/subgraph-ids.test.ts`: `subgraphIdsOf` of `src/utils/subgraph-ids.ts`,
  the Db id of each subgraph derived from the tree, against the Db that
  mermaid.js gave for the corpus fixtures that hold the claims about the id (the
  test names each).
- `tests/text-nodes.test.ts`: `TEXT_NODE_TYPES` of `src/utils/text-nodes.ts`,
  the node types whose text can hold a line of only `%%`. Every leaf node type
  of the flowchart in the parser is in the list, an arrow, or without a text,
  and the specification gives a text to the first two kinds and none to the
  last.
- `tests/rule-cases.test.ts`: The examples of every rule document, as
  `tests/rule-cases.ts` reads them: each document has incorrect and correct
  examples, and the parser accepts each one.
- `tests/rules/<rule>.test.ts`: Each implemented rule, through
  `testRule(name, rule)` of `tests/rule-test.ts`: eslint-snapshot-rule-tester on
  the examples of its English document and the inputs of its fixture directory.
  Incorrect examples and `invalid/` inputs must report; correct examples and
  `valid/` inputs must not. The snapshots record each report and the text that
  each suggestion produces. Inputs with a character that `pnpm run lint:chars`
  checks for (U+2028, U+2029, a lone carriage return, U+00A0, and the like) use
  ESLint's `RuleTester`, with the input and each suggestion's expected output
  written as template literals with escapes in the test source.

The tests of the language do not run on the whole corpus, which holds one input
for each claim of the specification and is tested one by one by the parser and
the corpus tests. `tests/language-inputs.ts` lists the fixtures that they run
on, each for one case that the language treats on its own: the diagram that the
parser reads, a text that it rejects, the line terminators that the positions
count, a byte order mark, frontmatter, and the parts of the text that are not
nodes (a directive, a comment of each mark, a token that spans lines, an ignored
`;`, a fragment of a string). The test checks that each fixture is a case of its
kind. To cover another case, add the fixture with the case that it answers; do
not add inputs of a case that is covered.

Tests of rules use eslint-snapshot-rule-tester (see [Snapshots](#snapshots)).
The tests of the language use it where a snapshot shows the result best.

The rules in the tests of the language only observe: they report what ESLint
gives them, so that the tests show what a rule of the plugin will see. They are
not rules of the plugin. These tests, and the tests of the rules, start from
`LANGUAGE_CONFIG` of `tests/helpers.ts`: the recommended configuration without
its rules, so that the rules that it enables add no reports of their own.

## The fixtures of the rules

The inputs of the tests of a rule are in its fixture directory,
`tests/fixtures/rules/<name>/`, laid out as in ota-meshi's ESLint plugins, which
use the same tester: each `<case>-input.mmd` under `valid/` or `invalid/` is a
case, also in a subdirectory, and a file or a directory whose name starts with
`_` is not. The name of the file says what the case is for.

- The input files belong to the rule tests; they need no matching corpus
  fixture. Put each input under `valid/` or `invalid/`, optionally in a
  subdirectory such as `flowchart/`, and name it after its case.
- No fixture file holds a character that `pnpm run lint:chars` checks for (the
  list is in [`packages/spec/docs/index.md`](../../spec/docs/index.md)). Inputs
  with such a character are written in the test source with an escape (`\u2028`,
  `\u2029`, `\u00a0`, or `\r` for a lone carriage return) and tested with
  ESLint's `RuleTester`. Use template literals for `code` and each suggestion's
  `output`, preserving the input's line terminators.
- The common directive rule keeps its named corpus inputs in the `INVALID` and
  `VALID` tables, which its test passes to `testRule` as its corpus cases, so it
  has no fixture directory; its inputs that need escapes use `RuleTester`.

The examples of the rule document are cases too, read from the document; they
are not copied into the directory.

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
  `\r` uses `RuleTester` in a rule test; `tests/language.test.ts` checks its
  positions.
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
`src/rules/<name>.ts` for each rule, where the name of a rule of a diagram type
starts with the diagram (`flowchart-no-ignored-text`). Each file exports one
rule, named after the file in camel case (`flowchartNoIgnoredText` in
`flowchart-no-ignored-text.ts`). Its name in the plugin is the name of its file
without `.ts`, its id is that name after the namespace
(`@mmd-toolkit/flowchart-no-ignored-text`), and its documents are
`docs/rules/<name>.md` and `docs/rules/<name>.ja.md`. The notes for implementing
a rule, how the tree shows what it reports and the fixtures that record it, are
kept apart from the documents for its users, in `docs/rule-notes/<name>.md` and
`docs/rule-notes/<name>.ja.md`.

A rule is either implemented or a skeleton, and three facts say which; they
change together when the rule is implemented:

| Fact                         | Implemented | Skeleton                 |
| ---------------------------- | ----------- | ------------------------ |
| `meta.messages`              | not empty   | empty                    |
| `tests/rules/<name>.test.ts` | exists      | does not exist           |
| `docs/rule-notes/<name>.md`  | removed     | exists in both languages |

No one of them decides alone: `check:docs` fails when the facts of a rule
disagree.

A rule is in the `recommended` configuration when its reports are nearly always
mistakes to fix: wherever it reports, mermaid.js reads the text differently from
what the author meant, no way of writing that an author means is reported, and
the fix is clear. A rule that relies on behavior of mermaid.js that a fix under
way would change is left out of it. The index says only which rules the
configuration enables, with the ✅ of its list.

The document of a common rule has an item for each diagram type that the parser
supports; the skill `eslint-plugin` sets the form of the item and the steps.

The namespace is `@mmd-toolkit`, the scope of the package: ESLint splits an id
that starts with `@` into the plugin and the rule at its last `/`, so
`@mmd-toolkit/flowchart-no-ignored-text` is the rule `flowchart-no-ignored-text`
of the plugin `@mmd-toolkit`. The name of a rule holds no `/`, which is why the
diagram of a rule is a prefix of its name and not a directory in its id.

The rules hold what the documents list: `meta.docs.description` is the English
description, and `meta.docs.recommended` says whether the `recommended`
configuration enables the rule. Two commands keep the files that come from the
rules up to date:

```sh
pnpm --filter @mmd-toolkit/eslint-plugin run update
pnpm --filter @mmd-toolkit/eslint-plugin run check:docs
```

`update` writes `src/rules/index.ts`, the list of the rules, from the rule files
(`tools/update-rules.ts`), and then the generated parts of the documents
(`tools/update-docs.ts`):

- In `docs/rules/index.md` and `index.ja.md`, everything between
  `<!-- begin auto-generated rules list -->` and
  `<!-- end auto-generated rules list -->`: a table of the rules for the common
  rules and for each diagram type, with the description, a ✅ for the rules that
  the `recommended` configuration enables, a 💡 for the rules that offer
  suggestions (`meta.hasSuggestions`), and a 🚧 for the skeletons. The English
  description is `meta.docs.description`; the Japanese one is the first
  paragraph of the Japanese document.
- In each rule document, in both languages, the title (`# @mmd-toolkit/<name>`),
  and everything between `<!-- begin auto-generated rule notice -->` and
  `<!-- end auto-generated rule notice -->` after the first paragraph: whether
  the `recommended` configuration enables the rule, and whether it offers
  suggestions.
- In the document of an implemented rule, in both languages, everything between
  `<!-- begin auto-generated rule resources -->` and
  `<!-- end auto-generated rule resources -->` at its end: the Resources
  section, with links to the source and the test of the rule. The document of a
  skeleton has none.

Every `mmd` code block in a rule document starts with
`%% eslint @mmd-toolkit/<name>: error`, where `<name>` is the name of the rule,
such as `flowchart-no-undef`. Put it on its own line without indentation, before
the diagram header and any Mermaid directives. Include it in correct examples
too: the documentation site's `twoslash-eslint` renderer uses the comment to
enable that rule and show actual diagnostics. Parser acceptance and site
rendering checks include this line. The snapshot test helper removes only this
comment: its tester enables the rule under `rule-to-test/`, so enabling it under
`@mmd-toolkit/` too would duplicate every report. When comparing an example with
its formatted corpus fixture, remove only this leading configuration comment; do
not add it to the fixture itself.

The rest of the documents is written by hand. `check:docs` writes nothing and
fails when `src/rules/index.ts` or a generated part is out of date, when a rule
has no document in one of the languages, when a document or notes belong to no
rule, when the first paragraph of an English document is not
`meta.docs.description` of its rule, when the `mmd` code blocks of a Japanese
document are not those of the English one, in the same order, when a code block
does not start with its rule's enabling comment, or when a rule is neither
implemented nor a skeleton. Line breaks inside a first paragraph do not matter.

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
   document is `meta.docs.description`, word for word. Begin every `mmd` example
   with the rule-enabling comment described above.
3. Write its notes in both languages.
4. Run `update`, then `check:docs`.

To implement a rule, give it its messages and its handlers, add its test, and
remove its notes, in the same change; the fixtures of the notes go into the
fixture directory of the rule. Then run `update`: it writes the Resources
section of its documents and removes its 🚧 from the index.

To rename a rule, rename its file, the argument of `ruleDocsUrl` in it, its
documents, and its notes or its test together, update its id in every example's
ESLint comment, and run `update`. To remove a rule, remove its file, its
documents, and its notes or its test, and run `update`. To change the
description of a rule, change `meta.docs.description` and the first paragraph of
the English document to the same sentence, change the first paragraph of the
Japanese document, and run `update`.

## Writing a rule

These choices hold for every rule, so that the rules read alike:

- A rule of a diagram type has handlers only for the node types of its diagram
  type, so that ESLint never calls it on another diagram; a rule that reads the
  tokens or the comments does so from the handler of the diagram node, such as
  `FlowchartDiagram`, not from `Root`. `tests/diagram-rules.test.ts` checks it.
- A rule reads the tree and the tokens, and the values of nodes and tokens; it
  does not lex the text again.
- The id of a message is a word in camel case for what is reported (`unclosed`,
  `duplicate`); a rule that reports two kinds of things has a message for each.
  The message says in one sentence how mermaid.js reads the text, and takes
  values through `data` (`{{line}}`).
- A rule reports the node that its document names. What is not a node, such as a
  directive or a token, is reported at its `loc`; a part of the value of a
  token, at a `loc` from `sourceCode.getLocFromIndex`. Something that runs to
  the end of the text, such as an unclosed block, is reported where it opens.
- A rule has no fix. The document of a rule says whether it has options; the
  rule-ideas skill decides whether a rule has an option. A rule offers
  suggestions only as the rule-ideas skill decides (`meta.hasSuggestions`), and
  each suggestion says how mermaid.js reads the text after it is applied. The
  suggestions are built in functions of their own, apart from `create`, which
  passes what they return to `context.report`. A suggestion that removes a
  statement or a token removes the range that `removalRange` of
  `src/utils/removal.ts` gives: the element, and the whitespace or the line
  around it, so that no blank space is left. A `;` after the element is not
  removed: it is the separator of the statement before it, or an empty statement
  of its own, which is a member in a subgraph. The one exception is the `;` that
  mermaid.js ignores (an `IgnoredSemicolon` token, by the rule of `style` and
  `classDef` lines): `oneOfTwoRemovals` removes it with the statement that it
  follows.
- The snapshot test of a rule is one call of `testRule(name, rule)`. It checks
  the reports and suggestions on the examples of the English document and the
  inputs of the rule's fixture directory. A rule test does not run mermaid.js.
  Use ESLint's `RuleTester` for inputs with a character that
  `pnpm run lint:chars` checks for (U+2028, U+2029, a lone carriage return,
  U+00A0, and the like): write the input as a template literal with escapes in
  `code`, list the expected reports in `errors`, and write the full expected
  text of each suggestion as a template literal in `output`. The fixture files
  and snapshots of ordinary inputs remain the main cases of the rule.

## Types for rules

`MermaidRuleDefinition` and `MermaidRuleVisitor` type a rule for Mermaid text:
the handler of a node type gets the node of that type and its parent.

```ts
import type { MermaidRuleDefinition } from "@mmd-toolkit/eslint-plugin"

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

# Development

Japanese version: [development.ja.md](./development.ja.md)

How the plugin is tested, and how to add and update formatting examples. The
plugin reads diagrams with [`@mmd-toolkit/parser`](../../parser), and checks its
output against mermaid.js with the helpers of
[`@mmd-toolkit/tests`](../../tests).

## Running the tests

```sh
pnpm vitest run --project prettier-plugin-mmd
```

The tests import the sources of `@mmd-toolkit/parser` and `@mmd-toolkit/tests`,
not their builds (see `vitest.config.ts`), so they need no build step. A script
run with Node that imports the plugin's sources gets those packages from their
builds in `lib/`, so rebuild them before running one:
`pnpm --filter @mmd-toolkit/parser run build` and
`pnpm --filter @mmd-toolkit/tests run build`.

## The tests

| File                                        | What it checks                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/plugin.test.ts`                      | The language, parser, and printer that the plugin declares.                                                                                                                                                                                                                                                                                                       |
| `tests/dispatch.test.ts`                    | Each diagram body goes to the printer of its type; diagram types without a printer, and types the parser does not support, are printed unchanged, in files and in Markdown.                                                                                                                                                                                       |
| `tests/failure.test.ts`                     | Input that the parser rejects is reported as a syntax error in a file and left to Prettier in Markdown; the byte order mark limitation.                                                                                                                                                                                                                           |
| `tests/markdown.test.ts`                    | Which Markdown code blocks reach the plugin, with a stand-in parser.                                                                                                                                                                                                                                                                                              |
| `tests/markdown-flowchart.test.ts`          | Flowcharts formatted inside Markdown code blocks: at the top level, in list items, in block quotes, and the whitespace at the end of lines.                                                                                                                                                                                                                       |
| `tests/markdown-sequence.test.ts`           | Sequence diagrams formatted inside Markdown code blocks: at the top level, in list items, and the whitespace at the end of a title.                                                                                                                                                                                                                               |
| `tests/markdown-class.test.ts`              | Class diagrams formatted inside Markdown code blocks: at the top level, in list items, and a line of one space after a comment.                                                                                                                                                                                                                                   |
| `tests/markdown-state.test.ts`              | State diagrams formatted inside Markdown code blocks: at the top level and in list items.                                                                                                                                                                                                                                                                         |
| `tests/line-separators.test.ts`             | State and sequence diagrams with U+2028 or U+2029 that are kept as written. The characters are written as escapes.                                                                                                                                                                                                                                                |
| `tests/format.test.ts`                      | Each formatting fixture: the input formats to the output, formatting the output changes nothing, and mermaid.js reads the same diagram from both (see [Readings of mermaid.js](#readings-of-mermaidjs)).                                                                                                                                                          |
| `tests/corpus.test.ts`                      | Every input of the conformance corpus of `@mmd-toolkit/tests`, common, flowchart, sequence, class, and state, that the plugin formats: formatting again changes nothing, and mermaid.js reads the same diagram before and after, or rejects both with the same error.                                                                                             |
| `tests/docs.test.ts`                        | The rules documents and the READMEs agree with the fixtures (see [Documents and fixtures](#documents-and-fixtures)).                                                                                                                                                                                                                                              |
| `tests/value-nodes.test.ts`                 | For each diagram type with a printer, every node type of it without child fields, its own and the shared leaf nodes, is either a value, printed as written, or listed as an exception, so that a node type added to the tree is placed on purpose.                                                                                                                |
| `tests/source.test.ts`                      | Which tokens the printers take for tokens of a node's structure: not the directives, the `;` tokens, or the tokens of the frontmatter, whose `---` delimiters have the kind and value of a flowchart arrow.                                                                                                                                                       |
| `tests/regression.test.ts`                  | The inputs of failures that were found and fixed (`tests/regression/*.json`), formatted on every run. U+2028 and U+2029 are written as escapes.                                                                                                                                                                                                                   |
| `tests/boundaries-<diagram>.test.ts`        | The fixtures of the corpus of a diagram type with text inserted at a token boundary, chosen by the kind of the boundary (the element before it, its place in the line, the element after it; the statement keyword at the end of a line): a directive, two directives, line breaks, a comment after the text, a U+2028 or U+2029, a directive that is not closed. |
| `tests/statement-endings-<diagram>.test.ts` | A statement of every kind of a diagram type (the statement node types of the parser), taken from the fixtures, with sequences of the same pieces at the end of its first line, alone and followed by a line.                                                                                                                                                      |
| `tests/forms-<diagram>.test.ts`             | Statements of many forms, the axes of a form combined so that every pair of values of two axes stands together (`tests/pairwise.ts`): class relations, members, and class statements; sequence messages; state transitions, statements, aliases, and notes; flowchart labels with punctuation at their ends.                                                      |
| `tests/separators.test.ts`                  | Statements that a `;` separates or ends: every pair of statements, a statement that ends with a word, a text with a `;` written in it, lines that hold a `;` of their own, a `;` after a comment, a subgraph name that ends with a word, and empty description blocks before a separator.                                                                         |
| `tests/line-shapes.test.ts`                 | The shapes of a line: endings of a value, a directive cutting a statement, a statement that goes on over a line break, a click statement over several lines, a style line that stands after U+2028 or U+2029, and comment lines after U+2028 or U+2029 at the end of a statement (the lines that mermaid.js reads as one).                                        |
| `tests/mutation.test.ts`                    | Mutants of the fixtures of the corpus, made by `mutate()`: one fixture in three of each kind of fixture, seed 1.                                                                                                                                                                                                                                                  |
| `tests/sequence-newline-units.test.ts`      | The sequence statements that need a `newline` unit, with directives, whitespace, and a `;` after them.                                                                                                                                                                                                                                                            |
| `tests/pairwise.test.ts`                    | The pairwise rows that the forms are made of.                                                                                                                                                                                                                                                                                                                     |

The `boundaries-`, `statement-endings-`, `forms-`, `separators`, `line-shapes`,
`mutation`, and `sequence-newline-units` tests make their inputs mechanically,
and check them with `tests/generated.ts`. For each input that the parser
accepts, formatting must not throw, and formatting the output must change
nothing; when mermaid.js accepts the input too, it must read the same diagram
from the output (see [Readings of mermaid.js](#readings-of-mermaidjs)). The
inputs are chosen by kind, and the same way on every run, so that every kind of
boundary and of statement is tried, and none by chance; the kinds of the
boundaries are defined by `findBoundaries` and `selectByKey` of
`@mmd-toolkit/tests`. `tests/regression.test.ts` holds the inputs of failures
that were found and fixed, and checks them on every run.

### Readings of mermaid.js

The tests that compare what mermaid.js reads before and after formatting do it
in two ways, with `tests/mermaid-readings.ts`:

- as the specification reads the text: mermaid.js runs without the known
  divergences that change how it reads an accepted text,
  `comment-takes-character`, `comment-takes-line-break`, and
  `name-start-reads-unit` (`withoutDivergences` of
  `runMermaidWithEmbeddedData`), and the Db must be the same, or both texts must
  be rejected with the same error. The Db that formatting must keep is the one
  of the specification, which differs from mermaid.js only where a known
  divergence says so;
- as mermaid.js is: where it accepts the text before formatting, it must accept
  the text after formatting with the same Db, so that formatting does not change
  what mermaid.js draws.

## How the printer is built

- Comments and directives are printed from the source between the things the
  printers print, not attached to nodes with Prettier's comment mechanism
  (`canAttachComment`, `printComment`). A directive can lie inside a name or
  touch a token without whitespace, and a comment can lie inside a statement
  written over several lines; attached to a node, they would move. Prettier
  reads `comments` on the top node and throws for every comment that its
  mechanism did not print, so the tree is wrapped in a `FormattedDocument` node
  (`src/parser.ts`).
- What every diagram type shares is printed by shared modules: `root.ts` (the
  frontmatter and what stands before the diagram), `blocks.ts` (the statements
  of a block, the comments and directives between them, the `;` that separate
  them, empty lines, and the lines that close a block), `atoms.ts` and
  `layout.ts` (a statement as atoms with the gaps between them), `gap.ts`, and
  `lines.ts`. Each diagram type has a printer (`flowchart.ts`, `sequence.ts`,
  `class.ts`, `state.ts`), a layout of its statements (`flowchart-layout.ts`,
  `sequence-layout.ts`, `class-layout.ts`, `state-layout.ts`), and its kept
  lines (`flowchart-kept-lines.ts`, `sequence-kept-lines.ts`,
  `class-kept-lines.ts`, `state-kept-lines.ts`, on top of `kept-lines.ts`), and
  gives `blocks.ts` its `BlockRules`: its kept lines, where a statement's
  printed text ends, which statements hold statements, which statements are
  dropped at the top level, and whether a line of only whitespace after a
  comment is kept.
- The rules come from the tree, with explicit rules for the lexical facts that
  the tree does not show, each pointing to the section of the specification. The
  printer does not parse its result again to check it at run time: such a check
  would hide a missing rule instead of being one. The generated-input tests find
  missing rules.

## Formatting fixtures

The fixtures show the formatting itself. They live under
`tests/fixtures/<diagram>/<rule>/`, one folder per formatting rule. Each example
is a set of files:

- `<example>-input.mmd`: the text before formatting.
- `<example>-output.mmd`: the formatted text.
- `<example>-options.json`: the Prettier options, when the example needs any.

A file that belongs to no example, or an output or options file without its
input, fails the tests, so that a renamed input does not leave a stale output
behind. `tests/fixtures/.gitattributes` and `.editorconfig` keep the files byte
for byte, trailing whitespace included.

A text with invisible characters, such as U+2028 and U+2029, is not a fixture
here: it is written with escapes in test code (`tests/line-separators.test.ts`),
because an editor offers to remove such characters each time it opens a file
that holds them. Only the fixtures of the conformance corpus, in
`packages/tests/fixtures/`, hold them as they are.

To add an example, write its input, then write the outputs:

```sh
pnpm --filter prettier-plugin-mmd run test:update
```

The command builds the parser and writes every output that differs from the
formatted input. Read the changed outputs as a diff before you keep them: the
tests check that an output is stable and that mermaid.js reads the same diagram,
not that the formatting is the intended one.

## Documents and fixtures

Each `###` heading of a rules document, [docs/flowchart.md](./flowchart.md),
[docs/sequence.md](./sequence.md), [docs/class.md](./class.md), and
[docs/state.md](./state.md), is a rule, and its fixture folder, under the folder
of the diagram type, is the heading in lower case with spaces replaced by `-`:
"Arrow spacing" is `arrow-spacing`. An example in a document is a line that ends
with a link to a fixture file and `:`, then an empty line and an `mmd` code
block with the content of the file. `tests/docs.test.ts` checks that:

- the rules of each rules document are the fixture folders of its diagram type;
- each example links to a file of its rule's folder;
- the Japanese version of each rules document has the same examples under the
  same rules, and `README.ja.md` the same examples as `README.md`;
- each example block equals the file it links to.

When a fixture changes, copy the new content into the documents that show it.

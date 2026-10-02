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

| File                                        | What it checks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/plugin.test.ts`                      | The language, parser, and printer that the plugin declares.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tests/dispatch.test.ts`                    | Each diagram body goes to the printer of its type; diagram types without a printer, and types the parser does not support, are printed unchanged, in files and in Markdown.                                                                                                                                                                                                                                                                                                                                              |
| `tests/failure.test.ts`                     | Input that the parser rejects is reported as a syntax error in a file and left to Prettier in Markdown; the byte order mark limitation.                                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown.test.ts`                    | Which Markdown code blocks reach the plugin, with a stand-in parser.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/markdown-flowchart.test.ts`          | Flowcharts formatted inside Markdown code blocks: at the top level, in list items, in block quotes, and the whitespace at the end of lines.                                                                                                                                                                                                                                                                                                                                                                              |
| `tests/markdown-sequence.test.ts`           | Sequence diagrams formatted inside Markdown code blocks: at the top level, in list items, and the whitespace at the end of a title.                                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/markdown-class.test.ts`              | Class diagrams formatted inside Markdown code blocks: at the top level, in list items, and a line of one space after a comment.                                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/format.test.ts`                      | Each formatting fixture: the input formats to the output, formatting the output changes nothing, and mermaid.js reads the same diagram from both (see [Readings of mermaid.js](#readings-of-mermaidjs)).                                                                                                                                                                                                                                                                                                                 |
| `tests/corpus.test.ts`                      | Every input of the conformance corpus of `@mmd-toolkit/tests`, common, flowchart, sequence, and class, that the plugin formats: formatting again changes nothing, and mermaid.js reads the same diagram before and after, or rejects both with the same error.                                                                                                                                                                                                                                                           |
| `tests/docs.test.ts`                        | The rules documents and the READMEs agree with the fixtures (see [Documents and fixtures](#documents-and-fixtures)).                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/value-nodes.test.ts`                 | For each diagram type with a printer, every node type of it without child fields, its own and the shared leaf nodes, is either a value, printed as written, or listed as an exception, so that a node type added to the tree is placed on purpose.                                                                                                                                                                                                                                                                       |
| `tests/source.test.ts`                      | Which tokens the printers take for tokens of a node's structure: not the directives, the `;` tokens, or the tokens of the frontmatter, whose `---` delimiters have the kind and value of a flowchart arrow.                                                                                                                                                                                                                                                                                                              |
| `tests/generated-mutation.test.ts`          | Mutants of the flowchart, sequence, and class fixtures of the corpus, made by `mutate()`: 4 per fixture, seed 1.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tests/generated-label-edges.test.ts`       | Labels that start or end with ASCII punctuation next to whitespace, in every kind of bracket.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/generated-insertions.test.ts`        | The flowchart, sequence, and class fixtures of the corpus with text inserted at a token boundary: a directive, with whitespace on either side, both, or neither; two directives, touching or not; a line break, an empty line, or a comment line; a comment after the text of a line, and lines of only whitespace; after the last token, a directive that is not closed, with whitespace and line breaks after it; and, in flowcharts, a `;` on a `style`, `classDef`, or `linkStyle` line. Every 64th usable boundary. |
| `tests/generated-line-semicolons.test.ts`   | Lines that hold a `;` of their own, in labels, strings, and accessibility statements, with or without `style`, alone or with another statement on the line.                                                                                                                                                                                                                                                                                                                                                              |
| `tests/generated-statement-pairs.test.ts`   | Two statements of every kind, and words that start statements used as ids, joined by `;`, at the top level and inside a block, for flowchart and sequence. A class diagram has no `;` that separates statements.                                                                                                                                                                                                                                                                                                         |
| `tests/generated-sequence-messages.test.ts` | Sequence messages of many forms: ids with whitespace, `-`, `/`, parentheses, `#`, or the form of a number, and ids spelled as a keyword or near the form of a number, on either side of the arrow; every arrow; `()`, `+`, and `-` next to the arrow; whitespace on either side of the arrow or none; and texts that start with `%%` or a wrap prefix.                                                                                                                                                                   |
| `tests/generated-class-forms.test.ts`       | Class statements of many forms: relations between names of every form, with every arrow, whitespace around and inside the arrow or none, cardinalities, and labels, among them labels of only whitespace and labels on a line that holds a `;`; member statements; and class statements with a label, a CSS class or an annotation, a generic type, and member bodies, at the top level and in a namespace.                                                                                                              |

The `generated-` tests make their inputs mechanically, and check them with
`tests/generated.ts`. For each input that the parser accepts, formatting must
not throw, and formatting the output must change nothing; when mermaid.js
accepts the input too, it must read the same diagram from the output (see
[Readings of mermaid.js](#readings-of-mermaidjs)). The tests choose their inputs
the same way on every run, and together take several minutes.

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

### Larger runs

Two environment variables set the size of the generated-input tests, so that a
larger check does not edit the tests. `tests/generated.ts` reads them, and
throws when one is set to anything but a positive integer.

| Variable                     | Default | Meaning                                            |
| ---------------------------- | ------- | -------------------------------------------------- |
| `MMD_GENERATED_SAMPLE_EVERY` | 64      | The insertion tests take every n-th token boundary |
| `MMD_MUTANTS_PER_FIXTURE`    | 4       | The mutation test makes n mutants of each fixture  |

With `MMD_GENERATED_SAMPLE_EVERY` set to 1, the insertion tests take every token
boundary, which takes a few hours; the time limits of the tests grow with the
size. Each test records its counts as an annotation, which the verbose reporter
shows:

```sh
MMD_GENERATED_SAMPLE_EVERY=1 MMD_MUTANTS_PER_FIXTURE=30 pnpm vitest run --project prettier-plugin-mmd tests/generated- --reporter=verbose
```

Run it in the background, and run it again after a change to the code: a run
that started before the change checks the code as it was then.

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
  `class.ts`), a layout of its statements (`flowchart-layout.ts`,
  `sequence-layout.ts`, `class-layout.ts`), and its kept lines
  (`flowchart-kept-lines.ts`, `sequence-kept-lines.ts`, `class-kept-lines.ts`,
  on top of `kept-lines.ts`), and gives `blocks.ts` its `BlockRules`: its kept
  lines, where a statement's printed text ends, which statements hold
  statements, which statements are dropped at the top level, and whether a line
  of only whitespace after a comment is kept.
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
[docs/sequence.md](./sequence.md), and [docs/class.md](./class.md), is a rule,
and its fixture folder, under the folder of the diagram type, is the heading in
lower case with spaces replaced by `-`: "Arrow spacing" is `arrow-spacing`. An
example in a document is a line that ends with a link to a fixture file and `:`,
then an empty line and an `mmd` code block with the content of the file.
`tests/docs.test.ts` checks that:

- the rules of each rules document are the fixture folders of its diagram type;
- each example links to a file of its rule's folder;
- the Japanese version of each rules document has the same examples under the
  same rules, and `README.ja.md` the same examples as `README.md`;
- each example block equals the file it links to.

When a fixture changes, copy the new content into the documents that show it.

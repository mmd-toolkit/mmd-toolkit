# Development

Japanese version: [development.ja.md](./development.ja.md)

How the plugin is tested, and how to add and update formatting examples. The
plugin reads diagrams with [`@mmd-toolkit/parser`](../../parser), and checks its
output without running mermaid.js: it builds the Db that the tree of a text
denotes, with the helpers of [`@mmd-toolkit/tests`](../../tests), and compares
it.

## Running the tests

```sh
pnpm vitest run --project prettier-plugin-mmd
```

This runs the formatting fixtures, the corpus, and the unit tests. The run takes
about ten seconds.

The tests import the sources of `@mmd-toolkit/parser` and `@mmd-toolkit/tests`,
not their builds (see `vitest.config.ts`), so they need no build step. A script
run with Node that imports the plugin's sources gets those packages from their
builds in `lib/`, so rebuild them before running one:
`pnpm --filter @mmd-toolkit/parser run build` and
`pnpm --filter @mmd-toolkit/tests run build`.

## The tests

| File                                 | What it checks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/plugin.test.ts`               | The language, parser, and printer that the plugin declares.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tests/dispatch.test.ts`             | Each diagram body goes to the printer of its type; diagram types without a printer, and types the parser does not support, are printed unchanged, in files and in Markdown.                                                                                                                                                                                                                                                                                                                              |
| `tests/failure.test.ts`              | Input that the parser rejects is reported as a syntax error in a file and left to Prettier in Markdown; the byte order mark limitation.                                                                                                                                                                                                                                                                                                                                                                  |
| `tests/markdown.test.ts`             | Which Markdown code blocks reach the plugin, with a stand-in parser.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/markdown-flowchart.test.ts`   | Flowcharts formatted inside Markdown code blocks: at the top level, in list items, in block quotes, and the whitespace at the end of lines.                                                                                                                                                                                                                                                                                                                                                              |
| `tests/markdown-sequence.test.ts`    | Sequence diagrams formatted inside Markdown code blocks: at the top level, in list items, and the whitespace at the end of a title.                                                                                                                                                                                                                                                                                                                                                                      |
| `tests/markdown-class.test.ts`       | Class diagrams formatted inside Markdown code blocks: at the top level, in list items, and a line of one space after a comment.                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/markdown-state.test.ts`       | State diagrams formatted inside Markdown code blocks: at the top level and in list items.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tests/markdown-er.test.ts`          | ER diagrams formatted inside Markdown code blocks: at the top level, in list items, and an `accTitle` that holds a direction.                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/markdown-gantt.test.ts`       | Gantt charts formatted inside Markdown code blocks: at the top level, in list items, and a task whose data is whitespace only.                                                                                                                                                                                                                                                                                                                                                                           |
| `tests/markdown-journey.test.ts`     | User journeys formatted inside Markdown code blocks: at the top level, in list items, and a task whose data is whitespace only.                                                                                                                                                                                                                                                                                                                                                                          |
| `tests/markdown-mindmap.test.ts`     | Mindmaps formatted inside Markdown code blocks: at the top level, in list items, and the whitespace at the end of a node text.                                                                                                                                                                                                                                                                                                                                                                           |
| `tests/markdown-sankey.test.ts`      | Sankey diagrams formatted inside Markdown code blocks: at the top level, in list items, and a value of spaces only before another record.                                                                                                                                                                                                                                                                                                                                                                |
| `tests/markdown-timeline.test.ts`    | Timelines formatted inside Markdown code blocks: at the top level, in list items, and the whitespace at the end of an event.                                                                                                                                                                                                                                                                                                                                                                             |
| `tests/markdown-requirement.test.ts` | Requirement diagrams formatted inside Markdown code blocks: at the top level, in list items, and a statement that a comment line splits from the line before it.                                                                                                                                                                                                                                                                                                                                         |
| `tests/markdown-xychart.test.ts`     | XY charts formatted inside Markdown code blocks: at the top level, in list items, and a description block that is not closed.                                                                                                                                                                                                                                                                                                                                                                            |
| `tests/line-separators.test.ts`      | State, sequence, ER, Gantt, journey, requirement, mindmap, timeline, and XY chart diagrams with U+2028 or U+2029 that are kept as written or end a comment, Gantt, journey, requirement, mindmap, timeline, and XY chart diagrams with U+00A0, U+3000, or U+FEFF, and sankey diagrams with such characters at the end of the text. The characters are written as escapes.                                                                                                                                |
| `tests/line-terminators.test.ts`     | Diagrams whose lines end with `\r\n` or a lone `\r`: they are formatted as with line feeds, and printed with the line ending of the options. The characters are written as escapes.                                                                                                                                                                                                                                                                                                                      |
| `tests/format.test.ts`               | Each formatting fixture: the input formats to the output, formatting the output changes nothing, the Db that the tree denotes is the same for both, and the embedded data is as written (see [What the tests keep](#what-the-tests-keep)).                                                                                                                                                                                                                                                               |
| `tests/corpus.test.ts`               | Every input of the conformance corpus of `@mmd-toolkit/tests`, common, flowchart, sequence, class, state, ER, Gantt, journey, requirement, mindmap, timeline, sankey, and XY chart, that the plugin formats: formatting again changes nothing, the embedded data is as written, and the Db that the tree of the output denotes is the Db that the corpus records for the input (see [What the tests keep](#what-the-tests-keep)); and every input that the parser rejects is reported as a syntax error. |
| `tests/docs.test.ts`                 | The rules documents and the READMEs agree with the fixtures (see [Documents and fixtures](#documents-and-fixtures)).                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/value-nodes.test.ts`          | For each diagram type with a printer, every node type of it without child fields, its own and the shared leaf nodes, is either a value, printed as written, or listed as an exception, so that a node type added to the tree is placed on purpose.                                                                                                                                                                                                                                                       |
| `tests/source.test.ts`               | Which tokens the printers take for tokens of a node's structure: not the directives, the `;` tokens, or the tokens of the frontmatter, whose `---` delimiters have the kind and value of a flowchart arrow.                                                                                                                                                                                                                                                                                              |
| `tests/sequence-layout.test.ts`      | Which ids the sequence printer takes for ids that a following space would make another unit: the numbers and `title`, next to which no space is put around an arrow.                                                                                                                                                                                                                                                                                                                                     |

### What the tests keep

Formatting must be idempotent and must not change the Db. The Db is not read
from mermaid.js: `dbOfText` of `tests/db-reading.ts` builds it from the tree of
a text with `dbFromTree` of `@mmd-toolkit/tests`, with the values that
mermaid.js derives from the embedded data of the input (the frontmatter, the
directives, the data blocks). The corpus records them for each fixture
(`embeddedValuesOf`) and the Db of the input (`expected.json`, or
`specified.json` where the specification reads the input differently), so the
corpus test compares the Db of the formatted text with the recorded one. The
other tests have no record: they compare the Db of the formatted text with that
of the input, with the default values.

The values of the embedded data are taken from the input, so the tests check
that formatting keeps the embedded data: `writtenEmbeddedTexts` lists the texts
of the directives and of the data blocks as written, in source order, and the
list is the same before and after, with each line terminator read as a line
feed. The frontmatter is the exception: the printer formats its YAML with
Prettier's YAML formatter where that is safe, so `describeFrontmatterChange`
accepts the frontmatter as written or as that formatter prints it, and relies on
that formatter to keep the value of the YAML; the tests do not read it. Where a
text holds a data block and no effects are given, `dbOfText` gives no Db: what a
data block does to it is what mermaid.js derives, and the text alone does not
give it; the written text of the block is still checked.

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
  `lines.ts`. The gap rules that an ER diagram and a requirement diagram share,
  the lists of classes and names, the direction line, and the accessibility
  statements, are in `statement-rules.ts`, and the check for an `accTitle` that
  keeps the first column in `accessibility-lines.ts`. `paths.ts` narrows the
  path of Prettier to the node type that a printer is at. Each diagram type has
  a printer (`flowchart.ts`, `sequence.ts`, `class.ts`, `state.ts`, `er.ts`,
  `gantt.ts`, `journey.ts`, `requirement.ts`, `mindmap.ts`, `timeline.ts`,
  `sankey.ts`, `xychart.ts`), a layout of its statements (`flowchart-layout.ts`,
  `sequence-layout.ts`, `class-layout.ts`, `state-layout.ts`, `er-layout.ts`,
  `gantt-layout.ts`, `journey-layout.ts`, `requirement-layout.ts`,
  `mindmap-layout.ts`, `timeline-layout.ts`, `sankey-layout.ts`,
  `xychart-layout.ts`), and its kept lines (`flowchart-kept-lines.ts`,
  `sequence-kept-lines.ts`, `class-kept-lines.ts`, `state-kept-lines.ts`,
  `er-kept-lines.ts`, `gantt-kept-lines.ts`, `journey-kept-lines.ts`,
  `requirement-kept-lines.ts`, `mindmap-kept-lines.ts`,
  `timeline-kept-lines.ts`, `sankey-kept-lines.ts`, `xychart-kept-lines.ts`, on
  top of `kept-lines.ts`), and gives `blocks.ts` its `BlockRules`: its kept
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
tests check that an output is stable and keeps the Db, not that the formatting
is the intended one.

## Documents and fixtures

The examples of a rules document are copies of the fixtures, and
`tests/format.test.ts` checks both that the plugin prints each output and that
it keeps the Db and the embedded data (see
[What the tests keep](#what-the-tests-keep)). Each `###` heading of a rules
document, [docs/flowchart.md](./flowchart.md),
[docs/sequence.md](./sequence.md), [docs/class.md](./class.md),
[docs/state.md](./state.md), [docs/er.md](./er.md), [docs/gantt.md](./gantt.md),
[docs/journey.md](./journey.md), [docs/requirement.md](./requirement.md), and
[docs/mindmap.md](./mindmap.md), [docs/timeline.md](./timeline.md),
[docs/sankey.md](./sankey.md), and [docs/xychart.md](./xychart.md), is a rule,
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

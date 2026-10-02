---
name: prettier-plugin
description:
  Add the printer of a diagram type to prettier-plugin-mmd, or update the
  printers after mermaid.js is updated. Use when the parser supports a new
  diagram type and its formatting is to be decided and implemented, or when the
  pinned mermaid.js changes. It covers deciding the formatting choices, the
  printer, the fixtures, the generated-input tests, and the documents.
---

# Adding the printer of a diagram type (prettier-plugin)

How to add the printer of a diagram type to `prettier-plugin-mmd`, and how to
update the printers when mermaid.js is updated. It is written so that the same
work can be done to the same quality from this document alone, without the
conversation history or memory. Policies and criteria are in AGENTS.md; this
document only points to them.

## 1. What to read first

1. In AGENTS.md, the `packages/prettier-plugin-mmd` section (what this package
   is responsible for, and its four tests) and the Principles (the proper form,
   no regular expressions, reading the result of an autofix, invisible
   characters, English and Japanese document pairs, wrapped prose, the info
   string `mmd` for code blocks of Mermaid text, no commits). The criteria
   change, so read them every time.
2. The specification of the diagram type:
   `packages/spec/docs/diagrams/<diagram>.md` (the lexical rules, the grammar,
   how the Db is built) and the tree, `packages/spec/docs/ast.md` and
   `packages/spec/docs/ast/<diagram>.md`. The rules of the printer are written
   with the node types, fields, and token kinds defined there.
3. The documents of this package: `docs/development.md` (the tests, the
   fixtures, and how the printer is built), `docs/<an existing diagram>.md` (for
   example `docs/flowchart.md`: the formatting rules and their reasons; this is
   where decisions are kept, and the model for how items are set up and how
   limits are written), and `docs/compatibility.md` (how differences from
   mermaid.js, and text kept as written, are described).

This procedure writes only to `packages/prettier-plugin-mmd` and this SKILL.
When another package needs a change, make it with that package's SKILL (a gap in
the specification with the spec SKILL, a change of the tree with the parser
SKILL, fixtures with the tests SKILL). Commit and push only when asked
(AGENTS.md). Do not change the staging area or use `git mv`: when the working
tree is shared, what is staged may belong to other work. Move and delete files
with `mv` and `rm`.

## 2. When to start (input)

- The parser implements the diagram type and exports its tree types
  (`packages/parser/src/ast/<diagram>.ts`) and `visitorKeys` (the output of the
  parser SKILL). Write no code that depends on the tree before the tree is
  settled.
- `@mmd-toolkit/tests` has the corpus of the diagram type
  (`packages/tests/fixtures/<diagram>/`) and its Db summary.

## 3. Deciding the formatting

The rules of the printer follow the choices made item by item. Before writing
the printer, make the list of choices and ask for a decision.

1. From the grammar and the tree in the specification, list what formatting
   could change. The kinds of items flowchart had (as examples; a diagram type
   has more or fewer):
   - the indentation unit, and nested indentation
   - statement separators (`;`), several statements on a line, empty lines
   - whitespace between tokens, and around operators such as arrows
   - whitespace inside values (such as the ends of a label), and how a value is
     written (such as the form of a label)
   - wrapping long lines, statements and values written over several lines
   - where comments and directives stand
   - the YAML of the frontmatter
   - what is kept as written (what affects the Db)
2. Give each item its choices, examples (before and after formatting), and a
   recommendation with its reason. Say which choices change the Db.
3. For each choice, run the text before and after formatting through mermaid.js,
   and check that the Db does not change. Do not stop at one or two hand-written
   examples; use the generated inputs of section 6 as well. Attach the results,
   marked as checked by running.
4. Show the list, ask for a decision, and implement the choices that are made.
5. Write each decision into the rules document `docs/<diagram>.md` (English and
   Japanese) as a rule with its reason. Write what is kept as written because it
   affects the Db, and the differences from mermaid.js, into
   `docs/compatibility.md` too. Keep decisions in these two documents only.

## 4. Writing the printer

How it is built (under `src/printers/`):

- Add the body node type of the diagram and its printer to `diagramPrinters` in
  `index.ts`. Dispatch goes by type.
- What every diagram type shares is in shared modules; use them, and do not copy
  them into a diagram's printer. `blocks.ts` prints the statements of a block,
  the comments and directives between them, the `;` that separate them, empty
  lines, and the lines that open and close a block (`printBlock`,
  `printDiagramBlock`, `printClosedBlock`, `openingLine`); `atoms.ts` and
  `layout.ts` build a statement from the pieces that are printed (atoms) and the
  rules of the gaps between them (`printAtoms`, `collectAtoms`,
  `collectValueNodes`, the `accDescr` block); `kept-lines.ts` holds the lines
  that keep a `;` of their own and where a line starts and ends; `source.ts`
  decides which tokens belong to the structure of a node (`isStructural`). When
  a diagram type needs something they do not do, extend them, so that one
  decision stays in one place.
- Each diagram type has its printer (`<diagram>.ts`), which dispatches on its
  node types and gives `blocks.ts` its `BlockRules` (its kept lines, where a
  statement's printed text ends, which statements hold statements, which are
  dropped at the top level, whether a line of only whitespace after a comment is
  kept); the layout of its statements and block headers, with the gap rules of
  its decided items (`<diagram>-layout.ts`); and its kept lines
  (`<diagram>-kept-lines.ts`). `BlockRules` takes the statement type of the
  diagram type, so that its functions need no cast. When the statements of a
  diagram type fall into kinds (blocks with one body, blocks of sections,
  statements that hold no other), decide the kinds in one function whose switch
  lists every statement type, checks each case against the type of its kind, and
  ends with a `satisfies` check that fails when a statement type is not listed
  (`classifySequenceStatement` in `sequence-layout.ts`); everything else asks
  that function, rather than keeping its own list of types.
- Value nodes (`Identifier`, `StringLiteral`, labels, and so on) are printed as
  the text of their ranges. Each diagram type has its list of them
  (`valueNodeTypes` in `flowchart-layout.ts`, `sequenceValueNodeTypes` in
  `sequence-layout.ts`), which `tests/value-nodes.test.ts` ties to the tree
  types of the diagram (those whose names start with its name, and the shared
  leaf nodes). When a new leaf node type is added to them, that test fails;
  decide whether it is a value or an exception, and add it to the list. A new
  diagram type adds its list to that test.
- Gaps (`gap.ts`): comments, directives, and the `;` that the line rule ignores
  between atoms are items, printed as written, and each side of an item keeps
  whether the source has whitespace there. The rules that add or remove
  whitespace apply only to gaps without items. How a gap is read is decided in
  one place, `readGapElement`, which the other scans use too.
- What all diagram types share (the frontmatter, comments and directives before
  the body, the line break at the end of the file, Markdown code blocks) is in
  `root.ts`, `frontmatter-yaml.ts`, `parser.ts`, and `printer.ts`. The printer
  of a diagram prints from the body to the end.

Steps when writing:

1. For each decided item, write the rule so that the tree decides it. Do not lex
   the text of tokens again. Where a lexical fact that is not in the tree is
   needed, find it with the generated tests of section 6, and make it an
   explicit rule with a comment that points to the section of the specification
   (section 5).
2. Do not build a check that parses the formatted result again at run time and
   compares it. It only hides a missing rule; it is not a rule.
3. Keep each decision in one place (for example, where a line starts and ends,
   how a gap is read, which lines are kept). Leave no unwritten promise that
   callers must keep.
4. Read the diff of every autofix such as `eslint --fix`. It may insert empty
   JSDoc or stubs.
5. Comments say what is done and why, and point to the section of the
   specification and to the heading of the rule in the rules document (for
   example `(docs/flowchart.md, Label inner whitespace)`).

## 5. When a rule is added or changed

When a missing rule is found after the decision, by the generated tests or
otherwise, and a rule is added or changed, add the rule, its reason, and an
example to that rule in `docs/<diagram>.md` (and to `docs/compatibility.md` when
needed) in the same change. Show as the result: the wording of the rule, an
input that shows it, mermaid.js's results before and after formatting, and the
reason in the specification. A rule that changes a decided choice needs a
decision before it is implemented; ask for it with that evidence. An
implementation without the document leaves the decision and the code apart.

Write a narrow exception (for example, no space before the closing `?]` or `=]`
of a slanted shape) into the document in the same way.

## 6. Tests

Add these to the four tests of AGENTS.md. How they are built is in
`docs/development.md`.

- Fixtures (`tests/fixtures/<diagram>/<rule>/<example>-input.mmd`,
  `-output.mmd`, and `-options.json` when needed): one folder per rule. Write
  the outputs with `pnpm --filter prettier-plugin-mmd run test:update`, and read
  the diff to check that the formatting is the intended one.
  `tests/format.test.ts` checks the outputs, idempotence, and that mermaid.js
  reads the same Db.
- How mermaid.js's reading is compared (`tests/mermaid-readings.ts`, used by the
  fixture, corpus, and generated-input tests): as the specification reads the
  text, with mermaid.js run without the known divergences that change the
  reading (`withoutDivergences`, all of them in one run), and, where mermaid.js
  as it is accepts the text before formatting, as mermaid.js reads it too: it
  must accept the text after formatting with the same Db. When a diagram type
  brings such a divergence, add it there.
- Unit tests: dispatch, failures, and Markdown code blocks
  (`tests/dispatch.test.ts`, `failure.test.ts`, `markdown.test.ts`,
  `markdown-flowchart.test.ts`). For a new diagram type, add an example that is
  formatted inside Markdown.
- The corpus: `tests/corpus.test.ts` checks idempotence and the Db on every
  fixture of the diagram type in `@mmd-toolkit/tests` that the plugin formats.
  Add the diagram type to what it loads.
- Generated-input tests (`tests/generated.ts` and `tests/generated-*.test.ts`):
  hand-written examples and the corpus alone miss whole families of missing
  rules (in flowchart, missing rules that not one of the 1,426 corpus inputs
  showed were found with generated inputs). Make these for each diagram type;
  the insertion, mutation, and joined-statement tests run over a list of diagram
  types, to which a new diagram type is added with its statements:
  - mutation (`mutate()` of `@mmd-toolkit/tests/mutation`, a few per fixture,
    with a fixed seed)
  - insertion at token boundaries (a directive with whitespace placed in four
    ways, two directives, a line break, an empty line, or a comment line, the
    `;` that the line rule deals with, and, after the last token, a directive
    that is not closed, with whitespace after it)
  - the ends of values (every pair of opening and closing brackets of a label,
    times ASCII punctuation, times placements)
  - joined statements (two statements joined by `;`, of every kind, and with the
    words that start statements used as ids)
  - forms that belong to the diagram type (in flowchart, lines that hold a `;`
    other than a separator; in sequence, messages of many forms; in class,
    relations, member statements, and class statements of many forms)
  - Choose inputs deterministically (a seed, every n-th boundary). Keep the
    regular run to a few minutes; the values that set the size are read from
    environment variables in one place, `tests/generated.ts` (see the full run
    below). Each test records its counts as an annotation with `describeReport`.
- The document test (`tests/docs.test.ts`): the headings of each rules document
  match the fixture folders of its diagram type, and its example code blocks
  match the fixture files. Add a new rules document to `ruleDocuments` there.

Running the tests:

```sh
pnpm vitest run --project prettier-plugin-mmd
```

The full run: the size of the generated-input tests is given from outside with
environment variables (Larger runs in `docs/development.md`). Do not edit the
tests or make copies of them.

```sh
MMD_GENERATED_SAMPLE_EVERY=1 MMD_MUTANTS_PER_FIXTURE=30 pnpm vitest run --project prettier-plugin-mmd tests/generated- --reporter=verbose
```

- It takes hours: run it in the background and wait for it to finish. The counts
  appear in the verbose output as each test's annotation.
- When the code changes, a full run in progress checks the old code. Stop it,
  and run it again after the change.

When the working tree or the machine is shared with other work:

- Under load, a corpus test may fail by going over its 5-second limit. Run that
  test alone again; if it passes, the failure came from the load.
- Workspace lint or tests may fail in a file that other work is editing. Do not
  touch files outside this package; say so in the results.
- To stop a run, stop your own run by its process id. Do not `pkill` by name
  (that stops the runs of other work too).

## 7. Documents

- `docs/<diagram>.md` and `.ja.md`: one `###` heading per rule (the heading in
  lower case, with spaces replaced by `-`, is the name of the fixture folder),
  an explanation of the rule (how mermaid.js reads the text, and therefore what
  is done), and examples. An example is a line that links to a fixture file, and
  an `mmd` code block with its content; `tests/docs.test.ts` checks that they
  match. An example that needs whitespace at the end of a line is not shown,
  since a code block does not keep it; point to the folder instead (a rule
  without examples goes on the list in `docs.test.ts`).
- Example blocks copied by hand drift from the fixtures. Make the document from
  a draft (the headings, the prose, and marks where examples go) by inserting
  the content of the fixtures, then run `npx prettier --write` (prose is wrapped
  at 80 columns).
- `docs/compatibility.md` and `.ja.md`: where the plugin differs from
  mermaid.js, and where formatting keeps text as written, with the reasons.
- `README.md` and `.ja.md`: the supported diagram types, the guarantees and
  limitations. The root README links to the heading
  `Guarantees and limitations`; when changing it, change the link in the root
  README too.
- After writing, run `pnpm run format:check`, `pnpm run lint:docs`, and
  `pnpm run lint:chars`.

## 8. Checks and output

- The regular test run, `npx tsc --noEmit` (at the root), `npx eslint` on this
  package, and the document checks above pass.
- The full run finds no problems.
- Show as the result, for each item of the decision or each finding: the files
  changed and how, the results on the reproducing inputs (acceptance kept, the
  same Db, idempotence, no exceptions), and the counts of the generated tests
  (inputs made and inputs checked). For each claim, say whether it was checked
  by running (【実行】) or by reading (【読解】).

## 9. Pitfalls (as steps)

- Checking with hand-written examples misses whole families. Check with
  generated inputs, list the kinds of inputs found, then fix the rule.
- Whitespace outside the ranges of the tree can affect the Db. In flowchart: a
  style that is all whitespace at the end of a list of styles (it lies outside
  the range), the whitespace after a subgraph name (the id changes), the
  whitespace at the start of a label (the shape changes), and the whitespace
  after a directive at the start of the first style. Before printing text
  outside a range, read the definition of the text of a range in the
  specification, and check how directives and ignored `;` are treated.
- Do not confuse the ends of ranges with the ranges of other items. A kept
  stretch that cuts a node's range prints that text twice (`collectAtoms` throws
  then). Directives can span lines, so do not take a line feed alone as the end
  of a line.
- Lexical facts that the tree does not show (in flowchart: the `;` after the
  words that are read with the line break after them, lines that become
  direction lines when indented, the `;` that the line rule ignores) become
  explicit rules that point to the section of the specification, not a check
  that reads the result back.
- Prettier:
  - `hardline` removes whitespace at the end of a line. To keep it, use
    `literalline` with explicit indentation.
  - Embedding in Markdown removes the line breaks at the end of the result and
    drops errors silently (they are thrown when `PRETTIER_DEBUG` is set). To
    leave a block as written, throw in the parser to decline.
  - Prettier removes a byte order mark before calling the parser, and turns CRLF
    into LF.
  - Prettier reads `comments` on the top node and tries to attach them. Wrap the
    tree's `comments` in a document node.
  - `embed` returns `null` for nodes it does not handle.
  - `printDocToString` follows `endOfLine`.
- The Write tool and bash heredocs turn `\uXXXX` into the actual characters.
  After writing, grep for non-ASCII characters and turn them back into escapes.
- Do not change tracked files temporarily to check something. Do not put
  temporary test files in the working tree (when it is shared, other work's test
  runs pick them up). Put checking scripts in a scratch directory, and import
  with absolute paths. A script run with Node that imports the plugin's sources
  gets `@mmd-toolkit/parser` and `@mmd-toolkit/tests` from their builds in
  `lib/`, unlike the tests, so rebuild them first:
  `pnpm --filter @mmd-toolkit/parser run build` and
  `pnpm --filter @mmd-toolkit/tests run build`.
- Before making a document again from its draft, check that the draft is current
  (that nobody has edited the document directly).

## 10. When mermaid.js is updated

1. Updating the pin of mermaid.js, regenerating the fixtures, and classifying
   the differences come first, with the tests SKILL. Their results are the
   input.
2. Run the regular tests and the full run.
3. Classify the failures:
   - The Db of a corpus input or fixture differs before and after formatting:
     mermaid.js's lexing or grammar changed, and the premise of a printer rule
     (a section of the specification) changed. Fix the specification first (the
     spec SKILL), then the rule.
   - The acceptance or the Db of the input before formatting changed: not a
     printer problem. Write the fixture outputs again and read the diff.
   - An exception or a non-idempotent output: a missing printer rule.
4. When a rule changes, write it into the documents as in section 5, and bring
   the fixtures, the rules document, `docs/compatibility.md`, and the README
   along.
5. Check that the sections of the specification and the mermaid.js links that
   the rules' comments point to still match the new version.

## 11. Jison diagrams and Langium diagrams

- Jison diagrams (such as flowchart): as above. The lexical rules are in the
  specification's lexical sections, and the generated tests often find lexical
  facts that the tree does not show.
- Langium diagrams (such as pie): to be written with pie.

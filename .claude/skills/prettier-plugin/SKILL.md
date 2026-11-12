---
name: prettier-plugin
description:
  Add the printer of a diagram type to prettier-plugin-mmd, or update the
  printers after mermaid.js is updated. Use when the parser supports a new
  diagram type and its formatting is to be decided and implemented, or when the
  pinned mermaid.js changes. It covers deciding the formatting choices, the
  printer, the fixtures, and the documents, and mmdfmt, the command-line tool
  that formats with the plugin.
---

# Adding the printer of a diagram type (prettier-plugin)

How to add the printer of a diagram type to `prettier-plugin-mmd`, and how to
update the printers when mermaid.js is updated.

## Policies and criteria

`packages/prettier-plugin-mmd`:

- Dispatch to per-diagram printers.
- Input that fails to parse is returned unchanged.
- Mermaid fences in Markdown are handled and tested.
- Per-diagram printers follow formatting choices that are decided explicitly,
  item by item.
- Four tests: idempotence, Db agreement before and after formatting, no change
  on failure, fences in Markdown.

`packages/mmdfmt`:

- Formats the diagrams of `.mmd` and `.mermaid` files and of the `mermaid` and
  `mmd` code blocks of Markdown with Prettier and the plugin, and changes
  nothing else in a Markdown file.
- How a diagram is printed is decided in the plugin only; the tool decides which
  text it formats and how it reports and exits.
- Its README defines what it does, and each sentence of it that defines a
  behavior has a test for each case it distinguishes (section 12).

## 1. What to read first

1. The section Policies and criteria of this document, the Principles of
   AGENTS.md, and the skill `conventions`.
2. The specification of the diagram type:
   `packages/spec/docs/diagrams/<diagram>.md` and the tree,
   `packages/spec/docs/ast.md` and `packages/spec/docs/ast/<diagram>.md`. The
   rules of the printer are written with the node types, fields, and token kinds
   defined there.
3. The documents of this package: `docs/development.md` (the tests, the
   fixtures, and how the printer is built); an existing `docs/<diagram>.md`,
   such as `docs/flowchart.md` (the formatting rules and their reasons;
   decisions are kept there, and it is the model for setting up items and
   writing limits); and `docs/compatibility.md` (the model for describing
   differences from mermaid.js and text kept as written).

Use the diagram name defined by `conventions`: lowercase ASCII letters and
digits in one word for paths and fixture categories, its capitalized form for
node type prefixes, and mermaid.js's spelling only where its own text, values,
configuration keys or source paths are held.

This procedure writes only to `packages/prettier-plugin-mmd`, `packages/mmdfmt`,
and this SKILL. When another package needs a change, make it with that package's
SKILL (a gap in the specification with the spec SKILL, a change of the tree with
the parser SKILL, fixtures with the tests SKILL). Commit and push only when
asked (AGENTS.md). Do not change the staging area, and do not use `git mv`. Move
and delete files with `mv` and `rm`.

## 2. When to start (input)

- The parser implements the diagram type and exports its `visitorKeys`, and
  `@mmd-toolkit/ast` exports its tree types
  (`packages/ast/src/ast/<diagram>.ts`; the output of the parser SKILL). Write
  no code that depends on the tree before the tree is settled.
- `@mmd-toolkit/tests` has the corpus of the diagram type
  (`packages/tests/fixtures/<diagram>/`) and its Db summary.
- `checkTree` checks tree conditions (fields, ranges and tokens), while parser
  acceptance is checked by comparing its tree/error results with
  `fixtureAccepts` from `@mmd-toolkit/tests`.
- Checks of a declared divergence mark's lexical form belong in the parser's
  shared `expectDivergenceForm` path, separately from acceptance, rather than in
  per-diagram printer tests.

## 3. Deciding the formatting

The printed form of each item is decided by the rules of
[How the printed form is decided](../../../packages/prettier-plugin-mmd/docs/printed-form.md),
in their order: the whitespace beside a mark (for a colon, the three steps that
say which kind it is), then the form that the other diagram types print for the
same kind of gap, then a spelling. The rules say which form reads best, which is
what a printed form is for; they are applied in their order so that the form
does not depend on who judges. Where none of them gives a form, the output of
the released version is not changed on the judgment of whoever is working on it:
a form that seems to read better is proposed to the user, with a text as written
and both outputs, and what is decided is added to those rules.

1. From the grammar and the tree in the specification, list what formatting
   could change. The kinds of items flowchart has (as examples; a diagram type
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
2. For each item, find the rule of that document that decides its form, taking
   the rules in their order, and the facts it needs: the whitespace that
   Prettier prints beside the same kind of mark, the form that the other diagram
   types print for the same gap, or the count of each form in the examples of
   the documentation of the pinned mermaid.js. Write the candidate forms with
   examples (before and after formatting), the rule that decides, and the facts.
   Say which forms change the Db.
3. For each candidate form, run the text before and after formatting through the
   pinned mermaid.js and the versions that count (that document), and check that
   the Db does not change and that every one of those versions accepts the form
   and draws it the same. A form that one of them rejects or draws differently
   is not printed. Each case that the choice distinguishes has a fixture
   (section 6). Attach the results, marked as checked by running.
4. Implement the forms that the rules decide. A form that would change what a
   released version printed, and a form that seems better where no rule gives
   one, is shown to the user first, with a text as written, the old and the new
   output, the rule that gives the new form if there is one, and a
   recommendation; the user decides it, and the decision is added to the rules.
5. Write each decision into the rules document `docs/<diagram>.md` (English and
   Japanese) as a rule with its reason. The reason is the rule of that document
   that decided the form, with the facts that rule needs. A reason that says
   only "reads better" tells a reader nothing: name the rule that says why it
   reads better. Where a rule gives a form that reads worse than another form
   that draws the same, say so and propose the other form to the user as under
   step 4, since the rule is then what is wrong. Write what is kept as written
   because it affects the Db, and the differences from mermaid.js, into
   `docs/compatibility.md` too. Keep decisions in these two documents only.

## 4. Writing the printer

How it is built (under `src/printers/`):

- Add the body node type of the diagram and its printer to `diagramPrinters` in
  `index.ts`. The table has an entry for every body type of the parser, so the
  type checker fails when the printer of a new diagram type is not added.
- What every diagram type shares is in shared modules; use them, and do not copy
  them into a diagram's printer. `blocks.ts` prints the statements of a block,
  the comments and directives between them, the `;` that separate them, empty
  lines, and the lines that open and close a block (`printBlock`,
  `printDiagramBlock`, `printClosedBlock`, `openingLine`); `atoms.ts` and
  `layout.ts` build a statement from the pieces that are printed (atoms) and the
  rules of the gaps between them (`printAtoms`, `collectAtoms`,
  `collectValueNodes`, the `accDescr` block). Route description blocks through
  the shared `layoutDescriptionBlock`, with the decision for all diagram types
  that whitespace-only interiors become `{}` and the attempt to compact with
  fallback to the original layout handled by the shared
  `layoutCompactEmptyDescriptionBlockWithFallback`, and write no diagram-local
  empty-block decisions. Only graph types (flowchart and agentflow) first check
  the documented line exceptions in `graph-layout.ts` before calling the shared
  `layoutCompactEmptyDescriptionBlock`, returning to ordinary statement layout
  if compaction is unavailable. `kept-lines.ts` holds the lines that keep a `;`
  of their own and where a line starts and ends; `source.ts` decides which
  tokens belong to the structure of a node (`isStructural`). When a diagram type
  needs something they do not do, extend them.
- Each diagram type has its printer (`<diagram>.ts`), which dispatches on its
  node types and gives `blocks.ts` its `BlockRules` (its kept lines, where a
  statement's printed text ends, which statements hold statements, which are
  dropped at the top level, whether a line of only whitespace after a comment is
  kept); the layout of its statements and block headers, with the gap rules of
  its decided items (`<diagram>-layout.ts`); and, only when diagram-specific
  logic remains, its kept lines (`<diagram>-kept-lines.ts`). A flat body with
  retained hidden forms uses `createFlatHiddenDiagramPrinter` in
  `flat-hidden-diagram.ts`, supplied with the diagram type, ignored-node type
  and header/statement layouts, whose header contract requires the first atom to
  start at the header keyword. The factory also returns `keepsPrefix`; register
  it in `diagramTextRules` in `src/printers/index.ts`. `BlockRules` takes the
  statement type of the diagram type, or a unit that groups statements which
  stay on one line (a block diagram), so that its functions need no cast. When
  the statements of a diagram type fall into kinds (blocks with one body, blocks
  of sections, statements that hold no other), decide the kinds in one function
  whose switch lists every statement type, checks each case against the type of
  its kind, and ends with a `satisfies` check that fails when a statement type
  is not listed (`classifySequenceStatement` in `sequence-layout.ts`);
  everything else asks that function, rather than keeping its own list of types.
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
   needed, find it in the lexical sections of the specification, give it a
   fixture (section 6), and make it an explicit rule with a comment that points
   to the section of the specification (section 5).
2. Do not build a check that parses the formatted result again at run time and
   compares it; it only hides a missing rule.
3. Keep each decision in one place (for example, where a line starts and ends,
   how a gap is read, which lines are kept). Leave no unwritten promise that
   callers must keep.
4. Read the diff of every autofix such as `eslint --fix`. It may insert empty
   JSDoc or stubs.
5. Comments say what is done and why, and point to the section of the
   specification and to the heading of the rule in the rules document (for
   example `(docs/flowchart.md, Label inner whitespace)`).

## 5. When a rule is added or changed

When a rule is added or changed after the decision, add the rule, its reason,
and an example to that rule in `docs/<diagram>.md` (and to
`docs/compatibility.md` when needed) in the same change. Show as the result: the
wording of the rule, an input that shows it, mermaid.js's results before and
after formatting, and the reason in the specification. A rule that changes a
decided choice needs a decision before it is implemented; ask for it with that
evidence.

Write a narrow exception (for example, no space before the closing `?]` or `=]`
of a slanted shape) into the document in the same way.

## 6. Tests

Add these to the four tests of the section Policies and criteria. How they are
built is in `docs/development.md`.

- Fixtures (`tests/fixtures/<diagram>/<rule>/<example>-input.mmd`,
  `-output.mmd`, and `-options.json` when needed): one folder per rule. Write
  the outputs with `pnpm --filter prettier-plugin-mmd run test:update`, and read
  the diff. `tests/format.test.ts` checks the outputs, idempotence, that the Db
  that the tree denotes is the same, and that the embedded data is as written. A
  text with invisible characters (U+2028, U+2029) is not a fixture of this
  package: write it with escapes in test code, as
  `tests/line-separators.test.ts` does, and check the bytes of the file after
  writing it.
- How the Db is kept (`tests/db-reading.ts`, used by the fixture, corpus, and
  line-separator tests): mermaid.js is not run. `dbOfText` builds the Db from
  the tree of the text with `dbFromTree` of `@mmd-toolkit/tests`, with the
  values that mermaid.js derives from the embedded data of the input: a corpus
  fixture records them (`embeddedValuesOf`) and the Db of the input, which the
  formatted text must have; another text has the defaults and is compared with
  its own formatted text. Because the input's values are used,
  `writtenEmbeddedTexts` (the directives and the data blocks as written) must be
  the same before and after, and the frontmatter is as written or as Prettier's
  YAML formatter prints it (`describeFrontmatterChange`). A text with a data
  block has no Db without mermaid.js's effects, so only its written text is
  checked.
- Recorded comparisons use `reading = fixture.specified ?? fixture.expected` and
  `embeddedValuesOf(fixture, reading)`, comparing the Db only when the reading
  is accepted, its Db is non-null and its embedded values are available.
- For `embedded-data-opaque`, follow the specification's
  [comparison Db](../../../packages/spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db)
  through the shared `specifiedRunOf` reference path in
  `tools/src/specified-reading.ts` at the repository root, removing only the
  rejected embedded blocks or the acceptance-setting keys it names while keeping
  Mermaid-derived titles and other settings.
- Formatted cases without a comparison Db remain explicit in the tests and
  report, and still receive the shared idempotence and written-text checks.
- `tests/format.test.ts` and the shared `tests/corpus.ts` apply
  `writtenTextKeptUpToSeparators` from `tests/db-reading.ts` to every diagram,
  comparing text outside frontmatter and whitespace and allowing only removal of
  input `;` and of the `,` between the entries of a data block that is printed
  on lines, even when Db comparison is unavailable. This shared check does not
  prove preservation of whitespace or semicolons inside values, or that a
  removed `,` separates entries and is not text of a string; keep exact-output
  fixtures for their rules, checked against mermaid.js.
- Unit tests: dispatch, failures, and Markdown code blocks
  (`tests/dispatch.test.ts`, `failure.test.ts`, `markdown.test.ts`,
  `markdown-flowchart.test.ts`). For a new diagram type, add an example that is
  formatted inside Markdown.
- The corpus: `tests/corpus.test.ts` loads common fixtures of
  `@mmd-toolkit/tests`, and `tests/corpus/<diagram>.test.ts` loads that
  package's fixtures of the named diagram. Each calls `testCorpus` in
  `tests/corpus.ts` to check, on every fixture that the plugin formats, that
  formatting does not throw, is idempotent, and keeps the Db and the embedded
  data. Add a file for a new diagram type.
- A failure of the printer is guarded by a fixture of the corpus, made in
  `@mmd-toolkit/tests`. A failure that `pnpm run lint` rules out (an array
  spread into the arguments of a call, in the
  [`conventions`](../conventions/SKILL.md#code) skill) is guarded by that rule
  instead.
- Fixtures answer sentences. Every sentence of the rules documents
  (`docs/<diagram>.md`, `docs/compatibility.md`) that defines a behavior has a
  formatting fixture for each case it distinguishes, and for each other rule
  that meets it at the place it names: a directive, an ignored `;`, a comment
  line, an empty line, a line separator (U+2028, U+2029), an empty description
  block, and whatever else the sentence's own words name. The fixtures are
  written with the sentence and checked against mermaid.js once. A failure is
  closed by a fixture and by the sentence that states the rule it shows to be
  missing. No test or command generates inputs, and no input is chosen by a
  random source or by a number (a seed, a count).
- Fixtures come from the cases of the rule sentences, not from copies of corpus
  inputs: write a minimal input for each distinct case, merge fixtures that
  answer the same case, and cite corpus inputs as `[corpus fixture: ...]`.
  Compare the file and escaped fixture inputs with all corpus inputs byte for
  byte to confirm that no copies remain.
- No `rejected-inputs` folder: accepted divergence inputs belong to their rule
  folders, and the corpus test covers rejected inputs.
- The document test (`tests/docs.test.ts`): the headings of each rules document
  match the fixture folders of its diagram type, and its example code blocks
  match the fixture files. Add a new rules document to `ruleDocuments` there.

Which tests to run (the rule for every package is in the skill `conventions`,
[Running tests](../conventions/SKILL.md#running-tests); this is what belongs to
this package):

- The part of the code and the test files that a change to it can affect. Run
  these while working, with
  `pnpm vitest run --project prettier-plugin-mmd <files>`. `-t <diagram>` (lower
  case) narrows fixture cases in `format` and the `corpus` files, whose fixture
  test names start with `<diagram>/`. For a corpus-only run, pass
  `tests/corpus/<diagram>.test.ts` (`tests/corpus.test.ts` for common fixtures).
  With `-t`, every other file is skipped whole and nothing fails, so run the
  other files without it.

  Which test files go with each source file is listed in
  [tests-by-changed-file.md](tests-by-changed-file.md). Search it for the name
  of the changed file: the files of a diagram type start with its name
  (`flowchart*.ts`), and a shared module, `error.ts`, `index.ts`, and a test
  helper are named as they are.

- The test that reads documents: `tests/docs.test.ts` reads the rules documents
  (`docs/<diagram>.md`, English and Japanese), the READMEs, and the fixture
  folders. Run it after a change to any of them, also a change to documents
  only.
- The default run is `pnpm vitest run --project prettier-plugin-mmd`: the
  fixtures, the corpus, and the unit tests. Run it once before reporting the
  work as done.
- When extracting or changing shared printing, compare every existing caller's
  fixtures, escaped cases and corpus byte for byte before and after, with
  defaults and `tabWidth: 0`, retaining rejected results too.

When the machine is under load or the workspace has unrelated failures:

- Under load, a corpus test may exceed its 5-second limit. Run it alone again;
  if it passes, the failure came from the load.
- Workspace lint or tests may fail in a file outside this package. Do not touch
  files outside this package; say so in the results.
- Stop a run by its process id. Do not `pkill` by name (that stops other
  processes with the same name too).

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
  the content of the fixtures, then run `npx prettier --write`.
- `docs/compatibility.md` and `.ja.md`: where the plugin differs from
  mermaid.js, and where formatting keeps text as written, with the reasons.
- `README.md` and `.ja.md`: the supported diagram types, the guarantees and
  limitations. The root README links to the heading
  `Guarantees and limitations`; when changing it, change the link in the root
  README too.
- After writing, run `pnpm run format:check`, `pnpm run lint:docs`, and
  `pnpm run lint:chars`.

## 8. Checks and output

- Before the report, `npx tsc --noEmit` (at the root), `npx eslint` on this
  package, and the document checks above pass.
- Say what was run and what was not.
- Show as the result, for each item of the decision or each finding: the files
  changed and how, the results on the reproducing inputs (acceptance kept, the
  same Db, idempotence, no exceptions), and the fixtures added. For each claim,
  say whether it was checked by running (【実行】) or by reading (【読解】).

## 9. Mistakes to avoid

- The sentence of a rule distinguishes more cases than one or two hand-written
  examples show. List the cases that the sentence distinguishes and the rules
  that meet it, give each a fixture, then fix the rule.
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
  temporary test files in the working tree (a test run picks them up). Put
  checking scripts in a scratch directory, and import with absolute paths. A
  script run with Node that imports the plugin's sources gets
  `@mmd-toolkit/parser` and `@mmd-toolkit/tests` from their builds in `lib/`,
  unlike the tests, so rebuild them first:
  `pnpm --filter @mmd-toolkit/parser run build` and
  `pnpm --filter @mmd-toolkit/tests run build`.
- Before making a document again from its draft, check that the draft is current
  (that the document has not been edited directly).

## 10. When mermaid.js is updated

1. Updating the pin of mermaid.js, regenerating the fixtures, and classifying
   the differences come first, with the tests-mermaid-update SKILL. Their
   results are the input.
2. Run the regular tests.
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
6. Compute the versions that count again (the table in `docs/compatibility.md`,
   Versions of mermaid.js that count) and go through the table Forms kept for
   versions of mermaid.js that count, row by row. A rule none of whose named
   versions counts any longer is taken out, and the form that the rules of
   `docs/printed-form.md` give is printed; the published output changes, so a
   changeset goes with it. Write the versions that still count into the rows
   that stay, and add a row, in the same change, for each new kind that the
   drawings of the new versions show.

## 11. Jison diagrams and Langium diagrams

- Jison diagrams (such as flowchart): as above. The lexical facts that the tree
  does not show are in the specification's lexical sections.
- Langium diagrams: as above, from the specification's AST. The engine itself
  changes no printing rule. Check the diagram's specification for:
  - First-match priority and keyword/component boundaries.
  - Semantic acceptance conditions: require direct specification sentences for
    rejection after the grammar accepts, including defaults, site configuration
    and the treatment of settings embedded in the text.
  - Comparison values: read the specified conversion order and equality rules
    separately from the authored spelling, which the printer preserves.
  - Hidden YAML/directive forms, when its lexical rules define them. Keep each
    retained node as written in its specified AST field or body entry. Preserve
    any LF the rule consumes outside the node range and whitespace after its
    closer: both can decide acceptance. Use `protectHiddenGaps` from
    `hidden-forms.ts` to set `writtenGapsBefore` for these gaps between atoms.
  - Text that detection skips before reaching the header. If formatting leading
    blank lines or comments could turn ignored YAML into frontmatter, preserve
    the complete prefix with the printer's `keepsPrefix` from section 4.
  - Line values: do not join a next-line value where the grammar reads none.
  - Divergence identifiers marked by the diagram's corpus: use the
    specification's reading for those identifiers, checking both directions of
    `embedded-data-opaque` where settings embedded in the text change
    acceptance.

## 12. mmdfmt

- The tool calls Prettier with the plugin on the text of each diagram, finds the
  code blocks of Markdown with Prettier's Markdown parser
  (`prettier/plugins/markdown`), and replaces only their content lines
  (`src/markdown.ts`). A syntax error's message and offset are read from the
  parser's error kept as its `cause` (`src/diagram.ts`).
- The info strings it formats (`diagramLanguages` in `src/markdown.ts`) are the
  `aliases` of the plugin's language. A change to the plugin's `languages`, to
  its handling of rejected text, or to its options is a change to the tool in
  the same change.
- Tests (`tests/*.test.ts`) write their inputs in the test code, so that line
  endings, a byte order mark, and U+2028 are escapes; the files of a run are
  written to a temporary directory outside the repository, so that no
  configuration of the repository applies. `tests/plugin-blocks.test.ts`
  compares the blocks the tool formats with those Prettier formats with the
  plugin.
- Which tests to run: `pnpm vitest run --project mmdfmt` after a change to the
  tool, and also after a change to the plugin's `index.ts`, `parser.ts`, or
  `printer.ts`.

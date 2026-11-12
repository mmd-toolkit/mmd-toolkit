---
name: tests-diagram-type
description: >-
  Add a diagram type to @mmd-toolkit/tests: read mermaid.js's grammar and Db for
  it, write its Db normalizer and its section of docs/db-summaries.md, and
  collect and hand-write its fixtures. Use when a diagram type is added, before
  its specification is written, and when another step refers to the table of
  summary fields or to docs/db-summaries.md, together with the tests skill.
---

# Adding a diagram type (tests-diagram-type)

Sections 1 to 4 of the skill [tests](../tests/SKILL.md) (the policies and
criteria, what to read first, the working tree, and how to check) hold for these
steps too. Read them first.

Diagram types are added one at a time. Each is finished in this order before the
next one starts: the normalizer and the fixtures (this skill), the specification
(the spec's skill), the parser (the parser's skill), the printer (the
prettier-plugin's skill). Each piece of work uses the results of the ones before
it: the specification and the parser refer to the list of summary fields
(`docs/db-summaries.md`), and the claims of the specification and the tests of
the parser use the fixtures. The steps that build the summary from a tree are
written here after the tree document of the specification
(`docs/db-from-tree/<diagram>.md` and `src/db-from-tree/<diagram>.ts`).

For a Chevrotain diagram, apply the same procedure with the token definitions as
lexer rules: token order, active modes and explicit `longer_alt` decide the
unit; there is no general longest match. Lexer errors reject before parser
errors, even when the parser recovers a tree. Read the parser's rule methods as
grammar productions and the model builder's validation as acceptance conditions.
Collect distinguishing cases for each of these, including mode transitions and
priority interactions that token counts alone cannot establish.

For a Langium diagram, derive the following from its own grammar and services.
Derive terminal order, boundaries, conversion and publication anew for each
diagram; an imported common rule does not establish how the diagram uses it.

1. Start at the `entry` rule and follow imports and rule calls. Read the
   generated grammar as well as the written grammar, and the service modules
   that inject its token builder and value converter. List only reachable
   terminals in their resulting order, including hidden ones; an imported
   terminal's declaration alone does not make it reachable, and a terminal's
   component rules need not become separate lexer units. If generated files are
   absent from the clone, read the installed pin's bundle source maps and check
   the generated module and grammar against the written service wiring.
2. Read keyword patterns too: list which keywords receive custom boundaries,
   which keep the default ordering, and which have explicit `longer_alt`
   alternatives. The
   [shared token builder](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/tokenBuilder.ts#L7-L31)
   adds whitespace/EOF-or-percent-pair lookahead only to its configured
   keywords. First matching rule, keyword boundaries and explicit alternatives
   decide the unit, rather than a general longest match. Probe glued suffixes,
   keyword prefixes, punctuation attached to keywords, and priority against
   references, numbers, strings and composite common terminals; detection has
   boundaries of its own.
3. Treat hidden terminals as lexer rules with consumed text, not as global
   removals. The imported
   [YAML and DIRECTIVE terminals](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/common.langium#L25-L34)
   consume an immediately following LF, whereas another whitespace boundary is
   only looked at. Probe each unit gap and each statement's EOL and EOF: a
   consumed sole LF prevents a later statement, but consuming the common
   appended LF can leave EOF satisfying EOL. Keep leading frontmatter, common
   directive removal and these body terminals distinct. Derive alternative
   priority before choosing a closer: a body-present alternative can take
   precedence over an adjacent empty close. Probe the detection-to-parser
   handoff for retained prefixes and passed bare-line trivia independently for
   the new diagram.
4. Follow the actual terminal rule name through the injected converter and its
   fallback, including identity, string, integer and double conversion only
   where reachable. The
   [common converter](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/valueConverter.ts#L26-L70)
   gives line and block common values different whitespace readings. For
   example, the pie
   [custom branch](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/pie/valueConverter.ts#L6-L16)
   names PIE_SECTION_LABEL, while its
   [grammar](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/pie/pie.langium#L1-L20)
   calls STRING and reaches the default escape conversion. For reachable units,
   collect both quote styles, unknown escapes, precision, overflow and
   underflow; use rejecting controls and record the reason where a previous
   diagram's unit is unreachable.
5. Read the public acceptance gate, not just the recoverable AST. The
   [public parse wrapper](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/parse.ts#L134-L150)
   rejects any lexer or parser error. Then follow the diagram's AST-to-Db
   publication, distinguishing stored values, conditional or skipped
   assignments, unassigned grammar literals and statements the adapter discards.
   Record repeated-assignment order, empty final values, duplicate handling and
   semantic rejection after publication; a diagram may publish nothing and have
   an empty summary. Test errors at the beginning, in a recovered statement and
   after a valid prefix, separately from each reachable Db rejection.
6. Keep the collector's parse stub asynchronous so that specs awaiting parse are
   recorded: `Promise.resolve(record(text))` records the call without running
   Langium or imitating acceptance. Run the spec against this shared recorder
   and check that every recorded location is an actual parse call. A stub-only
   test-body failure after the final input may use the existing explicit
   allowance of step 3 of section 3 only after proving that no input was lost.
   Continue with the normalizer, fixed-fixture and stable-generation steps in
   sections 2 and 3; once the AST is defined, implement its Db builder and
   checker with the skill [tests-tree-checks](../tests-tree-checks/SKILL.md).

## 1. Input

- The name of the diagram type to add, and the diagram ids that share its Db
  (found in mermaid.js's list of detectors and in the `db` of each diagram
  definition). One detector can stand for several keywords: `classDiagram` and
  `classDiagram-v2` are both detected as `classDiagram`. The diagram type's
  fixtures go in one directory, whatever ids it has. The diagram-type naming
  rules are in [conventions](../conventions/SKILL.md#code).
- A clone of mermaid.js at the tag of the pinned version (how to make it is in
  `tools/README.md`).

## 2. The normalizer

1. In the clone, open the grammar, any AST-to-Db adapter, the Db implementation
   and the renderer. List private or closure-held state and every publication
   call (Jison `yy.` calls or the adapter calls derived above). Look for every
   place the Db reads a browser global (`window`, `document`, `Option`, `CSS`),
   and whether it runs while mermaid parses or only after rendering (class's
   click callbacks and tooltips run after rendering and need nothing).
2. Make a table of the proposed summary fields: for each field, its renderer
   reader, whether the syntax determines it, why it is kept, and what is dropped
   and why. Do not retain parsing or validation state merely because another Db
   method reads it, and do not invent fields for unassigned keywords, discarded
   AST values or build constants; an empty summary is a valid result. Always ask
   whether the following should be dropped (the flowchart and sequence examples
   in parentheses):
   - a drawing-derived value, or one filled in by the renderer (`domId`,
     sequence's `actorCnt` and `rectData`);
   - a value derived from other fields alone (`textStyles`, sequence's message
     `id` and the list of notes);
   - a value that only a site setting changes (`haveCallback`, set only under
     `securityLevel: loose`). A field the syntax determines that a site setting
     also changes is kept, and the Db patch records it as the other settings
     give it (class's link target, `_top` under `securityLevel: sandbox`). Run
     every fixture with a different `securityLevel` and check that the summaries
     do not change;
   - whitespace left in a value (the whitespace at the end of style values).
     Drop it only when the code that draws is shown not to read it. That a
     formatter changes it is no reason to drop it: a formatted text must give
     the same Db, and a formatting that changes the Db is an exception of its
     own (AGENTS.md, 4). The code that draws an edge reads the whitespace at the
     end of a style (the color of the arrowhead is the first `stroke:` of the
     styles that has a character after it, taken with `trim()`), and a sequence
     title of only whitespace still takes room as a title, so both are kept;
   - a field set only by `@{ ... }` data blocks. Such a field is kept, and
     implementations get it through `dataBlockEffects`
     (`docs/embedded-data.md`);
   - an object whose keys an author writes (the contents of a data block, the
     props of `[|field:value|]`, sequence's links and properties). Check with a
     fixture what a key such as `__proto__` does: it stays an own property
     (flowchart), or it replaces the prototype (sequence's links and
     properties). `toJson` refuses the latter, so record the prototype as a
     first entry `__proto__`;
   - the source of the summary, when the Db holds what it read in more than one
     form. Take the form that holds every element once with what applies to it,
     which is usually what the renderer reads, and write down why the other
     forms are not taken (state: the statement tree keeps statements that change
     nothing, and the table of states holds only the top level, so the summary
     is taken from the layout data `getData()`). Distinguish collection
     iteration order, replacement position and creation sequence, and keep each
     only when its renderer consumer needs it;
   - an id that mermaid.js makes at random (state's region after the last `--`).
     Observe whether each id was authored or generated at publication rather
     than guessing from its spelling, and replace only proven generated identity
     and reference positions in a stated generation order, reserving authored
     placeholder names even in later statements. Do not search authored text for
     id-shaped substrings. If observation precedes a conversion that publication
     uses to decide authorship, document and test the equivalence it relies on
     instead of reproducing the converter. Check reset after rejection and two
     stable generator runs;
   - a value that depends on the time of the run or on chance, not on the text
     (gantt computes dates, in the time zone of the process, and reads today's
     for a start after an id that is no task). The store of earlier results
     (`docs/expected-results.md`) gives back a result made on another day, so
     such a value is either dropped from the summary, or the diagram type's
     results are not stored, or what they depend on goes into the key of the
     store. Gantt's summary leaves the dates out, since the Db computes them
     only when the diagram is drawn. Check by running every fixture again on
     another day and in another time zone (`TZ=...`), and in another order, and
     comparing with `expected.json`.
3. Decide the table before writing. Decide it from the correctness criteria of
   AGENTS.md (for accepted inputs, the Db matches mermaid.js), from the rule
   that a summary keeps only what the syntax determines
   (`docs/db-summaries.md`), and from the effect on what uses it (the Db
   normalization section of the specification, how the parser derives the Db).
   Prototype what is unclear (such as recording data blocks) in the working
   directory outside the repository and check it before deciding.
4. Write the normalizer in `packages/tests/src/normalizers/<diagram>.ts`, and
   register in `src/normalizers/index.ts` every diagram id that shares the Db.
   Check whether a Db patch is needed (the Db stores links through
   `utils.formatUrl()`, or the syntax has data blocks); if so, write it in the
   same file and register it in `dbPatches`, with a text mermaid accepts and
   detects as the diagram id (`classDiagram` alone is rejected; the class sample
   has a class): `runMermaid()` patches every Db class before any input is
   parsed. A Db method that calls a browser function Node lacks (`window`,
   `document`, `Option`) shows as a `MermaidEnvironmentError`. The patch then
   gives a stand-in for that function during that call only
   (`src/normalizers/browser-stand-ins.ts`), without copying mermaid's
   processing. What the stand-in answers decides what implementations are
   compared with, so present the options with a recommendation and ask for a
   decision, then write it in `docs/expected-results.md`. The effect of a data
   block is recorded with `blockEffect` of `data-blocks.ts`, by comparing the
   element summaries without and with the block. How depends on how the grammar
   passes the block: in a call of its own, compare before and after that call
   (flowchart); in the call that adds the element, run that call once without
   the block, put the Db's lists back, and compare with the real call
   (sequence). A Db that is one object shared by every diagram, with its state
   in module variables, has no class (gantt's): register its patch with
   `appliedTo: "object"`, so that it receives the object, and let the patch
   reset what it records in step with the Db's `clear()`. The generated parser
   calls the methods on a copy of the object's properties, so inside a patched
   method `this` is not the Db.
5. Add the diagram type to `DiagramType` in `src/index.ts` and to `diagramIds`
   in `tools/src/diagrams.ts`, and to the per-diagram loading test and the lists
   of the tests that read every fixture in `tests/fixtures.test.ts`. Add the
   normalizer's file to `RESULT_FILES` in
   `packages/tests/src/mermaid-run-store.ts`; `codeIdentityOf` uses this list to
   build the result identity. The lists of diagram types in other packages are
   changed by the steps of that package's skill (section 3 of the skill
   [tests](../tests/SKILL.md)), not here.
6. Add tests in `tests/` (dropped fields do not appear, a patch does not change
   the summary, data block effects). In corpus-backed tests, load fixtures by
   name rather than copying their input strings, and add a missing input through
   the CLI after probing it. Find tests that use the new type as an unsummarized
   carrier and move those assertions to another verified unsummarized fixture.
7. Run `pnpm --filter @mmd-toolkit/tests run fixtures:generate`. Only the
   fixtures of `common/` that carry the diagram type should change (`db: null`
   becomes a summary). If anything else changes, find out why. Those fixtures
   then have a summary and no tree: add the diagram type to
   `DIAGRAM_TYPES_WITHOUT_RECORDED_TREES` in `tests/db-from-tree.test.ts`, and
   remove it when the parser has recorded the trees, and add the diagram type to
   `DIAGRAMS` of the same file then, so that the builder runs on the recorded
   trees. Add also the prefix of the node types of the diagram type
   (`Requirement`) to `NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES` in
   `tests/check-tree-recorded.ts`, which the tests that need a recorded tree of
   every node type leave out, and remove it at the same time, when the rows of
   the value fields of the diagram type (`VALUE_FIELD_REPORTS` and the other
   tables of the tests of fields and values) are written. The list stays empty
   between two diagram types.
8. Write the section of the diagram type in `docs/db-summaries.md` and `.ja.md`
   (what is dropped, and why).
9. Show as the result the summary fields, and the dropped fields with their
   reasons.

## 3. The fixtures

1. Collect inputs from the tests of mermaid that pass diagram text to the syntax
   of that diagram type (for Langium diagrams, including the diagram type's
   tests in mermaid's parser package), the mermaid blocks of the documentation,
   and the demos. `SPEC_FILES` in `tools/collect.ts` alone lists the test files
   each diagram type collects, with reasons for exclusions; the scope is in
   `tools/README.md`.
2. Between diagram types, the collection tools (`tools/collect.ts`,
   `tools/src/spec-recorder.ts`) differ only in which spec files are read and
   which functions receive the text. Add to `SPEC_FILES` in `collect.ts` the
   diagram type's spec files that pass diagram texts to mermaid, with the reason
   for each file left out. Add the stubs of the modules the spec files import
   and of the functions that receive the text (the diagram's parser's `parse`,
   `Diagram.fromText`, ...) to the list in `spec-recorder.ts`, which every
   diagram type shares.
3. The recorder of spec files (`tools/src/spec-recorder.ts`) runs each spec file
   against stubs. What it relies on, and what to keep when changing it or adding
   a diagram type:
   - Spec files build their inputs in loops and template literals, so reading
     string literals statically misses them. Run each file against stubs and
     record the strings passed to parse.
   - The lint stops Node's module hooks (`registerHooks`, `register`) as an
     experimental feature, and transpiling with TypeScript moves the line
     numbers. So the recorder copies the test file into a temporary directory,
     rewrites only what is between the quotes of each import path, and imports
     the copy as it is. Paths of `import("...")` calls inside tests are
     rewritten too; a type-only import is left alone, since Node removes it.
   - The temporary directory on macOS is a symbolic link, so pass it through
     `realpathSync` to match the real paths in stack traces.
   - Node evaluates a module once per URL, so put the stub modules in a separate
     directory for each test file.
   - Errors must not hide inputs. A stub turned into a string throws, and the
     run stops on a test-body error unless its file, test title and error
     message are listed in `ERRORS_AFTER_THEIR_INPUT` in `collect.ts`, with
     proof that it failed only after its final parse call and every input was
     recorded.
   - Tests that check the layout of the drawing do arithmetic on stubs. The
     stubs give `NaN`, and the run stops when a recorded text contains `NaN`.
   - Tests that render through a real DOM and check the drawing cannot run
     against stubs (sequence's `actorBandModel.spec.ts`). Check that their
     inputs are also in the documentation or the demos, and leave the file out
     with the reason.
   - Check that the line recorded for each input really has a call that passes
     the text.
4. From the documentation and the demos, take only the blocks that mermaid.js's
   detectors (`detectDiagramType`) give the diagram type. Make the text of a
   demo what `mermaid.run()` reads (drop the line feed right after `<pre>`,
   decode character references, apply the `ts-dedent` that mermaid uses, trim).
   This can be checked against the real page in a browser: this one check needs
   the dependencies installed in the clone, which collection does not. Start the
   dev server of the clone (`pnpm run dev`), which builds the `mermaid.esm.mjs`
   that the demo pages import and serves the demos, open the demo page, and
   compare.
5. Collected inputs get no `config`. Their names are
   `<source>-<file>-<first 8 hexadecimal digits of the SHA-256 of the input>`
   (`docs/maintaining-fixtures.md`).
6. Try `fixtures:add-many <diagram> <file> --dry-run`, read the output, then run
   it for real.
7. Go through the "rejected by mermaid" list that `add-many` prints, one by one.
   Mark with `fixtures:set-divergence` as `embedded-data-opaque` each input
   rejected only because of embedded data (an unknown shape or malformed YAML in
   a data block, the frontmatter, a directive). Check by hand that an unusual
   error (`TypeError` and the like) is caused by the input. A
   `MermaidEnvironmentError` means mermaid.js uses a feature Node lacks; give a
   stand-in as in section 2 (`docs/expected-results.md`). Also probe valid
   embedded settings that change acceptance in either direction, and apply the
   specification's marks and required readings through section 5.1 of the skill
   [tests](../tests/SKILL.md) rather than treating the rejection list as the
   whole divergence inventory.
8. Run `fixtures:generate` twice, and check with the hash comparison of section
   4 of the skill [tests](../tests/SKILL.md) that the second run changes
   nothing. Run `fixtures:check`. Run the collection again and check that it
   finds nothing new (the names are stable).
9. Hand-written inputs. Each input answers one question, in one line of its
   note. Before writing them, take the kinds of cases that the earlier diagram
   types needed, and apply each kind to the sentences and the fixtures of the
   new diagram type first, as a list; a kind that does not apply is written down
   with its reason, not left out. For every kind, check each place of the syntax
   that holds text (every field, name, string, and block, in quotes or not, on
   the first line and on the later ones) with mermaid.js. Take the cases from
   the fixture names of the earlier diagram types, not from the wording of the
   list: list the names of the hand-written fixtures of the two nearest diagram
   types (`ls` the directories), and give each name a counterpart in the new
   diagram type or a reason. The list holds the kinds:
   - values that the line rule of `style` and `classDef` lines reaches: the last
     `;` of a line that has `style`, later a `:` and a `#`, dropped from any
     text of the line; the keyword in another case, a space between the `:` and
     the `#`, no `#`, and a `;` on another line, which keep the `;`; two `;`,
     where the first ends a character reference; a line inside quotes, which is
     a line of its own;
   - a comment line, a directive line, and an empty line between a keyword and
     its value; and, where a keyword whose line has no text takes a later line
     as its value (the accessibility texts), the line it takes, whatever that
     line says, such as a statement of the diagram (`accTitle:` followed by
     `line [1]` in xychart);
   - the keyword in another case, and a letter, a word character, a `-`, or a
     character outside ASCII glued after it, for the header and for the keyword
     of every statement;
   - the names of `Object.prototype` (`__proto__`, `constructor`) as a name or
     an id;
   - a second and a third definition of the same name: which one stays, and
     whether the other calls of the grammar action work; make the third one meet
     a partner that is not the first definition;
   - an empty description block (or a statement with no text) that keeps the
     value before it;
   - CRLF, a lone CR, U+2028 and U+2029: as a line end, inside a value or
     quotes, and at the end of the text;
   - a tab and a U+FEFF as whitespace, at the start of a line, inside a value,
     and at the end of a line and of the text;
   - character references, in every text and in quotes, and the `#` of one,
     which starts no comment;
   - values that a directive cuts: a directive inside a value, at its start and
     its end, inside quotes, on the line of the header, glued to a keyword, and
     one that is not closed, which takes the word at the start of the next line
     or the rest of the text;
   - a text that ends inside a context that is not closed: after `accTitle:`, in
     a block with no end, in a quote with no end;
   - what stands after each form of a statement, at the end of its line: ` ;`,
     `;`, `;;`, a comment, a directive that is closed, and one that is not;
   - whitespace at the end of a value, a line, and the text, no-break space and
     U+3000 included, and lines of whitespace only;
   - comment lines and directive lines in the middle of a value that runs over
     several lines;
   - numbers that the Db reads from text: a sign, `-0` (the Db has -0 and JSON
     writes 0), `NaN`, `Infinity`, a number too large for a double, and text
     after the number;
   - values of embedded settings read by the Db;
   - `html-tag-in-frontmatter`: acceptance in both directions and value-only
     differences;
   - a hidden form immediately after a statement (a body `---` block or
     `%%{...}%%`): a following statement after its consumed LF, a blank line
     supplying a spare LF, a space after its closer leaving the LF visible, and
     EOF; include line values that absorb the opener as text;
   - adjacent hidden-block fences: a body-present alternative before an empty
     fallback, with a later qualifying closer and with none, including EOF and
     closing whitespace;
   - a statement on the same line after an optional header flag;
   - a duplicate definition whose second value is on a semantic boundary, such
     as `-0`, in both orders: which value is retained, and whether semantic
     rejection precedes duplicate suppression;
   - the C4 detection words (`C4Container`, `C4Component`, `C4Dynamic`,
     `C4Deployment`) in every text field: labels, titles, accessibility titles,
     and line and block accessibility descriptions; also in EOF comments after a
     statement and on the header line, with LF-terminated controls;
   - whitespace between a passed bare `%%` line and the header: VT, FF, NBSP,
     BOM, U+1680, U+2000–U+200A, U+202F, U+205F, U+3000, LS and PS, each on a
     whitespace-only line and immediately before the header; include ASCII
     space/tab controls;
   - the one-block detection skip: a second block, a block after a bare `%%{`
     line, a block after real frontmatter, a block before and a block after a
     second-scan directive as separate cases, and a block whose opening and
     closing fences share indentation;
   - a global directive glued immediately after a keyword, with the next keyword
     or value glued after it: judge the keyword boundary in the text without
     global directives and selected semicolons;
   - a global directive or a selected semicolon inside each diagram atom (a
     fixed word, a header keyword, an arrow, a common keyword, or a class name
     or icon value that cannot contain whitespace), and between its authored
     parts. Inside cases accepted by mermaid.js carry
     `directive-as-token-boundary` or `ignored-semicolon-as-token-boundary`:
     these split the atom itself, whereas a directive glued after a keyword
     touches its end.

   When a kind is missing from the list, add it here in the change that needs
   it.

10. Show as the result the number of fixtures per source (accepted and
    rejected), the unusual rejections, the fixtures marked, and the time
    `fixtures:generate` and `fixtures:check` take.

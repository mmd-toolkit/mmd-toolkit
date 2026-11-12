# Checking, before and after writing (eslint-plugin)

Section numbers below are those of [SKILL.md](../SKILL.md).

The scripts that run mermaid.js, parse a text, and format it are in
[references/probe-scripts.md](../../rule-ideas/references/probe-scripts.md) of
the rule-ideas skill. Set them up and run them as
[Scripts run outside the repository](../../conventions/SKILL.md#scripts-run-outside-the-repository)
in the skill conventions says.

1. What mermaid.js does: run every example through `runMermaid(text)` of
   `packages/tests/src/mermaid.ts`. Every example must be accepted (a rejected
   input is a syntax error, which no rule reports), and the values in the Db
   must be the ones the document states.
2. The condition on the tree: write the condition of the rule, in node types,
   fields, token kinds and values, and ranges, as code over the result of
   `parse(text)` of `packages/parser/src/index.ts` (`traverseNodes`,
   `root.tokens`, `root.comments`, `root.directives`), and check that it matches
   every incorrect example and no correct example. Add inputs at the boundary:
   with and without whitespace, `\n` and `\r\n`, the same line and the next
   line, directives, comment lines, inside a string, inside a subgraph,
   statements separated by `;` on one line.
3. Formatting: format every incorrect example with the formatting script, and
   check that the output does not show how mermaid.js reads it (the
   [criteria](../../rule-ideas/SKILL.md#policies-and-criteria) of the rule-ideas
   skill exclude a rule for what the formatter already makes visible). The
   plugin imports `@mmd-toolkit/parser`, which resolves to the built
   `packages/parser/lib`, not to the source; when the source of the parser has
   changed, rebuild it with `pnpm --filter @mmd-toolkit/parser run build` first,
   or the examples are formatted by the old parser. The formatted output of each
   incorrect example is part of the result of the work (section 9).
4. Examples and fixtures: the diagram content of every example is the output of
   formatting the `input.mmd` of the fixture of `packages/tests/fixtures` whose
   input is the text to show, with the formatting script (prettier-plugin-mmd,
   default options), without the final line terminator when the output ends with
   one (it does not when the text ends inside an unclosed directive). The
   fixture records how mermaid.js reads the example (the skill `conventions`: a
   Mermaid example is written as the formatter prints it). Use the output as it
   is, also where the formatter leaves a line as written. `update` does this for
   the examples of a document (section 6): write an example as the input of its
   fixture, run it, and read what it printed. Compare the example with the
   output after removing only its leading ESLint configuration comment; keep
   that comment when checking the published example with the parser or the
   site's renderer. The snapshot test helper removes only this comment, because
   its tester enables the same rule under `rule-to-test/` and enabling it under
   `@mmd-toolkit/` too would duplicate every report. The comment belongs to the
   published example, not to the corpus fixture: do not change the fixture to
   add it. An example kept as written on purpose, where a way of writing that
   the formatter prints in one form is the point (whitespace, the case of a
   value or a keyword, quotes, the form of a number), is the only exception.
   `<!-- prettier-ignore -->` stands directly before its code block, in both
   languages, and a sentence of Rule Details says that the example is shown as
   written and why: the formatter prints an empty `accDescr` block as
   `accDescr {}`, so an example with whitespace between the braces is kept. An
   example that shows a description block, and not a way of writing it, uses a
   block whose text has two lines or more, which the formatter keeps as a block;
   it needs no mark. `check:docs` reads neither that sentence nor whether the
   mark is still needed; a review does. Check that the `expected.json` of each
   fixture used says what the document claims, and use only fixtures whose
   `accepted` is true, also for the correct examples. For every example and
   claim without a fixture, add one by the steps of the skill `tests`: give the
   smallest input that shows it and the claim of the rule document that the
   fixture answers, and add it with `pnpm run fixtures:add`, which records what
   mermaid.js does (`packages/tests/docs/maintaining-fixtures.md`); then record
   its tree in the parser (the skill `parser`). Read its `expected.json` and use
   it in the tests of the rule. The document change is not done until the
   fixture exists.

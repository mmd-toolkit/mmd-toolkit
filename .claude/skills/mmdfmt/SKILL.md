---
name: mmdfmt
description: >-
  Maintain mmdfmt, the command-line tool that formats the Mermaid diagrams of
  .mmd and .mermaid files and of the code blocks of Markdown with Prettier and
  prettier-plugin-mmd: its source, its tests, its README, and its page on the
  documentation site. Use when the tool changes, and when a change of the plugin
  reaches the tool.
---

# Maintaining the command-line formatter (mmdfmt)

What holds for every package is in AGENTS.md and in the skill
[conventions](../conventions/SKILL.md); read them first. How a diagram is
printed is decided in the plugin, with the skill
[prettier-plugin](../prettier-plugin/SKILL.md). Which changes of the plugin are
changes to the tool, and the tests to run after them, are in
[section 12 of that skill](../prettier-plugin/SKILL.md#12-mmdfmt).

## Policies and criteria

`packages/mmdfmt`:

- Formats the diagrams of `.mmd` and `.mermaid` files and of the `mermaid` and
  `mmd` code blocks of Markdown with Prettier and the plugin, and changes
  nothing else in a Markdown file.
- How a diagram is printed is decided in the plugin only; the tool decides which
  text it formats and how it reports and exits.
- Its README defines what it does, and each sentence of it that defines a
  behavior has a test for each case it distinguishes (section 2).

## 1. How the tool works

- The tool calls Prettier with the plugin on the text of each diagram, finds the
  code blocks of Markdown with Prettier's Markdown parser
  (`prettier/plugins/markdown`), and replaces only their content lines
  (`src/markdown.ts`). A syntax error's message and offset are read from the
  parser's error kept as its `cause` (`src/diagram.ts`).
- The info strings it formats (`diagramLanguages` in `src/markdown.ts`) are the
  `aliases` of the plugin's language.
- What Prettier does with a byte order mark, with CRLF, with `endOfLine`, and
  with an embedded Markdown block: the item Prettier of
  [section 9 of the skill prettier-plugin](../prettier-plugin/SKILL.md#9-mistakes-to-avoid).

## 2. Tests

- Tests (`tests/*.test.ts`) write their inputs in the test code, so that line
  endings, a byte order mark, and U+2028 are escapes; the files of a run are
  written to a temporary directory outside the repository, so that no
  configuration of the repository applies. `tests/plugin-blocks.test.ts`
  compares the blocks the tool formats with those Prettier formats with the
  plugin.
- Which tests to run: `pnpm vitest run --project mmdfmt` after a change to the
  tool.
- `tests/package.test.ts` reads the build: run `pnpm --filter mmdfmt run build`
  first, as the test job of the CI does.
- A failure of the workspace lint or tests in a file outside this package is
  handled as the end of
  [section 6 of the skill prettier-plugin](../prettier-plugin/SKILL.md#6-tests)
  says.

## 3. Documents

- The page of the tool on the documentation site,
  `packages/docs/pages/formatter/mmdfmt.md` and its `.ja.md`, holds most of the
  text of the README, with a title and some paragraphs of its own. A change to a
  part of the README that the page holds changes the page in the same change. No
  check compares the two.

## 4. The working tree

The steps of this skill write `packages/mmdfmt`, its page on the documentation
site, and this skill. The working tree is treated as
[The working tree](../conventions/SKILL.md#the-working-tree) in the skill
conventions says. A change that another package needs is made as the last
paragraph of
[section 1 of the skill prettier-plugin](../prettier-plugin/SKILL.md#1-what-to-read-first)
says.

## 5. Checks and output

The checks before the report, and the report, are as
[section 8 of the skill prettier-plugin](../prettier-plugin/SKILL.md#8-checks-and-output)
says, with `packages/mmdfmt` as the package.

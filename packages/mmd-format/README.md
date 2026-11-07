# mmd-format

Japanese version: [README.ja.md](./README.ja.md)

This package is not implemented yet. This document is its overview, which the
implementation follows.

A command-line tool that formats [Mermaid](https://mermaid.js.org/) diagrams and
nothing else: `.mmd` and `.mermaid` files, and the `mermaid` and `mmd` code
blocks of Markdown files. The rest of a Markdown file stays byte for byte as it
is, so the tool works next to any Markdown formatter, or without one.

This is a third-party project, not affiliated with
[mermaid-js](https://mermaid.js.org/).

## Why it exists

[`prettier-plugin-mmd`](../prettier-plugin-mmd) reaches a code block only
through Prettier, and Prettier formats the whole Markdown file. A project that
formats its Markdown with another tool, or does not format it, cannot use the
plugin on its code blocks. This tool gives that project the same formatting of
the diagrams, with no Prettier configuration.

## Usage

```sh
npx mmd-format --write "**/*.{md,mmd,mermaid}"
npx mmd-format --check "**/*.{md,mmd,mermaid}"
npx mmd-format --stdin-filepath diagram.mmd < diagram.mmd
```

- `--write` rewrites the files that change.
- `--check` changes nothing, and lists the files that `--write` would change.
- `--stdin-filepath <path>` reads standard input and writes the result to
  standard output. The path says whether the text is a diagram or Markdown.
- `--tab-width <n>` and `--use-tabs` set the indentation, as `tabWidth` and
  `useTabs` do for the plugin. The default is two spaces.

The patterns are globs. Quote them, so that the tool expands them rather than
your shell. `node_modules` and the files that `.gitignore` lists are skipped.

## What is formatted

- Files ending in `.mmd` or `.mermaid`, as a whole.
- In files ending in `.md` or `.markdown`, fenced code blocks whose info string
  has `mermaid` or `mmd` as its first word, the same blocks as the plugin. The
  match is case-sensitive. A block inside a list or a block quote keeps its
  place: its lines keep the indentation and the `>` of their container.

A file keeps its line endings: only the text of a diagram changes in a Markdown
file, so the new text follows the file.

## When a diagram cannot be read

A diagram that mermaid.js rejects is not changed, as with the plugin.

- In a `.mmd` or `.mermaid` file, it is an error, with its position.
- In a Markdown code block, it is a warning, with its position, and the other
  blocks of the file are formatted. A document can show a rejected diagram on
  purpose, so such a block does not fail a run.

## Exit codes

| Code | Meaning                                                                    |
| ---- | -------------------------------------------------------------------------- |
| `0`  | Nothing went wrong, and with `--check`, every file is formatted.           |
| `1`  | With `--check`, a file would change.                                       |
| `2`  | An error: a syntax error in a diagram file, an unreadable file, an option. |

## How it relates to the other packages

The text of a diagram is formatted by Prettier with `prettier-plugin-mmd`, which
this package depends on, so the rules, the fixtures, and the compatibility notes
of the plugin apply to it. The user installs this package only and writes no
Prettier configuration.

One result differs from the plugin in Markdown, in favor of the diagram:
Prettier removes the whitespace at the end of the last line of a code block,
also where mermaid.js reads it
([Markdown code blocks](../prettier-plugin-mmd/docs/compatibility.md#markdown-code-blocks)).
This tool replaces only the text of the block, so that whitespace stays.

Code blocks are found with a Markdown parser rather than by scanning lines, so
that a fence inside another code block is not taken for a diagram.

## What it does not do

- It does not format anything but diagrams, and it does not read Prettier's
  configuration.
- It reports no mistakes in a diagram beyond syntax errors;
  [`@mmd-toolkit/eslint-plugin`](../eslint-plugin) does that.

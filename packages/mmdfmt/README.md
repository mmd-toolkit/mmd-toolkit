# mmdfmt

Japanese version: [README.ja.md](./README.ja.md)

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
the diagrams, and needs no Prettier configuration.

## Installation

It needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

```sh
npm install --save-dev mmdfmt
```

## Usage

```sh
npx mmdfmt --write "**/*.{md,mmd,mermaid}"
npx mmdfmt --check "**/*.{md,mmd,mermaid}"
npx mmdfmt --stdin-filepath diagram.mmd < diagram.mmd
```

- `--write` rewrites the files that change, and lists them on standard output.
- `--check` changes nothing, and lists on standard output the files that
  `--write` would change.
- `--stdin-filepath <path>` reads standard input and writes the result to
  standard output. The path says whether the text is a diagram or Markdown, and
  which Prettier configuration and ignore files apply. A path that the
  [patterns](#patterns) would skip gets its input back unchanged, and a path
  that does not end in one of the endings below is an error.
- `--help` prints the usage, and `--version` prints the version.

The tool takes patterns with either `--write` or `--check`, or
`--stdin-filepath` without them. Given anything else, for example no argument at
all, it prints the usage and exits with `2`.

### Patterns

A pattern selects files:

- The path of a file selects that file.
- The path of a directory selects the files under it.
- Any other pattern is a glob, and selects the files that it matches, also those
  whose names start with a dot. Quote it, so that the tool expands it rather
  than your shell.

A directory or a glob selects no file under `node_modules` or under the
directories of version control systems (`.git`, `.hg`, `.jj`, `.sl`, `.svn`), as
Prettier's CLI does not look into them.

Of the selected files, those whose names end in `.md`, `.markdown`, `.mmd`, or
`.mermaid` are formatted, each once, however many patterns select it. A pattern
that selects none of them is an error.

A selected file is skipped, as Prettier's CLI skips it, when it is under one of
those directories, which only its own path can select, or when the `.gitignore`
or the `.prettierignore` of the current directory lists it. A pattern that
selects only skipped files is not an error.

### Formatting options

There are no formatting options. Where the project has a Prettier configuration,
its `tabWidth` and `useTabs` for the file apply, found as Prettier's CLI finds
them, `.editorconfig` included; for a code block, the file is the Markdown file.
Otherwise a diagram is indented by two spaces, the default of the plugin.

## What is formatted

- Files ending in `.mmd` or `.mermaid`, as a whole.
- In files ending in `.md` or `.markdown`, fenced code blocks whose info string
  has `mermaid` or `mmd` as its first word, the same blocks as the plugin. The
  match is case-sensitive.

The code blocks are found with Prettier's Markdown parser rather than by
scanning lines, as Prettier finds them: a fence inside another code block is not
taken for a diagram, and a block inside a list or a block quote is found. A
block that Prettier leaves as written for a comment is left as it is too: the
block right after `<!-- prettier-ignore -->`, in any container, and the blocks
between `<!-- prettier-ignore-start -->` and `<!-- prettier-ignore-end -->` at
the top level of the file.

Only the lines between the fences change. A block inside a list or a block quote
keeps its place: each line that the tool writes starts with what stands before
the opening fence, with the marker of a list replaced by spaces, so that the
line keeps the indentation and the `>` of its container. Where the fence follows
a `>` at once, the lines get a space after that `>`: a block quote takes one
space after its `>` as part of its marker, so a line of the diagram that starts
with a space would lose that space otherwise. An empty line gets that start
without the spaces at its end: in a block quote, it keeps only the `>`.

A block that is not closed runs to the end of its list item, its block quote, or
the file, as Prettier's Markdown parser reads it, and is formatted all the same.
When it ends the file without a line ending, its last line still has none.

A tab in the indentation of a line can be read partly as indentation and partly
as the text of the diagram: inside a list item indented by two spaces, a tab at
the start of a line reaches the fourth column, and its last two columns are
text. A block with such a line is not formatted, and a warning gives the
position of the tab: the text of the diagram is not written as such in the file,
so it cannot be replaced alone.

A block whose opening fence stands on the line of a footnote label, as in
`[^1]: ```mermaid`, is not formatted either, and a warning gives the position of
the fence: the lines of a footnote are indented by four spaces, not by what
stands before the fence.

Text that is empty or only whitespace is formatted as an empty text, as Prettier
formats it, without an error or a warning: a code block of only blank lines, or
a `.mmd` file of them, becomes empty.

A file keeps its line endings. Each line that the tool writes ends as the first
line of the file ends, or with `\n` in a file of one line. In a Markdown file,
the tool writes only the lines of the diagrams that change.

## When a diagram cannot be read

A diagram that mermaid.js rejects is not changed, as with the plugin.

- In a `.mmd` or `.mermaid` file, it is an error, with its position.
- In a Markdown code block, it is a warning, with its position, and the other
  blocks of the file are formatted. A document can show a rejected diagram on
  purpose, so such a block does not fail a run.

Errors and warnings go to standard error, one on a line, as
`path:line:column: error: message` or `path:line:column: warning: message`. The
line and the column, both counted from 1, are those of the file, also for a code
block: a line ends at `\n`, `\r\n`, or `\r`, and a column counts UTF-16 code
units, as most editors count them.

## Exit codes

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| `0`  | Nothing went wrong, and with `--check`, every file is formatted. |
| `1`  | With `--check`, a file would change, and nothing went wrong.     |
| `2`  | An error.                                                        |

An error is a syntax error in a diagram file, a file that cannot be read or
written, a pattern that selects no file, a Prettier configuration that cannot be
read, or a wrong use of the options. With an error, the code is `2` even when a
file would change.

## How it relates to the other packages

The text of a diagram is formatted by Prettier with `prettier-plugin-mmd`, which
this package depends on, so the rules, the fixtures, and the compatibility notes
of the plugin apply to it. The user installs this package only, and needs no
Prettier configuration.

Two results differ from the plugin in Markdown:

- Prettier removes the whitespace at the end of the last line of a code block,
  also where mermaid.js reads it
  ([Markdown code blocks](../prettier-plugin-mmd/docs/compatibility.md#markdown-code-blocks)).
  This tool replaces only the text of the block, so that whitespace stays.
- Prettier formats a code block of Markdown, such as one whose info string is
  `md`, as a Markdown document, and with it the diagrams in its code blocks.
  This tool formats the diagrams of the file and leaves the content of every
  other code block as it is.

## What it does not do

- It formats nothing but diagrams. Of a Prettier configuration it uses only the
  indentation; the plugins and the other options there are not used.
- It reports no mistakes in a diagram beyond syntax errors;
  [`@mmd-toolkit/eslint-plugin`](../eslint-plugin) does that.

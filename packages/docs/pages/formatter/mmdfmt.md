# Formatting diagrams only with mmdfmt

`mmdfmt` is a command that formats Mermaid diagrams and nothing else: `.mmd` and
`.mermaid` files, and the `mermaid` and `mmd` code blocks of Markdown files. The
rest of a Markdown file stays byte for byte as it is.

Use it when Prettier does not format your Markdown, because you format it with
another tool or not at all. [`prettier-plugin-mmd`](./index.md) reaches a code
block only through Prettier, and Prettier formats the whole Markdown file.
`mmdfmt` runs Prettier with the plugin on the diagrams alone, so they are
formatted as the plugin formats them, and your project needs no Prettier
configuration.

## Installation

Install `mmdfmt` in your project:

```sh
npm install --save-dev mmdfmt
```

It needs Node.js `^22.13.0 || >=24`.

## Format your first file

Save this Markdown as `notes.md`:

<!-- prettier-ignore -->
````md
# Notes

*   Prettier would rewrite this list item.

```mermaid
flowchart LR
  A --> B; B --> C
```
````

Run `mmdfmt` with `--write` and the file:

```sh
npx mmdfmt --write notes.md
```

`mmdfmt` rewrites the files that change and lists them on standard output. Only
the diagram changes; the list item keeps its `*` and its spaces:

<!-- prettier-ignore -->
````md
# Notes

*   Prettier would rewrite this list item.

```mermaid
flowchart LR
  A --> B
  B --> C
```
````

To format a whole project, give a glob. Quote it, so that `mmdfmt` expands it
rather than your shell:

```sh
npx mmdfmt --write "**/*.{md,mmd,mermaid}"
```

## Check formatting in CI

`--check` changes nothing and lists the files that `--write` would change. It
exits with `1` when a file would change, so the command can fail a CI job:

```sh
npx mmdfmt --check "**/*.{md,mmd,mermaid}"
```

## Standard input

`--stdin-filepath` formats standard input and writes the result to standard
output. The path says whether the text is a diagram or Markdown, and which
configuration and ignore files apply; the file at the path is neither read nor
written:

```sh
npx mmdfmt --stdin-filepath diagram.mmd < diagram.mmd
```

## Which files are formatted

A pattern is the path of a file, the path of a directory, or a glob. Of the
files that the patterns select, those ending in `.md`, `.markdown`, `.mmd`, or
`.mermaid` are formatted. A pattern that selects none of them is an error.

As Prettier's CLI does, `mmdfmt` skips the files under `node_modules` and under
the directories of version control, and the files that the `.gitignore` or the
`.prettierignore` of the current directory lists. In Markdown, a code block
right after `<!-- prettier-ignore -->` is left as written.

## Indentation

`mmdfmt` has no formatting options. A diagram is indented by two spaces. When
your project has a Prettier configuration or an `.editorconfig`, its `tabWidth`
and `useTabs` apply; [Options](./options.md) describes how they indent diagrams.
Nothing else of the configuration is used.

## Errors and exit codes

A diagram that mermaid.js rejects is left as it is. In a `.mmd` or `.mermaid`
file, it is an error. In a Markdown code block, it is a warning, and the other
blocks of the file are still formatted, because a document can show a rejected
diagram on purpose. Errors and warnings go to standard error, with the line and
the column in the file:

```txt
docs/flow.mmd:3:1: error: Unexpected end of text
notes.md:6:1: warning: Unexpected end of text
```

| Exit code | Meaning                                                          |
| --------- | ---------------------------------------------------------------- |
| `0`       | Nothing went wrong, and with `--check`, every file is formatted. |
| `1`       | With `--check`, a file would change, and nothing went wrong.     |
| `2`       | An error.                                                        |

An error is a syntax error in a diagram file, a file that cannot be read or
written, a pattern that selects no file, a Prettier configuration that cannot be
read, or a wrong use of the options. With an error, the code is `2` even when a
file would change.

## Differences from Prettier with the plugin

In Markdown, two results differ from formatting with Prettier and the plugin:

- Prettier removes the whitespace at the end of the last line of a code block,
  also where mermaid.js reads it ([Compatibility](./compatibility.md)). `mmdfmt`
  replaces only the text of the block, so that whitespace stays.
- Prettier formats a code block of Markdown, such as one marked `md`, as a
  Markdown document, and with it the diagrams in its code blocks. `mmdfmt`
  leaves every other code block as it is.

The [README of `mmdfmt`](../../../mmdfmt/README.md) describes every case in
detail, such as code blocks in lists and block quotes, tabs in their
indentation, and line endings.

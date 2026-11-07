# mmdfmt

Japanese version: [README.ja.md](./README.ja.md)

Format the [Mermaid](https://mermaid.js.org/) diagrams in your Markdown and
`.mmd` files, and leave everything else as you wrote it.

`mmdfmt` formats `.mmd` and `.mermaid` files, and the `mermaid` and `mmd` code
blocks of `.md` and `.markdown` files. The rest of a Markdown file stays byte
for byte as it is. The diagrams are formatted by
[Prettier](https://prettier.io/) with
[`prettier-plugin-mmd`](../prettier-plugin-mmd), the Mermaid plugin for
Prettier, so they come out as that plugin prints them, apart from the two cases
in [If you know Prettier](#if-you-know-prettier).

This is a third-party project, not affiliated with
[mermaid-js](https://mermaid.js.org/). The
[mmdfmt guide](https://mmd-toolkit.github.io/mmd-toolkit/formatter/mmdfmt.html)
is on the documentation site.

## When to use it

Use `mmdfmt` when you want your diagrams formatted but do not let Prettier
format your Markdown:

- You format Markdown with another formatter, such as `markdownlint --fix` or
  dprint. Prettier would rewrite the same text its own way.
- You keep your Markdown as you write it, on purpose.
- You use Prettier for other files, and keep it off your Markdown.

If Prettier already formats your Markdown, add `prettier-plugin-mmd` to it
instead: Prettier then formats the diagrams in the same run, and you do not need
`mmdfmt`.

`mmdfmt` needs no Prettier setup; it is one command.

## What it does not do

- It formats nothing but diagrams.
- It reports no mistakes in a diagram beyond what mermaid.js rejects;
  [`@mmd-toolkit/eslint-plugin`](../eslint-plugin) does that.

## Quick start

`mmdfmt` needs Node.js `^22.13.0 || >=24`. `--write` rewrites files in place, so
commit your work first, or see which files would change with
`npx mmdfmt --check .`. To format every diagram under the current directory:

```sh
npx mmdfmt --write .
```

Only the diagrams change. This `notes.md`:

<!-- prettier-ignore -->
````md
# Notes

*   A list item that mmdfmt leaves as it is.

```mermaid
flowchart LR
  A --> B; B --> C
```
````

becomes:

<!-- prettier-ignore -->
````md
# Notes

*   A list item that mmdfmt leaves as it is.

```mermaid
flowchart LR
  A --> B
  B --> C
```
````

Without `mmdfmt` installed, `npx` asks to download it and runs its latest
version; to keep using one version, [install it](#installation).

## Installation

A new version of `mmdfmt` can format a diagram a little differently. Pin an
exact version in your project, so that everyone who works on it, and your CI,
format the same way:

```sh
npm install --save-dev --save-exact mmdfmt
```

With pnpm, `pnpm add --save-dev --save-exact mmdfmt`. `npx mmdfmt` (or
`pnpm exec mmdfmt`) then runs that version.

To use it yourself across many repositories, install it globally, and run it as
`mmdfmt`:

```sh
npm install --global mmdfmt
```

A global install is not pinned to a project, so two machines can format a
diagram differently.

## Usage

```sh
mmdfmt --write <pattern>...
mmdfmt --check <pattern>...
mmdfmt --stdin-filepath <path>
```

| Option                    | What it does                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `--write`                 | Formats the files in place, and lists on standard output the ones that changed.              |
| `--check`                 | Changes nothing. Lists on standard output the files that `--write` would change.             |
| `--stdin-filepath <path>` | Formats standard input as if it were the file at `<path>`, and writes it to standard output. |
| `-h`, `--help`            | Prints the usage on standard output.                                                         |
| `-v`, `--version`         | Prints the version on standard output.                                                       |

Give patterns with either `--write` or `--check`, or give `--stdin-filepath`
alone. `--help` and `--version` only print, whatever else of this table is given
with them. Any other combination is an error. With no argument at all, `mmdfmt`
prints the usage on standard error and exits with `2`.

There are no other options: no formatting options, no configuration file of its
own, and no option for an ignore file. An option that takes no value ignores a
value written after `=`: `--write=false` is read as `--write`, as the argument
library [gunshi](https://gunshi.dev) reads it.

When the reader of standard output goes away, as `head` does once it has its
lines, `mmdfmt` writes no more there and says nothing, and finishes the run:
`--write` still rewrites every file, and the exit code still tells the result.

### Patterns

- The path of a file selects that file.
- The path of a directory, such as `.`, selects the files under it.
- Any other pattern is a glob, which also matches names that start with a dot.
  Quote it, so that `mmdfmt` expands it rather than your shell:
  `npx mmdfmt --write "docs/**/*.md"`. On Windows, a `\` in a glob is read as
  `/`.
- A pattern that starts with `!` takes the files it matches out of the others.
  See [Excluding files](#excluding-files).
- After `--`, every argument is a pattern, so a file whose name starts with `-`
  can be given: `mmdfmt --write -- -a.md`.

Of the selected files, those ending in `.md`, `.markdown`, `.mmd`, or `.mermaid`
are formatted, each once, however many patterns select it. A pattern that
selects none of them is an error: `mmdfmt --check .` fails in a project without
such a file, and so does a file with another ending given by name. A pattern
whose files a `!` pattern all takes out is an error too, as in Prettier's CLI. A
pattern that selects only files that the `.gitignore` lists is not an error.

As Prettier's CLI does, `mmdfmt` skips without a word a pattern that names a
path in `node_modules` or in a directory of version control, whether a file, a
directory, or a glob, such as `node_modules/pkg` or `"node_modules/**/*.md"`.
When no pattern is left to select files, that is an error.

## Excluding files

`mmdfmt` leaves out:

- the files under `node_modules`, and under the directories of version control
  (`.git`, `.hg`, `.jj`, `.sl`, `.svn`), also when a pattern names them
  ([Patterns](#patterns));
- the files that the `.gitignore` in the directory where you run `mmdfmt` lists.
  Other `.gitignore` files, in subdirectories or above, are not read;
- the files that a `!` pattern matches. In bash, put such a pattern in single
  quotes, since `!` in double quotes starts a history expansion:
  `npx mmdfmt --write . '!vendor/**'`. In the Windows command prompt, use double
  quotes.

`mmdfmt` does not read `.prettierignore`. A project that keeps Prettier off its
Markdown by listing it there still gets its diagrams formatted.

To leave one diagram in a Markdown file as it is, put `<!-- prettier-ignore -->`
before its code block, with nothing between them but blank lines. Outside lists
and block quotes, `<!-- prettier-ignore-start -->` and
`<!-- prettier-ignore-end -->` leave every diagram between them. These are the
comments that Prettier reads. To leave a whole `.mmd` file as it is, exclude it
with a `!` pattern or `.gitignore`.

## Checking in CI

Install `mmdfmt` in the project, install the dependencies in CI (`npm ci`), and
run:

```sh
npx mmdfmt --check .
```

When a file is not formatted, `--check` lists it on standard output and exits
with `1`. When every file is formatted, it prints nothing and exits with `0`.
Without the dependencies installed, `npx` would run the latest version instead
of the pinned one.

A `.mmd` or `.mermaid` file whose diagram mermaid.js rejects fails the check
with `2`. A diagram in Markdown that mermaid.js rejects gives only a warning,
because a document can show a broken diagram on purpose, and `mmdfmt` has no
option to fail on it. To fail CI on such a diagram, lint the Markdown with
[`@mmd-toolkit/eslint-plugin`](../eslint-plugin), which reports it.

In a project without any diagram file, `--check .` fails with `2`; give the
directories that hold diagrams instead of `.`.

## Formatting before a commit

With [lint-staged](https://github.com/lint-staged/lint-staged), which a Git hook
manager such as husky or simple-git-hooks runs on each commit, add this to
`package.json`:

```json
{
  "lint-staged": {
    "*.{md,markdown,mmd,mermaid}": "mmdfmt --write"
  }
}
```

Keep the glob to these four endings: `mmdfmt` has no option such as Prettier's
`--ignore-unknown`, and a file with another ending is an error. lint-staged
passes absolute paths, which `mmdfmt` accepts.

## From an editor or another tool

`mmdfmt` has no editor extension. An editor or a tool that runs a formatter on
standard input can run:

```sh
mmdfmt --stdin-filepath docs/guide.md
```

with the text of the file on standard input, and take the formatted text from
standard output. The file at the path is neither read nor written. The path, if
relative, is resolved against the directory where `mmdfmt` runs; its ending says
whether the text is a diagram or Markdown, and its directory says which
`.editorconfig` and Prettier configuration apply.

- A Markdown text is written out in full, formatted or already formatted, and
  the exit code is `0`, also when a diagram in it is rejected; the warning goes
  to standard error.
- A diagram whose text mermaid.js rejects gets nothing on standard output, an
  error on standard error, and the exit code `2`.
- A path under `node_modules` or a directory of version control, or listed in
  the `.gitignore` of the directory where `mmdfmt` runs, gets its text back
  unchanged.
- A path with another ending is an error.

## Indentation

A diagram is indented by two spaces. When an `.editorconfig` or a Prettier
configuration applies to the file, its indentation is used: `indent_style`,
`indent_size`, and `tab_width` of `.editorconfig`, or `useTabs` and `tabWidth`
of a [Prettier configuration file](https://prettier.io/docs/configuration),
found as Prettier's CLI finds them, `overrides` included. For a code block, the
file is the Markdown file. A configuration file that cannot be read is an error.
For example, this `.editorconfig` indents diagrams by four spaces:

```ini
[*.{md,mmd,mermaid}]
indent_style = space
indent_size = 4
```

Nothing else of a configuration is used.

## Errors and exit codes

A diagram that mermaid.js rejects is left as it is, and reported on standard
error with its line and column in the file. The other files, and the other
diagrams of the file, are still formatted:

```txt
docs/flow.mmd:3:1: error: Unexpected end of text
notes.md:6:1: warning: Unexpected end of text
```

In a `.mmd` or `.mermaid` file, it is an error. In a Markdown code block, it is
a warning. Lines and columns count from 1, and a column counts UTF-16 code
units, as most editors do.
[Formatter compatibility](https://mmd-toolkit.github.io/mmd-toolkit/formatter/compatibility.html)
explains which diagrams are rejected.

| Code | Meaning                                                       |
| ---- | ------------------------------------------------------------- |
| `0`  | No errors, and with `--check`, every file is formatted.       |
| `1`  | With `--check`, a file would change, and there are no errors. |
| `2`  | An error.                                                     |

An error is a rejected diagram in a `.mmd` or `.mermaid` file, a file that
cannot be read or written, a pattern that selects no file, a configuration that
cannot be read, or a wrong use of the options. With an error, the code is `2`
even when a file would change.

## If you know Prettier

The diagrams are formatted by Prettier with `prettier-plugin-mmd`, so the rules
of the plugin apply. Two results differ from running Prettier with the plugin on
Markdown:

- Prettier removes the whitespace at the end of the last line of a code block,
  even where mermaid.js treats it as part of the diagram
  ([Markdown code blocks](../prettier-plugin-mmd/docs/compatibility.md#markdown-code-blocks)).
  `mmdfmt` replaces only the text of the block, so that whitespace stays.
- Prettier formats a code block of Markdown, such as one marked `md`, as a
  Markdown document, and with it the diagrams in its code blocks. `mmdfmt`
  leaves every other code block as it is.

The command differs from Prettier's CLI too: it does not read `.prettierignore`,
has no `--ignore-path`, `--ignore-unknown`, or formatting options, and uses only
the indentation of a configuration.

## Code blocks in detail

The code blocks are those whose info string has `mermaid` or `mmd` as its first
word, case-sensitively, found as Prettier's Markdown parser finds them. A fence
inside another code block is not taken for a diagram, and a block inside a list
or a block quote is found.

Only the lines between the fences change. Each line that `mmdfmt` writes starts
with what stands before the opening fence on its line, with a list marker turned
into spaces, so that the diagram stays in its list item and its block quote. An
empty line gets that start without the spaces at its end, so that in a block
quote it is a `>` alone. For example, this block:

<!-- prettier-ignore -->
````md
> - ```mermaid
>   flowchart LR
>   A-->B
>
>   B-->C
>   ```
````

becomes:

<!-- prettier-ignore -->
````md
> - ```mermaid
>   flowchart LR
>     A --> B
>
>     B --> C
>   ```
````

When the opening fence follows a `>` at once, as in `>```mermaid`, the lines get
a space after the `>`. A block quote reads one space after its `>` as part of
its marker, so a line of the diagram that starts with a space would lose it
otherwise.

A block that is not closed runs to the end of its list item, its block quote, or
the file, and is formatted all the same. When it ends the file without a line
ending, its last line still has none.

Two kinds of block are left as written, with a warning that gives the position:

- a block with a tab in its indentation that is read partly as indentation and
  partly as the diagram, as at the start of a line in a list item indented by
  two spaces;
- a block whose opening fence stands on the line of a footnote label, as in
  `[^1]: ```mermaid`.

A diagram that is empty or only whitespace becomes empty.

A file keeps its line endings. Each line that `mmdfmt` writes ends as the first
line of the file ends, or with `\n` in a file of one line. In a Markdown file,
only the lines of the diagrams that change are written. For the line and the
column of an error or a warning, a line ends at `\n`, `\r\n`, or `\r`.

## Documentation

- [Formatter options](https://mmd-toolkit.github.io/mmd-toolkit/formatter/options.html):
  how the indentation applies to diagrams.
- [Formatter compatibility](https://mmd-toolkit.github.io/mmd-toolkit/formatter/compatibility.html):
  rejected diagrams, differences from mermaid.js, and what the formatting
  guarantees.

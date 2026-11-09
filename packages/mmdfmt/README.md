# mmdfmt

Japanese version: [README.ja.md](./README.ja.md)

Format the [Mermaid](https://mermaid.js.org/) diagrams in your Markdown and
`.mmd` files, and leave everything else as you wrote it.

`mmdfmt` formats `.mmd` and `.mermaid` files, and the `mermaid` and `mmd` code
blocks of `.md` and `.markdown` files. The rest of a Markdown file stays byte
for byte as it is. The diagrams are formatted by
[Prettier](https://prettier.io/) with
[`prettier-plugin-mmd`](../prettier-plugin-mmd), the Mermaid plugin for
Prettier, so they come out as that plugin prints them, apart from the cases in
[If you know Prettier](#if-you-know-prettier).

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

## From a script

`format` formats a text as Prettier's `format` does, except that in Markdown it
formats only the Mermaid code blocks and leaves the rest as written. A tool
written for Node.js, such as a language server that formats the diagrams of a
file open in an editor, can call it instead of running the command:

```js
import { readFile } from "node:fs/promises"
import { format } from "mmdfmt"
import { resolveConfig } from "prettier"

const filepath = "docs/notes.md"
const source = await readFile(filepath, "utf8")
const config = await resolveConfig(filepath, { editorconfig: true })
const formatted = await format(source, {
  filepath,
  tabWidth: config?.tabWidth,
  useTabs: config?.useTabs,
  printWidth: config?.printWidth,
})
```

`format(source, options)` returns a promise of the formatted text. It takes four
of Prettier's options: `filepath`, whose ending says whether the text is a
diagram or Markdown, and `tabWidth`, `useTabs`, and `printWidth`; another option
is a type error. Like Prettier's `format`, it reads no file and no
configuration. The caller resolves the configuration with Prettier's
`resolveConfig`, as above, with the path that it gives `format`, since the
`overrides` of a configuration apply by path, and with `editorconfig: true` for
an `.editorconfig` to be read. Given the options that the command finds for a
path (see [Indentation and line width](#indentation-and-line-width)), `format`
returns the text that `--stdin-filepath` writes for it.

- In Markdown, `printWidth` is the width of the lines of the file: a diagram in
  a list item or a block quote gets that width less what stands before its
  lines, as in [Code blocks in detail](#code-blocks-in-detail).
- The line endings stay as they are in the text, and so does a byte order mark;
  `format` takes no `endOfLine`.
- A `.mmd` or `.mermaid` diagram that mermaid.js rejects makes `format` throw
  the `SyntaxError` that Prettier's `format` throws for it with
  `prettier-plugin-mmd`, with its `loc`.
- In Markdown, a diagram that mermaid.js rejects, and a block that the command
  leaves as written with a warning, stay as written without an error, as
  Prettier leaves an embedded code block that it cannot format. A tool that
  needs to know which diagrams are rejected can parse them with
  [`@mmd-toolkit/parser`](../parser) or lint them with
  [`@mmd-toolkit/eslint-plugin`](../eslint-plugin).
- A path with another ending throws an error.

Unlike the command, `format` skips no path: a path under `node_modules` or a
directory of version control, or listed in a `.gitignore`, is formatted all the
same, since the caller chooses which files to format.

## Indentation and line width

A diagram is indented by two spaces, and its line width is Prettier's 80. When
an `.editorconfig` or a Prettier configuration applies to the file, its
indentation and its line width are used: `indent_style`, `indent_size`,
`tab_width`, and `max_line_length` of `.editorconfig`, or `useTabs`, `tabWidth`,
and `printWidth` of a
[Prettier configuration file](https://prettier.io/docs/configuration), found as
Prettier's CLI finds them, `overrides` included. For a code block, the file is
the Markdown file. A configuration file that cannot be read is an error. For
example, this `.editorconfig` indents diagrams by four spaces and lets a line
stay up to 100 columns wide:

```ini
[*.{md,mmd,mermaid}]
indent_style = space
indent_size = 4
max_line_length = 100
```

The line width decides two things in a diagram: whether a data block `@{ … }` on
one line is printed on several lines, and whether the colons of the tasks of a
Gantt section are lined up (see
[Formatter options](https://mmd-toolkit.github.io/mmd-toolkit/formatter/options.html#line-width)).
`max_line_length = off` is no limit. Nothing else of a configuration is used.

## Errors and exit codes

A diagram that mermaid.js rejects is left as it is, and reported on standard
error with its line and column. The other files, and the other diagrams of the
file, are still formatted:

```txt
docs/flow.mmd:3:1: error: Unexpected end of text
notes.md:6:1: warning: Unexpected end of text
```

In a `.mmd` or `.mermaid` file, it is an error. In a Markdown code block, it is
a warning. With `--write` and `--stdin-filepath`, the position of a warning is
in the text after formatting, where the diagrams above it may have gained or
lost lines, so that it points at the block in what you open after the run. With
`--check`, which writes nothing, it is in the file as it is. Lines and columns
count from 1, and a column counts UTF-16 code units, as most editors do.
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
of the plugin apply. Four results differ from running Prettier with the plugin
on Markdown:

- Prettier removes the whitespace at the end of the last line of a code block,
  even where mermaid.js treats it as part of the diagram
  ([Markdown code blocks](../prettier-plugin-mmd/docs/compatibility.md#markdown-code-blocks)).
  `mmdfmt` replaces only the text of the block, so that whitespace stays.
- Prettier formats a code block of Markdown, such as one marked `md`, as a
  Markdown document, and with it the diagrams in its code blocks. `mmdfmt`
  leaves every other code block as it is.
- Prettier prints the marker of a list item itself and aligns the content of the
  item to `tabWidth`, while `mmdfmt` keeps the marker as written (see
  [Code blocks in detail](#code-blocks-in-detail)). Where the two give the
  content another column, the line width left for a diagram in the item differs
  by that, and a block of one line near the width can be split by one and not by
  the other.
- In a list item or a block quote, Prettier gives the plugin the line width as
  it is, without the width of what stands before the lines, and the plugin
  counts the lines of a Gantt section with it, to line up their colons. `mmdfmt`
  gives the plugin the width less what it writes before the lines, so near the
  width a Gantt section can be lined up by Prettier and not by `mmdfmt`, whose
  lines then stay within the line width.

The command differs from Prettier's CLI too: it does not read `.prettierignore`,
has no `--ignore-path`, `--ignore-unknown`, or formatting options, and uses only
the indentation and the line width of a configuration.

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
ending, its last line still has none. The lines at its end that are empty or
hold only spaces and tabs are left as written, and so is a block that holds
nothing else. Markdown reads them as part of the block, but they also part it
from what follows, as an empty line between two items keeps a list loose, with
space between its items.

Two kinds of block are left as written, with a warning that gives the position:

- a block with a tab in its indentation that is read partly as indentation and
  partly as the diagram, as at the start of a line in a list item indented by
  two spaces;
- a block whose opening fence stands on the line of a footnote label, as in
  `[^1]: ```mermaid`.

A diagram that is empty or only whitespace between its fences becomes empty.

The line width of a diagram in a list item or a block quote is the line width of
the file less the width of what `mmdfmt` writes before each of its lines, a tab
counting as `tabWidth` and the width being at least 1. Prettier measures a data
block `@{ … }` inside the container in the same way. For example, with a line
width of 40, a diagram in a list item whose lines start with two spaces is
formatted for 38 columns. The colons of a Gantt section are the exception:
Prettier gives the plugin the line width as it is, so it does not count what
stands before the lines (see [If you know Prettier](#if-you-know-prettier)).

A file keeps its line endings. Each line that `mmdfmt` writes ends as the first
line of the file ends, or with `\n` in a file of one line, except the last,
which ends as the last line of the diagram ended before formatting. The line
after the lines written then follows the same line ending as before; another one
could join with that line's into one, as a `\r` before an empty line that ends
with `\n` is read as one `\r\n`, and the number of lines would change. When the
diagram becomes empty, the line of the opening fence ends that way in place of
its own: the one change outside the lines between the fences. In a Markdown
file, only the lines of the diagrams that change are written. For the line and
the column of an error or a warning, a line ends at `\n`, `\r\n`, or `\r`.

## Documentation

- [Formatter options](https://mmd-toolkit.github.io/mmd-toolkit/formatter/options.html):
  how the indentation and the line width apply to diagrams.
- [Formatter compatibility](https://mmd-toolkit.github.io/mmd-toolkit/formatter/compatibility.html):
  rejected diagrams, differences from mermaid.js, and what the formatting
  guarantees.

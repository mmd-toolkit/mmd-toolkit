# Formatting diagrams only with mmdfmt

Format the [Mermaid](https://mermaid.js.org/) diagrams in your Markdown and
`.mmd` files, and leave everything else as you wrote it.

`mmdfmt` formats `.mmd` and `.mermaid` files, and the `mermaid` and `mmd` code
blocks of `.md` and `.markdown` files. The rest of a Markdown file stays byte
for byte as it is. The diagrams are formatted by
[Prettier](https://prettier.io/) with [`prettier-plugin-mmd`](./index.md), the
Mermaid plugin for Prettier, so they come out as that plugin prints them, apart
from the cases in [If you know Prettier](#if-you-know-prettier).

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
  [`@mmd-toolkit/eslint-plugin`](../linter/index.md) does that.

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
mmdfmt --write [--check | --list-different] <pattern>...
mmdfmt --check <pattern>...
mmdfmt --list-different <pattern>...
mmdfmt --stdin-filepath <path>
```

| Option                    | What it does                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `-w`, `--write`           | Formats the files in place, and lists each file it formats on standard output, with its time. |
| `-c`, `--check`           | Checks whether the files are formatted, and prints a summary and the files that are not.      |
| `-l`, `--list-different`  | Changes nothing. Lists on standard output the files that `--write` would change.              |
| `--stdin-filepath <path>` | Formats standard input as if it were the file at `<path>`, and writes it to standard output.  |
| `-h`, `--help`            | Prints the usage on standard output.                                                          |
| `-v`, `--version`         | Prints the version on standard output.                                                        |

Give patterns with at least one of `--write`, `--check`, or `--list-different`.
`--write` can be combined with either `--check` or `--list-different`:
`--write --check` rewrites files and prints the check's summary and warnings;
`--write --list-different` rewrites files and lists only the ones that changed.
`--check` and `--list-different` cannot be combined. `--no-write`, `--no-check`,
and `--no-list-different` turn the option off. `--stdin-filepath` takes no
patterns, and with it `--write` writes no file. `--help` and `--version` only
print, whatever else of this table is given with them. With no argument at all,
`mmdfmt` prints the usage on standard error and exits with `2`.

`--write` alone prints a line for each file it formats, as Prettier does: the
name and the time that formatting it took, such as `docs/flow.mmd 12ms`,
followed by `(unchanged)` for a file that did not change. On a terminal that
shows colors, the name of an unchanged file is gray. To list only the files that
changed, give `--write --list-different`. The name of a file in what `mmdfmt`
prints is its path relative to the directory where it runs, with `/` between its
parts also on Windows, as Prettier writes it.

There are no other options: no formatting options, no configuration file of its
own, and no option for an ignore file. An option that takes no value ignores a
value written after `=`: `--write=false` is read as `--write`.

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

Without the dependencies installed, `npx` would run the latest version instead
of the pinned one.

`--check` prints `Checking formatting...` on standard output, then
`[warn] <name>` on standard error for each file that would change, and at the
end one summary. When a file would change, the summary is on standard error, and
the exit code is `1`:

```txt
[warn] Code style issues found in the above file. Run mmdfmt with --write to fix.
```

With more than one such file, it says `in <n> files` instead of
`in the above file`. On a terminal that shows colors, the word `warn` is yellow.
When no file would change, the summary is
`All diagrams in the matched files use Prettier code style!` on standard output,
and the exit code is `0`. `--list-different` prints only the names of the files
that would change, on standard output, with the same exit codes.

With `--write --check`, the files are rewritten, the summary is
`[warn] Code style issues fixed in the above file.` (or `in <n> files.`), and
the exit code is `0`. With an error, the exit code is `2`;
[Errors and exit codes](#errors-and-exit-codes) says which summary then follows.

A `.mmd` or `.mermaid` file whose diagram mermaid.js rejects fails the check
with `2`. A diagram in Markdown that mermaid.js rejects gives only a warning,
because a document can show a broken diagram on purpose, and `mmdfmt` has no
option to fail on it. To fail CI on such a diagram, lint the Markdown with
[`@mmd-toolkit/eslint-plugin`](../linter/markdown.md), which reports it.

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
- With `--check` or `--list-different`, the text is not written out: when it
  would change, `(stdin)` goes to standard output and the exit code is `1`,
  unless `--write` is given too; otherwise nothing is written and the exit code
  is `0`. The position of a warning is in the text as it was read.
- A path with another ending is an error.

## Configuration

A diagram is indented by two spaces, and its line width is Prettier's 80. When
an `.editorconfig` or a Prettier configuration applies to the file, `mmdfmt`
reads eight options of it, found as Prettier's CLI finds it, `overrides`
included: `indent_style`, `indent_size`, `tab_width`, and `max_line_length` of
`.editorconfig`, or the options of a
[Prettier configuration file](https://prettier.io/docs/configuration). For a
code block, the file is the Markdown file. A configuration file that cannot be
read is an error. For example, this `.editorconfig` indents diagrams by four
spaces and lets a line stay up to 100 columns wide:

```ini
[*.{md,mmd,mermaid}]
indent_style = space
indent_size = 4
max_line_length = 100
```

The eight options are:

- `printWidth` is the line width. It decides two things in a diagram: whether a
  data block `@{ … }` on one line is printed on several lines, and whether the
  colons of the tasks of a Gantt section are lined up (see
  [Formatter options](./options.md#line-width)). `max_line_length = off` is no
  limit. In a code block in a list or a block quote, `printWidth` is less the
  width of what `mmdfmt` writes before the lines (see
  [Code blocks in detail](../../../mmdfmt/README.md#code-blocks-in-detail)).
- `tabWidth` and `useTabs` set the indentation of a diagram.
- `embeddedLanguageFormatting`, `singleQuote`, `bracketSpacing`, `proseWrap`,
  and `trailingComma` apply to the YAML frontmatter of a diagram, as they do
  when Prettier formats it with `prettier-plugin-mmd`.
  `embeddedLanguageFormatting: "off"` leaves the frontmatter as written.

`mmdfmt` reads no other option, not even one that a later version of Prettier
adds. The range (`rangeStart` and `rangeEnd`), `cursorOffset`, the pragma
options (`requirePragma`, `insertPragma`, and `checkIgnorePragma`), `filepath`,
and the options of other languages are not used. `plugins` and `parser` are not
used either: `mmdfmt` always formats with `prettier-plugin-mmd`, so a plugin
that the configuration names is not loaded. `endOfLine` is not used, since a
file keeps its line endings (see
[Code blocks in detail](../../../mmdfmt/README.md#code-blocks-in-detail)).

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
`--check` or `--list-different` without `--write`, it is in the file as it is.
Lines and columns count from 1, and a column counts UTF-16 code units, as most
editors do. [Formatter compatibility](./compatibility.md) explains which
diagrams are rejected.

| Code | Meaning                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------- |
| `0`  | No errors; with `--check` or `--list-different`, no file would change or `--write` is given.          |
| `1`  | With `--check` or `--list-different` without `--write`, a file would change, and there are no errors. |
| `2`  | An error.                                                                                             |

An error is a rejected diagram in a `.mmd` or `.mermaid` file, a file that
cannot be read or written, a pattern that selects no file, a configuration that
cannot be read, or a wrong use of the options. With an error, the code is `2`
even when a file would change.

When a file cannot be formatted, such as a `.mmd` or `.mermaid` file whose
diagram mermaid.js rejects, the summary of `--check` is
`Error occurred when checking code style in the above file.` (or
`in <n> files.`) on standard output. As in Prettier's `--check`, the summary
counts only the files that cannot be formatted. A file that cannot be read, and
a pattern that selects no file, are reported as errors, but the summary is the
one it would be without them, also when no pattern selects any file. A file that
cannot be written counts among the files whose issues were fixed, and `--write`
and `--write --list-different` still list it.

## If you know Prettier

The diagrams are formatted by Prettier with `prettier-plugin-mmd`, so the rules
of the plugin apply. Five results differ from running Prettier with the plugin
on Markdown and `.mmd` files:

- Prettier removes the whitespace at the end of the last line of a code block,
  even where mermaid.js treats it as part of the diagram
  ([Trailing whitespace](./compatibility.md#trailing-whitespace)). `mmdfmt`
  replaces only the text of the block, so that whitespace stays.
- Prettier formats a code block of Markdown, such as one marked `md`, as a
  Markdown document, and with it the diagrams in its code blocks. `mmdfmt`
  leaves every other code block as it is.
- Prettier prints what stands before the lines of a list item or a block quote
  itself, while `mmdfmt` keeps it as written. For a list item, Prettier prints
  the marker and aligns the content to `tabWidth`. For a block quote, it prints
  `> ` and drops the spaces and tabs between the `>` and the fence. Where the
  two give the content another column, the line width left for a diagram in the
  item or the quote differs by that, and a block of one line near the width can
  be split by one and not by the other.
- In a list item or a block quote, Prettier lines up the colons of a Gantt
  section without counting what stands before the lines, so a lined-up line can
  be wider than the line width. `mmdfmt` counts it, so near the width a Gantt
  section can be lined up by Prettier and not by `mmdfmt`, which then pads no
  name to line the colons up: the whitespace before each colon stays as written,
  and a line written wider than the line width stays so. `mmdfmt` still indents
  the tasks as it does in any Gantt chart, so a colon moves along with its line
  where the written indentation differs.
- Prettier leaves a diagram as written under four settings.
  `requirePragma: true` leaves a Markdown file that has no `<!-- @format -->` or
  `<!-- @prettier -->` comment at its top, after the frontmatter if there is
  one. `checkIgnorePragma: true` leaves a Markdown file that has a
  `<!-- @noformat -->` or `<!-- @noprettier -->` comment there. A range that
  does not cover the whole file leaves a Markdown file or a `.mmd` file.
  `embeddedLanguageFormatting: "off"` leaves every code block of a Markdown
  file. `mmdfmt` formats the diagrams under all four. It does not read the first
  three: it decides itself which files it formats (the patterns, and
  `.gitignore`), and it formats whole diagrams. It reads
  `embeddedLanguageFormatting` for the frontmatter of a diagram only, which it
  then leaves as written.

The command differs from Prettier's CLI too: it does not read `.prettierignore`,
has no `--ignore-path`, `--ignore-unknown`, or formatting options of its own,
and reads the configuration for the diagrams only. A value that Prettier refuses
for an option that `mmdfmt` does not read, such as `semi: "yes"`, is not an
error here, while Prettier's CLI reports it.

The check's success line says
`All diagrams in the matched files use Prettier code style!`, rather than
Prettier's `All matched files use Prettier code style!`: `mmdfmt` formats
nothing but diagrams, so the rest of a Markdown file may not use that style. The
warning asks you to run `mmdfmt --write`, because `prettier --write` would
format the whole Markdown file and, without the plugin configured, would not
format its diagrams.

Prettier reads `--write=false` as false; `mmdfmt` ignores a value written after
`=` on an option that takes no value, and reads it as `--write`. The same holds
for `--check=false` and `--list-different=false`. Prettier also takes a `true`
or `false` written after `--write` as its value; `mmdfmt` reads it as a pattern,
so `mmdfmt --write false notes.md` formats `notes.md` and reports that no file
matches `false`.

When `mmdfmt` checks which options go together, a `--no-` form counts as giving
its option: `--no-check --list-different` is an error, as
`--check --list-different` is. Prettier accepts `--no-check --list-different`.

With `--check` or `--list-different` on standard input, Prettier exits with `0`
for a text it cannot parse; `mmdfmt` exits with `2` for a rejected diagram, as
everywhere else ([Errors and exit codes](#errors-and-exit-codes)).

Prettier also colors the word `warn` yellow and the name of an unchanged file
gray where its output is not a terminal, if the `CI` environment variable is set
or the system is Windows. `mmdfmt` colors them only on a terminal that shows
colors, or when `FORCE_COLOR` is set, and has no `--color` or `--no-color`.

The [README of `mmdfmt`](../../../mmdfmt/README.md#code-blocks-in-detail)
describes the code blocks in detail: which blocks are formatted, blocks in lists
and block quotes and the line width left in them, the blocks left as written
with a warning, and line endings.

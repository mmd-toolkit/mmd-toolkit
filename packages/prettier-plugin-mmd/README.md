# prettier-plugin-mmd

Japanese version: [README.ja.md](./README.ja.md)

A [Prettier](https://prettier.io/) plugin that formats
[Mermaid](https://mermaid.js.org/) diagrams: `.mmd` and `.mermaid` files, and
`mermaid` code blocks in Markdown.

This is a third-party project, not affiliated with
[mermaid-js](https://mermaid.js.org/). `mmd` here means the Mermaid diagram
syntax, not MultiMarkdown or MikuMikuDance.

Documentation:
[Formatter](https://mmd-toolkit.github.io/mmd-toolkit/formatter/).

## Playground

Preview this plugin's formatting in the browser. The **Formatted** tab updates
as you edit, with **Print width**, **Indent**, and **Use tabs** controls. Use
**Apply to source** to replace the input with the result.

Open the [Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

For usage, see the [Playground guide](../playground/README.md).

## Installation

Install it next to Prettier 3. It needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

```sh
npm install --save-dev prettier prettier-plugin-mmd
```

Then add it to your Prettier configuration. Prettier 3 does not find plugins by
itself, so this entry is required:

```json
{
  "plugins": ["prettier-plugin-mmd"]
}
```

Prettier then formats Mermaid files and Markdown files as usual, for example:

```sh
npx prettier --write "**/*.{mmd,mermaid,md}"
```

## Example

Input
([file](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

Output
([file](./tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
  C --> D
  subgraph S
    E
    F
  end
```

## What is formatted

- Files ending in `.mmd` or `.mermaid`.
- Markdown code blocks whose info string has `mermaid` or `mmd` as its first
  word. The match is case-sensitive: `Mermaid` and `mermaidx` are not formatted.
- Every diagram type of mermaid.js.
- The YAML frontmatter of these diagrams, with Prettier's YAML formatter.

The formatting rules of each diagram type are in its document:
[flowcharts](./docs/flowchart.md), [Agentflow](./docs/agentflow.md),
[sequence diagrams](./docs/sequence.md), [class diagrams](./docs/class.md),
[state diagrams](./docs/state.md), [ER diagrams](./docs/er.md),
[Gantt charts](./docs/gantt.md), [user journeys](./docs/journey.md),
[requirement diagrams](./docs/requirement.md), [mindmaps](./docs/mindmap.md),
[timelines](./docs/timeline.md), [sankey diagrams](./docs/sankey.md),
[XY charts](./docs/xychart.md), [quadrant charts](./docs/quadrant.md),
[kanban boards](./docs/kanban.md), [C4 diagrams](./docs/c4.md),
[Venn diagrams](./docs/venn.md), [Ishikawa diagrams](./docs/ishikawa.md),
[usecase diagrams](./docs/usecase.md), [pie charts](./docs/pie.md),
[info diagrams](./docs/info.md), [git graphs](./docs/gitgraph.md),
[architecture diagrams](./docs/architecture.md), [treemaps](./docs/treemap.md),
[treeviews](./docs/treeview.md), [radar diagrams](./docs/radar.md),
[Wardley maps](./docs/wardley.md), [railroad diagrams](./docs/railroad.md),
[cynefin diagrams](./docs/cynefin.md),
[eventmodeling diagrams](./docs/eventmodeling.md),
[packet diagrams](./docs/packet.md), and [block diagrams](./docs/block.md).

## Options

- `useTabs` and `tabWidth` set the indentation. The default is two spaces.
- `endOfLine` sets the line endings.
- `printWidth` decides two things. A data block `@{ … }` on one line in a
  flowchart, an agentflow, or a kanban board is printed on several lines when
  its line is wider than `printWidth` and the conditions of
  [Data blocks](./docs/flowchart.md#data-blocks) hold; a block of one entry, for
  example, stays on its line. The colons of the tasks of a Gantt section are
  lined up unless that would make a line wider than `printWidth` and wider than
  it is (see [Task data](./docs/gantt.md#task-data)). The width is the one
  Prettier measures: a full-width character counts as two columns and a tab as
  none. A Gantt section counts its lines alone, without what a Markdown list or
  block quote puts before them. Everywhere else `printWidth` does not control
  diagram line breaks. `railroad-beta` calls follow their grammar structure; see
  [Long lines](./docs/railroad.md#long-lines). Prettier can still use it for
  Markdown and YAML frontmatter.

## When a diagram is not formatted

- Text that mermaid.js rejects is not changed. In a file, Prettier reports a
  syntax error and leaves the file as it is. In Markdown, the code block is left
  to Prettier, which prints it as code it does not format.
- A few inputs that mermaid.js accepts are reported as syntax errors too. For
  example, a directive inside a keyword, as in `sub%%{init: {}}%%graph S`, and a
  `click` that does not start a click statement, as in
  `subgraph Handle click events`: in flowchart, `click` is a reserved word. An
  empty string between tokens, as in `A-->|x""|B`, is reported too. The full
  list is in [docs/compatibility.md](./docs/compatibility.md).
- A text of only the word `error`, with comments, directives, and line breaks
  around it, is not changed, except that line endings follow `endOfLine`:
  mermaid.js reads it as its `error` pseudo-diagram. In Markdown, it is left to
  Prettier.

## Guarantees and limitations

- Formatting preserves what mermaid.js reads, apart from the documented
  whitespace changes below.
- mermaid.js is the reference, at the version recorded in the specification,
  currently 12.3.0. A formatted text is also drawn by other versions, so the
  formatter checks what it prints against up to five versions of mermaid.js for
  each diagram type. When the formatter would change how something is written,
  such as the case of a keyword, it keeps it as written if a version that counts
  for the diagram type and reads the written form does not read the new form, or
  draws it differently.
  [Versions of mermaid.js that count](./docs/compatibility.md#versions-of-mermaidjs-that-count)
  lists them for each diagram type, and
  [Forms kept for versions of mermaid.js that count](./docs/compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)
  lists each form that stays as written for them.
- Formatting a formatted diagram again changes nothing.
- Spaces and tabs at the end of a `style`, `classDef`, or `linkStyle` line are
  removed, except a space or a tab after a backslash that ends the last style,
  and a style of whitespace only, such as the blank value in
  `linkStyle default stroke: `. mermaid.js keeps them at the end of the last
  style. Whitespace of another kind there, such as a no-break space, stays where
  it changes the figure, in a class diagram and a flowchart for example.
- The lines inside `eventmodeling` data and note blocks are aligned where the
  [Data blocks](./docs/eventmodeling.md#data-blocks) rule permits it. This can
  change the spaces in the text that mermaid.js keeps, while the rendered
  diagram stays the same.
- A single paragraph in a state note closed by `end note` is aligned where the
  [Notes](./docs/state.md#notes) rule permits it, including lines with inline
  emphasis and code notation. Only the whitespace at the start of its lines
  changes, and the rendered diagram stays the same. Other bodies whose margins
  affect the drawing keep the margins of their later lines as written.
- The content of directives, of `@{ ... }` data blocks, and of the frontmatter
  is not checked. A diagram that mermaid.js rejects because of that content is
  still formatted. Directives are kept as written. A `@{ ... }` data block keeps
  its content too; a block on one line is printed with one space inside each
  end, and only a multi-line block that meets the conditions in
  [Data blocks](./docs/flowchart.md#data-blocks) has all its lines moved by the
  same number of spaces. The frontmatter is formatted only when Prettier can
  read it as YAML. The metadata properties of a usecase diagram are syntax of
  the diagram, so they are read and checked.
- A flowchart with more edges than mermaid.js allows, 500 by default (its
  `maxEdges` site setting), is rejected by mermaid.js but still formatted: the
  plugin does not know the site settings.
- A byte order mark before the frontmatter is not handled as mermaid.js handles
  it. A diagram that mermaid.js accepts may be reported as a syntax error, and
  one that it rejects may be formatted.
- In Markdown, Prettier removes whitespace at the end of the last line of every
  code block. Where mermaid.js reads that whitespace, as in
  `style A fill:#f00, `, the diagram changes.

The reasons and the details are in
[docs/compatibility.md](./docs/compatibility.md).

## Documentation

- [Formatter guide](https://mmd-toolkit.github.io/mmd-toolkit/formatter/):
  installation,
  [configuration](https://mmd-toolkit.github.io/mmd-toolkit/formatter/configuration.html),
  and
  [options](https://mmd-toolkit.github.io/mmd-toolkit/formatter/options.html).
- [Formatter compatibility](https://mmd-toolkit.github.io/mmd-toolkit/formatter/compatibility.html):
  syntax errors, differences from mermaid.js, and the limits of the guarantees.
- [docs/compatibility.md](./docs/compatibility.md): every place where the plugin
  differs from mermaid.js, and why.
- [docs/development.md](./docs/development.md): the tests and the fixtures, for
  people who work on the plugin.

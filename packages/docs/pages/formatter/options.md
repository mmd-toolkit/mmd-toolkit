# Formatter options

The plugin uses [Prettier's standard options](https://prettier.io/docs/options)
and adds no options of its own. Set these options in your
[Prettier configuration](./configuration.md).

## Prettier options used in diagram formatting

- [`tabWidth`](https://prettier.io/docs/options#tab-width): the width of space
  indentation in diagrams.
- [`useTabs`](https://prettier.io/docs/options#tabs): whether to indent diagrams
  with tabs.
- [`endOfLine`](https://prettier.io/docs/options#end-of-line): line endings in
  the formatted output.
- [`printWidth`](https://prettier.io/docs/options#print-width): the line width
  for two decisions (see [Line width](#line-width)).

Playground output uses LF line endings.

## Indentation

In Mindmap, `tabWidth` affects the root's indentation, while indentation
differences between nodes keep their original character counts. In Kanban, each
node keeps its absolute indentation count; `tabWidth` does not change it. In
both diagrams, reformatted indentation uses the character selected by `useTabs`.

## Line width

`printWidth` decides two things in a diagram:

- A data block `@{ … }` on one line in a flowchart, an agentflow, or a kanban
  board is printed on several lines, one entry on each line, when its line is
  wider than `printWidth`.
- The colons of the tasks of a Gantt section are lined up unless that would make
  a line wider than `printWidth` and wider than it is.

The width is the one Prettier measures: a full-width character counts as two
columns and a tab as none, so a line with tabs can be wider on the screen than
it measures. `max_line_length = off` of `.editorconfig`, which Prettier reads as
an infinite width, never splits a block and always lines the colons up.

Everywhere else `printWidth` does not control diagram line breaks.
`railroad-beta` composite calls always use nested lines to show the grammar
structure. Quoted contents remain as written. Prettier's formatting of Markdown
and YAML frontmatter can still use `printWidth`.

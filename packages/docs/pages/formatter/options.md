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

Playground output uses LF line endings.

## Indentation

In Mindmap, `tabWidth` affects the root's indentation, while indentation
differences between nodes keep their original character counts. In Kanban, each
node keeps its absolute indentation count; `tabWidth` does not change it. In
both diagrams, reformatted indentation uses the character selected by `useTabs`.

## Line width

`printWidth` wraps ordinary calls in `railroad-beta` to show their nesting.
Quoted contents remain as written. Rules with comments, directives, hidden
forms, or protected semicolons keep their existing layout. Other diagram lines
are not wrapped. Prettier's formatting of Markdown and YAML frontmatter can also
use `printWidth`.

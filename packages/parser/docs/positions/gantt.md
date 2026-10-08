# Gantt positions

Japanese version: [gantt.ja.md](./gantt.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/gantt.md`](../../../spec/docs/ast/gantt.md); the tokens
in [tokens/gantt.md](../tokens/gantt.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### GanttDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### GanttTaskStatement

The range runs from the description to the last token of the data: the last
item, or the last `,` when the item after it is null, or the `:` when the data
holds only whitespace. `a : 1d,` covers `a : 1d,`, and `a :` followed by three
spaces covers `a :`. [fixture: gantt/gram-task] [fixture:
gantt/gram-task-trailing-comma] [fixture: gantt/lex-task-data-whitespace-only]

### GanttClickStatement

The range runs from `click` to the last token of its last part in source order,
the closing `"` of a link or the `)` of a call, whatever the order of its child
fields. [fixture: gantt/gram-click-href] [fixture:
gantt/gram-click-call-then-href]

### GanttCallback

The range runs from `call` to the `)`. [fixture: gantt/gram-click-call]
[fixture: gantt/gram-click-call-arguments]

### GanttIncludesStatement and GanttExcludesStatement

The range runs from the keyword to the last item or `,` of the list text; a
statement whose list text is whitespace only covers the keyword alone. [fixture:
gantt/db-includes-tokens] [fixture: gantt/db-excludes-tokens] [fixture:
gantt/lex-excludes-whitespace-value]

### GanttAccTitleStatement and GanttAccDescrStatement

The range runs from the keyword to the last character of the text that is not
whitespace: the whitespace at the end of the line, which the value leaves out,
is outside it. [fixture: gantt/gram-acc-title-trailing-spaces]

### GanttIgnoredStatement

The range runs from the keyword to the closing quote or parenthesis, over the
whitespace between its units, which its value holds: `call (`, a line feed, and
`)` covers both lines. [fixture: gantt/gram-empty-call-line-feed-inside]

### GanttLiteral

The range is that of its token, with the whitespace at its ends where the token
keeps it (see [Tokens](../tokens/gantt.md#tokens)), and the value is the written
text of the range: the description of `a  : 1d` covers `a` and the two spaces
before the colon, and the title of `title T` followed by two spaces covers `T`
and the two spaces. [fixture: gantt/lex-task-text-trailing-spaces] [fixture:
gantt/lex-title-trailing-spaces]

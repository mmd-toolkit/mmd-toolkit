---
"prettier-plugin-mmd": minor
---

Print the directives that end a text in one form, whatever the whitespace at the
end of the line: `title T  %%{init: {}}%%  %%{init: {}}%%  ` becomes
`title T %%{init: {}}%% %%{init: {}}%%`. This holds for the `title`, the
`accTitle:` line, and the `accDescr:` line of every diagram type, for a node of
`ishikawa`, `mindmap`, and `treeview`, for a card of `kanban`, and for the
`dateFormat` and `axisFormat` of `gantt`, the last event of a line of
`timeline`, and the second description of an alias in `stateDiagram`.

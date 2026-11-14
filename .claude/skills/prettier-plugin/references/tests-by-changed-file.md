# The test files of each source file (prettier-plugin)

The test files that a change to each source file of
`packages/prettier-plugin-mmd` can affect. Section 6 of
[SKILL.md](../SKILL.md#6-tests) says how to run them, and how to search this
list.

Contents:

- A shared module, which every diagram type uses.
- The files of each diagram type, by its name (`flowchart*.ts`), from flowchart
  to wardley.
- `error.ts`, `default-size.ts`, `statement-rules.ts`, `accessibility-lines.ts`,
  the files of the plugin (`index.ts`, `parser.ts`, `printer.ts`, `root.ts`,
  `frontmatter-yaml.ts`), and the test helpers.

The list:

- A shared module (`blocks.ts`, `atoms.ts`, `gap.ts`, `layout.ts`, `lines.ts`,
  `source.ts`, `kept-lines.ts`, `common-layout.ts`, `hidden-forms.ts`,
  `flat-hidden-diagram.ts`): the tests of every diagram type, that is, the whole
  package.
- `flowchart*.ts`: `format` and `corpus` with `-t flowchart`; and, without `-t`,
  `markdown-flowchart`, `value-nodes`, `line-separators`, `line-terminators`,
  `empty-description-blocks`, `accessibility-blocks`, and `graph-accessibility`.
- `sequence*.ts`: `format` and `corpus` with `-t sequence`; and, without `-t`,
  `line-separators`, `sequence-layout`, `markdown-sequence`, `value-nodes`,
  `line-terminators`, and `empty-description-blocks`.
- `class*.ts`: `format` and `corpus` with `-t class`; and, without `-t`,
  `markdown-class`, `value-nodes`, `line-separators`, `line-terminators`,
  `empty-description-blocks`, and `accessibility-revisions`.
- `state*.ts`: `format` and `corpus` with `-t state`; and, without `-t`,
  `line-separators`, `markdown-state`, `value-nodes`, `line-terminators`,
  `empty-description-blocks`, and `accessibility-revisions`.
- `er*.ts`: `format` and `corpus` with `-t er`; and, without `-t`,
  `line-separators`, `markdown-er`, `value-nodes`, `line-terminators`,
  `empty-description-blocks`, and `accessibility-revisions`.
- `gantt*.ts`: `format` and `corpus` with `-t gantt`; and, without `-t`,
  `line-separators`, `markdown-gantt`, `value-nodes`, `line-terminators`, and
  `empty-description-blocks`.
- `journey*.ts`: `format` and `corpus` with `-t journey`; and, without `-t`,
  `line-separators`, `markdown-journey`, `value-nodes`, `line-terminators`, and
  `empty-description-blocks`.
- `requirement*.ts`: `format` and `corpus` with `-t requirement`; and, without
  `-t`, `line-separators`, `markdown-requirement`, `value-nodes`,
  `line-terminators`, and `empty-description-blocks`.
- `mindmap*.ts`: `format` and `corpus` with `-t mindmap`; and, without `-t`,
  `line-separators`, `markdown-mindmap`, `value-nodes`, and `line-terminators`.
- `timeline*.ts`: `format` and `corpus` with `-t timeline`; and, without `-t`,
  `line-separators`, `markdown-timeline`, `value-nodes`, `line-terminators`, and
  `empty-description-blocks`.
- `sankey*.ts`: `format` and `corpus` with `-t sankey`; and, without `-t`,
  `line-separators`, `markdown-sankey`, `value-nodes`, `line-terminators`, and
  `empty-description-blocks`.
- `xychart*.ts`: `format` and `corpus` with `-t xychart`; and, without `-t`,
  `line-separators`, `markdown-xychart`, `value-nodes`, `line-terminators`, and
  `empty-description-blocks`.
- `quadrant*.ts`: `format` and `corpus` with `-t quadrant`; and, without `-t`,
  `line-separators`, `markdown-quadrant`, `value-nodes`, `line-terminators`, and
  `empty-description-blocks`.
- `block.ts`, `block-*.ts`: `format` and `corpus` with `-t block`; and, without
  `-t`, `line-separators`, `markdown-block`, `value-nodes`, `line-terminators`,
  and `empty-description-blocks`.
- `kanban*.ts`: `format` and `corpus` with `-t kanban`; and, without `-t`,
  `line-separators`, `markdown-kanban`, `value-nodes`, and `line-terminators`.
- `c4*.ts`: `format` and `corpus` with `-t c4`; and, without `-t`,
  `line-separators`, `line-terminators`, `markdown-c4`, `value-nodes`,
  `dispatch`, `empty-description-blocks`, `accessibility-revisions`, and
  `accessibility-blocks`.
- `venn*.ts`: `format` and `corpus` with `-t venn`; and, without `-t`,
  `line-separators`, `markdown-venn`, `value-nodes`, `line-terminators`, and
  `dispatch`.
- `ishikawa*.ts`: `format` and `corpus` with `-t ishikawa`; and, without `-t`,
  `ishikawa`, `markdown-ishikawa`, `value-nodes`, `dispatch`, and
  `empty-description-blocks`.
- `agentflow*.ts`: `format` and `corpus` with `-t agentflow`; and, without `-t`,
  `agentflow`, `markdown-agentflow`, `value-nodes`, `dispatch`,
  `empty-description-blocks`, `accessibility-blocks`, and `graph-accessibility`.
- `pie*.ts`: `format` and `corpus` with `-t pie`; and, without `-t`, `pie`,
  `markdown-pie`, `value-nodes`, `dispatch`, and `empty-description-blocks`.
- `gitgraph*.ts`: `format` and `corpus` with `-t gitgraph`; and, without `-t`,
  `gitgraph`, `markdown-gitgraph`, `value-nodes`, `dispatch`, and
  `empty-description-blocks`.
- `info*.ts`: `format` and `corpus` with `-t info`; and, without `-t`, `info`,
  `markdown-info`, `value-nodes`, `dispatch`, and `empty-description-blocks`.
- `architecture*.ts`: `format` and `corpus` with `-t architecture`; and, without
  `-t`, `architecture`, `markdown-architecture`, `value-nodes`, and `dispatch`.
- `cynefin*.ts`: `format` and `corpus` with `-t cynefin`; and, without `-t`,
  `cynefin`, `markdown-cynefin`, `value-nodes`, and `dispatch`.
- `eventmodeling*.ts`: `format` and `corpus` with `-t eventmodeling`; and,
  without `-t`, `eventmodeling`, `markdown-eventmodeling`, `value-nodes`, and
  `dispatch`.
- `packet*.ts`: `format` and `corpus` with `-t packet`; and, without `-t`,
  `packet`, `markdown-packet`, `value-nodes`, and `dispatch`.
- `radar*.ts`: `format` and `corpus` with `-t radar`; and, without `-t`,
  `radar`, `markdown-radar`, `value-nodes`, and `dispatch`.
- `railroad*.ts`: `format` and `corpus` with `-t railroad`; and, without `-t`,
  `railroad`, `markdown-railroad`, `value-nodes`, and `dispatch`.
- `treemap*.ts`: `format` and `corpus` with `-t treemap`; and, without `-t`,
  `treemap`, `markdown-treemap`, and `value-nodes`.
- `treeview*.ts`: `format` and `corpus` with `-t treeview`; and, without `-t`,
  `treeview`, `markdown-treeview`, and `value-nodes`.
- `usecase*.ts`: `format` and `corpus` with `-t usecase`; and, without `-t`,
  `usecase`, `markdown-usecase`, `value-nodes`, `dispatch`,
  `empty-description-blocks`, and `accessibility-revisions`.
- `wardley*.ts`: `format` and `corpus` with `-t wardley`; and, without `-t`,
  `wardley`, `markdown-wardley`, and `value-nodes`.
- `error.ts`: `format` with `-t error/`; and, without `-t`, `corpus`,
  `dispatch`, `failure`, and `markdown`.
- `default-size.ts`: the tests of the diagram types that use it, agentflow and
  eventmodeling.
- `statement-rules.ts`: the whole package, since `common-layout.ts` uses it.
- `accessibility-lines.ts`: the tests of the diagram types that use it: class,
  ER, requirement, and state.
- `index.ts`, `parser.ts`, `printer.ts`, `root.ts`, `frontmatter-yaml.ts`:
  `dispatch`, `failure`, `markdown`, `plugin`, and the files of each diagram
  type.
- `tests/db-reading.ts`, `tests/helpers.ts`: every test that imports them.

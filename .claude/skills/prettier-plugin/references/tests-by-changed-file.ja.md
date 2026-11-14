# ソースのファイルごとのテストのファイル（prettier-plugin）

`packages/prettier-plugin-mmd` のソースのファイルごとに、
その変更が影響しうるテストのファイル。
回し方と、この一覧の引き方は、
[SKILL.ja.md](../SKILL.ja.md#6-テスト) の 6 節にある。

目次:

- すべての図種が使う共有のモジュール。
- 図種ごとの、その名前によるファイル（`flowchart*.ts`）。
  flowchart から wardley まで。
- `error.ts`、`default-size.ts`、`statement-rules.ts`、
  `accessibility-lines.ts`、プラグインのファイル（`index.ts`、`parser.ts`、
  `printer.ts`、`root.ts`、`frontmatter-yaml.ts`）と、テストのヘルパー。

一覧:

- 共有のモジュール: `blocks.ts`、`atoms.ts`、`gap.ts`、`layout.ts`、`lines.ts`、
  `source.ts`、`kept-lines.ts`、`common-layout.ts`、`hidden-forms.ts`、
  `flat-hidden-diagram.ts`。
  すべての図種のテスト、つまりパッケージ全体。
- `flowchart*.ts`: `format` と `corpus` を `-t flowchart` で。
  `-t` なしで `markdown-flowchart`、`value-nodes`、`line-separators`、
  `line-terminators`、`empty-description-blocks`、`accessibility-blocks`、
  `graph-accessibility`。
- `sequence*.ts`: `format` と `corpus` を `-t sequence` で。
  `-t` なしで `line-separators`、`sequence-layout`、`markdown-sequence`、
  `value-nodes`、`line-terminators`、`empty-description-blocks`。
- `class*.ts`: `format` と `corpus` を `-t class` で。
  `-t` なしで `markdown-class`、`value-nodes`、`line-separators`、
  `line-terminators`、`empty-description-blocks`、`accessibility-revisions`。
- `state*.ts`: `format` と `corpus` を `-t state` で。
  `-t` なしで `line-separators`、`markdown-state`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`、`accessibility-revisions`。
- `er*.ts`: `format` と `corpus` を `-t er` で。
  `-t` なしで `line-separators`、`markdown-er`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`、`accessibility-revisions`。
- `gantt*.ts`: `format` と `corpus` を `-t gantt` で。
  `-t` なしで `line-separators`、`markdown-gantt`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `journey*.ts`: `format` と `corpus` を `-t journey` で。
  `-t` なしで `line-separators`、`markdown-journey`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `requirement*.ts`: `format` と `corpus` を `-t requirement` で。
  `-t` なしで `line-separators`、`markdown-requirement`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `mindmap*.ts`: `format` と `corpus` を `-t mindmap` で。
  `-t` なしで `line-separators`、`markdown-mindmap`、`value-nodes`、
  `line-terminators`。
- `timeline*.ts`: `format` と `corpus` を `-t timeline` で。
  `-t` なしで `line-separators`、`markdown-timeline`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `sankey*.ts`: `format` と `corpus` を `-t sankey` で。
  `-t` なしで `line-separators`、`markdown-sankey`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `xychart*.ts`: `format` と `corpus` を `-t xychart` で。
  `-t` なしで `line-separators`、`markdown-xychart`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `quadrant*.ts`: `format` と `corpus` を `-t quadrant` で。
  `-t` なしで `line-separators`、`markdown-quadrant`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `block-*.ts`、`block.ts`: `format` と `corpus` を `-t block` で。
  `-t` なしで `line-separators`、`markdown-block`、`value-nodes`、
  `line-terminators`、`empty-description-blocks`。
- `kanban*.ts`: `format` と `corpus` を `-t kanban` で。
  `-t` なしで `line-separators`、`markdown-kanban`、`value-nodes`、
  `line-terminators`。
- `c4*.ts`: `format` と `corpus` を `-t c4` で。
  `-t` なしで `line-separators`、`line-terminators`、`markdown-c4`、
  `value-nodes`、`dispatch`、`empty-description-blocks`、
  `accessibility-revisions`、`accessibility-blocks`。
- `venn*.ts`: `format` と `corpus` を `-t venn` で。
  `-t` なしで `line-separators`、`markdown-venn`、`value-nodes`、
  `line-terminators`、`dispatch`。
- `ishikawa*.ts`: `format` と `corpus` を `-t ishikawa` で。
  `-t` なしで `ishikawa`、`markdown-ishikawa`、`value-nodes`、`dispatch`、
  `empty-description-blocks`。
- `agentflow*.ts`: `format` と `corpus` を `-t agentflow` で。
  `-t` なしで `agentflow`、`markdown-agentflow`、`value-nodes`、`dispatch`、
  `empty-description-blocks`、`accessibility-blocks`、`graph-accessibility`。
- `pie*.ts`: `format` と `corpus` を `-t pie` で。
  `-t` なしで `pie`、`markdown-pie`、`value-nodes`、`dispatch`、
  `empty-description-blocks`。
- `gitgraph*.ts`: `format` と `corpus` を `-t gitgraph` で。
  `-t` なしで `gitgraph`、`markdown-gitgraph`、`value-nodes`、`dispatch`、
  `empty-description-blocks`。
- `info*.ts`: `format` と `corpus` を `-t info` で。
  `-t` なしで `info`、`markdown-info`、`value-nodes`、`dispatch`、
  `empty-description-blocks`。
- `architecture*.ts`: `format` と `corpus` を `-t architecture` で。
  `-t` なしで `architecture`、`markdown-architecture`、`value-nodes`、
  `dispatch`。
- `cynefin*.ts`: `format` と `corpus` を `-t cynefin` で。
  `-t` なしで `cynefin`、`markdown-cynefin`、`value-nodes`、`dispatch`。
- `eventmodeling*.ts`: `format` と `corpus` を `-t eventmodeling` で。
  `-t` なしで `eventmodeling`、`markdown-eventmodeling`、`value-nodes`、
  `dispatch`。
- `packet*.ts`: `format` と `corpus` を `-t packet` で。
  `-t` なしで `packet`、`markdown-packet`、`value-nodes`、`dispatch`。
- `radar*.ts`: `format` と `corpus` を `-t radar` で。
  `-t` なしで `radar`、`markdown-radar`、`value-nodes`、`dispatch`。
- `railroad*.ts`: `format` と `corpus` を `-t railroad` で。
  `-t` なしで `railroad`、`markdown-railroad`、`value-nodes`、`dispatch`。
- `treemap*.ts`: `format` と `corpus` を `-t treemap` で。
  `-t` なしで `treemap`、`markdown-treemap`、`value-nodes`。
- `treeview*.ts`: `format` と `corpus` を `-t treeview` で。
  `-t` なしで `treeview`、`markdown-treeview`、`value-nodes`。
- `usecase*.ts`: `format` と `corpus` を `-t usecase` で。
  `-t` なしで `usecase`、`markdown-usecase`、`value-nodes`、`dispatch`、
  `empty-description-blocks`、`accessibility-revisions`。
- `wardley*.ts`: `format` と `corpus` を `-t wardley` で。
  `-t` なしで `wardley`、`markdown-wardley`、`value-nodes`。
- `error.ts`: `format` を `-t error/` で。
  `-t` なしで `corpus`、`dispatch`、`failure`、`markdown`。
- `default-size.ts`: それを使う図種、agentflow と eventmodeling のテスト。
- `statement-rules.ts`: `common-layout.ts` が使うので、パッケージ全体。
- `accessibility-lines.ts`: それを使う図種、class、ER、requirement、
  state のテスト。
- `index.ts`、`parser.ts`、`printer.ts`、`root.ts`、
  `frontmatter-yaml.ts`: `dispatch`、`failure`、`markdown`、`plugin`と、
  図種ごとのファイル。
- `tests/db-reading.ts`、`tests/helpers.ts`: それを import するすべてのテスト。

# @mmd-toolkit/eslint-plugin

英語版: [README.md](./README.md)

Mermaid の図のための [ESLint](https://eslint.org/) の言語プラグインです。
`.mmd` と `.mermaid` のファイルと、
Markdown の中の `mermaid` と `mmd` のコードブロックを扱います。
[`@mmd-toolkit/parser`](../parser) の木を ESLint に渡し、
規則が Mermaid のテキストを読めるようにします。

mermaid-js とは関係のない第三者のプロジェクトです。
ここでいう `mmd` は Mermaid の図の記法のことで、
MultiMarkdown や MikuMikuDance ではありません。

規則は、図種ごとに、flowchart から実装しています。
[docs/rules/index.ja.md](./docs/rules/index.ja.md) は、すべての規則を挙げ、
まだ実装していない規則（何も報告しない）に印を付けています。
`@mmd-toolkit/no-unclosed-directive` は、試しに実装したものです。
これは推奨の設定に入っておらず、
すべての図種に共通のほかの規則と一緒に書き直します。

## 導入

このパッケージは、まだ npm に公開していません。
公開後は、ESLint 10 と一緒に入れます。
Node.js `^20.19.0 || ^22.13.0 || >=24` が必要です。

```sh
npm install --save-dev eslint @mmd-toolkit/eslint-plugin
```

そのうえで、その設定を `eslint.config.js` に加えます。
この設定は、`.mmd` と `.mermaid` のファイルに Mermaid の言語を当てます。

```js
import mmd from "@mmd-toolkit/eslint-plugin"

export default [mmd.configs.recommended]
```

## Markdown の中の Mermaid のコードブロック

[`@eslint/markdown`](https://github.com/eslint/markdown) のプロセッサーは、
コードブロックごとに、
`0.mermaid` のような、その言語で終わるファイル名を付けます。
上の設定は `mermaid` と `mmd` のブロックに当たり、
ESLint は Markdown のファイルの位置で報告します。

```js
import markdown from "@eslint/markdown"
import mmd from "@mmd-toolkit/eslint-plugin"

export default [...markdown.configs.processor, mmd.configs.recommended]
```

図を持たない `mermaid` のブロックは、パースのエラーとして報告されます。

## 図種

次の図種を読みます。

- flowchart: `flowchart-v2`（`flowchart` と `graph`）、
  `flowchart-elk`、`swimlane`（`swimlane-beta`）。
- シーケンス図: `sequence`（`sequenceDiagram`）。
- クラス図: `classDiagram`（`classDiagram` と `classDiagram-v2`）。
- 状態図: `stateDiagram`（`stateDiagram` と `stateDiagram-v2`）。
- ER 図: `er`（`erDiagram`）。
- Gantt チャート: `gantt`（`gantt`）。

ER 図と Gantt チャートには、まだ図種ごとの規則がありません。
ほかの図種は、対応するまで、パースのエラーとして報告されます。

## 設定のコメント

Mermaid のコメント（`%%` の行）は、
JavaScript のコメントと同じように ESLint を設定します。

```mmd
flowchart LR
  %% eslint-disable-next-line -- the reason
  A --> B
```

`%% eslint-disable`、`%% eslint-enable`、`%% eslint-disable-next-line`、
`%% eslint <規則>: <設定>` を読みます。
Mermaid のコメントは行全体を占めるので、
`%% eslint-disable-line` はそのコメント自身にだけ当たります。

# 規則

英語版: [index.md](./index.md)

`@mmd-toolkit/eslint-plugin` の規則の一覧。
`@mmd-toolkit/eslint-plugin` は、`@mmd-toolkit/parser` の上に作る、
Mermaid の図のテキストのための ESLint の言語プラグインで、
規則ごとに 1 つの文書がある。

`recommended` の設定は、下の一覧で ✅ を付けた規則を有効にする。
それらの規則の報告は、ほぼいつも直すべき誤りである。

## 規則の id

規則の id は、プラグインの名前空間 `@mmd-toolkit` で始まる。
すべての図種に共通の規則の id は `@mmd-toolkit/<名前>`、
1 つの図種の規則の id は `@mmd-toolkit/<図種>-<名前>` である。
`flowchart` の規則の対象の図種は、
`flowchart-v2`、`flowchart-elk`、`swimlane` である。

<!-- begin auto-generated rules list -->

✅ は、`recommended` の設定が有効にする規則。

💡 は、
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
がある規則。

🚧 は、まだ実装していない規則。何も報告しない。

## 共通の規則

| 規則                                                           | 説明                                                                          | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [no-ignored-init-directive](./no-ignored-init-directive.ja.md) | 図を設定するつもりで書いたが、mermaid.js が無視するディレクティブを禁止する。 |     |     | 🚧  |
| [no-unclosed-directive](./no-unclosed-directive.ja.md)         | 閉じる `}%%` のないディレクティブを禁止する。                                 |     |     |     |

## flowchart

| 規則                                                                                       | 説明                                                                    | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | --- | --- | --- |
| [flowchart-no-bare-comment-marker](./flowchart-no-bare-comment-marker.ja.md)               | `%%` だけの行を禁止する。                                               |     | 💡  |     |
| [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                      | ✅  | 💡  |     |
| [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。                  | ✅  | 💡  |     |
| [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                        | ✅  | 💡  |     |
| [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)                             | 方向の行にあって、mermaid.js が読まないテキストを禁止する。             | ✅  | 💡  |     |
| [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.ja.md)                     | 頂点の形やラベルを、後で違うものに書き直すことを禁止する。              | ✅  |     |     |
| [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。                   | ✅  | 💡  |     |
| [flowchart-no-undef](./flowchart-no-undef.ja.md)                                           | 図が定義していない id を指す `style`、`class`、`click` の文を禁止する。 | ✅  |     |     |

## sequence

| 規則                                                                                     | 説明                                                                          | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [sequence-no-create-destroy](./sequence-no-create-destroy.ja.md)                         | `destroy` の前の `create` を禁止する。                                        | ✅  |     |     |
| [sequence-no-duplicate-description](./sequence-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                            | ✅  |     |     |
| [sequence-no-duplicate-title](./sequence-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。             | ✅  |     |     |
| [sequence-no-empty-description-block](./sequence-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                              | ✅  |     |     |
| [sequence-no-ignored-text](./sequence-no-ignored-text.ja.md)                             | mermaid.js が何も読まない行を禁止する。                                       | ✅  |     |     |
| [sequence-no-invalid-json](./sequence-no-invalid-json.ja.md)                             | テキストが JSON のオブジェクトでない `links` か `properties` の文を禁止する。 | ✅  |     |     |
| [sequence-no-link-without-separator](./sequence-no-link-without-separator.ja.md)         | ラベルと URL の間に `@` がない `link` の文を禁止する。                        | ✅  |     |     |
| [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。                         | ✅  |     |     |

## class

| 規則                                                                     | 説明                                                                           | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --- | --- | --- |
| [class-no-bare-class-name](./class-no-bare-class-name.ja.md)             | 何も変えない、クラス名だけの行を禁止する。                                     | ✅  |     |     |
| [class-no-duplicate-description](./class-no-duplicate-description.ja.md) | 説明をもう一度設定する `accDescr` の文を禁止する。                             | ✅  |     |     |
| [class-no-duplicate-title](./class-no-duplicate-title.ja.md)             | タイトルをもう一度設定する `accTitle` の文を禁止する。                         | ✅  |     |     |
| [class-no-ignored-text](./class-no-ignored-text.ja.md)                   | mermaid.js が読まないテキストを禁止する。                                      | ✅  |     |     |
| [class-no-inline-comment](./class-no-inline-comment.ja.md)               | 同じ行のほかのテキストの後に置いたコメントを禁止する。                         |     |     |     |
| [class-no-redefined-class](./class-no-redefined-class.ja.md)             | クラスのラベルを、後で違うものに書き直すことを禁止する。                       | ✅  |     |     |
| [class-no-unclosed-backquote](./class-no-unclosed-backquote.ja.md)       | バッククォートで囲むクラス名のうち、閉じるバッククォートのないものを禁止する。 | ✅  |     |     |
| [class-no-undef](./class-no-undef.ja.md)                                 | 図が定義していないクラスを指す文を禁止する。                                   | ✅  |     |     |

## state

| 規則                                                                               | 説明                                                                    | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --- | --- | --- |
| [state-no-duplicate-description](./state-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                      | ✅  |     |     |
| [state-no-duplicate-title](./state-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。                  | ✅  |     |     |
| [state-no-empty-description-block](./state-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                        | ✅  |     |     |
| [state-no-ignored-text](./state-no-ignored-text.ja.md)                             | mermaid.js が読まないテキストを禁止する。                               | ✅  |     |     |
| [state-no-unclosed-description-block](./state-no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。                   | ✅  |     |     |
| [state-no-undef](./state-no-undef.ja.md)                                           | どの状態も名指さない `style`、`class`、`click`、`note` の文を禁止する。 | ✅  |     |     |

## er

| 規則                                                                         | 説明                                                                      | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --- | --- | --- |
| [er-no-duplicate-description](./er-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                        | ✅  |     |     |
| [er-no-duplicate-title](./er-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。                    | ✅  |     |     |
| [er-no-empty-description-block](./er-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                          | ✅  |     |     |
| [er-no-ignored-text](./er-no-ignored-text.ja.md)                             | mermaid.js が読まないテキストを禁止する。                                 | ✅  |     |     |
| [er-no-redefined-entity](./er-no-redefined-entity.ja.md)                     | 実体に 2 つ目の別名を与える実体の文を禁止する。                           | ✅  |     |     |
| [er-no-unclosed-description-block](./er-no-unclosed-description-block.ja.md) | ほかのもののために書いた `}` が閉じる `accDescr {` のブロックを禁止する。 | ✅  |     |     |
| [er-no-undef](./er-no-undef.ja.md)                                           | どの実体も subgraph も名指さない `style` と `class` の文を禁止する。      | ✅  |     |     |

## gantt

| 規則                                                                         | 説明                                                                      | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --- | --- | --- |
| [gantt-no-duplicate-description](./gantt-no-duplicate-description.ja.md)     | 説明をもう一度設定する `accDescr` の文を禁止する。                        | ✅  |     |     |
| [gantt-no-duplicate-id](./gantt-no-duplicate-id.ja.md)                       | 前のタスクがすでに持つタスクの id を禁止する。                            | ✅  |     |     |
| [gantt-no-duplicate-setting](./gantt-no-duplicate-setting.ja.md)             | 設定をもう一度設定する設定の文を禁止する。                                | ✅  |     |     |
| [gantt-no-duplicate-title](./gantt-no-duplicate-title.ja.md)                 | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。         | ✅  |     |     |
| [gantt-no-empty-description-block](./gantt-no-empty-description-block.ja.md) | 説明を持たない `accDescr` のブロックを禁止する。                          | ✅  |     |     |
| [gantt-no-undef](./gantt-no-undef.ja.md)                                     | どのタスクの id でもない id を指す `click`、`after`、`until` を禁止する。 | ✅  |     |     |
| [gantt-no-unknown-exclude](./gantt-no-unknown-exclude.ja.md)                 | `weekends` でも曜日の名前でもない `excludes` の語を禁止する。             | ✅  |     |     |
| [gantt-no-unread-tag](./gantt-no-unread-tag.ja.md)                           | タスクのデータの中で、mermaid.js がタグとして読まないタグを禁止する。     | ✅  |     |     |

<!-- end auto-generated rules list -->

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

| 規則                                                           | 説明                                                                                                    | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --- | --- | --- |
| [no-invalid-init-directive](./no-invalid-init-directive.ja.md) | 図を設定するつもりで書いたが、正しく書かれていないためにmermaid.js が無視するディレクティブを禁止する。 |     |     | 🚧  |
| [no-unclosed-directive](./no-unclosed-directive.ja.md)         | 閉じる `}%%` のないディレクティブを禁止する。                                                           |     |     |     |

## flowchart

| 規則                                                                                       | 説明                                                                    | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | --- | --- | --- |
| [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                      | ✅  | 💡  |     |
| [flowchart-no-duplicate-direction](./flowchart-no-duplicate-direction.ja.md)               | その subgraph の方向を置き換える `direction` 文を禁止する。             | ✅  |     |     |
| [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。                  | ✅  | 💡  |     |
| [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                        | ✅  | 💡  |     |
| [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)                             | 方向の行にあって、mermaid.js が捨てるテキストを禁止する。               | ✅  | 💡  |     |
| [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.ja.md)                     | 頂点の形やラベルを、後で違うものに書き直すことを禁止する。              | ✅  |     |     |
| [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。                   |     | 💡  |     |
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
| [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。                         |     |     |     |

## class

| 規則                                                                     | 説明                                                                           | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --- | --- | --- |
| [class-no-bare-class-name](./class-no-bare-class-name.ja.md)             | 何も変えない、クラス名だけの行を禁止する。                                     | ✅  |     |     |
| [class-no-duplicate-description](./class-no-duplicate-description.ja.md) | 説明をもう一度設定する `accDescr` の文を禁止する。                             | ✅  |     |     |
| [class-no-duplicate-title](./class-no-duplicate-title.ja.md)             | タイトルをもう一度設定する `accTitle` の文を禁止する。                         | ✅  |     |     |
| [class-no-ignored-text](./class-no-ignored-text.ja.md)                   | mermaid.js が捨てるテキストを禁止する。                                        | ✅  |     |     |
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
| [state-no-ignored-text](./state-no-ignored-text.ja.md)                             | mermaid.js が捨てるテキストを禁止する。                                 | ✅  |     |     |
| [state-no-unclosed-description-block](./state-no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。                   |     |     |     |
| [state-no-undef](./state-no-undef.ja.md)                                           | どの状態も名指さない `style`、`class`、`click`、`note` の文を禁止する。 | ✅  |     |     |

## er

| 規則                                                                         | 説明                                                                      | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --- | --- | --- |
| [er-no-duplicate-description](./er-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                        | ✅  |     |     |
| [er-no-duplicate-title](./er-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。                    | ✅  |     |     |
| [er-no-empty-description-block](./er-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                          | ✅  |     |     |
| [er-no-ignored-text](./er-no-ignored-text.ja.md)                             | mermaid.js が捨てるテキストを禁止する。                                   |     |     |     |
| [er-no-redefined-entity](./er-no-redefined-entity.ja.md)                     | 実体に 2 つ目の別名を与える実体の文を禁止する。                           | ✅  |     |     |
| [er-no-unclosed-description-block](./er-no-unclosed-description-block.ja.md) | ほかのもののために書いた `}` が閉じる `accDescr {` のブロックを禁止する。 |     |     |     |
| [er-no-undef](./er-no-undef.ja.md)                                           | どの実体も subgraph も名指さない `style` と `class` の文を禁止する。      | ✅  |     |     |

## journey

| 規則                                                                             | 説明                                                              | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --- | --- | --- |
| [journey-no-duplicate-description](./journey-no-duplicate-description.ja.md)     | 説明をもう一度設定する `accDescr` の文を禁止する。                | ✅  |     |     |
| [journey-no-duplicate-title](./journey-no-duplicate-title.ja.md)                 | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。 | ✅  |     |     |
| [journey-no-empty-description-block](./journey-no-empty-description-block.ja.md) | 説明を持たない `accDescr` のブロックを禁止する。                  | ✅  |     |     |
| [journey-no-empty-person](./journey-no-empty-person.ja.md)                       | 名前のないタスクの人を禁止する。                                  | ✅  |     |     |
| [journey-no-ignored-text](./journey-no-ignored-text.ja.md)                       | mermaid.js が捨てる、タスクのデータの中のテキストを禁止する。     | ✅  |     |     |
| [journey-no-invalid-score](./journey-no-invalid-score.ja.md)                     | 1 から 5 の数でないタスクの score を禁止する。                    | ✅  |     |     |

## gantt

| 規則                                                                         | 説明                                                                      | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --- | --- | --- |
| [gantt-no-duplicate-description](./gantt-no-duplicate-description.ja.md)     | 説明をもう一度設定する `accDescr` の文を禁止する。                        | ✅  |     |     |
| [gantt-no-duplicate-id](./gantt-no-duplicate-id.ja.md)                       | 前のタスクがすでに持つタスクの id を禁止する。                            | ✅  |     |     |
| [gantt-no-duplicate-setting](./gantt-no-duplicate-setting.ja.md)             | 設定をもう一度設定する設定の文を禁止する。                                | ✅  |     |     |
| [gantt-no-duplicate-title](./gantt-no-duplicate-title.ja.md)                 | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。         | ✅  |     |     |
| [gantt-no-empty-description-block](./gantt-no-empty-description-block.ja.md) | 説明を持たない `accDescr` のブロックを禁止する。                          | ✅  |     |     |
| [gantt-no-invalid-tag](./gantt-no-invalid-tag.ja.md)                         | タスクのデータの中で、mermaid.js がタグとして読まないタグを禁止する。     | ✅  |     |     |
| [gantt-no-undef](./gantt-no-undef.ja.md)                                     | どのタスクの id でもない id を指す `click`、`after`、`until` を禁止する。 | ✅  |     |     |
| [gantt-no-unknown-exclude](./gantt-no-unknown-exclude.ja.md)                 | `weekends` でも曜日の名前でもない `excludes` の語を禁止する。             | ✅  |     |     |

## quadrant

| 規則                                                                               | 説明                                                              | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --- | --- | --- |
| [quadrant-no-duplicate-description](./quadrant-no-duplicate-description.ja.md)     | チャートの説明をもう一度設定する文を禁止する。                    | ✅  |     |     |
| [quadrant-no-duplicate-style](./quadrant-no-duplicate-style.ja.md)                 | 点やクラスがもう一度与えるスタイルを禁止する。                    | ✅  |     |     |
| [quadrant-no-duplicate-title](./quadrant-no-duplicate-title.ja.md)                 | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。 | ✅  |     |     |
| [quadrant-no-empty-description-block](./quadrant-no-empty-description-block.ja.md) | 説明を持たない説明のブロックを禁止する。                          | ✅  |     |     |
| [quadrant-no-invalid-coordinate](./quadrant-no-invalid-coordinate.ja.md)           | 0 から 1 の数でない点の座標を禁止する。                           | ✅  |     |     |
| [quadrant-no-redefined-axis](./quadrant-no-redefined-axis.ja.md)                   | 軸のテキストを置き換える軸の文を禁止する。                        | ✅  |     |     |
| [quadrant-no-redefined-class](./quadrant-no-redefined-class.ja.md)                 | クラスのスタイルを置き換える `classDef` の文を禁止する。          | ✅  |     |     |
| [quadrant-no-redefined-quadrant](./quadrant-no-redefined-quadrant.ja.md)           | 象限のテキストを置き換える象限の文を禁止する。                    | ✅  |     |     |
| [quadrant-no-undef](./quadrant-no-undef.ja.md)                                     | どの `classDef` も定義しない点のクラスを禁止する。                | ✅  |     |     |

## requirement

| 規則                                                                                           | 説明                                                                                      | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --- | --- | --- |
| [requirement-no-duplicate-description](./requirement-no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。                                        | ✅  |     |     |
| [requirement-no-duplicate-field](./requirement-no-duplicate-field.ja.md)                       | requirement や element の本体がすでに持つフィールドを禁止する。                           | ✅  |     |     |
| [requirement-no-duplicate-name](./requirement-no-duplicate-name.ja.md)                         | 前のものの名前を使い回す requirement や element を禁止する。                              | ✅  |     |     |
| [requirement-no-duplicate-title](./requirement-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。                                    | ✅  |     |     |
| [requirement-no-empty-description-block](./requirement-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                                          | ✅  |     |     |
| [requirement-no-ignored-text](./requirement-no-ignored-text.ja.md)                             | mermaid.js が捨てるテキストを禁止する。                                                   | ✅  |     |     |
| [requirement-no-unclosed-description-block](./requirement-no-unclosed-description-block.ja.md) | ほかのもののために書いた `}` が閉じる `accDescr {` のブロックを禁止する。                 |     |     |     |
| [requirement-no-undef](./requirement-no-undef.ja.md)                                           | どの requirement も element も名指さない、`style`、`class`、`:::`、関係の名前を禁止する。 | ✅  |     |     |

## usecase

| 規則                                                                                   | 説明                                                                  | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --- | --- | --- |
| [usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md)           | 前に設定した説明を置き換える `accDescr` を禁止する。                  | ✅  |     |     |
| [usecase-no-duplicate-direction](./usecase-no-duplicate-direction.ja.md)               | 前に設定した方向を置き換える `direction` 文を禁止する。               | ✅  |     |     |
| [usecase-no-duplicate-metadata](./usecase-no-duplicate-metadata.ja.md)                 | 同じキーで前に設定した値を置き換えるメタデータの値を禁止する。        | ✅  |     |     |
| [usecase-no-duplicate-title](./usecase-no-duplicate-title.ja.md)                       | 前に設定したタイトルを置き換える `accTitle` を禁止する。              | ✅  |     |     |
| [usecase-no-empty-description-block](./usecase-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                      | ✅  |     |     |
| [usecase-no-redefined-class](./usecase-no-redefined-class.ja.md)                       | 前に定義したクラスのスタイルを落とすか変える `classDef` を禁止する。  | ✅  |     |     |
| [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.ja.md) | 後の文のために書いた `}` が閉じる `accDescr {` のブロックを禁止する。 |     |     |     |

## c4

| 規則                                                               | 説明                                                                    | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- | --- | --- | --- |
| [c4-no-duplicate-description](./c4-no-duplicate-description.ja.md) | 異なる図の説明を置き換える説明文を禁止する。                            | ✅  |     |     |
| [c4-no-duplicate-style](./c4-no-duplicate-style.ja.md)             | 前の更新が与えた値を置き換えるスタイル更新を禁止する。                  | ✅  |     |     |
| [c4-no-duplicate-title](./c4-no-duplicate-title.ja.md)             | 別の title 文が設定した異なるタイトルを置き換える title 文を禁止する。  | ✅  |     |     |
| [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.ja.md) | C4 のスタイル更新で、色と offset のキーの大文字小文字の誤りを禁止する。 | ✅  |     |     |
| [c4-no-redefined-element](./c4-no-redefined-element.ja.md)         | 前のラベル、種類、型を置き換える要素や境界の宣言を禁止する。            | ✅  |     |     |
| [c4-no-undef](./c4-no-undef.ja.md)                                 | 読まれるときに対象のないスタイル更新を禁止する。                        | ✅  |     |     |
| [c4-no-useless-argument](./c4-no-useless-argument.ja.md)           | C4 の呼出しが読む引数の上限を超える、空でない引数を禁止する。           | ✅  |     |     |

## mindmap

| 規則                                                                       | 説明                                                          | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- | --- | --- | --- |
| [mindmap-no-duplicate-decoration](./mindmap-no-duplicate-decoration.ja.md) | 1 つのノードへの、2 つ目の icon の行と class の行を禁止する。 | ✅  |     |     |
| [mindmap-no-mismatched-shape](./mindmap-no-mismatched-shape.ja.md)         | 開きと合わない閉じを持つ形を禁止する。                        | ✅  |     |     |

## timeline

| 規則                                                                               | 説明                                                              | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --- | --- | --- |
| [timeline-no-duplicate-description](./timeline-no-duplicate-description.ja.md)     | 説明をもう一度設定する `accDescr` の文を禁止する。                | ✅  |     |     |
| [timeline-no-duplicate-title](./timeline-no-duplicate-title.ja.md)                 | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。 | ✅  |     |     |
| [timeline-no-empty-description-block](./timeline-no-empty-description-block.ja.md) | 説明を持たない `accDescr` のブロックを禁止する。                  | ✅  |     |     |

## sankey

| 規則                                                       | 説明                                                             | ✅  | 💡  | 🚧  |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | --- | --- | --- |
| [sankey-no-empty-node](./sankey-no-empty-node.ja.md)       | 名前のないノードを作る、空白だけの source や target を禁止する。 | ✅  |     |     |
| [sankey-no-invalid-value](./sankey-no-invalid-value.ja.md) | mermaid.js が書いたとおりに読まないリンクの値を禁止する。        | ✅  |     |     |

## xychart

| 規則                                                                                   | 説明                                                              | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --- | --- | --- |
| [xychart-no-duplicate-description](./xychart-no-duplicate-description.ja.md)           | チャートの説明をもう一度設定する文を禁止する。                    | ✅  |     |     |
| [xychart-no-duplicate-title](./xychart-no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。 | ✅  |     |     |
| [xychart-no-empty-description-block](./xychart-no-empty-description-block.ja.md)       | 説明を持たない説明のブロックを禁止する。                          | ✅  |     |     |
| [xychart-no-extra-value](./xychart-no-extra-value.ja.md)                               | x 軸のカテゴリーを超えるプロットの値を禁止する。                  | ✅  |     |     |
| [xychart-no-invalid-orientation](./xychart-no-invalid-orientation.ja.md)               | mermaid.js が `horizontal` と読まない向きを禁止する。             | ✅  |     |     |
| [xychart-no-redefined-axis](./xychart-no-redefined-axis.ja.md)                         | 軸のタイトルやデータを置き換える軸の文を禁止する。                | ✅  |     |     |
| [xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.ja.md) | `}` で閉じていない説明のブロックを禁止する。                      | ✅  |     |     |

## block

| 規則                                                                       | 説明                                                           | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------------------- | -------------------------------------------------------------- | --- | --- | --- |
| [block-no-duplicate-block](./block-no-duplicate-block.ja.md)               | ブロックをもう一度宣言することを禁止する。                     | ✅  |     |     |
| [block-no-duplicate-columns](./block-no-duplicate-columns.ja.md)           | ブロックの列の数を変える `columns` の文を禁止する。            | ✅  |     |     |
| [block-no-edge-chain](./block-no-edge-chain.ja.md)                         | 2 つ以上のリンクを持つ辺の文を禁止する。                       | ✅  |     |     |
| [block-no-edge-in-composite-head](./block-no-edge-in-composite-head.ja.md) | 複合ブロックの頭のリンクを禁止する。                           | ✅  |     |     |
| [block-no-invalid-direction](./block-no-invalid-direction.ja.md)           | 向きの語のどれでもないブロック矢印の向きを禁止する。           | ✅  |     |     |
| [block-no-mismatched-edge](./block-no-mismatched-edge.ja.md)               | 2 つの矢印が合わない、ラベルを持つ辺を禁止する。               | ✅  |     |     |
| [block-no-mismatched-shape](./block-no-mismatched-shape.ja.md)             | 開きと合わない閉じを持つ形を禁止する。                         | ✅  |     |     |
| [block-no-redefined-style](./block-no-redefined-style.ja.md)               | 前の `style` の文のスタイルを失わせる `style` の文を禁止する。 | ✅  |     |     |
| [block-no-spaced-class-id](./block-no-spaced-class-id.ja.md)               | `class` の文の id の、コンマの前後の空白を禁止する。           | ✅  |     |     |
| [block-no-undef](./block-no-undef.ja.md)                                   | どのブロックも持たない id への `class` の文を禁止する。        | ✅  |     |     |
| [block-no-useless-width](./block-no-useless-width.ja.md)                   | 辺の最初のブロックの幅を禁止する。                             | ✅  |     |     |

## kanban

| 規則                                                               | 説明                                               | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------ | -------------------------------------------------- | --- | --- | --- |
| [kanban-no-duplicate-section](./kanban-no-duplicate-section.ja.md) | 項目を重ねて列挙する、重複した列の id を禁止する。 | ✅  |     |     |

## venn

| 規則                                                           | 説明                                                               | ✅  | 💡  | 🚧  |
| -------------------------------------------------------------- | ------------------------------------------------------------------ | --- | --- | --- |
| [venn-no-duplicate-style](./venn-no-duplicate-style.ja.md)     | 同じ対象の前の値を置き換えるスタイルを禁止する。                   | ✅  |     |     |
| [venn-no-duplicate-subset](./venn-no-duplicate-subset.ja.md)   | もう一度宣言する集合や和を禁止する。                               | ✅  |     |     |
| [venn-no-duplicate-title](./venn-no-duplicate-title.ja.md)     | 別のタイトルを置き換えるタイトルを禁止する。                       | ✅  |     |     |
| [venn-no-ignored-text](./venn-no-ignored-text.ja.md)           | 後のコメントが取り除く文字を禁止する。                             | ✅  |     |     |
| [venn-no-invalid-style-key](./venn-no-invalid-style-key.ja.md) | 描画が読まないスタイルのプロパティを禁止する。                     | ✅  |     |     |
| [venn-no-undef](./venn-no-undef.ja.md)                         | どの集合も和も宣言しない領域への文字のノードやスタイルを禁止する。 | ✅  |     |     |

## agentflow

| 規則                                                                                       | 説明                                                                        | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | --- | --- | --- |
| [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.ja.md)           | 前に設定した説明を置き換える `accDescr` を禁止する。                        | ✅  |     |     |
| [agentflow-no-duplicate-direction](./agentflow-no-duplicate-direction.ja.md)               | その flow の方向を置き換える `direction` 文を禁止する。                     | ✅  |     |     |
| [agentflow-no-duplicate-title](./agentflow-no-duplicate-title.ja.md)                       | 前に設定したタイトルを置き換える `accTitle` を禁止する。                    | ✅  |     |     |
| [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                            | ✅  |     |     |
| [agentflow-no-ignored-text](./agentflow-no-ignored-text.ja.md)                             | mermaid.js が方向の行から捨てる文字を禁止する。                             | ✅  |     |     |
| [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.ja.md)               | その id に前に書いたタイトルや頂点を置き換える connector の宣言を禁止する。 | ✅  |     |     |
| [agentflow-no-redefined-flow](./agentflow-no-redefined-flow.ja.md)                         | その id に前に書いたタイトルを置き換える flow の宣言を禁止する。            | ✅  |     |     |
| [agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.ja.md)                     | その id に前に書いたラベルや形を置き換える頂点を禁止する。                  | ✅  |     |     |
| [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.ja.md) | `}` で閉じていない `accDescr {` のブロックを禁止する。                      |     |     |     |
| [agentflow-no-undef](./agentflow-no-undef.ja.md)                                           | 何も宣言しない id への `style`、`class`、`click` の文を禁止する。           | ✅  |     |     |

<!-- end auto-generated rules list -->

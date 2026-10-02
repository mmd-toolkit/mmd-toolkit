# 規則

英語版: [index.md](./index.md)

`eslint-plugin-mmd` の規則の一覧。
`eslint-plugin-mmd` は、`@mmd-toolkit/parser` の上に作る、
Mermaid の図のテキストのための ESLint の言語プラグインで、
規則ごとに 1 つの文書がある。
いまのところ、実装したのは
[no-unclosed-directive](./no-unclosed-directive.ja.md) だけである。

## 規則の id

規則の id は、プラグインの名前空間 `mmd` で始まる。
規則は、すべての図種に共通の規則か、1 つの図種の規則かのどちらかである。

- 共通の規則の id は `mmd/<名前>` で、文書はこのディレクトリにある。
- 図種の規則の id は `mmd/<図種>/<名前>` で、
  文書はディレクトリ `<図種>/` にある。
  構文を共有する複数の図種の規則を、1 つのディレクトリに置くことがある。
  `flowchart/` の規則は、`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

<!-- begin auto-generated rules list -->

✅ は、`recommended` の設定が有効にする規則。

## 共通の規則

| 規則                                                           | 説明                                                                          | ✅  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- |
| [no-ignored-init-directive](./no-ignored-init-directive.ja.md) | 図を設定するつもりで書いたが、mermaid.js が無視するディレクティブを禁止する。 |     |
| [no-unclosed-directive](./no-unclosed-directive.ja.md)         | 閉じる `}%%` のないディレクティブを禁止する。                                 |     |

## class

| 規則                                                               | 説明                                                             | ✅  |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- | --- |
| [no-bare-class-name](./class/no-bare-class-name.ja.md)             | 何も変えない、クラス名だけの行を禁止する。                       |     |
| [no-duplicate-description](./class/no-duplicate-description.ja.md) | 説明をもう一度設定する `accDescr` の文を禁止する。               |     |
| [no-duplicate-title](./class/no-duplicate-title.ja.md)             | タイトルをもう一度設定する `accTitle` の文を禁止する。           |     |
| [no-ignored-text](./class/no-ignored-text.ja.md)                   | mermaid.js が読まないテキストを禁止する。                        |     |
| [no-inline-comment](./class/no-inline-comment.ja.md)               | 同じ行のほかのテキストの後に置いたコメントを禁止する。           |     |
| [no-redefined-class](./class/no-redefined-class.ja.md)             | クラスのラベルを、後で違うものに書き直すことを禁止する。         |     |
| [no-unclosed-backquote](./class/no-unclosed-backquote.ja.md)       | 閉じるバッククォートのない、バッククォートのクラス名を禁止する。 |     |
| [no-unknown-class](./class/no-unknown-class.ja.md)                 | 図にないクラスを指す文を禁止する。                               |     |

## flowchart

| 規則                                                                             | 説明                                                             | ✅  |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --- |
| [no-bare-comment-marker](./flowchart/no-bare-comment-marker.ja.md)               | `%%` だけの行を禁止する。                                        |     |
| [no-duplicate-description](./flowchart/no-duplicate-description.ja.md)           | 説明をもう一度設定する `accDescr` の文を禁止する。               |     |
| [no-duplicate-title](./flowchart/no-duplicate-title.ja.md)                       | タイトルをもう一度設定する `accTitle` の文を禁止する。           |     |
| [no-empty-description-block](./flowchart/no-empty-description-block.ja.md)       | 説明を持たない `accDescr` のブロックを禁止する。                 |     |
| [no-ignored-text](./flowchart/no-ignored-text.ja.md)                             | 方向の行にあって、mermaid.js が読まないテキストを禁止する。      |     |
| [no-redefined-vertex](./flowchart/no-redefined-vertex.ja.md)                     | 頂点の形やラベルを、後で違うものに書き直すことを禁止する。       |     |
| [no-style-unknown-id](./flowchart/no-style-unknown-id.ja.md)                     | id がどの頂点もどの subgraph も指さない `style` の文を禁止する。 |     |
| [no-unclosed-description-block](./flowchart/no-unclosed-description-block.ja.md) | 閉じる `}` のない `accDescr {` のブロックを禁止する。            |     |

## sequence

| 規則                                                                      | 説明                                                                          | ✅  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- |
| [no-create-destroy](./sequence/no-create-destroy.ja.md)                   | `destroy` の前の `create` を禁止する。                                        |     |
| [no-duplicate-description](./sequence/no-duplicate-description.ja.md)     | 説明をもう一度設定する `accDescr` の文を禁止する。                            |     |
| [no-duplicate-title](./sequence/no-duplicate-title.ja.md)                 | タイトルをもう一度設定する `title` か `accTitle` の文を禁止する。             |     |
| [no-empty-description-block](./sequence/no-empty-description-block.ja.md) | 説明を持たない `accDescr` のブロックを禁止する。                              |     |
| [no-ignored-text](./sequence/no-ignored-text.ja.md)                       | mermaid.js が何も読まない行を禁止する。                                       |     |
| [no-invalid-json](./sequence/no-invalid-json.ja.md)                       | テキストが JSON のオブジェクトでない `links` か `properties` の文を禁止する。 |     |
| [no-link-without-separator](./sequence/no-link-without-separator.ja.md)   | ラベルと URL の間に `@` がない `link` の文を禁止する。                        |     |

<!-- end auto-generated rules list -->

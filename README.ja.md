# mmd-toolkit

<img src="./packages/playground/public/mmd-toolkit.svg" alt="" width="64" height="64" />

英語版: [README.md](./README.md)

Mermaid の図の記法のためのサードパーティ製ツール群です。
フォーマッター、リンター、パーサー、文書としての仕様、
適合性のコーパスからなります。
mermaid-js とは無関係です。

`mmd` は Mermaid の図のテキストに使われる拡張子 `.mmd` を指します。
同じ略称を使う MultiMarkdown や MikuMikuDance とは関係ありません。

いま対応している図種は flowchart、sequence、class、state で、
ほかの図種は順に対応します。
フォーマッター、リンター、パーサーは、まだ npm に公開していません。
mermaid.js のすべての図種に対応してから公開します。
リンターの規則は、いまは flowchart の分を実装しています。
仕様とテストは、このリポジトリの中で使うもので、公開しません。

## Playground

ブラウザーでMermaidのテキストを編集し、構文木やトークン、
Prettierによる整形結果を確認できます。

公開予定URL:
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)。

**Examples**でサンプルを選ぶか、**Source**にテキストを貼り付けます。
編集に合わせて、**AST**と**Formatted**の表示が更新されます。
**Share**を開き、**Copy Link**で、入力と字下げ設定を復元できるURLを
コピーできます。

ツリーの操作、整形の設定、整形結果の適用については、
[Playgroundの使い方](./packages/playground/README.ja.md)を参照してください。

## パッケージ

| パッケージ                                              | 何のためのものか                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`prettier-plugin-mmd`](./packages/prettier-plugin-mmd) | `.mmd` ファイルと、Markdown の中の `mermaid` コードブロックを、Prettier で整形する。 |
| [`eslint-plugin-mmd`](./packages/eslint-plugin-mmd)     | `.mmd` ファイルと、Markdown の中の `mermaid` コードブロックを、ESLint で検査する。   |
| [`@mmd-toolkit/parser`](./packages/parser)              | Mermaid のテキストを、位置を持つ構文木にする。リンターなどのツールのためのもの。     |
| [`@mmd-toolkit/spec`](./packages/spec)                  | Mermaid のテキストがどう解析されるかを、実装によらない仕様として読む。               |
| [`@mmd-toolkit/tests`](./packages/tests)                | 構文の実装を、mermaid.js の実際の挙動と比べてテストする。                            |

## 保証していること

基準は mermaid.js です。
版は[仕様](./packages/spec/docs/index.ja.md)に記録しています。

- パーサーは、mermaid.js と同じテキストを受理し、同じテキストを拒否します。
  受理したテキストは、同じ図として読みます。
- 構文木は、テキストを何も失いません。
  木とソースから、テキストをバイト単位で再現できます。
- 2 回整形した結果は、1 回整形した結果と同じです。
  整形で図は変わりません。
  少数の例外は、
  フォーマッターの
  [README](./packages/prettier-plugin-mmd/README.ja.md#保証と制限)
  に挙げています。

パーサーは、いくつかの種類の入力で、意図して mermaid.js と違う読み方をします。
たとえば、キーワードの中のディレクティブ（`%%{ ... }%%`）は、
ここでは構文エラーです。
click の文の外にある語 `click` も同じです。
それぞれの定義と理由は、仕様の
[既知の差異](./packages/spec/docs/known-divergences.ja.md)にあります。

もう 1 つの違いは、構文ではなく、パーサーに渡されるものから来ます。
パーサーは mermaid.js のサイト設定を知らないので、
辺の数が `maxEdges`（既定は 500）を超える flowchart を、
mermaid.js は拒否しますが、ここでは受理し、整形します。

## 別の実装を書く

仕様と適合性のコーパスをパーサーから分けてあるのは、
それだけを見て、別の言語でパーサーを書けるようにするためです。
実装は、次の文書に従います。

| 実装がすること                   | 文書                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ソースを受理し、拒否する         | 仕様の [common.ja.md](./packages/spec/docs/common.ja.md)、[detection.ja.md](./packages/spec/docs/detection.ja.md)、`diagrams/<図種>.ja.md`、[known-divergences.ja.md](./packages/spec/docs/known-divergences.ja.md)                                                                                                                                                  |
| 木を作る（ノードの型、欄、値）   | 仕様の [ast.ja.md](./packages/spec/docs/ast.ja.md)、`ast/<図種>.ja.md`                                                                                                                                                                                                                                                                                               |
| 木にトークンと位置を付ける       | パーサーの [tokens.ja.md](./packages/parser/docs/tokens.ja.md)、`tokens/<図種>.ja.md`、[positions.ja.md](./packages/parser/docs/positions.ja.md)、`positions/<図種>.ja.md`                                                                                                                                                                                           |
| 結果を適合性のコーパスと比べる   | テストの [fixture](./packages/tests/README.ja.md#fixture-の中身) と [`ast.json` と `parse-error.json`](./packages/tests/docs/maintaining-fixtures.ja.md#astjson-と-parse-errorjson)                                                                                                                                                                                  |
| 記録した木を mermaid.js と照らす | テストの [db-summaries.ja.md](./packages/tests/docs/db-summaries.ja.md)、[db-from-tree.ja.md](./packages/tests/docs/db-from-tree.ja.md)、`db-from-tree/<図種>.ja.md`、[check-tree.ja.md](./packages/tests/docs/check-tree.ja.md)、[configuration.ja.md](./packages/tests/docs/configuration.ja.md)、[embedded-data.ja.md](./packages/tests/docs/embedded-data.ja.md) |

## 開発に参加する

リポジトリのビルドとテストのしかたは [CONTRIBUTING.ja.md](./CONTRIBUTING.ja.md)
にあります。

## ライセンス

[MIT](./LICENSE)

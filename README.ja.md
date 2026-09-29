# mmd-toolkit

英語版: [README.md](./README.md)

Mermaid の図の記法のためのサードパーティ製ツール群です。
フォーマッター、リンター、パーサー、文書としての仕様、
適合性のコーパスからなります。
mermaid-js とは無関係です。

`mmd` は Mermaid の図のテキストに使われる拡張子 `.mmd` を指します。
同じ略称を使う MultiMarkdown や MikuMikuDance とは関係ありません。

いま対応している図種は flowchart と sequence で、ほかの図種は順に対応します。
フォーマッター、リンター、パーサーは、まだ npm に公開していません。
mermaid.js のすべての図種に対応してから公開します。
リンターの規則は、試しに書いた 1 つを除いて、まだ書いていません。
仕様とテストは、このリポジトリの中で使うもので、公開しません。

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
[既知の差](./packages/spec/docs/known-divergences.ja.md)にあります。

もう 1 つの違いは、構文ではなく、パーサーに渡されるものから来ます。
パーサーは mermaid.js のサイト設定を知らないので、
辺の数が `maxEdges`（既定は 500）を超える flowchart を、
mermaid.js は拒否しますが、ここでは受理し、整形します。

## 開発に参加する

リポジトリのビルドとテストのしかたは [CONTRIBUTING.ja.md](./CONTRIBUTING.ja.md)
にあります。

## ライセンス

[MIT](./LICENSE)

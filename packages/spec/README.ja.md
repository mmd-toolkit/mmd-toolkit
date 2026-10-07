# @mmd-toolkit/spec

英語版: [README.md](./README.md)

Mermaid の図の記法（`.mmd`）を、mermaid.js が読むとおりに定めた仕様です。
図のテキストについて、mermaid.js が受理するかどうか、受理するテキストの構文木、
mermaid.js がそれについて記録する値を定めます。
パーサーを実装する人や、Mermaid のテキストを扱うツールを書く人に向けたものです。

mermaid-js とは関係のない、第三者のプロジェクトです。
このパッケージは npm に公開しません。
仕様は [`docs/`](./docs) の下の文書です。

## mermaid.js の版

この仕様は、
コミット
[`98a0945`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b)
の mermaid 12.0.0 に従います。
仕様とその版が食い違う場合は mermaid.js が正しく、仕様に誤りがあります。
ただし、
[既知の差異](./docs/known-divergences.ja.md) に挙げた意図的な違いは除きます。

## どこから読むか

1. [`docs/index.ja.md`](./docs/index.ja.md): 範囲、適合する実装がすること、
   用語、ほかの文書の構成
2. [`docs/common.ja.md`](./docs/common.ja.md): フロントマター、ディレクティブ、
   コメント、行終端など、全図種に共通すること
3. [`docs/detection.ja.md`](./docs/detection.ja.md): 図種の選び方。
   mermaid.js のすべての図種について
4. [`docs/ast.ja.md`](./docs/ast.ja.md): 全図種に共通する構文木。
   入力を何も失わない
5. [`docs/known-divergences.ja.md`](./docs/known-divergences.ja.md):
   仕様が意図して mermaid.js と異なる入力
6. 図種ごとの 2 つの文書。
   下の表を参照

## 図種

| 図種      | テキストの読み方                                                   | 木のノード                                               |
| --------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| flowchart | [`docs/diagrams/flowchart.ja.md`](./docs/diagrams/flowchart.ja.md) | [`docs/ast/flowchart.ja.md`](./docs/ast/flowchart.ja.md) |
| sequence  | [`docs/diagrams/sequence.ja.md`](./docs/diagrams/sequence.ja.md)   | [`docs/ast/sequence.ja.md`](./docs/ast/sequence.ja.md)   |
| class     | [`docs/diagrams/class.ja.md`](./docs/diagrams/class.ja.md)         | [`docs/ast/class.ja.md`](./docs/ast/class.ja.md)         |

mermaid.js のほかの図種は、まだ定めていません。

## 例

仕様の各記述は、例を `[fixture: <区分>/<名前>]` の形で挙げます。
例は [`packages/tests/fixtures`](../tests/fixtures) にあり、それぞれ入力と、
mermaid.js がそれをどう扱うかを持ちます。

仕様を mermaid.js からどう導いたかは、
[`docs/index.ja.md`](./docs/index.ja.md#元にしたもの) にあります。

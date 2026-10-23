# 既知の差異

英語版: [known-divergences.md](./known-divergences.md)

この仕様は mmd-toolkit のパーサーが実装するもので、
Mermaid のテキストを、固定した版の mermaid.js と同じに読みます。
同じ入力を受理・拒否し、受理した入力には同じ Db、
つまり mermaid.js が図を描くもとにする値を与えます。
ここに挙げる差異は、その例外です。
どの差異も 1 つの構文に関わり、その文書は、
両者が違って読む入力と、両方が同じに読むように書く方法を示します。

## 差異の一覧

| 識別子                                                                                                 | 図種                                                                                                                                                                       | 入力                                                                                                         | 理由     |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- |
| [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md)                 | すべて                                                                                                                                                                     | 名前、キーワード、区切り記号、矢印、数の中のディレクティブ                                                   | 2        |
| [`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.ja.md) | flowchart、sequence、class、state、er、gantt、journey、requirement、mindmap、timeline、xychart、quadrant、block、kanban、c4, venn、agentflow, usecase, pie, gitgraph、info | 名前、数、キーワード、矢印、区切り記号の中の無視される `;`                                                   | 2        |
| [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md)                         | すべて                                                                                                                                                                     | フロントマターの中で始まる HTML タグ                                                                         | 2        |
| [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md)                               | すべて                                                                                                                                                                     | Mermaid が拒否する埋め込みデータ、または gitgraph の受理を両方向に変える埋め込み設定                         | 2 / なし |
| [`click-reserved-word`](./known-divergences/click-reserved-word.ja.md)                                 | flowchart                                                                                                                                                                  | クリックの文が始まらないところの語 `click`                                                                   | 3        |
| [`tokenless-empty-forms`](./known-divergences/tokenless-empty-forms.ja.md)                             | flowchart、sequence、class、state、er、gantt、requirement、mindmap、xychart、quadrant、block、kanban、agentflow                                                            | mermaid.js がトークンを読まない空の形                                                                        | 1        |
| [`comment-takes-character`](./known-divergences/comment-takes-character.ja.md)                         | sequence、gantt、journey、timeline、xychart、quadrant                                                                                                                      | `%%` の直前の文字か数。gantt では `%` の直前の文字                                                           | 2        |
| [`comment-takes-line-break`](./known-divergences/comment-takes-line-break.ja.md)                       | class、gantt、c4                                                                                                                                                           | 行の中で単位の後にあるコメントの後の改行                                                                     | 2        |
| [`headerless-empty-ending`](./known-divergences/headerless-empty-ending.ja.md)                         | class                                                                                                                                                                      | 空の値で終わる、ヘッダーのないテキスト                                                                       | 2        |
| [`name-start-reads-unit`](./known-divergences/name-start-reads-unit.ja.md)                             | class                                                                                                                                                                      | キーワード、`"`、`<<`、`>>` で始まるバッククォートの名前とジェネリクスの型、`~` で始まるバッククォートの名前 | 2        |
| [`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.ja.md)                                 | C4 より後に検出されるすべて                                                                                                                                                | 別の図種のヘッダーの後の `C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment`                           | 2        |
| [`bare-percent-line-before-header`](./known-divergences/bare-percent-line-before-header.ja.md)         | flowchart、class、state、er、gantt、journey、requirement、timeline、sankey、block、c4、agentflow, usecase、pie, gitgraph、info                                             | ヘッダーの前の `%%` だけの行と、その後の空白だけの行のうち、mermaid.js の字句解析器が拒否するもの            | 2        |
| [`percent-brace-after-unit`](./known-divergences/percent-brace-after-unit.ja.md)                       | gantt                                                                                                                                                                      | 単位の直後か 2 つ以上の空白文字の後の、ディレクティブの始まらない `%%{`                                      | 2        |
| [`blank-line-after-header-or-comments`](./known-divergences/blank-line-after-header-or-comments.ja.md) | mindmap、kanban、ishikawa                                                                                                                                                  | ヘッダーの後や図のコメントの後の空行と空白だけの行のうち、mermaid.js の字句解析器が拒否するもの              | 2        |
| [`title-digit-after-axis-statement`](./known-divergences/title-digit-after-axis-statement.ja.md)       | xychart                                                                                                                                                                    | 軸の文の後の、数字を持つ引用符なしのタイトルのうち、mermaid.js の字句解析器がまだ軸の状態にあるところのもの  | 2        |

理由は、[差異を認める条件](#差異を認める条件) の 3 つのどれかで、
「なし」はここだけが受理する場合を表します。
「2 / なし」は、gitgraph の埋め込み設定で両方向を含むことを表します。
差異の文書は、どれも同じ部分を持ちます。
それが関わる構文、例のある差異、書き手にとっての結果、
mermaid.js がそう読む理由、この仕様の規則とその理由、
見つかったときの mermaid.js の文書と issue です。
各図の文書は、その既知の差異の節で、
その図種に当てはまる差異と、それがその図種でどう現れるかを挙げます。

## 比べるもの

比べるのは受理・拒否の判断と Db だけです。
両者が違って判断するか違って読む入力の各群は差異の識別子を持ち、
その影響を受ける fixture には、その識別子を付けます。
両方が入力を拒否するときは、拒否する段階が違っても差異ではなく、
その fixture に識別子は付けません。
`flow%%{init: {}}%%chart LR` の後に行 `A-->` が続くものは、
mermaid.js では flowchart の文法で拒否され、
この仕様ではディレクティブがヘッダーのキーワードの中にあるので拒否されます。
[fixture: common/directive-splits-header-keyword]

## 差異を認める条件

この仕様が mermaid.js の受理する入力を拒否するのは、
次の 3 つの理由のどれかによるときだけで、
しかもここに挙げる差異としてだけです。

1. mermaid.js が読まないテキストを、木（構文木、AST）の中に、
   独立したノードとして置く場所がないとき。
   mermaid.js が読まないテキストは、
   [FlowchartIgnoredText](./ast/flowchart.ja.md#flowchartignoredtext) や、
   文を始める空の説明ブロックのように、ノードになれるところではノードになり、
   その入力は受理されます。
   mermaid.js がテキストを読まないことは、それだけでは拒否の理由になりません。
   mermaid.js が書かれたものと違うものとして読むテキストも同じで、
   受理され、木には書かれたとおりに現れます。
   例外は、文字列、リンク、呼び出しとして、それ自体の意味を持って書かれていて、
   mermaid.js が丸ごと捨てる形です。
   flowchart と class と agentflow で文の始まるところにある空の文字列、
   flowchart と agentflow で文の始まるところにある空の call、
   どこにあっても、gantt の空の href と空の call、
   どこにあっても、requirement の空の文字列、
   mindmap の空の icon、空の class の行、形の中の空の文字列、
   xychart で、軸やプロットのタイトル全体でも値のラベル全体でもない空の文字列、
   どこにあっても、quadrant の空の文字列と空の markdown 文字列、
   どこにあっても、block の空の文字列と空の markdown 文字列、
   そして、kanban の空の icon、空の class の行、形の中の空の文字列です。
   [fixture: kanban/div-empty-string-before-label]

   木はそうした形を何も変えない文としては持たず、その入力は
   [tokenless-empty-forms](./known-divergences/tokenless-empty-forms.ja.md)
   として拒否されます。
   state の state 文脈で、`state` の後や文の後にある空の文字列はこの形ではなく、
   mermaid.js はその前の文を読んでいて、空の文字列は
   [StateIgnoredStatement](./ast/state.ja.md#stateignoredstatement) です。

2. mermaid.js の振る舞いが、その処理の段階の順や字句解析器の規則の順から生じ、
   仕様が述べるものではない場所で、この仕様が直接の規則を述べるとき。
   そのとき違って読まれる入力が差異です。
   それは、どちらも受理して Db が違う入力や、
   この仕様だけが受理する入力であることもあります。
3. mermaid.js の保守者が、その振る舞いを不具合として扱っているとき。

不具合に見える振る舞いについて差異を作る前に、
mermaid.js の issue と pull request を探し、
見つかったものを事実として差異の文書に引きます。

差異には、反対の向きのものもあります。
この仕様は、mermaid.js が拒否するいくつかの入力を受理します。
拒否の理由が木の形に関わらないもので、
mermaid.js が埋め込みデータの中身を検証して拒否する場合と、
拒否がパイプラインの段階や字句解析器の規則の順から生じ（上の 2 つ目の理由）、
この仕様の直接の規則の方が多くを受理する場合です
（`embedded-data-opaque`、`c4-keyword-anywhere`、
`bare-percent-line-before-header`、`percent-brace-after-unit`）。
2 つ目の理由の差異は両方向になることもあり、
mermaid.js だけが受理する入力の中に、この仕様だけが受理する入力が混じります
（`comment-takes-character`、`comment-takes-line-break`、
`name-start-reads-unit`、`html-tag-in-frontmatter`）。

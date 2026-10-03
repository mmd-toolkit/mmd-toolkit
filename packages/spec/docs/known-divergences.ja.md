# 既知の差

英語版: [known-divergences.md](./known-divergences.md)

この仕様は、受理・拒否のすべての判断とすべての Db の値で mermaid.js に従います。
例外は、ここに挙げる差の入力です。
そのような入力の各群は差の識別子を持ち、
その影響を受ける fixture には、その識別子を付けます。
比べるのは受理・拒否の判断と Db だけです。
両方が入力を拒否するときは、拒否する段階が違っても差ではなく、
その fixture に識別子は付けません。
`flow%%{init: {}}%%chart LR` の後に行 `A-->` が続くものは、
mermaid.js では flowchart の文法で拒否され、
この仕様ではディレクティブがヘッダーのキーワードの中にあるので拒否されます。
[fixture: common/directive-splits-header-keyword]

## 差を作るとき

この仕様が mermaid.js の受理する入力を拒否するのは、
次の 3 つの理由のどれかによるときだけで、
しかもここに挙げる差としてだけです。

1. mermaid.js が読まないテキストに、木の中の場所がないとき。
   mermaid.js が読まないテキストは、
   [FlowchartIgnoredText](./ast/flowchart.ja.md#flowchartignoredtext) や、
   文を始める空の説明ブロックのように、ノードになれるところではノードになり、
   その入力は受理されます。
   mermaid.js がテキストを読まないことは、それだけでは拒否の理由になりません。
   mermaid.js が書かれたものと違うものとして読むテキストも同じで、
   受理され、木には書かれたとおりに現れます。
2. mermaid.js の振る舞いが、その処理の段階の順や字句解析器の規則の順から生じ、
   仕様が述べるものではない場所で、この仕様が直接の規則を述べるとき。
   そのとき違って読まれる入力が差です。
   それは、どちらも受理して Db が違う入力や、
   この仕様だけが受理する入力であることもあります。
3. mermaid.js の保守者が、その振る舞いを不具合として扱っているとき。

不具合に見える振る舞いについて差を作る前に、
mermaid.js の issue と pull request を探し、
見つかったものを事実として差の文書に引きます。

差は、反対の向きだけのこともあります。
拒否の理由が木によらないものであるところで、
この仕様は mermaid.js が拒否するいくつかの入力を受理します
（`embedded-data-opaque`）。

## 差の一覧

| 識別子                                                                                                 | 図種                              | 入力                                                            | 理由 |
| ------------------------------------------------------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------- | ---- |
| [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md)                 | すべて                            | 名前、キーワード、区切り記号、矢印、数の中のディレクティブ      | 2    |
| [`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.ja.md) | flowchart、sequence、class        | 名前、数、キーワード、矢印、区切り記号の中の無視される `;`      | 2    |
| [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md)                         | すべて                            | フロントマターの中で始まる HTML タグ                            | 2    |
| [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md)                               | すべて                            | mermaid.js が拒否する埋め込みデータ                             | なし |
| [`click-reserved-word`](./known-divergences/click-reserved-word.ja.md)                                 | flowchart                         | クリックの文が始まらないところの語 `click`                      | 3    |
| [`tokenless-empty-forms`](./known-divergences/tokenless-empty-forms.ja.md)                             | flowchart、sequence、class、state | mermaid.js がトークンを読まない空の形                           | 1    |
| [`comment-takes-character`](./known-divergences/comment-takes-character.ja.md)                         | sequence                          | `%%` の直前の文字か数                                           | 2    |
| [`comment-takes-line-break`](./known-divergences/comment-takes-line-break.ja.md)                       | class                             | 行の中で単位の後にあるコメントの後の改行                        | 2    |
| [`headerless-empty-ending`](./known-divergences/headerless-empty-ending.ja.md)                         | class                             | 空の値で終わる、ヘッダーのないテキスト                          | 2    |
| [`name-start-reads-unit`](./known-divergences/name-start-reads-unit.ja.md)                             | class                             | キーワードか `"` で始まるバッククォートの名前とジェネリクスの型 | 2    |

差の文書は、どれも同じ部分を持ちます。
それが関わる構文、例のある差、mermaid.js がそう読む理由、
この仕様の規則とその理由、書き手にとっての結果、
見つかったときの mermaid.js の文書と issue です。
各図の文書は、その既知の差の節で、
その図種に当てはまる差と、それがその図種でどう現れるかを挙げます。

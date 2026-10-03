# headerless-empty-ending

英語版: [headerless-empty-ending.md](./headerless-empty-ending.md)

図種: class。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

class 図は、それだけの行のヘッダー、
`classDiagram` か `classDiagram-v2` で始まり、
その文が次の行から続きます。

```mmd
classDiagram
  Animal <|-- Duck
  accTitle: farm
```

ヘッダーは、後に語の文字が続かない語 `classDiagram` です
（[検出](../diagrams/class.ja.md#検出) を参照）。
`classDiagramX`、`classDiagram2`、`classDiagramclassDiagram`
で始まるテキストは、
class 図として検出されますが、ヘッダーを持ちません。
この文書は、そのようなテキストが空の値で終わるときについてのものです。

## 差

どの例も、テキストの全体です。

1. 文字が 1 つ足されたヘッダーと、終わりの空のタイトル:

   ```mmd
   classDiagramX
     Animal <|-- Duck
     accTitle:
   ```

2. 同じもので、タイトルが空でないもの:

   ```mmd
   classDiagramX
     Animal <|-- Duck
     accTitle: farm
   ```

3. 正しく書いたヘッダーと、終わりの空のタイトル:

   ```mmd
   classDiagram
     Animal <|-- Duck
     accTitle:
   ```

4. 文字が 1 つ足されたヘッダーと、終わりの `click A call`:

   ```mmd
   classDiagramX
     click A call
   ```

5. 文字が 1 つ足されたヘッダーと、終わりで開いた文字列:

   ```mmd
   classDiagramX
     callback A "
   ```

6. 2 回書いたヘッダーと、終わりの空の説明:

   ```mmd
   classDiagramclassDiagram
     accDescr:
   ```

| 例  | mermaid.js                | この仕様 |
| --- | ------------------------- | -------- |
| 1   | Animal から Duck への関係 | 拒否     |
| 2   | 拒否                      | 拒否     |
| 3   | 拒否                      | 拒否     |
| 4   | 空の図                    | 拒否     |
| 5   | 空の図                    | 拒否     |
| 6   | 空の図                    | 拒否     |

[fixture: class/div-headerless-relation-empty-title] [fixture:
class/header-word-relation-title] [fixture:
class/lex-acc-title-at-end-after-relation] [fixture:
class/div-headerless-empty-call] [fixture: class/div-headerless-empty-string]
[fixture: class/div-headerless-repeated-header]

つまり mermaid.js は、ヘッダーのないテキストを拒否しますが、
テキストが 7 つの空の形のどれかで終わるときは別です。
後に空白しかない `accTitle:`、`accDescr:`、`accDescr {`、
`click A call`、そして `callback A "`、`link A "`、`click A href "` の、
終わりで開いた文字列です。
そのとき mermaid.js はテキストを受理してその文を読み、
ヘッダーの場所の語を、何も足さない文として読みます。
正しいヘッダーの後の同じ終わりは、どちらも拒否します。
この仕様は、ヘッダーのないテキストをすべて拒否します。
[fixture: class/div-headerless-empty-title] [fixture:
class/header-word-after-keyword-title] [fixture: class/lex-acc-title-at-end]

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、`classDiagram` と `classDiagram-v2` を、
後に語の文字が続かないところでだけヘッダーとして読みます
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L41-L42)）。
そのため `classDiagramX` をクラスの名前として読み、
クラスの名前だけの文は何も変えません
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L332-L333)）。

mermaid.js の文法には 2 つの開始があります
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L221-L232)）。
ヘッダー、その文、`EOF` のトークンと続くものと、
ヘッダーも `EOF` のトークンもない、文だけのものです。
字句解析器はどのテキストも `EOF` のトークンで終えるので
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L209-L209)）、
2 つ目の開始がテキストの全体を取ることはありません。
例外が 1 つあります。
字句解析器のいくつかの規則は、空のテキストに当たれます。
`accTitle:` と `accDescr:` の値、`accDescr {` の値、`call` の後の名前、
文字列の中身です
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L30-L61)）。
そのどれかがテキストの終わりで空のテキストに当たると、
字句解析器はすでに終わりに着いた印を付けていて、
`EOF` のトークンの代わりに入力の終わりを知らせます。
するとヘッダーのある開始は来ないトークンを待って、テキストを拒否し、
ヘッダーのない開始がそれを受理します。
例 3 のエラーは、`EOF` を待って入力の終わりを受け取ったと言っていて、
このことを示しています。

## この仕様の規則と、その理由

この仕様では、class 図はそのヘッダーで始まり
（[検出](../diagrams/class.ja.md#検出) を参照）、
それのないテキストは、どう終わっても拒否されます。

mermaid.js が、最後の規則が空のテキストに当たったときだけ、
ヘッダーのないテキストを受理することは、その字句解析器の処理の順から生じます。
`EOF` のトークンを知らせるかどうかは、
終わりに着いた印をいつ付けるかで決まります。
仕様が構文の規則として述べるものではありません。
これは既知の差の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

`classDiagramX` のように、ヘッダーを打ち間違えた class 図は、
この道具では拒否され、ヘッダーがないと報告されます。
mermaid.js もそれを拒否しますが、
テキストが上の空の形のどれかで終わるときは別です。
その形は、それ自体が書きかけの文で、
そのとき mermaid.js は何も言わずに図を描きます。
ヘッダーを正しく書けば、どちらも同じに読みます。
終わりに空の形があれば、そのときはどちらも拒否します。

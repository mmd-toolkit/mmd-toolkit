# Sankey のノード

英語版: [sankey.md](./sankey.md)

この文書は、図種 `sankey` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、ソースの読み方と、
どの文法の規則がどのノードを作るかは [diagrams/sankey.ja.md](../diagrams/sankey.ja.md) で定めます。

この図種の本体は [SankeyDiagram](#sankeydiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
引用符なしの欄は、mermaid.js が読むとおり、両端の空白なしで読まれます。
その値は空白でない文字で始まって終わるか、空白文字だけの欄では空です。
引用符つきの欄は [StringLiteral](../ast.ja.md#stringliteral) で、
その値は引用符の間の書かれたとおりのテキストです。

**リンク**は 3 つの欄の記録です。
**source** のノード、**target** のノード、その間の流れの **value** です。
ノードは id で名付けられるので、
同じ id の 2 つのリンクは同じノードを名付けます。

## ノード

### SankeyDiagram

| 欄     | 型                           | 意味                                  |
| ------ | ---------------------------- | ------------------------------------- |
| `body` | SankeyLinkStatement のリスト | リンク。ソースの順。少なくとも 1 つ。 |

子の欄: `body`。
ヘッダーのキーワード `sankey` か `sankey-beta` は欄ではありません。
どちらも同じ図種で、同じ Db を与えます。
改行はどのリンクにも属さず、
空行はノードを作りません。 [fixture: sankey/db-link-basic]
[fixture: sankey/db-header-beta] [fixture: sankey/db-blank-lines-between]
[fixture: sankey/header-only]

### SankeyLinkStatement

記録です。
`Pumped heat,"Heating and cooling, homes",193.026` です。

| 欄       | 型                                | 意味                               |
| -------- | --------------------------------- | ---------------------------------- |
| `source` | SankeyIdentifier か StringLiteral | 1 つ目の欄。source のノードの id。 |
| `target` | SankeyIdentifier か StringLiteral | 2 つ目の欄。target のノードの id。 |
| `value`  | SankeyLiteral か StringLiteral    | 3 つ目の欄。値。                   |

子の欄: `source`、`target`、`value`。
各欄は引用符なしでも引用符つきでも書けて、
どちらを書いたかはそのノードの型に表れます。
`"a",b,1` は source に StringLiteral を、
`a,b,1` は SankeyIdentifier を持ちます。
mermaid.js が欄を Db にどう読むかは、
tests パッケージの要約にあります。 [fixture: sankey/docs-syntax-sankey-9cc115a6]
[fixture: sankey/db-quoted-and-unquoted-same-id]
[fixture: sankey/db-quoted-value]

### SankeyIdentifier

引用符なしで書いたノードの id です。
空白を含みうる名前で、リンクはそのテキストでそれを参照します。

| 欄     | 型     | 意味                                     |
| ------ | ------ | ---------------------------------------- |
| `name` | string | 両端の空白を除いた、書かれたとおりの欄。 |

子の欄はありません。
名前は、文字の間の空白文字と、`"` と `,` 以外の ASCII の印字文字を持ちます。
両端に空白文字のある `Bio-conversion` は名前 `Bio-conversion` を、
`a b` は名前 `a b` を持ちます。
空白文字だけの欄は空の名前を持ちます。 [fixture: sankey/db-fields-trimmed]
[fixture: sankey/db-text-with-spaces]
[fixture: sankey/db-spaces-only-source-id]
[fixture: sankey/db-spaces-only-target-id]

### SankeyLiteral

引用符なしで書いたリンクの値です。

| 欄      | 型     | 意味                                     |
| ------- | ------ | ---------------------------------------- |
| `value` | string | 両端の空白を除いた、書かれたとおりの欄。 |

子の欄はありません。
文法はここでどのテキストも取るので、
[NumericLiteral](../ast.ja.md#numericliteral) ではありません。
`12.5`、`1e3`、`abc`、`1 #c`、`0x10` は値です。
別の記録の前の空白文字だけの欄は空の値を持ちます。 [fixture: sankey/db-value-decimal]
[fixture: sankey/db-value-exponent]
[fixture: sankey/db-value-not-a-number]
[fixture: sankey/db-value-hash-after-number]
[fixture: sankey/db-value-hexadecimal] [fixture: sankey/db-spaces-only-value]

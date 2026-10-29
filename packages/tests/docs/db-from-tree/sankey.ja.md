# 木から sankey の Db を作る

English version: [sankey.md](./sankey.md)

sankey の図の木から Db の要約を作る手順です。
`src/db-from-tree/sankey.ts`
がこれを実装します（[db-from-tree.md](../db-from-tree.md) を参照）。
構文と木は、
仕様の [diagrams/sankey.md](../../../spec/docs/diagrams/sankey.md) と
[ast/sankey.md](../../../spec/docs/ast/sankey.md) が定めます。
要約の欄は [db-summaries.md](../db-summaries.md#sankey) にあります。

mermaid.js は、構文解析のあいだに Db を作ります。
文法は、レコードが終わるたびに Db を呼びます。
出典は
[`record`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L51-L58)
です。
Db は、渡されたものを持ちます。
出典は
[`findOrCreateNode()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L48-L58)、
[`addLink()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L40-L42)、
[`setDiagramTitle`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)
です。
要約も同じように作ります。
レコードをソースの順に実行し、Db が持つ一覧がそのまま要約になります。
要約はグラフを 1 度だけ読むので（[db-summaries.md](../db-summaries.md#sankey)
を参照）、木の各レコードが、要約のリンク 1 つになります。

## 木から要約を作る

**変換後の形。**
欄はそれぞれ
[変換後の形](../../../spec/docs/common.md#reading-a-source)で読みます。
文字列の中の各行終端（`\r\n` と単独の `\r` も）は `\n` に、
引用符のある欄にもない欄にも、各属性の引用符は `'` になります。
実体は拒否されるので、どの木にもありません。 [fixture: sankey/db-quoted-crlf]
[fixture: sankey/db-quoted-cr] [fixture: sankey/lex-html-tag-in-unquoted-field]
[fixture: sankey/lex-html-tag-in-quoted-field]

**テキスト。**
木の欄のテキストは、次のように読みます。

- SankeyIdentifier と SankeyLiteral は範囲の変換後の形を、
  StringLiteral は引用符の間にあるものの変換後の形を持ちます。
  木の `value` は書かれたテキストで、木はそれを保ちます。
  Db は mermaid.js が読むとおりのテキストを持ちます。
- 欄や文字列の中のディレクティブは変換後の形にないので、テキストにもありません。
  `a,%%{init: {}}%%b,1` の target は `b` で、
  値の後ろやレコードの先頭のディレクティブは何も変えません。
  文字列の中で単独の行にあるコメント行とディレクティブも、テキストにありません。
  [fixture: sankey/db-directive-in-field]
  [fixture: sankey/db-directive-in-quotes]
  [fixture: sankey/db-directive-at-start-of-record]
  [fixture: sankey/db-directive-after-value]
  [fixture: sankey/db-quoted-comment-line]
  [fixture: sankey/db-quoted-directive-line]
- 行の規則が無視する `;` も、変換後の形にありません。
  欄の中でも文字列の中でも、文字列の 2 行目でも同じです。
  別の行にある `;` は残ります。
  [fixture: sankey/lex-style-line-semicolon-source]
  [fixture: sankey/lex-style-line-semicolon-in-second-line-of-quotes]
  [fixture: sankey/lex-style-line-does-not-cross-lines-in-quotes]
  [fixture: sankey/lex-style-line-semicolon-at-end-of-field]
  [fixture: sankey/db-text-semicolon-at-end-of-field]

**歩き方。**
body のレコードをソースの順に実行します。
各レコードは、source のノードの次に target のノードを名指しし、
リンクを加えます。
Db にほかの文はなく、図にほかのノードもありません。
[fixture: sankey/db-two-links] [fixture: sankey/db-node-order]

**id。**
source や target が与える id は、欄の変換後の形から両端の空白を除いたものです。
文字列では、改行の各連なりを 1 つの改行にもします（テキスト全体が、
読まれる前にそうなります。
[`prepareTextForParsing()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sankey/sankeyUtils.ts#L1-L8)
を参照）。
そのうえで各 `""` を `"` 1 つにし、文字の置き換え（後述）をします。
空白だけの欄と、空白だけの文字列は、空の id になります。
[fixture: sankey/db-fields-trimmed] [fixture: sankey/db-quoted-doubled-quote]
[fixture: sankey/db-quoted-four-quotes] [fixture: sankey/db-quoted-only-quote]
[fixture: sankey/db-quoted-comma]
[fixture: sankey/db-quoted-blank-line-collapses]
[fixture: sankey/db-quoted-crlf-blank-line-collapses]
[fixture: sankey/db-quoted-space-line-kept]
[fixture: sankey/db-quoted-leading-line-feed]
[fixture: sankey/db-quoted-both-line-feed-ids]
[fixture: sankey/db-quoted-line-feeds-only]
[fixture: sankey/db-quoted-spaces-trimmed]
[fixture: sankey/db-spaces-only-target-id]
[fixture: sankey/db-spaces-only-source-id]

**ノード。**
id のノードは、id が新しいときに作られ、ノードの一覧は各 id を、
名前が最初に出た順に 1 度ずつ持ちます。
同じ id は、引用符で書いても書かなくても同じノードです。
大文字小文字が違う id は別のノードで、
`__proto__` と `constructor` もほかと同じ id です。
別のレコードを繰り返すリンク、逆向きのリンク、ノード自身へのリンクは、
それぞれ 1 つのリンクです。 [fixture: sankey/db-quoted-and-unquoted-same-id]
[fixture: sankey/db-ids-case-sensitive]
[fixture: sankey/db-ids-of-object-prototype] [fixture: sankey/db-duplicate-link]
[fixture: sankey/db-self-link]

**値。**
リンクの値は、
欄の変換後の形から両端の空白を除いたものを `parseFloat()` に通した数です。
数はテキストの先頭から読まれ、後ろに何があっても捨てられます。
`1 #c` は 1、`0x10` は 0 で、数で始まらないテキストは数ではありません。
有限でない値は、JSON にそのような数がないので、数のテキストになります。
数でないテキストと空白だけの欄は `NaN`、
`Infinity` と `-Infinity` というテキストと、
倍精度に収まらない大きな数は `Infinity` か `-Infinity` です。
`-0` は Db では -0 ですが、JSON に -0 はないので、要約は 0 です。
引用符のある値も、引用符の間にあるものから同じように読みます。
[fixture: sankey/db-value-not-a-number] [fixture: sankey/db-value-hexadecimal]
[fixture: sankey/db-value-exponent-negative]
[fixture: sankey/db-value-negative-zero] [fixture: sankey/db-value-infinity]
[fixture: sankey/db-value-negative-infinity] [fixture: sankey/db-value-overflow]
[fixture: sankey/db-value-hash-after-number]
[fixture: sankey/db-spaces-only-value]
[fixture: sankey/db-quoted-value-with-comma]
[fixture: sankey/db-quoted-value-not-a-number]
[fixture: sankey/db-quoted-value-with-quotes]

**タイトル。**
タイトルは、mermaid.js が読むとおりのフロントマターのものに、
文字の置き換えをしたものです。
図に `title` の文はありません。
タイトルの空白は残ります。 [fixture: sankey/db-title-frontmatter]
[fixture: sankey/db-title-frontmatter-spaces]

**要約。**
要約は [db-summaries.md](../db-summaries.md#sankey) の欄を持ちます。
タイトル、上の順の id である `nodes`、ソースの順の `links` で、
各リンクは `source`、`target`、 `value` を持ちます。
[fixture: sankey/db-everything]

## 文字の置き換え

Db が `sanitizeText` に通すテキストは、タイトルとすべての id の 2 種類です。
`sankeyDbOf()` は、
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) の置き換え
`textReplacementOf(embedded.config)` を、この 2 つにだけ適用します。
id は、上のように読んだあとで置き換えられ、
id が等しくなったノードは 1 つのノードです。
[fixture: sankey/config-security-level-other-title-and-ids]
[fixture: sankey/config-security-level-other-html-labels-false]
[fixture: sankey/config-security-level-other-flowchart-html-labels-false]
[fixture: sankey/config-security-level-loose-ids]
[fixture: sankey/config-security-level-sandbox-ids]

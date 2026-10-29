# click-reserved-word

英語版: [click-reserved-word.md](./click-reserved-word.md)

図種: flowchart。
これは、
この仕様の mermaid.js との [既知の差異](../known-divergences.ja.md) の 1
つです。

## 構文

flowchart では、クリック文は語 `click` で始まり、
頂点にリンクかコールバックを与えます。

```mmd
flowchart LR
  A
  click A href "u" "tip"
```

この例は A にリンク `u` とツールチップ `tip` を与えます。
[fixture: flowchart/gram-click-href-tooltip]

単位が始まる場所の語 `click` は、その後の空白とともに `click` の単位です。
[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック)
を参照してください。
この文書は、クリック文が始まらない場所のそのような単位についてのものです。
文の中、同じ行の文の後、id、スタイル、サブグラフの名前の中です。
文字列の中や、長い id の一部の語は `click` の単位ではなく、
どちらもテキストとして読みます。
`A["click"]` はラベル `click` を持ち、 `click-node` は頂点です。
[fixture: flowchart/gram-label-string-click] [fixture:
flowchart/spec-flow-singlenode-ada86e69]

## 差異

どの例も、flowchart の全体です。

1. サブグラフの名前の中の語 `click`:

   ```mmd
   flowchart LR
     subgraph Handle click events
       A
     end
   ```

2. 辺の後の `click`:

   ```mmd
   flowchart LR
     A --> B click ""
   ```

3. クリック文のツールチップの前の `click`:

   ```mmd
   flowchart LR
     A
     click A href "u" click "tip"
   ```

4. id が矢印に見えるクリック文:

   ```mmd
   flowchart LR
     click --- abc
   ```

| 例  | mermaid.js                                      | この仕様 |
| --- | ----------------------------------------------- | -------- |
| 1   | サブグラフ `Handle events` と次の行。頂点はない | 拒否     |
| 2   | A から B への辺                                 | 拒否     |
| 3   | A のリンク `u` とツールチップ `tip`             | 拒否     |
| 4   | id `---` へのクリック。頂点はない               | 同じ     |

表で比較した読みを次の fixture が記録します。
[fixture: flowchart/db-subgraph-name-click-word-indented] [fixture:
flowchart/gram-click-bare-after-vertex] [fixture:
flowchart/gram-click-mid-statement-tooltip] [fixture:
flowchart/lex-click-id-arrow-callback]

例 1 では、mermaid.js は `events` をクリックの id として読んで捨て、
次の行をその字下げとともにサブグラフのタイトルにつなぎます。
そのサブグラフは頂点を持ちません。
例 2 では `click` の後の空の文字列を何もないものとして読み、
例 3 ではツールチップの前の `click` を何もないものとして読みます。
この仕様は、そのどれも拒否します。
クリック文そのものは、
例 4 のように `click` が頂点のつもりだったかもしれない場所でも、
mermaid.js と同じに読みます。
そのクリックの id は、何であっても、クリックの文脈が読む文字の並びです。
[クリックの文](../diagrams/flowchart.ja.md#クリックの文) を参照してください。
差異は一方向だけです。
mermaid.js が受理し、この仕様が拒否します。
flowchart の文書は、
その場所を [既知の差異](../diagrams/flowchart.ja.md#既知の差異) に挙げています。

コメント領域（[ソースの読み方](../common.ja.md#ソースの読み方)）、
空の形（[tokenless-empty-forms](./tokenless-empty-forms.ja.md) を参照）、
そうした `click` ごとに `click` の語、その後の空白、
mermaid.js がクリックの文脈を出る 1 つの空白文字を除いた入力が、
それらを除いた入力の単位と同じ単位として読まれ、
そのクリックの id とその間の `click-comma` の単位は、
それぞれ同じ所で始まり終わる単位として読まれ、
どのクリックの id のテキストもその木の 1 つの葉ノードに収まるところでは、
この仕様がその入力に与える Db は、mermaid.js が入力に与える Db と同じです。
`A:click "" b-->C` は、頂点 `A:b` と C への辺を持つ `A:b-->C` として読まれます。
`subgraph click me` は、空の行が続くところでは、その前にコメントの行があっても、
id `me` の `subgraph me` として読まれ、 U+2028 か U+2029 と改行が続くところ、
`me` の後にディレクティブが続くところでも同じです。
行単位の規則が最後の `;` を無視する `classDef a:click "" b fill:#f00;` は、
`classDef a:b fill:#f00;` として読まれます。
[fixture: flowchart/db-vertex-id-bare-click]
[fixture: flowchart/db-subgraph-id-click-blank-line]
[fixture: flowchart/db-subgraph-id-click-comment-line]
[fixture: flowchart/db-subgraph-id-click-line-separator]
[fixture: flowchart/db-subgraph-id-click-paragraph-separator]
[fixture: flowchart/db-subgraph-id-click-space-directive]
[fixture: flowchart/db-classdef-name-bare-click-ignored-semicolon]
それ以外では、除くことで両側がつながるか、
クリックの id のテキストが文の文脈で別に読まれる位置に来るので、
`click` を除いた入力について何もいえません。
`subgraph click me`、改行、`A` は `subgraph meA` になり、
`subgraph click me accDescr {}` に空の行が続くものは、
`subgraph meaccDescr {}` になって、mermaid.js はそれを拒否し、
`subgraph click m;e` では `;` が `subgraph m;e` の区切りになり、
`subgraph click a,b` に空の行が続くものでは、`,` が `,` の単位になります。
名前は `,` の単位を取らないので、
`subgraph a,b` は mermaid.js でも拒否されます。
[fixture: flowchart/gram-subgraph-name-click]
[fixture: flowchart/gram-subgraph-name-click-empty-description-block]
[fixture: flowchart/gram-subgraph-name-click-semicolon-in-id]
[fixture: flowchart/db-subgraph-id-click-comma-blank-line]

## 書き手にとっての結果

語 `click` は、サブグラフの名前や、
引用符のないほかのテキストに書きやすい語です。
そのとき mermaid.js は、それをクリックの始まりとして読み、その後の語を捨て、
例 1 のように、次の行をテキストにつなぐことがあり、警告を出しません。
mmd-toolkit のパーサーは入力を拒否し、予約語を報告します。
語をテキストとして書くには、テキストを引用符で囲みます。
`subgraph "Handle click events"` なら、どちらもそのタイトルと、
サブグラフの中の頂点 A を読みます。
[fixture: flowchart/gram-subgraph-name-string-click]

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、空白が後に続くすべての `click` で、
クリックの文脈に入ります（mermaid.js の
[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L112-L114)）。
そこでクリック文が始まれるかは確かめません。
この規則はトークンを返しません。
クリックの文脈では、後に続くものを次の空白までクリックの id として読むか、
文字列と空白しか続かなければ何も読みません。
文法は、そのクリックの id か何もないものを取れる場所なら、
どこでもその結果を受理します。

## この仕様の規則と、その理由

この仕様では、`click` は予約語です。
`click` の単位はクリック文の最初の単位としてだけ受理され、
それ以外の場所に `click` の単位がある入力は拒否されます。

mermaid.js の保守者は `click` を予約語として扱い、
ほかの場所での使い方を不具合として扱っています（下を参照）。
これは既知の差異の 3
つ目の理由に当たります（[known-divergences.ja.md](../known-divergences.ja.md)
を参照）。

## mermaid.js の文書と issue

- [Issue #4182](https://github.com/mermaid-js/mermaid/issues/4182) 「`click`
  cannot be used for node IDs」は、2023-03-04 に、プロジェクトの member が、
  `click` は予約されたキーワードだと答えて閉じました。
  ラベルは `Type: Bug / Error` と `Status: Triage` です。
- [Issue #7023](https://github.com/mermaid-js/mermaid/issues/7023) 「node named
  click is not rendered in flowgraph」は、 `click --- abc;` についてのものです。
  mermaid.js はこれをクリック文として読んで空の図を描き、
  この仕様も同じに読みます。
  2026-10-02 の時点で open で、
  ラベルは `Type: Bug / Error` と `Status: Approved` です。
  2025-10-09 に contributor が、この入力は構文エラーにすべきだと返信し、
  2026-02-27 に collaborator が、bot が書いた印のある返信で、
  予約されたキーワードとの衝突で、直すことが承認された、と答えています。
  mermaid.js がどう変わるかは決まっていません。

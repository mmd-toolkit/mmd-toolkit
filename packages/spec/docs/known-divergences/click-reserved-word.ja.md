# click-reserved-word

英語版: [click-reserved-word.md](./click-reserved-word.md)

図種: flowchart。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

flowchart では、クリック文は語 `click` で始まり、
頂点にリンクかコールバックを与えます。

```mmd
flowchart LR
  A
  click A href "u" "tip"
```

[fixture: flowchart/gram-click-href-tooltip]

単位が始まる場所の語 `click` は、その後の空白とともに `click` の単位です
（[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック) を参照）。
この文書は、クリック文が始まらない場所のそのような単位についてのものです。
文の中、同じ行の文の後、id、スタイル、サブグラフの名前の中です。
文字列の中や、長い id の一部の語は `click` の単位ではなく、
どちらもテキストとして読みます。
`A["click"]` はラベル `click` を持ち、`click-node` は頂点です。
[fixture: flowchart/gram-label-string-click] [fixture:
flowchart/spec-flow-singlenode-ada86e69]

## 差

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
そのクリックの id は、何であっても、クリックの文脈が読む文字の並びです
（[クリックの文](../diagrams/flowchart.ja.md#クリックの文) を参照）。
差は一方向だけです。
mermaid.js が受理し、この仕様が拒否します。
flowchart の文書は、その場所を
[既知の差](../diagrams/flowchart.ja.md#既知の差) に挙げています。

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、空白が後に続くすべての `click` で、
クリックの文脈に入ります
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L112-L114)）。
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
これは既知の差の 3 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

語 `click` は、サブグラフの名前や、
引用符のないほかのテキストに書きやすい語です。
そのとき mermaid.js は、それをクリックの始まりとして読み、その後の語を捨て、
例 1 のように、次の行をテキストにつなぐことがあり、何も言いません。
この道具は入力を拒否し、予約語を報告します。
語をテキストとして書くには、テキストを引用符で囲みます。
`subgraph "Handle click events"` なら、
どちらもそのタイトルと、サブグラフの中の頂点 A を読みます。
[fixture: flowchart/gram-subgraph-name-string-click]

## mermaid.js の文書と issue

- [Issue #4182](https://github.com/mermaid-js/mermaid/issues/4182)
  「`click` cannot be used for node IDs」は、2023-03-04 に、
  プロジェクトの member が、`click` は予約されたキーワードだと答えて閉じました。
  ラベルは `Type: Bug / Error` と `Status: Triage` です。
- [Issue #7023](https://github.com/mermaid-js/mermaid/issues/7023)
  「node named click is not rendered in flowgraph」は、
  `click --- abc;` についてのものです。
  mermaid.js はこれをクリック文として読んで空の図を描き、
  この仕様も同じに読みます。
  2026-10-02 の時点で open で、
  ラベルは `Type: Bug / Error` と `Status: Approved` です。
  2025-10-09 に contributor が、この入力は構文エラーにすべきだと返信し、
  2026-02-27 に collaborator が、bot が書いた印のある返信で、
  予約されたキーワードとの衝突で、直すことが承認された、と答えています。
  mermaid.js がどう変わるかは決まっていません。

## 件数と確かめ方

この差の印がある fixture は 86 件で、すべて flowchart です。
mermaid.js はそのどれも受理し、この仕様はどれも拒否します。

そのような入力のそれぞれについて、
parser の差分テストは、parser と、**参照入力**に対する mermaid.js を比べます。
参照入力は、入力から、コメントの領域と、空の形
（[`tokenless-empty-forms`](./tokenless-empty-forms.ja.md) を参照）を除き、
クリック文を始めない `click` の単位のそれぞれについて、
語 `click`、その後の空白、そして字句解析器が入ったクリックの文脈を出るときの
空白 1 文字（あれば）を除いたものです。
mermaid.js は、3 つの条件が成り立つところで、
参照入力に入力と同じ Db を与えます。
mermaid.js が参照入力を受理すること。
この仕様の字句解析器が、参照入力を、除いたもの以外の入力の単位として読むこと。
ただし、それらの `click` の単位のクリックの文脈が読むクリックの id と
`click-comma` の単位は除き、そのテキストは、
それぞれと同じ場所で始まり終わるほかの単位として読んでもかまいません。
そして、それらのクリックの id のテキストが、
参照入力の木の 1 つの葉ノードの範囲に収まること。
`A:click "" b-->C` は `A:b-->C` になり、
どちらでも頂点 `A:b` と、C へのその辺を持ちます。
`subgraph click me` の後に空の行が続くものは `subgraph me` になり、
どちらでも id `me` を持ちます。
[fixture: flowchart/db-vertex-id-bare-click] [fixture:
flowchart/db-subgraph-id-click-blank-line]

そうでなければ、除くことで両側にあるものがつながるか、
クリックの id のテキストが、文の文脈が別に読む場所に置かれ、
mermaid.js が参照入力を別に読むことがあります。
同じ Db を与えるつなぎもあります。
`subgraph click me`、改行、`A` は `subgraph meA` になり、
どちらでも id `meA` を持ちます。
mermaid.js が、クリックの id と次の行を同じようにつなぐからです。
そうでないものもあります。
`subgraph click m;e` では、クリックの id の `;` が、
参照入力 `subgraph m;e` で区切りになり、id は `m;e` でなく `m` です。
`subgraph click a,b` では、`,` が `,` の単位になり、名前はそれを取らないので、
mermaid.js は `subgraph a,b` を拒否します。
[fixture: flowchart/gram-subgraph-name-click] [fixture:
flowchart/gram-subgraph-name-click-semicolon-in-id] [fixture:
flowchart/gram-subgraph-name-click-comma]

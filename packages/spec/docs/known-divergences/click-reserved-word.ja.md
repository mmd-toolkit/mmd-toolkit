# click-reserved-word

英語版: [click-reserved-word.md](./click-reserved-word.md)

図種: flowchart。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

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
（[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック)
を参照）。
この文書は、クリック文が始まらない場所のそのような単位についてのものです。
文の中、同じ行の文の後、id、スタイル、サブグラフの名前の中です。
文字列の中や、長い id の一部の語は `click` の単位ではなく、
どちらもテキストとして読みます。
`A["click"]` はラベル `click` を持ち、`click-node` は頂点です。
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
差異は一方向だけです。
mermaid.js が受理し、この仕様が拒否します。
flowchart の文書は、その場所を
[既知の差異](../diagrams/flowchart.ja.md#既知の差異) に挙げています。

## 書き手にとっての結果

語 `click` は、サブグラフの名前や、
引用符のないほかのテキストに書きやすい語です。
そのとき mermaid.js は、それをクリックの始まりとして読み、その後の語を捨て、
例 1 のように、次の行をテキストにつなぐことがあり、警告を出しません。
mmd-toolkit のパーサーは入力を拒否し、予約語を報告します。
語をテキストとして書くには、テキストを引用符で囲みます。
`subgraph "Handle click events"` なら、
どちらもそのタイトルと、サブグラフの中の頂点 A を読みます。
[fixture: flowchart/gram-subgraph-name-string-click]

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
これは既知の差異の 3 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

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

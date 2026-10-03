# html-tag-in-frontmatter

英語版: [html-tag-in-frontmatter.md](./html-tag-in-frontmatter.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

図のテキストでは、`<` と語から次の `>` までの HTML のタグの中の `"` は、
`'` として読まれます。
ラベルが属性のあるタグを持てるようにするためです
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
図はフロントマターで始めることもでき、そのタイトルもそのようなタグを持てます。

```mmd
---
title: <b class="x">T</b>
---
flowchart LR
  A
```

どちらも、タイトル `<b class='x'>T</b>` を読みます。
[fixture: flowchart/frontmatter-title-html-attribute]
この文書は、フロントマターで始まってそこで終わらず、
図のテキストまで届くタグについてのものです。

## 差

どの例も、図の全体です。

1. タイトルで開いたタグと、`"` と `>` を持つラベル:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     A[b="c">d]
   ```

2. タイトルで開いたタグと引用符の値、タグを持つラベル:

   ```mmd
   ---
   title: <a z="
   ---
   flowchart LR
     A[<b x="y">t]
   ```

3. タイトルで開いたタグと、`"` と `>` を持つアクセシビリティのタイトル:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     accTitle: b="c">d
     A
   ```

4. タイトルで開いたタグと、`"` と `>` を持つメッセージ:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A -x B: b="c">d
   ```

5. 同じもので、矢印が `>` を持つもの:

   ```mmd
   ---
   title: <a
   ---
   sequenceDiagram
     A ->> B: b="c">d
   ```

| 例  | mermaid.js                           | この仕様                             |
| --- | ------------------------------------ | ------------------------------------ |
| 1   | ラベル `b='c'>d` を持つ頂点 A        | 拒否                                 |
| 2   | 拒否                                 | ラベル `<b x='y'>t` を持つ頂点 A     |
| 3   | アクセシビリティのタイトル `b='c'>d` | アクセシビリティのタイトル `b="c">d` |
| 4   | メッセージ `b='c'>d`                 | メッセージ `b="c">d`                 |
| 5   | メッセージ `b="c">d`                 | 同じ                                 |

[fixture: flowchart/html-tag-starts-in-frontmatter] [fixture:
flowchart/html-tag-starts-in-frontmatter-value] [fixture:
flowchart/html-tag-starts-in-frontmatter-acc-title] [fixture:
sequence/div-html-tag-starts-in-frontmatter-message] [fixture:
sequence/lex-html-tag-frontmatter-arrow-ends-tag]

つまり mermaid.js では、フロントマターで始まるタグは、
その後の最初の `>` まで続き、その `>` はテキストの中にあり得ます。
そして、その `>` の前の `"` は `'` として読まれます。
例 1 では、ラベルに `"` が残らず、
mermaid.js の flowchart の文法はそれを受理します。
フロントマターがなければ、`A[b="c">d]` はどちらも拒否します。
例 2 では、引用符の値 `z="` が `x=` の後の `"` を取るので、
`y` の後の `"` が残り、mermaid.js はラベルを拒否します。
例 5 では、矢印の `>` が、メッセージの前でタグを終えます。
この仕様は、フロントマターの後のテキストでだけタグを探し、
これらのテキストを、フロントマターがないときと同じに読みます。
フロントマターの中で始まって終わるタグは、差を生みません。
差は両方向にあり、受理も Db も変わることがあります。

## mermaid.js がそう読む理由

mermaid.js は、
[`cleanupText`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
で、すべてのタグの中の `"` を `'` に置き換えます。
これはソース全体に対して、
[`preprocessDiagram`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L65)
がフロントマターを除く前に行われます。
置き換えはフロントマターの終わりを知らないので、
そこで始まるタグがテキストの中の `>` と組になります。

## この仕様の規則と、その理由

この仕様では、字句解析器はフロントマターの後から読み始め、
読むテキストの中でだけタグを探します。
フロントマターが何を持っていても、テキストの読み方は変わりません
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
タイトルのような、フロントマターから得る値は、mermaid.js が得るものと同じです
（[フロントマターの設定](../../../tests/docs/configuration.ja.md#フロントマターの設定) を参照）。

タグがフロントマターからテキストへ届けることは、
mermaid.js の処理の順から生じます。
置き換えが、フロントマターを除く前に行われるからです。
仕様が構文の規則として述べるものではありません。
これは既知の差の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## 書き手にとっての結果

`title: <a` のように、`<` と語の後に `>` のないタイトルを持つフロントマターは、
ふつうではありません。
それがあると、mermaid.js は、そこから図の最初の `>` までのすべての `"` を
`'` として読みます。
そのため、拒否するはずのラベルを受理したり、受理するはずのラベルを拒否したり、
ラベル、タイトル、メッセージのテキストを変えたりします。
この道具は、図をフロントマターがないときと同じに読みます。
タイトルのタグを閉じるか、`<` を書かなければ、どちらも同じに読みます。

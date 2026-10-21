# html-tag-in-frontmatter

英語版: [html-tag-in-frontmatter.md](./html-tag-in-frontmatter.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

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
フロントマターの境界を越えて図のテキストまで続くタグについてのものです。

venn では、frontmatter が `title: <a` を持つ場合、
`set "b="c">d"` はここでは拒否します。
[fixture: venn/div-html-tag-starts-in-frontmatter]
mermaid.js は内側の属性の引用符を変換して受理します。
[fixture: venn/div-html-tag-starts-in-frontmatter]

frontmatter に開始タグがなければ、
同じ venn の本文をどちらも拒否します。
[fixture: venn/gram-html-tag-body-only-reference]

## 差異

どの例も、図の全体です。

1. タイトルで開いたタグと、`"` と `>` を持つラベル:

   ```mmd
   ---
   title: <a
   ---
   flowchart LR
     A[b="c">d]
   ```

2. タイトル内でタグが始まり、引用符で囲んだ属性値も閉じていないものと、
   タグを持つラベル:

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
フロントマターの中で始まって終わるタグは、差異を生みません。
差異は両方向にあり、受理も Db も変わることがあります。

kanban ではフロントマターに `title: <a` があるとき、
mermaid.js は `S["b="c">d"]` の内側の属性引用符を変換して入力を受理します。
この仕様はラベルの文字列を 2 つ目の引用符で終えて入力を拒否します。
[fixture: kanban/div-frontmatter-open-tag]
フロントマターに `<a` がなければ両者で拒否します。
[fixture: kanban/gram-frontmatter-no-tag-reference]

C4 では frontmatter に `title: <a` があると、
`Person(a,"b="c">d")` をここでは拒否し、
mermaid.js は内側の属性引用符を変換して受理します。
[fixture: c4/div-frontmatter-open-tag]

## 書き手にとっての結果

`title: <a` のように、`<` と語の後に `>` のないタイトルを持つフロントマターは、
ふつうではありません。
それがあると、mermaid.js は、そこから図の最初の `>` までのすべての `"` を
`'` として読みます。
そのため、拒否するはずのラベルを受理したり、受理するはずのラベルを拒否したり、
ラベル、タイトル、メッセージのテキストを変えたりします。
mmd-toolkit のパーサーは、図をフロントマターがないときと同じに読みます。
タイトルのタグを閉じるか、`<` を書かなければ、どちらも同じに読みます。

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
（[フロントマターの設定](../../../tests/docs/configuration.ja.md#フロントマターの設定)
を参照）。

タグがフロントマターの境界を越えて本文まで続くことは、
mermaid.js の処理の順から生じます。
置き換えが、フロントマターを除く前に行われるからです。
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

## mermaid.js の文書と issue

- 固定した版の
  [C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  は引用された説明の内部で `<br/>` を使い、
  [折り返しの設定に YAML のフロントマターを示しています](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L159-L171)。
  フロントマターで始まり C4 の引数へ続くタグは、
  説明していません。
  `mermaid-js/mermaid` の issue と pull request を、
  2026-10-21 に `C4 frontmatter in:title,body`、
  `frontmatter HTML quotes in:title,body`、
  `C4 frontmatter tag in:title,body` で検索し、
  この形式についての報告は見つかりませんでした。

- ピン留めした
  [venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  は YAML frontmatter と引用ラベルを示し、
  frontmatter の境界をまたぐ HTML タグは示していません。
  2026-10-21 に `mermaid-js/mermaid` の issue と PR を
  `venn frontmatter in:title,body` と `venn HTML in:title,body` で検索し、
  その形に関する報告は見つかりませんでした。

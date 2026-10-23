# title-digit-after-axis-statement

英語版:
[title-digit-after-axis-statement.md](./title-digit-after-axis-statement.md)

図種: xychart。
この仕様と mermaid.js の [既知の差異](../known-divergences.ja.md) の 1 つです。

## 対象の構文

XY chart では、字句解析器は軸のタイトルの数字を数の始まりとして読みます。
そのため、引用符なしの軸のタイトルは数字を持たず、
`title` の後に書く図のタイトルは数字を持てます
（[軸の文脈](../diagrams/xychart.ja.md#軸の文脈) を参照）。
軸の文、つまり `x-axis` か `y-axis` とそれに続くものは軸の文脈で読まれ、
軸の文脈は、改行、`;`、次の文のキーワードで終わります。
説明ブロックはその上で読まれ、ブロックの後も軸の文脈が続きます。
その後のタイトルの文は、数字を語の文字として読みます。

mermaid.js は、次の規則が数えるとおりにタイトルが軸の文に続くとき、
そのタイトルを、数字が数を始める字句解析器の状態で読みます。
字句解析器は、読んだ軸の文とプロットの文ごとに 1 つの**段**を、
最新のものを上にして持ちます。
各改行文字は一番上の段を 1 つ降ろします。
CRLF と単独の CR は 1 つの改行文字として、空行の改行文字は 1 つずつ数えます。
単位の後、`;` の後、コメントの後、説明ブロックの `}` の後、
アクセシビリティの文のテキストの後の改行文字です。
次の改行文字は何も降ろしません。

- その行で空白の後にある改行文字。U+2028 や U+2029 の後も同じです。
  空白の規則が、空白と、次の単位までのその後の改行文字と空白とともに読みます。
  そのため、空白だけの行は何も降ろさず、その前の改行文字は降ろします。
- 単位が読む改行文字。文字列や説明ブロックの中のものと、
  `accTitle` と `accDescr` の `:` や `{` の周りのものです。
- 行頭から `%%` だけの行のすぐ前の改行文字。
  mermaid.js のコメントがそれを取ります
  （[comment-takes-character](./comment-takes-character.ja.md) を参照）。
- 字句解析器がテキストを読む前に mermaid.js が除く改行文字。
  コメント行のものと、その前の空行と空白だけの行のもの、
  ディレクティブの中のものです。
  それだけの行のディレクティブは空行を残し、その改行文字は段を 1 つ降ろします。

行頭の空白は、その前の改行文字がもう読まれているので何も変えず、
フロントマターは、段のないヘッダーの前にあります。
数字を持つ引用符なしのタイトルは、
一番上の段が軸の文のものであるとき mermaid.js では拒否され、
この仕様は、ほかのところと同じくそれを受理します。
軸の文の行では、間にプロットの文がないときにそうなります。
後の行では、下の形が示すとおり、残った段と読んだ改行文字によります。
アクセシビリティの文はその行の残りをテキストとして取るので、
その行ではタイトルが続きません。

数字は引用符なしのタイトルのどこにあってもよく、
符号や `.` の後でもかまいません。
そこでは `Q1`、`T5`、`a-1`、`.5` が拒否されます。
引用符の中のタイトル、数字のないタイトル、タイトル以外の文は、
両方が同じに読みます。

## 差異

どの例も図全体です。

1. `;` の後のタイトル:

   ```mmd
   xychart
     x-axis A; title Q1
   ```

2. 何も挟まずに分類に続く同じ行のタイトル:

   ```mmd
   xychart
     x-axis [a] title T5
   ```

3. 軸の文とプロットの文の次の行のタイトル:

   ```mmd
   xychart
     x-axis A; line [1]
     title Q1
   ```

4. 空白文字で終わる行 `x-axis A` と、行 `title Q1`。

5. 間にプロットの文を挟む 2 行:

   ```mmd
   xychart
     x-axis A; line [1]
     line [2]
     title Q1
   ```

| 例  | mermaid.js | この仕様                             |
| --- | ---------- | ------------------------------------ |
| 1   | 拒否       | x 軸 `A` とタイトル `Q1`             |
| 2   | 拒否       | 分類 `a` とタイトル `T5`             |
| 3   | 拒否       | x 軸 `A`、line、タイトル `Q1`        |
| 4   | 拒否       | x 軸 `A` とタイトル `Q1`             |
| 5   | 拒否       | x 軸 `A`、2 つの line、タイトル `Q1` |

[fixture: xychart/div-title-digit-after-axis-semicolon]
[fixture: xychart/div-title-digit-after-axis-band-same-line]
[fixture: xychart/div-title-digit-next-line-after-axis-and-plot]
[fixture: xychart/div-title-digit-after-axis-trailing-space]
[fixture: xychart/div-title-digit-two-lines-after-axis-and-plot]

上の規則の形と、その横に、両方が同じに読む入力です。

- 軸の文の行で: `;` と分類の後、U+2028 か U+2029 の後、空でも空でなくても、
  複数の行のものでも、説明ブロックの後、2 つ目の軸の文の後、何も挟まないもの。
  一方、`x-axis A; line [1] title Q1` のように間にプロットの文があるものと、
  `x-axis A; title a.b` のように数字のないタイトルは両方が受理し、
  `line [1]; title T1` のようにプロットの文だけの後のタイトルも同じです。
  [fixture: xychart/div-title-digit-after-axis-semicolon]
  [fixture: xychart/div-title-digit-after-axis-band-same-line]
  [fixture: xychart/div-title-digit-after-axis-band-semicolon]
  [fixture: xychart/div-title-digit-after-axis-line-separator]
  [fixture: xychart/div-title-digit-after-axis-paragraph-separator]
  [fixture: xychart/div-title-digit-after-axis-and-empty-block]
  [fixture: xychart/div-title-digit-after-axis-and-description-block]
  [fixture: xychart/div-title-digit-after-multiline-description-block]
  [fixture: xychart/div-title-digit-after-two-axes-same-line]
  [fixture: xychart/db-title-digit-after-axis-and-plot-same-line]
  [fixture: xychart/db-title-dotted-word-after-axis-semicolon]
  [fixture: xychart/db-title-digit-after-plot-semicolon]
- 空白で終わる行の後: `x-axis A`、分類、範囲、引用符の中のタイトルの行の終わりの
  空白文字、タブ、U+00A0、U+2028、U+2029、空白文字とディレクティブ、
  説明ブロックと空白文字で、
  その後に空行やコメント行があるときも同じで、
  2 つの段を持つ行の後の空白だけの行もそうです。
  一方、軸の文、それにくっついたディレクティブ、説明ブロックのすぐ後の改行文字、
  空白文字の後のコメント、改行文字の後の空白だけの行
  （2 つの段では空行の後のもの）は、両方が同じに読み、
  空白の後の `%%` だけの行も、その改行文字が段を降ろすので同じです。
  [fixture: xychart/div-title-digit-after-axis-trailing-space]
  [fixture: xychart/div-title-digit-after-axis-trailing-tab]
  [fixture: xychart/div-title-digit-after-axis-trailing-nbsp]
  [fixture: xychart/div-title-digit-after-axis-trailing-line-separator]
  [fixture: xychart/div-title-digit-after-axis-trailing-paragraph-separator]
  [fixture: xychart/div-title-digit-after-whitespace-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-empty-and-whitespace-lines-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-axis-space-and-directive]
  [fixture: xychart/div-title-digit-after-description-block-trailing-space]
  [fixture: xychart/div-title-digit-after-band-trailing-space]
  [fixture: xychart/div-title-digit-after-range-trailing-space]
  [fixture: xychart/div-title-digit-after-quoted-axis-title-trailing-space]
  [fixture: xychart/div-title-digit-after-axis-trailing-space-and-empty-line]
  [fixture: xychart/div-title-digit-after-axis-trailing-space-and-comment-line]
  [fixture: xychart/db-title-digit-line-after-axis]
  [fixture: xychart/db-title-digit-after-axis-glued-directive]
  [fixture: xychart/db-title-digit-next-line-after-axis-and-description-block]
  [fixture: xychart/db-title-digit-next-line-after-multiline-description-block]
  [fixture: xychart/db-title-digit-after-axis-comment-after-space]
  [fixture: xychart/db-title-digit-after-axis-whitespace-line]
  [fixture: xychart/db-title-digit-after-trailing-space-and-bare-percent-line]
  [fixture: xychart/db-title-quoted-digit-after-axis-trailing-space]
- 軸の文の行でその後に積まれた段の後: その後のプロットの文、bar の文、
  別の x 軸、y 軸、
  分類か範囲の後、CRLF か単独の CR の後、行の終わりの `;` の後、
  アクセシビリティのタイトルのテキストの後、
  行の終わりの空白文字の後のコメント、字下げしたタイトル。
  3 つの段では、タイトルの行や空行は 1 つの段しか降ろしません。
  一方、その行で軸の文の前にあるプロットの文、最後のプロットの文の後の軸の文、
  その後のアクセシビリティのタイトル、
  1 つの段での単独の CR、字下げしたタイトル、フロントマター、
  2 つの段でのタイトルの前の空行、
  3 つの段での 2 つの空行は、両方が同じに読みます。
  [fixture: xychart/div-title-digit-next-line-after-axis-and-plot]
  [fixture: xychart/div-title-digit-next-line-after-two-axes]
  [fixture: xychart/div-title-digit-next-line-after-axis-and-y-axis]
  [fixture: xychart/div-title-digit-next-line-after-band-and-plot]
  [fixture: xychart/div-title-digit-next-line-after-y-axis-and-bar]
  [fixture: xychart/div-title-digit-after-crlf-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-lone-cr-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-semicolon-at-line-end-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-acc-title-text-after-two-axes]
  [fixture: xychart/div-title-digit-after-comment-after-space-after-axis-and-plot]
  [fixture: xychart/div-title-digit-indented-next-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-lone-cr-after-axis]
  [fixture: xychart/db-title-digit-indented-next-line-after-axis]
  [fixture: xychart/db-title-digit-frontmatter-then-axis-line]
  [fixture: xychart/div-title-digit-after-three-levels-and-title-line]
  [fixture: xychart/div-title-digit-after-three-levels-and-empty-line]
  [fixture: xychart/db-title-digit-next-line-after-plot-and-axis]
  [fixture: xychart/db-title-digit-next-line-after-axis-plot-axis]
  [fixture: xychart/db-title-digit-next-line-after-axis-and-acc-title]
  [fixture: xychart/db-title-digit-after-empty-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-three-levels-and-two-empty-lines]
  [fixture: xychart/db-title-quoted-digit-next-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-axis-plot-lines]
- 何も降ろさない改行文字を越えて: コメント行（その前に空行があるときも）、
  2 つの段を持つ行の後の `%%` だけの行、
  `accTitle:` や `accDescr:` の後や、その `:` や `{` の周りの改行文字、
  文字列の中の改行文字、ディレクティブの中の改行文字。
  一方、`%%` だけの行とその後の空行と、
  前の改行文字が単位の始まるところで読まれる、空白と `%%` の行と、
  空行を残す、それだけの行のディレクティブは、
  両方が同じに読みます。
  [fixture: xychart/div-title-digit-after-comment-line-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-empty-line-and-comment-line]
  [fixture: xychart/div-title-digit-after-bare-percent-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-bare-percent-line-and-empty-line]
  [fixture: xychart/div-title-digit-after-acc-title-line-feed-after-colon]
  [fixture: xychart/div-title-digit-after-acc-title-line-feed-before-colon]
  [fixture: xychart/div-title-digit-after-acc-descr-line-feed-after-colon]
  [fixture: xychart/div-title-digit-after-acc-descr-line-feed-before-brace]
  [fixture: xychart/div-title-digit-after-line-feed-in-string]
  [fixture: xychart/div-title-digit-after-directive-with-line-feed-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-directive-with-line-feed-after-axis]
  [fixture: xychart/db-title-digit-after-directive-line-after-axis-and-plot]
  [fixture: xychart/db-title-digit-after-directive-line-after-axis]
  [fixture: xychart/db-title-digit-after-indented-bare-percent-line]
- 後の行で: プロットの文を持つ行の後、
  同じ行のタイトルの前に数字のないタイトルを持つ行の後、
  空白文字で終わる行の後、空白文字で終わる行に続くプロットの行の後。
  一方、`title T` のように単位で終わる行は、軸の文の段が一番上ならそれを降ろし、
  軸の文の行で空白文字で終わるプロットの文は、
  次の行のタイトルをプロットの段の下に保ちます。
  [fixture: xychart/div-title-digit-two-lines-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-plot-line-after-axis-and-plot]
  [fixture: xychart/div-title-digit-second-statement-next-line-after-axis-and-plot]
  [fixture: xychart/div-title-digit-after-axis-trailing-space-and-plot-line]
  [fixture: xychart/div-title-digit-two-lines-after-axis-plot-trailing-space]
  [fixture: xychart/db-title-digit-after-line-without-plot]
  [fixture: xychart/db-title-digit-two-lines-after-axis-trailing-space]
  [fixture: xychart/db-title-digit-after-axis-plot-trailing-space]
  [fixture: xychart/db-title-digit-after-plot-trailing-space]

## 書き手にとっての意味

両方が同じに読む XY chart を書くには、数字を持つタイトルを引用符の中に置くか、
各軸の文を、その後に何も置かず、行の終わりに空白を置かずに、
それだけの行に書きます。

## mermaid.js がそう読む理由

[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L17-L73)
の字句解析器は、`x-axis` と `y-axis` で状態 `axis_data` に、
`line` と `bar` で状態 `data` に入り、どちらも今の状態の上に積みます。
一番上の状態を出るのは、
その状態の規則 `(\r?\n)` が読む改行文字のところだけです。
`;` でも、別の文が始まるところでも出ません。
ほかの文字で始まる空白の並びは規則 `\s+` が読み、その後の改行文字も読むので、
空白の後の改行文字はどの状態も出ません。
コメントの規則 `[^\}]%%[^\n]*` は改行文字の規則より先にあり、
`%%` のすぐ前の改行文字をコメントとともに読みます。
コメント行は、字句解析器がテキストを読む前に、
その改行文字と前の空行とともに除かれます
（[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)）。
`axis_data` では、
数の規則 `[+-]?(?:\d+(?:\.\d+)?|\.\d+)` が語の規則より先にあるので、
その状態で読むタイトルは最初の数字で止まり、文法はそれに続く数を拒否します。
状態 `data` は数字を語として読むので、そこで読むタイトルは受理されます。

## この仕様の規則とその理由

ある文の後で mermaid.js の字句解析器がどの状態にあるかは、
1 つの行でいくつの状態に入ったかと、
どの改行文字をある状態の規則で読むかで決まります。
つまり、字句解析器の手順の順序から来るもので、仕様が述べることではありません。
既知の差異の理由の 2 つ目です
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
代わりに、軸の文脈はその文で終わるという 1 つの規則を述べ、
この理由で mermaid.js が拒否する入力を差異とします。
受理した入力は、同じ入力で各文をそれだけの行に置き、
文を終える各行の終わりの空白を除いたものの Db を持ちます。
mermaid.js はそれを受理します。
[fixture: xychart/db-title-digit-line-after-axis]
[fixture: xychart/db-title-digit-after-axis-plot-lines]

## mermaid.js の文書と issue

- [XY chart の構文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/xyChart.md)
  は各文をそれだけの行に書き、`;` についても、
  図のタイトルの数字についても何も述べていません。
- これについての issue と pull request は見つかりませんでした
  （2026-10-15 に `xychart semicolon`、`xychart title digits`、
  `xychart axis numbers`、`xychart parse error`、`xychart lexical`、
  `XY chart parse error`、`XY chart semicolon` で検索）。

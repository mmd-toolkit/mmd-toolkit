# blank-line-after-header-or-comments

英語版:
[blank-line-after-header-or-comments.md](./blank-line-after-header-or-comments.md)

図種: mindmap、kanban。
この仕様と mermaid.js の [既知の差異](../known-divergences.ja.md) の 1 つです。

## 対象の構文

マインドマップでは、空行、空白だけの行、コメント行、図のコメントは、
ヘッダーの後のどこにあっても何も変えません
（[空行](../diagrams/mindmap.ja.md#空行) を参照）。
以下で**空行**とは、ディレクティブを除くと空か空白だけを持つ行で、
空の行、空白文字かタブの行、ディレクティブだけを持つ行です。
**図のコメント**とは、図の字句解析器が読むコメントです
（[コメント](../diagrams/mindmap.ja.md#コメント) を参照）。
`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
ヘッダーの後、形の後、icon の後の、行区間の残りを持つ `%%` です。
`%%` の後にテキストを持つコメント行は、
字句解析器がテキストを読む前にその改行ごと取り除かれ、
図のコメントではありません。

以下で**文**とは、ノードの行、icon の行、class の行です。
ヘッダーか文と、次の文との間には、
図のコメント、空行、コメント行を置けます。
そこにある図のコメントを、ヘッダーの行か前の文の行にあるものも含めて数えます。
mermaid.js は次の場合に入力を拒否し、この仕様は受理します。

1. ヘッダーの後、最初のノードの前で、数が 0 を含む偶数で、
   最後のコメントの後に空行が続くとき。
   コメントがなければ、ヘッダーの行が空白で終わるか、その後に空行が続くとき。
2. ヘッダーの後で、数が奇数で、
   最初のノードが最後のコメントにその行で続くとき。
   コメントを終える U+2028 か U+2029 の後です。
3. 2 つの文の間で、数が奇数で、
   次の文の前、最後のコメントの後に空行が続くとき。
4. 2 つの文の間で、数が 0 でない偶数で、
   次の文が最後のコメントにその行で、U+2028 か U+2029 の後に続くとき。

図のコメントを終える U+2028 か U+2029 はその行を終えるので、
その後から改行までの空白は空行です。
コメントの前の空行は数に入らず、何も変えません。
それ以外では、どちらも空行とコメントを何もないものとして読みます。
コメントのない 2 つの文の間の空行、
ヘッダーの後の奇数の数とそれに続く空行、
2 つの文の間の偶数の数とそれに続く空行、
テキストの終わりの空行です。

kanban も同じ空行の規則と上の 4 つの場合に従います。
ノード、icon、class の行が文です。
データ接尾部はノードの行に属します。
最初のノードの前のヘッダー末尾の空白と空行は受理します。
[fixture: kanban/gram-grid-comment-line-header-line]
[fixture: kanban/gram-grid-directive-line-header-line]
[fixture: kanban/gram-grid-lf-header-line]
[fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-bom-trailing]
[fixture: kanban/header-crlf-trailing]
[fixture: kanban/header-ff-trailing]
[fixture: kanban/header-ideographic-trailing]
[fixture: kanban/header-ls-trailing]
[fixture: kanban/header-nbsp-trailing]
[fixture: kanban/header-ps-trailing]
[fixture: kanban/header-tab-trailing]
[fixture: kanban/header-vt-trailing]
[fixture: kanban/lex-bom-whitespace-first]
[fixture: kanban/lex-cr-whitespace-first]
[fixture: kanban/lex-crlf-whitespace-first]
[fixture: kanban/lex-ideographic-whitespace-first]
[fixture: kanban/lex-ls-whitespace-first]
[fixture: kanban/lex-nbsp-whitespace-first]
[fixture: kanban/lex-ps-whitespace-first]
[fixture: kanban/lex-tab-whitespace-first]
[fixture: kanban/div-header-space-node]
ノードや装飾の前のコメントとその後の空行は受理します。
[fixture: kanban/div-header-comments-blank]
[fixture: kanban/div-between-comment-blank]
[fixture: kanban/div-comment-blank-before-icon]
[fixture: kanban/div-comment-blank-before-class]
次の文の前で U+2028 と U+2029 に終わるコメントは受理します。
mermaid.js はこれらの入力を拒否します
（[空行](../diagrams/kanban.ja.md#空行) を参照）。
[fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/div-between-real-comments-ls-node]
[fixture: kanban/div-between-real-comments-ps-node]

kanban ではヘッダー後の 1 つの図のコメントは両者で受理します。
[fixture: kanban/header-header-comment-blank]
ノード間の 2 つの図のコメントは両者で受理します。
[fixture: kanban/gram-between-comments-blank]
icon 前の空行は両者で受理します。
[fixture: kanban/gram-blank-before-icon]
末尾の空行は両者で受理します。
[fixture: kanban/gram-shallower-then-empty]

## 差異

どの例も、それぞれが図全体です。
空白の行は、整形が行末の空白を消すので、コードブロックに書けません。
そうした入力は言葉で述べます。

1. ヘッダーと最初のノードの間の空の行:

   ```mmd
   mindmap

     root
   ```

2. ヘッダーの後の、`%%` だけの行 2 つと空の行:

   ```mmd
   mindmap
   %%
   %%

   root
   ```

3. 2 つのノードの間の、`%%` だけの行と空の行:

   ```mmd
   mindmap
     root
       a
   %%

       b
   ```

4. 形の後のコメントと、次のノードの前の空の行:

   ```mmd
   mindmap
     root
       a[x] %% c

       b
   ```

5. 空白文字 2 つ、改行、行 `root` が続くヘッダー。

| 例  | mermaid.js | この仕様           |
| --- | ---------- | ------------------ |
| 1   | 拒否       | 根                 |
| 2   | 拒否       | 根                 |
| 3   | 拒否       | 子 a と b を持つ根 |
| 4   | 拒否       | 子 a と b を持つ根 |
| 5   | 拒否       | 根                 |

[fixture: mindmap/db-blank-line-after-header] [fixture:
mindmap/div-header-two-comments-then-blank] [fixture:
mindmap/div-comment-then-blank-between-nodes] [fixture:
mindmap/div-shape-comment-then-blank] [fixture:
mindmap/div-header-trailing-spaces-then-node]

上の一覧の場合と、その隣の、どちらも同じに読む入力です。

- 場合 1:
  空白の行、タブの行、ディレクティブの行、
  ヘッダーの行の終わりの空白文字とディレクティブ、
  ヘッダーの行と次の行の 2 つの図のコメント、
  改行ごと取り除かれるコメント行を、空の行の前に置いたもの。
  一方、1 つか 3 つのコメントと空の行、コメントの前の空の行、
  コメント行だけは、どちらも受理します。
  [fixture: mindmap/db-whitespace-line-after-header] [fixture:
  mindmap/div-tab-line-after-header] [fixture:
  mindmap/db-directive-between-header-and-first-node] [fixture:
  mindmap/div-header-space-directive-then-node] [fixture:
  mindmap/div-header-line-comment-comment-then-blank] [fixture:
  mindmap/div-comment-line-then-blank-after-header] [fixture:
  mindmap/gram-header-comment-then-blank] [fixture:
  mindmap/gram-header-three-comments-then-blank] [fixture:
  mindmap/gram-header-line-comment-then-blank] [fixture:
  mindmap/gram-header-blank-then-comment] [fixture:
  mindmap/db-comment-line-after-header]
- 場合 2: `mindmap %% c`、U+2028、`root`。
  一方、そうしたノードの前の 2 つのコメントは、どちらも受理します。
  [fixture:
  mindmap/div-header-comment-line-separator-node] [fixture:
  mindmap/gram-header-two-comments-line-separator-node]
- 場合 3:
  3 つのコメント、icon の後のコメント、`%%{ }%%` の行、
  class の行の後のコメント、U+2028 と改行が続くコメントを、
  空行の前に置いたもの。
  また、コメントの後の、icon の行か class の行の前の空行。
  一方、2 つのコメント、コメント行、2 つのコメントの間の空行は、
  どちらも受理します。
  [fixture:
  mindmap/div-three-comments-then-blank-between-nodes] [fixture:
  mindmap/div-icon-comment-then-blank] [fixture:
  mindmap/div-percent-brace-then-blank-between-nodes] [fixture:
  mindmap/div-class-then-comment-then-blank] [fixture:
  mindmap/div-shape-comment-line-separator-then-blank] [fixture:
  mindmap/div-comment-then-blank-then-icon] [fixture:
  mindmap/div-comment-then-blank-then-class] [fixture:
  mindmap/gram-two-comments-then-blank-between-nodes] [fixture:
  mindmap/gram-shape-comment-comment-then-blank] [fixture:
  mindmap/gram-comment-line-then-blank-between-nodes] [fixture:
  mindmap/gram-comment-blank-comment-blank-between-nodes] [fixture:
  mindmap/db-blank-line-between-nodes] [fixture:
  mindmap/gram-blank-then-comment-between-nodes] [fixture:
  mindmap/gram-comment-then-blank-at-end] [fixture:
  mindmap/gram-blank-then-icon]
- 場合 4: 形の後のコメント、`%%{ }%%` の行、U+2028、次のノード。
  一方、そうしたノードの前の 1 つのコメントは、どちらも受理します。
  [fixture:
  mindmap/div-two-comments-line-separator-between-nodes] [fixture:
  mindmap/lex-comment-ends-at-line-separator]

差異は一方向です。
この仕様は mermaid.js が拒否する入力を受理し、
ここで mermaid.js が受理する入力を拒否することはありません。

## 書き手にとっての意味

どちらも同じに読むマインドマップを書くには、
ヘッダーと最初のノードの間に空の行や空白の行を置かず、
ヘッダーの行の終わりに空白を残さず、
`%%` だけの行の後に空の行を続けないでください。
`%%` の後にテキストを持つコメントは、どこに置いてもかまいません。

## mermaid.js がそう読む理由

[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L21-L30)
の字句解析器は、`\s*%%.*`、つまり前の空白と改行を含むコメントを
1 つのトークンとして、
`[\s]+[\n]`、つまり最後の改行までの空白の並びを、
同じトークン `SPACELINE` として読みます。
その文法
（[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L82-L108)）
は `SPACELINE` を、それだけの文として、または前の文の終わりとして取り、
終わりの後には改行しか続けられません。
そのため、文の後のトークンは、終わりと文として交互に組になり、
文として残った `SPACELINE` は次のノードの前に終わりを要しますが、
次の行のノードはそれを与えません。
ヘッダーの後には文が続くので、そこでは組み方が逆から始まります。

kanban の字句規則と文法も空白と文を同じように組にします
（[`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison#L48-L138)
を参照）。
その組分けは木が持つものを変えません。
同じ直接の規則を適用します。
[fixture: kanban/gram-grid-comment-line-header-line]
[fixture: kanban/gram-grid-directive-line-header-line]
[fixture: kanban/gram-grid-lf-header-line]
[fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-bom-trailing]
[fixture: kanban/header-crlf-trailing]
[fixture: kanban/header-ff-trailing]
[fixture: kanban/header-ideographic-trailing]
[fixture: kanban/header-ls-trailing]
[fixture: kanban/header-nbsp-trailing]
[fixture: kanban/header-ps-trailing]
[fixture: kanban/header-tab-trailing]
[fixture: kanban/header-vt-trailing]
[fixture: kanban/lex-bom-whitespace-first]
[fixture: kanban/lex-cr-whitespace-first]
[fixture: kanban/lex-crlf-whitespace-first]
[fixture: kanban/lex-ideographic-whitespace-first]
[fixture: kanban/lex-ls-whitespace-first]
[fixture: kanban/lex-nbsp-whitespace-first]
[fixture: kanban/lex-ps-whitespace-first]
[fixture: kanban/lex-tab-whitespace-first]
[fixture: kanban/div-header-space-node]
[fixture: kanban/div-header-comments-blank]
[fixture: kanban/div-between-comment-blank]
[fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/div-comment-blank-before-icon]
[fixture: kanban/div-comment-blank-before-class]
[fixture: kanban/div-between-real-comments-ls-node]
[fixture: kanban/div-between-real-comments-ps-node]

## この仕様の規則とその理由

空行とコメントは、木が保つものを何も持ちません。
木はそれらがあってもなくても同じです。
mermaid.js がそれを受理するかどうかは、
その字句解析器が空白をどうトークンに切り、その文法がそれをどう組にするか、
つまりその字句解析器の段階の順番しだいで、仕様が述べることではありません。
既知の差異の理由の 2 つ目です
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
代わりに、空行とコメントは何も変えないという 1 つの規則を述べ、
mermaid.js がこの理由で拒否する入力を差異とします。
受理される入力は、同じ入力を次のように変えた入力の Db を持ちます。
mermaid.js はその入力を受理し、どのノードの字下げも変わりません。
空行を、そこにあったディレクティブは残して除き、
ヘッダーの行の終わりの空白を除きます。
図のコメントを終える U+2028 か U+2029 は、
改行までその後に空白しかないときはその空白ごと除き、
その行で文が続くときはその前に改行を入れます。
[fixture: mindmap/db-directive-between-header-and-first-node] [fixture:
mindmap/div-header-trailing-spaces-then-node] [fixture:
mindmap/div-shape-comment-line-separator-then-blank] [fixture:
mindmap/div-two-comments-line-separator-between-nodes]

## mermaid.js の文書と issue

- [マインドマップの構文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md)
  は、マインドマップの行の間の空の行やコメントについて何も述べていません。
- それについての issue と pull request は見つかりませんでした
  （2026-10-15 に `mindmap empty line`、`mindmap blank line`、
  `mindmap comment`、`mindmap newline`、
  `mindmap parse`、`mindmap error` で検索）。
- [kanban の構文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/kanban.md)
  は、kanban の図の行の間の空の行やコメントについて何も述べず、
  字下げが大切だと述べるだけです。
- それについての issue と pull request は見つかりませんでした
  （2026-10-21 に `kanban comment`、`kanban blank line`、`kanban empty line`、
  `kanban newline`、`kanban parse`、`kanban error`、`kanban` で検索）。
  見つかった issue と pull request は、`style` の文（#8118）、
  `:::` のクラス（#8119）、`accTitle`（#8120）など、別の件についてのものです。

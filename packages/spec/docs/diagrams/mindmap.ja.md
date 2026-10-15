# Mindmap

英語版: [mindmap.md](./mindmap.md)

mermaid.js の正となるソース：

- [`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison)
- [`mindmapDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts)
- [`mindmap/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap)
  の中のテスト（`*.spec.ts`、`*.test.ts`）

この文書は、図種 `mindmap`、マインドマップを扱います。
木のノードは [ast/mindmap.ja.md](../ast/mindmap.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 4 がこの文法を選びます。
テキストが、空白の後、ちょうどこの大文字小文字の `mindmap` で始まるときです
（[`detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/detector.ts#L8-L10)）。
`MINDMAP` と `Mindmap` はどの検出器にも合いません。
ヘッダーの前の空行と空白だけの行は何も変えません。
[fixture: mindmap/db-header-only]
[fixture: mindmap/db-header-indented] [fixture: mindmap/header-upper-case]
[fixture: mindmap/header-capitalized] [fixture:
mindmap/header-after-empty-lines] [fixture:
mindmap/header-after-whitespace-line]

その後、字句解析器がヘッダー、つまりキーワード `mindmap` を、
大文字小文字を区別せず、語の文字が続かない形で読みます
（[文の文脈](#文の文脈) を参照）。
そのため `mindmapx` は、ノードのテキストなので、検出されて拒否されます。
一方、`mindmap-x` はヘッダーとその行の根 `-x` で、
`mindmap(x)` はヘッダーと、根である形です。
最初のノードはヘッダーの行に置けます。
空白の後に置けて、形か語の文字以外の文字で始まるならヘッダーの直後にも置けます。
[fixture: mindmap/header-word-suffix] [fixture:
mindmap/header-dash-suffix] [fixture: mindmap/header-shape-glued] [fixture:
mindmap/db-first-node-on-header-line] [fixture:
mindmap/db-first-node-after-header-tab]

ヘッダーで図のテキストを終えることはできません。
字句解析器が読む、ディレクティブのないテキストで、
ヘッダーの後に、字句解析器が最後の文字の後に読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）しかないときは、
入力は拒否されます。
そのため、後ろに何もない `mindmap`、`  mindmap`、`mindmap%%{init: {}}%%` と、
フロントマター、ディレクティブの行、コメント行、`%%` だけの行の後の、
テキストの終わりの `mindmap` は拒否されます。
ヘッダーの後には、ほかの何があっても足ります。
改行、単独の CR、空白、U+2028、コメント、根です。
改行が続く `mindmap`、`mindmap `、`mindmap %% c`、`mindmap%% c`、
`mindmap %%{init: {}}%%`、
`mindmap`・改行・コメント行かディレクティブの行は、
どれもテキストの終わりにあるとき、ノードのない図です。
[fixture: mindmap/db-header-without-line-feed] [fixture:
mindmap/header-indented-at-end] [fixture: mindmap/header-directive-at-end]
[fixture: mindmap/header-after-frontmatter-at-end] [fixture:
mindmap/header-after-directive-line-at-end]
[fixture: mindmap/header-after-comment-line-at-end] [fixture:
mindmap/header-after-bare-percent-line-at-end] [fixture: mindmap/db-header-only]
[fixture: mindmap/header-cr-at-end] [fixture: mindmap/header-space-at-end]
[fixture: mindmap/db-header-only-trailing-spaces] [fixture:
mindmap/header-line-separator-at-end] [fixture: mindmap/header-comment-at-end]
[fixture: mindmap/header-glued-comment-at-end] [fixture:
mindmap/header-space-directive-at-end] [fixture:
mindmap/header-comment-line-at-end] [fixture:
mindmap/header-directive-line-at-end] [fixture: mindmap/header-root-at-end]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行で、図のコメントです
（[図種の検出](../common.ja.md#図種の検出) を参照）。
mermaid.js も、その字句解析器がそれをコメントとして読むので受理します。
ヘッダーの前の行のコメント行とディレクティブ、
ヘッダーの直後のディレクティブ、フロントマターは何も変えません。
[fixture: mindmap/header-after-bare-percent-line] [fixture:
mindmap/header-after-empty-braces-line] [fixture:
mindmap/db-comment-before-header] [fixture: mindmap/header-after-directive-line]
[fixture: mindmap/header-then-directive-same-line] [fixture:
mindmap/db-frontmatter-before-header]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を
[変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして、
コメント領域と行の規則が無視する `;` はないものとして読みます。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は
図のテキストの一部です。
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 である、
この図自身の単位の規則を述べます。

この図の mermaid.js の字句解析器は、
文字の大文字小文字を区別せずに比べます（[表記](../common.ja.md#表記) を参照）。
`::ICON(x)` は icon で、`MindMap` はキーワードです。
以下で**キーワード**とは、大文字小文字を区別せずに照合する語で、
語の文字が続かないものです。
[fixture: mindmap/db-icon-case-insensitive]
[fixture: mindmap/lex-keyword-other-case-as-node]

### 単位と文脈

字句解析器は図のテキストを**単位**に分けます。
文法は単位の上に書きます。
各単位は、文法が使う名前と、**テキスト**、
つまり変換後の形で読んだ文字を持ちます。

字句解析器は**文脈**のスタックを持ちます。
最初は文の文脈にいます。
規則は文脈に入ること（スタックの一番上に積む）も、
現在の文脈を出ること（その下の文脈に戻る）もできます。
各位置で、字句解析器は現在の文脈の規則のうち、そこで合う最初のものを適用します。
規則が読んだ空白は、規則が別に言わないかぎり、どの単位にも属しません。
現在の文脈のどの規則も合わないときは入力を拒否します。
以下の一覧ではこれを繰り返しません。

テキストは文の文脈と class の文脈でだけ終われます。
形、文字列、markdown 文字列、icon は閉じていなければなりません。
行 `  b` が続く `a[x`、`a["x]`、テキストの終わりの `::icon(x` は拒否されます。
CRLF と単独の CR は改行です。
[fixture: mindmap/lex-shape-unclosed] [fixture:
mindmap/lex-string-unclosed] [fixture: mindmap/lex-icon-unclosed] [fixture:
mindmap/db-crlf-line-ends] [fixture: mindmap/db-lone-cr-line-ends]

**空白と行。** 文の文脈では、改行以外の空白は単位の間にあります。
改行は `newline` の単位で、
U+2028 か U+2029 が終える図のコメントの終わりもそうです
（[コメント](#コメント) を参照）。
空白だけの行と空行は、何もないものとして読まれます
（[空行](#空行) を参照）。
ノードの**字下げ**は、その行でノードの前にある空白文字で、
ディレクティブを除いたテキストで数えます。
改行以外の空白文字はどれも字下げの 1 文字で、
タブ、U+3000、U+00A0、U+2028、垂直タブ、U+FEFF も含みます。
[fixture:
mindmap/db-indent-tab-levels] [fixture:
mindmap/db-indent-tab-counts-as-one-char] [fixture:
mindmap/db-indent-fullwidth-space] [fixture: mindmap/db-indent-no-break-space]
[fixture: mindmap/db-indent-mixed-whitespace-kinds] [fixture:
mindmap/lex-indent-line-separator] [fixture: mindmap/lex-indent-vertical-tab]
[fixture: mindmap/lex-indent-byte-order-mark] [fixture:
mindmap/lex-indent-around-directive]

**ノードのテキスト。** 文の文脈では、
`(`、`[`、`)`、`{`、`}`、改行以外の、できるだけ多くの 1 つ以上の文字が
`node-text` の単位です（[文の文脈](#文の文脈) の規則 8）。
そのテキストは終わりの空白を保ち、mermaid.js もそれをノードに保ちます。
空白文字 3 つが続く `root` はノード `root   ` です。
最初の文字の後の `]`、`:`、`#`、`"`、`%%`、`:::`、U+2028 はその文字です。
`a]b`、`a: b # c`、`a"b`、`root %% c`、`a:::b`、
`a`、U+2028、`b` はノードのテキストで、
ほかのどの規則も読まない `::x` と `-x` もそうです。
単独の `{`、`}`、ノードのテキストの後の `}}` は、どの規則も読みません。
`a{b`、`a}b`、`a}}` は拒否されます。
エンティティは 1 つのプレースホルダーです
（[エンティティ](../common.ja.md#エンティティ) を参照）。
[fixture:
mindmap/db-node-trailing-whitespace] [fixture:
mindmap/lex-node-text-closing-bracket] [fixture:
mindmap/db-text-with-colon-and-hash] [fixture: mindmap/db-text-with-quote]
[fixture: mindmap/db-comment-after-node-text] [fixture:
mindmap/db-class-same-line-as-node] [fixture:
mindmap/lex-node-text-line-separator] [fixture:
mindmap/lex-node-text-double-colon] [fixture: mindmap/lex-node-text-dash-start]
[fixture: mindmap/lex-node-text-open-brace] [fixture:
mindmap/lex-node-text-close-brace] [fixture:
mindmap/lex-node-text-double-close-brace] [fixture:
mindmap/entity-placeholder-in-node-text] [fixture:
mindmap/entity-placeholder-numeric]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むとおりに読みます。
そのうえで
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が単位に当てはまります。
テキストの単位か文字列の単位の中のディレクティブは mermaid.js の読みを保ち、
それ以外の単位の中のディレクティブは入力を拒否させます。
**テキストの単位**は、
`node-text`、`shape-text`、`icon-text`、`class-text` です。
**文字列の単位**は、`string` と `markdown-string` です。
ほかの単位、つまりキーワード `mindmap`、`::icon(`、`:::`、
形の開きと閉じは、テキストの単位ではありません。

- `a%%{init: {}}%%b` はノード `ab`、`::icon(a%%{init: {}}%%b)` は icon `ab`、
  `:::a%%{init: {}}%%b` は class `ab` で、
  `a[x%%{init: {}}%%y]` と `a["x%%{init: {}}%%y"]` はテキスト `xy` を、
  ``r["`a%%{init: {}}%%b`"]`` はテキスト `ab` を持ちます。
  mermaid.js と同じです。
  [fixture:
  mindmap/lex-directive-in-node-text] [fixture: mindmap/lex-directive-in-icon]
  [fixture: mindmap/lex-directive-in-class] [fixture:
  mindmap/lex-directive-in-shape-text] [fixture:
  mindmap/lex-directive-in-string] [fixture:
  mindmap/lex-directive-in-markdown-string]
- 2 つの単位の間のディレクティブは許されます。
  `a((%%{init: {}}%%x))` は円で、
  ノードのテキストの終わりのディレクティブはその一部ではありません。
  [fixture:
  mindmap/lex-directive-after-opener] [fixture:
  mindmap/db-directive-after-node-text]
- `a(%%{init: {}}%%(x))`、`a)%%{init: {}}%%)x((`、`a{%%{init: {}}%%{x}}`、
  `-%%{init: {}}%%)x(-`、`a((x)%%{init: {}}%%)`、`::ic%%{init: {}}%%on(x)`、
  `::%%{init: {}}%%:c`、ヘッダーとしての `mind%%{init: {}}%%map` では、
  ディレクティブは開き、閉じ、キーワードの中にあります。
  入力は拒否され、mermaid.js は 2 つの部分を 1 つとして読んで受理します
  （[既知の差異](#既知の差異) を参照）。
  [fixture:
  mindmap/div-directive-in-opener] [fixture:
  mindmap/div-directive-in-bang-opener] [fixture:
  mindmap/div-directive-in-hexagon-opener] [fixture:
  mindmap/div-directive-in-dash-opener] [fixture:
  mindmap/div-directive-in-closer] [fixture:
  mindmap/div-directive-in-icon-keyword] [fixture:
  mindmap/div-directive-in-class-marker] [fixture:
  mindmap/div-directive-in-header-keyword]

**単位の間のトリビア。** コメント行と、それだけの行のディレクティブは、
字句解析器がテキストを読む前に取り除かれます
（[コメント行](../common.ja.md#コメント行) を参照）。
コメント行はその改行ごと取り除かれ、ディレクティブはその行を空にします。
閉じていないディレクティブはテキストの残りを取ります
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）。
`  a`、行 `%%{x`、行 `  b` はノード b を持ちません。
`style` の規則に合う行
（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行)
を参照）では、最後の `;` が無視され、
字句解析器はどのテキストの単位と文字列の単位の中でもそれを読み通します。
`style:#x;y` はノード `style:#xy` で、
`a[style:#x;y]` と `a["style:#x;y"]` はテキスト `style:#xy` を持ち、
`::icon(style:#x;y)` と `:::style:#x;y` は
icon と class `style:#xy` を持ちます。
無視されるのはその行の最後の `;` だけなので、
2 つあると最初のものがエンティティを終えることがあります。
`style:#x;y;z` は、`style:` の後に `#x;` のプレースホルダーと `yz` が続く
ノードのテキストです。
開きか閉じの中の無視される `;` は入力を拒否させ、
mermaid.js は 2 つの部分を 1 つとして読みます。
`style:#x{;{b}}` は mermaid.js では六角形です
（[既知の差異](#既知の差異) を参照）。
[fixture:
mindmap/db-comment-line-between-nodes] [fixture:
mindmap/db-comment-line-indented-deeper] [fixture:
mindmap/db-directive-line-between-nodes] [fixture:
mindmap/db-directive-line-indented] [fixture:
mindmap/tokens-unclosed-directive-takes-rest] [fixture:
mindmap/tokens-ignored-semicolon-in-node-text] [fixture:
mindmap/tokens-ignored-semicolon-in-shape-text] [fixture:
mindmap/tokens-ignored-semicolon-in-string] [fixture:
mindmap/tokens-ignored-semicolon-in-icon] [fixture:
mindmap/tokens-ignored-semicolon-in-class] [fixture:
mindmap/tokens-ignored-semicolon-last-of-two] [fixture:
mindmap/div-ignored-semicolon-in-opener]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. `%%` と、その行区間の終わりまでの文字。図のコメントです
   （[コメント](#コメント) を参照）。
   [fixture: mindmap/lex-bare-percent-line-between-nodes]
2. キーワード `mindmap`。`header` の単位です。
   [fixture: mindmap/db-header-only]
3. `:::`。`:::` の単位で、class の文脈に入ります。
   [fixture: mindmap/db-class-line]
4. 大文字小文字を区別せずに比べる `::icon(`。
   `::icon(` の単位で、icon の文脈に入ります。
   [fixture: mindmap/db-icon-line]
5. 1 つ以上の改行。`newline` の単位です。
   [fixture: mindmap/db-first-node-unindented]
6. 開き、つまり `-)`、`(-`、`))`、`)`、`((`、`{{`、`(`、`[` を
   この順に試したもの。
   `opener` の単位で、形の文脈に入ります。
   [fixture: mindmap/db-shape-rect]
7. 改行以外の 1 つ以上の空白文字。何もありません。
   [fixture: mindmap/db-indent-root-offset]
8. ノードのテキスト（[ノードのテキスト](#単位と文脈) を参照）。
   `node-text` の単位です。
   [fixture: mindmap/db-first-node-unindented]

この順序から、次のことが言えます。

- キーワードは単位が始まるところではどこでもキーワードなので、
  ノードのテキストはそれで始まりません。
  ノード `mindmap`、`MindMap(x)`、`mindmap stuff` は拒否され、
  `mindmapx` と `a mindmap` はノードのテキストです。
  [fixture:
  mindmap/lex-keyword-as-node] [fixture: mindmap/lex-keyword-other-case-as-node]
  [fixture: mindmap/lex-keyword-then-words] [fixture:
  mindmap/lex-keyword-prefix-as-node] [fixture:
  mindmap/lex-keyword-inside-node-text]
- ノードのテキストは最初の `(`、`[`、`)`、`{`、`}` まで続くので、
  その後の開きは形を始め、
  `-)` は単位が始まるところでだけ形を始めます。
  `r-)text(-` はノードのテキスト `r-` と形 `)text(-` で、
  `-)x(-` は形だけです。
  [fixture: mindmap/db-shape-explode-dash-form] [fixture:
  mindmap/gram-shape-dash-opener-without-id]
- `::icon(` と `:::` は、単位が始まるところでだけ icon か class の行を始めます。
  `root ::icon(x)` はノードのテキスト `root ::icon` と形 `(x)` です。
  [fixture:
  mindmap/db-icon-same-line]

### 形の文脈

形の文脈には開きで入ります。
この文脈は label と閉じを読みます。

1. `` "` ``、`` ` `` と `"` 以外の 0 個以上の文字（改行を含む）、`` `" ``。
   `markdown-string` の単位で、
   間に何もないときは `empty-markdown-string` の単位です。
   `` "` `` の後に、ほかのもの、つまり `"`、`"` が続かない `` ` ``、
   テキストの終わりが先に来るときは、入力は拒否され、規則 2 は試しません。
   ``a["`x"]``、``a["`x" ]``、``a["`"]``、
   ``a["`x`y"]``、```a["`x``"]```、
   テキストの終わりの ``a["`x`` は拒否されます。
   [fixture: mindmap/db-shape-markdown-string] [fixture:
   mindmap/lex-markdown-string-quote] [fixture:
   mindmap/lex-markdown-string-quote-then-space] [fixture:
   mindmap/lex-markdown-string-backquote-only] [fixture:
   mindmap/lex-markdown-string-then-text] [fixture:
   mindmap/lex-markdown-string-two-backquotes] [fixture:
   mindmap/lex-markdown-string-unclosed]
2. `"`、`"` 以外の 0 個以上の文字（改行を含む）、`"`。
   `string` の単位で、間に何もないときは `empty-string` の単位です。
   [fixture: mindmap/db-shape-string]
3. 閉じ、つまり `))`、`)`、`]`、`}}`、`(-`、`-)`、`((`、`(` を
   この順に試したもの。
   `closer` の単位で、形の文脈を出ます。
   [fixture: mindmap/db-shape-rect]
4. `)`、`]`、`(`、`}` 以外の、改行を含む、できるだけ多くの 1 つ以上の文字。
   `shape-text` の単位です。
   [fixture: mindmap/gram-shape-text-line-feed]

`}}` を始めない `}` はどの規則も読まないので、
`a[x}y]`、`a[}]`、`a{{x}y}}` は拒否されます。
`{`、`[`、最初の文字の後の `"`、`%%` は形のテキストの文字で、
形のテキストは行をまたげます。
`a[x{y]`、`a[x[y]`、`a[x"y]`、`a[%% c]`、
`a[x`、改行、`y]` は形です。
`"` が文字列なのは単位が始まるところ、つまり開きの直後だけです。
`a[ "x" ]` はテキスト `"x"` を持ちます。
規則 4 は `)` の前の `-` を読むので、
閉じ `-)` は文字列か markdown 文字列の後にだけ続きます。
[fixture:
mindmap/gram-shape-text-close-brace] [fixture:
mindmap/gram-shape-text-close-brace-first] [fixture:
mindmap/gram-shape-text-close-brace-in-hexagon] [fixture:
mindmap/gram-shape-text-open-brace] [fixture:
mindmap/gram-shape-text-open-bracket] [fixture: mindmap/gram-shape-text-quote]
[fixture: mindmap/lex-percent-in-shape-text] [fixture:
mindmap/gram-shape-text-line-feed] [fixture:
mindmap/gram-shape-text-quoted-with-space] [fixture:
mindmap/gram-shape-dash-in-text-before-closer] [fixture:
mindmap/gram-shape-dash-closer-after-string]

### icon と class の文脈

icon の文脈では、`)` が文脈を出て、
`)` 以外の、改行を含む 1 つ以上の文字が `icon-text` の単位です。
`::icon(x`、改行、`  a)` は、icon `x`、改行、空白文字 2 つ、`a` を持ちます。
class の文脈では、改行、U+2028、U+2029 以外の 1 つ以上の文字が
`class-text` の単位で、文脈を出ます。
改行、U+2028、U+2029 は、単位なしで文脈を出ます。
そのため class の行はその行区間の残りを取ります。
`:::c ::icon(x)` は class `c ::icon(x)` を持ち、
`:::a`、U+2028、`b` は 1 つの行の class とノードのテキストで、拒否されます。
[fixture:
mindmap/gram-icon-line-feed] [fixture: mindmap/db-icon-line] [fixture:
mindmap/gram-class-takes-rest-of-line] [fixture:
mindmap/lex-class-ends-at-line-separator] [fixture:
mindmap/lex-class-line-separator-then-line-feed]

### コメント

字句解析器は単位のほかに**図のコメント**を読みます。
その行区間の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
これは [common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器がテキストを読む前に取り除かれます。
`%%` だけの行と `%%{ }%%` の行は、コメント行ではなく図のコメントです。
[fixture:
mindmap/lex-bare-percent-line-between-nodes] [fixture:
mindmap/lex-percent-brace-line-between-nodes]

図のコメントは、文の文脈で単位が始まるところの `%%` で始まります（規則 1）。
それだけの行、ヘッダーの後、形の後、icon の後で、
前に空白があってもなくてもかまいません。
コメントはその行区間の終わりまで続きます
（[表記](../common.ja.md#表記) を参照）。
改行、U+2028、U+2029 がそれを終え、
U+2028 か U+2029 の後のテキストは新しい行として読まれ、
その字下げはその文字から始まります。
`a[x] %% c`、U+2028、`y` は、ノード `a[x]` と、
1 文字の字下げのノード `y` です。
ノードのテキスト、形のテキスト、class の中では、`%%` はテキストの文字です。
図のコメントの**印**は `%%` で、その値はその後のテキストです。
[fixture:
mindmap/lex-comment-after-header] [fixture:
mindmap/lex-comment-after-header-glued] [fixture:
mindmap/lex-comment-after-shape] [fixture:
mindmap/lex-comment-after-shape-glued] [fixture: mindmap/lex-comment-after-icon]
[fixture: mindmap/lex-comment-ends-at-line-separator] [fixture:
mindmap/db-comment-after-node-text] [fixture: mindmap/lex-percent-in-shape-text]
[fixture: mindmap/lex-percent-in-class]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
単位の名前はその名前の 1 つの単位を表し、
二重引用符の中のテキストは、そのテキストが名付ける単位を表します。
文法は
[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L66-L127)
の文法を言い直したものです。
ただし [空行](#空行) が別に言うところは除きます。

以下の各規則は、[ast/mindmap.ja.md](../ast/mindmap.ja.md)
で定める木のノードを作ります。

| 規則                                   | ノード                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `diagram`                              | MindmapDiagram                                                                                        |
| `node`                                 | MindmapNode。木の中の位置は [字下げと親](#字下げと親) から決まる                                      |
| `shape`                                | MindmapShape                                                                                          |
| `shape-label`                          | MindmapLabel。kind は `shape-text`、`string`、`markdown-string` に対して `text`、`string`、`markdown` |
| `icon-line`                            | MindmapIconStatement。最後に足されたノードの飾り                                                      |
| `class-line`                           | MindmapClassStatement。最後に足されたノードの飾り                                                     |
| `node-text`、`icon-text`、`class-text` | MindmapLiteral                                                                                        |

### 図と行

```text
diagram    = "header" node? ( newline line? )*
line       = node | icon-line | class-line
node       = node-text shape? | shape
shape      = opener shape-label closer
shape-label = shape-text | string | markdown-string
icon-line  = "::icon(" icon-text ")"
class-line = ":::" class-text
```

ノード、icon、class は、それぞれそれだけの行に置きます。
形か icon の後には、その行で空白とコメントしか続けられず、
ノードのテキストはその行の終わりまで続きます。
`a["x"]y`、`a[x] y`、`a[x]]`、`a[x] :::c`、`::icon(x) y`、
`::icon(x)::icon(y)`、`::icon(x):::c` は拒否され、
形の後の空白は何も変えません。
最初のノードはヘッダーの行に置けて、
ヘッダーで図のテキストを終えることはできません（[検出](#検出) を参照）。
[fixture: mindmap/gram-shape-then-text-glued]
[fixture: mindmap/db-shape-text-after-end] [fixture:
mindmap/gram-shape-then-bracket] [fixture: mindmap/gram-shape-then-class]
[fixture: mindmap/gram-icon-then-text] [fixture: mindmap/gram-icon-then-icon]
[fixture: mindmap/gram-icon-then-class] [fixture:
mindmap/gram-shape-trailing-whitespace]

### 字下げと親

最初のノードは、字下げにかかわらず根です。
ほかのノードはどれも、
その前にある最も近い、字下げがそれより小さいノードの子です。
そのため、前のノードと同じだけ字下げしたノードは、
その下のノードの後に来る、その兄弟で、
ノードは親より何文字多く字下げしてもかまいません。
`root`、`    a`、`  b`、`    c` の 4 行では、
a と b が根の子で、c は b の子です。
タブは 1 文字と数えるので、行 `\ta` の後の `  b` は a の子です。
最初のノードではなく、根と同じかそれより浅いために
そのようなノードを持たないノードは、入力を拒否させます
（[文法の外の拒否](#文法の外の拒否) を参照）。
[fixture:
mindmap/db-first-node-unindented] [fixture: mindmap/db-indent-root-offset]
[fixture: mindmap/db-indent-skips-levels] [fixture:
mindmap/db-indent-parent-is-nearest-shallower] [fixture:
mindmap/db-indent-sibling-after-deeper] [fixture:
mindmap/gram-indent-between-earlier-levels] [fixture:
mindmap/gram-indent-tab-then-spaces] [fixture:
mindmap/db-first-node-on-header-line] [fixture:
mindmap/db-first-node-on-header-line-wide-gap] [fixture:
mindmap/db-first-node-on-header-line-child-too-shallow]

### ノードと形

ノードは、ノードのテキスト、ノードのテキストと形、または形だけです。
`root`、`a(text)`、`[text]`、`((text))` です。
形の前のノードのテキストは空白を保ちます。
`a (x)` は id `a ` を持ちます。
`a(b)c` は、形の後にテキストが続くので拒否されます。
形だけのノードはノードのテキストを持ちません。
[fixture:
mindmap/db-first-node-unindented] [fixture: mindmap/db-shape-rounded] [fixture:
mindmap/db-shape-without-id] [fixture: mindmap/db-shape-without-id-circle]
[fixture: mindmap/gram-node-text-space-before-shape] [fixture:
mindmap/db-shape-id-with-parentheses]

閉じは開きに合わなくてかまいません。
`[text)`、`((x)`、`(x))`、`(x]`、`-)x(-` は形で、
`(-text-)` は開き `(-`、テキスト `text-`、閉じ `)` です。
mermaid.js が開きと閉じから形の種類をどう読むかは、
tests パッケージの要約にあります。
形には label が要ります。`r[]` は拒否されます。
[fixture: mindmap/db-shape-rect] [fixture:
mindmap/db-shape-rounded] [fixture: mindmap/db-shape-circle] [fixture:
mindmap/db-shape-cloud] [fixture: mindmap/db-shape-bang] [fixture:
mindmap/db-shape-hexagon] [fixture: mindmap/db-shape-mismatched-end] [fixture:
mindmap/gram-shape-circle-single-closer] [fixture:
mindmap/gram-shape-round-double-closer] [fixture:
mindmap/gram-shape-round-other-closer] [fixture:
mindmap/db-shape-cloud-dash-form] [fixture:
mindmap/gram-shape-dash-opener-without-id] [fixture:
mindmap/db-shape-empty-description] [fixture:
mindmap/gram-shape-parenthesis-closes-rect]

label は 1 つの単位で、形のテキスト、文字列、markdown 文字列です。
文字列か markdown 文字列の後には閉じだけが続けられ、どの閉じでもかまいません。
`a["x" ]`、`a["x""]`、`a["x""y"]`、``a["`x`" ]`` は拒否され、
`a["x"))` は受理されます。
文字列はどの形にも置けます。
`r{{"x"}}`、`r)"x"(`、`r))"x"((`、`r(-"x"-)` は受理されます。

文字列と markdown 文字列は改行を持てます。
文字列の中の CRLF は改行です。
[fixture:
mindmap/gram-string-then-space] [fixture: mindmap/gram-string-then-quote]
[fixture: mindmap/gram-two-strings] [fixture:
mindmap/gram-markdown-string-then-space] [fixture:
mindmap/gram-string-then-double-closer] [fixture:
mindmap/gram-strings-in-round-and-circle] [fixture:
mindmap/gram-string-in-hexagon] [fixture: mindmap/gram-string-in-cloud]
[fixture: mindmap/gram-string-in-bang] [fixture:
mindmap/gram-string-in-dash-form] [fixture:
mindmap/lex-string-line-feed] [fixture: mindmap/lex-string-crlf] [fixture:
mindmap/lex-markdown-string-line-feed] [fixture:
mindmap/lex-html-attribute-quote-in-description] [fixture:
mindmap/entity-placeholder-in-description]

### icon と class

icon の行は icon を、class の行は class を、最後に足されたノードに与えます。
それは、icon か class の行の字下げにかかわらず、
その前の最も近いノードの行のノードです。
ノードは icon の行と class の行を 2 つ以上持てます。
子の行の前の icon の行は、その前のノードを飾ります。
icon は括弧の中の空白を保ち、class は両端の空白を保ちます。
[fixture: mindmap/db-icon-line] [fixture:
mindmap/db-icon-twice] [fixture: mindmap/db-icon-and-class-on-child] [fixture:
mindmap/db-icon-indent-ignored] [fixture: mindmap/gram-icon-then-child]
[fixture: mindmap/db-icon-surrounding-whitespace] [fixture:
mindmap/db-class-line] [fixture: mindmap/db-class-twice] [fixture:
mindmap/db-class-trailing-space] [fixture: mindmap/db-class-leading-whitespace]
[fixture: mindmap/entity-placeholder-in-icon] [fixture:
mindmap/entity-placeholder-in-class]

### 空の形

空の icon `::icon()`、
その行で後に何もない `:::` である空の class の行、
形の中の空の文字列 `""` と空の markdown 文字列は、
テキストの単位を持たないので、文法のどの規則もそれを取らず、
どこにあっても入力は拒否されます。
mermaid.js はそれにトークンを読まず、
残りが受理されるところでは入力を受理します。
ノードの後の `::icon()`、根の前の字下げした `::icon()` と `:::`、
テキスト `x` を持つ `a[""x]` と `a["``"x]` です。
ヘッダーの直後の `::icon()`、ノードの行の前の字下げした `:::`、
`a[""]` と `a["``"]` は、どちらも拒否します。
既知の差異 [`tokenless-empty-forms`](#既知の差異) です。
形のテキストの最初の文字の後の引用符はその文字です。
`a[x""]` はテキスト `x""` を持ちます。
[fixture:
mindmap/db-icon-empty] [fixture: mindmap/div-empty-icon-before-root] [fixture:
mindmap/gram-empty-icon-right-after-header] [fixture: mindmap/db-class-empty]
[fixture: mindmap/div-empty-class-before-root] [fixture:
mindmap/gram-empty-class-then-node] [fixture: mindmap/div-empty-string-in-shape]
[fixture: mindmap/div-empty-markdown-string-in-shape] [fixture:
mindmap/gram-empty-string-shape] [fixture:
mindmap/gram-empty-markdown-string-shape] [fixture:
mindmap/gram-shape-text-quotes-after-text]

### 空行

空行、空白だけの行、コメント行、図のコメントは、
ヘッダーの後のどこにあっても何も変えません。
ノードの間、ヘッダーと最初のノードの間、終わりです。
[fixture:
mindmap/db-blank-line-between-nodes] [fixture:
mindmap/db-whitespace-only-line-between-nodes] [fixture:
mindmap/db-tab-only-line-between-nodes] [fixture:
mindmap/db-whitespace-after-last-node] [fixture:
mindmap/db-comment-line-after-header] [fixture:
mindmap/gram-comment-then-blank-at-end] [fixture:
mindmap/gram-blank-then-comment-between-nodes] [fixture:
mindmap/gram-comment-line-then-blank-between-nodes] [fixture:
mindmap/gram-blank-then-icon]

mermaid.js はこうした入力の一部を拒否します。
その字句解析器は、図のコメントをその前の空白と改行と合わせて、
また改行で終わる空白の並びを、それぞれ 1 つのトークンとして読み、
それを順に文として、または文の終わりとして数えるからです。
既知の差異 [`blank-line-after-header-or-comments`](#既知の差異) で、
その文書が入力を挙げています。
[fixture: mindmap/db-blank-line-after-header] [fixture:
mindmap/div-comment-then-blank-between-nodes]

### 文法の外の拒否

mermaid.js の Db は 2 種類の入力で例外を投げ、それらは拒否されます。

- 最初のノードではなく、根と同じかそれより浅く字下げされているために、
  前に字下げの小さいノードを持たないノード。2 つ目の根になるからです。
  タブは 1 文字なので、空白文字 4 つで字下げした根の後の行 `\tchild` は
  拒否されます。
  [fixture: mindmap/db-indent-same-as-root]
  [fixture: mindmap/db-indent-less-than-root] [fixture:
  mindmap/db-indent-tab-not-expanded-below-root]
- 最初のノードの前の icon の行か class の行。飾るノードがないからです。
  [fixture: mindmap/db-icon-before-node] [fixture:
  mindmap/db-class-before-node]

## 既知の差異

- **[`blank-line-after-header-or-comments`](../known-divergences/blank-line-after-header-or-comments.ja.md)。**
  ヘッダーの後や図のコメントの後の空行か空白だけの行は、
  その差異の文書が挙げる位置では、この仕様では受理され、
  mermaid.js は入力を拒否します
  （[空行](#空行) を参照）。
  [fixture: mindmap/db-blank-line-after-header]
  [fixture: mindmap/db-whitespace-line-after-header] [fixture:
  mindmap/db-directive-between-header-and-first-node] [fixture:
  mindmap/div-header-trailing-spaces-then-node] [fixture:
  mindmap/div-header-two-comments-then-blank] [fixture:
  mindmap/div-comment-then-blank-between-nodes] [fixture:
  mindmap/div-three-comments-then-blank-between-nodes]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  空の icon、空の class の行、形の中の空の文字列か空の markdown 文字列は、
  どこにあっても、この仕様では入力を拒否させ、
  mermaid.js はそれにトークンを読まず、そうした入力の多くを受理します
  （[空の形](#空の形) を参照）。
  [fixture: mindmap/db-icon-empty] [fixture:
  mindmap/div-empty-icon-before-root] [fixture: mindmap/db-class-empty]
  [fixture: mindmap/div-empty-class-before-root] [fixture:
  mindmap/div-empty-string-in-shape] [fixture:
  mindmap/div-empty-markdown-string-in-shape]
- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  開き、閉じ、`::icon(`、`:::`、ヘッダーの中のディレクティブは、
  この仕様では入力を拒否させ、mermaid.js は受理します
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  [fixture:
  mindmap/div-directive-in-opener] [fixture: mindmap/div-directive-in-closer]
  [fixture: mindmap/div-directive-in-icon-keyword] [fixture:
  mindmap/div-directive-in-class-marker] [fixture:
  mindmap/div-directive-in-header-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則に合う行で、開きか閉じの中の無視される `;` は、
  ここでは入力を拒否させ、
  mermaid.js は `;` を取り除いて部分を 1 つとして読みます。
  `style:#x{;{b}}` は mermaid.js では六角形です。
  テキストの単位の中では、mermaid.js の読みを保ちます。
  [fixture:
  mindmap/div-ignored-semicolon-in-opener] [fixture:
  mindmap/tokens-ignored-semicolon-in-node-text] [fixture:
  mindmap/tokens-ignored-semicolon-in-shape-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、
  `root["b="c">d"]` は mermaid.js ではテキスト `b='c'>d` を持ち、
  ここでは文字列が 2 つ目の `"` で終わって、入力は拒否されます。
  [fixture: mindmap/div-html-tag-starts-in-frontmatter-string]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.js は拒否します。
  [fixture: mindmap/div-frontmatter-invalid-yaml]

既知の差異 `c4-keyword-anywhere` はこの図種には表れません。
mermaid.js は mindmap の検出器を C4 のものより先に試すからです。
`C4Container` はノードのテキストです。
[fixture: mindmap/lex-c4-keyword-as-node-text]

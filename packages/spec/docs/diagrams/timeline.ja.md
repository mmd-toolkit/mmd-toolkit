# Timeline

英語版: [timeline.md](./timeline.md)

mermaid.js の正となるソース：

- [`timeline.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison)
- [`timelineDb.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js)
- [`timeline/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline) の中のテスト（`*.spec.js`）

この文書は図種 `timeline` を扱います。
木のノードは [ast/timeline.ja.md](../ast/timeline.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 18 がこの文法を選びます。
テキストが、空白の後、
ちょうどこの大文字小文字の `timeline` で始まるときです（[`detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/detector.ts#L9-L11)）。
`Timeline` と `TIMELINE` はどの検出器にも合いません。 [fixture: timeline/db-header-only]
[fixture: timeline/header-indented] [fixture: timeline/header-after-blank-lines]
[fixture: timeline/header-capitalized] [fixture: timeline/header-upper-case]

その後、字句解析器がヘッダー、つまりキーワード `timeline` を、
大文字小文字を区別せず、
語の文字が続かない形で読みます（[文の文脈](#文の文脈) を参照）。
そのため `timelinex` と `timelineTD` は、period なので、検出されて拒否されます。
一方、`timeline-x` はヘッダーと period `-x` で、 `timelineé` もヘッダーと period
`é` です。
ASCII の外の文字は語の文字ではないからです。
ヘッダーの行には、空白の後にも直後にも文を続けられ、ヘッダーだけの入力は、
後ろに改行がなくても受理されます。
`timeline:` は、ヘッダーと、文法が取らない `:` の単位なので拒否されます。
`timeline;` はヘッダーと period `;` で、
`timeline#c` と `timeline%c` はヘッダーとコメントです。
2 つ目のヘッダーはどの規則も取りません。 [fixture:
timeline/header-word-suffix] [fixture: timeline/header-glued-direction]
[fixture: timeline/header-dash-suffix] [fixture:
timeline/header-non-ascii-letter-suffix] [fixture:
timeline/header-text-on-header-line] [fixture:
timeline/header-period-with-event-on-header-line] [fixture:
timeline/header-section-on-header-line] [fixture:
timeline/header-title-on-header-line] [fixture:
timeline/header-acc-title-on-header-line] [fixture:
timeline/header-trailing-spaces] [fixture: timeline/header-without-line-feed]
[fixture: timeline/header-colon] [fixture: timeline/header-semicolon] [fixture:
timeline/header-hash-glued] [fixture: timeline/header-percent-glued] [fixture:
timeline/header-hash-comment-on-header-line] [fixture:
timeline/header-percent-comment-on-header-line] [fixture: timeline/header-twice]
[fixture: timeline/header-twice-with-directions] [fixture:
timeline/gram-header-as-later-line]

ヘッダーは**方向**を持てます。
`timeline` の後の 1 つ以上の空白文字かタブと、大文字小文字を区別せずに比べる、
語の文字が続かないキーワード `LR` か `TD` です。
`timeline TD`、`timeline td`、`timeline Lr`、 `timeline` とタブと `TD`、
`timeline` と空白文字 2 つと `TD` は方向を持ちます。
ほかの空白は方向をヘッダーにつなぎません。
U+00A0、U+3000、U+2028、改行の後の `TD` は period で、
空白文字の後の `TDx` もそうです。
方向は 1 つだけ読まれます。
`timeline TD LR` と `timeline LR TD` では 2 つ目の語が period で、
それだけの行の `LR` も period です。 [fixture:
timeline/db-direction-td] [fixture: timeline/db-direction-lr] [fixture:
timeline/db-direction-lower-case] [fixture: timeline/db-direction-mixed-case]
[fixture: timeline/db-direction-tab] [fixture: timeline/db-direction-two-spaces]
[fixture: timeline/db-direction-trailing-space] [fixture:
timeline/header-direction-no-break-space] [fixture:
timeline/header-direction-ideographic-space] [fixture:
timeline/header-direction-line-separator] [fixture:
timeline/header-direction-line-feed] [fixture:
timeline/header-direction-word-suffix] [fixture:
timeline/header-direction-word-suffix-lr] [fixture:
timeline/header-direction-twice] [fixture: timeline/header-direction-lr-td]
[fixture: timeline/lex-direction-word-as-period] [fixture:
timeline/header-direction-glued-colon]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行です。
検出はそれを読んで通り過ぎてヘッダーを見つけ、
その行はどの図種でもそうであるように、
ここでは印 `%%` の図のコメントです（[図種の検出](../common.ja.md#図種の検出) を参照）。
コメントはどのノードにも属さず、TimelineDiagram はヘッダーから始まります。
mermaid.js はどちらの場合も入力を拒否し、
`%%` だけの行の後に空白だけの行があるときも拒否します。
その字句解析器は `%%` をコメントとして読みますが、
その後の改行を `newline` の単位として読み、
その文法がヘッダーの前でそれを取らないからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
ヘッダーの前のコメント行は検出の前に取り除かれ、
ヘッダーの前の行のディレクティブと、ヘッダーの行のその後のディレクティブは、
ディレクティブであってそれ以外ではありません。
ヘッダーの前の行 `# c` はテキストの始まりなので、
どの検出器にも合いません。 [fixture:
timeline/header-after-bare-percent-line] [fixture:
timeline/header-after-empty-braces-line] [fixture:
timeline/header-after-bare-percent-line-and-whitespace-line] [fixture:
timeline/header-after-comment-line] [fixture:
timeline/header-after-directive-line] [fixture:
timeline/header-directive-after-header] [fixture:
timeline/header-space-directive-then-line] [fixture:
timeline/header-after-hash-line]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を [変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして、
コメント領域と行の規則が無視する `;` はないものとして読みます。
最後の文字の後に字句解析器が読む `\n` （[テキストの終わり](../common.ja.md#テキストの終わり)）は図のテキストの一部なので、
テキストの終わりのタイトルのテキスト、period、
event はそこで終わります。 [fixture:
timeline/lex-title-at-end-of-text] [fixture: timeline/lex-period-at-end-of-text]
[fixture: timeline/lex-event-at-end-of-text] [fixture:
timeline/demo-timeline-eab9c50d]
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 である、
この図自身の単位の規則を述べます。

この図の mermaid.js の字句解析器は、
文字の大文字小文字を区別せずに比べます（[表記](../common.ja.md#表記) を参照）。
`TITLE T`、`SECTION S`、`ACCTITLE: T`、`ACCDESCR: D`、`ACCDESCR { D }` は、
この文書が書く形の語と同じに読まれ、 `Title`、改行、`  Section` はタイトルです。
テキストは書かれた大文字小文字を保ちます。 [fixture: timeline/db-title-upper-case]
[fixture: timeline/db-section-upper-case] [fixture:
timeline/db-acc-title-upper-case] [fixture: timeline/lex-acc-descr-upper-case]
[fixture: timeline/lex-acc-descr-block-upper-case] [fixture:
timeline/db-period-title-then-section-lines]
以下で**キーワード**とは、大文字小文字を区別せずに照合する語で、
規則がそう言うところでは語の文字が続かないもの（[表記](../common.ja.md#表記) を参照）、
規則がそう言うところでは空白が続くものです（[キーワードとその後に続くもの](#文の文脈) を参照）。

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

テキストは文の文脈でだけ終われます。
タイトルの文脈、説明の文脈、説明ブロックの文脈では終われず、入力は拒否されます。
そのため、後ろに何もない `accTitle:`（コロンの後に空白や改行があっても同じ）、
後ろに何もない `accDescr:`、
`}` のない `accDescr {`（後ろにテキストがあってもなくても）は拒否されます。 [fixture:
timeline/gram-acc-title-empty] [fixture: timeline/gram-acc-title-only-space]
[fixture: timeline/lex-acc-title-colon-at-end-of-text] [fixture:
timeline/gram-acc-descr-empty] [fixture: timeline/gram-acc-descr-block-unclosed]
[fixture: timeline/lex-acc-descr-block-unclosed-empty]

**空白。**
この文書の空白は [表記](../common.ja.md#表記) の集合です。
U+00A0、U+2028、U+2029、U+3000、U+FEFF、タブは、
規則が空白を読むところではどこでも空白で、
規則がそう言うところでは改行も空白です。
文の文脈では、
単位が始まるところの 1 つ以上の改行の並びは `newline` の単位で（規則 2）、
それ以外の空白の並びは、改行を含めて、
単位の一部にならずに単位の間にあります（規則 3）。
字下げ、period の前の U+3000、ヘッダーの後や period の前の U+2028 は空白です。
文のテキストは空白を自分の文字として取ります。
period はコロンの前の空白を保ち、 period、event、タイトル、section、
アクセシビリティのテキストの中の U+2028 と U+2029 はその文字です。
period、event、タイトル、section のテキストの終わりのタブ、U+00A0、
U+3000 はその文字で、アクセシビリティのタイトルと説明、
説明ブロックのテキストは、
それらの文字を含めて両端の空白なしで読まれます（[アクセシビリティの文](#アクセシビリティの文) を参照）。
字下げは何も意味しません。
前の period より深く字下げした period も、
別の period です。 [fixture: timeline/lex-period-trailing-tab]
[fixture: timeline/lex-event-trailing-tab]
[fixture: timeline/lex-title-trailing-tab]
[fixture: timeline/lex-section-trailing-tab]
[fixture: timeline/lex-acc-title-trailing-tab]
[fixture: timeline/lex-acc-descr-trailing-tab]
[fixture: timeline/lex-title-trailing-ideographic-space]
[fixture: timeline/lex-section-trailing-no-break-space]
[fixture: timeline/lex-acc-title-trailing-no-break-space]
[fixture: timeline/lex-acc-title-leading-ideographic-space]
[fixture: timeline/lex-acc-descr-trailing-ideographic-space]
[fixture: timeline/lex-acc-descr-block-trailing-ideographic-space]
[fixture: timeline/db-whitespace-only-line]
[fixture: timeline/db-period-leading-whitespace] [fixture:
timeline/db-tab-indentation] [fixture:
timeline/lex-ideographic-space-indentation] [fixture:
timeline/db-period-leading-ideographic-space] [fixture:
timeline/lex-line-separator-after-header] [fixture:
timeline/lex-line-separator-before-period] [fixture:
timeline/lex-line-separator-before-event-colon] [fixture:
timeline/lex-no-break-space-around-period-and-event] [fixture:
timeline/lex-ideographic-space-at-end-of-period] [fixture:
timeline/lex-period-line-separator-inside] [fixture:
timeline/lex-period-paragraph-separator-inside] [fixture:
timeline/lex-event-line-separator-inside] [fixture:
timeline/lex-event-paragraph-separator-inside] [fixture:
timeline/lex-title-line-separator-inside] [fixture:
timeline/lex-section-line-separator-inside] [fixture:
timeline/lex-acc-title-line-separator-inside] [fixture:
timeline/lex-acc-descr-line-separator-inside] [fixture:
timeline/lex-acc-descr-block-line-separator-inside] [fixture:
timeline/db-indentation-does-not-nest]

**エンティティ。**
エンティティは、
字句解析器がテキストを読む前にそのプレースホルダーとして読まれます（[エンティティ](../common.ja.md#エンティティ) を参照）。
プレースホルダーは ASCII の外の文字でできているので、
その `#` と `;` は period を終えずコメントも始めず、
テキストはエンティティを書かれたとおりに保ちます。
`a #35; b : c #35; d` は period `a #35; b ` と event `c #35; d` を持ちます。
名前の形と 16 進の形も同じに読まれます。
`a : #35;` は event `#35;` を持ちます。
タイトル、section、アクセシビリティのタイトル、アクセシビリティの説明、
説明ブロックもそれを持てます。
エンティティを始めない `#` は、period を終えるところでコメントを始めます。
`a #bogus b` は period `a ` とコメントです。 [fixture: timeline/db-event-entity]
[fixture:
timeline/db-event-entity-named] [fixture: timeline/db-event-entity-hex]
[fixture: timeline/db-event-entity-is-no-comment] [fixture:
timeline/db-title-entity] [fixture: timeline/db-section-entity] [fixture:
timeline/db-acc-title-entity] [fixture: timeline/db-acc-descr-entity] [fixture:
timeline/db-acc-descr-block-entity] [fixture:
timeline/db-period-unclosed-reference]
HTML のタグの属性の引用符は、
どの図種でもそうであるように `'` として読まれます（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
`title` `<b a="x">t</b>` は `a='x'` のタイトルを持ち、 period
`A <a b="c">d` は `b='c'` を持ちます。
一方、event `"b"` のように、
タグの外の引用符は引用符のままです。 [fixture: timeline/lex-html-tag-in-title]
[fixture:
timeline/lex-html-tag-in-period] [fixture:
timeline/db-event-quotes-and-brackets]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むとおりに読みます。
そのうえで [ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界) の規則が単位に当てはまります。
テキストの単位の中のディレクティブは mermaid.js の読みを保ち、
それ以外の単位の中のディレクティブは入力を拒否させます。
この図種には文字列の単位はありません。
**テキストの単位**は、`period-text`、`event-text`、`title-text`、
`section-text`、`acc-title-text`、`acc-description-text`、
`acc-description-block-text` です。
ほかの単位、つまりヘッダー、方向、`title`、`section`、`accTitle`、`accDescr`、
`:`、`{`、`}` は、テキストの単位ではありません。

- `a%%{init: {}}%%b` は period `ab`、`a : e%%{init: {}}%%f` は event `ef`、
  `title a %%{init: {}}%% b` は `a`、空白文字 2 つ、`b` のタイトル、
  `section a %%{init: {}}%% b` は同じテキストの section、
  `accTitle: a %%{init: {}}%% b` は同じテキストのアクセシビリティのタイトル、
  `accDescr: a%%{init: {}}%%b` は説明 `ab` を持ち、
  説明ブロックも同じ種類のテキストを持ちます。
  mermaid.js と同じです。
  `a : e %%{init: {}}%% : f` の event は `e` と空白文字 2 つです。 [fixture: timeline/db-period-directive-glued]
  [fixture: timeline/lex-directive-in-event] [fixture:
  timeline/db-title-directive]
  [fixture: timeline/db-section-directive] [fixture:
  timeline/db-acc-title-directive] [fixture:
  timeline/lex-directive-in-acc-descr] [fixture:
  timeline/db-acc-descr-block-directive] [fixture: timeline/db-event-directive]
- 2 つの単位の間のディレクティブは許されます。
  ヘッダーと方向の間の `timeline %%{init: {}}%% TD`、
  コロンとその後の空白文字の間の `a:%%{init: {}}%% e`（event は `e`）、
  `title` とその空白文字の間、
  その文字とテキストの間の `title%%{init: {}}%% T` と `title %%{init: {}}%%T`、
  event のコロンの前の `a %%{init: {}}%% : e` （period は `a` と空白文字 2 つ）です。
  ディレクティブがなくても単位が読めなければなりません。
  `a :%%{init: {}}%%e` ではコロンの後に空白がないので、
  どちらも入力を拒否します。 [fixture:
  timeline/header-directive-before-direction] [fixture:
  timeline/lex-directive-between-colon-and-space] [fixture:
  timeline/lex-directive-between-title-and-whitespace] [fixture:
  timeline/lex-directive-between-title-whitespace-and-text] [fixture:
  timeline/db-period-directive-before-colon] [fixture:
  timeline/lex-directive-between-colon-and-event-text]
- `time%%{init: {}}%%line`、`timeline T%%{init: {}}%%D`、
  `ti%%{init: {}}%%tle T`、`sec%%{init: {}}%%tion S`、
  `acc%%{init: {}}%%Title: T`、`acc%%{init: {}}%%Descr: T`、
  `acc%%{init: {}}%%Descr { T }` では、
  ディレクティブはキーワードか方向の中にあります。
  入力は拒否され、
  mermaid.js は 2 つの部分を 1 つとして読んで受理します（[既知の差異](#既知の差異) を参照）。 [fixture:
  timeline/div-directive-in-header-keyword] [fixture:
  timeline/div-directive-in-direction] [fixture:
  timeline/div-directive-in-title-keyword] [fixture:
  timeline/div-directive-in-section-keyword] [fixture:
  timeline/div-directive-in-acc-title-keyword] [fixture:
  timeline/div-directive-in-acc-descr-keyword] [fixture:
  timeline/div-directive-in-acc-descr-block-keyword]

**単位の間のトリビア。**
[common.ja.md](../common.ja.md) のトリビアは、
この図の単位と次のように出会います。
単独の CR と CRLF は行終端で、
改行として読まれ（[行終端](../common.ja.md#行終端) を参照）、
`title` の後の空白文字としてもそうです。 [fixture: timeline/db-lone-cr-line-ends]
[fixture: timeline/db-crlf-line-ends] [fixture:
timeline/lex-title-separator-carriage-return]
行の終わりの閉じたディレクティブは何も終えず、その前の空白は、
空白を保つテキストではその前のテキストの文字です。
`a %%{init: {}}%%` は period `a ` を、
`title T %%{init: {}}%%` はタイトル `T ` を持ち、
`accTitle: T  %%{init: {}}%%` は、
両端の空白なしで読まれるアクセシビリティのタイトル `T` を持ちます。
閉じていないディレクティブはテキストの残りを取ります（[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）。
`a`、空白文字、`%%{init: {}` に行 `b` が続くものは、 1 つの period
`a ` を持ちます。 [fixture: timeline/lex-directive-at-end-of-period-line]
[fixture:
timeline/lex-directive-at-end-of-title-line] [fixture:
timeline/lex-directive-after-acc-title-text] [fixture:
timeline/tokens-unclosed-directive-in-period-line]

コメント行は、字句解析器がテキストを読む前にその改行ごと取り除かれます。
キーワードとそのテキストの間、コロンとその event の行の間でも同じです。
一方、それだけの行のディレクティブは、
ディレクティブの前の空白とともにその行をテキストに残します。
そのため、`title`、コメント行、`  T` は空白文字 2 つと `T` のタイトルを持ち、
コメント行が 2 つでも同じです。
`section`、コメント行、`  S` は section `  S` を、 `a :`、コメント行、
`  e` は event `  e` を持ち、 `a :` の代わりに `:` だけの行でも同じです。
`accTitle:` と `accDescr:`、コメント行、テキストは、そのテキストの値を持ち、
コメント行と `d` を持つブロックは説明 `d` を持ちます。
コメント行の代わりにディレクティブの行があると、その空白がテキストです。
`title` と字下げしたディレクティブの行は空白文字 2 つのタイトルを持ち、
その後に period `T` が続きます。
`section` も同じです。
`a :` と字下げしたディレクティブの行は空白文字 2 つの event を持ちます。
ディレクティブがその行の先頭にあると行は空なので、
`title` と `section` は period になり、 event は始まれず入力は拒否されます。
`accTitle:` と `accDescr:` の後では、その行の空白はコロンとともに読まれます。
`title` の後の行 `# c` はタイトル `  # c` です。
タイトルのテキストは `#` を持つからです。 [fixture: timeline/db-comment-percent-line]
[fixture: timeline/lex-title-line-feed-comment-line] [fixture:
timeline/lex-title-line-feed-two-comment-lines] [fixture:
timeline/lex-section-line-feed-comment-line] [fixture:
timeline/lex-event-line-feed-comment-line] [fixture:
timeline/lex-event-own-line-colon-comment-line] [fixture:
timeline/lex-acc-title-value-after-comment-line] [fixture:
timeline/lex-acc-descr-value-after-comment-line] [fixture:
timeline/db-acc-descr-block-percent-line] [fixture:
timeline/lex-title-line-feed-directive-line] [fixture:
timeline/lex-section-line-feed-directive-line] [fixture:
timeline/lex-event-line-feed-directive-line] [fixture:
timeline/lex-title-line-feed-directive-line-unindented] [fixture:
timeline/lex-section-line-feed-directive-line-unindented] [fixture:
timeline/lex-event-line-feed-directive-line-unindented] [fixture:
timeline/lex-event-own-line-colon-directive-line-unindented] [fixture:
timeline/lex-acc-title-value-after-directive-line] [fixture:
timeline/lex-acc-descr-value-after-directive-line] [fixture:
timeline/lex-title-line-feed-hash-line]

`style` の規則か `classDef` の規則に合う行（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行) を参照）では、
最後の `;` が無視されて読み通されます。
テキストの単位の中では、2 つの部分が mermaid.js と同じく 1 つとして読まれます。
`title style:#x;y` はタイトル `style:#xy` を持ち、
`style` の代わりに `classDef` でも同じです。
`accTitle: style:#x;y`、`accDescr: style:#x;y`、
ブロックの行 `style:#x;y` はテキスト `style:#xy` を持ちます。
`2020 : style:#x;y` は event `style:#xy` を持ち、
その行の 2 つ目の event でも同じです。
同じ行の `accDescr { style:#x }` の後では、`a;b` は period `ab` です。
規則には小文字の `style` と `:` の後の `#` が要ります。
`title Style:#x;y`、`title style:x;y`、`title style#:x;y` は `;` を保ち、
最初のものでは `#x;` はエンティティです。
2 つあると最後のものだけが無視され、その前の `#x;` はエンティティです。
`title style:#x;y;z` がそうです。
一方、`title style:#35;` では、
ただ 1 つの `;` がエンティティを読む前に無視され、 `#35` はテキストのままです。
period と section のテキストは `style:` の `:` で止まるので、
`style:#x;y` と `section style:#x;y` は、残りが `:` の単位なので、
どちらも拒否します。
キーワードの中では、無視される `;` は入力を拒否させ、
mermaid.js は受理します（[既知の差異](#既知の差異) を参照）。
同じ行の `accDescr { style:#x }` の後の `ti;tle T`、`sec;tion S`、
`accTi;tle: T` です。 [fixture: timeline/lex-title-semicolon-in-style-line]
[fixture:
timeline/lex-title-semicolon-in-classdef-line] [fixture:
timeline/lex-acc-title-semicolon-in-style-line] [fixture:
timeline/lex-acc-descr-semicolon-in-style-line] [fixture:
timeline/lex-acc-descr-block-semicolon-in-style-line] [fixture:
timeline/lex-event-semicolon-in-style-line] [fixture:
timeline/lex-event-semicolon-in-style-line-second-event] [fixture:
timeline/tokens-ignored-semicolon-in-period] [fixture:
timeline/lex-title-semicolon-style-upper-case] [fixture:
timeline/lex-title-semicolon-without-hash] [fixture:
timeline/lex-title-semicolon-hash-before-colon] [fixture:
timeline/lex-title-semicolon-after-text-before-style] [fixture:
timeline/lex-title-semicolon-in-style-line-last-only] [fixture:
timeline/lex-title-semicolon-in-style-line-entity] [fixture:
timeline/gram-period-style-line] [fixture: timeline/gram-section-style-line]
[fixture: timeline/div-ignored-semicolon-in-title-keyword] [fixture:
timeline/div-ignored-semicolon-in-section-keyword] [fixture:
timeline/div-ignored-semicolon-in-acc-title-keyword]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. `{` が続かない `%`。
   `%` から行の終わりまでの図のコメントです（[コメント](#コメント) を参照）。
   `% c`、`%c`、`%` だけはコメントで、 period とその event の行の間でも、
   ヘッダーの後でもそうです。 [fixture: timeline/db-comment-percent-line]
   [fixture: timeline/db-comment-single-percent-line]
   [fixture: timeline/db-comment-single-percent-glued]
   [fixture: timeline/db-comment-single-percent-only]
   [fixture: timeline/db-comment-single-percent-between-task-and-event]
   [fixture: timeline/header-single-percent-comment-on-header-line]
   [fixture: timeline/lex-percent-x-line] [fixture:
   timeline/lex-percent-brace-period]
2. 1 つ以上の改行。
   `newline` の単位です。 [fixture: timeline/db-blank-line-between-tasks]
3. 改行を含む 1 つ以上の空白文字。
   何もありません。 [fixture: timeline/db-whitespace-only-line]
4. `#`。
   `#` から行の終わりまでの図のコメントです（[コメント](#コメント) を参照）。 [fixture: timeline/db-comment-hash-line]
5. キーワード `timeline`、1 つ以上の空白文字かタブ、キーワード `LR`。
   `header` の単位と `direction` の単位です。 [fixture: timeline/db-direction-lr]
6. キーワード `timeline`、1 つ以上の空白文字かタブ、キーワード `TD`。
   `header` の単位と `direction` の単位です。 [fixture: timeline/db-direction-td]
7. キーワード `timeline`。
   `header` の単位です。 [fixture: timeline/db-header-only]
8. `title`、改行を含む空白文字 1 つ、改行以外の 1 つ以上の文字。
   `title` の単位と `title-text` の単位で、
   後者のテキストはその空白文字 1 つの後の文字です。 [fixture:
   timeline/db-title-statement] [fixture: timeline/db-title-two-spaces]
   [fixture: timeline/lex-title-separator-line-feed]
9. `accTitle`、改行を含む 0 個以上の空白文字、`:`、
   改行を含む 0 個以上の空白文字。
   `accTitle` の単位と `:` の単位で、タイトルの文脈に入ります。 [fixture:
   timeline/db-acc-title-statement] [fixture: timeline/db-acc-title-glued]
   [fixture: timeline/db-acc-title-space-before-colon] [fixture:
   timeline/lex-acc-title-colon-on-next-line]
10. `accDescr`、改行を含む 0 個以上の空白文字、`:`、
    改行を含む 0 個以上の空白文字。
    `accDescr` の単位と `:` の単位で、説明の文脈に入ります。 [fixture:
    timeline/db-acc-descr-statement] [fixture: timeline/db-acc-descr-glued]
11. `accDescr`、改行を含む 0 個以上の空白文字、`{`、
    改行を含む 0 個以上の空白文字。
    `accDescr` の単位と `{` の単位で、説明ブロックの文脈に入ります。 [fixture:
    timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-glued]
    [fixture: timeline/db-acc-descr-block-spaces]
12. `section`、改行を含む空白文字 1 つ、`:` と改行以外の 1 つ以上の文字。
    `section` の単位と `section-text` の単位で、
    後者のテキストはその空白文字 1 つの後の文字です。 [fixture: timeline/db-section-statement]
    [fixture:
    timeline/db-section-two-spaces] [fixture:
    timeline/lex-section-separator-line-feed]
13. `:`、改行を含む空白文字 1 つ、**event のテキスト**。
    event のテキストは 1 つ以上の文字で、どの文字も `:` と改行以外の文字か、
    空白が続かない `:` です。
    `:` の単位と `event-text` の単位です。 [fixture: timeline/db-period-and-event]
    [fixture:
    timeline/db-event-colon-glued-inside] [fixture:
    timeline/db-event-line-feed-after-colon]
14. `#`、`:`、改行以外の 1 つ以上の文字。
    `period-text` の単位です。 [fixture: timeline/db-period-only] [fixture:
    timeline/db-period-with-spaces] [fixture:
    timeline/db-period-trailing-spaces]
15. `:`。
    文法のどの規則も取らない `:` の単位です。 [fixture:
    timeline/gram-event-colon-glued-to-event] [fixture:
    timeline/gram-event-empty-after-colon] [fixture: timeline/header-colon]

改行、`#`、`:` 以外の文字は、
それより前の規則が合わないところではどれも period の文字なので、
字句解析器が行を拒否するのは、event の続かない `:` のところだけです。
空白の続かない `:`、行でその後に空白しかない `:`、
event のテキストの終わりで後ろに何もない `:` がそうした単位です。
`a:e`、`a :e`、`:e`、`a :`、`a : `、`a : e1 :`、`a : b:`、`a : :` は拒否され、
一方、`;` はどのテキストでも文字です。
それだけの行では period `;` で、
`accDescr { d };` のように説明ブロックの直後でもそうです。
`a;` は period `a;`、`section s;` は section `s;`、
`accDescr: d;` は説明 `d;` を持ちます。 [fixture: timeline/gram-event-colon-glued-to-event]
[fixture:
timeline/gram-event-colon-space-glued] [fixture:
timeline/gram-event-colon-glued-first] [fixture:
timeline/gram-event-empty-after-colon] [fixture:
timeline/gram-event-empty-after-colon-space] [fixture:
timeline/gram-event-trailing-colon] [fixture:
timeline/gram-event-trailing-colon-space] [fixture:
timeline/gram-event-colon-at-end-glued] [fixture:
timeline/gram-event-colon-then-colon] [fixture:
timeline/lex-semicolon-line-is-period]
[fixture: timeline/gram-semicolon-after-block]
[fixture: timeline/db-period-trailing-semicolon]
[fixture: timeline/db-section-trailing-semicolon]
[fixture: timeline/db-acc-descr-semicolon]
この順序から、次のことが言えます。

- 単位が始まるところの `%` は、`{` が続かなければコメントです。
  テキストの中ではテキストの文字です（[コメント](#コメント) を参照）。
  `%{x}` は period `%{x}` です。 [fixture: timeline/lex-percent-brace-period]
  [fixture:
  timeline/db-comment-percent-after-period]
- 文は改行ではなく自分の単位で終わります。
  `newline` の単位は文法にとってそれだけで 1 行で、
  いくつかの文が 1 つの行を分け合えます。
  `timeline TD title T`、`timeline a : b`、`accDescr { D } a : e`、
  `accDescr {}accDescr {} a` がそうです。
  一方、タイトルのテキストはその行の残りを、
  section のテキストは `:` までの残りを、 period は `#` か `:` までの残りを、
  event のテキストは空白が続く `:` までの残りを取ります。
  そのため、`title T : e` はタイトル `T : e`、 `section S : x` は section
  `S ` と event、 `a : b -- c : d --> e` は、 event
  `b -- c ` と `d --> e` を持つ period
  `a ` です。 [fixture: timeline/header-title-on-header-line] [fixture:
  timeline/header-period-with-event-on-header-line] [fixture:
  timeline/gram-acc-descr-block-then-period-same-line] [fixture:
  timeline/gram-empty-description-blocks-then-period] [fixture:
  timeline/gram-title-takes-event-text] [fixture:
  timeline/db-section-with-event-after-task] [fixture: timeline/db-event-arrows]
- period は、そのコロン、`#`、改行の前の空白を保ちます。
  `a : e` は period `a ` を、`a: e` は period `a` を持ちます。
  event のテキストは、空白文字 1 つの後の空白と、終わりの空白を保ちます。
  `a :   e` は event `  e`、`a : e   ` は event `e   `、
  `a :` と空白文字 2 つは空白文字 1 つの event を持ちます。 [fixture: timeline/db-period-and-event]
  [fixture:
  timeline/db-period-colon-glued-to-period] [fixture:
  timeline/db-event-leading-spaces] [fixture: timeline/db-event-trailing-spaces]
  [fixture: timeline/db-event-two-spaces]
- event のテキストの中で、空白以外の文字が続く `:` は文字です。
  `a : b:c` は event `b:c`、`a : x::y` は event `x::y`、 `a : e1 :e2` は event
  `e1 :e2` を持ちます。
  一方、`: ` は次の event を始めます。
  `a : e1: e2` は event `e1` と `e2` を、 `a : x: :y` は event
  `x` と `:y` を持ちます。 [fixture: timeline/db-event-colon-glued-inside]
  [fixture:
  timeline/db-event-double-colon-inside] [fixture:
  timeline/db-event-colon-space-before-glued-after] [fixture:
  timeline/db-event-colon-glued-before] [fixture:
  timeline/db-event-colon-space-then-glued-colon]
- `title`、`section`、event のコロンの後の空白文字 1 つは改行でもよいので、
  テキストは次の行から始まれます。
  `a :`、改行、`e` は event `e` を、 `a :`、改行、`  e` は event
  `  e` を持ちます。
  `a : e1 :` と行 `  e2` は event `e1 ` と `  e2` を持ちます。
  テキストは空白だけでもかまいません。
  `a :`、改行、空白文字 3 つの行、`e` は、空白文字 3 つの event と period
  `e` を持ちます。
  一方、改行と空行の後では event は始まれず、入力は拒否されます。 [fixture:
  timeline/db-event-line-feed-after-colon] [fixture:
  timeline/db-event-line-feed-after-colon-indented] [fixture:
  timeline/db-event-line-feed-after-second-colon] [fixture:
  timeline/db-event-line-feed-then-whitespace-line] [fixture:
  timeline/gram-event-line-feed-then-empty-line]
- `#` は period を終えてコメントを始めるので、 `a #c : e` は period
  `a ` を持ち、event を持ちません。
  一方、タイトルのテキスト、section のテキスト、event のテキスト、
  アクセシビリティのテキストの中の `#` は文字です。
  `title T # c`、`section S # c`、`a : e # c`、`a : #`、
  `title #my#title#` はそれを保ちます。 [fixture:
  timeline/db-comment-hash-after-period] [fixture:
  timeline/db-comment-hash-after-period-hides-event] [fixture:
  timeline/db-title-hash] [fixture: timeline/db-section-hash] [fixture:
  timeline/db-event-hash] [fixture: timeline/db-event-only-hash] [fixture:
  timeline/spec-timeline-51f39885]

**キーワードとその後に続くもの。**
`timeline` は語の文字が続かないところでだけキーワードです（[検出](#検出) を参照）。
`title` と `section` は、ちょうど 1 つの空白文字が後に続き、
その後にテキストの文字が少なくとも 1 つあるときだけキーワードです。
その空白文字は、改行でも、タブ、U+00A0、U+3000、U+2028、U+2029、
U+FEFF のようなほかの空白文字でもかまいません。
section のテキストは `:` で始まれません。
2 つ目の改行の後、空白文字と改行の後、テキストの終わりのように、
テキストが始まれないところでは、その語は period です。
`title` と `section` だけ、空白文字が続く `title` と `section`、
改行と空行が続く `title` と `section`、`titlex` と `sectionx` は period で、
`title:T` と `section:S` は period `title` か `section` と `:` の単位で、
拒否されます。
テキストが空白だけのタイトルや section も読まれます。
行の終わりの `title` と空白文字 2 つは空白文字 1 つのタイトルを持ち、
`section` も同じです。 [fixture:
timeline/lex-title-separator-tab] [fixture:
timeline/lex-title-separator-no-break-space] [fixture:
timeline/lex-title-separator-ideographic-space] [fixture:
timeline/lex-title-separator-line-separator] [fixture:
timeline/lex-title-separator-paragraph-separator] [fixture:
timeline/lex-title-separator-byte-order-mark] [fixture:
timeline/lex-title-separator-line-feed] [fixture:
timeline/lex-section-separator-tab] [fixture:
timeline/lex-section-separator-ideographic-space] [fixture:
timeline/lex-section-separator-line-separator] [fixture:
timeline/lex-section-separator-line-feed] [fixture:
timeline/gram-title-keyword-alone] [fixture:
timeline/gram-section-keyword-alone] [fixture:
timeline/gram-title-keyword-trailing-space] [fixture:
timeline/gram-section-keyword-trailing-space] [fixture:
timeline/lex-title-line-feed-empty-line] [fixture:
timeline/lex-section-line-feed-empty-line] [fixture:
timeline/gram-title-word-suffix] [fixture: timeline/gram-section-word-suffix]
[fixture: timeline/gram-title-colon-glued] [fixture:
timeline/gram-section-colon-glued] [fixture: timeline/db-title-only-space]
[fixture: timeline/db-section-only-space]
`accTitle` と `accDescr` は、空白の後でも直後でも、
`:` か `{` が後に続くときだけキーワードです。
それだけの行の `accTitle` と `accDescr` は period で、 `accTitle`、改行、
`: T` はアクセシビリティのタイトル `T` を持ちます。 [fixture:
timeline/db-period-acc-keywords-alone] [fixture:
timeline/lex-acc-title-colon-on-next-line]

### アクセシビリティの値

タイトルの文脈には `accTitle:` とその空白の後で（文の文脈の規則 9）、
説明の文脈には `accDescr:` とその空白の後で（規則 10）、
説明ブロックの文脈には `accDescr {` とその空白の後で（規則 11）入ります。

タイトルの文脈と説明の文脈では、規則は 1 つです。
改行以外の 1 つ以上の文字で、タイトルの文脈では `acc-title-text` の単位、
説明の文脈では `acc-description-text` の単位で、文脈を出ます。
コロンの後の空白は、改行を含めてコロンとともに読まれるので、テキストは、
コロンの行かそれより後の行の、空白でない最初の文字から始まり、
その行の終わりまで、`:`、`#`、`;`、`%%` を含めて続きます。
`accTitle: T : e` はアクセシビリティのタイトル `T : e` を、
`accTitle:` と行 `T` はアクセシビリティのタイトル `T` を持ちます。
テキストはこれらの文脈で終われないので、
後ろに空白しかない `accTitle:` は拒否されます。 [fixture: timeline/db-acc-title-statement]
[fixture:
timeline/db-acc-title-many-spaces] [fixture: timeline/db-acc-title-colon]
[fixture: timeline/gram-acc-title-takes-event-text] [fixture:
timeline/db-acc-title-hash] [fixture: timeline/db-acc-title-semicolon] [fixture:
timeline/db-acc-title-percent] [fixture:
timeline/lex-acc-title-value-on-next-line]
[fixture: timeline/lex-acc-title-separator-no-break-space] [fixture:
timeline/db-acc-descr-hash] [fixture: timeline/gram-acc-title-empty]

説明ブロックの文脈では、字句解析器は次の規則を順に試します。

1. `}`。
   `}` の単位で、文脈を出ます。 [fixture: timeline/db-acc-descr-block]
2. 改行を含む、`}` 以外の 1 つ以上の文字。
   `acc-description-block-text` の単位です。 [fixture: timeline/db-acc-descr-block]
   [fixture: timeline/db-acc-descr-block-hash-and-percent]

`{` の後の空白は、改行を含めて波括弧とともに読まれるので、
ブロックのテキストは空白でない文字から始まり、 `}` の直前で、
その前の空白を含めて終わります。
波括弧の間に空白しかないブロックはテキストの単位を持ちません（[空の説明ブロック](#空の説明ブロック) を参照）。
テキストは説明ブロックの文脈で終われません。
`}` の後は文の文脈が続くので、ブロックの後の `}a` は period `a` で、
ブロックの中の `a } b` に行 `}` が続くと、ブロックは最初の `}` で終わり、
`b` と `}` は period です。 [fixture:
timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/db-acc-descr-block-empty] [fixture:
timeline/gram-acc-descr-block-unclosed] [fixture:
timeline/db-acc-descr-block-then-text] [fixture:
timeline/db-acc-descr-block-brace-inside]

### コメント

字句解析器は単位のほかに**図のコメント**を読みます。
行の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
これは [common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器がテキストを読む前に取り除かれます。
図のコメントは行の途中から始まれ、 `%%` だけの行、`%x`、`# c`、
`%%{ }%%` の行は、
コメント行ではなく図のコメントです。 [fixture: timeline/db-comment-hash-line]
[fixture:
timeline/db-comment-percent-only] [fixture: timeline/lex-percent-x-line]
[fixture: timeline/lex-percent-brace-line-after-period]

図のコメントは、文の文脈で単位が始まるところの `#`（規則 4）か、
`{` が続かない `%`（規則 1）から始まり、改行まで続きます。
改行はその一部ではありません。
図のコメントの**印**は、`#` で始まるなら `#`、`%%` で始まるなら `%%`、
それ以外なら `%` で、その値は印の後のテキストです。
ディレクティブを始めない `%%{` （[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）は、
最初の `%` に `%` が続くので、
単位が始まるところではどこでもそうしたコメントです。
字下げしていてもいなくても、それだけの行と、説明ブロックの直後がそうです。
印は字句解析器が読むとおりディレクティブのないテキストで見つけ、
値はコメント行と同じく、印の後のソースのテキストで、
ディレクティブを含みます。 [fixture: timeline/db-comment-hash-line] [fixture:
timeline/db-comment-hash-only] [fixture: timeline/db-comment-hash-line-indented]
[fixture: timeline/db-comment-hash-between-header-and-first-line] [fixture:
timeline/db-comment-hash-line-at-end] [fixture:
timeline/db-comment-percent-after-header] [fixture:
timeline/lex-percent-brace-line-after-period] [fixture:
timeline/lex-percent-brace-line-unindented] [fixture:
timeline/lex-percent-brace-after-block] [fixture:
timeline/lex-percent-comment-after-block] [fixture:
timeline/lex-hash-before-percent]

単位の中では、
`#` は period を終えてそこでコメントを始め（period はその前で止まるからです）、
ほかのどのテキストでも文字です。
`%` はどのテキストでも文字です。
`50% off` は period で、`a : % c` は event `% c` を、
`title % c` はタイトル `% c` を持ちます。
`% c` を持つ section、アクセシビリティのタイトルと説明、
説明ブロックの行も同じです。
`a %% c`、`a %%c`、`ab%% c` は period で、 `a : e %% c`、`a : e%% c`、
`a: e%% c`、`a : %%` は `%%` を含む event を持ち、タイトル、section、
アクセシビリティのタイトルと説明は、
`accDescr: d %% c` のように `%%` を文字として持ちます。 [fixture:
timeline/db-comment-percent-after-period] [fixture:
timeline/db-comment-percent-after-period-glued-no-space] [fixture:
timeline/db-comment-percent-glued-after-two-characters] [fixture:
timeline/db-event-percent] [fixture: timeline/db-comment-percent-glued-in-event]
[fixture: timeline/db-event-percent-glued] [fixture:
timeline/db-event-only-percent] [fixture: timeline/db-title-percent] [fixture:
timeline/db-section-percent] [fixture: timeline/db-acc-title-percent]
[fixture: timeline/db-period-percent-inside]
[fixture: timeline/db-event-single-percent]
[fixture: timeline/db-title-single-percent]
[fixture: timeline/db-acc-descr-percent]
[fixture: timeline/db-section-single-percent]
[fixture: timeline/db-acc-title-single-percent]
[fixture: timeline/db-acc-descr-single-percent]
[fixture: timeline/db-acc-descr-block-single-percent]

mermaid.js は `%` をもう 1 つの読み方で読みます。
それがこの規則と違うのは、単位が始まるところで、
`}` と空白以外の文字が `%%` の直前にあるときです。
mermaid.js はその文字と行の残りを 1 つのコメントとして読みます（[既知の差異](#既知の差異) を参照）。
ここでは、`%%` はその文字から始まる単位の一部か、
その文字が文法の取らない単位です。
`a%% c` はここでは period `a%% c` で、mermaid.js では何もありません。
`;%% c`、`é%% c`、ヘッダー直後の `;%% c`、
説明ブロック直後の `x%%{ }%%` も同じです。
`:%% c` は、コロンの後に空白がないのでここでは拒否され、
mermaid.js ではコメントです。
`}%% c` はどちらでも period で、
`%%` の前の `#` はどちらにもコメントを読ませます。 [fixture: timeline/db-comment-percent-after-period-glued]
[fixture: timeline/div-comment-after-period-start] [fixture:
timeline/div-comment-after-semicolon] [fixture:
timeline/div-comment-after-non-ascii-letter] [fixture:
timeline/div-comment-after-semicolon-after-header] [fixture:
timeline/div-comment-after-block-character] [fixture:
timeline/div-comment-after-colon] [fixture:
timeline/db-comment-percent-after-closing-brace] [fixture:
timeline/lex-hash-before-percent]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
`period-text` のような単位の名前はその名前の 1 つの単位を表し、
二重引用符の中のテキストは、`"title"` や `":"` のように、
そのテキストが名付ける単位を表します。
文法は [`timeline.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L49-L85) の文法を言い直したもので、
同じ単位の並びを受理します。
ただし、
mermaid.js がトークンを読まない空の説明ブロックは除きます（[空の説明ブロック](#空の説明ブロック) を参照）。
mermaid.js の文法は event を 1 つずつ読みますが、
この文法は event を木の文にまとめます。

以下の各規則は、
[ast/timeline.ja.md](../ast/timeline.ja.md) で定める木のノードを作ります。

| 規則                                                                                                                              | ノード                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `diagram`                                                                                                                         | TimelineDiagram                                                                      |
| `period-statement`                                                                                                                | TimelinePeriodStatement                                                              |
| `event-statement`                                                                                                                 | TimelineEventStatement                                                               |
| `title-statement`                                                                                                                 | TimelineTitleStatement                                                               |
| `section-statement`                                                                                                               | TimelineSectionStatement                                                             |
| `accessibility-statement`                                                                                                         | TimelineAccTitleStatement、TimelineAccDescrStatement、TimelineAccDescrBlockStatement |
| `empty-description-block`                                                                                                         | テキストのない TimelineAccDescrBlockStatement。それだけで 1 つの文                   |
| `period-text`、`event-text`、`title-text`、`section-text`、`acc-title-text`、`acc-description-text`、`acc-description-block-text` | TimelineLiteral                                                                      |

### 図と文

```text
diagram   = header line*
header    = "timeline" direction?
line      = statement | newline
statement = period-statement
          | event-statement
          | title-statement
          | section-statement
          | accessibility-statement
          | empty-description-block
```

図は、方向のあるかないかのヘッダーと、任意の数の行で、
各行は文か `newline` の単位です。
文の間を区切るものはありません。
各文は自分の最後の単位で終わり、次の文は、同じ行に空白の後でも直後でも、
それより後の行にでも続けられます。
規則 15 の `:` の単位はどの規則も取らないので、
event のテキストが続かないコロンは入力を拒否させます。 [fixture: timeline/db-header-only]
[fixture: timeline/db-direction-td]
[fixture: timeline/header-title-on-header-line] [fixture:
timeline/gram-acc-descr-block-then-period-same-line] [fixture:
timeline/db-blank-line-between-tasks] [fixture:
timeline/gram-event-colon-glued-to-event]

### period と event

```text
period-statement = period-text ( newline* event )*
event-statement  = event ( newline* event )*
event            = ":" event-text
```

period の文は、`period-text` の単位と、その後に続く event です。
各 event は `:` の単位と `event-text` の単位で、
間には `newline` の単位しかありません。
その `newline` の単位は、空行、空白の行、コメント行、
図のコメントの代わりでもあります。
period の文は、そのように続く event をすべて取ります。
`a : e1 : e2` は 2 つの event を持ち、
`a` に行 `: e1` と `: e2` が続くものも同じで、間に空行、コメント行、行 `# c`、
`%%` だけの行があっても同じです。
period は、その単位の書かれたとおりのテキストで、 Db が保つ、コロン、`#`、
改行の前の空白を含みます。
その前の空白は外にあります。 [fixture:
timeline/db-event-two-on-a-line] [fixture: timeline/db-event-own-line] [fixture:
timeline/gram-event-line-two-events] [fixture:
timeline/db-event-own-line-after-blank-line] [fixture:
timeline/db-event-own-line-after-comment-line] [fixture:
timeline/db-event-own-line-after-hash-line] [fixture:
timeline/gram-event-after-bare-percent-line] [fixture:
timeline/db-event-own-line-two-tasks] [fixture:
timeline/db-period-trailing-spaces]
[fixture: timeline/db-period-same-text-twice]

event の文は、同じように並ぶ 1 つ以上の event で、
period の文ではない文の後にあります。
タイトル、section、アクセシビリティの文、空の説明ブロックの後で、
`section S : x` のように同じ行でもかまいません。
3 行の `a`、`section S`、`: e` では `: e` が event の文です。
mermaid.js がその event をどの period に与えるかは、
tests パッケージの要約にあります。
最初の period より前の event の文は入力を拒否させます。 [fixture: timeline/db-event-own-line-after-title]
[fixture: timeline/db-event-own-line-after-acc-title]
[fixture: timeline/db-event-own-line-after-acc-descr-block]
[fixture: timeline/gram-event-after-empty-description-block]
[fixture: timeline/gram-event-after-empty-description-block-same-line]
[fixture: timeline/db-event-after-section-joins-earlier-task]
[fixture: timeline/db-section-with-event-after-task]
[fixture: timeline/gram-event-after-section-joins-last-period]
[文法の外の拒否](#文法の外の拒否) を参照してください。

### タイトルと section

```text
title-statement   = "title" title-text
section-statement = "section" section-text
```

タイトルの文のタイトルは、その `title-text` の単位の書かれたとおりのテキストで、
両端の空白も含みます。
section の文の名前は、その `section-text` の単位の書かれたとおりのテキストです。
タイトルと section の名前は繰り返してもかまいません。
mermaid.js がタイトル、フロントマターのタイトル、section を Db にどう読むかは、
tests パッケージの要約にあります。 [fixture:
timeline/db-title-statement] [fixture: timeline/db-title-twice] [fixture:
timeline/db-title-frontmatter] [fixture:
timeline/db-title-frontmatter-and-statement] [fixture:
timeline/db-section-then-title] [fixture: timeline/db-section-statement]
[fixture: timeline/db-section-twice-same-name]

### アクセシビリティの文

```text
accessibility-statement = "accTitle" ":" acc-title-text
                        | "accDescr" ":" acc-description-text
                        | "accDescr" "{" acc-description-block-text "}"
```

アクセシビリティのタイトルと説明は、 mermaid.js が取り除く両端の空白を除いた、
その単位のテキストです。
ブロックのテキストは改行を保ち、
各改行の後の空白は Db から外されます（tests パッケージの要約を参照）。
タイトルと説明は何度書いてもかまわず、
説明は行でもブロックでもかまいません。 [fixture: timeline/db-acc-title-statement]
[fixture:
timeline/db-acc-title-trailing-spaces] [fixture: timeline/db-acc-title-twice]
[fixture: timeline/db-acc-descr-statement] [fixture:
timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-blank-line]
[fixture: timeline/db-acc-descr-block-then-line] [fixture:
timeline/db-acc-descr-line-then-block] [fixture: timeline/db-acc-all-statements]

### 空の説明ブロック

```text
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位の直後に、
`acc-description-block-text` の単位なしで `}` の単位が続くものです。
`accDescr {}`、空白か空行だけのブロック、
字句解析器がテキストを読む前に取り除かれる、
ディレクティブかコメント行だけを持つブロックがそうです。
mermaid.js はそれにトークンを読みません。
それはテキストのない説明ブロックの文で、何も変えないので、
その前に書いた説明は残ります。
文の始まるところならどこにでも置けます。
それだけの行、ヘッダーの直後、別のブロックの直後、同じ行の文の前です。
その後の event は event の文です。
period、event、タイトルのテキスト、section のテキストの中では、
`accDescr {}` はテキストです。
ブロックが 1 つとして読めるところではどこでも文が始まるので、
文の中にあるブロックはなく、
既知の差異 [`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md) は、
この図種に場合を持ちません。 [fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/gram-empty-description-block-directive-only]
[fixture: timeline/gram-empty-description-block-comment-line-only]
[fixture: timeline/gram-empty-description-block-keeps-description]
[fixture: timeline/db-acc-descr-block-empty]
[fixture: timeline/gram-empty-description-block-after-header]
[fixture: timeline/gram-empty-description-blocks-then-period]
[fixture: timeline/gram-event-after-empty-description-block]
[fixture: timeline/gram-empty-description-block-in-period]
[fixture: timeline/gram-empty-description-block-in-event]
[fixture: timeline/gram-empty-description-block-in-title]
[fixture: timeline/gram-empty-description-block-in-section]

### 文法の外の拒否

mermaid.js の Db は 1 種類の入力で例外を投げ、それは拒否されます。
最初の period より前の event の文で、
[`addEvent()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L65-L70) がそれを与える period を持たないからです。
そのため、ヘッダー直後の `: e`、`timeline : b` と `timeline: x`、
`timeline TD: x`、period のないタイトルや section の後の `: e`、
どの period よりも前の `section S : x` は拒否されます。 [fixture:
timeline/gram-event-first] [fixture: timeline/header-event-on-header-line]
[fixture: timeline/header-colon-suffix] [fixture:
timeline/header-direction-then-colon] [fixture: timeline/gram-event-after-title]
[fixture: timeline/gram-event-after-section-only] [fixture:
timeline/gram-section-then-event-line] [fixture:
timeline/gram-section-with-event]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  キーワードか方向の中のディレクティブは、この仕様では入力を拒否させ、
  mermaid.js は受理します（[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  ヘッダー、方向、`title`、`section`、`accTitle`、
  `accDescr` の中です。 [fixture:
  timeline/div-directive-in-header-keyword] [fixture:
  timeline/div-directive-in-direction] [fixture:
  timeline/div-directive-in-title-keyword] [fixture:
  timeline/div-directive-in-section-keyword] [fixture:
  timeline/div-directive-in-acc-title-keyword] [fixture:
  timeline/div-directive-in-acc-descr-keyword] [fixture:
  timeline/div-directive-in-acc-descr-block-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則に合う行で、キーワードの中の無視される `;` は、
  ここでは入力を拒否させ、
  mermaid.js は `;` を取り除いて部分を 1 つとして読みます。
  規則が探す `style`、`:`、`#` は、その行の文の前の説明ブロックにあります。
  同じ行の `accDescr { style:#x }` の後の `ti;tle T`、`sec;tion S`、
  `accTi;tle: T` は、 `;` のない文として読まれます。
  テキストの単位の中では、
  mermaid.js の読みを保ちます（[単位の間のトリビア](#単位の中のディレクティブ) を参照）。 [fixture:
  timeline/div-ignored-semicolon-in-title-keyword] [fixture:
  timeline/div-ignored-semicolon-in-section-keyword] [fixture:
  timeline/div-ignored-semicolon-in-acc-title-keyword] [fixture:
  timeline/tokens-ignored-semicolon-in-period]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)。**
  単位の最初の文字、つまり `}` と空白以外の文字の直後の `%%` は、
  ここでは [コメント](#コメント) のとおりに読まれます。
  コメントは単位が始まるところでだけ始まるので、 `%%` はその単位の一部か、
  その前の文字が文法の取らない単位です。
  mermaid.js はその文字と行の残りを 1 つのコメントとして読みます。
  差異は両方向です。
  `a%% c`、`;%% c`、`é%% c`、`timeline;%% c`、説明ブロック直後の `x%%{ }%%` は、
  ここでは period で、mermaid.js では何もありません。
  `:%% c` はここでは拒否され、mermaid.js は受理します。 [fixture:
  timeline/db-comment-percent-after-period-glued] [fixture:
  timeline/div-comment-after-period-start] [fixture:
  timeline/div-comment-after-semicolon] [fixture:
  timeline/div-comment-after-non-ascii-letter] [fixture:
  timeline/div-comment-after-semicolon-after-header] [fixture:
  timeline/div-comment-after-block-character] [fixture:
  timeline/div-comment-after-colon]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこか、event、period、タイトル、section の中の `C4Container`、
  `C4Component`、`C4Dynamic`、`C4Deployment` は、
  mermaid.js にテキストを C4 の構文解析器へ渡させ、それが拒否します。
  ここではテキストは timeline です。
  `C4Context` はどちらでもテキストです。 [fixture: timeline/div-c4-keyword-in-event]
  [fixture: timeline/div-c4-keyword-in-period] [fixture:
  timeline/div-c4-keyword-in-title] [fixture:
  timeline/div-c4-keyword-in-section]
  [fixture: timeline/lex-c4context-in-period]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
  そうした行の後の空白だけの行は、ここではコメントか何もないもので、
  mermaid.js は入力を拒否します。
  その字句解析器が `%%` の後の改行を、
  ヘッダーの前の `newline` の単位として読むからです（[検出](#検出) を参照）。 [fixture: timeline/header-after-bare-percent-line]
  [fixture: timeline/header-after-empty-braces-line] [fixture:
  timeline/header-after-bare-percent-line-and-whitespace-line]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、 period
  `A b="c">d` は mermaid.js では `A b='c'>d` で、
  ここではフロントマターでタグを探さないので引用符はそのままです。
  どちらも入力を受理し、Db が違います。
  フロントマターがなければ、`A <a b="c">d` のようにテキストで始まるタグは、
  どちらも同じに読みます。 [fixture: timeline/div-html-tag-starts-in-frontmatter-period]
  [fixture:
  timeline/lex-html-tag-in-period]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.js は拒否します。 [fixture: timeline/div-frontmatter-invalid-yaml]

既知の差異 [`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md) と、
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.ja.md) は、
この図種には場合がありません。
`%%` の前の改行を取る mermaid.js のコメントは何も変えません。
文法は文の間に改行を要らないからです。
単位が始まるところの `%%{` はどちらでもコメントです（[コメント](#コメント) を参照）。
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md) の場合もありません（[空の説明ブロック](#空の説明ブロック) を参照）。

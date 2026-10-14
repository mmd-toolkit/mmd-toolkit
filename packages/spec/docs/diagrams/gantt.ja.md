# Gantt

英語版: [gantt.md](./gantt.md)

mermaid.js での正本:

- [`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison)
- [`ganttDb.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js)
- [`gantt/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt)
  のテスト（`*.spec.js`）

この文書は、図種 `gantt`、ガントチャートを扱います。
木のノードは [ast/gantt.ja.md](../ast/gantt.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 11 がこの文法を選びます。
テキストが、空白の後、ちょうどこの大文字小文字の `gantt` で始まるときです
（[`ganttDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDetector.ts#L9-L11)）。
`GANTT` はガントチャートではなく、どの検出器にも合いません。
[fixture: gantt/header-only] [fixture: gantt/header-leading-whitespace]
[fixture: gantt/header-upper-case]

その後、字句解析器がヘッダーをもう一度、大文字小文字を区別せず、
語の文字が続かない形で読みます（[文の文脈](#文の文脈) を参照）。
そのため `gantt2` はガントチャートとして検出されて拒否され、
`gantt-x : 1d` はヘッダーとタスク `-x ` です。
文はヘッダーと同じ行に、空白を挟んでも挟まなくても続けられ、
ヘッダーだけの入力も、後ろに改行がなくても受理されます。
`gantt:` と `gantt#` は拒否されます。
ヘッダーの後の `:` は文法の取らない単位で、
`#` はデータのないタスクのテキストだからです。
[fixture: gantt/header-digit-suffix] [fixture: gantt/header-dash-suffix-task]
[fixture: gantt/header-statement-same-line] [fixture:
gantt/header-tab-then-task] [fixture: gantt/header-only] [fixture:
gantt/header-line-feed-only] [fixture: gantt/header-crlf] [fixture:
gantt/header-cr-only] [fixture: gantt/header-colon] [fixture:
gantt/header-hash]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行です。
検出はそれを読んで通り過ぎてヘッダーを見つけ、
その行はどの図種でもそうであるように、ここでは印 `%%` の図のコメントです
（[図種の検出](../common.ja.md#図種の検出) を参照）。
コメントはどのノードにも属さず、GanttDiagram はヘッダーから始まります。
mermaid.js はどちらの場合も入力を拒否し、
`%%` だけの行の後に空白だけの行があるときも拒否します。
その字句解析器は `%%` をコメントとして読みますが、
その後の改行を `newline` の単位として読み、
文法はヘッダーの前でそれを取らないからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
`%%` に空白が続く行はコメント行で、検出の前に除かれ、`%% c` の行も同じです。
ヘッダーの前の行のディレクティブと、ヘッダーの直後の同じ行のディレクティブは、
ディレクティブであってそれ以外ではありません。
ヘッダーの前の空の説明ブロックはテキストの最初の単位なので、
どの検出器にも合いません。
[fixture: gantt/header-after-bare-percent-line] [fixture:
gantt/header-after-empty-braces-line] [fixture:
gantt/header-after-bare-percent-line-and-whitespace-line] [fixture:
gantt/header-after-percent-space-line] [fixture:
gantt/header-after-comment-line] [fixture: gantt/header-after-directive-line]
[fixture: gantt/header-then-directive-same-line] [fixture:
gantt/header-after-empty-description-block]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を
[変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして読み、
コメント領域と、行の規則が無視する `;` は、ないものとして読み通します。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）は
図のテキストの一部です。
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4、
この図独自の単位の規則を述べます。

この図の mermaid.js の字句解析器は、
文字を大文字小文字を区別せずに比べます
（[表記](../common.ja.md#表記) を参照）。
`DATEFORMAT YYYY`、`TITLE T`、`WEEKDAY MONDAY`、`ACCTITLE: T`、
`ACCDESCR { D }`、`CLICK id1 CALL f() HREF "u"` は小文字の語と同じに読まれ、
どの大文字小文字で書いた曜日名も、小文字の曜日を設定します。
テキストは書かれた大文字小文字を保ち、
click の id はタスクの id と書かれたとおりに比べられます。
[fixture: gantt/lex-keywords-upper-case] [fixture:
gantt/lex-acc-keywords-upper-case] [fixture:
gantt/lex-acc-descr-block-upper-case] [fixture:
gantt/lex-click-keywords-upper-case] [fixture: gantt/lex-day-mixed-case]
[fixture: gantt/lex-click-upper-case-id-kept]
以下で**キーワード**とは、大文字小文字を区別せずに一致する語で、
規則がそう言うところでは語の文字が続かないもの
（[表記](../common.ja.md#表記) を参照）、
規則がそう言うところでは空白が続くものです。
`gantt2` はヘッダーを持たず、
`inclusiveEndDatesx`、`topAxisx`、`weekday mondayx` はタスクのテキストで、
`titles`、`title-x`、`clickx`、`hrefx`、`callx` も、
語の後に空白が続かないのでタスクのテキストです
（[キーワードとその後に続くもの](#文の文脈) を参照）。
[fixture: gantt/header-digit-suffix] [fixture:
gantt/lex-inclusive-word-suffix-task] [fixture:
gantt/lex-topaxis-word-suffix-task] [fixture:
gantt/lex-weekday-word-suffix-task] [fixture: gantt/lex-title-word-suffix-task]
[fixture: gantt/lex-title-dash-task] [fixture: gantt/lex-click-word-suffix-task]
[fixture: gantt/lex-href-word-suffix-task] [fixture:
gantt/lex-call-word-suffix-task]

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

テキストは、文の文脈でだけ終われます。
タイトルの文脈、説明の文脈、説明ブロックの文脈、click の文脈、href の文脈、
コールバック名の文脈、コールバック引数の文脈で終わると、入力は拒否されます。
そのため、後ろに何もない `accTitle:`（コロンの後に空白や改行があっても）、
後ろに何もない `accDescr:`、`}` のない `accDescr {`
（後ろにテキストがあってもなくても）、テキストの終わりの `click id1`、
テキストの終わりの `click` と空白、閉じる引用符のない `href "u`、
`(` のない `call f`、`)` のない `call f(1` は拒否されます。
後ろに行が続いても同じです。これらの文脈の規則は改行を読むからです。
`click id1` に改行が続くものは、終わりでは文の文脈にあり、
click の文に部分がないので文法が拒否します。
[fixture: gantt/lex-acc-title-at-end] [fixture:
gantt/lex-acc-title-space-at-end] [fixture:
gantt/lex-acc-title-line-feed-at-end] [fixture: gantt/lex-acc-descr-at-end]
[fixture: gantt/lex-acc-descr-block-unclosed] [fixture:
gantt/lex-acc-descr-block-unclosed-lines] [fixture: gantt/lex-click-id-at-end]
[fixture: gantt/lex-click-whitespace-at-end] [fixture: gantt/lex-href-unclosed]
[fixture: gantt/lex-href-unclosed-lines] [fixture:
gantt/lex-callback-name-at-end] [fixture:
gantt/lex-callback-name-at-end-lines] [fixture:
gantt/lex-callback-arguments-unclosed] [fixture:
gantt/lex-callback-arguments-unclosed-lines] [fixture:
gantt/lex-click-id-line-feed-at-end]

**空白。** この文書の空白は [表記](../common.ja.md#表記) の集合です。
U+00A0、U+2028、U+3000、U+FEFF、垂直タブ、改ページは、
規則が空白を読むところではどこでも空白で、
規則がそう言うところでは改行も空白です。
文の文脈では、単位の始まる位置の 1 つ以上の改行の並びは `newline` の単位で
（規則 5）、それ以外の空白の並びは、改行を含めて、
単位の一部にならずに単位の間にあります（規則 6）。
`gantt`、U+00A0、`title T` はヘッダーとタイトルで、
U+00A0 の代わりに U+2028 でも同じです。
キーワードの規則は、それぞれが言うとおりに自分で空白を読み、
文のテキストは空白を自分の文字として取ります。
タスクのテキストの前の U+3000 は空白で、
コロンの前の U+3000 はテキストの文字です。
タスクのデータの中の改ページはデータの文字で、
タスクの前の U+FEFF は空白です。
[fixture: gantt/lex-whitespace-nbsp-between-units] [fixture:
gantt/lex-whitespace-line-separator-between-units] [fixture:
gantt/lex-whitespace-ideographic-space-around-task] [fixture:
gantt/lex-whitespace-vertical-tab-before-task] [fixture:
gantt/lex-whitespace-form-feed-in-data] [fixture:
gantt/lex-whitespace-bom-before-task] [fixture: gantt/lex-newline-runs]
[fixture: gantt/lex-space-then-line-feeds-then-task] [fixture:
gantt/lex-task-text-tab-at-end]

**エンティティ。** エンティティは、字句解析器がテキストを読む前に、
そのプレースホルダーとして読まれ
（[エンティティ](../common.ja.md#エンティティ) を参照）、
プレースホルダーは ASCII の外の文字でできているので、
その `#` と `;` は設定のテキストやタスクのデータを終えず、
Db はプレースホルダーを持ちます。
`a#amp; : 1d` は、説明が `a`、プレースホルダー、空白のタスクで、
`title #x;` はプレースホルダーをタイトルに持ち、
`dateFormat X#y;` は `X` とプレースホルダーを持ちます。
プレースホルダーの後の `#` や `;` は、いつもどおりテキストを終えます。
[fixture: gantt/entity-placeholder-in-task-text] [fixture:
gantt/entity-placeholder-in-title] [fixture:
gantt/entity-placeholder-in-href-string] [fixture:
gantt/entity-placeholder-in-click-id] [fixture:
gantt/entity-placeholder-in-task-data] [fixture: gantt/lex-dateformat-entity]
[fixture: gantt/lex-dateformat-entity-then-hash] [fixture:
gantt/entity-placeholder-then-semicolon-in-data] [fixture:
gantt/lex-todaymarker-entity]
HTML タグの属性の引用符は、どの図種でも同じく `'` として読まれます
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
`title` `<b a="x">t</b>` は `a='x'` を持つタイトルで、
タグの外の引用符は引用符のままです。
[fixture: gantt/lex-html-tag-in-title] [fixture:
gantt/lex-quotes-in-task-text-with-frontmatter-tag]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを除いた後のテキストを読むのと同じに読みます。
そこで
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が単位に当てはまります。
テキストの単位と文字列の単位の中のディレクティブは mermaid.js の読みを保ち、
名前の単位を含むそれ以外の単位の中のディレクティブは入力を拒否させます。
**名前の単位**は、click の文脈の `id` と、
`includes` と `excludes` の文の `list-item` です。
**テキストの単位**は、`setting-text`、`marker-text`、`title-text`、
`section-text`、`task-text`、`data-item`、`callback-name`、
`callback-arguments`、`acc-title-text`、`acc-description-text`、
`acc-description-block-text` です。
唯一の**文字列の単位**は `url-text` です。

- `a%%{init: {}}%%b : 1d` はタスク `ab `、
  `a : 1%%{init: {}}%%d` は終わり `1d`、
  `title a%%{init: {}}%%b` はタイトル `ab`、
  `section S%%{init: {}}%%T` は section `ST`、
  `dateFormat YY%%{init: {}}%%YY` は書式 `YYYY`、
  `accTitle: a%%{init: {}}%%b` はアクセシビリティのタイトル `ab` で、
  `accDescr { a%%{init: {}}%%b }` の説明も同じです。
  `click id1 href` `"u%%{init: {}}%%v"` は URL `uv`、
  `call f%%{init: {}}%%g()` はコールバック `fg`、
  `call f(1%%{init: {}}%%2)` は引数 `12` で、mermaid.js と同じです。
  [fixture: gantt/lex-directive-in-task-text] [fixture:
  gantt/lex-directive-in-task-data] [fixture: gantt/lex-directive-in-title-text]
  [fixture: gantt/lex-directive-in-section-text] [fixture:
  gantt/lex-directive-in-setting-text] [fixture:
  gantt/lex-directive-in-acc-title] [fixture:
  gantt/lex-directive-in-acc-descr-block] [fixture:
  gantt/lex-directive-in-href-string] [fixture:
  gantt/lex-directive-in-callback-name] [fixture:
  gantt/lex-directive-in-callback-arguments]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `a : 1d%%{init: {}}%%, 2d`、`title %%{init: {}}%%T`、
  `title%%{init: {}}%% T`、`weekday %%{init: {}}%%monday`、
  `click %%{init: {}}%%id1 href "u"`、`href %%{init: {}}%%"u"`、
  `call f%%{init: {}}%%()`、`call f(%%{init: {}}%%1)`、
  `accTitle%%{init: {}}%%: T`、`accDescr %%{init: {}}%%{ d }`、
  `a :%%{init: {}}%% 1d`、行の続く `gantt%%{init: {}}%%` は、
  ディレクティブがないものとして読まれます。
  [fixture: gantt/lex-directive-between-items] [fixture:
  gantt/lex-directive-between-title-and-text] [fixture:
  gantt/lex-directive-between-title-and-whitespace] [fixture:
  gantt/lex-directive-between-weekday-and-day] [fixture:
  gantt/lex-directive-between-click-and-id] [fixture:
  gantt/lex-directive-between-href-and-quote] [fixture:
  gantt/lex-directive-between-callback-name-and-parenthesis] [fixture:
  gantt/lex-directive-after-opening-parenthesis] [fixture:
  gantt/lex-directive-between-acc-title-and-colon] [fixture:
  gantt/lex-directive-between-acc-descr-and-brace] [fixture:
  gantt/lex-directive-after-task-colon] [fixture:
  gantt/header-then-directive-same-line]
- `click id%%{init: {}}%%1 href "u"` と `excludes week%%{init: {}}%%ends` では
  ディレクティブが名前の単位の中にあり、`ga%%{init: {}}%%ntt`、
  `ti%%{init: {}}%%tle T`、`sec%%{init: {}}%%tion S`、
  `date%%{init: {}}%%Format X`、`inclusive%%{init: {}}%%EndDates`、
  `week%%{init: {}}%%day monday`、`weekday mon%%{init: {}}%%day`、
  `cli%%{init: {}}%%ck`、`hr%%{init: {}}%%ef`、`ca%%{init: {}}%%ll`、
  `acc%%{init: {}}%%Title:`、`acc%%{init: {}}%%Descr {` では
  キーワードの中にあります。
  入力は拒否され、mermaid.js は 2 つの部分を 1 つとして読んで受理します
  （[既知の差異](#既知の差異) を参照）。
  [fixture: gantt/div-directive-in-click-id] [fixture:
  gantt/div-directive-in-list-item] [fixture:
  gantt/div-directive-in-header-keyword] [fixture:
  gantt/div-directive-in-title-keyword] [fixture:
  gantt/div-directive-in-section-keyword] [fixture:
  gantt/div-directive-in-dateformat-keyword] [fixture:
  gantt/div-directive-in-inclusive-keyword] [fixture:
  gantt/div-directive-in-weekday-keyword] [fixture:
  gantt/div-directive-in-day-keyword] [fixture:
  gantt/div-directive-in-click-keyword] [fixture:
  gantt/div-directive-in-href-keyword] [fixture:
  gantt/div-directive-in-call-keyword] [fixture:
  gantt/div-directive-in-acc-title-keyword] [fixture:
  gantt/div-directive-in-acc-descr-keyword]

**単位の間のトリビア。** [common.ja.md](../common.ja.md) のトリビアは、
この図の単位と次のように出会います。
単独の CR は行終端で、改行として読まれます
（[行終端](../common.ja.md#行終端) を参照）。
ヘッダー、タイトル、section、タスクは、
単独の CR の間でも CRLF の改行の間でも、改行の間と同じに読まれ、
click の id の後の単独の CR は、改行と同じく click の文脈を出ます。
[fixture: gantt/header-cr-only] [fixture: gantt/lex-title-cr-value] [fixture:
gantt/lex-section-cr-value] [fixture: gantt/header-crlf] [fixture:
gantt/lex-title-crlf-value] [fixture: gantt/lex-section-crlf-value] [fixture:
gantt/tokens-cr-only-click-parts]
2 つの単位の間の閉じたディレクティブは何もないものとして読まれ、
その周りの空白は文脈の規則で読まれます。
タスク、タイトル、section の行の終わりの閉じたディレクティブは、
テキストの後にあってもテキストにくっついていても何も終えず、
次の行はいつもどおり読まれます。
その前の空白はタイトルのテキストや section のテキストの文字なので、
`title T %%{init: {}}%%` はタイトル `T `、
`section S %%{init: {}}%%` は section `S ` を持ち、
テキストにくっつけると `T` と `S` を持ちます。
[fixture: gantt/lex-directive-at-end-of-data-line] [fixture:
gantt/lex-directive-glued-at-end-of-data] [fixture:
gantt/lex-directive-at-end-of-title-line] [fixture:
gantt/lex-directive-glued-at-end-of-title] [fixture:
gantt/lex-directive-at-end-of-section-line] [fixture:
gantt/lex-directive-glued-at-end-of-section]
閉じていないディレクティブはテキストの残りを取ります
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置)
を参照）。
`a : 1d %%{init: {}` に行 `b : 2d` が続くものは、終わりが `1d` の
1 つのタスク `a ` を持ち、
`gantt`、行 `%%{init: {}`、行 `a : 1d` はタスクを持たず、
タスクの行が続く `title T %%{init: {}` はタイトル `T ` を持ち、
タスクを持ちません。
[fixture: gantt/tokens-unclosed-directive-in-data-line] [fixture:
gantt/tokens-unclosed-directive-after-header] [fixture:
gantt/tokens-unclosed-directive-in-title]
コメント行は、字句解析器がテキストを読む前に除かれます。
説明ブロックの中、複数行にわたるコールバック引数や URL 文字列の中、
キーワードとその後に続くものの間でも同じです。
`title`、コメント行、`T` はタイトル `T` を持ち、
`weekday` と `monday`、`dateFormat` と `YYYY`、`accTitle:` と `T` も同じです。
`click id1`、コメント行、`href "u"` はリンクを設定します。
id の後の改行が click の文脈を出るからです。
`click id1 href "u"`、コメント行、`call f()` は拒否されます。
文字列の後の改行が `newline` の単位だからです。
コメント行だけを持つブロックは空の説明ブロックです。
[fixture: gantt/tokens-comment-line-in-acc-block] [fixture:
gantt/tokens-comment-line-only-in-acc-block] [fixture:
gantt/tokens-comment-line-in-callback-arguments] [fixture:
gantt/tokens-comment-line-in-href-string] [fixture:
gantt/tokens-comment-line-after-title-keyword] [fixture:
gantt/tokens-comment-line-after-weekday] [fixture:
gantt/tokens-comment-line-after-dateformat] [fixture:
gantt/tokens-comment-line-after-acc-title-colon] [fixture:
gantt/tokens-comment-line-after-click-id] [fixture:
gantt/tokens-comment-line-between-click-parts]
`style` の規則に合う行
（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行)
を参照）では、無視される `;` は読み通されます。
タイトルのテキスト、タスクのテキスト、タスクのデータ、コールバック名、
コールバック引数、URL 文字列、アクセシビリティのタイトル、説明ブロックの中では、
2 つの部分が mermaid.js と同じく 1 つとして読まれ、
キーワードとその空白の間や、URL 文字列の後でも同じです。
`todayMarker` のテキストやタスクのデータを終えるはずの `;` は代わりに無視され、
テキストは続きます。
`;` がその行の最後のものでないときは無視されず、
その前の `#` はエンティティを作ります。
キーワード、click の id、リストの項目の中では、
無視される `;` は入力を拒否させ、mermaid.js は受理します
（[既知の差異](#既知の差異) を参照）。
[fixture: gantt/tokens-ignored-semicolon-in-title-text] [fixture:
gantt/tokens-ignored-semicolon-in-task-text] [fixture:
gantt/tokens-ignored-semicolon-in-task-data] [fixture:
gantt/tokens-ignored-semicolon-in-callback-name] [fixture:
gantt/tokens-ignored-semicolon-in-callback-arguments] [fixture:
gantt/tokens-ignored-semicolon-in-href-string] [fixture:
gantt/tokens-ignored-semicolon-in-acc-title] [fixture:
gantt/tokens-ignored-semicolon-in-acc-block] [fixture:
gantt/tokens-ignored-semicolon-between-keyword-and-text] [fixture:
gantt/tokens-ignored-semicolon-after-href-string] [fixture:
gantt/tokens-ignored-semicolon-todaymarker] [fixture:
gantt/tokens-ignored-semicolon-two-tasks] [fixture:
gantt/tokens-ignored-semicolon-first-of-two-in-title] [fixture:
gantt/tokens-ignored-semicolon-in-section-text] [fixture:
gantt/lex-semicolon-not-ignored-in-click-id]

### 文の文脈

文の文脈では、字句解析器は次の規則をこの順に試します。

1. `accTitle`、改行を含む 0 個以上の空白文字、`:`、
   改行を含む 0 個以上の空白文字: `accTitle` の単位と `:` の単位。
   タイトルの文脈に入ります。
   [fixture: gantt/gram-acc-title] [fixture: gantt/lex-acc-title-no-space]
   [fixture: gantt/lex-acc-title-spaces-around-colon] [fixture:
   gantt/lex-acc-title-line-feed-before-colon] [fixture:
   gantt/gram-acc-title-line-feed-then-text]
2. `accDescr`、改行を含む 0 個以上の空白文字、`:`、
   改行を含む 0 個以上の空白文字: `accDescr` の単位と `:` の単位。
   説明の文脈に入ります。
   [fixture: gantt/gram-acc-descr] [fixture:
   gantt/gram-acc-descr-line-feed-then-text]
3. `accDescr`、改行を含む 0 個以上の空白文字、`{`、
   改行を含む 0 個以上の空白文字: `accDescr` の単位と `{` の単位。
   説明ブロックの文脈に入ります。
   [fixture: gantt/gram-acc-descr-block] [fixture:
   gantt/lex-acc-descr-block-no-space] [fixture:
   gantt/lex-acc-descr-block-spaces] [fixture:
   gantt/lex-acc-descr-block-line-feed-before-brace]
4. `%`: `%` から行の終わりまでの図のコメント（[コメント](#コメント) を参照）。
   [fixture: gantt/lex-percent-comment-after-unit] [fixture:
   gantt/lex-single-percent-comment-glued]
5. 1 つ以上の改行: `newline` の単位。[fixture: gantt/lex-newline-runs]
6. 改行を含む 1 つ以上の空白文字: 何もなし。
   [fixture: gantt/lex-space-then-line-feeds-then-task]
7. `href`、改行を含む 1 つ以上の空白文字、`"`: `href` の単位と `"` の単位。
   href の文脈に入ります。
   [fixture: gantt/gram-click-href] [fixture:
   gantt/lex-href-line-feed-before-quote] [fixture:
   gantt/lex-href-two-spaces-before-quote]
8. `call` と改行を含む 1 つ以上の空白文字: `call` の単位。
   コールバック名の文脈に入ります。
   [fixture: gantt/gram-click-call] [fixture:
   gantt/lex-call-line-feed-before-name]
9. `click` と改行を含む 1 つ以上の空白文字: `click` の単位。
   click の文脈に入ります。
   [fixture: gantt/gram-click-href] [fixture: gantt/lex-click-line-feed-id]
   [fixture: gantt/lex-click-tab-separators] [fixture:
   gantt/lex-click-double-spaces]
10. キーワード `gantt`: `header` の単位。[fixture: gantt/header-only]
11. `dateFormat`、改行を含む 1 つの空白文字、
    `#`、`;`、改行以外の 1 つ以上の文字: `dateFormat` の単位と
    `setting-text` の単位。
    そのテキストは、1 つの空白文字の後の文字です。
    [fixture: gantt/db-date-format] [fixture: gantt/lex-dateformat-two-spaces]
    [fixture: gantt/lex-dateformat-tab] [fixture:
    gantt/lex-dateformat-line-feed-value] [fixture: gantt/lex-dateformat-hash]
    [fixture: gantt/lex-dateformat-semicolon] [fixture:
    gantt/lex-dateformat-trailing-spaces]
12. キーワード `inclusiveEndDates`: `inclusiveEndDates` の単位。
    [fixture: gantt/db-inclusive-end-dates]
13. キーワード `topAxis`: `topAxis` の単位。
    [fixture: gantt/db-top-axis-statement]
14. `axisFormat`、1 つの空白文字、`#`、`;`、改行以外の 1 つ以上の文字
    （規則 11 と同じ）: `axisFormat` の単位と `setting-text` の単位。
    [fixture: gantt/db-axis-format] [fixture: gantt/lex-axisformat-hash]
    [fixture: gantt/db-axis-format-ends-at-semicolon]
    [fixture: gantt/lex-axisformat-line-feed-value]
15. `tickInterval`、1 つの空白文字、`#`、`;`、改行以外の 1 つ以上の文字:
    `tickInterval` の単位と `setting-text` の単位。
    [fixture: gantt/db-tick-interval]
    [fixture: gantt/lex-tickinterval-semicolon]
    [fixture: gantt/db-tick-interval-ends-at-hash] [fixture:
    gantt/lex-tickinterval-line-feed-value]
16. `includes`、1 つの空白文字、**リストのテキスト**
    （`#`、`;`、改行以外の 1 つ以上の文字）: `includes` の単位と、
    リストのテキストの単位。
    各 `,` が `,` の単位、空白でも `,` でもない文字の極大の並びのそれぞれが
    `list-item` の単位で、リストのテキストの空白はどの単位にも属しません。
    空白だけのリストのテキストは単位を持ちません。
    [fixture: gantt/db-includes-tokens] [fixture:
    gantt/lex-excludes-commas-and-spaces] [fixture:
    gantt/lex-excludes-empty-items] [fixture:
    gantt/lex-excludes-whitespace-value] [fixture:
    gantt/lex-excludes-nbsp-separator] [fixture:
    gantt/lex-includes-line-separator-separator] [fixture:
    gantt/lex-includes-hash] [fixture: gantt/db-includes-ends-at-semicolon]
    [fixture:
    gantt/lex-includes-line-feed-value]
17. `excludes`、1 つの空白文字、リストのテキスト（規則 16 と同じ）:
    `excludes` の単位とリストのテキストの単位。
    [fixture: gantt/db-excludes-tokens] [fixture: gantt/lex-excludes-semicolon]
    [fixture: gantt/db-excludes-ends-at-hash]
    [fixture: gantt/lex-excludes-line-feed-value] [fixture:
    gantt/lex-excludes-tab-value]
18. `todayMarker`、1 つの空白文字、`;` と改行以外の 1 つ以上の文字:
    `todayMarker` の単位と `marker-text` の単位。
    そのテキストは `#` を含めます。
    [fixture: gantt/db-today-marker] [fixture: gantt/lex-todaymarker-hash]
    [fixture: gantt/db-today-marker-holds-hash]
    [fixture: gantt/lex-todaymarker-semicolon] [fixture:
    gantt/lex-todaymarker-line-feed-value]
19. `weekday`、改行を含む 1 つ以上の空白文字、キーワード `monday`、`tuesday`、
    `wednesday`、`thursday`、`friday`、`saturday`、`sunday` のどれか:
    `weekday` の単位と `day` の単位。
    [fixture: gantt/db-weekday-last-wins] [fixture: gantt/spec-gantt-d1ffa392]
    [fixture: gantt/spec-gantt-7eb2ae90] [fixture: gantt/spec-gantt-76da20a3]
    [fixture: gantt/spec-gantt-a1618573] [fixture: gantt/spec-gantt-1635143f]
    [fixture: gantt/spec-gantt-b5307717] [fixture: gantt/lex-weekday-two-spaces]
    [fixture: gantt/lex-weekday-line-feed] [fixture:
    gantt/lex-weekday-blank-lines] [fixture: gantt/lex-weekday-tab] [fixture:
    gantt/lex-weekday-nbsp] [fixture: gantt/lex-weekday-line-separator]
    [fixture: gantt/lex-weekday-unknown-day] [fixture:
    gantt/lex-weekday-day-prefix]
20. `weekend`、改行を含む 1 つ以上の空白文字、キーワード `friday` と
    `saturday` のどちらか: `weekend` の単位と `day` の単位。
    [fixture: gantt/db-weekend-friday] [fixture: gantt/db-weekend-saturday]
    [fixture: gantt/lex-weekend-line-feed] [fixture:
    gantt/lex-weekend-upper-case] [fixture: gantt/lex-weekend-sunday] [fixture:
    gantt/lex-weekend-monday]
21. 4 桁の数字、`-`、2 桁の数字、`-`、2 桁の数字で、語の文字が続かないもの:
    `date` の単位。文法のどの規則も取りません。
    [fixture: gantt/lex-date-line] [fixture: gantt/lex-date-only-line]
    [fixture: gantt/lex-date-colon] [fixture: gantt/lex-date-after-tab]
    [fixture: gantt/lex-date-dash-suffix] [fixture:
    gantt/lex-date-digit-suffix-task] [fixture: gantt/lex-date-short-task]
22. `title`、改行を含む 1 つの空白文字、改行以外の 1 つ以上の文字:
    `title` の単位と `title-text` の単位。
    そのテキストは、1 つの空白文字の後から行の終わりまでの文字で、
    `:`、`#`、`;`、`%%` を含めます。
    [fixture: gantt/db-title-statement] [fixture: gantt/lex-title-two-spaces]
    [fixture: gantt/lex-title-tab] [fixture: gantt/lex-title-vertical-tab]
    [fixture: gantt/lex-title-ideographic-space] [fixture:
    gantt/lex-title-line-feed-value] [fixture:
    gantt/lex-title-hash-semicolon-percent] [fixture:
    gantt/lex-title-colon-inside] [fixture: gantt/lex-title-trailing-spaces]
    [fixture: gantt/lex-title-then-text-same-line]
23. `accDescription`、1 つの空白文字、`#`、`;`、改行以外の 1 つ以上の文字:
    `accDescription` の単位。文法のどの規則も取りません。
    [fixture: gantt/lex-acc-description]
24. `section`、改行を含む 1 つの空白文字、改行以外の 1 つ以上の文字:
    `section` の単位と `section-text` の単位。
    そのテキストは、1 つの空白文字の後から行の終わりまでの文字です。
    [fixture: gantt/db-sections] [fixture: gantt/lex-section-two-spaces]
    [fixture: gantt/lex-section-tab] [fixture:
    gantt/lex-section-line-feed-value] [fixture: gantt/lex-section-hash-colon]
    [fixture: gantt/lex-section-trailing-spaces]
25. `:` と改行以外の 1 つ以上の文字: `task-text` の単位。
    [fixture: gantt/gram-task] [fixture: gantt/lex-task-text-keyword-inside]
    [fixture: gantt/lex-task-text-quotes] [fixture: gantt/lex-task-text-brace]
    [fixture: gantt/lex-task-hash-line-start] [fixture:
    gantt/lex-task-text-nbsp] [fixture: gantt/lex-task-text-line-separator]
    [fixture: gantt/lex-task-text-paragraph-separator] [fixture:
    gantt/lex-task-text-tab-inside] [fixture:
    gantt/lex-task-text-trailing-spaces]
26. `:` と**データのテキスト**（`#`、`;`、改行以外の 1 つ以上の文字）:
    `:` の単位と、データのテキストの単位。
    各 `,` が `,` の単位で、`:`、各コンマ、終わりの間のデータのテキストの
    区間のそれぞれについて、その区間から両端の空白を除いたものをテキストとする
    `data-item` の単位、区間が空白だけのときは単位なしです。
    [fixture: gantt/gram-task] [fixture: gantt/gram-task-no-whitespace]
    [fixture: gantt/lex-task-two-colons] [fixture: gantt/lex-task-double-colon]
    [fixture: gantt/lex-task-hash-in-data] [fixture:
    gantt/lex-task-semicolon-in-data] [fixture:
    gantt/lex-task-data-to-end-of-line] [fixture:
    gantt/lex-task-data-whitespace-only] [fixture:
    gantt/lex-task-data-leading-tab] [fixture:
    gantt/lex-task-data-line-separator-item] [fixture:
    gantt/lex-task-items-nbsp-trimmed] [fixture: gantt/gram-task-empty-items]
27. `:`: `:` の単位。文法のどの規則も取りません。
    [fixture: gantt/lex-task-colon-only] [fixture: gantt/lex-task-colon-at-end]
    [fixture: gantt/lex-task-hash-after-colon]

改行と `:` 以外のどの文字もタスクのテキストの文字なので、
独自の単位として残る文字はなく、行を拒否するのは文法だけです。
データのないタスクのテキスト（`a`、`#`、`}`、`title2 T`）、`date` の単位、
`accDescription` の単位、`:` の単位です。
[fixture: gantt/lex-task-text-only] [fixture: gantt/lex-task-hash-line]
[fixture: gantt/lex-task-brace-line] [fixture: gantt/lex-title-digit-suffix]
[fixture: gantt/lex-date-line] [fixture: gantt/lex-acc-description] [fixture:
gantt/lex-task-colon-only]
順序の帰結をいくつか挙げます。

- 単位の始まる位置の `%` は、その行の単位の直後でも、常にコメントです。
  テキストの中ではテキストの文字です（[コメント](#コメント) を参照）。
  日付で始まる行は拒否され、その行のほかのテキストの後の日付や、
  タイトルの中の日付はテキストです。
  [fixture: gantt/lex-single-percent-comment-glued] [fixture:
  gantt/lex-percent-comment-in-title-text] [fixture: gantt/lex-date-line]
  [fixture: gantt/lex-date-in-task-text] [fixture: gantt/lex-date-in-title]
- 文は改行ではなく自分の単位で終わります。
  `newline` の単位は文法にとってそれだけで 1 つの行で、
  複数の文が 1 つの行を共有できます。
  `weekday monday inclusiveEndDates a : 1d`、`inclusiveEndDates title T`、
  `weekday monday title T`、`accDescr { d } a : 1d`、
  `click id1 href "u" b : 1d` などです。
  一方、タイトルのテキスト、section のテキスト、タスクのデータは
  行の残りを取るので、`title T a : 1d` はタイトル `T a : 1d` で、
  `a : 1d weekday monday` は終わり `1d weekday monday` を持ちます。
  [fixture: gantt/gram-statements-same-line] [fixture:
  gantt/lex-inclusive-then-title-same-line] [fixture:
  gantt/lex-weekday-then-title-same-line] [fixture:
  gantt/gram-acc-descr-block-then-task-same-line] [fixture:
  gantt/gram-click-href-then-task-same-line] [fixture:
  gantt/lex-title-then-text-same-line] [fixture:
  gantt/gram-task-then-weekday-same-line] [fixture:
  gantt/gram-empty-lines-and-indentation]
- 空白の単位や `newline` の単位は、完結していない文を終えません。
  2 行の `a` と `: 1d`、2 行の `a : 1d` と `, 2d`、改行の続く `a :` は
  拒否されます。
  [fixture: gantt/lex-task-line-feed-before-colon] [fixture:
  gantt/lex-task-line-feed-before-comma] [fixture:
  gantt/lex-task-colon-line-feed-task]

**キーワードとその後に続くもの。** `gantt`、`inclusiveEndDates`、`topAxis`、
曜日名は、語の文字が続かないところでだけキーワードです。
その後に語の文字があると、語の全体がタスクのテキストになります
（`gantt2` はヘッダーを持たず拒否され、`inclusiveEndDatesx : 1d`、
`topAxisx : 1d`、`weekday mondayx : 1d`、`weekday monday2 : 1d` はタスクです）。
一方、その後の `-`、`:`、`#`、`{`、`%`、改行、テキストの終わりはキーワードを
終えます。
`gantt-x : 1d` と `inclusiveEndDates-x : 1d` はキーワードとタスク `-x `、
`inclusiveEndDates{ : 1d` はキーワードとタスク `{ `、
`inclusiveEndDates%` はキーワードとコメントで、
`inclusiveEndDates:`、`inclusiveEndDates#`、`inclusiveEndDates-x`、
`weekday monday-x`、`weekday monday:`、`weekday monday#`、`weekday monday x`
は拒否されます。
`:` の単位とデータのないタスクのテキストはどの規則も取らないからです。
ASCII の外の文字も語の文字ではありません。
`inclusiveEndDatesé : 1d`、`ganttÉ : 1d`、`weekday mondayé : 1d` は
キーワードとタスク `é ` か `É ` で、`topAxisé : 1d` は `topAxis` の文として
拒否され、`titleé : 1d` と `clické : 1d` はタスクです。
`title` と `click` にはその後に空白が要るからです。
[fixture: gantt/lex-inclusive-non-ascii-letter-task] [fixture:
gantt/header-non-ascii-letter-task] [fixture:
gantt/lex-weekday-non-ascii-letter-task] [fixture:
gantt/lex-topaxis-non-ascii-letter] [fixture:
gantt/lex-title-non-ascii-letter-task] [fixture:
gantt/lex-click-non-ascii-letter-task]
[fixture: gantt/header-digit-suffix] [fixture:
gantt/lex-inclusive-word-suffix-task] [fixture:
gantt/lex-topaxis-word-suffix-task] [fixture:
gantt/lex-weekday-word-suffix-task] [fixture:
gantt/lex-weekday-digit-suffix-task] [fixture: gantt/lex-weekday-word-suffix]
[fixture: gantt/header-dash-suffix-task] [fixture:
gantt/lex-inclusive-dash-task] [fixture: gantt/lex-inclusive-brace-task]
[fixture: gantt/lex-inclusive-percent] [fixture: gantt/lex-inclusive-line-feed]
[fixture: gantt/lex-inclusive-colon] [fixture: gantt/lex-inclusive-hash]
[fixture: gantt/lex-inclusive-dash] [fixture: gantt/lex-weekday-dash] [fixture:
gantt/lex-weekday-colon] [fixture: gantt/lex-weekday-hash] [fixture:
gantt/lex-weekday-then-text]
`dateFormat`、`axisFormat`、`tickInterval`、`includes`、`excludes`、
`todayMarker`、`title`、`accDescription`、`section` は、
ちょうど 1 つの空白文字（改行でもよい）と、
そのテキストの 1 文字以上が続くところでだけキーワードです。
`title`、改行、`T` はタイトル `T` を持ち、`dateFormat` と `YYYY`、
`section` と `S`、`excludes` と `weekends`、`todayMarker` と `off` も同じです。
テキストが始まれないところ、つまり 2 つ目の改行の後、空白と改行の後、
テキストの終わり、`dateFormat` では `#` の位置では、
語はデータのある、またはないタスクのテキストです。
`title\n\nT`、`title`、`title `、`section`、`dateFormat`、`dateFormat `、
`dateFormat \nX`、`dateFormat\n#x`、`title2 T` は拒否され、
`title:T`、`section:S`、`dateFormat:x`、`tickInterval:1w`、
`accDescription: x` は語を説明とするタスクで、
`titles : 1d`、`title-x : 1d`、`sectionx : 1d`、`dateFormat-x : 1d`、
`weekdays monday : 1d`、`weekdayx monday : 1d` はタスクです。
[fixture: gantt/lex-title-line-feed-value] [fixture:
gantt/lex-dateformat-line-feed-value] [fixture:
gantt/lex-section-line-feed-value] [fixture:
gantt/lex-excludes-line-feed-value] [fixture:
gantt/lex-todaymarker-line-feed-value] [fixture:
gantt/lex-title-blank-line-then-text] [fixture: gantt/lex-title-at-end]
[fixture: gantt/lex-title-space-at-end] [fixture: gantt/lex-section-at-end]
[fixture: gantt/lex-section-blank-line-then-text] [fixture:
gantt/lex-dateformat-at-end] [fixture: gantt/lex-dateformat-space-at-end]
[fixture: gantt/lex-dateformat-space-line-feed-value] [fixture:
gantt/lex-dateformat-digit] [fixture: gantt/lex-title-digit-suffix] [fixture:
gantt/lex-title-percent] [fixture: gantt/lex-title-colon-task] [fixture:
gantt/lex-section-colon-task] [fixture: gantt/lex-dateformat-colon-task]
[fixture: gantt/lex-tickinterval-colon-task] [fixture:
gantt/lex-acc-description-colon-task] [fixture:
gantt/lex-title-word-suffix-task] [fixture: gantt/lex-title-dash-task] [fixture:
gantt/lex-section-word-suffix-task] [fixture: gantt/lex-dateformat-dash-task]
[fixture: gantt/lex-weekdays-task] [fixture:
gantt/lex-weekday-word-suffix-keyword]
`click`、`href`、`call` は、改行を含む空白が続くところでだけキーワードで、
`href` はさらに空白の後の `"` が要ります。
`click:` `1d`、`click-x : 1d`、`clickx : 1d`、`hrefx : 1d`、`callx : 1d` は
タスクで、`click` だけ、click の id の後の `href"u"`、
click の id の後の `callf()` は拒否され、
`click`、改行、`id1 href "u"` は click の文です。
[fixture: gantt/lex-click-colon-task] [fixture: gantt/lex-click-dash-task]
[fixture: gantt/lex-click-word-suffix-task] [fixture:
gantt/lex-href-word-suffix-task] [fixture: gantt/lex-call-word-suffix-task]
[fixture: gantt/lex-click-at-end] [fixture: gantt/lex-href-no-space] [fixture:
gantt/lex-call-no-space] [fixture: gantt/lex-click-line-feed-id]
`accTitle` と `accDescr` は、空白を挟んでも挟まなくても `:` か `{`
が続くところでだけキーワードです。
`accTitlex: T` と `accTitle-: T` は語を説明とするタスクで、
`accTitle`、改行、`: T` はタイトル `T` を持ちます。
[fixture: gantt/lex-acc-title-word-suffix-task] [fixture:
gantt/lex-acc-title-dash-task] [fixture:
gantt/lex-acc-title-line-feed-before-colon] [fixture:
gantt/lex-acc-descr-block-line-feed-before-brace]

### click の文脈

click の文脈には、`click` とその空白の後に入ります（文の文脈の規則 9）。
字句解析器は次の規則をこの順に試します。

1. 改行を含む 1 つの空白文字: 何もなし。文脈を出ます。
   [fixture: gantt/gram-click-href] [fixture:
   gantt/gram-click-id-line-feed-href] [fixture:
   gantt/gram-click-id-nbsp-separator] [fixture:
   gantt/gram-click-id-line-separator-separator]
2. **id のテキスト**（空白でない 1 つ以上の文字）: 各 `,` が `,` の単位、
   それ以外の文字の極大の並びのそれぞれが `id` の単位。
   [fixture: gantt/gram-click-href] [fixture: gantt/gram-click-ids-list]
   [fixture: gantt/gram-click-ids-trailing-comma] [fixture:
   gantt/gram-click-ids-comma-only] [fixture: gantt/gram-click-ids-two-commas]
   [fixture: gantt/gram-click-id-colon] [fixture: gantt/gram-click-id-quotes]
   [fixture: gantt/gram-click-id-parentheses] [fixture:
   gantt/lex-percent-in-click-id]

id のテキストは最初の空白文字で終わり、その空白文字は文脈を出て、
`newline` の単位ではありません。
`click id1`、改行、`href "u"` は 1 つの click の文で、
`href` の前に空白があっても同じです。
一方、`click id1`、空白、改行、`href "u"` と、
`click id1`、改行 2 つ、`href "u"` は拒否されます。
2 つ目の空白文字が文の文脈で `newline` の単位を始めるからです。
`click id1, id2 href "u"` も拒否されます。
id は空白で終わり、`id2 href "u"` はデータのないタスクのテキストだからです。
テキストは click の文脈では終われません。
[fixture: gantt/gram-click-id-line-feed-href] [fixture:
gantt/gram-click-id-line-feed-indent-href] [fixture:
gantt/gram-click-id-line-feed-tab-href] [fixture:
gantt/gram-click-id-space-line-feed-href] [fixture:
gantt/gram-click-id-blank-line-href] [fixture: gantt/gram-click-ids-comma-space]
[fixture: gantt/lex-click-id-at-end]
click の id にはコメントの規則がなく、`%` は id の文字です。
[fixture: gantt/lex-percent-in-click-id]

### href の文脈

href の文脈には、`href`、その空白、`"` の後に入ります（文の文脈の規則 7）。
字句解析器は次の規則をこの順に試します。

1. `"`: `"` の単位。文脈を出ます。[fixture: gantt/gram-click-href]
2. 改行を含む、`"` 以外の 1 つ以上の文字: `url-text` の単位。
   [fixture: gantt/gram-click-href] [fixture:
   gantt/gram-click-href-line-feed-inside] [fixture:
   gantt/lex-percent-in-href-string] [fixture: gantt/lex-href-line-feed-url]

`url-text` は空になりません。
`href ""` は `href` の単位と、間に何もない 2 つの `"` の単位、
つまり**空の href** で、文法のどの規則も取りません
（[空の href と空の call](#空の-href-と空の-call) を参照）。
`href "`、改行、`"` は改行 1 つの URL を持ちます。
テキストは href の文脈では終われません。
[fixture: gantt/gram-click-empty-href-only] [fixture:
gantt/lex-href-line-feed-url] [fixture: gantt/lex-href-unclosed]

### コールバックの文脈

コールバック名の文脈には、`call` とその空白の後に入ります
（文の文脈の規則 8）。
字句解析器は次の規則をこの順に試します。

1. `(`、改行を含む 0 個以上の空白文字、`)`: `(` の単位と `)` の単位。
   文脈を出ます。
   [fixture: gantt/gram-click-call] [fixture:
   gantt/gram-click-call-blank-arguments] [fixture:
   gantt/gram-empty-call-line-feed-inside]
2. `(`: `(` の単位。文脈を出て、コールバック引数の文脈に入ります。
   [fixture: gantt/gram-click-call-arguments]
3. 改行を含む、`(` 以外の 1 つ以上の文字: `callback-name` の単位。
   [fixture: gantt/gram-click-call] [fixture:
   gantt/gram-click-call-name-space-before-parenthesis] [fixture:
   gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
   gantt/gram-click-call-name-with-space] [fixture:
   gantt/gram-click-call-name-hash] [fixture:
   gantt/lex-percent-in-callback-name]

コールバック引数の文脈では、字句解析器は次の規則をこの順に試します。

1. `)`: `)` の単位。文脈を出ます。
   [fixture: gantt/gram-click-call-arguments]
2. 改行を含む、`)` 以外の 1 つ以上の文字: `callback-arguments` の単位。
   [fixture: gantt/gram-click-call-arguments] [fixture:
   gantt/gram-click-call-arguments-leading-space] [fixture:
   gantt/gram-click-call-arguments-quoted-comma] [fixture:
   gantt/gram-click-call-arguments-line-feed] [fixture:
   gantt/lex-percent-in-callback-arguments]

`callback-name` は最初の `(` まで続き、終わりの空白と改行を含めます。
`call f ()` は名前 `f` と空白を持ち、`call f`、改行、`()` は名前 `f` と改行を
持ちます。
`call` の空白の直後の `(` は名前を残しません。
`call (1)` は拒否され、括弧の間が空白だけの `call ()` は**空の call** で、
文法のどの規則も取りません
（[空の href と空の call](#空の-href-と空の-call) を参照）。
引数は最初の `)` で終わり、引用符の中でも同じです。
`call f("a)b")` は拒否されます。
テキストはどちらの文脈でも終われません。
[fixture: gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
gantt/gram-click-call-no-name] [fixture: gantt/gram-click-empty-call-only]
[fixture: gantt/gram-click-call-arguments-parenthesis-in-string] [fixture:
gantt/lex-callback-name-at-end] [fixture:
gantt/lex-callback-arguments-unclosed]

### アクセシビリティの値

タイトルの文脈には `accTitle:` とその空白の後に（文の文脈の規則 1）、
説明の文脈には `accDescr:` とその空白の後に（規則 2）、
説明ブロックの文脈には `accDescr {` とその空白の後に（規則 3）入ります。

タイトルの文脈と説明の文脈の唯一の規則は、改行以外の 1 つ以上の文字:
タイトルの文脈では `acc-title-text` の単位、
説明の文脈では `acc-description-text` の単位。文脈を出ます。
コロンの後の空白は改行を含めてコロンと一緒に読まれるので、
テキストは、コロンの行かそれより後の行の、空白でない最初の文字から始まり、
その行の終わりまで続き、`;`、`#`、`:`、`%%` を含めます。
`accTitle:`、改行、`title X` はアクセシビリティのタイトル `title X` を持ち、
タイトルは持ちません。
テキストはこれらの文脈では終われないので、
空白のほかに何も続かない `accTitle:` は拒否されます。
[fixture: gantt/gram-acc-title] [fixture: gantt/gram-acc-title-hash-semicolon]
[fixture: gantt/gram-acc-title-two-colons] [fixture:
gantt/lex-percent-comment-in-acc-title] [fixture:
gantt/gram-acc-title-line-feed-then-text] [fixture:
gantt/gram-acc-title-blank-lines-then-text] [fixture:
gantt/gram-acc-title-takes-title-line] [fixture:
gantt/gram-acc-descr-semicolon-start] [fixture:
gantt/gram-acc-descr-line-feed-then-text] [fixture:
gantt/lex-acc-title-at-end] [fixture: gantt/lex-acc-title-space-at-end]
[fixture: gantt/lex-acc-descr-at-end]

説明ブロックの文脈では、字句解析器は次の規則をこの順に試します。

1. `}`: `}` の単位。文脈を出ます。[fixture: gantt/gram-acc-descr-block]
2. 改行を含む、`}` 以外の 1 つ以上の文字: `acc-description-block-text` の単位。
   [fixture: gantt/gram-acc-descr-block] [fixture:
   gantt/gram-acc-descr-block-multiline] [fixture:
   gantt/gram-acc-descr-block-brace-inside]

`{` の後の空白は改行を含めて波括弧と一緒に読まれるので、
ブロックのテキストは空白でない文字から始まり、`}` の直前で終わり、
`}` の前の空白を含めます。
波括弧の間が空白だけのブロックはテキストの単位を持ちません
（[空の説明ブロック](#空の説明ブロック) を参照）。
テキストは説明ブロックの文脈では終われません。
`}` の後の 2 つ目の `}` はデータのないタスクのテキストなので、
`accDescr {d}}` は拒否されます。
[fixture: gantt/gram-acc-descr-block-multiline] [fixture:
gantt/gram-acc-descr-block-empty] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/lex-acc-descr-block-unclosed] [fixture:
gantt/gram-acc-descr-block-double-close]

### コメント

単位のほかに、字句解析器は**図のコメント**を読みます。
行の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
これは [common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器がテキストを読む前に除かれます。
図のコメントは行の途中から始まることができ、
`%%` だけ、`% c`、`%x`、`%%{ }%%` の行は、コメント行ではなく図のコメントです。
[fixture: gantt/comment-line] [fixture:
gantt/lex-bare-percent-line-after-header] [fixture:
gantt/lex-single-percent-comment-line] [fixture: gantt/lex-percent-x-line]
[fixture: gantt/lex-percent-brace-line-after-task]

図のコメントは、文の文脈で単位の始まる位置の `%` から始まり（規則 4）、
改行まで続きます。改行はその一部ではありません。
図のコメントの**印**は、`%%` で始まるときは `%%`、そうでなければ `%` で、
値は印の後のテキストです。
`%% c` の値は空白と `c`、`% c` の値も同じ、`%%` だけの値は空、
`%%{ }%%` の値は `{ }%%` です。
ディレクティブの始まらない `%%{`
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置)
を参照）は、単位の始まるどの位置でもそのようなコメントです。
文の後の独立した行（`%%{}`、`%%{-x}%%`、後ろに何もない `%%{` を含む）、
その行の単位と空白の後（行の残りを取ります）、単位の直後です。
印はディレクティブを除いたテキスト、つまり字句解析器が読むテキストで見つけ、
値は印の後のソースのテキストで、コメント行と同じくディレクティブを含めます。
[fixture: gantt/lex-percent-comment-after-unit] [fixture:
gantt/lex-single-percent-comment-glued] [fixture:
gantt/lex-bare-percent-line-at-end] [fixture:
gantt/lex-bare-percent-lines-then-task] [fixture:
gantt/lex-percent-comment-glued-after-header] [fixture:
gantt/lex-single-percent-glued-after-header] [fixture:
gantt/lex-percent-comment-after-header] [fixture:
gantt/lex-task-percent-only-line] [fixture:
gantt/lex-percent-brace-line-after-task] [fixture:
gantt/lex-percent-brace-empty-line] [fixture:
gantt/lex-percent-brace-non-word-line] [fixture:
gantt/lex-percent-brace-open-line] [fixture:
gantt/lex-percent-brace-after-unit-space] [fixture:
gantt/lex-percent-brace-line-text-after] [fixture:
gantt/lex-percent-brace-after-line-feed-space] [fixture:
gantt/lex-percent-brace-after-tab] [fixture:
gantt/lex-percent-brace-after-percent-comment-line] [fixture:
gantt/lex-percent-brace-after-call-line-feed] [fixture:
gantt/lex-percent-brace-after-href-space] [fixture:
gantt/lex-percent-brace-after-block-space] [fixture:
gantt/lex-single-percent-comment-blank-lines-then-task] [fixture:
gantt/lex-triple-percent-comment-line]

mermaid.js は `%` を 3 通りに読み、次の 3 か所でこの規則と違います。
ディレクティブの始まらない `%%{` に**直接たどり着く**ところ、
単位の始まる位置の `%` の直前に `}` と空白以外の文字があるところ、
直接たどり着いた `%` のコメントがその後の改行を取るところです
（[既知の差異](#既知の差異) を参照）。
mermaid.js が `%` に直接たどり着くとは、その字句解析器が `%` に立つことです。
`%` と、字句解析器が最後に読んだ文字、
つまり `newline` 以外の最後の単位の終わり
（`newline` の単位の改行はこの空白に数える）、最後のコメントの終わり、
直接たどり着いた `%` のコメントが取った改行の最後、
click の文脈を出る 1 つの空白文字との間の空白を取ります。
その空白が空のとき、または 2 文字以上で、先頭の改行を除いた残りが
ちょうど 1 文字ではないとき、`%` には直接たどり着きます。
その空白が 1 文字のとき、または先頭の改行を除いてちょうど 1 文字が残るときは、
直接たどり着きません。
その空白は、字句解析器が読む、ディレクティブを除いたテキストの空白なので、
ディレクティブだけの行はその改行を残します。
`title T`、ディレクティブの行、`%%{ }%%` の行では、
空行の後と同じく `%` の前に改行が 2 つあり、mermaid.js は入力を拒否します。
`%%{ }%%` の前に空白が 1 つあればどちらでもコメントで、
改行を 3 つ残すディレクティブの 2 行や、ディレクティブの行と空行の後も同じです。
ディレクティブの前に空白が 1 つか 2 つあるとき、
または `%%{ }%%` の前に空白が 2 つあるときは、mermaid.js は拒否します。
`%%{ }%%` と同じ行のディレクティブや、
前の行の終わりにくっついたディレクティブは改行を 1 つ残し、
どちらでもコメントです。
[fixture: gantt/div-percent-brace-after-directive-line]
[fixture: gantt/lex-percent-brace-after-directive-line-space]
[fixture: gantt/div-percent-brace-after-directive-line-two-spaces]
[fixture: gantt/div-percent-brace-after-indented-directive-line]
[fixture: gantt/div-percent-brace-after-directive-line-indented-two]
[fixture: gantt/div-percent-brace-after-indented-directive-line-space]
[fixture: gantt/div-percent-brace-after-two-directive-lines]
[fixture: gantt/lex-percent-brace-after-two-directive-lines-space]
[fixture: gantt/div-percent-brace-after-directive-line-blank-line]
[fixture: gantt/lex-percent-brace-after-directive-line-blank-line-space]
[fixture: gantt/lex-percent-brace-after-directive-same-line]
[fixture: gantt/lex-percent-brace-after-unit-glued-directive]
そのため `gantt%%{ }%%`、`inclusiveEndDates%%{ }%%`、`href "u"%%{ }%%`、
`accDescr { d }%%{ }%%`、`accDescr {}%%{ }%%`、`gantt%%{}`、`gantt%%{`、
改行と空白 2 つかタブ 2 つの後、同じ行の単位と空白 2 つかタブ 2 つの後、
改行 2 つの後、空白と改行の後、改行と空白と改行の後の
`%%{ }%%`、ヘッダーや空行の直後の `%` のコメントの次の行の `%%{ }%%` は、
ここではコメントで、mermaid.js は拒否します。
一方、改行 1 つの後、改行と空白 1 つかタブの後、改行 2 つと空白 1 つの後、
単位と空白 1 つかタブ 1 つの後の `%%{ }%%` はどちらでもコメントです。
mermaid.js が直接たどり着かなかったコメントの後も同じです。
`inclusiveEndDates %c`、改行、`%%{ }%%` はどちらでもコメントで、
間に空行があるとき、または `%%c` と改行と空白 2 つのときは、
mermaid.js は拒否します。
[fixture: gantt/lex-percent-brace-after-space-percent-comment-line] [fixture:
gantt/div-percent-brace-after-space-percent-comment-blank-line] [fixture:
gantt/div-percent-brace-after-double-percent-comment-two-spaces] [fixture:
gantt/lex-percent-brace-after-two-line-feeds-and-space] [fixture:
gantt/div-percent-brace-after-line-feed-space-line-feed]
[fixture: gantt/div-percent-brace-glued-after-header] [fixture:
gantt/div-percent-brace-glued-after-keyword] [fixture:
gantt/div-percent-brace-glued-after-day] [fixture:
gantt/div-percent-brace-glued-after-string] [fixture:
gantt/div-percent-brace-glued-after-block] [fixture:
gantt/div-percent-brace-glued-after-empty-block] [fixture:
gantt/div-percent-brace-glued-empty-after-header] [fixture:
gantt/div-percent-brace-open-glued-after-header] [fixture:
gantt/div-percent-brace-after-two-spaces] [fixture:
gantt/div-percent-brace-after-blank-line] [fixture:
gantt/div-percent-brace-after-space-line-feed]
[fixture: gantt/div-percent-brace-after-line-feed-two-tabs]
[fixture: gantt/div-percent-brace-after-unit-two-spaces]
[fixture: gantt/div-percent-brace-after-unit-two-tabs]
[fixture: gantt/lex-percent-brace-line-after-task]
[fixture: gantt/lex-percent-brace-after-line-feed-space]
[fixture: gantt/lex-percent-brace-after-tab]
[fixture: gantt/lex-percent-brace-after-unit-space]
[fixture: gantt/lex-percent-brace-after-unit-tab] [fixture:
gantt/div-percent-brace-after-glued-percent-comment] [fixture:
gantt/div-percent-brace-after-percent-comment-blank-line]
単位の始まる位置にない `%` は、規則 25 と規則 26 の言うとおり、
それを含む単位の文字です。単位の最初の文字の直後でも同じで、
そこでは mermaid.js がその文字と行の残りを 1 つのコメントとして読みます。
`a% : 1d` と空白の後の `x% : 2d` は、ここではタスク `a% ` と `x% `、
mermaid.js ではコメントでタスクはありません。
`t%itle T`、`a : 1d;%c`、`a : 1d#%c`、`dateFormat X;%c`、
URL 文字列の後の `"%c` はここでは拒否されます。
`t%itle T`、`;%c`、`#%c`、`"%c` がデータのないタスクのテキストだからです。
mermaid.js は受理します。
`a :%c` はここでは終わり `%c` を持つタスク `a ` で、mermaid.js は拒否します。
そのコメントがタスクのテキストをデータなしで残すからです。
`ab% : 1d` はどちらでもタスク `ab% `、`}%c : 1d` はタスク `}%c ` で、
単位と `%` の間の空白はどちらでもコメントにします。
[fixture: gantt/div-comment-after-task-text-start] [fixture:
gantt/div-comment-after-keyword-start] [fixture:
gantt/div-comment-after-semicolon-after-data] [fixture:
gantt/div-comment-after-hash-after-data] [fixture:
gantt/div-comment-after-semicolon-after-setting] [fixture:
gantt/div-comment-after-indented-text-start] [fixture:
gantt/div-comment-after-quote-after-string] [fixture:
gantt/lex-comment-after-two-characters] [fixture:
gantt/lex-brace-before-percent] [fixture: gantt/lex-colon-then-percent]
[fixture: gantt/lex-space-then-percent-after-unit] [fixture:
gantt/lex-two-spaces-then-percent-after-unit]
`click id1 %c`、改行、`href "u"`（空白 1 つが click の文脈を出て、
`%` に直接たどり着く）と、`click id1 call f()%c`、改行、`href "u"`
（改行 2 つでも）と、`click id1 href "u"%c`、改行、`call f()` は
ここでは拒否されます。
コメントはその行で終わり、`newline` の単位が click の文を終えるからです。
mermaid.js は、直接たどり着いた `%` のコメントがその後の改行を取るので、
受理します。
call の部分の後の `%` の前に空白があるとき、
click の id の後に空白が 2 つあるとき、
`%%` のときは、`%` に直接たどり着かないかコメントが改行を取らないので、
どちらも拒否し、文と文の間では mermaid.js が取る改行は何も変えません。
[fixture: gantt/lex-percent-comment-after-click-id-two-spaces-then-href-line]
[fixture: gantt/lex-percent-comment-glued-after-call-then-blank-line-then-title]
[fixture: gantt/div-percent-comment-takes-line-feed-after-click-id] [fixture:
gantt/div-percent-comment-takes-line-feed-after-call] [fixture:
gantt/div-percent-comment-takes-line-feeds-after-call] [fixture:
gantt/div-percent-comment-takes-line-feed-after-href] [fixture:
gantt/lex-space-percent-comment-after-call-then-href-line] [fixture:
gantt/lex-double-percent-comment-after-click-id-then-href-line] [fixture:
gantt/lex-percent-comment-glued-after-header-blank-line]

ほかの単位の中では `%` はテキストの文字です。
タイトルのテキスト、section のテキスト、設定のテキスト、タスクのデータ、
アクセシビリティのタイトル、コールバック名、コールバック引数、URL 文字列、
そして click の id（id の文字）です。
click の id の後のコメントは行を終え、click の文に部分がないので、
`click id1 %% c` は拒否されます。
`click id1 %%{ }%%`、改行、`href "u"` も同じ理由でどちらでも拒否され、
`a : 1d; %%{ }%%` もそうです。その `; ` はデータのないタスクのテキストです。
[fixture: gantt/lex-percent-comment-in-title-text] [fixture:
gantt/lex-percent-comment-in-section-text] [fixture:
gantt/lex-percent-comment-in-setting-text] [fixture:
gantt/lex-percent-comment-in-task-data] [fixture:
gantt/lex-percent-comment-in-acc-title] [fixture:
gantt/lex-percent-in-callback-name] [fixture:
gantt/lex-percent-in-callback-arguments] [fixture:
gantt/lex-percent-in-href-string] [fixture: gantt/lex-percent-in-click-id]
[fixture: gantt/lex-percent-comment-after-click-id] [fixture:
gantt/lex-percent-brace-after-click-id-space] [fixture:
gantt/lex-percent-brace-glued-after-task-semicolon] [fixture:
gantt/lex-percent-comment-after-href] [fixture:
gantt/lex-percent-comment-after-call] [fixture:
gantt/lex-percent-brace-in-title-text] [fixture:
gantt/lex-percent-brace-in-task-data] [fixture:
gantt/lex-percent-brace-glued-in-title-text]

mermaid.js の文書は
[Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L319-L322)
で、コメントは「need to be on their own line and must be prefaced with `%%`」
と書いています。

## 文法

文法は [common.ja.md](../common.ja.md#表記) の記法を、
文字の代わりに単位の上で使います。
`task-text` のような単位名はその名前の 1 つの単位を表し、
二重引用符の中のテキストは、`"title"` や `":"` のように、
そのテキストを名前とする単位を表します。
文法は
[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L107-L173)
の文法の言い換えで、mermaid.js がトークンを読まない空の形
（[空の説明ブロック](#空の説明ブロック) と
[空の href と空の call](#空の-href-と空の-call) を参照）を除いて、
同じ単位の並びを受理します。

以下の各規則は、[ast/gantt.ja.md](../ast/gantt.ja.md) で定める木のノードを
作ります。

| 規則                                                                                                                                                                                                            | ノード                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `diagram`                                                                                                                                                                                                       | GanttDiagram                                                                           |
| `task-statement`                                                                                                                                                                                                | GanttTaskStatement                                                                     |
| `click-statement`                                                                                                                                                                                               | GanttClickStatement                                                                    |
| `call-part`                                                                                                                                                                                                     | GanttCallback                                                                          |
| `date-format-statement`                                                                                                                                                                                         | GanttDateFormatStatement                                                               |
| `axis-format-statement`                                                                                                                                                                                         | GanttAxisFormatStatement                                                               |
| `tick-interval-statement`                                                                                                                                                                                       | GanttTickIntervalStatement                                                             |
| `today-marker-statement`                                                                                                                                                                                        | GanttTodayMarkerStatement                                                              |
| `includes-statement`                                                                                                                                                                                            | GanttIncludesStatement                                                                 |
| `excludes-statement`                                                                                                                                                                                            | GanttExcludesStatement                                                                 |
| `inclusive-end-dates-statement`                                                                                                                                                                                 | GanttInclusiveEndDatesStatement                                                        |
| `top-axis-statement`                                                                                                                                                                                            | なし。入力は拒否されます（文法の外の拒否を参照）                                       |
| `weekday-statement`                                                                                                                                                                                             | GanttWeekdayStatement                                                                  |
| `weekend-statement`                                                                                                                                                                                             | GanttWeekendStatement                                                                  |
| `title-statement`                                                                                                                                                                                               | GanttTitleStatement                                                                    |
| `section-statement`                                                                                                                                                                                             | GanttSectionStatement                                                                  |
| `accessibility-statement`                                                                                                                                                                                       | GanttAccTitleStatement、GanttAccDescrStatement、GanttAccDescrBlockStatement のいずれか |
| `empty-description-block`                                                                                                                                                                                       | テキストのない GanttAccDescrBlockStatement。それだけで 1 つの文                        |
| `url-text` とその `"` の単位                                                                                                                                                                                    | StringLiteral                                                                          |
| `id`、`list-item`、タグである `data-item`                                                                                                                                                                       | Identifier                                                                             |
| `setting-text`、`marker-text`、`title-text`、`section-text`、`task-text`、タグでない `data-item`、`callback-name`、`callback-arguments`、`acc-title-text`、`acc-description-text`、`acc-description-block-text` | GanttLiteral                                                                           |

### 図と文

```text
diagram   = header line*
header    = "gantt"
line      = statement | newline
statement = task-statement
          | click-statement
          | date-format-statement
          | axis-format-statement
          | tick-interval-statement
          | today-marker-statement
          | includes-statement
          | excludes-statement
          | inclusive-end-dates-statement
          | top-axis-statement
          | weekday-statement
          | weekend-statement
          | title-statement
          | section-statement
          | accessibility-statement
          | empty-description-block
```

図は、ヘッダーと任意の数の行で、各行は文か `newline` の単位です。
文を区切るものはありません。
各文は自分の最後の単位で終わり、次の文は同じ行に空白を挟んでも挟まなくても、
または後の行に続けられます。
2 つの文の間の `newline` の単位は、それだけで 1 つの行です。
文の中、その単位の間の `newline` の単位はどの規則も取らず、入力は拒否されます
（[文の文脈](#文の文脈) を参照）。
`date` の単位、`accDescription` の単位、規則 27 の `:` の単位は
どの規則も取らないので、日付で始まる行、`accDescription` の文、
その行で後ろに何もないコロンは、入力を拒否させます。
[fixture: gantt/header-only] [fixture: gantt/gram-statements-same-line]
[fixture: gantt/gram-empty-lines-and-indentation] [fixture:
gantt/lex-task-line-feed-before-colon] [fixture:
gantt/gram-click-call-line-feed-href] [fixture: gantt/lex-date-line] [fixture:
gantt/lex-acc-description] [fixture: gantt/lex-task-colon-at-end]

### タスク

```text
task-statement = task-text ":" data-item? ( "," data-item? )*
```

タスクは、`task-text` の単位である**説明**と、その**データ**、
つまり `:` の単位と、`,` の単位で区切られたデータのテキストの項目です。
`task-text` と `:` は 1 つの行の隣り合う単位で、
データのテキストは 1 文字以上あるので、
その行で後ろに何もない `a :` はタスクではありません
（[文の文脈](#文の文脈) を参照）。
説明は `task-text` の単位のテキストを書かれたとおりに持ち、
コロンの前の空白を含めます。Db はそれを保ちます。
[fixture: gantt/gram-task] [fixture: gantt/gram-task-no-whitespace] [fixture:
gantt/lex-task-text-trailing-spaces] [fixture:
gantt/db-task-description-spaces] [fixture: gantt/lex-task-colon-at-end]
[fixture: gantt/lex-task-text-only] [fixture: gantt/lex-task-data-only]

項目は、コロン、各コンマ、行の終わりの間のデータのテキストの区間から、
それぞれ両端の空白を除いたものです。
空白だけの区間は**空の項目**で、単位を持たず、
タスクの項目の null の要素です
（[GanttTaskStatement](../ast/gantt.ja.md#gantttaskstatement) を参照）。
項目はコンマより常に 1 つ多くあります。
`a : ` は空の項目 1 つ、`a : ,` は 2 つ、
`a : 1d,` は項目 `1d` と空の項目、
`a : id1,, 1d` は項目 `id1`、空の項目、`1d` を持ちます。
[fixture: gantt/lex-task-data-whitespace-only] [fixture:
gantt/gram-task-empty-items] [fixture: gantt/gram-task-empty-items-no-spaces]
[fixture: gantt/gram-task-trailing-comma] [fixture:
gantt/gram-task-empty-middle-item] [fixture: gantt/gram-task-empty-item-first]

mermaid.js は項目を
[`parseData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L497-L551)
のとおりに読み、木は項目を書かれたとおりに示します。読み方は次です。
まず**タグ**を前から取ります
（[`getTaskTags()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L846-L860)）。
残りの最初の項目が、ちょうどこの大文字小文字の語 `active`、`done`、`crit`、
`milestone`、`vert` のどれかであるかぎり、それはタグで、
繰り返しても、そのフラグを立てます。
空の項目、別の大文字小文字の語、1 つの項目の中の 2 つのタグの語はタグではなく、
タグを終え、ほかの項目の後のタグの語は項目です。
次に残りの項目を数えます。
1 つなら、それは**終わり**で、**始まり**はその前のタスクの終わりです。
2 つなら、最初が始まり、2 つ目が終わりです。
3 つなら、最初が **id**、2 つ目が始まり、3 つ目が終わりです。
4 つ以上なら、mermaid.js はどれも読まず、
タスクは id も始まりも終わりも持ちません。
始まりは `after` と id、終わりは `until` と id、日付、長さとして書け、
id は空白を含められます。それぞれ書かれたとおりの 1 つの項目です。
id のないタスクは、id のないタスクの中で `task1`、`task2`、… と番号が付き、
id は一意である必要はありません。
同じ id の後のタスクが、click の文の見つけるタスクです。
[fixture: gantt/gram-task-tag-then-item] [fixture: gantt/gram-task-two-tags]
[fixture: gantt/gram-task-tag-repeated] [fixture:
gantt/gram-task-tag-with-spaces] [fixture: gantt/gram-task-tag-tab] [fixture:
gantt/gram-task-tag-nbsp] [fixture: gantt/lex-task-tag-ideographic-space]
[fixture: gantt/gram-task-tags-upper-case] [fixture:
gantt/gram-task-tag-mixed-case] [fixture: gantt/gram-task-two-words-no-tag]
[fixture: gantt/gram-task-tag-after-item] [fixture:
gantt/gram-task-tag-empty-then-tag] [fixture: gantt/gram-task-empty-item-first]
[fixture: gantt/gram-task-tag-then-empty-item] [fixture:
gantt/gram-task-tag-then-whitespace-item] [fixture: gantt/gram-task-one-item]
[fixture: gantt/gram-task-two-items] [fixture: gantt/gram-task-three-items]
[fixture: gantt/gram-task-four-items] [fixture:
gantt/gram-task-four-tags-then-items] [fixture: gantt/gram-task-after-ids]
[fixture: gantt/gram-task-until] [fixture: gantt/gram-task-id-with-spaces]
[fixture: gantt/gram-task-numbered-ids] [fixture:
gantt/gram-task-duplicate-id-click] [fixture: gantt/gram-task-milestone]
[fixture: gantt/gram-task-vert] [fixture: gantt/gram-task-crit] [fixture:
gantt/gram-task-active]
タグだけのデータは項目を残さず、入力を拒否させます
（[文法の外の拒否](#文法の外の拒否) を参照）。
[fixture: gantt/gram-task-tags-only] [fixture: gantt/gram-task-tags-only-two]

Issue
[mermaid-js/mermaid#8188](https://github.com/mermaid-js/mermaid/issues/8188)
「Gantt: a task line with four or more metadata items throws an internal
TypeError instead of reporting a parse error」は、
mermaid.js が 4 つ以上の項目のタスクを受理し、図を描くときに失敗することを
報告しています。
2026-10-08 の時点で open で、ラベルは `Type: Bug / Error` と
`Status: Triage`、返信はありません。
入力は、mermaid.js のパーサーが受理するとおり、受理されます。
Issue
[mermaid-js/mermaid#2886](https://github.com/mermaid-js/mermaid/issues/2886)
「Restrictions on Gantt Task Names」は、
`gantt` や `section` のようなキーワードで始まる説明がタスクとして読まれない
ことを報告しています。
2026-10-08 の時点で open で、ラベルは `Type: Bug / Error`、
`Contributor needed`、`Status: Pending`、`Graph: Gantt` です。
そのような行は [文の文脈](#文の文脈) の述べるとおりに読まれ、
説明の中のキーワードはテキストで、
後に続くもののためにキーワードでない語は説明です。
[fixture: gantt/header-colon] [fixture: gantt/lex-task-text-keyword-inside]
[fixture: gantt/lex-title-colon-task]

### click の文

```text
click-statement = "click" ( id | "," )+ ( call-part href-part? | href-part call-part? )
call-part       = "call" callback-name "(" callback-arguments? ")"
href-part       = "href" '"' url-text '"'
```

click の文は、`click`、その id、そして 1 つか 2 つの部分、
つまり call とリンクで、順序はどちらでもかまいません。
id は id のテキストの `id` の単位と `,` の単位です
（[click の文脈](#click-の文脈) を参照）。
`click id1,id2 href "u"` は 2 つの id、
`click id1, href "u"` は id `id1` と空の id、
`click , href "u"` は 2 つの空の id、
`click id1,,id2` は 3 つ（真ん中が空）を持ちます。
空の id は文の id の null の要素です
（[GanttClickStatement](../ast/gantt.ja.md#ganttclickstatement) を参照）。
mermaid.js は各 id をそこまでに読んだタスクの中で探します。
どのタスクも名指さない id（空の id を含む）と、後に来るタスクの id は
何も得ず、エラーにもなりません。
[fixture: gantt/db-click-ids-list] [fixture: gantt/gram-click-ids-list]
[fixture:
gantt/gram-click-ids-trailing-comma] [fixture: gantt/gram-click-ids-comma-only]
[fixture: gantt/gram-click-ids-two-commas] [fixture:
gantt/gram-click-unknown-id] [fixture: gantt/gram-click-before-task] [fixture:
gantt/gram-click-id-colon] [fixture: gantt/gram-click-id-quotes] [fixture:
gantt/gram-click-id-parentheses]

call の部分は、`call`、`callback-name` の単位、括弧で、
括弧の間に `callback-arguments` の単位があってもなくてもかまいません
（[コールバックの文脈](#コールバックの文脈) を参照）。
名前は書かれたとおりで、`(` の前の空白と改行を含め、
引数は括弧の間のテキストを書かれたとおり、両端の空白を含めて持つか、
括弧の間が空白だけなら何も持ちません。
リンクの部分は `href` と文字列、つまり `"` の単位とその間の `url-text` で、
書かれたとおり、改行を含めます。
2 つ目の部分は 1 つ目の直後か空白の後に続けられますが、
`newline` の単位の後には続けられません。
`click id1 call f()`、改行、`href "u"` は拒否されます。
一方、id の直後の改行は click の文脈を出て、`newline` の単位ではありません。
click の文は call とリンクを多くとも 1 つずつ持ち、
その後の行には別の文かコメントのほかに何も置けません。
2 つの call の部分、2 つのリンクの部分、3 つの部分、部分の後のテキスト、
id と部分の間のテキスト、id のテキストが `href` である `click` は拒否されます。
[fixture: gantt/gram-click-call] [fixture: gantt/gram-click-call-arguments]
[fixture: gantt/gram-click-call-blank-arguments] [fixture:
gantt/gram-click-call-arguments-leading-space] [fixture:
gantt/gram-click-call-arguments-quoted-comma] [fixture:
gantt/gram-click-call-arguments-line-feed] [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-with-space] [fixture:
gantt/gram-click-call-upper-case] [fixture: gantt/gram-click-href] [fixture:
gantt/gram-click-href-line-feed-inside] [fixture:
gantt/gram-click-href-then-call] [fixture: gantt/gram-click-call-then-href]
[fixture: gantt/gram-click-call-line-feed-href] [fixture:
gantt/gram-click-id-line-feed-href] [fixture: gantt/gram-click-call-twice]
[fixture: gantt/gram-click-href-twice] [fixture: gantt/gram-click-three-parts]
[fixture: gantt/gram-click-href-then-text] [fixture:
gantt/gram-click-call-then-text] [fixture:
gantt/gram-click-text-between-id-and-href] [fixture:
gantt/gram-click-href-as-id] [fixture:
gantt/gram-click-href-then-task-same-line] [fixture:
gantt/gram-click-call-then-title-same-line] [fixture:
gantt/gram-click-call-then-line-feed-at-end]

各部分は id のタスクにクラス `clickable` を与え、
リンクは同じタスクのリンクを置き換え、
同じ id の後の click の文は前のものに加わります。
要約は call を文法が作ったとおりに記録し、どの `securityLevel` でも同じです
（tests パッケージの要約を参照）。
[fixture: gantt/gram-click-two-statements-same-id] [fixture:
gantt/gram-click-href-replaced] [fixture: gantt/db-click-links-order] [fixture:
gantt/gram-click-security-level-strict] [fixture:
gantt/config-security-level-loose-click-call] [fixture:
gantt/config-security-level-strict-click-href]

mermaid.js の文書は 2 つの部分を
[Interaction](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L450-L458)
で説明しています。

### 設定

```text
date-format-statement         = "dateFormat" setting-text
axis-format-statement         = "axisFormat" setting-text
tick-interval-statement       = "tickInterval" setting-text
today-marker-statement        = "todayMarker" marker-text
includes-statement            = "includes" ( list-item | "," )*
excludes-statement            = "excludes" ( list-item | "," )*
inclusive-end-dates-statement = "inclusiveEndDates"
top-axis-statement            = "topAxis"
weekday-statement             = "weekday" day
weekend-statement             = "weekend" day
```

`dateFormat`、`axisFormat`、`tickInterval`、`todayMarker` は、
その値を `setting-text` か `marker-text` の単位のテキストに、
書かれたとおり、両端の空白を含めて設定します。
後の文が前の文を置き換えます。
`includes` と `excludes` は、リストのテキストの `list-item` の単位を
トークンのリストに加えます。
mermaid.js はその大文字を小文字にし、同じ種類のすべての文にわたって、
各トークンを最初の場所に 1 回だけ保ちます。
`list-item` の単位のない文は何も加えません。
`inclusiveEndDates` はフラグを立てます。
`weekday` と `weekend` は `day` の単位の曜日を、
テキストの大文字小文字によらず小文字で設定し、後の文が前の文を置き換えます。
[fixture: gantt/db-date-format] [fixture: gantt/db-date-format-extra-spaces]
[fixture: gantt/lex-dateformat-trailing-spaces] [fixture:
gantt/db-date-format-last-wins] [fixture: gantt/db-axis-format] [fixture:
gantt/db-tick-interval] [fixture: gantt/db-today-marker] [fixture:
gantt/db-today-marker-off] [fixture: gantt/db-includes-tokens] [fixture:
gantt/db-excludes-tokens] [fixture: gantt/db-excludes-merged-lines] [fixture:
gantt/db-excludes-duplicates] [fixture: gantt/lex-excludes-upper-case-items]
[fixture: gantt/lex-excludes-empty-items] [fixture:
gantt/db-inclusive-end-dates] [fixture: gantt/db-weekday-last-wins] [fixture:
gantt/lex-day-mixed-case] [fixture: gantt/db-weekend-friday] [fixture:
gantt/db-weekend-saturday]
`top-axis-statement` は入力を拒否させます
（[文法の外の拒否](#文法の外の拒否) を参照）。

### タイトルと section

```text
title-statement   = "title" title-text
section-statement = "section" section-text
```

タイトルの文は、タイトルを `title-text` の単位のテキストに、
書かれたとおり、両端の空白を含めて設定し、
フロントマターのタイトルと前のタイトルの文を置き換えます。
section の文は、`section-text` の単位のテキストを書かれたとおりに持つ
section を、テキストが繰り返しても加え、その後のタスクはそれに属します。
最初の section より前のタスクは空の section を持ちます。
[fixture: gantt/db-title-statement] [fixture: gantt/db-title-frontmatter]
[fixture: gantt/db-title-statement-after-frontmatter] [fixture:
gantt/lex-title-twice] [fixture: gantt/lex-title-two-spaces] [fixture:
gantt/lex-title-trailing-spaces] [fixture: gantt/db-sections] [fixture:
gantt/lex-section-twice] [fixture: gantt/lex-section-two-spaces] [fixture:
gantt/db-task-before-section]

### アクセシビリティの文

```text
accessibility-statement = "accTitle" ":" acc-title-text
                        | "accDescr" ":" acc-description-text
                        | "accDescr" "{" acc-description-block-text "}"
```

アクセシビリティのタイトルと説明は、その単位のテキストから
mermaid.js が切り落とす両端の空白を除いたものです。
ブロックのテキストは改行を保ち、各改行の後の空白は Db から除かれます
（tests パッケージの要約を参照）。
後の説明は、行のものでもブロックのものでも、前の説明を置き換えます。
[fixture: gantt/gram-acc-title] [fixture:
gantt/gram-acc-title-trailing-spaces] [fixture: gantt/gram-acc-descr] [fixture:
gantt/gram-acc-descr-block] [fixture: gantt/gram-acc-descr-block-multiline]
[fixture: gantt/gram-acc-descr-block-brace-inside] [fixture:
gantt/gram-acc-descr-colon-then-block-same-line] [fixture:
gantt/gram-acc-descr-twice] [fixture: gantt/db-acc-title] [fixture:
gantt/db-acc-descr] [fixture: gantt/db-acc-descr-block]

### 空の説明ブロック

```text
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位の直後に
`}` の単位が続き、`acc-description-block-text` の単位のないものです。
`accDescr {}`、`accDescr { }`、空白か空行だけのブロックです。
mermaid.js はそれにトークンを読みません
（[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）。
それは、文の始まるどの位置でも、
テキストのない、何も変えない説明ブロックの文です。
独立した行、ヘッダーの直後、
同じ行の別の文の直後（完結した click の文の後を含む）、
同じ行の文の前です。1 行の 2 つのブロックは 2 つの文です。
タイトルのテキスト、section のテキスト、設定のテキスト、タスクのテキスト、
タスクのデータ、コールバック名、コールバック引数、URL 文字列の中では
`accDescr {}` はテキストで、`weekday` とその曜日の間ではどちらでも拒否されます。
weekday の文が読まれないからです。
[fixture: gantt/gram-acc-descr-block-empty] [fixture:
gantt/gram-acc-descr-block-empty-then-title] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/gram-empty-description-block-after-header] [fixture:
gantt/gram-empty-description-block-after-click-statement] [fixture:
gantt/gram-empty-description-block-before-task-same-line] [fixture:
gantt/gram-empty-description-blocks-adjacent] [fixture:
gantt/gram-empty-description-block-in-title-text] [fixture:
gantt/gram-empty-description-block-in-setting-text] [fixture:
gantt/gram-empty-description-block-in-task-text] [fixture:
gantt/gram-empty-description-block-in-task-data] [fixture:
gantt/gram-empty-description-block-in-callback-name] [fixture:
gantt/gram-empty-description-block-in-callback-arguments] [fixture:
gantt/gram-empty-description-block-in-href-string] [fixture:
gantt/lex-empty-description-block-between-weekday-and-day] [fixture:
gantt/gram-empty-description-block-then-percent-glued]

ブロックが文の中にあって入力が拒否されるのは、
click の文の id と最初の部分の間、2 つの部分の間です。
`click id1 accDescr {} href "u"`（くっついていても）、
`click id1 call f() accDescr {}` `href "u"`、
`click id1 href "u" accDescr {} call f()` です。
mermaid.js はブロックがないものとして受理します。
既知の差異 [`tokenless-empty-forms`](#既知の差異) です。
[fixture: gantt/div-empty-description-block-between-click-id-and-href]
[fixture: gantt/div-empty-description-block-glued-after-click-id] [fixture:
gantt/div-empty-description-block-between-call-and-href] [fixture:
gantt/div-empty-description-block-between-href-and-call]

### 空の href と空の call

**空の href** は `href` の単位と間に何もない 2 つの `"` の単位、
**空の call** は `call` の単位、`(` の単位、`)` の単位で
括弧の間が空白（改行を含む）だけのものです
（[href の文脈](#href-の文脈) と [コールバックの文脈](#コールバックの文脈)
を参照）。
mermaid.js はどちらにもトークンを読まず、ないものとして入力を受理します
（[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）。
文法のどの規則も、どこにあってもこれらを取らないので、
空の href や空の call を含む入力はここでは拒否されます。
既知の差異 [`tokenless-empty-forms`](#既知の差異) です。
独立した行、テキストの終わり、ヘッダーの直後、同じ行の別の文の後
（完結した click の文を含む）、同じ行の文の前（くっついていてもいなくても）、
click の文の中（id と最初の部分の間、部分の間）のどれでもです。
mermaid.js はどれも、その形がないものとして受理します。
`title T` の前の行の `href ""` はタイトルを持ち、
`call ()x : 1d` はタスク `x `、
`click id1 href "" call f()` は call を、`click id1 call () href "u"` は
リンクを設定します。
`href ""` か `call ()` だけが続く `click id1` と、
`click id1 href "" b : 1d` は、
click の文に部分がないので、どちらでも拒否されます。
並んだ 2 つの空の href・空の call は、最初のもので拒否されます。
`href "" call ()` は href です。
文の始まるところでその前に置かれた空の説明ブロックは文で、
拒否されるのはその後の空の href か空の call です。
`accDescr {} href ""` は href です。
click の文の中では、ブロックは文ではないので、
並んだ形の最初のもので拒否されます。
[fixture: gantt/gram-empty-href-line] [fixture: gantt/gram-empty-call-line]
[fixture: gantt/gram-empty-call-space-inside] [fixture:
gantt/gram-empty-call-line-feed-inside] [fixture: gantt/gram-empty-href-at-end]
[fixture: gantt/gram-empty-call-at-end] [fixture:
gantt/gram-empty-href-after-header-same-line] [fixture:
gantt/gram-empty-href-after-keyword-same-line] [fixture:
gantt/gram-click-href-then-empty-href] [fixture:
gantt/gram-click-call-then-empty-href] [fixture:
gantt/gram-click-call-then-empty-call] [fixture:
gantt/gram-empty-href-then-title-same-line] [fixture:
gantt/gram-empty-call-then-title-same-line] [fixture:
gantt/gram-empty-href-glued-task] [fixture: gantt/gram-empty-call-glued-task]
[fixture: gantt/gram-empty-call-tab] [fixture: gantt/gram-empty-href-two-spaces]
[fixture: gantt/div-empty-href-before-call] [fixture:
gantt/div-empty-href-glued-before-href] [fixture:
gantt/div-empty-call-before-href] [fixture:
gantt/div-empty-href-between-call-and-href] [fixture:
gantt/div-empty-call-between-href-and-call] [fixture:
gantt/div-empty-href-between-href-and-call] [fixture:
gantt/div-empty-href-and-empty-call-before-href] [fixture:
gantt/div-empty-href-and-empty-call-between-parts] [fixture:
gantt/div-empty-description-block-and-empty-href-between-parts] [fixture:
gantt/gram-empty-href-and-empty-call-line] [fixture:
gantt/gram-empty-description-block-then-empty-href-same-line] [fixture:
gantt/gram-empty-description-block-then-empty-call-same-line] [fixture:
gantt/gram-empty-href-then-empty-description-block-same-line] [fixture:
gantt/div-empty-call-and-empty-description-block-between-parts] [fixture:
gantt/gram-click-empty-href-only] [fixture: gantt/gram-click-empty-call-only]
[fixture: gantt/gram-click-empty-href-then-task]

文の始まる位置の空の説明ブロック（[空の説明ブロック](#空の説明ブロック)
を参照）と違って空の形を拒否するのは、
それがリンクや call として書かれていて mermaid.js が丸ごと捨てるもので、
何も変えない文として木に持つと読まれたように見えるからです。
ほかの図種も同じ形を拒否します
（[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）。
キーワードの後に空白のない `call()` と `href""` はタスクのテキストで、
`href "`、改行、`"` は空の href ではありません。
空の href の 2 つの引用符の間や、空の call の括弧の間のディレクティブは
単位の間にあるので、`href "%%{init: {}}%%"` と `call (%%{init: {}}%%)` は、
mermaid.js がディレクティブを除いて読むのと同じく、空の href と空の call で、
同じように拒否されます。
[fixture: gantt/lex-call-no-space-before-parenthesis] [fixture:
gantt/lex-href-no-space-before-quotes] [fixture: gantt/lex-href-line-feed-url]
[fixture: gantt/lex-empty-href-directive-between-quotes] [fixture:
gantt/lex-empty-call-directive-between-parentheses] [fixture:
gantt/div-empty-href-directive-between-quotes-before-call]

### 文法の外の拒否

mermaid.js の文法が受理し、その Db が拒否する入力が 2 つあり、
ここでも拒否されます。

- `top-axis-statement`。文法は
  [`yy.TopAxis()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L141-L141)
  を呼びますが、Db にはそれがないので、`topAxis` の文を持つテキストは、
  ほかに何を持っていても、`TypeError` で拒否されます。
  [fixture: gantt/db-top-axis-statement] [fixture:
  gantt/lex-topaxis-upper-case] [fixture: gantt/lex-topaxis-then-title]
- データがタグだけのタスク。タグを取った後、
  [`getTaskTags()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L846-L860)
  が空のリストの最初の項目を読み、テキストは `TypeError` で拒否されます。
  [fixture: gantt/gram-task-tags-only] [fixture:
  gantt/gram-task-tags-only-two]

Db はほかのどの入力でも例外を投げません。
特に、日付でない始まり、タスクでない id の後の始まり、
タスクでない id までの終わり、4 つ以上の項目のタスクは受理されます。
Db は日付を、テキストを解析するときではなく、図を描くときに計算します
（tests パッケージの要約を参照）。
[fixture: gantt/db-task-start-not-a-date] [fixture:
gantt/db-task-start-after-unknown] [fixture: gantt/db-task-end-until-unknown]
[fixture: gantt/gram-task-four-items]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  テキストの単位と文字列の単位以外の単位の中のディレクティブは、
  この仕様では入力を拒否させ、mermaid.js は受理します
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  click の id、`includes` と `excludes` のリストの項目、キーワード
  （ヘッダー、曜日名、`click`、`href`、`call`、`accTitle`、`accDescr` を含む）
  の中です。
  [fixture: gantt/div-directive-in-click-id] [fixture:
  gantt/div-directive-in-list-item] [fixture:
  gantt/div-directive-in-header-keyword] [fixture:
  gantt/div-directive-in-title-keyword] [fixture:
  gantt/div-directive-in-day-keyword] [fixture:
  gantt/div-directive-in-click-keyword] [fixture:
  gantt/div-directive-in-href-keyword] [fixture:
  gantt/div-directive-in-call-keyword] [fixture:
  gantt/div-directive-in-acc-title-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則に合う行で、テキストの単位と文字列の単位以外の単位の中にある
  無視される `;` は、ここでは入力を拒否させ、
  mermaid.js は `;` を除いて両側を 1 つとして読みます。
  規則が探す `style`、`:`、`#` は、その行の `;` より前のどこにあってもよく、
  同じ click の文の URL 文字列やコールバック引数、
  その行の文の前の説明ブロック、click の id そのものにあってもかまいません。
  `click style:#y,id;1 href "u"` は mermaid.js では `id1` のリンクを設定し、
  `click id1 href "style:#x" ca;ll f()` は call を、
  `click id1 call f(style:#x) hr;ef "u"` はリンクを設定し、
  同じ行の `accDescr { style:#x }` の後の `cl;ick id1 href "u"`、
  `weekday mon;day`、`inclusiveEnd;Dates`、`date;Format X`、`ti;tle T`、
  `excludes week;ends` は `;` のない文として読まれます。
  テキストの単位か文字列の単位の中、および 2 つの単位の間では、
  mermaid.js の読みが保たれます
  （[単位の間のトリビア](#単位の中のディレクティブ) を参照）。
  [fixture: gantt/div-ignored-semicolon-in-click-id] [fixture:
  gantt/div-ignored-semicolon-in-call-keyword] [fixture:
  gantt/div-ignored-semicolon-in-href-keyword] [fixture:
  gantt/div-ignored-semicolon-in-click-keyword] [fixture:
  gantt/div-ignored-semicolon-in-day-keyword] [fixture:
  gantt/div-ignored-semicolon-in-inclusive-keyword] [fixture:
  gantt/div-ignored-semicolon-in-dateformat-keyword] [fixture:
  gantt/div-ignored-semicolon-in-title-keyword] [fixture:
  gantt/div-ignored-semicolon-in-list-item] [fixture:
  gantt/tokens-ignored-semicolon-in-title-text] [fixture:
  gantt/tokens-ignored-semicolon-in-href-string] [fixture:
  gantt/tokens-ignored-semicolon-between-keyword-and-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があるとき、`click id1 href "u="v">w"` は
  mermaid.js では URL `u='v'>w` を持ち、ここでは文字列が 2 つ目の `"` で終わり、
  入力は拒否されます。フロントマターがなければどちらも拒否します。
  [fixture: gantt/div-html-tag-starts-in-frontmatter-href] [fixture:
  gantt/lex-html-tag-quotes-no-frontmatter]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.js は拒否します。
  [fixture: gantt/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  click の文の中（id と最初の部分の間、部分の間）の空の説明ブロックと、
  どこにあっても空の href と空の call は、この仕様では入力を拒否させ、
  mermaid.js はそれにトークンを読まずに入力を受理します
  （[空の説明ブロック](#空の説明ブロック) と
  [空の href と空の call](#空の-href-と空の-call) を参照）。
  文の始まる位置では、空の説明ブロックは文で、入力は受理されます。
  [fixture: gantt/div-empty-description-block-between-click-id-and-href]
  [fixture: gantt/div-empty-description-block-between-call-and-href] [fixture:
  gantt/div-empty-description-block-between-href-and-call] [fixture:
  gantt/div-empty-description-block-glued-after-click-id] [fixture:
  gantt/div-empty-href-before-call] [fixture:
  gantt/div-empty-href-glued-before-href] [fixture:
  gantt/div-empty-call-before-href] [fixture:
  gantt/div-empty-href-between-call-and-href] [fixture:
  gantt/div-empty-call-between-href-and-call] [fixture:
  gantt/gram-acc-descr-block-empty]
  [fixture: gantt/gram-empty-href-line] [fixture: gantt/gram-empty-call-line]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)。**
  単位の最初の文字（`}` と空白以外の文字）の直後の `%` は、
  [コメント](#コメント) の述べるとおりに読まれます。
  コメントは単位の始まる位置でだけ始まるので、その `%` は単位の文字です。
  mermaid.js はその文字と行の残りを 1 つのコメントとして読みます。
  差異は両方向です。`a% : 1d` はここではタスク、mermaid.js ではタスクなし。
  `t%itle T`、`a : 1d;%c`、`a : 1d#%c`、`dateFormat X;%c` はここでは拒否、
  mermaid.js は受理。`a :%c` はここではタスク、mermaid.js は拒否。
  [fixture: gantt/lex-colon-then-percent] [fixture:
  gantt/div-comment-after-task-text-start] [fixture:
  gantt/div-comment-after-keyword-start] [fixture:
  gantt/div-comment-after-semicolon-after-data] [fixture:
  gantt/div-comment-after-hash-after-data] [fixture:
  gantt/div-comment-after-semicolon-after-setting] [fixture:
  gantt/div-comment-after-indented-text-start] [fixture:
  gantt/div-comment-after-quote-after-string]
- **[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md)。**
  mermaid.js が直接たどり着く（[コメント](#コメント) の定め）印 `%` の
  コメントは、mermaid.js ではその後の改行を取るので、
  次の行の click の文の部分が文を続けます。
  `click id1 %c`、改行、`href "u"` はそこではリンクを設定し、
  `click id1 call f()%c`、改行、`href "u"` も同じです。
  ここではコメントはその行で終わり、`newline` の単位が文を終えるので、
  入力は拒否されます（[コメント](#コメント) を参照）。
  差異は一方向です。mermaid.js が受理し、この仕様が拒否します。
  [fixture: gantt/div-percent-comment-takes-line-feed-after-click-id] [fixture:
  gantt/div-percent-comment-takes-line-feed-after-call] [fixture:
  gantt/div-percent-comment-takes-line-feeds-after-call] [fixture:
  gantt/div-percent-comment-takes-line-feed-after-href]
- **[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.ja.md)。**
  ディレクティブの始まらない `%%{` は、
  単位の始まるどの位置でもここではコメントで
  （[コメント](#コメント) を参照）、
  mermaid.js は `%%{` に直接たどり着くところ（[コメント](#コメント) の定め）で
  入力を拒否します。単位の直後、先頭の改行を除いてちょうど 1 文字を残さない
  2 文字以上の空白の後、直接たどり着いた `%` のコメントが取る改行の後です。
  差異は一方向です。この仕様が受理し、mermaid.js が拒否します。
  [fixture: gantt/div-percent-brace-glued-after-header] [fixture:
  gantt/div-percent-brace-glued-after-keyword] [fixture:
  gantt/div-percent-brace-glued-after-string] [fixture:
  gantt/div-percent-brace-after-two-spaces] [fixture:
  gantt/div-percent-brace-after-blank-line] [fixture:
  gantt/div-percent-brace-after-glued-percent-comment] [fixture:
  gantt/div-percent-brace-after-unit-two-spaces]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこか、タスクのテキスト、タイトル、section、タスクのデータの
  `C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` は、
  mermaid.js にテキストを C4 のパーサーへ渡させ、それは拒否します。
  ここではテキストはガントチャートです。`C4Context` はどちらでもテキストです。
  [fixture: gantt/div-c4-keyword-in-task-text] [fixture:
  gantt/div-c4-keyword-in-title] [fixture: gantt/div-c4-keyword-in-section]
  [fixture: gantt/div-c4-keyword-in-task-data] [fixture:
  gantt/lex-c4context-in-title]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
  その後の空白だけの行は、ここではコメントか何もないもので、
  mermaid.js は入力を拒否します。
  その字句解析器が `%%` の後の改行をヘッダーの前の `newline` の単位として
  読むからです（[検出](#検出) を参照）。
  [fixture: gantt/header-after-bare-percent-line] [fixture:
  gantt/header-after-empty-braces-line] [fixture:
  gantt/header-after-bare-percent-line-and-whitespace-line]

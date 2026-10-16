# Journey

英語版: [journey.md](./journey.md)

mermaid.js での正本:

- [`journey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison)
- [`journeyDb.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js)
- [`user-journey/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey)
  のテスト（`*.spec.js`）

この文書は、図種 `journey`、ユーザージャーニー図を扱います。
木のノードは [ast/journey.ja.md](../ast/journey.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 21 がこの文法を選びます。
テキストが、空白の後、ちょうどこの大文字小文字の `journey` で始まるときです
（[`journeyDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDetector.ts#L9-L11)）。
`JOURNEY` はユーザージャーニー図ではなく、どの検出器にも合いません。
[fixture: journey/header-only] [fixture: journey/header-leading-whitespace]
[fixture: journey/header-upper-case]

その後、字句解析器がヘッダーをもう一度、大文字小文字を区別せず、
語の文字が続かない形で読みます（[文の文脈](#文の文脈) を参照）。
そのため `journey2` と `journeyX: 1` は、
ユーザージャーニー図として検出されて拒否され、
`journey-x: 1` はヘッダーとタスク `-x` です。
文はヘッダーと同じ行に、空白を挟んでも挟まなくても続けられ、
ヘッダーだけの入力も、後ろに改行がなくても受理されます。
`journey:` は拒否されます。
ヘッダーの後の `:` は文法の取らない単位だからです。
一方、`journey#c` と `journey%c` はヘッダーとコメントです。
[fixture: journey/header-digit-suffix] [fixture:
journey/header-word-suffix-task] [fixture: journey/header-dash-suffix-task]
[fixture: journey/header-statement-same-line] [fixture:
journey/header-task-same-line] [fixture: journey/header-section-same-line]
[fixture: journey/header-acc-title-same-line] [fixture:
journey/header-tab-then-task]
[fixture: journey/header-only] [fixture: journey/header-line-feed-only]
[fixture: journey/header-crlf] [fixture: journey/header-cr-only] [fixture:
journey/header-colon] [fixture: journey/header-hash] [fixture:
journey/header-percent]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行です。
検出はそれを読んで通り過ぎてヘッダーを見つけ、
その行はどの図種でもそうであるように、ここでは印 `%%` の図のコメントです
（[図種の検出](../common.ja.md#図種の検出) を参照）。
コメントはどのノードにも属さず、JourneyDiagram はヘッダーから始まります。
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
[fixture: journey/header-after-bare-percent-line] [fixture:
journey/header-after-empty-braces-line] [fixture:
journey/header-after-bare-percent-line-and-whitespace-line] [fixture:
journey/header-after-percent-space-line] [fixture:
journey/header-after-comment-line] [fixture:
journey/header-after-directive-line] [fixture:
journey/header-then-directive-same-line] [fixture:
journey/header-after-empty-description-block]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を
[変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして読み、
コメント領域と、行の規則が無視する `;` は、ないものとして読み通します。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）は
図のテキストの一部です。
そのため、テキストの終わりのタイトルのテキストやタスクのデータは、
そこで終わります。
[fixture: journey/lex-task-at-end-of-text] [fixture:
journey/lex-title-text-at-end-of-text]
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4、
この図独自の単位の規則を述べます。

この図の mermaid.js の字句解析器は、
文字を大文字小文字を区別せずに比べます
（[表記](../common.ja.md#表記) を参照）。
`TITLE T`、`SECTION S`、`ACCTITLE: T`、`ACCDESCR: D`、`ACCDESCR { D }` は
小文字の語と同じに読まれます。
テキストは書かれた大文字小文字を保ちます。
[fixture: journey/lex-keywords-upper-case] [fixture:
journey/lex-acc-keywords-upper-case] [fixture:
journey/lex-acc-descr-block-upper-case]
以下で**キーワード**とは、大文字小文字を区別せずに一致する語で、
規則がそう言うところでは語の文字が続かないもの
（[表記](../common.ja.md#表記) を参照）、
規則がそう言うところでは空白が続くものです。
`journey2` はヘッダーを持たず、
`titles`、`title-x`、`sectionx` は、
語の後に空白が続かないのでタスクのテキストです
（[キーワードとその後に続くもの](#文の文脈) を参照）。
[fixture: journey/header-digit-suffix] [fixture:
journey/lex-title-word-suffix-task] [fixture: journey/lex-title-dash-task]
[fixture: journey/lex-section-word-suffix-task]

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
タイトルの文脈、説明の文脈、説明ブロックの文脈で終わると、入力は拒否されます。
そのため、後ろに何もない `accTitle:`（コロンの後に空白や改行があっても）、
後ろに何もない `accDescr:`、`}` のない `accDescr {`
（後ろにテキストがあってもなくても）は拒否されます。
後ろに行が続いても同じです。これらの文脈の規則は改行を読むからです。
[fixture: journey/lex-acc-title-at-end] [fixture:
journey/lex-acc-title-space-at-end] [fixture:
journey/lex-acc-title-line-feed-at-end] [fixture:
journey/lex-acc-descr-at-end] [fixture: journey/lex-acc-descr-block-unclosed]
[fixture: journey/lex-acc-descr-block-unclosed-lines] [fixture:
journey/lex-acc-descr-block-unclosed-empty]

**空白。** この文書の空白は [表記](../common.ja.md#表記) の集合です。
U+00A0、U+2028、U+3000、U+FEFF、垂直タブ、改ページは、
規則が空白を読むところではどこでも空白で、
規則がそう言うところでは改行も空白です。
文の文脈では、単位の始まる位置の 1 つ以上の改行の並びは `newline` の単位で
（規則 2）、それ以外の空白の並びは、改行を含めて、
単位の一部にならずに単位の間にあります（規則 3）。
`journey`、U+00A0、`title T` はヘッダーとタイトルで、
U+00A0 の代わりに U+2028 でも同じです。
キーワードの規則は、それぞれが言うとおりに自分で空白を読み、
文のテキストは空白を自分の文字として取ります。
タスクのテキストの前の U+3000 は空白で、
コロンの前の U+3000 はテキストの文字です。
タスクのデータの中の改ページはデータの文字で、
タスクの前の U+FEFF と垂直タブは空白です。
[fixture: journey/lex-whitespace-nbsp-between-units] [fixture:
journey/lex-whitespace-line-separator-between-units] [fixture:
journey/lex-whitespace-ideographic-space-around-task] [fixture:
journey/lex-whitespace-form-feed-in-data] [fixture:
journey/lex-whitespace-bom-before-task] [fixture:
journey/lex-whitespace-vertical-tab-before-task] [fixture:
journey/lex-newline-runs] [fixture:
journey/lex-space-then-line-feeds-then-task]

**エンティティ。** エンティティは、字句解析器がテキストを読む前に、
そのプレースホルダーとして読まれ
（[エンティティ](../common.ja.md#エンティティ) を参照）、
プレースホルダーは ASCII の外の文字でできているので、
その `#` と `;` は、タイトルのテキスト、section のテキスト、
タスクのテキスト、タスクのデータを終えず、
テキストはエンティティを書かれたとおりに保ちます。
`a#amp; b: 5` は説明が `a#amp; b` のタスクで、
`title #x;` はタイトル `#x;` を持ち、
人、アクセシビリティのタイトルと説明、説明ブロックもエンティティを持てます。
エンティティの後の `#` や `;` は、いつもどおりテキストを終えます。
[fixture: journey/entity-placeholder-in-task-text] [fixture:
journey/entity-placeholder-in-title] [fixture:
journey/entity-placeholder-in-section] [fixture:
journey/entity-placeholder-in-person] [fixture:
journey/entity-placeholder-in-acc-title] [fixture:
journey/entity-placeholder-in-acc-descr] [fixture:
journey/entity-placeholder-in-acc-descr-block] [fixture:
journey/entity-placeholder-then-hash-in-title] [fixture:
journey/entity-placeholder-then-semicolon-in-data]
HTML タグの属性の引用符は、どの図種でも同じく `'` として読まれます
（[HTML 属性の引用符](../common.ja.md#html-属性の引用符) を参照）。
`title` `<b a="x">t</b>` は `a='x'` を持つタイトルで、
タグの外の引用符は、タスク `A "x"` のように引用符のままです。
[fixture: journey/lex-html-tag-in-title] [fixture:
journey/lex-quotes-in-task-text]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを除いた後のテキストを読むのと同じに読みます。
そこで
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が単位に当てはまります。
テキストの単位の中のディレクティブは mermaid.js の読みを保ち、
それ以外の単位の中のディレクティブは入力を拒否させます。
この図種には名前の単位も文字列の単位もありません。
**テキストの単位**は、`title-text`、`section-text`、`task-text`、
`score`、`person`、`ignored-data`、`acc-title-text`、
`acc-description-text`、`acc-description-block-text` です。

- `a%%{init: {}}%%b: 5` はタスク `ab`、
  `A: 1%%{init: {}}%%0` はスコア `10`、
  `A: 5: M%%{init: {}}%%e` は人 `Me`、
  `title a%%{init: {}}%%b` はタイトル `ab`、
  `section S%%{init: {}}%%T` は section `ST`、
  `accTitle: a%%{init: {}}%%b` はアクセシビリティのタイトル `ab` で、
  `accDescr: a%%{init: {}}%%b` と `accDescr { a%%{init: {}}%%b }` の説明も
  同じです。mermaid.js と同じです。
  `A: 5: Me: a%%{init: {}}%%b` では、
  ディレクティブは無視されるデータの中にあります。
  `A: 5: Me: a %%{init: {}}%%b` では、その前の空白は無視されるデータの文字です。
  [fixture: journey/lex-directive-in-task-text] [fixture:
  journey/lex-directive-in-score] [fixture: journey/lex-directive-in-person]
  [fixture: journey/lex-directive-in-title-text] [fixture:
  journey/lex-directive-in-section-text] [fixture:
  journey/lex-directive-in-acc-title] [fixture:
  journey/lex-directive-in-acc-descr] [fixture:
  journey/lex-directive-in-acc-descr-block] [fixture:
  journey/lex-directive-in-ignored-data] [fixture:
  journey/lex-directive-after-space-in-ignored-data]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `title %%{init: {}}%%T`、`title%%{init: {}}%% T`、
  `A %%{init: {}}%%: 5`、`A:%%{init: {}}%% 5`、`A: 5%%{init: {}}%%: Me`、

  `accTitle%%{init: {}}%%: T`、`accDescr %%{init: {}}%%{ d }`、
  行の続く `journey%%{init: {}}%%` は、
  ディレクティブがないものとして読まれます。
  `A %%{init: {}}%%: 5` のタスクは `A ` で、
  その空白はタスクのテキストの文字です。
  [fixture: journey/lex-directive-between-title-and-text] [fixture:
  journey/lex-directive-between-title-and-whitespace] [fixture:
  journey/lex-directive-between-task-text-and-colon] [fixture:
  journey/lex-directive-after-task-colon] [fixture:
  journey/lex-directive-before-second-colon] [fixture:
  journey/lex-directive-between-acc-title-and-colon] [fixture:
  journey/lex-directive-between-acc-descr-and-brace] [fixture:
  journey/header-then-directive-same-line]

- `jour%%{init: {}}%%ney`、`ti%%{init: {}}%%tle T`、
  `sec%%{init: {}}%%tion S`、`acc%%{init: {}}%%Title: T`、
  `acc%%{init: {}}%%Descr: d`、`acc%%{init: {}}%%Descr { d }` では、
  ディレクティブがキーワードの中にあります。
  入力は拒否され、mermaid.js は 2 つの部分を 1 つとして読んで受理します
  （[既知の差異](#既知の差異) を参照）。
  [fixture: journey/div-directive-in-header-keyword] [fixture:
  journey/div-directive-in-title-keyword] [fixture:
  journey/div-directive-in-section-keyword] [fixture:
  journey/div-directive-in-acc-title-keyword] [fixture:
  journey/div-directive-in-acc-descr-keyword] [fixture:
  journey/div-directive-in-acc-descr-block-keyword]

**単位の間のトリビア。** [common.ja.md](../common.ja.md) のトリビアは、
この図の単位と次のように出会います。
単独の CR は行終端で、改行として読まれます
（[行終端](../common.ja.md#行終端) を参照）。
ヘッダー、タイトル、section、タスクは、
単独の CR の間でも CRLF の改行の間でも、改行の間と同じに読まれます。
[fixture: journey/header-cr-only] [fixture: journey/lex-title-cr-value]
[fixture: journey/lex-section-cr-value] [fixture: journey/header-crlf]
[fixture: journey/lex-title-crlf-value] [fixture:
journey/lex-section-crlf-value]
2 つの単位の間の閉じたディレクティブは何もないものとして読まれ、
その周りの空白は文脈の規則で読まれます。
タスク、タイトル、section の行の終わりの閉じたディレクティブは、
テキストの後にあってもテキストにくっついていても何も終えず、
次の行はいつもどおり読まれます。
その前の空白はタイトルのテキストや section のテキストの文字なので、
`title T %%{init: {}}%%` はタイトル `T `、
`section S %%{init: {}}%%` は section `S ` を持ち、
テキストにくっつけると `T` と `S` を持ちます。
アクセシビリティのタイトルと人は両端の空白なしで読まれるので、
そのようなディレクティブの前の空白は値の外です。
`accTitle: T  %%{init: {}}%%` はアクセシビリティのタイトル `T` を、
`A: 5: Me %%{init: {}}%%` は人 `Me` を持ちます。
[fixture: journey/lex-directive-at-end-of-data-line] [fixture:
journey/lex-directive-glued-at-end-of-data] [fixture:
journey/lex-directive-at-end-of-title-line] [fixture:
journey/lex-directive-glued-at-end-of-title] [fixture:
journey/lex-directive-at-end-of-section-line] [fixture:
journey/lex-directive-glued-at-end-of-section] [fixture:
journey/lex-directive-after-acc-title-text] [fixture:
journey/lex-directive-after-person]
閉じていないディレクティブはテキストの残りを取ります
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置)
を参照）。
`A: 5 %%{init: {}` に行 `B: 3` が続くものは、スコアが `5` の
1 つのタスク `A` を持ち、
`journey`、行 `%%{init: {}`、行 `A: 1` はタスクを持たず、
タスクの行が続く `title T %%{init: {}` はタイトル `T ` を持ち、
タスクを持ちません。
[fixture: journey/tokens-unclosed-directive-in-data-line] [fixture:
journey/tokens-unclosed-directive-after-header] [fixture:
journey/tokens-unclosed-directive-in-title]
コメント行は、字句解析器がテキストを読む前に除かれます。
説明ブロックの中、キーワードとその後に続くものの間でも同じです。
`title`、コメント行、`T` はタイトル `T` を持ち、
`section` と `S`、`accTitle:` と `T` も同じです。
コメント行だけを持つブロックは空の説明ブロックです。
[fixture: journey/tokens-comment-line-in-acc-block] [fixture:
journey/tokens-comment-line-only-in-acc-block] [fixture:
journey/tokens-comment-line-after-title-keyword] [fixture:
journey/tokens-comment-line-after-section-keyword] [fixture:
journey/tokens-comment-line-after-acc-title-colon]
`style` の規則に合う行
（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行)
を参照）では、無視される `;` は読み通されます。
規則が探す `style`、`:`、`#` は行の中で `;` より前にあるので、
`;` はある `#` より後にあります。
その `#` が始める図のコメントの中、アクセシビリティのタイトルや説明の中、
説明ブロックの中、
または、文の前の同じ行の説明ブロックが `#` を持つときは、その後の文の中です。
テキストの単位の中では、2 つの部分が mermaid.js と同じく 1 つとして読まれます。
同じ行の `accDescr { style:#x }` の後では、
`A;B: 5` はタスク `AB`、`A: 5;6` はスコア `56`、`A: 5: M;e` は人 `Me`、
`title T;U` はタイトル `TU`、`section S;T` は section `ST` です。
`accTitle: style:#x;` はアクセシビリティのタイトル `style:#x` を持ち、
説明 `accDescr: style:#x;` とブロック `accDescr { style:#x; }` も同じです。
`title style:#x;` はタイトル `style:` とコメントを持ちます。
キーワードとその空白の間でも `;` は読み通され、
そのようなブロックの後の `title; T` はタイトル `T` です。
`;` がその行の最後のものでないときは無視されず、
その前の `#` はエンティティを作ります。
`title style:#x;y;` は、タイトル `style:`、`#x;` のプレースホルダー、
`y` を持ちます。
キーワードの中では、無視される `;` は入力を拒否させ、mermaid.js は受理します
（[既知の差異](#既知の差異) を参照）。
[fixture: journey/tokens-ignored-semicolon-in-task-text] [fixture:
journey/tokens-ignored-semicolon-in-score] [fixture:
journey/tokens-ignored-semicolon-in-person] [fixture:
journey/tokens-ignored-semicolon-in-title-text] [fixture:
journey/tokens-ignored-semicolon-in-section-text] [fixture:
journey/tokens-ignored-semicolon-in-acc-title] [fixture:
journey/tokens-ignored-semicolon-in-acc-descr] [fixture:
journey/tokens-ignored-semicolon-in-acc-block] [fixture:
journey/tokens-ignored-semicolon-in-hash-comment] [fixture:
journey/tokens-ignored-semicolon-between-keyword-and-whitespace] [fixture:
journey/tokens-ignored-semicolon-first-of-two-in-title]

### 文の文脈

文の文脈では、字句解析器は次の規則をこの順に試します。

1. `{` が続かない `%`: `%` から行の終わりまでの図のコメント
   （[コメント](#コメント) を参照）。
   [fixture: journey/lex-percent-comment-line] [fixture:
   journey/lex-percent-comment-glued-after-header] [fixture:
   journey/lex-percent-brace-task]
2. 1 つ以上の改行: `newline` の単位。[fixture: journey/lex-newline-runs]
3. 改行を含む 1 つ以上の空白文字: 何もなし。
   [fixture: journey/lex-space-then-line-feeds-then-task]
4. `#`: `#` から行の終わりまでの図のコメント
   （[コメント](#コメント) を参照）。
   [fixture: journey/lex-hash-comment-line] [fixture:
   journey/lex-hash-comment-after-data]
5. キーワード `journey`: `header` の単位。[fixture: journey/header-only]
6. `title`、改行を含む 1 つの空白文字、
   `#`、`;`、改行以外の 1 つ以上の文字: `title` の単位と `title-text` の単位。
   テキストは 1 つの空白文字の後の文字です。
   [fixture: journey/db-title-statement] [fixture:
   journey/lex-title-two-spaces] [fixture: journey/lex-title-tab] [fixture:
   journey/lex-title-nbsp] [fixture:
   journey/lex-title-line-feed-value] [fixture: journey/db-title-ends-at-hash]
   [fixture: journey/lex-title-semicolon] [fixture:
   journey/lex-title-colon-inside] [fixture: journey/lex-title-percent-inside]
   [fixture: journey/lex-title-trailing-spaces] [fixture:
   journey/lex-title-then-task-same-line]
7. `accTitle`、改行を含む 0 個以上の空白文字、`:`、
   改行を含む 0 個以上の空白文字: `accTitle` の単位と `:` の単位。
   タイトルの文脈に入ります。
   [fixture: journey/db-acc-title] [fixture: journey/lex-acc-title-no-space]
   [fixture: journey/lex-acc-title-spaces-around-colon] [fixture:
   journey/lex-acc-title-line-feed-before-colon] [fixture:
   journey/gram-acc-title-line-feed-then-text]
8. `accDescr`、改行を含む 0 個以上の空白文字、`:`、
   改行を含む 0 個以上の空白文字: `accDescr` の単位と `:` の単位。
   説明の文脈に入ります。
   [fixture: journey/db-acc-descr] [fixture:
   journey/lex-acc-descr-line-feed-before-colon] [fixture:
   journey/gram-acc-descr-line-feed-then-text]
9. `accDescr`、改行を含む 0 個以上の空白文字、`{`、
   改行を含む 0 個以上の空白文字: `accDescr` の単位と `{` の単位。
   説明ブロックの文脈に入ります。
   [fixture: journey/db-acc-descr-block] [fixture:
   journey/lex-acc-descr-block-no-space] [fixture:
   journey/lex-acc-descr-block-spaces] [fixture:
   journey/lex-acc-descr-block-line-feed-before-brace]
10. `section`、改行を含む 1 つの空白文字、
    `#`、`:`、`;`、改行以外の 1 つ以上の文字:
    `section` の単位と `section-text` の単位。
    テキストは 1 つの空白文字の後の文字です。
    [fixture: journey/db-sections] [fixture:
    journey/lex-section-two-spaces] [fixture: journey/lex-section-tab]
    [fixture: journey/lex-section-line-feed-value] [fixture:
    journey/db-section-ends-at-hash] [fixture: journey/lex-section-colon]
    [fixture: journey/lex-section-semicolon] [fixture:
    journey/lex-section-whitespace-only]
11. `#`、`:`、`;`、改行以外の 1 つ以上の文字: `task-text` の単位。
    [fixture: journey/db-task-before-section] [fixture:
    journey/lex-task-text-keyword-inside] [fixture:
    journey/lex-quotes-in-task-text] [fixture: journey/lex-task-text-brace]
    [fixture: journey/lex-task-text-percent-inside] [fixture:
    journey/lex-task-text-nbsp] [fixture: journey/lex-task-text-line-separator]
    [fixture: journey/lex-task-text-tab-inside] [fixture:
    journey/db-task-description-spaces]
12. `:` と、`#`、`;`、改行以外の 1 つ以上の文字の**データのテキスト**:
    `:` の単位とデータのテキストの単位（[タスク](#タスク) を参照）。
    [fixture: journey/db-task-people] [fixture:
    journey/db-task-data-ends-at-hash] [fixture: journey/lex-task-semicolon]
    [fixture: journey/gram-task-data-whitespace-only] [fixture:
    journey/lex-task-data-to-end-of-line] [fixture:
    journey/lex-task-data-leading-tab] [fixture:
    journey/lex-task-data-line-separator] [fixture: journey/header-colon-data]
13. `:`: 文法のどの規則も取らない `:` の単位。
    [fixture: journey/lex-task-colon-at-end] [fixture:
    journey/lex-task-colon-then-hash] [fixture: journey/header-colon] [fixture:
    journey/lex-section-colon-at-end]
14. `;`: 文法のどの規則も取らない `;` の単位。
    [fixture: journey/lex-semicolon-line] [fixture:
    journey/lex-task-semicolon] [fixture: journey/lex-title-semicolon]

改行、`#`、`:`、`;` 以外のどの文字も、前の規則が合わないところでは
タスクのテキストの文字なので、
行は文法によってだけ拒否されます。
データのないタスクのテキスト（`a`、`}`、`title`）、`:` の単位、
`;` の単位がそうです。
`;` は文の文脈のどの単位の文字でもありません。
タイトルのテキスト、section のテキスト、タスクのテキスト、
タスクのデータの後でも、ヘッダーの後でも、説明ブロックの後でも、
1 行だけでも、`;` の単位で、入力は拒否されます。
[fixture: journey/lex-task-text-only] [fixture: journey/lex-task-brace-line]
[fixture: journey/lex-title-at-end] [fixture: journey/lex-task-colon-at-end]
[fixture: journey/lex-semicolon-line] [fixture: journey/lex-title-semicolon]
[fixture: journey/lex-section-semicolon] [fixture:
journey/lex-task-semicolon] [fixture: journey/lex-task-semicolon-then-task]
[fixture: journey/header-semicolon] [fixture:
journey/lex-semicolon-after-block]
順序から次のことが言えます。

- 単位の始まる位置の `%` は、`{` が続かなければコメントで、
  テキストの中では、テキストの文字です（[コメント](#コメント) を参照）。
  `%{x}: 5` は、空白の後でもタスク `%{x}` です。
  [fixture: journey/lex-percent-brace-task] [fixture:
  journey/lex-percent-brace-task-indented] [fixture:
  journey/lex-percent-comment-in-title-text]
- 文は改行ではなく自分の単位で終わります。
  `newline` の単位は文法にとって 1 つの行で、
  複数の文が 1 つの行を共有できます。
  `journey title T`、`journey A: 5`、`accDescr { d } A: 5`、
  `accDescr { d }accDescr { e }` がそうです。
  一方、タイトルのテキスト、section のテキスト、タスクのデータは、
  `#` か `;` までの行の残りを取るので、
  `title T A: 5` はタイトル `T A: 5` で、
  `A: 5 B: 3` はスコアの部分が `5 B`、人が `3` の 1 つのタスク `A` です。
  `section S A: 5` は section `S A` にデータが続くもので、拒否されます。
  [fixture: journey/header-statement-same-line] [fixture:
  journey/header-task-same-line] [fixture:
  journey/gram-acc-descr-block-then-task-same-line] [fixture:
  journey/gram-acc-descr-blocks-same-line] [fixture:
  journey/lex-title-then-task-same-line] [fixture:
  journey/gram-task-then-task-same-line] [fixture:
  journey/lex-section-then-task-same-line] [fixture:
  journey/gram-empty-lines-and-indentation]
- 空白の単位や `newline` の単位は、まだ完全でない文を終えません。
  2 行に分けた `a` と `: 5`、改行が続く `a:` は拒否されます。
  [fixture: journey/lex-task-line-feed-before-colon] [fixture:
  journey/lex-task-colon-line-feed-task]

**キーワードとその後に続くもの。**
`journey` は、語の文字が続かないところでだけキーワードです。
後ろの語の文字は語全体をタスクのテキストにし
（`journey2` と `journeyX: 1` はヘッダーを持たず、拒否されます）、
後ろの `-`、`{`、`"`、`:`、`#`、`%`、改行、テキストの終わりは、
キーワードを終えます。
`journey-x: 1` はヘッダーとタスク `-x`、
`journey{: 1` はヘッダーとタスク `{`、
`journey"x": 1` はヘッダーとタスク `"x"`、
`journey#c` と `journey%c` はヘッダーとコメントで、
`journey:` は拒否されます。`:` の単位はどの規則も取らないからです。
ASCII の外の文字も語の文字ではありません。
`journeyé: 5` はヘッダーとタスク `é` です。
[fixture: journey/header-digit-suffix] [fixture:
journey/header-word-suffix-task] [fixture: journey/header-dash-suffix-task]
[fixture: journey/header-brace-suffix-task] [fixture:
journey/header-quote-suffix-task] [fixture: journey/header-hash] [fixture:
journey/header-percent] [fixture: journey/header-colon] [fixture:
journey/header-non-ascii-letter-task] [fixture: journey/header-line-feed-only]
[fixture: journey/header-only]
`title` と `section` は、後ろにちょうど 1 つの空白文字（改行でもよい）が続き、
その後にテキストの文字が少なくとも 1 つあるときだけキーワードです。
`title`、改行、`T` はタイトル `T` を持ち、`section` と `S` も同じです。
2 つ目の改行の後、空白と改行の後、`#` の位置、テキストの終わり、
`section` では `:` の位置のように、テキストが始まれないところでは、
語はデータのあるなしにかかわらずタスクのテキストです。
`title\n\nT`、`title`、`title `、`section`、`section\n\nS`、
`title#x`、`section#x`、`title%x`、`section%x` は拒否され、
`title:T` と `section:S` は説明がその語のタスクで、
`titles: 5`、`title2: 5`、`title-x: 5`、`title{: 5`、`title"x": 5`、
`titleé: 5`、`sectionx: 5`、`section2: 5`、`section-x: 5`、
`section{: 5`、`section"x": 5` はタスクです。
テキストが空白だけのタイトルや section も読まれます。
行の終わりの `title` と 2 つの空白は空白 1 つのタイトルを持ち、
`section` も同じです。
[fixture: journey/lex-title-line-feed-value] [fixture:
journey/lex-section-line-feed-value] [fixture:
journey/lex-title-blank-line-then-text] [fixture:
journey/lex-title-space-line-feed-then-text] [fixture:
journey/lex-title-at-end] [fixture: journey/lex-title-space-at-end] [fixture:
journey/lex-section-at-end] [fixture:
journey/lex-section-blank-line-then-text] [fixture:
journey/lex-section-space-line-feed-then-text] [fixture:
journey/lex-title-hash] [fixture: journey/lex-section-hash] [fixture:
journey/lex-title-percent] [fixture: journey/lex-title-quote-task] [fixture:
journey/lex-title-colon-task] [fixture: journey/lex-section-colon-task]
[fixture: journey/lex-title-word-suffix-task] [fixture:
journey/lex-title-digit-suffix-task] [fixture: journey/lex-title-dash-task]
[fixture: journey/lex-title-brace-task] [fixture:
journey/lex-title-non-ascii-letter-task] [fixture:
journey/lex-section-word-suffix-task] [fixture:
journey/lex-section-digit-suffix-task] [fixture:
journey/lex-section-dash-task] [fixture: journey/lex-section-percent] [fixture:
journey/lex-section-brace-task] [fixture: journey/lex-section-quote-task]
[fixture: journey/lex-title-whitespace-only]
[fixture: journey/lex-section-whitespace-only]
`accTitle` と `accDescr` は、空白を挟んでも挟まなくても、
後ろに `:` か `{` があるときだけキーワードです。
`accTitlex: T`、`accTitle2: T`、`accTitle-: T`、`accTitle{: T`、
`accDescrx: T` は説明がその語のタスクで、
`accTitle#x`、`accTitle%x`、テキストの終わりの `accTitle` や `accDescr` は
データのないタスクのテキストで拒否され、
`accTitle`、改行、`: T` はアクセシビリティのタイトル `T` を持ちます。
[fixture: journey/lex-acc-title-word-suffix-task] [fixture:
journey/lex-acc-title-digit-suffix-task] [fixture:
journey/lex-acc-title-dash-task] [fixture: journey/lex-acc-title-brace-task]
[fixture: journey/lex-acc-title-hash] [fixture: journey/lex-acc-title-percent]
[fixture: journey/lex-acc-title-keyword-at-end] [fixture:
journey/lex-acc-descr-keyword-at-end] [fixture:
journey/lex-acc-descr-word-suffix-task] [fixture:
journey/lex-acc-title-line-feed-before-colon] [fixture:
journey/lex-acc-descr-block-line-feed-before-brace]

### アクセシビリティの値

タイトルの文脈には `accTitle:` とその空白の後（文の文脈の規則 7）、
説明の文脈には `accDescr:` とその空白の後（規則 8）、
説明ブロックの文脈には `accDescr {` とその空白の後（規則 9）に入ります。

タイトルの文脈と説明の文脈の規則は 1 つです。
改行以外の 1 つ以上の文字:
タイトルの文脈では `acc-title-text` の単位、
説明の文脈では `acc-description-text` の単位。文脈を出ます。
コロンの後の空白は改行を含めてコロンと一緒に読まれるので、
テキストは、コロンの行かその後の行の、空白でない最初の文字から始まり、
その行の終わりまで、`;`、`#`、`:`、`%%` を含めて続きます。
`accTitle:`、改行、`title X` は、アクセシビリティのタイトル `title X` を持ち、
タイトルを持ちません。
テキストはこれらの文脈では終われないので、
後ろに空白しかない `accTitle:` は拒否されます。
[fixture: journey/db-acc-title] [fixture:
journey/gram-acc-title-hash-semicolon] [fixture:
journey/gram-acc-title-two-colons] [fixture:
journey/lex-percent-comment-in-acc-title] [fixture:
journey/gram-acc-title-line-feed-then-text] [fixture:
journey/gram-acc-title-blank-lines-then-text] [fixture:
journey/gram-acc-title-takes-title-line] [fixture:
journey/gram-acc-descr-semicolon-start] [fixture:
journey/gram-acc-descr-line-feed-then-text] [fixture:
journey/lex-acc-title-at-end] [fixture: journey/lex-acc-title-space-at-end]
[fixture: journey/lex-acc-descr-at-end]

説明ブロックの文脈では、字句解析器は次の規則をこの順に試します。

1. `}`: `}` の単位。文脈を出ます。[fixture: journey/db-acc-descr-block]
2. 改行を含む、`}` 以外の 1 つ以上の文字:
   `acc-description-block-text` の単位。
   [fixture: journey/db-acc-descr-block] [fixture:
   journey/gram-acc-descr-block-brace-inside] [fixture:
   journey/gram-acc-descr-block-hash-semicolon]

`{` の後の空白は改行を含めて波括弧と一緒に読まれるので、
ブロックのテキストは空白でない文字から始まり、`}` の直前で終わり、
`}` の前の空白を含みます。
波括弧の間が空白だけのブロックはテキストの単位を持ちません
（[空の説明ブロック](#空の説明ブロック) を参照）。
テキストは説明ブロックの文脈では終われません。
`}` の後の 2 つ目の `}` はデータのないタスクのテキストなので、
`accDescr {d}}` は拒否されます。
[fixture: journey/db-acc-descr-block] [fixture:
journey/gram-acc-descr-block-empty] [fixture:
journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/lex-acc-descr-block-unclosed] [fixture:
journey/gram-acc-descr-block-double-close]

### コメント

字句解析器は単位のほかに**図のコメント**を読みます。
行の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
これは [common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器がテキストを読む前に除かれます。
図のコメントは行の途中から始まることができ、
`%%` だけの行、`% c`、`%x`、`%%{ }%%` の行は、
コメント行ではなく図のコメントです。
[fixture: journey/lex-hash-comment-line] [fixture:
journey/lex-bare-percent-line-after-task] [fixture:
journey/lex-percent-comment-line] [fixture: journey/lex-percent-x-line]
[fixture: journey/lex-percent-brace-line-after-task]

図のコメントは、文の文脈で単位の始まる位置の
`#`（規則 4）か、`{` が続かない `%`（規則 1）から始まり、
改行まで続きます。改行はその一部ではありません。
図のコメントの**印**は、`#` で始まるなら `#`、`%%` で始まるなら `%%`、
それ以外なら `%` で、その値は印の後のテキストです。
`# c` の値は空白と `c`、`%% c` と `% c` の値も同じで、
`%%` だけの値は空、`%%{ }%%` の値は `{ }%%` です。
ディレクティブを始めない `%%{`
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）は、
最初の `%` に `%` が続くので、
単位の始まる位置ではどこでもそのようなコメントです。
1 行だけの場合、ヘッダーの直後、説明ブロックの直後、
同じ行のヘッダーと空白の後がそうで、行の残りを取ります。
この図の mermaid.js の字句解析器には、gantt の字句解析器
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L18-L18)）
が持つ `%%{` の規則がないので、
前にどんな空白があっても、
単位の始まる位置の `%%{ }%%` はどちらでもコメントです。
ヘッダーや説明ブロックと空白 2 つの後、改行と空白 2 つの後、空行の後がそうです。
印は字句解析器が読むとおりディレクティブのないテキストで見つけ、
値はコメント行と同じく、印の後のソースのテキストで、ディレクティブを含みます。
`journey %`、ディレクティブ、`% c` では、印は `%%` です。
[fixture: journey/lex-hash-comment-line] [fixture:
journey/lex-hash-comment-after-data] [fixture:
journey/lex-percent-comment-line] [fixture:
journey/lex-bare-percent-line-after-task] [fixture:
journey/lex-percent-brace-line-after-task] [fixture:
journey/lex-percent-brace-glued-after-header] [fixture:
journey/lex-percent-brace-glued-after-block] [fixture:
journey/lex-percent-brace-after-header-space] [fixture:
journey/lex-percent-brace-after-header-two-spaces] [fixture:
journey/lex-percent-brace-after-block-two-spaces] [fixture:
journey/lex-percent-brace-after-blank-line] [fixture:
journey/lex-percent-comment-glued-after-header] [fixture:
journey/lex-percent-comment-after-header] [fixture:
journey/lex-percent-comment-glued-after-block] [fixture:
journey/lex-percent-comment-after-block] [fixture:
journey/lex-percent-mark-split-by-directive] [fixture:
journey/lex-directive-in-percent-comment]
単位の始まる位置で `{` が続く `%` は、タスクのテキストの文字です。
`%{x}: 5` はタスク `%{x}` で、`%{x}` だけは拒否されます。
[fixture: journey/lex-percent-brace-task] [fixture:
journey/lex-percent-brace-task-indented] [fixture:
journey/lex-percent-brace-text-only]

ほかの単位の中では、`#` はその位置で単位を終えてコメントを始めます。
タイトルのテキスト、section のテキスト、タスクのテキスト、
タスクのデータがその前で止まるからです。
`%` は、タイトルのテキスト、section のテキスト、タスクのテキスト、
タスクのデータ、アクセシビリティのタイトルと説明、説明ブロックの文字です。
そのため、`A#B: 5` はデータのないタスクのテキスト `A` とコメントで、拒否され、
`a: 5 %% c` は数でないスコアの部分 `5 %% c` を持ち、
`A %% B: 5` はタスク `A %% B` です。
[fixture: journey/lex-hash-ends-task-text] [fixture:
journey/lex-percent-comment-in-title-text] [fixture:
journey/lex-percent-comment-in-section-text] [fixture:
journey/lex-task-text-percent-inside] [fixture:
journey/lex-percent-comment-in-task-data] [fixture:
journey/lex-percent-comment-in-acc-title] [fixture:
journey/lex-percent-in-acc-descr] [fixture:
journey/lex-percent-in-acc-descr-block]

mermaid.js は `%` をもう 1 つの読み方で読みます。
単位の始まりで、`}` でも空白でもない文字の直後に `%%` があるところで、
この規則と食い違います。
mermaid.js はその文字と行の残りを 1 つのコメントとして読みます
（[既知の差異](#既知の差異) を参照）。
単位の始まる位置にない `%%` は、規則 11 と規則 12 が言うとおり、
それを持つ単位の文字で、単位の最初の文字の直後でも同じです。
`A%%B: 5` はここではタスク `A%%B` で、mermaid.js ではタスクのないコメントです。
`A: 5;%% c`、`title x;%% c`、`journey;%% c`、`section a:%% c`、
`journey:%% c`、`accDescr { x }a%% c` はここでは拒否されます。
`;`、データの付いた `:`、データのないタスクのテキストを、
どの規則も取らないからです。mermaid.js は受理します。
`A:%% c` はここではスコアの部分が `%% c` のタスク `A` で、
mermaid.js では拒否されます。
そのコメントがタスクのテキストからデータを奪うからです。
`a%: 5` はどちらでもタスク `a%` で、
`}%% c` はどちらでもデータのないタスクのテキストです。
`%%` の前の `#` は、どちらにもコメントを読ませます。
[fixture: journey/div-comment-after-task-text-start] [fixture:
journey/div-comment-after-indented-task-text-start] [fixture:
journey/div-comment-after-semicolon-after-data] [fixture:
journey/div-comment-after-semicolon-after-title] [fixture:
journey/div-comment-after-semicolon-after-header] [fixture:
journey/div-comment-after-colon-after-section] [fixture:
journey/div-comment-after-colon-after-header] [fixture:
journey/div-comment-after-block-character] [fixture:
journey/div-comment-after-task-colon] [fixture:
journey/lex-single-percent-after-character] [fixture:
journey/lex-brace-before-percent] [fixture: journey/lex-hash-before-percent]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
`task-text` のような単位の名前は、その名前の 1 つの単位を表し、
二重引用符の中のテキストは、`"title"` や `":"` のように、
そのテキストが名指す単位を表します。
文法は
[`journey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L44-L67)
の文法を言い直したもので、同じ単位の並びを受理します。
ただし、mermaid.js がトークンを読まない空の説明ブロックは別です
（[空の説明ブロック](#空の説明ブロック) を参照）。

以下の各規則は、[ast/journey.ja.md](../ast/journey.ja.md) で定める
木のノードを作ります。

| 規則                                                                                                                                 | ノード                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `diagram`                                                                                                                            | JourneyDiagram                                                                             |
| `task-statement`                                                                                                                     | JourneyTaskStatement                                                                       |
| `title-statement`                                                                                                                    | JourneyTitleStatement                                                                      |
| `section-statement`                                                                                                                  | JourneySectionStatement                                                                    |
| `accessibility-statement`                                                                                                            | JourneyAccTitleStatement、JourneyAccDescrStatement、JourneyAccDescrBlockStatement のどれか |
| `empty-description-block`                                                                                                            | テキストのない JourneyAccDescrBlockStatement。それ自体が 1 つの文です                      |
| `title-text`、`section-text`、`task-text`、`score`、`person`、`acc-title-text`、`acc-description-text`、`acc-description-block-text` | JourneyLiteral                                                                             |
| `ignored-data`                                                                                                                       | JourneyIgnoredText                                                                         |

### 図と文

```text
diagram   = header line*
header    = "journey"
line      = statement | newline
statement = task-statement
          | title-statement
          | section-statement
          | accessibility-statement
          | empty-description-block
```

図は、ヘッダーと、任意の数の行です。各行は文か `newline` の単位です。
文を区切るものはありません。
各文は自分の最後の単位で終わり、次の文は同じ行に、
空白を挟んでも挟まなくても、または後の行に続けられます。
2 つの文の間の `newline` の単位は 1 つの行です。
文の中の、その単位の間の `newline` の単位は、どの規則も取らず、
入力は拒否されます（[文の文脈](#文の文脈) を参照）。
規則 13 の `:` の単位と規則 14 の `;` の単位はどの規則も取らないので、
行で後ろに何もないコロンと `;` は入力を拒否させます。
[fixture: journey/header-only] [fixture:
journey/header-statement-same-line] [fixture:
journey/gram-empty-lines-and-indentation] [fixture:
journey/lex-task-line-feed-before-colon] [fixture:
journey/lex-task-colon-at-end] [fixture: journey/lex-semicolon-line]

### タスク

```text
task-statement = task-text ":" score? ( ":" person? ( "," person? )* ignored-data? )?
```

タスクは、`task-text` の単位である**説明**と、その**データ**です。
データは `:` の単位とデータのテキストの単位です。
`task-text` と `:` は 1 つの行の隣り合う単位で、
データのテキストは少なくとも 1 文字あるので、
行で後ろに何もない `a:` はタスクではありません
（[文の文脈](#文の文脈) を参照）。
説明は `task-text` の単位のテキストを書かれたとおりにしたもので、
Db が保つコロンの前の空白を含み、その前の空白は外です。
[fixture: journey/db-task-people] [fixture:
journey/db-task-description-spaces] [fixture: journey/lex-task-colon-at-end]
[fixture: journey/lex-task-text-only] [fixture: journey/lex-task-data-only]

データは、
[`addTask()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
が分けるとおり、そのコロンで分かれます。
データの 1 つ目のコロンは、説明の後の `:` の単位です。

- **スコアの部分**は、1 つ目のコロンから、
  2 つ目のコロンかデータの終わりまでです。
  これは、部分の両端の空白を除いたテキストの `score` の単位で、
  部分が空か空白だけのときは単位がありません。
  `abc` や `5, 6` のように数を書かない部分も受理されます。
  mermaid.js がスコアを数としてどう読むかは、tests パッケージの要約にあります。
  [fixture: journey/db-task-score-only] [fixture:
  journey/db-task-score-spaces] [fixture: journey/lex-task-score-nbsp-trimmed]
  [fixture: journey/db-task-score-empty]
  [fixture: journey/gram-task-data-whitespace-only] [fixture:
  journey/db-task-score-not-a-number] [fixture:
  journey/gram-task-score-comma]
- **人の部分**は、`:` の単位である 2 つ目のコロンから、
  3 つ目のコロンかデータの終わりまでです。
  これはコンマで**人**に分かれます。
  `,` ごとに `,` の単位があり、コロン、コンマ、部分の終わりの間の
  区間ごとに、区間の両端の空白を除いたテキストの `person` の単位があります。
  区間が空白だけのときは単位がなく、それは**空の人**、
  つまりタスクの人の null の要素です
  （[JourneyTaskStatement](../ast/journey.ja.md#journeytaskstatement)
  を参照）。
  人はいつもコンマの数より 1 つ多くあります。
  `A: 3: a,,b` は人 `a`、空の人、`b` を持ち、
  `A: 3: ` と `A: 5:` は空の人を 1 つ持ち、
  `A: 3: Me, You ,  Them` は人 `Me`、`You`、`Them` を持ちます。
  2 つ目のコロンがなければ、タスクは人を持ちません。
  [fixture: journey/db-task-people] [fixture:
  journey/db-task-people-empty-item] [fixture:
  journey/db-task-people-blank] [fixture:
  journey/gram-task-second-colon-at-end] [fixture:
  journey/gram-task-people-trailing-comma] [fixture:
  journey/gram-task-people-nbsp-trimmed] [fixture:
  journey/db-task-score-only]
- 3 つ目のコロンから、データの残りは `ignored-data` の単位で、
  コロンを含み、終わりの空白を除きます。mermaid.js はそれを読みません。
  `A: 3: a,b: c, d` は人 `a` と `b` を持ち、`: c, d` は読まれません。
  `A: 5: Me:` は無視されるテキスト `:` を、
  `A: 5: Me: x: y` は無視されるテキスト `: x: y` を、
  空白 2 つが続く `A: 5: Me: x` は無視されるテキスト `: x` を持ちます。
  [fixture: journey/db-task-extra-colon] [fixture:
  journey/gram-task-third-colon-at-end] [fixture:
  journey/gram-task-four-colons] [fixture:
  journey/gram-task-ignored-data-trailing-spaces]

データは `#`、`;`、行の終わりまでのどの文字も保つので、
データの後の同じ行の 2 つ目のタスク、キーワード、空の説明ブロックは
データの一部です。
`A: 5 B: 3` はスコアの部分 `5 B` と人 `3` を持ち、
`A: 5 accDescr {}` はスコアの部分 `5 accDescr {}` を持ちます。
[fixture: journey/gram-task-then-task-same-line] [fixture:
journey/gram-empty-description-block-in-task-data] [fixture:
journey/lex-task-data-to-end-of-line]

### タイトルと section

```text
title-statement   = "title" title-text
section-statement = "section" section-text
```

タイトルの文のタイトルは、その `title-text` の単位の書かれたとおりのテキストで、
両端の空白も含みます。
section の文の名前は、その `section-text` の単位の書かれたとおりのテキストです。
タイトルと section の名前は繰り返してもかまいません。
mermaid.js がタイトル、フロントマターのタイトル、section を Db にどう読むか、
タスクがどの section に属するかは、tests パッケージの要約にあります。
[fixture: journey/db-title-statement] [fixture:
journey/db-title-frontmatter] [fixture:
journey/db-title-statement-after-frontmatter] [fixture:
journey/lex-title-twice] [fixture: journey/lex-title-two-spaces] [fixture:
journey/lex-title-trailing-spaces] [fixture: journey/db-sections] [fixture:
journey/lex-section-two-spaces] [fixture: journey/db-task-before-section]

### アクセシビリティの文

```text
accessibility-statement = "accTitle" ":" acc-title-text
                        | "accDescr" ":" acc-description-text
                        | "accDescr" "{" acc-description-block-text "}"
```

アクセシビリティのタイトルと説明は、その単位のテキストから、
mermaid.js が取り除く両端の空白を除いたものです。
ブロックのテキストは改行を保ち、
それぞれの改行の後の空白は Db から除かれます
（tests パッケージの要約を参照）。
説明は、行でもブロックでも、何度書いてもかまいません。
[fixture: journey/db-acc-title] [fixture:
journey/gram-acc-title-trailing-spaces] [fixture: journey/db-acc-descr]
[fixture: journey/db-acc-descr-block] [fixture:
journey/gram-acc-descr-block-brace-inside] [fixture:
journey/gram-acc-descr-colon-then-block-same-line] [fixture:
journey/gram-acc-descr-twice] [fixture: journey/gram-acc-descr-block-then-line]
[fixture: journey/lex-acc-title-twice]

### 空の説明ブロック

```text
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位に、
`acc-description-block-text` の単位なしで `}` の単位が直接続くものです。
`accDescr {}`、`accDescr { }`、空白か空行だけのブロックがそうです。
mermaid.js はそれにトークンを読みません。
それはテキストのない説明ブロックの文で、何も変えず、
文の始まる位置ならどこでも文です。
1 行だけ、ヘッダーの直後、同じ行の別の文の直後、
同じ行の文の前がそうで、1 つの行の 2 つのブロックは 2 つの文です。
タイトルのテキスト、section のテキスト、タスクのテキスト、
タスクのデータの中では、`accDescr {}` はテキストです。
ブロックを 1 つとして読めるところではどこでも文が始まるので、
文の中にあるブロックはなく、既知の差異
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
はこの図種には当たりません。
[fixture: journey/gram-acc-descr-block-empty] [fixture:
journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/gram-empty-description-block-after-header] [fixture:
journey/gram-empty-description-block-after-block] [fixture:
journey/gram-empty-description-block-before-task-same-line] [fixture:
journey/gram-empty-description-blocks-adjacent] [fixture:
journey/gram-empty-description-block-in-title-text] [fixture:
journey/gram-empty-description-block-in-section-text] [fixture:
journey/gram-empty-description-block-in-task-text] [fixture:
journey/gram-empty-description-block-in-task-data] [fixture:
journey/gram-empty-description-block-then-percent-glued]

### 文法の外の拒否

ありません。
mermaid.js の Db は、その文法が受理するどの入力にも例外を投げません。
[`addSection()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L26-L29)
と
[`addTask()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
はテキストを保存するだけで、
数でないスコア、最初の section より前のタスク、繰り返される section は
受理されます。
[fixture: journey/db-task-score-not-a-number] [fixture:
journey/db-task-before-section] [fixture: journey/db-sections]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  キーワードの中のディレクティブは、この仕様では入力を拒否させ、
  mermaid.js は受理します
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  ヘッダー、`title`、`section`、`accTitle`、`accDescr` の中がそうです。
  [fixture: journey/div-directive-in-header-keyword] [fixture:
  journey/div-directive-in-title-keyword] [fixture:
  journey/div-directive-in-section-keyword] [fixture:
  journey/div-directive-in-acc-title-keyword] [fixture:
  journey/div-directive-in-acc-descr-keyword] [fixture:
  journey/div-directive-in-acc-descr-block-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則に合う行では、キーワードの中の無視される `;` は
  ここでは入力を拒否させ、
  mermaid.js は `;` を除いて部分を 1 つとして読みます。
  規則が探す `style`、`:`、`#` は、同じ行の文の前の説明ブロックにあります。
  同じ行の `accDescr { style:#x }` の後の
  `ti;tle T`、`sec;tion S`、`accTi;tle: T`、`accDe;scr: d` は、
  `;` のない文として読まれます。
  テキストの単位の中と、2 つの単位の間では、mermaid.js の読みが保たれます
  （[単位の間のトリビア](#単位の中のディレクティブ) を参照）。
  [fixture: journey/div-ignored-semicolon-in-title-keyword] [fixture:
  journey/div-ignored-semicolon-in-section-keyword] [fixture:
  journey/div-ignored-semicolon-in-acc-title-keyword] [fixture:
  journey/div-ignored-semicolon-in-acc-descr-keyword] [fixture:
  journey/tokens-ignored-semicolon-in-task-text] [fixture:
  journey/tokens-ignored-semicolon-between-keyword-and-whitespace]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  frontmatter に `title: <a` があると、
  mermaid.js ではタスク `A b="c">d` は説明 `A b='c'>d` を持ち、
  タイトル `b="c">d` はタイトル `b='c'>d` を持ちます。
  ここでは frontmatter でタグを探さないので、引用符はそのままです。
  どちらも入力を受理し、Db が違います。
  frontmatter がなければ、`A <a b="c">d` のようにテキストの中で始まるタグは、
  どちらも同じに読みます。
  [fixture: journey/div-html-tag-starts-in-frontmatter-task-text] [fixture:
  journey/div-html-tag-starts-in-frontmatter-title] [fixture:
  journey/lex-html-tag-in-task-text]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  YAML として正しくない frontmatter は、この仕様では受理され、
  mermaid.js は拒否します。
  [fixture: journey/div-frontmatter-invalid-yaml]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)。**
  単位の最初の文字（`}` でも空白でもない文字）の直後の `%%` は、
  ここでは [コメント](#コメント) が言うとおりに読まれます。
  コメントは単位の始まる位置でだけ始まるので、
  `%%` は単位の一部か、その前の文字が文法の取らない単位です。
  mermaid.js はその文字と行の残りを 1 つのコメントとして読みます。
  差異は両方向です。
  `A%%B: 5` はここではタスクで、mermaid.js ではタスクではありません。
  `A: 5;%% c`、`title x;%% c`、`journey;%% c`、`section a:%% c`、
  `journey:%% c`、`accDescr { x }a%% c` は、
  ここでは拒否され、mermaid.js は受理します。
  `A:%% c` はここではタスクで、mermaid.js は拒否します。
  [fixture: journey/div-comment-after-task-text-start] [fixture:
  journey/div-comment-after-indented-task-text-start] [fixture:
  journey/div-comment-after-semicolon-after-data] [fixture:
  journey/div-comment-after-semicolon-after-title] [fixture:
  journey/div-comment-after-semicolon-after-header] [fixture:
  journey/div-comment-after-colon-after-section] [fixture:
  journey/div-comment-after-colon-after-header] [fixture:
  journey/div-comment-after-block-character] [fixture:
  journey/div-comment-after-task-colon]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこか、タスクのテキスト、タイトル、section、
  タスクのデータにある `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment` は、mermaid.js にテキストを C4 のパーサーへ渡させ、
  それが拒否します。ここではテキストはユーザージャーニー図です。
  `C4Context` はどちらでもテキストです。
  [fixture: journey/div-c4-keyword-in-task-text] [fixture:
  journey/div-c4-keyword-in-title] [fixture:
  journey/div-c4-keyword-in-section] [fixture:
  journey/div-c4-keyword-in-task-data] [fixture:
  journey/lex-c4context-in-title]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
  そのような行の後の空白だけの行は、ここではコメントか何もないもので、
  mermaid.js は入力を拒否します。
  その字句解析器が `%%` の後の改行を、
  ヘッダーの前の `newline` の単位として読むからです
  （[検出](#検出) を参照）。
  [fixture: journey/header-after-bare-percent-line] [fixture:
  journey/header-after-empty-braces-line] [fixture:
  journey/header-after-bare-percent-line-and-whitespace-line]

既知の差異
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md)
と
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.ja.md)
は、この図種には当たりません。
この図種の mermaid.js のコメントの規則はコメントの後の改行を読まず、
単位の始まる位置の `%%{` はどちらでもコメントだからです
（[コメント](#コメント) を参照）。
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)
も当たりません（[空の説明ブロック](#空の説明ブロック) を参照）。

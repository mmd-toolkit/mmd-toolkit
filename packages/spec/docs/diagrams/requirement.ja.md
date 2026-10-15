# Requirement

英語版: [requirement.md](./requirement.md)

mermaid.js の正となるソース：

- [`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison)
- [`requirementDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts)
- [`requirement/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement)
  の中のテスト（`*.spec.js`、`*.spec.ts`）

この文書は、図種 `requirement`、要求図を扱います。
木のノードは [ast/requirement.ja.md](../ast/requirement.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 14 がこの文法を選びます。
テキストが、空白の後、ちょうどこの大文字小文字の `requirement` で始まるときです
（[`requirementDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDetector.ts#L9-L11)）。
`REQUIREMENTDIAGRAM` と `RequirementDiagram` はどの検出器にも合いません。
[fixture: requirement/header-only] [fixture:
requirement/docs-syntax-requirement-diagram-7919bd6c] [fixture:
requirement/header-upper-case] [fixture: requirement/header-capitalized]

その後、字句解析器がヘッダー、つまりキーワード `requirementDiagram` を、
大文字小文字を区別せず、語の文字が続かない形で読みます
（[文の文脈](#文の文脈) を参照）。
そのため `requirementdiagram` はヘッダーです。
`requirement` だけ、`requirementDiagramX`、`requirementDiagram2` は、
検出されて拒否されます。
最初のものはキーワード `requirement` だからで、
残りは名前だからです。
ヘッダーの後には `newline` の単位が要り、
その前にヘッダーの行に置けるのは、コメント、ディレクティブ、
空の説明ブロックだけです。
`requirementDiagram #c`、`requirementDiagram %c`、
`requirementDiagram accDescr {}` は、それぞれ改行が続けば受理されます。
一方、`requirementDiagram element e {` のように
ヘッダーの行でその後に文を書くと拒否され、
テキストのある説明ブロック、`accTitle` の行、
`requirementDiagram-x`、`requirementDiagram;` も拒否されます。
ヘッダーの後の、空白文字かタブで始まる空白は、その後の改行を取るので
（[単位と文脈](#単位と文脈) を参照）、
空白文字 2 つかタブと改行が続く `requirementDiagram` は拒否されます。
改行が続く `requirementDiagram %%{init: {}}%%` も、
ディレクティブなしで読まれるので拒否されます。
ヘッダーだけの入力は、後ろに改行がなくても受理されます。
字句解析器が最後の文字の後に改行を読むからです
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）。
一方、テキストの終わりで空白文字 2 つが続くヘッダーは拒否されます。
[fixture: requirement/header-lower-case-d] [fixture:
requirement/header-requirement-only] [fixture: requirement/header-word-suffix]
[fixture: requirement/header-digit-suffix] [fixture:
requirement/header-hash-comment] [fixture: requirement/header-percent-comment]
[fixture: requirement/header-empty-description-block]
[fixture: requirement/header-description-block] [fixture:
requirement/header-acc-title]
[fixture:
requirement/header-statement-same-line] [fixture:
requirement/header-dash-suffix] [fixture: requirement/header-semicolon]
[fixture: requirement/header-trailing-spaces] [fixture:
requirement/header-trailing-tab] [fixture:
requirement/header-space-directive-line-feed] [fixture: requirement/header-only]
[fixture: requirement/header-trailing-spaces-at-end] [fixture:
requirement/header-crlf] [fixture: requirement/header-cr-only]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行です。
検出はそれを読んで通り過ぎてヘッダーを見つけ、
その行はどの図種でもそうであるように、ここでは印 `%%` の図のコメントです
（[図種の検出](../common.ja.md#図種の検出) を参照）。
コメントはどのノードにも属さず、RequirementDiagram はヘッダーから始まります。
mermaid.js はどちらの場合も入力を拒否し、
`%%` だけの行の後に空白だけの行があるときも拒否します。
その字句解析器はその行をコメントとして、
その後の改行をヘッダーの前の `newline` の単位として読み、
その文法がそれを取らないからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
ヘッダーの前のコメント行は検出の前に取り除かれます。
ヘッダーの前の行のディレクティブと、
ヘッダーの後の同じ行のディレクティブは、
ディレクティブであってそれ以外ではありません。
ヘッダーの前のアクセシビリティの文や空の説明ブロックは
テキストの始まりなので、どの検出器にも合いません。
[fixture: requirement/header-after-bare-percent-line] [fixture:
requirement/header-after-empty-braces-line] [fixture:
requirement/header-after-bare-percent-line-and-whitespace-line] [fixture:
requirement/header-after-percent-space-line] [fixture:
requirement/header-after-comment-line] [fixture:
requirement/header-after-directive-line] [fixture:
requirement/header-then-directive-same-line] [fixture:
requirement/header-after-acc-title] [fixture:
requirement/header-after-empty-description-block]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を
[変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして、
コメント領域と行の規則が無視する `;` はないものとして読みます。
そのため、アクセシビリティのテキストの中のエンティティは、
そのプレースホルダーとして読まれ、属性の引用符は `'` として読まれます。
[fixture: requirement/entity-placeholder-in-acc-title] [fixture:
requirement/entity-placeholder-in-acc-descr] [fixture:
requirement/entity-placeholder-in-acc-descr-block]
[fixture: requirement/lex-html-attribute-quote-in-acc-title] [fixture:
requirement/lex-html-attribute-quote-in-acc-descr] [fixture:
requirement/lex-html-attribute-quote-in-acc-descr-block]
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は
図のテキストの一部です。
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 である、
この図自身の単位の規則を述べます。

この図の mermaid.js の字句解析器は、
文字の大文字小文字を区別せずに比べます（[表記](../common.ja.md#表記) を参照）。
`REQUIREMENT r {`、`ID: 1`、`RISK: HIGH`、`VERIFYMETHOD: INSPECTION`、
`ELEMENT e {`、`DOCREF: d`、`a - SATISFIES -> b`、`DIRECTION BT`、
`CLASSDEF`、`STYLE`、`CLASS`、`ACCTITLE: T`、`ACCDESCR: D`、`accdescr {` は、
この文書が書く形の語と同じに読まれます。
[fixture: requirement/db-keywords-upper-case] [fixture:
requirement/lex-relationship-upper-case] [fixture:
requirement/lex-direction-upper-case]
[fixture: requirement/lex-acc-keywords-upper-case] [fixture:
requirement/lex-acc-descr-block-lower-case]
[fixture:
requirement/lex-style-keywords-upper-case]
以下で**キーワード**とは、大文字小文字を区別せずに照合する語で、
語の文字が続かないものです（[表記](../common.ja.md#表記) を参照）。
`test_x`、`tests`、`stylex` は名前で、
`test` と `element` は単位が始まるところではどこでもキーワードです。
[fixture: requirement/lex-name-keyword-underscore] [fixture:
requirement/lex-value-keyword-prefix] [fixture:
requirement/lex-name-style-word-suffix] [fixture:
requirement/lex-name-starts-with-keyword] [fixture:
requirement/lex-target-keyword]

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

テキストは、文の文脈と style の文脈で終われます。
style の文脈は、最後の文字の後に字句解析器が読む改行が出ます。
タイトルの文脈、説明の文脈、説明ブロックの文脈では終われず、
文字列は閉じていなければなりません。
後ろに何もない `accTitle:`（改行が続いても同じ）、
改行が続く `accDescr:`、`}` のない `accDescr {`、
閉じる引用符のない `"` は拒否されます。
一方、テキストの終わりの `style r fill:red` は、
後ろに空白文字 2 つがあっても受理されます。
[fixture: requirement/lex-acc-title-at-end] [fixture:
requirement/lex-acc-title-line-feed-at-end] [fixture:
requirement/lex-acc-descr-at-end] [fixture:
requirement/lex-acc-descr-block-unclosed] [fixture:
requirement/lex-string-unclosed] [fixture:
requirement/lex-style-at-end-of-text] [fixture:
requirement/lex-style-trailing-spaces-at-end]

**空白。** 文の文脈では、単位が始まるところの改行は `newline` の単位で
（規則 6）、
それ以外の空白文字（U+00A0、U+2028、垂直タブを含む）で始まる空白の並びは、
単位の間にあって、その中の改行を取ります（規則 7）。
そのため、文法が `newline` の単位を要するところ、
つまりヘッダーの後、`{` の後、フィールドの後で、
改行の前に改行以外の空白があると、入力は拒否されます。
空白文字 2 つと改行が続く `requirement r {` と、
空白文字 2 つと改行が続くフィールド `id: "1"`、
空白文字 1 つと改行が続くフィールド `risk: high`、
タブと改行が続く `requirement r {` も拒否されます。
それ以外のところでは何も変えません。
空白文字 2 つと改行が続く `}` や、
空白文字 2 つと改行が続く `"b"` への関係の後には、
いつもどおり次の文が続きます。
`id`、空白文字 2 つ、改行、`: 1` はフィールド `id: 1` で、
`id`、改行、`: 1` は拒否されます。
引用符なしの名前や値は、その行の後ろの空白を読むので（規則 23）、
空白文字と改行が続く `id: 1` はフィールドです。
style の文脈では、単位の間に置けるのは空白文字だけで、
改行はその文脈を出ます。
それ以外の空白文字は、そこではどの規則も読みません。
[fixture: requirement/lex-brace-trailing-spaces]
[fixture: requirement/lex-brace-trailing-tab] [fixture:
requirement/lex-risk-value-trailing-space]
[fixture:
requirement/lex-string-value-trailing-spaces] [fixture:
requirement/lex-close-brace-trailing-spaces] [fixture:
requirement/lex-relationship-string-trailing-spaces] [fixture:
requirement/gram-field-spaces-line-feed-before-colon] [fixture:
requirement/gram-field-line-feed-before-colon] [fixture:
requirement/db-requirement-value-spaces] [fixture:
requirement/lex-whitespace-line-separator-between-statements] [fixture:
requirement/lex-whitespace-nbsp-before-name] [fixture:
requirement/lex-whitespace-vertical-tab-between-units] [fixture:
requirement/lex-tab-before-field] [fixture: requirement/lex-blank-lines-in-body]
[fixture: requirement/lex-style-tab]

**名前と値。** 文の文脈では、ASCII の語の文字 1 つと、
それに続く `:`、`,`、改行、`{`、`<`、`>`、`-`、`=` 以外の 0 個以上の文字
（できるだけ多く）が、`unquoted-text` の単位です（規則 23）。
文法がそれを取る位置によって、名前か値です。
その書かれたテキストは、mermaid.js が取り除くとおり、
規則が読む後ろの空白を除き、
文字の間の空白は U+00A0 と U+2028 を含めて保ちます。
`requirement  spaced name  {` は要求 `spaced name` で、
`a`、U+00A0、`b` は 1 つの名前、
U+00A0 と `{` が続く `a` は名前 `a` です。
`#`、`%`、`;`、`}`、`.` は、最初の文字の後では単位の文字です。
`r#1`、`r}`、`r.1`、`r %c`、`1r`、`b # c` は名前で、
`a #b`、`1;`、`1 %c` は値です。
名前や値は ASCII の語の文字で始まり、
`=`、`-`、`:`、`,` で終わります。
`é`、`-r`、`a=b` は名前として、
`a-b`、`a:b`、`a,b`、`a > b`、`été` は値として拒否されます。
文字列はどれも持てます（[要求](#要求) を参照）。
エンティティのプレースホルダーは ASCII の外の文字でできているので
（[エンティティ](../common.ja.md#エンティティ) を参照）、
`a#amp; b` は 1 つの名前か値 `aﬂ°amp¶ß b` で、
名前はエンティティでは始まれません。
[fixture: requirement/db-requirement-name-spaces] [fixture:
requirement/lex-whitespace-nbsp-in-name] [fixture:
requirement/lex-whitespace-nbsp-after-name] [fixture:
requirement/lex-whitespace-line-separator-in-name] [fixture:
requirement/lex-name-tab-at-end] [fixture: requirement/lex-name-hash] [fixture:
requirement/lex-name-close-brace] [fixture: requirement/lex-name-dot] [fixture:
requirement/lex-name-percent] [fixture: requirement/lex-name-digit-start]
[fixture: requirement/lex-relationship-target-hash] [fixture:
requirement/lex-value-hash] [fixture: requirement/lex-value-semicolon] [fixture:
requirement/lex-value-percent] [fixture: requirement/lex-name-non-ascii-start]
[fixture: requirement/lex-name-dash-start] [fixture:
requirement/lex-name-equals] [fixture: requirement/lex-value-dash] [fixture:
requirement/lex-value-colon]
[fixture: requirement/lex-value-greater-than] [fixture:
requirement/lex-value-non-ascii-start]
[fixture: requirement/lex-value-comma] [fixture:
requirement/db-requirement-quoted-values] [fixture:
requirement/entity-placeholder-in-unquoted-name] [fixture:
requirement/entity-placeholder-in-unquoted-value] [fixture:
requirement/entity-placeholder-at-name-start]

**文字列。** 文の文脈と style の文脈では、
`"`、`"` 以外の 0 個以上の文字（改行を含む）、`"` は、
引用符の間に文字があれば `string` の単位、なければ `empty-string` の単位です。
`string` のテキストは引用符の間の文字なので、
`#`、`%`、`:`、`,`、`-`、`{`、`}` はその文字です。
その中の HTML タグの属性の引用符は `'` として読まれるので、
文字列は最後の引用符まで続きます。
`text: "<b a="x">t</b>"` のテキストは `<b a='x'>t</b>` です。
[fixture: requirement/db-relationship-quoted-names] [fixture:
requirement/lex-string-line-feed] [fixture: requirement/lex-string-hash-percent]
[fixture: requirement/db-requirement-quoted-values] [fixture:
requirement/lex-html-tag-in-string-value] [fixture:
requirement/entity-placeholder-in-requirement-fields] [fixture:
requirement/entity-placeholder-in-element-fields] [fixture:
requirement/entity-placeholder-in-relationship]
文法のどの規則も `empty-string` の単位を取らないので、
文の文脈か style の文脈が空の文字列を読むところでは、
どこでも入力を拒否させます。
それだけの行、文の前、ヘッダーの後、`}` の後、本体の行、
フィールドの値の前と後、文の 2 つの単位の間、style の文脈で、
`style "" r fill:red` や `style r fi""ll:red` もそうです。
mermaid.js はそれにトークンを読まず、これらの入力を受理します
（[既知の差異](#既知の差異) を参照）。
`requirement "" {` と `text: ""` は両者が拒否します。
引用符なしのテキストの中の 2 つの引用符はその文字です。
`requirement r "" x {` は要求 `r "" x` で、
`text: a "" b` のテキストは `a "" b` です。
タイトル、説明、説明ブロックの文脈と、
文字列の規則より先に行全体を取る方向の行では、2 つの引用符はテキストです。
`accTitle: ""` のタイトルは `""`、`accDescr { "" }` の説明は `""` で、
`direction LR ""` と `"" direction LR` は `LR` を決めます。
[fixture: requirement/div-empty-string-line] [fixture:
requirement/div-empty-string-before-statement] [fixture:
requirement/div-empty-string-after-header] [fixture:
requirement/div-empty-string-after-close-brace] [fixture:
requirement/div-empty-string-body-line] [fixture:
requirement/div-empty-string-after-open-brace] [fixture:
requirement/div-empty-string-before-value] [fixture:
requirement/div-empty-string-after-string-value] [fixture:
requirement/div-empty-string-between-keyword-and-name] [fixture:
requirement/div-empty-string-before-brace] [fixture:
requirement/div-empty-string-in-relationship] [fixture:
requirement/div-empty-string-before-target] [fixture:
requirement/div-empty-string-after-string-source] [fixture:
requirement/div-empty-string-before-style-name] [fixture:
requirement/div-empty-string-before-style] [fixture:
requirement/div-empty-string-in-style-word] [fixture:
requirement/div-empty-string-in-class-statement] [fixture:
requirement/div-empty-string-after-shorthand-separator] [fixture:
requirement/gram-requirement-name-empty-string] [fixture:
requirement/gram-requirement-value-empty-string] [fixture:
requirement/lex-quotes-in-unquoted-name]
[fixture: requirement/lex-acc-title-empty-quotes] [fixture:
requirement/lex-acc-descr-block-empty-quotes]
[fixture: requirement/lex-quotes-before-direction]
[fixture:
requirement/lex-direction-text-empty-quotes]
[fixture:
requirement/lex-quotes-in-unquoted-value]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むとおりに読みます。
そのうえで
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が単位に当てはまります。
テキストの単位か文字列の単位の中のディレクティブは mermaid.js の読みを保ち、
それ以外の単位（名前の単位を含む）の中のディレクティブは入力を拒否させます。
**名前の単位**は、`style`、`classDef`、`class` の後の名前かクラスである
`style-word` です。
**テキストの単位**は、`unquoted-text`（名前も値も）、
スタイルの中の `style-word`、
`title-text`、`description-text`、`description-block-text`、`direction-text`
です。
`unquoted-text` が名前のときもテキストの単位なのは、
ASCII の空白で区切られた複数の語を持て、
mermaid.js がそれを 1 つの名前として読むからです。
`requirement  spaced name  {` は要求 `spaced name` です
（[名前と値](#単位と文脈) を参照）。
[fixture: requirement/db-requirement-name-spaces]
**文字列の単位**は `string` です。

- `requirement a%%{init: {}}%%b {` は要求 `ab`、
  `a - satisfies -> b%%{init: {}}%%c` の先は `bc`、
  `r:::c%%{init: {}}%%d`、`requirement r:::c%%{init: {}}%%d {`、
  `class r`・改行・`c%%{init: {}}%%d` は r にクラス `cd` を与え、
  `text: a%%{init: {}}%%b` と `text: "a%%{init: {}}%%b"` のテキストは `ab`、
  `docref: a%%{init: {}}%%b` の参照は `ab`、
  `accTitle: a%%{init: {}}%%b` のタイトルは `ab`、
  `accDescr: a%%{init: {}}%%b` と説明ブロックの中の同じテキストの説明は `ab`、
  `fo%%{init: {}}%%o direction LR ba%%{init: {}}%%r` の方向は `LR`、
  `style r fi%%{init: {}}%%ll:red` のスタイルは `fill:red` で、
  mermaid.js と同じです。
  スタイルはその単位のテキストをつないだものだからです
  （[RequirementLiteral](../ast/requirement.ja.md#requirementliteral) を参照）。
  [fixture: requirement/lex-directive-in-name] [fixture:
  requirement/lex-directive-in-target] [fixture:
  requirement/lex-directive-in-shorthand-class] [fixture:
  requirement/lex-directive-in-requirement-class] [fixture:
  requirement/lex-directive-in-class-list-next-line]
  [fixture: requirement/lex-directive-in-value] [fixture:
  requirement/lex-directive-in-string] [fixture:
  requirement/lex-directive-in-docref]
  [fixture: requirement/lex-directive-in-acc-descr] [fixture:
  requirement/lex-directive-in-acc-descr-block] [fixture:
  requirement/lex-directive-in-direction-text]
  [fixture:
  requirement/lex-directive-in-acc-title] [fixture:
  requirement/lex-directive-in-style]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `requirement r%%{init: {}}%%{`、`id:%%{init: {}}%% 1`、
  `a -%%{init: {}}%%satisfies -> b`、
  改行が続く `requirementDiagram%%{init: {}}%%` は、
  ディレクティブがないときと同じに読まれます。
  [fixture: requirement/lex-directive-between-name-and-brace] [fixture:
  requirement/lex-directive-after-field-colon] [fixture:
  requirement/lex-directive-between-line-and-relation] [fixture:
  requirement/header-then-directive-same-line]
- `style r%%{init: {}}%%x fill:red` と `class r c%%{init: {}}%%d` では、
  ディレクティブは名前の単位の中にあります。
  `requirement%%{init: {}}%%Diagram`、`requ%%{init: {}}%%irement r {`、
  `te%%{init: {}}%%xt: t`、`risk: hi%%{init: {}}%%gh`、
  `a - sati%%{init: {}}%%sfies -> b`、`a - satisfies -%%{init: {}}%%> b`、
  `r:%%{init: {}}%%::c`、`sty%%{init: {}}%%le r fill:red`、
  `acc%%{init: {}}%%Title: T`、`dir%%{init: {}}%%ection LR`、
  `direction L%%{init: {}}%%R` では、
  キーワード、区切り、方向の値の中にあります。
  入力は拒否され、mermaid.js は 2 つの部分を 1 つとして読んで受理します
  （[既知の差異](#既知の差異) を参照）。
  [fixture:
  requirement/div-directive-in-style-name] [fixture:
  requirement/div-directive-in-class-name] [fixture:
  requirement/div-directive-in-header-keyword] [fixture:
  requirement/div-directive-in-requirement-keyword] [fixture:
  requirement/div-directive-in-field-keyword] [fixture:
  requirement/div-directive-in-risk-keyword] [fixture:
  requirement/div-directive-in-relationship-keyword] [fixture:
  requirement/div-directive-in-arrow] [fixture:
  requirement/div-directive-in-separator] [fixture:
  requirement/div-directive-in-style-keyword] [fixture:
  requirement/div-directive-in-acc-title-keyword] [fixture:
  requirement/div-directive-in-direction-keyword] [fixture:
  requirement/div-directive-in-direction-value]

**単位の間のトリビア。** [common.ja.md](../common.ja.md) のトリビアは、
この図の単位と次のように出会います。
単独の CR は行終端で、改行として読まれ
（[行終端](../common.ja.md#行終端) を参照）、CRLF も同じです。
要求と `style` の文は単独の CR の間でも、
フィールドは CRLF の間でも、改行の間と同じに読まれ、
文字列の中の CRLF や単独の CR はそのテキストの改行です。
[fixture: requirement/header-crlf] [fixture: requirement/header-cr-only]
[fixture: requirement/lex-string-lone-cr]
[fixture: requirement/lex-string-crlf]
[fixture: requirement/lex-cr-only-style]
2 つの単位の間の閉じたディレクティブは何もないものとして読まれ、
そのまわりの空白は、ディレクティブのない同じテキストを
[単位と文脈](#単位と文脈) の規則が読むとおりに読まれます。
そのため、行の終わりのディレクティブの前の空白文字は、改行の前の空白文字です。
改行が続く `id: "1" %%{init: {}}%%`、`risk: high %%{init: {}}%%`、
`requirement r { %%{init: {}}%%`、`requirementDiagram %%{init: {}}%%` は、
行の終わりに空白文字のある同じ行と同じく拒否されます（[検出](#検出) を参照）。
空白文字のない `risk: high%%{init: {}}%%` と `requirement r {%%{init: {}}%%`、
引用符なしの値が空白文字を読む `id: 1 %%{init: {}}%%`、
`newline` の単位の要らない `} %%{init: {}}%%`、`class r "c" %%{init: {}}%%`、
空白文字とディレクティブで終わる `style` の行は受理されます。
[fixture: requirement/lex-directive-at-end-of-field-line] [fixture:
requirement/lex-directive-at-end-of-style-line]
[fixture: requirement/lex-directive-after-string-value-space] [fixture:
requirement/lex-directive-after-risk-space] [fixture:
requirement/lex-directive-after-brace-space] [fixture:
requirement/lex-directive-after-risk-glued] [fixture:
requirement/lex-directive-after-brace-glued]
[fixture: requirement/lex-directive-after-style-space]
[fixture: requirement/lex-directive-after-class-string-space]
[fixture:
requirement/lex-directive-after-close-brace-space]
[fixture:
requirement/header-space-directive-line-feed]
閉じていないディレクティブはテキストの残りを取ります
（[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）。
本体の中の `id: 1 %%{init: {}` は本体を閉じないままにするので、
入力は拒否されます。
一方、後に行が続く `style r fill:red %%{init: {}` はスタイル `fill:red`
を持ちます。
最後の文字の後に読まれる改行が style の文脈を出るからです。
[fixture: requirement/tokens-unclosed-directive-in-body] [fixture:
requirement/tokens-unclosed-directive-after-style]
コメント行は、字句解析器がテキストを読む前に取り除かれます
（[コメント行](../common.ja.md#コメント行) を参照）。
本体の中、`{` の直後、説明ブロックの中、`accTitle:` とそのテキストの間、
`direction` とその値の間でも同じで、
複数行の文字列の中では、文字列のコメント領域です。
`text: "a`、コメント行、`b"` のテキストは `a`、改行、`b` です。
[fixture: requirement/tokens-comment-line-in-body] [fixture:
requirement/tokens-comment-line-after-brace]
[fixture: requirement/tokens-comment-line-after-acc-title-colon] [fixture:
requirement/tokens-comment-line-after-direction] [fixture:
requirement/tokens-comment-line-in-string-value]
[fixture:
requirement/tokens-comment-line-in-acc-block]
`style` の規則か `classDef` の規則に合う行
（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行) を参照）
では、最後の `;` が無視されます。
`style r fill:#f00;` のスタイルは、`;` の後に空白文字があっても `fill:#f00`、
`classDef c fill:#f00;` のスタイルは `fill:#f00`、
`accTitle: style:#x a;b` のタイトルは `style:#x ab` で、
`accDescr: style:#x a;b`、説明ブロックの中の同じテキスト、
文字列の値 `text: "style:#x a;b"` も同じです。
`accTitle: style:#x a;b;c;` のタイトルは `style:#x a;b;c` です。
`;` が 2 つあると最後のものだけが無視され、
`#f00;` はエンティティになります。
そのプレースホルダーは style の文脈のどの規則も読まないので、
`style r fill:#f00;stroke:#0f0;` は拒否されます。
テキストの単位の中の無視される `;` も、mermaid.js の読みを保ちます。
要求 `"style:#x"` の後の `"style:#x" - satisfies -> b;c` の先は `bc` で、
`class r`・改行・`"style:#x",c;d` は r にクラス `style:#x` と `cd` を与えます。
それ以外の単位（キーワードや区切りを含む）の中では入力を拒否させ、
mermaid.js は 2 つの部分を 1 つとして読みます
（[既知の差異](#既知の差異) を参照）。
[fixture: requirement/tokens-ignored-semicolon-in-name] [fixture:
requirement/tokens-ignored-semicolon-in-class-list-next-line]
[fixture: requirement/tokens-ignored-semicolon-in-style-trailing-space]
[fixture: requirement/tokens-ignored-semicolon-in-classdef] [fixture:
requirement/tokens-ignored-semicolon-in-acc-descr] [fixture:
requirement/tokens-ignored-semicolon-in-acc-descr-block] [fixture:
requirement/tokens-ignored-semicolon-in-string-value] [fixture:
requirement/tokens-ignored-semicolon-last-of-three]
[fixture: requirement/tokens-ignored-semicolon-in-style] [fixture:
requirement/tokens-ignored-semicolon-in-acc-title] [fixture:
requirement/tokens-ignored-semicolon-in-direction-text] [fixture:
requirement/tokens-ignored-semicolon-first-of-two-in-style] [fixture:
requirement/div-ignored-semicolon-in-relationship-keyword]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. `title`、1 つの空白文字（改行を含む）、
   `#`、改行、`;` 以外の 1 つ以上の文字：
   `title` の単位で、文法のどの規則も取りません。
   [fixture: requirement/lex-title-statement] [fixture:
   requirement/lex-title-line-feed]
2. `accTitle`、0 個以上の空白文字（改行を含む）、`:`、
   0 個以上の空白文字（改行を含む）：
   `accTitle` の単位と `:` の単位。タイトルの文脈に入ります。
   [fixture: requirement/db-acc-title-descr] [fixture:
   requirement/lex-acc-title-no-space] [fixture:
   requirement/lex-acc-title-line-feed-before-colon]
3. `accDescr`、0 個以上の空白文字（改行を含む）、`:`、
   0 個以上の空白文字（改行を含む）：
   `accDescr` の単位と `:` の単位。説明の文脈に入ります。
   [fixture: requirement/db-acc-title-descr] [fixture:
   requirement/lex-acc-descr-line-feed-before-colon]
4. `accDescr`、0 個以上の空白文字（改行を含む）、`{`、
   0 個以上の空白文字（改行を含む）：
   `accDescr` の単位と `{` の単位。説明ブロックの文脈に入ります。
   [fixture: requirement/db-acc-descr-block] [fixture:
   requirement/lex-acc-descr-block-no-space] [fixture:
   requirement/lex-acc-descr-line-feed-before-brace]
5. **方向の行**（下を参照）。
   [fixture: requirement/spec-requirement-diagram-08cfba06]
6. 1 つ以上の改行：`newline` の単位。
   [fixture: requirement/lex-blank-lines-in-body]
7. 1 つ以上の空白文字（改行を含む）：何もなし。
   [fixture: requirement/lex-close-brace-trailing-spaces]
8. `#` と、次の改行までの文字：図のコメント（[コメント](#コメント) を参照）。
   [fixture: requirement/lex-hash-comment-line]
9. `%` と、次の改行までの文字：図のコメント。
   [fixture: requirement/lex-percent-comment-line]
10. キーワード `requirementDiagram`：`header` の単位。
    [fixture: requirement/header-only]
11. `{`：`{` の単位。[fixture: requirement/db-requirement-defaults]
12. `}`：`}` の単位。[fixture: requirement/db-requirement-defaults]
13. `:::`：`:::` の単位。[fixture: requirement/db-class-colon-form]
14. `:`：`:` の単位。[fixture: requirement/db-requirement-all-fields]
15. キーワード `id`、`text`、`risk`、`verifyMethod`、
    要求の種類 `requirement`、`functionalRequirement`、
    `interfaceRequirement`、`performanceRequirement`、
    `physicalRequirement`、`designConstraint`、
    リスク `low`、`medium`、`high`、
    方法 `analysis`、`demonstration`、`inspection`、`test`、
    `element`、関係 `contains`、`copies`、`derives`、`satisfies`、
    `verifies`、`refines`、`traces`、および `type` と `docref`：
    キーワードの名前の単位。
    [fixture: requirement/db-requirement-all-fields] [fixture:
    requirement/db-element-fields] [fixture: requirement/db-relationship-arrows]
16. キーワード `style`：`style` の単位。style の文脈に入ります。
    [fixture: requirement/db-style-statement]
17. キーワード `classDef`：`classDef` の単位。style の文脈に入ります。
    [fixture: requirement/db-class-def]
18. キーワード `class`：`class` の単位。style の文脈に入ります。
    [fixture: requirement/db-class-statement]
19. `<-`：`<-` の単位。[fixture: requirement/db-relationship-arrows]
20. `->`：`->` の単位。[fixture: requirement/db-relationship-arrows]
21. `-`：`-` の単位。[fixture: requirement/db-relationship-arrows]
22. 文字列か空の文字列（[文字列](#単位と文脈) を参照）。
    [fixture: requirement/db-relationship-quoted-names]
23. 引用符なしのテキスト（[名前と値](#単位と文脈) を参照）。
    [fixture: requirement/db-requirement-name-spaces]
24. `,`：`,` の単位。[fixture: requirement/db-class-colon-form]

`title` の単位と、文法が取らないところの `newline` の単位は、
文法のどの規則も取らないので、それを持つ入力は拒否されます。
`title x`、`a - satisfies -> title x`、`title - satisfies -> b` は拒否され、
`{` と同じ行のフィールドも拒否されます。
単位の始まりの `;`、`<` だけ、`=` は、どの規則も読みません。
1 行だけの `;` と `a < b` は拒否されます。
[fixture: requirement/lex-title-statement] [fixture:
requirement/lex-title-after-arrow] [fixture:
requirement/lex-title-before-relationship] [fixture:
requirement/gram-requirement-field-after-brace] [fixture:
requirement/lex-semicolon-line] [fixture: requirement/lex-less-than-alone]
順序から生じることのいくつか：

- キーワードは単位が始まるところではどこでもキーワードで、
  名前や値はキーワードでは始まれません。
  `requirement test req {`、`text: test`、`text: high risk`、
  `a - satisfies -> element` は拒否され、
  `test_x` と `tests` は名前と値です。
  [fixture: requirement/lex-name-starts-with-keyword] [fixture:
  requirement/lex-value-keyword] [fixture:
  requirement/lex-value-keyword-then-words] [fixture:
  requirement/lex-target-keyword] [fixture:
  requirement/lex-name-keyword-underscore] [fixture:
  requirement/lex-value-keyword-prefix]
- 規則 1 は、空白の後に `#`、改行、`;` ではない文字を要し、
  行の残りを読みます。
  `requirement title page {` は拒否され、
  改行と行 `x - satisfies -> b` が続く `title` は 1 つの `title` の単位で、
  拒否されます。
  一方、`title #c - satisfies -> b` は名前 `title #c` からの関係、
  `title ;x - satisfies -> b` は名前 `title ;x` からの関係、
  `titles - satisfies -> b` は `titles` からの関係で、
  テキストの最後の名前としての `title` は名前です。
  frontmatter の `title` は図のタイトルです。
  [fixture: requirement/lex-name-starts-with-title] [fixture:
  requirement/lex-title-line-feed]
  [fixture: requirement/lex-title-then-semicolon]
  [fixture: requirement/lex-title-then-hash]
  [fixture: requirement/lex-name-titles] [fixture:
  requirement/lex-title-as-last-name] [fixture:
  requirement/db-frontmatter-title]
- 規則 8 と 9 は、規則 7 の後の、単位が始まるところでだけ当てはまります。
  引用符なしのテキストの中の `#` や `%` はその文字で
  （[名前と値](#単位と文脈) を参照）、文字列の中でも同じです。

**キーワードとその後に続くもの。** キーワードは語の境目で終わるので、
その後の ASCII の数字、文字、`_` は引用符なしのテキストを続け、
語の文字ではない ASCII の外の文字はキーワードを終え、
その後どの規則も読みません。
`requirementé r {` は拒否されます。
[fixture: requirement/lex-name-keyword-underscore] [fixture:
requirement/lex-keyword-then-e-acute]

**方向の行。** 大文字小文字を区別せずに比べます。
現在の位置から、改行、U+2028、U+2029 を含まない文字の並びで、
残りが続けられる最も長いもの、
次に `direction`、
次に 1 つ以上の空白文字（改行を含む）、
次に `TB`、`BT`、`RL`、`LR` のどれか（この順に試します）、
次に次の改行までのすべての文字です。
規則は `direction` を `direction` の単位として、
値を `direction-value` の単位として、
`direction` より前と値より後の文字を `direction-text` の単位として読みます。
`direction-text` は mermaid.js が読みません。
規則は規則 1 から 4 以外のどの規則よりも先に試されるので、
その行の文字列も含めて行全体を取ります。
一方、規則 1 が読む行は `title` の単位です。
`title direction LR` は拒否され、`requirement "direction LR" {` も拒否されます。
`foo direction LR bar` と `mydirection RL` は方向の行で、
`a - satisfies -> direction LR` は方向を決めて関係を持たず、
`classDef a direction LR` はクラスを定めず、
`requirement direction LR {` は方向の行で、
その後の行の `}` は何も閉じません。
`accTitle: direction LR` はタイトルで、
3 行の `accDescr {`、`direction LR`、`}` のブロックの説明は
`direction LR` です。
本体の中の方向の行は行全体を取ります。
本体の中の `text: direction TB` と、本体の終わりの `} direction LR` は、
どの本体も取らない方向の行で、入力は拒否されます。
規則はコメントの規則よりも先です。
`% direction LR` と `# c direction LR` は方向を決め、
コメント行 `%% direction LR` は字句解析器がテキストを読む前に取り除かれます。
値も語の境目で終わる必要はありません。
`direction LRX` は `LR` を決め、`X` は `direction-text` の単位です。
`direction LR %% c` は `LR` を決め、テキスト `%% c` を持ちます。
値は挙げた順に試されます。
行のどこかに `direction`、空白、`TB` があれば、値は `TB` なので、
`direction LR x direction TB` は `TB` を決めます。
そうでなければ `BT` を試し、以下同じです。
ある値について、字句解析器は、その値が続く並びの最後の `direction` を取ります。
`direction BT x direction BT` は最後の `direction` で読まれ、
`direction BT x` が `direction-text` の単位です。
[fixture: requirement/lex-title-direction] [fixture:
requirement/lex-direction-line-in-string-name]
[fixture: requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/lex-direction-line-word-before] [fixture:
requirement/lex-direction-in-relationship-line] [fixture:
requirement/lex-direction-line-before-classdef] [fixture:
requirement/lex-direction-line-in-requirement-name]
[fixture: requirement/lex-acc-descr-block-direction]
[fixture:
requirement/lex-acc-title-direction] [fixture:
requirement/lex-direction-in-body] [fixture:
requirement/lex-direction-after-close-brace] [fixture:
requirement/lex-direction-in-percent-comment] [fixture:
requirement/lex-direction-in-hash-comment] [fixture:
requirement/lex-direction-in-comment-line] [fixture:
requirement/lex-direction-value-suffix] [fixture:
requirement/lex-direction-line-percent] [fixture:
requirement/lex-direction-tb-first] [fixture:
requirement/lex-direction-line-same-value-twice] [fixture:
requirement/db-direction-lower-case] [fixture:
requirement/lex-direction-upper-case]
`direction` と値の間の空白は、改行、空行、タブ、U+2028 を持てますが、
`direction` の前の並びは U+2028 を持てません。
`a`、U+2028、`direction LR` は 1 つの引用符なしのテキストで、
文ではなく、拒否されます。
値の後のテキストは U+2028 を持てます。
値のない、行に `direction` だけのものと、`directionLR` は名前で、拒否されます。
[fixture: requirement/lex-direction-line-feed-before-value] [fixture:
requirement/lex-direction-blank-line-before-value] [fixture:
requirement/lex-direction-tab-before-value] [fixture:
requirement/lex-direction-value-line-separator] [fixture:
requirement/lex-line-separator-before-direction] [fixture:
requirement/lex-line-separator-after-direction-value] [fixture:
requirement/lex-direction-without-value] [fixture:
requirement/lex-direction-glued]

### style の文脈

style の文脈には、`style`、`classDef`、`class` で入ります。
文の名前、クラス、スタイルを読みます。

1. 1 つ以上の ASCII の語の文字：`style-word` の単位。
   [fixture: requirement/db-style-statement]
2. `:`：`style-colon` の単位。[fixture: requirement/db-style-statement]
3. `;`：`style-semicolon` の単位。[fixture: requirement/lex-style-semicolon]
4. `%`：`style-percent` の単位で、文法のどの規則も取りません。
   [fixture: requirement/lex-style-percent]
5. `-`：`style-dash` の単位。
   [fixture: requirement/spec-requirement-diagram-5305b791]
6. `#`：`style-hash` の単位。[fixture: requirement/db-style-statement]
7. 空白文字 1 つ：何もなし。[fixture: requirement/lex-style-two-spaces]
8. 文字列か空の文字列（[文字列](#単位と文脈) を参照）。
   [fixture: requirement/lex-style-string-name]
9. 改行：何もなし。style の文脈を出ます。
   [fixture: requirement/lex-style-blank-line-after]
10. `,`：`,` の単位。[fixture: requirement/db-style-statement]

規則 2 から 6 の単位は、文の文脈の `:` と `-` の単位とは別の名前を持つので、
文法はスタイルを style の文脈の単位からだけ読みます
（[スタイルとクラス](#スタイルとクラス) を参照）。
スタイルの次の行の `:` や `-` は、スタイルの一部ではありません。
[fixture: requirement/lex-style-colon-next-line] [fixture:
requirement/lex-style-dash-next-line]
タブ、それ以外のすべての空白文字、`.`、ASCII の外の文字、
それ以外のすべての文字は、どの規則も読みません。
`style r\tfill:red`、`opacity:0.5`、`fill:é` は拒否され、
style の文脈には `accDescr {` の規則がないので、
`style r accDescr {} fill:red` も拒否されます。
style の文脈を出るのは規則 9 だけで、
class の文を終える文字列の後でも、
`style` や `classDef` の文のスタイルの後にあって次の文を始める文字列の後でも
同じです。
そのため `class r "c" accDescr {}`、`style r fill:red "a" accDescr {}`、
`class r "c" #x` は style の文脈で読まれます。
そこでは `accDescr` は `style-word`、
`#` は class の文が取らない `style-hash` の単位なので、
これらは拒否されます。
文脈を出る改行は単位ではないので、
文は次の行に文の文脈で続けられます。
`class r`、改行、`c` は r にクラス c を与え、
`class r,e`、改行、`c,d` と、`class`、改行、`"r" "c"` も同じです。
スタイルやクラスの後の文字列は次の文を始め、
次の行がそれを続けられます。
`style r fill:red "r"`、改行、`:::c` は r にクラス c を与え、
`style r fill:red "a"`、改行、`- satisfies -> b` は a から b への関係です。
一方、テキストの終わりの `style r fill:red "a"` は拒否されます。
`style`、改行、`r fill:red` は拒否されます。
スタイルは style の文脈でしか読めないからです。
空行の 2 つ目の改行は `newline` の単位です。
[fixture: requirement/lex-style-tab] [fixture: requirement/lex-style-dot]
[fixture: requirement/lex-style-non-ascii]
[fixture: requirement/lex-classdef-string-then-empty-description-block]
[fixture: requirement/lex-class-string-hash]
[fixture: requirement/lex-style-string-then-empty-description-block]
[fixture: requirement/lex-class-string-then-empty-description-block]
[fixture:
requirement/lex-style-empty-description-block] [fixture:
requirement/lex-class-list-next-line] [fixture:
requirement/lex-class-list-comma-next-line] [fixture:
requirement/lex-class-strings-next-line] [fixture:
requirement/lex-style-string-then-shorthand] [fixture:
requirement/lex-class-string-then-shorthand] [fixture:
requirement/lex-style-string-then-relationship] [fixture:
requirement/lex-style-string-alone] [fixture:
requirement/lex-style-keyword-line-feed] [fixture:
requirement/lex-style-blank-line-after] [fixture:
requirement/lex-style-trailing-spaces]

### アクセシビリティの値

タイトルの文脈では、改行以外の 0 個以上の文字が `title-text` の単位で、
文脈を出ます。
説明の文脈も同じように `description-text` の単位を読みます。
`:` の後の空白は改行を含めて `:` の単位と一緒に読まれるので
（文の文脈の規則 2 と 3）、
テキストは空白ではない最初の文字から始まり、それは後の行にもありえます。
`accTitle:`、改行、`T` のタイトルは `T` です。
テキストの終わりでは入力は拒否されます（[単位と文脈](#単位と文脈) を参照）。
`;`、`#`、`%%` はテキストの文字です。
`accTitle: a;b #c %% d` のタイトルは `a;b #c %% d` です。
テキストの終わりの空白は単位に読み込まれ、値からは外されます
（[RequirementLiteral](../ast/requirement.ja.md#requirementliteral) を参照）。
`accTitle` の行は、文が始まるところならどこでも始められます。
`}` の直後、ディレクティブの後、コメント行の後です。
[fixture: requirement/db-acc-title-descr] [fixture:
requirement/gram-acc-title-line-feed-then-text] [fixture:
requirement/lex-acc-title-semicolon-hash-percent] [fixture:
requirement/lex-acc-title-after-close-brace] [fixture:
requirement/lex-acc-title-after-directive] [fixture:
requirement/lex-acc-title-after-comment-line]

説明ブロックの文脈では、`}` は `}` の単位で文脈を出て、
`}` 以外の 1 つ以上の文字（改行を含む）は
`description-block-text` の単位です。
`{` の後の空白は改行を含めて `{` の単位と一緒に読まれるので
（文の文脈の規則 4）、
テキストは空白ではない最初の文字から始まります。
`accDescr {}` と、
括弧がディレクティブだけ、またはコメント行だけを持つブロックは、
テキストを持たず、mermaid.js ではトークンを作りません。
**空の説明ブロック**です（[空の説明ブロック](#空の説明ブロック) を参照）。
テキストは最初の `}` まで続きます。
`accDescr { a {b }` の説明は `a {b` です。
[fixture: requirement/db-acc-descr-block] [fixture:
requirement/gram-acc-descr-block-empty]
[fixture: requirement/gram-acc-descr-block-comment-line-only]
[fixture:
requirement/gram-acc-descr-block-directive-only] [fixture:
requirement/lex-acc-descr-block-brace-in-text] [fixture:
requirement/lex-acc-descr-block-unclosed]

これらの文脈に入る規則は文の文脈だけの規則です。
style の文脈では、`accDescr` は `style-word` です
（[style の文脈](#style-の文脈) を参照）。
[fixture: requirement/lex-style-empty-description-block]

### コメント

字句解析器は、単位のほかに**図のコメント**を読みます。
その行の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
[common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器がテキストを読む前に取り除かれます。
図のコメントは行の途中から始まれ、
ヘッダーの後の `%%` だけの行、`% c`、`%%{ }%%` は、
コメント行ではなく図のコメントです。
[fixture: requirement/lex-hash-comment-line] [fixture:
requirement/lex-percent-comment-line] [fixture:
requirement/lex-bare-percent-line-after-statement] [fixture:
requirement/lex-percent-brace-line]

図のコメントは、文の文脈で単位が始まるところの、
`#`（規則 8）か `%`（規則 9）で始まり、改行まで続きます。
改行はその一部ではありません。
ヘッダーの後、`{` の後、`}` の後、文字列の値やキーワードの値の後、
関係の文字列の先の後で始められます。
[fixture: requirement/header-hash-comment] [fixture:
requirement/header-percent-comment] [fixture:
requirement/lex-hash-comment-after-brace] [fixture:
requirement/lex-percent-comment-after-brace] [fixture:
requirement/lex-hash-comment-after-close-brace]
[fixture: requirement/lex-hash-comment-after-risk] [fixture:
requirement/lex-percent-comment-after-verify-method] [fixture:
requirement/lex-hash-comment-after-string-target]
[fixture:
requirement/lex-percent-comment-after-string-value]
図のコメントの**印**は、`#` で始まるときは `#`、
`%%` で始まるときは `%%`、それ以外は `%` で、
値は印の後のテキストです。
`# c` の値は空白文字と `c`、`% c` の値も同じ、
`%%` だけの値は空、`%%{ }%%` の値は `{ }%%` です。
印は、字句解析器が読むとおり、ディレクティブのないテキストで見つけ、
値は、コメント行と同じく、ディレクティブを含めた印の後のソースのテキストです。
引用符なしのテキストや文字列の中の `#` や `%`、
および style の文脈の `#` や `%` は、コメントを始めません。
style の文脈の `#` は `style-hash` の単位で、
スタイルは取り、class の文は取らないので、
`class r c #x` は拒否されます（[style の文脈](#style-の文脈) を参照）。
一方、文の文脈の `r:::"c"` の後では、`#x` はコメントです。
[fixture: requirement/lex-name-percent] [fixture: requirement/lex-value-hash]
[fixture: requirement/lex-string-hash-percent] [fixture:
requirement/lex-style-hash-after-style]
[fixture: requirement/lex-hash-comment-after-shorthand-string-class]
[fixture: requirement/lex-class-hash-after-classes]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
`unquoted-text` のような単位の名前はその名前の 1 つの単位を表し、
二重引用符の中のテキストは、`"element"` や `"{"` のように、
そのテキストが名付ける単位を表します。
文法は
[`requirementDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L107-L267)
の文法を言い直したもので、同じ単位の並びを受理します。

以下の各規則は、[ast/requirement.ja.md](../ast/requirement.ja.md)
で定める木のノードを作ります。

| 規則                                                                                               | ノード                                                                                        |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `diagram`                                                                                          | RequirementDiagram                                                                            |
| `requirement-statement`                                                                            | RequirementRequirementStatement。その `requirement-body` の項目が `body` のリスト             |
| `requirement-field`                                                                                | RequirementValueField、RequirementRiskField、RequirementVerifyMethodField                     |
| `element-statement`                                                                                | RequirementElementStatement。その `element-body` の項目が `body` のリスト                     |
| `element-field`                                                                                    | RequirementElementField                                                                       |
| `relationship-statement`                                                                           | RequirementRelationshipStatement                                                              |
| `direction-statement`                                                                              | RequirementDirectionStatement。各 `direction-text` に RequirementIgnoredText                  |
| `style-statement`                                                                                  | RequirementStyleStatement                                                                     |
| `class-def-statement`                                                                              | RequirementClassDefStatement                                                                  |
| `class-statement`                                                                                  | RequirementClassStatement                                                                     |
| `class-shorthand-statement`                                                                        | RequirementClassShorthandStatement                                                            |
| `accessibility-statement`                                                                          | RequirementAccTitleStatement、RequirementAccDescrStatement、RequirementAccDescrBlockStatement |
| 文が始まるところの `empty-description-block`                                                       | テキストのない RequirementAccDescrBlockStatement。それだけで 1 つの文                         |
| 本体の中の `empty-description-block`                                                               | RequirementIgnoredText。`body` のリストの項目                                                 |
| `string`                                                                                           | StringLiteral                                                                                 |
| 名前である `unquoted-text`、名前である `style-word`                                                | RequirementIdentifier                                                                         |
| 値である `unquoted-text`、`style-item`、`title-text`、`description-text`、`description-block-text` | RequirementLiteral                                                                            |
| `direction-text`                                                                                   | RequirementIgnoredText                                                                        |

### 図と文

```text
diagram   = "header" empty-description-block* newline line*
line      = statement | newline
statement = requirement-statement
          | element-statement
          | relationship-statement
          | direction-statement
          | style-statement
          | class-def-statement
          | class-statement
          | class-shorthand-statement
          | accessibility-statement
          | empty-description-block
name      = unquoted-text | string
```

2 つの文は何も区切りません。
単位が許すところでは、文は同じ行で別の文に続けられ、
その間の `newline` の単位はそれだけで 1 つの `line` です。
文は `}` と同じ行に、空白を挟んでも挟まなくても続けられます。
`} element e {` と `}element e {` は受理されます。
引用符なしのテキストの後には、
その行にはテキストを終えるもの以外は続けられません。
`id: 1 text: t` は値 `1 text` に `:` が続いたもので拒否され、
`a - satisfies -> b - traces -> c` は、
`-` で始まる文がないので拒否されます。
mermaid.js の文法には `title` の文の規則がなく、
その字句解析器は `title` とその後のテキストを、
文法が取らない単位として読みます
（[文の文脈](#文の文脈) の規則 1）。
[fixture: requirement/lex-statement-after-close-brace] [fixture:
requirement/lex-statement-glued-after-close-brace] [fixture:
requirement/lex-two-fields-on-a-line] [fixture:
requirement/lex-relationship-chain] [fixture:
requirement/lex-statement-after-class-same-line] [fixture:
requirement/lex-title-statement]

### 要求

```text
requirement-statement = requirement-kind name class-list? requirement-body
requirement-kind      = "requirement" | "functionalRequirement"
                      | "interfaceRequirement" | "performanceRequirement"
                      | "physicalRequirement" | "designConstraint"
class-list            = ":::" name ( "," name )*
requirement-body      = "{" empty-description-block* newline requirement-line*
                        empty-description-block* "}"
requirement-line      = empty-description-block* requirement-field?
                        empty-description-block* newline
requirement-field     = ( "id" | "text" ) ":" field-value
                      | "risk" ":" ( "low" | "medium" | "high" )
                      | "verifyMethod" ":"
                        ( "analysis" | "demonstration" | "inspection" | "test" )
field-value           = unquoted-text | string
```

要求の文は、どのフィールドを省いてもよく、フィールドを 2 回書いてもよく、
前の要求の名前を、別のフィールドとクラスとともに繰り返してもかまいません。
`__proto__` と `constructor` は、ほかと同じ名前です。
種類、リスク、方法は、どの大文字小文字で書いてもかまいません。
mermaid.js が要求とそのフィールドとクラスを Db にどう読むかは、
tests パッケージの要約にあります。
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/db-requirement-defaults] [fixture:
requirement/db-requirement-name-repeated]
[fixture: requirement/db-requirement-second-definition-classes]
[fixture:
requirement/db-requirement-fields-repeated] [fixture:
requirement/db-keywords-upper-case] [fixture:
requirement/lex-risk-method-mixed-case] [fixture:
requirement/spec-requirement-diagram-f221edee] [fixture:
requirement/spec-requirement-diagram-06f108a7] [fixture:
requirement/spec-requirement-diagram-7e4de658] [fixture:
requirement/spec-requirement-diagram-dec8a0d9] [fixture:
requirement/spec-requirement-diagram-29c59902]

- `{` は、名前かクラスと同じ行に、空白を挟んでも挟まなくても続き、
  `{` の後には `newline` の単位が続きます。
  `requirement r{` は受理されます。
  一方、次の行に `{` がある `requirement r`、`requirement r {}`、
  `requirement r { id: 1` は拒否されます。
  `{` とその改行の間にはコメントを置けます。
  [fixture: requirement/gram-requirement-brace-glued] [fixture:
  requirement/gram-requirement-brace-next-line] [fixture:
  requirement/gram-requirement-braces-one-line] [fixture:
  requirement/gram-requirement-field-after-brace] [fixture:
  requirement/lex-hash-comment-after-brace]
- 各フィールドはそれだけで 1 行で、`newline` の単位が続きます。
  `}` はフィールドが始まれるところに置きます。
  `id: 1 }` は `}` を値に持ち、本体を閉じないままにします。
  フィールドの間には空行を置けます。
  [fixture: requirement/gram-requirement-close-after-value] [fixture:
  requirement/lex-blank-lines-in-body]
- `id` と `text` の値は、引用符なしのテキストか文字列です。
  値は必要で、`text:` だけは拒否されます。
  `risk` と `verifyMethod` の値は、それぞれのキーワードのどれかで、
  文字列ではありません。
  `risk: extreme`、`risk: "high"`、`verifymethod: guess` は拒否されます。
  要素のフィールドは要求のフィールドではありません。
  要求の中の `type: t` は拒否されます。
  [fixture: requirement/gram-requirement-value-empty] [fixture:
  requirement/gram-requirement-risk-unknown] [fixture:
  requirement/gram-requirement-risk-quoted] [fixture:
  requirement/gram-requirement-verify-method-unknown] [fixture:
  requirement/gram-requirement-element-field]
- `:::` の後のクラスは、`,` で区切った引用符なしのテキストか文字列です。
  引用符なしのクラスは `{` で終わり、空白文字を持てます。
  `requirement r:::a,b {`、`requirement r ::: c {`、`requirement r:::c{`、
  `requirement r:::a b {`、`requirement r:::"a b" {` は受理されます。
  [fixture: requirement/db-class-in-definition] [fixture:
  requirement/gram-requirement-separator-spaced] [fixture:
  requirement/gram-requirement-separator-glued-brace] [fixture:
  requirement/gram-requirement-class-space] [fixture:
  requirement/gram-requirement-class-string]

### 要素

```text
element-statement = "element" name class-list? element-body
element-body      = "{" empty-description-block* newline element-line*
                    empty-description-block* "}"
element-line      = empty-description-block* element-field?
                    empty-description-block* newline
element-field     = ( "type" | "docref" ) ":" field-value
```

要素の文の本体は要求の本体と同じに読まれ、
要素の文も、どのフィールドを省いてもよく、フィールドを 2 回書いてもよく、
前の要素の名前を繰り返してもかまいません。
mermaid.js が要素を Db にどう読むかは、tests パッケージの要約にあります。
要求と要素は同じ名前を持てます。
要素の中の `id: 1` は拒否され、
`docref` は中に `:` を持つ文字列にでき、
引用符なしの `docref` は `-` で終わります。
[fixture: requirement/db-element-fields] [fixture:
requirement/db-element-defaults] [fixture:
requirement/db-element-name-repeated] [fixture:
requirement/db-element-fields-repeated]
[fixture: requirement/db-element-definition-with-class-of-requirement]
[fixture:
requirement/db-requirement-and-element-same-name] [fixture:
requirement/gram-element-requirement-field] [fixture:
requirement/gram-element-docref-quoted-url] [fixture:
requirement/gram-element-docref-dash]

### 関係

```text
relationship-statement = name "-" relation "->" name
                       | name "<-" relation "-" name
relation               = "contains" | "copies" | "derives" | "satisfies"
                       | "verifies" | "refines" | "traces"
```

関係の文は、`-` と `->` では左の名前から右の名前へ、
`<-` と `-` では右の名前から左の名前への関係です。
名前は要求や要素の名前でなくてもかまわず、
同じ関係を 2 回書いてもかまいません。
単位の間に空白は要りません。
`a-satisfies->b` と `a<-satisfies-b` は関係です。
`a - likes -> b`、`a - satisfies - > b`、`- satisfies -> b` は拒否されます。
[fixture: requirement/db-relationship-arrows] [fixture:
requirement/db-relationship-undefined-names] [fixture:
requirement/db-relationships-repeated] [fixture:
requirement/gram-relationship-glued] [fixture:
requirement/gram-relationship-backward-glued] [fixture:
requirement/gram-relationship-unknown] [fixture:
requirement/gram-relationship-split-arrow] [fixture:
requirement/gram-relationship-no-source]

### スタイルとクラス

```text
direction-statement       = direction-text? "direction" "direction-value" direction-text?
style-statement           = "style" style-names styles
class-def-statement       = "classDef" style-names styles
style-names               = style-name ( "," style-name )*
style-name                = style-word | string
styles                    = style-item ( "," style-item )*
style-item                = ( style-word | style-colon | style-semicolon | style-dash | style-hash )+
class-statement           = "class" class-names class-names
class-names               = class-name ( "," class-name )*
class-name                = style-word | unquoted-text | string
class-shorthand-statement = name ":::" name ( "," name )*
accessibility-statement   = "accTitle" ":" title-text
                          | "accDescr" ":" description-text
                          | "accDescr" "{" description-block-text "}"
```

- 方向の文は図の方向を決め、何度書いてもかまいません。
  [fixture: requirement/spec-requirement-diagram-7522200d] [fixture:
  requirement/spec-requirement-diagram-6d165a76] [fixture:
  requirement/spec-requirement-diagram-34fcfcee] [fixture:
  requirement/db-direction-last-wins]
- `style` と `classDef` の文では、
  名前は `,` が前にない最初の単位で終わり、
  その後にスタイルが続き、少なくとも 1 つが要ります。
  スタイルは、次の `,` か style の文脈を出る改行までの
  `style-word`、`style-colon`、`style-semicolon`、`style-dash`、`style-hash`
  の単位で、
  その値はそれらのテキストをつないだものです
  （[RequirementLiteral](../ast/requirement.ja.md#requirementliteral) を参照）。
  `style r fill: red , stroke : blue` はスタイル `fill:red` と
  `stroke:blue` を持ち、
  `style r fill:red stroke:blue` は 1 つのスタイル `fill:redstroke:blue`、
  `style r fill:red;` はスタイル `fill:red;`、
  `style r fill:red #c` はスタイル `fill:red#c`、
  `style r 4px` はスタイル `4px` を持ち、
  `style r-x fill:red` は名前 r とスタイル `-xfill:red` を持ちます。
  名前は文字列にでき、その後のスタイルは空白を挟んでも挟まなくても続けられます。
  `style r`、`classDef c`、`style r fill:red,`、`style r width:50%`、
  `style r fill:"red x"` は拒否されます。
  style の文脈を出る改行の後ではスタイルの単位を読まず
  （[style の文脈](#style-の文脈) の規則 9）、
  `style` や `classDef` の後の名前は `style-word` か文字列なので、
  `style r fill:red`・改行・`: x - satisfies -> y`、
  `style "r"`・改行・同じ行、`classDef c fill:red`・改行・`,stroke:blue`、
  `style r`・改行・`,e fill:red` は拒否されます。
  [fixture: requirement/lex-style-colon-next-line] [fixture:
  requirement/lex-style-string-name-colon-next-line] [fixture:
  requirement/lex-classdef-comma-next-line] [fixture:
  requirement/lex-style-names-comma-next-line]
  [fixture: requirement/db-style-statement] [fixture:
  requirement/spec-requirement-diagram-5305b791] [fixture:
  requirement/lex-style-spaces] [fixture: requirement/lex-style-no-comma]
  [fixture: requirement/lex-style-semicolon] [fixture:
  requirement/lex-style-hash-after-style] [fixture:
  requirement/lex-style-digit-start] [fixture:
  requirement/lex-style-dash-after-name] [fixture:
  requirement/lex-style-string-name] [fixture:
  requirement/lex-style-string-name-glued] [fixture:
  requirement/lex-style-string-name-line-feed] [fixture:
  requirement/lex-classdef-string-name] [fixture:
  requirement/lex-style-without-style] [fixture:
  requirement/lex-classdef-without-style] [fixture:
  requirement/lex-style-trailing-comma] [fixture:
  requirement/lex-style-percent] [fixture: requirement/lex-style-string]
- mermaid.js が `style` と `classDef` の文のスタイルを
  Db の要求と要素にどう与えるかは、クラス `default` も含めて、
  tests パッケージの要約にあります。
- `class` の文は、`,` で区切った名前の 2 つのリストです。
  要求や要素の名前と、クラスです。
  最初のリストは `,` が前にない最初の名前で終わり、
  2 つ目は `newline` の単位か、`,` でも名前でもない単位で終わります。
  `class r,e a,b`、`class r , e c`、`class r "my c"` は受理され、
  `class r` と `class r c d` は拒否されます。
  style の文脈を出る改行は単位ではないので
  （[style の文脈](#style-の文脈) を参照）、
  その後では文の文脈の名前や `,` がリストを続けます。
  `class r c`・改行・`,d`（`, d` や `,"d"` でも同じ）は
  r にクラス c と d を与え、
  `class r`・改行・`c`・改行・`,d` では、`c` の後の改行が文を終える
  `newline` の単位なので、入力は拒否されます。
  [fixture: requirement/lex-class-second-list-comma-next-line] [fixture:
  requirement/lex-class-second-list-comma-space-next-line] [fixture:
  requirement/lex-class-second-list-string-next-line] [fixture:
  requirement/lex-class-second-list-after-newline]
  名前は要求の名前でも、要素の名前でも、どちらでもなくてもかまいません。
  クラスの短縮の文と、要求や要素の文の `:::` の後のクラスは、
  1 つの名前についてクラスを書きます。
  mermaid.js がクラスを Db の要求と要素にどう与えるかは、
  tests パッケージの要約にあります。
  [fixture: requirement/db-class-statement] [fixture:
  requirement/gram-class-comma-spaces] [fixture:
  requirement/gram-class-string-class] [fixture:
  requirement/lex-class-one-list] [fixture: requirement/lex-class-three-lists]
  [fixture: requirement/lex-class-list-next-line] [fixture:
  requirement/db-class-statement-unknown-name-first] [fixture:
  requirement/db-class-styles-order] [fixture:
  requirement/db-class-styles-order-defined-first] [fixture:
  requirement/db-class-colon-form]
  [fixture: requirement/db-class-shorthand-requirement-and-element]
  [fixture:
  requirement/gram-class-shorthand-spaced]
- アクセシビリティの文はタイトルか説明を決め、
  どちらも、行でもブロックでも、何度書いてもかまいません。
  mermaid.js がそれらを Db にどう読むかは、tests パッケージの要約にあります。
  [fixture: requirement/db-acc-title-descr] [fixture:
  requirement/db-acc-descr-block] [fixture:
  requirement/db-acc-descr-block-then-line] [fixture:
  requirement/db-acc-descr-line-then-block]

### 空の説明ブロック

```text
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位に、
`description-block-text` の単位なしで直接 `}` の単位が続いたものです。
mermaid.js はそれにトークンを読みません。
文の文脈で文が始まるところではどこでも、テキストのない説明ブロックの文で、
何も変えません。
行の始まり、ヘッダーの直後、`}` か文字列で終わる文の直後などで、
`a - satisfies -> "b" accDescr {}` と `r:::"c" accDescr {}` もそうです。
`accDescr {` を読むのは文の文脈だけです
（[アクセシビリティの値](#アクセシビリティの値) を参照）。
文字列で終わる class の文の後では、字句解析器はまだ style の文脈にあり
（[style の文脈](#style-の文脈) を参照）、
`accTitle:` や方向の値の後では、ブロックはテキストです。
`accTitle: T accDescr {}` のタイトルは `T accDescr {}` で、
`direction LR accDescr {}` もそうです。
要求か要素の本体の行では、本体の項目で、mermaid.js は読みません。
`{` の直後、フィールドの前、値が文字列かキーワードのフィールドの後、`}` の前、
行にそれだけのときで、複数行にわたるときや中にコメント行があるときも同じで、
2 つあれば 2 つの項目です。
引用符なしの名前や値の後では、それはテキストの一部で、
テキストはその `{` で終わります（[名前と値](#単位と文脈) を参照）。
`requirement r accDescr {} {` は、`{` と `}` が続く名前 `r accDescr` で、
拒否されます。
それ以外では、ブロックは文の中、その 2 つの単位の間、
つまりその前の文の単位が後に続くところにあり、
木にはそこにそれを置く場所がないので、入力は拒否されます。
mermaid.js はそれにトークンを読まず、入力を受理します
（[既知の差異](#既知の差異) を参照）。
たとえば、`requirement` や `element` の後、文字列の名前と `:::` や `{` の間、
`:::` やクラスの `,` の後、文字列のクラスとその後の `,` や `{` の間、
フィールドの名前とその `:` の間、`:` と値の間、関係の 2 つの単位の間です。
そのため、`r:::"a" accDescr {} ,b`、`class r`・改行・`"c" accDescr {} ,d`、
`class r`・改行・`accDescr {} c` は、
`,b`、`,d`、クラス `c` が文を続けるので拒否されます。
一方、`class r`・改行・`"c" accDescr {}` と
`style r fill:red`・改行・`accDescr {}` は、
後に文の単位が続かないので、ブロックは文です。
[fixture: requirement/div-empty-description-block-before-shorthand-class-comma]
[fixture: requirement/div-empty-description-block-before-class-comma-next-line]
[fixture: requirement/div-empty-description-block-before-class-next-line]
[fixture: requirement/gram-empty-description-block-after-class-string-next-line]
[fixture: requirement/gram-empty-description-block-after-style-line]
引用符なしのクラスや、引用符なしの関係の元の後のブロックは、
上と同じくテキストの一部です。
[fixture: requirement/gram-acc-descr-block-empty] [fixture:
requirement/header-empty-description-block] [fixture:
requirement/gram-empty-description-block-after-close-brace] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/gram-empty-description-block-after-brace] [fixture:
requirement/gram-empty-description-block-before-field] [fixture:
requirement/gram-empty-description-block-after-string-value] [fixture:
requirement/gram-empty-description-block-before-close-brace] [fixture:
requirement/gram-empty-description-block-in-element-body] [fixture:
requirement/gram-empty-description-block-space-in-body]
[fixture: requirement/gram-empty-description-block-multiline-in-body] [fixture:
requirement/gram-empty-description-block-comment-line-in-body] [fixture:
requirement/gram-empty-description-block-multiline-after-string-value]
[fixture:
requirement/gram-empty-description-blocks-adjacent-in-body]
[fixture: requirement/lex-class-string-then-empty-description-block]
[fixture: requirement/gram-empty-description-block-after-shorthand-string-class]
[fixture: requirement/lex-acc-title-empty-description-block] [fixture:
requirement/lex-direction-line-empty-description-block]
[fixture: requirement/gram-empty-description-block-after-string-target]
[fixture: requirement/gram-empty-description-block-after-keyword-value]
[fixture: requirement/div-empty-description-block-before-class-separator]
[fixture: requirement/div-empty-description-block-before-shorthand-separator]
[fixture: requirement/div-empty-description-block-after-string-class] [fixture:
requirement/div-empty-description-block-after-string-class-before-brace]
[fixture: requirement/div-empty-description-block-after-class-comma]
[fixture:
requirement/lex-name-then-empty-description-block]
[fixture: requirement/div-empty-description-block-between-keyword-and-name]
[fixture: requirement/div-empty-description-block-after-class-separator]
[fixture: requirement/div-empty-description-block-after-shorthand-separator]
[fixture: requirement/div-empty-description-block-before-brace] [fixture:
requirement/div-empty-description-block-before-field-colon] [fixture:
requirement/div-empty-description-block-after-field-colon] [fixture:
requirement/div-empty-description-block-before-risk] [fixture:
requirement/div-empty-description-block-before-element-value] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/div-empty-description-block-before-arrow] [fixture:
requirement/div-empty-description-block-after-arrow] [fixture:
requirement/div-empty-description-block-in-backward-relationship] [fixture:
requirement/div-empty-description-block-after-string-source] [fixture:
requirement/div-empty-description-block-between-element-keyword-and-name]
[fixture: requirement/lex-class-then-empty-description-block] [fixture:
requirement/lex-source-then-empty-description-block]

### 文法の外の拒否

ありません。
この図の Db はどの入力でも例外を投げないので、
文法が受理する入力はすべて受理されます。

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  テキストの単位と文字列の単位以外の単位の中のディレクティブは、
  この仕様では入力を拒否させ、mermaid.js は受理します
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  `style`、`classDef`、`class` の後の名前やクラス、キーワード、矢印、`:::`、
  `direction`、方向の値の中です。
  [fixture:
  requirement/div-directive-in-style-name] [fixture:
  requirement/div-directive-in-class-name] [fixture:
  requirement/div-directive-in-header-keyword] [fixture:
  requirement/div-directive-in-requirement-keyword] [fixture:
  requirement/div-directive-in-field-keyword] [fixture:
  requirement/div-directive-in-risk-keyword] [fixture:
  requirement/div-directive-in-relationship-keyword] [fixture:
  requirement/div-directive-in-arrow] [fixture:
  requirement/div-directive-in-separator] [fixture:
  requirement/div-directive-in-style-keyword] [fixture:
  requirement/div-directive-in-acc-title-keyword] [fixture:
  requirement/div-directive-in-direction-keyword] [fixture:
  requirement/div-directive-in-direction-value]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則か `classDef` の規則に合う行では、
  テキストの単位と文字列の単位以外の単位の中の無視される `;` は、
  ここでは入力を拒否させ、
  mermaid.js は `;` を取り除いて 2 つの部分を 1 つとして読みます。
  要求 `"style:#x"` の後で、mermaid.js では
  `"style:#x" - sati;sfies -> b` は関係 `satisfies` の関係です。
  テキストの単位（引用符なしの名前を含む）の中では mermaid.js の読みを保ち、
  `"style:#x" - satisfies -> b;c` は両者で `bc` への関係です。
  [fixture:
  requirement/div-ignored-semicolon-in-relationship-keyword]
  [fixture: requirement/tokens-ignored-semicolon-in-name]
  [fixture:
  requirement/tokens-ignored-semicolon-in-acc-title] [fixture:
  requirement/tokens-ignored-semicolon-in-direction-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  frontmatter に `title: <a` があると、mermaid.js では
  `text: "b="c">d"` のテキストは `b='c'>d` ですが、
  ここでは文字列は 2 つ目の `"` で終わり、入力は拒否されます。
  [fixture: requirement/div-html-tag-starts-in-frontmatter-string]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  有効な YAML ではない frontmatter は、この仕様では受理され、
  mermaid.js は拒否します。
  [fixture: requirement/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  文の中の空の説明ブロックと、どこにあっても空の文字列は、
  この仕様では入力を拒否させ、
  mermaid.js はそれにトークンを読まずに入力を受理します
  （[文字列](#単位と文脈) と [空の説明ブロック](#空の説明ブロック) を参照）。
  文の始まるところでは空の説明ブロックは文で、本体の行では本体の項目で、
  入力は受理されます。
  [fixture: requirement/div-empty-description-block-between-keyword-and-name]
  [fixture: requirement/div-empty-description-block-before-field-colon]
  [fixture: requirement/div-empty-description-block-in-relationship] [fixture:
  requirement/div-empty-string-line] [fixture:
  requirement/div-empty-string-body-line] [fixture:
  requirement/div-empty-string-before-value] [fixture:
  requirement/gram-acc-descr-block-empty] [fixture:
  requirement/gram-empty-description-block-in-body]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかに、名前として、または値の中に
  `C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` があると、
  mermaid.js はテキストを C4 のパーサーに渡し、それが拒否します。
  ここではテキストは要求図です。
  `C4Context` はどちらでも名前です。
  [fixture: requirement/div-c4-keyword-in-name] [fixture:
  requirement/div-c4-keyword-in-value] [fixture: requirement/lex-c4context-name]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
  およびそのような行の後の空白だけの行は、ここではコメントか何もないもので、
  mermaid.js は入力を拒否します。
  その字句解析器がその行をコメントとして、
  その後の改行を `newline` の単位として読み、
  その文法がヘッダーの前でそれを取らないからです（[検出](#検出) を参照）。
  [fixture: requirement/header-after-bare-percent-line] [fixture:
  requirement/header-after-empty-braces-line] [fixture:
  requirement/header-after-bare-percent-line-and-whitespace-line]

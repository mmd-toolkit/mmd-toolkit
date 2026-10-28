# ER

英語版: [er.md](./er.md)

mermaid.js での正本:

- [`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison)
- [`erDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts)
- [`er/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er) のテスト（`*.spec.js`）

この文書は、図種 `er`、実体関連図を扱います。
木のノードは [ast/er.ja.md](../ast/er.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 10 がこの文法を選びます。
テキストが、空白の後、ちょうどこの大文字小文字の、
`erDiagram` で始まるときです（[`erDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDetector.ts#L9-L11)）。 [fixture: er/header-only]
[fixture: er/header-leading-whitespace]

その後、字句解析器がヘッダーをもう一度、大文字小文字を区別せず、
語の文字が続かない形で読みます（[文の文脈](#文の文脈) を参照）。
そのため `erDiagramX` は ER 図として検出されて拒否され、
`erDiagram-x` はヘッダーと実体 `-x` です。
文はヘッダーと同じ行に、空白を挟んでも挟まなくても続けられ、
ヘッダーだけの入力も、
後ろに改行がなくても受理されます。 [fixture: er/header-other-suffix]
[fixture: er/header-dash-suffix] [fixture:
er/header-statement-same-line] [fixture: er/header-tab-then-statement]
[fixture: er/header-only] [fixture: er/header-line-feed-only] [fixture:
er/header-crlf-only]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行です。
検出はそれを読んで通り過ぎてヘッダーを見つけ、
その行はどの図種でもそうであるように、
ここでは印 `%%` の図のコメントです（[図種の検出](../common.ja.md#図種の検出) を参照）。
コメントはどのノードにも属さず、ErDiagram はヘッダーから始まります。
mermaid.js はどちらの場合も入力を拒否し、
`%%` だけの行の後に空白だけの行があるときも拒否します。
この図の字句解析器に `%` の規則がないからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
ヘッダーの前の行のディレクティブ、ヘッダーの行でその前にあるディレクティブ、
ヘッダーの後の同じ行のディレクティブは、
ディレクティブであってそれ以外ではありません。 [fixture: er/header-after-bare-percent-line]
[fixture:
er/header-after-empty-braces-line] [fixture:
er/header-after-bare-percent-line-and-whitespace-line] [fixture:
er/header-after-directive-line] [fixture: er/header-after-directive-same-line]
[fixture: er/header-then-directive-same-line]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を [変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして、
コメント領域と行の規則が無視する `;` はないものとして読みます。
最後の文字の後に字句解析器が読む `\n` （[テキストの終わり](../common.ja.md#テキストの終わり)）は図のテキストの一部です。
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 である、
この図自身の単位の規則を述べます。

この図の mermaid.js の字句解析器は、
文字の大文字小文字を区別せずに比べます（[表記](../common.ja.md#表記) を参照）。
`CLASSDEF a fill:red`、`STYLE A …`、`ACCTITLE: T`、`DIRECTION tb`、`END`、
`A ONE OR MORE TO MANY B : x`、`A U--o{ B : x`、
属性ブロックの中の `int id pk` は、
小文字の語と同じに読まれます。 [fixture: er/lex-classdef-upper-case]
[fixture: er/lex-style-upper-case]
[fixture: er/lex-acc-title-upper-case] [fixture: er/lex-direction-upper-case]
[fixture: er/lex-end-upper-case] [fixture: er/lex-cardinality-words-upper-case]
[fixture: er/lex-md-parent-upper-case] [fixture: er/lex-key-lower-case]
以下で**キーワード**とは、大文字小文字を区別せずに照合する語で、
語の文字が続かないものです（[表記](../common.ja.md#表記) を参照）。
`ones`、`tomato`、`manyx`、`ending`、`classes`、`styles` は名前で、
`end` と `many` は単位が始まるところではどこでもキーワードです。 [fixture: er/lex-keyword-one-prefix]
[fixture: er/lex-keyword-to-prefix]
[fixture: er/lex-keyword-many-prefix] [fixture: er/lex-keyword-end-prefix]
[fixture: er/lex-keyword-class-prefix] [fixture: er/lex-keyword-style-prefix]
[fixture: er/gram-end-alone] [fixture: er/lex-many-alone]

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
属性ブロックの文脈、バッククォートの語の中、タイトルの文脈、説明の文脈、
説明ブロックの文脈、style の文脈で終わると、入力は拒否されます。
そのため、`}` のない属性付きの `A {`、閉じていないバッククォートの語、
後ろに何もない `accTitle:`、
`}` のない `accDescr {` （後ろにテキストがあってもなくても）は拒否されます。
テキストの終わりの `classDef a fill:red` と `style A fill:red;` は受理されます。
最後の文字の後に字句解析器が読む改行（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）が `newline` の単位で、
style の文脈を出るからです。
一方、空白文字が続く `classDef a fill:red`、タブが続く `style A fill:red`、
空白文字と改行が続く `classDef a fill:red`、
空白文字が続く `style A fill:red;` は拒否されます。
その空白がその改行を取り（style の文脈の規則 2）、
テキストが style の文脈で終わるからです。 [fixture: er/lex-block-unclosed]
[fixture: er/lex-block-unclosed-empty]
[fixture: er/lex-backquote-unclosed] [fixture: er/lex-acc-title-at-end]
[fixture: er/lex-acc-title-space-at-end] [fixture:
er/lex-acc-title-line-feed-at-end] [fixture: er/lex-acc-descr-at-end]
[fixture: er/lex-acc-descr-block-unclosed] [fixture:
er/lex-acc-descr-block-unclosed-empty] [fixture:
er/lex-acc-descr-block-unclosed-lines] [fixture: er/lex-classdef-at-end]
[fixture: er/lex-style-semicolon-at-end]
[fixture: er/lex-classdef-trailing-space-at-end] [fixture:
er/lex-style-trailing-tab-at-end] [fixture:
er/lex-classdef-trailing-space-line-feed-at-end] [fixture:
er/lex-style-semicolon-space-at-end]

**空白。**
以下の規則は、それぞれがどの文字を空白として取るかを述べます。
文の文脈では、単位に属さずに単位の間に置けるのは空白文字とタブだけで（規則 5）、
改行は `newline` の単位です。
[表記](../common.ja.md#表記) のそれ以外の空白文字、たとえば U+00A0、U+2028、
U+3000、U+FEFF は、そこでは名前の文字で、
フォームフィードと垂直タブは `invalid` の単位です。
属性ブロックの文脈と style の文脈では、規則が別に言わないかぎり、
改行を含むすべての空白文字が単位の間に置けます。
文の文脈の規則が自分で空白を読むところ、つまり `accTitle`、`accDescr`、`end`、
方向の行、濃度の `1` の規則では、
改行を含むすべての空白文字を読みます。 [fixture: er/lex-name-nbsp]
[fixture: er/lex-name-line-separator] [fixture:
er/lex-name-trailing-nbsp] [fixture: er/lex-bom-in-name] [fixture:
er/lex-form-feed] [fixture: er/lex-vertical-tab] [fixture:
er/lex-tab-whitespace] [fixture: er/lex-block-nbsp] [fixture:
er/lex-block-form-feed] [fixture: er/lex-block-vertical-tab] [fixture:
er/lex-classdef-nbsp] [fixture: er/lex-classdef-line-separator] [fixture:
er/lex-acc-title-ideographic-space] [fixture:
er/lex-end-blank-line-then-name] [fixture: er/lex-direction-value-tab]
[fixture: er/lex-direction-value-nbsp] [fixture:
er/lex-direction-value-line-separator] [fixture: er/lex-one-tab]

**名前。**
文の文脈では、ASCII の外の文字、語の文字、`-`、`*`、
`.` のいずれかである文字 1 つ以上を、
できるだけ多く読んだものが `name` の単位です。
`ÀB-c.d*e`、`_a`、絵文字、`C4Context` は名前で、 `#`、`,`、`;`、`'`、`(`、`)`、
`[`、`]`、`{`、`}`、`|`、`:`、`=`、`+`、`/`、 `&`、`@`、`$`、`!`、`^`、`` ` ``、
`~`、`?` は名前の文字ではありません。
名前とそのいずれかを持つ行は、その文字が自分の単位を始めないかぎり、
`Blo?rf` の `?` がそうであるように拒否されます。 [fixture: er/lex-name-unicode-characters]
[fixture: er/lex-name-underscore]
[fixture: er/lex-name-emoji] [fixture: er/lex-c4context-name] [fixture:
er/lex-name-hash] [fixture: er/lex-name-comma] [fixture:
er/lex-semicolon-after-name] [fixture: er/lex-single-quote] [fixture:
er/spec-er-diagram-039f9cc0] [fixture: er/spec-er-diagram-594d55f9] [fixture:
er/spec-er-diagram-05b13768] [fixture: er/spec-er-diagram-38540142] [fixture:
er/spec-er-diagram-3c37dc3e] [fixture: er/spec-er-diagram-bd6185fa] [fixture:
er/spec-er-diagram-d7ac9ccb] [fixture: er/spec-er-diagram-471b8346] [fixture:
er/spec-er-diagram-619a550d] [fixture: er/spec-er-diagram-20fe2993] [fixture:
er/spec-er-diagram-6666d913] [fixture: er/spec-er-diagram-7725a167] [fixture:
er/spec-er-diagram-99529c2d] [fixture: er/spec-er-diagram-cade6c9d] [fixture:
er/spec-er-diagram-ec259794] [fixture: er/spec-er-diagram-f8b6820d] [fixture:
er/spec-er-diagram-aa6cb3a0] [fixture: er/spec-er-diagram-94764f48] [fixture:
er/spec-er-diagram-95010e73]
エンティティは、字句解析器がテキストを読む前に、
プレースホルダーとして読まれ（[エンティティ](../common.ja.md#エンティティ) を参照）、
プレースホルダーは ASCII の外の文字でできているので、
文の文脈の `A#amp;` は 1 つの名前 `Aﬂ°amp¶ß` で、
`"A#amp;"` は同じ実体の引用符付きの名前です。
属性ブロックでは、プレースホルダーの `°` は語の文字ではないので、
`a#amp;b` はそこでは拒否されます。 [fixture: er/entity-placeholder-in-name]
[fixture:
er/entity-placeholder-in-quoted-name] [fixture:
er/entity-placeholder-in-attribute-word]
行の中で単位の後にある `#` や `%%` はコメントではありません。
この図にはコメントの規則がないので、
`A # c` と `A ||--o{ B : x %% c` は拒否されます。
コメント行は字句解析器がテキストを読む前に取り除かれ（[コメント行](../common.ja.md#コメント行) を参照）、
属性ブロックや subgraph の中でも、複数行にわたる文字列の中でも同じです。
文字列の中では、
それは文字列のコメント領域です。 [fixture: er/lex-hash-after-name]
[fixture: er/lex-percent-after-statement]
[fixture: er/comment-line] [fixture: er/lex-block-comment-line] [fixture:
er/lex-subgraph-comment-line] [fixture: er/tokens-comment-line-in-role-string]
[fixture: er/tokens-comment-line-in-comment-string] [fixture:
er/tokens-comment-line-in-backquoted-word]
文字列を閉じる引用符を持つコメント行は、それを一緒に持っていき、
文字列は閉じていないことになります。
`A ||--o{ B : "x`、改行、
`%% c"` は拒否されます。 [fixture: er/lex-comment-line-takes-closing-quote]

### 単位の中のディレクティブ

字句解析器は、ディレクティブを持たない図のテキストを、
mermaid.js がディレクティブを除いた後のテキストを読むとおりに読みます。
そこで [ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界) の規則が単位に当てはまります。
テキストの単位と文字列の単位の中のディレクティブは mermaid.js の読みを保ち、
名前の単位を含むそれ以外の単位の中のディレクティブは、入力を拒否させます。
**名前の単位**は、`name`、`number`、属性ブロックの `word`、`key`、
および `style` や `classDef` の後の名前かクラスの名前である `style-text` です。
**テキストの単位**は、`tilde-word`、スタイルの中の `style-text`、 `title-text`、
`description-text`、`description-block-text`、 `direction-text` です。
**文字列の単位**は、`quoted-name`、`string`、`comment-string`、
`backquoted-word` です。

- `A ||--o{ B : "x%%{init: {}}%%y"` のロールは `xy`、
  `"A%%{init: {}}%%B"` は実体 `AB`、
  属性のコメント `"x%%{init: {}}%%y"` は `xy`、
  バッククォートの語 `` `a%%{init: {}}%%b` `` は `ab`、
  チルダの語 `Li%%{init: {}}%%st~a~` は `List~a~`、
  `accTitle: a%%{init: {}}%%b` のタイトルは `ab`、
  `accDescr { a%%{init: {}}%%b }` の説明も同じです。
  `direction LR x%%{init: {}}%%y` は方向を設定し、
  `classDef a fi%%{init: {}}%%ll:red` はスタイル `fill:red` を定義します。
  mermaid.js と同じで、スタイルは単位のテキストをつないだものだからです。
  [ErLiteral](../ast/er.ja.md#erliteral) を参照してください。 [fixture: er/lex-directive-in-role-string]
  [fixture: er/lex-directive-in-quoted-name]
  [fixture: er/lex-directive-in-comment-string]
  [fixture: er/lex-directive-in-backquoted-word]
  [fixture: er/lex-directive-in-tilde-word]
  [fixture: er/lex-directive-in-acc-title]
  [fixture: er/lex-directive-in-acc-descr-block]
  [fixture: er/lex-directive-in-direction-text]
  [fixture: er/lex-directive-in-style-text]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `A %%{init: {}}%%||--o{ B : x`、`A ||%%{init: {}}%%--o{ B : x`、
  属性の前の `A %%{init: {}}%%{`、`p[%%{init: {}}%%P]`、
  ブロックの中の `string%%{init: {}}%%? a` と `int a PK %%{init: {}}%% , FK` は、
  ディレクティブがないものとして読まれます。 [fixture: er/lex-directive-between-units]
  [fixture:
  er/lex-directive-between-cardinality-and-line] [fixture:
  er/lex-directive-before-block] [fixture: er/lex-directive-after-alias-open]
  [fixture: er/lex-directive-before-optional-mark] [fixture:
  er/lex-directive-between-keys] [fixture: er/lex-directive-before-key-comma]
- `A%%{init: {}}%%B`、`1%%{init: {}}%%2`、`1%%{init: {}}%%.5`、
  `A ||--o{ B : x%%{init: {}}%%y`、`A:::c%%{init: {}}%%d`、
  `p[Per%%{init: {}}%%son]`、`subgraph S%%{init: {}}%%T`、
  ブロックの中の `str%%{init: {}}%%ing` と `P%%{init: {}}%%K`、
  `style A%%{init: {}}%%B fill:red` では、
  ディレクティブは名前の単位の中にあります。
  `er%%{init: {}}%%Diagram`、`sub%%{init: {}}%%graph`、`e%%{init: {}}%%nd`、
  `acc%%{init: {}}%%Title:`、`class%%{init: {}}%%Def`、`cl%%{init: {}}%%ass`、
  `st%%{init: {}}%%yle`、`dir%%{init: {}}%%ection LR`、
  `direction L%%{init: {}}%%R`、`one or %%{init: {}}%%more`、
  `1%%{init: {}}%%+`、`many(%%{init: {}}%%0)`、`|%%{init: {}}%%|`、
  `::%%{init: {}}%%:` では、キーワード、濃度、区切り記号の中にあります。
  入力は拒否され、mermaid.js は 2 つの部分を 1 つとして読んで受理します。
  [既知の差異](#既知の差異) を参照してください。 [fixture: er/div-directive-in-name]
  [fixture: er/div-directive-in-number-name]
  [fixture: er/div-directive-in-decimal-name]
  [fixture: er/div-directive-in-role-name]
  [fixture: er/div-directive-in-class-name] [fixture: er/div-directive-in-alias]
  [fixture: er/div-directive-in-subgraph-id]
  [fixture: er/div-directive-in-attribute-word]
  [fixture: er/div-directive-in-key] [fixture: er/div-directive-in-style-id]
  [fixture: er/div-directive-in-header-keyword]
  [fixture: er/div-directive-in-subgraph-keyword]
  [fixture: er/div-directive-in-end]
  [fixture: er/div-directive-in-acc-title-keyword]
  [fixture: er/div-directive-in-classdef-keyword]
  [fixture: er/div-directive-in-class-keyword]
  [fixture: er/div-directive-in-style-keyword]
  [fixture: er/div-directive-in-direction-keyword]
  [fixture: er/div-directive-in-direction-value]
  [fixture: er/div-directive-in-cardinality-words]
  [fixture: er/div-directive-in-cardinality-plus]
  [fixture: er/div-directive-in-cardinality-many]
  [fixture: er/div-directive-in-cardinality-symbol]
  [fixture: er/div-directive-in-class-separator]

**単位の間のトリビア。**
[common.ja.md](../common.ja.md) のトリビアは、
この図の単位と次のように出会います。
単独の CR は行終端で、
改行として読まれます（[行終端](../common.ja.md#行終端) を参照）。
方向の行、`classDef` と `style` の文、関係、`accTitle` の行、subgraph、
属性ブロックは、
単独の CR の間でも改行の間と同じに読まれます。 [fixture: er/lex-cr-only-direction]
[fixture: er/lex-cr-only-classdef]
[fixture: er/lex-cr-only-style] [fixture: er/lex-cr-only-relationship] [fixture:
er/lex-cr-only-acc-title] [fixture: er/lex-cr-only-subgraph] [fixture:
er/lex-cr-only-block]
2 つの単位の間の閉じたディレクティブは何もないものとして読まれ、
その周りの空白は文脈の規則で読まれます。
`accDescr %%{init: {}}%%{ x }`、`accTitle %%{init: {}}%%: x`、
`direction %%{init: {}}%%LR`、`subgraph %%{init: {}}%%S`、
`style A %%{init: {}}%%fill:red`、
改行の続く `end%%{init: {}}%%` はディレクティブがないものとして読まれ、
関係の行、subgraph のヘッダー、
`accTitle` の行の終わりのディレクティブも同じです。
`classDef` や `style` の行の終わりでは、
ディレクティブの前の空白文字がその後の改行を取ります（style の文脈の規則 2）。
`classDef a fill:red %%{init: {}}%%`、改行、`A` は、
ディレクティブのない同じテキストと同じく `fill:redA` を定義します。 [fixture: er/lex-directive-between-acc-descr-and-brace]
[fixture:
er/lex-directive-between-acc-title-and-colon] [fixture:
er/lex-directive-between-direction-and-value] [fixture:
er/lex-directive-between-subgraph-and-id] [fixture:
er/lex-directive-between-style-id-and-style] [fixture:
er/lex-directive-between-end-and-line-feed] [fixture:
er/tokens-closed-directive-end-of-relationship-line] [fixture:
er/tokens-closed-directive-end-of-subgraph-header] [fixture:
er/tokens-closed-directive-end-of-acc-title] [fixture:
er/tokens-closed-directive-end-of-classdef-line] [fixture:
er/tokens-closed-directive-end-of-style-line]
閉じないディレクティブはテキストの残りを取ります（[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）。
`A ||--o{ B : x %%{init: {}` と行 `C` は、
ディレクティブの前に空白があってもなくても実体 C を持たず、
`erDiagram %%{init: {}` と行 `A` は実体を持たず、
`classDef a fill:red%%{init: {}` と行 `A` はスタイル `fill:red` を定義します。
ディレクティブの前に空白文字のある `classDef a fill:red %%{init: {}` は、
テキストが style の文脈で終わるので拒否され、
属性ブロックの中の閉じないディレクティブはブロックの `}` を取るので、
入力は拒否されます。 [fixture: er/tokens-unclosed-directive-after-relationship]
[fixture:
er/tokens-unclosed-directive-glued-after-role] [fixture:
er/tokens-unclosed-directive-after-header] [fixture:
er/tokens-unclosed-directive-glued-after-classdef] [fixture:
er/tokens-unclosed-directive-after-classdef] [fixture:
er/tokens-unclosed-directive-in-block]
キーワードとその続きの間のコメント行は、
字句解析器がテキストを読む前に取り除かれます。
`accTitle:`、コメント行、`T` はタイトル `T` を持ち、 `accDescr:` でも、
`direction` とその値でも同じです。
空白文字の続く `classDef a fill:red`、コメント行、`A` は `fill:redA` を定義し、
`subgraph 1`、コメント行、`A` はコメント行がないときと同じく拒否され、 `end`、
コメント行、`B` は受理され、 `accDescr {`、コメント行、
`D }` は説明 `D` を持ちます。 [fixture: er/tokens-comment-line-after-acc-title-colon]
[fixture:
er/tokens-comment-line-after-acc-descr-colon] [fixture:
er/tokens-comment-line-after-direction] [fixture:
er/tokens-comment-line-after-classdef-space] [fixture:
er/tokens-comment-line-after-subgraph-one] [fixture:
er/tokens-comment-line-after-end] [fixture:
er/tokens-comment-line-after-acc-descr-brace]

### 文の文脈

文の文脈では、字句解析器は次の規則をこの順に試します。

1. `accTitle`、改行を含む 0 個以上の空白文字、`:`、改行を含む 0個以上の空白文字:
   `accTitle` の単位と `:` の単位。
   タイトルの文脈に入ります。 [fixture: er/gram-acc-title]
   [fixture: er/lex-acc-title-no-space] [fixture:
   er/lex-acc-title-space-before-colon] [fixture:
   er/lex-acc-title-line-feed-after-colon] [fixture:
   er/lex-acc-title-line-feed-before-colon]
2. `accDescr`、改行を含む 0 個以上の空白文字、`:`、改行を含む 0個以上の空白文字:
   `accDescr` の単位と `:` の単位。
   説明の文脈に入ります。 [fixture: er/gram-acc-descr]
3. `accDescr`、改行を含む 0 個以上の空白文字、`{`、改行を含む 0個以上の空白文字:
   `accDescr` の単位と `{` の単位。
   説明ブロックの文脈に入ります。 [fixture: er/gram-acc-descr-block]
   [fixture: er/lex-acc-descr-block-no-space]
   [fixture: er/lex-acc-descr-block-line-feed-before-brace]
4. **方向の行**（後述）。 [fixture: er/gram-direction]
5. 1 つ以上の空白文字かタブ: 何もなし。 [fixture: er/lex-tab-whitespace]
6. 1 つ以上の改行: `newline` の単位。 [fixture: er/header-blank-lines]
7. `"`、`"`・`%`・改行・U+000B・U+0008・`\` 以外の文字 1 つ以上、`"`:
   `quoted-name` の単位。
   `"A B"`、`"A#B"`、`"<b>A</b>"` は引用符付きの名前です。
   `""` は引用符付きの名前ではなく空の `string`（規則 8）で、
   どの実体の名前もそれを取りません。
   `%`、改行、U+000B、U+0008、
   `\` を中に持つ文字列も同じです。 [fixture: er/lex-quoted-name]
   [fixture: er/lex-quoted-name-hash] [fixture:
   er/lex-quoted-name-html] [fixture: er/spec-er-diagram-f4c59d78] [fixture:
   er/spec-er-diagram-c0a2be45] [fixture: er/spec-er-diagram-20d6ae6a]
   [fixture: er/spec-er-diagram-98428822] [fixture: er/spec-er-diagram-a1c253bf]
   [fixture: er/spec-er-diagram-a49c73a0]
8. `"`、改行を含む `"` 以外の文字 0 個以上、`"`: `string` の単位。
   空でもかまいません。 [fixture: er/gram-role-string]
   [fixture: er/lex-role-string-percent]
   [fixture: er/lex-role-string-line-feed] [fixture: er/gram-role-string-empty]
9. キーワード `erDiagram`: `header` の単位。 [fixture: er/header-only]
10. `{`: `{` の単位。
    属性ブロックの文脈に入ります。 [fixture: er/gram-attribute]
    [fixture: er/lex-block-no-space]
11. `#`: `#` の単位。
    文法のどの規則も取りません。 [fixture: er/lex-hash-after-name]
12. `,`: `,` の単位。 [fixture: er/lex-class-list-comma-spaces]
13. `:::`: `:::` の単位。 [fixture: er/gram-entity-classes]
14. `:`: `:` の単位。 [fixture: er/gram-relationship-symbols]
15. `[`: `[` の単位。 [fixture: er/gram-alias]
16. `]`: `]` の単位。 [fixture: er/gram-alias]
17. キーワード `style`: `style` の単位。
    style の文脈に入ります。 [fixture: er/gram-style]
18. キーワード `classDef`: `classDef` の単位。
    style の文脈に入ります。 [fixture: er/gram-classdef]
19. キーワード `class`: `class` の単位。 [fixture: er/gram-class]
20. キーワード `subgraph`: `subgraph` の単位。 [fixture: er/gram-subgraph]
21. キーワード `end` と、改行を含む 0 個以上の空白文字:
    `end` の単位。 [fixture: er/gram-subgraph]
    [fixture: er/lex-end-blank-line-then-name]
22. **濃度**、**数**、
    **関係の線**（後述）。 [fixture: er/gram-relationship-symbols]
23. 名前（[名前](#単位と文脈) を参照）。 [fixture: er/lex-name-unicode-characters]
24. 改行以外のそれ以外の文字: `invalid` の単位。 [fixture: er/lex-single-quote]

単位 `#`、`invalid`、ロールが読まれないところの `string`、
文法が取らないところの `newline` は、文法のどの規則も取らないので、
それらを持つ入力は拒否されます。
`A # c`、`A 'x'`、閉じる引用符のない `"A` と `A ||--o{ B : "x`、 `A`、改行、
`||--o{ B : x` は拒否されます。 [fixture: er/lex-hash-after-name]
[fixture: er/lex-single-quote] [fixture:
er/lex-quoted-name-unclosed] [fixture: er/lex-role-string-unclosed] [fixture:
er/lex-relationship-spec-next-line]
順番から導かれることをいくつか挙げます。

- キーワードは、単位が始まるところではどこでもキーワードで、
  名前はキーワードで始められません。
  `end` だけ、`many` だけ、`1+` だけは拒否され、ロール `one`、`to`、
  `end` も拒否されます。
  `ending`、`ones`、`tomato`、`manyx`、`classes`、
  `styles` は名前です。 [fixture: er/gram-end-alone]
  [fixture: er/lex-many-alone] [fixture:
  er/lex-one-plus-alone] [fixture: er/lex-role-keyword-one] [fixture:
  er/lex-role-keyword-to] [fixture: er/lex-role-keyword-end] [fixture:
  er/lex-keyword-end-prefix] [fixture: er/lex-keyword-one-prefix] [fixture:
  er/lex-keyword-to-prefix] [fixture: er/lex-keyword-many-prefix] [fixture:
  er/lex-keyword-class-prefix] [fixture: er/lex-keyword-style-prefix]
  `classDefa fill:red`、`classA a`、`styleA fill:red` はキーワードを持ちません。
  1 つ目は名前 `classDefa` と `fill` と `:` で拒否され、
  2 つ目は 2 つの名前 `classA` と `a` で、
  3 つ目は拒否されます。 [fixture: er/lex-classdef-no-whitespace] [fixture:
  er/lex-class-no-whitespace] [fixture: er/lex-style-no-whitespace]
- `end` の単位はその後の空白を改行ごと読むので、
  `end` の後の次の行は `newline` の単位を作りません。
  `end`、空行、`B` は subgraph の後の実体 B で、1 行の `end B` も同じで、
  `end B ||--o{ C : x` は関係を持ちます。
  `end` の後の空白が `classDef` の行に届いても、
  その行はふつうに読まれます。 [fixture: er/lex-end-blank-line-then-name]
  [fixture: er/lex-end-then-name]
  [fixture: er/lex-end-then-relationship] [fixture:
  er/lex-end-space-before-line-feed] [fixture:
  er/lex-end-line-feeds-then-classdef]
- 単位の後の `%%` や `#` は拒否されます（[名前](#単位と文脈) を参照）。
  `;` は区切りでも名前の文字でもありません。
  `A;` は拒否されますが、
  行の規則がそれを無視するところ（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行) を参照）は別です。
  `A ||--o{ Bstyle : "x:#y";` はロール `x:#y` で受理され、
  `A ||--o{ B : "x:#y";` は拒否されます。 [fixture: er/lex-semicolon-after-name]
  [fixture:
  er/tokens-ignored-semicolon-after-role] [fixture:
  er/lex-semicolon-after-role]
- 関係の外の `:` は拒否され、
  前に名前がないか後ろにクラスがない `:::` も拒否されます。
  `A : x`、`:::c`、`A:::`、
  `A:::c:::d` は拒否されます。 [fixture: er/gram-colon-after-name]
  [fixture: er/gram-class-separator-alone]
  [fixture: er/gram-class-separator-without-class] [fixture:
  er/gram-two-class-separators]
- 何も閉じない `}` や `]` と、
  ヘッダーの直後の `{` は拒否されます。 [fixture: er/lex-close-brace-alone]
  [fixture: er/lex-close-bracket-alone]
  [fixture: er/gram-header-then-block]

**キーワードとその後に続くもの。**
キーワードは語の境界で終わるので、その後の ASCII の数字や文字は名前を続け、
語の文字ではない ASCII の外の文字、`-`、`"`、`:`、`#`、`{`、改行、
テキストの終わりはキーワードを終えます。
`subgraph1`、`end1`、`class1`、`classDef1`、`style1`、`one1`、`to1`、
`many1` は名前なので、`subgraph1` は実体、`end1` はどの subgraph も閉じず、
`class1 A a` は 3 つの実体で、`classDef1 fill:red`、`style1 fill:red`、
`A ||--one1 B : x`、`A ||to1|| B : x`、`A many1 to one B : x` は拒否されます。
`subgraph-x` は subgraph `-x`、`subgraph"S"` は subgraph S、
`end-x` と `end"x"` は `end` と実体 `-x` か `x`、
`class-A a` は名前 `-A` への `class` の文、
`classDef-a fill:red` はクラス `-a` の定義、
`style-A fill:red` は名前 `-A` への `style` の文、
`erDiagram"A"` はヘッダーと実体 A です。
`subgraph:S`、`subgraph#S`、`subgraph{S}`、`end:`、`end#`、`end{}`、
`class:A a`、`class"A" a`、`classDef:a`、`classDef#a`、`classDef{a}`、
`classDef"a"`、`style:A`、`style"A"`、`erDiagram1`、`erDiagram:`、`erDiagram#`、
`erDiagram%%`、`A one-- B : x` は拒否され、
名前が続かなければならない `subgraph`、`class`、`classDef`、
`style` の後に改行やテキストの終わりが来るものも拒否されます。
`direction`、`accTitle`、`accDescr` の規則は、
語の後に空白か `:` か `{` を要します。
`directionx LR`、`direction1 LR`、`direction-LR`、および単独の `direction`、
`accTitle`、`accDescr` は名前で、 `direction: LR`、`accTitle1: T`、
`accTitle-: T`、`accTitle {T}` は拒否されます。
複数の語からなるキーワードは、語の間にちょうど 1 つの空白文字を持ちます。
空白文字 2 つの `A only  one to one B : x` は実体 `only` から B への関係で、
`A one  or more to one B : x`、`A one or`、改行、`more to one B : x`、
`A || optionally  to || B : x`、`A many (0) to one B : x` は拒否されます。
ASCII の外の文字は、キーワードの直後に名前を始めます。
`subgraphé` は subgraph `é`、
`classé A a` は `é` にクラス A を与える `class` の文と実体 `a`、
`styleé fill:red` と `classDefé fill:red` は名前 `é` への文、
`A ||--oneé : x` と `A ||--|oé : x` は実体 `é` への関係、
`endé` は `end` と実体 `é`、`erDiagramé` はヘッダーと実体 `é` です。
`A manyé to one B : x` と `A ||toé|| B : x` は、
キーワードの後に線か濃度が期待されるので拒否され、
`directioné LR` は 2 つの名前です。 [fixture: er/lex-keyword-subgraph-then-e-acute]
[fixture:
er/lex-keyword-class-then-e-acute] [fixture:
er/lex-keyword-style-then-e-acute] [fixture:
er/lex-keyword-classdef-then-e-acute] [fixture:
er/lex-keyword-one-then-e-acute] [fixture: er/lex-pipe-o-then-e-acute]
[fixture: er/lex-keyword-end-then-e-acute] [fixture: er/header-then-e-acute]
[fixture: er/lex-keyword-many-then-e-acute] [fixture:
er/lex-keyword-to-then-e-acute] [fixture:
er/lex-keyword-direction-then-e-acute]
[fixture: er/lex-keyword-subgraph-then-digit] [fixture:
er/lex-keyword-end-then-digit] [fixture: er/lex-keyword-class-then-digit]
[fixture: er/lex-keyword-classdef-then-digit] [fixture:
er/lex-keyword-style-then-digit] [fixture: er/lex-keyword-one-then-digit]
[fixture: er/lex-keyword-to-then-digit] [fixture:
er/lex-keyword-many-then-digit] [fixture: er/lex-keyword-subgraph-then-dash]
[fixture: er/lex-keyword-subgraph-then-quote] [fixture:
er/lex-keyword-end-then-dash] [fixture: er/lex-keyword-end-then-quote]
[fixture: er/lex-keyword-class-then-dash] [fixture:
er/lex-keyword-classdef-then-dash] [fixture: er/lex-keyword-style-then-dash]
[fixture: er/header-then-quoted-name] [fixture:
er/lex-keyword-subgraph-then-colon] [fixture:
er/lex-keyword-subgraph-then-hash] [fixture:
er/lex-keyword-subgraph-then-brace] [fixture: er/lex-keyword-end-then-colon]
[fixture: er/lex-keyword-end-then-hash] [fixture:
er/lex-keyword-end-then-brace] [fixture: er/lex-keyword-class-then-colon]
[fixture: er/lex-keyword-class-then-quote] [fixture:
er/lex-keyword-classdef-then-colon] [fixture:
er/lex-keyword-classdef-then-hash] [fixture:
er/lex-keyword-classdef-then-brace] [fixture:
er/lex-keyword-classdef-then-quote] [fixture:
er/lex-keyword-style-then-colon] [fixture: er/lex-keyword-style-then-quote]
[fixture: er/header-then-digit] [fixture: er/header-then-colon] [fixture:
er/header-then-hash] [fixture: er/header-then-percent] [fixture:
er/lex-keyword-one-then-dashes] [fixture: er/lex-keyword-one-then-colon]
[fixture: er/lex-keyword-subgraph-then-line-feed] [fixture:
er/lex-keyword-subgraph-at-end] [fixture:
er/lex-keyword-class-then-line-feed] [fixture: er/lex-keyword-class-at-end]
[fixture: er/lex-keyword-classdef-then-line-feed] [fixture:
er/lex-keyword-classdef-at-end] [fixture:
er/lex-keyword-style-then-line-feed] [fixture: er/lex-keyword-style-at-end]
[fixture: er/lex-keyword-direction-then-letter] [fixture:
er/lex-keyword-direction-then-digit] [fixture:
er/lex-keyword-direction-then-dash] [fixture:
er/lex-keyword-direction-at-end] [fixture: er/lex-keyword-acc-title-at-end]
[fixture: er/lex-keyword-acc-descr-at-end] [fixture:
er/lex-keyword-direction-then-colon] [fixture:
er/lex-keyword-acc-title-then-digit] [fixture:
er/lex-keyword-acc-title-then-dash] [fixture:
er/lex-keyword-acc-title-then-brace] [fixture: er/lex-only-one-two-spaces]
[fixture: er/lex-one-or-more-two-spaces] [fixture:
er/lex-one-or-more-line-feed-inside] [fixture:
er/lex-optionally-to-two-spaces] [fixture:
er/lex-many-space-before-parenthesis] [fixture:
er/lex-md-parent-upper-case-dash-dot]

**濃度、数、関係の線。**
規則 22 は次の規則をこの順に試します。
それぞれは、つづりによらず、濃度か線の名前の単位を 1 つ作ります。
濃度は `zero-or-one`、`zero-or-more`、`one-or-more`、`only-one`、`md-parent`、
関係の線は `identifying` と `non-identifying`、数は `number` です。
そのうちのキーワードは大文字小文字を区別せずに照合し、語の文字が続きません。
記号で終わるつづりの後には何が続いてもかまいません。

1. キーワード `one or zero`:
   `zero-or-one`。 [fixture: er/lex-cardinality-only-one-optionally-to]
2. キーワード `one or more`、キーワード `one or many`、`1+`:
   `one-or-more`。 [fixture: er/lex-cardinality-words]
   [fixture: er/lex-cardinality-one-or-many]
   [fixture: er/lex-cardinality-plus]
3. 語の文字が続かない `|o`: `zero-or-one`。 [fixture: er/lex-line-dot-dash]
   [fixture: er/lex-pipe-o-glued-left]
4. キーワード `zero or one`: `zero-or-one`。 [fixture: er/lex-cardinality-words]
5. キーワード `zero or more`、キーワード `zero or many`、`0+`:
   `zero-or-more`。 [fixture: er/lex-cardinality-one-or-many]
   [fixture: er/lex-cardinality-plus]
   [fixture: er/docs-syntax-entity-relationship-diagram-fff06d91]
6. 語の文字が続かない `}o`:
   `zero-or-more`。 [fixture: er/lex-o-brace-glued-letter]
7. `many(0)`: `zero-or-more`。
   `many(1)`: `one-or-more`。
   キーワード `many`: `zero-or-more`。 [fixture: er/lex-cardinality-many-zero]
   [fixture: er/lex-cardinality-many]
8. `}|`: `one-or-more`。 [fixture: er/spec-er-diagram-7b5988ee]
9. キーワード `one` かキーワード `only one`:
   `only-one`。 [fixture: er/lex-cardinality-many-zero] [fixture:
   er/lex-cardinality-only-one-optionally-to]
10. 1 つ以上の ASCII の数字、`.`、1 つ以上の ASCII の数字:
    `number`。 [fixture: er/lex-name-decimal]
11. 後ろに、改行を含む 1 つ以上の空白文字と、ASCII の文字、`_`、`"`、
    `'` のいずれかが続く `1`。
    または、改行を含む 1 つ以上の空白文字と ASCII の数字が続く `1`。
    または、直後に `--`、`..`、`.-`、`-.` のいずれかが続く `1`:
    `only-one`。 [fixture: er/lex-one-digit-cardinalities] [fixture:
    er/spec-er-diagram-155d18bb] [fixture: er/spec-er-diagram-92625f77]
    [fixture: er/spec-er-diagram-4fd0ae58] [fixture:
    er/lex-one-before-string] [fixture: er/lex-one-before-underscore]
    [fixture: er/lex-one-before-number-name] [fixture: er/lex-one-tab]
12. 語の文字が続かない `1`: `number`。 [fixture: er/lex-name-one]
13. 1 つ以上の ASCII の数字: `number`。 [fixture: er/lex-name-number]
14. `||`: `only-one`。
    `o|`: `zero-or-one`。
    `o{`: `zero-or-more`。
    `|{`: `one-or-more`。 [fixture: er/gram-relationship-symbols]
    [fixture: er/lex-line-dash-dot]
    [fixture: er/lex-only-one-symbols]
15. 後ろに `.`、`-`、`|` のいずれかが続く `u`:
    `md-parent`。 [fixture: er/lex-md-parent]
16. `..`: `non-identifying`。
    `--`: `identifying`。
    キーワード `to`:
    `identifying`。
    キーワード `optionally to`: `non-identifying`。
    `.-`: `non-identifying`。
    `-.`: `non-identifying`。 [fixture: er/spec-er-diagram-7b5988ee] [fixture:
    er/gram-relationship-symbols] [fixture: er/lex-cardinality-words] [fixture:
    er/lex-cardinality-only-one-optionally-to] [fixture: er/lex-line-dot-dash]
    [fixture: er/lex-line-dash-dot] [fixture: er/lex-optionally-to-upper-case]

関係の 3 つの単位の間と周りに空白は要らず、あってもかまいません。
`A||--o{B:has` と `A || -- o{ B : has` は同じ関係で、 `A ||to|| B : x`、
`A one--one B : x`、`A 1+--0+ B : x`、 `A many(0)--many(1) B : x`、
`A one or more--one B : x` も同じです。
`A one or zero--|| B : x` や `A ||--only one B : x` のように、
語のつづりと記号のつづりは混ぜられます。 [fixture: er/lex-relationship-no-spaces]
[fixture:
er/lex-relationship-spaces-in-spec] [fixture: er/lex-to-glued] [fixture:
er/lex-one-glued-dashes] [fixture: er/lex-plus-glued] [fixture:
er/lex-many-paren-glued] [fixture: er/lex-one-or-more-glued] [fixture:
er/lex-cardinality-word-then-symbol] [fixture:
er/lex-cardinality-symbol-then-word]
規則から導かれることをいくつか挙げます。

- `|o` と `}o` は語の境界で終わり、それ以外の記号はそうではありません。
  `A|o--|| B` と `A }o--o{B : x` は関係で、`A }|--|{B : x` もそうですが、
  `A o|--|oB : x`、`A |o--|o1 : x`、`A o{--}oB : x` は拒否されます。
  名前の前の `|o` や `}o` が濃度ではないからです。
  `1+`、`0+`、`many(0)`、`many(1)` の後には名前が続けられます。
  `A 1+--0+x : x` と `A many(0)--many(1)x : x` は実体 `x` を持ちます。
  キーワード `to` はそうではなく、
  `A ||tox|| B : x` は拒否されます。 [fixture: er/lex-pipe-o-glued-left]
  [fixture: er/lex-o-brace-glued-letter]
  [fixture: er/lex-brace-pipe-glued] [fixture: er/lex-pipe-o-glued-letter]
  [fixture: er/lex-pipe-o-glued-digit] [fixture: er/lex-brace-o-glued-letter]
  [fixture: er/lex-plus-glued-letter] [fixture:
  er/lex-many-paren-glued-letter] [fixture: er/lex-to-glued-letter]
- `u` は `.`、`-`、`|` の直前でだけ `md-parent` で、左でも右でもそうです。
  その後の文字は名前を始めます。
  `A u--o{ B : x`、`A u..o{ B : x`、
  `A U--o{ B : x` は左の濃度が `md-parent` で、
  `A ||--u-B : x` と `A ||--u.B : x` は右の濃度がそれで、
  実体は `-B` と `.B` です。
  `A u--u-B : x` は両端がそれです。
  `A u --o{ B : x` は名前 `u` を持って拒否され、`u` だけは実体 `u` で、
  `Au--o{ B : x` は名前 `Au` を持って拒否され、
  `u--o{ B : x` は濃度の前に実体がなく拒否され、 `A u|--o{ B : x`、
  `A ||--u B : x`、`A ||--u| B : x` は拒否されます。 [fixture: er/lex-md-parent]
  [fixture: er/lex-md-parent-dots] [fixture:
  er/lex-md-parent-upper-case] [fixture: er/lex-md-parent-right-glued-name]
  [fixture: er/lex-md-parent-right-glued-dot] [fixture:
  er/lex-md-parent-both-glued] [fixture: er/lex-u-then-space] [fixture:
  er/lex-u-as-name] [fixture: er/lex-u-glued-name] [fixture:
  er/gram-md-parent-without-left] [fixture: er/lex-md-parent-pipe] [fixture:
  er/lex-md-parent-right] [fixture: er/lex-md-parent-right-pipe]
- 名前は `o` で始められますが、`o{` は濃度です。
  属性が続く `o{` は拒否され、
  `o {` は実体 `o` とその属性です。 [fixture: er/lex-name-o-then-block]
  [fixture: er/lex-name-o-space-block]
- 規則 11 は、文が始まるところでも `1` を `only-one` として読みます。
  `1 A` と `1 12` は拒否され、濃度の前に実体のない `1--1 B : x` も拒否され、
  `1 é` は 2 つの実体 `1` と `é` です。
  `é` が ASCII の文字ではないからです。
  関係の線の後では、空白と ASCII の文字、`_`、`"`、`'`、
  数字のいずれかが続く `1` が `only-one` です。
  `A 1--1 B : has`、`A 1--1 "B" : has`、`A 1--1 _B : x`、`A 1--1 12 : has`、
  `A 1--1`、タブ、`B : has` は関係です。
  `A 1--1 é : x`、`A 1--1 -B : x`、`A 1--1 *B : x`、`A 1--1B : has`、
  `A ||--1"B" : x`、`A 1--12 B : x` は拒否されます。
  関係の線の後の `1` がそこでは `number` だから、または `12` がそうだからです。
  `A 1--1 'B' : x` のその `1` は `only-one` です。
  `'` は規則 11 の文字のひとつだからで、
  その後の `'` が `invalid` の単位です。 [fixture: er/lex-one-space-letter]
  [fixture: er/lex-one-space-digit]
  [fixture: er/lex-one-arrow-no-left] [fixture: er/lex-one-space-e-acute]
  [fixture: er/lex-one-digit-cardinalities] [fixture:
  er/lex-one-before-string] [fixture: er/lex-one-before-underscore] [fixture:
  er/lex-one-before-number-name] [fixture: er/lex-one-tab] [fixture:
  er/lex-one-before-e-acute] [fixture: er/lex-one-before-dash] [fixture:
  er/lex-one-before-star] [fixture: er/lex-one-before-single-quote] [fixture:
  er/lex-one-glued-letter] [fixture: er/lex-one-before-string-glued] [fixture:
  er/lex-one-then-two-digits]
- 数は名前が始まるところで終わります。
  `1a` は 2 つの実体 `1` と `a`、`12a` は実体 `12` と `a`、
  `2.5x` は実体 `2.5` と `x`、`12.` は実体 `12` と `.` です。
  `12`、`2.5`、`1` は実体です。 [fixture: er/lex-name-number-then-letter]
  [fixture:
  er/lex-name-number2-then-letter] [fixture:
  er/lex-name-decimal-then-letter] [fixture: er/lex-name-number-then-dot]
  [fixture: er/lex-name-number] [fixture: er/lex-name-decimal] [fixture:
  er/lex-name-one]
- 関係の線はちょうど 2 文字かキーワードです。
  `A ||----o{ B : x`、`A ||---o{ B : x`、`A ||.-.o{ B : x` は拒否され、
  濃度を欠く `A ||-- B : x` と `A --o{ B : x`、`A many(2) to one B : x`、
  `A one or zeros B : x` も拒否されます。 [fixture: er/lex-line-four-dashes]
  [fixture: er/lex-line-three-dashes]
  [fixture: er/lex-line-dot-dash-dot] [fixture:
  er/gram-relationship-missing-right-cardinality] [fixture:
  er/gram-relationship-missing-left-cardinality] [fixture:
  er/lex-many-paren-two] [fixture: er/lex-keyword-one-or-zero-suffix]

**方向の行。**
大文字小文字を区別せずに照合します。
現在の位置から、改行・U+2028・U+2029 を含まない文字の並びで、
残りが続けられる最長のもの。
次に `direction`。
次に改行を含む 1 つ以上の空白文字。
次に `TB`、`BT`、`RL`、`LR` のいずれかを、この順に試したもの。
そして次の改行までのすべての文字です。
規則は `direction` を `direction` の単位、値を `direction-value` の単位、
`direction` の前と値の後の文字を `direction-text` の単位として読みます。
最後のものは mermaid.js が読まないテキストです。
規則は空白と名前の規則より前に試されるので、行全体を取ります。
`A direction LR` は方向を設定して実体を持たず、
`A ||--o{ B : x direction LR` と `A ||--o{ B : direction TB` も同じです。
`Direction lr` と `DIRECTION tb` は方向の行で、
`direction` の前のインデントは並びの一部です。
その後に続くキーワードの規則より前にも試されます。
`classDef a direction LR` は方向を設定してクラスを定義せず、
`A accTitle: direction LR` は方向を設定し、
`subgraph direction LR` は方向の行なので、
その後の `end` は何も閉じず拒否されます。
これより前にあるのは規則 1 から 3 だけなので、
`accTitle: direction LR` はタイトルです。
値は語の境界で終わる必要もありません。
`direction LRX` は `LR` を設定し、`X` は `direction-text` の単位です。
`direction LR %% c` はテキスト `%% c` を伴って `LR` を設定し、
`direction LR;` はテキスト `;` を伴って設定します。
値は挙げた順に試されます。
行のどこかに `direction`、空白、`TB` があれば値は `TB` で、
なければ `BT` を試し、以下同様です。
値について、字句解析器は値の前にある並びの最後の `direction` を取ります。
そのため `direction TB x direction TB` は最後の `direction` で読まれ、
`direction TB x` は `direction-text` の単位です。
`direction TB x direction LR` と `direction TBx direction RL` は `TB` を設定し、
最初の `direction` で読まれ、
残りは `direction-text` の単位です。 [fixture: er/lex-direction-line-text-before]
[fixture:
er/lex-direction-line-after-relationship] [fixture:
er/lex-direction-line-as-role] [fixture: er/lex-direction-lower-case] [fixture:
er/lex-direction-upper-case] [fixture: er/lex-direction-leading-space] [fixture:
er/lex-direction-line-leading-tab] [fixture:
er/lex-direction-line-before-classdef] [fixture:
er/lex-direction-line-with-acc-title] [fixture:
er/lex-direction-line-subgraph] [fixture: er/lex-acc-title-direction] [fixture:
er/lex-direction-value-glued] [fixture: er/lex-direction-line-percent]
[fixture: er/lex-direction-line-semicolon] [fixture:
er/lex-direction-line-text-after] [fixture:
er/lex-direction-line-same-value-twice] [fixture:
er/lex-direction-line-two-values] [fixture:
er/lex-direction-value-glued-then-other]
`direction` と値の間の空白には、改行、タブ、U+00A0、U+2028 を置けます。
`direction`、改行、`LR` は方向の行で、`direction`、U+2028、`LR` も同じです。
一方、`direction` の前の並びには U+2028 を置けません。
`A`、U+2028、`direction LR` は名前 `A`、U+2028、`direction` と `LR` です。
値の後のテキストには U+2028 や U+2029 を置けます。
値のない、
行にそれだけの `direction` は名前 `direction` です。 [fixture: er/lex-direction-value-next-line]
[fixture:
er/lex-direction-value-tab] [fixture: er/lex-direction-value-nbsp] [fixture:
er/lex-direction-value-line-separator] [fixture:
er/lex-line-separator-before-direction] [fixture:
er/lex-line-separator-after-direction-value] [fixture:
er/lex-paragraph-separator-after-direction-value] [fixture:
er/lex-direction-without-value] [fixture: er/lex-direction-at-end]

### 属性ブロックの文脈

属性ブロックの文脈には、文の文脈の `{` で入ります。
実体の属性を読みます。

1. 改行を含む 1 つ以上の空白文字: 何もなし。
   ここでは改行は単位を作らないので、属性に行の構造は要りません。
   1 行の `string a` と `string b` は 2 つの属性で、
   2 行の `string` と `a` は 1 つです。 [fixture: er/gram-attributes-one-line]
   [fixture:
   er/gram-attribute-split-lines] [fixture: er/lex-block-nbsp] [fixture:
   er/lex-block-tab] [fixture: er/lex-block-form-feed] [fixture:
   er/lex-block-vertical-tab] [fixture: er/lex-block-crlf] [fixture:
   er/gram-block-blank-lines]
2. 大文字小文字を区別せずに照合した `PK`、`FK`、`UK` で、
   後ろに語の文字がないもの: `key` の単位。
   `pk` はキーで、`PKx` は語です。 [fixture: er/gram-keys-comma-space]
   [fixture: er/lex-key-lower-case]
   [fixture: er/lex-key-prefix-word] [fixture: er/lex-key-line-separator-after]
3. **チルダの語**。
   現在の位置から、`~` を含む空白以外の文字 1 つ以上の並びで、
   同じ行の区分（改行、U+2028、U+2029 を含まない文字の並び）に、
   2 つ目の `~` が続くもの。
   単位は、その位置からその行の区分の最後の `~` まで、
   およびその直後の空白以外の文字までです: `tilde-word` の単位。
   空白を含んでかまいません。
   `List~int~ a` の型は `List~int~`、`~int~ a` の型は `~int~`、
   `List~a b~ c` の型は `List~a b~`、`List~~ a` の型は `List~~`、
   `List~int~ Map~k~ x` は 1 つの型 `List~int~ Map~k~` と名前 `x`、
   `int~x~a b` の型は `int~x~a` です。
   `a~b c` は `~` を 1 つしか持たず拒否され、
   `List~int~ Map~k~` だけは型を持って名前を持たず拒否され、 `List~a`、U+2028、
   `b~ c` は、区分が U+2028 で終わるので拒否されます。
   この規則はコメントとバッククォートの語の規則より前に来るので、
   `string a "x~y" List~int~ b` は 2 つ目の型 `"x~y" List~int~` を持ち、
   `string a "a~b~c" d` は 2 つ目の型 `"a~b~c"` を持ち、
   `string a "a~b~c"` だけは拒否され、
   `` `a~b~` c `` はバッククォートごとの型 `` `a~b~` `` を持ちます。
   一方、`string a "a~b"` はコメント `a~b` を持ち、
   ``a~`b`~ c`` の `~` の後の `` `b` `` はチルダの語の一部です。
   行の区分は `}` を越えます。
   `A { List~int~ a } B { Map~k~ v }` は、
   型 `List~int~ a } B { Map~k~` と名前 `v` を持つ 1 つの実体 A で、
   `A { int x~y } B { z~w }` は `x~y } B { z~w` という名前の属性を持つ実体 A です。
   `A {` と行 `List~int~}` は、チルダの語が `}` を取るので拒否されます。
   `List~int~ a` の行の次の行に `}` があれば、
   `}` は語の外です。 [fixture: er/lex-tilde-across-close-brace] [fixture:
   er/lex-tilde-across-close-brace-name] [fixture:
   er/lex-tilde-before-close-brace-glued] [fixture:
   er/lex-tilde-then-close-brace-next-line]
   [fixture: er/lex-tilde-word] [fixture: er/lex-tilde-word-start] [fixture:
   er/lex-tilde-space-inside] [fixture: er/lex-tilde-double] [fixture:
   er/lex-tilde-run-two-words] [fixture: er/lex-tilde-word-glued-name]
   [fixture: er/lex-tilde-single] [fixture:
   er/lex-tilde-run-two-words-no-name] [fixture: er/lex-tilde-line-separator]
   [fixture: er/lex-tilde-after-quoted] [fixture:
   er/lex-tilde-in-comment-two-then-word] [fixture:
   er/lex-tilde-in-comment-two] [fixture: er/lex-backquote-containing-tilde]
   [fixture: er/lex-tilde-in-comment-one] [fixture:
   er/lex-tilde-with-backquote-inside]
4. **語**。
   最初の文字が `*`、ASCII の文字、`_`、
   または U+00C0 以降の文字（基本多言語面の外の文字を含む）で、その後に、
   ASCII の文字、ASCII の数字、`-`、`_`、`[`、`]`、`(`、`)`、`.`、 `,`、 `*`、
   U+00C0 以降の文字のいずれかである文字が 0 個以上続くもの:
   `word` の単位。
   `string[]`、`decimal(10,2)`、`a.b`、`*a`、`_a`、`a-b`、`a,b`、`a1`、`é`、
   絵文字は語で、`end` も語です。
   `0a`、`[a`、`)a`、`]a`、`-a`、`©`、`a#b` は語ではありません。
   最初の 5 つは続きにしか置けない文字で始まり、
   `©` は U+00C0 より下の U+00A9で、 `#` は語の文字ではないからです。
   U+00C0 以降の空白文字、U+2028、U+3000、U+FEFF などは、
   最初の文字の後では語の文字です。
   `string`、U+2028、`a` は 1 つの語で、`str`、U+FEFF、`ing` も同じですが、
   `str`、U+00A0、`ing` は 2 つの語です。 [fixture: er/lex-word-brackets]
   [fixture: er/lex-word-parentheses] [fixture:
   er/lex-word-dot] [fixture: er/lex-word-star]
   [fixture: er/lex-word-underscore]
   [fixture: er/lex-word-dash] [fixture: er/lex-word-comma] [fixture:
   er/lex-word-digits-inside] [fixture: er/lex-word-e-acute] [fixture:
   er/lex-word-emoji] [fixture: er/lex-word-surrogate-start] [fixture:
   er/lex-block-keyword-end] [fixture: er/spec-er-diagram-f42b9d44] [fixture:
   er/spec-er-diagram-6963c994] [fixture: er/spec-er-diagram-a1584d91] [fixture:
   er/spec-er-diagram-ef201912] [fixture: er/spec-er-diagram-a7625799] [fixture:
   er/lex-word-copyright] [fixture: er/lex-word-hash] [fixture:
   er/lex-block-line-separator] [fixture: er/lex-word-bom-inside] [fixture:
   er/lex-word-nbsp-inside]
5. `` ` ``、改行を含む `` ` `` 以外の文字 1 つ以上、`` ` ``:
   `backquoted-word` の単位。
   バッククォートを含みます。
   そのため `` `a b` c `` の型は `a b` で、 `` `a``、改行、
   ``b` c`` の型は改行を含みます。
   `` `a"b` `` は `"` を含みます。
   間に何もない 2 つのバッククォートは `empty-backquotes` の単位で、
   mermaid.js はそれにトークンを読みません（[属性](#属性) を参照）。
   閉じるバッククォートの後の語は新しい単位を始めます。
   `` `a`b c `` は 3 つの語で拒否され、
   `` `a`? b `` は `?` 付きの型 `a` を持ちます。 [fixture: er/lex-backquote-word]
   [fixture: er/lex-backquote-line-feed]
   [fixture: er/lex-backquote-quote-inside] [fixture: er/lex-backquote-both]
   [fixture: er/lex-backquote-glued] [fixture: er/lex-backquote-optional]
   [fixture: er/lex-backquote-unclosed]
6. `"`、改行を含む `"` 以外の文字 0 個以上、`"`: `comment-string` の単位。
   空でもかまいません。
   `"c%%d"` はそれで、文字列の前に空白は要りません。
   `string a"c"` は受理されます。 [fixture: er/gram-comment]
   [fixture: er/gram-comment-empty] [fixture:
   er/lex-comment-line-feed] [fixture: er/lex-comment-percent] [fixture:
   er/lex-comment-glued] [fixture: er/lex-comment-unclosed]
7. `}`: `}` の単位。
   属性ブロックの文脈を出ます。 [fixture: er/gram-attribute]
8. `?`: `?` の単位。
   `,`: `,` の単位。
   改行・U+2028・U+2029 以外のそれ以外の文字: `invalid` の単位。
   どの規則も取らないので、`%`、`#`、`{`、チルダの語の外の `~` は拒否されます。
   `?` の前に空白は要りません。
   `string ? a` と `string? a` は同じです。 [fixture: er/gram-optional-type]
   [fixture: er/lex-optional-type-space]
   [fixture: er/lex-block-percent] [fixture: er/lex-word-hash] [fixture:
   er/lex-block-brace] [fixture: er/lex-tilde-single]

文の文脈の規則はここでは試されません。
`{` の後の `end`、`direction LR`、`accDescr { x }` は語なので、 `end a` は属性、
`direction LR` は型 `direction` の属性で、
`accDescr { x }` はその `{` で拒否されます。 [fixture: er/lex-block-keyword-end]
[fixture: er/lex-direction-in-block]
[fixture: er/lex-block-acc-descr]
テキストはこの文脈でも、バッククォートの語の中でも終われません。
属性があってもなくても `A {` は拒否され、
閉じるバッククォートのない `` `a `` も拒否されます。 [fixture: er/lex-block-unclosed]
[fixture: er/lex-block-unclosed-empty]
[fixture: er/lex-backquote-unclosed]

### style の文脈

style の文脈には `style` と `classDef` で入ります。
文の名前とスタイルを読みます。

1. 1 つ以上の改行: `newline` の単位。
   style の文脈を出ます。 [fixture: er/gram-classdef]
2. 改行を含む 1 つ以上の空白文字: 何もなし。
   この規則は規則 1 の後に来るので、
   空白文字かタブで始まる空白の並びはその中の改行を取り、文は次の行に続きます。
   `classDef a fill:red`、空白文字、改行、
   `A` はスタイル `fill:redA` を定義して実体を持ちません。
   タブでも、
   間に空行があっても同じです。 [fixture: er/lex-classdef-space-before-line-feed]
   [fixture:
   er/lex-style-space-before-line-feed] [fixture:
   er/lex-style-tab-before-line-feed] [fixture:
   er/lex-classdef-space-before-line-feed-then-blank]
3. `:`: `:` の単位。 [fixture: er/gram-classdef]
4. `,`: `,` の単位。 [fixture: er/gram-classdef]
5. `#`: `#` の単位。 [fixture: er/gram-classdef]
6. ASCII の外の文字、語の文字、`-`、`*` のいずれかである文字 1 つ以上:
   `style-text` の単位。
   `.`、`%`、`(`、`)`、`"` はその文字ではなく、どの規則も取りません。
   `classDef a font-size:1.5em`、`classDef a width:50%`、
   `classDef a fill:rgb(1,2,3)`、`style A.B fill:red`、
   `classDef a.b fill:red` は拒否されます。
   U+00A0 はその文字です。
   `style A fill:red`、U+00A0、改行、`B` はスタイル `fill:red` と U+00A0、
   実体 B を持ちます。 [fixture: er/lex-classdef-dot]
   [fixture: er/lex-classdef-percent] [fixture:
   er/lex-classdef-parentheses] [fixture: er/lex-style-dot-name] [fixture:
   er/lex-classdef-dot-name] [fixture: er/lex-style-nbsp-before-line-feed]
   [fixture: er/lex-classdef-dash-name] [fixture: er/lex-classdef-unicode-name]
   [fixture: er/lex-classdef-star-style]
7. `;`: `;` の単位。 [fixture: er/lex-classdef-semicolon-line-feed]

`;` の単位は文を終えますが、字句解析器は改行まで style の文脈にとどまります。
`classDef a fill:red;`、改行、`A` はクラスと実体で、
`classDef a fill:red; A` は拒否されます。
文が終わった後の `A` が `style-text` の単位だからです。
行の規則は、
そのような行の `#` の後の `;` を字句解析器が読む前に取り除きます（[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行) を参照）。
`classDef a fill:#f00;` と行 `A` はスタイル `fill:#f00` を持ち、
`classDef a fill:#f00; B` は mermaid.js と同じくスタイル `fill:#f00B` を持って実体を持ちません。
`;;` では `;` が 1 つ残り、
`#f00;` はエンティティとして読まれます（[エンティティ](../common.ja.md#エンティティ) を参照）。
style の文脈には `accDescr {` の規則がなく、
それは `style-text` の単位と `{` です。
`classDef a accDescr {} fill:red` と、
`style A accDescr {} fill:red` は拒否されます。 [fixture: er/lex-classdef-semicolon-line-feed]
[fixture: er/lex-classdef-semicolon-then-name]
[fixture: er/lex-style-semicolon-line-feed]
[fixture: er/lex-style-semicolon-at-end]
[fixture: er/lex-classdef-ignored-semicolon]
[fixture: er/lex-classdef-ignored-semicolon-then-text]
[fixture: er/lex-style-ignored-semicolon]
[fixture: er/lex-style-ignored-semicolon-then-text]
[fixture: er/lex-classdef-double-semicolon-entity]
[fixture: er/lex-classdef-empty-description-block]
[fixture: er/lex-style-empty-description-block]
キーワード `style` と `classDef` の後に空白が要るのは、
名前が続かなければならないからにすぎません。
`classDef` と `class` はキーワードとして照合するので、
`classDefa` はどちらも持ちません。 [fixture: er/lex-classdef-no-whitespace]

### アクセシビリティの値

タイトルの文脈では、改行以外の文字 0 個以上が `title-text` の単位で、
文脈を出ます。
説明の文脈は同じように `description-text` の単位を読みます。
`:` の後の空白は、
改行を含めて `:` の単位と一緒に読まれるので（文の文脈の規則 1 と 2）、
テキストは空白でない最初の文字から始まり、それは後の行にあってもよく、
テキストが続くところでは単位が空になることはありません。
`accTitle:`、改行、`T` はタイトル `T` を持ち、 `accTitle:`、空行、
`A` はタイトル `A` を持って実体を持ちません。
テキストの終わりでは入力は拒否されます。
`accTitle:` は、後ろに空白文字や改行があっても拒否され、
`accDescr:` も拒否されますが、テキストの終わりの `accTitle: T` は受理されます。
`;`、`#`、`%%`、`{`、`}`、`accDescr {}` はテキストの文字です。
`accTitle: a;b #c %% d` はタイトル `a;b #c %% d` を持ち、
`accTitle: T accDescr {}` はタイトル `T accDescr {}` を持ちます。
テキストの終わりの空白は U+00A0 を含めて単位に読まれ、
値からは除かれます（[ErLiteral](../ast/er.ja.md#erliteral) を参照）。 [fixture: er/gram-acc-title]
[fixture: er/lex-acc-title-line-feed-after-colon]
[fixture: er/lex-acc-title-blank-line-then-name] [fixture:
er/lex-acc-title-spaces-then-name] [fixture: er/lex-acc-title-at-end]
[fixture: er/lex-acc-title-space-at-end] [fixture:
er/lex-acc-title-line-feed-at-end] [fixture: er/lex-acc-descr-at-end]
[fixture: er/gram-acc-title-at-end-with-text] [fixture:
er/gram-acc-descr-at-end-with-text] [fixture:
er/lex-acc-title-semicolon-hash-percent] [fixture:
er/lex-acc-title-then-semicolon] [fixture: er/lex-acc-title-braces] [fixture:
er/lex-acc-title-empty-description-block] [fixture:
er/db-acc-title-trailing-space] [fixture: er/lex-acc-title-trailing-nbsp]
[fixture: er/lex-acc-title-crlf] [fixture: er/lex-acc-title-line-separator]
[fixture: er/lex-acc-title-tabs]

説明ブロックの文脈では、`}` が `}` の単位で文脈を出て、
改行を含む `}` 以外の文字 1 つ以上が `description-block-text` の単位です。
`{` の後の空白は改行を含めて `{` の単位と一緒に読まれるので（文の文脈の規則 3）、
テキストは空白でない最初の文字から始まり、`accDescr {}`、`accDescr { }`、
`accDescr {`、空白文字だけの行、`}`、
および括弧の間にディレクティブだけかコメント行だけがあるブロックは、
テキストを持たず、mermaid.js ではトークンを作りません。
**空の説明ブロック**です（[空の説明ブロック](#空の説明ブロック) を参照）。
テキストは最初の `}` まで、終わりの空白を含めて続きます。
`accDescr { a {b }` は説明 `a {b`、`accDescr { D   }` は説明 `D`、
`accDescr { direction LR }` は説明 `direction LR` を持ちます。
テキストはこの文脈では終われません。
`accDescr {`、`accDescr { D`、
`accDescr { D` と行 `A` は拒否されます。 [fixture: er/gram-acc-descr-block]
[fixture:
er/gram-acc-descr-block-multiline] [fixture: er/gram-acc-descr-block-empty]
[fixture: er/gram-acc-descr-block-empty-space] [fixture:
er/db-acc-descr-block-whitespace-only] [fixture:
er/gram-acc-descr-block-directive-only] [fixture:
er/gram-acc-descr-block-comment-line-only] [fixture:
er/lex-acc-descr-block-brace-in-text] [fixture:
er/lex-acc-descr-block-trailing-spaces] [fixture:
er/lex-acc-descr-block-leading-line-feeds] [fixture:
er/lex-acc-descr-block-direction] [fixture:
er/lex-acc-descr-block-unclosed-empty] [fixture:
er/lex-acc-descr-block-unclosed]
[fixture: er/lex-acc-descr-block-unclosed-lines]

これらの文脈に入る規則は文の文脈の規則だけです。
属性ブロックと style の文脈では、`accTitle` と `accDescr` は語です。
[属性ブロックの文脈](#属性ブロックの文脈) と、
[style の文脈](#style-の文脈) を参照してください。 [fixture: er/lex-block-acc-descr]
[fixture: er/lex-classdef-empty-description-block]

### コメント

この図にはコメントの規則がありません。
`#` と `%%` は単位の後ではコメントではなく、この図のコメントは、
字句解析器の前に読まれる、
コメント行と `%%` だけの行だけです（[名前](#単位と文脈) と、
[検出](#検出) を参照）。
その印は `%%` で、値は印の後のテキストです。 [fixture: er/comment-line]
[fixture: er/lex-percent-after-statement] [fixture:
er/header-after-bare-percent-line]

## 文法

文法は、文字ではなく単位の上で、
[common.ja.md](../common.ja.md#表記) の記法を使います。
`name` のような単位の名前はその名前の単位 1 つを表し、
二重引用符で囲んだテキストは、`"subgraph"` や `"{"` のように、
そのテキストを名前とする単位を表します。
この文法は [`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L102-L334) の文法の言い換えで、
同じ単位の列を受理します。

以下の各規則は、[ast/er.ja.md](../ast/er.ja.md) で定める木のノードを作ります。

| 規則                                                                     | ノード                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `diagram`                                                                | ErDiagram                                                                     |
| `entity-statement`                                                       | ErEntityStatement。その `attribute-block` が `attributes` の一覧              |
| `attribute`                                                              | ErAttribute                                                                   |
| `relationship-statement`                                                 | ErRelationshipStatement。各 `entity-reference` が ErEntityReference           |
| `relationship`                                                           | ErRelationship                                                                |
| `subgraph-statement`                                                     | ErSubgraphStatement                                                           |
| `direction-statement`                                                    | ErDirectionStatement。各 `direction-text` に ErIgnoredText                    |
| `class-def-statement`                                                    | ErClassDefStatement                                                           |
| `class-statement`                                                        | ErClassStatement                                                              |
| `style-statement`                                                        | ErStyleStatement                                                              |
| `accessibility-statement`                                                | ErAccTitleStatement、ErAccDescrStatement、ErAccDescrBlockStatement のいずれか |
| `empty-description-block`                                                | テキストのない ErAccDescrBlockStatement。それ自体が 1 つの文                  |
| `quoted-name`、`string`、`comment-string`、`backquoted-word`             | StringLiteral                                                                 |
| `key`                                                                    | Identifier                                                                    |
| `name`、`number`、名前である `style-text`、`word`、`tilde-word`          | ErIdentifier                                                                  |
| `style-item`、`title-text`、`description-text`、`description-block-text` | ErLiteral                                                                     |
| `direction-text`                                                         | ErIgnoredText                                                                 |
| 2 つの属性の間の `empty-backquotes`                                      | ErIgnoredText。`attributes` の一覧の項目                                      |

### 図と文

```text
diagram   = "header" line*
line      = statement | newline
statement = entity-statement
          | relationship-statement
          | subgraph-statement
          | direction-statement
          | class-def-statement
          | class-statement
          | style-statement
          | accessibility-statement
          | empty-description-block
```

2 つの文を区切るものはありません。
文は同じ行で別の文に続けられ、
間の `newline` の単位はそれ自体が 1 つの `line` です。
`A ||--o{ B : x C ||--o{ D : y` は 2 つの関係を持ち、`A B` は 2 つの実体の文で、
`A ||--o{ B : has it` はロール `has` と実体 `it` を持ちます。
同じように、引用符付きのロール、`}`、`class` の文、`accTitle` の行の始まりの後、
および区切りの後の `classDef` と `style` の文の後に、
同じ行で文が続きます。 [fixture: er/gram-two-relationships-one-line] [fixture:
er/lex-two-names-one-line] [fixture: er/lex-role-then-name] [fixture:
er/gram-role-string-then-name] [fixture: er/lex-role-string-glued-name]
[fixture: er/gram-block-then-name-one-line] [fixture:
er/gram-block-one-line-then-name] [fixture: er/gram-class-then-name] [fixture:
er/gram-class-then-relationship-one-line] [fixture:
er/gram-acc-title-after-name] [fixture: er/gram-classdef-after-name-one-line]
[fixture: er/gram-style-after-name-one-line] [fixture:
er/gram-relationship-then-name-one-line]
mermaid.js の文法には `title` の文の規則がありますが、
字句解析器はその単位を作りません（[`erDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L188)）。
そのため `title T` は 2 つの実体 `title` と `T` です。 [fixture: er/gram-title-words-as-names]

### 実体

```text
entity-statement = entity-name alias? class-list? attribute-block?
entity-name      = name | number | quoted-name
alias            = "[" entity-name "]"
class-list       = ":::" name ( "," name )*
attribute-block  = "{" block-item* "}"
```

実体の文は、別名、クラス、属性のブロックを持つか持たない実体の名前です。
`A`、`A[P]`、`A:::c`、`A { … }`、`A[P]:::c { … }`、および `"A B"`、`12`、`2.5`、
`1` は実体の文です。 [fixture: er/lex-name-unicode-characters]
[fixture: er/gram-alias] [fixture:
er/gram-entity-classes] [fixture: er/gram-attribute] [fixture:
er/gram-alias-class-block] [fixture: er/lex-quoted-name] [fixture:
er/lex-name-number] [fixture: er/lex-name-decimal] [fixture: er/lex-name-one]
[fixture: er/db-name-twice]

- 別名は `[` と `]` の間の実体の名前で、
  周りに空白があってもなくてもかまいません。
  `p[Person]`、`p [ Person ]`、`p["Per son"]`、`p[12]`、`p[1]`、`"A"[P]`、
  `12[P]`、`1[P]` は別名付きの実体です。
  `p[]` と `p[A B]` は拒否されます。
  別名はクラスより前に来て、別名付きの実体はその行で関係を取りません。
  `A:::c[P]`、`p[P] ||--o{ B : x`、`p[P]:::c ||--o{ B : x`、
  `A ||--o{ p[P] : x`、`A:::c ||--o{ p[P] : x` は拒否され、 `p[P]:::c`、
  `p[P] { … }`、`p[P]:::c { … }`、
  `p[P]:::c {}` は受理されます。 [fixture: er/gram-alias]
  [fixture: er/gram-alias-spaces] [fixture:
  er/gram-alias-string] [fixture: er/gram-alias-number] [fixture:
  er/gram-alias-one] [fixture: er/gram-alias-string-name] [fixture:
  er/gram-alias-number-name] [fixture: er/gram-alias-one-name] [fixture:
  er/gram-alias-empty] [fixture: er/gram-alias-two-words] [fixture:
  er/gram-class-list-then-alias] [fixture: er/gram-alias-then-relationship]
  [fixture: er/gram-alias-class-then-relationship] [fixture:
  er/gram-relationship-right-alias] [fixture:
  er/gram-relationship-left-class-right-alias] [fixture:
  er/gram-alias-then-class] [fixture: er/gram-alias-then-block] [fixture:
  er/gram-alias-class-block] [fixture: er/gram-alias-class-empty-block]
- `:::` の後のクラスは `,` で区切った名前で、
  `:::` と `,` の周りに空白があってもなくてもかまいません。
  `A:::c1,c2`、`A ::: c, d`、`A:::é,b-c` は受理され、 `A:::`、`A:::c,`、
  `A:::12`、`A:::"c"`、
  `A:::c:::d` は拒否されます。 [fixture: er/gram-entity-classes] [fixture:
  er/lex-class-separator-spaces-then-names] [fixture:
  er/lex-class-list-unicode] [fixture: er/gram-class-separator-without-class]
  [fixture: er/gram-class-list-trailing-comma] [fixture:
  er/lex-class-list-number] [fixture: er/lex-class-list-string] [fixture:
  er/gram-two-class-separators]
- 属性ブロックは名前の行で、名前の直後か空白の後に始まり、空でも、
  属性を 1 行に持っても複数行に持ってもかまいません。
  `A {}`、`A { }`、`A {`、改行、`}`、空行付きの `A {` と `}`、`A{`、
  `A {string a}`、`A { string a } B` は受理され、
  最後のものは後ろに実体 Bを持ちます。
  `A`、改行、`{` は拒否され、`A:::c`、改行、`{` も拒否され、
  ブロックが関係の前に来る `A {} ||--o{ B : x` も拒否されます。 [fixture: er/gram-block-empty]
  [fixture: er/gram-block-empty-space]
  [fixture: er/gram-block-empty-line-feed] [fixture:
  er/gram-block-blank-lines] [fixture: er/lex-block-no-space] [fixture:
  er/gram-block-one-line] [fixture: er/gram-block-one-line-then-name] [fixture:
  er/gram-block-next-line] [fixture: er/gram-classes-then-block-next-line]
  [fixture: er/gram-block-then-relationship]
  同じ名前は 2 つ目のブロックを持てます。 [fixture: er/db-block-twice]

### 属性

```text
block-item     = attribute | empty-backquotes
attribute      = attribute-word "?"? attribute-word key-list? comment-string?
attribute-word = word | tilde-word | backquoted-word
key-list       = key ( "," key )*
```

属性は、型、名前、そしてキーとコメントをこの順に持ち、
4 つの部分はそれぞれ属性ブロックの文脈の単位です。
`string name`、`string? middleName`、`int id PK, FK`、`string a "c d"`、
および `int a PK "x"` と `string b` は属性です。 [fixture: er/gram-attribute]
[fixture: er/gram-optional-type] [fixture:
er/gram-keys-comma-space] [fixture: er/gram-comment] [fixture:
er/gram-attributes-keys-comment]

- 型と名前はそれぞれ 1 つの `word`、`tilde-word`、`backquoted-word` の単位で、
  型の後には `?` を置けます。
  `string? a`、`string ? a`、`` `a`? b ``、`List~int~? a`、`int? a~b~`、
  `` `a` b~c~ ``、`a~b~ c "d"` は属性です。
  名前のない型、3 つの語、`??`、名前の後の `?`、`?` だけ、
  `,` だけは拒否されます。
  `string`、`string a b`、`string?? a`、`string a?`、`? a`、
  `string a , b` です。 [fixture: er/gram-optional-type]
  [fixture: er/lex-optional-type-space]
  [fixture: er/lex-backquote-optional] [fixture:
  er/lex-tilde-then-optional-mark] [fixture: er/lex-optional-then-tilde-name]
  [fixture: er/lex-backquote-then-tilde] [fixture: er/lex-tilde-then-comment]
  [fixture: er/gram-attribute-type-only] [fixture:
  er/gram-attribute-three-words] [fixture: er/gram-optional-type-twice]
  [fixture: er/gram-optional-name] [fixture: er/lex-block-question-alone]
  [fixture: er/lex-block-comma-alone]
- キーは `,` で区切った `key` の単位で、`,` の周りに空白があってもなくてもよく、
  名前の後の行に置けます。
  `PK, FK`、`PK,FK`、`PK ,FK`、`PK, FK, UK` はキーの一覧で、
  `int a` の次の行の `PK` もそうです。
  `,` のない `PK FK`、後ろに何もない `PK,`、型や名前が期待されるところのキー、
  キーの後の語は拒否されます。
  `int id PK FK`、`int id PK,`、`PK id`、`string PK`、`int a PK b` です。
  `int id,PK` は `id,PK` という名前の属性です。
  `,` が語の文字だからです。 [fixture: er/gram-keys-comma-space]
  [fixture: er/gram-keys-comma] [fixture:
  er/lex-keys-space-comma] [fixture: er/gram-keys-three] [fixture:
  er/gram-name-then-key-next-line] [fixture: er/gram-keys-space] [fixture:
  er/gram-keys-trailing-comma] [fixture: er/lex-key-as-type] [fixture:
  er/lex-key-as-name] [fixture: er/gram-key-then-word] [fixture:
  er/lex-key-glued-to-name] [fixture: er/lex-key-lower-case]
- コメントは名前かキーの後の 1 つの `comment-string` の単位で、
  前に空白があってもなくてもよく、後の行に置けます。
  `string a "c d"`、`string a ""`、`string a"c"`、`int a PK"c"`、
  `int a PK` と行 `"c"` は属性で、コメントは改行と `%%` を含めます。
  キーの前のコメント、2 つのコメント、コメントの後のキーは拒否されます。
  `string a "c" PK`、`string a "c" "d"`、`int a "c"` と行 `PK` です。
  コメントの後の属性に空白は要りません。
  `int a "c"string b` は 2 つの属性です。 [fixture: er/gram-comment]
  [fixture: er/gram-comment-empty] [fixture:
  er/lex-comment-glued] [fixture: er/lex-key-glued-comment] [fixture:
  er/gram-keys-then-comment-next-line] [fixture: er/lex-comment-line-feed]
  [fixture: er/lex-comment-percent] [fixture: er/gram-comment-before-keys]
  [fixture: er/gram-comment-two] [fixture:
  er/gram-comment-then-key-next-line] [fixture:
  er/lex-comment-glued-next-attribute]
- mermaid.js がトークンを読まない `empty-backquotes` の単位は、 2 つの属性の間、
  最初の属性の前、最後の属性の後、ブロックに 1つだけにあるときブロックの項目で、
  入力は受理されます。
  `int a` と 2 つのバッククォートと `string b`、2 つのバッククォートと `int a`、
  `int a` と 2 つのバッククォート、ブロックに 2 つのバッククォートだけ、
  並んだ 2 つのその単位（間に改行、コメント行、ディレクティブがあっても）、
  キーやコメントの後で `}` の前の 2 つのバッククォートです。
  属性の中、つまり属性の単位の間にあるときは木に置き場所がなく、
  入力は拒否されます。
  mermaid.js は受理します（[既知の差異](#既知の差異)を参照）。
  `int `` ? a`、`int `` a`、`int? `` a`、`int a `` PK`、`int a PK `` , FK`、
  `int a PK, `` FK`、`int a `` "c"` のように、型と `?` の間、型と名前の間、
  `?` の後、キーの前、キーの `,` の前後、コメントの前です。
  間に空白しかなく並んで書かれた単位は、
  最後のものの後の単位でまとめて決まります。
  `int `` `` a` と `int a PK `` `` , FK` は、
  単位 1 つのときと同じく拒否されます。 [fixture: er/gram-empty-backquotes-between-attributes]
  [fixture:
  er/gram-empty-backquotes-before-first] [fixture:
  er/gram-empty-backquotes-after-last] [fixture:
  er/gram-empty-backquotes-alone] [fixture: er/gram-empty-backquotes-twice]
  [fixture:
  er/gram-empty-backquotes-run-across-line-feed] [fixture:
  er/gram-empty-backquotes-run-across-comment-line] [fixture:
  er/gram-empty-backquotes-run-across-directive] [fixture:
  er/div-empty-backquotes-twice-between-type-and-name] [fixture:
  er/div-empty-backquotes-twice-before-key-comma] [fixture:
  er/gram-empty-backquotes-after-keys] [fixture:
  er/gram-empty-backquotes-after-comment] [fixture:
  er/div-empty-backquotes-before-optional-mark] [fixture:
  er/div-empty-backquotes-before-key-comma] [fixture:
  er/div-empty-backquotes-after-key-comma] [fixture:
  er/div-empty-backquotes-between-type-and-name] [fixture:
  er/div-empty-backquotes-after-optional-mark] [fixture:
  er/div-empty-backquotes-before-key] [fixture:
  er/div-empty-backquotes-before-comment]

### 関係

```text
relationship-statement = entity-reference relationship entity-reference ":" role
entity-reference       = entity-name class-list?
relationship           = cardinality relationship-line cardinality
cardinality            = "zero-or-one" | "zero-or-more" | "one-or-more" | "only-one" | "md-parent"
relationship-line      = "identifying" | "non-identifying"
role                   = string | quoted-name | name
```

関係の文は、2 つの実体の参照とその間の関係、`:`、ロールです。
`A ||--o{ B : has`、`A one or more to zero or one B : has`、
`A:::c ||--o{ B:::d : x`、`A ||--o{ A : x`、`"A 1" ||--o{ "B 2" : x`、
`12 ||--o{ 3.5 : x` は関係です。
ロールは必須で 1 つの単位です。
空でも `%` を含んでも改行を含んでもよい文字列、引用符付きの名前、または名前で、
周りに空白があってもなくてもよい `:` の後に置きます。
`A ||--o{ B`、`A ||--o{ B has`、`A ||--o{ B : x : y`、
`A ||--o{ B :: x` は拒否され、数 `12` や `1`、
キーワードであるロールも拒否されます。
ロールはその単位で終わります。
`A ||--o{ B : has it`、`A ||--o{ B : "x" C`、`A ||--o{ B : "x"C` では、
その後の実体はそれ自体が 1 つの文で、
`A ||--o{ B : has many` は `many` がキーワードなので拒否されます。 [fixture: er/gram-relationship-symbols]
[fixture: er/lex-cardinality-words]
[fixture: er/gram-relationship-both-classes] [fixture:
er/gram-relationship-left-classes] [fixture:
er/gram-relationship-right-classes] [fixture: er/db-relationship-self]
[fixture: er/gram-relationship-string-names] [fixture:
er/gram-relationship-number-names] [fixture: er/gram-role-string] [fixture:
er/gram-role-string-empty] [fixture: er/lex-role-string-percent] [fixture:
er/lex-role-string-line-feed] [fixture: er/lex-role-unicode] [fixture:
er/lex-colon-no-space] [fixture: er/gram-relationship-without-role] [fixture:
er/gram-role-without-colon] [fixture: er/gram-two-roles] [fixture:
er/lex-double-colon] [fixture: er/lex-role-number] [fixture: er/lex-role-one]
[fixture: er/lex-role-keyword-one] [fixture: er/lex-role-then-name] [fixture:
er/gram-role-string-then-name] [fixture: er/lex-role-string-glued-name]
[fixture: er/lex-role-then-keyword]
関係の 3 つの単位とロールは、最初の実体の後の行には置けません。
`A`、改行、`||--o{ B : x` と、`A ||--o{ B :`、改行、
`x` は拒否されます。 [fixture: er/lex-relationship-spec-next-line]
[fixture: er/lex-role-next-line]
端は、文より前か後に定義された subgraph の名前を持てます。
そのとき mermaid.js が関係をどこに向けるかは、
tests パッケージの要約にあります。 [fixture: er/db-relationship-to-subgraph-after]
[fixture:
er/db-relationship-to-subgraph-before]

### subgraph

```text
subgraph-statement = "subgraph" entity-name subgraph-title? empty-description-block* newline line* "end"
subgraph-title     = "[" entity-name+ "]"
```

subgraph の文は、`subgraph`、実体の名前、`[` と `]` のタイトル（なくてもよい）、
改行、本体の文、`end` です。
`subgraph S`、`subgraph S [T1  T2]`、`subgraph S [T]`、`subgraph "S 1"`、
`subgraph "S" [T]`、`subgraph 12`、`subgraph 1.5` は subgraph を始めます。
タイトルは 1 つ以上の実体の名前で、間に空白があってもなくてもかまいません。
`["T 1" x]`、`["a"b]`、`[a"b"]`、`[12 3.5]`、`[1]`、`[a b c]` はタイトルで、
mermaid.js は名前を 1 つの空白文字でつなぎます。
`subgraph S []`、`subgraph S [T] x`、`subgraph S [T:::c]`、 `subgraph S ["T`、
改行、`1"]`、`subgraph S ["T"]x` は拒否されます。 [fixture: er/gram-subgraph]
[fixture: er/gram-subgraph-title] [fixture:
er/lex-subgraph-title-no-space] [fixture: er/gram-subgraph-string-id] [fixture:
er/gram-subgraph-string-id-title] [fixture: er/gram-subgraph-number-id]
[fixture: er/gram-subgraph-decimal-id] [fixture: er/gram-subgraph-title-string]
[fixture: er/lex-subgraph-title-glued-string] [fixture:
er/lex-subgraph-title-word-then-string] [fixture:
er/gram-subgraph-title-numbers] [fixture: er/gram-subgraph-title-one] [fixture:
er/gram-subgraph-title-three-words] [fixture: er/gram-subgraph-title-empty]
[fixture: er/gram-subgraph-title-then-text] [fixture:
er/lex-subgraph-title-class-separator] [fixture:
er/lex-subgraph-title-string-line-feed] [fixture:
er/lex-subgraph-title-then-string-glued]

- 名前かタイトルの後、改行の前に置けるのは空の説明ブロックだけで、
  それらは本体の最初の文です（[空の説明ブロック](#空の説明ブロック) を参照）。
  `subgraph S x`、`subgraph S end`、`subgraph S:::c`、
  `subgraph S accDescr {} x` は拒否され、
  `subgraph S accDescr {} accDescr {}` と、
  `subgraph S [T] accDescr {}` は受理されます。 [fixture: er/gram-subgraph-id-then-text]
  [fixture: er/gram-subgraph-header-then-end-same-line]
  [fixture: er/gram-subgraph-id-class]
  [fixture: er/gram-subgraph-header-block-then-text]
  [fixture: er/gram-subgraph-header-blocks]
  [fixture: er/gram-subgraph-title-then-block]
- 名前 `1` は、改行と、ASCII の文字、`_`、`"`、`'`、
  数字のいずれかで始まる行が続くと `only-one` です（[文の文脈](#文の文脈)を参照）。
  そのため `A`、`12`、`end` が続く `subgraph 1` と、
  改行の前に空白文字のある `subgraph 1` は拒否されます。 [fixture: er/lex-subgraph-one-id]
  [fixture:
  er/lex-subgraph-one-id-then-number] [fixture: er/lex-subgraph-one-id-then-end]
  [fixture: er/lex-subgraph-one-id-trailing-space]
- 本体は subgraph を含むどの文も持て、空でもよく、コメント行と空行を置けます。
  `end` は最も内側の subgraph を閉じ、必ず要ります。
  `A` とテキストの終わりが続く `subgraph S`、`subgraph S` だけ、
  テキストの終わりに改行の付いた `subgraph S`、
  閉じた subgraph の後や単独の `end` は拒否され、`subgraph S` と行 `A end`、
  `subgraph O`、`subgraph I`、`A`、
  `end end` は受理されます。 [fixture: er/gram-subgraph-nested]
  [fixture: er/gram-subgraph-relationship]
  [fixture: er/gram-subgraph-alias-inside] [fixture:
  er/db-subgraph-classdef-inside] [fixture: er/db-subgraph-class-inside]
  [fixture: er/db-subgraph-style-inside] [fixture:
  er/db-subgraph-acc-title-inside] [fixture: er/db-subgraph-acc-descr-inside]
  [fixture: er/db-subgraph-acc-descr-block-inside] [fixture:
  er/gram-direction-in-subgraph] [fixture: er/gram-subgraph-empty] [fixture:
  er/lex-subgraph-comment-line] [fixture: er/lex-subgraph-blank-lines] [fixture:
  er/gram-subgraph-unclosed] [fixture: er/gram-subgraph-header-at-end]
  [fixture: er/lex-subgraph-header-line-feed-at-end] [fixture:
  er/gram-end-twice] [fixture: er/gram-end-alone] [fixture:
  er/lex-end-same-line] [fixture: er/lex-end-end-same-line] [fixture:
  er/lex-subgraph-crlf] [fixture: er/gram-subgraph-after-header-same-line]
- 実体は subgraph の名前を持てます。
  `subgraph S` の前や後の `S` は実体でもあり subgraph でもあります。 [fixture: er/db-subgraph-id-as-name-after]
  [fixture: er/db-subgraph-id-as-name-before]

### 空の説明ブロック

```text
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、
`accDescr` の単位と `{` の単位の直後に `}` の単位が続き、
`description-block-text` の単位のないものです。
mermaid.js はそれにトークンを読みません（[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md) を参照）。
それは、文が始まるところではどこでも、
何も変えないテキストのない説明ブロックの文です。
行の始まり、ヘッダーの直後、同じ行の別の文の直後、subgraph の本体の中、
`end` の直前もそうです。
`accDescr {}` と `A`、`erDiagram accDescr {}`、`A accDescr {} B`、
`A:::c accDescr {} B`、`A ||--o{ B : x accDescr {}`、
`A ||--o{ B : "x" accDescr {}`、`A ||--o{ B : x accDescr {} C`、
`accDescr {}accDescr {}`、subgraph の中の `accDescr {} A`、`A accDescr {} end`、
`accDescr {} end`、 `end accDescr {}` は受理されます。
subgraph の名前かタイトルの後、改行の前のブロックは本体の最初の文です。
行の `direction LR` の後のブロックは方向の行のテキストの一部で、
`accTitle:` の後のブロックはタイトルの一部です。 [fixture: er/gram-acc-descr-block-empty]
[fixture:
er/header-empty-description-block] [fixture:
er/gram-empty-description-block-between-names] [fixture:
er/gram-empty-description-block-after-classes-then-name] [fixture:
er/gram-empty-description-block-after-relationship] [fixture:
er/gram-empty-description-block-after-role-string] [fixture:
er/gram-empty-description-block-then-name] [fixture:
er/gram-empty-description-blocks-adjacent] [fixture:
er/gram-empty-description-block-first-in-subgraph] [fixture:
er/gram-empty-description-block-before-end]
[fixture: er/gram-empty-description-block-alone-before-end] [fixture:
er/gram-empty-description-block-after-end] [fixture:
er/gram-subgraph-header-blocks] [fixture:
er/lex-direction-line-empty-description-block] [fixture:
er/lex-acc-title-empty-description-block]

ブロックの後の単位がその前の文を続けるか、文がまだ終わっていないところでは、
ブロックは文の中にあり、入力は拒否されます（[既知の差異](#既知の差異) を参照）。
実体の名前とその関係・クラス・ブロック・別名の間、別名の括弧の中、
`:::` とクラスの間、クラスの並びの `,` の前後、別名と `:::` の間、
関係の単位の間、右の実体のクラスの後、`subgraph` とその名前の間、
名前とタイトルの間、タイトルの中（2 つの名前の間も）、
`class` の文の単位の間（`class` と最初の名前の間も）で、
ブロックが複数行にわたっても同じです。
間に空白しかなく並んで書かれたブロックは、
最後のものの後の単位でまとめて決まります。
`A accDescr {} accDescr {} ||--o{ B : x`、
`A ||--o{ B : accDescr {} accDescr {} x`、
`class accDescr {} accDescr {} A a` は、
ブロック 1 つのときと同じく拒否されます。
そのため `A accDescr {} ||--o{ B : x`、`A accDescr {}||--o{ B : x`、
`A:::c accDescr {} ||--o{ B : x`、`A accDescr {} :::c`、`A accDescr {} {`、
`A accDescr {} [P]`、`A ||--o{ accDescr {} B : x`、
`A ||--o{ B accDescr {} : x`、 `A ||--o{ B : accDescr {} x`、
`class A accDescr {} a`、`A[accDescr {} P]`、 `A[P accDescr {}]`、
`A ::: accDescr {} c`、`A:::c, accDescr {} d`、 `A:::c accDescr {} , d`、
`A[P] accDescr {} :::c`、 `A ||--o{ B:::c accDescr {} : x`、
`subgraph accDescr {} S`、 `subgraph S accDescr {} [T]`、
`subgraph S [accDescr {} T]`、 `subgraph S [T accDescr {}]`、
`class A, accDescr {} B a`、 `class A a accDescr {} , b`、
`class accDescr {} A a`、 `subgraph S [T accDescr {} U]`、 `A accDescr {`、
改行、`} ||--o{ B : x` は拒否され、 `A accDescr {}` と行 `{` も拒否されます。
後者は mermaid.js も拒否します。
style の文脈と属性ブロックでは `accDescr` は語で、
`{` は拒否されます（[style の文脈](#style-の文脈) を参照）。 [fixture: er/div-empty-description-block-in-relationship]
[fixture:
er/div-empty-description-block-before-spec-no-space] [fixture:
er/div-empty-description-block-after-classes] [fixture:
er/div-empty-description-block-before-class-separator] [fixture:
er/div-empty-description-block-before-block] [fixture:
er/div-empty-description-block-before-alias] [fixture:
er/div-empty-description-block-after-spec] [fixture:
er/div-empty-description-block-before-colon] [fixture:
er/div-empty-description-block-before-role]
[fixture: er/div-empty-description-block-in-class] [fixture:
er/div-empty-description-block-in-alias-start] [fixture:
er/div-empty-description-block-in-alias-end] [fixture:
er/div-empty-description-block-after-class-separator] [fixture:
er/div-empty-description-block-after-class-comma] [fixture:
er/div-empty-description-block-before-class-comma] [fixture:
er/div-empty-description-block-after-alias] [fixture:
er/div-empty-description-block-after-right-classes] [fixture:
er/div-empty-description-block-before-subgraph-id] [fixture:
er/div-empty-description-block-before-subgraph-title] [fixture:
er/div-empty-description-block-in-subgraph-title-start] [fixture:
er/div-empty-description-block-in-subgraph-title-end] [fixture:
er/div-empty-description-block-in-class-after-comma] [fixture:
er/div-empty-description-block-in-class-before-comma]
[fixture: er/div-empty-description-block-multiline-in-relationship] [fixture:
er/div-empty-description-block-after-class-keyword] [fixture:
er/div-empty-description-block-between-title-names] [fixture:
er/div-empty-description-blocks-in-relationship] [fixture:
er/div-empty-description-blocks-before-role] [fixture:
er/div-empty-description-blocks-after-class-keyword] [fixture:
er/gram-empty-description-block-then-block-next-line] [fixture:
er/lex-classdef-empty-description-block] [fixture: er/lex-block-acc-descr]

### その他の文

```text
direction-statement     = direction-text? "direction" "direction-value" direction-text?
class-def-statement     = "classDef" style-text ( "," style-text )* styles statement-end
style-statement         = "style" style-text ( "," style-text )* styles statement-end
styles                  = style-item ( "," style-item )*
style-item              = ( style-text | ":" | "#" )+
statement-end           = newline | ";"
class-statement         = "class" name ( "," name )* name ( "," name )*
accessibility-statement = "accTitle" ":" title-text
                        | "accDescr" ":" description-text
                        | "accDescr" "{" description-block-text "}"
```

- 方向の文は図の方向、subgraph の中ではその subgraph の方向を設定し、
  何度書いてもかまいません。
  テキストの終わりの `direction LR` も方向の文です。 [fixture: er/gram-direction]
  [fixture: er/db-direction-twice] [fixture:
  er/gram-direction-in-subgraph] [fixture: er/db-direction-in-subgraph-twice]
  [fixture: er/gram-direction-in-nested-subgraph] [fixture:
  er/lex-direction-at-end]
- `classDef` と `style` の文では、名前は `,` で区切った `style-text` の単位で、
  `,` が前にない最初の単位で終わります。
  その後にスタイルが続き、少なくとも 1 つ要ります。
  文は `newline` か `;` の単位で終わります。
  テキストの終わりでは [テキストの終わり](../common.ja.md#テキストの終わり) の改行がその `newline` なので、
  テキストは style の文脈では終われません（[単位と文脈](#単位と文脈) を参照）。
  スタイルは、次の `,` か区切りまでの `style-text`、`:`、`#` の単位で、
  その値はそれらのテキストをつないだものです（[ErLiteral](../ast/er.ja.md#erliteral) を参照）。
  そのため `classDef a fill : #f9f` は `fill:#f9f` を定義し、
  `classDef a fill:red stroke:blue` は 1 つのスタイル `fill:redstroke:blue` を定義し、
  `classDef a fill:red , stroke:blue` は 2 つを定義します。
  `classDef a,b fill:red`、`classDef a, b fill:red`、
  `classDef default fill:red`、 `classDef a 1`、`classDef a #`、`classDef a :`、
  `classDef a *:red`、 `classDef end fill:red`、
  および A と `fill` に `:red` を与える `style A, fill:red` は受理されます。
  `classDef a`、`classDef a` と行 `fill:red`、`style A`、
  `classDef a fill:red,`、 `classDef a fill:red,,stroke:blue`、
  `style ,A fill:red`、
  `style A,,B fill:red` は拒否されます。 [fixture: er/gram-classdef]
  [fixture: er/lex-classdef-style-spaces] [fixture:
  er/lex-classdef-styles-joined] [fixture: er/lex-style-styles-joined]
  [fixture: er/lex-classdef-comma-spaces] [fixture: er/gram-classdef-two-names]
  [fixture: er/lex-classdef-names-comma-space] [fixture:
  er/gram-classdef-default] [fixture: er/lex-classdef-number-style] [fixture:
  er/lex-classdef-hash-only] [fixture: er/lex-classdef-colon-only] [fixture:
  er/lex-classdef-star-style] [fixture: er/lex-classdef-keyword-end-name]
  [fixture: er/lex-style-trailing-comma] [fixture:
  er/gram-classdef-without-styles] [fixture:
  er/gram-classdef-without-styles-next-line] [fixture:
  er/gram-style-without-styles] [fixture: er/gram-classdef-trailing-comma]
  [fixture: er/gram-classdef-double-comma] [fixture:
  er/gram-style-leading-comma] [fixture: er/gram-style-double-comma] [fixture:
  er/gram-style] [fixture: er/gram-style-two-names] [fixture:
  er/lex-style-dash-name] [fixture: er/lex-style-star-name] [fixture:
  er/lex-style-unicode-name] [fixture: er/gram-style-number-name] [fixture:
  er/lex-style-hash-first]
- `class` の文は、`,` で区切った名前の 2 つの一覧で、
  `,` の周りに空白があってもなくてもかまいません。
  実体か subgraph の名前と、クラスです。
  1 つ目の一覧は `,` が前にない最初の名前で終わり、
  2 つ目は `,` でも名前でもない次の単位で終わります。
  `class A a`、`class A,B a,b`、`class A , B a`、
  後ろに実体 `b` を持つ `class A a b`、 `class A a,b c` は受理されます。
  `class A`、`class A` と行 `B`、`class A, a`、`class 12 a`、`class "A" a`、
  `class A end` は拒否されます。 [fixture: er/gram-class]
  [fixture: er/gram-class-two-lists]
  [fixture: er/lex-class-list-comma-spaces] [fixture: er/gram-class-then-name]
  [fixture: er/gram-class-two-lists-then-name]
  [fixture: er/gram-class-without-classes]
  [fixture: er/gram-class-names-then-line-feed]
  [fixture: er/gram-class-trailing-comma] [fixture: er/lex-class-number]
  [fixture: er/lex-class-string] [fixture: er/lex-class-keyword-end]
  [fixture: er/lex-class-unicode]
- アクセシビリティの文はタイトルか説明を設定し、どちらも、行でもブロックでも、
  空のブロックでも、何度書いてもかまいません。
  mermaid.js がそれらを Db にどう読むかは、
  tests パッケージの要約にあります。 [fixture: er/gram-acc-title]
  [fixture: er/gram-acc-descr] [fixture:
  er/gram-acc-descr-block] [fixture: er/db-acc-title-twice] [fixture:
  er/db-acc-descr-twice] [fixture: er/db-acc-descr-then-block] [fixture:
  er/db-acc-descr-block-then-empty]

### 文法の外の拒否

ありません。
この図の Db はどの入力でも例外を投げないので、
文法が受理する入力はすべて受理されます。

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  テキストの単位と文字列の単位以外の単位の中のディレクティブは、
  この仕様では入力を拒否させ、
  mermaid.js は受理します（[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  名前、数、属性ブロックの語やキー、`style` の後の名前、キーワード、濃度、
  関係の線、 `:::`、`[` の中です。 [fixture: er/div-directive-in-name] [fixture:
  er/div-directive-in-number-name] [fixture:
  er/div-directive-in-attribute-word] [fixture: er/div-directive-in-key]
  [fixture: er/div-directive-in-style-id] [fixture:
  er/div-directive-in-subgraph-keyword] [fixture:
  er/div-directive-in-cardinality-words] [fixture:
  er/div-directive-in-cardinality-symbol] [fixture:
  er/div-directive-in-class-separator]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則か `classDef` の規則に合う行で、
  テキストの単位と文字列の単位以外の単位の中にある無視される `;` は、
  ここでは入力を拒否させ、 mermaid.js は `;` を除いて両側を 1 つとして読みます。
  規則が探す `style`、`:`、`#` は、その行の `;` より前のどこにあってもよく、
  実体 `Bstyle` の後のロール `:"#"` や属性のコメント `"c:#"` でも足ります。
  `A ||--o{ Bstyle :"#" C;D` は mermaid.js では実体 `CD`、 `1;2` は実体 `12`、
  `1.;5` は実体 `1.5`、`|;|--o{` は濃度、
  `on;e or more` と `su;bgraph` はキーワード、`||-;-o{` は関係の線、
  `C::;:c` はクラスの `:::`、
  `Astyle { string a "c:#" int x;y }` と `int x P;K` はブロックの語とキーで、
  `BclassDef :"#"` の後でも `C;D` は実体 `CD` です。
  文字列の後、および文字列の単位かテキストの単位の中では、
  mermaid.js の読みが保たれます。 [fixture: er/div-ignored-semicolon-in-name]
  [fixture:
  er/div-ignored-semicolon-in-number] [fixture:
  er/div-ignored-semicolon-in-decimal] [fixture:
  er/div-ignored-semicolon-in-cardinality-symbol] [fixture:
  er/div-ignored-semicolon-in-cardinality-words] [fixture:
  er/div-ignored-semicolon-in-keyword] [fixture:
  er/div-ignored-semicolon-in-relationship-line] [fixture:
  er/div-ignored-semicolon-in-class-separator] [fixture:
  er/div-ignored-semicolon-classdef-rule-in-name] [fixture:
  er/div-ignored-semicolon-in-attribute-word] [fixture:
  er/div-ignored-semicolon-in-key] [fixture:
  er/tokens-ignored-semicolon-after-role] [fixture:
  er/tokens-ignored-semicolon-in-role-string] [fixture:
  er/tokens-ignored-semicolon-in-tilde-word] [fixture:
  er/tokens-ignored-semicolon-in-backquoted-word] [fixture:
  er/tokens-ignored-semicolon-in-acc-title] [fixture:
  er/tokens-ignored-semicolon-in-direction-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、
  `A ||--o{ B : "b="c">d"` のロールは mermaid.js では `b='c'>d` で、
  ここでは文字列が 2 つ目の `"` で終わり、入力は拒否されます。
  実体の名前としての `"b="c">d"` も同じに読まれます。 [fixture: er/div-html-tag-starts-in-frontmatter-role]
  [fixture:
  er/div-html-tag-starts-in-frontmatter-name]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.jsは拒否します。 [fixture: er/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  文の中の空の説明ブロックと、属性の中の `empty-backquotes` の単位は、
  この仕様では入力を拒否させ、
  mermaid.jsはそれにトークンを読まずに入力を受理します。
  [空の説明ブロック](#空の説明ブロック) と、[属性](#属性) を参照してください。
  文が始まるところでは空の説明ブロックは文で、
  2 つの属性の間では `empty-backquotes` の単位はブロックの項目で、
  入力は受理されます。 [fixture: er/div-empty-description-block-in-relationship]
  [fixture:
  er/div-empty-description-block-before-class-separator] [fixture:
  er/div-empty-description-block-before-block] [fixture:
  er/div-empty-description-block-before-alias] [fixture:
  er/div-empty-description-block-after-spec] [fixture:
  er/div-empty-description-block-before-colon] [fixture:
  er/div-empty-description-block-before-role] [fixture:
  er/div-empty-description-block-in-class] [fixture:
  er/div-empty-backquotes-between-type-and-name] [fixture:
  er/div-empty-backquotes-after-optional-mark] [fixture:
  er/div-empty-backquotes-before-key] [fixture:
  er/div-empty-backquotes-before-comment] [fixture:
  er/gram-empty-description-block-between-names] [fixture:
  er/gram-empty-backquotes-between-attributes]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかに実体の名前やロールとしてある `C4Container`、
  `C4Component`、`C4Dynamic`、`C4Deployment` は、
  mermaid.js にテキストを C4 の構文解析器へ渡させ、それは拒否します。
  ここではテキストは ER 図です。
  `C4Context` はどちらでも名前です。 [fixture: er/div-c4-keyword-as-name]
  [fixture: er/div-c4-keyword-as-role]
  [fixture: er/lex-c4context-name]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
  そのような行の後の空白だけの行は、ここではコメントか何もなしで、
  mermaid.js は入力を拒否します。
  この図の字句解析器に `%` の規則がないからです（[検出](#検出) を参照）。 [fixture: er/header-after-bare-percent-line]
  [fixture:
  er/header-after-empty-braces-line] [fixture:
  er/header-after-bare-percent-line-and-whitespace-line]

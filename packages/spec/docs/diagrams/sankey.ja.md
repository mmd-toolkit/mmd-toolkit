# Sankey

英語版: [sankey.md](./sankey.md)

mermaid.js の正となるソース：

- [`sankey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison)
- [`sankeyUtils.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyUtils.ts)
- [`sankeyDB.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts)
- [`sankey/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey)
  の中のテスト（`*.spec.ts`）

この文書は図種 `sankey` を扱います。
木のノードは [ast/sankey.ja.md](../ast/sankey.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 23 がこの文法を選びます。
テキストが、空白の後、
ちょうどこの大文字小文字の `sankey` で始まるときです（mermaid.js の
[`sankeyDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDetector.ts#L5-L7)）。
`Sankey` と `SANKEY` はどの検出器にも合いません。
ヘッダーの前の U+FEFF は空白です。 [fixture: sankey/db-link-basic]
[fixture: sankey/header-indented] [fixture: sankey/header-tab-indented]
[fixture: sankey/header-nbsp-before] [fixture: sankey/header-after-blank-lines]
[fixture: sankey/header-capitalized] [fixture: sankey/header-upper-case]
[fixture: sankey/db-byte-order-mark-at-start]

その後、字句解析器がヘッダー、
つまりキーワード `sankey-beta` かキーワード `sankey` を、
大文字小文字を区別せず、
語の文字が続かない形で読みます（[記録の文脈](#記録の文脈) を参照）。
2 つのヘッダーは同じ図種で、同じ Db を与えます。
`sankey-beta` と `sankey-BETA` はヘッダーで、 `sankeyx` は検出されて拒否され、
`sankey-x`、`sankey-beta-x`、`sankeyé`、`sankey-betaé` は、
その行にテキストが続くヘッダーで、拒否されます。
ASCII の外の文字は、語の文字でも欄の文字でもないからです。 [fixture:
sankey/db-header-beta] [fixture: sankey/db-header-beta-upper-case] [fixture:
sankey/header-word-suffix] [fixture: sankey/header-dash-suffix] [fixture:
sankey/header-beta-suffix] [fixture: sankey/header-non-ascii-suffix]
[fixture: sankey/header-beta-non-ascii-suffix]

ヘッダーはそれだけで 1 行です。
すぐ後に改行が続き、少なくとも 1 つの記録が続きます。
後ろに何もないヘッダー、空行かコメント行だけが続くヘッダーは、
フロントマターの後でも拒否されます。
その行に記録、空白、
`%%`（前に空白があってもなくても）が続くヘッダーも拒否されます。
ヘッダーの直後のディレクティブはディレクティブであってそれ以外ではなく、一方、
ディレクティブの前の空白はヘッダーの行に残り、入力は拒否されます。
ヘッダーの後の行のディレクティブは何も変えません。 [fixture:
sankey/header-only] [fixture: sankey/header-without-line-feed] [fixture:
sankey/header-beta-only] [fixture: sankey/header-blank-line-only] [fixture:
sankey/header-then-comment-line-only] [fixture:
sankey/header-only-after-frontmatter] [fixture:
sankey/header-record-on-header-line] [fixture: sankey/header-trailing-spaces]
[fixture: sankey/header-trailing-tab] [fixture:
sankey/header-comment-on-header-line] [fixture: sankey/header-comment-glued]
[fixture: sankey/header-directive-glued-to-header] [fixture:
sankey/header-beta-directive-glued] [fixture:
sankey/header-directive-after-space-on-header-line] [fixture:
sankey/header-then-directive-line]

ヘッダーの前の、`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
`%%` だけの行です。
検出はそれを読んで通り過ぎてヘッダーを見つけ、
その行はどの図種でもそうであるように、
ここでは印 `%%` の図のコメントです（[図種の検出](../common.ja.md#図種の検出)
を参照）。
コメントはどのノードにも属さず、SankeyDiagram はヘッダーから始まります。
mermaid.js はどちらの場合も入力を拒否し、
`%%` だけの行の後に空白だけの行があるときも拒否します。
その字句解析器が `%%` をヘッダーの前の欄として読むからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
ヘッダーの前の行のコメント行とディレクティブは何も変えず、
ヘッダーの前の行 `# c` はテキストの始まりなので、どの検出器にも合いません。
[fixture:
sankey/header-after-bare-percent-line] [fixture:
sankey/header-after-empty-braces-line] [fixture:
sankey/header-after-bare-percent-line-and-whitespace-line] [fixture:
sankey/header-after-comment-line] [fixture: sankey/header-after-directive-line]
[fixture: sankey/header-after-hash-line]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を
[変換後の形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをそのプレースホルダーとして、
コメント領域と行の規則が無視する `;` はないものとして読みます。
この節は、[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 である、
この図自身の単位の規則を述べます。

**テキストの終わり。**
図のテキストの終わりの空白は、改行を含めて何もありません。
テキストは空白でない最後の文字で終わるので、
字句解析器が最後の文字の後に読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）も読まれません。
改行のない最後の記録、空行か空白文字の行が後に続く最後の記録、 U+3000、U+00A0、
U+2028、U+2029、U+FEFF、タブで終わる最後の記録は受理されます。
テキストの終わりの欄はその空白なしで読まれるので、
テキストの終わりの `a,b,` と空白文字 1 つは値が空の記録で、拒否されます。
一方、別の記録の前の同じ行は、値の欄に空白文字 1 つを持つ記録です。 [fixture:
sankey/db-no-line-feed-at-end] [fixture: sankey/db-whitespace-line-at-end]
[fixture: sankey/db-trailing-ideographic-space-at-end] [fixture:
sankey/db-trailing-nbsp-at-end] [fixture:
sankey/db-trailing-line-separator-at-end] [fixture:
sankey/db-trailing-paragraph-separator-at-end]
[fixture: sankey/db-byte-order-mark-at-end]
[fixture: sankey/db-tab-at-end-of-text] [fixture:
sankey/gram-spaces-only-value-at-end-of-text] [fixture:
sankey/db-spaces-only-value]

この図の mermaid.js の字句解析器は、
文字の大文字小文字を区別せずに比べます（[表記](../common.ja.md#表記) を参照）。
比べる文字を持つのはヘッダーだけです。
以下で**キーワード**とは、大文字小文字を区別せずに照合する語で、
語の文字が続かないものです（[表記](../common.ja.md#表記) を参照）。

### 単位と文脈

字句解析器は図のテキストを**単位**に分けます。
文法は単位の上に書きます。
各単位は、文法が使う名前と、**テキスト**、
つまり変換後の形で読んだ文字を持ちます。

字句解析器は**文脈**のスタックを持ちます。
最初は記録の文脈にいます。
規則は文脈に入ること（スタックの一番上に積む）も、
現在の文脈を出ること（その下の文脈に戻る）もできます。
各位置で、字句解析器は現在の文脈の規則のうち、そこで合う最初のものを適用します。
現在の文脈のどの規則も合わないときは入力を拒否します。
以下の一覧ではこれを繰り返しません。

テキストは記録の文脈でだけ終われます。
文字列は閉じていなければならないので、テキストの終わりの `"a,c,1`、`a,"b,1`、
`a,"b` は拒否されます。 [fixture:
sankey/gram-quoted-unclosed] [fixture: sankey/gram-quoted-value-unclosed]
[fixture: sankey/gram-quoted-unclosed-at-end-of-text]

**文字。**
記録の文脈の単位は、U+0020 から U+007E の文字、
つまり空白文字と ASCII の印字文字でできています。
タブ、ASCII の外の文字、空白文字と改行以外の空白は、どの規則も読みません。
記録の前、欄の中、欄とコンマの間、文字列の中、記録の間のどこでもそうです。
タブ、U+00A0、U+3000、U+2028、U+2029、U+FEFF、`é`、CJK の文字、絵文字は、
テキストの終わり（[テキストの終わり](#字句構造) を参照）でなければ、
ヘッダーの後、別の記録の前の行の終わり、記録の間も含めて、
どこにあっても入力を拒否させます。
エンティティは、
そのプレースホルダーとして読まれ（[エンティティ](../common.ja.md#エンティティ)
を参照）、その文字は ASCII の外にあるので、
`#35;` や `#amp;` のような完全なエンティティは、
文字列の中でも入力を拒否させます。
一方、`;` のない `#35` はテキストです。 [fixture:
sankey/gram-tab-in-field] [fixture: sankey/gram-tab-after-first-field] [fixture:
sankey/gram-tab-before-record] [fixture: sankey/gram-tab-before-second-field]
[fixture: sankey/gram-tab-after-value-before-record]
[fixture: sankey/gram-byte-order-mark-after-header]
[fixture: sankey/gram-byte-order-mark-before-record]
[fixture: sankey/gram-byte-order-mark-between-records]
[fixture: sankey/gram-byte-order-mark-in-field]
[fixture: sankey/gram-no-break-space-in-field] [fixture:
sankey/gram-no-break-space-before-record] [fixture:
sankey/gram-ideographic-space-in-field] [fixture:
sankey/gram-line-separator-in-field] [fixture:
sankey/gram-line-separator-before-first-record] [fixture:
sankey/gram-line-separator-between-records] [fixture:
sankey/gram-paragraph-separator-in-field] [fixture:
sankey/gram-paragraph-separator-between-records] [fixture:
sankey/gram-non-ascii] [fixture: sankey/gram-cjk] [fixture: sankey/gram-emoji]
[fixture: sankey/gram-quoted-line-separator] [fixture:
sankey/gram-quoted-non-ascii] [fixture: sankey/gram-entity-numeric] [fixture:
sankey/gram-entity-named] [fixture: sankey/gram-entity-in-quoted-field]
[fixture: sankey/gram-entity-in-quoted-value] [fixture:
sankey/db-text-reference-without-semicolon]

HTML のタグの属性の引用符は、
どの図種でもそうであるように `'`
として読まれます（[HTML 属性の引用符](../common.ja.md#html-属性の引用符)
を参照）。
そのため欄 `<a b="c">d` は `"` を持たず、テキスト `<a b='c'>d` で、
文字列の中の引用符つきのタグも同じです。
[fixture: sankey/lex-html-tag-in-unquoted-field]
[fixture: sankey/lex-html-tag-in-quoted-field] [fixture:
sankey/db-text-html-tags]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むとおりに読みます。
そのうえで
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が単位に当てはまります。
テキストの単位か文字列の単位の中のディレクティブは mermaid.js の読みを保ち、
それ以外の単位の中のディレクティブは入力を拒否させます。
**テキストの単位**は `field-text`、**文字列の単位**は `string` です。
ほかの単位、つまりヘッダーと `,` は、テキストの単位ではありません。

- `a,%%{init: {}}%%b,1` は target `b` を、
  `a,"b%%{init: {}}%%c",1` は target `bc` を持ち、記録の始まり、値の後、
  それだけの行のディレクティブは何も変えません。
  mermaid.js と同じです。 [fixture:
  sankey/db-directive-in-field] [fixture: sankey/db-directive-in-quotes]
  [fixture: sankey/db-directive-at-start-of-record] [fixture:
  sankey/db-directive-after-value] [fixture:
  sankey/db-directive-sankey-settings]
- `san%%{init: {}}%%key` と `sankey-%%{init: {}}%%beta` では、
  ディレクティブはヘッダーのキーワードの中にあります。
  入力は拒否され、 mermaid.js は 2 つの部分を 1 つとして読んで受理します。
  [fixture: sankey/div-directive-in-header-keyword]
  [fixture: sankey/div-directive-in-beta-header-keyword]
  [既知の差異](#既知の差異) を参照してください。

**単位の間のトリビア。**
[common.ja.md](../common.ja.md) のトリビアは、
この図の単位と次のように出会います。
単独の CR と CRLF は行終端で、
文字列の中でも改行として読まれます（[行終端](../common.ja.md#行終端) を参照）。
閉じていないディレクティブはテキストの残りを取ります。
[ディレクティブの位置](../common.ja.md#ディレクティブの位置)
を参照してください。
テキストの終わりの `a,b,1`、空白文字、`%%{init` は、記録 `a,b,1` と空白文字で、
行 `c,d,2` の前では `c` をその引数として取り、
最初の記録の後に `,d,2` を残すので、入力は拒否されます。
コメント行は、字句解析器がテキストを読む前にその改行ごと取り除かれます。
字下げしていても、記録の間でも、テキストの終わりでも、文字列の中でもそうで、
文字列の中ではその行は文字列の一部ではありません。
一方、`%%` だけの行と行 `# c` は欄で、コンマを持たないので、入力は拒否されます。
文字列の中のそれだけの行のディレクティブは、その行を空にします。
[fixture: sankey/db-crlf-line-ends] [fixture:
sankey/db-lone-cr-line-ends] [fixture: sankey/db-quoted-crlf] [fixture:
sankey/db-quoted-cr] [fixture: sankey/db-directive-unclosed-at-end] [fixture:
sankey/gram-directive-unclosed-takes-next-line] [fixture:
sankey/db-comment-line] [fixture: sankey/db-comment-line-indented] [fixture:
sankey/db-comment-line-between-records] [fixture: sankey/db-comment-line-at-end]
[fixture: sankey/db-comment-line-with-blank-lines] [fixture:
sankey/db-quoted-comment-line] [fixture: sankey/gram-percent-line-alone]
[fixture: sankey/gram-hash-line-alone] [fixture:
sankey/db-quoted-directive-line]

`style` の規則か `classDef` の規則に合う行（詳しくは
[`style` 行と `classDef` 行](../common.ja.md#style-行と-classdef-行)
を参照）では、最後の `;` が無視されて、欄でも文字列でも読み通されます。
`style:#x;y,b,1` は source `style:#xy` を持ち、 target でも、
`style` の代わりに `classDef` でも、文字列 `"style:#x;y"` でも、
文字列の 2 行目でも同じで、 `a;b,style:#x;y,1` は最初の `;` を保ちます。
規則は行ごとに読まれ、文字列の中でも次の行の `;` には届きません。
規則には、書かれたとおりの `style` か `classDef` と、
間に空白のない `:` の後の `#` が要るので、 `style: #x;y`、`Style:#x;y`、
`classdef:#x;y` は `;` を保ち、それが `#x;` をエンティティにして入力を拒否させ、
`style:x;y` は `;` をテキストとして保ちます。
2 つあると最後のものだけが無視され、その前の `#x;` はエンティティです。
欄の終わりで規則が無視する `;` は、欄からなくなります。 [fixture:
sankey/lex-style-line-semicolon-source] [fixture:
sankey/lex-style-line-semicolon-target] [fixture:
sankey/lex-classdef-line-semicolon] [fixture:
sankey/lex-style-line-semicolon-in-quotes] [fixture:
sankey/lex-style-line-semicolon-in-second-line-of-quotes] [fixture:
sankey/lex-style-line-last-semicolon-only] [fixture:
sankey/lex-style-line-semicolon-in-other-field] [fixture:
sankey/lex-style-line-does-not-cross-lines] [fixture:
sankey/lex-style-line-does-not-cross-lines-in-quotes] [fixture:
sankey/lex-style-line-space-after-colon] [fixture:
sankey/lex-style-upper-case-entity] [fixture:
sankey/lex-classdef-lower-case-entity] [fixture:
sankey/lex-style-line-without-hash-keeps-semicolon] [fixture:
sankey/lex-style-line-space-before-colon] [fixture:
sankey/lex-style-line-text-between-colon-and-hash] [fixture:
sankey/lex-style-line-last-semicolon-of-two] [fixture:
sankey/lex-style-line-semicolon-at-end-of-field]

### 記録の文脈

記録の文脈では、字句解析器は次の規則を順に試します。

1. テキストが始まるところのキーワード `sankey-beta`。
   `header` の単位です。 [fixture: sankey/db-header-beta]
2. テキストが始まるところのキーワード `sankey`。
   `header` の単位です。 [fixture: sankey/db-link-basic]
3. 1 つ以上の改行。
   `newline` の単位です。 [fixture: sankey/db-blank-lines-between]
4. `,`。
   `,` の単位です。 [fixture: sankey/db-link-basic]
5. `"`。
   文字列の文脈に入ります（[文字列](#文字列) を参照）。
   [fixture: sankey/db-quoted-fields]
6. U+0020 から U+007E の、`"` と `,` 以外の、できるだけ多くの 1 つ以上の文字。
   `field-text` の単位です。 [fixture: sankey/db-text-with-spaces]

`field-text` の単位は、欄のまわりの空白文字と、
`"` と `,` 以外のすべての ASCII の印字文字を取ります。
`%%`、`#`、`;`、`'`、`&`、`<`、`>`、`/`、`\`、`-`、`_` はその文字なので、
記録の中ではコメントは始まらず、`a %% c` は欄で、`b;` は `;` を保ちます。
その中の `"`、その中の `""`、その前後の空白文字の後の `"` は、
文法に合う単位のないところにあり、入力は拒否されます。
一方、文字列に続くコンマの後の空白文字は、`a,"b",  1` のように次の欄です。
ヘッダーの後では、語 `sankey` はほかと同じ欄です。
[fixture: sankey/db-fields-trimmed] [fixture: sankey/db-indented-records]
[fixture: sankey/db-text-punctuation] [fixture: sankey/db-text-slashes]
[fixture: sankey/db-text-semicolon-and-hash] [fixture:
sankey/db-text-hash-leading] [fixture: sankey/db-text-semicolon-at-end-of-field]
[fixture: sankey/db-text-percent-in-field]
[fixture: sankey/db-text-percent-in-target] [fixture: sankey/db-text-apostrophe]
[fixture: sankey/db-text-ampersand-and-angle] [fixture:
sankey/gram-quote-in-unquoted-field] [fixture:
sankey/gram-doubled-quote-in-unquoted-field] [fixture:
sankey/gram-quote-after-space-in-field] [fixture:
sankey/gram-space-before-opening-quote] [fixture:
sankey/gram-space-before-quoted-second-field] [fixture:
sankey/gram-space-after-closing-quote] [fixture:
sankey/gram-text-after-closing-quote] [fixture:
sankey/gram-text-before-opening-quote] [fixture:
sankey/gram-quoted-value-then-text] [fixture:
sankey/db-quoted-space-before-value] [fixture: sankey/spec-sankey-39b0ab0f]

### 文字列

文字列の文脈には `"` の後で入ります（記録の文脈の規則 5）。
この文脈は 1 つの `string` の単位を読みます。
1 つ以上の文字で、どの文字も U+0020 から U+007E の `"` 以外の文字、 `,`、改行、
`""` のどれかで、その後の `"` が続かない `"` が文脈を出ます。
文字列のテキストは引用符の間にあるもので、`""` は書かれたとおりです。
引用符の間に何もない `""` は `string` の単位を読まず、欄ではないので、
入力は拒否されます（[図と記録](#図と記録) を参照）。
そのため、`"a,b"` はコンマを、`"a""b"` は二重の引用符を、
`""""` は 1 つの二重の引用符を持ち、文字列は改行と行を持てます。 [fixture:
sankey/db-quoted-fields] [fixture: sankey/db-quoted-comma] [fixture:
sankey/db-quoted-doubled-quote] [fixture:
sankey/db-quoted-doubled-quote-at-end] [fixture:
sankey/db-quoted-doubled-quote-at-start] [fixture: sankey/db-quoted-only-quote]
[fixture: sankey/db-quoted-four-quotes] [fixture:
sankey/db-quoted-two-quotes-at-end] [fixture: sankey/db-id-quote-and-comma]
[fixture: sankey/db-quoted-line-feed] [fixture: sankey/gram-quoted-empty]
[fixture: sankey/gram-quoted-empty-value]

### コメント

この図種には図のコメントがありません。
その字句解析器は `%%` と `#` を欄か文字列の文字として読みます。
コメント行は字句解析器がテキストを読む前に取り除かれます。
[fixture: sankey/db-text-percent-in-field]
[fixture: sankey/db-text-hash-leading] [fixture: sankey/db-comment-line]
[単位の間のトリビア](#単位の中のディレクティブ) を参照してください。

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
`field-text` のような単位の名前はその名前の 1 つの単位を表し、
二重引用符の中のテキストは、`","` のように、
そのテキストが名付ける単位を表します。
文法は
[`sankey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L45-L67)
の文法を言い直したもので、同じ単位の並びを受理します。

以下の各規則は、
[ast/sankey.ja.md](../ast/sankey.ja.md) で定める木のノードを作ります。

| 規則                               | ノード              |
| ---------------------------------- | ------------------- |
| `diagram`                          | SankeyDiagram       |
| `record`                           | SankeyLinkStatement |
| 1 つ目か 2 つ目の欄の `field-text` | SankeyIdentifier    |
| 3 つ目の欄の `field-text`          | SankeyLiteral       |
| `string`                           | StringLiteral       |

### 図と記録

```text
diagram = header newline record ( newline record )*
record  = field "," field "," field
field   = field-text | string
```

図は、ヘッダー、`newline` の単位、1 つ以上の記録で、
各記録はそれだけで 1 行です。
`newline` の単位は 1 つ以上の改行を表すので、記録の間、ヘッダーの後、
終わりの空行は何も変えません。
ヘッダーの後のどの行も記録です。
タイトルの行、アクセシビリティの文、記録の間の空白だけの行、 `%%` だけの行は、
コンマのない欄で、入力は拒否されます。 [fixture:
sankey/db-two-links] [fixture: sankey/db-blank-lines-between] [fixture:
sankey/gram-title-statement] [fixture: sankey/gram-acc-title-statement]
[fixture: sankey/gram-whitespace-line-after-header] [fixture:
sankey/gram-whitespace-line-between] [fixture: sankey/gram-percent-line-alone]

記録は、2 つずつの間に `,` を置いた、ちょうど 3 つの欄です。
1 つか 2 つの欄、4 つの欄、終わりの `,`、コンマだけの行は拒否され、
欄は 1 つの単位なので、空の欄も拒否されます。
`,b,1`、`a,,1`、テキストの終わりの `a,b,` です。
空白文字だけの欄は欄です。 [fixture: sankey/db-link-basic]
[fixture: sankey/gram-one-column] [fixture: sankey/gram-two-columns] [fixture:
sankey/gram-four-columns] [fixture: sankey/gram-trailing-comma] [fixture:
sankey/gram-quoted-then-trailing-comma] [fixture: sankey/gram-commas-only]
[fixture: sankey/gram-comma-only-line] [fixture:
sankey/gram-one-field-after-record] [fixture:
sankey/gram-short-line-after-record] [fixture: sankey/gram-empty-source]
[fixture: sankey/gram-empty-target] [fixture: sankey/gram-empty-value] [fixture:
sankey/db-spaces-only-source-id] [fixture:
sankey/db-spaces-only-source-id-first-record] [fixture:
sankey/db-spaces-only-target-id] [fixture: sankey/db-spaces-only-value]

### id と値

最初の 2 つの欄は source と target のノードの id で、
3 つ目の欄はリンクの値です。
どの記録もリンクです。
引用符なしの欄は両端の空白なしで読まれるので、
空白文字だけの欄は空のテキストの欄です。
文字列は、`""` と改行を書かれたとおりに含め、
引用符の間のテキストとして読まれます（[ast/sankey.ja.md](../ast/sankey.ja.md)
を参照）。
値はどのテキストでもかまいません。
文法は数を求めないので、`abc` と空白文字だけの欄も値として受理されます。
mermaid.js が id、ノード、値を Db にどう読むか、
この図種に文のないフロントマターのタイトルをどう読むかは、
tests パッケージの要約にあります。 [fixture: sankey/db-fields-trimmed]
[fixture: sankey/db-spaces-only-source-id]
[fixture: sankey/db-quoted-doubled-quote] [fixture: sankey/db-quoted-line-feed]
[fixture: sankey/db-quoted-and-unquoted-same-id]
[fixture: sankey/db-value-not-a-number] [fixture: sankey/db-spaces-only-value]
[fixture: sankey/db-title-frontmatter]

### 文法の外の拒否

ありません。
mermaid.js の Db は、その文法が受理するどの入力でも例外を投げません。
[`findOrCreateNode()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L48-L58)
と、
[`addLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sankey/sankeyDB.ts#L40-L42)
は、テキストを持つだけで、空の id、数でない値、繰り返すリンクは受理されます。
[fixture: sankey/db-spaces-only-source-id]
[fixture: sankey/db-value-not-a-number] [fixture: sankey/db-duplicate-link]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  ヘッダーのキーワードの中のディレクティブは、この仕様では入力を拒否させ、
  mermaid.js は受理します（[単位の中のディレクティブ](#単位の中のディレクティブ)
  を参照）。
  `san%%{init: {}}%%key` と `sankey-%%{init: {}}%%beta` です。 [fixture:
  sankey/div-directive-in-header-keyword] [fixture:
  sankey/div-directive-in-beta-header-keyword]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこか、引用符つきでもなくても欄の中の `C4Container`、
  `C4Component`、`C4Dynamic`、`C4Deployment` は、
  mermaid.js にテキストを C4 の構文解析器へ渡させ、それが拒否します。
  ここではテキストは sankey の図です。
  `C4Context` はどちらでもテキストです。
  [fixture: sankey/div-c4-keyword-in-target]
  [fixture: sankey/div-c4-keyword-in-quoted-source] [fixture:
  sankey/lex-c4context-in-field]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、`%%` だけの行、ディレクティブではない `%%{ }%%` の行、
  そうした行の後の空白だけの行は、ここではコメントか何もないもので、
  mermaid.js は入力を拒否します。
  その字句解析器が `%%` をヘッダーの前の欄として読むからです。
  [fixture: sankey/header-after-bare-percent-line]
  [fixture: sankey/header-after-empty-braces-line]
  [fixture: sankey/header-after-bare-percent-line-and-whitespace-line]
  [検出](#検出) を参照してください。
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、
  欄 `x b="c">d` は mermaid.js では `x b='c'>d` で受理されます。
  ここではフロントマターでタグを探さないので、 `"` は引用符なしの欄に残り、
  入力は拒否されます。
  フロントマターがなければ、`<a b="c">d` のようにテキストで始まるタグは、
  どちらも同じに読みます。 [fixture:
  sankey/div-html-tag-starts-in-frontmatter-field] [fixture:
  sankey/lex-html-tag-in-unquoted-field]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.js は拒否します。 [fixture: sankey/div-frontmatter-invalid-yaml]

既知の差異
[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)、
[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)、
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md)、
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.ja.md)、
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md) は、
この図種には場合がありません。
ヘッダーの行には何も続けられないので、キーワードの中に無視される `;` は入らず、
字句解析器はコメントを読まず、
空の文字列はどちらでも欄ではないからです（[文字列](#文字列) を参照）。

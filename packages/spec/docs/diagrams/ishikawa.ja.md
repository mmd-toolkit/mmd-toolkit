# Ishikawa

英語版: [ishikawa.md](./ishikawa.md)

mermaid.js の正解の出典:

- [`ishikawa.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/ishikawa/parser/ishikawa.jison#L1-L56)
- [`ishikawaDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/ishikawa/ishikawaDb.ts#L20-L96)
- [`ishikawaDetector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/ishikawa/ishikawaDetector.ts#L7-L11)

図種 `ishikawa` の仕様です。
木は [ast/ishikawa.md](../ast/ishikawa.ja.md)、
受理した値から Db を読む規則は
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#ishikawa)
に定めます。

## 検出

共通の先頭の空白類の後で、
大文字小文字を区別せず `ishikawa` または `ishikawa-beta` から始まる入力には、
[detection.md](../detection.ja.md) の項番 30 を適用します。
`ishikawa` の直後が ASCII の英字、数字、`_` なら検出せず、
非 ASCII の文字なら検出します。 [fixture: ishikawa/header-uppercase]
[fixture: ishikawa/header-beta-mixed-case]
[fixture: ishikawa/header-before-comments]
[fixture: ishikawa/header-before-spaces]
[fixture: ishikawa/header-letter-suffix] [fixture: ishikawa/header-digit-suffix]
[fixture: ishikawa/header-underscore-suffix]
[fixture: ishikawa/header-nonascii-suffix]
[fixture: ishikawa/lex-header-kelvin-boundary]
[fixture: ishikawa/lex-header-dotted-i-boundary]
[fixture: ishikawa/detect-kelvin-in-header]

先行する `#`、単独の `%`、`;`、通常のテキストは、先頭の空白類ではありません。
frontmatter と directive には共通規則を適用します。
C4 による検出の上書きは「既知の差異」に記します。
[fixture: ishikawa/header-before-hash] [fixture: ishikawa/header-before-percent]
[fixture: ishikawa/header-before-semicolon]
[fixture: ishikawa/header-before-text] [fixture: ishikawa/frontmatter-config]
[fixture: ishikawa/directive-before-header]

## 字句構造

字句規則は[変換後の図のテキスト](../common.ja.md#ソースの読み方)を読みます。
CR と CRLF は LF と同じく 1 つの改行です。
木の値には、引用符と実体参照を含む書かれた綴りを保ちます。
[fixture: ishikawa/lex-cr-lines] [fixture: ishikawa/lex-crlf-lines]
[fixture: ishikawa/lex-quoted-cr] [fixture: ishikawa/lex-quoted-crlf]
[fixture: ishikawa/header-root-inline-html]
[fixture: ishikawa/header-root-inline-entity]
[fixture: ishikawa/lex-entity-directive-in-node-text]
[fixture: ishikawa/lex-html-tag-starts-in-comment-line]
[fixture: ishikawa/lex-html-tag-crosses-directive]
[fixture: ishikawa/lex-html-tag-ends-in-comment-line]

### 単位と文脈

文脈は 1 つです。
各位置で以下の最初に合う規則を読み、その次の位置から再び試します。
より長いテキストの一致を優先しません。
共通の空白類と以下の空行規則を全体に適用します。
[fixture: ishikawa/header-beta-letter-suffix]
[fixture: ishikawa/header-indented-second]
[fixture: ishikawa/lex-header-word-child]
[fixture: ishikawa/lex-header-middle-label]
[fixture: ishikawa/div-header-blank-node]

1. 0 個以上の空白文字に続く `%%` は図のコメントを始めます。
   本文は、改行、 U+2028、U+2029、テキストの終わりまでを最大限読みます。
   印の前の空白は空白類です。 [fixture: ishikawa/header-before-bare-pair]
   [fixture: ishikawa/gram-preserved-comment-after-root]
   [fixture: ishikawa/comment-preserved-u2028]
   [fixture: ishikawa/comment-preserved-u2029]
   [fixture: ishikawa/comment-only-eof]

2. 大文字小文字を区別せず、`ishikawa-beta`、
   次に `ishikawa` を `header` と読みます。
   直後に単語文字を許しません。
   beta の形を先に試すため、`ishikawa-betaX`、`ishikawa-beta1`、
   `ishikawa-beta_` は通常の見出しと `-beta` から始まるテキストです。
   `ishikawa-beta-x` は beta の見出しと `-x` から始まるテキストです。
   [fixture: ishikawa/header-uppercase]
   [fixture: ishikawa/header-beta-mixed-case]
   [fixture: ishikawa/header-beta-letter-suffix]
   [fixture: ishikawa/header-beta-digit-suffix]
   [fixture: ishikawa/header-beta-underscore-suffix]
   [fixture: ishikawa/header-beta-dash-suffix]
   [fixture: ishikawa/lex-directive-before-beta-fallback-text]
   [fixture: ishikawa/lex-directive-in-beta-fallback-text]
   [fixture: ishikawa/lex-kelvin-node-text]
   [fixture: ishikawa/lex-long-s-node-text]
   [fixture: ishikawa/lex-header-kelvin-boundary]
   [fixture: ishikawa/lex-header-dotted-i-boundary]

見出しには、`-`、`:`、`#`、`%`、`{`、
`"` などの句読記号や非 ASCII の文字を隣接できます。
後続の `header` は、字下げがあっても非 ASCII の文字が続いても文法で拒否します。
[fixture: ishikawa/header-dash-suffix] [fixture: ishikawa/header-colon-root]
[fixture: ishikawa/header-hash-root] [fixture: ishikawa/header-percent-root]
[fixture: ishikawa/header-brace-root]
[fixture: ishikawa/header-quoted-root-glued]
[fixture: ishikawa/header-nonascii-suffix] [fixture: ishikawa/header-twice]
[fixture: ishikawa/header-beta-twice] [fixture: ishikawa/header-indented-second]
[fixture: ishikawa/lex-header-nonascii-child]
[fixture: ishikawa/lex-beta-nonascii-child]
[fixture: ishikawa/gram-header-second-on-line]
[fixture: ishikawa/gram-header-second-beta-prefix]
[fixture: ishikawa/header-beta-colon-root]
[fixture: ishikawa/gram-header-ls-second-header]
[fixture: ishikawa/gram-comment-ls-second-header]
[fixture: ishikawa/gram-second-header-eof]
[fixture: ishikawa/gram-second-beta-header-eof]
[fixture: ishikawa/gram-second-header-cut-eof]

3. 改行を `newline` と読みます。
   空の行と空白だけの行は「[空行](#空行)」の空白類です。
   [fixture: ishikawa/lex-cr-lines] [fixture: ishikawa/lex-crlf-lines]
   [fixture: ishikawa/gram-between-empty-line]
   [fixture: ishikawa/gram-between-spaces-line]
   [fixture: ishikawa/div-header-blank-node]

4. 節点のテキストの前の、空でない行内空白の列が `indentation` です。
   「[記法](../common.ja.md#表記)」の空白集合を用い、タブ、VT、FF、U+00A0、
   U+1680、U+2000–U+200A、U+2028、U+2029、U+202F、U+205F、U+3000、
   U+FEFF を含みます。 [fixture: ishikawa/lex-space-positions]
   [fixture: ishikawa/lex-tab-positions] [fixture: ishikawa/lex-vt-positions]
   [fixture: ishikawa/lex-ff-positions] [fixture: ishikawa/lex-nbsp-positions]
   [fixture: ishikawa/lex-ogham-positions]
   [fixture: ishikawa/lex-en-quad-positions]
   [fixture: ishikawa/lex-em-quad-positions]
   [fixture: ishikawa/lex-en-space-positions]
   [fixture: ishikawa/lex-em-space-positions]
   [fixture: ishikawa/lex-three-per-em-positions]
   [fixture: ishikawa/lex-four-per-em-positions]
   [fixture: ishikawa/lex-six-per-em-positions]
   [fixture: ishikawa/lex-figure-space-positions]
   [fixture: ishikawa/lex-punctuation-space-positions]
   [fixture: ishikawa/lex-thin-space-positions]
   [fixture: ishikawa/lex-hair-space-positions]
   [fixture: ishikawa/lex-u2028-indent] [fixture: ishikawa/lex-u2029-indent]
   [fixture: ishikawa/lex-narrow-nbsp-positions]
   [fixture: ishikawa/lex-medium-math-space-positions]
   [fixture: ishikawa/lex-ideographic-positions]
   [fixture: ishikawa/lex-bom-positions]

U+2028 または U+2029 だけの物理行は空行です。
[fixture: ishikawa/lex-ls-only-line] [fixture: ishikawa/lex-ps-only-line]
[fixture: ishikawa/div-header-ls-line-node]
[fixture: ishikawa/div-header-ps-line-node]

5. `node-text` は、改行以外の 1 個以上の文字を最大限読みます。
   内部の空白、 U+2028 と U+2029、句読記号、引用符、バッククォート、
   バックスラッシュ、NUL、 U+0085、U+200B を含みます。
   U+0085 と U+200B は先頭でも字下げではなくテキストです。
   引用文字列の文脈やエスケープ構文はありません。
   [fixture: ishikawa/gram-spaces-inside-text]
   [fixture: ishikawa/lex-u2028-in-root] [fixture: ishikawa/lex-u2029-in-child]
   [fixture: ishikawa/lex-text-punctuation] [fixture: ishikawa/lex-nul-in-text]
   [fixture: ishikawa/lex-nel-label] [fixture: ishikawa/lex-nel-only-line]
   [fixture: ishikawa/lex-zero-width-label]
   [fixture: ishikawa/gram-root-unclosed-quote]

`node-text` が始まった後の見出しの綴り、`%%`、選ばれていない `;` は、
テキストの一部です。
`ishikawa` の前に引用符や句読記号があれば、残り全体がテキストです。
[fixture: ishikawa/lex-header-middle-label]
[fixture: ishikawa/lex-header-quoted-label]
[fixture: ishikawa/lex-header-in-parentheses]
[fixture: ishikawa/comment-root-inline-glued]
[fixture: ishikawa/comment-child-inline-spaced]
[fixture: ishikawa/gram-after-child-semicolon]
[fixture: ishikawa/lex-semicolon-before-header-text]

テキストは EOF やコロンの後も含め、末尾の空白を保ちます。
[fixture: ishikawa/gram-root-trailing-space]
[fixture: ishikawa/gram-child-trailing-space]
[fixture: ishikawa/lex-trailing-ls-ps-whitespace]
[fixture: ishikawa/lex-trailing-whitespace-eof]
[fixture: ishikawa/gram-after-root-colon-space]
[fixture: ishikawa/gram-after-child-colon-space]

### コメント

この規則の前に、共通の[コメント領域](../common.ja.md#コメント行)を除きます。
U+2028 や U+2029 の後の物理行の残りと改行を除くことがあり、
その次の物理行が同じ節点の続きになります。
単位の境界にある単独の `%%` と `%%{}%%` は図のコメントです。
節点のテキストが始まった後では、
引用されたようなテキストでも `%%` を文字どおり保ちます。
[fixture: ishikawa/comment-u2028] [fixture: ishikawa/comment-u2029]
[fixture: ishikawa/comment-ls-region-in-text]
[fixture: ishikawa/comment-ls-region-end-of-text]
[fixture: ishikawa/gram-preserved-comment-after-child]
[fixture: ishikawa/header-bare-percent-eof]
[fixture: ishikawa/comment-ps-bare-in-text]
[fixture: ishikawa/comment-quoted-root-inline]
[fixture: ishikawa/comment-quoted-child-inline]
[fixture: ishikawa/lex-node-text-ps-comment-region]
[fixture: ishikawa/lex-style-rule-comment-region-in-text]
[fixture: ishikawa/lex-indent-comment-region-ls]
[fixture: ishikawa/lex-indent-comment-region-ps]

図のコメントの印は `%%`、値はその後の本文です。
末尾の改行や区切りは含まず、 `%%{}%%` の本文は `{}%%` です。
共通規則に従い、 2 個の `%` の間や通常のテキストに directive を置けます。
`#` と単独の `%` はコメントを始めません。
[fixture: ishikawa/gram-preserved-comment-after-root]
[fixture: ishikawa/comment-directive-between-marks]
[fixture: ishikawa/directive-in-inline-percent-text]
[fixture: ishikawa/comment-hash] [fixture: ishikawa/comment-single-percent]
[fixture: ishikawa/lex-directive-before-diagram-comment-ls]
[fixture: ishikawa/div-header-comment-directive-value-ps]
[fixture: ishikawa/div-header-comment-directive-marker-ls]
[fixture: ishikawa/div-header-comment-multiline-directive-ls]

図のコメントが U+2028 や U+2029 で終わった後は、その区切りから規則を再開します。
節点が続くと、区切りとその後の空白を字下げに数えます。
一方、共通のコメント領域は領域全体を除きます。
[fixture: ishikawa/comment-preserved-u2028]
[fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/db-comment-ls-indent-below-first-cause]
[fixture: ishikawa/comment-u2028] [fixture: ishikawa/comment-u2029]
[fixture: ishikawa/div-header-comment-ls-node]
[fixture: ishikawa/div-header-comment-ps-node]
[fixture: ishikawa/div-header-inline-comment-ls-node]
[fixture: ishikawa/div-header-inline-comment-ps-node]
[fixture: ishikawa/lex-directive-before-diagram-comment-ls]
[fixture: ishikawa/div-header-comment-directive-value-ps]
[fixture: ishikawa/div-header-comment-directive-marker-ls]
[fixture: ishikawa/lex-comment-ps-indent-excludes-body-padding]
[fixture: ishikawa/lex-indent-comment-region-ls]
[fixture: ishikawa/lex-indent-comment-region-ps]
[fixture: ishikawa/header-comment-ps-whitespace-eof]

### Directive

共通の [directive](../common.ja.md#ディレクティブ) を見出しの前後、字下げ、
節点のテキスト内に置けます。
directive の内容はテキストにも字下げにも含めません。
テキスト内では前後を空白を加えずにつなぐため、
複数行の directive は物理行を 1 つの節点につなぐことがあります。
[fixture: ishikawa/directive-before-header]
[fixture: ishikawa/directive-before-header-glued]
[fixture: ishikawa/directive-header-line-root]
[fixture: ishikawa/directive-in-indent]
[fixture: ishikawa/db-indent-around-directives]
[fixture: ishikawa/directive-root-middle]
[fixture: ishikawa/directive-child-middle]
[fixture: ishikawa/directive-in-quoted-root]
[fixture: ishikawa/directive-multiline-joins-node-text]
[fixture: ishikawa/directive-cr-lf-separated-node]
[fixture: ishikawa/lex-entity-directive-in-node-text]
[fixture: ishikawa/lex-html-tag-crosses-directive]
[fixture: ishikawa/lex-style-rule-directive-in-trigger]
[fixture: ishikawa/lex-indent-multiline-directive]
[fixture: ishikawa/lex-header-indent-multiline-directive]
[fixture: ishikawa/div-header-padding-multiline-directive-text]

閉じていない directive は共通規則に従って引数やテキストの終わりまでを読み、
節点の引用符では閉じません。
directive を始めない `%%{` でも図のコメントを始めます。
[fixture: ishikawa/directive-open-root-eof]
[fixture: ishikawa/directive-open-word-argument]
[fixture: ishikawa/directive-open-root-quoted]
[fixture: ishikawa/comment-unclosed-percent-brace]
[fixture: ishikawa/header-before-empty-braces]

順序つきの単位規則で見出しとして選ばれたキーワードを、
directive で分断できません。
完全な beta の見出しの `-beta` の直前も同じです。
これは
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md)
です。 [fixture: ishikawa/directive-in-header]
[fixture: ishikawa/directive-in-beta-header]
[fixture: ishikawa/div-directive-beta-prefix]

beta の境界が合わなければ、通常の見出しが選ばれ、接尾部は節点のテキストです。
`-betaX` の前や中にある directive は許します。
数に見える散文も節点のテキストなので、 `1`、directive、
`2` も 1 つのテキストの値として許します。
[fixture: ishikawa/lex-directive-before-beta-fallback-text]
[fixture: ishikawa/lex-directive-in-beta-fallback-text]
[fixture: ishikawa/lex-directive-in-numeric-looking-text]

節点のテキスト内でつながった見出しの綴りはテキストのままですが、
新しい単位の境界では 2 つ目の見出しとして拒否します。
[fixture: ishikawa/lex-directive-inside-quoted-header-text]
[fixture: ishikawa/gram-directive-joins-second-header]

### フロントマター

[フロントマター](../common.ja.md#フロントマター)は、ソースの先頭で、
コメント行と図の見出しより前にだけ認識します。
開始行と終了行の字下げは共通規則に従い、CRLF も許します。
見出しの後の `---` やタイトルに見える行は、通常の節点のテキストです。
[fixture: ishikawa/frontmatter-indented] [fixture: ishikawa/frontmatter-crlf]
[fixture: ishikawa/frontmatter-after-comment]
[fixture: ishikawa/frontmatter-after-header]

### 共通の行規則

共通の
[`style` と `classDef` の行規則](../common.ja.md#style-行と-classdef-行)を、
引用符の内側にも適用します。
選ばれた `;` は節点のテキスト内で無視し、独立した文にはしません。
セミコロンが 2 個や 3 個でも、他の書かれたテキストと末尾の空白は保ちます。
[fixture: ishikawa/lex-root-style-semicolon]
[fixture: ishikawa/lex-root-style-semicolon-padding]
[fixture: ishikawa/lex-root-style-two-semicolons]
[fixture: ishikawa/lex-root-style-two-semicolons-padding]
[fixture: ishikawa/lex-root-style-three-semicolons]
[fixture: ishikawa/lex-root-style-three-semicolons-padding]
[fixture: ishikawa/lex-child-classdef-semicolon]
[fixture: ishikawa/lex-style-and-classdef-semicolons]
[fixture: ishikawa/lex-style-quoted-semicolon]

他のセミコロンはテキストであり、節点を区切りません。
[fixture: ishikawa/lex-style-uppercase-semicolon]
[fixture: ishikawa/lex-style-no-hash-semicolon]
[fixture: ishikawa/lex-style-colon-space-semicolon]
[fixture: ishikawa/lex-style-semicolon-other-line]
[fixture: ishikawa/gram-after-root-semicolon]
[fixture: ishikawa/gram-after-root-spaced-semicolon]
[fixture: ishikawa/gram-after-root-two-semicolons]
[fixture: ishikawa/gram-after-root-spaced-semicolons]
[fixture: ishikawa/gram-after-child-semicolon]
[fixture: ishikawa/gram-after-child-spaced-semicolon]
[fixture: ishikawa/gram-after-child-two-semicolons]
[fixture: ishikawa/gram-after-child-spaced-semicolons]
[fixture: ishikawa/gram-semicolon-line]

directive が行規則の条件の綴りを分断しても、節点のテキストは終わりません。
U+2028 と U+2029 は行規則の区間を終えますが、
節点のテキストは共通のコメント領域をまたぐ場合も含めて続きます。
[fixture: ishikawa/lex-style-semicolon-before-directive]
[fixture: ishikawa/lex-style-rule-directive-in-trigger]
[fixture: ishikawa/lex-style-rule-ls-segment]
[fixture: ishikawa/lex-style-rule-ps-segment]
[fixture: ishikawa/lex-style-rule-comment-region-in-text]

行規則で節点内の見出しの綴りがつながっても、テキストのままです。
もともと `;` を含む見出しの検出は修復しません。
このテキスト単位に、追加のセミコロン境界の差異はありません。
[fixture: ishikawa/lex-header-ignored-semicolon-in-text]
[fixture: ishikawa/detect-semicolon-in-header]

## 文法

文法は共通の[記法](../common.ja.md#表記)を用います。
先頭の空白類、directive、コメント、空行は前述のとおり許します。
それらを除いた後の節点の行同士は `newline` で区切ります。
コメントを終える U+2028 や U+2029 でも、前述のとおり節点の行を始められます。
[fixture: ishikawa/header-before-comments]
[fixture: ishikawa/directive-before-header]
[fixture: ishikawa/gram-between-empty-line]
[fixture: ishikawa/gram-root-and-child-one-line]
[fixture: ishikawa/directive-multiline-joins-node-text]
[fixture: ishikawa/comment-preserved-u2028]
[fixture: ishikawa/comment-preserved-u2029]

```text
diagram = header node? (newline node?)*
node = indentation? node-text
```

| 規則      | ノード                                       |
| --------- | -------------------------------------------- |
| `diagram` | IshikawaDiagram                              |
| `node`    | IshikawaNode。`node-text` は IshikawaLiteral |

見出しの後に、
除かれる directive と追加の LF 以外が何もなくソースが終わる入力は拒否します。
ソースの改行、空白、図のコメント、節点のテキストは続けられます。
節点のない図の `root` は null です。 [fixture: ishikawa/header-only]
[fixture: ishikawa/header-beta-only]
[fixture: ishikawa/header-directive-only-eof] [fixture: ishikawa/header-only-lf]
[fixture: ishikawa/header-cr-only] [fixture: ishikawa/header-crlf-only]
[fixture: ishikawa/header-spaces-eof] [fixture: ishikawa/header-tab-eof]
[fixture: ishikawa/header-vt-eof] [fixture: ishikawa/header-ff-eof]
[fixture: ishikawa/header-u2028-only] [fixture: ishikawa/header-u2029-only]
[fixture: ishikawa/header-bare-percent-eof]
[fixture: ishikawa/header-glued-comment-eof]
[fixture: ishikawa/header-lf-directive-eof]
[fixture: ishikawa/header-same-line-root] [fixture: ishikawa/gram-root-eof]
[fixture: ishikawa/gram-initial-header-cut-eof]
[fixture: ishikawa/gram-initial-beta-cut-eof]
[fixture: ishikawa/header-comment-ps-whitespace-eof]

最後の節点にソースの末尾の改行は不要です。 [fixture: ishikawa/gram-root-eof]
[fixture: ishikawa/comment-child-inline-eof]
[fixture: ishikawa/directive-closed-child-eof]
[fixture: ishikawa/directive-open-child-eof]

節点は空でないテキストであり、宣言や参照ではありません。
繰り返しも別の節点として保ちます。
数、プロトタイプのプロパティ名、`title`、 `accTitle:`、`accDescr:`、
`accDescr {}` は通常のテキストであり、
タイトル文やアクセシビリティ文の構文はありません。
[fixture: ishikawa/db-three-definitions] [fixture: ishikawa/db-number-labels]
[fixture: ishikawa/db-prototype-labels]
[fixture: ishikawa/db-title-line-is-node]
[fixture: ishikawa/db-acctitle-is-node] [fixture: ishikawa/db-accdescr-is-node]
[fixture: ishikawa/db-accdescr-empty-keeps-node]
[fixture: ishikawa/db-empty-descr-root]

引用符、空の文字列、空のバッククォート、括弧、呼び出し、
`@{...}` に特別な構文はありません。
閉じ引用符や閉じ波括弧がなくても、文字どおりのテキストです。
引用されたようなテキストの中の改行は別の節点を始めます。
節点の間の空の括弧も空白類ではなく節点です。
[fixture: ishikawa/gram-empty-quotes]
[fixture: ishikawa/gram-empty-backticks-text]
[fixture: ishikawa/gram-empty-brackets]
[fixture: ishikawa/gram-empty-calls-and-strings-text]
[fixture: ishikawa/db-empty-brackets-child]
[fixture: ishikawa/db-data-block-is-text]
[fixture: ishikawa/gram-child-unclosed-brace]
[fixture: ishikawa/gram-root-unclosed-quote] [fixture: ishikawa/lex-quoted-crlf]
[fixture: ishikawa/gram-blank-multiline-quotes]

### 字下げと親

最初の節点が根です。
根以外の節点を原因と呼びます。
次の節点があれば、それが最初の原因であり、根の子です。
根の字下げは、どの親の決定にも使いません。
[fixture: ishikawa/db-indent-first-cause]
[fixture: ishikawa/db-indent-root-deeper]
[fixture: ishikawa/db-indent-root-shallower]
[fixture: ishikawa/spec-ishikawa-c5953a5f]

それ以後の節点は、字下げが最初の原因の字下げ以下なら根の子です。
それ以外は、先行する原因のうち字下げが厳密に小さい最も近いものの子です。
直前の原因と同じ字下げの節点はその兄弟になります。
字下げの幅が以前と同じである必要も、幅の飛びの間に節点を置く必要もありません。
[fixture: ishikawa/db-indent-clamped]
[fixture: ishikawa/db-indent-clamp-below-base]
[fixture: ishikawa/db-indent-relative-zero]
[fixture: ishikawa/db-indent-unindented-siblings]
[fixture: ishikawa/db-indent-jump] [fixture: ishikawa/db-indent-pop-several]
[fixture: ishikawa/db-indent-nearest-smaller-cause]

字下げは非負整数で、タブも含めて行内空白の文字を 1 つずつ数えます。
見出しの行では見出しと節点のテキストの間の空白だけを数えます。
directive は除きます。
コメントを終える U+2028 や U+2029 は、その後の字下げと一緒に数えます。
[fixture: ishikawa/db-indent-tab-character]
[fixture: ishikawa/db-indent-mixed-tab-space]
[fixture: ishikawa/db-indent-equal-mixed-whitespace]
[fixture: ishikawa/header-same-line-root]
[fixture: ishikawa/gram-header-tab-root]
[fixture: ishikawa/gram-header-u2028-root]
[fixture: ishikawa/gram-header-u2029-root]
[fixture: ishikawa/db-indent-around-directives]
[fixture: ishikawa/comment-preserved-u2028]
[fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/db-comment-ls-indent-below-first-cause]
[fixture: ishikawa/lex-indent-multiline-directive]
[fixture: ishikawa/lex-header-indent-multiline-directive]
[fixture: ishikawa/lex-indent-comment-region-ls]
[fixture: ishikawa/lex-indent-comment-region-ps]
[fixture: ishikawa/lex-comment-ps-indent-excludes-body-padding]

### 空行

見出しの後では、最初の節点の前、節点の間、末尾のどこでも、空の行、空白だけの行、
共通のコメント行、図のコメントは受理にも親子にも影響しません。
directive だけの行は、それを除くと空行です。
後の行に節点がある見出しの末尾の空白も許します。
[fixture: ishikawa/div-header-blank-node]
[fixture: ishikawa/div-header-blank-indented-node]
[fixture: ishikawa/div-header-whitespace-indented-node]
[fixture: ishikawa/div-header-several-blank-node]
[fixture: ishikawa/div-header-spaces-line-node]
[fixture: ishikawa/div-header-ls-line-node]
[fixture: ishikawa/div-header-ps-line-node] [fixture: ishikawa/lex-ls-only-line]
[fixture: ishikawa/lex-ps-only-line]
[fixture: ishikawa/div-header-common-comment-blank-node]
[fixture: ishikawa/div-header-directive-blank-node]
[fixture: ishikawa/div-header-trailing-space-node]
[fixture: ishikawa/div-header-trailing-tab-node]
[fixture: ishikawa/div-header-trailing-nbsp-node]
[fixture: ishikawa/div-beta-header-trailing-space-node]
[fixture: ishikawa/div-header-space-directive-node]
[fixture: ishikawa/gram-between-empty-line]
[fixture: ishikawa/gram-between-spaces-line]
[fixture: ishikawa/gram-between-comment-line]
[fixture: ishikawa/gram-between-directive-line]
[fixture: ishikawa/gram-last-whitespace-line]
[fixture: ishikawa/db-indent-first-cause-after-blanks]
[fixture: ishikawa/gram-last-comment-blank-line]
[fixture: ishikawa/div-between-comment-directive-blank-node]
[fixture: ishikawa/div-header-two-comments-common-gap]
[fixture: ishikawa/div-between-comment-common-gap-blank-node]
[fixture: ishikawa/div-header-padding-multiline-directive-text]
[fixture: ishikawa/div-header-comment-multiline-directive-ls]

mermaid.js が空行と図のコメントを組み合わせる順だけで拒否する入力は、
[blank-line-after-header-or-comments](../known-divergences/blank-line-after-header-or-comments.ja.md)
です。
4 つの場合は、見出し後のコメントと空行、
見出し後のコメントを終える U+2028 または U+2029 と節点、節点間のコメントと空行、
節点間のコメントを終える U+2028 または U+2029 と節点です。
両者が受理する対照例の木は変わりません。
[fixture: ishikawa/div-header-two-comments-blank-node]
[fixture: ishikawa/div-header-comment-ls-node]
[fixture: ishikawa/div-header-comment-ps-node]
[fixture: ishikawa/div-between-comment-blank-node]
[fixture: ishikawa/div-between-comment-ls-blank-node]
[fixture: ishikawa/div-between-two-comments-ls-node]
[fixture: ishikawa/div-between-two-comments-ps-node]
[fixture: ishikawa/gram-header-comment-blank-node]
[fixture: ishikawa/gram-between-two-comments-blank-node]
[fixture: ishikawa/gram-header-comment-spaces-node]
[fixture: ishikawa/gram-header-two-comments-ls-node]
[fixture: ishikawa/gram-between-blank-comment-node]
[fixture: ishikawa/header-comment-ls-whitespace-eof]
[fixture: ishikawa/div-header-two-comments-blank-cr]
[fixture: ishikawa/div-header-two-comments-blank-crlf]
[fixture: ishikawa/div-header-two-comments-common-gap]
[fixture: ishikawa/div-header-inline-comment-ls-node]
[fixture: ishikawa/div-header-inline-comment-ps-node]
[fixture: ishikawa/div-between-comment-ps-blank-node]
[fixture: ishikawa/div-between-comment-blank-cr]
[fixture: ishikawa/div-between-comment-blank-crlf]
[fixture: ishikawa/div-between-comment-directive-blank-node]
[fixture: ishikawa/div-between-comment-common-gap-blank-node]
[fixture: ishikawa/gram-last-comment-blank-line]
[fixture: ishikawa/gram-header-two-comments-ps-node]

### 文法外の拒否

図に固有の追加の拒否はありません。
任意の字下げの幅、重複したテキスト、プロトタイプのプロパティ名を受理します。
frontmatter の境界には共通構文を適用し、空の区切り行の隣接や、
閉じていない frontmatter は拒否します。
正しく区切られた frontmatter の不正な内容は embedded-data-opaque に含みます。
[fixture: ishikawa/db-indent-jump] [fixture: ishikawa/db-three-definitions]
[fixture: ishikawa/db-prototype-labels] [fixture: ishikawa/frontmatter-empty]
[fixture: ishikawa/frontmatter-unclosed]
[fixture: ishikawa/frontmatter-malformed]

## 既知の差異

- **[blank-line-after-header-or-comments](../known-divergences/blank-line-after-header-or-comments.ja.md):**
  空行の直接の規則により、見出し末尾の空白とコメントの 4 つの場合を含め、
  mermaid.js が拒否する入力を受理します。
  [fixture: ishikawa/div-header-trailing-space-node]
  [fixture: ishikawa/div-header-two-comments-blank-node]
  [fixture: ishikawa/div-header-comment-ls-node]
  [fixture: ishikawa/div-header-comment-ps-node]
  [fixture: ishikawa/div-between-comment-blank-node]
  [fixture: ishikawa/div-between-two-comments-ls-node]
  [fixture: ishikawa/div-between-two-comments-ps-node]

- **[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md):**
  分断された見出しキーワードは拒否します。
  mermaid.js は前後をつなぎます。
  節点のテキスト内の directive は許します。
  [fixture: ishikawa/directive-in-header]
  [fixture: ishikawa/directive-in-beta-header]
  [fixture: ishikawa/div-directive-beta-prefix]
  [fixture: ishikawa/directive-root-middle]

- **[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.ja.md):**
  frontmatter 内で始まったタグによって節点の引用符を変換しません。
  どちらの形もテキストとして受理しますが、
  mermaid.js では属性の引用符が変わります。
  [fixture: ishikawa/div-frontmatter-open-tag-bare-node]
  [fixture: ishikawa/div-frontmatter-open-tag-quoted-node]
  [fixture: ishikawa/lex-quotes-without-frontmatter-tag]

- **[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md):**
  frontmatter と directive の内容は不透明です。
  正しく区切られた frontmatter の YAML が不正でも拒否しません。
  `@{...}` は埋め込みデータではなく通常の節点のテキストです。
  [fixture: ishikawa/frontmatter-malformed]
  [fixture: ishikawa/frontmatter-html-title]
  [fixture: ishikawa/directive-before-header]
  [fixture: ishikawa/db-data-block-is-text]

- **[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md):**
  節点のテキスト内の `C4Container`、 `C4Component`、`C4Dynamic`、
  `C4Deployment` で Ishikawa の見出しを上書きしません。
  その語が検出するテキストに残ると、mermaid.js は C4 を選んで拒否します。
  `C4Context` は上書きしません。
  除かれる共通のコメントや directive では上書きしません。
  行内の `%` のテキストは節点のテキストのままですが、
  検出でその接尾部を除くのは、物理行終端が続く場合だけです。
  EOF では、後に U+2028 や U+2029 だけがある形も含め、 C4 の語が検出に残るため、
  この差異になります。 [fixture: ishikawa/detect-c4-container-text]
  [fixture: ishikawa/detect-c4-component-root]
  [fixture: ishikawa/detect-c4-dynamic-quoted]
  [fixture: ishikawa/detect-c4-deployment-suffix]
  [fixture: ishikawa/detect-c4-context-text]
  [fixture: ishikawa/detect-c4-comment]
  [fixture: ishikawa/detect-c4-in-directive]
  [fixture: ishikawa/detect-inline-comment-c4-text]
  [fixture: ishikawa/detect-inline-comment-c4-cr]
  [fixture: ishikawa/div-c4-inline-percent-eof]
  [fixture: ishikawa/div-c4-inline-percent-ls-eof]
  [fixture: ishikawa/div-c4-inline-percent-ps-eof]

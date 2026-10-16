# Kanban

英語版: [kanban.md](./kanban.md)

mermaid.js の正となるソース：

- [`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison)
- [`kanbanDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts)
- [`detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/detector.ts#L6-L10)

この文書は図種 `kanban` を扱います。
木のノードは [ast/kanban.ja.md](../ast/kanban.ja.md) が定めます。
mermaid.js が列への所属とメタデータの効果をどう読むかは、
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#kanban)
にあります。

## 検出

[detection.ja.md](../detection.ja.md) の項目 8 は、
先頭の trivia の後が小文字の `kanban` で始まるとこの文法を選びます。
その後の境界は求めません。
[fixture: kanban/header-indented]
[fixture: kanban/header-after-blank-lines]
[fixture: kanban/header-dash-suffix]
[fixture: kanban/header-non-ascii-suffix]
`KANBAN`、`Kanban`、大文字小文字の混在は検出されません。
[fixture: kanban/header-upper-case]
[fixture: kanban/header-capitalized]
[fixture: kanban/header-mixed-case]
語、数字、下線の接尾部は検出後に文法が拒否します。
[fixture: kanban/header-word-suffix]
[fixture: kanban/header-digit-suffix]
[fixture: kanban/header-underscore-suffix]

ヘッダー前のフロントマター、ディレクティブ、コメント領域は共通規則に従います。
[fixture: kanban/header-after-frontmatter]
[fixture: kanban/header-after-frontmatter-and-comment]
[fixture: kanban/header-after-comment-line]
[fixture: kanban/header-after-directive-line]
先頭の `%%` だけの行と `%%{ }%%` の行は、
その後に空行があっても図のコメントです。
[fixture: kanban/header-after-bare-percent-line]
[fixture: kanban/header-after-empty-braces-line]
[fixture: kanban/header-header-percent-blank]
ヘッダー前の `#` の行と `;` の行は検出を妨げます。
[fixture: kanban/header-after-hash-line]
[fixture: kanban/header-after-semicolon-line]

字句解析器はキーワード `kanban` を大文字小文字を区別せず、
[語の文字](../common.ja.md#表記) が続かないときだけ読みます。
[fixture: kanban/lex-keyword-kanban-upper]
本文で単位が始まるところの 2 つ目のヘッダー語は拒否します。
[fixture: kanban/header-twice]
[fixture: kanban/header-twice-indented]
[fixture: kanban/header-twice-same-line]
`kanbanX`、`kanban2`、`kanban_`、`a.kanban` はノード本文です。
[fixture: kanban/lex-keyword-kanban-letter]
[fixture: kanban/lex-keyword-kanban-digit]
[fixture: kanban/lex-keyword-kanban-underscore]
[fixture: kanban/lex-keyword-kanban-dash]
[fixture: kanban/lex-keyword-kanban-non-ascii]
[fixture: kanban/lex-keyword-after-dot]

最初のノードはヘッダーと同じ行の空白の後に置けます。
[fixture: kanban/header-statement-on-header-line]
[fixture: kanban/header-statement-on-header-line-tab]
[fixture: kanban/header-spaced-word-suffix]
形か、`-`、`:`、`#`、`%`、引用符のような語の文字以外で始まるノードは、
ヘッダーの直後にも置けます。
[fixture: kanban/header-shape-on-header-line]
[fixture: kanban/header-dash-suffix]
[fixture: kanban/db-grid-colon-header-line]
[fixture: kanban/db-grid-hash-header-line]
[fixture: kanban/db-grid-percent-header-line]
[fixture: kanban/header-header-quote]
単独の `{` は開きではなく拒否します。
[fixture: kanban/gram-grid-open-brace-header-line]

ヘッダーの後に除かれるディレクティブと追加される改行しかなければ拒否します。
[fixture: kanban/header-only]
[fixture: kanban/header-header-directive-only]
ソースの改行、空白、図のコメント、最初のノードはヘッダーの後に置けます。
ノードのない図は空の body を持ちます。
[fixture: kanban/header-only-lf]
[fixture: kanban/db-empty-board-comment]
[fixture: kanban/db-empty-board-whitespace]
[fixture: kanban/header-header-space-only]
[fixture: kanban/header-header-comment-only-reference]
[fixture: kanban/header-header-space-directive-only]

## 字句構造

字句解析器は [図のテキスト](../common.ja.md#ソースの読み方) を、
変換後の形で読みます。
CRLF と単独の CR は改行です。
[fixture: kanban/lex-crlf-quoted-value]
[fixture: kanban/lex-cr-quoted-value]
属性の引用符は単一引用符です。
[fixture: kanban/db-grid-html-attribute-item-label-quoted]
文字参照はプレースホルダーです。
[fixture: kanban/db-grid-entity-item-label-quoted]
[fixture: kanban/db-grid-entity-named-item-label-bare]
木の値は書かれたテキストを保ちます。
[fixture: kanban/lex-string-crlf]

共通の [コメント領域](../common.ja.md#コメント行) は、
複数行のラベルやデータブロックの中でも trivia です。
[fixture: kanban/lex-comment-quoted-line]
[fixture: kanban/db-metadata-comment-line]
ノード本文、形のラベル、class 本文の途中の `%%` はそのテキストの一部です。
[fixture: kanban/lex-comment-quoted-inline]
[fixture: kanban/db-grid-comment-item-id]
[fixture: kanban/db-grid-comment-item-label-bare]
[fixture: kanban/db-grid-comment-item-class]

共通規則は埋め込みデータを解析しません。
[fixture: kanban/gram-frontmatter-invalid-yaml]
[fixture: kanban/gram-metadata-bad-yaml]
HTML タグはフロントマターの後だけで探します。
フロントマターで始まるタグは図のテキストの属性引用符を変換しません。
[fixture: kanban/div-frontmatter-open-tag]
[fixture: kanban/gram-frontmatter-no-tag-reference]

kanban ヘッダー後の C4 の語は
[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.ja.md) に従い、
kanban の位置で読みます。
[fixture: kanban/lex-c4-c4container-id]
[fixture: kanban/lex-c4-c4component-label]
[fixture: kanban/lex-c4-c4dynamic-metadata]
[fixture: kanban/lex-c4-c4deployment-id]
除かれるコメントとフロントマターの語は検出に関わりません。
[fixture: kanban/lex-c4-c4container-comment]
[fixture: kanban/lex-c4-c4container-frontmatter]
ヘッダー後の `C4Context` は両者で通常のテキストです。
[fixture: kanban/lex-c4-c4context-id]

### 単位と文脈

字句解析器は図のテキストを**単位**に分けます。
文法は各単位の名前を使います。
単位のテキストは変換後の形で読んだ文字です。
[fixture: kanban/db-decoration-inline]
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-grid-keyword-classdef-item-id]
[fixture: kanban/db-grid-comment-item-id]
[fixture: kanban/lex-keyword-after-dot]
字句解析器は文の文脈から始めます。
文脈を出ると前の文脈に戻ります。
[fixture: kanban/db-shape-square]
[fixture: kanban/db-metadata-all]

字句解析器は各位置で現在の文脈の最初に合う規則を適用します。
合う規則がなければ入力を拒否します。
テキストの単位は規則が許す限り長く読みます。
ノード本文の中のキーワードと装飾の印はそのテキストの一部です。
[fixture: kanban/db-decoration-inline]
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-grid-keyword-classdef-item-id]
[fixture: kanban/db-grid-comment-item-id]
[fixture: kanban/lex-keyword-after-dot]

値の外の空白は単位を隔てます。
字下げは改行以外の空白文字を各 1 文字と数えます。
タブ、改ページ、垂直タブ、U+FEFF、U+00A0、U+3000、U+2028、U+2029 を含みます。
[fixture: kanban/db-indent-tabs]
[fixture: kanban/lex-tab-line-start]
[fixture: kanban/lex-bom-line-start]
[fixture: kanban/lex-nbsp-line-start]
[fixture: kanban/lex-ideographic-line-start]
[fixture: kanban/lex-ls-line-start]
[fixture: kanban/lex-ps-line-start]
[fixture: kanban/header-ff-after]
[fixture: kanban/header-vt-after]
[fixture: kanban/lex-indent-directive]
U+0085 は空白ではありません。
[fixture: kanban/header-nel-after]

ノード本文、形の本文、文字列、icon、
データ本文の U+2028 と U+2029 は値の文字です。
文を終えません。
[fixture: kanban/lex-ls-bare-value]
[fixture: kanban/lex-ps-bare-value]
[fixture: kanban/lex-ls-quoted-value]
[fixture: kanban/lex-ps-quoted-value]
[fixture: kanban/db-grid-ls-item-icon]
[fixture: kanban/db-grid-ps-item-icon]
[fixture: kanban/db-grid-ls-metadata-label-quoted]
[fixture: kanban/lex-shape-bare-ls]
[fixture: kanban/db-grid-ps-metadata-label-quoted]

字下げはディレクティブを除いたテキストで測ります。
[fixture: kanban/lex-indent-directive]
ヘッダー行のノードではヘッダーの後の空白です。
[fixture: kanban/header-statement-on-header-line]
[fixture: kanban/header-statement-on-header-line-tab]
図のコメントを終える U+2028 と U+2029 の後では、
その区切り文字から字下げが始まります。
[fixture: kanban/lex-node-comment-ls]
[fixture: kanban/div-header-comment-ps-node]

### 単位の中のディレクティブ

テキストの単位は `node-text`、`shape-text`、`icon-text`、`class-text`、
データ本文です。
文字列の単位は `string` と `markdown-string` です。
これらの単位の中のディレクティブは trivia です。
残りのテキストは両側の空白を含めて読みを保ちます。
[fixture: kanban/db-grid-directive-item-id]
[fixture: kanban/lex-id-directive-start]
[fixture: kanban/lex-id-directive-end]
[fixture: kanban/lex-label-directive-line]
[fixture: kanban/db-grid-directive-item-icon]
[fixture: kanban/db-grid-directive-item-class]
[fixture: kanban/db-grid-directive-metadata-key]
[fixture: kanban/db-metadata-directive]
[fixture: kanban/lex-indent-directive]
[fixture: kanban/db-grid-directive-item-label-bare]
[fixture: kanban/db-grid-directive-item-label-markdown]

ヘッダー語、形の開きと閉じ、`::icon(`、`:::`、`@{` の中のディレクティブは
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.ja.md)
により拒否します。
[fixture: kanban/header-directive-inside]
[fixture: kanban/div-directive-opener]
[fixture: kanban/div-directive-closer]
[fixture: kanban/div-directive-icon-marker]
[fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker]
完全な単位の間のディレクティブは、
隣り合うデータブロックの間も含めて置けます。
[fixture: kanban/header-directive-glued]
[fixture: kanban/db-metadata-adjacent-directive]

共通の
[`style` と `classDef` の行規則](../common.ja.md#style-行と-classdef-行)
が選ぶセミコロンは、
データ本文を含むテキストと文字列では無視します。
[fixture: kanban/lex-id-style-rule]
[fixture: kanban/lex-id-classdef-rule]
[fixture: kanban/lex-label-style-rule]
[fixture: kanban/lex-label-style-rule-upper]
[fixture: kanban/lex-label-style-rule-space]
[fixture: kanban/lex-label-style-rule-no-hash]
[fixture: kanban/lex-label-style-rule-two-semicolons]
[fixture: kanban/lex-metadata-style-rule]
[fixture: kanban/lex-style-entity-two-semicolons]
[fixture: kanban/gram-semicolon-text-reference]
形の開きと閉じの中で選ばれたセミコロンは
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)
により拒否します。
[fixture: kanban/div-semicolon-opener]
[fixture: kanban/div-semicolon-closer]
`style:#x` と別の行のセミコロンは選びません。
[fixture: kanban/lex-label-style-rule-other-line]
[fixture: kanban/lex-semicolon-icon-marker]

### 文の文脈

文の文脈では次の順に規則を試します。
空行とコメントは [空行](#空行) に従います。
[fixture: kanban/gram-grid-lf-header-line]
[fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-tab-trailing]
[fixture: kanban/lex-tab-whitespace-first]
[fixture: kanban/lex-tab-whitespace-between]
[fixture: kanban/spec-kanban-b45e7358]
[fixture: kanban/header-header-comment-blank]
[fixture: kanban/div-header-comments-blank]
[fixture: kanban/div-between-comment-blank]
[fixture: kanban/gram-between-comments-blank]
[fixture: kanban/div-comment-blank-before-icon]
[fixture: kanban/div-comment-blank-before-class]
[fixture: kanban/div-between-real-comments-ls-node]
[fixture: kanban/div-between-real-comments-ps-node]
[fixture: kanban/div-header-space-node]
[fixture: kanban/lex-between-comments-ls-node]
[fixture: kanban/gram-blank-before-icon]

1. `@{` はデータの文脈に入ります（[データの文脈](#データの文脈) を参照）。
   [fixture: kanban/db-metadata-all]
   [fixture: kanban/db-metadata-empty]

2. 空白の後も含め、
   図のコメントは何も読みません（[コメント](#コメント) を参照）。
   [fixture: kanban/lex-comment-bare]
   [fixture: kanban/header-comment-glued]

3. 大文字小文字を区別せず、
   語の文字が続かないキーワード `kanban` は `header` の単位です。
   [fixture: kanban/header-only-lf]
   [fixture: kanban/lex-keyword-kanban-upper]

4. `:::` は class の文脈に入ります。
   [fixture: kanban/db-decoration-class-item]

5. 大文字小文字を区別しない `::icon(` は icon の文脈に入ります。
   [fixture: kanban/db-decoration-icon-item]
   [fixture: kanban/lex-icon-case]

6. 改行は `newline` の単位です。
   [fixture: kanban/db-sections-items]
   空白だけの行は何も読みません。
   [fixture: kanban/gram-grid-lf-header-line]

7. 開きは `-)`、`(-`、`))`、`)`、`((`、`{{`、`(`、`[` の順に試します。
   `opener` の単位として形の文脈に入ります。
   [fixture: kanban/db-shape-bang-alt]
   [fixture: kanban/db-shape-cloud-alt]
   [fixture: kanban/db-shape-bang]
   [fixture: kanban/db-shape-cloud]
   [fixture: kanban/db-shape-circle]
   [fixture: kanban/db-shape-hexagon]
   [fixture: kanban/db-shape-round]
   [fixture: kanban/db-shape-square]
   [fixture: kanban/gram-shape-carryover-doublecircle]

8. 改行以外の 1 文字以上の空白は何も読みません。
   [fixture: kanban/db-indent-tabs]
   [fixture: kanban/lex-tab-line-start]
   [fixture: kanban/lex-bom-line-start]
   [fixture: kanban/lex-nbsp-line-start]
   [fixture: kanban/lex-ideographic-line-start]
   [fixture: kanban/lex-ls-line-start]
   [fixture: kanban/lex-ps-line-start]
   [fixture: kanban/header-ff-after]
   [fixture: kanban/header-vt-after]
   [fixture: kanban/header-nel-after]
   [fixture: kanban/lex-indent-directive]

9. ノード本文は `node-text` の単位です。
   [fixture: kanban/db-name-two-words]
   [fixture: kanban/db-name-space-before-shape]
   [fixture: kanban/db-name-trailing-space]
   [fixture: kanban/db-grid-spaces-item-id]
   [fixture: kanban/db-grid-close-square-item-id]
   [fixture: kanban/db-grid-quote-item-id]
   [fixture: kanban/db-grid-semicolon-item-id]
   [fixture: kanban/gram-grid-open-brace-item-id]
   [fixture: kanban/gram-grid-close-brace-item-id]
   [fixture: kanban/gram-node-at]
   [fixture: kanban/lex-shape-close-only]

`node-text` は `(`、`[`、改行、`)`、`{`、`}`、`@` 以外の 1 文字以上を、
できる限り長く読みます。
[fixture: kanban/gram-grid-open-brace-item-id]
[fixture: kanban/gram-grid-close-brace-item-id]
[fixture: kanban/lex-shape-close-only]
`]`、引用符、セミコロンを含みます。
[fixture: kanban/db-grid-close-square-item-id]
[fixture: kanban/db-grid-quote-item-id]
[fixture: kanban/db-grid-semicolon-item-id]
途中と末尾の空白を保ちます。
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-name-space-before-shape]
[fixture: kanban/db-name-trailing-space]
[fixture: kanban/db-grid-spaces-item-id]
先頭の字下げは別です。
単独の `@` は拒否します。
[fixture: kanban/gram-node-at]

この文法にはタイトル、アクセシビリティ、style、class 定義、
columns の文はありません。
`title`、`accTitle:`、`accDescr:`、`style`、`classDef`、`columns`、`space`、
`end` は通常のノード本文です。
[fixture: kanban/db-title-not-statement]
[fixture: kanban/db-acc-title-not-statement]
[fixture: kanban/db-acc-descr-not-statement]
[fixture: kanban/db-acc-title-empty]
[fixture: kanban/lex-keyword-style-upper]
[fixture: kanban/lex-keyword-classdef-dash]
[fixture: kanban/lex-keyword-columns-digit]
[fixture: kanban/lex-keyword-space-letter]
[fixture: kanban/lex-keyword-end-non-ascii]
`accDescr {}` は波括弧で拒否します。
[fixture: kanban/gram-acc-descr-block-not-statement]
[fixture: kanban/gram-empty-description-block-after-value]

### 形の文脈

開きは形の文脈に入ります。
次の 4 つの規則を順に試します。
[fixture: kanban/db-shape-bang-alt]
[fixture: kanban/db-shape-cloud-alt]
[fixture: kanban/db-shape-bang]
[fixture: kanban/db-shape-cloud]
[fixture: kanban/db-shape-circle]
[fixture: kanban/db-shape-hexagon]
[fixture: kanban/db-shape-round]
[fixture: kanban/db-shape-square]
[fixture: kanban/gram-shape-carryover-doublecircle]

1. 引用符と逆引用符は通常文字列の規則より先に `markdown-string` を始めます。
   改行を含む、
   引用符と逆引用符以外の 0 文字以上を読みます。
   逆引用符と引用符で閉じます。
   [fixture: kanban/db-markdown-label]
   [fixture: kanban/db-grid-lf-item-label-markdown]
   単独の引用符、引用符が続かない逆引用符、
   テキストの終わりは入力を拒否させます。
   通常文字列の規則は試しません。
   [fixture: kanban/gram-unclosed-markdown]
   [fixture: kanban/gram-grid-quote-item-label-markdown]
   [fixture: kanban/gram-grid-backtick-item-label-markdown]
   [fixture: kanban/gram-markdown-quote]
   [fixture: kanban/gram-markdown-extra-backtick]

2. `string` は引用符から次の引用符までです。
   [fixture: kanban/spec-kanban-562eb2dc]
   エスケープはありません。
   改行、U+2028、U+2029、丸括弧、角括弧、逆斜線を含められます。
   [fixture: kanban/db-label-multiline]
   [fixture: kanban/lex-ls-quoted-value]
   [fixture: kanban/lex-ps-quoted-value]
   [fixture: kanban/gram-grid-quote-item-label-quoted]
   [fixture: kanban/db-grid-backslash-item-label-quoted]
   閉じない文字列は拒否します。
   [fixture: kanban/gram-unclosed-quote]

3. 閉じは `))`、`)`、`]`、`}}`、`(-`、`-)`、`((`、`(` の順に試します。
   `closer` の単位として形の文脈を出ます。
   [fixture: kanban/db-shape-circle]
   [fixture: kanban/db-shape-round]
   [fixture: kanban/db-shape-square]
   [fixture: kanban/db-shape-hexagon]
   [fixture: kanban/db-shape-bang]
   [fixture: kanban/db-shape-cloud]
   [fixture: kanban/lex-shape-dash-string]

4. `shape-text` は `)`、`]`、`(`、`}` 以外の 1 文字以上を、
   できる限り長く読みます。
   空白、改行、U+2028、U+2029、`{`、`[`、`@`、先頭以外の引用符を含みます。
   [fixture: kanban/db-label-multiline]
   [fixture: kanban/db-label-quotes-middle]
   [fixture: kanban/db-grid-punct-item-label-bare]
   [fixture: kanban/lex-shape-open-brace]
   [fixture: kanban/lex-shape-open-bracket]
   [fixture: kanban/lex-shape-bare-ls]
   [fixture: kanban/lex-bare-leading-space-string]
   [fixture: kanban/lex-bare-quotes-literal]
   ラベルの先頭か途中の単独の `}` は拒否します。
   [fixture: kanban/gram-shape-single-brace-first]
   [fixture: kanban/gram-shape-single-brace-middle]

裸の本文は `)` の前のダッシュを本文に取ります。
`(-text-)` の閉じは `)` です。
[fixture: kanban/db-shape-cloud-alt]
[fixture: kanban/lex-shape-dash-bare]
引用したラベルの後では、
`(-"text"-)` のようにダッシュを閉じ `-)` に含められます。
[fixture: kanban/lex-shape-dash-string]

形のラベル内の空白は、
空白だけの値も含めて値の一部です。
[fixture: kanban/db-spaces-label]
[fixture: kanban/gram-whitespace-string]
[fixture: kanban/gram-whitespace-bare-shape]
`S[ "x" ]` は先頭に空白を持つテキストのラベルです。
[fixture: kanban/lex-bare-leading-space-string]
文字列と markdown 文字列の後の空白は 2 つ目のラベルの単位として拒否します。
[fixture: kanban/gram-string-plus-space]
[fixture: kanban/gram-markdown-plus-space]

### icon と class の文脈

icon は大文字小文字を区別しない `::icon(` で始まります。
[fixture: kanban/db-decoration-icon-item]
[fixture: kanban/lex-icon-case]
`)` 以外の空でない最長の `icon-text` と `)` を持ちます。
空白と改行は値の文字です。
[fixture: kanban/lex-icon-spaces]
[fixture: kanban/lex-icon-multiline]
[fixture: kanban/gram-whitespace-icon]
[fixture: kanban/gram-unclosed-icon]
`A ::icon(x)` はノード本文 `A ::icon` と形 `(x)` です。
[fixture: kanban/db-decoration-inline]

class は `:::` で始まります。
空白を含む行区間の残り全体を空でない `class-text` に取り、
class の文脈を出ます。
[fixture: kanban/db-decoration-class-item]
[fixture: kanban/db-grid-comment-item-class]
[fixture: kanban/lex-class-trailing-spaces]
[fixture: kanban/gram-whitespace-class]
先頭の改行は本文なしで文脈を出ます。
先頭の U+2028 と U+2029 は合う規則がなく入力を拒否させます。
[fixture: kanban/gram-class-ls]
[fixture: kanban/lex-class-ls-lf]
[fixture: kanban/gram-class-first-ls]
[fixture: kanban/gram-grid-ps-item-class]

icon の文脈では空でない本文を先に読み、
`)` で文脈を出ます。
[fixture: kanban/db-decoration-icon-item]
[fixture: kanban/lex-icon-multiline]
class 本文を読むと class の文脈を出ます。
空でない class 本文の後の区切り文字は文の文脈で読みます。
`:::a`、U+2028、`b` は 1 行の 2 文として拒否します。
[fixture: kanban/gram-class-ls]
[fixture: kanban/lex-class-ls-lf]
[fixture: kanban/gram-grid-ps-item-class]

### データの文脈

文の文脈で単位が始まるところの `@{` はデータの文脈に入ります。
二重引用符の外の `}` はその文脈を出て 1 つの `data-block` 単位を作ります。
その単位は空でもかまいません。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-empty]
[fixture: kanban/db-metadata-whitespace]
[fixture: kanban/db-metadata-brace-in-quoted]
閉じないブロックは拒否します。
[fixture: kanban/gram-metadata-unclosed]

データ内では、
二重引用符で引用データに入り、
空でない引用外の本文を読み、
`}` でブロックを閉じる順に規則を試します。
[fixture: kanban/db-metadata-all]
[fixture: kanban/db-metadata-empty]
引用データ内では、
空でない本文の規則より先に二重引用符でその文脈を出ます。
[fixture: kanban/db-metadata-quotes-empty]
[fixture: kanban/db-metadata-double-caret]

二重引用符の外のデータ本文は `}`、`^`、二重引用符以外の空でない最長の並びです。
`^` は合う規則がなく拒否します。
[fixture: kanban/gram-metadata-caret]
`{` と単一引用符は通常の本文です。
[fixture: kanban/db-metadata-assigned-single-quoted]
[fixture: kanban/db-metadata-caret-reference]
単一引用符は `^` や閉じ波括弧を保護しません。
[fixture: kanban/gram-metadata-single-caret]
[fixture: kanban/gram-metadata-single-brace]
[fixture: kanban/gram-metadata-assigned-mapping]

データ内の二重引用符は引用データの文脈に入ります。
次の引用符はその文脈を出ます。
[fixture: kanban/db-metadata-quotes-empty]
ほかの文字は `}`、`^`、改行、逆斜線も本文です。
[fixture: kanban/db-metadata-quoted-brace]
[fixture: kanban/db-metadata-double-caret]
[fixture: kanban/gram-metadata-newline-quotes]
逆斜線は閉じる引用符をエスケープしません。
[fixture: kanban/gram-metadata-unclosed-quote]

閉じないデータブロックと二重引用部分は拒否します。
受理した木のデータブロックはすべて閉じています。
[fixture: kanban/gram-metadata-unclosed]
[fixture: kanban/gram-metadata-unclosed-quote]

### コメント

図のコメントは文の文脈で単位が始まるところの `%%` で始まります。
単独の行にも、
ヘッダー、形、icon、データブロックの後にも、
空白の有無によらず置けます。
[fixture: kanban/header-comment-glued]
[fixture: kanban/header-comment-on-header-line]
[fixture: kanban/lex-comment-bare]
[fixture: kanban/lex-after-shape-comment]
[fixture: kanban/lex-after-shape-comment-glued]
[fixture: kanban/lex-after-icon-comment]
[fixture: kanban/lex-after-metadata-comment]
印は `%%` です。
値は印の後から改行、U+2028、U+2029、テキストの終わりまでの本文です。
[fixture: kanban/lex-node-comment-ls]
[fixture: kanban/lex-icon-comment-ls]
[fixture: kanban/db-metadata-comment-ls]
[fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/lex-between-comment-ls-node]

通常の `#` と単独の `%` はノード本文です。
[fixture: kanban/lex-comment-hash]
[fixture: kanban/lex-comment-single-percent]
ノード本文や形のラベルの中の `%%` はそのテキストの一部です。
[fixture: kanban/lex-after-bare-comment]
[fixture: kanban/lex-after-bare-comment-glued]
[fixture: kanban/db-grid-comment-item-label-bare]
[fixture: kanban/lex-comment-quoted-inline]

`%%` だけの行と `%%{ }%%` の行は図のコメントです。
[fixture: kanban/lex-comment-bare]
[fixture: kanban/header-after-empty-braces-line]
共通のコメント行は行終端とともに除き、
同じ行の U+2028 と U+2029 の後の本文も含めます。
[fixture: kanban/lex-between-comments-ls-node]
[fixture: kanban/lex-comment-quoted-line]

図のコメントの終わりは U+2028 と U+2029 でも `newline` の単位です。
その後の字下げは新しいノードの行を始めます。
区切り文字とその右の空白は字下げに数えます。
[fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/lex-between-comment-ls-node]
[fixture: kanban/lex-node-comment-ls]
[fixture: kanban/lex-icon-comment-ls]
[fixture: kanban/db-metadata-comment-ls]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を使います。
単位の名前は上で定めたものです。

| 文法の規則                         | 作るノード           |
| ---------------------------------- | -------------------- |
| `diagram`                          | KanbanDiagram        |
| `node`                             | KanbanNode           |
| `shape`                            | KanbanShape          |
| `shape-label`                      | KanbanLabel          |
| `icon-line`                        | KanbanIconStatement  |
| `class-line`                       | KanbanClassStatement |
| `data-block`                       | KanbanDataBlock      |
| `node-text, icon-text, class-text` | KanbanLiteral        |

### 図と行

```text
diagram     = header line? ( newline line? )*
line        = node data-block* | icon-line | class-line
node        = node-text shape? | shape
shape       = opener shape-label closer
shape-label = shape-text | string | markdown-string
icon-line   = "::icon(" icon-text ")"
class-line  = ":::" class-text
```

各ノードと装飾は行の終わりを要します。
形、データ接尾部、icon、引用したラベルの後の 2 つ目の文は拒否します。
[fixture: kanban/gram-two-shapes-on-line]
形、データ接尾部、icon、引用したラベルの後のセミコロンは拒否します。
[fixture: kanban/lex-after-shape-semicolon]
[fixture: kanban/lex-after-shape-semicolon-spaced]
[fixture: kanban/lex-after-metadata-semicolon]
[fixture: kanban/lex-after-icon-semicolon]
[fixture: kanban/lex-after-quoted-semicolon]
[fixture: kanban/lex-after-markdown-semicolon]
裸のノード本文と class 本文の中のセミコロンは本文です。
[fixture: kanban/lex-after-class-semicolon]
[fixture: kanban/db-semicolon-bare-node]
[fixture: kanban/db-semicolon-only-node]

形、icon、データ接尾部が終わった後には、
行が終わるまでに空白と図のコメントを置けます。
[fixture: kanban/lex-after-shape-spaces]
[fixture: kanban/lex-after-icon-spaces]
[fixture: kanban/lex-after-metadata-spaces]
[fixture: kanban/lex-after-shape-comment]
[fixture: kanban/lex-after-icon-comment]
[fixture: kanban/lex-after-metadata-comment]
[fixture: kanban/db-metadata-before-comment]
class と裸のノード本文は末尾の本文を保ちます。
[fixture: kanban/lex-after-class-comment]
[fixture: kanban/lex-after-bare-spaces]

最後のノードはソースの末尾の改行を要しません
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）。
[fixture: kanban/db-no-final-line-feed]
形、文字列、markdown 文字列、icon は閉じる必要があります。
[fixture: kanban/gram-unclosed-shape]
[fixture: kanban/gram-unclosed-quote]
[fixture: kanban/gram-unclosed-markdown]
[fixture: kanban/gram-unclosed-icon]
class はソースの終わりで終えられます。
空の形は拒否します（[空の形](#空の形) を参照）。
[fixture: kanban/div-class-end-empty]

### ノードと形

ノードは裸のノード本文、ノード本文と形、形だけのどれかです。
[fixture: kanban/db-name-two-words]
[fixture: kanban/db-shape-square]
[fixture: kanban/db-name-space-before-shape]
形だけのノードは id の子を持ちません。
[fixture: kanban/db-name-no-id]
[fixture: kanban/spec-kanban-46081dfb]

図の本体は絶対的な字下げを持つノードの平坦なリストです。
深いノードも入れ子の子にはなりません。
[fixture: kanban/db-indent-unindented]
[fixture: kanban/db-indent-tabs]
[fixture: kanban/db-indent-deeper]
[fixture: kanban/db-indent-shallower-last]
[fixture: kanban/db-sections-items]
[fixture: kanban/spec-kanban-d05521ff]
列と項目への割り当ては
[tests パッケージ](../../../tests/docs/db-summaries.ja.md#kanban) が定めます。

id が重複したノードもソースの順に別々に保ちます。
id は一意でなくてもかまいません。
[fixture: kanban/db-section-three-definitions]
[fixture: kanban/db-item-three-definitions]
[fixture: kanban/db-section-item-same-id]
[fixture: kanban/db-metadata-repeated-id]
プロトタイプのプロパティ名と大文字小文字の違いは通常のノード本文です。
[fixture: kanban/db-object-prototype-ids]
[fixture: kanban/db-name-case]

形は開き、
空でない `shape-text`、`string`、`markdown-string` のどれか 1 つのラベル、
閉じです。
[fixture: kanban/db-shape-square]
[fixture: kanban/db-markdown-label]
閉じは開きと一致しなくてもよく、
`[text)` も形です。
[fixture: kanban/db-shape-mismatched]
`[]`、`[""]`、形の中の 2 つの文字列は拒否します。
[fixture: kanban/gram-empty-label]
[fixture: kanban/gram-empty-quoted-label]
[fixture: kanban/gram-label-two-strings]
[fixture: kanban/gram-empty-markdown-shape]

受理する形は上に挙げたものです。
`>` は裸のノード本文です。
[fixture: kanban/db-shape-carryover-left-arrow]
`[...]` の中の斜線と逆斜線はラベルの本文です。
[fixture: kanban/db-shape-carryover-lean-left]
[fixture: kanban/db-shape-carryover-lean-right]
[fixture: kanban/db-shape-carryover-trapezoid]
別の区切りを要する円柱、サブルーチン、ひし形、スタジアム、ブロック矢印の形は、
拒否します。
[fixture: kanban/gram-shape-carryover-cylinder]
[fixture: kanban/gram-shape-carryover-subroutine]
[fixture: kanban/gram-shape-carryover-diamond]
[fixture: kanban/gram-shape-carryover-stadium]
[fixture: kanban/gram-shape-carryover-block-arrow]

### データブロック

1 つ以上の隣り合うデータブロックは、
間に空白を挟まずノードの後に置けます。
[fixture: kanban/gram-metadata-two-blocks]
[fixture: kanban/db-metadata-adjacent-empty]
[fixture: kanban/db-metadata-adjacent-comma]
[fixture: kanban/db-metadata-two-items]
[fixture: kanban/db-metadata-one-item-reference]
完全なブロックの間にはディレクティブを置けます。
[fixture: kanban/db-metadata-adjacent-directive]
空白と改行は接尾部を終えます。
その後の別のブロックは拒否します。
[fixture: kanban/gram-metadata-adjacent-space]
[fixture: kanban/gram-metadata-blank-between-blocks]

データはノード全体の後に置きます。
形があればその直後です。
[fixture: kanban/db-metadata-all]
[fixture: kanban/gram-metadata-after-shape-space]
形がなければ裸のノード本文の後で、
その末尾の空白は本文に保ちます。
[fixture: kanban/db-metadata-ticket-plain]
[fixture: kanban/db-metadata-node-space]
データの後の形は拒否します。
[fixture: kanban/gram-metadata-before-shape]
次の行に単独であるデータブロックは拒否します。
[fixture: kanban/gram-metadata-block-on-next-line]

各データブロックは書かれた本文全体を保ちます。
両端の空白、引用符、行終端、コンマ、未知のキー、重複キーを含みます。
解析したキーと値の子は持ちません。
[fixture: kanban/db-metadata-spaces]
[fixture: kanban/db-metadata-multiline]
[fixture: kanban/db-metadata-unknown-key]
[fixture: kanban/db-metadata-proto-key]
[fixture: kanban/gram-metadata-ticket-duplicate]
[fixture: kanban/db-metadata-whitespace]
[fixture: kanban/db-metadata-unknown-reference]
[fixture: kanban/db-metadata-double-line-space]
[fixture: kanban/db-metadata-single-line-space]

境界が正しいデータブロックの中身は検査しません。
YAML のエラー、重複キー、値の型、形名、空の複数行の本文は
[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md)
に当たります。
[fixture: kanban/gram-metadata-bad-yaml]
[fixture: kanban/gram-metadata-ticket-duplicate]
[fixture: kanban/gram-metadata-empty-multiline]
[fixture: kanban/gram-metadata-shape-camel]
[fixture: kanban/gram-metadata-shape-number]
[fixture: kanban/gram-metadata-shape-underscore]
[fixture: kanban/gram-metadata-two-blocks]
二重引用符の外の `^`、閉じないブロック、残った波括弧は構文として拒否します。
[fixture: kanban/gram-metadata-caret]
[fixture: kanban/gram-metadata-unclosed]
[fixture: kanban/gram-metadata-assigned-mapping]

### icon と class

icon と class の行は字下げによらず最後に書いたノードを飾ります。
繰り返した装飾もソースの順に別々に保ちます。
[fixture: kanban/db-decoration-icon-twice]
[fixture: kanban/db-decoration-class-twice]
[fixture: kanban/spec-kanban-382e97e1]
[fixture: kanban/spec-kanban-dc1ceff8]
[fixture: kanban/spec-kanban-3f5b450b]
後の深いノードの前の装飾は、
前のノードに属します。
[fixture: kanban/gram-decoration-then-child]
[fixture: kanban/gram-shallower-then-decoration]

### 空の形

空の icon と class の形は、
印を認識するどこでも
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
により拒否します。
[fixture: kanban/db-decoration-empty-icon]
[fixture: kanban/db-decoration-empty-class]
[fixture: kanban/div-class-end-empty]
[fixture: kanban/gram-empty-icon-reference]
最初のノードの前と形の直後も含みます。
[fixture: kanban/div-empty-icon-before-first]
[fixture: kanban/div-empty-icon-header]
[fixture: kanban/div-empty-class-header]
[fixture: kanban/div-class-before-first-unindented-empty]
[fixture: kanban/div-empty-icon-after-shape]
[fixture: kanban/div-empty-class-after-shape]
[fixture: kanban/gram-empty-class-before-first]
空でない空白だけの本文は値です。
[fixture: kanban/gram-whitespace-icon]
[fixture: kanban/gram-whitespace-class]

形の中で認識する空の文字列と空の markdown 文字列は
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
により拒否します。
[fixture: kanban/gram-empty-quoted-label]
[fixture: kanban/gram-unclosed-empty-string]
[fixture: kanban/gram-unclosed-empty-markdown]
[fixture: kanban/gram-empty-markdown-shape]
空でない本文や文字列のラベルの前後も同じです。
[fixture: kanban/div-empty-string-before-label]
[fixture: kanban/div-empty-markdown-before-label]
[fixture: kanban/div-empty-string-after-label]
[fixture: kanban/div-empty-markdown-after-label]
[fixture: kanban/div-string-before-string]
[fixture: kanban/div-empty-markdown-before-string]
[fixture: kanban/gram-string-reference]
[fixture: kanban/gram-text-reference]
形の外の裸の `""` と空の markdown 文字列はノード本文です。
[fixture: kanban/db-empty-string-node]
[fixture: kanban/db-empty-markdown-node]
形の裸のラベル内の `x""` は本文です。
[fixture: kanban/lex-bare-quotes-literal]

空のデータブロックもデータノードです。
[fixture: kanban/db-metadata-empty]
[fixture: kanban/gram-metadata-empty-multiline]
空の引用した値は解析しない本文の一部です。
[fixture: kanban/db-metadata-label-empty-string]
[fixture: kanban/db-metadata-quotes-empty]
`accDescr {}` はここでは文の形を持ちません。
[fixture: kanban/gram-acc-descr-block-not-statement]
[fixture: kanban/gram-empty-description-block-after-value]

### 空行

ヘッダー後の空行、空白だけの行、コメント行、図のコメントは、
ノード間、装飾の前、末尾で何も変えません。
[fixture: kanban/gram-grid-lf-header-line]
[fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-tab-trailing]
[fixture: kanban/lex-tab-whitespace-first]
[fixture: kanban/lex-tab-whitespace-between]
[fixture: kanban/spec-kanban-b45e7358]
[fixture: kanban/header-header-comment-blank]
[fixture: kanban/gram-between-comments-blank]
[fixture: kanban/lex-between-comments-ls-node]
[fixture: kanban/gram-blank-before-icon]
その組分けだけで mermaid.js が拒否する入力は
[blank-line-after-header-or-comments](../known-divergences/blank-line-after-header-or-comments.ja.md)
に当たります。
[fixture: kanban/div-header-comments-blank]
[fixture: kanban/div-between-comment-blank]
[fixture: kanban/div-comment-blank-before-icon]
[fixture: kanban/div-comment-blank-before-class]
[fixture: kanban/div-between-real-comments-ls-node]
[fixture: kanban/div-between-real-comments-ps-node]
[fixture: kanban/div-header-space-node]

### 文法外の拒否

- 最初のノードより浅いノードは、
  その後に別のノードがあるときだけ入力を拒否させます。
  [fixture: kanban/db-indent-shallower-last]
  [fixture: kanban/gram-indent-shallower-followed]
  [fixture: kanban/spec-kanban-fd001ab2]
  最後の浅いノードの後の装飾と空行は拒否を起こしません。
  [fixture: kanban/gram-shallower-then-decoration]
  [fixture: kanban/gram-shallower-then-empty]

- 最初のノードの前の icon と class の装飾は拒否します。
  [fixture: kanban/gram-decoration-before-node]
  [fixture: kanban/gram-decoration-class-before-node]

## 既知の差異

- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md).**
  空の icon、空の class 行、形の中の空の文字列と markdown 文字列は拒否します。
  mermaid.js はこれらの形のトークンを読まず、
  残りが受理される入力を受理します。
  [fixture: kanban/db-decoration-empty-class]
  [fixture: kanban/db-decoration-empty-icon]
  [fixture: kanban/div-empty-icon-before-first]
  [fixture: kanban/div-empty-icon-header]
  [fixture: kanban/div-empty-class-header]
  [fixture: kanban/div-empty-string-before-label]
  [fixture: kanban/div-empty-markdown-before-label]
  [fixture: kanban/div-empty-string-after-label]
  [fixture: kanban/div-empty-markdown-after-label]
  [fixture: kanban/div-class-before-first-unindented-empty]
  [fixture: kanban/div-class-end-empty]
  [fixture: kanban/div-empty-icon-after-shape]
  [fixture: kanban/div-empty-class-after-shape]
  [fixture: kanban/div-string-before-string]
  [fixture: kanban/div-empty-markdown-before-string]

- **[`blank-line-after-header-or-comments`](../known-divergences/blank-line-after-header-or-comments.ja.md).**
  ノード前の空行とヘッダー末尾の空白は受理します。
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
  コメントを終える U+2028 と U+2029 の後のノードは受理します。
  mermaid.js は空白の組分けによりこれらの入力を拒否します。
  [fixture: kanban/div-header-comment-ls-node]
  [fixture: kanban/div-header-comment-ps-node]
  [fixture: kanban/div-between-real-comments-ls-node]
  [fixture: kanban/div-between-real-comments-ps-node]

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md).**
  `kanban`、形の区切り、`::icon(`、`:::`、`@{` を分けるディレクティブは、
  拒否します。
  mermaid.js は前後をつなぎます。
  [fixture: kanban/header-directive-inside]
  [fixture: kanban/div-directive-opener]
  [fixture: kanban/div-directive-closer]
  [fixture: kanban/div-directive-icon-marker]
  [fixture: kanban/div-directive-class-marker]
  [fixture: kanban/div-directive-data-marker]

- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md).**
  形の開きと閉じの中で共通の行規則が選ぶセミコロンは拒否します。
  mermaid.js はそれを除きます。
  [fixture: kanban/div-semicolon-opener]
  [fixture: kanban/div-semicolon-closer]

- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md).**
  フロントマターで始まるタグは後の kanban ラベルの引用符を変換しません。
  フロントマターに `title: <a` があるとき、
  `S["b="c">d"]` はここでは拒否します。
  mermaid.js は受理します。
  [fixture: kanban/div-frontmatter-open-tag]

- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md).**
  ノード本文、ラベル、データ本文の `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment` は kanban ヘッダーを覆しません。
  mermaid.js は C4 を選び入力を拒否します。
  [fixture: kanban/lex-c4-c4component-id]
  [fixture: kanban/lex-c4-c4component-label]
  [fixture: kanban/lex-c4-c4component-metadata]
  [fixture: kanban/lex-c4-c4container-id]
  [fixture: kanban/lex-c4-c4container-label]
  [fixture: kanban/lex-c4-c4container-metadata]
  [fixture: kanban/lex-c4-c4deployment-id]
  [fixture: kanban/lex-c4-c4deployment-label]
  [fixture: kanban/lex-c4-c4deployment-metadata]
  [fixture: kanban/lex-c4-c4dynamic-id]
  [fixture: kanban/lex-c4-c4dynamic-label]
  [fixture: kanban/lex-c4-c4dynamic-metadata]

- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md).**
  フロントマターとデータブロックの中身は YAML、型、形名を検査せずに保ちます。
  [fixture: kanban/gram-frontmatter-invalid-yaml]
  [fixture: kanban/gram-metadata-bad-yaml]
  [fixture: kanban/gram-metadata-ticket-duplicate]
  [fixture: kanban/gram-metadata-shape-camel]
  [fixture: kanban/gram-metadata-shape-number]
  [fixture: kanban/gram-metadata-shape-underscore]
  空の複数行ブロックと、
  mermaid.js が連結した本文を拒否する隣り合うブロックも受理します。
  [fixture: kanban/gram-metadata-empty-multiline]
  [fixture: kanban/gram-metadata-two-blocks]

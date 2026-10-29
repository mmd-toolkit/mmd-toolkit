# Venn

英語版: [venn.md](./venn.md)

mermaid.js の正しさの基準:

- [`venn.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/parser/venn.jison#L1-L133)
- [`vennDB.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L16-L96)
- [`vennDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDetector.ts#L7-L11)

この文書は図種 `venn` を扱います。
木は [ast/venn.ja.md](../ast/venn.ja.md) で定義します。
受理した値の Db への読み方は、
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#venn)
にあります。

## 検出

この文法の選択には、
[detection.ja.md](../detection.ja.md) の項目 36 を適用します。
[fixture: venn/header-only] [fixture: venn/header-capitalized]
[fixture: venn/header-upper] [fixture: venn/header-mixed]
[fixture: venn/header-word-suffix] [fixture: venn/header-digit-suffix]
[fixture: venn/header-underscore-suffix]
検出は小文字の接頭辞 `venn-beta` を要求し、直後の文字の境界を要求しません。
[fixture: venn/header-only] [fixture: venn/header-capitalized]
[fixture: venn/header-upper] [fixture: venn/header-mixed]
[fixture: venn/header-word-suffix] [fixture: venn/header-digit-suffix]
[fixture: venn/header-underscore-suffix]

先行する trivia は、空白だけの行が続く裸の `%%` 行も含め、
[共通の検出規則](../common.ja.md#図種の検出) に従います。
[fixture: venn/header-before-blank] [fixture: venn/header-before-spaces]
[fixture: venn/header-before-comment] [fixture: venn/header-before-directive]
[fixture: venn/header-before-frontmatter]
[fixture: venn/header-before-frontmatter-comment]
[fixture: venn/header-before-bare-percent]
[fixture: venn/header-before-empty-braces]
[fixture: venn/header-bare-percent-blank-before-header]

見出しより前の `#` 行、単独の `%` の行、セミコロン、文は venn の検出を妨げます。
[fixture: venn/header-before-hash] [fixture: venn/header-before-percent]
[fixture: venn/header-before-semicolon] [fixture: venn/header-before-statement]

## 字句構造

字句解析器は、
[図のテキスト](../common.ja.md#ソースの読み方) の変換形を読みます。
[fixture: venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-html-attribute]
[fixture: venn/lex-identifier-entity-named]
[fixture: venn/lex-identifier-entity-numeric]
[fixture: venn/db-html-tag-from-title-name]
[fixture: venn/db-html-tag-from-title-label]
[fixture: venn/db-html-tag-from-title-style]
[fixture: venn/db-html-tag-from-comment-name]
[fixture: venn/db-html-tag-across-names]
木の値は書かれたテキストを保持します。 [fixture: venn/lex-cr-quoted-value]
[fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-html-attribute]
[fixture: venn/lex-identifier-entity-named]
[fixture: venn/lex-identifier-entity-numeric]

### 単位と文脈

字句解析器は通常の文脈で始まり、各位置で最初に一致する規則を適用します。
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-style-adjacent-units]
[fixture: venn/lex-style-value-hex-nine]
[fixture: venn/gram-style-value-reserved-dash-prefix]
[fixture: venn/gram-style-value-union-dash-prefix]
[fixture: venn/gram-style-value-header-dash-prefix]
[fixture: venn/gram-style-value-title-line-priority]
[fixture: venn/gram-style-value-number-reserved-dash-prefix]
[fixture: venn/gram-style-value-followed-by-keyword-set]
[fixture: venn/gram-style-value-followed-by-keyword-title]
[fixture: venn/gram-style-value-followed-by-keyword-union]
[fixture: venn/gram-style-value-followed-by-keyword-text]
[fixture: venn/gram-style-value-followed-by-keyword-union-list]
競合する規則のうち最長の一致を選びません。
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-style-adjacent-units]
[fixture: venn/lex-style-value-hex-nine]
[fixture: venn/gram-first-rule-keyword-prefix-name]
[fixture: venn/lex-first-rule-comment-before-multiline-string]
[fixture: venn/gram-style-value-reserved-dash-prefix]
[fixture: venn/gram-style-value-union-dash-prefix]
[fixture: venn/gram-style-value-header-dash-prefix]
[fixture: venn/gram-style-value-title-line-priority]
[fixture: venn/gram-style-value-number-reserved-dash-prefix]
[fixture: venn/gram-style-value-followed-by-keyword-set]
[fixture: venn/gram-style-value-followed-by-keyword-title]
[fixture: venn/gram-style-value-followed-by-keyword-union]
[fixture: venn/gram-style-value-followed-by-keyword-text]
[fixture: venn/gram-style-value-followed-by-keyword-union-list]

newline 単位は行頭の文脈へ入ります。 [fixture: venn/db-indent-width]
[fixture: venn/gram-extra-indent-indented-style]
[fixture: venn/db-form-style-rgba]
両方の文脈で以下の順の規則を使い、行頭と記した規則は行頭だけで適用します。
[fixture: venn/db-indent-width] [fixture: venn/gram-extra-indent-indented-style]
[fixture: venn/db-form-style-rgba]

文字列、角括弧ラベル、タイトル、色は全体で一つの単位で、
別の字句文脈を持ちません。 [fixture: venn/lex-identifier-blank-line]
[fixture: venn/lex-label-blank-line] [fixture: venn/db-title-quotes]
[fixture: venn/lex-style-value-rgb-multiline]

一致する規則がない文字は拒否します。
[fixture: venn/gram-grid-nonascii-identifier-bare]
[fixture: venn/lex-nbsp-line-start]
[fixture: venn/gram-header-close-brace-not-eaten]

規則は次の順に試します。

1. `{` が続かない `%%` は図のコメントを開始し、
   次の LF の直前またはテキスト末尾まで読みます。
   [fixture: venn/lex-inline-comment-spaced]
   [fixture: venn/db-indent-comment-ls]
   [fixture: venn/gram-first-rule-keyword-prefix-name]
   [fixture: venn/lex-first-rule-comment-before-multiline-string]

2. `}` 以外の UTF-16 符号単位一つに `%%` が直続すると、
   その符号単位を後続の図のコメントとともに飲み込みます。
   [fixture: venn/db-grid-comment-header-line]
   [fixture: venn/header-nonascii-eaten]
   [fixture: venn/gram-header-non-bmp-before-comment]
   [fixture: venn/gram-header-close-brace-not-eaten]
   [fixture: venn/gram-first-rule-keyword-prefix-name]
   [fixture: venn/lex-first-rule-comment-before-multiline-string]
   [fixture: venn/lex-comment-swallowed-nbsp]
   [fixture: venn/lex-comment-swallowed-nbsp-between-statements]

3. 行頭の文脈では、 LF の直前のスペースとタブを読み飛ばします。
   [fixture: venn/db-indent-blank-line] [fixture: venn/lex-tab-whitespace-line]

4. 行頭の文脈では、暗黙 text モードが有効なとき、
   境界付きのキーワード `text` の前の、一つ以上のスペースかタブが、
   `implicit-text-start` 単位を選びます。 [fixture: venn/db-form-indent-id]
   [fixture: venn/db-indent-width] [fixture: venn/gram-indent-text-prefix]
   [fixture: venn/db-indent-after-directive]
   この単位はキーワードも消費して通常の文脈へ入ります。
   [fixture: venn/db-form-indent-id] [fixture: venn/db-indent-width]
   [fixture: venn/gram-indent-text-prefix]
   [fixture: venn/db-indent-after-directive]

5. それ以外では、行頭の文脈のそのスペースとタブを読み飛ばします。
   [fixture: venn/lex-indented-text-at-bol-without-current-set-explicit]
   [fixture: venn/lex-indented-text-after-style-explicit]

6. 行頭の文脈では、残った先頭のスペースとタブを読み飛ばします。
   [fixture: venn/gram-extra-indent-indented-style]
   [fixture: venn/gram-indent-after-indented-title]

7. 行頭の文脈では、
   LF 以外の残る文字が暗黙 text モードを解除して通常の文脈へ入り、
   そこで同じ文字を読み直します。 [fixture: venn/gram-indent-after-style]
   [fixture: venn/gram-indent-after-title]
   [fixture: venn/gram-extra-indent-indented-style]
   [fixture: venn/gram-indent-after-indented-title]
   [fixture: venn/gram-indent-empty-braces-after-blank]
   [fixture: venn/gram-indent-union-blank-empty-braces]

8. 一つ以上の LF は一つの `newline` 単位を作り、行頭の文脈へ入ります。
   [fixture: venn/db-indent-after-blank] [fixture: venn/lex-cr-line-end]
   [fixture: venn/lex-crlf-line-end]
   [fixture: venn/gram-indent-empty-braces-after-blank]
   [fixture: venn/lex-indent-bare-percent-after-blank]
   [fixture: venn/lex-indent-indented-empty-braces-after-blank]

9. 残る `%%` は、共通のディレクティブを開始しない `%%{` も含め、
   次の LF の直前または末尾までの図のコメントを開始します。
   [fixture: venn/lex-bare-percent-between-set-and-text]
   [fixture: venn/lex-empty-braces-percent-between-set-and-text]
   [fixture: venn/gram-indent-empty-braces-after-blank]
   [fixture: venn/lex-indent-bare-percent-after-blank]
   [fixture: venn/lex-indent-indented-empty-braces-after-blank]

10. ASCII のスペースとタブを読み飛ばします。 [fixture: venn/lex-tab-line-start]
    [fixture: venn/lex-tab-line-end] [fixture: venn/db-set-label-space]
    [fixture: venn/db-set-label-tab] [fixture: venn/db-after-set-space]
    [fixture: venn/lex-after-set-tab] [fixture: venn/db-after-set-label-space]
    [fixture: venn/lex-after-set-label-tab]
    [fixture: venn/db-after-set-size-space]
    [fixture: venn/lex-after-set-size-tab]
    [fixture: venn/db-after-set-label-size-space]
    [fixture: venn/db-after-set-label-size-tab]
    [fixture: venn/db-after-union-space] [fixture: venn/lex-after-union-tab]
    [fixture: venn/db-after-union-label-space]
    [fixture: venn/db-after-union-label-tab]
    [fixture: venn/db-after-union-size-space]
    [fixture: venn/db-after-union-size-tab]
    [fixture: venn/db-after-union-label-size-space]
    [fixture: venn/lex-after-union-label-size-tab]
    [fixture: venn/db-after-text-id-space] [fixture: venn/lex-after-text-tab]
    [fixture: venn/db-after-text-id-label-space]
    [fixture: venn/lex-after-text-label-tab]
    [fixture: venn/db-after-text-string-space]
    [fixture: venn/lex-after-text-string-tab]
    [fixture: venn/db-after-text-string-label-space]
    [fixture: venn/db-after-text-string-label-tab]
    [fixture: venn/db-after-text-number-space]
    [fixture: venn/lex-after-text-number-tab]
    [fixture: venn/db-after-indent-id-space]
    [fixture: venn/lex-after-indent-tab]
    [fixture: venn/db-after-indent-id-label-space]
    [fixture: venn/db-after-indent-id-label-tab]
    [fixture: venn/db-after-indent-string-space]
    [fixture: venn/db-after-indent-string-tab]
    [fixture: venn/db-after-indent-string-label-space]
    [fixture: venn/db-after-indent-string-label-tab]
    [fixture: venn/db-after-indent-number-space]
    [fixture: venn/db-after-indent-number-tab]
    [fixture: venn/db-after-style-space] [fixture: venn/lex-after-style-tab]
    [fixture: venn/db-after-style-string-space]
    [fixture: venn/lex-after-style-string-tab]
    [fixture: venn/db-after-style-list-space]
    [fixture: venn/db-after-style-list-tab]

11. テキスト末尾は `end` 単位を作ります。 [fixture: venn/header-only]
    [fixture: venn/header-only-lf]

12. `title`、[記法](../common.ja.md#表記) の空白一つ、変換後の `#`、LF、
    `;` を含まない空でないテキストが、
    可能な限り長い一つの `title-line` 単位を作ります。
    [fixture: venn/db-title-padding] [fixture: venn/db-title-only-whitespace]
    [fixture: venn/db-title-value-next-line]
    [fixture: venn/lex-title-separator-crlf]
    [fixture: venn/lex-title-separator-ls]
    [fixture: venn/lex-title-separator-ps]
    [fixture: venn/lex-title-separator-nbsp]
    [fixture: venn/lex-title-separator-ff]
    [fixture: venn/lex-title-separator-vt]
    [fixture: venn/lex-title-separator-nel] [fixture: venn/gram-title-empty]
    [fixture: venn/gram-title-space-end] [fixture: venn/lex-title-entity-named]
    [fixture: venn/lex-title-entity-no-semicolon]
    [fixture: venn/gram-title-hash-color-outside-title]
    [fixture: venn/lex-after-title-semicolon]

13. 境界付きのキーワード `venn-beta`、`set`、`union`、`text`、 `style` は、
    それぞれ `header`、`set-keyword`、`union-keyword`、 `text-keyword`、
    `style-keyword` 単位を作ります。 [fixture: venn/header-only]
    [fixture: venn/lex-keyword-set-upper]
    [fixture: venn/lex-keyword-union-upper]
    [fixture: venn/lex-keyword-text-upper]
    [fixture: venn/lex-keyword-style-upper]
    [fixture: venn/gram-first-rule-keyword-prefix-name]
    [fixture: venn/lex-first-rule-comment-before-multiline-string]

14. `["`、`"` 以外の任意個の文字、 `"]` は `quoted-label` 単位を作ります。
    [fixture: venn/db-label-empty] [fixture: venn/db-form-set-label]
    [fixture: venn/lex-label-quoted-close-bracket-inside]
    [fixture: venn/lex-label-blank-line]
    [fixture: venn/lex-label-quoted-directive-only]
    [fixture: venn/lex-label-quoted-ignored-semicolon-only]
    [fixture: venn/lex-label-quoted-comment-only]

15. `[`、`]` と `"` 以外の一つ以上の文字、 `]` は `bare-label` 単位を作ります。
    [fixture: venn/db-set-label]
    [fixture: venn/lex-label-bare-open-bracket-inside]
    [fixture: venn/lex-label-bare-whitespace-line]
    [fixture: venn/gram-label-bare-empty]
    [fixture: venn/gram-nested-label-quotes]
    [fixture: venn/gram-label-bare-directive-only]
    [fixture: venn/gram-label-bare-ignored-semicolon-only]
    [fixture: venn/lex-label-bare-comment-only]

16. 省略可能な符号と十進数字列は、
    小数点と一つ以上の小数桁を省略可能な接尾辞として、 `number` 単位を作ります。
    [fixture: venn/db-size-plus] [fixture: venn/db-size-fraction]
    [fixture: venn/db-size-signed-fraction]
    [fixture: venn/db-size-leading-zeros] [fixture: venn/db-size-negative]
    [fixture: venn/db-size-zero]
    省略可能な符号と小数点と一つ以上の数字も `number` 単位を作ります。
    [fixture: venn/db-size-plus] [fixture: venn/db-size-fraction]
    [fixture: venn/db-size-signed-fraction]
    [fixture: venn/db-size-leading-zeros] [fixture: venn/db-size-negative]
    [fixture: venn/db-size-zero]

17. `#` と 3〜8 桁の十六進数字は、
    可能な限り多くの桁を取って `hex-color` 単位を作ります。
    [fixture: venn/db-form-style-hex] [fixture: venn/lex-style-value-hex-three]
    [fixture: venn/lex-style-value-hex-eight]
    [fixture: venn/gram-style-value-hex-short]
    [fixture: venn/lex-style-value-hex-nine] [fixture: venn/db-style-hex-four]
    [fixture: venn/db-style-hex-five] [fixture: venn/db-style-hex-seven]

18. `rgba(`、カンマ区切りの空でない数字か点の並び四つ、
    `)` は `rgba-color` 単位を作ります。 [fixture: venn/db-form-style-rgba]
    [fixture: venn/lex-style-value-rgba-case]
    [fixture: venn/gram-style-rgba-empty-channel]
    各並びの前後に記法の空白を置けます。 [fixture: venn/db-form-style-rgba]
    [fixture: venn/lex-style-value-rgba-case]
    [fixture: venn/gram-style-rgba-empty-channel]
    [fixture: venn/gram-style-rgba-too-few-channels]
    [fixture: venn/gram-style-rgba-too-many-channels]

19. `rgb(` と同じ並び三つと `)` は `rgb-color` 単位を作ります。
    [fixture: venn/db-form-style-rgb]
    [fixture: venn/lex-style-value-rgb-unchecked-range]
    [fixture: venn/lex-style-value-rgb-multiline]
    [fixture: venn/gram-style-value-rgb-space-before-open]
    [fixture: venn/gram-style-rgb-negative-channel]
    [fixture: venn/gram-style-rgb-too-few-channels]
    [fixture: venn/gram-style-rgb-too-many-channels]
    [fixture: venn/gram-style-rgb-channel-internal-space]

20. ASCII の英字かアンダースコアと、可能な限り多くの ASCII の英字、数字、
    ハイフン、アンダースコアが `identifier` 単位を作ります。
    [fixture: venn/db-case-distinct-ids]
    [fixture: venn/db-grid-dash-identifier-bare]
    [fixture: venn/db-grid-digits-identifier-bare]
    [fixture: venn/gram-grid-nonascii-identifier-bare]
    [fixture: venn/gram-grid-spaces-identifier-bare]
    [fixture: venn/gram-first-rule-keyword-prefix-name]
    [fixture: venn/lex-first-rule-comment-before-multiline-string]

21. `"`、`"` 以外の任意個の文字、 `"` は `string` 単位を作ります。
    [fixture: venn/db-empty-identifiers]
    [fixture: venn/lex-identifier-blank-line]
    [fixture: venn/gram-string-escape-quote]

22. `,` と `:` は単位 `","` と `":"` を作ります。
    [fixture: venn/db-form-union-label-size]
    [fixture: venn/db-form-style-multiple]

`title`、`rgb`、`rgba` も含め、キーワードの英字は大文字と小文字を区別しません。
[fixture: venn/lex-keyword-set-upper] [fixture: venn/lex-keyword-union-upper]
[fixture: venn/lex-keyword-text-upper] [fixture: venn/lex-keyword-style-upper]
[fixture: venn/lex-keyword-title-upper] [fixture: venn/lex-keyword-set-letter]
[fixture: venn/lex-keyword-set-digit] [fixture: venn/lex-keyword-set-underscore]
[fixture: venn/lex-keyword-set-dash] [fixture: venn/lex-keyword-set-nonascii]
[fixture: venn/lex-style-value-rgba-case] [fixture: venn/header-word-suffix]
[fixture: venn/header-digit-suffix] [fixture: venn/header-underscore-suffix]
境界付きキーワードの直後は ASCII の英字、数字、アンダースコアではありません。
[fixture: venn/lex-keyword-set-upper] [fixture: venn/lex-keyword-union-upper]
[fixture: venn/lex-keyword-text-upper] [fixture: venn/lex-keyword-style-upper]
[fixture: venn/lex-keyword-title-upper] [fixture: venn/lex-keyword-set-letter]
[fixture: venn/lex-keyword-set-digit] [fixture: venn/lex-keyword-set-underscore]
[fixture: venn/lex-keyword-set-dash] [fixture: venn/lex-keyword-set-nonascii]
[fixture: venn/lex-style-value-rgba-case] [fixture: venn/header-word-suffix]
[fixture: venn/header-digit-suffix] [fixture: venn/header-underscore-suffix]

名前とプロパティキーの位置でも、そのキーワード単位を予約します。
[fixture: venn/lex-reserved-set-identifier]
[fixture: venn/lex-reserved-union-identifier]
[fixture: venn/lex-reserved-text-identifier]
[fixture: venn/lex-reserved-style-identifier]
[fixture: venn/lex-reserved-venn-beta-identifier]
[fixture: venn/lex-reserved-title-identifier]
[fixture: venn/lex-reserved-title-style-key]
[fixture: venn/lex-reserved-set-style-key]
空白の区切りがない `title` は識別子です。
[fixture: venn/lex-reserved-set-identifier]
[fixture: venn/lex-reserved-union-identifier]
[fixture: venn/lex-reserved-text-identifier]
[fixture: venn/lex-reserved-style-identifier]
[fixture: venn/lex-reserved-venn-beta-identifier]
[fixture: venn/lex-reserved-title-identifier]
[fixture: venn/lex-reserved-title-style-key]
[fixture: venn/lex-reserved-set-style-key]

`set"A"` のようにキーワードは引用名に直続できます。
[fixture: venn/lex-keyword-quote-no-space] [fixture: venn/header-dash-suffix]
[fixture: venn/header-nonascii-suffix] [fixture: venn/header-statement-glued]
[fixture: venn/gram-header-quote-no-space]
不正な後続文字への直続は、必要な引数を補いません。
[fixture: venn/lex-keyword-quote-no-space] [fixture: venn/header-dash-suffix]
[fixture: venn/header-nonascii-suffix] [fixture: venn/header-statement-glued]
[fixture: venn/gram-header-quote-no-space]

### 空白と値の単位

CRLF と単独の CR は、文字列とラベルの内部も含めて LF として読みます。
[fixture: venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-cr-line-end] [fixture: venn/lex-crlf-line-end]
[fixture: venn/db-grid-cr-label-bare] [fixture: venn/db-grid-crlf-label-bare]
[fixture: venn/lex-comment-swallowed-cr]

見出しの後の値の単位の外側で、先に試す規則がその文字を読まない場合は、
ASCII のスペース、タブ、 LF だけを受理します。
[fixture: venn/lex-tab-line-start] [fixture: venn/lex-tab-line-end]
[fixture: venn/lex-nbsp-header-after] [fixture: venn/lex-nbsp-line-start]
[fixture: venn/lex-nbsp-line-end] [fixture: venn/lex-nbsp-text-end]
[fixture: venn/lex-bom-line-start] [fixture: venn/lex-ff-line-start]
[fixture: venn/lex-vt-line-start] [fixture: venn/lex-ideographic-line-start]
[fixture: venn/lex-ls-line-start] [fixture: venn/lex-ps-line-start]
[fixture: venn/lex-comment-swallowed-nbsp]
[fixture: venn/lex-comment-swallowed-nbsp-between-statements]
垂直タブ、改ページ、U+00A0、U+3000、U+FEFF、U+2028、 U+2029 はそこで拒否します。
[fixture: venn/lex-tab-line-start] [fixture: venn/lex-tab-line-end]
[fixture: venn/lex-nbsp-header-after] [fixture: venn/lex-nbsp-line-start]
[fixture: venn/lex-nbsp-line-end] [fixture: venn/lex-nbsp-text-end]
[fixture: venn/lex-bom-line-start] [fixture: venn/lex-ff-line-start]
[fixture: venn/lex-vt-line-start] [fixture: venn/lex-ideographic-line-start]
[fixture: venn/lex-ls-line-start] [fixture: venn/lex-ps-line-start]

単位の位置では、図のテキストに残る `%%` の直前にある垂直タブ、改ページ、
U+00A0、U+1680、U+2000–U+200A、U+202F、U+205F、 U+3000、U+FEFF、U+2028、
U+2029 を規則 2 が飲み込みます。 [fixture: venn/lex-comment-swallowed-nbsp]
[fixture: venn/lex-comment-swallowed-nbsp-between-statements]
[fixture: venn/lex-comment-swallowed-vt]
[fixture: venn/lex-comment-swallowed-ff]
[fixture: venn/lex-comment-swallowed-ogham]
[fixture: venn/lex-comment-swallowed-en-quad]
[fixture: venn/lex-comment-swallowed-hair-space]
[fixture: venn/lex-comment-swallowed-narrow-nbsp]
[fixture: venn/lex-comment-swallowed-medium-math]
[fixture: venn/lex-comment-swallowed-ideographic]
[fixture: venn/lex-comment-swallowed-bom]
[fixture: venn/gram-comment-prefix-line-separator-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-u2029-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-u2029-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]

`%%` の前の CR は、共通のコメント行の除去より先に LF に変換します。
[fixture: venn/lex-comment-swallowed-cr]

共通の [コメント行](../common.ja.md#コメント行) の規則は、
U+2028 か U+2029 の直後のコメントの開始位置から、 `%% c` を取り除きます。
[fixture: venn/gram-comment-prefix-line-separator]
[fixture: venn/gram-comment-prefix-line-separator-u2029]
その除去か共通の [ディレクティブの除去](../common.ja.md#ディレクティブの位置)
の後に、値の単位の外側に残る U+2028 と U+2029 は拒否します。
[fixture: venn/gram-comment-prefix-line-separator]
[fixture: venn/gram-comment-prefix-line-separator-u2029]
[fixture: venn/gram-comment-prefix-line-separator-directive]
[fixture: venn/gram-comment-prefix-line-separator-u2029-directive]

単独の `%%` と `%%{ }%%` は、どちらの区切り文字の後でも図のテキストに残ります。
[fixture: venn/gram-comment-prefix-line-separator-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-u2029-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-u2029-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]

検出より前の先行空白には共通規則を適用します。
[fixture: venn/lex-tab-header-before] [fixture: venn/lex-nbsp-header-before]
[fixture: venn/lex-nel-header-before]
U+0085 は空白ではありません。 [fixture: venn/lex-tab-header-before]
[fixture: venn/lex-nbsp-header-before] [fixture: venn/lex-nel-header-before]

引用名と角括弧ラベルには LF、U+2028、U+2029 を含められ、
その文字は単位を終えません。 [fixture: venn/lex-identifier-blank-line]
[fixture: venn/lex-label-blank-line] [fixture: venn/lex-ls-quoted-value]
[fixture: venn/lex-ps-quoted-value] [fixture: venn/db-grid-ls-label-bare]
[fixture: venn/db-grid-ps-label-bare]

文字列にバックスラッシュのエスケープはなく、
文字列とラベルは閉じる必要があります。 [fixture: venn/gram-string-escape-quote]
[fixture: venn/db-grid-backslash-identifier-quoted]
[fixture: venn/gram-unclosed-id] [fixture: venn/gram-unclosed-label]
[fixture: venn/gram-unclosed-style]

タイトルの中の引用符と行内の連続する `%` はタイトルのテキストです。
[fixture: venn/db-title-quotes] [fixture: venn/db-grid-comment-title]
[fixture: venn/db-grid-comment-label-bare]
[fixture: venn/lex-after-set-label-comment-glued]
[fixture: venn/lex-after-text-string-comment-glued]
[fixture: venn/lex-bare-percent-inside-quoted-name]
[fixture: venn/lex-bare-percent-inside-bare-label]
文字列かラベル全体の中の行内の連続する `%` は値のテキストです。
[fixture: venn/db-title-quotes] [fixture: venn/db-grid-comment-title]
[fixture: venn/db-grid-comment-label-bare]
[fixture: venn/lex-after-set-label-comment-glued]
[fixture: venn/lex-after-text-string-comment-glued]
[fixture: venn/lex-bare-percent-inside-quoted-name]
[fixture: venn/lex-bare-percent-inside-bare-label]

タイトルは最初の空白の区切りの後の文字を、追加の空白も含めて保持します。
[fixture: venn/db-title-padding] [fixture: venn/db-title-only-whitespace]
[fixture: venn/db-title-value-next-line] [fixture: venn/lex-gap-title-blank]
[fixture: venn/lex-gap-title-comment] [fixture: venn/lex-gap-title-directive]
[fixture: venn/lex-title-size-number-no-space]
`title` の直後が LF のときは次の行からテキストを取れます。
[fixture: venn/db-title-padding] [fixture: venn/db-title-only-whitespace]
[fixture: venn/db-title-value-next-line] [fixture: venn/lex-gap-title-blank]
[fixture: venn/lex-gap-title-comment] [fixture: venn/lex-gap-title-directive]
[fixture: venn/lex-title-size-number-no-space]
[fixture: venn/db-after-title-colon-space] [fixture: venn/db-after-title-space]
[fixture: venn/lex-after-title-tab] [fixture: venn/lex-after-title-comment]

色の単位の各成分の前後には LF、U+2028、U+2029 を含む空白を置けますが、
`(` の前には間隔を置けません。 [fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/lex-style-value-rgb-unchecked-range]
[fixture: venn/gram-style-value-rgb-space-before-open]
[fixture: venn/db-style-rgb-line-separator]
[fixture: venn/db-style-rgba-paragraph-separator]
成分の値域は検査しません。 [fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/lex-style-value-rgb-unchecked-range]
[fixture: venn/gram-style-value-rgb-space-before-open]
[fixture: venn/db-style-rgb-line-separator]
[fixture: venn/db-style-rgba-paragraph-separator]

成分の数字と点の並びの内部に空白は置けません。
[fixture: venn/gram-style-rgb-channel-internal-space]

成分が少なすぎるか多すぎる色は拒否します。
[fixture: venn/gram-style-rgb-too-few-channels]
[fixture: venn/gram-style-rgb-too-many-channels]
[fixture: venn/gram-style-rgba-too-few-channels]
[fixture: venn/gram-style-rgba-too-many-channels]

### コメントと飲み込まれる断片

共通の [コメント領域](../common.ja.md#コメント行) は、
複数行の文字列とラベルの中も含めて trivia です。
[fixture: venn/lex-identifier-comment-line]
[fixture: venn/lex-label-comment-line] [fixture: venn/lex-style-comment-line]
[fixture: venn/lex-text-comment-line]
[fixture: venn/lex-comment-paragraph-separator]
[fixture: venn/lex-label-bare-comment-only]
[fixture: venn/lex-label-quoted-comment-only]

図のコメントは字句規則を試す位置でのみ始まり、 LF の直前で終わり、
U+2028 と U+2029 では終わりません。 [fixture: venn/lex-inline-comment-spaced]
[fixture: venn/lex-after-set-comment]
[fixture: venn/lex-inline-comment-line-separators]
[fixture: venn/lex-after-set-comment]
[fixture: venn/lex-after-set-label-comment]
[fixture: venn/lex-after-set-size-comment]
[fixture: venn/db-after-set-label-size-comment]
[fixture: venn/lex-after-union-comment]
[fixture: venn/db-after-union-label-comment]
[fixture: venn/db-after-union-size-comment]
[fixture: venn/lex-after-union-label-size-comment]
[fixture: venn/lex-after-text-comment]
[fixture: venn/lex-after-text-label-comment]
[fixture: venn/lex-after-text-string-comment]
[fixture: venn/db-after-text-string-label-comment]
[fixture: venn/lex-after-text-number-comment]
[fixture: venn/lex-after-indent-comment]
[fixture: venn/db-after-indent-id-label-comment]
[fixture: venn/db-after-indent-string-comment]
[fixture: venn/db-after-indent-string-label-comment]
[fixture: venn/db-after-indent-number-comment]
[fixture: venn/lex-after-style-comment]
[fixture: venn/lex-after-style-string-comment]
[fixture: venn/db-after-style-list-comment]

飲み込まれた空白以外の接頭辞は、残りの入力を受理するとき、
`ignored-text` 単位と VennIgnoredText 節点になります。
[fixture: venn/db-grid-comment-header-line]
[fixture: venn/lex-style-extra-id-eaten]
[fixture: venn/lex-style-extra-number-eaten]
[fixture: venn/lex-set-extra-id-eaten]
[fixture: venn/lex-set-extra-number-eaten] [fixture: venn/lex-set-colon-eaten]
[fixture: venn/header-semicolon-eaten] [fixture: venn/header-quote-eaten]
[fixture: venn/header-open-bracket-eaten] [fixture: venn/header-nonascii-eaten]
[fixture: venn/lex-text-extra-one-letter-eaten]
[fixture: venn/lex-union-extra-id-eaten]
[fixture: venn/lex-style-comment-ignored-next-property-comma]
[fixture: venn/lex-comment-ignored-bracket-label-opener]

規則 2 が飲み込む空白文字は trivia で、節点を作りません。
[fixture: venn/lex-inline-comment-spaced]
[fixture: venn/lex-bare-percent-between-set-and-text]
[fixture: venn/lex-comment-swallowed-nbsp]
[fixture: venn/lex-comment-swallowed-nbsp-between-statements]

必須の引数を飲み込んでも残りの入力は有効になりません。
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-after-set-size-comment-glued]
[fixture: venn/lex-after-text-number-comment-glued]
[fixture: venn/gram-style-numeric-only-eaten]
[fixture: venn/gram-style-required-key-eaten]
[fixture: venn/gram-union-target-eaten]
[fixture: venn/gram-eaten-fragment-between-keyword-and-id]
`set A%% c`、`set A:2%% c`、 `text A 2%% c` は拒否します。
[fixture: venn/lex-inline-comment-eats-id]
[fixture: venn/lex-after-set-size-comment-glued]
[fixture: venn/lex-after-text-number-comment-glued]
[fixture: venn/gram-style-numeric-only-eaten]
[fixture: venn/gram-style-required-key-eaten]
[fixture: venn/gram-union-target-eaten]
[fixture: venn/gram-eaten-fragment-between-keyword-and-id]

接頭辞の規則は各単位の位置で再び試します。
[fixture: venn/lex-set-two-letter-id-comment]
[fixture: venn/lex-numeric-two-digit-comment]
[fixture: venn/gram-comment-after-directive-eats-id]
[fixture: venn/lex-comment-after-directive-keeps-id]
`set AB%% c` と `text A 12%% c` は引数全体を保ちますが、
`%%` の直前で除かれたディレクティブは、一文字の引数を飲み込みの対象にできます。
[fixture: venn/lex-set-two-letter-id-comment]
[fixture: venn/lex-numeric-two-digit-comment]
[fixture: venn/gram-comment-after-directive-eats-id]
[fixture: venn/lex-comment-after-directive-keeps-id]

### ディレクティブと無視するセミコロン

共通の
[ディレクティブの境界規則](../common.ja.md#ディレクティブはトークンの境界) は、
見出し、キーワード、識別子、数の中のディレクティブを拒否します。
[fixture: venn/header-directive-inside] [fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value]
[fixture: venn/div-directive-union-target] [fixture: venn/div-directive-text-id]
[fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]
[fixture: venn/lex-unterminated-directive-next-line]
[fixture: venn/lex-unterminated-colon-directive-next-line]
裸の style 値の内部の識別子と数にも適用します。
[fixture: venn/header-directive-inside] [fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value]
[fixture: venn/div-directive-union-target] [fixture: venn/div-directive-text-id]
[fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]

文字列、ラベルの内容、タイトルの内容、色全体は、
ディレクティブを含められるテキストか文字列の単位です。
[fixture: venn/lex-identifier-directive-middle]
[fixture: venn/db-grid-directive-label-bare]
[fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-style-directive-middle]
[fixture: venn/lex-title-directive-middle]
[fixture: venn/lex-directive-style-value-color]
[fixture: venn/lex-style-value-rgb-directive-in-comma]
[fixture: venn/gram-label-bare-directive-only]
[fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-identifier-directive-only]
[fixture: venn/gram-style-value-directive-only]

角括弧と引用符の区切りは別々の文字なので、 `[` と開き引用符の間か、
閉じ引用符と `]` の間にディレクティブを置けます。
[fixture: venn/lex-directive-label-delimiter-gap]
[fixture: venn/lex-directive-label-closing-delimiter-gap]

図の単位の認識より前に、
共通の [`style` と `classDef` の行規則](../common.ja.md#style-行と-classdef-行)
が、無視する `;` を選びます。 [fixture: venn/lex-identifier-style-rule]
[fixture: venn/lex-identifier-style-rule-space]
[fixture: venn/lex-identifier-style-rule-upper]
[fixture: venn/lex-identifier-style-rule-no-hash]
[fixture: venn/lex-identifier-style-rule-other-line]
[fixture: venn/lex-identifier-style-rule-two-semicolons]
[fixture: venn/lex-label-classdef-rule] [fixture: venn/lex-style-style-rule]
[fixture: venn/lex-title-style-rule-two-semicolons]
[fixture: venn/db-grid-entity-style-value]

行の規則は、一致する行の区間の最後の `;` 一つだけを無視します。
[fixture: venn/lex-label-style-rule-three-semicolons]
[fixture: venn/lex-label-style-rule-three-semicolons-space]
[fixture: venn/lex-style-style-rule-three-semicolons]
[fixture: venn/lex-style-style-rule-three-semicolons-tab]
[fixture: venn/gram-title-style-rule-three-semicolons]
[fixture: venn/gram-title-style-rule-three-semicolons-space]
[fixture: venn/lex-identifier-style-rule-three-semicolons]
[fixture: venn/lex-identifier-style-rule-three-semicolons-space]
[fixture: venn/lex-size-selected-semicolon-space]
[fixture: venn/gram-size-two-selected-semicolons-space]
[fixture: venn/gram-size-three-selected-semicolons]
[fixture: venn/lex-identifier-style-rule]
[fixture: venn/lex-identifier-style-rule-two-semicolons]

選ばれたセミコロンには、裸の style 値の識別子と数の内部も含めて、
ディレクティブと同じ単位の境界の制限を適用します。
[fixture: venn/div-ignored-semicolon-size]
[fixture: venn/div-ignored-semicolon-set-name-selected]
[fixture: venn/div-ignored-semicolon-set-keyword-selected]
[fixture: venn/div-ignored-semicolon-title-keyword-selected]
[fixture: venn/div-ignored-semicolon-style-key-selected]
[fixture: venn/div-ignored-semicolon-style-value-selected]
[fixture: venn/div-ignored-semicolon-text-id-selected]
[fixture: venn/div-ignored-semicolon-text-number-selected]
[fixture: venn/div-ignored-semicolon-style-value-number-selected]

色全体の単位の内部では、選ばれたセミコロンは trivia です。
[fixture: venn/lex-style-hex-ignored-semicolon]
[fixture: venn/lex-style-rgb-ignored-semicolon]

## 文法

文法は、
上で名付けた単位について [common.ja.md](../common.ja.md#表記) の記法を使います。

```text
diagram = newline* header ( newline | statement )* end
statement = subset | text | style | title-line | ignored-text
subset = set-keyword name label? ( ":" number )?
        | union-keyword name-list label? ( ":" number )?
name = identifier | string
name-list = name ( "," name )*
label = quoted-label | bare-label
text = text-keyword name-list text-tail
     | implicit-text-start text-tail
text-tail = ( identifier | string ) label? | number
style = style-keyword name-list property ( "," property )*
property = identifier ":" style-value
style-value = string | style-atom+
style-atom = identifier | number | hex-color | rgb-color | rgba-color
```

| 規則                               | 節点                |
| ---------------------------------- | ------------------- |
| `diagram`                          | VennDiagram         |
| `subset`                           | VennSubsetStatement |
| `text`                             | VennTextStatement   |
| `style`                            | VennStyleStatement  |
| `property`                         | VennStyleProperty   |
| `title-line`                       | VennTitleStatement  |
| `label`                            | VennLabel           |
| 裸の `style-value`、タイトルの内容 | VennLiteral         |
| `ignored-text`                     | VennIgnoredText     |
| `identifier`                       | Identifier          |
| `string`                           | StringLiteral       |
| size か text id の `number`        | NumericLiteral      |

### 文書と文の境界

図には見出しがちょうど一つあり、文はなくても構いません。
[fixture: venn/header-only] [fixture: venn/header-only-lf]
[fixture: venn/db-same-line-statements] [fixture: venn/header-statement-on-line]
[fixture: venn/header-statement-tab] [fixture: venn/db-title-on-header]
[fixture: venn/header-twice] [fixture: venn/header-twice-same-line]
[fixture: venn/gram-bare-word]
完全な文は見出しの行も含めて一行に並べられます。 [fixture: venn/header-only]
[fixture: venn/header-only-lf] [fixture: venn/db-same-line-statements]
[fixture: venn/header-statement-on-line] [fixture: venn/header-statement-tab]
[fixture: venn/db-title-on-header] [fixture: venn/header-twice]
[fixture: venn/header-twice-same-line] [fixture: venn/gram-bare-word]
[fixture: venn/db-after-set-blank] [fixture: venn/db-after-set-crlf]
[fixture: venn/db-after-set-label-blank] [fixture: venn/db-after-set-label-crlf]
[fixture: venn/db-after-set-size-blank] [fixture: venn/db-after-set-size-crlf]
[fixture: venn/db-after-set-label-size-blank]
[fixture: venn/db-after-set-label-size-crlf]
[fixture: venn/db-after-union-blank] [fixture: venn/db-after-union-crlf]
[fixture: venn/db-after-union-label-blank]
[fixture: venn/db-after-union-label-crlf]
[fixture: venn/db-after-union-size-blank]
[fixture: venn/db-after-union-size-crlf]
[fixture: venn/db-after-union-label-size-blank]
[fixture: venn/db-after-union-label-size-crlf]
[fixture: venn/db-after-text-id-blank] [fixture: venn/db-after-text-id-crlf]
[fixture: venn/db-after-text-id-label-blank]
[fixture: venn/db-after-text-id-label-crlf]
[fixture: venn/db-after-text-string-blank]
[fixture: venn/db-after-text-string-crlf]
[fixture: venn/db-after-text-string-label-blank]
[fixture: venn/db-after-text-string-label-crlf]
[fixture: venn/db-after-text-number-blank]
[fixture: venn/db-after-text-number-crlf]
[fixture: venn/db-after-indent-id-blank] [fixture: venn/db-after-indent-id-crlf]
[fixture: venn/db-after-indent-id-label-blank]
[fixture: venn/db-after-indent-id-label-crlf]
[fixture: venn/db-after-indent-string-blank]
[fixture: venn/db-after-indent-string-crlf]
[fixture: venn/db-after-indent-string-label-blank]
[fixture: venn/db-after-indent-string-label-crlf]
[fixture: venn/db-after-indent-number-blank]
[fixture: venn/db-after-indent-number-crlf] [fixture: venn/db-after-style-blank]
[fixture: venn/db-after-style-crlf] [fixture: venn/db-after-style-string-blank]
[fixture: venn/db-after-style-string-crlf]
[fixture: venn/db-after-style-list-blank]
[fixture: venn/db-after-style-list-crlf] [fixture: venn/db-after-title-blank]
[fixture: venn/db-after-title-crlf]

タイトルは許される行のテキストの残りを取るので、
`title T set A` に set 文はありません。
[fixture: venn/lex-title-back-to-back-set-not-statement]

タイトル以外の文の単位の間には、文字列、ラベル、色の単位の内部を除き、
newline を置けません。 [fixture: venn/lex-gap-set-lf]
[fixture: venn/lex-gap-set-blank] [fixture: venn/lex-gap-set-comment]
[fixture: venn/lex-gap-set-directive] [fixture: venn/lex-gap-union-lf]
[fixture: venn/lex-gap-text-lf] [fixture: venn/lex-gap-style-lf]
[fixture: venn/gram-size-newline] [fixture: venn/lex-label-blank-line]
[fixture: venn/lex-identifier-blank-line] [fixture: venn/lex-style-blank-line]
[fixture: venn/lex-text-blank-line]
[fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/gram-set-label-next-line]
[fixture: venn/gram-set-label-comment-gap]
[fixture: venn/gram-set-label-directive-gap]
[fixture: venn/gram-set-label-blank-gap] [fixture: venn/gram-set-label-crlf-gap]
[fixture: venn/gram-set-label-size-label-next-line]
[fixture: venn/gram-set-label-size-label-comment-gap]
[fixture: venn/gram-set-label-size-label-directive-gap]
[fixture: venn/gram-set-label-size-label-blank-gap]
[fixture: venn/gram-set-label-size-label-crlf-gap]
[fixture: venn/gram-set-size-next-line]
[fixture: venn/gram-set-size-comment-gap]
[fixture: venn/gram-set-size-directive-gap]
[fixture: venn/gram-set-size-blank-gap] [fixture: venn/gram-set-size-crlf-gap]
[fixture: venn/gram-set-label-size-size-next-line]
[fixture: venn/gram-set-label-size-size-comment-gap]
[fixture: venn/gram-set-label-size-size-directive-gap]
[fixture: venn/gram-set-label-size-size-blank-gap]
[fixture: venn/gram-set-label-size-size-crlf-gap]
[fixture: venn/gram-union-label-next-line]
[fixture: venn/gram-union-label-comment-gap]
[fixture: venn/gram-union-label-directive-gap]
[fixture: venn/gram-union-label-blank-gap]
[fixture: venn/gram-union-label-crlf-gap]
[fixture: venn/gram-union-label-size-label-next-line]
[fixture: venn/gram-union-label-size-label-comment-gap]
[fixture: venn/gram-union-label-size-label-directive-gap]
[fixture: venn/gram-union-label-size-label-blank-gap]
[fixture: venn/gram-union-label-size-label-crlf-gap]
[fixture: venn/gram-union-size-next-line]
[fixture: venn/gram-union-size-comment-gap]
[fixture: venn/gram-union-size-directive-gap]
[fixture: venn/gram-union-size-blank-gap]
[fixture: venn/gram-union-size-crlf-gap]
[fixture: venn/gram-union-label-size-size-next-line]
[fixture: venn/gram-union-label-size-size-comment-gap]
[fixture: venn/gram-union-label-size-size-directive-gap]
[fixture: venn/gram-union-label-size-size-blank-gap]
[fixture: venn/gram-union-label-size-size-crlf-gap]
[fixture: venn/gram-text-target-id-next-line]
[fixture: venn/gram-text-target-id-comment-gap]
[fixture: venn/gram-text-target-id-directive-gap]
[fixture: venn/gram-text-target-id-blank-gap]
[fixture: venn/gram-text-target-id-crlf-gap]
[fixture: venn/gram-text-target-string-next-line]
[fixture: venn/gram-text-target-string-comment-gap]
[fixture: venn/gram-text-target-string-directive-gap]
[fixture: venn/gram-text-target-string-blank-gap]
[fixture: venn/gram-text-target-string-crlf-gap]
[fixture: venn/gram-text-target-number-next-line]
[fixture: venn/gram-text-target-number-comment-gap]
[fixture: venn/gram-text-target-number-directive-gap]
[fixture: venn/gram-text-target-number-blank-gap]
[fixture: venn/gram-text-target-number-crlf-gap]
[fixture: venn/gram-text-id-label-next-line]
[fixture: venn/gram-text-id-label-comment-gap]
[fixture: venn/gram-text-id-label-directive-gap]
[fixture: venn/gram-text-id-label-blank-gap]
[fixture: venn/gram-text-id-label-crlf-gap]
[fixture: venn/gram-text-string-label-next-line]
[fixture: venn/gram-text-string-label-comment-gap]
[fixture: venn/gram-text-string-label-directive-gap]
[fixture: venn/gram-text-string-label-blank-gap]
[fixture: venn/gram-text-string-label-crlf-gap]
[fixture: venn/gram-indent-keyword-id-next-line]
[fixture: venn/gram-indent-keyword-id-comment-gap]
[fixture: venn/gram-indent-keyword-id-directive-gap]
[fixture: venn/gram-indent-keyword-id-blank-gap]
[fixture: venn/gram-indent-keyword-id-crlf-gap]
[fixture: venn/gram-indent-keyword-string-next-line]
[fixture: venn/gram-indent-keyword-string-comment-gap]
[fixture: venn/gram-indent-keyword-string-directive-gap]
[fixture: venn/gram-indent-keyword-string-blank-gap]
[fixture: venn/gram-indent-keyword-string-crlf-gap]
[fixture: venn/gram-indent-keyword-number-next-line]
[fixture: venn/gram-indent-keyword-number-comment-gap]
[fixture: venn/gram-indent-keyword-number-directive-gap]
[fixture: venn/gram-indent-keyword-number-blank-gap]
[fixture: venn/gram-indent-keyword-number-crlf-gap]
[fixture: venn/gram-indent-id-label-next-line]
[fixture: venn/gram-indent-id-label-comment-gap]
[fixture: venn/gram-indent-id-label-directive-gap]
[fixture: venn/gram-indent-id-label-blank-gap]
[fixture: venn/gram-indent-id-label-crlf-gap]
[fixture: venn/gram-indent-string-label-next-line]
[fixture: venn/gram-indent-string-label-comment-gap]
[fixture: venn/gram-indent-string-label-directive-gap]
[fixture: venn/gram-indent-string-label-blank-gap]
[fixture: venn/gram-indent-string-label-crlf-gap]
[fixture: venn/gram-set-colon-size-comment-gap]
[fixture: venn/gram-set-colon-size-directive-gap]
[fixture: venn/gram-set-colon-size-blank-gap]
[fixture: venn/gram-set-colon-size-crlf-gap]
[fixture: venn/gram-set-label-colon-size-next-line]
[fixture: venn/gram-set-label-colon-size-comment-gap]
[fixture: venn/gram-set-label-colon-size-directive-gap]
[fixture: venn/gram-set-label-colon-size-blank-gap]
[fixture: venn/gram-set-label-colon-size-crlf-gap]
[fixture: venn/gram-union-colon-size-next-line]
[fixture: venn/gram-union-colon-size-comment-gap]
[fixture: venn/gram-union-colon-size-directive-gap]
[fixture: venn/gram-union-colon-size-blank-gap]
[fixture: venn/gram-union-colon-size-crlf-gap]
[fixture: venn/gram-union-label-colon-size-next-line]
[fixture: venn/gram-union-label-colon-size-comment-gap]
[fixture: venn/gram-union-label-colon-size-directive-gap]
[fixture: venn/gram-union-label-colon-size-blank-gap]
[fixture: venn/gram-union-label-colon-size-crlf-gap]
[fixture: venn/gram-style-target-property-next-line]
[fixture: venn/gram-style-target-property-comment-gap]
[fixture: venn/gram-style-target-property-directive-gap]
[fixture: venn/gram-style-target-property-blank-gap]
[fixture: venn/gram-style-target-property-crlf-gap]
[fixture: venn/gram-style-property-colon-next-line]
[fixture: venn/gram-style-property-colon-comment-gap]
[fixture: venn/gram-style-property-colon-directive-gap]
[fixture: venn/gram-style-property-colon-blank-gap]
[fixture: venn/gram-style-property-colon-crlf-gap]
[fixture: venn/gram-style-colon-value-next-line]
[fixture: venn/gram-style-colon-value-comment-gap]
[fixture: venn/gram-style-colon-value-directive-gap]
[fixture: venn/gram-style-colon-value-blank-gap]
[fixture: venn/gram-style-colon-value-crlf-gap]
[fixture: venn/gram-comment-extra-id-before-existing-label]

引数と省略可能な接尾辞の間にはスペースとタブを置けます。
[fixture: venn/db-set-label-space] [fixture: venn/db-set-label-tab]
[fixture: venn/db-set-colon-size-inline-directive]
[fixture: venn/gram-text-target-id-inline-directive]
[fixture: venn/db-text-target-string-inline-directive]
[fixture: venn/gram-style-target-property-inline-directive]
[fixture: venn/db-style-property-colon-inline-directive]
[fixture: venn/db-style-colon-value-inline-directive]
[fixture: venn/db-set-label-size-label-space]
[fixture: venn/db-set-label-size-label-tab] [fixture: venn/db-set-size-space]
[fixture: venn/db-set-size-tab] [fixture: venn/db-set-label-size-size-space]
[fixture: venn/db-set-label-size-size-tab] [fixture: venn/db-union-label-space]
[fixture: venn/db-union-label-tab]
[fixture: venn/db-union-label-size-label-space]
[fixture: venn/db-union-label-size-label-tab]
[fixture: venn/db-union-size-space] [fixture: venn/db-union-size-tab]
[fixture: venn/db-union-label-size-size-space]
[fixture: venn/db-union-label-size-size-tab]
[fixture: venn/db-text-target-id-tab]
[fixture: venn/db-text-target-string-space]
[fixture: venn/db-text-target-string-tab]
[fixture: venn/db-text-target-number-space]
[fixture: venn/db-text-target-number-tab] [fixture: venn/db-text-id-label-space]
[fixture: venn/db-text-id-label-tab] [fixture: venn/db-text-string-label-space]
[fixture: venn/db-text-string-label-tab]
[fixture: venn/db-indent-keyword-id-tab]
[fixture: venn/db-indent-keyword-string-space]
[fixture: venn/db-indent-keyword-string-tab]
[fixture: venn/db-indent-keyword-number-space]
[fixture: venn/db-indent-keyword-number-tab]
[fixture: venn/db-indent-id-label-space] [fixture: venn/db-indent-id-label-tab]
[fixture: venn/db-indent-string-label-space]
[fixture: venn/db-indent-string-label-tab] [fixture: venn/db-set-colon-size-tab]
[fixture: venn/db-set-label-colon-size-space]
[fixture: venn/db-set-label-colon-size-tab]
[fixture: venn/db-union-colon-size-space]
[fixture: venn/db-union-colon-size-tab]
[fixture: venn/db-union-label-colon-size-space]
[fixture: venn/db-union-label-colon-size-tab]
[fixture: venn/db-style-target-property-space]
[fixture: venn/db-style-target-property-tab]
[fixture: venn/db-style-property-colon-space]
[fixture: venn/db-style-property-colon-tab]
[fixture: venn/db-style-colon-value-space]
[fixture: venn/db-style-colon-value-tab]
[fixture: venn/db-set-label-inline-directive]
[fixture: venn/db-set-label-size-label-inline-directive]
[fixture: venn/db-set-size-inline-directive]
[fixture: venn/db-set-label-size-size-inline-directive]
[fixture: venn/db-union-label-inline-directive]
[fixture: venn/db-union-label-size-label-inline-directive]
[fixture: venn/db-union-size-inline-directive]
[fixture: venn/db-union-label-size-size-inline-directive]
[fixture: venn/gram-text-target-number-inline-directive]
[fixture: venn/db-text-id-label-inline-directive]
[fixture: venn/db-text-string-label-inline-directive]
[fixture: venn/gram-indent-keyword-id-inline-directive]
[fixture: venn/db-indent-keyword-string-inline-directive]
[fixture: venn/gram-indent-keyword-number-inline-directive]
[fixture: venn/db-indent-id-label-inline-directive]
[fixture: venn/db-indent-string-label-inline-directive]
[fixture: venn/db-set-label-colon-size-inline-directive]
[fixture: venn/db-union-colon-size-inline-directive]
[fixture: venn/db-union-label-colon-size-inline-directive]
完全な単位の間の行内ディレクティブは、区切りの空白を補いません。
[fixture: venn/db-set-label-space] [fixture: venn/db-set-label-tab]
[fixture: venn/db-set-colon-size-inline-directive]
[fixture: venn/gram-text-target-id-inline-directive]
[fixture: venn/db-text-target-string-inline-directive]
[fixture: venn/gram-style-target-property-inline-directive]
[fixture: venn/db-style-property-colon-inline-directive]
[fixture: venn/db-style-colon-value-inline-directive]
[fixture: venn/db-set-label-size-label-space]
[fixture: venn/db-set-label-size-label-tab] [fixture: venn/db-set-size-space]
[fixture: venn/db-set-size-tab] [fixture: venn/db-set-label-size-size-space]
[fixture: venn/db-set-label-size-size-tab] [fixture: venn/db-union-label-space]
[fixture: venn/db-union-label-tab]
[fixture: venn/db-union-label-size-label-space]
[fixture: venn/db-union-label-size-label-tab]
[fixture: venn/db-union-size-space] [fixture: venn/db-union-size-tab]
[fixture: venn/db-union-label-size-size-space]
[fixture: venn/db-union-label-size-size-tab]
[fixture: venn/db-text-target-id-tab]
[fixture: venn/db-text-target-string-space]
[fixture: venn/db-text-target-string-tab]
[fixture: venn/db-text-target-number-space]
[fixture: venn/db-text-target-number-tab] [fixture: venn/db-text-id-label-space]
[fixture: venn/db-text-id-label-tab] [fixture: venn/db-text-string-label-space]
[fixture: venn/db-text-string-label-tab]
[fixture: venn/db-indent-keyword-id-tab]
[fixture: venn/db-indent-keyword-string-space]
[fixture: venn/db-indent-keyword-string-tab]
[fixture: venn/db-indent-keyword-number-space]
[fixture: venn/db-indent-keyword-number-tab]
[fixture: venn/db-indent-id-label-space] [fixture: venn/db-indent-id-label-tab]
[fixture: venn/db-indent-string-label-space]
[fixture: venn/db-indent-string-label-tab] [fixture: venn/db-set-colon-size-tab]
[fixture: venn/db-set-label-colon-size-space]
[fixture: venn/db-set-label-colon-size-tab]
[fixture: venn/db-union-colon-size-space]
[fixture: venn/db-union-colon-size-tab]
[fixture: venn/db-union-label-colon-size-space]
[fixture: venn/db-union-label-colon-size-tab]
[fixture: venn/db-style-target-property-space]
[fixture: venn/db-style-target-property-tab]
[fixture: venn/db-style-property-colon-space]
[fixture: venn/db-style-property-colon-tab]
[fixture: venn/db-style-colon-value-space]
[fixture: venn/db-style-colon-value-tab]
[fixture: venn/db-set-label-inline-directive]
[fixture: venn/db-set-label-size-label-inline-directive]
[fixture: venn/db-set-size-inline-directive]
[fixture: venn/db-set-label-size-size-inline-directive]
[fixture: venn/db-union-label-inline-directive]
[fixture: venn/db-union-label-size-label-inline-directive]
[fixture: venn/db-union-size-inline-directive]
[fixture: venn/db-union-label-size-size-inline-directive]
[fixture: venn/gram-text-target-number-inline-directive]
[fixture: venn/db-text-id-label-inline-directive]
[fixture: venn/db-text-string-label-inline-directive]
[fixture: venn/gram-indent-keyword-id-inline-directive]
[fixture: venn/db-indent-keyword-string-inline-directive]
[fixture: venn/gram-indent-keyword-number-inline-directive]
[fixture: venn/db-indent-id-label-inline-directive]
[fixture: venn/db-indent-string-label-inline-directive]
[fixture: venn/db-set-label-colon-size-inline-directive]
[fixture: venn/db-union-colon-size-inline-directive]
[fixture: venn/db-union-label-colon-size-inline-directive]

閉じていないディレクティブには共通のディレクティブ規則を適用します。
[fixture: venn/lex-after-set-directive-unclosed]
[fixture: venn/lex-after-set-directive-word-unclosed]
[fixture: venn/db-set-label-unclosed-directive-gap]
[fixture: venn/gram-set-colon-size-unclosed-directive-gap]
[fixture: venn/gram-text-target-id-unclosed-directive-gap]
[fixture: venn/gram-style-colon-value-unclosed-directive-gap]
[fixture: venn/db-set-label-size-label-unclosed-directive-gap]
[fixture: venn/db-set-size-unclosed-directive-gap]
[fixture: venn/db-set-label-size-size-unclosed-directive-gap]
[fixture: venn/db-union-label-unclosed-directive-gap]
[fixture: venn/db-union-label-size-label-unclosed-directive-gap]
[fixture: venn/db-union-size-unclosed-directive-gap]
[fixture: venn/db-union-label-size-size-unclosed-directive-gap]
[fixture: venn/gram-text-target-string-unclosed-directive-gap]
[fixture: venn/gram-text-target-number-unclosed-directive-gap]
[fixture: venn/db-text-id-label-unclosed-directive-gap]
[fixture: venn/db-text-string-label-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-id-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-string-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-number-unclosed-directive-gap]
[fixture: venn/db-indent-id-label-unclosed-directive-gap]
[fixture: venn/db-indent-string-label-unclosed-directive-gap]
[fixture: venn/gram-set-label-colon-size-unclosed-directive-gap]
[fixture: venn/gram-union-colon-size-unclosed-directive-gap]
[fixture: venn/gram-union-label-colon-size-unclosed-directive-gap]
[fixture: venn/gram-style-target-property-unclosed-directive-gap]
[fixture: venn/gram-style-property-colon-unclosed-directive-gap]
その前の完全な文は受理しますが、必須の引数が欠ければ拒否します。
[fixture: venn/lex-after-set-directive-unclosed]
[fixture: venn/lex-after-set-directive-word-unclosed]
[fixture: venn/db-set-label-unclosed-directive-gap]
[fixture: venn/gram-set-colon-size-unclosed-directive-gap]
[fixture: venn/gram-text-target-id-unclosed-directive-gap]
[fixture: venn/gram-style-colon-value-unclosed-directive-gap]
[fixture: venn/db-set-label-size-label-unclosed-directive-gap]
[fixture: venn/db-set-size-unclosed-directive-gap]
[fixture: venn/db-set-label-size-size-unclosed-directive-gap]
[fixture: venn/db-union-label-unclosed-directive-gap]
[fixture: venn/db-union-label-size-label-unclosed-directive-gap]
[fixture: venn/db-union-size-unclosed-directive-gap]
[fixture: venn/db-union-label-size-size-unclosed-directive-gap]
[fixture: venn/gram-text-target-string-unclosed-directive-gap]
[fixture: venn/gram-text-target-number-unclosed-directive-gap]
[fixture: venn/db-text-id-label-unclosed-directive-gap]
[fixture: venn/db-text-string-label-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-id-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-string-unclosed-directive-gap]
[fixture: venn/gram-indent-keyword-number-unclosed-directive-gap]
[fixture: venn/db-indent-id-label-unclosed-directive-gap]
[fixture: venn/db-indent-string-label-unclosed-directive-gap]
[fixture: venn/gram-set-label-colon-size-unclosed-directive-gap]
[fixture: venn/gram-union-colon-size-unclosed-directive-gap]
[fixture: venn/gram-union-label-colon-size-unclosed-directive-gap]
[fixture: venn/gram-style-target-property-unclosed-directive-gap]
[fixture: venn/gram-style-property-colon-unclosed-directive-gap]
[fixture: venn/lex-after-set-directive]
[fixture: venn/lex-after-set-label-directive]
[fixture: venn/lex-after-set-size-directive]
[fixture: venn/db-after-set-label-size-directive]
[fixture: venn/db-after-set-label-size-unclosed-directive]
[fixture: venn/lex-after-union-directive]
[fixture: venn/db-after-union-label-directive]
[fixture: venn/db-after-union-label-unclosed-directive]
[fixture: venn/db-after-union-size-directive]
[fixture: venn/db-after-union-size-unclosed-directive]
[fixture: venn/lex-after-union-label-size-directive]
[fixture: venn/lex-after-text-directive]
[fixture: venn/lex-after-text-label-directive]
[fixture: venn/lex-after-text-string-directive]
[fixture: venn/db-after-text-string-label-directive]
[fixture: venn/db-after-text-string-label-unclosed-directive]
[fixture: venn/lex-after-text-number-directive]
[fixture: venn/lex-after-indent-directive]
[fixture: venn/db-after-indent-id-label-directive]
[fixture: venn/db-after-indent-id-label-unclosed-directive]
[fixture: venn/db-after-indent-string-directive]
[fixture: venn/db-after-indent-string-unclosed-directive]
[fixture: venn/db-after-indent-string-label-directive]
[fixture: venn/db-after-indent-string-label-unclosed-directive]
[fixture: venn/db-after-indent-number-directive]
[fixture: venn/db-after-indent-number-unclosed-directive]
[fixture: venn/lex-after-style-directive]
[fixture: venn/lex-after-style-string-directive]
[fixture: venn/db-after-style-list-directive]
[fixture: venn/db-after-style-list-unclosed-directive]
[fixture: venn/lex-after-title-directive]

セミコロンは文の区切りではありません。 [fixture: venn/header-semicolon]
[fixture: venn/header-semicolon-spaced] [fixture: venn/lex-after-set-semicolon]
[fixture: venn/lex-after-set-double-semicolon]
[fixture: venn/lex-after-text-semicolon]
[fixture: venn/lex-after-style-semicolon]
[fixture: venn/lex-after-title-semicolon] [fixture: venn/header-semicolon-eaten]
[fixture: venn/db-after-style-hex-semicolon]
[fixture: venn/db-after-style-hex-semicolon-spaced]
[fixture: venn/gram-after-style-hex-double-semicolon]
値の外の選ばれなかったセミコロンは、
コメントの接頭辞の規則が飲み込む場合を除いて拒否します。
[fixture: venn/header-semicolon] [fixture: venn/header-semicolon-spaced]
[fixture: venn/lex-after-set-semicolon]
[fixture: venn/lex-after-set-double-semicolon]
[fixture: venn/lex-after-text-semicolon]
[fixture: venn/lex-after-style-semicolon]
[fixture: venn/lex-after-title-semicolon] [fixture: venn/header-semicolon-eaten]
[fixture: venn/db-after-style-hex-semicolon]
[fixture: venn/db-after-style-hex-semicolon-spaced]
[fixture: venn/gram-after-style-hex-double-semicolon]
[fixture: venn/lex-after-set-semicolon]
[fixture: venn/lex-after-set-semicolon-spaced]
[fixture: venn/lex-after-set-double-semicolon]
[fixture: venn/gram-after-set-spaced-semicolons]
[fixture: venn/lex-after-set-label-semicolon]
[fixture: venn/lex-after-set-label-semicolon-spaced]
[fixture: venn/lex-after-set-label-double-semicolon]
[fixture: venn/gram-after-set-label-spaced-semicolons]
[fixture: venn/lex-after-set-size-semicolon]
[fixture: venn/lex-after-set-size-semicolon-spaced]
[fixture: venn/lex-after-set-size-double-semicolon]
[fixture: venn/gram-after-set-size-spaced-semicolons]
[fixture: venn/gram-after-set-label-size-semicolon]
[fixture: venn/gram-after-set-label-size-semicolon-spaced]
[fixture: venn/gram-after-set-label-size-double-semicolon]
[fixture: venn/gram-after-set-label-size-spaced-semicolons]
[fixture: venn/lex-after-union-semicolon]
[fixture: venn/lex-after-union-semicolon-spaced]
[fixture: venn/lex-after-union-double-semicolon]
[fixture: venn/gram-after-union-spaced-semicolons]
[fixture: venn/gram-after-union-label-semicolon]
[fixture: venn/gram-after-union-label-semicolon-spaced]
[fixture: venn/gram-after-union-label-double-semicolon]
[fixture: venn/gram-after-union-label-spaced-semicolons]
[fixture: venn/gram-after-union-size-semicolon]
[fixture: venn/gram-after-union-size-semicolon-spaced]
[fixture: venn/gram-after-union-size-double-semicolon]
[fixture: venn/gram-after-union-size-spaced-semicolons]
[fixture: venn/lex-after-union-label-size-semicolon]
[fixture: venn/lex-after-union-label-size-semicolon-spaced]
[fixture: venn/lex-after-union-label-size-double-semicolon]
[fixture: venn/gram-after-union-label-size-spaced-semicolons]
[fixture: venn/lex-after-text-semicolon]
[fixture: venn/lex-after-text-semicolon-spaced]
[fixture: venn/lex-after-text-double-semicolon]
[fixture: venn/gram-after-text-id-spaced-semicolons]
[fixture: venn/lex-after-text-label-semicolon]
[fixture: venn/lex-after-text-label-semicolon-spaced]
[fixture: venn/lex-after-text-label-double-semicolon]
[fixture: venn/gram-after-text-id-label-spaced-semicolons]
[fixture: venn/lex-after-text-string-semicolon]
[fixture: venn/lex-after-text-string-semicolon-spaced]
[fixture: venn/lex-after-text-string-double-semicolon]
[fixture: venn/gram-after-text-string-spaced-semicolons]
[fixture: venn/gram-after-text-string-label-semicolon]
[fixture: venn/gram-after-text-string-label-semicolon-spaced]
[fixture: venn/gram-after-text-string-label-double-semicolon]
[fixture: venn/gram-after-text-string-label-spaced-semicolons]
[fixture: venn/lex-after-text-number-semicolon]
[fixture: venn/lex-after-text-number-semicolon-spaced]
[fixture: venn/lex-after-text-number-double-semicolon]
[fixture: venn/gram-after-text-number-spaced-semicolons]
[fixture: venn/lex-after-indent-semicolon]
[fixture: venn/lex-after-indent-semicolon-spaced]
[fixture: venn/lex-after-indent-double-semicolon]
[fixture: venn/gram-after-indent-id-spaced-semicolons]
[fixture: venn/gram-after-indent-id-label-semicolon]
[fixture: venn/gram-after-indent-id-label-semicolon-spaced]
[fixture: venn/gram-after-indent-id-label-double-semicolon]
[fixture: venn/gram-after-indent-id-label-spaced-semicolons]
[fixture: venn/gram-after-indent-string-semicolon]
[fixture: venn/gram-after-indent-string-semicolon-spaced]
[fixture: venn/gram-after-indent-string-double-semicolon]
[fixture: venn/gram-after-indent-string-spaced-semicolons]
[fixture: venn/gram-after-indent-string-label-semicolon]
[fixture: venn/gram-after-indent-string-label-semicolon-spaced]
[fixture: venn/gram-after-indent-string-label-double-semicolon]
[fixture: venn/gram-after-indent-string-label-spaced-semicolons]
[fixture: venn/gram-after-indent-number-semicolon]
[fixture: venn/gram-after-indent-number-semicolon-spaced]
[fixture: venn/gram-after-indent-number-double-semicolon]
[fixture: venn/gram-after-indent-number-spaced-semicolons]
[fixture: venn/lex-after-style-semicolon]
[fixture: venn/lex-after-style-semicolon-spaced]
[fixture: venn/lex-after-style-double-semicolon]
[fixture: venn/gram-after-style-spaced-semicolons]
[fixture: venn/lex-after-style-string-semicolon]
[fixture: venn/lex-after-style-string-semicolon-spaced]
[fixture: venn/lex-after-style-string-double-semicolon]
[fixture: venn/gram-after-style-string-spaced-semicolons]
[fixture: venn/gram-after-style-list-semicolon]
[fixture: venn/gram-after-style-list-semicolon-spaced]
[fixture: venn/gram-after-style-list-double-semicolon]
[fixture: venn/gram-after-style-list-spaced-semicolons]
[fixture: venn/lex-after-title-semicolon]
[fixture: venn/lex-after-title-semicolon-spaced]
[fixture: venn/lex-after-title-double-semicolon]
[fixture: venn/gram-after-title-spaced-semicolons]

`":"` 単位で文を終えることはできません。
[fixture: venn/gram-after-set-colon-space]
[fixture: venn/gram-after-set-label-colon-space]
[fixture: venn/gram-after-set-size-colon-space]
[fixture: venn/gram-after-set-label-size-colon-space]
[fixture: venn/gram-after-union-colon-space]
[fixture: venn/gram-after-union-label-colon-space]
[fixture: venn/gram-after-union-size-colon-space]
[fixture: venn/gram-after-union-label-size-colon-space]
[fixture: venn/gram-after-text-id-colon-space]
[fixture: venn/gram-after-text-id-label-colon-space]
[fixture: venn/gram-after-text-string-colon-space]
[fixture: venn/gram-after-text-string-label-colon-space]
[fixture: venn/gram-after-text-number-colon-space]
[fixture: venn/gram-after-indent-id-colon-space]
[fixture: venn/gram-after-indent-id-label-colon-space]
[fixture: venn/gram-after-indent-string-colon-space]
[fixture: venn/gram-after-indent-string-label-colon-space]
[fixture: venn/gram-after-indent-number-colon-space]
[fixture: venn/gram-after-style-colon-space]
[fixture: venn/gram-after-style-string-colon-space]
[fixture: venn/gram-after-style-list-colon-space]
[fixture: venn/db-after-title-colon-space]

テキスト末尾は共通規則の追加の LF を補います。 [fixture: venn/header-only]
[fixture: venn/header-only-lf] [fixture: venn/db-set-eof]
[fixture: venn/db-set-label-eof] [fixture: venn/db-set-size-eof]
[fixture: venn/db-set-label-size-eof] [fixture: venn/db-union-eof]
[fixture: venn/db-union-label-eof] [fixture: venn/db-union-size-eof]
[fixture: venn/db-union-label-size-eof] [fixture: venn/db-text-id-eof]
[fixture: venn/db-text-id-label-eof] [fixture: venn/db-text-string-eof]
[fixture: venn/db-text-string-label-eof] [fixture: venn/db-text-number-eof]
[fixture: venn/db-indent-id-eof] [fixture: venn/db-indent-id-label-eof]
[fixture: venn/db-indent-string-eof] [fixture: venn/db-indent-string-label-eof]
[fixture: venn/db-indent-number-eof] [fixture: venn/db-style-eof]
[fixture: venn/db-style-string-eof] [fixture: venn/db-style-list-eof]
[fixture: venn/db-title-eof]

### 集合と名前のリスト

`set` は名前を一つ取り、 `union` はカンマで区切った名前を二つ以上取ります。
[fixture: venn/db-form-set] [fixture: venn/db-form-union]
[fixture: venn/gram-set-list] [fixture: venn/gram-union-one]
[fixture: venn/gram-extra-set-no-id] [fixture: venn/gram-extra-union-no-id]

各集合は角括弧ラベルとその後のコロンと数値の size を持て、
どちらか一方だけでも構いません。 [fixture: venn/db-form-set-label]
[fixture: venn/db-form-set-size] [fixture: venn/db-form-set-label-size]
[fixture: venn/db-form-union-label] [fixture: venn/db-form-union-size]
[fixture: venn/db-form-union-label-size]
[fixture: venn/gram-subset-label-after-size]
size の後のラベルは拒否します。 [fixture: venn/db-form-set-label]
[fixture: venn/db-form-set-size] [fixture: venn/db-form-set-label-size]
[fixture: venn/db-form-union-label] [fixture: venn/db-form-union-size]
[fixture: venn/db-form-union-label-size]
[fixture: venn/gram-subset-label-after-size]

名前のリストは空でなく、順序と重複する名前を保ち、
空の項目と末尾のカンマを持ちません。 [fixture: venn/db-union-repeated-member]
[fixture: venn/db-text-comma-list] [fixture: venn/gram-name-list-empty]
[fixture: venn/gram-union-trailing-comma]
[fixture: venn/gram-style-trailing-comma]
[fixture: venn/gram-repeated-target-lists]
[fixture: venn/gram-name-list-empty-middle]

カンマと次の名前の間の newline、空行、コメントを終える LF、CRLF、
U+2028 は拒否します。 [fixture: venn/gram-name-list-comma-comment-gap]
[fixture: venn/gram-name-list-comma-blank-gap]
[fixture: venn/gram-name-list-comma-crlf-gap]
[fixture: venn/gram-name-list-comma-line-separator]

名前のリストのカンマの前後にはディレクティブを置けます。
[fixture: venn/lex-name-list-comma-directive]

名前は裸か二重引用で、数値ではありません。 [fixture: venn/db-form-set]
[fixture: venn/db-empty-identifiers] [fixture: venn/gram-set-numeric-name]
[fixture: venn/gram-text-numeric-target]
空の引用名は受理します。 [fixture: venn/db-form-set]
[fixture: venn/db-empty-identifiers] [fixture: venn/gram-set-numeric-name]
[fixture: venn/gram-text-numeric-target]

size は一つの数の単位である必要があります。 [fixture: venn/gram-size-empty]
[fixture: venn/gram-size-exponent] [fixture: venn/gram-size-trailing-point]
[fixture: venn/gram-size-hex] [fixture: venn/gram-size-infinity]
[fixture: venn/gram-size-nan] [fixture: venn/gram-size-fullwidth]
[fixture: venn/gram-size-suffix]
指数、末尾の点、十六進記法、`NaN`、`Infinity`、 ASCII 以外の数字、
後続の識別子は拒否します。 [fixture: venn/gram-size-empty]
[fixture: venn/gram-size-exponent] [fixture: venn/gram-size-trailing-point]
[fixture: venn/gram-size-hex] [fixture: venn/gram-size-infinity]
[fixture: venn/gram-size-nan] [fixture: venn/gram-size-fullwidth]
[fixture: venn/gram-size-suffix]

### text と暗黙 text モード

明示の `text` は対象名のリストと、 id として識別子、文字列、
数のいずれかを持ちます。 [fixture: venn/db-form-text-id]
[fixture: venn/db-form-text-string] [fixture: venn/db-form-text-number]
[fixture: venn/db-form-text-id-label] [fixture: venn/db-form-text-string-label]
[fixture: venn/gram-text-no-id] [fixture: venn/gram-size-numeric-label]
識別子と文字列の id だけが角括弧ラベルを持てます。
[fixture: venn/db-form-text-id] [fixture: venn/db-form-text-string]
[fixture: venn/db-form-text-number] [fixture: venn/db-form-text-id-label]
[fixture: venn/db-form-text-string-label] [fixture: venn/gram-text-no-id]
[fixture: venn/gram-size-numeric-label]

暗黙の text は同じ id とラベルの選択肢を持ち、書かれた対象名を持ちません。
[fixture: venn/db-form-indent-id] [fixture: venn/db-form-indent-string]
[fixture: venn/db-form-indent-number] [fixture: venn/db-form-indent-id-label]
[fixture: venn/db-form-indent-string-label]

完了した `set` か `union` は、その宣言の暗黙 text モードを有効にします。
[fixture: venn/db-indent-after-set] [fixture: venn/db-indent-after-indented-set]
[fixture: venn/db-indent-after-header-set] [fixture: venn/db-indent-after-union]
[fixture: venn/db-indent-after-indented-union]

行頭の境界付きの `text` の前の、一つ以上の ASCII スペースかタブの字下げだけが、
暗黙 text を選びます。 [fixture: venn/db-indent-width]
[fixture: venn/db-form-indent-id] [fixture: venn/gram-indent-text-prefix]
[fixture: venn/gram-extra-indent-nonindent-text]
字下げ幅にはそれ以上の意味はありません。 [fixture: venn/db-indent-width]
[fixture: venn/db-form-indent-id] [fixture: venn/gram-indent-text-prefix]
[fixture: venn/gram-extra-indent-nonindent-text]

newline 単位の後では、有効な暗黙マーカーを先に選ぶ場合を除き、
通常の文の開始がモードを解除します。 [fixture: venn/gram-indent-after-style]
[fixture: venn/gram-indent-after-title]
[fixture: venn/gram-extra-indent-indented-style]
[fixture: venn/gram-indent-after-indented-title]
[fixture: venn/db-indent-after-indented-set]
[fixture: venn/gram-indent-set-explicit-text-blank-comment]
[fixture: venn/gram-indent-set-style-blank-comment]
[fixture: venn/gram-indent-union-explicit-text-blank-comment]
[fixture: venn/gram-indent-union-style-blank-comment]

集合の後の同じ行の style、明示の text、title は、
暗黙 text モードを有効なままにします。
[fixture: venn/db-indent-after-same-line-style]
[fixture: venn/db-indent-after-same-line-explicit-text]
[fixture: venn/db-indent-after-same-line-title]
[fixture: venn/lex-indent-set-same-line-explicit-text-blank-comment-without-empty-lines]
[fixture: venn/lex-indent-set-same-line-style-blank-comment-without-empty-lines]
[fixture: venn/lex-indent-union-same-line-explicit-text-blank-comment-without-empty-lines]
[fixture: venn/lex-indent-union-same-line-style-blank-comment-without-empty-lines]

空行、スペースとタブだけの行、除かれたコメント領域、共通のディレクティブの行、
飲み込まれた断片は、有効なモードを保ちます。
[fixture: venn/db-indent-after-blank] [fixture: venn/db-indent-blank-line]
[fixture: venn/db-indent-after-comment]
[fixture: venn/db-indent-after-directive]
[fixture: venn/lex-comment-line-before-text]
[fixture: venn/lex-unindented-blank-followed-comment]
[fixture: venn/lex-comment-multiple-spaces-before-text]
[fixture: venn/lex-eaten-fragment-before-line-break]
[fixture: venn/lex-bare-percent-between-set-and-text]
[fixture: venn/lex-empty-braces-percent-between-set-and-text]
[fixture: venn/lex-indent-set-blank-directive]
[fixture: venn/lex-indent-union-blank-directive]
[fixture: venn/lex-indent-set-bare-comment-blank]
[fixture: venn/lex-indent-set-mixed-lines-without-empty-lines]
[fixture: venn/lex-indent-union-empty]
[fixture: venn/lex-indent-union-bare-comment]
[fixture: venn/lex-indent-union-blank-comment]

図のコメントの行は、規則 7 より先に規則 1 がコメントを読むか、
規則 2 が `%%` の直前の文字を飲み込むと暗黙 text モードを保ち、
そうでなければ規則 5・6 が先頭の ASCII スペースかタブを読み飛ばし、
規則 7 がモードを解除してから規則 9 が `%%{` のコメントを読みます。
[fixture: venn/lex-empty-braces-percent-between-set-and-text]
[fixture: venn/lex-indent-union-empty-braces]
[fixture: venn/lex-indent-set-empty-braces-blank]
[fixture: venn/lex-indent-union-empty-braces-blank]
[fixture: venn/lex-indent-set-two-empty-braces]
[fixture: venn/lex-indent-union-two-empty-braces]
[fixture: venn/lex-indent-set-blank-empty-braces-ls-without-empty-lines]
[fixture: venn/lex-indent-set-blank-empty-braces-ps-without-empty-lines]
[fixture: venn/lex-indent-empty-braces-without-empty-line-crlf]
[fixture: venn/gram-indent-set-blank-empty-braces-crlf]
[fixture: venn/gram-indent-set-blank-empty-braces-ls]
[fixture: venn/gram-indent-set-blank-empty-braces-ps]
[fixture: venn/gram-indent-set-blank-two-empty-braces]
[fixture: venn/gram-indent-set-empty-braces-blank-empty-braces]
[fixture: venn/gram-indent-set-mixed-lines]
[fixture: venn/gram-indent-set-same-line-explicit-text-blank-comment]
[fixture: venn/gram-indent-set-same-line-style-blank-comment]
[fixture: venn/gram-indent-union-blank-empty-braces]
[fixture: venn/gram-indent-union-empty-braces-blank-empty-braces]
[fixture: venn/gram-indent-union-same-line-explicit-text-blank-comment]
[fixture: venn/gram-indent-union-same-line-style-blank-comment]
[fixture: venn/gram-indent-empty-braces-after-blank]
[fixture: venn/gram-indent-after-empty-braces-explicit-id]
[fixture: venn/gram-indent-after-empty-braces-explicit-string]
[fixture: venn/gram-indent-after-empty-braces-explicit-target-list]
[fixture: venn/lex-indent-spaces-before-empty-braces]
[fixture: venn/gram-indent-spaces-before-empty-braces-extra-id]
[fixture: venn/lex-indent-tab-line-before-empty-braces]
[fixture: venn/gram-indent-tab-line-before-empty-braces-extra-id]
[fixture: venn/lex-indent-bare-percent-after-blank]
[fixture: venn/lex-indent-indented-empty-braces-after-blank]
[fixture: venn/lex-indent-union-blank-bare-comment]
[fixture: venn/lex-indent-tab-prefixed-empty-braces-after-blank]
[fixture: venn/gram-indent-two-spaces-empty-braces-explicit]
[fixture: venn/gram-indent-two-spaces-empty-braces-missing-id]
[fixture: venn/gram-indent-two-spaces-empty-braces-after-blank-explicit]
[fixture: venn/gram-indent-two-spaces-empty-braces-after-blank-missing-id]
[fixture: venn/gram-indent-space-tab-empty-braces-explicit]
[fixture: venn/gram-indent-space-tab-empty-braces-missing-id]
[fixture: venn/gram-indent-space-tab-empty-braces-after-blank-explicit]
[fixture: venn/gram-indent-space-tab-empty-braces-after-blank-missing-id]
[fixture: venn/lex-indent-ignored-prefix-empty-braces-after-blank]
[fixture: venn/gram-indent-ignored-prefix-empty-braces-after-blank-extra-id]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-implicit-text]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-implicit-text]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-extra-id]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-u2029-extra-id]

`%%{ }%%` の空の波括弧はディレクティブを開始しません。
[fixture: venn/lex-empty-braces-percent-between-set-and-text]
[fixture: venn/gram-indent-empty-braces-after-blank]
[fixture: venn/lex-indent-union-empty-braces]
[fixture: venn/gram-indent-union-blank-empty-braces]
[fixture: venn/gram-indent-after-empty-braces-explicit-id]
[fixture: venn/gram-indent-after-empty-braces-explicit-string]
[fixture: venn/gram-indent-after-empty-braces-explicit-target-list]

共通のコメント行の除去は、 `%%{` で始まる行を図のコメントの規則に残します。
[fixture: venn/lex-empty-braces-percent-between-set-and-text]
[fixture: venn/gram-indent-empty-braces-after-blank]
[fixture: venn/lex-indent-union-empty-braces]
[fixture: venn/gram-indent-union-blank-empty-braces]
[fixture: venn/gram-indent-after-empty-braces-explicit-id]
[fixture: venn/gram-indent-after-empty-braces-explicit-string]
[fixture: venn/gram-indent-after-empty-braces-explicit-target-list]

その行がモードを解除した後は、字下げした `text A x`、`text "A" "x"`、
`text A,B x` を明示 text として受理します。
[fixture: venn/gram-indent-after-empty-braces-explicit-id]
[fixture: venn/gram-indent-after-empty-braces-explicit-string]
[fixture: venn/gram-indent-after-empty-braces-explicit-target-list]

モードが有効でなければ、字下げした `text` は明示の形で、
対象リストと id が必要です。 [fixture: venn/gram-indent-without-set]
[fixture: venn/gram-indent-after-style]
[fixture: venn/lex-indented-text-at-bol-without-current-set-explicit]
[fixture: venn/lex-indented-text-after-style-explicit]
[fixture: venn/gram-indent-after-empty-braces-explicit-id]
[fixture: venn/gram-indent-after-empty-braces-explicit-string]
[fixture: venn/gram-indent-after-empty-braces-explicit-target-list]
[fixture: venn/lex-indent-set-style-blank-comment-explicit-target]

### style

`style` は空でない対象リストと、
カンマで区切った一つ以上のプロパティを要求します。
[fixture: venn/db-form-style-id] [fixture: venn/db-form-style-multiple]
[fixture: venn/gram-extra-style-no-target]
[fixture: venn/gram-extra-style-quoted-key] [fixture: venn/gram-style-empty]
[fixture: venn/gram-style-missing-value]
[fixture: venn/gram-style-trailing-comma]
[fixture: venn/gram-empty-quoted-style-key]
[fixture: venn/gram-style-property-missing-colon]
キーは裸の識別子で、その後にコロンと値が続きます。
[fixture: venn/db-form-style-id] [fixture: venn/db-form-style-multiple]
[fixture: venn/gram-extra-style-no-target]
[fixture: venn/gram-extra-style-quoted-key] [fixture: venn/gram-style-empty]
[fixture: venn/gram-style-missing-value]
[fixture: venn/gram-style-trailing-comma]
[fixture: venn/gram-empty-quoted-style-key]
[fixture: venn/gram-style-property-missing-colon]

予約語以外の任意の識別子がプロパティキーで、
繰り返すキーと別々の style 文は別々の書かれた項目を保ちます。
[fixture: venn/db-style-duplicate-key] [fixture: venn/db-style-case-and-order]
[fixture: venn/db-style-three-definitions]
[fixture: venn/db-style-prototype-keys]

style の値は空でもよい一つの完全な引用文字列か、空でない style atom の並びです。
[fixture: venn/db-form-style-tokens] [fixture: venn/db-form-style-string]
[fixture: venn/db-form-style-number] [fixture: venn/lex-style-empty]
[fixture: venn/gram-style-string-with-second-string]
[fixture: venn/gram-style-single-quoted] [fixture: venn/gram-unclosed-style]
[fixture: venn/gram-style-property-trailing-newline]

`1red#abc` のように裸の style atom の間に空白は不要で、
VennLiteral は書かれた綴りと空白を保ちます。
[fixture: venn/lex-style-adjacent-units] [fixture: venn/db-form-style-tokens]
[fixture: venn/lex-style-single-number-whole-spelling]

### 空の形

空の引用ラベルは空の値の VennLabel です。 [fixture: venn/db-label-empty]
[fixture: venn/lex-empty-label-before-size]
[fixture: venn/lex-empty-quoted-label-text-before-size]
[fixture: venn/gram-label-bare-empty] [fixture: venn/db-label-spaces]
[fixture: venn/lex-label-bare-padding]
[fixture: venn/lex-label-bare-whitespace-line]
裸の `[]` は拒否しますが、裸の空白と引用された空白はラベルの内容です。
[fixture: venn/db-label-empty] [fixture: venn/lex-empty-label-before-size]
[fixture: venn/lex-empty-quoted-label-text-before-size]
[fixture: venn/gram-label-bare-empty] [fixture: venn/db-label-spaces]
[fixture: venn/lex-label-bare-padding]
[fixture: venn/lex-label-bare-whitespace-line]

内容が最初の LF と共通のコメント領域だけの裸か引用のラベルは、
最初の LF を保ちます。 [fixture: venn/lex-label-bare-comment-only]
[fixture: venn/lex-label-quoted-comment-only]

ディレクティブか選ばれた無視するセミコロンだけを含む引用ラベルは、
空の値の VennLabel のままです。 [fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-label-quoted-ignored-semicolon-only]

trivia を除いた後も、裸のラベルには一つ以上の文字が必要です。
[fixture: venn/gram-label-bare-directive-only]
[fixture: venn/gram-label-bare-ignored-semicolon-only]
[fixture: venn/lex-label-bare-comment-only]

空の引用名と style 文字列は実在する StringLiteral です。
[fixture: venn/db-empty-identifiers] [fixture: venn/lex-style-empty]
[fixture: venn/db-label-empty]
venn にはトークンのない空の形として捨てる形はありません。
[fixture: venn/db-empty-identifiers] [fixture: venn/lex-style-empty]
[fixture: venn/db-label-empty] [fixture: venn/lex-identifier-directive-only]

ディレクティブだけを含む裸の style 値は拒否します。
[fixture: venn/gram-style-value-directive-only]

単独の文字列か角括弧ラベル、アクセシビリティ文、説明ブロック、
`@{ ... }` のデータブロックは拒否します。 [fixture: venn/gram-bare-empty-string]
[fixture: venn/gram-empty-label-alone] [fixture: venn/gram-acc-title]
[fixture: venn/gram-acc-descr] [fixture: venn/gram-acc-block]
[fixture: venn/gram-empty-acc-block] [fixture: venn/gram-unclosed-acc-block]
[fixture: venn/lex-empty-description-after-set] [fixture: venn/gram-data-block]
[fixture: venn/gram-comment-extra-id-before-existing-label]

`intersection` は文のキーワードではなく、拒否します。
[fixture: venn/gram-intersection-unsupported]

### 文法の外での拒否

union の各要素は、変換形の名前のテキストの引用符の外側の空白を除き、
外側の二重引用符一組を除いた後で、先行する set の名前と一致する必要があります。
[fixture: venn/gram-union-unknown] [fixture: venn/gram-union-before-definitions]
[fixture: venn/gram-union-inner-space] [fixture: venn/gram-union-case-mismatch]
[fixture: venn/lex-union-converted-name-match]
[fixture: venn/lex-union-empty-quoted-members]
[fixture: venn/lex-union-matching-quoted-padding]
照合は大文字と小文字を区別します。 [fixture: venn/gram-union-unknown]
[fixture: venn/gram-union-before-definitions]
[fixture: venn/gram-union-inner-space] [fixture: venn/gram-union-case-mismatch]
[fixture: venn/lex-union-converted-name-match]
[fixture: venn/lex-union-empty-quoted-members]
[fixture: venn/lex-union-matching-quoted-padding]
[fixture: venn/lex-union-converted-equivalent-name]

先行する set は一意でなくてもよく、重複する union の要素を受理します。
[fixture: venn/db-three-definitions] [fixture: venn/db-union-three-definitions]
[fixture: venn/db-union-repeated-member]

text と style の対象は先行する宣言を必要としません。
[fixture: venn/db-text-unknown] [fixture: venn/db-style-unknown]

## 既知の差異

**[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)**
キーワード、名前、数の中のディレクティブはここでは拒否しますが、
mermaid.js はその前後を連結します。 [fixture: venn/header-directive-inside]
[fixture: venn/lex-directive-in-set] [fixture: venn/db-grid-directive-size]
[fixture: venn/div-directive-style-value-word]

**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)**
その単位の内部で選ばれた無視するセミコロンはここでは拒否しますが、
mermaid.js はその前後を連結します。
[fixture: venn/div-ignored-semicolon-set-name-selected]
[fixture: venn/div-ignored-semicolon-size]
[fixture: venn/div-ignored-semicolon-style-value-selected]

**[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)**
四つの C4 語は、裸か引用の名前、ラベル、裸か引用の style 値、
タイトルでは venn の値として読みます。
[fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style]
[fixture: venn/lex-c4-c4container-title]
[fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4component-style]
[fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4dynamic-identifier]
[fixture: venn/lex-c4-c4dynamic-label] [fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4dynamic-title]
[fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label]
[fixture: venn/lex-c4-c4deployment-style]
[fixture: venn/lex-c4-c4deployment-title]
mermaid.js は C4 を選び、入力を拒否します。
[fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style]
[fixture: venn/lex-c4-c4container-title]
[fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4component-style]
[fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4dynamic-identifier]
[fixture: venn/lex-c4-c4dynamic-label] [fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4dynamic-title]
[fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label]
[fixture: venn/lex-c4-c4deployment-style]
[fixture: venn/lex-c4-c4deployment-title] [fixture: venn/div-c4-bare-identifier]
[fixture: venn/div-c4-bare-style-value]

見出しより後の `C4Context` と、除かれるコメントか frontmatter 内の C4 語は、
どちらの読みでも検出を変えません。 [fixture: venn/lex-c4-c4context-identifier]
[fixture: venn/lex-c4-c4context-label] [fixture: venn/lex-c4-c4context-style]
[fixture: venn/lex-c4-c4context-title]
[fixture: venn/lex-c4-c4container-comment]
[fixture: venn/lex-c4-c4container-frontmatter]

**[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)**
frontmatter が `title: <a` を持つ場合、 `set "b="c">d"` はここでは拒否しますが、
mermaid.js は内側の属性の引用符を変換して受理します。
[fixture: venn/div-html-tag-starts-in-frontmatter]
[fixture: venn/gram-html-tag-body-only-reference]

**[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)**
正しく区切られた frontmatter の不正な YAML はここでは受理しますが、
mermaid.js は拒否します。 [fixture: venn/frontmatter-invalid]
[fixture: venn/frontmatter-empty] [fixture: venn/frontmatter-unclosed]
不正な区切りは構文エラーのままです。 [fixture: venn/frontmatter-invalid]
[fixture: venn/frontmatter-empty] [fixture: venn/frontmatter-unclosed]

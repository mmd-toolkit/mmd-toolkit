# 木から Venn の Db を組み立てる

英語版: [venn.md](./venn.md)

`src/db-from-tree/venn.ts` は、
[ast/venn.md](../../../spec/docs/ast/venn.md) の木について、
[db-summaries.md の venn](../db-summaries.md#venn) に従い実装します。
`tests/db-from-tree-venn.test.ts` は木を手で作り、
引用した fixture の Db と比較します。
JSON 往復後も、トークンを参照できず、
値の切り出しをノードの範囲に限った状態で比較します。
共有の HTML 引用符の文脈の走査だけはソース全体を一度読みます。

## 木から要約を組み立てる

1. **変換済みテキスト。**
   葉の書かれた値と変換済みの範囲を読み、ディレクティブ、共通のコメント領域、
   選択された無視するセミコロンを除きます。
   CR と CRLF は LF、HTML 属性の引用符は単一引用符、
   文字参照は仮の文字列にします。
   タグが値の外から始まる場合も、
   ソース全体の HTML タグの文脈を当てます。 [fixture: venn/lex-identifier-directive-middle]
   [fixture: venn/lex-label-directive-middle]
   [fixture: venn/lex-identifier-comment-line]
   [fixture: venn/lex-label-comment-line]
   [fixture: venn/lex-cr-quoted-value]
   [fixture: venn/lex-crlf-quoted-value]
   [fixture: venn/lex-identifier-style-rule]
   [fixture: venn/db-grid-entity-label-bare]
   [fixture: venn/lex-title-entity-numeric]
   [fixture: venn/lex-title-entity-named]
   [fixture: venn/lex-title-html-attribute]
   [fixture: venn/db-grid-entity-style-value]
   [fixture: venn/lex-identifier-entity-numeric]
   [fixture: venn/lex-style-entity-numeric]
   [fixture: venn/lex-style-directive-middle]
   [fixture: venn/lex-style-comment-line]
   [fixture: venn/lex-title-directive-middle]
   [fixture: venn/lex-directive-label-delimiter-gap]
   [fixture: venn/lex-label-entity-numeric]
   [fixture: venn/lex-text-entity-numeric]
   [fixture: venn/lex-identifier-entity-named]
   [fixture: venn/lex-label-entity-named]
   [fixture: venn/lex-text-entity-named]
   [fixture: venn/lex-style-entity-named]
   [fixture: venn/lex-identifier-style-rule-two-semicolons]
   [fixture: venn/lex-label-style-rule-two-semicolons]
   [fixture: venn/lex-text-style-rule-two-semicolons]
   [fixture: venn/lex-style-style-rule-two-semicolons]
   [fixture: venn/lex-title-style-rule-two-semicolons]
   [fixture: venn/db-html-tag-from-title-name]
   [fixture: venn/db-html-tag-from-title-label]
   [fixture: venn/db-html-tag-from-title-style]
   [fixture: venn/db-html-tag-from-comment-name]
   [fixture: venn/db-html-tag-across-names]
2. **初期要約。**
   埋め込みデータのタイトルか空のタイトル、
   空のアクセシビリティ文字列と subsets、texts、styles から始めます。
   frontmatter のアクセシビリティ欄と描画設定は欄を追加しません。 [fixture: venn/header-only]
   [fixture: venn/db-frontmatter-title]
   [fixture: venn/db-frontmatter-accessibility]
   [fixture: venn/db-markup]
3. **名前と id。**
   大文字小文字、重複、空の引用文字列、引用内の空白を保ち、
   引用の外側を trim して外側の引用符を一組除きます。
   数値の text
   id は数値でなく綴りを保ちます。 [fixture: venn/db-empty-identifiers]
   [fixture: venn/db-quoted-padding]
   [fixture: venn/db-text-leading-zeros]
   [fixture: venn/db-form-text-id]
   [fixture: venn/db-form-text-string]
   [fixture: venn/db-form-text-number]
   [fixture: venn/gram-repeated-target-lists]
   [fixture: venn/db-case-distinct-ids]
4. **部分集合とサイズ。**
   set と union を宣言順に追加し、名前を重複を保って整列し、
   サイズは `parseFloat()`、省略時は `10 / arity²` とします。
   非有限値は文字列、負のゼロはゼロにします。 [fixture: venn/db-all-fields]
   [fixture: venn/db-three-definitions]
   [fixture: venn/db-union-three-definitions]
   [fixture: venn/db-union-repeated-member]
   [fixture: venn/db-size-fraction]
   [fixture: venn/db-size-signed-fraction]
   [fixture: venn/db-size-plus]
   [fixture: venn/db-size-zero]
   [fixture: venn/db-size-negative]
   [fixture: venn/db-size-leading-zeros]
   [fixture: venn/db-size-negative-zero]
   [fixture: venn/db-size-overflow]
   [fixture: venn/db-size-negative-overflow]
5. **ラベル。**
   括弧と引用符を除き、裸のラベルを Db に渡す前に trim します。
   字句の値が空なら省略し、残りを再び trim して外側の引用符を一組除きます。
   引用された空白が二度目の trim に達した場合は空文字列を保ちます。 [fixture: venn/db-label-empty]
   [fixture: venn/db-label-spaces]
   [fixture: venn/db-label-double-normalization]
   [fixture: venn/lex-label-bare-padding]
   [fixture: venn/db-label-backticks]
   [fixture: venn/db-label-inner-quotes]
   [fixture: venn/lex-label-quoted-directive-only]
   [fixture: venn/lex-label-quoted-ignored-semicolon-only]
   [fixture: venn/lex-label-bare-comment-only]
   [fixture: venn/lex-label-quoted-comment-only]
6. **text の対象。**
   明示の対象を整列して宣言順に追加し、未定義の対象と重複も保ちます。
   null の対象は最後の部分集合の整列済みの名前です。
   `checkTree` は有効な字下げ付き暗黙の印だけに null を許します。
   部分集合がモードを有効にし、改行後の通常の文頭が終わらせ、同じ行の文、空行、
   除去されたコメント、共通のディレクティブは保ちます。
   空行の後に字下げなしの `%%{ }%%` が来るとモードは終わります。
   宣言の直後の同じコメント、ASCII 空白かタブをちょうど一つ前置したもの、
   裸の `%%` の行はモードを保ちます。
   空白かタブだけの空でない行が間にあってもモードは保たれます。
   先頭の空白かタブが二つ以上なら一つの並びとして読み飛ばします。
   規則 2 がコメントの前の別の一文字を飲み込まなければ、
   規則 7 が `%%{` でモードを終わらせます。 [fixture: venn/db-text-three-definitions]
   [fixture: venn/db-text-comma-list]
   [fixture: venn/gram-repeated-target-lists]
   [fixture: venn/db-form-indent-id]
   [fixture: venn/db-form-indent-string]
   [fixture: venn/db-form-indent-number]
   [fixture: venn/db-indent-width]
   [fixture: venn/db-indent-after-union]
   [fixture: venn/db-indent-after-blank]
   [fixture: venn/db-indent-blank-line]
   [fixture: venn/db-indent-after-comment]
   [fixture: venn/db-indent-after-directive]
   [fixture: venn/db-indent-after-same-line-style]
   [fixture: venn/db-indent-after-same-line-explicit-text]
   [fixture: venn/db-indent-after-same-line-title]
   [fixture: venn/lex-indented-text-after-style-explicit]
   [fixture: venn/lex-indented-text-at-bol-without-current-set-explicit]
   [fixture: venn/lex-empty-braces-percent-between-set-and-text]
   [fixture: venn/lex-indent-union-empty-braces]
   [fixture: venn/lex-indent-set-empty-braces-blank]
   [fixture: venn/lex-indent-set-two-empty-braces]
   [fixture: venn/lex-indent-indented-empty-braces-after-blank]
   [fixture: venn/lex-indent-bare-percent-after-blank]
   [fixture: venn/gram-indent-after-empty-braces-explicit-id]
   [fixture: venn/gram-indent-after-empty-braces-explicit-string]
   [fixture: venn/gram-indent-after-empty-braces-explicit-target-list]
   [fixture: venn/lex-indent-spaces-before-empty-braces]
   [fixture: venn/lex-indent-tab-line-before-empty-braces]
   [fixture: venn/lex-indent-empty-braces-without-empty-line-crlf]
   [fixture: venn/lex-indent-tab-prefixed-empty-braces-after-blank]
   [fixture: venn/gram-indent-two-spaces-empty-braces-explicit]
   [fixture: venn/gram-indent-two-spaces-empty-braces-after-blank-explicit]
   [fixture: venn/gram-indent-space-tab-empty-braces-explicit]
   [fixture: venn/gram-indent-space-tab-empty-braces-after-blank-explicit]
   [fixture: venn/lex-indent-ignored-prefix-empty-braces-after-blank]
7. **スタイルの項目。**
   整列済みの対象と、
   任意の大文字小文字を区別するプロパティを持つ別々の項目を追加します。
   同じ項目では最後の同名キーが勝ち、`__proto__` への文字列代入は除き、
   他のプロトタイプ関連名は自身のプロパティとして保ちます。 [fixture: venn/db-style-three-definitions-same-target]
   [fixture: venn/db-style-case-and-order]
   [fixture: venn/db-style-duplicate-key]
   [fixture: venn/db-style-prototype-keys]
   [fixture: venn/gram-repeated-target-lists]
8. **スタイルの値。**
   引用内の空白と空文字列を保ちます。
   裸の VennLiteral の変換済みテキストを、識別子、十進数、hex、rgb、
   rgba の単位に分け、綴りが接していても空白一つで結びます。
   色の大文字小文字、成分の綴り、
   内部の空白を保ちます。 [fixture: venn/db-empty-identifiers]
   [fixture: venn/db-quoted-padding]
   [fixture: venn/db-form-style-tokens]
   [fixture: venn/lex-style-adjacent-units]
   [fixture: venn/lex-style-single-number-whole-spelling]
   [fixture: venn/db-style-adjacent-numeric-tokens]
   [fixture: venn/db-form-style-rgba]
   [fixture: venn/db-style-rgb-uppercase]
   [fixture: venn/db-style-rgb-dot-components]
   [fixture: venn/db-style-hex-trailing-numeric-token]
   [fixture: venn/db-style-hex-trailing-identifier]
   [fixture: venn/db-style-rgb-crlf]
   [fixture: venn/db-style-rgb-nbsp]
   [fixture: venn/db-style-rgb-line-separator]
   [fixture: venn/db-style-rgba-paragraph-separator]
   [fixture: venn/db-style-rgb-directive]
   [fixture: venn/db-style-rgb-comment-line]
   [fixture: venn/db-grid-entity-style-value]
   [fixture: venn/lex-style-hex-ignored-semicolon]
   [fixture: venn/lex-style-rgb-ignored-semicolon]
   [fixture: venn/div-c4-bare-style-value]
9. **無視された断片。**
   VennIgnoredText は Db を変えず、
   直前の完全な宣言を保ちます。 [fixture: venn/lex-style-extra-id-eaten]
   [fixture: venn/lex-set-colon-eaten]
10. **タイトルと設定。**
    最初の区切りの後の引用符と空白を含めた全内容を保ち、
    最後のタイトルが frontmatter の初期タイトルを置き換えます。
    文字の置換はタイトルだけに適用し、
    HTML ラベルのルート設定を flowchart の設定より優先します。 [fixture: venn/db-title-padding]
    [fixture: venn/db-title-only-whitespace]
    [fixture: venn/db-title-value-next-line]
    [fixture: venn/db-title-quotes]
    [fixture: venn/lex-title-separator-crlf]
    [fixture: venn/db-title-last]
    [fixture: venn/db-frontmatter-title-overridden]
    [fixture: venn/db-markup]
    [fixture: venn/config-security-other]
    [fixture: venn/config-security-other-flowchart-false]
    [fixture: venn/config-security-other-html-false]
    [fixture: venn/config-security-other-root-false-flowchart-true]
    [fixture: venn/config-security-other-root-true-flowchart-false]

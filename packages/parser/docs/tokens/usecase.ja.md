# Usecase のトークン

英語版: [usecase.md](./usecase.md)

この文書は `usecase` のトークンを定めます。
ノードは [ast/usecase.md](../../../spec/docs/ast/usecase.ja.md) が、
共通の規則は [tokens.md](../tokens.ja.md) が定めます。
字句規則の順序と文脈は [diagrams/usecase.md](../../../spec/docs/diagrams/usecase.ja.md) に従います。
その出典は [`usecase.tokens.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts#L1-L410) です。

## トークン

文法の各項目は次の種類を持ちます。
字句の Word や LabelText という分類だけでは種類は決まりません。 [fixture: usecase/db-all-fields]
[fixture: usecase/lex-keyword-labels]
[fixture: usecase/lex-keyword-style-word-category]

| 種類         | 文法の項目                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー、文のキーワード、end、方向値、note の for、意味的な include/extend。                             |
| `Identifier` | 明示 id、JSON 接頭部の id、クラス名、裸のネイティブ metadata キーと値、CSS 名の語。                       |
| `String`     | 空文字列を含む、通常・markdown ラベル、引用符付きのネイティブ metadata キーと値。                         |
| `RawText`    | 裸のラベル、ステレオタイプ内部、CSS 値、アクセシビリティ値、不透明な JSON 内部。                          |
| `Punctuator` | 各形状区切り、矢印の半分、@、波括弧、コロン、コンマ、クラス区切り、ステレオタイプ記号、CSS の -- 接頭部。 |

表のキーワードと句読点の場合は次の fixture にあります。 [fixture: usecase/db-direction-all]
[fixture: usecase/gram-note-adjacent-string-label]
[fixture: usecase/db-semantic-case]
[fixture: usecase/db-labeled-arrows]
[fixture: usecase/gram-actor-list]
[fixture: usecase/gram-native-trailing-comma-newline]
[fixture: usecase/gram-styles-components]

通常の id とクラス名は、それぞれ 1 つの Identifier 項目です。
JSON 接頭部の id は、
キーワードと同じ綴りでも Identifier です。 [fixture: usecase/gram-json-keyword-id]
[fixture: usecase/gram-explicit-edge-id-control]
[fixture: usecase/gram-boundary-three-classes-types]

ネイティブ metadata はキー、コロン、値を別の項目にします。
裸の true/false と整数に見える語は Identifier です。
どちらの引用符で囲んでも、同じ引用符を含む String となり、
エスケープを復号しません。 [fixture: usecase/lex-native-single-quoted-keys]
[fixture: usecase/lex-native-string-backslashes]
[fixture: usecase/lex-identifier-leading-zero-icon]
[fixture: usecase/gram-native-duplicate-business-same]

ネイティブ metadata のコンマは、独立した Punctuator 項目です。
改行はトリビアです。 [fixture: usecase/gram-metadata-property-comma-no-newline]
[fixture: usecase/gram-metadata-newline]

改行は、共通のコメント領域と行終端の規則を適用した後で数えます。
最後のプロパティから `}` までにある末尾コンマと残る改行は、合計 2 個までで、
コンマは改行より前にだけ置けます。 [fixture: usecase/gram-metadata-property-comma-no-newline]
[fixture: usecase/gram-native-trailing-newline]
[fixture: usecase/gram-metadata-no-trailing-comma-two-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-three-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-four-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
[fixture: usecase/gram-edge-metadata-two-newlines]
[fixture: usecase/gram-edge-metadata-three-newlines]
[fixture: usecase/gram-metadata-trailing-comma-no-newline]
[fixture: usecase/gram-native-trailing-comma-newline]
[fixture: usecase/gram-metadata-trailing-comma-two-newlines]
[fixture: usecase/gram-metadata-trailing-comma-three-newlines]
[fixture: usecase/gram-native-trailing-newline-comma]
[fixture: usecase/gram-metadata-tail-newline-before-comma]
[fixture: usecase/gram-metadata-tail-newline-before-comma-newline]

プロパティ間のコンマの後は、
0 個以上の改行を許します。 [fixture: usecase/gram-metadata-property-comma-no-newline]
[fixture: usecase/gram-metadata-property-comma-one-newline]
[fixture: usecase/gram-metadata-property-comma-two-newlines]
[fixture: usecase/gram-metadata-property-comma-three-newlines]

ASCII HWS は改行数を変えず、
CRLF は 1 改行として数えます。 [fixture: usecase/gram-metadata-trailing-comma-one-newline-hws]
[fixture: usecase/gram-metadata-trailing-comma-two-newlines-hws]
[fixture: usecase/gram-metadata-property-comma-one-newline-hws]
[fixture: usecase/gram-metadata-property-comma-two-newlines-hws]
[fixture: usecase/gram-metadata-trailing-comma-one-newline-crlf]
[fixture: usecase/gram-metadata-trailing-comma-two-newlines-crlf]
[fixture: usecase/gram-metadata-trailing-comma-three-newlines-crlf]
[fixture: usecase/gram-metadata-property-comma-one-newline-crlf]
[fixture: usecase/gram-metadata-property-comma-two-newlines-crlf]
[fixture: usecase/gram-metadata-property-comma-three-newlines-crlf]
[fixture: usecase/gram-metadata-no-trailing-comma-two-crlf]
[fixture: usecase/gram-metadata-no-trailing-comma-three-crlf]
[fixture: usecase/gram-metadata-no-trailing-comma-two-whitespace-lines]
[fixture: usecase/gram-metadata-no-trailing-comma-whitespace-lines]
[fixture: usecase/gram-metadata-no-trailing-comma-two-tab-lines]
[fixture: usecase/gram-metadata-no-trailing-comma-tab-lines]

共通のコメント領域を除くと改行数が減る場合があり、
残った改行だけを数えます。 [fixture: usecase/gram-metadata-trailing-comma-comment-line]
[fixture: usecase/gram-metadata-trailing-comma-comment-line-blank-after]
[fixture: usecase/gram-metadata-property-comma-comment-line]
[fixture: usecase/gram-metadata-property-comma-comment-line-blank-after]
[fixture: usecase/gram-metadata-no-trailing-comma-comment-two-newlines]
[fixture: usecase/gram-metadata-no-trailing-comma-comment-three-newlines]

裸のラベルは、最初から最後の単位までの 1 つの RawText 項目で、
内部の HWS を保ちます。
周囲の ASCII HWS はトリビアですが、
ラベル内容の Unicode 空白は保ちます。 [fixture: usecase/lex-label-unquoted-hws-trim]
[fixture: usecase/lex-label-unicode-whitespace-only]
[fixture: usecase/lex-label-u2028]
[fixture: usecase/lex-label-u2029]

通常・markdown ラベルは、区切りを含む 1 つの String 項目です。
内部の余白と元の行終端は、
書かれたテキストとして残ります。 [fixture: usecase/gram-empty-actor-label]
[fixture: usecase/gram-label-quoted-padding]
[fixture: usecase/lex-plain-u2028]
[fixture: usecase/lex-markdown-crlf]
[fixture: usecase/lex-markdown-earliest-close]

CSS プロパティ名の各語は、不可分な Identifier 項目です。
マーカーのないダッシュ接頭部は別の Punctuator で、その接頭部と語の間の HWS は、
どのトークンにも属しません。
UsecaseIdentifier は、
その HWS も保ちます。 [fixture: usecase/lex-class-property-custom-gap]
[fixture: usecase/lex-class-property-long-custom]
[fixture: usecase/lex-css-name-custom-tab]
[fixture: usecase/gram-css-name-comment-region-lf]
[fixture: usecase/gram-css-name-comment-region-ls]

CSS 値は、コロン直後の HWS と引用符付きの成分も含む、 1 つの RawText 項目で、
末尾の読み飛ばした HWS を除きます。
区切りのコンマは別の Punctuator ですが、
引用符内やエスケープしたコンマは値に残ります。 [fixture: usecase/lex-css-property-padding]
[fixture: usecase/lex-style-quoted-value-and-comma]
[fixture: usecase/gram-styles-components]
[fixture: usecase/gram-css-empty-string-component]
[fixture: usecase/gram-style-json-prefix-in-string-control]
[fixture: usecase/gram-style-json-prefix-css-word-control]
[fixture: usecase/gram-style-json-prefix-identifier-control]

アクセシビリティのキーワードとコロン・波括弧は別の項目です。
空白だけの場合も含め、空でない値全体が RawText で、
内容が厳密に空なら値のトークンはありません。
ステレオタイプの記号は別の Punctuator で、
内部の全余白を保つ 1 つの RawText を囲みます。 [fixture: usecase/gram-a11y-line-raw-padding]
[fixture: usecase/gram-a11y-block-raw-padding]
[fixture: usecase/gram-a11y-whitespace-block]
[fixture: usecase/db-acctitle-empty]
[fixture: usecase/db-accdescr-empty]
[fixture: usecase/gram-stereotype-trimmed-conflict]

JSON table は、Keyword の json、Identifier の id、
Punctuator の @ と開き波括弧を別の項目にします。
空でないオブジェクト内部全体は 1 つの RawText で、閉じ波括弧は Punctuator です。
@ と波括弧の間の HWS はトリビアです。 [fixture: usecase/gram-json-spaced-at]
[fixture: usecase/gram-json-empty]
[fixture: usecase/db-json-values]
[fixture: usecase/div-json-balanced-invalid-array]

ディレクティブ、コメント領域、選ばれたセミコロンは、
共通の規則に従って RawText と String を切ります。
切られた文字列は StringFragment となり、不可分な項目の内部の切断は拒否します。
CSS 名の HWS 内や完全な JSON 接頭部の成分の間にある、
ディレクティブや選ばれたセミコロンはトリビアのままです。 [fixture: usecase/directive-in-label]
[fixture: usecase/directive-in-stereotype]
[fixture: usecase/directive-in-json]
[fixture: usecase/lex-native-single-quote-comment-region-ls]
[fixture: usecase/lex-style-hash-semicolon]
[fixture: usecase/div-directive-css-property]
[fixture: usecase/div-semicolon-css-property-selected]
[fixture: usecase/lex-directive-css-name-gap]
[fixture: usecase/lex-semicolon-css-name-gap]
[fixture: usecase/lex-semicolon-classdef-css-name-gap]
[fixture: usecase/lex-directive-whole-json-prefix-boundary]
[fixture: usecase/lex-directive-native-quoted-key]
[fixture: usecase/gram-json-comment]
[fixture: usecase/lex-semicolon-css-number-text]
[fixture: usecase/lex-style-trigger-metadata-icon]
[fixture: usecase/lex-directive-between-json-id]
[fixture: usecase/lex-directive-in-json-declaration-at]

## コメントとトリビア

通常の文脈の ASCII スペース・タブと物理的な行終端には、トークンがありません。
markdown 文字列や JSON 内部の行終端は、
その値の項目に残ります。 [fixture: usecase/lex-tab-blank-line]
[fixture: usecase/lex-statements-crlf]
[fixture: usecase/lex-markdown-crlf]
[fixture: usecase/gram-json-spaced-at]

ASCII HWS だけが先行する行頭のネイティブ %% コメントは、
最初の percent から LF の直前までの Comment 記録です。
mark は %%、value はその記号を除く内容で、トークンはありません。
共通のコメント領域の規則は、すべての文脈で適用します。
インラインの %% は、
文法が許す位置では内容です。 [fixture: usecase/comment-bare-pair]
[fixture: usecase/comment-bare-eof]
[fixture: usecase/comment-u2028]
[fixture: usecase/comment-u2029]
[fixture: usecase/comment-unquoted]
[fixture: usecase/comment-quoted]
[fixture: usecase/gram-json-comment]
[fixture: usecase/lex-comment-region-inside-stereotype]

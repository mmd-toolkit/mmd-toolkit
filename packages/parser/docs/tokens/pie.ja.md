# Pie のトークン

英語版: [pie.md](./pie.md)

トークンの項目は仕様の
[順序付き字句規則](../../../spec/docs/diagrams/pie.md#ordered-rules)と
[文法](../../../spec/docs/diagrams/pie.md#grammar)に従い、
複合一致を記述された構成要素に分けます。
[fixture: pie/db-all-fields]
[fixture: pie/review-directive-acc-title-colon]

## トークン

| 種類         | 項目                                                               | fixture                                                                                                                  |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | `pie`、`showData`、`title`、`accTitle`、`accDescr`。               | [fixture: pie/db-all-fields] [fixture: pie/accdescr-inline]                                                              |
| `Punctuator` | セクションかアクセシビリティのコロン、説明ブロックの各波括弧。     | [fixture: pie/db-all-fields] [fixture: pie/accdescr-inline]                                                              |
| `Numeric`    | マイナスと小数部を含む、完全な `pie-number`。                      | [fixture: pie/number-negative-zero] [fixture: pie/number-decimal-leading-zero]                                           |
| `String`     | 空でも、対応する一重か二重の引用符を含むラベル。                   | [fixture: pie/label-single-quote] [fixture: pie/label-empty] [fixture: pie/review-label-empty-single]                    |
| `RawText`    | 空でない共通値、またはフェンスを含む隠し YAML/DIRECTIVE 形式全体。 | [fixture: pie/db-all-fields] [fixture: pie/frontmatter-between-section-parts] [fixture: pie/review-directive-empty-body] |

行の値のトークンは title の ASCII 区切り 1 文字か、
アクセシビリティのコロンの後のテキストを、空白だけの場合も含めて保持し、
空の内容には値のトークンがありません。
[fixture: pie/title-spaces] [fixture: pie/title-whitespace-last]
[fixture: pie/review-acctitle-whitespace-final]
[fixture: pie/review-accdescr-whitespace-final]
[fixture: pie/ast-title-tab-null-eof] [fixture: pie/acctitle-eof]
[fixture: pie/accdescr-eof] [fixture: pie/ast-common-values-directive-only]

ブロックの値のトークンは両端の共通空白を除き、
空か空白だけのブロックには値のトークンがありません。
[fixture: pie/accdescr-block] [fixture: pie/accdescr-block-unicode-trim]
[fixture: pie/accdescr-empty-block-last]
[fixture: pie/accdescr-space-block-last]
[fixture: pie/gram-description-block-directive-only]
[fixture: pie/gram-description-block-comment-only]

隠し形式のトークンは開始から終了のフェンスまでで、
字句規則が消費する直後の LF は除きます。
[fixture: pie/frontmatter-between-section-parts]
[fixture: pie/review-directive-hidden-crlf]
[fixture: pie/review-directive-hidden-space-boundary]
[fixture: pie/review-directive-hidden-eof]
[fixture: pie/gram-section-eof-hidden-yaml]

共通ディレクティブ、コメント領域、選択されたセミコロンは
String と RawText の項目を分断し、文字列の断片は StringFragment になります。
キーワードか数値の内部での分断は、共通の境界規則により拒否します。
[fixture: pie/directive-label-middle] [fixture: pie/comment-label-line]
[fixture: pie/directive-title-middle]
[fixture: pie/accdescr-block-comment-lines] [fixture: pie/style-label-trigger]
[fixture: pie/lex-yaml-body-comment-content]
[fixture: pie/lex-hidden-body-global-directive]
[fixture: pie/div-directive-in-header] [fixture: pie/div-directive-number]
[fixture: pie/div-atomic-semicolon-number]

## コメントとトリビア

単位間の ASCII スペースとタブ、見える改行単位、追加の LF には
トークンがなく、文字列と隠し形式の内部の空白と物理改行は項目に残ります。
[fixture: pie/lex-tab] [fixture: pie/lex-tab-blank-line]
[fixture: pie/header-only] [fixture: pie/label-crlf]
[fixture: pie/review-directive-hidden-crlf]

最後の字句規則は図固有のパーセント対のコメントを、
物理改行の直前までの、印が `%%` の共通 Comment レコードにし、
LS と PS では終了しません。
[fixture: pie/comment-section-glued] [fixture: pie/comment-section-eof]
[fixture: pie/comment-ls] [fixture: pie/comment-ps]

[検出](../../../spec/docs/common.md#diagram-detection)が通過した
パーセント対だけの行と付随するトリビアは再読せず、
波括弧のような形式と閉じない形式も含め、その行は Comment です。
[fixture: pie/review-comment-bare-header-eof]
[fixture: pie/lex-bare-percent-braces-before-header]
[fixture: pie/comment-preheader-unclosed-percent-brace]
[fixture: pie/div-preheader-retained-yaml-bare-then-directive]
[fixture: pie/div-preheader-retained-directive-bare-ls-line]

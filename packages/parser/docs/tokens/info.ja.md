# Info のトークン

英語版: [info.md](./info.md)

トークンは仕様の
[順序付き規則](../../../spec/docs/diagrams/info.md#ordered-rules)に従い、
複合共通形式を記述された構成要素へ分けます。
[fixture: info/common-all] [fixture: info/directive-acctitle-colon]

## トークン

| 種類         | 項目                                                           | fixture                                                                                           |
| ------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Keyword`    | `info`、`showInfo`、`title`、`accTitle`、`accDescr`。          | [fixture: info/common-flag-all] [fixture: info/common-all]                                        |
| `Punctuator` | アクセシビリティのコロンか説明ブロックの各波括弧。             | [fixture: info/common-flag-all] [fixture: info/common-all]                                        |
| `RawText`    | 空でない共通値か、フェンスを含む隠し YAML/DIRECTIVE 形式全体。 | [fixture: info/common-all] [fixture: info/hidden-yaml-body] [fixture: info/hidden-directive-body] |

行の値のトークンは title の ASCII スペースかタブ 1 文字、
またはアクセシビリティのコロンの後の内容を保持します。
残る空白と空白だけの値も含み、空の内容には値のトークンがありません。
[fixture: info/title-tabs] [fixture: info/lex-title-one-space]
[fixture: info/lex-title-one-tab] [fixture: info/lex-title-two-spaces]
[fixture: info/acctitle-empty] [fixture: info/acctitle-gap]
[fixture: info/accdescr-line-empty]
[fixture: info/lex-accdescr-line-whitespace]

ブロックの値のトークンは両端の共通空白を除きます。
空、空白だけ、共通ディレクティブだけ、コメント領域だけの内部には、
値のトークンがありません。
[fixture: info/space-block-interior] [fixture: info/accdescr-block-empty]
[fixture: info/lex-block-whitespace-only]
[fixture: info/lex-block-directive-only]
[fixture: info/lex-block-comment-only]

引用符のような共通値も RawText のままで、引用符、バックスラッシュ、
エンティティ、属性の引用符、元の改行を復号せず保持します。
[fixture: info/title-open-quote] [fixture: info/title-double-quotes]
[fixture: info/title-single-quotes] [fixture: info/accdescr-block-quoted]
[fixture: info/html-all-common] [fixture: info/line-crlf]

各隠し形式は開始から条件を満たす終了フェンスまでの 1 つの RawText 項目です。
前の空白と、元の EOF の場合も含め規則が消費する直後の LF を除きます。
[fixture: info/hidden-yaml-open-padding]
[fixture: info/hidden-directive-padding] [fixture: info/hidden-directive-cr]
[fixture: info/hidden-directive-crlf] [fixture: info/hidden-yaml-cr]
[fixture: info/hidden-yaml-crlf] [fixture: info/hidden-directive-title-eof]
[fixture: info/hidden-yaml-block-eof]

共通ディレクティブ、コメント領域、選択されたセミコロンは、
RawText 項目を分断します。
固定キーワード内部の分断は共通の不可分な境界の規則で拒否します。
[fixture: info/directive-title-value] [fixture: info/directive-block-value]
[fixture: info/lex-line-comment-region-ls] [fixture: info/style-title]
[fixture: info/lex-yaml-common-comment]
[fixture: info/lex-hidden-nested-global]
[fixture: info/lex-yaml-fences-selected]
[fixture: info/div-directive-header-middle]
[fixture: info/div-selected-showinfo]

## コメントとトリビア

単位間の ASCII スペースとタブ、見える改行単位、追加の LF には、
トークンがありません。
値と隠し形式の内部の空白と物理改行は、上記で保持する場合に項目に属します。
[fixture: info/space-header-tab] [fixture: info/common-blank-lines]
[fixture: info/header-lf] [fixture: info/accdescr-block-lines]
[fixture: info/hidden-directive-crlf]

図固有のパーセント対のコメントは、印が `%%` の共通 Comment レコードです。
最初のパーセントから物理 EOL の直前までで、LS/PS では終了せず、
共通コメント領域で分断される場合があります。
[fixture: info/comment-header] [fixture: info/comment-eof]
[fixture: info/comment-bare-body] [fixture: info/comment-triple]
[fixture: info/lex-comment-split-mark] [fixture: info/lex-comment-ls-bridge]
[fixture: info/lex-native-comment-ps]

[検出](../../../spec/docs/common.md#diagram-detection)が通過した行と、
付随する空白や改行は再読しません。
パーセントと波括弧の形式や閉じない形式も含め、その行は Comment です。
[fixture: info/lex-detect-preheader-empty-braces]
[fixture: info/lex-detect-preheader-open-brace]
[fixture: info/div-detect-retained-yaml-bare-ls]
[fixture: info/div-detect-retained-directive-bare-bom]
[fixture: info/div-detect-yaml-bare-directive]

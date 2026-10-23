# pie のトークン

English version: [pie.md](./pie.md)

この文書は `pie` のトークンを定義します。
ノードは
[ast/pie.md](../../../spec/docs/ast/pie.ja.md)、
共通の規則は [tokens.md](../tokens.ja.md) を参照してください。
最初に一致した規則を採る字句解析順は、
[diagrams/pie.md](../../../spec/docs/diagrams/pie.ja.md#規則の順序)
が定義します。
その参照元は
[pie.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/pie.langium#L1-L20)
と
[common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L1-L34)
です。

## トークン

文法の各構成要素には、次のトークン種別を割り当てます。
[fixture: pie/db-all-fields]
[fixture: pie/label-single-quote]
[fixture: pie/frontmatter-between-section-parts]

| 種別         | 構成要素                                             |
| ------------ | ---------------------------------------------------- |
| `Keyword`    | pie、showData、title、accTitle、accDescr。           |
| `String`     | 対応する引用符を含む 1 つのセクションラベル。        |
| `Numeric`    | マイナスを含む、セクションの数値全体。               |
| `Punctuator` | セクションやアクセシビリティのコロン、説明の波括弧。 |
| `RawText`    | 共通値 1 つ、または保持する隠し形式 1 つの全体。     |

複合的な共通形式は、キーワード、区切り、値を別々の項目にします。
先頭の ASCII インデントと、title の 1 文字の区切りにはトークンがありません。
[fixture: pie/title-spaces]
[fixture: pie/lex-title-tab-separator]
[fixture:
pie/acctitle-spaces]
[fixture: pie/accdescr-spaces]
[fixture:
pie/accdescr-block-gap]
[fixture: pie/review-block-brace-colon-priority]

ラベルは 1 つの String 項目です。
単一引用符か二重引用符の両端、空内容、エスケープ、
余白、物理改行を含みます。
[fixture:
pie/label-single-quote]
[fixture: pie/label-empty]
[fixture:
pie/review-label-empty-single]
[fixture: pie/label-escaped-quotes]
[fixture:
pie/label-whitespace]
[fixture: pie/label-crlf]

数値は分割できない 1 つの Numeric 項目です。
原文の綴りを raw に保持し、NumericLiteral には共通の double 変換を使います。
負のゼロと正の無限大も含みます。
[fixture: pie/number-decimal-leading-zero]
[fixture:
pie/number-negative-zero]
[fixture: pie/number-overflow]
[fixture:
pie/review-number-negative-underflow-final]

行形式の共通値は 1 つの RawText 項目です。
title の 1 文字の区切り、またはアクセシビリティのコロンの直後から、
行の値の末尾までの文字をすべて保持します。
内容が厳密に空なら値のトークンはなく、空白だけならトークンがあります。
[fixture: pie/title-spaces]
[fixture: pie/title-whitespace-last]
[fixture:
pie/acctitle-spaces]
[fixture: pie/accdescr-spaces]
[fixture:
pie/review-acctitle-whitespace-final]
[fixture:
pie/review-accdescr-whitespace-final]
[fixture: pie/acctitle-eof]
[fixture:
pie/accdescr-eof]
[fixture: pie/ast-title-tab-null-eof]
[fixture:
pie/ast-common-values-directive-only]
[fixture: pie/title-comment]
[fixture:
pie/lex-common-values-comment-region-ls]

説明ブロックの値は、両端の共通空白を除く 1 つの RawText 項目です。
空または空白だけの内部には、値のトークンがありません。
波括弧は別々の Punctuator 項目です。
[fixture: pie/accdescr-block]
[fixture:
pie/accdescr-block-unicode-trim]
[fixture: pie/accdescr-empty-block-last]
[fixture: pie/accdescr-space-block-last]
[fixture:
pie/gram-description-block-directive-only]
[fixture:
pie/gram-description-block-comment-only]

各 PieIgnoredText は、開閉のフェンスと内部の余白・改行を含む、
1 つの RawText 項目です。
直前の ASCII 余白と、閉じた後で消費する LF は含みません。
本文が空でもフェンスのテキストが残ります。
[fixture: pie/frontmatter-between-section-parts]
[fixture:
pie/review-yaml-hidden-empty]
[fixture: pie/review-directive-empty-body]
[fixture: pie/review-directive-hidden-crlf]
[fixture:
pie/review-directive-hidden-space-boundary]
[fixture:
pie/gram-section-eof-hidden-yaml]
[fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-hidden-directive-lone-cr]

共通ディレクティブ、コメント領域、選ばれたセミコロンは、
共通規則に従って String と RawText の項目を分割します。
分割した文字列は StringFragment になります。
分割箇所はノードの範囲内に残りますが、値からは除きます。
[fixture: pie/directive-label-middle]
[fixture: pie/directive-title-middle]
[fixture: pie/label-crlf]
[fixture: pie/comment-label-line]
[fixture:
pie/lex-yaml-body-comment-content]
[fixture:
pie/lex-hidden-global-comment-region]
[fixture: pie/style-label-trigger]
[fixture: pie/style-acctitle-trigger]
[fixture:
pie/lex-yaml-opener-selected-semicolon]

固定キーワードと数値は分割できません。
内部のディレクティブや選ばれたセミコロンは、共通の境界エラーで拒否します。
accTitle とコロンの間、accDescr と波括弧の間など、
完全な構成要素同士の境界では共通 trivia を許します。
[fixture: pie/div-directive-in-header]
[fixture:
pie/div-directive-in-showdata]
[fixture: pie/div-directive-in-title-keyword]
[fixture: pie/div-directive-in-acctitle-keyword]
[fixture:
pie/div-directive-in-accdescr-keyword]
[fixture:
pie/div-directive-in-accdescr-block-keyword]
[fixture: pie/div-directive-number]
[fixture: pie/div-atomic-semicolon-number]
[fixture:
pie/div-selected-semicolon-title-keyword]
[fixture:
pie/div-selected-semicolon-showdata]
[fixture:
pie/div-selected-semicolon-acctitle]
[fixture:
pie/div-selected-semicolon-accdescr]
[fixture:
pie/div-selected-semicolon-block-keyword]
[fixture:
pie/review-directive-acc-title-colon]
[fixture:
pie/review-directive-acc-descr-block-opener]

## コメントと trivia

単位間の ASCII スペース・タブと、見える物理改行にはトークンがありません。
隠し形式が消費した LF にもありません。
追加する LF はソーステキストやトークンを加えません。
[fixture: pie/lex-tab]
[fixture: pie/lex-tab-blank-line]
[fixture:
pie/lex-crlf]
[fixture: pie/lex-hidden-before-colon-lf]
[fixture:
pie/gram-section-eof-hidden-yaml]
[fixture: pie/review-directive-hidden-eof]

図のパーセント対コメントは共通の Comment レコードです。
最初のパーセントから物理 LF の直前までを範囲とし、
mark は %%、value は対の後のテキストです。
トークンはなく、LF を消費しません。
LS/PS はコメント内に残ります。
共通コメント領域は、共通規則に従ってコメントを断片に分割できます。
[fixture: pie/comment-section-glued]
[fixture:
pie/comment-section-eof]
[fixture: pie/review-comment-bare-header-eof]
[fixture: pie/lex-native-triple-percent-inline]
[fixture: pie/comment-ls]
[fixture: pie/comment-ps]
[fixture: pie/lex-comment-ls-region-bridge]

検出が通過した裸のパーセント対の行も、同じ Comment レコードになります。
それらの行と、一緒に通過した空白・改行は、再び読みません。
保持するヘッダー前の YAML と、2 回目の走査で見つけた DIRECTIVE 形式は、
RawText 項目になります。
[fixture: pie/comment-preheader-unclosed-percent-brace]
[fixture:
pie/lex-bare-percent-braces-before-header]
[fixture:
pie/div-preheader-bare-ls-blank]
[fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/div-preheader-retained-yaml-bare-ls]
[fixture: pie/div-preheader-retained-yaml-bare-bom]
[fixture: pie/div-preheader-retained-yaml-bare-ls-line]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii]
[fixture: pie/lex-preheader-retained-yaml-bare-ascii-line]
[fixture: pie/div-preheader-retained-directive-bare-ls]
[fixture: pie/div-preheader-retained-directive-bare-bom]
[fixture: pie/div-preheader-retained-directive-bare-ls-line]
[fixture: pie/lex-preheader-retained-directive-bare-ascii]
[fixture: pie/lex-preheader-retained-directive-bare-ascii-line]
[fixture: pie/div-preheader-retained-yaml-bare-then-directive]
[fixture: pie/lex-preheader-retained-yaml-bare-then-directive-ascii]

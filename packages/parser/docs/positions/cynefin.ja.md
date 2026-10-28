# Cynefin の位置

英語版: [cynefin.md](./cynefin.md)

範囲は[記述されたノードの仕様](../../../spec/docs/ast/cynefin.md)に従い、
元の UTF-16 オフセットとソースの改行表記を使います。
Root は入力全体を覆います。 [fixture: cynefin/db-all-fields]
[fixture: cynefin/line-crlf]

## 範囲

CynefinDiagram は最初の保持されたヘッダー前形式から、
それがなければヘッダーから、最後のヘッダー・本文形式までです。
textBeforeHeader は保持されたネイティブ YAML と再走査のディレクティブです。
通過した裸の行と付随する trivia はそれらのノードの外です。 [fixture: cynefin/detect-real-before-retained-secondscan]
[fixture: cynefin/detect-retained-secondscan-bare-ls]
[fixture: cynefin/lex-title-one-space]
[fixture: common/detect-minimal-cynefin]

ドメイン文はドメイン語から最後の項目までです。
項目がなければ最後の textAfterName 形式、両方なければ語の末尾までです。
textAfterName は最初の可視 LF または次の可視単位の前で終わります。
項目は最初の textBefore 形式、なければ開始引用符から、最後の textAfter 形式、
なければ閉じ引用符までです。
可視 LF より前の直後の形式は名前・項目の接尾です。
LF 後の形式は同じブロックに実在する次の項目に属し、
その項目がなければ Diagram.body に属します。
可視 LF を探す前にネイティブ形式の消費を決めます。 [fixture: cynefin/gram-domain-empty-eof]
[fixture: cynefin/hidden-domain-empty-suffix]
[fixture: cynefin/hidden-domain-item-members]
[fixture: cynefin/hidden-before-first-item-after-eol]
[fixture: cynefin/hidden-item-after-visible-eol]
[fixture: cynefin/hidden-domain-end-after-visible-eol]
[fixture: cynefin/hidden-empty-domain-after-visible-eol]

遷移は from から最後の textAfter 形式までです。
それがなければラベルの閉じ、ラベルもなければ宛先語までです。
矢印は --> 全体を覆います。
名前付きの各隙間は隠し形式全体だけを所有します。
コロンと文字列の組がなければ両ラベル用リストは空で、
宛先後の形式は textAfter です。
StringLiteral は空の文字列でも引用符を含み、raw はソースそのものです。
必須の可視 EOL は文の外です。 [fixture: cynefin/hidden-all-unit-gaps]
[fixture: cynefin/hidden-unlabeled-transition-gaps]
[fixture: cynefin/hidden-two-transition-suffixes]
[fixture: cynefin/db-empty-texts]
[fixture: cynefin/lex-string-conversion]
[fixture: cynefin/hidden-after-visible-eol]

共通文はキーワードから始まります。
title は値の末尾まで、値が null ならキーワードまでです。
アクセシビリティ行は値またはコロン、ブロックは最初の閉じ波括弧までです。
各文は可視 EOL より前のネイティブ接尾まで延長します。
EOL 後の形式は本文に属します。
CynefinLiteral は行値の空白を保持し、ブロック値は外側の共通空白だけを除きます。
null の値には葉がありません。 [fixture: cynefin/common-title-eof]
[fixture: cynefin/lex-title-one-space]
[fixture: cynefin/common-title-comment-only]
[fixture: cynefin/common-title-directive-only]
[fixture: cynefin/lex-title-one-tab]
[fixture: cynefin/lex-title-two-spaces]
[fixture: cynefin/common-line-whitespace]
[fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-repeat-empty]
[fixture: cynefin/hidden-title-suffix]
[fixture: cynefin/hidden-acctitle-suffix]
[fixture: cynefin/hidden-description-suffix]
[fixture: cynefin/hidden-block-suffix]
[fixture: cynefin/hidden-common-after-visible-eol]

CynefinIgnoredText は開始記号から条件を満たす閉じまでで、
開始前の空白と消費した直後の改行を除きます。
一つのネイティブ一致には一つの所有先があります。
値は共通の除去対象を除きますが、範囲はそれらをまたぎます。
記述された CR/CRLF 表記は保持します。 [fixture: cynefin/hidden-yaml-opener-padding]
[fixture: cynefin/hidden-yaml-adjacent-later]
[fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-directive-cr]
[fixture: cynefin/hidden-directive-crlf]
[fixture: cynefin/hidden-yaml-bare-cr]
[fixture: cynefin/hidden-yaml-common-directive]
[fixture: cynefin/hidden-yaml-comment-region]

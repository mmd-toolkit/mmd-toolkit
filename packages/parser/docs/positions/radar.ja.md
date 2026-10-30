# radar の位置

英語版: [radar.md](./radar.md)

範囲は [radar ノードの仕様](../../../spec/docs/ast/radar.ja.md) に従い、
元の UTF-16 オフセットとソースの行終端を使います。
Root は入力全体を覆います。 [fixture: radar/gram-written-tree]
[fixture: radar/line-crlf]

## 範囲

RadarDiagram はヘッダー前の最初の保持形式から始まり、
なければヘッダーから始まって、最後の記述されたヘッダーか本体形式で終わります。
外側の空白、コメント、検出が通過した trivia、追加 LF は含みません。
textBeforeHeader は保持する YAML と 2 回目の走査のディレクティブを所有します。
textBeforeColon は記述された分離コロンの前の形式だけを所有します。
コロンがなければヘッダー後の形式は body に属します。
[fixture: radar/detect-secondscan-native]
[fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/header-separated-colon] [fixture: radar/header-colon-hidden]
[fixture: radar/header-colon-yaml] [fixture: radar/comment-header]
[fixture: radar/bare-line-ls] [fixture: common/detect-minimal-radar]

axis と curve の文はキーワードから始まり、
options の文は最初のオプションのキーワードから始まります。
各グループは最後のメンバーの hidden suffix を含めて終わります。
メンバーは最初の textBefore 形式から始まり、
なければ名前かオプションのキーワードから始まります。
軸は名前かラベルの閉じ角括弧、曲線は entry の閉じ波括弧、
オプションは値で終わり、それぞれ textAfter まで延びます。
コンマはメンバー間の句読点です。 [fixture: radar/gram-written-tree]
[fixture: radar/gram-inline-statements] [fixture: radar/lex-hidden-axis-comma]
[fixture: radar/lex-hidden-curve-comma] [fixture: radar/lex-hidden-option-comma]
[fixture: radar/hidden-yaml-after-axis] [fixture: radar/hidden-yaml-after-curve]
[fixture: radar/lex-hidden-two-suffixes]

ラベルの gap は開始角括弧、文字列、閉じ角括弧の前にあります。
ラベルがなければその gap リストは空で、後の形式は、曲線では textBeforeEntries、
軸では textAfter に属します。
Identifier の範囲は名前だけ、StringLiteral は引用符も含み raw を保持し、
NumericLiteral は数字と小数点を含み raw を保持します。
[fixture: radar/gram-written-tree] [fixture: radar/db-empty-labels]
[fixture: radar/lex-curve-label-hidden-gaps]
[fixture: radar/lex-hidden-before-label-open]
[fixture: radar/lex-hidden-before-label-close]
[fixture: radar/hidden-native-curve-gap] [fixture: radar/hidden-native-axis]
[fixture: radar/db-number-rounded] [fixture: radar/db-number-overflow]

entry は最初の textBefore 形式、なければ数値か軸参照から始まり、
数値か最後の textAfter 形式で終わります。
許可された前後の改行を越えても、内部の形式は entry の gap に属します。
名前付き entry にコロンがあれば、 textBeforeColon はその前、
textBeforeValue はその後です。
コロンがなければ textBeforeColon は空で、
textBeforeValue が間の全形式を所有します。
[fixture: radar/lex-hidden-before-first-entry]
[fixture: radar/lex-hidden-before-entries-close]
[fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-number-entry-hidden-across-lines]
[fixture: radar/lex-named-entry-hidden-across-lines]
[fixture: radar/lex-hidden-detailed-before-colon]
[fixture: radar/lex-hidden-detailed-no-colon]

共通文はキーワードから始まります。
title は値か null のときキーワード、アクセシビリティ行は値か null のときコロン、
ブロックは最初の閉じ波括弧で終わります。
それぞれ可視 EOL 前の textAfter まで延び、それより後の形式は body に属します。
RadarLiteral は行値の空白すべて、
または両端だけ空白を除いたブロック値を覆います。
null に葉はありません。 [fixture: radar/common-repeat-empty]
[fixture: radar/lex-common-title-one-space]
[fixture: radar/lex-common-title-two-spaces]
[fixture: radar/lex-common-empty-values]
[fixture: radar/common-block-whitespace]
[fixture: radar/lex-common-description-only-directive]
[fixture: radar/lex-common-description-only-comment]
[fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-eof] [fixture: radar/lex-hidden-after-visible-eol]

RadarIgnoredText は開始から選択した有効な終端までを覆い、
直前の空白と消費した直後の LF は含みません。
1 つの一致には所有先が 1 つだけあります。
値は共通ディレクティブ、コメント領域、選択されたセミコロンを除き、
範囲はそれらをまたぎ、ソースの行終端は記述どおり保持します。
[fixture: radar/lex-hidden-padding] [fixture: radar/hidden-yaml-adjacent-eof]
[fixture: radar/detect-retained-three-native]
[fixture: radar/lex-hidden-yaml-two-nonempty] [fixture: radar/hidden-yaml-crlf]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/lex-hidden-yaml-content-common-comment]
[fixture: radar/lex-hidden-native-content-common-comment]
[fixture: radar/lex-hidden-yaml-opener-selected-control]
[fixture: radar/lex-hidden-native-opener-selected]

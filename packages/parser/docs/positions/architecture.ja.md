# architecture の位置

英語版: [architecture.md](./architecture.md)

範囲は [ノード仕様](../../../spec/docs/ast/architecture.md#nodes)に従い、
元の UTF-16 オフセットとソースの改行を使います。
Root は入力全体を覆います。 [fixture: architecture/gram-written-tree]
[fixture: architecture/line-crlf]

## 範囲

ArchitectureDiagram は、ヘッダー前に保持する最初の形式、なければヘッダーから、
最後の書かれた形式までを覆います。
外側の余白、通過した裸の行と付随する trivia、コメント、
追加の LF は範囲を延ばしません。
textBeforeHeader は、
保持する YAML と二回目の走査のネイティブ形式を所有します。 [fixture: architecture/header-beta]
[fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/detect-two-second-scan-forms]
[fixture: architecture/detect-empty-braces-bare]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/end-statements-comments]

宣言は group・service・junction から始まり、存在する最後の親 ID、ラベル終端、
アイコン終端、宣言 ID の順で終わります。
可視 EOL 前の最後の隠れた接尾形式まで延びます。
junction にアイコンやラベルはありません。
存在する任意要素の前の隠れた形式は、その要素の gap に属します。
要素がなければ、
次に存在する要素か textAfter に属します。 [fixture: architecture/gram-written-tree]
[fixture: architecture/header-inline-group]
[fixture: architecture/header-inline-service]
[fixture: architecture/header-inline-junction]
[fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-parent-gap]
[fixture: architecture/hidden-yaml-group-eof]
[fixture: architecture/hidden-yaml-service-eof]
[fixture: architecture/hidden-yaml-junction-eof]

辺は左 ID から右修飾子の閉じ波括弧まで、なければ右 ID までで、
textAfter まで延びます。
矢印は両ポートのコロンを含み、内部の gap と任意ラベルを覆います。
マーカーや任意要素がなければ、
その名前の gap は空です。 [fixture: architecture/db-mixed]
[fixture: architecture/end-edge-eof]
[fixture: architecture/hidden-yaml-edge-eof]
[fixture: architecture/hidden-yaml-edge-gaps]
[fixture: architecture/gram-hidden-modifier-gaps]
[fixture: architecture/hidden-directive-unit-gaps]

整列は align から最後のメンバー ID までで、textAfter まで延びます。
各メンバーは直前の最初の隠れた形式、なければ自身の ID から、
自身の ID の終わりまでを覆います。
メンバーと文の順序は、
書かれた順序のままです。 [fixture: architecture/db-align-forward-repeat]
[fixture: architecture/hidden-yaml-align-gap]
[fixture: architecture/hidden-directive-align-eof]
[fixture: architecture/hidden-directive-unit-gaps]

Identifier はアイコンの丸括弧を含みません。
文字列アイコンは両引用符を含む StringLiteral で、
raw はソースの切り出しそのものです。
ラベルは両角括弧を覆い、値は kind が text なら角括弧だけを、
string なら一致する引用符も除きます。
裸のラベル内部の余白は保持します。 [fixture: architecture/lex-icon-leading-symbols]
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/lex-string-conversion]
[fixture: architecture/db-empty-values]
[fixture: architecture/lex-title-quoted-brackets]
[fixture: architecture/lex-title-padded-quotes]
[fixture: architecture/lex-title-unclosed-quote-with-close]

共通文はキーワードから始まります。
title は値、null ならキーワードの終わりまでです。
アクセシビリティの行は値、null ならコロンまでです。
説明ブロックは内容が null でも最初の閉じ波括弧までです。
それぞれ最初の可視 EOL 前の textAfter まで延び、
以降の隠れた形式は body に属します。
ArchitectureLiteral は余白を含む行の内容か、
両端だけを trim したブロック内容を覆います。
null に葉はありません。 [fixture: architecture/common-repeat-empty]
[fixture: architecture/lex-title-one-space-null]
[fixture: architecture/lex-title-two-spaces-literal]
[fixture: architecture/lex-acctitle-whitespace-only]
[fixture: architecture/lex-description-line-whitespace-only]
[fixture: architecture/lex-description-block-whitespace-only]
[fixture: architecture/common-description-block-directive]
[fixture: architecture/common-description-block-comment]
[fixture: architecture/common-block-whitespace]
[fixture: architecture/hidden-directive-title-eof]
[fixture: architecture/hidden-directive-acctitle-eof]
[fixture: architecture/hidden-directive-accdescr-eof]
[fixture: architecture/hidden-directive-block-eof]
[fixture: architecture/lex-hidden-after-visible-eol]

ArchitectureIgnoredText は開始から選ばれた終端までを覆い、
直前の余白と消費した直後の LF を含みません。
三つのフェンスの一致は一ノードで、別々の一致は別ノードです。
共通ディレクティブ、コメント領域、選択されたセミコロンは、
それらをまたぐノードの範囲内にありますが、値からは除きます。
ソースの改行をそのまま保持します。 [fixture: architecture/hidden-yaml-open-padding]
[fixture: architecture/hidden-yaml-three-fences]
[fixture: architecture/lex-yaml-two-nonempty]
[fixture: architecture/lex-hidden-two-suffixes]
[fixture: architecture/hidden-yaml-crlf]
[fixture: architecture/hidden-directive-crlf]
[fixture: architecture/hidden-directive-eof]
[fixture: architecture/lex-yaml-global-directive]
[fixture: architecture/lex-yaml-common-comment]
[fixture: architecture/lex-yaml-selected-semicolon]
[fixture: architecture/directive-fields] [fixture: architecture/style-fields]

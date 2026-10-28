# Eventmodeling の位置

英語版: [eventmodeling.md](./eventmodeling.md)

range は[記述された木](../../../spec/docs/ast/eventmodeling.md)を元ソースの UTF-16 オフセットで実装します。
Root はソース全体を覆い、
CR/CRLF と未変換の値の表記を保ちます。 [fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/line-cr]
[fixture: eventmodeling/line-crlf] [fixture: eventmodeling/entity-common]
[fixture: eventmodeling/html-common]

## 範囲

EventmodelingDiagram は最初の textBeforeHeader 形式、なければ header から、
最後の body item、なければ header 末尾までです。
通過した bare 行、外側の空白、native コメントは範囲を延ばしません。
最後の完成した文の後の hidden form は body
item です。 [fixture: eventmodeling/header-only]
[fixture: eventmodeling/detect-real-retained-secondscan]
[fixture: eventmodeling/detect-retained-bare-ls-line]
[fixture: eventmodeling/comment-native]
[fixture: eventmodeling/lex-native-directive-object-eof]

frame は tf/timeframe または rf/resetframe から始まり、最後の data、
dataReference、source reference、修飾名までです。
後続の任意要素が先行 hidden form を所有し、なければ body に戻します。
必須要素の gap は指定されたフィールドに属します。
model/data
entity 宣言と note はキーワードから名前または必須 block までです。 [fixture: eventmodeling/gram-written-tree]
[fixture: eventmodeling/lex-hidden-frame-type-gap]
[fixture: eventmodeling/lex-hidden-frame-entity-gap]
[fixture: eventmodeling/lex-hidden-frame-optional-gaps]
[fixture: eventmodeling/hidden-yaml-after-frame]
[fixture: eventmodeling/lex-hidden-yaml-name-gap]
[fixture: eventmodeling/lex-hidden-data-name-gap]
[fixture: eventmodeling/lex-hidden-note-frame-gap]

QualifiedName は head から最後の部分までです。
各 tail member は最初の textBeforeDot 形式、なければ dot から名前末尾です。
SourceReference と DataReference は最初の textBefore 形式、
なければ ->> または [[ から frame 名または ]] までです。
Arrow は ->> 全体、
Identifier は個々の名前または数字列の atom を覆います。 [fixture: eventmodeling/lex-qualified-hidden-components]
[fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-hidden-source-frame-gap]
[fixture: eventmodeling/lex-hidden-reference-name-close]
[fixture: eventmodeling/db-source-leading-zero]

InlineData と DataBlock は最初の textBefore 形式、
なければ tag の backtick または本文の開始記号から、本文の閉じ記号までです。
tag 内の各 gap は別のフィールドに属します。
block が消費した後続 LF はノード外です。
Literal は空白と改行を含む残存する波括弧内部全体で、block の値は非 null です。
inline の空の波括弧は null、
空の引用文字列は引用符と raw を持つ StringLiteral のままです。 [fixture: eventmodeling/lex-hidden-type-tag]
[fixture: eventmodeling/lex-hidden-data-tag-gaps]
[fixture: eventmodeling/lex-block-empty-whitespace]
[fixture: eventmodeling/data-block-close-eof]
[fixture: eventmodeling/data-block-close-space]
[fixture: eventmodeling/lex-block-close-ps-boundary]
[fixture: eventmodeling/lex-inline-empty]
[fixture: eventmodeling/directive-string-middle]

GWT は gwt から最後の then item までです。
clause/item は最初の textBefore 形式、なければ keyword/type から、
最後の item/name までです。
先行形式は次の item/clause が所有し、最後の then item の後は body に戻します。
EOL が所有する suffix はありません。 [fixture: eventmodeling/lex-hidden-gwt-required-gaps]
[fixture: eventmodeling/lex-hidden-gwt-clause]
[fixture: eventmodeling/lex-hidden-gwt-items]
[fixture: eventmodeling/lex-hidden-gwt-item-gap]
[fixture: eventmodeling/gram-gwt-next-top-level]
[fixture: eventmodeling/lex-native-directive-object-eof]

共通文は先行字下げを除くキーワードから始まります。
行は値の最終文字まで、null なら keyword/colon まで、
block は最初の閉じ波括弧までです。
Literal は title の ASCII 区切り一文字の後、accessibility colon の後、
または波括弧の内部から始まり、それ以降の空白をすべて保ちます。
null の値に leaf はなく、
空白だけの値にはあります。 [fixture: eventmodeling/common-title-only]
[fixture: eventmodeling/common-title-empty]
[fixture: eventmodeling/lex-common-title-two-spaces]
[fixture: eventmodeling/common-acctitle-eof]
[fixture: eventmodeling/common-description-eof]
[fixture: eventmodeling/lex-common-block-whitespace-only]
[fixture: eventmodeling/gram-description-block-empty-after-removal]

IgnoredText は native 開始記号から閉じ記号までで、
先行空白と消費した後続 LF を除きます。
各 match の所有者は一つです。
payload と無視テキストの値は共通除去を除き、range は内部の除去形式をまたぎます。
書かれていない論理 LF を含む range はありません。 [fixture: eventmodeling/hidden-yaml-after-frame-space]
[fixture: eventmodeling/lex-hidden-yaml-fence-directive]
[fixture: eventmodeling/lex-native-directive-object-eof]
[fixture: eventmodeling/directive-block-middle]
[fixture: eventmodeling/data-block-close-eof]

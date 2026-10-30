# Treemap の位置

英語版: [treemap.md](./treemap.md)

範囲は [treemap のソース木](../../../spec/docs/ast/treemap.md)に従い、
元の UTF-16 オフセットとソースの行終端を使う。
Root は入力全体を覆う。 [fixture: treemap/gram-written-tree]
[fixture: treemap/line-name-values] [fixture: treemap/line-crlf]

## 範囲

TreemapDiagram はヘッダーから最後の文までとなり、
body が空ならヘッダー末尾までとなる。
外側の空白、ネイティブコメント、通過した trivia、追加 LF は延長しない。
保持された接頭形式のノードはない。 [fixture: treemap/header-beta]
[fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/gram-written-tree] [fixture: treemap/hidden-comment-eof]
[fixture: treemap/detect-second-scan-single-line-comment]
[fixture: common/detect-minimal-treemap]

section と leaf は statementsBefore の最初の文、
その gap がなければ名前の開き引用符から始まる。
section は最後の子孫まで、子がなければ閉じ引用符かセレクターまでとなる。
leaf は数値またはセレクターで終わり、children を持たない。
範囲は連続し、名前の開始と一致するとは限らず、兄弟同士は重ならない。
最初の所有構文より前の字下げと、無関係な後続 trivia は範囲を延ばさない。
割り当てた字下げは、前の行の連続や directive をまたぐ場合も字句の数を保つ。
構成要素間の隙間は範囲内に残り、子ノードにはならない。
[fixture: treemap/gram-written-tree] [fixture: treemap/gram-adjacent-sections]
[fixture: treemap/db-empty-names] [fixture: treemap/db-section-tail-space]
[fixture: treemap/db-leaf-tail-tab]
[fixture: treemap/gram-indent-from-whitespace-line]
[fixture: treemap/gram-indent-around-global-directive]
[fixture: treemap/gram-leaf-newlines-around-separator]
[fixture: treemap/comment-value-selector-gap]
[fixture: treemap/gram-nesting-statement-before-section]
[fixture: treemap/gram-nesting-statement-before-ancestor-child]
[fixture: treemap/gram-nesting-statement-after-last-child]

開いている葉の内容を先にその葉に残す。
階層ノード間の独立したクラス定義と共通文は、
次の section または leaf の statementsBefore が原順で所有する。
空ブロックと繰り返された文も含む。
最初の階層ノードより前と最後より後の独立文は body に残る。
所有する場所は、図全体に対する文の意味を限定しない。
共通コメント、directive、選ばれたセミコロン、空行は gap の項目を作らない。
[fixture: treemap/lex-class-style-crosses-blank-line]
[fixture: treemap/gram-written-tree]
[fixture: treemap/gram-nesting-title-before-child]
[fixture: treemap/gram-nesting-acctitle-before-child]
[fixture: treemap/gram-nesting-description-before-child]
[fixture: treemap/gram-nesting-block-before-child]
[fixture: treemap/gram-nesting-empty-class-before-child]
[fixture: treemap/gram-nesting-global-class-before-child]
[fixture: treemap/gram-nesting-statement-after-last-child]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-nesting-statements-directive-inline]
[fixture: treemap/gram-nesting-statements-directive-line]
[fixture: treemap/gram-nesting-statements-comment-line]
[fixture: treemap/gram-nesting-statements-empty-line]
[fixture: treemap/gram-nesting-statements-comment-ls]
[fixture: treemap/gram-nesting-statements-comment-ps]

クラス定義は classDef から書かれた終端セミコロンまでとなる。
それがなければ最後のスタイル文字まで、style が null なら名前までとなる。
最後の構成要素を越える区切り空白や、
共通行規則が無視するセミコロンは範囲を延長しない。
スタイル全体は、後続の行やクラス定義に見える内容を含み得る。
[fixture: treemap/gram-written-tree]
[fixture: treemap/gram-class-empty-with-semicolon]
[fixture: treemap/db-class-empty]
[fixture: treemap/gram-class-whitespace-style-null]
[fixture: treemap/directive-class-only-style-null]
[fixture: treemap/db-style-whitespace] [fixture: treemap/style-fields]
[fixture: treemap/lex-class-style-crosses-blank-line]
[fixture: treemap/lex-class-style-takes-next-class]

共通文はキーワードから始まり、先行する空白を除く。
title は値まで、null ならキーワードまでとなる。
アクセシビリティの行は値まで、null ならコロンまでとなる。
ブロックは空でも必須の最初の閉じ波括弧までとなる。
後続 EOL は文に含めない。 [fixture: treemap/lex-leading-padding-title-priority]
[fixture: treemap/common-title-one-space]
[fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-directive-only]
[fixture: treemap/common-acctitle-eof] [fixture: treemap/common-description-eof]
[fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-title-block-node-adjacent]
[fixture: treemap/gram-description-block-acctitle-adjacent]

TreemapLiteral は自身の空白を含む、書かれた行・スタイル値の範囲、
または外側の共通空白だけを除いたブロック内部の範囲となる。
null フィールドに literal はない。
Identifier は名前だけ、StringLiteral は両引用符を含む。
NumericLiteral は value が読む接頭部だけでなく、書かれた数値全体を覆う。
値内の共通 trivia は value から除き、 raw と範囲はソースを保持する。
[fixture: treemap/common-title-two-spaces]
[fixture: treemap/common-acctitle-whitespace-only]
[fixture: treemap/common-description-whitespace-only]
[fixture: treemap/common-block-whitespace]
[fixture: treemap/db-style-whitespace]
[fixture: treemap/common-block-directive-only]
[fixture: treemap/common-block-comment-only]
[fixture: treemap/gram-written-tree] [fixture: treemap/db-number-multiple-dots]
[fixture: treemap/directive-name-middle] [fixture: treemap/directive-style]
[fixture: treemap/common-block-comment] [fixture: treemap/style-fields]

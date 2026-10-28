# Treemap のトークン

英語版: [treemap.md](./treemap.md)

トークンは仕様の [順序付き規則](../../../spec/docs/diagrams/treemap.md#ordered-rules)で、
最初に適用できる完全な一致を選ぶ。
共通形式とクラス定義は、
書かれた構成要素の境界で分ける。 [fixture: treemap/gram-written-tree]
[fixture: treemap/lex-class-name-title-prefix]

## トークン

| 種類         | 対象                                              | fixture                                                                                                                      |
| ------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー、classDef、共通キーワード。              | [fixture: treemap/gram-written-tree] [fixture: treemap/header-beta]                                                          |
| `Identifier` | クラス名とセレクター。                            | [fixture: treemap/gram-written-tree] [fixture: treemap/lex-selector-single-letter] [fixture: treemap/gram-selector-keywords] |
| `Numeric`    | 数字・下線・点・コンマの連続全体。                | [fixture: treemap/db-number-mixed] [fixture: treemap/lex-number-commas-before-next-node]                                     |
| `String`     | 空名も含む、引用符付きの名前全体。                | [fixture: treemap/db-empty-names] [fixture: treemap/lex-string-conversion]                                                   |
| `Punctuator` | `:::`、コロン、コンマ、クラス終端、説明の波括弧。 | [fixture: treemap/gram-written-tree] [fixture: treemap/gram-class-empty-with-semicolon]                                      |
| `RawText`    | クラススタイル全体と共通値。                      | [fixture: treemap/db-style-whitespace] [fixture: treemap/common-repeat-empty]                                                |

どちらのヘッダーも一つの Keyword 項目になる。
クラスマーカーは一つの Punctuator 項目で、三つのコロンは分割できない。
数値は、値が接頭部のみを読む場合も、丸め、NaN、overflow の場合も、
表記全体を保持する。 [fixture: treemap/header-beta]
[fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/div-directive-style-marker]
[fixture: treemap/db-number-underscore] [fixture: treemap/db-number-rounded]
[fixture: treemap/db-number-nan] [fixture: treemap/db-number-overflow]

行の値は、title の一つの ASCII 区切り、
またはアクセシビリティのコロンの後の空白をすべて保持する。
空の内容には値トークンがなく、空白だけの行内容にはある。
ブロック値は外側の共通空白だけを除く。
空または共通 trivia だけのブロックには値トークンがない。
クラススタイルは最大の区切り空白と終端セミコロンを除き、
自身の末尾空白を保持する。 [fixture: treemap/common-title-one-space]
[fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-two-spaces]
[fixture: treemap/common-title-directive-only]
[fixture: treemap/common-acctitle-whitespace-only]
[fixture: treemap/common-description-whitespace-only]
[fixture: treemap/common-block-whitespace]
[fixture: treemap/common-block-whitespace-only]
[fixture: treemap/common-block-directive-only]
[fixture: treemap/common-block-comment-only]
[fixture: treemap/db-style-whitespace]
[fixture: treemap/directive-class-only-style-null]

共通 directive、コメント領域、選択されたセミコロンは、
RawText と String 項目を分割する。
文字列の断片は StringFragment になる。
Keyword、Identifier、Numeric、Punctuator の原子内の分割は拒否する。
完全な構成要素間の分割は trivia で、
不足する空白を補わない。 [fixture: treemap/directive-style]
[fixture: treemap/directive-name-middle]
[fixture: treemap/common-block-comment] [fixture: treemap/style-fields]
[fixture: treemap/directive-header-middle]
[fixture: treemap/directive-class-name] [fixture: treemap/directive-number]
[fixture: treemap/div-directive-style-marker]
[fixture: treemap/div-semicolon-selector-atom]
[fixture: treemap/div-semicolon-number-atom]
[fixture: treemap/directive-class-keyword-name-gap]
[fixture: treemap/directive-class-keyword-missing-space]

## コメントと trivia

インデントは最大の ASCII 空白・タブ単位で、トークンを持たない。
前の行の連続や、directive を挟んでつながる連続も含む。
隠れた改行を挟む別々の連続は別単位のままになる。
余ったインデント単位を消費する、
一般的な隠れた空白規則はない。 [fixture: treemap/db-tabs-count]
[fixture: treemap/db-header-tail-space]
[fixture: treemap/db-leaf-tail-tab]
[fixture: treemap/gram-indent-from-whitespace-line]
[fixture: treemap/gram-indent-around-global-directive]
[fixture: treemap/gram-two-indent-runs]
[fixture: treemap/gram-header-trailing-indent-eof]

ネイティブコメントの mark は `%%` で、最初の % から、
次の物理的な行終端の直前までとなり、LS・PS は内容に残る。
改行と追加 LF にトークンはない。
検出が通過した bare 行は Comment となり、
その付随 trivia は保持された接頭形式の周囲でも再読しない。
保持された一行の二回目走査形式はネイティブ Comment となり、
別の Directive や隠れたノードを作らない。 [fixture: treemap/comment-native-crlf-ending]
[fixture: treemap/comment-ls]
[fixture: treemap/comment-ps] [fixture: treemap/hidden-comment-no-lf]
[fixture: treemap/hidden-comment-eof]
[fixture: treemap/detect-retained-bare-lf-control]
[fixture: treemap/div-retained-before-bare-unicode-line]
[fixture: treemap/div-bare-retained-ascii-header]
[fixture: treemap/detect-second-scan-single-line-comment]

statementsBefore が所有する文も、元の項目とトークン境界をすべて保つ。
section の children はトークンを追加しない。
スタイルに含まれる内容は一つの literal に残り、
別の gap 項目にはならない。 [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-nesting-statement-before-section]
[fixture: treemap/lex-class-style-crosses-blank-line]
[fixture: treemap/gram-nesting-statements-directive-inline]

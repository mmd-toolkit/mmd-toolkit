# Treeview のトークン

英語版: [treeview.md](./treeview.md)

字句解析は仕様の
[順序付き単位](../../../spec/docs/diagrams/treeview.md#ordered-units)に従う。
より長い bare-name との比較はヘッダーだけに適用する。
共通文法、native YAML、hidden directive、可視 newline 単位はない。
ASCII の字下げが hidden whitespace に先行するため、
別の hidden-whitespace reader は使わない。
[fixture: treeview/header-only] [fixture:
treeview/header-nbsp-custom-boundary] [fixture: treeview/gram-body-yaml]
[fixture: treeview/detect-secondscan-singleline] [fixture:
treeview/gram-quoted-tail-space-next-indent]

## トークン

| 種類         | 対象                                          | fixture                                                                                      |
| ------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー、共通キーワード、注釈の `icon`。     | [fixture: treeview/gram-written-tree]                                                        |
| `Identifier` | 完全なクラス名とアイコン参照。                | [fixture: treeview/annotation-class-digit] [fixture: treeview/annotation-icon-leading-colon] |
| `Punctuator` | `:::`、`##`、各丸括弧、共通のコロンと波括弧。 | [fixture: treeview/gram-written-tree]                                                        |
| `String`     | 両方の引用符を含む引用名全体。                | [fixture: treeview/db-empty-names] [fixture: treeview/text-double-crlf]                      |
| `RawText`    | 裸の名前、共通文・説明の値、接頭辞、装飾。    | [fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]                   |

外側の枝接頭辞は、内部の空白も含む RawText 項目一つである。
行の最初の非空白文字から、枝と直後の横棒の連続までを覆う。
先頭の空白と区切りの ASCII 空白・タブにはトークンがなく、
割り当てた字下げから合成トークンを作らない。
接頭辞のテキストをキーワードや注釈として読み直さない。
枝と各横棒は別の書かれた構成要素であり、その間に共通 trivia を置ける。
その trivia は共通契約に従って、この RawText 項目を分断する。
[fixture: treeview/box-written-tree] [fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-branch-no-dash] [fixture:
treeview/box-branch-directive-parts] [fixture:
treeview/box-dash-selected-semicolon] [fixture:
treeview/box-prefix-directive-column]

bare-name と description-text は、所有する末尾の空白を保持する。
title の値は ASCII 区切り一つの直後、アクセシビリティ行の値はコロンの直後、
ブロックの値は波括弧のすぐ内側から始まる。
残る値の空白はすべてトークンのテキストであり、空白だけの値も含む。
空または共通規則の除去だけからなる値にはテキスト項目がないが、
空の引用名には String 項目がある。
[fixture: treeview/db-bare-tail-space] [fixture:
treeview/db-description-tail-space] [fixture: treeview/gram-written-tree]
[fixture: treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values] [fixture:
treeview/ast-description-removal-only] [fixture: treeview/ast-icon-removal-only]
[fixture: treeview/db-empty-names]

直接の罫線規則は、枝行の末尾の共通空白を字句解析から除く。
開いている引用名やブロックの内部では、書かれた接頭辞、装飾、
内部で除外された空白も囲む String または RawText 項目に残し、
重なる罫線項目を作らない。
外側の装飾は、最初から最後の非空白文字までの RawText 一つであり、
後続 LF を含まない。
[fixture: treeview/box-tail-branch-no-carry] [fixture:
treeview/box-trim-unicode-tail] [fixture: treeview/box-multiline-name-tail-trim]
[fixture: treeview/box-quoted-decoration] [fixture:
treeview/box-block-decoration] [fixture: treeview/box-unicode-decoration]

accDescr ブロックの RawText 項目は、有効な閉じ波括弧の直前まで、
書かれた内部全体を覆う。
末尾の装飾の行終端と、閉じを導く枝接頭辞もこの項目に残る。
外端を縮めたりトークンを分断したりするのは共有の除去だけであり、
重なる罫線項目は作らない。
[fixture: treeview/box-block-tail-decoration-light-vertical]
[fixture: treeview/box-block-tail-decoration-heavy-vertical]
[fixture: treeview/box-block-tail-decoration-light-dash]
[fixture: treeview/box-block-tail-decoration-heavy-dash]
[fixture: treeview/box-block-tail-decoration-vertical-whitespace]
[fixture: treeview/box-block-tail-decoration-close-same-line]
[fixture: treeview/box-block-tail-decoration-dash-close-same-line]
[fixture: treeview/box-block-tail-decoration-multiple-lines]
[fixture: treeview/box-block-tail-branch-content]
[fixture: treeview/box-block-tail-branch-closer]
[fixture: treeview/box-block-tail-decoration-inactive]
[fixture: treeview/box-block-tail-decoration-indent-control]
[fixture: treeview/box-block-tail-decoration-only-interior]
[fixture: treeview/box-block-tail-decoration-empty-control]
[fixture: treeview/box-block-tail-decoration-opener-line]
[fixture: treeview/box-block-tail-decoration-ascii-dash-control]
[fixture: treeview/box-block-tail-decoration-single-dash]
[fixture: treeview/box-block-tail-decoration-spaces-after]
[fixture: treeview/box-block-tail-decoration-spaces-before]
[fixture: treeview/box-block-tail-decoration-blank-after]
[fixture: treeview/box-block-tail-decoration-two-vertical-lines]
[fixture: treeview/box-block-tail-decoration-directive-inline]
[fixture: treeview/box-block-tail-decoration-directive-line]
[fixture: treeview/box-block-tail-decoration-directive-at-start]
[fixture: treeview/box-block-tail-decoration-selected-semicolon]
[fixture: treeview/box-block-tail-decoration-unselected-semicolon]
[fixture: treeview/box-block-tail-decoration-comment-line]
[fixture: treeview/box-block-tail-decoration-comment-after]
[fixture: treeview/box-block-tail-decoration-blank-before]
[fixture: treeview/box-block-tail-decoration-ls]
[fixture: treeview/box-block-tail-decoration-ps]
[fixture: treeview/box-block-tail-decoration-comment-ls]
[fixture: treeview/box-block-tail-decoration-comment-ps]
[fixture: treeview/box-block-tail-decoration-empty-block-before]
[fixture: treeview/box-block-tail-decoration-crlf]
[fixture: treeview/box-block-tail-decoration-cr]
[fixture: treeview/box-block-tail-decoration-opener-gap-selector]

共通 directive、コメント領域、選択されたセミコロンは、
RawText と String を分断し、
String の断片は StringFragment になる。
ヘッダー・共通キーワード、`icon`、クラス名、完全なアイコン参照、
`:::`、`##` の内部の分断は拒否する。
完全な構成要素間の trivia は許すが、欠けた空白を補わない。
枝と横棒の各要素の間にも、その trivia を置ける。
[fixture: treeview/directive-bare-middle] [fixture:
treeview/directive-double-middle] [fixture: treeview/common-block-comments]
[fixture: treeview/directive-header-inside] [fixture:
treeview/directive-acctitle-inside] [fixture:
treeview/directive-icon-word-inside] [fixture:
treeview/directive-class-value-inside] [fixture:
treeview/directive-icon-value-inside] [fixture: treeview/directive-class-inside]
[fixture: treeview/semicolon-description-inside] [fixture:
treeview/directive-icon-parts-parts] [fixture:
treeview/icon-name-close-semicolon] [fixture:
treeview/box-dash-directive-inside]

## コメントと trivia

native 単位の先頭の `%%` から LF の前までは、
mark が `%%` の共通 Comment である。
U+2028、U+2029、閉じ記号らしいテキストもその内容に残る。
裸の名前・引用名、説明注釈、ブロックが囲む場合は、その値が所有する。
共通の行値はその前で終わる。
[fixture: treeview/native-comment-ls] [fixture: treeview/native-comment-ps]
[fixture: treeview/native-comment-closer-greedy] [fixture:
treeview/comment-in-bare] [fixture: treeview/comment-in-quotes] [fixture:
treeview/tail-description-comment] [fixture:
treeview/common-block-bare-percent] [fixture:
treeview/common-title-percent-boundary]

通常の字下げと hidden LF はトークンを作らない。
検出が通過した裸の percent 行は共通 Comment であり、伴う trivia を読み直さない。
保持された一行の二回目走査形式には native Comment 規則を適用する。
内部のソース directive は共通 Directive のまま残る。
論理的に追加された LF は、書かれたトークンのテキストではない。
[fixture: treeview/db-tabs-one-unit] [fixture: treeview/gram-body-hidden-eof]
[fixture: treeview/bare-line-space] [fixture:
treeview/detect-secondscan-bare-unicode] [fixture:
treeview/detect-bare-before-secondscan] [fixture:
treeview/comment-native-mark-directive]

名前つき gap は同じ RawText の装飾項目を保持する。
既存の葉、textBeforeName、注釈、ブロック開始待ちの所有を先に適用し、
完成した階層ノード間に残る装飾は textBefore が所有する。
children はトークンを追加しない。
[fixture: treeview/box-written-tree]
[fixture: treeview/box-decoration-pending-name-gap]
[fixture: treeview/box-decoration-before-annotation]
[fixture: treeview/box-prefix-common-block-two-prefixes]
[fixture: treeview/gram-nesting-decoration-before-parent]

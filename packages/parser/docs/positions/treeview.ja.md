# Treeview の位置

英語版: [treeview.md](./treeview.md)

範囲は[書かれた木](../../../spec/docs/ast/treeview.md)を、
元の UTF-16 オフセットで表す。
Root はソース全体を覆い、CR/CRLF、タブ、実体参照、引用符はソースの綴りを保つ。
罫線の列と割り当てた字下げはソースの位置を変えない。
[fixture: treeview/gram-written-tree] [fixture: treeview/text-double-crlf]
[fixture: treeview/box-tab-quoted] [fixture: treeview/entity-double]
[fixture: treeview/box-column-nonbmp-discriminating]

## 範囲

TreeviewDiagram はヘッダーから最後の body 項目まで、
body が空ならヘッダーの終わりまでを覆う。
外側の空白、後続の共通 Comment、論理的に追加された LF は範囲を延ばさない。
最後の外側の装飾は範囲に含める。 [fixture: treeview/header-only]
[fixture: treeview/comment-native]
[fixture: treeview/box-decoration-trailing-body]

TreeviewNode は textBefore があればその最初の装飾、なければ prefix、
textBeforeName の装飾、名前のうち最も早いものから始まる。
最後の子孫まで、子がなければ自身の最後の注釈または名前までを覆う。
範囲は連続し、兄弟同士は重ならず、名前の開始と一致するとは限らない。
最初の所有構文より前の通常の字下げと、無関係な後続 trivia は範囲外である。
接頭辞はノードの字下げを与え、native comment が間にあってもその子に残る。
名前を待つ間の装飾は textBeforeName が所有する。
[fixture: treeview/gram-written-tree] [fixture:
treeview/db-quoted-tail-space] [fixture: treeview/box-comment-indent-carry]
[fixture: treeview/box-decoration-pending-name-gap]
[fixture: treeview/gram-nesting-decoration-before-parent]
[fixture: treeview/gram-nesting-decoration-before-ancestor-child]
[fixture: treeview/gram-nesting-decoration-after-subtree]

葉、名前待ち、注釈、ブロック開始待ちの既存の所有を先に適用する。
完成した階層ノード間に残る装飾は、次のノードの textBefore が所有する。
次が子、祖先の別の子、別の根でも同じである。
最初のノードより前と最後のノードより後の独立した装飾は body に残る。
共通コメント、directive、選ばれたセミコロン、空行は gap ノードを作らない。
[fixture: treeview/box-written-tree]
[fixture: treeview/gram-nesting-decoration-before-parent]
[fixture: treeview/gram-nesting-decoration-before-ancestor-child]
[fixture: treeview/spec-box-drawing-preprocessor-e9d19370]
[fixture: treeview/box-decoration-preamble-body]
[fixture: treeview/gram-nesting-decoration-after-subtree]
[fixture: treeview/gram-nesting-decoration-directive-inline]
[fixture: treeview/gram-nesting-decoration-directive-line]
[fixture: treeview/gram-nesting-decoration-comment-line]
[fixture: treeview/gram-nesting-decoration-empty-line]
[fixture: treeview/gram-nesting-decoration-selected-semicolon]
[fixture: treeview/gram-nesting-decoration-unselected-semicolon]

注釈は最初の textBefore の装飾、なければ prefix、それもなければ `:::`、`icon`、
`##` から始まる。
クラス名、アイコンの閉じ丸括弧、説明の最後の文字で終わる。
空の説明は `##` で終わる。
装飾の後に注釈がある場合だけ注釈が所有する。
なければ次の階層ノードの textBefore に、次がなければ body に残す。
注釈の接頭辞はノードの indent を変えない。
[fixture: treeview/box-decoration-before-annotation] [fixture:
treeview/ast-annotation-prefixes] [fixture:
treeview/box-decoration-trailing-body] [fixture:
treeview/annotation-class-space] [fixture: treeview/db-icon-none]
[fixture: treeview/db-description-empty]

共通文は prefix、なければキーワードから始まり、前の通常の空白を除く。
行の文は値の最後の文字、値が null ならキーワードまたはコロンで終わる。
ブロックは最初の有効な閉じ波括弧で終わる。
accDescr と開始波括弧の間の接頭辞と装飾は textBeforeOpen が所有する。
空ブロックも両方の波括弧を持つ。
最初の階層ノードより前の装飾は body に残り、共通文の前置き部分を終わらせない。
[fixture: treeview/box-common-prefix] [fixture: treeview/common-whitespace]
[fixture: treeview/ast-common-removal-only-values] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/common-title-quoted-next] [fixture: treeview/common-repeat-empty]
[fixture: treeview/box-branch-before-block-open] [fixture:
treeview/box-decoration-before-block-open] [fixture:
treeview/box-prefix-common-block-two-prefixes] [fixture:
treeview/box-trim-block-closing-brace] [fixture:
treeview/box-decoration-preamble-body]

TreeviewIdentifier は、所有する空白も含む裸の名前全体を覆う。
StringLiteral は両引用符と書かれた内部全体を覆う。
TreeviewLiteral は残る値全体を覆い、title の区切り一つ、
アクセシビリティのコロン、説明マーカー、開始波括弧の直後から始まる。
null のフィールドに葉はなく、空白だけの値にはある。
葉の範囲は内部の共通除去をまたぐが、値からは除き、ほかの綴りをすべて保持する。
[fixture: treeview/db-bare-tail-space] [fixture: treeview/space-line-nbsp]
[fixture: treeview/db-empty-names] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values] [fixture:
treeview/ast-description-removal-only] [fixture:
treeview/directive-bare-middle] [fixture: treeview/directive-double-middle]
[fixture: treeview/common-block-comments]

accDescr ブロックの TreeviewLiteral は、開きの直後から有効な閉じの直前まで、
外端の共有の除去だけを除いた原文の内部全体を覆う。
閉じ行の直前の装飾も、後続する原文の LF、CR、CRLF を保持し、
閉じを導く接頭辞も literal に残る。
loc の終わりは、その原文の境界に一致する。
RawText 項目も、共有の分断を適用する前は同じ範囲を持つ。
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

TreeviewBranchPrefix は行の最初の非空白文字から、
最初の枝と直後の横棒の連続の終わりまでを覆う。
先頭の空白と後続の区切り空白を除く。
TreeviewIgnoredText は装飾の最初から最後の非空白文字までを覆い、
外側の空白と後続 LF を除く。
すでに開いている葉の内部では接頭辞と装飾をその葉に残し、
書かれた改行と内部で除外された空白も保持する。
重なる子は作らない。 [fixture: treeview/box-written-tree] [fixture:
treeview/box-prefix-nonbmp-column] [fixture: treeview/box-prefix-arbitrary]
[fixture: treeview/box-branch-no-dash] [fixture:
treeview/box-unicode-decoration] [fixture:
treeview/ast-prefix-inside-and-outside] [fixture:
treeview/ast-decoration-internal-and-body] [fixture:
treeview/box-multiline-name-tail-trim] [fixture:
treeview/box-block-decoration]

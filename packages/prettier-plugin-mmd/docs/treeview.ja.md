# Treeview formatting rules

英語版: [treeview.md](./treeview.md)

`treeView-beta` の整形規則です。
[構文](../../spec/docs/diagrams/treeview.ja.md)と
[原文の木](../../spec/docs/ast/treeview.ja.md)が読みを定義します。
printer は共有の blocks、atoms、gaps、共通の配置と root の経路を使い、
平らな body からモードと親子の列を計画します。
parser が拒否する入力は、単独ファイルでは構文エラーを報告し、
fence では Markdown host に任せます。
[互換性](./compatibility.ja.md)も参照してください。

## Rules

### Header

`treeView-beta` を第 1 列に置き、普通の本文は次の行へ移します。
見出しを独立させ、末尾の空白、同じ行の名前や拒否される綴りは修復しません。
空の本文は空のままとし、接する directive の境界を保ちます。

[fixture: treeview/header/header-leading]

[corpus fixture: treeview/spec-tree-view-test-ts-f255ab70]

[corpus fixture: treeview/header-directive-newline-boundary]

[corpus fixture: treeview/header-nbsp-custom-boundary]

入力（escape 表記）:
`"\n  treeView-beta\nRoot"`.

出力
([header/header-leading-output.mmd](../tests/fixtures/treeview/header/header-leading-output.mmd)):

```mmd
treeView-beta
  Root
```

### Modes

字下げと罫線のモードを保ちます。
見出し後の論理 LF 行に仕様の判定を適用します。
空白だけ、コメント形、metadata 形、縦線だけの行を除き、
残る行の引用やブロックの中も含めて `─━│┃└┗├┣` を探します。
prefix ノードの有無だけでは判定しません。
罫線のモードでは根も含めてノードの物理行と列を保ち、
普通の共通文とブロックの閉じ括弧は第 1 列に置きます。
prefix 後の共通文と注釈の部品は字下げモードと同じ行内の規則に従います。
本文の段を足すと混在した字下げとして拒否されうるためです。

[corpus fixture: treeview/box-written-tree]

[corpus fixture: treeview/box-heavy]

[corpus fixture: treeview/box-quoted-dash]

[corpus fixture: treeview/box-mode-vertical-with-text]

[corpus fixture: treeview/box-metadata-inside-string-active]

[corpus fixture: treeview/box-entity-not-branch]

[corpus fixture: treeview/box-global-directive-inline]

[fixture: treeview/modes/box-common-line-shared]

[fixture: treeview/modes/box-common-block-zero-column]

[fixture: treeview/modes/box-common-block-empty]

[fixture: treeview/modes/box-common-bare-title-zero-column]

[fixture: treeview/modes/box-common-prefix-layout]

[fixture: treeview/modes/quoted-box-without-prefix]

[fixture: treeview/modes/metadata-excluded]

[fixture: treeview/modes/comment-excluded]

[fixture: treeview/modes/directive-excluded]

[fixture: treeview/modes/vertical-inactive]

[fixture: treeview/modes/block-interior-active]

[fixture: treeview/modes/prefixed-node-layout]

[fixture: treeview/modes/ordinary-block]

[fixture: treeview/modes/ordinary-empty-block]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[corpus fixture: treeview/box-title-bare-not-metadata]

[corpus fixture: treeview/box-comment-only]

[corpus fixture: treeview/box-metadata-only]

入力（escape 表記）:
`"treeView-beta\naccDescr {\nx\u2500\n}\n"`.

出力
([modes/block-interior-active-output.mmd](../tests/fixtures/treeview/modes/block-interior-active-output.mmd)):

```mmd
treeView-beta
accDescr {
x─
}
```

### Branch prefixes

prefix の原文の範囲、前置の列、区切りの空白、
軽重の綴りと dash の連なりを保ちます。
最初の正の branch 列が幅となり、無ければ 4 です。
深さは `round(column / width) + 1` で、半端の 0.5 は上へ丸めます。
列は UTF-16 単位で数え、tab は 4 space として数えます。
列や幅を変えると親子が変わるため、この形は正規化しません。
区切りの空白の後の dash は内容のままです。

[corpus fixture: treeview/box-infer-first-column]

[corpus fixture: treeview/box-round-below]

[corpus fixture: treeview/box-round-above]

[corpus fixture: treeview/box-first-width-from-name]

[corpus fixture: treeview/box-prefix-arbitrary]

[corpus fixture: treeview/box-column-nonbmp-discriminating]

[corpus fixture: treeview/box-branch-no-dash]

[corpus fixture: treeview/box-prefix-directive-column]

[fixture: treeview/branch-prefixes/first-positive]

[fixture: treeview/branch-prefixes/rounding-below]

[fixture: treeview/branch-prefixes/rounding-half]

[fixture: treeview/branch-prefixes/dash-content]

[corpus fixture: treeview/box-branch-directive-parts]

[corpus fixture: treeview/box-dash-directive-inside]

[corpus fixture: treeview/box-branch-selected-semicolon]

[corpus fixture: treeview/box-dash-selected-semicolon]

[corpus fixture: treeview/box-branch-unselected-semicolon]

[corpus fixture: treeview/box-dash-unselected-semicolon]

[corpus fixture: treeview/box-prefix-nonbmp-column]

[corpus fixture: treeview/box-branch-leading-ls]

[corpus fixture: treeview/box-branch-leading-ps]

[corpus fixture: treeview/box-branch-leading-nbsp]

[corpus fixture: treeview/box-skip-space-before-dash]

入力（escape 表記）:
`"treeView-beta\na\n \u2517\u2501\u2501 \u2500content\n"`.

出力
([branch-prefixes/dash-content-output.mmd](../tests/fixtures/treeview/branch-prefixes/dash-content-output.mmd)):

```mmd
treeView-beta
a
 ┗━━ ─content
```

### Decorations

装飾は AST の所有位置で原文の範囲から 1 回だけ印字します。
所有位置は body、名前待ちの gap、注釈の gap、block opener の gap です。
外側の列と物理行の境界を保ち、値の中の形はその値に残します。
Db が読まない装飾も罫線モードを選べるため、削除や移動はしません。

[corpus fixture: treeview/box-decoration-trailing-body]

[corpus fixture: treeview/box-decoration-pending-name-gap]

[corpus fixture: treeview/box-decoration-before-annotation]

[corpus fixture: treeview/box-decoration-before-block-open]

[corpus fixture: treeview/box-quoted-decoration]

[corpus fixture: treeview/box-block-decoration]

[corpus fixture: treeview/box-decoration-only]

[corpus fixture: treeview/box-mode-dash-only]

[fixture: treeview/decorations/body-owner]

[fixture: treeview/decorations/pending-owner]

[fixture: treeview/decorations/annotation-owner]

[fixture: treeview/decorations/opener-owner]

[fixture: treeview/decorations/value-owner]

[corpus fixture: treeview/ast-decoration-internal-and-body]

[corpus fixture: treeview/box-decoration-preamble-body]

[corpus fixture: treeview/box-decoration-annotation-gap]

[corpus fixture: treeview/box-prefix-common-block-two-prefixes]

[corpus fixture: treeview/box-unicode-decoration]

入力（escape 表記）:
`"treeView-beta\na\n\u2502\n\u2514\u2500 :::x\n"`.

出力
([decorations/annotation-owner-output.mmd](../tests/fixtures/treeview/decorations/annotation-owner-output.mmd)):

```mmd
treeView-beta
a
│
└─ :::x
```

### Indentation

字下げのモードでは AST の indent から親子を読みます。
新しいノード以上の indent を持つ開いたノードを閉じ、
file も含めて各ノードを積みます。
根は設定の 1 段、子は親より 1 段深く置きます。
space の 1 段は `max(1, tabWidth)`、useTabs は 1 tab です。
最初のノードが深い場合、後の根が浅い場合、不揃いな増分、
重複名と空名でも、Db の等しい一定幅を選びます。

[fixture: treeview/indentation/indent-irregular]

[fixture: treeview/indentation/indent-file-parent]

[fixture: treeview/indentation/indent-pop]

[fixture: treeview/indentation/indent-first-deep]

[fixture: treeview/indentation/indent-multiple-roots]

[fixture: treeview/indentation/indent-duplicate-empty]

[fixture: treeview/indentation/indent-config-four]

[fixture: treeview/indentation/indent-config-zero]

[corpus fixture: treeview/nested-child-directive-line]

[corpus fixture: treeview/nested-child-directive-unindented]

[corpus fixture: treeview/nested-child-selected-semicolon]

[corpus fixture: treeview/nested-child-comment-line]

[corpus fixture: treeview/nested-child-empty-line]

[corpus fixture: treeview/nested-child-ls]

[corpus fixture: treeview/nested-child-ps]

[corpus fixture: treeview/nested-child-empty-block]

入力（escape 表記）:
`"treeView-beta\nR\n A\n  B\n"`.

Options: `{"tabWidth":4}`.

出力
([indentation/indent-config-four-output.mmd](../tests/fixtures/treeview/indentation/indent-config-four-output.mmd)):

```mmd
treeView-beta
    R
        A
            B
```

### Carried indentation

引用名、class、icon の後や空白だけの行の run は、
AST が割り当てた indent として次のノードの予定列へ 1 回だけ移します。
元の run を重ねて残しません。
branch 行で除外された末尾は持ち越さず、
途中の装飾は普通の pending run を消しません。
hidden LF を越す親子を保つためです。

[fixture: treeview/carried-indentation/carry-quote]

[fixture: treeview/carried-indentation/carry-class]

[fixture: treeview/carried-indentation/carry-icon]

[fixture: treeview/carried-indentation/carry-space-line]

[fixture: treeview/carried-indentation/carry-tab-line]

[fixture: treeview/carried-indentation/carry-comment]

[corpus fixture: treeview/box-tail-decoration-carry]

[corpus fixture: treeview/box-tail-branch-no-carry]

[corpus fixture: treeview/box-tail-trim-directive-inline]

[corpus fixture: treeview/box-tail-trim-directive-line]

[corpus fixture: treeview/box-tail-trim-selected-semicolon]

[corpus fixture: treeview/box-tail-trim-unselected-semicolon]

[corpus fixture: treeview/box-tail-trim-comment-line]

[corpus fixture: treeview/box-tail-trim-empty-line]

[corpus fixture: treeview/box-tail-trim-ls]

[corpus fixture: treeview/box-tail-trim-ps]

[corpus fixture: treeview/box-tail-trim-empty-block]

[corpus fixture: treeview/box-tail-decoration-directive-inline]

[corpus fixture: treeview/box-tail-decoration-directive-line]

[corpus fixture: treeview/box-tail-decoration-selected-semicolon]

[corpus fixture: treeview/box-tail-decoration-unselected-semicolon]

[corpus fixture: treeview/box-tail-decoration-comment-line]

[corpus fixture: treeview/box-tail-decoration-empty-line]

[corpus fixture: treeview/box-tail-decoration-ls]

[corpus fixture: treeview/box-tail-decoration-ps]

[corpus fixture: treeview/box-tail-decoration-empty-block]

入力（escape 表記）:
`"treeView-beta\nR :::hot   \nC\n"`.

出力
([carried-indentation/carry-class-output.mmd](../tests/fixtures/treeview/carried-indentation/carry-class-output.mmd)):

```mmd
treeView-beta
  R :::hot
    C
```

### Tabs

普通の字下げでは space と tab を各 1 と数え、その構造の列だけを正規化します。
値と罫線の行の tab は保ちます。
普通の tab を tab stop へ展開すると親子が変わり、
値の tab の置き換えは原文を失うためです。

[fixture: treeview/tabs/tabs-mixed]

[fixture: treeview/tabs/tabs-output]

[fixture: treeview/tabs/tabs-equal-count]

[corpus fixture: treeview/box-tab-quoted]

[corpus fixture: treeview/box-tab-name]

[corpus fixture: treeview/box-branchless-tab-preserved]

[fixture: treeview/tabs/value-tab]

[fixture: treeview/tabs/branch-tab]

[corpus fixture: treeview/box-only-branch-content-tab]

[corpus fixture: treeview/space-indent-nbsp]

入力（escape 表記）:
`"treeView-beta\na\n\t\u2514\u2500 b\tc\n"`.

出力
([tabs/branch-tab-output.mmd](../tests/fixtures/treeview/tabs/branch-tab-output.mmd)):

```mmd
treeView-beta
a
	└─ b	c
```

### Statements one per line

普通の同じ行のノードを原順で別々の行へ分け、割り当て済みの字下げを使います。
引用同士、引用の後の裸名、icon の後のノードにも適用します。
親子を変えずに読みやすい境界を選ぶためです。
裸名の中の引用らしい文字は名前に残します。
罫線の形と semicolon の保護を優先します。

[fixture: treeview/statements-one-per-line/adjacent-quoted]

[fixture: treeview/statements-one-per-line/spaced-quoted]

[fixture: treeview/statements-one-per-line/quoted-bare]

[fixture: treeview/statements-one-per-line/icon-suffix-node]

[fixture: treeview/statements-one-per-line/bare-own-quotes]

[fixture: treeview/statements-one-per-line/class-suffix-quoted-node]

[fixture: treeview/statements-one-per-line/class-suffix-punctuation-node]

[corpus fixture: treeview/gram-inline-bare]

[corpus fixture: treeview/annotation-icon-suffix]

[corpus fixture: treeview/annotation-class-punctuation]

[corpus fixture: treeview/gram-inline-quoted]

入力（escape 表記）:
`"treeView-beta\n\"A\"\"B\"'C'\n"`.

出力
([statements-one-per-line/adjacent-quoted-output.mmd](../tests/fixtures/treeview/statements-one-per-line/adjacent-quoted-output.mmd)):

```mmd
treeView-beta
  "A"
  "B"
  'C'
```

### Annotation gaps

普通の同じ行の注釈の前は ASCII space 1 個にします。
正の前置の gap が注釈と名前の文字を区別します。
名前の中の空白は保ち、
trivia の両側は普通の gap の規則でなく接触と分離を保ちます。

[fixture: treeview/annotation-gaps/annotation-outer]

[fixture: treeview/annotation-gaps/annotation-quoted]

[fixture: treeview/annotation-gaps/annotation-bare-owned-gap]

[corpus fixture: treeview/directive-icon-parts-parts]

[corpus fixture: treeview/directive-description-start]

[corpus fixture: treeview/directive-class-value-parts]

入力（escape 表記）:
`"treeView-beta\nR   text   :::hot\n"`.

出力
([annotation-gaps/annotation-bare-owned-gap-output.mmd](../tests/fixtures/treeview/annotation-gaps/annotation-bare-owned-gap-output.mmd)):

```mmd
treeView-beta
  R   text :::hot
```

### Repeated annotations

class、icon、description は、上書きと空の代入も含めて全出現を原順に保ちます。
Db の最後の値だけでは原文を再現できません。
後の注釈を description の中へ移すと、その値も変わりえます。

[fixture: treeview/repeated-annotations/repeat-class]

[fixture: treeview/repeated-annotations/repeat-icon]

[fixture: treeview/repeated-annotations/repeat-mixed]

[fixture: treeview/repeated-annotations/repeat-desc]

[fixture: treeview/repeated-annotations/repeat-desc-empty]

[corpus fixture: treeview/annotation-description-repeat-lines]

[corpus fixture: treeview/annotation-description-repeat-empty]

[corpus fixture: treeview/db-repeat-class]

[corpus fixture: treeview/db-repeat-icon]

入力（escape 表記）:
`"treeView-beta\nR :::first :::last\n"`.

出力
([repeated-annotations/repeat-class-output.mmd](../tests/fixtures/treeview/repeated-annotations/repeat-class-output.mmd)):

```mmd
treeView-beta
  R :::first :::last
```

### Annotation lines

別の行の注釈は行の境界を保ち、字下げモードでは所属するノードの段に揃えます。
前置の空白は正の幅を残します。
description、コメントや複数行の名前を越して同じ行に寄せません。
Db が等しい合流から一貫した形を選び、description への吸収を避けるためです。
prefix と装飾は罫線の形を保ちます。

[fixture: treeview/annotation-lines/later-class-keep]

[fixture: treeview/annotation-lines/later-icon-keep]

[fixture: treeview/annotation-lines/later-description-keep]

[corpus fixture: treeview/ast-annotation-prefixes]

[corpus fixture: treeview/annotation-comment-gap]

[fixture: treeview/annotation-lines/later-class-align-to-owner]

[fixture: treeview/annotation-lines/later-class-after-multiline]

[fixture: treeview/annotation-lines/annotation-comment-gap-aligned]

[fixture: treeview/annotation-lines/after-multiline]

[fixture: treeview/annotation-lines/comment-boundary]

[corpus fixture: treeview/box-annotation-prefix]

入力（escape 表記）:
`"treeView-beta\n\"head\n tail\"\n    :::X\n"`.

出力
([annotation-lines/after-multiline-output.mmd](../tests/fixtures/treeview/annotation-lines/after-multiline-output.mmd)):

```mmd
treeView-beta
  "head
 tail"
  :::X
```

### Annotation components

普通の class の部品は `:::Name`、icon は `icon(reference)` に詰めます。
`icon()` と `icon(:file)` も同様で、名前の綴りは保ちます。
marker 後を詰めると class がまとまり、icon の内側の空白は文法にありません。
完全な部品の間の trivia は境界を保ちます。

[fixture: treeview/annotation-components/class-post-marker]

[fixture: treeview/annotation-components/class-one-char]

[fixture: treeview/annotation-components/class-hyphen-case]

[fixture: treeview/annotation-components/icon-empty]

[fixture: treeview/annotation-components/icon-leading-colon]

[corpus fixture: treeview/directive-class-value-parts]

[corpus fixture: treeview/directive-icon-parts-parts]

[fixture: treeview/annotation-components/icon-marker-directive]

[fixture: treeview/annotation-components/class-directive]

[fixture: treeview/annotation-components/icon-directive]

[corpus fixture: treeview/icon-word-open-semicolon]

[corpus fixture: treeview/icon-name-close-semicolon]

[corpus fixture: treeview/icon-name-close-directive]

入力（escape 表記）:
`"treeView-beta\nentry :::%%{wrap}%%  X\n"`.

出力
([annotation-components/class-directive-output.mmd](../tests/fixtures/treeview/annotation-components/class-directive-output.mmd)):

```mmd
treeView-beta
  entry :::%%{wrap}%% X
```

### Descriptions

`##` 後の literal は、前後の padding、空白だけの値、LS・PS、
percent の文字と注釈らしい文字を含めて丸ごと保ちます。
null は null のままです。
Db の等しい trim も原文を失い、内部の空白の変更は description を変ええます。
`##` の前の gap は Annotation gaps に従います。

[fixture: treeview/descriptions/description-padding]

[fixture: treeview/descriptions/description-empty]

[fixture: treeview/descriptions/description-space-only]

[fixture: treeview/descriptions/description-marker-text]

[corpus fixture: treeview/text-description-ls]

[corpus fixture: treeview/config-security-level-other]

[corpus fixture: treeview/text-description-ps]

[corpus fixture: treeview/tail-description-comment]

[corpus fixture: treeview/directive-description-middle]

入力（escape 表記）:
`"treeView-beta\nR ##\n"`.

出力
([descriptions/description-empty-output.mmd](../tests/fixtures/treeview/descriptions/description-empty-output.mmd)):

```mmd
treeView-beta
  R ##
```

### Names

裸名と StringLiteral の原文の範囲を丸ごと保ちます。
引用符の選択、空名、backslash、内部と末尾の空白、
HTML と entity の綴り、directory の slash を含みます。
singleQuote で引用し直しません。
Db の等しい引用変更も綴りを失い、
padding のある裸の directory を引用すると名前と種類が変わりえます。

[fixture: treeview/names/name-bare-tail]

[fixture: treeview/names/name-quote-tail]

[fixture: treeview/names/name-single]

[fixture: treeview/names/name-escape]

[fixture: treeview/names/name-empty]

[fixture: treeview/names/name-bare-internal]

[corpus fixture: treeview/html-double]

[corpus fixture: treeview/entity-double]

[corpus fixture: treeview/entity-bare]

[corpus fixture: treeview/html-bare]

[corpus fixture: treeview/db-directory-trailing-space]

入力（escape 表記）:
`"treeView-beta\nA   B\n"`.

出力
([names/name-bare-internal-output.mmd](../tests/fixtures/treeview/names/name-bare-internal-output.mmd)):

```mmd
treeView-beta
  A   B
```

### Multiline values

引用名の継続列、内部の空行、LS・PS は原文のまま保ちます。
最初のノードの行だけに予定した字下げを使います。
値に内包された prefix と装飾もその値に残します。
字下げ、合流や折り返しは名前の文字や物理行の罫線の読みを変えるためです。

[fixture: treeview/multiline-values/multiline-keep]

[fixture: treeview/multiline-values/multiline-blank]

[test: treeview/multiline-values/ls-value]

[test: treeview/multiline-values/ps-value]

[corpus fixture: treeview/box-multiline-quoted]

[corpus fixture: treeview/box-multiline-name-tail-trim]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[corpus fixture: treeview/box-trim-string-closing-quote]

入力（escape 表記）:
`"treeView-beta\n'first\n\n last'\n"`.

出力
([multiline-values/multiline-blank-output.mmd](../tests/fixtures/treeview/multiline-values/multiline-blank-output.mmd)):

```mmd
treeView-beta
  'first

 last'
```

### Title

共通文は最初のノードの前で原順に保ちます。
共有の `title value` を使い、外側の共通の空白だけを trim します。
null と空白だけの値は bare の `title` とし、内部の文字は保ちます。
次の行から値を取らず、Db の等しい一定の外側の配置を選ぶためです。
`titlex` と `title"node"` は AST の境界に従い、
summary に出ない title も残します。

[fixture: treeview/title/title-shared]

[fixture: treeview/title/title-bare]

[fixture: treeview/title/title-empty-separator]

[fixture: treeview/title/title-prefix]

[fixture: treeview/title/title-quoted-next]

[fixture: treeview/title/title-quote-owned]

[fixture: treeview/title/title-repeated]

[corpus fixture: treeview/box-common-prefix]

[fixture: treeview/title/common-order-all-four]

[fixture: treeview/title/common-bare-title-separator-tab]

[fixture: treeview/title/title-percent-boundary]

[corpus fixture: treeview/common-title-comment-gap]

[corpus fixture: treeview/common-title-directive-gap]

[corpus fixture: treeview/common-title-empty-gap]

[corpus fixture: treeview/directive-title-parts]

[corpus fixture: treeview/directive-title-space-parts]

[corpus fixture: treeview/semicolon-title-parts]

[corpus fixture: treeview/text-title-ls]

[corpus fixture: treeview/text-title-ps]

[corpus fixture: treeview/common-repeat-empty]

[corpus fixture: treeview/common-title-percent-boundary]

入力（escape 表記）:
`"treeView-beta\ntitle\t\nR\n"`.

出力
([title/common-bare-title-separator-tab-output.mmd](../tests/fixtures/treeview/title/common-bare-title-separator-tab-output.mmd)):

```mmd
treeView-beta
  title
  R
```

### Accessibility lines

共有の `accTitle: value` と `accDescr: value` を使います。
colon は keyword に付け、
trim した非空値の前は space 1 個、空なら colon までです。
内部の空白、brace らしい行値と trivia の境界を保ちます。
共通の converter が許す同等の外側の gap を選び、
Db が等しくても内部まで正規化しません。
次の行の文字を値に取りません。

[fixture: treeview/accessibility-lines/acctitle-padding]

[fixture: treeview/accessibility-lines/accdescr-padding]

[fixture: treeview/accessibility-lines/acctitle-empty]

[fixture: treeview/accessibility-lines/accdescr-empty]

[fixture: treeview/accessibility-lines/accdescr-braces]

[test: treeview/accessibility-lines/acc-unicode-edge]

[fixture: treeview/accessibility-lines/acc-next-line]

[fixture: treeview/accessibility-lines/acc-inline-percent]

[fixture: treeview/accessibility-lines/acc-title-directive-value]

[fixture: treeview/accessibility-lines/acc-empty-next-directive]

[corpus fixture: treeview/common-acctitle-comment-gap]

[corpus fixture: treeview/common-acctitle-directive-gap]

[corpus fixture: treeview/common-acctitle-empty-gap]

[corpus fixture: treeview/common-accline-comment-gap]

[corpus fixture: treeview/common-accline-directive-gap]

[corpus fixture: treeview/common-accline-empty-gap]

[corpus fixture: treeview/directive-acctitle-parts]

[corpus fixture: treeview/semicolon-acctitle-parts]

[corpus fixture: treeview/text-acctitle-ls]

[corpus fixture: treeview/text-accline-ps]

入力（escape 表記）:
`"treeView-beta\naccDescr:\n%%{init: {}}%%\nR\n"`.

出力
([accessibility-lines/acc-empty-next-directive-output.mmd](../tests/fixtures/treeview/accessibility-lines/acc-empty-next-directive-output.mmd)):

```mmd
treeView-beta
  accDescr:
%%{init: {}}%%
  R
```

### Description blocks

共有の description block の配置を使います。
空白だけの内部は `{}`、接した端は接したまま、
普通の端の padding は space 1 個です。
普通の opener の前の空白は同じ行に寄せます。
非空の継続列、内部の空行、comment と directive だけの内部を保ち、
別の行の closer は文の段に揃えます。
他の図種と同じ、Db の等しい端の配置を選ぶためです。
罫線モードの普通の block と closer は第 1 列に置きます。
所有する prefix・装飾や内包する罫線がある block は、
物理行を動かすと拒否されうるため原文の範囲を保ちます。
最初の有効な `}` が closer のままです。

[fixture: treeview/description-blocks/block-empty]

[test: treeview/description-blocks/block-unicode-empty]

[fixture: treeview/description-blocks/block-touch]

[fixture: treeview/description-blocks/block-spaced]

[fixture: treeview/description-blocks/block-left-touch]

[fixture: treeview/description-blocks/block-right-touch]

[fixture: treeview/description-blocks/block-opener-newline]

[fixture: treeview/description-blocks/block-continuation]

[fixture: treeview/description-blocks/block-directive-only]

[corpus fixture: treeview/common-block-comments]

[corpus fixture: treeview/common-block-first-close]

[corpus fixture: treeview/box-block-decoration]

[fixture: treeview/description-blocks/block-native-percent-text]

[fixture: treeview/description-blocks/opener-directive]

[fixture: treeview/description-blocks/opener-comment]

[fixture: treeview/description-blocks/comment-only]

[fixture: treeview/description-blocks/empty-inline-directive]

[corpus fixture: treeview/block-physical-comment-line]

[corpus fixture: treeview/block-physical-empty-line]

[corpus fixture: treeview/block-physical-selected-semicolon]

[corpus fixture: treeview/block-physical-ls]

[corpus fixture: treeview/block-physical-ps]

[corpus fixture: treeview/block-physical-empty-description]

[corpus fixture: treeview/common-block-whitespace-raw]

[corpus fixture: treeview/common-block-quoted-close]

[corpus fixture: treeview/common-block-escaped-close]

[corpus fixture: treeview/common-block-directives]

[corpus fixture: treeview/semicolon-block-parts]

入力（escape 表記）:
`"treeView-beta\naccDescr {\n  first\n\n    second\n}\nR\n"`.

出力
([description-blocks/block-continuation-output.mmd](../tests/fixtures/treeview/description-blocks/block-continuation-output.mmd)):

```mmd
treeView-beta
  accDescr {
  first

    second
  }
  R
```

[fixture: treeview/description-blocks/box-directive-is-not-geometry]

### Comments

普通の独立したコメントの印は第 1 列、inline のコメントは同じ行に置きます。
印、内容、末尾と所有位置を保ち、
native のコメントは LS・PS を含め LF まで読みます。
前置の有意な run は次のノードへ 1 回だけ移すため、
直前の token に接して構いません。
名前、description と block に内包された percent は値の文字のままです。
罫線 prefix のあるコメントと共通の結合領域は原文の境界を保ちます。

[fixture: treeview/comments/comment-standalone-column-one]

[fixture: treeview/comments/comment-bare-native]

[fixture: treeview/comments/comment-quoted-inline]

[fixture: treeview/comments/comment-inline-carried]

[fixture: treeview/comments/comment-native-carry]

[fixture: treeview/comments/comment-bare-is-value]

[fixture: treeview/comments/comment-description-is-value]

[corpus fixture: treeview/native-comment-ls]

[corpus fixture: treeview/comment-line-in-quotes]

[corpus fixture: treeview/box-comment-indent-carry]

[fixture: treeview/comments/comment-mark-spliced-directive]

[corpus fixture: treeview/comment-native-mark-directive]

[corpus fixture: treeview/native-comment-ps]

[corpus fixture: treeview/native-comment-closer-greedy]

[corpus fixture: treeview/comment-in-quotes]

[corpus fixture: treeview/common-title-percent-boundary]

入力（escape 表記）:
`"treeView-beta\nR %% literal\n"`.

出力
([comments/comment-bare-is-value-output.mmd](../tests/fixtures/treeview/comments/comment-bare-is-value-output.mmd)):

```mmd
treeView-beta
  R %% literal
```

[fixture: treeview/comments/box-standalone]

[fixture: treeview/comments/box-carried-padded-comment]

### Directives

directive の原文と順序を保ちます。
同じ印字行では両側の接触と分離を保ち、
単位を行に分けるときは次の単位に付け、右の境界を保ちます。
独立した directive は第 1 列です。
行頭の字下げ単位では、後ろの gap を収まるだけ残し、
超過を最後の gap から短くし、残りの字下げを最初の directive の前に置きます。
前の行の run を重ねず、割り当て済みの indent を保つためです。
複数行の内部、値の中の形と EOF の未完の directive は原文のままです。

[fixture: treeview/directives/directive-split]

[fixture: treeview/directives/directive-split-right-space]

[fixture: treeview/directives/directive-leading]

[fixture: treeview/directives/directive-leading-wide]

[fixture: treeview/directives/directive-in-value]

[fixture: treeview/directives/directive-in-bare]

[corpus fixture: treeview/nested-child-directive-line]

[corpus fixture: treeview/tail-accline-open-directive]

[corpus fixture: treeview/box-dash-directive-inside]

[fixture: treeview/directives/directive-standalone-column-one]

[fixture: treeview/directives/directive-multiline-leading]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/directive-title-middle]

[corpus fixture: treeview/directive-icon-parts-parts]

入力（escape 表記）:
`"treeView-beta\nA%%{init: {}}%%B\n"`.

出力
([directives/directive-in-bare-output.mmd](../tests/fixtures/treeview/directives/directive-in-bare-output.mmd)):

```mmd
treeView-beta
  A%%{init: {}}%%B
```

### Semicolons

すべての `;` を共有の textual prefix と行の保護で残します。
treeview に文法上の semicolon はなく、
style・classDef の語だけでは行を固定しません。
保護された最初の行は予定した本文の列、内部と後続行は原文のままです。
固定されたノードの境界が親子を制約する場合は、
終端も含め本文を原文のまま保ちます。
indent 0 の根だけの単独行では親子の退避は不要です。
別の行規則のモデルを予測せず、
共有の semicolon の選択と親子をともに保つためです。

[corpus fixture: treeview/semicolon-selected]

[corpus fixture: treeview/semicolon-description-inside]

[corpus fixture: treeview/semicolon-class-value-inside]

[corpus fixture: treeview/box-branch-selected-semicolon]

[corpus fixture: treeview/box-dash-unselected-semicolon]

[fixture: treeview/semicolons/semicolon-value-preserve]

[fixture: treeview/semicolons/semicolon-alone-preserve]

[fixture: treeview/semicolons/semicolon-quoted-next-root]

[fixture: treeview/semicolons/semicolon-word-no-trigger]

[fixture: treeview/semicolons/semicolon-selected-keep]

[fixture: treeview/semicolons/semicolon-keep-same-line-indent-plan]

[fixture: treeview/semicolons/semicolon-safe-first-baseline]

[fixture: treeview/semicolons/semicolon-style-word-only-format]

[fixture: treeview/semicolons/semicolon-row-fallback]

[fixture: treeview/semicolons/protected-row-body]

[fixture: treeview/semicolons/first-line-baseline]

[corpus fixture: treeview/tail-quoted-semicolon]

[corpus fixture: treeview/tail-acctitle-double-semicolon]

[corpus fixture: treeview/tail-acctitle-space-semicolon]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/semicolon-block-parts]

入力（escape 表記）:
`"treeView-beta\n   \"style:#z;\"\n"`.

出力
([semicolons/first-line-baseline-output.mmd](../tests/fixtures/treeview/semicolons/first-line-baseline-output.mmd)):

```mmd
treeView-beta
  "style:#z;"
```

### Blank lines

普通の ASCII 空行は項目間に最大 1 個とし、端の空行は除きます。
有意な空白だけの run は先に割り当て済みのノードへ移します。
親子を変えずに見た目の区切りを一定にするためです。
値、directive と comment region の内部と罫線の物理行の境界は保ちます。
Unicode だけの名前は普通の空行ではありません。

[fixture: treeview/blank-lines/blank-collapse]

[fixture: treeview/blank-lines/blank-between-comments]

[fixture: treeview/blank-lines/blank-space-carry]

[fixture: treeview/blank-lines/blank-quote-preserve]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/space-line-nbsp]

入力（escape 表記）:
`"treeView-beta\nR\n%% note\n\n\n C\n"`.

出力
([blank-lines/blank-between-comments-output.mmd](../tests/fixtures/treeview/blank-lines/blank-between-comments-output.mmd)):

```mmd
treeView-beta
  R
%% note

    C
```

### Trailing whitespace

所有者ごとに判断し、
裸名、description、引用内、comment と directive の末尾を保ちます。
構造の持ち越し run は 1 回だけ移し、共通の行値は共有の外側の trim に従います。
branch で除外された末尾も罫線の綴りとして保ちます。
一括した trim は値の原文や次のノードの親を変えるためです。
有意な末尾はコードブロックでなく fixture のファイルを参照してください。

[fixture: treeview/trailing-whitespace/trailing-bare-kept]

[fixture: treeview/trailing-whitespace/trailing-description-kept]

[fixture: treeview/trailing-whitespace/trailing-quoted-interior]

[fixture: treeview/trailing-whitespace/trailing-comment-kept]

[corpus fixture: treeview/box-trim-unicode-tail]

[corpus fixture: treeview/box-tail-branch-no-carry]

### Long lines

printWidth で折り返しません。
ノード、注釈、description と共通値は書かれた改行を保ちます。
新しい改行はノードや名前、description の文字を変えうるため、
幅を意味の境界にしません。

[fixture: treeview/long-lines/long-bare-kept]

[fixture: treeview/long-lines/long-annotations-kept]

入力（escape 表記）:
`"treeView-beta\nR :::long-class-name icon(long-pack:long-icon-name) ## long description with words\n"`.

Options: `{"printWidth":20}`.

出力
([long-lines/long-annotations-kept-output.mmd](../tests/fixtures/treeview/long-lines/long-annotations-kept-output.mmd)):

```mmd
treeView-beta
  R :::long-class-name icon(long-pack:long-icon-name) ## long description with words
```

### Frontmatter yaml

安全な実効 frontmatter だけを共有の guard 付き YAML formatter で整えます。
字下げされた fence、closer の padding、不正な YAML、
HTML の引用符の危険と fence を作る本文は保ちます。
入れ子と scalar は tabWidth 0 でも最低 1 space です。
普通の見出し前の trivia は root の配置に従い、
second scan の Comment と内部の Root directive は各 1 回印字します。
本文の `---` は名前のまま、拒否される保持 YAML は昇格も修復もしません。

[fixture: treeview/frontmatter-yaml/frontmatter-safe]

[fixture: treeview/frontmatter-yaml/frontmatter-zero-scalar]

[fixture: treeview/frontmatter-yaml/prefix-comment]

[fixture: treeview/frontmatter-yaml/body-yaml-is-name]

[corpus fixture: treeview/div-frontmatter-invalid]

[corpus fixture: treeview/div-html-frontmatter-value]

[corpus fixture: treeview/detect-secondscan-singleline]

[corpus fixture: treeview/bare-line-space]

[corpus fixture: treeview/detect-block-after-directive]

[fixture: treeview/frontmatter-yaml/frontmatter-indented-guard]

[fixture: treeview/frontmatter-yaml/frontmatter-closing-padding]

[fixture: treeview/frontmatter-yaml/frontmatter-html-guard]

[fixture: treeview/frontmatter-yaml/frontmatter-delimiter-guard]

入力（escape 表記）:
`"treeView-beta\n---\nkey: value\n---\n"`.

出力
([frontmatter-yaml/body-yaml-is-name-output.mmd](../tests/fixtures/treeview/frontmatter-yaml/body-yaml-is-name-output.mmd)):

```mmd
treeView-beta
  ---
  key: value
  ---
```

### Line terminators and unicode

共有の host の EOL 処理を使います。
CR と CRLF は LF として printer に届き、
引用、block と directive の中も出力は endOfLine に従います。
LS・PS は値と native comment の文字として保ち、
Unicode の空白は ASCII の字下げへ変えません。
先頭の BOM は host が除去・復元し、共有の frontmatter の制限に従います。

[test: treeview/line-terminators-and-unicode/eol-cr-structure]

[test: treeview/line-terminators-and-unicode/eol-crlf-quote]

[test: treeview/line-terminators-and-unicode/eol-output-crlf]

[test: treeview/line-terminators-and-unicode/unicode-not-indent]

[corpus fixture: treeview/line-crlf]

[corpus fixture: treeview/native-comment-ps]

[test: treeview/line-terminators-and-unicode/eol-block-and-directive]

[corpus fixture: treeview/text-double-crlf]

[corpus fixture: treeview/text-single-ls]

[corpus fixture: treeview/text-double-ps]

[corpus fixture: treeview/text-block-ls]

[test: treeview/line-terminators-and-unicode/eol-output-cr]

### Source order

重複名と空名、上書き注釈、空の共通文、描かれない title、
prefix の綴りと装飾も含めて全出現と原順を保ちます。
正規化した Db は構文の一部を落とすため原文を再構成できません。
並べ替え、重複除去や空の代入の削除は読みも変ええます。

[fixture: treeview/source-order/source-duplicate]

[fixture: treeview/source-order/source-unused-title]

[fixture: treeview/source-order/source-empty-common]

入力（escape 表記）:
`"treeView-beta\nR\n X\n X\nR\n"`.

出力
([source-order/source-duplicate-output.mmd](../tests/fixtures/treeview/source-order/source-duplicate-output.mmd)):

```mmd
treeView-beta
  R
    X
    X
  R
```

### Final newline

普通の受理入力は、空本文、ノード、共通文、閉じた block と comment を含め、
設定の改行 1 個で終えます。
値の末尾は保ち、
EOF の未完 directive と保護・原文保持の終端は共有の例外に従います。
拒否される未使用の字下げ run を trim して受理させません。

[fixture: treeview/final-newline/eof-node]

[fixture: treeview/final-newline/eof-comment]

[fixture: treeview/final-newline/eof-block]

[fixture: treeview/final-newline/eof-bare-tail]

[fixture: treeview/final-newline/eof-extra-blanks]

[corpus fixture: treeview/tail-quoted-open-directive]

[fixture: treeview/final-newline/eof-native-comment-space]

[corpus fixture: treeview/header-only]

[corpus fixture: treeview/common-title-eof]

[corpus fixture: treeview/gram-quoted-tail-space-next-indent]

入力（escape 表記）:
`"treeView-beta\naccDescr {}"`.

出力
([final-newline/eof-block-output.mmd](../tests/fixtures/treeview/final-newline/eof-block-output.mmd)):

```mmd
treeView-beta
  accDescr {}
```

### Specified readings

既存の六つの差異を使います。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、
bare-percent-line-before-header、c4-keyword-anywhere です。
空の引用名と `icon()` は受理される構文です。
拒否される文法を修復せず、記録があれば仕様の Db で比較します。
raw の拒否に raw の Db はなく、treeview 固有の opaque の受理設定はありません。

[corpus fixture: treeview/directive-header-inside]

[corpus fixture: treeview/semicolon-class-inside]

[corpus fixture: treeview/div-html-frontmatter-accept]

[corpus fixture: treeview/div-html-frontmatter-reject]

[corpus fixture: treeview/div-frontmatter-invalid]

[corpus fixture: treeview/bare-line-nbsp]

[corpus fixture: treeview/c4-container-bare]

[corpus fixture: treeview/box-mixed-reject]

[corpus fixture: treeview/box-empty-branch-after-decoration]

[corpus fixture: treeview/gram-invalid-icon]

### Markdown fences

dedent 後の本文へ同じ規則を適用し、
fence、list と quote の列は Markdown host に任せます。
値の継続列へ host の列を足しません。
host の出力と冪等性は本文の Db とは別に検査します。
host は最後のコード行の padding を落としうるため、
原文の byte 保持に制限があります。
引用内の padding は引用内に残します。
拒否される fence は host の経路に戻り、その経路も原文の padding を落としえます。

[test: treeview Markdown: top-level]

[test: treeview Markdown: list]

[test: treeview Markdown: quote]

[test: treeview Markdown: zero]

[test: treeview Markdown: tabs]

[test: treeview Markdown: carried-indent]

[test: treeview Markdown: box]

[test: treeview Markdown: description]

[test: treeview Markdown: frontmatter]

[test: treeview Markdown: final-bare-padding]

[test: treeview Markdown: quoted-interior]

[test: treeview Markdown: rejected]

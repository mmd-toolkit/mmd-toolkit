# Treeview formatting rules

英語版: [treeview.md](./treeview.md)

`treeView-beta` の整形規則です。
[構文](../../spec/docs/diagrams/treeview.ja.md)と [原文の木](../../spec/docs/ast/treeview.ja.md)が読みを定義します。
printer は共有の blocks、atoms、gaps、共通の配置と root の経路を使い、
入れ子の木から親子の列を計画し、原文からモードを読みます。
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

出力 ([header/header-leading-output.mmd](../tests/fixtures/treeview/header/header-leading-output.mmd)):

```mmd
treeView-beta
  Root
```

### Modes

字下げと罫線のモードを保ちます。
モードは見出し後の論理 LF 行で判定し、値の内部も調べます。
空白だけ、コメント形、metadata 形、縦線だけの行を除きます。
prefix の有無だけでは判定しません。
罫線モードの普通の外側の構造は AST の森から描き直し、
字下げモードの入力を罫線の図へは変えません。
Branch prefixes の本文保持の条件によって、モードと値内の罫線の読みを保ちます。
共通文の prefix は外し、普通の共通文は第 1 列に置き、子のように見せません。

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

出力 ([modes/block-interior-active-output.mmd](../tests/fixtures/treeview/modes/block-interior-active-output.mmd)):

```mmd
treeView-beta
accDescr {
x─
}
```

[fixture: treeview/modes/box-redraw-indent-kept-mode]

[fixture: treeview/branch-prefixes/rounding-half]

[fixture: treeview/branch-prefixes/box-redraw-redraw-ancestor-guide]

[fixture: treeview/branch-prefixes/box-redraw-deep-jump]

[fixture: treeview/branch-prefixes/box-redraw-file-parent]

[fixture: treeview/branch-prefixes/box-redraw-multi-root-redraw]

[fixture: treeview/branch-prefixes/box-redraw-flat-forest-branches]

[fixture: treeview/branch-prefixes/box-redraw-mixed-root-redraw-all-branches]

[fixture: treeview/branch-prefixes/box-redraw-explicit-multiple-roots]

[corpus fixture: treeview/box-decoration-only]

[fixture:
treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

[fixture: treeview/decorations/value-owner]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[fixture: treeview/multiline-values/box-redraw-value-prefix-width-preserved]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture: treeview/multiline-values/box-redraw-value-entity-width]

[fixture: treeview/decorations/box-redraw-sole-selector-after-empty-block]

[fixture:
treeview/annotation-lines/box-redraw-joining-would-expose-value-branch]

[fixture: treeview/annotation-lines/box-redraw-joining-would-drop-mode]

[corpus fixture: treeview/box-common-prefix]

[corpus fixture: treeview/box-prefix-common-block-two-prefixes]

[fixture: treeview/description-blocks/box-redraw-remove-opener-prefixes]

[fixture:
treeview/description-blocks/box-redraw-opener-prefix-with-directive-gap]

[fixture: treeview/description-blocks/box-redraw-opener-prefix-with-comment-gap]

[fixture: treeview/description-blocks/box-redraw-common-prefix-tab-kept]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-common]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-opener]

### Branch prefixes

親子は AST の children から読み、 file も親として扱い、
原文の深さの飛びを詰めます。
次の兄弟があるノードは `├── `、最後の兄弟は `└── ` で描きます。
次の兄弟がある祖先の段は `│   `、それ以外は 4 spaces です。
共通文、注釈、コメントと装飾は兄弟に数えません。
根に prefix が無い図は、根と第 1 世代の枝を第 1 列、孫の枝を列 4 に置きます。
どれかの根に元の prefix があれば、混在する根もすべて第 1 列の枝に揃えます。
この forest の形で親子と罫線モードを保ちます。
細い罫線、dash 2 個、固定の 4 列の部品を選びます。
元の深さや兄弟の印、太さの混在を残さず、読む木を一貫して描くためです。

[fixture: treeview/statements-one-per-line/review159-box-quoted-two]

[fixture: treeview/statements-one-per-line/review159-box-quoted-three]

[fixture: treeview/statements-one-per-line/review159-box-quoted-wide-gap]

[fixture: treeview/statements-one-per-line/review159-box-quoted-class]

[fixture: treeview/statements-one-per-line/review159-box-quoted-forest]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unbranched-root]

[fixture: treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-box-quoted-directive-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unselected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-protected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-comment-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-line]

[test: treeview/statements-one-per-line/review159-box-quoted-ls]

[test: treeview/statements-one-per-line/review159-box-quoted-unprefixed-leading-ps]

[test: treeview/statements-one-per-line/review159-box-quoted-ps]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-block]

[test: treeview/tabs/review159-box-multiple-value-tab-retained]

[test: treeview/trailing-whitespace/review159-box-multiple-owned-tail-retained]

[fixture: treeview/branch-prefixes/box-redraw-nested-guides]

[fixture: treeview/branch-prefixes/box-redraw-nested-uneven-columns]

[fixture: treeview/branch-prefixes/box-redraw-nested-mixed-weights]

描く前に、本文を保つかを一度に判断します。
外側の prefix と区切りが任意文字、directive、選ばれる semicolon、 comment
region と交わる図や、装飾の行が共有の trivia と交わる図は本文を保ちます。
固定された原文の行の境界、安全に寄せられない注釈、モードの喪失、
値内の prefix の有効な indent の変化も本文保持の理由です。
枝の追加や除去で値の tab や末尾の読みが変わる図も本文を保ちます。
罫線モードの論理行を分けることで、
名前の先頭の Unicode 空白が新しい枝なしの行に露出する場合も本文を保ちます。
条件は同じ図で重ねて適用します。
一つの保護行の最初の正の branch 列が、ほかの全行の幅を決めうるためです。
本文を保った図には見た目の一致を約束しません。
名前、値、prefix の任意文字と共有の trivia は捨てません。

[test: treeview/annotation-lines/box-redraw-comment-region-prefix-ls]

[test: treeview/annotation-lines/box-redraw-comment-region-prefix-ps]

[test: treeview/branch-prefixes/box-redraw-comment-region-in-prefix-ps]

[test: treeview/decorations/box-redraw-decoration-comment-region-ps]

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
`"treeView-beta\na\n    ├─ b\n  └─ c\n"`.

出力 ([branch-prefixes/rounding-half-output.mmd](../tests/fixtures/treeview/branch-prefixes/rounding-half-output.mmd)):

```mmd
treeView-beta
a
├── b
└── c
```

[fixture: treeview/branch-prefixes/rounding-half]

[fixture: treeview/branch-prefixes/box-redraw-redraw-ancestor-guide]

[fixture: treeview/branch-prefixes/box-redraw-deep-jump]

[fixture: treeview/branch-prefixes/box-redraw-file-parent]

[fixture: treeview/branch-prefixes/box-redraw-multi-root-redraw]

[fixture: treeview/branch-prefixes/box-redraw-flat-forest-branches]

[fixture: treeview/branch-prefixes/box-redraw-heavy-to-light]

[fixture: treeview/branch-prefixes/box-redraw-one-dash-to-two]

[corpus fixture: treeview/box-first-branch-leading-text]

[fixture: treeview/branch-prefixes/box-redraw-opening-quote-in-prefix]

[corpus fixture: treeview/box-description-branch]

[fixture: treeview/branch-prefixes/box-redraw-directive-in-prefix-keep]

[fixture: treeview/branch-prefixes/box-redraw-selected-semicolon-keep]

[fixture: treeview/branch-prefixes/box-redraw-non-init-directive-keep]

[test: treeview/branch-prefixes/box-redraw-comment-region-in-prefix]

[fixture: treeview/branch-prefixes/box-redraw-multiline-directive-in-prefix]

[fixture: treeview/branch-prefixes/box-redraw-mixed-root-redraw-all-branches]

[fixture: treeview/branch-prefixes/box-redraw-explicit-multiple-roots]

[fixture: treeview/branch-prefixes/box-redraw-branch-no-dashes]

[fixture: treeview/branch-prefixes/box-redraw-unselected-semicolon-content]

[fixture: treeview/branch-prefixes/box-redraw-mixed-roots]

[fixture: treeview/branch-prefixes/box-redraw-siblings-after-subtree]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture: treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-name]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-common]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-opener]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-annotation]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-child]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-sibling]

[corpus fixture: treeview/box-common-prefix]

[corpus fixture: treeview/box-prefix-common-block-two-prefixes]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-class]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-icon]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-description]

[fixture: treeview/annotation-lines/box-redraw-join-overwritten-in-order]

[fixture: treeview/description-blocks/box-redraw-remove-opener-prefixes]

[fixture: treeview/comments/box-redraw-move-comment-prefix-once]

[fixture: treeview/decorations/box-redraw-decorations-guides]

[fixture: treeview/carried-indentation/box-redraw-carry-class-in-box]

[fixture: treeview/carried-indentation/box-redraw-carry-icon-in-box]

[fixture:
treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

[fixture: treeview/decorations/value-owner]

[fixture: treeview/annotation-lines/box-redraw-joining-would-drop-mode]

[fixture: treeview/tabs/box-redraw-tab-prefix]

[test: treeview/tabs/box-redraw-use-tabs-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-tabs-fixed4]

[test: treeview/tabs/box-redraw-combined-zero-tabs]

[fixture: treeview/decorations/box-redraw-decoration-directive-preserved]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture: treeview/annotation-lines/box-redraw-keep-description-and-semicolon]

[fixture: treeview/semicolons/box-redraw-arbitrary-prefix-on-protected-line]

[test: treeview/decorations/box-redraw-decoration-comment-region]

[test: treeview/multiline-values/box-redraw-quote-value-ls-keep]

[test: treeview/multiline-values/box-redraw-quote-value-ps-keep]

[fixture: treeview/tabs/box-redraw-description-tail-as-value]

[fixture: treeview/multiline-values/box-redraw-value-prefix-width-preserved]

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[fixture: treeview/multiline-values/box-redraw-value-entity-width]

[fixture: treeview/annotation-lines/box-redraw-keep-after-description]

[fixture: treeview/annotation-lines/box-redraw-keep-comment-between]

[fixture: treeview/annotation-lines/box-redraw-keep-inline-directive-between]

[fixture: treeview/annotation-lines/box-redraw-keep-directive-line-between]

[fixture: treeview/annotation-lines/box-redraw-keep-selected-semicolon-between]

[fixture:
treeview/annotation-lines/box-redraw-joining-would-expose-value-branch]

[fixture: treeview/description-blocks/box-redraw-common-prefix-tab-kept]

[fixture: treeview/semicolons/protected-row-body]

[fixture: treeview/decorations/opener-owner]

[fixture: treeview/semicolons/box-redraw-protected-line-and-enclosed-prefix]

[fixture:
treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[fixture: treeview/tabs/box-redraw-joined-description-value-tab-kept]

### Decorations

普通の外側の装飾は、次のノードへ続く木の案内線として 1 回描き直します。
続く木が無ければ空行にし、Blank lines と Final newline に従って整理します。
body、名前待ち、注釈、opener の gap の各所有位置で適用します。
移した空行は、後続の gap の最初の trivia の前も含めて、
空行が最大 1 個になる共有の配置へまとめます。
枝付き注釈を同じ行へ寄せたときは、その装飾をノードの行の後、
続く木の前に残します。
古い縦線、太い線や dash だけの形を、読む木の続きに置き換えるためです。
罫線モードの選択に必要な装飾は保ちます。
それが `accDescr` の opener 前の唯一の選び手なら、
装飾を含む gap 全体だけを保ち、block の残りと本文は普通に整形します。
関係の無い title の空白や空行を固定せずにモードを保つためです。
値に所有された装飾の範囲は保ちます。
装飾の行に共有の trivia があれば、削除せず本文を保ちます。

[fixture: treeview/decorations/review159-sole-opener-selector-line-rule-semicolon]

[fixture: treeview/decorations/review159-sole-opener-selector]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-block]

[fixture: treeview/decorations/review159-sole-opener-selector-inline-directive]

[fixture: treeview/decorations/review159-sole-opener-selector-directive-line]

[fixture: treeview/decorations/review159-sole-opener-selector-comment]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-line]

[test: treeview/decorations/review159-sole-opener-selector-ls]

[test: treeview/decorations/review159-sole-opener-selector-ps]

[fixture: treeview/decorations/review159-sole-opener-selector-value-prefix]

[test: treeview/decorations/box-redraw-decoration-comment-region-ps]

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

出力 ([decorations/annotation-owner-output.mmd](../tests/fixtures/treeview/decorations/annotation-owner-output.mmd)):

```mmd
treeView-beta
a
│
└─ :::x
```

[fixture: treeview/decorations/box-redraw-decorations-guides]

[fixture: treeview/decorations/box-redraw-decoration-directive-preserved]

[fixture: treeview/decorations/box-redraw-decoration-end]

[corpus fixture: treeview/box-decoration-only]

[fixture: treeview/decorations/value-owner]

[test: treeview/decorations/box-redraw-decoration-comment-region]

[fixture: treeview/decorations/box-redraw-sole-selector-after-empty-block]

[fixture: treeview/decorations/box-redraw-decoration-directive-line]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-child]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-sibling]

[fixture: treeview/description-blocks/box-redraw-remove-opener-prefixes]

[corpus fixture: treeview/box-tail-decoration-directive-line]

[corpus fixture: treeview/box-tail-decoration-selected-semicolon]

[corpus fixture: treeview/box-tail-decoration-comment-line]

[corpus fixture: treeview/box-tail-decoration-empty-line]

[corpus fixture: treeview/box-tail-decoration-ls]

[corpus fixture: treeview/box-tail-decoration-ps]

[corpus fixture: treeview/box-tail-decoration-empty-block]

[corpus fixture: treeview/box-tail-branch-no-carry]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[fixture: treeview/decorations/box-redraw-annotation-blank-repeat]

[fixture: treeview/decorations/box-redraw-annotation-blank-and-gap]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

[fixture:
treeview/decorations/box-redraw-annotation-blank-before-directive-line]

[fixture:
treeview/decorations/box-redraw-annotation-blank-after-inline-directive]

[fixture: treeview/decorations/box-redraw-annotation-blank-at-eof]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

[test: treeview/decorations/box-redraw-annotation-blank-ls]

[test: treeview/decorations/box-redraw-annotation-blank-ps]

### Indentation

字下げのモードでは AST の children から親子を読み、file も親として扱います。
根は設定の 1 段、子は親より 1 段深く置きます。
space の 1 段は `max(1, tabWidth)`、useTabs は 1 tab です。
最初のノードが深い場合、後の根が浅い場合、不揃いな増分、重複名と空名でも、
Db の等しい一定幅を選びます。

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

出力 ([indentation/indent-config-four-output.mmd](../tests/fixtures/treeview/indentation/indent-config-four-output.mmd)):

```mmd
treeView-beta
    R
        A
            B
```

### Carried indentation

引用名、class、icon の後や空白だけの行の run は、
割り当て済みの indent を反映した AST の親子に従い、
次のノードの予定位置へ 1 回だけ移します。
コメント、directive、空行や装飾を越す場合も同じです。
罫線モードでは枝の位置に反映して元の gap の run を消し、
字下げモードでは設定の段を使います。
語彙の読みで除外された branch 行の末尾は持ち越しません。
字下げの run を重ねず親子を保つためです。
固定された境界や値の境界は Branch prefixes に従います。

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

出力 ([carried-indentation/carry-class-output.mmd](../tests/fixtures/treeview/carried-indentation/carry-class-output.mmd)):

```mmd
treeView-beta
  R :::hot
    C
```

[fixture: treeview/carried-indentation/box-redraw-comment-empty-gap]

[fixture: treeview/carried-indentation/box-redraw-directive-gap]

[corpus fixture: treeview/box-tail-decoration-carry]

[corpus fixture: treeview/box-tail-branch-no-carry]

[fixture: treeview/carried-indentation/box-redraw-blank-space-carry]

[fixture: treeview/carried-indentation/box-redraw-carried-run-move-once]

[fixture: treeview/carried-indentation/box-redraw-carry-class-in-box]

[fixture: treeview/carried-indentation/box-redraw-carry-icon-in-box]

[fixture: treeview/comments/box-redraw-move-comment-prefix-once]

[fixture: treeview/modes/box-redraw-indent-kept-mode]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[fixture: treeview/tabs/box-redraw-branch-excluded-tail-trim]

[fixture: treeview/tabs/box-redraw-description-tail-as-value]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[fixture: treeview/annotation-lines/box-redraw-keep-description-and-semicolon]

[fixture: treeview/semicolons/box-redraw-protected-line-and-enclosed-prefix]

[fixture:
treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

[fixture: treeview/semicolons/box-redraw-arbitrary-prefix-on-protected-line]

### Tabs

普通の字下げは space と tab を各 1 と数え、設定の正の段を使います。
罫線の構造は useTabs と tabWidth によらず、常に 4 列の space の部品で描きます。
幅 0 でも同じです。
値の tab は原文のまま保ち、元から branch がある行の tab の読みを変えません。
枝の無かった値の行への枝の追加や、共通文や注釈の prefix の除去で、
tab や末尾の空白の読みが変わる図は本文を保ちます。
構造の描画と値の綴りを分けるためです。

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

出力 ([tabs/branch-tab-output.mmd](../tests/fixtures/treeview/tabs/branch-tab-output.mmd)):

```mmd
treeView-beta
a
└── b	c
```

[fixture: treeview/tabs/box-redraw-description-tail-as-value]

[fixture: treeview/tabs/box-redraw-tab-prefix]

[corpus fixture: treeview/box-tab-quoted]

[test: treeview/tabs/box-redraw-use-tabs-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-tabs-fixed4]

[fixture: treeview/tabs/box-redraw-branch-excluded-tail-trim]

[test: treeview/tabs/box-redraw-combined-zero-tabs]

[fixture: treeview/modes/box-redraw-indent-kept-mode]

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[fixture: treeview/description-blocks/box-redraw-common-prefix-tab-kept]

[fixture: treeview/tabs/box-redraw-joined-description-value-tab-kept]

[fixture: treeview/tabs/box-redraw-joined-description-directive-tab]

### Statements one per line

どちらのモードでも普通のノードは原順で行を分け、
AST の children から親子を読みます。
罫線モードでは、同じ物理行の複数の引用ノードもその森から枝を描き直します。
誤解を招く同じ行の配置を保たず、見た目の親子を読みと一致させるためです。
裸名の中の引用らしい文字は名前に残します。
固定された原文の行の境界や、値の tab、末尾、
新しく露出する先頭の Unicode 空白が安全な行分けを妨げる図は、 Branch
prefixes に従って本文を保ちます。

[fixture: treeview/statements-one-per-line/review159-box-quoted-line-rule-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-two]

[fixture: treeview/statements-one-per-line/review159-box-quoted-three]

[fixture: treeview/statements-one-per-line/review159-box-quoted-wide-gap]

[fixture: treeview/statements-one-per-line/review159-box-quoted-class]

[fixture: treeview/statements-one-per-line/review159-box-quoted-forest]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unbranched-root]

[fixture: treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-box-quoted-directive-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unselected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-protected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-comment-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-line]

[test: treeview/statements-one-per-line/review159-box-quoted-ls]

[test: treeview/statements-one-per-line/review159-box-quoted-ps]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-block]

[test: treeview/tabs/review159-box-multiple-value-tab-retained]

[test: treeview/trailing-whitespace/review159-box-multiple-owned-tail-retained]

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

罫線モードで同じ行のノードを分けるとき、間の directive は、
次のノードの行の直前に、directive だけの行として第 1 列に置きます。
次のノードが裸名や枝のない根の場合も、3 つ以上のノードを分ける各箇所も同じです。
directive を枝の外に置き、見た目のずれを防いで、
後の整形でも木を描き直せるようにします。

[fixture: treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-split-directive-quoted-bare]

[fixture: treeview/statements-one-per-line/review159-split-directive-bare-quoted]

[fixture: treeview/statements-one-per-line/review159-split-directive-three-nodes]

[fixture: treeview/statements-one-per-line/review159-split-directive-deep]

[fixture: treeview/statements-one-per-line/review159-split-directive-redraw-again]

[test: treeview split directives remain redrawable]

入力（escape 表記）:
`"treeView-beta\nroot\n├── \"a\" %%{x}%% \"b\"\n└── c\n"`.

出力 ([statements-one-per-line/review159-box-quoted-inline-directive-output.mmd](../tests/fixtures/treeview/statements-one-per-line/review159-box-quoted-inline-directive-output.mmd)):

```mmd
treeView-beta
root
├── "a"
%%{x}%%
└── "b"
    └── c
```

複数の directive は原順を保ちます。
並びの両側の空白の有無によらず同じ配置にし、
directive の内部の改行は内部に残します。
この行分けで作る directive だけの行では、
directive 間の space と tab を消します。
残すと directive を除いた後に空白だけの行が残り、mermaid.js が拒否するためです。

[fixture: treeview/statements-one-per-line/review159-split-directives-touching]

[fixture: treeview/statements-one-per-line/review159-split-directives-spaced]

[fixture: treeview/statements-one-per-line/review159-split-directives-three]

[test: treeview/statements-one-per-line/review159-split-directives-tab]

[fixture: treeview/statements-one-per-line/review159-split-directive-touching]

[fixture: treeview/statements-one-per-line/review159-split-directive-left-space]

[fixture: treeview/statements-one-per-line/review159-split-directive-right-space]

[fixture: treeview/statements-one-per-line/review159-split-directive-multiline]

既にある directive だけの行、コメント行と空行は、
分けた箇所の gap の配置を保ちます。
共通の前置の文に空の説明ブロックがあっても、
この directive の配置は変わりません。

[fixture: treeview/statements-one-per-line/review159-split-directive-own-line]

[fixture: treeview/statements-one-per-line/review159-split-directive-comment-line]

[fixture: treeview/statements-one-per-line/review159-split-directives-comment-line]

[fixture: treeview/statements-one-per-line/review159-split-directive-empty-line]

[fixture: treeview/statements-one-per-line/review159-split-directives-empty-line]

[fixture: treeview/statements-one-per-line/review159-split-directive-empty-block]

[fixture: treeview/statements-one-per-line/review159-split-directives-empty-block]

選ばれる、または選ばれない semicolon と、
安全に分けられない LS・PS で始まる値には、既存の本文保持の条件を適用します。
値が持つコメント領域はその値に保ち、
その前でノードの間から移す directive は独立した行に置きます。
字下げモードでは、前置の directive をノードとともに置く既存の配置を保ちます。

[fixture: treeview/statements-one-per-line/review159-split-directive-selected-semicolon]

[fixture: treeview/statements-one-per-line/review159-split-directives-selected-semicolon]

[fixture: treeview/statements-one-per-line/review159-split-directive-unselected-semicolon]

[fixture: treeview/statements-one-per-line/review159-split-directives-unselected-semicolon]

[test: treeview/statements-one-per-line/review159-split-directive-ls]

[test: treeview/statements-one-per-line/review159-split-directives-ls]

[test: treeview/statements-one-per-line/review159-split-directive-ps]

[test: treeview/statements-one-per-line/review159-split-directives-ps]

[test: treeview/statements-one-per-line/review159-split-directive-region-ls]

[test: treeview/statements-one-per-line/review159-split-directives-region-ls]

[test: treeview/statements-one-per-line/review159-split-directive-region-ps]

[test: treeview/statements-one-per-line/review159-split-directives-region-ps]

[fixture: treeview/statements-one-per-line/review159-split-directive-indent-control]

入力（escape 表記）:
`"treeView-beta\n\"A\"\"B\"'C'\n"`.

出力 ([statements-one-per-line/adjacent-quoted-output.mmd](../tests/fixtures/treeview/statements-one-per-line/adjacent-quoted-output.mmd)):

```mmd
treeView-beta
  "A"
  "B"
  'C'
```

[fixture: treeview/branch-prefixes/rounding-half]

[fixture: treeview/branch-prefixes/box-redraw-multi-root-redraw]

[fixture: treeview/branch-prefixes/box-redraw-flat-forest-branches]

[corpus fixture: treeview/box-tail-collision-unselected-semicolon]

[fixture: treeview/semicolons/protected-row-body]

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

出力 ([annotation-gaps/annotation-bare-owned-gap-output.mmd](../tests/fixtures/treeview/annotation-gaps/annotation-bare-owned-gap-output.mmd)):

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

出力 ([repeated-annotations/repeat-class-output.mmd](../tests/fixtures/treeview/repeated-annotations/repeat-class-output.mmd)):

```mmd
treeView-beta
  R :::first :::last
```

### Annotation lines

字下げモードの別行の注釈は、その行を保ち、
正の前置空白を残して所有ノードに揃えます。
罫線モードの枝付き注釈は、所有ノードの行へ、原順で space 1 個を挟んで寄せます。
ただし、前に description が無く、間にコメント、directive、
選ばれる semicolon や comment region が無い場合だけです。
寄せることで値の枝が露出する、値の tab の読みが変わる、モードが失われる場合も、
本文を保ちます。
comment region や除かれた directive の後の物理行から始まる注釈は、
前置の spaces を所有ノードの名前の列に揃え、最低 1 space を残します。
物理 LF が論理行から消えても、class、icon、
description の印を名前の続きではなく注釈として読むために、正の幅が必要です。
罫線の図で、実際に別の論理行にある字下げだけの注釈は拒否されます。
偽の子の枝を無くすためです。
枝を縦の案内線に置き換えると、縦線が別ノードになります。
class、icon と description の反復はすべて残します。

[test: treeview/annotation-lines/review159-region-line-rule-semicolon]

[test: treeview/annotation-lines/review159-region-class-ls-four]

[test: treeview/annotation-lines/review159-region-class-ps-four]

[test: treeview/annotation-lines/review159-region-class-ls-one]

[test: treeview/annotation-lines/review159-region-class-ps-one]

[test: treeview/annotation-lines/review159-region-class-ls-tab]

[test: treeview/annotation-lines/review159-region-class-ps-tab]

[test: treeview/annotation-lines/review159-region-icon-ls-four]

[test: treeview/annotation-lines/review159-region-icon-ps-four]

[test: treeview/annotation-lines/review159-region-icon-ls-one]

[test: treeview/annotation-lines/review159-region-icon-ps-one]

[test: treeview/annotation-lines/review159-region-icon-ls-tab]

[test: treeview/annotation-lines/review159-region-icon-ps-tab]

[test: treeview/annotation-lines/review159-region-description-ls-four]

[test: treeview/annotation-lines/review159-region-description-ps-four]

[test: treeview/annotation-lines/review159-region-description-ls-one]

[test: treeview/annotation-lines/review159-region-description-ps-one]

[test: treeview/annotation-lines/review159-region-description-ls-tab]

[test: treeview/annotation-lines/review159-region-description-ps-tab]

[test: treeview/annotation-lines/review159-region-unbranched-root-class-ls]

[test: treeview/annotation-lines/review159-region-unbranched-root-icon-ps]

[test: treeview/annotation-lines/review159-region-unbranched-root-description-ls]

[test: treeview/annotation-lines/review159-region-forest-class-ps]

[test: treeview/annotation-lines/review159-region-forest-icon-ls]

[test: treeview/annotation-lines/review159-region-forest-description-ps]

[test: treeview/annotation-lines/review159-region-unprefixed-quoted-ls]

[test: treeview/annotation-lines/review159-region-quoted-class-ls]

[test: treeview/annotation-lines/review159-region-quoted-icon-ps]

[test: treeview/annotation-lines/review159-region-quoted-description-ls]

[test: treeview/annotation-lines/review159-region-repeated-classes-ps]

[test: treeview/annotation-lines/review159-region-directive-inline]

[test: treeview/annotation-lines/review159-region-protected-semicolon]

[test: treeview/annotation-lines/review159-region-unselected-semicolon]

[test: treeview/annotation-lines/review159-region-empty-block]

[test: treeview/annotation-lines/review159-region-value-prefix-and-protected-row]

[test: treeview/annotation-lines/box-redraw-comment-region-prefix-ls]

[test: treeview/annotation-lines/box-redraw-comment-region-prefix-ps]

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

出力 ([annotation-lines/after-multiline-output.mmd](../tests/fixtures/treeview/annotation-lines/after-multiline-output.mmd)):

```mmd
treeView-beta
  "head
 tail"
  :::X
```

[fixture: treeview/annotation-lines/box-redraw-repeat-prefixed-annotations-kept]

[fixture: treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

[corpus fixture: treeview/box-annotation-prefix]

[corpus fixture: treeview/box-comment-indent-carry]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-class]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-icon]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-description]

[fixture: treeview/annotation-lines/box-redraw-join-overwritten-in-order]

[fixture: treeview/annotation-lines/box-redraw-keep-after-description]

[fixture: treeview/annotation-lines/box-redraw-keep-description-and-semicolon]

[fixture: treeview/annotation-lines/box-redraw-keep-comment-between]

[fixture: treeview/annotation-lines/box-redraw-keep-inline-directive-between]

[fixture: treeview/annotation-lines/box-redraw-keep-directive-line-between]

[fixture: treeview/annotation-lines/box-redraw-keep-selected-semicolon-between]

[test: treeview/annotation-lines/box-redraw-join-description-ls]

[test: treeview/annotation-lines/box-redraw-join-description-ps]

[fixture: treeview/annotation-lines/box-redraw-joining-would-expose-value-branch]

[fixture: treeview/annotation-lines/box-redraw-joining-would-drop-mode]

[fixture: treeview/annotation-lines/box-redraw-annotation-decoration-before-child]

[fixture: treeview/annotation-lines/box-redraw-annotation-decoration-before-sibling]

[corpus fixture: treeview/box-decoration-annotation-gap]

[fixture: treeview/annotation-lines/box-redraw-vertical-is-a-node]

[fixture: treeview/decorations/box-redraw-annotation-blank-repeat]

[fixture: treeview/decorations/box-redraw-annotation-blank-and-gap]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

[fixture:
treeview/decorations/box-redraw-annotation-blank-before-directive-line]

[fixture:
treeview/decorations/box-redraw-annotation-blank-after-inline-directive]

[fixture: treeview/decorations/box-redraw-annotation-blank-at-eof]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

[test: treeview/decorations/box-redraw-annotation-blank-ls]

[test: treeview/decorations/box-redraw-annotation-blank-ps]

[fixture: treeview/tabs/box-redraw-joined-description-directive-tab]

[fixture: treeview/tabs/box-redraw-joined-description-value-tab-kept]

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

出力 ([annotation-components/class-directive-output.mmd](../tests/fixtures/treeview/annotation-components/class-directive-output.mmd)):

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

出力 ([descriptions/description-empty-output.mmd](../tests/fixtures/treeview/descriptions/description-empty-output.mmd)):

```mmd
treeView-beta
  R ##
```

### Names

裸名と StringLiteral の原文の範囲を丸ごと保ちます。
引用符の選択、空名、backslash、内部と末尾の空白、 HTML と entity の綴り、
directory の slash を含みます。
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

出力 ([names/name-bare-internal-output.mmd](../tests/fixtures/treeview/names/name-bare-internal-output.mmd)):

```mmd
treeView-beta
  A   B
```

### Multiline values

引用名の継続列、内部の空行、LS・PS と内包する罫線の綴りを保ちます。
ノードの最初の行だけに予定した描画を加えます。
新しい外側の枝と、保った値内の prefix を原順に見て、
最初の正の branch 列を求めます。
値内の `4 * (round(column / width) + 1)` が変わる図は本文を保ちます。
原文の範囲だけでは外側の幅の変化を防げないため、値の読みも確認します。

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

出力 ([multiline-values/multiline-blank-output.mmd](../tests/fixtures/treeview/multiline-values/multiline-blank-output.mmd)):

```mmd
treeView-beta
  'first

 last'
```

[test: treeview/multiline-values/box-redraw-quote-value-ls-keep]

[test: treeview/multiline-values/box-redraw-quote-value-ps-keep]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[fixture: treeview/multiline-values/box-redraw-value-prefix-width-preserved]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture: treeview/multiline-values/box-redraw-value-entity-width]

[fixture: treeview/semicolons/box-redraw-protected-line-and-enclosed-prefix]

[fixture: treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

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

出力 ([title/common-bare-title-separator-tab-output.mmd](../tests/fixtures/treeview/title/common-bare-title-separator-tab-output.mmd)):

```mmd
treeView-beta
  title
  R
```

### Accessibility lines

共有の `accTitle: value` と `accDescr: value` を使います。
colon は keyword に付け、 trim した非空値の前は space 1 個、
空なら colon までです。
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

出力 ([accessibility-lines/acc-empty-next-directive-output.mmd](../tests/fixtures/treeview/accessibility-lines/acc-empty-next-directive-output.mmd)):

```mmd
treeView-beta
  accDescr:
%%{init: {}}%%
  R
```

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[corpus fixture: treeview/box-common-prefix]

[corpus fixture: treeview/box-prefix-common-block-two-prefixes]

### Description blocks

普通の block は共有の description layout を通します。
空白だけの内部は `{}`、接した端は接したまま、普通の端の padding は space
1 個です。
普通の opener の前の空白は寄せ、非空の継続列と trivia だけの内部は保ちます。
別行の closer は文の段に揃えます。
罫線モードでは keyword と opener の普通の prefix を外し、
共通文を第 1 列に置きます。
値内の罫線がある場合は、
物理行を動かすと読みが変わるため brace の範囲を丸ごと保ちます。
最初の有効な `}` が closer のままです。
共通値の tab など、安全に外せない形は Branch prefixes の本文保持に従います。
opener の gap の唯一のモードの選び手は、
Decorations に従って gap だけを保ちます。

[fixture: treeview/decorations/review159-sole-opener-selector]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-block]

[fixture: treeview/decorations/review159-sole-opener-selector-inline-directive]

[fixture: treeview/decorations/review159-sole-opener-selector-directive-line]

[fixture: treeview/decorations/review159-sole-opener-selector-comment]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-line]

[test: treeview/decorations/review159-sole-opener-selector-ls]

[test: treeview/decorations/review159-sole-opener-selector-ps]

[fixture: treeview/decorations/review159-sole-opener-selector-value-prefix]

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

出力 ([description-blocks/block-continuation-output.mmd](../tests/fixtures/treeview/description-blocks/block-continuation-output.mmd)):

```mmd
treeView-beta
  accDescr {
  first

    second
  }
  R
```

[fixture: treeview/description-blocks/box-directive-is-not-geometry]

[fixture: treeview/description-blocks/box-redraw-remove-opener-prefixes]

[fixture: treeview/description-blocks/box-redraw-opener-prefix-with-directive-gap]

[fixture: treeview/description-blocks/box-redraw-opener-prefix-with-comment-gap]

[fixture: treeview/description-blocks/box-redraw-common-prefix-tab-kept]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[fixture: treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

[corpus fixture: treeview/box-common-prefix]

[corpus fixture: treeview/box-prefix-common-block-two-prefixes]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-opener]

[fixture: treeview/decorations/opener-owner]

### Comments

普通の独立コメントの印は第 1 列、inline のコメントは同じ行に置きます。
印、内容、末尾と native comment の LS・PS を保ちます。
有意な字下げ run は割り当て済みのノードへ 1 回だけ移します。
描き直せる罫線の図では、native comment の構造の prefix を外し、
その枝をノードの名前の行へ 1 回だけ描きます。
コメントは木の子として扱いません。
名前、description と block の percent は値に残し、
共通の結合領域や危険な prefix の交差は本文保持に従います。

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

出力 ([comments/comment-bare-is-value-output.mmd](../tests/fixtures/treeview/comments/comment-bare-is-value-output.mmd)):

```mmd
treeView-beta
  R %% literal
```

[fixture: treeview/comments/box-standalone]

[fixture: treeview/comments/box-carried-padded-comment]

[fixture: treeview/comments/box-redraw-move-comment-prefix-once]

[corpus fixture: treeview/box-comment-indent-carry]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[fixture: treeview/carried-indentation/box-redraw-comment-empty-gap]

[fixture: treeview/carried-indentation/box-redraw-directive-gap]

[fixture: treeview/carried-indentation/box-redraw-blank-space-carry]

[fixture: treeview/carried-indentation/box-redraw-carried-run-move-once]

[fixture: treeview/carried-indentation/box-redraw-carry-class-in-box]

[fixture: treeview/carried-indentation/box-redraw-carry-icon-in-box]

[test: treeview/branch-prefixes/box-redraw-comment-region-in-prefix]

[test: treeview/decorations/box-redraw-decoration-comment-region]

[fixture: treeview/annotation-lines/box-redraw-keep-comment-between]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

### Directives

directive の原文と順序を保ちます。
同じ印字行では両側の接触と分離を保ちます。
ただし、
[Statements one per line](#statements-one-per-line) に従って新しく作る directive だけの行へ移す directive の間は例外です。
単位を行に分けるときは次の単位に付け、右の境界を保ちます。
独立した directive は第 1 列です。
行頭の字下げ単位では、後ろの gap を収まるだけ残し、超過を最後の gap から短くし、
残りの字下げを最初の directive の前に置きます。
前の行の run を重ねず、割り当て済みの indent を保つためです。
複数行の内部、値の中の形と EOF の未完の directive は原文のままです。

[fixture: treeview/directives/review159-box-tail-directive-gap]

[fixture: treeview/directives/review159-box-tail-directive-repeat]

[fixture: treeview/directives/review159-box-tail-quoted]

[fixture: treeview/directives/review159-box-tail-class]

[fixture: treeview/directives/review159-box-tail-icon]

[fixture: treeview/directives/review159-box-tail-joined-class]

[test: treeview/directives/review159-box-tail-joined-icon]

[fixture: treeview/directives/review159-box-tail-joined-description]

[fixture: treeview/directives/review159-box-tail-common]

[fixture: treeview/directives/review159-box-tail-forest]

[fixture: treeview/directives/review159-box-tail-comment]

[fixture: treeview/directives/review159-box-tail-decoration]

[fixture: treeview/directives/review159-box-tail-empty-line]

[fixture: treeview/directives/review159-box-tail-child]

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

出力 ([directives/directive-in-bare-output.mmd](../tests/fixtures/treeview/directives/directive-in-bare-output.mmd)):

```mmd
treeView-beta
  A%%{init: {}}%%B
```

### Semicolons

すべての semicolon を共有の textual prefix と行の保護で残します。
treeview に文法上の semicolon はなく、
style・classDef の語だけでは行を固定しません。
保護された内容の外側の安全な罫線は描き直し、内部と値の列は原文のまま保ちます。
保護行の境界が親子を制約する場合や、Branch prefixes のほかの条件に当たる場合は、
本文をまとめて保ちます。
同じ行や同じ図の値内の prefix の保持とも重ねて適用します。
semicolon を捨てたり、危険な本文を部分的に描き直したりする許可ではありません。

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

出力 ([semicolons/first-line-baseline-output.mmd](../tests/fixtures/treeview/semicolons/first-line-baseline-output.mmd)):

```mmd
treeView-beta
  "style:#z;"
```

[fixture: treeview/semicolons/box-redraw-protected-line-and-enclosed-prefix]

[fixture: treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

[fixture: treeview/semicolons/box-redraw-arbitrary-prefix-on-protected-line]

[fixture: treeview/branch-prefixes/box-redraw-selected-semicolon-keep]

[fixture: treeview/branch-prefixes/box-redraw-unselected-semicolon-content]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture: treeview/annotation-lines/box-redraw-keep-description-and-semicolon]

[fixture: treeview/annotation-lines/box-redraw-keep-selected-semicolon-between]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[corpus fixture: treeview/box-tail-collision-unselected-semicolon]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

### Blank lines

有意な字下げ run を移し、外側の装飾を置き換えてから、
普通の ASCII 空行を項目間に最大 1 個とし、端の空行を除きます。
親子を保ちながら区切りを一定にするためです。
値、directive と comment region の内部は保ち、
Unicode だけの名前を空行扱いしません。
本文を保つ図は原文の境界を保ちます。

[fixture: treeview/blank-lines/blank-collapse]

[fixture: treeview/blank-lines/blank-between-comments]

[fixture: treeview/blank-lines/blank-space-carry]

[fixture: treeview/blank-lines/blank-quote-preserve]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/space-line-nbsp]

入力（escape 表記）:
`"treeView-beta\nR\n%% note\n\n\n C\n"`.

出力 ([blank-lines/blank-between-comments-output.mmd](../tests/fixtures/treeview/blank-lines/blank-between-comments-output.mmd)):

```mmd
treeView-beta
  R
%% note

    C
```

[fixture: treeview/decorations/box-redraw-decorations-guides]

[fixture: treeview/decorations/box-redraw-decoration-directive-preserved]

[fixture: treeview/decorations/box-redraw-decoration-end]

[corpus fixture: treeview/box-decoration-only]

[fixture: treeview/decorations/value-owner]

[fixture: treeview/carried-indentation/box-redraw-comment-empty-gap]

[fixture: treeview/carried-indentation/box-redraw-directive-gap]

[corpus fixture: treeview/box-tail-decoration-carry]

[corpus fixture: treeview/box-tail-branch-no-carry]

[fixture: treeview/carried-indentation/box-redraw-blank-space-carry]

[fixture: treeview/carried-indentation/box-redraw-carried-run-move-once]

[fixture: treeview/decorations/box-redraw-decoration-directive-line]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-child]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-sibling]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[fixture: treeview/comments/box-redraw-move-comment-prefix-once]

[fixture: treeview/carried-indentation/box-redraw-carry-class-in-box]

[fixture: treeview/carried-indentation/box-redraw-carry-icon-in-box]

[test: treeview/branch-prefixes/box-redraw-comment-region-in-prefix]

[fixture: treeview/branch-prefixes/box-redraw-multiline-directive-in-prefix]

[test: treeview/multiline-values/box-redraw-quote-value-ls-keep]

[test: treeview/multiline-values/box-redraw-quote-value-ps-keep]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[test: treeview/decorations/box-redraw-decoration-comment-region]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[fixture: treeview/annotation-lines/box-redraw-keep-after-description]

[fixture: treeview/annotation-lines/box-redraw-keep-comment-between]

[fixture: treeview/decorations/box-redraw-annotation-blank-repeat]

[fixture: treeview/decorations/box-redraw-annotation-blank-and-gap]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

[fixture:
treeview/decorations/box-redraw-annotation-blank-before-directive-line]

[fixture:
treeview/decorations/box-redraw-annotation-blank-after-inline-directive]

[fixture: treeview/decorations/box-redraw-annotation-blank-at-eof]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

[test: treeview/decorations/box-redraw-annotation-blank-ls]

[test: treeview/decorations/box-redraw-annotation-blank-ps]

[fixture: treeview/tabs/box-redraw-joined-description-directive-tab]

### Trailing whitespace

所有者ごとに判断し、裸名、description、引用内、
comment と directive の末尾は値として保ちます。
構造の持ち越し run は 1 回だけ移し、共通の行値は共有の外側の trim に従います。
branch 行で値から除外された末尾は削り、持ち越しません。
枝の追加で値の末尾が新たに trim される図は本文を保ちます。
値と構造の padding を混同しないためです。
有意な fixture の末尾はコードブロックには示しません。

[fixture: treeview/trailing-whitespace/trailing-bare-kept]

[fixture: treeview/trailing-whitespace/trailing-description-kept]

[fixture: treeview/trailing-whitespace/trailing-quoted-interior]

[fixture: treeview/trailing-whitespace/trailing-comment-kept]

[corpus fixture: treeview/box-trim-unicode-tail]

[corpus fixture: treeview/box-tail-branch-no-carry]

[fixture: treeview/tabs/box-redraw-description-tail-as-value]

[fixture: treeview/tabs/box-redraw-tab-prefix]

[corpus fixture: treeview/box-tab-quoted]

[test: treeview/tabs/box-redraw-use-tabs-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-tabs-fixed4]

[fixture: treeview/tabs/box-redraw-branch-excluded-tail-trim]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[fixture: treeview/description-blocks/box-redraw-common-prefix-tab-kept]

[fixture: treeview/carried-indentation/box-redraw-comment-empty-gap]

[fixture: treeview/carried-indentation/box-redraw-directive-gap]

[fixture: treeview/carried-indentation/box-redraw-blank-space-carry]

[fixture: treeview/carried-indentation/box-redraw-carried-run-move-once]

[fixture: treeview/comments/box-redraw-move-comment-prefix-once]

[fixture: treeview/carried-indentation/box-redraw-carry-class-in-box]

[fixture: treeview/carried-indentation/box-redraw-carry-icon-in-box]

[corpus fixture: treeview/box-tail-decoration-directive-line]

[corpus fixture: treeview/box-tail-decoration-selected-semicolon]

[corpus fixture: treeview/box-tail-decoration-comment-line]

[corpus fixture: treeview/box-tail-decoration-empty-line]

[corpus fixture: treeview/box-tail-decoration-ls]

[corpus fixture: treeview/box-tail-decoration-ps]

[corpus fixture: treeview/box-tail-decoration-empty-block]

[corpus fixture: treeview/box-common-prefix]

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

出力 ([long-lines/long-annotations-kept-output.mmd](../tests/fixtures/treeview/long-lines/long-annotations-kept-output.mmd)):

```mmd
treeView-beta
  R :::long-class-name icon(long-pack:long-icon-name) ## long description with words
```

### Frontmatter yaml

安全な実効 frontmatter だけを共有の guard 付き YAML formatter で整えます。
字下げされた fence、closer の padding、不正な YAML、
HTML の引用符の危険と fence を作る本文は保ちます。
入れ子と scalar は tabWidth 0 でも最低 1 space です。
普通の見出し前の trivia は root の配置に従い、 second
scan の Comment と内部の Root directive は各 1 回印字します。
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

出力 ([frontmatter-yaml/body-yaml-is-name-output.mmd](../tests/fixtures/treeview/frontmatter-yaml/body-yaml-is-name-output.mmd)):

```mmd
treeView-beta
  ---
  key: value
  ---
```

### Line terminators and unicode

共有の host の EOL 処理を使います。
CR と CRLF は LF として printer に届き、引用、
block と directive の中も出力は endOfLine に従います。
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

ノード、名前、注釈、共通の代入と共有の trivia は、重複、
空値と上書きも含めて全出現を原順に保ちます。
上の規則で許された構造の罫線と、
条件を満たす枝付き注釈および装飾だけを置き換えます。
prefix の任意文字と値内の罫線の綴りは保ち、Db から原文を作り直しません。
構造の太さ、dash の数、兄弟の印と普通の外側の装飾は、
読む森を示すために選び直します。

[fixture: treeview/source-order/source-duplicate]

[fixture: treeview/source-order/source-unused-title]

[fixture: treeview/source-order/source-empty-common]

入力（escape 表記）:
`"treeView-beta\nR\n X\n X\nR\n"`.

出力 ([source-order/source-duplicate-output.mmd](../tests/fixtures/treeview/source-order/source-duplicate-output.mmd)):

```mmd
treeView-beta
  R
    X
    X
  R
```

[fixture: treeview/branch-prefixes/rounding-half]

[fixture: treeview/branch-prefixes/box-redraw-redraw-ancestor-guide]

[fixture: treeview/branch-prefixes/box-redraw-deep-jump]

[fixture: treeview/branch-prefixes/box-redraw-file-parent]

[fixture: treeview/branch-prefixes/box-redraw-multi-root-redraw]

[fixture: treeview/branch-prefixes/box-redraw-flat-forest-branches]

[fixture: treeview/branch-prefixes/box-redraw-heavy-to-light]

[fixture: treeview/branch-prefixes/box-redraw-one-dash-to-two]

[corpus fixture: treeview/box-first-branch-leading-text]

[fixture: treeview/branch-prefixes/box-redraw-opening-quote-in-prefix]

[corpus fixture: treeview/box-description-branch]

[fixture: treeview/branch-prefixes/box-redraw-directive-in-prefix-keep]

[fixture: treeview/branch-prefixes/box-redraw-selected-semicolon-keep]

[fixture: treeview/branch-prefixes/box-redraw-non-init-directive-keep]

[test: treeview/branch-prefixes/box-redraw-comment-region-in-prefix]

[fixture: treeview/branch-prefixes/box-redraw-multiline-directive-in-prefix]

[fixture: treeview/branch-prefixes/box-redraw-mixed-root-redraw-all-branches]

[fixture: treeview/branch-prefixes/box-redraw-explicit-multiple-roots]

[fixture: treeview/branch-prefixes/box-redraw-branch-no-dashes]

[fixture: treeview/branch-prefixes/box-redraw-unselected-semicolon-content]

[test: treeview/multiline-values/box-redraw-quote-value-ls-keep]

[test: treeview/multiline-values/box-redraw-quote-value-ps-keep]

[fixture: treeview/annotation-lines/box-redraw-repeat-prefixed-annotations-kept]

[fixture: treeview/decorations/box-redraw-decorations-guides]

[fixture: treeview/decorations/box-redraw-decoration-directive-preserved]

[fixture: treeview/decorations/box-redraw-decoration-end]

[corpus fixture: treeview/box-decoration-only]

[fixture: treeview/multiline-values/box-redraw-value-quote-keep]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[fixture: treeview/multiline-values/box-redraw-value-prefix-width-preserved]

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[fixture: treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

[fixture: treeview/decorations/value-owner]

[corpus fixture: treeview/box-annotation-prefix]

[corpus fixture: treeview/box-common-prefix]

[corpus fixture: treeview/box-prefix-common-block-two-prefixes]

[corpus fixture: treeview/box-comment-indent-carry]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-class]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-icon]

[fixture: treeview/annotation-lines/box-redraw-join-prefixed-description]

[fixture: treeview/annotation-lines/box-redraw-join-overwritten-in-order]

[fixture: treeview/annotation-lines/box-redraw-keep-after-description]

[fixture: treeview/annotation-lines/box-redraw-keep-comment-between]

[fixture: treeview/annotation-lines/box-redraw-keep-inline-directive-between]

[fixture: treeview/annotation-lines/box-redraw-keep-directive-line-between]

[fixture: treeview/annotation-lines/box-redraw-keep-selected-semicolon-between]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-child]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-sibling]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture: treeview/multiline-values/box-redraw-value-width-changes]

[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]

[fixture: treeview/multiline-values/box-redraw-value-entity-width]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[fixture: treeview/semicolons/box-redraw-protected-line-and-enclosed-prefix]

[fixture:
treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

[fixture: treeview/semicolons/box-redraw-arbitrary-prefix-on-protected-line]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

[fixture: treeview/tabs/box-redraw-tab-prefix]

[test: treeview/tabs/box-redraw-use-tabs-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-fixed4]

[test: treeview/tabs/box-redraw-tabwidth-zero-tabs-fixed4]

[fixture: treeview/branch-prefixes/box-redraw-siblings-after-subtree]

[test: treeview/tabs/box-redraw-combined-zero-tabs]

[fixture: treeview/decorations/box-redraw-annotation-blank-repeat]

[fixture: treeview/decorations/box-redraw-annotation-blank-and-gap]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

[fixture:
treeview/decorations/box-redraw-annotation-blank-before-directive-line]

[fixture:
treeview/decorations/box-redraw-annotation-blank-after-inline-directive]

[fixture: treeview/decorations/box-redraw-annotation-blank-at-eof]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

[test: treeview/decorations/box-redraw-annotation-blank-ls]

[test: treeview/decorations/box-redraw-annotation-blank-ps]

[fixture: treeview/tabs/box-redraw-joined-description-value-tab-kept]

[fixture: treeview/tabs/box-redraw-joined-description-directive-tab]

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

出力 ([final-newline/eof-block-output.mmd](../tests/fixtures/treeview/final-newline/eof-block-output.mmd)):

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

dedent 後の本文へ同じ規則を適用し、 fence、list と quote の列は Markdown
host に任せます。
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

# Treeview formatting rules

Japanese version: [treeview.ja.md](./treeview.ja.md)

How prettier-plugin-mmd formats `treeView-beta`. The
[syntax](../../spec/docs/diagrams/treeview.md) and
[source tree](../../spec/docs/ast/treeview.md) define its reading. The printer
uses shared blocks, atoms, gaps, common layouts and root handling; the nested
tree supplies the forest column plan, and the source supplies the mode. Inputs
the parser rejects are reported as syntax errors in standalone files and left to
the Markdown host in fences. See [compatibility](./compatibility.md).

## Rules

### Header

Put `treeView-beta` at column one and ordinary body items on following lines.
This gives the header its own line without repairing trailing header padding,
inline names or rejected spellings. Empty bodies stay empty; attached directives
retain their boundary.

[fixture: treeview/header/header-leading]

[corpus fixture: treeview/spec-tree-view-test-ts-f255ab70]

[corpus fixture: treeview/header-directive-newline-boundary]

[corpus fixture: treeview/header-nbsp-custom-boundary]

Input (escaped): `"\n  treeView-beta\nRoot"`.

Output
([header/header-leading-output.mmd](../tests/fixtures/treeview/header/header-leading-output.mmd)):

```mmd
treeView-beta
  Root
```

### Modes

Keep the original indentation or box-drawing mode. The mode test still examines
logical LF lines after the header, including value interiors, excluding
whitespace-only, comment-shaped, metadata-shaped and vertical-only lines. Prefix
presence alone is insufficient. In box mode redraw ordinary outer structure from
the AST forest; do not convert indentation-mode input into a box diagram.
Preserve the mode and the reading of enclosed box forms, using the
body-retention conditions in Branch prefixes. Common statement prefixes are
removed and ordinary common statements use column one, so they do not appear as
children.

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

Input (escaped): `"treeView-beta\naccDescr {\nx\u2500\n}\n"`.

Output
([modes/block-interior-active-output.mmd](../tests/fixtures/treeview/modes/block-interior-active-output.mmd)):

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

Read parents from AST children, including file parents, and compress authored
depth jumps. Draw `├── ` for a node with a following sibling and `└── ` for the
last sibling. Each ancestor with a later sibling contributes `│   `; other
ancestor cells are four spaces. Common statements, annotations, comments and
decorations do not count as siblings. With no prefixed root, roots and
first-generation branches start at column one, and grandchildren branch at
zero-based column four. If any root originally has a prefix, give every root a
branch at column one, including mixed roots. This forest form preserves
parentage and box mode. Use light box characters, two dashes and fixed
four-column cells: they describe the read tree consistently rather than
retaining misleading authored depth, sibling marks or mixed weights.

[fixture: treeview/statements-one-per-line/review159-box-quoted-two]

[fixture: treeview/statements-one-per-line/review159-box-quoted-three]

[fixture: treeview/statements-one-per-line/review159-box-quoted-wide-gap]

[fixture: treeview/statements-one-per-line/review159-box-quoted-class]

[fixture: treeview/statements-one-per-line/review159-box-quoted-forest]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unbranched-root]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-box-quoted-directive-line]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-unselected-semicolon]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-protected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-comment-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-line]

[test: treeview/statements-one-per-line/review159-box-quoted-ls]

[test:
treeview/statements-one-per-line/review159-box-quoted-unprefixed-leading-ps]

[test: treeview/statements-one-per-line/review159-box-quoted-ps]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-block]

[test: treeview/tabs/review159-box-multiple-value-tab-retained]

[test: treeview/trailing-whitespace/review159-box-multiple-owned-tail-retained]

[fixture: treeview/branch-prefixes/box-redraw-nested-guides]

[fixture: treeview/branch-prefixes/box-redraw-nested-uneven-columns]

[fixture: treeview/branch-prefixes/box-redraw-nested-mixed-weights]

Choose body retention once before drawing. Keep the complete body as written if
an outer prefix or its separator crosses arbitrary text, a directive, selected
semicolon or comment region, or a decoration line crosses shared trivia. Also
retain it for fixed source row boundaries, unsafe annotation moves, loss of box
mode, changed effective indentation of a prefix inside a value, or a newly
added/removed branch changing owned value tabs or tails. Splitting a box-mode
logical line also retains the body when it would expose leading Unicode
whitespace in a name on a new unprefixed line. These conditions compose; one
protected row can determine the first positive branch column for every other
row. Body-retained diagrams are exempt from visual agreement. Names, values,
arbitrary prefix text and shared trivia are never discarded.

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

Input (escaped): `"treeView-beta\na\n    ├─ b\n  └─ c\n"`.

Output
([branch-prefixes/rounding-half-output.mmd](../tests/fixtures/treeview/branch-prefixes/rounding-half-output.mmd)):

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

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

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

Redraw each ordinary outer decoration once as the guide continuing toward the
next node, or as a blank line when no tree continues there. Apply this at body,
pending-name, annotation and opener-gap owners; moved blanks join the following
gap's single-blank placement, including before its first trivia item, and edge
blanks follow Final newline. When a prefixed annotation moves inline, its
decorations remain after the joined node line, before the continuing tree. This
replaces stale verticals, heavy lines and dash-only shapes with the tree's
continuation. Keep a decoration needed to select box mode, including its
complete gap before an `accDescr` opener when it is the only selector there;
format the rest of the block and body normally. Keeping that gap preserves mode
without freezing unrelated title spacing or blank lines. Keep value-owned
decoration spans unchanged. Shared trivia on a decoration line invokes body
retention rather than deletion.

[fixture:
treeview/decorations/review159-sole-opener-selector-line-rule-semicolon]

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

Input (escaped): `"treeView-beta\na\n\u2502\n\u2514\u2500 :::x\n"`.

Output
([decorations/annotation-owner-output.mmd](../tests/fixtures/treeview/decorations/annotation-owner-output.mmd)):

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

In indentation mode read the forest from AST children, including file parents.
Print roots at one configured step and children one step beyond their parent. A
space step is `max(1, tabWidth)`; useTabs uses one tab. This selects a uniform
Db-equivalent width even for a deep first node, later shallower roots, irregular
increments, duplicate names and empty names.

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

Input (escaped): `"treeView-beta\nR\n A\n  B\n"`.

Options: `{"tabWidth":4}`.

Output
([indentation/indent-config-four-output.mmd](../tests/fixtures/treeview/indentation/indent-config-four-output.mmd)):

```mmd
treeView-beta
    R
        A
            B
```

### Carried indentation

Use the AST hierarchy, which already accounts for assigned indentation, to move
a run after a quote, class, icon or whitespace-only line once to the next node's
planned position, across comments, directives, blank lines and decoration. In
box mode it becomes a branch position, while the old gap run disappears;
indentation mode still uses its configured step. Branch-line tails already
excluded by the lexical reading do not carry. This preserves parentage without
adding a second indentation run. Fixed or value-owned source boundaries follow
Branch prefixes.

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

Input (escaped): `"treeView-beta\nR :::hot   \nC\n"`.

Output
([carried-indentation/carry-class-output.mmd](../tests/fixtures/treeview/carried-indentation/carry-class-output.mmd)):

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

Ordinary indentation still counts each space or tab once and uses its configured
positive step. Box structure instead always uses four-column space cells,
independently of useTabs and tabWidth, including zero. Keep tabs in authored
values. Existing branch lines retain their tab-expansion reading; adding a
branch to a previously branchless value line or removing a common or annotation
prefix can change tab or trailing-whitespace reading and therefore retains the
body. This separates structural drawing from authored value spelling.

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

Input (escaped): `"treeView-beta\na\n\t\u2514\u2500 b\tc\n"`.

Output
([tabs/branch-tab-output.mmd](../tests/fixtures/treeview/tabs/branch-tab-output.mmd)):

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

Split ordinary nodes into separate lines in source order in both modes, using
AST children to read their parents. In box mode redraw their branches from that
forest, including several quoted nodes on one physical line; this makes the
visible parentage match the reading rather than preserving a misleading shared
row. Quote-looking text inside a bare name stays name text. Retain the body when
shared source row boundaries or changed value tabs, tails or newly exposed
leading Unicode whitespace prevent safe splitting, as described in Branch
prefixes.

[fixture:
treeview/statements-one-per-line/review159-box-quoted-line-rule-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-two]

[fixture: treeview/statements-one-per-line/review159-box-quoted-three]

[fixture: treeview/statements-one-per-line/review159-box-quoted-wide-gap]

[fixture: treeview/statements-one-per-line/review159-box-quoted-class]

[fixture: treeview/statements-one-per-line/review159-box-quoted-forest]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unbranched-root]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-box-quoted-directive-line]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-unselected-semicolon]

[fixture:
treeview/statements-one-per-line/review159-box-quoted-protected-semicolon]

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

In box mode, move directives between nodes that split onto separate lines to a
directive-only line at column one, immediately before the next node. This also
applies when the next node is a bare name or an unbranched root, and at each
split of three or more nodes. Keeping directives outside branches prevents a
visible shift and keeps later passes free to redraw the tree.

[fixture:
treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture:
treeview/statements-one-per-line/review159-split-directive-quoted-bare]

[fixture:
treeview/statements-one-per-line/review159-split-directive-bare-quoted]

[fixture:
treeview/statements-one-per-line/review159-split-directive-three-nodes]

[fixture: treeview/statements-one-per-line/review159-split-directive-deep]

[fixture:
treeview/statements-one-per-line/review159-split-directive-redraw-again]

[test: treeview split directives remain redrawable]

Input (escaped): `"treeView-beta\nroot\n├── \"a\" %%{x}%% \"b\"\n└── c\n"`.

Output
([statements-one-per-line/review159-box-quoted-inline-directive-output.mmd](../tests/fixtures/treeview/statements-one-per-line/review159-box-quoted-inline-directive-output.mmd)):

```mmd
treeView-beta
root
├── "a"
%%{x}%%
└── "b"
    └── c
```

Preserve the directive order for a run of multiple directives. The same
placement applies with or without spaces on either side of the run; breaks
inside a directive stay inside that directive. On a directive-only line created
by such a split, remove spaces and tabs between directives: keeping them would
leave a whitespace-only line after directive removal, which mermaid.js rejects.

[fixture: treeview/statements-one-per-line/review159-split-directives-touching]

[fixture: treeview/statements-one-per-line/review159-split-directives-spaced]

[fixture: treeview/statements-one-per-line/review159-split-directives-three]

[test: treeview/statements-one-per-line/review159-split-directives-tab]

[fixture: treeview/statements-one-per-line/review159-split-directive-touching]

[fixture: treeview/statements-one-per-line/review159-split-directive-left-space]

[fixture:
treeview/statements-one-per-line/review159-split-directive-right-space]

[fixture: treeview/statements-one-per-line/review159-split-directive-multiline]

Existing directive-only lines, comment lines and blank lines retain their gap
placement around the split. An empty description block in the common preamble
does not change this directive placement.

[fixture: treeview/statements-one-per-line/review159-split-directive-own-line]

[fixture:
treeview/statements-one-per-line/review159-split-directive-comment-line]

[fixture:
treeview/statements-one-per-line/review159-split-directives-comment-line]

[fixture: treeview/statements-one-per-line/review159-split-directive-empty-line]

[fixture:
treeview/statements-one-per-line/review159-split-directives-empty-line]

[fixture:
treeview/statements-one-per-line/review159-split-directive-empty-block]

[fixture:
treeview/statements-one-per-line/review159-split-directives-empty-block]

Keep the existing body-retention conditions for selected or unselected
semicolons and unsafe LS/PS-leading values. Comment regions held inside a value
stay in that value while an intervening directive before it takes the separate
line. In indentation mode keep the existing placement of a leading directive
with its node.

[fixture:
treeview/statements-one-per-line/review159-split-directive-selected-semicolon]

[fixture:
treeview/statements-one-per-line/review159-split-directives-selected-semicolon]

[fixture:
treeview/statements-one-per-line/review159-split-directive-unselected-semicolon]

[fixture:
treeview/statements-one-per-line/review159-split-directives-unselected-semicolon]

[test: treeview/statements-one-per-line/review159-split-directive-ls]

[test: treeview/statements-one-per-line/review159-split-directives-ls]

[test: treeview/statements-one-per-line/review159-split-directive-ps]

[test: treeview/statements-one-per-line/review159-split-directives-ps]

[test: treeview/statements-one-per-line/review159-split-directive-region-ls]

[test: treeview/statements-one-per-line/review159-split-directives-region-ls]

[test: treeview/statements-one-per-line/review159-split-directive-region-ps]

[test: treeview/statements-one-per-line/review159-split-directives-region-ps]

[fixture:
treeview/statements-one-per-line/review159-split-directive-indent-control]

Input (escaped): `"treeView-beta\n\"A\"\"B\"'C'\n"`.

Output
([statements-one-per-line/adjacent-quoted-output.mmd](../tests/fixtures/treeview/statements-one-per-line/adjacent-quoted-output.mmd)):

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

Use one ASCII space before an ordinary same-line annotation. Its required
positive leading gap distinguishes an annotation from name text. Keep authored
internal name whitespace, and preserve contact or separation on each side of
trivia instead of applying the plain-gap rule there.

[fixture: treeview/annotation-gaps/annotation-outer]

[fixture: treeview/annotation-gaps/annotation-quoted]

[fixture: treeview/annotation-gaps/annotation-bare-owned-gap]

[corpus fixture: treeview/directive-icon-parts-parts]

[corpus fixture: treeview/directive-description-start]

[corpus fixture: treeview/directive-class-value-parts]

Input (escaped): `"treeView-beta\nR   text   :::hot\n"`.

Output
([annotation-gaps/annotation-bare-owned-gap-output.mmd](../tests/fixtures/treeview/annotation-gaps/annotation-bare-owned-gap-output.mmd)):

```mmd
treeView-beta
  R   text :::hot
```

### Repeated annotations

Keep every class, icon and description occurrence in order, including
overwritten assignments and empty resets. The final Db value is insufficient to
reproduce the authored syntax; moving a later annotation into a description can
also change that value.

[fixture: treeview/repeated-annotations/repeat-class]

[fixture: treeview/repeated-annotations/repeat-icon]

[fixture: treeview/repeated-annotations/repeat-mixed]

[fixture: treeview/repeated-annotations/repeat-desc]

[fixture: treeview/repeated-annotations/repeat-desc-empty]

[corpus fixture: treeview/annotation-description-repeat-lines]

[corpus fixture: treeview/annotation-description-repeat-empty]

[corpus fixture: treeview/db-repeat-class]

[corpus fixture: treeview/db-repeat-icon]

Input (escaped): `"treeView-beta\nR :::first :::last\n"`.

Output
([repeated-annotations/repeat-class-output.mmd](../tests/fixtures/treeview/repeated-annotations/repeat-class-output.mmd)):

```mmd
treeView-beta
  R :::first :::last
```

### Annotation lines

In indentation mode keep later-line annotations separate and align them with
their owner, retaining positive leading whitespace. In box mode move a
branch-prefixed annotation onto its owner's line, in source order with one
separating space, only when no earlier description and no intervening comment,
directive, selected semicolon or comment region prevents it. Retain the whole
body otherwise, including when joining exposes a branch in a value, changes
value tabs or loses box mode. When an annotation starts a retained physical line
after a joining comment region or removed directive, align its leading spaces
with the owner's name column, with a minimum of one space. That positive width
is required for Mermaid to read class, icon and description markers as
annotations rather than name text, even when the physical LF disappears from its
logical line. A truly separate indentation-only logical line in a box diagram is
rejected. Joining removes a false child branch; replacing it with a vertical
guide creates a vertical-bar node. Preserve all repeated classes, icons and
descriptions.

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

[test:
treeview/annotation-lines/review159-region-unbranched-root-description-ls]

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

[test:
treeview/annotation-lines/review159-region-value-prefix-and-protected-row]

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

Input (escaped): `"treeView-beta\n\"head\n tail\"\n    :::X\n"`.

Output
([annotation-lines/after-multiline-output.mmd](../tests/fixtures/treeview/annotation-lines/after-multiline-output.mmd)):

```mmd
treeView-beta
  "head
 tail"
  :::X
```

[fixture: treeview/annotation-lines/box-redraw-repeat-prefixed-annotations-kept]

[fixture:
treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

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

[fixture:
treeview/annotation-lines/box-redraw-joining-would-expose-value-branch]

[fixture: treeview/annotation-lines/box-redraw-joining-would-drop-mode]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-child]

[fixture:
treeview/annotation-lines/box-redraw-annotation-decoration-before-sibling]

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

Print ordinary class components as `:::Name` and icon components as
`icon(reference)`, including `icon()` and `icon(:file)`. Keep class/reference
spelling. Compact marker padding groups the class visually; icon-internal
whitespace is not grammar. Trivia between complete components retains its
boundaries.

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

Input (escaped): `"treeView-beta\nentry :::%%{wrap}%%  X\n"`.

Output
([annotation-components/class-directive-output.mmd](../tests/fixtures/treeview/annotation-components/class-directive-output.mmd)):

```mmd
treeView-beta
  entry :::%%{wrap}%% X
```

### Descriptions

Keep the full description literal after `##`, including leading/trailing
padding, whitespace-only text, LS/PS, percent text and apparent annotation
syntax. Null stays null. Db-equal trimming would still erase authored text;
internal whitespace changes can change the description. The gap before `##`
follows Annotation gaps.

[fixture: treeview/descriptions/description-padding]

[fixture: treeview/descriptions/description-empty]

[fixture: treeview/descriptions/description-space-only]

[fixture: treeview/descriptions/description-marker-text]

[corpus fixture: treeview/text-description-ls]

[corpus fixture: treeview/config-security-level-other]

[corpus fixture: treeview/text-description-ps]

[corpus fixture: treeview/tail-description-comment]

[corpus fixture: treeview/directive-description-middle]

Input (escaped): `"treeView-beta\nR ##\n"`.

Output
([descriptions/description-empty-output.mmd](../tests/fixtures/treeview/descriptions/description-empty-output.mmd)):

```mmd
treeView-beta
  R ##
```

### Names

Keep complete bare-name and StringLiteral source spans: quote choice, empty
names, backslashes, internal and trailing whitespace, HTML/entity spelling and
directory slashes. singleQuote does not requote them. Even Db-equal requoting
loses spelling; quoting a padded bare directory can change its name and
file/directory type.

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

Input (escaped): `"treeView-beta\nA   B\n"`.

Output
([names/name-bare-internal-output.mmd](../tests/fixtures/treeview/names/name-bare-internal-output.mmd)):

```mmd
treeView-beta
  A   B
```

### Multiline values

Keep quoted-name continuation columns, internal blank lines, LS/PS and enclosed
box spellings as authored. Only the node's first line receives the planned head.
Determine the first positive branch column from the new outer heads and
unchanged value-owned prefixes in written order. If any enclosed prefix's
`4 * (round(column / width) + 1)` changes, retain the complete body. This
preserves value reading as well as spelling; a fixed source span alone cannot
protect its indentation from an external width change.

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

Input (escaped): `"treeView-beta\n'first\n\n last'\n"`.

Output
([multiline-values/multiline-blank-output.mmd](../tests/fixtures/treeview/multiline-values/multiline-blank-output.mmd)):

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

[fixture:
treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

### Title

Keep common statements in their preamble and source order. Use shared
`title value` with trimmed exterior common whitespace, or bare `title` for
null/whitespace-only values, preserving internal text. This chooses consistent
Db-equivalent outer spacing without taking a next-line value. Follow AST
boundaries for `titlex` and `title"node"`; title still stays written when the
summary omits it.

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

Input (escaped): `"treeView-beta\ntitle\t\nR\n"`.

Output
([title/common-bare-title-separator-tab-output.mmd](../tests/fixtures/treeview/title/common-bare-title-separator-tab-output.mmd)):

```mmd
treeView-beta
  title
  R
```

### Accessibility lines

Use shared `accTitle: value` and `accDescr: value`: colon touching the keyword,
one space before trimmed nonempty values, no trailing space for empty values.
Retain internal whitespace, brace-looking line values and trivia boundaries. The
common converter permits these equivalent outer gaps; internal Db-equal
normalization is unnecessary. Never borrow text from the next line.

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

Input (escaped): `"treeView-beta\naccDescr:\n%%{init: {}}%%\nR\n"`.

Output
([accessibility-lines/acc-empty-next-directive-output.mmd](../tests/fixtures/treeview/accessibility-lines/acc-empty-next-directive-output.mmd)):

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

Use shared description-block layout for ordinary blocks: whitespace-only
interiors become `{}`, touching edges remain touching, and ordinary edge padding
becomes one space. Join plain opener whitespace, preserve nonempty continuation
columns and trivia-only interiors, and align separate closers with the
statement. In box mode remove ordinary keyword/opener prefixes and place the
common statement at column one. Keep the complete brace span when it contains
value-owned box geometry, because moving its physical lines can change the
reading. The first effective `}` remains the closer. Unsafe removal follows
Branch prefixes, including common-value tabs. A sole mode selector in the opener
gap keeps just that gap, as described in Decorations.

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

Input (escaped): `"treeView-beta\naccDescr {\n  first\n\n    second\n}\nR\n"`.

Output
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

[fixture: treeview/description-blocks/box-redraw-remove-opener-prefixes]

[fixture:
treeview/description-blocks/box-redraw-opener-prefix-with-directive-gap]

[fixture: treeview/description-blocks/box-redraw-opener-prefix-with-comment-gap]

[fixture: treeview/description-blocks/box-redraw-common-prefix-tab-kept]

[fixture: treeview/multiline-values/box-redraw-value-block-keep]

[fixture: treeview/accessibility-lines/box-redraw-common-tab-prefix-preserved]

[fixture:
treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

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

Put ordinary standalone comment marks at column one and keep inline comments on
their line, preserving marks, contents and tails, including native LS/PS. Move
meaningful indentation runs once to their assigned node. In a drawable box
diagram remove a native comment's structural prefix and draw that assigned
branch once on the node's name line. The comment is not a tree child. Percent
text inside names, descriptions or blocks stays value text; common joining
regions and unsafe prefix intersections follow body retention.

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

Input (escaped): `"treeView-beta\nR %% literal\n"`.

Output
([comments/comment-bare-is-value-output.mmd](../tests/fixtures/treeview/comments/comment-bare-is-value-output.mmd)):

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

Keep directive text and order. Within one printed line retain contact or
separation on each side, except between directives moved to a new directive-only
line as described in [Statements one per line](#statements-one-per-line). When
units split, attach the directive to the following unit and retain its right
boundary. Standalone directives use column one. For a leading indentation unit,
keep following gaps while they fit, shorten excess from the last gap, then
supply the remaining indentation before the first directive. This preserves the
assigned indent without duplicating earlier carried runs. Multiline interiors,
value-owned forms and unfinished EOF directives remain written.

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

Input (escaped): `"treeView-beta\nA%%{init: {}}%%B\n"`.

Output
([directives/directive-in-bare-output.mmd](../tests/fixtures/treeview/directives/directive-in-bare-output.mmd)):

```mmd
treeView-beta
  A%%{init: {}}%%B
```

### Semicolons

Keep every authored semicolon through shared textual-prefix and kept-line
protection; treeview has no grammatical semicolon and style/classDef words alone
do not freeze a line. Draw a safe outer box head around protected content, while
protected interiors and value columns remain written. Retain the whole body when
protected source row boundaries constrain parentage or when another Branch
prefixes condition applies. These protections compose with unchanged value-owned
prefixes on the same line or elsewhere in the diagram; they are not permission
to discard a semicolon or partially redraw an unsafe body.

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

Input (escaped): `"treeView-beta\n   \"style:#z;\"\n"`.

Output
([semicolons/first-line-baseline-output.mmd](../tests/fixtures/treeview/semicolons/first-line-baseline-output.mmd)):

```mmd
treeView-beta
  "style:#z;"
```

[fixture: treeview/semicolons/box-redraw-protected-line-and-enclosed-prefix]

[fixture:
treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

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

Keep at most one ordinary ASCII blank line between items and remove edge blanks,
after relocating meaningful indentation runs and replacing outer decoration.
This gives bounded separation while preserving parentage. Keep value, directive
and comment-region interiors unchanged; Unicode-only names are not ordinary
blank lines. Body-retained diagrams keep their source boundaries.

[fixture: treeview/blank-lines/blank-collapse]

[fixture: treeview/blank-lines/blank-between-comments]

[fixture: treeview/blank-lines/blank-space-carry]

[fixture: treeview/blank-lines/blank-quote-preserve]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/space-line-nbsp]

Input (escaped): `"treeView-beta\nR\n%% note\n\n\n C\n"`.

Output
([blank-lines/blank-between-comments-output.mmd](../tests/fixtures/treeview/blank-lines/blank-between-comments-output.mmd)):

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

Decide by owner: keep bare-name, description, quoted-interior, comment and
directive tails as authored values. Move structural carried runs once. Common
line values use shared outer trimming; a branch-line tail already excluded from
the value is removed rather than carried. Adding a branch that would newly trim
an owned tail retains the body. This avoids confusing value text with structural
padding; significant fixture tails are not shown in code blocks.

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

Do not wrap at printWidth. Nodes, annotations, descriptions and common values
keep authored line breaks. New breaks can create nodes, alter name characters or
change description text; width is not a semantic boundary.

[fixture: treeview/long-lines/long-bare-kept]

[fixture: treeview/long-lines/long-annotations-kept]

Input (escaped):
`"treeView-beta\nR :::long-class-name icon(long-pack:long-icon-name) ## long description with words\n"`.

Options: `{"printWidth":20}`.

Output
([long-lines/long-annotations-kept-output.mmd](../tests/fixtures/treeview/long-lines/long-annotations-kept-output.mmd)):

```mmd
treeView-beta
  R :::long-class-name icon(long-pack:long-icon-name) ## long description with words
```

### Frontmatter yaml

Format only safe real leading frontmatter with the shared guarded YAML
formatter. Retain indented fences, closer padding, malformed YAML, HTML quote
hazards and fence-producing bodies. Nested values and scalars use at least one
space at tabWidth zero. Ordinary pre-header trivia uses root placement; a
second-scan Comment and its inner Root directive print once. Body `---` stays a
name, and rejected retained YAML is never promoted or repaired.

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

Input (escaped): `"treeView-beta\n---\nkey: value\n---\n"`.

Output
([frontmatter-yaml/body-yaml-is-name-output.mmd](../tests/fixtures/treeview/frontmatter-yaml/body-yaml-is-name-output.mmd)):

```mmd
treeView-beta
  ---
  key: value
  ---
```

### Line terminators and unicode

Use shared host EOL handling: CR and CRLF reach the printer as LF, and output
follows endOfLine, including in quotes, blocks and directives. Keep LS/PS as
value or native-comment characters and Unicode spaces as authored text rather
than ASCII indentation. The host removes/restores a leading BOM with the shared
frontmatter limitation.

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

Keep every authored node, name, annotation, common assignment and shared trivia
in source order, including duplicates, empty values and overwritten assignments.
Redraw only structural box forms and relocate eligible prefixed annotations and
their decoration as described above. Preserve arbitrary prefix text and
value-owned box spellings; the normalized Db is not a source-text replacement.
Structural weight, dash count, sibling marks and ordinary outer decoration are
deliberately reselected to show the read forest.

[fixture: treeview/source-order/source-duplicate]

[fixture: treeview/source-order/source-unused-title]

[fixture: treeview/source-order/source-empty-common]

Input (escaped): `"treeView-beta\nR\n X\n X\nR\n"`.

Output
([source-order/source-duplicate-output.mmd](../tests/fixtures/treeview/source-order/source-duplicate-output.mmd)):

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

[fixture:
treeview/annotation-lines/box-redraw-sole-common-mode-selector-preserved]

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

End ordinary accepted input with one configured newline, including empty bodies,
nodes, common forms, closed blocks and comments. Preserve value tails.
Unfinished EOF directives and protected/source-kept endings follow shared
exceptions. Rejected unused indentation runs are not trimmed into accepted
input.

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

Input (escaped): `"treeView-beta\naccDescr {}"`.

Output
([final-newline/eof-block-output.mmd](../tests/fixtures/treeview/final-newline/eof-block-output.mmd)):

```mmd
treeView-beta
  accDescr {}
```

### Specified readings

Use the existing six divergences: directive-as-token-boundary,
ignored-semicolon-as-token-boundary, html-tag-in-frontmatter,
embedded-data-opaque, bare-percent-line-before-header and c4-keyword-anywhere.
Empty quoted names and `icon()` are accepted syntax. Do not repair rejected
grammar; compare accepted corpus inputs with their specified Db where recorded.
A raw rejection supplies no raw Db, and treeview adds no opaque acceptance
setting.

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

Apply the same rules to dedented payloads; the Markdown host supplies fence,
list and quote columns. Do not add host columns to value continuations. Test
host output/idempotence separately from the payload Db. The host can trim
padding on the final code line, limiting authored-byte preservation; quoted
interior padding stays inside the quotes. Rejected fences follow the host route,
which can also trim source padding.

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

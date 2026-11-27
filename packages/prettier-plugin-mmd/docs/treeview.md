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
inline names or rejected spellings. A header at column one is easier to find
than an indented one. Ordinary body items follow on later lines, as each
statement of a [flowchart](./flowchart.md#statements-one-per-line) stands on a
line of its own;
[rule 2](./printed-form.md#2-a-gap-of-a-kind-that-prettier-does-not-have) gives
treeView the same body layout. Empty bodies stay empty; attached directives
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

### Keyword case

The annotation `icon(` is read in lower case only: `ICON(logos:react)` is a
name, and stays as written.

[fixture: keyword-case/icon-kept]

Input (escaped): `"treeView-beta\n'plain'\nICON(logos:react)"`.

Output
([keyword-case/icon-kept-output.mmd](../tests/fixtures/treeview/keyword-case/icon-kept-output.mmd)):

```mmd
treeView-beta
  "plain"
  ICON(logos:react)
```

### Modes

Keep the original indentation or box-drawing mode. For box-drawing input this
form corrects the form of [rule 3](./printed-form.md#3-a-spelling): the box
characters show on each line whether a sibling follows, the node is the last
child, or the siblings of an upper level go on, which indentation shows only in
the columns of the lines below. Of the 13 tree diagrams in the documentation of
mermaid.js, 10 are written with indentation and 3 with box characters, so
[rule 3](./printed-form.md#3-a-spelling) gives the indentation form, and an
input written with indentation stays in indentation mode. Some of these inputs
have no box form: written in box mode, an indented line that goes on without a
branch prefix, such as the second line of a quoted name or an annotation on a
line of its own, is rejected, and so is an annotation at column one. The second
line of a quoted name at column one is a part of the name, and so is a second
line that starts with a `│`; a `│` put before an annotation adds a node named
`│`. The mode test still examines logical LF lines after the header, including
value interiors, excluding whitespace-only, comment-shaped, metadata-shaped and
vertical-only lines. Prefix presence alone is insufficient. In box mode redraw
ordinary outer structure from the AST forest; do not convert indentation-mode
input into a box diagram. Redrawing makes `├`, `└`, and `│` say what mermaid.js
reads; moving only the authored characters' columns would leave a `├` on a last
child or a `│` where no sibling follows. Preserve the mode and the reading of
enclosed box forms, using the body-retention conditions in Branch prefixes.
Common statement prefixes are removed and ordinary common statements use column
one, so they do not appear as children.

Box characters inside a comment line do not select box mode; in indentation mode
that comment aligns with the following statement.

[fixture: treeview/modes/comment-excluded] [fixture:
treeview/modes/box-quoted-name-column-one-continuation] [fixture:
treeview/modes/box-quoted-name-bar-continuation] [fixture:
treeview/annotation-lines/box-redraw-vertical-is-a-node] [test:
treeview/modes/box-annotation-column-one-rejected] [test:
treeview/modes/box-annotation-indented-rejected] [corpus fixture:
treeview/box-written-tree] [corpus fixture: treeview/box-entity-mixed-indent]
[corpus fixture: treeview/box-quoted-indent-error] [corpus fixture:
treeview/box-multiline-quoted] [corpus fixture:
treeview/box-decoration-annotation-gap] [corpus fixture:
treeview/box-decoration-only]

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
retaining misleading authored depth, sibling marks or mixed weights. The
branches and guides are drawn anew, so the authored characters no longer stay
where they stood; keeping only their weight would mix two ways of drawing in one
diagram. Box characters inside a name stay as written.

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

A branch whose name is a `;` alone is a node: nothing follows its prefix, and
the prefix is drawn like any other. The treeview specification reads the `;`
after a branch prefix as the node's bare name. Removing its only branch prefix
would move that node to the top level and change the Db tree, so the prefix
remains.

[fixture: treeview/branch-prefixes/branch-semicolon-name]

A U+2028 or U+2029 before a comment region carries the name onto the next row:
the comment region removes the rest of its line, the line break included, that
of an LF and that of a CRLF, and the name goes on with that row, past the
comment lines that stand between
([Comments and boundaries](../../spec/docs/diagrams/treeview.md#comments-and-boundaries)).
A directive between the character and the comment does not stop it. A prefix on
that row is text of the name, not a branch, so the row holds no node of its own.
The node of the name takes `└── ` when no sibling follows it, also where it was
written with `├── `, and `├── ` when one does, as the first, a middle or the
last of its siblings and at any depth: `├── a`, the character, `%% c` and
`└── z` print as `└── a`, the character, `%% c` and `└── z`, which is one node,
while with a `├── b` row between the comment and `└── z` the node keeps `├── `,
since `└── z` follows it. A directive without a comment, a blank row after the
comment and the end of the text do not carry the name, so the nodes keep the
branches that their siblings give them.

[test: treeview/branch-prefixes/continued-name-line-separator-comment] [test:
treeview/branch-prefixes/continued-name-paragraph-separator-comment] [test:
treeview/branch-prefixes/continued-name-semicolon-line-separator-comment] [test:
treeview/branch-prefixes/continued-name-nested-line-separator-comment] [test:
treeview/branch-prefixes/continued-name-middle-line-separator-comment] [test:
treeview/branch-prefixes/continued-name-line-separator-comment-sibling-follows]
[test:
treeview/branch-prefixes/continued-name-line-separator-directive-without-comment]
[test: treeview/branch-prefixes/continued-name-line-separator-comment-blank-row]
[test: treeview/branch-prefixes/continued-name-line-separator-comment-at-end]
[test: treeview/branch-prefixes/continued-name-line-separator-directive-comment]
[test: treeview/branch-prefixes/continued-name-line-separator-comment-crlf]
[test:
treeview/branch-prefixes/continued-name-line-separator-comment-line-follows]

Choose body retention once before drawing. Keep the complete body as written if
an outer prefix or its separator crosses arbitrary text, a directive, selected
semicolon or comment region, or a decoration line crosses shared trivia. This
keeps characters that redrawing would otherwise drop. Also retain it for fixed
source row boundaries, unsafe annotation moves, loss of box mode, changed
effective indentation of a prefix inside a value, or a newly added/removed
branch changing owned value tabs or tails. An annotation moved after an existing
`##` description would be read as description text; an intervening comment must
also keep its place. Splitting a box-mode logical line also retains the body
when it would expose leading Unicode whitespace in a name on a new unprefixed
line, and where drawing a branch would give one to a node that ends at a U+2028
or U+2029 before a comment region or a directive (see
[Line terminators and unicode](#line-terminators-and-unicode)). These conditions
compose; one protected row can determine the first positive branch column for
every other row. Body-retained diagrams are exempt from visual agreement. Names,
values, arbitrary prefix text and shared trivia are never discarded.

[test: treeview/branch-prefixes/uppercase-entity-and-tab-column]

[fixture: treeview/branch-prefixes/retained-unprefixed-annotation-decoration]

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

[fixture: treeview/tabs/box-redraw-description-tail-dropped]

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
next node, or as a blank line when no tree continues there. A vertical-only
decoration shows the branch continuing below its place; with none, there is no
guide to draw. Apply this at body, pending-name, annotation and opener-gap
owners; moved blanks join the following gap's single-blank placement, including
before its first trivia item, and edge blanks follow Final newline. When a
prefixed annotation moves inline, its decorations remain after the joined node
line, before the continuing tree. This replaces stale verticals, heavy lines and
dash-only shapes with the tree's continuation. Keep a decoration needed to
select box mode, including its complete gap before an `accDescr` opener when it
is the only selector there; format the rest of the block and body normally.
Keeping that gap preserves mode without freezing unrelated title spacing or
blank lines. Keep value-owned decoration spans unchanged. Shared trivia on a
decoration line invokes body retention rather than deletion.

[fixture: treeview/decorations/explicit-empty-description-trivia] [fixture:
treeview/decorations/pending-name-before-first-root] [fixture:
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
Print roots at one configured step and children one step beyond their parent.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts the roots one
configured level below the header, as Prettier prints the lines inside a block.
A child stands deeper, since indentation determines parentage. A space step is
`max(1, tabWidth)`; useTabs uses one tab. This selects a uniform Db-equivalent
width even for a deep first node, later shallower roots, irregular increments,
duplicate names and empty names.

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

A `;` that the line rule ignores and that stays after a quote or a class does
not stop the carry. The run before the `;`, after it, or before a comment or a
directive that follows it moves the same way, and comment lines, blank lines and
directive lines may lie between. Newlines are hidden to mermaid.js, so it
rejects a second run on the next line after a run that follows a quote or a
class, also when a `;` that the line rule ignores lies between
([Indentation and lines](../../spec/docs/diagrams/treeview.md#indentation-and-lines)).

[corpus fixture: treeview/gram-quoted-tail-space-next-indent] [corpus fixture:
treeview/gram-class-tail-space-next-indent] [corpus fixture:
treeview/gram-quoted-ignored-semicolon-tail-space-next-indent]

The `;`, the comment and the directive then touch each other and the node.

[fixture: treeview/carried-indentation/carry-quote-semicolon-comment] [fixture:
treeview/carried-indentation/carry-quote-semicolon-directive] [fixture:
treeview/carried-indentation/carry-quote-run-before-semicolon] [fixture:
treeview/carried-indentation/carry-class-semicolon] [fixture:
treeview/carried-indentation/carry-quote-semicolon-lines] [fixture:
treeview/carried-indentation/carry-quote-semicolon-directive-line] [fixture:
treeview/carried-indentation/carry-quote]

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

[fixture: treeview/tabs/box-redraw-description-tail-dropped]

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

In box mode a run that stands before a comment, or before a directive on a line
without a branch, disappears when the next node is given a branch, and the
comment or the directive touches what stands before it: the branch is a second
run, which mermaid.js rejects after the first. `"a" %% c`, `─`, and `"b"` print
`"a"%% c`, `│`, and `└── "b"`, and `├── "a" %% c`, `│`, and `"b"` print
`├── "a"%% c`, `│`, and `└── "b"`. The same holds after a class or an icon, with
a tab or two spaces before the comment, with a directive and a comment together,
and where a blank line, one comment line or more, an indented comment line, or a
directive line lies between. A comment after the `─` line leaves the line in its
place and gives the branch to it: the `└──` stands before the `─` and not before
`"b"`: `"a" %% c`, `─ %% n`, and `"b"` print `"a"%% c`, `└── ─ %% n`, and `"b"`.
The space before a directive on a line with a branch stays where no comment
follows it on the line: `├── "a" %%{x}%%`, `─`, and `"b"` print
`├── "a" %%{x}%%`, `│`, and `└── "b"`. Where a comment follows, the spaces
before the directives and between them go too, since mermaid.js removes the
directives and those spaces join the run after the quote, and the form that
keeps them is rejected: `├── "a" %%{x}%% %% c`, `─`, and `"b"` print
`├── "a"%%{x}%%%% c`, `│`, and `└── "b"`, and two directives print
`├── "a"%%{x}%%%%{y}%%%% c`. A node that ends the text, a node named `End`, and
a node named `}` are given the branch in the same way. A line that holds a `;`
that the line rule ignores, as in `"a" ## style:#x; %% c`, stays as written with
the `─` line after it, and so does a line where a directive and a comment end
the text with no node after them: `├── "a" %%{x}%%` and `%% c` print
`└── "a" %%{x}%%` and `%% c`.

[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-and-decoration]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-on-branch-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-without-decoration]
[fixture:
treeview/carried-indentation/box-redraw-run-before-directive-and-decoration]
[fixture:
treeview/carried-indentation/box-redraw-run-before-directive-and-comment]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-after-class]
[fixture: treeview/carried-indentation/box-redraw-run-before-comment-tab]
[fixture: treeview/carried-indentation/box-redraw-run-before-comment-blank-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-comment-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-directive-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-nested-branches]
[fixture:
treeview/carried-indentation/box-redraw-run-before-directive-on-branch-line-kept]
[fixture: treeview/carried-indentation/box-redraw-run-before-comment-icon]
[fixture: treeview/carried-indentation/box-redraw-run-before-comment-two-spaces]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-indented-comment-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-decoration-comment-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-directive-comment-comment-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-directives-comment-on-branch-line]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-two-comment-lines]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-end-of-text]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-node-named-end]
[fixture:
treeview/carried-indentation/box-redraw-run-before-comment-node-named-brace]
[fixture:
treeview/carried-indentation/box-redraw-run-before-ignored-semicolon-comment-kept]
[fixture:
treeview/carried-indentation/box-redraw-run-before-two-ignored-semicolons-comment-kept]
[fixture:
treeview/carried-indentation/box-redraw-run-before-directive-comment-line-at-end-kept]
[test: treeview: a quote in box mode, U+2028, and a comment before the next line
of the box] [test: treeview: a quote in box mode, U+2029, and a directive before
the next line of the box]

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

[fixture: treeview/tabs/box-redraw-description-tail-dropped]

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
Where the directive touches the unit on each side, mermaid.js puts the unit
after it at the top level (in `root`, `├── "a"%%{x}%%"b"`, and `└── c`, the node
`b` is a node of the top level with the child `c`), so the unit after the
directive stands with no prefix: a prefix before it would put `b` under `root`
and change the Db and the drawing.

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
with its node. In indentation mode, a directive in the gap of units that
formatting splits moves with the following unit, keeps its right-side contact or
separation, and breaks its left contact. In box mode a directive that leaves a
split gap stands alone on a line at column one, and does not touch the prefix of
the next unit as in indentation mode: a prefix that crosses a directive makes
the whole body retained as written under [Branch prefixes](#branch-prefixes),
and later passes would no longer redraw the tree. With a space between the
directive and the prefix, mermaid.js draws another figure.

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
[fixture: treeview/statements-one-per-line/directive-split-indent-right-space]
[fixture: treeview/statements-one-per-line/directive-split-indent-left-space]

Input (escaped): `"treeView-beta\n\"A\"\"B\"'C'\n"`.

Output
([statements-one-per-line/adjacent-quoted-output.mmd](../tests/fixtures/treeview/statements-one-per-line/adjacent-quoted-output.mmd)):

```mmd
treeView-beta
  "A"
  "B"
  "C"
```

[fixture: treeview/branch-prefixes/rounding-half]

[fixture: treeview/branch-prefixes/box-redraw-multi-root-redraw]

[fixture: treeview/branch-prefixes/box-redraw-flat-forest-branches]

[corpus fixture: treeview/box-tail-collision-unselected-semicolon]

[fixture: treeview/semicolons/protected-row-body]

Without branch characters, a node that starts with a whitespace character other
than a space or a tab (U+2028, U+2029, a no-break space, and the others that
`String.prototype.trim` removes), after another node on its line, stays on its
line, and the body is printed as written, when a comment follows that
whitespace, with only whitespace, line breaks, and directives between:
mermaid.js draws a node there, named by the whitespace, or by the whitespace and
the `%%` after it, while on a line of its own the whitespace belongs to a
comment line, which takes it with the whitespace and line breaks before its
`%%`, and no node is drawn. At the end of its line before a directive, or with
no comment after it, the node is split from the node before it like any other
node.

[test: treeview/statements-one-per-line/separator-node-before-comment-ls]

[test: treeview/statements-one-per-line/separator-node-before-comment-ps]

[test: treeview/statements-one-per-line/separator-node-at-line-end]

[test:
treeview/statements-one-per-line/whitespace-node-before-comment-no-break-space]

[test:
treeview/statements-one-per-line/whitespace-node-before-comment-ideographic-space]

[test:
treeview/statements-one-per-line/whitespace-node-at-line-end-before-comment-line]

[test:
treeview/statements-one-per-line/whitespace-node-at-line-end-before-separator-comment-line]

[test:
treeview/statements-one-per-line/whitespace-node-at-line-end-before-directive-line]

### Annotation gaps

Use one ASCII space before an ordinary same-line annotation. Its required
positive leading gap distinguishes an annotation from name text. Keep authored
internal name whitespace, and preserve contact or separation on each side of
trivia instead of applying the plain-gap rule there. The whitespace inside a
name that is not quoted stays because versions that count draw another figure
without it (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

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
overwritten assignments and empty resets. Moving a later annotation into a
description can change the final Db value.

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
value tabs or loses box mode. An annotation moved after an existing `##`
description would be read as description text; a comment between it and the node
must keep its place. When an annotation starts a retained physical line after a
joining comment region or removed directive, align its leading spaces with the
owner's name column, with a minimum of one space. That positive width is
required for Mermaid to read class, icon and description markers as annotations
rather than name text, even when the physical LF disappears from its logical
line. A truly separate indentation-only logical line in a box diagram is
rejected. Joining removes a false child branch: an annotation on its own line
needs a branch in a box diagram, although it adds no child node; replacing it
with a vertical guide creates a vertical-bar node. Preserve all repeated
classes, icons and descriptions.

[test: treeview/annotation-lines/empty-description-after-unrelated-region-ls]

[test: treeview/annotation-lines/empty-description-after-unrelated-region-ps]

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
  entry :::%%{wrap}%%X
```

### Descriptions

One space stands between `##` and the text of a description, whether the spaces
and tabs there were many, or none: `##   text` and `##text` are printed
`## text`, since mermaid.js trims them from the description and draws the same
figure. The spaces and tabs at the end of the description go for the same reason
(see [Trailing whitespace](#trailing-whitespace)). Keep the rest of the
description literal, including whitespace-only text, LS/PS, percent text and
apparent annotation syntax. The spaces and tabs at the end of a description are
trimmed by mermaid.js without changing the figure, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) selects a line
without that tail. Percent text and annotation-looking text after `##` belong to
the description in the Db; treating them as separate comments or annotations
changes that description. Null stays null. Internal whitespace changes can
change the description. The gap before `##` follows Annotation gaps.

[corpus fixture: treeview/tail-description-comment] [corpus fixture:
treeview/db-description-absorbs-annotations]

[fixture: treeview/descriptions/description-padding] [fixture:
treeview/descriptions/description-touches-marker]

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

Keep complete bare-name and StringLiteral source spans: empty names,
backslashes, internal whitespace, the whitespace inside quotes, HTML/entity
spelling and directory slashes; only the spaces and tabs at the end of a bare
name at the end of a line go (see [Trailing whitespace](#trailing-whitespace)).
Empty quoted names are Db nodes, and literal backslashes, whitespace inside
quotes, HTML and entity spellings remain in node names; removing or rewriting
them changes the Db. A bare name's final slash selects a directory, so dropping
it selects a file. Under
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark), spaces and tabs at
the end of a bare name's line are removed, where mermaid.js already trims them
without changing the figure. For a bare name, `A   B` stays instead of `A B`,
since some of the versions of mermaid.js that count give the two forms different
names in the Db and draw them differently (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A string between `'` is printed between `"`, unless its text holds a `'`, a `"`,
a backslash, a line break, U+2028, U+2029, a backquote, `&`, `#`, or `<` (see
[Spellings that are drawn the same](./compatibility.md#spellings-that-are-drawn-the-same)),
and `singleQuote` is not read. Quoting a padded bare directory can change its
name and file/directory type. A name in quotes keeps its quotes, though the
examples write 58 names without quotes and 8 in quotes: some versions that count
read a name in quotes only (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).

[corpus fixture: treeview/db-empty-names] [corpus fixture:
treeview/db-quote-conversion] [corpus fixture: treeview/db-quoted-space] [corpus
fixture: treeview/html-double] [corpus fixture: treeview/entity-double] [corpus
fixture: treeview/db-directory-trailing-space]

[fixture: treeview/names/quoted-name-kept] [fixture:
treeview/names/single-quote-sensitive-kept] [fixture:
treeview/names/name-quote-tail] [fixture: treeview/names/name-bare-tail]
[fixture: treeview/names/name-bare-internal]

[fixture: treeview/names/name-quote-tail]

[fixture: treeview/names/name-single]

[fixture: treeview/names/name-escape]

[fixture: treeview/names/name-empty]

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
null/whitespace-only values, printing a run of spaces and tabs inside the text
as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).
Where only directives follow the text of a title, they are printed with one
space before each that has spaces or tabs before it, and the spaces and tabs
after the last one are left out, unless a directive of the line holds a line
break, a `;`, a U+2028, or a U+2029 (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)):
`title T  %%{x}%%  ` is printed `title T %%{x}%%`, and
`title T  %%{x}%%  %%{y}%%  ` is printed `title T %%{x}%% %%{y}%%`. A comment
after the last directive stands after one space where spaces or tabs separate
them (`title T  %%{x}%%  %% c` is printed `title T %%{x}%% %% c`).
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`. A comment that touches the last directive
stays touching: `title T  %%{x}%%%% c` is printed `title T %%{x}%%%% c`. The
whitespace between them is printed as the second table below gives (a no-break
space keeps the line as written, `T %%{x}%%\u00a0%% c`). The other forms of a
title with a directive, and the forms of an `accTitle:` and an `accDescr:` line
(see [Accessibility lines](#accessibility-lines)), are printed as the table
below gives: `%%{x}%%` and `%%{y}%%` are directives, `\u00a0` is a no-break
space, and the other `\u` forms are the characters of that number.

| Written after the keyword | `title `            | `accTitle: `        | `accDescr: `        |
| ------------------------- | ------------------- | ------------------- | ------------------- |
| `T  %%{x}%%  `            | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T  %%{x}%%  %%{y}%%  `   | `T %%{x}%% %%{y}%%` | `T %%{x}%% %%{y}%%` | `T %%{x}%% %%{y}%%` |
| `T  %%{x}%%  %% c`        | `T %%{x}%% %% c`    | `T %%{x}%% %% c`    | `T %%{x}%% %% c`    |
| `T  %%{x}%%%% c`          | `T %%{x}%%%% c`     | `T %%{x}%%%% c`     | `T %%{x}%%%% c`     |
| `T %%{x}%%  U  %%{y}%%  ` | as written          | as written          | as written          |
| `T %%{x}%% U  `           | as written          | as written          | as written          |
| `T %%{x}%%\u00a0`         | as written          | as written          | as written          |
| `T %%{x}%%\u3000`         | as written          | as written          | as written          |
| `T %%{x}%%\u2003`         | as written          | as written          | as written          |
| `T %%{x}%%\u0085`         | as written          | as written          | as written          |
| `T %%{x}%%\u2028`         | as written          | as written          | as written          |
| `T %%{x}%%\u2029`         | as written          | as written          | as written          |
| `T %%{x}%%;`              | as written          | as written          | as written          |
| `T %%{x}%%\t`             | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\u00a0%%{x}%%`          | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\u2028%%{x}%%`          | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\u2028%%{x}%%  `        | as written          | as written          | as written          |
| `T\u2029%%{x}%%  `        | as written          | as written          | as written          |
| `T\u0085%%{x}%%  `        | `T\u0085%%{x}%%`    | `T\u0085%%{x}%%`    | `T\u0085%%{x}%%`    |
| `T\u3000%%{x}%%`          | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\u2003%%{x}%%`          | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\u2029%%{x}%%`          | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\u0085%%{x}%%`          | as written          | as written          | as written          |
| `T %%{x}%%\u00a0%% c`     | as written          | as written          | as written          |
| `T %%{x}%%\u3000%% c`     | as written          | as written          | as written          |
| `T %%{x}%%\t%% c`         | `T %%{x}%% %% c`    | `T %%{x}%% %% c`    | `T %%{x}%% %% c`    |
| `T %%{x}%%  %% c`         | `T %%{x}%% %% c`    | `T %%{x}%% %% c`    | `T %%{x}%% %% c`    |
| `T\t%%{x}%%`              | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `T\t%%{x}%%\t`            | `T %%{x}%%`         | `T %%{x}%%`         | `T %%{x}%%`         |
| `%%{x}%%  T  `            | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%% T`               | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%\tT`              | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%\u00a0T`          | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%\u3000T`          | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%\u2003T`          | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%  T\u00a0`        | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%\u2028T`          | as written          | as written          | as written          |
| `%%{x}%%\u2029T`          | as written          | as written          | as written          |
| `%%{x}%%\u0085T`          | as written          | as written          | as written          |
| `%%{x}%%  T\u2028`        | `%%{x}%%T`          | as written          | as written          |
| `%%{x}%%  T\u0085`        | `%%{x}%%T\u0085`    | as written          | as written          |
| `%%{x}%%  %%{y}%%  T  `   | as written          | as written          | as written          |
| `%%{x}%%  %%{y}%%  T`     | as written          | as written          | as written          |
| `%%{x}%%%%{y}%%  T  `     | `%%{x}%%%%{y}%%T`   | as written          | as written          |
| `%%{x}%%  %%{y}%%T  `     | as written          | as written          | as written          |
| `%%{x}%% %%{y}%%T`        | as written          | as written          | as written          |
| `%%{x}%%%%{y}%%T`         | as written          | as written          | as written          |
| `%%{x}%%  `               | as written          | as written          | as written          |
| `%%{x}%%\t`               | as written          | as written          | as written          |
| `%%{x}%%  %%{y}%%  `      | as written          | as written          | as written          |

After the text, a tab after the last directive is left out like spaces, and a
no-break space, U+3000, U+2003, U+0085, U+2028, U+2029, a `;`, and text after it
stay (`T %%{x}%%\u00a0`, and text after a directive that follows the text,
`T %%{x}%%  U  %%{y}%%  `, stay too). The whitespace before the last directive
is printed as the second table below gives. A title that starts with one
directive and holds text after it loses the whitespace after the directive and
at its end, but for a U+2028, a U+2029, and a U+0085 after the directive, which
stay, and a U+0085 at the end; an `accTitle:` or `accDescr:` line stays as
written there. A title that starts with two directives and spaces between them
stays as written, and one whose directives touch loses the whitespace after the
second and at its end where spaces follow it (`title %%{x}%%%%{y}%%  T  ` is
printed `title %%{x}%%%%{y}%%T`); the lines stay as written in all these forms.
A title of directives and spaces or a tab only stays as written.

[fixture: title/title-directives-end-blanks-dropped] [test:
treeview/title/directive-end-two-spaces] [test:
treeview/title/directive-end-tab] [test: treeview/title/directive-end-comment]
[test: treeview/title/directive-end-two-directives] [test:
treeview/title/directive-end-u00a0] [test: treeview/title/directive-end-u3000]
[test: treeview/title/directive-end-u2003] [test:
treeview/title/directive-end-u2028] [test: treeview/title/directive-end-u2029]
[test: treeview/title/directive-end-u0085] [test:
treeview/title/directive-end-semicolon] [test:
treeview/title/directive-end-text-touching] [test:
treeview/title/directive-end-text-after-space] [test:
treeview/title/directive-only-two-spaces-kept] [test:
treeview/title/directive-only-tab-kept] [test:
treeview/title/directives-u3000-between-kept] [test:
treeview/title/directive-u3000-trailing-spaces-kept] [test:
treeview/title/directive-then-text-gap-kept] [test:
treeview/title/directive-end-comment-touching] [test:
treeview/title/directive-leading-then-text-spaces] [test:
treeview/title/directive-leading-then-text-space] [test:
treeview/title/directive-text-between-directives-kept] [test: treeview: the
whitespace beside a directive in a title] [test: treeview: the whitespace beside
a directive in an accTitle line] [test: treeview: the whitespace beside a
directive in an accDescr line] [test: treeview: each whitespace character before
the last directive of a title and of an accessibility line]

The whitespace before the last directive of a title, an `accTitle:` line, and an
`accDescr:` line is printed alike, as the table below gives, by what follows the
directive. `{w}` is the whitespace written between the text `T` and the last
directive, and in the last row between the directive and a comment. The columns
are the characters it is: a tab; a no-break space or another whitespace
character that is no space, tab, or line separator (U+000B, U+000C, U+1680,
U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF); a U+2028 or a U+2029; and
a U+0085, which is no whitespace of the specification. A dash marks a form that
the first pass prints one way and the second pass another, which has no form
here.

| Written after the keyword | A tab               | A no-break space and the like | U+2028, U+2029     | U+0085           |
| ------------------------- | ------------------- | ----------------------------- | ------------------ | ---------------- |
| `T{w}%%{x}%%`             | `T %%{x}%%`         | `T %%{x}%%`                   | `T %%{x}%%`        | as written       |
| `T{w}%%{x}%%  `           | `T %%{x}%%`         | –                             | as written         | `T\u0085%%{x}%%` |
| `T{w}%%{x}%%\t`           | `T %%{x}%%`         | –                             | as written         | `T\u0085%%{x}%%` |
| `T{w}%%{x}%%%% c`         | `T %%{x}%%%% c`     | `T %%{x}%%%% c`               | as written         | as written       |
| `T{w}%%{x}%% %% c`        | `T %%{x}%% %% c`    | as written                    | as written         | as written       |
| `T{w}%%{x}%%%%{y}%%`      | `T %%{x}%%%%{y}%%`  | `T %%{x}%%%%{y}%%`            | `T %%{x}%%%%{y}%%` | as written       |
| `T{w}%%{x}%% %%{y}%%`     | `T %%{x}%% %%{y}%%` | as written                    | as written         | as written       |
| `T{w}%%{x}%%;`            | as written          | as written                    | as written         | as written       |
| `T{w}%%{x}%% U`           | as written          | as written                    | as written         | as written       |
| `T %%{x}%%{w}%% c`        | `T %%{x}%% %% c`    | as written                    | as written         | as written       |

A U+2028 or a U+2029 before the last directive, or between it and a comment,
ends the line for what follows the title where a comment follows it: the line
after the title is not indented, as the comment takes it in
(`title T\u2028%%{x}%%%% c` and the line `R` under it, which is no node, are
printed as they are, `R` at column one). Where nothing, an empty line, or a
comment line follows the title and the text ends, the directive and the comment
that follow a U+2028 or a U+2029 before the directive are printed on a line of
their own, and the whitespace around that U+2028 or U+2029 is left out (a U+0085
before it is no whitespace and stays at the end of the title line;
`title T\u2028%%{x}%%%% c` is printed `title T` and `%%{x}%%%% c` on the next
line); a second U+2028 or U+2029 between the directive and the comment puts the
comment on a line of its own after the directive (`title T`, a U+2028,
`%%{x}%%`, a U+2029, and `%% c` are printed `title T`, `%%{x}%%`, and `%% c` on
three lines), while a U+2028 or a U+2029 between the directive and the comment
alone, with none before the directive, stays with them as written, and, with
nothing after the line, the whitespace after it is printed as the paragraph on
that run says. A U+0085 after the first U+2028 or U+2029, outside the directives
and up to the comment, keeps the line as written (with nothing after the line,
the run between the directive and the comment is printed as that paragraph
says). The specification treats U+0085 after a title's first U+2028 or U+2029,
outside directives and before the comment, as text rather than whitespace.
Splitting that line would move U+0085 to the start of a node line: some of the
versions that count reject that text, the others draw another figure, and the Db
gains a node, so the title line stays as written (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
For a title line with a directive and a comment after it, with a statement
directly after the title or after a comment line, with a line of spaces after it
(with nothing after the line of spaces, or then a statement), with a line of a
directive with nothing after it, or with a line of a directive after a space
(with nothing after it, or then a statement), the title stays as written, the
whitespace between the directive and the comment included. Other sequences of
lines between the title and the next statement are not given, and one region of
them has forms that no rule gives: where an empty line, or a line of a directive
that stands alone at the first column, lies between the next statement and a
title, an `accTitle:` line, or an `accDescr:` line that holds a U+2028 or a
U+2029 with a directive and a comment, the whitespace around the separators and
between the directive and the comment is printed in forms that depend on each
character beside each separator, and an `accDescr:` line differs from the other
two. The forms that the released version prints stay until they are decided (see
[Where none of these rules gives a form](./printed-form.md#4-where-none-of-these-rules-gives-a-form)).

Where the last directive holds a line break or a `;` (`%%{init: {`, a line
break, and `}}%%`, or `%%{init: {a;b}}%%`), the table gives the forms with
nothing after the directive and with a comment or a second directive that
touches it, while the forms with spaces or a tab after it, and with a comment or
a second directive after a space, stay as written, whatever stands before the
directive.

A run of several whitespace characters before the last directive follows the
column of the characters in it that are no space or tab, and a run of spaces and
tabs only follows the first column, for a run whose other characters are all of
one column (`T`, a space, a no-break space, and `%%{x}%%%% c` are printed
`T %%{x}%%%% c`, and `T`, a space, a U+2028, and `%%{x}%%` are printed
`T %%{x}%%`).

A run that holds a tab and characters of the column of the no-break space (among
them U+3000) or of U+0085 is printed in a title and in an `accDescr:` line with
each run of spaces and tabs in it as one space where a tab alone becomes one
space (`T`, a tab, a no-break space, and `%%{x}%% %% c` are printed `T`, a
space, a no-break space, and `%%{x}%% %% c`), and in an `accTitle:` line with
only the run of spaces and tabs just before the directive as one space (`T`, a
tab, a no-break space, and `%%{x}%% %% c` stay as written, and `T`, a no-break
space, a tab, and `%%{x}%% %% c` are printed `T`, a no-break space, a space, and
`%%{x}%% %% c`). In all three lines the whole run becomes one space where the
column of its other characters prints one space, as the paragraph above gives
for a run of one column, and the run stays as written before a `;` and before
text. A run that holds a tab and a character of the column of the no-break space
has no printed form where spaces or a tab follow the last directive, which the
table marks with a dash. A tab before a U+0085 stays in an `accTitle:` line, and
a tab after it becomes one space. An `accDescr:` line with a tab before a U+0085
is printed as a title is (`accDescr: T`, a tab, and U+0085 are printed
`accDescr: T`, a space, and U+0085): its Db has the tab where the printed line
has a space, which mermaid.js draws the same (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)).

Between the last directive and a comment, with no U+2028 or U+2029 before the
directive and a statement right after the line, a run of spaces and tabs is
printed as one space, and a run that holds another whitespace character stays as
written, a tab in it included (`T`, `%%{x}%%`, a tab, a no-break space, and
`%% c` are not changed). Where the text ends right after the line, what stands
after the first U+2028 or U+2029 of such a run changes: whitespace characters
only (spaces, tabs, a no-break space, U+3000, and the like) are printed as one
space (`title T %%{x}%%`, a U+2028, two spaces, and `%% c` are printed with one
space after the U+2028), a second U+2028 or U+2029 after them puts the comment
on a line of its own after the first one, and a U+0085 after the first one keeps
the run as written. The forms with an empty line, a comment line, a line of
spaces, or a line of a directive after the line are not given.

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`.

[test: treeview: the whitespace before the last directive, with nothing after
it] [test: treeview: the whitespace before the last directive, with spaces after
it] [test: treeview: the whitespace before the last directive, with a tab after
it] [test: treeview: the whitespace before the last directive, with a comment
that touches it] [test: treeview: the whitespace before the last directive, with
a comment after a space] [test: treeview: the whitespace before the last
directive, with a second directive that touches it] [test: treeview: the
whitespace before the last directive, with a second directive after a space]
[test: treeview: the whitespace before the last directive, with a semicolon
after it] [test: treeview: the whitespace before the last directive, with text
after a space] [test: treeview: the whitespace between the last directive and a
comment] [test: treeview: a run between the last directive and a comment] [test:
treeview: a run between the last directive and a comment where the line is the
last statement of the text] [test: treeview: a U+2028 or U+2029 before the last
directive of a title, with nothing or an empty line after it] [test: treeview: a
U+2028 or U+2029 before the last directive of a title, with a comment line after
it] [test: treeview: a U+2028 or U+2029 before the last directive of a title,
with a statement after it, directly or after a comment line] [test: treeview: a
U+2028 or U+2029 before the last directive of a title, with a line of spaces
after it, or a line of a directive alone or after a space] [test: treeview: a
U+2028 or U+2029 and a U+0085 around the last directive of a title, with the
text ending] [test: treeview: the whitespace between the last directive and a
comment, with a U+2028 or U+2029 before the directive and a statement right
after the line] [test: treeview: the whitespace before the last directive where
the line is the last statement of the text] [test: treeview: a run of whitespace
before the last directive follows the column of its characters] [test: treeview:
a run of whitespace before the last directive follows the column of its
characters where the line is the last statement of the text] [test: treeview: a
run that holds a tab and other whitespace before the last directive] [test:
treeview: a run that holds a tab and other whitespace before the last directive
where the line is the last statement of the text] [test: treeview: the
whitespace around a last directive that holds a line break or a semicolon, with
nothing or a mark that touches it after it] [test: treeview: the whitespace
around a last directive that holds a line break or a semicolon, with spaces or a
tab after it, or a mark after a space]

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
between `title` and a nonempty value, as Prettier prints `return  x` as
`return x;`. This gives consistent Db-equivalent outer spacing without taking a
next-line value. Follow AST boundaries for `titlex` and `title"node"`:
mermaid.js reads them as an empty title followed by the node `x` or `node`, and
a space before the node would make it the text of the title and take it out of
the tree. Title still stays written when the summary omits it. A `;` that the
line rule ignores before the first character of the value is a gap item whether
one whitespace character or more comes before it: `title  ;T` and `title ;T` are
printed alike.

[fixture: treeview/semicolons/ignored-semicolon-title-value-second-space]
[fixture: treeview/title/title-prefix] [fixture:
treeview/title/title-quoted-next]

A `title` with no text, written with whitespace before a directive or a comment
on its line, is printed with one space before the first of them, whether the
whitespace is one character or more, a tab, or, before a directive, a space and
a U+2028 or U+2029 (a title of whitespace only is a bare `title`), and with none
where nothing is written between the keyword and the directive: `title`, a
space, and `%%{init: {}}%%` is printed as it is, and `title`, three spaces, and
`%%{init: {}}%%` as the first. A U+2028 or U+2029 before a comment that joins
the next line (`title`, two spaces, the character, and `%% c`, with a row after
it) keeps the line as written, as the comment starts after the character. The
one whitespace character after the keyword is part of the keyword to mermaid.js,
so a title with no text ends at its keyword, and that character is a gap of the
line like the whitespace after a title with text.

[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`.

[fixture: title/bare-title-directive-one-space] [fixture:
title/bare-title-directive-spaces] [fixture: title/bare-title-directive-tab]
[fixture: title/bare-title-directive-touching] [fixture:
title/bare-title-comment-spaces] [fixture:
title/bare-title-unclosed-directive-spaces] [test:
treeview/title/bare-title-directive-space-and-line-separator] [test:
treeview/title/bare-title-directive-space-and-paragraph-separator] [test:
treeview/title/bare-title-directive-spaces-and-line-separator] [test:
treeview/title/bare-title-comment-after-line-separator-kept] [fixture:
treeview/title/title-shared]

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
The colon gives the diagram its one accessibility title or description, so it
touches the keyword and has one space before a nonempty value. An empty value
ends at the colon without line-end whitespace. Under
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark), these are the forms
of a key's colon and a line end. Print a run of spaces and tabs inside the value
of an `accDescr` as one space (see
[Runs of whitespace in a text that are drawn the same](./compatibility.md#runs-of-whitespace-in-a-text-that-are-drawn-the-same)),
but not that of an `accTitle`, which the browser shows as a tooltip, and retain
brace-looking line values and trivia boundaries. The common converter permits
these equivalent outer gaps. An `accDescr` run of spaces and tabs becomes one
space. The Db retains spaces and tabs inside `accTitle`, so collapsing them
changes the title. Braces after `accDescr:` are description characters, so
reading them as block delimiters removes them from the Db. Never borrow text
from the next line. Where only directives follow the text of an `accTitle:` or
`accDescr:` line, they are printed as after the text of a title, unless a
directive of the line holds a line break, a `;`, a U+2028, or a U+2029 (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)):
`accTitle: T  %%{x}%%  ` is printed `accTitle: T %%{x}%%`,
`accDescr: T  %%{x}%%  %% c` is printed `accDescr: T %%{x}%% %% c`.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`. A comment that touches the last directive
stays touching: `accDescr: T  %%{x}%%%% c` is printed `accDescr: T %%{x}%%%% c`.
In the ordinary `accTitle:` and `accDescr:` forms that end with a directive,
only line-end spaces and tabs follow it, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) selects their
removal. The table of [Title](#title) gives the other forms of these lines. They
are printed as a title is, but for a value that starts with one directive and
holds text after it, which stays as written (`accTitle: %%{x}%%  T  ` is not
changed); the gap after the colon stays.

[corpus fixture: treeview/space-acctitle-tab] [corpus fixture:
treeview/common-colon-block-priority]

[fixture: accessibility-lines/acc-directives-end-blanks-dropped] [test:
treeview/accessibility-lines/acctitle-directive-end-two-spaces] [test:
treeview/accessibility-lines/acctitle-directive-end-comment] [test:
treeview/accessibility-lines/acctitle-directive-end-u00a0] [test:
treeview/accessibility-lines/acctitle-directive-end-text-after-space] [test:
treeview/accessibility-lines/acctitle-directive-only-two-spaces-kept] [test:
treeview/accessibility-lines/accdescr-directive-end-two-spaces] [test:
treeview/accessibility-lines/accdescr-directive-end-comment] [test:
treeview/accessibility-lines/accdescr-directive-end-u00a0] [test:
treeview/accessibility-lines/accdescr-directive-end-text-after-space] [test:
treeview/accessibility-lines/accdescr-directive-only-two-spaces-kept] [test:
treeview/accessibility-lines/acctitle-directive-u3000-kept] [test:
treeview/accessibility-lines/accdescr-directive-then-text-kept] [test:
treeview/accessibility-lines/acctitle-directive-end-tab] [test:
treeview/accessibility-lines/acctitle-directive-end-two-directives] [test:
treeview/accessibility-lines/acctitle-directive-end-u3000] [test:
treeview/accessibility-lines/acctitle-directive-end-u2003] [test:
treeview/accessibility-lines/acctitle-directive-end-u0085] [test:
treeview/accessibility-lines/acctitle-directive-end-u2028] [test:
treeview/accessibility-lines/acctitle-directive-end-u2029] [test:
treeview/accessibility-lines/acctitle-directive-end-semicolon] [test:
treeview/accessibility-lines/acctitle-directive-end-text-touching] [test:
treeview/accessibility-lines/acctitle-directive-end-comment-touching] [test:
treeview/accessibility-lines/acctitle-directive-leading-then-text-kept] [test:
treeview/accessibility-lines/acctitle-directive-text-between-directives-kept]
[test: treeview/accessibility-lines/accdescr-directive-end-tab] [test:
treeview/accessibility-lines/accdescr-directive-end-two-directives] [test:
treeview/accessibility-lines/accdescr-directive-end-u3000] [test:
treeview/accessibility-lines/accdescr-directive-end-u2003] [test:
treeview/accessibility-lines/accdescr-directive-end-u0085] [test:
treeview/accessibility-lines/accdescr-directive-end-u2028] [test:
treeview/accessibility-lines/accdescr-directive-end-u2029] [test:
treeview/accessibility-lines/accdescr-directive-end-semicolon] [test:
treeview/accessibility-lines/accdescr-directive-end-text-touching] [test:
treeview/accessibility-lines/accdescr-directive-end-comment-touching] [test:
treeview/accessibility-lines/accdescr-directive-leading-then-text-kept] [test:
treeview/accessibility-lines/accdescr-directive-text-between-directives-kept]
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

Description blocks on one line follow
[A description block on one line](./compatibility.md#a-description-block-on-one-line),
also in a box, where the characters of the drawing before the keyword and
between the keyword and the `{` are redrawn, not printed. A block whose text
holds a character of the drawing, or whose opener gap the box keeps, stays a
block.

[fixture: treeview/modes/ordinary-block] [fixture:
treeview/modes/box-common-block-zero-column] [fixture:
treeview/modes/block-interior-active] [fixture:
treeview/description-blocks/box-redraw-remove-opener-prefixes] [fixture:
treeview/description-blocks/block-after-directive]

The box-character test reads the text after directives are removed, so a box
glyph inside a directive does not keep the braces.

[fixture: description-blocks/block-hidden-box-glyph]

Ordinary whitespace-only interiors become `{}`, as Prettier prints `x = { }` as
`x = {}` ([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)). A `;`
that the line rule ignores is no text either; when its written source prevents
compaction, retain the `;` and use the empty block layout.

[fixture: description-blocks/block-empty] [fixture:
description-blocks/block-ignored-semicolon-interior]

For blocks that keep their braces, put one space between `accDescr` and `{`,
even when originally touching, to distinguish the keyword from its body.
Prettier puts one space before the brace that opens a block, so plain whitespace
between `accDescr` and `{` becomes one space under
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark). Join plain opener
whitespace, align ordinary body lines one step inside the statement, and
preserve trivia contents. A separate `}` aligns with its statement.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives this depth: it
puts the closing line at the level of the line that holds the `{`, as Prettier
prints the closing line of a block, and that line is the `accDescr` line or,
where a comment or a directive stands before the `{`, a later line at the level
of the statement. The lines of the description's body text are outside the
"Lines inside a block" row of rule 1. Mermaid discards indentation after LF from
the description. The body uses the configured indentation, including tabs and
the positive minimum step at width zero. In box mode remove ordinary
keyword/opener prefixes and place the common statement at column one, while
keeping the body's authored columns: indenting a plain physical line can make
box syntax reject it. Value-owned box geometry still keeps its complete brace
span. The first effective `}` remains the closer. Unsafe removal follows Branch
prefixes, including common-value tabs. A sole mode selector in the opener gap
keeps just that gap, as described in Decorations. The whitespace before the `}`
is no text, so the `}` stays aligned with the statement in every pass, also
after a comment line.

[fixture: treeview/description-blocks/brace-on-a-later-line]

[fixture: treeview/description-blocks/block-comment-line-after-the-text]

A block with one line of text on a line of its own follows
[A description block on one line](./compatibility.md#a-description-block-on-one-line)
too, also where the text has runs of spaces and tabs.

[fixture: treeview/description-blocks/block-text-on-its-own-line-runs-collapsed]
[fixture: treeview/description-blocks/geometry-with-opener-directive]

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

[fixture: treeview/description-blocks/body-zero-width]

[fixture: treeview/description-blocks/block-directive-only]

[corpus fixture: treeview/common-block-comments]

[corpus fixture: treeview/common-block-first-close]

[corpus fixture: treeview/box-block-decoration]

[corpus fixture: treeview/box-block-tail-decoration-ascii-dash-control]

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

In indentation mode, align standalone comment lines with the next statement, or
the last statement at EOF, to show their association. A comment may move deeper
or shallower, including before a dedent; successive comments share the target
column even across blank lines.

[fixture: treeview/comments/comment-standalone-aligned] [fixture:
treeview/comments/aligned-depths] [fixture: treeview/comments/aligned-final]
[fixture: treeview/comments/aligned-blank-lines]

The aligned forms include `%% text`, `%%!`, `%%!x`, `%%%`, `%%` followed by
spaces, and `%% {x}`.

[fixture: treeview/comments/aligned-forms] [fixture:
treeview/comments/comment-mark-spliced-directive]

Use the statement's configured indentation, including tabs and the positive
minimum step at tabWidth zero.

[fixture: treeview/comments/aligned-tabs] [fixture:
treeview/comments/aligned-zero]

Comments before the header or in a body without statements stand at column one.

[fixture: treeview/comments/before-header] [fixture:
treeview/comments/only-comments]

In box mode, ordinary structural lines start at column one, before their
branches or guides. Comment lines also start there, rather than at the node's
name column: mermaid.js accepts indented comment lines, but shifting them would
misalign the starts of successive lines.

[fixture: treeview/comments/box-standalone]

Between statements, keep a line of only `%%`, a line starting with `%%{` without
being a directive, and a standalone directive at column one: mermaid.js rejects
the first two when indented in indentation mode, and with a standalone directive
indented, alone on its line and with no comment line after it, every version
that counts reads the next node as a child of the node before it, also after an
empty line, or rejects the text where no node follows (see
[Forms kept for versions of mermaid.js that count](./compatibility.md#forms-kept-for-versions-of-mermaidjs-that-count)).
A comment on the line of the directive, or a comment line after it, keeps the
next node beside the node before it whether the directive is indented or not.
Keep this distinction in mixed runs and at EOF.

[fixture: treeview/comments/standalone-directive-empty-line-after] [fixture:
treeview/comments/standalone-directive-comment-on-its-line] [fixture:
treeview/comments/standalone-directive-comment-line-after]

[fixture: treeview/comments/comment-bare-native] [fixture:
treeview/comments/native-nonword] [fixture:
treeview/comments/unclosed-directive] [fixture:
treeview/comments/mixed-directives] [fixture: treeview/comments/native-final]
[fixture: treeview/comments/standalone-directive-column-one]

Comment lines around an empty description block or a semicolon-protected title
still align with the following statement.

[fixture: treeview/comments/aligned-empty-description] [fixture:
treeview/comments/aligned-protected-title]

Keep inline comments on their line, preserving marks, contents and tails,
including native LS/PS.

[test: treeview/comments/standalone-ls] [test: treeview/comments/standalone-ps]

A comment that touches the closing quote of a name stays touching it. Every
version of mermaid.js that counts reads whitespace between the quote and the
`%%` as the indentation of the next node, also after an empty line, so that this
node becomes a child of the name; it rejects the text where no node follows and
where the next node is indented.

[fixture: treeview/comments/comment-quoted-inline] [fixture:
treeview/comments/comment-quoted-inline-final] [fixture:
treeview/comments/comment-quoted-inline-blank-line] [fixture:
treeview/comments/comment-inline-carried] [corpus fixture:
treeview/tail-quoted-space-comment] [fixture:
treeview/comments/comment-quoted-inline-indented-next] [corpus fixture:
treeview/gram-quoted-tail-space-comment-end-of-text] [corpus fixture:
treeview/gram-quoted-tail-space-comment-next-indent]

Move meaningful indentation runs once to their assigned node. In a drawable box
diagram remove a native comment's structural prefix and draw that assigned
branch once on the node's name line. The comment is not a tree child. Percent
text inside names, descriptions or blocks stays value text; common joining
regions and unsafe prefix intersections follow body retention.

[fixture: treeview/comments/comment-standalone-aligned]

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

Keep directive text and order. mermaid.js removes a directive and reads the text
on its two sides joined, so a directive that touches a name stays touching
(`A%%{init: {}}%%B` is the name `AB`, and `A%%{init: {}}%% B` is the name `A B`)
(see [Directives between tokens](./compatibility.md#directives-between-tokens)).
Within one printed line a directive in the gap of a title, an accessibility
statement, or the class after `:::` is placed as under
[Directives](./flowchart.md#directives); in the other gaps it retains contact or
separation on each side, except between directives moved to a new directive-only
line as described in [Statements one per line](#statements-one-per-line). When
units split, attach the directive to the following unit and retain its right
boundary. Standalone directives use column one. For a leading indentation unit,
keep following gaps while they fit, shorten excess from the last gap, then
supply the remaining indentation before the first directive. This preserves the
assigned indent without duplicating earlier carried runs. Multiline interiors,
value-owned forms and unfinished EOF directives remain written.

[fixture: treeview/directives/name-directive-touching-text-kept] [fixture:
treeview/directives/name-directive-then-space-text-kept] [fixture:
treeview/directives/name-space-then-directive-touching-text-kept]

With useTabs, the retained gaps and the supplied indentation of a leading
indentation unit are all printed as tabs: each character of that unit counts
once whatever its kind (see [Tabs](#tabs)).

[fixture: treeview/directives/directive-leading-use-tabs] [fixture:
treeview/directives/before-unprefixed-box-root]

[test: treeview/directives/unclosed-final-whitespace-ls]

[test: treeview/directives/unclosed-final-whitespace-ps]

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

Keep every authored semicolon. A segment that holds a kept `;` is formatted as
anywhere else, except where formatting could change which `;` the line rule
ignores. The rule reads a segment from the first `:` after `style` or `classDef`
to the last `#` before its last kept `;`, with no whitespace between the `:` and
the `#` (see [Semicolons](./flowchart.md#semicolons)), so the gaps and the
padding inside that stretch keep whether they hold whitespace, a run becoming
one space, and the rest of the segment follows the ordinary rules of this
diagram. Text that no part of the layout holds stays as written. A statement
over several lines whose lines, joined with one space or with nothing, could
change which `;` the line rule ignores keeps the text of each segment, up to its
last kept `;`, as written; any other statement over several lines is formatted
like one on a single line.

[fixture: semicolons/stretch-kept-rest-formatted] [fixture:
semicolons/no-stretch-formatted] [fixture:
semicolons/box-redraw-protected-value-on-enclosed-prefix-line]

Treeview has no grammatical semicolon and style/classDef words alone do not
freeze a line. Draw a safe outer box head around protected content, while
protected interiors and value columns remain written. The columns of the
continuation lines of a quoted name are part of the name: moving the column of
an enclosed branch changes the name in the Db (`one\n            style:#x` and
`one\n        style:#x` are two names) and the figure. Retain the whole body
when protected source row boundaries constrain parentage or when another Branch
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
This gives bounded separation while preserving parentage. Prettier keeps at most
one ordinary blank line between items and removes blank lines at the edges;
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives treeView the
same form after meaningful indentation runs move. Keep value, directive and
comment-region interiors unchanged; Unicode-only names are not ordinary blank
lines. Body-retained diagrams keep their source boundaries.

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

The spaces and tabs at the end of a line are left out where the line ends with a
bare name or a description: mermaid.js trims the name and the description of a
node, so the Db and the figure are the same without them. A description of
spaces and tabs only, the whitespace inside a quoted name, the text of a
standalone comment, and every other whitespace character stay as written. The
gap before a directive that follows a name or a description is one space in the
indented form and in the form with branch characters: mermaid.js removes the
directive before it reads the value and drops the spaces and tabs at the end of
the value, so the gap is in neither the Db nor the figure, and `R   %%{x}%%` is
printed `R %%{x}%%`, the form of a title. Several directives are printed as at
the end of a title (see
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)):
`R   %%{x}%%   %%{y}%%  ` is printed `R %%{x}%% %%{y}%%`.

[fixture: trailing-whitespace/directives-end-blanks-dropped]

A directive that holds a line break or a `;` ends a name or a description like
any other: it may stand last, or touch the directives after it, with spaces and
tabs after the last of them. `R  %%{init: {a;b}}%%` with a space and a tab after
it is printed `R %%{init: {a;b}}%%`, as it is without them, since mermaid.js
removes a directive before it reads the value, and the form with branch
characters prints the same. A space or a tab that separates such a directive
from a directive after it makes it part of the name or the description, whose
spaces and tabs stay as written: `R  %%{init: {`, a line break, `}}%%`, a space,
and `%%{x}%%` is printed with its two spaces, without the spaces and tabs after
the last directive. A no-break space or a line separator after such a directive
is a character of the text and stays as written, and a directive that holds a
U+2028 or U+2029 holds no line break: the line stays as written, apart from the
spaces and tabs at its end.

[fixture: trailing-whitespace/directive-semicolon-end-blanks-dropped] [fixture:
trailing-whitespace/directive-unclosed-end-runs-collapsed] [fixture:
trailing-whitespace/directive-lines-end-comment-at-end-of-text-kept] [fixture:
trailing-whitespace/directive-lines-end-comment-line-at-end-of-text] [fixture:
trailing-whitespace/node-named-end-directive-lines-end-blanks-dropped] [fixture:
trailing-whitespace/directive-lines-end-blanks-dropped] [fixture:
trailing-whitespace/directive-lines-semicolon-end-blanks-dropped] [fixture:
trailing-whitespace/directive-lines-nested-end-blanks-dropped] [fixture:
trailing-whitespace/description-directive-semicolon-end-blanks-dropped]
[fixture: trailing-whitespace/description-directive-lines-end-blanks-dropped]
[fixture: trailing-whitespace/directive-lines-touching-end-blanks-dropped]
[fixture: trailing-whitespace/directives-lines-touching-end-blanks-dropped]
[fixture:
trailing-whitespace/directive-then-directive-semicolon-end-blanks-dropped]
[fixture: trailing-whitespace/directive-lines-before-directive-runs-kept]
[fixture: trailing-whitespace/box-directive-lines-end-blanks-dropped] [test:
treeview: spaces and tabs after a directive over lines with a CRLF] [test:
treeview: U+00A0 after a directive over lines stays] [test: treeview: U+00A0
after a directive with a `;` stays] [test: treeview: U+00A0 after a directive
over lines stays after a description] [test: treeview: U+2028 after a directive
over lines stays] [test: treeview: a directive that holds U+2028 is no directive
over lines] [test: treeview: a directive that holds U+2029 is no directive over
lines]

At the end of a name or a description, U+2028 and U+2029 are characters of the
text and no spaces or tabs: the spaces after one are left out, and the spaces
before it stay. A name retains U+2028 and U+2029 and the spaces before them as
characters in the Db, so removing them changes the name. Under
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark), only the spaces and
tabs after the separator at the end of the line are removed.

[corpus fixture: treeview/boundary-bare-ls] [corpus fixture:
treeview/boundary-bare-ps] [corpus fixture: treeview/db-bare-internal-space]

[test: treeview/trailing-whitespace/spaces-after-trailing-line-separator] [test:
treeview/trailing-whitespace/description-spaces-after-trailing-line-separator]

Move structural carried runs once. Common line values use shared outer trimming;
a branch-line tail already excluded from the value is removed rather than
carried. A branch-line tail lies outside both the value and the indentation
carried to the next node, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) removes it as
whitespace at the end of the line. Adding a branch that would newly trim an
owned tail retains the body. This avoids confusing value text with structural
padding; significant fixture tails are not shown in code blocks.

[fixture: treeview/trailing-whitespace/trailing-bare-dropped]

[fixture: treeview/trailing-whitespace/trailing-description-dropped]

[fixture: treeview/trailing-whitespace/trailing-description-blank-kept]

[fixture: treeview/trailing-whitespace/trailing-directive-gap-one-space]

[fixture: treeview/carried-indentation/box-redraw-carried-run-directive-gap]

[fixture: treeview/comments/box-redraw-comment-prefix-directive-gap]

[fixture: treeview/trailing-whitespace/trailing-quoted-interior]

[fixture: treeview/trailing-whitespace/trailing-comment-kept]

[corpus fixture: treeview/box-trim-unicode-tail]

[corpus fixture: treeview/box-tail-branch-no-carry]

[fixture: treeview/tabs/box-redraw-description-tail-dropped]

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
formatter. The YAML between the `---` lines is printed as Prettier prints YAML
anywhere, with `key: value` for the colon of a key
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark); see
[Which kind a colon is](./printed-form.md#which-kind-a-colon-is)), as under
[flowchart](./flowchart.md#frontmatter-yaml). Retain indented fences, closer
padding, malformed YAML, HTML quote hazards and fence-producing bodies. Nested
values and scalars use at least one space at tabWidth zero. Ordinary pre-header
trivia uses root placement; a second-scan Comment and its inner Root directive
print once. Body `---` stays a name, and rejected retained YAML is never
promoted or repaired.

[fixture: treeview/frontmatter-yaml/frontmatter-safe] [fixture:
treeview/frontmatter-yaml/frontmatter-colon-spacing]

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
than ASCII indentation. Unicode spaces in a bare name stay as written because
mermaid.js reads them as name characters in its Db. Replacing them with ASCII
indentation changes the name and can change the parent. The host
removes/restores a leading BOM with the shared frontmatter limitation.

[corpus fixture: treeview/space-indent-nbsp]

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

The body stays as written where drawing a branch would give one to a node whose
text ends at a U+2028 or U+2029 that a comment or a directive follows, with only
whitespace between: the name of a node or its description, a class or an icon. A
node without a branch reads the character as the last character of its text, and
a node with one reads it as whitespace before the comment or the directive,
which the printer puts on a line of its own or leaves out at the end of the
text, so the second formatting would read the line differently from the first
and the drawing differs: `├── a`, `b`, the character, `%%{x}%%`, a blank line,
and `└── c` stay as they are. A node that has a branch already, a body where no
node gets one, a node that the character does not end, a node whose directive is
followed by a `;`, and a node whose comment is followed by a row on the next
line are formatted as before.

[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-directive-comment]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-comment]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-touching]
[test:
treeview/line-terminators-and-unicode/branch-added-name-paragraph-separator-comment]
[test:
treeview/line-terminators-and-unicode/branch-added-class-line-separator-directive-comment]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-comment-at-end]
[test:
treeview/line-terminators-and-unicode/prefixed-name-line-separator-directive-comment-own-line]
[test:
treeview/line-terminators-and-unicode/no-branch-added-name-line-separator-comment]
[test:
treeview/line-terminators-and-unicode/branch-added-without-line-separator-redrawn]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-comment-row-follows]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-directive]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-directive-at-end]
[test:
treeview/line-terminators-and-unicode/branch-added-name-paragraph-separator-directive]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-spaces-directive]
[test:
treeview/line-terminators-and-unicode/branch-added-name-spaces-line-separator-directive]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-two-directives]
[test:
treeview/line-terminators-and-unicode/branch-added-description-line-separator-comment]
[test:
treeview/line-terminators-and-unicode/branch-added-description-line-separator-directive]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-comment-directive-line-follows]
[test:
treeview/line-terminators-and-unicode/branch-added-name-line-separator-directive-semicolon]

### Source order

Keep every authored node, name, annotation, common assignment and shared trivia
in source order, including duplicates, empty values and overwritten assignments.
Repeated names stay in source order because mermaid.js creates a separate Db
node for each occurrence; dropping a duplicate removes a node. An empty final
common assignment suppresses the earlier value, so it stays even though its
value is empty. A line containing only `│` does not select box mode: mermaid.js
reads it as a node in indentation mode, so dropping the line removes that node
from the Db. Redraw only structural box forms and relocate eligible prefixed
annotations and their decoration as described above. Preserve arbitrary prefix
text and value-owned box spellings; the normalized Db is not a source-text
replacement. Structural weight, dash count, sibling marks and ordinary outer
decoration are deliberately reselected to show the read forest.

[corpus fixture: treeview/db-duplicate-names] [corpus fixture:
treeview/common-repeat-empty]

[corpus fixture: treeview/box-decoration-only]

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
exceptions. Prettier removes the spaces and tabs at the end of a line in
JavaScript, CSS, YAML, and Markdown, and YAML keeps every other whitespace
character there, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives the removal of the spaces and tabs after the last character of an open
directive. TreeView reads an open directive up to its last character that is no
whitespace on a line of its own, on the line after a brace description block,
and on the line of a node (a quoted name or a bare name), of a description
(`## d`), of an icon, of a title, of an `accTitle:` or `accDescr:` line, of a
class after `:::`, and of a node in box mode. After a quoted name or after a
class the directive has to touch it: written after a space it is rejected.
U+2028, U+2029, U+0085, U+180E, and U+200B are no whitespace here. The
whitespace after that character is dropped: U+0009 to U+000D (the tab, LF, the
vertical tab, the form feed, and CR), U+0020, U+00A0, U+1680, U+2000 to U+200A,
U+202F, U+205F, U+3000, and U+FEFF, and with them the empty lines. One line
break ends the text; nothing is added only where the text ends right after the
character and it is no U+2028 or U+2029. Prettier ends a file with one line
break, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
final line break that follows an unfinished directive once its trailing
whitespace is removed. `%%{unfinished` and two spaces print `%%{unfinished` and
a line break, `%%{unfinished` and U+2028 print `%%{unfinished`, U+2028, and a
line break, and `"R"%%{unfinished` and two spaces print `"R"%%{unfinished` and a
line break. Prettier ends a file with one line break, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the final line
break after an unfinished directive that ends in U+2028 or U+2029, and after one
that touches a quoted node name. Rejected unused indentation runs are not
trimmed into accepted input.

[fixture: treeview/final-newline/eof-node] [fixture:
treeview/final-newline/eof-open-directive] [fixture:
treeview/final-newline/eof-open-directive-trailing-blanks] [test:
treeview/final-newline/open-directive-nothing-after] [test:
treeview/final-newline/open-directive-two-spaces] [test:
treeview/final-newline/open-directive-tab] [test:
treeview/final-newline/open-directive-no-break-space] [test:
treeview/final-newline/open-directive-u3000] [test:
treeview/final-newline/open-directive-bom] [test:
treeview/final-newline/open-directive-vertical-tab] [test:
treeview/final-newline/open-directive-form-feed] [test:
treeview/final-newline/open-directive-line-break] [test:
treeview/final-newline/open-directive-crlf] [test:
treeview/final-newline/open-directive-spaces-line-break] [test:
treeview/final-newline/open-directive-empty-lines] [test:
treeview/final-newline/open-directive-line-break-spaces] [test:
treeview/final-newline/open-directive-u2028] [test:
treeview/final-newline/open-directive-u2029] [test:
treeview/final-newline/open-directive-space-u2028] [test:
treeview/final-newline/open-directive-u2028-space] [test:
treeview/final-newline/open-directive-nel] [test:
treeview/final-newline/open-directive-zero-width-space] [test:
treeview/final-newline/open-directive-u1680] [test:
treeview/final-newline/open-directive-u2000] [test:
treeview/final-newline/open-directive-u200a] [test:
treeview/final-newline/open-directive-u202f] [test:
treeview/final-newline/open-directive-u205f] [test:
treeview/final-newline/open-directive-after-node-u2029] [test:
treeview/final-newline/open-directive-after-node-u0085] [test:
treeview/final-newline/open-directive-after-node-u180e] [test:
treeview/final-newline/open-directive-after-node-u2003] [test:
treeview/final-newline/open-directive-after-title-two-spaces] [test:
treeview/final-newline/open-directive-after-title-u2029] [test:
treeview/final-newline/open-directive-after-acctitle-two-spaces] [test:
treeview/final-newline/open-directive-after-acctitle-u2029] [test:
treeview/final-newline/open-directive-after-accdescr-two-spaces] [test:
treeview/final-newline/open-directive-after-accdescr-u2029] [test:
treeview/final-newline/open-directive-after-class-two-spaces] [test:
treeview/final-newline/open-directive-after-description-two-spaces] [test:
treeview/final-newline/open-directive-after-icon-two-spaces] [test:
treeview/final-newline/open-directive-after-description-block-two-spaces] [test:
treeview/final-newline/open-directive-after-box-node-two-spaces] [test:
treeview/final-newline/open-directive-after-class-u2029] [test:
treeview/final-newline/open-directive-after-quoted-name-space-rejected] [test:
treeview/final-newline/open-directive-after-class-space-rejected] [test:
treeview/final-newline/open-directive-after-node-no-break-space] [test:
treeview/final-newline/open-directive-after-node-u3000] [test:
treeview/final-newline/open-directive-after-node-bom] [test:
treeview/final-newline/open-directive-after-node-vertical-tab] [test:
treeview/final-newline/open-directive-after-node-form-feed] [test:
treeview/final-newline/open-directive-after-node-u1680] [test:
treeview/final-newline/open-directive-after-node-u2000] [test:
treeview/final-newline/open-directive-after-node-u200a] [test:
treeview/final-newline/open-directive-after-node-u202f] [test:
treeview/final-newline/open-directive-after-node-u205f] [test:
treeview/final-newline/open-directive-after-bare-node-two-spaces] [test:
treeview/final-newline/open-directive-u180e] [test:
treeview/final-newline/open-directive-u2003] [test:
treeview/final-newline/open-directive-after-node-nothing-after] [test:
treeview/final-newline/open-directive-after-node-two-spaces] [test:
treeview/final-newline/open-directive-after-node-tab] [test:
treeview/final-newline/open-directive-after-node-u2028] [test:
treeview/final-newline/open-directive-after-node-line-break-spaces]

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
list and quote columns. Do not add host columns to value continuations. The
columns of the continuation lines of a quoted name are part of the name in the
Db, and the figures differ with them: `"first\n last"` and `"first\n   last"`
are two names, so a host column added there would change the name. Test host
output/idempotence separately from the payload Db. The host can trim padding on
the final code line, limiting authored-byte preservation; quoted interior
padding stays inside the quotes. Rejected fences follow the host route, which
can also trim source padding.

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

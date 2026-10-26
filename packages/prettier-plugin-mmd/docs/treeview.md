# Treeview formatting rules

Japanese version: [treeview.ja.md](./treeview.ja.md)

How prettier-plugin-mmd formats `treeView-beta`. The
[syntax](../../spec/docs/diagrams/treeview.md) and
[source tree](../../spec/docs/ast/treeview.md) define its reading. The printer
uses shared blocks, atoms, gaps, common layouts and root handling; the flat body
supplies the mode and forest column plan. Inputs the parser rejects are reported
as syntax errors in standalone files and left to the Markdown host in fences.
See [compatibility](./compatibility.md).

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

Keep the original indentation or box-drawing mode. Apply the syntax
specification’s mode test to logical LF lines after the header: exclude
whitespace-only, comment-shaped, metadata-shaped and vertical-only lines, then
look for `─━│┃└┗├┣` anywhere in a remaining line, including inside quotes or
blocks. Prefix nodes alone cannot decide this. In box mode preserve physical
node lines and columns, including branchless roots, while ordinary common
statements and their block closers use column one. Prefix-following common and
annotation components use the same inline rules as indentation mode; adding a
body step could reject mixed indentation.

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

### Branch prefixes

Keep each prefix’s source span, leading column, separator padding, light/heavy
spelling and dash run. The first positive branch column determines the width, or
four when absent; depth is `round(column / width) + 1`, with halves upward.
Columns count UTF-16 units and tabs as four spaces. Changing columns or choosing
the smallest width can change parentage, so do not normalize this geometry; a
dash after separator spaces remains content.

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

Input (escaped): `"treeView-beta\na\n \u2517\u2501\u2501 \u2500content\n"`.

Output
([branch-prefixes/dash-content-output.mmd](../tests/fixtures/treeview/branch-prefixes/dash-content-output.mmd)):

```mmd
treeView-beta
a
 ┗━━ ─content
```

### Decorations

Print each decoration once from its source span at its AST owner: body,
pending-name gap, annotation gap or block-opener gap. Preserve exterior columns
and physical boundaries. Enclosed forms stay inside their value leaf. Even
Db-ignored decoration can select box mode, so deleting or moving it is unsafe.

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

### Indentation

In indentation mode derive the forest from assigned AST indents: close open
nodes whose indent is greater than or equal to the new node’s, then push every
node, including files. Print roots at one configured step and children one step
beyond their parent. A space step is `max(1, tabWidth)`; useTabs uses one tab.
This selects a uniform Db-equivalent width even for a deep first node, later
shallower roots, irregular increments, duplicate names and empty names.

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

Use the AST’s assigned indent to move a run after a quote, class, icon or
whitespace-only line once to the next node’s planned column. Do not retain a
second copy of that run. A branch line’s excluded tail does not carry, while
intervening decoration does not clear an ordinary pending run. This preserves
parentage across hidden LF.

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

### Tabs

Count ordinary indentation spaces and tabs once each; normalize only those
structural columns. Keep tabs inside authored values and box lines. Expanding
ordinary tabs to tab stops can change parentage, while replacing value tabs
loses authored text.

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
	└─ b	c
```

### Statements one per line

Split ordinary same-line nodes into separate lines in source order, using their
assigned indentation, including quoted/quoted, quoted/bare and icon-suffix
nodes. This chooses readable boundaries without changing the forest.
Quote-looking text inside a bare name stays inside that name. Box geometry and
semicolon protection take precedence.

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

Input (escaped): `"treeView-beta\n\"A\"\"B\"'C'\n"`.

Output
([statements-one-per-line/adjacent-quoted-output.mmd](../tests/fixtures/treeview/statements-one-per-line/adjacent-quoted-output.mmd)):

```mmd
treeView-beta
  "A"
  "B"
  'C'
```

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

Keep a later-line annotation on a later line and align it with its owning node,
retaining positive leading whitespace in indentation mode. Do not join across
descriptions, comments or multiline names. This is a consistent choice among
Db-equal joins and avoids absorbing annotation text into a description. Prefixes
and decorations retain their box geometry.

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

Keep quoted-name continuation columns, internal blank lines and LS/PS as
authored. Only the first node line takes the planned indentation. Box prefixes
and decorations enclosed by a value remain in that value. Reindentation, joining
or wrapping introduces different name characters or changes physical box
reading.

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

### Description blocks

Use shared description-block layout: whitespace-only interiors become `{}`;
touching edges stay touching and existing ordinary edge padding becomes one
space. Join plain opener whitespace. Keep nonempty continuation columns,
internal blank lines and comment/directive-only interiors; align a separate
closer with its statement. These Db-equivalent edges follow the other diagrams.
In box mode ordinary blocks and closers use column one; blocks with owned
prefixes/decorations or enclosed box geometry keep their source span, because
moving those physical lines can reject. The first effective `}` remains the
closer.

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

### Comments

Put ordinary standalone comment marks at column one and keep inline comments on
their line. Preserve marks, contents, tails and source ownership; native
comments run through LS/PS to LF. A meaningful run before a comment moves to its
next node once, so the comment may touch the preceding token. Percent text
enclosed by names, descriptions or blocks stays value text. Box-prefixed
comments and common joining regions retain their source boundaries.

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

### Directives

Keep directive text and order. Within one printed line retain contact or
separation on each side; when units split, attach the directive to the following
unit and retain its right boundary. Standalone directives use column one. For a
leading indentation unit, keep following gaps while they fit, shorten excess
from the last gap, then supply the remaining indentation before the first
directive. This preserves the assigned indent without duplicating earlier
carried runs. Multiline interiors, value-owned forms and unfinished EOF
directives remain written.

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

Keep every authored `;` through shared textual-prefix and kept-line protection.
Treeview has no grammatical semicolon, so style/classDef words alone do not
freeze a line. A protected first line uses its planned body column; interiors
and later lines remain written. If fixed node boundaries constrain the forest,
retain the body as written, including its ending; a single line of zero-indent
roots needs no forest fallback. This keeps shared semicolon selection and
parentage together without predicting a second line-rule model.

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

### Blank lines

Keep at most one ordinary ASCII blank line between items and remove ordinary
edge blanks. Move any meaningful whitespace-only run to its assigned node first.
This bounds visual separation without changing the forest. Keep
value/directive/comment-region interiors and box physical boundaries;
Unicode-only names are not ordinary blank lines.

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

### Trailing whitespace

Decide by owner: retain authored bare-name, description, quoted-interior,
comment and directive tails. Structural carried runs move once; common line
values use shared outer trimming and excluded branch tails keep their box
spelling. A blanket trim would erase authored values or change the next node’s
parent. Significant tails are visible in the fixture files rather than code
blocks.

[fixture: treeview/trailing-whitespace/trailing-bare-kept]

[fixture: treeview/trailing-whitespace/trailing-description-kept]

[fixture: treeview/trailing-whitespace/trailing-quoted-interior]

[fixture: treeview/trailing-whitespace/trailing-comment-kept]

[corpus fixture: treeview/box-trim-unicode-tail]

[corpus fixture: treeview/box-tail-branch-no-carry]

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

Keep all authored occurrences and order: duplicate/empty names, overridden
annotations, empty common assignments, unrendered titles, prefix spelling and
decoration. The normalized Db omits some syntax and cannot reconstruct it.
Sorting, deduplication or dropping empty resets can also change its reading.

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

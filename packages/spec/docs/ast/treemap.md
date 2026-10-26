# Treemap nodes

Japanese version: [treemap.ja.md](./treemap.ja.md)

This document defines the source tree of `treemap` and `treemap-beta`. Shared
nodes and invariants are in [ast.md](../ast.md);
[diagrams/treemap.md](../diagrams/treemap.md) defines syntax and acceptance.
Fields keep authored values, optional fields remain present as null, lists
preserve source order, and child fields specify visitor order. [fixture:
treemap/gram-written-tree] [fixture: treemap/db-empty-names] [fixture:
treemap/common-repeat-empty]

The body stays flat: source indentation is kept once on each section, leaf and
class definition, without synthesizing parents, depths or children. Common
statements and class definitions can stand between a parent section and a later
child. The [parent rule](../diagrams/treemap.md#indentation-and-parents) defines
their interpretation; the
[tests summary](../../../tests/docs/db-summaries.md#treemap) defines the derived
forest. [fixture: treemap/gram-written-tree] [fixture:
treemap/common-block-empty-interleaved] [fixture: treemap/db-class-indented]
[fixture: treemap/db-leaf-closes-open-sections]

StringLiteral.value is the authored interior without common trivia, with no
escape decoding; raw retains both original quotes and every intervening source
character, including directives and source line endings. Empty strings stay
nodes and closed is true. NumericLiteral uses this position's
[numeric definition](../ast.md#numericliteral), keeping its entire spelling in
raw. Identifiers retain the authored class/selector name. [fixture:
treemap/lex-string-conversion] [fixture: treemap/line-name-values] [fixture:
treemap/lex-string-backslash-line-feed] [fixture: treemap/db-empty-names]
[fixture: treemap/gram-name-directive-only] [fixture:
treemap/directive-name-middle] [fixture: treemap/db-number-comma] [fixture:
treemap/db-number-underscore] [fixture: treemap/db-number-multiple-dots]
[fixture: treemap/db-number-nan] [fixture: treemap/db-number-rounded] [fixture:
treemap/db-number-overflow] [fixture: treemap/gram-selector-underscore]

## Nodes

### TreemapDiagram

| Field  | Type                    | Meaning                                   |
| ------ | ----------------------- | ----------------------------------------- |
| `body` | list of TreemapBodyItem | Every written statement, in source order. |

Child fields: body. Range: the header start through the last written body
statement, or the header end when body is empty; exclude outer padding, native
comments and appended LF beyond that endpoint. Root.diagramType is `treemap`.
Header aliases stay in their keyword tokens; there is no alias field or header
node. [fixture: treemap/header-beta] [fixture:
treemap/spec-treemap-test-ts-892fa294] [fixture: treemap/gram-written-tree]
[fixture: treemap/hidden-comment-eof] [fixture: treemap/comment-bare]

TreemapBodyItem is TreemapSection, TreemapLeaf, TreemapClassDefStatement,
TreemapTitleStatement, TreemapAccTitleStatement, TreemapAccDescrStatement or
TreemapAccDescrBlockStatement. Preserve repetitions and empty common forms
individually, rather than only their final publication values. Empty lines and
Comments create no body items. The body may be empty. Native comments use shared
Comment records; there is no TreemapIgnoredText or hidden-gap field. [fixture:
treemap/gram-written-tree] [fixture: treemap/common-repeat] [fixture:
treemap/common-repeat-empty] [fixture: treemap/common-block-empty-interleaved]
[fixture: treemap/comment-bare] [fixture: treemap/spec-treemap-test-ts-892fa294]
[fixture: treemap/detect-second-scan-single-line-comment] [fixture:
treemap/comment-second-scan-shaped-body]

### TreemapSection

| Field           | Type                | Meaning                                    |
| --------------- | ------------------- | ------------------------------------------ |
| `indent`        | nonnegative integer | The row-leading ASCII space/tab count.     |
| `name`          | StringLiteral       | The quoted name, including an empty name.  |
| `classSelector` | Identifier or null  | The name after `:::`, or null when absent. |

Child fields: name, classSelector. Range: the opening name quote through its
closing quote, or through the selector when present. Do not include preceding
row indentation. A section has no numeric value or children field, even when the
derived forest has children or no children. [fixture: treemap/gram-written-tree]
[fixture: treemap/db-empty-names] [fixture: treemap/db-indent-pop] [fixture:
treemap/gram-adjacent-sections]

indent counts each ASCII space/tab once after common removals. It is not a
depth. The run may be on the preceding line or a whitespace-only line, and
source tabs are not expanded. A directive inside the run joins the parts for
counting; the original whitespace spelling remains source text outside this
node's range. [fixture: treemap/db-tabs-count] [fixture:
treemap/db-section-tail-space] [fixture: treemap/db-leaf-tail-tab] [fixture:
treemap/gram-indent-from-whitespace-line] [fixture:
treemap/gram-indent-around-global-directive]

### TreemapLeaf

| Field           | Type                | Meaning                                    |
| --------------- | ------------------- | ------------------------------------------ |
| `indent`        | nonnegative integer | The row-leading ASCII space/tab count.     |
| `name`          | StringLiteral       | The quoted name, including an empty name.  |
| `value`         | NumericLiteral      | The written leaf number.                   |
| `classSelector` | Identifier or null  | The name after `:::`, or null when absent. |

Child fields: name, value, classSelector. Range: the opening name quote through
the number, or through the selector when present. Do not include the preceding
row indentation. The colon/comma separator remains punctuation, not a field;
both forms use this type. Keep numeric spelling and any source gap between
components without turning them into children. [fixture:
treemap/gram-written-tree] [fixture: treemap/gram-comma-separator] [fixture:
treemap/gram-spaced-leaf] [fixture: treemap/gram-leaf-newlines-around-separator]
[fixture: treemap/comment-value-selector-gap] [fixture: treemap/db-number-comma]

indent counts each ASCII space/tab once after common removals. It is not a
depth. The run may be on the preceding line or a whitespace-only line, and
source tabs are not expanded. A directive inside the run joins the parts for
counting; the original whitespace spelling remains source text outside this
node's range. [fixture: treemap/db-tabs-count] [fixture:
treemap/db-section-tail-space] [fixture: treemap/db-leaf-tail-tab] [fixture:
treemap/gram-indent-from-whitespace-line] [fixture:
treemap/gram-indent-around-global-directive]

### TreemapClassDefStatement

| Field    | Type                   | Meaning                                |
| -------- | ---------------------- | -------------------------------------- |
| `indent` | nonnegative integer    | The row-leading ASCII space/tab count. |
| `name`   | Identifier             | The class definition name.             |
| `style`  | TreemapLiteral or null | Whole authored style text, or null.    |

Child fields: name, style. Range: classDef through its terminating semicolon
when that unit is present, otherwise through the style's last character, or the
class name when style is null. Exclude row-leading indentation and separating
whitespace beyond the last written component. A semicolon ignored by the common
line rule is not a terminating unit and does not extend the range. [fixture:
treemap/gram-written-tree] [fixture: treemap/gram-class-empty-with-semicolon]
[fixture: treemap/db-class-empty] [fixture: treemap/db-style-whitespace]
[fixture: treemap/style-fields]

Keep indent with the same counting rule as section/leaf rows even though a class
definition does not participate in parentage. name has at least two characters
under this position's grammar. style excludes the maximal separator whitespace
after the name and the terminating semicolon; its content may be empty only as
null. A directive-only style also gives null. Keep its original commas, escaped
commas, quotes, percent text, U+2028/U+2029 and trailing whitespace in one
literal; do not split or merge definitions. [fixture: treemap/db-class-indented]
[fixture: treemap/gram-class-name-two-characters] [fixture:
treemap/gram-class-whitespace-style-null] [fixture:
treemap/directive-class-only-style-null] [fixture:
treemap/db-class-escaped-comma] [fixture: treemap/hidden-comment-class]
[fixture: treemap/line-class-ls] [fixture: treemap/line-class-ps] [fixture:
treemap/db-style-whitespace] [fixture: treemap/db-class-repeat]

A style may start on a later line and enclose what looks like another node or
class definition. Those characters remain this literal; do not synthesize an
additional statement. A following row after a completed class definition instead
remains a separate body item, including a row whose indentation came after the
semicolon. [fixture: treemap/lex-class-style-takes-next-class] [fixture:
treemap/lex-class-style-crosses-blank-line] [fixture:
treemap/comment-region-in-class-style-gap] [fixture:
treemap/gram-class-semicolon-glued-node] [fixture: treemap/db-class-tail-space]

### TreemapTitleStatement

| Field   | Type                   | Meaning                    |
| ------- | ---------------------- | -------------------------- |
| `value` | TreemapLiteral or null | The authored common value. |

value begins after title and exactly one ASCII space/tab; retain any remaining
padding. It is null without a separator or when no content remains after common
removals. A second space/tab is a whitespace literal. [fixture:
treemap/common-title-eof] [fixture: treemap/common-title-one-space] [fixture:
treemap/common-title-one-tab] [fixture: treemap/common-title-two-spaces]
[fixture: treemap/common-title-directive-only] [fixture:
treemap/gram-title-empty-before-glued-node]

Child fields: value. Range: title through the last value character, or through
title when null. Exclude preceding keyword padding, outside trivia and
statement-ending line breaks. Keep every occurrence independently, including
empty or overwritten occurrences. Comments are shared records and no hidden
suffix field is added. [fixture: treemap/common-title-eof] [fixture:
treemap/common-title-one-space] [fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-two-spaces] [fixture:
treemap/common-title-directive-only] [fixture:
treemap/gram-title-empty-before-glued-node] [fixture:
treemap/common-repeat-empty] [fixture: treemap/gram-written-tree]

### TreemapAccTitleStatement

| Field   | Type                   | Meaning                    |
| ------- | ---------------------- | -------------------------- |
| `value` | TreemapLiteral or null | The authored common value. |

value is line text immediately after the colon, retaining padding at both ends.
It is null only when no content remains after common removals; whitespace-only
content is a literal. [fixture: treemap/common-acctitle-eof] [fixture:
treemap/common-acctitle-whitespace-only] [fixture:
treemap/common-line-whitespace] [fixture:
treemap/common-acctitle-next-statement]

Child fields: value. Range: accTitle through its colon when null, otherwise
through the last value character. Exclude preceding keyword padding, outside
trivia and statement-ending line breaks. Keep every occurrence independently,
including empty or overwritten occurrences. Comments are shared records and no
hidden suffix field is added. [fixture: treemap/common-acctitle-eof] [fixture:
treemap/common-acctitle-whitespace-only] [fixture:
treemap/common-line-whitespace] [fixture:
treemap/common-acctitle-next-statement] [fixture: treemap/common-repeat-empty]
[fixture: treemap/gram-written-tree]

### TreemapAccDescrStatement

| Field   | Type                   | Meaning                    |
| ------- | ---------------------- | -------------------------- |
| `value` | TreemapLiteral or null | The authored common value. |

value is line text immediately after the colon, retaining padding at both ends.
It is null only when no content remains after common removals. Brace-looking
text after the colon remains a line value. [fixture:
treemap/common-description-eof] [fixture:
treemap/common-description-whitespace-only] [fixture:
treemap/common-accdescr-colon-block-priority] [fixture:
treemap/common-line-whitespace]

Child fields: value. Range: accDescr through its colon when null, otherwise
through the last value character. Exclude preceding keyword padding, outside
trivia and statement-ending line breaks. Keep every occurrence independently,
including empty or overwritten occurrences. Comments are shared records and no
hidden suffix field is added. [fixture: treemap/common-description-eof]
[fixture: treemap/common-description-whitespace-only] [fixture:
treemap/common-accdescr-colon-block-priority] [fixture:
treemap/common-line-whitespace] [fixture: treemap/common-repeat-empty] [fixture:
treemap/gram-written-tree]

### TreemapAccDescrBlockStatement

| Field   | Type                   | Meaning                    |
| ------- | ---------------------- | -------------------------- |
| `value` | TreemapLiteral or null | The authored common value. |

value is the brace interior with common Notation whitespace removed only at its
outer ends. Preserve internal padding, line endings, quotes and backslashes.
Empty, whitespace-only, directive-only or comment-region-only content gives
null. The first closing brace is required; an empty block still makes a
statement, so no closed field is needed. [fixture:
treemap/common-block-whitespace] [fixture: treemap/line-block-values] [fixture:
treemap/common-block-whitespace-only] [fixture:
treemap/common-block-empty-interleaved] [fixture:
treemap/common-block-directive-only] [fixture:
treemap/common-block-comment-only] [fixture: treemap/common-block-open]
[fixture: treemap/common-block-escaped-close]

Child fields: value. Range: accDescr through the first closing brace, including
both delimiters even for null. Exclude preceding keyword padding, outside trivia
and statement-ending line breaks. Keep every occurrence independently, including
empty or overwritten occurrences. Comments are shared records and no hidden
suffix field is added. [fixture: treemap/common-block-whitespace] [fixture:
treemap/line-block-values] [fixture: treemap/common-block-whitespace-only]
[fixture: treemap/common-block-empty-interleaved] [fixture:
treemap/common-block-directive-only] [fixture:
treemap/common-block-comment-only] [fixture: treemap/common-block-open]
[fixture: treemap/common-block-escaped-close] [fixture:
treemap/common-repeat-empty] [fixture: treemap/gram-written-tree]

### TreemapLiteral

| Field   | Type   | Meaning                                  |
| ------- | ------ | ---------------------------------------- |
| `value` | string | The authored style or common-value text. |

No child fields. Range: the first through last source character of the value
defined above, spanning any internal common trivia. Leave common directives,
comment regions and selected semicolons out of value, but preserve every other
authored character. Source line endings, entity spelling, quotes, backslashes
and owned whitespace stay unchanged; no whitespace collapse, HTML quote
rewriting or escape decoding applies. Quote-looking common text is a literal and
need not close its quotes. Do not create an empty literal for a null field.
[fixture: treemap/db-style-whitespace] [fixture: treemap/directive-style]
[fixture: treemap/directive-title] [fixture: treemap/common-block-directive]
[fixture: treemap/common-block-comment] [fixture: treemap/style-fields]
[fixture: treemap/line-block-values] [fixture: treemap/common-quotes-entities]
[fixture: treemap/html-fields] [fixture: treemap/tail-title-attach] [fixture:
treemap/common-title-open-quote] [fixture: treemap/common-title-directive-only]

## Example

This authored example displays the two row kinds, both separators and quote
styles, a class definition with indentation and every common statement kind. It
also keeps an empty description block before the second leaf. [fixture:
treemap/gram-written-tree]

```mmd
treemap-beta
title Map
"Root":::aa
  "Left":1,234.5
  classDef aa fill:red,color:blue;
accDescr {}
  'Right',2:::aa
accTitle: Map
accDescr: Short
accDescr { Details }
```

TreemapDiagram.body contains nine statements in this order: title, section,
leaf, class definition, empty description block, leaf, accessibility title, line
description and nonempty description block. The two leaf indents and the class
definition indent are two; the section indent is zero. The first leaf retains
raw `1,234.5` and a colon; the second retains raw `2`, a comma, single quotes
and selector aa. Common statements and the class definition are not moved inside
the section. [fixture: treemap/gram-written-tree]

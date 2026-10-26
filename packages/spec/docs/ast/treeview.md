# Treeview nodes

Japanese version: [treeview.ja.md](./treeview.ja.md)

This document defines the source tree for `treeView`. Shared nodes and
invariants are in [ast.md](../ast.md);
[treeview syntax](../diagrams/treeview.md) defines acceptance and the direct
reading of box drawing. Optional fields are present as null, lists preserve
source order, and child fields give visitor order. [fixture:
treeview/gram-written-tree] [fixture: treeview/box-written-tree]

## Authored values

Bare node names use TreeviewIdentifier because the position allows whitespace.
Quoted names use shared StringLiteral; class names and complete icon references
use shared Identifier. Numeric-looking names are names, not numbers. No node
type is chosen from the appearance of one example. [fixture:
treeview/gram-written-tree] [fixture: treeview/db-bare-internal-space] [fixture:
treeview/ast-numeric-name]

StringLiteral.raw keeps both source quotes and every intervening character,
including common trivia. value is its authored interior without shared
directives, comment regions and selected semicolons; it does not decode escapes
or normalize line endings. Empty quoted names remain nodes, and closed is true.
[fixture: treeview/gram-written-tree] [fixture: treeview/db-empty-names]
[fixture: treeview/db-quote-conversion] [fixture:
treeview/directive-double-middle] [fixture: treeview/comment-line-in-quotes]
[fixture: treeview/text-double-crlf]

Values keep authored tabs, slashes, quotes, entity spelling and owned
whitespace. Box prefixes and decorations inside a value remain in that leaf's
spelling too, even where the lexical reading treats them as indentation or no
content. Do not overlap a shared leaf with additional prefix or decoration
children, or replace its source text by synthetic spaces. Derived values belong
to the [tests summary](../../../tests/docs/db-summaries.md#treeview). [fixture:
treeview/gram-written-tree] [fixture: treeview/entity-double] [fixture:
treeview/box-multiline-quoted] [fixture: treeview/box-quoted-decoration]
[fixture: treeview/box-trim-string-closing-quote] [fixture:
treeview/box-multiline-name-tail-trim]

## Gap ownership

TreeviewIgnoredText holds only box-decoration forms, not shared Comments,
Directives, whitespace or native YAML. There are no native hidden YAML or
directive nodes. Every retained form has one owner; the following rules apply in
source order. [fixture: treeview/box-written-tree] [fixture:
treeview/gram-body-yaml] [fixture: treeview/detect-secondscan-singleline]

Decorations after the header, between complete top-level items and after the
final item belong to Diagram.body. They do not end the common preamble. When
indentation has been read but a name is still required, intervening decorations
instead belong to Node.textBeforeName. A prefix supplying that indentation
belongs to Node.prefix even if a native comment intervenes before the name.
[fixture: treeview/box-written-tree] [fixture:
treeview/box-decoration-preamble-body] [fixture:
treeview/box-decoration-trailing-body] [fixture:
treeview/box-decoration-pending-name-gap] [fixture:
treeview/box-comment-indent-carry]

When a later annotation follows the node, decorations before that annotation
belong to its textBefore. With no following annotation they return to top-level
body. A branch that introduces an annotation belongs to that annotation's prefix
and does not alter the node's indent. Between accDescr and its block opener,
decorations and prefixes belong to textBeforeOpen. [fixture:
treeview/box-decoration-before-annotation] [fixture:
treeview/ast-annotation-prefixes] [fixture:
treeview/box-decoration-trailing-body] [fixture:
treeview/box-branch-before-block-open] [fixture:
treeview/box-decoration-before-block-open] [fixture:
treeview/box-prefix-common-block-two-prefixes]

Inside an already-open leaf, keep enclosed box forms in the leaf instead of
extracting gap nodes. Excluded decoration line endings remain source trivia
outside the decoration node; a logical appended LF is never authored syntax.
Shared comments and directives retain their independent shared ownership.
[fixture: treeview/ast-decoration-internal-and-body] [fixture:
treeview/box-physical-directive-inline] [fixture:
treeview/block-physical-comment-line] [fixture: treeview/gram-body-hidden-eof]

## Nodes

### TreeviewDiagram

| Field  | Type                     | Meaning                                       |
| ------ | ------------------------ | --------------------------------------------- |
| `body` | list of TreeviewBodyItem | All written statements and outer decorations. |

Child fields: body. Range: the header start through the final authored body
item, or the header end when body is empty. Exclude outer padding, later shared
Comments and the appended LF. Root.diagramType is `treeView`; the header stays
in its keyword unit without a separate header node. [fixture:
treeview/header-only] [fixture: treeview/gram-written-tree] [fixture:
treeview/box-decoration-trailing-body]

TreeviewBodyItem is TreeviewNode, TreeviewIgnoredText, TreeviewTitleStatement,
TreeviewAccTitleStatement, TreeviewAccDescrStatement or
TreeviewAccDescrBlockStatement. Common statements stay before the nodes.
Decorations can appear among either group. The body stays flat and records every
occurrence; do not synthesize parent/children fields or an artificial root.
Empty lines and shared Comments make no body items. [fixture:
treeview/gram-written-tree] [fixture: treeview/box-written-tree] [fixture:
treeview/box-decoration-preamble-body] [fixture: treeview/common-repeat-empty]
[fixture: treeview/comment-native]

### TreeviewNode

| Field            | Type                                | Meaning                                   |
| ---------------- | ----------------------------------- | ----------------------------------------- |
| `indent`         | nonnegative integer                 | Assigned indentation units.               |
| `prefix`         | TreeviewBranchPrefix or null        | Prefix supplying this node's indentation. |
| `textBeforeName` | list of TreeviewIgnoredText         | Decorations while the name is required.   |
| `name`           | TreeviewIdentifier or StringLiteral | The authored node name.                   |
| `annotations`    | list of TreeviewAnnotation          | All annotations in source order.          |

Child fields: prefix, textBeforeName, name, annotations. Range: the earliest
start of prefix, textBeforeName or name through the final annotation, or through
name when there is none. Exclude preceding ordinary indentation and later
whitespace belonging to another node. name is never null; an empty quoted name
is a StringLiteral with an empty value. [fixture: treeview/gram-written-tree]
[fixture: treeview/box-written-tree] [fixture:
treeview/box-comment-indent-carry] [fixture:
treeview/box-decoration-pending-name-gap] [fixture: treeview/db-empty-names]

indent counts each assigned ordinary ASCII space/tab once; a prefix supplies
four times its depth under the
[direct rule](../diagrams/treeview.md#columns-and-prefix-indentation). The
source run can precede the name on another line. With no assigned run or prefix,
indent is zero. Do not store columns, segment width or a second derived depth.
prefix is null when no prefix supplies this node, and textBeforeName is empty
when no owned decoration is present. [fixture: treeview/db-tabs-one-unit]
[fixture: treeview/db-quoted-tail-space] [fixture: treeview/box-written-tree]
[fixture: treeview/box-comment-indent-carry] [fixture:
treeview/box-decoration-pending-name-gap] [fixture: treeview/gram-written-tree]

TreeviewAnnotation is TreeviewClassAnnotation, TreeviewIconAnnotation or
TreeviewDescriptionAnnotation. Keep the list empty when no annotation is
written, otherwise keep every occurrence, including overwritten classes/icons
and empty descriptions. Leave the original slash in name; there is no nodeType
field and no hierarchy field. [fixture: treeview/gram-written-tree] [fixture:
treeview/db-repeat-class] [fixture: treeview/db-repeat-icon] [fixture:
treeview/annotation-description-repeat-empty] [fixture:
treeview/db-directory-trailing-space] [fixture: treeview/db-file-parent]

### TreeviewClassAnnotation

| Field        | Type                         | Meaning                               |
| ------------ | ---------------------------- | ------------------------------------- |
| `textBefore` | list of TreeviewIgnoredText  | Owned preceding decorations.          |
| `prefix`     | TreeviewBranchPrefix or null | A prefix introducing this annotation. |
| `name`       | Identifier                   | The authored class name.              |

Child fields: textBefore, prefix, name. Range: the first owned decoration or
prefix, otherwise `:::`, through the class name end. Exclude separating
whitespace before `:::` when it owns no preceding form. name is nonempty and
never null. Its range excludes optional padding after `:::`. [fixture:
treeview/gram-written-tree] [fixture: treeview/annotation-class-space] [fixture:
treeview/box-decoration-before-annotation] [fixture:
treeview/box-annotation-prefix]

prefix is null without an annotation-introducing branch, and textBefore is empty
without owned decorations. Preserve exact name case, underscores and dashes, and
every repeated annotation independently. The fixed `:::` marker remains
punctuation, not a name leaf or an extra field. [fixture:
treeview/gram-written-tree] [fixture: treeview/annotation-class-uppercase]
[fixture: treeview/annotation-class-hyphen] [fixture: treeview/db-repeat-class]
[fixture: treeview/box-decoration-before-annotation]

### TreeviewIconAnnotation

| Field        | Type                         | Meaning                                  |
| ------------ | ---------------------------- | ---------------------------------------- |
| `textBefore` | list of TreeviewIgnoredText  | Owned preceding decorations.             |
| `prefix`     | TreeviewBranchPrefix or null | A prefix introducing this annotation.    |
| `name`       | Identifier or null           | Whole authored icon reference, or empty. |

Child fields: textBefore, prefix, name. Range: the first owned decoration or
prefix, otherwise `icon`, through the closing `)`. name is null exactly for an
empty reference after shared removals. `icon()` still creates this annotation;
`icon(none)` has a name Identifier. No annotation means no list member.
[fixture: treeview/gram-written-tree] [fixture: treeview/db-icon-none] [fixture:
treeview/ast-icon-removal-only] [fixture: treeview/ast-annotation-prefixes]

The complete `pack:file` or `:file` spelling is one Identifier, including the
colon; do not resolve packs or split a second reference model into the tree.
prefix is null and textBefore empty when absent. Preserve every repeated
annotation and its original parentheses. [fixture: treeview/gram-written-tree]
[fixture: treeview/annotation-icon-leading-colon] [fixture:
treeview/db-repeat-icon] [fixture: treeview/ast-annotation-prefixes]

### TreeviewDescriptionAnnotation

| Field        | Type                         | Meaning                               |
| ------------ | ---------------------------- | ------------------------------------- |
| `textBefore` | list of TreeviewIgnoredText  | Owned preceding decorations.          |
| `prefix`     | TreeviewBranchPrefix or null | A prefix introducing this annotation. |
| `value`      | TreeviewLiteral or null      | Whole authored text after `##`.       |

Child fields: textBefore, prefix, value. Range: the first owned decoration or
prefix, otherwise `##`, through the final value character, or the marker end
when value is null. value begins immediately after `##`, retaining all padding
through before the line terminator. Empty or shared-removal-only content gives
null; whitespace-only content is a literal. [fixture:
treeview/gram-written-tree] [fixture: treeview/spec-parser-ab2c8458] [fixture:
treeview/db-description-empty] [fixture: treeview/ast-description-removal-only]
[fixture: treeview/ast-annotation-prefixes]

prefix is null and textBefore empty without their owned forms. Preserve later
marker-looking text inside value, U+2028/U+2029 and all separate-line
description occurrences; do not merge them or replace them with their final
sanitized value. [fixture: treeview/gram-written-tree] [fixture:
treeview/db-description-absorbs-annotations] [fixture:
treeview/text-description-ls] [fixture: treeview/text-description-ps] [fixture:
treeview/annotation-description-repeat-lines] [fixture:
treeview/annotation-description-repeat-empty] [fixture:
treeview/ast-annotation-prefixes]

### TreeviewTitleStatement

| Field    | Type                         | Meaning                           |
| -------- | ---------------------------- | --------------------------------- |
| `prefix` | TreeviewBranchPrefix or null | Prefix introducing the statement. |
| `value`  | TreeviewLiteral or null      | Authored common payload.          |

value starts after `title` and exactly one ASCII space/tab, retaining any
further padding. It is null without that separator or when no content remains
after shared removals; whitespace-only remaining content is a literal. [fixture:
treeview/gram-written-tree] [fixture: treeview/common-title-eof] [fixture:
treeview/common-title-quoted-next] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values]

Child fields: prefix, value. Range: prefix when present, otherwise `title`,
through the final payload character, or through the keyword when value is null.
Exclude preceding padding and the ending line break. prefix is null when no
branch introduces this statement. Keep empty and overwritten occurrences
individually. [fixture: treeview/gram-written-tree] [fixture:
treeview/common-title-eof] [fixture: treeview/common-title-quoted-next]
[fixture: treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values] [fixture: treeview/common-repeat-empty]
[fixture: treeview/box-common-prefix]

### TreeviewAccTitleStatement

| Field    | Type                         | Meaning                           |
| -------- | ---------------------------- | --------------------------------- |
| `prefix` | TreeviewBranchPrefix or null | Prefix introducing the statement. |
| `value`  | TreeviewLiteral or null      | Authored common payload.          |

value starts immediately after the colon, retaining all payload padding. It is
null only when no content remains after shared removals; whitespace-only content
is a literal. Quote-looking and brace-looking payload remains text. [fixture:
treeview/gram-written-tree] [fixture: treeview/common-acctitle-eof] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values]

Child fields: prefix, value. Range: prefix when present, otherwise `accTitle`,
through the final payload character, or through the colon when value is null.
Exclude preceding padding and the ending line break. prefix is null when no
branch introduces this statement. Keep empty and overwritten occurrences
individually. [fixture: treeview/gram-written-tree] [fixture:
treeview/common-acctitle-eof] [fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values] [fixture:
treeview/common-repeat-empty] [fixture: treeview/box-common-prefix]

### TreeviewAccDescrStatement

| Field    | Type                         | Meaning                           |
| -------- | ---------------------------- | --------------------------------- |
| `prefix` | TreeviewBranchPrefix or null | Prefix introducing the statement. |
| `value`  | TreeviewLiteral or null      | Authored common payload.          |

value starts immediately after the colon, retaining all payload padding. It is
null only when no content remains after shared removals; whitespace-only content
is a literal. Quote-looking and brace-looking payload remains text. [fixture:
treeview/gram-written-tree] [fixture: treeview/common-accline-eof] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values]

Child fields: prefix, value. Range: prefix when present, otherwise `accDescr`,
through the final payload character, or through the colon when value is null.
Exclude preceding padding and the ending line break. prefix is null when no
branch introduces this statement. Keep empty and overwritten occurrences
individually. [fixture: treeview/gram-written-tree] [fixture:
treeview/common-accline-eof] [fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/ast-common-removal-only-values] [fixture:
treeview/common-repeat-empty] [fixture: treeview/box-common-prefix]

### TreeviewAccDescrBlockStatement

| Field            | Type                                                  | Meaning                    |
| ---------------- | ----------------------------------------------------- | -------------------------- |
| `prefix`         | TreeviewBranchPrefix or null                          | Prefix before the keyword. |
| `textBeforeOpen` | list of (TreeviewBranchPrefix or TreeviewIgnoredText) | Owned forms before `{`.    |
| `value`          | TreeviewLiteral or null                               | Authored brace interior.   |

Child fields: prefix, textBeforeOpen, value. Range: prefix when present,
otherwise `accDescr`, through its first effective closing `}` under the lexical
rules. Both delimiters remain even with a null value. Exclude preceding padding
and later trivia. prefix is null when absent, and textBeforeOpen is empty when
no prefix or decoration lies in that required gap. [fixture:
treeview/gram-written-tree] [fixture: treeview/common-repeat-empty] [fixture:
treeview/box-decoration-before-block-open] [fixture:
treeview/box-branch-before-block-open] [fixture:
treeview/box-prefix-common-block-two-prefixes] [fixture:
treeview/box-trim-block-closing-brace]

Keep the complete authored brace interior without trimming, including its outer
whitespace, line endings, quotes, backslashes and box forms. Only empty or
shared-removal-only content gives null; whitespace-only content is a literal. A
closer is required for this node type, so it has no closed field. Retain each
empty or overwritten block independently. [fixture: treeview/gram-written-tree]
[fixture: treeview/common-repeat-empty] [fixture:
treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values] [fixture:
treeview/common-block-whitespace-raw] [fixture:
treeview/common-block-escaped-close] [fixture: treeview/box-block-decoration]

### TreeviewIdentifier

| Field  | Type   | Meaning                  |
| ------ | ------ | ------------------------ |
| `name` | string | Authored bare node name. |

No child fields. Range: the first through last character of bare-name, including
its trailing ASCII spaces/tabs and any owned Unicode whitespace. name keeps
case, quotes, punctuation and internal runs unchanged, excluding shared trivia
only. It is not empty, but it may consist of non-ASCII whitespace. A one-word
example still uses this type. [fixture: treeview/gram-written-tree] [fixture:
treeview/db-bare-internal-space] [fixture: treeview/db-bare-tail-space]
[fixture: treeview/space-line-nbsp] [fixture: treeview/box-quoted-branch]
[fixture: treeview/directive-bare-middle]

### TreeviewLiteral

| Field   | Type   | Meaning                                 |
| ------- | ------ | --------------------------------------- |
| `value` | string | Authored common or description payload. |

No child fields. Range: the first through last character of the payload defined
by its parent, spanning internal shared trivia. value omits shared directives,
comment regions and selected semicolons, retaining all other authored text and
owned whitespace without normalization. There is no empty literal for a null
field; whitespace-only content is nonempty. [fixture:
treeview/gram-written-tree] [fixture: treeview/ast-common-whitespace-values]
[fixture: treeview/common-block-whitespace-raw] [fixture:
treeview/directive-description-middle] [fixture:
treeview/common-block-directives] [fixture: treeview/common-block-comments]
[fixture: treeview/entity-block]

Box forms enclosed by this leaf remain part of its authored value, even if the
direct lexical reading denotes indentation, excludes trailing whitespace or
removes decoration. Do not move them into overlapping children or rewrite the
literal into its comparison Db value. [fixture: treeview/box-block-decoration]
[fixture: treeview/box-trim-block-closing-brace] [fixture:
treeview/block-physical-selected-semicolon]

### TreeviewBranchPrefix

| Field    | Type   | Meaning                   |
| -------- | ------ | ------------------------- |
| `value`  | string | Authored prefix spelling. |
| `marker` | string | `└`, `┗`, `├` or `┣`.     |

No child fields. Range: the physical line's first non-whitespace character
through the first branch and the end of its immediately following dash run.
Exclude leading whitespace and the separating spaces after the dash run. value
keeps every character in that range outside shared trivia, including arbitrary
text, quotes, vertical bars and mixed light/heavy dashes. marker is the fixed
branch character, not an Identifier. [fixture:
treeview/box-prefix-nonbmp-column] [fixture: treeview/box-written-tree]
[fixture: treeview/box-prefix-arbitrary] [fixture: treeview/box-quoted-branch]
[fixture: treeview/box-heavy] [fixture: treeview/box-branch-no-dash] [fixture:
treeview/box-branch-directive-parts] [fixture:
treeview/box-dash-directive-inside]

The node denotes assigned indentation or padding under the direct box rules; it
stores no derived column, width or depth. Leading source whitespace outside its
range still contributes to the column. A prefix can belong to a node,
annotation, common statement or required block-opener gap. Inside an existing
value its spelling instead stays in that leaf, without an overlapping prefix
child. [fixture: treeview/box-written-tree] [fixture:
treeview/box-annotation-prefix] [fixture: treeview/ast-annotation-prefixes]
[fixture: treeview/box-common-prefix] [fixture:
treeview/box-branch-before-block-open] [fixture:
treeview/ast-prefix-inside-and-outside]

### TreeviewIgnoredText

| Field   | Type   | Meaning                       |
| ------- | ------ | ----------------------------- |
| `kind`  | string | `box-decoration`.             |
| `value` | string | Authored decoration spelling. |

No child fields. Range: the decoration line's first through last non-whitespace
character. Leave its outer padding and excluded following line break outside the
node. value keeps its box characters and internal whitespace, excluding shared
trivia. It is nonempty and kind is always box-decoration. A whitespace-only line
makes no such node. [fixture: treeview/box-written-tree] [fixture:
treeview/box-mode-dash-only] [fixture: treeview/box-unicode-decoration]

Keep each outer decoration in its named gap or body under Gap ownership,
including a final decoration. Do not publish it as a node name, duplicate it
between owners, or extract an enclosed decoration from a leaf. Native percent
forms remain shared Comments rather than this type. [fixture:
treeview/box-written-tree] [fixture: treeview/box-decoration-trailing-body]
[fixture: treeview/box-decoration-before-annotation] [fixture:
treeview/box-decoration-before-block-open] [fixture:
treeview/ast-decoration-internal-and-body] [fixture:
treeview/box-comment-indent-carry]

## Example

This example intentionally displays authored indentation and spelling rather
than selecting a formatting policy. The flat body contains all four common
statement kinds followed by three nodes. The first node retains two classes, two
icons and a description; its child keeps its quoted trailing space, and the last
node keeps an empty single-quoted name. [fixture: treeview/gram-written-tree]

```mmd
treeView-beta
title  Tree
accTitle:  Access
accDescr: Line
accDescr {  Block
  text  }
root/ :::first icon(pack:file) :::last icon() ##  detail
  "child/ "
''
```

In the box example, root/ and all branch rows remain in written order. The
vertical decoration between src/ and its child is a separate body item; src/
retains its class, icon and description. Prefix depths are interpreted from
their original columns, without a synthesized source hierarchy. [fixture:
treeview/box-written-tree]

```mmd
treeView-beta
root/
├── src/ :::high icon(folder) ## entry
│
│   └── "my file"
└── other
```

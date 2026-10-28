# Ishikawa nodes

Japanese version: [ishikawa.ja.md](./ishikawa.ja.md)

This document defines the tree for `ishikawa`. Shared parts are in
[ast.md](../ast.md); syntax and acceptance are in
[diagrams/ishikawa.md](../diagrams/ishikawa.md). Value conversion and the Db are
defined by the
[tests package summary](../../../tests/docs/db-summaries.md#ishikawa).

The body is an IshikawaDiagram containing a nested tree, with each node's
written indentation retained. The parent rule is Ishikawa's own, defined under
[Indentation and parents](../diagrams/ishikawa.md#indentation-and-parents).
Siblings remain in source order and repeated text stays separate. [fixture:
ishikawa/db-indent-first-cause] [fixture: ishikawa/db-indent-clamped] [fixture:
ishikawa/db-three-definitions]

## Nodes

### IshikawaDiagram

| Field  | Type                 | Meaning                                          |
| ------ | -------------------- | ------------------------------------------------ |
| `root` | IshikawaNode or null | The first node, or null when no node is written. |

Child fields: `root`. The header has no node or beta flag. Blank lines,
comments, and directives create no diagram-specific node. There are no title or
accessibility fields: title-looking text is a node and frontmatter remains on
the shared root. [fixture: ishikawa/header-only-lf] [fixture:
ishikawa/header-beta-only-lf] [fixture: ishikawa/header-lf-directive-eof]
[fixture: ishikawa/gram-root-comment-only-document] [fixture:
ishikawa/gram-whitespace-only-document] [fixture:
ishikawa/db-title-line-is-node] [fixture: ishikawa/db-accdescr-empty-keeps-node]
[fixture: ishikawa/db-frontmatter-title]

Its range covers the header and the diagram body, including all descendant
nodes. A rootless diagram still has its header. [fixture:
ishikawa/header-only-lf] [fixture: ishikawa/db-all-fields] [fixture:
ishikawa/header-same-line-root]

### IshikawaNode

| Field      | Type                 | Meaning                                             |
| ---------- | -------------------- | --------------------------------------------------- |
| `indent`   | integer              | The nonnegative count of preceding line whitespace. |
| `text`     | IshikawaLiteral      | The nonempty written node text.                     |
| `children` | list of IshikawaNode | Its children, in source order.                      |

Child fields: `text`, `children`. `children` is empty when the node has no
children. The node range covers its text through its last descendant, or just
its text when there are none; its leading indentation is whitespace, not a text
value. [fixture: ishikawa/gram-root-lf] [fixture:
ishikawa/db-indent-first-cause] [fixture: ishikawa/db-indent-pop-several]

`indent` counts every line whitespace character as one, including tab, U+00A0,
U+3000, and the U+2028 or U+2029 that ends a preceding diagram comment. It
excludes directives; on the header line it counts whitespace after the header.
Root indentation is retained but does not decide parents. [fixture:
ishikawa/db-indent-tab-character] [fixture:
ishikawa/db-indent-equal-mixed-whitespace] [fixture:
ishikawa/lex-ideographic-positions] [fixture: ishikawa/comment-preserved-u2028]
[fixture: ishikawa/comment-preserved-u2029] [fixture:
ishikawa/db-comment-ls-indent-below-first-cause] [fixture:
ishikawa/db-indent-around-directives] [fixture: ishikawa/header-same-line-root]
[fixture: ishikawa/db-indent-root-deeper]

The first cause is a root child. A later node whose indentation is at most the
first cause's is a root child; otherwise its parent is the nearest preceding
cause with strictly smaller indentation. No inferred indentation or level
replaces `indent`. [fixture: ishikawa/db-indent-first-cause] [fixture:
ishikawa/db-indent-clamp-below-base] [fixture: ishikawa/db-indent-relative-zero]
[fixture: ishikawa/db-indent-nearest-smaller-cause]

### IshikawaLiteral

| Field   | Type   | Meaning                   |
| ------- | ------ | ------------------------- |
| `value` | string | The node text as written. |

No child fields. The range runs from the first to the last character of node
text, including trailing whitespace. `value` follows the
[written text](../ast.md#nodes) rule: quotes, backticks, entities, and interior
or trailing whitespace remain written; directives, common comment regions, and
selected ignored semicolons are excluded. Its range can contain those excluded
regions. [fixture: ishikawa/gram-root-trailing-space] [fixture:
ishikawa/lex-trailing-ls-ps-whitespace] [fixture: ishikawa/gram-quotes-padding]
[fixture: ishikawa/gram-empty-backticks-text] [fixture:
ishikawa/header-root-inline-entity] [fixture: ishikawa/directive-root-middle]
[fixture: ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/comment-ls-region-in-text] [fixture: ishikawa/lex-root-style-semicolon]
[fixture: ishikawa/lex-style-semicolon-before-directive] [fixture:
ishikawa/lex-entity-directive-in-node-text] [fixture:
ishikawa/lex-html-tag-starts-in-comment-line] [fixture:
ishikawa/lex-html-tag-crosses-directive] [fixture:
ishikawa/lex-html-tag-ends-in-comment-line] [fixture:
ishikawa/lex-node-text-ps-comment-region] [fixture:
ishikawa/lex-style-rule-directive-in-trigger] [fixture:
ishikawa/lex-style-rule-ls-segment] [fixture:
ishikawa/lex-style-rule-ps-segment] [fixture:
ishikawa/lex-style-rule-comment-region-in-text] [fixture:
ishikawa/lex-trailing-whitespace-eof] [fixture:
ishikawa/lex-root-style-semicolon-padding] [fixture:
ishikawa/lex-root-style-two-semicolons] [fixture:
ishikawa/lex-root-style-two-semicolons-padding] [fixture:
ishikawa/lex-root-style-three-semicolons] [fixture:
ishikawa/lex-root-style-three-semicolons-padding]

The value is never empty. Numeric-looking text is also IshikawaLiteral, as are
empty quote and bracket spellings; there is no StringLiteral or NumericLiteral
alternative. [fixture: ishikawa/db-number-labels] [fixture:
ishikawa/gram-empty-quotes] [fixture: ishikawa/gram-empty-brackets] [fixture:
ishikawa/lex-directive-in-numeric-looking-text]

Quotes are content, not delimiters, so a missing closing quote needs no `closed`
field. [fixture: ishikawa/gram-root-unclosed-quote]

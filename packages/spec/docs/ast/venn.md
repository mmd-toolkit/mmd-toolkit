# Venn nodes

Japanese version: [venn.ja.md](./venn.ja.md)

This document defines the tree for the diagram type `venn`. Shared parts are in
[ast.md](../ast.md); syntax and acceptance are in
[diagrams/venn.md](../diagrams/venn.md). How mermaid.js reads the values into
its Db is in the
[tests package summary](../../../tests/docs/db-summaries.md#venn).

Values keep the written text of [Nodes](../ast.md#nodes), including original
line terminators and interior whitespace. [fixture: venn/lex-cr-quoted-value]
[fixture: venn/lex-crlf-quoted-value] [fixture:
venn/lex-identifier-comment-line] [fixture: venn/lex-label-comment-line]
[fixture: venn/lex-identifier-directive-middle] [fixture:
venn/lex-label-directive-middle] [fixture: venn/lex-identifier-style-rule]
Directives, common comment regions, and selected ignored semicolons are left
out. [fixture: venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-comment-line] [fixture:
venn/lex-label-comment-line] [fixture: venn/lex-identifier-directive-middle]
[fixture: venn/lex-label-directive-middle] [fixture:
venn/lex-identifier-style-rule] [fixture:
venn/lex-union-converted-equivalent-name]

## Nodes

### VennDiagram

| Field  | Type                  | Meaning                          |
| ------ | --------------------- | -------------------------------- |
| `body` | list of VennStatement | The statements, in source order. |

Child fields: `body`. [fixture: venn/header-only] [fixture: venn/header-only-lf]
It may be empty. [fixture: venn/header-only] [fixture: venn/header-only-lf]

VennStatement is VennSubsetStatement, VennTextStatement, VennStyleStatement,
VennTitleStatement, or VennIgnoredText. [fixture: venn/db-all-fields] [fixture:
venn/db-grid-comment-header-line]

The header has no node. [fixture: venn/header-statement-on-line] [fixture:
venn/db-title-on-header] [fixture: venn/db-indent-after-blank] [fixture:
venn/db-indent-after-comment] [fixture: venn/lex-comment-blank-header]
Header-line statements belong to `body`, and blank lines and comments make no
statement node. [fixture: venn/header-statement-on-line] [fixture:
venn/db-title-on-header] [fixture: venn/db-indent-after-blank] [fixture:
venn/db-indent-after-comment] [fixture: venn/lex-comment-blank-header]

Repeated declarations remain separate statements in written order, without
indentation nesting. [fixture: venn/db-three-definitions] [fixture:
venn/db-union-three-definitions] [fixture: venn/db-text-three-definitions]
[fixture: venn/db-style-three-definitions-same-target] [fixture:
venn/db-indent-width]

### VennSubsetStatement

| Field   | Type                                  | Meaning                            |
| ------- | ------------------------------------- | ---------------------------------- |
| `kind`  | string                                | `set` or `union`.                  |
| `sets`  | list of (Identifier or StringLiteral) | The written names.                 |
| `label` | VennLabel or null                     | The optional bracket label.        |
| `size`  | NumericLiteral or null                | The optional size after the colon. |

Child fields: `sets`, `label`, `size`, in that order. [fixture:
venn/db-form-set-label-size] [fixture: venn/db-form-union-label-size]

`kind` is the keyword in lower case. [fixture: venn/lex-keyword-set-upper]
[fixture: venn/lex-keyword-union-upper] [fixture: venn/db-form-set] [fixture:
venn/db-form-union] [fixture: venn/db-union-repeated-member] [fixture:
venn/db-case-distinct-ids] `sets` has one name for `set` and at least two for
`union`, preserving spelling, order, and duplicates. [fixture:
venn/lex-keyword-set-upper] [fixture: venn/lex-keyword-union-upper] [fixture:
venn/db-form-set] [fixture: venn/db-form-union] [fixture:
venn/db-union-repeated-member] [fixture: venn/db-case-distinct-ids]

Bare names are Identifier nodes, and quoted names are StringLiteral nodes,
including an empty string and padding inside quotes. [fixture:
venn/db-grid-dash-identifier-bare] [fixture: venn/db-empty-identifiers]
[fixture: venn/db-quoted-padding] [fixture: venn/lex-identifier-directive-only]

`label` is null only when no label is written; an empty quoted label has a
VennLabel. [fixture: venn/db-form-set] [fixture: venn/db-form-set-label]
[fixture: venn/db-label-empty] [fixture: venn/lex-empty-label-before-size]
[fixture: venn/lex-label-quoted-directive-only] [fixture:
venn/lex-label-quoted-ignored-semicolon-only]

`size` is null only when no colon and size are written; zero and negative sizes
are NumericLiteral nodes. [fixture: venn/db-form-set] [fixture:
venn/db-form-set-size] [fixture: venn/db-size-zero] [fixture:
venn/db-size-negative]

NumericLiteral follows the shared number definition, including signed zero and
overflow; `raw` keeps the written numeric spelling. [fixture:
venn/db-size-negative-zero] [fixture: venn/db-size-overflow] [fixture:
venn/db-size-negative-overflow] [fixture: venn/db-size-leading-zeros]

### VennTextStatement

| Field     | Type                                          | Meaning                                   |
| --------- | --------------------------------------------- | ----------------------------------------- |
| `targets` | list of (Identifier or StringLiteral) or null | Explicit targets; null for implicit text. |
| `id`      | Identifier, StringLiteral, or NumericLiteral  | The written text id.                      |
| `label`   | VennLabel or null                             | The optional bracket label.               |

Child fields: `targets`, `id`, `label`, in that order. [fixture:
venn/db-form-text-id-label] [fixture: venn/db-form-indent-id-label]

Explicit targets are a nonempty written list that keeps spelling, order, and
duplicates. [fixture: venn/db-text-comma-list] [fixture:
venn/db-form-text-string] [fixture: venn/db-form-indent-id] [fixture:
venn/db-indent-width] [fixture: venn/gram-repeated-target-lists] Implicit text
has `targets` null and no inferred parent or indentation field. [fixture:
venn/db-text-comma-list] [fixture: venn/db-form-text-string] [fixture:
venn/db-form-indent-id] [fixture: venn/db-indent-width] [fixture:
venn/gram-repeated-target-lists]

`id` is Identifier for a bare id, StringLiteral for a quoted id, and
NumericLiteral for a numeric id, including a spelling such as `007`. [fixture:
venn/db-form-text-id] [fixture: venn/db-form-text-string] [fixture:
venn/db-form-text-number] [fixture: venn/db-text-leading-zeros] [fixture:
venn/db-form-indent-number]

`label` is null when absent; numeric ids always have `label` null. [fixture:
venn/db-form-text-id] [fixture: venn/db-form-text-id-label] [fixture:
venn/db-form-text-string-label] [fixture: venn/db-form-text-number] [fixture:
venn/gram-size-numeric-label]

### VennStyleStatement

| Field        | Type                                  | Meaning                 |
| ------------ | ------------------------------------- | ----------------------- |
| `targets`    | list of (Identifier or StringLiteral) | The written targets.    |
| `properties` | list of VennStyleProperty             | All written properties. |

Child fields: `targets`, `properties`, in that order. [fixture:
venn/db-form-style-multiple] [fixture: venn/db-style-duplicate-key] [fixture:
venn/db-style-case-and-order] [fixture: venn/db-style-unknown] [fixture:
venn/gram-repeated-target-lists] Both lists are nonempty and keep written order
and repetitions. [fixture: venn/db-form-style-multiple] [fixture:
venn/db-style-duplicate-key] [fixture: venn/db-style-case-and-order] [fixture:
venn/db-style-unknown] [fixture: venn/gram-repeated-target-lists]

### VennStyleProperty

| Field   | Type                         | Meaning                     |
| ------- | ---------------------------- | --------------------------- |
| `key`   | Identifier                   | The bare property key.      |
| `value` | StringLiteral or VennLiteral | The written property value. |

Child fields: `key`, `value`, in that order. [fixture:
venn/db-style-duplicate-key] [fixture: venn/db-style-prototype-keys] [fixture:
venn/db-form-style-documented-properties] Any nonreserved key is retained,
including repeated and prototype-related keys. [fixture:
venn/db-style-duplicate-key] [fixture: venn/db-style-prototype-keys] [fixture:
venn/db-form-style-documented-properties]

A quoted value is StringLiteral, including an empty string. [fixture:
venn/db-form-style-string] [fixture: venn/lex-style-empty] [fixture:
venn/db-form-style-number] [fixture: venn/db-form-style-hex] [fixture:
venn/lex-style-single-number-whole-spelling] Every bare value is VennLiteral,
including a single numeric or color unit. [fixture: venn/db-form-style-string]
[fixture: venn/lex-style-empty] [fixture: venn/db-form-style-number] [fixture:
venn/db-form-style-hex] [fixture: venn/lex-style-single-number-whole-spelling]

### VennTitleStatement

| Field   | Type        | Meaning                                   |
| ------- | ----------- | ----------------------------------------- |
| `value` | VennLiteral | The title text after its first separator. |

Child fields: `value`. [fixture: venn/db-title-padding] [fixture:
venn/db-title-only-whitespace] [fixture: venn/gram-title-empty] [fixture:
venn/gram-title-space-end] It is nonempty and never null. [fixture:
venn/db-title-padding] [fixture: venn/db-title-only-whitespace] [fixture:
venn/gram-title-empty] [fixture: venn/gram-title-space-end]

The first whitespace separator after `title` is excluded; every further
whitespace character and quote belongs to `value`. [fixture:
venn/db-title-padding] [fixture: venn/db-title-quotes] [fixture:
venn/db-title-only-whitespace] [fixture: venn/db-title-value-next-line]

### VennLabel

| Field   | Type   | Meaning                                              |
| ------- | ------ | ---------------------------------------------------- |
| `kind`  | string | `text` or `string`.                                  |
| `value` | string | The written bracket interior, without string quotes. |

No child fields. [fixture: venn/db-set-label] [fixture: venn/db-form-set-label]
`kind` is `text` for a bare label and `string` for an immediately quoted label.
[fixture: venn/db-set-label] [fixture: venn/db-form-set-label]

The value excludes brackets and surrounding string quotes, keeps all written
padding and line terminators. [fixture: venn/lex-label-bare-padding] [fixture:
venn/db-label-spaces] [fixture: venn/lex-label-bare-whitespace-line] [fixture:
venn/db-label-empty] [fixture: venn/gram-label-bare-empty] [fixture:
venn/db-grid-crlf-label-bare] [fixture: venn/lex-crlf-quoted-value] Only a
quoted label may have an empty value. [fixture: venn/lex-label-bare-padding]
[fixture: venn/db-label-spaces] [fixture: venn/lex-label-bare-whitespace-line]
[fixture: venn/db-label-empty] [fixture: venn/gram-label-bare-empty] [fixture:
venn/db-grid-crlf-label-bare] [fixture: venn/lex-crlf-quoted-value] [fixture:
venn/lex-label-quoted-directive-only] [fixture:
venn/lex-label-quoted-ignored-semicolon-only] [fixture:
venn/lex-label-bare-comment-only] [fixture: venn/lex-label-quoted-comment-only]

Backticks and single quotes are ordinary content. [fixture:
venn/db-label-backticks] [fixture: venn/db-label-inner-quotes] [fixture:
venn/lex-label-quoted-close-bracket-inside] [fixture:
venn/lex-label-bare-open-bracket-inside] A quoted label may contain `]`, and a
bare label may contain `[`. [fixture: venn/db-label-backticks] [fixture:
venn/db-label-inner-quotes] [fixture:
venn/lex-label-quoted-close-bracket-inside] [fixture:
venn/lex-label-bare-open-bracket-inside]

### VennLiteral

| Field   | Type   | Meaning           |
| ------- | ------ | ----------------- |
| `value` | string | Its written text. |

No child fields. [fixture: venn/db-title-padding] [fixture:
venn/db-title-only-whitespace] [fixture: venn/db-form-style-tokens] [fixture:
venn/lex-style-adjacent-units] [fixture:
venn/lex-style-single-number-whole-spelling] A title keeps all text after its
first separator. [fixture: venn/db-title-padding] [fixture:
venn/db-title-only-whitespace] [fixture: venn/db-form-style-tokens] [fixture:
venn/lex-style-adjacent-units] [fixture:
venn/lex-style-single-number-whole-spelling] A bare style value keeps its atoms
and the whitespace between them without adding spaces. [fixture:
venn/db-title-padding] [fixture: venn/db-title-only-whitespace] [fixture:
venn/db-form-style-tokens] [fixture: venn/lex-style-adjacent-units] [fixture:
venn/lex-style-single-number-whole-spelling]

### VennIgnoredText

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | The swallowed non-whitespace fragment as written. |

No child fields. [fixture: venn/db-grid-comment-header-line] [fixture:
venn/lex-style-extra-id-eaten] [fixture: venn/lex-set-colon-eaten] [fixture:
venn/header-nonascii-eaten] [fixture: venn/gram-header-non-bmp-before-comment]
The value is the one UTF-16 code unit before the diagram comment that the
comment-prefix rule swallows, excluding the comment. [fixture:
venn/db-grid-comment-header-line] [fixture: venn/lex-style-extra-id-eaten]
[fixture: venn/lex-set-colon-eaten] [fixture: venn/header-nonascii-eaten]
[fixture: venn/gram-header-non-bmp-before-comment] [fixture:
venn/lex-first-rule-comment-before-multiline-string]

The node stands in `body` at that source position, including after a complete
statement. [fixture: venn/lex-set-extra-id-eaten] [fixture:
venn/lex-text-extra-one-letter-eaten] [fixture: venn/lex-union-extra-id-eaten]
[fixture: venn/lex-style-comment-ignored-next-property-comma] [fixture:
venn/lex-inline-comment-eats-id] [fixture:
venn/lex-after-set-size-comment-glued] It does not replace a missing required
operand. [fixture: venn/lex-set-extra-id-eaten] [fixture:
venn/lex-text-extra-one-letter-eaten] [fixture: venn/lex-union-extra-id-eaten]
[fixture: venn/lex-style-comment-ignored-next-property-comma] [fixture:
venn/lex-inline-comment-eats-id] [fixture:
venn/lex-after-set-size-comment-glued]

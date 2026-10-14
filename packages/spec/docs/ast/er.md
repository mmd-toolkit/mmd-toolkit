# ER nodes

Japanese version: [er.ja.md](./er.ja.md)

This document defines the nodes of the tree for the diagram type `er`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/er.md](../diagrams/er.md).

The body of this diagram type is an [ErDiagram](#erdiagram). The values of the
fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its units hold it as their own characters, as mermaid.js
reads it (see [Nodes](../ast.md#nodes)): in this diagram type, a name or a role
that ends with a whitespace character outside ASCII, such as U+00A0, which is a
character of the name (see [Whitespace](../diagrams/er.md#units-and-contexts)).
Elsewhere, the whitespace at the ends of a value is outside it.

An **entity** is a box of the diagram, named by its name; a relationship joins
two entities, with a cardinality at each end and a role.

A StringLiteral of this diagram type is always closed. It is empty only as a
role or as the comment of an attribute, as in `A ||--o{ B : ""`; an empty string
as an entity name makes the input rejected, and empty backquotes are no
StringLiteral (see [Attributes](../diagrams/er.md#attributes)). [fixture:
er/gram-role-string-empty] [fixture: er/gram-comment-empty] [fixture:
er/spec-er-diagram-f4c59d78] [fixture:
er/gram-empty-backquotes-between-attributes]

## Nodes

### ErDiagram

| Field  | Type                | Meaning                          |
| ------ | ------------------- | -------------------------------- |
| `body` | list of ErStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field.

**ErStatement** is an ErEntityStatement, ErRelationshipStatement,
ErSubgraphStatement, ErDirectionStatement, ErClassDefStatement,
ErClassStatement, ErStyleStatement, ErAccTitleStatement, ErAccDescrStatement, or
ErAccDescrBlockStatement.

A line break belongs to no statement, and an empty line makes no node. The child
fields of every node below are in source order (see [Nodes](../ast.md#nodes)).

### ErEntityStatement

An entity written by its name, with an alias, classes, and attributes or
without: `A`, `p[Person]`, `A:::c1,c2`, `A { string name }`, and
`p[Person]:::c { … }`. It adds the entity when the Db has none with its name,
and gives it its alias, classes, and attributes.

| Field        | Type                                            | Meaning                                                                                                                              |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `name`       | ErIdentifier or StringLiteral                   | The name of the entity.                                                                                                              |
| `alias`      | ErIdentifier, StringLiteral, or null            | The alias between `[` and `]`; null when there is none.                                                                              |
| `cssClasses` | list of ErIdentifier                            | The classes after `:::`, separated by `,` units, in source order; empty when there is no `:::`.                                      |
| `attributes` | list of (ErAttribute or ErIgnoredText), or null | The items of the attribute block between `{` and `}`, in source order; empty for a block without items, null when there is no block. |

Child fields: `name`, `alias`, `cssClasses`, `attributes`. The name is an
ErIdentifier for a `name` or a `number` unit, whose `name` is the text of the
unit, `12` and `2.5` included, and a StringLiteral for a `quoted-name` unit; the
alias in the same way (see [Entities](../diagrams/er.md#entities)). An
ErIgnoredText in `attributes` is an `empty-backquotes` unit between two
attributes, before the first, or after the last, which mermaid.js does not read
(see [Attributes](../diagrams/er.md#attributes)). [fixture:
er/lex-name-unicode-characters] [fixture: er/lex-name-number] [fixture:
er/lex-quoted-name] [fixture: er/gram-alias] [fixture: er/gram-alias-string]
[fixture: er/gram-entity-classes] [fixture: er/gram-attribute] [fixture:
er/gram-block-empty] [fixture: er/gram-alias-class-block] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-alone]

### ErAttribute

One attribute of an entity: `string name`, `string? middleName`,
`int id PK, FK "the key"`.

| Field      | Type                          | Meaning                                                                                                                                                                |
| ---------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataType` | ErIdentifier or StringLiteral | The type: the first attribute word. It is not named `type`, which is the node type of every node (see [How fields are described](../ast.md#how-fields-are-described)). |
| `optional` | boolean                       | Whether a `?` follows the type.                                                                                                                                        |
| `name`     | ErIdentifier or StringLiteral | The name: the second attribute word.                                                                                                                                   |
| `keys`     | list of Identifier            | The keys after the name, separated by `,` units, in source order; empty when none.                                                                                     |
| `comment`  | StringLiteral or null         | The comment in quotes; null when there is none.                                                                                                                        |

Child fields: `dataType`, `name`, `keys`, `comment`. An attribute word is an
ErIdentifier for a `word` or a `tilde-word` unit, and a StringLiteral for a
`backquoted-word` unit, whose `value` is the text between the backquotes. The
`?` is a unit and no node; the Db reads the type with the `?` appended. A key is
an Identifier whose `name` is the key as written, `pk` or `PK`. The comment may
be empty, with the value of the empty string, as the Db reads an attribute
without a comment. [fixture: er/gram-attribute] [fixture: er/gram-optional-type]
[fixture: er/lex-tilde-word] [fixture: er/lex-backquote-word] [fixture:
er/gram-keys-comma-space] [fixture: er/lex-key-lower-case] [fixture:
er/gram-comment] [fixture: er/gram-comment-empty] [fixture:
er/gram-attributes-keys-comment]

### ErRelationshipStatement

`A ||--o{ B : has`, `A:::c one or more to zero or one B:::d : "has many"`. It
adds the two entities when the Db has none with their names, and the
relationship.

| Field          | Type                          | Meaning                             |
| -------------- | ----------------------------- | ----------------------------------- |
| `left`         | ErEntityReference             | The entity before the relationship. |
| `relationship` | ErRelationship                | The cardinalities and the line.     |
| `right`        | ErEntityReference             | The entity after the relationship.  |
| `role`         | StringLiteral or ErIdentifier | The role after `:`.                 |

Child fields: `left`, `relationship`, `right`, `role`. The role is a
StringLiteral for a `string` or a `quoted-name` unit, and an ErIdentifier for a
`name` unit; a `string` may be empty, with the value of the empty string.
[fixture: er/gram-relationship-symbols] [fixture: er/gram-role-string] [fixture:
er/gram-role-string-empty] [fixture: er/lex-role-unicode] [fixture:
er/gram-relationship-both-classes]

### ErEntityReference

An end of a relationship: the name of the entity, with its classes or without.

| Field        | Type                          | Meaning                                                                                         |
| ------------ | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `name`       | ErIdentifier or StringLiteral | The name of the entity, as in ErEntityStatement.                                                |
| `cssClasses` | list of ErIdentifier          | The classes after `:::`, separated by `,` units, in source order; empty when there is no `:::`. |

Child fields: `name`, `cssClasses`. [fixture: er/gram-relationship-left-classes]
[fixture: er/gram-relationship-right-classes] [fixture:
er/gram-relationship-string-names] [fixture: er/gram-relationship-number-names]

### ErRelationship

The three units between the two entities of a relationship: `||--o{`,
`one or more to zero or one`, `}|..|{`, `u--o{`.

| Field              | Type   | Meaning                                                      |
| ------------------ | ------ | ------------------------------------------------------------ |
| `leftCardinality`  | string | The cardinality at the left entity: one of the words below.  |
| `line`             | string | `identifying` or `non-identifying`.                          |
| `rightCardinality` | string | The cardinality at the right entity: one of the words below. |

No child fields. The cardinality words are `zero-or-one`, `zero-or-more`,
`one-or-more`, `only-one`, and `md-parent`, the names of the units of
[The statement context](../diagrams/er.md#the-statement-context), whatever the
spelling of the unit: `|o`, `one or zero`, and `zero or one` all give
`zero-or-one`, and `--` and `to` both give `identifying`. The node has no
`value`: its units may have whitespace between them, which mermaid.js does not
read, and the texts of the units are in the tokens. The Db names the left
cardinality `cardB` and the right one `cardA`. [fixture:
er/gram-relationship-symbols] [fixture: er/lex-cardinality-words] [fixture:
er/lex-cardinality-only-one-optionally-to] [fixture: er/lex-md-parent] [fixture:
er/lex-relationship-spaces-in-spec] [fixture: er/spec-er-diagram-7b5988ee]

### ErSubgraphStatement

`subgraph S`, `subgraph S [Title words]`, the statements of the body, and `end`.

| Field   | Type                                             | Meaning                                                                                             |
| ------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `id`    | ErIdentifier or StringLiteral                    | The name after `subgraph`, as in ErEntityStatement.                                                 |
| `title` | list of (ErIdentifier or StringLiteral), or null | The entity names between `[` and `]`, in source order; null when there is no title.                 |
| `body`  | list of ErStatement                              | The statements up to `end`, in source order, the empty description blocks of the header line first. |

Child fields: `id`, `title`, `body`. The title is a list because the grammar
reads one or more entity names there, with whitespace between them or not, and
mermaid.js joins their texts with one space; the whitespace between them is no
value (see [Subgraphs](../diagrams/er.md#subgraphs)). The Db takes the id with
the whitespace at the ends of a quoted name left out, and the title as the
renderer sanitizes it, which depends on the site configuration. [fixture:
er/gram-subgraph] [fixture: er/gram-subgraph-title] [fixture:
er/gram-subgraph-title-string] [fixture: er/gram-subgraph-string-id] [fixture:
er/db-subgraph-string-id-trimmed] [fixture: er/db-subgraph-title-html] [fixture:
er/gram-subgraph-header-blocks] [fixture: er/gram-subgraph-nested]

### ErDirectionStatement

| Field        | Type                  | Meaning                                                                        |
| ------------ | --------------------- | ------------------------------------------------------------------------------ |
| `textBefore` | ErIgnoredText or null | The text of the direction line before `direction`, or null when there is none. |
| `direction`  | string                | `TB`, `BT`, `RL`, or `LR`.                                                     |
| `textAfter`  | ErIgnoredText or null | The text of the direction line after the value, or null when there is none.    |

Child fields: `textBefore`, `textAfter`. The texts are without the whitespace at
their ends, and null where only whitespace lies there: `  direction LR` has no
`textBefore`, and `A ||--o{ B : x direction LR` the `textBefore`
`A ||--o{ B : x`. The direction is the value in upper case: `direction lr` gives
`LR`. [fixture: er/gram-direction] [fixture: er/lex-direction-lower-case]
[fixture: er/lex-direction-leading-space] [fixture:
er/lex-direction-line-after-relationship] [fixture:
er/lex-direction-line-text-after] [fixture: er/lex-direction-value-glued]

### ErClassDefStatement

`classDef a,b fill:#f9f,stroke:#333`.

| Field        | Type                 | Meaning                                                                    |
| ------------ | -------------------- | -------------------------------------------------------------------------- |
| `cssClasses` | list of ErIdentifier | The class names after `classDef`, separated by `,` units, in source order. |
| `styles`     | list of ErLiteral    | The styles, separated by `,` units, in source order.                       |

Child fields: `cssClasses`, `styles`. A class name is an ErIdentifier whose
`name` is the text of its `style-text` unit. A style is the texts of its units
joined (see [ErLiteral](#erliteral)). The list of styles is never empty: a
`classDef` without a style is rejected. [fixture: er/gram-classdef] [fixture:
er/gram-classdef-two-names] [fixture: er/lex-classdef-style-spaces] [fixture:
er/gram-classdef-without-styles]

### ErClassStatement

`class A,B c1,c2`.

| Field        | Type                 | Meaning                                                                                    |
| ------------ | -------------------- | ------------------------------------------------------------------------------------------ |
| `entities`   | list of ErIdentifier | The names of entities or subgraphs after `class`, separated by `,` units, in source order. |
| `cssClasses` | list of ErIdentifier | The classes, separated by `,` units, in source order.                                      |

Child fields: `entities`, `cssClasses`. Each is a `name` unit, an ErIdentifier,
so neither list holds a number or a quoted name. [fixture: er/gram-class]
[fixture: er/gram-class-two-lists] [fixture: er/db-class-subgraph]

### ErStyleStatement

`style A,B fill:red,stroke:blue`.

| Field      | Type                 | Meaning                                                                                    |
| ---------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `entities` | list of ErIdentifier | The names of entities or subgraphs after `style`, separated by `,` units, in source order. |
| `styles`   | list of ErLiteral    | The styles, as in ErClassDefStatement.                                                     |

Child fields: `entities`, `styles`. A name is an ErIdentifier whose `name` is
the text of its `style-text` unit. [fixture: er/gram-style] [fixture:
er/gram-style-two-names] [fixture: er/db-style-subgraph]

### ErAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type      | Meaning                                                |
| ------- | --------- | ------------------------------------------------------ |
| `value` | ErLiteral | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one, and the value is
never null: `accTitle:` with nothing after it is rejected. The value is the text
without the whitespace at its ends. [fixture: er/gram-acc-title] [fixture:
er/lex-acc-title-blank-line-then-name] [fixture: er/lex-acc-title-at-end]
[fixture: er/db-acc-title-trailing-space]

### ErAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type      | Meaning                                                |
| ------- | --------- | ------------------------------------------------------ |
| `value` | ErLiteral | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for ErAccTitleStatement, the value is never null.
[fixture: er/gram-acc-descr] [fixture: er/lex-acc-descr-at-end]

### ErAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block, which changes nothing. The block is always closed: the text
may not end inside it.

| Field   | Type              | Meaning                                                                                                                 |
| ------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value` | ErLiteral or null | The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. |

Child fields: `value`. `accDescr {}`, `accDescr { }`, and a block of blank lines
have the value null and change nothing. Such a block is a statement only where a
statement starts; a block inside a statement makes the input rejected (see
[Empty description blocks](../diagrams/er.md#empty-description-blocks)).
[fixture: er/gram-acc-descr-block] [fixture: er/gram-acc-descr-block-multiline]
[fixture: er/gram-acc-descr-block-empty] [fixture:
er/db-acc-descr-block-whitespace-only] [fixture:
er/gram-empty-description-block-between-names] [fixture:
er/div-empty-description-block-in-relationship] [fixture:
er/lex-acc-descr-block-unclosed]

### ErIdentifier

A name written without quotes: the name or the alias of an entity, a role, a
class name, a name after `style` or `classDef`, and the type or the name of an
attribute: a `name`, `number`, `style-text`, `word`, or `tilde-word` unit.

| Field  | Type   | Meaning                                                               |
| ------ | ------ | --------------------------------------------------------------------- |
| `name` | string | Its written text (see [Nodes](../ast.md#nodes)), whitespace included. |

No child fields. It is a name node of the diagram, not an
[Identifier](../ast.md#identifier), because these positions allow whitespace
inside the name: a `name` and a `style-text` may hold the whitespace characters
outside ASCII, such as U+00A0 and U+2028 (see
[Whitespace](../diagrams/er.md#units-and-contexts)), and a tilde word may hold
any whitespace. `A`, U+00A0, and `B` is one entity, `List~a b~ c` has the type
`List~a b~`, and `12` is an entity whose `name` is `12`. A `word` holds no ASCII
whitespace and no U+00A0, but may hold the other whitespace characters outside
ASCII after its first character (see
[The attribute block context](../diagrams/er.md#the-attribute-block-context)):
`string name` has the type `string`. [fixture: er/lex-name-nbsp] [fixture:
er/lex-name-line-separator] [fixture: er/lex-tilde-space-inside] [fixture:
er/lex-name-number] [fixture: er/gram-attribute] [fixture:
er/lex-tilde-run-two-words]

### ErLiteral

A text without quotes that may contain whitespace: a style, and an accessibility
text.

| Field   | Type   | Meaning                                                                                                       |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)); for a style, the written texts of its units joined in order. |

No child fields. The value of a style is the written texts of its units joined
in order, as the name of an [Identifier](../ast.md#identifier) is: mermaid.js
drops the whitespace between the units of a style, so `classDef a fill : #f9f`
has the style `fill:#f9f`, and `classDef a fill:red stroke:blue` the one style
`fill:redstroke:blue`. An accessibility text is read without the whitespace at
its ends, which mermaid.js trims, and never consists of whitespace only.
[fixture: er/lex-classdef-style-spaces] [fixture: er/lex-classdef-styles-joined]
[fixture: er/gram-acc-title] [fixture: er/db-acc-title-trailing-space] [fixture:
er/lex-acc-descr-block-trailing-spaces]

### ErIgnoredText

Text that the author wrote and mermaid.js does not read: the text before
`direction` and after its value on a direction line, and an `empty-backquotes`
unit in an attribute block that lies between two attributes, before the first,
or after the last. A run of `empty-backquotes` units with only whitespace
between them is one node.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. [fixture: er/lex-direction-line-text-before] [fixture:
er/lex-direction-line-text-after] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-twice]

# Requirement nodes

Japanese version: [requirement.ja.md](./requirement.ja.md)

This document defines the nodes of the tree for the diagram type `requirement`.
The shared parts of the tree are defined in [ast.md](../ast.md); how the source
is read, and which grammar rule makes which node, is defined in
[diagrams/requirement.md](../diagrams/requirement.md).

The body of this diagram type is a [RequirementDiagram](#requirementdiagram).
The values of the fields keep what the author wrote, as
[ast.md](../ast.md#nodes) defines the written text of a value; they are not in
the converted form of [common.md](../common.md#reading-a-source). In this
diagram type, a value starts or ends with whitespace only inside quotes: an
unquoted name or value reads the whitespace after it on its line, and leaves it
out of its written text, as mermaid.js trims it (see
[Names and values](../diagrams/requirement.md#units-and-contexts)). A
StringLiteral of this diagram type, a name, a class, or a value, is always
closed and never empty: a `"` without its closing quote, and an empty string,
make the input rejected (see
[Strings](../diagrams/requirement.md#units-and-contexts)). [fixture:
requirement/lex-string-unclosed] [fixture:
requirement/gram-requirement-name-empty-string] [fixture:
requirement/gram-requirement-value-empty-string] [fixture:
requirement/div-empty-string-before-value]

A **requirement** is a box of the diagram with an id, a text, a risk, and a
verification method; an **element** is a box with a type and a document
reference. Both are named by their names, and a relationship joins two names.

## Nodes

### RequirementDiagram

| Field  | Type                         | Meaning                          |
| ------ | ---------------------------- | -------------------------------- |
| `body` | list of RequirementStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field.

**RequirementStatement** is a RequirementRequirementStatement,
RequirementElementStatement, RequirementRelationshipStatement,
RequirementDirectionStatement, RequirementStyleStatement,
RequirementClassDefStatement, RequirementClassStatement,
RequirementClassShorthandStatement, RequirementAccTitleStatement,
RequirementAccDescrStatement, or RequirementAccDescrBlockStatement.

A line break belongs to no statement, and an empty line makes no node. The child
fields of every node below are in source order (see [Nodes](../ast.md#nodes)).

### RequirementRequirementStatement

A requirement with its body: `requirement r {`, the fields on their lines, and
`}`; `functionalRequirement "my req":::c {` with its body.

| Field             | Type                                                                                                           | Meaning                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `requirementType` | string                                                                                                         | The kind of requirement: one of the words below.                                                |
| `name`            | RequirementIdentifier or StringLiteral                                                                         | The name of the requirement.                                                                    |
| `cssClasses`      | list of (RequirementIdentifier or StringLiteral)                                                               | The classes after `:::`, separated by `,` units, in source order; empty when there is no `:::`. |
| `body`            | list of (RequirementValueField, RequirementRiskField, RequirementVerifyMethodField, or RequirementIgnoredText) | The items between `{` and `}`, in source order; empty for a body without items.                 |

Child fields: `name`, `cssClasses`, `body`. The kind is `requirement`,
`functionalRequirement`, `interfaceRequirement`, `performanceRequirement`,
`physicalRequirement`, or `designConstraint`, the keyword that starts the
statement, whatever the case in which it is written: `REQUIREMENT r {` has the
kind `requirement`. The name is a RequirementIdentifier for an `unquoted-text`
unit and a StringLiteral for a `string` unit, and so is each class. A
RequirementIgnoredText in `body` is an empty description block on a line of the
body, which mermaid.js does not read (see
[Empty description blocks](../diagrams/requirement.md#empty-description-blocks)).
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/spec-requirement-diagram-d1dc0373] [fixture:
requirement/spec-requirement-diagram-17e0a905] [fixture:
requirement/spec-requirement-diagram-f221edee] [fixture:
requirement/spec-requirement-diagram-0e21244e] [fixture:
requirement/spec-requirement-diagram-06f108a7] [fixture:
requirement/db-keywords-upper-case] [fixture:
requirement/db-requirement-defaults] [fixture:
requirement/docs-syntax-requirement-diagram-6aee0ba9] [fixture:
requirement/db-class-in-definition] [fixture:
requirement/gram-requirement-class-string] [fixture:
requirement/gram-requirement-separator-spaced] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/db-requirement-name-repeated] [fixture:
requirement/db-requirement-second-definition-classes]

### RequirementValueField

An `id` or a `text` field of a requirement: `id: 1.2`, `text: "a: b"`. Its value
is written text, held as a node; `risk` and `verifyMethod` take one of a fixed
set of words instead, which are no node, and are the separate types
RequirementRiskField and RequirementVerifyMethodField.

| Field   | Type                                | Meaning                  |
| ------- | ----------------------------------- | ------------------------ |
| `field` | string                              | `id` or `text`.          |
| `value` | RequirementLiteral or StringLiteral | The value after the `:`. |

Child fields: `value`. The field is the keyword as a word in lower case,
whatever the case in which it is written: `ID: 1` has the field `id`. The value
is a RequirementLiteral for an `unquoted-text` unit and a StringLiteral for a
`string` unit. [fixture: requirement/db-requirement-all-fields] [fixture:
requirement/db-requirement-quoted-values] [fixture:
requirement/db-requirement-value-spaces] [fixture:
requirement/db-keywords-upper-case]

### RequirementRiskField

A `risk` field: `risk: high`.

| Field  | Type   | Meaning                     |
| ------ | ------ | --------------------------- |
| `risk` | string | `low`, `medium`, or `high`. |

No child fields. The risk is the keyword in lower case, whatever the case in
which it is written: `risk: High` and `RISK: HIGH` have the risk `high`.
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/lex-risk-method-mixed-case] [fixture:
requirement/db-keywords-upper-case]

### RequirementVerifyMethodField

A `verifyMethod` field: `verifyMethod: test`.

| Field          | Type   | Meaning                                               |
| -------------- | ------ | ----------------------------------------------------- |
| `verifyMethod` | string | `analysis`, `demonstration`, `inspection`, or `test`. |

No child fields. The method is the keyword in lower case, whatever the case in
which it is written: `verifymethod: Test` has the method `test`. [fixture:
requirement/db-requirement-all-fields] [fixture:
requirement/lex-risk-method-mixed-case] [fixture:
requirement/spec-requirement-diagram-1e009b06]

### RequirementElementStatement

An element with its body: `element e {`, the fields on their lines, and `}`.

| Field        | Type                                                        | Meaning                                                                                         |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `name`       | RequirementIdentifier or StringLiteral                      | The name of the element.                                                                        |
| `cssClasses` | list of (RequirementIdentifier or StringLiteral)            | The classes after `:::`, separated by `,` units, in source order; empty when there is no `:::`. |
| `body`       | list of (RequirementElementField or RequirementIgnoredText) | The items between `{` and `}`, in source order; empty for a body without items.                 |

Child fields: `name`, `cssClasses`, `body`. They are those of
RequirementRequirementStatement. [fixture: requirement/db-element-fields]
[fixture: requirement/db-element-defaults] [fixture:
requirement/db-class-in-definition] [fixture:
requirement/gram-empty-description-block-in-element-body] [fixture:
requirement/db-element-name-repeated] [fixture:
requirement/db-element-definition-with-class-of-requirement]

### RequirementElementField

A `type` or a `docref` field of an element: `type: simulation`,
`docRef: "http://x"`.

| Field   | Type                                | Meaning                  |
| ------- | ----------------------------------- | ------------------------ |
| `field` | string                              | `type` or `docref`.      |
| `value` | RequirementLiteral or StringLiteral | The value after the `:`. |

Child fields: `value`. The field is the keyword in lower case, whatever the case
in which it is written: `docRef: d` has the field `docref`. The value is as in
RequirementValueField. [fixture: requirement/db-element-fields] [fixture:
requirement/gram-element-docref-quoted-url] [fixture:
requirement/db-keywords-upper-case]

### RequirementRelationshipStatement

`a - satisfies -> b`, `b <- copies - a`. The names need not be defined.

| Field          | Type                                   | Meaning                                           |
| -------------- | -------------------------------------- | ------------------------------------------------- |
| `left`         | RequirementIdentifier or StringLiteral | The name before the relationship.                 |
| `relationship` | string                                 | The kind of relationship: one of the words below. |
| `arrow`        | string                                 | `forward` for `- … ->`, `backward` for `<- … -`.  |
| `right`        | RequirementIdentifier or StringLiteral | The name after the relationship.                  |

Child fields: `left`, `right`. The kind is `contains`, `copies`, `derives`,
`satisfies`, `verifies`, `refines`, or `traces`, in lower case whatever the case
in which it is written. The fields keep the order in which the names are
written; the arrow points from the source to the target, so `b <- copies - a` is
a relationship from a to b. [fixture: requirement/db-relationship-arrows]
[fixture: requirement/gram-relationship-backward-glued] [fixture:
requirement/lex-relationship-upper-case] [fixture:
requirement/db-relationship-quoted-names] [fixture:
requirement/db-relationship-undefined-names]

### RequirementDirectionStatement

| Field        | Type                           | Meaning                                                                        |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------ |
| `textBefore` | RequirementIgnoredText or null | The text of the direction line before `direction`, or null when there is none. |
| `direction`  | string                         | `TB`, `BT`, `RL`, or `LR`.                                                     |
| `textAfter`  | RequirementIgnoredText or null | The text of the direction line after the value, or null when there is none.    |

Child fields: `textBefore`, `textAfter`. The texts are without the whitespace at
their ends, and null where only whitespace lies there: `direction LR` has
neither, and `foo direction LR bar` has the `textBefore` `foo` and the
`textAfter` `bar`. The direction is the value in upper case: `direction rl`
gives `RL`. [fixture: requirement/spec-requirement-diagram-08cfba06] [fixture:
requirement/db-direction-lower-case] [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/lex-direction-value-suffix] [fixture:
requirement/lex-direction-in-relationship-line]

### RequirementStyleStatement

`style r,e fill:#f9f,stroke:#333`.

| Field    | Type                                             | Meaning                                                           |
| -------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `names`  | list of (RequirementIdentifier or StringLiteral) | The names after `style`, separated by `,` units, in source order. |
| `styles` | list of RequirementLiteral                       | The styles, separated by `,` units, in source order.              |

Child fields: `names`, `styles`. A name is a RequirementIdentifier for a
`style-word` unit and a StringLiteral for a `string` unit. A style is the texts
of its units joined (see [RequirementLiteral](#requirementliteral)). The list of
styles is never empty: a `style` statement without a style is rejected.
[fixture: requirement/db-style-statement] [fixture:
requirement/lex-style-string-name] [fixture:
requirement/lex-style-without-style]

### RequirementClassDefStatement

`classDef a,b fill:#f9f,stroke:#333`.

| Field        | Type                                             | Meaning                                                                    |
| ------------ | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `cssClasses` | list of (RequirementIdentifier or StringLiteral) | The class names after `classDef`, separated by `,` units, in source order. |
| `styles`     | list of RequirementLiteral                       | The styles, as in RequirementStyleStatement.                               |

Child fields: `cssClasses`, `styles`. A class name is as a name of
RequirementStyleStatement. [fixture: requirement/db-class-def] [fixture:
requirement/lex-classdef-string-name] [fixture:
requirement/lex-classdef-without-style]

### RequirementClassStatement

`class r,e a,b`.

| Field        | Type                                             | Meaning                                                           |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| `names`      | list of (RequirementIdentifier or StringLiteral) | The names after `class`, separated by `,` units, in source order. |
| `cssClasses` | list of (RequirementIdentifier or StringLiteral) | The classes, separated by `,` units, in source order.             |

Child fields: `names`, `cssClasses`. A name or a class is a
RequirementIdentifier for a `style-word` or an `unquoted-text` unit and a
StringLiteral for a `string` unit; an `unquoted-text` unit stands there when the
statement goes on after the line feed that ends its line (see
[The style context](../diagrams/requirement.md#the-style-context)). [fixture:
requirement/db-class-statement] [fixture: requirement/gram-class-string-class]
[fixture: requirement/lex-class-list-next-line]

### RequirementClassShorthandStatement

A name followed by `:::` and classes: `r:::a,b`. It gives the classes to the
requirement or the element with that name, as RequirementClassStatement does.

| Field        | Type                                             | Meaning                                                           |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| `name`       | RequirementIdentifier or StringLiteral           | The name before `:::`.                                            |
| `cssClasses` | list of (RequirementIdentifier or StringLiteral) | The classes after `:::`, separated by `,` units, in source order. |

Child fields: `name`, `cssClasses`. It is not a RequirementClassStatement,
because it is written differently: one name and no `class`. [fixture:
requirement/db-class-colon-form] [fixture:
requirement/gram-class-shorthand-spaced] [fixture:
requirement/lex-style-string-then-shorthand]

### RequirementAccTitleStatement

An `accTitle:` statement with its text.

| Field   | Type               | Meaning                                                |
| ------- | ------------------ | ------------------------------------------------------ |
| `value` | RequirementLiteral | The text after `accTitle:`, up to the end of its line. |

Child fields: `value`. The whitespace after the `:` is read with it, line feeds
included, so the text starts on the first line that has one, and the value is
never null: `accTitle:` with nothing after it is rejected. The value is the text
without the whitespace at its ends. [fixture: requirement/db-acc-title-descr]
[fixture: requirement/gram-acc-title-line-feed-then-text] [fixture:
requirement/lex-acc-title-at-end]

### RequirementAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type               | Meaning                                                |
| ------- | ------------------ | ------------------------------------------------------ |
| `value` | RequirementLiteral | The text after `accDescr:`, up to the end of its line. |

Child fields: `value`. As for RequirementAccTitleStatement, the value is never
null. [fixture: requirement/db-acc-title-descr] [fixture:
requirement/lex-acc-descr-at-end]

### RequirementAccDescrBlockStatement

An `accDescr { … }` statement with its text, or without text: an empty
description block, which changes nothing. The block is always closed: the text
may not end inside it.

| Field   | Type                       | Meaning                                                                                                                 |
| ------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `value` | RequirementLiteral or null | The text between `accDescr {` and `}`, without the whitespace at its ends; null when only whitespace lies between them. |

Child fields: `value`. `accDescr {}` and a block that holds only a directive
have the value null and change nothing. Such a block is a statement where a
statement starts, and an item of a body on a line of the body; a block inside a
statement makes the input rejected (see
[Empty description blocks](../diagrams/requirement.md#empty-description-blocks)).
[fixture: requirement/db-acc-descr-block] [fixture:
requirement/gram-acc-descr-block-empty] [fixture:
requirement/gram-acc-descr-block-directive-only] [fixture:
requirement/gram-empty-description-block-after-close-brace] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/lex-acc-descr-block-unclosed]

### RequirementIdentifier

A name written without quotes: the name of a requirement or an element, an end
of a relationship, a class name, and a name after `style`, `classDef`, or
`class`: an `unquoted-text` or a `style-word` unit.

| Field  | Type   | Meaning                                                               |
| ------ | ------ | --------------------------------------------------------------------- |
| `name` | string | Its written text (see [Nodes](../ast.md#nodes)), whitespace included. |

No child fields. It is a name node of the diagram, not an
[Identifier](../ast.md#identifier), because an `unquoted-text` unit may hold
whitespace between its characters: `requirement  spaced name  {` is the
requirement `spaced name`, and `a`, U+00A0, and `b` is one name. The whitespace
after the name on its line, U+00A0 included, is read with the unit and is not
part of its written text. [fixture: requirement/db-requirement-name-spaces]
[fixture: requirement/lex-whitespace-nbsp-in-name] [fixture:
requirement/lex-whitespace-nbsp-after-name] [fixture:
requirement/lex-whitespace-line-separator-in-name] [fixture:
requirement/gram-requirement-class-space] [fixture:
requirement/db-style-statement]

### RequirementLiteral

A text without quotes that may contain whitespace: the value of a field, a
style, and an accessibility text.

| Field   | Type   | Meaning                                                                                                       |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)); for a style, the written texts of its units joined in order. |

No child fields. The value of a field is the written text of its `unquoted-text`
unit, without the whitespace after it: `id:   1  ` has the id `1`, and
`text:   spaced out   ` the text `spaced out`. The value of a style is the
written texts of its units joined in order, as the name of an
[Identifier](../ast.md#identifier) is: mermaid.js drops the spaces between the
units of a style, so `style r fill: red , stroke : blue` has the styles
`fill:red` and `stroke:blue`, and `style r fill:red stroke:blue` the one style
`fill:redstroke:blue`. An accessibility text is read without the whitespace at
its ends, which mermaid.js trims, and never consists of whitespace only.
[fixture: requirement/db-requirement-value-spaces] [fixture:
requirement/lex-style-spaces] [fixture: requirement/lex-style-no-comma]
[fixture: requirement/db-acc-title-descr] [fixture:
requirement/db-acc-descr-block]

### RequirementIgnoredText

Text that the author wrote and mermaid.js does not read: the text before
`direction` and after its value on a direction line, and an empty description
block on a line of the body of a requirement or an element.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. Each empty description block in a body is one node with the
text of the block, such as `accDescr {}`, `accDescr { }`, or `accDescr {`, a
line feed, and `}`, wherever it stands on its line: after `{`, before a field,
after a field whose value is a string, or before `}`. [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/gram-empty-description-block-after-brace] [fixture:
requirement/gram-empty-description-block-before-field] [fixture:
requirement/gram-empty-description-block-after-string-value] [fixture:
requirement/gram-empty-description-block-before-close-brace] [fixture:
requirement/gram-empty-description-block-space-in-body] [fixture:
requirement/gram-empty-description-blocks-adjacent-in-body] [fixture:
requirement/gram-empty-description-block-multiline-in-body]

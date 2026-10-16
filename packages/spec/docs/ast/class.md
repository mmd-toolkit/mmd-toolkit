# Class nodes

Japanese version: [class.ja.md](./class.ja.md)

This document defines the nodes of the tree for the diagram type `classDiagram`.
The shared parts of the tree are defined in [ast.md](../ast.md); how the source
is read, and which grammar rule makes which node, is defined in
[diagrams/class.md](../diagrams/class.md).

The body of this diagram type is a [ClassDiagram](#classdiagram). The values of
the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its units hold it as their own characters, as mermaid.js
reads it (see [Nodes](../ast.md#nodes)): in this diagram type, the whitespace of
a generic type, of an annotation in a member line, at the start of a member name
that starts with a space, before a classifier mark that ends a return type, at
the end of a backquoted name that is not closed, and at the end of the name of a
callback after `call` and at the ends of its arguments (see
[ClassName](#classname), [ClassMethod](#classmethod),
[ClassAnnotation](#classannotation), and [ClassLiteral](#classliteral)).
Elsewhere, the whitespace at the ends of a value is outside it.

A **class** is a box of the diagram, named by a class name. The word does not
refer to a CSS class, which is called a CSS class throughout.

A StringLiteral of this diagram type is closed, except a backquoted name that
the text ends inside (see [StringLiteral](../ast.md#stringliteral)). It is empty
only as the cardinality of a relation or as a tooltip; an empty string
elsewhere, and an empty backquoted name, make the input rejected (see
[Known divergences](../diagrams/class.md#known-divergences)). [fixture:
class/lex-backquote-unclosed] [fixture: class/gram-cardinality-empty] [fixture:
class/gram-link-tooltip-empty] [fixture: class/gram-callback-tooltip-empty]
[fixture: class/gram-click-call-tooltip-empty] [fixture:
class/gram-click-href-tooltip-empty] [fixture:
class/div-empty-string-statement-start] [fixture:
class/div-empty-backquoted-in-name]

## Nodes

### ClassDiagram

| Field  | Type                   | Meaning                          |
| ------ | ---------------------- | -------------------------------- |
| `body` | list of ClassStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field.

**ClassStatement** is a ClassDeclaration, ClassMemberStatement,
ClassNameStatement, ClassAnnotationStatement, ClassRelationStatement,
ClassNamespaceStatement, ClassNoteStatement, ClassCallbackStatement,
ClassLinkStatement, ClassStyleStatement, ClassCssClassStatement,
ClassClassDefStatement, ClassDirectionStatement, ClassAccTitleStatement,
ClassAccDescrStatement, or ClassAccDescrBlockStatement.

A line break that ends a statement belongs to no statement, and an empty line
makes no node. The child fields of every node below are in source order (see
[Nodes](../ast.md#nodes)).

### ClassDeclaration

A `class` statement.

| Field        | Type                         | Meaning                                                                                 |
| ------------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `name`       | ClassName                    | The class name after `class`.                                                           |
| `label`      | StringLiteral or null        | The string between `[` and `]`; null when there is none.                                |
| `cssClass`   | Identifier or null           | The CSS class after `:::`; null when there is none.                                     |
| `annotation` | ClassAnnotation or null      | The annotation between `<<` and `>>` after the name; null when there is none.           |
| `members`    | list of ClassMember, or null | The member lines of the body between `{` and `}`, in source order; null without a body. |

**ClassMember** is a ClassMethod, ClassAttribute, or ClassAnnotation.

Child fields: `name`, `label`, `cssClass`, `annotation`, `members`. At most one
of `cssClass` and `annotation` is set. A member line of only whitespace makes no
node, because mermaid.js adds nothing for it, whatever whitespace it holds, so
`class A { }` has an empty list, and `class A` has null. [fixture:
class/gram-class-css-class-blank-body] [fixture:
class/spec-class-diagram-4eb71456]

### ClassMemberStatement

A class name with a label: `A : +int x`.

| Field    | Type                | Meaning                                                                                  |
| -------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `class`  | ClassName           | The class name before `:`.                                                               |
| `member` | ClassMember or null | The member line after `:`; null when the text after `:` is all whitespace, as in `A : `. |

Child fields: `class`, `member`. `A : ` has no member, and so has `A :` followed
by four spaces: mermaid.js adds no member for a label of only whitespace,
whatever its amount, so that whitespace is no value. [fixture:
class/gram-member-statement] [fixture: class/db-member-statement-blank]
[fixture: class/db-member-statement-blank-spaces]

### ClassNameStatement

A class name alone on its line, without a label: `Foo`.

| Field  | Type      | Meaning         |
| ------ | --------- | --------------- |
| `name` | ClassName | The class name. |

Child fields: `name`. [fixture: class/gram-name-alone]

### ClassAnnotationStatement

`<<interface>> A`.

| Field        | Type            | Meaning                            |
| ------------ | --------------- | ---------------------------------- |
| `annotation` | ClassAnnotation | The annotation, from `<<` to `>>`. |
| `class`      | ClassName       | The class name after it.           |

Child fields: `annotation`, `class`. [fixture:
class/spec-class-diagram-280c04be]

### ClassRelationStatement

| Field             | Type                  | Meaning                                                                                            |
| ----------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `from`            | ClassName             | The class name before the arrow.                                                                   |
| `fromCardinality` | StringLiteral or null | The string between `from` and the arrow; null when there is none.                                  |
| `arrow`           | ClassArrow            | The arrow.                                                                                         |
| `toCardinality`   | StringLiteral or null | The string between the arrow and `to`; null when there is none.                                    |
| `to`              | ClassName             | The class name after the arrow.                                                                    |
| `label`           | ClassLiteral or null  | The text of the label after `:`, without the `:`; null when there is none or it is all whitespace. |

Child fields: `from`, `fromCardinality`, `arrow`, `toCardinality`, `to`,
`label`. A cardinality may be an empty string: `A "" --> B` has the
StringLiteral with the empty value. [fixture: class/gram-cardinality-empty]
[fixture: class/spec-class-diagram-840a462d]

### ClassArrow

The arrow of a relation: a line with optional relation ends.

| Field         | Type   | Meaning                                          |
| ------------- | ------ | ------------------------------------------------ |
| `value`       | string | The written texts of its units, joined in order. |
| `startMarker` | string | The relation end before the line: see below.     |
| `line`        | string | `solid` for `--`, `dotted` for `..`.             |
| `endMarker`   | string | The relation end after the line: see below.      |

The markers are `triangle` for `<|` and `|>`, `filled-diamond` for `*`,
`hollow-diamond` for `o`, `arrow` for `<` and `>`, `lollipop` for `()`, and
`none` when there is no relation end. Each relation end and the line are units
of their own, which may have whitespace between them, and `value` leaves the
whitespace out: `A <|  --  * B` has the value `<|--*`, the start marker
`triangle`, the line `solid`, and the end marker `filled-diamond`. [fixture:
class/gram-relation-spaces] The words describe the drawn mark, not what
mermaid.js calls the relation. No child fields.

### ClassNamespaceStatement

| Field    | Type                                                                       | Meaning                                                                                           |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `prefix` | ClassIdentifier or null                                                    | The name parts before a backquoted name, as in [ClassName](#classname); null when there are none. |
| `name`   | ClassIdentifier or StringLiteral                                           | The name of the namespace: its name parts, or its backquoted name.                                |
| `label`  | StringLiteral or null                                                      | The string between `[` and `]`; null when there is none.                                          |
| `body`   | list of (ClassDeclaration, ClassNoteStatement, or ClassNamespaceStatement) | The items of the body, in source order.                                                           |

Child fields: `prefix`, `name`, `label`, `body`. `namespace a.b` has the
ClassIdentifier `a.b`. [fixture: class/spec-class-diagram-95acf03b] [fixture:
class/db-namespace-nested]

### ClassNoteStatement

| Field   | Type              | Meaning                                                       |
| ------- | ----------------- | ------------------------------------------------------------- |
| `class` | ClassName or null | The class name after `note for`; null for a note with `note`. |
| `text`  | StringLiteral     | The text of the note.                                         |

Child fields: `class`, `text`. [fixture: class/db-note-for-undefined-class]
[fixture: class/db-note-text-spaces]

### ClassCallbackStatement

A `callback` statement, or a `click` statement with `call`.

| Field       | Type                          | Meaning                                                                                                                              |
| ----------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `class`     | ClassName                     | The class name after `callback` or `click`.                                                                                          |
| `callback`  | StringLiteral or ClassLiteral | The function name: the string after the class name, or the `callback-name` unit after `call`, a ClassLiteral.                        |
| `arguments` | ClassLiteral or null          | The text between `(` and `)` after `call`, as one text with its whitespace and line feeds, at its ends too; null when there is none. |
| `tooltip`   | StringLiteral or null         | The string at the end; null when there is none.                                                                                      |

Child fields: `class`, `callback`, `arguments`, `tooltip`. Which keyword was
written, `callback` or `click`, appears in no field. In `click A call fn()`, the
`(` and `)` are units of the statement, held by no field, and `arguments` is
null. [fixture: class/spec-class-diagram-6fe56b41] [fixture:
class/db-callback-names-comma]

### ClassLinkStatement

A `link` statement, or a `click` statement with `href`.

| Field     | Type                  | Meaning                                                                       |
| --------- | --------------------- | ----------------------------------------------------------------------------- |
| `class`   | ClassName             | The class name after `link` or `click`.                                       |
| `url`     | StringLiteral         | The URL.                                                                      |
| `tooltip` | StringLiteral or null | The second string; null when there is none.                                   |
| `target`  | string or null        | `_self`, `_blank`, `_parent`, or `_top`, as written; null when there is none. |

Child fields: `class`, `url`, `tooltip`. [fixture: class/db-click-href]
[fixture: class/gram-link-tooltip-empty]

### ClassStyleStatement

| Field    | Type                 | Meaning                                              |
| -------- | -------------------- | ---------------------------------------------------- |
| `id`     | Identifier           | The word after `style`.                              |
| `styles` | list of ClassLiteral | The styles, separated by `,` units, in source order. |

Child fields: `id`, `styles`. A `,` inside a label of a style does not separate
two styles in the tree: `style A fill:#f00,stroke:#333` has one style. [fixture:
class/gram-style-dash-in-label] [fixture: class/db-style-spaces]

### ClassCssClassStatement

| Field      | Type          | Meaning                      |
| ---------- | ------------- | ---------------------------- |
| `idList`   | StringLiteral | The string after `cssClass`. |
| `cssClass` | Identifier    | The CSS class.               |

Child fields: `idList`, `cssClass`. [fixture: class/db-css-class-list-space]

### ClassClassDefStatement

| Field        | Type                 | Meaning                                             |
| ------------ | -------------------- | --------------------------------------------------- |
| `cssClasses` | list of Identifier   | The CSS classes, separated by `,`, in source order. |
| `styles`     | list of ClassLiteral | The styles, as in ClassStyleStatement.              |

Child fields: `cssClasses`, `styles`. [fixture:
class/spec-class-diagram-styles-2057adab]

### ClassDirectionStatement

| Field        | Type                     | Meaning                                                                                                             |
| ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `textBefore` | ClassIgnoredText or null | The text of the direction line before `direction`, or null when there is none (when it is empty or all whitespace). |
| `direction`  | string                   | `TB`, `BT`, `RL`, or `LR`.                                                                                          |
| `textAfter`  | ClassIgnoredText or null | The text of the direction line after the value, or null when there is none.                                         |

Child fields: `textBefore`, `textAfter`. `class A direction LR` has the text
`class A` before `direction`, and `direction TBX` the text `X` after the value.
[fixture: class/lex-direction-line-class-statement] [fixture:
class/lex-direction-line-value-then-text]

### ClassAccTitleStatement

| Field   | Type         | Meaning                                                |
| ------- | ------------ | ------------------------------------------------------ |
| `value` | ClassLiteral | The text after `accTitle:`, up to the end of the line. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the text may be on the next line. [fixture:
class/lex-acc-title-next-line]

### ClassAccDescrStatement

An `accDescr:` statement.

| Field   | Type         | Meaning                                                |
| ------- | ------------ | ------------------------------------------------------ |
| `value` | ClassLiteral | The text after `accDescr:`, up to the end of the line. |

Child fields: `value`. [fixture: class/db-acc-title-spaces]

### ClassAccDescrBlockStatement

An `accDescr {` statement.

| Field   | Type                 | Meaning                                                            |
| ------- | -------------------- | ------------------------------------------------------------------ |
| `value` | ClassLiteral or null | The text between `{` and `}`; null for an empty description block. |

Child fields: `value`. An empty description block is a statement where a
statement starts and another statement follows it on the same line (see
[Empty description blocks](../diagrams/class.md#empty-description-blocks)), and
after the last unit of a statement, before its line break; after the header,
before its line break, it is the first statement of the diagram's `body` (see
[Empty description blocks before a separator](../diagrams/class.md#empty-description-blocks-before-a-separator)).
[fixture: class/spec-class-diagram-0926d7aa] [fixture:
class/gram-empty-description-block-then-statement] [fixture:
class/gram-empty-description-block-after-note] [fixture:
class/header-empty-description-block]

### ClassName

A class name: in a class statement, at the ends of a relation, and after
`note for`, `click`, `callback`, and `link`.

| Field     | Type                             | Meaning                                                                                                                     |
| --------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `prefix`  | ClassIdentifier or null          | The name parts written before a backquoted name; null when there are none.                                                  |
| `name`    | ClassIdentifier or StringLiteral | The name parts, or the backquoted name.                                                                                     |
| `generic` | ClassLiteral or null             | The `generic-text` unit between the two `~` of a generic type, whitespace included; null when there is none or it is empty. |

Child fields: `prefix`, `name`, `generic`. The name parts with whitespace or `.`
between them are one [ClassIdentifier](#classidentifier): `class Foo Bar` has
the ClassIdentifier `FooBar`, and `class a.b.C` the ClassIdentifier `a.b.C`.
[fixture: class/gram-name-dots] A backquoted name is a StringLiteral:
``class `Odd Name` `` has the StringLiteral with the value `Odd Name`. When name
parts come before a backquoted name, they are the `prefix`: ``class A.`b c` ``
has the prefix `A.` and the StringLiteral `b c`. `class A~~` has the two `~`
units and no generic. mermaid.js reads a generic type as written, whitespace and
line breaks included, so the generic is the whole `generic-text` unit:
`class A~ T ~` has the generic of a space, `T`, and a space, and `class A~ ~`
the generic of one space; `note for A~ T ~` keeps it in the note's class name.
[fixture: class/db-generic-spaces] [fixture: class/db-generic-blank] [fixture:
class/tokens-generic-blank] [fixture: class/db-note-for-generic-spaces]
[fixture: class/gram-name-spaces] [fixture:
class/docs-syntax-class-diagram-01f18827] [fixture:
class/gram-name-prefix-backquoted] [fixture: class/gram-generic-empty-at-end]
[fixture: class/db-generic-type] No field holds the id of the class. A
backquoted name that is not closed is a StringLiteral without its closing quote
(see [StringLiteral](../ast.md#stringliteral)). [fixture:
class/lex-backquote-unclosed]

### ClassMethod

A member line with parentheses, as divided under
[Member lines](../diagrams/class.md#member-lines).

| Field        | Type                     | Meaning                                                                                 |
| ------------ | ------------------------ | --------------------------------------------------------------------------------------- |
| `visibility` | string                   | `public` for `+`, `private` for `-`, `protected` for `#`, `package` for `~`, or `none`. |
| `name`       | ClassLiteral or null     | The `member-name` unit; null when there is none.                                        |
| `parameters` | ClassLiteral or null     | The `parameters` unit; null when there is none.                                         |
| `returnType` | ClassLiteral or null     | The `return-type` unit; null when there is none.                                        |
| `classifier` | string                   | `static` for `$`, `abstract` for `*`, or `none`.                                        |
| `textBefore` | ClassIgnoredText or null | The text before the part that mermaid.js reads, see below; null when there is none.     |
| `textAfter`  | ClassIgnoredText or null | The text after the part that mermaid.js reads, see below; null when there is none.      |

Child fields: `textBefore`, `name`, `parameters`, `returnType`, `textAfter`. The
marks of visibility and classifier, `(`, and `)` are units that no node holds,
and the fields hold words for the marks: `+foo(a: int) List~T~$` has the
visibility `public`, the name `foo`, the parameters `a: int`, the return type
`List~T~`, and the classifier `static`. [fixture: class/tokens-method-fields]
[fixture: class/lex-member-classifiers] [fixture:
class/lex-member-method-nested-parentheses] The ignored texts are there only
when the line has U+2028 or U+2029, and each is null when only whitespace is
there (see [Member lines](../diagrams/class.md#member-lines)). [fixture:
class/lex-member-method-line-separator-before] [fixture:
class/lex-member-method-line-separator-after]

mermaid.js reads two runs of whitespace at the ends of these values, so they are
in the `name` and the `returnType` (see
[Member lines](../diagrams/class.md#member-lines)): the whitespace at the start
of a member name text that starts with a space (U+0020), which mermaid.js makes
one space, and the whitespace between a return type and a classifier mark that
ends it. `+ foo()` has the name of a space and `foo`, and `+getInstance() Foo $`
the return type `Foo` and a space. Other whitespace at their ends is outside
them: with a tab in place of the space after `+`, the name is `foo`. [fixture:
class/db-method-name-space] [fixture:
class/lex-member-method-segment-space-before-name] [fixture:
class/db-member-name-tab] [fixture:
class/db-method-return-type-space-before-classifier]

### ClassAttribute

A member line without parentheses.

| Field        | Type                 | Meaning                                          |
| ------------ | -------------------- | ------------------------------------------------ |
| `visibility` | string               | As in ClassMethod.                               |
| `name`       | ClassLiteral or null | The `member-name` unit; null when there is none. |
| `classifier` | string               | As in ClassMethod.                               |

Child fields: `name`. [fixture: class/db-member-name-space] [fixture:
class/lex-member-annotation-unclosed]

### ClassAnnotation

An annotation: `<<interface>>`.

| Field  | Type                              | Meaning                                                |
| ------ | --------------------------------- | ------------------------------------------------------ |
| `name` | Identifier, ClassLiteral, or null | The text between `<<` and `>>`; null when it is empty. |

Child fields: `name`. After the name of a class statement and in an annotation
statement, the grammar allows one name part between `<<` and `>>`, so the name
is an Identifier. mermaid.js reads that name without the whitespace around it:
`<< interface >> A` and `class A << interface >>` have the Identifier
`interface`. [fixture: class/db-annotation-statement-spaces] [fixture:
class/db-class-annotation-spaces] As a member line, in a body or in a member
statement, it may be any text, and mermaid.js reads it as written, whitespace
included, so it is a ClassLiteral of the whole `annotation-name` unit:
`<< y z >>` in a body has the name of a space, `y z`, and a space, and `<<  >>`
the name of two spaces, also in `A : <<  >>`. [fixture:
class/tokens-annotation-blank] [fixture: class/tokens-annotation-blank-label]
[fixture: class/spec-class-diagram-280c04be] [fixture:
class/db-member-annotation-spaces]

### ClassIdentifier

A class name or a namespace name written without quotes: name parts, with
whitespace or a `.` between them (see
[Class names](../diagrams/class.md#class-names)), before a backquoted name or
without one.

| Field  | Type   | Meaning                                                                         |
| ------ | ------ | ------------------------------------------------------------------------------- |
| `name` | string | The written texts of its units, joined in order (see [Nodes](../ast.md#nodes)). |

No child fields. Whitespace between two of its units is not part of the name, as
mermaid.js leaves it out: `class Foo Bar` and `class Fo oBar` both declare the
class `FooBar`, and `class Fo%%{init: {}}%%o` the class `Foo`. [fixture:
class/gram-name-spaces] [fixture: class/gram-name-space-inside-word] [fixture:
class/lex-directive-in-name]

### ClassLiteral

A text without quotes that may contain whitespace: the label of a relation, a
generic type, a part of a member line, the name of a callback after `call` and
its arguments, a style, and an accessibility text.

| Field   | Type   | Meaning                                                                                                       |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `value` | string | Its written text (see [Nodes](../ast.md#nodes)); for a style, the written texts of its units joined in order. |

No child fields. The value starts or ends with whitespace only where mermaid.js
reads it: a generic type, an annotation of a member line, a member name that
starts with a space, a return type before a classifier mark, and the name of a
callback after `call` and its arguments, which mermaid.js passes on as they are
written: `click A call fn ()` has the name `fn` and a space, and
`click A call f( x, y )` the arguments of a space, `x, y`, and a space, which
mermaid.js then divides at each `,` outside quotes, trimming each argument (see
[ClassName](#classname), [ClassAnnotation](#classannotation), and
[ClassMethod](#classmethod)). [fixture:
class/tokens-callback-name-trailing-space] [fixture:
class/tokens-callback-arguments-spaces-at-ends] [fixture:
class/tokens-callback-arguments-line-feeds-at-ends] There, a text of only
whitespace is a value of that whitespace, as in `class A~ ~` and `<<  >>` in a
body. Elsewhere, mermaid.js trims the text, the whitespace around it is not part
of the value, and a text of only whitespace makes the field null: `A --> B : `
has no label. mermaid.js still reads a relation label of only whitespace as an
empty title, which no field of the tree shows. [fixture:
class/tokens-relation-label-blank] [fixture: class/tokens-generic-blank]
[fixture: class/tokens-annotation-blank] The value of a style is the written
texts of its units joined in order, as the name of an
[Identifier](../ast.md#identifier) is: mermaid.js drops the whitespace between
the units of a style, so `style A fill : #f00` has the style `fill: #f00`, while
a flowchart and a state diagram keep that space. [fixture:
class/db-style-spaces] [fixture: class/tokens-style-words-joined] [fixture:
class/tokens-style-directive-inside-label] [fixture:
class/tokens-style-label-keeps-space-before-next-colon] [fixture:
class/tokens-style-label-space-before-directive] [fixture:
class/tokens-classdef-label-holds-comma] [fixture:
flowchart/db-style-space-before-colon-kept] [fixture:
state/db-style-space-before-colon-kept]

### ClassIgnoredText

Text that the author wrote and mermaid.js does not read: the text before
`direction` and after its value on a direction line, and the parts of a method
line around the part that mermaid.js reads.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields.

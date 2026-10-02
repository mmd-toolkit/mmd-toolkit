# Class nodes

Japanese version: [class.ja.md](./class.ja.md)

This document defines the nodes and tokens of the tree for the diagram type
`classDiagram`. The shared parts of the tree are defined in [ast.md](../ast.md);
how the source is read, and which grammar rule makes which node, is defined in
[diagrams/class.md](../diagrams/class.md).

The body of this diagram type is a [ClassDiagram](#classdiagram). The values of
the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
text of a range; they are not in the converted form of
[common.md](../common.md#reading-a-source), which the Db normalization of
[diagrams/class.md](../diagrams/class.md#building-the-summary-from-the-tree)
applies where it uses them. Whitespace outside the range of a node is not part
of its value; it matters to the Db in three places, the space before the name of
a member, the whitespace inside an annotation line, and the text of a style,
where the Db normalization reads the source.

A **class** is a box of the diagram, named by a class name. The word does not
refer to a CSS class, which is called a CSS class throughout.

## Nodes

### ClassDiagram

| Field  | Type                   | Meaning                          |
| ------ | ---------------------- | -------------------------------- |
| `body` | list of ClassStatement | The statements, in source order. |

Child fields: `body`. The header keyword is not a field. The range runs from the
header keyword to the last token of the diagram.

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
node, so `class A { }` has an empty list, and `class A` has null. [fixture:
class/gram-class-css-class-blank-body] [fixture:
class/spec-class-diagram-4eb71456]

### ClassMemberStatement

A class name with a label, which adds a member: `A : +int x`.

| Field    | Type                | Meaning                                                                                  |
| -------- | ------------------- | ---------------------------------------------------------------------------------------- |
| `class`  | ClassName           | The class name before `:`.                                                               |
| `member` | ClassMember or null | The member line after `:`; null when the text after `:` is all whitespace, as in `A : `. |

Child fields: `class`, `member`. `A : ` adds the class A and no member.
[fixture: class/gram-member-statement] [fixture:
class/db-member-statement-blank]

### ClassNameStatement

A class name alone on its line, without a label, which changes nothing: `Foo`.

| Field  | Type      | Meaning         |
| ------ | --------- | --------------- |
| `name` | ClassName | The class name. |

Child fields: `name`. [fixture: class/gram-name-alone]

### ClassAnnotationStatement

`<<interface>> A`.

| Field        | Type            | Meaning                                          |
| ------------ | --------------- | ------------------------------------------------ |
| `annotation` | ClassAnnotation | The annotation, from `<<` to `>>`.               |
| `class`      | ClassName       | The class name after it, which the Db annotates. |

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
`label`. A cardinality may be an empty string, which the Db reads as none:
`A "" --> B` has the StringLiteral with the empty value. [fixture:
class/gram-cardinality-empty] [fixture: class/spec-class-diagram-840a462d]

### ClassArrow

The arrow of a relation: a line with optional relation ends.

| Field         | Type   | Meaning                                      |
| ------------- | ------ | -------------------------------------------- |
| `value`       | string | The texts of its tokens, joined in order.    |
| `startMarker` | string | The relation end before the line: see below. |
| `line`        | string | `solid` for `--`, `dotted` for `..`.         |
| `endMarker`   | string | The relation end after the line: see below.  |

The markers are `triangle` for `<|` and `|>`, `filled-diamond` for `*`,
`hollow-diamond` for `o`, `arrow` for `<` and `>`, `lollipop` for `()`, and
`none` when there is no relation end. Each relation end and the line are units
and tokens of their own, which may have whitespace between them; the range runs
from the first to the last, and `value` leaves the whitespace out:
`A <|  --  * B` has the value `<|--*`, the start marker `triangle`, the line
`solid`, and the end marker `filled-diamond`. [fixture:
class/gram-relation-spaces] The words describe the drawn mark, not what
mermaid.js calls the relation: `*` is composition and `o` aggregation in the Db,
and `()` at one end, when the other end has no relation end, makes the name at
its own end an interface of the class at the other end, while with relation ends
at both ends, both names are classes (see
[Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)).
[fixture: class/docs-syntax-class-diagram-b06c5b3c] [fixture:
class/db-lollipop-both] No child fields.

### ClassNamespaceStatement

| Field    | Type                                                                       | Meaning                                                                                           |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `prefix` | Identifier or null                                                         | The name parts before a backquoted name, as in [ClassName](#classname); null when there are none. |
| `name`   | Identifier or StringLiteral                                                | The name of the namespace: its name parts, or its backquoted name.                                |
| `label`  | StringLiteral or null                                                      | The string between `[` and `]`; null when there is none.                                          |
| `body`   | list of (ClassDeclaration, ClassNoteStatement, or ClassNamespaceStatement) | The items of the body, in source order.                                                           |

Child fields: `prefix`, `name`, `label`, `body`. `namespace a.b` has the
Identifier `a.b`. [fixture: class/spec-class-diagram-95acf03b] [fixture:
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

| Field       | Type                        | Meaning                                                                                       |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `class`     | ClassName                   | The class name after `callback` or `click`.                                                   |
| `callback`  | StringLiteral or Identifier | The function name: the string after the class name, or the `callback-name` unit after `call`. |
| `arguments` | ClassLiteral or null        | The text between `(` and `)` after `call`; null when there is none.                           |
| `tooltip`   | StringLiteral or null       | The string at the end; null when there is none.                                               |

Child fields: `class`, `callback`, `arguments`, `tooltip`. Which keyword was
written is in the tokens: `callback` or `click`. In `click A call fn()`, the `(`
and `)` are tokens of the statement, and `arguments` is null. [fixture:
class/spec-class-diagram-6fe56b41] [fixture: class/db-callback-names-comma]

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
two styles in the tree; the Db splits the text at every `,` (see
[Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)):
`style A fill:#f00,stroke:#333` has one style in the tree and two in the Db.
[fixture: class/gram-style-dash-in-label] [fixture: class/db-style-spaces]

### ClassCssClassStatement

| Field      | Type          | Meaning                                                                       |
| ---------- | ------------- | ----------------------------------------------------------------------------- |
| `idList`   | StringLiteral | The string after `cssClass`, a list of class names that the Db splits at `,`. |
| `cssClass` | Identifier    | The CSS class.                                                                |

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

Child fields: `textBefore`, `textAfter`. The range covers the whole direction
line. `class A direction LR` has the text `class A` before `direction`, and
`direction TBX` the text `X` after the value. [fixture:
class/lex-direction-line-class-statement] [fixture:
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

Child fields: `value`. An empty description block is a statement only where a
statement starts and another statement follows it on the same line (see
[Empty description blocks](../diagrams/class.md#empty-description-blocks)).
[fixture: class/spec-class-diagram-0926d7aa] [fixture:
class/gram-empty-description-block-then-statement]

### ClassName

A class name: in a class statement, at the ends of a relation, and after
`note for`, `click`, `callback`, and `link`.

| Field     | Type                        | Meaning                                                                                                    |
| --------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `prefix`  | Identifier or null          | The name parts written before a backquoted name; null when there are none.                                 |
| `name`    | Identifier or StringLiteral | The name parts, or the backquoted name.                                                                    |
| `generic` | ClassLiteral or null        | The text between the two `~` of a generic type; null when there is none, or it is empty or all whitespace. |

Child fields: `prefix`, `name`, `generic`. The name parts with whitespace or `.`
between them are one Identifier, whose name leaves the whitespace out (see
[Identifier](../ast.md#identifier)): `class Foo Bar` has the Identifier
`FooBar`, and `class a.b.C` the Identifier `a.b.C`. [fixture:
class/gram-name-dots] A backquoted name is a StringLiteral:
``class `Odd Name` `` has the StringLiteral with the value `Odd Name`. When name
parts come before a backquoted name, they are the `prefix`: ``class A.`b c` ``
has the prefix `A.` and the StringLiteral `b c`. `class A~~` has the two `~`
tokens and no generic. [fixture: class/gram-name-spaces] [fixture:
class/docs-syntax-class-diagram-01f18827] [fixture:
class/gram-name-prefix-backquoted] [fixture: class/gram-generic-empty-at-end]
[fixture: class/db-generic-type] No field is the id of the class in the Db,
which is the written name before its first `~`, the prefix included (see
[Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)):
``class A.`b c` `` has the name `b c` and the id `A.b c`, and ``class `a~b` ``
the name `a~b`, the id `a`, and the type `b`. [fixture:
class/db-backquoted-name-tilde] A backquoted name that is not closed is a
StringLiteral without its closing quote (see
[StringLiteral](../ast.md#stringliteral)). [fixture:
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
marks of visibility and classifier, `(`, and `)` are `Punctuator` tokens and the
words of the fields: `+foo(a: int) List~T~$` has the visibility `public`, the
name `foo`, the parameters `a: int`, the return type `List~T~`, and the
classifier `static`. [fixture: class/tokens-method-fields] [fixture:
class/lex-member-classifiers] [fixture:
class/lex-member-method-nested-parentheses] The ignored texts are there only
when the line has U+2028 or U+2029 (see
[Member lines](../diagrams/class.md#member-lines)). [fixture:
class/lex-member-method-line-separator-before] [fixture:
class/lex-member-method-line-separator-after]

The values of `name` and `returnType` have no whitespace at their ends. The Db
reads two runs of whitespace from the source instead: a space before the name,
when the member name text starts with one, and the whitespace between the return
type and a classifier mark that ends it (see
[Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)).
[fixture: class/lex-member-method-segment-space-before-name] [fixture:
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

| Field  | Type                              | Meaning                                                                  |
| ------ | --------------------------------- | ------------------------------------------------------------------------ |
| `name` | Identifier, ClassLiteral, or null | The text between `<<` and `>>`; null when it is empty or all whitespace. |

Child fields: `name`. The range runs from `<<` to `>>`. After the name of a
class statement and in an annotation statement, the grammar allows one name part
between `<<` and `>>`, so the name is an Identifier. As a member line, it may be
any text, whitespace included, so it is a ClassLiteral: `<< y z >>` in a body
has the name `y z`, and the Db keeps the spaces around it (see
[Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)).
[fixture: class/spec-class-diagram-280c04be] [fixture:
class/db-member-annotation-spaces]

### ClassLiteral

A text without quotes that may contain whitespace: the label of a relation, a
generic type, a part of a member line, the arguments of a callback, a style, and
an accessibility text.

| Field   | Type   | Meaning                                               |
| ------- | ------ | ----------------------------------------------------- |
| `value` | string | The text of its range (see [Nodes](../ast.md#nodes)). |

No child fields. The whitespace around the text is outside the range, so the
value neither starts nor ends with whitespace. As in flowchart, a literal always
has a token: where the text is all whitespace, the field holds null instead, and
where the Db needs that whitespace, it reads it from the units (see
[Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)).
A relation label, a generic type, and an annotation of only whitespace are null:
`A --> B : `, `class A~ ~`, and `<<  >>` in a body. A relation label of only
whitespace still gives the Db an empty title, which the `:` token of the
statement shows. [fixture: class/tokens-relation-label-blank] [fixture:
class/tokens-generic-blank] [fixture: class/tokens-annotation-blank]

### ClassIgnoredText

Text that the author wrote and mermaid.js does not read: the text before
`direction` and after its value on a direction line, and the parts of a method
line around the part that mermaid.js reads.

| Field   | Type   | Meaning                |
| ------- | ------ | ---------------------- |
| `value` | string | The text of its range. |

No child fields.

## Tokens

The tokens are made from the units of
[diagrams/class.md](../diagrams/class.md#lexical-structure). Every unit that is
not all whitespace belongs to one **item** of
[the grammar](../diagrams/class.md#grammar) and has the kind that this table
gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header` unit; the `class`, `namespace`, `style`, `classDef`, `cssClass`, `callback`, `link`, `click`, `note for`, `note`, `href`, `call`, `accTitle`, and `accDescr` units; the `direction` and `direction-value` units; a `link-target` unit                                                                                    |
| `Identifier` | the name parts and `.` units of a class name or a namespace name before a backquoted name or without one; the `word` after `style`; each `word` of a `classDef` statement; the `word` of a `cssClass` statement; the name part after `:::` or between `<<` and `>>` of a statement; a `callback-name` unit                          |
| `String`     | a `string` or `backquoted` unit                                                                                                                                                                                                                                                                                                     |
| `RawText`    | a `generic-text` unit; the text of a `label` unit after its `:`; a `member-name`, `parameters`, `return-type`, or `annotation-name` unit; a `callback-arguments` unit; a style, with all its units; a `title-text`, `description-text`, or `description-block-text` unit; a `direction-text` unit; an ignored part of a method line |
| `Punctuator` | the `:` of a `label` unit and the `:` after `accTitle` and `accDescr`; `{`, `}`, `[`, `]`, `:::`, `<<`, `>>`, `~`, `(`, `)`, and `,`; each relation end and line; a `visibility` or `classifier` unit                                                                                                                               |

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them, and, for a style and the other `RawText`
items, also with whitespace between them; a token holds no whitespace at its
ends. Where a directive lies between two characters of such a run that are not
whitespace, the run is cut at the directive: each piece, without the whitespace
at its ends, is a token, and the directive between the pieces is a `Directive`
token of its own (see [ast.md](../ast.md#directive)). A directive inside one
unit makes the input rejected unless the unit is `RawText` or `Identifier` (see
[Directives inside units](../diagrams/class.md#directives-inside-units)).

- A class name of name parts is one token for each run of them without
  whitespace between them: `Foo-Bar` and `a.b.C` are one token each, and
  `class Foo Bar` has the two tokens `Foo` and `Bar`, and the Identifier
  `FooBar`. [fixture: class/gram-name-spaces] [fixture:
  class/gram-name-dash-spaces]
- A label is one unit, from its `:`, and two tokens: the `:` and the text
  without the whitespace around it. In a member statement, the text is a member
  line, divided into the tokens of its parts. [fixture: class/lex-label-percent]
  [fixture: class/gram-member-statement]
- A style is one `RawText` token, whitespace inside included, and so is each
  style of a `classDef` statement. A `,` unit separates two styles:
  `style A bold,italic` has the style tokens `bold` and `italic`, with a `,`
  token between them. A `,` inside a label is part of the style:
  `style A fill : #f00 , stroke-width: 2px` is one style token, because the `,`
  lies in the label `: #f00 , stroke-width`, and the Db splits its text at the
  `,`. [fixture: class/tokens-style-comma-unit] [fixture: class/db-style-spaces]
- In a click statement with `call`, the `(` and `)` belong to the statement; the
  `call` token and the `(` and `)` tokens are in its range.
- The two `~` of a generic type are `Punctuator` tokens of the ClassName, also
  when nothing is between them.
- The units of a relation end and of a line are each one `Punctuator` token,
  also when no whitespace separates them: `<|--` is the two tokens `<|` and
  `--`.
- A backquoted name that is not closed is one `String` token up to the last
  character of the source that is not whitespace or a line terminator; the
  whitespace and line feeds after it belong to no token, while the Db reads them
  from the unit (see
  [Building the summary](../diagrams/class.md#building-the-summary-from-the-tree)).
  [fixture: class/tokens-backquote-unclosed-trailing-whitespace]
- A `;` that the line rule ignores follows the rule of
  [ast.md](../ast.md#tokens): it is inside a token when characters of that token
  lie on both sides of it, and otherwise a token of its own. Such a token is a
  `RawText` token in the title, description, description block, and member
  contexts, which read a `;` as text, and a `Punctuator` token elsewhere, where
  no rule of the lexer reads a `;`: in `style A fill:#f00;` and
  `classDef c fill:#f00;`, the style is `fill:#f00` and the `;` after it is a
  `Punctuator` token, also with a space before it, while in
  `accTitle: style:#x;` and in a member line `+x style:#a;`, the `;` after the
  text is a `RawText` token. [fixture: class/tokens-style-ignored-semicolon]
  [fixture: class/tokens-style-space-ignored-semicolon] [fixture:
  class/tokens-class-def-ignored-semicolon] [fixture:
  class/tokens-acc-title-ignored-semicolon] [fixture:
  class/tokens-member-ignored-semicolon]

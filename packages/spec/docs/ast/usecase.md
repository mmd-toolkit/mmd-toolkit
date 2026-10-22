# Usecase nodes

Japanese version: [usecase.ja.md](./usecase.ja.md)

This document defines the source tree for `usecase`. Shared fields are in
[ast.md](../ast.md); syntax and acceptance are in
[diagrams/usecase.md](../diagrams/usecase.md). Value conversion and the Db are
defined in the
[tests package summary](../../../tests/docs/db-summaries.md#usecase).

Every node also has the common `type` and the common range and location.
Nullable fields are present as null; absent lists are empty. Fields containing
children are visited in the order listed below. Lists are always in source
order. A parent's range covers its complete written form, without the line
terminator that ends a statement or unrelated indentation/trailing trivia.
Ordinary whitespace belongs to no node except where a value's own rule reads it.
Values leave common directives, comment regions, and selected semicolons out,
but otherwise retain original characters, entities, line terminators, and case.

[fixture: usecase/db-all-fields]

## Nodes

### UsecaseDiagram

| Field  | Type                     | Meaning                       |
| ------ | ------------------------ | ----------------------------- |
| `body` | list of UsecaseStatement | Written top-level statements. |

Child fields: `body`. Range: header through the final body statement, or just
the header when empty. No header child, default direction, beta,
effective-title, resolved-symbol, or generated-node child.

UsecaseStatement is UsecaseActorStatement, UsecaseEntityStatement,
UsecaseRelationshipStatement, UsecaseSystemBoundaryStatement,
UsecaseMetadataAssignmentStatement, UsecaseNoteStatement, UsecaseJsonStatement,
UsecaseDirectionStatement, UsecaseClassDefStatement, UsecaseClassStatement,
UsecaseStyleStatement, UsecaseAccTitleStatement, UsecaseAccDescrStatement, or
UsecaseAccDescrBlockStatement. [fixture: usecase/header-lf] [fixture:
usecase/docs-syntax-usecase-00339c49]

### UsecaseActorStatement

| Field    | Type                          | Meaning                                  |
| -------- | ----------------------------- | ---------------------------------------- |
| `actors` | nonempty list of UsecaseActor | Actor items after the one actor keyword. |

Child fields: `actors`. Range: `actor` through the last suffix of its final
item. A comma does not introduce another actor keyword. This node represents the
actor-list alternative without a relationship. [fixture:
usecase/gram-actor-list]

### UsecaseActor

| Field        | Type                    | Meaning                                             |
| ------------ | ----------------------- | --------------------------------------------------- |
| `id`         | Identifier or null      | The explicit id; null for a quoted-only name.       |
| `label`      | UsecaseLabel or null    | The quoted-only name or explicit parenthesis label. |
| `metadata`   | UsecaseMetadata or null | Its written native metadata.                        |
| `stereotype` | UsecaseLiteral or null  | The complete written stereotype interior.           |
| `classes`    | list of Identifier      | Names after the class suffix.                       |

Child fields: `id`, `label`, `metadata`, `stereotype`, `classes`. Range: first
name unit through the last suffix, excluding the statement's actor keyword. If
id is null, label is a string/markdown label; if label is null, id is present.
There is no synthesized id label, actor type, icon, or business field. Metadata
and stereotypes retain those authored forms separately. [fixture:
usecase/gram-actor-keyword-adjacent-string] [fixture:
usecase/gram-empty-actor-label]

### UsecaseEntityStatement

| Field    | Type          | Meaning                                     |
| -------- | ------------- | ------------------------------------------- |
| `entity` | UsecaseEntity | The written standalone usecase declaration. |

Child fields: `entity`. Range equals the entity's range. Inside a boundary this
node also holds an id followed by metadata, because that grammar position is a
declaration. At top level the same spelling is a metadata assignment instead.
[fixture: usecase/gram-boundary-target-update-is-member] [fixture:
usecase/gram-bare-source-metadata-forces-update] [fixture:
usecase/gram-boundary-standalone-metadata-inside] [fixture:
usecase/db-metadata-forward]

### UsecaseEntity

| Field        | Type                    | Meaning                                                              |
| ------------ | ----------------------- | -------------------------------------------------------------------- |
| `id`         | Identifier or null      | Explicit id, or null for a quoted-only name.                         |
| `shape`      | string or null          | `ellipse` for parentheses; `rectangle` for brackets; otherwise null. |
| `label`      | UsecaseLabel or null    | Explicit shape label or quoted-only name.                            |
| `metadata`   | UsecaseMetadata or null | Native metadata at this occurrence.                                  |
| `stereotype` | UsecaseLiteral or null  | Written stereotype interior.                                         |
| `classes`    | list of Identifier      | Written class suffix names.                                          |

Child fields: `id`, `label`, `metadata`, `stereotype`, `classes`. Range: first
name unit through last suffix. A bare id has null shape and label; a quoted-only
name has null id and shape. Both delimiters of an explicit shape belong to the
entity's written punctuation. There is no declaration/reference boolean: its
syntactic fields and its parent's position determine whether it declares an
entity. Do not turn an endpoint resolved as an actor or JSON table into another
node type. `rectangle` follows the toolkit's full shape-name convention; it is
not Mermaid's normalized `rect` field. [fixture:
usecase/gram-labeled-source-metadata-declaration] [fixture:
usecase/gram-target-metadata-declaration] [fixture:
usecase/lex-label-unquoted-hws-trim]

### UsecaseSystemBoundaryStatement

| Field      | Type                          | Meaning                                          |
| ---------- | ----------------------------- | ------------------------------------------------ |
| `id`       | Identifier or null            | Explicit id, if written.                         |
| `title`    | UsecaseLabel or null          | Quoted-only name or explicit display title.      |
| `metadata` | UsecaseMetadata or null       | Native boundary metadata.                        |
| `classes`  | list of Identifier            | Class suffix names.                              |
| `body`     | list of boundary declarations | Written ActorStatement/EntityStatement children. |

Child fields: `id`, `title`, `metadata`, `classes`, `body`. Range:
`systemBoundary` through closing `end`. If id is null, title is a
string/markdown label; a bare explicit id has title null. Parentheses and
brackets around a display title do not select boundary geometry and need no
extra field. There is no inferred parentId or members list. An empty quoted name
keeps its body even when Mermaid assigns no parentId to its members. No `closed`
field is needed: unclosed boundaries are rejected. [fixture:
usecase/gram-boundary-empty-id-reference] [fixture:
usecase/gram-boundary-empty-label]

### UsecaseRelationshipStatement

| Field     | Type                          | Meaning                                          |
| --------- | ----------------------------- | ------------------------------------------------ |
| `source`  | UsecaseActor or UsecaseEntity | The written left occurrence.                     |
| `id`      | Identifier or null            | Explicit edge id before @.                       |
| `kind`    | string                        | association, include, extend, or generalization. |
| `opening` | UsecaseOpeningArrow or null   | Opening half of a labeled association.           |
| `label`   | UsecaseLabel or null          | Authored association label only.                 |
| `arrow`   | UsecaseArrow                  | Sole arrow or right half after a split label.    |
| `target`  | UsecaseEntity                 | The written right occurrence.                    |

Child fields: `source`, `id`, `opening`, `label`, `arrow`, `target`. This order
is source order. Range starts at `actor` for an actor-keyword source, otherwise
at its first source unit, and ends after the target's last suffix. Source and
target are never swapped. Opening and label are either both present or both
null. A semantic kind has no authored label child. The `:` and the
case-preserving include/extend keyword remain written units of the statement.
[fixture: usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case]

### UsecaseOpeningArrow

| Field         | Type    | Meaning                              |
| ------------- | ------- | ------------------------------------ |
| `value`       | string  | Written --, <--, o--, or x--.        |
| `startMarker` | string  | none, arrow, circle, or cross.       |
| `line`        | string  | Always solid.                        |
| `length`      | integer | Written dash count, always two here. |

No child fields. Range covers only its written operator, excluding whitespace
and the following label. It has no complete end marker or Db minlen. [fixture:
usecase/db-labeled-arrows]

### UsecaseArrow

| Field         | Type    | Meaning                                   |
| ------------- | ------- | ----------------------------------------- |
| `value`       | string  | The written sole/final arrow.             |
| `startMarker` | string  | none, arrow, circle, or cross.            |
| `endMarker`   | string  | none, arrow, circle, cross, or triangle.  |
| `line`        | string  | solid or dotted.                          |
| `length`      | integer | Written dash count, or dot count for ..>. |

No child fields. Range covers its operator only. `--|>` has endMarker triangle;
`..>` is dotted with an arrow at its end. Split closing halves have no start
marker; the opening node supplies it. Keep counts even where the Db uses a fixed
minlen. This uses the same `triangle` marker word as ClassArrow. [fixture:
usecase/lex-forward-circle-id-prefix] [fixture: usecase/db-labeled-arrows]

### UsecaseLabel

| Field   | Type   | Meaning                    |
| ------- | ------ | -------------------------- |
| `kind`  | string | text, string, or markdown. |
| `value` | string | Complete written content.  |

No child fields. Range includes plain/markdown string delimiters when present,
but not surrounding shape parentheses/brackets or stereotype marks. A bare label
spans its first through last contributing unit, keeping interior HWS; ASCII HWS
outside those units is trivia. Unicode whitespace is ordinary label content. A
quoted label keeps all its interior padding and may be empty. No `closed` field
is needed because every accepted string is closed. [fixture:
usecase/lex-label-unquoted-hws-trim] [fixture:
usecase/lex-label-unicode-whitespace-only] [fixture:
usecase/gram-empty-actor-label]

### UsecaseLiteral

| Field   | Type   | Meaning                                |
| ------- | ------ | -------------------------------------- |
| `value` | string | Written text of this grammar position. |

No child fields. Used for stereotype interiors, CSS values, and accessibility
text. Stereotypes keep all interior padding. CSS values begin immediately after
their colon, retain leading HWS there, and end at the last component; their
trailing skipped HWS is outside the literal. Accessibility line values begin
immediately after the colon and extend to the physical line end. Block values
are the complete text between braces. Their padding stays; conversion/trim is
not an AST value. Exactly empty accessibility content is null rather than an
empty Literal; a whitespace-only value is a nonempty Literal. [fixture:
usecase/lex-css-property-padding] [fixture: usecase/gram-a11y-line-raw-padding]
[fixture: usecase/gram-a11y-block-raw-padding] [fixture:
usecase/gram-stereotype-trimmed-conflict]

### UsecaseMetadata

| Field        | Type                            | Meaning                            |
| ------------ | ------------------------------- | ---------------------------------- |
| `properties` | list of UsecaseMetadataProperty | Native properties in source order. |

Child fields: `properties`. Range: the contiguous `@{` through its closing
brace. Empty metadata is a real node with no properties. Newline and comma
separators are punctuation/trivia, not fabricated null property entries. This
block is not in the opaque-data-block set. [fixture:
usecase/gram-metadata-empty] [fixture:
usecase/gram-native-trailing-comma-newline]

### UsecaseMetadataProperty

| Field   | Type                        | Meaning                               |
| ------- | --------------------------- | ------------------------------------- |
| `key`   | Identifier or StringLiteral | Written key.                          |
| `value` | Identifier or StringLiteral | Written bare scalar or quoted string. |

Child fields: `key`, `value`. Range: key start through value end, including the
colon. Quotes are not stripped from raw. A bare true/false has its exact word in
Identifier.name; only that unquoted spelling is interpreted as a boolean by the
native validation/Db rules. An integer-looking word remains Identifier.
[fixture: usecase/lex-native-single-quoted-keys] [fixture:
usecase/lex-native-string-backslashes] [fixture:
usecase/lex-identifier-leading-zero-icon] [fixture:
usecase/gram-native-key-newline-colon] [fixture:
usecase/gram-native-value-newline] [fixture:
usecase/lex-native-single-quote-comment-region-ls] [fixture:
usecase/lex-native-single-quote-comment-region-control] [fixture:
usecase/lex-native-single-quote-comment-region-lf]

### UsecaseMetadataAssignmentStatement

| Field      | Type                       | Meaning                            |
| ---------- | -------------------------- | ---------------------------------- |
| `target`   | Identifier or UsecaseLabel | Bare id or quoted/markdown target. |
| `metadata` | UsecaseMetadata            | The written native update.         |

Child fields: `target`, `metadata`. A UsecaseLabel target is string/markdown,
never bare text. Range: target start through metadata close. Its node type does
not depend on whether resolution later identifies an actor, entity, boundary,
JSON table, or explicit edge. No resolved-target field is inserted. [fixture:
usecase/db-metadata-forward] [fixture:
usecase/gram-metadata-on-anonymous-resolved-node]

### UsecaseNoteStatement

| Field    | Type         | Meaning                 |
| -------- | ------------ | ----------------------- |
| `target` | Identifier   | The one written target. |
| `label`  | UsecaseLabel | Its written note label. |

Child fields: `target`, `label`. Range: note keyword through label end. No
generated note id, connector edge, position, or alias field. [fixture:
usecase/gram-note-adjacent-string-label]

### UsecaseJsonStatement

| Field     | Type                 | Meaning                         |
| --------- | -------------------- | ------------------------------- |
| `id`      | Identifier           | Raw word id in the JSON prefix. |
| `data`    | UsecaseJsonDataBlock | Its opaque object block.        |
| `classes` | list of Identifier   | Optional class suffix.          |

Child fields: `id`, `data`, `classes`. Range: json keyword through final suffix.
A JSON-prefix id is a positive ASCII word run and may be keyword-shaped;
ordinary id positions instead require an identifier unit. [fixture:
usecase/gram-json-keyword-id] [fixture: usecase/gram-json-space-after-at]

### UsecaseJsonDataBlock

| Field   | Type   | Meaning                                      |
| ------- | ------ | -------------------------------------------- |
| `value` | string | Written interior of its outer object braces. |

No child fields. Range: @ through the matching closing brace, including any HWS
between @ and {. Its value begins after the actual opening { and ends before the
corresponding }. Nested objects/arrays, quotes, duplicate keys, and escape
spelling remain opaque. Only this usecase block joins the shared opaque-block
classification. A data block is always closed; unmatched balancing rejects.
[fixture: usecase/db-json-duplicate-order] [fixture:
usecase/div-json-balanced-invalid-array]

### UsecaseDirectionStatement

| Field       | Type   | Meaning                        |
| ----------- | ------ | ------------------------------ |
| `direction` | string | Written TD, TB, BT, LR, or RL. |

No child fields. Range: direction keyword through its value. A keyword from this
fixed set is a scalar field, not an invented Identifier child. [fixture:
usecase/db-semantic-case] [fixture: usecase/gram-direction-adjacent-quoted]
[fixture: usecase/db-direction-all] [fixture: usecase/db-direction-td]

### UsecaseClassDefStatement

| Field     | Type                                     | Meaning                      |
| --------- | ---------------------------------------- | ---------------------------- |
| `classes` | nonempty list of Identifier              | Written defined class names. |
| `styles`  | nonempty list of UsecaseStyleDeclaration | Written CSS declarations.    |

Child fields: `classes`, `styles`. Range: classDef through last CSS component.
Duplicate names and repeated class definitions stay separate occurrences.
[fixture: usecase/gram-styles-components]

### UsecaseClassStatement

| Field     | Type                        | Meaning               |
| --------- | --------------------------- | --------------------- |
| `targets` | nonempty list of Identifier | Written target names. |
| `classes` | nonempty list of Identifier | Written class names.  |

Child fields: `targets`, `classes`. Range: class through final class name. No
empty list items or trailing comma are accepted. The missing comma between the
two lists is their grammar boundary; source HWS separates their two ids.
[fixture: usecase/gram-class-target-hole] [fixture:
usecase/gram-class-name-trailing-comma]

### UsecaseStyleStatement

| Field    | Type                                     | Meaning                   |
| -------- | ---------------------------------------- | ------------------------- |
| `target` | Identifier                               | The one written target.   |
| `styles` | nonempty list of UsecaseStyleDeclaration | Written CSS declarations. |

Child fields: `target`, `styles`. Range: style through last CSS component.
Classes are not compiled into this node's direct styles. [fixture:
usecase/lex-style-quoted-value-and-comma]

### UsecaseStyleDeclaration

| Field   | Type              | Meaning                                  |
| ------- | ----------------- | ---------------------------------------- |
| `name`  | UsecaseIdentifier | Property text before its colon.          |
| `value` | UsecaseLiteral    | Nonempty CSS value text after its colon. |

Child fields: `name`, `value`. Range: first property unit through final value
component. Padding before the colon remains source trivia inside this range;
padding after it is in the value. Commas separate declarations unless protected
by a quoted component or written as `\,`. No null declaration or trailing comma.
Do not interpret CSS functions or decode string components here. [fixture:
usecase/lex-css-property-padding] [fixture:
usecase/lex-style-quoted-value-and-comma] [fixture:
usecase/gram-css-empty-string-component] [fixture:
usecase/gram-css-whitespace-without-component]

### UsecaseIdentifier

| Field  | Type   | Meaning                                                |
| ------ | ------ | ------------------------------------------------------ |
| `name` | string | Written CSS property name, including any internal HWS. |

No child fields. Range: first through last property-name unit. It is a name
node, rather than shared Identifier, because this native position permits HWS
between a markerless dash prefix and its following word. It excludes padding
before the colon. It is not used for ordinary ids or native metadata keys.
[fixture: usecase/lex-class-property-custom-gap] [fixture:
usecase/lex-class-property-long-custom] [fixture:
usecase/lex-css-name-custom-tab] [fixture: usecase/lex-css-name-custom-nbsp]

A directive in the HWS between `--` and the following word is common trivia;
`name` retains the whitespace on both sides of it. [fixture:
usecase/lex-directive-css-name-gap]

### UsecaseAccTitleStatement

| Field   | Type                   | Meaning                         |
| ------- | ---------------------- | ------------------------------- |
| `value` | UsecaseLiteral or null | Complete value after its colon. |

Child fields: `value`. Range: accTitle through the colon or final written value
character. Exactly empty content is null; whitespace-only content stays a
Literal. The next physical line is a separate statement. [fixture:
usecase/gram-a11y-line-raw-padding] [fixture: usecase/db-acctitle-empty]
[fixture: usecase/db-acctitle-eof]

### UsecaseAccDescrStatement

| Field   | Type                   | Meaning                              |
| ------- | ---------------------- | ------------------------------------ |
| `value` | UsecaseLiteral or null | Complete line value after its colon. |

Child fields: `value`. Range: accDescr through colon or final value character.
Same empty/padding rule as UsecaseAccTitleStatement. [fixture:
usecase/db-accdescr-directive-gap] [fixture: usecase/db-accdescr-eof] [fixture:
usecase/db-accdescr-empty-gap]

### UsecaseAccDescrBlockStatement

| Field   | Type                   | Meaning                                        |
| ------- | ---------------------- | ---------------------------------------------- |
| `value` | UsecaseLiteral or null | Complete written interior, or null when empty. |

Child fields: `value`. Range: accDescr through its first closing brace. There is
no `closed` field: an unclosed block is rejected. An empty block is a normal
statement, not an ignored form that can occur between arbitrary units. [fixture:
usecase/gram-a11y-whitespace-block] [fixture:
usecase/gram-a11y-block-raw-padding] [fixture: usecase/db-accdescr-empty]
[fixture: usecase/db-accdescr-unclosed]

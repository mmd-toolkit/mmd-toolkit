# Eventmodeling nodes

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

This defines the authored tree for eventmodeling. [ast.md](../ast.md) defines
shared leaves and invariants; [syntax](../diagrams/eventmodeling.md) defines
acceptance. Every optional field is present as null when absent, lists retain
source order, and child fields give visitor order. Preserve every occurrence,
including model entities, notes, GWT, tags, repeated references and data unused
by the comparison Db. [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/db-data-first] [fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/db-source-order]

In this tree, the common trivia that a value omits are global directives and
selected semicolons. A comment line is diagram text for eventmodeling (see
[Reading a source](../common.md#reading-a-source)): between units it is a shared
Comment, and inside a value or a hidden form it is part of the text.

Identifier holds a single identifier segment or frame-name in its authored
spelling. A digit-only frame name is an identity, not a NumericLiteral: 1, 01
and 001 stay distinct. Quoted inline values use shared StringLiteral: value is
the unconverted interior outside common trivia, raw preserves both quotes and
all source characters, and closed is true. Backslashes are not decoded. Empty
quoted strings remain nodes. [fixture: eventmodeling/lex-id-forms] [fixture:
eventmodeling/db-source-leading-zero] [fixture:
eventmodeling/lex-inline-quote-conversion] [fixture:
eventmodeling/lex-inline-empty] [fixture: eventmodeling/directive-string-middle]

## Gap ownership

Every gap field below is a list of EventmodelingIgnoredText, not whitespace,
shared Comments or global Directives. A form has one owner. Retained pre-header
forms belong to textBeforeHeader; forms after the header or between complete
top-level statements belong to body. There is no visible EOL and no
textAfter-until-EOL field. A native form after the last complete statement is
also a body item. [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/detect-real-retained-secondscan] [fixture:
eventmodeling/lex-hidden-between-statements] [fixture:
eventmodeling/lex-native-directive-object-eof]

Inside an incomplete required construct, use the named gap before its next
component. A following optional source, data reference, inline data or type tag
owns its preceding forms; without that component, forms after a completed frame
return to body. A qualified-name tail member owns forms before its dot and
before its name. A following GWT item owns its textBefore; a following clause
owns its textBefore; forms after the final then item return to top-level body.
[fixture: eventmodeling/lex-hidden-frame-type-gap] [fixture:
eventmodeling/lex-hidden-frame-entity-gap] [fixture:
eventmodeling/lex-hidden-frame-optional-gaps] [fixture:
eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/lex-hidden-gwt-required-gaps] [fixture:
eventmodeling/lex-hidden-gwt-items] [fixture:
eventmodeling/lex-hidden-gwt-clause] [fixture:
eventmodeling/lex-native-directive-object-eof]

A gap is empty when no native ignored form occupies it. Absent optional
constructs have empty internal gaps. Literal interiors keep their enclosed
native-looking text instead of extracting hidden children. Consumed closing line
feeds of native YAML, directives and block data stay outside the node ranges; do
not synthesize the logical appended LF. Internal authored line endings and
padding remain inside enclosing ranges. [fixture:
eventmodeling/gram-written-tree] [fixture: eventmodeling/hidden-data-yaml-text]
[fixture: eventmodeling/lex-native-yaml-inside-common] [fixture:
eventmodeling/hidden-yaml-after-frame] [fixture:
eventmodeling/hidden-yaml-after-frame-space] [fixture:
eventmodeling/data-block-close-eof] [fixture:
eventmodeling/data-block-close-space]

## Common statement values

The four common statement nodes below hold authored payloads. Their public
`EM_*` values also include leading horizontal padding, keyword and delimiters.
The payload alone cannot hold those separately written parts, and ordinary
preceding whitespace is not a node. Db derivation therefore reads the complete
form and its immediately preceding ASCII space/tab run from the source reading
after [common removals](../common.md#reading-a-source): global directives and
selected semicolons. Comment lines are not removed for eventmodeling. Count the
run after these removals. Spaces and tabs on both sides of a removed global
directive or selected semicolon join into one run. A comment line is a native
comment that ends before its LF, so the run before a common statement on the
next line starts after that LF. Removing a closed directive alone does not
remove the LF outside it; a blank line and the LF after a selected semicolon
remain as well. LF, LS and PS are not part of the ASCII space/tab run; whether a
common statement exists after them follows
[Common statements](../diagrams/eventmodeling.md#common-statements). An
unselected semicolon is rejected in this gap, and an empty description block
remains a statement boundary: do not join padding across either as if it were
removed. Do not duplicate this prefix in payload fields or apply
common-converter trimming. [fixture:
eventmodeling/gram-common-leading-directive-both-sides] [fixture:
eventmodeling/gram-common-leading-directive-before-padding] [fixture:
eventmodeling/gram-common-leading-directive-after-padding] [fixture:
eventmodeling/gram-common-leading-directive-after-header] [fixture:
eventmodeling/gram-common-block-leading-directive] [fixture:
eventmodeling/lex-common-block-directive-only-line] [fixture:
eventmodeling/gram-common-leading-semicolon-both-sides] [fixture:
eventmodeling/gram-common-leading-semicolon-after-padding] [fixture:
eventmodeling/gram-common-leading-semicolon-before-padding] [fixture:
eventmodeling/gram-common-leading-semicolon-unselected] [fixture:
eventmodeling/gram-common-leading-comment-region-padding] [fixture:
eventmodeling/lex-common-yaml-blank-line-padding] [fixture:
eventmodeling/lex-common-after-block-ls-indented] [fixture:
eventmodeling/lex-common-after-block-ps-indented] [fixture:
eventmodeling/gram-common-leading-empty-description-boundary]

## Nodes

### EventmodelingDiagram

| Field              | Type                             | Meaning                                        |
| ------------------ | -------------------------------- | ---------------------------------------------- |
| `textBeforeHeader` | list of EventmodelingIgnoredText | Retained pre-header forms.                     |
| `body`             | list of EventmodelingBodyItem    | All authored statements and body hidden forms. |

Child fields: `textBeforeHeader`, `body`. Range: the first retained form, or the
header if none, through the final body item, or the header end for an empty
body. Root.diagramType is eventmodeling. Exclude outside padding, native
comments and closing LF beyond that endpoint. There is no header node or alias
field. EventmodelingBodyItem is either frame statement, ModelEntityStatement,
DataEntityStatement, NoteStatement, GwtStatement, one of the four common
statement types, or IgnoredText, each with its Eventmodeling prefix. Body can be
empty and never groups statements by publication type. [fixture:
eventmodeling/header-only] [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/detect-real-retained-secondscan] [fixture:
eventmodeling/lex-native-directive-object-eof]

### EventmodelingTimeFrameStatement

| Field                        | Type                                 | Meaning                             |
| ---------------------------- | ------------------------------------ | ----------------------------------- |
| `textBeforeName`             | list of EventmodelingIgnoredText     | Forms before frame name.            |
| `name`                       | Identifier                           | Authored digit-string name.         |
| `textBeforeModelEntityType`  | list of EventmodelingIgnoredText     | Forms before entity-type word.      |
| `modelEntityType`            | string                               | Written entity-type word.           |
| `textBeforeEntityIdentifier` | list of EventmodelingIgnoredText     | Forms before qualified name.        |
| `entityIdentifier`           | EventmodelingQualifiedName           | Written entity name.                |
| `sourceFrames`               | list of EventmodelingSourceReference | All sources, including repetitions. |
| `dataReference`              | EventmodelingDataReference or null   | Explicit data reference.            |
| `data`                       | EventmodelingInlineData or null      | Explicit inline data.               |

Child fields: `textBeforeName`, `name`, `textBeforeModelEntityType`,
`textBeforeEntityIdentifier`, `entityIdentifier`, `sourceFrames`,
`dataReference`, `data`. Range: tf or timeframe through the last present data,
dataReference, source reference or qualified-name component. modelEntityType is
one of rmo, readmodel, ui, cmd, command, evt, event, pcr or processor, without
alias normalization. sourceFrames may be empty. dataReference and data are null
only when their whole written forms are absent; preserve inline data even when a
data reference is present. Keep short and long frame keywords in syntax, without
an alias field. [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/lex-hidden-frame-type-gap] [fixture:
eventmodeling/lex-hidden-frame-entity-gap] [fixture:
eventmodeling/lex-hidden-frame-optional-gaps] [fixture:
eventmodeling/db-source-order] [fixture: eventmodeling/db-data-reference-inline]
[fixture: eventmodeling/lex-inline-empty]

### EventmodelingResetFrameStatement

| Field                        | Type                                 | Meaning                             |
| ---------------------------- | ------------------------------------ | ----------------------------------- |
| `textBeforeName`             | list of EventmodelingIgnoredText     | Forms before frame name.            |
| `name`                       | Identifier                           | Authored digit-string name.         |
| `textBeforeModelEntityType`  | list of EventmodelingIgnoredText     | Forms before entity-type word.      |
| `modelEntityType`            | string                               | Written entity-type word.           |
| `textBeforeEntityIdentifier` | list of EventmodelingIgnoredText     | Forms before qualified name.        |
| `entityIdentifier`           | EventmodelingQualifiedName           | Written entity name.                |
| `sourceFrames`               | list of EventmodelingSourceReference | All sources, including repetitions. |
| `dataReference`              | EventmodelingDataReference or null   | Explicit data reference.            |
| `data`                       | EventmodelingInlineData or null      | Explicit inline data.               |

Child fields: `textBeforeName`, `name`, `textBeforeModelEntityType`,
`textBeforeEntityIdentifier`, `entityIdentifier`, `sourceFrames`,
`dataReference`, `data`. Range: rf or resetframe through the last present data,
dataReference, source reference or qualified-name component. modelEntityType is
one of rmo, readmodel, ui, cmd, command, evt, event, pcr or processor, without
alias normalization. sourceFrames may be empty. dataReference and data are null
only when their whole written forms are absent; preserve inline data even when a
data reference is present. Keep short and long frame keywords in syntax, without
an alias field. [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/db-all-aliases] [fixture: eventmodeling/validator-reset-invalid]
[fixture: eventmodeling/spec-eventmodeling-test-ts-8573a603]

### EventmodelingQualifiedName

| Field  | Type                                   | Meaning                           |
| ------ | -------------------------------------- | --------------------------------- |
| `head` | Identifier                             | First segment.                    |
| `tail` | list of EventmodelingQualifiedNamePart | Dot/name members in source order. |

Child fields: `head`, `tail`. Range: the first segment start through the final
segment end. A one-segment name still uses this node with empty tail. Keep
spacing and hidden forms between components in source and their owned gaps. Do
not put the whole whitespace-permitting name in a shared Identifier, synthesize
a namespace or store a resolved declaration. [fixture:
eventmodeling/db-qualified-names] [fixture: eventmodeling/space-qualified-name]
[fixture: eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingQualifiedNamePart

| Field            | Type                             | Meaning                       |
| ---------------- | -------------------------------- | ----------------------------- |
| `textBeforeDot`  | list of EventmodelingIgnoredText | Forms before dot.             |
| `textBeforeName` | list of EventmodelingIgnoredText | Forms after dot, before name. |
| `name`           | Identifier                       | Following segment.            |

Child fields: `textBeforeDot`, `textBeforeName`, `name`. Range: the first owned
textBeforeDot form, otherwise the dot, through the name end. Dot is punctuation.
Pair each name with its own gaps instead of parallel arrays; name is always
present and neither gap contains ordinary whitespace or comments. [fixture:
eventmodeling/space-qualified-name] [fixture:
eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingSourceReference

| Field             | Type                             | Meaning                        |
| ----------------- | -------------------------------- | ------------------------------ |
| `textBefore`      | list of EventmodelingIgnoredText | Forms before arrow.            |
| `arrow`           | EventmodelingArrow               | Authored arrow.                |
| `textBeforeFrame` | list of EventmodelingIgnoredText | Forms between arrow and name.  |
| `frame`           | Identifier                       | Authored frame reference name. |

Child fields: `textBefore`, `arrow`, `textBeforeFrame`, `frame`. Range: the
first textBefore form, otherwise the arrow, through the frame name end. Preserve
every member and its position, including duplicates and unresolved, forward or
self names. frame holds the written one-to-three-digit identity and never a
pointer to a target node. [fixture: eventmodeling/db-source-order] [fixture:
eventmodeling/db-source-missing] [fixture: eventmodeling/db-source-forward]
[fixture: eventmodeling/db-source-self] [fixture:
eventmodeling/lex-hidden-source-frame-gap] [fixture:
eventmodeling/lex-hidden-frame-optional-gaps]

### EventmodelingArrow

| Field         | Type   | Meaning      |
| ------------- | ------ | ------------ |
| `value`       | string | Written ->>. |
| `startMarker` | string | none.        |
| `line`        | string | solid.       |
| `endMarker`   | string | arrow.       |

No child fields. Range: the complete three-character arrow. value is its
authored spelling, startMarker is none, line is solid and endMarker is arrow.
These fields describe the written arrow; do not reverse the references to
reflect drawing direction. [fixture: eventmodeling/db-source-order] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingDataReference

| Field             | Type                             | Meaning                    |
| ----------------- | -------------------------------- | -------------------------- |
| `textBefore`      | list of EventmodelingIgnoredText | Forms before opener.       |
| `textBeforeName`  | list of EventmodelingIgnoredText | Forms after opener.        |
| `name`            | Identifier                       | Single authored data name. |
| `textBeforeClose` | list of EventmodelingIgnoredText | Forms before closer.       |

Child fields: `textBefore`, `textBeforeName`, `name`, `textBeforeClose`. Range:
the first textBefore form, otherwise [[, through ]]. name is a single identifier
and is always present. Unresolved references remain this node, not null; only
the parent field is null when the whole bracketed form is absent. Both
two-character delimiters stay punctuation. [fixture:
eventmodeling/db-data-unresolved] [fixture:
eventmodeling/lex-hidden-reference-name-close] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingInlineData

| Field                 | Type                                          | Meaning                          |
| --------------------- | --------------------------------------------- | -------------------------------- |
| `textBefore`          | list of EventmodelingIgnoredText              | Forms before tag or body opener. |
| `dataType`            | string or null                                | Written data-type word.          |
| `textBeforeDataType`  | list of EventmodelingIgnoredText              | Forms after opening backtick.    |
| `textBeforeTypeClose` | list of EventmodelingIgnoredText              | Forms before closing backtick.   |
| `textBeforeValue`     | list of EventmodelingIgnoredText              | Forms after closing backtick.    |
| `value`               | StringLiteral or EventmodelingLiteral or null | Quoted or brace interior.        |

Child fields: `textBefore`, `textBeforeDataType`, `textBeforeTypeClose`,
`textBeforeValue`, `value`. Range: the first textBefore form, otherwise the
opening backtick, quote or brace, through the body closing quote or brace.
dataType is json, jsobj, figma, salt, uri, md, html or text, or null without a
tag. Without a tag the three internal gap lists are empty. Quote bodies use
StringLiteral, including empty strings; brace bodies use EventmodelingLiteral,
or null only when their interior is empty after common removals. Whitespace-only
brace content is not null. Braces and tag backticks stay punctuation, not
payload characters. [fixture: eventmodeling/lex-inline-empty] [fixture:
eventmodeling/space-data-values] [fixture: eventmodeling/data-all-types]
[fixture: eventmodeling/lex-hidden-type-tag] [fixture:
eventmodeling/gram-written-tree] [fixture:
eventmodeling/gram-empty-payload-after-removals]

### EventmodelingDataBlock

| Field                 | Type                             | Meaning                          |
| --------------------- | -------------------------------- | -------------------------------- |
| `textBefore`          | list of EventmodelingIgnoredText | Forms before tag or body opener. |
| `dataType`            | string or null                   | Written data-type word.          |
| `textBeforeDataType`  | list of EventmodelingIgnoredText | Forms after opening backtick.    |
| `textBeforeTypeClose` | list of EventmodelingIgnoredText | Forms before closing backtick.   |
| `textBeforeValue`     | list of EventmodelingIgnoredText | Forms after closing backtick.    |
| `value`               | EventmodelingLiteral             | Entire brace interior.           |

Child fields: `textBefore`, `textBeforeDataType`, `textBeforeTypeClose`,
`textBeforeValue`, `value`. Range: the first textBefore form, otherwise the
opening backtick or brace, through the closing brace. dataType is json, jsobj,
figma, salt, uri, md, html or text, or null without a tag; the three internal
gaps are then empty. value is never null: even an empty block has its
opening-line padding and LF inside its braces. Preserve all interior spacing,
authored line endings, earlier closing-looking lines and statement-looking text.
The consumed closing LF and logical appended LF are outside this node; Db
derivation reads that boundary from source, as explained by the
[tests summary](../../../tests/docs/db-summaries.md#eventmodeling). [fixture:
eventmodeling/data-block-empty] [fixture:
eventmodeling/lex-block-empty-whitespace] [fixture:
eventmodeling/line-block-values] [fixture:
eventmodeling/lex-block-adjacent-later-close] [fixture:
eventmodeling/lex-hidden-data-tag-gaps] [fixture:
eventmodeling/data-block-close-eof] [fixture:
eventmodeling/data-block-close-space] [fixture:
eventmodeling/lex-block-close-ps-boundary]

### EventmodelingModelEntityStatement

| Field            | Type                             | Meaning                    |
| ---------------- | -------------------------------- | -------------------------- |
| `textBeforeName` | list of EventmodelingIgnoredText | Forms after entity.        |
| `name`           | EventmodelingQualifiedName       | Authored declaration name. |

Child fields: `textBeforeName`, `name`. Range: entity through the final name
segment. Keep duplicate and unused declarations independently; no implicit frame
or resolved parent is synthesized. [fixture:
eventmodeling/db-entities-notes-gwt] [fixture:
eventmodeling/lex-hidden-yaml-name-gap] [fixture:
eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingDataEntityStatement

| Field            | Type                             | Meaning                           |
| ---------------- | -------------------------------- | --------------------------------- |
| `textBeforeName` | list of EventmodelingIgnoredText | Forms after data keyword.         |
| `name`           | Identifier                       | Single authored declaration name. |
| `data`           | EventmodelingDataBlock           | Required block and optional tag.  |

Child fields: `textBeforeName`, `name`, `data`. Range: data keyword through the
data block closing brace. Neither name nor data is null. Keep unused and later
same-name declarations as separate statements instead of selecting only an
effective declaration. [fixture: eventmodeling/db-data-first] [fixture:
eventmodeling/db-data-unused] [fixture: eventmodeling/lex-hidden-data-name-gap]
[fixture: eventmodeling/lex-hidden-data-tag-gaps] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingNoteStatement

| Field                   | Type                             | Meaning                          |
| ----------------------- | -------------------------------- | -------------------------------- |
| `textBeforeSourceFrame` | list of EventmodelingIgnoredText | Forms after note.                |
| `sourceFrame`           | Identifier                       | Written frame reference.         |
| `data`                  | EventmodelingDataBlock           | Required block and optional tag. |

Child fields: `textBeforeSourceFrame`, `sourceFrame`, `data`. Range: note
through the block closing brace. Both reference and block are required. Retain
empty blocks and unresolved or forward reference names; do not infer a rendered
note node. [fixture: eventmodeling/gram-note-empty] [fixture:
eventmodeling/link-note-forward] [fixture: eventmodeling/db-entities-notes-gwt]
[fixture: eventmodeling/lex-hidden-note-frame-gap] [fixture:
eventmodeling/data-block-types] [fixture: eventmodeling/gram-written-tree]

### EventmodelingGwtStatement

| Field                   | Type                             | Meaning                  |
| ----------------------- | -------------------------------- | ------------------------ |
| `textBeforeSourceFrame` | list of EventmodelingIgnoredText | Forms after gwt.         |
| `sourceFrame`           | Identifier                       | Written frame reference. |
| `given`                 | EventmodelingGwtClause           | Required given clause.   |
| `when`                  | EventmodelingGwtClause or null   | Written when clause.     |
| `then`                  | EventmodelingGwtClause           | Required then clause.    |

Child fields: `textBeforeSourceFrame`, `sourceFrame`, `given`, `when`, `then`.
Range: gwt through the final then item name. given.kind is given, then.kind is
then and a present when.kind is when. when is null only without that entire
clause. Do not resolve sourceFrame or replace these clauses by publication
lists. The following complete top-level statement lies outside this node.
[fixture: eventmodeling/gwt-complete] [fixture: eventmodeling/gwt-without-when]
[fixture: eventmodeling/lex-hidden-gwt-required-gaps] [fixture:
eventmodeling/gram-gwt-next-top-level] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingGwtClause

| Field        | Type                             | Meaning                      |
| ------------ | -------------------------------- | ---------------------------- |
| `textBefore` | list of EventmodelingIgnoredText | Forms before clause keyword. |
| `kind`       | string                           | given, when or then.         |
| `body`       | list of EventmodelingGwtItem     | One or more authored items.  |

Child fields: `textBefore`, `body`. Range: the first textBefore form, otherwise
the clause keyword, through the final item name. kind is the written fixed word.
body is never empty; preserve item order and repetitions. Leading forms before
the next clause belong to that next clause, not this body. [fixture:
eventmodeling/gwt-complete] [fixture: eventmodeling/gram-gwt-unassigned-type]
[fixture: eventmodeling/lex-hidden-gwt-clause] [fixture:
eventmodeling/lex-hidden-gwt-required-gaps] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingGwtItem

| Field                        | Type                             | Meaning                           |
| ---------------------------- | -------------------------------- | --------------------------------- |
| `textBefore`                 | list of EventmodelingIgnoredText | Forms before type word.           |
| `modelEntityType`            | string                           | Written entity-type word.         |
| `textBeforeEntityIdentifier` | list of EventmodelingIgnoredText | Forms before entity name.         |
| `entityIdentifier`           | Identifier                       | Single authored entity reference. |

Child fields: `textBefore`, `textBeforeEntityIdentifier`, `entityIdentifier`.
Range: the first textBefore form, otherwise the entity-type word, through the
reference name. modelEntityType is rmo, readmodel, ui, cmd, command, evt, event,
pcr or processor. Keep that word even though the upstream model omits its
unassigned occurrence. entityIdentifier is a written single identifier, not a
qualified name or a resolved declaration. Never synthesize items or deduplicate
them. [fixture: eventmodeling/gwt-complete] [fixture:
eventmodeling/gram-gwt-unassigned-type] [fixture:
eventmodeling/lex-hidden-gwt-item-gap] [fixture:
eventmodeling/lex-hidden-gwt-items] [fixture:
eventmodeling/gram-gwt-title-name-after-lf] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingTitleStatement

| Field   | Type                         | Meaning           |
| ------- | ---------------------------- | ----------------- |
| `value` | EventmodelingLiteral or null | Authored payload. |

Child fields: `value`. Range: title through the last payload character, or title
end when null; exclude preceding padding and the statement-ending LF. value
starts after title and exactly one ASCII space/tab, retaining any further
padding. It is null without that separator or when nothing remains after it and
common removals. Whitespace-only remaining content is a literal. Keep empty and
overwritten occurrences. See [Common statement values](#common-statement-values)
for source-based Db derivation. [fixture: eventmodeling/common-title-only]
[fixture: eventmodeling/common-title-empty] [fixture:
eventmodeling/lex-common-title-two-spaces] [fixture:
eventmodeling/gram-empty-payload-after-removals] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingAccTitleStatement

| Field   | Type                         | Meaning           |
| ------- | ---------------------------- | ----------------- |
| `value` | EventmodelingLiteral or null | Authored payload. |

Child fields: `value`. Range: accTitle through the final payload character, or
colon end when null, excluding preceding padding and LF. value starts
immediately after colon with all authored padding. It is null only when no
content remains after common removals; whitespace-only content is a literal.
Repetitions remain separate statements. See
[Common statement values](#common-statement-values) for source-based Db
derivation. [fixture: eventmodeling/common-acctitle-eof] [fixture:
eventmodeling/common-whitespace] [fixture: eventmodeling/common-repeat]
[fixture: eventmodeling/common-repeat-empty] [fixture:
eventmodeling/gram-empty-payload-after-removals] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingAccDescrStatement

| Field   | Type                         | Meaning           |
| ------- | ---------------------------- | ----------------- |
| `value` | EventmodelingLiteral or null | Authored payload. |

Child fields: `value`. Range: accDescr through the final payload character, or
colon end when null, excluding preceding padding and LF. value begins
immediately after colon, retaining all padding and brace-looking text. It is
null only when no content remains after common removals; whitespace-only content
is a literal. Do not turn a colon form into a block statement. See
[Common statement values](#common-statement-values) for source-based Db
derivation. [fixture: eventmodeling/common-description-eof] [fixture:
eventmodeling/common-colon-block-priority] [fixture:
eventmodeling/common-quoted-values] [fixture:
eventmodeling/gram-empty-payload-after-removals] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingAccDescrBlockStatement

| Field   | Type                         | Meaning           |
| ------- | ---------------------------- | ----------------- |
| `value` | EventmodelingLiteral or null | Authored payload. |

Child fields: `value`. Range: accDescr through its first closing brace,
including delimiters even for null. Keep the brace interior without trimming.
Empty or common-removal-only content gives null; whitespace-only content is a
literal. A closer is required, so there is no closed field. Keep each empty or
overwritten block as its own statement. See
[Common statement values](#common-statement-values) for source-based Db
derivation. [fixture: eventmodeling/common-description-repeat] [fixture:
eventmodeling/common-whitespace] [fixture:
eventmodeling/lex-common-block-whitespace-only] [fixture:
eventmodeling/lex-common-empty-line-whitespace] [fixture:
eventmodeling/gram-description-block-empty-after-removal] [fixture:
eventmodeling/gram-written-tree]

### EventmodelingLiteral

| Field   | Type   | Meaning                       |
| ------- | ------ | ----------------------------- |
| `value` | string | Unconverted authored payload. |

No child fields. Range: the first through last character of the payload
specified by its parent, spanning any internal common trivia. value omits common
directives and selected semicolons, retaining every other source character,
comment lines included, including owned padding, line endings, entity spellings,
quotes and backslashes. Data braces belong to the parent syntax. Do not create
an empty literal for a null field. Block-data always has at least its opening LF
inside its braces; metadata and inline braces may instead have null payloads. No
raw field is needed for this unquoted text. [fixture:
eventmodeling/line-block-values] [fixture: eventmodeling/comment-block-data]
[fixture: eventmodeling/comment-note-data] [fixture:
eventmodeling/common-block-comments] [fixture:
eventmodeling/gram-nested-block-comment-line] [fixture:
eventmodeling/lex-block-empty-whitespace] [fixture:
eventmodeling/common-whitespace] [fixture:
eventmodeling/lex-common-block-whitespace-only] [fixture:
eventmodeling/gram-nested-block-empty-description] [fixture:
eventmodeling/directive-block-middle] [fixture: eventmodeling/style-every-text]
[fixture: eventmodeling/gram-written-tree]

### EventmodelingIgnoredText

| Field   | Type   | Meaning                      |
| ------- | ------ | ---------------------------- |
| `kind`  | string | yaml-block or directive.     |
| `value` | string | Written native ignored form. |

No child fields. Range: the first opening dash or percent through the last
closing dash or percent; exclude preceding horizontal padding and any consumed
following LF. kind is yaml-block for hidden-yaml and directive for
hidden-directive. value includes native delimiters and internal whitespace,
under the shared written-text rule that omits common directives and selected
semicolons; a comment line inside the form is part of its value. Neither content
is parsed as YAML/JSON or published as configuration. A failed native directive
that becomes a comment is a shared Comment, not this node. Owned gaps and
body/textBeforeHeader keep each whole form exactly once. [fixture:
eventmodeling/hidden-yaml-unit-gap] [fixture:
eventmodeling/comment-line-inside-hidden-yaml] [fixture:
eventmodeling/comment-line-inside-hidden-directive] [fixture:
eventmodeling/hidden-yaml-after-frame] [fixture:
eventmodeling/hidden-yaml-after-frame-space] [fixture:
eventmodeling/lex-native-directive-object] [fixture:
eventmodeling/lex-native-directive-object-space] [fixture:
eventmodeling/lex-native-directive-object-eof] [fixture:
eventmodeling/lex-hidden-gwt-required-gaps] [fixture:
eventmodeling/lex-hidden-yaml-fence-directive] [fixture:
eventmodeling/detect-real-retained-secondscan] [fixture:
eventmodeling/gram-written-tree]

## Example

This example deliberately keeps same-line common forms, all statement kinds,
repeated sources, an inline value alongside a data reference, a typed data
block, an empty note and a top-level ignored block. Moving every common
statement to line start is not an equivalent layout under this grammar.
[fixture: eventmodeling/gram-written-tree]

```mmd
eventmodeling accTitle: Title
tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
rf 02 cmd Shop.Buy
entity Shop.Buy
data D `text`{
y
}
note 99 {
}
gwt 99 given evt Bought when cmd Buy then ui Screen
---
hidden
---
tf 03 ui Shop.Screen accDescr {} title All
```

The first frame keeps two SourceReference children and its InlineData even
though the comparison summary selects referenced data. The GWT item type words
stay in Item fields. The empty note has a DataBlock and a Literal containing LF;
the empty description block has null value. No declaration, source or tag is
synthesized or discarded. [fixture: eventmodeling/gram-written-tree]

[grammar]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L1-L70
[entry]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L49
[names]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L24-L55
[data]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L17-L22
[data-terminals]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L57-L58
[metadata]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L62
[hidden]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L64-L70
[module]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/module.ts#L31-L62
[token-builder]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/tokenBuilder.ts#L1-L7
[common-token-builder]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/tokenBuilder.ts#L6-L29
[converter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/common/valueConverter.ts#L6-L81
[parse]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/parse.ts#L133-L150
[validator]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling-validator.ts#L12-L66
[adapter]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/eventmodeling/parser.ts#L8-L14
[store]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/eventmodeling/db.ts#L50-L151
[renderer]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/eventmodeling/renderer.ts#L128-L167
[detector]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/eventmodeling/detector.ts#L4-L8
[preprocess]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/preprocess.ts#L6-L65
[detect-type]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/detectType.ts#L36-L51
[docs]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/eventmodeling.md#L1-L336
[parser-tests]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/tests/eventmodeling.test.ts#L1-L339
[mermaid-tests]:
  https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/eventmodeling/eventmodeling.spec.ts#L1-L133

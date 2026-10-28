# Packet nodes

Japanese version: [packet.ja.md](./packet.ja.md)

This document defines the source tree for `packet` and `packet-beta`;
[ast.md](../ast.md) defines the shared tree and
[diagrams/packet.md](../diagrams/packet.md) defines syntax and acceptance.
Fields keep authored values, optional values are present as null, absent lists
are empty, and lists preserve source order. Child fields give visitor order.
[fixture: packet/gram-mixed] [fixture: packet/spec-packet-c4580507] [fixture:
packet/title-repeat-empty] [fixture: packet/accdescr-block-repeat]

## Nodes

### PacketDiagram

| Field              | Type                      | Meaning                               |
| ------------------ | ------------------------- | ------------------------------------- |
| `textBeforeHeader` | list of PacketIgnoredText | Retained forms before the header.     |
| `body`             | list of PacketBodyItem    | Authored statements and hidden forms. |

Child fields: `textBeforeHeader`, `body`. Range: the first retained pre-header
form, or the header if none, through the last written header/body form,
excluding unrelated outside padding. The two header spellings remain keyword
tokens, without an alias field or separate header node. Root.diagramType is
`packet` for either spelling. [fixture: packet/spec-packet-7426afc4] [fixture:
packet/spec-packet-c4580507] [fixture: packet/detect-one-block] [fixture:
packet/detect-yaml-properties-ignored] [fixture:
packet/detect-second-scan-directive]

textBeforeHeader owns native YAML and second-scan DIRECTIVE forms retained from
the detection point. Passed bare lines, including percent-brace forms, are
shared Comments and do not extend this range; passed whitespace and line breaks
are trivia, also between retained forms, and are not read again. Native closing
boundaries still apply. [fixture: packet/detect-one-block] [fixture:
packet/detect-yaml-properties-ignored] [fixture:
packet/detect-second-scan-directive] [fixture: packet/detect-empty-braces-bare]
[fixture: packet/detect-unclosed-brace-bare] [fixture:
packet/retained-yaml-bare-ls] [fixture:
packet/div-detect-yaml-bare-directive-ls] [fixture:
packet/detect-yaml-bare-directive-ascii] [fixture:
packet/detect-second-scan-glued]

PacketBodyItem is PacketRangeBlockStatement, PacketSingleBlockStatement,
PacketRelativeBlockStatement, PacketTitleStatement, PacketAccTitleStatement,
PacketAccDescrStatement, PacketAccDescrBlockStatement or PacketIgnoredText. Keep
every repeated/empty common statement and every block beyond the publication
cap; do not synthesize split blocks or absolute positions. Empty/comment-only
lines add no body item. A hidden form before a block or after a visible EOL is a
body item. [fixture: packet/gram-mixed] [fixture:
packet/gram-common-interleaved] [fixture: packet/title-repeat-empty] [fixture:
packet/accdescr-block-repeat] [fixture:
packet/db-cap-following-block-unpublished] [fixture:
packet/db-cap-later-logical-end] [fixture: packet/gram-block-blank-lines]
[fixture: packet/comment-bare] [fixture: packet/gram-yaml-around-range]
[fixture: packet/lex-hidden-after-visible-eol]

### PacketRangeBlockStatement

| Field             | Type                      | Meaning                           |
| ----------------- | ------------------------- | --------------------------------- |
| `start`           | NumericLiteral            | Written start position.           |
| `textBeforeDash`  | list of PacketIgnoredText | Forms before range dash.          |
| `textBeforeEnd`   | list of PacketIgnoredText | Forms after dash, before end.     |
| `end`             | NumericLiteral            | Written inclusive end.            |
| `textBeforeColon` | list of PacketIgnoredText | Forms before the colon.           |
| `textBeforeLabel` | list of PacketIgnoredText | Forms after colon, before label.  |
| `label`           | StringLiteral             | Authored quoted label.            |
| `textAfter`       | list of PacketIgnoredText | Hidden suffix before visible EOL. |

Child fields: `start`, `textBeforeDash`, `textBeforeEnd`, `end`,
`textBeforeColon`, `textBeforeLabel`, `label`, `textAfter`. Range: the first
start digit through the closing label quote, extended through the last textAfter
form. It excludes outside padding and EOL. This node is only the authored
`start-end: label` form; equal written endpoints still use this node. [fixture:
packet/gram-mixed] [fixture: packet/gram-zero-range] [fixture:
packet/gram-hidden-range-gap-spaced] [fixture: packet/gram-yaml-around-range]

The four interior lists own whole hidden forms only in their named gaps. The
start/end leaves remain the written numbers, even when publication splits the
range. The label is required and may be empty, single-quoted or double-quoted;
no common-value literal replaces it. Comments and global Directives are shared
records, not elements of these lists. [fixture:
packet/gram-hidden-range-gap-spaced] [fixture: packet/db-row-split] [fixture:
packet/db-label-empty-single] [fixture: packet/db-label-empty-double] [fixture:
packet/db-label-single] [fixture: packet/comment-block] [fixture:
packet/directive-label-middle]

### PacketSingleBlockStatement

| Field             | Type                      | Meaning                           |
| ----------------- | ------------------------- | --------------------------------- |
| `start`           | NumericLiteral            | Written single position.          |
| `textBeforeColon` | list of PacketIgnoredText | Forms before the colon.           |
| `textBeforeLabel` | list of PacketIgnoredText | Forms after colon, before label.  |
| `label`           | StringLiteral             | Authored quoted label.            |
| `textAfter`       | list of PacketIgnoredText | Hidden suffix before visible EOL. |

Child fields: `start`, `textBeforeColon`, `textBeforeLabel`, `label`,
`textAfter`. Range: the first start digit through the closing label quote,
extended through the last textAfter form, excluding outside padding and EOL.
This is only `start: label`: do not add an end or count field. textBeforeColon
owns forms after start; textBeforeLabel owns forms after colon. The required
label may be empty or use either quote. [fixture: packet/gram-single-zero]
[fixture: packet/gram-single-hidden-gaps] [fixture: packet/gram-mixed] [fixture:
packet/db-label-empty-double] [fixture: packet/db-label-empty-single] [fixture:
packet/hidden-directive-block-eof]

### PacketRelativeBlockStatement

| Field             | Type                      | Meaning                           |
| ----------------- | ------------------------- | --------------------------------- |
| `textBeforeCount` | list of PacketIgnoredText | Forms after plus, before count.   |
| `count`           | NumericLiteral            | Written unsigned count.           |
| `textBeforeColon` | list of PacketIgnoredText | Forms before the colon.           |
| `textBeforeLabel` | list of PacketIgnoredText | Forms after colon, before label.  |
| `label`           | StringLiteral             | Authored quoted label.            |
| `textAfter`       | list of PacketIgnoredText | Hidden suffix before visible EOL. |

Child fields: `textBeforeCount`, `count`, `textBeforeColon`, `textBeforeLabel`,
`label`, `textAfter`. Range: the authored plus through the closing label quote,
extended through the last textAfter form, excluding outside padding and EOL.
This is only `+count: label`; plus is punctuation outside count.raw. Do not
synthesize start/end fields. Interior lists own forms in the named gaps,
including YAML between plus and count. The required label may be empty or use
either quote. [fixture: packet/gram-mixed] [fixture: packet/gram-gaps] [fixture:
packet/gram-hidden-gap] [fixture: packet/gram-hidden-yaml-gap] [fixture:
packet/gram-relative-hidden-colon] [fixture: packet/db-precision-rounded]

For all three block nodes, textAfter owns hidden forms after the label and
before the first visible EOL. Keep each whole match separately, excluding its
consumed following line terminator from its range. A visible EOL ends this
ownership; later forms are body items. The label and number leaves follow the
shared [StringLiteral](../ast.md#stringliteral) and
[NumericLiteral](../ast.md#numericliteral) contracts: authored raw/interior,
true closed for strings, and double numeric value. Hidden forms cannot divide a
leaf into separate integers. [fixture: packet/lex-hidden-two-suffixes] [fixture:
packet/hidden-directive-block-eof] [fixture: packet/hidden-yaml-crlf] [fixture:
packet/lex-hidden-after-visible-eol] [fixture: packet/db-label-escapes]
[fixture: packet/db-precision-rounded] [fixture:
packet/lex-hidden-between-digits]

### PacketTitleStatement

| Field       | Type                      | Meaning                           |
| ----------- | ------------------------- | --------------------------------- |
| `value`     | PacketLiteral or null     | Authored common value.            |
| `textAfter` | list of PacketIgnoredText | Hidden suffix before visible EOL. |

value starts after title and exactly one ASCII space/tab and ends with its line
value, retaining all remaining padding. It is null without a separator or
without remaining content after common removal; a second separator is a
whitespace literal. [fixture: packet/title-empty] [fixture:
packet/lex-title-one-space] [fixture: packet/lex-title-one-tab] [fixture:
packet/lex-title-two-spaces] [fixture: packet/lex-title-directive-only]
[fixture: packet/hidden-directive-title-eof]

Child fields: `value`, `textAfter`. Range: title through its last value
character, or the keyword when null, extended through the last textAfter form,
excluding EOL and unrelated outside padding. Hidden forms before the first
visible EOL belong to textAfter; after that EOL they belong to body. Keep
repeated and empty occurrences separately. Native comments are shared Comments,
never hidden suffix elements. [fixture: packet/title-empty] [fixture:
packet/lex-title-one-space] [fixture: packet/lex-title-one-tab] [fixture:
packet/lex-title-two-spaces] [fixture: packet/lex-title-directive-only]
[fixture: packet/hidden-directive-title-eof] [fixture:
packet/lex-hidden-after-visible-eol] [fixture: packet/comment-block-description]

### PacketAccTitleStatement

| Field       | Type                      | Meaning                           |
| ----------- | ------------------------- | --------------------------------- |
| `value`     | PacketLiteral or null     | Authored common value.            |
| `textAfter` | list of PacketIgnoredText | Hidden suffix before visible EOL. |

value is the line text immediately after the colon, preserving padding at both
ends. It is null only when no content remains after common removal;
whitespace-only text is a literal. [fixture: packet/acctitle-empty] [fixture:
packet/acctitle-repeat-empty] [fixture: packet/lex-acctitle-directive-only]
[fixture: packet/hidden-directive-acctitle-eof]

Child fields: `value`, `textAfter`. Range: accTitle through its colon or last
value character, extended through the last textAfter form, excluding EOL and
unrelated outside padding. Hidden forms before the first visible EOL belong to
textAfter; after that EOL they belong to body. Keep repeated and empty
occurrences separately. Native comments are shared Comments, never hidden suffix
elements. [fixture: packet/acctitle-empty] [fixture:
packet/acctitle-repeat-empty] [fixture: packet/lex-acctitle-directive-only]
[fixture: packet/hidden-directive-acctitle-eof] [fixture:
packet/lex-hidden-after-visible-eol] [fixture: packet/comment-block-description]

### PacketAccDescrStatement

| Field       | Type                      | Meaning                           |
| ----------- | ------------------------- | --------------------------------- |
| `value`     | PacketLiteral or null     | Authored common value.            |
| `textAfter` | list of PacketIgnoredText | Hidden suffix before visible EOL. |

value is the line text immediately after the colon, preserving padding at both
ends. It is null only when no content remains after common removal;
whitespace-only text is a literal. Brace-looking content after colon remains
this line form. [fixture: packet/accdescr-line-empty] [fixture:
packet/lex-accdescr-whitespace-only] [fixture:
packet/lex-accdescr-directive-only] [fixture:
packet/lex-description-colon-first] [fixture:
packet/hidden-directive-accdescr-eof]

Child fields: `value`, `textAfter`. Range: accDescr through its colon or last
value character, extended through the last textAfter form, excluding EOL and
unrelated outside padding. Hidden forms before the first visible EOL belong to
textAfter; after that EOL they belong to body. Keep repeated and empty
occurrences separately. Native comments are shared Comments, never hidden suffix
elements. [fixture: packet/accdescr-line-empty] [fixture:
packet/lex-accdescr-whitespace-only] [fixture:
packet/lex-accdescr-directive-only] [fixture:
packet/lex-description-colon-first] [fixture:
packet/hidden-directive-accdescr-eof] [fixture:
packet/lex-hidden-after-visible-eol] [fixture: packet/comment-block-description]

### PacketAccDescrBlockStatement

| Field       | Type                      | Meaning                           |
| ----------- | ------------------------- | --------------------------------- |
| `value`     | PacketLiteral or null     | Authored common value.            |
| `textAfter` | list of PacketIgnoredText | Hidden suffix before visible EOL. |

value is the brace interior with common whitespace removed only at its outer
ends. Whitespace/common-directive/comment-region-only content is null. Internal
indentation, source line endings, bare percent lines, quotes and escapes remain
written text. The first closing brace is required, so no closed field is needed;
an empty block still makes this statement. [fixture:
packet/gram-empty-description] [fixture: packet/accdescr-block-lines] [fixture:
packet/lex-description-whitespace-only] [fixture:
packet/lex-description-directive-only] [fixture:
packet/lex-description-comment-only] [fixture: packet/common-block-bare]
[fixture: packet/accdescr-block-open] [fixture:
packet/hidden-directive-description-eof]

Child fields: `value`, `textAfter`. Range: accDescr through its first closing
brace, extended through the last textAfter form, excluding EOL and unrelated
outside padding. Hidden forms before the first visible EOL belong to textAfter;
after that EOL they belong to body. Keep repeated and empty occurrences
separately. Native comments are shared Comments, never hidden suffix elements.
[fixture: packet/gram-empty-description] [fixture: packet/accdescr-block-lines]
[fixture: packet/lex-description-whitespace-only] [fixture:
packet/lex-description-directive-only] [fixture:
packet/lex-description-comment-only] [fixture: packet/common-block-bare]
[fixture: packet/accdescr-block-open] [fixture:
packet/hidden-directive-description-eof] [fixture:
packet/lex-hidden-after-visible-eol] [fixture: packet/comment-block-description]

### PacketLiteral

| Field   | Type   | Meaning                     |
| ------- | ------ | --------------------------- |
| `value` | string | Authored common-value text. |

No child fields. Range: the first through last source character of the value
defined by its statement, spanning internal common trivia. Do not make an empty
literal for null. Leave out common directives, comment regions and selected
semicolons; preserve all other source characters, including source line endings,
quotes, entities and escape spelling. No whitespace collapse or escape decoding
applies. Quote-looking common text remains PacketLiteral and need not close its
quotes. [fixture: packet/common-whitespace] [fixture:
packet/common-block-comment] [fixture: packet/directive-title-value] [fixture:
packet/directive-description-value] [fixture: packet/style-title] [fixture:
packet/html-all-fields] [fixture: packet/entity-all-text] [fixture:
packet/title-open-quote] [fixture: packet/accdescr-block-quoted] [fixture:
packet/accdescr-block-lines]

### PacketIgnoredText

| Field   | Type   | Meaning                        |
| ------- | ------ | ------------------------------ |
| `kind`  | string | yaml-block or directive.       |
| `value` | string | Nonempty authored fenced form. |

No child fields. Range: the `---` or `%%{` opener through its qualifying closer,
excluding preceding padding and any line terminator consumed immediately after
the closer. Keep internal source line endings and padding. The appended LF never
enters a source range/value. Both forms require closers, so no closed field is
needed; even an empty body has a nonempty fenced value. [fixture:
packet/hidden-yaml-adjacent-eof] [fixture: packet/hidden-yaml-padding] [fixture:
packet/hidden-directive-header] [fixture: packet/hidden-directive-block-eof]
[fixture: packet/hidden-yaml-block-eof] [fixture: packet/hidden-directive-cr]
[fixture: packet/hidden-directive-crlf] [fixture: packet/hidden-yaml-cr]
[fixture: packet/hidden-yaml-crlf] [fixture: packet/lex-yaml-body-separators]
[fixture: packet/lex-directive-body-separators]

Leave common directives, comment regions and selected semicolons out of value
while its range spans them. The whole form has no frontmatter/configuration
effect of its own; a recognized global directive inside it keeps its independent
effect. A failed directive-like match may instead be a shared Comment. Earlier
strings/common values own enclosed hidden-looking text. [fixture:
packet/detect-one-block] [fixture: packet/detect-yaml-properties-ignored]
[fixture: packet/lex-hidden-nested-global] [fixture:
packet/lex-yaml-common-comment] [fixture: packet/detect-second-scan-directive]
[fixture: packet/lex-yaml-opener-global] [fixture:
packet/lex-yaml-fence-selected] [fixture: packet/lex-hidden-opener-selected]
[fixture: packet/hidden-directive-close-glued] [fixture:
packet/hidden-yaml-in-label] [fixture: packet/hidden-yaml-in-description]
[fixture: packet/hidden-yaml-title-absorbed]

Each whole match belongs exactly once to textBeforeHeader, body or the
appropriate statement gap/suffix. Never duplicate it as shared
frontmatter/directive data. The
[lexical rules](../diagrams/packet.md#hidden-forms) determine its extent:
body-present YAML can make three fences one match, and two nonempty blocks can
stay separate. [fixture: packet/detect-one-block] [fixture:
packet/detect-yaml-properties-ignored] [fixture: packet/gram-hidden-gap]
[fixture: packet/gram-hidden-range-gap-spaced] [fixture:
packet/gram-hidden-yaml-gap] [fixture: packet/gram-relative-hidden-colon]
[fixture: packet/lex-hidden-two-suffixes] [fixture:
packet/hidden-yaml-adjacent-later] [fixture: packet/lex-yaml-two-nonempty]

## Example

The following authored example shows the three different block nodes; whitespace
is shown only to make their written forms clear. [fixture: packet/gram-mixed]

```mmd
packet
+2: "two"
2: "single"
3-5: "range"
```

PacketDiagram.body contains PacketRelativeBlockStatement with count.raw `2`,
then PacketSingleBlockStatement with start.raw `2`, then
PacketRangeBlockStatement with start.raw `3` and end.raw `5`. The relative node
has no synthesized start/end, the single node has no synthesized end, and the
range stays one node even if its publication spans rows. [fixture:
packet/gram-mixed] [fixture: packet/db-row-split]

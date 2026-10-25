# Architecture nodes

Japanese version: [architecture.ja.md](./architecture.ja.md)

This document defines the source tree for `architecture-beta`. The shared tree
is in [ast.md](../ast.md), syntax and acceptance in
[diagrams/architecture.md](../diagrams/architecture.md). Fields keep authored
text, without Db conversion. Optional fields are present as null, lists may be
empty, and each list preserves source order. Child fields give visitor order.
[fixture: architecture/db-mixed] [fixture: architecture/db-empty-values]
[fixture: architecture/common-repeat-empty] [fixture:
architecture/lex-title-unquoted-fallback] [fixture:
architecture/lex-string-conversion]

## Nodes

### ArchitectureDiagram

| Field              | Type                            | Meaning                              |
| ------------------ | ------------------------------- | ------------------------------------ |
| `textBeforeHeader` | list of ArchitectureIgnoredText | Retained pre-header forms.           |
| `body`             | list of ArchitectureBodyItem    | Written statements and hidden forms. |

Child fields: textBeforeHeader, body. Range: the first retained pre-header form,
or the header if none, through the last written header/body form, excluding
outside padding and line breaks. Root.diagramType is architecture. The fixed
header remains a keyword, without a separate header node or alias field.
[fixture: architecture/header-beta] [fixture:
architecture/detect-retained-before-second-scan] [fixture:
architecture/detect-two-second-scan-forms] [fixture: architecture/db-mixed]

ArchitectureBodyItem is ArchitectureGroupStatement,
ArchitectureServiceStatement, ArchitectureJunctionStatement,
ArchitectureEdgeStatement, ArchitectureAlignmentStatement,
ArchitectureTitleStatement, ArchitectureAccTitleStatement,
ArchitectureAccDescrStatement, ArchitectureAccDescrBlockStatement or
ArchitectureIgnoredText. Keep all occurrences in source order rather than
publication order. Membership stays an in reference; do not move declarations
into parent bodies or synthesize child lists. [fixture: architecture/db-mixed]
[fixture: architecture/db-junction-order] [fixture:
architecture/db-align-forward-repeat] [fixture:
architecture/common-repeat-empty] [fixture:
architecture/db-service-forward-parent]

textBeforeHeader owns matching native YAML and second-scan DIRECTIVE forms
retained at detection. Passed bare percent lines are shared Comments; they and
accompanying passed whitespace/line breaks are not read again and do not extend
ignored-node ranges. Native closing boundaries still apply. Empty/comment-only
lines create no body item. A hidden form after the header, before a statement,
or after a visible EOL is a body item. [fixture:
architecture/detect-retained-before-second-scan] [fixture:
architecture/detect-empty-braces-bare] [fixture:
architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/detect-second-scan-glued] [fixture: architecture/space-lines]
[fixture: architecture/hidden-directive-body] [fixture:
architecture/lex-hidden-after-visible-eol]

### ArchitectureGroupStatement

| Field              | Type                            | Meaning                           |
| ------------------ | ------------------------------- | --------------------------------- |
| `textBeforeId`     | list of ArchitectureIgnoredText | Forms before id.                  |
| `id`               | Identifier                      | Written group ID.                 |
| `textBeforeIcon`   | list of ArchitectureIgnoredText | Forms before opening parenthesis. |
| `icon`             | Identifier or null              | Name inside parentheses.          |
| `textBeforeTitle`  | list of ArchitectureIgnoredText | Forms before opening bracket.     |
| `title`            | ArchitectureLabel or null       | Written bracketed title.          |
| `textBeforeIn`     | list of ArchitectureIgnoredText | Forms before in.                  |
| `textBeforeParent` | list of ArchitectureIgnoredText | Forms after in, before parent.    |
| `in`               | Identifier or null              | Explicit parent reference.        |
| `textAfter`        | list of ArchitectureIgnoredText | Suffix before visible EOL.        |

Child fields: textBeforeId, id, textBeforeIcon, icon, textBeforeTitle, title,
textBeforeIn, textBeforeParent, in, textAfter. Range: group through the written
parent ID, otherwise the title closing bracket, icon closing parenthesis or
declaration ID, in that order of availability; extend through the last textAfter
form. Exclude outside padding and EOL. icon is null only without the
parenthesized form; its Identifier range excludes both parentheses and name
keeps their interior spelling. It follows the icon-name character rule, not the
declaration ID rule. title is null without brackets. in is null without the
entire in clause; no implicit parent or hasIn field is added. [fixture:
architecture/db-mixed] [fixture: architecture/lex-icon-leading-symbols]
[fixture: architecture/db-empty-values] [fixture:
architecture/header-inline-group] [fixture: architecture/hidden-yaml-group-gap]
[fixture: architecture/hidden-yaml-group-eof] [fixture:
architecture/hidden-directive-unit-gaps]

### ArchitectureServiceStatement

| Field              | Type                                | Meaning                        |
| ------------------ | ----------------------------------- | ------------------------------ |
| `textBeforeId`     | list of ArchitectureIgnoredText     | Forms before id.               |
| `id`               | Identifier                          | Written service ID.            |
| `textBeforeIcon`   | list of ArchitectureIgnoredText     | Forms before icon opener.      |
| `icon`             | Identifier or StringLiteral or null | Named or text icon.            |
| `textBeforeTitle`  | list of ArchitectureIgnoredText     | Forms before opening bracket.  |
| `title`            | ArchitectureLabel or null           | Written title.                 |
| `textBeforeIn`     | list of ArchitectureIgnoredText     | Forms before in.               |
| `textBeforeParent` | list of ArchitectureIgnoredText     | Forms after in, before parent. |
| `in`               | Identifier or null                  | Explicit group reference.      |
| `textAfter`        | list of ArchitectureIgnoredText     | Suffix before visible EOL.     |

Child fields: textBeforeId, id, textBeforeIcon, icon, textBeforeTitle, title,
textBeforeIn, textBeforeParent, in, textAfter. Range: service through the parent
ID if present, otherwise the title closing bracket, named icon closing
parenthesis, text icon closing quote or declaration ID; extend through the last
textAfter form, excluding outside padding and EOL. icon is an Identifier whose
range is the parenthesis interior for a named icon, a closed StringLiteral
including its quotes for a text icon, and null without either form. An empty
text icon is still a StringLiteral. title and in are null only when their
complete optional forms are absent. [fixture: architecture/db-mixed] [fixture:
architecture/header-inline-service] [fixture: architecture/db-empty-values]
[fixture: architecture/lex-string-conversion] [fixture:
architecture/directive-empty-text-icon] [fixture:
architecture/hidden-directive-unit-gaps] [fixture:
architecture/hidden-yaml-parent-gap] [fixture:
architecture/hidden-directive-eof]

### ArchitectureJunctionStatement

| Field              | Type                            | Meaning                        |
| ------------------ | ------------------------------- | ------------------------------ |
| `textBeforeId`     | list of ArchitectureIgnoredText | Forms before id.               |
| `id`               | Identifier                      | Written junction ID.           |
| `textBeforeIn`     | list of ArchitectureIgnoredText | Forms before in.               |
| `textBeforeParent` | list of ArchitectureIgnoredText | Forms after in, before parent. |
| `in`               | Identifier or null              | Explicit group reference.      |
| `textAfter`        | list of ArchitectureIgnoredText | Suffix before visible EOL.     |

Child fields: textBeforeId, id, textBeforeIn, textBeforeParent, in, textAfter.
Range: junction through its parent ID when present, otherwise its declaration
ID, extended through the last textAfter form and excluding outside padding/EOL.
in is null without the entire in clause. There is no icon, title or derived
parent/child field. [fixture: architecture/header-inline-junction] [fixture:
architecture/db-junction-forward-parent] [fixture:
architecture/hidden-directive-unit-gaps] [fixture:
architecture/hidden-yaml-junction-gap] [fixture:
architecture/hidden-yaml-junction-eof] [fixture:
architecture/gram-junction-title]

### ArchitectureEdgeStatement

| Field                | Type                            | Meaning                           |
| -------------------- | ------------------------------- | --------------------------------- |
| `lhsId`              | Identifier                      | Written left endpoint.            |
| `textBeforeLhsGroup` | list of ArchitectureIgnoredText | Forms before left modifier.       |
| `lhsGroup`           | boolean                         | Whether left {group} is written.  |
| `textBeforeArrow`    | list of ArchitectureIgnoredText | Forms before left colon.          |
| `arrow`              | ArchitectureArrow               | Port-to-port arrow.               |
| `textBeforeRhsId`    | list of ArchitectureIgnoredText | Forms after right colon.          |
| `rhsId`              | Identifier                      | Written right endpoint.           |
| `textBeforeRhsGroup` | list of ArchitectureIgnoredText | Forms before right modifier.      |
| `rhsGroup`           | boolean                         | Whether right {group} is written. |
| `textAfter`          | list of ArchitectureIgnoredText | Suffix before visible EOL.        |

Child fields: lhsId, textBeforeLhsGroup, textBeforeArrow, arrow,
textBeforeRhsId, rhsId, textBeforeRhsGroup, textAfter. Range: lhsId through the
right modifier closing brace if written, otherwise rhsId, extended through the
last textAfter form; exclude outside padding and EOL. The booleans record
authored modifiers even on ungrouped nodes. They are false exactly when that
modifier is absent. No resolved group name replaces an endpoint. [fixture:
architecture/db-mixed] [fixture: architecture/db-group-modifier-ungrouped]
[fixture: architecture/db-group-modifier-one-group] [fixture:
architecture/gram-hidden-modifier-gaps] [fixture:
architecture/hidden-yaml-edge-eof] [fixture: architecture/end-edge-eof]

### ArchitectureArrow

| Field                      | Type                            | Meaning                                |
| -------------------------- | ------------------------------- | -------------------------------------- |
| `value`                    | string                          | Complete written arrow text.           |
| `textBeforeStartDirection` | list of ArchitectureIgnoredText | Forms after left colon.                |
| `startDirection`           | string                          | Written L, R, T or B.                  |
| `textBeforeStartMarker`    | list of ArchitectureIgnoredText | Forms before written start marker.     |
| `startMarker`              | string                          | Start-marker presence.                 |
| `textBeforeLine`           | list of ArchitectureIgnoredText | Forms before first line dash.          |
| `line`                     | string                          | The solid line.                        |
| `textBeforeTitle`          | list of ArchitectureIgnoredText | Forms before label opener.             |
| `title`                    | ArchitectureLabel or null       | Label between single dashes.           |
| `textBeforeEndDash`        | list of ArchitectureIgnoredText | Forms before labelled-line final dash. |
| `textBeforeEndMarker`      | list of ArchitectureIgnoredText | Forms before written end marker.       |
| `endMarker`                | string                          | End-marker presence.                   |
| `textBeforeEndDirection`   | list of ArchitectureIgnoredText | Forms before right direction.          |
| `endDirection`             | string                          | Written L, R, T or B.                  |
| `textBeforeEndColon`       | list of ArchitectureIgnoredText | Forms before right colon.              |

Child fields: textBeforeStartDirection, textBeforeStartMarker, textBeforeLine,
textBeforeTitle, title, textBeforeEndDash, textBeforeEndMarker,
textBeforeEndDirection, textBeforeEndColon. Range: the left colon through the
right colon. value keeps that whole written text, including internal padding,
authored line endings, label syntax and native ignored forms; leave common
directives, comment regions and selected semicolons out of value while the range
spans them. Do not decode escapes or normalize marker spelling. [fixture:
architecture/db-mixed] [fixture: architecture/hidden-directive-unit-gaps]
[fixture: architecture/hidden-yaml-edge-gaps] [fixture:
architecture/directive-fields] [fixture: architecture/style-fields] [fixture:
architecture/gram-edge-reversed-labeled-markers]

startDirection/endDirection are the fixed written port directions. Each marker
field is arrow when < or > is written at that end and none when absent. The
actual character, including reversed spellings, stays in value. line is always
solid. title is null for double dash and an ArchitectureLabel for single dash,
label, single dash; an empty quoted label is not null. textBeforeEndDash is
empty without title. [fixture: architecture/db-directions] [fixture:
architecture/gram-edge-reversed-labeled-markers] [fixture:
architecture/db-empty-values] [fixture: architecture/db-mixed] [fixture:
architecture/end-edge-eof]

### ArchitectureAlignmentStatement

| Field                 | Type                                | Meaning                            |
| --------------------- | ----------------------------------- | ---------------------------------- |
| `textBeforeDirection` | list of ArchitectureIgnoredText     | Forms between align and direction. |
| `direction`           | string                              | Written row or column.             |
| `members`             | list of ArchitectureAlignmentMember | Members in authored order.         |
| `textAfter`           | list of ArchitectureIgnoredText     | Suffix before visible EOL.         |

Child fields: textBeforeDirection, members, textAfter. Range: align through the
last member ID, extended through the last textAfter form, excluding outside
padding and EOL. members has at least two entries. Keep every statement and
member order, including repeated alignment statements; do not sort members or
merge constraints. No layout result is a tree field. [fixture:
architecture/db-align-forward-repeat] [fixture: architecture/db-mixed] [fixture:
architecture/hidden-yaml-align-gap] [fixture:
architecture/hidden-directive-align-eof] [fixture: architecture/error-align-one]
[fixture: architecture/db-align-layout-conflict]

### ArchitectureAlignmentMember

| Field          | Type                            | Meaning                      |
| -------------- | ------------------------------- | ---------------------------- |
| `textBeforeId` | list of ArchitectureIgnoredText | Forms before this member ID. |
| `id`           | Identifier                      | Written member reference.    |

Child fields: textBeforeId, id. Range: the first textBeforeId form, or id if
none, through id. This member owns the entire native hidden gap immediately
before its ID, also for the first member. Ordinary whitespace and shared trivia
are not elements. No implicit members or null holes are added. [fixture:
architecture/hidden-yaml-align-gap] [fixture:
architecture/hidden-directive-unit-gaps] [fixture:
architecture/db-align-forward-repeat]

### ArchitectureTitleStatement

| Field       | Type                            | Meaning                           |
| ----------- | ------------------------------- | --------------------------------- |
| `value`     | ArchitectureLiteral or null     | Written common value.             |
| `textAfter` | list of ArchitectureIgnoredText | Hidden suffix before visible EOL. |

value begins after title and exactly one ASCII space/tab separator, keeping all
remaining line padding. It is null without a separator or when no content
remains; an additional separator is a whitespace literal. Range: title through
its last value character, or the keyword when null, extended through textAfter.
Exclude EOL and unrelated outside padding. [fixture:
architecture/common-title-next-statement] [fixture:
architecture/lex-title-one-space-null] [fixture:
architecture/lex-title-one-tab-null] [fixture:
architecture/lex-title-two-spaces-literal] [fixture:
architecture/common-repeat-empty]

Child fields: value, textAfter. Keep repeated and empty occurrences separately.
Forms before the first visible EOL belong to textAfter; after that EOL they
belong to body. Native comments are shared Comments rather than suffix elements.
[fixture: architecture/common-repeat-empty] [fixture:
architecture/hidden-directive-title-eof] [fixture:
architecture/lex-hidden-after-visible-eol] [fixture:
architecture/end-statements-comments]

### ArchitectureAccTitleStatement

| Field       | Type                            | Meaning                           |
| ----------- | ------------------------------- | --------------------------------- |
| `value`     | ArchitectureLiteral or null     | Written common value.             |
| `textAfter` | list of ArchitectureIgnoredText | Hidden suffix before visible EOL. |

value is the line text immediately after the colon, preserving padding at both
ends. It is null only when no content remains; whitespace-only text is a
literal. Range: accTitle through its colon or last value character, extended
through textAfter and excluding EOL and unrelated outside padding. [fixture:
architecture/lex-acctitle-whitespace-only] [fixture:
architecture/common-acctitle-next-statement] [fixture:
architecture/common-repeat-empty]

Child fields: value, textAfter. Keep repeated and empty occurrences separately.
Forms before the first visible EOL belong to textAfter; after that EOL they
belong to body. Native comments are shared Comments rather than suffix elements.
[fixture: architecture/common-repeat-empty] [fixture:
architecture/hidden-directive-acctitle-eof] [fixture:
architecture/lex-hidden-after-visible-eol] [fixture:
architecture/end-statements-comments]

### ArchitectureAccDescrStatement

| Field       | Type                            | Meaning                           |
| ----------- | ------------------------------- | --------------------------------- |
| `value`     | ArchitectureLiteral or null     | Written common value.             |
| `textAfter` | list of ArchitectureIgnoredText | Hidden suffix before visible EOL. |

value is the line text immediately after the colon, preserving padding at both
ends. It is null only when no content remains; whitespace-only text is a
literal. Range: accDescr through its colon or last value character, extended
through textAfter and excluding EOL and unrelated outside padding. [fixture:
architecture/lex-description-line-whitespace-only] [fixture:
architecture/common-accdescr-next-statement] [fixture:
architecture/common-repeat-empty]

Child fields: value, textAfter. Keep repeated and empty occurrences separately.
Forms before the first visible EOL belong to textAfter; after that EOL they
belong to body. Native comments are shared Comments rather than suffix elements.
[fixture: architecture/common-repeat-empty] [fixture:
architecture/hidden-directive-accdescr-eof] [fixture:
architecture/lex-hidden-after-visible-eol] [fixture:
architecture/end-statements-comments]

### ArchitectureAccDescrBlockStatement

| Field       | Type                            | Meaning                           |
| ----------- | ------------------------------- | --------------------------------- |
| `value`     | ArchitectureLiteral or null     | Written common value.             |
| `textAfter` | list of ArchitectureIgnoredText | Hidden suffix before visible EOL. |

value is the brace interior with common whitespace removed only at its outer
ends. Whitespace, common-directive or comment-region-only content is null.
Retain internal indentation, source line endings, quotes, escapes and bare
percent lines. Range: accDescr through the first closing brace, extended through
textAfter, excluding EOL and unrelated outside padding. The closer is required;
no closed field is needed. [fixture:
architecture/common-empty-block-after-value] [fixture:
architecture/lex-description-block-whitespace-only] [fixture:
architecture/common-description-block-comment] [fixture:
architecture/common-description-block-directive] [fixture:
architecture/common-block-whitespace] [fixture: architecture/common-block-open]

Child fields: value, textAfter. Keep repeated and empty occurrences separately.
Forms before the first visible EOL belong to textAfter; after that EOL they
belong to body. Native comments are shared Comments rather than suffix elements.
[fixture: architecture/common-repeat-empty] [fixture:
architecture/hidden-directive-block-eof] [fixture:
architecture/lex-hidden-after-visible-eol] [fixture:
architecture/end-statements-comments]

### ArchitectureLabel

| Field   | Type   | Meaning                             |
| ------- | ------ | ----------------------------------- |
| `kind`  | string | First complete lexical alternative. |
| `value` | string | Authored label content.             |

No child fields. Range: opening bracket through closing bracket. kind is string
only when a complete single-quoted or double-quoted alternative starts
immediately after the opening bracket and ends immediately before its closer.
Otherwise it is text. For string, value excludes brackets and the matching quote
pair; for text it excludes only brackets. Quote characters, including their
single/double spelling, remain in the authored syntax covered by the range. Do
not infer kind from converter output. [fixture:
architecture/lex-title-quoted-brackets] [fixture:
architecture/lex-title-padded-quotes] [fixture:
architecture/lex-title-unclosed-quote-with-close] [fixture:
architecture/lex-title-unquoted-fallback] [fixture:
architecture/lex-title-unescaped-quote-fallback] [fixture:
architecture/lex-title-cross-quote-escape]

value preserves interior whitespace, authored line endings, entities and escape
spelling. Common directives, comment regions and selected semicolons are omitted
as written-text trivia; no other trimming, whitespace collapse or escape
decoding applies. Quoted-empty is string with an empty value; bare whitespace is
text with that whitespace. There is no empty bare label or unclosed bracketed
label. [fixture: architecture/lex-title-conversion] [fixture:
architecture/db-empty-values] [fixture: architecture/line-cr-title] [fixture:
architecture/line-ls-ps-values] [fixture: architecture/directive-fields]
[fixture: architecture/comment-in-quoted-label] [fixture:
architecture/style-fields] [fixture: architecture/lex-title-empty-unquoted]
[fixture: architecture/lex-title-unclosed] [fixture:
architecture/directive-empty-bare-label]

Choose the label alternative on the common converted diagram text. Its kind
therefore respects HTML attribute-quote conversion and selected semicolons,
while its value keeps the authored text under the written-value rules. [fixture:
architecture/html-label-authored-quotes] [fixture:
architecture/lex-label-selected-semicolon-after-quote]

### ArchitectureLiteral

| Field   | Type   | Meaning                    |
| ------- | ------ | -------------------------- |
| `value` | string | Written common-value text. |

No child fields. Range: the first through last authored character of the value
defined by its statement, spanning internal common trivia. Leave out common
directives, comment regions and selected semicolons from value; preserve
everything else, including source line endings, quotes, entities, escapes and
the whitespace owned by that statement. No empty literal is made for null.
Quote-looking common text remains ArchitectureLiteral, without requiring closed
quotes. [fixture: architecture/common-title-literal-quotes] [fixture:
architecture/common-line-whitespace] [fixture:
architecture/common-block-whitespace] [fixture:
architecture/common-quotes-entities] [fixture: architecture/directive-fields]
[fixture: architecture/common-description-block-comment] [fixture:
architecture/style-fields] [fixture: architecture/lex-title-two-spaces-literal]

### ArchitectureIgnoredText

| Field   | Type   | Meaning                             |
| ------- | ------ | ----------------------------------- |
| `kind`  | string | Whole native hidden form.           |
| `value` | string | Nonempty authored form with fences. |

No child fields. Range: the recognized --- or %%{ opener through its selected
closer. Exclude preceding padding and any consumed following LF. Keep interior
authored line endings and padding; the appended LF never enters range or value.
value omits internal common directives, comment regions and selected semicolons
while its range spans them. Even an empty body has nonempty fenced text. Both
forms require closers; failed directive forms that become comments use shared
Comment records instead. [fixture: architecture/hidden-yaml-adjacent-eof]
[fixture: architecture/hidden-yaml-open-padding] [fixture:
architecture/hidden-yaml-crlf] [fixture: architecture/hidden-directive-eof]
[fixture: architecture/hidden-directive-crlf] [fixture:
architecture/lex-yaml-ls-ps-body] [fixture:
architecture/lex-yaml-global-directive] [fixture:
architecture/lex-yaml-common-comment] [fixture:
architecture/hidden-directive-close-glued] [fixture:
architecture/lex-yaml-global-opener] [fixture:
architecture/lex-yaml-selected-semicolon] [fixture:
architecture/lex-native-directive-selected-semicolon] [fixture:
architecture/lex-native-directive-common-comment]

Use yaml-block for native YAML and directive for native DIRECTIVE. These values
do not become YAML properties or root frontmatter/directive data; an independent
common directive inside keeps its common effect. An earlier enclosing string,
label or common value owns hidden-looking text as content. Each whole hidden
match is retained exactly once in its owner. A three-fence match is one node;
two separate nonempty matches are two nodes. [fixture:
architecture/detect-retained-before-second-scan] [fixture:
architecture/lex-yaml-global-directive] [fixture:
architecture/hidden-directive-inside-values] [fixture:
architecture/hidden-yaml-inside-values] [fixture:
architecture/hidden-yaml-three-fences] [fixture:
architecture/lex-yaml-two-nonempty]

### Gap ownership

Every gap field is a source-ordered list of ArchitectureIgnoredText. A field
before an optional component is empty when that component is absent; forms go to
the gap before the next component that is actually present, or textAfter when no
component follows before EOL. Shared Comments, Directives, ordinary whitespace
and selected semicolons are never gap elements. Within a statement, hidden LF
consumption can span source lines without creating visible EOL. [fixture:
architecture/hidden-directive-unit-gaps] [fixture:
architecture/hidden-yaml-service-gap] [fixture:
architecture/hidden-yaml-edge-gaps] [fixture:
architecture/hidden-yaml-align-gap] [fixture:
architecture/lex-hidden-two-suffixes] [fixture:
architecture/end-statements-comments]

textBeforeIcon/title precede the whole parenthesis/quote/bracket opener.
textBeforeIn precedes in; textBeforeParent follows it. Edge modifier gaps
precede the whole {group}. Arrow textBeforeLine precedes -- or the first single
dash, textBeforeEndDash precedes the dash after a label, and textBeforeEndColon
precedes the final colon. The gap after that colon is Edge.textBeforeRhsId.
Absent marker gaps are empty and forms go to the next present component.
Compound icon/modifier interiors do not hold native hidden gap elements.
[fixture: architecture/hidden-directive-unit-gaps] [fixture:
architecture/hidden-yaml-parent-gap] [fixture:
architecture/hidden-yaml-edge-gaps] [fixture:
architecture/gram-hidden-modifier-gaps] [fixture:
architecture/gram-hidden-inside-icon] [fixture:
architecture/gram-hidden-inside-modifier]

## Example

The following authored diagram has a flat body: group, service, junction, edge,
alignment. The service and junction refer to g through in; the arrow owns its
bracketed title and keeps both marker characters in value. The example
illustrates source structure, not derived layout. [fixture:
architecture/db-mixed] [fixture: architecture/db-group-modifier-junction]
[fixture: architecture/gram-written-tree]

```mmd
architecture-beta
  group g(cloud)[Group]
  service a "A" [Service] in g
  junction j in g
  a:R <-[link]-> L:j
  align row a j
```

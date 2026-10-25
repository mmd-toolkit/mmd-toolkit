# Radar nodes

Japanese version: [radar.ja.md](./radar.ja.md)

This document defines the source tree of radar. [ast.md](../ast.md) defines
shared leaves and invariants; [diagrams/radar.md](../diagrams/radar.md) defines
syntax and acceptance. Fields preserve authored values, without Db conversion.
Optional fields remain present as null; lists preserve source order, and gap
lists may be empty. Child fields specify visitor order. [fixture:
radar/gram-written-tree] [fixture: radar/db-empty-labels] [fixture:
radar/db-options-repeat] [fixture: radar/common-repeat-empty]

Identifiers keep their authored names. A label's StringLiteral.raw keeps both
original quotes and all intervening source text; value keeps the unconverted
interior, leaving out common trivia, and closed is true. Empty quoted labels
remain StringLiteral nodes. NumericLiteral.raw preserves every digit and dot;
its numeric value follows the shared double-precision definition, including
non-finite values, without replacing raw with a converted spelling. These shared
leaves have their own authored ranges. [fixture: radar/db-empty-labels]
[fixture: radar/lex-string-conversion] [fixture: radar/directive-axis-label]
[fixture: radar/db-number-leading-zero-decimal] [fixture:
radar/db-number-overflow] [fixture: radar/db-number-rounded]

## Nodes

### RadarDiagram

| Field              | Type                     | Meaning                               |
| ------------------ | ------------------------ | ------------------------------------- |
| `textBeforeHeader` | list of RadarIgnoredText | Retained pre-header forms.            |
| `textBeforeColon`  | list of RadarIgnoredText | Forms before a separate header colon. |
| `body`             | list of RadarBodyItem    | Written statements and hidden forms.  |

Child fields: textBeforeHeader, textBeforeColon, body. Range: the first retained
pre-header form, or the header if none, through the last written header/body
form; exclude outside padding and line breaks. Root.diagramType is radar. The
three header spellings stay in keyword/punctuation syntax, without a header
node, alias field or colon flag. [fixture: radar/header-colon-inline] [fixture:
radar/header-separated-colon] [fixture: radar/header-colon-hidden] [fixture:
radar/detect-secondscan-native] [fixture:
radar/detect-yaml-before-secondscan-native] [fixture: radar/gram-written-tree]

textBeforeHeader holds native hidden-yaml and second-scan hidden-directive forms
retained from detection. Passed bare percent lines are shared Comments; their
accompanying passed whitespace/line breaks are trivia, not read again or added
to retained-node ranges. Multiple retained forms remain separate, under their
native closing boundaries. [fixture: radar/retained-yaml-control] [fixture:
radar/detect-secondscan-native] [fixture: radar/detect-secondscan-native-glued]
[fixture: radar/detect-secondscan-native-twice] [fixture:
radar/detect-yaml-before-secondscan-native] [fixture:
radar/div-detect-yaml-bare-secondscan-native-ls] [fixture:
radar/detect-yaml-bare-secondscan-native-ascii] [fixture:
radar/detect-secondscan-native-nbsp]

textBeforeColon is nonempty only for native hidden forms between the header word
and a written separate colon. Without that colon the list is empty and
post-header hidden forms begin body. A visible newline cannot precede a separate
colon; a hidden form may consume a physical LF there. The joined-colon form has
no native interior gap. [fixture: radar/header-colon-newline] [fixture:
radar/header-colon-hidden] [fixture: radar/header-native-glued] [fixture:
radar/header-colon-yaml] [fixture: radar/gram-directive-composite-header]
[fixture: radar/header-separated-colon]

RadarBodyItem is RadarAxisStatement, RadarCurveStatement, RadarOptionsStatement,
RadarTitleStatement, RadarAccTitleStatement, RadarAccDescrStatement,
RadarAccDescrBlockStatement or RadarIgnoredText. Keep every occurrence in source
order, not publication order. Empty/comment-only lines make no body item. Hidden
forms after the header or after a visible statement-ending EOL belong to body.
[fixture: radar/gram-written-tree] [fixture: radar/gram-common-interleaved]
[fixture: radar/db-forward-axis] [fixture: radar/common-repeat-empty] [fixture:
radar/space-lines] [fixture: radar/lex-hidden-after-visible-eol] [fixture:
radar/lex-hidden-yaml-two-nonempty]

### RadarAxisStatement

| Field  | Type              | Meaning                                 |
| ------ | ----------------- | --------------------------------------- |
| `axes` | list of RadarAxis | Written comma group; at least one axis. |

Child fields: axes. Range: the axis keyword through the end of its last
RadarAxis, including that member's suffix but excluding EOL and outside padding.
One axis keyword owns one nonempty comma-separated group. Separate axis keywords
make separate statements, even on the same line. Commas remain punctuation, not
separator nodes or extra array fields. [fixture: radar/gram-written-tree]
[fixture: radar/db-all-fields] [fixture: radar/gram-inline-statements] [fixture:
radar/lex-hidden-axis-comma] [fixture: radar/gram-axis-trailing-comma]

### RadarCurveStatement

| Field    | Type               | Meaning                                  |
| -------- | ------------------ | ---------------------------------------- |
| `curves` | list of RadarCurve | Written comma group; at least one curve. |

Child fields: curves. Range: the curve keyword through the end of its last
RadarCurve, including its suffix, excluding EOL and outside padding. Each
written curve keyword starts a new group. Keep all curves, including duplicate
names and curves with different entry forms within this group. Commas remain
punctuation. [fixture: radar/gram-written-tree] [fixture:
radar/db-duplicate-curves] [fixture: radar/lex-hidden-curve-comma] [fixture:
radar/gram-curve-kind-per-curve] [fixture: radar/gram-curve-trailing-comma]

### RadarOptionsStatement

| Field     | Type                | Meaning                                   |
| --------- | ------------------- | ----------------------------------------- |
| `options` | list of RadarOption | Written comma group; at least one option. |

Child fields: options. Range: the first option keyword through the last option,
including its suffix but excluding EOL and outside padding. RadarOption is
RadarShowLegendOption, RadarTicksOption, RadarMaxOption, RadarMinOption or
RadarGraticuleOption. Keep every repeated assignment and comma. An adjacent
option without a comma begins a different RadarOptionsStatement; no
effective-options object replaces the list. [fixture: radar/gram-written-tree]
[fixture: radar/db-options-repeat] [fixture: radar/gram-inline-statements]
[fixture: radar/gram-option-number-adjacent] [fixture:
radar/gram-option-bool-adjacent] [fixture: radar/lex-hidden-option-comma]
[fixture: radar/gram-option-comma-trailing]

### RadarAxis

| Field                  | Type                     | Meaning                                 |
| ---------------------- | ------------------------ | --------------------------------------- |
| `textBefore`           | list of RadarIgnoredText | Forms after axis or its comma.          |
| `name`                 | Identifier               | Written axis name.                      |
| `textBeforeLabel`      | list of RadarIgnoredText | Forms before the opening bracket.       |
| `textBeforeLabelValue` | list of RadarIgnoredText | Forms after the opening bracket.        |
| `label`                | StringLiteral or null    | Written quoted label.                   |
| `textBeforeLabelClose` | list of RadarIgnoredText | Forms before the closing bracket.       |
| `textAfter`            | list of RadarIgnoredText | Suffix before comma/next statement/EOL. |

Child fields: textBefore, name, textBeforeLabel, textBeforeLabelValue, label,
textBeforeLabelClose, textAfter. Range: the first textBefore form, or name if
none, through the closing label bracket if written, otherwise name; extend
through textAfter. name keeps the id spelling. label is null only when the
entire bracketed form is absent; an empty string is a StringLiteral. Without a
label all three label-gap lists are empty, and following hidden forms go to
textAfter. [fixture: radar/gram-written-tree] [fixture: radar/db-empty-labels]
[fixture: radar/lex-id-underscore] [fixture: radar/hidden-native-axis] [fixture:
radar/hidden-native-label-gap] [fixture: radar/lex-hidden-before-label-open]
[fixture: radar/lex-hidden-before-label-close] [fixture:
radar/lex-hidden-axis-comma] [fixture: radar/hidden-yaml-after-axis]

### RadarCurve

| Field                  | Type                     | Meaning                             |
| ---------------------- | ------------------------ | ----------------------------------- |
| `textBefore`           | list of RadarIgnoredText | Forms after curve or its comma.     |
| `name`                 | Identifier               | Written curve name.                 |
| `textBeforeLabel`      | list of RadarIgnoredText | Forms before the opening bracket.   |
| `textBeforeLabelValue` | list of RadarIgnoredText | Forms after the opening bracket.    |
| `label`                | StringLiteral or null    | Written quoted label.               |
| `textBeforeLabelClose` | list of RadarIgnoredText | Forms before the closing bracket.   |
| `textBeforeEntries`    | list of RadarIgnoredText | Forms before the opening brace.     |
| `entries`              | list of RadarEntry       | All authored entries; at least one. |
| `textAfter`            | list of RadarIgnoredText | Suffix after the closing brace.     |

Child fields: textBefore, name, textBeforeLabel, textBeforeLabelValue, label,
textBeforeLabelClose, textBeforeEntries, entries, textAfter. Range: the first
textBefore form, or name if none, through the closing entry brace, extended
through textAfter. label is null only without brackets. The label-gap lists are
empty when no label is written. textBeforeEntries follows the name or closing
label bracket and precedes the opening brace; forms there are not put in an
absent label gap. [fixture: radar/gram-written-tree] [fixture:
radar/db-empty-labels] [fixture: radar/hidden-native-curve] [fixture:
radar/hidden-native-curve-gap] [fixture: radar/lex-hidden-curve-comma] [fixture:
radar/hidden-yaml-after-curve] [fixture: radar/lex-curve-label-hidden-gaps]

RadarEntry is RadarNumberEntry or RadarNamedEntry. A curve's nonempty entries
list uses only one of those two types, in written order. A different curve may
use the other type. Keep extra names and duplicate entries; do not resolve them
to axis indices, reorder them or replace them with the published numeric array.
Entry commas remain curve punctuation, and an omitted colon stays omitted.
[fixture: radar/gram-written-tree] [fixture: radar/db-extra-detailed-entry]
[fixture: radar/db-duplicate-axes] [fixture: radar/db-detailed-zero-first]
[fixture: radar/gram-detailed-colon-mixed-spelling] [fixture:
radar/gram-curve-kind-per-curve] [fixture:
radar/gram-entry-mixed-detailed-first] [fixture:
radar/spec-radar-test-ts-59721355]

### RadarNumberEntry

| Field        | Type                     | Meaning                           |
| ------------ | ------------------------ | --------------------------------- |
| `textBefore` | list of RadarIgnoredText | Forms before the number.          |
| `value`      | NumericLiteral           | Written positional value.         |
| `textAfter`  | list of RadarIgnoredText | Forms before comma/closing brace. |

Child fields: textBefore, value, textAfter. Range: the first textBefore form, or
number if none, through the number or last textAfter form. Before the first
entry and after a comma, textBefore may follow permitted visible newlines.
textAfter belongs before the following comma or, for the last entry, the closing
brace; permitted trailing newlines do not move an interior form into diagram
body. No axis or implicit index is added. [fixture: radar/gram-written-tree]
[fixture: radar/lex-hidden-entry-comma] [fixture:
radar/lex-hidden-before-first-entry] [fixture:
radar/lex-hidden-before-entries-close] [fixture:
radar/gram-entry-newline-after-comma] [fixture:
radar/gram-entry-before-comma-native-spare] [fixture:
radar/db-positional-no-axis] [fixture:
radar/lex-number-entry-hidden-across-lines]

### RadarNamedEntry

| Field             | Type                     | Meaning                           |
| ----------------- | ------------------------ | --------------------------------- |
| `textBefore`      | list of RadarIgnoredText | Forms before the axis name.       |
| `axis`            | Identifier               | Written axis reference.           |
| `textBeforeColon` | list of RadarIgnoredText | Forms before a written colon.     |
| `textBeforeValue` | list of RadarIgnoredText | Forms before the number.          |
| `value`           | NumericLiteral           | Written named value.              |
| `textAfter`       | list of RadarIgnoredText | Forms before comma/closing brace. |

Child fields: textBefore, axis, textBeforeColon, textBeforeValue, value,
textAfter. Range: the first textBefore form, or axis if none, through the number
or last textAfter form. axis is the written id, not its resolved declaration or
label. With a written colon, textBeforeColon lies between the name and colon,
and textBeforeValue follows the colon. Without a colon, textBeforeColon is empty
and textBeforeValue owns all native hidden forms between name and number. Colon
presence remains punctuation without an AST flag. [fixture:
radar/gram-written-tree] [fixture: radar/gram-detailed-colon-mixed-spelling]
[fixture: radar/gram-detailed-entry-comment] [fixture:
radar/lex-hidden-detailed-before-colon] [fixture:
radar/lex-hidden-detailed-no-colon] [fixture: radar/hidden-native-entry-gap]
[fixture: radar/error-reference-label] [fixture: radar/db-extra-detailed-entry]

The entry's textBefore may follow the opening brace or comma and their permitted
newlines. Its textAfter owns forms before the next comma, or before the closing
brace for the last entry, also across allowed trailing newlines. Ordinary
whitespace and shared trivia do not become gap elements. The value's raw
spelling is never replaced by a reordered or rounded publication spelling.
[fixture: radar/gram-detailed-entry-comment] [fixture:
radar/lex-hidden-detailed-before-colon] [fixture:
radar/lex-hidden-detailed-no-colon] [fixture: radar/db-number-rounded] [fixture:
radar/gram-written-tree] [fixture: radar/lex-named-entry-hidden-across-lines]

### RadarShowLegendOption

| Field             | Type                     | Meaning                                 |
| ----------------- | ------------------------ | --------------------------------------- |
| `textBefore`      | list of RadarIgnoredText | Forms after the preceding group comma.  |
| `textBeforeValue` | list of RadarIgnoredText | Forms after the option keyword.         |
| `value`           | string                   | Written true or false.                  |
| `textAfter`       | list of RadarIgnoredText | Suffix before comma/next statement/EOL. |

Child fields: textBefore, textBeforeValue, textAfter. Range: the first
textBefore form, or showLegend if none, through its written value, extended
through textAfter. textBefore is empty for the first option in its group;
preceding hidden forms belong to the preceding statement's suffix or diagram
body. textBeforeValue follows the complete keyword. Keep every occurrence,
including overwritten assignments. [fixture: radar/gram-written-tree] [fixture:
radar/db-options-repeat] [fixture: radar/lex-hidden-option-comma] [fixture:
radar/hidden-native-option]

value is the fixed written word true or false as a string, not a converted
boolean or a child leaf. Its unit provides the source position; no separate
name/raw field is added. [fixture: radar/gram-written-tree] [fixture:
radar/db-options-repeat] [fixture: radar/gram-option-boolean-number] [fixture:
radar/div-directive-boolean-atom] [fixture: radar/div-semicolon-boolean-atom]

### RadarTicksOption

| Field             | Type                     | Meaning                                 |
| ----------------- | ------------------------ | --------------------------------------- |
| `textBefore`      | list of RadarIgnoredText | Forms after the preceding group comma.  |
| `textBeforeValue` | list of RadarIgnoredText | Forms after the option keyword.         |
| `value`           | NumericLiteral           | Written tick value before any cap.      |
| `textAfter`       | list of RadarIgnoredText | Suffix before comma/next statement/EOL. |

Child fields: textBefore, textBeforeValue, value, textAfter. Range: the first
textBefore form, or ticks if none, through its written value, extended through
textAfter. textBefore is empty for the first option in its group; preceding
hidden forms belong to the preceding statement's suffix or diagram body.
textBeforeValue follows the complete keyword. Keep every occurrence, including
overwritten assignments. [fixture: radar/gram-written-tree] [fixture:
radar/db-options-repeat] [fixture: radar/lex-hidden-option-comma] [fixture:
radar/hidden-native-option]

value is the shared NumericLiteral with its original raw spelling, including
fractional precision or overflow. It is not replaced with an effective option
value. [fixture: radar/gram-written-tree] [fixture: radar/db-option-overflow]
[fixture: radar/db-ticks-cap-fraction]

### RadarMaxOption

| Field             | Type                     | Meaning                                 |
| ----------------- | ------------------------ | --------------------------------------- |
| `textBefore`      | list of RadarIgnoredText | Forms after the preceding group comma.  |
| `textBeforeValue` | list of RadarIgnoredText | Forms after the option keyword.         |
| `value`           | NumericLiteral           | Written maximum.                        |
| `textAfter`       | list of RadarIgnoredText | Suffix before comma/next statement/EOL. |

Child fields: textBefore, textBeforeValue, value, textAfter. Range: the first
textBefore form, or max if none, through its written value, extended through
textAfter. textBefore is empty for the first option in its group; preceding
hidden forms belong to the preceding statement's suffix or diagram body.
textBeforeValue follows the complete keyword. Keep every occurrence, including
overwritten assignments. [fixture: radar/gram-written-tree] [fixture:
radar/db-options-repeat] [fixture: radar/lex-hidden-option-comma] [fixture:
radar/hidden-native-option]

value is the shared NumericLiteral with its original raw spelling, including
fractional precision or overflow. It is not replaced with an effective option
value. [fixture: radar/gram-written-tree] [fixture: radar/db-option-overflow]
[fixture: radar/db-ticks-cap-fraction]

### RadarMinOption

| Field             | Type                     | Meaning                                 |
| ----------------- | ------------------------ | --------------------------------------- |
| `textBefore`      | list of RadarIgnoredText | Forms after the preceding group comma.  |
| `textBeforeValue` | list of RadarIgnoredText | Forms after the option keyword.         |
| `value`           | NumericLiteral           | Written minimum.                        |
| `textAfter`       | list of RadarIgnoredText | Suffix before comma/next statement/EOL. |

Child fields: textBefore, textBeforeValue, value, textAfter. Range: the first
textBefore form, or min if none, through its written value, extended through
textAfter. textBefore is empty for the first option in its group; preceding
hidden forms belong to the preceding statement's suffix or diagram body.
textBeforeValue follows the complete keyword. Keep every occurrence, including
overwritten assignments. [fixture: radar/gram-written-tree] [fixture:
radar/db-options-repeat] [fixture: radar/lex-hidden-option-comma] [fixture:
radar/hidden-native-option]

value is the shared NumericLiteral with its original raw spelling, including
fractional precision or overflow. It is not replaced with an effective option
value. [fixture: radar/gram-written-tree] [fixture: radar/db-option-overflow]
[fixture: radar/db-ticks-cap-fraction]

### RadarGraticuleOption

| Field             | Type                     | Meaning                                 |
| ----------------- | ------------------------ | --------------------------------------- |
| `textBefore`      | list of RadarIgnoredText | Forms after the preceding group comma.  |
| `textBeforeValue` | list of RadarIgnoredText | Forms after the option keyword.         |
| `value`           | string                   | Written circle or polygon.              |
| `textAfter`       | list of RadarIgnoredText | Suffix before comma/next statement/EOL. |

Child fields: textBefore, textBeforeValue, textAfter. Range: the first
textBefore form, or graticule if none, through its written value, extended
through textAfter. textBefore is empty for the first option in its group;
preceding hidden forms belong to the preceding statement's suffix or diagram
body. textBeforeValue follows the complete keyword. Keep every occurrence,
including overwritten assignments. [fixture: radar/gram-written-tree] [fixture:
radar/db-options-repeat] [fixture: radar/lex-hidden-option-comma] [fixture:
radar/hidden-native-option]

value is the fixed written word circle or polygon, not a StringLiteral or
Identifier child. Quotes and other spellings are rejected by the syntax.
[fixture: radar/gram-written-tree] [fixture: radar/db-options-repeat] [fixture:
radar/gram-option-graticule-string] [fixture: radar/gram-option-graticule-case]
[fixture: radar/div-directive-graticule-atom] [fixture:
radar/div-semicolon-graticule-atom]

### RadarTitleStatement

| Field       | Type                     | Meaning                           |
| ----------- | ------------------------ | --------------------------------- |
| `value`     | RadarLiteral or null     | Authored common value.            |
| `textAfter` | list of RadarIgnoredText | Hidden suffix before visible EOL. |

value begins after title and exactly one ASCII space/tab, retaining all
remaining line padding. It is null without that separator or when no content
remains. A second separator is a whitespace literal. [fixture:
radar/lex-common-title-one-space] [fixture: radar/lex-common-title-two-spaces]
[fixture: radar/lex-title-tab-null] [fixture: radar/lex-title-second-tab]
[fixture: radar/common-title-next-statement]

Child fields: value, textAfter. Range: title through its last value character,
or title for null, extended through the last textAfter form; exclude EOL and
unrelated outside padding. Keep repeated and empty occurrences separately.
Native hidden forms before the first visible EOL belong to textAfter; after that
EOL they belong to diagram body. Native comments are shared Comments, not suffix
nodes. [fixture: radar/common-repeat-empty] [fixture:
radar/lex-hidden-after-visible-eol] [fixture: radar/hidden-native-title-eof]
[fixture: radar/hidden-native-acctitle-eof] [fixture:
radar/hidden-native-description-eof] [fixture: radar/hidden-native-eof]

### RadarAccTitleStatement

| Field       | Type                     | Meaning                           |
| ----------- | ------------------------ | --------------------------------- |
| `value`     | RadarLiteral or null     | Authored common value.            |
| `textAfter` | list of RadarIgnoredText | Hidden suffix before visible EOL. |

value is line text immediately after the colon, retaining both ends' padding. It
is null only when no content remains; whitespace-only content is a literal.
[fixture: radar/lex-common-empty-values] [fixture: radar/common-acctitle-eof]
[fixture: radar/common-acctitle-next-statement]

Child fields: value, textAfter. Range: accTitle through its last value
character, or the colon for null, extended through the last textAfter form;
exclude EOL and unrelated outside padding. Keep repeated and empty occurrences
separately. Native hidden forms before the first visible EOL belong to
textAfter; after that EOL they belong to diagram body. Native comments are
shared Comments, not suffix nodes. [fixture: radar/common-repeat-empty]
[fixture: radar/lex-hidden-after-visible-eol] [fixture:
radar/hidden-native-title-eof] [fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof] [fixture:
radar/hidden-native-eof]

### RadarAccDescrStatement

| Field       | Type                     | Meaning                           |
| ----------- | ------------------------ | --------------------------------- |
| `value`     | RadarLiteral or null     | Authored common value.            |
| `textAfter` | list of RadarIgnoredText | Hidden suffix before visible EOL. |

value is line text immediately after the colon, retaining both ends' padding. It
is null only when no content remains; whitespace-only content is a literal.
Brace-looking text after the colon remains this line form. [fixture:
radar/lex-common-empty-values] [fixture: radar/lex-common-block-colon-first]
[fixture: radar/common-description-eof] [fixture:
radar/common-accdescr-next-statement]

Child fields: value, textAfter. Range: accDescr through its last value
character, or the colon for null, extended through the last textAfter form;
exclude EOL and unrelated outside padding. Keep repeated and empty occurrences
separately. Native hidden forms before the first visible EOL belong to
textAfter; after that EOL they belong to diagram body. Native comments are
shared Comments, not suffix nodes. [fixture: radar/common-repeat-empty]
[fixture: radar/lex-hidden-after-visible-eol] [fixture:
radar/hidden-native-title-eof] [fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof] [fixture:
radar/hidden-native-eof]

### RadarAccDescrBlockStatement

| Field       | Type                     | Meaning                           |
| ----------- | ------------------------ | --------------------------------- |
| `value`     | RadarLiteral or null     | Authored common value.            |
| `textAfter` | list of RadarIgnoredText | Hidden suffix before visible EOL. |

value is the brace interior with common Notation whitespace removed only at its
outer ends. It is null for whitespace/common-directive/comment-region-only
content. Keep interior indentation, source line endings, quotes, backslashes and
bare percent lines. The first closing brace is required, so no closed field is
needed; an empty block still makes this statement. [fixture:
radar/lex-common-empty-values] [fixture:
radar/lex-common-hidden-yaml-block-owner] [fixture:
radar/lex-common-hidden-percent-block-owner] [fixture:
radar/lex-common-description-only-directive] [fixture:
radar/lex-common-description-only-comment] [fixture:
radar/common-block-empty-interleaved] [fixture: radar/common-block-whitespace]
[fixture: radar/common-block-open]

Child fields: value, textAfter. Range: accDescr through the first closing brace,
extended through the last textAfter form; exclude EOL and unrelated outside
padding. Keep repeated and empty occurrences separately. Native hidden forms
before the first visible EOL belong to textAfter; after that EOL they belong to
diagram body. Native comments are shared Comments, not suffix nodes. [fixture:
radar/common-repeat-empty] [fixture: radar/lex-hidden-after-visible-eol]
[fixture: radar/hidden-native-title-eof] [fixture:
radar/hidden-native-acctitle-eof] [fixture: radar/hidden-native-description-eof]
[fixture: radar/hidden-native-eof]

### RadarLiteral

| Field   | Type   | Meaning                    |
| ------- | ------ | -------------------------- |
| `value` | string | Written common-value text. |

No child fields. Range: the first through last authored character of its
statement's value, spanning internal common trivia. Leave common directives,
comment regions and selected semicolons out of value; retain everything else,
including authored line endings, quotes, entities, escapes and owned whitespace.
Do not create an empty literal for null. Quote-looking common text is
RadarLiteral and need not close its quotes; no whitespace collapse or escape
decoding applies. [fixture: radar/common-title-open-quote] [fixture:
radar/common-quotes-entities] [fixture: radar/common-line-whitespace] [fixture:
radar/common-block-whitespace] [fixture: radar/directive-common] [fixture:
radar/common-block-directive] [fixture: radar/common-block-comment] [fixture:
radar/style-fields] [fixture: radar/line-cr-values] [fixture:
radar/lex-common-title-two-spaces] [fixture: radar/lex-common-empty-values]

### RadarIgnoredText

| Field   | Type   | Meaning                        |
| ------- | ------ | ------------------------------ |
| `kind`  | string | yaml-block or directive.       |
| `value` | string | Nonempty authored fenced form. |

No child fields. Range: the recognized --- or %%{ opener through its selected
qualifying closer, excluding preceding padding and any immediately consumed
following LF. Keep internal authored line endings and padding; the appended LF
never enters range/value. value omits common directives, comment regions and
selected semicolons while its range spans them. Both forms require a closer, so
no closed field is needed; even an empty body has nonempty fenced text.
[fixture: radar/hidden-yaml-adjacent-eof] [fixture: radar/lex-hidden-padding]
[fixture: radar/hidden-native-eof] [fixture: radar/hidden-yaml-crlf] [fixture:
radar/lex-hidden-yaml-global-inside] [fixture:
radar/lex-hidden-yaml-opener-selected-control] [fixture:
radar/lex-hidden-yaml-opener-global] [fixture:
radar/lex-hidden-yaml-closer-global] [fixture:
radar/lex-hidden-native-opener-global] [fixture:
radar/lex-hidden-native-closer-global] [fixture:
radar/lex-hidden-yaml-content-common-comment] [fixture:
radar/lex-hidden-native-content-common-comment] [fixture:
radar/lex-hidden-yaml-body-separators] [fixture:
radar/lex-hidden-native-body-separators] [fixture:
radar/lex-hidden-native-opener-selected]

kind is yaml-block for native YAML and directive for native DIRECTIVE. These
values do not become YAML properties or root frontmatter/directive data. An
independent common directive inside keeps its common effect. Shared
embedded-data reading follows the tests summary. Each complete match has exactly
one gap/body owner. Earlier strings and common values instead own enclosed
hidden-looking text. The lexical body-present priority can make three fences one
node, while two nonempty matches remain two nodes. Failed native-directive
matches that become comments use shared Comments. [fixture:
radar/retained-yaml-control] [fixture: radar/lex-hidden-yaml-two-nonempty]
[fixture: radar/lex-hidden-yaml-global-inside] [fixture:
radar/lex-hidden-native-fallback] [fixture: radar/detect-secondscan-native]
[fixture: radar/detect-retained-three-native] [fixture:
radar/hidden-native-string] [fixture: radar/hidden-yaml-in-string] [fixture:
radar/lex-common-hidden-yaml-block-owner] [fixture:
radar/lex-common-hidden-percent-block-owner] [fixture:
radar/hidden-native-unclosed]

### Gap ownership

Every native hidden gap is a source-ordered list of RadarIgnoredText. Ordinary
whitespace, shared Comments/Directives, common comment regions and selected
semicolons are not list elements. For each list member, textBefore follows the
introducing axis/curve keyword, comma or opening brace; textAfter ends before
its next comma, closing brace, statement or visible statement-ending EOL. Commas
have no parallel ownership array. One match cannot appear twice. [fixture:
radar/lex-hidden-axis-comma] [fixture: radar/lex-hidden-curve-comma] [fixture:
radar/lex-hidden-entry-comma] [fixture: radar/lex-hidden-option-comma] [fixture:
radar/lex-hidden-two-suffixes] [fixture: radar/gram-comment-mark-global]
[fixture: radar/lex-hidden-before-first-entry] [fixture:
radar/lex-hidden-before-entries-close]

For labels, textBeforeLabel precedes the opening bracket, textBeforeLabelValue
follows it and textBeforeLabelClose precedes the closer. Missing optional
components have empty gap lists; forms pass to the next present component's gap
or textAfter. Curve entry interiors keep their own before/after ownership across
the newlines allowed there. Hidden LF consumption changes visible separators,
never the ownership of a passed detection interval. [fixture:
radar/hidden-native-label-gap] [fixture: radar/hidden-native-curve-gap]
[fixture: radar/lex-hidden-before-label-open] [fixture:
radar/lex-hidden-before-label-close] [fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-hidden-detailed-before-colon] [fixture:
radar/lex-hidden-detailed-no-colon] [fixture:
radar/lex-hidden-after-visible-eol] [fixture:
radar/div-detect-yaml-bare-secondscan-native-ls] [fixture:
radar/detect-yaml-bare-secondscan-native-ascii] [fixture:
radar/lex-hidden-before-first-entry] [fixture:
radar/lex-hidden-before-entries-close] [fixture:
radar/gram-entry-before-comma-native-spare]

## Example

This authored example shows the three statement groups, both entry types and all
option types. The named curve retains Z:9 even though no axis uses it. The
numeric curve remains separate within the same group. ticks retains raw 33. The
four common forms are separate nodes, including both description forms.
[fixture: radar/gram-written-tree]

```mmd
radar-beta:
  axis A["Axis A"], B
  curve c['Curve']{A 1, B: 2, Z: 9}, d{3, 4}
  showLegend false, ticks 33, max 10, min 0, graticule polygon
  title Radar
  accTitle: Axis comparison
  accDescr: Short
  accDescr {
    Long
  }
```

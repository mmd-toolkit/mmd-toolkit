# Wardley nodes

Japanese version: [wardley.ja.md](./wardley.ja.md)

This document defines Wardley’s authored tree. [ast.md](../ast.md) defines
shared nodes and invariants, and [diagrams/wardley.md](../diagrams/wardley.md)
defines syntax and acceptance. Optional fields remain present as null, absent
lists are empty, and lists preserve source order. Field tables are independent
node definitions; child fields give visitor order. [fixture:
wardley/db-all-fields] [fixture: wardley/db-empty-texts] [fixture:
wardley/db-singletons-last] [fixture: wardley/common-repeat-empty]

Name positions permit whitespace, so a bare name is always WardleyIdentifier,
even when lexed as id-name or written as one word. A quoted name or text is
shared StringLiteral: raw keeps quotes and all source characters, value keeps
unconverted interior text outside common trivia, and closed is true. A flow
label uses the same authored leaf despite its different comparison conversion.
NumericLiteral.raw keeps the unsigned written number and value is its double
before percentage conversion. [fixture: wardley/db-id-underscore] [fixture:
wardley/db-unquoted-names] [fixture: wardley/lex-string-conversion] [fixture:
wardley/directive-every-field] [fixture: wardley/lex-link-flow-raw-escapes]
[fixture: wardley/db-empty-texts] [fixture: wardley/number-leading-zero]
[fixture: wardley/db-number-int-precision] [fixture: wardley/db-number-overflow]

Native ignored forms are whole WardleyIgnoredText nodes. Every
textBefore/textAfter gap field below is a list of those nodes, not whitespace,
shared Comments or global Directives. The named gap owns each whole match once.
A consumed following line break stays outside that ignored node’s range. Unless
a node says otherwise, unrelated outer padding and visible EOL stay outside its
range. Internal source line endings and padding stay in enclosing ranges.
[fixture: wardley/hidden-all-unit-gaps] [fixture:
wardley/hidden-yaml-component-gaps] [fixture: wardley/lex-hidden-directive-cr]
[fixture: wardley/hidden-yaml-crlf] [fixture:
wardley/lex-hidden-after-visible-eol] [fixture: wardley/tail-all-comments]
[fixture: wardley/tail-all-global-directives]

## Nodes

### WardleyDiagram

| Field              | Type                       | Meaning                                        |
| ------------------ | -------------------------- | ---------------------------------------------- |
| `textBeforeHeader` | list of WardleyIgnoredText | Retained forms before the header.              |
| `body`             | list of WardleyBodyItem    | All authored statements and body hidden forms. |

Child fields: textBeforeHeader, body. Range: the first retained pre-header form,
or the header when none, through the last written header/body form. No separate
header node or alias field is added; Root.diagramType is wardley. [fixture:
wardley/header-only] [fixture: wardley/header-glued-statement] [fixture:
wardley/detect-real-before-retained-secondscan] [fixture: wardley/db-all-fields]

WardleyBodyItem is WardleyAnchorStatement, WardleyComponentStatement,
WardleyLinkStatement, WardleyEvolveStatement, WardleyPipelineStatement,
WardleyNoteStatement, WardleyAnnotationsStatement, WardleyAnnotationStatement,
WardleyAcceleratorStatement, WardleyDeacceleratorStatement,
WardleyEvolutionStatement, WardleySizeStatement, the four common statement types
below, or WardleyIgnoredText. Keep every occurrence, including overwritten
size/evolution/common statements, later boxes, missing evolves and duplicated
declarations. Do not synthesize effective or merged nodes. Empty/comment-only
lines add no body item. [fixture: wardley/db-all-fields] [fixture:
wardley/db-singletons-last] [fixture: wardley/common-repeat-empty] [fixture:
wardley/db-later-invalid-box] [fixture: wardley/db-trend-missing] [fixture:
wardley/db-node-duplicates] [fixture: wardley/space-lines] [fixture:
wardley/tail-all-comments]

textBeforeHeader owns native YAML and second-scan directives retained from
detection, under their native boundaries. Passed bare lines are shared Comments
and accompanying passed whitespace/line breaks are trivia, also between retained
forms. They do not enlarge ignored-node ranges. Hidden forms after the header,
before a statement, or after a visible EOL are body items. [fixture:
wardley/detect-real-before-retained-secondscan] [fixture:
wardley/detect-secondscan-glued] [fixture: wardley/detect-two-secondscans]
[fixture: wardley/detect-retained-secondscan-bare-ascii] [fixture:
wardley/detect-retained-secondscan-bare-ls] [fixture:
wardley/retained-directive-between-bares] [fixture:
wardley/lex-hidden-header-no-eol] [fixture:
wardley/lex-hidden-after-visible-eol]

### WardleyAnchorStatement

| Field                   | Type                               | Meaning                             |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| `textBeforeName`        | list of WardleyIgnoredText         | Forms after the keyword.            |
| `name`                  | WardleyIdentifier or StringLiteral | Written declaration name.           |
| `textBeforeCoordinates` | list of WardleyIgnoredText         | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates                 | Written visibility/evolution pair.  |
| `textAfter`             | list of WardleyIgnoredText         | Forms before the first visible EOL. |

Child fields: textBeforeName, name, textBeforeCoordinates, coordinates,
textAfter. Range: anchor through the coordinate closing bracket, extended
through the last textAfter form. [fixture: wardley/spec-wardley-parser-04b27e33]
[fixture: wardley/db-empty-texts] [fixture: wardley/hidden-all-unit-gaps]

name is required, including an empty quoted name; coordinates is required.
textBeforeName lies after anchor, textBeforeCoordinates before the coordinate
opener, and textAfter after its closer but before the first visible EOL. Anchors
have no authored decoration or class field. [fixture: wardley/db-empty-texts]
[fixture: wardley/hidden-all-unit-gaps] [fixture:
wardley/tail-anchor-open-directive] [fixture: wardley/db-pipeline-anchor-parent]
[fixture: wardley/gram-anchor-decoration-rejected]

### WardleyComponentStatement

| Field                   | Type                               | Meaning                             |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| `textBeforeName`        | list of WardleyIgnoredText         | Forms after the keyword.            |
| `name`                  | WardleyIdentifier or StringLiteral | Written declaration name.           |
| `textBeforeCoordinates` | list of WardleyIgnoredText         | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates                 | Written visibility/evolution pair.  |
| `decorations`           | list of WardleyDecoration          | Written decorations in order.       |
| `textAfter`             | list of WardleyIgnoredText         | Forms before the first visible EOL. |

Child fields: textBeforeName, name, textBeforeCoordinates, coordinates,
decorations, textAfter. Range: component through its last decoration, or the
coordinate closing bracket without one, extended through textAfter. [fixture:
wardley/db-all-fields] [fixture: wardley/db-inertia-forms] [fixture:
wardley/hidden-yaml-component-gaps]

WardleyDecoration is WardleyLabelOffsetDecoration,
WardleySourceStrategyDecoration, WardleyInertiaDecoration or
WardleyParenthesizedInertiaDecoration. The list is empty when absent; grammar
permits one label offset, one strategy and one of the inertia forms, in that
order. Each written decoration owns preceding native forms in its textBefore;
with no following decoration those forms belong to the component’s textAfter.
Keep repeated declarations as separate statements and no effective
inertia/strategy/class fields. [fixture: wardley/db-inertia-forms] [fixture:
wardley/gram-label-order] [fixture: wardley/gram-decorator-order] [fixture:
wardley/gram-component-inertia-duplicate] [fixture:
wardley/gram-component-strategy-duplicate] [fixture:
wardley/gram-component-class-unsupported] [fixture:
wardley/hidden-yaml-component-gaps] [fixture: wardley/db-node-duplicates]
[fixture: wardley/lex-hidden-two-suffixes]

### WardleyLinkStatement

| Field                | Type                               | Meaning                                 |
| -------------------- | ---------------------------------- | --------------------------------------- |
| `from`               | WardleyIdentifier or StringLiteral | Written source reference.               |
| `textBeforeFromPort` | list of WardleyIgnoredText         | Forms before a written source port.     |
| `fromPort`           | string or null                     | Written source-port direction.          |
| `textBeforeArrow`    | list of WardleyIgnoredText         | Forms before a written arrow.           |
| `arrow`              | WardleyArrow or null               | Written arrow, if any.                  |
| `textBeforeTo`       | list of WardleyIgnoredText         | Forms before the target reference.      |
| `to`                 | WardleyIdentifier or StringLiteral | Written target reference.               |
| `textBeforeToPort`   | list of WardleyIgnoredText         | Forms before a written target port.     |
| `toPort`             | string or null                     | Written target-port direction.          |
| `textBeforeLabel`    | list of WardleyIgnoredText         | Forms before a written semicolon label. |
| `label`              | WardleyLiteral or null             | Authored text after semicolon.          |
| `textAfter`          | list of WardleyIgnoredText         | Forms before the first visible EOL.     |

Child fields: from, textBeforeFromPort, textBeforeArrow, arrow, textBeforeTo,
to, textBeforeToPort, textBeforeLabel, label, textAfter. Range: from through the
last written label, target port or to, extended through textAfter. [fixture:
wardley/db-link-forms] [fixture: wardley/db-bare-link] [fixture:
wardley/lex-link-target-port-no-arrow] [fixture: wardley/hidden-all-unit-gaps]

fromPort/toPort are forward for +>, backward for +< and bidirectional for +<>,
or null only without that port. They are written directions, not the final flow.
arrow is null only without an arrow. Each absent optional component has an empty
preceding gap list; pending forms before to go in textBeforeTo. Forms after the
final written component and before visible EOL go in textAfter. Names keep
references as written, including unresolved and label-based references.
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins] [fixture:
wardley/lex-link-target-port-no-arrow] [fixture: wardley/db-bare-link] [fixture:
wardley/hidden-all-unit-gaps] [fixture: wardley/db-link-resolution] [fixture:
wardley/db-link-unresolved-duplicates]

label is null only without the entire semicolon-label form. Its literal begins
immediately after semicolon, retains padding and may be whitespace-only; a
semicolon without content rejects. A present link-label reads to line end,
including native-looking forms, so textAfter is empty when label is present.
Keep both labels and both ports even when their derived precedence hides one.
[fixture: wardley/tail-link-empty-label] [fixture:
wardley/tail-link-spaced-label] [fixture: wardley/tail-link-double-label]
[fixture: wardley/space-link-label] [fixture:
wardley/lex-hidden-directive-multiline-label] [fixture: wardley/db-link-forms]
[fixture: wardley/lex-flow-port-wins]

### WardleyEvolveStatement

| Field                 | Type                               | Meaning                             |
| --------------------- | ---------------------------------- | ----------------------------------- |
| `textBeforeComponent` | list of WardleyIgnoredText         | Forms after evolve.                 |
| `component`           | WardleyIdentifier or StringLiteral | Written component reference.        |
| `textBeforeTarget`    | list of WardleyIgnoredText         | Forms before the target number.     |
| `target`              | NumericLiteral                     | Written decimal target.             |
| `textAfter`           | list of WardleyIgnoredText         | Forms before the first visible EOL. |

Child fields: textBeforeComponent, component, textBeforeTarget, target,
textAfter. Range: evolve through target, extended through textAfter. [fixture:
wardley/db-trend-duplicates] [fixture: wardley/db-trend-missing] [fixture:
wardley/hidden-all-unit-gaps]

component and target are required even for a missing ID; no resolved node ID or
normalized target replaces them. textAfter owns only forms before the first
visible EOL. Every repeated or unpublished evolve remains a separate node.
[fixture: wardley/db-trend-missing] [fixture:
wardley/gram-evolve-missing-label-invalid] [fixture:
wardley/gram-evolve-exact-child-invalid] [fixture: wardley/db-trend-duplicates]
[fixture: wardley/tail-evolve-open-directive]

### WardleyPipelineStatement

| Field              | Type                               | Meaning                                     |
| ------------------ | ---------------------------------- | ------------------------------------------- |
| `textBeforeParent` | list of WardleyIgnoredText         | Forms after pipeline.                       |
| `parent`           | WardleyIdentifier or StringLiteral | Written parent reference.                   |
| `textBeforeBody`   | list of WardleyIgnoredText         | Forms before the opening brace.             |
| `textAfterOpen`    | list of WardleyIgnoredText         | Forms after brace, before first visible LF. |
| `body`             | list of WardleyPipelineBodyItem    | Authored children and hidden forms.         |
| `textAfter`        | list of WardleyIgnoredText         | Forms before the first visible EOL.         |

Child fields: textBeforeParent, parent, textBeforeBody, textAfterOpen, body,
textAfter. Range: pipeline through its closing brace, extended through
textAfter. [fixture: wardley/db-all-fields] [fixture:
wardley/hidden-all-unit-gaps] [fixture: wardley/lex-hidden-pipeline-open-spare]

WardleyPipelineBodyItem is WardleyPipelineComponent or WardleyIgnoredText, with
at least one component. After the opener, textAfterOpen owns forms only before
the mandatory first visible LF; consumed hidden endings do not supply it.
Thereafter forms before children, after a child’s visible EOL or before the
closing brace are body items. textAfter follows the closing brace before the
pipeline’s own EOL. Empty/comment-only lines add no item. [fixture:
wardley/gram-empty-pipeline] [fixture: wardley/hidden-pipeline-open-gap]
[fixture: wardley/lex-hidden-pipeline-open-spare] [fixture:
wardley/lex-hidden-pipeline-before-close] [fixture:
wardley/lex-hidden-pipeline-child-spare] [fixture:
wardley/gram-pipeline-blank-before-first] [fixture:
wardley/tail-pipeline-open-directive]

parent is the authored reference, never a resolved label or effective parent
record. Keep repeated pipelines and their original bodies; do not insert
generated child IDs or move child declarations into other parents. [fixture:
wardley/db-pipeline-duplicates] [fixture: wardley/db-pipeline-collision]
[fixture: wardley/db-pipeline-nested-parent] [fixture:
wardley/db-empty-pipeline-names]

### WardleyPipelineComponent

| Field                 | Type                                 | Meaning                             |
| --------------------- | ------------------------------------ | ----------------------------------- |
| `textBeforeName`      | list of WardleyIgnoredText           | Forms after the keyword.            |
| `name`                | WardleyIdentifier or StringLiteral   | Written declaration name.           |
| `textBeforeOpen`      | list of WardleyIgnoredText           | Forms before the one-value bracket. |
| `textBeforeEvolution` | list of WardleyIgnoredText           | Forms after the opening bracket.    |
| `evolution`           | NumericLiteral                       | Written single evolution value.     |
| `textBeforeClose`     | list of WardleyIgnoredText           | Forms before the closing bracket.   |
| `labelOffset`         | WardleyLabelOffsetDecoration or null | Written label offset, if any.       |
| `textAfter`           | list of WardleyIgnoredText           | Forms before the first visible EOL. |

Child fields: textBeforeName, name, textBeforeOpen, textBeforeEvolution,
evolution, textBeforeClose, labelOffset, textAfter. Range: component through the
label offset’s closing bracket if written, otherwise its position closing
bracket; extend through textAfter. [fixture:
wardley/spec-wardley-parser-2c2c9064] [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/db-pipeline-label-inheritance]

Do not add an inherited visibility value, coordinate pair or synthetic ID.
labelOffset is null only when absent; a present decoration owns its preceding
gap. Without it, remaining forms belong to textAfter. Children keep their own
EOL and cannot acquire source strategy or inertia decorations. [fixture:
wardley/hidden-all-unit-gaps] [fixture: wardley/hidden-pipeline-eol] [fixture:
wardley/lex-hidden-pipeline-child-spare] [fixture:
wardley/db-pipeline-collision] [fixture: wardley/db-pipeline-label-inheritance]
[fixture: wardley/gram-pipeline-child-strategy-rejected]

### WardleyNoteStatement

| Field                   | Type                       | Meaning                             |
| ----------------------- | -------------------------- | ----------------------------------- |
| `textBeforeText`        | list of WardleyIgnoredText | Forms after note.                   |
| `text`                  | StringLiteral              | Required quoted note text.          |
| `textBeforeCoordinates` | list of WardleyIgnoredText | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates         | Written visibility/evolution pair.  |
| `textAfter`             | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: textBeforeText, text, textBeforeCoordinates, coordinates,
textAfter. Range: note through the coordinate closing bracket, extended through
textAfter. [fixture: wardley/db-all-fields] [fixture: wardley/db-empty-texts]
[fixture: wardley/hidden-all-unit-gaps]

text may be an empty or multiline string. coordinates remains the authored
visibility/evolution pair; native-looking text inside the string is content, not
another child. [fixture: wardley/db-empty-texts] [fixture:
wardley/lex-string-multiline] [fixture: wardley/hidden-yaml-string] [fixture:
wardley/hidden-directive-string] [fixture: wardley/line-string-values]

### WardleyAnnotationsStatement

| Field                   | Type                       | Meaning                             |
| ----------------------- | -------------------------- | ----------------------------------- |
| `textBeforeCoordinates` | list of WardleyIgnoredText | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates         | Written visibility/evolution pair.  |
| `textAfter`             | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: textBeforeCoordinates, coordinates, textAfter. Range: annotations
through the coordinate closing bracket, extended through textAfter. [fixture:
wardley/db-all-fields] [fixture: wardley/db-later-invalid-box] [fixture:
wardley/hidden-all-unit-gaps]

This is a written annotations-box statement, including every later occurrence.
coordinates accepts the integer-or-decimal form defined by syntax. Do not
replace several statements with the first effective box or apply its range check
to later nodes. [fixture: wardley/db-singletons-last] [fixture:
wardley/db-later-invalid-box] [fixture: wardley/gram-box-first-invalid]
[fixture: wardley/db-coordinate-boundary]

### WardleyAnnotationStatement

| Field                   | Type                       | Meaning                             |
| ----------------------- | -------------------------- | ----------------------------------- |
| `textBeforeNumber`      | list of WardleyIgnoredText | Forms after annotation.             |
| `number`                | NumericLiteral             | Written unsigned annotation number. |
| `textBeforeComma`       | list of WardleyIgnoredText | Forms before the first comma.       |
| `textBeforeCoordinates` | list of WardleyIgnoredText | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates         | Written visibility/evolution pair.  |
| `textBeforeText`        | list of WardleyIgnoredText | Forms before the quoted text.       |
| `text`                  | StringLiteral              | Required quoted annotation text.    |
| `textAfter`             | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: textBeforeNumber, number, textBeforeComma, textBeforeCoordinates,
coordinates, textBeforeText, text, textAfter. Range: annotation through the
text’s closing quote, extended through textAfter. [fixture:
wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps] [fixture:
wardley/db-array-duplicates]

textBeforeCoordinates lies after the first comma and before the bracket. number
and text are required; zero numbers, empty strings and repeated annotation
numbers remain authored nodes. coordinates uses the integer-or-decimal pair with
visibility first. [fixture: wardley/hidden-all-unit-gaps] [fixture:
wardley/db-empty-texts] [fixture: wardley/db-array-duplicates] [fixture:
wardley/db-coordinate-boundary] [fixture: wardley/db-number-int-precision]

### WardleyAcceleratorStatement

| Field                   | Type                               | Meaning                             |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| `textBeforeName`        | list of WardleyIgnoredText         | Forms after the keyword.            |
| `name`                  | WardleyIdentifier or StringLiteral | Written declaration name.           |
| `textBeforeCoordinates` | list of WardleyIgnoredText         | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates                 | Written visibility/evolution pair.  |
| `textAfter`             | list of WardleyIgnoredText         | Forms before the first visible EOL. |

Child fields: textBeforeName, name, textBeforeCoordinates, coordinates,
textAfter. Range: accelerator through the coordinate closing bracket, extended
through textAfter. [fixture: wardley/db-all-fields] [fixture:
wardley/db-array-duplicates] [fixture: wardley/hidden-all-unit-gaps]

name may be bare, quoted or an empty quoted name. coordinates is a required
decimal pair in authored visibility/evolution order. Keep each occurrence
without merging repeated names. [fixture: wardley/accelerator-letter] [fixture:
wardley/db-empty-texts] [fixture: wardley/db-array-duplicates] [fixture:
wardley/line-every-text]

### WardleyDeacceleratorStatement

| Field                   | Type                               | Meaning                             |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| `textBeforeName`        | list of WardleyIgnoredText         | Forms after the keyword.            |
| `name`                  | WardleyIdentifier or StringLiteral | Written declaration name.           |
| `textBeforeCoordinates` | list of WardleyIgnoredText         | Forms before the opening bracket.   |
| `coordinates`           | WardleyCoordinates                 | Written visibility/evolution pair.  |
| `textAfter`             | list of WardleyIgnoredText         | Forms before the first visible EOL. |

Child fields: textBeforeName, name, textBeforeCoordinates, coordinates,
textAfter. Range: deaccelerator through the coordinate closing bracket, extended
through textAfter. [fixture: wardley/db-all-fields] [fixture:
wardley/db-array-duplicates] [fixture: wardley/hidden-all-unit-gaps]

name and coordinates are required, including empty quoted names; coordinates
remains a decimal visibility/evolution pair. Repeated declarations remain
distinct nodes rather than a combined force value. [fixture:
wardley/deaccelerator-letter] [fixture: wardley/db-empty-texts] [fixture:
wardley/db-array-duplicates] [fixture: wardley/space-every-text]

### WardleyEvolutionStatement

| Field    | Type                          | Meaning                       |
| -------- | ----------------------------- | ----------------------------- |
| `stages` | list of WardleyEvolutionStage | Written stages; at least two. |

Child fields: stages. Range: evolution through the last stage, including that
member’s suffix. Stage separators remain -> punctuation, not link arrows.
[fixture: wardley/db-stages-boundaries] [fixture: wardley/db-singletons-last]
[fixture: wardley/lex-hidden-evolution-members]

Keep every evolution statement, not only the last assignment. stages stays in
source order with each boundary attached to its written stage; do not derive two
parallel label/boundary lists or synthesize defaults. A trailing arrow with no
stage rejects. [fixture: wardley/db-singletons-last] [fixture:
wardley/db-stages-boundaries] [fixture: wardley/gram-stage-trailing-arrow]
[fixture: wardley/gram-evolution-single]

### WardleyEvolutionStage

| Field                      | Type                                       | Meaning                                     |
| -------------------------- | ------------------------------------------ | ------------------------------------------- |
| `textBefore`               | list of WardleyIgnoredText                 | Forms after evolution or a stage separator. |
| `name`                     | WardleyIdentifier or StringLiteral         | Written primary stage name.                 |
| `textBeforeBoundaryMark`   | list of WardleyIgnoredText                 | Forms before a written @.                   |
| `textBeforeBoundary`       | list of WardleyIgnoredText                 | Forms after @, before the number.           |
| `boundary`                 | NumericLiteral or null                     | Written boundary number.                    |
| `textBeforeSecondNameMark` | list of WardleyIgnoredText                 | Forms before a written slash.               |
| `textBeforeSecondName`     | list of WardleyIgnoredText                 | Forms after slash, before its name.         |
| `secondName`               | WardleyIdentifier or StringLiteral or null | Written secondary stage name.               |
| `textAfter`                | list of WardleyIgnoredText                 | Forms before next separator or EOL.         |

Child fields: textBefore, name, textBeforeBoundaryMark, textBeforeBoundary,
boundary, textBeforeSecondNameMark, textBeforeSecondName, secondName, textAfter.
Range: the first textBefore form, or name when none, through the second name,
boundary or primary name, whichever is last written, extended through textAfter.
[fixture: wardley/lex-hidden-evolution-members] [fixture:
wardley/db-stages-boundaries] [fixture: wardley/db-stage-empty-second-name]

boundary is null only without the entire @ clause, and secondName is null only
without the slash clause. An empty string in either name position is still a
StringLiteral. Absent clauses have empty gap lists. Without boundary, forms
before a written slash go in textBeforeSecondNameMark; without either clause,
forms after name go in textAfter. The last stage owns its suffix before EOL. No
trimming or joined dual-name spelling replaces the leaves. [fixture:
wardley/lex-hidden-evolution-members] [fixture:
wardley/db-stage-empty-second-name] [fixture: wardley/db-stages-boundaries]
[fixture: wardley/lex-number-boundary-integer]

### WardleySizeStatement

| Field              | Type                       | Meaning                             |
| ------------------ | -------------------------- | ----------------------------------- |
| `textBeforeOpen`   | list of WardleyIgnoredText | Forms after size, before bracket.   |
| `textBeforeWidth`  | list of WardleyIgnoredText | Forms after the opening bracket.    |
| `width`            | NumericLiteral             | Written unsigned integer width.     |
| `textBeforeComma`  | list of WardleyIgnoredText | Forms before the comma.             |
| `textBeforeHeight` | list of WardleyIgnoredText | Forms after comma, before height.   |
| `height`           | NumericLiteral             | Written unsigned integer height.    |
| `textBeforeClose`  | list of WardleyIgnoredText | Forms before the closing bracket.   |
| `textAfter`        | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: textBeforeOpen, textBeforeWidth, width, textBeforeComma,
textBeforeHeight, height, textBeforeClose, textAfter. Range: size through its
closing bracket, extended through textAfter. [fixture:
wardley/hidden-all-unit-gaps] [fixture: wardley/db-singletons-last] [fixture:
wardley/db-number-overflow]

Both numbers are required, including zero or overflow values allowed by syntax.
Keep the written statement even when another size follows. No drawing dimensions
or normalized numeric spelling are substituted. [fixture:
wardley/db-singletons-last] [fixture: wardley/db-number-overflow] [fixture:
wardley/db-number-int-precision] [fixture: wardley/lex-number-size-decimal]
[fixture: wardley/gram-size-trailing-comma] [fixture: wardley/gram-size-zero]

### WardleyCoordinates

| Field                  | Type                       | Meaning                                 |
| ---------------------- | -------------------------- | --------------------------------------- |
| `textBeforeVisibility` | list of WardleyIgnoredText | Forms after the opening bracket.        |
| `visibility`           | NumericLiteral             | Written first coordinate.               |
| `textBeforeComma`      | list of WardleyIgnoredText | Forms before the comma.                 |
| `textBeforeEvolution`  | list of WardleyIgnoredText | Forms after comma, before second value. |
| `evolution`            | NumericLiteral             | Written second coordinate.              |
| `textBeforeClose`      | list of WardleyIgnoredText | Forms before the closing bracket.       |

Child fields: textBeforeVisibility, visibility, textBeforeComma,
textBeforeEvolution, evolution, textBeforeClose. Range: the opening bracket
through its matching closing bracket. [fixture: wardley/db-all-fields] [fixture:
wardley/hidden-all-unit-gaps] [fixture: wardley/hidden-yaml-component-gaps]

This concrete pair is used by anchor, component, note, annotations, annotation,
accelerator and deaccelerator statements. Keep visibility first and evolution
second without swapping or percentage conversion. Annotation and box positions
alone permit integer leaves as well as decimals. A pipeline child has one
evolution leaf and does not synthesize this pair. [fixture:
wardley/db-all-fields] [fixture: wardley/db-coordinate-boundary] [fixture:
wardley/number-integer-coordinate] [fixture:
wardley/spec-wardley-parser-2c2c9064] [fixture:
wardley/directive-coordinate-parts]

### WardleyLabelOffsetDecoration

| Field             | Type                       | Meaning                                     |
| ----------------- | -------------------------- | ------------------------------------------- |
| `textBefore`      | list of WardleyIgnoredText | Forms before label.                         |
| `textBeforeOpen`  | list of WardleyIgnoredText | Forms between label and bracket.            |
| `textBeforeX`     | list of WardleyIgnoredText | Forms after bracket, before sign or number. |
| `negativeX`       | boolean                    | Whether the first minus is written.         |
| `textAfterXSign`  | list of WardleyIgnoredText | Forms after a written first minus.          |
| `offsetX`         | NumericLiteral             | Written unsigned first magnitude.           |
| `textBeforeComma` | list of WardleyIgnoredText | Forms before the comma.                     |
| `textBeforeY`     | list of WardleyIgnoredText | Forms after comma, before sign or number.   |
| `negativeY`       | boolean                    | Whether the second minus is written.        |
| `textAfterYSign`  | list of WardleyIgnoredText | Forms after a written second minus.         |
| `offsetY`         | NumericLiteral             | Written unsigned second magnitude.          |
| `textBeforeClose` | list of WardleyIgnoredText | Forms before the closing bracket.           |

Child fields: textBefore, textBeforeOpen, textBeforeX, textAfterXSign, offsetX,
textBeforeComma, textBeforeY, textAfterYSign, offsetY, textBeforeClose. Range:
the first textBefore form, or label when none, through the closing bracket.
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/hidden-all-unit-gaps]

Both magnitude leaves are required unsigned integers. Each negative flag is true
exactly for a written minus, including -0; minus punctuation is outside
NumericLiteral.raw. With no minus, the corresponding
textAfterXSign/textAfterYSign list is empty and textBeforeX/textBeforeY owns all
forms before that number. With a minus, textBeforeX/Y precedes it and
textAfterXSign/textAfterYSign follows it. No signed effective offset replaces
these fields. [fixture: wardley/number-offset-negative-zero] [fixture:
wardley/lex-number-offset-separated-minus] [fixture:
wardley/hidden-yaml-component-gaps] [fixture: wardley/directive-offset-sign]
[fixture: wardley/lex-selected-offset-sign] [fixture:
wardley/lex-number-offset-decimal] [fixture: wardley/db-node-duplicates]

### WardleySourceStrategyDecoration

| Field             | Type                       | Meaning                               |
| ----------------- | -------------------------- | ------------------------------------- |
| `textBefore`      | list of WardleyIgnoredText | Forms before the opening parenthesis. |
| `textBeforeValue` | list of WardleyIgnoredText | Forms after the opening parenthesis.  |
| `value`           | string                     | Written fixed strategy.               |
| `textBeforeClose` | list of WardleyIgnoredText | Forms before the closing parenthesis. |

Child fields: textBefore, textBeforeValue, textBeforeClose. Range: the first
textBefore form, or opening parenthesis when none, through the closing
parenthesis. [fixture: wardley/hidden-yaml-component-gaps] [fixture:
wardley/hidden-all-unit-gaps] [fixture: wardley/db-inertia-forms]

value is build, buy, outsource or market, not an identifier leaf. Both
parentheses are required; this node is absent from the decoration list when the
whole form is absent. Shared trivia can separate its authored components but
cannot split its fixed word. [fixture: wardley/db-inertia-forms] [fixture:
wardley/spec-wardley-parser-95189f48] [fixture:
wardley/directive-strategy-parts] [fixture: wardley/directive-strategy-inside]
[fixture: wardley/lex-selected-strategy-parts] [fixture:
wardley/lex-selected-strategy-inside]

### WardleyInertiaDecoration

| Field        | Type                       | Meaning                    |
| ------------ | -------------------------- | -------------------------- |
| `textBefore` | list of WardleyIgnoredText | Forms before bare inertia. |

Child fields: textBefore. Range: the first textBefore form, or inertia when
none, through the end of the bare keyword. [fixture: wardley/db-all-fields]
[fixture: wardley/db-inertia-forms] [fixture:
wardley/lex-hidden-bare-inertia-suffix]

This node represents only bare inertia; no internal gap, boolean effective value
or parentheses field is added. Forms following it before EOL belong to its
component’s textAfter. [fixture: wardley/db-inertia-forms] [fixture:
wardley/inertia-letter] [fixture: wardley/gram-component-inertia-duplicate]
[fixture: wardley/lex-hidden-bare-inertia-suffix]

### WardleyParenthesizedInertiaDecoration

| Field               | Type                       | Meaning                               |
| ------------------- | -------------------------- | ------------------------------------- |
| `textBefore`        | list of WardleyIgnoredText | Forms before the opening parenthesis. |
| `textBeforeInertia` | list of WardleyIgnoredText | Forms after the opening parenthesis.  |
| `textBeforeClose`   | list of WardleyIgnoredText | Forms before the closing parenthesis. |

Child fields: textBefore, textBeforeInertia, textBeforeClose. Range: the first
textBefore form, or opening parenthesis when none, through its closing
parenthesis. [fixture: wardley/db-inertia-forms] [fixture:
wardley/hidden-yaml-component-gaps] [fixture: wardley/hidden-all-unit-gaps]

This node requires both parentheses and the exact inertia word. Its interior
forms have the two named owners above. It stays distinct from bare inertia and
from a source-strategy decoration; forms after its closer belong to the
component suffix. [fixture: wardley/db-inertia-forms] [fixture:
wardley/hidden-yaml-component-gaps] [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/lex-hidden-parenthesized-inertia-suffix] [fixture:
wardley/directive-parenthesized-inertia-parts] [fixture:
wardley/lex-selected-parenthesized-inertia-parts]

### WardleyArrow

| Field         | Type                  | Meaning                         |
| ------------- | --------------------- | ------------------------------- |
| `value`       | string                | Whole authored arrow text.      |
| `kind`        | string                | dependency or flow.             |
| `line`        | string                | solid or dotted from the glyph. |
| `startMarker` | string                | Written left marker presence.   |
| `label`       | StringLiteral or null | Flow’s written quoted label.    |
| `endMarker`   | string                | Written right marker presence.  |

Child fields: label. Range: the first dependency-arrow/link-arrow glyph
character through its last character, or plus through the final flow marker.
[fixture: wardley/db-link-forms] [fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]

kind is dependency for ->, -->, -.-> and >, otherwise flow. line is dotted
exactly for the written -.-> glyph and solid otherwise, including > alone. A
dependency has startMarker none and endMarker arrow. A flow ending in < has
arrow/none, > has none/arrow, and <> has arrow/arrow. These fields describe the
authored glyph, not derived flow or dashed values affected by label content.
[fixture: wardley/db-link-forms] [fixture:
wardley/lex-flow-label-changes-direction] [fixture:
wardley/lex-flow-label-changes-bidirectional] [fixture:
wardley/lex-flow-label-changes-dashed] [fixture:
wardley/lex-flow-label-changes-dashed-short]

label is null for dependency and a required closed StringLiteral for flow,
including an empty label. Its range/raw includes its single quotes. value
preserves the complete authored arrow including label quotes, escapes and
internal source line endings, but leaves shared trivia out while its range spans
it. Native hidden forms cannot lie between its components; permitted global
trivia does not create a second hidden child. [fixture: wardley/db-link-forms]
[fixture: wardley/lex-link-flow-raw-escapes] [fixture: wardley/line-every-text]
[fixture: wardley/directive-flow-before-label] [fixture:
wardley/directive-flow-after-label] [fixture: wardley/directive-every-field]
[fixture: wardley/lex-link-native-flow-components] [fixture:
wardley/lex-selected-flow-after-label]

### WardleyTitleStatement

| Field       | Type                       | Meaning                             |
| ----------- | -------------------------- | ----------------------------------- |
| `value`     | WardleyLiteral or null     | Authored common value.              |
| `textAfter` | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: value, textAfter. Range: title through its last value character,
or keyword when null, extended through textAfter. [fixture:
wardley/common-title-eof] [fixture: wardley/common-title-two-spaces] [fixture:
wardley/common-title-tabs] [fixture: wardley/hidden-directive-title]

value starts after title and exactly one ASCII space/tab separator. Preserve all
remaining line-value padding; without a separator or remaining content it is
null, while a second separator is whitespace content. Native forms after the
line value and before the first visible EOL go in textAfter; later forms are
body items. [fixture: wardley/common-title-eof] [fixture:
wardley/common-title-two-spaces] [fixture: wardley/common-title-tabs] [fixture:
wardley/hidden-directive-title] [fixture: wardley/lex-hidden-title-suffix]
[fixture: wardley/lex-hidden-title-after-visible-eol]

### WardleyAccTitleStatement

| Field       | Type                       | Meaning                             |
| ----------- | -------------------------- | ----------------------------------- |
| `value`     | WardleyLiteral or null     | Authored common value.              |
| `textAfter` | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: value, textAfter. Range: accTitle through the last value
character, or colon when null, extended through textAfter. [fixture:
wardley/common-acctitle-eof] [fixture: wardley/common-repeat-empty] [fixture:
wardley/lex-hidden-common-prefix-eol]

value is the authored line text immediately after colon, preserving padding at
both ends. Only no remaining content makes null; whitespace-only content is a
literal. Native suffix forms before the first visible EOL belong to textAfter;
forms after it are body items. [fixture: wardley/common-acctitle-eof] [fixture:
wardley/common-line-whitespace] [fixture: wardley/common-empty-literals]
[fixture: wardley/lex-hidden-common-prefix-eol] [fixture:
wardley/lex-hidden-acctitle-after-visible-eol]

### WardleyAccDescrStatement

| Field       | Type                       | Meaning                             |
| ----------- | -------------------------- | ----------------------------------- |
| `value`     | WardleyLiteral or null     | Authored common value.              |
| `textAfter` | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: value, textAfter. Range: accDescr through its last line-value
character, or colon when null, extended through textAfter. [fixture:
wardley/common-description-eof] [fixture: wardley/common-repeat] [fixture:
wardley/hidden-yaml-description]

value begins immediately after colon and keeps line padding. It is null only
with no remaining content, not for whitespace-only content. This is the line
form even when its value contains braces. Native suffix forms before visible EOL
belong to textAfter; later forms are body items. [fixture:
wardley/common-description-eof] [fixture: wardley/common-empty-literals]
[fixture: wardley/common-quoted-values] [fixture:
wardley/common-description-colon-braces] [fixture:
wardley/hidden-yaml-description] [fixture:
wardley/lex-hidden-description-suffix]

### WardleyAccDescrBlockStatement

| Field       | Type                       | Meaning                             |
| ----------- | -------------------------- | ----------------------------------- |
| `value`     | WardleyLiteral or null     | Authored common value.              |
| `textAfter` | list of WardleyIgnoredText | Forms before the first visible EOL. |

Child fields: value, textAfter. Range: accDescr through its required first
closing brace, extended through textAfter. [fixture:
wardley/common-empty-interleaved] [fixture: wardley/common-block-whitespace]
[fixture: wardley/common-block-first-close] [fixture:
wardley/hidden-after-block]

value is the brace interior after removing common whitespace only at its outer
ends, or null when no content remains after shared removals. Keep internal
indentation, source line endings, bare percent lines, quotes and escapes. An
empty block still creates this node. A closer is required, so no closed field is
needed. Suffix forms before the first visible EOL belong to textAfter, then
later forms to body. [fixture: wardley/common-empty-literals] [fixture:
wardley/common-block-whitespace] [fixture: wardley/common-block-comment]
[fixture: wardley/common-block-directive] [fixture:
wardley/common-block-bare-percent] [fixture: wardley/common-block-first-close]
[fixture: wardley/common-block-escaped-close] [fixture:
wardley/common-block-open] [fixture: wardley/line-block-values]

### WardleyIdentifier

| Field  | Type   | Meaning                  |
| ------ | ------ | ------------------------ |
| `name` | string | Authored bare name text. |

Child fields: none. Range: the first through last written character read as the
name, including internal space/tab but excluding outside padding. [fixture:
wardley/db-id-underscore] [fixture: wardley/db-unquoted-names] [fixture:
wardley/lex-native-after-name-space] [fixture: wardley/lex-name-trailing-space]

name joins the name’s authored text outside common directives, comment regions
and selected semicolons; its range spans internal shared trivia. It keeps case,
ampersands, parentheses, hyphens and internal whitespace, without comparison
conversion. It does not become shared Identifier when the particular name lacks
spaces. Native hidden forms cannot join two names into this leaf. [fixture:
wardley/directive-name-inside] [fixture: wardley/db-unquoted-names] [fixture:
wardley/lex-name-inner-keyword] [fixture: wardley/db-id-underscore] [fixture:
wardley/lex-native-between-name-chunks] [fixture:
wardley/lex-native-after-name-space]

### WardleyLiteral

| Field   | Type   | Meaning                                      |
| ------- | ------ | -------------------------------------------- |
| `value` | string | Nonempty authored common or link-label text. |

Child fields: none. Range: the first through last authored value character
defined by its owning statement, spanning internal common trivia. [fixture:
wardley/common-title-tabs] [fixture: wardley/common-line-whitespace] [fixture:
wardley/common-block-whitespace] [fixture: wardley/space-link-label]

Omit common directives, comment regions and selected semicolons from value, but
preserve every other source character, including source line endings,
whitespace, quotes, entities and escape spelling. No escape decoding or
whitespace collapse applies. Null values create no empty literal. Link-label
values start after semicolon; common values use their four statement-specific
ranges above. [fixture: wardley/directive-every-field] [fixture:
wardley/common-block-comment] [fixture: wardley/style-every-text] [fixture:
wardley/common-line-ls-ps] [fixture: wardley/line-link-label-values] [fixture:
wardley/entity-texts] [fixture: wardley/common-open-quote] [fixture:
wardley/common-empty-literals] [fixture: wardley/tail-link-spaced-label]

### WardleyIgnoredText

| Field   | Type   | Meaning                              |
| ------- | ------ | ------------------------------------ |
| `kind`  | string | yaml-block or directive.             |
| `value` | string | Nonempty whole authored hidden form. |

Child fields: none. Range: the three-dash or percent-brace opener through the
qualifying closer, excluding preceding padding and any immediately consumed
following line break. [fixture: wardley/lex-hidden-directive-cr] [fixture:
wardley/lex-hidden-yaml-cr] [fixture: wardley/hidden-yaml-crlf] [fixture:
wardley/hidden-directive-eof] [fixture: wardley/hidden-yaml-eof]

Keep internal padding and source line endings; the appended LF never enters
value/range. Both kinds require a closer, so there is no closed field. Even an
empty body leaves a nonempty fenced value. Leave shared directives, comment
regions and selected semicolons out of value while its range spans them,
including allowed punctuation joins. A global directive inside keeps its
independent effect; this native form itself has no configuration/frontmatter
effect. [fixture: wardley/hidden-yaml-adjacent-eof] [fixture:
wardley/hidden-directive-adjacent] [fixture:
wardley/lex-hidden-yaml-common-directive] [fixture:
wardley/lex-hidden-yaml-comment-region] [fixture:
wardley/directive-native-opener-split] [fixture:
wardley/directive-native-yaml-closer] [fixture:
wardley/lex-selected-native-yaml-opener] [fixture:
wardley/lex-selected-native-directive-opener] [fixture:
wardley/detect-block-after-directive]

Each whole match belongs once to textBeforeHeader, body, a member’s named gap or
a statement suffix. Use the [lexical alternatives](../diagrams/wardley.md):
YAML’s body-present branch can join three fences into one node, while two
nonempty blocks stay separate. A failed native directive can instead be a shared
Comment; earlier strings or values own enclosed native-looking text. Do not
duplicate them as ignored nodes. [fixture: wardley/hidden-yaml-adjacent-later]
[fixture: wardley/hidden-yaml-nested] [fixture:
wardley/lex-hidden-comment-fallback-with-hidden] [fixture:
wardley/lex-hidden-string-with-hidden] [fixture:
wardley/lex-hidden-link-label-with-hidden] [fixture:
wardley/lex-hidden-description-with-hidden] [fixture:
wardley/lex-hidden-after-visible-eol] [fixture:
wardley/lex-hidden-evolution-members] [fixture:
wardley/lex-hidden-pipeline-before-close]

## Example

The following authored example illustrates the tree, not derived Db records.
Every coordinate retains its written order; the signed offset has unsigned
numeric leaves and separate minus flags. The body keeps the annotations box,
pipeline, link, evolve and the written common forms in source order. Separate
inertia forms and flow-label shapes are shown by the additional cited cases.
[fixture: wardley/db-all-fields] [fixture: wardley/db-inertia-forms] [fixture:
wardley/db-link-forms]

```mmd
wardley-beta
title T
accTitle: A
accDescr { D
 E }
size [900,600]
evolution " G "@0.3 / C -> P@1.0
anchor User [0.9,0.8]
component A [0.4,0.5] label [-0,-2] (build) inertia
component B [20.0,30.0]
pipeline A {
component Child [0.6]
}
User -> Child; label
evolve A 0.9
annotations [10,20]
annotation 1,[30,40] "Text"
note "N" [0.1,0.2]
accelerator X [0.2,0.3]
deaccelerator Y [0.3,0.4]
```

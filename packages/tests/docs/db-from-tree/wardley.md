# Building the Wardley Db from a tree

Japanese version: [wardley.ja.md](./wardley.ja.md)

`wardleyDbOf()` reads the authored
[Wardley tree](../../../spec/docs/ast/wardley.md) and builds the
[Wardley summary](../db-summaries.md#wardley). The tree is already accepted: the
builder does not repeat the
[semantic acceptance conditions](../../../spec/docs/diagrams/wardley.md#semantic-acceptance-conditions).
Retained hidden forms publish nothing. [fixture: wardley/header-only] [fixture:
wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]

## Converted values and common assignments

Read leaf ranges through the shared converted-text helper: common trivia is
omitted, physical line endings become LF, HTML attribute quotes change, and
entities become placeholders. Quoted names and ordinary string texts then lose
their delimiters and decode the specified string escapes. Bare names keep their
internal whitespace and case. Neither receives common text sanitization or final
entity decoding. Flow labels retain their backslashes. [fixture:
wardley/lex-string-conversion] [fixture: wardley/line-string-values] [fixture:
wardley/entity-texts] [fixture: wardley/gram-reference-html-before-escape]
[fixture: wardley/space-name-values] [fixture:
wardley/lex-link-flow-raw-escapes]

For title, accessibility title and accessibility description, retain the last
assignment, including null or whitespace values. Apply shared common line/block
conversion, then the shared character replacement; description uses the shared
description reading too. An empty final body value clears earlier body values;
an empty final title falls back to the embedded frontmatter title. Only these
three published text fields receive the configuration-dependent replacement. Use
the fixture's specified embedded reading where its mark requires it, including
the HTML-in-frontmatter value difference. [fixture: wardley/common-repeat]
[fixture: wardley/common-repeat-empty] [fixture:
wardley/frontmatter-empty-body-title] [fixture:
wardley/config-security-level-other] [fixture:
wardley/div-html-frontmatter-value] [fixture: wardley/line-block-values]

Read numbers as doubles before comparing with 1. Values at most 1 become 100
times that value; larger values remain percentages. Coordinate pairs are written
as visibility then evolution, and publish evolution as x and visibility as y.
Label offsets apply each separately written sign to its unsigned magnitude. All
published numbers use `numberOrText()`, including non-finite sizes, annotation
numbers, boundaries and offsets, and negative zero. [fixture:
wardley/db-coordinate-boundary] [fixture: wardley/db-coordinate-double-one]
[fixture: wardley/db-coordinate-double-hundred] [fixture:
wardley/number-offset-negative-zero] [fixture: wardley/db-number-overflow]
[fixture: wardley/db-number-int-precision]

## Nodes and pipelines

Register all anchors in source order, then all top-level components, then each
pipeline's children in pipeline/body order. A node's comparison name is its id
and label. An anchor has className anchor and no inertia; a component has
className component and inertia false unless an inertia decoration is present.
Strategy and signed offsets come from their decorations. Replacing a key keeps
its first registration slot. Only omitted offsets inherit earlier values;
omitted strategy and inertia clear those fields. Prototype-looking names remain
ordinary Map keys. [fixture: wardley/db-publication-order] [fixture:
wardley/db-node-duplicates] [fixture: wardley/db-inertia-forms] [fixture:
wardley/db-prototype-names] [fixture: wardley/db-zero-first] [fixture:
wardley/db-zero-last]

A pipeline finds its parent by exact comparison id in that registration state.
Each child id joins parent, underscore and child name; its label is the child
name, className is pipeline-component, and y is the parent's then-current
published visibility. Inertia and strategy are absent. Apply the same offset
inheritance and collision rules. Publish every child id in membership order,
including duplicates. Replacing a pipeline keeps its first slot, replaces its
membership array and leaves earlier child nodes registered. [fixture:
wardley/db-pipeline-forward-parent] [fixture: wardley/db-pipeline-anchor-parent]
[fixture: wardley/db-pipeline-nested-parent] [fixture:
wardley/db-pipeline-collision] [fixture: wardley/db-pipeline-duplicates]
[fixture: wardley/db-pipeline-label-inheritance] [fixture:
wardley/db-empty-pipeline-names]

## Links and remaining publication

Resolve link endpoints after node registration: exact id, then the first current
label match in registration order, then the unresolved comparison name. Keep
links in source order, including duplicates and self links. Source port has
priority over target port and arrow flow. For a plus-prefixed arrow, test its
whole converted value for `<>`, then `<`, then `>`; markers inside the flow
label therefore affect the result. Dashed is true when that whole arrow contains
`-.->` or `.-.`. A flow label, including an empty one, precedes the trimmed
semicolon label. These readings do not replace the authored arrow fields.
[fixture: wardley/db-link-resolution] [fixture: wardley/db-link-exact-id]
[fixture: wardley/db-link-unresolved-duplicates] [fixture:
wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins] [fixture:
wardley/lex-flow-label-changes-direction] [fixture:
wardley/lex-flow-label-changes-bidirectional] [fixture:
wardley/lex-flow-label-changes-dashed] [fixture:
wardley/lex-flow-label-changes-dashed-short]

Publish trends only for exact existing ids, retaining the last target per id in
its first trend slot. Keep notes, annotations, accelerators and deaccelerators
in each category's source order, including empty texts and duplicates. Convert
only the first annotations box; later occurrences publish nothing. [fixture:
wardley/db-trend-missing] [fixture: wardley/db-trend-duplicates] [fixture:
wardley/db-array-duplicates] [fixture: wardley/db-empty-texts] [fixture:
wardley/db-later-invalid-box] [fixture: wardley/db-coordinate-boundary]

The last evolution statement supplies axes. Trim each stage name; a truthy
converted second name joins the trimmed names with one space, slash and one
space. Keep only written boundaries, in stage order. The last size supplies
width and height. Without those statements axes is empty and size is omitted.
Drawing defaults and the dropped derived flags remain absent. [fixture:
wardley/db-stages-boundaries] [fixture: wardley/db-stage-empty-second-name]
[fixture: wardley/db-singletons-last] [fixture: wardley/header-only]

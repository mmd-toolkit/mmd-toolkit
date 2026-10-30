# Agentflow nodes

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

This document defines the tree for `agentflow`. Shared root records and leaves
are defined in [ast.md](../ast.md); syntax and acceptance are defined in
[diagrams/agentflow.md](../diagrams/agentflow.md). The
[tests package summary](../../../tests/docs/db-summaries.md#agentflow) defines
the Db values and their conversion.

The body is an AgentflowDiagram. Written occurrences remain separate, in source
order, including repeated ids and declarations inside global blocks. The tree
has no inferred parent, generated id, effective shape, diagnostic, or layout
endpoint. [fixture: agentflow/gram-node-three-definitions] [fixture:
agentflow/db-flow-three-definitions] [fixture: agentflow/gram-global-after-flow]
[fixture: agentflow/db-flow-collapse]

Values keep their [written text](../ast.md#nodes), with source spelling,
entities, and whitespace where their own productions read it. Each field states
which string delimiters are outside its content; values are not the converted
diagram text. Only Identifier, StringLiteral, and NumericLiteral are shared
leaves. Every diagram-specific node below has the Agentflow prefix. [fixture:
agentflow/lex-quoted-crlf] [fixture: agentflow/entity-label-contexts] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/gram-style-whitespace-after-comma]

The field order below is also the child visitation order, with scalar fields
omitted. Link is the one exception to source order: its arrow is visited before
its label for both spellings. Nullable fields are present with null, and absent
lists are empty.

## Nodes

### AgentflowDiagram

| Field       | Type                       | Meaning                                         |
| ----------- | -------------------------- | ----------------------------------------------- |
| `direction` | string or null             | The written header direction; null when absent. |
| `body`      | list of AgentflowStatement | The statements in source order.                 |

Child fields: `body`. Range: the header keyword through the last written body
unit; a body without statements still includes its header. [fixture:
agentflow/header-only] [fixture: agentflow/header-empty-document] [fixture:
agentflow/header-br] [fixture: agentflow/gram-global]

**AgentflowStatement** is AgentflowEmptyStatement, AgentflowVertexStatement,
AgentflowFlowStatement, AgentflowGlobalStatement, AgentflowConnectorStatement,
AgentflowStyleStatement, AgentflowClassDefStatement, AgentflowClassStatement,
AgentflowLinkStyleStatement, AgentflowDefaultLinkStyleStatement,
AgentflowClickCallbackStatement, AgentflowClickUrlStatement,
AgentflowDirectionStatement, AgentflowAccTitleStatement,
AgentflowAccDescrStatement, or AgentflowAccDescrBlockStatement.

### AgentflowEmptyStatement

| Field  | Type | Meaning                     |
| ------ | ---- | --------------------------- |
| (none) | none | No diagram-specific fields. |

No child fields. Range: the one semicolon read as a statement, excluding a
separator or a semicolon ignored by the common line rule. [fixture:
agentflow/gram-class-double-semicolon] [fixture:
agentflow/gram-data-double-semicolon] [fixture:
agentflow/gram-tail-node-semicolons]

### AgentflowFlowStatement

| Field   | Type                       | Meaning                                           |
| ------- | -------------------------- | ------------------------------------------------- |
| `name`  | AgentflowName or null      | The written name; null only for the unnamed form. |
| `title` | AgentflowLabel or null     | The bracket title; null when absent.              |
| `data`  | list of AgentflowDataBlock | The heading data blocks, separately.              |
| `body`  | list of AgentflowStatement | Statements through the closing end.               |

Child fields: `name`, `title`, `data`, `body`. Range: the flow keyword through
its closing end keyword, excluding following whitespace. [fixture:
agentflow/gram-flow-all-forms] [fixture: agentflow/gram-flow-inline-data]
[fixture: agentflow/gram-flow-empty] [fixture:
agentflow/gram-flow-name-whitespace-only] [fixture:
agentflow/gram-empty-description-after-flow-name] [fixture:
agentflow/gram-empty-description-after-flow-title]

An unnamed flow has no name node or generated-id field. A whitespace-only
written name is a Name with a whitespace Label. Empty blocks read within a name
stay in that Name as AgentflowIgnoredText with kind empty-description-block;
after an explicit bracket title, they are the first body statements. [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-flow-all-forms] [fixture: agentflow/gram-flow-inline-data]
[fixture: agentflow/gram-flow-empty] [fixture:
agentflow/gram-flow-name-whitespace-only] [fixture:
agentflow/gram-empty-description-after-flow-name] [fixture:
agentflow/gram-empty-description-after-flow-title] [fixture:
agentflow/gram-nested-unnamed-flow]

### AgentflowGlobalStatement

| Field  | Type                       | Meaning                            |
| ------ | -------------------------- | ---------------------------------- |
| `body` | list of AgentflowStatement | The written body, in source order. |

Child fields: `body`. Range: global through the closing end, excluding following
whitespace. [fixture: agentflow/gram-global] [fixture:
agentflow/gram-global-data] [fixture: agentflow/gram-global-nested] [fixture:
agentflow/gram-global-in-global] [fixture: agentflow/gram-flow-inside-global]
[fixture: agentflow/gram-empty-description-after-global] [fixture:
agentflow/gram-empty-description-global-semicolon]

There is no name, title, or metadata field. A closed empty description block
after the heading is the first body statement. A global block may itself contain
global or flow blocks. [fixture: agentflow/gram-global] [fixture:
agentflow/gram-global-data] [fixture: agentflow/gram-global-nested] [fixture:
agentflow/gram-global-in-global] [fixture: agentflow/gram-flow-inside-global]
[fixture: agentflow/gram-empty-description-after-global] [fixture:
agentflow/gram-empty-description-global-semicolon]

### AgentflowConnectorStatement

| Field   | Type                       | Meaning                              |
| ------- | -------------------------- | ------------------------------------ |
| `name`  | AgentflowName              | The required written name.           |
| `title` | AgentflowLabel or null     | The bracket title; null when absent. |
| `data`  | list of AgentflowDataBlock | The heading data blocks, separately. |

Child fields: `name`, `title`, `data`. Range: connector through the last heading
unit, excluding its separator. [fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-connector-name-whitespace-only] [fixture:
agentflow/gram-empty-description-after-connector-name] [fixture:
agentflow/gram-empty-description-after-connector-title] [fixture:
agentflow/lex-empty-description-in-connector-name]

There is no body or closing end. A whitespace-only name is retained. Empty
description blocks in the name are IgnoredText parts with kind
empty-description-block; after the bracket title, a terminal block is a
following statement. [fixture: agentflow/gram-connector-all-forms] [fixture:
agentflow/gram-connector-name-whitespace-only] [fixture:
agentflow/gram-empty-description-after-connector-name] [fixture:
agentflow/gram-empty-description-after-connector-title] [fixture:
agentflow/lex-empty-description-in-connector-name]

### AgentflowName

| Field   | Type                                                      | Meaning                                                 |
| ------- | --------------------------------------------------------- | ------------------------------------------------------- |
| `parts` | nonempty list of (AgentflowLabel or AgentflowIgnoredText) | Name fragments and erased forms, including empty forms. |

Child fields: `parts`. Range: the first part through the last part, including
intervening source whitespace and discarded delimiters. [fixture:
agentflow/lex-flow-name-click-state] [fixture:
agentflow/lex-connector-name-click-state] [fixture:
agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/lex-connector-name-click-mixed] [fixture:
agentflow/lex-flow-name-click-after-string] [fixture:
agentflow/gram-flow-name-space-between-empty-blocks] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/lex-flow-name-click-fragment-comma]

At least one Label part is required; erased forms alone do not supply a name.
Normally there is one Label. Ordinary fragments are maximal, and retain
whitespace read by the name production, including at their ends. Split only at
an erased click (kind click), a closed empty description block (kind
empty-description-block), a recognized erased empty string (kind empty-string),
empty markdown string (kind empty-markdown-string), empty call (kind
empty-call), or the end of a click-context fragment. [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-string-in-connector-name] [fixture:
agentflow/lex-empty-call-in-connector-name] Its terminating whitespace is
exactly one whitespace character outside the fragment; further ordinary
whitespace belongs to the next fragment. An initial string or markdown fragment
keeps its written kind, even where Mermaid reads it as text; later ordinary
fragments have kind text. [fixture: agentflow/lex-name-click-exit-tab] [fixture:
agentflow/lex-name-click-exit-nbsp] [fixture: agentflow/lex-name-click-exit-ls]
[fixture: agentflow/lex-name-click-exit-ps] [fixture:
agentflow/lex-name-click-exit-crlf] [fixture:
agentflow/lex-name-click-exit-extra-space] [fixture:
agentflow/lex-name-click-initial-string] [fixture:
agentflow/lex-name-click-initial-markdown] [fixture:
agentflow/lex-name-markdown-before-click] [fixture:
agentflow/lex-name-click-empty-block] [fixture:
agentflow/lex-name-repeated-click] [fixture:
agentflow/lex-flow-name-click-state] [fixture:
agentflow/lex-connector-name-click-state] [fixture:
agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/lex-connector-name-click-mixed] [fixture:
agentflow/lex-flow-name-click-after-string] [fixture:
agentflow/gram-flow-name-space-between-empty-blocks] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/lex-flow-name-click-fragment-comma]

A name part is not a resolved id. Keep the two spaces around a retained empty
description block (kind empty-description-block) as written text; do not join
its surrounding fragments into a normalized value. A part that is only
whitespace is nonempty. The grammar defines which fragment kinds may occur.
Quotes inside an already-started ordinary name unit remain Label text, not
IgnoredText. [fixture: agentflow/lex-empty-quote-spelling-inside-name-unit]
[fixture: agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/lex-empty-description-in-connector-name] [fixture:
agentflow/gram-flow-name-double-space] [fixture:
agentflow/gram-flow-name-whitespace-only]

A retained empty block (kind empty-description-block), recognized erased empty
string (kind empty-string), empty markdown string (kind empty-markdown-string),
or empty call (kind empty-call) may precede the initial ordinary or quoted
fragment. It is an IgnoredText part and does not change the Label fragment's
kind. [fixture: agentflow/lex-empty-string-before-quoted-flow-name] [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-string-in-connector-name] [fixture:
agentflow/lex-empty-call-in-connector-name] [fixture:
agentflow/gram-empty-description-before-flow-name] [fixture:
agentflow/gram-empty-description-before-connector-string] [fixture:
agentflow/gram-empty-description-no-flow-name]

Within Name fragments, even keyword-shaped or numeric name pieces are text, not
structural keyword or NumericLiteral positions. A directive inside them is
allowed. [fixture: agentflow/lex-directive-in-name-keyword-text] [fixture:
agentflow/lex-directive-in-name-number-text]

A click context in a name may recognize an empty string (kind empty-string) or
empty markdown string (kind empty-markdown-string) without contributing a Label
fragment. Retain the click (kind click) and empty form as separate
AgentflowIgnoredText parts. The required Label may come later, as in flow click
"" A, or already precede click, as in connector F click "". An empty call (kind
empty-call) may follow the empty string (kind empty-string) after the context
exit, before later name text. [fixture:
agentflow/lex-name-click-empty-string-before-text] [fixture:
agentflow/lex-name-click-empty-markdown-before-text] [fixture:
agentflow/lex-name-click-empty-string-then-call] [fixture:
agentflow/lex-connector-name-click-empty-string-tail] [fixture:
agentflow/lex-name-click-empty-string-before-string]

In a flow name, flow click ""A and the same adjacent form with an empty markdown
string are rejected. [fixture:
agentflow/gram-name-click-empty-string-adjacent-text] [fixture:
agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

In a connector name, a recognized erased empty string or empty markdown string
after click may be directly followed by name text. Retain each empty form as a
separate AgentflowIgnoredText part with kind empty-string or
empty-markdown-string, respectively, and the following text as an AgentflowLabel
part with kind text. An empty string may be directly followed by an empty
markdown string before the name text. The text may start with a semicolon,
provide the required Label when no earlier one is present, or consist only of a
trailing semicolon. [fixture:
agentflow/lex-connector-name-click-empty-string-adjacent-text] [fixture:
agentflow/lex-connector-name-click-empty-string-adjacent-semicolon] [fixture:
agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]

An erased click with nothing recognized after it cannot remain a terminal marker
at EOF, even after an existing name fragment. A source ending with connector
click, with or without a final LF, or connector F click is rejected by Mermaid
too; these cases have no divergence mark. [fixture:
agentflow/gram-connector-name-click-only-eof] [fixture:
agentflow/gram-connector-name-click-only-newline] [fixture:
agentflow/gram-connector-name-terminal-click-eof]

### AgentflowVertexStatement

| Field   | Type                  | Meaning                            |
| ------- | --------------------- | ---------------------------------- |
| `first` | AgentflowVertexGroup  | The first group.                   |
| `links` | list of AgentflowLink | The links and their target groups. |

Child fields: `first`, `links`. Range: the first vertex through the last vertex,
class suffix, or data block, excluding the separator. [fixture:
agentflow/gram-bare-node] [fixture: agentflow/gram-group-spaces] [fixture:
agentflow/gram-edge-chain] [fixture: agentflow/gram-node-three-definitions]

A single vertex or group has an empty links list. Repeated vertex occurrences
remain separate. The source of a link is first, or the target of the preceding
link; it is not duplicated as another child. [fixture: agentflow/gram-bare-node]
[fixture: agentflow/gram-group-spaces] [fixture: agentflow/gram-edge-chain]
[fixture: agentflow/gram-node-three-definitions]

### AgentflowVertexGroup

| Field      | Type                             | Meaning                        |
| ---------- | -------------------------------- | ------------------------------ |
| `vertices` | nonempty list of AgentflowVertex | The vertices in written order. |

Child fields: `vertices`. Range: the first vertex through the last vertex,
including data attached to group members. [fixture: agentflow/gram-group-spaces]
[fixture: agentflow/gram-group-data]

### AgentflowVertex

| Field      | Type                       | Meaning                           |
| ---------- | -------------------------- | --------------------------------- |
| `id`       | Identifier                 | The written id, commas included.  |
| `shape`    | AgentflowShape or null     | The bracket shape, or null.       |
| `cssClass` | Identifier or null         | The name after :::, or null.      |
| `data`     | list of AgentflowDataBlock | Each adjacent written data block. |

Child fields: `id`, `shape`, `cssClass`, `data`. Range: the id through its last
shape, class suffix, or data block. [fixture: agentflow/gram-style-suffix]
[fixture: agentflow/gram-id-numbers-unicode] [fixture:
agentflow/db-data-block-routing] [fixture:
agentflow/db-generated-edge-id-metadata-target]

The node records this occurrence, including metadata-only occurrences. It is not
replaced according to a later declaration or metadata target. The id, class
suffix, and shape-property operands use Identifier even when their spelling
looks numeric. [fixture: agentflow/gram-style-suffix] [fixture:
agentflow/gram-id-numbers-unicode] [fixture: agentflow/db-data-block-routing]
[fixture: agentflow/db-generated-edge-id-metadata-target]

### AgentflowShape

| Field      | Type                           | Meaning                                          |
| ---------- | ------------------------------ | ------------------------------------------------ |
| `name`     | string                         | A full name from the shape table.                |
| `property` | AgentflowShapeProperty or null | The property in a [\| rectangle; otherwise null. |
| `label`    | AgentflowLabel                 | The written interior label.                      |

Child fields: `property`, `label`. Range: the opening shape delimiter through
the closing delimiter. [fixture: agentflow/gram-bracket-shapes] [fixture:
agentflow/gram-props] [fixture: agentflow/db-data-block-aliases]

Names and delimiters are those of [Shapes](../diagrams/flowchart.md#shapes),
including rectangle, rounded, framed-rectangle, trapezoid-bottom, lean-right,
and ellipse. A metadata shape name remains opaque data and does not replace this
field. [fixture: agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props]
[fixture: agentflow/db-data-block-aliases]

### AgentflowShapeProperty

| Field   | Type       | Meaning                    |
| ------- | ---------- | -------------------------- |
| `name`  | Identifier | The name before the colon. |
| `value` | Identifier | The value after the colon. |

Child fields: `name`, `value`. Range: the first operand through the second,
including their colon but excluding the surrounding bars. [fixture:
agentflow/gram-props] [fixture: agentflow/gram-props-repeated]

### AgentflowLink

| Field     | Type                          | Meaning                                |
| --------- | ----------------------------- | -------------------------------------- |
| `id`      | Identifier or null            | The edge id without @, or null.        |
| `opening` | AgentflowOpeningArrow or null | The split-form opening arrow, or null. |
| `arrow`   | AgentflowArrow                | The closed or closing arrow.           |
| `label`   | AgentflowLabel or null        | The pipe or split label, or null.      |
| `target`  | AgentflowVertexGroup          | The target group.                      |

Child fields: `id`, `opening`, `arrow`, `label`, `target`. Range: the edge id or
first arrow through the end of the target group. [fixture:
agentflow/gram-reference-edge-id] [fixture: agentflow/gram-edge-id] [fixture:
agentflow/gram-split-edge-id] [fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-reference-quoted-pipe-label] [fixture:
agentflow/gram-split-edge-string-bare-tail]

Visit arrow before label in both label spellings, although a split label
precedes its closing arrow in the source. There is no edgeSemantic field; the
arrow fields distinguish the three kinds. A reference label is retained.
[fixture: agentflow/gram-edge-id] [fixture: agentflow/gram-split-edge-id]
[fixture: agentflow/gram-three-edge-kinds] [fixture:
agentflow/gram-reference-quoted-pipe-label] [fixture:
agentflow/gram-split-edge-string-bare-tail]

### AgentflowArrow

| Field         | Type    | Meaning                                           |
| ------------- | ------- | ------------------------------------------------- |
| `value`       | string  | The written arrow without surrounding whitespace. |
| `startMarker` | string  | Always none.                                      |
| `line`        | string  | solid or dotted.                                  |
| `length`      | integer | The written dash or dot count.                    |
| `endMarker`   | string  | arrow, cross, or none.                            |

No child fields. Range: the arrow characters, excluding surrounding whitespace.
[fixture: agentflow/gram-three-edge-kinds] [fixture:
agentflow/gram-edge-extended-length] [fixture: agentflow/db-edge-length-cap]
[fixture: agentflow/gram-reference-quoted-pipe-label]

A solid arrow counts every dash and ends in > or x. A reference arrow counts
only its dots, excluding its required surrounding dashes, and has endMarker
none. Keep the written count without the Db length cap. [fixture:
agentflow/gram-three-edge-kinds] [fixture: agentflow/gram-edge-extended-length]
[fixture: agentflow/db-edge-length-cap] [fixture:
agentflow/gram-reference-quoted-pipe-label]

### AgentflowOpeningArrow

| Field         | Type   | Meaning         |
| ------------- | ------ | --------------- |
| `value`       | string | The written --. |
| `startMarker` | string | Always none.    |
| `line`        | string | Always solid.   |

No child fields. Range: the two dashes, excluding surrounding whitespace.
[fixture: agentflow/gram-split-sequence-label] [fixture:
agentflow/gram-split-failure-label]

It has no independent length or end marker. Its closing arrow is solid and may
end in > or x. [fixture: agentflow/gram-split-sequence-label] [fixture:
agentflow/gram-split-failure-label]

### AgentflowLabel

| Field   | Type   | Meaning                    |
| ------- | ------ | -------------------------- |
| `kind`  | string | text, string, or markdown. |
| `value` | string | The written content.       |

No child fields. Range: the complete label or name fragment, including its
initial string delimiters when present. [fixture:
agentflow/gram-node-quoted-padding] [fixture:
agentflow/lex-edge-whitespace-label] [fixture:
agentflow/gram-label-whitespace-only] [fixture:
agentflow/gram-flow-name-string-bare-tail] [fixture:
agentflow/gram-split-edge-string-bare-tail] [fixture:
agentflow/gram-flow-name-quoted-padding]

Kind records the initial form. Value is its initial string content followed by
written bare continuation, or the written bare text. Interior whitespace
remains; outside padding is excluded except inside quoted content, in an
all-whitespace label, or where a Name fragment reads it. The value is nonempty;
a whitespace-only label remains whitespace. [fixture:
agentflow/gram-node-quoted-padding] [fixture:
agentflow/lex-edge-whitespace-label] [fixture:
agentflow/gram-label-whitespace-only] [fixture:
agentflow/gram-flow-name-string-bare-tail] [fixture:
agentflow/gram-split-edge-string-bare-tail] [fixture:
agentflow/gram-flow-name-quoted-padding]

### AgentflowLiteral

| Field   | Type   | Meaning                         |
| ------- | ------ | ------------------------------- |
| `value` | string | The written text of this value. |

No child fields. Range: its value text, excluding whitespace outside the value.
[fixture: agentflow/db-style-leading-whitespace] [fixture:
agentflow/db-call-name-space-before-parentheses] [fixture:
agentflow/gram-click-callback-space-args] [fixture:
agentflow/gram-style-whitespace-after-comma]

Use it for styles, callback names after call and their arguments, and
accessibility text. These positions permit whitespace even when one example is a
single word. Keep leading whitespace after a style comma, padding before the
callback opening parenthesis, and argument padding. An absent or whitespace-only
optional literal is null; a whitespace-only style is a null list item. [fixture:
agentflow/db-style-leading-whitespace] [fixture:
agentflow/db-call-name-space-before-parentheses] [fixture:
agentflow/gram-click-callback-space-args] [fixture:
agentflow/gram-style-whitespace-after-comma]

### AgentflowDataBlock

| Field   | Type   | Meaning                                |
| ------- | ------ | -------------------------------------- |
| `value` | string | The written interior between @{ and }. |

No child fields. Range: one complete block from @{ through its closing brace.
[fixture: agentflow/db-data-block-empty-multiline] [fixture:
agentflow/db-data-block-recursive-prototype-keys] [fixture:
agentflow/gram-data-null-document] [fixture:
agentflow/gram-data-adjacent-multiline-blocks]

Empty and adjacent blocks remain actual nodes. The value is not YAML or a
property list in the tree; retain prototype keys, aliases, and authored shape
spellings. Each attachment belongs to its written occurrence. [fixture:
agentflow/db-data-block-empty-multiline] [fixture:
agentflow/db-data-block-recursive-prototype-keys] [fixture:
agentflow/gram-data-null-document] [fixture:
agentflow/gram-data-adjacent-multiline-blocks]

### AgentflowIgnoredText

| Field   | Type   | Meaning                                                         |
| ------- | ------ | --------------------------------------------------------------- |
| `kind`  | string | The recognized form; one of the six kinds below.                |
| `value` | string | Nonempty written ignored text, including empty-form delimiters. |

No child fields. Range: the retained ignored characters, excluding whitespace at
their outside ends. [fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/lex-direction-unclosed-bracket-prefix] [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-empty-description-before-href] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/lex-empty-description-in-connector-name]

The required kind is exactly one of the following, selected by the recognized
lexical form:

- click: the erased reserved word click in a Name or click-prefix field.
  [fixture: agentflow/lex-flow-name-click-state]
- empty-string: a recognized erased empty string. [fixture:
  agentflow/lex-empty-string-in-flow-name]
- empty-markdown-string: a recognized erased empty markdown string. [fixture:
  agentflow/lex-empty-markdown-in-flow-name]
- empty-call: a recognized erased empty call. [fixture:
  agentflow/lex-empty-call-in-flow-name]
- empty-description-block: a recognized closed empty description block in a Name
  or click-prefix field. [fixture: agentflow/lex-empty-description-in-flow-name]
- direction-text: the ignored prefix or suffix of a direction line. [fixture:
  agentflow/lex-direction-swallows-shape-and-edge]

Name parts and click-prefix fields use the first five kinds; direction prefixes
and suffixes use direction-text. An empty form retains its full written
spelling, including delimiters and internal whitespace; its value is nonempty
even when its string or call content is empty. [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-string-in-connector-name] [fixture:
agentflow/lex-empty-call-in-connector-name] [fixture:
agentflow/lex-empty-call-before-href] [fixture:
agentflow/lex-empty-string-before-url] [fixture:
agentflow/lex-empty-markdown-before-href] [fixture:
agentflow/lex-empty-string-before-url-tooltip] [fixture:
agentflow/lex-empty-call-before-url-tooltip] [fixture:
agentflow/lex-empty-markdown-before-callback-tooltip] [fixture:
agentflow/lex-mixed-empty-forms-before-url-tooltip] It is not a free statement
or a general malformed-text node. [fixture:
agentflow/lex-direction-swallows-shape-and-edge] [fixture:
agentflow/lex-direction-unclosed-bracket-prefix] [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-empty-description-before-href] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/lex-empty-description-in-connector-name]

### AgentflowStyleStatement

| Field    | Type                                        | Meaning                     |
| -------- | ------------------------------------------- | --------------------------- |
| `id`     | Identifier                                  | The id, including commas.   |
| `styles` | nonempty list of (AgentflowLiteral or null) | One item per written style. |

Child fields: `id`, `styles`. Range: style through the last written unit of the
statement, excluding its separator and trailing padding. A single null style
ends the range at the id; a terminal null style after a comma ends it at that
comma. [fixture: agentflow/gram-style-all-null] [fixture:
agentflow/gram-style-whitespace-only] [fixture:
agentflow/db-style-leading-whitespace] [fixture:
agentflow/gram-style-whitespace-after-comma] [fixture:
agentflow/gram-style-backslash-before-comma]

A style starts immediately after its preceding comma, retaining leading
whitespace; its trailing padding is outside its value. The first style follows
the required one-space keyword/id gaps and retains any additional leading style
whitespace. [fixture: agentflow/db-node-style-first-leading-spaces] [fixture:
agentflow/db-node-style-first-leading-tab] [fixture:
agentflow/db-node-style-tab-gaps-leading-tab] A style consisting only of
whitespace is null, including after the final comma. [fixture:
agentflow/gram-style-whitespace-only] [fixture:
agentflow/db-style-leading-whitespace] [fixture:
agentflow/gram-style-whitespace-after-comma] [fixture:
agentflow/gram-style-backslash-before-comma]

### AgentflowClassDefStatement

| Field        | Type                                        | Meaning                      |
| ------------ | ------------------------------------------- | ---------------------------- |
| `cssClasses` | nonempty list of (Identifier or null)       | Class names split at commas. |
| `styles`     | nonempty list of (AgentflowLiteral or null) | The written styles.          |

Child fields: `cssClasses`, `styles`. Range: classDef through the last written
unit of the statement, excluding its separator and trailing padding. A single
null style ends the range at the last unit of the class-name list; a terminal
null style after a comma ends it at that comma. [fixture:
agentflow/gram-classdef-all-null] [fixture:
agentflow/gram-classdef-trailing-null-style] [fixture:
agentflow/gram-classdef-escaped-comma] [fixture:
agentflow/gram-classdef-trailing-empty-name] [fixture:
agentflow/gram-classdef-escaped-comma-whitespace-tail] [fixture:
agentflow/gram-style-backslash-before-comma]

An empty class-name part, including the last part after a comma, is null. A
comma immediately after a backslash remains within one style value, unlike in
style and linkStyle statements. Its spelling is not unescaped in this tree.
[fixture: agentflow/gram-classdef-escaped-comma] [fixture:
agentflow/gram-classdef-trailing-empty-name] [fixture:
agentflow/gram-classdef-escaped-comma-whitespace-tail] [fixture:
agentflow/gram-style-backslash-before-comma]

### AgentflowClassStatement

| Field      | Type                                  | Meaning                             |
| ---------- | ------------------------------------- | ----------------------------------- |
| `ids`      | nonempty list of (Identifier or null) | The target-id parts between commas. |
| `cssClass` | Identifier                            | The second id, commas included.     |

Child fields: `ids`, `cssClass`. Range: class through the end of its second id.
[fixture: agentflow/gram-class-target-empty-ends] [fixture:
agentflow/gram-class-semicolon] [fixture:
agentflow/gram-empty-description-after-class-glued]

Empty target-id parts are null, including first and last parts. The second id is
one Identifier, not a comma list. [fixture:
agentflow/gram-class-target-empty-ends] [fixture:
agentflow/gram-class-semicolon] [fixture:
agentflow/gram-empty-description-after-class-glued]

### AgentflowLinkStyleStatement

| Field         | Type                               | Meaning                              |
| ------------- | ---------------------------------- | ------------------------------------ |
| `indices`     | nonempty list of NumericLiteral    | The written link indices.            |
| `interpolate` | Identifier or null                 | The name after interpolate, or null. |
| `styles`      | list of (AgentflowLiteral or null) | The styles; empty when absent.       |

Child fields: `indices`, `interpolate`, `styles`. Range: linkStyle through the
last written unit of the statement, excluding its separator and trailing
padding. With no interpolation name and a single null style, it ends at the last
index; a terminal null style after a comma ends it at that comma. [fixture:
agentflow/gram-linkstyle-all-null] [fixture:
agentflow/gram-linkstyle-trailing-null-style] [fixture:
agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/lex-linkstyle-leading-zero] [fixture:
agentflow/gram-empty-description-splits-interpolate-spaces]

At least interpolate or styles is present. NumericLiteral keeps raw spelling,
while acceptance separately requires canonical indices. A whitespace-only style
is null even where a terminal empty block separates its whitespace units.
[fixture: agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/lex-linkstyle-leading-zero] [fixture:
agentflow/gram-empty-description-splits-interpolate-spaces]

### AgentflowDefaultLinkStyleStatement

| Field         | Type                               | Meaning                          |
| ------------- | ---------------------------------- | -------------------------------- |
| `interpolate` | Identifier or null                 | The interpolation name, or null. |
| `styles`      | list of (AgentflowLiteral or null) | The styles; empty when absent.   |

Child fields: `interpolate`, `styles`. Range: linkStyle through the last written
unit of the statement, excluding its separator and trailing padding. With no
interpolation name and a single null style, it ends at the default keyword; a
terminal null style after a comma ends it at that comma. [fixture:
agentflow/gram-default-linkstyle-all-null] [fixture:
agentflow/gram-default-linkstyle-trailing-null-style] [fixture:
agentflow/gram-linkstyle-default] [fixture:
agentflow/gram-linkstyle-interpolate-default]

It represents the fixed default alternative and has no numeric indices. At least
interpolate or styles is present. [fixture: agentflow/gram-linkstyle-default]
[fixture: agentflow/gram-linkstyle-interpolate-default]

### AgentflowClickCallbackStatement

| Field               | Type                                  | Meaning                                                     |
| ------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `ids`               | nonempty list of (Identifier or null) | The click-id parts between commas.                          |
| `callback`          | Identifier or AgentflowLiteral        | A bare callback id, or the name after call.                 |
| `arguments`         | AgentflowLiteral or null              | Written argument text; null when absent or all whitespace.  |
| `textBeforeTooltip` | list of AgentflowIgnoredText          | Erased prefixes, including empty forms, before the tooltip. |
| `tooltip`           | StringLiteral or null                 | The tooltip string, or null.                                |

Child fields: `ids`, `callback`, `arguments`, `textBeforeTooltip`, `tooltip`.
Range: the first click keyword through the last callback unit or tooltip,
excluding its separator. [fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/gram-click-callback-blank-args] [fixture:
agentflow/gram-click-callback-space-args] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-callback-arguments-after-second-call] [fixture:
agentflow/gram-click-id-empty-ends]

Empty id parts are null. A name after call is Literal because its context
permits whitespace and line breaks; a bare callback is Identifier. The name
retains LF, CRLF, U+2028, and U+2029 as written. [fixture:
agentflow/lex-callback-name-lf] [fixture: agentflow/lex-callback-name-crlf]
[fixture: agentflow/lex-callback-name-u2028] [fixture:
agentflow/lex-callback-name-u2029] Arguments remain one opaque literal, with
their padding. Empty first parentheses can be followed by arguments after a
second call. The prefix list retains each recognized erased click (kind click),
closed empty description block (kind empty-description-block), empty string
(kind empty-string), empty markdown string (kind empty-markdown-string), or
empty call (kind empty-call) before a following tooltip. It is empty without
such a prefix, or when tooltip is null. [fixture:
agentflow/lex-empty-markdown-before-callback-tooltip] [fixture:
agentflow/gram-click-callback-forms] [fixture:
agentflow/gram-click-callback-blank-args] [fixture:
agentflow/gram-click-callback-space-args] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-callback-arguments-after-second-call] [fixture:
agentflow/gram-click-id-empty-ends] [fixture:
agentflow/gram-empty-description-before-callback-tooltip]

### AgentflowClickUrlStatement

| Field               | Type                                  | Meaning                                                     |
| ------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `ids`               | nonempty list of (Identifier or null) | The click-id parts between commas.                          |
| `textBeforeUrl`     | list of AgentflowIgnoredText          | Erased prefixes, including empty forms, before the URL.     |
| `url`               | StringLiteral                         | The URL string.                                             |
| `textBeforeTooltip` | list of AgentflowIgnoredText          | Erased prefixes, including empty forms, before the tooltip. |
| `tooltip`           | StringLiteral or null                 | The tooltip, or null.                                       |
| `target`            | string or null                        | _self, _blank, _parent, _top, or null.                      |

Child fields: `ids`, `textBeforeUrl`, `url`, `textBeforeTooltip`, `tooltip`.
Range: the first click keyword through its last string or target, excluding its
separator. [fixture: agentflow/gram-click-link-forms] [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/gram-click-erased-before-url-tooltip] [fixture:
agentflow/gram-click-erased-after-href] [fixture:
agentflow/gram-empty-description-before-href] [fixture:
agentflow/gram-url-tooltip-whitespace-only] [fixture:
agentflow/gram-empty-description-after-url-glued]

Prefix lists retain each recognized erased click (kind click), closed empty
description block (kind empty-description-block), empty string (kind
empty-string), empty markdown string (kind empty-markdown-string), or empty call
(kind empty-call) separately. [fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url] [fixture:
agentflow/lex-empty-markdown-before-href] [fixture:
agentflow/lex-empty-string-before-url-tooltip] [fixture:
agentflow/lex-empty-call-before-url-tooltip] [fixture:
agentflow/lex-empty-markdown-before-callback-tooltip] [fixture:
agentflow/lex-mixed-empty-forms-before-url-tooltip] textBeforeUrl covers such
forms before or after href; href remains a keyword unit of the parent. Every URL
and tooltip StringLiteral is closed and nonempty, including whitespace-only
strings. A terminal empty description block after the URL is a following
statement, not a prefix. If tooltip is null, textBeforeTooltip is empty. A block
before a target has no prefix field and is rejected when it cannot be a
following statement. [fixture: agentflow/gram-click-link-forms] [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/gram-click-erased-before-url-tooltip] [fixture:
agentflow/gram-click-erased-after-href] [fixture:
agentflow/gram-empty-description-before-href] [fixture:
agentflow/gram-url-tooltip-whitespace-only] [fixture:
agentflow/gram-empty-description-after-url-glued]

Closed empty blocks (kind empty-description-block) before a URL or callback
tooltip use textBeforeTooltip, just like the erased click marker (kind click).
[fixture: agentflow/gram-click-erased-before-url-tooltip] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-empty-description-before-url-tooltip] [fixture:
agentflow/gram-empty-description-before-callback-tooltip] [fixture:
agentflow/div-empty-description-before-link-target]

### AgentflowDirectionStatement

| Field        | Type                         | Meaning                                                    |
| ------------ | ---------------------------- | ---------------------------------------------------------- |
| `textBefore` | AgentflowIgnoredText or null | Text before direction; null when empty or whitespace-only. |
| `direction`  | string                       | TB, BT, RL, LR, or TD.                                     |
| `textAfter`  | AgentflowIgnoredText or null | Text after the value; null when empty or whitespace-only.  |

Child fields: `textBefore`, `textAfter`. Range: the first non-whitespace
character of the direction line through its last non-whitespace character.
[fixture: agentflow/lex-direction-value-priority] [fixture:
agentflow/lex-direction-last-selected-occurrence] [fixture:
agentflow/lex-direction-swallows-shape-and-edge] [fixture:
agentflow/gram-direction-value-next-line] [fixture:
agentflow/lex-direction-unclosed-bracket-prefix]

Non-null textBefore and textAfter nodes have kind direction-text. Keep the
ignored prefix and suffix even when they look like an unclosed shape or a
complete link. A line break between direction and its value remains within the
statement range. [fixture: agentflow/lex-direction-value-priority] [fixture:
agentflow/lex-direction-last-selected-occurrence] [fixture:
agentflow/lex-direction-swallows-shape-and-edge] [fixture:
agentflow/gram-direction-value-next-line] [fixture:
agentflow/lex-direction-unclosed-bracket-prefix]

### AgentflowAccTitleStatement

| Field   | Type                     | Meaning                                   |
| ------- | ------------------------ | ----------------------------------------- |
| `value` | AgentflowLiteral or null | The written title text; null when absent. |

Child fields: `value`. Range: accTitle through its colon or last value
character. [fixture: agentflow/db-acctitle-next-line] [fixture:
agentflow/lex-title-inline-percent-content] [fixture:
agentflow/db-acctitle-comment-next-line] [fixture: agentflow/db-acctitle-eof]

Whitespace after the colon can include line breaks, so the next physical line
can supply the value. Semicolons and percent pairs inside the value remain text.
[fixture: agentflow/db-acctitle-next-line] [fixture:
agentflow/lex-title-inline-percent-content] [fixture:
agentflow/db-acctitle-comment-next-line] [fixture: agentflow/db-acctitle-eof]

### AgentflowAccDescrStatement

| Field   | Type                     | Meaning                                         |
| ------- | ------------------------ | ----------------------------------------------- |
| `value` | AgentflowLiteral or null | The written description text; null when absent. |

Child fields: `value`. Range: accDescr through its colon or last value
character. [fixture: agentflow/db-accdescr-eof] [fixture:
agentflow/db-accdescr-next-line] [fixture:
agentflow/lex-accessibility-semicolon-value]

The line-value rules are the same as for an accessibility title. It is distinct
from the block statement. [fixture: agentflow/db-accdescr-eof] [fixture:
agentflow/db-accdescr-next-line] [fixture:
agentflow/lex-accessibility-semicolon-value]

### AgentflowAccDescrBlockStatement

| Field    | Type                     | Meaning                                   |
| -------- | ------------------------ | ----------------------------------------- |
| `value`  | AgentflowLiteral or null | The written content, or null when absent. |
| `closed` | boolean                  | Whether a closing brace is written.       |

Child fields: `value`. Range: accDescr through its closing brace, or through the
source end when unclosed. [fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed] [fixture:
agentflow/lex-empty-description-before-node] [fixture:
agentflow/gram-empty-description-after-vertex] [fixture:
agentflow/gram-empty-description-after-header-direction] [fixture:
agentflow/gram-empty-description-after-flow-title] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-empty-description-before-href]

Retain nonempty content to EOF in an unclosed block, even when Mermaid does not
use it. A closed empty block has value null and closed true. Where it is a
statement, keep it separately; in a Name or click-prefix field, its full written
form is IgnoredText with kind empty-description-block instead. [fixture:
agentflow/db-accessibility-unclosed-block] [fixture:
agentflow/db-accessibility-empty-unclosed] [fixture:
agentflow/lex-empty-description-before-node] [fixture:
agentflow/gram-empty-description-after-vertex] [fixture:
agentflow/gram-empty-description-after-header-direction] [fixture:
agentflow/gram-empty-description-after-flow-title] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-empty-description-before-href]

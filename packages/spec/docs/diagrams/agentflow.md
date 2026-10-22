# Agentflow

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

Source of truth in mermaid.js:

- [`agentflow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L38-L673)
- [`afDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/afDetector.ts#L7-L11)
- [`NOTES.md`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/NOTES.md#L20-L62)
- [`agentflowParser.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflowParser.ts#L1-L18)
- [`agentflowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L213-L2492)
- [`shapes.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/shapes.ts#L1-L147)
- [`transformData.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/transformData.ts#L1-L22)
- [`types.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/types.ts#L1-L244)
- [`diagnostics.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/diagnostics.ts#L1-L192)

This document covers `agentflow`. Its tree is defined in
[ast/agentflow.md](../ast/agentflow.md). Db conversion, metadata routing,
membership, and diagnostics are defined by the
[tests package summary](../../../tests/docs/db-summaries.md#agentflow), rather
than by this syntax.

## Detection

Entry 6 of [detection.md](../detection.md) selects agentflow at the common
detection point for exact lower-case agentflow-beta, followed by a non-word
character or the end. The grammar reads the header again. There is no stable
agentflow header and no case folding; a hyphen or non-ASCII suffix can pass
detection and still fail the grammar. [fixture: agentflow/header-only] [fixture:
agentflow/header-without-beta] [fixture: agentflow/header-upper] [fixture:
agentflow/detect-letter-suffix] [fixture: agentflow/detect-digit-suffix]
[fixture: agentflow/detect-underscore-suffix] [fixture:
agentflow/detect-hyphen-suffix] [fixture: agentflow/detect-non-ascii-suffix]

Detection precedes C4, so C4 words inside agentflow ids and values do not select
another parser. Common frontmatter, directives, and pre-header comment trivia
apply. The bare %% line already parses in Mermaid; non-directive percent-brace
lines use bare-percent-line-before-header as described below. [fixture:
agentflow/lex-detect-c4-component-id] [fixture:
agentflow/lex-detect-c4-container-label] [fixture:
agentflow/lex-detect-c4-dynamic-string] [fixture:
agentflow/lex-detect-c4-deployment-suffix] [fixture:
agentflow/directive-before-header] [fixture: agentflow/frontmatter-title]
[fixture: agentflow/comment-bare-percent-line] [fixture:
agentflow/comment-bare-before-spaces] [fixture:
agentflow/div-percent-braces-before-header] [fixture:
agentflow/div-percent-braces-after-directive-before-header]

## Lexical structure

Read the converted [diagram text](../common.md#reading-a-source), with common
line terminators, HTML attribute quotes, entities, directives, the selected
ignored semicolon, and the appended LF. Tree values retain written spelling.
Except for the replacements below, reuse the units, ordered contexts, and
first-matching-rule discipline of [flowchart](./flowchart.md#lexical-structure);
this reference supplies the shared rules rather than duplicating them. [fixture:
agentflow/lex-cr] [fixture: agentflow/lex-crlf] [fixture:
agentflow/lex-quoted-crlf] [fixture: agentflow/html-attribute-quotes] [fixture:
agentflow/directive-in-string] [fixture:
agentflow/lex-style-preprocessing-semicolon] [fixture: agentflow/header-only]

### Shared units and ordered contexts

Reuse the statement context in its existing order, the header context,
Unicode-letter ranges, strings and markdown strings, shape/property delimiters,
data and double-quoted data contexts, callback-name and callback-argument
contexts, and accessibility contexts. The label, slanted, ellipse, and click
contexts have the explicit changes below. All rules restart at every next
position of their context; a longer later match does not win. Any unmatched
character rejects. [fixture: agentflow/gram-bracket-shapes] [fixture:
agentflow/gram-props] [fixture: agentflow/lex-quoted-supplementary-label]
[fixture: agentflow/lex-supplementary-id] [fixture: agentflow/lex-combining-id]
[fixture: agentflow/lex-callback-args-u2028] [fixture:
agentflow/lex-data-string-u2029] [fixture: agentflow/lex-accdescr-block-u2028]

In the statement rule that recognizes the header, replace the flowchart header
alternatives by the one header-keyword agentflow-beta. In the following
container-keyword position, replace subgraph by flow, connector, and global. Old
graph, flowchart, and subgraph spellings can be ordinary id text; they are not
agentflow headers or containers. [fixture:
agentflow/lex-legacy-header-words-as-ids] [fixture:
agentflow/gram-removed-subgraph-keyword] [fixture:
agentflow/lex-flow-digit-suffix] [fixture: agentflow/lex-connector-digit-suffix]
[fixture: agentflow/lex-global-digit-suffix]

The end and global keyword units take only following ASCII spaces and tabs,
never LF or another whitespace character. Their boundary is the same ASCII word
boundary as the other bounded keywords. In particular, end does not absorb a
following line into a name, unlike flowchart. A later statement may follow end
on the same line. [fixture: agentflow/lex-global-tab-space] [fixture:
agentflow/lex-end-nbsp-with-following-node] [fixture:
agentflow/gram-flow-end-suffix] [fixture: agentflow/gram-flow-end-unicode]
[fixture: agentflow/lex-flow-name-end-does-not-take-newline] [fixture:
agentflow/gram-end-followed-by-vertex] [fixture:
agentflow/lex-global-nbsp-before-newline]

The final remaining-whitespace rule produces one space unit per character,
rather than flowchart's maximal run. The preceding newline rule still produces
one newline unit for a consecutive LF run. Consequently, a production requiring
one space takes exactly one such unit; this is not a rule that all whitespace
gaps accept arbitrary padding. [fixture:
agentflow/lex-style-double-space-keyword] [fixture:
agentflow/lex-class-double-space-keyword] [fixture:
agentflow/lex-class-double-space-value] [fixture:
agentflow/lex-classdef-double-space-keyword] [fixture:
agentflow/lex-linkstyle-double-space-keyword] [fixture:
agentflow/gram-callback-tooltip-double-space] [fixture:
agentflow/gram-pipe-label-two-spaces-after]

### Arrows

At the arrow position of the statement context, first try a solid closed arrow:
zero or more whitespace, two or more dashes, > or x, and zero or more
whitespace. It produces arrow and leaves a link-text context if one is active.
No leading x, o, or < marker is allowed. Next, two dashes with surrounding
whitespace produce opening-arrow and enter the one solid link-text context.
[fixture: agentflow/gram-three-edge-kinds] [fixture:
agentflow/gram-edge-extended-length] [fixture:
agentflow/gram-removed-prefix-cross] [fixture:
agentflow/gram-removed-prefix-circle] [fixture:
agentflow/gram-removed-prefix-left] [fixture:
agentflow/gram-split-sequence-label] [fixture:
agentflow/gram-split-failure-label] [fixture:
agentflow/lex-arrow-marker-letter-is-vertex] [fixture:
agentflow/lex-split-edge-third-dash-is-text] [fixture:
agentflow/lex-split-edge-cross-letter-in-text]

Then, only in statement context, surrounding whitespace and a dash, one or more
dots, and a dash produce a closed reference arrow. Both dashes are required. It
has no arrowhead suffix and enters no link-text context; a pipe label may follow
it. [fixture: agentflow/gram-reference-no-split] [fixture:
agentflow/gram-removed-dotted-arrow] [fixture:
agentflow/lex-reference-missing-leading-dash] [fixture:
agentflow/gram-reference-quoted-pipe-label] [fixture:
agentflow/gram-reference-followed-by-tag-opener] [fixture:
agentflow/gram-reference-newlines-around-arrow]

Remove the thick, dotted-arrow, and invisible operator families and their text
contexts. Remove their early invisible-operator rejection rules inside labels as
well: leading tildes are ordinary label content. In the remaining solid
link-text context, reuse flowchart's character/string order and stopping rule;
semicolons and line terminators are content until the closing arrow. [fixture:
agentflow/gram-removed-thick] [fixture: agentflow/gram-removed-thick-split]
[fixture: agentflow/gram-removed-dotted-split] [fixture:
agentflow/gram-removed-invisible] [fixture: agentflow/lex-label-leading-tildes]
[fixture: agentflow/lex-label-tildes-after-string] [fixture:
agentflow/lex-split-edge-semicolon-newline] [fixture:
agentflow/gram-split-edge-second-string-rejected] [fixture:
agentflow/gram-split-edge-string-bare-tail]

### Preserved comments and the default size limit

Follow common.md's
[comment-preservation size rule](../common.md#mermaidjs-and-this-specification).
With the default maxTextSize of 50000, measure the source after removing the
complete frontmatter trivia, including whitespace-only lines after the closing
--- line. Exclude directives and count CRLF as one UTF-16 code unit. [fixture:
agentflow/comment-default-size-equal-crlf] [fixture:
agentflow/comment-default-size-above-crlf] [fixture:
agentflow/comment-default-size-equal-inline-directive] [fixture:
agentflow/comment-default-size-above-inline-directive] [fixture:
agentflow/comment-default-size-equal-frontmatter] [fixture:
agentflow/comment-default-size-above-frontmatter] [fixture:
agentflow/frontmatter-extra-trivia-below] [fixture:
agentflow/frontmatter-extra-trivia-boundary] [fixture:
agentflow/frontmatter-extra-whitespace-line-boundary] [fixture:
agentflow/frontmatter-extra-trivia-above] If its length exceeds 50000, apply
common Step 5 comment-region removal and leading-whitespace removal. At or below
that limit, those removals do not apply to the diagram text: the rules below
receive comment lines and leading whitespace. [fixture:
agentflow/comment-default-size-fallback] [fixture:
agentflow/comment-default-size-equal] [fixture:
agentflow/comment-looking-string-default-size] [fixture:
agentflow/lex-comment-looking-quote-closes-string]

Read agentflow text with this default limit. Text configuration cannot change
this secure setting. [fixture: agentflow/config-secure-key-in-text]

In both size branches, apply agentflow's lexical rules to the remaining diagram
text; only common Step 5 comment-region and leading-whitespace removal depends
on the size. [fixture: agentflow/comment-default-size-fallback-inline-label]
[fixture: agentflow/comment-default-size-fallback-inline-statement]

Insert the statement comment rule immediately before id-run: zero or more ASCII
spaces/tabs, %% not followed by {, then the longest run without LF. It produces
a comment, excluding LF, whose marker is %% and whose value is the text after
it. The preceding spaces/tabs are trivia. U+2028 and U+2029 do not end this
diagram comment. [fixture: agentflow/comment-directive-in-body-u2029] [fixture:
agentflow/comment-open-directive-takes-lf] A comment can serve as a header or
statement separator. [fixture: agentflow/comment-node-spaced] [fixture:
agentflow/lex-comment-u2028] [fixture: agentflow/lex-comment-u2029] [fixture:
agentflow/comment-before-class-keeps-newline] [fixture:
agentflow/comment-after-shape-keeps-next-statement] [fixture:
agentflow/comment-header-separator-at-eof] [fixture:
agentflow/comment-keeps-following-empty-line]

A percent pair inside an already-started id-run is id content. In label context
insert a comment rule before its ordinary text-run rule; in slanted and ellipse
contexts try it before their closers. These label comment rules start at %% not
followed by { and read the longest run without LF; they do not take preceding
spaces or tabs. Those characters remain label content, including after a string
or slash unit and in an ellipse. Their LF is left for the next text unit, so a
label can continue on the next line. A closing shape delimiter on that comment
line is consumed as comment text, not as a closer. [fixture:
agentflow/comment-double-percent-inside-id] [fixture:
agentflow/comment-inside-square] [fixture: agentflow/comment-inside-trapezoid]
[fixture: agentflow/comment-inside-ellipse] [fixture:
agentflow/comment-label-keeps-interior-spaces] [fixture:
agentflow/lex-ellipse-comment-before-text] [fixture:
agentflow/comment-closing-shape-swallowed] [fixture:
agentflow/comment-square-after-string-padding] [fixture:
agentflow/comment-slanted-after-slash-padding] [fixture:
agentflow/comment-ellipse-space-padding] [fixture:
agentflow/comment-ellipse-tab-padding] [fixture:
agentflow/comment-ellipse-padding-crlf] [fixture:
agentflow/comment-ellipse-body-u2028] [fixture:
agentflow/comment-ellipse-body-u2029] [fixture:
agentflow/comment-square-after-string-directive-padding]

Strings, markdown strings, split link text, accessibility values, callback text,
and data have no diagram-comment rule. Their percent pairs and comment-looking
lines are content. A comment in the statement context does not bridge an
incomplete click statement to a callback on the next line. Common directives and
selected-semicolon rules still act inside preserved comment-looking content.
[fixture: agentflow/comment-quoted-label] [fixture:
agentflow/comment-markdown-label] [fixture: agentflow/comment-split-edge-label]
[fixture: agentflow/lex-accessibility-block-comment] [fixture:
agentflow/db-metadata-comment-directive-body] [fixture:
agentflow/lex-multiline-string-comment-directive] [fixture:
agentflow/comment-looking-string-after-empty-line] [fixture:
agentflow/div-data-percent-line-is-content] [fixture:
agentflow/comment-before-callback-does-not-join-lines] [fixture:
agentflow/lex-title-inline-percent-content] [fixture:
agentflow/db-acctitle-comment-next-line] [fixture:
agentflow/lex-flow-name-string-comment-content] [fixture:
agentflow/comment-malformed-label-not-read]

### Label and closing-brace differences

Preserve the pinned bare-percent distinction: a lone % rejects in an ordinary or
slanted bare label, including at the start or end of its text; strings and
ellipse labels accept it. A non-directive %%{ is not a label comment and rejects
there. NOTES.md's intended single-percent reading does not change these rules.
[fixture: agentflow/lex-single-percent-square] [fixture:
agentflow/lex-single-percent-trapezoid] [fixture:
agentflow/lex-single-percent-ellipse] [fixture:
agentflow/lex-text-percent-quoted] [fixture: agentflow/lex-percent-at-label-end]
[fixture: agentflow/lex-square-single-percent-unit] [fixture:
agentflow/lex-slanted-single-percent-unit] [fixture:
agentflow/lex-square-nondirective-percent-braces]

Reuse flowchart's slanted closer units, including ?] and =] only when reached at
a unit position. A slash text unit can expose them; an ordinary text run can
consume their ? or = and leave an unmatched ]. The ordinary statement id rules
reject A=B, as flowchart's published lexer does too. [fixture:
agentflow/lex-trap-close-question] [fixture: agentflow/lex-trap-close-equals]
[fixture: agentflow/lex-slanted-question-closer-after-slash] [fixture:
agentflow/lex-slanted-equals-closer-after-slash] [fixture:
agentflow/gram-bracket-shapes] [fixture: agentflow/lex-node-equals]

Replace flowchart's whitespace-after-brace conversion by this narrower rule:
after }, zero or more [line whitespace](../common.md#notation) characters
immediately followed by LF are read as that LF. This includes U+2028, U+2029,
vertical tab, form feed, and U+00A0. Without the following LF, this conversion
does not apply. Later blank lines remain separate. Apply it in every context,
with directives already excluded; node values retain the source whitespace
rather than the converted spelling. [fixture:
agentflow/spec-agentflow-blank-line-fold-47a9bd91] [fixture:
agentflow/gram-target-data-trailing-space] [fixture:
agentflow/gram-flow-heading-data-brace-whitespace] [fixture:
agentflow/lex-brace-string-keeps-blank-line] [fixture:
agentflow/lex-brace-line-whitespace-ls] [fixture:
agentflow/lex-brace-line-whitespace-ps] [fixture:
agentflow/lex-brace-line-whitespace-vt] [fixture:
agentflow/lex-brace-line-whitespace-ff] [fixture:
agentflow/lex-brace-line-whitespace-nbsp] [fixture:
agentflow/lex-brace-ls-without-lf] [fixture:
agentflow/gram-data-trailing-space-at-eof]

### Names, strings, and click text

Flow and connector names use the shared subgraph-name text vocabulary, with the
new keywords replacing the old container words. A click context can supply
click-id and click-comma text to a name; in this position they are text units,
not Identifier leaves. Retain the erased click as IgnoredText and end that name
fragment before the whitespace that only leaves the click context. That
whitespace is exactly one whitespace character, including tab, U+00A0, U+2028,
U+2029, or a normalized CRLF. It may be LF, so later physical-line text can
continue the name. Further ordinary whitespace remains in the next fragment.
[fixture: agentflow/lex-name-click-exit-tab] [fixture:
agentflow/lex-name-click-exit-nbsp] [fixture: agentflow/lex-name-click-exit-ls]
[fixture: agentflow/lex-name-click-exit-ps] [fixture:
agentflow/lex-name-click-exit-crlf] [fixture:
agentflow/lex-name-click-exit-extra-space] [fixture:
agentflow/lex-flow-name-click-state] [fixture:
agentflow/lex-connector-name-click-state] [fixture:
agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/lex-connector-name-click-mixed] [fixture:
agentflow/lex-flow-name-click-after-string] [fixture:
agentflow/lex-flow-name-click-fragment-comma]

Otherwise the click, callback, and string contexts retain flowchart's ordered
rules. In a URL or tooltip prefix only, retain an erased click without merging
another click-id group into the first. A recognized closed empty description
block or erased empty string, empty markdown string, or empty call may use the
same prefix fields, under the
[erased-form rules](#empty-description-blocks-and-erased-forms). [fixture:
agentflow/lex-empty-call-before-href] [fixture:
agentflow/lex-empty-string-before-url] [fixture:
agentflow/lex-empty-markdown-before-href] [fixture:
agentflow/lex-empty-string-before-url-tooltip] [fixture:
agentflow/lex-empty-call-before-url-tooltip] [fixture:
agentflow/lex-empty-markdown-before-callback-tooltip] [fixture:
agentflow/lex-mixed-empty-forms-before-url-tooltip] The lexical context changes
still occur; retaining the marker does not make all later click words
interchangeable. [fixture: agentflow/gram-click-erased-before-url] [fixture:
agentflow/gram-click-erased-before-url-tooltip] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-click-id-groups-not-merged] [fixture:
agentflow/gram-click-erased-after-href] [fixture:
agentflow/gram-empty-description-before-href]

Shared string rules allow line feeds, U+2028, and U+2029, have no
backslash-quote escape, and preserve their nested-context restrictions. Whole
empty strings and empty markdown strings are empty-string units, not values.
Data uses its own double-quote context: a backslash does not escape its quote; a
single quote does not protect a closing brace. A caret outside that
double-quoted context rejects. [fixture: agentflow/lex-quoted-u2028] [fixture:
agentflow/lex-quoted-u2029] [fixture: agentflow/lex-unclosed-string] [fixture:
agentflow/lex-unclosed-markdown] [fixture:
agentflow/lex-string-markdown-unescaped-quote] [fixture:
agentflow/lex-nested-markdown-one-content] [fixture:
agentflow/lex-url-nested-empty-string-rejected] [fixture:
agentflow/lex-nested-string-two-contents-rejected] [fixture:
agentflow/lex-data-block-single-quoted-brace] [fixture:
agentflow/lex-data-block-quoted-caret] [fixture:
agentflow/lex-data-backslash-quote-is-not-escape] [fixture:
agentflow/lex-data-block-caret]

### Directives and ignored semicolons inside units

Apply flowchart's
[Directives inside units](./flowchart.md#directives-inside-units), with Name
parts replacing subgraph-name. Ids, id-list parts, edge ids, click ids of a
click statement, interpolation names, and both shape-property operands are name
units. Keywords and numbers are atomic when they serve as structural units, as
are arrows and compound delimiters. A directive or selected ignored semicolon
strictly inside one of them rejects; a complete-unit boundary or surrounding
whitespace does not. [fixture: agentflow/div-directive-in-id] [fixture:
agentflow/div-directive-in-arrow] [fixture:
agentflow/div-directive-in-linkstyle-number] [fixture:
agentflow/div-directive-in-props-field] [fixture:
agentflow/div-directive-in-style-separator] [fixture:
agentflow/div-ignored-semicolon-in-id] [fixture:
agentflow/div-ignored-semicolon-in-arrow] [fixture:
agentflow/lex-directive-in-pipe-boundary] [fixture:
agentflow/lex-ignored-semicolon-in-pipe-boundary]

Label, string, callback, accessibility, style, data-interior, direction-text,
and Name-fragment units are text or string units and may contain those trivia.
In particular, a metadata key is opaque data text, not an Identifier. A selected
ignored semicolon in a written name remains common trivia. If the joined input
is already rejected by Mermaid, the boundary rule creates no divergence mark.
[fixture: agentflow/lex-directive-in-classdef-value] [fixture:
agentflow/lex-directive-in-linkstyle-value] [fixture:
agentflow/lex-directive-in-metadata-key] [fixture:
agentflow/lex-ignored-semicolon-in-metadata-key] [fixture:
agentflow/directive-in-data] [fixture: agentflow/directive-in-callback-args]
[fixture: agentflow/lex-directive-in-flow-name-text] [fixture:
agentflow/lex-ignored-semicolon-in-flow-name-text] [fixture:
agentflow/lex-directive-joins-invalid-linkstyle-index]

Within Name fragments, even keyword-shaped or numeric name pieces are text, not
structural keyword or NumericLiteral positions. A directive inside them is
allowed. [fixture: agentflow/lex-directive-in-name-keyword-text] [fixture:
agentflow/lex-directive-in-name-number-text]

## Grammar

Use the notation and end-of-text position of [common.md](../common.md#notation),
over the units above. The [flowchart grammar](./flowchart.md#grammar) supplies
the identical productions named below; replace their node types by the Agentflow
node types in this table. There are no Flowchart-prefixed nodes in an agentflow
tree.

| Rule                                 | Node                                   |
| ------------------------------------ | -------------------------------------- |
| `diagram`                            | AgentflowDiagram                       |
| `empty-statement`                    | AgentflowEmptyStatement                |
| `flow-statement`                     | AgentflowFlowStatement                 |
| `global-statement`                   | AgentflowGlobalStatement               |
| `connector-statement`                | AgentflowConnectorStatement            |
| `flow-name`                          | AgentflowName                          |
| `vertex-statement`                   | AgentflowVertexStatement               |
| `vertex-group`                       | AgentflowVertexGroup                   |
| `vertex`                             | AgentflowVertex                        |
| `shape`                              | AgentflowShape; AgentflowShapeProperty |
| `link`                               | AgentflowLink                          |
| `arrow`                              | AgentflowArrow                         |
| `opening-arrow`                      | AgentflowOpeningArrow                  |
| `label, link-text, name fragment`    | AgentflowLabel                         |
| `data block`                         | AgentflowDataBlock                     |
| `retained name/click/direction text` | AgentflowIgnoredText                   |
| `style-statement`                    | AgentflowStyleStatement                |
| `class-def-statement`                | AgentflowClassDefStatement             |
| `class-statement`                    | AgentflowClassStatement                |
| `numbered link-style-statement`      | AgentflowLinkStyleStatement            |
| `default link-style-statement`       | AgentflowDefaultLinkStyleStatement     |
| `callback click-statement`           | AgentflowClickCallbackStatement        |
| `URL click-statement`                | AgentflowClickUrlStatement             |
| `direction-statement`                | AgentflowDirectionStatement            |
| `title-statement`                    | AgentflowAccTitleStatement             |
| `description-statement`              | AgentflowAccDescrStatement             |
| `description-block-statement`        | AgentflowAccDescrBlockStatement        |

The shared leaves remain Identifier for ids and bare callback/interpolation
names, StringLiteral for click URLs/tooltips, and NumericLiteral for linkStyle
indices. Styles, names after call, arguments, and accessibility values use
AgentflowLiteral; punctuation and keywords are units, not invented leaf values.
[fixture: agentflow/gram-id-numbers-unicode] [fixture:
agentflow/db-callback-token-punctuation] [fixture:
agentflow/gram-click-link-forms] [fixture:
agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/gram-click-callback-space-args]

### Diagram and statements

```text
diagram                     = leading-unit* header line*
leading-unit                = space | newline | comment
header                      = header-keyword ( no-direction | header-direction first-separator )
first-separator             = ";" | newline | space+ newline | comment
line                        = statement | empty-statement | newline | space | comment
statement                   = vertex-statement statement-end
                            | style-statement statement-end
                            | class-def-statement statement-end
                            | class-statement statement-end
                            | link-style-statement statement-end
                            | click-statement statement-end
                            | connector-statement
                            | flow-statement
                            | global-statement
                            | direction-statement
                            | title-statement
                            | description-statement
                            | description-block-statement
empty-statement             = ";"
statement-end               = separator
separator                   = newline | ";" | end-of-text | comment
```

Header directions and no-direction use
[the flowchart header context](./flowchart.md#the-header-context), with
agentflow-beta as header-keyword. A direction on the next line is a vertex. A
direction on the header line needs first-separator; space before a semicolon
does not satisfy it. A comment may supply first-separator even when the source
has no following line break. [fixture: agentflow/header-lf] [fixture:
agentflow/header-only] [fixture: agentflow/header-br] [fixture:
agentflow/header-left-symbol] [fixture: agentflow/header-up-symbol] [fixture:
agentflow/header-down-symbol] [fixture:
agentflow/lex-header-direction-empty-line] [fixture:
agentflow/header-no-direction-semicolon] [fixture:
agentflow/lex-header-space-then-semicolon] [fixture:
agentflow/comment-header-separator-at-eof]

Reuse flowchart's separated-statement and EmptyStatement rules, adding comment
as a separator. A separator belongs to no statement. A further semicolon is an
EmptyStatement; blank lines and comment-only lines create no statement. Each
statement's trailing-space restriction remains its own, including the
distinction between a bare newline and a comment that consumes preceding ASCII
spaces. [fixture: agentflow/gram-class-double-semicolon] [fixture:
agentflow/gram-data-double-semicolon] [fixture:
agentflow/gram-tail-node-semicolons] [fixture: agentflow/header-empty-document]
[fixture: agentflow/gram-bare-string-statement-rejected] [fixture:
agentflow/gram-connector-title-space-before-comment] [fixture:
agentflow/gram-connector-title-space-before-newline] [fixture:
agentflow/comment-keeps-following-empty-line]

### Flows, globals, connectors, and names

```text
flow-statement      = "flow" ( space flow-name ( "[" label "]" )? data? )?
                      statement-end line* "end"
global-statement    = "global" statement-end line* "end"
connector-statement = "connector" space flow-name ( "[" label "]" )? data? statement-end
flow-name           = ( string | markdown-string | name-piece ) name-piece*
name-piece          = number | id-run | letter | space | "-" | "&" | ":" | "*" | "#"
                    | "v" | "^" | "style" | "linkStyle" | "classDef" | "class"
                    | header-keyword | "flow" | "connector" | "global" | "end"
                    | click-id | click-comma
```

A flow may omit its entire name heading; a connector requires a name. The one
space after flow or connector is a grammar gap, so a second written space can be
a name piece, but a lone space followed by newline supplies no name. A global
permits neither name, title, nor data. All bodies may be empty and may contain
nested flows and globals; connectors have no body. [fixture:
agentflow/gram-flow-all-forms] [fixture: agentflow/gram-flow-empty] [fixture:
agentflow/gram-connector-all-forms] [fixture: agentflow/gram-global-empty]
[fixture: agentflow/gram-global-data] [fixture: agentflow/gram-global-label]
[fixture: agentflow/gram-flow-nested] [fixture: agentflow/gram-global-nested]
[fixture: agentflow/gram-flow-name-whitespace-only] [fixture:
agentflow/gram-connector-name-whitespace-only] [fixture:
agentflow/gram-global-in-global] [fixture: agentflow/gram-flow-inside-global]
[fixture: agentflow/gram-global-name-rejected] [fixture:
agentflow/gram-flow-one-space-no-name] [fixture:
agentflow/gram-connector-one-space-no-name]

A bracket title follows the name; spaces before its [ are name whitespace, while
an ordinary space after ] before a bare newline is not accepted. A comment
separator can consume the latter spaces. Heading data follows the name or title
immediately and consists of adjacent complete blocks. An unnamed flow cannot
have heading data. A bounded lower-case end closes a flow/global; it is not a
generic end-of-line. [fixture: agentflow/gram-flow-inline-data] [fixture:
agentflow/gram-flow-bare-inline-data] [fixture:
agentflow/gram-connector-all-forms] [fixture: agentflow/gram-flow-open]
[fixture: agentflow/gram-flow-end-suffix] [fixture:
agentflow/gram-flow-heading-data-brace-whitespace] [fixture:
agentflow/gram-flow-heading-adjacent-data] [fixture:
agentflow/gram-flow-name-space-before-title] [fixture:
agentflow/gram-flow-title-space-before-newline] [fixture:
agentflow/gram-connector-title-space-before-comment] [fixture:
agentflow/gram-connector-title-space-before-newline] [fixture:
agentflow/gram-unnamed-flow-heading-data-rejected] [fixture:
agentflow/gram-end-followed-by-vertex]

Name productions retain ordinary written whitespace, including the ends read as
name pieces and quoted padding. The initial form may be string or markdown,
followed only by name pieces; it cannot start a second ordinary string after
bare text. default is not a name-piece alternative. A colon is ordinary name
punctuation. The source opening-arrow alternative does not complete a valid name
through the active link-text context and does not broaden this grammar.
[fixture: agentflow/gram-flow-name-text-followed-string] [fixture:
agentflow/gram-flow-name-string-followed-text] [fixture:
agentflow/lex-unquoted-keyword-names] [fixture:
agentflow/lex-unquoted-rare-keyword-names] [fixture:
agentflow/gram-flow-name-double-space] [fixture:
agentflow/gram-flow-name-string-bare-tail] [fixture:
agentflow/gram-connector-name-string-bare-tail] [fixture:
agentflow/gram-flow-name-default-rejected] [fixture:
agentflow/lex-flow-name-start-link] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/lex-name-token-punctuation]

While reading a name, read through recognized erased click markers, closed empty
description blocks, and erased empty strings, empty markdown strings, and empty
calls without treating them as ordinary name characters. [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-string-in-connector-name] [fixture:
agentflow/lex-empty-call-in-connector-name] Keep them as IgnoredText parts, with
surrounding ordinary text in Label parts. The click marker still enters its
context, and its click-id/click-comma units count as name text here; the
context-exit whitespace is outside those fragments. Do not allow an additional
initial-string alternative merely because parts were split. [fixture:
agentflow/gram-empty-form-does-not-restart-name-string] An erased click can
precede the initial string or markdown fragment, follow an initial markdown
fragment, or recur after a context exit. A closed empty description block after
that exit remains an IgnoredText part before further name text. This defines
AgentflowName rather than a normalized single label. [fixture:
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
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-flow-name-space-between-empty-blocks] [fixture:
agentflow/lex-empty-description-in-connector-name] [fixture:
agentflow/lex-flow-name-click-fragment-comma]

A diagram comment ends a bare name heading; it is not another name fragment. A
string name can contain a comment-looking line because the string context reads
it as content. A directive or selected ignored semicolon inside name text is
allowed as common trivia. [fixture: agentflow/comment-ends-flow-heading]
[fixture: agentflow/lex-flow-name-string-comment-content] [fixture:
agentflow/comment-after-unicode-flow-name] [fixture:
agentflow/lex-directive-in-flow-name-text] [fixture:
agentflow/lex-ignored-semicolon-in-flow-name-text]

A Name needs at least one Label fragment, even if it is whitespace. An empty
block may precede its initial bare/string fragment and is retained as
IgnoredText; it does not create another initial-string alternative. An empty
block alone after the required one-space gap does not supply a name. [fixture:
agentflow/gram-empty-description-before-flow-name] [fixture:
agentflow/gram-empty-description-before-connector-string] [fixture:
agentflow/gram-empty-description-no-flow-name]

A click context in a name may recognize an empty string or empty markdown string
without contributing a Label fragment. Retain the click and empty form as
separate AgentflowIgnoredText parts. The required Label may come later, as in
flow click "" A, or already precede click, as in connector F click "". An empty
call may follow the empty string after the context exit, before later name text.
[fixture: agentflow/lex-name-click-empty-string-before-text] [fixture:
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

### Vertices, shapes, and labels

Reuse the productions and sentences of
[Vertex statements](./flowchart.md#vertex-statements),
[Shapes](./flowchart.md#shapes), and [Labels](./flowchart.md#labels), with the
lexical replacements above and the Agentflow nodes. Vertex groups require
whitespace on both sides of &; ids, shapes, ::: classes, and data suffixes
cannot be separated by whitespace. A bare id, a shaped id, a class suffix, and
repeated occurrences all retain their written structure. [fixture:
agentflow/gram-bare-node] [fixture: agentflow/gram-group-spaces] [fixture:
agentflow/gram-group-unspaced] [fixture: agentflow/gram-group-data] [fixture:
agentflow/gram-style-suffix] [fixture: agentflow/gram-style-suffix-twice]
[fixture: agentflow/gram-node-three-definitions] [fixture:
agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props]

The full shape names in the flowchart table are syntax names here as well; they
are not Agentflow's domain metadata aliases. A property rectangle has two
Identifier operands. Label kind records its initial text/string/markdown form,
followed only by bare continuation. A label needs nonempty lexical content: a
whole empty string does not satisfy it, but whitespace content does. [fixture:
agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props] [fixture:
agentflow/gram-node-empty-label] [fixture: agentflow/gram-node-empty-string]
[fixture: agentflow/gram-node-empty-markdown] [fixture:
agentflow/lex-edge-empty-string-label] [fixture:
agentflow/lex-edge-empty-markdown-label] [fixture:
agentflow/gram-url-tooltip-whitespace-only] [fixture:
agentflow/gram-label-whitespace-only] [fixture:
agentflow/gram-split-edge-string-bare-tail]

### The three link kinds

Reuse [Links](./flowchart.md#links), including its pipe-label and split-label
productions, edge-id placement, and Label construction, with only the operator
vocabulary defined above. Sequence and failure links may use -- text followed by
--> or --x; reference links cannot use split text but may have a pipe label.
Preserve written dash/dot counts, ids, and labels without semantic or layout
fields. [fixture: agentflow/gram-three-edge-kinds] [fixture:
agentflow/gram-split-sequence-label] [fixture:
agentflow/gram-split-failure-label] [fixture:
agentflow/gram-split-reference-label] [fixture: agentflow/gram-edge-id]
[fixture: agentflow/gram-split-edge-id] [fixture:
agentflow/gram-reference-edge-id] [fixture: agentflow/gram-edge-extended-length]
[fixture: agentflow/db-edge-length-cap] [fixture:
agentflow/gram-reference-quoted-pipe-label] [fixture:
agentflow/gram-reference-newlines-around-arrow]

A pipe label can have one following space unit, not two. In split text only the
initial string alternative is permitted: a bare continuation after it is
allowed, another string is not. A marker-looking x after a complete arrow is an
id character, not a start marker of the next arrow. [fixture:
agentflow/gram-pipe-labels] [fixture:
agentflow/gram-pipe-label-two-spaces-after] [fixture:
agentflow/gram-split-edge-second-string-rejected] [fixture:
agentflow/gram-split-edge-string-bare-tail] [fixture:
agentflow/lex-arrow-marker-letter-is-vertex] [fixture:
agentflow/lex-split-edge-cross-letter-in-text]

### Metadata blocks

Reuse [Data blocks](./flowchart.md#data-blocks) and the vertex data production:
one or more complete adjacent @{ ... } blocks. An attachment belongs to its
written vertex occurrence or explicit flow/connector heading. Every block is one
AgentflowDataBlock, even when adjacent contents are combined by Mermaid. Empty,
multiline, scalar, mapping, prototype-key, and alias content remains opaque; it
is not a list of AST properties. [fixture: agentflow/db-data-block-routing]
[fixture: agentflow/db-data-block-adjacent] [fixture:
agentflow/db-data-block-empty-multiline] [fixture:
agentflow/db-data-block-recursive-prototype-keys] [fixture:
agentflow/gram-flow-inline-data] [fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-data-null-document] [fixture:
agentflow/gram-data-adjacent-multiline-blocks]

Content-only YAML/shape/type rejections are accepted under embedded-data-opaque.
This includes malformed combined content and recursive aliases; no YAML alias
resolver belongs to the syntax tree. An unclosed block, an unprotected brace, or
a caret outside the data double-quote context remains a syntax rejection.
[fixture: agentflow/db-data-block-invalid-yaml] [fixture:
agentflow/db-data-block-unknown-shape] [fixture:
agentflow/db-metadata-yaml-shared-alias] [fixture:
agentflow/div-metadata-yaml-self-alias] [fixture:
agentflow/db-metadata-adjacent-no-comma] [fixture:
agentflow/lex-data-block-unclosed] [fixture: agentflow/lex-data-block-caret]
[fixture: agentflow/div-data-percent-line-is-content] [fixture:
agentflow/lex-data-block-single-quoted-brace] [fixture:
agentflow/lex-data-block-quoted-caret] [fixture:
agentflow/lex-data-backslash-quote-is-not-escape]

### Style, classDef, class, and linkStyle

Reuse
[Style, class, and link style statements](./flowchart.md#style-class-and-link-style-statements),
including id-list, styles, style, name, and numbered/default alternatives. Each
required space is one Agentflow space unit. Id-list holes, including empty ends,
are null; the style target id, class suffix, and class statement's second id
remain single Identifiers even with commas. [fixture:
agentflow/gram-classdef-multi] [fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-style-suffix] [fixture:
agentflow/gram-linkstyle-default] [fixture:
agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/gram-linkstyle-interpolate-default] [fixture:
agentflow/lex-style-double-space-keyword] [fixture:
agentflow/lex-class-double-space-value] [fixture:
agentflow/gram-classdef-trailing-empty-name] [fixture:
agentflow/gram-class-target-empty-ends] [fixture:
agentflow/lex-default-is-valid-id] [fixture:
agentflow/lex-interpolate-is-reserved-at-unit-start]

A style needs at least one permitted unit; whitespace-only styles are null,
including after the final comma. A comma immediately after a backslash remains
in a classDef style value only, while the grammar still requires a following
style unit. Ordinary style/linkStyle commas separate items. Whitespace after a
comma belongs to the following written literal; trailing padding does not. In
style, classDef, and linkStyle, beyond the required one-space gap, leading
whitespace of the first style is also style content. [fixture:
agentflow/db-node-style-first-leading-spaces] [fixture:
agentflow/db-classdef-first-leading-spaces] [fixture:
agentflow/db-node-style-first-leading-tab] [fixture:
agentflow/db-classdef-first-leading-tab] [fixture:
agentflow/db-node-style-tab-gaps-leading-tab] [fixture:
agentflow/db-classdef-tab-gaps-leading-tab] [fixture:
agentflow/db-style-leading-whitespace] The gaps before a class value or an
interpolation name remain exactly one space unit. [fixture:
agentflow/lex-class-double-space-value] [fixture:
agentflow/gram-class-semicolon] [fixture:
agentflow/lex-linkstyle-interpolate-double-space] [fixture:
agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/gram-style-whitespace-only] [fixture:
agentflow/gram-classdef-escaped-comma] [fixture:
agentflow/gram-style-whitespace-after-comma] [fixture:
agentflow/gram-classdef-escaped-comma-whitespace-tail] [fixture:
agentflow/gram-style-backslash-before-comma]

The optional space after an interpolation name must be followed by styles; it is
not optional trailing padding. Empty description blocks retain the surrounding
space units separately, so a whitespace-only style can follow such a block
without joining those units. [fixture:
agentflow/lex-linkstyle-interpolate-double-space] [fixture:
agentflow/lex-linkstyle-three-semis] [fixture:
agentflow/gram-empty-description-splits-interpolate-spaces]

### Click, call, and href

Reuse the click/callback lexical rules and
[Click statements](./flowchart.md#click-statements), except for flowchart's
reserved-click rejection and the prefix fields below. Click ids are divided at
click-comma units and may have null empty ends. An id-looking arrow, keyword, or
bracket spelling is still a click id in that context, not a vertex statement.
Without following whitespace, call and href are ordinary id text. [fixture:
agentflow/gram-click-callback-forms] [fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/gram-click-punctuation-id] [fixture:
agentflow/gram-click-id-empty-ends] [fixture:
agentflow/lex-click-before-semicolon-is-id] [fixture:
agentflow/db-callback-token-punctuation] [fixture:
agentflow/lex-call-hyphen-without-whitespace] [fixture:
agentflow/lex-href-hyphen-without-whitespace]

A callback after call has an opaque name through its opening parenthesis and
optional opaque arguments. Preserve name padding and argument padding. The name
retains LF, CRLF, U+2028, and U+2029 as written. [fixture:
agentflow/lex-callback-name-lf] [fixture: agentflow/lex-callback-name-crlf]
[fixture: agentflow/lex-callback-name-u2028] [fixture:
agentflow/lex-callback-name-u2029] If its first parentheses are empty, a second
call with nonempty arguments can supply the arguments. Bare callbacks use the
shared name production. A URL may have href, then a tooltip and one of _self,
_blank, _parent, or _top. URLs and tooltips are nonempty string syntax,
including strings containing only whitespace. [fixture:
agentflow/gram-click-callback-space-args] [fixture:
agentflow/db-call-name-space-before-parentheses] [fixture:
agentflow/gram-click-callback-blank-args] [fixture:
agentflow/gram-click-bare-link-target] [fixture:
agentflow/gram-click-bare-link-tip-target] [fixture:
agentflow/gram-callback-arguments-after-second-call] [fixture:
agentflow/gram-url-tooltip-whitespace-only]

Before a URL, including on either side of href, or before a tooltip, the
existing lexical context can erase click without adding a click-id group. Read
that erased keyword through the ordinary click production, retaining it in
textBeforeUrl or textBeforeTooltip. Retain a closed empty description block or
recognized erased empty string, empty markdown string, or empty call there in
the same way. [fixture: agentflow/lex-empty-call-before-href] [fixture:
agentflow/lex-empty-string-before-url] [fixture:
agentflow/lex-empty-markdown-before-href] [fixture:
agentflow/lex-empty-string-before-url-tooltip] [fixture:
agentflow/lex-empty-call-before-url-tooltip] [fixture:
agentflow/lex-empty-markdown-before-callback-tooltip] [fixture:
agentflow/lex-mixed-empty-forms-before-url-tooltip] These lists are not a rule
to skip arbitrary words, nor to merge two click-id groups; a callback name has
no textBeforeCallback field. [fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-url-tooltip] [fixture:
agentflow/gram-click-erased-before-callback-tooltip] [fixture:
agentflow/gram-click-erased-after-href] [fixture:
agentflow/gram-empty-description-before-href] [fixture:
agentflow/gram-click-id-groups-not-merged] [fixture:
agentflow/div-empty-string-before-callback]

Required tooltip/target gaps still use one space unit. A second ordinary space
is not absorbed by that gap. Terminal empty description blocks are following
statements, with the statement's own trailing-space restrictions. [fixture:
agentflow/lex-click-double-space-before-tooltip] [fixture:
agentflow/gram-callback-tooltip-double-space] [fixture:
agentflow/gram-empty-description-after-url-glued] [fixture:
agentflow/gram-empty-description-after-url-space]

A closed empty block before a URL or callback tooltip uses textBeforeTooltip.
Before a bare callback name or before a fixed link target, no corresponding
prefix field exists; those interior blocks are tokenless-empty-forms, rather
than arbitrarily assigned to a tooltip field. [fixture:
agentflow/gram-empty-description-before-url-tooltip] [fixture:
agentflow/gram-empty-description-before-callback-tooltip] [fixture:
agentflow/div-empty-description-before-callback-name] [fixture:
agentflow/div-empty-description-before-link-target]

### Direction and accessibility statements

Reuse the direction-line rule and
[Direction and accessibility statements](./flowchart.md#direction-and-accessibility-statements).
Direction families are tried in the order TB, BT, RL, LR, TD; within the
selected family the last matching direction keyword is used. Prefix/suffix text
becomes IgnoredText even when it resembles an unfinished shape or link.
Whitespace between direction and its value can include LF. [fixture:
agentflow/lex-direction-line-greedy] [fixture: agentflow/lex-direction-after-ls]
[fixture: agentflow/lex-direction-after-ps] [fixture:
agentflow/lex-direction-value-priority] [fixture:
agentflow/lex-direction-last-selected-occurrence] [fixture:
agentflow/lex-direction-swallows-shape-and-edge] [fixture:
agentflow/gram-direction-value-next-line] [fixture:
agentflow/lex-direction-unclosed-bracket-prefix]

Earlier lexical rules retain priority: column-zero accTitle/accDescr consumes
its line as accessibility text, while indentation can expose the greedy
direction rule first. These statements need no separator. A title/line
description reads the rest of its value line, including semicolons and percent
pairs; whitespace before its value can take the next physical line. A missing
value at EOF is null. [fixture: agentflow/lex-direction-title-column-zero]
[fixture: agentflow/lex-direction-title-indented] [fixture:
agentflow/lex-direction-description-column-zero] [fixture:
agentflow/lex-direction-description-indented] [fixture:
agentflow/lex-accessibility-semicolon-value] [fixture:
agentflow/db-acctitle-next-line] [fixture: agentflow/db-accdescr-next-line]
[fixture: agentflow/lex-title-inline-percent-content] [fixture:
agentflow/db-acctitle-comment-next-line] [fixture: agentflow/db-acctitle-eof]

A description block reads every character other than its closing brace,
including LF, U+2028, U+2029, and preserved comment-looking text. Its opening
delimiter consumes following whitespace. The block can be unclosed at EOF;
retain its text and closed false. [fixture:
agentflow/gram-accdescr-open-trailing-spaces-eof] [fixture:
agentflow/gram-accdescr-open-crlf-eof] [fixture:
agentflow/gram-accdescr-open-directive-eof] [fixture:
agentflow/gram-accdescr-open-text-directive-eof] [fixture:
agentflow/gram-accdescr-open-text-spaces-eof] [fixture:
agentflow/frontmatter-accdescr-open-trailing-spaces-eof] A closed block without
content has null value and closed true. [fixture:
agentflow/lex-accdescr-block-u2028] [fixture:
agentflow/lex-accdescr-block-u2029] [fixture:
agentflow/lex-accessibility-block-comment] [fixture:
agentflow/db-accessibility-unclosed-block] [fixture:
agentflow/db-accessibility-empty-unclosed] [fixture:
agentflow/db-accessibility-empty-block]

### Empty description blocks and erased forms

Reuse flowchart's
[terminal empty-description rules](./flowchart.md#empty-description-blocks-before-a-separator)
for separated statements, including the separate space units around a block. At
statement start a closed empty block is its own statement, also before another
same-line statement. After a completed statement and before its separator it is
a following statement, not part of that statement's value. [fixture:
agentflow/lex-empty-description-before-node] [fixture:
agentflow/gram-empty-description-after-vertex] [fixture:
agentflow/gram-empty-description-after-data] [fixture:
agentflow/gram-empty-description-after-data-space-semicolon] [fixture:
agentflow/gram-empty-description-after-class-space] [fixture:
agentflow/gram-empty-description-after-url-glued] [fixture:
agentflow/gram-empty-description-after-url-space] [fixture:
agentflow/gram-empty-description-splits-interpolate-spaces] [fixture:
agentflow/gram-empty-description-after-class-glued]

After the header direction such blocks are the first diagram statements; after
an explicit flow title or a global heading, the first body statements; after a
connector title, following statements. In a flow/connector name they are Name
parts instead. In an existing click-prefix field they are IgnoredText. Before a
header direction or within another structural gap without a retained field they
are not accepted. [fixture:
agentflow/gram-empty-description-after-header-direction] [fixture:
agentflow/gram-empty-description-header-no-direction] [fixture:
agentflow/gram-empty-description-after-flow-name] [fixture:
agentflow/gram-empty-description-before-flow-title] [fixture:
agentflow/gram-empty-description-after-connector-name] [fixture:
agentflow/gram-empty-description-after-global] [fixture:
agentflow/gram-empty-description-after-flow-title] [fixture:
agentflow/gram-empty-description-after-connector-title] [fixture:
agentflow/gram-empty-description-before-href] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-empty-description-symbol-header-semicolon] [fixture:
agentflow/gram-empty-description-global-semicolon] [fixture:
agentflow/gram-flow-name-space-between-empty-blocks] [fixture:
agentflow/lex-empty-description-in-connector-name]

An empty block splitting a vertex Identifier, before a required class name,
before the first style, or before a style comma has no such place. It would
require splitting a leaf or adding an arbitrary gap field, so reject it as
tokenless-empty-forms when Mermaid accepts it. A terminal block after a complete
class value is retained; the presence of ordinary space can instead make both
grammars reject. [fixture: agentflow/div-empty-description-in-classdef]
[fixture: agentflow/div-empty-description-in-style] [fixture:
agentflow/div-empty-description-before-arrow] [fixture:
agentflow/div-empty-description-before-style-comma] [fixture:
agentflow/div-empty-description-inside-vertex-id] [fixture:
agentflow/div-empty-description-before-class-name] [fixture:
agentflow/gram-empty-description-after-class-glued] [fixture:
agentflow/gram-empty-description-after-class-space]

Whole erased empty strings, empty markdown strings, and empty calls at statement
start are rejected under the explicit agentflow exception of
tokenless-empty-forms; no IgnoredStatement is introduced for them. [fixture:
agentflow/div-empty-string-statement] [fixture:
agentflow/div-empty-markdown-statement] [fixture:
agentflow/div-empty-call-statement] [fixture:
agentflow/div-empty-string-before-vertex] [fixture:
agentflow/div-empty-call-before-vertex]

At other positions, recognized erased empty forms are accepted wherever an
existing field holds them: AgentflowName.parts in flow/connector names,
textBeforeUrl before a following click URL, and textBeforeTooltip before a
following URL or callback tooltip. Hold each as a separate AgentflowIgnoredText
with its full written spelling, like an erased click or closed empty description
block at that position. A prefix field still requires the following URL or
tooltip. [fixture: agentflow/lex-empty-string-in-flow-name] [fixture:
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
agentflow/lex-mixed-empty-forms-before-url-tooltip]

Only a form recognized at a unit position uses that rule. Quotes within an
already-started ordinary name unit remain name text. [fixture:
agentflow/lex-empty-quote-spelling-inside-name-unit]

Elsewhere, without a retained field, reject a recognized erased empty form under
tokenless-empty-forms reason 1; this includes an empty form before an arrow or
callback name and between the header and its direction. A field before a URL
does not create one before a callback name. [fixture:
agentflow/div-empty-string-before-arrow] [fixture:
agentflow/div-empty-call-before-arrow] [fixture:
agentflow/div-empty-string-before-callback] [fixture:
agentflow/div-empty-string-after-click] [fixture:
agentflow/div-empty-string-between-header-and-direction]

An empty data block is not one of these erased forms, and whitespace-only string
syntax is not empty. [fixture: agentflow/gram-data-null-document] [fixture:
agentflow/gram-url-tooltip-whitespace-only]

### Rejections outside the grammar

Reuse flowchart's canonical linkStyle index condition: each index is a
nonnegative integer written without leading zeros and identifies an edge already
created at that statement. Count chain/group edges and edges inside flows in
source order. The configured maxEdges limit also decides acceptance: reject when
the number of edges exceeds it. [fixture:
agentflow/gram-linkstyle-style-out-of-bounds] [fixture:
agentflow/gram-linkstyle-interpolate-out-of-bounds] [fixture:
agentflow/lex-linkstyle-leading-zero] [fixture:
agentflow/lex-linkstyle-over-safe-integer] [fixture:
agentflow/config-max-edges-equal] [fixture: agentflow/config-max-edges-exceeded]
[fixture: agentflow/config-max-edges-group] [fixture:
agentflow/lex-directive-joins-invalid-linkstyle-index] [fixture:
agentflow/gram-linkstyle-interpolate-index]

Reuse the flowchart hasOwnProperty member condition for each flow, before
membership filtering. A vertex chain contributes its groups from last to first,
and each group contributes ids in written order. A named nested flow or
connector contributes its name as read by the grammar, trimmed. An unnamed
nested flow contributes a nonempty value other than hasOwnProperty; its
generated spelling is irrelevant to this rejection and is not an AST field. A
nonempty accessibility value contributes its trimmed text, and an extra
semicolon its own text. [fixture: agentflow/gram-nested-unnamed-flow] [fixture:
agentflow/gram-flow-named-member-hasownproperty] [fixture:
agentflow/gram-connector-member-hasownproperty] [fixture:
agentflow/gram-flow-hasownproperty-before-empty-statement] Direction, global,
style/class/linkStyle, click, and comment entries contribute no member. If
hasOwnProperty is followed by any other nonempty candidate member, reject.
[fixture: agentflow/lex-flow-prototype-members] [fixture:
agentflow/lex-flow-hasownproperty-member] [fixture:
agentflow/lex-accessibility-scope] [fixture:
agentflow/gram-accessibility-hasownproperty-member] [fixture:
agentflow/gram-hasownproperty-last-member]

That rejection is not a general reservation of prototype-related ids. Do not
reject duplicate ids, unresolved connectorRef, missing inputs, reference labels,
containment cycles, or known-but-removed bracket/render shapes. Embedded-content
validation is handled only by the opaque-data divergence, not by these
outside-grammar conditions. [fixture: agentflow/gram-prototype-ids] [fixture:
agentflow/db-flow-three-definitions] [fixture:
agentflow/db-diagnostics-no-semantic-checks] [fixture:
agentflow/db-diagnostics-containment-cycle] [fixture:
agentflow/db-data-block-removed-shape] [fixture:
agentflow/db-data-block-unsupported-shape] [fixture:
agentflow/gram-reference-quoted-pipe-label]

## Known divergences

The six applicable identifiers are defined in
[known-divergences.md](../known-divergences.md). First retain written text
wherever the tree has a place; only then apply a listed rejection. The following
scopes do not import flowchart's entire divergence list. [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/div-directive-in-id]

[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md):
An atomic keyword, Identifier, number, arrow, or compound delimiter cannot
retain an internal directive without changing its whole-unit definition. Reject
those reconstructed accepted forms under reason 2. Name/text/string/data
placements remain accepted; already-rejected joined forms receive no mark.
[fixture: agentflow/div-directive-in-header] [fixture:
agentflow/div-directive-in-beta-header] [fixture: agentflow/div-directive-in-id]
[fixture: agentflow/div-directive-in-circle-opening] [fixture:
agentflow/lex-directive-in-flow-name-text] [fixture:
agentflow/lex-directive-joins-invalid-linkstyle-index]

[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md):
Apply the same whole-unit obstacle to a selected ignored semicolon inside an
atom, under reason 2. An EmptyStatement cannot hold a character inside that
atom. Text and opaque metadata keys remain accepted. [fixture:
agentflow/div-ignored-semicolon-in-id] [fixture:
agentflow/div-ignored-semicolon-in-arrow] [fixture:
agentflow/lex-ignored-semicolon-in-metadata-key] [fixture:
agentflow/lex-ignored-semicolon-in-flow-name-text]

[embedded-data-opaque](../known-divergences/embedded-data-opaque.md): The tree
holds the complete embedded spelling and does not validate its contents. Accept
Mermaid's content-only rejections under the reverse criterion: that validation
is unnecessary to build the tree. Syntax delimiters remain required. [fixture:
agentflow/db-data-block-invalid-yaml] [fixture:
agentflow/db-data-block-unknown-shape] [fixture:
agentflow/db-metadata-yaml-shared-alias] [fixture:
agentflow/div-metadata-yaml-self-alias] [fixture:
agentflow/div-data-percent-line-is-content] [fixture:
agentflow/lex-data-block-unclosed]

[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md): Use
the common body-only HTML scope. A node can retain the text but cannot express a
tag changing body quote roles across frontmatter under that scope. The existing
reason-2 direct rule applies in both directions, including acceptance of Mermaid
rejections caused by its pipeline ordering. [fixture:
agentflow/div-frontmatter-tag-enables-label] [fixture:
agentflow/html-label-without-frontmatter-tag] [fixture:
agentflow/div-frontmatter-tag-changes-title] [fixture:
agentflow/div-frontmatter-attribute-blocks-body-tag] [fixture:
agentflow/html-body-tag-reference]

[bare-percent-line-before-header](../known-divergences/bare-percent-line-before-header.md):
The Comment record can hold a non-directive percent-brace line before the
header. Accept it under the existing reverse pipeline-order criterion: detection
skips it while Mermaid's preserving lexer rejects it. A bare %% line is already
accepted and has no mark. [fixture: agentflow/comment-bare-before-spaces]
[fixture: agentflow/div-percent-braces-before-header] [fixture:
agentflow/div-percent-braces-after-directive-before-header] [fixture:
agentflow/div-comment-header-percent-brace]

[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md): Reject
erased empty strings/markdown/calls at statement start under the explicit
exception, and interior erased forms or empty description blocks without a
retained field under reason 1. Recognized erased empty forms in Name.parts or
click textBeforeUrl/textBeforeTooltip stay accepted as IgnoredText. [fixture:
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
agentflow/lex-mixed-empty-forms-before-url-tooltip] Standalone and terminal
description blocks, Name parts, and existing click-prefix placements stay
accepted because nodes hold them. [fixture:
agentflow/div-empty-string-statement] [fixture:
agentflow/div-empty-call-statement] [fixture:
agentflow/div-empty-description-before-style-comma] [fixture:
agentflow/div-empty-description-inside-vertex-id] [fixture:
agentflow/gram-empty-description-after-vertex] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-empty-description-before-href]

Do not apply click-reserved-word: Name parts and click-prefix fields retain the
measured ignored text. Do not apply comment-takes-line-break or
comment-takes-character: comments stop before LF and take no preceding
character. Do not apply c4-keyword-anywhere or
blank-line-after-header-or-comments: detection precedes C4, and ordinary blank
lines remain valid. [fixture: agentflow/gram-click-erased-before-url] [fixture:
agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/comment-before-class-keeps-newline] [fixture:
agentflow/comment-double-percent-inside-id] [fixture:
agentflow/lex-detect-c4-component-id] [fixture:
agentflow/comment-keeps-following-empty-line]

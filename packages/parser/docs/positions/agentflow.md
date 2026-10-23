# Agentflow positions

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

This document supplements [positions.md](../positions.md) for the nodes of
[ast/agentflow.md](../../../spec/docs/ast/agentflow.md); token boundaries are
defined in [tokens/agentflow.md](../tokens/agentflow.md).

## Ranges

The diagram runs from its header keyword through its last diagram token,
including a final separator semicolon; comments, directives, and ignored
semicolons beyond that token do not extend it, except when its final unclosed
description statement reaches source EOF. The diagram then includes the
statement's full range. Root covers the whole source. [fixture:
agentflow/header-only] [fixture: agentflow/header-empty-document] [fixture:
agentflow/gram-tail-node-semicolons] [fixture: agentflow/gram-tail-edge-comment]
[fixture: agentflow/gram-tail-edge-directive] [fixture:
agentflow/lex-style-preprocessing-semicolon]

An EmptyStatement covers its one semicolon; a separator semicolon belongs to no
statement. [fixture: agentflow/gram-class-double-semicolon] [fixture:
agentflow/gram-data-double-semicolon]

Flow and Global statements end at their closing end keyword, excluding its
padding. A Connector ends at its final name, title delimiter, or heading data
block, without its separator. [fixture: agentflow/gram-flow-all-forms] [fixture:
agentflow/gram-global] [fixture: agentflow/lex-global-tab-space] [fixture:
agentflow/gram-connector-all-forms] [fixture:
agentflow/gram-connector-name-whitespace-only] [fixture:
agentflow/db-connector-empty-id-data]

Each written heading remains a separate statement, including repeated
connectors, repeated flows, and unnamed flows. [fixture:
agentflow/db-connector-repeated-without-title] [fixture:
agentflow/db-flow-repeat-before-unnamed]

A Name spans its first through last part, including the source gaps between
parts; every Label fragment retains the whitespace that the name production
reads, including padding before a bracket title. A click-context exit lies
outside its fragments, within the Name range only when another part follows.
[fixture: agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/lex-connector-name-click-state] [fixture:
agentflow/gram-flow-name-space-before-title] [fixture:
agentflow/gram-flow-name-whitespace-only] [fixture:
agentflow/lex-name-click-exit-extra-space] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/name-click-exit-before-title-tab] [fixture:
agentflow/name-click-exit-before-title-lf] [fixture:
agentflow/name-click-exit-before-title-ls] [fixture:
agentflow/name-click-exit-before-data-tab] [fixture:
agentflow/name-click-exit-before-separator-space] [fixture:
agentflow/name-heading-title-interior-padding]

A click and a recognized empty string or empty markdown string after it have
separate IgnoredText ranges. The required Label may follow them or precede the
click; empty forms do not extend that Label. [fixture:
agentflow/lex-name-click-empty-string-before-text] [fixture:
agentflow/lex-name-click-empty-markdown-before-text] [fixture:
agentflow/lex-name-click-empty-string-before-string] [fixture:
agentflow/lex-name-click-empty-string-then-call] [fixture:
agentflow/lex-connector-name-click-empty-string-tail]

In a connector name, text adjacent to an erased empty string or empty markdown
string starts its own Label immediately after the IgnoredText range. Consecutive
empty string and empty markdown string forms have separate IgnoredText ranges.
The Name includes the Label, even when it begins or ends with a semicolon or is
the only contributing Label. [fixture:
agentflow/lex-connector-name-click-empty-string-adjacent-text] [fixture:
agentflow/lex-connector-name-click-empty-string-adjacent-semicolon] [fixture:
agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]

A Vertex spans its id through its last shape, class suffix, or data block;
VertexGroup and VertexStatement extend through their last vertex or target
group. A Shape includes both complete delimiters; a ShapeProperty spans its
name, colon, and value, excluding its surrounding bars. [fixture:
agentflow/gram-style-suffix] [fixture: agentflow/gram-group-data] [fixture:
agentflow/gram-edge-chain] [fixture: agentflow/gram-bracket-shapes] [fixture:
agentflow/gram-props]

A Link starts at its edge id or first arrow and ends at its target group. Arrows
and OpeningArrows cover their characters without surrounding whitespace; a split
label precedes the closing arrow even though arrow is visited first. [fixture:
agentflow/gram-reference-edge-id] [fixture: agentflow/gram-edge-id] [fixture:
agentflow/gram-split-edge-id] [fixture:
agentflow/gram-reference-newlines-around-arrow] [fixture:
agentflow/gram-split-sequence-label]

A Label includes its initial string delimiters, when present, and subsequent
bare continuation, excluding outer bare padding; an all-whitespace label covers
its whitespace token. Comments within bare label text are within its range but
outside its value and tokens. [fixture: agentflow/gram-node-quoted-padding]
[fixture: agentflow/gram-split-edge-string-bare-tail] [fixture:
agentflow/gram-label-whitespace-only] [fixture:
agentflow/comment-label-keeps-interior-spaces] [fixture:
agentflow/comment-square-after-string-padding]

DataBlock covers one complete @{ through }, with no separate value range; its
interior keeps its written whitespace, including the whitespace whose reading is
folded after a brace. [fixture: agentflow/db-data-block-empty-multiline]
[fixture: agentflow/gram-data-adjacent-multiline-blocks] [fixture:
agentflow/lex-brace-string-keeps-blank-line] [fixture:
agentflow/db-connector-empty-id-data] [fixture:
agentflow/div-data-percent-line-is-content] [fixture:
agentflow/div-metadata-yaml-self-alias]

Style, ClassDef, numbered LinkStyle, and DefaultLinkStyle statements end at
their last non-padding unit: a sole null style leaves the range ending at the
target id, class-name list, index, or default keyword, respectively, and a
terminal null style after a comma ends at that comma. Literals retain leading
style whitespace but exclude trailing style padding. [fixture:
agentflow/gram-style-all-null] [fixture: agentflow/gram-classdef-all-null]
[fixture: agentflow/gram-linkstyle-all-null] [fixture:
agentflow/gram-default-linkstyle-all-null] [fixture:
agentflow/gram-classdef-trailing-null-style] [fixture:
agentflow/gram-linkstyle-trailing-null-style] [fixture:
agentflow/gram-default-linkstyle-trailing-null-style] [fixture:
agentflow/db-node-style-first-leading-spaces] [fixture:
agentflow/gram-style-null-before-comment-nbsp]

A Class statement ends at its second Identifier. A click statement starts at its
first click keyword and ends at its final callback unit, URL, tooltip, or
target; its retained prefixes are children at their written positions. Callback
Literals keep name padding before ( and argument padding inside the parentheses.
[fixture: agentflow/gram-class-semicolon] [fixture:
agentflow/gram-click-callback-forms] [fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip] [fixture:
agentflow/db-call-name-space-before-parentheses] [fixture:
agentflow/gram-click-callback-space-args]

Line terminators within the callback name remain inside its Literal range, with
CRLF kept as written. [fixture: agentflow/lex-callback-name-lf] [fixture:
agentflow/lex-callback-name-crlf] [fixture: agentflow/lex-callback-name-u2028]
[fixture: agentflow/lex-callback-name-u2029]

IgnoredText spans one retained erased form, or the trimmed direction prefix or
suffix; its delimiters and internal whitespace remain inside it. A Direction
statement spans its whole non-padding line, including a line break between the
keyword and value. [fixture: agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/lex-direction-swallows-shape-and-edge] [fixture:
agentflow/gram-direction-value-next-line]

A directive inside a retained description block lies within the IgnoredText
range while cutting its RawText tokens, which keep the padding on both sides.
[fixture: agentflow/lex-directive-in-name-empty-block-padding]

AccTitle and line AccDescr end at the colon when the value is null, otherwise at
their last value character. A closed description block includes its closing
brace; an unclosed block ends at its final source character, and a closed empty
block remains a separate statement wherever the grammar assigns it one. An
unclosed block and its containing diagram end at source EOF even when the tail
is whitespace, CRLF, or a directive; skipped trivia receives no invented token.
[fixture: agentflow/gram-accdescr-open-trailing-spaces-eof] [fixture:
agentflow/gram-accdescr-open-crlf-eof] [fixture:
agentflow/gram-accdescr-open-directive-eof] [fixture:
agentflow/gram-accdescr-open-text-directive-eof] [fixture:
agentflow/gram-accdescr-open-text-spaces-eof] [fixture:
agentflow/frontmatter-accdescr-open-trailing-spaces-eof] [fixture:
agentflow/db-acctitle-eof] [fixture: agentflow/db-accdescr-eof] [fixture:
agentflow/db-acctitle-next-line] [fixture:
agentflow/db-accessibility-unclosed-block] [fixture:
agentflow/db-accessibility-empty-unclosed] [fixture:
agentflow/db-accessibility-empty-block] [fixture:
agentflow/gram-empty-description-after-header-direction] [fixture:
agentflow/gram-empty-description-after-flow-title] [fixture:
agentflow/gram-empty-description-after-connector-title] [fixture:
agentflow/gram-empty-description-after-global]

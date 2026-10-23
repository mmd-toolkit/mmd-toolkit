# Agentflow tokens

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

This document defines the tokens of `agentflow`; its nodes are defined in
[ast/agentflow.md](../../../spec/docs/ast/agentflow.md), and shared token rules
are in [tokens.md](../tokens.md).

## Tokens

Each grammatical item receives the kind below; whitespace alone is trivia except
where a written value retains it. [fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-label-whitespace-only] [fixture:
agentflow/gram-flow-name-whitespace-only]

| Kind         | Grammatical items                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | Header and header direction; structural flow, connector, global, end, style, classDef, class, linkStyle, interpolate, default, click, call, href, direction, direction value, link target, accTitle, and accDescr.                                                             |
| `Identifier` | Vertex ids, class suffixes, id-list parts, click-id parts, edge ids, interpolation and bare callback names, and each shape-property operand.                                                                                                                                   |
| `Numeric`    | Each linkStyle index.                                                                                                                                                                                                                                                          |
| `String`     | Each nonempty string or markdown-string unit.                                                                                                                                                                                                                                  |
| `RawText`    | Labels, Name fragments, retained ignored forms, styles, callback names after call and their arguments, accessibility values, and data interiors.                                                                                                                               |
| `Punctuator` | Each shape opening and closing delimiter, arrow or opening arrow, property colon and bar, label bar, group ampersand, class marker, list comma, click comma, separator semicolon, edge-id @, data opener and closer, accessibility colon and braces, and callback parentheses. |

[fixture: agentflow/db-all-fields] [fixture: agentflow/gram-props] [fixture:
agentflow/gram-classdef-multi] [fixture: agentflow/gram-click-id-empty-ends]
[fixture: agentflow/gram-reference-edge-id] [fixture:
agentflow/gram-split-edge-id] [fixture: agentflow/gram-global] [fixture:
agentflow/gram-flow-all-forms] [fixture:
agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/gram-linkstyle-default] [fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-click-callback-forms] [fixture:
agentflow/db-flow-repeat-before-unnamed] [fixture:
agentflow/db-connector-repeated-without-title]

An id or list part is one Identifier item even when it contains several units;
commas separating list parts have their own Punctuator items, with no token for
a null part. [fixture: agentflow/gram-id-numbers-unicode] [fixture:
agentflow/gram-class-target-empty-ends] [fixture:
agentflow/gram-classdef-trailing-empty-name] [fixture:
agentflow/gram-click-id-empty-ends]

The opening delimiters of a shape together form one Punctuator item, as do its
closing delimiters, including the two units of a circle or hexagon delimiter.
[fixture: agentflow/gram-bracket-shapes] [fixture:
agentflow/div-directive-in-circle-opening] [fixture:
agentflow/div-directive-in-hexagon-closing]

A token is a maximal consecutive run of one item's units; its ends exclude
whitespace except where the value retains it, as detailed below. Directives and
selected ignored semicolons cut RawText and String tokens under the shared
rules; cut strings use StringFragment tokens, and cuts inside other kinds
reject. [fixture: agentflow/directive-in-string] [fixture:
agentflow/directive-in-data] [fixture:
agentflow/lex-directive-in-classdef-value] [fixture:
agentflow/lex-style-preprocessing-semicolon] [fixture:
agentflow/div-directive-in-id] [fixture:
agentflow/div-ignored-semicolon-in-arrow]

A label's text after its initial string retains leading interior whitespace;
bare label padding is excluded, and an all-whitespace label has a RawText token
of that whitespace. [fixture: agentflow/gram-node-quoted-padding] [fixture:
agentflow/gram-split-edge-string-bare-tail] [fixture:
agentflow/gram-label-whitespace-only] [fixture:
agentflow/lex-edge-whitespace-label]

Name fragments retain all whitespace read by the name production, including
whitespace-only fragments and padding before an explicit title. Each erased
click, empty description block, empty string, empty markdown string, or empty
call retained in a Name or click-prefix field is its own RawText item, including
its full delimiters. [fixture: agentflow/gram-flow-name-space-before-title]
[fixture: agentflow/gram-flow-name-whitespace-only] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/lex-empty-description-in-flow-name] [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-empty-markdown-in-flow-name] [fixture:
agentflow/lex-empty-call-in-connector-name] [fixture:
agentflow/lex-mixed-empty-forms-before-url-tooltip] [fixture:
agentflow/db-connector-empty-id-data] [fixture:
agentflow/lex-directive-in-name-empty-block-padding]

A recognized empty string or empty markdown string after click is an IgnoredText
item and supplies no Label or String token. Its later initial fragment may still
be quoted, and an earlier Label may supply the whole name. [fixture:
agentflow/lex-name-click-empty-string-before-text] [fixture:
agentflow/lex-name-click-empty-markdown-before-text] [fixture:
agentflow/lex-name-click-empty-string-before-string] [fixture:
agentflow/lex-name-click-empty-string-then-call] [fixture:
agentflow/lex-connector-name-click-empty-string-tail]

In a connector name, text directly after an erased empty string or empty
markdown string after click is a separate Label fragment and RawText item. An
empty string immediately followed by an empty markdown string retains two
separate RawText items. A leading or trailing semicolon in the text stays
RawText, including when the fragment supplies the name's only Label. Flow names
still reject adjacent bare text after either empty form. [fixture:
agentflow/lex-connector-name-click-empty-string-adjacent-text] [fixture:
agentflow/lex-connector-name-click-empty-string-adjacent-semicolon] [fixture:
agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/gram-name-click-empty-string-adjacent-text] [fixture:
agentflow/lex-connector-name-click-empty-markdown-adjacent-text] [fixture:
agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon] [fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]
[fixture: agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

The one whitespace character that leaves a click context belongs to no Name
fragment or token; further ordinary whitespace belongs to the following
fragment. [fixture: agentflow/lex-name-click-exit-tab] [fixture:
agentflow/lex-name-click-exit-nbsp] [fixture: agentflow/lex-name-click-exit-ls]
[fixture: agentflow/lex-name-click-exit-ps] [fixture:
agentflow/lex-name-click-exit-crlf] [fixture:
agentflow/lex-name-click-exit-extra-space]

Each style is one RawText item, keeping leading whitespace after its required
one-space gap or comma and excluding trailing padding; a whitespace-only style
is null and has no token. An escaped comma inside a classDef style remains in
that item. [fixture: agentflow/db-node-style-first-leading-spaces] [fixture:
agentflow/db-classdef-first-leading-tab] [fixture:
agentflow/gram-style-whitespace-after-comma] [fixture:
agentflow/gram-style-whitespace-only] [fixture:
agentflow/gram-classdef-escaped-comma] [fixture:
agentflow/gram-empty-description-splits-interpolate-spaces] [fixture:
agentflow/gram-style-null-before-comment-nbsp]

A callback name after call keeps padding before its opening parenthesis, and
nonempty arguments keep padding at both ends; call and parentheses belong to the
parent statement. [fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/gram-click-callback-space-args] [fixture:
agentflow/gram-callback-arguments-after-second-call]

Line terminators inside a callback name stay in its RawText item, including CRLF
as written. [fixture: agentflow/lex-callback-name-lf] [fixture:
agentflow/lex-callback-name-crlf] [fixture: agentflow/lex-callback-name-u2028]
[fixture: agentflow/lex-callback-name-u2029]

A data interior is one RawText item, including its quotes and whitespace at both
ends; adjacent blocks retain separate opener, interior, and closer items.
[fixture: agentflow/db-data-block-empty-multiline] [fixture:
agentflow/gram-data-adjacent-multiline-blocks] [fixture:
agentflow/gram-data-null-document] [fixture:
agentflow/db-connector-empty-id-data]

When common removal does not apply, a percent line or YAML alias in a data
interior remains RawText, with no Comment record for that line. [fixture:
agentflow/div-data-percent-line-is-content] [fixture:
agentflow/div-metadata-yaml-self-alias]

## Comments

The default size rule in the specification decides whether common comment-region
removal applies; at or below 50000 normalized UTF-16 code units after
frontmatter and directive removal, the diagram lexer receives comment lines and
leading whitespace. [fixture: agentflow/comment-default-size-equal] [fixture:
agentflow/comment-default-size-equal-crlf] [fixture:
agentflow/comment-default-size-equal-inline-directive] [fixture:
agentflow/comment-default-size-equal-frontmatter] [fixture:
agentflow/comment-default-size-above-crlf] [fixture:
agentflow/comment-default-size-above-inline-directive] [fixture:
agentflow/comment-default-size-above-frontmatter]

The excluded frontmatter includes its trailing trivia, such as empty or
whitespace-only lines after the closing delimiter; it contributes nothing to the
default-size count. Indentation on the first nonblank body line stays in the
measured body. [fixture: agentflow/frontmatter-extra-trivia-below] [fixture:
agentflow/frontmatter-extra-trivia-boundary] [fixture:
agentflow/frontmatter-extra-whitespace-line-boundary] [fixture:
agentflow/frontmatter-extra-trivia-above] [fixture:
agentflow/frontmatter-extra-trivia-indent-above]

Diagram comments are Comment records with mark %% and no tokens; their range
starts at the first percent and ends before LF, preserving their source content,
including directives inside the comment. Statement comments may consume
preceding ASCII spaces and tabs as trivia; label comments leave preceding
whitespace in label text. A percent pair inside an already-started id-run
remains id text. [fixture: agentflow/comment-node-spaced] [fixture:
agentflow/comment-directive-in-body-u2029] [fixture:
agentflow/comment-open-directive-takes-lf] [fixture:
agentflow/comment-double-percent-inside-id] [fixture:
agentflow/comment-square-after-string-padding] [fixture:
agentflow/comment-slanted-after-slash-padding] [fixture:
agentflow/comment-ellipse-tab-padding]

Statement comments consume ASCII padding even where the grammar requires a style
gap; a preceding U+00A0 remains style whitespace instead. [fixture:
agentflow/gram-style-null-before-comment] [fixture:
agentflow/gram-style-null-before-comment-nbsp]

A comment splits bare label text into separate RawText runs, preserving the
interior padding and LF that the label reads; comments and their text are
outside those tokens and the label value. Strings, link text, callback text,
accessibility values, and data instead retain comment-looking text as content
when common removal does not apply. [fixture:
agentflow/comment-label-keeps-interior-spaces] [fixture:
agentflow/comment-quoted-label] [fixture: agentflow/comment-markdown-label]
[fixture: agentflow/comment-split-edge-label] [fixture:
agentflow/lex-flow-name-string-comment-content] [fixture:
agentflow/lex-accessibility-block-comment] [fixture:
agentflow/db-metadata-comment-directive-body] [fixture:
agentflow/comment-before-callback-does-not-join-lines]

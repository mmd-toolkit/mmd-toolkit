# Usecase tokens

Japanese version: [usecase.ja.md](./usecase.ja.md)

This document defines the tokens of `usecase`; nodes are defined in
[ast/usecase.md](../../../spec/docs/ast/usecase.md), and the shared rules are in
[tokens.md](../tokens.md). The lexical order and contexts follow
[diagrams/usecase.md](../../../spec/docs/diagrams/usecase.md#lexical-structure),
whose source reference is
[`usecase.tokens.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts#L1-L410).

## Tokens

Each grammatical item has the following kind; a lexical Word or LabelText
category does not itself determine a token's kind. [fixture:
usecase/db-all-fields] [fixture: usecase/lex-keyword-labels] [fixture:
usecase/lex-keyword-style-word-category]

| Kind         | Grammatical items                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | Header, statement keywords, end, direction values, note's for, and semantic include/extend.                   |
| `Identifier` | Authored ids, raw JSON-prefix id, class names, native bare metadata keys/scalars, and CSS name words.         |
| `String`     | One plain/markdown label or one quoted native metadata key/value, including empty strings.                    |
| `RawText`    | One bare label, stereotype interior, CSS value, accessibility value, or opaque JSON interior.                 |
| `Punctuator` | Each shape delimiter, arrow half, @, brace, colon, comma, class separator, stereotype mark, or -- CSS prefix. |

The table's keyword and punctuation cases are held by [fixture:
usecase/db-direction-all], [fixture: usecase/gram-note-adjacent-string-label],
[fixture: usecase/db-semantic-case], [fixture: usecase/db-labeled-arrows],
[fixture: usecase/gram-actor-list], [fixture:
usecase/gram-native-trailing-comma-newline], and [fixture:
usecase/gram-styles-components].

Each ordinary id or class name is one Identifier item; the JSON-prefix id is an
Identifier even when its spelling is a keyword. [fixture:
usecase/gram-json-keyword-id] [fixture: usecase/gram-explicit-edge-id-control]
[fixture: usecase/gram-boundary-three-classes-types]

Native metadata uses separate key, colon and value items; bare true/false and
integer-looking words are Identifier items, whereas either quote style makes a
String item with its matching quotes and no escape decoding. [fixture:
usecase/lex-native-single-quoted-keys] [fixture:
usecase/lex-native-string-backslashes] [fixture:
usecase/lex-identifier-leading-zero-icon] [fixture:
usecase/gram-native-duplicate-business-same]

Native metadata commas are separate Punctuator items; line breaks are trivia.
[fixture: usecase/gram-metadata-property-comma-no-newline] [fixture:
usecase/gram-metadata-newline]

Count line breaks after the common comment-region and line-terminator rules.
Between the last property and `}`, the optional trailing comma and remaining
line breaks total at most two, with the comma allowed only before the line
breaks. [fixture: usecase/gram-metadata-property-comma-no-newline] [fixture:
usecase/gram-native-trailing-newline] [fixture:
usecase/gram-metadata-no-trailing-comma-two-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-three-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-four-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines] [fixture:
usecase/gram-edge-metadata-two-newlines] [fixture:
usecase/gram-edge-metadata-three-newlines] [fixture:
usecase/gram-metadata-trailing-comma-no-newline] [fixture:
usecase/gram-native-trailing-comma-newline] [fixture:
usecase/gram-metadata-trailing-comma-two-newlines] [fixture:
usecase/gram-metadata-trailing-comma-three-newlines] [fixture:
usecase/gram-native-trailing-newline-comma] [fixture:
usecase/gram-metadata-tail-newline-before-comma] [fixture:
usecase/gram-metadata-tail-newline-before-comma-newline]

A comma between properties permits zero or more remaining line breaks. [fixture:
usecase/gram-metadata-property-comma-no-newline] [fixture:
usecase/gram-metadata-property-comma-one-newline] [fixture:
usecase/gram-metadata-property-comma-two-newlines] [fixture:
usecase/gram-metadata-property-comma-three-newlines]

ASCII HWS does not change the count, and CRLF counts as one line break.
[fixture: usecase/gram-metadata-trailing-comma-one-newline-hws] [fixture:
usecase/gram-metadata-trailing-comma-two-newlines-hws] [fixture:
usecase/gram-metadata-property-comma-one-newline-hws] [fixture:
usecase/gram-metadata-property-comma-two-newlines-hws] [fixture:
usecase/gram-metadata-trailing-comma-one-newline-crlf] [fixture:
usecase/gram-metadata-trailing-comma-two-newlines-crlf] [fixture:
usecase/gram-metadata-trailing-comma-three-newlines-crlf] [fixture:
usecase/gram-metadata-property-comma-one-newline-crlf] [fixture:
usecase/gram-metadata-property-comma-two-newlines-crlf] [fixture:
usecase/gram-metadata-property-comma-three-newlines-crlf] [fixture:
usecase/gram-metadata-no-trailing-comma-two-crlf] [fixture:
usecase/gram-metadata-no-trailing-comma-three-crlf] [fixture:
usecase/gram-metadata-no-trailing-comma-two-whitespace-lines] [fixture:
usecase/gram-metadata-no-trailing-comma-whitespace-lines] [fixture:
usecase/gram-metadata-no-trailing-comma-two-tab-lines] [fixture:
usecase/gram-metadata-no-trailing-comma-tab-lines]

Common comment-region removal can reduce the number of line breaks; only the
breaks that remain are counted. [fixture:
usecase/gram-metadata-trailing-comma-comment-line] [fixture:
usecase/gram-metadata-trailing-comma-comment-line-blank-after] [fixture:
usecase/gram-metadata-property-comma-comment-line] [fixture:
usecase/gram-metadata-property-comma-comment-line-blank-after] [fixture:
usecase/gram-metadata-no-trailing-comma-comment-two-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-comment-three-newlines]

A bare label is one RawText item spanning its first through last unit, keeping
interior HWS; surrounding ASCII HWS is trivia, but Unicode whitespace read as
label content stays in its token. [fixture: usecase/lex-label-unquoted-hws-trim]
[fixture: usecase/lex-label-unicode-whitespace-only] [fixture:
usecase/lex-label-u2028] [fixture: usecase/lex-label-u2029]

Plain and markdown labels are one String item with their delimiters; their
interior padding and original line terminators remain written text. [fixture:
usecase/gram-empty-actor-label] [fixture: usecase/gram-label-quoted-padding]
[fixture: usecase/lex-plain-u2028] [fixture: usecase/lex-markdown-crlf]
[fixture: usecase/lex-markdown-earliest-close]

Each CSS property-name word is an atomic Identifier item; a markerless dash
prefix is a separate Punctuator, and HWS between that prefix and the word
belongs to no token. The UsecaseIdentifier still retains that HWS. [fixture:
usecase/lex-class-property-custom-gap] [fixture:
usecase/lex-class-property-long-custom] [fixture:
usecase/lex-css-name-custom-tab] [fixture:
usecase/gram-css-name-comment-region-lf] [fixture:
usecase/gram-css-name-comment-region-ls]

A CSS value is one RawText item, including leading HWS after its colon and any
quoted components, excluding trailing skipped HWS; a separating comma is its own
Punctuator, while a quoted comma or escaped comma stays in the value. [fixture:
usecase/lex-css-property-padding] [fixture:
usecase/lex-style-quoted-value-and-comma] [fixture:
usecase/gram-styles-components] [fixture:
usecase/gram-css-empty-string-component] [fixture:
usecase/gram-style-json-prefix-in-string-control] [fixture:
usecase/gram-style-json-prefix-css-word-control] [fixture:
usecase/gram-style-json-prefix-identifier-control]

Accessibility keyword and colon/braces are separate items; the complete nonempty
value is RawText, including whitespace-only values, with no value token for
exactly empty content. Stereotype marks are separate Punctuators around one
RawText item retaining all interior padding. [fixture:
usecase/gram-a11y-line-raw-padding] [fixture:
usecase/gram-a11y-block-raw-padding] [fixture:
usecase/gram-a11y-whitespace-block] [fixture: usecase/db-acctitle-empty]
[fixture: usecase/db-accdescr-empty] [fixture:
usecase/gram-stereotype-trimmed-conflict]

A JSON table has separate Keyword json, Identifier id, Punctuator @ and opening
brace items, one RawText item for a nonempty complete object interior, and a
closing-brace Punctuator; HWS between @ and the brace is trivia. [fixture:
usecase/gram-json-spaced-at] [fixture: usecase/gram-json-empty] [fixture:
usecase/db-json-values] [fixture: usecase/div-json-balanced-invalid-array]

Directives, comment regions and selected semicolons cut RawText and String items
under the shared rules; cut strings use StringFragment, and cuts inside atomic
items reject. A directive or selected semicolon in the HWS of a CSS name or
between complete JSON-prefix components stays trivia. [fixture:
usecase/directive-in-label] [fixture: usecase/directive-in-stereotype] [fixture:
usecase/directive-in-json] [fixture:
usecase/lex-native-single-quote-comment-region-ls] [fixture:
usecase/lex-style-hash-semicolon] [fixture: usecase/div-directive-css-property]
[fixture: usecase/div-semicolon-css-property-selected] [fixture:
usecase/lex-directive-css-name-gap] [fixture:
usecase/lex-semicolon-css-name-gap] [fixture:
usecase/lex-semicolon-classdef-css-name-gap] [fixture:
usecase/lex-directive-whole-json-prefix-boundary] [fixture:
usecase/lex-directive-native-quoted-key] [fixture: usecase/gram-json-comment]
[fixture: usecase/lex-semicolon-css-number-text] [fixture:
usecase/lex-style-trigger-metadata-icon] [fixture:
usecase/lex-directive-between-json-id] [fixture:
usecase/lex-directive-in-json-declaration-at]

## Comments and trivia

Default-context ASCII spaces/tabs and physical line endings receive no tokens;
line endings inside markdown strings or JSON interiors stay in their value
items. [fixture: usecase/lex-tab-blank-line] [fixture:
usecase/lex-statements-crlf] [fixture: usecase/lex-markdown-crlf] [fixture:
usecase/gram-json-spaced-at]

Native %% comments at an ASCII-HWS-only line start are Comment records, from
first percent through the character before LF; their mark is %%, their value
excludes that mark, and they have no tokens. Common comment-region rules still
apply in all contexts, while inline %% is content where the grammar accepts it.
[fixture: usecase/comment-bare-pair] [fixture: usecase/comment-bare-eof]
[fixture: usecase/comment-u2028] [fixture: usecase/comment-u2029] [fixture:
usecase/comment-unquoted] [fixture: usecase/comment-quoted] [fixture:
usecase/gram-json-comment] [fixture:
usecase/lex-comment-region-inside-stereotype]

# Wardley tokens

Japanese version: [wardley.ja.md](./wardley.ja.md)

Tokens follow the specification's
[ordered units](../../../spec/docs/diagrams/wardley.md#ordered-units): the first
complete matching rule wins, including the minus punctuation's explicit longer
alternatives. Composite forms split at authored component boundaries. [fixture:
wardley/keywords-all-glued] [fixture: wardley/db-link-forms] [fixture:
wardley/directive-coordinate-parts] [fixture:
wardley/directive-flow-before-label]

## Tokens

| Kind         | Items                                                                                                      | Fixtures                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | Header, command words, strategies and inertia.                                                             | [fixture: wardley/db-all-fields] [fixture: wardley/db-inertia-forms]                                                                                 |
| `Identifier` | An id-name, held by WardleyIdentifier.                                                                     | [fixture: wardley/db-id-underscore]                                                                                                                  |
| `RawText`    | Spaced-name, common values, semicolon-label content and whole hidden forms.                                | [fixture: wardley/db-unquoted-names] [fixture: wardley/common-repeat-empty] [fixture: wardley/db-link-forms] [fixture: wardley/hidden-all-unit-gaps] |
| `Numeric`    | Each unsigned integer or decimal.                                                                          | [fixture: wardley/db-all-fields] [fixture: wardley/db-number-overflow]                                                                               |
| `String`     | A whole quoted name, text or flow label, including its quotes.                                             | [fixture: wardley/db-empty-texts] [fixture: wardley/lex-string-conversion] [fixture: wardley/lex-link-flow-raw-escapes]                              |
| `Punctuator` | Each bracket, comma, @, slash, parenthesis, minus, arrow glyph, port, flow plus/marker or label semicolon. | [fixture: wardley/db-all-fields] [fixture: wardley/db-link-forms] [fixture: wardley/hidden-all-unit-gaps]                                            |

A flow has separate Punctuator plus, String label and Punctuator marker items;
the bidirectional marker and each whole port or dependency glyph are atomic.
Coordinate brackets, numbers and commas, and offset signs and magnitudes, are
separate items. Each common metadata keyword is separate from its colon, brace
or title separator. Ordinary whitespace or native forms cannot split a composite
flow or metadata unit. [fixture: wardley/directive-flow-before-label] [fixture:
wardley/directive-flow-after-label] [fixture:
wardley/directive-coordinate-parts] [fixture: wardley/directive-offset-sign]
[fixture: wardley/directive-common-colon] [fixture:
wardley/common-block-directive-gap] [fixture:
wardley/lex-link-native-flow-components] [fixture:
wardley/lex-native-common-keyword-colon]

Spaced-name tokens keep internal space/tab and omit outer padding. Line common
values keep all content after title's one separator or the accessibility colon;
whitespace-only content has a token, absent content does not. Block values trim
only outer common whitespace; empty blocks have no value token. A semicolon
label keeps all remaining physical-line content, including whitespace-only
content. [fixture: wardley/db-unquoted-names] [fixture:
wardley/lex-name-trailing-space] [fixture: wardley/common-title-tabs] [fixture:
wardley/common-title-two-spaces] [fixture: wardley/common-empty-literals]
[fixture: wardley/common-line-whitespace] [fixture:
wardley/common-block-whitespace] [fixture: wardley/tail-link-spaced-label]
[fixture: wardley/line-link-label-values]

A whole hidden form is one RawText item through its qualifying closer, excluding
preceding padding and its consumed final LF. Earlier strings, flow labels,
semicolon labels and common values own their enclosed native-looking text.
[fixture: wardley/lex-hidden-directive-cr] [fixture: wardley/lex-hidden-yaml-cr]
[fixture: wardley/hidden-yaml-adjacent-later] [fixture:
wardley/hidden-directive-string] [fixture: wardley/hidden-yaml-string] [fixture:
wardley/line-every-text] [fixture: wardley/lex-hidden-directive-multiline-label]
[fixture: wardley/hidden-yaml-block]

Shared removals cut RawText and String items, producing StringFragment tokens
for string pieces. Cuts inside fixed words, id-names, numbers and indivisible
glyphs reject; cuts at complete component boundaries remain trivia. Source
quotes, escapes, digits and line endings remain written in token values.
[fixture: wardley/directive-every-field] [fixture: wardley/style-every-text]
[fixture: wardley/common-block-comment] [fixture: wardley/directive-id-inside]
[fixture: wardley/directive-keyword-middle] [fixture: wardley/directive-number]
[fixture: wardley/directive-port-inside] [fixture:
wardley/directive-flow-marker-inside] [fixture:
wardley/lex-selected-decimal-inside] [fixture: wardley/line-string-values]

## Comments and trivia

Native padding is ASCII space/tab. Visible LF, the appended unwritten LF and
title's first separator have no tokens. Native percent-pair comments stop before
physical EOL; passed bare lines and their accompanying trivia are not read
again, including between retained forms. [fixture: wardley/space-tabs] [fixture:
wardley/space-lines] [fixture: wardley/common-title-tabs] [fixture:
wardley/comment-eof] [fixture: wardley/comment-native-triple] [fixture:
wardley/detect-retained-secondscan-bare-ascii] [fixture:
wardley/retained-directive-between-bares] [fixture: wardley/bare-line-ls]

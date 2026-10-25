# Radar tokens

Japanese version: [radar.ja.md](./radar.ja.md)

Tokens follow the specification's
[ordered rules](../../../spec/docs/diagrams/radar.md#ordered-rules), taking the
first complete match. Composite forms split at authored component boundaries.
[fixture: radar/gram-written-tree] [fixture: radar/lex-id-keyword-prefix]
[fixture: radar/gram-directive-composite-header]

## Tokens

| Kind         | Items                                                 | Fixtures                                                                                                              |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | Header, statement words, boolean and graticule words. | [fixture: radar/gram-written-tree] [fixture: radar/db-options-repeat]                                                 |
| `Identifier` | Axis and curve names, named entry references.         | [fixture: radar/gram-written-tree] [fixture: radar/lex-bare-accessibility-ids]                                        |
| `Numeric`    | Entry values and numeric option values.               | [fixture: radar/gram-written-tree] [fixture: radar/db-number-leading-zero-decimal]                                    |
| `String`     | Quoted labels, including their matching quotes.       | [fixture: radar/db-empty-labels] [fixture: radar/lex-string-conversion]                                               |
| `Punctuator` | Each colon, comma, bracket and brace.                 | [fixture: radar/gram-written-tree] [fixture: radar/gram-detailed-colon-mixed-spelling]                                |
| `RawText`    | Common values and complete native hidden forms.       | [fixture: radar/common-repeat-empty] [fixture: radar/lex-hidden-yaml-two-nonempty] [fixture: radar/hidden-native-eof] |

All three headers use a Keyword item for radar-beta; a written colon is a
separate Punctuator item. Joined and separated spellings add no header node.
[fixture: radar/header-colon-inline] [fixture: radar/header-separated-colon]
[fixture: radar/spec-radar-test-ts-f0c0291e]

A Numeric item retains every written digit and dot, even when double conversion
rounds, underflows or overflows. A label's String item retains authored quote
and escape spelling, including empty labels and physical line endings. [fixture:
radar/db-number-rounded] [fixture: radar/db-number-subnormal] [fixture:
radar/db-number-underflow] [fixture: radar/db-number-overflow] [fixture:
radar/db-option-overflow] [fixture: radar/db-empty-labels] [fixture:
radar/lex-string-conversion] [fixture: radar/line-cr-values]

Line common values keep all padding after title's one ASCII separator or the
accessibility colon. Empty content has no value token; whitespace-only line
content has one. Description block values trim common whitespace only at their
outer ends; empty or common-trivia-only blocks have no value token.
Quote-looking common values remain RawText. [fixture:
radar/lex-common-title-one-space] [fixture: radar/lex-common-title-two-spaces]
[fixture: radar/lex-title-tab-null] [fixture: radar/lex-title-second-tab]
[fixture: radar/lex-common-empty-values] [fixture: radar/common-repeat-empty]
[fixture: radar/common-block-whitespace] [fixture:
radar/lex-common-description-only-directive] [fixture:
radar/lex-common-description-only-comment] [fixture:
radar/common-title-open-quote]

Each native hidden form is one RawText item from opener through qualifying
closer, excluding preceding padding and the consumed following LF. A
body-present YAML match precedes the adjacent-fence alternative; three fences
can therefore form one item. Earlier strings and common values own enclosed
hidden-looking text. [fixture: radar/lex-hidden-padding] [fixture:
radar/hidden-yaml-adjacent-eof] [fixture: radar/detect-retained-three-native]
[fixture: radar/lex-hidden-yaml-two-nonempty] [fixture:
radar/hidden-native-string] [fixture: radar/lex-common-hidden-yaml-block-owner]
[fixture: radar/lex-common-hidden-percent-block-owner]

Shared directives, comment regions and selected semicolons cut RawText and
String items; string pieces become StringFragment. Cuts inside an indivisible
Identifier, Numeric or Keyword reject. Cuts between complete header, label,
entry or common-form components remain trivia. [fixture: radar/directive-common]
[fixture: radar/common-block-comment] [fixture: radar/directive-axis-label]
[fixture: radar/style-fields] [fixture: radar/directive-axis-name] [fixture:
radar/directive-number] [fixture: radar/div-directive-boolean-atom] [fixture:
radar/div-directive-graticule-atom] [fixture:
radar/div-directive-common-keyword] [fixture: radar/div-semicolon-id] [fixture:
radar/div-semicolon-number] [fixture: radar/div-semicolon-keyword] [fixture:
radar/gram-directive-composite-header] [fixture:
radar/directive-label-before-open] [fixture: radar/directive-entry-before-colon]
[fixture: radar/common-block-directive-gap]

## Comments and trivia

ASCII spaces/tabs between units, visible newlines and the appended LF have no
tokens. Native comments use mark %% and end before physical EOL, retaining LS/PS
as content. Bare percent lines passed by detection and accompanying trivia are
not read again, including between retained forms. [fixture: radar/space-tabs]
[fixture: radar/space-lines] [fixture: radar/comment-axis] [fixture:
radar/comment-ls] [fixture: radar/comment-ps] [fixture: radar/bare-line-ls]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]

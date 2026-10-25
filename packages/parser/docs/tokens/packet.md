# Packet tokens

Japanese version: [packet.ja.md](./packet.ja.md)

Tokens follow the specification's
[ordered rules](../../../spec/docs/diagrams/packet.md#ordered-rules), splitting
composite common forms at authored component boundaries. [fixture:
packet/gram-mixed] [fixture: packet/directive-acctitle-colon]

## Tokens

| Kind         | Items                                                        | Fixtures                                                                                                     |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | `packet`, `packet-beta`, `title`, `accTitle`, `accDescr`.    | [fixture: packet/db-all-fields] [fixture: packet/spec-packet-c4580507]                                       |
| `Punctuator` | Range dash, relative plus, colon, and description braces.    | [fixture: packet/gram-mixed] [fixture: packet/db-all-fields]                                                 |
| `Numeric`    | One written unsigned integer; relative plus is separate.     | [fixture: packet/gram-mixed] [fixture: packet/db-precision-rounded]                                          |
| `String`     | One complete quoted label, including both matching quotes.   | [fixture: packet/db-label-empty-double] [fixture: packet/db-label-single-escapes]                            |
| `RawText`    | One common value or one complete hidden YAML/DIRECTIVE form. | [fixture: packet/db-all-fields] [fixture: packet/hidden-yaml-body] [fixture: packet/hidden-directive-header] |

A line-value token keeps all content after title's one ASCII separator or an
accessibility colon, including remaining padding and whitespace-only text; empty
content has no token. Block-value tokens trim common whitespace at their outer
ends; empty or common-trivia-only interiors have no value token. [fixture:
packet/common-whitespace] [fixture: packet/lex-title-one-space] [fixture:
packet/lex-title-one-tab] [fixture: packet/lex-title-two-spaces] [fixture:
packet/acctitle-empty] [fixture: packet/acctitle-repeat-empty] [fixture:
packet/lex-accdescr-whitespace-only] [fixture: packet/gram-empty-description]
[fixture: packet/lex-description-whitespace-only] [fixture:
packet/lex-description-directive-only] [fixture:
packet/lex-description-comment-only]

Quoted labels and common values keep their source spelling, including escapes,
entities, HTML attribute quotes and source line endings. Quotes in common values
remain RawText, even when unclosed. [fixture: packet/db-label-escapes] [fixture:
packet/html-all-fields] [fixture: packet/entity-all-text] [fixture:
packet/line-crlf-label] [fixture: packet/title-open-quote] [fixture:
packet/accdescr-block-quoted]

A hidden form is one RawText item from its opener through its qualifying closer,
excluding preceding padding and its immediately consumed LF, including at
original EOF. Body-present YAML takes priority over an empty-body match and its
opening range dash. [fixture: packet/hidden-yaml-padding] [fixture:
packet/hidden-directive-block-eof] [fixture: packet/hidden-yaml-block-eof]
[fixture: packet/hidden-directive-cr] [fixture: packet/hidden-directive-crlf]
[fixture: packet/hidden-yaml-cr] [fixture: packet/hidden-yaml-crlf] [fixture:
packet/hidden-yaml-adjacent-later] [fixture: packet/lex-dash-before-yaml]

Common directives, comment regions and selected semicolons cut text and string
items. A cut inside a fixed keyword or integer rejects under the shared atomic
boundary rules. [fixture: packet/directive-label-middle] [fixture:
packet/directive-title-value] [fixture: packet/common-block-comment] [fixture:
packet/style-label] [fixture: packet/lex-hidden-nested-global] [fixture:
packet/lex-yaml-common-comment] [fixture: packet/lex-yaml-fence-selected]
[fixture: packet/directive-header-middle] [fixture:
packet/directive-number-middle] [fixture: packet/div-selected-title-interior]
[fixture: packet/div-selected-integer-interior]

## Comments and trivia

ASCII spaces/tabs between units, visible newline units and the appended LF have
no tokens. Native comments have mark `%%` and end before physical EOL, keeping
LS/PS as content; comments are shared records. [fixture: packet/space-count-tab]
[fixture: packet/gram-block-blank-lines] [fixture: packet/spec-packet-7426afc4]
[fixture: packet/comment-block] [fixture: packet/comment-eof] [fixture:
packet/comment-bare] [fixture: packet/lex-native-comment-triple] [fixture:
packet/lex-native-comment-ls] [fixture: packet/lex-native-comment-ps]

Bare percent lines and accompanying trivia passed by detection are not read
again; the lines are shared Comments, also between retained forms. [fixture:
packet/detect-empty-braces-bare] [fixture: packet/detect-unclosed-brace-bare]
[fixture: packet/retained-yaml-bare-ls] [fixture:
packet/retained-directive-bare-bom] [fixture:
packet/div-detect-yaml-bare-directive-ls]

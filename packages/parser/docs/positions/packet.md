# Packet positions

Japanese version: [packet.ja.md](./packet.ja.md)

Ranges implement the specification's
[packet nodes](../../../spec/docs/ast/packet.md#nodes), using original UTF-16
offsets and source line endings. [fixture: packet/gram-mixed] [fixture:
packet/line-crlf-label]

## Ranges

Root covers the whole input. PacketDiagram starts at its first retained
pre-header form, or the header when none, and ends with its last written form.
Outside padding and comments do not extend it. Both header spellings are keyword
tokens. [fixture: packet/spec-packet-7426afc4] [fixture:
packet/spec-packet-c4580507] [fixture: packet/detect-one-block] [fixture:
packet/detect-second-scan-directive] [fixture: packet/comment-eof] [fixture:
packet/header-parser-packet-spaces] [fixture: packet/header-parser-beta-spaces]

Passed bare lines and their accompanying whitespace and line breaks do not
extend the diagram or become ignored-text children, also between retained forms.
[fixture: packet/detect-empty-braces-bare] [fixture:
packet/detect-unclosed-brace-bare] [fixture: packet/retained-yaml-bare-ls]
[fixture: packet/div-detect-yaml-bare-directive-ls]

Range and single blocks start at their first written digit; relative blocks
start at plus, outside count.raw. Their range ends at the closing label quote,
extended through the last textAfter form before visible EOL. Interior hidden
forms belong only to their named gap; row splitting never adds nodes. [fixture:
packet/gram-mixed] [fixture: packet/gram-hidden-range-gap-spaced] [fixture:
packet/gram-single-hidden-gaps] [fixture: packet/gram-hidden-yaml-gap] [fixture:
packet/gram-relative-hidden-colon] [fixture: packet/gram-hidden-gap] [fixture:
packet/hidden-directive-block-eof] [fixture: packet/lex-hidden-two-suffixes]
[fixture: packet/db-row-split]

NumericLiteral covers its written digits. StringLiteral covers both matching
quotes and its interior, including empty labels and source line breaks; raw is
the exact source slice. [fixture: packet/db-precision-rounded] [fixture:
packet/db-overflow-wide] [fixture: packet/db-label-empty-double] [fixture:
packet/db-label-empty-single] [fixture: packet/db-label-single-escapes]
[fixture: packet/line-crlf-label] [fixture: packet/directive-label-middle]

A title statement starts at title and ends with its value, or its keyword when
null. Accessibility line statements end with their value, or their colon when
null. A description-block statement ends at its first closing brace, even with
empty or common-trivia-only content. Each extends through its last hidden suffix
before visible EOL; later forms belong to body. EOL and native comments do not
extend statement ranges. [fixture: packet/title-empty] [fixture:
packet/lex-title-one-tab] [fixture: packet/lex-title-two-spaces] [fixture:
packet/acctitle-empty] [fixture: packet/accdescr-line-empty] [fixture:
packet/gram-empty-description] [fixture: packet/lex-description-directive-only]
[fixture: packet/lex-description-comment-only] [fixture:
packet/lex-description-nested-open] [fixture: packet/hidden-directive-title-eof]
[fixture: packet/hidden-directive-acctitle-eof] [fixture:
packet/hidden-directive-accdescr-eof] [fixture:
packet/hidden-directive-description-eof] [fixture:
packet/lex-hidden-after-visible-eol] [fixture: packet/comment-block-description]

PacketLiteral covers its nonempty line value including padding, or the block
interior without common whitespace at its ends. Null values have no leaf.
PacketIgnoredText covers its opener through its qualifying closer, including
internal source line endings but excluding preceding padding and the consumed
following LF. The appended LF extends no source range. Body-present YAML can
make three fences one leaf, and separately matched forms have separate owners.
[fixture: packet/common-whitespace] [fixture: packet/lex-title-one-space]
[fixture: packet/lex-title-two-spaces] [fixture:
packet/lex-accdescr-whitespace-only] [fixture: packet/accdescr-block-lines]
[fixture: packet/lex-description-whitespace-only] [fixture:
packet/hidden-yaml-padding] [fixture: packet/hidden-directive-crlf] [fixture:
packet/hidden-yaml-crlf] [fixture: packet/hidden-yaml-block-eof] [fixture:
packet/hidden-yaml-adjacent-later] [fixture: packet/lex-yaml-two-nonempty]
[fixture: packet/lex-hidden-two-suffixes]

Common directives, comment regions and selected semicolons remain inside
spanning node ranges while written values leave them out. [fixture:
packet/directive-label-middle] [fixture: packet/directive-title-value] [fixture:
packet/directive-description-value] [fixture: packet/common-block-comment]
[fixture: packet/style-label] [fixture: packet/lex-hidden-nested-global]
[fixture: packet/lex-yaml-common-comment] [fixture:
packet/lex-yaml-fence-selected]

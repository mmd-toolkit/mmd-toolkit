# Eventmodeling tokens

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

The lexer follows the specification's
[first-match order](../../../spec/docs/diagrams/eventmodeling.md#ordered-units).
Only word keywords have an identifier longer alternative. The header
additionally needs its whitespace/percent-pair/end boundary; detection itself
has no suffix boundary. There is no common grammar or visible EOL unit.
[fixture: eventmodeling/lex-keyword-prefix-name] [fixture:
eventmodeling/lex-name-custom-header-dot] [fixture:
eventmodeling/header-slash-comment-glued] [fixture: eventmodeling/header-letter]
[fixture: eventmodeling/header-inline]

## Tokens

| Kind         | Items                                                                             | Fixtures                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | Header, statement/clause keywords, entity/data-type words and metadata keywords.  | [fixture: eventmodeling/gram-written-tree]                                                                                                 |
| `Identifier` | Identifier segments and digit-string frame names.                                 | [fixture: eventmodeling/lex-id-forms] [fixture: eventmodeling/db-source-leading-zero]                                                      |
| `Punctuator` | Whole ->>, [[, ]], each dot/backtick, metadata colon and data/description braces. | [fixture: eventmodeling/gram-written-tree]                                                                                                 |
| `String`     | A complete quoted inline-data value, including its quotes.                        | [fixture: eventmodeling/lex-inline-empty] [fixture: eventmodeling/lex-inline-quote-greedy]                                                 |
| `RawText`    | Brace-data interiors, metadata payloads and native ignored forms.                 | [fixture: eventmodeling/line-block-values] [fixture: eventmodeling/common-whitespace] [fixture: eventmodeling/lex-native-directive-object] |

Each authored component is a separate item. A qualified name has Identifier
tokens for its segments and Punctuator tokens for its dots, rather than one
joined Identifier token. Frame names retain leading zeros and use no Numeric
token. [fixture: eventmodeling/space-qualified-name] [fixture:
eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/db-source-leading-zero]

Inline braces, block braces, tags and metadata delimiters are outside their
payload tokens. Inline quoted data remains String; quotes inside brace or
metadata text remain RawText. Inline data takes the last same-line closer; block
data prefers the body-present closer. [fixture: eventmodeling/lex-inline-greedy]
[fixture: eventmodeling/lex-inline-quote-greedy] [fixture:
eventmodeling/lex-block-adjacent-later-close] [fixture:
eventmodeling/common-quoted-values] [fixture: eventmodeling/data-all-types]

RawText payloads keep all authored interior spacing and line endings, including
whitespace-only content. Empty interiors add no token; empty quoted data still
has a String token. Title payload starts after exactly one ASCII separator;
accessibility line payload starts immediately after its colon. Leading metadata
indentation belongs to no token; it is available from source for Db derivation.
[fixture: eventmodeling/lex-common-title-two-spaces] [fixture:
eventmodeling/common-whitespace] [fixture:
eventmodeling/lex-common-block-whitespace-only] [fixture:
eventmodeling/gram-description-block-empty-after-removal] [fixture:
eventmodeling/lex-inline-empty] [fixture:
eventmodeling/gram-common-leading-directive-both-sides]

Native YAML/directive forms are whole RawText items without their consumed
closing LF. Shared directives, comment regions and selected semicolons cut
RawText and String items; String pieces become StringFragment. A cut inside an
atomic keyword, identifier, digit string, ->>, [[ or ]] rejects. Cuts between
authored components remain permitted. [fixture:
eventmodeling/hidden-yaml-after-frame] [fixture:
eventmodeling/lex-native-directive-object-eof] [fixture:
eventmodeling/directive-string-middle] [fixture:
eventmodeling/directive-block-middle] [fixture: eventmodeling/style-every-text]
[fixture: eventmodeling/directive-arrow-inside] [fixture:
eventmodeling/directive-reference-close-inside] [fixture:
eventmodeling/lex-semicolon-frame-id-inside] [fixture:
eventmodeling/directive-qualified] [fixture: eventmodeling/directive-tag]

## Comments and trivia

Notation whitespace, including LF/LS/PS, and the logical appended LF make no
tokens. Native percent and slash-line comments stop before physical LF; LS/PS
remain comment content. Slash-block comments end at their first closer; their
ranges and values follow the [shared Comment definition](../tokens.md#comment).
Passed bare lines are shared Comments and their accompanying trivia is not read
again. [fixture: eventmodeling/space-lines] [fixture: eventmodeling/line-ls-gap]
[fixture: eventmodeling/line-ps-gap] [fixture: eventmodeling/comment-eof]
[fixture: eventmodeling/comment-native] [fixture:
eventmodeling/comment-line-ls-body] [fixture:
eventmodeling/comment-line-ps-body] [fixture:
eventmodeling/detect-retained-bare-ls-line] [fixture:
eventmodeling/detect-retained-bare-nbsp-header]

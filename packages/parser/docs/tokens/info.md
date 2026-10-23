# Info tokens

Japanese version: [info.ja.md](./info.ja.md)

Tokens follow the specification's
[ordered rules](../../../spec/docs/diagrams/info.md#ordered-rules), splitting
composite common forms into their authored components. [fixture:
info/common-all] [fixture: info/directive-acctitle-colon]

## Tokens

| Kind         | Items                                                                                   | Fixtures                                                                                          |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Keyword`    | `info`, `showInfo`, `title`, `accTitle`, `accDescr`.                                    | [fixture: info/common-flag-all] [fixture: info/common-all]                                        |
| `Punctuator` | An accessibility colon or either description-block brace.                               | [fixture: info/common-flag-all] [fixture: info/common-all]                                        |
| `RawText`    | One nonempty common value or one complete hidden YAML/DIRECTIVE form, including fences. | [fixture: info/common-all] [fixture: info/hidden-yaml-body] [fixture: info/hidden-directive-body] |

Line-value tokens keep all content after title's one ASCII space/tab or an
accessibility colon, including remaining padding and whitespace-only values;
empty content has no value token. [fixture: info/title-tabs] [fixture:
info/lex-title-one-space] [fixture: info/lex-title-one-tab] [fixture:
info/lex-title-two-spaces] [fixture: info/acctitle-empty] [fixture:
info/acctitle-gap] [fixture: info/accdescr-line-empty] [fixture:
info/lex-accdescr-line-whitespace]

A block-value token excludes common whitespace at its outer ends; empty,
whitespace-only, common-directive-only and comment-region-only interiors have no
value token. [fixture: info/space-block-interior] [fixture:
info/accdescr-block-empty] [fixture: info/lex-block-whitespace-only] [fixture:
info/lex-block-directive-only] [fixture: info/lex-block-comment-only]

Quote-looking common values remain RawText, preserving quotes, backslashes,
entities, attribute quotes and source line endings without decoding. [fixture:
info/title-open-quote] [fixture: info/title-double-quotes] [fixture:
info/title-single-quotes] [fixture: info/accdescr-block-quoted] [fixture:
info/html-all-common] [fixture: info/line-crlf]

Each hidden form is one RawText item from its opener through its qualifying
closer, excluding preceding padding and the immediately following LF that its
rule consumes, including at original EOF. [fixture:
info/hidden-yaml-open-padding] [fixture: info/hidden-directive-padding]
[fixture: info/hidden-directive-cr] [fixture: info/hidden-directive-crlf]
[fixture: info/hidden-yaml-cr] [fixture: info/hidden-yaml-crlf] [fixture:
info/hidden-directive-title-eof] [fixture: info/hidden-yaml-block-eof]

Common directives, comment regions and selected semicolons cut RawText items;
fixed keyword cuts reject under the common atomic boundary rules. [fixture:
info/directive-title-value] [fixture: info/directive-block-value] [fixture:
info/lex-line-comment-region-ls] [fixture: info/style-title] [fixture:
info/lex-yaml-common-comment] [fixture: info/lex-hidden-nested-global] [fixture:
info/lex-yaml-fences-selected] [fixture: info/div-directive-header-middle]
[fixture: info/div-selected-showinfo]

## Comments and trivia

ASCII spaces/tabs between units, visible newline units and the appended LF have
no tokens; whitespace and physical line endings inside values and hidden forms
belong to their items where retained above. [fixture: info/space-header-tab]
[fixture: info/common-blank-lines] [fixture: info/header-lf] [fixture:
info/accdescr-block-lines] [fixture: info/hidden-directive-crlf]

Native percent-pair comments become shared Comment records with mark `%%`, from
the first percent through the character before physical EOL; LS/PS do not end
them, and common comment regions can cut them. [fixture: info/comment-header]
[fixture: info/comment-eof] [fixture: info/comment-bare-body] [fixture:
info/comment-triple] [fixture: info/lex-comment-split-mark] [fixture:
info/lex-comment-ls-bridge] [fixture: info/lex-native-comment-ps]

Bare lines and accompanying whitespace/line breaks passed by
[detection](../../../spec/docs/common.md#diagram-detection) are not read again;
the lines are Comments, including percent-brace and unclosed forms. [fixture:
info/lex-detect-preheader-empty-braces] [fixture:
info/lex-detect-preheader-open-brace] [fixture:
info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive]

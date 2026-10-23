# gitgraph tokens

Japanese version: [gitgraph.ja.md](./gitgraph.ja.md)

## Tokens

The
[ordered lexical rules](../../../spec/docs/diagrams/gitgraph.md#ordered-rules)
produce the following components; composite matches are split at authored word,
colon and brace boundaries. [fixture: gitgraph/gram-all-fields] [fixture:
gitgraph/lex-option-global-before-colon]

| Components                                          | Kind         | Fixtures                                                                                                                        |
| --------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Header, direction, operation, option and type words | `Keyword`    | [fixture: gitgraph/gram-all-fields] [fixture: gitgraph/gram-switch]                                                             |
| Colons and description braces                       | `Punctuator` | [fixture: gitgraph/header-colon] [fixture: gitgraph/header-spaced-colon] [fixture: gitgraph/gram-all-fields]                    |
| A bare branch reference                             | `Identifier` | [fixture: gitgraph/lex-reference-shape]                                                                                         |
| An unsigned order                                   | `Numeric`    | [fixture: gitgraph/number-zero] [fixture: gitgraph/number-precision] [fixture: gitgraph/number-overflow]                        |
| A whole quoted string, including either quote style | `String`     | [fixture: gitgraph/gram-commit-single-quotes] [fixture: gitgraph/gram-commit-empty-values]                                      |
| Common-value content and each whole hidden form     | `RawText`    | [fixture: gitgraph/gram-all-fields] [fixture: gitgraph/lex-yaml-empty-body] [fixture: gitgraph/lex-hidden-directive-commit-eof] |

[Line common values](../../../spec/docs/ast/gitgraph.md#gitgraphtitlestatement)
keep their specified padding; description-block content trims common whitespace
only at its outer ends, and empty content has no content token. [fixture:
gitgraph/title-conversion] [fixture: gitgraph/title-tab] [fixture:
gitgraph/common-acctitle-only-whitespace] [fixture:
gitgraph/common-accdescr-only-whitespace] [fixture: gitgraph/accdescr-block]
[fixture: gitgraph/common-block-only-whitespace] [fixture:
gitgraph/lex-description-block-only-directive] [fixture:
gitgraph/lex-description-block-only-comment]

A [hidden form](../../../spec/docs/ast/gitgraph.md#gitgraphignoredtext) has one
RawText item from opener through closer, without preceding ASCII padding or the
immediately following LF that it consumes. [fixture:
gitgraph/lex-yaml-empty-body] [fixture: gitgraph/lex-yaml-three-adjacent-fences]
[fixture: gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/lex-hidden-directive-commit-closing-space] [fixture:
gitgraph/lex-hidden-yaml-block-eof]

[Common trivia](../../../spec/docs/common.md#reading-a-source) cuts String items
into StringFragment tokens and RawText items into RawText tokens; atomic words,
references and integers reject such cuts, while the option-word/colon boundary
admits them. [fixture: gitgraph/directive-in-string] [fixture:
gitgraph/lex-hidden-yaml-global-comment-body] [fixture:
gitgraph/lex-hidden-yaml-global-directive-body] [fixture:
gitgraph/style-acctitle] [fixture: gitgraph/div-directive-in-commit] [fixture:
gitgraph/div-directive-in-reference] [fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-style-semicolon-in-order-number] [fixture:
gitgraph/lex-option-global-before-colon] [fixture:
gitgraph/lex-selected-semicolon-option-word-colon]

[Native comments](../../../spec/docs/diagrams/gitgraph.md#whitespace-and-comments)
and detection-passed bare lines are Comments with mark `%%`; visible newlines
and ordinary ASCII padding have no token. [fixture:
gitgraph/comment-commit-glued] [fixture:
gitgraph/comment-between-mark-characters] [fixture:
gitgraph/detect-bare-brace-eof-header] [fixture: gitgraph/lex-tab] [fixture:
gitgraph/lex-crlf]

[Comparison values](../../../spec/docs/diagrams/gitgraph.md#comparison-values)
create no tokens: quoted leaves keep their written escapes, physical line
endings and padding, and bare references retain their own Identifier tokens.
[fixture: gitgraph/db-compare-bare-and-quoted] [fixture:
gitgraph/db-compare-branch-lookups] [fixture:
gitgraph/db-compare-escape-backslash] [fixture:
gitgraph/db-compare-escape-carriage-return] [fixture:
gitgraph/db-compare-escape-no-hex-unicode-decoding] [fixture:
gitgraph/db-compare-escape-once] [fixture: gitgraph/db-compare-inner-whitespace]
[fixture: gitgraph/db-compare-padding-and-case] [fixture:
gitgraph/db-compare-empty-and-whitespace] [fixture:
gitgraph/db-compare-whitespace-id-lookups] [fixture:
gitgraph/db-compare-escaped-source-parent] [fixture:
gitgraph/db-compare-source-parent-from-escaped-ids]

HTML break spellings and entity source text remain in their String tokens and
written leaves, even when comparisons canonicalize them or read placeholders.
[fixture: gitgraph/db-compare-break-spellings] [fixture:
gitgraph/db-compare-break-whitespace] [fixture:
gitgraph/db-compare-break-boundaries] [fixture:
gitgraph/db-compare-entity-literal-hash-distinct]

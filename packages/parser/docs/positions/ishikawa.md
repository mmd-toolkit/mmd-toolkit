# Ishikawa positions

Japanese version: [ishikawa.ja.md](./ishikawa.ja.md)

These ranges supplement [positions.md](../positions.md). The nodes are defined
in [ast/ishikawa.md](../../../spec/docs/ast/ishikawa.md), and the tokens in
[tokens/ishikawa.md](../tokens/ishikawa.md).

## Ranges

### IshikawaDiagram

The diagram covers the header through its last diagram token, including all
descendants and trailing value whitespace. Leading trivia, trailing comments,
and directives after its last token lie outside it. A rootless diagram covers
only its header, including the beta suffix when selected. [fixture:
ishikawa/db-all-fields] [fixture: ishikawa/header-before-comments] [fixture:
ishikawa/gram-root-trailing-space] [fixture:
ishikawa/gram-last-comment-blank-line] [fixture:
ishikawa/directive-open-child-eof] [fixture: ishikawa/header-only-lf] [fixture:
ishikawa/header-beta-only-lf] [fixture: ishikawa/header-lf-directive-eof]
[fixture: ishikawa/header-comment-ls-whitespace-eof] [fixture:
ishikawa/header-comment-ps-whitespace-eof]

### IshikawaNode

A node covers its text through its last descendant; a leaf covers only its text.
Leading indentation and the following line terminator are outside it. Its
`indent` retains the written whitespace count, including tabs and a
comment-ending U+2028 or U+2029, excluding directives, common comment regions,
and comment-body whitespace; this does not extend its range into that
indentation. [fixture: ishikawa/gram-root-lf] [fixture:
ishikawa/db-indent-first-cause] [fixture: ishikawa/db-indent-pop-several]
[fixture: ishikawa/db-indent-tab-character] [fixture:
ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/db-indent-around-directives] [fixture:
ishikawa/header-same-line-root] [fixture:
ishikawa/lex-indent-multiline-directive] [fixture:
ishikawa/lex-header-indent-multiline-directive] [fixture:
ishikawa/lex-indent-comment-region-ls] [fixture:
ishikawa/lex-indent-comment-region-ps] [fixture:
ishikawa/lex-comment-ps-indent-excludes-body-padding]

### IshikawaLiteral

A literal covers its first through last written text character, including quotes
and all trailing whitespace, also at EOF and after a colon. Its range may span
directives, common comment regions, or selected ignored semicolons; its value
leaves them out while its `RawText` fragments cover the remaining written text.
[fixture: ishikawa/gram-empty-quotes] [fixture:
ishikawa/gram-root-trailing-space] [fixture: ishikawa/gram-child-trailing-space]
[fixture: ishikawa/lex-trailing-whitespace-eof] [fixture:
ishikawa/lex-trailing-ls-ps-whitespace] [fixture:
ishikawa/gram-after-root-colon-space] [fixture:
ishikawa/gram-after-child-colon-space] [fixture: ishikawa/directive-root-middle]
[fixture: ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/comment-ls-region-in-text] [fixture:
ishikawa/lex-root-style-semicolon-padding] [fixture:
ishikawa/lex-root-style-two-semicolons-padding] [fixture:
ishikawa/lex-root-style-three-semicolons-padding]

CR, CRLF, and LF advance source lines under the shared position rules; U+2028
and U+2029 advance only columns. [fixture: ishikawa/lex-cr-lines] [fixture:
ishikawa/lex-crlf-lines] [fixture: ishikawa/gram-root-lf] [fixture:
ishikawa/lex-u2028-in-root] [fixture: ishikawa/lex-u2029-in-child]

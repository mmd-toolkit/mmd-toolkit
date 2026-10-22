# Ishikawa tokens

Japanese version: [ishikawa.ja.md](./ishikawa.ja.md)

These tokens supplement [tokens.md](../tokens.md). The nodes are defined in
[ast/ishikawa.md](../../../spec/docs/ast/ishikawa.md), and the lexical rules in
[diagrams/ishikawa.md](../../../spec/docs/diagrams/ishikawa.md#lexical-structure).

## Tokens

| Kind      | Items                                             |
| --------- | ------------------------------------------------- |
| `Keyword` | The selected `ishikawa` or `ishikawa-beta` header |
| `RawText` | Each complete node text                           |

Each item makes one token before common trivia cuts it. Header spelling keeps
its case. A beta suffix whose word boundary fails belongs to node text after the
stable header. [fixture: ishikawa/header-uppercase] [fixture:
ishikawa/header-beta-mixed-case] [fixture: ishikawa/header-beta-letter-suffix]
[fixture: ishikawa/header-beta-digit-suffix] [fixture:
ishikawa/header-beta-underscore-suffix] [fixture:
ishikawa/header-beta-dash-suffix]

A node-text token keeps all interior and trailing whitespace, including at EOF,
U+2028 and U+2029, and whitespace after a colon. Quotes, backticks, numbers,
entities, and unselected semicolons are part of that `RawText`, with no string,
numeric, or punctuation token. [fixture: ishikawa/gram-spaces-inside-text]
[fixture: ishikawa/gram-root-trailing-space] [fixture:
ishikawa/gram-child-trailing-space] [fixture:
ishikawa/lex-trailing-whitespace-eof] [fixture:
ishikawa/lex-trailing-ls-ps-whitespace] [fixture:
ishikawa/gram-after-root-colon-space] [fixture:
ishikawa/gram-after-child-colon-space] [fixture: ishikawa/gram-empty-quotes]
[fixture: ishikawa/gram-empty-backticks-text] [fixture:
ishikawa/db-number-labels] [fixture: ishikawa/header-root-inline-entity]
[fixture: ishikawa/gram-after-child-semicolon]

Indentation, blank-line whitespace, and newline units make no tokens. CR and
CRLF end node text; U+2028 and U+2029 inside it do not. [fixture:
ishikawa/lex-space-positions] [fixture: ishikawa/lex-tab-positions] [fixture:
ishikawa/lex-nbsp-positions] [fixture: ishikawa/gram-between-spaces-line]
[fixture: ishikawa/lex-cr-lines] [fixture: ishikawa/lex-crlf-lines] [fixture:
ishikawa/lex-u2028-in-root] [fixture: ishikawa/lex-u2029-in-child]

Directives, common comment regions, and selected ignored semicolons cut node
text into `RawText` fragments under the [shared rules](../tokens.md), retaining
value whitespace next to each cut, even a whitespace-only fragment. Common
recording supplies `Directive` and `IgnoredSemicolon` tokens outside comments.
[fixture: ishikawa/directive-root-middle] [fixture:
ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/comment-ls-region-in-text] [fixture:
ishikawa/lex-node-text-ps-comment-region] [fixture:
ishikawa/lex-root-style-semicolon-padding] [fixture:
ishikawa/lex-root-style-two-semicolons-padding] [fixture:
ishikawa/lex-root-style-three-semicolons-padding] [fixture:
ishikawa/lex-style-rule-directive-in-trigger]

Diagram comments have mark `%%` and end before LF, U+2028, or U+2029, or at EOF.
Leading whitespace is outside the comment; a directive between its marks or
inside its body is inside the comment's range. A `%%` after node text has begun
remains in its `RawText` token. [fixture:
ishikawa/gram-preserved-comment-after-root] [fixture:
ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/comment-only-eof] [fixture:
ishikawa/comment-directive-between-marks] [fixture:
ishikawa/div-header-comment-directive-value-ps] [fixture:
ishikawa/comment-root-inline-glued] [fixture:
ishikawa/comment-child-inline-spaced]

A directive inside the selected header keyword rejects the input under the
shared token-boundary rule; one inside node text, including a beta fallback
suffix or numeric-looking text, is allowed. [fixture:
ishikawa/directive-in-header] [fixture: ishikawa/directive-in-beta-header]
[fixture: ishikawa/div-directive-beta-prefix] [fixture:
ishikawa/lex-directive-before-beta-fallback-text] [fixture:
ishikawa/lex-directive-in-beta-fallback-text] [fixture:
ishikawa/lex-directive-in-numeric-looking-text]

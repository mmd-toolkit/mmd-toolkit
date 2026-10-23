# Pie tokens

Japanese version: [pie.ja.md](./pie.ja.md)

Token items follow the specification's
[ordered lexical rules](../../../spec/docs/diagrams/pie.md#ordered-rules) and
[grammar](../../../spec/docs/diagrams/pie.md#grammar), with composite matches
split into their written components. [fixture: pie/db-all-fields] [fixture:
pie/review-directive-acc-title-colon]

## Tokens

| Kind         | Items                                                                                       | Fixtures                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | `pie`, `showData`, `title`, `accTitle`, `accDescr`.                                         | [fixture: pie/db-all-fields] [fixture: pie/accdescr-inline]                                                              |
| `Punctuator` | A section or accessibility colon, or either description-block brace.                        | [fixture: pie/db-all-fields] [fixture: pie/accdescr-inline]                                                              |
| `Numeric`    | One complete `pie-number`, including its minus and fraction when present.                   | [fixture: pie/number-negative-zero] [fixture: pie/number-decimal-leading-zero]                                           |
| `String`     | One label, including its matching single or double quotes, even when empty.                 | [fixture: pie/label-single-quote] [fixture: pie/label-empty] [fixture: pie/review-label-empty-single]                    |
| `RawText`    | One nonempty common value or one complete hidden YAML/DIRECTIVE form, including its fences. | [fixture: pie/db-all-fields] [fixture: pie/frontmatter-between-section-parts] [fixture: pie/review-directive-empty-body] |

A line-value token keeps all text after title's one ASCII separator or an
accessibility colon, including whitespace-only content; empty content has no
value token. [fixture: pie/title-spaces] [fixture: pie/title-whitespace-last]
[fixture: pie/review-acctitle-whitespace-final] [fixture:
pie/review-accdescr-whitespace-final] [fixture: pie/ast-title-tab-null-eof]
[fixture: pie/acctitle-eof] [fixture: pie/accdescr-eof] [fixture:
pie/ast-common-values-directive-only]

A block-value token excludes common whitespace at its ends, and an empty or
whitespace-only block has no value token. [fixture: pie/accdescr-block]
[fixture: pie/accdescr-block-unicode-trim] [fixture:
pie/accdescr-empty-block-last] [fixture: pie/accdescr-space-block-last]
[fixture: pie/gram-description-block-directive-only] [fixture:
pie/gram-description-block-comment-only]

A hidden-form token runs from its opener through its closer, excluding the
immediately following LF that the lexical rule consumes. [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/review-directive-hidden-crlf] [fixture:
pie/review-directive-hidden-space-boundary] [fixture:
pie/review-directive-hidden-eof] [fixture: pie/gram-section-eof-hidden-yaml]

Common directives, comment regions and selected semicolons cut String and
RawText items; string fragments have kind StringFragment, and atomic keyword or
number cuts reject under the common boundary rules. [fixture:
pie/directive-label-middle] [fixture: pie/comment-label-line] [fixture:
pie/directive-title-middle] [fixture: pie/accdescr-block-comment-lines]
[fixture: pie/style-label-trigger] [fixture: pie/lex-yaml-body-comment-content]
[fixture: pie/lex-hidden-body-global-directive] [fixture:
pie/div-directive-in-header] [fixture: pie/div-directive-number] [fixture:
pie/div-atomic-semicolon-number]

## Comments and trivia

ASCII spaces/tabs between units, visible newline units and the appended LF have
no tokens; whitespace and physical line endings inside strings or hidden forms
remain part of their items. [fixture: pie/lex-tab] [fixture:
pie/lex-tab-blank-line] [fixture: pie/header-only] [fixture: pie/label-crlf]
[fixture: pie/review-directive-hidden-crlf]

The last lexical rule makes native percent-pair comments into shared Comment
records with mark `%%`, through the character before the physical line break; LS
and PS do not end them. [fixture: pie/comment-section-glued] [fixture:
pie/comment-section-eof] [fixture: pie/comment-ls] [fixture: pie/comment-ps]

Bare percent-pair lines and their accompanying trivia passed by
[detection](../../../spec/docs/common.md#diagram-detection) are not read again;
the bare lines are Comments, including brace-like and unclosed forms. [fixture:
pie/review-comment-bare-header-eof] [fixture:
pie/lex-bare-percent-braces-before-header] [fixture:
pie/comment-preheader-unclosed-percent-brace] [fixture:
pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
pie/div-preheader-retained-directive-bare-ls-line]

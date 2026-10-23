# Pie tokens

Japanese version: [pie.ja.md](./pie.ja.md)

This document defines the tokens of `pie`; nodes are defined in
[ast/pie.md](../../../spec/docs/ast/pie.md), with shared token rules in
[tokens.md](../tokens.md). The first-match lexical order is defined in
[diagrams/pie.md](../../../spec/docs/diagrams/pie.md#ordered-rules), whose
source references are
[pie.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/pie.langium#L1-L20)
and
[common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L1-L34).

## Tokens

The grammatical components have these token kinds. [fixture: pie/db-all-fields]
[fixture: pie/label-single-quote] [fixture:
pie/frontmatter-between-section-parts]

| Kind         | Components                                             |
| ------------ | ------------------------------------------------------ |
| `Keyword`    | pie, showData, title, accTitle and accDescr.           |
| `String`     | One section label with its matching quotes.            |
| `Numeric`    | One complete section number, including its minus.      |
| `Punctuator` | Each section/accessibility colon or description brace. |
| `RawText`    | One common value or one complete retained hidden form. |

Composite common forms emit separate keyword, delimiter and value items; leading
ASCII indentation and the single title separator have no token. [fixture:
pie/title-spaces] [fixture: pie/lex-title-tab-separator] [fixture:
pie/acctitle-spaces] [fixture: pie/accdescr-spaces] [fixture:
pie/accdescr-block-gap] [fixture: pie/review-block-brace-colon-priority]

A label is one String item, including both single or double quotes, empty
content, escapes, padding and physical line breaks. [fixture:
pie/label-single-quote] [fixture: pie/label-empty] [fixture:
pie/review-label-empty-single] [fixture: pie/label-escaped-quotes] [fixture:
pie/label-whitespace] [fixture: pie/label-crlf]

A number is one atomic Numeric item; its original spelling remains in raw, and
its NumericLiteral uses the shared double conversion, including negative zero
and positive infinity. [fixture: pie/number-decimal-leading-zero] [fixture:
pie/number-negative-zero] [fixture: pie/number-overflow] [fixture:
pie/review-number-negative-underflow-final]

A line common value is one RawText item retaining every character after the
single title separator or accessibility colon, through the line-value end.
Exactly empty content has no value token; whitespace-only content has one.
[fixture: pie/title-spaces] [fixture: pie/title-whitespace-last] [fixture:
pie/acctitle-spaces] [fixture: pie/accdescr-spaces] [fixture:
pie/review-acctitle-whitespace-final] [fixture:
pie/review-accdescr-whitespace-final] [fixture: pie/acctitle-eof] [fixture:
pie/accdescr-eof] [fixture: pie/ast-title-tab-null-eof] [fixture:
pie/ast-common-values-directive-only] [fixture: pie/title-comment] [fixture:
pie/lex-common-values-comment-region-ls]

A description-block value is one RawText item without common whitespace at its
ends; an empty or whitespace-only interior has no value token. Its braces have
separate Punctuator items. [fixture: pie/accdescr-block] [fixture:
pie/accdescr-block-unicode-trim] [fixture: pie/accdescr-empty-block-last]
[fixture: pie/accdescr-space-block-last] [fixture:
pie/gram-description-block-directive-only] [fixture:
pie/gram-description-block-comment-only]

Each PieIgnoredText is one RawText item including its opening and closing fences
and internal padding and line endings, excluding any preceding ASCII padding and
the LF consumed after the closer. Empty bodies still have the fence text.
[fixture: pie/frontmatter-between-section-parts] [fixture:
pie/review-yaml-hidden-empty] [fixture: pie/review-directive-empty-body]
[fixture: pie/review-directive-hidden-crlf] [fixture:
pie/review-directive-hidden-space-boundary] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-hidden-directive-lone-cr]

Common directives, comment regions and selected semicolons cut String and
RawText items under the shared rules, with StringFragment for cut strings; these
cuts stay inside the containing node's range but outside its value. [fixture:
pie/directive-label-middle] [fixture: pie/directive-title-middle] [fixture:
pie/label-crlf] [fixture: pie/comment-label-line] [fixture:
pie/lex-yaml-body-comment-content] [fixture:
pie/lex-hidden-global-comment-region] [fixture: pie/style-label-trigger]
[fixture: pie/style-acctitle-trigger] [fixture:
pie/lex-yaml-opener-selected-semicolon]

Fixed keywords and numbers are atomic; a directive or selected semicolon inside
them rejects with the shared boundary error. Complete component boundaries,
including the gap between accTitle and its colon or accDescr and its brace,
allow common trivia. [fixture: pie/div-directive-in-header] [fixture:
pie/div-directive-in-showdata] [fixture: pie/div-directive-in-title-keyword]
[fixture: pie/div-directive-in-acctitle-keyword] [fixture:
pie/div-directive-in-accdescr-keyword] [fixture:
pie/div-directive-in-accdescr-block-keyword] [fixture: pie/div-directive-number]
[fixture: pie/div-atomic-semicolon-number] [fixture:
pie/div-selected-semicolon-title-keyword] [fixture:
pie/div-selected-semicolon-showdata] [fixture:
pie/div-selected-semicolon-acctitle] [fixture:
pie/div-selected-semicolon-accdescr] [fixture:
pie/div-selected-semicolon-block-keyword] [fixture:
pie/review-directive-acc-title-colon] [fixture:
pie/review-directive-acc-descr-block-opener]

## Comments and trivia

ASCII spaces/tabs between units and visible physical newlines have no tokens; LF
consumed by a hidden form also has none. The appended LF adds no source text or
token. [fixture: pie/lex-tab] [fixture: pie/lex-tab-blank-line] [fixture:
pie/lex-crlf] [fixture: pie/lex-hidden-before-colon-lf] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/review-directive-hidden-eof]

Native percent-pair comments are shared Comment records, from their first
percent through the last character before physical LF; mark is %% and value is
the text after the pair. They have no tokens and do not consume LF. LS/PS stay
inside the comment; a common comment region can cut it into fragments under the
shared rules. [fixture: pie/comment-section-glued] [fixture:
pie/comment-section-eof] [fixture: pie/review-comment-bare-header-eof] [fixture:
pie/lex-native-triple-percent-inline] [fixture: pie/comment-ls] [fixture:
pie/comment-ps] [fixture: pie/lex-comment-ls-region-bridge]

Bare percent-pair lines passed by detection have the same Comment records; they
and the accompanying whitespace and line breaks are not read again. Retained
pre-header YAML and second-scan DIRECTIVE forms instead have RawText items.
[fixture: pie/comment-preheader-unclosed-percent-brace] [fixture:
pie/lex-bare-percent-braces-before-header] [fixture:
pie/div-preheader-bare-ls-blank] [fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/div-preheader-retained-yaml-bare-ls] [fixture:
pie/div-preheader-retained-yaml-bare-bom] [fixture:
pie/div-preheader-retained-yaml-bare-ls-line] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
pie/div-preheader-retained-directive-bare-ls] [fixture:
pie/div-preheader-retained-directive-bare-bom] [fixture:
pie/div-preheader-retained-directive-bare-ls-line] [fixture:
pie/lex-preheader-retained-directive-bare-ascii] [fixture:
pie/lex-preheader-retained-directive-bare-ascii-line] [fixture:
pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
pie/lex-preheader-retained-yaml-bare-then-directive-ascii]

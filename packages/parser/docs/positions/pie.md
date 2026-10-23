# Pie positions

Japanese version: [pie.ja.md](./pie.ja.md)

The node ranges implement the specification's
[pie nodes](../../../spec/docs/ast/pie.md#nodes), using original source offsets
and physical line widths. [fixture: pie/db-all-fields] [fixture: pie/label-crlf]
[fixture: pie/accdescr-block-cr]

## Ranges

Root covers the entire source, while PieDiagram runs from its earliest retained
pre-header form, or pie when none, through its last written header or body form,
excluding unrelated outer whitespace and comments. [fixture: pie/header-only]
[fixture: pie/frontmatter-nonleading-comment] [fixture:
pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/comment-preheader-unclosed-percent-brace] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
pie/comment-section-eof] [fixture: pie/lex-yaml-after-showdata-eof]

PieSectionStatement runs from the opening label quote through its number or last
textAfter form, including its colon and hidden forms in the named gaps,
excluding EOL. [fixture: pie/label-empty] [fixture:
pie/review-yaml-between-label-colon] [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/lex-yaml-before-colon-two-blocks] [fixture:
pie/lex-yaml-three-fences-before-value] [fixture:
pie/gram-section-eof-hidden-yaml]

StringLiteral includes both matching quotes; NumericLiteral includes its whole
written number, and each raw is the exact original source slice. [fixture:
pie/label-single-quote] [fixture: pie/label-escaped-quotes] [fixture:
pie/directive-label-middle] [fixture: pie/label-crlf] [fixture:
pie/number-negative-zero] [fixture: pie/number-decimal-leading-zero]

Title statements start at title and end at the final value character, or at the
keyword when null; accessibility line statements start at their keyword and end
at the final value character, or at the colon when null. [fixture:
pie/title-spaces] [fixture: pie/ast-title-tab-null-eof] [fixture:
pie/acctitle-spaces] [fixture: pie/acctitle-eof] [fixture: pie/accdescr-spaces]
[fixture: pie/accdescr-eof] [fixture: pie/ast-common-values-directive-only]

A description-block statement runs from accDescr through its first closing
brace, including an empty or whitespace-only block. [fixture:
pie/accdescr-block] [fixture: pie/accdescr-empty-block-last] [fixture:
pie/accdescr-space-block-last] [fixture:
pie/lex-block-open-brace-content-single-close]

Every common statement extends through its last textAfter form before EOL;
hidden forms after a visible EOL belong to body instead. [fixture:
pie/review-hidden-directive-title-eof] [fixture:
pie/review-hidden-directive-acctitle-eof] [fixture:
pie/review-hidden-directive-accdescr-eof] [fixture:
pie/gram-block-eof-hidden-yaml] [fixture: pie/yaml-inline-after-title]

PieLiteral covers the entire nonempty line value, including padding, or the
block interior without common whitespace at its ends; null has no leaf range.
[fixture: pie/title-spaces] [fixture: pie/title-whitespace-last] [fixture:
pie/acctitle-spaces] [fixture: pie/accdescr-spaces] [fixture:
pie/accdescr-block-unicode-trim] [fixture:
pie/gram-description-block-comment-only] [fixture:
pie/gram-description-block-directive-only]

PieIgnoredText includes its opener, interior and closer, with internal padding
and original line endings, excluding preceding padding and the following LF
consumed by its hidden rule; the appended LF never extends a range. [fixture:
pie/frontmatter-between-section-parts] [fixture:
pie/review-directive-hidden-crlf] [fixture:
pie/review-directive-hidden-space-boundary] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/review-directive-hidden-eof]
[fixture: pie/lex-yaml-body-unicode-separators] [fixture:
pie/lex-hidden-directive-lone-cr]

The body-present YAML priority can make three adjacent fences one ignored leaf,
including the middle fence, in a section gap or before the header. [fixture:
pie/lex-yaml-three-fences-before-value] [fixture:
pie/lex-nonleading-yaml-three-adjacent-fences]

Internal common directives, comment regions and selected semicolons remain
within a spanning node's range while its written value excludes them. [fixture:
pie/directive-title-middle] [fixture: pie/accdescr-block-comment-lines]
[fixture: pie/style-acctitle-trigger] [fixture:
pie/lex-hidden-body-global-directive] [fixture:
pie/lex-yaml-body-comment-content] [fixture:
pie/lex-yaml-opener-selected-semicolon]

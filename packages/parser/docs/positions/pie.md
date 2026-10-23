# Pie positions

Japanese version: [pie.ja.md](./pie.ja.md)

This document supplements [positions.md](../positions.md) for
[ast/pie.md](../../../spec/docs/ast/pie.md); token items are defined in
[tokens/pie.md](../tokens/pie.md).

## Ranges and ownership

Root covers the whole source. PieDiagram starts at its earliest retained
pre-header form, or pie when none exists, and ends at its final written header
or body token. Surrounding whitespace, common directives and trailing comments
do not extend it. [fixture: pie/header-only] [fixture:
pie/frontmatter-nonleading-comment] [fixture:
pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/directive-title-middle] [fixture: pie/comment-section-eof] [fixture:
pie/ast-common-values-directive-only]

textBeforeHeader holds each hidden YAML or DIRECTIVE read before pie, in source
order. Bare lines passed by detection are comments and do not extend the diagram
range; whitespace detection passes with them remains trivia. [fixture:
pie/frontmatter-nonleading-comment] [fixture:
pie/lex-hidden-directive-second-detection-scan] [fixture:
pie/comment-preheader-unclosed-percent-brace] [fixture:
pie/lex-bare-percent-braces-before-header] [fixture:
pie/div-preheader-bare-ls-blank] [fixture:
pie/div-preheader-bare-bom-before-header] [fixture:
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

With a written showData, hidden forms between pie and that flag belong to
textBeforeShowData; without it, that list is empty and those forms start body.
Hidden forms after showData also start body. [fixture:
pie/review-hidden-directive-before-showdata] [fixture:
pie/review-yaml-before-showdata] [fixture: pie/frontmatter-after-header]
[fixture: pie/lex-yaml-after-showdata-before-first-section] [fixture:
pie/lex-yaml-after-showdata-eof] [fixture:
pie/lex-hidden-directive-with-second-hidden-token]

A section spans its opening label quote through its number or last textAfter
form, excluding EOL. The label includes both quotes, with raw equal to the
original source range; the number includes its minus and all written digits.
[fixture: pie/db-all-fields] [fixture: pie/label-single-quote] [fixture:
pie/label-empty] [fixture: pie/label-unknown-escapes] [fixture:
pie/number-negative-zero] [fixture: pie/number-decimal-leading-zero]

Hidden forms between label and colon belong to textBeforeColon, those between
colon and number to textBeforeValue, and those after the number before visible
EOL to textAfter. A hidden form after visible EOL instead belongs to body; two
forms in one gap stay separate. [fixture: pie/review-yaml-between-label-colon]
[fixture: pie/frontmatter-between-section-parts] [fixture:
pie/gram-section-eof-hidden-yaml] [fixture: pie/yaml-inline-after-title]
[fixture: pie/lex-yaml-before-colon-two-blocks] [fixture:
pie/lex-hidden-before-colon-lf]

A title statement starts at title and ends at its last value character, or its
keyword when null. Accessibility line statements start at accTitle/accDescr and
end at the last value character, or the colon when null. Line values preserve
padding after the single title separator or immediately after the colon; exactly
empty values have no Literal range. [fixture: pie/title-spaces] [fixture:
pie/title-whitespace-last] [fixture: pie/ast-title-tab-null-eof] [fixture:
pie/review-title-bare-lone-eof] [fixture: pie/acctitle-spaces] [fixture:
pie/accdescr-spaces] [fixture: pie/acctitle-eof] [fixture: pie/accdescr-eof]
[fixture: pie/ast-common-values-directive-only]

A description-block statement spans accDescr through its first closing brace.
Its Literal excludes the braces and common whitespace at its ends; an empty or
whitespace-only block has null value, with no Literal range. [fixture:
pie/accdescr-block] [fixture: pie/accdescr-block-unicode-trim] [fixture:
pie/accdescr-empty-block-last] [fixture: pie/accdescr-space-block-last]
[fixture: pie/gram-description-block-directive-only] [fixture:
pie/gram-description-block-comment-only]

Each common statement extends through its last textAfter form before visible
EOL; forms after visible EOL belong to body. Consuming the separating LF does
not change this ownership, even when a hidden form ends at source EOF. [fixture:
pie/review-hidden-directive-title-eof] [fixture:
pie/review-hidden-directive-acctitle-eof] [fixture:
pie/review-hidden-directive-accdescr-eof] [fixture:
pie/review-hidden-directive-block-eof] [fixture: pie/gram-block-eof-hidden-yaml]
[fixture: pie/yaml-inline-after-title]

PieIgnoredText spans its recognized --- or %%{ opener through its closing fence,
excluding preceding ASCII padding and the LF its lexical rule consumes
afterward. Internal line endings and padding remain in its range and written
value. [fixture: pie/frontmatter-between-section-parts] [fixture:
pie/review-directive-hidden-crlf] [fixture:
pie/review-directive-hidden-space-boundary] [fixture:
pie/review-directive-hidden-eof] [fixture: pie/lex-hidden-directive-lone-cr]

Common trivia inside a label, Literal or ignored form remains within its source
range and outside its written value; StringLiteral.raw retains it. CRLF retains
its two source code units and advances one line; LS/PS do not advance the line.
[fixture: pie/directive-label-middle] [fixture: pie/directive-title-middle]
[fixture: pie/style-label-trigger] [fixture:
pie/lex-hidden-global-comment-region] [fixture: pie/label-crlf] [fixture:
pie/label-cr] [fixture: pie/label-ls] [fixture: pie/label-ps]

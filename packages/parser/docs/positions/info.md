# Info positions

Japanese version: [info.ja.md](./info.ja.md)

Ranges implement the specification's
[info nodes](../../../spec/docs/ast/info.md#nodes) with original UTF-16 offsets
and physical source line endings. [fixture: info/common-all] [fixture:
info/line-crlf] [fixture: info/hidden-directive-cr]

## Ranges

Root covers the entire input; InfoDiagram runs from its first retained
pre-header form, or info when none, through its last written header, flag or
body form, excluding outside padding and comments. [fixture: info/header-lf]
[fixture: info/header-inline-flag] [fixture: info/common-all] [fixture:
info/frontmatter-nonleading-comment] [fixture:
info/detect-second-scan-directive] [fixture: info/comment-eof]

Passed bare lines and accompanying trivia do not extend the diagram range or
become ignored-text children, even between retained forms. [fixture:
info/lex-detect-preheader-empty-braces] [fixture:
info/lex-detect-preheader-open-brace] [fixture:
info/div-detect-retained-yaml-bare-ls] [fixture:
info/div-detect-retained-directive-bare-bom] [fixture:
info/div-detect-yaml-bare-directive]

A title statement starts at title and ends at its last value character or, for
null, its keyword; accessibility line statements start at their keyword and end
at their last value character or, for null, their colon. [fixture:
info/title-tabs] [fixture: info/lex-title-one-space] [fixture:
info/lex-title-one-tab] [fixture: info/lex-title-two-spaces] [fixture:
info/lex-title-directive-only] [fixture: info/acctitle-empty] [fixture:
info/acctitle-gap] [fixture: info/lex-acctitle-directive-only] [fixture:
info/accdescr-line-empty] [fixture: info/lex-accdescr-directive-only]

A description-block statement runs from accDescr through the first closing
brace, including empty, whitespace-only and common-trivia-only blocks. [fixture:
info/accdescr-block-empty] [fixture: info/space-block-interior] [fixture:
info/lex-block-whitespace-only] [fixture: info/lex-block-directive-only]
[fixture: info/lex-block-comment-only] [fixture: info/lex-block-open-brace]
[fixture: info/hidden-directive-block-first-brace]

Each common statement extends through its last textAfter form before visible
EOL; forms after that EOL belong to body instead, and neither EOL nor a native
comment extends its range. [fixture: info/hidden-directive-title-eof] [fixture:
info/hidden-directive-acctitle-eof] [fixture:
info/hidden-directive-accdescr-eof] [fixture: info/hidden-directive-block-eof]
[fixture: info/hidden-yaml-block-eof] [fixture: info/lex-hidden-tail-two]
[fixture: info/lex-hidden-after-visible-eol] [fixture: info/comment-after-block]

InfoLiteral covers the nonempty line value, padding included, or the block
interior without common whitespace at its ends; null has no leaf. [fixture:
info/title-tabs] [fixture: info/lex-title-two-spaces] [fixture:
info/acctitle-gap] [fixture: info/lex-accdescr-line-whitespace] [fixture:
info/space-block-interior] [fixture: info/lex-block-whitespace-only] [fixture:
info/lex-block-directive-only] [fixture: info/lex-block-comment-only]

InfoIgnoredText includes its opener, interior and qualifying closer with source
line endings and internal padding, excluding preceding ASCII padding and the
immediately following LF consumed by the lexical rule; the appended LF never
extends a range. [fixture: info/hidden-yaml-empty] [fixture:
info/hidden-yaml-open-padding] [fixture: info/hidden-directive-padding]
[fixture: info/hidden-directive-cr] [fixture: info/lex-hidden-body-separators]
[fixture: info/hidden-yaml-cr] [fixture: info/lex-yaml-body-separators]
[fixture: info/hidden-directive-title-eof] [fixture: info/hidden-yaml-block-eof]

Body-present YAML priority can make three adjacent fences one ignored leaf; each
separately matched form has exactly one owner in textBeforeHeader,
textBeforeShowInfo, body or textAfter. [fixture: info/lex-yaml-three-fences]
[fixture: info/frontmatter-nonleading-comment] [fixture:
info/lex-flag-hidden-two] [fixture: info/lex-hidden-without-flag] [fixture:
info/lex-hidden-tail-two] [fixture: info/lex-yaml-two-before-flag]

Common directives, comment regions and selected semicolons remain inside
spanning node ranges while their written values leave that trivia out. [fixture:
info/directive-title-value] [fixture: info/directive-block-value] [fixture:
info/comment-block] [fixture: info/lex-line-comment-region-ls] [fixture:
info/style-title] [fixture: info/lex-hidden-nested-global] [fixture:
info/lex-yaml-common-comment] [fixture: info/lex-yaml-fences-selected]

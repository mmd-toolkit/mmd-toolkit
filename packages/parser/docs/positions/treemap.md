# Treemap positions

Japanese version: [treemap.ja.md](./treemap.ja.md)

Ranges follow the [treemap source tree](../../../spec/docs/ast/treemap.md),
using original UTF-16 offsets and source line endings. Root covers the whole
input. [fixture: treemap/gram-written-tree] [fixture: treemap/line-name-values]
[fixture: treemap/line-crlf]

## Ranges

TreemapDiagram starts at the header and ends with the last written statement, or
the header end for an empty body. Outer padding, native comments, passed trivia
and appended LF do not extend it. There is no retained-prefix node. [fixture:
treemap/header-beta] [fixture: treemap/spec-treemap-test-ts-892fa294] [fixture:
treemap/gram-written-tree] [fixture: treemap/hidden-comment-eof] [fixture:
treemap/detect-second-scan-single-line-comment] [fixture:
common/detect-minimal-treemap]

Section and leaf ranges start at their opening name quote, excluding row
indentation even when its run lies on the preceding line or crosses a directive.
A section ends at its closing quote or selector; a leaf ends at its number or
selector. Component gaps remain within the range without becoming children. The
body remains flat. [fixture: treemap/gram-written-tree] [fixture:
treemap/gram-adjacent-sections] [fixture: treemap/db-empty-names] [fixture:
treemap/db-section-tail-space] [fixture: treemap/db-leaf-tail-tab] [fixture:
treemap/gram-indent-from-whitespace-line] [fixture:
treemap/gram-indent-around-global-directive] [fixture:
treemap/gram-leaf-newlines-around-separator] [fixture:
treemap/comment-value-selector-gap]

Class definitions start at classDef and end at a written terminating semicolon,
otherwise at the last style character or the name for null style. Separating
whitespace beyond the last component and a semicolon ignored by the common line
rule do not extend the range. The whole style can enclose a later-looking row or
class definition. [fixture: treemap/gram-written-tree] [fixture:
treemap/gram-class-empty-with-semicolon] [fixture: treemap/db-class-empty]
[fixture: treemap/gram-class-whitespace-style-null] [fixture:
treemap/directive-class-only-style-null] [fixture: treemap/db-style-whitespace]
[fixture: treemap/style-fields] [fixture:
treemap/lex-class-style-crosses-blank-line] [fixture:
treemap/lex-class-style-takes-next-class]

Common statements start at their keyword, excluding preceding padding. A title
ends at its value or its keyword for null; an accessibility line ends at its
value or colon for null; a block ends at its required first closing brace, even
when empty. No following EOL is part of the statement. [fixture:
treemap/lex-leading-padding-title-priority] [fixture:
treemap/common-title-one-space] [fixture: treemap/common-title-one-tab]
[fixture: treemap/common-title-directive-only] [fixture:
treemap/common-acctitle-eof] [fixture: treemap/common-description-eof] [fixture:
treemap/common-repeat-empty] [fixture: treemap/gram-title-block-node-adjacent]
[fixture: treemap/gram-description-block-acctitle-adjacent]

TreemapLiteral covers the authored line/style value, including owned padding, or
the block interior trimmed only at its outer common whitespace. Null fields have
no literal. Identifier covers only its name; StringLiteral includes both quotes;
NumericLiteral includes the entire written number, not just the prefix read for
value. Common trivia inside a value is omitted from value while raw and ranges
preserve the source. [fixture: treemap/common-title-two-spaces] [fixture:
treemap/common-acctitle-whitespace-only] [fixture:
treemap/common-description-whitespace-only] [fixture:
treemap/common-block-whitespace] [fixture: treemap/db-style-whitespace]
[fixture: treemap/common-block-directive-only] [fixture:
treemap/common-block-comment-only] [fixture: treemap/gram-written-tree]
[fixture: treemap/db-number-multiple-dots] [fixture:
treemap/directive-name-middle] [fixture: treemap/directive-style] [fixture:
treemap/common-block-comment] [fixture: treemap/style-fields]

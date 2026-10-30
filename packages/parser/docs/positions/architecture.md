# Architecture positions

Japanese version: [architecture.ja.md](./architecture.ja.md)

Ranges follow the
[architecture node specification](../../../spec/docs/ast/architecture.md#nodes),
using original UTF-16 offsets and source line endings. Root covers the whole
input. [fixture: architecture/gram-written-tree] [fixture:
architecture/line-crlf]

## Ranges

ArchitectureDiagram starts at its first retained pre-header form, or at the
header when none, and ends with its last written form. Outside padding, passed
bare lines and their accompanying trivia, comments and the appended LF do not
extend it. textBeforeHeader owns retained YAML and second-scan native
directives. [fixture: architecture/header-beta] [fixture:
architecture/detect-retained-before-second-scan] [fixture:
architecture/detect-two-second-scan-forms] [fixture:
architecture/detect-empty-braces-bare] [fixture:
architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/end-statements-comments]

A declaration starts at group, service or junction, and ends at the last present
parent ID, label closer, icon closer or declaration ID, extended through its
last hidden suffix before visible EOL. Junctions have no icon or label. Hidden
forms before a present optional component belong to that component's gap;
otherwise they belong to the next present component or textAfter. [fixture:
architecture/gram-written-tree] [fixture: architecture/header-inline-group]
[fixture: architecture/header-inline-service] [fixture:
architecture/header-inline-junction] [fixture:
architecture/hidden-directive-unit-gaps] [fixture:
architecture/hidden-yaml-parent-gap] [fixture:
architecture/hidden-yaml-group-eof] [fixture:
architecture/hidden-yaml-service-eof] [fixture:
architecture/hidden-yaml-junction-eof]

An edge starts at its left ID and ends at its right modifier's closing brace, or
right ID without a modifier, extended through textAfter. Its arrow covers both
port colons, including all internal gaps and its optional label. Named marker
and optional-component gaps are empty when those components are absent.
[fixture: architecture/db-mixed] [fixture: architecture/end-edge-eof] [fixture:
architecture/hidden-yaml-edge-eof] [fixture: architecture/hidden-yaml-edge-gaps]
[fixture: architecture/gram-hidden-modifier-gaps] [fixture:
architecture/hidden-directive-unit-gaps]

An alignment starts at align and ends with its last member ID, extended through
textAfter. Each member starts at its first preceding hidden form, or at its ID
when none, and ends with its ID. Member and statement order remain authored
order. [fixture: architecture/db-align-forward-repeat] [fixture:
architecture/hidden-yaml-align-gap] [fixture:
architecture/hidden-directive-align-eof] [fixture:
architecture/hidden-directive-unit-gaps]

Identifiers exclude icon parentheses. Text icons are StringLiteral nodes
covering both quotes, with raw equal to their exact source slice. Labels cover
both brackets; their value excludes only the brackets for kind text, and also
the matching quotes for kind string. Padding inside a bare label is retained.
[fixture: architecture/lex-icon-leading-symbols] [fixture:
architecture/directive-icon-delimiters] [fixture:
architecture/lex-string-conversion] [fixture: architecture/db-empty-values]
[fixture: architecture/lex-title-quoted-brackets] [fixture:
architecture/lex-title-padded-quotes] [fixture:
architecture/lex-title-unclosed-quote-with-close]

Common statements start at their keyword. Title ends with its value, or its
keyword when null; accessibility lines end with their value, or colon when null.
Description blocks end with their first closing brace, even with null content.
Each extends through textAfter before the first visible EOL; later hidden forms
belong to body. ArchitectureLiteral covers its line content with padding, or its
block content trimmed only at the outer ends. Null values have no leaf.
[fixture: architecture/common-repeat-empty] [fixture:
architecture/lex-title-one-space-null] [fixture:
architecture/lex-title-two-spaces-literal] [fixture:
architecture/lex-acctitle-whitespace-only] [fixture:
architecture/lex-description-line-whitespace-only] [fixture:
architecture/lex-description-block-whitespace-only] [fixture:
architecture/common-description-block-directive] [fixture:
architecture/common-description-block-comment] [fixture:
architecture/common-block-whitespace] [fixture:
architecture/hidden-directive-title-eof] [fixture:
architecture/hidden-directive-acctitle-eof] [fixture:
architecture/hidden-directive-accdescr-eof] [fixture:
architecture/hidden-directive-block-eof] [fixture:
architecture/lex-hidden-after-visible-eol]

ArchitectureIgnoredText covers its opener through the selected closer, excluding
preceding padding and the consumed following LF. A three-fence match is one
node; separate matches remain separate. Common directives, comment regions and
selected semicolons lie within spanning node ranges while values leave them out.
Source line endings remain authored. [fixture:
architecture/hidden-yaml-open-padding] [fixture:
architecture/hidden-yaml-three-fences] [fixture:
architecture/lex-yaml-two-nonempty] [fixture:
architecture/lex-hidden-two-suffixes] [fixture: architecture/hidden-yaml-crlf]
[fixture: architecture/hidden-directive-crlf] [fixture:
architecture/hidden-directive-eof] [fixture:
architecture/lex-yaml-global-directive] [fixture:
architecture/lex-yaml-common-comment] [fixture:
architecture/lex-yaml-selected-semicolon] [fixture:
architecture/directive-fields] [fixture: architecture/style-fields]

# Eventmodeling positions

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

Ranges implement the [authored tree](../../../spec/docs/ast/eventmodeling.md) in
original UTF-16 offsets. Root covers the entire source; authored CR/CRLF and
unconverted payload spelling remain intact. [fixture:
eventmodeling/gram-written-tree] [fixture: eventmodeling/line-cr] [fixture:
eventmodeling/line-crlf] [fixture: eventmodeling/entity-common] [fixture:
eventmodeling/html-common]

## Ranges

EventmodelingDiagram starts at the first retained textBeforeHeader form, or the
header, and ends at the final body item or header end. Passed bare lines,
outside padding and native comments do not extend it. A hidden form after a
completed final statement is a body item. [fixture: eventmodeling/header-only]
[fixture: eventmodeling/detect-real-retained-secondscan] [fixture:
eventmodeling/detect-retained-bare-ls-line] [fixture:
eventmodeling/comment-native] [fixture:
eventmodeling/lex-native-directive-object-eof]

Frames start at tf/timeframe or rf/resetframe and end at their last data,
dataReference, source reference or qualified name. A following optional
component owns its preceding hidden forms; absent optional components leave
those forms in body. Required-component gaps belong to the named fields.
Model/data entity declarations and notes start at their keyword and end at their
name or required block. [fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/lex-hidden-frame-type-gap] [fixture:
eventmodeling/lex-hidden-frame-entity-gap] [fixture:
eventmodeling/lex-hidden-frame-optional-gaps] [fixture:
eventmodeling/hidden-yaml-after-frame] [fixture:
eventmodeling/lex-hidden-yaml-name-gap] [fixture:
eventmodeling/lex-hidden-data-name-gap] [fixture:
eventmodeling/lex-hidden-note-frame-gap]

QualifiedName runs from its head to its last segment. Each tail member starts at
its first textBeforeDot form, otherwise its dot, and ends at its name.
SourceReference and DataReference start at their first textBefore form,
otherwise ->> or [[, and end at the frame name or ]]. Arrow covers all of ->>;
Identifiers cover individual name/digit-string atoms. [fixture:
eventmodeling/lex-qualified-hidden-components] [fixture:
eventmodeling/space-qualified-name] [fixture:
eventmodeling/lex-hidden-source-frame-gap] [fixture:
eventmodeling/lex-hidden-reference-name-close] [fixture:
eventmodeling/db-source-leading-zero]

InlineData and DataBlock start at their first textBefore form, otherwise tag
backtick or body opener, and end at the body's closer. Each tag gap has its own
field. A block's consumed following LF is outside the node. Literal covers the
entire surviving brace interior, including padding and line endings; a block
always has a non-null value. Inline empty braces have null value, while empty
quoted data keeps StringLiteral with its quotes and exact raw spelling.
[fixture: eventmodeling/lex-hidden-type-tag] [fixture:
eventmodeling/lex-hidden-data-tag-gaps] [fixture:
eventmodeling/lex-block-empty-whitespace] [fixture:
eventmodeling/data-block-close-eof] [fixture:
eventmodeling/data-block-close-space] [fixture:
eventmodeling/lex-block-close-ps-boundary] [fixture:
eventmodeling/lex-inline-empty] [fixture: eventmodeling/directive-string-middle]

GWT starts at gwt and ends at its last then item. Clauses/items start at their
first textBefore form, otherwise their keyword/type word, and end at their last
item/name. Leading forms belong to the following item/clause; forms after the
final then item return to body. There is no EOL-owned suffix. [fixture:
eventmodeling/lex-hidden-gwt-required-gaps] [fixture:
eventmodeling/lex-hidden-gwt-clause] [fixture:
eventmodeling/lex-hidden-gwt-items] [fixture:
eventmodeling/lex-hidden-gwt-item-gap] [fixture:
eventmodeling/gram-gwt-next-top-level] [fixture:
eventmodeling/lex-native-directive-object-eof]

Common statements start at their keyword, excluding leading indentation. Lines
end at their last payload character, or keyword/colon for null payload; a block
ends at its first closing brace. Literal starts after title's one ASCII
separator or the accessibility colon, or inside the block braces, and preserves
all further spacing. Null payloads have no leaf; whitespace-only payloads do.
[fixture: eventmodeling/common-title-only] [fixture:
eventmodeling/common-title-empty] [fixture:
eventmodeling/lex-common-title-two-spaces] [fixture:
eventmodeling/common-acctitle-eof] [fixture:
eventmodeling/common-description-eof] [fixture:
eventmodeling/lex-common-block-whitespace-only] [fixture:
eventmodeling/gram-description-block-empty-after-removal]

IgnoredText covers its native opener through its closer, excluding preceding
padding and consumed following LF. Each match has exactly one owner. Payload and
ignored-text values omit common removals while ranges span internal removed
forms; no range includes the unwritten logical LF. [fixture:
eventmodeling/hidden-yaml-after-frame-space] [fixture:
eventmodeling/lex-hidden-yaml-fence-directive] [fixture:
eventmodeling/lex-native-directive-object-eof] [fixture:
eventmodeling/directive-block-middle] [fixture:
eventmodeling/data-block-close-eof]

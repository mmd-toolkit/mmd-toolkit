# Wardley positions

Japanese version: [wardley.ja.md](./wardley.ja.md)

Ranges follow the [Wardley nodes](../../../spec/docs/ast/wardley.md), using
original UTF-16 offsets and line endings. Root covers the entire input.
[fixture: wardley/db-all-fields] [fixture: wardley/line-crlf]

## Ranges

WardleyDiagram starts at its first textBeforeHeader form, or the header without
one, and ends at the last written header/body form. Passed bare lines and their
trivia, outer padding, comments and the appended LF do not extend it. Hidden
forms after the header belong to body. [fixture: common/detect-minimal-wardley]
[fixture: wardley/detect-real-before-retained-secondscan] [fixture:
wardley/retained-directive-between-bares] [fixture:
wardley/lex-hidden-header-no-eol] [fixture: wardley/tail-all-comments]

Statements start at their command word, or the source name of a link. They end
with the last written component, extended through the last textAfter form before
visible EOL. A pipeline includes its required closing brace; each child ends at
its bracket or label offset, extended through its own suffix. Hidden forms
following visible EOL belong to the containing body. A pipeline's textAfterOpen
ends before the mandatory visible opening LF. [fixture: wardley/db-all-fields]
[fixture: wardley/tail-all-spaces] [fixture: wardley/lex-hidden-two-suffixes]
[fixture: wardley/lex-hidden-pipeline-open-spare] [fixture:
wardley/lex-hidden-pipeline-child-spare] [fixture:
wardley/lex-hidden-pipeline-before-close] [fixture:
wardley/lex-hidden-after-visible-eol]

Coordinates cover both brackets and their authored contents. Decorations and
evolution stages start at their first textBefore form, or their first keyword,
parenthesis or name without one; each ends at its last written component,
extended through its specified suffix. Evolution includes its last stage's
suffix. Pending forms before an optional component belong to that component's
preceding gap only when it is present; otherwise the next required component or
suffix owns them. [fixture: wardley/hidden-all-unit-gaps] [fixture:
wardley/hidden-yaml-component-gaps] [fixture:
wardley/lex-hidden-evolution-members] [fixture: wardley/db-bare-link] [fixture:
wardley/lex-link-target-port-no-arrow] [fixture: wardley/db-inertia-forms]

WardleyIdentifier covers its bare name, including internal space/tab but no
outer padding. StringLiteral includes both quotes; NumericLiteral covers its
unsigned magnitude, leaving an offset minus outside raw. WardleyArrow covers its
whole glyph or flow plus through marker, and its flow-label child covers both
single quotes. [fixture: wardley/db-unquoted-names] [fixture:
wardley/lex-name-trailing-space] [fixture: wardley/number-offset-negative-zero]
[fixture: wardley/db-empty-texts] [fixture: wardley/line-string-values]
[fixture: wardley/directive-flow-before-label] [fixture:
wardley/directive-flow-after-label]

Common statements start at their keyword. Null title ends at its keyword, null
accessibility lines at their colon; otherwise line statements end at the final
value character. Blocks end at their first required closing brace. Each extends
through textAfter. WardleyLiteral covers all line padding after the title
separator, accessibility colon or label semicolon; block values trim only outer
common whitespace. Null values have no leaf. [fixture:
wardley/common-empty-literals] [fixture: wardley/common-title-tabs] [fixture:
wardley/common-line-whitespace] [fixture: wardley/common-block-whitespace]
[fixture: wardley/tail-link-spaced-label] [fixture:
wardley/lex-hidden-common-prefix-eol]

WardleyIgnoredText covers its opener through its qualifying closer, excluding
preceding padding and an immediately consumed following LF. Every match has
exactly one named owner. Values omit common removals while their ranges span
them. StringLiteral.raw and NumericLiteral.raw retain all source characters.
Internal authored line endings stay unchanged. [fixture:
wardley/hidden-yaml-crlf] [fixture: wardley/lex-hidden-directive-cr] [fixture:
wardley/lex-hidden-yaml-cr] [fixture: wardley/directive-native-opener-split]
[fixture: wardley/lex-hidden-yaml-comment-region] [fixture:
wardley/directive-every-field] [fixture: wardley/style-every-text]

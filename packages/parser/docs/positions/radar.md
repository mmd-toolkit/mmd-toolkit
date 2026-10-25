# Radar positions

Japanese version: [radar.ja.md](./radar.ja.md)

Ranges follow the [radar node specification](../../../spec/docs/ast/radar.md),
using original UTF-16 offsets and source line endings. Root covers the whole
input. [fixture: radar/gram-written-tree] [fixture: radar/line-crlf]

## Ranges

RadarDiagram starts at the first retained pre-header form, or at the header
without one, and ends with the last written header/body form. Outside padding,
comments, detection-passed trivia and the appended LF do not extend it.
textBeforeHeader owns retained YAML and second-scan directives; textBeforeColon
owns hidden forms only before a written separate colon. Without that colon,
post-header forms belong to body. [fixture: radar/detect-secondscan-native]
[fixture: radar/detect-yaml-before-secondscan-native] [fixture:
radar/header-separated-colon] [fixture: radar/header-colon-hidden] [fixture:
radar/header-colon-yaml] [fixture: radar/comment-header] [fixture:
radar/bare-line-ls] [fixture: common/detect-minimal-radar]

Axis and curve statements start at their keyword; options statements start at
the first option keyword. Each group ends with its last member, including that
member's hidden suffix. A member begins at its first textBefore form, or its
name/option keyword without one. An axis ends at its name or label's closing
bracket; a curve ends at its entry closing brace; an option ends at its value.
Each extends through textAfter. Commas remain punctuation between members.
[fixture: radar/gram-written-tree] [fixture: radar/gram-inline-statements]
[fixture: radar/lex-hidden-axis-comma] [fixture: radar/lex-hidden-curve-comma]
[fixture: radar/lex-hidden-option-comma] [fixture: radar/hidden-yaml-after-axis]
[fixture: radar/hidden-yaml-after-curve] [fixture:
radar/lex-hidden-two-suffixes]

A present label's gaps surround its opening bracket, string and closing bracket.
Absent labels have empty label-gap lists; following forms go to
textBeforeEntries for a curve or textAfter for an axis. Identifier ranges cover
names only; StringLiteral ranges cover their quotes and preserve raw;
NumericLiteral ranges cover their digits/dot and preserve raw. [fixture:
radar/gram-written-tree] [fixture: radar/db-empty-labels] [fixture:
radar/lex-curve-label-hidden-gaps] [fixture: radar/lex-hidden-before-label-open]
[fixture: radar/lex-hidden-before-label-close] [fixture:
radar/hidden-native-curve-gap] [fixture: radar/hidden-native-axis] [fixture:
radar/db-number-rounded] [fixture: radar/db-number-overflow]

Entries start at their first textBefore form, or their number/axis reference,
and end with their number or last textAfter form. Interior forms stay in entry
gaps across the permitted leading/trailing newlines. A named entry with a colon
has textBeforeColon before it and textBeforeValue after it; without a colon,
textBeforeColon is empty and textBeforeValue owns the whole gap. [fixture:
radar/lex-hidden-before-first-entry] [fixture:
radar/lex-hidden-before-entries-close] [fixture: radar/lex-hidden-entry-comma]
[fixture: radar/lex-number-entry-hidden-across-lines] [fixture:
radar/lex-named-entry-hidden-across-lines] [fixture:
radar/lex-hidden-detailed-before-colon] [fixture:
radar/lex-hidden-detailed-no-colon]

Common statements start at their keyword. Title ends at its value, or keyword
for null; accessibility lines end at their value, or colon for null; blocks end
at their first closing brace. Each extends through textAfter before visible EOL;
later hidden forms belong to body. RadarLiteral covers all line-value padding or
the block value trimmed only at the outer ends; null has no leaf. [fixture:
radar/common-repeat-empty] [fixture: radar/lex-common-title-one-space] [fixture:
radar/lex-common-title-two-spaces] [fixture: radar/lex-common-empty-values]
[fixture: radar/common-block-whitespace] [fixture:
radar/lex-common-description-only-directive] [fixture:
radar/lex-common-description-only-comment] [fixture:
radar/hidden-native-title-eof] [fixture: radar/hidden-native-acctitle-eof]
[fixture: radar/hidden-native-description-eof] [fixture:
radar/hidden-native-eof] [fixture: radar/lex-hidden-after-visible-eol]

RadarIgnoredText covers its opener through its selected qualifying closer,
excluding preceding padding and the consumed following LF. One match has one
owner. Common directives, comment regions and selected semicolons are omitted
from values while node ranges span them; authored source line endings remain.
[fixture: radar/lex-hidden-padding] [fixture: radar/hidden-yaml-adjacent-eof]
[fixture: radar/detect-retained-three-native] [fixture:
radar/lex-hidden-yaml-two-nonempty] [fixture: radar/hidden-yaml-crlf] [fixture:
radar/lex-hidden-yaml-global-inside] [fixture:
radar/lex-hidden-yaml-content-common-comment] [fixture:
radar/lex-hidden-native-content-common-comment] [fixture:
radar/lex-hidden-yaml-opener-selected-control] [fixture:
radar/lex-hidden-native-opener-selected]

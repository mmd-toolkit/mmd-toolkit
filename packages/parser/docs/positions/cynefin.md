# Cynefin positions

Japanese version: [cynefin.ja.md](./cynefin.ja.md)

Ranges follow the
[authored node specification](../../../spec/docs/ast/cynefin.md), using original
UTF-16 offsets and source line endings. Root covers the whole input. [fixture:
cynefin/db-all-fields] [fixture: cynefin/line-crlf]

## Ranges

CynefinDiagram starts at the first retained pre-header form, or the header
without one, and ends with the last written header/body form. textBeforeHeader
holds native retained YAML and second-scan directives; passed bare lines and
accompanying trivia remain outside those nodes. [fixture:
cynefin/detect-real-before-retained-secondscan] [fixture:
cynefin/detect-retained-secondscan-bare-ls] [fixture:
cynefin/lex-title-one-space] [fixture: common/detect-minimal-cynefin]

A domain statement starts at its domain word and ends at its last item, last
textAfterName form, or the word alone. textAfterName stops before the first
visible LF or next visible unit. An item starts at its first textBefore form or
opening quote and ends at its last textAfter form or closing quote. Immediate
suffixes belong to the name/item before visible LF; forms after it belong to an
actual next item of that block, otherwise to Diagram.body. Native consumption is
decided before locating visible LF. [fixture: cynefin/gram-domain-empty-eof]
[fixture: cynefin/hidden-domain-empty-suffix] [fixture:
cynefin/hidden-domain-item-members] [fixture:
cynefin/hidden-before-first-item-after-eol] [fixture:
cynefin/hidden-item-after-visible-eol] [fixture:
cynefin/hidden-domain-end-after-visible-eol] [fixture:
cynefin/hidden-empty-domain-after-visible-eol]

A transition starts at from and ends at the last textAfter form, label closer,
or target word. Its arrow covers the whole -->. Each named gap owns only its
whole hidden forms. Without a colon/string pair, both label-gap lists are empty
and forms after the target belong to textAfter. StringLiteral includes its
quotes, including empty strings, and raw is its exact source spelling. Required
visible EOL remains outside the statement. [fixture:
cynefin/hidden-all-unit-gaps] [fixture:
cynefin/hidden-unlabeled-transition-gaps] [fixture:
cynefin/hidden-two-transition-suffixes] [fixture: cynefin/db-empty-texts]
[fixture: cynefin/lex-string-conversion] [fixture:
cynefin/hidden-after-visible-eol]

Common statements start at their keyword. A title ends at its value, or at its
keyword when value is null. Accessibility lines end at their value or colon;
blocks at their first closing brace. Each extends through its native suffix
before visible EOL; forms after EOL belong to body. CynefinLiteral keeps
line-value padding; block literals trim common whitespace only at the outer
ends. Null values have no leaf. [fixture: cynefin/common-title-eof] [fixture:
cynefin/lex-title-one-space] [fixture: cynefin/common-title-comment-only]
[fixture: cynefin/common-title-directive-only] [fixture:
cynefin/lex-title-one-tab] [fixture: cynefin/lex-title-two-spaces] [fixture:
cynefin/common-line-whitespace] [fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-repeat-empty] [fixture: cynefin/hidden-title-suffix]
[fixture: cynefin/hidden-acctitle-suffix] [fixture:
cynefin/hidden-description-suffix] [fixture: cynefin/hidden-block-suffix]
[fixture: cynefin/hidden-common-after-visible-eol]

CynefinIgnoredText covers its opener through its qualifying closer, excluding
opener padding and a consumed following line break. One native match has one
owner. Values omit common removals while ranges span them; authored CR/CRLF
spelling remains. [fixture: cynefin/hidden-yaml-opener-padding] [fixture:
cynefin/hidden-yaml-adjacent-later] [fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-directive-cr] [fixture: cynefin/hidden-directive-crlf]
[fixture: cynefin/hidden-yaml-bare-cr] [fixture:
cynefin/hidden-yaml-common-directive] [fixture:
cynefin/hidden-yaml-comment-region]

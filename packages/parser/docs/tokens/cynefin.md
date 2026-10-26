# Cynefin tokens

Japanese version: [cynefin.ja.md](./cynefin.ja.md)

The lexer follows the specification's
[first-match order](../../../spec/docs/diagrams/cynefin.md#ordered-units). The
colon header precedes the bare header; domain words have no suffix boundary.
There are no longer alternatives or general identifier/number terminals.
Composite matches split at authored components. [fixture:
cynefin/header-colon-inline] [fixture: cynefin/gram-glued-domains] [fixture:
cynefin/lex-domain-title-priority] [fixture: cynefin/domain-digit]

## Tokens

| Kind         | Items                                                           | Fixtures                                                                                                                       |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | Header word, fixed domain words and common keywords.            | [fixture: cynefin/db-all-fields]                                                                                               |
| `Punctuator` | Header/label/accessibility colon, whole arrow and block braces. | [fixture: cynefin/header-colon] [fixture: cynefin/db-all-fields]                                                               |
| `String`     | Item and transition-label strings, with their matching quotes.  | [fixture: cynefin/db-empty-texts] [fixture: cynefin/lex-string-conversion] [fixture: cynefin/lex-transition-string-conversion] |
| `RawText`    | Common values and whole native hidden forms.                    | [fixture: cynefin/common-repeat-empty] [fixture: cynefin/hidden-all-unit-gaps]                                                 |

The two header forms use one Keyword for cynefin-beta. Only the attached colon
form has a separate Punctuator. A global directive may separate these
components; ASCII padding or a native hidden form cannot. [fixture:
cynefin/header-only] [fixture: cynefin/header-colon-inline] [fixture:
cynefin/header-global-before-colon] [fixture: cynefin/header-spaced-colon]
[fixture: cynefin/native-header-word-colon]

Line-value RawText keeps all padding after title's single ASCII separator or an
accessibility colon. A separator alone adds no value token; whitespace-only
remaining line content does. Block values trim common whitespace at the outer
ends; empty or common-removal-only blocks add no value token. Quotes in common
values remain RawText. [fixture: cynefin/lex-title-one-space] [fixture:
cynefin/lex-title-one-tab] [fixture: cynefin/lex-title-two-spaces] [fixture:
cynefin/common-line-whitespace] [fixture: cynefin/common-block-whitespace]
[fixture: cynefin/common-block-comment-only] [fixture:
cynefin/common-block-directive-only] [fixture: cynefin/common-quoted-values]

A native hidden form is one RawText item through its qualifying closer,
excluding opener padding and a consumed following line break. The body-present
YAML alternative precedes the empty-body alternative. Earlier strings and common
values enclose native-looking text. [fixture:
cynefin/hidden-yaml-opener-padding] [fixture:
cynefin/hidden-yaml-adjacent-later] [fixture: cynefin/hidden-yaml-two-nonempty]
[fixture: cynefin/hidden-directive-adjacent] [fixture:
cynefin/hidden-directive-string] [fixture: cynefin/hidden-yaml-block] [fixture:
cynefin/hidden-directive-crlf]

Shared directives, comment regions and selected semicolons cut String and
RawText items; String pieces become StringFragment. A cut inside a fixed word or
whole arrow rejects. Authored component boundaries and value interiors permit
cuts, including individual native fence punctuation. [fixture:
cynefin/directive-every-field] [fixture: cynefin/comment-line-in-string]
[fixture: cynefin/selected-string-interior] [fixture:
cynefin/directive-domain-inside] [fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/semicolon-complex-inside] [fixture:
cynefin/semicolon-arrow-inside] [fixture: cynefin/directive-transition-parts]
[fixture: cynefin/directive-title-parts] [fixture:
cynefin/directive-description-brace] [fixture:
cynefin/directive-native-yaml-components] [fixture:
cynefin/selected-native-directive-closer]

## Comments and trivia

ASCII spaces/tabs between units, visible newlines and the appended LF have no
tokens. A native %% comment ends before CR/LF. Passed bare lines become shared
Comments, and accompanying trivia is not read again, including between retained
forms. [fixture: cynefin/space-tabs] [fixture: cynefin/space-lines] [fixture:
cynefin/comment-native-between-items] [fixture: cynefin/comment-native-triple]
[fixture: cynefin/detect-retained-secondscan-bare-ls] [fixture:
cynefin/detect-retained-secondscan-bare-ps]

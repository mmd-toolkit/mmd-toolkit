# Treeview tokens

Japanese version: [treeview.ja.md](./treeview.ja.md)

The lexer follows the specification's
[ordered units](../../../spec/docs/diagrams/treeview.md#ordered-units). Only the
header compares a longer bare-name alternative. There is no imported common
grammar, native YAML, hidden directive or visible newline unit. ASCII
indentation precedes hidden whitespace, so no separate hidden-whitespace reader
is used. [fixture: treeview/header-only] [fixture:
treeview/header-nbsp-custom-boundary] [fixture: treeview/gram-body-yaml]
[fixture: treeview/detect-secondscan-singleline] [fixture:
treeview/gram-quoted-tail-space-next-indent]

## Tokens

| Kind         | Items                                                            | Fixtures                                                                                     |
| ------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Keyword`    | Header, common keywords and annotation `icon`.                   | [fixture: treeview/gram-written-tree]                                                        |
| `Identifier` | Complete class names and icon references.                        | [fixture: treeview/annotation-class-digit] [fixture: treeview/annotation-icon-leading-colon] |
| `Punctuator` | `:::`, `##`, each parenthesis, common colon and braces.          | [fixture: treeview/gram-written-tree]                                                        |
| `String`     | Whole quoted names, including both quotes.                       | [fixture: treeview/db-empty-names] [fixture: treeview/text-double-crlf]                      |
| `RawText`    | Bare names, common/description values, prefixes and decorations. | [fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]                   |

An outer branch prefix is one RawText item, including its internal whitespace.
It runs from the line's first non-whitespace character through the branch and
its adjacent dash run. Leading whitespace and separating ASCII spaces/tabs have
no tokens; assigned indentation creates no synthetic tokens. Prefix text is not
reclassified as keywords or annotations. Each branch and dash is a separate
authored component, so common trivia between them is allowed and cuts this
RawText item under the shared contract. [fixture: treeview/box-written-tree]
[fixture: treeview/box-prefix-arbitrary] [fixture: treeview/box-branch-no-dash]
[fixture: treeview/box-branch-directive-parts] [fixture:
treeview/box-dash-selected-semicolon] [fixture:
treeview/box-prefix-directive-column]

Bare-name and description-text items keep their owned trailing whitespace. Title
text begins after exactly one ASCII separator, accessibility line text
immediately after the colon, and block text immediately inside the braces. All
surviving payload whitespace is token text, including whitespace-only values.
Empty or shared-removal-only payloads have no text item; empty quoted names
still have a String item. [fixture: treeview/db-bare-tail-space] [fixture:
treeview/db-description-tail-space] [fixture: treeview/gram-written-tree]
[fixture: treeview/ast-common-whitespace-values] [fixture:
treeview/ast-common-removal-only-values] [fixture:
treeview/ast-description-removal-only] [fixture: treeview/ast-icon-removal-only]
[fixture: treeview/db-empty-names]

The direct box rules exclude a branch line's trailing common whitespace from
lexing. Inside an open quoted name or block, authored prefixes, decorations and
enclosed excluded padding remain in the enclosing String or RawText item, with
no overlapping box items. An outer decoration instead has one RawText item from
its first through last non-whitespace character, excluding its following LF.
[fixture: treeview/box-tail-branch-no-carry] [fixture:
treeview/box-trim-unicode-tail] [fixture: treeview/box-multiline-name-tail-trim]
[fixture: treeview/box-quoted-decoration] [fixture:
treeview/box-block-decoration] [fixture: treeview/box-unicode-decoration]

Shared directives, comment regions and selected semicolons cut RawText and
String items; String pieces become StringFragment. Cuts inside header/common
keywords, `icon`, class names, whole icon references, `:::` or `##` reject.
Trivia between complete components is allowed without supplying missing
whitespace. Branch and dash components can be separated by that trivia.
[fixture: treeview/directive-bare-middle] [fixture:
treeview/directive-double-middle] [fixture: treeview/common-block-comments]
[fixture: treeview/directive-header-inside] [fixture:
treeview/directive-acctitle-inside] [fixture:
treeview/directive-icon-word-inside] [fixture:
treeview/directive-class-value-inside] [fixture:
treeview/directive-icon-value-inside] [fixture: treeview/directive-class-inside]
[fixture: treeview/semicolon-description-inside] [fixture:
treeview/directive-icon-parts-parts] [fixture:
treeview/icon-name-close-semicolon] [fixture:
treeview/box-dash-directive-inside]

## Comments and trivia

At a native unit start, `%%` through before LF is a shared Comment with mark
`%%`; U+2028/U+2029 and apparent closers remain comment content. An enclosing
bare/quoted name, description annotation or block instead owns that text; common
line values stop before it. [fixture: treeview/native-comment-ls] [fixture:
treeview/native-comment-ps] [fixture: treeview/native-comment-closer-greedy]
[fixture: treeview/comment-in-bare] [fixture: treeview/comment-in-quotes]
[fixture: treeview/tail-description-comment] [fixture:
treeview/common-block-bare-percent] [fixture:
treeview/common-title-percent-boundary]

Ordinary indentation and hidden LF make no tokens. Passed bare percent lines are
shared Comments, and their accompanying trivia is not read again. Retained
single-line second-scan forms use the native Comment rule; source directives
inside remain shared Directives. The logical appended LF is not authored token
text. [fixture: treeview/db-tabs-one-unit] [fixture:
treeview/gram-body-hidden-eof] [fixture: treeview/bare-line-space] [fixture:
treeview/detect-secondscan-bare-unicode] [fixture:
treeview/detect-bare-before-secondscan] [fixture:
treeview/comment-native-mark-directive]

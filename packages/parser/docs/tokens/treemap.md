# Treemap tokens

Japanese version: [treemap.ja.md](./treemap.ja.md)

Tokens follow the specification's
[ordered rules](../../../spec/docs/diagrams/treemap.md#ordered-rules), taking
its first applicable complete match. Composite common forms and class
definitions split at authored component boundaries. [fixture:
treemap/gram-written-tree] [fixture: treemap/lex-class-name-title-prefix]

## Tokens

| Kind         | Items                                                             | Fixtures                                                                                                                     |
| ------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | Header, classDef and common keywords.                             | [fixture: treemap/gram-written-tree] [fixture: treemap/header-beta]                                                          |
| `Identifier` | Class names and selectors.                                        | [fixture: treemap/gram-written-tree] [fixture: treemap/lex-selector-single-letter] [fixture: treemap/gram-selector-keywords] |
| `Numeric`    | A complete digit/underscore/dot/comma run.                        | [fixture: treemap/db-number-mixed] [fixture: treemap/lex-number-commas-before-next-node]                                     |
| `String`     | A complete quoted name, including empty names.                    | [fixture: treemap/db-empty-names] [fixture: treemap/lex-string-conversion]                                                   |
| `Punctuator` | Each `:::`, colon, comma, class terminator and description brace. | [fixture: treemap/gram-written-tree] [fixture: treemap/gram-class-empty-with-semicolon]                                      |
| `RawText`    | Whole class styles and common values.                             | [fixture: treemap/db-style-whitespace] [fixture: treemap/common-repeat-empty]                                                |

Both header spellings are single Keyword items. The class marker is one
Punctuator item; its three colons are indivisible. A number keeps its full
spelling even when its numeric value reads only a prefix, rounds, becomes NaN or
overflows. [fixture: treemap/header-beta] [fixture:
treemap/spec-treemap-test-ts-892fa294] [fixture:
treemap/div-directive-style-marker] [fixture: treemap/db-number-underscore]
[fixture: treemap/db-number-rounded] [fixture: treemap/db-number-nan] [fixture:
treemap/db-number-overflow]

Line values keep all padding after title's one ASCII separator or an
accessibility colon. Empty content has no value token; whitespace-only line
content has one. Block values trim common whitespace only at their outer ends;
empty and common-trivia-only blocks have no value token. Class styles exclude
the maximal separating whitespace and terminating semicolon, retaining their own
trailing whitespace. [fixture: treemap/common-title-one-space] [fixture:
treemap/common-title-one-tab] [fixture: treemap/common-title-two-spaces]
[fixture: treemap/common-title-directive-only] [fixture:
treemap/common-acctitle-whitespace-only] [fixture:
treemap/common-description-whitespace-only] [fixture:
treemap/common-block-whitespace] [fixture: treemap/common-block-whitespace-only]
[fixture: treemap/common-block-directive-only] [fixture:
treemap/common-block-comment-only] [fixture: treemap/db-style-whitespace]
[fixture: treemap/directive-class-only-style-null]

Shared directives, comment regions and selected semicolons cut RawText and
String items; string pieces become StringFragment. Cuts inside Keyword,
Identifier, Numeric or Punctuator atoms reject. A cut between complete
components remains trivia and cannot supply missing whitespace. [fixture:
treemap/directive-style] [fixture: treemap/directive-name-middle] [fixture:
treemap/common-block-comment] [fixture: treemap/style-fields] [fixture:
treemap/directive-header-middle] [fixture: treemap/directive-class-name]
[fixture: treemap/directive-number] [fixture:
treemap/div-directive-style-marker] [fixture:
treemap/div-semicolon-selector-atom] [fixture:
treemap/div-semicolon-number-atom] [fixture:
treemap/directive-class-keyword-name-gap] [fixture:
treemap/directive-class-keyword-missing-space]

## Comments and trivia

Indentation is a maximal ASCII space/tab unit with no token, including a run on
an earlier line or joined across a directive. Separate runs across hidden
newlines stay separate. There is no general hidden whitespace rule that can
consume an extra indentation unit. [fixture: treemap/db-tabs-count] [fixture:
treemap/db-header-tail-space] [fixture: treemap/db-leaf-tail-tab] [fixture:
treemap/gram-indent-from-whitespace-line] [fixture:
treemap/gram-indent-around-global-directive] [fixture:
treemap/gram-two-indent-runs] [fixture: treemap/gram-header-trailing-indent-eof]

Native comments have mark `%%`, start at its first percent and end before the
next physical line terminator; LS/PS remain content. Newlines and the appended
LF have no tokens. Detection-passed bare lines are Comments; their accompanying
trivia is not read again, even around retained prefixes. Retained single-line
second-scan forms are native Comments, without another Directive or hidden node.
[fixture: treemap/comment-native-crlf-ending] [fixture: treemap/comment-ls]
[fixture: treemap/comment-ps] [fixture: treemap/hidden-comment-no-lf] [fixture:
treemap/hidden-comment-eof] [fixture: treemap/detect-retained-bare-lf-control]
[fixture: treemap/div-retained-before-bare-unicode-line] [fixture:
treemap/div-bare-retained-ascii-header] [fixture:
treemap/detect-second-scan-single-line-comment]

A statement owned by statementsBefore keeps all its original items and token
boundaries. Section children add no tokens; enclosed style content remains one
literal rather than another gap entry. [fixture: treemap/gram-written-tree]
[fixture: treemap/gram-nesting-statement-before-section] [fixture:
treemap/lex-class-style-crosses-blank-line] [fixture:
treemap/gram-nesting-statements-directive-inline]

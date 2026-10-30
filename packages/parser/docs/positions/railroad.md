# Railroad positions

Japanese version: [railroad.ja.md](./railroad.ja.md)

All four dialects use the ranges and child order of the
[railroad source tree](../../../spec/docs/ast/railroad.md), in original UTF-16
offsets. Root covers the complete source. Shared conversions do not rewrite
source line endings, quotes, escapes or raw numeric spelling. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree] [fixture:
railroad/peg-gram-written-tree] [fixture: railroad/ir-line-string-values]
[fixture: railroad/abnf-db-repeat-leading-zero]

## Ranges

| Nodes                                          | Endpoints                                                                                    | Fixtures                                                                                                                                                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RailroadDiagram                                | First retained opener or header through last body item, or header end.                       | [fixture: railroad/ir-secondscan-real] [fixture: railroad/ir-yaml-before-secondscan-real] [fixture: railroad/ir-header-only] [fixture: railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture: railroad/peg-header-only] |
| RailroadRule                                   | Name through required visible semicolon.                                                     | [fixture: railroad/ir-native-ownership] [fixture: railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                       |
| Four metadata statements                       | Keyword through value, keyword/colon for null line value, required closing brace for blocks. | [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ebnf-common-whitespace-shapes] [fixture: railroad/abnf-common-whitespace-shapes] [fixture: railroad/peg-common-whitespace-shapes]                                       |
| RailroadLiteral                                | Owned line text including padding, or outer-trimmed block text.                              | [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ir-common-block-directive-only] [fixture: railroad/ir-common-block-comment-only]                                                                                        |
| RailroadIgnoredText                            | Native opener through selected closer, excluding consumed following LF.                      | [fixture: railroad/ir-hidden-yaml-adjacent-later] [fixture: railroad/ir-hidden-yaml-eof] [fixture: railroad/ir-hidden-directive-multiline] [fixture: railroad/ir-hidden-directive-eof]                                                     |
| RailroadExpressionMember                       | First owned form or expression through last owned form or expression; excludes separator.    | [fixture: railroad/ir-native-ownership] [fixture: railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                       |
| Eight IR calls                                 | Constructor through required closing parenthesis.                                            | [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ir-db-singletons]                                                                                                                                                              |
| Natural choice and sequence                    | First expression through last expression, without outer hidden forms.                        | [fixture: railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                                                               |
| Three group expressions                        | Opener through required closer, including interior hidden gaps.                              | [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]                                                                                                            |
| Postfix / exception                            | Operand start through symbol / right-primary end.                                            | [fixture: railroad/ebnf-exception-leftfold] [fixture: railroad/ebnf-native-ownership] [fixture: railroad/peg-native-ownership]                                                                                                             |
| RailroadSpecialSequence                        | Opening through closing question mark.                                                       | [fixture: railroad/ebnf-special-whitespace] [fixture: railroad/ebnf-hidden-directive-special]                                                                                                                                              |
| RailroadRepeatExpression / RailroadRepeatRange | Repeat start through primary end / last written count or star.                               | [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/abnf-native-ownership] [fixture: railroad/abnf-directive-repeat]                                                                                                             |
| RailroadNumericValue                           | Percent through last matched hexadecimal digit, including internal common trivia in range.   | [fixture: railroad/abnf-numval-boundaries] [fixture: railroad/abnf-directive-numval-digits] [fixture: railroad/abnf-semicolon-numval-text]                                                                                                 |
| Predicate / any                                | Prefix through complete suffix operand / single dot.                                         | [fixture: railroad/peg-gram-written-tree] [fixture: railroad/peg-native-ownership]                                                                                                                                                         |
| Shared leaves                                  | Name, both string quotes, or every written decimal digit.                                    | [fixture: railroad/ir-db-empty-strings] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/abnf-db-repeat-overflow]                                                                                                             |

Hidden forms follow the tree's
[named gap ownership](../../../spec/docs/ast/railroad.md#gap-ownership).
Expression cores exclude outer forms owned by a parent. List members hold
separator gaps on their respective sides; adjacency puts the entire gap on the
following member. Comments, outside padding, detection-passed trivia and the
appended LF do not extend a node. [fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership] [fixture:
railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]
[fixture: railroad/ir-retained-bare-secondscan-unicode] [fixture:
railroad/ir-tail-comment] [fixture: railroad/ir-header-only]

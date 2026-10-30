# Railroad tokens

Japanese version: [railroad.ja.md](./railroad.ja.md)

All four dialects follow their own
[first-match lexical order](../../../spec/docs/diagrams/railroad.md#lexical-structure).
They share metadata and hidden-form character rules, without importing a common
EOL grammar. [fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

## Tokens

| Kind         | Items                                                                                                   | Fixtures                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | Each exact lowercase header, IR constructor and metadata keyword.                                       | [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]       |
| `Identifier` | Declaration names and natural references.                                                               | [fixture: railroad/ir-keywords-long-rule-name] [fixture: railroad/ebnf-name-dash] [fixture: railroad/abnf-db-prototype-names] [fixture: railroad/peg-db-prototype-names]       |
| `Numeric`    | Each complete decimal ABNF count, including leading zeroes.                                             | [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/abnf-db-repeat-leading-zero] [fixture: railroad/abnf-db-repeat-overflow]                                         |
| `String`     | A complete quoted string, including both quotes and empty strings.                                      | [fixture: railroad/ir-db-empty-strings] [fixture: railroad/ebnf-db-empty-string] [fixture: railroad/abnf-db-empty-string] [fixture: railroad/peg-db-empty-string]              |
| `Punctuator` | Each assignment, delimiter, separator, prefix, postfix, repeat star and PEG dot.                        | [fixture: railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree] [fixture: railroad/peg-gram-written-tree]       |
| `RawText`    | Metadata values, whole native hidden forms, whole EBNF special sequences and whole ABNF numeric values. | [fixture: railroad/ir-common-whitespace-shapes] [fixture: railroad/ir-native-ownership] [fixture: railroad/ebnf-special-whitespace] [fixture: railroad/abnf-numval-boundaries] |

`::=` and `<-` are single atoms. An ABNF star repeat splits into its written
minimum, star and maximum; omitted counts create no token. Numeric values are
text, not counts, and retain their base letter and separators in one item.
[fixture: railroad/ebnf-div-directive-assignment] [fixture:
railroad/peg-directive-operator] [fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/abnf-db-repeat-implicit-zero] [fixture:
railroad/abnf-directive-repeat] [fixture: railroad/abnf-numval-boundaries]

Line metadata keeps padding after title's one ASCII separator or an
accessibility colon. Block metadata trims only outer Notation whitespace. Empty
values have no token; whitespace-only line values have a RawText token.
[fixture: railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture:
railroad/ir-common-block-directive-only] [fixture:
railroad/ir-common-block-comment-only]

Shared directives and selected semicolons cut String and RawText items; cut
strings have StringFragment tokens. Cuts inside headers, constructors, metadata
keywords, names, decimal counts or compound assignments reject. The separate
components of metadata and repeat forms are checked independently. [fixture:
railroad/ir-directive-string-middle] [fixture: railroad/ebnf-directive-string]
[fixture: railroad/abnf-directive-numval-digits] [fixture:
railroad/abnf-semicolon-numval-text] [fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-directive-keyword-glued] [fixture:
railroad/ir-directive-description-keyword] [fixture:
railroad/ir-div-semicolon-rule-name] [fixture:
railroad/abnf-div-semicolon-repeat-number] [fixture:
railroad/peg-div-semicolon-assignment] [fixture:
railroad/ir-directive-common-colon] [fixture: railroad/abnf-directive-repeat]

## Comments and trivia

Native percent comments have mark `%%`; PEG hash comments have mark `#`; ABNF
semicolon comments have mark `;`. Their ranges exclude the physical line ending;
LS/PS remain content. IR/EBNF C comments have mark `/*`, and EBNF ISO comments
have mark `(*`; their first required closer ends the comment. Their ranges and
values follow the [shared Comment definition](../tokens.md#comment). [fixture:
railroad/ir-comment-percent-ls] [fixture: railroad/peg-comment-hash-ps]
[fixture: railroad/abnf-comment-semicolon-ls] [fixture:
railroad/ir-tail-comment] [fixture: railroad/ebnf-comment-iso] [fixture:
railroad/ir-c-comment-first-closer] [fixture: railroad/ebnf-iso-first-closer]

Native ASCII space/tab/CR/LF padding has no tokens or nodes. Detection-passed
bare lines are shared Comments, and their accompanying trivia is not read again.
Hidden YAML and native directives are RawText with RailroadIgnoredText owners;
any consumed following LF lies outside that item. [fixture:
railroad/ir-space-tabs] [fixture: railroad/ir-line-crlf] [fixture:
railroad/ir-retained-bare-secondscan-unicode] [fixture:
railroad/ir-hidden-yaml-sole-lf] [fixture:
railroad/ir-hidden-directive-closing-space] [fixture:
railroad/ir-hidden-directive-eof]

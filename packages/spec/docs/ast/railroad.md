# Railroad nodes

Japanese version: [railroad.ja.md](./railroad.ja.md)

This document defines one source tree for `railroad`, `railroadEbnf`,
`railroadAbnf` and `railroadPeg`. [ast.md](../ast.md) defines shared nodes and
invariants; [diagrams/railroad.md](../diagrams/railroad.md) defines syntax and
acceptance. Fields retain authored values, absent optional values are null, and
lists preserve source order. Child fields below give visitor order. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree] [fixture:
railroad/peg-gram-written-tree]

Identifiers keep written names. StringLiteral.value is its authored interior
without common trivia, with no escape decoding; raw preserves original quotes,
escape spelling, source line endings and intervening common trivia, and closed
is true. Empty strings remain nodes. Decimal ABNF counts use the shared
NumericLiteral definition and preserve all digits in raw; omitted bounds are
null, not a synthesized zero. [fixture: railroad/ir-db-empty-strings] [fixture:
railroad/ebnf-db-empty-string] [fixture: railroad/abnf-db-empty-string]
[fixture: railroad/peg-db-empty-string] [fixture:
railroad/ir-lex-string-conversion] [fixture:
railroad/ebnf-lex-string-conversion] [fixture:
railroad/abnf-lex-string-conversion] [fixture:
railroad/peg-lex-string-conversion] [fixture:
railroad/abnf-db-repeat-leading-zero] [fixture:
railroad/abnf-db-repeat-precision] [fixture: railroad/abnf-db-repeat-overflow]
[fixture: railroad/abnf-gram-written-tree]

RailroadExpression means an expression permitted by the selected dialect. IR
permits its eight Call types only. Natural dialects admit Identifier and
StringLiteral directly, without leaf wrappers, plus their following expression
nodes: EBNF choice, sequence, group, optional group, repetition group, postfix,
exception and special sequence; ABNF choice, sequence, group, optional group,
repeat and numeric value; PEG choice, sequence, group, postfix, predicate and
any expression. RailroadRepeatRange and RailroadExpressionMember are children of
expressions, not independent expressions. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree] [fixture:
railroad/peg-gram-written-tree]

## Nodes

### RailroadDiagram

| Field              | Type                        | Meaning                                       |
| ------------------ | --------------------------- | --------------------------------------------- |
| `textBeforeHeader` | list of RailroadIgnoredText | Retained native pre-header forms.             |
| `body`             | list of RailroadBodyItem    | All written statements and body hidden forms. |

Child fields: `textBeforeHeader`, `body`. Range: the first retained pre-header
opener, or the header start if absent, through the last body item, or the header
end if the body is empty. Exclude unrelated padding, Comments and appended LF
beyond those endpoints. [fixture: railroad/ir-header-only] [fixture:
railroad/ebnf-header-only] [fixture: railroad/abnf-header-only] [fixture:
railroad/peg-header-only] [fixture: railroad/ir-secondscan-real] [fixture:
railroad/ir-yaml-before-secondscan-real] [fixture: railroad/ir-native-ownership]

Root.diagramType alone selects the dialect; there is no dialect, header or alias
field. RailroadBodyItem is RailroadRule, RailroadTitleStatement,
RailroadAccTitleStatement, RailroadAccDescrStatement,
RailroadAccDescrBlockStatement or RailroadIgnoredText. Keep all occurrences,
including empty and overwritten metadata, duplicate rules and trailing native
forms. Empty lines and Comments create no body items. Metadata is restricted to
the prefix before the first rule. [fixture: railroad/ir-common-repeat-empty]
[fixture: railroad/ebnf-common-repeat-empty] [fixture:
railroad/abnf-common-repeat-empty] [fixture: railroad/peg-common-repeat-empty]
[fixture: railroad/ir-db-duplicates] [fixture: railroad/ir-hidden-directive-eof]
[fixture: railroad/ebnf-metadata-after-rule-acctitle] [fixture:
railroad/abnf-metadata-after-rule-acctitle] [fixture:
railroad/peg-metadata-after-rule-acctitle]

### RailroadRule

| Field                  | Type                        | Meaning                             |
| ---------------------- | --------------------------- | ----------------------------------- |
| `name`                 | Identifier                  | Authored declaration name.          |
| `textBeforeOperator`   | list of RailroadIgnoredText | Forms between name and assignment.  |
| `textBeforeDefinition` | list of RailroadIgnoredText | Forms after assignment.             |
| `definition`           | RailroadExpression          | The complete authored expression.   |
| `textBeforeTerminator` | list of RailroadIgnoredText | Forms before the visible semicolon. |

Child fields: `name`, `textBeforeOperator`, `textBeforeDefinition`,
`definition`, `textBeforeTerminator`. Range: the name start through the required
visible semicolon. The assignment spelling (`=`, `::=` or `<-`) stays in tokens.
Hidden forms after that semicolon belong to body, not this rule. [fixture:
railroad/ir-native-ownership] [fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership] [fixture:
railroad/peg-native-ownership] [fixture:
railroad/abnf-comment-terminator-control]

### RailroadTitleStatement

| Field   | Type                    | Meaning                     |
| ------- | ----------------------- | --------------------------- |
| `value` | RailroadLiteral or null | Authored common-value text. |

Child fields: `value`. Range: title through the last value character, or through
the keyword when value is null. One ASCII space/tab separator is outside value.
Exclude statement-ending line breaks and outside padding; a following native
form is a separate body item. [fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-common-title-eof] [fixture:
railroad/ir-hidden-after-title]

value starts after title and exactly one ASCII space/tab. Keep remaining
padding. It is null without a separator or when no content remains after common
removals; a second space is a whitespace literal. [fixture:
railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture:
railroad/ir-title-value-directive-only] [fixture:
railroad/ir-title-value-comment-only] [fixture: railroad/ir-common-repeat-empty]

### RailroadAccTitleStatement

| Field   | Type                    | Meaning                     |
| ------- | ----------------------- | --------------------------- |
| `value` | RailroadLiteral or null | Authored common-value text. |

Child fields: `value`. Range: accTitle through its colon when null, otherwise
through the last line-value character. Exclude statement-ending line breaks and
outside padding; a following native form is a separate body item. [fixture:
railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-hidden-after-acctitle] [fixture:
railroad/ir-common-acctitle-eof]

value is line text immediately after the colon, retaining both ends of padding.
It is null only when no content remains after common removals; whitespace-only
text remains a literal. [fixture: railroad/ir-common-whitespace-shapes]
[fixture: railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture:
railroad/ir-acctitle-value-directive-only] [fixture:
railroad/ir-acctitle-value-comment-only] [fixture:
railroad/ir-common-repeat-empty]

### RailroadAccDescrStatement

| Field   | Type                    | Meaning                     |
| ------- | ----------------------- | --------------------------- |
| `value` | RailroadLiteral or null | Authored common-value text. |

Child fields: `value`. Range: accDescr through its colon when null, otherwise
through the last line-value character. Exclude statement-ending line breaks and
outside padding; a following native form is a separate body item. [fixture:
railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-hidden-after-description] [fixture:
railroad/ir-common-description-eof]

value is line text immediately after the colon, retaining padding, including
whitespace-only text. It is null only when no content remains after common
removals; brace-looking content remains a line value. [fixture:
railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture:
railroad/ir-accdescr-line-value-directive-only] [fixture:
railroad/ir-accdescr-line-value-comment-only] [fixture:
railroad/ir-common-repeat-empty]

### RailroadAccDescrBlockStatement

| Field   | Type                    | Meaning                     |
| ------- | ----------------------- | --------------------------- |
| `value` | RailroadLiteral or null | Authored common-value text. |

Child fields: `value`. Range: accDescr through the required first closing brace,
including both braces even when value is null. Exclude statement-ending line
breaks and outside padding; a following native form is a separate body item.
[fixture: railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-hidden-after-block] [fixture:
railroad/ir-common-block-empty-interleaved]

value is the brace interior with common Notation whitespace removed only at the
outer ends. Empty, whitespace-only, common-directive-only or comment-region-only
content is null. Preserve internal padding, quotes, escapes and source line
endings. The closer is required; no closed field is needed. [fixture:
railroad/ir-common-whitespace-shapes] [fixture:
railroad/ebnf-common-whitespace-shapes] [fixture:
railroad/abnf-common-whitespace-shapes] [fixture:
railroad/peg-common-whitespace-shapes] [fixture:
railroad/ir-common-block-directive-only] [fixture:
railroad/ir-common-block-comment-only] [fixture:
railroad/ir-common-repeat-empty]

### RailroadLiteral

| Field   | Type   | Meaning                |
| ------- | ------ | ---------------------- |
| `value` | string | Written metadata text. |

No child fields. Range: the first through last source character owned by that
metadata value, spanning internal common trivia. Exclude common directives,
comment regions and selected semicolons from value, but preserve every other
authored character. Quotes do not turn it into StringLiteral, and unfinished
quote-looking metadata remains a literal. [fixture:
railroad/ir-common-title-open-quote] [fixture:
railroad/ir-common-quotes-whitespace] [fixture:
railroad/ir-common-quoted-title-escape] [fixture:
railroad/ebnf-common-quoted-title-escape] [fixture:
railroad/abnf-common-quoted-title-escape] [fixture:
railroad/peg-common-quoted-title-escape] [fixture:
railroad/ir-common-block-directive] [fixture: railroad/ir-common-block-comment]

### RailroadIgnoredText

| Field   | Type   | Meaning                                  |
| ------- | ------ | ---------------------------------------- |
| `kind`  | string | yaml-block or directive.                 |
| `value` | string | Nonempty authored form including fences. |

No child fields. Range: the recognized `---` or `%%{` opener through its
selected closer. Exclude preceding padding and any consumed following LF;
appended LF is never source content. Keep source line endings and interior
padding. value leaves out internal common directives, comment regions and
selected semicolons, while its range spans them. [fixture:
railroad/ir-hidden-yaml-adjacent-later] [fixture:
railroad/ir-hidden-yaml-adjacent-eof] [fixture: railroad/ir-hidden-yaml-crlf]
[fixture: railroad/ir-hidden-directive-eof] [fixture:
railroad/ir-native-directive-adjacent] [fixture: railroad/ir-secondscan-real]
[fixture: railroad/ir-secondscan-multiline] [fixture:
railroad/ir-native-ownership]

Use yaml-block for native YAML and directive for native DIRECTIVE. Each whole
match is retained once, including an empty fenced body; three fences consumed in
one match make one node. Native comments and detection-passed bare lines use
shared Comment records instead. An earlier enclosing value owns hidden-looking
content without an ignored-text child. [fixture:
railroad/ir-hidden-yaml-adjacent-later] [fixture:
railroad/ir-prefix-retained-directive] [fixture:
railroad/ir-comment-bare-percent-body] [fixture:
railroad/ir-hidden-directive-string] [fixture:
railroad/ebnf-enclosing-string-hidden] [fixture:
railroad/abnf-enclosing-string-hidden] [fixture:
railroad/peg-enclosing-string-hidden]

### RailroadExpressionMember

| Field        | Type                        | Meaning                                       |
| ------------ | --------------------------- | --------------------------------------------- |
| `textBefore` | list of RailroadIgnoredText | Forms before this expression within its list. |
| `expression` | RailroadExpression          | The authored member expression.               |
| `textAfter`  | list of RailroadIgnoredText | Forms after this expression within its list.  |

Child fields: `textBefore`, `expression`, `textAfter`. Range: the first owned
textBefore form, or the expression start, through the last owned textAfter form,
or the expression end. Exclude the list separator. Ownership follows Gap
ownership below; it does not create a second expression layer or a punctuation
node. [fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadSequenceCall

| Field            | Type                             | Meaning                                            |
| ---------------- | -------------------------------- | -------------------------------------------------- |
| `textBeforeOpen` | list of RailroadIgnoredText      | Forms between constructor and opening parenthesis. |
| `arguments`      | list of RailroadExpressionMember | One or more authored IR arguments.                 |

Child fields: `textBeforeOpen`, `arguments`. Range: sequence through its closing
parenthesis. Keep this call even with one argument; commas remain punctuation.
Argument members own forms inside the opening and closing delimiters. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-db-singletons] [fixture:
railroad/ir-native-ownership]

A trailing comma without another argument is rejected; it does not make a
complete sequence call. [fixture: railroad/ir-error-prefix]

### RailroadChoiceCall

| Field            | Type                             | Meaning                                            |
| ---------------- | -------------------------------- | -------------------------------------------------- |
| `textBeforeOpen` | list of RailroadIgnoredText      | Forms between constructor and opening parenthesis. |
| `arguments`      | list of RailroadExpressionMember | One or more authored IR arguments.                 |

Child fields: `textBeforeOpen`, `arguments`. Range: choice through its closing
parenthesis. Keep this call even with one argument; commas remain punctuation.
Argument members own forms inside the opening and closing delimiters. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-db-singletons] [fixture:
railroad/ir-choice-native-ownership]

A trailing comma without another argument is rejected; it does not make a
complete choice call. [fixture: railroad/ir-choice-trailing-comma]

### RailroadOptionalCall

| Field               | Type                        | Meaning                               |
| ------------------- | --------------------------- | ------------------------------------- |
| `textBeforeOpen`    | list of RailroadIgnoredText | Forms before the opening parenthesis. |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the opening parenthesis.  |
| `element`           | RailroadExpression          | The single authored IR operand.       |
| `textBeforeClose`   | list of RailroadIgnoredText | Forms before the closing parenthesis. |

Child fields: `textBeforeOpen`, `textBeforeElement`, `element`,
`textBeforeClose`. Range: optional through its required closing parenthesis.
Both parentheses are tokens, and the operand is exactly one IR expression. This
call is distinct from postfix and bracket/brace forms. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-native-ownership] [fixture:
railroad/ir-error-empty-optional] [fixture: railroad/ir-error-extra-optional]

### RailroadOneOrMoreCall

| Field               | Type                        | Meaning                               |
| ------------------- | --------------------------- | ------------------------------------- |
| `textBeforeOpen`    | list of RailroadIgnoredText | Forms before the opening parenthesis. |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the opening parenthesis.  |
| `element`           | RailroadExpression          | The single authored IR operand.       |
| `textBeforeClose`   | list of RailroadIgnoredText | Forms before the closing parenthesis. |

Child fields: `textBeforeOpen`, `textBeforeElement`, `element`,
`textBeforeClose`. Range: oneOrMore through its required closing parenthesis.
Both parentheses are tokens, and the operand is exactly one IR expression. This
call is distinct from postfix and bracket/brace forms. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-error-empty-oneormore]
[fixture: railroad/ir-error-extra-oneormore]

### RailroadZeroOrMoreCall

| Field               | Type                        | Meaning                               |
| ------------------- | --------------------------- | ------------------------------------- |
| `textBeforeOpen`    | list of RailroadIgnoredText | Forms before the opening parenthesis. |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the opening parenthesis.  |
| `element`           | RailroadExpression          | The single authored IR operand.       |
| `textBeforeClose`   | list of RailroadIgnoredText | Forms before the closing parenthesis. |

Child fields: `textBeforeOpen`, `textBeforeElement`, `element`,
`textBeforeClose`. Range: zeroOrMore through its required closing parenthesis.
Both parentheses are tokens, and the operand is exactly one IR expression. This
call is distinct from postfix and bracket/brace forms. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-error-empty-zeroormore]
[fixture: railroad/ir-error-extra-zeroormore]

### RailroadTerminalCall

| Field             | Type                        | Meaning                                                |
| ----------------- | --------------------------- | ------------------------------------------------------ |
| `textBeforeOpen`  | list of RailroadIgnoredText | Forms before the opening parenthesis.                  |
| `textBeforeValue` | list of RailroadIgnoredText | Forms before the quoted argument.                      |
| `value`           | StringLiteral               | The single quoted argument, including an empty string. |
| `textBeforeClose` | list of RailroadIgnoredText | Forms before the closing parenthesis.                  |

Child fields: `textBeforeOpen`, `textBeforeValue`, `value`, `textBeforeClose`.
Range: terminal through its required closing parenthesis. The StringLiteral
range includes its original quotes; do not replace the call with an Identifier,
a bare string or a normalized terminal node. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-db-empty-strings] [fixture:
railroad/ir-native-ownership] [fixture: railroad/ir-lex-string-conversion]

### RailroadNonterminalCall

| Field             | Type                        | Meaning                                                |
| ----------------- | --------------------------- | ------------------------------------------------------ |
| `textBeforeOpen`  | list of RailroadIgnoredText | Forms before the opening parenthesis.                  |
| `textBeforeName`  | list of RailroadIgnoredText | Forms before the quoted argument.                      |
| `name`            | StringLiteral               | The single quoted argument, including an empty string. |
| `textBeforeClose` | list of RailroadIgnoredText | Forms before the closing parenthesis.                  |

Child fields: `textBeforeOpen`, `textBeforeName`, `name`, `textBeforeClose`.
Range: nonterminal through its required closing parenthesis. The StringLiteral
range includes its original quotes; do not replace the call with an Identifier,
a bare string or a normalized terminal node. [fixture:
railroad/ir-gram-written-tree] [fixture: railroad/ir-db-empty-strings] [fixture:
railroad/ir-native-ownership] [fixture: railroad/ir-lex-string-conversion]
[fixture: railroad/ir-error-extra-nonterminal]

### RailroadSpecialCall

| Field             | Type                        | Meaning                                                |
| ----------------- | --------------------------- | ------------------------------------------------------ |
| `textBeforeOpen`  | list of RailroadIgnoredText | Forms before the opening parenthesis.                  |
| `textBeforeText`  | list of RailroadIgnoredText | Forms before the quoted argument.                      |
| `text`            | StringLiteral               | The single quoted argument, including an empty string. |
| `textBeforeClose` | list of RailroadIgnoredText | Forms before the closing parenthesis.                  |

Child fields: `textBeforeOpen`, `textBeforeText`, `text`, `textBeforeClose`.
Range: special through its required closing parenthesis. The StringLiteral range
includes its original quotes; do not replace the call with an Identifier, a bare
string or a normalized terminal node. [fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ir-db-empty-strings] [fixture:
railroad/ir-lex-string-conversion] [fixture: railroad/ir-error-extra-special]

### RailroadChoiceExpression

| Field          | Type                             | Meaning                            |
| -------------- | -------------------------------- | ---------------------------------- |
| `alternatives` | list of RailroadExpressionMember | Two or more authored alternatives. |

Child fields: `alternatives`. Range: the first expression start through the last
expression end. Preserve EBNF vertical bars or ABNF/PEG slashes in tokens and
all alternative order. A single alternative is its expression without this
wrapper; IR choice calls have their own type. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
[fixture: railroad/ebnf-native-ownership] [fixture:
railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]

### RailroadSequenceExpression

| Field      | Type                             | Meaning                                 |
| ---------- | -------------------------------- | --------------------------------------- |
| `elements` | list of RailroadExpressionMember | Two or more authored sequence elements. |

Child fields: `elements`. Range: the first expression start through the last
expression end. Preserve EBNF optional commas as punctuation; adjacency is not
converted to synthetic commas. A single element is its expression without this
wrapper; an IR sequence call remains distinct. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
[fixture: railroad/ebnf-native-ownership] [fixture:
railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]

### RailroadGroupExpression

| Field               | Type                        | Meaning                                 |
| ------------------- | --------------------------- | --------------------------------------- |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the opener.                 |
| `element`           | RailroadExpression          | The complete nonempty inner expression. |
| `textBeforeClose`   | list of RailroadIgnoredText | Forms before the closer.                |

Child fields: `textBeforeElement`, `element`, `textBeforeClose`. Range: `(`
through the required `)`. This authored form belongs to EBNF, ABNF and PEG. The
delimiters remain tokens, and this node remains even when its inner expression
is one leaf. No empty inner expression or missing closer is admitted. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-singletons]
[fixture: railroad/abnf-db-singletons] [fixture: railroad/peg-db-singletons]
[fixture: railroad/ebnf-native-ownership] [fixture:
railroad/abnf-native-ownership] [fixture: railroad/peg-native-ownership]

### RailroadOptionalGroupExpression

| Field               | Type                        | Meaning                                 |
| ------------------- | --------------------------- | --------------------------------------- |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the opener.                 |
| `element`           | RailroadExpression          | The complete nonempty inner expression. |
| `textBeforeClose`   | list of RailroadIgnoredText | Forms before the closer.                |

Child fields: `textBeforeElement`, `element`, `textBeforeClose`. Range: `[`
through the required `]`. This authored form belongs to EBNF and ABNF. The
delimiters remain tokens, and this node remains even when its inner expression
is one leaf. No empty inner expression or missing closer is admitted. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/ebnf-native-ownership] [fixture:
railroad/abnf-native-ownership]

### RailroadRepetitionGroupExpression

| Field               | Type                        | Meaning                                 |
| ------------------- | --------------------------- | --------------------------------------- |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the opener.                 |
| `element`           | RailroadExpression          | The complete nonempty inner expression. |
| `textBeforeClose`   | list of RailroadIgnoredText | Forms before the closer.                |

Child fields: `textBeforeElement`, `element`, `textBeforeClose`. Range: `{`
through the required `}`. This authored form belongs to EBNF. The delimiters
remain tokens, and this node remains even when its inner expression is one leaf.
No empty inner expression or missing closer is admitted. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/ebnf-native-ownership]

### RailroadPostfixExpression

| Field                | Type                        | Meaning                          |
| -------------------- | --------------------------- | -------------------------------- |
| `element`            | RailroadExpression          | The preceding operand.           |
| `textBeforeOperator` | list of RailroadIgnoredText | Forms before the postfix symbol. |
| `operator`           | string                      | One of ?, * or +.                |

Child fields: `element`, `textBeforeOperator`. Range: the operand start through
the postfix symbol. EBNF postfixes build successive left-nested nodes in written
order; PEG permits one suffix at this level. The symbol stays in tokens as well
as operator. This is distinct from IR calls, optional groups and brace
repetition. [fixture: railroad/ebnf-gram-written-tree] [fixture:
railroad/peg-gram-written-tree] [fixture: railroad/ebnf-db-postfix-order]
[fixture: railroad/ebnf-exception-leftfold] [fixture:
railroad/peg-gram-double-suffix] [fixture: railroad/ebnf-native-ownership]
[fixture: railroad/peg-native-ownership]

### RailroadExceptionExpression

| Field                | Type                        | Meaning                             |
| -------------------- | --------------------------- | ----------------------------------- |
| `left`               | RailroadExpression          | The preceding EBNF term expression. |
| `textBeforeOperator` | list of RailroadIgnoredText | Forms before the minus.             |
| `textBeforeRight`    | list of RailroadIgnoredText | Forms after the minus.              |
| `right`              | RailroadExpression          | An EBNF primary only.               |

Child fields: `left`, `textBeforeOperator`, `textBeforeRight`, `right`. Range:
left’s start through right’s end, including the minus token. Preserve the
authored exception, not a synthesized sequence containing a literal dash.
Further postfixes and exceptions wrap this expression in written order; hyphens
already inside a name remain part of that Identifier. [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/ebnf-exception-dash-name]
[fixture: railroad/ebnf-exception-leftfold] [fixture:
railroad/ebnf-db-postfix-order] [fixture: railroad/ebnf-native-ownership]

### RailroadSpecialSequence

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Authored interior without the two question marks. |

No child fields. Range: the opening question mark through its required closing
question mark. value removes only those delimiters and common trivia; keep outer
and inner whitespace, source line endings, quotes and backslashes without
trimming or decoding. The lexical rule requires nonwhitespace content, so no
empty-value node occurs. [fixture: railroad/ebnf-special-whitespace] [fixture:
railroad/ebnf-special-empty] [fixture: railroad/ebnf-special-whitespace-only]
[fixture: railroad/ebnf-special-adjacent] [fixture:
railroad/ebnf-hidden-directive-special] [fixture:
railroad/ebnf-directive-string]

### RailroadRepeatExpression

| Field               | Type                                  | Meaning                                   |
| ------------------- | ------------------------------------- | ----------------------------------------- |
| `repeat`            | NumericLiteral or RailroadRepeatRange | The authored exact count or starred form. |
| `textBeforeElement` | list of RailroadIgnoredText           | Forms after the complete repeat.          |
| `element`           | RailroadExpression                    | One ABNF primary.                         |

Child fields: `repeat`, `textBeforeElement`, `element`. Range: the written count
or star start through its primary’s end. Keep this form even when its bounds
describe zero or one occurrence; do not turn it into an optional-group or a
generic normalized repetition. Its primary cannot itself have another ungrouped
repeat prefix. [fixture: railroad/abnf-gram-written-tree] [fixture:
railroad/abnf-db-repeat-optional] [fixture:
railroad/abnf-db-repeat-implicit-optional] [fixture:
railroad/abnf-db-repeat-zero-padded-optional] [fixture:
railroad/abnf-db-repeat-zero] [fixture: railroad/abnf-native-in-atom] [fixture:
railroad/abnf-native-ownership]

### RailroadRepeatRange

| Field     | Type                   | Meaning                                     |
| --------- | ---------------------- | ------------------------------------------- |
| `minimum` | NumericLiteral or null | The written lower count, null when omitted. |
| `maximum` | NumericLiteral or null | The written upper count, null when omitted. |

Child fields: `minimum`, `maximum`. Range: the lower count’s first digit, or the
star when it is absent, through the upper count’s last digit, or the star when
it is absent. The star remains punctuation. `*`, `0*`, `*1`, `00*01` and exact
`1` remain distinguishable; exact counts do not use this node. Native whitespace
and hidden forms cannot split its components, but common directives and selected
semicolons between complete components are trivia. [fixture:
railroad/abnf-gram-written-tree] [fixture:
railroad/abnf-db-repeat-implicit-optional] [fixture:
railroad/abnf-db-repeat-zero-padded-optional] [fixture:
railroad/abnf-db-repeat-leading-zero] [fixture: railroad/abnf-repeat-gap-star]
[fixture: railroad/abnf-directive-repeat] [fixture:
railroad/abnf-directive-repeat-star] [fixture: railroad/abnf-native-in-atom]
[fixture: railroad/abnf-semicolon-repeat-before-star] [fixture:
railroad/abnf-semicolon-repeat-after-star]

### RailroadNumericValue

| Field   | Type   | Meaning                                   |
| ------- | ------ | ----------------------------------------- |
| `value` | string | The complete authored percent-value text. |

No child fields. Range: the percent sign through the final hexadecimal digit,
spanning internal common trivia. value retains base-letter case, every digit,
dot and hyphen; exclude only common directives, comment regions and selected
semicolons. It is a dedicated text leaf, not a NumericLiteral or a list of
converted character codes. [fixture: railroad/abnf-numval-boundaries] [fixture:
railroad/abnf-numval-suffix] [fixture: railroad/abnf-directive-numval-prefix]
[fixture: railroad/abnf-directive-numval-digits] [fixture:
railroad/abnf-directive-numval-range] [fixture:
railroad/abnf-semicolon-numval-text]

### RailroadPredicateExpression

| Field               | Type                        | Meaning                        |
| ------------------- | --------------------------- | ------------------------------ |
| `operator`          | string                      | & or !.                        |
| `textBeforeElement` | list of RailroadIgnoredText | Forms after the prefix symbol. |
| `element`           | RailroadExpression          | The full PEG suffix operand.   |

Child fields: `textBeforeElement`, `element`. Range: the prefix symbol through
its suffix operand’s end. Keep groups, postfixes and every interior operand node
even when the comparison Db exposes only a label. A second direct prefix is not
allowed; another predicate can occur inside an authored group. [fixture:
railroad/peg-gram-written-tree] [fixture: railroad/peg-db-predicates] [fixture:
railroad/peg-db-predicate-singleton-group] [fixture:
railroad/peg-db-predicate-predicate] [fixture: railroad/peg-gram-double-prefix]
[fixture: railroad/peg-native-ownership]

### RailroadAnyExpression

No child fields. It has no fields. [fixture: railroad/peg-gram-written-tree]
[fixture: railroad/peg-db-all-fields]

Range: the single dot character. This PEG primary is not a StringLiteral or
synthesized special text. [fixture: railroad/peg-gram-written-tree] [fixture:
railroad/peg-db-all-fields]

## Gap ownership

Every textBefore/textAfter field is an ordered list of RailroadIgnoredText,
empty when absent. It owns only complete native hidden forms; whitespace and
line terminators remain source gaps, and regular comments remain shared Comment
records. A hidden form is held exactly once, at the nearest named owner below.
Expression cores do not extend to hidden forms owned by a containing field.
[fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

Before the header, only detection-retained YAML and genuine second-scan
directives belong to textBeforeHeader. Passed bare lines and their accompanying
trivia are excluded. After the header, a complete metadata statement or a rule
terminator, a whole hidden form belongs directly to body. There are no metadata
suffix fields or visible-EOL ownership rules. Inside a rule, the three rule gaps
own forms before its assignment, definition and terminator. [fixture:
railroad/ir-secondscan-real] [fixture: railroad/ir-prefix-retained-directive]
[fixture: railroad/ir-native-ownership] [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership] [fixture:
railroad/ir-hidden-after-title] [fixture: railroad/ir-hidden-after-block]

Each call owns forms before its opening parenthesis in textBeforeOpen. Unary and
quoted-argument calls own forms after the opener and before the closer in their
dedicated fields. Sequence/choice call members own all interior forms: before a
comma belongs to the previous member’s textAfter; after a comma belongs to the
next member’s textBefore. The first and last members also own forms just inside
the call’s parentheses. [fixture: railroad/ir-native-ownership]

In natural choice and sequence lists, forms before an explicit separator belong
to the preceding member’s textAfter, and forms after it to the following
member’s textBefore. With adjacency and no separator, the following member’s
textBefore owns the whole gap; the preceding textAfter is empty. The first
natural member’s textBefore and the last natural member’s textAfter are empty;
the enclosing group, rule or unary expression owns those outer gaps. Nested
lists apply this rule at the nearest boundary. [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]

Group delimiters own their two interior gaps. An exception owns gaps before and
after its minus. Each postfix owns only the gap before its own operator; later
postfixes wrap the preceding expression. A repeat owns the gap after the
complete count/range; a predicate owns the gap after its prefix. No native gap
is admitted between repeat components. Shared directives and selected semicolons
are not gap children, even when a node range spans them. [fixture:
railroad/ebnf-native-ownership] [fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership] [fixture: railroad/abnf-native-in-atom]
[fixture: railroad/abnf-directive-repeat] [fixture:
railroad/abnf-semicolon-numval-text]

## Examples

These deliberately authored examples illustrate tree structure rather than a
formatting choice. Each body has six items: a title, an access title, a line
access description, an empty block access description, a nonempty block access
description and a rule. The empty block is a statement with null value, not a
hidden gap. Shared token/comment/directive lists are omitted from the following
descriptions. [fixture: railroad/ir-gram-written-tree] [fixture:
railroad/ebnf-gram-written-tree] [fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

### IR

```mmd
railroad-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item = sequence(terminal("a\n"), nonterminal("item"), choice(special("note"), optional(terminal(""))), zeroOrMore(terminal("b")), oneOrMore(terminal("c")));
```

The definition is RailroadSequenceCall with five arguments:
RailroadTerminalCall, RailroadNonterminalCall, RailroadChoiceCall,
RailroadZeroOrMoreCall and RailroadOneOrMoreCall. The choice has a
RailroadSpecialCall and a RailroadOptionalCall whose child is a terminal call
with an empty StringLiteral. Keep all calls and the authored backslashes in the
first string. [fixture: railroad/ir-gram-written-tree]

### EBNF

```mmd
railroad-ebnf-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item ::= ("a", name) - "b"+ | ["c"] { ? special ? } "d"?;
```

The definition is a two-alternative RailroadChoiceExpression. The first
alternative is a RailroadPostfixExpression with operator + around
RailroadExceptionExpression; its left group contains a comma sequence, and its
right is the string "b". The second is a three-element sequence: optional group,
repetition group containing a special sequence, and a postfix ? string. Keep the
authored ::=, comma and all delimiters as tokens. [fixture:
railroad/ebnf-gram-written-tree]

### ABNF

```mmd
railroad-abnf-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item = 002*004("a" / %X41.42-43) [other] 0*1"" 3"x" *"z";
```

The definition is a five-element sequence. Its first RailroadRepeatExpression
has a RailroadRepeatRange whose bounds retain raw 002 and 004, and a group
containing a choice of a string and RailroadNumericValue with value %X41.42-43.
The next nodes are an optional group, a range repeat over an empty string, an
exact-count repeat and an unbounded repeat. No optional or repeated structure is
replaced by its Db equivalent. [fixture: railroad/abnf-gram-written-tree]

### PEG

```mmd
railroad-peg-beta
title "Syntax"
accTitle: Rules
accDescr: Short
accDescr {}
accDescr { Details }
item <- &("a" / ref)+ !. "b"? "c"* (("d"));
```

The definition is a five-element sequence. Its first two nodes are
RailroadPredicateExpression: & owns a postfix + group containing a choice; !
owns RailroadAnyExpression. Next come postfix ? and * strings, then two nested
RailroadGroupExpression nodes around the final string. Every predicate operand
and both explicit singleton groups remain in the tree. [fixture:
railroad/peg-gram-written-tree]

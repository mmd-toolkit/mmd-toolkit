# gitgraph nodes

Japanese version: [gitgraph.ja.md](./gitgraph.ja.md)

This document defines the source tree for `gitgraph`; [ast.md](../ast.md)
defines shared leaves and [diagrams/gitgraph.md](../diagrams/gitgraph.md)
defines acceptance. Fields keep written values, without string escape decoding
or Db normalization. Optional fields are present as null, missing lists are
empty, and all lists retain source order, including repeated statements/options.
Child fields below give visitor order. [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/header-only] [fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/gram-cherry-pick-repeated-options] [fixture:
gitgraph/lex-string-escapes]

## Nodes

### GitgraphDiagram

| Field                 | Type                        | Meaning                              |
| --------------------- | --------------------------- | ------------------------------------ |
| `direction`           | LR, TB, BT or null          | Written header direction.            |
| `textBeforeHeader`    | list of GitgraphIgnoredText | Retained pre-header forms.           |
| `textBeforeDirection` | list of GitgraphIgnoredText | Forms before a written direction.    |
| `textBeforeColon`     | list of GitgraphIgnoredText | Forms before a separated colon.      |
| `body`                | list of GitgraphBodyItem    | Written statements and hidden forms. |

Child fields: `textBeforeHeader`, `textBeforeDirection`, `textBeforeColon`,
`body`. Range: the first retained pre-header form, or the header word if none,
through the last written header/body component. Exclude unrelated outside
padding. There is no header node, inferred direction, colon flag or
effective-title field. [fixture: gitgraph/header-only] [fixture:
gitgraph/header-tb] [fixture: gitgraph/header-colon] [fixture:
gitgraph/header-spaced-colon] [fixture: gitgraph/lex-yaml-after-comment]
[fixture: gitgraph/header-hidden-before-colon] [fixture:
gitgraph/header-hidden-before-direction]

textBeforeHeader contains only native hidden forms remaining from the detection
point, including a retained YAML block and second-scan directives.
Detection-passed bare percent-pair lines are shared Comments, not these nodes,
and do not extend the diagram range. Their accompanying passed whitespace and
line breaks are trivia and are not read again, also between retained forms.
Native hidden-form boundaries still decide acceptance. [fixture:
gitgraph/lex-yaml-after-comment] [fixture:
gitgraph/lex-hidden-directive-second-scan] [fixture:
gitgraph/detect-two-second-scan-forms] [fixture:
gitgraph/detect-bare-brace-eof-header] [fixture:
gitgraph/detect-bare-unclosed-before-header] [fixture:
gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
gitgraph/detect-retained-opener-bom]

direction is null unless LR/TB/BT is written. textBeforeDirection is empty
without a written direction. textBeforeColon is empty without a separated colon;
the colon joined to gitGraph has no intervening gap. Hidden forms after the last
written header component start body. Two hidden forms in one gap remain two
nodes. [fixture: gitgraph/header-only] [fixture: gitgraph/header-colon]
[fixture: gitgraph/header-bt] [fixture: gitgraph/header-hidden-before-colon]
[fixture: gitgraph/header-hidden-before-direction] [fixture:
gitgraph/header-two-hidden-forms] [fixture:
gitgraph/lex-hidden-directive-unknown-content] [fixture:
gitgraph/lex-hidden-directive-before-branch-name]

GitgraphBodyItem is GitgraphCommitStatement, GitgraphBranchStatement,
GitgraphCheckoutStatement, GitgraphMergeStatement, GitgraphCherryPickStatement,
GitgraphTitleStatement, GitgraphAccTitleStatement, GitgraphAccDescrStatement,
GitgraphAccDescrBlockStatement or GitgraphIgnoredText. Empty/comment-only lines
make no body item. Duplicate ids and repeated common statements remain distinct
source occurrences. [fixture: gitgraph/gram-all-fields] [fixture:
gitgraph/db-duplicate-id] [fixture: gitgraph/common-third-values] [fixture:
gitgraph/comment-before-header]

### GitgraphCommitStatement

| Field       | Type                        | Meaning                   |
| ----------- | --------------------------- | ------------------------- |
| `options`   | list of commit options      | All written options.      |
| `textAfter` | list of GitgraphIgnoredText | Hidden suffix before EOL. |

Options are GitgraphIdOption, GitgraphMessageOption, GitgraphTagOption or
GitgraphTypeOption, in source order. Child fields: `options`, `textAfter`.
Range: commit through its last option or hidden suffix, or the keyword alone;
exclude EOL. An empty option list is valid. [fixture:
gitgraph/header-commit-inline] [fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/lex-hidden-directive-commit-eof]

### GitgraphBranchStatement

| Field            | Type                        | Meaning                   |
| ---------------- | --------------------------- | ------------------------- |
| `textBeforeName` | list of GitgraphIgnoredText | Hidden forms before name. |
| `name`           | Identifier or StringLiteral | Written branch name.      |
| `order`          | GitgraphOrderOption or null | Optional branch order.    |
| `textAfter`      | list of GitgraphIgnoredText | Hidden suffix before EOL. |

Child fields: `textBeforeName`, `name`, `order`, `textAfter`. Range: branch
through the last name/order/suffix component, excluding EOL. order is null when
absent. The name accepts either quote style, even an empty or whitespace-only
quoted name; never replace its written form with the effective comparison name.
[fixture: gitgraph/gram-branch-order] [fixture: gitgraph/gram-branch-empty]
[fixture: gitgraph/gram-branch-whitespace] [fixture:
gitgraph/gram-branch-single-quotes] [fixture:
gitgraph/lex-hidden-directive-before-branch-name] [fixture:
gitgraph/lex-branch-between-name-order-hidden]

### GitgraphCheckoutStatement

| Field              | Type                        | Meaning                   |
| ------------------ | --------------------------- | ------------------------- |
| `keyword`          | checkout or switch          | Written alias.            |
| `textBeforeBranch` | list of GitgraphIgnoredText | Hidden forms before name. |
| `branch`           | Identifier or StringLiteral | Written branch reference. |
| `textAfter`        | list of GitgraphIgnoredText | Hidden suffix before EOL. |

Child fields: `textBeforeBranch`, `branch`, `textAfter`. Range: checkout or
switch through the branch or last hidden suffix, excluding EOL. keyword
preserves which alias was written and is not a child. [fixture:
gitgraph/gram-checkout] [fixture: gitgraph/gram-switch] [fixture:
gitgraph/lex-hidden-directive-before-checkout-name] [fixture:
gitgraph/lex-hidden-directive-checkout-eof]

### GitgraphMergeStatement

| Field              | Type                        | Meaning                     |
| ------------------ | --------------------------- | --------------------------- |
| `textBeforeBranch` | list of GitgraphIgnoredText | Hidden forms before source. |
| `branch`           | Identifier or StringLiteral | Written source branch.      |
| `options`          | list of merge options       | All written options.        |
| `textAfter`        | list of GitgraphIgnoredText | Hidden suffix before EOL.   |

Options are GitgraphIdOption, GitgraphTagOption or GitgraphTypeOption. Child
fields: `textBeforeBranch`, `branch`, `options`, `textAfter`. Range: merge
through the last branch/option/suffix component, excluding EOL. Keep repeated id
and type assignments separately. [fixture: gitgraph/gram-merge-options]
[fixture: gitgraph/gram-merge-repeated-options] [fixture:
gitgraph/lex-hidden-directive-before-merge-name] [fixture:
gitgraph/lex-hidden-directive-merge-eof]

### GitgraphCherryPickStatement

| Field       | Type                        | Meaning                   |
| ----------- | --------------------------- | ------------------------- |
| `options`   | list of cherry-pick options | All written options.      |
| `textAfter` | list of GitgraphIgnoredText | Hidden suffix before EOL. |

Options are GitgraphIdOption, GitgraphParentOption or GitgraphTagOption. Child
fields: `options`, `textAfter`. Range: cherry-pick through the last option or
hidden suffix, excluding EOL. The written grammar permits no options, but
semantic acceptance still requires an effective source id. [fixture:
gitgraph/gram-cherry-pick-repeated-options] [fixture:
gitgraph/lex-hidden-directive-cherry-pick-eof] [fixture:
gitgraph/db-cherry-pick-missing]

### GitgraphIdOption

| Field             | Type                        | Meaning                   |
| ----------------- | --------------------------- | ------------------------- |
| `textBefore`      | list of GitgraphIgnoredText | Forms before this option. |
| `textBeforeValue` | list of GitgraphIgnoredText | Forms after introducer.   |
| `value`           | StringLiteral               | Written id value.         |

Child fields: `textBefore`, `textBeforeValue`, `value`. Range: the first
textBefore form, or the `id` word if none, through the closing quote of its
value. textBefore holds hidden forms between the preceding component and this
option; textBeforeValue holds forms after the complete introducer. A missing gap
is empty. [fixture: gitgraph/gram-commit-repeated-options] [fixture:
gitgraph/lex-hidden-directive-between-option-value] [fixture:
gitgraph/lex-option-between-options-hidden]

StringLiteral keeps its quoted raw source and the written interior in value,
without decoding escapes; closed is true. Empty values remain StringLiteral
nodes. [fixture: gitgraph/gram-commit-empty-values] [fixture:
gitgraph/lex-string-escapes]

### GitgraphMessageOption

| Field             | Type                        | Meaning                              |
| ----------------- | --------------------------- | ------------------------------------ |
| `textBefore`      | list of GitgraphIgnoredText | Forms before this option.            |
| `keyword`         | msg or null                 | Explicit introducer, or bare string. |
| `textBeforeValue` | list of GitgraphIgnoredText | Forms after introducer.              |
| `value`           | StringLiteral               | Written message value.               |

Child fields: `textBefore`, `textBeforeValue`, `value`. Range: the first
textBefore form, or the option word/opening quote if none, through the end of
its value. textBefore holds hidden forms between the preceding component and
this option; textBeforeValue holds forms after the complete introducer. A
missing gap is empty. [fixture: gitgraph/gram-commit-repeated-options] [fixture:
gitgraph/lex-option-before-message-hidden] [fixture:
gitgraph/lex-hidden-between-id-message-global-control]

keyword is msg for an explicit `msg:` and null for a bare string. With no
introducer textBeforeValue is empty, and hidden forms before the quote belong to
textBefore. Both forms and every repeated message remain separate options.
[fixture: gitgraph/gram-commit-repeated-options] [fixture:
gitgraph/lex-option-before-message-hidden] [fixture:
gitgraph/lex-hidden-between-id-message-global-control]

### GitgraphTagOption

| Field             | Type                        | Meaning                   |
| ----------------- | --------------------------- | ------------------------- |
| `textBefore`      | list of GitgraphIgnoredText | Forms before this option. |
| `textBeforeValue` | list of GitgraphIgnoredText | Forms after introducer.   |
| `value`           | StringLiteral               | Written tag value.        |

Child fields: `textBefore`, `textBeforeValue`, `value`. Range: the first
textBefore form, or the `tag` word if none, through the closing quote of its
value. textBefore holds hidden forms between the preceding component and this
option; textBeforeValue holds forms after the complete introducer. A missing gap
is empty. [fixture: gitgraph/gram-cherry-pick-tags] [fixture:
gitgraph/gram-commit-empty-values] [fixture:
gitgraph/lex-option-between-options-hidden]

StringLiteral keeps its quoted raw source and the written interior in value,
without decoding escapes; closed is true. Empty values remain StringLiteral
nodes. [fixture: gitgraph/gram-commit-empty-values] [fixture:
gitgraph/lex-string-escapes]

### GitgraphTypeOption

| Field             | Type                         | Meaning                   |
| ----------------- | ---------------------------- | ------------------------- |
| `textBefore`      | list of GitgraphIgnoredText  | Forms before this option. |
| `textBeforeValue` | list of GitgraphIgnoredText  | Forms after introducer.   |
| `value`           | NORMAL, REVERSE or HIGHLIGHT | Written type value.       |

Child fields: `textBefore`, `textBeforeValue`. Range: the first textBefore form,
or the `type` word if none, through the end of the written NORMAL, REVERSE or
HIGHLIGHT keyword. textBefore holds hidden forms between the preceding component
and this option; textBeforeValue holds forms after the complete introducer. A
missing gap is empty. [fixture: gitgraph/gram-merge-repeated-options] [fixture:
gitgraph/lex-option-before-type-value-hidden] [fixture:
gitgraph/lex-option-type-hidden-tail]

value is the written fixed keyword, not a numeric Db type and not a child node.
No other spelling is allowed. [fixture: gitgraph/gram-commit-type-lowercase]
[fixture: gitgraph/gram-commit-type-unknown] [fixture:
gitgraph/lex-type-longer-reference-control] [fixture: gitgraph/gram-all-fields]

### GitgraphParentOption

| Field             | Type                        | Meaning                   |
| ----------------- | --------------------------- | ------------------------- |
| `textBefore`      | list of GitgraphIgnoredText | Forms before this option. |
| `textBeforeValue` | list of GitgraphIgnoredText | Forms after introducer.   |
| `value`           | StringLiteral               | Written parent value.     |

Child fields: `textBefore`, `textBeforeValue`, `value`. Range: the first
textBefore form, or the `parent` word if none, through the closing quote of its
value. textBefore holds hidden forms between the preceding component and this
option; textBeforeValue holds forms after the complete introducer. A missing gap
is empty. [fixture: gitgraph/gram-cherry-pick-merge-parent] [fixture:
gitgraph/gram-cherry-pick-repeated-options] [fixture:
gitgraph/lex-parent-global-before-colon]

StringLiteral keeps its quoted raw source and the written interior in value,
without decoding escapes; closed is true. Empty values remain StringLiteral
nodes. [fixture: gitgraph/gram-cherry-pick-empty-parent] [fixture:
gitgraph/gram-cherry-pick-merge-parent]

### GitgraphOrderOption

| Field             | Type                        | Meaning                   |
| ----------------- | --------------------------- | ------------------------- |
| `textBefore`      | list of GitgraphIgnoredText | Forms before this option. |
| `textBeforeValue` | list of GitgraphIgnoredText | Forms after introducer.   |
| `value`           | NumericLiteral              | Written order value.      |

Child fields: `textBefore`, `textBeforeValue`, `value`. Range: the first
textBefore form, or the `order` word if none, through the last digit of its
value. textBefore holds hidden forms between the preceding component and this
option; textBeforeValue holds forms after the complete introducer. A missing gap
is empty. [fixture: gitgraph/gram-branch-order] [fixture:
gitgraph/lex-branch-between-name-order-hidden] [fixture:
gitgraph/lex-hidden-directive-before-order] [fixture: gitgraph/number-overflow]

NumericLiteral keeps the complete written digits in raw and the shared double in
value, including precision loss or overflow. No effective branch order is
substituted. [fixture: gitgraph/number-zero] [fixture:
gitgraph/number-precision] [fixture: gitgraph/number-overflow]

### Statement gap ownership

A hidden form before a later option belongs to that option’s textBefore,
including between a branch name and order. After the final option/name it
belongs to the statement’s textAfter until a visible EOL; after that EOL it is a
body item. No occurrence is duplicated. A native comment is a shared Comment.
Identifier holds a bare branch reference as written; StringLiteral holds a
quoted one, with no escape decoding. [fixture:
gitgraph/lex-option-between-options-hidden] [fixture:
gitgraph/lex-branch-between-name-order-hidden] [fixture:
gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/lex-hidden-directive-before-branch-name] [fixture:
gitgraph/comment-commit-glued] [fixture: gitgraph/gram-branch-single-quotes]
[fixture: gitgraph/lex-reference-shape]

### GitgraphTitleStatement

| Field       | Type                        | Meaning                   |
| ----------- | --------------------------- | ------------------------- |
| `value`     | GitgraphLiteral or null     | Written common value.     |
| `textAfter` | list of GitgraphIgnoredText | Hidden suffix before EOL. |

value is the text after title and exactly one ASCII space/tab, through the
line-value end, retaining all remaining padding. It is null when there is no
separator or no content after that separator. [fixture:
gitgraph/lex-title-bare-hidden-tail] [fixture:
gitgraph/lex-title-tab-hidden-tail] [fixture: gitgraph/title-tab] [fixture:
gitgraph/title-conversion] [fixture: gitgraph/common-title-only-whitespace]

Child fields: `value`, `textAfter`. Range: title through its last value
character, or the keyword/colon/closing brace that completes its empty form,
extended through the last textAfter form. Exclude EOL and unrelated outside
padding. Hidden forms after a visible EOL are body items, not suffixes. Keep
repeated and empty common statements. [fixture:
gitgraph/lex-title-bare-hidden-tail] [fixture:
gitgraph/lex-title-tab-hidden-tail] [fixture: gitgraph/title-tab] [fixture:
gitgraph/title-conversion] [fixture: gitgraph/common-title-only-whitespace]
[fixture: gitgraph/common-third-values] [fixture:
gitgraph/lex-hidden-directive-title-eof]

### GitgraphAccTitleStatement

| Field       | Type                        | Meaning                   |
| ----------- | --------------------------- | ------------------------- |
| `value`     | GitgraphLiteral or null     | Written common value.     |
| `textAfter` | list of GitgraphIgnoredText | Hidden suffix before EOL. |

value is the text immediately after the colon through the line-value end,
including padding at both ends. It is null only when there is no content;
whitespace-only content is a literal. [fixture:
gitgraph/lex-acctitle-empty-hidden-tail] [fixture:
gitgraph/common-acctitle-only-whitespace] [fixture:
gitgraph/acctitle-unicode-trim]

Child fields: `value`, `textAfter`. Range: accTitle through its last value
character, or the keyword/colon/closing brace that completes its empty form,
extended through the last textAfter form. Exclude EOL and unrelated outside
padding. Hidden forms after a visible EOL are body items, not suffixes. Keep
repeated and empty common statements. [fixture:
gitgraph/lex-acctitle-empty-hidden-tail] [fixture:
gitgraph/common-acctitle-only-whitespace] [fixture:
gitgraph/acctitle-unicode-trim] [fixture: gitgraph/common-third-values]
[fixture: gitgraph/lex-hidden-directive-acctitle-eof]

### GitgraphAccDescrStatement

| Field       | Type                        | Meaning                   |
| ----------- | --------------------------- | ------------------------- |
| `value`     | GitgraphLiteral or null     | Written common value.     |
| `textAfter` | list of GitgraphIgnoredText | Hidden suffix before EOL. |

value is the text immediately after the colon through the line-value end,
including padding at both ends. It is null only when there is no content;
whitespace-only content is a literal. [fixture:
gitgraph/lex-description-line-null] [fixture:
gitgraph/common-accdescr-only-whitespace] [fixture:
gitgraph/accdescr-unicode-trim]

Child fields: `value`, `textAfter`. Range: accDescr through its last value
character, or the keyword/colon/closing brace that completes its empty form,
extended through the last textAfter form. Exclude EOL and unrelated outside
padding. Hidden forms after a visible EOL are body items, not suffixes. Keep
repeated and empty common statements. [fixture:
gitgraph/lex-description-line-null] [fixture:
gitgraph/common-accdescr-only-whitespace] [fixture:
gitgraph/accdescr-unicode-trim] [fixture: gitgraph/common-third-values]
[fixture: gitgraph/lex-hidden-directive-accdescr-eof]

### GitgraphAccDescrBlockStatement

| Field       | Type                        | Meaning                   |
| ----------- | --------------------------- | ------------------------- |
| `value`     | GitgraphLiteral or null     | Written common value.     |
| `textAfter` | list of GitgraphIgnoredText | Hidden suffix before EOL. |

value is the brace interior with common whitespace removed only at its outer
ends. It is null for whitespace/common-trivia-only content. Internal
indentation, physical line endings, quotes and backslashes remain written text.
The first closing brace is required, so no closed field is needed. [fixture:
gitgraph/lex-description-empty-hidden-tail] [fixture: gitgraph/accdescr-block]
[fixture: gitgraph/common-block-only-whitespace] [fixture:
gitgraph/lex-description-block-only-directive] [fixture:
gitgraph/lex-description-block-only-comment]

Child fields: `value`, `textAfter`. Range: accDescr through its last value
character, or the keyword/colon/closing brace that completes its empty form,
extended through the last textAfter form. Exclude EOL and unrelated outside
padding. Hidden forms after a visible EOL are body items, not suffixes. Keep
repeated and empty common statements. [fixture:
gitgraph/lex-description-empty-hidden-tail] [fixture: gitgraph/accdescr-block]
[fixture: gitgraph/common-block-only-whitespace] [fixture:
gitgraph/lex-description-block-only-directive] [fixture:
gitgraph/lex-description-block-only-comment] [fixture:
gitgraph/common-third-values] [fixture: gitgraph/lex-hidden-directive-block-eof]

### GitgraphLiteral

| Field   | Type   | Meaning                    |
| ------- | ------ | -------------------------- |
| `value` | string | Written common-value text. |

No child fields. Range: the first through last source character of the value
defined by its statement, spanning internal common trivia. Exclude common
directives, comment regions and selected semicolons from value; retain all other
source text, including whitespace that the statement owns. Do not make an empty
literal for null. Quotes remain literal content, not StringLiteral. [fixture:
gitgraph/common-title-quoted-escape] [fixture: gitgraph/common-title-open-quote]
[fixture: gitgraph/directive-title] [fixture: gitgraph/comment-block] [fixture:
gitgraph/title-conversion] [fixture: gitgraph/style-acctitle] [fixture:
gitgraph/lex-description-line-null]

### GitgraphIgnoredText

| Field   | Type                    | Meaning                                  |
| ------- | ----------------------- | ---------------------------------------- |
| `kind`  | yaml-block or directive | Which whole hidden form.                 |
| `value` | string                  | Nonempty written form, including fences. |

No child fields. Range: the recognized `---` or `%%{` opener through its
selected closer. Exclude optional preceding ASCII padding and the LF consumed
immediately after the closer. Retain internal written line endings, LS/PS and
padding. The appended LF never enters a range or value. Empty bodies still have
nonempty fence text. [fixture: gitgraph/lex-yaml-empty-body] [fixture:
gitgraph/lex-yaml-three-adjacent-fences] [fixture: gitgraph/lex-yaml-body-ls-ps]
[fixture: gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/lex-hidden-yaml-block-eof] [fixture:
gitgraph/lex-hidden-directive-commit-closing-space]

Use yaml-block for hidden YAML and directive for hidden DIRECTIVE. value omits
internal common directives/comment regions and selected semicolons, although its
range spans them. These nodes neither contain YAML properties nor act as root
frontmatter/directives. A global directive inside one still has its common
effect. An earlier string/common block owns hidden-looking text as content; a
line value owns apparent YAML but ends before a percent pair, whose hidden form
can be textAfter. Failed hidden forms falling back to native comments are shared
Comments. [fixture: gitgraph/lex-hidden-yaml-global-directive-body] [fixture:
gitgraph/lex-hidden-yaml-global-comment-body] [fixture:
gitgraph/lex-hidden-directive-global-comment-body] [fixture:
gitgraph/lex-yaml-common-init-effect] [fixture:
gitgraph/lex-hidden-directive-common-init-effect] [fixture:
gitgraph/lex-hidden-directive-string] [fixture:
gitgraph/lex-hidden-directive-block] [fixture:
gitgraph/lex-hidden-yaml-after-title] [fixture:
gitgraph/lex-title-bare-hidden-tail] [fixture:
gitgraph/lex-hidden-directive-fallback-complete-statement]

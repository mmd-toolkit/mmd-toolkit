# gitgraph positions

Japanese version: [gitgraph.ja.md](./gitgraph.ja.md)

The [diagram](../../../spec/docs/ast/gitgraph.md#gitgraphdiagram) starts at its
first retained pre-header form, or its header word, and ends at its last written
header/body component; outside padding, Comments and passed bare lines do not
extend it. [fixture: gitgraph/header-only] [fixture: gitgraph/header-tb]
[fixture: gitgraph/lex-yaml-after-comment] [fixture:
gitgraph/lex-hidden-directive-second-scan] [fixture:
gitgraph/detect-bare-brace-eof-header]

[Statements](../../../spec/docs/ast/gitgraph.md#gitgraphcommitstatement) run
from their operation or common keyword through their final written component or
hidden suffix, excluding EOL. [fixture: gitgraph/gram-all-fields] [fixture:
gitgraph/gram-commit-repeated-options] [fixture:
gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/lex-hidden-directive-checkout-eof] [fixture:
gitgraph/lex-hidden-directive-merge-eof] [fixture:
gitgraph/lex-hidden-directive-cherry-pick-eof] [fixture:
gitgraph/lex-hidden-directive-title-eof] [fixture:
gitgraph/lex-hidden-directive-acctitle-eof] [fixture:
gitgraph/lex-hidden-directive-accdescr-eof] [fixture:
gitgraph/lex-hidden-directive-block-eof]

An [option](../../../spec/docs/ast/gitgraph.md#gitgraphidoption) starts at its
first preceding hidden form, or its word/opening quote when there is none, and
ends at its quoted, numeric or fixed-word value. [fixture:
gitgraph/gram-all-fields] [fixture: gitgraph/lex-option-between-options-hidden]
[fixture: gitgraph/lex-option-before-message-hidden] [fixture:
gitgraph/lex-option-before-type-value-hidden] [fixture:
gitgraph/lex-branch-between-name-order-hidden] [fixture:
gitgraph/gram-cherry-pick-merge-parent]

[Shared leaves](../../../spec/docs/ast.md#shared-leaf-nodes) have their complete
written ranges: quotes surround strings, and all digits belong to numbers even
when double conversion loses precision or overflows. [fixture:
gitgraph/gram-branch-single-quotes] [fixture: gitgraph/gram-branch-empty]
[fixture: gitgraph/lex-reference-shape] [fixture: gitgraph/number-precision]
[fixture: gitgraph/number-overflow]

A [common literal](../../../spec/docs/ast/gitgraph.md#gitgraphliteral) spans its
specified value, including owned line padding or only the trimmed block
interior, and internal common trivia; null makes no literal. [fixture:
gitgraph/title-conversion] [fixture: gitgraph/common-acctitle-only-whitespace]
[fixture: gitgraph/common-accdescr-only-whitespace] [fixture:
gitgraph/accdescr-block] [fixture: gitgraph/directive-title] [fixture:
gitgraph/comment-block] [fixture: gitgraph/lex-description-line-null]

[Ignored text](../../../spec/docs/ast/gitgraph.md#gitgraphignoredtext) spans its
opener through selected closer, without preceding padding or consumed following
LF, retaining internal trivia in its range but omitting it from its value.
[fixture: gitgraph/lex-yaml-empty-body] [fixture:
gitgraph/lex-yaml-three-adjacent-fences] [fixture: gitgraph/lex-yaml-body-ls-ps]
[fixture: gitgraph/lex-hidden-directive-commit-eof] [fixture:
gitgraph/lex-hidden-yaml-global-directive-body] [fixture:
gitgraph/lex-hidden-yaml-global-comment-body]

The
[written history](../../../spec/docs/diagrams/gitgraph.md#state-of-the-written-history)
adds no node ranges: empty ids remain quoted leaves, repeated definitions remain
separate statements, and type options retain their written positions even when
history checks classify a commit differently for acceptance. [fixture:
gitgraph/db-state-empty-ids-are-fresh] [fixture:
gitgraph/db-state-replacement-removes-merge-kind] [fixture:
gitgraph/db-state-replacement-source-origin] [fixture:
gitgraph/db-state-visual-type-still-merge]

Branch order, checkout, merge, cherry-pick and common statements keep the source
ranges above while history checks track tips and HEAD independently. [fixture:
gitgraph/db-state-empty-branch-heads] [fixture: gitgraph/db-state-checkout-head]
[fixture: gitgraph/db-state-merge-head-and-source] [fixture:
gitgraph/db-state-cherry-head-and-source] [fixture:
gitgraph/db-state-common-forms-preserve-head]

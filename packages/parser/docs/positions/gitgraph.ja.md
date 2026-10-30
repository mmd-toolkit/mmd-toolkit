# gitgraph の位置

英語版: [gitgraph.md](./gitgraph.md)

[図](../../../spec/docs/ast/gitgraph.md#gitgraphdiagram)は、
ヘッダー前に保持した最初の形式、なければヘッダーの語から、
最後に書かれたヘッダーまたは本文の成分までです。
外側の空白・Comment・通過した裸の行は範囲を延ばしません。
[fixture: gitgraph/header-only] [fixture: gitgraph/header-tb]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: gitgraph/lex-hidden-directive-second-scan]
[fixture: gitgraph/detect-bare-brace-eof-header]

[文](../../../spec/docs/ast/gitgraph.md#gitgraphcommitstatement)は、
操作または共通キーワードから最後の成分または隠れた接尾辞までで、
EOL を含めません。 [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/gram-commit-repeated-options]
[fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/lex-hidden-directive-checkout-eof]
[fixture: gitgraph/lex-hidden-directive-merge-eof]
[fixture: gitgraph/lex-hidden-directive-cherry-pick-eof]
[fixture: gitgraph/lex-hidden-directive-title-eof]
[fixture: gitgraph/lex-hidden-directive-acctitle-eof]
[fixture: gitgraph/lex-hidden-directive-accdescr-eof]
[fixture: gitgraph/lex-hidden-directive-block-eof]

[オプション](../../../spec/docs/ast/gitgraph.md#gitgraphidoption)は、
その前の最初の隠れた形式、なければ語または開始引用符から、
引用文字列・数値・固定語の値の終端までです。 [fixture: gitgraph/gram-all-fields]
[fixture: gitgraph/lex-option-between-options-hidden]
[fixture: gitgraph/lex-option-before-message-hidden]
[fixture: gitgraph/lex-option-before-type-value-hidden]
[fixture: gitgraph/lex-branch-between-name-order-hidden]
[fixture: gitgraph/gram-cherry-pick-merge-parent]

[共有の葉](../../../spec/docs/ast.md#shared-leaf-nodes)は、
書かれた範囲全体を持ちます。
文字列は引用符を含み、
数値は double 変換で精度を失う場合やオーバーフローする場合も全桁を含みます。
[fixture: gitgraph/gram-branch-single-quotes]
[fixture: gitgraph/gram-branch-empty] [fixture: gitgraph/lex-reference-shape]
[fixture: gitgraph/number-precision] [fixture: gitgraph/number-overflow]

[共通リテラル](../../../spec/docs/ast/gitgraph.md#gitgraphliteral)は、
指定された値の範囲で、行が所有する空白または両端を除いたブロック内容と、
内部の共通 trivia を含みます。
null にはリテラルを作りません。 [fixture: gitgraph/title-conversion]
[fixture: gitgraph/common-acctitle-only-whitespace]
[fixture: gitgraph/common-accdescr-only-whitespace]
[fixture: gitgraph/accdescr-block] [fixture: gitgraph/directive-title]
[fixture: gitgraph/comment-block] [fixture: gitgraph/lex-description-line-null]

[無視されるテキスト](../../../spec/docs/ast/gitgraph.md#gitgraphignoredtext)は、
開始から選択した終端までで、先行する空白と消費する直後の LF を除きます。
内部の trivia は範囲に含め、値からは除きます。
[fixture: gitgraph/lex-yaml-empty-body]
[fixture: gitgraph/lex-yaml-three-adjacent-fences]
[fixture: gitgraph/lex-yaml-body-ls-ps]
[fixture: gitgraph/lex-hidden-directive-commit-eof]
[fixture: gitgraph/lex-hidden-yaml-global-directive-body]
[fixture: gitgraph/lex-hidden-yaml-global-comment-body]

[書かれた履歴](../../../spec/docs/diagrams/gitgraph.md#state-of-the-written-history)
のためにノード範囲は追加しません。
空の id は引用された葉のままで、繰り返した定義は別々の文として残り、
履歴検査が受理のために commit を別の種類として扱う場合も、
型オプションは書かれた位置を保持します。
[fixture: gitgraph/db-state-empty-ids-are-fresh]
[fixture: gitgraph/db-state-replacement-removes-merge-kind]
[fixture: gitgraph/db-state-replacement-source-origin]
[fixture: gitgraph/db-state-visual-type-still-merge]

履歴検査は tip と HEAD を独立して追跡し、
branch の順序・checkout・merge・cherry-pick・共通文は、
前述のソース範囲を保持します。 [fixture: gitgraph/db-state-empty-branch-heads]
[fixture: gitgraph/db-state-checkout-head]
[fixture: gitgraph/db-state-merge-head-and-source]
[fixture: gitgraph/db-state-cherry-head-and-source]
[fixture: gitgraph/db-state-common-forms-preserve-head]

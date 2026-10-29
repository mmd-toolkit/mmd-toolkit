# Agentflow の位置

英語版: [agentflow.md](./agentflow.md)

この文書は [positions.md](../positions.md) を、
[ast/agentflow.md](../../../spec/docs/ast/agentflow.md) のノードについて補う。
トークン境界は [tokens/agentflow.md](../tokens/agentflow.md) に定義する。

## 範囲

図の範囲はヘッダーキーワードから最後の図のトークンまでで、
末尾の区切りセミコロンも含む。
その後のコメント、directive、無視セミコロンでは範囲を延ばさない。
ただし、最後の未閉鎖の説明文がソースの EOF まで延びる場合は、
図もその文の範囲全体を含む。
Root はソース全体を覆う。 [fixture: agentflow/header-only]
[fixture: agentflow/header-empty-document]
[fixture: agentflow/gram-tail-node-semicolons]
[fixture: agentflow/gram-tail-edge-comment]
[fixture: agentflow/gram-tail-edge-directive]
[fixture: agentflow/lex-style-preprocessing-semicolon]

EmptyStatement は一つのセミコロンを覆う。
区切りのセミコロンはどの文にも属さない。
[fixture: agentflow/gram-class-double-semicolon]
[fixture: agentflow/gram-data-double-semicolon]

Flow と Global の文は終了の end キーワードまでで、その後の空白を含めない。
Connector は最後の名前、タイトルの区切り、または見出しのデータブロックまでで、
区切りを含めない。 [fixture: agentflow/gram-flow-all-forms]
[fixture: agentflow/gram-global] [fixture: agentflow/lex-global-tab-space]
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-connector-name-whitespace-only]
[fixture: agentflow/db-connector-empty-id-data]

各見出しは書かれた文として個別に保つ。
繰り返した connector と flow、名前のない flow も含む。
[fixture: agentflow/db-connector-repeated-without-title]
[fixture: agentflow/db-flow-repeat-before-unnamed]

Name は最初の部分から最後の部分までで、部分間のソースの間隙を含む。
各 Label 断片は名前の生成規則が読む空白を保持する。
角括弧のタイトルの前の空白も含む。
click コンテキストを抜ける空白は断片の外にあり、
その後に別の部分が続く場合にだけ Name の範囲内に入る。
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/lex-connector-name-click-state]
[fixture: agentflow/gram-flow-name-space-before-title]
[fixture: agentflow/gram-flow-name-whitespace-only]
[fixture: agentflow/lex-name-click-exit-extra-space]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/name-click-exit-before-title-tab]
[fixture: agentflow/name-click-exit-before-title-lf]
[fixture: agentflow/name-click-exit-before-title-ls]
[fixture: agentflow/name-click-exit-before-data-tab]
[fixture: agentflow/name-click-exit-before-separator-space]
[fixture: agentflow/name-heading-title-interior-padding]

click と、その後で認識した空文字列または空 markdown 文字列は、
それぞれ IgnoredText の範囲を持つ。
必須の Label はその後にあっても、click の前にあってもよい。
空形式によって、その Label の範囲は延びない。
[fixture: agentflow/lex-name-click-empty-string-before-text]
[fixture: agentflow/lex-name-click-empty-markdown-before-text]
[fixture: agentflow/lex-name-click-empty-string-before-string]
[fixture: agentflow/lex-name-click-empty-string-then-call]
[fixture: agentflow/lex-connector-name-click-empty-string-tail]

connector 名で消去される空文字列または空 markdown 文字列に隣接するテキストは、
IgnoredText の範囲の直後から独立した Label になる。
空文字列と空 markdown 文字列が連続する場合も、
それぞれ IgnoredText の範囲を持つ。
セミコロンで始まる場合や終わる場合、唯一の寄与する Label の場合も、
Name はその Label を含む。
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]

Vertex は id から最後の図形、クラス接尾辞、またはデータブロックまでを覆う。
VertexGroup と VertexStatement も最後の頂点または対象グループまで延びる。
Shape は完全な両区切りを含む。
ShapeProperty は名前、コロン、値を覆い、周囲の縦棒を含めない。
[fixture: agentflow/gram-style-suffix] [fixture: agentflow/gram-group-data]
[fixture: agentflow/gram-edge-chain] [fixture: agentflow/gram-bracket-shapes]
[fixture: agentflow/gram-props]

Link は辺 id または最初の矢印から対象グループまでを覆う。
Arrow と OpeningArrow は矢印の文字を覆い、周囲の空白を含めない。
分割形式のラベルは終了矢印より前に書くが、訪問は矢印が先になる。
[fixture: agentflow/gram-reference-edge-id] [fixture: agentflow/gram-edge-id]
[fixture: agentflow/gram-split-edge-id]
[fixture: agentflow/gram-reference-newlines-around-arrow]
[fixture: agentflow/gram-split-sequence-label]

Label は先頭に文字列があればその区切りを含み、続く裸のテキストまでを覆う。
裸の外側の空白は含めず、空白だけのラベルはその空白トークンを覆う。
裸のラベル内のコメントは範囲内にあるが、値とトークンには含めない。
[fixture: agentflow/gram-node-quoted-padding]
[fixture: agentflow/gram-split-edge-string-bare-tail]
[fixture: agentflow/gram-label-whitespace-only]
[fixture: agentflow/comment-label-keeps-interior-spaces]
[fixture: agentflow/comment-square-after-string-padding]

DataBlock は一つの完全な @{ から } までで、別の値範囲はない。
内部は書かれた空白を保持し、波括弧後に読み方が畳まれる空白も含む。
[fixture: agentflow/db-data-block-empty-multiline]
[fixture: agentflow/gram-data-adjacent-multiline-blocks]
[fixture: agentflow/lex-brace-string-keeps-blank-line]
[fixture: agentflow/db-connector-empty-id-data]
[fixture: agentflow/div-data-percent-line-is-content]
[fixture: agentflow/div-metadata-yaml-self-alias]

Style、ClassDef、番号付き LinkStyle、DefaultLinkStyle の文は、
末尾空白を除く最後の単位までを覆う。
スタイルが一つの null だけなら、それぞれ対象 id、クラス名リスト、添字、
default キーワードで範囲が終わる。
コンマの後が末尾の null スタイルなら、そのコンマで終わる。
Literal はスタイルの先頭空白を保持し、末尾空白を含めない。
[fixture: agentflow/gram-style-all-null]
[fixture: agentflow/gram-classdef-all-null]
[fixture: agentflow/gram-linkstyle-all-null]
[fixture: agentflow/gram-default-linkstyle-all-null]
[fixture: agentflow/gram-classdef-trailing-null-style]
[fixture: agentflow/gram-linkstyle-trailing-null-style]
[fixture: agentflow/gram-default-linkstyle-trailing-null-style]
[fixture: agentflow/db-node-style-first-leading-spaces]
[fixture: agentflow/gram-style-null-before-comment-nbsp]

Class の文は二番目の Identifier までを覆う。
click の文は最初の click から最後のコールバック単位、URL、ツールチップ、
またはリンク先までを覆う。
保持する接頭辞は、書かれた位置にある子ノードになる。
コールバックの Literal は ( の前の名前の空白と、丸括弧内の引数の空白を保持する。
[fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
[fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/gram-click-callback-space-args]

コールバック名の内部の行終端は、その Literal の範囲内に入る。
CRLF も書かれたまま保持する。 [fixture: agentflow/lex-callback-name-lf]
[fixture: agentflow/lex-callback-name-crlf]
[fixture: agentflow/lex-callback-name-u2028]
[fixture: agentflow/lex-callback-name-u2029]

IgnoredText は一つの保持する消去形式、
または方向の前後の空白を除いたテキストを覆う。
区切りと内部空白を含む。
Direction の文は行の末尾空白を除く全体を覆い、キーワードと値の間の改行も含む。
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/gram-direction-value-next-line]

保持する説明ブロック内の directive は IgnoredText の範囲内にある。
RawText トークンを分け、両側の空白はそれぞれのトークンに残る。
[fixture: agentflow/lex-directive-in-name-empty-block-padding]

AccTitle と行形式の AccDescr は、値が null ならコロンまでを覆う。
値があればその最後の文字までを覆う。
閉じた説明ブロックは終了波括弧を含む。
閉じていないブロックはソースの最後の文字までを覆う。
閉じた空ブロックは、文法が文として割り当てる位置では独立した文に保つ。
未閉鎖のブロックとそれを含む図は、末尾が空白、CRLF、
directive の場合もソースの EOF までを覆う。
読み飛ばした trivia のためにトークンを作ることはない。
[fixture: agentflow/gram-accdescr-open-trailing-spaces-eof]
[fixture: agentflow/gram-accdescr-open-crlf-eof]
[fixture: agentflow/gram-accdescr-open-directive-eof]
[fixture: agentflow/gram-accdescr-open-text-directive-eof]
[fixture: agentflow/gram-accdescr-open-text-spaces-eof]
[fixture: agentflow/frontmatter-accdescr-open-trailing-spaces-eof]
[fixture: agentflow/db-acctitle-eof] [fixture: agentflow/db-accdescr-eof]
[fixture: agentflow/db-acctitle-next-line]
[fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]
[fixture: agentflow/db-accessibility-empty-block]
[fixture: agentflow/gram-empty-description-after-header-direction]
[fixture: agentflow/gram-empty-description-after-flow-title]
[fixture: agentflow/gram-empty-description-after-connector-title]
[fixture: agentflow/gram-empty-description-after-global]

# Agentflow のトークン

英語版: [agentflow.md](./agentflow.md)

この文書は `agentflow` のトークンを定義する。
ノードは [ast/agentflow.md](../../../spec/docs/ast/agentflow.md)、
共通規則は [tokens.md](../tokens.md) に定義する。

## トークン

文法の各項目には次の種別を与える。
空白だけの文字列は、値として保持する場合を除き trivia になる。
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-label-whitespace-only]
[fixture: agentflow/gram-flow-name-whitespace-only]

| 種別         | 文法の項目                                                                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダーとその方向、構造を表す flow、connector、global、end、style、classDef、class、linkStyle、interpolate、default、click、call、href、direction と方向値、リンク先、accTitle、accDescr。                                                     |
| `Identifier` | 頂点 id、クラス接尾辞、id リストの各部分、click id の各部分、辺 id、補間名、裸のコールバック名、図形プロパティの各オペランド。                                                                                                                  |
| `Numeric`    | linkStyle の各添字。                                                                                                                                                                                                                            |
| `String`     | 空でない string または markdown-string 単位。                                                                                                                                                                                                   |
| `RawText`    | ラベル、Name の断片、保持する無視テキスト、スタイル、call 後のコールバック名と引数、アクセシビリティ値、データ内部。                                                                                                                            |
| `Punctuator` | 図形の開始・終了区切り、矢印と開始矢印、プロパティのコロンと縦棒、ラベルの縦棒、グループの &、クラス記号、リストと click のコンマ、区切りのセミコロン、辺 id の @、データの開始・終了、アクセシビリティのコロンと波括弧、コールバックの丸括弧。 |

[fixture: agentflow/db-all-fields] [fixture: agentflow/gram-props]
[fixture: agentflow/gram-classdef-multi]
[fixture: agentflow/gram-click-id-empty-ends]
[fixture: agentflow/gram-reference-edge-id]
[fixture: agentflow/gram-split-edge-id] [fixture: agentflow/gram-global]
[fixture: agentflow/gram-flow-all-forms]
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/gram-linkstyle-default]
[fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/db-flow-repeat-before-unnamed]
[fixture: agentflow/db-connector-repeated-without-title]

id とリストの各部分は、複数単位でも一つの Identifier 項目になる。
部分を分けるコンマは独立した Punctuator 項目で、 null の部分にはトークンがない。
[fixture: agentflow/gram-id-numbers-unicode]
[fixture: agentflow/gram-class-target-empty-ends]
[fixture: agentflow/gram-classdef-trailing-empty-name]
[fixture: agentflow/gram-click-id-empty-ends]

図形の開始区切り全体は一つの Punctuator 項目で、終了区切りも同様になる。
円と六角形の二単位の区切りも含む。 [fixture: agentflow/gram-bracket-shapes]
[fixture: agentflow/div-directive-in-circle-opening]
[fixture: agentflow/div-directive-in-hexagon-closing]

トークンは、一つの項目の単位が連続する最大の列である。
両端の空白は、以下で定める値の空白を除いて含めない。
共通規則により、
directive と選択された無視セミコロンは RawText と String を分割する。
分割された文字列の種別は StringFragment で、他の種別の内部での分割は拒否する。
[fixture: agentflow/directive-in-string] [fixture: agentflow/directive-in-data]
[fixture: agentflow/lex-directive-in-classdef-value]
[fixture: agentflow/lex-style-preprocessing-semicolon]
[fixture: agentflow/div-directive-in-id]
[fixture: agentflow/div-ignored-semicolon-in-arrow]

ラベルの最初の文字列に続くテキストは、内部の先頭空白を保持する。
裸のラベルの外側の空白は含めない。
空白だけのラベルには、その空白の RawText トークンがある。
[fixture: agentflow/gram-node-quoted-padding]
[fixture: agentflow/gram-split-edge-string-bare-tail]
[fixture: agentflow/gram-label-whitespace-only]
[fixture: agentflow/lex-edge-whitespace-label]

Name の断片は、名前の生成規則が読む空白をすべて保持する。
空白だけの断片と、明示的なタイトルの前の空白も含む。
Name または click 接頭辞のフィールドで保持する消去形式は、
それぞれ独立した RawText 項目で、区切り全体を含む。
消去形式には click、空の説明ブロック、空文字列、空 markdown 文字列、
空の call がある。 [fixture: agentflow/gram-flow-name-space-before-title]
[fixture: agentflow/gram-flow-name-whitespace-only]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
[fixture: agentflow/db-connector-empty-id-data]
[fixture: agentflow/lex-directive-in-name-empty-block-padding]

click の後で認識した空の通常・markdown 文字列は IgnoredText 項目になり、
Label も String トークンも作らない。
後続する初期断片は引用形式でもよく、前にある Label が名前全体を供給してもよい。
[fixture: agentflow/lex-name-click-empty-string-before-text]
[fixture: agentflow/lex-name-click-empty-markdown-before-text]
[fixture: agentflow/lex-name-click-empty-string-before-string]
[fixture: agentflow/lex-name-click-empty-string-then-call]
[fixture: agentflow/lex-connector-name-click-empty-string-tail]

connector 名では、
click 後の消去される空文字列または空 markdown 文字列に隣接するテキストは、
独立した Label 断片と RawText 項目になる。
空文字列の直後に空 markdown 文字列が続く場合も、
それぞれ独立した RawText 項目として保持する。
そのテキストの先頭や末尾のセミコロンも RawText に残る。
その断片が名前の唯一の Label を供給する場合も同じである。
flow 名では、どちらの空形式でも隣接する裸のテキストを引き続き拒否する。
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/gram-name-click-empty-string-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]
[fixture: agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

click コンテキストを抜ける一文字の空白は、Name の断片にもトークンにも属さない。
その後の通常の空白は次の断片に属する。
[fixture: agentflow/lex-name-click-exit-tab]
[fixture: agentflow/lex-name-click-exit-nbsp]
[fixture: agentflow/lex-name-click-exit-ls]
[fixture: agentflow/lex-name-click-exit-ps]
[fixture: agentflow/lex-name-click-exit-crlf]
[fixture: agentflow/lex-name-click-exit-extra-space]

各スタイルは一つの RawText 項目になる。
必須の一空白の間隙やコンマの後の先頭空白を保持し、末尾空白は含めない。
空白だけのスタイルは null で、トークンがない。
classDef スタイル内のエスケープされたコンマは同じ項目に残る。
[fixture: agentflow/db-node-style-first-leading-spaces]
[fixture: agentflow/db-classdef-first-leading-tab]
[fixture: agentflow/gram-style-whitespace-after-comma]
[fixture: agentflow/gram-style-whitespace-only]
[fixture: agentflow/gram-classdef-escaped-comma]
[fixture: agentflow/gram-empty-description-splits-interpolate-spaces]
[fixture: agentflow/gram-style-null-before-comment-nbsp]

call 後のコールバック名は開始丸括弧の前の空白を保持する。
空でない引数は両端の空白を保持する。
call と丸括弧は親の文に属する。
[fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/gram-callback-arguments-after-second-call]

コールバック名の内部の行終端は、その RawText 項目に残る。
CRLF も書かれたまま保持する。 [fixture: agentflow/lex-callback-name-lf]
[fixture: agentflow/lex-callback-name-crlf]
[fixture: agentflow/lex-callback-name-u2028]
[fixture: agentflow/lex-callback-name-u2029]

データ内部は、引用符と両端の空白を含む一つの RawText 項目になる。
隣接ブロックの開始、内部、終了はそれぞれ別の項目に保つ。
[fixture: agentflow/db-data-block-empty-multiline]
[fixture: agentflow/gram-data-adjacent-multiline-blocks]
[fixture: agentflow/gram-data-null-document]
[fixture: agentflow/db-connector-empty-id-data]

共通の除去が適用されないとき、
データ内部のパーセント行や YAML エイリアスは RawText に残る。
その行の Comment レコードはない。
[fixture: agentflow/div-data-percent-line-is-content]
[fixture: agentflow/div-metadata-yaml-self-alias]

## コメント

仕様の既定サイズ規則が、共通のコメント領域除去の適用を決める。
frontmatter と directive の除去後、
正規化した長さが UTF-16 で 50000 単位以下なら、
図の lexer はコメント行と先頭空白を受け取る。
[fixture: agentflow/comment-default-size-equal]
[fixture: agentflow/comment-default-size-equal-crlf]
[fixture: agentflow/comment-default-size-equal-inline-directive]
[fixture: agentflow/comment-default-size-equal-frontmatter]
[fixture: agentflow/comment-default-size-above-crlf]
[fixture: agentflow/comment-default-size-above-inline-directive]
[fixture: agentflow/comment-default-size-above-frontmatter]

除外する frontmatter には、
終了区切り後の空行や空白だけの行などの末尾 trivia も含む。
これらは既定サイズの計数に加えない。
最初の空でない本文行の字下げは、測る本文に残す。
[fixture: agentflow/frontmatter-extra-trivia-below]
[fixture: agentflow/frontmatter-extra-trivia-boundary]
[fixture: agentflow/frontmatter-extra-whitespace-line-boundary]
[fixture: agentflow/frontmatter-extra-trivia-above]
[fixture: agentflow/frontmatter-extra-trivia-indent-above]

図のコメントは記号 %% の Comment レコードであり、トークンはない。
範囲は最初の % から LF の前までで、内部の directive も含めてソースを保持する。
文のコメントは直前の ASCII 空白とタブを trivia として読める。
ラベルのコメントでは、直前の空白はラベルのテキストに残る。
読み始めた id-run の内部の %% は id のテキストに残る。
[fixture: agentflow/comment-node-spaced]
[fixture: agentflow/comment-directive-in-body-u2029]
[fixture: agentflow/comment-open-directive-takes-lf]
[fixture: agentflow/comment-double-percent-inside-id]
[fixture: agentflow/comment-square-after-string-padding]
[fixture: agentflow/comment-slanted-after-slash-padding]
[fixture: agentflow/comment-ellipse-tab-padding]

文法がスタイルの間隙を必要とする位置でも、文のコメントは ASCII の空白を読む。
直前の U+00A0 はスタイルの空白として残る。
[fixture: agentflow/gram-style-null-before-comment]
[fixture: agentflow/gram-style-null-before-comment-nbsp]

コメントは裸のラベルを別々の RawText の列へ分ける。
ラベルが読む内部の空白と LF は保持する。
コメントとそのテキストは、これらのトークンとラベル値の外にある。
共通の除去が適用されないとき、文字列、リンクテキスト、コールバックテキスト、
アクセシビリティ値、データでは、コメントに見えるテキストも内容として保持する。
[fixture: agentflow/comment-label-keeps-interior-spaces]
[fixture: agentflow/comment-quoted-label]
[fixture: agentflow/comment-markdown-label]
[fixture: agentflow/comment-split-edge-label]
[fixture: agentflow/lex-flow-name-string-comment-content]
[fixture: agentflow/lex-accessibility-block-comment]
[fixture: agentflow/db-metadata-comment-directive-body]
[fixture: agentflow/comment-before-callback-does-not-join-lines]

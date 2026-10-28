# flowchart のトークン

英語版: [flowchart.md](./flowchart.md)

この文書は、`@mmd-toolkit/parser` が作る木の、図種 `flowchart-v2`、
`flowchart-elk`、`swimlane`のトークンを定めます。
ノードは、
仕様の [`ast/flowchart.ja.md`](../../../spec/docs/ast/flowchart.ja.md) が定めます。
すべての図種に共通するトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/flowchart.ja.md](../../../spec/docs/diagrams/flowchart.ja.md#字句構造) の単位から作ります。
すべて空白でない単位と、すべて空白のラベルの単位は、
どれも [文法](../../../spec/docs/diagrams/flowchart.ja.md#文法) の 1 つの**項目**に属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header-keyword` と `header-direction` の単位。文を始めるか続ける `subgraph`、`end`、`style`、`classDef`、`class`、`linkStyle`、`interpolate`、`href`、`accTitle`、`accDescr` の単位。クリックの文の `click` の単位。クリックの文の `call` の単位。`linkStyle` の文の `default` の単位。方向の文の `direction` と `direction-value` の単位。`link-target` の単位                                                                                          |
| `Identifier` | [単位の中のディレクティブ](../../../spec/docs/diagrams/flowchart.ja.md#単位の中のディレクティブ) の名前の単位。`id`、`id-list-part`、`name` は、そのすべての単位で 1 つの項目で、`[\|` で書いた長方形の 2 つの `id-run` は、それぞれが 1 つの項目                                                                                                                                                                                                         |
| `Numeric`    | `linkStyle` の文の `number` の単位                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `String`     | `string` と `markdown-string` の単位                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/flowchart.ja.md#単位の中のディレクティブ) のテキストの単位。`subgraph-name` の文字列と markdown 文字列以外の単位は、文字列で区切られない並びごとに 1 つの項目で、木のスタイルは、そのすべての単位で 1 つの項目                                                                                                                                                                                     |
| `Punctuator` | 形を開く単位（まとめて 1 つの項目）。規則 `shape` の選択肢でラベルより前にある単位で、最後の選択肢では `"[\|"` だけ。規則 `shape` の選択肢でラベルより後にある単位（まとめて 1 つの項目）。すべて空白でない他の単位（それぞれが 1 つの項目）。リンクのラベルを囲む `\|`、`[\|` で書いた長方形の `:` と `\|`、`&`、`:::`、いま挙げたもの以外の `,`、クリックの文の `click-comma` の単位、`:`、`;`、`@`、`data-start` と `}`、矢印と開く矢印、`{`、`(`、`)` |

[fixture: flowchart/tokens-diagram-trailing-separator]
[fixture: flowchart/spec-flow-singlenode-a5fa3415]
[fixture: flowchart/db-subgraph-member-empty-statement]
[fixture: flowchart/gram-style-id-comma]
[fixture: flowchart/gram-classdef-escaped-comma-one-style]
[fixture: flowchart/db-class-ids-empty-first]
[fixture: flowchart/db-linkstyle-interpolate-only]
[fixture: flowchart/db-linkstyle-default-no-fill]
[fixture: flowchart/gram-click-href]
[fixture: flowchart/lex-acc-title-space-before-colon]
[fixture: flowchart/db-acc-descr-line-alone]
[fixture: flowchart/lex-acc-descr-block-line-feed-before-brace]
[fixture: flowchart/tokens-callback-name-trailing-space]
[fixture: flowchart/db-direction-statement-top-level]
[fixture: flowchart/lex-direction-line-same-value-twice]
[fixture: flowchart/gram-edge-id]
[fixture: flowchart/gram-rect-property]
[fixture: flowchart/gram-label-string-then-text]
[fixture: flowchart/gram-string-markdown-then-text]
[fixture: flowchart/db-arrow-dash-head-length]
[fixture: flowchart/tokens-pipe-label-space]
[fixture: flowchart/gram-subgraph-name-string-then-text]
[fixture: flowchart/gram-data-block-space-only]
[fixture: flowchart/tokens-circle-hexagon-delimiters]
[fixture: flowchart/gram-group-two-vertices]
[fixture: flowchart/lex-triple-colon-after-id]
[fixture: flowchart/gram-click-comma-only-href]

コメント領域かディレクティブが切る `String` のトークンは、
`StringFragment` のトークンになります。
[トークンの中のコメント領域](../tokens.ja.md#トークンの中のコメント領域) と、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン) を参照。 [fixture: flowchart/tokens-string-literal-comment-line]
[fixture: flowchart/lex-directive-in-click-href-string]

**トークン**は、同じ項目で同じ種類の単位が、
その項目の空白の単位だけを挟んで続く最長の並びから、両端の空白を除いたものです。
ただし、mermaid.js が読む空白は除きません。
`,` の後のスタイルの始まり、タイトルのない subgraph の名前の後、
`call` の後のコールバックの名前の終わり（`(` の前）、コールバックの引数の両端、
ラベル、リンクのテキスト、subgraph の名前が始める、
文字列か markdown の文字列の後のテキストの始まりの空白です（[FlowchartStyleStatement](../../../spec/docs/ast/flowchart.ja.md#flowchartstylestatement)、
[FlowchartSubgraphStatement](../../../spec/docs/ast/flowchart.ja.md#flowchartsubgraphstatement)、
[ラベル](../../../spec/docs/diagrams/flowchart.ja.md#ラベル) を参照）。
`A["x" y]` のラベルはトークン `"x"` と ` y` を持ち、
文字列の後にディレクティブがある `A["x" %%{init: {}}%% y]` では、 `"x"`、空白、
ディレクティブ、
` y` を持ちます。 [fixture: flowchart/gram-label-string-then-text]
[fixture: flowchart/tokens-label-string-then-text-space]
[fixture: flowchart/tokens-label-string-directive-then-text]
[fixture: flowchart/tokens-link-text-string-then-text-space]
[fixture: flowchart/tokens-subgraph-name-string-directive-then-text]
[fixture: flowchart/db-style-tabs-after-comma]
[fixture: flowchart/db-subgraph-name-trailing-space]
`click A call f (x)` のコールバックの名前は、
その後の空白を含むトークン `f` を持ちます。 [fixture: flowchart/tokens-callback-name-trailing-space]
`click A call f( x, y )` の引数は、
空白を含むトークン `x, y` を持ちます。 [fixture: flowchart/tokens-callback-arguments-spaces-at-ends]
そのような並びの中のディレクティブ、コメント領域、無視される `;` は、
並びが `RawText` か `String` のトークンなら、
並びを断片に切ります（[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン) を参照）。
ほかの種類の並びの中では、2 つの単位の間でも、
ディレクティブや無視される `;` は入力を拒否させます。
[単位の中のディレクティブ](../../../spec/docs/diagrams/flowchart.ja.md#単位の中のディレクティブ) を参照。 [fixture: flowchart/tokens-directive-label-space-after]
[fixture: flowchart/tokens-comment-region-in-edge-text]
[fixture: common/entity-css-in-string-label]
[fixture: flowchart/div-directive-in-id]
[fixture: flowchart/div-ignored-semicolon-in-id]
[fixture: flowchart/div-directive-in-circle-opening]
各単位は 1 つの項目に属し 1 つの種類を持つので、
この規則ですべてのトークンが決まり、
空白でないどの文字もトークンかコメントに含まれます。

- `id-list` では、
  2 つの `,` の単位の間の各部分がそれぞれ 1 つの `Identifier` のトークンで、
  各 `,` は `Punctuator` です。
  クリックの文のクリックの id の `click-comma` の単位も同じです。
  `classDef a,,b fill:red` のトークンは、`classDef`、`a`、`,`、`,`、`b`、
  `fill:red` です。 [fixture: flowchart/db-classdef-names-empty]
  [fixture: flowchart/gram-click-comma-only-href]
- id は、複数の単位からなる場合でも 1 つのトークンです。
  `12ab` も `A-b` も、それぞれ 1 つの `Identifier` で、
  各文字が `letter` の単位である `日本語` もそうです。
  `stroke-width: 2px` のようなスタイルは 1 つの `RawText` のトークンで、
  `a b` のような subgraph の名前もそうです。 [fixture: flowchart/lex-style-value-with-whitespace]
  [fixture: flowchart/spec-flow-singlenode-9075959f]
  [fixture: flowchart/spec-flow-singlenode-c9da1f2e]
  [fixture: flowchart/lex-letter-id-cjk]
  [fixture: flowchart/db-subgraph-title-inner-spaces]
- 文字列は、開く引用符から閉じる引用符までの 1 つの単位なので、
  1 つの `String` のトークンです。 [fixture: flowchart/gram-label-string-then-text]
- クリックの文では、`call` のトークンと、引数の周りの `(` と `)` のトークンは、
  文に属し、どの欄にも属しません。 [fixture: flowchart/gram-click-call]
  [fixture:
  flowchart/gram-click-empty-call-then-arguments]
- 形を開く区切りは、2 つの単位からなる場合でも 1 つのトークンで、
  閉じる区切りも同じです。
  円の `((` と `))`、六角形の `{{` と `}}` は、`(((` や `[[` と同じく、
  それぞれ 1 つの `Punctuator` のトークンです。
  そのため、2 つの単位の間のディレクティブや無視される `;` は、
  どの区切り記号の中とも同じく、入力を拒否させます。
  `A(%%{init: {}}%%(x))` は、mermaid.js は円と読みますが、
  そのディレクティブのところで拒否します。 [fixture: flowchart/tokens-circle-hexagon-delimiters]
  [fixture:
  flowchart/div-directive-in-circle-opening] [fixture:
  flowchart/div-directive-in-hexagon-closing] [fixture:
  flowchart/div-ignored-semicolon-in-circle-opening] [fixture:
  flowchart/gram-circle-gap]
- 行単位の規則が無視する `;` は `IgnoredSemicolon` のトークンで、
  中にあるトークンが、ラベル、文字列、subgraph の名前、スタイルなら、
  それを切ります（[トークン](../tokens.ja.md#トークン) を参照）。
  `A[x;]` のラベルは `x;` で、行単位の規則はこの `;` を無視せず、
  `;` はラベルのトークンの中にあります。
  `A[mystyle:#x;]` では `;` が無視されるので、
  ラベルのトークンは `mystyle:#x` で、
  その後の `;` は `IgnoredSemicolon` のトークンです。
  スタイルを切る形は [FlowchartStyleStatement](../../../spec/docs/ast/flowchart.ja.md#flowchartstylestatement) にあります。
  id、数、キーワード、矢印、ほかの区切り記号の中では、入力を拒否させます。
  `A[style:#x] -;-> B` と `A[style:#x] --> B;b` は、
  その `;` のところで拒否します。 [fixture: flowchart/tokens-label-semicolon]
  [fixture:
  common/entity-style-in-label] [fixture:
  flowchart/div-ignored-semicolon-in-arrow] [fixture:
  flowchart/div-ignored-semicolon-in-id]
  [fixture: common/entity-css-in-string-label]
  [fixture: flowchart/tokens-style-semicolon-ignored]
  [fixture: flowchart/tokens-style-ignored-semicolon-between-values]
  [fixture: flowchart/tokens-subgraph-name-ignored-semicolon]
  [fixture: flowchart/tokens-subgraph-title-ignored-semicolon]
  [fixture: flowchart/tokens-subgraph-title-string-ignored-semicolon]
- 文の区切りの `;` は、文の範囲に入りません。
  文の範囲は、
  その最初のトークンから最後のトークンまでです。 [fixture: flowchart/tokens-diagram-trailing-separator]
- `A[ ]`、`A-->| |B`、`subgraph S[ ]` のラベルのように、すべて空白のラベルは、
  その空白の `RawText` のトークンを 1 つ持ちます。
  空白だけのどの値も、そうです（[トークン](../tokens.ja.md#トークン) を参照）。
  すべて空白のスタイルはトークンを持たず、その空白の量は何も変えないので、
  木では null です（[FlowchartStyleStatement](../../../spec/docs/ast/flowchart.ja.md#flowchartstylestatement) を参照）。 [fixture: flowchart/gram-label-space]
  [fixture:
  flowchart/tokens-pipe-label-space] [fixture:
  flowchart/tokens-subgraph-title-space] [fixture:
  flowchart/db-style-whitespace-only-value]
- `@{` と `}` の間のデータブロックのテキストは、
  その `data-text` と `data-quote` の単位で、
  両端の空白と改行を含む 1 つの `RawText` のトークンです。
  その空白と改行は [FlowchartDataBlock](../../../spec/docs/ast/flowchart.ja.md#flowchartdatablock) の値に入ります。
  `A@{ }` は空白のトークンを持ちます。
  `A@{`、改行、`shape: rect`、改行、`}` は、改行、`shape: rect`、
  改行のトークンを持ちます。 [fixture: flowchart/gram-data-block-space-only]
  [fixture:
  flowchart/gram-data-consecutive-blocks]

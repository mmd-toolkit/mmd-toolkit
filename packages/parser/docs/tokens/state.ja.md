# state のトークン

英語版: [state.md](./state.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `stateDiagram`のトークンを定めます。
ノードは、仕様の
[`ast/state.ja.md`](../../../spec/docs/ast/state.ja.md) が定めます。
すべての図種に共通するトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/state.ja.md](../../../spec/docs/diagrams/state.ja.md#字句構造)
の単位から作ります。
すべて空白でない単位は、
どれも
[文法](../../../spec/docs/diagrams/state.ja.md#文法) の 1 つの**項目**に属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` の単位。`state`、`as`、`note`、`position`、`of`、`end`、`click`、`href`、`classDef`、`class`、`style`、`scale`、`width`、`accTitle`、`accDescr`、`ignored-state` の単位。`hide`、`empty`、`description-word` の単位。疑似状態の印。`direction` と `direction-value` の単位 |
| `Identifier` | [単位の中のディレクティブ](../../../spec/docs/diagrams/state.ja.md#単位の中のディレクティブ) の名前の単位                                                                                                                                                                           |
| `Numeric`    | `number` の単位                                                                                                                                                                                                                                                                     |
| `String`     | `string` か `empty-string` の単位                                                                                                                                                                                                                                                   |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/state.ja.md#単位の中のディレクティブ) のテキストの単位                                                                                                                                                                       |
| `Punctuator` | `description` の単位の `:`、別名の文の `:` の単位、1 行のノートの `:` の単位、`accTitle` と `accDescr` の後の `:`。`-->`、`--`、`:::`、`[*]`、`{`、`}`、`,`。`id-comma` の単位。浮いたノートの `"` の単位                                                                           |

[fixture: state/header-v2]
[fixture: state/header-only]
[fixture: state/lex-state-without-body]
[fixture: state/db-alias-blank-second-description]
[fixture: state/lex-note-colon-without-space]
[fixture: state/lex-note-block-empty]
[fixture: state/gram-click-after-statement]
[fixture: state/db-classdef-trailing-comma]
[fixture: state/db-class-before-state]
[fixture: state/db-style-semicolon-after-space]
[fixture: state/gram-scale]
[fixture: state/db-acc-title-empty-line-before-value]
[fixture: state/lex-acc-descr-space-before-colon]
[fixture: state/db-acc-descr-block-whitespace-before-close]
[fixture: state/gram-hide-empty-description]
[fixture: state/lex-direction-line-value-then-text]
[fixture: state/lex-choice-square-brackets]
[fixture: state/gram-ignored-state-before-body-next-line]
[fixture: state/db-definition-css-class]
[fixture: state/lex-description-without-space]
[fixture: state/lex-floating-note-no-space-before-as]
[fixture: state/gram-terminal-alone]
[fixture: state/header-statement-same-line]
[fixture: state/db-divider-then-empty-line]
[fixture: state/lex-class-comma-space-id]
[fixture: state/lex-directive-in-ignored-text]

コメント領域かディレクティブが切る `String` のトークンは、
`StringFragment` のトークンになります
（[トークンの中のコメント領域](../tokens.ja.md#トークンの中のコメント領域) と
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
を参照）。
[fixture: state/tokens-comment-region-in-alias-string]
[fixture: state/lex-directive-in-state-string]

**トークン**は、同じ項目で同じ種類の単位が、間に何も挟まずに続く最長の並び
（`RawText` の項目では、空白を挟んでもよい）です。
トークンは端に空白を持ちません。
ただし、mermaid.js がその空白を値の一部として読むところは除きます
（[トークン](../tokens.ja.md#トークン) を参照）。
`second-description` の単位のトークンは単位の全体です。
[fixture: state/db-alias-blank-second-description]
1 行のノートの `:` がそのテキストを始めるところでは、
その後の `note-text` の単位のトークンは、
テキストが持つ始まりの空白を持ちます。
`note left of A`、空白 2 つ、`: hi` は、トークン `:` と ` hi` を持ちます。
`:` の後に空白がなければ、テキスト `:hi` はトークン `:` と `hi` を持ちます。
[fixture: state/tokens-note-two-spaces-before-colon-space]
[fixture: state/lex-note-two-spaces-before-colon]
そのような並びの中のディレクティブ、コメント領域、無視される `;` は、
並びが `RawText` か `String` のトークンなら、並びを断片に切ります
（[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
を参照）。
ほかの種類の並びの中では、ディレクティブや無視される `;` は入力を拒否させます
（[単位の中のディレクティブ](../../../spec/docs/diagrams/state.ja.md#単位の中のディレクティブ)
を参照）。
[fixture: state/lex-directive-in-second-description]
[fixture: state/tokens-comment-region-in-note-block]
[fixture: state/tokens-description-ignored-semicolon-inside]
[fixture: state/div-directive-in-id]
[fixture: state/div-directive-in-keyword]
[fixture: state/div-directive-in-arrow]
[fixture: state/div-ignored-semicolon-in-state-name]
[fixture: state/div-ignored-semicolon-in-state-name-without-body]

- キーワード `left of`、`right of`、`end note`、`hide empty description` は、
  語ごとに 1 つの `Keyword` のトークンです。
  2 つの語の間の空白に接したディレクティブは、2 つのトークンの間にあります。
  `note left%%{init: {}}%% of A: t` は、mermaid.js と同じくノートです。
  [fixture: state/lex-directive-between-left-and-of]
  [fixture: state/lex-directive-between-end-and-note]
  [fixture: state/lex-directive-between-hide-and-empty]
- 説明は、その `:` からの 1 つの単位で、2 つのトークンです。
  `:` と、周りの空白を除いたテキストです。
  [fixture: state/lex-description-without-space]
  [fixture: state/db-label-trimmed]
- 浮いたノートの `"` の単位は、2 つが続くところでも、
  それぞれ 1 つの `Punctuator` のトークンです。
  `note ""x" as N` は 3 つの `"` のトークンを持ち、
  2 つは `RawText` のトークン `x` の前に、1 つはその後にあります。
  [fixture: state/lex-floating-note-extra-quote-before-text]
- 空の説明ブロックの単位は、文の `textBeforeBody` の中でも種類を保ちます。
  `Keyword` のトークン `accDescr` と、`Punctuator` のトークン `{` と `}` で、
  StateIgnoredText の範囲の中にあります
  （[StateIgnoredText](../../../spec/docs/ast/state.ja.md#stateignoredtext)
  を参照）。
  [fixture: state/gram-empty-description-block-after-empty-string-before-body]
- 行の規則が無視する `;` は `IgnoredSemicolon` のトークンで、
  中にある `RawText` か `String` のトークンを切ります
  （[トークン](../tokens.ja.md#トークン) を参照）。
  `classDef c fill:#f00;` では、スタイルは `fill:#f00` で、
  その後の `;` は `IgnoredSemicolon` のトークンです。
  `accTitle: style:#x;`、複数行のノートの `style:#x` の後、
  説明が `style:#x` である `A : style:#x;` でも同じで、
  合成状態の本体でも同じです。
  行の規則が変えない `A : x;` では、
  `;` は `Identifier` のトークンで、状態の id です。
  `A : style:#x; B` では、
  `;` が説明を `RawText` のトークン `style:#x` と、
  `;` の後の空白を含む ` B` に切り、
  説明は `style:#x B` です。
  [fixture: state/tokens-classdef-ignored-semicolon] [fixture:
  state/tokens-acc-title-ignored-semicolon] [fixture:
  state/tokens-note-block-ignored-semicolon] [fixture:
  state/tokens-alias-ignored-semicolon] [fixture:
  state/tokens-description-ignored-semicolon] [fixture:
  state/tokens-composite-description-ignored-semicolon] [fixture:
  state/lex-description-then-semicolon] [fixture:
  state/tokens-description-ignored-semicolon-inside] [fixture:
  state/tokens-class-ignored-semicolon]

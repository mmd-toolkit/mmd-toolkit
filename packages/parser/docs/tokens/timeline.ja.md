# Timeline のトークン

英語版: [timeline.md](./timeline.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `timeline` のトークンを定めます。
ノードは仕様の
[`ast/timeline.ja.md`](../../../spec/docs/ast/timeline.ja.md) が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/timeline.ja.md](../../../spec/docs/diagrams/timeline.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/timeline.ja.md#文法) の **項目** の
1 つに属し、この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` 単位と `direction` 単位。`title`、`section`、`accTitle`、`accDescr` の単位                                                                                                                                                                 |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/timeline.ja.md#単位の中のディレクティブ) のテキストの単位: `period-text`、`event-text`、`title-text`、`section-text`、`acc-title-text`、`acc-description-text`、`acc-description-block-text` |
| `Punctuator` | `:`、`{`、`}`                                                                                                                                                                                                                                       |

[fixture: timeline/db-direction-td]
[fixture: timeline/db-period-and-event]
[fixture: timeline/db-title-statement]
[fixture: timeline/db-section-statement]
[fixture: timeline/db-acc-title-statement]
[fixture: timeline/db-acc-descr-statement]
[fixture: timeline/db-acc-descr-block]

どの項目も 1 つの単位で、したがって 1 つの **トークン** です。
`timeline TD` は、`Keyword` トークン `timeline` と `TD` を持ちます。
`a : e1 : e2` は、`RawText` トークン `a` と空白、`e1` と空白、`e2` を持ち、
各 event の前に `Punctuator` トークン `:` を持ちます。
[fixture: timeline/db-direction-td]
[fixture: timeline/db-event-two-on-a-line]
event を始めない `:` 単位は、文法のどの規則も取らないので、
入力は拒否され、そのトークンは作られません。
[fixture: timeline/gram-event-colon-glued-to-event]

トークンは両端に空白を持ちません。
ただし mermaid.js が値の一部として読むところは別です
（[トークン](../tokens.ja.md#トークン) を参照）。
値が両端の空白を保つ単位は、トークンもそれを保ちます。
`period-text` は、それを終えるものの前の空白を含みます
（`a` と 3 つの空白は、`a` と 3 つの空白のトークンを持ちます）。
`event-text` は、コロンの後の 1 つの空白文字に続く空白を含みます
（`a :   e` の event のトークンは 2 つの空白と `e` で、
`a :` と 2 つの空白の event のトークンは空白 1 つです）。
`title-text` と `section-text` も保ちます
（`title  T` は、空白 1 つと `T` のトークンを持ちます）。
mermaid.js が値をトリムするアクセシビリティのテキスト、
つまり `acc-title-text`、`acc-description-text`、
`acc-description-block-text` は、それを含みません。
`accTitle: T` と 3 つの空白は、トークン `T` を持ちます。
`accDescr {`、`  line1` の行、`  line2` の行、`  }` の行は、
`line1`、改行とインデント、`line2` のトークンを持ちます。
[fixture: timeline/db-period-trailing-spaces]
[fixture: timeline/db-event-leading-spaces]
[fixture: timeline/db-event-two-spaces]
[fixture: timeline/db-title-two-spaces]
[fixture: timeline/db-acc-title-trailing-spaces]
[fixture: timeline/db-acc-descr-block]

`RawText` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます
（[単位の中のディレクティブ](../../../spec/docs/diagrams/timeline.ja.md#単位の中のディレクティブ)
を参照）。
`a : e%%{init: {}}%%f` は、`RawText` トークン `e` と `f` と、
その間の `Directive` トークンを持ちます。
一方、`ti%%{init: {}}%%tle T` は拒否されます。
[fixture: timeline/lex-directive-in-event]
[fixture: timeline/div-directive-in-title-keyword]

- 空の説明ブロックは、`Keyword` トークン `accDescr` と、
  `Punctuator` トークン `{` と `}` を持ちます。
  [fixture: timeline/db-acc-descr-block-braces-only]
- 行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
  同じ行の `accDescr { style:#x }` の後の `a;b` は、
  `RawText` トークン `a` と `b` と、
  その間の `IgnoredSemicolon` トークンを持ちます。
  [fixture: timeline/tokens-ignored-semicolon-in-period]

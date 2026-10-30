# ブロック図のトークン

英語版: [block.md](./block.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `block` のトークンを定めます。
ノードは仕様の [`ast/block.ja.md`](../../../spec/docs/ast/block.ja.md)
が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/block.ja.md](../../../spec/docs/diagrams/block.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/block.ja.md#文法) の **項目** の 1 つに属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | ヘッダー（`block-beta` か `block`）。入れ子のブロックを開く `block-beta`、`block:`、`block` の単位（`block:` は `:` を含む）。`end`。数を含まない `columns` の単位と、`auto`。`space` と、`:` を含み数を含まない `space:`。`classDef`、`class`、`style`。空の説明ブロックの `accDescr`。ブロック矢印の方向の 1 つずつの語 |
| `Identifier` | `id`。`classDef` の `class-id`。`class` の `class-ids` の id の 1 つずつの語。その前の空白は含まない。`style` の `class-ids`。これは `,` を含めて 1 つのトークン                                                                                                                                                          |
| `Numeric`    | 幅、`space:`、`columns` の数字                                                                                                                                                                                                                                                                                            |
| `String`     | `string` の単位。引用符を含む                                                                                                                                                                                                                                                                                             |
| `RawText`    | `class` のクラス名。スタイルの 1 つずつ。`class` の 2 つの id の間の `,` の後の空白。ブロック矢印の方向が語の前と後に持つ空白                                                                                                                                                                                             |
| `Punctuator` | 形の開きと閉じ。書かれたとおりに 1 つずつのトークン。`<[`、`]>`、方向の前後の `(` と `)`、方向の前の `,`。幅の `:`。矢印と開きの矢印。`class` の 2 つの id の間と、2 つのスタイルの間の `,`。空の説明ブロックの `{` と `}`                                                                                                |

[fixture: block/db-edge-arrow] [fixture: block/db-composite-width]
[fixture: block/db-composite-no-id] [fixture: block/db-composite-plain]
[fixture: block/db-columns-plain] [fixture: block/db-columns-auto]
[fixture: block/db-space-plain] [fixture: block/db-space-width]
[fixture: block/db-class-def-two-styles] [fixture: block/db-class-apply-list]
[fixture: block/db-grid-comma-style-id] [fixture: block/db-empty-block-between]
[fixture: block/db-arrow-two] [fixture: block/db-shape-lean-left]
[fixture: block/db-edge-label] [fixture: block/db-width-plain]

空白は、改行も含めて、文の文脈では単位を読まず、トークンを作りません。
矢印と開きの矢印は前後の空白を除き、キーワードは後の空白を除きます。
`A -- "text" --> B` はトークン `A`、`--`、`"text"`、`-->`、`B` を持ち、
`columns 3` は `Keyword` トークン `columns` と `Numeric` トークン `3`
を持ちます。
ブロック矢印の方向は、その語の `Keyword` トークンです。
その値が [BlockArrowShape](../../../spec/docs/ast/block.ja.md#blockarrowshape)
で持つ空白、つまり前の `(` の後の空白と後ろの空白は、
それぞれ 1 つの `RawText` トークンです。
その中のディレクティブやコメント行はトークンを切り、
語の中のものは入力を拒否させます。
`( right , down)` は、スペースの `RawText` トークン、
`Keyword` トークン `right`、スペースの `RawText` トークン、
`Punctuator` トークン `,`、 `Keyword` トークン `down` を持ちます。
`,` の後の空白は、どのトークンにも入りません。
`class` のクラス名は、中の空白を含めて 1 つの `RawText` トークンです。
`class A c d` は `RawText` トークン `c d` を持ちます。
[fixture: block/db-edge-label] [fixture: block/db-columns-plain]
[fixture: block/db-arrow-spaces-around-first]
[fixture: block/db-arrow-directive-before-first]
[fixture: block/db-arrow-comment-line-before-first]
[fixture: block/db-class-apply-names-spaces]

`,` の後の `class` の id は、 `,` の後の空白を持ちます。
[BlockClassStatement](../../../spec/docs/ast/block.ja.md#blockclassstatement)
を参照。
`,` の後の空白は、それだけで 1 つの `RawText` トークンで、
語の `Identifier` トークンの前にあります。
`class A, B c` は、`Identifier` トークン `A`、`Punctuator` トークン `,`、
スペースの `RawText` トークン、`Identifier` トークン `B` を持ちます。
その空白の中のディレクティブやコメント行は `RawText` トークンを切り、
語の中のものは、どの id の中とも同じく入力を拒否させます。
`style` の id は、最初の語から最後の語までの、
`,` を含む 1 つの `Identifier` トークンです。
`style A, B` の id は 1 つのトークン `A, B` になるはずですが、
受理される入力にはありません。
空白を含む id のブロックはないからです。
[fixture: block/db-class-apply-list-spaces]
[fixture: block/db-class-apply-line-feed-after-comma]
[fixture: block/db-grid-comma-style-id]
[fixture: block/div-grid-directive-class-apply-id]
[文法の外の拒否](../../../spec/docs/diagrams/block.ja.md#文法の外の拒否)
を参照。

スタイルは、その値の全体にわたる 1 つの `RawText` トークンです。
値は 2 つの `,` の間の部分で、 `,` との間にある両端の空白を含みます。
[BlockLiteral](../../../spec/docs/ast/block.ja.md#blockliteral) を参照。
最初のスタイルは行の残りの空白でない最初の文字から始まり、
最後のスタイルは空白でない最後の文字で終わります。
`style A fill:#f00 , stroke:#333` は、後にスペースのある `fill:#f00` と、
前にスペースのある `stroke:#333` の `RawText` トークンを持ちます。
`style A fill:red,  ,stroke:#333` のようにすべて空白の部分は、
その空白の `RawText` トークンです。
空の部分は、トークンを作りません。 [fixture: block/db-style-spaces]
[fixture: block/db-style-spaces-at-line-ends]
[fixture: block/db-style-whitespace-only-between-commas]
[fixture: block/db-class-def-spaces-around-styles]
[fixture: block/db-class-def-leading-comma] [fixture: block/db-style-only-comma]

`RawText` トークンや `String` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
`Identifier` トークンを含むほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます。
[単位の中のディレクティブ](../../../spec/docs/diagrams/block.ja.md#単位の中のディレクティブ)
を参照。
`A -- "a%%{init: {}}%%b" --> B` は、`StringFragment` トークン `"a` と `b"` と、
その間の `Directive` トークンを持ちます。
一方、 `A%%{init: {}}%%B` は拒否されます。
[fixture: block/db-edge-label-directive]
[fixture: block/db-grid-directive-style-text]
[fixture: block/db-class-apply-directive] [fixture: block/div-directive-in-id]
[fixture: block/div-ignored-semicolon-in-id]

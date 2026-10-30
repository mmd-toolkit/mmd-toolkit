# 四象限チャートのトークン

英語版: [quadrant.md](./quadrant.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `quadrantChart` のトークンを定めます。
ノードは仕様の [`ast/quadrant.ja.md`](../../../spec/docs/ast/quadrant.ja.md)
が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/quadrant.ja.md](../../../spec/docs/diagrams/quadrant.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/quadrant.ja.md#文法) の **項目** の 1
つに属し、この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | ヘッダーと、`title`、`accTitle`、`accDescr`、`x-axis`、`y-axis`、`quadrant-1` から `quadrant-4`、`classDef` の単位                                                             |
| `RawText`    | 引用符のないテキスト、点の名前、文字列の後のテキストの残りの語。`title-text`、`acc-title-text`、`acc-description-text`、`description-block-text`。`coordinate`。スタイルの単位 |
| `String`     | `string` と `markdown-string` の単位。引用符とバッククォートを含む                                                                                                             |
| `Identifier` | `class-name` 単位、つまり [Identifier](../../../spec/docs/ast.ja.md#identifier)。`classDef` のクラスの名前の単位、つまり QuadrantIdentifier                                    |
| `Punctuator` | 文法がそれだけで取る `arrow`、`:::`、`:`、`[`、`,`、`]`、`{`、`}`、`;` の単位と、2 つのスタイルの間の `,`                                                                      |

[fixture: quadrant/db-y-axis-both]
[fixture: quadrant/db-quadrant-quoted-then-bare]
[fixture: quadrant/db-name-markdown] [fixture: quadrant/db-class-plain]
[fixture: quadrant/db-style-two] [fixture: quadrant/db-classdef-two-styles]

引用符のないテキスト、名前、スタイル、クラスの名前の単位は、
`space` 単位を間に挟んで続くので、それぞれ 1 つのトークンです。
トークンは、ASCII の空白でない最初の文字から最後の文字までで、
語の間の空白を含みます。
`quadrant-1   A  b   ` は `RawText` トークン `A  b` を持ちます。
`radius: 10, color: #f00` は、
`RawText` トークン `radius: 10` と `color: #f00` と、
その間の `Punctuator` トークン `,` を持ちます。
スタイルや名前の中の `:` と `-` は、そのトークンの文字で、
`Punctuator` トークンではありません。
キーワード、ヘッダー、矢印、`]` は、その単位が前後に読む空白を含みません。
`x-axis L -->` は、トークン `x-axis`、`L`、`-->` を持ちます。
`space` 単位と `newline` 単位はすべて空白なので、トークンを作りません。
[fixture: quadrant/db-quadrant-spaces-trimmed] [fixture: quadrant/db-style-two]
[fixture: quadrant/db-classdef-two-styles]
[fixture: quadrant/db-x-axis-left-with-arrow] [fixture: quadrant/db-point-plain]

トークンが両端から除く空白は、ASCII の空白です。
つまりスペース、タブ、垂直タブ、改ページ、改行です。
U+00A0、U+2028、U+2029、U+3000、U+FEFF は、
この図種では [字句構造](../../../spec/docs/diagrams/quadrant.ja.md#単位と文脈)
で語の文字なので、テキスト、名前、クラスの名前のトークンに、両端でも残ります。
`quadrant-1 A` と U+00A0 は、`A` と U+00A0 の `RawText` トークンを持ちます。
`x-axis L`、U+00A0、`-->`、U+00A0、`R` は、後に U+00A0 のある `L` と、
前に U+00A0 のある `R` の `RawText` トークンを持ちます。
[fixture: quadrant/db-ends-quadrant-nbsp-end]
[fixture: quadrant/db-x-axis-nbsp-around-arrow]
[fixture: quadrant/db-name-after-nbsp]
[fixture: quadrant/db-grid-nbsp-classdef-name]
題、アクセシビリティのテキスト、説明ブロックのテキストのトークンは、
その値と同じく、両端から Notation の空白をすべて除き、 U+00A0 も除きます。
[ast/quadrant.ja.md](../../../spec/docs/ast/quadrant.ja.md#quadrantliteral)
を参照。
`title`、U+00A0、`T` は `RawText` トークン `T` を持ち、
`title` と U+3000 は `title` のトークンだけを持ちます。
[fixture: quadrant/db-title-nbsp-before-text]
[fixture: quadrant/db-ends-title-nbsp-end]
[fixture: quadrant/db-title-ideographic-only]
[fixture: quadrant/db-acc-descr-nbsp-around-text]
[fixture: quadrant/db-acc-descr-block-nbsp-before-brace-close]

文字列で始まるテキストは、文字列の `String` トークンと、
残りの `RawText` トークンを持ちます。
`quadrant-1 "a" b` は、トークン `"a"` と `b` を持ちます。
テキストのない題は `title` のトークンだけを持ち、空の説明ブロックは `accDescr`、
`{`、 `}` のトークンを持ちます。
[fixture: quadrant/db-quadrant-quoted-then-bare]
[fixture: quadrant/db-title-keyword-alone]
[fixture: quadrant/db-acc-descr-block-empty-braces]
[fixture: quadrant/db-empty-block-after-point]

`RawText` トークンや `String` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
`Identifier` トークンを含むほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます。
[単位の中のディレクティブ](../../../spec/docs/diagrams/quadrant.ja.md#単位の中のディレクティブ)
を参照。
`quadrant-1 a%%{init: {}}%%b%%{init: {}}%%c` は、 `RawText` トークン `a`、`b`、
`c` と、その 2 つずつの間の `Directive` トークンを持ちます。
一方、 `A:::c%%{init: {}}%%1: [0.3, 0.6]` は拒否されます。
[fixture: quadrant/db-directive-two-in-text]
[fixture: quadrant/div-class-directive-inside]

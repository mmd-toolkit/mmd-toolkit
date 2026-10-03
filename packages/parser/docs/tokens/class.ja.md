# class のトークン

英語版: [class.md](./class.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `classDiagram`のトークンを定めます。
ノードは、仕様の
[`ast/class.ja.md`](../../../spec/docs/ast/class.ja.md) が定めます。
すべての図種に共通するトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/class.ja.md](../../../spec/docs/diagrams/class.ja.md#字句構造)
の単位から作ります。
すべて空白でない単位は、
どれも
[文法](../../../spec/docs/diagrams/class.ja.md#文法) の 1 つの**項目**に属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` の単位。`class`、`namespace`、`style`、`classDef`、`cssClass`、`callback`、`link`、`click`、`note`、`for`、`href`、`call`、`accTitle`、`accDescr` の単位。`direction` と `direction-value` の単位。`link-target` の単位 |
| `Identifier` | [単位の中のディレクティブ](../../../spec/docs/diagrams/class.ja.md#単位の中のディレクティブ) の名前の単位                                                                                                                        |
| `String`     | `string` と `backquoted` の単位                                                                                                                                                                                                  |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/class.ja.md#単位の中のディレクティブ) のテキストの単位。スタイルと、クラスの名前か名前空間の名前を作る名前の部分と `.` の単位は、それぞれそのすべての単位で 1 つの項目    |
| `Punctuator` | `label` の単位の `:` と、`accTitle` と `accDescr` の後の `:`。`{`、`}`、`[`、`]`、`:::`、`<<`、`>>`、`~`、`(`、`)`、`,`。各関係の端と線。`visibility` と `classifier` の単位                                                     |

コメント領域かディレクティブが切る `String` のトークンは、
`StringFragment` のトークンになります
（[トークンの中のコメント領域](../tokens.ja.md#トークンの中のコメント領域) と
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
を参照）。

**トークン**は、同じ項目で同じ種類の単位が、間に何も挟まずに続く最長の並びから、
両端の空白を除いたものです。
スタイルと名前の部分からなる名前のほかの `RawText` の項目では、
並びの単位の間に空白を挟んでもかまいません。
ただし、mermaid.js がその空白を値の一部として読むところは除きます
（[トークン](../tokens.ja.md#トークン) を参照）。
`generic-text` の単位、メンバーの行の `annotation-name` の単位、
`member-name` と `return-type` の単位、
閉じていないバッククォートの名前のトークンは、
[メンバーの行](../../../spec/docs/diagrams/class.ja.md#メンバーの行) と
[文字列、バッククォートの名前、ジェネリクスの型](../../../spec/docs/diagrams/class.ja.md#文字列バッククォートの名前ジェネリクスの型)
が定める単位の全体です。
そのような並びの中のディレクティブ、コメント領域、無視される `;` は、
並びが `RawText` か `String` のトークンなら、並びを断片に切ります
（[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
を参照）。
ほかの種類の並びの中では、2 つの単位の間でも、
ディレクティブや無視される `;` は入力を拒否させます
（[単位の中のディレクティブ](../../../spec/docs/diagrams/class.ja.md#単位の中のディレクティブ)
を参照）。

- 名前の部分からなるクラスの名前や名前空間の名前は、
  間に空白のない並びごとに 1 つの `RawText` のトークンです。
  `Foo-Bar` と `a.b.C` はそれぞれ 1 つのトークンで、
  `class Foo Bar` は 2 つのトークン `Foo` と `Bar` と、
  ClassIdentifier `FooBar` を持ちます。
  ディレクティブや無視される `;` は、
  どのテキストとも同じく、このトークンを切ります。
  `class A%%{init: {}}%%.B` は、トークン `A` と `.B` と、
  ClassIdentifier `A.B` を持ちます。
  [fixture: class/gram-name-spaces] [fixture: class/gram-name-dash-spaces]
  [fixture: class/lex-directive-in-dotted-name]
  [fixture: class/tokens-ignored-semicolon-in-relation-name]
- ラベルは、その `:` から始まる 1 つの単位で、2 つのトークンです。
  `:` と、周りの空白を除いたテキストです。
  メンバーの文では、そのテキストはメンバーの行で、
  その部分のトークンに分かれます。
  [fixture: class/lex-label-percent] [fixture: class/gram-member-statement]
- スタイルは、間に空白のない単位の並びごとに 1 つの `RawText` のトークンで、
  `classDef` の文の各スタイルも同じです。
  mermaid.js はスタイルの 2 つの単位の間の空白を落とすので、
  その空白はどのトークンにも入りません。
  ラベルの中の空白は、ラベルのトークンの一部です。
  `style A fill :#f00` はトークン `fill` と `:#f00` を持ち、
  `style A a b` はトークン `a` と `b` を持ちます。
  [fixture: class/tokens-style-space-before-colon]
  [fixture: class/tokens-style-tab-before-label]
  [fixture: class/tokens-style-words-joined]
  [fixture: class/tokens-style-hash-after-space]
  [fixture: class/tokens-classdef-space-before-colon]
  `,` の単位は 2 つのスタイルを分けます。
  `style A bold,italic` は、スタイルのトークン `bold` と `italic` と、
  その間の `,` のトークンを持ちます。
  ラベルの中の `,` はスタイルの一部です。
  `style A fill : #f00 , stroke-width: 2px` は 1 つのスタイルで、
  トークン `fill` と `: #f00 , stroke-width: 2px` を持ちます。
  `,` がラベル `: #f00 , stroke-width` の中にあるからです。
  [fixture: class/tokens-style-comma-unit] [fixture: class/db-style-spaces]
- `call` のあるクリックの文では、`(` と `)` は文に属します。
  `call` のトークンと `(` と `)` のトークンは、その範囲の中にあります。
- ジェネリクスの型の 2 つの `~` は、間に何もなくても、
  ClassName の `Punctuator` のトークンです。
- 関係の端と線の単位は、間に空白がなくても、
  それぞれ 1 つの `Punctuator` のトークンです。
  `<|--` は 2 つのトークン `<|` と `--` です。
- キーワード `note for` は、語ごとに 1 つの、2 つの `Keyword` のトークンです。
  語の間の空白に接したディレクティブは、2 つのトークンの間にあります。
  `note%%{init: {}}%% for A "t"` は、mermaid.js と同じく A の note です。
  [fixture: class/lex-directive-between-note-and-for]
- 閉じていないバッククォートの名前は、終わりの空白と改行を含めて、
  mermaid.js が名前に読む最後の文字までの 1 つの `String` のトークンです
  （[StringLiteral](../../../spec/docs/ast.ja.md#stringliteral) を参照）。
  その文字の後のディレクティブは、その外にあります。
  その中のディレクティブは、閉じた文字列と同じく、
  それを `StringFragment` のトークンに切ります。
  名前の空白でない最後の文字の後で、その文字の前にあるディレクティブも同じで、
  ディレクティブの後の最後のものは、空白と行終端だけです。
  [fixture: class/tokens-backquote-unclosed-trailing-whitespace]
  [fixture: class/lex-backquote-unclosed-directive-inside] [fixture:
  class/lex-backquote-unclosed-directive-after-line-break] [fixture:
  class/lex-backquote-unclosed-directive-at-end]
- 行の規則が無視する `;` は `IgnoredSemicolon` のトークンで、
  中にある `RawText` か `String` のトークンを切ります
  （[トークン](../tokens.ja.md#トークン) を参照）。
  `style A fill:#f00;` と `classDef c fill:#f00;` では、
  スタイルは `fill:#f00` で、
  その後の `;` は、前に空白があっても `IgnoredSemicolon` のトークンです。
  `accTitle: style:#x;` とメンバーの行 `+x style:#a;` の、
  テキストの後の `;` も同じです。
  メンバーの行 `+x style:#a; b` では、
  `;` が名前を `RawText` のトークン `x style:#a` と `b` に切り、
  名前は `x style:#a b` です。
  [fixture: class/tokens-style-ignored-semicolon] [fixture:
  class/tokens-style-space-ignored-semicolon] [fixture:
  class/tokens-class-def-ignored-semicolon] [fixture:
  class/tokens-acc-title-ignored-semicolon] [fixture:
  class/tokens-member-ignored-semicolon] [fixture:
  class/tokens-member-ignored-semicolon-inside]

# XY チャートのトークン

英語版: [xychart.md](./xychart.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `xychart` のトークンを定めます。
ノードは仕様の [`ast/xychart.ja.md`](../../../spec/docs/ast/xychart.ja.md) が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/xychart.ja.md](../../../spec/docs/diagrams/xychart.ja.md#字句構造) の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/xychart.ja.md#文法) の **項目** の 1 つに属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header`、`orientation`、`title`、`x-axis`、`y-axis`、`line`、`bar`、`accTitle`、`accDescr` の単位                                                                                             |
| `RawText`    | 引用符のないテキストの語、つまり `word` 単位の XychartLiteral。アクセシビリティの文のテキスト、つまり `acc-title-text`、`acc-description-text`、`description-block-text` 単位の XychartLiteral |
| `String`     | `string` 単位。引用符のあるテキストで、[StringLiteral](../../../spec/docs/ast.ja.md#stringliteral)。引用符を含む                                                                               |
| `Numeric`    | `number` 単位。範囲や値の [NumericLiteral](../../../spec/docs/ast.ja.md#numericliteral)                                                                                                        |
| `Punctuator` | `[`、`]`、`,`、`;`、`:`、`{`、`}`、`-->`                                                                                                                                                       |

[fixture: xychart/db-orientation-capitalized]
[fixture: xychart/db-title-bare-words]
[fixture: xychart/db-acc-title-spaces-trimmed]
[fixture: xychart/db-label-one]
[fixture: xychart/db-x-axis-range]
[fixture: xychart/db-semicolon-statements]

`newline` 単位はすべて空白なので、トークンを作りません。
一方、行を終える `;` は `Punctuator` トークンです。
`title T; x-axis [a]` は、トークン `title`、`T`、`;`、`x-axis`、`[`、`a`、
`]` を持ちます。 [fixture: xychart/db-semicolon-statements]

引用符のないテキストの語で、間に何もなく続くものは 1 つのトークンです。
2 つの語の間の空白は、どのトークンにも属しません。
`title a-b_c.d+e=f*g&h#i1` は、
18 の `word` 単位からなるテキストの `RawText` トークンを 1 つ持ちます。
`title Two words` は、2 つのトークン `Two` と `words` を持ちます。
アクセシビリティの文のテキストは 1 つのトークンで、文字の間の空白と改行を含み、
両端の空白を含みません。
`accTitle:` と `a b` と空白は、
トークン `a b` を持ちます。 [fixture: xychart/db-title-bare-characters]
[fixture: xychart/db-title-bare-words]
[fixture: xychart/db-acc-title-spaces-trimmed]
[fixture: xychart/db-acc-descr-block]

文法が取る空の文字列、つまりプロットや軸の題やラベルの空の文字列は、
2 つの引用符の `String` トークンです。
`line "" [1]` は、`String` トークン `""` を持ちます。
テキストが空白だけの説明ブロック、つまり空の説明ブロックは、 `accDescr`、`{`、
`}` のトークンだけを持ち、閉じていないものは `}` を持ちません。
テキストの終わりで、テキストのない `accTitle:` や `accDescr:` は、
キーワードと `:` のトークンだけを持ちます。 [fixture: xychart/db-grid-empty-plot-title-quoted]
[fixture: xychart/db-acc-descr-block-empty]
[fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/db-acc-title-empty]

`RawText` トークンや `String` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン) のとおり、
トークンを断片に切ります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます（[単位の中のディレクティブ](../../../spec/docs/diagrams/xychart.ja.md#単位の中のディレクティブ) を参照）。
カテゴリ `a%%{init: {}}%%b` は、`RawText` トークン `a` と `b` と、
その間の `Directive` トークンを持ちます。
`title "style:#x;y"` は、`StringFragment` トークン `"style:#x` と `y"` と、
その間の `IgnoredSemicolon` トークンを持ちます。
一方、
`ti%%{init: {}}%%tle T` は拒否されます。 [fixture: xychart/db-x-axis-band-directive-in-word]
[fixture: xychart/lex-title-style-line-semicolon]
[fixture: xychart/div-directive-in-keyword]
[fixture: xychart/div-ignored-semicolon-in-value]

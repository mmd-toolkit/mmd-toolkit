# Requirement のトークン

英語版: [requirement.md](./requirement.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `requirement` のトークンを定めます。
ノードは仕様の
[`ast/requirement.ja.md`](../../../spec/docs/ast/requirement.ja.md) が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/requirement.ja.md](../../../spec/docs/diagrams/requirement.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/requirement.ja.md#文法) の **項目** の
1 つに属し、この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` 単位。[文の文脈](../../../spec/docs/diagrams/requirement.ja.md#文の文脈) の規則 15 のキーワードの単位: 要求の種類、`element`、欄の名前、リスク、検証方法、関係。`style`、`classDef`、`class`、`accTitle`、`accDescr`、`direction`、`direction-value` の単位                                                                                     |
| `Identifier` | [単位の中のディレクティブ](../../../spec/docs/diagrams/requirement.ja.md#単位の中のディレクティブ) の名前の単位: `style`、`classDef`、`class` の後の名前か、クラスである `style-word`                                                                                                                                                                    |
| `String`     | [単位の中のディレクティブ](../../../spec/docs/diagrams/requirement.ja.md#単位の中のディレクティブ) の文字列の単位: `string`                                                                                                                                                                                                                              |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/requirement.ja.md#単位の中のディレクティブ) のテキストの単位: 名前でも値でもある `unquoted-text`、`title-text`、`description-text`、`description-block-text`、`direction-text`。スタイルの単位: `style-item` の `style-word`、`style-colon`、`style-semicolon`、`style-dash`、`style-hash` の単位 |
| `Punctuator` | `:`、`,`、`{`、`}`、`:::`、`-`、`->`、`<-`                                                                                                                                                                                                                                                                                                               |

[fixture: requirement/header-only]
[fixture: requirement/db-requirement-all-fields]
[fixture: requirement/db-element-fields]
[fixture: requirement/db-relationship-arrows]
[fixture: requirement/db-style-statement]
[fixture: requirement/db-class-def]
[fixture: requirement/db-class-statement]
[fixture: requirement/db-class-colon-form]
[fixture: requirement/db-acc-title-descr]
[fixture: requirement/db-acc-descr-block]
[fixture: requirement/lex-direction-line-text-before-and-after]
[fixture: requirement/db-relationship-quoted-names]
[fixture: requirement/db-requirement-name-spaces]

引用符なしの名前は、`Identifier` トークンではなく `RawText` トークンです。
クラス図の、空白を持てる名前と同じく、語の間に空白を持てるからです
（[tokens/class.ja.md](./class.ja.md#トークン) を参照）。
`requirement  spaced name  {` は、
1 つの `RawText` トークン `spaced name` を持ちます。
`style-word` は空白を持たず、その単位の名前は `Identifier` トークンです。
[fixture: requirement/db-requirement-name-spaces]
[fixture: requirement/db-style-statement]

**トークン** は、1 つの項目の 1 つの種類の単位が、
間に何もなく続く、最大の並びです。
スタイルの単位の間の空白はどの単位にも属さないので、
2 つの単位の間に空白があると並びは切れます。
`style r fill: red , stroke : blue` のスタイルは、
`RawText` トークン `fill:` と `red` で、
次のスタイルは `stroke`、`:`、`blue` です。
一方、`style r fill:red` は 1 つのトークン `fill:red` を持ちます。
`style r fill:red #c` は、1 つのスタイル `fill:red#c` の、
トークン `fill:red` と `#c` を持ちます。
[fixture: requirement/lex-style-spaces]
[fixture: requirement/db-style-statement]
[fixture: requirement/lex-style-hash-after-style]
ほかの項目はどれも 1 つの単位で、したがって 1 つのトークンです。

トークンは両端に空白を持ちません。
ただし mermaid.js が値の一部として読むところは別です
（[トークン](../tokens.ja.md#トークン) を参照）。
`unquoted-text` は行の中で後ろの空白を読み、
mermaid.js はそれを名前や値から除くので、トークンもそれを除きます。
U+00A0 も除きます。
文字の間の空白はトークンに残ります。
`requirement  spaced name  {` はトークン `spaced name` を持ち、
`id:   1` と 2 つの空白はトークン `1` を持ち、
`a` と U+00A0 と `{` はトークン `a` を持ちます。
mermaid.js が値をトリムするアクセシビリティのテキストも、両端の空白を除きます。
`accTitle:   t1` と 2 つの空白はトークン `t1` を持ちます。
`accDescr {`、`  line 1` の行、`  line 2` の行、`}` だけの行は、
`line 1`、改行とインデント、`line 2` のトークンを持ちます。
字句解析器がブロックのテキストに読み込む、`}` の前の改行は含みません。
[fixture: requirement/db-requirement-name-spaces]
[fixture: requirement/db-requirement-value-spaces]
[fixture: requirement/lex-whitespace-nbsp-after-name]
[fixture: requirement/lex-whitespace-nbsp-in-name]
[fixture: requirement/db-acc-title-descr]
[fixture: requirement/db-acc-descr-block]

`RawText` トークンや `String` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
切られた `String` トークンは `StringFragment` トークンになります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます
（[単位の中のディレクティブ](../../../spec/docs/diagrams/requirement.ja.md#単位の中のディレクティブ)
を参照）。
`requirement a%%{init: {}}%%b {` は、`RawText` トークン `a` と `b` と、
その間の `Directive` トークンを持ちます。
`style r fi%%{init: {}}%%ll:red` は、
`RawText` トークン `fi` と `ll:red` を持ちます。
一方、名前の `Identifier` トークンの中にディレクティブがある
`style r%%{init: {}}%%x fill:red` は拒否されます。
[fixture: requirement/lex-directive-in-name]
[fixture: requirement/lex-directive-in-style]
[fixture: requirement/div-directive-in-style-name]
[fixture: requirement/lex-directive-in-string]

- 空の説明ブロックは、文としても本文の項目としても、
  `Keyword` トークン `accDescr` と、
  `Punctuator` トークン `{` と `}` を持ちます。
  [fixture: requirement/gram-acc-descr-block-empty]
  [fixture: requirement/gram-empty-description-block-in-body]
- 行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
  `accTitle: style:#x a;b` は、`RawText` トークン `style:#x a` と `b` と、
  その間の `IgnoredSemicolon` トークンを持ちます。
  要求 `"style:#x"` の後の `"style:#x" - satisfies -> b;c` の対象は、
  `RawText` トークン `b` と `c` と、
  その間の `IgnoredSemicolon` トークンです。
  `style r fill:#f00;` は、`RawText` トークン `fill:#f00` と、
  `IgnoredSemicolon` トークン `;` で終わります。
  [fixture: requirement/tokens-ignored-semicolon-in-acc-title]
  [fixture: requirement/tokens-ignored-semicolon-in-name]
  [fixture: requirement/tokens-ignored-semicolon-in-style]

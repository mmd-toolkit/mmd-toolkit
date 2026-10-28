# ER のトークン

英語版: [er.md](./er.md)

この文書は、`@mmd-toolkit/parser` が作る木の、図種 `er` のトークンを定めます。
ノードは仕様の [`ast/er.ja.md`](../../../spec/docs/ast/er.ja.md) が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/er.ja.md](../../../spec/docs/diagrams/er.ja.md#字句構造) の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/er.ja.md#文法) の **項目** の 1 つに属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` 単位。`style`、`classDef`、`class`、`subgraph`、`end`、`accTitle`、`accDescr`、`direction`、`direction-value` の単位。語で書かれた濃度と線: `one or zero`、`one or more`、`one or many`、`zero or one`、`zero or more`、`zero or many`、`many(0)`、`many(1)`、`many`、`one`、`only one`、`u`、`to`、`optionally to` |
| `Identifier` | [単位の中のディレクティブ](../../../spec/docs/diagrams/er.ja.md#単位の中のディレクティブ) の名前の単位: `name`、`number`、`word`、`key`、名前である `style-text`                                                                                                                                                             |
| `String`     | [単位の中のディレクティブ](../../../spec/docs/diagrams/er.ja.md#単位の中のディレクティブ) の文字列の単位: `quoted-name`、`string`、`comment-string`、`backquoted-word`。`empty-backquotes` 単位                                                                                                                              |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/er.ja.md#単位の中のディレクティブ) のテキストの単位: `tilde-word`、`title-text`、`description-text`、`description-block-text`、`direction-text`。スタイルの `style-text`、`:`、`#` の単位                                                                             |
| `Punctuator` | `{`、`}`、`[`、`]`、`:::`、`:`、`,`、`?`、`;`。記号で書かれた濃度と線: `\|o`、`}o`、`}\|`、`\|\|`、`o\|`、`o{`、`\|{`、`1+`、`0+`、`1`、`..`、`--`、`.-`、`-.`                                                                                                                                                               |

[fixture: er/header-only]
[fixture: er/gram-classdef]
[fixture: er/gram-class]
[fixture: er/gram-subgraph]
[fixture: er/lex-end-blank-line-then-name]
[fixture: er/gram-acc-title]
[fixture: er/gram-acc-descr-block]
[fixture: er/lex-direction-line-text-before]
[fixture: er/lex-cardinality-words]
[fixture: er/lex-cardinality-many-zero]
[fixture: er/lex-md-parent]
[fixture: er/lex-name-number]
[fixture: er/gram-keys-comma-space]
[fixture: er/lex-quoted-name]
[fixture: er/gram-role-string]
[fixture: er/gram-comment]
[fixture: er/lex-backquote-word]
[fixture: er/gram-empty-backquotes-twice]
[fixture: er/lex-tilde-word]
[fixture: er/gram-alias]
[fixture: er/gram-entity-classes]
[fixture: er/gram-optional-type]
[fixture: er/lex-classdef-semicolon-line-feed]
[fixture: er/gram-relationship-symbols]
[fixture: er/lex-cardinality-plus]
[fixture: er/lex-one-digit-cardinalities]

**トークン** は、1 つの項目の、同じ種類の単位が、間に何もなく続く並びのうち、
最も長いものです。
この図種では空白がどの単位にも属さないので、
2 つの単位の間に空白があるところで並びが切れます。
`classDef a fill : #f9f` のスタイルは `fill`、`:`、
`#f9f` の 3 つの `RawText` トークンで、値は `fill:#f9f` です。
`classDef a fill:#f9f` は `fill:#f9f` の 1 つのトークンです。 [fixture: er/lex-classdef-style-spaces]
[fixture: er/gram-classdef]
いくつかの語の濃度や線は、語の間の空白を含めて、
1 つの単位で 1 つのトークンです。
`one or more` は 1 つの `Keyword` トークンです。 [fixture: er/lex-cardinality-words]
トークンは両端に空白を持ちません。
ただし mermaid.js が値の一部として読むところは別です（[トークン](../tokens.ja.md#トークン) を参照）。
`end` 単位がキーワードの後に読む空白は、
そのトークンの外にあります。 [fixture: er/lex-end-blank-line-then-name]
一方、名前の終わりの U+00A0 のように、名前、語、
`style-text` の単位の文字である空白は、値の中にあるのと同じく、
トークンの中にあります。 [fixture: er/lex-name-trailing-nbsp]
[fixture: er/lex-style-nbsp-before-line-feed]

`RawText` か `String` のトークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン) のとおり、
トークンを断片に切ります。
切られた `String` トークンは `StringFragment` トークンになります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます。 [fixture: er/lex-directive-in-role-string]
[fixture: er/tokens-comment-line-in-role-string]
[fixture: er/tokens-ignored-semicolon-in-role-string]
[fixture: er/div-directive-in-name] [fixture: er/div-ignored-semicolon-in-name]
[単位の中のディレクティブ](../../../spec/docs/diagrams/er.ja.md#単位の中のディレクティブ) を参照。

- 文である空の説明ブロックは、`Keyword` トークン `accDescr` と、
  `Punctuator` トークン `{` と `}` を持ちます。 [fixture: er/gram-acc-descr-block-empty]
- ErIgnoredText の各 `empty-backquotes` 単位は、
  それぞれ 1 つの `String` トークンです。
  2 つの属性の間にそれが 2 つある属性ブロックは、
  そうしたトークンを 2 つ持ちます。 [fixture: er/gram-empty-backquotes-twice]
- 行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
  `A ||--o{ Bstyle : "x:#y";` では、役割は `String` トークン `"x:#y"` で、
  その後の `;` は `IgnoredSemicolon` トークンです。 [fixture: er/tokens-ignored-semicolon-after-role]

# ER のトークン

英語版: [er.md](./er.md)

この文書は、`@mmd-toolkit/parser` が作る木の、図種 `er` のトークンを定めます。
ノードは仕様の [`ast/er.ja.md`](../../../spec/docs/ast/er.ja.md) が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/er.ja.md](../../../spec/docs/diagrams/er.ja.md#字句構造)
の単位から作ります。
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

[fixture: er/header-only] [fixture: er/gram-classdef] [fixture: er/gram-class]
[fixture: er/gram-subgraph] [fixture: er/lex-end-blank-line-then-name]
[fixture: er/gram-acc-title] [fixture: er/gram-acc-descr-block]
[fixture: er/lex-direction-line-text-before] [fixture: er/lex-cardinality-words]
[fixture: er/lex-cardinality-many-zero] [fixture: er/lex-md-parent]
[fixture: er/lex-name-number] [fixture: er/gram-keys-comma-space]
[fixture: er/lex-quoted-name] [fixture: er/gram-role-string]
[fixture: er/gram-comment] [fixture: er/lex-backquote-word]
[fixture: er/gram-empty-backquotes-twice] [fixture: er/lex-tilde-word]
[fixture: er/gram-alias] [fixture: er/gram-entity-classes]
[fixture: er/gram-optional-type] [fixture: er/lex-classdef-semicolon-line-feed]
[fixture: er/gram-relationship-symbols] [fixture: er/lex-cardinality-plus]
[fixture: er/lex-one-digit-cardinalities]

**トークン** は、1 つの項目の、同じ種類の単位が、間に何もなく続く並びのうち、
最も長いものです。
この図種では空白がどの単位にも属さないので、
2 つの単位の間に空白があるところで並びが切れます。
`classDef a fill : #f9f` のスタイルは `fill`、`:`、
`#f9f` の 3 つの `RawText` トークンで、値は `fill:#f9f` です。
`classDef a fill:#f9f` は `fill:#f9f` の 1 つのトークンです。
[fixture: er/lex-classdef-style-spaces] [fixture: er/gram-classdef]
いくつかの語の濃度や線は、語の間の空白を含めて、
1 つの単位で 1 つのトークンです。
`one or more` は 1 つの `Keyword` トークンです。
[fixture: er/lex-cardinality-words]
トークンは両端に空白を持ちません。
ただし mermaid.js
が値の一部として読むところは別です（[トークン](../tokens.ja.md#トークン)
を参照）。
`end` 単位がキーワードの後に読む空白は、そのトークンの外にあります。
[fixture: er/lex-end-blank-line-then-name]
一方、名前の終わりの U+00A0 のように、名前、語、
`style-text` の単位の文字である空白は、値の中にあるのと同じく、
トークンの中にあります。 [fixture: er/lex-name-trailing-nbsp]
[fixture: er/lex-style-nbsp-before-line-feed]

`RawText` か `String` のトークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
切られた `String` トークンは `StringFragment` トークンになります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます。
[fixture: er/lex-directive-in-role-string]
[fixture: er/tokens-comment-line-in-role-string]
[fixture: er/tokens-ignored-semicolon-in-role-string]
[fixture: er/div-directive-in-name] [fixture: er/div-ignored-semicolon-in-name]
[単位の中のディレクティブ](../../../spec/docs/diagrams/er.ja.md#単位の中のディレクティブ)
を参照。

コメント領域は、どの種類のトークンも切ります。
[トークンの中のコメント領域](../tokens.ja.md#トークンの中のコメント領域)
を参照。
この図種では、U+2028 や U+2029 を文字として読む名前と属性ブロックの語が、
コメント領域を持ちえます。
`A`、U+2028、行 `%% c`、行 `Bar` は 1 つの名前です。
そのノードは領域にまたがり、値は `A`、U+2028、`Bar` です。
そのトークンは、U+2028 を後ろに持つ `A` と `Bar` の `Identifier` で、
その間にコメントがあります。
U+2029 でも、U+2028 と `%%` の間に空白や改行があっても、同じです。
`%%` の前に U+2028 がもう 1 つあっても、同じです。
コメント行を終えるのが CRLF や単独の CR でも、属性ブロックの語や型でも、
同じです。
`%%` の前や、その 2 つの `%` の間にディレクティブがあるときは、
2 つのトークンの間に `Directive` トークンがあります。
コメント行が連続しているとき、間に空行やディレクティブだけの行があるとき、
間に名前の一部があるときは、名前は 2 つか 3 つのトークンを持ち、
その間にコメントがあります。
[fixture: er/tokens-comment-line-in-name-line-separator]
[fixture: er/tokens-comment-line-in-name-paragraph-separator]
[fixture: er/tokens-comment-line-in-name-spaces-before-comment]
[fixture: er/tokens-comment-line-in-name-line-feed-before-comment]
[fixture: er/tokens-comment-line-in-name-blank-line-before-comment]
[fixture: er/tokens-comment-line-in-name-two-line-separators]
[fixture: er/tokens-comment-line-in-name-directive-before-comment]
[fixture: er/tokens-comment-line-in-name-directive-between-percents]
[fixture: er/tokens-comment-line-in-name-crlf]
[fixture: er/tokens-comment-line-in-name-lone-cr]
[fixture: er/tokens-comment-lines-consecutive-in-name]
[fixture: er/tokens-comment-lines-consecutive-blank-line-between]
[fixture: er/tokens-comment-lines-consecutive-directive-line-between]
[fixture: er/tokens-comment-lines-with-name-part-between]
[fixture: er/tokens-comment-line-in-attribute-word-line-separator]
[fixture: er/tokens-comment-line-in-attribute-word-paragraph-separator]
[fixture: er/tokens-comment-line-in-attribute-type-line-separator]
名前は、どこにあっても同じトークンを持ちます。
関係の 2 つ目のエンティティ、役割、別名、クラス、`class` 文の対象、
subgraph の id と題、`style` の対象、`classDef` の id がそうです。
[fixture: er/tokens-comment-line-in-relationship-entity-line-separator]
[fixture: er/tokens-comment-line-in-relationship-role-line-separator]
[fixture: er/tokens-comment-line-in-alias-line-separator]
[fixture: er/tokens-comment-line-in-class-separator-line-separator]
[fixture: er/tokens-comment-line-in-class-statement-line-separator]
[fixture: er/tokens-comment-line-in-class-statement-target-line-separator]
[fixture: er/tokens-comment-line-in-subgraph-id-line-separator]
[fixture: er/tokens-comment-line-in-subgraph-title-line-separator]
[fixture: er/tokens-comment-line-in-style-target-line-separator]
[fixture: er/tokens-comment-line-in-classdef-id-line-separator]
コメント行が名前の中にないときは、
名前は U+2028 の後で終わる 1 つのトークンを持ちます。
それは、
コメント行がテキストの終わりにあるとき（後ろの改行はあってもなくても）と、
次の行が空白かタブで始まるとき、空のとき、空白だけのとき、`{`、`:::`、`[`、
関係の `||` のように、名前の文字でない文字で始まるときです。
[fixture: er/tokens-comment-line-in-name-line-separator-indented-name]
[fixture: er/tokens-comment-line-in-name-paragraph-separator-indented-name]
[fixture: er/tokens-comment-line-in-name-line-separator-tab-indented-name]
[fixture: er/tokens-comment-line-in-name-then-empty-line]
[fixture: er/tokens-comment-line-in-name-then-space-only-line]
[fixture: er/tokens-comment-line-in-name-then-attribute-block]
[fixture: er/tokens-comment-line-in-name-then-class-separator]
[fixture: er/tokens-comment-line-in-name-then-alias]
[fixture: er/tokens-comment-line-in-name-then-relationship]
[fixture: er/tokens-comment-line-in-name-line-separator-at-end]
[fixture: er/tokens-comment-line-in-name-paragraph-separator-at-end]
[fixture: er/tokens-comment-line-in-name-line-separator-at-end-without-line-feed]
説明ブロックの `}` の後の U+2028 は、それ自身の名前を始め、
その最初のトークンはその 1 文字です。
[fixture: er/tokens-comment-line-after-acc-descr-block-line-separator]
コメント行の後の名前の中のディレクティブや、
コメント行の直後に来て名前の続きになるディレクティブは、
どの名前でもそうであるように、入力を拒否させます。
[fixture: er/div-directive-in-name-after-comment-line]
[fixture: er/div-directive-in-name-right-after-comment-line]

- 文である空の説明ブロックは、`Keyword` トークン `accDescr` と、
  `Punctuator` トークン `{` と `}` を持ちます。
  [fixture: er/gram-acc-descr-block-empty]
- ErIgnoredText の各 `empty-backquotes` 単位は、
  それぞれ 1 つの `String` トークンです。
  2 つの属性の間にそれが 2 つある属性ブロックは、
  そうしたトークンを 2 つ持ちます。 [fixture: er/gram-empty-backquotes-twice]
- 行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
  `A ||--o{ Bstyle : "x:#y";` では、役割は `String` トークン `"x:#y"` で、
  その後の `;` は `IgnoredSemicolon` トークンです。
  [fixture: er/tokens-ignored-semicolon-after-role]

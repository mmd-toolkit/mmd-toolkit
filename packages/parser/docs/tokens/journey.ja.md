# Journey のトークン

英語版: [journey.md](./journey.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `journey` のトークンを定めます。
ノードは仕様の [`ast/journey.ja.md`](../../../spec/docs/ast/journey.ja.md)
が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/journey.ja.md](../../../spec/docs/diagrams/journey.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/journey.ja.md#文法) の **項目** の 1
つに属し、この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` 単位。`title`、`section`、`accTitle`、`accDescr` の単位                                                                                                                                                                                                      |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/journey.ja.md#単位の中のディレクティブ) のテキストの単位: `title-text`、`section-text`、`task-text`、`score`、`person`、`ignored-data`、`acc-title-text`、`acc-description-text`、`acc-description-block-text` |
| `Punctuator` | `:`、`,`、`{`、`}`                                                                                                                                                                                                                                                    |

[fixture: journey/header-only] [fixture: journey/db-title-statement]
[fixture: journey/db-sections] [fixture: journey/db-acc-title]
[fixture: journey/db-acc-descr] [fixture: journey/db-acc-descr-block]
[fixture: journey/db-task-people] [fixture: journey/db-task-extra-colon]

どの項目も 1 つの単位で、したがって 1 つの **トークン** です。
`A: 3: a,b: c, d` は、`RawText` トークン `A`、`3`、`a`、`b` と、
`Punctuator` トークン `:`、`:`、`,` と、
無視されるデータの `RawText` トークン `: c, d` を持ちます。
このトークンのコロンは、その文字です。 [fixture: journey/db-task-extra-colon]
`;` 単位と、データを始めない `:` 単位は、文法のどの規則も取らないので、
入力は拒否され、それらのトークンは作られません。
[fixture: journey/lex-semicolon-line] [fixture: journey/lex-task-colon-at-end]

トークンは両端に空白を持ちません。
ただし mermaid.js
が値の一部として読むところは別です（[トークン](../tokens.ja.md#トークン)
を参照）。
値が両端の空白を保つ単位は、トークンもそれを保ちます。
`task-text` は、コロンの前の空白を含みます（`Make tea  : 3` は、
`Make tea` と 2 つの空白のトークンを持ちます）。
`title-text` と `section-text` も保ちます（`title` と、2 つの空白の後の `T` は、
空白 1 つと `T` のトークンを持ち、 `title T` と 3 つの空白は、
`T` と 3 つの空白のトークンを持ちます）。
mermaid.js が値をトリムするアクセシビリティのテキスト、つまり `acc-title-text`、
`acc-description-text`、 `acc-description-block-text` と、
単位が両端に空白を持たない `score`、`person`、`ignored-data` は、
それを含みません。
`accTitle: T` と 3 つの空白は、トークン `T` を持ちます。
`accDescr {`、`line one` の行、`line two` の行、`}` だけの行は、 `line one`、
改行とインデント、`line two` のトークンを持ちます。
字句解析器がブロックのテキストに読み込む、`}` の前の改行と空白は含みません。
`A:` の後に U+00A0、`5`、U+00A0、`: Me` が続くスコアは、
トークン `5` を持ちます。 [fixture: journey/db-task-description-spaces]
[fixture: journey/lex-title-two-spaces]
[fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-section-two-spaces]
[fixture: journey/gram-acc-title-trailing-spaces]
[fixture: journey/db-acc-descr-block]
[fixture: journey/lex-task-score-nbsp-trimmed]

タイトルのテキストやセクションのテキストの終わりでは、
閉じたディレクティブは何も終わらせず、その前の空白はトークンに残ります。
CR や CRLF は、改行と同じくテキストを終わらせます。
`title T %%{init: {}}%%` は `T` と空白 1 つのトークンを持ち、
`title T%%{init: {}}%%` はトークン `T` を持ち、
`title T` と CRLF はトークン `T` を持ちます。
[fixture: journey/lex-directive-at-end-of-title-line]
[fixture: journey/lex-directive-glued-at-end-of-title]
[fixture: journey/lex-directive-at-end-of-section-line]
[fixture: journey/lex-directive-glued-at-end-of-section]
[fixture: journey/lex-title-crlf-value] [fixture: journey/lex-title-cr-value]
[fixture: journey/lex-section-crlf-value]
[fixture: journey/lex-section-cr-value]

`RawText` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます。
[単位の中のディレクティブ](../../../spec/docs/diagrams/journey.ja.md#単位の中のディレクティブ)
を参照。
`a%%{init: {}}%%b: 5` は、`RawText` トークン `a` と `b` と、
その間の `Directive` トークンを持ちます。
`A: 5: Me: a %%{init: {}}%%b` の無視されるデータは、
ディレクティブの前の空白を含む `RawText` トークン `: a` と、`b` を持ちます。
一方、 `ti%%{init: {}}%%tle T` は拒否されます。
[fixture: journey/lex-directive-after-space-in-ignored-data]
[fixture: journey/lex-directive-in-task-text]
[fixture: journey/div-directive-in-title-keyword]
[fixture: journey/div-ignored-semicolon-in-title-keyword]

- 空の説明ブロックは、`Keyword` トークン `accDescr` と、
  `Punctuator` トークン `{` と `}` を持ちます。
  [fixture: journey/gram-acc-descr-block-empty]
- 行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
  `accTitle: style:#x;` は、`RawText` トークン `style:#x` と、
  `IgnoredSemicolon` トークン `;` を持ちます。
  同じ行の `accDescr { style:#x }` の後の `A;B: 5` は、
  `RawText` トークン `A` と `B` と、
  その間の `IgnoredSemicolon` トークンを持ちます。
  [fixture: journey/tokens-ignored-semicolon-in-acc-title]
  [fixture: journey/tokens-ignored-semicolon-in-task-text]

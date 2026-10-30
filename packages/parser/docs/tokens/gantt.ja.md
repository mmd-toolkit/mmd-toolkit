# Gantt のトークン

英語版: [gantt.md](./gantt.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `gantt` のトークンを定めます。
ノードは仕様の [`ast/gantt.ja.md`](../../../spec/docs/ast/gantt.ja.md)
が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/gantt.ja.md](../../../spec/docs/diagrams/gantt.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/gantt.ja.md#文法) の **項目** の 1 つに属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | `header` 単位。`accTitle`、`accDescr`、`href`、`call`、`click`、`dateFormat`、`axisFormat`、`tickInterval`、`todayMarker`、`includes`、`excludes`、`inclusiveEndDates`、`weekday`、`weekend`、`title`、`section` の単位。`day` 単位                                                                                            |
| `Identifier` | [単位の中のディレクティブ](../../../spec/docs/diagrams/gantt.ja.md#単位の中のディレクティブ) の名前の単位: `id`、`list-item`                                                                                                                                                                                                   |
| `String`     | [単位の中のディレクティブ](../../../spec/docs/diagrams/gantt.ja.md#単位の中のディレクティブ) の文字列の単位 `url-text` と、その両側の 2 つの `"` 単位                                                                                                                                                                          |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/gantt.ja.md#単位の中のディレクティブ) のテキストの単位: `setting-text`、`marker-text`、`title-text`、`section-text`、`task-text`、タグを含む `data-item`、`callback-name`、`callback-arguments`、`acc-title-text`、`acc-description-text`、`acc-description-block-text` |
| `Punctuator` | `:`、`,`、`{`、`}`、`(`、`)`                                                                                                                                                                                                                                                                                                   |

[fixture: gantt/header-only] [fixture: gantt/gram-acc-title]
[fixture: gantt/gram-acc-descr] [fixture: gantt/gram-acc-descr-block]
[fixture: gantt/gram-click-href] [fixture: gantt/gram-click-call-arguments]
[fixture: gantt/db-date-format] [fixture: gantt/db-axis-format]
[fixture: gantt/db-tick-interval] [fixture: gantt/db-today-marker]
[fixture: gantt/db-includes-tokens] [fixture: gantt/db-excludes-tokens]
[fixture: gantt/db-inclusive-end-dates] [fixture: gantt/db-weekday-last-wins]
[fixture: gantt/db-weekend-friday] [fixture: gantt/db-title-statement]
[fixture: gantt/db-sections] [fixture: gantt/gram-task]
[fixture: gantt/gram-task-tag-then-item] [fixture: gantt/gram-click-ids-list]
[fixture: gantt/gram-empty-href-line]

**トークン** は、1 つの項目の、続いて並ぶ単位の並びです。
単位が空白を保つ場合を除き、両端の空白を含みません。
リンクの部分の文字列、つまり `"` 単位とその間の `url-text` は、
開きの引用符から閉じの引用符までの 1 つの `String` トークンです。
`href "u"` は、
`Keyword` トークン `href` と `String` トークン `"u"` を持ちます。
[fixture: gantt/gram-click-href]
ほかの項目はどれも 1 つの単位で、したがって 1 つのトークンです。

トークンは両端に空白を持ちません。
ただし mermaid.js
が値の一部として読むところは別です（[トークン](../tokens.ja.md#トークン)
を参照）。
値が両端の空白を保つ単位は、トークンもそれを保ちます。
`task-text` は、コロンの前の空白を含みます（`a  : 1d` は、
`a` と 2 つの空白のトークンを持ちます）。
`setting-text`、`marker-text`、`title-text`、
`section-text` も保ちます（`dateFormat` と、2 つの空白の後の `X` は、
空白 1 つと `X` のトークンを持ち、 `title T` と 2 つの空白は、
`T` と 2 つの空白のトークンを持ちます）。
`callback-name` は、`(` の前の空白と改行を含みます（`call f ()` は、
`f` と空白 1 つのトークンを持ちます）。
`callback-arguments` 単位も保ちます（`call f( 1)` は、
空白 1 つと `1` のトークンを持ちます）。
[fixture: gantt/lex-task-text-trailing-spaces]
[fixture: gantt/lex-dateformat-two-spaces]
[fixture: gantt/lex-title-trailing-spaces]
[fixture: gantt/gram-click-call-name-space-before-parenthesis]
[fixture: gantt/gram-click-call-name-line-feed-before-parenthesis]
[fixture: gantt/gram-click-call-arguments-leading-space]
mermaid.js が値をトリムするアクセシビリティのテキストと、
単位が両端に空白を持たないタスクのデータの項目は、それを含みません。
`accTitle: T` と 2 つの空白は、トークン `T` を持ちます。
[fixture: gantt/gram-acc-title-trailing-spaces]
[fixture: gantt/lex-task-items-nbsp-trimmed]

タイトルのテキストやセクションのテキストの終わりでは、
閉じたディレクティブは何も終わらせず、その前の空白はトークンに残ります。
CR や CRLF は、改行と同じくテキストを終わらせます。
`title T %%{init: {}}%%` は `T` と空白 1 つのトークンを持ち、
`title T%%{init: {}}%%` はトークン `T` を持ち、
`title T` と CRLF はトークン `T` を持ちます。
[fixture: gantt/lex-directive-at-end-of-title-line]
[fixture: gantt/lex-directive-glued-at-end-of-title]
[fixture: gantt/lex-directive-at-end-of-section-line]
[fixture: gantt/lex-directive-glued-at-end-of-section]
[fixture: gantt/lex-title-crlf-value] [fixture: gantt/lex-section-crlf-value]
[fixture: gantt/lex-section-cr-value]

`RawText` か `String` のトークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
切られた `String` トークンは `StringFragment` トークンになります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます。
[単位の中のディレクティブ](../../../spec/docs/diagrams/gantt.ja.md#単位の中のディレクティブ)
を参照。
`a : 1%%{init: {}}%%d` は、`RawText` トークン `1` と `d` と、
その間の `Directive` トークンを持ちます。
一方、 `click id%%{init: {}}%%1 href "u"` は拒否されます。
[fixture: gantt/lex-directive-in-task-data]
[fixture: gantt/lex-directive-in-task-text]
[fixture: gantt/lex-directive-in-href-string]
[fixture: gantt/tokens-ignored-semicolon-in-href-string]
[fixture: gantt/div-directive-in-click-id]
[fixture: gantt/div-ignored-semicolon-in-click-id]

- タグは `data-item` 単位で、テキストの単位です。
  そのため、ノードは Identifier ですが、
  トークンは項目と同じく `RawText` トークンです。
  `a : done, 1d` は、`RawText` トークン `done` と `1d` を持ちます。
  タグの中のディレクティブは、ほかのテキストの単位と同じくトークンを切り、
  タグの名前は、ディレクティブを除いたテキストです。
  `a : do%%{init: {}}%%ne, t1, 2024-01-01, 1d` はタグ `done` を持ち、
  `RawText` トークン `do` と `ne` を持ちます。
  [fixture: gantt/gram-task-tag-then-item]
  [fixture: gantt/gram-task-tag-cut-by-directive]
- 文である空の説明ブロックは、`Keyword` トークン `accDescr` と、
  `Punctuator` トークン `{` と `}` を持ちます。
  [fixture: gantt/gram-acc-descr-block-empty]
- 行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
  `title a;b style:#x;` では、最初の `;` はその行の最後ではないので、
  `RawText` トークン `a;b style:#x` の文字です。
  最後の `;` は `IgnoredSemicolon` トークンです。
  [fixture: gantt/tokens-ignored-semicolon-in-title-text]

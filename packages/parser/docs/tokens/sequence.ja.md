# sequence のトークン

英語版: [sequence.md](./sequence.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `sequence`のトークンを定めます。
ノードは、仕様の
[`ast/sequence.ja.md`](../../../spec/docs/ast/sequence.ja.md) が定めます。
すべての図種に共通するトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/sequence.ja.md](../../../spec/docs/diagrams/sequence.ja.md#字句構造)
の単位から作ります。
すべて空白ではない各単位と、`title` か `title:` の文の `title-text` の単位と、
U+2028 か U+2029 を持つ箱の `text` の単位
（[SequenceTitleStatement](../../../spec/docs/ast/sequence.ja.md#sequencetitlestatement)
と [SequenceBoxText](../../../spec/docs/ast/sequence.ja.md#sequenceboxtext)
を参照）は、
1 つのトークンで、その種類はこの表のとおりです。

| 種類         | 単位                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | キーワード: `sequenceDiagram`、`participant`、`actor`、`create`、`destroy`、`as`、`box`、`loop`、`rect`、`opt`、`alt`、`else`、`par`、`par_over`、`and`、`critical`、`option`、`break`、`end`、`note`、`left`、`right`、`of`、`over`、`links`、`link`、`properties`、`details`、`activate`、`deactivate`、`autonumber`、`off`。`title`、`title:`、`accTitle`、`accDescr` の単位。`wrap-prefix` の単位 |
| `Numeric`    | `number` の単位                                                                                                                                                                                                                                                                                                                                                                                       |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/sequence.ja.md#単位の中のディレクティブ) のテキストの単位                                                                                                                                                                                                                                                                                      |
| `Punctuator` | `arrow` の単位。`+`、`-`、`()`、`,`、`:`、`{`、`}`、`@{`。`;` から読む `newline` の単位                                                                                                                                                                                                                                                                                                               |

[fixture: sequence/db-participant-empty-alias]
[fixture: sequence/db-actor-id-entity]
[fixture: sequence/db-create-participant-before-message]
[fixture: sequence/lex-alias-lookahead-line-break-destroy]
[fixture: sequence/db-box-empty]
[fixture: sequence/gram-block-empty-text]
[fixture: sequence/db-block-rect]
[fixture: sequence/db-block-opt]
[fixture: sequence/db-block-alt]
[fixture: sequence/db-block-par]
[fixture: sequence/db-block-par-over]
[fixture: sequence/db-block-critical]
[fixture: sequence/db-block-break]
[fixture: sequence/db-note-over-two]
[fixture: sequence/db-note-left-of]
[fixture: sequence/db-links-empty]
[fixture: sequence/db-link-without-at]
[fixture: sequence/db-properties-empty]
[fixture: sequence/db-details-adds-participant]
[fixture: sequence/db-activate-id-entity]
[fixture: sequence/db-deactivate-after-plus]
[fixture: sequence/db-autonumber-start]
[fixture: sequence/db-autonumber-off]
[fixture: sequence/db-title-spaces]
[fixture: sequence/db-title-legacy]
[fixture: sequence/db-acc-title-whitespace-ends]
[fixture: sequence/db-acc-descr-line-whitespace-ends]
[fixture: sequence/lex-wrap-prefix-colon]
[fixture: sequence/db-message-activate-target]
[fixture: sequence/db-message-central-connection-source]
[fixture: sequence/db-acc-descr-empty-block-after-message]
[fixture: sequence/gram-data-block-line-break-only]
[fixture: sequence/gram-title-then-separators]
[fixture: sequence/db-box-colour-then-spaces-and-line-separator]

トークンは、その単位から両端の空白を除いたものです。
ただし、mermaid.js がその空白を値の一部として読むところは除きます
（[トークン](../tokens.ja.md#トークン) を参照）。
`title` か `title:` の文の `title-text` の単位のトークンは単位の全体で、
`accTitle:` のものは、mermaid.js が削る両端の空白を除いたものです。
箱のテキストでは U+2028 と U+2029 を空白に数えません
（[SequenceBoxText](../../../spec/docs/ast/sequence.ja.md#sequenceboxtext)
を参照）。
[fixture: sequence/db-title-spaces]
[fixture: sequence/db-acc-title-whitespace-ends]
[fixture: sequence/db-box-colour-then-spaces-and-line-separator]
箱のテキストで、色の候補と残りの間の空白は、
SequenceBoxText の値に入り、そのどちらの部分にも入りません。
この空白は、SequenceBoxText が持つ、それ自体の `RawText` のトークンです。
その中のディレクティブは、どのトークンとも同じくそれを切ります。
`box Aqua G` は、トークン `Aqua`、空白、`G` を持ちます。
[fixture: sequence/tokens-box-text-space-between-parts]
[fixture: sequence/tokens-box-text-directive-between-parts]
色の候補の直後のディレクティブは、その空白の外にあるので、
空白がなければそのトークンはありません。
`box red%%{init: {}}%%-team` は、
トークン `red`、ディレクティブ、`-team` を持ち、
`box red%%{init: {}}%% text` は、
トークン `red`、ディレクティブ、空白、`text` を持ちます。
[fixture: sequence/tokens-box-text-directive-between-parts-without-space]
[fixture: sequence/tokens-box-text-directive-then-space-before-remainder]
改行から読む `newline` の単位は空白で、トークンになりません。
[fixture: sequence/gram-block-empty-text]
トークンの中のディレクティブ、コメント領域、無視される `;` は、
トークンを断片に切ります
（[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
を参照）。
空白 2 個が続く `title x %%{init: {}}%%` のトークンは、
`x` と空白 1 個、そして空白 2 個で、タイトルは `x` と空白 3 個です。
[fixture: sequence/tokens-title-directive-then-spaces]
`RawText` でないトークンの中のディレクティブと無視される `;` は、
入力を拒否させます
（[単位の中のディレクティブ](../../../spec/docs/diagrams/sequence.ja.md#単位の中のディレクティブ)
を参照）。
[fixture: sequence/div-directive-in-keyword]
[fixture: sequence/div-directive-in-arrow]
[fixture: sequence/div-directive-in-number]
[fixture: sequence/div-ignored-semicolon-in-keyword]
[fixture: sequence/div-ignored-semicolon-in-arrow]

- 参加者の id は 1 つの `RawText` のトークンで、
  mermaid.js が id の一部として読む、中の空白もそのトークンに入ります。
  ディレクティブや無視される `;` は、どのテキストとも同じくそれを切ります。
  `participant A %%{init: {}}%% B` はトークン `A ` と ` B` を持ち、
  id は `A`、空白 2 つ、`B` です。
  [fixture: sequence/tokens-directive-participant-spaces]
  [fixture: sequence/tokens-ignored-semicolon-in-participant-id]
- キーワード `left of` と `right of` は、語ごとに 1 つの、
  2 つの `Keyword` のトークンです。
  語の間の空白に接したディレクティブや無視される `;` は、
  2 つのトークンの間にあります。
  `Note left%%{init: {}}%% of A: t` は、mermaid.js と同じく note です。
  [fixture: sequence/lex-directive-between-left-and-of]
  [fixture: sequence/tokens-ignored-semicolon-between-left-and-of]
- テキストの前の `:` と、`accTitle` と `accDescr` の後の `:` は、
  文の `Punctuator` のトークンで、どの欄にも属しません。
  [fixture: sequence/db-note-over-two]
  [fixture: sequence/db-acc-title-whitespace-ends]
  [fixture: sequence/db-acc-descr-line-whitespace-ends]
- テキストの折り返しの接頭辞（`wrap:` や `:nowrap:`）は、
  1 つの `Keyword` のトークンで、
  その
  [SequenceText](../../../spec/docs/ast/sequence.ja.md#sequencetext)
  の最初のトークンです。
  [fixture: sequence/db-message-wrap-prefix-without-text]
  [fixture: sequence/lex-wrap-prefix-colon]
- `@{` と `}` の間のデータブロックのテキストは、
  両端の空白と改行を含む 1 つの `RawText` のトークンです。
  その空白と改行は
  [SequenceDataBlock](../../../spec/docs/ast/sequence.ja.md#sequencedatablock)
  の値に入ります。
  `participant A@{`、改行、`}` は、その改行のトークンを持ちます。
  `participant A@{ type: %%{init: {}}%% actor }` は、
  それぞれ隣の空白を含むトークン `type:` と `actor` を持ち、
  その間にディレクティブがあります。
  コメント行の前の空行は、コメント領域に入り、値にもトークンにも入りません。
  [fixture: sequence/gram-data-block-line-break-only] [fixture:
  sequence/tokens-data-block-directive-inside] [fixture:
  sequence/tokens-data-block-directive-line] [fixture:
  sequence/tokens-comment-region-in-data-block] [fixture:
  sequence/tokens-comment-region-blank-line-in-data-block]
- 文を終える `;` は、改行と同じく、
  どの文にも属さない `Punctuator` のトークンです。
  `title a;;` のタイトルは `a` で、その後にそのようなトークンが 2 つ続きます。
  [fixture: sequence/gram-title-then-separators]
- 行の規則が無視する `;` は、どの文脈でも `IgnoredSemicolon` のトークンで、
  中にある `RawText` のトークンを切ります
  （[トークン](../tokens.ja.md#トークン) を参照）。
  `loop style:#x;` では、テキスト `style:` が行の文脈を出て、
  `#x` は文の文脈の図のコメントで、
  その後の `;` は `IgnoredSemicolon` のトークンです。
  タイトルが `style:a` である `title style:a#b;` でも同じです。
  `accTitle: style:#x;` では、題は `style:#x` で、
  その後の `;` は `IgnoredSemicolon` のトークンです。
  `participant A@{ style:#x; }` の `style:#x` の後の `;` も同じで、
  データのテキストを `RawText` のトークン ` style:#x` と ` ` に切ります。
  `participant A@{ "style": "x:#y" }` の後の `;` も同じです。
  `participant A@{ "style": "x:#y;" }` では、`;` がデータのテキストを
  `RawText` のトークン ` "style": "x:#y` と `" ` に切ります。
  [fixture: sequence/tokens-acc-title-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-block-ignored-semicolon] [fixture:
  sequence/tokens-data-block-ignored-semicolon-alone] [fixture:
  sequence/tokens-data-block-then-ignored-semicolon] [fixture:
  sequence/tokens-data-block-ignored-semicolon-inside] [fixture:
  sequence/tokens-loop-comment-then-ignored-semicolon] [fixture:
  sequence/tokens-title-comment-then-ignored-semicolon] [fixture:
  sequence/tokens-comment-then-ignored-semicolon]

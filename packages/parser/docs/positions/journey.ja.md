# Journey の位置

英語版: [journey.md](./journey.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md)
にあります。
ノードは仕様の [`ast/journey.ja.md`](../../../spec/docs/ast/journey.ja.md) が、
トークンは [tokens/journey.ja.md](../tokens/journey.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### JourneyDiagram

範囲は、
どの図の `Root.body`
のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲)
を参照）。

### JourneyTaskStatement

範囲は、説明から、データの最後のトークンまでです。
最後のトークンは、無視されるデータか、最後の人か、
後の人が空のときは最後の `,` か、人の部分が空白だけのときは 2 つ目のコロンか、
スコアか、データが空白だけのときは最初のコロンです。
`A: 5: Me,` は `A: 5: Me,` を覆い、`A: 5:` は `A: 5:` を覆い、
`A:` と空白 1 つは `A:` を覆います。 [fixture: journey/db-task-people]
[fixture: journey/db-task-extra-colon]
[fixture: journey/gram-task-people-trailing-comma]
[fixture: journey/gram-task-second-colon-at-end]
[fixture: journey/db-task-score-only]
[fixture: journey/gram-task-data-whitespace-only]

### JourneyTitleStatement と JourneySectionStatement

範囲は、キーワードから、テキストの終わりまでです。
トークンが保つテキストの終わりの空白も含みます。
[トークン](../tokens/journey.ja.md#トークン) を参照。
`title T` と 3 つの空白は 3 つの空白も覆い、 `section` と 2 つの空白は、
名前が空白 1 つで、 2 つの空白を覆います。
[fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-section-whitespace-only]

### JourneyAccTitleStatement と JourneyAccDescrStatement

範囲は、キーワードから、テキストの空白でない最後の文字までです。
値が除く行末の空白は、範囲の外にあります。
[fixture: journey/gram-acc-title-trailing-spaces]

### JourneyLiteral

範囲はそのトークンの範囲で、トークンが両端の空白を保つところでは、
それを含みます（[トークン](../tokens/journey.ja.md#トークン) を参照）。
値はその範囲の書かれたテキストです。
`Make tea  : 3` の説明は、`Make tea` とコロンの前の 2 つの空白を覆います。
`title T` と 3 つの空白のタイトルは、 `T` と 3 つの空白を覆います。
[fixture: journey/db-task-description-spaces]
[fixture: journey/lex-title-trailing-spaces]

### JourneyIgnoredText

範囲は、データの 3 つ目のコロンから、データの空白でない最後の文字までです。
`A: 3: a,b: c, d` の無視されるテキストは `: c, d` で、
`A: 5: Me:` のものは `:` です。
最後の文字の後の、データの終わりの空白は、その外にあり、タスクの外にもあります。
データの中のディレクティブは範囲の中にあり、値はそれを除きます。
`A: 5: Me: a %%{init: {}}%%b` の無視されるテキストは、
3 つ目のコロンから `b` までで、値は `: a b` です。
[fixture: journey/lex-directive-after-space-in-ignored-data]
[fixture: journey/db-task-extra-colon]
[fixture: journey/gram-task-third-colon-at-end]
[fixture: journey/gram-task-four-colons]
[fixture: journey/gram-task-ignored-data-trailing-spaces]

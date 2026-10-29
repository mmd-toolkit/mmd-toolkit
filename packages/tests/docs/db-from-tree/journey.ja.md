# journey の Db を木から作る

英語版: [journey.md](./journey.md)

journey 図の木から Db の要約を作る手順です。
`src/db-from-tree/journey.ts`
がこれを実装します（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、
仕様の [diagrams/journey.ja.md](../../../spec/docs/diagrams/journey.ja.md) と、
[ast/journey.ja.md](../../../spec/docs/ast/journey.ja.md) が定めます。
要約の欄は [db-summaries.ja.md](../db-summaries.ja.md#journey) にあります。

mermaid.js は、構文解析の間に Db を作ります。
文法は、文が終わるたびに Db のメソッドを呼びます。
出典は
[`statement`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L60-L67)
です。
Db は、メソッドに渡されたものを保ちます。
出典は
[`addTask`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)、
[`addSection`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L26-L29)、
[`setDiagramTitle`、`setAccTitle`、`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)
です。
要約も同じように作ります。
文を出現順に実行し、Db が持つ列がそのまま要約です。
値は、空白を含めて Db が持つとおりに保ちます。
要約はタスクの列を一度だけ読むので、木の各タスクは、
要約のタスクを 1 つずつ作ります。
[db-summaries.ja.md](../db-summaries.ja.md#journey) を参照。

## 木から要約を作る

**変換した形。**
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティは、説明でも、そのほかのどのテキストでも、プレースホルダです。
`a#amp; b: 5` は、説明が `a`、プレースホルダ、` b` のタスクです。
同じことが、タイトル、section の名前、人、
アクセシビリティのテキストでも成り立ちます。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として読みます。
これは description ブロックの中でのことです。
タイトルや section の名前を終える行終端は、
どれであってもテキストの一部ではありません。
`title T` の後ろが CRLF でも単独の `\r` でも、タイトルは `T` です。
各属性の引用符は `'` として読みます。
これはタイトルと説明の中でのことです。
[fixture: journey/entity-placeholder-in-task-text]
[fixture: journey/entity-placeholder-in-title]
[fixture: journey/entity-placeholder-in-section]
[fixture: journey/entity-placeholder-in-person]
[fixture: journey/entity-placeholder-in-acc-title]
[fixture: journey/entity-placeholder-in-acc-descr]
[fixture: journey/entity-placeholder-in-acc-descr-block]
[fixture: journey/db-acc-descr-block-crlf]
[fixture: journey/db-acc-descr-block-lone-cr]
[fixture: journey/lex-title-cr-value] [fixture: journey/lex-title-crlf-value]
[fixture: journey/lex-section-cr-value]
[fixture: journey/lex-section-crlf-value]
[fixture: journey/lex-html-tag-in-title]
[fixture: journey/lex-html-tag-in-task-text]

**テキスト。**
木の葉ノードのテキストは、次のように読みます。

- JourneyLiteral は、その範囲の変換した形を持ちます。
  `value` は木が持つ書かれたとおりのテキストで、
  Db が持つのは mermaid.js が読むとおりのテキストです。
- ディレクティブがテキストの単位の中にあっても、変換した形にはないので、
  テキストにもありません。
  `a%%{init: {}}%%b: 5` はタスク `ab` で、
  `title a%%{init: {}}%%b` のタイトルは `ab`、
  `A: 1%%{init: {}}%%0` のスコアは `10` です。
  description ブロックの中のコメント行も同じです。
  [fixture: journey/lex-directive-in-task-text]
  [fixture: journey/lex-directive-in-score]
  [fixture: journey/lex-directive-in-person]
  [fixture: journey/lex-directive-in-title-text]
  [fixture: journey/lex-directive-in-section-text]
  [fixture: journey/lex-directive-in-acc-title]
  [fixture: journey/lex-directive-in-acc-descr-block]
  [fixture: journey/tokens-comment-line-in-acc-block]
- 行規則が無視する `;` も、テキストの中では変換した形にありません。
  そのため、説明、スコア、人、タイトル、section の名前、
  アクセシビリティのテキストは、それを除いたテキストを持ちます。
  [fixture: journey/tokens-ignored-semicolon-in-task-text]
  [fixture: journey/tokens-ignored-semicolon-in-score]
  [fixture: journey/tokens-ignored-semicolon-in-person]
  [fixture: journey/tokens-ignored-semicolon-in-title-text]
  [fixture: journey/tokens-ignored-semicolon-in-section-text]
  [fixture: journey/tokens-ignored-semicolon-in-acc-title]
  [fixture: journey/tokens-ignored-semicolon-in-acc-descr]
  [fixture: journey/tokens-ignored-semicolon-in-acc-block]
- テキストの両端の空白は、木が持つとおりに残ります。
  説明のテキストはコロンの前の空白を保ちます。
  タイトルと section の名前は両端の空白を保ち、空白だけの名前もそのままです。
  行を終えるディレクティブが続く場合も同じです。
  [fixture: journey/db-task-description-spaces]
  [fixture: journey/lex-whitespace-ideographic-space-around-task]
  [fixture: journey/lex-title-two-spaces]
  [fixture: journey/lex-title-trailing-spaces]
  [fixture: journey/lex-title-whitespace-only]
  [fixture: journey/lex-section-two-spaces] [fixture: journey/db-sections]
  [fixture: journey/lex-section-whitespace-only]
  [fixture: journey/lex-directive-at-end-of-title-line]
  [fixture: journey/lex-directive-at-end-of-section-line]
- 人とアクセシビリティのテキストは、その範囲の変換した形から、
  両端の空白を除いたものです。
  mermaid.js がそう trim します。
  ディレクティブがその空白の隣にあっても同じです。
  [fixture: journey/gram-task-people-nbsp-trimmed]
  [fixture: journey/lex-directive-after-person]
  [fixture: journey/gram-acc-title-trailing-spaces]
  [fixture: journey/lex-acc-title-spaces-around-colon]
  [fixture: journey/lex-directive-after-acc-title-text]

**巡り。**
本体の文は出現順に実行し、文は、それがある時点で Db を変えます。
タスクは、それより前の section を参照します（**タスク**を参照）。
空の description ブロック、
つまりテキストのない JourneyAccDescrBlockStatement は、何も変えません。
そのまわりの文は、それがないものとして実行されます。
[fixture: journey/gram-acc-descr-block-empty]
[fixture: journey/gram-acc-descr-block-whitespace-only]
[fixture: journey/gram-empty-description-block-after-block]
[fixture: journey/gram-empty-description-block-before-task-same-line]
[fixture: journey/gram-empty-description-blocks-adjacent]

**既定値。**
文がなければ、Db のタイトル（フロントマターのタイトルがあればそれ）、
`accTitle`、`accDescr` は空のテキストで、 section もタスクもありません。
[fixture: journey/header-only] [fixture: journey/db-title-frontmatter]

**タイトルと section。**
タイトルはフロントマターのもので、`title` の文があれば、
その文の値のテキスト（書かれたとおり、両端の空白を含む）で置き換えられ、
その後は最後のものが勝ちます。
タイトルには文字の置き換え（下を参照）をします。
`section` の文は、名前のテキストを書かれたとおりに `sections` の後ろに加えます。
繰り返しても同じです。 [fixture: journey/db-title-frontmatter]
[fixture: journey/db-title-statement]
[fixture: journey/db-title-statement-after-frontmatter]
[fixture: journey/lex-title-twice] [fixture: journey/db-sections]
[fixture: journey/db-section-ends-at-hash]

**タスク。**
タスクの文は、タスクを 1 つ `tasks` の後ろに加えます。
タスクは `section`、`task`、`people`、`score` を持ちます。
これらの値は、文と、それより前の section から決まります。

- `task` は説明のテキストで、書かれたとおりです。
  `section` は、タスクより前の最後の `section` の文の名前で、
  書かれたとおりです。
  なければ空のテキストです。 [fixture: journey/db-task-description-spaces]
  [fixture: journey/db-task-before-section]
  [fixture: journey/db-section-ends-at-hash]
  [fixture: journey/docs-intro-examples-e978837a]
- `score` は、文にスコアがなければ `0` です。
  あれば、スコアのテキストから JavaScript が作る数です。
  そのため `3.5`、`-2`、`1e2`、`0x10` は数です。
  有限の数でないスコアは、JSON にそのような数がないので、数のテキストです。
  数でないテキスト（`abc` や `5, 6`）は `NaN` です。
  テキスト `Infinity` と `-Infinity`、
  および `1e400` のように倍精度に収まらない大きな数は、
  `Infinity` と `-Infinity` です。 [fixture: journey/db-task-score-only]
  [fixture: journey/db-task-score-decimal]
  [fixture: journey/db-task-score-negative]
  [fixture: journey/db-task-score-exponent]
  [fixture: journey/db-task-score-hexadecimal]
  [fixture: journey/db-task-score-not-a-number]
  [fixture: journey/gram-task-score-comma]
  [fixture: journey/db-task-score-infinity]
  [fixture: journey/db-task-score-negative-infinity]
  [fixture: journey/db-task-score-overflow]
  [fixture: journey/db-task-score-spaces]
  [fixture: journey/lex-task-score-nbsp-trimmed]
  [fixture: journey/db-task-score-empty]
  [fixture: journey/gram-task-data-whitespace-only]
- `people` は、文の `people` の要素ごとに名前を 1 つ持ちます。
  人のテキストか、null の要素なら空のテキストです。
  2 つ目のコロンのない文は、人を持ちません。 [fixture: journey/db-task-people]
  [fixture: journey/db-task-people-empty-item]
  [fixture: journey/db-task-people-blank]
  [fixture: journey/gram-task-second-colon-at-end]
  [fixture: journey/gram-task-people-trailing-comma]
  [fixture: journey/db-task-score-only]
- データの 3 つ目のコロンから後のテキスト、つまり木の `textAfter` は、
  Db にありません。 [fixture: journey/db-task-extra-colon]
  [fixture: journey/gram-task-third-colon-at-end]
  [fixture: journey/gram-task-four-colons]

**アクセシビリティ。**
`accTitle` は最後の `accTitle` の文のテキストに文字の置き換えをしたもので、
なければ空のテキストです。
`accDescr` は、最後の `accDescr` の文か、
テキストのある description ブロックのテキストです。
各改行は、その後ろの空白（改行も含む）とともに 1 つの改行に置き換え、
そのあと文字の置き換えをします。
改行の前の空白は残ります。
テキストのない description ブロックは何も変えません。
テキストは後の行から始まってもかまいません。
`accTitle:` の次の行が `A` なら、タイトルは `A` です。
[fixture: journey/db-acc-title] [fixture: journey/lex-acc-title-twice]
[fixture: journey/gram-acc-title-line-feed-then-text]
[fixture: journey/gram-acc-title-blank-lines-then-text]
[fixture: journey/db-acc-descr] [fixture: journey/gram-acc-descr-twice]
[fixture: journey/gram-acc-descr-block-then-line]
[fixture: journey/gram-acc-descr-colon-then-block-same-line]
[fixture: journey/db-acc-descr-block]
[fixture: journey/db-acc-descr-block-blank-line]
[fixture: journey/db-acc-descr-block-spaces-before-line-feed]

**要約。**
要約は [db-summaries.ja.md](../db-summaries.ja.md#journey) の欄を持ちます。
上の値、文の順に並べた section の名前の `sections`、ソースの順の `tasks` です。

## 文字の置き換え

Db が `sanitizeText` に通すテキストは 3 つで、タイトル、`accTitle`、
`accDescr` です。
`journeyDbOf()` は、
[db-from-tree.ja.md](../db-from-tree.ja.md#文字の置き換え)の置き換え
`textReplacementOf(embedded.config)` を、これらのテキストにだけ適用します。
説明、スコア、人、section の名前は、書かれたとおりです。
タイトルは、フロントマターのものでも `title` の文のものでも置き換えます。
`accDescr` は、行をつないだあとで置き換え、
ブロックも行と同じように置き換えます。
[fixture: journey/config-security-level-other-title]
[fixture: journey/config-security-level-other-diagram-title]
[fixture: journey/config-security-level-other-acc-title]
[fixture: journey/config-security-level-other-acc-descr]
[fixture: journey/config-security-level-other-acc-descr-block]
[fixture: journey/config-security-level-other-html-labels-false]
[fixture: journey/config-security-level-other-names-as-written]

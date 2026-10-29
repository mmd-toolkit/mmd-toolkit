# gantt の Db を木から作る

英語版: [gantt.md](./gantt.md)

gantt 図の木から Db の要約を作る手順です。
`src/db-from-tree/gantt.ts`
がこれを実装します（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、
仕様の [diagrams/gantt.ja.md](../../../spec/docs/diagrams/gantt.ja.md) と
[ast/gantt.ja.md](../../../spec/docs/ast/gantt.ja.md) が定めます。
要約の欄は [db-summaries.ja.md](../db-summaries.ja.md#gantt) にあります。

mermaid.js は、構文解析の間に Db を作ります。
文法は、文が終わるたびに Db のメソッドを呼びます。
出典は
[`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L138-L156)、
[`clickStatement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L162-L173)
です。
Db は、メソッドに渡されたものを保ちます。
出典は
[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L557-L591)、
[`addSection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L160-L163)、
[`setIncludes`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L141-L143)、
[`setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L673-L694)、
[`setClickEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L778-L783)
です。
要約も同じように作ります。
文を出現順に実行し、Db が持つ列がそのまま要約です。
値は、空白を含めて Db が持つとおりに保ちます。
タスクの日付は要約に含まれないので、計算しません。
[db-summaries.ja.md](../db-summaries.ja.md#gantt) を参照。

## 木から要約を作る

**変換した形。**
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティは、説明でも、そのほかのどのテキストでも、プレースホルダです。
`a#amp; : 1d` は、説明が `a`、プレースホルダ、空白のタスクです。
同じことが、タスクの項目、section の名前、タイトル、設定の値、
`includes` のリスト項目、click の id、URL、コールバック名、コールバック引数、
アクセシビリティのテキストでも成り立ちます。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として読みます。
これは description ブロック、コールバック引数、URL の中でのことです。
各属性の引用符は `'` として読みます。
これはタイトル、URL、コールバック引数の中でのことです。
URL の文字列は、属性の引用符である引用符では終わりません。
[fixture: gantt/entity-placeholder-in-task-text]
[fixture: gantt/entity-placeholder-in-task-data]
[fixture: gantt/entity-placeholder-in-section]
[fixture: gantt/entity-placeholder-in-title]
[fixture: gantt/lex-dateformat-entity]
[fixture: gantt/entity-placeholder-in-axis-format]
[fixture: gantt/entity-placeholder-in-tick-interval]
[fixture: gantt/lex-todaymarker-entity]
[fixture: gantt/entity-placeholder-in-includes]
[fixture: gantt/entity-placeholder-in-click-id]
[fixture: gantt/entity-placeholder-in-href-string]
[fixture: gantt/entity-placeholder-in-callback-name]
[fixture: gantt/entity-placeholder-in-callback-arguments]
[fixture: gantt/entity-placeholder-in-acc-title]
[fixture: gantt/entity-placeholder-in-acc-descr]
[fixture: gantt/entity-placeholder-in-acc-descr-block]
[fixture: gantt/db-acc-descr-block-crlf]
[fixture: gantt/db-click-call-arguments-lone-cr]
[fixture: gantt/db-click-href-crlf] [fixture: gantt/lex-html-tag-in-title]
[fixture: gantt/db-click-href-attribute-quote]
[fixture: gantt/db-click-call-arguments-attribute-quote]

**テキスト。**
木の葉ノードのテキストは、次のように読みます。

- GanttLiteral と Identifier は、その範囲の変換した形を持ちます。
  GanttLiteral の `value` と Identifier の `name` は木が持つ、
  書かれたとおりのテキストで、
  Db が持つのは mermaid.js が読むとおりのテキストです。
  StringLiteral、つまり click の文の URL は、
  その範囲の変換した形から引用符を除いたものを持ちます。
  そのため `click id1 href "u"` の URL は `u` で、中の改行は残ります。
  [fixture: gantt/gram-click-href]
  [fixture: gantt/gram-click-href-line-feed-inside]
- ディレクティブがテキストの単位や文字列の単位の中にあっても、
  変換した形にはないので、テキストにもありません。
  `a%%{init: {}}%%b : 1d` はタスク `ab ` で、
  `click id1 href "u%%{init: {}}%%v"` の URL は `uv` です。
  テキストの単位や文字列の単位の中のコメント行も同じです。
  [fixture: gantt/lex-directive-in-task-text]
  [fixture: gantt/lex-directive-in-task-data]
  [fixture: gantt/lex-directive-in-title-text]
  [fixture: gantt/lex-directive-in-section-text]
  [fixture: gantt/lex-directive-in-setting-text]
  [fixture: gantt/lex-directive-in-acc-title]
  [fixture: gantt/lex-directive-in-acc-descr-block]
  [fixture: gantt/lex-directive-in-href-string]
  [fixture: gantt/lex-directive-in-callback-name]
  [fixture: gantt/lex-directive-in-callback-arguments]
  [fixture: gantt/tokens-comment-line-in-href-string]
  [fixture: gantt/tokens-comment-line-in-callback-arguments]
  [fixture: gantt/tokens-comment-line-in-acc-block]
- 行規則が無視する `;` も、テキストや文字列の中では変換した形にありません。
  そのため、タイトル、section の名前、タスクのデータ、説明、コールバック名、
  コールバック引数、URL、アクセシビリティのテキストは、
  それを除いたテキストを持ちます。
  `todayMarker` のテキストもそうで、`;` はそうでなければそれを終えます。
  click の id やリスト項目では、`;` がその単位を切り、入力は拒否されます。
  [fixture: gantt/tokens-ignored-semicolon-in-title-text]
  [fixture: gantt/tokens-ignored-semicolon-in-section-text]
  [fixture: gantt/tokens-ignored-semicolon-in-task-data]
  [fixture: gantt/tokens-ignored-semicolon-in-task-text]
  [fixture: gantt/tokens-ignored-semicolon-in-callback-name]
  [fixture: gantt/tokens-ignored-semicolon-in-callback-arguments]
  [fixture: gantt/tokens-ignored-semicolon-in-href-string]
  [fixture: gantt/tokens-ignored-semicolon-in-acc-title]
  [fixture: gantt/tokens-ignored-semicolon-in-acc-block]
  [fixture: gantt/tokens-ignored-semicolon-todaymarker]
  [fixture: gantt/div-ignored-semicolon-in-click-id]
  [fixture: gantt/div-ignored-semicolon-in-list-item]
  [既知の差異](../../../spec/docs/diagrams/gantt.ja.md#既知の差異)を参照。
- テキストの両端の空白は、木が持つとおりに残ります。
  説明のテキストはコロンの前の空白を保ちます。
  設定の値、タイトル、section の名前は両端の空白を保ちます。
  コールバック名とコールバック引数も、それぞれの空白を保ちます。
  [fixture: gantt/lex-task-text-trailing-spaces]
  [fixture: gantt/db-task-description-spaces]
  [fixture: gantt/lex-dateformat-two-spaces]
  [fixture: gantt/lex-dateformat-trailing-spaces]
  [fixture: gantt/db-date-format-extra-spaces]
  [fixture: gantt/lex-title-two-spaces]
  [fixture: gantt/lex-title-trailing-spaces]
  [fixture: gantt/lex-section-two-spaces]
  [fixture: gantt/lex-section-trailing-spaces]
  [fixture: gantt/gram-click-call-name-space-before-parenthesis]
  [fixture: gantt/gram-click-call-name-line-feed-before-parenthesis]
  [fixture: gantt/gram-click-call-arguments-leading-space]
- タスクのデータの項目とアクセシビリティのテキストは、その範囲の変換した形から、
  両端の空白を除いたものです。
  mermaid.js がそう trim します。
  ディレクティブがその空白の隣にあっても同じです。
  null の項目は空のテキストです。 [fixture: gantt/lex-task-items-nbsp-trimmed]
  [fixture: gantt/lex-task-data-line-separator-item]
  [fixture: gantt/tokens-unclosed-directive-in-data-line]
  [fixture: gantt/db-task-empty-data] [fixture: gantt/gram-task-empty-items]
  [fixture: gantt/gram-acc-title-trailing-spaces]
  [fixture: gantt/lex-acc-title-spaces-around-colon]
  [fixture: gantt/gram-acc-descr-block-multiline]

**巡り。**
本体の文は出現順に実行し、文は、それがある時点で Db を変えます。
タスクを参照する文、つまり click の文は、
それより前に読んだタスクを参照します（**click の文**を参照）。
空の description ブロック、つまりテキストのない GanttAccDescrBlockStatement は、
何も変えません。
そのまわりの文は、それがないものとして実行されます。
[fixture: gantt/gram-acc-descr-block-empty-then-title]
[fixture: gantt/gram-acc-descr-block-whitespace-only]
[fixture: gantt/gram-empty-description-block-after-click-statement]
[fixture: gantt/db-acc-descr-then-empty-block]

**既定値。**
文がなければ、Db は次の値を持ちます。
`dateFormat`、`axisFormat`、`todayMarker`、タイトル、`accTitle`、
`accDescr` は空のテキスト、`includes` と `excludes` はトークンなし、
`inclusiveEndDates` は `false`、`weekday` は `sunday`、`weekend` は `saturday`、
section もタスクもリンクもなく、
欄 `tickInterval` も欄 `clickCalls` もありません。 [fixture: gantt/header-only]

**設定。**
設定の文は、Db の値を 1 つ決めます。

- `dateFormat`、`axisFormat`、`tickInterval`、`todayMarker` は、
  その種類の最後の文の値のテキストで、書かれたとおり、両端の空白を含みます。
  欄 `tickInterval` があるのは、 `tickInterval` の文があるときだけです。
  [fixture: gantt/db-date-format] [fixture: gantt/db-date-format-last-wins]
  [fixture: gantt/db-axis-format] [fixture: gantt/db-axis-format-last-wins]
  [fixture: gantt/db-tick-interval] [fixture: gantt/db-tick-interval-last-wins]
  [fixture: gantt/db-today-marker] [fixture: gantt/db-today-marker-off]
  [fixture: gantt/db-today-marker-last-wins]
  [fixture: gantt/lex-todaymarker-hash]
- `includes` と `excludes` は、その種類の文のトークンを、小文字にして、
  それぞれ一度だけ、全文を通した最初の位置の順に並べたものです。
  項目のない文は何も加えません。
  トークンは、文の項目を小文字にしたものです。
  大文字小文字の変換は、項目ごとにではなく、
  最初の項目から最後の項目までのリストのテキスト全体に対して行います。
  ギリシャ文字の大文字シグマの小文字は、まわりの文字で決まるからです。
  語の終わりでは語末のシグマになり、2 つの項目の間にある U+FEFF は、
  書式文字なので、シグマにとって語を終えません。
  [fixture: gantt/db-includes-tokens] [fixture: gantt/db-excludes-tokens]
  [fixture: gantt/db-excludes-merged-lines]
  [fixture: gantt/db-excludes-duplicates]
  [fixture: gantt/lex-excludes-upper-case-items]
  [fixture: gantt/lex-excludes-commas-and-spaces]
  [fixture: gantt/lex-excludes-empty-items]
  [fixture: gantt/lex-excludes-whitespace-value]
  [fixture: gantt/db-includes-final-sigma]
  [fixture: gantt/db-includes-sigma-before-bom]
  [fixture: gantt/db-includes-sigma-after-bom]
  [fixture: gantt/db-excludes-final-sigma]
- `inclusiveEndDates` は、
  `inclusiveEndDates` の文を実行すると `true` になります。
  [fixture: gantt/db-inclusive-end-dates]
- `weekday` と `weekend` は、その種類の最後の文の `day` で、
  テキストでの大文字小文字によらず小文字です。
  [fixture: gantt/db-weekday-last-wins] [fixture: gantt/lex-day-mixed-case]
  [fixture: gantt/db-weekend-friday] [fixture: gantt/db-weekend-saturday]
  [fixture: gantt/lex-weekend-upper-case]

**タイトルと section。**
タイトルはフロントマターのもので、`title` の文があれば、
その文の値のテキスト（書かれたとおり、両端の空白を含む）で置き換えられ、
その後は最後のものが勝ちます。
タイトルには文字の置き換え（下を参照）をします。
`section` の文は、名前のテキストを書かれたとおりに `sections` の後ろに加えます。
繰り返しても同じです。 [fixture: gantt/db-title-frontmatter]
[fixture: gantt/db-title-statement]
[fixture: gantt/db-title-statement-after-frontmatter]
[fixture: gantt/lex-title-twice] [fixture: gantt/db-sections]
[fixture: gantt/lex-section-twice]

**タスク。**
タスクの文は、タスクを 1 つ、タスクの列の後ろに加えます。
次の値は、その文と、それより前のタスクと section から決まります。

- `task` は説明のテキストで、書かれたとおりです。
  `section` は、タスクより前の最後の `section` の文の名前で、
  書かれたとおりです。
  なければ空のテキストです。
  `classes` は空で始まります。 [fixture: gantt/db-task-description-spaces]
  [fixture: gantt/lex-task-text-quotes] [fixture: gantt/db-task-before-section]
  [fixture: gantt/db-task-id-written] [fixture: gantt/db-task-section-latest]
- 文のタグは、フラグ `active`、`done`、`crit`、`milestone`、`vert` を立てます。
  タスクは、タグが立てたフラグの欄を、値 `true` で持ちます。
  タグが繰り返されても一度で、立たなかったフラグの欄はありません。
  タグでない項目は、フラグを立てません。
  `CRIT` や、ほかの項目の後ろの `done` がそうです。
  [fixture: gantt/gram-task-active] [fixture: gantt/gram-task-tag-then-item]
  [fixture: gantt/gram-task-crit] [fixture: gantt/gram-task-milestone]
  [fixture: gantt/gram-task-vert] [fixture: gantt/db-task-tags]
  [fixture: gantt/db-task-tag-repeated] [fixture: gantt/gram-task-two-tags]
  [fixture: gantt/db-task-tag-case] [fixture: gantt/gram-task-tag-after-item]
  [fixture: gantt/gram-task]
- それ以外の項目が何を与えるかは、その数で決まります。
  項目が 1 つなら、それが終わりです。
  `raw.endTime` は項目のテキストを持つ `{ data }` で、 `raw.startTime` は、
  直前のタスクの `id` を持つ `{ type: "prevTaskEnd", id }` です。
  タスクが最初の場合や、直前のタスクに id がない場合は、`id` はありません。
  項目が 2 つなら、始まりと終わりです。
  `raw.startTime` は、
  最初の項目を持つ `{ type: "getStartDate", startData }` で、 `raw.endTime` は、
  2 つ目の項目を持つ `{ data }` です。
  項目が 3 つなら、id、始まり、終わりです。
  id は最初の項目で、空でも、空白を含んでもかまいません。
  項目は書かれたとおりのテキストなので、`after id1 id2` や `until id1` も、
  ほかの項目と同じ項目です。
  項目が 4 つ以上なら、読みません。
  タスクは `id` を持たず、 `raw` は `startTime` も `endTime` も持ちません。
  [fixture: gantt/gram-task-one-item] [fixture: gantt/db-task-forms]
  [fixture: gantt/db-task-id-numbered]
  [fixture: gantt/db-task-one-item-after-four-items]
  [fixture: gantt/db-task-one-item-after-empty-id]
  [fixture: gantt/gram-task-two-items] [fixture: gantt/gram-task-three-items]
  [fixture: gantt/gram-task-id-with-spaces]
  [fixture: gantt/gram-task-empty-item-first]
  [fixture: gantt/gram-task-after-ids] [fixture: gantt/gram-task-until]
  [fixture: gantt/gram-task-four-items] [fixture: gantt/db-task-four-items]
  [fixture: gantt/gram-task-four-tags-then-items]
- 項目が 1 つか 2 つのタスクの `id` は `task1`、`task2`、…で、
  この方法で id を与えられたタスクの中で、ソースの順に 1 から数えます。
  そのため、項目が 3 つのタスクは書かれた id を持って番号を取らず、
  項目が 4 つ以上のタスクも番号を取りません。
  [fixture: gantt/gram-task-numbered-ids] [fixture: gantt/db-task-id-numbered]
  [fixture: gantt/db-task-four-items-no-number]
- `order` は、それより前のタスクのうち order を持つものの数で、0 から数えます。
  フラグ `vert` のタスクの order は -1 で、数えません。
  [fixture: gantt/db-task-vert] [fixture: gantt/docs-syntax-gantt-9bf761ee]
  [fixture: gantt/db-task-forms]

**click の文。**
click の文は、id でタスクを参照し、呼び出し部分があればそれを、
リンク部分があればそれを実行します。
2 つの部分の効果は、テキストでの順によりません。
[fixture: gantt/db-click-call-then-href]
[fixture: gantt/db-click-href-then-call]

- id はそのテキストで、null の id は空のテキストです。
  各 id は**その id のタスク**を見つけます。
  これは、文より前に読んだタスクのうち、その id を持つ最後のものです。
  id は、書かれたものでも番号でもかまいません。
  文より前に読んだタスクにない id は、何も見つけません。
  あとに来るタスクの id も同じです。
  id `__proto__` も、タスクがそれを持っていても、何も見つけません。
  項目が 4 つ以上で id を持たないタスクは、id `undefined` のタスクで、
  その id を持つタスクと同じです。
  両方があれば、あとのものが見つかります。
  空のテキストも id です。
  リストの空の id は、id が空のタスクを見つけ、なければ何も見つけません。
  [fixture: gantt/db-click-before-task] [fixture: gantt/db-click-unknown-id]
  [fixture: gantt/gram-click-unknown-id] [fixture: gantt/db-task-duplicate-id]
  [fixture: gantt/gram-task-duplicate-id-click]
  [fixture: gantt/db-click-between-duplicate-ids]
  [fixture: gantt/spec-gantt-ea3e239d] [fixture: gantt/db-click-task-without-id]
  [fixture: gantt/db-click-task-without-id-and-id-undefined]
  [fixture: gantt/db-click-empty-id] [fixture: gantt/gram-click-ids-two-commas]
- 各部分は、リストの各 id のタスクにクラス `clickable` を与えます。
  これは id が書かれた回数だけ与えます。
  そのため、両方の部分がある文は 2 回与え、
  別の文が同じタスクを参照すればさらに加えます。 [fixture: gantt/db-click-href]
  [fixture: gantt/db-click-call] [fixture: gantt/db-click-call-then-href]
  [fixture: gantt/db-click-href-then-call] [fixture: gantt/db-click-ids-list]
  [fixture: gantt/db-click-id-repeated]
  [fixture: gantt/gram-click-two-statements-same-id]
  [fixture: gantt/db-click-links-order]
- リンク部分は、タスクを見つけた各 id について、そのタスクのリンクを設定します。
  `id` は書かれたとおりの id で、`url` は URL のテキストで、書かれたとおりです。
  リンクのある id のリンクは置き換えられ、位置は保ちます。
  そのため `links` は、各 id のリンクが最初に設定された順に並び、
  URL は最後のものです。 [fixture: gantt/db-click-href]
  [fixture: gantt/db-click-links-order]
  [fixture: gantt/gram-click-href-replaced] [fixture: gantt/db-click-ids-list]
  [fixture: gantt/db-click-between-duplicate-ids]
- 呼び出し部分は、id がタスクを見つけたかどうかによらず、文の順に、
  click の呼び出しを `clickCalls` に加えます。
  `id` は `ids` のテキストを `,` でつないだもので、空の id も含みます。
  `name` はコールバック名のテキストで、書かれたとおりです。
  `args` はコールバック引数のテキストで、書かれたとおりです。
  引数がないときや、括弧の間が空白だけのときは `null` です。
  欄 `clickCalls` があるのは、呼び出しがあるときだけです。
  [fixture: gantt/db-click-call] [fixture: gantt/db-click-call-args]
  [fixture: gantt/db-click-unknown-id] [fixture: gantt/db-click-ids-list]
  [fixture: gantt/db-click-call-ids-empty-id]
  [fixture: gantt/gram-click-call-blank-arguments]
  [fixture: gantt/gram-click-call-name-space-before-parenthesis]
  [fixture: gantt/gram-click-call-arguments-line-feed]
  [fixture: gantt/gram-click-call-then-href]
  [fixture: gantt/config-security-level-loose-click-call]
  [fixture: gantt/config-security-level-antiscript-click-call]
- URL は、どの `securityLevel` でも書かれたとおりのテキストです。
  [fixture: gantt/config-security-level-strict-click-href]
  [fixture: gantt/config-security-level-sandbox-click-href]

**アクセシビリティ。**
`accTitle` は最後の `accTitle` の文のテキストに文字の置き換えをしたもので、
なければ空のテキストです。
`accDescr` は、最後の `accDescr` の文か、
テキストのある description ブロックのテキストです。
各改行は、その後ろの空白（改行も含む）とともに 1 つの改行に置き換え、
そのあと文字の置き換えをします。
テキストのない description ブロックは何も変えません。
テキストは後の行から始まってもかまいません。
`accTitle:` の次の行が `A` なら、タイトルは `A` です。
[fixture: gantt/gram-acc-title] [fixture: gantt/db-acc-title]
[fixture: gantt/db-acc-title-twice]
[fixture: gantt/gram-acc-title-line-feed-then-text]
[fixture: gantt/gram-acc-title-blank-lines-then-text]
[fixture: gantt/gram-acc-descr] [fixture: gantt/db-acc-descr]
[fixture: gantt/db-acc-descr-block]
[fixture: gantt/gram-acc-descr-block-multiline]
[fixture: gantt/db-acc-descr-block-blank-line]
[fixture: gantt/gram-acc-descr-twice]
[fixture: gantt/db-acc-descr-block-then-line]
[fixture: gantt/db-acc-descr-then-empty-block]

**要約。**
要約は [db-summaries.ja.md](../db-summaries.ja.md#gantt) の欄を持ちます。
上の値、文の順に並べた section の名前の `sections`、ソースの順の `tasks`、
`links`、`clickCalls` です。
タスクは `section`、`raw`、`task`、`classes`、 `id`（なければなし）、
立っているフラグ、`order` を持ちます。

## 文字の置き換え

Db が `sanitizeText` に通すテキストは 3 つで、タイトル、`accTitle`、
`accDescr` です。
`ganttDbOf()` は、
[db-from-tree.ja.md](../db-from-tree.ja.md#文字の置き換え)の置き換え
`textReplacementOf(embedded.config)` を、これらのテキストにだけ適用します。
説明、section、項目、設定の値、トークン、id、URL、コールバックは、
書かれたとおりです。
タイトルは、フロントマターのものでも `title` の文のものでも置き換えます。
`accDescr` は、行をつないだあとで置き換えます。
[fixture: gantt/config-security-level-other-title]
[fixture: gantt/config-security-level-other-diagram-title]
[fixture: gantt/config-security-level-other-acc-title]
[fixture: gantt/config-security-level-other-acc-descr]
[fixture: gantt/config-security-level-other-acc-descr-block]
[fixture: gantt/config-security-level-other-html-labels-false]
[fixture: gantt/config-security-level-other-names-as-written]
[fixture: gantt/config-security-level-other-settings-as-written]
[fixture: gantt/config-security-level-other-task-data-as-written]
[fixture: gantt/config-security-level-other-click-as-written]

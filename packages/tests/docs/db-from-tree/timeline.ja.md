# 木から timeline の Db を作る

English version: [timeline.md](./timeline.md)

timeline 図の Db の要約を、その木から作る手順です。
`src/db-from-tree/timeline.ts` が実装します
（[db-from-tree.md](../db-from-tree.ja.md) を参照）。
構文と木は、仕様の
[diagrams/timeline.md](../../../spec/docs/diagrams/timeline.ja.md) と
[ast/timeline.md](../../../spec/docs/ast/timeline.ja.md) が定めます。
要約の欄は [db-summaries.md](../db-summaries.ja.md#timeline) にあります。

mermaid.js は、構文解析しながら Db を作ります。
文法は、文が終わるたびに、その文のために Db のメソッドを呼びます
（[`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L71-L85)）。
Db は、メソッドに渡されたものを持ちます
（[`setDirection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L21-L23)、[`addSection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L29-L32)、
[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L52-L63)、[`addEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L65-L70)、
[`setDiagramTitle`、`setAccTitle`、`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)）。
要約も同じに作ります。
文をソースの順に実行し、Db が持つ一覧が要約です。
値は、空白も含めて、Db が持つとおりに保ちます。
要約はタスクの一覧を 1 度だけ読むので
（[db-summaries.md](../db-summaries.ja.md#timeline) を参照）、
木の period 1 つが、要約のタスク 1 つです。

## 木から要約を作る

**変換した形。**
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティは、period でも、ほかのどのテキストでも、プレースホルダです。
`a#35; b : c#35; d` は、period が `a`、プレースホルダ、`b` で、
event が `c`、プレースホルダ、` d` のタスクです。
title、section の名前、アクセシビリティのテキストでも同じです。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として読みます。
これは説明ブロックの中と、`title` の後ろの空白文字でのことです。
各属性の引用符は `'` として読みます。
これは title と period の中でのことです。
[fixture: timeline/db-event-entity]
[fixture: timeline/db-event-entity-named]
[fixture: timeline/db-title-entity]
[fixture: timeline/db-section-entity]
[fixture: timeline/db-acc-title-entity]
[fixture: timeline/db-acc-descr-entity]
[fixture: timeline/db-acc-descr-block-entity]
[fixture: timeline/db-crlf-line-ends]
[fixture: timeline/db-lone-cr-line-ends]
[fixture: timeline/lex-title-separator-carriage-return]
[fixture: timeline/lex-html-tag-in-title]
[fixture: timeline/lex-html-tag-in-period]

**テキスト。**
木の葉のノードのテキストは、次のように読みます。

- TimelineLiteral は、その範囲の変換した形を持ちます。
  `value` は書かれたテキストで、木が持ちます。
  Db は、mermaid.js が読むとおりのテキストを持ちます。
- テキストの単位の中のディレクティブは、変換した形にも、テキストにもありません。
  `a%%{init: {}}%%b` は period `ab` で、
  `title a %%{init: {}}%% b` の title は `a`、空白 2 つ、`b` です。
  説明ブロックの中のコメント行も同じです。
  [fixture: timeline/db-period-directive-glued]
  [fixture: timeline/lex-directive-in-event]
  [fixture: timeline/db-title-directive]
  [fixture: timeline/db-section-directive]
  [fixture: timeline/db-acc-title-directive]
  [fixture: timeline/lex-directive-in-acc-descr]
  [fixture: timeline/db-acc-descr-block-directive]
  [fixture: timeline/db-event-directive]
  [fixture: timeline/db-acc-descr-block-percent-line]
- 行の規則が無視する `;` も、テキストの中では変換した形にありません。
  period、event、title、アクセシビリティのテキストは、
  それを除いたテキストを持ちます。
  [fixture: timeline/tokens-ignored-semicolon-in-period]
  [fixture: timeline/lex-title-semicolon-in-style-line]
  [fixture: timeline/lex-acc-title-semicolon-in-style-line]
  [fixture: timeline/lex-acc-descr-semicolon-in-style-line]
  [fixture: timeline/lex-acc-descr-block-semicolon-in-style-line]
  [fixture: timeline/lex-event-semicolon-in-style-line]
  [fixture: timeline/lex-event-semicolon-in-style-line-second-event]
- テキストの両端の空白は、木が持つとおりに残ります。
  period はコロン、`#`、改行の前の空白を持ち、
  event、title、section の名前は両端の空白を持ちます。
  空白だけの名前も同じで、行を終えるディレクティブが続いても同じです。
  [fixture: timeline/db-period-and-event]
  [fixture: timeline/db-comment-hash-after-period]
  [fixture: timeline/db-period-colon-glued-to-period]
  [fixture: timeline/db-period-trailing-spaces]
  [fixture: timeline/db-event-trailing-spaces]
  [fixture: timeline/db-event-leading-spaces]
  [fixture: timeline/db-title-trailing-spaces]
  [fixture: timeline/db-title-two-spaces]
  [fixture: timeline/db-title-only-space]
  [fixture: timeline/db-section-trailing-spaces]
  [fixture: timeline/db-section-only-space]
  [fixture: timeline/lex-no-break-space-around-period-and-event]
  [fixture: timeline/lex-ideographic-space-at-end-of-period]
  [fixture: timeline/lex-directive-at-end-of-period-line]
  [fixture: timeline/lex-directive-at-end-of-title-line]
- アクセシビリティのテキストは、範囲の変換した形から両端の空白を除いたものです。
  mermaid.js が trim するからで、空白の隣にディレクティブがあっても同じです。
  [fixture: timeline/db-acc-title-trailing-spaces]
  [fixture: timeline/db-acc-title-many-spaces]
  [fixture: timeline/lex-directive-after-acc-title-text]

**歩き方。**
本体の文をソースの順に実行し、文は、それがある所で Db を変えます。
period はその前の section を、event の文はその前の period を参照します
（**period と event** を参照）。
テキストのない説明ブロック、つまり TimelineAccDescrBlockStatement は、
何も変えません。
その周りの文は、それがないものとして実行するので、その前の説明は残ります。
[fixture: timeline/gram-empty-description-block-keeps-description]
[fixture: timeline/db-acc-descr-block-then-empty-block]
[fixture: timeline/db-acc-descr-line-then-empty-braces]
[fixture: timeline/db-acc-descr-block-empty]
[fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/gram-empty-description-block-after-header]
[fixture: timeline/gram-empty-description-block-in-title]
[fixture: timeline/gram-empty-description-block-in-period]
[fixture: timeline/gram-empty-description-block-in-section]
[fixture: timeline/gram-empty-description-block-in-event]
[fixture: timeline/gram-empty-description-blocks-then-period]

**既定。**
文がなければ、Db は、direction が `LR` で、
title、`accTitle`、`accDescr` が空のテキストで、
section とタスクはありません。
フロントマターのタイトルは、図のタイトルではありません。
timeline の Db にはそれを受け取るメソッドがないので、
木が持たないフロントマターは読みません。
[fixture: timeline/db-header-only]
[fixture: timeline/db-title-frontmatter]
[fixture: timeline/db-title-frontmatter-and-statement]

**direction。**
ヘッダーに direction がなければ `LR` です。
あれば、書かれたとおりの direction を大文字にしたものです。
`td` は `TD`、`Lr` は `LR` です。
[fixture: timeline/db-direction-lr]
[fixture: timeline/db-direction-td]
[fixture: timeline/db-direction-lower-case]
[fixture: timeline/db-direction-mixed-case]
[fixture: timeline/header-direction-twice]

**title と section。**
title は、最後の `title` の文の値のテキストです。
書かれたとおりで、両端の空白も含み、文字の置き換えを受けます（下を参照）。
最初の `title` の前に title はありません。
`section` の文は、名前のテキストを、書かれたとおりに `sections` に加えます。
繰り返されても加えます。
[fixture: timeline/db-title-statement]
[fixture: timeline/db-title-twice]
[fixture: timeline/db-section-statement]
[fixture: timeline/db-section-twice-same-name]

**period と event。**
period の文は、タスクを 1 つ加えます。
`section`、`task`、`events` を持ちます。

- `task` は period のテキストで、書かれたとおりです。
  `section` は、その period の前の最後の `section` の文の名前で、
  書かれたとおりです。なければ空のテキストです。
  [fixture: timeline/db-section-two-with-tasks]
  [fixture: timeline/db-section-after-tasks]
  [fixture: timeline/db-section-then-title]
- `events` は、文の event のテキストをソースの順に並べたものです。
  event がなければ空です。
  [fixture: timeline/db-period-and-event]
  [fixture: timeline/db-period-only]
  [fixture: timeline/db-event-two-on-a-line]
  [fixture: timeline/db-event-own-line]
  [fixture: timeline/db-event-own-line-two-tasks]
  [fixture: timeline/db-event-own-line-after-event]
- event の文は、その event を、最後のタスクに加えます。
  そのタスクと event の文の間にどんな文があっても同じです。
  title、section、アクセシビリティのテキスト、空の説明ブロックです。
  タスクは自分の `section` を保つので、
  section の文の後ろに書いた event は、その前の section の中にあります。
  どの period よりも前にある event の文は、木にありません。
  そういう入力は拒否されます。
  [fixture: timeline/db-event-after-section-joins-earlier-task]
  [fixture: timeline/db-section-with-event-after-task]
  [fixture: timeline/db-event-own-line-after-title]
  [fixture: timeline/db-event-own-line-after-acc-title]
  [fixture: timeline/db-event-own-line-after-acc-descr-block]
  [fixture: timeline/gram-event-after-empty-description-block]
  [fixture: timeline/gram-event-after-empty-description-block-same-line]
  [fixture: timeline/gram-event-first]

**アクセシビリティ。**
`accTitle` は、最後の `accTitle` の文のテキストに、文字の置き換えをしたもの、
なければ空のテキストです。
`accDescr` は、最後の `accDescr` の文か、
テキストのある説明ブロックのテキストで、
各改行を、その後ろの空白（改行も含む）とともに 1 つの改行に置き換え、
それから文字の置き換えをしたものです。
改行の前の空白は残り、後ろの空白は、どの種類でも
（タブ、ノーブレークスペース、U+3000、U+2028、U+FEFF）除かれます。
テキストのない説明ブロックは何も変えません（**歩き方**を参照）。
テキストは後ろの行から始められます。
`accTitle:` の次の行が `A` なら、タイトルは `A` です。
[fixture: timeline/db-acc-title-statement]
[fixture: timeline/db-acc-title-twice]
[fixture: timeline/lex-acc-title-value-on-next-line]
[fixture: timeline/db-acc-descr-statement]
[fixture: timeline/db-acc-descr-line-then-block]
[fixture: timeline/db-acc-descr-block-then-line]
[fixture: timeline/db-acc-descr-block]
[fixture: timeline/db-acc-descr-block-blank-line]
[fixture: timeline/db-acc-descr-block-spaces-before-line-feed]
[fixture: timeline/db-acc-descr-block-tab-before-line-feed]
[fixture: timeline/db-acc-descr-block-no-break-space-before-line-feed]
[fixture: timeline/db-acc-descr-block-ideographic-space-before-line-feed]
[fixture: timeline/db-acc-descr-block-tab-after-line-feed]
[fixture: timeline/db-acc-descr-block-no-break-space-after-line-feed]
[fixture: timeline/db-acc-descr-block-ideographic-space-after-line-feed]
[fixture: timeline/db-acc-descr-block-line-separator-after-line-feed]
[fixture: timeline/db-acc-descr-block-byte-order-mark-after-line-feed]

**要約。**
要約は、[db-summaries.md](../db-summaries.ja.md#timeline) の欄を持ちます。
上の値、文の順に並べた section の名前の `sections`、ソースの順の `tasks` です。

## 文字の置き換え

Db は、title、`accTitle`、`accDescr` の 3 つのテキストを
`sanitizeText` に通します。
`timelineDbOf()` は、
[db-from-tree.md](../db-from-tree.ja.md#文字の置き換え) の置き換え
`textReplacementOf(embedded.config)` を、この 3 つにだけ使います。
period、event、section の名前は、書かれたとおりです。
`accDescr` は、行をつないだ後に置き換え、ブロックも行と同じに置き換えます。
[fixture: timeline/config-security-level-other-title-and-accessibility]
[fixture: timeline/config-security-level-other-accessibility-block]
[fixture: timeline/config-security-level-other-html-labels-false]
[fixture: timeline/config-security-level-other-flowchart-html-labels-false]
[fixture: timeline/config-security-level-other-sections-periods-events]

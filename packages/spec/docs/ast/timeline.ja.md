# Timeline のノード

英語版: [timeline.md](./timeline.md)

この文書は、図種 `timeline` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、ソースの読み方と、
どの文法の規則がどのノードを作るかは
[diagrams/timeline.ja.md](../diagrams/timeline.ja.md) で定めます。

この図種の本体は [TimelineDiagram](#timelinediagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
値が空白で始まったり終わったりするのは、mermaid.js が読むとおり、
その単位が空白を自分の文字として持つところだけです。
[ノード](../ast.ja.md#ノード) を参照してください。
この図種では、コロン、`#`、改行の前の空白を保つ period と、
両端の空白を保つ event、タイトル、section の名前です。
アクセシビリティのテキストは両端の空白なしで読まれます。

**period** は、年のような timeline の 1 点で、
そのために書かれた **event** を持ちます。
**section** は、その後の period をまとめます。

この図種には引用符の文字列がないので、
どのノードも StringLiteral ではありません。
period や event の中の `"` はテキストの文字です。 [fixture:
timeline/db-event-quotes-and-brackets]

## ノード

### TimelineDiagram

| 欄          | 型                         | 意味                                                                             |
| ----------- | -------------------------- | -------------------------------------------------------------------------------- |
| `direction` | string か null             | 書かれたとおりのヘッダーの方向。大文字小文字を問わず `LR` か `TD`。または null。 |
| `body`      | TimelineStatement のリスト | 文。ソースの順。                                                                 |

子の欄: `body`。
ヘッダーのキーワードは欄ではありません。
方向は、ヘッダーの行で `timeline` と空白文字かタブの後にあるキーワードを、
空白なしで書かれたとおりに持ちます。
`timeline td` は方向 `td` を持ちます。
方向がないとき、方向は null です。 [fixture: timeline/db-direction-td]
[fixture: timeline/db-direction-lower-case] [fixture: timeline/db-header-only]

**TimelineStatement** は、TimelinePeriodStatement、TimelineEventStatement、
TimelineTitleStatement、TimelineSectionStatement、TimelineAccTitleStatement、
TimelineAccDescrStatement、TimelineAccDescrBlockStatement のどれかです。

改行はどの文にも属さず、空行はノードを作りません。
いくつかの文が 1 つの行を分け合うことも、1 つの文が行をまたぐこともあります。
以下のどのノードの子の欄もソースの順です。

### TimelinePeriodStatement

period と、その後に続く event です。
`2004 : Facebook : Google` や、次の行に `: Google` を書いた同じものです。

| 欄       | 型                       | 意味                                                  |
| -------- | ------------------------ | ----------------------------------------------------- |
| `period` | TimelineLiteral          | 書かれたとおりの period。                             |
| `events` | TimelineLiteral のリスト | period のすぐ後の event。ソースの順。空のこともある。 |

子の欄: `period`、`events`。
period の event は、間に空白、改行、コメントしかなく、
その period の後に続く event です。
`a : e1 : e2` のように period の行にあるものと、
`a` の後に行 `: e1` と `: e2` が続くように、その後の行にあるものです。
空行、コメント行、行 `# c` の後でもそうです。
ほかの文の後の event は [TimelineEventStatement](#timelineeventstatement) です。
[fixture:
timeline/db-event-two-on-a-line] [fixture: timeline/db-event-own-line] [fixture:
timeline/db-event-own-line-after-event] [fixture:
timeline/db-event-own-line-after-blank-line] [fixture:
timeline/db-event-own-line-after-comment-line] [fixture:
timeline/db-event-own-line-after-hash-line] [fixture: timeline/db-everything]

period は、それを終えるコロン、`#`、改行の前の空白を保ちます。
`a : e` は period `a ` を、`a: e` は period `a` を持ちます。
event は、そのコロンと空白文字 1 つ（改行でもよい）の後のテキストで、
両端の残りの空白を保ちます。
空白だけでもよく、空白が続かない `:` を持てます。
`a :   e` は event `  e` を、 `a :` と空白文字 2 つは空白文字 1 つの event を、
`a : b:c` は event `b:c` を持ちます。 [fixture: timeline/db-period-and-event]
[fixture:
timeline/db-period-colon-glued-to-period] [fixture:
timeline/db-event-leading-spaces] [fixture: timeline/db-event-two-spaces]
[fixture: timeline/db-event-colon-glued-inside] [fixture:
timeline/db-event-line-feed-after-colon]

### TimelineEventStatement

period ではない文の後の event です。
タイトル、section、アクセシビリティの文、空の説明ブロックの後です。

| 欄       | 型                       | 意味                                 |
| -------- | ------------------------ | ------------------------------------ |
| `events` | TimelineLiteral のリスト | event。ソースの順。少なくとも 1 つ。 |

子の欄: `events`。
その event は、TimelinePeriodStatement と同じく、間に空白、改行、
コメントしかなく互いに続く event です。
その event は period の文に続かないので、それだけで 1 つの文になります。
3 行の `a`、`section S`、`: e` では `: e` が event の文で、
`section S : x` の `: x` も同じです。
mermaid.js がそれをどの period に与えるかは、tests パッケージの要約にあります。
[文法の外の拒否](../diagrams/timeline.ja.md#文法の外の拒否) にあるとおり、
最初の period より前の event の文は、入力を拒否させます。
[fixture: timeline/db-event-after-section-joins-earlier-task]
[fixture: timeline/db-section-with-event-after-task]
[fixture: timeline/db-event-own-line-after-title]
[fixture: timeline/db-event-own-line-after-acc-title]
[fixture: timeline/db-event-own-line-after-acc-descr-block]
[fixture: timeline/gram-event-after-empty-description-block]
[fixture: timeline/gram-event-first]

### TimelineTitleStatement

`title` の文です。

| 欄      | 型              | 意味                                                |
| ------- | --------------- | --------------------------------------------------- |
| `value` | TimelineLiteral | `title` と空白文字 1 つの後の、改行までのテキスト。 |

子の欄: `value`。
値は両端の空白を保ち、`:`、`#`、 `%%` を文字として持ちます。
[fixture: timeline/db-title-statement] [fixture:
timeline/db-title-two-spaces] [fixture: timeline/db-title-trailing-spaces]
[fixture: timeline/db-title-colon] [fixture: timeline/db-title-hash] [fixture:
timeline/db-title-percent]

### TimelineSectionStatement

`section` の文です。

| 欄     | 型              | 意味                                                        |
| ------ | --------------- | ----------------------------------------------------------- |
| `name` | TimelineLiteral | `section` と空白文字 1 つの後の、`:` か改行までのテキスト。 |

子の欄: `name`。
名前は空白を含みうるテキストで、何もそれを参照しないので TimelineLiteral です。
両端の空白を保ち、空白だけの名前はその空白の値です。
[fixture: timeline/db-section-statement]
[fixture: timeline/db-section-two-spaces] [fixture:
timeline/db-section-trailing-spaces] [fixture: timeline/db-section-only-space]
[fixture: timeline/db-section-two-with-tasks]

### TimelineAccTitleStatement

テキストを持つ `accTitle:` の文です。

| 欄      | 型              | 意味                                               |
| ------- | --------------- | -------------------------------------------------- |
| `value` | TimelineLiteral | `accTitle:` の後の、その行の終わりまでのテキスト。 |

子の欄: `value`。
`:` の後の空白は改行を含めてそれとともに読まれるので、
テキストはテキストのある最初の行から始まり、値は null になりません。
後ろに何もない `accTitle:` は拒否されます。
値は両端の空白を除いたテキストです。 [fixture: timeline/db-acc-title-statement]
[fixture: timeline/lex-acc-title-value-on-next-line] [fixture:
timeline/gram-acc-title-empty] [fixture: timeline/db-acc-title-trailing-spaces]

### TimelineAccDescrStatement

テキストを持つ `accDescr:` の文です。

| 欄      | 型              | 意味                                               |
| ------- | --------------- | -------------------------------------------------- |
| `value` | TimelineLiteral | `accDescr:` の後の、その行の終わりまでのテキスト。 |

子の欄: `value`。
TimelineAccTitleStatement と同じく、値は null になりません。
[fixture: timeline/db-acc-descr-statement] [fixture:
timeline/gram-acc-descr-empty]

### TimelineAccDescrBlockStatement

テキストを持つ `accDescr { … }` の文、またはテキストのない文、
つまり何も変えない空の説明ブロックです。
ブロックは常に閉じています。
テキストはその中で終われません。

| 欄      | 型                      | 意味                                                                                                                |
| ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `value` | TimelineLiteral か null | `accDescr {` と `}` の間のテキスト。両端の空白を除く。その間に空白、ディレクティブ、コメント行しかないときは null。 |

子の欄: `value`。
`accDescr {}`、空白と改行だけのブロック、
ディレクティブかコメント行だけのブロックは値 null を持ち、何も変えません。
その前に書いた説明は残ります。
[fixture: timeline/gram-empty-description-block-directive-only]
[fixture: timeline/gram-empty-description-block-comment-line-only]
[fixture: timeline/gram-empty-description-block-keeps-description] [fixture:
timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/db-acc-descr-block-empty] [fixture:
timeline/gram-acc-descr-block-unclosed]

### TimelineLiteral

空白を含みうる引用符なしのテキストです。
period、event、タイトル、section の名前、アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                           |
| ------- | ------ | -------------------------------------------------------------- |
| `value` | string | その書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
TimelineLiteral はどれも 1 つの単位なので、
その値はその単位の書かれたテキストです。
period はそれを終えるものの前の空白を保ち、 event、タイトル、
section の名前は両端の空白を保ち、アクセシビリティのテキストは、
mermaid.js が取り除く両端の空白なしで読まれます。
説明ブロックの中の改行は値の一部です。 [fixture:
timeline/db-period-trailing-spaces] [fixture: timeline/db-event-trailing-spaces]
[fixture: timeline/db-title-trailing-spaces] [fixture:
timeline/db-section-trailing-spaces] [fixture:
timeline/db-acc-title-trailing-spaces] [fixture: timeline/db-acc-descr-block]

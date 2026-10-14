# Journey のノード

英語版: [journey.md](./journey.md)

この文書は、図種 `journey` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、
ソースの読み方と、どの文法の規則がどのノードを作るかは
[diagrams/journey.ja.md](../diagrams/journey.ja.md) で定めます。

この図種の本体は [JourneyDiagram](#journeydiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
値が空白で始まったり終わったりするのは、
mermaid.js が読むとおりに、その単位が空白を自分の文字として持つところだけです
（[ノード](../ast.ja.md#ノード) を参照）。
この図種では、コロンの前の空白を保つタスクの説明と、
両端の空白を保つタイトルと section の名前がそうです。
それ以外では、値の両端の空白は値の外です。

**タスク**はジャーニーの 1 つの段階で、説明、スコア、
それに加わる人を持ちます。
**section** はその後のタスクをまとめます。

## ノード

### JourneyDiagram

| 欄     | 型                        | 意味                 |
| ------ | ------------------------- | -------------------- |
| `body` | JourneyStatement のリスト | 文。ソースの順です。 |

子の欄: `body`。ヘッダーのキーワードは欄ではありません。

**JourneyStatement** は、JourneyTaskStatement、JourneyTitleStatement、
JourneySectionStatement、JourneyAccTitleStatement、
JourneyAccDescrStatement、JourneyAccDescrBlockStatement のいずれかです。

改行はどの文にも属さず、空行はノードを作りません。
以下のどのノードの子の欄もソースの順です。

### JourneyTaskStatement

タスク。説明、コロン、データです。`Make tea: 5: Me, Cat` など。

| 欄            | 型                                 | 意味                                                                                 |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| `description` | JourneyLiteral                     | コロンの前のテキスト。書かれたとおりで、コロンの前の空白を含めます。                 |
| `score`       | JourneyLiteral か null             | データのスコアの部分。両端の空白を除きます。空か空白だけなら null です。             |
| `people`      | （JourneyLiteral か null）のリスト | データの人。ソースの順で、それぞれ両端の空白を除きます。なければ空です。             |
| `textAfter`   | JourneyIgnoredText か null         | データの 3 つ目のコロンからのテキスト。データに 3 つ目のコロンがなければ null です。 |

子の欄: `description`、`score`、`people`、`textAfter`。
データは、説明の後のコロンから、`#`、`;`、行の終わりのどれかまでで、
その中のコロンがデータを部分に分けます
（[タスク](../diagrams/journey.ja.md#タスク) を参照）。
**スコアの部分**は 1 つ目のコロンから 2 つ目のコロンかデータの終わりまで、
**人の部分**は 2 つ目のコロンから 3 つ目のコロンかデータの終わりまでで、
3 つ目のコロンから後のデータは読まれません。
mermaid.js は、スコアの部分が書く数をスコアとして読み、
空白だけのスコアの部分を数 0 として読みます。
数でないスコアも受理されます。
人の部分はコンマで、コンマの数より 1 つ多い人に分かれます。
空か空白だけの人は null の要素で、mermaid.js はそれを空の名前として読みます。
2 つ目のコロンがなければ `people` は空で、
あれば少なくとも 1 つの要素を持ちます。

`A: 5` はスコア `5` を持ち、人を持ちません。
`A: 3: Me, You ,  Them` は人 `Me`、`You`、`Them` を、
`A: 3: a,,b` は人 `a`、null、`b` を持ちます。
`A: 3: ` と `A: 5:` は null の人を 1 つ持ち、`A: : x` はスコアを持ちません。
`A:  3 : x` はスコア `3`、`A: abc: x` はスコア `abc`、
`A: 5, 6: Me` はスコア `5, 6` を持ちます。
`A: 3: a,b: c, d` は人 `a` と `b` と、`textAfter` の `: c, d` を持ち、
`A: 5: Me:` は `textAfter` の `:` を持ちます。
[fixture: journey/db-task-score-only] [fixture:
journey/db-task-people] [fixture: journey/db-task-people-empty-item] [fixture:
journey/db-task-people-blank] [fixture: journey/gram-task-second-colon-at-end]
[fixture: journey/db-task-score-empty] [fixture: journey/db-task-score-spaces]
[fixture: journey/db-task-score-not-a-number] [fixture:
journey/gram-task-score-comma] [fixture: journey/db-task-extra-colon] [fixture:
journey/gram-task-third-colon-at-end]

### JourneyTitleStatement

`title` の文。

| 欄      | 型             | 意味                                                                    |
| ------- | -------------- | ----------------------------------------------------------------------- |
| `value` | JourneyLiteral | `title` と 1 つの空白文字の後の、`#`、`;`、改行のどれかまでのテキスト。 |

子の欄: `value`。
値は両端の空白を保ち、`:` と `%%` を文字として持ちます。
[fixture: journey/db-title-statement] [fixture:
journey/lex-title-two-spaces] [fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-title-colon-inside] [fixture:
journey/lex-title-percent-inside]

### JourneySectionStatement

`section` の文。

| 欄     | 型             | 意味                                                                           |
| ------ | -------------- | ------------------------------------------------------------------------------ |
| `name` | JourneyLiteral | `section` と 1 つの空白文字の後の、`#`、`:`、`;`、改行のどれかまでのテキスト。 |

子の欄: `name`。名前は空白を含みうるテキストで、何も参照しないので
JourneyLiteral です。
両端の空白を保ち、空白だけの名前はその空白の値です。
[fixture: journey/db-sections] [fixture: journey/lex-section-two-spaces]
[fixture: journey/db-section-ends-at-hash] [fixture:
journey/lex-section-whitespace-only]

### JourneyAccTitleStatement

テキスト付きの `accTitle:` の文。

| 欄      | 型             | 意味                                           |
| ------- | -------------- | ---------------------------------------------- |
| `value` | JourneyLiteral | `accTitle:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。`:` の後の空白は改行を含めて一緒に読まれるので、
テキストは最初にテキストのある行から始まり、値は null になりません。
後ろに何もない `accTitle:` は拒否されます。
値は両端の空白を除いたテキストです。
[fixture: journey/db-acc-title] [fixture:
journey/gram-acc-title-line-feed-then-text] [fixture:
journey/lex-acc-title-at-end] [fixture: journey/gram-acc-title-trailing-spaces]

### JourneyAccDescrStatement

テキスト付きの `accDescr:` の文。

| 欄      | 型             | 意味                                           |
| ------- | -------------- | ---------------------------------------------- |
| `value` | JourneyLiteral | `accDescr:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。JourneyAccTitleStatement と同じく、値は null になりません。
[fixture: journey/db-acc-descr] [fixture: journey/lex-acc-descr-at-end]

### JourneyAccDescrBlockStatement

テキスト付きの、またはテキストのない `accDescr { … }` の文。
テキストのないものは空の説明ブロックで、何も変えません。
ブロックは常に閉じています。テキストはその中では終われません。

| 欄      | 型                     | 意味                                                                                 |
| ------- | ---------------------- | ------------------------------------------------------------------------------------ |
| `value` | JourneyLiteral か null | `accDescr {` と `}` の間の、両端の空白を除いたテキスト。間が空白だけなら null です。 |

子の欄: `value`。`accDescr {}`、`accDescr { }`、空行のブロックは
値 null を持ち、何も変えません。
[fixture: journey/db-acc-descr-block] [fixture:
journey/gram-acc-descr-block-empty] [fixture:
journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/lex-acc-descr-block-unclosed]

### JourneyLiteral

空白を含みうる、引用符のないテキスト。
タスクの説明、スコア、人、タイトル、section の名前、
アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                           |
| ------- | ------ | -------------------------------------------------------------- |
| `value` | string | その書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
JourneyLiteral はそれぞれ 1 つの単位なので、
値はその単位のテキストを書かれたとおりにしたものです。
説明はコロンの前の空白を保ち、
タイトルと section の名前は両端の空白を保ちます。
スコアと人は空白を持たず、
アクセシビリティのテキストは、mermaid.js が取り除く両端の空白なしで読まれます。
説明ブロックの中の改行は値の一部です。
[fixture: journey/db-task-description-spaces] [fixture:
journey/lex-title-two-spaces] [fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-task-score-nbsp-trimmed] [fixture:
journey/gram-acc-title-trailing-spaces] [fixture: journey/db-acc-descr-block]

### JourneyIgnoredText

書き手が書き、mermaid.js が読まないテキスト。
この図種では、タスクのデータの 3 つ目のコロンからのテキストです
（[JourneyTaskStatement](#journeytaskstatement) を参照）。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | string | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値は 3 つ目のコロンから始まり、データの終わりまでで、終わりの空白を除きます。
その後のコロンは値の文字です。
空白 2 つが続く `A: 5: Me: x` は値 `: x` を持ちます。
[fixture: journey/db-task-extra-colon] [fixture:
journey/gram-task-third-colon-at-end] [fixture:
journey/gram-task-four-colons] [fixture:
journey/gram-task-ignored-data-trailing-spaces]

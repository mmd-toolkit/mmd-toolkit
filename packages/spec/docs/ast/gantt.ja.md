# Gantt のノード

英語版: [gantt.md](./gantt.md)

この文書は、図種 `gantt` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、
ソースの読み方と、どの文法の規則がどのノードを作るかは
[diagrams/gantt.ja.md](../diagrams/gantt.ja.md) で定めます。

この図種の本体は [GanttDiagram](#ganttdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
値が空白で始まったり終わったりするのは、
mermaid.js が読むとおりに、その単位が空白を自分の文字として持つところだけです
（[ノード](../ast.ja.md#ノード) を参照）。
この図種では、コロンの前の空白を保つタスクの説明、
両端の空白を保つタイトル、section の名前、設定の値、
`(` の前の空白と改行を保つコールバック名がそうです。
それ以外では、値の両端の空白は値の外です。

**タスク**はチャートの棒で、説明と、
いつ始まりいつ終わるかを言うデータを持ちます。
**section** はその後のタスクをまとめ、
**click の文**は id によってタスクにリンクやコールバックを結びます。

## ノード

### GanttDiagram

| 欄     | 型                      | 意味                 |
| ------ | ----------------------- | -------------------- |
| `body` | GanttStatement のリスト | 文。ソースの順です。 |

子の欄: `body`。ヘッダーのキーワードは欄ではありません。

**GanttStatement** は、GanttTaskStatement、GanttClickStatement、
GanttDateFormatStatement、GanttAxisFormatStatement、
GanttTickIntervalStatement、GanttTodayMarkerStatement、
GanttIncludesStatement、GanttExcludesStatement、
GanttInclusiveEndDatesStatement、GanttWeekdayStatement、
GanttWeekendStatement、GanttTitleStatement、GanttSectionStatement、
GanttAccTitleStatement、GanttAccDescrStatement、GanttAccDescrBlockStatement
のいずれかです。

改行はどの文にも属さず、空行はノードを作りません。
以下のどのノードの子の欄もソースの順です。
ただし GanttClickStatement の子の欄は 1 つの順を保ちます
（[ノード](../ast.ja.md#ノード) を参照）。

### GanttTaskStatement

タスク。説明、コロン、コンマで区切った項目のデータです。
`Design :done, des1, 2024-01-06, 2d` など。

| 欄            | 型                               | 意味                                                                                                                    |
| ------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `description` | GanttLiteral                     | コロンの前のテキスト。書かれたとおりで、コロンの前の空白を含めます。                                                    |
| `tags`        | Identifier のリスト              | データの前方のタグ。ソースの順で、それぞれ `active`、`done`、`crit`、`milestone`、`vert` のどれかです。なければ空です。 |
| `items`       | （GanttLiteral か null）のリスト | タグの後の項目。ソースの順で、それぞれ両端の空白を除いたものです。空か空白だけの項目は null です。                      |

子の欄: `description`、`tags`、`items`。
データの項目は、コロン、各コンマ、行の終わりの間の区間で、
コンマより 1 つ多くあります（[タスク](../diagrams/gantt.ja.md#タスク) を参照）。
タグは、残りの最初の項目がその大文字小文字の 5 つの語のどれかであるかぎり
前から取った項目で、残りが `items` です。
`tags` と `items` を合わせるとすべての項目を持つので、
`items` が空になるのはデータがタグだけのときだけで、それは入力を拒否させます
（[文法の外の拒否](../diagrams/gantt.ja.md#文法の外の拒否) を参照）。
タグは 1 つの `data-item` の単位、つまりテキストの単位なので、
その中にディレクティブがあってもよく、
名前はディレクティブを除いた書かれたテキストです。
`do%%{init: {}}%%ne` は mermaid.js と同じくタグ `done` です
（[単位の中のディレクティブ](../diagrams/gantt.ja.md#単位の中のディレクティブ)
を参照）。
[fixture: gantt/gram-task-tag-cut-by-directive]
`a : 1d` は説明 `a ` と 1 つの項目 `1d` を持ち、
`a : done, 1d` はタグ `done` と項目 `1d`、`a : , ,` は 3 つの null の項目、
`a : id1,, 1d` は項目 `id1`、null、`1d`、
`a : my id, after a b, until c` は項目 `my id`、`after a b`、`until c`
を持ちます。
[fixture: gantt/gram-task] [fixture: gantt/gram-task-one-item] [fixture:
gantt/gram-task-tag-then-item] [fixture: gantt/gram-task-two-tags] [fixture:
gantt/gram-task-tag-repeated] [fixture: gantt/gram-task-tags-upper-case]
[fixture: gantt/gram-task-tag-after-item] [fixture:
gantt/gram-task-empty-items] [fixture: gantt/gram-task-empty-middle-item]
[fixture: gantt/gram-task-trailing-comma] [fixture:
gantt/gram-task-four-items] [fixture: gantt/gram-task-id-with-spaces] [fixture:
gantt/gram-task-after-ids] [fixture: gantt/gram-task-until] [fixture:
gantt/lex-task-text-trailing-spaces] [fixture: gantt/gram-task-tags-only]

### GanttClickStatement

`click` の文。タスクの id と、リンク、コールバック、またはその両方です。
`click des1 href "https://example.com"` や
`click des1 call cb(1) href "u"` など。

| 欄     | 型                             | 意味                                                                                                        |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `ids`  | （Identifier か null）のリスト | `click` の後の id。`,` の単位で区切られ、ソースの順です。`id1,` や `,` のように文字のない id は null です。 |
| `call` | GanttCallback か null          | call の部分。ないときは null です。                                                                         |
| `href` | StringLiteral か null          | リンクの部分の URL。二重引用符の文字列です。ないときは null です。                                          |

子の欄: `ids`、`call`、`href`。
`call` と `href` の少なくとも一方は null でありません。
2 つの部分はどちらの順にも書け、子の欄はソースの順によらずこの順を保ちます
（[ノード](../ast.ja.md#ノード) を参照）。
ソースの順が要るツールは範囲で並べ替えます。
id は空白のない名前で、`,` が区切りで、`:` や `"` を含むそれ以外のどの文字も
id の文字なので、[Identifier](../ast.ja.md#identifier) です。
id は解決されません。
どのタスクも名指さない id も書かれたとおりに一覧にあります。
URL は空にならず、常に閉じています
（[href の文脈](../diagrams/gantt.ja.md#href-の文脈) を参照）。
[fixture: gantt/gram-click-href] [fixture: gantt/gram-click-call] [fixture:
gantt/gram-click-href-then-call] [fixture: gantt/gram-click-call-then-href]
[fixture: gantt/gram-click-ids-list] [fixture:
gantt/gram-click-ids-trailing-comma] [fixture: gantt/gram-click-ids-comma-only]
[fixture: gantt/gram-click-ids-two-commas] [fixture: gantt/gram-click-id-colon]
[fixture: gantt/gram-click-id-quotes] [fixture: gantt/gram-click-unknown-id]
[fixture: gantt/gram-click-href-line-feed-inside]

### GanttCallback

click の文の call の部分。コールバック名とその引数です。

| 欄     | 型                   | 意味                                                                                           |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------- |
| `name` | GanttLiteral         | `call` の後の空白と `(` の間のテキスト。書かれたとおりで、終わりの空白と改行を含めます。       |
| `args` | GanttLiteral か null | 括弧の間のテキスト。書かれたとおりで、両端の空白を含めます。括弧の間が空白だけなら null です。 |

子の欄: `name`、`args`。
`call f()` は名前 `f` と null の引数、`call f ()` は名前 `f` と空白、
`call f( )` は null の引数、`call f( 1)` は空白と `1` の引数、
`call f(a, "b,c")` は引数 `a, "b,c"` を持ちます。
mermaid.js はそれをコールバックを結ぶときにだけ分けます。
[fixture: gantt/gram-click-call] [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
gantt/gram-click-call-blank-arguments] [fixture:
gantt/gram-click-call-arguments-leading-space] [fixture:
gantt/gram-click-call-arguments-quoted-comma] [fixture:
gantt/gram-click-call-arguments-line-feed]

### GanttDateFormatStatement

`dateFormat` の文。

| 欄      | 型           | 意味                                                             |
| ------- | ------------ | ---------------------------------------------------------------- |
| `value` | GanttLiteral | `dateFormat` と 1 つの空白文字の後の、行の終わりまでのテキスト。 |

子の欄: `value`。値は両端の空白を保ちます。
`dateFormat`、空白 2 つ、`X` は空白と `X` の値を持ちます。
テキストは `#`、`;`、改行の前で終わります
（[文の文脈](../diagrams/gantt.ja.md#文の文脈) を参照）。
[fixture: gantt/db-date-format] [fixture: gantt/lex-dateformat-two-spaces]
[fixture: gantt/lex-dateformat-trailing-spaces]

### GanttAxisFormatStatement

`axisFormat` の文。

| 欄      | 型           | 意味                                                             |
| ------- | ------------ | ---------------------------------------------------------------- |
| `value` | GanttLiteral | `axisFormat` と 1 つの空白文字の後の、行の終わりまでのテキスト。 |

子の欄: `value`。GanttDateFormatStatement と同じです。
[fixture: gantt/db-axis-format]

### GanttTickIntervalStatement

`tickInterval` の文。

| 欄      | 型           | 意味                                                               |
| ------- | ------------ | ------------------------------------------------------------------ |
| `value` | GanttLiteral | `tickInterval` と 1 つの空白文字の後の、行の終わりまでのテキスト。 |

子の欄: `value`。GanttDateFormatStatement と同じです。
[fixture: gantt/db-tick-interval]

### GanttTodayMarkerStatement

`todayMarker` の文。

| 欄      | 型           | 意味                                                              |
| ------- | ------------ | ----------------------------------------------------------------- |
| `value` | GanttLiteral | `todayMarker` と 1 つの空白文字の後の、行の終わりまでのテキスト。 |

子の欄: `value`。テキストは `#` を含められ、`;` と改行の前で終わります。
[fixture: gantt/db-today-marker] [fixture: gantt/db-today-marker-off]
[fixture: gantt/lex-todaymarker-hash]

### GanttIncludesStatement

`includes` の文。チャートが作業時間に数える日付と曜日です。

| 欄      | 型                  | 意味                                                                                  |
| ------- | ------------------- | ------------------------------------------------------------------------------------- |
| `items` | Identifier のリスト | リストのテキストの項目。空白か `,` の単位で区切られ、ソースの順です。なければ空です。 |

子の欄: `items`。項目は空白でも `,` でもない文字の極大の並びなので、
[Identifier](../ast.ja.md#identifier) です。
大文字小文字を保ち、mermaid.js はそれを小文字にします。
間に何もないコンマと、空白だけのリストのテキストは項目を作りません。
[fixture: gantt/db-includes-tokens] [fixture:
gantt/lex-excludes-commas-and-spaces] [fixture:
gantt/lex-excludes-upper-case-items] [fixture: gantt/lex-excludes-empty-items]
[fixture: gantt/lex-excludes-whitespace-value]

### GanttExcludesStatement

`excludes` の文。チャートが除く日付と曜日です。

| 欄      | 型                  | 意味                                                        |
| ------- | ------------------- | ----------------------------------------------------------- |
| `items` | Identifier のリスト | リストのテキストの項目。GanttIncludesStatement と同じです。 |

子の欄: `items`。[fixture: gantt/db-excludes-tokens] [fixture:
gantt/db-excludes-merged-lines]

### GanttInclusiveEndDatesStatement

`inclusiveEndDates` の文。ほかの欄も子の欄もないノードです。
[fixture: gantt/db-inclusive-end-dates]

### GanttWeekdayStatement

`weekday` の文。週の最初の曜日です。

| 欄    | 型     | 意味                                                                                                |
| ----- | ------ | --------------------------------------------------------------------------------------------------- |
| `day` | string | `monday`、`tuesday`、`wednesday`、`thursday`、`friday`、`saturday`、`sunday` のどれか。小文字です。 |

子の欄はありません。曜日は固定の集合の語なので string の欄で、
テキストの大文字小文字によらず小文字です。
トークンは書かれた大文字小文字を保ちます。
[fixture: gantt/db-weekday-last-wins] [fixture: gantt/lex-day-mixed-case]

### GanttWeekendStatement

`weekend` の文。週末の最初の曜日です。

| 欄    | 型     | 意味                                 |
| ----- | ------ | ------------------------------------ |
| `day` | string | `friday` か `saturday`。小文字です。 |

子の欄はありません。[fixture: gantt/db-weekend-friday] [fixture:
gantt/db-weekend-saturday]

### GanttTitleStatement

`title` の文。

| 欄      | 型           | 意味                                                        |
| ------- | ------------ | ----------------------------------------------------------- |
| `value` | GanttLiteral | `title` と 1 つの空白文字の後の、行の終わりまでのテキスト。 |

子の欄: `value`。
値は両端の空白を保ち、`:`、`#`、`;`、`%%` を文字として持ちます。
[fixture: gantt/db-title-statement] [fixture: gantt/lex-title-two-spaces]
[fixture: gantt/lex-title-trailing-spaces] [fixture:
gantt/lex-title-hash-semicolon-percent]

### GanttSectionStatement

`section` の文。

| 欄     | 型           | 意味                                                          |
| ------ | ------------ | ------------------------------------------------------------- |
| `name` | GanttLiteral | `section` と 1 つの空白文字の後の、行の終わりまでのテキスト。 |

子の欄: `name`。名前は空白を含みうるテキストで、何も参照しないので
GanttLiteral です。両端の空白を保ちます。
[fixture: gantt/db-sections] [fixture: gantt/lex-section-two-spaces] [fixture:
gantt/lex-section-trailing-spaces]

### GanttAccTitleStatement

テキスト付きの `accTitle:` の文。

| 欄      | 型           | 意味                                           |
| ------- | ------------ | ---------------------------------------------- |
| `value` | GanttLiteral | `accTitle:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。`:` の後の空白は改行を含めて一緒に読まれるので、
テキストは最初にテキストのある行から始まり、値は null になりません。
後ろに何もない `accTitle:` は拒否されます。
値は両端の空白を除いたテキストです。
[fixture: gantt/gram-acc-title] [fixture:
gantt/gram-acc-title-line-feed-then-text] [fixture: gantt/lex-acc-title-at-end]
[fixture: gantt/gram-acc-title-trailing-spaces]

### GanttAccDescrStatement

テキスト付きの `accDescr:` の文。

| 欄      | 型           | 意味                                           |
| ------- | ------------ | ---------------------------------------------- |
| `value` | GanttLiteral | `accDescr:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。GanttAccTitleStatement と同じく、値は null になりません。
[fixture: gantt/gram-acc-descr] [fixture: gantt/lex-acc-descr-at-end]

### GanttAccDescrBlockStatement

テキスト付きの、またはテキストのない `accDescr { … }` の文。
テキストのないものは空の説明ブロックで、何も変えません。
ブロックは常に閉じています。テキストはその中では終われません。

| 欄      | 型                   | 意味                                                                                 |
| ------- | -------------------- | ------------------------------------------------------------------------------------ |
| `value` | GanttLiteral か null | `accDescr {` と `}` の間の、両端の空白を除いたテキスト。間が空白だけなら null です。 |

子の欄: `value`。`accDescr {}`、`accDescr { }`、空行のブロックは
値 null を持ち、何も変えません。
そのようなブロックが文であるのは文の始まる位置だけで、
click の文の中のブロックは入力を拒否させます
（[空の説明ブロック](../diagrams/gantt.ja.md#空の説明ブロック) を参照）。
[fixture: gantt/gram-acc-descr-block] [fixture:
gantt/gram-acc-descr-block-multiline] [fixture:
gantt/gram-acc-descr-block-empty] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/div-empty-description-block-between-click-id-and-href] [fixture:
gantt/lex-acc-descr-block-unclosed]

### GanttLiteral

空白を含みうる、引用符のないテキスト。
タスクの説明、タスクのデータの項目、タイトル、section の名前、設定の値、
コールバック名、コールバック引数、アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                       |
| ------- | ------ | ---------------------------------------------------------- |
| `value` | string | 書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。各 GanttLiteral は 1 つの単位なので、
値はその単位の書かれたテキストです。
説明はコロンの前の空白を保ち、タイトル、section の名前、設定は両端の空白を保ち、
コールバック名は `(` の前の空白と改行を保ち、
コールバック引数は両端の空白を保ちます。
タスクのデータの項目は両端に空白を持たず、
アクセシビリティのテキストは、
mermaid.js が切り落とす両端の空白を除いて読まれます。
コールバック引数、コールバック名、説明ブロックの中の改行は値の一部です。
[fixture: gantt/lex-task-text-trailing-spaces] [fixture:
gantt/lex-title-two-spaces] [fixture: gantt/lex-title-trailing-spaces]
[fixture: gantt/lex-dateformat-two-spaces] [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-arguments-leading-space] [fixture:
gantt/lex-task-items-nbsp-trimmed] [fixture:
gantt/gram-acc-title-trailing-spaces] [fixture:
gantt/gram-click-call-arguments-line-feed] [fixture:
gantt/gram-acc-descr-block-multiline]

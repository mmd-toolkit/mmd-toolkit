# Gantt 図の整形規則

英語版: [gantt.md](./gantt.md)

prettier-plugin-mmd が Gantt 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
Gantt 図の多くの値は、両端の空白を Db に持つので、書かれたまま印字します。
どの空白を整形するかは各規則に書きます。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダーの後の文は、ヘッダーより 1 段深く置き、
`section` の後の文は、次の `section` まで、さらに 1 段深く置きます。
タスク、click 文、設定など、どの文も同じです。
`section` 自体は最初の段です。
Gantt 図の木は平らで、文のブロックがないので、
文の段は、ほかの文の中での位置で決まります。
section の下のタスクは、mermaid.js の文書の書き方と同じく、
section の中に置きます。
journey も同じです。
[fixture: indentation/sections-and-tasks-nested]
[fixture: indentation/statements-before-the-first-section]
[fixture: indentation/every-statement-under-a-section]
[fixture: indentation/consecutive-sections]
[fixture: indentation/click-statement-over-lines-under-a-section]
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、既定は空白 2 つです。
[fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
入力に書かれたインデントは残しません。
行頭の空白は mermaid.js にとって無だからです。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。
[fixture: indentation/written-indentation-dropped]
ヘッダーは、前に空白が書かれていても 1 桁目に置きます。
[fixture: indentation/header-leading-whitespace]
書かれたまま残すテキスト（`accDescr` ブロックの行など）は、
行ごとの桁を保ち、ブロックを閉じる `}` は文と同じ段に置きます
（[複数行の値](#複数行の値)を参照）。
[fixture: indentation/description-block-under-a-section]

入力
([indentation/sections-and-tasks-nested-input.mmd](../tests/fixtures/gantt/indentation/sections-and-tasks-nested-input.mmd)):

```mmd
gantt
title T
section One
a : a1, 2024-01-01, 2d
click a1 href "u"
section Two
    b : 2d
```

出力
([indentation/sections-and-tasks-nested-output.mmd](../tests/fixtures/gantt/indentation/sections-and-tasks-nested-output.mmd)):

```mmd
gantt
  title T
  section One
    a :a1, 2024-01-01, 2d
    click a1 href "u"
  section Two
    b :2d
```

入力
([indentation/tab-width-4-input.mmd](../tests/fixtures/gantt/indentation/tab-width-4-input.mmd)):

```mmd
gantt
title T
section S
a : 1d
```

出力
([indentation/tab-width-4-output.mmd](../tests/fixtures/gantt/indentation/tab-width-4-output.mmd)):

```mmd
gantt
    title T
    section S
        a :1d
```

### 1 行に 1 文

各文は 1 行に 1 つ置きます。
Gantt 図には文を区切るものがなく
（diagrams/gantt.md、Diagram and statements）、
ヘッダー、`inclusiveEndDates`、日つきの `weekday` と `weekend`、
`accDescr` ブロック、click 文の後ろには、同じ行に次の文を続けられます。
これらの後ろの文は、それぞれの行に移します。
1 行に 2 つの文があると読みにくく、ほかの図種も 1 行に 1 つの文を印字します。
[fixture: statements-one-per-line/header-then-statement]
[fixture: statements-one-per-line/header-then-task]
[fixture: statements-one-per-line/keyword-statements]
[fixture: statements-one-per-line/weekday-then-task]
[fixture: statements-one-per-line/weekday-then-weekend]
[fixture: statements-one-per-line/inclusive-then-title]
[fixture: statements-one-per-line/description-block-then-task]
[fixture: statements-one-per-line/click-then-task]
`title`、`section`、`accTitle`、`accDescr:` は
行の残りを取るので、その後ろには何も続きません。
`todayMarker` の値は `;` で終わり、
ほかの設定、タスクのデータ、リストは `#` か `;` で終わり
（diagrams/gantt.md、The statement context）、
その後ろは次の文です。
`a : 1d#b : 2d` はタスク `a ` と `#b ` です。
その文は、説明の最初の文字である `#` と一緒に、自分の行に移します。
[fixture: statements-one-per-line/setting-then-task-at-hash]
[fixture: statements-one-per-line/task-data-then-task-at-hash]
[fixture: statements-one-per-line/list-then-task-at-hash]
[fixture: statements-one-per-line/today-marker-takes-hash]
[fixture: statements-one-per-line/today-marker-then-task-at-semicolon-line-kept]

直前の文に接している文も、mermaid.js は同じに読むので、行を分けます。
`gantt-x : 1d` のヘッダーの後のタスク `-x `、
`inclusiveEndDates{ : 1d` の `{` の後、
空の説明ブロックの `}` の後、リンクの `"` の後、
呼び出しの `)` の後が該当します。
[fixture: statements-one-per-line/header-glued-task]
[fixture: statements-one-per-line/inclusive-glued-brace-task]
[fixture: statements-one-per-line/empty-description-block-glued-task]
[fixture: statements-one-per-line/click-glued-task]
[fixture: statements-one-per-line/call-glued-task]
空の説明ブロックは、文が始まる所ならどこでも文で、何も変えず、
自分の行に置きます。
[fixture: statements-one-per-line/empty-description-block-then-task]
[fixture: statements-one-per-line/empty-description-blocks-adjacent]
[fixture: statements-one-per-line/description-block-between-statements]
[fixture: statements-one-per-line/description-block-after-click]
同じ行の 2 つの文の間のディレクティブは、後ろの文と一緒に置きます。
[fixture: statements-one-per-line/directive-after-statement]

`;` がある行は、その文を一緒に残します。
mermaid.js の行の規則は、`style`、その後の `:`、さらに後の `#` を含む行の
最後の `;` を取り除きます。
文を別の行に動かすと、
規則が `;` を無視しなくなったり、別の `;` を無視したりします。
`accDescr { style:#x } a : 1d;` はタスク `a ` とデータ `1d` ですが、
`a : 1d;` だけの行は拒否されます。
`;` がデータを終わらせ、データのないタスクのテキストになるからです。
そのため、そのような行の文はその行に残し、
文の間の空白はほかと同じに整形し、`;` は書かれたまま残します。
[fixture: statements-one-per-line/semicolon-line-kept]
[fixture: statements-one-per-line/ignored-semicolon-line-kept]
[fixture: statements-one-per-line/ignored-semicolon-click-line-kept]
タスクのデータ、設定、リストを終わらせる `;` の後ろの文も、
`;` を含む行にあるので、その行に残ります。
[fixture: statements-one-per-line/setting-then-task-at-semicolon-line-kept]

入力
([statements-one-per-line/keyword-statements-input.mmd](../tests/fixtures/gantt/statements-one-per-line/keyword-statements-input.mmd)):

```mmd
gantt
weekday monday inclusiveEndDates
weekend friday   inclusiveEndDates
```

出力
([statements-one-per-line/keyword-statements-output.mmd](../tests/fixtures/gantt/statements-one-per-line/keyword-statements-output.mmd)):

```mmd
gantt
  weekday monday
  inclusiveEndDates
  weekend friday
  inclusiveEndDates
```

入力
([statements-one-per-line/click-then-task-input.mmd](../tests/fixtures/gantt/statements-one-per-line/click-then-task-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 href "u" b : 1d
```

出力
([statements-one-per-line/click-then-task-output.mmd](../tests/fixtures/gantt/statements-one-per-line/click-then-task-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 href "u"
  b :1d
```

入力
([statements-one-per-line/header-glued-task-input.mmd](../tests/fixtures/gantt/statements-one-per-line/header-glued-task-input.mmd)):

```mmd
gantt-x : 1d
```

出力
([statements-one-per-line/header-glued-task-output.mmd](../tests/fixtures/gantt/statements-one-per-line/header-glued-task-output.mmd)):

```mmd
gantt
  -x :1d
```

入力
([statements-one-per-line/ignored-semicolon-line-kept-input.mmd](../tests/fixtures/gantt/statements-one-per-line/ignored-semicolon-line-kept-input.mmd)):

```mmd
gantt
accDescr { style:#x } a : 1d;
inclusiveEndDates weekday monday
```

出力
([statements-one-per-line/ignored-semicolon-line-kept-output.mmd](../tests/fixtures/gantt/statements-one-per-line/ignored-semicolon-line-kept-output.mmd)):

```mmd
gantt
  accDescr { style:#x } a :1d;
  inclusiveEndDates
  weekday monday
```

### 空行

連続する空行は 1 つにし、本体の先頭と末尾の空行は落とします。
他の図種と同じ規則です。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/body-edges-dropped]
文の間の空行は、1 つにして残します。
[fixture: blank-lines/between-statements-kept-as-one]
コメント行の周りの空行も同じに扱います。
[fixture: blank-lines/around-comment-lines]
`section` の周りの空行は、1 つにして、隣の行と同じ段で残します。
[fixture: blank-lines/around-sections]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/gantt/blank-lines/collapsed-input.mmd)):

```mmd
gantt
title T



section S


a : 1d
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/gantt/blank-lines/collapsed-output.mmd)):

```mmd
gantt
  title T

  section S

    a :1d
```

入力
([blank-lines/body-edges-dropped-input.mmd](../tests/fixtures/gantt/blank-lines/body-edges-dropped-input.mmd)):

```mmd
gantt



title T


```

出力
([blank-lines/body-edges-dropped-output.mmd](../tests/fixtures/gantt/blank-lines/body-edges-dropped-output.mmd)):

```mmd
gantt
  title T
```

### タスクのデータ

タスクは、説明、コロン、項目の順に印字します。
説明は、テキストとコロンの間の空白も含めて、書かれたまま印字します。
その空白は説明の一部で Db が持つので、
`A task           :a1` と `A task :a1` は別のタスクであり、
コロンをそろえる空白も残ります。
[fixture: task-data/description-padding-kept]
[fixture: task-data/colon-after-description-as-written]
`#` や `;` で始まる説明も、ほかと同じタスクのテキストです。
[fixture: task-data/hash-and-semicolon-descriptions]

最初の項目はコロンに接し、`,` は前の項目に接して、
後ろに項目があれば空白 1 つを置きます。
コロンと `,` の周りの空白は Db に入らないので、残しません。
mermaid.js の文書の task 行の多くがこの形で、空白は項目の前にだけ置きます。
[fixture: task-data/colon-touches-first-item]
[fixture: task-data/comma-spacing]
[fixture: task-data/tab-around-items]
データの末尾の空白は落とします。
[fixture: task-data/trailing-whitespace-dropped]

タグと項目は書かれたまま印字します。
項目の中の空白は項目の一部で、タグの大文字小文字もそうです。
`after   a1` はそのまま項目であり、`Done` はタグではありません。
[fixture: task-data/inner-whitespace-kept]
[fixture: task-data/tags]
[fixture: task-data/after-until-forms]
[fixture: keyword-case/tags-case-kept]

空の項目は、mermaid.js が項目の数を読むので残します。
`,` は残り、空の項目は何も印字しないので、
`a : , 1d` は `a :, 1d` になり、`a : 1d,` は `,` を保ちます。
[fixture: task-data/empty-items]

空白だけのデータは空の項目 1 つで、
mermaid.js はコロンの後に 1 文字を要求します。
`a : ` はタスクで、`a :` は拒否されます。
そのため、コロンの後に空白 1 文字（書かれた最初の 1 文字）を残し、
残りは落とします。
行の続きにディレクティブなどの文字があるときは、
空白がそれらと一緒に読まれるので、行を書かれたまま印字します。
[fixture: task-data/whitespace-only-data]
[fixture: task-data/whitespace-only-data-then-directive]
タスクの部分の間のディレクティブはその位置に残します
（[ディレクティブ](#ディレクティブ)を参照）。

入力
([task-data/description-padding-kept-input.mmd](../tests/fixtures/gantt/task-data/description-padding-kept-input.mmd)):

```mmd
gantt
Completed task            :done,    des1, 2014-01-06,2014-01-08
Active task               :active,  des2, 2014-01-09, 3d
Future task               :         des3, after des2, 5d
```

出力
([task-data/description-padding-kept-output.mmd](../tests/fixtures/gantt/task-data/description-padding-kept-output.mmd)):

```mmd
gantt
  Completed task            :done, des1, 2014-01-06, 2014-01-08
  Active task               :active, des2, 2014-01-09, 3d
  Future task               :des3, after des2, 5d
```

入力
([task-data/colon-touches-first-item-input.mmd](../tests/fixtures/gantt/task-data/colon-touches-first-item-input.mmd)):

```mmd
gantt
A task :a1, 2014-01-01, 30d
B task : a2, 2014-01-01, 30d
C task :    a3 , 2014-01-01
```

出力
([task-data/colon-touches-first-item-output.mmd](../tests/fixtures/gantt/task-data/colon-touches-first-item-output.mmd)):

```mmd
gantt
  A task :a1, 2014-01-01, 30d
  B task :a2, 2014-01-01, 30d
  C task :a3, 2014-01-01
```

入力
([task-data/tags-input.mmd](../tests/fixtures/gantt/task-data/tags-input.mmd)):

```mmd
gantt
a : done, 1d
b : active,crit, 2d
c : Done, 1d
d : milestone , m1, 2024-01-01, 0d
```

出力
([task-data/tags-output.mmd](../tests/fixtures/gantt/task-data/tags-output.mmd)):

```mmd
gantt
  a :done, 1d
  b :active, crit, 2d
  c :Done, 1d
  d :milestone, m1, 2024-01-01, 0d
```

### 設定

`dateFormat`、`axisFormat`、`tickInterval`、`todayMarker` は、
値を、両端の空白も含めて書かれたまま印字します。
Db は値をそのまま持つので、空白 2 つの `dateFormat  YYYY-MM-DD` は
空白と `YYYY-MM-DD` の書式を持ち、
末尾に空白 2 つがある `todayMarker off` は別のマーカーです。
[fixture: settings/value-whitespace-kept]
`todayMarker` の値は `#` を含み、どの値も `%%` をテキストの文字として含みます。
`todayMarker` の値は `;` で終わり、
`dateFormat`、`axisFormat`、`tickInterval` の値は `#` か `;` で終わります
（[1 行に 1 文](#1-行に-1-文)を参照）。
[fixture: settings/hash-semicolon-percent-in-values]

整形するのは、キーワードと値を区切る空白 1 文字だけです。
そこには、タブや改行で書かれていても、空白 1 つを置きます。
その 1 文字は Db に入らないので、区切りの形を 1 つにします。
[fixture: settings/one-space-after-keyword]
[fixture: settings/value-on-next-line]
キーワードと値の間のディレクティブはその位置に残します
（[ディレクティブ](#ディレクティブ)を参照）。
[fixture: settings/directive-between-keyword-and-value-kept]

入力
([settings/value-on-next-line-input.mmd](../tests/fixtures/gantt/settings/value-on-next-line-input.mmd)):

```mmd
gantt
dateFormat
YYYY-MM-DD
axisFormat
 %m
```

出力
([settings/value-on-next-line-output.mmd](../tests/fixtures/gantt/settings/value-on-next-line-output.mmd)):

```mmd
gantt
  dateFormat YYYY-MM-DD
  axisFormat  %m
```

入力
([settings/hash-semicolon-percent-in-values-input.mmd](../tests/fixtures/gantt/settings/hash-semicolon-percent-in-values-input.mmd)):

```mmd
gantt
todayMarker stroke-width:5px,#fff
dateFormat X %% c
```

出力
([settings/hash-semicolon-percent-in-values-output.mmd](../tests/fixtures/gantt/settings/hash-semicolon-percent-in-values-output.mmd)):

```mmd
gantt
  todayMarker stroke-width:5px,#fff
  dateFormat X %% c
```

### タイトルとセクション

`title` と `section` も設定と同じに印字します。
値は両端の空白も含めて書かれたまま（Db が持つ）で、
キーワードの後の区切りは空白 1 つです。
[fixture: titles-and-sections/value-whitespace-kept]
[fixture: titles-and-sections/one-space-after-keyword]
[fixture: titles-and-sections/value-on-next-line]
値は `:`、`#`、`;`、`%%` を文字として含みます。
[fixture: titles-and-sections/special-characters-in-values]
キーワードと値の間のディレクティブはその位置に残します
（[ディレクティブ](#ディレクティブ)を参照）。
[fixture: titles-and-sections/directive-between-keyword-and-value-kept]
後の行に書かれた値は、キーワードの後に寄せて 1 行にします。
間にコメント行があれば、文は書かれたまま印字します
（[複数行の文](#複数行の文)を参照）。
[fixture: titles-and-sections/comment-line-inside-kept]

入力
([titles-and-sections/special-characters-in-values-input.mmd](../tests/fixtures/gantt/titles-and-sections/special-characters-in-values-input.mmd)):

```mmd
gantt
title a: b # c ; d %% e
section #x:y;z
```

出力
([titles-and-sections/special-characters-in-values-output.mmd](../tests/fixtures/gantt/titles-and-sections/special-characters-in-values-output.mmd)):

```mmd
gantt
  title a: b # c ; d %% e
  section #x:y;z
```

入力
([titles-and-sections/value-on-next-line-input.mmd](../tests/fixtures/gantt/titles-and-sections/value-on-next-line-input.mmd)):

```mmd
gantt
title
T
section
S
```

出力
([titles-and-sections/value-on-next-line-output.mmd](../tests/fixtures/gantt/titles-and-sections/value-on-next-line-output.mmd)):

```mmd
gantt
  title T
  section S
```

### リスト

`includes` と `excludes` の項目は、キーワードの後に空白 1 つを置いて続けます。
空白がいくつ書かれていても同じです。
[fixture: lists/space-after-keyword]
[fixture: lists/on-next-line]
項目の区切りは書かれたままにします。
`,` は前の項目に接し、後ろに空白 1 つを置き、
空白だけで区切られた項目は空白 1 つで区切ります。
Db はどの区切りでも同じなので、区切りの種類は作者のものです。
[fixture: lists/separators-as-written]
[fixture: lists/dates-and-days]
項目の大文字小文字は残します（mermaid.js が小文字にします）。
[fixture: lists/items-case-kept]
キーワードと最初の項目の間と、項目の間のディレクティブは、
両側に書かれた空白を保ってその位置に残します。
[fixture: lists/directive-after-keyword-kept]
[fixture: lists/directive-between-items-kept]

項目のない `,` はそのまま残します。
[fixture: lists/empty-items-kept]
リストの末尾の空白は落とします。
[fixture: lists/trailing-whitespace-dropped]
空白だけのリストは項目を持たず、
mermaid.js はキーワードの後の空白の後ろに
リストのテキストの 1 文字を要求するので、
キーワードの後に空白 2 文字を、書かれたまま残します。
[fixture: lists/whitespace-only]

mermaid.js はリストのテキスト全体の大文字小文字を、分ける前に小文字にします。
大文字のシグマは、その前の、変換が無視しない文字が文字で終わり、
後ろに文字が続かないとき、語末の `ς` になり、U+FEFF は無視されます。
`ΑΒ`、U+FEFF、`Σ` は `ς` で終わりますが、
空白など、ほかの空白なら `Σ` は単独で `σ` になります。
そのため、項目の間に U+FEFF があるリストは書かれたまま印字し、
ほかの空白は空白 1 つに整形します。
[test: U+FEFF between the items of a list]
[test: U+00A0 between the items of a list]

入力
([lists/separators-as-written-input.mmd](../tests/fixtures/gantt/lists/separators-as-written-input.mmd)):

```mmd
gantt
excludes weekends,2024-01-01
excludes weekends ,  2024-01-01
includes 2024-01-01   2024-01-02
excludes a , b   c,d
```

出力
([lists/separators-as-written-output.mmd](../tests/fixtures/gantt/lists/separators-as-written-output.mmd)):

```mmd
gantt
  excludes weekends, 2024-01-01
  excludes weekends, 2024-01-01
  includes 2024-01-01 2024-01-02
  excludes a, b c, d
```

入力
([lists/dates-and-days-input.mmd](../tests/fixtures/gantt/lists/dates-and-days-input.mmd)):

```mmd
gantt
excludes   weekends,   2024-01-01,   saturday
includes sunday   2024-02-02
```

出力
([lists/dates-and-days-output.mmd](../tests/fixtures/gantt/lists/dates-and-days-output.mmd)):

```mmd
gantt
  excludes weekends, 2024-01-01, saturday
  includes sunday 2024-02-02
```

### weekday と weekend

`weekday` と `weekend` の文は、キーワード、空白 1 つ、日の順に印字します。
間の空白や改行がどれだけ書かれていても同じです。
日は書かれた大文字小文字を保ちます（Db が小文字にします）。
[fixture: weekday-and-weekend/one-space]
[fixture: weekday-and-weekend/day-case-kept]
[fixture: weekday-and-weekend/day-on-next-line]
行末の空白は落とします。`inclusiveEndDates` の後も同じです。
[fixture: weekday-and-weekend/trailing-whitespace-dropped]
キーワードと日の間のディレクティブはその位置に残します。
[fixture: weekday-and-weekend/directive-between-keyword-and-day-kept]

入力
([weekday-and-weekend/day-case-kept-input.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-case-kept-input.mmd)):

```mmd
gantt
weekday MONDAY
weekend Friday
WEEKDAY Tuesday
```

出力
([weekday-and-weekend/day-case-kept-output.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-case-kept-output.mmd)):

```mmd
gantt
  weekday MONDAY
  weekend Friday
  WEEKDAY Tuesday
```

入力
([weekday-and-weekend/day-on-next-line-input.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-on-next-line-input.mmd)):

```mmd
gantt
weekday
monday
weekend

friday
```

出力
([weekday-and-weekend/day-on-next-line-output.mmd](../tests/fixtures/gantt/weekday-and-weekend/day-on-next-line-output.mmd)):

```mmd
gantt
  weekday monday
  weekend friday
```

### キーワードの大文字小文字

キーワードは書かれた大文字小文字を保ちます。
mermaid.js はどの大文字小文字でも読み、Db は同じです。
大文字小文字は強制されないので、作者が選んだものとして、書き換えません。
[fixture: keyword-case/keywords-kept]
[fixture: keyword-case/click-keywords-kept]
ヘッダーの `gantt` は小文字だけが検出され、
タスクのタグは `active`、`done`、`crit`、`milestone`、`vert` の
大文字小文字のとおりに読まれるので、`Done` はタグではなく、変えません。
[fixture: keyword-case/tags-case-kept]

入力
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/gantt/keyword-case/keywords-kept-input.mmd)):

```mmd
gantt
DATEFORMAT YYYY
AxisFormat %m
TICKINTERVAL 1week
TodayMarker off
TITLE T
Section S
EXCLUDES weekends
Includes monday
INCLUSIVEENDDATES
WEEKDAY Monday
WEEKEND FRIDAY
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

出力
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/gantt/keyword-case/keywords-kept-output.mmd)):

```mmd
gantt
  DATEFORMAT YYYY
  AxisFormat %m
  TICKINTERVAL 1week
  TodayMarker off
  TITLE T
  Section S
    EXCLUDES weekends
    Includes monday
    INCLUSIVEENDDATES
    WEEKDAY Monday
    WEEKEND FRIDAY
    ACCTITLE: T
    AccDescr: d
    ACCDESCR { d }
```

### click 文

click 文は、`click`、ID、部分の間に空白 1 つを置いて 1 行に印字します。
空白が多く書かれていたり、タブや改行で書かれていたりしても同じです。
[fixture: click-statements/one-space-between-parts]
[fixture: click-statements/parts-over-lines-joined]
ID の間の `,` は両側の ID に接します。空白は ID の終わりだからです。
空の ID は残します。
[fixture: click-statements/ids-touch-commas]
部分は書かれた順序のままです。
[fixture: click-statements/part-order-kept]
文の末尾の空白は落とします。
[fixture: click-statements/trailing-whitespace-dropped]
文は、ID が指すタスクに依存しません。
[fixture: click-statements/ids-unknown-and-duplicate]

呼び出しの名前と引数は、中の空白と改行も含めて書かれたまま印字します。
`f ()` の名前は `f` と空白で、`f( 1, 2 )` の引数は空白、`1, 2`、空白であり、
Db が持ちます。
リンクの文字列も書かれたままです。
[fixture: click-statements/call-name-and-arguments-kept]
[fixture: click-statements/href-string-kept]
複数行に書かれた文字列や引数は書かれたまま印字します
（[複数行の値](#複数行の値)を参照）。
[fixture: click-statements/string-over-lines-kept]
部分の間にコメント行やディレクティブがある文は、書かれたまま印字します。
[fixture: click-statements/comment-line-between-parts-kept]
[fixture: click-statements/directive-between-parts-kept]

入力
([click-statements/ids-touch-commas-input.mmd](../tests/fixtures/gantt/click-statements/ids-touch-commas-input.mmd)):

```mmd
gantt
a : id1, 1d
b : id2, 1d
click id1,id2 href "u"
click id1,,id2 href "u"
click id1, href "u"
click , href "u"
click   ,id1,   href "u"
```

出力
([click-statements/ids-touch-commas-output.mmd](../tests/fixtures/gantt/click-statements/ids-touch-commas-output.mmd)):

```mmd
gantt
  a :id1, 1d
  b :id2, 1d
  click id1,id2 href "u"
  click id1,,id2 href "u"
  click id1, href "u"
  click , href "u"
  click ,id1, href "u"
```

入力
([click-statements/part-order-kept-input.mmd](../tests/fixtures/gantt/click-statements/part-order-kept-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 href "u" call f()
click id1 call f() href "u"
```

出力
([click-statements/part-order-kept-output.mmd](../tests/fixtures/gantt/click-statements/part-order-kept-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 href "u" call f()
  click id1 call f() href "u"
```

入力
([click-statements/call-name-and-arguments-kept-input.mmd](../tests/fixtures/gantt/click-statements/call-name-and-arguments-kept-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 call f ()
click id1 call f( 1, 2 )
click id1 call f(1,2)
click id1 call f(  )
click id1 call   f()
```

出力
([click-statements/call-name-and-arguments-kept-output.mmd](../tests/fixtures/gantt/click-statements/call-name-and-arguments-kept-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 call f ()
  click id1 call f( 1, 2 )
  click id1 call f(1,2)
  click id1 call f( )
  click id1 call f()
```

### アクセシビリティの文

`accTitle` と `accDescr` の `:` はキーワードに接し、後ろに空白 1 つを置きます。
テキストの両端に空白は置きません。
[fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/text-whitespace-dropped]
テキストは `:`、`#`、`;`、`%%` を文字として含みます。
[fixture: accessibility-statements/special-characters-in-text]
後の行に書かれたテキストと、キーワードより後の行に書かれたコロンは、
1 行に合わせます。
[fixture: accessibility-statements/text-on-next-line-joined]
[fixture: accessibility-statements/keyword-and-colon-over-lines-joined]

`accDescr { ... }` ブロックの行は、必要からではなく選択として、
書かれたまま残します。
行頭の空白は Db に入らず、
`a`、改行、`b` と、`b` の前に空白がある形は同じ説明です。
行は作者のテキストで、印字は整形しないからです。
`}` は文と同じ段に置きます。
`{` の行にテキストがあるときは、
離れて書かれていれば括弧の内側に空白 1 つを置き、
テキストに接する括弧は接したままにします。
[fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-text-on-opening-line]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]
テキストの中の空白はテキストの一部で、残ります。
[fixture: accessibility-statements/block-inner-whitespace-kept]
キーワードとコロンや括弧の間と、その後のディレクティブはその位置に残します。
[fixture: accessibility-statements/directive-around-colon-and-braces-kept]

入力
([accessibility-statements/text-on-next-line-joined-input.mmd](../tests/fixtures/gantt/accessibility-statements/text-on-next-line-joined-input.mmd)):

```mmd
gantt
accTitle:
T
accDescr:

d
```

出力
([accessibility-statements/text-on-next-line-joined-output.mmd](../tests/fixtures/gantt/accessibility-statements/text-on-next-line-joined-output.mmd)):

```mmd
gantt
  accTitle: T
  accDescr: d
```

入力
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/gantt/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
gantt
accDescr {
   a
  b
}
```

出力
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/gantt/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
gantt
  accDescr {
   a
  b
  }
```

### 空の説明ブロック

何も変えない空のブロックは、文の 1 つです。
内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
接した keyword は接したまま、`accDescr{  }` は `accDescr{}` にします。
[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: gantt Unicode and tab interiors]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/blank-lines-inside]
ディレクティブやコメント行を持つブロックは書かれたまま印字します。
[fixture: empty-description-blocks/with-directive-or-comment-line-kept]
ヘッダーの後でも、自分の行に置きます。
[fixture: empty-description-blocks/after-header]

入力
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/gantt/empty-description-blocks/touching-kept-input.mmd)):

```mmd
gantt
accDescr{}
accDescr {}
accDescr{ }
```

出力
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/gantt/empty-description-blocks/touching-kept-output.mmd)):

```mmd
gantt
  accDescr{}
  accDescr {}
  accDescr{}
```

入力
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/gantt/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
gantt
accDescr {


}
```

出力
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/gantt/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
gantt
  accDescr {}
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、
字句解析器にとって改行が空白である所で 1 行に印字します。
`title`、`section`、設定、`weekday`、`weekend`、`includes`、`excludes`、
`accTitle:`、`accDescr:` の後、click 文の部分の間、
`accTitle` と `accDescr` の `:` の前後が該当し、そこの空行も落とします。
[fixture: multi-line-statements/value-on-next-line-joined]
[fixture: multi-line-statements/blank-lines-between-keyword-and-day]
コメント行、ディレクティブ、`;` を持つ文は、書かれたまま印字します。
コメント行はそれが立つ行の残りを取り、
ディレクティブのある行の空白は、ディレクティブと一緒に読まれ、
`;` は行の規則に合う行に移ることがあるからです。
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/semicolon-inside-kept]

入力
([multi-line-statements/value-on-next-line-joined-input.mmd](../tests/fixtures/gantt/multi-line-statements/value-on-next-line-joined-input.mmd)):

```mmd
gantt
title
T
section
S
dateFormat
YYYY
weekday
monday
excludes
weekends
```

出力
([multi-line-statements/value-on-next-line-joined-output.mmd](../tests/fixtures/gantt/multi-line-statements/value-on-next-line-joined-output.mmd)):

```mmd
gantt
  title T
  section S
    dateFormat YYYY
    weekday monday
    excludes weekends
```

入力
([multi-line-statements/comment-line-inside-kept-input.mmd](../tests/fixtures/gantt/multi-line-statements/comment-line-inside-kept-input.mmd)):

```mmd
gantt
title
%% c
T
weekday
%% c
monday
```

出力
([multi-line-statements/comment-line-inside-kept-output.mmd](../tests/fixtures/gantt/multi-line-statements/comment-line-inside-kept-output.mmd)):

```mmd
gantt
  title
%% c
T
  weekday
%% c
monday
```

### 複数行の値

呼び出しの引数と名前とリンクの文字列は、
値の一部なので、中の改行と空白も含めて書かれたまま残します。
`accDescr` ブロックの行も書かれたまま残しますが、これは選択です。
行頭の空白は Db に入りません。
[fixture: multi-line-values/call-arguments-kept]
[fixture: multi-line-values/call-name-kept]
[fixture: multi-line-values/href-string-kept]
[fixture: multi-line-values/description-block-lines-kept]
そのような文字列の中のコメント行は、文字列の一部です。
[fixture: multi-line-values/comment-line-inside-string-kept]

入力
([multi-line-values/call-arguments-kept-input.mmd](../tests/fixtures/gantt/multi-line-values/call-arguments-kept-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 call f(1,
  2)
```

出力
([multi-line-values/call-arguments-kept-output.mmd](../tests/fixtures/gantt/multi-line-values/call-arguments-kept-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 call f(1,
  2)
```

入力
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/gantt/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
gantt
accDescr {
  a
    b
}
```

出力
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/gantt/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
gantt
  accDescr {
  a
    b
  }
```

### トークンの間の空白

上の規則が当てはまらない所では、文のトークンの間の空白の連続は空白 1 つにし、
接しているトークンは接したままにします。
引数が空白だけの呼び出しの括弧の間と、説明ブロックの括弧が該当します。
[fixture: whitespace-between-tokens/blank-arguments]
ヘッダーの行末の空白は落とします。
[fixture: whitespace-between-tokens/trailing-whitespace-after-header]
値は整形しません（[タスクのデータ](#タスクのデータ)、[設定](#設定)、
[タイトルとセクション](#タイトルとセクション)を参照）。

入力
([whitespace-between-tokens/blank-arguments-input.mmd](../tests/fixtures/gantt/whitespace-between-tokens/blank-arguments-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 call f(    )
click id1 call f()
```

出力
([whitespace-between-tokens/blank-arguments-output.mmd](../tests/fixtures/gantt/whitespace-between-tokens/blank-arguments-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 call f( )
  click id1 call f()
```

### コメント

コメントは、単位が始まる所の `%%` か `%` で始まり、行末まで続きます。
単独の行のコメントは周りの文と同じ段に置き、テキストと印は書かれたまま残します。
[fixture: comments/lines-at-statement-level]
[fixture: comments/text-kept]
[fixture: comments/single-percent-kept]
[fixture: comments/bare-percent-lines]
コメント行は、その次の文と同じ段に置きます。
`section` の前のコメントは `section` の段、
タスクの前のコメントはタスクの段、
テキストの末尾のコメントは最後の文の段です。
[fixture: comments/levels-around-sections]
[fixture: directives/levels-around-sections]
ヘッダーより前のコメント行は 1 桁目に置き、
テキストの末尾のコメント行は、改行を足して自分の行に残します。
[fixture: comments/before-header]
[fixture: comments/last-in-body]

`%%{` で始まりディレクティブでないコメント行は、段によらず、
空白 1 文字（`useTabs` ならタブ 1 つ）の後に置きます。
そのような行の直前にある、印が `%` のコメント行も同じです。
mermaid.js は、その `%%{` を、前の空白が 1 文字か、
改行の後に 1 文字のときだけ読み、
それより多いときや、空行の後で空白がないときは拒否します
（既知の差異 `percent-brace-after-unit`）。
また、テキストを読む前にディレクティブを取り除くので、
ディレクティブだけの行の空白も `%%{` の前の空白に数えます。
そのため、その前のディレクティブだけの行は、間に空行があってもなくても、
1 桁目に置き、
`%%{` 自体の行では、その前のディレクティブと、その間の空白も数えて、
コメントの前の空白が全体で 1 文字になるようにします。
間に空白がなければ、行頭に空白 1 つ（`useTabs` ならタブ 1 つ）を置きます。
また、印が `%` のコメントが直接に読まれると、後ろの改行を取るので、
その後ろの `%%{` も直接に読まれます（既知の差異 `comment-takes-line-break`）。
[fixture: comments/percent-brace-line-after-one-whitespace]
[fixture: comments/percent-brace-line-after-blank-line]
[fixture: comments/percent-brace-line-under-a-section]
[fixture: comments/percent-brace-line-with-tabs]
[fixture: comments/percent-brace-line-at-the-end]
[fixture: comments/percent-comment-then-percent-brace-line]
[fixture: comments/percent-comment-line-not-before-percent-brace]
[fixture: comments/percent-brace-line-after-directive-line]
[fixture: comments/percent-brace-line-after-directive-line-at-the-start]
[fixture: comments/percent-brace-line-after-two-directive-lines-under-a-section]
[fixture: comments/percent-brace-line-after-directive-over-lines]
[fixture: comments/percent-brace-line-after-directive-and-blank-lines]
[fixture: comments/percent-brace-line-after-comment-and-directive-lines]
[fixture: comments/percent-brace-line-after-directive-on-its-line]
[fixture: comments/percent-brace-line-after-directive-touching]
[fixture: comments/percent-brace-line-after-directive-with-tabs]

文やヘッダーの後ろのコメントは、書かれたとおり行に残します。
空白が書かれていれば空白 1 つを置き、接していれば接したままにします。
接している文のコメントは mermaid.js が別に読むことがあるからです。
[fixture: comments/after-header]
[fixture: comments/after-header-glued]
[fixture: comments/after-keyword-statement]
[fixture: comments/after-keyword-statement-glued]
[fixture: comments/after-day]
[fixture: comments/after-description-block]
[fixture: comments/after-click]
[fixture: comments/after-directive-kept]
[fixture: comments/after-statement-under-a-section]
[fixture: comments/then-statement-on-next-line]
そのような文の次の文は、次の行に置きます。

タイトル、セクション、設定、タスクのデータ、アクセシビリティのテキストの中の
`%%` は、コメントではなくテキストの文字で、テキストと一緒に残します。
[fixture: comments/percent-in-values-kept]

入力
([comments/single-percent-kept-input.mmd](../tests/fixtures/gantt/comments/single-percent-kept-input.mmd)):

```mmd
gantt
% c
   %x
inclusiveEndDates
```

出力
([comments/single-percent-kept-output.mmd](../tests/fixtures/gantt/comments/single-percent-kept-output.mmd)):

```mmd
gantt
  % c
  %x
  inclusiveEndDates
```

入力
([comments/after-day-input.mmd](../tests/fixtures/gantt/comments/after-day-input.mmd)):

```mmd
gantt
weekday monday%c
weekend   friday   % d
```

出力
([comments/after-day-output.mmd](../tests/fixtures/gantt/comments/after-day-output.mmd)):

```mmd
gantt
  weekday monday%c
  weekend friday % d
```

入力
([comments/after-click-input.mmd](../tests/fixtures/gantt/comments/after-click-input.mmd)):

```mmd
gantt
a : id1, 1d
click id1 href "u"%% c
click id1 call f()  %% d
```

出力
([comments/after-click-output.mmd](../tests/fixtures/gantt/comments/after-click-output.mmd)):

```mmd
gantt
  a :id1, 1d
  click id1 href "u"%% c
  click id1 call f() %% d
```

### ディレクティブ

単独の行のディレクティブは周りの文と同じ段に置きます。
同じ印字行の中では、両側の空白の有無を残します。
空白がある所には空白 1 つを置き、接している所は接したままにします。
[fixture: directives/kept]
[fixture: directives/before-header]
[fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept]
[fixture: directives/whitespace-on-both-sides-collapsed]
[fixture: directives/touching-one-side-kept]
[fixture: directives/after-statement-at-end-of-line]
[fixture: directives/statement-after-directive-line]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: gantt/directives/split-directive-gap]

文の 2 つの単位の間のディレクティブは、
両側に書かれた空白を保ってその位置に残し、
テキストの中のディレクティブはテキストの一部です。
[fixture: directives/between-units-kept]
[fixture: directives/between-task-parts-kept]
[fixture: directives/inside-values-kept]
[fixture: directives/over-lines-kept]
閉じられていないディレクティブはテキストの残りを取り、書かれたまま残します。
[fixture: directives/unclosed-at-end-of-text-kept]
[fixture: directives/unclosed-after-statement-kept]

入力
([directives/kept-input.mmd](../tests/fixtures/gantt/directives/kept-input.mmd)):

```mmd
gantt
%%{init: {}}%%
   %%{init: {}}%%
title T
   %%{init: {}}%%
```

出力
([directives/kept-output.mmd](../tests/fixtures/gantt/directives/kept-output.mmd)):

```mmd
gantt
  %%{init: {}}%%
  %%{init: {}}%%
  title T
  %%{init: {}}%%
```

入力
([directives/touching-one-side-kept-input.mmd](../tests/fixtures/gantt/directives/touching-one-side-kept-input.mmd)):

```mmd
gantt
weekday monday %%{init: {}}%%
title%%{init: {}}%% T
```

出力
([directives/touching-one-side-kept-output.mmd](../tests/fixtures/gantt/directives/touching-one-side-kept-output.mmd)):

```mmd
gantt
  weekday monday %%{init: {}}%%
  title%%{init: {}}%% T
```

入力
([directives/between-units-kept-input.mmd](../tests/fixtures/gantt/directives/between-units-kept-input.mmd)):

```mmd
gantt
weekday  %%{init: {}}%%  monday
a : id1, 1d
click %%{init: {}}%%id1 href "u"
click id1 call f%%{init: {}}%%()
```

出力
([directives/between-units-kept-output.mmd](../tests/fixtures/gantt/directives/between-units-kept-output.mmd)):

```mmd
gantt
  weekday %%{init: {}}%% monday
  a :id1, 1d
  click %%{init: {}}%%id1 href "u"
  click id1 call f%%{init: {}}%%()
```

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整形し、
`---` の行は、末尾の空白も含めて書かれたまま残します。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
Prettier が読めない YAML は書かれたまま残します。
[fixture: frontmatter-yaml/malformed-kept]
フロントマターとヘッダーの間のコメント行は残します。
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/gantt/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:   {theme:  dark}
---
gantt
title T
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/gantt/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { theme: dark }
---
gantt
  title T
```

入力
([frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd](../tests/fixtures/gantt/frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd)):

```mmd
---
title: T
---
%% c
gantt
title T
```

出力
([frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd](../tests/fixtures/gantt/frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd)):

```mmd
---
title: T
---
%% c
gantt
  title T
```

### 行区切り文字

U+2028 と U+2029 は、Gantt 図の単位の間の空白であり、
テキストの文字でもあります。
文の間では、どの空白とも同じ改行として扱い、文はそれぞれの行に移ります。
文の中で、これを含む間隔は書かれたまま印字し、
説明、タイトル、セクション名、アクセシビリティのテキストの
中のものも書かれたまま残します。
例は文字列で書かれていて、`\u2028` は U+2028、`\n` は改行です。
[test: U+2028 between the header and a statement]
[test: U+2028 between two statements]
[test: U+2028 and whitespace at the end of a statement]
[test: U+2028 inside a task description]
[test: U+2028 before the colon of a task]
[test: U+2028 between the items of task data]
[test: U+2028 after a title keyword]
[test: U+2029 inside a title]
[test: U+2028 between the items of a list]
[test: U+2028 between weekday and its day]
[test: U+2028 after the colon of accTitle]
[test: U+2028 between a click id and its part]

### 空白の文字

U+00A0 と U+FEFF は、字句解析器にとって単位の間の空白であり、
テキストの文字でもあります。
字句解析器が空白 1 文字を読む所
（キーワードの後の区切りなど）には空白 1 つを置き、
タスクのデータの項目の周りでは空白と同じに落とし、
タスクのコロンの前では説明が保ち、
リストでは項目の間の U+FEFF を書かれたまま残します
（[リスト](#リスト)を参照）。
例は文字列で書かれていて、`\u00a0` は U+00A0、`\ufeff` は U+FEFF です。
[test: U+00A0 after a title keyword]
[test: U+00A0 between weekday and its day]
[test: U+00A0 between two statements]
[test: U+00A0 around an item of task data]
[test: U+00A0 between the items of task data]
[test: U+00A0 before the colon of a task]
[test: U+00A0 between the items of a list]
[test: U+FEFF before a task]
[test: U+FEFF between the items of a list]

# journey の整形規則

英語版: [journey.md](./journey.md)

prettier-plugin-mmd が journey をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
journey の多くの値は、両端の空白を Db に持つので、書かれたまま印字します。
どの空白を整形するかは各規則に書きます。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダーの後の文は、ヘッダーより 1 段深く置き、
`section` の後の文は、次の `section` まで、さらに 1 段深く置きます。
タスクも、ほかのどの文も同じです。
`section` 自体は最初の段です。
journey の木は平らで、文のブロックがないので、
文の段は、ほかの文の中での位置で決まります。
section の下のタスクは、mermaid.js の文書の書き方と同じく、
section の中に置きます。
Gantt 図も同じです。
[fixture: indentation/sections-and-tasks-nested]
[fixture: indentation/statements-before-the-first-section]
[fixture: indentation/every-statement-under-a-section]
[fixture: indentation/consecutive-sections]
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
([indentation/sections-and-tasks-nested-input.mmd](../tests/fixtures/journey/indentation/sections-and-tasks-nested-input.mmd)):

```mmd
journey
title My working day
section Go to work
Make tea: 5: Me
Go upstairs: 3: Me
section Go home
Go downstairs: 5: Me
```

出力
([indentation/sections-and-tasks-nested-output.mmd](../tests/fixtures/journey/indentation/sections-and-tasks-nested-output.mmd)):

```mmd
journey
  title My working day
  section Go to work
    Make tea: 5: Me
    Go upstairs: 3: Me
  section Go home
    Go downstairs: 5: Me
```

入力
([indentation/tab-width-4-input.mmd](../tests/fixtures/journey/indentation/tab-width-4-input.mmd)):

```mmd
journey
title T
section S
A: 5
```

出力
([indentation/tab-width-4-output.mmd](../tests/fixtures/journey/indentation/tab-width-4-output.mmd)):

```mmd
journey
    title T
    section S
        A: 5
```

### 1 行に 1 文

各文は 1 行に 1 つ置きます。
journey には文を区切るものがなく
（diagrams/journey.md、Diagram and statements）、
ヘッダーと `accDescr` ブロックの後ろには、同じ行に次の文を続けられます。
それらの後ろの文は、それぞれの行に移します。
[fixture: statements-one-per-line/header-then-title]
[fixture: statements-one-per-line/header-then-task]
[fixture: statements-one-per-line/header-then-section]
[fixture: statements-one-per-line/description-block-then-task]
[fixture: statements-one-per-line/description-blocks-adjacent]
`title`、`section`、`accTitle`、`accDescr:` は行の残りを取り、
タスクのデータも `#` までの行の残りを取ります。
`title T A: 5` はタイトルで、`A: 5 B: 3` は 1 つのタスクです
（score の部分が `5 B` です）。
その後ろには何も続きません。
[fixture: statements-one-per-line/title-takes-the-line]
[fixture: statements-one-per-line/second-task-is-data]

直前の文に接している文も、mermaid.js は同じに読むので、行を分けます。
`journey-x: 1` のヘッダーの後のタスク `-x` と、
空の説明ブロックの `}` の後のタスクが該当します。
[fixture: statements-one-per-line/header-glued-task]
[fixture: statements-one-per-line/empty-description-block-glued-task]
空の説明ブロックは、文が始まる所ならどこでも文で、何も変えず、
自分の行に置きます。
[fixture: statements-one-per-line/empty-description-block-then-task]
同じ行の 2 つの文の間のディレクティブは、後ろの文と一緒に置きます。
[fixture: statements-one-per-line/directive-after-statement]

`;` がある行は、その文を一緒に残します。
mermaid.js の行の規則は、`style`、その後の `:`、さらに後の `#` を含む行の
最後の `;` を取り除きます。
文を別の行に動かすと、
規則が `;` を無視しなくなったり、別の `;` を無視したりします。
`accDescr { style:#x }` の後の `A;B: 5` はタスク `AB` ですが、
`A;B: 5` だけの行は拒否されます。
`;` がタスクのテキストを終わらせ、どの規則にも取られないからです。
そのため、そのような行の文はその行に残し、
文の間の空白はほかと同じに整形し、`;` は書かれたまま残します。
[fixture: statements-one-per-line/ignored-semicolon-line-kept]

入力
([statements-one-per-line/description-block-then-task-input.mmd](../tests/fixtures/journey/statements-one-per-line/description-block-then-task-input.mmd)):

```mmd
journey
accDescr { d } A: 5
```

出力
([statements-one-per-line/description-block-then-task-output.mmd](../tests/fixtures/journey/statements-one-per-line/description-block-then-task-output.mmd)):

```mmd
journey
  accDescr { d }
  A: 5
```

入力
([statements-one-per-line/header-glued-task-input.mmd](../tests/fixtures/journey/statements-one-per-line/header-glued-task-input.mmd)):

```mmd
journey-x: 1
```

出力
([statements-one-per-line/header-glued-task-output.mmd](../tests/fixtures/journey/statements-one-per-line/header-glued-task-output.mmd)):

```mmd
journey
  -x: 1
```

入力
([statements-one-per-line/second-task-is-data-input.mmd](../tests/fixtures/journey/statements-one-per-line/second-task-is-data-input.mmd)):

```mmd
journey
A: 5 B: 3
```

出力
([statements-one-per-line/second-task-is-data-output.mmd](../tests/fixtures/journey/statements-one-per-line/second-task-is-data-output.mmd)):

```mmd
journey
  A: 5 B: 3
```

### 空行

連続する空行は 1 つにし、本体の先頭と末尾の空行は落とします。
他の図種と同じ規則です。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/body-edges-dropped]
コメント行の周りの空行も同じに扱います。
[fixture: blank-lines/around-comment-lines]
`section` の周りの空行は、1 つにして、隣の行と同じ段で残します。
[fixture: blank-lines/around-sections]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/journey/blank-lines/collapsed-input.mmd)):

```mmd
journey
title T



section S


A: 5
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/journey/blank-lines/collapsed-output.mmd)):

```mmd
journey
  title T

  section S

    A: 5
```

入力
([blank-lines/around-sections-input.mmd](../tests/fixtures/journey/blank-lines/around-sections-input.mmd)):

```mmd
journey
title T


section S


A: 5


section U

B: 1

```

出力
([blank-lines/around-sections-output.mmd](../tests/fixtures/journey/blank-lines/around-sections-output.mmd)):

```mmd
journey
  title T

  section S

    A: 5

  section U

    B: 1
```

### タスクのデータ

タスクは、説明、コロン、score、コロン、人々、3 つ目のコロン以降のテキストの順に
印字します。
説明は、テキストとコロンの間の空白も含めて、書かれたまま印字します。
その空白は説明の一部で Db が持つので、
`Make tea  : 5` と `Make tea: 5` は別のタスクであり、
コロンをそろえる空白も残ります。
[fixture: task-data/colon-touches-description]
[fixture: task-data/description-padding-kept]
説明には、引用符、タグ、`%`、キーワードを含められます。
[fixture: task-data/special-characters-in-description]
[fixture: task-data/keywords-inside]

score と人は、コロンの後でも `,` の後でも、空白 1 つの後に置き、
コロンと `,` は前の値に接します。
それらの周りの空白は Db に入らないので、残しません。
空白は値の前にだけ置きます。Gantt 図と同じ規則で、
mermaid.js の文書の task 行の多くがこの形です。
[fixture: task-data/colon-spacing]
[fixture: task-data/people-comma-spacing]
空の score や空の人は何も印字しないので、その前に空白を置きません。
`A: : Me` は `A:: Me` に、`A: 3: a, ,b` は `A: 3: a,, b` になります。
空の人は、mermaid.js が名前として読むので残します。
[fixture: task-data/empty-score]
[fixture: task-data/empty-people]
[fixture: task-data/no-people-no-score]

score と人は書かれたまま印字します。
人の中の空白は人の一部で、Db に入ります。
score の書き方は作者のもので、mermaid.js は数として読み、
`05` と `5` は Db が同じです。
[fixture: task-data/people-inner-whitespace-kept]
[fixture: task-data/score-forms-kept]
データの末尾の空白は落とします。
[fixture: task-data/trailing-whitespace-dropped]
データは `#` で終わり、`#` はコメントを始めます。
空白が書かれていれば前に空白 1 つを置き、接していれば接したままにします
（[コメント](#コメント)を参照）。
[fixture: task-data/hash-ends-the-data]

空白だけのデータは、空の score で人のいないタスクで、
mermaid.js はコロンの後に 1 文字を要求します。
`A: ` はタスクで、`A:` は拒否されます。
そのため、コロンの後に空白 1 文字（書かれた最初の 1 文字）を残し、
残りは落とします。
行の続きにコメントなどの文字があるときは、
空白がそれらと一緒に読まれるので、行を書かれたまま印字します。
[fixture: task-data/whitespace-only-data]
[fixture: task-data/whitespace-only-data-then-comment]
タスクの部分の間のディレクティブはその位置に残します
（[ディレクティブ](#ディレクティブ)を参照）。

入力
([task-data/people-comma-spacing-input.mmd](../tests/fixtures/journey/task-data/people-comma-spacing-input.mmd)):

```mmd
journey
A: 3: Me,You,Them
B: 3: Me , You ,  Them
C: 3: Me, You
```

出力
([task-data/people-comma-spacing-output.mmd](../tests/fixtures/journey/task-data/people-comma-spacing-output.mmd)):

```mmd
journey
  A: 3: Me, You, Them
  B: 3: Me, You, Them
  C: 3: Me, You
```

入力
([task-data/empty-score-input.mmd](../tests/fixtures/journey/task-data/empty-score-input.mmd)):

```mmd
journey
A: : Me
B:  : Me, You
```

出力
([task-data/empty-score-output.mmd](../tests/fixtures/journey/task-data/empty-score-output.mmd)):

```mmd
journey
  A:: Me
  B:: Me, You
```

入力
([task-data/description-padding-kept-input.mmd](../tests/fixtures/journey/task-data/description-padding-kept-input.mmd)):

```mmd
journey
Make tea        : 5: Me
Go upstairs      : 3: Me
Do work          : 1: Me, Cat
```

出力
([task-data/description-padding-kept-output.mmd](../tests/fixtures/journey/task-data/description-padding-kept-output.mmd)):

```mmd
journey
  Make tea        : 5: Me
  Go upstairs      : 3: Me
  Do work          : 1: Me, Cat
```

### 無視されるデータ

3 つ目のコロン以降は、mermaid.js が読まず、木はテキストとして持ちます。
コロンも含めて書かれたまま印字し、コロンは、書かれた空白によらず、
前の値に接します。
[fixture: ignored-data/third-colon-touches]
[fixture: ignored-data/text-as-written]
[fixture: ignored-data/four-colons]
空の score や空の人の後でも同じです。
[fixture: ignored-data/after-empty-people]
末尾の空白は落とします。
[fixture: ignored-data/trailing-whitespace-dropped]

入力
([ignored-data/third-colon-touches-input.mmd](../tests/fixtures/journey/ignored-data/third-colon-touches-input.mmd)):

```mmd
journey
A: 5: Me  : x
B: 5: Me:x
C: 5: Me:   x
```

出力
([ignored-data/third-colon-touches-output.mmd](../tests/fixtures/journey/ignored-data/third-colon-touches-output.mmd)):

```mmd
journey
  A: 5: Me: x
  B: 5: Me:x
  C: 5: Me:   x
```

入力
([ignored-data/text-as-written-input.mmd](../tests/fixtures/journey/ignored-data/text-as-written-input.mmd)):

```mmd
journey
A: 5: Me: x,   y : z
B: 3: a,b: c, d
```

出力
([ignored-data/text-as-written-output.mmd](../tests/fixtures/journey/ignored-data/text-as-written-output.mmd)):

```mmd
journey
  A: 5: Me: x,   y : z
  B: 3: a, b: c, d
```

### タイトルとセクション

`title` と `section` は、値を、両端の空白も含めて書かれたまま印字します
（Db が持ちます）。
キーワードの後の区切りは、書かれた文字によらず空白 1 つです。
区切りの形を 1 つにするためで、Gantt 図と同じです。
[fixture: titles-and-sections/value-whitespace-kept]
[fixture: titles-and-sections/one-space-after-keyword]
後の行に書かれた値は、キーワードの後に寄せて 1 行にします。
間にコメント行があれば、文は書かれたまま印字します
（[複数行の文](#複数行の文)を参照）。
[fixture: titles-and-sections/value-on-next-line]
[fixture: titles-and-sections/comment-line-inside-kept]
値は `:`、`%`、`%%` を文字として含み、`#` で終わります。
[fixture: titles-and-sections/special-characters-in-values]
[fixture: titles-and-sections/value-ends-at-hash]
その `#` の前の空白は値の一部で、残ります。
[fixture: titles-and-sections/whitespace-before-hash-is-the-value]
キーワードと値の間のディレクティブはその位置に残します
（[ディレクティブ](#ディレクティブ)を参照）。
[fixture: titles-and-sections/directive-between-keyword-and-value-kept]

入力
([titles-and-sections/special-characters-in-values-input.mmd](../tests/fixtures/journey/titles-and-sections/special-characters-in-values-input.mmd)):

```mmd
journey
title a: b % c %% d
section x % y
```

出力
([titles-and-sections/special-characters-in-values-output.mmd](../tests/fixtures/journey/titles-and-sections/special-characters-in-values-output.mmd)):

```mmd
journey
  title a: b % c %% d
  section x % y
```

入力
([titles-and-sections/value-on-next-line-input.mmd](../tests/fixtures/journey/titles-and-sections/value-on-next-line-input.mmd)):

```mmd
journey
title
T
section
S
```

出力
([titles-and-sections/value-on-next-line-output.mmd](../tests/fixtures/journey/titles-and-sections/value-on-next-line-output.mmd)):

```mmd
journey
  title T
  section S
```

### キーワードの大文字小文字

キーワードは書かれた大文字小文字を保ちます。
mermaid.js はどの大文字小文字でも読み、Db は同じです。
大文字小文字は強制されないので、作者が選んだものとして、書き換えません。
[fixture: keyword-case/keywords-kept]
ヘッダーの `journey` は小文字だけが検出されます。

入力
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/journey/keyword-case/keywords-kept-input.mmd)):

```mmd
journey
TITLE T
Section S
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

出力
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/journey/keyword-case/keywords-kept-output.mmd)):

```mmd
journey
  TITLE T
  Section S
    ACCTITLE: T
    AccDescr: d
    ACCDESCR { d }
```

### アクセシビリティの文

`accTitle` と `accDescr` の `:` はキーワードに接し、後ろに空白 1 つを置きます。
テキストの両端に空白は置きません。
コロンの形は Gantt 図と同じです。
[fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/text-whitespace-dropped]
テキストは `:`、`;`、`%`、`%%` を文字として含みます。
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
([accessibility-statements/text-on-next-line-joined-input.mmd](../tests/fixtures/journey/accessibility-statements/text-on-next-line-joined-input.mmd)):

```mmd
journey
accTitle:
T
accDescr:

d
```

出力
([accessibility-statements/text-on-next-line-joined-output.mmd](../tests/fixtures/journey/accessibility-statements/text-on-next-line-joined-output.mmd)):

```mmd
journey
  accTitle: T
  accDescr: d
```

入力
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/journey/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
journey
accDescr {
   a
  b
}
```

出力
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/journey/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
journey
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
[test: journey Unicode and tab interiors]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/blank-lines-inside]
ディレクティブやコメント行を持つブロックは書かれたまま印字します。
[fixture: empty-description-blocks/with-directive-or-comment-line-kept]
ヘッダーの後でも、自分の行に置きます。
[fixture: empty-description-blocks/after-header]

入力
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/journey/empty-description-blocks/touching-kept-input.mmd)):

```mmd
journey
accDescr{}
accDescr {}
accDescr{ }
```

出力
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/journey/empty-description-blocks/touching-kept-output.mmd)):

```mmd
journey
  accDescr{}
  accDescr {}
  accDescr{}
```

入力
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/journey/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
journey
accDescr {


}
```

出力
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/journey/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
journey
  accDescr {}
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、
字句解析器にとって改行が空白である所で 1 行に印字します。
`title`、`section`、`accTitle:`、`accDescr:` の後と、
`accTitle` と `accDescr` の `:` の前後が該当します。
タスクは複数行に書かれることがありません。
[fixture: multi-line-statements/value-on-next-line-joined]
コメント行やディレクティブを持つ文は、書かれたまま印字します。
コメント行はそれが立つ行の残りを取り、
ディレクティブのある行の空白は、ディレクティブと一緒に読まれるからです。
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]

入力
([multi-line-statements/value-on-next-line-joined-input.mmd](../tests/fixtures/journey/multi-line-statements/value-on-next-line-joined-input.mmd)):

```mmd
journey
title
T
section
S
accTitle:
T
```

出力
([multi-line-statements/value-on-next-line-joined-output.mmd](../tests/fixtures/journey/multi-line-statements/value-on-next-line-joined-output.mmd)):

```mmd
journey
  title T
  section S
    accTitle: T
```

入力
([multi-line-statements/comment-line-inside-kept-input.mmd](../tests/fixtures/journey/multi-line-statements/comment-line-inside-kept-input.mmd)):

```mmd
journey
title
%% c
T
accTitle:
%% d
T
```

出力
([multi-line-statements/comment-line-inside-kept-output.mmd](../tests/fixtures/journey/multi-line-statements/comment-line-inside-kept-output.mmd)):

```mmd
journey
  title
%% c
T
  accTitle:
%% d
T
```

### 複数行の値

`accDescr` ブロックの行は、中の改行と空白も含めて書かれたまま残します。
改行は Db に入りますが、行頭の空白は入らないので、残すのは選択で、
値のテキストは整形しないからです。
[fixture: multi-line-values/description-block-lines-kept]
そのようなブロックの中のコメントは、テキストの一部です。
[fixture: multi-line-values/comment-line-inside-block-kept]

入力
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/journey/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
journey
accDescr {
  a
    b
}
```

出力
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/journey/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
journey
  accDescr {
  a
    b
  }
```

### トークンの間の空白

上の規則が当てはまらない所では、文のトークンの間の空白の連続は空白 1 つにし、
接しているトークンは接したままにします。
説明ブロックの括弧が該当します。
[fixture: whitespace-between-tokens/description-block-braces]
ヘッダーの行末の空白は落とします。
[fixture: whitespace-between-tokens/trailing-whitespace-after-header]
値は整形しません（[タスクのデータ](#タスクのデータ)、
[タイトルとセクション](#タイトルとセクション)を参照）。

入力
([whitespace-between-tokens/description-block-braces-input.mmd](../tests/fixtures/journey/whitespace-between-tokens/description-block-braces-input.mmd)):

```mmd
journey
accDescr  {  d  }
accDescr{e}
accDescr {f}
```

出力
([whitespace-between-tokens/description-block-braces-output.mmd](../tests/fixtures/journey/whitespace-between-tokens/description-block-braces-output.mmd)):

```mmd
journey
  accDescr { d }
  accDescr{e}
  accDescr {f}
```

### コメント

コメントは、単位が始まる所の `#`、`%%`、`%` で始まり、行末まで続きます。
単独の行のコメントは、その次の文と同じ段に置き、
テキストと印は書かれたまま残します。
`section` の前のコメントは `section` の段、
タスクの前のコメントはタスクの段、
テキストの末尾のコメントは最後の文の段です。
[fixture: comments/lines-at-statement-level]
[fixture: comments/text-kept]
[fixture: comments/single-percent-kept]
[fixture: comments/bare-percent-lines]
[fixture: comments/levels-around-sections]
ヘッダーより前のコメント行は 1 桁目に置き、
テキストの末尾のコメント行は、改行を足して自分の行に残します。
[fixture: comments/before-header]
[fixture: comments/last-in-body]

文やヘッダーの後ろのコメントは、書かれたとおり行に残します。
空白が書かれていれば空白 1 つを置き、接していれば接したままにします。
行を分けると、`title` と `section` の後では Db が変わります
（`#` の前の空白が値の一部だからです）。
そのため、コメントは文の行に残す 1 つの規則にして、Gantt 図と同じにします。
[fixture: comments/after-header]
[fixture: comments/after-header-glued]
[fixture: comments/after-header-percent]
[fixture: comments/after-statement]
[fixture: comments/after-statement-glued]
[fixture: comments/after-statement-under-a-section]
`title` と `section` の後では、`#` の前の空白は値の一部で、残ります
（[タイトルとセクション](#タイトルとセクション)を参照）。

タイトル、セクション、タスクのデータ、アクセシビリティのテキストの中の
`%%` は、コメントではなくテキストの文字で、テキストと一緒に残します。
[fixture: comments/percent-in-values-kept]

入力
([comments/after-statement-input.mmd](../tests/fixtures/journey/comments/after-statement-input.mmd)):

```mmd
journey
A: 5 # c
B: 5: Me  #d
C: 5: Me: x # e
accDescr { d } # f
```

出力
([comments/after-statement-output.mmd](../tests/fixtures/journey/comments/after-statement-output.mmd)):

```mmd
journey
  A: 5 # c
  B: 5: Me #d
  C: 5: Me: x # e
  accDescr { d } # f
```

入力
([comments/after-header-input.mmd](../tests/fixtures/journey/comments/after-header-input.mmd)):

```mmd
journey # c
title T
```

出力
([comments/after-header-output.mmd](../tests/fixtures/journey/comments/after-header-output.mmd)):

```mmd
journey # c
  title T
```

### ディレクティブ

単独の行のディレクティブは、その次の文と同じ段に置きます。
同じ印字行の中では、両側の空白の有無を残します。
空白がある所には空白 1 つを置き、接している所は接したままにします。
[fixture: directives/kept]
[fixture: directives/levels-around-sections]
[fixture: directives/before-header]
[fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept]
[fixture: directives/whitespace-on-both-sides-collapsed]
[fixture: directives/statement-after-directive-line]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: journey/directives/split-directive-gap]

文の 2 つの単位の間のディレクティブは、
両側に書かれた空白を保ってその位置に残し、
テキストの中のディレクティブはテキストの一部です。
[fixture: directives/between-units-kept]
[fixture: directives/inside-values-kept]
[fixture: directives/over-lines-kept]
閉じられていないディレクティブはテキストの残りを取り、書かれたまま残します。
[fixture: directives/unclosed-at-end-of-text-kept]
[fixture: directives/unclosed-after-statement-kept]

入力
([directives/levels-around-sections-input.mmd](../tests/fixtures/journey/directives/levels-around-sections-input.mmd)):

```mmd
journey
%%{init: {}}%%
section S
%%{init: {}}%%
A: 5
%%{init: {}}%%
section T
```

出力
([directives/levels-around-sections-output.mmd](../tests/fixtures/journey/directives/levels-around-sections-output.mmd)):

```mmd
journey
  %%{init: {}}%%
  section S
    %%{init: {}}%%
    A: 5
  %%{init: {}}%%
  section T
```

入力
([directives/between-units-kept-input.mmd](../tests/fixtures/journey/directives/between-units-kept-input.mmd)):

```mmd
journey
A %%{init: {}}%%: 5
B:%%{init: {}}%% 5
C: 5%%{init: {}}%%: Me
```

出力
([directives/between-units-kept-output.mmd](../tests/fixtures/journey/directives/between-units-kept-output.mmd)):

```mmd
journey
  A %%{init: {}}%%: 5
  B:%%{init: {}}%% 5
  C: 5%%{init: {}}%%: Me
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
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/journey/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:   {theme:  dark}
---
journey
title T
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/journey/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { theme: dark }
---
journey
  title T
```

入力
([frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd](../tests/fixtures/journey/frontmatter-yaml/comment-after-frontmatter-before-header-input.mmd)):

```mmd
---
title: T
---
%% c
journey
title T
```

出力
([frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd](../tests/fixtures/journey/frontmatter-yaml/comment-after-frontmatter-before-header-output.mmd)):

```mmd
---
title: T
---
%% c
journey
  title T
```

### 行区切り文字

U+2028 と U+2029 は、journey の単位の間の空白であり、
テキストの文字でもあります。
文の間では、どの空白とも同じ改行として扱い、文はそれぞれの行に移ります。
文の中で、これを含む間隔は書かれたまま印字し、
説明、タイトル、セクション名、無視されるデータ、
アクセシビリティのテキストの中のものも書かれたまま残します。
例は文字列で書かれていて、`\u2028` は U+2028、`\n` は改行です。
[test: U+2028 between the header and a statement]
[test: U+2028 between a description block and a task]
[test: U+2028 inside a task description]
[test: U+2028 before the colon of a task]
[test: U+2028 before the second colon of a task]
[test: U+2028 between the people of a task]
[test: U+2028 in the ignored data of a task]
[test: U+2028 after a title keyword]
[test: U+2029 inside a title]
[test: U+2028 at the end of a section]
[test: U+2028 after the colon of accTitle]

### 空白の文字

U+00A0 と U+FEFF は、字句解析器にとって単位の間の空白であり、
テキストの文字でもあります。
字句解析器が空白 1 文字を読む所
（キーワードの後の区切りなど）には空白 1 つを置き、
タスクの score と人の周りでは空白と同じに落とし、
タスクのコロンの前では説明が保ちます。
例は文字列で書かれていて、`\u00a0` は U+00A0、`\ufeff` は U+FEFF です。
[test: U+00A0 after a title keyword]
[test: U+00A0 around the score of a task]
[test: U+00A0 around the people of a task]
[test: U+00A0 before the second colon of a task]
[test: U+00A0 before the colon of a task]
[test: U+00A0 between a description block and a task]
[test: U+FEFF before a task]

# timeline の整形規則

英語版: [timeline.md](./timeline.md)

prettier-plugin-mmd が timeline をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
timeline の period、event、title、section の名前は、両端の空白を Db に持つので、
書かれたまま印字します。
どの空白を整形するかは各規則に書きます。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
`section` の後ろ、次の `section` の前の文は、もう 1 段深く置きます。
period と、そのほかのすべての文です。
`section` 自身は 1 段目です。
timeline の木は平らで、文のまとまりを表す block を持たないので、文の段は、
ほかの文の中での位置で決まります。
これは journey と Gantt 図の規則で、section の period は、
mermaid.js の文書の書き方と同じく、 section の中に置きます。
[fixture: indentation/sections-and-periods-nested]
[fixture: indentation/statements-before-the-first-section]
[fixture: indentation/every-statement-under-a-section]
[fixture: indentation/consecutive-sections]
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、既定は空白 2 つです。
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]

入力に書かれた字下げは残しません。
行頭の空白は mermaid.js にとって何の意味も持たず、
前の period より深く書いた period も別の period です（diagrams/timeline.md、
Lexical structure）。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。
[fixture: indentation/written-indentation-dropped]
ヘッダーは、前に空白が書かれていても 1 列目に置きます。
[fixture: indentation/header-leading-whitespace]
`accDescr` ブロックの行のように、書かれたまま残すテキストの行は、列も残します。
ブロックを閉じる `}` は、
その文の段に置きます（[複数行の値](#複数行の値)を参照）。
[fixture: indentation/description-block-under-a-section]
period とその event の 2 行目以降は、
1 行目より 1 段深く置きます（[period と event](#period-と-event)を参照）。
[fixture: indentation/event-lines-under-a-section]

入力
([indentation/sections-and-periods-nested-input.mmd](../tests/fixtures/timeline/indentation/sections-and-periods-nested-input.mmd)):

```mmd
timeline
title History of Social Media
section Early years
2002 : LinkedIn
2004 : Facebook : Google
section Later
2005 : YouTube
```

出力
([indentation/sections-and-periods-nested-output.mmd](../tests/fixtures/timeline/indentation/sections-and-periods-nested-output.mmd)):

```mmd
timeline
  title History of Social Media
  section Early years
    2002 : LinkedIn
    2004 : Facebook : Google
  section Later
    2005 : YouTube
```

入力
([indentation/tab-width-4-input.mmd](../tests/fixtures/timeline/indentation/tab-width-4-input.mmd)):

```mmd
timeline
title T
section S
2002 : x
```

出力
([indentation/tab-width-4-output.mmd](../tests/fixtures/timeline/indentation/tab-width-4-output.mmd)):

```mmd
timeline
    title T
    section S
        2002 : x
```

### 1 行 1 文

各文は自分の行に置きます。
timeline では文を区切るものがなく（diagrams/timeline.md、
Diagram and statements）、ヘッダーと `accDescr` ブロックの後ろには、
同じ行に次の文が続けられます。
どちらの後ろの文も、自分の行に移します。
ヘッダーの方向は、ヘッダーの行に残します。
[fixture: statements-one-per-line/header-then-title]
[fixture: statements-one-per-line/header-then-period]
[fixture: statements-one-per-line/header-then-section]
[fixture: statements-one-per-line/header-direction-then-title]
[fixture: statements-one-per-line/description-block-then-period]
[fixture: statements-one-per-line/description-blocks-adjacent]

`title` は行の残りを取り、
period は同じ行でその後ろに続く event をすべて取ります。
`title T : e` は title で、
`a : b -- c : d` は period `a ` と 2 つの event です。
それらの後ろには、同じ行に何も続きません。
[fixture: statements-one-per-line/title-takes-the-line]
[fixture: statements-one-per-line/events-stay-with-the-period]
前の文に接している文も、mermaid.js が同じに読むので、自分の行に移します。
`timeline-x : 1` のヘッダーの後ろの period `-x ` と、
空の説明ブロックの `}` の後ろの period です。
[fixture: statements-one-per-line/header-glued-period]
[fixture: statements-one-per-line/empty-description-block-glued-period]
空の説明ブロックは何も変えない文で、文が始まる所ならどこにでも書け、
これも自分の行に置きます。
event の前に書かれたときは、
後ろの event が event の文になります（[event の文](#event-の文)を参照）。
[fixture: statements-one-per-line/empty-description-block-then-period]
[fixture: statements-one-per-line/empty-description-block-then-event]
行の上で 2 つの文の間にある指令は、後ろの文と一緒に移ります。
[fixture: statements-one-per-line/directive-after-statement]

文を自分の行に移すのは、その前の行の末尾に、
テキストの一部である空白が残らないときだけです。
section の名前は、Db で `:` の前の空白を持つので、
`section T : Google` は section `T ` と event です。
event を自分の行に移すと、section の行の末尾にその空白が残ってしまいます。
そのため 2 つは同じ行に残し、間の空白は書かれたままにします。
`section T: Google` のようにその空白がなければ、 event は自分の行に移します。
[fixture: statements-one-per-line/section-with-trailing-whitespace-keeps-the-event]
[fixture: statements-one-per-line/section-with-trailing-whitespace-keeps-the-events]
[fixture: statements-one-per-line/section-with-trailing-tab-keeps-the-event]
[fixture: statements-one-per-line/section-with-a-directive-keeps-the-event]
[fixture: statements-one-per-line/section-without-trailing-whitespace-moves-the-event]

`;` を含む行は、その行の文をまとめて残します。
mermaid.js の行の規則は、`style` と、その後ろの `:`、
さらに後ろの `#` を含む行の最後の `;` を取り除きます。
文を自分の行に移すと、その規則が `;` を無視しなくなったり、
別の `;` を無視したりします。
`accDescr { style:#x }` の後ろの `a;b : e` は period `ab ` ですが、
自分の行にある `a;b : e` は period `a;b ` です。
そのため、そのような行の文は行に残し、間の空白はほかと同じく整えて、
`;` は書かれたまま残します。
[fixture: statements-one-per-line/ignored-semicolon-line-kept]

入力
([statements-one-per-line/header-direction-then-title-input.mmd](../tests/fixtures/timeline/statements-one-per-line/header-direction-then-title-input.mmd)):

```mmd
timeline TD title T
```

出力
([statements-one-per-line/header-direction-then-title-output.mmd](../tests/fixtures/timeline/statements-one-per-line/header-direction-then-title-output.mmd)):

```mmd
timeline TD
  title T
```

入力
([statements-one-per-line/description-block-then-period-input.mmd](../tests/fixtures/timeline/statements-one-per-line/description-block-then-period-input.mmd)):

```mmd
timeline
accDescr { d } 2002 : x
```

出力
([statements-one-per-line/description-block-then-period-output.mmd](../tests/fixtures/timeline/statements-one-per-line/description-block-then-period-output.mmd)):

```mmd
timeline
  accDescr { d }
  2002 : x
```

入力
([statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-input.mmd](../tests/fixtures/timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-input.mmd)):

```mmd
timeline
section S
2004 : Facebook
section T : Google
```

出力
([statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-output.mmd](../tests/fixtures/timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event-output.mmd)):

```mmd
timeline
  section S
    2004 : Facebook
  section T : Google
```

入力
([statements-one-per-line/section-without-trailing-whitespace-moves-the-event-input.mmd](../tests/fixtures/timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event-input.mmd)):

```mmd
timeline
section S
2004 : Facebook
section T: Google
```

出力
([statements-one-per-line/section-without-trailing-whitespace-moves-the-event-output.mmd](../tests/fixtures/timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event-output.mmd)):

```mmd
timeline
  section S
    2004 : Facebook
  section T
    : Google
```

### 空行

連続する空行は 1 つにし、本体の先頭と末尾の空行は落とします。
journey と同じ規則です。 [fixture: blank-lines/collapsed]
[fixture: blank-lines/body-edges-dropped]
コメント行の周りの空行も同じに扱います。
[fixture: blank-lines/around-comment-lines]
`section` の周りの空行は、1 つにして、隣の行と同じ段に残します。
[fixture: blank-lines/around-sections]
period とその event の間の空行も同じに扱い、その中に残します。
[fixture: blank-lines/between-a-period-and-its-events]

timeline には、空行についての既知の差異がありません。
mermaid.js は、ヘッダーの後、コメントの後、
period と event の間の空行を受理するので、
受理されるように空行を落とすことはしません。

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/timeline/blank-lines/collapsed-input.mmd)):

```mmd
timeline
title T



section S


2002 : x
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/timeline/blank-lines/collapsed-output.mmd)):

```mmd
timeline
  title T

  section S

    2002 : x
```

入力
([blank-lines/between-a-period-and-its-events-input.mmd](../tests/fixtures/timeline/blank-lines/between-a-period-and-its-events-input.mmd)):

```mmd
timeline
2004 : Facebook


: Google
```

出力
([blank-lines/between-a-period-and-its-events-output.mmd](../tests/fixtures/timeline/blank-lines/between-a-period-and-its-events-output.mmd)):

```mmd
timeline
  2004 : Facebook

    : Google
```

### period と event

period と event は、テキストと `:` の間の空白も含め、書かれたまま印字します。
Db は、period の末尾の空白（`:` の前の空白）と、
event の `:` の後ろの 1 文字を除いた両端の空白を、値として持ちます。
`2004 : a` と `2004: a` は別の period で、`a :   e` の event は `  e`、
`a : e   ` の event は `e   ` です。
そのため、timeline の `:` をそろえるための空白は残し、
period に接した `:` は接したままにします。
[fixture: periods-and-events/period-whitespace-kept]
[fixture: periods-and-events/event-whitespace-kept]
[fixture: periods-and-events/whitespace-only-event]
[fixture: periods-and-events/trailing-whitespace-kept]
event の中の `:`、`#`、`%%` はテキストの文字で、
後ろに空白が続かない `:` も同じです。
[fixture: periods-and-events/colon-inside-event]
[fixture: periods-and-events/special-characters-in-events]
`;` もテキストの文字です（[1 行 1 文](#1-行-1-文)を参照）。
[fixture: periods-and-events/semicolons-in-texts-kept]
[fixture: periods-and-events/semicolon-in-a-later-line]

event のテキストは、`:` の後ろに空白 1 つを置いて続けます。
`:` の後ろの 1 文字は字句解析器が読む区切りで、どの文字でも Db に入りません。
その後ろの空白がテキストです。
区切りは、書かれた文字が何であっても空白にします。
`title` と `section` の後ろ（[title と section](#title-と-section)）と同じで、
区切りの形を 1 つにするためです。 [fixture: periods-and-events/separator-tab]

event は、書かれた行に残します。
period の行にある event はその行に、後ろの行に書かれた event や、
period だけの行の後ろの event は、後ろの行に残します。
event を行の間で動かすと、Db が変わります。
`2004 : Facebook` と `: Google` を空白 1 つで 1 行にすると、
event が `Facebook` から `Facebook ` になります。
行から event を分けると、その前の空白が行末に残ります。
[fixture: periods-and-events/events-on-the-period-line]
[fixture: periods-and-events/events-on-later-lines]
[fixture: periods-and-events/event-on-the-line-after-the-period]
[fixture: periods-and-events/events-on-both]

period とその event の 2 行目以降は、1 行目より 1 段深く置きます。
flowchart の文の 2 行目以降と同じ規則です。
mermaid.js の文書は、各 `:` を period の `:` の下にそろえますが、
それには period の幅を数える必要があり、タブや全角文字ではその幅が決まりません。
[fixture: periods-and-events/later-lines-in-a-section]
その間のコメント行と指令の行は、中に残して 2 行目以降の段に置き、
連続する空行は 1 つにします。 [fixture: periods-and-events/comment-lines-inside]
[fixture: periods-and-events/empty-lines-inside]
[fixture: periods-and-events/directive-line-inside]
period の後ろのコメントは行に残し、
前の空白は period の一部なので書かれたままです。
[fixture: periods-and-events/comment-after-period]

行に `title` か `section` だけがあるとき、後ろにテキストが続かないので、
それは period です。
その後ろに指令だけの行が続くと（間にコメント行があってもかまいません）、
その行は、mermaid.js が指令を取り除いた後に空になります。
指令の前に空白があると、その空白が title や section のテキストになり、
Db が変わります。
空行の後では、その空白は読まれません。
印字はこの 2 つを分けず、次の文までの間にある指令だけの行を、
すべて 1 列目に置きます。
規則を 2 つにしないためです。
[fixture: periods-and-events/title-word-then-directive-line]
[fixture: periods-and-events/section-word-then-directive-line]
[fixture: periods-and-events/title-word-then-directive-lines]
[fixture: periods-and-events/title-word-then-directive-line-at-the-end]
[fixture: periods-and-events/title-word-then-comment-line-then-directive-line]
[fixture: periods-and-events/title-word-then-empty-line-then-directive-line]
[fixture: periods-and-events/section-word-then-comment-line-then-directive-line]

入力
([periods-and-events/period-whitespace-kept-input.mmd](../tests/fixtures/timeline/periods-and-events/period-whitespace-kept-input.mmd)):

```mmd
timeline
2002   : LinkedIn
2004: Facebook
2005 : YouTube
```

出力
([periods-and-events/period-whitespace-kept-output.mmd](../tests/fixtures/timeline/periods-and-events/period-whitespace-kept-output.mmd)):

```mmd
timeline
  2002   : LinkedIn
  2004: Facebook
  2005 : YouTube
```

入力
([periods-and-events/events-on-both-input.mmd](../tests/fixtures/timeline/periods-and-events/events-on-both-input.mmd)):

```mmd
timeline
2004 : Facebook : Google
2005 : YouTube
: Vimeo
2006
: Zoom
```

出力
([periods-and-events/events-on-both-output.mmd](../tests/fixtures/timeline/periods-and-events/events-on-both-output.mmd)):

```mmd
timeline
  2004 : Facebook : Google
  2005 : YouTube
    : Vimeo
  2006
    : Zoom
```

入力
([periods-and-events/later-lines-in-a-section-input.mmd](../tests/fixtures/timeline/periods-and-events/later-lines-in-a-section-input.mmd)):

```mmd
timeline
title History
section Early
2002 : LinkedIn
2004 : Facebook
  : Google
         : Apple
2005 : YouTube
```

出力
([periods-and-events/later-lines-in-a-section-output.mmd](../tests/fixtures/timeline/periods-and-events/later-lines-in-a-section-output.mmd)):

```mmd
timeline
  title History
  section Early
    2002 : LinkedIn
    2004 : Facebook
      : Google
      : Apple
    2005 : YouTube
```

入力
([periods-and-events/comment-lines-inside-input.mmd](../tests/fixtures/timeline/periods-and-events/comment-lines-inside-input.mmd)):

```mmd
timeline
2004 : Facebook
# c
: Google
%% d
2005 : YouTube
```

出力
([periods-and-events/comment-lines-inside-output.mmd](../tests/fixtures/timeline/periods-and-events/comment-lines-inside-output.mmd)):

```mmd
timeline
  2004 : Facebook
    # c
    : Google
  %% d
  2005 : YouTube
```

入力
([periods-and-events/title-word-then-directive-line-input.mmd](../tests/fixtures/timeline/periods-and-events/title-word-then-directive-line-input.mmd)):

```mmd
timeline
title
%%{init: {}}%%
T
```

出力
([periods-and-events/title-word-then-directive-line-output.mmd](../tests/fixtures/timeline/periods-and-events/title-word-then-directive-line-output.mmd)):

```mmd
timeline
  title
%%{init: {}}%%
  T
```

### event の文

period でない文（title、section、accessibility の文、
空の説明ブロック）の後ろにある event は、event の文です。
mermaid.js は、その event を、間の文をまたいで、
その前の最後の period に付けます（diagrams/timeline.md、Periods and events）。
印字はそれを動かさず、書かれた場所に、自分の行で、まわりの文と同じ段に置きます。
このプロジェクトのどの印字も、文を別の文の前後へ動かしません。
title の後ろの event を読む人がどう読むかは、整形の問題ではありません。
[fixture: event-statements/after-title]
[fixture: event-statements/after-section]
[fixture: event-statements/after-acc-title]
[fixture: event-statements/after-acc-descr]
[fixture: event-statements/after-description-block]
[fixture: event-statements/after-empty-description-block]
[fixture: event-statements/in-a-section]
その前のコメント行、指令の行、空行は、ほかの文の前と同じに扱います。
[fixture: event-statements/comment-line-before]
[fixture: event-statements/directive-line-before]
[fixture: event-statements/empty-lines-before]

event の文の event は、period の event と同じに並べます。
書かれた行に残し、文の 2 行目以降は 1 行目より 1 段深く置きます。
[fixture: event-statements/several-events]
[fixture: event-statements/events-of-an-event-statement-on-the-line]

入力
([event-statements/after-title-input.mmd](../tests/fixtures/timeline/event-statements/after-title-input.mmd)):

```mmd
timeline
2004 : Facebook
title History
: Google
2005 : YouTube
```

出力
([event-statements/after-title-output.mmd](../tests/fixtures/timeline/event-statements/after-title-output.mmd)):

```mmd
timeline
  2004 : Facebook
  title History
  : Google
  2005 : YouTube
```

入力
([event-statements/several-events-input.mmd](../tests/fixtures/timeline/event-statements/several-events-input.mmd)):

```mmd
timeline
2004 : a
title T
: e1
: e2 : e3
```

出力
([event-statements/several-events-output.mmd](../tests/fixtures/timeline/event-statements/several-events-output.mmd)):

```mmd
timeline
  2004 : a
  title T
  : e1
    : e2 : e3
```

### title と section

`title` と `section` は、値を書かれたまま印字します。
両端の空白も Db が持つので残します。
キーワードの後ろの区切りは、書かれた文字が何であっても空白 1 つにします。
この形は journey と同じです。
[fixture: titles-and-sections/value-whitespace-kept]
[fixture: titles-and-sections/one-space-after-keyword]
後ろの行に書かれた値は、キーワードの後ろに寄せて 1 行にします。
間にコメント行があるときは、
その文を書かれたまま印字します（[複数行の文](#複数行の文)を参照）。
[fixture: titles-and-sections/value-on-next-line]
[fixture: titles-and-sections/comment-line-inside-kept]
値は `:`、`#`、`%`、`%%` を文字として持ちます。
ただし section の名前は `:` で終わり、その `:` は event を始めます。
[fixture: titles-and-sections/special-characters-in-values]
[fixture: titles-and-sections/section-ends-at-colon]
キーワードと値の間の指令は、その場所に残します（[指令](#指令)を参照）。
[fixture: titles-and-sections/directive-between-keyword-and-value-kept]

入力
([titles-and-sections/special-characters-in-values-input.mmd](../tests/fixtures/timeline/titles-and-sections/special-characters-in-values-input.mmd)):

```mmd
timeline
title a: b % c %% d # e
section x % y %% z # w
```

出力
([titles-and-sections/special-characters-in-values-output.mmd](../tests/fixtures/timeline/titles-and-sections/special-characters-in-values-output.mmd)):

```mmd
timeline
  title a: b % c %% d # e
  section x % y %% z # w
```

入力
([titles-and-sections/value-on-next-line-input.mmd](../tests/fixtures/timeline/titles-and-sections/value-on-next-line-input.mmd)):

```mmd
timeline
title
T
section
S
```

出力
([titles-and-sections/value-on-next-line-output.mmd](../tests/fixtures/timeline/titles-and-sections/value-on-next-line-output.mmd)):

```mmd
timeline
  title T
  section S
```

### キーワードの大文字小文字

キーワードは、書かれた大文字小文字のまま残します。
mermaid.js はどの大文字小文字でも読み、Db は同じです。
大文字小文字は強制されないので、作者が選んだものとして、書き換えません。
ヘッダーの `timeline` は、小文字のものだけが検出されます。
[fixture: keyword-case/keywords-kept]

入力
([keyword-case/keywords-kept-input.mmd](../tests/fixtures/timeline/keyword-case/keywords-kept-input.mmd)):

```mmd
timeline
TITLE T
Section S
ACCTITLE: T
AccDescr: d
ACCDESCR { d }
```

出力
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/timeline/keyword-case/keywords-kept-output.mmd)):

```mmd
timeline
  TITLE T
  Section S
    ACCTITLE: T
    AccDescr: d
    ACCDESCR { d }
```

### ヘッダーと方向

ヘッダーには、同じ行の空白の後ろに、
方向 `LR` か `TD` を書けます（大文字小文字は問いません）。
方向は、ヘッダーの行に空白 1 つの後ろに、書かれた大文字小文字のまま印字します。
Db は大文字にして読みます。
空白 1 つは、
トークンの間の空白（[トークンの間の空白](#トークンの間の空白)）と同じです。
大文字小文字は作者のものです。 [fixture: header-and-direction/direction-kept]
[fixture: header-and-direction/direction-case-kept]
[fixture: header-and-direction/spaces-before-the-direction]
2 つ目の語は period なので、自分の行に移します。
自分の行にある方向も period です。
[fixture: header-and-direction/second-word-is-a-period]
[fixture: header-and-direction/direction-on-its-own-line-is-a-period]

方向の後ろのコメントは行に残します（[コメント](#コメント)を参照）。
方向の前後の指令は、ほかと同じく、
両側に空白 1 つを残します（[指令](#指令)を参照）。
行末の空白は落とします。
[fixture: header-and-direction/comment-after-the-direction]
[fixture: header-and-direction/directive-before-the-direction]
[fixture: header-and-direction/directive-after-the-direction]
[fixture: header-and-direction/trailing-whitespace-dropped]

入力
([header-and-direction/second-word-is-a-period-input.mmd](../tests/fixtures/timeline/header-and-direction/second-word-is-a-period-input.mmd)):

```mmd
timeline TD LR
title T
```

出力
([header-and-direction/second-word-is-a-period-output.mmd](../tests/fixtures/timeline/header-and-direction/second-word-is-a-period-output.mmd)):

```mmd
timeline TD
  LR
  title T
```

入力
([header-and-direction/directive-before-the-direction-input.mmd](../tests/fixtures/timeline/header-and-direction/directive-before-the-direction-input.mmd)):

```mmd
timeline %%{init: {}}%%  TD
title T
```

出力
([header-and-direction/directive-before-the-direction-output.mmd](../tests/fixtures/timeline/header-and-direction/directive-before-the-direction-output.mmd)):

```mmd
timeline %%{init: {}}%% TD
  title T
```

### accessibility の文

`accTitle` と `accDescr` の `:` はキーワードに接し、後ろに空白 1 つを置きます。
journey と同じ形です。
テキストの両端の空白は Db が持たないので落とします。
[fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/text-whitespace-dropped]
テキストと `:` が後ろの行にあるときは、キーワードの行に寄せます。
[fixture: accessibility-statements/text-on-next-line-joined]
[fixture: accessibility-statements/keyword-and-colon-over-lines-joined]
テキストは `:`、`;`、`#`、`%`、 `%%` を文字として持ちます。
[fixture: accessibility-statements/special-characters-in-text]

テキストのある `accDescr` ブロックは、
`{` を空白 1 つの後ろに置き（書かれたとおりに、
キーワードに接していてもかまいません）、
`{` の行にあるテキストは両側に空白 1 つ、その後ろに `}` を置きます。
テキストが後ろの行から始まるときは、その行を書かれたまま残し、
`}` はその文の段に置きます（[複数行の値](#複数行の値)を参照）。
[fixture: accessibility-statements/block-text-on-opening-line]
[fixture: accessibility-statements/block-inner-whitespace-kept]
[fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]
`:` や波括弧の周りの指令は、その場所に残します。
[fixture: accessibility-statements/directive-around-colon-and-braces-kept]

入力
([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/timeline/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
timeline
accTitle   :   T
accDescr :D
accTitle:T
```

出力
([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/timeline/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
timeline
  accTitle: T
  accDescr: D
  accTitle: T
```

入力
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/timeline/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
timeline
accDescr {
   a
  b
}
```

出力
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/timeline/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
timeline
  accDescr {
   a
  b
  }
```

### 空の説明ブロック

何も変えない空のブロックは 1 つの文です。
内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
接した keyword は接したまま、 `accDescr{  }` は `accDescr{}` にします。
[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: timeline Unicode and tab interiors]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/blank-lines-inside]
指令かコメント行のあるブロックは、書かれたまま印字します。
[fixture: empty-description-blocks/with-directive-or-comment-line-kept]
ヘッダーの後ろでも、自分の行に置きます。
[fixture: empty-description-blocks/after-header]

入力
([empty-description-blocks/touching-kept-input.mmd](../tests/fixtures/timeline/empty-description-blocks/touching-kept-input.mmd)):

```mmd
timeline
accDescr{}
accDescr {}
accDescr{ }
```

出力
([empty-description-blocks/touching-kept-output.mmd](../tests/fixtures/timeline/empty-description-blocks/touching-kept-output.mmd)):

```mmd
timeline
  accDescr{}
  accDescr {}
  accDescr{}
```

入力
([empty-description-blocks/blank-lines-inside-input.mmd](../tests/fixtures/timeline/empty-description-blocks/blank-lines-inside-input.mmd)):

```mmd
timeline
accDescr {


}
```

出力
([empty-description-blocks/blank-lines-inside-output.mmd](../tests/fixtures/timeline/empty-description-blocks/blank-lines-inside-output.mmd)):

```mmd
timeline
  accDescr {}
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、字句解析器が改行を空白として読む所で、
1 行にして印字します。
`title`、`section`、`accTitle:`、`accDescr:` の後ろ、
`accTitle` と `accDescr` の `:` の前後、そして event の `:` の後ろです。
event の `:` の後ろの改行は、字句解析器が読む区切りの空白 1 文字です。
テキストは `:` の行に移り、行頭の空白は event の一部としてそのまま残ります。
[fixture: multi-line-statements/value-on-next-line-joined]
[fixture: multi-line-statements/event-text-on-next-line-keeps-its-whitespace]
period と event は、後ろの行の行頭に `:` を書く別の形で複数行に書け、
その改行は残します（[period と event](#period-と-event)を参照）。

連結する改行にコメント行か指令がある文は、書かれたまま印字します。
コメント行はその行の残りを取り、
指令のある行の空白は指令と一緒に読まれるからです。
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
event の `:` の後ろにある、字下げされた指令だけの行は、
event の始まりの空白です。
そのため event は `:` の行に、その空白と、後ろの指令とともに印字します。
[fixture: multi-line-statements/directive-line-after-the-colon-is-the-text]
そのような文に `;` があるときも、書かれたまま残します。
連結した行を、mermaid.js の行の規則が、
別に読むことがあるからです（[1 行 1 文](#1-行-1-文)を参照）。
[fixture: multi-line-statements/text-on-next-line-with-semicolon-kept]

入力
([multi-line-statements/value-on-next-line-joined-input.mmd](../tests/fixtures/timeline/multi-line-statements/value-on-next-line-joined-input.mmd)):

```mmd
timeline
title
T
section
S
accTitle:
T
a :
e
b : f :
g
```

出力
([multi-line-statements/value-on-next-line-joined-output.mmd](../tests/fixtures/timeline/multi-line-statements/value-on-next-line-joined-output.mmd)):

```mmd
timeline
  title T
  section S
    accTitle: T
    a : e
    b : f : g
```

入力
([multi-line-statements/comment-line-inside-kept-input.mmd](../tests/fixtures/timeline/multi-line-statements/comment-line-inside-kept-input.mmd)):

```mmd
timeline
title
%% c
T
accTitle:
%% d
T
a :
%% e
  f
```

出力
([multi-line-statements/comment-line-inside-kept-output.mmd](../tests/fixtures/timeline/multi-line-statements/comment-line-inside-kept-output.mmd)):

```mmd
timeline
  title
%% c
T
  accTitle:
%% d
T
  a :
%% e
  f
```

### 複数行の値

`accDescr` ブロックの行は、改行と中の空白も含めて書かれたまま残します。
改行は Db に入りますが、行頭の空白は入らないので、残すのは選択で、
値のテキストは整形しないからです。
[fixture: multi-line-values/description-block-lines-kept]
このようなブロックの中のコメントは、テキストの一部です。
[fixture: multi-line-values/comment-line-inside-block-kept]

入力
([multi-line-values/description-block-lines-kept-input.mmd](../tests/fixtures/timeline/multi-line-values/description-block-lines-kept-input.mmd)):

```mmd
timeline
accDescr {
  a
    b
}
```

出力
([multi-line-values/description-block-lines-kept-output.mmd](../tests/fixtures/timeline/multi-line-values/description-block-lines-kept-output.mmd)):

```mmd
timeline
  accDescr {
  a
    b
  }
```

### トークンの間の空白

上のどの規則も当てはまらないところでは、
文のトークンの間の空白の並びを空白 1 つにし、
接しているトークンは接したままにします。
説明ブロックの波括弧がその例です。
[fixture: whitespace-between-tokens/description-block-braces]
ヘッダーの行末の空白は落とします。
[fixture: whitespace-between-tokens/trailing-whitespace-after-header]
値は整形しません。
[period と event](#period-と-event)と
[title と section](#title-と-section)を参照してください。

入力
([whitespace-between-tokens/description-block-braces-input.mmd](../tests/fixtures/timeline/whitespace-between-tokens/description-block-braces-input.mmd)):

```mmd
timeline
accDescr  {  d  }
accDescr{e}
accDescr {f}
```

出力
([whitespace-between-tokens/description-block-braces-output.mmd](../tests/fixtures/timeline/whitespace-between-tokens/description-block-braces-output.mmd)):

```mmd
timeline
  accDescr { d }
  accDescr{e}
  accDescr {f}
```

### コメント

コメントは、単位が始まる所の `#`、`%%`、`%` で始まり、行末まで続きます。
単独の行にあるコメントは、後ろの文と同じ段に置き、
テキストと印は書かれたままです。
`section` の前のコメントはその段に、
period の前のコメントは period の段に置きます。
テキストの末尾にあるときは、最後の文の段に置きます。
これらは journey と同じ規則です。 [fixture: comments/lines-at-statement-level]
[fixture: comments/text-kept] [fixture: comments/single-percent-kept]
[fixture: comments/bare-percent-lines]
[fixture: comments/levels-around-sections]
ヘッダーの前のコメント行は 1 列目に置き、
テキストの末尾にあるものは自分の行に残して、改行を足します。
[fixture: comments/before-header] [fixture: comments/last-in-body]

ヘッダーや方向の後ろ、accessibility ブロックの `}` の後ろ、
period の後ろのコメントは、行に書かれたまま残します。
空白が書かれていれば前に空白 1 つを置き、接していれば接したままにします。
period の後ろでは、`#` の前の空白は period の一部なので、
書かれたままです（[period と event](#period-と-event)を参照）。
[fixture: comments/after-header] [fixture: comments/after-header-glued]
[fixture: comments/after-header-percent] [fixture: comments/after-period]
[fixture: comments/after-description-block]
[fixture: comments/after-statement-under-a-section]

title、section、event、accessibility のテキストの中の `#` と `%%` は、
コメントではなくテキストの文字で、一緒に残します。
[fixture: comments/hash-and-percent-in-texts-kept]

入力
([comments/after-period-input.mmd](../tests/fixtures/timeline/comments/after-period-input.mmd)):

```mmd
timeline
a # c
b  #d
e# f
```

出力
([comments/after-period-output.mmd](../tests/fixtures/timeline/comments/after-period-output.mmd)):

```mmd
timeline
  a # c
  b  #d
  e# f
```

入力
([comments/after-header-input.mmd](../tests/fixtures/timeline/comments/after-header-input.mmd)):

```mmd
timeline # c
title T
```

出力
([comments/after-header-output.mmd](../tests/fixtures/timeline/comments/after-header-output.mmd)):

```mmd
timeline # c
  title T
```

入力
([comments/bare-percent-lines-input.mmd](../tests/fixtures/timeline/comments/bare-percent-lines-input.mmd)):

```mmd
timeline
%%
   %%
title T
```

出力
([comments/bare-percent-lines-output.mmd](../tests/fixtures/timeline/comments/bare-percent-lines-output.mmd)):

```mmd
timeline
  %%
  %%
  title T
```

### 指令

単独の行にある指令は、後ろの文と同じ段に置きます。
同じ印字行の中では、両側に空白が書かれているかを残します。
空白があればそこに空白 1 つを置き、トークンに接していれば接したままにします。
journey と同じ規則です。 [fixture: directives/kept]
[fixture: directives/levels-around-sections] [fixture: directives/before-header]
[fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept]
[fixture: directives/whitespace-on-both-sides-collapsed]
[fixture: directives/statement-after-directive-line]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: timeline/directives/whitespace-on-both-sides-collapsed]

文の 2 つの単位の間の指令は、両側に書かれた空白とともにその場所に残します。
テキストの中の指令は、テキストの一部です。
[fixture: directives/between-units-kept]
[fixture: directives/inside-values-kept] [fixture: directives/over-lines-kept]
閉じていない指令はテキストの残りを取り、書かれたまま残します。
[fixture: directives/unclosed-at-end-of-text-kept]
[fixture: directives/unclosed-after-statement-kept]

入力
([directives/levels-around-sections-input.mmd](../tests/fixtures/timeline/directives/levels-around-sections-input.mmd)):

```mmd
timeline
%%{init: {}}%%
section S
%%{init: {}}%%
a : e
%%{init: {}}%%
section T
```

出力
([directives/levels-around-sections-output.mmd](../tests/fixtures/timeline/directives/levels-around-sections-output.mmd)):

```mmd
timeline
  %%{init: {}}%%
  section S
    %%{init: {}}%%
    a : e
  %%{init: {}}%%
  section T
```

入力
([directives/between-units-kept-input.mmd](../tests/fixtures/timeline/directives/between-units-kept-input.mmd)):

```mmd
timeline
a %%{init: {}}%%: e
b:%%{init: {}}%% e
c : e%%{init: {}}%%: f
```

出力
([directives/between-units-kept-output.mmd](../tests/fixtures/timeline/directives/between-units-kept-output.mmd)):

```mmd
timeline
  a %%{init: {}}%%: e
  b:%%{init: {}}%% e
  c : e%%{init: {}}%%: f
```

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整え、`---` の行は、
行末の空白とタブも含め、書かれたまま残します。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
Prettier が読めない YAML は、書かれたまま残します。
[fixture: frontmatter-yaml/malformed-kept]
フロントマターとヘッダーの間のコメント行は残します。
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]
フロントマターの `title` は Db の timeline の title ではなく、
それについて何も足さず、取り除きません。
[fixture: frontmatter-yaml/title-is-not-the-title]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/timeline/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:   {theme:  dark}
---
timeline
title T
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/timeline/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { theme: dark }
---
timeline
  title T
```

入力
([frontmatter-yaml/title-is-not-the-title-input.mmd](../tests/fixtures/timeline/frontmatter-yaml/title-is-not-the-title-input.mmd)):

```mmd
---
title: T
---
timeline
a : e
```

出力
([frontmatter-yaml/title-is-not-the-title-output.mmd](../tests/fixtures/timeline/frontmatter-yaml/title-is-not-the-title-output.mmd)):

```mmd
---
title: T
---
timeline
  a : e
```

### 行区切り文字

U+2028 と U+2029 は、timeline の単位の間では空白で、テキストの中では文字です。
文の間では、ほかの空白と同じく改行として扱い、文を自分の行に移します。
文の中の隙間にあるものは書かれたまま印字し、テキストも同じです。
period、event、title、section の名前、accessibility のテキストは、
それを残します。
例は文字列で書き、`\u2028` は U+2028、 `\n` は改行です。
[test: U+2028 between the header and a statement]
[test: U+2028 between the header and a period]
[test: U+2028 between a description block and a period]
[test: U+2028 inside a period] [test: U+2028 before the colon of an event]
[test: U+2028 inside an event]
[test: U+2028 before the second colon of an event]
[test: U+2028 after the colon of an event] [test: U+2028 after a title keyword]
[test: U+2029 inside a title] [test: U+2028 at the end of a section name]
[test: U+2028 after the colon of an accessibility title]
[test: U+2028 between the header and a direction]

### 空白文字

U+00A0、U+3000、U+FEFF は、字句解析器にとって空白です。
`title` の後ろや event の `:` の後ろのように、規則が空白 1 文字を読む所では、
その代わりに空白を印字します。
文の間と文の前では落とします。
テキストの中と、period の `:` の前の空白では、テキストの文字なので残します。
例は文字列で書き、`\u00a0` は U+00A0、`\u3000` は U+3000、
`\ufeff` は U+FEFF です。 [test: U+00A0 as the separator after a title keyword]
[test: U+00A0 as the separator after the colon of an event]
[test: U+00A0 after the separator of an event]
[test: U+00A0 before the colon of a period]
[test: U+00A0 at the end of an event]
[test: U+00A0 between the header and a direction]
[test: U+00A0 after a description block]
[test: U+3000 in the indentation before a period]
[test: U+3000 between two events] [test: U+FEFF between statements]
[test: U+00A0 inside a section name]

# state 図の整形規則

英語版: [state.md](./state.md)

prettier-plugin-mmd が state 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
flowchart と同じ規則はそう書き、
理由は [flowchart の整形規則](./flowchart.ja.md) にあります。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### 字下げ

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
複合状態の文は、それを開く行より 1 段深く置き、
その `}` は、その行と同じ段に、行に単独で置きます。
[fixture: indentation/composite-states]
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。
[fixture: indentation/use-tabs]
[fixture: indentation/tab-width-4]
入力に書かれた字下げは保ちません。
文の行頭の空白は、Mermaid による図の解釈に影響しないためです。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。
[fixture: indentation/written-tabs-dropped]

入力
([indentation/composite-states-input.mmd](../tests/fixtures/state/indentation/composite-states-input.mmd)):

```mmd
stateDiagram-v2
[*] --> Active
state Active {
[*] --> Working
        state Working {
Step1 --> Step2
}
}
```

出力
([indentation/composite-states-output.mmd](../tests/fixtures/state/indentation/composite-states-output.mmd)):

```mmd
stateDiagram-v2
  [*] --> Active
  state Active {
    [*] --> Working
    state Working {
      Step1 --> Step2
    }
  }
```

### 複合状態

複合状態と、本体を持つ別名の定義の `{` は、空白 1 つの後に、名前の行に置きます。
次の行に書かれた `{` は、その行に移します。
`{` の前の空白 1 つは class 図と同じです。
[fixture: composite-states/split]
[fixture: composite-states/brace-after-one-space]
[fixture: composite-states/alias-brace-on-next-line]
[fixture: composite-states/directive-before-body]
[fixture: multi-line-statements/brace-after-comment-line-kept]
[fixture: multi-line-statements/brace-after-directive-kept]
`state A { B --> C }` のように 1 行に書かれた本体は行に分け、
区切りの `--` は、周りの文と同じ段に、行に単独で置きます。
[fixture: composite-states/split]
[fixture: composite-states/split-several-statements]
[fixture: composite-states/split-nested]
[fixture: composite-states/split-alias-body]
[fixture: composite-states/divider-on-own-line]
[fixture: composite-states/split-directive-in-body]

入力
([composite-states/split-input.mmd](../tests/fixtures/state/composite-states/split-input.mmd)):

```mmd
stateDiagram-v2
state A { B --> C }
state D
{
E
}
state F { G -- H }
```

出力
([composite-states/split-output.mmd](../tests/fixtures/state/composite-states/split-output.mmd)):

```mmd
stateDiagram-v2
  state A {
    B --> C
  }
  state D {
    E
  }
  state F {
    G
    --
    H
  }
```

括弧の間に空白しかない空の本体は、どう書かれていても、
class 図と同じく `{ }` と印字します。
[fixture: composite-states/empty-unified]
[fixture: composite-states/empty-unified-lines]

入力
([composite-states/empty-unified-input.mmd](../tests/fixtures/state/composite-states/empty-unified-input.mmd)):

```mmd
stateDiagram-v2
state A {}
state B {   }
state C {
}
state "d" as E {}
```

出力
([composite-states/empty-unified-output.mmd](../tests/fixtures/state/composite-states/empty-unified-output.mmd)):

```mmd
stateDiagram-v2
  state A { }
  state B { }
  state C { }
  state "d" as E { }
```

`{` の直前の `%%` は、`{` まで書かれたまま残します。
`state X` の次の行の `%%{}` は、
mermaid.js が読まない `%%` を持つ X の本体を開きます。
一方、1 行の `state X %%{}` は、X と、空の本体を持つ複合状態 `%%` です。
また、`%%` の後に空白があるとコメントになります。
[fixture: composite-states/percent-before-body-kept]
[fixture: composite-states/percent-space-brace-comment]
`{` の前の空の説明ブロックも、書かれたまま残します。
`state "d" as A` の次の行の `accDescr {} {` では id は `A` ですが、
1 行に書くと id は `A accDescr {}` になり、
本体を mermaid.js は拒否するからです。
[fixture: composite-states/empty-block-before-body-kept]
ディレクティブだけの本体は、`{` の行に書かれていればその行に残します
（`state X { %%{init: {}}%% }`）。
コメントは単独の行に置くので、コメントだけの本体は本体として印字します。
[fixture: composite-states/empty-body-directive-and-comment]

入力
([composite-states/percent-before-body-kept-input.mmd](../tests/fixtures/state/composite-states/percent-before-body-kept-input.mmd)):

```mmd
stateDiagram-v2
state X
%%{}
state Y %%{}
```

出力
([composite-states/percent-before-body-kept-output.mmd](../tests/fixtures/state/composite-states/percent-before-body-kept-output.mmd)):

```mmd
stateDiagram-v2
  state X
%%{}
  state Y %%{}
```

入力
([composite-states/empty-block-before-body-kept-input.mmd](../tests/fixtures/state/composite-states/empty-block-before-body-kept-input.mmd)):

```mmd
stateDiagram-v2
state "d" as A
  accDescr {} {
B
}
state X ""
accDescr {}{
C
}
```

出力
([composite-states/empty-block-before-body-kept-output.mmd](../tests/fixtures/state/composite-states/empty-block-before-body-kept-output.mmd)):

```mmd
stateDiagram-v2
  state "d" as A
  accDescr {} {
    B
  }
  state X ""
accDescr {}{
    C
  }
```

`state` の名前の後に続く文は、`{` を含むときは、書かれた行のまま残します。
状態の文脈は、名前、その後の改行、次の行の `{` までを、
`{` の前の 2 つの名前として読み、
mermaid.js はそれを拒否するからです。
`state foo` に `state B {` の行が続くと拒否されますが、
`state B` に `{` の行が続くと受理されます。
そのため、`{` はその名前の行に移さず、
id を次の行に書いたノートの行も、書かれたまま残します。
[fixture: composite-states/brace-after-state-name-kept]
ディレクティブやコメントの中の `{` は本体ではないので、
そのような `{` だけを含む文は、ほかと同じように整形します。
[fixture: statements-one-per-line/directive-after-state-name-formatted]
[fixture: statements-one-per-line/comment-brace-after-state-name-formatted]

入力
([composite-states/brace-after-state-name-kept-input.mmd](../tests/fixtures/state/composite-states/brace-after-state-name-kept-input.mmd)):

```mmd
stateDiagram-v2
state foo
state B
{
X
}
state bar
note "x" as
accDescr {}
 N1
```

出力
([composite-states/brace-after-state-name-kept-output.mmd](../tests/fixtures/state/composite-states/brace-after-state-name-kept-output.mmd)):

```mmd
stateDiagram-v2
  state foo
  state B
{
    X
  }
  state bar
  note "x" as
accDescr {}
  N1
```

### 1 行に 1 文

各文は 1 行に 1 つ置きます。
1 行に 2 つの文があると読みにくく、ほかの図種も同じです。
state 図には文を区切るものがなく、
`A --> B C --> D` のように 1 行に書かれた文は、それぞれの行に移します。
click 文の後の空の説明ブロックも同じです。
[corpus fixture: state/gram-click-after-empty-description-block]
[corpus fixture: state/gram-click-empty-description-block-after]
[fixture: statements-one-per-line/split]
[fixture: statements-one-per-line/states]
[fixture: statements-one-per-line/split-then-comment]
[fixture: statements-one-per-line/split-with-directive-between]
`state` の後の名前は、`state` の行に残します。
`state a b` は 2 つの文で、`b` を行に単独で置くと状態 b を足しますが、
`state a b` は足さないからです。
[corpus fixture: state/lex-state-without-body]
`state x "" y` と `state z ""` の、mermaid.js が読まない `""` も同じです。
[fixture: statements-one-per-line/state-names-kept]
`;` を含む行は、flowchart と同じく、その行の文を残します
（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
state 図では、`;` は id の文字です。
[fixture: statements-one-per-line/line-with-semicolon-kept]
[fixture: statements-one-per-line/line-with-ignored-semicolon-kept]
そのような行にある複合状態の `}` が、行の上で後ろに文を従えているときは、
`}` を行に残します。
単独の行に移すと、文が `;` のない行に残ってしまうからです。
[fixture: statements-one-per-line/line-with-semicolon-closing-brace-kept]

入力
([statements-one-per-line/split-input.mmd](../tests/fixtures/state/statements-one-per-line/split-input.mmd)):

```mmd
stateDiagram-v2
A --> B C --> D
[*]x
A
click A href "https://example.com" accDescr {}
```

出力
([statements-one-per-line/split-output.mmd](../tests/fixtures/state/statements-one-per-line/split-output.mmd)):

```mmd
stateDiagram-v2
  A --> B
  C --> D
  [*]
  x
  A
  click A href "https://example.com"
  accDescr {}
```

入力
([statements-one-per-line/state-names-kept-input.mmd](../tests/fixtures/state/statements-one-per-line/state-names-kept-input.mmd)):

```mmd
stateDiagram-v2
state a b
state x "" y
state z ""
```

出力
([statements-one-per-line/state-names-kept-output.mmd](../tests/fixtures/state/statements-one-per-line/state-names-kept-output.mmd)):

```mmd
stateDiagram-v2
  state a b
  state x "" y
  state z ""
```

### 空行

flowchart と同じです。
空行の連続は 1 つにし、本体の先頭と末尾の空行は取り除きます。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/end-of-text-dropped]
[fixture: blank-lines/around-comments-and-directives]
[fixture: blank-lines/whitespace-only-lines]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/state/blank-lines/collapsed-input.mmd)):

```mmd
stateDiagram-v2


A --> B



state C {

D


E

}
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/state/blank-lines/collapsed-output.mmd)):

```mmd
stateDiagram-v2
  A --> B

  state C {
    D

    E
  }
```

### トークンの間の空白

行の中で、2 つのトークンの間の空白とタブの連続は空白 1 つにし、
接しているトークンは接したまま残します。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]
[fixture: whitespace-between-tokens/touching-class-kept]
flowchart と同じです
（[トークンの間の空白](./flowchart.ja.md#トークンの間の空白)を参照）。
ただし、別名の定義の語と擬似状態の印は、空白 1 つを置きます
（[別名](#別名)と[擬似状態](#擬似状態)を参照）。
`:::`、mermaid.js が読まない `""`、
スタイルや class 文の `,` も同じです。
状態に結び付けない独立したノート（`note "..." as ...`）の引用符は、
書かれたまま残します。
[fixture: whitespace-between-tokens/comma-kept]
[fixture: whitespace-between-tokens/floating-note-quotes-kept]
`""` の前に空白が書かれているかどうかは保ちます。
`state x"" {` は複合状態 `x""` で、`state x "" {` は複合状態 `x` だからです。
[fixture: whitespace-between-tokens/quotes-before-brace-kept]
キーワードは、書かれた大文字小文字のまま残します。
mermaid.js は大文字小文字にかかわらず読み、
`Left Of` のようなノートの位置は、書かれたまま図に入るからです。
[fixture: whitespace-between-tokens/keyword-case-kept]
[fixture: whitespace-between-tokens/keyword-case-more-kept]

入力
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/state/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
stateDiagram-v2
A   :::   highlight
state   f1   <<fork>>
state  ""   x
classDef  c   fill:red ,  stroke:blue
class   A,B   c
scale   350   width
hide empty description
```

出力
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/state/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
stateDiagram-v2
  A ::: highlight
  state f1 <<fork>>
  state "" x
  classDef c fill:red , stroke:blue
  class A,B c
  scale 350 width
  hide empty description
```

入力
([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/state/whitespace-between-tokens/keyword-case-kept-input.mmd)):

```mmd
stateDiagram-v2
STATE A {
B
}
Note Left Of A : x
HIDE EMPTY DESCRIPTION
```

出力
([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/state/whitespace-between-tokens/keyword-case-kept-output.mmd)):

```mmd
stateDiagram-v2
  STATE A {
    B
  }
  Note Left Of A : x
  HIDE EMPTY DESCRIPTION
```

### 矢印の前後の空白

遷移の矢印の前後には、空白を 1 つずつ置きます。
`A-->B` は `A --> B` になります。
[fixture: arrow-spacing/spaced]
[fixture: arrow-spacing/tabs-around-arrow]

入力
([arrow-spacing/spaced-input.mmd](../tests/fixtures/state/arrow-spacing/spaced-input.mmd)):

```mmd
stateDiagram-v2
[*]-->A
A-->B
B  -->   [*]
```

出力
([arrow-spacing/spaced-output.mmd](../tests/fixtures/state/arrow-spacing/spaced-output.mmd)):

```mmd
stateDiagram-v2
  [*] --> A
  A --> B
  B --> [*]
```

`scale`、`classDef`、`class`、`style`、`state`、`note`、`stateDiagram` の語は、
大文字小文字によらず、後に空白が続くときだけキーワードで、ほかでは id です。
これらのキーワードと同じ名前の id からの遷移と、
`:::` の後のクラスがその名前の状態からの遷移は、
`scale-->B` のように、矢印の両側を接したまま残します。
`scale -->B` は scale 文の始まりになるからです。
[fixture: arrow-spacing/touching-before-keyword-kept]
[fixture: arrow-spacing/other-keyword-ids-touching-kept]
[fixture: arrow-spacing/label-after-keyword-id-spaced]
その id の後の説明も、`:` を id に接したまま残します。

入力
([arrow-spacing/touching-before-keyword-kept-input.mmd](../tests/fixtures/state/arrow-spacing/touching-before-keyword-kept-input.mmd)):

```mmd
stateDiagram-v2
scale-->B
A-->style:waiting
style:waiting
A:::state-->B
```

出力
([arrow-spacing/touching-before-keyword-kept-output.mmd](../tests/fixtures/state/arrow-spacing/touching-before-keyword-kept-output.mmd)):

```mmd
stateDiagram-v2
  scale-->B
  A --> style: waiting
  style: waiting
  A:::state-->B
```

### 説明とラベル

`accTitle` と `accDescr` の後の `:` は、キーワードに接し、
後に空白を 1 つ置きます。
`accTitle  :  t` は `accTitle: t` になります。
[fixture: descriptions-and-labels/acc-text-kept]
説明と遷移のラベルの `:` の両側には、
mermaid.js の公式ドキュメントの主な例に合わせて、空白を 1 つずつ置きます。
`A-->B:submit` は `A --> B : submit` になります。
[fixture: descriptions-and-labels/spaced]
キーワードと同じつづりのクラスの後の説明の `:` は、接したまま残します。
`A:::style:x` は `A:::style: x` になります。
`:` の前に空白があると、キーワードが文を始めるからです。
[fixture: descriptions-and-labels/class-named-style-then-description-kept]
テキストは書かれたまま残します。
[fixture: descriptions-and-labels/text-kept]
空白だけの説明は、`:` の後の空白を残します。
`A : ` は説明を与えませんが、`A :` は拒否されるからです。
[corpus fixture: state/gram-description-blank]
[corpus fixture: state/gram-description-colon-only]
[fixture: descriptions-and-labels/blank-kept]
`:` で終わる説明やラベルも、その後の空白を残します。
`A : x: ` は受理されますが、
説明は `:` で終われないので `A : x:` は拒否されるからです。
[fixture: descriptions-and-labels/ending-colon-kept]
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"stateDiagram-v2\nA : \n"` は `"stateDiagram-v2\n  A : \n"` と印字し、
`"stateDiagram-v2\nA : x: \nA-->B:y:  \n"` は
`"stateDiagram-v2\n  A : x: \n  A --> B : y:  \n"` と印字します
（fixture は[フォルダー](../tests/fixtures/state/descriptions-and-labels)の
`blank-kept` と `ending-colon-kept` です）。

入力
([descriptions-and-labels/spaced-input.mmd](../tests/fixtures/state/descriptions-and-labels/spaced-input.mmd)):

```mmd
stateDiagram-v2
A:waiting
A-->B:submit
B --> C :  approved
```

出力
([descriptions-and-labels/spaced-output.mmd](../tests/fixtures/state/descriptions-and-labels/spaced-output.mmd)):

```mmd
stateDiagram-v2
  A : waiting
  A --> B : submit
  B --> C : approved
```

`;` を含む行では、class 図と同じく、
`:` の後に空白が書かれているかどうかを保ちます
（[ラベル](./class.ja.md#ラベル)を参照）。
mermaid.js の行単位の規則は、`:` の直後から `#` までのテキストを読むからです。
[fixture: descriptions-and-labels/semicolon-line-kept]
[fixture: descriptions-and-labels/semicolon-line-space-after-colon-kept]

入力
([descriptions-and-labels/semicolon-line-kept-input.mmd](../tests/fixtures/state/descriptions-and-labels/semicolon-line-kept-input.mmd)):

```mmd
stateDiagram-v2
styleA :#f00;
```

出力
([descriptions-and-labels/semicolon-line-kept-output.mmd](../tests/fixtures/state/descriptions-and-labels/semicolon-line-kept-output.mmd)):

```mmd
stateDiagram-v2
  styleA :#f00;
```

### ノート

1 行のノートの id の後、つまり `:` と本文は、書かれたまま残します。
mermaid.js は本文を id の直後から読み、最初の 2 文字を除くからです。
`note left of A:hi` の本文は `i` で、
`note right of A  : two spaces` の本文は `: two spaces` です。
[fixture: notes/kept]
id の前の空白は空白 1 つにします。
`note left of%%x A` のように位置の直後にある、mermaid.js が読まないテキストは、
位置に接したまま残します。
複数行のノートの本文は、
id の後の改行から `end note` の行まで書かれたまま残します。
行の段は最初の行も含めて残し、両端の空行や空白だけの行も残します。
`end note` はノートと同じ段に置きます。
ノートの行の id の後の空白は落とします。
その行のコメントやディレクティブの後の空白は、書かれたまま残します。
[fixture: notes/over-lines]
[fixture: notes/over-lines-first-line-column-kept]
[fixture: notes/over-lines-text-ends-kept]
[fixture: notes/over-lines-directive-on-header-line]
[fixture: notes/over-lines-end-note-indentation-set]
[fixture: notes/over-lines-in-composite]
[fixture: notes/over-lines-empty-lines-kept]
本文のない 1 行のノートは、説明と同じく、`:` の後の空白を残します。
`note left of A : ` は受理され、`note left of A :` は拒否されます。
`:` の前に空白が 2 つあり、後ろに何もないノートも同じです。
その本文は `:` だけです。
[fixture: notes/blank-text-kept]
独立したノートの引用符は書かれたまま残します。
`note ""floating" as N` の本文は `floating` です。
[fixture: notes/over-lines]

入力 ([notes/kept-input.mmd](../tests/fixtures/state/notes/kept-input.mmd)):

```mmd
stateDiagram-v2
A
note left of A:hi
note right of A  : two spaces
note left of%%x   A : t
note left of    A : x
```

出力 ([notes/kept-output.mmd](../tests/fixtures/state/notes/kept-output.mmd)):

```mmd
stateDiagram-v2
  A
  note left of A:hi
  note right of A  : two spaces
  note left of%%x A : t
  note left of A : x
```

入力
([notes/over-lines-input.mmd](../tests/fixtures/state/notes/over-lines-input.mmd)):

```mmd
stateDiagram-v2
A
note right of A
  first line
    second line
      end note
note ""floating" as N
```

出力
([notes/over-lines-output.mmd](../tests/fixtures/state/notes/over-lines-output.mmd)):

```mmd
stateDiagram-v2
  A
  note right of A
  first line
    second line
  end note
  note ""floating" as N
```

### 別名

別名の定義の文字列、`as`、id の間は、接して書かれていても、空白 1 つにします。
mermaid.js は `"d"as A` を `"d" as A` と同じに読み Db が同じなので、
文の語を 1 つの形で離します（`asA` は `as` ではありません）。
mermaid.js は `"d"as A` を `"d" as A` と同じに読むからです。
[fixture: aliases/second-description-kept]
[fixture: aliases/tabs-between-parts]
[fixture: aliases/id-kept]
文字列の前後の、mermaid.js が読まない `""` も、同じように離します。
`asA` は `as` ではなく、拒否されます。
2 つ目の説明、つまり `:` の後のテキストは、書かれたまま残します。
mermaid.js は、それを両端の空白ごと読むので、
`:short` と `: short` は違う説明になるからです。
[corpus fixture: state/db-alias-colon-spaces-second]
[fixture: aliases/second-description-kept]
[fixture: aliases/second-description-trailing-whitespace-kept]
`:` の前の空白は空白 1 つにします。

入力
([aliases/second-description-kept-input.mmd](../tests/fixtures/state/aliases/second-description-kept-input.mmd)):

```mmd
stateDiagram-v2
state "Long name"as A:short
state "d"  as   B :  two spaces
state ""  "y"""as C
state "d"as D{
E
}
state "d" as F
```

出力
([aliases/second-description-kept-output.mmd](../tests/fixtures/state/aliases/second-description-kept-output.mmd)):

```mmd
stateDiagram-v2
  state "Long name" as A :short
  state "d" as B :  two spaces
  state "" "y" "" as C
  state "d" as D {
    E
  }
  state "d" as F
```

### 擬似状態

擬似状態の印は、`<<fork>>`、`<<join>>`、`<<choice>>` と、
`[[ ]]` で書いた同じ語です。
その前には、名前に接して書かれていても、空白を 1 つ置きます。
mermaid.js は名前を末尾の空白を除いて読むので、
`state f1<<fork>>` は `state f1 <<fork>>` と同じに読まれ、Db が同じだからです。
別名の定義の語と同じく、印を名前から 1 つの形で離します。
[corpus fixture: state/lex-fork-spaced-id]
[corpus fixture: state/lex-choice-square-brackets]
[fixture: pseudostates/mark-spaced]
[fixture: pseudostates/all-marks-spaced]

入力
([pseudostates/mark-spaced-input.mmd](../tests/fixtures/state/pseudostates/mark-spaced-input.mmd)):

```mmd
stateDiagram-v2
state f1<<fork>>
state   c   [[choice]]
state f 1<<join>>
```

出力
([pseudostates/mark-spaced-output.mmd](../tests/fixtures/state/pseudostates/mark-spaced-output.mmd)):

```mmd
stateDiagram-v2
  state f1 <<fork>>
  state c [[choice]]
  state f 1 <<join>>
```

### コメント

行に単独のコメント（`%%` か `#`）は、周りの文と同じ段に置き、
本文は書かれたまま残します。
[fixture: comments/kept]
[fixture: comments/text-kept]
[fixture: comments/before-closing-brace]
文の後のコメントはその行に残し、印の前に空白が書かれているかどうかを保ちます。
[fixture: comments/kept]
[fixture: comments/hash-after-statement-kept]
[fixture: comments/after-brace-kept]
[fixture: statements-one-per-line/split-then-comment]
[fixture: comments/after-last-statement-without-line-break]
[fixture: comments/header-comment-without-line-break]
説明、ラベル、ノート、スタイルの中では、`%%` と `#` はテキストの一部です。
[fixture: comments/text-in-values-kept]
[fixture: comments/text-in-note-lines-kept]

入力
([comments/kept-input.mmd](../tests/fixtures/state/comments/kept-input.mmd)):

```mmd
stateDiagram-v2
%% a comment line
A --> B %% after a transition
A --> C%%touching
# a hash comment
state D {
        %% in a body
E
}
```

出力
([comments/kept-output.mmd](../tests/fixtures/state/comments/kept-output.mmd)):

```mmd
stateDiagram-v2
  %% a comment line
  A --> B %% after a transition
  A --> C%%touching
  # a hash comment
  state D {
    %% in a body
    E
  }
```

### ディレクティブ

flowchart と同じです。
行に単独のディレクティブは周りの文と同じ段に置き、
文の行にあるディレクティブは、両側に空白が書かれているかどうかを保ちます。
書かれていればそこに空白 1 つを置き、トークンに接していれば接したまま残します。
[fixture: directives/kept]
[fixture: directives/before-header]
[fixture: directives/after-statement]
[fixture: directives/whitespace-on-each-side-kept]

入力
([directives/kept-input.mmd](../tests/fixtures/state/directives/kept-input.mmd)):

```mmd
stateDiagram-v2
%%{init: {}}%%
state A {
%%{init: {}}%%
B
}
Foo%%{init: {}}%% --> B
```

出力
([directives/kept-output.mmd](../tests/fixtures/state/directives/kept-output.mmd)):

```mmd
stateDiagram-v2
  %%{init: {}}%%
  state A {
    %%{init: {}}%%
    B
  }
  Foo%%{init: {}}%% --> B
```

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は、安全なときに Prettier の YAML 整形にかけます
（[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。
[corpus fixture: state/div-frontmatter-invalid-yaml]
[corpus fixture: state/div-html-tag-starts-in-frontmatter-description]
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/html-tag-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/indented-delimiters-kept]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/state/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
stateDiagram-v2
A --> B
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/state/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
stateDiagram-v2
  A --> B
```

### 複数行の値

flowchart と同じです。
`accDescr { ... }` のブロックの行は書かれたまま残し、
その `}` は文と同じ段に置きます。
サブグラフの外では、その行の桁は Db に入らないので、残すのは選択で、
理由は flowchart にあります
（[複数行の値](./flowchart.ja.md#複数行の値)を参照）。
[fixture: multi-line-values/kept]
[fixture: multi-line-values/accdescr-block-single-line-kept]
[fixture: multi-line-values/accdescr-block-empty-and-comment-lines-kept]
複数行に書かれた独立したノートの本文も、書かれたまま残します。
[fixture: multi-line-values/kept]
[fixture: multi-line-values/floating-note-empty-line-kept]

入力
([multi-line-values/kept-input.mmd](../tests/fixtures/state/multi-line-values/kept-input.mmd)):

```mmd
stateDiagram-v2
accDescr {
  one
    two
      }
note "line one
  line two" as N
```

出力
([multi-line-values/kept-output.mmd](../tests/fixtures/state/multi-line-values/kept-output.mmd)):

```mmd
stateDiagram-v2
  accDescr {
  one
    two
  }
  note "line one
  line two" as N
```

### 複数行の文

複数行に書かれた文は、1 行にまとめて印字します。
state 図で文が次の行に続けられるのは、
`state` の後、`as` の後、ノートの位置の後、
`classDef` と `style` とその名前の後、`scale` の後、`direction` の後、
`accTitle` と `accDescr` の `:` の後です。
[corpus fixture: state/lex-direction-value-next-line]
[fixture: multi-line-statements/joined]
[fixture: multi-line-statements/joined-after-as]
[fixture: multi-line-statements/joined-style-and-classdef]
[fixture: multi-line-statements/joined-accdescr]
[fixture: multi-line-statements/empty-line-inside-joined]
そのため、`classDef c` の次の行の `fill:red` は、
`classDef c fill:red` と印字します。
`classDef a` の後の行の `B --> C` は、遷移ではなく `a` のスタイルで、
印字した結果からそれが分かります。
[fixture: multi-line-statements/joined]
[fixture: multi-line-statements/classdef-takes-next-line]
コメントかディレクティブを含む複数行の文は、sequence 図と同じく、
始まりから終わりまで書かれたまま残します
（[複数行の文](./sequence.ja.md#複数行の文)を参照）。
[fixture: multi-line-statements/comment-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/brace-after-comment-line-kept]
[fixture: multi-line-statements/brace-after-directive-kept]

入力
([multi-line-statements/joined-input.mmd](../tests/fixtures/state/multi-line-statements/joined-input.mmd)):

```mmd
stateDiagram-v2
state
A
direction
LR
classDef c
fill:red
note right of
A : x
scale
350 width
accTitle:
A title
```

出力
([multi-line-statements/joined-output.mmd](../tests/fixtures/state/multi-line-statements/joined-output.mmd)):

```mmd
stateDiagram-v2
  state A
  direction LR
  classDef c fill:red
  note right of A : x
  scale 350 width
  accTitle: A title
```

入力
([multi-line-statements/comment-inside-kept-input.mmd](../tests/fixtures/state/multi-line-statements/comment-inside-kept-input.mmd)):

```mmd
stateDiagram-v2
direction
%% c
LR
```

出力
([multi-line-statements/comment-inside-kept-output.mmd](../tests/fixtures/state/multi-line-statements/comment-inside-kept-output.mmd)):

```mmd
stateDiagram-v2
  direction
%% c
LR
```

`;` を含み、複数行に書かれた文も、書かれたまま残します。
[corpus fixture: state/db-style-semicolons]
[corpus fixture: state/db-classdef-semicolons]
[fixture: multi-line-statements/semicolon-kept]
[fixture: multi-line-statements/semicolon-in-id-kept]
mermaid.js の行の規則
（仕様の
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)
）は、1 行のテキストを読みます。
`classDef`、改行、`c fill:#f00;` では、
規則は 2 行目に当たらないので `#f00;` はエンティティですが、
`classDef c fill:#f00;` と 1 行に書くと規則が当たり、`;` が無視されます。
行を結ぶと、スタイルが変わるからです。

入力
([multi-line-statements/semicolon-kept-input.mmd](../tests/fixtures/state/multi-line-statements/semicolon-kept-input.mmd)):

```mmd
stateDiagram-v2
  classDef
  c fill:#f00;
```

出力
([multi-line-statements/semicolon-kept-output.mmd](../tests/fixtures/state/multi-line-statements/semicolon-kept-output.mmd)):

```mmd
stateDiagram-v2
  classDef
  c fill:#f00;
```

### 行区切り文字

U+2028 か U+2029 を含む行は、書かれたまま残します。
それを開く行に持つ composite の文は、その文字を残し、
本体はほかの本体と同じように印字します。
`state a b`、U+2028、`{` は、文字を残して本体の文を字下げします。
閉じる行にあるときも同じです。
`state A {`、本体の行 `B`、U+2028 が後ろにある `}` では、
`}` の後ろの空白を文字ごと書かれたまま残し、本体は字下げします。
[test: U+2028 before the brace of a composite statement]
[test: U+2028 on the closing line of a composite statement]
[test: U+2029 and whitespace before it on the closing line of a composite statement]
[test: U+2028 on the closing line of a composite statement in a body]
[test: U+2028 after the closing brace at the end of the text]
[test: U+2028 on the opening and on the closing line of a composite statement]
入れ子になった composite の文も、2 つの閉じる行がどうであっても、
同じように印字します。
[test: U+2028 on the closing lines of a composite statement and of one in its body]
[test: U+2028 on the closing lines of three nested composite statements]
本体にその文字を含む行がある composite の文、
本体が空で、閉じる行がその文字を含む composite の文
（`state A {`、空白だけの行、`}`）、
閉じる `}` が行頭にない composite の文
（`B }` や、前にディレクティブがある場合）、
閉じる行で文字の後にコメント行か、別の規則が残す `;` がある composite の文は、
文全体を書かれたまま印字し、本体の字下げは直しません
（[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)と
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）。
[test: U+2028 on a line of the body of a composite statement]
[test: U+2028 on the closing line of a composite statement with an empty body]
[test: U+2028 after a closing brace that follows a statement on its line]
[test: U+2028 after a closing brace that follows a directive on its line]
[test: a `;` after U+2029 on the closing line of a composite statement]
[test: a comment line after U+2028 on the closing line of a composite statement]
state 図では、mermaid.js が擬似状態の印、方向の行、
`{` の前の 2 つ目の名前を探す範囲を、これらの文字が区切るからです。
`state a`、U+2028、`b <<fork>>` は名前 `a` とフォーク `b` ですが、
U+2028 の代わりに空白を置くと、フォーク `a b` になります。
[corpus fixture: state/lex-pseudostate-mark-after-line-separator]
文字が見えないので、例は、
`\u2028` を U+2028、`\n` を改行とする文字列で書きます。
`"stateDiagram-v2\nstate a\u2028b <<fork>>\n"` は
`"stateDiagram-v2\n  state a\u2028b <<fork>>\n"` と印字し、文字は残ります。
[test: a pseudostate mark after U+2028]
[test: a pseudostate mark after U+2029]
[test: a direction line after U+2028]
[test: a direction line after U+2029]
[test: a second name before a brace that U+2028 separates from it]
[test: a second name before a brace that U+2029 separates from it]
[test: a pseudostate mark after U+2028 in a body]
[test: a transition line with U+2028]
そのテストも、文字をエスケープで書いています
（[tests/line-separators.test.ts](../tests/line-separators.test.ts) を参照）。
U+2028 か U+2029 で始まる行は、
最初の文の前の空白も含めて、書かれたまま残します。
それは字句解析が読むものの一部で、それを除いて整形し直すと、
2 回目の整形はその行をほかの行と同じに読むからです。
[test: a line that starts with U+2028]
[test: a line that starts with U+2029]
[test: a line that starts with whitespace and U+2028]

`;` を落とすと、行の終わりか、行の規則が無視する `;` が変わる行は、
書かれたまま印字します。
閉じていないディレクティブの後の `;`、別の `;` に接する無視される `;`、
U+2028 か U+2029 の前の無視される `;` がある行です
（[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
[test: a semicolon after a directive that is not closed]
[test: an ignored semicolon next to another semicolon]
[test: an ignored semicolon and a semicolon after whitespace]
[test: an ignored semicolon before U+2028]
[test: an ignored semicolon before U+2029]

## 書かれたまま残すもの

次のテキストは常に書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキスト。説明、ラベル、ノート、`as` の後の id、擬似状態の名前、スタイル、
  `class` 文の CSS クラス、`accTitle` と `accDescr` のテキスト。
  [fixture: whitespace-between-tokens/style-text-kept]
  [fixture: descriptions-and-labels/acc-text-kept]
  [fixture: aliases/id-kept]
- 1 行のノートの id の後、別名の定義の 2 つ目の説明、
  空白だけの説明の `:` の後の空白。
- `state` の後の名前と `""`。`state` の行に残す。
- `""` の前に、空白が書かれているかどうか。
- `{` の直前の `%%` と空の説明ブロック。`{` まで。
- `{` を含み、`state` の名前の後に続く文の行。
- 空白でキーワードになる id に接した矢印と `:`。
- U+2028 か U+2029 を含む行。
- コメントかディレクティブか `;` を含む複数行の文。
- 方向の行の、`direction` の前と値の後のテキスト。
  [corpus fixture: state/lex-direction-line-same-line-transition]
  [fixture: whitespace-between-tokens/direction-line-text-kept]
- ヘッダーの綴り。`stateDiagram` か `stateDiagram-v2`。
  [corpus fixture: state/header-v1]
  [fixture: indentation/header-without-v2-kept]

次のテキストは、どちらの形でも Db が同じなので、選択として書かれたまま残します。
キーワードの大文字小文字は作者のものです。
文の後のコメントの印の前に空白が書かれているかどうかは、
既知の差異（`comment-takes-character`、`percent-brace-after-unit`）の場所では、
mermaid.js がコメントを、接するものによって読むからです。
場所の一覧よりも、1 つの規則のほうが単純です。

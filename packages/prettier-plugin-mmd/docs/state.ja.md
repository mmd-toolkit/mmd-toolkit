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
複合状態の文は、それを開く行より 1 段深く置き、その `}` は、その行と同じ段に、
行に単独で置きます。 [fixture: indentation/composite-states]
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。 [fixture: indentation/use-tabs]
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

trivia を挟んで見出しが続く場合、開始括弧のある行を最初のキーワードにそろえ、
本文がさらに 1 段深く見えるようにします。
その行をまたぐ値や保護された原文の境界は変えません。
[fixture: composite-states/header-completion-after-comment]

複合状態と、本体を持つ別名の定義の `{` は、空白 1 つの後に、名前の行に置きます。
次の行に書かれた `{` は、その行に移します。
名前と `{` の間にコメントかディレクティブがあれば改行を残し、
`{` は `state` のキーワードにそろえ、間の注釈は 1 段深く置きます。
`{` の前の空白 1 つは class 図と同じです。 [fixture: composite-states/split]
[fixture: composite-states/brace-after-one-space]
[fixture: composite-states/alias-brace-on-next-line]
[fixture: composite-states/directive-before-body]
[fixture: multi-line-statements/brace-after-comment-line-kept]
[fixture: multi-line-statements/brace-after-directive-kept]
`state A { B --> C }` のように 1 行に書かれた本体は行に分け、区切りの `--` は、
周りの文と同じ段に、行に単独で置きます。 [fixture: composite-states/split]
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
class 図と同じく `{ }` と印字します。 [fixture: composite-states/empty-unified]
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
mermaid.js が無視する、`{` の前の `state` も、書かれたまま残します。
`state "d" as A` の次の行の `state {` では id は `A` ですが、
1 行に書くと id は `A state` になるからです。
[fixture: composite-states/ignored-state-before-body-kept]
[corpus fixture: state/gram-ignored-state-before-alias-body-next-line]
名前のない `state` は、mermaid.js が受理して何も読まない独立した文なので、
周りの文と同じ段に印字します。 [fixture: composite-states/state-keyword-alone]
[corpus fixture: state/lex-state-keyword-alone]
ディレクティブだけの本体は、
`{` の行に書かれていればその行に残します（`state X { %%{init: {}}%% }`）。
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
`{` の前の 2 つの名前として読み、mermaid.js はそれを拒否するからです。
`state foo` に `state B {` の行が続くと拒否されますが、
`state B` に `{` の行が続くと受理されます。
そのため、`{` はその名前の行に移さず、id を次の行に書いたノートの行も、
書かれたまま残します。 [fixture: composite-states/brace-after-state-name-kept]
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
`state a b` は足さないからです。 [corpus fixture: state/lex-state-without-body]
`state x "" y` と `state z ""` の、mermaid.js が読まない `""` も同じです。
[fixture: statements-one-per-line/state-names-kept]
保持する `;` を含む行は、flowchart と同じく、
その行の文を残します（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
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
[fixture: blank-lines/collapsed] [fixture: blank-lines/end-of-text-dropped]
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
遷移の中や単独の行にある状態参照の `:::` は、
前の状態にも後ろのクラスにも接します。
`A :::c` と `A ::: c` は `A:::c` になります。
ER 図と同じです。
mermaid.js はどの書き方も同じ状態として読むので、形を強いるものはありません。
ER 図の `:::` はすでにこの形で印字しており、mermaid.js の文書の例 5 件も、
この書き方です。
その範囲は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/stateDiagram.md#L448-L470)
にあります。 [fixture: whitespace-between-tokens/css-class-touches-separator]
`state` 定義の `:::` は動かしません。
`state A :::c`、`state "x" as B ::: c`、`state C ::: c {` は、
空白が書かれていた隙間を空白 1 つのまま残します。
`state "y" as D:::c` は別名の規則で `state "y" as D :::c` になります。
[fixture: whitespace-between-tokens/css-class-in-definition-kept]
隙間にディレクティブがあれば、
その両側の空白の有無を保ちます（[ディレクティブ](#ディレクティブ)を参照）。
U+2028 と U+2029 は、そのまま残します。
[test: U+2028 before the `:::` of a state]
[test: U+2029 after the `:::` of a state]
flowchart
と同じです（[トークンの間の空白](./flowchart.ja.md#トークンの間の空白)を参照）。
ただし、別名の定義の語と擬似状態の印は、
空白 1 つを置きます（[別名](#別名)と[擬似状態](#擬似状態)を参照）。
mermaid.js が読まない `""` とスタイル文の `,` も同じです。
状態に結び付けない独立したノート（`note "..." as ...`）の引用符は、
書かれたまま残します。 [fixture: whitespace-between-tokens/comma-kept]
[fixture: whitespace-between-tokens/floating-note-quotes-kept]
`""` の前に空白が書かれているかどうかは保ちます。
`state x"" {` は複合状態 `x""` で、`state x "" {` は複合状態 `x` だからです。
[fixture: whitespace-between-tokens/quotes-before-brace-kept]
キーワードは、書かれた大文字小文字のまま残します。
mermaid.js は大文字小文字にかかわらず読み、`Left Of` のようなノートの位置は、
書かれたまま図に入るからです。
[fixture: whitespace-between-tokens/keyword-case-kept]

`class` 文の id を区切る `,` は、後ろの id に接します。
`class A, B c` は `class A,B c` になります。
ER、requirement、
usecase
の一覧と同じです（[スタイルとクラス](./er.ja.md#スタイルとクラス)を参照）。
mermaid.js は `A,B`、`A, B`、`A,  B` を同じ文として読むので、
形を強いるものはありません。
mermaid.js の文書は、この文の例 2 件を `,` の後ろに空白を置いて書いています。
その 1 件は、
[`class Moving, Crash movement`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/stateDiagram.md#L397)
です。
これは形を決める根拠にはなりません。
[fixture: whitespace-between-tokens/class-ids-touching]
`,` の前に空白が書かれていると、そこで id が終わり、残りがクラス名になります。
`class A ,B c` は状態 `A` とクラス `,B c` です。
その形は、`,` の後ろの空白も含めて、書かれたまま残します。
[fixture: whitespace-between-tokens/class-ids-space-before-comma-kept]
[fixture: whitespace-between-tokens/comma-kept]
`,` の後ろの改行は結ぶので、
`class A,` と次の行の `B c` は `class A,B c` になります。
`,` の前にディレクティブがあっても同じで、`,` の後ろの id は `,` に接します。
[fixture: whitespace-between-tokens/class-ids-line-break-and-directive]
`,` の後ろの隙間にディレクティブがあれば、その両側に空白があるかどうかは変えず、
空白の連なりは空白 1 つにします（[ディレクティブ](#ディレクティブ)を参照）。
行の line rule が無視する `;` のある行は、書かれたまま残します。
[fixture: whitespace-between-tokens/class-ids-beside-directive-kept]
[fixture: whitespace-between-tokens/class-ids-beside-directive-runs-collapsed]
[fixture: whitespace-between-tokens/class-ids-with-ignored-semicolon]
`,` の後ろの U+2028 と U+2029 は、そのまま残します。
[test: U+2028 after the comma of a state class statement]
[test: U+2029 after the comma of a state class statement]
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
  A:::highlight
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
`A-->B` は `A --> B` になります。 [fixture: arrow-spacing/spaced]
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
`:::` の後のクラスがその名前の状態からの遷移は、`scale-->B` のように、
矢印の両側を接したまま残します。
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
テキストは書かれたまま残します。 [fixture: descriptions-and-labels/text-kept]
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
`"stateDiagram-v2\nA : x: \nA-->B:y:  \n"` は、
`"stateDiagram-v2\n  A : x: \n  A --> B : y:  \n"` と印字します（fixture は、
[フォルダー](../tests/fixtures/state/descriptions-and-labels)の `blank-kept` と
`ending-colon-kept` です）。

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
`:` の後に空白が書かれているかどうかを保ちます（[ラベル](./class.ja.md#ラベル)
を参照）。
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
`note left of A:h` では、`:` と `h` が mermaid.js の捨てる 2 文字なので、
ノートに本文はなく、`h` の後の空白は削除します。
[fixture: notes/one-character-text-kept]
[corpus fixture: state/lex-note-colon-then-one-character]
id の前の空白は空白 1 つにします。
`note left of%%x A` のように位置の直後にある、mermaid.js が読まないテキストは、
位置に接したまま残します。

固定版の Mermaid は、`stateDiagram-v2` のノートを Markdown として描画します。
[`dataFetcher.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/state/dataFetcher.ts#L380-L386)
で `labelType` を `markdown` に設定しています。
対応する記法は限定されています。
[`handle-markdown-text.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/handle-markdown-text.ts#L120-L145)
では、リストはリストとして配置せず、原文のテキストへ戻します。
このフォーマッターは、
固定版の Mermaid と同じ Marked 16.4.2 で Markdown を判別します。
ノート本文を Markdown フォーマッターへ渡さず、
以下の規則で対応する段落の余白だけをそろえ、そのほかの本文は保ちます。
[fixture: notes/markdown-code-kept]
[fixture: notes/markdown-unordered-list-kept]

見出しが 1 行に収まり、本文がその次の行から始まり、
`end note` が行頭の字下げに続くノートでは、単一の段落の内容がある各行を、
ノートより 1 段深くそろえます。
行頭の ASCII 空白を本文の字下げに置き換えます。
内容がある最初の行だけは、Mermaid が取り除く行頭の tab も対象です。
後続行の余白に tab がある本文は、この段落の規則から外します。
そのほかのテキスト、改行、末尾の空白は保ちます。
段落の前後にある空行と空白だけの行は、原文を正確に保ちます。
`useTabs` でも本文には ASCII 空白を使い、
`tabWidth: 0` では行頭の空白をなくします。
本文の段は、ノートの階層と `tabWidth` で決まります。
[fixture: notes/payment-prose] [fixture: notes/prose-nested-four]
[fixture: notes/prose-use-tabs] [fixture: notes/prose-zero-width]
[fixture: notes/prose-one-trailing-space] [fixture: notes/prose-tab-margin-kept]
[fixture: notes/over-lines-text-ends-kept]
[fixture: notes/later-tab-margin-kept]

段落内で対象になるのは、通常のテキスト、行内の強調、
同じ物理行で閉じる backtick のコード、
括弧を使わず 1 つの物理行に収まる自動リンク、
行内のほかのテキストの後にある正確な `<br/>` だけです。
これらの内容は変えず、行頭の余白だけをそろえます。
[fixture: notes/inline-emphasis-margins] [fixture: notes/inline-code-margins]
[fixture: notes/inline-br-margins] [fixture: notes/autolink-margins]

Marked が通常の段落として読む `+Cash` や `#Heading` などの本文もそろえます。
[fixture: notes/plain-block-like-text]

この段落の判定には、設定された本文の字下げが空白 4 個以上なら、
原文の行頭の余白を残した本文を使います。
Marked が段落の文字どおりの続きとして読む記号の行も、対象になります。
4 個未満なら、
内容のある各行の行頭の ASCII 空白と tab を除いた入力本文で判定します。
リストや setext 見出しなど、対応する段落以外の構文が現れる場合は、
後続の余白を保ちます。 [fixture: notes/markdown-unordered-list-kept]
[fixture: notes/markdown-ordered-list-kept]
[fixture: notes/markdown-ordered-parenthesis-kept]
[fixture: notes/literal-markers-zero-width]
[fixture: notes/marker-at-paragraph-boundary-kept]
[fixture: notes/literal-setext-zero-width]

この段落の規則に当てはまらない本文では、最初の物理行が空でなく、
字下げが ASCII 空白と tab だけなら、その行だけをそろえます。
整列できる段落と同じく、設定された本文の段を使います。
保護する後続行から別の字下げを推測しません。
後続の余白は本文のテキストの一部で、描画に影響する場合があるためです。
この規則は、後続の内容行の有無や字下げによらず適用します。
[fixture: notes/backslash-margins-kept]
[fixture: notes/protected-tab-margins-kept]
[fixture: notes/heading-at-paragraph-boundary-kept]
[fixture: notes/markdown-code-kept] [fixture: notes/single-markup-row]
[test: U+00A0 at the start of a later note row]

Mermaid はこの余白をノートの格納前に取り除くため、
HTML や Markdown があっても raw Db は完全に一致します。
後続のすべての余白は原文を保ちます。
たとえば `<pre>` の内側の字下げを変えると、描画も変わる場合があるためです。
最初の行が空か、
先頭に ASCII 空白と tab 以外の空白文字がある場合は原文を保ちます。
[fixture: notes/whitespace-only-body] [fixture: notes/html-note-kept]
[fixture: notes/html-pre-first-line] [fixture: notes/html-break-first-line]
[fixture: notes/html-first-line-tabs]
[fixture: notes/html-first-line-zero-width]
[fixture: notes/first-tab-markup-margin]

たとえば、次のノートの先頭行には、設定された空白4個を使います。
空行で分かれた後続の段落は空白2個を保ちます。
後続行を空白4個へ動かすと、Mermaid の読み取りと描画が変わるためです。
3行すべてを空白2個にしても描画は変わりませんが、この先頭行には、
設定された本文の段を使う書式を採用しています。

出力
([notes/over-lines-empty-lines-kept-output.mmd](../tests/fixtures/state/notes/over-lines-empty-lines-kept-output.mmd)):

```mmd
stateDiagram-v2
  A
  note right of A
    one

  two


  three
  end note
  B
```

同様に、backslash の後の行は空白12個を保ち、
余白が取り除かれる先頭行には設定された空白4個を使う場合があります。
後続行を空白4個へ動かすと描画が変わり、
その空白12個を先頭行へコピーしても字下げを深くしすぎるだけです。
[fixture: notes/backslash-margins-kept]

出力
([notes/html-note-kept-output.mmd](../tests/fixtures/state/notes/html-note-kept-output.mmd)):

```mmd
stateDiagram-v2
  Paid
  note right of Paid
    Payment<br/>confirmed
    Receipt sent
  end note
```

`note` の前や `end note` の後にある文や trivia は、
通常の段落の整列を妨げません。 [fixture: notes/prose-adjacent-header]
[fixture: notes/prose-adjacent-closer] [fixture: notes/prose-closer-comment]
[fixture: notes/prose-header-directive]

ノートにコメント、ディレクティブ、セミコロン、保護された結合領域がある場合は、
本文全体を原文のまま保ちます。
セミコロンで終わる entity も、この保護の対象です。
[fixture: comments/text-in-note-lines-kept]
[fixture: notes/over-lines-directive-on-header-line]
[corpus fixture: state/tokens-note-block-ignored-semicolon]

上記の先頭行の余白を除き、空行で分かれた段落、ブロック構文、
fence 付きや複数行のコード、取り消し線、一般の HTML、角括弧を使うリンク、
山括弧で囲むリンク、バックスラッシュ、
内容の行内にある ASCII 空白以外の空白文字は原文を保ちます。
リストや見出しなどのブロック構文は、Marked が判別します。
Mermaid がブロックの原文を文字どおりに表示する場合は、
その余白も表示されるためです。
たとえば空行後の空白を 2 個から 4 個に増やすと、
表示されていた 3 つの段落が別の配置に変わる場合があります。
一般の Markdown を再整形するものではありません。
[fixture: notes/over-lines-empty-lines-kept]
[fixture: notes/list-body-margin-kept]
[fixture: notes/heading-at-paragraph-boundary-kept]
[fixture: notes/markdown-heading-kept] [fixture: notes/markdown-code-kept]
[fixture: notes/code-spanning-lines-kept]
[fixture: notes/strikethrough-spanning-lines-kept]
[fixture: notes/link-spanning-lines-kept]
[fixture: notes/angle-link-margins-kept] [fixture: notes/backslash-margins-kept]
[fixture: notes/markdown-empty-ordered-dot-kept]
[fixture: notes/markdown-empty-ordered-parenthesis-kept]
[test: U+00A0 at the start of a later note row]
[test: U+2028 on a later note row] [test: U+2029 on a later note row]

後に内容の行が続く本文行が ASCII 空白 2 個以上で終わる場合は、
Markdown の hard break なので、その末尾空白と後続行は原文を保ち、
条件を満たす先頭行の余白だけをそろえます。
最後以外の本文行の末尾の空白 1 個と、最後の本文行の末尾の空白は、
本文の margin をそろえる場合も保ちます。 [fixture: notes/prose-trailing-spaces]
[fixture: notes/prose-one-trailing-space]

Mermaid は本文内部の改行の後にある行頭空白を、raw `notes[].text` 値に残します。
このため、許可する行頭の ASCII 空白変更は、描画を保つ限定的な Db の例外です。
parser、仕様、記録済み Mermaid の読み取りは変えません。
ほかの複数行のノート本文は、整列できる先頭行の余白を除き、書かれた列を保ちます。
両端の空行や空白だけの行も含みます。
`end note` はノートと同じ段に置きます。
見出しの id の後の空白は落とします。
その行のコメントやディレクティブの後の空白は、書かれたまま残します。
[fixture: notes/over-lines] [fixture: notes/over-lines-first-line-column-kept]
[fixture: notes/over-lines-text-ends-kept]
[fixture: notes/over-lines-directive-on-header-line]
[fixture: notes/over-lines-end-note-indentation-set]
[fixture: notes/over-lines-in-composite]
[fixture: notes/over-lines-empty-lines-kept]
本文のない複数行のノートは、`note right of A` の次の行が `end note` の形で、
空の本文として受理され、2 行を印字します。 [fixture: notes/over-lines-empty]
[corpus fixture: state/lex-note-block-empty]
複数行のノートの本文が id と同じ行から始まる場合、
たとえば `note right of A text` では、本文の最初の行は id の行にあり、
Mermaid が余白を除くのはその行だけです。
後の行の余白は本文の一部なので、書かれたまま残し、
`end note` はノートと同じ段に置きます。
[fixture: notes/over-lines-text-on-id-line-kept]
id が空の場合も同じです。
`note left of %%x` では、mermaid.js は `%%x` から本文が始まると読みます。
[fixture: notes/over-lines-empty-id-kept]
[corpus fixture: state/lex-note-id-percent-block]
本文のない 1 行のノートは、説明と同じく、`:` の後の空白を残します。
`note left of A : ` は受理され、`note left of A :` は拒否されます。
`:` の前に空白が 2 つあり、後ろに何もないノートも同じです。
その本文は `:` だけです。 [fixture: notes/blank-text-kept]
独立したノートの引用符は書かれたまま残します。
`note ""floating" as N` の本文は `floating` です。 [fixture: notes/over-lines]
浮遊ノートの `as` とその後の id は、前のものに接していても、
それぞれ空白 1 つの後に置きます。
`note "t"as N` と `note "t" asN` は `note "t" as N` と印字します。
mermaid.js はこの 3 つの書き方を同じに読み、
別名の定義の `as` と id も同じ形で印字します（[別名](#別名)を参照）。
隙間にディレクティブがあれば、その両側に空白が書かれていたかを保ち、
U+2028 と U+2029 はそのまま残します。
[fixture: notes/floating-note-as-gaps-spaced]
[fixture: notes/floating-note-as-beside-directive-kept]
[test: U+2028 before the `as` of a floating note]
[test: U+2029 between the `as` and the id of a floating note]

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
([notes/payment-prose-input.mmd](../tests/fixtures/state/notes/payment-prose-input.mmd)):

```mmd
stateDiagram-v2
    note right of Paid
        Payment can be card,
            wallet, or bank transfer
    end note
```

出力
([notes/payment-prose-output.mmd](../tests/fixtures/state/notes/payment-prose-output.mmd)):

```mmd
stateDiagram-v2
  note right of Paid
    Payment can be card,
    wallet, or bank transfer
  end note
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
[fixture: aliases/second-description-kept] [fixture: aliases/tabs-between-parts]
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
[fixture: pseudostates/mark-spaced] [fixture: pseudostates/all-marks-spaced]

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
本文は書かれたまま残します。 [fixture: comments/kept]
[fixture: comments/text-kept] [fixture: comments/before-closing-brace]
文の後のコメントはその行に残し、印の前に空白が書かれているかどうかを保ちます。
[fixture: comments/kept] [fixture: comments/hash-after-statement-kept]
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
行に単独のディレクティブは周りの文と同じ段に置き、同じ印字行の中では、
両側に空白が書かれているかどうかを保ちます。
書かれていればそこに空白 1 つを置き、トークンに接していれば接したまま残します。
[fixture: directives/kept] [fixture: directives/before-header]
[fixture: directives/after-statement]
[fixture: directives/whitespace-on-each-side-kept]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: state/directives/split-directive-gap]

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
`---` の行の間の YAML は、
安全なときに Prettier の YAML 整形にかけます（詳しくは、
[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。
[corpus fixture: state/div-frontmatter-invalid-yaml]
[corpus fixture: state/div-html-tag-starts-in-frontmatter-description]
[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/html-tag-kept]
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

[flowchart のトップレベルの説明](./flowchart.ja.md#複数行の値)と同じく、
`accDescr { ... }` の本文行は文より 1 段深くそろえ、
独立した `}` は文と同じ段に置きます。
Mermaid が説明からこの字下げを除くためです。 [fixture: multi-line-values/kept]
[fixture: multi-line-values/accdescr-block-single-line-kept]
[fixture: multi-line-values/accdescr-block-empty-and-comment-lines-kept]
閉じたブロックに本文がなければ、内側を `{}` と印字します。
`accDescr { }` は `accDescr {}` になり、空白の連続、改行、
Unicode の空白だけの内側も同じです。
波括弧の内側の U+2028 と U+2029 も含みます。
すでに空の内側は空のままです。
キーワードと開始括弧の間には空白を 1 つ置きます。
空白で囲む本文がないので、Db が同じ形の選択は、
[flowchart のアクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)、
agentflow、usecase に合わせます。
前の説明は Db に残ります。
[fixture: multi-line-values/empty-description-interiors]
[test: accessibility revisions: state empty-description-nbsp]
コメントやディレクティブがあるブロックの内容と改行は保ち、
閉じられていないブロックは開いたままにします。
[fixture: multi-line-values/empty-description-trivia-kept]
[corpus fixture: state/lex-acc-descr-block-unclosed]
閉じられていないブロックの行も、テキストの終わりまで、
閉じたブロックと同じようにそろえ、`}` は加えません。
[fixture: multi-line-values/unclosed-block-aligned]

1 行のブロックの文字は、両側に空白を 1 つずつ置きます。
これは、
[flowchart のアクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)
と同じ形です。
`accDescr {a b}`、`accDescr {  a b  }`、`accDescr {  a b}`、
`accDescr {a b  }` は、どれも `accDescr { a b }` になります。
mermaid.js は文字を trim するので、両端の空白に意味はありません。
文字の中にディレクティブがあるブロックは、書かれたままにします。
`;` を残す行にあるブロックは、空白を足しませんが、
端の空白の連なりは空白 1
つにします（[セミコロン](./flowchart.ja.md#セミコロン)を参照）。
[fixture: multi-line-values/block-text-on-one-line-padded]

ブロックノートの段落は、[ノート](#ノート)の限定規則に従います。
[fixture: notes/payment-prose]
複数行に書かれた独立したノートの本文は、書かれたまま残します。
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

### スタイル文の末尾のセミコロン

`classDef` または `style` 文の行末の `;` は、
[mermaid.js の行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
が無視するときに削除します。
`:` と後の `#` の間に空白がない形です。
この終端を削除しても Db は変わらず、スタイルが複数でも同じです。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
削除する `;` の直前の空白も一緒に削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/space-before-terminator]
その行は、スタイルの空白を含め、その `;` がない行として整形します。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
文の前後の空行とコメント行は、通常の配置に従います。
[fixture: semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines]
空の description block も通常の配置に従い、スタイルの終端は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/empty-description-block]

文に `#` がない場合は、最後のスタイルの末尾の `;` も削除します。
ただし、そのスタイルにほかの `;` がなく、
前に空白以外のテキストがある場合に限ります。
mermaid.js は各スタイルの最初の `;` を取り除くためです。
[fixture: semicolons-at-the-end-of-a-style-statement/style-text-terminators]
`classDef c fill:red;;`、`classDef c ;`、
`style A fill : #f00;` は条件を満たさないので残します。
[fixture: semicolons-at-the-end-of-a-style-statement/style-text-kept]
`style A` のようにスタイルのない文には、削除する `;` がなく、
空白は通常の配置に従います。
[fixture: semicolons-at-the-end-of-a-style-statement/no-style-spacing]
[corpus fixture: state/lex-style-without-styles]
`A --> B;` などの遷移のセミコロンは、id の文字なので保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/transition-semicolon-kept]

同じ行でセミコロンの後にディレクティブが続く場合は、`;` を保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
同じ行で `%%` のテキストが続く場合も保ちます。
ここではスタイルの文字列の一部です。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
無視される `;` が別の `;` の隣にある場合は、行の規則の選択を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]
閉じていないディレクティブの後の `;` は、その停止位置を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
U+2028 と U+2029 の前も同じように保護します。
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
[test: style semicolons: state before U+2028]
[test: style semicolons: state before U+2029]
文と無視される終端の間にある閉じたディレクティブは残し、`;` は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

スタイルがすべて空の文（`style A ,%%{init: {}}%%` など）には、
`;` が終わらせるスタイルのテキストがないので、通常どおり整形し、
ディレクティブも残します。
カンマの後の `;` は、それだけで 1 つのスタイルになるためです（詳しくは、
[木](../../spec/docs/ast/state.ja.md#stateclassdefstatement)を参照）。
[fixture: semicolons-at-the-end-of-a-style-statement/empty-styles]

出力
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/state/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
stateDiagram-v2
  A --> B
  classDef c fill:#f00
  style A fill:#f00
  classDef d fill:#0f0,stroke:#00f
  style A fill:#0f0,stroke:#00f
```

### 複数行の文

複数行に書かれた文は、1 行にまとめて印字します。
state 図で文が次の行に続けられるのは、`state` の後、`as` の後、
ノートの位置の後、`classDef` と `style` とその名前の後、`scale` の後、
`direction` の後、`accTitle` と `accDescr` の `:` の後です。
[corpus fixture: state/lex-direction-value-next-line]
[fixture: multi-line-statements/joined]
[fixture: multi-line-statements/joined-after-as]
[fixture: multi-line-statements/joined-style-and-classdef]
[fixture: multi-line-statements/joined-accdescr]
[fixture: multi-line-statements/empty-line-inside-joined]
`accTitle:` や `accDescr:` の次行の値は、結合すると方向文になる場合、
改行と通常の継続行の字下げを保ちます。
判定するのは `direction`、空白の連続と、`TB`、`BT`、`RL`、`LR` のいずれかで、
大文字小文字を区別しません。
値の他のテキストの後にある場合も同じです。
図の方向に変えず、タイトルや説明を保つためです。
そのため `"accTitle:\n direction LR"` は `"  accTitle:\n    direction LR"`
と印字します。
`TD` は state の方向ではないので、`direction TD` は結合します。
[fixture: multi-line-statements/next-line-direction-title]
[fixture: multi-line-statements/next-line-direction-description]
[fixture: multi-line-statements/next-line-direction-lower-value]
[fixture: multi-line-statements/next-line-direction-mixed-keyword]
[fixture: multi-line-statements/next-line-direction-spaced-bt]
[fixture: multi-line-statements/next-line-direction-after-text]
[fixture: multi-line-statements/next-line-direction-tb]
[fixture: multi-line-statements/next-line-direction-rl]
[fixture: multi-line-statements/next-line-direction-td-joined]
値の前の CRLF と NBSP の字下げも同じ規則に従い、
設定された改行と継続行の字下げで印字します。
[test: accessibility revisions: state next-line-direction-crlf]
[test: accessibility revisions: state next-line-direction-nbsp]
そのため、`classDef c` の次の行の `fill:red` は、
`classDef c fill:red` と印字します。
`classDef a` の後の行の `B --> C` は、遷移ではなく `a` のスタイルで、
印字した結果からそれが分かります。 [fixture: multi-line-statements/joined]
[fixture: multi-line-statements/classdef-takes-next-line]
コメントかディレクティブを含む文は改行を残し、
構造の続きの行と間の注釈を 1
段深く置きます（[複数行の文](./sequence.ja.md#複数行の文)を参照）。
ほかの値の内部の空白は変えません。
複数行のノートの段落の margin は、[ノート](#ノート)の限定規則に従います。
[fixture: notes/payment-prose]
各隙間の最初の行末は保ちます。
コメントで結合される領域、セミコロンの保護対象、前述の複合状態の例外では、
文全体を原文のまま残します。
[fixture: multi-line-statements/declaration-trivia-continuations]
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

保持する `;` を含み、複数行に書かれた文も、書かれたまま残します。
[corpus fixture: state/db-style-semicolons]
[corpus fixture: state/db-classdef-semicolons]
[fixture: multi-line-statements/semicolon-kept]
[fixture: multi-line-statements/semicolon-in-id-kept]
mermaid.js の行の規則は、
1 行のテキストを読みます（仕様の
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)）。
`classDef`、改行、`c fill:#f00;` では、
規則は 2 行目に当たらないので `#f00;` はエンティティですが、
`classDef c fill:#f00;` と 1 行に書くと規則が当たり、`;` が無視されます。
行を結ぶと、スタイルが変わるからです。
1 行に書かれた無視される終端は、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)
に従って削除します。

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
ただし、空白だけの説明ブロックの内側は保護する本文がないので縮めます。
その内側以外に区切り文字があれば、行は書かれたまま残します。
[test: state Unicode and tab interiors] [test: state multiline Unicode interior]
[test: state exterior separator keeps the line]
[test: state separator with comment stays written]
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
本体にその文字を含む行がある composite の文、本体が空で、
閉じる行がその文字を含む composite の文（`state A {`、空白だけの行、`}`）、
閉じる `}` が行頭にない composite の文（`B }` や、
前にディレクティブがある場合）、閉じる行で文字の後にコメント行か、
別の規則が残す `;` がある composite の文は、文全体を書かれたまま印字し、
本体の字下げは、
直しません（[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行) と、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）。 [test: U+2028 on a line of the body of a composite statement]
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
文字が見えないので、例は、`\u2028` を U+2028、
`\n` を改行とする文字列で書きます。
`"stateDiagram-v2\nstate a\u2028b <<fork>>\n"` は
`"stateDiagram-v2\n  state a\u2028b <<fork>>\n"` と印字し、文字は残ります。
[test: a pseudostate mark after U+2028] [test: a pseudostate mark after U+2029]
[test: a direction line after U+2028] [test: a direction line after U+2029]
[test: a second name before a brace that U+2028 separates from it]
[test: a second name before a brace that U+2029 separates from it]
[test: a pseudostate mark after U+2028 in a body]
[test: a transition line with U+2028]
そのテストも、文字をエスケープで、
書いています（[tests/line-separators.test.ts](../tests/line-separators.test.ts)
を参照）。
U+2028 か U+2029 で始まる行は、最初の文の前の空白も含めて、
書かれたまま残します。
それは字句解析が読むものの一部で、それを除いて整形し直すと、
2 回目の整形はその行をほかの行と同じに読むからです。
[test: a line that starts with U+2028] [test: a line that starts with U+2029]
[test: a line that starts with whitespace and U+2028]

`;` を落とすと、行の終わりか、行の規則が無視する `;` が変わる行は、
書かれたまま印字します。
閉じていないディレクティブの後の `;`、別の `;` に接する無視される `;`、
U+2028 か U+2029 の前の無視される `;` がある行です（詳しくは、
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
[test: a semicolon after a directive that is not closed]
[test: an ignored semicolon next to another semicolon]
[test: an ignored semicolon and a semicolon after whitespace]
[test: an ignored semicolon before U+2028]
[test: an ignored semicolon before U+2029]

## 書かれたまま残すもの

[複数行の値](#複数行の値)で定める説明本文の字下げと、
[ノート](#ノート)で定める限定的な段落の margin と、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)
で削除する終端を除き、次のテキストは書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキスト。
  説明、ラベル、ノート、`as` の後の id、擬似状態の名前、スタイル、
  `class` 文の CSS クラス、`accTitle` と `accDescr` のテキスト。
  [fixture: whitespace-between-tokens/style-text-kept]
  [fixture: descriptions-and-labels/acc-text-kept] [fixture: aliases/id-kept]
- 1 行のノートの id の後、別名の定義の 2 つ目の説明、
  空白だけの説明の `:` の後の空白。
- `state` の後の名前と `""`。
  `state` の行に残す。
- `""` の前に、空白が書かれているかどうか。
- `{` の直前の `%%` と空の説明ブロック。
  `{` まで。
- `{` を含み、`state` の名前の後に続く文の行。
- 空白でキーワードになる id に接した矢印と `:`。
- U+2028 か U+2029 を含む行。
- セミコロン行かコメントで結合される領域の保護対象の文。
- 注釈を含む隙間の最初の改行の前の空白。
- 方向の行の、`direction` の前と値の後のテキスト。
  [corpus fixture: state/lex-direction-line-same-line-transition]
  [fixture: whitespace-between-tokens/direction-line-text-kept]
- ヘッダーの綴り。
  `stateDiagram` か `stateDiagram-v2`。 [corpus fixture: state/header-v1]
  [fixture: indentation/header-without-v2-kept]

次のテキストは、どちらの形でも Db が同じなので、選択として書かれたまま残します。
キーワードの大文字小文字は作者のものです。
文の後のコメントの印の前に空白が書かれているかどうかは、
既知の差異（`comment-takes-character`、`percent-brace-after-unit`）の場所では、
mermaid.js がコメントを、接するものによって読むからです。
場所の一覧よりも、1 つの規則のほうが単純です。

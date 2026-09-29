# flowchart の整形規則

英語版: [flowchart.md](./flowchart.md)

prettier-plugin-mmd が flowchart をどう整形するかを説明します。
対象の図種は `flowchart`、`graph`、`flowchart-elk`、`swimlane-beta` です。
以下の各規則は、mermaid.js が図から読むものを保ちます。
変えるとそれが変わる箇所は書かれたまま残し、その箇所を各規則に書きます。

各規則には、[`tests/fixtures/flowchart/`](../tests/fixtures/flowchart) の下に、
規則の英語版の見出しと同じ名前の例のフォルダーがあります。
規則「Arrow spacing」はフォルダー `arrow-spacing` です。
1 つの例は入力と整形後の出力の 2 つのファイルからなり、テストは、
プラグインがその出力を印字することと、
mermaid.js が入力と出力から同じ図を読むことを確かめます。
この文書の例はそれらのファイルの写しで、同じであることをテストが確かめます。

## 規則

### 字下げ

ヘッダーの後の文はヘッダーより 1 段、
subgraph の文はその `subgraph` の行より 1 段深く置き、
`end` は `subgraph` と同じ段に置きます。
1 段は Prettier の `useTabs` と `tabWidth` オプションのとおりで、
既定は空白 2 つです。
入力に書かれた字下げは保ちません。

入力 ([indentation/nested-subgraphs-input.mmd](../tests/fixtures/flowchart/indentation/nested-subgraphs-input.mmd)):

```mmd
flowchart TB
subgraph outer
subgraph inner
A --> B
end
C
end
```

出力 ([indentation/nested-subgraphs-output.mmd](../tests/fixtures/flowchart/indentation/nested-subgraphs-output.mmd)):

```mmd
flowchart TB
  subgraph outer
    subgraph inner
      A --> B
    end
    C
  end
```

`tabWidth: 4` のとき
（[オプション](../tests/fixtures/flowchart/indentation/tab-width-4-options.json)）:

入力 ([indentation/tab-width-4-input.mmd](../tests/fixtures/flowchart/indentation/tab-width-4-input.mmd)):

```mmd
flowchart LR
subgraph S
A --> B
end
```

出力 ([indentation/tab-width-4-output.mmd](../tests/fixtures/flowchart/indentation/tab-width-4-output.mmd)):

```mmd
flowchart LR
    subgraph S
        A --> B
    end
```

`direction` の後に空白と `TB`、`BT`、`RL`、`LR`、
`TD` のどれかが続くテキストを含み、方向の文ではない行は、
字下げも含めて書かれたまま残します。
mermaid.js は、そうしたテキストを含む行を字下げすると、方向の文として読みます。
`accTitle: t;direction TB` はアクセシビリティのタイトルですが、
同じ行を字下げすると方向 `TB` になります。

入力 ([indentation/direction-text-kept-input.mmd](../tests/fixtures/flowchart/indentation/direction-text-kept-input.mmd)):

```mmd
flowchart LR
A-->B
accTitle: t;direction TB
subgraph S
accDescr: d ; direction LR
C
end
```

出力 ([indentation/direction-text-kept-output.mmd](../tests/fixtures/flowchart/indentation/direction-text-kept-output.mmd)):

```mmd
flowchart LR
  A --> B
accTitle: t;direction TB
  subgraph S
accDescr: d ; direction LR
    C
  end
```

### 1 行に 1 文

文はそれぞれ 1 行に置きます。
1 行に書かれ `;` で区切られた文は、行に分けます。

ただし、文を区切る `;` 以外の `;` を含む行は、文と `;` を行に残します。
`A[x;]`、`accTitle: a;b`、コメントの中の `;` などがそうした `;` です。
文を別の行に分けず、`;` はその位置に、両側の空白も書かれたとおりにして残します。
文そのものは、ほかと同じように整形します。
残す `;` の両側の空白は揃えません。
そうした行の `;` は mermaid.js が無視するものであることがあり、そのときは、
その後に空白を置くと前後のテキストの読み方が変わるからです。
mermaid.js は、一部の行（`style`、`:`、`#` がこの順に `;` の前にある行）で、
最後の `;` を無視します。
文を区切る `;` を取り除いたり行を分けたりすると、
無視される `;` が別のものに変わります。
`A[style:#x;];` のラベルは `style:` とエンティティ `#x;` ですが、
`A[style:#x;]` のラベルは `style:#x` です。
どの `;` が無視されるかは木に現れないので、`style` を含むかどうかにかかわらず、
そうした行はすべて文をまとめて残します。
この規則が読むのは `style`、`:`、`#`、`;` だけなので、
ほかのトークンの間の空白は変えてかまいません。

入力 ([statements-one-per-line/separated-by-semicolons-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

出力 ([statements-one-per-line/separated-by-semicolons-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
  C --> D
  subgraph S
    E
    F
  end
```

入力 ([statements-one-per-line/line-with-semicolon-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/line-with-semicolon-kept-input.mmd)):

```mmd
flowchart LR
A[style:#x;];
B["style:#x;"];
accTitle: style:#x;y;
C[style:#x;] --> D;
E[style:#x;];F[y;]
G[x;]; style H fill:#f00;
I[style:#x;]-->J;K   -->L
```

出力 ([statements-one-per-line/line-with-semicolon-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/line-with-semicolon-kept-output.mmd)):

```mmd
flowchart LR
  A[style:#x;];
  B["style:#x;"];
  accTitle: style:#x;y;
  C[style:#x;] --> D;
  E[style:#x;];F[y;]
  G[x;]; style H fill:#f00;
  I[style:#x;] --> J;K --> L
```

文が id `accTitle`、`accDescr`、`direction`、`click`、`call`、`href` のどれか、
または `direction` で終わる id で終わり、次の文との間を `;` が区切るときも、
文を行にまとめ、`;` をその位置に残します。
mermaid.js は、これらの語の後の空白を、改行も含めて語と一緒に読むからです。
`accTitle ; :` は頂点 `accTitle` と `:` ですが、
`accTitle` と `:` を 2 行に書くとアクセシビリティのタイトルになります。

入力 ([statements-one-per-line/semicolon-after-word-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-word-kept-input.mmd)):

```mmd
flowchart LR
accTitle ; :
direction ; TB
A-->direction; TB
call;B
href;C
accDescr ; :
D;click;E
F-->G;G-->H
directiondirection ; TB
A-->Bdirection; LR
```

出力 ([statements-one-per-line/semicolon-after-word-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-word-kept-output.mmd)):

```mmd
flowchart LR
  accTitle ; :
  direction ; TB
  A --> direction; TB
  call;B
  href;C
  accDescr ; :
  D;click;E
  F --> G
  G --> H
  directiondirection ; TB
  A --> Bdirection; LR
```

### セミコロン

文の終わりの `;` は取り除き、
トップレベルでそれだけで置かれた `;` も取り除きます。
subgraph の中で、それだけで 1 つの文になる `;` は、1 行に置いて残します。
mermaid.js はそれを subgraph のメンバーに入れます。
文の中にある `;` は、mermaid.js が一部の行で読み飛ばすもので、その位置に残し、
その行も残します（[1 行に 1 文](#1-行に-1-文)を参照）。
文の終わりの `;` も、
同じ行でその後にディレクティブが続くときは残します。
`;` がないと、ディレクティブの前の空白が文の一部として読まれるからです。

入力 ([semicolons/removed-input.mmd](../tests/fixtures/flowchart/semicolons/removed-input.mmd)):

```mmd
flowchart LR;
  A --> B;
  B --> C;;
  ;
```

出力 ([semicolons/removed-output.mmd](../tests/fixtures/flowchart/semicolons/removed-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
```

入力 ([semicolons/kept-in-subgraph-input.mmd](../tests/fixtures/flowchart/semicolons/kept-in-subgraph-input.mmd)):

```mmd
flowchart LR
  subgraph outer
    subgraph inner
      A;;
    end;
  end
```

出力 ([semicolons/kept-in-subgraph-output.mmd](../tests/fixtures/flowchart/semicolons/kept-in-subgraph-output.mmd)):

```mmd
flowchart LR
  subgraph outer
    subgraph inner
      A
      ;
    end
    ;
  end
```

入力 ([semicolons/ignored-in-statement-kept-input.mmd](../tests/fixtures/flowchart/semicolons/ignored-in-statement-kept-input.mmd)):

```mmd
flowchart LR
A[style:#x] e;@-->B
```

出力 ([semicolons/ignored-in-statement-kept-output.mmd](../tests/fixtures/flowchart/semicolons/ignored-in-statement-kept-output.mmd)):

```mmd
flowchart LR
  A[style:#x] e;@--> B
```

入力 ([semicolons/kept-before-items-input.mmd](../tests/fixtures/flowchart/semicolons/kept-before-items-input.mmd)):

```mmd
flowchart LR
A
B
class A c; %%{init: {}}%%
C; D
```

出力 ([semicolons/kept-before-items-output.mmd](../tests/fixtures/flowchart/semicolons/kept-before-items-output.mmd)):

```mmd
flowchart LR
  A
  B
  class A c; %%{init: {}}%%
  C
  D
```

### 空行

連続する空行は 1 つの空行にします。
テキストの先頭と末尾、subgraph の先頭と末尾の空行は取り除きます。
テキストはちょうど 1 つの改行で終わります。

入力 ([blank-lines/collapsed-input.mmd](../tests/fixtures/flowchart/blank-lines/collapsed-input.mmd)):

```mmd


flowchart LR


  A --> B



  B --> C
  subgraph S

    C

  end


```

出力 ([blank-lines/collapsed-output.mmd](../tests/fixtures/flowchart/blank-lines/collapsed-output.mmd)):

```mmd
flowchart LR
  A --> B

  B --> C
  subgraph S
    C
  end
```

### トークンの間の空白

同じ行の中で、2 つのトークンの間にある空白とタブの連続は、空白 1 つにします。
値の一部である空白は保ちます。
スタイルの並びの `,` の前後の空白は mermaid.js がスタイルに残し、
subgraph の名前の中の空白はそのタイトルになります。
`style`・`classDef`・`linkStyle` の文では、id、クラス名、
辺の番号の直後の空白だけを空白 1 つにします。
その後から最後のスタイルまでは、ディレクティブと空白も含めて、
書かれたまま残します。
mermaid.js はそれを最初のスタイルの一部として読むからです。

入力 ([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
flowchart   LR
  A   -->   B
  C   &   D --> E
  style   A   fill:#f00
  class   A   c
  F	-->	G
```

出力 ([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
flowchart LR
  A --> B
  C & D --> E
  style A fill:#f00
  class A c
  F --> G
```

入力 ([whitespace-between-tokens/style-values-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-values-kept-input.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

出力 ([whitespace-between-tokens/style-values-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-values-kept-output.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

入力 ([whitespace-between-tokens/subgraph-name-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-kept-input.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

出力 ([whitespace-between-tokens/subgraph-name-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-kept-output.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

入力 ([whitespace-between-tokens/style-after-two-items-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-two-items-kept-input.mmd)):

```mmd
flowchart LR
A
style   A %%{init: {}}%%  %%{init: {}}%%fill:red
classDef   a,b   %%{init: {}}%% %%{init: {}}%%  fill:red
A-->A
linkStyle   0   %%{init: {}}%%  fill:red
linkStyle default interpolate   basis   %%{init: {}}%%  %%{init: {}}%%stroke:red
```

出力 ([whitespace-between-tokens/style-after-two-items-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-two-items-kept-output.mmd)):

```mmd
flowchart LR
  A
  style A %%{init: {}}%%  %%{init: {}}%%fill:red
  classDef a,b %%{init: {}}%% %%{init: {}}%%  fill:red
  A --> A
  linkStyle 0 %%{init: {}}%%  fill:red
  linkStyle default interpolate basis %%{init: {}}%%  %%{init: {}}%%stroke:red
```

### 矢印の前後の空白

辺の前と後に空白を 1 つずつ置きます。
2 つの矢印の間に書いたテキストは、両側に空白を 1 つずつ置きます。
`|` で囲んだラベルは矢印とその `|` に接し、辺の id はその `@` と矢印に接します。

入力 ([arrow-spacing/plain-input.mmd](../tests/fixtures/flowchart/arrow-spacing/plain-input.mmd)):

```mmd
flowchart LR
  A-->B
  C==>D
  E-.->F
  Gx--xH
```

出力 ([arrow-spacing/plain-output.mmd](../tests/fixtures/flowchart/arrow-spacing/plain-output.mmd)):

```mmd
flowchart LR
  A --> B
  C ==> D
  E -.-> F
  Gx --x H
```

入力 ([arrow-spacing/text-between-arrows-input.mmd](../tests/fixtures/flowchart/arrow-spacing/text-between-arrows-input.mmd)):

```mmd
flowchart LR
  A--text-->B
  C==  thick  ==>D
```

出力 ([arrow-spacing/text-between-arrows-output.mmd](../tests/fixtures/flowchart/arrow-spacing/text-between-arrows-output.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C == thick ==> D
```

入力 ([arrow-spacing/pipe-label-input.mmd](../tests/fixtures/flowchart/arrow-spacing/pipe-label-input.mmd)):

```mmd
flowchart LR
  A-->|text|B
  C --> |text| D
```

出力 ([arrow-spacing/pipe-label-output.mmd](../tests/fixtures/flowchart/arrow-spacing/pipe-label-output.mmd)):

```mmd
flowchart LR
  A -->|text| B
  C -->|text| D
```

入力 ([arrow-spacing/edge-id-input.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-input.mmd)):

```mmd
flowchart LR
  A e1@-->B
```

出力 ([arrow-spacing/edge-id-output.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-output.mmd)):

```mmd
flowchart LR
  A e1@--> B
```

### ラベルの内側の空白

引用符のないラベルの両端の空白は、mermaid.js が取り除くのと同じく取り除きます。
ラベルの中の空白は保ち、空白だけのラベルも保ちます（`A[]` は拒否されます）。
引用符で囲んだラベルは書かれたまま残します。

ラベルの先頭の空白は、それがないとラベルの読み方が変わるときは、
空白 1 つとして残します。
ラベルが `/`、`\`、`-`、`"` のどれかで始まるときと、
最初の語（空白か `"` まで）が `@` を含むときです。
空白がないと、`A[ /x/]` はラベル `x` の lean-right の形に、
`A( -x-)` は ellipse になり、`A[ x@ ]` は拒否されます。
そうしたラベルは、末尾にも空白 1 つを置きます。
`A[ /x/]` は `A[ /x/ ]` になります。
ただし、斜めの形の閉じの `?]` と `=]` の前には置きません。
mermaid.js が、その空白と `?` や `=` をテキストとして読むからです。
`A[/ -x/?]` はそのままです。
この規則は、どの形でも、`|` の間のテキストでも同じです。

入力 ([label-inner-whitespace/trimmed-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/trimmed-input.mmd)):

```mmd
flowchart LR
  A[ text ]
  B( round )
  C{ decision }
  A -->| label |B
```

出力 ([label-inner-whitespace/trimmed-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/trimmed-output.mmd)):

```mmd
flowchart LR
  A[text]
  B(round)
  C{decision}
  A -->|label| B
```

入力 ([label-inner-whitespace/inner-whitespace-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/inner-whitespace-kept-input.mmd)):

```mmd
flowchart LR
  A[ hello   world ]
```

出力 ([label-inner-whitespace/inner-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/inner-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[hello   world]
```

入力 ([label-inner-whitespace/quoted-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/quoted-kept-input.mmd)):

```mmd
flowchart LR
  A[" text "]
```

出力 ([label-inner-whitespace/quoted-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/quoted-kept-output.mmd)):

```mmd
flowchart LR
  A[" text "]
```

入力 ([label-inner-whitespace/leading-whitespace-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-input.mmd)):

```mmd
flowchart LR
A[ /x/]
B( -x-)
C(( -x))
D[/ "x /]
E[ user@example.com ]
F-->| x@ |G
H[ %%{init: {}}%%/x/]
I{ -x }
```

出力 ([label-inner-whitespace/leading-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[ /x/ ]
  B( -x- )
  C(( -x ))
  D[/ "x /]
  E[ user@example.com ]
  F -->| x@ | G
  H[ %%{init: {}}%%/x/ ]
  I{ -x }
```

入力 ([label-inner-whitespace/leading-whitespace-before-question-end-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-before-question-end-kept-input.mmd)):

```mmd
flowchart LR
B[/ -x/?]
C[/ -x/=]
```

出力 ([label-inner-whitespace/leading-whitespace-before-question-end-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-before-question-end-kept-output.mmd)):

```mmd
flowchart LR
  B[/ -x/?]
  C[/ -x/=]
```

### 辺のラベルの書き方

辺のラベルは、書かれた形を保ちます。
2 つの矢印の間のテキストか、矢印の後の `|` の間のテキストです。
一方の形をもう一方に変えるには、`|` を含むラベルの規則が要ります。
`A -- a|b --> B` は受理されますが、`A -->|a|b| B` は拒否されます。

入力 ([link-label-form/kept-input.mmd](../tests/fixtures/flowchart/link-label-form/kept-input.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C -->|text| D
```

出力 ([link-label-form/kept-output.mmd](../tests/fixtures/flowchart/link-label-form/kept-output.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C -->|text| D
```

### 連鎖

辺の連鎖は、書かれたとおり 1 行に保ちます。
1 辺 1 行には分けません。
長い行や複数行に書かれた文と同じく、書き手が文や辺を区切った位置を保ちます。

入力 ([chains/kept-input.mmd](../tests/fixtures/flowchart/chains/kept-input.mmd)):

```mmd
flowchart LR
  A --> B --> C
  D & E --> F
```

出力 ([chains/kept-output.mmd](../tests/fixtures/flowchart/chains/kept-output.mmd)):

```mmd
flowchart LR
  A --> B --> C
  D & E --> F
```

### 折り返し

Prettier の `printWidth` オプションにかかわらず、行を折り返しません。
連鎖と同じく、行をどこで分けるかは書き手が決めます。

入力 ([line-wrapping/long-line-kept-input.mmd](../tests/fixtures/flowchart/line-wrapping/long-line-kept-input.mmd)):

```mmd
flowchart LR
  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD
```

出力 ([line-wrapping/long-line-kept-output.mmd](../tests/fixtures/flowchart/line-wrapping/long-line-kept-output.mmd)):

```mmd
flowchart LR
  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD
```

### 複数行の文

複数行に書かれた文は改行を保ち、2 行目以降を 1 行目より 1 段深く置きます。
途中のコメント行は文の中に残り、2 行目以降と同じ段に置きます。
複数行に書かれた `click` の文は書かれたまま残します。
mermaid.js は、2 行目以降が字下げされていると、その一部を拒否するからです。

入力 ([multi-line-statements/continuation-indented-input.mmd](../tests/fixtures/flowchart/multi-line-statements/continuation-indented-input.mmd)):

```mmd
flowchart LR
  A -->
B -->
      C
```

出力 ([multi-line-statements/continuation-indented-output.mmd](../tests/fixtures/flowchart/multi-line-statements/continuation-indented-output.mmd)):

```mmd
flowchart LR
  A -->
    B -->
    C
```

入力 ([multi-line-statements/comment-inside-input.mmd](../tests/fixtures/flowchart/multi-line-statements/comment-inside-input.mmd)):

```mmd
flowchart LR
  A -->
%% between
B
```

出力 ([multi-line-statements/comment-inside-output.mmd](../tests/fixtures/flowchart/multi-line-statements/comment-inside-output.mmd)):

```mmd
flowchart LR
  A -->
    %% between
    B
```

入力 ([multi-line-statements/click-kept-input.mmd](../tests/fixtures/flowchart/multi-line-statements/click-kept-input.mmd)):

```mmd
flowchart LR
  A
  click A
cb
```

出力 ([multi-line-statements/click-kept-output.mmd](../tests/fixtures/flowchart/multi-line-statements/click-kept-output.mmd)):

```mmd
flowchart LR
  A
  click A
cb
```

### 複数行の値

複数行に書かれた値の行は、桁を保ちます。
引用符で囲んだ文字列と、
`{` の次の行から始まる `accDescr { ... }` ブロックのテキストです。
subgraph の中では、
mermaid.js はそのブロックのテキストを字下げごと
subgraph のメンバーにも入れるので、字下げを変えられません。
ブロックの `}` は、それが閉じる `accDescr` と同じ段に置きます。
そうしたブロックの中のコメント行も、書かれたまま残します。
テキストが `{` と同じ行から始まるときは、その前後の空白を、
トークンの間と同じく空白 1 つにします。
テキストがなく、コメント行だけを持つブロックは、値を持ちません。
そのコメント行は、文の中のコメント行と同じく、
`accDescr` より 1 段深く置き（[コメント](#コメント)を参照）、
`}` は `accDescr` と同じ段に置きます。

入力 ([multi-line-values/string-kept-input.mmd](../tests/fixtures/flowchart/multi-line-values/string-kept-input.mmd)):

```mmd
flowchart LR
  A["first line
      second line"]
```

出力 ([multi-line-values/string-kept-output.mmd](../tests/fixtures/flowchart/multi-line-values/string-kept-output.mmd)):

```mmd
flowchart LR
  A["first line
      second line"]
```

入力 ([multi-line-values/accdescr-block-closing-brace-aligned-input.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-closing-brace-aligned-input.mmd)):

```mmd
flowchart LR
subgraph S
accDescr {
  first line
      second line
      }
A
end
accDescr {   one line   }
accDescr {
  text
%% note
    }
accDescr {
}
```

出力 ([multi-line-values/accdescr-block-closing-brace-aligned-output.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-closing-brace-aligned-output.mmd)):

```mmd
flowchart LR
  subgraph S
    accDescr {
  first line
      second line
    }
    A
  end
  accDescr { one line }
  accDescr {
  text
%% note
  }
  accDescr {
  }
```

入力 ([multi-line-values/accdescr-block-comment-only-input.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-comment-only-input.mmd)):

```mmd
flowchart LR
A
accDescr {
%% only a comment
      }
```

出力 ([multi-line-values/accdescr-block-comment-only-output.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-comment-only-output.mmd)):

```mmd
flowchart LR
  A
  accDescr {
    %% only a comment
  }
```

### コメント

1 行に置かれたコメントは、周りの文と同じ段に置きます。
ヘッダーの前でも同じで、行の先頭に置きます。
コメントのテキストは、末尾の空白も含めて書かれたまま残します。
mermaid.js は読まず、書き手のテキストだからです。

入力 ([comments/indented-input.mmd](../tests/fixtures/flowchart/comments/indented-input.mmd)):

```mmd
flowchart LR
%% top comment
A --> B
      %%comment written without a space
  subgraph S
%% inside
    C
  end
```

出力 ([comments/indented-output.mmd](../tests/fixtures/flowchart/comments/indented-output.mmd)):

```mmd
flowchart LR
  %% top comment
  A --> B
  %%comment written without a space
  subgraph S
    %% inside
    C
  end
```

入力 ([comments/before-end-input.mmd](../tests/fixtures/flowchart/comments/before-end-input.mmd)):

```mmd
flowchart LR
subgraph S
A
%% before end
end
```

出力 ([comments/before-end-output.mmd](../tests/fixtures/flowchart/comments/before-end-output.mmd)):

```mmd
flowchart LR
  subgraph S
    A
    %% before end
  end
```

### ディレクティブ

1 行に置かれたディレクティブ（`%%{ ... }%%`）は、周りの文と同じ段に置きます。
文と同じ行にあるディレクティブはその行に残ります。
ディレクティブの側に空白が書かれていればそこに空白 1 つを置き、
トークンに接していれば接したまま残します。
mermaid.js はディレクティブを除いたテキストを読むので、
2 つのトークンが離れているかどうかを変えてはいけないからです。
ディレクティブの中身は書かれたまま残します。

入力 ([directives/indented-input.mmd](../tests/fixtures/flowchart/directives/indented-input.mmd)):

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
%%{init: {"flowchart": {"curve": "basis"}}}%%
A --> B
```

出力 ([directives/indented-output.mmd](../tests/fixtures/flowchart/directives/indented-output.mmd)):

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  %%{init: {"flowchart": {"curve": "basis"}}}%%
  A --> B
```

入力 ([directives/same-line-as-statements-input.mmd](../tests/fixtures/flowchart/directives/same-line-as-statements-input.mmd)):

```mmd
flowchart LR
  A --> B %%{init: {}}%%
  C; %%{init: {}}%% D
```

出力 ([directives/same-line-as-statements-output.mmd](../tests/fixtures/flowchart/directives/same-line-as-statements-output.mmd)):

```mmd
flowchart LR
  A --> B %%{init: {}}%%
  C
  %%{init: {}}%% D
```

入力 ([directives/touching-token-kept-input.mmd](../tests/fixtures/flowchart/directives/touching-token-kept-input.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%-->B
```

出力 ([directives/touching-token-kept-output.mmd](../tests/fixtures/flowchart/directives/touching-token-kept-output.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%--> B
```

入力 ([directives/whitespace-on-each-side-kept-input.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-kept-input.mmd)):

```mmd
flowchart %%{init: {}}%%LR
A
style A %%{init: {}}%%fill:red
click A %%{init: {}}%%href "u"
B%%{init: {}}%% --> C
```

出力 ([directives/whitespace-on-each-side-kept-output.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-kept-output.mmd)):

```mmd
flowchart %%{init: {}}%%LR
  A
  style A %%{init: {}}%%fill:red
  click A %%{init: {}}%%href "u"
  B%%{init: {}}%% --> C
```

閉じていないディレクティブは、mermaid.js が読むとおり、
テキストの終わりまで続きます。
その範囲は、空白でない最後の文字で終わります
（仕様の[コメント、ディレクティブ、フロントマター](../../spec/docs/ast.ja.md#コメントディレクティブフロントマター)）。
そのため、その後の空白はテキストの末尾の空白で、そのとおりに整形します。
テキストは、ディレクティブの後の改行 1 つで終わります。
テキストがディレクティブの直後で終わるときは、改行を足しません。
足した改行を、mermaid.js がディレクティブの一部として読むからです。
これらの例は、対象の空白がテキストの末尾にあるので、ここには載せません。
[フォルダー](../tests/fixtures/flowchart/directives)の、
`unclosed-trailing-whitespace` と、
`unclosed-at-end-of-text-kept` のファイルを見てください。

### 方向

方向は書かれたまま残します。
ヘッダーでも `direction` の文でも、`TD` を `TB` に変えません。
mermaid.js は subgraph の中の `direction` の文の
`TD` を書かれたとおりに保つので、そこを変えると図が変わり、
ヘッダーだけを変えると両者が揃わなくなるからです。

入力 ([direction/kept-input.mmd](../tests/fixtures/flowchart/direction/kept-input.mmd)):

```mmd
flowchart TD
  subgraph S
    direction TD
    A
  end
```

出力 ([direction/kept-output.mmd](../tests/fixtures/flowchart/direction/kept-output.mmd)):

```mmd
flowchart TD
  subgraph S
    direction TD
    A
  end
```

### subgraph のヘッダー

subgraph の id と角括弧のタイトルの間に空白があるかないかは、
書かれたまま残します。
空白の連続は空白 1 つにします。
mermaid.js はどちらの形も同じに読み、どちらも使われているので、
書き手に任せます。
タイトルなしで書かれた名前は、その後の空白を保ちます。
mermaid.js はその空白を名前の一部として読みます。

入力 ([subgraph-header/title-spacing-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/title-spacing-kept-input.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T [Title]
    B
  end
```

出力 ([subgraph-header/title-spacing-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/title-spacing-kept-output.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T [Title]
    B
  end
```

入力 ([subgraph-header/name-whitespace-before-directive-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/name-whitespace-before-directive-kept-input.mmd)):

```mmd
flowchart LR
  subgraph S %%{init: {}}%%
    A
  end
```

出力 ([subgraph-header/name-whitespace-before-directive-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/name-whitespace-before-directive-kept-output.mmd)):

```mmd
flowchart LR
  subgraph S %%{init: {}}%%
    A
  end
```

### スタイルの行末の空白

`style`、`classDef`、`linkStyle` の文の末尾の空白は取り除きます。
mermaid.js はその空白を最後のスタイルの末尾に残すので、
この規則だけは mermaid.js が保存するものを変えます。
テストは、両端の空白を除いたスタイルを比べます。
mermaid.js がその空白を、
並びの末尾の `,` の後の 1 つのスタイルとして読むときは、空白を保ちます。
取り除くと文が拒否されるからです。
`style A fill:#f00, ` と `classDef c fill:x\, ` がそうです。
ディレクティブの後や、mermaid.js が無視する `;` の後の、
空白だけのスタイルも同じです。
`style A fill:red,%%{init: {}}%% ` と `style A fill:#f00,; ` がそうです。

この規則の例は、対象の空白が行末にあるので、ここには載せません。
[フォルダー](../tests/fixtures/flowchart/style-trailing-whitespace)を見てください。

### フロントマターの YAML

`---` の行の間の YAML は、Prettier の YAML 整形で整形します。
`---` の行は書かれたまま残します。
Prettier が YAML として読めないときと、`---` の行が字下げされているときは、
YAML を書かれたまま残します。
`---` の行は書かれたまま残すので、
字下げされた `---` の行の間で本文だけが 1 桁目にあると、崩れて見えるからです。
整形した YAML の行に `---` の行があって、
フロントマターを途中で終わらせるときも、書かれたまま残します。
Prettier は、
`%YAML` の指示子の後の `--- !!map` を `---` と `!!map` の 2 行に印字します。
`<` の後に英字、数字、`_` のいずれかが続く箇所を含むときも、
書かれたまま残します。
mermaid.js は YAML を読む前に、フロントマターを含むテキスト全体で、
HTML タグの中の `="..."` を書き換えます。
そうした値の引用符を変えると、mermaid.js が読むものが変わることがあります。

入力 ([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   'Hello'
config: {flowchart: {curve: basis}}
---
flowchart LR
A-->B
```

出力 ([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: "Hello"
config: { flowchart: { curve: basis } }
---
flowchart LR
  A --> B
```

入力 ([frontmatter-yaml/malformed-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/malformed-kept-input.mmd)):

```mmd
---
title: [unclosed
---
flowchart LR
A-->B
```

出力 ([frontmatter-yaml/malformed-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/malformed-kept-output.mmd)):

```mmd
---
title: [unclosed
---
flowchart LR
  A --> B
```

入力 ([frontmatter-yaml/html-tag-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/html-tag-kept-input.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
flowchart LR
A-->B
```

出力 ([frontmatter-yaml/html-tag-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/html-tag-kept-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
flowchart LR
  A --> B
```

入力 ([frontmatter-yaml/delimiter-line-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/delimiter-line-kept-input.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
flowchart LR
A
```

出力 ([frontmatter-yaml/delimiter-line-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/delimiter-line-kept-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
flowchart LR
  A
```

入力 ([frontmatter-yaml/indented-delimiters-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/indented-delimiters-kept-input.mmd)):

```mmd
  ---
  title: |
      ---
  ---
flowchart LR
A
```

出力 ([frontmatter-yaml/indented-delimiters-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/indented-delimiters-kept-output.mmd)):

```mmd
  ---
  title: |
      ---
  ---
flowchart LR
  A
```

## 書かれたまま残すもの

次のものは、変えると図が変わるか、入力が拒否されるので、
いつも書かれたまま残します。

- ラベルが引用符で囲まれているかどうか。
  `A[text]` と `A["text"]` はラベルの種類が違います。
- `&` の前後に空白があるかどうか。
  `A&B` は頂点 1 つ、`A & B` は 2 つで、`A &B` は拒否されます。
  空白の連続は、トークンの間と同じく空白 1 つにします。
- 矢印の長さ（`-->` と `--->`）と、
  ヘッダーのキーワード（`graph` か `flowchart`）。
- `@{ ... }` のデータブロックとディレクティブの中身。
  パーサーは読みません。
- 複数行に書かれた文字列と Markdown 文字列の行。
  行頭の空白が値の一部です。

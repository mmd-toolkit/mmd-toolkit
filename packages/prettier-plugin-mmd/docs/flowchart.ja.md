# flowchart の整形規則

英語版: [flowchart.md](./flowchart.md)

prettier-plugin-mmd が flowchart をどう整形するかを説明します。
対象の図種は `flowchart`、`graph`、`flowchart-elk`、`swimlane-beta` です。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### 字下げ

ヘッダーの後の文はヘッダーより 1 段、
subgraph の文はその `subgraph` の行より 1 段深く置き、
`end` は `subgraph` と同じ段に置きます。
1 段は Prettier の `useTabs` と `tabWidth` オプションのとおりで、
既定は空白 2 つで、Prettier が整形するほかの言語と同じです。
ヘッダーの後の文を 1 段深くするのは、mermaid.js の文書の書き方です。
[fixture: indentation/use-tabs]
入力に書かれた字下げは保ちません。
字下げは mermaid.js が読むものではないので、構造だけから決めます。
[fixture: indentation/statements] [fixture: indentation/empty-description-block]

入力
([indentation/nested-subgraphs-input.mmd](../tests/fixtures/flowchart/indentation/nested-subgraphs-input.mmd)):

```mmd
flowchart TB
subgraph outer
subgraph inner
A --> B
end
C
end
```

出力
([indentation/nested-subgraphs-output.mmd](../tests/fixtures/flowchart/indentation/nested-subgraphs-output.mmd)):

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
（
[オプション](../tests/fixtures/flowchart/indentation/tab-width-4-options.json)
）:

入力
([indentation/tab-width-4-input.mmd](../tests/fixtures/flowchart/indentation/tab-width-4-input.mmd)):

```mmd
flowchart LR
subgraph S
A --> B
end
```

出力
([indentation/tab-width-4-output.mmd](../tests/fixtures/flowchart/indentation/tab-width-4-output.mmd)):

```mmd
flowchart LR
    subgraph S
        A --> B
    end
```

`direction` の後に空白と `TB`、`BT`、`RL`、`LR`、
`TD` のどれかが続くテキストを含み、方向の文ではない行は、
字下げも含めて書かれたまま残します。
[fixture: indentation/direction-text-values-kept]
[fixture: indentation/direction-text-with-directive-kept]
[fixture: indentation/acc-descr-block-direction-text-kept]
[fixture: indentation/compat-direction-text-indented]
mermaid.js は、そうしたテキストを含む行を字下げすると、方向の文として読みます。
`accTitle: t;direction TB` はアクセシビリティのタイトルですが、
同じ行を字下げすると方向 `TB` になります。

入力
([indentation/direction-text-kept-input.mmd](../tests/fixtures/flowchart/indentation/direction-text-kept-input.mmd)):

```mmd
flowchart LR
A-->B
accTitle: t;direction TB
subgraph S
accDescr: d ; direction LR
C
end
```

出力
([indentation/direction-text-kept-output.mmd](../tests/fixtures/flowchart/indentation/direction-text-kept-output.mmd)):

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
[fixture: statements-one-per-line/compat-empty-description-block-after-statement]
[fixture: statements-one-per-line/compat-empty-description-block-before-separator]
[fixture: statements-one-per-line/compat-empty-description-block-before-statement]
1 行に書かれ `;` で区切られた文は、行に分けます。
`;` は文を区切るだけで、1 行に複数の文があると読みにくいからです。
[fixture: statements-one-per-line/separated-by-semicolons-meets-others]

ただし、文を区切る `;` 以外の `;` を含む行は、文と `;` を行に残します。
`A[x;]`、`accTitle: a;b`、コメントの中の `;` などがそうした `;` です。
文を別の行に分けず、`;` はその位置に、両側の空白も書かれたとおりにして残します。
[fixture: statements-one-per-line/inner-semicolon-kept]
[fixture: statements-one-per-line/comment-semicolon-not-separator]
[fixture: statements-one-per-line/compat-semicolon-in-label-without-style-kept]
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
ただし、`:` とその後の `#` の間の空白は、
あるかないかを変えません（[Semicolons](#semicolons)を参照）。

入力
([statements-one-per-line/separated-by-semicolons-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-input.mmd)):

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

出力
([statements-one-per-line/separated-by-semicolons-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/separated-by-semicolons-output.mmd)):

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

入力
([statements-one-per-line/line-with-semicolon-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/line-with-semicolon-kept-input.mmd)):

```mmd
flowchart LR
A[style:#x;];
B["style:#x;"];
accTitle: style:#x;y;
C[style:#x;] --> D;
E[style:#x;];F[y;]
G[x;]; style H fill:#f00;
I[style:#x;]-->J;   -->L
```

出力
([statements-one-per-line/line-with-semicolon-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/line-with-semicolon-kept-output.mmd)):

```mmd
flowchart LR
  A[style:#x;];
  B["style:#x;"];
  accTitle: style:#x;y;
  C[style:#x;] --> D;
  E[style:#x;];F[y;]
  G[x;]; style H fill:#f00;
  I[style:#x;] --> J; --> L
```

文が id `accTitle`、`accDescr`、`direction`、`click`、`call`、`href` のどれか、
または `direction` で終わる id で終わり、次の文との間を `;` が区切るときも、
文を行にまとめ、`;` をその位置に残します。
id が `A-->call;` のようにリンクの末尾にあるときも同じです。
[fixture: statements-one-per-line/semicolon-after-word-between-others-kept]
[fixture: statements-one-per-line/semicolon-after-link-to-word-kept]
[fixture: statements-one-per-line/semicolon-after-word-not-at-end-split]
mermaid.js は、これらの語の後の空白を、改行も含めて語と一緒に読むからです。
`accTitle ; :` は頂点 `accTitle` と `:` ですが、
`accTitle` と `:` を 2 行に書くとアクセシビリティのタイトルになります。

入力
([statements-one-per-line/semicolon-after-word-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-word-kept-input.mmd)):

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

出力
([statements-one-per-line/semicolon-after-word-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-word-kept-output.mmd)):

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

同じ行で空の説明ブロックと `;` が続くスタイル文、
クラス定義文、リンクスタイル文は、
ブロックと `;` と一緒に、それらがまたがる行のまま残します。
ブロックはトークンを読まないので、ブロックの前の空白が文の最後の単位を終わらせ、
ブロックの後の空白が、空白だけの最後のスタイルになります。
ブロックがなければそのスタイルはなくなり、残った形を mermaid.js は拒否します。
`style A`、`classDef c`、`linkStyle 0 interpolate basis` に、
空白と改行が続く形がそうです。

入力
([statements-one-per-line/empty-style-before-block-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/empty-style-before-block-kept-input.mmd)):

```mmd
flowchart LR
A-->B
linkStyle 0 interpolate basis accDescr {} ;
classDef c accDescr {}accDescr {} ;
style A accDescr {
} ;B
```

出力
([statements-one-per-line/empty-style-before-block-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/empty-style-before-block-kept-output.mmd)):

```mmd
flowchart LR
  A --> B
  linkStyle 0 interpolate basis accDescr {} ;
  classDef c accDescr {}accDescr {} ;
  style A accDescr {
  } ;B
```

単語が subgraph の名前や、
スタイル、クラス定義、リンクスタイルのテキストの終わりにあるときも同じです。
その単語は `end`、`click`、`call`、`href` で、
スタイルのテキストでは、`fill:click` のように、
ASCII の英数字以外の文字の後にあっても終わりの単語です。
[fixture: statements-one-per-line/semicolon-after-style-text-word-kept]
[fixture: statements-one-per-line/semicolon-after-style-text-not-word-split]
名前の中の `end` は、その後の空白を、改行も含めて取ります。
そのため、`subgraph Front end` に改行と `A` が続くと、
名前は `Front end`、改行、`A` で、メンバーはなく、
`subgraph Front end ;` ではメンバー A があります。
`;` が後の行にあるときも、`;` はそのまま残り、
その前の空白も書かれたまま、`subgraph` の行の一部になります。
[corpus fixture: flowchart/semicolon-after-end-name-2a3a795c]
名前の後の改行を読むのは `end` と `click` だけで、
一覧のほかの単語は、文のテキストと一覧を共用しているために入っています。
そこで `;` を残しても、mermaid.js が読むものは変わりません。
[fixture: statements-one-per-line/semicolon-after-name-word-kept]
[corpus fixture: flowchart/name-semicolon-whitespace-0c9483e4]
[corpus fixture: flowchart/name-semicolon-whitespace-0fd5a434]
[corpus fixture: flowchart/name-semicolon-whitespace-05fd0f99]
`Front pend` と `Front endx` は、単語で終わりません。
[fixture: statements-one-per-line/semicolon-after-name-not-end-dropped]
ディレクティブが単語を切っていても同じです。
mermaid.js はテキストを読む前にディレクティブを取り除くからです。
[fixture: statements-one-per-line/semicolon-after-word-cut-by-directive-kept]

入力
([statements-one-per-line/semicolon-after-end-name-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-end-name-kept-input.mmd)):

```mmd
flowchart LR
subgraph Front end ;
A
end
subgraph "S" end;
B
end
style B fill:click;
C
classDef c href;D
subgraph T end

  ;
D
end
```

出力
([statements-one-per-line/semicolon-after-end-name-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/semicolon-after-end-name-kept-output.mmd)):

```mmd
flowchart LR
  subgraph Front end ;
    A
  end
  subgraph "S" end;
    B
  end
  style B fill:click;
  C
  classDef c href;D
  subgraph T end

  ;
    D
  end
```

同じ行で `;` や説明ブロックの `}` の後に続く `%%`
（`A;%%x`、`A; %%x`、`accDescr {y}%%z` など）は、
前に空白があってもなくても、mermaid.js ではコメントを始めません。
テキストの始まりで、頂点 `%%x` になります。
単独の行に置くとコメントになるので、
その行は書かれたとおりにトークンを保ち、
文は単独の行に移しません。
[fixture: statements-one-per-line/glued-percent-after-label-kept]
[fixture: statements-one-per-line/percent-token-after-whitespace-kept]
[fixture: statements-one-per-line/percent-token-after-block-and-directive-kept]
[fixture: statements-one-per-line/percent-token-in-subgraph-kept]
ラベルやリンクのテキストの中の `%%` は文を始めず、
その行はほかと同じように整形します。
[fixture: statements-one-per-line/percent-in-label-formatted]

入力
([statements-one-per-line/glued-percent-token-kept-input.mmd](../tests/fixtures/flowchart/statements-one-per-line/glued-percent-token-kept-input.mmd)):

```mmd
flowchart LR
A;%%x
B
accDescr {y}%%z
C --> D
```

出力
([statements-one-per-line/glued-percent-token-kept-output.mmd](../tests/fixtures/flowchart/statements-one-per-line/glued-percent-token-kept-output.mmd)):

```mmd
flowchart LR
  A;%%x
  B
  accDescr {y}%%z
  C --> D
```

### セミコロン

文の終わりの `;` は取り除き、
トップレベルでそれだけで置かれた `;` も取り除きます。
[fixture: semicolons/alone-between-empty-lines-removed]
[fixture: semicolons/alone-between-comments-removed]
[fixture: semicolons/before-empty-description-block-removed]
subgraph の中で、それだけで 1 つの文になる `;` は、1 行に置いて残します。
mermaid.js はそれを subgraph のメンバーに入れます。
[fixture: semicolons/kept-in-subgraph-own-line]
[fixture: semicolons/kept-in-subgraph-with-directive]
[fixture: semicolons/kept-in-subgraph-repeated]
文の中にある `;` は、mermaid.js が一部の行で読み飛ばすもので、その位置に残し、
その行も残します（[1 行に 1 文](#1-行に-1-文)を参照）。
[fixture: semicolons/compat-ignored-semicolon-in-label]
[fixture: semicolons/compat-ignored-semicolon-in-string]
文の終わりの `;` も、
同じ行でその後にディレクティブが続くときは残します。
`;` がないと、ディレクティブの前の空白が文の一部として読まれるからです。
[fixture: semicolons/kept-before-trailing-directive]
`;` を落とすと、行の終わりか、行の規則が無視する `;` が変わる行は、
書かれたまま印字します。
閉じていないディレクティブの後の `;`、別の `;` に接する無視される `;`、
U+2028 か U+2029 の前の無視される `;` がある行です
（[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
[fixture: semicolons/kept-after-unclosed-directive]
[fixture: semicolons/ignored-next-to-another-kept]
[fixture: statements-one-per-line/compat-unclosed-directive-semicolon-kept]
[fixture: statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
[corpus fixture: flowchart/ignored-semicolon-after-directive-1abc682b]
[corpus fixture: flowchart/style-line-separator-semicolon-2a0f3253]
`style` か `classDef` を `:` の前に持ち、`#` の後に `;` がある行で、
`:` とその後の `#` の間の空白は、あるかないかを保ちます。
行の規則は、その間に空白がないときだけ、行の最後の `;` を無視するので、
`A[style:]-->B[# z;y]` の矢印の周りのように、
そこで空白を落としたり書いたりすると、ラベルが変わるからです。
[fixture: semicolons/style-line-gap-between-colon-and-hash-kept]
空白があるところは、ほかの所と同じに空白 1 つで印字します。
規則が問うのは空白があるかどうかで、いくつあるかではないからです。
`A[style: ]-->B[#z;y]` はそのままで、
`C[style:]   -->   D[#z;y]` は `C[style:] --> D[#z;y]` になります。
[fixture: semicolons/style-line-space-between-colon-and-hash-kept]
[fixture: semicolons/style-line-spaces-between-colon-and-hash-become-one]
行の末尾にある、規則が無視する `;` は落とします。
印字した行には規則が読む `;` がないので、
その空白はほかと同じに整えます。
[fixture: semicolons/style-line-dropped-semicolon-formats-the-gap]

入力
([semicolons/removed-input.mmd](../tests/fixtures/flowchart/semicolons/removed-input.mmd)):

```mmd
flowchart LR;
  A --> B;
  B --> C;;
  ;
```

出力
([semicolons/removed-output.mmd](../tests/fixtures/flowchart/semicolons/removed-output.mmd)):

```mmd
flowchart LR
  A --> B
  B --> C
```

文の終わりの `;` は、mermaid.js の行の規則が無視するものも取り除きます。
`style` 文の CSS の色の後の `;` がそうです。
mermaid.js はその `;` をテキストから取り除くので、落としても何も変わりません。
[fixture: semicolons/ignored-removed-other-statements]

入力
([semicolons/ignored-removed-input.mmd](../tests/fixtures/flowchart/semicolons/ignored-removed-input.mmd)):

```mmd
flowchart LR
A-->B
style A fill:#f00;
classDef c fill:#fff,stroke:#333;
style B   fill:#0f0 ;
```

出力
([semicolons/ignored-removed-output.mmd](../tests/fixtures/flowchart/semicolons/ignored-removed-output.mmd)):

```mmd
flowchart LR
  A --> B
  style A fill:#f00
  classDef c fill:#fff,stroke:#333
  style B fill:#0f0
```

入力
([semicolons/kept-in-subgraph-input.mmd](../tests/fixtures/flowchart/semicolons/kept-in-subgraph-input.mmd)):

```mmd
flowchart LR
  subgraph outer
    subgraph inner
      A;;
    end;
  end
```

出力
([semicolons/kept-in-subgraph-output.mmd](../tests/fixtures/flowchart/semicolons/kept-in-subgraph-output.mmd)):

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

入力
([semicolons/ignored-in-statement-kept-input.mmd](../tests/fixtures/flowchart/semicolons/ignored-in-statement-kept-input.mmd)):

```mmd
flowchart LR
A[style:#x] e;@-->B
```

出力
([semicolons/ignored-in-statement-kept-output.mmd](../tests/fixtures/flowchart/semicolons/ignored-in-statement-kept-output.mmd)):

```mmd
flowchart LR
  A[style:#x] e;@--> B
```

入力
([semicolons/kept-before-items-input.mmd](../tests/fixtures/flowchart/semicolons/kept-before-items-input.mmd)):

```mmd
flowchart LR
A
B
class A c; %%{init: {}}%%
C; D
```

出力
([semicolons/kept-before-items-output.mmd](../tests/fixtures/flowchart/semicolons/kept-before-items-output.mmd)):

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
Prettier がコードでそうするのと同じで、
空行は文をまとまりにし、2 つ以上は何も足さないからです。
[fixture: blank-lines/single-kept] [fixture: blank-lines/whitespace-only-lines]
[fixture: blank-lines/inside-multi-line-statement]
[fixture: blank-lines/around-comment-lines]
[fixture: blank-lines/around-directive-lines]
テキストの先頭と末尾、subgraph の先頭と末尾の空行は取り除きます。
[fixture: blank-lines/after-comment-before-header]
[fixture: blank-lines/after-frontmatter]
行をまたいで書かれた値（ラベルなど）のテキストの中の空行は、
値の一部なので残します。
[fixture: blank-lines/inside-values-kept]
テキストはちょうど 1 つの改行で終わります。
[fixture: blank-lines/header-only-without-line-break]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/flowchart/blank-lines/collapsed-input.mmd)):

```mmd


flowchart LR


  A --> B



  B --> C
  subgraph S

    C

  end


```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/flowchart/blank-lines/collapsed-output.mmd)):

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
行を、書いた人によらず 1 つの形にするためです。
接しているトークンは、下の規則（矢印の空白）がなければ接したままにします。
mermaid.js には、接しているときだけ読むトークンがあります。
`A%%{init: {}}%%B-->C` は id `AB` です。
接するトークンの間に空白を書く規則は、その場所ごとの例外を要するからです。
[fixture: whitespace-between-tokens/header-and-tabs-collapsed]
[fixture: whitespace-between-tokens/compat-empty-description-block-own-line]
値の一部である空白は保ちます。
スタイルの並びの `,` の前後の空白は mermaid.js がスタイルに残し、
subgraph の名前の中の空白はそのタイトルになります。
`direction` の文の、`direction` の前と値の後のテキストは例外で、
書かれたまま残します（[方向](#方向)を参照）。
[fixture: whitespace-between-tokens/style-values-in-class-def-and-link-style-kept]
[fixture: whitespace-between-tokens/subgraph-quoted-name-kept]
`style`・`classDef`・`linkStyle` の文では、
最初のスタイルの前の空白は、mermaid.js の文の規則が読むものなので、
そこにディレクティブがあるときも、空白 1 つにします。
`style A %%{init: {}}%%  fill:red` と `style A %%{init: {}}%% fill:red` は、
Db が同じです。
最初のスタイルの始まりから最後のスタイルまでは、書かれたまま残します。
mermaid.js はそれをスタイルの一部として読むからです。
[fixture: whitespace-between-tokens/style-inner-whitespace-kept]

subgraph の `end` の後の U+2028 と U+2029 は mermaid.js にとって空白なので、
行末の空白と一緒に落とします。
`end`、U+2028、改行は `end` と印字します。
[test: U+2028 after the `end` of a subgraph]
[test: U+2029 and whitespace around it after the `end` of a subgraph]

入力
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
flowchart   LR
  A   -->   B
  C   &   D --> E
  style   A   fill:#f00
  class   A   c
  F	-->	G
```

出力
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
flowchart LR
  A --> B
  C & D --> E
  style A fill:#f00
  class A c
  F --> G
```

入力
([whitespace-between-tokens/style-values-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-values-kept-input.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

出力
([whitespace-between-tokens/style-values-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-values-kept-output.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

入力
([whitespace-between-tokens/subgraph-name-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-kept-input.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

出力
([whitespace-between-tokens/subgraph-name-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-kept-output.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

入力
([whitespace-between-tokens/style-after-directives-collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-collapsed-input.mmd)):

```mmd
flowchart LR
A
style   A %%{init: {}}%%  %%{init: {}}%%fill:red
classDef   a,b   %%{init: {}}%% %%{init: {}}%%  fill:red
A-->A
linkStyle   0   %%{init: {}}%%  fill:red
linkStyle default interpolate   basis   %%{init: {}}%%  %%{init: {}}%%stroke:red
```

出力
([whitespace-between-tokens/style-after-directives-collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-collapsed-output.mmd)):

```mmd
flowchart LR
  A
  style A %%{init: {}}%% %%{init: {}}%%fill:red
  classDef a,b %%{init: {}}%% %%{init: {}}%% fill:red
  A --> A
  linkStyle 0 %%{init: {}}%% fill:red
  linkStyle default interpolate basis %%{init: {}}%% %%{init: {}}%%stroke:red
```

`call` の後の関数名と、その後の `(` の間の空白は、
括弧と引数と一緒に、書かれたまま残します。
mermaid.js は、名前を `(` の前まで、空白も含めて読むので、
`click A call fn  ()` は、`fn` と 2 つの空白を名前とする関数を呼びます。
[fixture: whitespace-between-tokens/callback-name-arguments-forms-kept]

入力
([whitespace-between-tokens/callback-name-kept-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/callback-name-kept-input.mmd)):

```mmd
flowchart LR
A
B
click A call fn  ( x )
click B call gn   (y, z)
```

出力
([whitespace-between-tokens/callback-name-kept-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/callback-name-kept-output.mmd)):

```mmd
flowchart LR
  A
  B
  click A call fn  ( x )
  click B call gn   (y, z)
```

### 矢印の前後の空白

辺の前と後に空白を 1 つずつ置きます。
[fixture: arrow-spacing/other-link-kinds]
[fixture: arrow-spacing/ampersand-spacing-kept]
[fixture: arrow-spacing/arrow-length-kept]
2 つの矢印の間に書いたテキストは、両側に空白を 1 つずつ置きます。
[fixture: arrow-spacing/text-between-other-link-kinds]
[fixture: arrow-spacing/directive-in-text-between-arrows]
`|` で囲んだラベルは矢印とその `|` に接し、辺の id はその `@` と矢印に接します。
[fixture: arrow-spacing/pipe-label-other-link-kinds]
[fixture: arrow-spacing/edge-id-with-labels]
[fixture: arrow-spacing/edge-id-whitespace-before-arrow-dropped]

入力
([arrow-spacing/plain-input.mmd](../tests/fixtures/flowchart/arrow-spacing/plain-input.mmd)):

```mmd
flowchart LR
  A-->B
  C==>D
  E-.->F
  Gx--xH
```

出力
([arrow-spacing/plain-output.mmd](../tests/fixtures/flowchart/arrow-spacing/plain-output.mmd)):

```mmd
flowchart LR
  A --> B
  C ==> D
  E -.-> F
  Gx --x H
```

入力
([arrow-spacing/text-between-arrows-input.mmd](../tests/fixtures/flowchart/arrow-spacing/text-between-arrows-input.mmd)):

```mmd
flowchart LR
  A--text-->B
  C==  thick  ==>D
```

出力
([arrow-spacing/text-between-arrows-output.mmd](../tests/fixtures/flowchart/arrow-spacing/text-between-arrows-output.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C == thick ==> D
```

入力
([arrow-spacing/pipe-label-input.mmd](../tests/fixtures/flowchart/arrow-spacing/pipe-label-input.mmd)):

```mmd
flowchart LR
  A-->|text|B
  C --> |text| D
```

出力
([arrow-spacing/pipe-label-output.mmd](../tests/fixtures/flowchart/arrow-spacing/pipe-label-output.mmd)):

```mmd
flowchart LR
  A -->|text| B
  C -->|text| D
```

入力
([arrow-spacing/edge-id-input.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-input.mmd)):

```mmd
flowchart LR
  A e1@-->B
```

出力
([arrow-spacing/edge-id-output.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-output.mmd)):

```mmd
flowchart LR
  A e1@--> B
```

### ラベルの内側の空白

引用符のないラベルの両端の空白は、mermaid.js が取り除くのと同じく取り除きます。
[fixture: label-inner-whitespace/trimmed-every-shape]
ラベルの中の空白は保ち、空白だけのラベルも保ちます（`A[]` は拒否されます）。
[fixture: label-inner-whitespace/all-whitespace-every-shape-kept]
引用符で囲んだラベルは書かれたまま残します。
[fixture: label-inner-whitespace/quotes-kept]

ラベルの先頭の空白は、それがないとラベルの読み方が変わるときは、
空白 1 つとして残します。
ラベルが `/`、`\`、`-`、`"` のどれかで始まるときと、
最初の語（空白か `"` まで）が `@` を含むときです。
[fixture: label-inner-whitespace/leading-whitespace-trimmed-without-trigger]
[fixture: label-inner-whitespace/leading-whitespace-run-becomes-one]
[fixture: label-inner-whitespace/compat-leading-backslash-kept]
空白がないと、`A[ /x/]` はラベル `x` の lean-right の形に、
`A( -x-)` は ellipse になり、`A[ x@ ]` は拒否されます。
そうしたラベルは、末尾にも空白 1 つを置きます。
`A[ /x/]` は `A[ /x/ ]` になります。
ただし、斜めの形の閉じの `?]` と `=]` の前には置きません。
mermaid.js が、その空白と `?` や `=` をテキストとして読むからです。
`A[/ -x/?]` はそのままです。
この規則は、どの形でも、`|` の間のテキストでも同じです。
[fixture: label-inner-whitespace/leading-whitespace-every-shape-kept]
[fixture: label-inner-whitespace/leading-whitespace-pipe-label-kept]

入力
([label-inner-whitespace/trimmed-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/trimmed-input.mmd)):

```mmd
flowchart LR
  A[ text ]
  B( round )
  C{ decision }
  A -->| label |B
```

出力
([label-inner-whitespace/trimmed-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/trimmed-output.mmd)):

```mmd
flowchart LR
  A[text]
  B(round)
  C{decision}
  A -->|label| B
```

入力
([label-inner-whitespace/inner-whitespace-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/inner-whitespace-kept-input.mmd)):

```mmd
flowchart LR
  A[ hello   world ]
```

出力
([label-inner-whitespace/inner-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/inner-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[hello   world]
```

入力
([label-inner-whitespace/quoted-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/quoted-kept-input.mmd)):

```mmd
flowchart LR
  A[" text "]
```

出力
([label-inner-whitespace/quoted-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/quoted-kept-output.mmd)):

```mmd
flowchart LR
  A[" text "]
```

入力
([label-inner-whitespace/leading-whitespace-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-input.mmd)):

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

出力
([label-inner-whitespace/leading-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-output.mmd)):

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

入力
([label-inner-whitespace/leading-whitespace-before-question-end-kept-input.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-before-question-end-kept-input.mmd)):

```mmd
flowchart LR
B[/ -x/?]
C[/ -x/=]
```

出力
([label-inner-whitespace/leading-whitespace-before-question-end-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-before-question-end-kept-output.mmd)):

```mmd
flowchart LR
  B[/ -x/?]
  C[/ -x/=]
```

### 辺のラベルの書き方

辺のラベルは、書かれた形を保ちます。
2 つの矢印の間のテキストか、矢印の後の `|` の間のテキストです。
[fixture: link-label-form/other-link-kinds-kept]
一方の形をもう一方に変えるには、`|` を含むラベルの規則が要ります。
`A -- a|b --> B` は受理されますが、`A -->|a|b| B` は拒否されます。
[fixture: link-label-form/pipe-in-text-between-arrows-kept]

入力
([link-label-form/kept-input.mmd](../tests/fixtures/flowchart/link-label-form/kept-input.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C -->|text| D
```

出力
([link-label-form/kept-output.mmd](../tests/fixtures/flowchart/link-label-form/kept-output.mmd)):

```mmd
flowchart LR
  A -- text --> B
  C -->|text| D
```

### 連鎖

辺の連鎖は、書かれたとおり 1 行に保ちます。
[fixture: chains/labelled-links-kept]
1 辺 1 行には分けません。
長い行や複数行に書かれた文と同じく、書き手が文や辺を区切った位置を保ちます。
[fixture: chains/split-after-semicolon]

入力
([chains/kept-input.mmd](../tests/fixtures/flowchart/chains/kept-input.mmd)):

```mmd
flowchart LR
  A --> B --> C
  D & E --> F
```

出力
([chains/kept-output.mmd](../tests/fixtures/flowchart/chains/kept-output.mmd)):

```mmd
flowchart LR
  A --> B --> C
  D & E --> F
```

### 折り返し

Prettier の `printWidth` オプションにかかわらず、行を折り返しません。
[fixture: line-wrapping/print-width-ignored]
連鎖と同じく、行をどこで分けるかは書き手が決めます。

入力
([line-wrapping/long-line-kept-input.mmd](../tests/fixtures/flowchart/line-wrapping/long-line-kept-input.mmd)):

```mmd
flowchart LR
  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD
```

出力
([line-wrapping/long-line-kept-output.mmd](../tests/fixtures/flowchart/line-wrapping/long-line-kept-output.mmd)):

```mmd
flowchart LR
  AAAAAAAAAAAAAAAAAAAA --> BBBBBBBBBBBBBBBBBBBB --> CCCCCCCCCCCCCCCCCCCC --> DDDDDDDDDDDDDDDDDDDD
```

### 複数行の文

複数行に書かれた文は改行を保ち、2 行目以降を 1 行目より 1 段深く置きます。
文をどこで折るかは、連鎖や長い行と同じく書き手の選択です。
トークンの間の改行は、印字が書かない行末の空白を要しません。
sequence、class、state は、そこでは改行が空白の後でだけ数えられるので、
行をつなぎます。
[fixture: multi-line-statements/continuation-in-subgraph]
[fixture: multi-line-statements/label-over-lines]
[fixture: multi-line-statements/directive-inside]
途中のコメント行は文の中に残り、2 行目以降と同じ段に置きます。
[fixture: multi-line-statements/several-comments-inside]
複数行に書かれた `click` の文は書かれたまま残します。
mermaid.js は、2 行目以降が字下げされていると、その一部を拒否するからです。
[fixture: multi-line-statements/click-in-subgraph-kept]
[fixture: multi-line-statements/click-forms-kept]
[fixture: multi-line-statements/click-comment-inside-kept]

入力
([multi-line-statements/continuation-indented-input.mmd](../tests/fixtures/flowchart/multi-line-statements/continuation-indented-input.mmd)):

```mmd
flowchart LR
  A -->
B -->
      C
```

出力
([multi-line-statements/continuation-indented-output.mmd](../tests/fixtures/flowchart/multi-line-statements/continuation-indented-output.mmd)):

```mmd
flowchart LR
  A -->
    B -->
    C
```

入力
([multi-line-statements/comment-inside-input.mmd](../tests/fixtures/flowchart/multi-line-statements/comment-inside-input.mmd)):

```mmd
flowchart LR
  A -->
%% between
B
```

出力
([multi-line-statements/comment-inside-output.mmd](../tests/fixtures/flowchart/multi-line-statements/comment-inside-output.mmd)):

```mmd
flowchart LR
  A -->
    %% between
    B
```

入力
([multi-line-statements/click-kept-input.mmd](../tests/fixtures/flowchart/multi-line-statements/click-kept-input.mmd)):

```mmd
flowchart LR
  A
  click A
cb
```

出力
([multi-line-statements/click-kept-output.mmd](../tests/fixtures/flowchart/multi-line-statements/click-kept-output.mmd)):

```mmd
flowchart LR
  A
  click A
cb
```

### 複数行の値

複数行に書かれた値では、各行の開始位置を変えません。
引用符で囲んだ文字列と、
`{` の次の行から始まる `accDescr { ... }` ブロックのテキストです。
[fixture: multi-line-values/markdown-string-kept]
subgraph の中では、
mermaid.js はそのブロックのテキストを字下げごと
subgraph のメンバーにも入れるので、字下げを変えられません。
subgraph の外では、行の桁は Db に入りませんが、同じに残し、
どのブロックのテキストにも 1 つの規則が当てはまるようにします。
[fixture: multi-line-values/accdescr-block-comment-only-in-subgraph]
ブロックの `}` は、それが閉じる `accDescr` と同じ段に置きます。
[fixture: multi-line-values/accdescr-block-kept]
そうしたブロックの中のコメント行も、書かれたまま残します。
[fixture: multi-line-values/accdescr-block-comment-line-in-subgraph-kept]
テキストが `{` と同じ行から始まるときは、その前後の空白を、
トークンの間と同じく空白 1 つにします。
[fixture: multi-line-values/accdescr-block-text-starts-on-brace-line]
テキストがなく、コメント行だけを持つブロックは、値を持ちません。
そのコメント行は、文の中のコメント行と同じく、
`accDescr` より 1 段深く置き（[コメント](#コメント)を参照）、
`}` は `accDescr` と同じ段に置きます。
[fixture: multi-line-values/accdescr-block-comment-only-several-comments]
[fixture: multi-line-values/accdescr-block-comment-only-in-subgraph]

入力
([multi-line-values/string-kept-input.mmd](../tests/fixtures/flowchart/multi-line-values/string-kept-input.mmd)):

```mmd
flowchart LR
  A["first line
      second line"]
```

出力
([multi-line-values/string-kept-output.mmd](../tests/fixtures/flowchart/multi-line-values/string-kept-output.mmd)):

```mmd
flowchart LR
  A["first line
      second line"]
```

入力
([multi-line-values/accdescr-block-closing-brace-aligned-input.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-closing-brace-aligned-input.mmd)):

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

出力
([multi-line-values/accdescr-block-closing-brace-aligned-output.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-closing-brace-aligned-output.mmd)):

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

入力
([multi-line-values/accdescr-block-comment-only-input.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-comment-only-input.mmd)):

```mmd
flowchart LR
A
accDescr {
%% only a comment
      }
```

出力
([multi-line-values/accdescr-block-comment-only-output.mmd](../tests/fixtures/flowchart/multi-line-values/accdescr-block-comment-only-output.mmd)):

```mmd
flowchart LR
  A
  accDescr {
    %% only a comment
  }
```

### コメント

1 行に置かれたコメントは、周りの文と同じ段に置きます。
コメントはどの文にも属さないので、読む人が探す場所の隣の段にします。
ヘッダーの前でも同じで、行の先頭に置きます。
[fixture: comments/only-comment-in-subgraph] [fixture: comments/after-end]
[fixture: comments/tab-indented-and-consecutive]
[fixture: comments/after-frontmatter-before-header]
[fixture: comments/before-header] [fixture: comments/before-end]
[fixture: comments/at-end-of-text]
コメントのテキストは、末尾の空白も含めて書かれたまま残します。
mermaid.js は読まず、書き手のテキストだからです。
[fixture: comments/trailing-whitespace-kept]
[fixture: comments/leading-whitespace-kept]
[fixture: comments/statement-text-kept] [fixture: comments/directive-text-kept]

入力
([comments/indented-input.mmd](../tests/fixtures/flowchart/comments/indented-input.mmd)):

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

出力
([comments/indented-output.mmd](../tests/fixtures/flowchart/comments/indented-output.mmd)):

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

入力
([comments/before-end-input.mmd](../tests/fixtures/flowchart/comments/before-end-input.mmd)):

```mmd
flowchart LR
subgraph S
A
%% before end
end
```

出力
([comments/before-end-output.mmd](../tests/fixtures/flowchart/comments/before-end-output.mmd)):

```mmd
flowchart LR
  subgraph S
    A
    %% before end
  end
```

### ディレクティブ

1 行に置かれたディレクティブ（`%%{ ... }%%`）は、周りの文と同じ段に置きます。
コメントと同じ理由です。
[fixture: directives/own-line-in-subgraph]
[fixture: directives/several-on-own-line]
[fixture: directives/multi-line-on-own-line]
[fixture: directives/own-line-between-comment-and-empty-line]
文と同じ行にあるディレクティブはその行に残ります。
[fixture: directives/after-header-on-same-line]
[fixture: directives/after-end-on-same-line]
[fixture: directives/after-last-statement-without-line-break]
ディレクティブの側に空白が書かれていればそこに空白 1 つを置き、
トークンに接していれば接したまま残します。
[fixture: directives/whitespace-on-both-sides-collapsed]
[fixture: directives/meets-empty-description-block]
mermaid.js はディレクティブを除いたテキストを読むので、
2 つのトークンが離れているかどうかを変えてはいけないからです。
ディレクティブの中身は書かれたまま残します。
[fixture: directives/content-kept]
[fixture: directives/compat-malformed-directive-kept]

入力
([directives/indented-input.mmd](../tests/fixtures/flowchart/directives/indented-input.mmd)):

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
%%{init: {"flowchart": {"curve": "basis"}}}%%
A --> B
```

出力
([directives/indented-output.mmd](../tests/fixtures/flowchart/directives/indented-output.mmd)):

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  %%{init: {"flowchart": {"curve": "basis"}}}%%
  A --> B
```

入力
([directives/same-line-as-statements-input.mmd](../tests/fixtures/flowchart/directives/same-line-as-statements-input.mmd)):

```mmd
flowchart LR
  A --> B %%{init: {}}%%
  C; %%{init: {}}%% D
```

出力
([directives/same-line-as-statements-output.mmd](../tests/fixtures/flowchart/directives/same-line-as-statements-output.mmd)):

```mmd
flowchart LR
  A --> B %%{init: {}}%%
  C
  %%{init: {}}%% D
```

入力
([directives/touching-token-kept-input.mmd](../tests/fixtures/flowchart/directives/touching-token-kept-input.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%-->B
```

出力
([directives/touching-token-kept-output.mmd](../tests/fixtures/flowchart/directives/touching-token-kept-output.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%--> B
```

入力
([directives/whitespace-on-each-side-kept-input.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-kept-input.mmd)):

```mmd
flowchart %%{init: {}}%%LR
A
style A %%{init: {}}%%fill:red
click A %%{init: {}}%%href "u"
B%%{init: {}}%% --> C
```

出力
([directives/whitespace-on-each-side-kept-output.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-kept-output.mmd)):

```mmd
flowchart %%{init: {}}%%LR
  A
  style A %%{init: {}}%%fill:red
  click A %%{init: {}}%%href "u"
  B%%{init: {}}%% --> C
```

閉じていないディレクティブは、mermaid.js が読むとおり、
テキストの終わりまで続きます。
[fixture: directives/unclosed-after-statement-on-same-line]
[fixture: directives/compat-unclosed-directive-joins-next-line]
その範囲は、空白でない最後の文字で終わります
（仕様の
[コメント、ディレクティブ、フロントマター](../../spec/docs/ast.ja.md#ディレクティブとフロントマター)
）。
そのため、その後の空白はテキストの末尾の空白で、そのとおりに整形します。
テキストは、ディレクティブの後の改行 1 つで終わります。
テキストがディレクティブの直後で終わるときは、改行を足しません。
足した改行を、mermaid.js がディレクティブの一部として読むからです。
空白がテキストの末尾にあるので、例は、`\n` を改行とする文字列で書きます。
`"flowchart LR\nA\n%%{init: {}  \n\n"` は
`"flowchart LR\n  A\n  %%{init: {}\n"` と印字し、
`"flowchart LR\nA\n%%{init: {}"` は
`"flowchart LR\n  A\n  %%{init: {}"` と印字します
（fixture `unclosed-trailing-whitespace` と `unclosed-at-end-of-text-kept` は
[フォルダー](../tests/fixtures/flowchart/directives)にあります）。

### 方向

方向は書かれたまま残します。
ヘッダーでも `direction` の文でも、`TD` を `TB` に変えません。
[fixture: direction/header-td-kept]
[fixture: direction/statement-td-kept-with-other-header]
[fixture: direction/statement-values-kept]
mermaid.js は subgraph の中の `direction` の文の
`TD` を書かれたとおりに保つので、そこを変えると図が変わり、
ヘッダーだけを変えると両者が揃わなくなるからです。
`direction` の文では、mermaid.js は `direction` の前と値の後を、
ラベルや文字列を含みうるテキストとして読み、
値の後の `;` はそのテキストに属し、区切りではありません。
そのテキストは書かれたまま残し、
それと `direction` の間、`direction` と値の間の空白は、
ほかのトークンの間と同じく空白 1 つにします。
`A[direction TB]` のような行も `direction` の文で、頂点も接続も読まれず、
そのように、その段の字下げで印字します。
[fixture: direction/statement-holds-text-kept]

入力
([direction/kept-input.mmd](../tests/fixtures/flowchart/direction/kept-input.mmd)):

```mmd
flowchart TD
  subgraph S
    direction TD
    A
  end
```

出力
([direction/kept-output.mmd](../tests/fixtures/flowchart/direction/kept-output.mmd)):

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
[fixture: subgraph-header/title-run-of-whitespace-becomes-one]
mermaid.js はどちらの形も同じに読み、どちらも使われているので、
書き手に任せます。
タイトルなしで書かれた名前は、その後の空白を保ちます。
mermaid.js はその空白を名前の一部として読みます。
[fixture: subgraph-header/name-trailing-run-kept]
[fixture: subgraph-header/name-trailing-whitespace-kept]
[fixture: subgraph-header/name-whitespace-before-directive-kept]
[fixture: subgraph-header/name-whitespace-after-directive-kept]
ヘッダーと同じ行に書かれた空の説明ブロックの周りの空白も同じです。
ブロックの前、ブロックの間、最後のブロックと `;` の間の空白がそうで、
`subgraph "S"accDescr {} accDescr {}` と
`subgraph "U"accDescr {} ;` がその例です。
[fixture: subgraph-header/whitespace-before-first-block-kept]
ブロックは何のトークンも読まれず、その空白が名前の後に続くとみなされ、
subgraph の id は `subGraph0` になり、空白がなければ `S` になります。
空白があることは残しますが、幅は、最初のブロックの前だけ、
名前に続くものとして書かれたまま残し、
ブロックの間や `;` の前の空白の連続は、空白 1 つにします。
[fixture: subgraph-header/runs-between-blocks-become-one]
最後のブロックの後の空白に改行が続くときは、改行として読まれ、数えません。
[fixture: subgraph-header/whitespace-after-last-block-dropped]
ブロックは、`;` とその後のディレクティブとともに、
ヘッダーの行に書かれたまま残します。
ブロックが独立した行にあると、空白は別に読まれ、
ブロックとディレクティブの後の `;` は頂点として読まれます。

入力
([subgraph-header/whitespace-before-block-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/whitespace-before-block-kept-input.mmd)):

```mmd
flowchart LR
subgraph "S"accDescr {} accDescr {}
A
end
subgraph "T"accDescr {}
B
end
subgraph "U"accDescr {} ;
C
end
subgraph "V"accDescr {} %%{init: {}}%%;
D
end
```

出力
([subgraph-header/whitespace-before-block-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/whitespace-before-block-kept-output.mmd)):

```mmd
flowchart LR
  subgraph "S"accDescr {} accDescr {}
    A
  end
  subgraph "T"accDescr {}
    B
  end
  subgraph "U"accDescr {} ;
    C
  end
  subgraph "V"accDescr {} %%{init: {}}%%;
    D
  end
```

入力
([subgraph-header/title-spacing-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/title-spacing-kept-input.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T [Title]
    B
  end
```

出力
([subgraph-header/title-spacing-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/title-spacing-kept-output.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T [Title]
    B
  end
```

入力
([subgraph-header/name-whitespace-before-directive-kept-input.mmd](../tests/fixtures/flowchart/subgraph-header/name-whitespace-before-directive-kept-input.mmd)):

```mmd
flowchart LR
  subgraph S %%{init: {}}%%
    A
  end
```

出力
([subgraph-header/name-whitespace-before-directive-kept-output.mmd](../tests/fixtures/flowchart/subgraph-header/name-whitespace-before-directive-kept-output.mmd)):

```mmd
flowchart LR
  subgraph S %%{init: {}}%%
    A
  end
```

### スタイルの行末の空白

`style`、`classDef`、`linkStyle` の文の末尾の空白は取り除きます。
[fixture: style-trailing-whitespace/removed]
[fixture: style-trailing-whitespace/removed-tab]
[fixture: style-trailing-whitespace/removed-after-directive]
mermaid.js はその空白を最後のスタイルの末尾に残すので、
この規則だけは mermaid.js が保存するものを変えます。
テストは、末尾の空白を除いたスタイルを比べます。
mermaid.js がその空白を、
並びの末尾の `,` の後の 1 つのスタイルとして読むときは、空白を保ちます。
取り除くと文が拒否されるからです。
`style A fill:#f00, ` と `classDef c fill:x\, ` がそうです。
[fixture: style-trailing-whitespace/whitespace-only-value-kept]
[fixture: style-trailing-whitespace/whitespace-only-value-in-link-style-kept]
[fixture: style-trailing-whitespace/whitespace-only-value-before-directive-kept]
[fixture: style-trailing-whitespace/escaped-comma-kept]
ディレクティブの後や、mermaid.js が無視する `;` の後の、
空白だけのスタイルも同じです。
`style A fill:red,%%{init: {}}%% ` と `style A fill:#f00,; ` がそうです。
[fixture: style-trailing-whitespace/whitespace-only-value-after-directive-kept]
[fixture: style-trailing-whitespace/whitespace-only-value-after-ignored-semicolon-kept]

空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"flowchart LR\n  A --> B\n  style A fill:#f00   \n"` は
`"flowchart LR\n  A --> B\n  style A fill:#f00\n"` と印字し、
`"flowchart LR\n  A\n  style A fill:#f00, \n"` はそのまま印字します
（fixture `removed` と `whitespace-only-value-kept` は
[フォルダー](../tests/fixtures/flowchart/style-trailing-whitespace)
にあります）。

### フロントマターの YAML

`---` の行の間の YAML は、Prettier の YAML 整形で整形します。
パーサーは YAML を読まないので、YAML として整形するのは整形器の仕事です。
[fixture: frontmatter-yaml/compat-unknown-config-formatted]
`---` の行は、行末の空白とタブも含めて、書かれたまま残します。
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
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
[fixture: frontmatter-yaml/compat-tag-start-digit-kept]
[fixture: frontmatter-yaml/compat-tag-start-underscore-kept]
[fixture: frontmatter-yaml/compat-less-than-without-tag-formatted]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   'Hello'
config: {flowchart: {curve: basis}}
---
flowchart LR
A-->B
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: "Hello"
config: { flowchart: { curve: basis } }
---
flowchart LR
  A --> B
```

入力
([frontmatter-yaml/malformed-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/malformed-kept-input.mmd)):

```mmd
---
title: [unclosed
---
flowchart LR
A-->B
```

出力
([frontmatter-yaml/malformed-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/malformed-kept-output.mmd)):

```mmd
---
title: [unclosed
---
flowchart LR
  A --> B
```

入力
([frontmatter-yaml/html-tag-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/html-tag-kept-input.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
flowchart LR
A-->B
```

出力
([frontmatter-yaml/html-tag-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/html-tag-kept-output.mmd)):

```mmd
---
title: "<a b=\"c\">"
---
flowchart LR
  A --> B
```

入力
([frontmatter-yaml/delimiter-line-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/delimiter-line-kept-input.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
flowchart LR
A
```

出力
([frontmatter-yaml/delimiter-line-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/delimiter-line-kept-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
flowchart LR
  A
```

入力
([frontmatter-yaml/indented-delimiters-kept-input.mmd](../tests/fixtures/flowchart/frontmatter-yaml/indented-delimiters-kept-input.mmd)):

```mmd
  ---
  title: |
      ---
  ---
flowchart LR
A
```

出力
([frontmatter-yaml/indented-delimiters-kept-output.mmd](../tests/fixtures/flowchart/frontmatter-yaml/indented-delimiters-kept-output.mmd)):

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
  [fixture: label-inner-whitespace/quotes-kept]
- `&` の前後に空白があるかどうか。
  `A&B` は頂点 1 つ、`A & B` は 2 つで、`A &B` は拒否されます。
  空白の連続は、トークンの間と同じく空白 1 つにします。
  [fixture: arrow-spacing/ampersand-spacing-kept]
- 矢印の長さ（`-->` と `--->`）と、
  ヘッダーのキーワード（`graph` か `flowchart`）。
  [fixture: arrow-spacing/arrow-length-kept]
  [fixture: direction/header-keyword-kept]
- `@{ ... }` のデータブロックとディレクティブの中身。
  パーサーは読みません。
  [fixture: whitespace-between-tokens/data-block-kept]
  [fixture: directives/content-kept]
  [fixture: whitespace-between-tokens/compat-unknown-shape-data-block-kept]
- 複数行に書かれた文字列と Markdown 文字列の行。
  行頭の空白が値の一部です。
  [fixture: multi-line-values/markdown-string-kept]
  [fixture: multi-line-values/string-kept]

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
1 段は Prettier の `useTabs` と `tabWidth` オプションで指定し、
下記の下限を適用します。
既定は空白 2 つで、Prettier が整形するほかの言語と同じです。
ヘッダーの後の文を 1 段深くするのは、mermaid.js の文書の書き方です。
[fixture: indentation/use-tabs]
通常の字下げは木の構造から決めます。
入力の桁位置は subgraph の所属を決めません。 [fixture: indentation/statements]
[fixture: indentation/empty-description-block]

本文の1段は共有の意味を持つ字下げ幅を使い、
`tabWidth: 0`でも最低1つの空白にします。
`useTabs`では1段をタブ1つにします。
字下げをすべて取り除くと、方向文がaccessibilityの値や構文エラーに変わり、
Mermaidの読みが変わるためです。
この下限で実際の方向文を保護します。
桁位置で読みが変わる非方向行は、後述の規則で元の字下げを保ちます。
[fixture: indentation/zero-direction-description-subgraph]
[fixture: indentation/zero-direction-title]
[fixture: indentation/zero-direction-title-tab]
[fixture: indentation/zero-direction-description-block]
[fixture: indentation/zero-direction-title-prefix]
[fixture: indentation/zero-direction-directive]
[fixture: indentation/zero-direction-style-prefix]

入力（エスケープ表記、
`tabWidth: 0`）: `"flowchart LR\n  accTitle: t;direction TB\n"`。

出力
([indentation/zero-direction-title-output.mmd](../tests/fixtures/flowchart/indentation/zero-direction-title-output.mmd)):

```mmd
flowchart LR
 accTitle: t;direction TB
```

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
([オプション](../tests/fixtures/flowchart/indentation/tab-width-4-options.json)):

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
[fixture: statements-one-per-line/compat-empty-description-block-after-data-block]
1 行に書かれ `;` で区切られた文は、行に分けます。
`;` は文を区切るだけで、1 行に複数の文があると読みにくいからです。
[fixture: statements-one-per-line/separated-by-semicolons-meets-others]
[fixture: statements-one-per-line/separated-by-semicolons-after-data-block]

ただし、文を区切る `;` 以外の `;` を含む行は、文と `;` を行に残します。
`A[x;]`、`accTitle: a;b`、コメントの中の `;` などがそうした `;` です。
文を別の行に分けず、`;` はその位置に残し、両側に空白があるかどうかは変えず、
空白の連なりは空白 1 つにします。
[fixture: statements-one-per-line/kept-semicolon-runs-collapsed]
[fixture: statements-one-per-line/compat-semicolon-in-label-without-style-kept]
[fixture: statements-one-per-line/inner-semicolon-kept]
[fixture: statements-one-per-line/comment-semicolon-not-separator]
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
あるかないかを変えません（[セミコロン](#セミコロン)を参照）。
この規則は、ディレクティブと、
mermaid.js が取り除くコメント行を除いた行を読みます。
そのため、ディレクティブの中の `style`、`:`、`#`、`;` は数えません。
`A[style:]-->B %%{init:{"x":"#;"}}%%` は、
`#` や `;` のない行と同じく `A[style:] --> B %%{init:{"x":"#;"}}%%` になります。
行の途中の `%%` はコメント行ではなく、規則はそのテキストを読みます。
詳しくは次の節を参照してください。
[Label content](./architecture.ja.md#label-content)
[fixture: semicolons/line-rule-chars-only-in-directive]

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

同じ行で空の説明ブロックと `;` が続くスタイル文、クラス定義文、
リンクスタイル文は、ブロックと `;` と一緒に、それらがまたがる行のまま残します。
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

単語が subgraph の名前や、スタイル、クラス定義、
リンクスタイルのテキストの終わりにあるときも同じです。
その単語は `end`、`click`、`call`、`href` で、スタイルのテキストでは、
`fill:click` のように、ASCII の英数字以外の文字の後にあっても終わりの単語です。
[fixture: statements-one-per-line/semicolon-after-style-text-word-kept]
[fixture: statements-one-per-line/semicolon-after-style-text-not-word-split]
英字（大文字も含む）か数字の後にある単語は、独立した単語ではないので、
`style A fillXclick;` の `;` は、`fillclick` の後と同じく落とします。
[fixture: statements-one-per-line/semicolon-after-style-text-after-capital-not-word-split]
名前の中の `end` は、その後の空白を、改行も含めて取ります。
そのため、`subgraph Front end` に改行と `A` が続くと、名前は `Front end`、改行、
`A` で、メンバーはなく、`subgraph Front end ;` ではメンバー A があります。
`;` が後の行にあるときも、`;` はそのまま残り、その前の空白も書かれたまま、
`subgraph` の行の一部になります。
[corpus fixture: flowchart/semicolon-after-end-name-2a3a795c]
[fixture: statements-one-per-line/name-semicolon-after-directive-line]
名前の後の改行を読むのは `end` と `click` だけで、一覧のほかの単語は、
文のテキストと一覧を共用しているために入っています。
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

`accTitle` で終わる名前の後の `;` は独立した文として、
subgraph 内の単独の行に置きます。
subgraph のメンバーの 1 つだからです。
[fixture: statements-one-per-line/name-followed-by-empty-statement]

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
  style B fill: click;
  C
  classDef c href;D
  subgraph T end

  ;
    D
  end
```

同じ行で `;` や説明ブロックの `}` の後に続く `%%` （`A;%%x`、`A; %%x`、
`accDescr {y}%%z` など）は、前に空白があってもなくても、
mermaid.js ではコメントを始めません。
テキストの始まりで、頂点 `%%x` になります。
単独の行に置くとコメントになるので、その行は書かれたとおりにトークンを保ち、
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
文の終わりの `;` も、同じ行でその後にディレクティブが続くときは残します。
`;` がないと、ディレクティブの前の空白が文の一部として読まれるからです。
[fixture: semicolons/kept-before-trailing-directive]
`;` を落とすと、行の終わりか、行の規則が無視する `;` が変わる行は、
書かれたまま印字します。
閉じていないディレクティブの後の `;`、別の `;` に接する無視される `;`、
U+2028 か U+2029 の前の無視される `;` がある行です（詳しくは、
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
[corpus fixture: flowchart/ignored-semicolon-after-directive-1abc682b]
[corpus fixture: flowchart/style-line-separator-semicolon-2a0f3253]
この種の `style` や `classDef` の行は、文の先頭から書かれたまま印字するので、
文の前のインデントだけが変わります。
[test: a `classDef` line with a `;`, U+2028, and a `;`]
[test: a `style` line with a `;`, U+2029, and a `;`]
[fixture: statements-one-per-line/compat-unclosed-directive-semicolon-kept]
[fixture: statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
[fixture: semicolons/kept-after-unclosed-directive]
[fixture: semicolons/ignored-next-to-another-kept]
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
印字した行には規則が読む `;` がないので、その空白はほかと同じに整えます。
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
  style A fill: #f00
  classDef c fill: #fff, stroke: #333
  style B fill: #0f0
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

文の 2 つのトークンの間か同じ行の 2 つの文の間で、行の規則が無視する `;` は、
ないものとして読まれます。
そのため、その周りの空白は、`;` がないものとして隙間の通常の規則に従います。
空白 1 つを置く隙間では、書かれた空白によらず、`;` を直前のトークンに付け、
後ろに空白 1 つを置きます。
空白を置かない隙間では、`;` は両側のトークンに接します。
規則のない隙間では、隙間のどこかに空白が書かれていれば後ろに空白 1 つを置き、
なければ接したままにします。
行の規則が読む範囲の中の隙間と、U+2028 か U+2029 を含む隙間、
図種のキーワードの直後の隙間は、書かれたままの空白を保ちます。
図種の検出は、`;` を取り除く前のテキストを読むためです。
`cynefin-beta ;complex` は検出され、`cynefin-beta; complex` は検出されません。
行の末尾の `;` は、直前のトークンに付けます。
[fixture: semicolons/ignored-semicolon-before-edge-id-touching]
[fixture: semicolons/ignored-semicolon-before-edge-id-spaced]
[test: U+2028 after a `;` before an edge id]
[test: U+2028 after a `;` and a space before an edge id]
[test: U+2029 after a `;` before an edge id]
[test: U+2029 after a `;` and a space before an edge id]

### 空行

連続する空行は 1 つの空行にします。
Prettier がコードでそうするのと同じで、空行は文をまとまりにし、
2 つ以上は何も足さないからです。 [fixture: blank-lines/single-kept]
[fixture: blank-lines/whitespace-only-lines]
[fixture: blank-lines/inside-multi-line-statement]
[fixture: blank-lines/around-comment-lines]
[fixture: blank-lines/around-directive-lines]
テキストの先頭と末尾、subgraph の先頭と末尾の空行は取り除きます。
[fixture: blank-lines/after-comment-before-header]
[fixture: blank-lines/after-frontmatter]
行をまたいで書かれた値（ラベルなど）のテキストの中の空行は、
値の一部なので残します。 [fixture: blank-lines/inside-values-kept]
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
[fixture: whitespace-between-tokens/compat-empty-description-block-own-line]
[fixture: whitespace-between-tokens/header-and-tabs-collapsed]
subgraph の名前（タイトルになる）の中の空白とタブの連なりは、
mermaid.js がタイトルを幅なしで描くときは空白 1 つにして印字し、
タイトルを折り返すときは書かれたまま残します。
Markdown 文字列、
データブロックがある subgraph（文字列で名前を書く subgraph の id は、
引用符の間の文字から両端の空白を除いたもので、
Markdown 文字列ではバッククォートの間の文字です。
`subgraph "S"` と `subgraph " S "` の id は `S`）、
`swimlane` を書く図ではタイトルを折り返します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
[fixture: whitespace-between-tokens/subgraph-name-runs-collapsed]
[fixture: subgraph-header/markdown-title-runs-kept]
[fixture: subgraph-header/collapsed-title-runs-kept]
[fixture: subgraph-header/collapsed-quoted-name-title-runs-kept]
[fixture: subgraph-header/collapsed-markdown-name-title-runs-kept]
[fixture: subgraph-header/collapsed-spaced-name-title-runs-kept]
[fixture: subgraph-header/collapsed-generated-id-title-runs-kept]
[fixture: subgraph-header/swimlane-title-runs-kept]
[fixture: subgraph-header/layout-swimlane-title-runs-kept]
`style`・`classDef`・`linkStyle` の文では、
各スタイルの最初の `:` の前に空白を置かず、値が空でなければ、
後ろに空白を 1 つ置きます。
スタイルの間の `,` の前に空白を置かず、後ろに空白を 1 つ置きます。
`style A fill :#f00,stroke:  #333` は、
`style A fill: #f00, stroke: #333` になります。
[fixture: whitespace-between-tokens/style-colon-spaced]
[fixture: whitespace-between-tokens/style-colon-empty-value-kept]
[fixture: whitespace-between-tokens/style-comma-before-dropped]
番号を指定した `linkStyle` では、`fill` で始まるスタイルの前の `,` の後ろに、
空白があるかないかを保ち、空白の連続は空白 1 つにします。
mermaid.js は先頭だけを読むので、`fill-opacity` で始まるスタイルも含みます。
[fixture: whitespace-between-tokens/link-style-fill-after-comma-kept]
[fixture: whitespace-between-tokens/link-style-fill-opacity-after-comma-kept]
番号か `default` を指定した `linkStyle` では、`stroke:` で始まるスタイルも、
前に空白があるかないかを保ちます。
look が `handDrawn` のときは、mermaid.js が先頭の `stroke:` を読むからです。
[fixture: whitespace-between-tokens/link-style-stroke-after-comma-kept]
この文のほかのスタイルと `linkStyle default` は、1 つの形で印字します。
[fixture: whitespace-between-tokens/link-style-other-after-comma-spaced]
[fixture: whitespace-between-tokens/link-style-default-after-comma-spaced]
リンクにも適用される `linkStyle` と `classDef` では、
`stroke` で終わる名前と `:` の間の空白の有無を保ち、
空白の連続は空白 1 つにします。
mermaid.js はリンクのスタイルから `stroke:` を探し、
矢印の頭の色を決めるからです。
[fixture: whitespace-between-tokens/link-style-stroke-before-colon-kept]
[fixture: whitespace-between-tokens/class-def-stroke-before-colon-kept]
`style` はノードに適用され、1 つの形で印字します。
[fixture: whitespace-between-tokens/style-stroke-before-colon-spaced]
`style` のスタイルの末尾のバックスラッシュの後の空白は読まれません。
`style A stroke-width:3px\ ,stroke:#0f0` は、
`style A stroke-width: 3px\, stroke: #0f0` と印字します。
[fixture: whitespace-between-tokens/style-backslash-space-dropped]
`linkStyle` のスタイルのうち、名前が `stroke` で終わり、
値が空白とタブだけのものは、書かれたまま残します。
mermaid.js はそれから矢印の頭に色を付けず、後の `stroke:` も試さないからです。
`linkStyle 0 stroke: ,   stroke:#f00` は、
`linkStyle 0 stroke: , stroke: #f00` と印字します。
[fixture: whitespace-between-tokens/link-style-blank-stroke-value-kept]
バックスラッシュで終わる `linkStyle` のスタイルは、
その後に空白があるかないかを保ち、空白の連続は最初の 1 文字にします。
mermaid.js はリンクのスタイルを書かれたまま `;` でつなぐので、
バックスラッシュが `;` をエスケープするからです。
`linkStyle 0 stroke-width:4px\ ,stroke:#0f0` は、
`linkStyle 0 stroke-width: 4px\ ,stroke: #0f0` と印字します。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
[fixture: whitespace-between-tokens/link-style-backslash-space-kept]
`classDef` では、バックスラッシュの後の `,` はスタイルの一部です。
バックスラッシュと `,` の間の空白は、
除くと `,` がスタイルの一部になるので残します。
`classDef c fill:a\ ,stroke:b` は、
`classDef c fill: a\ , stroke: b` と印字します。
`style` と `linkStyle` では、`,` は前に何があってもスタイルを終えます。
[fixture: whitespace-between-tokens/style-backslash-before-comma]
バックスラッシュの後で `:` の前にある空白も、
除くと `:` がエスケープされるので残し、その空白の後ろの空白は、
ほかの `:` の前と同じく除きます。
`style A fill\   :#f00` は `style A fill\ : #f00` と印字します。
コメントやディレクティブがある文、空白だけのスタイルがある文、
スタイルに改行があるか、行に保つ `;` がある文は、書かれたまま残します。
[fixture: whitespace-between-tokens/style-blank-style-kept]
[fixture: whitespace-between-tokens/style-colon-escaped-space-kept]
[fixture: whitespace-between-tokens/style-colon-escaped-space-run-dropped]
[fixture: whitespace-between-tokens/style-escaped-space-before-comma]
[fixture: whitespace-between-tokens/style-comma-beside-directive-kept]
[fixture: whitespace-between-tokens/style-comma-with-kept-semicolon-kept]
U+2028 と U+2029 は、その場所に残します。
[test: U+2028 before the comma of a flowchart style statement]
[test: U+2029 after the comma of a flowchart style statement]
`direction` の文の、`direction` の前と値の後のテキストは例外で、
書かれたまま残します（[方向](#方向)を参照）。
[fixture: whitespace-between-tokens/class-def-and-link-style-spaced]
[fixture: whitespace-between-tokens/subgraph-quoted-name-runs-collapsed]
`style`・`classDef`・`linkStyle` の文では、最初のスタイルの前の空白は、
mermaid.js の文の規則が読むものなので、空白 1 つにします。
そこにディレクティブがあれば、[ディレクティブ](#ディレクティブ)のとおり、
その空白をディレクティブの前に置きます。
`style A %%{init: {}}%%  fill:red` は、
`style A %%{init: {}}%%fill:red` と印字し、両者の Db は同じです。
スタイルの語と語の間の空白とタブの連続は、空白 1 つで印字し、
語と語の間に空白があるかどうかは、書かれたまま残します。
`classDef c fill:#f00    stroke:#333` は、
`classDef c fill: #f00 stroke:#333` と印字します。
一重引用符の文字列の中と閉じていないコメントの中の連続と、
バックスラッシュの後ろのエスケープは、CSS が値の一部として読むので、
書かれたまま残します。
エスケープは、最大 6 桁の 16 進数字とその直後の空白かタブ 1 文字、
または 16 進数字が続かないときの次の 1 文字です。
エスケープの後ろの連続は、ほかと同じ連続です。
`font-family:a\   b` は `font-family: a\  b` と印字します。
`font-family:Arial\20   Black` は、`font-family: Arial\20  Black` と印字します。
`font-family:Arial\0000201   Black` では、エスケープは 6 桁の数字の後で終わり、
`font-family: Arial\0000201 Black` と印字します。
[fixture: whitespace-between-tokens/style-inner-whitespace-collapsed]
[fixture: whitespace-between-tokens/style-words-run-spaced]
[fixture: whitespace-between-tokens/style-string-runs-kept]
[fixture: whitespace-between-tokens/style-backslash-run-spaced]
[fixture: whitespace-between-tokens/style-hex-escape-run-spaced]
[fixture: whitespace-between-tokens/style-hex-escape-tab-run-spaced]
[fixture: whitespace-between-tokens/style-hex-escape-seven-digits-run-spaced]
[fixture: whitespace-between-tokens/style-words-directive-kept]
`linkStyle default`、`classDef`、`style` の形は、ER と requirement と同じです。
[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。

`:` で始まるスタイルと、`:` の前にバックスラッシュと空白があるスタイルも、
ほかのスタイルと同じく、
バックスラッシュがエスケープする空白のほかは `:` の前に空白を置かず、
後ろに空白 1 つを置き、語と語の間の連続を空白 1 つで印字します。
CSS が `:` の前後の空白を捨て、連続を 1 つとして読むためです。
`style A :  red   x` は `style A : red x` と印字し、
`style A fill\ :red   x` は `style A fill\ : red x` と印字します。
[fixture: whitespace-between-tokens/style-colon-first-run-spaced]
[fixture: whitespace-between-tokens/style-escaped-space-run-spaced]
閉じていないコメントはスタイルの終わりまで続き、中の連続は残します。
[fixture: whitespace-between-tokens/style-unclosed-comment-runs-kept]

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
  style A fill: #f00
  class A c
  F --> G
```

入力
([whitespace-between-tokens/style-colon-and-comma-spaced-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-colon-and-comma-spaced-input.mmd)):

```mmd
flowchart LR
  A
  style A fill:#f00 , stroke:#333
```

出力
([whitespace-between-tokens/style-colon-and-comma-spaced-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-colon-and-comma-spaced-output.mmd)):

```mmd
flowchart LR
  A
  style A fill: #f00, stroke: #333
```

入力
([whitespace-between-tokens/subgraph-name-runs-collapsed-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-runs-collapsed-input.mmd)):

```mmd
flowchart LR
  subgraph a   b
    A
  end
```

出力
([whitespace-between-tokens/subgraph-name-runs-collapsed-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/subgraph-name-runs-collapsed-output.mmd)):

```mmd
flowchart LR
  subgraph a b
    A
  end
```

入力
([whitespace-between-tokens/style-after-directives-input.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-input.mmd)):

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
([whitespace-between-tokens/style-after-directives-output.mmd](../tests/fixtures/flowchart/whitespace-between-tokens/style-after-directives-output.mmd)):

```mmd
flowchart LR
  A
  style A %%{init: {}}%%%%{init: {}}%%fill:red
  classDef a,b %%{init: {}}%%%%{init: {}}%%fill:red
  A --> A
  linkStyle 0 %%{init: {}}%%fill:red
  linkStyle default interpolate basis %%{init: {}}%%%%{init: {}}%%stroke:red
```

`call` の後の関数名と、その後の `(` の間の空白は、書かれたまま残します。
mermaid.js は、名前を `(` の前まで、空白も含めて読むので、
`click A call fn  ()` は、`fn` と 2 つの空白を名前とする関数を呼びます。
[fixture: whitespace-between-tokens/callback-name-arguments-forms-kept]
引数の両端と `,` の前には空白を置かず、後ろに空白を 1 つ置きます。
`click A call f(  "x" ,y )` は `click A call f("x", y)` と印字します。
mermaid.js は引用符の外の `,` で引数を分け、各部分の両端の空白を除き、
同じ引数で関数を呼ぶからです。
（[同じに描かれる呼び出しの引数](./compatibility.ja.md#同じに描かれる呼び出しの引数)）。
引用符の中の空白は残し、空の部分を含む引数も書かれたままにします。
[fixture: whitespace-between-tokens/callback-arguments-spaced]
mermaid.js の行の規則が読むかもしれない引数の間の隙間は、
空白があるかないかを保ちます。
`click A call f(style:x,#b;c)` は書かれたまま残します。
`,` の後に空白を置くと、規則が無視する最後の `;` が変わるからです。
（[同じに描かれる呼び出しの引数](./compatibility.ja.md#同じに描かれる呼び出しの引数)）。
[fixture: whitespace-between-tokens/callback-arguments-line-rule-kept]
引数が空白だけの呼び出しの括弧は互いに接し、
`click A call f( )` は `click A call f()` になります。
mermaid.js はどちらも引数のない同じ呼び出しとして読むからです。
括弧の間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおり、
両側の括弧に接します。
[fixture: whitespace-between-tokens/callback-blank-parentheses-touch]
複数行に書かれた文は書かれたまま残すので、括弧の間の改行とコメント行も残ります。
[fixture: whitespace-between-tokens/callback-blank-parentheses-lines]
括弧の間の U+2028 と U+2029 は、そのまま残します。
[test: U+2028 between the parentheses of a blank flowchart callback]
[test: U+2029 between the parentheses of a blank flowchart callback]

`call` なしで書いたコールバックは、後ろに `(` のない click の id であり、
`call` の後の名前の規則は当てはまりません（詳しくは、
[FlowchartClickCallbackStatement](../../spec/docs/ast/flowchart.ja.md#flowchartclickcallbackstatement)
を参照）。
文の各部分の間の空白は 1 つの空白にします。
`click   A cb   "tip"` は `click A cb "tip"` と出力します。
[fixture: whitespace-between-tokens/click-without-call-collapsed]

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
  click A call fn  (x)
  click B call gn   (y, z)
```

### 矢印の前後の空白

辺の前と後に、mermaid.js のドキュメントの書き方のとおり、
空白を 1 つずつ置きます。 [fixture: arrow-spacing/other-link-kinds]
[fixture: arrow-spacing/ampersand-spacing-kept]
[fixture: arrow-spacing/arrow-length-kept]
2 つの矢印の間に書いたテキストは、両側に空白を 1 つずつ置きます。
[fixture: arrow-spacing/text-between-other-link-kinds]
[fixture: arrow-spacing/directive-in-text-between-arrows]
`|` で囲んだラベルは矢印とその `|` に接し、辺の id はその `@` と矢印に接します。
[fixture: arrow-spacing/pipe-label-other-link-kinds]
[fixture: arrow-spacing/edge-id-with-labels]
[fixture: arrow-spacing/edge-id-whitespace-before-arrow-dropped]
引用符で囲んだ `|` の間のラベルは、ほかの引用符で囲んだラベルと同じく、
書かれたまま残し（詳しくは、[ラベルの内側の空白](#ラベルの内側の空白)を参照）、
その `|` は矢印と引用符に接します。
[fixture: arrow-spacing/pipe-label-string-kept]

辺の id が矢印の始まりと同じ形のとき（`--`、`==`、`-.`、1 つ以上の `.` と `-`、
先頭に頭の `x`、`o`、`<` があってもよい。頭のない `~~~` も同じ）は、
前の形に接して印字します。
この id は、前に空白がないときだけ辺の id です。
空白の後では字句解析が矢印を読み、残りはそのテキストになるか、
入力が拒否されるので、`A[x]--a@-->B` の辺の id は `--a`、
`A[x] --a@-->B` のリンクのテキストは `a@` です。
[fixture: arrow-spacing/edge-id-arrow-like-kept-attached]
[fixture: arrow-spacing/edge-id-arrow-like-with-head]
[fixture: arrow-spacing/edge-id-arrow-like-dotted-forms]
[fixture: arrow-spacing/edge-id-arrow-like-after-every-shape]
[fixture: arrow-spacing/edge-id-arrow-like-with-link-text]
[fixture: arrow-spacing/edge-id-arrow-like-chain]
[fixture: arrow-spacing/edge-id-arrow-like-after-whitespace-is-link-text]
それ以外の辺の id の前には、空白を 1 つ置きます（`=a`、`~~a`、`.a`、`x-a`、
`x~~~a` など）。 [fixture: arrow-spacing/edge-id-not-arrow-like-gets-one-space]
形と辺の id の間の隙間は、その空白で辺の id と読まれるかどうかが決まるので、
規則のない隙間です。
ディレクティブや無視される `;` の前後や、その間など、
隙間のどこかに空白が書かれていれば、ディレクティブの前に空白 1 つを置き、
書かれていなければ、空白を置きません。
ディレクティブと `;` は、[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: arrow-spacing/edge-id-arrow-like-after-directive]
[fixture: arrow-spacing/edge-id-arrow-like-after-directive-runs]
[fixture: arrow-spacing/edge-id-arrow-like-after-ignored-semicolon]
[fixture: arrow-spacing/edge-id-arrow-like-after-ignored-semicolon-runs-collapsed]

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

入力
([arrow-spacing/edge-id-arrow-like-kept-attached-input.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-arrow-like-kept-attached-input.mmd)):

```mmd
flowchart LR
A[x]--a@-->B
C[x]==c@==>D
E[x]-.e@.->F
G[x].-g@-.->H
I[x]~~~i@~~~J
```

出力
([arrow-spacing/edge-id-arrow-like-kept-attached-output.mmd](../tests/fixtures/flowchart/arrow-spacing/edge-id-arrow-like-kept-attached-output.mmd)):

```mmd
flowchart LR
  A[x]--a@--> B
  C[x]==c@==> D
  E[x]-.e@.-> F
  G[x].-g@-.-> H
  I[x]~~~i@~~~ J
```

### ラベルの内側の空白

引用符のないラベルの両端の空白は、mermaid.js が取り除くのと同じく取り除きます。
[fixture: label-inner-whitespace/trimmed-every-shape]
ラベルの中の空白は保ちます。
空白とタブだけのラベルは、空白 1 つに印字します。
mermaid.js は空白とタブがいくつあっても同じ空のテキストとして読み、
同じ図を描きます。
文字が 0 個のラベル（`A[]`）は拒否されるので、
ラベルを保つ最小の空白は 1 つです。
`A[   ]` は `A[ ]` と印字し、ほかのすべての形と、
`|` の間のリンクのラベルも同じです。
[fixture: label-inner-whitespace/all-whitespace-every-shape]
引用符で囲んだラベルは書かれたまま残しますが、
閉じの引用符と閉じ括弧の間の空白は落とします。
`A["x" ]` は `A["x"]` に、`B{"x" }`、`C(("x" ))`、`D[/"t" /]` も同じです。
[fixture: label-inner-whitespace/quotes-kept]
[fixture: label-inner-whitespace/string-closing-touches]
落とすのは、閉じの引用符と同じ行にある空白だけです。
引用符と括弧の間の改行、コメント行、ディレクティブと、
その行にある U+2028 と U+2029 は残り、改行の後の括弧は継続行になります。
継続行の先頭にある U+2028 と U+2029 は字下げとして読まれるので、
印字が行に与える字下げに置き換わります。
[fixture: label-inner-whitespace/string-closing-break-and-directive-kept]
[test: U+2028 between the closing quote and the bracket of a flowchart label]
[test: U+2029 between the closing quote and the bracket of a flowchart label]
接続のラベルを閉じる `|` も同じく閉じ引用符に接します。
`A-->|"x" |B` は `A -->|"x"| B` と印字し、引用符と `|` の間のディレクティブ、
U+2028、U+2029 は残します。
[fixture: label-inner-whitespace/pipe-string-closing-touches]
[test: U+2028 between the closing quote and the `|` of a flowchart edge label]

ラベルの先頭の空白は、それがないとラベルの読み方が変わるときは、
空白 1 つとして残します。
ラベルが `/`、`\`、`-`、`"` のどれかで始まるときと、
`>` の形のラベルの最初の語（空白か `"` まで）が `@` を含むときです。
[fixture: label-inner-whitespace/compat-leading-backslash-kept]
[fixture: label-inner-whitespace/leading-whitespace-trimmed-without-trigger]
[fixture: label-inner-whitespace/leading-whitespace-run-becomes-one]
空白がないと、`A[ /x/]` はラベル `x` の lean-right の形に、
`A( -x-)` は ellipse になり、`A>x@ ]` は拒否されます。
辺の id の並びが `>` で止まらず、`A>x` を辺の id として読むからです。
そうしたラベルは、末尾にも空白 1 つを置きます。
`A[ /x/]` は `A[ /x/ ]` になります。
ただし、斜めの形の閉じの `?]` と `=]` の前には置きません。
mermaid.js が、その空白と `?` や `=` をテキストとして読むからです。
`A[/ -x/?]` はそのままです。
この規則は、`@` を除き、どの形でも、`|` の間のテキストでも同じです。
[fixture: label-inner-whitespace/leading-whitespace-every-shape-kept]
[fixture: label-inner-whitespace/leading-whitespace-pipe-label-kept]

`>` 以外で開く形では、ラベルの中の `@` に空白は要りません。
辺の id の並びは、括弧類と `|` で止まるので、`A[x@]` と `A-->|x@|B` のラベルは、
空白があってもなくても `x@` です。
`A[ user@example.com ]` は `A[user@example.com]` になります。
[fixture: label-inner-whitespace/leading-whitespace-at-sign-trimmed]
agentflow では違います。
辺の id の並びがそこで止まらず、`A[x@]` は拒否されます。
そのため、最初の語に `@` があるラベルは、前の空白を残します。
詳しくは [Labels](./agentflow.ja.md#labels) を参照してください。

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
H[ %%{init: {}}%%/x/]
I{ -x }
J> x@ ]
```

出力
([label-inner-whitespace/leading-whitespace-kept-output.mmd](../tests/fixtures/flowchart/label-inner-whitespace/leading-whitespace-kept-output.mmd)):

```mmd
flowchart LR
  A[ /x/ ]
  B( -x- )
  C(( -x ))
  D[/ "x /]
  H[ %%{init: {}}%%/x/ ]
  I{ -x }
  J> x@ ]
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
mermaid.js の文書の例は前者を 14 回、後者を 8 回使い、2 倍にはならないためです。
（[リンクのラベル](./compatibility.ja.md#リンクのラベル)を参照）。
[fixture: link-label-form/other-link-kinds-kept]
[fixture: link-label-form/flowchart-header-both-forms-kept]
一方の形をもう一方に変えるには、`|` を含むラベルの規則が要ります。
`A -- a|b --> B` は受理されますが、`A -->|a|b| B` は拒否されます。
[fixture: link-label-form/pipe-in-text-between-arrows-kept]

swimlane 図の辺のラベルは、`|` の間に印字します。
mermaid.js の文書の例はこの形を 12 回使い、もう一方の形は使わないためです。
通常のテキスト（文字、数字、空白、`_`、`,`、`?`、`!`）のラベルと、
8 つの矢印 `-->`、`---`、`--o`、`--x`、`-.->`、`-.-`、`==>`、`===` が対象です。
`A -- text --> B` は `A -->|text| B` と印字します。
`|` や `%%` を含むラベル、文字列、Markdown ラベルは書かれたまま残します。
[fixture: link-label-form/swimlane-arrows-to-pipes]

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
ただし、1 行に書いたデータブロック `@{ … }` は、その行が `printWidth` より広く、
[データブロック](#データブロック)の条件を満たすときに、複数行で印字します。
[fixture: line-wrapping/print-width-ignored]
それ以外で行をどこで分けるかは、連鎖と同じく書き手が決めます。

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

### アクセシビリティの行

通常の行は`accTitle: value`または`accDescr: value`と印字します。
コロンを語に接し、値の前にASCII空白1つを置き、値の両端の空白を落とします。
[fixture: accessibility-lines/tight-colon]
[fixture: accessibility-lines/spaced-colon]
[fixture: accessibility-lines/value-runs-collapsed]
Dbが同じ形から選ぶ場合は、その図種の理由がなければ兄弟の図種に揃えます。
flowchartの通常のアクセシビリティ行に固有の理由はないので、
[C4](./c4.ja.md#アクセシビリティの行)、[class](./class.ja.md#ラベル)、
[usecase](./usecase.ja.md#direction-and-accessibility)と同じ短い形にします。

`accDescr` の値の中の空白とタブの連なりは、空白 1 つで印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
ブラウザーが `accTitle` をツールチップとして表示するので、
その連なりは書かれたまま残します。
インラインの`%%`と`#`は値の文字として保ちます。
[fixture: accessibility-lines/value-runs-collapsed]
[fixture: accessibility-lines/block-runs-collapsed]
[fixture: accessibility-lines/inline-percent-hash]
値が空または空白だけでも文の形を保ち、`accTitle:`または`accDescr:`とし、
後ろに空白を足しません。 [fixture: accessibility-lines/empty-title]
[fixture: accessibility-lines/empty-description]
[corpus fixture: flowchart/gram-acc-title-empty-at-end]
[corpus fixture: flowchart/db-acc-descr-empty-replaces]
Mermaidはコロンの次行の通常の文字を値と読むので、語と同じ行につなぎます。
[fixture: accessibility-lines/next-line-values]

文中の実コメントやdirectiveがあれば短い形につなぎません。
従来の[複数行の文](#複数行の文)の配置を保ち、
コメントやdirectiveを含む継続行はキーワードより1段深く置きます。
コメントやdirectiveの文字と、著者が文を区切った改行を保ちます。
flowchartはコロンの後のコメントを読み飛ばして後の値を読みます。
通常の結合が使えない場合も、従来の継続行の規則を保つためです。
[fixture: accessibility-lines/next-line-comment-kept]
[fixture: accessibility-lines/description-comment-continuation]
[fixture: accessibility-lines/inline-directive-kept]
[fixture: accessibility-lines/next-line-directive-kept]
[fixture: accessibility-lines/title-directive-continuation]

この短い形は[1行に1文](#1-行に-1-文)の規則に優先しません。
値や別の文にある非区切りの`;`を含む行では、
アクセシビリティの文字と`;`の両側の空白を保ちます。
複数行に書かれた文は、その行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合に、書かれたまま残します。
それ以外の複数行の文は、`;` を含んでいても通常どおりつなぎます。
[fixture: accessibility-lines/semicolon-value-kept]
[fixture: accessibility-lines/neighbour-semicolon-kept]
`;` があるだけでは、行をつなぐ妨げにはなりません。
[fixture: accessibility-lines/next-line-semicolon-joined]
方向の文字列がある行は[字下げ](#字下げ)に従い、原文、改行、桁位置を保ちます。
ほかの文書化された保持行の理由も優先します。
[fixture: accessibility-lines/direction-text-kept]
[fixture: accessibility-lines/next-line-direction-kept]
通常の行には`tabWidth: 0`での最小幅と`useTabs`を含む設定の字下げを使い、
これらの設定でも保持の例外を保ちます。 [fixture: accessibility-lines/zero-width]
[fixture: accessibility-lines/tabs]

CRには共通の改行の正規化を使います。
受理する外側の隙間のNBSP、U+2028、U+2029も同じコロンと値の規則で整え、
値内部の文字と保持する`;`の脇の空白は保ちます。
これらの文字はエスケープしたinlineテストに置きます。
[test: graph accessibility: flowchart cr-lines]
[test: graph accessibility: flowchart unicode-gaps]
[test: graph accessibility: flowchart unicode-values]
[test: graph accessibility: flowchart unicode-semicolon-kept]
文字とtriviaのない閉じた説明ブロックの内側は、空白や空行があっても`{}`です。
外側の語と波括弧の隙間は、元が接していても空白 1 個にします。
語と本文の開始を見分けやすくするためで、`accDescr {}` と印字します。
[fixture: accessibility-lines/empty-block-touching-keyword]
囲む文字がないので内側の空白も不要で、コロン行と同じ兄弟の図種に揃える理由で、
usecaseのDbが同じ形に従います。 [fixture: accessibility-lines/empty-block-tight]
[fixture: accessibility-lines/empty-block-spaced]
[fixture: accessibility-lines/empty-block-lines]
空ブロック内で受理するNBSP、U+2028、U+2029も落とします。
[test: accessibility blocks: flowchart empty-block-unicode]
保持行の例外を優先し、コメントやdirectiveがあるブロックは従来の配置を保ちます。
[fixture: accessibility-lines/empty-block-semicolon-kept]
[fixture: accessibility-lines/empty-block-directive-kept]
[fixture: multi-line-values/accdescr-block-comment-only]

1 行のブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
[fixture: accessibility-lines/block-tight-text]
[fixture: accessibility-lines/block-spaced-text]
[fixture: accessibility-lines/block-padded-text]
[fixture: accessibility-lines/block-left-padding-only]
[fixture: accessibility-lines/block-right-padding-only]
mermaid.js の文書には、1 行のブロックの例がありません。

複数行の本文は、
[複数行の値](#複数行の値)のトップレベルと subgraph の規則に従い、
単独行の閉じ括弧を `accDescr` に揃えます。
閉じ括弧が0桁目でも字下げされていても同じです。
兄弟の図種と同じ形で、flowchart固有の理由はありません。
[fixture: accessibility-lines/block-close-column-zero]
[fixture: accessibility-lines/block-close-indented]
[fixture: accessibility-lines/block-comment-close-column-zero]
[fixture: accessibility-lines/block-comment-close-indented]
`tabWidth: 0`の本文の最小幅でも同じ空ブロックと閉じ括弧の規則を使います。
[fixture: accessibility-lines/block-zero-width]

入力（escape 表記）:
`"flowchart LR\naccTitle:Compact title\naccDescr:Compact description"`。

出力
([accessibility-lines/tight-colon-output.mmd](../tests/fixtures/flowchart/accessibility-lines/tight-colon-output.mmd)):

```mmd
flowchart LR
  accTitle: Compact title
  accDescr: Compact description
```

入力（escape 表記）: `"flowchart LR\naccDescr {a}\nA[Block spacing]"`

出力
([accessibility-lines/block-tight-text-output.mmd](../tests/fixtures/flowchart/accessibility-lines/block-tight-text-output.mmd)):

```mmd
flowchart LR
  accDescr: a
  A[Block spacing]
```

入力（escape 表記）:
`"flowchart LR\naccDescr: previous description\naccDescr { }\nA[Empty spacing]"`

出力
([accessibility-lines/empty-block-spaced-output.mmd](../tests/fixtures/flowchart/accessibility-lines/empty-block-spaced-output.mmd)):

```mmd
flowchart LR
  accDescr: previous description
  accDescr {}
  A[Empty spacing]
```

入力（escape 表記）:
`"flowchart LR\naccTitle:\n%%{init: {}}%%\nTitle after directive\nA[Continuation]"`。

出力
([accessibility-lines/title-directive-continuation-output.mmd](../tests/fixtures/flowchart/accessibility-lines/title-directive-continuation-output.mmd)):

```mmd
flowchart LR
  accTitle:
    %%{init: {}}%%
    Title after directive
  A[Continuation]
```

### 複数行の文

通常のアクセシビリティのコロン行と、triviaのない閉じた空の説明ブロックは、
[アクセシビリティの行](#アクセシビリティの行)に従い行をつなぎます。
それ以外の複数行の文は改行を保ち、2行目以降を1行目より1段深く置きます。
文をどこで折るかは、連鎖や長い行と同じく書き手の選択です。
トークンの間の改行は、印字が書かない行末の空白を要しません。
sequence、class、state は、そこでは改行が空白の後でだけ数えられるので、
行をつなぎます。 [fixture: multi-line-statements/continuation-in-subgraph]
[fixture: multi-line-statements/label-over-lines]
[fixture: multi-line-statements/directive-inside]
途中のコメント行は文の中に残り、2 行目以降と同じ段に置きます。
[fixture: multi-line-statements/several-comments-inside]
部品の間の隙間、
またはその隙間にあるコメントやディレクティブの中に改行がある `click` の文は、
書かれたまま残します。
mermaid.js は、2 行目以降が字下げされていると、その一部を拒否するからです。
[fixture: multi-line-statements/click-in-subgraph-kept]
[fixture: multi-line-statements/click-forms-kept]
[fixture: multi-line-statements/click-comment-inside-kept]
文字列の中や、引数のある呼び出しの `(` と `)` の間にある改行は、
その値の一部（そこにあるコメントやディレクティブも含みます）で、
値は書かれたまま印字し、文の後の行を字下げすることもありません。
そのような文のほかの隙間には、普通の規則を掛けます。
`click   A "/u" "x` と次の行の `y"` は、
1 行の文と同じように `click A "/u" "x` と `y"` になります。
[fixture: multi-line-statements/click-string-over-lines-collapsed]
[fixture: multi-line-statements/click-callback-args-over-lines-collapsed]
[fixture: multi-line-statements/click-callback-args-comment-line-collapsed]
[fixture: multi-line-statements/click-string-over-lines-directive-inside]
隣にディレクティブ、`;`、コメント行、空行があるときも、
1 行の文と同じに扱います。
[fixture: multi-line-statements/click-string-over-lines-beside-directive]
[fixture: multi-line-statements/click-string-over-lines-with-semicolon]
[fixture: multi-line-statements/click-string-over-lines-semicolon-kept]
[fixture: multi-line-statements/click-string-over-lines-comment-and-empty-line]
部品の間の U+2028 と U+2029 は、複数行の文字列の後でも、そのまま残します。
[test: U+2028 between the parts of a flowchart click statement with a string over lines]
[test: U+2029 between the parts of a flowchart click statement with a string over lines]
[test: U+2028 after the string of a flowchart click statement with a string over lines]
[test: U+2029 after the string of a flowchart click statement with a string over lines]

図のヘッダーや subgraph のヘッダーで、
U+2028 や U+2029 の後にコメント行がある範囲は書かれたまま残します。
mermaid.js がコメント行とその前の空白を除き、
後続の行を前のテキストにつなぐためです。
[test: a comment line after U+2028 in a flowchart header]
[test: a comment line after U+2029 in a flowchart header]
[test: a comment line after U+2028 in a flowchart subgraph header]
[test: a comment line after U+2029 in a flowchart subgraph header]
コメント行がこのように入る文も、同じ理由で、
先頭から末尾までを書かれたまま残します（詳しくは、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）。 [test: a comment line after U+2028 in a flowchart statement]
[test: a comment line after U+2029 in a flowchart statement]

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

### データブロック

各 `@{ ... }` の頂点への付着を保ち、YAML の整形やキーと値の変更はしません。
変えるのは、1 行のブロックの両端、移動できる複数行ブロックの余白、
長すぎる行にある 1 行のブロックを複数行に分けることの 3 つです。
変わるのは空白、改行、項目間の `,` だけです。

1 行のブロックは、両端の内側に空白を 1 つずつ置いて印字します。
`A@{shape: circle}` も `A@{   shape: circle   }` も `A@{ shape: circle }`
になります。
mermaid.js は 1 行のブロックの文字列を、前に `{` と改行、
後ろに改行と `}` を付けて、YAML の flow mapping として読みます。
([flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L160-L168)、
[agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L364-L371)、
[kanban](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L118-L129)、
[sequence](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L164-L172))
このため、両端の半角空白とタブは意味を持ちません。
[fixture: data-blocks/one-line-padded]
[fixture: data-blocks/one-line-padded-zero-width]
取り除くのは半角空白とタブだけで、
U+00A0 などの空白は文字列の一部として残します。
[test: data blocks: flowchart one line with no-break spaces at the ends]
半角空白とタブしか含まないブロックや何も含まないブロックは、
`@{ }` と印字します。
mermaid.js は空の flow mapping として読むので、`A@{}`、`A@{   }`、
`A@{ }` の Db と図は同じです。
sequence 図では、`@{}` は拒否され、`@{   }` は受理されます。
[fixture: data-blocks/one-line-space-only-padded]
次の場合、ブロックは書かれたままにします。

- `%%{` を含むとき。
  directive は、複数行のブロックと同じく、文字と桁を保ちます。
  [fixture: data-blocks/one-line-directive-kept]
- その行が全体を保つ行であるとき。
  下の条件と同じです。 [fixture: data-blocks/one-line-kept-line-kept]
- 別のブロックと接しているとき。
  間に何もないか、directive だけがある場合です。
  `}@{` のように接する 2 つのブロックは、mermaid.js が文字列を連結して読むので、
  片方の端の空白が両方のテキストを変えます。
  [fixture: data-blocks/one-line-touching-blocks-kept]
- 文字列が 1 桁目の `---`、`...`、`%` で始まるとき。
  mermaid.js は、`---` か `...` の後に空白か終わりが続く始まりを、
  YAML の文書区切りとして読みます。
  前に空白があれば普通の文字列になるので、`A@{---}` は拒否され、
  `A@{ --- }` は受理されます。
  `---x` のような始まりは区切りでなく、
  `%a: 1` は空白があってもなくても拒否されますが、
  複数行のブロックの規則はこの 3 つの始まりを書かれたままにするので、
  この規則も同じにします。
  すでに空白かタブがあるブロックは整えます。
  [fixture: data-blocks/compat-document-marker-data-block-kept]
  [fixture: data-blocks/one-line-document-marker-after-space-padded]
- U+2028 か U+2029 を含むとき。
  mermaid.js はこの文字列を 1 行として包み、
  空白があってもなくても同じに読みますが、1 行のブロックの規則は、
  この 2 つを含めて改行のない文字列に限ります。
  [test: data blocks: flowchart one line with U+2028 inside]
  [test: data blocks: flowchart one line with U+2029 inside]

接していないブロックは、1 文に複数あっても、それぞれ整えます。
同じ文の複数行のブロックの隣にある 1 行のブロックも同じです。
[fixture: data-blocks/one-line-separate-blocks-padded]
コメント、ディレクティブ、空行、空の description block、
ブロックの隣にある捨てられる文の `;` は、それぞれの規則に従います。
CRLF と CR は `endOfLine` に従います。
[fixture: data-blocks/one-line-surrounding-trivia]
[test: data blocks: flowchart one line CRLF]
[test: data blocks: flowchart one line CR]

1 行のブロックがある行が `printWidth` より長いときは、
読みやすくなる場合に複数行に分けて印字します。
1 行に 1 項目ずつ文の 1 段内側に置き、`}` は文と同じ桁の単独行に置きます。
移動できる複数行のブロックと同じです（後述）。
Prettier が 2 つの形から選び、行が収まる場合は 1 行のままにします。
`{` までの行も長すぎる場合（前にノードの長いテキストがある場合）は、
複数行にしても長すぎる部分は短くならないので、1 行のままにします。
[fixture: data-blocks/long-split]
[fixture: data-blocks/long-prefix-too-long-kept]
行の幅には Prettier が測る幅を使い、タブは幅に数えないため、
タブがある行は測った幅より画面上で広くても、1 行のままになることがあります。
[fixture: data-blocks/long-tabs-not-counted]
mermaid.js は、1 行のブロックのテキストを、
`,` で項目を区切る YAML の flow mapping として読み、
複数行のブロックのテキストを、
項目ごとに行を分ける block mapping として読みます（上のソースを参照）。
どの項目も両方の読み方で同じに読まれるキーと値であれば、両者は同じに読まれます。
下の条件がこれを保証します。
各項目は、両端の空白とタブを除いて書かれたまま印字します。
変わるのは空白、改行、項目間の `,` だけで、Db は同じです。
次の条件をすべて満たす場合だけ、ブロックを分けます。

- flowchart、agentflow、kanban のいずれかの図のブロックであること。
  sequence 図は block mapping の行を拒否し、usecase 図の `@{` は、
  独自の構文を持ちます（[複数行の値](./sequence.ja.md#複数行の値)と
  [Native metadata](./usecase.ja.md#native-metadata)を参照）。
  [fixture: sequence/whitespace-between-tokens/data-block-long-kept]
  [fixture: usecase/native-metadata/long-block-kept]
- 複数行のブロックと同じく、`tabWidth` が 0 でないこと。
  [fixture: data-blocks/long-zero-width-kept]
- 整形器がタブ（`useTabs`）で字下げしないこと。
  分けたブロックの行は空白で字下げするため、
  タブの幅が特定の値のときだけ正しくそろいます。
  一方、1 行のままのブロックは、どのタブ幅でも同じに読めます。
  1 行のブロックは 1 行のままにします。
  [fixture: data-blocks/long-use-tabs-kept]
- 文の最初の行にあり、その文の唯一のブロックで、文の最後にあること。
  `}` の後にテキストがあると、単独行の `}` の後にそのテキストが置かれ、
  ブロックが 1 行のときより読みづらくなります。
  最初の行は文の段を決めるために使います。
  [fixture: data-blocks/long-text-after-kept]
  [fixture: data-blocks/long-two-blocks-kept]
- 項目が 2 つ以上あること。
  1 項目を複数行にしても行は短くならず、行数が増えるだけです。
  [fixture: data-blocks/long-one-entry-kept]
- どの項目も、コロンと空白で区切られたキーと値であり、
  値が項目の末尾までを占める引用符付きのスカラーか、plain scalar であること。
  plain scalar は、YAML が意味を与える文字（`&`、`*`、`!`、`|`、`>`、`%`、`@`、
  バッククォート、および直後に空白がある `-`、`?`、`:`）で始まらず、末尾にも、
  直後に空白がある位置にも `:` を含まないものです。
  block mapping は、これらを flow mapping とは違って読むためです。
  値がない項目（`{ pos, h: 60 }` の `pos`）、空の項目（末尾の `,` の後）、
  anchor や alias である値、`pos:t` のような項目は、どれもこれに当たりません。
  [fixture: data-blocks/long-entry-without-value-kept]
  [fixture: data-blocks/long-trailing-comma-kept]
  [fixture: data-blocks/long-indicator-value-kept]
  [fixture: data-blocks/long-colon-without-space-kept]
- 引用符の外に `[`、`]`、`{`、`}` がなく、
  コメント（先頭か空白の後の `#`）がないこと。
  値の flow collection は 1 行ではない 1 項目として読まれ、
  コメントは block mapping の行を終わらせるためです。
  [fixture: data-blocks/long-nested-kept]
  [fixture: data-blocks/long-comment-kept]
- 両端を整える条件を満たすこと。
  ブロック内に directive がなく、行全体を保つ行でなく、
  ほかのブロックと接していないことです。
  [fixture: data-blocks/long-kept-line-kept]

URL のように、直後に空白がない `:` を持つ値は分けます。
[fixture: data-blocks/long-url-value-split]
分けたブロックは複数行のブロックなので、もう一度整形してもその形を保ちます。

入力
([data-blocks/long-split-input.mmd](../tests/fixtures/flowchart/data-blocks/long-split-input.mmd)):

```mmd
flowchart LR
A@{ shape: rect, label: "A process step with a long label", pos: "t", h: 60, constraint: "on" }
```

出力
([data-blocks/long-split-output.mmd](../tests/fixtures/flowchart/data-blocks/long-split-output.mmd)):

```mmd
flowchart LR
  A@{
    shape: rect
    label: "A process step with a long label"
    pos: "t"
    h: 60
    constraint: "on"
  }
```

移動できる複数行ブロックでは、本文の全行を同じ数の半角空白だけ動かし、
文字がある最も浅い行を文の 1 段内側に置きます。
入れ子の YAML を含む行どうしの字下げの差を保ち、内側にも外側にも動かします。
単独行の `}` は文の段に揃え、
本文の後の `}` はその行に残して行と一緒に動かします。
[fixture: data-blocks/zero-and-shallow] [fixture: data-blocks/deep-nested-yaml]
[fixture: data-blocks/closing-after-text]

次の条件をすべて満たす場合だけ動かし、満たさなければ書かれた桁を保ちます。

- `@{` の直後が改行であること。
  Mermaid は最初の行の桁を開きから、後の行をソースの行頭から数えるため、
  `A@{ shape: rect` の次行の `label: x` を字下げすると、
  受理される YAML が拒否されます。 [fixture: data-blocks/inline-opening-kept]
  開きと改行の間に空白がある場合も、書かれたまま残します。
  [fixture: data-blocks/opening-padding-kept]
- 本文の各行の行頭の空白が半角空白だけであること。
  Mermaid は flowchart と kanban のタブで字下げした YAML を拒否し、
  移動量も半角空白で数えます。 [test: data blocks: JSON leading tab kept]
- ブロックに `%%{` がないこと。
  directive のテキストと桁は書かれたまま保ちます。
  [fixture: data-blocks/directive-inside-kept]
- 最も浅い文字のある行が 0 桁なら、そこから始まる行の先頭が `---`、`...`、
  `%` でないこと。
  文書の印や YAML directive を 0 桁から動かすと、
  受理される YAML が拒否される場合があります。
  [fixture: data-blocks/document-start-kept]
  [fixture: data-blocks/document-end-kept]
  [fixture: data-blocks/yaml-directive-kept]
- `}` が単独行と言えるのは、前に半角空白だけがあり、
  その幅が文字のある最も浅い行以下のときだけであること。
  `}` の前の空白は、Mermaid がブロックのテキストの最後の行として読み、
  literal や folded のスカラーが残します。
  それより深い半角空白は、空白だけの行として値に入り、
  `}` を文の桁へ動かすと消えます。
  `}` の前のタブ、NBSP、U+2028 も、その行の文字なので、その行は本文の行で、
  行頭の空白が半角空白だけではありません。
  最も浅い行と同じ幅の半角空白は動かします。
  [fixture: data-blocks/closing-deeper-kept]
  [fixture: data-blocks/closing-tab-kept]
  [fixture: data-blocks/closing-equal-depth]
  [test: data blocks: flowchart NBSP before the closer]
  [test: data blocks: flowchart U+2028 before the closer]
  [test: data blocks: flowchart U+2029 before the closer]
- `tabWidth` が 0 でないこと。
  0 では内側の字下げの段がありません。 [fixture: data-blocks/zero-width-kept]
- ブロックの行と開始行が、行全体を残す行でないこと。
  セミコロンの行規則による保持も含みます。
  一部だけ動かすと、その行の保持に反します。
  [fixture: data-blocks/kept-body-line] [fixture: data-blocks/kept-opening-line]
- ブロックが文の最初の行から始まること。
  その行の字下げを文の段として使うため、
  `A -->` の改行後のブロックは桁を残します。
  [fixture: data-blocks/later-statement-line-kept]
- 文に、1 行でも複数行でも、ほかのブロックがないこと。
  1 つ動かすと、次のブロックは文の最初でない行から始まることになり、
  `}@{` のように接するブロックは 1 つのテキストとして読まれるので、
  移動するとその桁が分断されます。
  ブロックを 2 つ持つ文は、複数行のブロックを書かれたまま残します。
  1 行のブロックは、もう一方と接していなければ整えます。
  [fixture: data-blocks/second-block-kept]
  [fixture: data-blocks/adjacent-single-line-after-kept]
  [fixture: data-blocks/adjacent-single-line-before-kept]
  [fixture: data-blocks/separate-single-line-block-kept]
  [fixture: data-blocks/edge-adjacent-single-line-kept]

`useTabs` では、複数行のブロックを持つ文は、
最初の行の字下げも含めて書かれたまま印字します。
mermaid.js はブロックの行の前のタブを拒否するので、
ブロックの行は空白で字下げし、タブの幅が特定の値のときだけ正しくそろいます。
ブロックの行を元の位置に残して、ノードの行だけを文の深さまで字下げすると、
作者がブロックの中身と `}` をノードの行より深く書いていない場合には、
その中身と `}` より右にノードの行が置かれ、ブロックの内外が逆に見えます。
文は作者が置いた位置に残すため、入力と同じく周りの文より浅いこともあり、
作者がすでにノードにそろえていたブロックは、そろったままにします。
mermaid.js は単独行の `}` の前のタブを受理しますが、
その行はブロックのテキストの最後の行で、空行を残すスカラー（`|+`、
`>+`）が読むため、そこにタブを置くと値が変わります。
そのため、整形器はそこにタブを置きません。
[fixture: data-blocks/tab-statement-space-body]
[fixture: data-blocks/tab-statement-aligned-body-kept]
[fixture: data-blocks/use-tabs-statement-kept]
[fixture: data-blocks/use-tabs-comment-line-before-kept]
[fixture: data-blocks/use-tabs-empty-lines-kept]
[fixture: data-blocks/use-tabs-folded-empty-lines-kept]

その行の字下げは、文が始まる行の先頭に書かれた空白です。
同じ行で文の前にあるディレクティブは文と一緒に残し、
その行は先頭から書かれたまま印字します。
ただし、ディレクティブと文の間の空白の連なりは、
[ディレクティブ](#ディレクティブ)のとおり空白 1 つにします。
`C; A@{ … }` の `A@{ … }` のように、同じ行のほかの文に続く文は、
整形器が文を 1 行ずつ印字するため、独立した行に置き、
その行は元の行の先頭に書かれた字下げで始めます。
その前にあるブロックを持たない文は通常どおり字下げし、ブロックを持つ文だけ、
その行をブロックの行と一緒に残す必要があります。
[fixture: data-blocks/use-tabs-directive-before-on-line]
[fixture: data-blocks/use-tabs-not-first-on-line]
[fixture: data-blocks/use-tabs-two-statements-before]

行頭に書かれた空白は、その行の最初にあるものの字下げです。
最初にあるものはその行から始まるディレクティブの後ろで決め、
数えるのは次のものだけです。
その行から始まる文、コンテナの見出し、セクションのキーワード、`end`、
前の行から始まった文のデータブロック `@{ … }` を閉じる `}` です。
整形器は見出し、セクションのキーワード、`end` をコンテナと同じ深さに、
動かすブロックの `}` をその文の列に印字します。
作者もブロックの `}` をその文の列に書くのがふつうで、そうでなければ、
`}` の後ろの文は、書かれたとおり `}` の列に残ります。
最初にあるものと同じ深さの文は、`C; A@{ … }` のように書かれたまま印字します。
`end; A@{ … }` のように `end` が先にある文も同じです。
整形器は `end` をコンテナと同じ深さに印字し、
コンテナの後の文もその深さだからです。
同じ深さの文のブロックを閉じる `}` が先にある `}; A@{ … }` の文も同じです。
[fixture: data-blocks/use-tabs-after-end-on-line]
[fixture: data-blocks/use-tabs-after-block-closer-on-line]

それ以外の文は動かします。
整形器がノードの行の字下げを整え、
次の段落のとおりブロックの行も一緒に動かします。
該当するのは、最初にあるものより深い文と、浅い文です。
`subgraph s; A@{ … }` のように見出しが先にあると、文はコンテナの中にあり、
最初にあるものより深くなります。
`B; end; A@{ … }` や `end; end; A@{ … }` のように、コンテナの中の文か、
内側のコンテナの `end` が先にあると、文はコンテナの後にあり、
最初にあるものより浅くなります。
どちらも、文の深さのために書かれた字下げはありません。
[fixture: data-blocks/use-tabs-subgraph-header-moved]
[fixture: data-blocks/use-tabs-nested-subgraph-header-moved]
[fixture: data-blocks/use-tabs-statement-before-end-moved]
[fixture: data-blocks/use-tabs-end-before-end-moved]
[fixture: data-blocks/use-tabs-block-closer-before-end-moved]
行がそれ以外のもので始まる場合も動かします。
その空白は、上のどれの字下げでもないからです。
`B -->` の次の行の `C; A@{ … }` のように、前の行から始まった文の残り、
改行で分かれたラベルの残り、説明ブロック `accDescr { … }` の `}` がそうです。
`C; %%{init:` と次の行の `{}}%% A@{` のように、
複数行にわたるディレクティブの残りと、この一覧にない種類もそうです。
挙げ漏らした種類を動かすと、ブロックの行は mermaid.js が読む順のままで、
タブ幅が `tabWidth` と同じなら、正しくそろいます。
[fixture: data-blocks/use-tabs-edge-continuation-moved]
[fixture: data-blocks/use-tabs-label-continuation-moved]
[fixture: data-blocks/use-tabs-description-block-closer-moved]
[fixture: data-blocks/use-tabs-directive-continuation-moved]

ノードの行自体の字下げを整形器が整える必要がある場合は、
`useTabs` でないときと同じく、ブロックの行も空白で字下げして一緒に動かします。
該当するのは、
`end` がヘッダーと同じ字下げに置かれる agentflow の container のヘッダー、
数える最初にあるものと同じ深さでない文や、それ以外のもので始まる行の文（前述）、
mermaid.js が字下げをノードの段として読む kanban のノードです。
[Metadata blocks](./agentflow.ja.md#metadata-blocks)と
[データブロック](./kanban.ja.md#データブロック)を参照してください。
このとき、作者の書き方にかかわらず、タブ幅が `tabWidth` と同じなら正しくそろい、
異なるタブ幅ではその差の分だけずれます。
ブロックの行を書かれたまま残すと、
作者の字下げがたまたまタブ幅に合う場合だけ正しくそろい、
作者がノードの行より浅く書いていた場合には、その左に出ます。

本文に文字がないブロックには最も浅い文字のある行がないため、
書かれたまま残します。 [fixture: usecase/json-tables/empty-body-kept]

同じ移動を agentflow の metadata、kanban の data、usecase の JSON table、
sequence の参加者データにも適用します。
sequence では、文字がある本文行がちょうど 1 行であることも必要です。
Mermaid はブロック全体を trim して最初の行の字下げだけを除くため、
後のキーを字下げすると受理される YAML が拒否される場合があります。
[Metadata blocks](./agentflow.ja.md#metadata-blocks)、
[データブロック](./kanban.ja.md#データブロック)、
[JSON tables](./usecase.ja.md#json-tables)、
[複数行の値](./sequence.ja.md#複数行の値)を参照してください。

空白だけの行も同じ量だけ動かし、空白がなくなる場合は空行にします。
空行は空のままにします。
本文の各行の末尾空白は保ちます。
literal block scalar は空白行の幅と末尾空白を読むため、
変えると Db が変わる場合があります。 [fixture: data-blocks/scalar-blank-lines]
[fixture: data-blocks/scalar-blank-lines-outdent]

前後の directive、コメント、空行、空の説明ブロック、
捨てる文区切りの `;` はそれぞれの規則に従います。
CRLF と CR は `endOfLine` に従い、値の U+2028 と U+2029 は文字として保ちます。
[fixture: data-blocks/surrounding-trivia] [test: data blocks: flowchart CRLF]
[test: data blocks: flowchart CR] [test: data blocks: flowchart U+2028]
[test: data blocks: flowchart U+2029]

移動できるブロック内の字下げしたコメント行は、ほかの本文行と一緒に動かし、
書かれた行とテキストを保ちます。 [fixture: data-blocks/indented-comment-line]

入力
([data-blocks/deep-nested-yaml-input.mmd](../tests/fixtures/flowchart/data-blocks/deep-nested-yaml-input.mmd)):

```mmd
flowchart LR
subgraph Group
A@{
        label: Alpha
        custom:
          nested: yes
 }
end
```

出力
([data-blocks/deep-nested-yaml-output.mmd](../tests/fixtures/flowchart/data-blocks/deep-nested-yaml-output.mmd)):

```mmd
flowchart LR
  subgraph Group
    A@{
      label: Alpha
      custom:
        nested: yes
    }
  end
```

### 複数行の値

引用符で囲んだ複数行の文字列は、各行の開始位置を変えません。
[fixture: multi-line-values/markdown-string-kept]
トップレベルの `accDescr { ... }` の本文行は、文より 1 段深くそろえます。
Mermaid がアクセシビリティの説明から LF 後の字下げを除くためです。
subgraph の中では、本文があるブロックの原文が字下げごとメンバーに入るため、
元の列を保ちます。
[fixture: multi-line-values/accdescr-block-subgraph-raw-membership-kept]
ブロックの `}` は、それが閉じる `accDescr` と同じ段に置きます。
[fixture: multi-line-values/accdescr-block-kept]
そうしたブロックのコメントの内容も保ち、
列は同じトップレベルまたは subgraph の規則に従います。
[fixture: multi-line-values/accdescr-block-comment-line-in-subgraph-kept]
複数行のブロックのテキストが `{` と同じ行から始まるときは、
波括弧の内側に空白を 1 つずつ置きます。
[fixture: multi-line-values/accdescr-block-text-starts-on-brace-line]
1 行のブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従い、
trivia のない空ブロックは、
[アクセシビリティの行](#アクセシビリティの行)に従います。
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
  accDescr: one line
  accDescr {
    text
    %% note
  }
  accDescr {}
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
コメントと同じ理由です。 [fixture: directives/own-line-in-subgraph]
[fixture: directives/several-on-own-line]
[fixture: directives/multi-line-on-own-line]
[fixture: directives/own-line-between-comment-and-empty-line]
同じ印字行の中では、ディレクティブの位置を保ちます。
[fixture: directives/after-header-on-same-line]
[fixture: directives/after-end-on-same-line]
[fixture: directives/after-last-statement-without-line-break]

mermaid.js はテキストを読む前にディレクティブを取り除くので、残る空白は、
ディレクティブの両側の空白を合わせたものです。
`note for` のような単位や `title` の後のテキストは、
空白をちょうど 1 文字読みます。
ディレクティブの両側に空白 1 つずつを置くと、空白が 2 つ残ります。
そのため、隙間をディレクティブがないものとして、隙間の通常の規則どおりに印字し、
ディレクティブをその規則の空白の後ろに置いて、後ろの単位に接します。
`A  %%{init: {}}%%  --> B`、`A %%{init: {}}%%--> B`、`A%%{init: {}}%%-->B` は、
どれも `A %%{init: {}}%%--> B` と印字します。
[fixture: directives/whitespace-on-both-sides]
[fixture: directives/whitespace-on-each-side]
[fixture: directives/touching-token]
[fixture: directives/header-keyword-touching]
[fixture: directives/meets-empty-description-block]
[fixture: class/directives/count-sensitive-unit]
規則が空白を置かない隙間では、ディレクティブは両側の単位に接します。
`click C call m( %%{x}%%  )` は `click C call m(%%{x}%%)` と印字します。
[fixture: whitespace-between-tokens/callback-blank-parentheses-touch]
1 つの隙間のディレクティブどうしは接します。
[fixture: directives/several-in-gap]

mermaid.js の行の規則が空白を読む可能性のある隙間では、
ディレクティブの両側に書かれた空白の有無を保ち、
空白の連なりは空白 1 つにします。
[セミコロン](#セミコロン)を参照してください。
[fixture: directives/in-line-rule-stretch]
印字する行の初めや終わりのディレクティブは、
隣の単位との隙間に空白があるかないかを保ち、空白の連続は空白 1 つにします。
反対側には単位がなく、隙間に固有の規則は要らないからです。
[fixture: directives/line-edge-whitespace]
U+2028 か U+2029 を含む隙間は、書かれたまま残します。
その文字を置き換えると、行の規則が読む 2 つの区間をつないでしまうからです。
[test: U+2028 before a directive in the gap of a flowchart]
[test: U+2029 after a directive in the gap of a flowchart]
[test: U+2028 beside a directive between a `:` and a `#` of a flowchart]
ディレクティブの隙間に行の規則が無視する `;` があれば、
`;` とディレクティブは書かれた順のままにし、
通常の規則の空白を最初のディレクティブの前に置きます。
[セミコロン](#セミコロン)を参照してください。
`A[style:#x] --> B ;%%{init: {}}%% --> C` は、
`A[style:#x] --> B; %%{init: {}}%%--> C` と印字します。
`A[style:#x] --> B %%{init: {}}%% ; --> C` は、
`A[style:#x] --> B %%{init: {}}%%;--> C` と印字します。
[fixture: directives/ignored-semicolon-and-directive-in-gap]
ディレクティブの中身は書かれたまま残します。
[fixture: directives/compat-malformed-directive-kept]
[fixture: directives/content-kept]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: flowchart/directives/same-line-as-statements]

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
([directives/touching-token-input.mmd](../tests/fixtures/flowchart/directives/touching-token-input.mmd)):

```mmd
flowchart LR
  A%%{init: {}}%%-->B
```

出力
([directives/touching-token-output.mmd](../tests/fixtures/flowchart/directives/touching-token-output.mmd)):

```mmd
flowchart LR
  A %%{init: {}}%%--> B
```

入力
([directives/whitespace-on-each-side-input.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-input.mmd)):

```mmd
flowchart %%{init: {}}%%LR
A
style A %%{init: {}}%%fill:red
click A %%{init: {}}%%href "u"
B%%{init: {}}%% --> C
```

出力
([directives/whitespace-on-each-side-output.mmd](../tests/fixtures/flowchart/directives/whitespace-on-each-side-output.mmd)):

```mmd
flowchart %%{init: {}}%%LR
  A
  style A %%{init: {}}%%fill:red
  click A %%{init: {}}%%href "u"
  B %%{init: {}}%%--> C
```

閉じていないディレクティブは、mermaid.js が読むとおり、
テキストの終わりまで続きます。
[fixture: directives/compat-unclosed-directive-joins-next-line]
[fixture: directives/unclosed-after-statement-on-same-line]
その範囲は、
空白でない最後の文字で終わります（仕様の
[コメント、ディレクティブ、フロントマター](../../spec/docs/ast.ja.md#ディレクティブとフロントマター)）。
そのため、その後の空白はテキストの末尾の空白で、そのとおりに整形します。
テキストは、ディレクティブの後の改行 1 つで終わります。
テキストがディレクティブの直後で終わるときは、改行を足しません。
足した改行を、mermaid.js がディレクティブの一部として読むからです。
空白がテキストの末尾にあるので、例は、`\n` を改行とする文字列で書きます。
`"flowchart LR\nA\n%%{init: {}  \n\n"` は `"flowchart LR\n  A\n  %%{init: {}\n"`
と印字し、
`"flowchart LR\nA\n%%{init: {}"` は `"flowchart LR\n  A\n  %%{init: {}"`
と印字します（fixture `unclosed-trailing-whitespace` と、
`unclosed-at-end-of-text-kept` は
[フォルダー](../tests/fixtures/flowchart/directives)にあります）。

### 方向

ヘッダーでも `direction` の文でも、方向は書かれたまま残します。
`TD` を `TB` に変えず、`TB` も `TD` に変えません。
mermaid.js 12.3.0 は 2 つを同じに描きますが、mermaid.js 11.9.0 は、
ヘッダーに `TB` がある flowchart を、
同じテキストで `TD` があるものとは違って描きます。
ヘッダーのキーワードも書かれたまま残します。
（[mermaid.js の版](./compatibility.ja.md#mermaidjs-の版)と
[ヘッダーの名前](./compatibility.ja.md#ヘッダーの名前)を参照）。
[fixture: direction/header-td-kept] [fixture: direction/header-tb-kept]
[fixture: direction/header-keyword-kept]
[fixture: direction/statement-td-kept-with-other-header]
[fixture: direction/statement-values-kept]
mermaid.js は subgraph の中の `direction` の文の `TD` を、
書かれたとおりに保つので、そこで変えると図が変わり、
ヘッダーだけを変えると両者が食い違います。
swimlane 図のヘッダーでは、agentflow 図のヘッダーと同じく、
`TD` を `TB` と印字します（[Header](./agentflow.ja.md#header)を参照）。
どちらの図種も、
`TD` が `TB` と同じように振る舞うようになった版より後のものです。
ヘッダーに続く directive の後にある `TD` は、
`swimlane-beta%%{init: {}}%% TD` のように書かれたまま残します。
[fixture: direction/swimlane-header-td-one-form]
[fixture: direction/swimlane-header-td-after-directive-kept]
`direction` の文では、mermaid.js は `direction` の前と値の後を、
ラベルや文字列を含みうるテキストとして読み、値の後の `;` はそのテキストに属し、
区切りではありません。
そのテキストは書かれたまま残し、それと `direction` の間、
`direction` と値の間の空白は、ほかのトークンの間と同じく空白 1 つにします。
`A[direction TB]` のような行も `direction` の文で、頂点も接続も読まれず、
そのように、その段の字下げで印字します。
[fixture: direction/statement-holds-text-kept]
ヘッダーの方向は、記号がキーワードに接していても空白 1 つの後に置きます。
`graph>` は `graph >` に、`flowchart^` は `flowchart ^` と印字します。
この空白は Db に入らず、`TD` のような文字の方向には、もともと空白が必要です。
その間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおりに置きます。
U+2028 と U+2029 はそのまま残します。
[fixture: direction/header-symbol-touching-spaced]
[fixture: direction/header-symbol-beside-directive-kept]
[test: U+2029 between the graph keyword and its direction]

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

タイトルの括弧の内側の空白は、ノードのラベルと同じように、
落とします（[ラベルの内側の空白](#ラベルの内側の空白)を参照）。
`subgraph S[ T ]` は `subgraph S[T]` に、
`subgraph S["x" ]` は `subgraph S["x"]` になります。
mermaid.js は、どちらの書き方も同じ subgraph として読みます。
タイトルが別に読まれる所には、ラベルと同じ規則で空白を 1 つ残します。
`[ /x/ ]` や `[ \x\ ]` はそのままです。
`[/x/]` は拒否されるからです。 [fixture: subgraph-header/title-padding-dropped]
[fixture: subgraph-header/title-interior-whitespace-dropped]
括弧の中の改行とコメント行は、ヘッダーの行として残ります。
改行の前の空白は、どの行末でもそうであるように落ち、
その後の括弧は継続行になります。
[fixture: subgraph-header/title-padding-beside-line-break]
括弧の中の行にある U+2028 と U+2029 は残り、
継続行の先頭にあるものは字下げとして読まれます。
[test: U+2028 in the title of a flowchart subgraph header]
[test: U+2029 in the title of a flowchart subgraph header]
行の規則が読むかもしれない行では、
`style:` の後のタイトルの `[` の後の空白が残ります。
`subgraph style:[ #x; ]` は `subgraph style:[ #x;]` になり、
`subgraph a: [ #x; ]` は、
`:` の前に `style` がないので `subgraph a:[#x;]` になります。
[fixture: subgraph-header/title-padding-on-line-rule-line]

タイトルの `[` は subgraph の名前に接します。
`subgraph S [t]` は `subgraph S[t]` になります。
名前が 1 語でも、複数の語でも、文字列でも、markdown 文字列でも同じです。
[fixture: subgraph-header/title-whitespace-before-dropped]
[fixture: subgraph-header/title-touches-name]
[fixture: subgraph-header/title-touches-name-kinds]
mermaid.js はどちらの形も同じに読むので、形を強いるものはありません。
ノードのラベルの `[` は id に接し（`A[t]`）、
agentflow の見出しもタイトルに接します（`flow F[T]`）。
agentflow の文書にあるタイトル付きの見出し 19 件は、すべてこの書き方です。
その範囲は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/agentflow.md#L26-L363)
にあります。
flowchart の文書にあるタイトル付きの subgraph は 2 件で、
どちらも空白があります。
1 件目は、
[`subgraph ide1 [one]`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/flowchart.md#L1030)
です。
2 件目は、
[`subgraph one [My Group]`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/flowchart.md#L1109)
です。
これは形を決める根拠にはなりません。
隙間が、`:` と `#` の間にあり、`:` の前に `style` か `classDef` があり、
`#` の後ろに `;` がある行にあるとき（`subgraph style: [#x;]`）、
その隙間は空白があるかないかを保ちます（[セミコロン](#セミコロン)と同じです）。
`subgraph a: [#x;]` と `subgraph style: [#x]` にはその `;` がないので、
接します。 [fixture: subgraph-header/title-after-colon-before-hash]
隙間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: subgraph-header/title-beside-directive]
[fixture: subgraph-header/title-beside-directive-runs]
隙間の U+2028 と U+2029 は、そのまま残します。
[test: U+2028 between a subgraph name and its title]
[test: U+2029 and spaces between a subgraph name and its title]
タイトルの後ろの空の説明ブロックは、これまでどおり本体の最初の文になります。
[fixture: subgraph-header/title-before-empty-description-block]
タイトルなしで書かれた 1 語の名前は、その後の空白を保ちます。
mermaid.js はその空白を名前の一部として読みます。
`subgraph S` の id は `S` で、`subgraph S ` の id は生成されます。
mermaid.js は、名前のテキストに空白がないときだけ名前を id にするためです。
`subgraph S1 S2` や `subgraph "o p"` のように複数の語からなる名前は、
後ろに空白があってもなくても id が生成されるため、行末の空白を除きます。
ただし、名前をブロック、保持する `;`、
または同じ行のディレクティブから区切る空白は残します。
その空白は、あるかどうかを保ち、連続は空白 1 つにします。
[トークンの間のディレクティブ](./compatibility.ja.md#トークンの間のディレクティブ)
を参照してください。
ディレクティブの後の空白によって、
mermaid.js がディレクティブを名前の一部として読む場合も同じです。
markdown 文字列や swimlane 図でも同じで、
名前の中の連続は mermaid.js が描くため残しますが、
名前の末尾の空白は幅にかかわらず同じに描かれます。
``subgraph "`o p`"   %%{init: {}}%%`` は、
``subgraph "`o p`" %%{init: {}}%%`` と印字します。
`end` で終わる名前が取り込む次の行の字下げは、この空白には当たりません（後述）。
[fixture: subgraph-header/name-several-words-directive-run-collapsed]
[fixture: subgraph-header/name-markdown-directive-run-collapsed]
[fixture: subgraph-header/name-swimlane-directive-run-collapsed]
[fixture: subgraph-header/name-swimlane-quoted-directive-run-collapsed]
[fixture: subgraph-header/name-swimlane-before-block-run-collapsed]
[fixture: subgraph-header/name-several-words-directive-trailing-dropped]
[fixture: subgraph-header/name-several-words-two-directives-run-collapsed]
[fixture: subgraph-header/name-trailing-run-collapsed]
[fixture: subgraph-header/name-trailing-whitespace-kept]
[fixture: subgraph-header/name-quoted-trailing-whitespace-kept]
[fixture: subgraph-header/name-several-words-trailing-dropped]
[fixture: subgraph-header/name-several-words-before-block-kept]
[fixture: subgraph-header/name-whitespace-before-directive-kept]
[fixture: subgraph-header/name-whitespace-after-directive-kept]
ヘッダーと同じ行に書かれた空の説明ブロックの周りの空白も同じです。
ブロックの前、ブロックの間、最後のブロックと `;` の間の空白がそうで、
`subgraph "S"accDescr {} accDescr {}` と、
`subgraph "U"accDescr {} ;` がその例です。
[fixture: subgraph-header/whitespace-before-first-block-kept]
ブロックは何のトークンも読まれず、その空白が名前の後に続くとみなされ、
subgraph の id は `subGraph0` になり、空白がなければ `S` になります。
空白があることは残しますが、幅は、最初のブロックの前だけ、
名前に続くものとして書かれたまま残し、ブロックの間や `;` の前の空白の連続は、
空白 1 つにします。 [fixture: subgraph-header/runs-between-blocks-become-one]
最後のブロックの後の空白に改行が続くときは、改行として読まれ、数えません。
[fixture: subgraph-header/whitespace-after-last-block-dropped]
ブロックは、`;` とその後のディレクティブとともに、
ヘッダーの行に書かれたまま残します。
ブロックが独立した行にあると、空白は別に読まれ、
ブロックとディレクティブの後の `;` は頂点として読まれます。

末尾が `end` の単位である名前（`subgraph Front end` など）は、
その後の改行と次の行の空白まで名前として読まれます（詳しくは、
[subgraph](../../spec/docs/diagrams/flowchart.ja.md#subgraph)を参照）。
そのため、その次の行にあるブロックも名前に続くものとして扱います。
ブロックの行は、ブロックの前の空白とともに書かれたまま残し、
その後の行は通常どおりインデントします。
`Frontend` のように、その文字が単位をなさない名前は、これに当たらず、
ブロックの行も通常どおりインデントします。
[fixture: subgraph-header/block-on-line-after-name-ending-in-end-letters]
[fixture: subgraph-header/block-on-line-after-end-name-kept]
[corpus fixture: flowchart/db-subgraph-name-end-line-feed-then-empty-description-block]

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
([subgraph-header/title-touches-name-input.mmd](../tests/fixtures/flowchart/subgraph-header/title-touches-name-input.mmd)):

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
([subgraph-header/title-touches-name-output.mmd](../tests/fixtures/flowchart/subgraph-header/title-touches-name-output.mmd)):

```mmd
flowchart LR
  subgraph S[Title]
    A
  end
  subgraph T[Title]
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

### Quotes

引用符付きの subgraph の名前は、mermaid.js の文書の例が引用符なしで 53 回、
引用符付きで 1 回書いているとおり、引用符なしで印字します。
（[テキストの引用符](./compatibility.ja.md#テキストの引用符)）。
`subgraph "Group A"` は `subgraph Group A` と印字します。
mermaid.js はどちらの形の名前も同じテキストとして読み、
複数の語からなる名前の id はどちらでも生成されます。
名前が ASCII の英字、数字、`_` からなる語を空白 1 つで区切ったもので、
語の部分同士を 1 つの `-` でつないでもよく（`my-group`）、どの語も `_blank`、
`_parent`、`_self`、`_top`、`call`、`click`、`default`、`direction`、`end`、
`href`、`interpolate` でない場合に、引用符なしで印字します。
これらの語は、字句解析器がそれぞれ独立した単位として読むためです。
`-` はキーワードを終わらせるので、最初の `-` より前の部分で比較します。
`end-x` は `end` と `-x` です。
そのため、`"end"`、`"x end"`、`"click"`、`"end-x"`、`"x _self"`、`"direction"`、
先頭か末尾に `-` があるか、2 つ続く名前（`"-a"`、`"a-"`、`"a--b"`）、
`.` や ASCII 以外の文字を含む名前と、markdown 文字列は書かれたままにします。
`direction` で終わる名前（`"xdirection"`、`"my xdirection"`）は、
後に何が続いても引用符を残します。
字句解析器は、`direction`、空白（改行も含みます）、`TB`、`BT`、`RL`、`LR`、
`TD` を 1 行として読みます。
`subgraph xdirection` と次の行の `TB --> C` が、この 1 行になるためです。
同じ行で語が接する名前（`subgraph "S"accDescr {}`）と、
コメントが続く名前（`subgraph "C" %% note`）は、
引用符なしのテキストが語やコメントを取り込んでしまうため、引用符を保ちます。
タイトルのある subgraph では、空白 2 つの連なりを持つ名前も引用符を保ちます。
そこでは名前が id であり、空白の連なりが異なる 2 つの id は別の id だからです。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
名前の後の `;` やディレクティブは何も取り込まないので、名前は引用符を失います。
`subgraph "D"%%{init: {}}%%` は `subgraph D%%{init: {}}%%` と印字します。
[fixture: quotes/subgraph-names-without-quotes]
[fixture: quotes/subgraph-names-with-hyphens]
[fixture: quotes/swimlane-lane-names-without-quotes]
[fixture: quotes/subgraph-names-that-need-quotes]
[fixture: quotes/subgraph-names-next-to-a-direction-line]
[fixture: quotes/subgraph-names-with-runs-without-quotes]
[fixture: quotes/subgraph-names-before-a-comment]
[fixture: subgraph-header/whitespace-before-block-kept]

shape のラベル、link のラベル、角括弧の中の subgraph のタイトルも、
例と同じく引用符なしで印字します。
例では、shape のラベルを引用符なしで 109 回、引用符付きで 8 回、
link のラベルを引用符なしで 32 回、引用符付きで 1 回、
タイトルを引用符なしで 6 回、引用符付きでは一度も書いていないためです。
（[テキストの引用符](./compatibility.md#the-quotes-of-a-text)）。
`A["Start here"]` は `A[Start here]` と、
`A -->|"Is it ready?"| B` は `A -->|Is it ready?| B` と、
`subgraph S ["Title"]` は `subgraph S[Title]` と印字します。
テキストを引用符なしで印字するのは、英字か数字で始まり、末尾に空白がなく、
ASCII の英字、数字、空白、`_`、`-`、`.`、`,`、`:`、`!`、`?` からなる場合です。
mermaid.js は `A["x"]` を文字列として、`A[x]` をテキストとして読み、
Db の `labelType` に前者では `string`、後者では `text` を持ちます。
ただし、描かれる図は同じです。
（[同じに描かれるラベル](./compatibility.ja.md#同じに描かれるラベル)）。
点線の矢印 2 つの間のラベル（`-. "a.b" .->`）では、
`.` がラベルを終わらせるので、`.` を含むテキストの引用符を残します。
それ以外のテキスト（`"x (y)"`、`"a/b"`、`"a & b"`、`"_x"`、`"x "`、`" x"`）と、
markdown 文字列は引用符を残します。
mermaid.js の行の規則が丸ごと読む行など、
プリンタが書かれたまま印字する行のラベルも同じです。
（[Lines that hold a `;`](./compatibility.md#lines-that-hold-a-)）。
引用符なしで書かれたラベルは、引用符なしのままにします。
[fixture: quotes/shape-labels-without-quotes]
[fixture: quotes/link-labels-without-quotes]
[fixture: quotes/subgraph-titles-without-quotes]
[fixture: quotes/labels-that-need-quotes]
[fixture: quotes/labels-next-to-trivia]
[fixture: quotes/swimlane-labels-without-quotes]

入力
([quotes/subgraph-names-without-quotes-input.mmd](../tests/fixtures/flowchart/quotes/subgraph-names-without-quotes-input.mmd)):

```mmd
flowchart TD
subgraph "One"
A --> B
end
subgraph "Group A"
C --> D
end
subgraph "g_2" [Title]
E --> F
end
subgraph "G3"[Title]
G --> H
end
subgraph 'Single'
I --> J
end
subgraph Already
K --> L
end
```

出力
([quotes/subgraph-names-without-quotes-output.mmd](../tests/fixtures/flowchart/quotes/subgraph-names-without-quotes-output.mmd)):

```mmd
flowchart TD
  subgraph One
    A --> B
  end
  subgraph Group A
    C --> D
  end
  subgraph g_2[Title]
    E --> F
  end
  subgraph G3[Title]
    G --> H
  end
  subgraph 'Single'
    I --> J
  end
  subgraph Already
    K --> L
  end
```

### スタイルの行末の空白

`style`、`classDef`、`linkStyle` の文の末尾の空白は取り除きます。
[fixture: style-trailing-whitespace/removed]
[fixture: style-trailing-whitespace/removed-tab]
[fixture: style-trailing-whitespace/removed-after-directive]
mermaid.js はその空白を最後のスタイルの末尾に残すので、
この規則は mermaid.js が保存するものを変える規則の 1
つです（ [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください）。
テストは、末尾の空白を除いたスタイルを比べます。
`linkStyle` の `stroke:` の後の空白も保ちます。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
`linkStyle default stroke: ` の後に `linkStyle 0 stroke:#f00` がある場合も、
その空白を保ちます。
[fixture: style-trailing-whitespace/link-style-blank-stroke-value-at-end-kept]
バックスラッシュで終わる `linkStyle` は、その後の空白も 1 文字として保ちます。
`linkStyle default stroke-width:4px\ ` の後に、
`linkStyle 0 stroke:#0f0` がある場合も、その空白を保ちます。
[fixture: style-trailing-whitespace/link-style-backslash-at-end-kept]
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
`"flowchart LR\n  A --> B\n  style A fill: #f00\n"` と印字し、
`"flowchart LR\n  A\n  style A fill:#f00, \n"` はそのまま印字します（fixture
`removed` と `whitespace-only-value-kept` は
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
- ディレクティブの中身と、
  [データブロック](#データブロック)の一定量の字下げと 1 行のブロックの両端を除く
  `@{ ... }` の中身。
  パーサーは読みません。
  [fixture: whitespace-between-tokens/compat-unknown-shape-data-block-kept]
  [fixture: whitespace-between-tokens/data-block-kept]
  [fixture: directives/content-kept]
- 複数行に書かれた文字列と Markdown 文字列の行。
  行頭の空白が値の一部です。 [fixture: multi-line-values/markdown-string-kept]
  [fixture: multi-line-values/string-kept]

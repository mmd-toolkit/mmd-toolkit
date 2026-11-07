# ブロック図の整形規則

英語版: [block.md](./block.md)

prettier-plugin-mmd がブロック図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各規則でその条件を説明します。
ブロック図は、ヘッダーと、区切りのいらない文でできています。
改行は空白と同じなので、1 行に何個でも文を書け、文は複数行にわたれます。
空白の多くは Db に入らないので、多くの規則は形を選ぶものです。
ブロック矢印、`style`、`class` の空白は Db に入るので、
その箇所は各規則で説明します。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
composite の中の文は `block:` の行より 1 段深く置き、
`end` は `block:` と同じ段に置きます。
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、既定は空白 2 つです。
入力に書かれた字下げは残しません。
行頭の空白は mermaid.js にとって何の意味も持たないので、字下げは構造だけで決め、
どのテキストも 1 つの形になります。
入れ子は composite の始まりと終わりを見せます。
`block:` と `end` だけでは、深く入れ子になると読みにくいからで、
mermaid.js の文書もそう書き、
ほかの図もブロックを入れ子にします（flowchart
の[字下げ](./flowchart.ja.md#字下げ)を参照）。
ヘッダーと、その前のコメント行は 1 列目に置きます。
[fixture: indentation/statements-one-level-deeper]
[fixture: indentation/composite-body-one-level-deeper-end-at-the-level-of-block]
[fixture: indentation/nested-composites]
[fixture: indentation/written-indentation-dropped]
[fixture: indentation/header-leading-whitespace]
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]
[fixture: indentation/comment-before-the-header-at-the-first-column]
[fixture: indentation/header-block]

入力
([indentation/composite-body-one-level-deeper-end-at-the-level-of-block-input.mmd](../tests/fixtures/block/indentation/composite-body-one-level-deeper-end-at-the-level-of-block-input.mmd)):

```mmd
block-beta
columns 3
a
block:group1:2
columns 2
h
i
end
d
```

出力
([indentation/composite-body-one-level-deeper-end-at-the-level-of-block-output.mmd](../tests/fixtures/block/indentation/composite-body-one-level-deeper-end-at-the-level-of-block-output.mmd)):

```mmd
block-beta
  columns 3
  a
  block:group1:2
    columns 2
    h
    i
  end
  d
```

### composite

composite は 3 種類の行でできています。
`block:` とその node の行、中の文の行、`end` の行です。
`block:G`、`block`、`block-beta` は書かれたままに印字し、
`block:` はその node に接します。
mermaid.js は `block: G` と `block:G` を同じに読むので、
形は 1 つのほうが読みやすいからです（mermaid.js の文書の `block:group1:2`
の形です）。
見出しの後の最初の文と、`end` の後の文は、自分の行に移します。
1 行に書かれた composite（`block:G a b end`）も同じで、
どの composite も同じ形に置き、字下げが中身を示します。
`end` は自分の行に置き、`block:` と同じ段にします。
[fixture: composites/colon-touches-the-node]
[fixture: composites/colon-and-node-on-different-lines]
[fixture: composites/width-kept]
[fixture: composites/width-colon-touches-the-node]
[fixture: composites/shape-touches-the-node]
[fixture: composites/block-without-a-node-kept]
[fixture: composites/block-beta-without-a-node-kept]
[fixture: composites/composite-on-one-line-split]
[fixture: composites/statement-after-end-on-a-line-of-its-own]
[fixture: composites/first-statement-after-the-head-on-a-line-of-its-own]
[fixture: composites/composite-between-rows]
[fixture: composites/end-on-a-line-of-its-own]
[fixture: composites/head-over-lines-joined]

入力
([composites/colon-touches-the-node-input.mmd](../tests/fixtures/block/composites/colon-touches-the-node-input.mmd)):

```mmd
block-beta
block: G
a
end
```

出力
([composites/colon-touches-the-node-output.mmd](../tests/fixtures/block/composites/colon-touches-the-node-output.mmd)):

```mmd
block-beta
  block:G
    a
  end
```

入力
([composites/composite-on-one-line-split-input.mmd](../tests/fixtures/block/composites/composite-on-one-line-split-input.mmd)):

```mmd
block-beta
block:G a b end
```

出力
([composites/composite-on-one-line-split-output.mmd](../tests/fixtures/block/composites/composite-on-one-line-split-output.mmd)):

```mmd
block-beta
  block:G
    a b
  end
```

### 行

ほかの図は、どの文も自分の行に置きます。
ブロック図は、そうしません。
行は、書き手がブロックを並べる単位だからです。
1 行に並んだ node と `space` の連なりは、`columns` が決める格子の 1 行で、
mermaid.js の文書もそう書いています（`a b c`、`a["A label"] b:2 c:2 d`、
`Start(("Start")) space:2`）。
node を 1 行ずつに分けると、その行が見えなくなり、
列の数を `columns` の文から数えなおすことになります。
[fixture: rows/documentation-row-with-widths] [fixture: rows/space-in-a-row]

そのため、1 行にある node の文（幅、形、辺も含む）と `space` の連なりは、
その行に残し、文の間は空白 1 つにします。
連なりの中の 2 つの文の間の改行は、書かれた場所に残し、空行は 1 つにします。
それ以外の文は自分の行に置きます。
`columns`、composite の見出し、`end`、`classDef`、`class`、`style`、
空の説明ブロックです。
`columns 3` と同じ行にある文は次の行へ移します（`columns 3 a b c` は、
`columns 3` と、行 `a b c` になります）。
連なりの中の 2 つの文の間に、印字は改行を足さず、取りもしないので、
もう一度整形しても、同じ行が見つかります。 [fixture: rows/rows-kept]
[fixture: rows/line-break-between-statements-kept]
[fixture: rows/edges-in-a-row] [fixture: rows/touching-statements-apart]
[fixture: rows/space-then-node-touching-apart]
[fixture: rows/continuation-line-then-statement-stays-in-the-row]
[fixture: rows/columns-then-row-split]
[fixture: rows/class-definition-on-a-line-of-its-own]
[fixture: rows/style-on-a-line-of-its-own]
[fixture: rows/class-on-a-line-of-its-own]
[fixture: rows/empty-description-block-on-a-line-of-its-own]
[fixture: rows/composite-on-lines-of-its-own] [fixture: rows/row-in-a-composite]

`%%` で始まる文は、行頭に動かしません。
mermaid.js は node の後の `%%x` を id として読みますが、
`%%x` で始まる行はコメント行で、
取り除かれるからです（[コメント](#コメント)を参照）。
そのような文がある行は、1 行のまま残し、中の文は他の文と同じに整えて、
どの文も自分の行に移しません。
`columns 3 a %%x b` も `block-beta %%x` も 1 行のままです。
[fixture: rows/percent-id-stays-in-its-row]
[fixture: rows/percent-id-keeps-columns-with-it]
[fixture: rows/percent-id-after-columns-not-moved]
[fixture: rows/percent-id-keeps-statements-before-it]
[fixture: rows/percent-id-after-end-not-moved]
[fixture: rows/percent-id-statements-formatted]
[fixture: rows/percent-only-id-not-moved]
[fixture: rows/percent-id-in-a-composite]
[fixture: rows/percent-id-after-the-header-stays-on-the-line]

入力
([rows/rows-kept-input.mmd](../tests/fixtures/block/rows/rows-kept-input.mmd)):

```mmd
block-beta
columns 3
a b c
d   e   f
```

出力
([rows/rows-kept-output.mmd](../tests/fixtures/block/rows/rows-kept-output.mmd)):

```mmd
block-beta
  columns 3
  a b c
  d e f
```

入力
([rows/columns-then-row-split-input.mmd](../tests/fixtures/block/rows/columns-then-row-split-input.mmd)):

```mmd
block-beta
columns 3 a b c
```

出力
([rows/columns-then-row-split-output.mmd](../tests/fixtures/block/rows/columns-then-row-split-output.mmd)):

```mmd
block-beta
  columns 3
  a b c
```

入力
([rows/percent-id-keeps-columns-with-it-input.mmd](../tests/fixtures/block/rows/percent-id-keeps-columns-with-it-input.mmd)):

```mmd
block-beta
columns 3 a %%x b
```

出力
([rows/percent-id-keeps-columns-with-it-output.mmd](../tests/fixtures/block/rows/percent-id-keeps-columns-with-it-output.mmd)):

```mmd
block-beta
  columns 3 a %%x b
```

### 空行

連続する空行は 1 つの空行にします。
ヘッダーと最初の文の間にも、テキストの最後にも、空行は置きません。
空行は、Db に入らない書き手の選択で、
1 つの空行がそれを最小の手間で示します（[空行](./flowchart.ja.md#空行)を参照）。
Prettier がコードでそうするのと同じです。 [fixture: blank-lines/runs-become-one]
[fixture: blank-lines/none-after-the-header]
[fixture: blank-lines/none-at-the-end] [fixture: blank-lines/between-rows]
[fixture: blank-lines/none-at-the-start-and-end-of-a-composite]
[fixture: blank-lines/after-a-composite]
[fixture: blank-lines/whitespace-only-lines]

入力
([blank-lines/runs-become-one-input.mmd](../tests/fixtures/block/blank-lines/runs-become-one-input.mmd)):

```mmd
block-beta
a



b
```

出力
([blank-lines/runs-become-one-output.mmd](../tests/fixtures/block/blank-lines/runs-become-one-output.mmd)):

```mmd
block-beta
  a

  b
```

### ヘッダー

ヘッダー `block-beta` と `block` は書かれたままに印字します。
mermaid.js はどちらも同じ図種として読むので、綴りは書き手のものです。
前の空白は落とし、同じ行の後ろの文は自分の行に移します（[行](#行)を参照）。
[fixture: header/block-beta-kept] [fixture: header/block-kept]
[fixture: header/statement-after-the-header-on-a-line-of-its-own]
[fixture: header/columns-after-the-header-on-a-line-of-its-own]
[fixture: header/leading-whitespace-dropped]

入力
([header/statement-after-the-header-on-a-line-of-its-own-input.mmd](../tests/fixtures/block/header/statement-after-the-header-on-a-line-of-its-own-input.mmd)):

```mmd
block-beta a b
c
```

出力
([header/statement-after-the-header-on-a-line-of-its-own-output.mmd](../tests/fixtures/block/header/statement-after-the-header-on-a-line-of-its-own-output.mmd)):

```mmd
block-beta
  a b
  c
```

### columns と space

`columns` の後には、その数か `auto` を、空白 1 つで続けます。
間に書かれた空白（タブ、改行）はどれも同じです。
mermaid.js はそこのどの空白も同じに読むので、形は 1 行になります。
`space:2` は `:` を接して印字します。
mermaid.js は `space :2` と `space: 2` を拒否するからです。
`space` と `columns` は、ほかの場所へ動かしません。
ブロックの最後の `columns` が、どこにあってもそのブロックの列数で、
ブロックの順はテキストの順だからです。
[fixture: columns-and-space/one-space-after-columns]
[fixture: columns-and-space/tab-after-columns]
[fixture: columns-and-space/line-break-after-columns]
[fixture: columns-and-space/auto]
[fixture: columns-and-space/space-width-touching]
[fixture: columns-and-space/last-columns-kept-where-written]
[fixture: columns-and-space/space-kept-where-written]
[fixture: columns-and-space/columns-in-a-composite]
[fixture: columns-and-space/comment-line-inside-kept]

入力
([columns-and-space/line-break-after-columns-input.mmd](../tests/fixtures/block/columns-and-space/line-break-after-columns-input.mmd)):

```mmd
block-beta
columns
3
```

出力
([columns-and-space/line-break-after-columns-output.mmd](../tests/fixtures/block/columns-and-space/line-break-after-columns-output.mmd)):

```mmd
block-beta
  columns 3
```

入力
([columns-and-space/last-columns-kept-where-written-input.mmd](../tests/fixtures/block/columns-and-space/last-columns-kept-where-written-input.mmd)):

```mmd
block-beta
columns 2
a b c
columns 3
d
```

出力
([columns-and-space/last-columns-kept-where-written-output.mmd](../tests/fixtures/block/columns-and-space/last-columns-kept-where-written-output.mmd)):

```mmd
block-beta
  columns 2
  a b c
  columns 3
  d
```

### 形

id とその後の形は接します（`A("x")`、`B[["y"]]`）。
間に空白が書かれていても（`A ("x")`）同じです。
mermaid.js は id と形の始まりの間の空白を同じに読むので、この形は選択です。
接していると、id と形が 1 つの node であることが見え、
`A ("x") B` が 3 つと読まれません。
mermaid.js の文書の形です。
幅の `:` は前に接します（`A:3`、`B["b"]:2`）。
`space:2` の `:` が接していなければならないのと同じです。
[fixture: shapes/shape-touches-the-id]
[fixture: shapes/shape-on-the-next-line-joined]
[fixture: shapes/shape-touching-kept]
[fixture: shapes/other-openings-and-closings]
[fixture: shapes/width-colon-touches-the-id]
[fixture: shapes/width-after-a-shape]
[fixture: shapes/width-colon-on-the-next-line-joined]
[fixture: shapes/shape-and-width-in-a-row] [fixture: shapes/shape-on-a-target]
[fixture: shapes/directive-between-the-id-and-the-shape]
[fixture: shapes/comment-line-between-the-id-and-the-shape-kept]

ブロック矢印 `<["x"]>` は id に接し、
`(` は前の `>` に接します（`C<["z"]>(right)`）。
括弧の中の向きは、書かれたまま印字します。
mermaid.js は向きの後の空白と、
最初の向きの前の空白を保つので（`(right down)` の向きは `right ` で、
`( up)` の向きは ` up`）、そこの空白は Db に入ります。
`,` がないことも Db に入ります（`(rightdown)` の向きは `right` と `down`
です）。
`,` の後の空白はどの向きにも入らないので、空白 1 つにします。
`(right,down)` と `(right,   down)` は `(right, down)` になります。
行の規則が読むかもしれない行の `:` と `#` の間では、
隙間は空白があるかどうかを保つので、空白を足しません。
`a<["style:"]>(x,down)  b["#y;"]` では、
`,` が `style:` の `:` と最後の `;` の前の `#` の間にあるので `(x,down)`
はそのままで、そこの `(x,   down)` は `(x, down)` になります。
`;` があるだけでは同じになりません。
`a<["L"]>(x,down)  b["y;"]`、
`,` が `:` の前にある `a<["style"]>(x,down)  b[":#y;"]`、
後ろに `;` がない `a<["style:"]>(x,down)  b["#y"]` は、空白を足して印字します。
[fixture: shapes/block-arrow-comma-on-kept-line]
そこにあるコメント行やディレクティブは行ごと残り、
U+2028 と U+2029 はそのまま残します。 [fixture: shapes/block-arrow-comma-space]
[fixture: shapes/block-arrow-comma-comment-line]
[test: U+2028 after the comma between the directions of a block arrow]
[test: U+2029 after the comma between the directions of a block arrow]
[test: U+2028 before the comma between the directions of a block arrow]
[test: U+2029 before the comma between the directions of a block arrow]
[fixture: shapes/block-arrow-touches-the-id]
[fixture: shapes/block-arrow-parenthesis-touches-the-closing]
[fixture: shapes/block-arrow-directions-as-written]
[fixture: shapes/block-arrow-directions-whitespace-kept]
[fixture: shapes/block-arrow-with-a-width]

ラベルは文字列で、文法の引用符の間にあり、
中の空白と改行を含めて書かれたまま印字します。
引用符は構文の一部です。
mermaid.js は引用符のないラベルを拒否します。 [fixture: shapes/label-as-written]

入力
([shapes/shape-touches-the-id-input.mmd](../tests/fixtures/block/shapes/shape-touches-the-id-input.mmd)):

```mmd
block-beta
A ("x")
B   [["y"]]
D {"d"}
```

出力
([shapes/shape-touches-the-id-output.mmd](../tests/fixtures/block/shapes/shape-touches-the-id-output.mmd)):

```mmd
block-beta
  A("x")
  B[["y"]]
  D{"d"}
```

入力
([shapes/block-arrow-directions-as-written-input.mmd](../tests/fixtures/block/shapes/block-arrow-directions-as-written-input.mmd)):

```mmd
block-beta
A<["a"]>(right, down)
B<["b"]>(right down)
C<["c"]>( up)
D<["d"]>(right,down)
E<["e"]>(rightdown)
```

出力
([shapes/block-arrow-directions-as-written-output.mmd](../tests/fixtures/block/shapes/block-arrow-directions-as-written-output.mmd)):

```mmd
block-beta
  A<["a"]>(right, down)
  B<["b"]>(right down)
  C<["c"]>( up)
  D<["d"]>(right, down)
  E<["e"]>(rightdown)
```

入力
([shapes/label-as-written-input.mmd](../tests/fixtures/block/shapes/label-as-written-input.mmd)):

```mmd
block-beta
A["  two  spaces  "]
B["a
   b"]
```

出力
([shapes/label-as-written-output.mmd](../tests/fixtures/block/shapes/label-as-written-output.mmd)):

```mmd
block-beta
  A["  two  spaces  "]
  B["a
   b"]
```

### 辺

辺の矢印は、前に空白 1 つ、後ろに空白 1 つを置きます。
ラベルつきの辺のラベルも同じです（`A --> B`、`A -- "x" --> B`）。
接して書かれていても（`A-->B`、`I--xJ`）、空白がもっと多くても同じです。
mermaid.js は、矢印の周りの空白があってもなくても同じ辺として読むので、
この形は選択です。
mermaid.js の文書の辺の書き方で、矢印と後ろの id の間の空白は、
印がどこで終わり id がどこで始まるかを示します（`I --x J`。
`I--xJ` では見えません）。
`x` か `o` で終わる id も、後ろの矢印から離れます（`A x --x B`、`Ao --> B`）。
線の長さ（`---->`）は Db に入りませんが、書き手が書いたものなので残します。
[fixture: edges/spaces-around-an-arrow] [fixture: edges/spaces-around-a-label]
[fixture: edges/end-marker-apart-from-the-id] [fixture: edges/start-marker]
[fixture: edges/id-ending-in-x-or-o] [fixture: edges/length-kept]
[fixture: edges/line-kinds] [fixture: edges/label-with-other-opening-arrow]
[fixture: edges/edge-over-lines-joined] [fixture: edges/width-before-the-arrow]
[fixture: edges/edge-with-shapes]

辺の連鎖 `A --> B --> C` は 1 つの文で、1 行に印字します。
mermaid.js はそれを正しく読まず、Db が最後の前の node を落としますが、
`A --> B` と `B --> C` に分けると別の Db になります。
印字は連鎖を mermaid.js より良く読むことはしません。
それは lint の規則の仕事です。 [fixture: edges/chain-on-one-line]
[fixture: edges/chain-over-lines-joined]

入力
([edges/spaces-around-a-label-input.mmd](../tests/fixtures/block/edges/spaces-around-a-label-input.mmd)):

```mmd
block-beta
A--"x"-->B
C  --  "x"  -->  D
```

出力
([edges/spaces-around-a-label-output.mmd](../tests/fixtures/block/edges/spaces-around-a-label-output.mmd)):

```mmd
block-beta
  A -- "x" --> B
  C -- "x" --> D
```

入力
([edges/chain-on-one-line-input.mmd](../tests/fixtures/block/edges/chain-on-one-line-input.mmd)):

```mmd
block-beta
A-->B-->C
```

出力
([edges/chain-on-one-line-output.mmd](../tests/fixtures/block/edges/chain-on-one-line-output.mmd)):

```mmd
block-beta
  A --> B --> C
```

### スタイル

`classDef`、`style`、`class` の後には、空白 1 つ、クラスの名前か id、
空白 1 つを置きます。
キーワードの後と最初のスタイルの前の空白は Db に入らないので、
空白 1 つにします。
`classDef` と `style` のスタイルは下の空白の規則に従い、
`class` の値は書かれたまま印字します。
終端は[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)に従います。
`style` と `class` の空白は Db に入ります。
`style A fill:#f00 , stroke:#333` のスタイルは、
`fill:#f00 ` と ` stroke:#333` で、`class A, B c1` は ` B` を空白つきで探し、
既存の `B` が見つからず、図に載らない新しいブロックに class を付け、
`class A c   d` のクラス名は `c   d` で、
`class A , B   c1` のクラス名は `, B   c1` です。
`A` の後の空白が id を終わらせるからです。
`classDef` 文と `style` 文では、各スタイルの最初の `:` の前に空白を置かず、
値が空でなければ、後ろに空白を 1 つ置きます。
スタイルを区切る `,` は、ER と requirement と同じく、
[スタイルとクラス](./er.ja.md#スタイルとクラス)のとおり、前に空白を置かず、
後ろに空白を 1 つ置きます。
`classDef c fill:#f00 , color:white` は、
`classDef c fill: #f00, color: white` になります。
`style` 文のスタイルも、同じ形で印字します。
値の中の語と語の間の空白は、書かれたまま残します。
Db は変わりますが、mermaid.js が描く図は同じです。
詳しくは [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。 [fixture: styles/style-colon-spaced]
バックスラッシュの後に空白か `,` がある文、コメントやディレクティブがある文、
空白だけのスタイルがある文、スタイルに改行があるか、行に保つ `;` がある文は、
書かれたままにします。
文の最後の空白は、
flowchart の [スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白)
と同じに落とします。 [fixture: styles/class-definition-spaces]
[fixture: styles/style-spaces] [fixture: styles/class-spaces]
[fixture: styles/style-commas-spaced]
[fixture: styles/class-definition-commas-spaced]
[fixture: styles/class-definition-comma-spaced]
[fixture: styles/class-definition-comma-beside-directive-kept]
[fixture: styles/style-statement-commas-spaced]
[test: U+2029 before the comma of a block classDef statement]
[fixture: styles/class-ids-as-written]
[fixture: styles/class-name-with-a-comma-as-written]
[fixture: styles/class-name-as-written]
[fixture: styles/trailing-whitespace-dropped]
[fixture: styles/styles-with-a-directive]

スタイルのない `style` は `style A` と出力し、id は 1 つの空白の後に置き、
その後ろには何も置きません。 [fixture: styles/style-without-styles]
[corpus fixture: block/db-style-none]
最初のスタイルが空白だけのとき、たとえば `classDef c ,fill:#f00` では、
Db の最初のスタイルは空で、`,` の前の空白はどのスタイルにも属しません。
そのためスタイルは最初の `,` から始まるものとして扱い、
その空白は 1 つの空白にし、`,` とそれ以降は書かれたとおりに出力します。
[fixture: styles/styles-with-a-leading-comma]
[corpus fixture: block/db-class-def-leading-comma]

入力
([styles/class-definition-spaces-input.mmd](../tests/fixtures/block/styles/class-definition-spaces-input.mmd)):

```mmd
block-beta
A
classDef   c1    color:#fff , fill:#000
```

出力
([styles/class-definition-spaces-output.mmd](../tests/fixtures/block/styles/class-definition-spaces-output.mmd)):

```mmd
block-beta
  A
  classDef c1 color: #fff, fill: #000
```

入力
([styles/style-spaces-input.mmd](../tests/fixtures/block/styles/style-spaces-input.mmd)):

```mmd
block-beta
A
style  A   fill:#f00 , stroke:#333
```

出力
([styles/style-spaces-output.mmd](../tests/fixtures/block/styles/style-spaces-output.mmd)):

```mmd
block-beta
  A
  style A fill: #f00, stroke: #333
```

入力
([styles/class-ids-as-written-input.mmd](../tests/fixtures/block/styles/class-ids-as-written-input.mmd)):

```mmd
block-beta
A
B
class A,B c1
class   A, B   c1
```

出力
([styles/class-ids-as-written-output.mmd](../tests/fixtures/block/styles/class-ids-as-written-output.mmd)):

```mmd
block-beta
  A
  B
  class A,B c1
  class A, B c1
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

文に `#` がない `classDef` では、最後のスタイルの末尾の `;` も削除します。
そのスタイルで唯一のセミコロンで、前に空白以外のテキストがある場合に限ります。
mermaid.js が最初の `;` を取り除くためです。
[fixture: semicolons-at-the-end-of-a-style-statement/classdef-text-terminators]
`classDef c fill:red;;` と `style A fill:red;` は、
最後のセミコロンを削除すると Db が変わるので残します。
[fixture: semicolons-at-the-end-of-a-style-statement/style-text-kept]

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
[test: style semicolons: block before U+2028]
[test: style semicolons: block before U+2029]
文と無視される終端の間にある閉じたディレクティブは残し、`;` は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

出力
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/block/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
block
  A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、1 行に印字します。
改行は字句解析器にとって空白で、`columns`、辺、幅、形、
composite の見出しの中の改行もそうです。
改行は空白 1 つに置き換えます。
ほかの図も同じ規則で文の行をつなぎます（[複数行の文](./xychart.ja.md#複数行の文)
を参照）。
node/shape/width と辺の部分、`columns`、class/style の先頭、
composite の見出しなどの構造 gap では、trivia の改行を保ちます。
後続の部分と独立した trivia 行は、node の行や composite の内側でも、
その文より 1 段深くそろえます。
各 gap の最初の行の末尾、指令の内部全体、値の範囲全体を保ちます。
block-arrow の方向は、`,` の後の空白を除いて原文のままです。
[fixture: multi-line-statements/structural-trivia-continuations]

物理行を結ぶコメント領域は、元の配置を保ちます。
[test: block: ls-comment-in-composite-head]
[test: block: ps-comment-in-composite-head]
複数行に書かれた文は、その行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合に、書かれたまま残します。
それ以外の複数行の文は、`;` を含んでいても通常どおりつなぎます。
[行](#行)と
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
mermaid.js の行の規則は、`style` か `classDef`、その後の `:`、その後の、
`:` との間に空白のない `#`、その後の `;` を持つ行の、最後の `;` を取り除きます。
そのような行から文を動かすと、
どの `;` が最後かが変わるので（`A["style:#a"] B;C D;` で取り除かれるのは `D;` の
`;` で、id は `B;C` です。`D;` のない行では、`B;C` の `;` が取り除かれます）、
その行の文はその行に残し、保持する `;` も書かれたままにします。
スタイルの終端の例外は、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)に従います。
`:` と `#` の間の空白も、規則が効くかどうかを決めるので、そのままです。
`A["style:"]-->B["#z"];` は矢印が接したままで、
矢印の周りに空白があると規則は効かず、`;` はそれだけの id になります。
[fixture: multi-line-statements/columns-over-lines-joined]
[fixture: multi-line-statements/edge-over-lines-joined]
[fixture: multi-line-statements/shape-over-lines-joined]
[fixture: multi-line-statements/class-definition-line-break-in-the-head]
[fixture: multi-line-statements/continuation-line-joined-in-a-row]
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
`;` があるだけでは、行をつなぐ妨げにはなりません。
[fixture: multi-line-statements/semicolon-in-the-statement-joined]
[fixture: multi-line-statements/line-rule-line-kept]
[fixture: multi-line-statements/line-rule-line-kept-with-columns]
[fixture: multi-line-statements/line-rule-line-kept-with-composite]
[fixture: multi-line-statements/semicolon-in-an-id-kept]
[fixture: multi-line-statements/line-rule-style-terminator-dropped]
[fixture: multi-line-statements/empty-line-inside-joined]
[fixture: multi-line-statements/semicolon-id-after-end-kept]
[fixture: multi-line-statements/semicolon-id-after-columns-kept]
[fixture: multi-line-statements/semicolon-id-statement-on-its-own-line]
[fixture: multi-line-statements/line-rule-semicolon-after-touching-arrow-kept]
[fixture: multi-line-statements/line-rule-semicolon-after-an-id-kept]
[fixture: multi-line-statements/semicolon-after-spaced-arrow-is-an-id]

### コメント

コメント行は、行頭（空白の後）の `%%` で始まり、
字句解析器が読む前に取り除かれます。
単独の行のコメント行は、後ろの文と同じ段に置き、
テキストと印は書かれたまま残します。
最後の文の後のコメント行は、その後ろに残ります。
ヘッダーより前のコメント行は 1 列目に置きます。
行頭でない `%%` は id の文字で、書かれた場所に、
始まる文と一緒に残します（[行](#行)を参照）。
[fixture: comments/comment-line-at-the-level-of-the-next-statement]
[fixture: comments/comment-before-the-header]
[fixture: comments/comment-after-the-last-statement]
[fixture: comments/comment-in-a-composite]
[fixture: comments/comment-between-rows]
[fixture: comments/percent-in-a-line-is-an-id]
[fixture: comments/comment-text-kept]
[fixture: comments/comment-after-a-composite-head]

入力
([comments/comment-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/block/comments/comment-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
block-beta
%% a
columns 2
      %% b
a b
    %% c
```

出力
([comments/comment-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/block/comments/comment-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
block-beta
  %% a
  columns 2
  %% b
  a b
  %% c
```

入力
([comments/comment-before-the-header-input.mmd](../tests/fixtures/block/comments/comment-before-the-header-input.mmd)):

```mmd
%% a

  %% b
block-beta
a
```

出力
([comments/comment-before-the-header-output.mmd](../tests/fixtures/block/comments/comment-before-the-header-output.mmd)):

```mmd
%% a

%% b
block-beta
  a
```

### 指令

指令は元の単位の間に残します。
同じ印字行の中では、両側の空白の有無を保ちます。
空白が書かれていれば空白 1 つ、接していれば接したままです。
mermaid.js は読む前に指令を取り除くので、文の内部では、指令の隣が接しているか、
離れているかを保ちます（[ディレクティブ](./journey.ja.md#ディレクティブ)
を参照）。
単独の行にある指令は、後ろの文と同じ段に置き、ヘッダーより前の指令は、
コメント行と同じに 1 列目に置きます。
[fixture: directives/directive-before-the-header]
[fixture: directives/directive-line-at-the-level-of-the-next-statement]
[fixture: directives/directive-between-statements-of-a-row]
[fixture: directives/directive-between-statements-touching]
[fixture: directives/directive-between-statements-touching-after]
[fixture: directives/directive-between-statements-more-whitespace]
[fixture: directives/directive-between-units-of-a-statement]
[fixture: directives/directive-between-columns-and-the-number]
[fixture: directives/directive-after-the-header]
[fixture: directives/directive-after-a-statement]
[fixture: directives/directive-line-in-a-composite]
[fixture: directives/directive-inside-a-label]
[fixture: directives/directive-between-the-id-and-the-width]
[fixture: directives/directive-after-the-head-of-a-composite]
[fixture: directives/directive-after-columns]
[fixture: directives/directive-after-end]
[fixture: directives/directive-before-the-directions-of-a-block-arrow]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: block/directives/directive-after-columns]

入力
([directives/directive-between-statements-of-a-row-input.mmd](../tests/fixtures/block/directives/directive-between-statements-of-a-row-input.mmd)):

```mmd
block-beta
a %%{init: {}}%% b
```

出力
([directives/directive-between-statements-of-a-row-output.mmd](../tests/fixtures/block/directives/directive-between-statements-of-a-row-output.mmd)):

```mmd
block-beta
  a %%{init: {}}%% b
```

入力
([directives/directive-line-at-the-level-of-the-next-statement-input.mmd](../tests/fixtures/block/directives/directive-line-at-the-level-of-the-next-statement-input.mmd)):

```mmd
block-beta
%%{init: {}}%%
  columns 2
      %%{init: {}}%%
a b
```

出力
([directives/directive-line-at-the-level-of-the-next-statement-output.mmd](../tests/fixtures/block/directives/directive-line-at-the-level-of-the-next-statement-output.mmd)):

```mmd
block-beta
  %%{init: {}}%%
  columns 2
  %%{init: {}}%%
  a b
```

### 空の説明ブロック

何も変えない空のブロックは、それ自身が 1 つの文です。
内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
keyword と opener の間は、元が接していても空白 1 個にします。
語と本文の開始を見分けやすくするためで、
`accDescr{  }` は `accDescr {}` にします。
[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: block Unicode and tab interiors]
指令かコメント行を持つブロックは、内容と改行を保ち、
独立した trivia を 1 段内側、閉じ括弧を文の段に置きます。
[fixture: empty-description-blocks/trivia-continuations]
ヘッダーの後でも、2 つの node の間でも、自分の行に置きます。
文法がブロックを受け入れるのは、文が始まる場所です。
mermaid.js は、どこにあってもトークンのないものとして読みます。
[fixture: empty-description-blocks/whitespace-removed]
[fixture: empty-description-blocks/braces-touching-kept]
[fixture: empty-description-blocks/line-break-inside-joined]
[fixture: empty-description-blocks/between-two-nodes]
[fixture: empty-description-blocks/after-the-header]
[fixture: empty-description-blocks/with-a-comment-kept]
[fixture: empty-description-blocks/with-a-directive-kept]
[fixture: empty-description-blocks/in-a-composite]
[fixture: empty-description-blocks/empty-line-inside-joined]

入力
([empty-description-blocks/whitespace-removed-input.mmd](../tests/fixtures/block/empty-description-blocks/whitespace-removed-input.mmd)):

```mmd
block-beta
accDescr {   } a
```

出力
([empty-description-blocks/whitespace-removed-output.mmd](../tests/fixtures/block/empty-description-blocks/whitespace-removed-output.mmd)):

```mmd
block-beta
  accDescr {}
  a
```

入力
([empty-description-blocks/between-two-nodes-input.mmd](../tests/fixtures/block/empty-description-blocks/between-two-nodes-input.mmd)):

```mmd
block-beta
a accDescr {} b
```

出力
([empty-description-blocks/between-two-nodes-output.mmd](../tests/fixtures/block/empty-description-blocks/between-two-nodes-output.mmd)):

```mmd
block-beta
  a
  accDescr {}
  b
```

### フロントマターの YAML

フロントマターは、ほかの図と同じに Prettier が YAML として整形します（詳しくは、
[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml) を参照）。
正しい YAML でないフロントマターは、書かれたまま残します。
[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/block/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:    T
config: {a:   1}
---
block-beta
a
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/block/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { a: 1 }
---
block-beta
  a
```

### 行区切り文字

U+2028 と U+2029 は、ブロック図の単位の間の空白で、空白と同じです。
それを含む、行の中の隙間は、書かれたまま印字します。
ほかの図と同じです（[行区切り文字](./journey.ja.md#行区切り文字)を参照）。
隙間の代わりに印字が改行を置く所と、行末の隙間では、一緒に落とします。
それらの後のコメント行は、mermaid.js が 1 行として読む行をつなぎ（詳しくは、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）、その行の文は書かれたまま印字します。
ラベルの中では文字で、そのまま残ります。
[test: U+2028 between two statements of a row]
[test: U+2029 between two statements of a row]
[test: U+2028 around the arrow of an edge]
[test: U+2028 between an id and its shape]
[test: U+2028 before the colon of a width] [test: U+2028 after columns]
[test: U+2028 in a label] [test: U+2028 at the end of a statement of a row]
[test: U+2028 before a comment line that joins lines]
[test: U+2029 before comment lines that join lines]
[test: U+2028 between a composite head and its body]

### 空白文字

タブ、垂直タブ、改ページ、U+00A0、U+3000、U+FEFF は、単位の間の空白です。
印字が空白を選ぶ所では、空白の連なりと同じに空白 1 つにし、
行頭と行末では落とします。
ラベルの中では文字で、そのまま残ります。
U+0085 は mermaid.js にとって空白ではなく、前後の単語を 1 つの id にし、
書かれた場所に残ります。 [test: U+00A0 between two statements of a row]
[test: U+00A0 at the ends of a line]
[test: a tab, a vertical tab, a form feed, U+3000, and U+FEFF between units]
[test: U+00A0 around the arrow of an edge]
[test: U+00A0 between an id and its shape]
[test: U+00A0 before the directions of a block arrow] [test: U+00A0 in a label]
[test: U+00A0 in a class definition] [test: U+00A0 in a style]
[test: U+00A0 inside an empty description block]
[test: U+00A0 in a composite head] [test: U+0085 inside an id]

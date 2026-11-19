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
`block:` と `end` だけでは、深く入れ子になると始まりと終わりが見えないからで、
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
  block: group1:2
    columns 2
    h
    i
  end
  d
```

### composite

composite は 3 種類の行でできています。
`block:` とそのノードの行、中の文の行、`end` の行です。
`block` と `block-beta` は書かれたままに印字します。
キーワード `block:` はコロンを含み、そのノードとの間は空白 1 つにします。
`block:G` は `block: G` に、`block:G:2` は `block: G:2` に印字します。
幅のコロンは、ブロック図のほかの箇所と同じくノードに接します。
キーワードとその後ろのものの間の隙間は、
どの図種でも同じ形にします（`title Pets`）。
詳しくは
[Prettier にない種類の隙間](./printed-form.ja.md#2-prettier-にない種類の隙間)
を参照してください。
この決まりは、mermaid.js の例に綴りを合わせる決まりより先に当たります。
例は `block:` をノードに接して 4 回書き、後に空白を置く形は一度も書きません。
mermaid.js は `block: G` と `block:G` を同じに読み、
対象にする版もすべて同じなので、接する形が要る版はありません。
対象にする版はどれも、コロンの前の空白（`block : G`）を拒否します。
キーワード `block:` が許さないので、この形は印字しません。
`block:` の後には、改行を含む空白を置けます。
空白、タブ、改行の隙間は、空白 1 つに印字します。
`block:`、改行、`G` は `block: G` になります。
この隙間にあるディレクティブは、その空白の後に置き、ノードに接します。
詳しくは[指令](#指令)を参照してください。
見出しの後の最初の文と、`end` の後の文は、自分の行に移します。
1 行に書かれた composite（`block:G a b end`）も同じで、
どの composite も同じ形に置き、字下げが中身を示します。
`end` は自分の行に置き、`block:` と同じ段にします。

[fixture: composites/space-after-the-colon]
[fixture: composites/tab-after-the-colon]
[fixture: composites/directive-between-the-colon-and-the-node]
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
([composites/space-after-the-colon-input.mmd](../tests/fixtures/block/composites/space-after-the-colon-input.mmd)):

```mmd
block-beta
block:G
a
end
block: H
b
end
block:   I
c
end
```

出力
([composites/space-after-the-colon-output.mmd](../tests/fixtures/block/composites/space-after-the-colon-output.mmd)):

```mmd
block-beta
  block: G
    a
  end
  block: H
    b
  end
  block: I
    c
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
  block: G
    a b
  end
```

### 行

ほとんどの図は、どの文も自分の行に置きます。
ブロック図は、そうしません。
行は、書き手がブロックを並べる単位だからです。
1 行に並んだノードと `space` の連なりは、`columns` が決める格子の 1 行で、
mermaid.js の文書もそう書いています（`a b c`、`a["A label"] b:2 c:2 d`、
`Start(("Start")) space:2`）。
ノードを 1 行ずつに分けると、その行が見えなくなり、
列の数を `columns` の文から数えなおすことになります。

[fixture: rows/documentation-row-with-widths] [fixture: rows/space-in-a-row]

そのため、1 行にあるノードの文（幅、形、辺も含む）と `space` の連なりは、
その行に残し、文の間は空白 1 つにします。
連なりの中の 2 つの文の間の改行は、書かれた場所に残し、空行は 1 つにします。
それ以外の文は自分の行に置きます。
`columns`、composite の見出し、`end`、`classDef`、`class`、`style`、
空の説明ブロックです。
`columns 3` と同じ行にある文は次の行へ移します（`columns 3 a b c` は、
`columns 3` と、行 `a b c` になります）。
連なりの中の 2 つの文の間に、印字は改行を足さず、取りもしないので、
もう一度整形しても、同じ行が見つかります。

[fixture: rows/rows-kept] [fixture: rows/line-break-between-statements-kept]
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
mermaid.js はノードの後の `%%x` を id として読みますが、
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
Prettier がコードでそうするのと同じです。

[fixture: blank-lines/runs-become-one]
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

ヘッダーの `block-beta` と `block` は、書かれたまま印字します。
mermaid.js 12.3.0 はどちらも同じ図種として読みますが、
対象にする版には `block-beta` だけを検出するものがあるので、
綴りは作者の選択だからです。
詳しくは [ヘッダーの名前](./compatibility.ja.md#ヘッダーの名前)
を参照してください。
残す版は
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
の表にあります。
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

### Keyword case

block 図が語をキーワードとして読むのは、小文字のときだけです。
`COLUMNS`、`SPACE`、`STYLE`、`CLASSDEF` はキーワードではなく id なので、
書かれたまま残します。
ヘッダーは例外です（[ヘッダー](#ヘッダー)を参照）。

[fixture: keyword-case/keywords-kept]

入力（エスケープ表記）: `"block-beta\nCOLUMNS 2\nSPACE\nSTYLE A\nCLASSDEF c"`.

出力
([keyword-case/keywords-kept-output.mmd](../tests/fixtures/block/keyword-case/keywords-kept-output.mmd)):

```mmd
block-beta
  COLUMNS 2
  SPACE
  STYLE A
  CLASSDEF c
```

### columns と space

`columns` の後には、その数か `auto` を、空白 1 つで続けます。
間に書かれた空白（タブ、改行）はどれも同じです。
mermaid.js はそこのどの空白も同じに読むので、形は 1 行になります。
`space:2` は `:` を接して印字します。
対象にする版の mermaid.js はすべて、
`space :2` と `space: 2` を拒否するからです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
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
接していると、id と形が 1 つのノードであることが見え、
`A ("x") B` が 3 つと読まれません。
mermaid.js の文書の形です。
幅の `:` は、前にも後にも接します（`A:3`、`B["b"]:2`）。
対象にする版はどれも、コロンの後の空白（`A: 3`、`A : 3`）を拒否します。
Prettier は片側だけに空白を置いたコロンを印字しないので、前の空白（`A :3`。
それらの版は同じに読みます）も印字しません。
詳しくは
[mermaid.js が空白を許さない所](./printed-form.ja.md#mermaidjs-が空白を許さない所)
を参照してください。
`space:2` の `:` は接していなければなりません。

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
U+2028 と U+2029 はそのまま残します。
規則 1 は、コメントやディレクティブの隣の改行の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[sequence](./sequence.ja.md#複数行の文)、[gantt](./gantt.ja.md#複数行の文)、
[journey](./journey.ja.md#複数行の文)も、そのような改行を残します。
ただし、ほかの規則が配置を書かれたまま残す所は別です。
物理行を結ぶコメント領域と、`;` を含む行がそれです。
最初の方向の前、`,` の前、`)` の前では、コメント行とディレクティブの行は、
第 1 列か字下げされた、書かれた位置のままで、次の行も字下げしません。
そこの空白は Db にあるからです（上を参照）。
`,` の後では、そこの空白はどの方向にも入らないので、
コメント行やディレクティブの行と次の行を 1 段深く置きます。
[flowchart](./flowchart.ja.md#複数行の文)と
[xychart](./xychart.ja.md#複数行の文)も、文の続きを 1 段深く置きます。
方向の行にあるディレクティブは、`(` の後、`,` の前、`)` の前では、
そこの空白が Db にあるので、接しているか離れているかを書かれたまま残します。
`(right %%{x}%%, down)` と `(right%%{x}%%, down)` はそのままです。
`,` の後では、隙間をディレクティブがないものとして印字し、
ディレクティブをその空白の後ろに置いて、後ろの単位に接します。
[指令](#指令)と同じです。
`(right,  %%{x}%%  down)` と `(right,%%{x}%%down)` は `(right, %%{x}%%down)`
になります。
隙間に U+2028 か U+2029 があるときは、ディレクティブがあっても書かれたままです。
`(right,`、U+2028、` %%{x}%% down)` はそのままです。
`,` の後のディレクティブの後に改行があるときは、その前の空白は書かれたままで、
次の行は 1 段深く置きます。
`(right,  %%{x}%%` と改行はそのままです。

[fixture: shapes/block-arrow-comma-space]
[fixture: shapes/block-arrow-comma-comment-line]
[fixture: shapes/block-arrow-first-direction-comment-line]
[fixture: shapes/block-arrow-comma-comment-line-indented]
[fixture: shapes/block-arrow-closing-comment-line]
[fixture: shapes/block-arrow-comma-directive-line]
[fixture: shapes/block-arrow-comma-directive-line-indented]
[fixture: shapes/block-arrow-directive-before-comma]
[fixture: shapes/block-arrow-directive-touching-before-comma]
[fixture: shapes/block-arrow-first-direction-comment-line-indented]
[fixture: shapes/block-arrow-first-direction-directive-line]
[fixture: shapes/block-arrow-first-direction-directive-line-indented]
[fixture: shapes/block-arrow-closing-comment-line-indented]
[fixture: shapes/block-arrow-closing-directive-line]
[fixture: shapes/block-arrow-closing-directive-line-indented]
[fixture: shapes/block-arrow-directive-after-open-parenthesis]
[fixture: shapes/block-arrow-directive-before-closing-parenthesis]
[fixture: shapes/block-arrow-directive-after-comma]
[fixture: shapes/block-arrow-directive-after-comma-at-the-end-of-the-line]
[test: U+2028 and a directive after the comma between the directions of a block arrow, a space after the U+2028 and after the directive]
[test: U+2028 and a directive after the comma between the directions of a block arrow, nothing around the directive]
[test: U+2029 and a directive after the comma between the directions of a block arrow, a space after the U+2029 and after the directive]
[test: U+2029 and a directive after the comma between the directions of a block arrow, nothing around the directive]
[test: a space, U+2028, and a directive after the comma between the directions of a block arrow]
[test: a directive, spaces, and U+2028 after the comma between the directions of a block arrow]
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
中の改行を含めて書かれたまま印字しますが、中の空白とタブの連なりは、
空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
引用符は構文の一部です。
mermaid.js は引用符のないラベルを拒否します。

[fixture: shapes/label-runs-collapsed]

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
([shapes/label-runs-collapsed-input.mmd](../tests/fixtures/block/shapes/label-runs-collapsed-input.mmd)):

```mmd
block-beta
A["  two  spaces  "]
B["a
   b"]
```

出力
([shapes/label-runs-collapsed-output.mmd](../tests/fixtures/block/shapes/label-runs-collapsed-output.mmd)):

```mmd
block-beta
  A[" two spaces "]
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
矢印の線は、ラベルつきの辺のラベルの後でも、最短の形で印字します。
`--->` は `-->`、`-----` は `---`、`<--->` は `<-->`、`-..->` は `-.->`、
`====>` は `==>` です。
線の長さは Db に入らず、対象にする版は、
短い線から同じ図を描きます（太線を読まない版は両方を拒否します）。
mermaid.js の文書は `-->` を 9 回、`--` を 1 回書き、
それより長い線はありません。
`<` で始まる線は、何で終わっても短くします。
対象にする版が同じに描くからです（`<---x` は `<--x`、`<====` は `<===`）。
`<` のない、`x` か `o` で終わる矢印は書かれたままにします。
対象にする版のうち、`---x` と `--x`、
`---o` と `--o` を違う図に描くものがあるからです。
`>` で終わらない太線（`====`）も同じで、長さで違う id として読む版があります。
`~` の線も、どの版でも id なので同じです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。

[fixture: edges/spaces-around-an-arrow] [fixture: edges/spaces-around-a-label]
[fixture: edges/end-marker-apart-from-the-id] [fixture: edges/start-marker]
[fixture: edges/id-ending-in-x-or-o] [fixture: edges/arrow-length-shortest]
[fixture: edges/arrow-length-start-marker-shortest]
[fixture: edges/arrow-length-kept-where-drawn-differently]
[fixture: edges/line-kinds] [fixture: edges/label-with-other-opening-arrow]
[fixture: edges/edge-over-lines-joined] [fixture: edges/width-before-the-arrow]
[fixture: edges/edge-with-shapes]

辺の連鎖 `A --> B --> C` は 1 つの文で、1 行に印字します。
mermaid.js はそれを正しく読まず、Db が最後より前のすべてのノードを落としますが、
`A --> B` と `B --> C` に分けると別の Db になります。
印字は連鎖を mermaid.js より良く読むことはしません。
それは lint の規則の仕事です。

[fixture: edges/chain-on-one-line] [fixture: edges/chain-over-lines-joined]

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
`class` の値は書かれたまま印字しますが、
クラス名の中の空白とタブの連なりは空白 1 つで印字します。
Db は変わりますが、対象にする版の mermaid.js のすべてが、同じ図を描きます。
詳しくは
[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)
を参照してください。
`class A,B c1` を残すのは、対象にする版の mermaid.js のすべてが、
`class A, B c1` を違って描くためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
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
スタイルの語と語の間の空白とタブの連続は、空白 1 つで印字し、
語と語の間に空白があるかどうかは、書かれたまま残します。
文字列、コメント、`url(` の括弧の中の連続と、
バックスラッシュの後ろのエスケープは、CSS が値の一部として読むので、
書かれたまま残します。
エスケープは、16 進数字とその直後の空白かタブ 1 文字、
または 16 進数字が続かないときの次の 1 文字です。
Db は変わりますが、mermaid.js が描く図は同じです。
詳しくは [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。

[fixture: styles/style-colon-spaced] [fixture: styles/style-words-run-spaced]
[fixture: styles/style-string-runs-kept] [fixture: styles/style-url-runs-kept]
[fixture: styles/style-hex-escape-run-spaced]

最後のスタイルと同じ行の `%%` コメントの間の空白、タブ、改ページの連続は、
別の理由で行を書かれたまま残す場合を除き、空白 1 つで印字します。
[スタイルの末尾の空白](./compatibility.ja.md#スタイルの末尾の空白)
を参照してください。

[test: prints a form feed before a comment as one space]

ここではバックスラッシュは `,` をエスケープしません。
`fill:a\,b ,stroke:c` は `fill: a\, b, stroke: c` と印字します。
バックスラッシュの後で `:` の前にある空白は、
除くと `:` がエスケープされるので残します。
その空白の後ろの空白は除きます。

[fixture: styles/style-backslash-before-comma]
[fixture: styles/style-colon-escaped-space-kept]
[fixture: styles/style-colon-escaped-space-run-dropped]

最後のスタイルがバックスラッシュで終わる `style` は、
その後に空白があるかないかを保ち、空白の連続は最初の 1 文字にします。
文末でも同じです。
block arrow と group の形が、スタイルを書かれたまま `;` でつないで、
`style` 属性へ入れ、バックスラッシュが `;` をエスケープするからです。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
`style A stroke-width:3px\ ,stroke:#0f0` は、
`style A stroke-width: 3px\ , stroke: #0f0` と印字します。

[fixture: styles/style-backslash-space-kept]
[fixture: styles/style-backslash-at-end-kept]

`classDef` は先に空白を取り除くので、1 つの形で印字します。

[fixture: styles/class-def-backslash-space-dropped]

`color:` か `text-align:` で始まるスタイルは、前に空白があるかないかを保ち、
名前 `color` か `text-align` は、`:` との間に空白があるかないかを保ち、
空白の連続は空白 1 つにします。
mermaid.js がこのようなスタイルをノードのラベルのスタイルに入れ、
block arrow がそれを書かれたまま使うからです。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
`style K fill:#ff0,color:red` は、`style K fill: #ff0,color: red` と印字し、
`style K color :red` は `style K color : red` と印字します。

[fixture: styles/style-label-styles-kept]
[test: block: a-color-before-a-semicolon-that-the-line-rule-ignores-stays-in-a-style-that-holds-two-semicolons]
[test: a color before a semicolon, a space, and a semicolon in a style statement of one line stays as written]
[test: a color before two semicolons in a class definition of one line stays as written]
[test: a color before a semicolon that the line rule ignores, a directive after it, in a style statement of one line]
[test: a color before a semicolon that the line rule ignores, a directive after it, in a class definition of one line]
[test: a color before a semicolon that the line rule ignores, a comment after it, in a style statement of one line]
[test: a color before a semicolon that the line rule ignores, a directive after it, in a class definition that a line break joins]
[test: a color before a semicolon that the line rule ignores, in a style statement that a comment line after U+2028 cuts]
[test: a color before a semicolon after whitespace in a class definition that a line break joins]
[test: a color that a space and a character follow in a class definition that a line break joins]
[test: a color that a no-break space and a character follow in a class definition that a line break joins stays as written]

最後のスタイルの終わりより前にコメントやディレクティブがある文、
空白だけのスタイルがある文、スタイルに改行があるか、行に保つ `;` がある文は、
空白を書かれたままにし、色は[色](#色)と同じに印字します。
ただし、改行のある文では、
行の規則が無視する `;`
が接する色を書かれたまま残します（[複数行の文](#複数行の文)を参照）。
1 行の文は、これを小文字に印字します。
ただし、`;` が 2 つ続くときは書かれたままです。
（`style a fill:#F00,  stroke:#ABC;  %%{x}%%` は
`fill:#f00,  stroke:#abc; %%{x}%%` になりますが、
`#ABC;;` と `#ABC; ;` は残ります）。
行の規則が `;` を残すとき（`:` と `#` の間に空白があるとき）、
`;` はテキストの一部であり、それに接する色は、
1 行の文でも書かれたまま残します（`classDef c fill: #F00;` です。
`style a fill: #F00,stroke: #ABC;` は `style a fill: #f00,stroke: #ABC;`
になります）。
空白、タブ、フォームフィードがその `;` から離す色は小文字になり（`#f00 ;`）、
ほかの文字が離す色は書かれたままです。
色の後の最初の文字が決めます。
最後のスタイルの後ろのコメントやディレクティブは文の一部ではなく、
文は普通に整形します。
詳しくは [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。
文の最後の空白は、
flowchart の [スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白)
と同じに落とします。

[fixture: styles/style-comment-and-directive-after-last-style-formatted]
[fixture: styles/class-definition-spaces] [fixture: styles/style-spaces]
[fixture: styles/class-spaces] [fixture: styles/style-commas-spaced]
[fixture: styles/class-definition-commas-spaced]
[fixture: styles/class-definition-comma-spaced]
[fixture: styles/class-definition-comma-beside-directive-kept]
[fixture: styles/style-statement-commas-spaced]
[test: U+2029 before the comma of a block classDef statement]
[test: block: a-directive-between-two-styles-keeps-the-whitespace-and-lowers-the-colors]
[test: block: a-directive-inside-a-style-lowers-the-colors]
[test: block: a-color-that-a-directive-and-a-character-follow-stays]
[test: block: a-style-that-is-all-whitespace-keeps-the-whitespace-and-lowers-the-colors]
[test: block: a-color-before-a-semicolon-that-the-line-rule-ignores-stays-in-a-style-that-holds-two-semicolons]
[fixture: styles/class-ids-as-written]
[test: a color that a semicolon that the line rule keeps touches in a class definition of one line stays as written]
[test: a color that a semicolon that the line rule keeps touches in a style statement of one line stays as written, and the color before a comma is printed in lower case]
[test: a color that a semicolon that the line rule keeps touches in a style statement of one line stays as written, with a directive after it]
[test: a color that a semicolon that the line rule keeps touches in a class definition that a line break joins stays as written]
[test: a space between a color and the semicolon that the line rule keeps in a class definition of one line, the color is printed in lower case]
[test: a tab between a color and the semicolon that the line rule keeps in a class definition of one line, the color is printed in lower case]
[test: a form feed between a color and the semicolon that the line rule keeps in a class definition of one line, the color is printed in lower case]
[test: a vertical tab between a color and the semicolon that the line rule keeps in a class definition of one line, the color stays as written]
[test: a no-break space between a color and the semicolon that the line rule keeps in a class definition of one line, the color stays as written]
[test: U+2003 between a color and the semicolon that the line rule keeps in a class definition of one line, the color stays as written]

`class` 文のクラス名は語として読むので、
中の空白とタブの連なりは空白 1 つにして印字します。
`class A c   d` は `class A c d` と印字します。

[fixture: styles/class-name-with-a-comma-runs-collapsed]
[fixture: styles/class-name-runs-collapsed]
[fixture: styles/trailing-whitespace-dropped]
[fixture: styles/styles-with-a-directive]

`:` で始まるスタイルも、ほかのスタイルと同じく、`:` の後ろに空白を 1 つ置き、
語と語の間の連続は空白 1 つで印字します。
`style A :  red   x` は `style A : red x` と印字します。

[fixture: styles/style-colon-first-run-spaced]

スタイルのない `style` は `style A` と出力し、id は 1 つの空白の後に置き、
その後ろには何も置きません。
規則 1 は、キーワードと ID の間の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[wardley](./wardley.ja.md#部品間の空白)
はコマンドのキーワードと最初の名前の間に、
[radar](./radar.ja.md#groups-and-commas)
はグループのキーワードと最初の項目の間に、普通の空白 1 個を置きます。

[fixture: styles/style-without-styles] [corpus fixture: block/db-style-none]

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

クラス名が複数ある `class` は、書かれたまま印字します。
`class A x,y` はそのまま残します。
`x, y` と書くと、`x, y` という名前の 1 つのクラスになり、
`x,y` という名前の 1 つのクラスとは別のクラスになるので、Db が変わります。
詳しくは [コンマで区切る一覧](./compatibility.ja.md#コンマで区切る一覧)
を参照してください。

[fixture: styles/class-names-without-space-kept]

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

空の説明ブロックも通常の配置に従い、スタイルの終端は削除します。

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
composite の見出しなどの構造隙間では、注釈類の改行を保ちます。
後続の部分と独立した注釈類行は、ノードの行や composite の内側でも、
その文より 1 段深くそろえます。
各隙間の最初の行の末尾、指令の内部全体、値の範囲全体を保ちます。
block-arrow の方向は、`,` の後の空白を除いて原文のままです。

[fixture: multi-line-statements/structural-trivia-continuations]
[test: block: a-run-of-spaces-after-a-comma-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block: a-space-before-a-comma-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block: a-run-of-spaces-around-the-colon-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block: a-tab-after-a-comma-in-a-classdef-that-whitespace-and-a-line-break-join-stays]
[test: block: a-color-that-characters-follow-after-whitespace-in-a-classdef-that-whitespace-and-a-line-break-join-is-lower-case]

物理行を結ぶコメント領域は、元の配置を保ちます。
U+2028 か U+2029 の後のコメント領域があると、
mermaid.js は前後の行を 1 行として読みます。
整形がその行をどう印字するか、別に印字する場合は、
[U+2028 または U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
にあります。
複合ヘッドはもう 1 つの場合です。
コロンの行に名前があるときは、その間の隙間を普通のヘッドと同じに印字します。
`block:G`、U+2028、`%% c` は `block: G`、U+2028、`%% c` に、
`block:   G` は `block: G` に印字します。
名前の後の空白は残ります（`block:G`、空白、U+2028、`%% c`）。
コメント領域がコロンにすぐ続くときは、ヘッドを書かれたまま残します。
コロンの後に空白があっても同じです。
`block:`、U+2028、`%% keep`、改行、`group:2` と、
U+2028 の前にコロンの後の空白が 3 つの `block:` がその例です。

[test: block: ls-comment-in-composite-head]
[test: block: ps-comment-in-composite-head]
[test: block: ls-comment-after-composite-head-name]
[test: block: ps-comment-after-composite-head-name]
[test: block: composite-head-name-after-the-comment-line-stays-as-written]
[test: block: composite-head-spaces-after-the-colon-before-a-ls-comment-line-stay]
[test: block: composite-head-space-after-the-name-before-a-ls-comment-line-stays]
[test: block: composite-head-spaces-before-the-name-before-a-ls-comment-line-are-one-space]

改行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合と、最後の行を `;` が終える場合は、
その改行を残します。
それ以外の改行は、`;` を含む文でも通常どおりつなぎます。
改行が残る文は、スタイルの空白（連なりとタブも）を書かれたまま残します。
色は、コンマが続くとき、空白、タブ、
フォームフィードの後に文字が続くとき（`fill:#F00 x;` は `fill:#f00 x;`
になります）に小文字にします。
ほかの文字が続く色は、コンマの前でも書かれたまま残ります（`fill:#F00`、
ノーブレークスペース、`x;` は `#F00` のままです）。
垂直タブ、幅のある空白（ノーブレークスペース、U+1680、U+2000 から U+200A、
U+202F、U+205F、U+3000、U+FEFF）、U+2028、U+2029、U+0085、U+180E、U+200B、
タブとフォームフィード以外の制御文字は、ここでは空白ではありません。
色の後の最初の文字が決め、後ろに何が続いても同じです（`fill:#F00`、空白、
垂直タブは `#f00` になり、`fill:#F00`、垂直タブ、空白は `#F00` のままです）。
行の規則が無視する `;` が接する色（`#ABC;`）と、空白、タブ、
フォームフィード以外の文字がその `;` から離す色も書かれたまま残し、
垂直タブと幅のある空白では、[色](#色)の規則がこれを小文字に印字するので、
規則に反して印字しており、規則による修正を待っています。
空白、タブ、フォームフィードが `;` から離す色は小文字にします（`#abc ;`）。
[行](#行)と
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
mermaid.js の行の規則は、`style` か `classDef`、その後の `:`、その後の、
`:` との間に空白のない `#`、その後の `;` を持つ行の、最後の `;` を取り除きます。
この条件に合う最初の `#` で決まるので、`B[":#a;#b"]` も該当します。
そのような行から文を動かすと、
どの `;` が最後かが変わるので（`A["style:#a"] B;C D;` で取り除かれるのは `D;` の
`;` で、id は `B;C` です。`D;` のない行では、`B;C` の `;` が取り除かれます）、
その行の文はその行に残し、保持する `;` も書かれたままにします。
スタイルの終端の例外は、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)に従います。
`:` と `#` の間の空白も、規則が効くかどうかを決めるので、そのままです。
`A["style:"]-->B["#z"];` は矢印が接したままで、
矢印の周りに空白があると規則は効かず、`;` はそれだけの id になります。

[fixture: multi-line-statements/breaks-decided-one-by-one]
[fixture: multi-line-statements/columns-over-lines-joined]
[fixture: multi-line-statements/edge-over-lines-joined]
[fixture: multi-line-statements/shape-over-lines-joined]
[fixture: multi-line-statements/class-definition-line-break-in-the-head]
[fixture: multi-line-statements/continuation-line-joined-in-a-row]
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[test: a space before a comma in a class definition that a line break joins, the color is printed in lower case]
[test: a space and a character after a color in a class definition that a line break joins, the color is printed in lower case]
[test: a space between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color is printed in lower case]
[test: a tab before a comma in a class definition that a line break joins, the color is printed in lower case]
[test: a tab and a character after a color in a class definition that a line break joins, the color is printed in lower case]
[test: a tab between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color is printed in lower case]
[test: a vertical tab before a comma in a class definition that a line break joins, the color stays as written]
[test: a vertical tab and a character after a color in a class definition that a line break joins, the color stays as written]
[test: a vertical tab between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: a form feed before a comma in a class definition that a line break joins, the color is printed in lower case]
[test: a form feed and a character after a color in a class definition that a line break joins, the color is printed in lower case]
[test: a form feed between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color is printed in lower case]
[test: a no-break space before a comma in a class definition that a line break joins, the color stays as written]
[test: a no-break space and a character after a color in a class definition that a line break joins, the color stays as written]
[test: a no-break space between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+1680 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+1680 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+1680 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2000 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2000 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2000 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2001 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2001 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2001 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2002 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2002 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2002 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2003 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2003 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2003 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2004 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2004 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2004 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2005 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2005 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2005 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2006 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2006 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2006 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2007 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2007 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2007 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2008 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2008 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2008 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2009 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2009 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+2009 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+200A before a comma in a class definition that a line break joins, the color stays as written]
[test: U+200A and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+200A between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+202F before a comma in a class definition that a line break joins, the color stays as written]
[test: U+202F and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+202F between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+205F before a comma in a class definition that a line break joins, the color stays as written]
[test: U+205F and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+205F between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+3000 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+3000 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+3000 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+FEFF before a comma in a class definition that a line break joins, the color stays as written]
[test: U+FEFF and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+FEFF between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+2028 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+2029 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+0085 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+0085 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+0085 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+180E before a comma in a class definition that a line break joins, the color stays as written]
[test: U+180E and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+180E between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+200B before a comma in a class definition that a line break joins, the color stays as written]
[test: U+200B and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+200B between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]
[test: U+0001 before a comma in a class definition that a line break joins, the color stays as written]
[test: U+0001 and a character after a color in a class definition that a line break joins, the color stays as written]
[test: U+0001 between a color and the semicolon that the line rule ignores in a class definition that a line break joins, the color stays as written]

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
[fixture: multi-line-statements/line-rule-first-hash-after-colon-kept]
[fixture: multi-line-statements/semicolon-after-spaced-arrow-is-an-id]

### コメント

コメント行は、行頭（空白の後）の `%%` で始まり、
字句解析器が読む前に取り除かれます。
単独の行のコメント行は、後ろの文と同じ段に置き、
テキストと印は書かれたまま残します。
最後の文の後のコメント行は、その後ろに残ります。
ヘッダーより前のコメント行は 1 列目に置きます。
規則 1 は、ここを決めません（[規則 1](./printed-form.ja.md#1-記号の横の空白)）。
規則 1 の表が挙げるのは印の横の空白で、行頭の空白ではないからです。
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が形を与えます。
[state](./state.ja.md#コメント) と [flowchart](./flowchart.ja.md#コメント) も、
コメント行を周りの文と同じ段に置きます。
composite ブロックの `end` の前のコメント行は、
ブロックの中の文と同じ段に置きます。
[class](./class.ja.md#コメント) は、
本体の中のコメント行をメンバーの行と同じ段に、
[state](./state.ja.md#コメント) は、複合状態の中のコメント行を、
その中の文と同じ段に置きます。
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
同じ印字行の中では、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
隙間をディレクティブがないものとして印字し、
ディレクティブをその空白の後ろに置いて、後ろの単位に接します。
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
間のディレクティブを次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
規則 1 は、2 つの単位の間のディレクティブの印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[flowchart](./flowchart.ja.md#ディレクティブ)、
[gantt](./gantt.ja.md#ディレクティブ)、
[journey](./journey.ja.md#ディレクティブ)も、
整形が分ける単位の隙間のディレクティブを後ろの単位と一緒に動かし、
右側の接触か間隔を残し、左側の接触は切ります。
ただし、ほかの規則が配置を書かれたまま残す所は別です。
文の後の閉じていないディレクティブがそれです。

[fixture: block/directives/directive-after-columns]
[fixture: block/directives/directive-after-columns-right-touching]
[fixture: block/directives/directive-after-columns-left-touching]

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
  a %%{init: {}}%%b
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
キーワードと開始記号の間は、元が接していても空白 1 個にします。
語と本文の開始を見分けやすくするためで、
`accDescr{  }` は `accDescr {}` にします。

[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: block Unicode and tab interiors]

指令かコメント行を持つブロックは、内容と改行を保ち、独立した注釈類を 1 段内側、
閉じ括弧を文の段に置きます。
規則 1 は、ブロックの中の行の印を挙げていないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[pie](./pie.ja.md#description-blocks)、[sequence](./sequence.ja.md#複数行の値)、
[info](./info.ja.md#description-blocks)も、ブロックの、
自分の行にあるコメント行やディレクティブの行を 1 段内側に置き、
閉じ括弧を文の段に置きます。

[fixture: empty-description-blocks/trivia-continuations]

ヘッダーの後でも、2 つのノードの間でも、自分の行に置きます。
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

### 色

スタイルの色は、mermaid.js の文書の例と Prettier の CSS 整形と同じく、
小文字で印字します。
`style A fill:#F9F,stroke:#ABCDEF` は `style A fill: #f9f, stroke: #abcdef`
と印字します。
block 図の `style`、`classDef` 文のスタイルの色が対象です。
色は、スタイルの値の中で単独で立つ、`#` と 3、4、6、8 桁の 16 進数です。
色を短くすることはなく、色でないテキストは書かれたままにします。
（[同じに描かれる色](./compatibility.ja.md#同じに描かれる色)を参照）。

[fixture: colors/colors-in-lower-case]
[fixture: colors/words-that-are-not-colors-as-written]
[fixture: block/colors/color-directive-in-url-name-kept]

入力
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/block/colors/colors-in-lower-case-input.mmd)):

```mmd
block-beta
columns 2
A B
classDef c fill:#DEADBE,stroke:#ABCDEF
class B c
style A fill:#F9F,stroke:#ABCDEF,color:#C0FFEE
```

出力
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/block/colors/colors-in-lower-case-output.mmd)):

```mmd
block-beta
  columns 2
  A B
  classDef c fill: #deadbe, stroke: #abcdef
  class B c
  style A fill: #f9f, stroke: #abcdef,color: #c0ffee
```

入力
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/block/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
block-beta
A B
style A fill:#ABCDE,stroke:#ABCDEF1
classDef c fill:url(#ABC),stroke:#ABC-x
```

出力
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/block/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
block-beta
  A B
  style A fill: #ABCDE, stroke: #ABCDEF1
  classDef c fill: url(#ABC), stroke: #ABC-x
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
規則 1 の表に、これを含む間隔の印はないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
ほかの図も、これを含む間隔を書かれたまま印字します。
隙間の代わりに印字が改行を置く所と、行末の隙間では、一緒に落とします。
それらの後のコメント行は、mermaid.js が 1 行として読む行をつなぎ（詳しくは、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）、コメント行の後にテキストが続くときは、
その行の文の空白と改行は書かれたまま印字します。
コメント行の後に何が続くかが、残りを決めます。
`style a fill:#F00`、U+2028、`%% c`、改行の後は、
ブロック図は次のように印字します。

| コメント行の後に続くもの                                                                    | U+2028 や U+2029 と行                                        | 色     |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| 何もなく、テキストの末尾                                                                    | 落とす。コメント行は、普通の行と同じに自分の行に置く         | `#f00` |
| コメント行だけで、テキストの末尾                                                            | 落とす。各コメント行は、普通の行と同じに自分の行に置く       | `#f00` |
| 空行で、テキストの末尾                                                                      | 落とす。コメント行は、普通の行と同じに自分の行に置く         | `#f00` |
| 空白だけの行で、テキストの末尾                                                              | 落とす。コメント行は、普通の行と同じに自分の行に置く         | `#f00` |
| 空行とコメント行で、テキストの末尾                                                          | 落とす。どの行も、普通の行と同じに自分の行に置く。空行は残す | `#f00` |
| すぐに文（接する `b` か、空白の後の ` y`）                                                  | 残す。文はコメント行の次の行に、書かれたままで残る           | `#F00` |
| コメント行 2 つと文                                                                         | 残す。文はコメント行の次の行に、書かれたままで残る           | `#F00` |
| 空行と文                                                                                    | 残す。文は離れて、文の段に置く                               | `#f00` |
| コメント行、空行、文                                                                        | 残す。文は離れて、文の段に置く                               | `#f00` |
| 空白だけの行と文                                                                            | 残す。文は離れて、文の段に置く                               | `#f00` |
| ディレクティブの行で、テキストの末尾                                                        | 残す                                                         | `#f00` |
| ディレクティブの行と文                                                                      | 残す。文は離れて、文の段に置く                               | `#f00` |
| ディレクティブの行とコメント行で、テキストの末尾                                            | 落とす。どの行も、普通の行と同じに自分の行に置く             | `#f00` |
| コメント行、ディレクティブの行、コメント行で、テキストの末尾                                | 落とす。どの行も、普通の行と同じに自分の行に置く             | `#f00` |
| 空行、ディレクティブの行、コメント行で、テキストの末尾                                      | 落とす。どの行も、普通の行と同じに自分の行に置き、空行を残す | `#f00` |
| ディレクティブの行、空行、コメント行で、テキストの末尾                                      | 落とす。どの行も、普通の行と同じに自分の行に置き、空行を残す | `#f00` |
| ディレクティブの行 2 つとコメント行で、テキストの末尾                                       | 落とす。どの行も、普通の行と同じに自分の行に置く             | `#f00` |
| ディレクティブの行、コメント行、文                                                          | 残す。文はコメント行の次の行に、書かれたままで残る           | `#F00` |
| ディレクティブの行、コメント行、ディレクティブの行で、テキストの末尾                        | 残す                                                         | `#f00` |
| コメント行 2 つとディレクティブの行で、テキストの末尾                                       | 残す                                                         | `#f00` |
| 空行とディレクティブの行で、テキストの末尾                                                  | 残す。ディレクティブの行は離れて、文の段に置く               | `#f00` |
| ディレクティブの行と空行で、テキストの末尾                                                  | 残す。末尾の空行は落とす                                     | `#f00` |
| ディレクティブとコメントが 1 行にある行で、テキストの末尾（`%%{y}%%%% d`、`%%{y}%%  %% d`） | 落とす。その行を、普通の行と同じに自分の行に置く             | `#f00` |
| ディレクティブを含むコメント行（`%% d%%{y}%%`）で、テキストの末尾                           | 落とす。その行を、普通の行と同じに自分の行に置く             | `#f00` |
| コメント行、ディレクティブの行、文                                                          | 残す。文は離れて、文と同じ段に置く                           | `#f00` |
| 空行、コメント行、文                                                                        | 残す。文はコメント行の次の行に、書かれたまま残る             | `#F00` |
| `;` だけの行（`;b`、`%%{y}%%;` も）                                                         | 残す。その行はコメント行の次の行に、書かれたまま残る         | `#F00` |
| 空行、`;` だけの行                                                                          | 残す。その行は離れて、文と同じ段に置く                       | `#f00` |

U+2028 や U+2029 は、文が続かず、
空白でない最後の行がコメントを含むとき（コメント行、
ディレクティブを含むコメント行、ディレクティブとコメントが 1 行にある行）、
その前の行に `;` がないときに落とし、前の行に `;` があるとき、文が続くとき、
または空白でない最後の行にディレクティブしかないときは残します。
`;` だけの行、`;` と文字の行、ディレクティブと `;` の行は、ここでは文です。
これは `style` と `classDef` に限らず、ブロック図のどの文でも同じです。
`b`、`b["x"]`、`b-->c`、`columns 2` は、
テキストの末尾のコメント行の前の U+2028 や U+2029 を落とし、`b;`、`b["x;y"]`、
`b-->c;`、`columns 2;` は残します。
`;` は、行のどこにあっても数え、ラベル、ディレクティブ、
コメントの中でも同じです（`style a fill:#F00 %%{x;y}%%` と
`style a fill:#F00 %% x;`、U+2028、`%% c` は、
U+2028 を残して `#f00` と印字します）。
`style`、`classDef`、`class` の文は、文と U+2028 の間に何があっても（何もない、
コメント、ディレクティブ、その両方。`style a fill:#F00 %% x`、
`classDef k fill:#F00%% x`、`class a k %%{x}%% %% x`）、
行に `;` がなければ U+2028 や U+2029 を落とします。
それ以外の文は、間に何もないか、ディレクティブだけがあるとき（`b`、
`b-->c %%{x}%%`、`b-->c%%{x}%%`）は落とし、空白、空白の連なり、
[空白文字](#空白文字)のどれかを挟んでコメントが続くとき（`b %% x`、
`columns 2 %% x`、`b:2 %% x`、`b`、タブ、`%% x`）は残します。
ディレクティブの後でも、
そのディレクティブにコメントが接するときも同じです（`b %%{x}%% %% x`、
`b %%{x}%%%% x`）。
コメントが文に接するときは、文の最後の単位が決めます。
後ろに何も続かないノードの id が最後なら落とし（`b%% x`、`b-->c%% x`、
`b:2-->c%% x`、`b["x"]-->c%% x`、`b -- "x" --> c%% x`、`b e%% x`）、ラベルか形、
幅、`columns`、`space`、ブロックの矢印、`end` が最後なら残します（`b["x"]%% x`、
`b("x")%% x`、`b:2%% x`、`b-->c["x"]%% x`、`b:2-->c["x"]%% x`、`columns 2%% x`、
`space%% x`）。
複合ブロックの `end` も、ほかの文と同じ文です。
`end;`、`end%% x`、`end %% x` のように U+2028 が残るとき、
または文がコメント行の後に続くときは、複合ブロック全体を書かれたままにし、
頭も本体も字下げしません（`block:G`、`  b`、`end;`、U+2028、`%% c`）。
落とすとき（`end`、`end %%{x}%%`）は、複合ブロックを通常どおり整形します。
複合ブロックの頭は、後ろに必ず文（少なくとも `end`）が続くので、
前にコメントがあるときも、コメントが頭に接するときも空白を挟んで続くときも、
U+2028 や U+2029 を残し、通常どおり整形します（`block:G%% x`、U+2028、
`%% c` は `block: G%% x`、U+2028、`%% c` になり、
`block:G %% x` は `block: G %% x` になります）。
コメント行にある 2 つ目の U+2028 や U+2029（`b`、U+2028、`%% c`、U+2028、
`%% d`）は、次の改行までのコメントの一部なので、後ろに何が続いても（何もない、
コメント、文のテキスト）書かれたまま残ります。
1 つ目は、上の規則のとおり落とすか残し、
落とすときはコメント行を行として独立させます（`b`、改行、`%% c`、U+2028、
`%% d` になります。`b %% c`、U+2028、`%% d`、U+2028、`%% d` は変わりません）。
コメントの前に 2 つ続く U+2028（`b`、U+2028、U+2028、`%% c`）は、
1 つのときと同じく上の規則に従い、U+2029 が 2 つのときも同じです。
1 つ目を落とすときは両方を落とし、改行が 1 つ残り、
1 つ目が残るときは（`b %% x`、`b;`、
コメント行の後に文がある `b`）両方が残ります。
文が続くときの色は、文がコメント行のすぐ後の行にあれば書かれたまま残り、空行、
空白だけの行、ディレクティブの行が文のすぐ前にあれば小文字になります。
flowchart、class、state、ER は、ブロック図が落とすどの行でも、
その行を書かれたまま残し（ER は空白だけの行を拒否します）、
その形は規則 2 が与えます。
そのためブロック図は、それらの行を規則 2 に反して印字しており、
規則による修正を待っています。
そのような行で、その行でコンマが続く色（空白、タブ、
フォームフィードを挟んでもです）と、行の規則が無視する `;` が続かない、
最後の行の最後の色は、小文字にします。
コメント行の後の行がコンマで始まるときの色は、書かれたまま残します（`#F00`、
その後の `#abc` です）。
空白、タブ、フォームフィードと文字が行で続く色は、小文字にします（`#F00 x`、
U+2028、`%% c`、` y` は `#f00 x` になります）。
行の規則が無視する `;` が、
コメント行の後の行で接する色も書かれたまま残します（`#F00`、
その後の `#ABC;` です。U+2028 の前の `;` は後で述べます）。
空白、タブ、フォームフィード以外の文字がその `;` から離すときも同じです。
[色](./compatibility.ja.md#同じに描かれる色)の規則はこれを小文字に印字するので、
その形は規則に反して印字しており、規則による修正を待っています。
U+2028 の前の行に `;` があるときは、その行を書かれたままにします。
U+2028 とコメント行は、コメント行の後に何が続いても残り、
スタイルの空白も書かれたままです（`style a fill:red;`、U+2028、
`%% c` は変わりません。色でない値の後の `stroke-width:2px;` も、
空白や文字が `;` から離す色の後の `fill:#F00 ;`、`fill:#F00 x;` も、
U+2028 とコメント行は残り、色は小文字になります。`style a fill:red`、U+2028、
`%% c` は `fill: red` になります）。
その行の色は、コンマが続くときと、空白、タブ、
フォームフィードと文字が続くときに、小文字にします。
1 つ目の `;` の後ろに、
間に何があっても 2 つ目の `;` が続くとき（`style a fill:#F00;;`、
`style a fill:#F00; ;`、`style a fill:#F00;x;`）は、何が続いても、
また 2 つ目の `;` と U+2028 の間に何があっても（空白、タブ、垂直タブ、文字）、
色は書かれたまま残ります。
色の後ろの `;` が 1 つのときは、その `;` の後ろに行で続くもので決まります。
ディレクティブは数えません。
空白、タブ、フォームフィードが続くときは、
色はコメント行の後に何が続いても小文字になります。
コメントを含む文字かコメントが、直後か、垂直タブ、ノーブレークスペース、空白、
タブ、フォームフィード以外の空白文字の後に続くときは、
行の規則がその `;` を残し、
色は何が続いても書かれたまま残ります（`style a fill:#F00;x`、
`style a fill:#F00;%% x`、`style a fill:#F00;%%{y}%%%% x`、
`style a fill:#F00;`、垂直タブ、`%% x` の後の U+2028 と `%% c`）。
何も続かないとき、または垂直タブ、
ノーブレークスペースなどのほかの空白文字だけが続くときは、色は、
コメント行のすぐ後に文が続くときだけ、`;` がないときと同じに書かれたまま残り、
文が続かないとき、または空行かディレクティブの行が文のすぐ前にあるときは、
小文字になります（`style a fill:#F00;`、U+2028、`%% c` は、
U+2028 と `%% c` を残して `style a fill:#f00;` になります）。
ブロック図では、mermaid.js は U+2028 を行の終わりとして、
`%% c` をコメントとして読みます。
`style a fill:#F00`、U+2028、テキストの末尾の `%% c` は、
12.3.0 の Db がその 2 つをスタイルに持たず、Db が普通の行と違うのは、
最初の `:` の後の空白と色の大文字小文字だけで、10.9.8、11.7.0、11.17.2、12.0.0、
12.3.0 の描画は同じです。
どちらも[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)と
[同じに描かれる色](./compatibility.ja.md#同じに描かれる色)が定めています。
表で style の文の後の U+2028 を落とすほかの行も、描画は同じです。
この記録に入っているのは、何も続かない行と、
ほかの行の 12 の入力です（1 つの行は入力を 2 つ持ちます）。
ラベルの中では文字で、そのまま残ります。

[test: U+2028 between two statements of a row]
[test: U+2029 between two statements of a row]
[test: U+2028 around the arrow of an edge]
[test: U+2028 between an id and its shape]
[test: U+2028 before the colon of a width] [test: U+2028 after columns]
[test: U+2028 in a label] [test: U+2028 at the end of a statement of a row]
[test: U+2028 before a comment line that joins lines]
[test: U+2029 before comment lines that join lines]
[test: block: style-ls-before-a-comment-at-the-end-of-the-text-is-dropped]
[test: block: style-ls-and-ps-before-a-comment-at-the-end-of-the-text-are-dropped]
[test: block: classDef-ls-before-a-comment-at-the-end-of-the-text-is-dropped]
[test: block: style-ls-touching-a-directive-is-dropped]
[test: block: color-before-comma-in-style-on-a-line-that-a-ls-comment-line-joins]
[test: block: color-before-comma-in-classdef-on-a-line-that-a-ps-comment-line-joins]
[test: block: last-color-in-style-that-the-line-after-a-ls-comment-line-goes-on-with]
[test: block: color-before-comma-after-whitespace-in-style-on-a-line-that-a-ls-comment-line-joins]
[test: block: color-before-a-comma-on-the-next-line-of-a-style-that-a-ls-comment-line-joins]
[test: block: color-before-a-ls-comment-line-that-a-statement-follows]
[test: block: color-before-a-semicolon-that-the-line-rule-ignores-in-a-classdef-that-whitespace-and-a-line-break-join]
[test: block: color-before-a-semicolon-on-the-line-after-a-ls-comment-line-in-a-classdef]
[test: block: style-ls-before-a-comment-and-a-directive-line-keeps-the-ls-and-lowers-the-color]
[test: block: style-ps-before-a-comment-and-a-directive-line-keeps-the-ps-and-lowers-the-color]
[test: block: classdef-ls-before-a-comment-and-a-directive-line-keeps-the-ls-and-lowers-the-color]
[test: block: style-ls-before-two-comment-lines-at-the-end-of-the-text-is-dropped]
[test: block: style-ls-before-a-comment-line-an-empty-line-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block: style-ls-before-a-comment-line-a-directive-line-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block: style-ls-before-a-comment-line-a-directive-line-and-a-comment-line-at-the-end-is-dropped]
[test: block: style-ls-before-a-comment-line-a-directive-line-a-comment-line-and-a-statement-keeps-the-lines]
[test: block: style-ls-before-a-comment-line-a-directive-line-a-comment-line-and-a-directive-line-keeps-the-ls]
[test: block: style-ls-before-two-comment-lines-and-a-statement-keeps-the-lines]
[test: block: style-ls-before-a-comment-line-an-empty-line-after-it-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block: style-ls-before-a-comment-line-a-whitespace-only-line-and-a-statement-keeps-the-ls-and-lowers-the-color]
[test: block: style-ls-before-a-comment-line-and-an-empty-line-at-the-end-is-dropped]
[test: block: style-ls-before-a-comment-line-an-empty-line-and-a-comment-line-at-the-end-is-dropped]
[test: block: style-ls-before-a-comment-line-and-a-whitespace-only-line-at-the-end-is-dropped]
[test: block: last-color-before-a-semicolon-that-the-line-rule-ignores-on-the-line-after-a-ls-comment-line-in-a-style-stays]
[test: block: last-color-before-a-semicolon-that-the-line-rule-ignores-on-the-line-after-a-ls-comment-line-in-a-classdef-stays]
[test: block: a-color-before-a-space-and-a-comment-line-in-a-style-that-a-ls-comment-line-joins-is-lower-case]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, nothing after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, a second comment line after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, an empty line after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, a whitespace-only line after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, a directive line after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, a statement after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, a second comment line and a statement after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, a second comment line and a directive line after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a class definition, nothing after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a class definition, a statement after the comment line]
[test: a color that a semicolon touches before a U+2029 and a comment line in a style statement, nothing after the comment line]
[test: a color that a semicolon touches before a U+2028 and a comment line in a style statement, and a second style statement after the comment line]
[test: a directive line after two comment lines, to the end of the text, after a style statement and a U+2028]
[test: a directive line after an empty line, to the end of the text, after a style statement and a U+2028]
[test: a directive line and an empty line, to the end of the text, after a style statement and a U+2028]
[test: a no-break space between a color and the semicolon in a class definition that a line break joins stays as written]
[test: U+3000 between a color and the semicolon in a class definition that a line break joins stays as written]
[test: U+3000 and a character after a color in a class definition that a line break joins stays as written]
[test: a space between a color and the semicolon in a class definition that a line break joins is lower case]
[test: a color that a no-break space and a character follow in a class definition that a line break joins stays as written]
[test: block: whitespace-between-the-statements-of-a-row-on-a-line-that-a-ls-comment-line-joins]
[test: U+2028 between a composite head and its body]
[test: a comment line, a directive line, and a comment line, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: a comment line, a directive line, and a comment line, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: a comment line, a directive line, and a comment line, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: an empty line, a directive line, and a comment line, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: an empty line, a directive line, and a comment line, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: an empty line, a directive line, and a comment line, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a directive line, an empty line, and a comment line, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: a directive line, an empty line, and a comment line, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: a directive line, an empty line, and a comment line, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: two directive lines and a comment line, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: two directive lines and a comment line, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: two directive lines and a comment line, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a directive and a comment that touches it on a line, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: a directive and a comment that touches it on a line, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: a directive and a comment that touches it on a line, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a directive and a comment after spaces on a line, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: a directive and a comment after spaces on a line, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: a directive and a comment after spaces on a line, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a comment line that holds a directive, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped]
[test: a comment line that holds a directive, to the end of the text, after a class definition and a U+2029: the U+2029 is dropped]
[test: a comment line that holds a directive, to the end of the text, after a style statement whose color a semicolon touches and a U+2028: the U+2028 stays and the color is in lower case]
[test: a comment line, a directive line, and a statement, after a style statement and a U+2028: the U+2028 stays and the color is in lower case]
[test: an empty line, a comment line, and a statement, after a style statement and a U+2028: the U+2028 stays and the color stays as written]
[test: two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: two semicolons after a color and a U+2028, a statement follows, the color stays as written]
[test: two semicolons that a space separates after a color and a U+2028, to the end of the text, the color stays as written]
[test: two semicolons that a space separates after a color and a U+2028, a statement follows, the color stays as written]
[test: two semicolons after a color and a U+2029 in a class definition, to the end of the text, the color stays as written]
[test: a space between the semicolon and the U+2028, to the end of the text, the U+2028 stays and the color is in lower case]
[test: a space between the semicolon and the U+2028, a statement follows, the U+2028 stays and the color is in lower case]
[test: a tab between the semicolon and the U+2028, a statement follows, the U+2028 stays and the color is in lower case]
[test: a form feed between the semicolon and the U+2028, a statement follows, the U+2028 stays and the color is in lower case]
[test: a vertical tab between the semicolon and the U+2028, to the end of the text, the U+2028 stays and the color is in lower case]
[test: a vertical tab between the semicolon and the U+2028, a statement follows, the U+2028 stays and the color is as written]
[test: a no-break space between the semicolon and the U+2028, to the end of the text, the U+2028 stays and the color is in lower case]
[test: a no-break space between the semicolon and the U+2028, a statement follows, the U+2028 stays and the color is as written]
[test: a semicolon touching the color, a directive line, and a statement after the comment line: the color is in lower case]
[test: a semicolon touching the color, an empty line, and a statement after the comment line: the color is in lower case]
[test: a semicolon touching the color, a directive line, a comment line, and a statement after the comment line: the color is as written]
[test: a semicolon touching the color, a comment line, a directive line, and a statement after the comment line: the color is in lower case]
[test: a semicolon touching the color, an empty line, a comment line, and a statement after the comment line: the color is as written]
[test: a space and a vertical tab before a comma in a class definition that a line break joins, the first decides: the color is in lower case]
[test: a vertical tab and a space before a comma in a class definition that a line break joins, the first decides: the color is as written]
[test: a no-break space and a space before a comma in a class definition that a line break joins, the first decides: the color is as written]
[test: a space and a no-break space before a comma in a class definition that a line break joins, the first decides: the color is in lower case]
[test: a tab and a no-break space before a comma in a class definition that a line break joins, the first decides: the color is in lower case]
[test: a form feed and a no-break space before a comma in a class definition that a line break joins, the first decides: the color is in lower case]
[test: a no-break space and a form feed before a comma in a class definition that a line break joins, the first decides: the color is as written]
[test: a space and a vertical tab between a color and the semicolon in a class definition that a line break joins, the first decides: the color is in lower case]
[test: a vertical tab and a space between a color and the semicolon in a class definition that a line break joins, the first decides: the color is as written]
[test: a semicolon after a value that is no color, to the end of the text, after a style statement and a U+2028: the U+2028 and the line stay as written]
[test: a semicolon after a width, to the end of the text, after a style statement and a U+2028: the U+2028 and the line stay as written]
[test: a semicolon that a space separates from the color, to the end of the text, after a style statement and a U+2028: the U+2028 and the line stay as written]
[test: a semicolon after a color and a character, to the end of the text, after a style statement and a U+2028: the U+2028 and the line stay as written]
[test: a semicolon and a character after a value that is no color, to the end of the text, after a style statement and a U+2028: the U+2028 and the line stay as written]
[test: a semicolon after a value that is no color, to the end of the text, after a class definition and a U+2029: the U+2029 and the line stay as written]
[test: a semicolon after a value that is no color, a statement follows, after a style statement and a U+2028: the U+2028 and the line stay as written]
[test: no semicolon after a value that is no color, to the end of the text, after a style statement and a U+2028: the U+2028 is dropped and the colon gets a space]
[test: a vertical tab between two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: a no-break space between two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: a form feed between two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: a character between two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: a comma between two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: a character and spaces between two semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: three semicolons after a color and a U+2028, to the end of the text, the color stays as written]
[test: a line that holds only a semicolon after the comment line, after a style statement and a U+2028: the U+2028 stays and the color is as written]
[test: a line that holds a semicolon and a character after the comment line, after a style statement and a U+2028: the U+2028 stays and the color is as written]
[test: a directive and a semicolon on a line after the comment line, after a style statement and a U+2028: the U+2028 stays and the color is as written]
[test: an empty line and a line that holds only a semicolon after the comment line, after a style statement and a U+2028: the U+2028 stays and the color is in lower case]
[test: a directive line and a line that holds only a semicolon after the comment line, after a style statement and a U+2028: the U+2028 stays and the color is in lower case]
[test: a comment line and a line that holds only a semicolon after the comment line, after a style statement and a U+2028: the U+2028 stays and the color is as written]
[test: a node and no semicolon, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node with a label and no semicolon, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: an edge and no semicolon, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a width and no semicolon, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node and a semicolon, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node with a semicolon in its label, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge and a semicolon, to the end of the text, after a U+2028: the U+2028 stays]
[test: a width and a semicolon, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and a semicolon, to the end of the text, after a U+2029: the U+2029 stays]
[test: a semicolon inside a directive after a style, to the end of the text, after a U+2028: the U+2028 stays]
[test: a semicolon inside a comment after a style, to the end of the text, after a U+2028: the U+2028 stays]
[test: a semicolon inside a comment after a directive after a style, to the end of the text, after a U+2028: the U+2028 stays]
[test: a semicolon inside a directive after a node, to the end of the text, after a U+2028: the U+2028 stays]
[test: two semicolons, then a space before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons that a space separates, then a space before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons, then a tab before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons that a space separates, then a tab before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons, then a vertical tab and a space before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons that a space separates, then a vertical tab and a space before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons, then a character before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons that a space separates, then a character before the U+2028, to the end of the text, the color stays as written]
[test: two semicolons, then a space before the U+2028, a statement follows, the color stays as written]
[test: a semicolon that a character touches the line rule keeps, to the end of the text, after a style statement and a U+2028: the color stays as written]
[test: a semicolon that a comment touches the line rule keeps, to the end of the text, after a style statement and a U+2028: the color stays as written]
[test: a semicolon that a directive and a comment touches the line rule keeps, to the end of the text, after a style statement and a U+2028: the color stays as written]
[test: a semicolon that a vertical tab and a character touches the line rule keeps, to the end of the text, after a style statement and a U+2028: the color stays as written]
[test: a semicolon that a no-break space and a character touches the line rule keeps, to the end of the text, after a style statement and a U+2028: the color stays as written]
[test: a semicolon that a character touches, a statement follows with an empty line before it, the color stays as written]
[test: a semicolon that a character touches, in a class definition, after a U+2029, the color stays as written]
[test: a semicolon that only a directive touches, to the end of the text, the color is in lower case]
[test: a semicolon that only a directive touches, a statement follows right after the comment line, the color stays as written]
[test: a form feed and a character after a semicolon, a statement follows, the color is in lower case]
[test: spaces and a directive after a semicolon, a statement follows, the color is in lower case]
[test: a directive and spaces after a semicolon, a statement follows, the color is in lower case]
[test: a semicolon after a color and a comment after spaces, to the end of the text, the color is in lower case]
[test: the end of a composite block and a semicolon, to the end of the text, after a U+2028: the whole composite stays as written]
[test: the end of a composite block and a semicolon, to the end of the text, after a U+2029: the whole composite stays as written]
[test: the end of a composite block, a statement follows the comment line, after a U+2028: the whole composite stays as written]
[test: the end of a composite block and no semicolon, to the end of the text, after a U+2028: the U+2028 is dropped and the composite is formatted]
[test: a node and no semicolon, to the end of the text, after a U+2029: the U+2029 is dropped]
[test: a node and no semicolon, a statement follows the comment line, after a U+2028: the U+2028 stays]
[test: a node and a semicolon, a statement follows the comment line, after a U+2029: the U+2029 stays]
[test: a node and a semicolon in a comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and a comment that a space separates from it, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge and a comment that a space separates from it, a statement follows the comment line, after a U+2029: the U+2029 stays]
[test: a node and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: the end of a composite block and a comment that touches it, to the end of the text, after a U+2028: the whole composite stays as written]
[test: the end of a composite block and a comment after a space, to the end of the text, after a U+2028: the whole composite stays as written]
[test: the end of a composite block and a directive and a comment after a space, to the end of the text, after a U+2028: the whole composite stays as written]
[test: the end of a composite block and a directive that touches it, to the end of the text, after a U+2028: the U+2028 is dropped and the composite is formatted]
[test: the end of a composite block and a directive after a space, to the end of the text, after a U+2028: the U+2028 is dropped and the composite is formatted]
[test: a width and a comment after a space, to the end of the text, after a U+2028: the U+2028 stays]
[test: a width and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: a width and a directive, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: an empty block and a comment after a space, to the end of the text, after a U+2028: the U+2028 stays]
[test: an empty block and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: a block arrow and a comment after a space, to the end of the text, after a U+2028: the U+2028 stays]
[test: a block arrow and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node with a label and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node and a directive after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: an edge and a directive after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node, a directive, and a comment after a space, to the end of the text, after a U+2028: the U+2028 stays]
[test: a style statement and a comment after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a style statement and a comment that touches the color, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class definition and a comment after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class statement and a comment after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a style statement, a directive, and a comment, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a semicolon, a directive, and a semicolon after a color, to the end of the text, after a U+2028: the U+2028 stays and the color stays as written]
[test: a semicolon, a vertical tab, and a comment after a color, to the end of the text, after a U+2028: the U+2028 stays and the color stays as written]
[test: the head of a composite block and a comment that touches it, a statement follows the comment line, after a U+2028: the U+2028 stays and the head is formatted]
[test: the head of a composite block and a comment after a space, a statement follows the comment line, after a U+2028: the U+2028 stays and the head is formatted]
[test: a class definition and nothing, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class definition and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class definition and a directive after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class definition and a directive and a comment after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class statement and nothing, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class statement and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class statement and a directive after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a class statement and a directive and a comment after a space, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node, a directive after a space and a comment that touches the directive, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge, a directive after a space and a comment that touches the directive, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge and a directive that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node with a width and a comment after a space, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node with a width and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node with a width and a directive that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: an edge with a width and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node and a tab before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and a run of spaces before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and a no-break space before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and U+3000 before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and a vertical tab before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and a form feed before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node and U+FEFF before the comment, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node, a comment line, and a second U+2028 and a comment, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node, a comment line, and a second U+2028 and nothing, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node, a comment line, and a second U+2028 and the text of a statement, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node, a comment line, and a U+2029 inside it, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node, a U+2029, a comment line, and a U+2028 inside it, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node and a comment line that holds two more U+2028, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a style statement, a comment line, and a second U+2028 and a comment, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node and a comment that touches it, a comment line that holds a U+2028, to the end of the text: the first U+2028 or U+2029 is dropped and the second stays]
[test: a node and a comment after a space, a comment line that holds a U+2028, to the end of the text: the first U+2028 stays]
[test: a node and a semicolon, a comment line, and a second U+2028 and a comment, to the end of the text: the first U+2028 stays]
[test: a node and two U+2028 before a comment line, to the end of the text: both are dropped]
[test: a style statement and two U+2028 before a comment line, to the end of the text: both are dropped]
[test: an edge to a node with a label and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge with a width to a node with a label and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: a node with a round label and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge with a label to a node with a label and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: a chain of edges to a node with a label and a comment that touches it, to the end of the text, after a U+2028: the U+2028 stays]
[test: an edge from a node with a label to a node and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: an edge with a label to a node and a comment that touches it, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: two nodes in a row and a comment that touches the last, to the end of the text, after a U+2028: the U+2028 is dropped]
[test: a node and a comment after a space, two U+2028 before a comment line, to the end of the text: both stay]
[test: a node and a semicolon, two U+2028 before a comment line, to the end of the text: both stay]
[test: a node, two U+2028 before a comment line, a statement follows: both stay]
[test: a node and two U+2029 before a comment line, to the end of the text: both are dropped]
[test: a node and a comment after a space, two U+2029 before a comment line, to the end of the text: both stay]
[test: a node and a comment that touches it, two U+2028 before a comment line, to the end of the text: both are dropped]

### 空白文字

タブ、垂直タブ、改ページ、U+00A0、U+3000、U+FEFF は、単位の間の空白です。
印字が空白を選ぶ所では、空白の連なりと同じに空白 1 つにし、
行頭と行末では落とします。
ラベルの中では文字で、そのまま残ります。
U+0085 は mermaid.js にとって空白ではなく、前後の単語を 1 つの id にし、
書かれた場所に残ります。

[test: U+00A0 between two statements of a row]
[test: U+00A0 at the ends of a line]
[test: a tab, a vertical tab, a form feed, U+3000, and U+FEFF between units]
[test: U+00A0 around the arrow of an edge]
[test: U+00A0 between an id and its shape]
[test: U+00A0 before the directions of a block arrow] [test: U+00A0 in a label]
[test: U+00A0 in a class definition] [test: U+00A0 in a style]
[test: U+00A0 inside an empty description block]
[test: U+00A0 in a composite head] [test: U+0085 inside an id]

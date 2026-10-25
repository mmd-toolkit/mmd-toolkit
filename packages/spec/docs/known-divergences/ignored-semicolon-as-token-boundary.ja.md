# ignored-semicolon-as-token-boundary

英語版:
[ignored-semicolon-as-token-boundary.md](./ignored-semicolon-as-token-boundary.md)

図種: flowchart、sequence、class、state、er、gantt、journey、requirement、
mindmap、timeline、xychart、quadrant、block、kanban、c4、venn、agentflow、
usecase、pie、gitgraph・info・packet・architecture。
この仕様の mermaid.js からの
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

`style` を含み、その後に `:` と、空白でない 0 個以上の文字と、`#` があり、
さらにその後に `;` がある行は、`style` の規則に当たり、
その最後の `;` は無視されます。
mermaid.js もこの仕様も、それを読みません
（[`style` と `classDef` の行](../common.ja.md#style-行と-classdef-行)
を参照）。
その後、`style` の規則が無視した `;` を除いた行に対して、
`style` を `classDef` に替えて同じことを行うので、
1 つの行に無視される `;` が 2 つあることもあります。
[fixture: common/entity-style-then-classdef-rule]

この規則は、`style A fill:#f00;` のように色を終える `;` によって、
色が [エンティティ](../common.ja.md#エンティティ)
（`#name;` の形の文字参照）として
解釈されるのを防ぐものです。

規則はテキストだけを見るので、無視される `;` は行のどこにでもありえます。
ラベルの中、2 つの語の間、
名前、数、キーワード、矢印、区切り記号の中です。
この文書は、最後のものについてのものです。
ここでの名前は、空白を含みうるかどうかにかかわらず、
図の文書が名前の単位と数えるものです。
U+00A0 を含みうる ER の実体の名前も、その 1 つです。
sequence 図の参加者の id、クラスの名前、
`~` を使って書いた ER の属性の語、要求図の引用符なしの名前、
マインドマップのノードのテキストのように、
図の文書がテキストの単位と数える名前は、無視される `;` を持てます。
[fixture: sequence/tokens-ignored-semicolon-separator-line-feed]
[fixture: class/tokens-ignored-semicolon-in-relation-name]
[fixture: er/div-ignored-semicolon-in-name]
[fixture: er/tokens-ignored-semicolon-in-tilde-word]
[fixture: requirement/tokens-ignored-semicolon-in-name]
[fixture: mindmap/tokens-ignored-semicolon-in-node-text]

## 差異

どの例も、図の全体です。

1. 名前の中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x] --> B;b
   ```

2. 数の中の無視される `;`:

   ```mmd
   sequenceDiagram
     participant Z@{ "style": "x:#y" };autonumber 1;0
     A->>B: m
   ```

3. キーワードの中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x];sub;graph S
     B
     end
   ```

4. 矢印の中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x] -;-> B
   ```

5. 区切り記号の中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x]::;:c
   ```

6. ラベルのテキストの中の無視される `;`:

   ```mmd
   flowchart LR
     A[style:#x ; y]
   ```

| 例                                                            | mermaid.js                                     | この仕様 |
| ------------------------------------------------------------- | ---------------------------------------------- | -------- |
| 1                                                             | A から頂点 `Bb` への辺                         | 拒否     |
| 2                                                             | 10 から始まるメッセージの番号                  | 拒否     |
| 3                                                             | subgraph S                                     | 拒否     |
| 4                                                             | `A --> B` と同じ、A から B への辺              | 拒否     |
| 5                                                             | クラス c を持つ頂点 A                          | 拒否     |
| 6                                                             | ラベル `style:#x`、空白 2 つ、`y` を持つ頂点 A | 同じ     |
| [fixture: flowchart/div-ignored-semicolon-in-id]              |
| [fixture: sequence/div-ignored-semicolon-in-autonumber-start] |
| [fixture: flowchart/div-ignored-semicolon-in-keyword]         |
| [fixture: flowchart/div-ignored-semicolon-in-arrow]           |
| [fixture: flowchart/div-ignored-semicolon-in-triple-colon]    |
| [fixture: flowchart/tokens-ignored-semicolon-label-spaces]    |

つまり mermaid.js は、そのような入力を、どれも `;` のない行として読みます。
この仕様もそうしますが、
名前、数、キーワード、矢印、区切り記号は、
中に無視される `;` を持てません。
そのような入力は拒否されます。
差異は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理することはなく、
どちらも受理する入力には、すべて同じ Db を与えます。

state 図では、無視される `;` は、
`style`、`:`、`#` を持てる `state` の後の名前の中に置けます。
mermaid.js は、本体の続く `state style:#x;B` を合成状態 `style:#xB` と読み、
この仕様はそれを拒否します。
[fixture: state/div-ignored-semicolon-in-state-name]
[fixture: state/div-ignored-semicolon-in-state-name-without-body]

`style`、`:`、`#` を持てるほかの文は、行の残りをテキストとして読みます。
ER 図では、`style`、`:`、`#` は、`;` より前の行のどこにあってもかまいません。
`Bstyle` のような実体の名前、関係の `:` とロール `"#"`、
属性のコメント `"c:#"` などです。
そのため、無視される `;` は、名前、数、濃度、関係の線、キーワード、`:::`、
属性ブロックの語やキーの中に置けます。
mermaid.js は `A ||--o{ Bstyle :"#" C;D` を Bstyle への関係と実体 `CD` と読み、
この仕様はそれを拒否します。
[fixture: er/div-ignored-semicolon-in-name]
[fixture: er/div-ignored-semicolon-in-attribute-word]
[fixture: er/div-ignored-semicolon-in-relationship-line]

ガントチャートでは、`style`、`:`、`#` は、click の文の URL 文字列や
コールバック引数、その行の文の前の説明ブロック、click の id そのものに
置けるので、無視される `;` は click の id、キーワード、
`includes` や `excludes` の項目の中に置けます。
mermaid.js は `click style:#y,id;1 href "u"` を `id1` のリンクと読み、
`click id1 href "style:#x" ca;ll f()` を call と読み、
この仕様はそれらを拒否します。
[fixture: gantt/div-ignored-semicolon-in-click-id]
[fixture: gantt/div-ignored-semicolon-in-call-keyword]
[fixture: gantt/div-ignored-semicolon-in-list-item]

ユーザージャーニー図では、`#` はタイトルのテキスト、section のテキスト、
タスクのテキスト、タスクのデータを終えてコメントを始めるので、
`style`、`:`、`#` はその行の文の前の説明ブロックにあり、
無視される `;` はキーワードの中に置けます。
mermaid.js は `accDescr { style:#x } ti;tle T` をタイトル `T` と読み、
`accDescr { style:#x } sec;tion S` を section `S` と読み、
この仕様はそれらを拒否します。
[fixture: journey/div-ignored-semicolon-in-title-keyword]
[fixture: journey/div-ignored-semicolon-in-section-keyword]

要求図では、`style`、`:`、`#` は `;` の前の、
`"style:#x"` のような文字列の名前に置けるので、
無視される `;` はキーワードの中に置けます。
mermaid.js は `"style:#x" - sati;sfies -> b` を関係 `satisfies` の関係と読み、
この仕様はそれを拒否します。
[fixture: requirement/div-ignored-semicolon-in-relationship-keyword]

マインドマップでは、`style`、`:`、`#` は `;` の前の
ノードのテキストに置けるので、
無視される `;` は開きか閉じの中に置けます。
mermaid.js は `style:#x{;{b}}` を六角形の形でテキスト `b` のノードと読み、
この仕様はそれを拒否します。
[fixture: mindmap/div-ignored-semicolon-in-opener]

timeline では、ユーザージャーニー図と同じく、
`style`、`:`、`#` はその行の文の前の説明ブロックにあり、
無視される `;` はキーワードの中に置けます。
mermaid.js は `accDescr { style:#x } ti;tle T` をタイトル `T` と読み、
`sec;tion S` と `accTi;tle: T` も同じで、この仕様はそれらを拒否します。
[fixture: timeline/div-ignored-semicolon-in-title-keyword]
[fixture: timeline/div-ignored-semicolon-in-section-keyword]
[fixture: timeline/div-ignored-semicolon-in-acc-title-keyword]

XY chart では、`style`、`:`、
`#` は `"style:#a"` のように `;` の前の文字列の中に置けるので、
無視される `;` は値やキーワードの中に置けます。
mermaid.js は `line "style:#a" [1;2]` を値 12 の line として、
`title "style:#a" li;ne [1]` をタイトルと line として読み、
この仕様はそれらを拒否します。
[fixture: xychart/div-ignored-semicolon-in-value]
[fixture: xychart/div-ignored-semicolon-in-keyword]

quadrant chart では、`style` か `classDef`、`:`、`#` は、
名前である `classDef` のクラスの名前の中に置けるので、
無視される `;` は名前の中に置かれます。
mermaid.js は `classDef style:#x;y color: #f00` をクラス `style:#xy` と読み、
この仕様はそれを拒否します。
[fixture: quadrant/div-grid-style-classdef-name]

block diagram では、`style`、`:`、`#` は、ラベル `"style:#a"` のように
`;` の前の文字列の中に置けるので、
無視される `;` は id やキーワードの中に置けます。
mermaid.js は `A["style:#a"] B;C` を id `BC` で、
`A["style:#a"] col;umns 2` を `columns 2` で読み、この仕様はそれらを拒否します。
[fixture: block/div-ignored-semicolon-in-id]
[fixture: block/div-ignored-semicolon-in-keyword]

各図の文書は、これがどこに表れるかを、既知の差異の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差異)、
[sequence](../diagrams/sequence.ja.md#既知の差異)、
[class](../diagrams/class.ja.md#既知の差異)、
[state](../diagrams/state.ja.md#既知の差異)、
[er](../diagrams/er.ja.md#既知の差異)、
[gantt](../diagrams/gantt.ja.md#既知の差異)、
[journey](../diagrams/journey.ja.md#既知の差異)、
[requirement](../diagrams/requirement.ja.md#既知の差異)、
[mindmap](../diagrams/mindmap.ja.md#既知の差異)、
[timeline](../diagrams/timeline.ja.md#既知の差異)、
[xychart](../diagrams/xychart.ja.md#既知の差異)、
[quadrant](../diagrams/quadrant.ja.md#既知の差異)、
[block](../diagrams/block.ja.md#既知の差異) です。

kanban では開きと閉じの中で選ばれたセミコロンは区切りを分断し、
入力を拒否させます。
mermaid.js は `style:#x{;{b}}` と `style:#x{{b};}` を、
`style:#x{{b}}` と同じ形として受理します。
[fixture: kanban/div-semicolon-opener]
[fixture: kanban/div-semicolon-closer]
[fixture: kanban/gram-semicolon-text-reference]

ノード本文、ラベル本文、文字列、データ本文の中では、
選ばれたセミコロンを無視します。
[fixture: kanban/lex-id-style-rule]
[fixture: kanban/lex-id-classdef-rule]
[fixture: kanban/lex-label-style-rule]
[fixture: kanban/lex-metadata-style-rule]

次の行のセミコロンは選びません。
`style:#x` の行の後の `::ic;on` はノード本文です
（[単位の中のディレクティブ](../diagrams/kanban.ja.md#単位の中のディレクティブ)
を参照）。
[fixture: kanban/lex-label-style-rule-other-line]
[fixture: kanban/lex-semicolon-icon-marker]

C4 の `accDescr { style:#x }Pers;on(a,"A")` は、
選択された `;` が呼び出し語の内部にあるためここでは拒否し、
mermaid.js は除いて呼び出しを受理します。
[fixture: c4/div-semicolon-call-keyword-after-block]

裸の引数や名前付きキーの内部の選択された `;` は前置きとなり、
`=` と開き引用符の間のものは区切りの間の前置きとなります。
[fixture: c4/lex-semicolon-text-selected]
[fixture: c4/lex-semicolon-key-selected]
[fixture: c4/lex-semicolon-delimiter-selected]

venn では、
名前、size、text id、文のキーワード、プロパティキー、
裸の style 値の識別子か数の中の選ばれたセミコロンをここでは拒否します。
[fixture: venn/div-ignored-semicolon-set-name-selected]
[fixture: venn/div-ignored-semicolon-size]
[fixture: venn/div-ignored-semicolon-text-id-selected]
[fixture: venn/div-ignored-semicolon-text-number-selected]
[fixture: venn/div-ignored-semicolon-set-keyword-selected]
[fixture: venn/div-ignored-semicolon-title-keyword-selected]
[fixture: venn/div-ignored-semicolon-style-key-selected]
[fixture: venn/div-ignored-semicolon-style-value-selected]

mermaid.js はその前後を連結します。
[fixture: venn/div-ignored-semicolon-set-name-selected]
[fixture: venn/div-ignored-semicolon-size]
[fixture: venn/div-ignored-semicolon-text-id-selected]
[fixture: venn/div-ignored-semicolon-text-number-selected]
[fixture: venn/div-ignored-semicolon-set-keyword-selected]
[fixture: venn/div-ignored-semicolon-title-keyword-selected]
[fixture: venn/div-ignored-semicolon-style-key-selected]
[fixture: venn/div-ignored-semicolon-style-value-selected]
[fixture: venn/div-ignored-semicolon-style-value-number-selected]

venn の色全体の単位の内部で選ばれたセミコロンは trivia で、
この差異を生じません。
[fixture: venn/lex-style-hex-ignored-semicolon]
[fixture: venn/lex-style-rgb-ignored-semicolon]

## 書き手にとっての結果

名前、数、キーワード、矢印、区切り記号の中の無視される `;` は、
mmd-toolkit のパーサーでは拒否されます。
mermaid.js はそれを受理し、`;` がないものとして行を読みます。
どちらも同じに読む図を書くには、
`style` の規則に当たる行は `;` で終えるか、語の中に `;` を書かないでください。

## mermaid.js がそう読む理由

mermaid.js は、図を読む前に、行のテキストから `;` を除きます
（[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917)）。
各図種の字句解析器は、その後に残ったテキストを読み、
`;` がどこにあったかを知りません。
名前や矢印の途中にそのような `;` を挟めるのは、
この処理の順から生じます。

## この仕様の規則と、その理由

この仕様では、無視される `;` はソースに残り、
字句解析器はそれがないものとして読み進めます。
それは、ディレクティブと同じく、テキストと文字列の中と、
2 つの単位の間にあってかまいません
（[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
を参照）。
名前、数、キーワード、矢印、区切り記号は、そのテキスト全体を表し、
その中の無視される `;` は入力を拒否にします。

テキストと文字列は、もともと断片に切られることがあります。
コメント領域がその中にあることがあり、
その値は、コメント領域と同じく、中の無視される `;` を除きます
（[ノード](../ast.ja.md#ノード) を参照）。
この仕様は、名前、数、キーワード、矢印、区切り記号のトークンを、
無視される `;` で切りません。
どれも、そのテキスト全体として読まれます。
mermaid.js がその中の無視される `;` を読めるのは、
読む前の段階として `;` を除くからで、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

### Agentflow

agentflow では、id、クラス名、click の id、辺の id、linkStyle の番号、
キーワード、矢印、複合区切りの内部の選ばれたセミコロンを、
EmptyStatement では保持できません。
その不可分の単位を分けるか、値を変える必要があるためです。
mermaid.js は両側を結合しますが、
既存の全体の単位の直接の規則は理由 2 で拒否します。
[fixture: agentflow/div-ignored-semicolon-in-id]
[fixture: agentflow/div-ignored-semicolon-in-css-class]
[fixture: agentflow/div-ignored-semicolon-in-click-id]
[fixture: agentflow/div-ignored-semicolon-in-edge-id]
[fixture: agentflow/div-ignored-semicolon-in-linkstyle-number]
[fixture: agentflow/div-ignored-semicolon-in-keyword]
[fixture: agentflow/div-ignored-semicolon-in-arrow]
[fixture: agentflow/div-ignored-semicolon-in-data-block-start]

名前のテキスト、ラベル、style、不透明な metadata のキーは、
選ばれたセミコロンを trivia に保てます。
その位置では Identifier の境界ではありません。
完全な縦棒の境界のセミコロンも単位を変えません。
これらの対照例に印は付けません。
[fixture: agentflow/lex-ignored-semicolon-in-flow-name-text]
[fixture: agentflow/lex-ignored-semicolon-in-metadata-key]
[fixture: agentflow/lex-ignored-semicolon-in-pipe-boundary]

### Usecase

usecase で対象となるテキストは、CSS プロパティ名の語を含む原子的な名前、
キーワード、矢印、区切りの内部で選ばれた `;` の 1 文字の範囲です。
空の文は原子的な単位の内部に置けません。
mermaid は結合した id、include、矢印、metadata のキーと値、区切りを受理します。
直接の完全な単位の規則により理由 2 で拒否します。
この規則によって mermaid の拒否が受理に変わることはありません。
[fixture: usecase/div-semicolon-identifier-selected]
[fixture: usecase/div-semicolon-keyword-selected]
[fixture: usecase/div-semicolon-joins-arrow-selected]
[fixture: usecase/div-semicolon-native-key-valid]
[fixture: usecase/div-semicolon-native-value-selected]
[fixture: usecase/div-semicolon-native-opener-selected]
[fixture: usecase/div-semicolon-css-property-selected]
[fixture: usecase/div-semicolon-stereotype-closer-selected]
[fixture: usecase/lex-semicolon-stereotype-closer-control]

`style` と `classDef` の CSS プロパティ名では、
`--` と後の語の間の HWS にある、選ばれた `;` を trivia として受理します。
UsecaseIdentifier に前後のテキストを保持できます。
セミコロンの有無によらず `--` と語は別々の単位なので、
結合するものがなく理由 2 を適用しません。
[fixture: usecase/lex-semicolon-css-name-gap]
[fixture: usecase/lex-semicolon-classdef-css-name-gap]

ラベル、CSS 値、文字列、不透明な JSON は既存のテキスト節点で保持でき、
選ばれたセミコロンを trivia として扱えます。完全な単位間でも許します。
選択の引き金より前のセミコロンや、結合後も別の理由で無効な図は、
差異の印を付けない通常の拒否です。
[fixture: usecase/lex-semicolon-complete-unit-boundary]
[fixture: usecase/lex-semicolon-css-number-text]
[fixture: usecase/lex-semicolon-joins-id-selected]
[fixture: usecase/lex-semicolon-native-key-selected]

### Pie

PieIgnoredText は、数やキーワード内の任意の文字ではなく、
隠れた YAML や DIRECTIVE の形全体を持ちます。
そのため、`1;2`、`title`、`showData`、`accTitle`、`accDescr` の中の
選ばれたセミコロンには、その場所で持つノードがありません。
直接の規則は、断片をつなぐ代わりに境界にします。
下の fixture では、`style` や `classDef` の印が原子内のセミコロンも選びます。
隠れた DIRECTIVE がその印を囲んでいても、
共通の行規則は同じ行の後のセミコロンを選びます。
mermaid.js はつないだ原子を受理し、この仕様は拒否します。
この規則が加える逆方向の pie の入力はありません。
ラベルや値の中のセミコロンは、共通の無視したセミコロンの記録とともに、
書かれたテキストを保ちます。
隠れたブロック内の無視するセミコロンは、ブロックを分割しません。
結果が一致するこれらの形には印を付けません。
[fixture: pie/div-atomic-semicolon-number]
[fixture: pie/div-selected-semicolon-title-keyword]
[fixture: pie/div-selected-semicolon-showdata]
[fixture: pie/div-selected-semicolon-acctitle]
[fixture: pie/div-selected-semicolon-accdescr]
[fixture: pie/div-selected-semicolon-block-keyword]
[fixture: pie/style-label-trigger]
[fixture: pie/style-title-trigger]
[fixture: pie/lex-yaml-opener-selected-semicolon]

### Gitgraph

読み飛ばす完全な形はノードになりますが、
語・参照・整数の中の任意のセミコロンは、別の単位として持てません。
これらの内部で選択されたセミコロンは、Mermaid では綴りをつなぎますが、
理由 2 によりこの仕様では拒否し、逆方向の受理はありません。
option の語とコロンの境界や完全な数の後なら trivia です。
選択されないセミコロンは両方で拒否します。
[fixture: gitgraph/div-style-semicolon-in-order-keyword]
[fixture: gitgraph/div-style-semicolon-in-order-number]
[fixture: gitgraph/div-lex-selected-semicolon-type-word]
[fixture: gitgraph/div-lex-selected-semicolon-bare-reference-valid]
[fixture: gitgraph/lex-selected-semicolon-option-word-colon]
[fixture: gitgraph/lex-selected-semicolon-number-control]
[fixture: gitgraph/lex-selected-semicolon-reference]

### Info

選ばれたセミコロンの 1 文字の範囲は共通のトリビアにできますが、文や無視テ
キストの兄弟を固定キーワードの内部には置けません。理由 2 により showInfo・
title・accTitle・両方の accDescr の内部の選ばれたセミコロンを拒否しますが、
Mermaid は結合します。逆方向の受理はありません。完全な構成要素の境界や隠れたテ
キスト・値では一致します。選ばれないセミコロン、選択前に拒否される分割した見出
し、別の不正な接尾には印を付けません。 [fixture: info/div-selected-showinfo]
[fixture: info/div-selected-title] [fixture: info/div-selected-acctitle]
[fixture: info/div-selected-accdescr-line]
[fixture: info/div-selected-accdescr-block]
[fixture: info/lex-selected-colon-boundary]
[fixture: info/lex-selected-brace-boundary]
[fixture: info/lex-hidden-opener-selected] [fixture: info/lex-selected-header]
[fixture: info/lex-selected-keyword-rejected-tail]
[fixture: info/end-header-semicolon]

### Packet

選ばれた文字は trivia だが、固定語や整数を分割できない。
完全な構成要素の境界や hidden な句読点には置ける。
検出は選択より先なので、分割された見出しは差異に至る前に拒否され得る。
[fixture: packet/div-selected-title-interior]
[fixture: packet/div-selected-acctitle-interior]
[fixture: packet/div-selected-accdescr-line-interior]
[fixture: packet/div-selected-accdescr-block-interior]
[fixture: packet/div-selected-integer-interior]
[fixture: packet/lex-selected-colon-boundary]
[fixture: packet/lex-selected-brace-boundary]
[fixture: packet/lex-yaml-fence-selected]
[fixture: packet/detect-selected-split-header]

### Architecture

architecture では、style と色を含む service の label により、
共通の行規則が後方の親 id または in の keyword 内の semicolon を選び得る。
mermaid は id/keyword をつなぐが、本仕様は切れた atom を拒否する。
名前や keyword の内部には ArchitectureIgnoredText を置けない。
text の値の内部で選ばれた semicolon は共通の読みに従い、
原文の範囲は元の文字を覆う。
[fixture: architecture/div-semicolon-parent-id]
[fixture: architecture/div-semicolon-in-keyword]
[fixture: architecture/gram-semicolon-parent-reference]
[fixture: architecture/style-fields]

## mermaid.js の文書と issue

- [flowchart](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1237-L1237)
  の文書は、`;` を `style`、`classDef`、`linkStyle` の行の終わりにだけ示し、
  名前や矢印の中の `;` には触れていません。
- [Issue #1666](https://github.com/mermaid-js/mermaid/issues/1666)
  「Flowchart: linkStyle issues with hex colors」は、
  `#ff9900;` がエンティティとして読まれて
  `linkStyle 0 stroke:#ff9900;` が拒否されたことを報告しています。
  2026-10-03 の時点で閉じていて、
  ラベルは `Type: Bug / Error` と `Status: Triage` です。
  無視される `;` の規則が扱う場合に当たります。
- [Issue #7140](https://github.com/mermaid-js/mermaid/issues/7140)
  「Error on invalid syntax of style」は、
  書き手が CSS のように `classDef` に書いた `;` を知らせることを提案しています。
  2026-10-03 の時点で開いていて、
  ラベルは `Type: Bug / Error` と `new parser` です。
- 名前、数、キーワード、矢印、区切り記号の中の `;` についての
  issue と pull request は見つかりませんでした。
  問いは `semicolon`、`semicolon style`、`semicolon arrow`、
  `semicolon flowchart`、`semicolon in style`、`semicolon link`、
  `encodeEntities`、`classDef semicolon`、`semicolon entity` で、
  2026-10-03 に検索しました。

- 固定した版の

[C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L43-L49)
は `UpdateElementStyle` と `UpdateRelStyle` を `;` なしで示し、
呼び出し語の内部から除かれる `;` を説明していません。
`mermaid-js/mermaid` の issue と pull request を、
2026-10-21 に `C4 semicolon in:title,body`、
`C4 encodeEntities in:title,body` で検索したところ、
[PR #8039](https://github.com/mermaid-js/mermaid/pull/8039)
が見つかりました。
この PR はタイトルと説明の `#` の扱いを変え、
それらの値を `;` が終える規則は維持すると明記しています。
C4 のキーワード内の選択された `;` を扱う issue や pull request は、
見つかりませんでした。

- ピン留めした

[venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
はプロパティをカンマで区切り、
キーワード、名前、数の内部のセミコロンは示していません。
2026-10-21 に `mermaid-js/mermaid` の issue と PR を
`venn semicolon in:title,body` で検索し、結果は 0 件でした。

- 固定版の

[Agentflow の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L108-L118)
はノードの宣言を flowchart の構文とし、括弧のラベルを示します。
キーワード、id、矢印の内部の選ばれたセミコロンの除去は説明していません。
2026-10-22 に `mermaid-js/mermaid` の issue と pull request を
`agentflow semicolon in:title,body` で検索した結果は 0 件でした。

- pin の
  [usecase 文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  は文の構文を説明します。
  2026-10-22 に mermaid-js/mermaid の issue と PR を
  `usecase semicolon` で検索し、
  この受理挙動を保守者が欠陥と判断したと示す報告は、
  調べた結果にはありませんでした。
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048) は
  Type: Enhancement で、2026-08-14 にマージ済みで閉じています。
  Chevrotain parser、モデル検証、JSON の表を導入します。
  この差異は共有の直接の規則に従うもので、
  bug ラベルを文法変更の承認とは読みません。

- pie の pin した
  [構文文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  に `style` 文と `classDef` 文はありません。
  2026-10-23 に `pie`、`pie semicolon`、`pie classDef` で検索しましたが、
  選ばれたセミコロンが pie の原子の断片をつなぐことへの保守者の判断は
  見つかりませんでした。
  これは共通の境界規則に従い、欠陥という分類を主張しません。

gitgraph の
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
は、
見出しと各コマンドを説明します。
2026-10-23 に issue・PR を `gitGraph`、`gitGraph directive`、
`gitGraph YAML`、`gitGraph semicolon`、`gitGraph keyword`、
`gitGraph duplicate`、`gitGraph cherry-pick` で検索しました。
確認した結果には、この共通の境界を決定するものはありませんでした。
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) は終了済みで
Status: Approved が付き、
merge 済みの [#6707](https://github.com/mermaid-js/mermaid/pull/6707) は
重複 ID の警告を加えます。これらから追加の差異は作りません。

- info には専用の構文ページがなく、pin した
  [構文の参照](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  は図種の宣言と percent コメントを説明します。2026-10-23 に `info showInfo`・
  `info directive`・`info semicolon`・`info accTitle` で issue と PR を検索しま
  した。[#7601](https://github.com/mermaid-js/mermaid/issues/7601) は
  info/showInfo の描画を報告し、open、Type: Bug / Error、Status: Triage でした。
  検査した結果には、この構文の拒否を決める info 固有の保守者の判断はありません。
  この節は既存の直接の規則に従います。

- pin の
  [packet の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  は単一位置・範囲・相対 count を示します。
  この前処理の境界については定めていません。
  2026-10-25 に `packet bitsPerRow`、`packet fractional`、
  `packet maxPacketSize` で公式 repository の issue・PR を検索しましたが、
  ここでの差異に関する maintainer の判断を示す結果は見つかりませんでした。

- pinned の
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175) は見出し・宣言・辺を説明するが、
  この共通の前処理の境界を定義しない。
  2026-10-25 に公式の issue/PR を architecture group undefined、
  architecture quotes title、architecture reverse、architecture unclosed、
  architecture align で検索した。
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) は
  Open、Status: Approved で、外側の親 group の辺を扱う報告である。
  今回の共通境界に対する maintainer の判断とはしない。

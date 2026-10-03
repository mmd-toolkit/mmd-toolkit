# tokenless-empty-forms

英語版: [tokenless-empty-forms.md](./tokenless-empty-forms.md)

図種: flowchart、sequence、class、state。
これは、この仕様の mermaid.js との
[既知の差](../known-divergences.ja.md) の 1 つです。

## 構文

書かれているのに何も持たない形があります。
flowchart では 3 つです。

- **空の文字列**。`""` か、空のマークダウンの文字列です。
- **空の呼び出し**。`click A call ()` のように、`call` とその後の空白に、
  間に空白しかない括弧が続くものです。
- **空の説明ブロック**。括弧の間に空白しかない `accDescr {}` です。

文字列も `call` も文法にない sequence では、空の説明ブロックだけです。
`call` を持たず、クリックの文が文字列を取る文の文脈では
字句解析器が `""` をトークンのある文字列の単位として読む state も同じです。
[fixture: state/lex-string-outside-click] [fixture: state/gram-click-terminal]
`state` が入る state の文脈でも、
mermaid.js は空の文字列にトークンを読みませんが、
そこでそれが現れるのは単位が始まるところだけで、
木はそのどの場所でも、それを持ちます。
名前の前と後、本体の前、別名の文の文字列の前と後では StateIgnoredText として、
`state` の後か行の中のほかの文の後では StateIgnoredStatement として持ちます
（[state の文字列の文脈](../diagrams/state.ja.md#state-の文脈) を参照）。
そのため、そのような入力は mermaid.js と同じく受理され、この差には入りません。
[fixture: state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-state-empty-strings-around-alias-string] [fixture:
state/gram-state-empty-string-after-name]
class では 5 つです。
flowchart の 3 つと、クラスの名前の中に書く 2 つ、
つまり、2 つのバッククォートである**空のバッククォートの名前**と、
2 つの `~` である**空のジェネリクスの型**です。

それだけの行の空の説明ブロックは、そのふつうの書き方で、
何も変えない説明ブロックの文です。

```mmd
flowchart LR
  accDescr { }
  A
```

[fixture: flowchart/gram-acc-descr-block-empty]

この文書は、この仕様の木にそれらの場所がないところ、
つまり文の中や、値の中のほかのテキストの隣にある、これらの形についてのものです。

## 差

どの例も、図の全体です。

1. ラベルのテキストの前の空の文字列:

   ```mmd
   flowchart LR
     A[""x]
   ```

2. コールバックの名前の前の空の呼び出し:

   ```mmd
   flowchart LR
     A
     click A call ()cb
   ```

3. ラベルの全体としての空の文字列:

   ```mmd
   flowchart LR
     A[""]
   ```

4. 矢印と id の間の空の説明ブロック:

   ```mmd
   sequenceDiagram
     A->>accDescr {}B: x
   ```

5. 同じ行のメッセージの前の空の説明ブロック:

   ```mmd
   sequenceDiagram
     accDescr {} A ->> B: x
   ```

6. クラスの名前の中の空のバッククォートの名前:

   ```mmd
   classDiagram
     class A``B
   ```

7. 文の始めの空の文字列:

   ```mmd
   classDiagram
     "" A --> B
   ```

8. 多重度としての空の文字列:

   ```mmd
   classDiagram
     A "" --> B
   ```

| 例  | mermaid.js                             | この仕様                           |
| --- | -------------------------------------- | ---------------------------------- |
| 1   | ラベル `x` を持つ頂点 A                | 拒否                               |
| 2   | `click A cb` と同じく A が `cb` を呼ぶ | 拒否                               |
| 3   | 拒否                                   | 拒否                               |
| 4   | A から B へのメッセージ                | 拒否                               |
| 5   | A から B へのメッセージ                | 空の説明ブロックと、そのメッセージ |
| 6   | クラス `AB`                            | 拒否                               |
| 7   | A から B への関係                      | 拒否                               |
| 8   | A から B への関係                      | A の側に空の多重度を持つ関係       |

[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] [fixture:
flowchart/gram-label-empty-string] [fixture:
sequence/gram-empty-description-block-after-arrow] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] [fixture:
class/div-empty-backquoted-in-name] [fixture:
class/div-empty-string-statement-start] [fixture: class/gram-cardinality-empty]

つまり mermaid.js は、これらの形のある入力を、その形がないものとして読みます。
残ったものが受理されるところなら、どこでもその入力を受理します。
文の間、文の中、ラベル・スタイル・サブグラフの名前の中のほかのテキストの隣、
クリック文の id の前、ヘッダーのキーワードのすぐ後です。
残ったものが受理されないところでは、入力を拒否します。
例 3 のように形が値の全体であるところと、
`A --""> B` や `linkStyle 0""0 stroke:red` のように、
字句解析器が 1 つのトークンとして読むもの、
たとえば矢印や数の中にあるところです。
[fixture: flowchart/lex-empty-string-in-arrow]
[fixture: flowchart/gram-linkstyle-number-empty-string]

class の 1 つの形は、別に読まれます。
mermaid.js は class の方向の行を、
`direction`、空白、値にまたがる 1 つの規則で読むので、
その間の空の説明ブロックはその規則が当たるのを妨げ、
mermaid.js は `direction` と値を、メンバーの文の 2 つの名前の部分として読み、
空白なしでつなぎます。
`direction accDescr {} LR` は方向を `TB` のままにしてクラスを宣言せず、
`direction LR` は `LR` にします。
`direction accDescr {} LR : x` は、
メンバー `x` を持つクラス `directionLR` を宣言します。
そのため mermaid.js は、この入力をブロックがないものとしては読みません。
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/div-empty-description-block-before-direction-value-glued]
[fixture: class/div-empty-description-block-between-direction-and-value-label]

この仕様は、木に場所のあるところでは、そのような形をノードにし、
それ以外のところでは入力を拒否します。
場所は次のとおりです。
文が始まるところの空の説明ブロックは、sequence の箱の中でも、
説明ブロックの文で、
同じ行にほかの文が続いてもかまいません（例 5 と上の例）。
文の最後の単位の後、区切りの前の空の説明ブロックも同じで、
`A accDescr {}`、class の `note for A "x" accDescr {}`、
sequence の `autonumber accDescr {}` がそうです。
ヘッダーの後、その区切りの前の空の説明ブロックも同じで、
`flowchart LR accDescr {}` と、改行が続く `classDiagram accDescr {}` がそうです
（[flowchart](../diagrams/flowchart.ja.md#区切りの前の空の説明ブロック)、
[class](../diagrams/class.ja.md#区切りの前の空の説明ブロック)、
[sequence](../diagrams/sequence.ja.md#区切りの前の空の説明ブロック)、
[state](../diagrams/state.ja.md#区切りの前の空の説明ブロック)
の区切りの前の空の説明ブロックの節を参照）。
[fixture: flowchart/gram-empty-description-block-after-vertex] [fixture:
class/gram-empty-description-block-after-note] [fixture:
sequence/gram-empty-description-block-after-autonumber] [fixture:
flowchart/header-empty-description-block-after-direction] [fixture:
class/header-empty-description-block]
class では、関係の多重度やツールチップとしての空の文字列は、
空の値を持つ StringLiteral で、Db はそれを「なし」として読みます（例 8）。
クラスの名前の終わりの空のジェネリクスの型は、
ジェネリクスのない 2 つの `~` です。
[fixture: class/gram-link-tooltip-empty] [fixture:
class/gram-generic-empty-at-end]
state では、2 つの文の間に何も要らないので、文は各文のすぐ後で始まります。
`A --> B accDescr {}` は遷移と説明のブロックの文で、
`A --> accDescr {} B` ではブロックが遷移の中にあり、入力は拒否されます。
後の単位（状態の参照の後の `-->`、`:::`、説明）がその前の文を続けるブロックと、
間に空白しかないブロックの連なりも、
その文の中にあります。
`A accDescr {} --> B` と `A --> B accDescr {} : x` は拒否されます。
[fixture: state/gram-empty-description-block-after-transition] [fixture:
state/div-empty-description-block-after-arrow] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-label]

文の始まりでも、文やヘッダーの区切りの前でもない空の説明ブロックは、
文の中にあります。
木は、state の文脈の空の文字列と、区切りの前の空の説明ブロックを持ち、
state の合成状態と別名の文の中では、名前の次の行の本体の `{` の前のブロックを、
そこで mermaid.js が読まないほかのテキストを持つ `textBeforeBody` に持ちます。
ほかの、文の中の空の説明ブロックは持ちません。
理由は、次の 2 つのどちらかです。

- (a) 文の 2 つの単位の間では、それを持つには、
  その文のノードのその隙間に、mermaid.js が読まないテキストの欄が要ります。
  そのようなブロックは、どの文のほとんどどの隙間にも置けるので、
  どの文のノードのどの隙間にも、そのような欄が要ることになります。
- (b) 矢印、スタイル、名前の部分からなる名前のような値の中では、
  値がその両側にあるので、どの欄も持てません。

これに対して、state の文脈の空の文字列は、state の文脈の単位が始まるところ、
つまり合成状態と別名の文の決まった数か所にしか置けず、そのどの場所にも欄があり、
本体の `{` の前のブロックも同じです。
[fixture: state/gram-empty-description-block-before-alias-body-next-line]
区切りの前のブロックは文の最後の単位の後にあり、そこには文が続けられます。
次の場所は例で、mermaid.js がそのようなブロックを受理する文のノードごとに
少なくとも 1 つと、当たる理由を挙げます。
場所を尽くしてはおらず、場所は上の規則で決まります。
規則は、下の件数で、生成した入力で確かめています。
flowchart では:

- FlowchartVertexStatement と、
  その FlowchartVertexGroup と FlowchartLink の 2 つの単位の間:
  `A accDescr {}-->B`、`A-->accDescr {}B`、`A accDescr {}& B`、
  `A & accDescr {}B`、`A e1@accDescr {} --> B`、`A --> accDescr {}|t| B`、
  `A -->|t| accDescr {}B`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/gram-empty-description-block-before-link] [fixture:
  flowchart/div-empty-description-block-after-arrow-glued] [fixture:
  flowchart/div-empty-description-block-before-ampersand] [fixture:
  flowchart/div-empty-description-block-after-ampersand] [fixture:
  flowchart/div-empty-description-block-after-edge-id] [fixture:
  flowchart/div-empty-description-block-before-link-label] [fixture:
  flowchart/div-empty-description-block-after-link-label]
- FlowchartStyleStatement、FlowchartClassDefStatement、FlowchartClassStatement、
  FlowchartLinkStyleStatement の 2 つの単位の間:
  `style A accDescr {} fill:red`、`style A fill:red accDescr {},stroke:blue`、
  `classDef accDescr {}c fill:red`、`class accDescr {}A c`、
  `linkStyle accDescr {}0 stroke:red`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/db-style-first-style-after-empty-description-block]
  [fixture: flowchart/div-empty-description-block-before-style-comma]
  [fixture: flowchart/div-empty-description-block-before-classdef-names]
  [fixture: flowchart/div-empty-description-block-before-class-ids] [fixture:
  flowchart/div-empty-description-block-before-linkstyle-numbers]
- スタイル、つまり FlowchartLiteral の中:
  `style A fill:accDescr {}red` と `style A fill:red accDescr {} %% c`。
  flowchart では、行のほかのテキストの後の `%%` はコメントではなくテキストなので
  （[コメント行](../common.ja.md#コメント行) を参照）、
  スタイルは `fill:red`、空白 2 つ、`%% c` で、ブロックはその中にある。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: flowchart/div-empty-description-block-in-style] [fixture:
  flowchart/div-empty-description-block-in-style-before-percent]
- FlowchartClickUrlStatement と FlowchartClickCallbackStatement の
  2 つの単位の間:
  `click A accDescr {}href "u"`、`click A "u"accDescr {} "t"`、
  `click A href "u"accDescr {} _blank`、`click A call cb()accDescr {} "t"`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/div-empty-description-block-before-href] [fixture:
  flowchart/div-empty-description-block-before-click-tooltip] [fixture:
  flowchart/div-empty-description-block-before-link-target] [fixture:
  flowchart/div-empty-description-block-before-callback-tooltip]
- FlowchartSubgraphStatement の 2 つの単位の間:
  `subgraph accDescr {} fe [Front end]`、`subgraph accDescr {}"x"y`、
  `subgraph fe accDescr {} [Front end]`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: flowchart/div-empty-description-block-before-subgraph-name]
  [fixture: flowchart/gram-subgraph-name-empty-description-block-then-string]
  [fixture: flowchart/div-empty-description-block-before-subgraph-title]
- subgraph の名前、つまり FlowchartLabel の中:
  `subgraph a accDescr {} b` と `subgraph S accDescr {} %% c`。
  後者の `%% c` は、上と同じく名前のテキストで、題は `S`、空白 2 つ、`%% c`。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: flowchart/gram-empty-description-block-in-subgraph-name] [fixture:
  flowchart/div-empty-description-block-in-subgraph-name-before-percent]

class では:

- ClassRelationStatement と、その ClassName の 2 つの単位の間:
  `A accDescr {} --> B`、`A accDescr {}~T~ <|-- B`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: class/div-empty-description-block-in-statement] [fixture:
  class/div-empty-description-block-before-generic]
- ClassArrow、または名前の部分からなる名前、つまり Identifier の中:
  `A --accDescr {}> B`、`A accDescr {} - B --> C`（名前は `A-B`）、
  `direction accDescr {} LR`（上を参照）。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: class/div-empty-description-block-in-arrow] [fixture:
  class/div-empty-description-block-in-dashed-name] [fixture:
  class/div-empty-description-block-between-direction-and-value]
- ClassNoteStatement、ClassMemberStatement、ClassLinkStatement、
  ClassCallbackStatement、ClassCssClassStatement、ClassClassDefStatement、
  ClassStyleStatement、ClassAnnotationStatement の 2 つの単位の間:
  `note for accDescr {}A "x"`、`A accDescr {}: x`、
  `click accDescr {}A href "u"`、`click A accDescr {} href "u" "t"`、
  `click A href "u" "t" accDescr {} _self`、`callback A accDescr {} "f"`、
  `click A call f() accDescr {} "t"`、`cssClass accDescr {}"A" c`、
  `cssClass "A" accDescr {} c`、`classDef c accDescr {} fill:red`、
  `style C accDescr {} fill:red`、`<<interface>> accDescr {} Class01`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: class/div-empty-description-block-before-note-class] [fixture:
  class/div-empty-description-block-before-member-colon] [fixture:
  class/div-empty-description-block-before-click-class] [fixture:
  class/div-empty-description-block-before-href] [fixture:
  class/div-empty-description-block-before-link-target] [fixture:
  class/div-empty-description-block-in-callback] [fixture:
  class/div-empty-description-block-before-click-call-tooltip] [fixture:
  class/div-empty-description-block-before-css-class-ids] [fixture:
  class/div-empty-description-block-before-css-class-name] [fixture:
  class/div-empty-description-block-in-class-def] [fixture:
  class/div-empty-description-block-in-style] [fixture:
  class/div-empty-description-block-after-annotation]
- ClassAnnotation の名前の中:
  `<<accDescr {}interface>> A`。
  値の中なので、どの欄も持てない（理由 b）。
  [fixture: class/div-empty-description-block-in-annotation]

sequence では:

- SequenceMessageStatement の 2 つの単位の間:
  `A->>accDescr {}B: x`、`A() accDescr {}->>()B: x`、`A->> accDescr {}+B: x`、
  `A->>+ accDescr {}B: x`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/div-empty-description-block-after-central-connection] [fixture:
  sequence/div-empty-description-block-before-activation] [fixture:
  sequence/div-empty-description-block-after-activation]
- SequenceNoteStatement の 2 つの単位の間:
  `note accDescr {} left of A: x`、`note left of accDescr {} A: x`、
  `note over A,accDescr {}B: x`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-before-note-placement]
  [fixture: sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/div-empty-description-block-between-note-ids]
- SequenceLinkStatement、SequenceLinksStatement、SequencePropertiesStatement、
  SequenceDetailsStatement の 2 つの単位の間:
  `link accDescr {}A: x@https://u`、`links accDescr {} A: {"a": "https://u"}`、
  `properties accDescr {} A: {}`、`details accDescr {} A: x`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-before-link-id] [fixture:
  sequence/div-empty-description-block-before-links-id] [fixture:
  sequence/div-empty-description-block-before-properties-id] [fixture:
  sequence/div-empty-description-block-before-details-id]
- SequenceAutonumberStatement の 2 つの単位の間:
  `autonumber accDescr {}1 2`、`autonumber accDescr {} off`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-before-autonumber-numbers]
  [fixture: sequence/div-empty-description-block-before-autonumber-off]
- SequenceParticipantStatement と SequenceDestroyStatement の、
  `create` とキーワードの間:
  `create accDescr {}participant A`、`create accDescr {} destroy A`。
  持つには、その隙間に欄が要る（理由 a）。
  [fixture: sequence/div-empty-description-block-after-create] [fixture:
  sequence/div-empty-description-block-before-destroy]

state では、どれも文の 2 つの単位の間です:

- `A accDescr {} --> B` と `[*] accDescr {} --> A`:
  StateTransitionStatement の、元と矢印の間の欄。
  [fixture: state/div-empty-description-block-in-transition] [fixture:
  state/div-empty-description-block-terminal-before-arrow]
- `A --> accDescr {} B` と `A --> accDescr {} [*]`:
  StateTransitionStatement の、矢印と先の間の欄。
  [fixture: state/div-empty-description-block-after-arrow] [fixture:
  state/div-empty-description-block-before-terminal-target]
- `A --> B accDescr {} : x`: StateTransitionStatement の、ラベルの前の欄。
  [fixture: state/div-empty-description-block-before-label]
- `A accDescr {} : x`: StateDefinitionStatement の、説明の前の欄。
  [fixture: state/div-empty-description-block-before-description]
- `A accDescr {} :::c --> B` と `A --> B accDescr {} :::c`:
  StateReference の、`:::` の前の欄。
  [fixture: state/div-empty-description-block-before-class] [fixture:
  state/div-empty-description-block-before-target-class]
- `A:::accDescr {}c`: StateReference の、`:::` とクラスの間の欄。
  [fixture: state/div-empty-description-block-after-class-separator]
- `click accDescr {} A "u" "t"`: StateClickStatement の、id の前の欄。
  [fixture: state/div-empty-description-block-in-click-before-id]
- `click A accDescr {} "u" "t"` と `click A href accDescr {} "u"`:
  StateClickStatement の、URL の前の欄。
  [fixture: state/div-empty-description-block-in-click-before-url] [fixture:
  state/div-empty-description-block-in-click-after-href]
- `click A "u" accDescr {} "t"`: StateClickStatement の、ツールチップの前の欄。
  [fixture: state/div-empty-description-block-in-click-before-tooltip]

文の最後の単位の後、区切りの前では、
state の `click A "u" "t" accDescr {}` のように、ブロックは文です。
これを、flowchart（その 3 分の 1）、class、sequence の
受理される fixture のうち、
コメント、ディレクティブ、フロントマターがなく、差の印がないものから、
各行の終わりに `accDescr {}` を空白なしと空白ありで足した入力で確かめました。
ブロックが文の後にあるもののうち、mermaid.js とこの仕様は、
flowchart の 856 件（受理 770、拒否 86）、class の 638 件と sequence の 97 件
（すべて受理）を同じに読み、
受理されるものには、ブロックを除き、まわりの空白を残した入力の Db を与えます。
その空白は効果を保つので、`subgraph S accDescr {}` の id は、
名前の後に空白のある `subgraph S` と同じく `subGraph0` で、
`subgraph S` の id は `S` です
（[flowchart](../diagrams/flowchart.ja.md#木から要約を作る) を参照）。
flowchart の 86 件は、ブロックの前の空白のために拒否されます
（[flowchart](../diagrams/flowchart.ja.md#区切りの前の空の説明ブロック)
を参照）。
sequence の 97 件のうち 59 件は、
ブロックのない同じ行が、終わりに空白があるときには拒否されるのに、受理されます
（[sequence](../diagrams/sequence.ja.md#区切りの前の空の説明ブロック) を参照）。
class の `direction accDescr {}`、改行、`LR` もその 1 つです。
ブロックは、mermaid.js でも、2 つが方向の行になるのを妨げるので、
それらはラベルのない 2 つのメンバーの文で、方向は `TB` のままです。
[fixture: state/gram-click-empty-description-block-after] [fixture:
flowchart/gram-empty-description-block-after-data-block-space] [fixture:
sequence/gram-empty-description-block-after-autonumber-spaces] [fixture:
class/gram-empty-description-block-after-direction-word]

ヘッダーの後、その区切りの前でも、ブロックは文です。
これを、各図種の同じ種類の fixture のうち、
ヘッダーの行が異なるものそれぞれと、さらに約 100 件から作った入力で、
確かめました。
ヘッダーの行の終わりに、次の 8 つの形の 1 つを足しました。
前に空白のあるブロックとないブロック、空白 2 つの後のブロック、
後に空白が 1 つか 2 つ続くブロック、間に空白のある 2 つのブロックとないもの、
`;` が続くブロックです。
mermaid.js とこの仕様はそのすべてを同じに読みます。
flowchart と class で受理されるものは、ブロックのない入力の Db を持ちます。
flowchart では、方向の後で 392 件が受理され、
`;` のある 65 件と、ブロックが方向の語にすぐ続く 63 件は拒否され、
方向のないヘッダーのキーワードの後では 16 件すべてが拒否されます。
class では 670 件が受理され、
`;` のある 111 件と、ブロックがキーワードにすぐ続く 109 件は拒否されます。
ヘッダーの後に文が始まる sequence と state では、
ブロックの前に空白のある入力はすべて受理され、両方で Db が同じです。
flowchart のヘッダーの `;` の前のブロックは、
さらに 1,440 件の入力で確かめました。
2 つのヘッダーのキーワード、方向 `LR`、`>`、`^`、`<`、`v`、
ブロックの前のなし、空白 1 つ、空白 2 つ、タブ、
ブロック 1 つと、間に空白のあるものとないブロック 2 つ、
その後のなし、空白、タブ、そしてその後の `;`、改行、テキストの終わりです。
mermaid.js は、上の規則が受理するものだけをちょうど受理し、
ブロックのない入力の Db を与えます。
[fixture: flowchart/header-empty-description-block-after-direction] [fixture:
flowchart/header-empty-description-block-before-semicolon] [fixture:
flowchart/header-empty-description-block-no-direction] [fixture:
class/header-empty-description-block] [fixture:
sequence/header-empty-description-block] [fixture:
state/header-empty-description-block]

これらの形に見えるだけのテキストは、そのどれでもなく、どちらも同じに読みます。
`A""-->B` の引用符は頂点 `A""` の文字で、
`accTitle: ""` はタイトル `""` を持ち、
`A[" "]` は空白 1 つの文字列を持ち、
`A["call ()"]` はラベル `call ()` を持ちます。
[fixture: flowchart/lex-empty-quotes-in-id] [fixture:
flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]

差は一方向だけです。
mermaid.js が受理し、この仕様が拒否します。
各図種の文書は、その例を既知の差の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差)、
[sequence](../diagrams/sequence.ja.md#既知の差)、
[class](../diagrams/class.ja.md#既知の差)、
[state](../diagrams/state.ja.md#既知の差) です。

## mermaid.js がそう読む理由

mermaid.js の字句解析器は、これらの形のどれにもトークンを読みません。
flowchart では、空の文字列の引用符
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)）、
空の呼び出しの `call` と括弧
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)）、
空の説明ブロックの `accDescr {` と `}`
（[`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)）
を読み飛ばします。
sequence と state は空の説明ブロックを同じように読み飛ばし
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77)、
[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L93-L95)）、
class は 5 つの形すべてを読み飛ばします
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L34-L35)、
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L53-L62)、
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)）。
これらの規則はどれも、字句解析器の状態に入るか出るだけで何も返さないので、
文法はその形を見ません。

## この仕様の規則と、その理由

この仕様では、これらの形はどれも、形が空でないときと同じ単位として読まれます。
空の文字列は 2 つの引用符、空の呼び出しは `call` と括弧、
空の説明ブロックは `accDescr`、`{`、`}` です。
文法のどの規則もそれらの単位を取らないところでは、入力は拒否されます
（[文字列](../diagrams/flowchart.ja.md#文字列)、
[クリックとコールバック](../diagrams/flowchart.ja.md#クリックとコールバック)、
[アクセシビリティの値](../diagrams/flowchart.ja.md#アクセシビリティの値)
を参照）。

そのような形は、どの 2 つの単位の間にも置けます。
id、ラベル、スタイルのような葉ノードの値の中にも、
ノードのフィールドの間にもです。
木には、そこにそれだけのノードの場所がなく、
形を木から除けば、書き手が書いたテキストが失われます。
これは既知の差の 1 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
mermaid.js がテキストを読まないことは、それだけでは拒否の理由になりません。
木に場所があるところでは、形はノードになり、入力は受理されます。
方向の文の周りで mermaid.js が捨てるテキストが
[FlowchartIgnoredText](../ast/flowchart.ja.md#flowchartignoredtext)
になるのと同じです。
[fixture: flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value]

## 書き手にとっての結果

書き手が空のものを表すつもりでこれらの形を書くと、
mermaid.js もそれを拒否します。
`A[""]`、`A("")`、`A-->|""|B`、`A -- "" --> B`、
`click A href ""`、`subgraph ""`、`click A call ()` は、どちらも拒否します。
[fixture: flowchart/gram-label-empty-string] [fixture:
flowchart/gram-shape-round-empty-string] [fixture:
flowchart/gram-link-text-empty-string] [fixture:
flowchart/gram-link-text-dash-empty-string] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-subgraph-name-empty-string-only] [fixture:
flowchart/gram-click-empty-call-only]
mermaid.js がそれらを受理するのは、ほかのテキストの隣で何も残さず、
描かれるものを何も変えないところだけです。
この道具はそのようなテキストを拒否し、その形を報告します。
それを除けば、たいていはどちらも同じに読むテキストになります（下を参照）。
mermaid.js のテスト、文書、デモから集めた入力に、
これらの形を持つものはありません。

## 件数と確かめ方

parser の差分テストは、そのような入力を、その**参照入力**と比べます。
参照入力は、入力から、コメントの領域と空の形を除いたものです。
空の形とは、それぞれの空の文字列、`call` から `)` までのそれぞれの空の呼び出し、
説明ブロックの文でない空の説明ブロック
（文の始まりでも、文やヘッダーの区切りの前でもない、文の中にあり、
state の文の `textBeforeBody` が持たないもの）の
`accDescr` から `}` までです。
ブロックが文かどうかは、その前の空の文字列と空の呼び出しを除いて決めます。
間に空白しかない、続けて書いたブロックは、
最後のブロックの後に続くものでまとめて決めます。
`""accDescr {}` に改行と `A` が続くものでは、
空の文字列を除くとブロックが文を始めるので、ブロックは参照入力に残ります。
[fixture: flowchart/lex-empty-string-before-empty-description-block]
class の同じ行の `direction` とその値の間の 1 つ以上のブロックでは、
参照入力はブロックのまわりの空白も除き、`direction` と値を 1 つの語にします。
mermaid.js が 2 つの名前の部分をつなぐのと同じです。
`direction accDescr {} LR` の参照入力は `directionLR` で、
`direction accDescr {}accDescr {}LR` も同じです。
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/div-empty-description-blocks-between-direction-and-value]

この仕様の字句解析器が、参照入力を、空の形の単位以外の入力の単位として読み、
mermaid.js が入力を受理するところでは、
parser は、mermaid.js が入力に与える Db を参照入力に与えることになっています。
`A[""x]` は `A[x]` になり、`click A call ()cb` は `click A cb` になります。
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback]
そうでなければ、除くことで形の両側にあるものがほかの単位につながり、
mermaid.js が参照入力を別に読むことがあります。
`style A "" fill:red` では、
空の文字列の前と後の空白が 1 つの `space` の単位になるので、
参照入力のスタイルは、空白と `fill:red` ではなく `fill:red` です。
`A:""::c` では、`:` と `::` が `:::` になるので、
参照入力は、頂点 `A:::c` ではなく、クラス `c` を持つ頂点 `A` を持ちます。
`flowchart""TD` は `flowchartTD` になり、mermaid.js はそれを拒否します。
[fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

各図種の受理される fixture のうち、
コメント、ディレクティブ、フロントマターがなく、差の印がないものから、
ヘッダーの後の各行の、各空白の後と行の終わりに、
その図種の空の形をそれぞれ差し込んで、入力を作りました。
各図種から、そのうちの約 2,000 件を等間隔に取りました。
それぞれを mermaid.js とこの仕様の parser で読み、受理と Db を比べました。

| 図種      | 取った件数、作った件数のうち | mermaid.js は拒否、この仕様は受理 | 両方受理、Db が違う | mermaid.js は受理、この仕様は拒否 |
| --------- | ---------------------------: | --------------------------------: | ------------------: | --------------------------------: |
| flowchart |     33,909 件のうち 2,120 件 |                                88 |                   0 |                             1,073 |
| sequence  |      7,965 件のうち 2,655 件 |                                 0 |                   0 |                               105 |
| class     |    115,762 件のうち 2,031 件 |                                 0 |                   0 |                               678 |

flowchart の 88 件はデータブロックを持つ入力で、
mermaid.js はその中身のために拒否します。
[`embedded-data-opaque`](./embedded-data-opaque.ja.md) の入力です。
残りは、どちらも同じに読みます。
その中には、形が区切りの前の空の説明ブロックである、
flowchart の 62 件、sequence の 16 件、class の 5 件が入ります。
それは文です（上を参照）。
mermaid.js が受理しこの仕様が拒否する 1,856 件のそれぞれについて、
parser の差分テストは、上で述べたとおり、
その参照入力で違いが説明されることを確かめ、
説明されないものはありませんでした。

ブロックが木にある場所は、すべての図種で、
ブロックが置ける位置と、その前後に来るものでも確かめました。
入力は、差の印、コメント、フロントマターのない、
受理される fixture から作りました。
2 つのトークンの間の境目のすべてで、トークンのすぐ後、次のトークンのすぐ前、
その間の各行の頭に、
2 つのトークンの種類とその間の空白の形の組ごとに 2 か所ずつ、
ブロックを 9 か 10 の書き方で書きました。
ブロックだけ、空白かタブの後か前、間に空白のあるものとない 2 つのブロック、
後に続くコメント `%% c`（sequence と state では `# c` も）、ディレクティブです。
39,019 件のうち、両方が拒否するものが 15,936 件、
両方が受理し Db が同じものが 17,792 件、
既知の差の宣言どおりに違うものが 5,252 件で、
残りの 39 件は、この文書と各図種の文書が述べる形で、
その Db はブロックのない入力の Db でした。
さらに 4,480 件は、state で、各名前か別名の行と、
次の行の本体の `{` の前に置けるもの
（空の説明ブロック、空の文字列、`%%`、コメント行、空行）を組み合わせたもので、
受理と Db は mermaid.js と一致しました。
ほかの書き方（`accDescr{}`、2 行にまたがる波括弧、タブ、CRLF、3 つのブロック、
`;`、`;;`、空の文字列、隣のディレクティブ）の 35,344 件でも、
ほかの違いは見つかりませんでした。
宣言された違いの中には、上の class の方向の行と同じく、
ブロックが、空白をまたぐ mermaid.js の字句の規則が当たるのを妨げる、
入力があります。
class と state で、mermaid.js は `accTitle accDescr {}: t` を、
メンバーか説明を持つ名前 `accTitle` として読みますが、
その参照入力 `accTitle : t` は題です。
上で述べた、mermaid.js が参照入力を別に読む入力の 1 つで、
この仕様には、mermaid.js と同じに読まれる入力がありません。
[fixture: class/div-empty-description-block-between-acc-title-and-colon]
[fixture: state/div-empty-description-block-between-acc-title-and-colon]

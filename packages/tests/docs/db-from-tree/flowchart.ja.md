# flowchart の Db を木から作る

英語版: [flowchart.md](./flowchart.md)

flowchart 図の木から Db の要約を作る手順です。
`src/db-from-tree/flowchart.ts` がこれを実装します
（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、仕様の
[diagrams/flowchart.ja.md](../../../spec/docs/diagrams/flowchart.ja.md) と
[ast/flowchart.ja.md](../../../spec/docs/ast/flowchart.ja.md) が定めます。

フロントマターから来る図のタイトルと、設定に依存する Db の値は、
木からは得られません。
Db の値を確かめる側が、
mermaid.js
自身の関数でそれらを求めます
（[設定（参考）](../configuration.ja.md#設定参考) を参照）。

## 木から要約を作る

要約は、
図の文をソースの順に（subgraph の中の文は subgraph そのものより先に）たどり、
以下の手順を適用して作ります。
これは、mermaid.js の文法が Db を呼ぶ順です。
各手順は、値を
[変換した形](../../../spec/docs/common.ja.md#ソースの読み方) で読み、
`}` の後の空白は
[`}` の後の空白](../../../spec/docs/diagrams/flowchart.ja.md#-の後の空白)
のとおりに読みます。
データブロックの値は読みません。
ラベルは、変換した値の両端の空白を trim したものと、
その種類をラベルの種類として与えます。
`A["x"]` の後の `A["x "]` は、テキストを `x` のままにします。
[fixture: flowchart/db-vertex-label-string-trailing-space-redefined]
値が両端に空白を持つのは、先頭の文字列の区切りの内側か、
ラベルがすべて空白のときだけです。
ほかの値は
[共通の葉のノード](../../../spec/docs/ast.ja.md#共通の葉のノード) の値で、
Identifier の `name` と、StringLiteral、NumericLiteral、
FlowchartLiteral の `value` です。
id、クラス名、スタイルのリストの null の要素は、空のテキストを表します
（**スタイルの文**を参照）。
[fixture: flowchart/db-linkstyle-whitespace-only-style] [fixture:
flowchart/db-classdef-whitespace-only-style]
アクセシビリティの文の null の
`value` は、下の**アクセシビリティの文**で述べます。
クリックの文の `arguments` は使いません。
要約はコールバックの引数を除くからです。

**方向。** ヘッダーの方向です。
`<` は `RL`、`^` は `BT`、`>` は `LR`、`v` と `TD` は `TB` になり、
`BR` を含む他の値は書かれたままです。
方向のないヘッダーは `TB` になります。
subgraph の外の方向の文は、ヘッダーが方向を持たないときも、何も変えません。
`flowchart`、`direction LR`、`A-->B` の方向は `TB` です。
[fixture: flowchart/db-direction-mapping] [fixture: flowchart/db-direction-br]
[fixture: flowchart/header-direction-next-line] [fixture:
flowchart/db-direction-statement-top-level] [fixture:
flowchart/db-direction-statement-top-level-no-header-direction]

**頂点の手順。** id と、省略可能なラベル、形、スタイル、
プロパティを取ります。

1. その id の辺があれば、何も起きません。
   `A e1@--> B` の後の `style e1 fill:#f00` は、
   頂点を加えず、スタイルも与えません。
   [fixture: flowchart/db-vertex-edge-id] [fixture: flowchart/db-style-edge-id]
2. その id の頂点がなければ、id、ラベルの種類 `text`、スタイルなし、
   クラスなしの頂点を末尾に加えます。
3. ラベルがあれば、頂点は、既にテキストを持っていても、
   そのテキストとラベルの種類をラベルから取ります。
   `A[Start]-->B` の後の `C-->A[End]` は、A にラベル `End` を与えます。
   [fixture: flowchart/db-vertex-label-redefined] なければ、
   まだテキストのない頂点が id をテキストとして取り、
   テキストを持つ頂点はそれを保ちます。
   `A[Start]-->B` の後の `A-->C` も `C-->A[Start]` も、
   A のラベルを `Start` のままにします。
   [fixture: flowchart/db-vertex-label-kept-without-label] [fixture:
   flowchart/db-vertex-label-redefined-same]
4. 形があれば、その形の Db の type
   （[形](../../../spec/docs/diagrams/flowchart.ja.md#形) を参照）
   が頂点の type になります。
   スタイルがあれば、頂点のスタイルに加えます。
5. まだ `props` のない頂点は、それを得ます。
   プロパティがあればそのプロパティを、なければ空のプロパティを持ちます。
   `props` のある頂点には、プロパティを加えます。
   同じ名前のプロパティがあれば、その値を置き換えます。
   名前が `__proto__` のプロパティは例外です。
   後から与えたものは、頂点のプロパティ `__proto__` の値を置き換え、
   それがなければ何も変えません。
   頂点がプロパティ `__proto__` を持てるのは、
   その `props` を作った手順で得たときだけです。
   そのため、`A` の後の `A[|__proto__:x|text]` は、`A` の `props` を、
   最初の手順が作った空のままにします。
   先にリンク、スタイルの文、データブロックが `props` を作ったときも同じです。
   `A[|b:y|t]` の後なら、`props` は値が `y` の `b` を保ち、
   `__proto__` は加わりません。
   一方、`class` の文は頂点を加えず `props` を作らないので、
   その後の `A[|__proto__:x|text]` が `__proto__` を持つ `props` を作ります。
   mermaid.js は、
   [`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L229-L233)
   で、既存の `props` にプロパティを、素のオブジェクトへの代入で加えます。
   そこでは `__proto__` はキーになりません。
   [fixture: flowchart/db-props-merge] [fixture:
   flowchart/db-props-existing-vertex] [fixture: flowchart/db-props-replaced]
   [fixture: flowchart/db-props-constructor-existing-vertex] [fixture:
   flowchart/db-vertex-props-proto] [fixture: flowchart/db-props-proto-replaced]
   [fixture: flowchart/db-props-proto-then-other] [fixture:
   flowchart/db-props-proto-existing-vertex] [fixture:
   flowchart/db-props-proto-existing-link-vertex] [fixture:
   flowchart/db-props-proto-after-style] [fixture:
   flowchart/db-props-proto-after-data-block] [fixture:
   flowchart/db-props-proto-after-other-property] [fixture:
   flowchart/db-props-proto-after-class]

**クラスの手順。** id とクラス名を取ります。
それぞれの id の頂点、その id を持つ最初の辺、
その id で最後に加えた subgraph のクラスに、クラス名を加えます。
[fixture: flowchart/db-class-on-edge-and-subgraph] [fixture:
flowchart/db-class-vertex-id-with-comma]
頂点は加えないので、まだ頂点のない id はクラスを得ません。
`A --> B` の後の `class C foo` は何も変えず、
`class A foo` の後に `A --> B` が続くと、A はクラスを持ちません。
[fixture: flowchart/db-class-unknown-vertex] [fixture:
flowchart/db-class-before-vertex]

**頂点の文。** 頂点のグループを最初から最後まで、それぞれの頂点について、
その形で頂点の手順を、次にクラスがあれば、
その頂点の id を `,` の文字で区切った部分とクラスでクラスの手順を
（そのため `A,B:::c` は頂点 `A,B` にクラスを与えません）、
次にグループの中でその前の頂点がデータブロックを持てばそれらを適用します。
グループの最後の頂点の後に、その頂点のデータブロックが来ます。
各リンクの行き先のグループの後に、そのリンクの辺が来ます。
そのため、`&` が後に続く頂点のデータブロックは、次の頂点の後に適用されます。
`A@{ label: x } & A[y]` の `A` のラベルは `x` です。
[fixture: flowchart/db-data-after-next-vertex] 頂点の文のメンバーは、
[文法の外での拒否](../../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
の **subgraph のメンバー** が定めます。

**リンク。** リンクは、その前のグループから行き先のグループへ、
[文法の外での拒否](../../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
の **linkStyle の番号** が数える辺を作ります。
最初のグループの各頂点について、順に、
行き先のグループの各頂点への辺を順に 1 本ずつ作ります。
各辺は、始点と終点の id、
矢印の type、stroke、length（下を参照。10 を超える length は 10）、
ラベルのテキストとラベルの種類（ラベルがなければ空のテキストと `text`）、
クラスなし、
その時点で設定されていれば `linkStyle default` の既定の interpolate を持ちます。
[fixture: flowchart/db-arrow-length-cap] [fixture:
flowchart/db-default-interpolate-later-edge] その id は次のとおりです。

- 始点が最初のグループの最後の頂点の id で、
  終点が 2 つ目のグループの最初の頂点の id である辺では、リンクの辺の id。
  ただし、それより前の辺がその id を持っていれば使いません。
  Db の id は、辺の id が `@` を含まなければそのままです。
  含めば、その最初の `@` を除き、末尾に `@` を足したものです。
  そのような辺の `isUserDefinedId` は true です。
  [fixture: flowchart/db-edge-id-group] [fixture: flowchart/db-edge-id-reused]
  [fixture: flowchart/db-edge-id-at-sign]
- それ以外では、`L_`、始点の id、`_`、終点の id、`_`、カウンタ。
  カウンタは、同じ始点と終点を持つそれより前の辺がなければ 0、
  あればその数に 1 を足したものです。
  3 つ目の `A-->B` は `L_A_B_3` になります。
  [fixture: flowchart/db-edge-id-counter]

辺が、
サイト設定の `maxEdges`
より多い入力は拒否されます
（[文法の外での拒否](../../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否) を参照）。

**矢印。** リンクの FlowchartArrow が、type、stroke、length を与えます。
type は終わりの記号から決まり、
`arrow` は `arrow_point`、`cross` は `arrow_cross`、
`circle` は `arrow_circle`、`none` は `arrow_open` です。
始まりの記号が、`none` でなく終わりの記号と同じ記号のとき、
始まりの記号は**対応する**と言い、
type に `double_` を前に付けます。
stroke は、線 `invisible` なら `invisible`、`dotted` なら `dotted`、
`solid` なら `normal` です。
`thick` なら、始まりの記号が `none` か対応するとき `thick`、
それ以外は `normal` です。
length は、点線なら矢印の `length` です。
それ以外は、矢印の `length` から 1 を引き、
終わりの記号が `none` ならさらに 1 を引き、
始まりの記号が `none` でも対応するものでもなければ 1 を足したものです。
これは、mermaid.js が、
矢印から最後の文字と対応する始まりの記号を除いたものから求める値で、
対応しない始まりの記号はそこに残ります。
`---` と `-->` の length は 1 です。
`A x-->B` は type `arrow_point`、stroke `normal`、length 2 で、
`A x==>B` の stroke は `normal` です。
`<-->` の type は `double_arrow_point`、
`A x---B` は type `arrow_open`、length 2 です。
`~~~` は stroke `invisible`、length 1、
`-..->` は stroke `dotted`、length 2 です。
[fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-link-text-head-letter]
`A o--> B` のように、対応しない始まりの記号が記号として描かれず、
辺が長くなることは、
[issue #1665](https://github.com/mermaid-js/mermaid/issues/1665) が不具合として報告していて、
2026-10-01 の時点で未解決で、不具合として承認されています。
そのコメントは、`A o-- test1 --> B` のように、
そのような 2 つの矢印の間にテキストを持つリンクが、
矢じりを描かないことも報告していて、
これは下の type `INVALID` です。
[fixture: flowchart/db-arrow-mixed-markers]

開く矢印を持つリンクでは、FlowchartOpeningArrow が、
始まりの記号から type を、線から stroke を与えます。
type は、`arrow` なら `arrow_point`、`cross` なら `arrow_cross`、
`circle` なら `arrow_circle`、`none` なら `arrow_open` です。
stroke は、`thick` なら `thick`、`dotted` なら `dotted`、
`solid` なら `normal` です。
この stroke が上の閉じる矢印の stroke と違えば、type と stroke は `INVALID` で、
length はありません。
2 つの矢印は同じ線を持つので、
これが起こるのは、閉じる矢印が太線で、
その始まりの記号が `none` でも対応するものでもないときだけです。
`A== t x==>B` では、閉じる矢印の始まりの記号 `cross` が、
その stroke を `normal` にします。
そうでなければ、
開く矢印の type が `arrow_open` なら辺は閉じる矢印の type を取り、
閉じる矢印の type と等しければ type に `double_` を前に付け、
それ以外では type と stroke は `INVALID` で length はありません。
stroke は両者に共通のもので、length は閉じる矢印のものです。
`A x-- t --xB` の type は `double_arrow_cross` です。
`A x-- t -->B` と `A x-- t x--x B` は `INVALID` で、
後者は `arrow_cross` が `double_arrow_cross` でないからです。
[fixture: flowchart/db-arrow-double] [fixture: flowchart/db-arrow-invalid]
[fixture: flowchart/db-arrow-thick-head-invalid] [fixture:
flowchart/db-arrow-dash-head-length] [fixture:
flowchart/db-arrow-closing-double-in-link-text] [fixture:
flowchart/db-arrow-opening-cross-closing-cross] [fixture:
flowchart/db-arrow-opening-cross-closing-double-cross] [fixture:
flowchart/db-arrow-dotted-closing-start-marker]

**subgraph。** subgraph の文は、その本体の文の後に subgraph を加えます。
そのため、入れ子の subgraph は、それを囲む subgraph より先に来ます。
そのメンバーは、
[文法の外での拒否](../../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
の **subgraph のメンバー** が定めるもので、
アクセシビリティの文の値はそのままです（説明の改行はここでは畳まない）。
subgraph の外の空の文は、何も変えません。
[fixture: flowchart/gram-empty-statement-top-level]
空やすべて空白のメンバーは除きます。
残りでは、等しいメンバーは最初のものだけを残します。
ただし、メンバー `__proto__` はすべて残します。
mermaid.js は見たメンバーを素のオブジェクトのキーとして持ち、
`__proto__` はそのキーにならないからです。
その後、先に加えた subgraph が既に持つメンバーは、`__proto__` も含めて除きます。
[fixture: flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/db-subgraph-member-acc-title] [fixture:
flowchart/db-subgraph-member-acc-descr-block] [fixture:
flowchart/db-subgraph-member-empty-acc-descr-block] [fixture:
flowchart/db-subgraph-nested-members] [fixture:
flowchart/db-subgraph-member-proto-twice] [fixture:
flowchart/db-subgraph-member-proto-mixed] [fixture:
flowchart/db-subgraph-member-proto-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-has-own-property-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-constructor-to-string] メンバー `hasOwnProperty`
の後にほかのメンバーが続く subgraph
は拒否されます
（[文法の外での拒否](../../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
を参照）。
subgraph は次のものを持ちます。

- `id`: [文法の外での拒否](../../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
  の **subgraph のメンバー** が定める id で、
  そこで定める名前のテキストから作ります。
  生成した id は、`subGraph` に、
  それより前に加えた subgraph の数を続けたものです。
  [fixture: flowchart/db-subgraph-counter]
- `title`: タイトルの値を変換した形、
  タイトルがなければ名前のテキストを trim したもの。
- `labelType`: タイトルの種類。
  タイトルがなければ、
  名前の種類が `markdown`（つまり名前が markdown 文字列で始まる）なら
  `markdown`、それ以外は、文字列で始まる名前でも `text`。
  [fixture: flowchart/db-subgraph-quoted-name] [fixture:
  flowchart/db-subgraph-markdown-name] [fixture:
  flowchart/gram-subgraph-name-markdown-then-text]
- `dir`: 本体の最後の方向の文の方向。
  なければ、
  [有効な設定](../configuration.ja.md#有効な設定) の `flowchart.inheritDir` が
  mermaid.js の判定で真とみなされるとき、つまり `false`、ゼロ、NaN、空の文字列、
  null のどれでもないときは図の方向、それ以外ではなし。
  `true`、`1`、`yes`、文字列の `false` と `0` では subgraph は図の方向を取り、
  `false`、`0`、空の文字列では取らない。
  フロントマターやディレクティブに書いたリストやマッピングは既定の `false`
  を置き換えず
  （[有効な設定](../configuration.ja.md#有効な設定) を参照）、
  null はキーの絞り込みが除くので、`[]`、`{}`、`null` でも取らない。
  [fixture: flowchart/config-inherit-dir-site] [fixture:
  flowchart/config-inherit-dir-frontmatter] [fixture:
  flowchart/config-inherit-dir-fm-one] [fixture:
  flowchart/config-inherit-dir-fm-yes] [fixture:
  flowchart/config-inherit-dir-fm-string-false] [fixture:
  flowchart/config-inherit-dir-fm-string-zero] [fixture:
  flowchart/config-inherit-dir-directive-string-false] [fixture:
  flowchart/config-inherit-dir-fm-false] [fixture:
  flowchart/config-inherit-dir-fm-zero] [fixture:
  flowchart/config-inherit-dir-fm-empty-string] [fixture:
  flowchart/config-inherit-dir-fm-list] [fixture:
  flowchart/config-inherit-dir-fm-mapping] [fixture:
  flowchart/config-inherit-dir-fm-null]
- `classes`: クラスの手順が加えるまではなし。

**スタイルの文。** 各スタイルは、その値を与え、null なら空のテキストを与えます。
その範囲は、その前の `,` のすぐ後から、
最初のスタイルは文の規則が `styles` の前に読む `space` の単位の終わりから、
mermaid.js が読むそこの空白を含めて始まり、
文の空の説明ブロックと区切りの前の、空白でない最後の文字で終わります
（[FlowchartStyleStatement](../../../spec/docs/ast/flowchart.ja.md#flowchartstylestatement)
を参照）。
`classDef c fill:red accDescr {}` と `linkStyle 0 stroke:red accDescr {}` の
最後のスタイルは、`fill:red` と `stroke:red` で、
`linkStyle 0 interpolate basis accDescr {} ;` の、
すべて空白のスタイルは null です。
[fixture: flowchart/gram-empty-description-block-after-style-before-semicolon]
[fixture: flowchart/gram-empty-description-block-after-classdef] [fixture:
flowchart/gram-empty-description-block-after-classdef-before-semicolon]
[fixture: flowchart/gram-empty-description-block-after-linkstyle] [fixture:
flowchart/gram-empty-description-block-after-linkstyle-before-semicolon]
[fixture:
flowchart/gram-empty-description-block-splits-spaces-after-interpolate]
`style` は、カンマで分けない id と、そのスタイルで、頂点の手順を適用します。
そのため、まだどの文も作っていない頂点を加えます。
`A-->B` の後の `style C fill:red` は、スタイル `fill:red` を持つ C を加えます。
[fixture: flowchart/db-style-unknown-vertex] 頂点のほかの文より前の `style`
の文も、その頂点にスタイルを与えます。
`A-->B` の前の `style A fill:red` がそうです。
頂点の手順は subgraph を見ないので、`subgraph S` の後の `style S fill:red` は、
subgraph とは別に頂点 `S` を加えます。
[fixture: flowchart/db-style-before-vertex] [fixture:
flowchart/db-style-subgraph-id] `classDef` は、
そのスタイルの各 `\,` を `,` として読みます。
各クラス名について、その名前のクラスがなければ末尾に加え、
スタイルをそれに加えます。
`classDef c fill:a\ ,stroke:b` のスタイルは `fill:a\` と `stroke:b` の 2 つで、
`classDef c fill:a\,  stroke:b` のスタイルは `fill:a,`、空白 2 つ、
`stroke:b` の 1 つです
（[style、class、linkStyle の文](../../../spec/docs/diagrams/flowchart.ja.md#styleclasslinkstyle-の文) を参照）。
`class` は、その id とクラス名でクラスの手順を適用します。
[fixture: flowchart/db-class-def-escaped-comma] [fixture:
flowchart/db-classdef-escape-space-before-comma] [fixture:
flowchart/db-classdef-escape-space-after-comma]

**linkStyle の文。** `linkStyle` の文は、
まず `interpolate` を持つなら番号の各辺の interpolate を設定し、
次にスタイルを持つなら番号の各辺にそのスタイルを与えます。
どれも `fill` で始まらなければ、番号のすべての辺が共有するスタイルに、
`fill:none` を 1 回加えます。
この判定は始まりの空白を含めたスタイルを見るので、
空白の後に書いたスタイルは `fill` で始まりません。
`linkStyle 0 stroke:#f00 , fill:red` は `fill:none` を得ます。
[fixture: flowchart/db-linkstyle-shared-fill] [fixture:
flowchart/db-linkstyle-leading-space-fill] `interpolate`
を持ちスタイルを持たない文は、スタイルを変えません。
辺は前の文が与えたスタイルを保ち、`fill:none` も加えません。
[fixture: flowchart/db-linkstyle-interpolate-keeps-style][fixture:
flowchart/db-linkstyle-interpolate-only] `linkStyle default` は、
後で加える辺が取る既定の interpolate と、
スタイルを持つときは `edgeDefaults` の `style` を設定します。
`style` はそのスタイルで、`fill:none` は加えず、
どの辺もそれを得ません。
スタイルを持たないときは、その `style` をそのままにします。
どの文も設定していなければ null です。
[fixture: flowchart/db-default-linkstyle-interpolate-keeps-style][fixture:
flowchart/db-default-interpolate-later-edge] [fixture:
flowchart/db-linkstyle-default-no-fill]

**クリックの文。** コールバックを持つクリックは、
クリックの id とクラス `clickable` でクラスの手順を適用します。
URL を持つクリックは、id がクリックの id のどれかである各頂点に、
trim し無害化していない URL を `link`（空ならなし）として、
リンク先を `linkTarget` として与え、次に同じクラスの手順を適用します。
ツールチップは、頂点があるかどうかにかかわらず、各 id について、
その StringLiteral の `value` を trim せずにテキストとして記録します。
同じ id への後のツールチップは、位置を保ったままテキストを置き換えます。
[fixture: flowchart/db-click-on-edge] [fixture: flowchart/db-tooltip-unknown-id]
[fixture: flowchart/db-tooltip-replaced] [fixture:
flowchart/db-tooltip-untrimmed]

**アクセシビリティの文。** `accTitle:` は、タイトルをその値にします。
`accDescr:` と `accDescr {` は、説明をその値の各改行を、
その後に続く空白（改行を含む）とあわせて 1 つの改行に置き換えたものにします。
mermaid.js はこれらのテキストを trim しますが、値は両端に空白を持たないので、
何も変わりません。
2 つの形のどちらでも、後の文は前の文が設定した値を置き換えます。
`accTitle: first` の後に `accTitle: second` が続くと、タイトルは `second` で、
`accDescr:` も同じです。
`accDescr { y }` だけでは、説明は `y` です。
`accDescr: x` の後に `accDescr { y }` が続くと、説明は `y` です。
`accDescr { first }` の後に `accDescr: second` が続くと、説明は `second` です。
subgraph の中の文も、外の文と同じ説明を設定します。
そのため、subgraph の中の `accDescr: inner` の後に、
その `end` の後の `accDescr: outer` が続くと、説明は `outer` で、
`accTitle:` も同じです。
[fixture: flowchart/db-acc-title-alone]
[fixture: flowchart/db-acc-descr-line-alone]
[fixture: flowchart/db-acc-descr-lines] [fixture:
flowchart/db-acc-descr-collapse-whitespace] [fixture: flowchart/db-acc-repeated]
[fixture: flowchart/db-acc-descr-block-alone]
[fixture: flowchart/db-acc-descr-block-replaces]
[fixture: flowchart/db-acc-descr-line-replaces-block]
[fixture: flowchart/db-acc-descr-outer-replaces-subgraph]
[fixture: flowchart/db-acc-title-replaces]
[fixture: flowchart/db-acc-descr-replaces]
[fixture: flowchart/db-acc-title-outer-replaces-subgraph]
閉じていない `accDescr {` のブロックは、そのテキストにかかわらず、
空の説明を設定します。
mermaid.js は、そのテキストを読んだ後、テキストの終わりで、
2 つ目のブロックとして空のテキストを読むからです。
`accDescr: d` の後にテキストの終わりの `accDescr { x` が続くと説明は空になり、
タイトルはそのままです。
[fixture: flowchart/lex-acc-descr-block-unclosed] [fixture:
flowchart/db-acc-descr-unclosed-replaces] [fixture:
flowchart/db-acc-descr-unclosed-empty-replaces] [fixture:
flowchart/db-acc-descr-unclosed-keeps-title]
そのようなブロックはテキストの残りを取るので、
`accDescr { x` の後や、`accDescr {` と行 `x` の後の行 `B --> C` は、
辺を加えません。
[fixture: flowchart/db-acc-descr-unclosed-takes-lines] [fixture:
flowchart/db-acc-descr-unclosed-text-next-line]
それ以外では、
値が null の文は空のテキストを設定します。
一方、テキストのない閉じた説明のブロックは何も変えません。
`accDescr: x` の後にテキストの終わりの `accDescr:` が続くと説明は空になり、
`accDescr { x }` の後に続いても同じです。
一方、`accDescr: x` の後の `accDescr {  }` は `x` を保ち、
`accDescr { x }` の後の `accDescr {}` も同じです。
[fixture: flowchart/db-acc-title-empty-replaces] [fixture:
flowchart/db-acc-descr-empty-replaces] [fixture:
flowchart/db-acc-descr-block-then-empty-line] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/db-acc-descr-empty-block-after-block]

## Db の中のデータブロック

データブロックが設定する値は、
`@mmd-toolkit/tests` の `dataBlockEffects` から取ります。
データブロックを持つ頂点 1 つにつき 1 件で、
続けて書いたブロックは 1 件と数えます。
ソースの順です
（[`dataBlockEffects`](../embedded-data.ja.md#datablockeffects)
を参照）。
`A@{ label: a } & B@{ label: b } --> C@{ label: c } & D@{ label: d }` の件は、
`A`、`B`、`C`、`D` の件で、この順です。
[fixture: flowchart/db-data-block-entries-source-order] 上に挙げた位置で、
次の 1 件を適用します。
その欄を、頂点の id で最後に加えた subgraph があればそれに、
なければその id を持つ最初の辺があればそれに、
なければ頂点の手順が既に加えたその id の頂点に設定します。
[fixture: flowchart/gram-data-consecutive-blocks]

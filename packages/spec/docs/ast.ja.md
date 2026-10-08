# 抽象構文木

英語版: [ast.md](./ast.md)

この文書は、Mermaid のテキストの抽象構文木を定義します。
この仕様の実装は、ここで定めるノード名と欄名を使った木を作ります。
木を変えるときはまずここを変え、実装がそれに従います。

## 設計の目標

- **構造と値**: 木は ESTree に従う。
  ノードは、それが表すものの構造と値を持ち、
  子ノードは `Root.body` のような名前の付いた欄で持つ。
  どのノードも、汎用の子の列を持たない。
  句読点やキーワードは、どのノードも持たない単位で、
  ノードの欄がそれらの言うことを名指す。

- **図種に依存しない根**: 根は、すべての図に共通する部分を持つ。
  本文のノードの型は図種によって決まる。
- **ノードが何であるか**: ノードの型は、
  そのノードが言語の中で表すものを名前にし、
  そのテキストがどう字句解析されたかを名前にしない。
  単位の種類ごとのノードの型も、受け皿のノードもない。
  ノードの役割は、`styles` や `arguments` のように、それを持つ欄が表し、
  役割ごとの型は作らない。
- **書かれた構造**: 木は、書き手が書いた構造を、言語が意味するとおりに表す。
  同じテキストでも、位置が表すものが違えば、形が違ってよい。
  `A,B` は、頂点の id としては 1 つの名前で、`class` の後では名前の並びである。
  木は、mermaid.js が Db を作る工程（つないでから分け直す、など）を写さない。

## 欄の書き方

以下の各ノードの型には、欄の表があります。
欄の名前、型、意味を示します。
型は言葉で書きます。

- **整数**、**文字列**、**真偽値**は、通常の意味です。
  **数**は小数を持ちえます。

- 型の後に **の列** を付けたものは、その型の値の並びです。
  順序があります。
- 型の後に **または null** を付けたものは、その型の値か、
  値がないことのどちらかです。
- 括弧は型をまとめます。**(Identifier または null) の列** は、
  要素がそれぞれ Identifier か null である列です。
- **Identifier** のようなノードの型の名前は、
  その型のノードです。

どの欄も、ノードを作るときに設定し、その後は変えません。

## ノード

どのノードも、次の欄を持ちます。

| 欄     | 型     | 意味                                |
| ------ | ------ | ----------------------------------- |
| `type` | 文字列 | `Root` のような、ノードの型の名前。 |

ノードの型はそれぞれ自分の欄を加え、
ノードの子ノードはそのうちいくつかの欄の値です。
各ノードの型は、**子の欄**を述べます。
子の欄は、値が子ノードである欄で、ESLint の visitor keys のように、
木をたどる道具がそれらを訪れる順に並べます。
道具は子の欄だけをたどります。
ノードの型を加える各図の文書も、同じように子の欄を述べます。

子のノードどうしは重なりません。
子の欄の中の一覧はソースの順で、ノードの子の欄どうしも、ふつうはソースの順です。
1 つの欄が書き方によって別の位置に書かれるノードでは、そうなりません。
欄は 1 つの順を保ちます。
ESLint の visitor keys で、
`TemplateLiteral` の `quasis` が `expressions` より先にあり、
ソースでは両者が交互に並ぶのと同じです。
図の文書は、そのようなノードのところでそう述べます。
ソースの順が要る道具は、子のノードを範囲で並べます。

単位の**書かれたテキスト**は、そのソースのテキストから、
単位がその前か後に読む空白と行終端を除いたものです。
flowchart の矢印の前後の空白がその例で、
`A --> %%{init: {}}%% B` の矢印の書かれたテキストは `-->` です。
[fixture: flowchart/lex-directive-after-arrow]
値の書かれたテキストは、その最初の単位の書かれたテキストの始まりから、
最後の単位の書かれたテキストの終わりまでで、単位の間の空白と行終端を含みます。
どちらも、そこにあって値として書かれたものではないもの、つまりディレクティブ、
コメント領域、行単位の規則が無視する `;`、
文の区切りの前にある、それぞれが独立の文である空の説明ブロックを除きます。
ほかには何も除かず、足さず、書き換えません。
行終端、属性の引用符、エンティティは書き手が書いたとおりで、
[変換した形](./common.ja.md#ソースの読み方) にはしません。
変換した形は、字句解析器がテキストを読む形です。
そのため、書かれたテキストが空白か行終端で始まるか終わるのは、
単位が空白を自身の文字として持つところだけです。
閉じていない class 図のバッククォートの名前が、
テキストの終わりに持つ空白がその例です（下を参照）。
ノードの周りに書かれたほかの空白は、どのノードにも属しません。
葉のノードの値は、その書かれたテキストか、そのノードの型が述べるその一部です。
[NumericLiteral](#numericliteral) は、その書かれたテキストが書く数を持ち、
[Identifier](#identifier)、
[ClassIdentifier](./ast/class.ja.md#classidentifier)、
class 図のスタイル（[ClassLiteral](./ast/class.ja.md#classliteral) を参照）は、
その単位の書かれたテキストを順につないだものを持ちます。
[StringLiteral](#stringliteral) の引用符の間の中身、ラベルが始まる文字列の中身、
`@{` と `}` の間のデータブロックのテキストのように、
値がノード自身のテキストに属する区切りの内側の部分であるときは、値は、
その区切りの内側に書かれた空白を、両端のものも含めて保ちます。
`A[" x "]` のラベルの値は、空白、`x`、空白です。
`A@{`、改行、`shape: rect`、改行、`}` の最初のデータブロックの値は、改行、
`shape: rect`、改行です。
[fixture: flowchart/tokens-label-string-inner-whitespace] [fixture:
flowchart/gram-data-consecutive-blocks] 2 つのリテラルのノード、
[StringLiteral](#stringliteral) と [NumericLiteral](#numericliteral) は、
ESTree の `Literal` と同じく、欄 `raw` も持ちます。
これはリテラルの最初の文字から最後の文字までのソースのテキストで、
何も除かないので、
文字列の引用符やその中のディレクティブとコメント領域のように、
書かれたテキストが除くものも保ちます。

mermaid.js が読まないテキストのノード、つまり
[FlowchartIgnoredText](./ast/flowchart.ja.md#flowchartignoredtext)、
[ClassIgnoredText](./ast/class.ja.md#classignoredtext)、
[StateIgnoredText](./ast/state.ja.md#stateignoredtext)、
[StateIgnoredStatement](./ast/state.ja.md#stateignoredstatement)、
[SequenceIgnoredStatement](./ast/sequence.ja.md#sequenceignoredstatement)、
[GanttIgnoredStatement](./ast/gantt.ja.md#ganttignoredstatement) は、
書き手がそこに書いたものを、書かれたとおりに見せます。
その書かれたテキストは値の書かれたテキストで、コメントも除きます。
単位の間の空白と行終端はその一部で、コメントはその一部ではありません。
`state "d" as A` の後の行 `state %% c` と、本体のある `state {` は、
A に、`state`、空白、改行、空白 2 つ、`state` の `textBeforeBody` を与え、
本体のある行 `{` が続く `state X "" %%{init: {}}%% ""` では、
それは 2 つの空の文字列とその間の空白 2 つです。
[fixture: state/tokens-ignored-text-comment-between-units]
[fixture: state/tokens-ignored-text-hash-comment-between-units]
[fixture: state/tokens-ignored-text-directive-between-empty-strings]
[fixture: state/tokens-ignored-statement-directive-between-empty-strings]
[fixture: class/tokens-ignored-text-directive-before-direction]
[fixture: class/tokens-ignored-text-directive-after-direction]
[fixture: flowchart/tokens-ignored-text-directive-before-direction]
コメント領域が切る図のコメントは、中の空白を含めて全体が除かれ、
それを終える改行は残ります
（[コメント行](./common.ja.md#コメント行) を参照）。
`state X "" %% c`、U+2028、`%% d` の後に、行 `[*]` と、
本体のある行 `accDescr {} {` が続くとき、コメント `%% c` は行 `[*]` まで続き、
X の `textBeforeBody` は、`""`、空白、改行、空白 2 つ、`accDescr {}` です。
`%% c` の代わりに `#c` を書いても、U+2028 の代わりに U+2029 を書いても、
U+2028 の前に空白があっても、`[*]` の前に空白があっても、
`[*]` の代わりに空白だけの行があっても、
`[*]` の代わりに `x` と空白があっても同じで、その空白もコメントに入ります。
[fixture: state/tokens-ignored-text-comment-cut-by-comment-line]
[fixture: state/tokens-ignored-text-hash-comment-cut-by-comment-line]
[fixture: state/tokens-ignored-text-comment-cut-by-comment-line-paragraph-separator]
[fixture: state/tokens-ignored-text-hash-comment-cut-by-comment-line-paragraph-separator]
[fixture: state/tokens-ignored-text-comment-cut-space-before-separator]
[fixture: state/tokens-ignored-text-comment-cut-spaces-after-region]
[fixture: state/tokens-ignored-text-comment-cut-spaces-line-after-region]
[fixture: state/tokens-ignored-text-comment-cut-fragment-trailing-space]

値がリストである子の欄は、そのノードの型がそう述べるところでは、
null の要素を持つことがあります。
ESTree の配列の穴と同じです。
木をたどる道具はそれを飛ばします。

## ディレクティブとフロントマター

これらはノードではありません。
根はこれらを記録として `directives` と `frontmatter` に持ちます。
どのノードもこれらを持たず、木をたどる道具はこれらを訪れません。
各記録は `type` を持ち、次の欄はその中身を持ちます。

### Directive

`type` は `Directive` です。

| 欄       | 型     | 意味                                                                          |
| -------- | ------ | ----------------------------------------------------------------------------- |
| `name`   | 文字列 | ディレクティブの名前。例: `%%{init: {...}}%%` の `init`。                     |
| `value`  | 文字列 | `%%{` と `}%%` の間のテキスト。閉じていなければ、ディレクティブの終わりまで。 |
| `closed` | 真偽値 | ディレクティブが `}%%` で終わるかどうか。                                     |

ディレクティブは、ディレクティブの探索の 1 つの一致から、
末尾の空白を除いたものです。
探索は、
フロントマターの後のソースのテキストに対して行います
（[common.ja.md](./common.ja.md#ディレクティブの位置) を参照）。
そのため、閉じていないディレクティブは、テキストの終わりまで伸びるか、
語の引数の後で終わります。
探索が引数の後に取る空白は、
コメント領域の空白だけの行がコメントと一緒に除かれるのと同じく、
ディレクティブと一緒に除かれ、木では、ディレクティブの外の空白です。
`name` は、そこで定めたディレクティブの名前です。
木は引数を解析しません。
`value` は、フロントマターの `value` と同じく、
区切りの間に書かれたものを、名前も含めて持ちます。

`Root.directives` は設定には関わりません。
この仕様はディレクティブの引数を解析せず、
mermaid.js は図を設定するディレクティブを専用の走査で見つけ、
その結果はまれにこれらと異なります
（[設定の走査](../../tests/docs/configuration.ja.md#設定の走査) を参照）。

### Frontmatter

`type` は `Frontmatter` です。

| 欄      | 型     | 意味                                                     |
| ------- | ------ | -------------------------------------------------------- |
| `value` | 文字列 | 区切り行の間の YAML のテキスト。ソースに書かれたとおり。 |

`value` は [common.ja.md](./common.ja.md#フロントマター) で定めた本文です。
字下げは取り除かず、木は YAML を解析しません。

## Root

`type` は `Root` です。

| 欄            | 型                      | 意味                                                      |
| ------------- | ----------------------- | --------------------------------------------------------- |
| `diagramType` | DiagramType             | `flowchart-v2` のような、mermaid.js が報告する図種の id。 |
| `body`        | DiagramBody             | 図の本文。                                                |
| `frontmatter` | Frontmatter または null | ソースにフロントマターがあれば、それ。                    |
| `directives`  | Directive の列          | すべてのディレクティブ。ソースの順。                      |

子の欄は `body` だけです。
`frontmatter` と `directives` は子の欄ではありません。

`diagramType` は、
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
が `diagramType` として報告する id です。
fixture も同じ id を記録するからです。
`graph` と `flowchart` のヘッダーはどちらも `flowchart-v2`、
`flowchart-elk` は `flowchart-elk`、`swimlane-beta` は `swimlane` になります。

**DiagramType** は、次の 38 個の文字列のどれかです。
mermaid.js が検出器を試す順に並べます
（[detection.ja.md](./detection.ja.md) を参照）。
`error`、`flowchart-elk`、`mindmap`、`architecture`、`agentflow`、`c4`、
`kanban`、`classDiagram`、`er`、`gantt`、`info`、`pie`、`requirement`、
`sequence`、`swimlane`、`flowchart-v2`、`timeline`、`gitGraph`、`stateDiagram`、
`journey`、`quadrantChart`、`sankey`、`packet`、`xychart`、`block`、
`eventmodeling`、`treeView`、`radar`、`ishikawa`、`treemap`、`railroad`、
`railroadEbnf`、`railroadAbnf`、`railroadPeg`、`venn`、`wardley`、`cynefin`、
`usecase`。
pin した mermaid.js が登録する検出器の id で、`error` 疑似図種を含み、
`---` を含みません。

mermaid.js は `---` 疑似図種も登録しますが、そのパーサーは常に例外を投げるので、
それが選ぶ入力は必ず拒否されます。
これを持つ木はなく、DiagramType にも含まれません。
DiagramType の id の集合はこの仕様が定めます。
一覧には `flowchart-elk`、`mindmap`、`architecture` が含まれます。
mermaid.js はこれらを
[`includeLargeFeatures`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L87)
が真のときだけ登録しますが、npm パッケージの既定の入口では真です。

**DiagramBody** は、`ErrorDiagram` か、以下の図の節で定める本文のノードの型、
つまり [`FlowchartDiagram`](./ast/flowchart.ja.md#flowchartdiagram)、
[`SequenceDiagram`](./ast/sequence.ja.md#sequencediagram)、
[`ClassDiagram`](./ast/class.ja.md#classdiagram)、
[`StateDiagram`](./ast/state.ja.md#statediagram)、
[`ErDiagram`](./ast/er.ja.md#erdiagram)、
[`GanttDiagram`](./ast/gantt.ja.md#ganttdiagram) のどれかです。

## ErrorDiagram

`type` は `ErrorDiagram` です。
他の欄も子の欄も持たないノードです。

`error` 疑似図種の本文です（[common.ja.md](./common.ja.md#図種の検出) を参照）。
`diagramType` は `error` です。

## 共通の葉のノード

書き手が書いた名前と値は、それぞれ自分の範囲を持つ葉のノードです。
道具がソースのテキストを探さずに、それについて報告したり、
それを書き換えたりできるようにするためです。
その型は、書かれた実例の見た目ではなく、
その位置で文法が何を書くことを許すかで決まります。
`accTitle: x` の `x` は 1 語に見えますが、
その位置は空白を含むテキストを許すので、リテラルです。

- 文法が空白を含まない名前として読む位置と、
  プロパティの値のように文法が引用符のない 1 語だけを許す位置:
  [Identifier](#identifier)
- 文法が引用符で囲んだ文字列を求める位置: [StringLiteral](#stringliteral)
- 文法が数を求める位置: [NumericLiteral](#numericliteral)
- 文法が、空白を含みうる引用符のないテキストを許し、
  その終わりを文法が決める位置:
  [FlowchartLiteral](./ast/flowchart.ja.md#flowchartliteral) のような、
  図種のリテラル
- 文法が、空白を含みうる名前として読む位置:
  [SequenceIdentifier](./ast/sequence.ja.md#sequenceidentifier) や
  [ClassIdentifier](./ast/class.ja.md#classidentifier) のような、
  図種の名前のノード
- 文法が、テキスト、引用符の文字列、markdown の文字列、またはその並びを許し、
  どれで書いたかが種類として意味を持つ位置:
  [FlowchartLabel](./ast/flowchart.ja.md#flowchartlabel) のような、
  種類と値を持つ図種のラベル

最初の 3 つはどの図種でも同じ形なので、ここで定め、
名前に図種の接頭辞を付けません。
引用符のないテキスト、空白を含む名前、ラベルをどう読むか、
たとえば両端の空白を保つかどうかは図種ごとに違うので、
各図の文書が自分のリテラル、名前のノード、ラベルを定めます。
ここで定める 3 つのノードは、どれも子の欄を持ちません。
方向、形の名前、矢印の端の記号のような決まった集合の語は、
図のノードの欄の文字列のままです。
ESTree のノードの `kind` と同じです。
矢印は、[FlowchartArrow](./ast/flowchart.ja.md#flowchartarrow) や
[SequenceArrow](./ast/sequence.ja.md#sequencearrow) のような図のノードで、
その `value` はテキスト、その記号と線はそのような語です。
道具が、矢印の文字を読み直さずにそれらを読めるようにするためです。
図どうしは、同じものに同じ欄の名前と同じ語を使い
（`startMarker`、`endMarker`、`line`、
`none`、`arrow`、`cross`、`solid`、`dotted`）、
各図の文書が自分の定義を持ちます。
どの欄がどのノードを持ち、それぞれがどの単位からなるかは、各図の文書が述べます。

書き手が書いたが、図が読まず、何の効果も持たないテキストも葉のノードで、
[FlowchartIgnoredText](./ast/flowchart.ja.md#flowchartignoredtext) のように、
それを表す図の型を持ちます。
道具がソースのテキストを探さずにそれを見つけられるようにするためです。
そのようなテキストをノードにすることは、入力を拒否することより先です。
図の文書がそのようなテキストのために入力を拒否するのは、
木にそのノードを置く場所がないところだけで、
それは既知の差異になります（[known-divergences.ja.md](./known-divergences.ja.md)
を参照）。

### Identifier

空白を含まない名前や、プロパティの値のように、
文法がそれしか許さない位置の引用符のない 1 語です。
名前は、id やクラス名のように、その位置で文法が名前として読む語です。
使える文字はその位置の文法が決めるので、
click の id や辺の id は記号を含むことがあります。
空白を含みうる名前は、代わりに、
[SequenceIdentifier](./ast/sequence.ja.md#sequenceidentifier) や
[ClassIdentifier](./ast/class.ja.md#classidentifier) のような、
図種の名前のノードです。
ESTree と同じく、識別子かどうかは構文上の形で決まり、
何かを参照する必要はありません。
オブジェクトのキーや `obj.prop` の `prop` も参照ではありません。

| 欄     | 型     | 意味                                               |
| ------ | ------ | -------------------------------------------------- |
| `name` | 文字列 | その単位のテキストを順につないだもの（下を参照）。 |

その `name` は、それをなす、図の字句解析器の単位から作ります
（単位は図ごとの文書が定めます）。
各単位の書かれたテキスト（[ノード](#ノード) を参照）を、順につないだものです。
これらの単位の中にも間にも空白はないので、名前も空白を含みません。

### StringLiteral

引用符で囲んだ文字列です。
引用符は二重引用符で、class 図のバッククォートの名前と
ER 図のバッククォートの属性の語ではバッククォートです。

| 欄       | 型     | 意味                                                                                                                                                                                                                                                                   |
| -------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`  | 文字列 | その中身。図の文字列の規則が区切りの間で読むものを、書かれたテキストとしたもの。引用符が 1 組なら書かれたテキストから引用符を除いたもので、図が区切りを入れ子にするところでは、区切りをすべて除く（flowchart は [文字列](./diagrams/flowchart.ja.md#文字列) を参照）。 |
| `raw`    | 文字列 | 開きの引用符から閉じの引用符まで、閉じていなければ最後の文字までの、文字列のソースのテキスト。何も除かず、何も変換しない。引用符も、その中のディレクティブ、コメント領域、無視される `;` も含む。                                                                      |
| `closed` | 真偽値 | 文字列が閉じの引用符で終わるか。                                                                                                                                                                                                                                       |

`click A href "u"` の URL の値は `u` で、`raw` は `"u"` です。
`click A "u" "one`、改行、`%% c`、改行、`two"` では、ツールチップの値は `one`、
改行、`two` で、
その `raw` はコメント行を含む文字列の全体です。
[fixture: flowchart/gram-click-href] [fixture:
flowchart/tokens-string-literal-comment-line]
同じように、`click A href "u%%{init: {}}%%v"` の URL の値は `uv` で、
その `raw` はディレクティブを含む文字列の全体です。
[fixture: flowchart/lex-directive-in-click-href-string]

文字列は 2 つ目の引用符で閉じます。
図がテキストの終わりまで閉じていない文字列を受理するところでは
（class 図のバッククォートの名前だけです。
[文字列、バッククォートの名前、ジェネリクスの型](./diagrams/class.ja.md#文字列バッククォートの名前ジェネリクスの型)
を参照）、
その書かれたテキストは、ディレクティブにもコメント領域にも入らない、
ソースの最後の文字まで続き、
終わりの空白と行終端を含みます。
mermaid.js がそれらを名前に読むからです。
その中の改行もその一部です。
その最後の文字の後のディレクティブは、文字列の一部ではありません。
テキストの終わりの `A --> `、`` `b``、空白、`%%{init: {}}%%` は、
文字列 `` `b`` と空白を持ち、値は `b` と空白です。
[fixture: class/lex-backquote-unclosed-directive-at-end]
class 図で、`class`、`` `x``、改行、`%%{init: {}}%%`、改行は、
ディレクティブの後の改行を含めて、値 `x` と改行 2 つを持ちます。
[fixture: class/lex-backquote-unclosed-directive-after-line-break]
`raw` は閉じの引用符を持たず、
`value` は書かれたテキストから開きの引用符を除いたものです。
その `closed` は偽です。
閉じていない [Directive](#directive) や、
[FlowchartAccDescrBlockStatement](./ast/flowchart.ja.md#flowchartaccdescrblockstatement)
のような説明ブロックの `closed` と同じです。
ほかの StringLiteral の `closed` は、すべて真です。
道具は、文字列が閉じているかをこの欄から読み、
`raw` の文字を比べる必要はありません。
最後の行のバッククォート 1 つは、閉じていないバッククォートの名前で、
その `raw` は、バッククォートとその後の改行です。
[fixture: class/lex-backquote-unclosed-alone]
[fixture: class/lex-backquote-unclosed] [fixture:
class/tokens-backquote-unclosed-trailing-whitespace]

### NumericLiteral

数です。

| 欄      | 型     | 意味                               |
| ------- | ------ | ---------------------------------- |
| `value` | 数     | その書かれたテキストが書く数。     |
| `raw`   | 文字列 | 書かれたとおりの数。何も除かない。 |

`linkStyle 0,1 stroke:red` の最初の数の値は 0 で、`raw` は `0` です。
[fixture: flowchart/db-linkstyle-shared-fill]
数が取れる形は、その位置の文法が決めます。
flowchart では数字だけなので、どの数も整数です。
sequence では小数も取れるので、`autonumber .5` は 2 分の 1 から始まり、
その `raw` は `.5` です。
`autonumber 05` は 5 から始まります。
[fixture: sequence/db-autonumber-fraction] [fixture:
sequence/db-autonumber-leading-zero]

## 図ごとのノード

各図種のノードと、その欄と子の欄は、
`ast/` の下のそれぞれの文書で定めます。

- [Flowchart](./ast/flowchart.ja.md): 図種 `flowchart-v2`、`flowchart-elk`、
  `swimlane`。
- [Sequence](./ast/sequence.ja.md): 図種 `sequence`。
- [Class](./ast/class.ja.md): 図種 `classDiagram`。
- [State](./ast/state.ja.md): 図種 `stateDiagram`。
- [ER](./ast/er.ja.md): 図種 `er`。
- [Gantt](./ast/gantt.ja.md): 図種 `gantt`。

図種のノードの型の名前は、`FlowchartVertex` のように、
どれもその図種の名前で始めます。
ノードの型の名前は、すべての図種で 1 つの集まりを共有するからです。
[共通の葉のノード](#共通の葉のノード) は、
すべての図種で共有し、接頭辞を付けません。

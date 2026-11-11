# mermaid.js との互換性

英語版: [compatibility.md](./compatibility.md)

このプラグインは、適合性コーパスに記録された、
固定した版の mermaid.js の結果で確かめています。
整形は mermaid.js が図から読むものを保ち、
mermaid.js が拒否するテキストは変えません。
この文書は、それが成り立たない箇所と、その理由を挙げます。

## mermaid.js と違って読む入力

プラグインが使うパーサーは、mermaid.js と同じ入力を受理します。
ただし、意図した違いがいくつかあり、
その正確な定義は仕様の
[既知の差異](../../spec/docs/known-divergences.ja.md)にあります。
また、サイト設定を使いません。

### トークンの中のディレクティブと `;`

ディレクティブ（`%%{ ... }%%`）と、
行の規則が無視する `;` （[`;` を含む行](#-を含む行)を参照）は、
mermaid.js と同じく、取り除いて前後のテキストをつないで読みます。
任意の 2 つのトークンの間、文字列、バッククォートの名前、
空白を含みうるテキスト（ラベルのテキスト、class のクラス名、
sequence 図の参加者の id）の中に置けます。
[fixture: flowchart/directives/touching-token]
[fixture: flowchart/directives/compat-directive-in-string]
[fixture: state/directives/compat-directive-in-string]
[fixture: class/directives/compat-directive-in-backquoted-name]
[fixture: flowchart/directives/compat-directive-in-label]
[fixture: class/directives/kept]
[fixture: sequence/directives/compat-directive-in-participant-id]
[fixture: flowchart/semicolons/compat-ignored-semicolon-in-label]
[fixture: flowchart/semicolons/compat-ignored-semicolon-in-string] [fixture:
class/whitespace-between-tokens/compat-ignored-semicolon-in-backquoted-name]
[fixture: state/whitespace-between-tokens/compat-ignored-semicolon-in-string]
空白を含まない名前（flowchart と state 図の id）、数、キーワード、矢印、
`:::` や `((` のような区切り記号の中には置けません。
mermaid.js はそれを受理します。
そうした入力は構文エラーとして報告し、変えません。
[corpus fixture: flowchart/div-directive-in-id]
[corpus fixture: flowchart/div-directive-in-circle-opening]
[corpus fixture: flowchart/div-directive-inside-arrow]
[corpus fixture: sequence/div-directive-in-number]
[corpus fixture: sequence/div-directive-in-keyword]
[corpus fixture: flowchart/div-directive-in-subgraph-keyword]
[corpus fixture: class/div-directive-in-triple-colon]
[corpus fixture: state/div-directive-in-id]
たとえば、mermaid.js は、`sub%%{init: {}}%%graph S` を、
キーワード `subgraph` として読み、`A%%{init: {}}%%B-->C` を、
ノード `AB` として読みます。
受理する入力では、ディレクティブは、周りのテキストと一緒に、
書かれたまま印字します。
`A["a %%{init: {}}%% b"]` は、ラベル `a  b` のノードです。
[fixture: flowchart/directives/compat-directive-in-string]

この違いは一方向だけです。
mermaid.js が拒否する入力を受理することはありません。

### 埋め込みデータは検査しない

フロントマターの YAML、ディレクティブの中身、
図の中に `@{ ... }` で書く不透明なデータブロックは、解析しません。
埋め込みデータの書式が壊れている図、データの構造が違う図、
mermaid.js が知らない名前などを書いた図は、
mermaid.js が受理することも拒否することもあり、ここではどちらも整形します。
mermaid.js は、`%%{init:   {oops}}%%`、
JSON でない participant のデータブロック、設定の知らないキーを受理し、
データブロックの知らないノードの形と、フロントマターの壊れた YAML を拒否します。
[fixture: flowchart/directives/compat-malformed-directive-kept] [fixture:
flowchart/whitespace-between-tokens/compat-unknown-shape-data-block-kept]
[fixture: sequence/whitespace-between-tokens/compat-malformed-data-block-kept]
[fixture: flowchart/frontmatter-yaml/malformed-kept]
[fixture: flowchart/frontmatter-yaml/compat-unknown-config-formatted]
[corpus fixture: common/directive-bad-json]
[corpus fixture: flowchart/div-data-unknown-shape]
[corpus fixture: flowchart/frontmatter-invalid-yaml]

directive は書かれたまま残します。
flowchart、agentflow、kanban、sequence の 1 行のデータブロックは、
両端の内側に空白を 1 つずつ置いて印字し、
[データブロック](./flowchart.ja.md#データブロック)が定める場合は、
書かれたままにします。 [fixture: flowchart/data-blocks/one-line-padded]
[fixture: flowchart/data-blocks/one-line-space-only-padded]
[fixture: flowchart/data-blocks/one-line-touching-blocks-kept]
[fixture: flowchart/data-blocks/one-line-separate-blocks-padded]
flowchart、agentflow、kanban では、
その行が `printWidth` より長い 1 行のデータブロックは、
すべての項目が単純なキーと値なら、1 行に 1 項目ずつ複数行に分けて印字します。
変わるのは、空白、改行、項目の間の `,` だけで、キーと値の文字は保ちます。
条件は[データブロック](./flowchart.ja.md#データブロック)にあります。
[fixture: flowchart/data-blocks/long-split]
flowchart、agentflow、kanban、sequence の対象となる複数行のデータブロックと、
usecase の JSON table は、本文の全行を一定数の半角空白だけ動かします。
行どうしの字下げの差と末尾空白を保ち、単独行の `}` は文の段に揃えます。
開きの行の本文、半角空白以外の行頭空白、内部の directive、0 桁の YAML の印、
行全体を保つ行、文の最初の行より後のブロック、`tabWidth: 0` は移動を妨げます。
`useTabs` のときは、ブロックを持つ文を書かれたまま印字します。
sequence では、Mermaid がブロック全体を trim するため、
文字のある本文行が 1 行であることも必要です。
条件と理由は[データブロック](./flowchart.ja.md#データブロック)に従い、
ほかのブロックは桁を保ちます。 [fixture: flowchart/data-blocks/deep-nested-yaml]
[fixture: flowchart/data-blocks/scalar-blank-lines]
[fixture: sequence/multi-line-values/data-multiple-lines-kept]
[fixture: usecase/json-tables/tab-statement-space-body]

フロントマターは、
Prettier が YAML として読めるときは Prettier の YAML 整形で整形し、
読めないときは書かれたまま残します（[フロントマター](#フロントマター)を参照）。
[fixture: flowchart/frontmatter-yaml/formatted]
[fixture: flowchart/frontmatter-yaml/malformed-kept]

### フロントマターの中で始まる HTML タグ

mermaid.js は、フロントマターを取り除く前に、
フロントマターを含むテキスト全体で、HTML タグの中の `="..."` を書き換えます。
そのため、フロントマターの中で始まるタグが、
図の `"` の読み方を変えることがあります。
このプラグインは、フロントマターの中ではタグを探しません。

たとえば、フロントマターに `title: <a` があり、
ノードが `A[b="c">d]` の flowchart を、
mermaid.js はラベル `b='c'>d` として受理します。
このプラグインは構文エラーとして報告し、変えません。
[corpus fixture: flowchart/html-tag-starts-in-frontmatter]

### `click` は click 文だけを始める

flowchart では、`click` は予約語です。
語 `click` とその後の空白は、click 文を始めるときだけ書けます。
定義は、
仕様の
[`click-reserved-word`](../../spec/docs/known-divergences/click-reserved-word.ja.md)
にあります。
mermaid.js は、その語を読んだところで、どこでも click の文脈に入り、
それがほかの位置にある入力の一部を受理し、多くは書かれたものと違う図を描きます。
たとえば、mermaid.js は `A-->B click ""` を、
`click` と空の文字列を読み飛ばして、A から B への辺として読みます。
`subgraph Handle click events`、`A`、`end` の subgraph には、
タイトル `Handle eventsA` を付け、メンバーを持たせません。
このプラグインは、そうした入力を構文エラーとして報告し、変えません。
[corpus fixture: flowchart/gram-click-bare-after-vertex]
[corpus fixture: flowchart/db-subgraph-name-click-word]

この違いは一方向だけです。
mermaid.js が拒否する入力を受理することはありません。

### トークンの間の空の形

flowchart では、空の文字列（`""`）、空の call（`call ()`）、
文の中にある空の description ブロック（`accDescr {}`）は、何も持たず、
どの 2 つのトークンの間にも置けるので、木にはそれらを置く場所がありません。
定義は、
仕様の
[`tokenless-empty-forms`](../../spec/docs/known-divergences/tokenless-empty-forms.ja.md)
にあります。
mermaid.js は、そうした位置の多くでそれらを受理し、ないものとして読みます。
`A-->|x""|B` はラベル `x` の A から B への辺で、
`A call ()-->B` と `A accDescr {}-->B` も受理されます。
このプラグインは、そうした入力を構文エラーとして報告し、変えません。
[corpus fixture: flowchart/div-edge-label-empty-quoted-pair]
[corpus fixture: flowchart/gram-empty-call-before-link]
[corpus fixture: flowchart/gram-empty-description-block-before-link]
木に置く場所がある所、つまり文が始まる所と、文を終える区切りの前にある、
空の description ブロックは報告しません。
行に単独で書いたときや、
同じ行の別の文の後に書いたときは（`A accDescr {}` は頂点 A と空の description
ブロックです）、descriptionブロックの文です。
文字とtriviaのない通常の閉じたブロックの内側は、改行があっても`{}`です。
接する語は`accDescr{}`と接したままにします。
説明ブロックの文法がある全図種で、空白だけの内側をこの形に揃えます。
タブと Unicode の空白も含めます。
囲む空白を要する本文がないためです。
コメントや directive があるブロックの内容と必要な改行は保ちます。
通常の字下げは、
[説明ブロックの字下げ](#説明ブロックの字下げ)と各図種の構造の規則に従います。
周囲の行の保護条件も維持します。 [test: sequence Unicode and tab interiors]
[test: class Unicode and tab interiors] [test: state Unicode and tab interiors]
[test: block Unicode and tab interiors] [test: c4 Unicode and tab interiors]
[fixture: flowchart/accessibility-lines/empty-block-touching-keyword]
[アクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)に従い、
囲む文字がないので内側の空白も不要で、Dbが同じ兄弟のusecaseの形に揃えます。
[fixture:
flowchart/statements-one-per-line/compat-empty-description-block-before-statement]
[fixture:
flowchart/statements-one-per-line/compat-empty-description-block-after-statement]
[fixture:
flowchart/statements-one-per-line/compat-empty-description-block-before-separator]
[fixture:
flowchart/whitespace-between-tokens/compat-empty-description-block-own-line]
[fixture:
flowchart/multi-line-values/compat-empty-description-block-line-break-kept]

class 図でも同じです。
文法が文字列をとらない所の空の文字列、空のバッククォートの名前、
クラス名を終えない空のジェネリック型、空の call、
文の中にある空の説明ブロックがそうで、`"" A --> B`、`class A``B`、
`class A~~B` は構文エラーとして報告します。
[corpus fixture: class/div-empty-string-statement-start]
[corpus fixture: class/div-empty-backquoted-in-name]
[corpus fixture: class/div-empty-generic-in-name]
[corpus fixture: class/div-empty-call]
[corpus fixture: class/div-empty-description-block-after-annotation]
同じ行の別の文やヘッダーと並ぶ空の説明ブロックは、mermaid.js と同じく、
文です（[空の説明ブロック](./class.ja.md#空の説明ブロック)を参照）。
[fixture: class/empty-description-blocks/kept-with-statement]
[fixture: class/empty-description-blocks/after-statement]
state 図では、`A accDescr {} --> B` のように文の中にある空の説明ブロックは、
構文エラーとして報告します。
一方、`state` の後の空の文字列は、mermaid.js が何も読まないもので、
mermaid.js が読まないテキストとして受理し、書かれたまま残します。
[fixture: state/statements-one-per-line/state-names-kept]
[corpus fixture: state/div-empty-description-block-in-transition]
[corpus fixture: state/gram-state-empty-string-after-name]

sequence 図には文字列も `call` もなく、
`A->> accDescr {}+B: x` や `create accDescr {}participant A`
のように文の中にある空の説明ブロックは、構文エラーとして報告します。
[corpus fixture: sequence/div-empty-description-block-before-activation]
[corpus fixture: sequence/div-empty-description-block-after-create]
木に場所がある所の空の説明ブロックは、ほかの図と同じく文です。 [fixture:
sequence/statements-one-per-line/empty-description-block-moves-next-statement]

この違いは一方向だけです。
mermaid.js が拒否する入力を受理することはありません。

### 文字の直後のコメント

sequence 図では、コメントは `%%` から始まり、
`%%` の前の文字はその前のものに属します。
定義は、
仕様の
[`comment-takes-character`](../../spec/docs/known-divergences/comment-takes-character.ja.md)
にあります。
mermaid.js は、その文字をコメントの一部として読む場所があります。
`autonumber 5%% c` を数 5 なしで読み、
ここではメッセージ `%% c` である `A->>B:%% c` を拒否し、
ここでは拒否する行 `C%% c` を受理します。
[corpus fixture: sequence/div-comment-after-number-across-directive]
[corpus fixture: sequence/div-comment-after-text-colon]
[corpus fixture: sequence/div-comment-after-one-character-id]
このプラグインは、コメントの印の前に空白が書かれているかどうかを保ちます。
そのため、mermaid.js は `autonumber 5%% c` を前と同じに読みます。
[fixture: sequence/comments/compat-comment-touching-number-kept]
[fixture: sequence/comments/compat-comment-after-number-spaced-kept]
`A->>B:%% c` は `A ->> B: %% c` と印字し、
mermaid.js はそれをこの仕様と同じに読みます。
[fixture: sequence/comments/compat-comment-after-colon]
この仕様が拒否するものは、構文エラーとして報告し、変えません。
[corpus fixture: sequence/div-comment-after-one-character-id]

この違いは両方向にあります。

### 後の改行を取り込むコメント

class 図では、文の後のコメントは、その行の終わりで終わります。
定義は、
仕様の
[`comment-takes-line-break`](../../spec/docs/known-divergences/comment-takes-line-break.ja.md)
にあります。
mermaid.js は、その後の改行を、空白だけの行までコメントの一部として読み、
次の行を同じ文の一部として読みます。
ここでは 2 つの文である、`A --> B %% c` と行 `class C` を拒否し、
`A --> B %% c` と行 `A : +int age` を、A から `BA` への関係と読みます。
このプラグインはコメントを動かさず、そうしたコメントの後の空白だけの行も、
残します（[コメントの後の空白だけの行](#コメントの後の空白だけの行) を参照）。
そのため、mermaid.js は整形したテキストを、入力と同じに読みます。
[fixture: class/comments/compat-comment-then-class]
[fixture: class/comments/compat-comment-then-member]
[fixture: class/comments/compat-comment-then-empty-lines]
[fixture: class/comments/whitespace-line-kept]
[corpus fixture: class/div-comment-then-statement]
[corpus fixture: class/div-comment-splits-relation]

この違いは両方向にあります。

### `classDiagram` と語の文字で始まるテキスト

最初の語が `classDiagram` に ASCII の語の文字が続いたもの、
例えば `classDiagramX` のテキストは、ヘッダーがなく、ここでは拒否されます。
定義は、
仕様の
[`headerless-empty-ending`](../../spec/docs/known-divergences/headerless-empty-ending.ja.md)
にあります。
mermaid.js は、テキストが空の題、説明、call か、
click 文の終わりで開いた文字列で終わるとき、それを受理します。
このプラグインは、構文エラーとして報告し、変えません。
[corpus fixture: class/div-headerless-empty-string]
[corpus fixture: class/div-headerless-empty-title]
[corpus fixture: class/div-headerless-empty-call]

この違いは一方向だけです。
mermaid.js が拒否する入力を受理することはありません。

### バッククォートの名前とジェネリック型の始まり

class 図では、バッククォートの名前やジェネリック型のテキストは、`"`、`~`、`<<`、
`>>`、`note` などのキーワードで始まってもかまいません。
定義は、
仕様の
[`name-start-reads-unit`](../../spec/docs/known-divergences/name-start-reads-unit.ja.md)
にあります。
mermaid.js は、名前の代わりにその単位を読みます。
ここではクラス `note` を宣言する ``class `note` `` を拒否し、
ここでは `A"1"` からの関係である ``A `"1"` --> B`` を、
多重度 `1` のものと読みます。
このプラグインは、バッククォートの名前とジェネリック型を書かれたまま残します。
[fixture:
class/whitespace-between-tokens/compat-backquoted-name-start-reads-unit]
[fixture: class/generic-types/compat-start-reads-unit]
[corpus fixture: class/div-backquote-starts-with-keyword]
[corpus fixture: class/div-generic-starts-with-keyword]

この違いは両方向にあります。

### サイト設定

パーサーは、ページが mermaid.js に渡すサイト設定を知りません。
`maxEdges` の設定（既定は 500）より多くの辺を持つ flowchart を、
mermaid.js は拒否しますが、パーサーは受理し、プラグインは整形します。
[fixture: flowchart/chains/compat-more-edges-than-max-edges]
[corpus fixture: flowchart/config-max-edges-exceeded]

## 後の改行と一緒に読まれる語

mermaid.js は、`accTitle`、`accDescr`、`direction`、`click`、`call`、
`href` の語の後の空白を、改行も含めて語と一緒に読みます。
この読み方は、
仕様の [文の文脈](../../spec/docs/diagrams/flowchart.ja.md#文の文脈)と、
[クリックとコールバック](../../spec/docs/diagrams/flowchart.ja.md#クリックとコールバック)
にあります。
そうした語の後の `;` は 2 つの文を区切りますが、
代わりに置いた改行は区切りません。
`accTitle ; :` は頂点 `accTitle` と `:` ですが、
`accTitle` と `:` を 2 行に書くとアクセシビリティのタイトルになります。
方向の行は、どんな文字の並びの後の `direction` も読みます。
そのため、文がこれらの id か、`direction` で終わる id で終わり、
次の文との間を `;` が区切るときは、文を行にまとめ、`;` をその位置に残します。
文の中の空白は通常どおり整形します。
[fixture: flowchart/statements-one-per-line/semicolon-after-word-kept]
[fixture: flowchart/statements-one-per-line/semicolon-after-link-to-word-kept]
[corpus fixture: flowchart/lex-acc-title-semicolon-before-colon]
[corpus fixture: flowchart/lex-direction-line-semicolon-before-value]
[corpus fixture: flowchart/lex-call-keyword-semicolon]
[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照してください。

そのような行の最後の `;` を印字が落とすかどうかは、
印字した行で規則が無視する `;` がどれかを決めます。
そのため、`;` の印字と、`:` と `#` の間の空白（接するか、空白 1 つ）は、
同じ 1 つの答えで決めます。
`;` が文を区切る図種（flowchart、sequence 図、象限チャート、XY チャート）では、
行末の無視される `;` を落とし、その前の空白は通常どおり整形します。
そうでない class、state、ER、requirement、block、Venn、usecase の図でも、
行の規則が無視する `classDef` と `style` の行末の `;` は削除し、
スタイルの空白を通常どおり整形します。
ほかのセミコロンは、その行と隙間を保ちます。
[fixture: flowchart/semicolons/style-line-dropped-semicolon-formats-the-gap]
[fixture:
xychart/statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture:
quadrant/statements-one-per-line/line-rule-line-with-a-dropped-semicolon-formats-the-gap]
[fixture:
class/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-touching-kept]
[fixture:
class/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-becomes-one-space]
[fixture:
state/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-touching-kept]
[fixture:
state/whitespace-between-tokens/line-rule-line-gap-between-colon-and-hash-becomes-one-space]
[fixture:
block/multi-line-statements/line-rule-semicolon-after-touching-arrow-kept]
[fixture: block/multi-line-statements/line-rule-semicolon-after-an-id-kept]
[fixture: block/multi-line-statements/semicolon-after-spaced-arrow-is-an-id]

## スタイルの末尾の空白

`style`、`classDef`、`linkStyle` の文の末尾の空白は取り除きます。
[fixture: flowchart/style-trailing-whitespace/removed]
mermaid.js はその空白を最後のスタイルの末尾に残すので、
ここでは整形が mermaid.js の保存するものを変えます。
これとは別に、
eventmodeling の [Data blocks](./eventmodeling.ja.md#data-blocks)
も限定した本文の字下げの変更を認めています。
テストは、末尾の空白を除いたスタイルを比べます。

取り除くと mermaid.js が文を拒否する箇所では、空白を保ちます。
`style A fill:#f00, ` のように、並びの末尾の `,` の後です。
[fixture: flowchart/style-trailing-whitespace/whitespace-only-value-kept]
[corpus fixture: flowchart/db-style-whitespace-only-value]
[スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白)
を参照してください。

## 同じに描かれるスタイル

flowchart、agentflow、class、state、block、usecase の `style`、`classDef`、
`linkStyle` の文は、ER や requirement と同じ形でスタイルを印字します。
スタイルの最初の `:` の前に空白を置かず、値が空でなければ、
後ろに空白を 1 つ置きます。
スタイルの間の `,` の前にも空白を置かず、後ろに空白を 1 つ置きます。
`style A fill :#f00,stroke:  #333` は `style A fill: #f00, stroke: #333`
になります。
スタイルの語と語の間の空白とタブの連なりは、空白 1 つで印字します（後述）。
[fixture: flowchart/whitespace-between-tokens/style-colon-spaced]
[fixture: flowchart/whitespace-between-tokens/style-colon-empty-value-kept]
[fixture: agentflow/single-space-gaps/style-colon-spaced]
[fixture: class/whitespace-between-tokens/style-colon-spaced]
[fixture: state/whitespace-between-tokens/style-colon-spaced]
[fixture: block/styles/style-colon-spaced]
[fixture: usecase/classes-and-styles/css-colon-padding]

mermaid.js はこの空白を Db に残すので、印字したテキストの Db は、
書かれたテキストの Db と違いますが、描かれる図は同じです。
[`styles2Map`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L44-L51)
は、図形の CSS を作る前に、スタイルの名前と値の前後の空白を取り除きます。
class の図形と flowchart のリンクは、スタイルを CSS の `style` 属性に入れ、
スタイルの末尾のバックスラッシュの後を除き、
`:` や `;` の前後の空白は読まれません（後述）。
それぞれの文について、両方のテキストを mermaid.js 12.3.0 で Chromium に描き、
画素が同じで、
生成された id とその空白を除いた SVG も同じであることを確かめました。
対象は、5 つの図種の `style` と `classDef`、
それに番号か `default` を指定した `linkStyle` のスタイルですが、
次の場合を除きます。

usecase 図も同じ仕組みで図を描きます。
actor、use case、境界、JSON の表のスタイルは、`cssStyles` として図形に届きます。
（[`usecaseDb`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L354-L355)）。
図形は、それらとクラスのスタイルから `styles2String` で CSS を作り、
`styles2Map` を通してスタイルの名前と値の前後の空白を取り除きます。
（[`usecaseEllipse`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/usecaseEllipse.ts#L14)、
[`usecaseActor`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/usecaseActor.ts#L160)、
[`usecaseJsonTable`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/usecaseJsonTable.ts#L62-L63)）。
クラスのスタイルは、その前に前後の空白を取り除きます。
（[`getCompiledStyles`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L118-L135)）。
関係のスタイルは `style` として辺に渡り、path の `style` 属性に入ります。
（[`usecaseDb`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/usecase/usecaseDb.ts#L472-L473)）。
actor に付けた `style A stroke:#d33,fill:#fee` と
`style A   stroke  :  #d33 ,  fill : #fee` の両方のテキストを、use case、境界、
JSON の表に付けたものも含め、mermaid.js 12.3.0 で Chromium に描いたところ、
SVG は同じでした。
actor に付けた `classDef c stroke:#d33,fill:#fee` と
`classDef c stroke: #d33, fill  :  #fee` も同じでした。
関係に付けた `style e1 stroke-width:3px,fill:none` と
`style e1 stroke-width: 3px, fill  :  none`、
それに関係に付けた `classDef` では、画素が同じで、
path の `style` 属性の `:` と `;` の前後の空白を除いた SVG も同じでした。

treemap の `classDef` は、スタイルの末尾の空白を落とします。
`classDef zz color:red  ` は `classDef zz color:red` と印字します。
mermaid.js はその空白を Db に残しますが、同じ図を描きます。
クラスをノードに付けて描いたところ、画素は同じでした。
[fixture: treemap/styles/trailing-before-semicolon]
[fixture: treemap/trailing-whitespace/style-content]

番号を指定した `linkStyle` は、`,` の後のスタイルが空白で始まるときに、
描かれる図が変わります。
[`updateLink`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L417-L440)
は、リンクのスタイルのどれも `fill` で始まらないときに、`fill:none` を足します。
前に空白があるスタイルは `fill` で始まりません。
`linkStyle 0 stroke:#f00,fill:red` ではリンクが赤で塗られ、
`linkStyle 0 stroke:#f00, fill:red` では mermaid.js が `fill:none`
を足すので塗られません。
そのため、flowchart と agentflow では、`fill-opacity` も含め、
`fill` で始まるスタイルの前に空白があるかないかを保ち、
空白の連続は空白 1 つにします。
[fixture: flowchart/whitespace-between-tokens/link-style-fill-after-comma-kept]
[fixture: flowchart/whitespace-between-tokens/link-style-fill-opacity-after-comma-kept]
[fixture: agentflow/single-space-gaps/link-style-fill-after-comma-kept]
[fixture: agentflow/single-space-gaps/link-style-fill-opacity-after-comma-kept]
この文のほかのスタイルと `linkStyle default` のスタイルは、
`stroke:` で始まるスタイルを除き、1 つの形で印字します（後述）。
[fixture: flowchart/whitespace-between-tokens/link-style-other-after-comma-spaced]
[fixture: flowchart/whitespace-between-tokens/link-style-default-after-comma-spaced]

リンクのスタイルでは、`stroke:` の有無を調べます。
[`insertEdge`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L956-L957)
はリンクのスタイルから `stroke:` を探し、
[`addEdgeMarker`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edgeMarker.ts#L105-L127)
は矢印の頭をその色にします。
`stroke :` は該当しません。
`linkStyle 0 stroke :#f00` では線が赤で、矢印の頭はテーマの色のままですが、
`linkStyle 0 stroke: #f00` では両方が赤なので、画素が異なります。
`linkStyle default` と、リンクに付けた `classDef` でも同じです。
そのため、flowchart と agentflow の `linkStyle` と `classDef` では、
`stroke` で終わる名前と `:` の間の空白の有無を保ち、
空白の連続は空白 1 つにします。
`linkStyle 0 stroke  :#f00` は `linkStyle 0 stroke : #f00` と印字します。
`style` はノードに適用され、1 つの形で印字します。
`style A stroke :#f00` と `style A stroke: #f00` の画素は同じでした。
[fixture: flowchart/whitespace-between-tokens/link-style-stroke-before-colon-kept]
[fixture: flowchart/whitespace-between-tokens/class-def-stroke-before-colon-kept]
[fixture: flowchart/whitespace-between-tokens/style-stroke-before-colon-spaced]
[fixture: agentflow/single-space-gaps/link-style-stroke-before-colon-kept]

usecase 図の `style` と `classDef` は、明示的な id を持つ関係に適用できるため、
どちらもこの空白の有無を保ちます。
`A e1@--> B` の `e1` に `classDef c stroke:#d33` を付けると矢印の頭が赤になり、
`classDef c stroke :#d33` を付けるとテーマの色を保ちます。
`style e1 stroke :#d33` も同じで、画素が異なります。
`style` でも、`stroke` で終わる名前と `:` の間の空白の有無を保ち、
空白の連続は空白 1 つにします。
`style A stroke  :#d33` は `style A stroke : #d33` と印字し、
`style A stroke:#d33` は `style A stroke: #d33` と印字します。
[fixture: usecase/classes-and-styles/css-stroke-before-colon-kept]
[fixture: usecase/classes-and-styles/css-stroke-before-colon-run-collapsed]
[fixture: usecase/classes-and-styles/css-stroke-before-colon-touching]

look が `handDrawn` のときは、リンクのスタイルの先頭も読まれます。
[`insertEdge`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L899)
は、リンクのスタイルのうち、
`stroke:` で始まる最初のもの全体を矢印の頭の色として使い、それ以上は探しません。
前に空白があるスタイルは `stroke:` で始まりません。
この look での `linkStyle 0 fill:none,stroke:#f00` と、
`linkStyle 0 fill:none, stroke:#f00` の画素は同じで、前者の SVG には、
色が `stroke:#f00` の矢印の頭の定義が 1 つ多くありました。
そのため、flowchart と agentflow では、
番号か `default` を指定した `linkStyle` で、
スタイルが `stroke:` で始まるときは、`fill` で始まるスタイルと同じく、
前に空白があるかないかを保ち、空白の連続は空白 1 つにします。
[fixture: flowchart/whitespace-between-tokens/link-style-stroke-after-comma-kept]
[fixture: agentflow/single-space-gaps/link-style-stroke-after-comma-kept]

値が空白だけの `stroke:` も読まれます。
mermaid.js は、最初の `stroke:` の後から `;` までの文字から色を取り、
その文字が空白だけなら、次の `stroke:` を試さず、色を付けません。
`linkStyle 0 stroke: ,stroke:#f00` では矢印の頭がテーマの色を保ち、
`linkStyle 0 stroke:, stroke: #f00` では赤になるので、画素が異なります。
そのため、`linkStyle` のスタイルのうち、名前が `stroke` で終わり、
値が空白とタブだけのものは、その空白も含めて書かれたままにします。
通常ならスタイル文の末尾の空白を落とす文末でも、同じです。
（[スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白)）。
その後の `stroke:` で始まるスタイルは、上の規則に従います。
`linkStyle 0 stroke: ,stroke:#f00` は、
`linkStyle 0 stroke: ,stroke: #f00` と印字します。
`classDef` には影響しません。
リンクに付けた `classDef c stroke: ,stroke:#f00` と、
`classDef c stroke:, stroke: #f00` の画素は同じでした。
[fixture: flowchart/whitespace-between-tokens/link-style-blank-stroke-value-kept]
[fixture: flowchart/style-trailing-whitespace/link-style-blank-stroke-value-at-end-kept]
[fixture: agentflow/single-space-gaps/link-style-blank-stroke-value-kept]

flowchart と agentflow の `classDef` では、
バックスラッシュは `,` をエスケープします。
`classDef c fill:a\,b` はスタイル `fill:a,b` です。
そのため、バックスラッシュと `,` の間の空白は残します。
空白がないと、`,` はスタイルを終えず、その一部になるからです。
これらの図種の `style` と `linkStyle`、それにほかの図種では、
`,` は必ずスタイルを終え、その前のバックスラッシュは、`,` をエスケープしません。
`style A fill:#f00\,stroke:#00f` は、
`fill:#f00\` と `stroke:#00f` の 2 つのスタイルを持ちます。
バックスラッシュの後で `:` の前にある空白は、どの図種でも、
除くと `:` がエスケープされるので残し、その空白の後ろの空白は除きます。
[fixture: flowchart/whitespace-between-tokens/style-colon-escaped-space-run-dropped]
[fixture: flowchart/whitespace-between-tokens/style-escaped-space-before-comma]
[fixture: flowchart/whitespace-between-tokens/style-backslash-before-comma]
[fixture: agentflow/single-space-gaps/style-escaped-space-before-comma]
[fixture: agentflow/single-space-gaps/style-backslash-before-comma]
[fixture: block/styles/style-backslash-before-comma]
[fixture: class/whitespace-between-tokens/style-backslash-before-comma]
[fixture: state/whitespace-between-tokens/style-backslash-before-comma]

スタイルの末尾のバックスラッシュの後の空白は、mermaid.js が空白を取り除かず、
スタイルを書かれたままつなぐ箇所で読まれます。
リンクのスタイルは、`;` でつないで path の CSS テキストにします。
（[`insertEdge`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L936-L954)）。
`getStylesFromArray` は block 図のノードの `style` に同じ処理を行い、
block arrow と group の形が、それを `style` 属性に入れます。
（[`getStylesFromArray`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L443-L459)、
[`blockArrow`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/blockArrow.ts#L217)、
[`composite`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/composite.ts#L29)）。
class の `style` では、`classBox` が同じ処理を行い、
各部分の `style` 属性へ入れます。
（[`classBox`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/classBox.ts#L36)）。
適用先のクラスより後に書かれた `classDef` にも、同じ処理を行います。
その場合は、
`defineClass` がスタイルをクラスのスタイルへ書かれたまま足すからです。
（[`defineClass`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/class/classDb.ts#L363-L367)）。
スタイルの末尾のバックスラッシュは後ろの `;` をエスケープし、
その後のスタイルが失われます。
`linkStyle 0 stroke-width:4px\ ,stroke:#0f0` では線が緑で、
`linkStyle 0 stroke-width: 4px\,stroke: #0f0` では黒なので、画素が異なります。
`linkStyle default`、agentflow、block 図の block arrow と group、
class の `style A fill:abc\ ,stroke:green` でも同じ結果です。
class では枠が緑になるかどうかが変わります。
そのため、リンクの番号か `default` を指定した `linkStyle` と、
block 図の `style` と、class 図の `style` と `classDef` で、
バックスラッシュで終わるスタイルは、その後に空白があるかないかを保ち、
空白の連続は最初の 1 文字にします。
通常ならスタイル文の末尾の空白を落とす文末でも、同じです。
（[スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白)）。
末尾の 2 つのバックスラッシュは互いにエスケープし、
`linkStyle 0 stroke-width:4px\\ ,stroke:#0f0` と、
その空白がないものの画素は同じだったので、その後の空白は落とします。
ほかのスタイルには影響しません。
ほかの図種の `classDef`、flowchart と agentflow と state 図のノードの `style`、
block 図のほかの形の `style` です。
mermaid.js がスタイルを使う前に両端の空白を取り除くからです。
（[`getCompiledStyles`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1156-L1168)、
[`styles2Map`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/handDrawnShapeStyles.ts#L44-L51)）。
両方の書き方の画素は同じでした。
class 図の `classDef` も、適用先のクラスより前に書かれていれば、
両端の空白が取り除かれ、画素は同じでした。
ただし、2 つの扱いは文の順序だけで決まるので、
フォーマッターはどちらの順序でも書かれたまま保ちます。
ER、requirement、treemap の図では、スタイルの中のバックスラッシュを拒否します。
[fixture: flowchart/whitespace-between-tokens/link-style-backslash-space-kept]
[fixture: agentflow/single-space-gaps/link-style-backslash-space-kept]
[fixture: flowchart/style-trailing-whitespace/link-style-backslash-at-end-kept]
[fixture: agentflow/trailing-whitespace/link-style-backslash-at-end-kept]
[fixture: block/styles/style-backslash-space-kept]
[fixture: block/styles/style-backslash-at-end-kept]
[fixture: class/whitespace-between-tokens/style-backslash-space-kept]
[fixture: class/whitespace-between-tokens/style-backslash-at-end-kept]
[fixture: flowchart/whitespace-between-tokens/style-backslash-space-dropped]
[fixture: agentflow/single-space-gaps/style-backslash-space-dropped]
[fixture: state/whitespace-between-tokens/style-backslash-space-dropped]
[fixture: block/styles/class-def-backslash-space-dropped]
[fixture: class/whitespace-between-tokens/class-def-backslash-space-kept]
[fixture: class/whitespace-between-tokens/class-def-backslash-at-end-kept]

block 図のノードのスタイルの先頭も読まれます。
`getStylesFromArray` は、`color:` か `text-align:` で始まるスタイルを、
ノードのラベルのスタイルに、ほかのスタイルを図形のスタイルに入れます。
（[`getStylesFromArray`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L443-L459)）。
block arrow の形は、ラベルのスタイルを書かれたまま使います。
（[`blockArrow`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/blockArrow.ts#L205)）。
空白で始まるスタイルや、`color` と `:` の間に空白があるスタイルは、
このようには始まりません。
`style K fill:#ff0,color:red` では block arrow のラベルが赤で、
`style K fill: #ff0, color: red` では黒なので、画素が異なります。
`style K color :red` でも、
ラベルが 2 行の block arrow の `style L fill:#ff0,text-align:left` でも、
同じ結果です。
そのため、block 図の `style` では、
`color:` か `text-align:` で始まるスタイルは、前に空白があるかないかを保ち、
名前 `color` か `text-align` は、`:` との間に空白があるかないかを保ち、
空白の連続は空白 1 つにします。
block 図のほかの形は、スタイルから `styles2String` で、
ラベルのスタイルを作り直し、空白を取り除きます。
これらの形でも `classDef` でも、両方の書き方の画素は同じでした。
[fixture: block/styles/style-label-styles-kept]

flowchart、agentflow、class、state、block、usecase、treemap、ER、
requirement の図では、`:` のあるスタイルでも、ないスタイルでも、
語と語の間の空白とタブの連続を空白 1 つで印字し、
語と語の間に空白があるかどうかは、書かれたまま残します。
`style A fill   #f00` は `style A fill #f00` と印字し、
`style A fill#f00` はそのままです。
CSS は連なりを 1 つの空白として読むので、描かれる図は同じですが、
連なりが値の文字になる所は、書かれたまま残します。
文字列（`"…"` や `'…'`）の中、コメント（`/* … */`）の中、`url(` の括弧の中と、
CSS が値の一部として読む、バックスラッシュの後ろのエスケープです。
エスケープは、最大 6 桁の 16 進数字とその直後の空白かタブ 1 文字、
または 16 進数字が続かないときの次の 1 文字です。
そのため、`a\   b` は `a\  b` と印字し、
`Arial\20   Black` は `Arial\20  Black` と印字します。
閉じていない文字列、コメント、`url(` は、スタイルの末尾まで続きます。
[fixture: flowchart/whitespace-between-tokens/style-string-runs-kept]
[fixture: flowchart/whitespace-between-tokens/style-backslash-run-spaced]
[fixture: flowchart/whitespace-between-tokens/style-hex-escape-run-spaced]
[fixture: flowchart/whitespace-between-tokens/style-hex-escape-tab-run-spaced]
[fixture: flowchart/whitespace-between-tokens/style-hex-escape-seven-digits-run-spaced]
[fixture: state/whitespace-between-tokens/style-hex-escape-run-spaced]
[fixture: agentflow/single-space-gaps/style-hex-escape-run-spaced]
[fixture: block/styles/style-hex-escape-run-spaced]
[fixture: state/whitespace-between-tokens/style-string-runs-kept]
[fixture: state/whitespace-between-tokens/style-url-runs-kept]
[fixture: state/whitespace-between-tokens/style-comment-runs-kept]
[fixture: block/styles/style-string-runs-kept]
[fixture: block/styles/style-url-runs-kept]
[fixture: usecase/classes-and-styles/css-string-runs-kept]
[fixture: usecase/classes-and-styles/css-url-runs-kept]
[fixture: class/whitespace-between-tokens/style-url-runs-kept]
[fixture: class/whitespace-between-tokens/style-comment-runs-kept]

mermaid.js は、class 図では `:` のないスタイルの語を、
ER と requirement の図ではすべてのスタイルの単位をつなげて読むため、
そこで Db は変わりません。
`stroke-dasharray: 5   5` と `stroke-dasharray: 5 5` は、
ER と requirement の図では、どちらも `stroke-dasharray:55` と読みます。
ほかの図種と、class 図の `:` のあるスタイルは、`:` の前後の空白と同じように、
空白の連続を Db に残しますが、描かれる図は同じです。
次のそれぞれについて、両方のテキストを、
空白の連続を書かれたままにした形と空白 1 つで印字した形で、
mermaid.js 12.3.0 を使い Chromium に描きました。
画素は同じでした。
生成された id と `style` 属性・`fill` 属性の空白の連続を除くと、
SVG も同じでした。
class 図では、`style A border:2px   solid   red`、`style A font:20px   serif`、
`style A fill:#f00   stroke:blue`、`style A fill:#f00,   x   y`、
語の間をタブで区切った `style A border:2px solid red` と、
クラスに適用した `classDef` です。
flowchart と agentflow の図では、語を持つ `style`、`classDef`、`linkStyle` の、
`:` があるものとないものです。
state と block の図では、同じ値を持ち、連なりの隣に文字列、コメント、
`url(` がある `style` と `classDef` です。
usecase 図では、同じ値を持つ `style` と `classDef` です。
treemap では、`:` と `,` の前後の空白、語の間の連続、文字列、
エスケープされた `,`、末尾の空白を持つ `classDef` です。
このほかに、コーパスとこのパッケージの fixture の文のうち、
整形でスタイルが変わるものも同じ方法で描きました。
1,355 個のテキストが `style`、`classDef`、`linkStyle` のいずれかを持ちます。
そのうち Db が変わる 769 個では、754 個は画素が同じで、
10 個は整形前も整形後も描けません（mermaid.js がエラーで止まります）。
5 個はアニメーションするリンクを持つユースケース図で、
アニメーションのフレームによって画素が異なりますが、
`style` 属性の空白を除くと SVG は同じです。
コーパス、このパッケージの fixture、
mermaid.js の文書にある treemap の `classDef` の文で、
整形でスタイルが変わるものも同じ方法で描きました。
78 個のテキストすべてで画素は同じで、`style` 属性の空白を除くと SVG も同じです。
mermaid.js は treemap の各スタイルのテキストを Db に保ち、
描く前に最初の `:` の前のテキストを名前、次の `:` までのテキストを値として取り、
それぞれの前後の空白を取り除きます。
16 進のエスケープがフォント名を決める場合も描きました。
flowchart、state、block、agentflow、swimlane の図で、
`style A font-family:\41   rial,font-size:30px` と、
印字した `font-family: \41  rial, font-size: 30px` の画素は同じですが、
エスケープの後ろの連続をすべて縮めた `\41 rial` は別の図を描きます。
`:` で始まる style は、これらの図と class、ER、requirement の図で、
書かれたままの形と印字した形を描きました。
`:` がバックスラッシュと空白の後ろにある style も同じで、
style の中のバックスラッシュを受け付ける、flowchart、agentflow、swimlane、
state、block の図で描きました。
`style A :  red   x` と `style A : red x`、
`style A fill\   :red   x` と `style A fill\ : red x` の画素は、
それぞれ同じです。 [fixture: treemap/styles/spaced]
[fixture: treemap/styles/escaped-comma-spaced]
[fixture: class/whitespace-between-tokens/style-value-words-spaced]
[fixture: class/whitespace-between-tokens/style-words-run-spaced]
[fixture: flowchart/whitespace-between-tokens/style-words-run-spaced]
[fixture: agentflow/single-space-gaps/style-words-run-spaced]
[fixture: state/whitespace-between-tokens/style-words-run-spaced]
[fixture: block/styles/style-words-run-spaced]
[fixture: usecase/classes-and-styles/css-words-run-spaced]
[fixture: er/styles-and-classes/style-words-run-spaced]
[fixture: requirement/styles-and-classes/style-words-run-spaced]
[fixture: class/whitespace-between-tokens/style-words-directive-kept]
[fixture: flowchart/whitespace-between-tokens/style-words-directive-kept]

次の場合は、文を書かれたまま残します。
スタイルが改行か U+2028・U+2029 を含む場合、
文がコメントかディレクティブを含む場合、スタイルが全部空白の場合、
行に自分の `;` がある場合です（[`;` を含む行](#-を含む行)を参照してください）。
[fixture: flowchart/whitespace-between-tokens/style-blank-style-kept]
[fixture: flowchart/whitespace-between-tokens/style-colon-escaped-space-kept]
[fixture: flowchart/whitespace-between-tokens/style-comma-beside-directive-kept]
[fixture: flowchart/whitespace-between-tokens/style-comma-with-kept-semicolon-kept]

テストは、印字したテキストの Db を、
書かれたテキストの Db
からスタイルの余白を戻して比べます（`tests/style-margins.ts` の
`styleDbForFormattingComparison`）。
スタイルが書かれたものと、両端と最初の `:` の前後の空白や、
上の図種での語の間の空白の連続（文字列、コメント、`url(` の中と、
バックスラッシュの後ろのエスケープを除く）だけが違うときは、
書かれた方を採ります。
ほかの違いは、スタイルの語と語の間の空白の有無、文字列、コメント、
`url(` の中の連なりの変化、リンクのスタイルの数や、
リンクにも適用されるスタイルの `stroke` の `:` の前の空白の有無、
`stroke:` で始まるリンクのスタイルの前の空白の有無、
リンクの `stroke` の空白だけの値の中の空白の有無、
mermaid.js が書かれたままつなぐスタイルの末尾で、
バックスラッシュの後に空白があるかないか、
`color:` か `text-align:` で始まる block のスタイルの前や、
その名前と `:` の間の空白の有無も含めて、失敗とします。
固定している mermaid.js の版を上げるときは、これらの種類の文を描き直し、
SVG と画素を比べてから、例外を残します。

## 同じに描かれるキーワードの後のテキスト

Gantt、user journey、timeline、sequence、Venn、C4 の図では、タイトル、
Gantt 図の日付書式と軸の書式を、キーワードの後に空白を 1 つ置き、
テキストの先頭と末尾の空白を除いて印字します。
C4 図の説明 `accDescription` も同じです。
`title   Plan  ` は `title Plan` と印字し、
`dateFormat   YYYY-MM-DD` は `dateFormat YYYY-MM-DD` と印字します。
テキストの中の空白は書かれたままにし、
空白とタブだけのテキストも書かれたままにします。
timeline の行の最後の event と、別名を持つ state の 2 つ目の説明も、
同じように末尾の空白を除きますが、先頭の空白は除きません。
その空白は timeline のコロンをそろえます。
`2020 : e   ` は `2020 : e` と印字し、
`state "d" as A : x   ` は `state "d" as A : x` と印字します。
同じ行のテキストの後にコメントがある場合は、空白 1 つでテキストと隔てます。
ディレクティブがある場合は、それぞれの前に空白があるかないかを保ち、
空白の連続は空白 1 つにします。
最後のディレクティブの後の空白は、ほかの行末の空白と同じように除くので、
その空白の有無で印字は変わりません。
ほかの図種の行末のディレクティブも同じです。
（[ディレクティブ](./flowchart.md#directives)を参照してください）。
`title T  %%{x}%%  %%{y}%%` も `title T  %%{x}%%  %%{y}%%  ` も
`title T %%{x}%% %%{y}%%` と印字し、
`title T%%{x}%%%%{y}%%  ` は `title T%%{x}%%%%{y}%%` と印字し、
`state "d" as A : x  %%{x}%%  ` は `state "d" as A : x %%{x}%%` と印字します。
mermaid.js はテキストを読む前にディレクティブを除くので、
その周りの空白はテキストの末尾の空白になり、どのような空白でも同じに描きます。
これは、Gantt、user journey、timeline、sequence、Venn、C4、pie、radar、packet、
architecture、gitGraph、cynefin、treemap、Wardley、treeView、info、
railroad の図のタイトル、
それらの図種と usecase 図の `accTitle:` と `accDescr:` の行、ishikawa 図、
mindmap、treeView のノードのテキスト、
kanban ボードのカードのテキスト（図が依存する列の id は除く）、
Gantt 図の日付書式と軸の書式、C4 図の `accDescription`、
timeline の行の最後の event、別名を持つ state の 2 つ目の説明に当てはまります。
日付書式、軸の書式、`accTitle:` の行の値の中の空白とタブの連続は、
ディレクティブの前でも、
ディレクティブがない場合と同じように書かれたままにします。
[fixture: ishikawa/trailing-whitespace/directives-end-blanks-dropped]
[fixture: usecase/direction-and-accessibility/acctitle-trailing-directive-blanks-dropped]
[fixture: treeview/trailing-whitespace/directives-end-blanks-dropped]
[fixture: gantt/settings/format-runs-kept-before-directives] [fixture:
gantt/titles-and-sections/title-two-directives-trailing-blanks-dropped]
[fixture: pie/title/title-directives-end-blanks-dropped]
[fixture: radar/title/title-directives-end-blanks-dropped]
[fixture: packet/title/title-directives-end-blanks-dropped]
[fixture: architecture/title/title-directives-end-blanks-dropped]
[fixture: gitgraph/title-and-common-values/title-directives-end-blanks-dropped]
[fixture: cynefin/title/title-directives-end-blanks-dropped]
[fixture: treemap/title/title-directives-end-blanks-dropped]
[fixture: wardley/title/title-directives-end-blanks-dropped]
[fixture: treeview/title/title-directives-end-blanks-dropped]
[fixture: info/title/title-directives-end-blanks-dropped]
[fixture: railroad/title/title-directives-end-blanks-dropped]
[fixture: pie/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: radar/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: packet/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: architecture/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: gitgraph/title-and-common-values/acc-directives-end-blanks-dropped]
[fixture: cynefin/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: treemap/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: wardley/accessibility/acc-directives-end-blanks-dropped]
[fixture: treeview/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: info/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: railroad/accessibility-lines/acc-directives-end-blanks-dropped]
[fixture: gantt/settings/format-two-directives-trailing-blanks-dropped]
[fixture:
journey/titles-and-sections/title-two-directives-trailing-blanks-dropped]
[fixture:
timeline/titles-and-sections/title-two-directives-trailing-blanks-dropped]
[fixture: sequence/title/title-two-directives-trailing-blanks-dropped]
[fixture: venn/title/title-two-directives-trailing-blanks-dropped]
[fixture: c4/title-and-accdescription/title-two-directives-trailing-blanks-dropped]
[fixture:
c4/title-and-accdescription/description-two-directives-trailing-blanks-dropped]
[fixture:
timeline/periods-and-events/event-two-directives-trailing-blanks-dropped]
[fixture:
state/aliases/second-description-two-directives-trailing-blanks-dropped]
[fixture: gantt/titles-and-sections/title-trailing-directive-blanks-dropped]
[fixture: venn/title/title-trailing-directive-blanks-dropped]
[fixture: c4/title-and-accdescription/title-trailing-directive-blanks-dropped]
[fixture: c4/title-and-accdescription/description-trailing-directive-blanks-dropped]
[fixture: timeline/periods-and-events/event-trailing-directive-blanks-dropped]
[fixture: state/aliases/second-description-trailing-directive-blanks-dropped]
[fixture: gantt/titles-and-sections/title-padding-dropped]
[fixture: gantt/titles-and-sections/title-blank-kept]
[fixture: gantt/settings/format-padding-dropped]
[fixture: gantt/settings/trailing-whitespace-by-setting]
[fixture: gantt/settings/format-blank-kept]
[fixture: journey/titles-and-sections/title-padding-dropped]
[fixture: journey/titles-and-sections/title-blank-kept]
[fixture: journey/titles-and-sections/title-hash-gap-one-space-section-kept]
[fixture: timeline/titles-and-sections/title-padding-dropped]
[fixture: timeline/titles-and-sections/title-blank-kept]
[fixture: timeline/periods-and-events/event-padding-kept-end-dropped]
[fixture: timeline/periods-and-events/event-end-before-continuation-dropped]
[fixture: sequence/title/text-padding-dropped]
[fixture: sequence/title/text-padding-dropped-colon]
[fixture: sequence/title/trailing-whitespace-dropped]
[fixture: sequence/title/title-blank-kept]
[fixture: venn/title/text-padding-dropped]
[fixture: venn/title/title-blank-kept]
[fixture: c4/title-and-accdescription/title]
[fixture: c4/title-and-accdescription/accdescription]
[fixture: c4/title-and-accdescription/title-white-only]
[fixture: state/aliases/second-description-trailing-whitespace-dropped]

mermaid.js はキーワードの後の空白 1 文字を読み、残りを Db に残すので、
印字したテキストの Db は、書かれたテキストの Db と違いますが、
描かれる図は同じです。
各レンダラーは `text()` でテキストを SVG の `text` 要素に入れ、
先頭と末尾の空白を描きません。
（[Gantt](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L194-L199)、
[user journey](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/user-journey/journeyRenderer.ts#L166-L176)、
[timeline](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/timeline/timelineRenderer.ts#L209-L216)、
[sequence](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/sequenceRenderer.ts#L1450-L1456)、
[Venn](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L76-L86)）。
日付書式は、日付を読む前に両端の空白を取り除きます。
（[`getStartDate`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L305-L359)）。
軸の書式は、軸のラベルの書式だけです。
それぞれの種類について、両方のテキストを mermaid.js 12.3.0 で Chromium に描き、
画素が同じで、生成された id とテキストの両端の空白を除いた SVG も、
同じであることを確かめました。
timeline の event、state の 2 つ目の説明、C4 図のタイトルと説明も、
同じ方法で描いて、同じであることを確かめました。

セクション名は、この形では印字しません。
レンダラーは名前でセクションを区別するので、
先頭の空白だけが異なる 2 つの名前は 2 つのセクションですが、
その空白を除くとそうでなくなります。
Gantt はセクションのタスクに専用の帯を与えます。
（[`checkUnique`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L120-L126)）。
user journey はセクション名が変わる所で新しい枠を始めます。
（[`drawTasks`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/user-journey/journeyRenderer.ts#L297-L324)）。
timeline は同じ名前のセクションのイベントを集めます。
（[`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/timeline/timelineRenderer.ts#L144)）。
`section A` と `section  A` を続けると 2 つのセクションを描き、
`section A` と `section A` なら 1 つを描くので、帯の色、枠の数、幅が異なります。
[fixture: gantt/titles-and-sections/section-padding-kept]
[fixture: journey/titles-and-sections/section-padding-kept]
[fixture: timeline/titles-and-sections/section-padding-kept]

Gantt 図の 3 つの設定は、値の前後に空白があると描かれる図が変わるので、
書かれたままにします。
目盛りの間隔は、指定された間隔と値全体を照合するので、
`1day` の前か後に空白があると目盛りが既定のものになります。
（[`makeGrid`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L665-L668)）。
`D` の日付書式は、前後に空白がないときだけ日単位の軸を描きます。
（[`makeGrid`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L650-L659)）。
今日のマーカーは、値全体が `off` のときだけ線を隠します。
（[`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L861-L878)）。
そのため、`todayMarker off` の後に空白が 2 つあると、
チャートに今日が含まれる場合に線を描き、画素が異なります。
[fixture: gantt/settings/format-padding-kept-where-drawn-differently]
[fixture: gantt/settings/trailing-whitespace-by-setting]

Gantt 図のタスクの名前は、テキストとコロンの間の空白で終わり、
印字はその空白を整えて、名前に桁そろえの空白があるセクション、
または桁を共有するセクションどうしのコロンを、
それらの最長の名前の後に空白 1 つを置いた所にそろえます。
（[タスクのデータ](./gantt.ja.md#タスクのデータ)）。
文法の規則は、コロンより前のすべてを、空白も含めて名前として読みます。
（[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L93)）。
`addTask` は、それをタスクの `task` に残します。
（[`addTask`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L596-L606)）。
レンダラーは `task` を SVG の `text` 要素に入れ、幅を測って、
テキストを置く位置と与えるクラスを決めます。
（[`draw`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L394-L429)、
[クラス](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttRenderer.js#L449-L509)）。
名前の末尾の空白は描かれず、測る幅も増やさないので、Db は異なりますが、
描かれる図は同じです。
8 個の図の両方のテキストを、mermaid.js 12.3.0 を使い Chromium に描きました。
コロンの前に空白がない名前と空白が 1 つある名前、
空白が 1 つある名前と 30 個ある名前、タブがある名前と空白がある名前、
棒の中に収まる名前と棒より長い名前、図の右端に近い名前、状態 `done`、`crit`、
`active`、`milestone`、2 つのセクションです。
画素は同じで、生成された id とタスクのテキストの末尾の空白を除くと、
SVG も同じでした。
コーパス、mermaid.js の文書、このパッケージの fixture のうち、
印字がタスクの名前を変える 39 個のテキストの中で、
mermaid.js が描ける 36 個も同じでした。
残りの 3 個は、整形前も整形後もエラーで止まります。
描けるテキストのうち 2 個の SVG は、タイトルの先頭の空白も異なり、
これは前述のタイトルの例外に当たります。
図の CSS が空白を残すときは、描かれる図が異なります。
`%%{init: {"themeCSS": ".taskText{white-space:pre}"}}%%` があると、
2 つのテキストの画素は異なります。
そのため、`white-space` を含む図では、ほかのテキストの空白の連なりと同じく、
コロンを書かれたままにします。
（[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)）。
[fixture: gantt/task-data/colon-column-new-longest-name]
[fixture: gantt/task-data/description-padding-tightened]
[fixture: gantt/task-data/colon-column-white-space-kept]

テストは、印字したテキストの Db に、
書かれたテキストの Db から各テキストの両端の空白を戻して比べます。
`tests/keyword-text-margins.ts` の関数、
`keywordTextDbForFormattingComparison` を使います。
タイトル、日付書式、軸の書式が、書かれたものと、
両端の空白とタブだけが違うときは、書かれた方を採ります。
C4 図のタイトルと説明も同じです。
timeline の event、state の説明、Gantt 図のタスクの名前は、
末尾の空白とタブだけが違うときに、書かれた方を採ります。
ほかの違いは、セクション名、目盛りの間隔、今日のマーカーの違いも含めて、
失敗とします。
固定している mermaid.js の版を上げるときは、
それぞれの種類の両方のテキストを描き直し、SVG と画素を比べてから、
例外を残します。

## 同じに描かれるテキスト中の空白の連なり

テキスト中の空白とタブの連なりは、
mermaid.js がその連なりを描かずにテキストを描く場合に、空白 1 つで印字します。
`title Sales   report` は `title Sales report` と印字し、`accDescr: A`、タブ、
`B` は `accDescr: A B` と印字し、
`quadrant-1 a    b` は `quadrant-1 a b` と印字します。
対象は、すべての図種の `title` と `accDescr` と、
次の図種が SVG のテキストとして描くテキストです。
architecture 図、ブロック図、象限チャート、radar チャートのラベル、
flowchart の subgraph と agentflow 図の flow の題、class 図のメンバーと注釈、
ER 図の属性の型、requirement 図のフィールドとクラスの並び、
sequence 図のテキスト（メッセージ、ノート、ブロック、box、`as` の後の説明）、
C4 図の引数のうち label、technology、type、description、
Cynefin 図と ishikawa 図のリテラル、packet 図と Venn 図のラベル、
Wardley マップのリンク、treemap の名前、
railroad 図の文字列と special sequence です。
空白とタブだけの文字列は、ほかの文字列と同じ文字列として扱います。
`["   "]` は `[" "]` と印字します。 [fixture: pie/title/title-inner-text]
[fixture: railroad/quotes/ir-string-runs-collapsed]
[fixture: pie/accessibility-lines/accessibility-inner-tab]
[fixture: quadrant/keywords-and-texts/inner-runs-collapsed]
[fixture: sequence/whitespace-between-tokens/values-runs-collapsed]
[fixture: class/member-lines/runs-collapsed]
[fixture: block/shapes/label-runs-collapsed]
[fixture: er/attribute-spacing/tilde-word-runs-collapsed]
[fixture: requirement/fields/value-inner-runs-collapsed]
[fixture: radar/quotes/padding-label]
[fixture: railroad/quotes/ebnf-empty-and-text]
[fixture: radar/quotes/whitespace-only-labels]
[fixture: treemap/names/whitespace]
[fixture: c4/argument-forms/text-places-element-runs-collapsed]
[fixture: flowchart/accessibility-lines/swimlane-description-runs-collapsed]

次のものは、書かれたまま残します。

- 文字列でない、空白とタブだけのテキスト。
  ただし、mindmap のノードと kanban のカードの icon、class、形のテキストは、
  空白 1 つで印字します。
  （[同じに描かれる mindmap のテキスト](#同じに描かれる-mindmap-のテキスト)）。
  [fixture: gantt/titles-and-sections/title-blank-kept]
- 複数行のテキストと、コメント、ディレクティブ、
  U+2028 か U+2029 を含むテキスト。
  mermaid.js は、それらの行や印を置かれた場所によって読むからです。
  [fixture: pie/directives-and-semicolons/global-value]
- `<` を含むテキスト。
  空白を保つ HTML タグ（`<pre>`）を始めるかもしれないからです。
  どこかに `white-space` を含む図の、すべてのテキストも残します。
  `style` や `classDef` が、それを使ってラベルの連なりを保てるからです。
  [fixture: sequence/whitespace-between-tokens/html-tag-runs-kept]
  [fixture: pie/title/white-space-property-kept]
- mermaid.js が HTML として描くラベル。
  flowchart と agentflow 図のノードと辺、state 図の説明、遷移、ノート、
  mindmap のノード、class 図の関係のラベル、usecase 図のすべてのテキストです。
  最大幅に達したラベルは `white-space: break-spaces` で配置され、
  連なりを描きます。
  （[`createText`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/createText.ts#L61-L77)）。
  ラベルがその幅に達するかどうかは、フォントと幅の設定によりますが、
  フォーマッターはそれらを知りません。
  連なりを持つ長いラベルを、連なりがある形とない形で描くと、画素が異なりました。
  [fixture: flowchart/label-inner-whitespace/inner-whitespace-kept]
  [fixture: agentflow/labels/labels-padding]
  [fixture: state/descriptions-and-labels/text-kept]
  [fixture: mindmap/node-text/inner-whitespace-kept]
  [fixture: usecase/labels/label-interior-kept] [fixture: class/labels/spaced]
- flowchart の subgraph と agentflow 図の `flow` の題のうち、
  mermaid.js が subgraph の幅つきで描いて折り返すもの。
  題が Markdown 文字列の場合は、`rect` と `createContainerGroup` が、
  Markdown の題を幅つきの `createText` に渡し、
  それ以外の題は幅を渡さない `createLabel` に渡します。
  （[`rect`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters.js#L40-L50)、
  [`createContainerGroup`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters.js#L555-L564)、
  [`createLabel`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/createLabel.js#L38-L50)）。
  subgraph にデータブロックがある場合は、`S@{ view: collapsed }` が、
  subgraph を折り畳んだグループとして描き、
  `labelHelper` が題を幅つきの `createText` に渡します。
  flowchart の `getData` と agentflow 図の `getData` が、その形を選びます。
  （[`labelHelper`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/shapes/util.ts#L89-L104)、
  [flowchart の `getData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1288-L1301)、
  [agentflow 図の `getData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1794-L1815)）。
  図がレーンを描く場合は、ヘッダー `swimlane-beta`、
  またはフロントマターとディレクティブに書ける設定 `layout: swimlane` で、
  すべてのグループの形がレーンになり、`swimlane` が幅つきで描きます。
  （[すべてのグループの形をレーンにする](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/layout-algorithms/swimlanes/helpers.ts#L174)、
  [`swimlane`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/clusters/swimlane.js#L50-L55)）。
  各場合で、連なりがある題とない題を描き比べると、どの場合も画素が異なりました。
  それ以外の題は、通常の subgraph の 9 つの場合（長い題、
  小さい `wrappingWidth`、`htmlLabels: false`、`layout: elk`、`look: neo`、
  入れ子の subgraph、辺、キーワード `graph`）と agentflow の `flow` で、
  同じに描かれたので、空白 1 つで印字します。
  データブロックのキーは読みません。
  subgraph の id に書かれたブロックは、
  どれも題を書かれたままにし（文字列で名前を書く subgraph や flow の id は、
  引用符の間の文字から両端の空白を除いたもので、
  Markdown 文字列ではバッククォートの間の文字です。
  `subgraph "S"` も `subgraph " S "` も id は `S`）、
  mermaid.js が空白を含む名前の subgraph に付ける `subGraph0` のような id に、
  ブロックが書かれた場合も同じです。
  どこかに `swimlane` を書く図は、すべての題を書かれたままにします。
  mermaid.js を使う側の設定は、テキストの外にあるので読みません。
  [fixture: flowchart/subgraph-header/markdown-title-runs-kept]
  [fixture: flowchart/subgraph-header/collapsed-title-runs-kept]
  [fixture: flowchart/subgraph-header/swimlane-title-runs-kept]
  [fixture: flowchart/subgraph-header/layout-swimlane-title-runs-kept]
  [fixture: agentflow/containers/flow-title-runs-collapsed]
  [fixture: agentflow/containers/flow-title-collapsed-runs-kept]
  [fixture: flowchart/subgraph-header/collapsed-quoted-name-title-runs-kept]
  [fixture: flowchart/subgraph-header/collapsed-markdown-name-title-runs-kept]
  [fixture: flowchart/subgraph-header/collapsed-spaced-name-title-runs-kept]
  [fixture: flowchart/subgraph-header/collapsed-generated-id-title-runs-kept]
  [fixture: agentflow/containers/flow-quoted-name-title-collapsed-runs-kept]
  [fixture: agentflow/containers/flow-spaced-quoted-name-title-collapsed-runs-kept]
  [fixture: agentflow/containers/flow-markdown-name-title-collapsed-runs-kept]
  [fixture: agentflow/containers/flow-two-part-name-title-collapsed-runs-kept]
- `accTitle`。
  mermaid.js は SVG の `title` 要素に入れ、
  ブラウザーは図の上にポインターを止めるとツールチップとして表示します。
  AGENTS.md はツールチップも比較します。
  ツールチップが連なりを表示するかは、
  ヘッドレスブラウザーで確かめられなかったので、テキストは書かれたまま残します。
  アクセシブルな名前は両方のテキストで同じでしたが、それで判断はしません。
  `accDescr` は `desc` 要素で、ツールチップとして表示されません。
  [fixture: pie/accessibility-lines/accessibility-inner-tab]
  [fixture: quadrant/titles-and-accessibility-statements/text-inner-whitespace-kept]
- C4 の文の引数のうち、label、technology、type、description でないもの（sprite、
  tags、link）と、本来の位置にない名前付き属性。
  mermaid.js の読み方は、その場所によって変わります。
  （[引数の形](./c4.ja.md#引数の形)を参照してください）。
  [fixture: c4/named-attributes/named-text-places-runs-collapsed]
- ほかの文が参照する名前。
  連なりで異なる 2 つの名前は別のもので、連なりがなくなると 1 つになります。
  円グラフのラベル、Sankey 図のノード、requirement 図の名前、
  ER 図のエンティティ、class 図の名前、state 図の id、C4 図の別名、
  user journey の人、Wardley マップのコンポーネントで、
  そのような名前の対を描くと、図は異なりました。
  gitgraph の重複するブランチは拒否されます。 [fixture: pie/labels/label-quotes]
  [fixture: requirement/names/inner-whitespace-kept]
  [fixture: state/aliases/id-kept]

mermaid.js は連なりを Db に残します。
レンダラーは、これらのテキストを SVG の `text` 要素に入れ、
その空白をブラウザーが詰めます。
（[`drawText`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sequence/svgDraw.js#L259-L303)
など）。
`accDescr` は `desc` 要素に入れ、アクセシブルな説明でも連なりを詰めます。
各場合の両方のテキストを mermaid.js 12.3.0 で Chromium に描きました。
書かれた形で 1 回、
折り返しを見るために連なりの後に約 140 文字を足して 1 回です。
画素は同じで、生成された id、ランダムに描かれる曲線、
テキストノードの空白を除いた SVG も同じでした。
Chromium のアクセシビリティツリーで、`desc` が与えるアクセシブルな説明は、
両方のテキストで同じでした。
ブロック図と requirement 図のクラスの並び（`class="node c   d"`）と、
sequence 図の色の引数（`fill="rgb(1,   2, 3)"`）だけは、
SVG の 1 つの属性のテキストが異なります。
ブラウザーは `class` 属性を語として読み、CSS の色の引数の空白を無視します。
これは、AGENTS.md が比べない CSS の宣言の周りの空白と同じです。
[fixture: block/styles/class-name-runs-collapsed]
[fixture: requirement/class-lists/classes-with-spaces]
[fixture: sequence/whitespace-between-tokens/values-of-other-statements-runs-collapsed]

テストは、印字したテキストの Db に、
書かれたテキストの Db から連なりを戻して比べます。
`tests/text-run-margins.ts` の `textRunDbForFormattingComparison` を使います。
そのファイルが図種ごとに列挙する場所のテキストが、
書かれたものと連なりだけが違うときは、書かれた方を採ります。
両端の空白も除かれたテキストも同じです。
（[同じに描かれるキーワードの後のテキスト](#同じに描かれるキーワードの後のテキスト)）。
ほかの文が参照する名前は一覧に含まれないので、その違いは失敗とします。
固定している mermaid.js の版を上げるときは、それぞれの種類の両方のテキストを、
短いものと長いものの両方で描き直し、SVG と画素を比べてから、例外を残します。

## 同じに描かれる呼び出しの引数

flowchart、agentflow、class、Gantt の図の `click` の呼び出しの引数は、
両端と `,` の前に空白を置かず、後ろに空白を 1 つ置いて印字します。
`click A call f(  "x" ,y ,   z  )` は `click A call f("x", y, z)` と印字します。
引用符の中の空白は残し、引用符の中の `,` の隣の空白も残します。
空の部分、改行、コメント、ディレクティブを含む引数は、書かれたままにします。
[fixture: flowchart/whitespace-between-tokens/callback-arguments-spaced]
[fixture: agentflow/click-statements/callback-arguments-spaced]
[fixture: class/whitespace-between-tokens/callback-arguments-spaced]
[fixture: gantt/click-statements/call-arguments-spaced]

mermaid.js の行の規則（[`;` を含む行](#-を含む行)を参照）は、
呼び出しの行を読みます。
その行に `style` か `classDef` があり、その後に `:`、その後に `#`、
さらに後に `;` があり、`:` と `#` の間に空白でない文字だけがあると、
行の最後の `;` を無視します。
そのため、`click A call f(style:x,#b;c)` は、
`style:x` と `#bc` を引数として `f` を呼びます。
`,` の後に空白がある `click A call f(style:x, #b;c)` は、第 2 引数が異なります。
`;` が無視されなくなり、`#b;` がエンティティコードとして読まれるからです。
規則が読むかもしれない引数の間の隙間は、空白があるかないかを保ち、
空白の連続は空白 1 つにするので、最初の呼び出しは書かれたままにします。
その語は引数の中か、ノードの id など呼び出しの前にあってよく、
`classDef` も `style` と同じです。
[fixture: flowchart/whitespace-between-tokens/callback-arguments-line-rule-kept]
[fixture: agentflow/click-statements/callback-arguments-line-rule-kept]
[fixture: class/whitespace-between-tokens/callback-arguments-line-rule-kept]
[fixture: gantt/click-statements/call-arguments-line-rule-kept]

mermaid.js は括弧の間のテキストを Db に残すので、印字したテキストの Db は、
書かれたテキストの Db と違いますが、同じ引数で関数を呼びます。
4 つの図種はどれも、後ろに `"` が偶数個ある各 `,` でテキストを分け、
各部分の両端の空白を除き、`"` で始まり `"` で終わる部分は、その `"` を除きます。
（[flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L533-L545)、
[class](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/class/classDb.ts#L458-L471)、
[Gantt](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/gantt/ganttDb.js#L752-L765)、
[agentflow](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L963-L976)）。
関数を結び付けるのは、`securityLevel` が `loose` のときだけです。
各場合の両方のテキストを、その設定で mermaid.js 12.3.0 で Chromium に描き、
ノードをクリックしました。
4 つの図種すべてで関数に渡された引数は同じで、上の 2 つの書き方では `x`、`y`、
`z` でしたが、引用符の中を変えると引数も変わりました。

テストは、印字したテキストの Db に、
書かれたテキストの Db から引数を戻して比べます。
`tests/click-call-margins.ts` の関数、
`clickCallDbForFormattingComparison` を使います。
同じ部分として読まれる引数は書かれた方を採り、ほかの違いは失敗とします。
固定している mermaid.js の版を上げるときは、
それぞれの種類の両方のテキストをクリックし直してから、例外を残します。

## 同じに描かれる mindmap のテキスト

mindmap のノードのテキスト、形のテキスト、icon、class は、
両端の空白とタブを除いて印字します。
`a (x)` は `a(x)`、`b[ y ]` は `b[y]`、`::icon( fa )` は `::icon(fa)`、
`::: big ` は `:::big` と印字します。
テキストの中の空白は残します。
折り返すノードは連なりを描くからです。
（[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)）。
余白を除くと引用符で始まる形のテキスト（`a[ "x" ]` は引用符を含むテキストで、
`a["x"]` は文字列）、文字列、markdown 文字列、複数行にまたがるテキスト、
行の中か後ろにコメントやディレクティブがある行は、書かれたままにします。
ただし、ノード、class、カードのテキストを終えるディレクティブは、
キーワードの後のテキストと同じに印字します。
（[同じに描かれるキーワードの後のテキスト](#同じに描かれるキーワードの後のテキスト)）。
空白とタブだけのテキストは、空白 1 つで印字します。
[fixture: mindmap/node-text/directives-end-blanks-dropped]
[fixture: kanban/trailing-whitespace/directives-end-blanks-dropped]
[fixture: mindmap/node-text/trailing-whitespace-dropped]
[fixture: mindmap/node-text/space-before-a-shape-dropped]
[fixture: mindmap/shapes/inner-padding-dropped]
[fixture: mindmap/decorations/padding-in-icon-and-class-dropped]
[fixture: mindmap/shapes/padding-kept-where-drawn-differently]
[fixture: mindmap/decorations/blank-icon-and-class-one-space]
[fixture: mindmap/node-text/inner-whitespace-kept]

mermaid.js はテキストを Db（`nodeId`、`descr`、`icon`、`class`）に残すので、
印字したテキストの Db は、書かれたテキストの Db と違いますが、
同じノードを描きます。
ノードと形のテキストは markdown のラベルに、icon はノードの icon に、
class は要素の class の並びに入り、
ブラウザーはその並びを空白で区切って読みます。
ノードの id は描かれません。
（[`flattenNodes`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/mindmap/mindmapDb.ts#L224-L309)）。
各場合の両方のテキストを mermaid.js 12.3.0 で Chromium に描き、画素が同じで、
生成された id と HTML が描かない空白を除いた SVG も、
同じであることを確かめました。
ノードは id やテキストで比べず、番号を付けるので、
この変更で同じテキストになる 2 つのノードも 2 つのノードのままで、
以前と同じに描かれます。
文字列になるテキストは、描かれ方が異なりました。

kanban のボードも、カードのテキスト、列とカードのラベル、icon、class に、
同じ規則を適用します（[Kanban](./kanban.ja.md#形)を参照）。
列の id は例外で、mermaid.js はそれで 2 つの列を区別します。
`todo [A]` と `todo[B]` は別々に描かれる 2 つの列で、
空白を除くと描かれ方が異なりました。
カードの id は比べないので、`id1 [x]` と `id1[x]` は同じに描かれ、
変更で 2 つのカードの id が同じになる場合も同じでした。
[fixture: kanban/shapes/card-id-before-shape-dropped]
[fixture: kanban/shapes/id-before-shape]

テストは、印字したテキストの Db に、
書かれたテキストの Db からノードのテキストを戻して比べます。
`tests/mindmap-text-margins.ts` の `mindmapDbForFormattingComparison` と、
`tests/kanban-text-margins.ts` の `kanbanDbForFormattingComparison` を使います。
テキストが書かれたものと、両端の空白とタブだけが違うときは、
書かれた方を採ります。
ほかの違いは、文字列になったテキストも含めて失敗とします。
固定している mermaid.js の版を上げるときは、各場合の両方のテキストを描き直し、
SVG と画素を比べてから、例外を残します。

## 同じに描かれる綴り

mermaid.js は、トークンの異なる綴りの一部を同じトークンとして読み、
そこから同じ図を描きます。
キーワードの別の大文字小文字、`"` の代わりに `'` で囲む文字列、
末尾にゼロを付けた数、ER 図の関係の記号の代わりの語、
コロンの後の代わりに 1 行のブロックに書くアクセシビリティの説明、
引用符なしの代わりに引用符で囲むテキストです。
印字は、そのような綴りを 1 つの形にします。
トークンの間の空白は、
ほかの図種が同じ種類の隙間に印字する形にします（上の各節を参照してください）。
綴りは、固定している mermaid.js の文書の例が、
ほかのどの形よりも 2 倍以上多く使う形にします。
そのような形がないとき、または例がその綴りを使わないときは、
書かれたまま残します。
例は、[構文のページ][mermaid-syntax-pages]の、
`mermaid-example` と `mermaid` のコードブロック 541 個です。
パーサーはそのうち 524 個を読み、以下の数はその 524 個で数えたものです。

[mermaid-syntax-pages]: https://github.com/mermaid-js/mermaid/tree/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax

比較は固定している mermaid.js だけで行いますが、整形したテキストは、
ほかの版の mermaid.js でも描かれます。
そのため、印字する形が、書かれた形を受理するすべての版では受理されないときも、
綴りを書かれたまま残します。
[mermaid.js の版](#mermaidjs-の版)に、
それぞれの種類について調べたことを示します。

印字が形をそろえる前に、それぞれの種類を mermaid.js 12.3.0 と比べました。
綴りを含む各例を別の綴りでも書き、mermaid.js が両方のテキストを読みました。
別の綴りを mermaid.js が拒否する対（円グラフの数の前の `+`）は数えません。
両方のテキストを Chromium で描きました。
数えたどの対も Db は同じで、SVG のスクリーンショットも画素ごとに同じでした。
同じテキストを 2 回描いてもすでに異なるもの（Agentflow の形、
flowchart の `hourglass`、状態遷移図の choice の線はランダムに描かれ、
gitGraph のコミット id とラベルの幅も同様です）は、数、コミット id、
要素の id を除いた SVG が同じでした。
mermaid.js は Db から描くので、同じ Db が同じ描画の根拠です。
描画は、ほかにテキストを読むものがないことの確認です。

| 種類                             |  対 | 同じ Db |    同じ描画 |
| -------------------------------- | --: | ------: | ----------: |
| 大文字小文字をそろえるキーワード | 445 |     445 | 138（標本） |
| `"` で囲む文字列                 |  79 |      79 |          79 |
| 最短の形の数                     |  37 |      37 |          37 |
| sankey のリンクの値              |  22 |      22 |          22 |
| ヘッダーの向き                   |  11 |      11 |          11 |
| gitGraph の `switch`             |  27 |      27 |          27 |

キーワードの対は標本を描き、
そのテキストを 2 回描いてもすでに異なる対は数えませんでした。
以下の種類は、例と、Db だけを比べる適合性コーパスの入力で比較しました。

| 種類                            |  例 | 同じ Db と描画 | コーパス | 同じ Db |
| ------------------------------- | --: | -------------: | -------: | ------: |
| ER 図の関係                     |   4 |              4 |       66 |      66 |
| C4 の `Rel_Up` など             |   1 |              1 |        7 |       7 |
| EBNF 記法の `::=`               |   9 |              9 |       91 |      91 |
| 両端が同じ packet の範囲        |   2 |              2 |      133 |     131 |
| ヘッダーのコロン（除去）        |   6 |              6 |      646 |     643 |
| ヘッダーのコロン（改行）        |   0 |              0 |       22 |      21 |
| リンクのラベル                  |  19 |             19 |      170 |     162 |
| 1 行の説明ブロック              |   3 |              3 |      533 |     483 |
| sankey の欄の引用符             |   6 |              6 |       11 |      11 |
| ER の名前の引用符               |   0 |              0 |       15 |      15 |
| requirement の名前の引用符      |   0 |              0 |       12 |      12 |
| Wardley マップの名前の引用符    |   0 |              0 |       35 |      35 |
| gitGraph のブランチの引用符     |   0 |              0 |        2 |       2 |
| 象限チャートのテキストの引用符  |   0 |              0 |       19 |      13 |
| XY チャートのテキストの引用符   |   0 |              0 |      191 |     191 |
| Venn の名前やラベルの引用符     |   0 |              0 |      176 |     174 |
| use case の名前やラベルの引用符 |   0 |              0 |       93 |      90 |
| architecture のラベルの引用符   |   0 |              0 |        2 |       2 |
| mindmap の形のテキストの引用符  |   0 |              0 |        7 |       7 |
| kanban の形のテキストの引用符   |   0 |              0 |      114 |     114 |
| C4 の引数の引用符               |   0 |              0 |       67 |      65 |
| 見出しの名前の引用符            |   0 |              0 |       11 |      11 |
| agentflow の名前の引用符        |   0 |              0 |       26 |      24 |
| class の名前の引用符            |   0 |              0 |        7 |       7 |

最後の列に数えないコーパスの対は、mermaid.js が別の綴りを拒否する対です。
ただし、リンクのラベルの 2 対は例外で、ラベルに `%%` があり、Db が異なります。
説明ブロックの 37 対も例外で、
mermaid.js は両方の綴りを拒否します（既知の相違 `c4-keyword-anywhere`）。
XY チャートの 4 対も、
両方を拒否します（既知の相違 `title-digit-after-axis-statement`）。
説明ブロックの 9 対は、タイトル、説明、スタイルの空白で Db が異なります。
[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)
と、[同じに描かれるスタイル](#同じに描かれるスタイル)を参照してください。
象限チャートの 6 対は、テキスト内にタブがあります（同じ節を参照してください）。
Venn のラベルの 2 対も、空白やタブの連なりで Db が異なります。
（[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)）。
use case 図の 3 対と agentflow 図の 2 対は、スタイルの空白で Db が異なります。
C4 図の 2 対は、テキスト中の空白やタブの連なりで Db が異なります。
印字は、hidden YAML ブロックに隣接する packet 図の範囲、
`;` や hidden YAML ブロックの `---` が接するコロン、
`%%` を含むリンクのラベルを書き換えません。
固定している mermaid.js の版を上げるときは、例を数え直し、
それぞれの種類を比べ直します。

### 大文字小文字をそろえるキーワード

次の図種の字句解析器は、キーワードをどの大文字小文字でも読みます。
印字は、以下のキーワードを示した大文字小文字にし、
それ以外のキーワードは書かれたままにします。

- ER 図: `BT`、`direction`、`end`、`LR`、`RL`、`subgraph`、`TB`。
- Gantt 図: `axisFormat`、`dateFormat`、`excludes`、`friday`、`monday`、
  `section`、`tickInterval`、`title`、`weekday`、`weekend`。
- ユーザージャーニー: `section`、`title`。
- マインドマップ: `::icon(`。
- 象限図: `quadrant-1`、`quadrant-2`、`quadrant-3`、`quadrant-4`、`title`、
  `x-axis`、`y-axis`。
- 要件図: `analysis`、`class`、`contains`、`copies`、`demonstration`、
  `derives`、`designConstraint`、`direction`、`docRef`、`element`、
  `functionalRequirement`、`high`、`id`、`inspection`、`interfaceRequirement`、
  `low`、`LR`、`medium`、`performanceRequirement`、`physicalRequirement`、
  `refines`、`requirement`、`risk`、`satisfies`、`test`、`text`、`traces`、
  `type`、`verifies`、`verifymethod`。
- シーケンス図: `activate`、`actor`、`alt`、`and`、`as`、`autonumber`、`box`、
  `break`、`create`、`critical`、`deactivate`、`destroy`、`else`、`end`、
  `link`、`links`、`loop`、`Note`、`of`、`opt`、`option`、`over`、`par`、
  `participant`、`rect`、`right`。
- 状態遷移図: `<<choice>>`、`<<fork>>`、`<<join>>`、`accDescr`、`accTitle`、
  `as`、`class`、`direction`、`end`、`LR`、`note`、`state`、`TB`。
- タイムライン: `section`、`TD`、`title`。
- ユースケース図: `extend`、`include`。
- Venn 図: `set`、`text`、`title`、`union`。
- XY チャート: `bar`、`line`、`title`、`x-axis`、`y-axis`。

例は、各キーワードの印字する大文字小文字を、
ほかのどの大文字小文字よりも 2 倍以上多く使います。
`Note` は 7 回、`note` は 1 回書かれ、
ほかのキーワードは別の大文字小文字で書かれません。
[fixture: er/whitespace-between-tokens/keyword-case-one-form]
[fixture: er/direction/case-one-form]
[fixture: er/direction/case-bt-rl-one-form]
[fixture: er/subgraphs/end-case-one-form]
[fixture: gantt/keyword-case/keywords-one-form]
[fixture: gantt/weekday-and-weekend/day-case-one-form]
[fixture: journey/keyword-case/keywords-one-form]
[fixture: mindmap/keyword-case/icon-keyword]
[fixture: quadrant/keyword-case/statement-keywords-one-form]
[fixture: quadrant/keyword-case/quadrant-3-4-one-form]
[fixture: requirement/keyword-case/keywords-one-form]
[fixture: requirement/keyword-case/types-one-form]
[fixture: requirement/fields/field-keywords-case-one-form]
[fixture: requirement/fields/keyword-values-case-one-form]
[fixture: requirement/fields/keyword-values-low-test-analysis-case-one-form]
[fixture: requirement/relationship-spacing/relation-case-one-form]
[fixture: requirement/relationship-spacing/relations-case-one-form]
[fixture: requirement/direction/case-one-form]
[fixture: sequence/whitespace-between-tokens/keyword-case-one-form]
[fixture: sequence/keyword-case/statements-one-form]
[fixture: sequence/keyword-case/blocks-one-form]
[fixture: state/whitespace-between-tokens/keyword-case-one-form]
[fixture: state/whitespace-between-tokens/keyword-case-more-one-form]
[fixture: state/keyword-case/pseudo-states-one-form]
[fixture: state/keyword-case/accessibility-alias-direction-one-form]
[fixture: timeline/keyword-case/keywords-one-form]
[fixture: usecase/arrows/arrows-semantic-case-one-form]
[fixture: venn/keyword-case-and-order/keyword-case-one-form]
[fixture: xychart/keyword-case/statement-keywords-one-form]

一覧にないキーワードは書かれたまま残します。
例が使わないもの（Gantt 図の `todayMarker`、
状態遷移図の `HIDE EMPTY DESCRIPTION`）、
ほかの大文字小文字の 2 倍以上使う形がないもの、
別の大文字小文字で Db か描画が変わるものです。
ブロック図は `COLUMNS` と `SPACE` を id として読み、
状態遷移図はノートの `LEFT`、`RIGHT`、`OF` を Db に書かれたまま保ち、
`LEFT` か `OF` のノートは異なって描かれ、
ER 図は属性のキー `PK` と `FK` を Db に書かれたまま保ち、
Gantt 図はタスクのタグ `done` と `crit` と `after` を保ち、
XY チャートは `horizontal` を保ち、
treeView は `ICON(…)` を名前の一部として読みます。
ER 図、要件図、Venn 図の `style` と、ER 図、状態遷移図、要件図、
象限チャートの `classDef` も書かれたまま残します。
mermaid.js は、正確にこの大文字小文字の `style` か `classDef` があり、
その後に `:`、空白以外の文字だけをはさんで `#`、その後に `;` がある行では、
テキストを読む前に、最後の `;` を取り除きます。
キーワードの大文字小文字が異なる行では、その `;` も含めて読むので、
`STYLE A fill:#f00;` と `style A fill:#f00;` の Db は異なります。
この規則は、ディレクティブとコメントを取り除いた後の行に当たるので、
複数行にまたがるディレクティブは両側を 1 行につなぎ、キーワードの行だけでは、
別の大文字小文字で行が同じに読まれるかは分かりません。
象限チャートは、2 つの大文字小文字で読みが異なるテキストの一部を拒否し、
ほかは同じに読みますが、これも書かれたまま残します。
[fixture: er/whitespace-between-tokens/keyword-case-one-form]
[fixture: state/whitespace-between-tokens/keyword-case-one-form]
[fixture: block/keyword-case/keywords-kept]
[fixture: treeview/keyword-case/icon-kept]
[fixture: er/attribute-spacing/keys-case-kept]
[fixture: gantt/keyword-case/tags-case-kept]
[fixture: er/styles-and-classes/keyword-case-kept]
[fixture: er/styles-and-classes/keyword-case-semicolon-line-kept]
[fixture: requirement/styles-and-classes/keyword-case-kept]
[fixture: requirement/styles-and-classes/keyword-case-semicolon-line-kept]
[fixture: state/keyword-case/classdef-semicolon-line-kept]
[fixture: venn/keyword-case-and-order/style-semicolon-line-kept]
[fixture: quadrant/styles/class-definition-keyword-case-kept]
[fixture: quadrant/styles/class-definition-semicolons-case-kept]

ER のサブグラフの本文で、mermaid.js は `class`、`classDef`、
`style` の文のキーワードを、サブグラフのノードとして書かれたまま列挙します。
これは、この 3 つのキーワードの大文字小文字を保つ、もう 1 つの理由です。
[fixture: er/subgraphs/statement-keywords-case-kept]

### `"` で囲む文字列

cynefin、gitGraph、packet、pie、radar、railroad（IR、EBNF、PEG の記法）、
treeView、treemap、usecase、wardley の図は、
文字列を `"` だけでなく `'` でも囲め、mermaid.js は両方を同じに読みます。
例は、これらの図種の文字列 409 個のうち 408 個を `"` で囲みます。
残りの 1 個は Wardley の flow のラベルで、`'` で囲んだものだけを読みます。
印字は `"` を使います。
Prettier の `singleQuote` オプションは読みません。
`'` で囲む文字列を読むのはこの 10 図種だけで、
ほかは拒否するか引用符をテキストの一部として読みます。
例はそれを使いません。 [fixture: cynefin/strings/strings-quotes]
[fixture: gitgraph/quotes/quotes-one-form]
[fixture: packet/quotes/quotes-one-form]
[fixture: pie/labels/label-quote-one-form]
[fixture: radar/quotes/quotes-and-empty]
[fixture: railroad/quotes/ir-empty-and-text]
[fixture: railroad/quotes/ebnf-empty-and-text]
[fixture: railroad/quotes/peg-empty-and-text]
[fixture: treeview/names/name-empty]
[fixture: usecase/labels/label-quote-rewrite-one-form]
[fixture: wardley/names-and-quotes/name-quotes-empty]

テキストに `'`、`"`、バックスラッシュ、改行、U+2028、U+2029、バッククォート、
`&`、`#`、`<` を含む文字列は、書かれたまま残します。
`"` の間で escape が必要になるか、
mermaid.js が別の読み方をする文字（`#35;` などのエンティティ、HTML、
Markdown 文字列）を含むからです。
Wardley の flow のラベル（`+'moving'>`）は `'` の間に残します。
[fixture: cynefin/strings/single-quote-sensitive-kept]
[fixture: gitgraph/quotes/single-quote-sensitive-kept]
[fixture: packet/quotes/single-quote-sensitive-kept]
[fixture: pie/labels/single-quote-sensitive-kept]
[fixture: radar/quotes/single-quote-sensitive-kept]
[fixture: railroad/quotes/ir-single-quote-sensitive-kept]
[fixture: railroad/quotes/ebnf-single-quote-sensitive-kept]
[fixture: railroad/quotes/peg-single-quote-sensitive-kept]
[fixture: treeview/names/single-quote-sensitive-kept]
[fixture: treemap/names/single-quote-sensitive-kept]
[fixture: usecase/labels/single-quote-sensitive-kept]
[fixture: wardley/names-and-quotes/single-quote-sensitive-kept]
[fixture: wardley/flows/flow-forward]

### 最短の形の数

印字は、数の `+`、小数部の末尾のゼロ、末尾の `.` をなくし、
先頭の `.` の前に `0` を置きます。
`+3` は `3`、`1.50` は `1.5`、`2.0` は `2`、`3.` は `3`、`.5` は `0.5` です。
対象は、mermaid.js が数として読む数のうち、次の場所だけです。
円グラフの区分の値、
XY チャートの `bar` と `line`
の値と範囲（`a --> b`）の両端（分類は含みません）、treemap の葉の値のうち、
数字、数字と小数部、小数部だけの形（符号、末尾の `.`、`,`、
`_` がある葉は書かれたままです）、radar チャートの `max`、`min`、
`ticks` と曲線の値、sankey 図のリンクの値（引用符で囲まれた値や、
後ろにテキストがある値は含みません）、
Venn の集合の `:` の後の大きさ（`text` や style の数は含みません）です。
例にあるこれらの場所の数 300 個のうち 297 個はこの形で、
3 個（すべて XY チャートの `49.0`、`103.0`、`177.0`）は、
小数部の末尾にゼロがあります。 [fixture: pie/numbers/shortest-form]
[fixture: xychart/numbers/range-numbers-one-form]
[fixture: xychart/numbers/values-one-form]
[fixture: treemap/numbers/shortest-form] [fixture: treemap/numbers/leading-dot]
[fixture: radar/numbers/shortest-form]
[fixture: radar/numbers/raw-option-numbers]
[fixture: venn/sizes-and-numbers/absent-zero-signs]
[fixture: venn/sizes-and-numbers/size-spaces]
[fixture: sankey/values/shortest-form]
[fixture: sankey/values/shortest-form-with-trivia]

これらの数は、数をテキストとして書く設定（円グラフの `showData`、
XY チャートの `showDataLabel`、treemap の値のラベル、radar チャートの目盛り、
接頭辞と接尾辞を含む sankey 図の値のラベル）でも描き、描画は同じでした。
sankey のリンクの値は、図を読むときに `parseFloat` で数にされます。
（[文法のアクション](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L55)）。
値を示すラベルは、書かれたテキストではなく、その数から作られます。
（[レンダラー](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/sankeyRenderer.ts#L178)）。
mermaid.js がテキストとして読む数（Venn 図の `text A 1.50`、style の値、
XY チャートの x 軸の分類 `007` や `1.50`）、
整数部の先頭にゼロがある数（`007`）、15 桁より多い数、指数のある数（`1e3`）、
`-0`、単純な十進表記でない値（sankey のリンクの値の `abc`、`1_0`、`0x1`）、
この節にない図種の数は、書かれたまま残します。
Wardley マップの座標は、小数 168 個のうち 81 個で小数部の末尾にゼロがあります。
[fixture: venn/sizes-and-numbers/text-number-forms]
[fixture: venn/sizes-and-numbers/text-and-style-numbers-kept]
[fixture: xychart/numbers/forms-kept]
[fixture: xychart/numbers/category-trailing-zero-kept]
[fixture: pie/numbers/forms-kept] [fixture: radar/numbers/forms-kept]
[fixture: treemap/numbers/forms-kept]
[fixture: treemap/numbers/trailing-dot-kept] [fixture: sankey/values/forms-kept]
[fixture: wardley/numbers/forms-kept]

### ヘッダーの向き

agentflow と swimlane のヘッダーの向き `TD` は `TB` と印字します。
例は `TB` を agentflow で 10 回、swimlane で 1 回使い、`TD` は使いません。
swimlane の数は、1 つの例で数えたものです。
ヘッダーに続くディレクティブの後にある方向は、
`agentflow-beta%%{x}%% TD` のように書かれたまま残します。
どの図でも `direction` の文は書かれたまま残します。
mermaid.js が文の向きを Db に書かれたまま保つからです。
[fixture: agentflow/header/header-direction-spelling]
[fixture: agentflow/header/header-direction-after-directive-kept]
[fixture: flowchart/direction/swimlane-header-td-after-directive-kept]
[fixture: flowchart/direction/swimlane-header-td-one-form]
[fixture: flowchart/direction/statement-td-kept-with-other-header]
[fixture: flowchart/direction/statement-values-kept]

flowchart のヘッダーは、`TB` も `TD` も書かれたまま残します。
例は `TD` を 59 回、もう一方を 5 回使いますが、形は変えません。
[mermaid.js の版](#mermaidjs-の版)を参照してください。
[fixture: flowchart/direction/header-tb-kept]
[fixture: flowchart/link-label-form/flowchart-header-both-forms-kept]

### ER 図の関係

関係のカーディナリティと線は、語の大文字小文字にかかわらず、
mermaid.js が同じに読む記号で印字し、各カーディナリティは、
その側の記号にします。
`only one`、`one`、`1` は `||`、`zero or one` と `one or zero` は、左では `|o`、
右では `o|`、`zero or more`、`zero or many`、`many`、`many(0)`、`0+` は、
左では `}o`、右では `o{`、`one or more`、`one or many`、`many(1)`、`1+` は、
左では `}|`、右では `|{` です。
逆の側に書かれた記号は、その側の記号として印字します。
左の `o|` は `|o`、左の `o{` は `}o` です。
線の `to` は `--`、`optionally to`、`.-`、`-.` は `..` です。
カーディナリティ `u` には記号がなく、書かれたまま残し、
単位の間にディレクティブがある関係も残します。
例は記号を 84 回、語とほかの形を 6 回（`only one` が 1 回、
`zero or more` が 2 回、`many(0)`、`0+`、`1` がそれぞれ 1 回）書きます。
線は `--` が 39 回、`to` が 2 回、`..` が 3 回、`optionally to` が 1 回です。
[fixture: er/relationship-spacing/words-to-symbols]
[fixture: er/relationship-spacing/cardinality-words-case-one-form]
[fixture: er/relationship-spacing/entity-only-before-cardinality]
[fixture: er/relationship-spacing/directive-between-word-units-kept]
[fixture: er/relationship-spacing/symbols-on-the-other-side]

### キーワードや記号の別の綴り

gitGraph は `switch` を `checkout` として読みます。
例は `checkout` を 160 回書き、`switch` は書かないので、
`switch` は `checkout` と印字します。
C4 は `Rel_Up`、`Rel_Down`、`Rel_Left`、`Rel_Right` を、`Rel_U`、`Rel_D`、
`Rel_L`、`Rel_R` として読みます。
例は `Rel_U` と `Rel_R` をそれぞれ 1 回書き、長い形は書かないので、
長い形は短い形で印字し、`Rel_Back` と `BiRel` は残します。
railroad 図の EBNF 記法は `::=` を `=` として読みます。
例は `=` を 35 回書き、`::=` は書かないので、`::=` は `=` と印字します。
packet 図の範囲の始まりと終わりが同じ位置のときは、その位置だけになります。
例は位置だけを 7 回書き、両端が同じ範囲は書かないので、
両端の間に空白と `-` 以外がない限り、`4-4` は `4` と印字します。
[fixture: gitgraph/checkout-aliases/alias-one-form]
[fixture: c4/argument-forms/relationship-direction-long-forms]
[fixture: railroad/assignment/ebnf-assignment-equals]
[fixture: packet/block-forms-and-order/equal-range-single]

### ヘッダーの後のコロン

cynefin 図と radar 図は、`cynefin-beta:` と `radar-beta:` を、
コロンのないヘッダーとして読みます。
例は、どちらの図もコロンのないヘッダーを 3 回書き、コロンつきは書かないので、
コロンを除き、その行で後に続くものは、コロンのないヘッダーの後と同じく、
次の行に移します。
`;` や hidden YAML ブロックの `---` が接するコロンは残します。
[fixture: cynefin/header/colon-removed]
[fixture: cynefin/header/colon-semicolon-kept]
[fixture: radar/header/colon-removed] [fixture: radar/header/colon-yaml-kept]

gitGraph のヘッダーの後のコロンは、書かれたまま残します。
[mermaid.js の版](#mermaidjs-の版)を参照してください。
[fixture: gitgraph/header/header-colon]

### リンクのラベル

ラベルは、2 つの矢印の間（`-- text -->`）か、
矢印の後の `|` の間（`-->|text|`）に書け、mermaid.js は両方を同じに読みます。
形は、その図種の例が、もう一方の 2 倍以上多く使うものにします。
agentflow 図は最初の形のリンクが 2 つ、もう一方はないので、
最初の形を読む矢印 `-->` と `--x` のラベルを、矢印の間に印字します。
swimlane 図は最初の形がなく、もう一方が 12 個なので、
flowchart の 8 種類の矢印のラベルを、`|` の間に印字します。
flowchart は最初の形が 14 個、もう一方が 8 個で、2 倍以上ではないので、
書かれたまま残します。
ラベルは、文字、数字、空白、`_`、`,`、`?`、
`!` の通常のテキストでなければなりません。
`|` や `%%` があるラベル、文字列、Markdown のラベル、空白だけのラベル、
空のラベルは、書かれたまま残します。
[fixture: agentflow/edge-labels/pipes-to-arrows]
[fixture: agentflow/edge-labels/blank-pipe-label-kept]
[fixture: flowchart/link-label-form/swimlane-arrows-to-pipes]
[fixture: flowchart/link-label-form/flowchart-header-both-forms-kept]
[fixture: flowchart/link-label-form/kept]

### 1 行の説明ブロック

mermaid.js は、`accDescr {text}` と `accDescr: text` を、
両端の空白を除いた同じアクセシビリティの説明として読み、同じ図を描きます。
（[flowchart の文法](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L33-L37)
には両方の形の規則があり、
どちらも
[両端の空白を除きます](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L390-L391)）。
例は、コロンの後の説明を 3 回（swimlane 図 1 つと状態遷移図 2 つ）、
複数行のブロックを 2 回（ユースケース図 2 つ）書き、1 行のブロックは書きません。
本文のあるブロックを受理するすべての図種は、コロンの形も受理し、
文はどの図種でも同じなので、文字列や数と同じく、例を合わせて数えます。
これには 3 つの図種を含めません。
ブロック図は空のブロックだけを受理し、ishikawa 図は両方の形をノードとして読み、
説明に本文を与えず、イベントモデリング図はトークンを書かれたまま格納するため、
説明が一方では ` accDescr {a}`、他方では ` accDescr: a` になります。
本文が 1 行のブロックは、コロンの形で独立した行に印字します。
`accDescr {a}`、`accDescr { a }`、`accDescr{ a }` は、`accDescr: a` になります。
キーワードと `{` の間は、改行を含めてどの空白でもよく、
本文と波かっこの間も同じです。
`accDescr {`、`a`、`}` を 3 行に書いたものも、`accDescr: a` になります。
`}` の後の `;` は、文を区切るほかの `;` と同じく除きます。
本文は `{`、`:`、`#`、ディレクティブと、
改行でない任意の空白文字（ノーブレークスペース、U+3000、垂直タブ、改ページ、
U+FEFF、U+2028、U+2029）を含んでよく、本文の空白とタブの連なりは、
[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)
の規則で印字します。
ディレクティブはその位置に残し、ブロックは、
同じ本文をコロンの形で書いた場合と同じに印字します。
本文の後の、波かっこの内側か `}` の後にあるディレクティブと、
同じ行で文の前にあるディレクティブは、原文で直前に空白がある場合は、
その前に空白を 1 つ置きます。
`{` の前か `{` と本文の間のディレクティブには、
その図種のコロンの形がディレクティブの隣に印字する空白を置きます。
この空白は図種によって異なります。
`accDescr { %%{init: {}}%% a }` は、agentflow、C4、class、ER、flowchart、Gantt、
ユーザージャーニー、quadrant、requirement、sequence、state、swimlane、timeline、
XY チャートの図（14 図種）では、`accDescr: %%{init: {}}%%a` と印字し、
architecture、cynefin、gitGraph、info、packet、pie、radar、railroad、treemap、
treeView、ユースケース、wardley の図（残りの 12 図種）では、
`accDescr: %%{init: {}}%% a` と印字します。
`accDescr %%{init: {}}%% {c}` は、flowchart、agentflow、swimlane の図では、
`accDescr %%{init: {}}%%: c`、
ほかの 23 図種では `accDescr%%{init: {}}%%: c` と印字します。
どれも、同じ本文をコロンの形で書いた場合の出力です。
[fixture: class/multi-line-values/block-with-directive-before-the-text]
[fixture: class/multi-line-values/colon-with-directive-before-the-text]
[fixture: pie/accessibility-lines/block-with-directive-before-the-text]
[fixture: pie/accessibility-lines/colon-with-directive-before-the-text]
[fixture: flowchart/accessibility-lines/block-with-directive-before-the-text]
[fixture: flowchart/accessibility-lines/colon-with-directive-before-the-text]
[fixture: flowchart/accessibility-lines/block-tight-text]
[fixture: flowchart/accessibility-lines/block-spaced-text]
[fixture: flowchart/accessibility-lines/block-left-padding-only]
[fixture: flowchart/accessibility-lines/block-right-padding-only]
[fixture: flowchart/accessibility-lines/block-text-with-semicolons-padded]
[fixture: flowchart/accessibility-lines/block-text-starts-with-brace]
[fixture: flowchart/accessibility-lines/block-text-with-colon-and-hash]
[fixture: flowchart/accessibility-lines/block-runs-collapsed]
[fixture: flowchart/accessibility-lines/block-text-with-line-break-before-the-brace]
[fixture: flowchart/accessibility-lines/block-directive-inside-text]
[fixture: flowchart/accessibility-lines/block-text-beside-directive]
[fixture: pie/description-blocks/block-asymmetric]
[fixture: pie/description-blocks/block-keyword-tab]
[fixture: pie/description-blocks/block-opener-newline]
[fixture: pie/description-blocks/block-text-on-its-own-line]
[fixture: pie/description-blocks/block-with-directive-after-the-text]
[fixture: usecase/direction-and-accessibility/block-text-on-its-own-line]
[fixture: sequence/multi-line-values/accdescr-block-closing-brace-after-text]
[fixture: c4/description-blocks/opener-whitespace-dropped]
[fixture: c4/description-blocks/block-after-directive]
[fixture: treemap/description-blocks/block-after-directive]
[fixture: treeview/description-blocks/block-after-directive]
[test: U+2028 between the keyword and the brace of a flowchart description block]
[test: a no-break space inside the text of a flowchart description block]
[test: U+3000 inside the text of a flowchart description block]
[test: a vertical tab inside the text of a flowchart description block]
[test: a form feed inside the text of a flowchart description block]
[test: U+FEFF inside the text of a flowchart description block]
[test: U+2028 in the text of a flowchart description block]
[test: U+2029 in the text of a flowchart description block]
[test: U+2028 before the text of a flowchart description block]
[test: U+2028 after the text of a flowchart description block]

後の箇条書きで述べるとおり、コロンの形の本文を `%%` の前で終える図種では、
`}` の後のコメントは本文の後に残します。
同じ行でブロックの後に続く文は、その行が文を同じ行に保つ行でなければ、
ほかの文と同じく独立した行に移します。
`accDescr { %%{init: {}}%% a } A` は、
`accDescr: %%{init: {}}%%a` と `A` の 2 行になります。
文を同じ行に保つ行のブロックは、その行の最後の文で、後ろに空白、コメント、
ディレクティブだけが続く場合に、コロンの形で印字します。
`A --> B; accDescr {a;b}` は `A --> B; accDescr: a;b` になり、
C4 図で空のブロックの後にあるブロック `accDescr {}accDescr {D}` は、
`accDescr {}accDescr: D` になります。
枝の文字で描く treeView 図（箱）では、
キーワードの前とキーワードと `{` の間の描画の文字は、印字せずに描き直すため、
それらの文字があることは、ブロックを残す理由になりません。
[fixture: flowchart/accessibility-lines/block-last-on-a-line-with-a-semicolon]
[fixture: flowchart/accessibility-lines/block-text-with-semicolon]
[fixture: c4/description-blocks/block-after-an-empty-block]
[fixture: treeview/modes/ordinary-block]
[fixture: treeview/modes/box-common-block-zero-column]
[fixture: treeview/description-blocks/box-redraw-remove-opener-prefixes]
[fixture: flowchart/accessibility-lines/block-with-directive-before-the-text-then-statement]
[fixture: usecase/direction-and-accessibility/block-text-on-its-own-line-runs-collapsed]
[fixture: treeview/description-blocks/block-text-on-its-own-line-runs-collapsed]
[fixture: usecase/direction-and-accessibility/block-directive-line-after-the-text]
[test: accessibility blocks: pie brace-after-ls-direction-converted]

コロンの形ではブロックの内容を保てないか、ブロックと同じに読まれない場合は、
ブロックを書かれたまま残します。

- 本文が複数行にまたがる場合です。
  コロンの形は 1 行だからです。
  [fixture: er/accessibility-statements/block-lines-kept]
  [fixture: pie/description-blocks/block-inline-leading-lines]
  [fixture: pie/description-blocks/block-columns]
- `direction` を含む行を図の方向として読む図種（flowchart、swimlane、agentflow、
  class、state、ER、requirement、C4、ユースケースの図）で、
  本文の `direction` にその規則が届かない場合です。
  字句解析器は、行の先頭から `.*direction\s+RL[^\n]*` で行を読み、
  この規則は行終端（LF、CR、U+2028、U+2029）を越えては届きません。
  キーワードの後か `}` の前に行終端があるブロックも、
  語 `direction` がディレクティブで分割されているブロックも、
  説明は `direction RL` です（mermaid.js
  は行を読む前にディレクティブを除きます）。
  コロンの形は、本文をキーワードの行に置きます。
  class 図、state 図、C4 図では、この規則が `accDescr` より前にあるため、
  `accDescr: direction RL` は方向を設定し、説明が空になるか、
  C4 図では拒否されます。
  flowchart、agentflow 図、ER 図、requirement 図では、
  この規則が `accDescr` より後にあるため、
  `accDescr: direction RL` は行頭では説明で、
  行を字下げすると方向の行になります。
  印字は、本文の文を字下げします。
  [fixture: class/multi-line-values/block-direction-on-its-own-line-kept]
  [fixture: class/multi-line-values/block-brace-on-the-next-line-direction-kept]
  [fixture: state/multi-line-values/block-direction-on-its-own-line-kept]
  [fixture: state/multi-line-values/block-on-a-line-with-a-semicolon-brace-on-the-next-line-direction-kept]
  [fixture: c4/description-blocks/acc-block-direction-keep]
  [fixture: c4/description-blocks/block-after-an-empty-block-brace-on-the-next-line-direction-kept]
  [fixture: er/accessibility-statements/block-direction-split-by-a-directive-kept]
  [fixture: requirement/accessibility-statements/first-column-kept]
  [fixture: requirement/accessibility-statements/block-brace-on-the-next-line-direction-kept]
  [test: accessibility blocks: class brace-after-ls-direction-kept]
  [test: accessibility blocks: class text-between-ls-direction-kept]
  [test: accessibility blocks: er text-between-ps-direction-kept]
  [test: accessibility blocks: requirement brace-after-ps-direction-kept]
- `{` の前か `{` と本文の間にディレクティブがあり、
  ブロックが複数行にまたがるか、文を同じ行に保つ行で後ろに別の文が続く場合です。
  [`;` を含む行](#-を含む行)を参照してください。
  C4 でブロックが空のブロックの隣にある行も、そのような行です。
  このようなブロックをコロンの形で印字するのは、ブロックが 1 行にあり、
  その行が文を同じ行に保つ行でない場合だけです。
  それ以外ではブロックの形で印字し、2 回目の整形でも変わりません。
  [fixture: flowchart/accessibility-lines/block-with-directive-before-the-text-over-lines]
  [fixture: flowchart/accessibility-lines/block-with-directive-before-the-text-on-a-kept-line]
- agentflow、C4、Gantt、ユーザージャーニー、quadrant、requirement、sequence、
  state、timeline、XY チャートの図で、
  同じ行の `}` の後にコメントがある場合です。
  これらの図種は、コロンの形の本文の一部として `%%` を読むため、
  `accDescr: a %% c` の説明は `a %% c` ですが、
  ブロック `accDescr {a} %% c` の説明は `a` です。
  コロンの形の本文を `%%` の前で終える図種（後述）では、
  両方の形の説明が `a` になり、ブロックをコロンの形で印字します。
  class、ER、flowchart、swimlane、ユースケースの図は、
  後ろにコメントがあるブロックを拒否します。
  [fixture: sequence/multi-line-values/block-then-comment-kept]
  [fixture: pie/description-blocks/block-then-comment]
  [fixture: pie/description-blocks/block-trailing-comment]
  [fixture: info/comments/comments-inline]
- ブロックに本文がないか、ディレクティブだけがある場合です。
  [アクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)のとおり、
  `accDescr {}` と印字します。
  [fixture: flowchart/accessibility-lines/empty-block-tight]
  [fixture: flowchart/accessibility-lines/empty-block-spaced]
  [fixture: flowchart/accessibility-lines/empty-block-directive-kept]
- ブロックが閉じていない場合です。
  [fixture: flowchart/accessibility-lines/block-unclosed]
- 文を同じ行に保つ行のブロックで、同じ行の後ろに文か `;` が続くか、
  mermaid.js の行の規則が読む行の場合です（[`;` を含む行](#-を含む行)を参照）。
  コロンの形は行末まで続くため、後ろの文が本文の一部になってしまいます。
  [fixture: flowchart/accessibility-lines/block-before-another-statement-on-a-kept-line]
  [fixture: flowchart/accessibility-lines/block-on-style-line-kept]
  [fixture: c4/statements-one-per-line/description-null-adjacency]
- architecture、cynefin、gitGraph、info、packet、pie、radar、railroad、treemap、
  treeView、wardley の図で、本文に `%%`、U+2028、U+2029 がある場合です。
  これらの図種は、
  [共通文法の 1 つの終端記号](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/parser/src/language/common/common.langium#L14)
  で説明を読みます。
  コロンの形の本文は `%%` の前で終わり、行の残りはコメントとして読みますが、
  ブロックの中の `%%` は本文の一部として読みます。
  `accDescr: a %% b` の説明は `a`、`accDescr {a %% b}` の説明は `a %% b` です。
  これらの図種のブロックは、行区切り文字の前後の空白も除きます。
  円グラフと gitGraph では、
  `accDescr { A<U+2028> B }` の説明は `A<U+2028>B` で、
  `accDescr: A<U+2028> B` の説明は `A<U+2028> B` です。
  ほかの図種は、両方の形で `%%` と行区切り文字を本文の一部として読み、
  本文にそれらがあっても、ブロックをコロンの形で印字します。
  [fixture: pie/description-blocks/block-text-with-percent-kept]
  [fixture: flowchart/accessibility-lines/block-text-with-percent]
  [test: pie/line-terminators-and-unicode/unicode-values]
- state 図で、ブロックに U+2028 か U+2029 がある場合です。
  state 図は、どちらかを含む行を書かれたまま印字します。
  （[行区切り文字を含む state の行](#行区切り文字を含む-state-の行)）。
  [test: accessibility blocks: state text-with-ls-kept]
- イベントモデリング図か、ishikawa 図の場合です。
  イベントモデリング図は、
  [Description blocks](./eventmodeling.ja.md#description-blocks)のとおり、
  説明を全体として保ちます。
  ishikawa 図は、`accDescr {a}` と `accDescr: a` を説明のないノードとして読み、
  両方の Db の `accDescr` は空です。
  どちらの図種も、印字は形を変えません。
  [corpus fixture: ishikawa/db-accdescr-block-is-nodes]
  [corpus fixture: ishikawa/db-accdescr-is-node]
  [fixture: ishikawa/node-text/values-opaque]
- 枝の文字で描く treeView 図（箱）で、本文に `x─` のような描画の文字があり、
  図がそれを箱として読むか、箱がキーワードと `{` の間の文字を保つ場合です。
  [fixture: treeview/modes/block-interior-active]

mermaid.js 12.3.0 は、コロンの後に説明を書く 3 つの例を、
ブロックでも書いた両方の綴りを受理し、Db と SVG は同じでした。
さらに、22 図種でそれぞれ 2 つの例、
info とユーザージャーニーでそれぞれ 1 つの例、gitGraph でさらに 3 つの例に、
両方の綴りで説明を挿入し、49 対を比べました。
ほかの図種の 44 対は、両方の SVG が同じでした（そのうち 6 対は、
生成された id を除いて比べました）。
gitGraph の 5 対も、数、コミット id、要素の id を除くと同じでした。
`%%` を本文の一部として読む図種のうち 13 図種の例に、
`%%` を含む本文を同じように挿入した 26 対も、すべて SVG が同じでした。
railroad 図は描画せず、Db だけを比べました。

2 つ目のリストの規則は、説明ブロックを持つ図種から、
ブロック図とイベントモデリング図を除いた 25 図種のそれぞれで、
受理される例を 1 つずつ使い、ブロックとコロンの形を挿入して見つけました。
ほとんどの図種では 3 つの例を使いました。
本文にノーブレークスペース、U+3000、垂直タブ、改ページ、U+FEFF、U+2028（単独）、
U+2029（単独）、タブ、空白の連なり、`;` を含む場合と、本文の中、`{` の前、
`{` と本文の間にディレクティブがある場合は、25 図種すべてで Db が同じでした。
本文が独立した行にある場合も、class 図、state 図、C4 図の `direction` と、
`%%` で始まる行を除き、25 図種すべてで同じでした。
11 図種は `%%` で始まる行をコメントとして読むため、
ブロックに本文がなくなります。
`}` の後にコメントを置くと、10 図種で Db が異なり、
本文を `%%` の前で終える 11 図種ではすべて同じで、
4 図種では mermaid.js が拒否しました。
適合性コーパスでは、533 個の fixture の 544 個のブロックを、
コロンの形で印字します。
483 個では mermaid.js の Db が同じで、41 個は mermaid.js が拒否する入力で、
9 個はタイトル、説明、スタイルの空白が異なります。
この違いは、
[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)
と、[同じに描かれるスタイル](#同じに描かれるスタイル)の節で定めています。
整形ツールの fixture のうち、整形で変わる 71 対を描画し、
mermaid.js が描画する 68 対では SVG が同じでした。

### テキストの引用符

mermaid.js は、一部のテキストを引用符がある形とない形で同じに読みます。
sankey 図のリンクの source は、`"a b",c,1` と `a b,c,1` で同じ id です。
[記録のアクション](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/parser/sankey.jison#L53-L55)
が、どちらの形の欄も両端の空白を除き、`""` を `"` として読むためです。
形は、その図種の例が、もう一方の 2 倍以上の頻度で使うものにします。
両方の形で同じに読むテキストはその形で印字し、ほかは書かれたまま残します。
対象の欄と、各欄をそれぞれの形で書く例の数は、以下のとおりです。

| 図種           | 欄                                   | 引用符なし | 引用符あり |
| -------------- | ------------------------------------ | ---------: | ---------: |
| sankey         | リンクの source                      |         87 |          0 |
| sankey         | リンクの target                      |         83 |          4 |
| sankey         | リンクの値（値の形に従う）           |         87 |          0 |
| ER             | 実体の名前                           |         39 |          2 |
| ER             | 関係の役割                           |         43 |          2 |
| ER             | 関係の左の名前                       |         45 |          0 |
| ER             | 関係の右の名前                       |         45 |          0 |
| ER             | subgraph の id                       |         11 |          1 |
| requirement    | requirement の名前                   |         15 |          1 |
| requirement    | element の名前                       |         10 |          0 |
| requirement    | requirement の id                    |         16 |          0 |
| requirement    | requirement の text                  |         13 |          3 |
| requirement    | element の type                      |          9 |          1 |
| requirement    | element の docRef                    |          2 |          0 |
| requirement    | 関係の左の名前                       |         14 |          0 |
| requirement    | 関係の右の名前                       |         14 |          0 |
| requirement    | クラスと `style` の名前              |          9 |          0 |
| Wardley マップ | component の名前                     |         46 |          7 |
| Wardley マップ | anchor の名前                        |          5 |          0 |
| Wardley マップ | リンクの名前                         |         50 |         12 |
| Wardley マップ | evolve と pipeline の名前            |          5 |          2 |
| Wardley マップ | evolution の stage の名前            |         20 |          0 |
| Wardley マップ | accelerator と deaccelerator の名前  |          0 |          4 |
| Wardley マップ | pipeline の component の名前         |          0 |          4 |
| gitGraph       | ブランチの名前                       |         84 |          0 |
| gitGraph       | checkout または switch のブランチ    |        160 |          0 |
| gitGraph       | merge のブランチ                     |         49 |          0 |
| quadrant       | x 軸のテキスト                       |          6 |          0 |
| quadrant       | y 軸の始まり                         |          3 |          0 |
| quadrant       | y 軸の終わり                         |          2 |          1 |
| quadrant       | 象限のテキスト                       |         12 |          0 |
| quadrant       | 点の名前                             |         12 |          0 |
| XY チャート    | チャートのタイトル                   |          0 |          8 |
| XY チャート    | x 軸のタイトル                       |          0 |          2 |
| XY チャート    | y 軸のタイトル                       |          0 |          8 |
| XY チャート    | line のタイトル                      |          0 |          3 |
| XY チャート    | 分類                                 |         38 |         17 |
| Venn           | 集合の一覧にある集合の名前           |         50 |          0 |
| Venn           | 集合または union のラベル            |          0 |         22 |
| Venn           | 対象のない text の id                |          6 |          0 |
| Venn           | 対象のない text のラベル             |          0 |          6 |
| Venn           | style の対象                         |          4 |          0 |
| Venn           | style のプロパティの値               |          3 |          0 |
| use case       | actor の名前                         |         21 |          0 |
| use case       | use case の名前                      |          8 |          1 |
| use case       | 関係の source                        |         66 |          0 |
| use case       | 関係の target                        |         66 |          0 |
| use case       | system boundary の名前               |          7 |          2 |
| use case       | metadata 更新の対象                  |          4 |          0 |
| use case       | metadata のプロパティのキー          |         16 |          0 |
| use case       | actor、境界、更新の type             |          7 |          0 |
| use case       | エッジの animation                   |          2 |          0 |
| use case       | 丸括弧内の actor のラベル            |          1 |         12 |
| use case       | 丸括弧内の use case のラベル         |          1 |         27 |
| use case       | id のある system boundary のタイトル |          0 |          2 |
| use case       | 分割した association のラベル        |          1 |          3 |
| use case       | note のラベル                        |          0 |          1 |
| use case       | actor の icon                        |          0 |          2 |
| use case       | 角括弧内の use case のラベル         |          6 |          0 |
| architecture   | group のラベル                       |          6 |          0 |
| architecture   | service のラベル                     |         30 |          0 |
| mindmap        | 形のテキスト                         |         21 |          0 |
| kanban         | 形のテキスト                         |         19 |          0 |
| C4             | 要素または境界の alias               |         73 |          0 |
| C4             | 更新での要素の alias                 |          2 |          0 |
| C4             | 関係の source                        |         35 |          0 |
| C4             | 関係の target                        |         35 |          0 |
| C4             | 更新での関係の source                |         31 |          0 |
| C4             | 更新での関係の target                |         31 |          0 |
| C4             | ラベル                               |          1 |        107 |
| C4             | technology                           |          0 |         43 |
| C4             | 境界またはノードの type              |          0 |         14 |
| C4             | 要素の description                   |          0 |         46 |
| flowchart      | subgraph の名前                      |         53 |          1 |
| agentflow      | flow の名前                          |         17 |          0 |
| agentflow      | connector の名前                     |          2 |          0 |
| agentflow      | connector のタイトル                 |          0 |          2 |
| class          | class の名前                         |        178 |          4 |
| class          | namespace の名前                     |         11 |          0 |

actor、use case、system boundary の名前は、
それ自体のラベルやタイトルがない場合を数えます。
引用符で囲んだ名前には、それらを付けられないためです。
すべての名前を数えると、actor は 35 / 0、use case は 44 / 1、
system boundary は 9 / 2 です。

テキストが平易なら、引用符なしで印字します。
平易なテキストは、ASCII の英字、数字、`_`、`-`、`.` と、それらの間の空白です。
sankey 図では、欄が取り除く両端の空白も含みます。
sankey の字句解析器は、`"` と `,` 以外の ASCII の印字可能文字をすべて、
引用符のない欄に取り込みますが、
ほかの種類の文字はどの処理段階でも同じに読まれるわけではありません。
`%%` はコメントやディレクティブを始め、`#` は実体参照を始め、
`;` は `style` と `classDef` の行の規則に関わり、改行は記録を終えます。
`&`、`<`、`>`、`'`、`\`、`/` は、すべての位置では比較していません。
そのため、これらの文字や `,`、`"` を含むテキストは、引用符で囲んだまま残し、
ディレクティブやコメント領域を内部に含む文字列も同じにします。
[fixture: sankey/quotes/plain-text-without-quotes]
[fixture: sankey/quotes/plain-text-with-spaces-without-quotes]
[fixture: sankey/quotes/spaces-at-the-ends-left-out]
[fixture: sankey/quotes/comma-and-doubled-quotes-kept]
[fixture: sankey/quotes/other-characters-keep-the-quotes]
[fixture: sankey/values/forms-kept]
[fixture: sankey/quotes/values-in-quotes-without-quotes]
[fixture: sankey/directives/inside-fields-kept]
[fixture: sankey/multi-line-strings/string-over-lines]

ER 図では、ASCII の英字か `_` で始まる、ASCII の英字、数字、
`_` からなる 1 語のテキストを、
字句解析器が独立した単位として読む以下の語のいずれでもない場合に、
引用符なしで印字します。
大文字小文字は問いません。
`erDiagram`、`style`、`classDef`、`class`、`subgraph`、`end`、`one`、`many`、
`only`、`zero`、`optionally`、`or`、`to`、`accTitle`、`accDescr`、`direction`、
`TB`、`BT`、`RL`、`LR`、`PK`、`FK`、`UK`、`u`、`o` です。
空白、`-`、ASCII 外の文字など、ほかの文字を含む名前や、
字句解析器が数や多重度として読める数字で始まる名前、
mermaid.js が名前を空白 1 つで結ぶ subgraph のタイトルは、書かれたまま残します。
[fixture: er/entities/plain-names-without-quotes]
[fixture: er/entities/names-that-need-quotes] [fixture: er/entities/alias-tight]
[fixture: er/statements-one-per-line/relationships]
[fixture: er/statements-one-per-line/role-then-entity]
[fixture: er/subgraphs/quoted-and-number-ids]

requirement 図では、名前、クラス、`style`、`classDef`、`class` の文の名前は、
ASCII の英字、数字、`_` からなる 1 語で、
字句解析器が独立した単位として読む語（キーワード、requirement と関係の種類、
risk、検証方法、向きで、大文字小文字は問いません）のいずれでもない場合に、
引用符なしで印字します。
id、text、type、docRef は、同じ文字からなる語を空白で区切った形で、
最初の語がそれらの語のいずれでもない場合に、引用符なしで印字します。
`text: "the test text"` は `text: the test text` と印字し、
`text: "risk high"` は引用符で囲んだまま残します。
`risk` で始まるテキストは、フィールド `risk` として読まれるためです。
[fixture: requirement/names/plain-names-without-quotes]
[fixture: requirement/names/names-that-need-quotes]
[fixture: requirement/fields/plain-values-without-quotes]
[fixture: requirement/class-lists/string-classes]
[fixture: requirement/styles-and-classes/style-names]

Wardley マップでは、ASCII の英字、数字、`_` からなり、
英字で始まる語を空白 1 つで区切ったテキストを、以下の語で始まらない場合に、
引用符なしで印字します。
字句解析器は、これらを小文字で、語の境界を求めず独立した単位として読みます。
`build`、`buy`、`outsource`、`market`、`size`、`evolution`、`anchor`、
`component`、`label`、`inertia`、`evolve`、`pipeline`、`note`、`annotation`、
`accelerator`、`deaccelerator`、`title`、`accTitle`、`accDescr` です。
そのため、`"buyer"` は引用符で囲んだまま残し、`"title x"` も同じですが、
`"Title x"` の引用符は除きます。
accelerator と deaccelerator、pipeline の component の名前は、
引用符で囲んで印字します。
矢印のないリンクの 2 つの名前 `"A" "B"` は、
引用符を外すと 1 つの名前として読まれ、
名前に隣接する hidden YAML ブロックの `---` は名前に結合されるので、
これらは引用符を残します。
[fixture: wardley/names-and-quotes/plain-names-without-quotes]
[fixture: wardley/names-and-quotes/names-that-need-quotes]
[fixture: wardley/links/link-no-arrow]
[fixture: wardley/pipeline/pipeline-depth]

gitGraph では、ASCII の英字、数字、`_` と、その間の `-`、`.`、`/` からなり、
英字か `_` で始まり、英字、数字、`_` で終わるブランチを、
タイトルの行が取り込む `title` で始まらず、語の一部でない文字の前で、
字句解析器が独立した単位として読む語でも始まらない場合に、
引用符なしで印字します。
数字は数の始まりになり得ます。
独立した単位として読む語の判定では、大文字小文字を問いません。
古い版の mermaid.js は、これらを大文字小文字を問わず比較し、
`commit-x` を語 `commit` と `-x` として読むためです。
そのため、`"develop"` と `"feature/login"` の引用符は除き、`"commit"`、
`"Merge"`、`"titleA"`、`"1st"`、`"release/1."`、
空白を含む名前は引用符で囲んだまま残します。
[fixture: gitgraph/references/plain-names-without-quotes]
[fixture: gitgraph/references/names-that-need-quotes]
[fixture: gitgraph/references/reference-forms]

象限チャートでは、ASCII 英字の単語でできていて、各単語の末尾には数字も使え、
単語の間は空白 1 つのテキストを、どの単語も `title`、`classDef`、`accTitle`、
`accDescr` のいずれでもなく、`quadrant` で始まる語でもない場合に、
引用符なしで印字します。
大文字小文字は問いません。
字句解析器は、数字や `_` の後の英字を再び単語の始まりとして読むので、`-`、`_`、
単語の途中の数字や、先頭の数を含むテキストは、引用符で囲んだまま残します。
[fixture: quadrant/quotes/plain-texts-without-quotes]
[fixture: quadrant/quotes/texts-that-need-quotes]
[fixture: quadrant/points/string-names] [fixture: quadrant/axes/strings]

XY チャートでは、テキストは ASCII の英字、数字、`_`、`-` からなる、
空白のない 1 語です。
mermaid.js は引用符のないテキストの空白を落とすので、
複数の語のテキストは引用符で囲むと同じではありません。
チャート、軸、line のタイトルは引用符で囲んで印字します。
分類は、英字の連なりの始まり（テキストの先頭と、数字、`_`、`-` の後）で、
字句解析器が独立した単位として読む以下の語のいずれも始まらない場合に、
引用符なしで印字します。
大文字小文字は問いません。
`title`、`xychart-beta`、`xychart`、`x-axis`、`y-axis`、`line`、`bar` は、
後ろに英字、数字、`_` がない場合で、`vertical` と `horizontal` は、
どこで始まる場合も該当します。
そのため、`"a-line"` と `"Line"` は引用符を残し、
`"line1"` と `"Barcelona"` は外します。
bar のタイトルは例にないので書かれたまま残し、
そのキーワード以外の単位に接するタイトルも同じにします。
[fixture: xychart/quotes/titles-in-quotes]
[fixture: xychart/quotes/categories-without-quotes]
[fixture: xychart/quotes/categories-that-need-quotes]
[fixture: xychart/quotes/texts-of-several-words]
[fixture: xychart/quotes/bar-titles-as-written]
[fixture: xychart/quotes/texts-on-a-kept-line-as-written]
[fixture: xychart/text-units/hyphen-and-number-touching-kept]

Venn 図では、ASCII の英字、数字、`_`、`-` からなり、英字か `_` で始まる名前を、
字句解析器が独立した単位として読む以下の語で始まらず、`title` でもない場合に、
引用符なしで印字します。
独立した単位として読む語の判定では、大文字小文字を問わず、その後の文字が英字、
数字、`_` のいずれでもないことを求めます。
語は `venn-beta`、`set`、`union`、`text`、`style` です。
`-` はそのような文字なので、`set-a` は `set` で始まります。
`title` は、同じ行の後にテキストが続くとタイトルを始めます。
そのため、`"A"` と `"xset"` の引用符は除き、`"set"`、`"set-a"`、`"title"`、
`"a b"`、`"1a"`、`"007"` は引用符を残します。
style のプロパティの値は、そのような名前、数、
`#` と 3 桁から 8 桁の十六進数字からなる色を空白 1 つで区切った形なら、
引用符なしで印字します。
mermaid.js はそのような値の語を空白 1 つでつなぐので、
`"red  blue"` は引用符を外すと同じではなく、`"1a"` は数と名前として読まれます。
ラベルは、括弧の間のテキストを引用符で囲んで印字します。
ただし、括弧に接する空白、タブ、ノーブレークスペースは、
mermaid.js が引用符の有無によらず除くので、印字でも除きます。
空白だけのラベル（Db にはラベルがなく、`[" "]` には空のラベルがあります）、
`%%` を含むラベル、内部にディレクティブやコメントがあるラベルは、
書かれたまま残します。
対象のある text は、例にないので書かれたまま残します。
[fixture: venn/quotes/names-without-quotes]
[fixture: venn/quotes/names-that-need-quotes]
[fixture: venn/quotes/style-values-without-quotes]
[fixture: venn/quotes/labels-in-quotes]
[fixture: venn/quotes/labels-that-stay-as-written]
[fixture: venn/quotes/explicit-text-as-written]
[fixture: venn/quotes/names-before-a-comment-as-written]
[fixture: venn/quotes/texts-on-a-kept-line-as-written]

use case 図では、単独で引用符に囲まれた名前が ASCII の英字、数字、`_` からなり、
字句解析器が独立した単位として読む以下の語のいずれでもない場合に、
引用符なしで印字します。
mermaid.js は、ほかの文字を `_` に置き換えて id を作るためです。
`actor`、`systemBoundary`、`end`、`direction`、`TD`、`TB`、`BT`、`LR`、`RL`、
`note`、`for`、`json`、`classDef`、`class`、`style`、`true`、`false`、
`accTitle`、`accDescr` は、書かれた大文字小文字で判定します。
`include`、`extend`、`allowmixing`、`newpage`、`package`、`rectangle`、
`skinparam` は、大文字小文字を問いません。
丸括弧内のラベル、system boundary のタイトル、分割した association のラベル、
note のラベルは、引用符で囲んで印字します。
ただし、バッククォートで始まるラベルは例外です。
引用符とバッククォートで markdown 文字列になるためです。
use case の角括弧内のラベルは、ASCII の英字、数字、`_` からなる語を、
空白 1 つで区切った形なら、引用符なしで印字します。
native metadata のキーとスカラーは、1 語なら引用符なしで印字します。
ただし、`icon` のスカラーは引用符で囲んで印字します。
[fixture: usecase/quotes/names-without-quotes]
[fixture: usecase/quotes/names-that-need-quotes]
[fixture: usecase/quotes/labels-in-quotes]
[fixture: usecase/quotes/labels-as-written]
[fixture: usecase/quotes/square-bracket-labels]
[fixture: usecase/quotes/metadata] [fixture: usecase/quotes/touching-units]
[fixture: usecase/quotes/texts-on-a-kept-line-as-written]

architecture 図では、引用符で囲んだラベルが ASCII の英字、数字、`_`、
空白からなり、両端に空白がなければ、引用符なしで印字します。
引用符で囲むラベルを読む 11.13.0 から 11.16.1 までの文法は、
引用符のないラベルではこれらの文字だけを読むためです。
また、バックスラッシュや引用符を含むラベルは、引用符を外すと、
mermaid.js が読むタイトルが変わります。
mermaid.js はタイトルの外側の引用符 1 組を除き、
引用符があったタイトルでだけ `\"` と `\'` を `"` と `'` に戻すためです。
そのため、`"a\"b"` を `a\"b` と、`"'x'"` を `'x'` と印字すると、
別のタイトルとして読まれます。
mindmap と kanban のボードでは、引用符で囲んだ形のテキストを、
引用符のないテキストを終えるか閉じとして読まれる `)`、`]`、`(`、`}` を含まず、
余白も改行もなく、`-` で始まらず、ダッシュの形のダッシュに隣接しない場合に、
引用符なしで印字します。
`(` と `-` は開き `(-` になり、`)` の前の `-` は閉じ `-)` になるためです。
ダッシュの形は `(-"x"-)` で、その閉じ `-)` は文字列の後にだけ続きます。
markdown 文字列は残します。 [fixture: architecture/quotes/labels-without-quotes]
[fixture: architecture/quotes/labels-that-need-quotes]
[fixture: mindmap/quotes/labels-without-quotes]
[fixture: mindmap/quotes/labels-that-need-quotes]
[fixture: kanban/quotes/labels-without-quotes]
[fixture: kanban/quotes/labels-that-need-quotes]

C4 図では、要素や境界の alias と、関係や `UpdateRelStyle` の両端は、
ASCII の英字、数字、`_`、`-`、`.` と、それらの間の空白からなり、
直後に `,` が続く場合に、引用符なしで印字します。
label、technology、type、要素の description は、引用符で囲んで印字します。
引用符のない引数は次の `,` まで続き、
mermaid.js は ASCII の空白の後でだけ文字列を読むため、空白、タブ、改行、
別の文字列が後に続く alias と、呼び出しの最後の引数は引用符を残します。
最後の引数は、引用符がないと `)` をテキストに取り込むためです。
`"` や改行を含むテキスト、文字列の後にタブ、改行、
ASCII の空白以外の空白を挟んで立つテキスト、行の頭にあるテキスト、
同じ行の後ろに `,` がないテキストは、引用符なしのまま残します。
`,` や `(` の後のタブやほかの空白は空白 1 つに置き換えるので、
引用符を付けるのを妨げません。
ノードと関係の description、`RelIndex` のすべての引数、sprite、tags、link、
更新の設定と、`Enterprise_Boundary`、`System_Boundary`、
`Container_Boundary` の 3 番目の tags は、例では名前付き属性で書かれるか、
まったく書かれないので、書かれたまま残します。
名前付き属性も、どの形でも値が文字列で、キーに引用符が含まれるので、
書かれたまま残します。 [fixture: c4/quotes/names-without-quotes]
[fixture: c4/quotes/names-that-need-quotes]
[fixture: c4/quotes/names-before-a-gap-as-written]
[fixture: c4/quotes/texts-in-quotes]
[fixture: c4/quotes/texts-that-stay-without-quotes]
[fixture: c4/quotes/other-arguments-as-written]
[fixture: c4/quotes/names-and-texts-on-a-kept-line-as-written]

flowchart、swimlane 図、agentflow 図では、引用符で囲んだ subgraph、flow、
connector の名前が、ASCII の英字、数字、`_` の語を空白 1 つで区切ったもので、
どの語も `_blank`、`_parent`、`_self`、`_top`、`call`、`click`、`default`、
`direction`、`end`、`href`、`interpolate` でなければ、引用符なしで印字します。
字句解析器はこれらを独立した単位として読むので、`"end"`、`"click"`、
`"x _self"` は引用符を残します。
agentflow 図の字句解析器は `end` を名前として読みますが、
印字はこれも引用符を残します。
同じ行で語が接する名前（`subgraph "S"accDescr {}`）、コメントが続く名前、
空白 2 つの連なりを持ち、subgraph にタイトルがあるため id になる名前は、
引用符を残します。
connector のタイトルは、mermaid.js が引用符の有無によらず同じに読むので、
英字または数字で始まり、ASCII の英字、数字、空白、`_`、`-`、`.`、`,`、`:`、`!`、
`?` からなる場合に、引用符で囲んで印字します。
[fixture: flowchart/quotes/subgraph-names-without-quotes]
[fixture: flowchart/quotes/swimlane-lane-names-without-quotes]
[fixture: flowchart/quotes/subgraph-names-that-need-quotes]
[fixture: flowchart/quotes/subgraph-names-with-runs-without-quotes]
[fixture: flowchart/quotes/subgraph-names-before-a-comment]
[fixture: flowchart/subgraph-header/whitespace-before-block-kept]
[fixture: agentflow/quotes/names-without-quotes]
[fixture: agentflow/quotes/names-that-need-quotes]
[fixture: agentflow/quotes/connector-titles-in-quotes]
[fixture: agentflow/quotes/connector-titles-as-written]
[fixture: agentflow/quotes/names-and-titles-before-a-comment]

class 図では、バッククォートで囲んだ class または namespace の名前が、
ASCII の英字、数字、`_` からなる 1 語で、`_blank`、`_parent`、`_self`、`_top`、
`accDescr`、`accTitle`、`call`、`callback`、`class`、`classDef`、`click`、
`cssClass`、`href`、`link`、`namespace`、`note`、`o`、
`style` のいずれでもない場合に、バッククォートなしで印字します。
字句解析器は、名前の位置にあるこれらの語を独立した単位として読みます。
2 語の名前は、バッククォートを外すと空白なしで結ばれた 2 語になり、
ほかの文字を含む名前は同じに読まれません。
コメントやディレクティブのある行の名前は、バッククォートを残します。
[fixture: class/quotes/names-without-quotes]
[fixture: class/quotes/names-that-need-quotes]
[fixture: class/quotes/names-on-a-kept-line-as-written]

flowchart、swimlane 図、agentflow 図では、subgraph や flow のタイトル、
図形のラベル、リンクのラベルは、書かれたまま残します。
mermaid.js は `A["x"]` を文字列、`A[x]` をテキストとして読み、
Db は前者の `labelType` に `string`、後者に `text` を持つので、
両方の形は同じに読まれないためです。
sequence 図に文字列はなく、参加者の説明（`participant A as "Alice"`）、
メッセージ、ノートの引用符はテキストの文字です。
class 図の文法は、クラスのラベル、ノートのテキスト、多重度に文字列を必要とし、
引用符のないテキスト（`class A[Label]`、`note for B Text`、
`A 1 --> * B`）を拒否します。
eventmodeling 図の名前に引用符で囲む形はなく、frame のデータ、タイトル、
アクセシビリティの値の引用符はテキストの文字です。
Db はデータ `{"x"}` に `{"x"}` を、`{x}` に `{x}` を持ちます。
[fixture: flowchart/quotes/labels-as-written]
[fixture: flowchart/quotes/subgraph-titles-as-written]
[fixture: agentflow/quotes/labels-as-written]
[fixture: agentflow/quotes/flow-titles-as-written]
[fixture: sequence/quotes/texts-as-written]
[fixture: class/quotes/strings-as-written]
[fixture: eventmodeling/quotes/quotes-as-written]

treeView のノードの名前は、例では引用符なしが 58 回、引用符ありが 8 回ですが、
引用符で囲まれていれば、書かれたまま残します。
11.14.0 と 11.15.0 の文法は引用符で囲む名前だけを読み、
引用符のない名前は 11.16.0 から読むためです。
そのため、引用符なしで印字すると、書かれたテキストを読む版で読めなくなります。

テキストの空白とタブの連なりを空白 1 つで印字する欄では、
テキストをその印字された形で判定し、
2 回目の整形が 1 回目の印字したものを読むようにします。
（[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)）。
そのため、文字の間にタブがある requirement 図の `text: "a b"` は、
`text: a b` と印字し、象限チャートの `quadrant-2 "c d"` と、
architecture 図の `service s(server)["a b"]` も同じように印字します。
`white-space` を含む図のテキストなど、書かれたまま残すテキストは、
書かれた形で判定し、タブがあれば引用符を残します。
[fixture: requirement/fields/string-values-tabs-collapsed]
[fixture: requirement/fields/string-values-tabs-kept-with-white-space]
[fixture: quadrant/quotes/strings-runs-collapsed]
[fixture: architecture/quotes/labels-with-runs-without-quotes]

`#` か `%` が後に続く文字列は、どの図種でも引用符を残します。
後続の文字は、文字列の後にある空白、タブ、
ディレクティブを除いた最初の文字で判定します。
mermaid.js はテキストを読む前にディレクティブを取り除くためです。
引用符のないテキストは行末まで続くことがあり、
`a - satisfies -> "b" #c` の `b #c` のように、
その文字と後続の部分を取り込みます。
そのため、その直後にテキストが終わる `quadrant-1 "A"%%{init: {}}%%` は、
`quadrant-1 A%%{init: {}}%%` と印字し、
`quadrant-1 "A" %% c` は引用符を残します。
テキストが大文字小文字を問わず `style` か `classDef` で終わり、
後ろに `:` が続く文字列も同じです。
mermaid.js の行の規則がそのような行を読むためです。
（[`;` を含む行](#-を含む行)）。
文字列の後に続く `;` は、そのような文字ではありません。
印字は文を区切る `;` を除き、引用符も、`;` がない場合と同じように除きます。
`quadrant-1 "A";` は `quadrant-1 A` と印字します。
行の規則が残す `;` がある行など、印字が書かれたまま残す行の文字列は、
引用符を残します。 [fixture: requirement/comments/after-string-name]
[fixture: requirement/comments/after-keyword-and-string-values]
[fixture: requirement/multi-line-statements/class-last-line-semicolon-kept]
[fixture: quadrant/quotes/texts-that-need-quotes]
[fixture: quadrant/quotes/texts-before-a-directive]
[fixture: quadrant/quotes/texts-before-a-semicolon]

各図種で数える適合性コーパスの入力は、mermaid.js が受理し、
宣言された相違によって仕様と異なる読みにならず、
`src/printers/quote-form.ts` の表 `quoteRules` を空にすると、
整形後のテキストが変わるものです。
mermaid.js 12.3.0 は、これらの入力を両方の形で読み、Db は同じでした。
入力は sankey 図が 11 個、ER 図が 15 個、requirement 図が 12 個、
Wardley マップが 35 個、gitGraph が 2 個、象限チャートが 19 個のうち 13 個、
XY チャートが 191 個、Venn 図が 176 個のうち 174 個、
use case 図が 93 個のうち 90 個、architecture 図が 2 個、mindmap が 7 個、
kanban のボードが 114 個、C4 図が 67 個のうち 65 個、flowchart が 11 個、
agentflow 図が 26 個のうち 24 個、class 図が 7 個です。
象限チャートの残りの 6 個はテキスト内にタブがあり、印字はこのタブも変えます。
Venn の残りの 2 個はラベルの空白やタブの連なりで異なり、
印字はこの連なりも変えます。
use case の残りの 3 個はスタイルの空白で異なります。
（[同じに描かれるスタイル](#同じに描かれるスタイル)）。
C4 の残りの 2 個はテキスト中の空白やタブの連なりで異なり、
印字はこの連なりも変えます。
agentflow の残りの 2 個はスタイルの空白で異なります。
（[同じに描かれるスタイル](#同じに描かれるスタイル)）。
平易な欄をすべて引用符で囲む形でも書き直した sankey の 6 つの例も、
両方の形で読み、Db と SVG は同じでした。
sankey の 11 個、ER の 15 個、requirement の 12 個のうち 9 個、
Wardley の 35 個、gitGraph の 2 個、象限チャートの 19 個、
XY チャートの 191 個のうち 73 個、Venn の 176 個のうち 166 個の入力も、
整形後のテキストと同じ SVG が描かれました。
requirement の残りの 3 個は、mermaid.js がどちらの形でも描きません。
XY チャートの残りの 118 個はプロットがなく、
mermaid.js はどちらの形でもプロットのないチャートを描きません。
Venn の残りの 10 個は、どちらの形でも描かれません。
use case の 93 個の入力も、1 つのスタイルの空白を除くと、
整形後のテキストと同じ SVG が描かれました。
architecture の 2 個の入力のうち 1 個、mindmap の 7 個、kanban の 114 個も、
整形後のテキストと同じ SVG が描かれました。
architecture の残りの 1 個は、どちらの形でも描かれません。
C4 の 67 個の入力、flowchart の 11 個の入力も、
整形後のテキストと同じ SVG が描かれました。
agentflow の 26 個の入力も、スタイルの空白を除くと、
整形後のテキストと同じ SVG が描かれました。
class の 7 個の入力も、整形後のテキストと同じ SVG が描かれました。

### mermaid.js の版

固定している mermaid.js の CHANGELOG.md には、
この節に挙げるキーワードの大文字小文字、文字列の引用符、
数の桁についての記述がないので、
これらを版のために書かれたまま残すことはありません。
ほかの種類については、mermaid.js の履歴から読んだ CHANGELOG.md と、
リリースタグの文法が、各版がどの形を読むかを示します。

- gitGraph のヘッダーの後のコロン: 8.14.0 の文法は、規則が `gitGraph:` だけで、
  9.0.0 の文法は、コロンがあるヘッダーとないヘッダーを読みます。
  コロンなしで印字したテキストは 8.14.0 で読めないので、
  コロンは書かれたまま残します。
- sankey 図の欄の引用符: 10.3.0、10.9.0、11.0.0、12.3.0 の文法は、
  引用符のない欄と引用符で囲む欄の規則も、記録のアクションも同じです。
  このアクションは、source と target の両端の空白を除き、
  `""` を `"` として読み、値は欄の両端の空白を除いて `parseFloat` で読みます。
- ER 図の名前と役割: 8.14.0 の文法には、引用符で囲む名前がありません。
  9.4.3、10.9.0、11.0.0、12.3.0 の文法は、
  引用符で囲む名前と役割をそれぞれの規則で読み、
  引用符を除く（`$1.replace(/"/g, '')`）ので、引用符で囲む名前と、
  同じ名前を引用符なしで書いたものは、同じテキストになります。
  これらの文法が独立した単位として読む語（`erDiagram`、`one`、`many`、
  `only one`、`to`、`optionally to` と、字句解析器のほかの語）は、
  印字が引用符で囲んだまま残す語に含まれます。
- requirement 図の名前と値: 9.1.0、10.9.0、12.3.0 の文法は、requirement の名前、
  id、text、element の名前、type、reference に、
  引用符で囲む文字列と引用符のない文字列の同じ生成規則 `unqString | qString`
  を使い、字句解析器のキーワードを大文字小文字を問わず語全体として読みます。
  そのため、それらのいずれでもない語は、これらのすべての版で名前として読めます。
- Wardley マップの名前: この図種が初めて加わった 11.14.0 の文法は、
  引用符のない名前を終端記号 `NAME_WITH_SPACES` で読みます。
  ASCII の英字、数字、`_`、`(`、`)`、`&` からなり、
  英字で始まる語を空白で区切った形です。
  11.15.0（名前に `-` を加えた版）、12.0.0、12.3.0 の文法も同じ語を読みます。
  引用符で囲む名前は、引用符のない名前と同じテキストです。
- gitGraph のブランチ: 9.4.3、10.9.0、11.0.0 の文法は、参照 `ref` を、
  引用符のない名前 `\w([-\./\w]*[-\w])?` か文字列として読み、
  これらの文法の字句解析器は、キーワードを大文字小文字を問わず比較します。
  12.3.0 の文法は、書かれたとおりに比較し、
  キーワードより長い名前を名前として読みます。
- 象限チャートのテキスト: 10.9.0、11.0.0、12.3.0 の文法は、
  引用符のないテキスト（`ALPHA` とその後のトークン）と文字列を、
  同じ `text` 規則で読みます。
  これらの文法の字句解析器は、`x-axis`、`quadrant-1` から `quadrant-4`、
  `quadrantChart` を、その後の境界を求めずに読みます。
- XY チャートのタイトルと分類: 10.6.0、10.9.0、11.0.0、12.0.0、12.3.0 の文法は、
  タイトル、軸やプロットのタイトル、分類を、同じ `text` 規則で読みます。
  この規則は文字列をそのテキストとして読み、引用符のないテキストは、
  トークンの間の空白なしでつないだものとして読みます。
  これらの字句解析器は、`title`、`x-axis`、`y-axis`、`line`、`bar` を、
  後ろに英字、数字、`_` がない場合に、大文字小文字を問わず読み、
  `vertical` と `horizontal` は、どこで始まる場合も読みます。
- architecture 図のラベル: 11.1.0 から 11.12.3 の文法は、
  角括弧内の ASCII の英字、数字、`_`、空白からなるラベルを読み、
  引用符で囲むラベルは読みません。
  11.13.0 から 11.16.1 の文法は、そのようなラベルか引用符で囲むラベルを読み、
  11.17.0 から 12.3.0 の文法は、引用符で囲むラベルか、`[`、`]`、
  改行を含まない任意のテキストを読みます。
  そのため、引用符で囲んだラベルは、
  引用符を読むどの版も読むこれらの文字からなる場合にだけ、
  引用符なしで印字します。
- mindmap の形のテキスト: この規則が初めて加わった v9.4.0、v10.1.0 と、
  v10.3.0 から 12.3.0 の文法は、形の中の文字列と、`)`、`]`、`(`、
  `}` を含まないテキストを、同じ `NODE_DESCR` として読み、
  文字列の規則をテキストの規則よりも前に置きます。
  kanban のボードの形のテキストは、この図種が初めて加わった 11.4.0 の文法が、
  12.3.0 までのすべての後続のリリースの文法と同じです。
- treeView 図の名前: この図種が初めて加わった 11.14.0 と 11.15.0 の文法は、
  ノードの名前を引用符で囲む文字列だけとして読み（`name=STRING2`）、
  11.16.0 の文法で引用符のない名前（`BARE_NAME`）が加わりました。
  引用符で囲む名前は、上のテキストのとおり、書かれたまま残します。
- C4 図の引数: 引数の文脈の字句解析器の規則（`<attribute>[ ]*["]`、
  `<string>[^"]*` と、どちらも `STR` を返す `<attribute>[^,]+`）と、
  アクション `attribute: STR { $$ = $1.trim(); }` は、
  C4 の文法がある最初のタグ 9.1.2（名前付き属性 `$key="value"` が、
  9.1.3 で加わる前）、9.1.3、9.2.0、10.3.0、10.5.0、11.0.0、11.13.0、
  12.3.0 の文法で同じです。
  9.1.x の文法は、規則を console に記録するだけです。
  そのため、この図種があるどの版でも、文字列と引用符のない引数は、
  同じ引数になります。
- flowchart の subgraph と agentflow 図の flow の名前: 9.0.0 から 10.0.2
  の文法は、subgraph の名前を `text` 規則で読みます。
  この規則は文字列をそのまま取り、型を持ちません（`$$ = $1`）。
  10.1.0 から 10.3.0 の文法も `text` 規則で読み、
  語と同じく文字列も型が `text` になります。
  10.3.1 から 12.3.0 の文法は `textNoTags` 規則で読み、
  この規則では文字列は型が `text` になります。
  型 `string` は、10.3.1 から `text` 規則にあります。
  この規則は角括弧の中のタイトルと形のラベルを読み、名前は読みません。
  そのため、どの版でも、
  subgraph の名前は両方の形で同じテキストと同じ型になります。
  agentflow 図の文法は、12.0.0、12.1.0、12.2.0、12.3.0 で同じファイルです。
- class 図の class の名前: 9.0.0 から 12.3.0 の文法は、
  バッククォートで囲んだ名前（`classLiteralName`: `BQUOTE_STR`）と、
  英字と数字の名前（`alphaNumToken`: `ALPHA`、`NUM`）を、
  `className` として読みます。
  字句解析器の語は、jison の字句解析器が語全体として読む文字列です。
  そのため、英字、数字、`_` からなる名前は、どの版でも両方の形で同じ名前です。
- use case 図の名前、ラベル、metadata: この図種が初めて加わった 12.0.0 と、
  12.1.0、12.2.0、12.3.0 の字句解析器、パーサー、visitor、model builder は、
  同じファイルです。
  visitor は、引用符で囲まれた名前の id を、ASCII の英字、数字、
  `_` 以外の文字を、`_` に置き換えて作り、引用符のない名前の id は、
  名前自体から作ります。
- Venn 図の名前、ラベル、値: この図種が初めて加わった 11.13.0、12.0.0、
  12.3.0 の文法は同じで、各版の `vennDB.ts` も同じです。
  引用符で囲む名前と、同じ名前を引用符なしで書いたものは、
  同じテキストになります。
  `normalizeText` が文字列の引用符を外し、
  すべてのテキストの両端の空白を除くためです。
  角括弧のラベルは、引用符の有無によらず両端の空白を除き、
  字句解析器は `venn-beta`、`set`、`union`、`text`、`style` を、
  大文字小文字を問わず読みます。
- 1 行のブロックのアクセシビリティの説明: flowchart の 9.0.0 と 9.0.1 の文法に、
  `accDescr` の規則はありません。
  最初に規則がある 9.1.0 の文法には、コロンの形とブロックの形があります。
  9.1.0、9.4.3、10.9.0、11.0.0、12.0.0、12.3.0 の文法では、
  ブロックの規則があるすべてのファイルに、コロンの規則もあります。
  9.1.0、10.9.0、12.3.0 の各ファイルで、
  コロンの規則は行の残り `(?!\n|;|#)*[^\n]*` を読みます。
  11.0.0 以降の Langium パーサーを使う図種の文法は、
  共通文法の 1 つの終端記号で両方の形を読みます。
  そのため、コロンで印字したテキストは、ブロックを読むすべての版で読めます。
- gitGraph の `switch`: 10.9.0 の文法は `checkout` があり、`switch` はなく、
  11.0.0 の文法は両方があります。
  `checkout` で印字したテキストは、`switch` を読むすべての版で読めます。
- ER の関係の記号: 8.8.0、8.14.0、9.0.0 の文法は記号があり、語はなく、
  9.4.3 の文法は語もあります。
  記号で印字したテキストは、語を読むすべての版で読めます。
- C4 の `Rel_Up` など: C4 の文法がある最初のタグは 9.1.2 で、
  9.1.0 と 9.1.1 にはありません。
  その文法には `Rel_Up` と `Rel_U` の両方があります。
- EBNF の `::=`: CHANGELOG.md は 11.16.0 に railroad 図を追加し、
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L601)）、
  11.16.0 の文法には `=` と `::=` の両方があります。
- packet 図の範囲: packet 図がある最初の版 11.0.0 の文法は、
  規則 `start=INT('-' end=INT)?` で位置と範囲を読みます。
- cynefin 図と radar 図のヘッダーの後のコロン: CHANGELOG.md は、
  11.6.0 に radar チャートを追加し、
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1168)）、
  11.16.0 に cynefin 図を追加し、
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L585)）、
  それぞれの最初のリリースの文法は、
  コロンがあるヘッダーとないヘッダーを読みます。
- flowchart のヘッダーの向き: 11.10.0 の CHANGELOG.md は、
  `TD` の挙動を `TB` と同じに更新したと記します。
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1061)）。
  11.9.0 は `TD` の向きを Db に残し、
  3 つの subgraph をまたぐノードを結ぶ文書の flowchart の例（`flowchart TB`、
  `c1-->a2`）を、同じテキストの `TD` 版と異なって描きます。
  12.3.0 は両者を同じに描きます。
  11.9.0 は subgraph の `direction TD` も拒否し、11.13.0 は読みます。
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L860)）。
  8.14.0、9.4.3、10.9.0 の flowchart の文法は、
  `TB` と `TD` の両方をヘッダーの向きとして読みます。
  そのため、`TB` は書かれたまま残します。
- agentflow 図と swimlane 図のリンクのラベルとヘッダーの向き: CHANGELOG.md は
  11.16.0 に swimlane 図を追加します。
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L605)）。
  swimlane は、両方のラベルの形がある flowchart の文法を読みます。
  12.0.0 に追加された agentflow 図の文法は、
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L250)）、
  12.0.0 と 12.3.0 で同じファイルで、両方の形があります。
  両図種とも 11.10.0 より後なので、それらを読むすべての版で `TD` は `TB` です。
- sankey 図のリンクの値: sankey の文法がある最初のタグは 10.3.0 で、
  10.2.4 にはありません。
  10.3.0、10.3.1、10.4.0、10.5.0、10.6.0、10.7.0、10.8.0、10.9.0、11.0.0、
  11.4.0、11.8.0、11.10.0、11.14.0、12.0.0、12.3.0 の文法は、
  `parseFloat($value.trim())` で値を数にするので、`1.0`、`+1`、
  `.5` を読むすべての版で、`1` と `0.5` が読めます。
  CHANGELOG.md には、値の読み方についての記述はありません。
- キーワードの大文字小文字: sequence、Gantt、user journey、ER、requirement、
  state の図の字句解析器は、8.14.0、9.4.3、10.9.0、12.3.0 の文法で、
  大文字小文字を区別しません。
  ほかの図種の文法がある、調べた中で最も古いタグも、大文字小文字を区別しません。
  timeline と mindmap の図は 9.4.0、象限チャートは 10.2.0、
  XY チャートは 10.6.0、Venn 図は 11.13.0、
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L836)）、
  usecase 図は 12.0.0 です。
  （[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L248)）。
  8.14.0 より前の版は読んでいません。

### ヘッダーの名前

ヘッダーの名前は書かれたまま残します。
`block-beta` と `block`、`graph` と `flowchart`、`packet-beta` と `packet`、
`sankey-beta` と `sankey`、`xychart-beta` と `xychart`、
`treemap` と `treemap-beta`、`ishikawa` と `ishikawa-beta` です。
mermaid.js 12.3.0 は、どの対も両方の名前を受理します。
（[block](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/block/blockDetector.ts#L6)、
[sankey](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/sankey/sankeyDetector.ts#L6)、
[xychart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/xychart/xychartDetector.ts#L10)、
[packet](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/packet/detector.ts#L10)、
[treemap](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/treemap/detector.ts#L10)、
[ishikawa](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/ishikawa/ishikawaDetector.ts#L10)、
[flowchart](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDetector-v2.ts#L9-L11)）。
どの対も両方の名前で同じに描き、描画の `aria-roledescription` と、
アクセシビリティツリーは同じで、もう一方の名前で書いた例 175 対は、
Db も描画も同じでした。
例は `block` を 30 回、`block-beta` は使わず、`flowchart` を 116 回、
`graph` は使わず、`packet` を 4 回、もう一方は使わず、`sankey` を 8 回、
もう一方は使わず、`xychart` を 7 回、もう一方を 1 回、`treemap-beta` を 8 回、
もう一方は使わず、`ishikawa-beta` を 1 回、もう一方は使いません。

しかし、ほかの版は名前の受理が異なります。
mermaid.js 11.9.0 は、`-beta` のない `block`、`sankey`、`xychart` から、
図の種類を検出しません。
CHANGELOG.md は、11.10.0 でこの 3 図種の接尾辞を除いています。
（[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1020)）。
packet 図は 11.9.0 で beta を外れています。
（[その記述](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/CHANGELOG.md#L1087)）。
11.1.0 と 11.3.0 の文法は `packet-beta` だけを読みます。
そのため、接尾辞なしで印字したテキストは、
接尾辞を外したリリースより前の版では描かれません。
mermaid.js 11.9.0 は、`graph` と `flowchart`、`treemap-beta` と `treemap` を、
どちらも読みます。
CHANGELOG.md は、flowchart、treemap、
ishikawa の図の名前の変更を記録していません。
テキストを描く版を知っているのは作者で、フォーマッターは知らないので、
どの名前も書き換えません。
別の大文字小文字のヘッダー（`ISHIKAWA`、`sankey-BETA`、`XYCHART-BETA`）も、
書かれたまま残します。 [fixture: block/header/block-beta-kept]
[fixture: flowchart/direction/header-keyword-kept]
[fixture: flowchart/direction/header-td-kept]
[fixture: ishikawa/header/header-valid] [fixture: ishikawa/header/header-stable]
[fixture: packet/header/header-beta]
[fixture: packet/hidden-yaml/yaml-beta-header]
[fixture: sankey/header/sankey-beta] [fixture: sankey/header/upper-case-beta]
[fixture: treemap/header/common]
[fixture: xychart/header-and-orientation/beta-header-kept]
[fixture: xychart/keyword-case/header-spelling-kept]
[fixture: xychart/header-and-orientation/second-header-spelling-and-case-kept]

`stateDiagram` と `stateDiagram-v2` も、同じ理由で書かれたまま残します。
mermaid.js 12.3.0 の検出器は、どちらも統合された状態遷移図で描きます。
（[そのコメント](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/state/stateDetector-V2.ts#L9)）。
例の 22 対の Db は同じで、そのうち 21 対の描画は、画素ごとに同じでした。
22 番目の choice の例（`state if_state <<choice>>`）は、
ランダムに描くひし形の線だけが異なり、
同じテキストを 2 回描いても同様に異なります。
例は `-v2` を 17 回、もう一方を 5 回使います。
[fixture: state/header/spellings-kept]

### ほかに書かれたまま残すもの

flowchart の長いリンク（`-->` に対する `--->`）は、書かれたまま残します。
mermaid.js の文書は、追加のダッシュが、
より多くの階層をまたぐリンクを求めると説明しています。
（[Minimum length of a link](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/flowchart.md#L933-L955)）。
コードも長さをレイアウトに渡します。
[`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1378)
は、辺の `minlen` として長さを与えます。
dagre のレイアウトは
[`index.js`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.js#L759)、
elk のレイアウトは
[`render.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/layout-algorithms/elk/render.ts#L2754)
で、その長さを引き継ぎます。
描いた例は同じ図でしたが、長さは作者が求めたものです。
[fixture: flowchart/arrow-spacing/arrow-length-kept]

## ラベルの先頭の空白

mermaid.js は引用符のないラベルの先頭の空白を取り除き、整形も取り除きます。
ただし、取り除くとラベルの読み方が変わる場合は、空白 1 つとして残します。
ラベルが `/`、`\`、`-`、`"` のどれかで始まる場合と、
`>` の形のラベルの最初の語が `@` を含む場合です。
そのときは、ラベルの末尾にも空白 1 つを置きます。
[fixture: flowchart/label-inner-whitespace/trimmed]
[fixture: flowchart/label-inner-whitespace/leading-whitespace-kept]
[fixture: flowchart/label-inner-whitespace/compat-leading-backslash-kept]
たとえば、`A[ /x/]` はラベル `/x/` の rectangle ですが、
`A[/x/]` はラベル `x` の lean-right の形です。
[ラベルの内側の空白](./flowchart.ja.md#ラベルの内側の空白)を参照してください。
`A[x@]` が拒否される agentflow では、どの形でも、
最初の語が `@` を含む場合は空白を残します。

## トークンの間のディレクティブ

mermaid.js はディレクティブを取り除き、その両側のテキストをつないで読むので、
残る空白は、両側の空白を合わせたものです。
`note for` のような単位や `title` の後のテキストは、
空白をちょうど 1 文字読みます。
ディレクティブの両側に空白 1 つずつを置くと、空白が 2 つ残ります。
そのため同じ印字行の中では、隙間をディレクティブがないものとして、
隙間の通常の規則どおりに印字し、ディレクティブをその規則の空白の後ろに置いて、
後ろの単位に接します。
規則が空白を置かない隙間では、ディレクティブは両側の単位に接します。
たとえば、`note%%{init: {}}%% for A "t"` は `note %%{init: {}}%%for A "t"` に、
`A  %%{init: {}}%%  --> B` は `A %%{init: {}}%%--> B` と印字します。
[fixture: flowchart/directives/whitespace-on-each-side]
[fixture: flowchart/directives/touching-token]
[fixture: flowchart/directives/whitespace-on-both-sides]
[fixture: class/directives/count-sensitive-unit]
[fixture: sequence/directives/compat-whitespace-on-one-side-of-directive]
[fixture: class/directives/compat-whitespace-on-one-side-of-directive]
[fixture: state/directives/compat-whitespace-on-one-side-of-directive]
mermaid.js の行の規則が隙間の空白を読む可能性のある所と、
ディレクティブが印字行の先頭か末尾にある所では、隙間の空白の有無を保ち、
空白の連続は空白 1 つにします。
[fixture: flowchart/directives/line-edge-whitespace]
[ディレクティブ](./flowchart.ja.md#ディレクティブ)を参照してください。

## コメントやディレクティブの前後の構造の継続行

構造の部分の間にある普通のコメントとディレクティブは必要な改行を残し、
構造の列はそろえます。
続きの行と間の独立した注釈は文より 1 段深く置きます。
LF の前に必要な空白を含め、各隙間の最初の行末を保ち、
値とディレクティブの内部は分割しません。
コメントで結合される領域、セミコロンの保護、図種ごとの値の境界を優先します。

class と state の文、ER の文、requirement のヘッダー・フィールド・文、
sequence の文に適用します。
ただし、注釈がキーワードと本文を隔てる sequence のタイトルは除きます。
requirement と element の本文内の空の説明ブロックも、
独立した注釈と閉じ波括弧の列をそろえます。
[fixture: requirement/empty-description-blocks/in-body-with-comment-line-kept]
[fixture: requirement/empty-description-blocks/in-body-with-directive-line]
state の独立した開き波括弧はキーワードにそろえます。
class の関数名から `(` までの空白は値の一部として保ちます。
[fixture: class/multi-line-statements/comment-inside-kept]
[fixture: class/whitespace-between-tokens/callback-name-comment-line-kept]
[fixture: state/multi-line-statements/declaration-trivia-continuations]
[fixture: state/multi-line-statements/brace-after-comment-line-kept]
[fixture: er/multi-line-statements/style-comment-continuation]
[fixture: requirement/multi-line-statements/header-directive-continuation]
[fixture: requirement/fields/comment-and-directive-continuations]
[fixture: sequence/multi-line-statements/autonumber-comment-continuation]

Gantt の click・暦・リスト・accessibility の構造、
journey と timeline の accessibility 行、quadrant の点と accessibility、
block の構造、XY チャートのヘッダー・軸・plot・accessibility も同じです。
literal の文字は字下げし直しません。
Gantt の設定・task・title・section、journey と timeline の title・section、
timeline の event は値に属する空白を保ちます。
複数行のラベルと引用値も内部の列を保ちます。
[fixture: gantt/multi-line-statements/structural-trivia-continuations]
[fixture: journey/multi-line-statements/accessibility-trivia-continuations]
[fixture: timeline/multi-line-statements/accessibility-trivia-continuations]
[fixture: quadrant/multi-line-statements/point-trivia-with-multiline-label]
[fixture: block/multi-line-statements/structural-trivia-continuations]
[fixture: xychart/multi-line-statements/axis-trivia-with-multiline-string]

C4 の呼び出しも、インライン directive の内容・接触・必要な改行を保ちながら、
周りの空白を整えます。
directive の下に残る境界の開き波括弧は呼び出しにそろえます。
[fixture: c4/directives/directive-inline]
[fixture: c4/boundary-bodies/opener-directive]
[fixture: c4/named-attributes/named-exterior-directive-lines]
[fixture: c4/argument-spacing/directive-semicolon-prefix]

通常のブロック見出しを完成する物理行は文と同じ段にそろえ、本文を1段深くします。
その行をまたぐリテラル値は、固有の列を保ちます。
state、requirement、C4 の boundary の見出しが対象です。
[fixture: state/composite-states/header-completion-after-comment]
[fixture: requirement/bodies/header-completion-after-comment]
[fixture: c4/boundary-bodies/named-header-completion]
[fixture: c4/boundary-bodies/value-spans-header-line-kept]

eventmodeling の data と note は、コメント、directive、見出しが完結する行に、
通常の継続行の字下げを使います。
条件を満たす本文はその開始行からさらに設定の1段深くし、
native hidden の見出しの境界や本文の保持条件を優先します。
閉じ波括弧は引き続き第1列に置きます。
GWT と同じく原文の順序と trivia の形を保ちます。
[fixture: eventmodeling/declarations-and-notes/header-completion-comments]
[fixture: eventmodeling/declarations-and-notes/header-opener-comment]
[fixture: eventmodeling/declarations-and-notes/header-directive-continuation]
[fixture: eventmodeling/declarations-and-notes/header-continuation-unsafe-body]

GWT には開始波括弧がありません。
継続する source-frame の行と、その間のコメントや directive は、
通常の継続として `gwt` より 1 段深く置き、書かれた順序と trivia の形を保ちます。
clause keyword は 1 段、item は 2 段の字下げを保ちます。
[fixture: eventmodeling/gwt-clauses-and-items/header-completion-comment]
[fixture: eventmodeling/gwt-clauses-and-items/header-directive-continuation]

通常の ER と requirement のスタイル単位は `property: value` とし、
スタイル同士はカンマと空白1個で区切ります。
プロパティと値の内容は、書かれたまま保ちますが、値の単語間の空白の連なりは、
空白 1 つで印字します。
（[同じに描かれるスタイル](#同じに描かれるスタイル)を参照）。
単なる改行を結合する見出しでも、初回からこの空白にそろえます。
trivia、複数行のスタイル値、semicolon の影響がある行は既存の配置を保ちます。
[fixture: er/styles-and-classes/style-unit-padding]
[fixture: er/styles-and-classes/over-lines-joined]
[fixture: requirement/styles-and-classes/style-unit-padding]

## `;` を含む行

mermaid.js は、`style`、続いて空白をはさまずに `#` が後に続く `:`、
さらに `;` を含む行で、
最後の `;` を無視します（仕様の
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)）。
この規則は行のテキストを読むので、文を区切る `;` を取り除いたり、
文を別の行に移したりすると、別の `;` が無視され、
ラベルやエンティティが変わることがあります。
`A[style:#x;];` のラベルは `style:` とエンティティ `#x;`、
`A[style:#x;]` のラベルは `style:#x` です。
[corpus fixture: common/entity-style-separator-ignored]
[corpus fixture: common/entity-style-label-semicolon-ignored]
どちらも受理されるので、変化は図にしか現れません。
そのため、文を区切る `;` と文の終わりの `;` 以外の `;` を含む行は、
規則が当てはまるかどうかにかかわらず、文を行に残し、`;` をその位置に残します。
規則はほかのトークンの間の空白を読まないので、そこは通常どおり整形します。
[fixture: flowchart/statements-one-per-line/line-with-semicolon-kept] [fixture:
flowchart/statements-one-per-line/compat-semicolon-in-label-without-style-kept]
[fixture: sequence/comments/semicolon-after-comment-kept]
[fixture: class/labels/semicolon-line-kept]
[fixture: state/descriptions-and-labels/semicolon-line-kept]
[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照してください。

class、state、ER、requirement、block、Venn、usecase の図では、
`classDef` と `style` の行末のセミコロンを、Db が変わらない形で削除します。
無視される終端は直前の空白と一緒に削除し、
その前にある閉じたディレクティブは残します。
[fixture: class/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture: state/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture: er/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture: requirement/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture: block/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture: venn/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
[fixture: usecase/semicolons-at-the-end-of-a-style-statement/directive-before-terminator]
文に `#` がない ER では、最後のスタイルとの間に trivia がない場合に、
終端の `;` の単位も削除します。
treemap の `classDef` 文は、style があり同じ条件のとき、
`#` の有無にかかわらず終端の `;` の単位を削除します。
`fill: #f00;` のように style の中にある `;` は、
`#f00;` が entity なので残します。
[fixture: treemap/semicolons/class-terminator-dropped]
[fixture: treemap/semicolons/class-terminator-directive-kept]
[fixture: treemap/semicolons/class-terminator-entity-kept]
state のスタイル文と block の `classDef` 文では、最後のスタイルの末尾の `;` が、
そのスタイルで唯一のセミコロンで、前に空白以外のテキストがある場合に削除します。
ほかのスタイルのセミコロンは、削除で Db が変わる形で残します。
[fixture: er/semicolons-at-the-end-of-a-style-statement/unit-terminators]
[fixture: er/semicolons-at-the-end-of-a-style-statement/directive-before-unit-kept]
[fixture: state/semicolons-at-the-end-of-a-style-statement/style-text-terminators]
[fixture: state/semicolons-at-the-end-of-a-style-statement/style-text-kept]
[fixture: block/semicolons-at-the-end-of-a-style-statement/classdef-text-terminators]
[fixture: block/semicolons-at-the-end-of-a-style-statement/style-text-kept]
[fixture: requirement/semicolons-at-the-end-of-a-style-statement/style-text-kept]

## `;` が終わらせる行

`;` は、行がどこで終わるか、
そして行の規則が無視する `;`（[`;` を含む行](#-を含む行)を参照）のときは、
どの `;` が無視されるかを決めています。
規則は `;` を、mermaid.js が読む前に本文から取り除き、
閉じていないディレクティブの走査は、引数の後の空白を、行送りも含めて取り、
`;` がそれを止めます。
行の上の `;` を落とすと、その 2 つのどちらかが変わるときは、すべての図種で、
行を、行の上にある文ごと、書かれたまま印字します。
次のものがある行です。

- 空白だけを挟んで、閉じていないディレクティブの後にある `;`。
  そのようなディレクティブの走査は、引数の後の空白を、行送りも含めて取り、
  `;` がそれを止めます。
  `%%{wrap foo;` と次の行 `participant D` は、
  `;` でディレクティブが終わりますが、`;` がないと、行送りと次の行まで、
  ディレクティブが取ります。 [fixture:
  sequence/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [fixture:
  flowchart/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [fixture:
  state/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [corpus fixture: sequence/ignored-semicolon-after-directive-06349fee]
  [corpus fixture: common/directive-word-argument-unclosed-next-line]
  `%%{init: {}`、U+2029、`;` も同じです（引数は U+2029 の手前で止まり、
  ディレクティブは U+2029 を空白として取ります）。
  [corpus fixture: flowchart/ignored-semicolon-after-directive-530d2c05]
- 空白とディレクティブだけを挟んで、別の `;` に接している、
  行の規則が無視する `;`。
  ディレクティブが先に取り除かれるので、規則にとって 2 つは隣り合い、
  規則が無視するのは行の最後の `;` だけです。
  最後の `;` を落とすと、その前の `;` が無視されるものになり、
  ディレクティブの後に `;;` があるメッセージのテキスト `style:#x` が、
  `style:` に変わります。 [fixture:
  sequence/statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
  [fixture:
  flowchart/statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
  [fixture:
  state/statements-one-per-line/compat-ignored-semicolon-next-to-semicolon-kept]
- 行の規則が無視する `;` と、その後の U+2028 か U+2029。
  行の規則は、その文字の手前までを行として読むので、文字はそのまま残します。
  空白にすると、行が別の所で終わります。
  flowchart の `Z[style:#x];`、U+2029、`;` は、`Z[style:#x]; ;` になり、
  最後の `;` が別の `;` になります。
  [corpus fixture: flowchart/ignored-semicolon-after-directive-5072803f]

閉じたディレクティブの後の、ほかの `;` がない `;` は、
落としても何も変わらないので、落とします。
`A-->B %%{init: {}}%% ;` は `A --> B %%{init: {}}%%` と印字します。
[fixture: flowchart/semicolons/closed-directive-formatted] [fixture:
sequence/statements-one-per-line/compat-closed-directive-semicolon-dropped]

上のスタイルの終端にも同じ保護が適用されます。
セミコロンの削除で、閉じていないディレクティブの停止位置を変えたり、
行の規則が別のセミコロンを取り除く形に変えたりしません。
[fixture: class/semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
[fixture: state/semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]

sequence 図で、
空白を読まない単位（participant のデータブロックか `autonumber`）で終わる文は、
その後のディレクティブに続く `;` を残し、行に U+2028 か U+2029 があるときは、
行を書かれたまま印字します。
その文字は、単位を終える `}` の後の空白ではありません。
[fixture: sequence/statements-one-per-line/data-block-directive-kept]
[fixture: sequence/statements-one-per-line/autonumber-directive-kept]
`participant Z@{ ... }%%{init: {}}%%`、U+2029、`;` は受理され、
U+2029 を空白にすると拒否されます。
[corpus fixture: sequence/ignored-semicolon-after-directive-5689c99a]
行の規則が無視する `;` と、その後の U+2028 か U+2029 も同じで、
文を終える `;` は後の行にあってもかまいません。
行は、そうした `;` の最後まで、書かれたまま印字します。
`participant Z@{ "style": "x:#y" };`、U+2028、改行、`;` は受理され、
2 つ目の `;` がないと、行末の空白が改行を隠すので、拒否されます。
[corpus fixture: sequence/ignored-semicolon-then-separator-line-1902f8c5]

[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照してください。

## 閉じていないディレクティブがつなぐ行

閉じていないディレクティブの引数の後の空白は、行送りも含めて、
ディレクティブと一緒に取られます（仕様の
[ディレクティブの位置](../../spec/docs/common.ja.md#ディレクティブの位置) ）。
そのため、次の行は、コメント行の後と同じく、
ディレクティブの行の続きになります（詳しくは、
[U+2028 か U+2029 の後のコメント行](#u2028-か-u2029-の後のコメント行) を参照）。
その行は、その上にあるものごと、書かれたまま印字します。
そのために `;` は要りません。
[fixture: flowchart/directives/compat-unclosed-directive-joins-next-line]
[fixture: sequence/statements-one-per-line/compat-unclosed-directive-joins-line]
[fixture:
state/statements-one-per-line/compat-unclosed-directive-joins-next-line]
[fixture: class/directives/compat-unclosed-directive-joins-next-line]
[corpus fixture: common/directive-word-argument-unclosed-next-line]
`participant A@{ "style": "x:#y" };participant C%%{init: {}`、行送り、U+2029、
`;participant D` は、行の規則にとって 1 行で、`participant C` を別の行に移すと、
その `;` は無視されなくなります。
[corpus fixture: sequence/ignored-semicolon-after-directive-435fa018]
class 図と state 図では、その行送りの後の文は、その段の字下げをせず、
書かれたまま残します。
`state S {%%{wrap foo`、空行、`A` は、空行と `A` がその位置に残ります。
[fixture: state/composite-states/compat-unclosed-directive-joins-body-line]
[fixture: class/member-bodies/compat-unclosed-directive-joins-body-line]

`init` のような自由なテキストの引数を持ち、`}%%` で閉じないディレクティブは、
テキストの終わりまで続きます（仕様の
[ディレクティブの位置](../../spec/docs/common.ja.md#ディレクティブの位置)）。
そのため、その後のすべてが、ディレクティブの一部として書かれたまま残ります。
`A --> B %%{init: {};` はディレクティブまでを整形し、その後の行はそのままです。
`%%{wrap foo;` のように語を引数とするディレクティブは、その語で終わり、
その後の行は整形します。
[fixture: flowchart/directives/unclosed-free-text-takes-the-rest]
[fixture: flowchart/directives/unclosed-word-argument-stops-after-word]

U+2028 か U+2029 を含む空白は、ディレクティブがどこにあっても、
ディレクティブと一緒に、書かれたまま印字します。
引数の自由なテキストは、その文字の手前で止まります。
その文字は、自由なテキストにとって空白ではなく、ディレクティブは、
その後の空白を取ります。
文字を空白にすると、引数がその先に届き、続く文を、
次の `}%%` かテキストの終わりまで取ってしまいます。
`class A%%{init: {}`、空白、U+2028、`class D`、`class B` は、
クラス `AclassD` と `B` を宣言し、U+2028 を空白にすると、`A` だけになります。
[corpus fixture: class/unclosed-directive-separator-whitespace-5cfdfca6]

## 方向のテキストを含む行

mermaid.js は、行の中で単位が始まる最初の位置で、
空白より先に方向の行を試します（仕様の
[文の文脈](../../spec/docs/diagrams/flowchart.ja.md#文の文脈)）。
そのため、`direction`、空白、方向の値をどこかに含む行は、
字下げされていると方向の文になりますが、
同じ行が 1 桁目から始まると別の読み方になることがあります。
`accTitle: t;direction TB` はアクセシビリティのタイトルです。
[fixture: flowchart/indentation/compat-direction-text-indented]
[corpus fixture: flowchart/lex-direction-line-acc-title-column-zero]
[corpus fixture: flowchart/lex-direction-line-acc-title-indented]
方向の文ではないそうした行は、字下げも含めて書かれたまま残します。
[fixture: flowchart/indentation/direction-text-kept]
[fixture: flowchart/indentation/direction-text-with-directive-kept]
mermaid.js は字句解析器がテキストを読む前にディレクティブを除くので、
ディレクティブが分割する
`direction`（`accDescr: direc%%{init: {}}%%tion RL`）も、方向のテキストです。
flowchart と swimlane の図の、ブロック内かコロンの後の説明、タイトル、`;` の後、
サブグラフ内でも同じです。
[fixture: flowchart/indentation/direction-text-split-by-a-directive-kept]
[fixture: flowchart/indentation/swimlane-direction-text-split-by-a-directive-kept]
[字下げ](./flowchart.ja.md#字下げ)を参照してください。

flowchart本文は共有の意味を持つ字下げの下限を使い、
`tabWidth: 0`でも1段に最低1つの空白を置きます。
字下げを落として、方向文が1桁目のaccessibilityやキーワードの優先順位を、
取り戻さないようにするためです。
[fixture: flowchart/indentation/zero-direction-description-subgraph]
[fixture: flowchart/indentation/zero-direction-title]
[fixture: flowchart/indentation/zero-direction-title-tab]
[fixture: flowchart/indentation/zero-direction-description-block]
[fixture: flowchart/indentation/zero-direction-title-prefix]
[fixture: flowchart/indentation/zero-direction-directive]
[fixture: flowchart/indentation/zero-direction-style-prefix]
同じ下限を、幅0で読みが変わる [mindmap](./mindmap.ja.md#インデント)、
[kanban](./kanban.ja.md#インデント)、[Venn](./venn.ja.md#indentation)、
[Ishikawa](./ishikawa.ja.md#indentation)、
[Agentflow](./agentflow.ja.md#indentation)、[class](./class.ja.md#字下げ)、
[YAML](#フロントマター)でも使います。

## 数か `title` の送り元からの sequence のメッセージ

sequence のメッセージは、矢印の両側に空白を 1 つずつ置きます。
ただし、送り元が、後に空白が続くと別の単位として読まれる id のときは除きます。
1 つは数で、`1->>2: x` の `1 ->>2: x` は拒否されます。
もう 1 つは大文字小文字によらない `title` で、
`title->>B: x` の `title ->> B: x` はタイトルです（仕様の
[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈)）。
そうしたメッセージは、矢印の両側を接したままにします。
[fixture: sequence/arrow-spacing/touching-before-read-otherwise-kept]
[矢印の前後の空白](./sequence.ja.md#矢印の前後の空白)を参照してください。

## 複数行の sequence の文

sequence 図では、改行の前に空白があると、文は次の行に続きます。
そうした文は 1 行にまとめて印字します。
[fixture: sequence/multi-line-statements/joined]
コメントかディレクティブを含むものは改行を残し、構造の続きの行をそろえます。
各隙間の最初の改行の前の空白は、
字句解析が行をつないで読む場合があるため保ちます。
[fixture: sequence/multi-line-statements/comment-inside-kept]
`title` と本文の間にコメント行があるタイトルは、値に属する字下げも含め、
全体を原文のまま残します。
コメント行は mermaid.js がテキストを読む前に取り除かれるので、
その次の行がタイトルになります。 [fixture: sequence/title/comment-line-kept]
[複数行の文](./sequence.ja.md#複数行の文)を参照してください。

## コメントの後の空白だけの行

class 図では、文の後のコメントで終わる行の直後の、空白だけの行は、
空白 1 つの行として印字します。
ほかの空行は、空白なしで印字します。
[fixture: class/comments/whitespace-line-kept]
[fixture: class/comments/whitespace-line-after-header-comment-kept]
[fixture: class/comments/compat-whitespace-line-after-comment-line]
[fixture: class/comments/compat-comment-then-empty-lines]
[corpus fixture: class/lex-comment-then-spaces-line]
[corpus fixture: class/div-comment-then-empty-line]
mermaid.js は、そうしたコメントの後の改行をコメントの一部として読み、
次の行をコメントのある文の一部として読みます。
ただし、間に空白だけの行があるときは、
別です（[後の改行を取り込むコメント](#後の改行を取り込むコメント) を参照）。
`A --> B %% c`、空白 2 つの行、`A : +int age` は関係とメンバーで、
空白がなければ A から `BA` への関係です。
行末の空白を消すエディターは、その空白も消し、
すると mermaid.js は図を違うものとして読みます。
[コメント](./class.ja.md#コメント)を参照してください。

## class のラベルとメンバーの行

class の属性、annotation、メソッドの各値とジェネリック型の内容は原文を保ちます。
可視性の印の後の空白と、
2 つの `~` の間の空白は Db に含まれる場合があるためです。
通常のメソッドでは丸括弧の周囲の余白を取り除き、
空でない戻り型の前を空白1個にします。
trivia、無視されたテキスト、行区切り、
semicolon の保護があるメソッドは原文を保ちます。
[fixture: class/member-lines/method-padding]
[fixture: class/member-lines/method-values-and-classifiers-runs-collapsed]
[fixture: class/member-lines/method-trivia-and-semicolon-kept]
[fixture: class/member-lines/runs-collapsed] [fixture: class/generic-types/kept]
空白だけのラベルは、行末の、`:` の後の空白を残します。
`A --> B : ` は空の題を持ち、`A --> B` は題を持ちません。
[fixture: class/labels/blank-kept]
`;` を含む行では、ラベルの `:` の後に空白があるかどうかを書かれたまま残します。
mermaid.js の行単位の規則は、`:` の直後から `#` までのテキストを読むからです。
[fixture: class/labels/semicolon-line-kept]
[ラベル](./class.ja.md#ラベル)と[メンバーの行](./class.ja.md#メンバーの行)
を参照してください。

## 閉じていないバッククォートの名前

閉じていないバッククォートの名前は、末尾の空白と改行を含めて、
テキストの終わりまで続きます。
テキストの終わりまで書かれたまま印字し、後に改行を足しません。
[fixture: class/unclosed-backquoted-names/kept]
[閉じていないバッククォートの名前](./class.ja.md#閉じていないバッククォートの名前)
を参照してください。

## 説明ブロックの字下げ

通常の `accDescr` と開始の `{` の間には、空ブロックでも空白を1個置きます。
本文を変えず、ブロックの境界を読み取りやすくするためです。
内側の接触と trivia はそれぞれの規則を保ちます。
[fixture: info/description-blocks/block-gap-presence]
[fixture: flowchart/accessibility-lines/empty-block-touching-keyword]

通常の閉じた複数行の `accDescr` 本文は文の継続行の字下げを使い、
独立した `}` は文と同じ段に置きます。
Mermaid が説明から LF 後の先頭の空白とタブを除くためです。
それ以外の文字、改行、行末の空白、directive の内容は保ちます。
引用符付きの文字列と不透明なデータブロックは、それぞれの値の保持規則に従います。
[fixture: flowchart/multi-line-values/accdescr-block-kept]

本文が `{` の次の行以降で始まる場合は、本文の列を原文のまま保つときも、
`{` とその改行の間の空白を落とします。
mermaid.js は `{` の後の空白を改行も含めて `{` と一緒に読むため、
本文はその後で始まり、Db は同じです。
`accDescr { ` の後に改行が続くときは、`accDescr {` と印字します。
`{` の後のコメントやディレクティブは残し、その前の隙間は、
[トークンの間のディレクティブ](#トークンの間のディレクティブ)に従います。
ここでは、空白の連続やタブを空白 1 つにします。
行末のディレクティブの後の空白は、`{` の後の空白と同じく落とします。
コメントの後の空白はコメントの一部なので残します。
`{` の行にある本文は、ほかのトークンと同じように空白を整えます。
これは、このブロックを持つすべての図種に適用します。
[fixture: flowchart/multi-line-values/accdescr-block-opener-whitespace-dropped]
[fixture: flowchart/multi-line-values/accdescr-block-opener-tab-dropped]
[fixture: flowchart/multi-line-values/accdescr-block-opener-directive-trailing-dropped]
[fixture: flowchart/multi-line-values/accdescr-block-opener-directive-run-collapsed]
[fixture: flowchart/multi-line-values/accdescr-block-opener-directive-tab-collapsed]
[fixture: usecase/direction-and-accessibility/accdescr-block-opener-directive-trailing-dropped]
[fixture: treeview/description-blocks/opener-directive-trailing-dropped]
[fixture: flowchart/multi-line-values/accdescr-block-opener-comment-trailing-kept]
[fixture: flowchart/multi-line-values/accdescr-block-subgraph-opener-whitespace-dropped]
[fixture: pie/description-blocks/opener-whitespace-dropped]
[fixture: c4/description-blocks/opener-whitespace-dropped]
[fixture: agentflow/accessibility/global-description-opener-whitespace-dropped]

原文がメンバーの決定にも使われる場合は、説明本文の列を保ちます。
flowchart の subgraph、Agentflow の flow/global 本文、
ER の subgraph が対象です。
global 本文の原文を変えると、後続の flow のメンバーが変わる場合があります。
Treeview の罫線モードも、普通の物理行を字下げすると拒否される場合があるため、
本文の列を保ちます。
Eventmodeling の共通 terminal は原文を値とする固有の規則に従います。
[fixture: flowchart/multi-line-values/accdescr-block-subgraph-raw-membership-kept]
[fixture: agentflow/accessibility/global-description-membership-kept]
[corpus fixture: er/db-subgraph-nodes-acc-descr-block-lines]
[corpus fixture: treeview/box-block-tail-decoration-ascii-dash-control]
[fixture: eventmodeling/description-blocks/description-whitespace-literal-retained]

## キーワードの綴りの state の id

state 図では、`scale`、`classDef`、`class`、`style`、`state`、`note`、
`stateDiagram` は、大文字小文字によらず、後に空白が続くときだけキーワードです。
これらのキーワードと同じ名前の id からの遷移は、
`scale-->B` のように矢印の両側を接したまま残し、
その id の後の説明は `:` を接したまま残します。
`scale -->B` と `style :x` は拒否されるからです。
[fixture: state/arrow-spacing/touching-before-keyword-kept]
[fixture: state/arrow-spacing/compat-keyword-ids-transition]
[fixture: state/descriptions-and-labels/compat-keyword-ids-description]
[矢印の前後の空白](./state.ja.md#矢印の前後の空白)を参照してください。

## state のノート、別名、名前

state 図では、1 行のノートの id の後を書かれたまま残します。
mermaid.js はノートの本文を id の直後から読み、最初の 2 文字を除くからです。
[fixture: state/notes/kept]

複数行のブロックノートは、[ノート](./state.ja.md#ノート)の限定規則に従い、
単一の段落の内容がある各行をノートより 1 段深くそろえます。
本文の字下げには、`useTabs` でも ASCII 空白を使います。
tab は、Mermaid が取り除く、内容がある最初の行の余白だけで許可します。
後続行の tab を含む余白は原文を保ちます。
行内の強調、同じ物理行で閉じるコード、行頭ではない正確な `<br/>` も対象です。
前後の空行は正確に保ちます。
記号で始まる文字どおりの継続行は、
原文と出力の両方で必要な空白 4 個以上の余白を保つ場合だけそろえます。
描画を保ちながら、
raw `notes[].text` の許可された行頭の ASCII 空白だけが変わる場合があります。
[fixture: state/notes/payment-prose]
[fixture: state/notes/prose-tab-margin-kept]
[fixture: state/notes/later-tab-margin-kept]
[fixture: state/notes/over-lines-text-ends-kept]
[fixture: state/notes/inline-emphasis-margins]
[fixture: state/notes/inline-code-margins]
[fixture: state/notes/inline-br-margins]
[fixture: state/notes/markdown-ordered-list-kept]
[fixture: state/notes/literal-markers-zero-width]

ブロック構文、空行で分かれた段落、hard break、複数行コード、取り消し線、
一般の HTML などの保護する形では、後続の余白を保ちます。
これらの余白は、描画されるラベルに現れる場合があります。
`<pre>` 内や空行後の字下げを変えると、サイズや配置が変わることがあるためです。
このような本文は、最初の物理行が空でなく、
字下げが ASCII 空白と tab だけならその行だけをそろえます。
Mermaid はこの余白を取り除くため、raw Db は一致します。
先頭行には、後続行の余白や内容行の有無によらず、設定された本文の段を使います。
原文の後続行の字下げを先頭へコピーしません。
後続の余白が先頭行と異なる場合も、後続のバイト列は正確に保ちます。
[fixture: state/notes/backslash-margins-kept]
[fixture: state/notes/protected-tab-margins-kept]
[fixture: state/notes/single-markup-row]

trivia、セミコロン、保護された結合領域がある場合は、
本文全体を原文のまま保ちます。
一般の Markdown は再整形しません。 [fixture: state/notes/html-note-kept]
[fixture: state/notes/html-pre-first-line]
[fixture: state/notes/html-break-first-line]
[fixture: state/notes/first-tab-markup-margin]
[fixture: state/notes/over-lines-empty-lines-kept]
[fixture: state/notes/list-body-margin-kept]
[fixture: state/notes/heading-at-paragraph-boundary-kept]
[fixture: state/notes/prose-trailing-spaces]
[fixture: state/notes/code-spanning-lines-kept]
[fixture: state/notes/strikethrough-spanning-lines-kept]
[fixture: state/notes/marker-at-paragraph-boundary-kept]

別名の定義の 2 つ目の説明は、mermaid.js が読む両端の空白ごと、
書かれたまま残します。 [fixture: state/aliases/second-description-kept]
`state` の後の名前と空の文字列は、`state` の行に残します。
2 つ目の名前を行に単独で置くと、状態を足すからです。
[fixture: state/statements-one-per-line/state-names-kept]
`{` の直前の `%%` と空の説明ブロックは、`{` まで書かれたまま残します。
[fixture: state/composite-states/compat-comment-after-name-before-body]
[fixture: state/composite-states/compat-comment-line-before-body]
[fixture: state/composite-states/percent-before-body-kept]
[fixture: state/composite-states/empty-block-before-body-kept]
[corpus fixture: state/gram-ignored-state-comment-before-brace]
[ノート](./state.ja.md#ノート)、[別名](./state.ja.md#別名)、
[1 行に 1 文](./state.ja.md#1-行に-1-文)、
[複合状態](./state.ja.md#複合状態) を参照してください。

## 行区切り文字を含む state の行

state 図では、U+2028 か U+2029 を含む行は書かれたまま残します。
mermaid.js は擬似状態の印、方向の行、`{` の前の 2 つ目の名前を探すとき、
これらの文字で止まりますが、プラグインはこれらを空白として読むからです。
[corpus fixture: state/lex-pseudostate-mark-after-line-separator]
[行区切り文字](./state.ja.md#行区切り文字)を参照してください。

## 置かれた場所や空白で読みが決まる ER の行

mermaid.js は、一部の ER の行を、置かれた場所や周りの空白で読みを決めます。
そのため、整形は書かれたまま残します。
[アクセシビリティの文](./er.ja.md#アクセシビリティの文)、
[1 行に 1 文](./er.ja.md#1-行に-1-文)、
[関係の空白](./er.ja.md#関係の空白)を参照してください。

- 最初に印字される行に `direction` と方向を含む `accTitle`、`accDescr:`、
  `accDescr {` の文。
  後の行に書かれたテキストは `:` の行に寄せます。
  行は、字句解析器が読む形、つまりディレクティブなしの形で判定します。
  字句解析器は、これらの文の規則より後に方向の行の規則を試すので、
  1 桁目ではタイトルか説明で、
  字下げの後では `direction` の前に `accTitle:`
  というテキストがある方向の行になり、タイトルが失われます。
  文は 1 桁目を保ちます。
  方向は、空行、コメント行、ディレクティブの後の行にあってもよく、
  字句解析器はそれらを読みません。
  [fixture: er/accessibility-statements/first-column-for-direction-text]
  [fixture: er/accessibility-statements/first-column-value-after-directive-line]
  [corpus fixture: er/lex-acc-title-direction]
  [corpus fixture: er/lex-acc-descr-block-direction]
- 実体 `1` の直後に、文字、数字、`_` で始まる別の文、subgraph の `end`、
  関係の単位が続く場合。
  間にディレクティブがあっても同じです。
  `1` の後に空白（改行を含む）とそのような文字が続くと、
  カーディナリティ `only-one` になる（diagrams/er.md、カーディナリティ、
  規則 11）ので、`1a` は行に残し、`1one to one B : x` は接したままにします。
  [fixture: er/statements-one-per-line/number-name-then-name-kept]
  [fixture: er/relationship-spacing/number-name-before-unit-kept]
  [corpus fixture: er/lex-name-number-then-letter]
- `one` で始まるカーディナリティの前の実体 `only`。
  空白がちょうど 1 つの `only one` はカーディナリティ `only one` で、
  空白 2 つやタブなら `only` は実体なので、空白を書かれたまま残します。
  [fixture: er/relationship-spacing/entity-only-before-one-kept]
  [corpus fixture: er/lex-only-one-two-spaces]
- 右のカーディナリティ `u`。
  右の実体の名前の直前でだけ `md-parent` なので、
  後ろに空白を置くと拒否されます。 [fixture: er/relationship-spacing/md-parent]
  [corpus fixture: er/lex-md-parent-right-glued-name]
- `classDef` や `style` の文の末尾の空白。
  その後の改行を取り込み、次の行がスタイルの続きになります。
  [fixture: er/styles-and-classes/trailing-whitespace-takes-next-line]
  [corpus fixture: er/lex-classdef-space-before-line-feed]

## 空白で決まる Gantt 図の行

mermaid.js は、Gantt 図の一部の値の空白を持ち、一部の行を、
その行の空白で読みを決めます。
そのため、整形は書かれたまま残します。
[タスクのデータ](./gantt.ja.md#タスクのデータ)、[設定](./gantt.ja.md#設定)、
[タイトルとセクション](./gantt.ja.md#タイトルとセクション)、
[リスト](./gantt.ja.md#リスト)を参照してください。

- `tickInterval`、`todayMarker`、`section` の値の両端の空白。
  Db が持ち、図にも描かれるので、空白 2 つの `tickInterval  1week` は、
  目盛りが既定のものになり、`section  A` は `section A` とは別のセクションです。
  `dateFormat`、`axisFormat`、`title` の両端の空白は除きます。
  タスクの説明のテキストとコロンの間の空白は、
  名前に桁そろえの空白があるセクション、
  または桁を共有するセクションどうしのコロンを、
  それらの最長の名前の後に空白 1 つを置いた所にそろえるように整えます。
  （[同じに描かれるキーワードの後のテキスト](#同じに描かれるキーワードの後のテキスト)）。
  [fixture: gantt/settings/trailing-whitespace-by-setting]
  [fixture: gantt/titles-and-sections/title-trailing-dropped-section-kept]
  [fixture: gantt/task-data/description-padding-tightened]
- タスクのデータの項目の中の空白、項目の数、タグの大文字小文字。
  `after   a1` は書かれたままの 1 つの項目で、
  `a : 1d,` は `a : 1d` にない空の項目を持ち、`Done` はタグではありません。
  [fixture: gantt/task-data/inner-whitespace-kept]
  [fixture: gantt/task-data/empty-items]
  [fixture: gantt/keyword-case/tags-case-kept]
- 空白だけのデータを持つタスクの `:` の後の空白と、
  空白だけのリストを持つ `includes` と `excludes` のキーワードの後の空白。
  mermaid.js は、コロンの後にデータの 1 文字を、
  キーワードに続く空白の後にリストのテキストの 1 文字を要求するので、
  `a :` と `includes ` は拒否され、空白 1 文字か 2 文字を残します。
  [fixture: gantt/task-data/whitespace-only-data]
  [fixture: gantt/lists/whitespace-only]
- `includes` と `excludes` のリストの項目の間の U+FEFF。
  mermaid.js はリストのテキスト全体を、分ける前に小文字にし、
  この変換は U+FEFF を無視するので、
  その後ろの語末の大文字のシグマは `ς` になります。
  空白など、ほかの空白の後ろなら `σ` です。
  [test: U+FEFF between the items of a list]
- 呼び出しの名前の、中の空白。
  `f ()` と `f()` は 2 つの関数を呼びますが、引数の空白は 1 つの形で印字します。
  （[同じに描かれる呼び出しの引数](#同じに描かれる呼び出しの引数)）。
  [fixture: gantt/click-statements/call-name-kept-arguments-spaced]
- `;` を含む行。
  mermaid.js の行の規則は行のテキストを読むので、その行の文を行に残します。
  [fixture: gantt/statements-one-per-line/ignored-semicolon-line-kept]
- `%%{` で始まりディレクティブでないコメント行と、
  その直前の印が `%` のコメント行。
  空白 1 文字の後に置きます。
  mermaid.js は、その `%%{` を、前の空白が 1 文字か、
  改行の後に 1 文字のときだけ読み、それより多いときや、
  空行の後で空白がないときは拒否します（既知の差異
  [`percent-brace-after-unit`](../../spec/docs/known-divergences/percent-brace-after-unit.ja.md)）。
  直接に読まれる印が `%` のコメントは後ろの改行を取ります（既知の差異
  [`comment-takes-line-break`](../../spec/docs/known-divergences/comment-takes-line-break.ja.md)）。
  ディレクティブはテキストを読む前に取り除かれるので、
  その前のディレクティブだけの行は、間に空行があってもなくても、1 桁目に置き、
  同じ行のディレクティブの間の空白も `%%{` の前の空白に数えます。
  mermaid.js と仕様が同じに読む入力（`%%{` の行が 1 桁目か、
  空白 1 つかタブ 1 つの後にあるもの）は、整形も、両者が同じに読む形に印字し、
  これらの差異の形には印字しません。
  [fixture: gantt/comments/percent-brace-line-after-blank-line]
  [fixture: gantt/comments/percent-comment-then-percent-brace-line]

## 空白で決まる journey の行

mermaid.js は、journey の一部の値の空白を持ち、一部の行を、
その行の空白で読みを決めます。
そのため、整形は書かれたまま残します。
[タスクのデータ](./journey.ja.md#タスクのデータ)と
[タイトルとセクション](./journey.ja.md#タイトルとセクション)を参照してください。

- `section` の名前の両端の空白と、タスクの説明のテキストとコロンの間の空白。
  Db が持つので、空白 2 つの `section  S` や、桁をそろえた `Make tea  : 5` は、
  空白を落とした形とは別のものです。
  コロンをそろえる空白も残ります。
  `title` の両端の空白は除きます。
  （[同じに描かれるキーワードの後のテキスト](#同じに描かれるキーワードの後のテキスト)）。
  [fixture: journey/titles-and-sections/title-trailing-dropped-section-kept]
  [fixture: journey/task-data/description-padding-kept]
- `section` の後の `#` の前の空白。
  名前の一部ですが、タスクのデータの後では値に入りません。
  `title` の後でも除き、`#` の前に空白 1 つを置きます。
  [fixture: journey/titles-and-sections/title-hash-gap-one-space-section-kept]
  [fixture: journey/task-data/hash-ends-the-data]
- 人の中の空白と、人の数。
  `Me  Two` は書かれたままの 1 人で、`a,` は `a` にない空の人を持ちます。
  [fixture: journey/task-data/people-inner-whitespace-kept]
  [fixture: journey/task-data/empty-people]
- 空白だけのデータを持つタスクの `:` の後の空白。
  mermaid.js はコロンの後にデータの 1 文字を要求するので、`A:` は拒否され、
  `A: ` はタスクであり、空白 1 文字を残します。
  [fixture: journey/task-data/whitespace-only-data]
- `;` を含む行。
  mermaid.js の行の規則は行のテキストを読むので、その行の文を行に残します。
  [fixture: journey/statements-one-per-line/ignored-semicolon-line-kept]

## 場所や空白で決まる requirement の行

mermaid.js は、requirement 図の名前や値の一部の空白を持ち、一部の行を、
その行の置かれた場所で読みを決めます。
そのため、整形は書かれたまま残します。
[名前](./requirement.ja.md#名前)、[フィールド](./requirement.ja.md#フィールド)、
[スタイルとクラス](./requirement.ja.md#スタイルとクラス)、
[1 行に 1 文](./requirement.ja.md#1-行に-1-文)を参照してください。

- 引用符のない名前の中の空白。
  Db が持ち、図にも描かれるので、空白 2 つの `requirement spaced  name` は、
  空白 1 つのものとは別の requirement です。
  名前、値、クラスの両端の空白は Db に入らないので落とし、値、クラス、
  文字列の中の連なりは空白 1 つで印字します。
  （[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)）。
  [fixture: requirement/names/inner-whitespace-kept]
  [fixture: requirement/fields/value-inner-runs-collapsed]
  [fixture: requirement/class-lists/classes-with-spaces]
- 引用符のない名前や値の後ろの `#` と `%`。
  テキストの文字なので、`id: 1 #c` の値は `1 #c` で、
  コメントとして動かしません。
  [fixture: requirement/comments/in-unquoted-text-is-text]
- `style`・`classDef`・`class` 文の行末の文字列が始める文。
  字句解析器はそこでまだ style の文脈にあり、文字列の後の改行が文を続けるので、
  `style r fill:red "r"` と次の行の `:::c` は r にクラス c を与えますが、
  `"r"` と `:::c` を別々の行に置くと拒否されます。
  文は、各部を 1 行にして自分の行に置きます。
  コメント行かディレクティブを含むとき、`;` を含む行にあるときは、
  前の文の行に残し、その行を書かれたまま印字します。
  [fixture: requirement/statements-one-per-line/string-continued-after-styles]
  [fixture: requirement/statements-one-per-line/continued-with-comment-line-kept]
  [fixture: requirement/statements-one-per-line/continued-on-semicolon-line-kept]
- 改行の後の `class` 文の名前。
  文の文脈で読まれ、そこでは引用符のない名前が空白やほかの文字を含められます。
  1 行にすると style の文脈で読まれ、
  そこでは引用符のない名前が `style-word` なので、文が拒否されます。
  [fixture: requirement/styles-and-classes/class-over-lines-kept]
- 印字する最初の行に `direction` と方向を含む `accTitle`、`accDescr:`、
  `accDescr {` の文は、ER 図と同じく 1 桁目を保ちます。
  [fixture: requirement/accessibility-statements/first-column-kept]
- `;` を含む行。
  mermaid.js の行の規則は行のテキストを読むので、その行の文を行に残します。
  複数行に書かれた文の最後の行に、後ろの文の `;` があるときも、
  1 行にした行が全体として読まれるので、書かれたまま残します。
  [fixture: requirement/statements-one-per-line/semicolon-line-kept] [fixture:
  requirement/multi-line-statements/relationship-last-line-semicolon-kept]
- フィールドのない本体。
  mermaid.js は `{` の後に改行を要するので、`{` と `}` を 2 行に置きます。
  [fixture: requirement/bodies/empty-body-on-two-lines]

## 字下げか空行で決まる mindmap の行

mindmap の Db は、ノードの字下げを level として読みます。
また、仕様が受理しても mermaid.js が拒否する空行があります。
そのため、整形は Db が読むものを保ち、mermaid.js が拒否するものは直しません。
[インデント](./mindmap.ja.md#インデント)と
[空行](./mindmap.ja.md#空行)を参照してください。

- ノードとその子の間の段の幅（文字数）。
  Db は、ノードの level を字下げから根の字下げを引いた数として読むので、
  子が 4 文字の `root` と 2 文字の `root` は別の図で、
  1 つの図の中で段の幅が違ってもかまいません。
  変えるのは根の字下げと字下げの文字だけです。
  [fixture: mindmap/indentation/step-widths-kept]
  [fixture: mindmap/indentation/root-shifted-to-one-level]
- 行頭のディレクティブの後ろの空白。
  ノードの字下げに数えられるので、ディレクティブから書かれたまま印字します。
  [fixture: mindmap/directives/before-a-node-on-its-line]
- U+2028 か U+2029 で終わる図のコメント。
  その後ろのテキストは新しい行なので、そこに改行を書きます。
  [test: U+2028 after a comment after a shape]
- mermaid.js が拒否する空行（既知の差異
  [`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.ja.md)）。
  ヘッダーの後のものは落とすので、出力は受理されます。
  ノードの間の図のコメントの後のものは、入力と同じく 1 つ残ります。
  [fixture: mindmap/blank-lines/after-the-header-dropped]
  [fixture: mindmap/blank-lines/after-a-comment-between-nodes-kept]

## 空白で決まる timeline の行

mermaid.js は、timeline の period、event、section の名前の空白を保ち、
いくつかの行を、置かれた場所で読みます。
そのため、整形は、title の両端の空白と行の最後の event の末尾の空白を除き、
それらを書かれたまま残します。
[period と event](./timeline.ja.md#period-と-event)、
[event の文](./timeline.ja.md#event-の文)、
[1 行 1 文](./timeline.ja.md#1-行-1-文)を参照してください。

- period と event の `:` の周りの空白。
  Db は、period の `:` の前の空白と、
  event の `:` の後ろの 1 文字を除く空白を保ちます。
  そのため `2004 : a` と `2004: a` は別の period で、
  `:` をそろえる空白は残ります。
  period の末尾の空白もテキストの一部で、
  同じ行で後ろに別のコロンが続く event の末尾の空白も同じです。
  行の最後の event の末尾の空白は除きます。
  改行で次のコロンと隔てられた event も含みます。
  （[同じに描かれるキーワードの後のテキスト](#同じに描かれるキーワードの後のテキスト)）。
  [fixture: timeline/periods-and-events/period-whitespace-kept]
  [fixture: timeline/periods-and-events/event-padding-kept-end-dropped]
  [fixture: timeline/periods-and-events/period-trailing-kept-event-end-dropped]
- event を書く行。
  後ろの行の event を period の行に空白 1 つで寄せると、
  前の event のテキストに空白が加わります。
  行から event を分けると、前の空白が行末に残ります。
  [fixture: timeline/periods-and-events/events-on-both]
- section の同じ行にある event（`section T : Google`）。
  section の名前は `:` の前の空白を持つので、event は行に残します。
  空白がなければ（`section T: Google`）、event は自分の行に移します。 [fixture:
  timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event]
  [fixture:
  timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event]
- 行に `title` か `section` だけがあって period になるものの後ろの、
  指令だけの行。
  指令の前の空白が title や section のテキストになるので、1 列目に置きます。
  [fixture: timeline/periods-and-events/title-word-then-directive-line]
- title と section のキーワードと本文の間にコメント行か指令がある場合は、
  値に属する空白を含めて原文のまま残します。
  accessibility 行は、
  [構造の継続行](#コメントやディレクティブの前後の構造の継続行)をそろえます。
  `;` を含む行は、その行の文をまとめて残します。
  [fixture: timeline/multi-line-statements/comment-line-inside-kept]
  [fixture: timeline/statements-one-per-line/ignored-semicolon-line-kept]

`accDescr` ブロックの後ろのテキスト行は、
Db の setter が捨てる LF 直後の空白とタブだけを置き換えて字下げします。
テキスト、改行、行末の空白、指令の内容は書かれたまま残します。
[fixture: timeline/multi-line-values/description-line-ending-whitespace]
[fixture: timeline/multi-line-values/description-directive-lines]

## 文字や引用符で決まる sankey の行

mermaid.js は sankey 図を CSV として読みます。
タブ、ASCII 外の文字、引用符の隣の空白を拒否し、文字列と値のテキストを保ちます。
そのため整形が変えるものは少なく、Db と字句解析器が読むものを保ちます。
[インデント](./sankey.ja.md#インデント)、
[コンマ](./sankey.ja.md#コンマ)を参照してください。

- すべての行を 1 列目に置くこと。
  文字列で始まる記録は、引用符の前の空白が拒否されるので字下げできません。
  指令だけの行は、指令を取り除くと空白だけの行になり、それも拒否されます。
  そのためどの行も字下げせず、`useTabs` と `tabWidth` は効きません。
  [fixture: sankey/indentation/quoted-first-record-at-the-first-column]
  [fixture: sankey/indentation/use-tabs]
  [fixture: sankey/indentation/directive-lines-at-the-first-column]
- コンマは文字列に接し、引用符の隣に空白を足しません。
  文字列の後の欄の前の空白は落とします。
  [fixture: sankey/commas/quoted-fields-touch-commas]
- `style` か `classDef` を `:` の前に持ち、`#` の後に `;` がある行の、
  `:` とその後の `#` の間に空白があるかどうか。
  行の規則は、その間に空白がないときだけ行の最後の `;` を無視するので、
  間にあるコンマの周りに空白があるかどうかを保ち、
  あるところは空白 1 つにします。
  `;` を落とすと行の終わりが変わる行は、書かれたまま印字します。
  [fixture: sankey/commas/style-line-colon-and-hash-in-two-fields-kept]
  [fixture: sankey/commas/style-line-spaces-between-colon-and-hash-become-one]
  [fixture: sankey/commas/semicolon-ends-the-line-kept]
  [fixture: flowchart/semicolons/style-line-gap-between-colon-and-hash-kept]
- 空白だけの欄は、テキストが空の欄なので、空白 1 つで印字します。
  別の記録の前にある空白だけの値は、その空白で行が終わります。
  [fixture: sankey/commas/spaces-only-field-is-one-space]
  [fixture: sankey/commas/spaces-only-value-before-another-record]
- 文字列のテキスト。
  改行、中の空行、後ろの行の行頭の空白（値の一部）を保ちます。
  [fixture: sankey/multi-line-strings/string-over-lines]
  [fixture: sankey/multi-line-strings/empty-line-in-string]
- テキストの末尾にあるタブ、U+00A0、U+3000、U+2028、U+2029、U+FEFF は、
  mermaid.js がそこでだけ受理するもので、落とします。
  [test: U+3000 at the end of the text without a line feed]

## 単位、引用符、字句解析器で決まる XY チャートの行

XY チャートの空白の多くは Db に入らないので、整形は空白を変えます。
Db や字句解析器が読むものは変えません。
[テキストの単位](./xychart.ja.md#テキストの単位)と
[引用符](./xychart.ja.md#引用符)を参照してください。

- 引用符なしの文字列の 2 つの単位が接しているかどうか。
  キーワードは、後ろに単語の文字が続かないときだけキーワードなので、
  `x-axis Title1 --> 5` の title は `Title` ですが、
  `Title 1` と空白を置くと `Title` がキーワードになり、
  mermaid.js はここで拒否します。
  `title ba r` はキーワード `bar` ではありませんが、
  単位をつなぐとキーワードになります。
  そのため、空白の連なりは空白 1 つにし、接している単位は接したままにします。
  [fixture: text-units/title-then-range-touching-kept]
  [fixture: text-units/plot-title-digits-touching-kept]
  [fixture: text-units/category-digits-touching-kept]
  [fixture: text-units/hyphen-and-number-touching-kept]
- 向きの語の大文字小文字。
  小文字の `horizontal` だけが横向きにし、`Horizontal` は縦向きにするので、
  大文字小文字は Db に入っています。
  [fixture: header-and-orientation/orientation-case-kept]
- 文字列の中の改行は Db に入り、複数の語を含むテキストの引用符も保ちます。
  `"a b"` と `a b` は同じテキストではないので、書かれたまま残します。
  文字列の中の空白とタブの連なりは、空白 1 つで印字します。
  1 語のテキストの引用符は、
  [テキストの引用符](#テキストの引用符)に従う場合だけ変えます。
  [fixture: quotes/strings-runs-collapsed]
  [fixture: quotes/texts-of-several-words]
  [fixture: multi-line-values/string-with-line-breaks-kept]
- 分類と title の数字はテキストなので、`007` や `.5` は書かれたままです。
  範囲の数とプロットの値は、最短の形で印字します。
  [同じに描かれる綴り](#同じに描かれる綴り)を参照してください。
  [fixture: numbers/categories-are-texts]
  [fixture: numbers/range-numbers-one-form]
- 閉じていない `accDescr {` ブロックは、テキストの最後まで続きます。
  mermaid.js はそのテキストを読まず、
  印字が `}` を足すとブロックが説明になってしまいます。
  [fixture: accessibility-statements/block-not-closed-kept-as-written]
- mermaid.js の行の規則が読む行は、文を 1 行に残し、
  保持する `;` も書かれたままです。
  削除するスタイルの終端は、
  [スタイルの規則](./block.ja.md#スタイル文の末尾のセミコロン)に従います。
  `style` か `classDef`、その後の `:`、`:` との間に空白のない `#`、
  その後の `;` を持つ行です。
  [fixture: statements-one-per-line/line-rule-line-kept-together]
  [fixture: multi-line-statements/semicolon-inside-joined]
- コメント行や指令を含む文は必要な改行を残し、
  [構造の継続行](#コメントやディレクティブの前後の構造の継続行)をそろえます。
  [fixture: multi-line-statements/comment-line-inside-kept]
  [fixture: multi-line-statements/directive-inside-kept]
- コメントが前の単位に接しているかどうか。
  mermaid.js は、1 文字の単位に接した `%%` を、
  その文字と一緒に読みます（既知の差異 `comment-takes-character`）。
  印字はコメントが接しているかどうかを保ちます。
  [fixture: comments/comment-glued-to-a-one-character-word-kept]
  [fixture: comments/comment-takes-a-character-kept]
- 文の隙間にある U+2028 と U+2029 は、書かれたまま印字します。
  [test: U+2028 between the words of a title]
- 既知の差異 `title-digit-after-axis-statement` の入力は、仕様は受理し、
  mermaid.js は拒否します。
  文を別々の行に置くと、mermaid.js が結果を受理し、Db は仕様の読みのままです。
  [fixture: statements-one-per-line/axis-then-title-with-a-digit-split]
  [fixture: statements-one-per-line/axis-band-then-title-with-a-digit-split]

## テキスト、引用符、字句解析器で決まる象限チャートの行

象限チャートのラベル、title、
accessibility のテキストの中の空白は Db に入るので、
整形はそれらのテキストを書かれたまま残し、その周りの空白を変えます。
Db や字句解析器が読むものは変えません。
[キーワードとテキスト](./quadrant.ja.md#キーワードとテキスト)と
[引用符](./quadrant.ja.md#引用符)を参照してください。

- 2 つの単語の間の改ページ。
  空白やタブではなく、テキストの文字です。
  文字列とその後の単語は、間の空白を保ちます。
  `"a" b` と `"a"b` は別のテキストだからです。
  引用符なしのテキスト、名前、title、アクセシビリティの説明の中の、
  空白とタブの連なりは、空白 1 つで印字します。
  （[同じに描かれるテキスト中の空白の連なり](#同じに描かれるテキスト中の空白の連なり)）。
  [fixture: keywords-and-texts/inner-runs-collapsed]
  [fixture: keywords-and-texts/string-then-text-whitespace-kept]
  [fixture: points/name-inner-runs-collapsed]
  [fixture: titles-and-accessibility-statements/text-inner-whitespace-kept]
- キーワード `title` や `classDef` の後に、空白なしで続く単語は、
  それ自身が単語です。
  `title1: [0.3, 0.6]` は名前 `title1` の点で、空白を置くと title になります。
  [fixture: keywords-and-texts/word-after-title-keyword-is-a-point-name]
- 点の座標はテキストです。
  `0.30` は `0.3` ではありません。 [fixture: points/coordinates-as-written]
- 後ろにテキストのない軸の矢印は、Db が左のテキストの一部として読みます。
  [fixture: axes/arrow-only]
- 文字列の中の改行と、引用符のないテキストが持てないものを含む文字列の引用符。
  これらは保ちます。
  `"a: b"` にはコロンがあり、引用符のないテキストはコロンがあると拒否されます。
  中の空白とタブの連なりは、空白 1 つで印字します。
  平易なテキストの引用符は、
  [テキストの引用符](#テキストの引用符)に従って外します。
  [fixture: quotes/strings-runs-collapsed]
  [fixture: quotes/texts-that-need-quotes]
  [fixture: quotes/keywords-and-arrows-in-strings]
  [fixture: multi-line-values/string-with-line-breaks-kept]
- title とアクセシビリティのテキストの中の `;` はその文字で、
  title の中の空の説明ブロックは title の一部です。
  [fixture: statements-one-per-line/semicolon-in-a-title-is-text]
  [fixture: statements-one-per-line/empty-description-block-in-a-title-stays]
- mermaid.js の行の規則が読む行は、文を 1 行に残し、
  保持する `;` も書かれたままです。
  削除するスタイルの終端は、
  [スタイルの規則](./block.ja.md#スタイル文の末尾のセミコロン)に従います。
  `style` か `classDef`、その後の `:`、`:` との間に空白のない `#`、
  その後の `;` を持つ行です。
  [fixture: statements-one-per-line/line-rule-line-kept-together]
  [fixture: multi-line-statements/semicolon-on-the-last-line-joined]
- コメント行や指令を含む点と accessibility の文は必要な改行を残し、
  [構造の継続行](#コメントやディレクティブの前後の構造の継続行)をそろえます。
  [fixture: multi-line-statements/comment-line-inside-kept]
  [fixture: multi-line-statements/directive-inside-kept]
- コメントが前の単位に接しているかどうか。
  mermaid.js は、1 文字の単位に接した `%%` を、
  その文字と一緒に読みます（既知の差異 `comment-takes-character`）。
  印字はコメントが接しているかどうかを保ちます。
  [fixture: comments/comment-glued-to-a-one-character-word-kept]
  [fixture: comments/comment-takes-a-character-kept]
- U+2028、U+2029、U+00A0 は、テキスト、名前、title、
  アクセシビリティのテキストの中では単語の文字で、
  隙間にあっても書かれた場所に残ります。
  [test: U+2028 between the words of a text]
  [test: U+2028 around the arrow of an axis]

通常の点とクラスのスタイルは `name: value` と印字します。
正規化するのは最初のコロンに接する ASCII 空白とタブだけで、値の綴りは保ちます。
trivia、ASCII 空白とタブ以外の空白文字、セミコロン、
2 個目のコロンがあるスタイルや、保護対象のセミコロン行にあるスタイルの内部は、
書かれたまま保ちます。
2 個目のコロンの後の suffix は解釈しません。
[fixture: quadrant/styles/style-colon-padding]
[fixture: quadrant/styles/style-colon-tab-padding]
[fixture: quadrant/styles/style-extra-colon-kept]
[fixture: quadrant/styles/style-directive-kept]
[fixture: quadrant/styles/style-semicolon-protected]

## 空白や字句解析器で決まるブロック図の行

ブロック図の空白の多くは Db に入らないので、整形はそれを変えます。
Db や字句解析器が読むものは変えません。
[行](./block.ja.md#行)、[形](./block.ja.md#形)、
[スタイル](./block.ja.md#スタイル)、
[複数行の文](./block.ja.md#複数行の文)を参照してください。

- ブロック矢印の括弧の中の空白は Db に入ります。
  `(right down)` の向きは `right ` で、`( up)` の向きは ` up` です。
  [fixture: shapes/block-arrow-directions-as-written]
  [fixture: shapes/block-arrow-directions-whitespace-kept]
- `class` の空白。
  id とクラス名の空白です。 [fixture: styles/class-ids-as-written]
  [fixture: styles/class-name-runs-collapsed]
  [fixture: styles/class-name-with-a-comma-runs-collapsed]
- `%%` で始まる文。
  mermaid.js は node の後の `%%x` を id として読み、
  `%%x` で始まる行をコメント行として読むので、
  そのような文がある行は 1 行のまま残します。
  [fixture: rows/percent-id-stays-in-its-row]
  [fixture: rows/percent-id-keeps-columns-with-it]
  [fixture: rows/percent-id-after-end-not-moved]
  [fixture: rows/percent-id-after-the-header-stays-on-the-line]
  [fixture: comments/percent-in-a-line-is-an-id]
- 辺の連鎖 `A --> B --> C` は、1 つの文のまま 1 行に残します。
  mermaid.js はそれを正しく読まず（Db が最後の前の node を落とします）、
  分けると別の読みになります。 [fixture: edges/chain-on-one-line]
- mermaid.js の行の規則が読む行は、文を 1 行に残し、
  保持する `;` も書かれたままです。
  削除するスタイルの終端は、
  [スタイルの規則](./block.ja.md#スタイル文の末尾のセミコロン)に従います。
  `style` か `classDef`、その後の `:`、`:` との間に空白のない `#`、
  その後の `;` を持つ行です。
  [fixture: multi-line-statements/line-rule-line-kept]
  [fixture: multi-line-statements/line-rule-line-kept-with-columns]
  [fixture: multi-line-statements/line-rule-line-kept-with-composite]
- コメント行や指令を含む文は必要な改行を残し、
  [構造の継続行](#コメントやディレクティブの前後の構造の継続行)をそろえます。
  [fixture: multi-line-statements/comment-line-inside-kept]
  [fixture: multi-line-statements/directive-inside-kept]
- U+0085 は mermaid.js が空白として読まず、id の文字です。
  文の隙間にある U+2028 と U+2029 は、書かれたまま印字します。
  [test: U+0085 inside an id] [test: U+2028 between two statements of a row]

## U+2028 か U+2029 の後のコメント行

この共通の除去はagentflowのコメント保持サイズ分岐の外で適用します。
[Agentflowの値、コメント、既定のサイズ境界](#agentflowの値コメント既定のサイズ境界)
を参照してください。

mermaid.js は、本文を読む前に、コメント行を取り除きます。
コメント行 `%%` は、その前の空白だけの行とディレクティブ、
そして行を終える改行と一緒に取り除かれます（仕様の
[コメント行](../../spec/docs/common.ja.md#コメント行) のコメント領域）。
領域が U+2028 か U+2029 の直後、またはこの種の別の領域が終わる所に始まるとき、
領域の前のテキストと後のテキストは 1 行になります。
`alt`、U+2028、`%% e`、行 ` a` は `alt a` です。
[corpus fixture: common/comment-after-u2028]
[corpus fixture: flowchart/comment-lines-after-separator-006f79fb]
`#` のコメントはこの種の領域ではなく、その図の字句解析が読みます。
`%%` の後に何もない行や、ディレクティブではないのに `%%{` で始まる行も、
領域ではありません。
mermaid.js はこれらをコメント行として取り除かず、class 図が自分で読みます。

mermaid.js がこう読む行は、ソースの何行にもまたがります。
整形は、その行を、最初の行から終わりまで、その上にある文ごと、
書かれたまま印字します。
文の間の空白は整形せず、コメント行の後の行も字下げしません。
これはすべての文、ブロックの開始行、ヘッダーに共通の 1 つの規則です。
そのようなコメント行が途中で切る図のコメントも、
書かれたまま印字します（[行区切り](./sequence.ja.md#行区切り)を参照）。
行は、領域が取り除かない最初の改行で終わります。
そのため、コメント行の後の行にあるものは、その行の一部です。
タイトルのない `subgraph` 行の名前は、そこにある `;` で終わり、
`;` はその場所に残ります。
空の行や空白だけの行は、行を終わらせます。
ただし、その後にコメント行が続くときは別です。
コメント行の前にあるそのような行は、領域に入り、領域と一緒に取り除かれます。

## フロントマター

`---` の行の間の YAML は、Prettier の YAML 整形で整形します。
`---` の行は書かれたまま残します。
[fixture: flowchart/frontmatter-yaml/formatted]

YAML の字下げは、`tabWidth: 0` でも 1 段に最低 1 つの空白を使います。
字下げはブロックスカラーと入れ子の値を表します。
幅 0 では、Mermaid がブロックスカラーを拒否するか、
title や設定の値が変わるためです。
全図種に共通の下限で、読みを保ちます。
[fixture: ishikawa/frontmatter-yaml/zero-width-block-scalar-title]
[fixture: ishikawa/frontmatter-yaml/zero-width-nested-title]
[fixture: ishikawa/frontmatter-yaml/zero-width-nested-config]
[fixture: flowchart/frontmatter-yaml/zero-width-nested-title]

`---` の行が字下げされているときと、
整形した YAML の行が `---` の行の形（仕様の
[フロントマター](../../spec/docs/common.ja.md#フロントマター) ）をしていて、
フロントマターを途中で終わらせるときは、YAML を書かれたまま残します。
Prettier はそうした行を印字します。
`%YAML` の指示子の後の `--- !!map` を `---` と `!!map` の 2 行に印字します。
[fixture: flowchart/frontmatter-yaml/indented-delimiters-kept]
[fixture: flowchart/frontmatter-yaml/delimiter-line-kept]

YAML が、`<` の後に ASCII の英字、数字、`_` のいずれかが続く箇所を含むときは、
YAML を書かれたまま残します。
整形後の YAML も、入れている Prettier の YAML 整形への備えとして確かめますが、
整形後にだけ `<` が現れる入力は見つかっていません。
[fixture: flowchart/frontmatter-yaml/html-tag-kept]
[fixture: flowchart/frontmatter-yaml/compat-tag-start-digit-kept]
[fixture: flowchart/frontmatter-yaml/compat-tag-start-underscore-kept]
[fixture: flowchart/frontmatter-yaml/compat-less-than-without-tag-formatted]
そうした `<` は HTML タグの始まりになりえます。
mermaid.js は YAML を読む前に、HTML タグの中の `="..."` を書き換えます。
タグの中の値の引用符を変えると、mermaid.js が読むものが変わることがあります。
たとえば、mermaid.js は `title: "<a b=\"c\">"` を受理します。
Prettier はこれを `title: '<a b="c">'` と印字しますが、
mermaid.js はそれを `title: '<a b='c'>'` に書き換え、YAML ではなくなります。

## バイト順マーク

Prettier は、ファイルの先頭のバイト順マークを、プラグインが読む前に取り除き、
後で付け直します。
mermaid.js は、閉じる `---` の行にも同じマークがあるときだけ、
マークの後のフロントマターを読みます。
そのため:

- マークが 2 つの `---` の行の前にあるとき、mermaid.js はテキストを受理し、
  このプラグインは構文エラーとして報告します。
  [corpus fixture: common/frontmatter-bom-both-delimiters]
- マークが開く行の前にだけあるとき、mermaid.js はテキストを拒否し、
  このプラグインは整形します。 [corpus fixture: common/frontmatter-bom]

## 行末

mermaid.js は `\r\n` と単独の `\r` を、
`\n` と同じく改行として読みます（仕様の
[行終端](../../spec/docs/common.ja.md#行終端)）。
Prettier はプラグインがテキストを読む前にそれらを変換し、
出力は Prettier の `endOfLine` オプションの行末になり、
行は改行のテキストと同じです。
[test: a flowchart diagram with other line endings]
[test: a sequence diagram with other line endings]
[test: a class diagram with other line endings]
[test: a state diagram with other line endings]

## Markdown のコードブロック

Prettier は、
Markdown のすべてのコードブロックの最後の行の末尾の空白を取り除きます。
このプラグインが整形するブロックも同じです。
mermaid.js がその空白を読む箇所では、図が変わります。
`style A fill:#f00, ` は受理され、`style A fill:#f00,` は拒否されます。
黙って変わることもあります。
最後の行のコメント `%% ` は `%%` になってコメントでなくなり、
mermaid.js はそれを名前 `%%` の頂点として読みます。

このプラグインが整形するブロックでは、ほかの行の末尾の空白は保ちます。
整形しないブロックは Prettier に任せ、
Prettier はすべての行の末尾の空白を取り除きます。

## error 擬似図

mermaid.js が受理する `error` 擬似図は、`error` という語と、
その周りのコメント・ディレクティブ・改行だけでできたテキストで、
整形するものがありません。
printer は、フロントマターを含め、テキスト全体を書かれたまま印字します。
単独のファイルで変わりうるのは改行コードだけで、
他の言語と同じく Prettier の `endOfLine` オプションに従います。
Markdown では、コードブロックを Prettier に任せます。
[fixture: error/as-written/frontmatter-kept]
[fixture: error/as-written/trailing-whitespace-and-comment-kept]
[fixture: error/as-written/directive-kept]
[corpus fixture: common/error-pseudo-diagram]
[corpus fixture: common/error-comment-inside]

## Kanban の字下げ、不透明な末尾、保持行

kanban のボードの Db は字下げを持たず、
ノードの字下げを最初のノードの字下げと比べて、セクションと項目を区別します。
そのため、印字は、セクションは 1 段、項目は 2 段の字下げを決め、
役割を決めるものを保ちます。
裸の id・ラベル・icon・class の空白は値として残します。
装飾はノードの桁に揃え、インラインディレクティブの行は、
ディレクティブと隣の隙間を保ち、最初のディレクティブの前の空白を印字が決めます。
YAML として正しくないデータブロックは、パーサーが不透明なテキストとして受理し、
mermaid.js は拒否します（既知の差異
[`embedded-data-opaque`](../../spec/docs/known-divergences/embedded-data-opaque.ja.md)）。
印字は対象となる余白の移動を除き、不透明な内容を保ちます。
[kanban の規則](./kanban.ja.md)を参照してください。
[fixture: kanban/indentation/sections-and-items]
[fixture: kanban/icons-and-classes/aligned]
[fixture: kanban/directives/leading-directive-indentation-decided]
[fixture: kanban/trailing-whitespace/class-trailing-trim]

余白の移動と、1 行のブロックの両端の空白は、
[データブロック](./kanban.ja.md#データブロック)に従います。
データブロックの付着位置と内容、隣接するブロック、間のディレクティブも保ちます。
YAML 整形は、保護条件付きのフロントマターだけです。
図のコメント後の空行・コメントの隙間は、末尾も含め、
`blank-line-after-header-or-comments` のもとで全体を保ちます。
素の mermaid.js が拒否する入力に素の Db はなく、
コーパスは仕様の読み方を確かめます。 [fixture: kanban/data-blocks/adjacent]
[fixture: kanban/data-blocks/data-adjacent-directive]
[fixture: kanban/blank-lines/div-between-comment-blank]
[fixture: kanban/blank-lines/comment-blank-trailing]

共通の `style`・`classDef` の行規則で保持する行は、区間全体、空白、コメント、
ディレクティブを保ちます。
無視するセミコロンも含め `;` を残し、文の区切りとは扱いません。
削除やインラインコメントの移動で、最後に選ばれるセミコロンが変わり得るためです。
Unicode の区間境界とコメントの終わりは文字として残し、
CR・LF の変換は他図種と共通の設定に従います。
[fixture: kanban/line-rule-and-kept-lines/line-rule-comment-to-own-line]
[fixture: kanban/line-rule-and-kept-lines/line-rule-classdef-and-style]
[fixture: kanban/semicolons/values] [test: kanban: line-rule-ls-segment]
[test: kanban: comment-ls-split-count]
[test: a kanban diagram with other line endings]

## C4 の引数の単位と物理行

C4 は書かれた引数の単位と位置をすべて保ちます。
空項目、空文字列、使われない添字と sprite、余分な引数、隣接する単位も対象です。
裸と引用符付きの形は、
[テキストの引用符](#テキストの引用符)のとおりに印字します。
裸の引用符または `$` の前の非 ASCII 空白も保ちます。
その空白が裸の単位を選ぶためです。
引用符付き引数の後の空白だけの単位も残します。
[C4 の規則](./c4.ja.md)を参照してください。
[fixture: c4/argument-spacing/null-space-kept]
[fixture: c4/empty-entries/named-null-slots]
[fixture: c4/number-like-text/excess-kept] [test: c4: tab-before-quote]
[test: c4: bare-dollar-prefix]

名前付き属性の通常の間隔は `$key = "value"` とし、キーと引用符の中身は保ちます。
[fixture: c4/named-attributes/named-equals]
[fixture: c4/named-attributes/named-multiline]

空の説明ブロックは隣接したままにし、二つの `beforeBody` の隙間も保ちます。
意味のある文も改行も供給しないためです。
複数行の引数の値は行と列を保ちます。
名前付きキーの外側の隙間は改行を保ち、通常の継続行の字下げを使います。
direction の文字の結合は、先頭列でも受理される入力を拒否に変えうるためです。
[fixture: c4/empty-description-blocks/empty-header-gap]
[fixture: c4/empty-description-blocks/empty-boundary-next-gap]
[fixture: c4/empty-description-blocks/empty-on-close-line]
[fixture: c4/named-attributes/named-exterior-newline-kept]
[fixture: c4/named-attributes/named-key-newline]
[fixture: c4/direction-rejection/acc-colon-direction]

複数行の空の `beforeBody` ブロックでは、独立した注釈は、
ブロックを持つヘッダーや呼び出しより 1 段深く置きます。
閉じる `}` はヘッダーや呼び出しと同じ段にそろえます。
既存の隣接と波括弧の結合規則は引き続き適用します。
[fixture: c4/header/empty-header-comment-columns]
[fixture: c4/boundary-bodies/empty-beforebody-comment-columns]

コロン形式の accessibility は注釈の改行を残し、
値の外側の構造と独立した注釈を継続行として字下げします。
説明ブロックの独立した directive は本文にそろえ、内容と接触は変えません。
native の `title` と `accDescription` の値の前置空白、方向の文字を含む行、
セミコロンの保護、コメントで結合される領域は、それぞれの保持規則に従います。
[fixture: c4/accessibility-lines/colon-trivia-continuations]
[fixture: c4/description-blocks/block-directive-lines]

図のコメントの後は、復帰用の空白行と末尾の隙間も含めて全体を保ちます。
コメントを移して `comment-takes-line-break` の差異を修復しません。
すべてのセミコロンと Unicode の区間境界を保ちます。
保つ `;` を含む区間は、行の規則が無視する `;` が整形で変わる所を除き、
ほかの場所と同じように整形します。
この規則は、[セミコロン](./flowchart.ja.md#セミコロン)のとおり、
`style` か `classDef` の後の最初の `:` から、
最後の保つ `;` の前の最後の `#` までに空白がない並びを読みます。
その範囲の隙間と余白は空白の有無を保ち、空白の連続は空白 1 つにします。
範囲の外は、この図種の通常の規則に従います。
字下げと値の外の末尾空白は printer が整えます。
[fixture: c4/comments/comment-header] [fixture: c4/blank-lines/comment-recovery]
[fixture: c4/final-newline/comment-eof-gap]
[fixture: c4/line-rule-and-semicolons/semicolon-inline-comment]
[fixture: c4/line-rule-and-semicolons/semicolon-suffix-spacing]
[fixture: c4/trailing-whitespace/semicolon-line]
[test: c4: ls-line-rule-segments]

## Venn の暗黙の text とテキストの行規則

Venn の本文は平らな一覧で、対象を書かない text だけを字下げします。
モードが有効な間は正の字下げが暗黙の text を選ぶためです。
宣言と同じ行の style、対象つき text、title は分けず、
モードを解除しないようにします。
先頭のディレクティブは論理的な字下げの正とゼロを保ちます。
図コメントの隙間は `%%{ }%%` の前の空行と空白だけの行の境界を保ちます。
[Venn の規則](./venn.ja.md)を参照してください。

[fixture: venn/indentation/indent-width]
[fixture: venn/statements-one-per-line/header-declaration-group]
[fixture: venn/directives/directive-leading-marker]
[fixture: venn/blank-lines/whitespace-before-empty-braces]
[fixture: venn/blank-lines/blank-before-empty-braces-explicit]

名前、ラベル、裸と引用符つきの style 全体、title、
重複と飲み込まれる断片は書かれたテキストのまま保ちます。
単純な十進表記ではないサイズも、書かれたテキストのまま保ちます。
単純な十進表記のサイズは最短の形で印字します。
[同じに描かれる綴り](#同じに描かれる綴り)を参照してください。
空の引用符つきの名前と style も値です。
裸の空白、引用符内の空白、空の引用符つきラベルの読み分けも保ちます。
上で述べた行末のスタイルの終端を除き、セミコロンを保ちます。
保つセミコロンがある行は、
[Line rule and kept lines](./venn.ja.md#line-rule-and-kept-lines)のとおり、
行の規則が読む範囲を除いて、ほかの場所と同じように整形します。
コメントとディレクティブ内の Unicode 区切りは保持部分を切りません。
Venn の図コメントは LF か末尾まで続きます。

[fixture: venn/name-lists/empty-quoted-targets]
[fixture: venn/labels/labels-empty-kept]
[fixture: venn/style-properties/style-atoms-spaced]
[fixture: venn/comments/ignored-fragment]
[fixture: venn/line-rule-and-kept-lines/line-rule-suffix-spacing]
[test: venn: ls-kept-comment-whitespace-line] [test: venn: ps-kept-directive]

正規化するのは、受理する役割の空白と上の節の綴りだけです。
通常の ASCII の隙間、設定の暗黙の字下げ、title の最初の区切りです。
CR と CRLF は共通の改行処理を使います。
値の Unicode 文字は保ち、不正な通常の隙間は拒否のままです。
失敗、Markdown、frontmatter、最後の改行は共通の経路に従います。
仕様の単位境界の乖離は失敗のままで、
C4 の検出と不透明な YAML の乖離は仕様の読み方を使います。
生の拒否には生の Db はありません。

[fixture: venn/whitespace-characters/tab-gaps]
[fixture: venn/title/title-next-line] [fixture: venn/header/div-c4-detector]
[fixture: venn/frontmatter-yaml/frontmatter-invalid-kept]
[test: a venn diagram with other line endings]
[test: venn: unicode-role-whitespace]

## Ishikawa の入れ子と literal の行

Ishikawa は、入力の字下げ幅や Db の一時的なレベルを使わず、
入れ子の AST を使います。
根は見出しの正の 1 段下、子はさらに 1 段下です。
`tabWidth: 0` でも最低 1 文字にします。
根の列は親子を決めません。
[Ishikawa の規則](./ishikawa.ja.md)を参照してください。

[fixture: ishikawa/indentation/indent-depth]
[fixture: ishikawa/indentation/indent-clamped]
[fixture: ishikawa/indentation/indent-zero]

引用符、空に見える形、accessibility、style、データらしい文、
インラインの percent のテキストは literal として保ちます。
内部の directive の隙間と、結合した物理行の継続列は保ちます。
普通の行でも保持する行でも、literal の末尾の文字は全て保ちます。
値は書かれたものであり、Db が等しいことは値を消す理由になりません。
mindmap と同じ選択です。
semicolon は全て残し、共有の区間保持の経路で、
交差する literal と trivia 全体を保護します。

[fixture: ishikawa/node-text/values-opaque]
[fixture: ishikawa/inline-directives/directive-in-value]
[fixture: ishikawa/trailing-whitespace/trailing-value-dropped]
[test: ishikawa: joined-common-region]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-kept]

図コメントの Unicode 終端は、次の節点の深さの字下げに数える文字です。
共通コメント領域は、飲み込む接尾部と結合を保ちます。
図コメントの後の区切りも含め、普通の空行の連続は 1 つにします。
末尾の図コメントの隙間は全体を保ちます。
受理した差異は仕様の木を使い、失敗は修復しません。
生の拒否には生の Db はありません。
ガード付き frontmatter、設定の CR と LF への変換、EOF の directive、
Markdown のホストの処理は、共有の経路を使います。

[test: ishikawa: ls-comment-boundary] [test: ishikawa: ps-comment-boundary]
[fixture: ishikawa/blank-lines/blank-comment-div]
[fixture: ishikawa/blank-lines/terminal-comment-complete-gap]
[fixture: ishikawa/node-text/div-c4]
[fixture: ishikawa/frontmatter-yaml/frontmatter-html-guard]
[test: ishikawa: eol-crlf] [test: ishikawa Markdown: quote-list-clamped]

見出し行で見出しに接する directive は、空白で離れた根を下へ移しても残します。
空白で隔てられた directive は、同じ行の根と一緒に移し、
その後ろの隙間を [Inline directives](./ishikawa.ja.md#inline-directives)
の根の字下げに数えます。
残すと、除去後に見出しの行末に空白が残り、Mermaid が拒否するためです。
根に接する directive は見出しとの組全体を保ちます。
同じ行に根がない directive は、仕様の読みを保ちます。

[fixture: ishikawa/standalone-directives/header-spaced-directive]
[fixture: ishikawa/standalone-directives/header-spaced-multiline-directive]
[fixture: ishikawa/standalone-directives/header-spaced-two-directives]
[fixture: ishikawa/standalone-directives/header-spaced-directive-comment]
[fixture: ishikawa/standalone-directives/header-touching-directive]
[fixture: ishikawa/standalone-directives/header-directive-touching-root]
[corpus fixture: ishikawa/div-header-space-directive-node]

## Agentflowの値、コメント、既定のサイズ境界

agentflow本文は共有の意味を持つ字下げ幅を使い、
`tabWidth: 0`でも1段に最低1つの空白を置きます。
字下げのある方向文を1桁目へ移すと、
前置きがaccessibilityの値や構文エラーに変わり得るためです。
[fixture: agentflow/direction/zero-title-indented]
[fixture: agentflow/direction/zero-description-indented]
[fixture: agentflow/direction/zero-style-direction]

[Agentflowの規則](./agentflow.ja.md)はflowchartの配置を共有し、
値の境界を区別します。
style/classDef/class/linkStyleの後、classの値、interpolate名、
tooltipの前の必須の1単位は、その後の空白が値なので保ちます。
最初のstyleの先頭空白とラベルコメント脇の空白も文字です。
名前の消されるclickと空の断片を保ちます。
clickのIDとして名前を読むのを終える空白1文字も保ちます。
区切りをLFへ変えると名前でなくなる、末尾の空白だけの断片は落とします。
[fixture: agentflow/names-and-headings/empty-description-space-flow]
clickのtextBeforeUrl/textBeforeTooltipも各prefixと元の隙間を保ちます。
click予約語の例外は使いません。
[fixture: agentflow/single-space-gaps/style-first-spaces]
[corpus fixture: agentflow/lex-flow-name-click-state]
[corpus fixture: agentflow/gram-click-erased-before-url-tooltip]

通常サイズのコメントはLS/PSを通りLFかEOFまで続きます。
文字列、説明、callback、データでコメントに見える文字も値です。
end/globalはLFではなくASCIIの空白とタブを取り、
波括弧後に畳むのは直後のLF前の空白だけです。
データは書かれた出現に別々に保ちます。
内容だけの拒否には仕様の不透明な読みを使い、rawの拒否にはDbがありません。
[fixture: agentflow/comments/comment-looking-values]
[fixture: agentflow/multiline-statements-and-values/brace-blank-kept]
[corpus fixture: agentflow/db-data-block-invalid-yaml]

frontmatterとdirectiveを除き、正規化したUTF-16で50000単位以上なら、
図の全文と末尾を保ちます。
未満でも、印字計画が50000未満に収まるときだけ通常配置を適用します。
字下げ、末尾LF、空白削除、ホストが戻すBOMで、
Mermaidのコメント保持の分岐を変えないためです。
frontmatterは共通の保護付きYAML整形を使います。
CR/LFとMarkdownも共通のホスト処理に従います。
ブロック最終行の末尾空白の削除でnullのstyleが拒否され得る制限も同じです。
[fixture: agentflow/default-size-branches/size-preserving-to-fallback-unsafe]
[fixture: agentflow/default-size-branches/size-below-planned-crossing]
[test: agentflow Markdown: null style host limitation]

## Usecase native syntax and authored values

usecase は書かれた AST に従います。
境界の所属、端点の出現、矢印と id の境界、宣言と更新の役割、
原文の順序を解決後の Db から作り直しません。
本文の字下げは構造の表示なので `tabWidth: 0` は 0 のままです。
保護条件付きの YAML は共有の最小幅 1 を保ちます。
`A --order` は `A --o rder`、`A -- order` は端点全体を保ちます。
[usecase の規則](./usecase.ja.md)を参照してください。
[fixture: usecase/arrow-id-boundaries/circle-prefix-suffixes]
[fixture: usecase/indentation/indent-zero]
[fixture: usecase/frontmatter-yaml/frontmatter-zero]

native の `@{...}` metadata は解析と検証を行う構文です。
構造の空白だけを変え、書かれた区切り、空行、綴り、順序、重複をすべて保ちます。
JSON の表データは不透明で、数とエスケープの綴り、プロパティの順序も含みますが、
先頭部分の `{` は `@` に接し、
対象となる余白は [JSON tables](./usecase.ja.md#json-tables) に従います。
効果を渡さない整形 fixture では、共有の Db 比較を null とし、原文を比較します。
コーパスは存在する記録済みの効果を使います。
CSS 宣言の最初のコロンの前後の空白は、
[同じに描かれるスタイル](#同じに描かれるスタイル)に従います。
宣言の中の空白の連なりも、空白 1 つで印字します。
[fixture: usecase/native-metadata/metadata-inline]
[fixture: usecase/native-metadata/metadata-blank-lines-kept]
[fixture: usecase/json-tables/json-opaque]
[fixture: usecase/classes-and-styles/css-colon-padding]
[fixture: usecase/classes-and-styles/css-custom-gap-run-collapsed]

共通コメント領域と改行の処理後、最後のプロパティから `}` までの、
末尾コンマと物理改行の合計は 2 個以下で、コンマは改行の前にだけ置けます。
受理される末尾では、書かれた改行と空行を保ちます。
[corpus fixture: usecase/gram-metadata-property-comma-no-newline]
[corpus fixture: usecase/gram-native-trailing-newline]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-newlines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-three-newlines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-four-newlines]
[corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
[corpus fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
[corpus fixture: usecase/gram-edge-metadata-two-newlines]
[corpus fixture: usecase/gram-edge-metadata-three-newlines]
[corpus fixture: usecase/gram-metadata-trailing-comma-no-newline]
[corpus fixture: usecase/gram-native-trailing-comma-newline]
[corpus fixture: usecase/gram-metadata-trailing-comma-two-newlines]
[corpus fixture: usecase/gram-metadata-trailing-comma-three-newlines]
[corpus fixture: usecase/gram-native-trailing-newline-comma]
[corpus fixture: usecase/gram-metadata-tail-newline-before-comma]
[corpus fixture: usecase/gram-metadata-tail-newline-before-comma-newline]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-crlf]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-three-crlf]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-whitespace-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-whitespace-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-two-tab-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-tab-lines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-comment-two-newlines]
[corpus fixture: usecase/gram-metadata-no-trailing-comma-comment-three-newlines]
プロパティ間のコンマの後は、改行を 0 個以上置けます。
[corpus fixture: usecase/gram-metadata-property-comma-no-newline]
[corpus fixture: usecase/gram-metadata-property-comma-one-newline]
[corpus fixture: usecase/gram-metadata-property-comma-two-newlines]
[corpus fixture: usecase/gram-metadata-property-comma-three-newlines]

accessibility 行は class と C4 の規則を再利用し、
両端の空白を除いた値の前を空白 1 個にします。
説明本文は[説明ブロックの字下げ](#説明ブロックの字下げ)に従い、
文字と改行を保ちながら普通の行頭の字下げと独立した閉じ波括弧をそろえます。
コメントだけの本文も同じ本文・閉じ括弧の配置にします。
[fixture: usecase/direction-and-accessibility/a11y-comment-empty-tabs]
[usecase の規則](./usecase.ja.md#direction-and-accessibility)
を参照してください。 [fixture: usecase/direction-and-accessibility/a11y-padding]
[fixture: usecase/direction-and-accessibility/a11y-closer-aligned]

stereotype の宣言接尾辞は、systemBoundary 内も含め、`<<` の前と、
各区切りの内側の空白の有無を保ちます。
空白があれば 1 個に縮め、なければ足しません。
Mermaid は内部の両端を除き、`<<` の前の空白は構造上の空白です。
内部のテキストは書かれたままです。
保護した共通コメント領域は、値の全体を保ちます。
class の[トークンの間の空白](./class.ja.md#トークンの間の空白) を再利用します。
[fixture: usecase/stereotypes/stereotype-padding]
[fixture: usecase/stereotypes/opener-gap-sides]
[test: usecase: stereotype-opener-tab]
[fixture: usecase/stereotypes/stereotype-inner-kept]
[fixture: usecase/stereotypes/side-padding]
[fixture: usecase/stereotypes/boundary-suffixes]
[fixture: usecase/stereotypes/semicolon-padding-dropped]
[test: usecase: stereotype-comment-region-padding-kept]

ラベル、境界タイトルの余白、継続列は、除去で Db が等しい場合も書かれたままです。
`'` で囲むラベルは、
[同じに描かれる綴り](#同じに描かれる綴り)に従って `"` で囲んで印字します。
共通コメント領域の結合と LS、PS を越える native コメントを保ちます。
セミコロンは文を区切らず、行の規則が読む範囲を保護します。
六つの既存の乖離は指定の受理と読みに従い、拒否する木は共有の失敗経路に従います。
[fixture: usecase/labels/label-quote-kinds]
[fixture: usecase/system-boundaries/boundary-headings]
[fixture: usecase/direction-and-accessibility/a11y-padding]
[fixture: usecase/statements-and-semicolons/semicolon-selected-boundary]
[test: usecase: comment-region-join] [test: usecase: unicode-comment]

共有の EOL、BOM、frontmatter、末尾改行、Markdown の処理を適用します。
accessibility 行の外側の空白は、単独ファイルと Markdown の両方で除きます。
[fixture: usecase/final-newline/final-value-padding]
[test: usecase Markdown: last-value-padding]

## Pie hidden boundaries and authored values

[pie の規則](./pie.ja.md)は、ラベルの引用符と値の桁を 1 つの形で印字し、escape、
値の継続列、重複と原文の順序を保ちます。
[同じに描かれる綴り](#同じに描かれる綴り)を参照してください。
共通の title/accessibility 行の両端は C4 と同様に整えますが、
pie は次の物理行の値を結合しません。
空のラベルと説明 block も実際の構文です。 [fixture: pie/labels/label-quotes]
[fixture: pie/numbers/number-spellings] [fixture: pie/title/title-next-trivia]
[fixture: pie/description-blocks/block-empty]

Hidden YAML と hidden DIRECTIVE は PieIgnoredText であり、
先頭の frontmatter や Root の directive とは別です。
hidden の範囲全体を原文の位置に保ちます。
受理を決める閉じの空白は EOF でも保ちます。
範囲外の必須 LF と端の空行は [pie の Blank lines](./pie.ja.md#blank-lines)
に従います。
Hidden YAML の閉じは先頭列を保ちます。
検出が飛ばした前置きは先頭 LF とコメントも全体を保ち、
ignored YAML が frontmatter になるのを防ぎます。
保護した YAML 整形は実際の frontmatter だけに適用します。
[fixture: pie/hidden-yaml/yaml-after-space-boundary]
[fixture: pie/hidden-directives/hidden-after-extra-lf]
[fixture: pie/frontmatter-yaml/preheader-leading-lf]
[fixture: pie/frontmatter-yaml/frontmatter-safe]

pie の本文は `tabWidth: 0` で字下げ0幅です。
YAML は共有の最小幅を保ちます。
セミコロンをすべて残し、行の規則が読む範囲を保護します。
物理改行、BOM、末尾改行の処理は共有します。
Markdown host は最後の code block 行の空白を hidden 境界も含め削ります。
後続の文の前にある内部の hidden 境界の空白は必要です。
[fixture: pie/indentation/indent-zero]
[fixture: pie/frontmatter-yaml/frontmatter-zero]
[fixture: pie/directives-and-semicolons/selected-two-passes]
[test: pie Markdown: hidden-boundary] [test: pie Markdown: final-hidden-padding]

pie の corpus は、受理と Db の読みを仕様が定める、印付きの差異を含みます。
raw が拒否する C4 判定、前置きの Unicode、opaque YAML には raw Db がなく、
利用できる指定の Db と木を別に確認します。
拒否する payload は共有の失敗経路を使います。
[Specified readings](./pie.ja.md#specified-readings)を参照してください。
[corpus fixture: pie/div-detect-c4-label]
[corpus fixture: pie/div-review-yaml-leading-invalid]
[corpus fixture: pie/div-preheader-retained-yaml-bare-ls]
[test: pie Markdown: rejected]

## Gitgraph の hidden 境界と書かれた履歴

[gitgraph の規則](./gitgraph.ja.md)は、見出しの方向、bare と明示的な message、
参照の形、order の桁、option と文の全出現の原順序を保持します。
見出しの後のコロン、`checkout` の代わりの `switch`、
文字列の引用符は 1 つの形で印字します。
[同じに描かれる綴り](#同じに描かれる綴り)を参照してください。
文字列と参照の padding、escape、HTML、entity、tag の順序は Db を変え、
cherry-pick の空 tag は既定 tag を抑止します。
summary に message がなくても削除はしません。
[fixture: gitgraph/header/header-tb]
[fixture: gitgraph/checkout-aliases/alias-one-form]
[fixture: gitgraph/messages/message-forms]
[fixture: gitgraph/quotes/quotes-one-form]
[fixture: gitgraph/references/reference-empty]
[corpus fixture: gitgraph/number-precision]
[fixture: gitgraph/authored-values/inner-padding-change]
[corpus fixture: gitgraph/db-cherry-pick-only-empty-tags]
[fixture: gitgraph/order-and-repetitions/order-reverse-id]

GitgraphIgnoredText は native hidden YAML/DIRECTIVE を保持し、
実 frontmatter と global directive とは別です。
hidden の範囲全体を所有位置に残し、閉じの padding は EOF でも保持します。
範囲外の必須 LF と端の空行は
[gitgraph の Blank lines](./gitgraph.ja.md#blank-lines) に従います。
hidden YAML の閉じの列も残します。
見出し前に保持する prefix 全体を残し、hidden YAML の有効化を防ぎます。
安全な実 YAML は共通の formatter を使い、tabWidth 0 でも正の最小字下げです。
global trivia、コメント、semicolon の保護は共通の規則に従い、
保護された見出しと最初の文は分けません。
[corpus fixture: gitgraph/lex-hidden-yaml-before-option-value]
[corpus fixture: gitgraph/lex-hidden-yaml-commit-closing-space]
[corpus fixture: gitgraph/lex-hidden-directive-commit-spare-lf]
[fixture: gitgraph/trailing-whitespace/hidden-eof-padding]
[fixture: gitgraph/frontmatter-yaml/prefix-retained]
[fixture: gitgraph/frontmatter-yaml/frontmatter-zero-minimum]
[fixture: gitgraph/global-directives/directive-sides]
[fixture: gitgraph/semicolons/semicolon-cross-trigger]

共通の title と accessibility の行の外端は詰めますが、
次の物理行から値を取り込みません。
共通の description block 配置は、内側の波括弧の接触、空 block、trivia を保ち、
普通の本文の字下げは
[説明ブロックの字下げ](#説明ブロックの字下げ)に従ってそろえます。
物理改行・BOM・終端改行は共通の host の経路です。
Markdown は最終 payload 行の padding を消しますが、
本文途中の hidden の padding は必要なままです。
[corpus fixture: gitgraph/title-next-line]
[fixture: gitgraph/title-and-common-values/a11y-no-next-line]
[fixture: gitgraph/title-and-common-values/a11y-fixed]
[corpus fixture: gitgraph/lex-description-block-only-comment]
[test: gitgraph/line-terminators-and-unicode/eol-string-crlf]
[test: gitgraph Markdown: hidden-boundary]
[test: gitgraph Markdown: final-hidden-padding]

既知の差異は仕様に従います。
atomic な directive と semicolon の分断、本文だけの frontmatter HTML、
opaque な埋め込みデータ、C4 検出、bare percent の見出し前 trivia が対象です。
不正 YAML を含め raw の拒否に raw Db はなく、
利用できる仕様の読みを別に検査します。
空の quoted option と空の description block は受理したままです。
解析失敗は standalone の構文エラーを報告し、
Markdown の埋め込みを辞退して payload を修復しません。
[Specified readings](./gitgraph.ja.md#specified-readings) を参照してください。
[corpus fixture: gitgraph/div-directive-in-commit]
[corpus fixture: gitgraph/div-style-semicolon-in-order-number]
[corpus fixture: gitgraph/div-frontmatter-cross-title-value]
[corpus fixture: gitgraph/div-frontmatter-invalid-yaml]
[corpus fixture: gitgraph/div-detect-c4container-comment-eof]
[corpus fixture: gitgraph/div-detect-bare-before-header-ls]
[test: gitgraph Markdown: rejected]

## info の hidden 境界と原文の文

[info の規則](./info.ja.md)は、書かれた showInfo の選択、共通文の順序と反復、
空の構文、引用符、escape、値の文字を保ちます。
通常の説明本文の行頭は[説明ブロックの字下げ](#説明ブロックの字下げ)に従います。
ほかの literal と hidden form の継続列は原文のままです。
info の公開 Db summary は、title と accessibility の代入があっても空です。
空 Db の一致は原文を削除する根拠にはなりません。
共通行の外端は詰め、次の物理行の値は別のままです。
[fixture: info/statements-one-per-line/order-and-empty]
[fixture: info/authored-values/literal-quotes-escapes]
[fixture: info/title/title-next-comment-directive]
[fixture: info/accessibility-lines/a11y-line-braces]

InfoIgnoredText は実 frontmatter や Root directive と別に、
hidden YAML/DIRECTIVE を元の所有位置に保ちます。
hidden の範囲全体と閉じの padding を EOF でも保ちます。
これらの境界は受理を左右するためです。
範囲外の必須 LF と端の空行は [info の Blank lines](./info.ja.md#blank-lines)
に従います。
hidden YAML の閉じは列を保ちます。
無視された YAML の実 frontmatter への昇格が設定や受理を変えないよう、
先頭 LF とコメント列を含む保持 prefix 全体を残します。
共有 formatter と正の最小字下げを使うのは安全な実 YAML だけです。
[fixture: info/hidden-yaml/yaml-block-space]
[fixture: info/hidden-yaml/yaml-block-spare]
[fixture: info/hidden-directives/hidden-title-space]
[fixture: info/trailing-whitespace/trailing-hidden-eof-kept]
[fixture: info/retained-prefix/prefix-leading-lf-kept]
[fixture: info/frontmatter-yaml/frontmatter-zero-minimum]

すべての semicolon を残し、共有の source segment 保護で、
交差する値・trivia と保護された見出し・本文 group を完全な形に保ちます。
trigger の segment 変更は受理を変えうるためです。
global directive の原文を保ち、隙間の中では、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
info の Db が空でも init の削除は設定を変えうるためです。
物理 EOL と EOF に達する global の終端は共有経路を使います。
Prettier は先頭 BOM を除去・復元します。
opening fence の BOM により、
plugin 内部では hidden YAML が実 frontmatter として読まれることがあります。
閉じの前にも BOM があると、共有の単体構文エラーの制約に当たります。
Markdown は最終行の padding を削除し、途中の hidden 境界は残します。
[fixture: info/semicolons/semicolon-style-classdef]
[fixture: info/global-directives/global-config-align]
[fixture: info/final-newline/final-open-global]
[test: info/line-terminators-and-unicode/bom-frontmatter-opening]
[corpus fixture: info/frontmatter-bom-both]
[test: info Markdown: hidden-boundary]
[test: info Markdown: final-hidden-padding]

識別子の付いた読みは仕様に従います。
keyword の atomic cut は拒否のままとし、opaque embedded data、C4 の検出、
裸 percent 後の Unicode は指定された受理に従います。
raw 拒否には raw Db や架空の embedded 効果を補いません。
解析失敗は単体では構文エラーを報告し、Markdown では embedding を辞退します。
payload を修復しません。 [corpus fixture: info/div-directive-flag-middle]
[corpus fixture: info/div-selected-showinfo]
[corpus fixture: info/div-frontmatter-invalid-yaml]
[corpus fixture: info/div-c4container-title]
[corpus fixture: info/div-bare-before-header-ls] [test: info Markdown: rejected]

## Packet の hidden 境界と原綴の block

[packet の規則](./packet.ja.md)は、`packet-beta` を `packet` と印字し、
range・single・relative の3形式を保ちます。
公開行から block を再構成せず、公開上限後の出現も除きません。
同じ label は別々に残し、空の共通代入も残します。
空 title の削除は、それ以前の title を復活させ得るためです。
label の padding、escape、HTML、entity と物理的な継続列は、
書き換えが Db を変え得るため保ちます。
`'` で囲む label は、
[同じに描かれる綴り](#同じに描かれる綴り)に従って `"` で囲んで印字します。
数値は double で丸め・overflow しても原綴です。
指数・Infinity は packet の構文ではありません。
[fixture: packet/block-forms-and-order/block-three-forms]
[fixture: packet/block-forms-and-order/keep-interleaving]
[fixture: packet/block-forms-and-order/cap-unpublished-kept]
[fixture: packet/label-content/label-padding]
[fixture: packet/label-content/label-escapes]
[fixture: packet/numbers/number-precision]
[fixture: packet/numbers/number-overflow]

PacketIgnoredText は native hidden YAML・DIRECTIVE を、
実 frontmatter と Root directive から分けて保持します。
名前付きの所有位置で hidden の範囲全体と、EOF を含む閉じの padding を保ちます。
これらは、後続文に可視 EOL があるかを決め得るためです。
範囲外の必須 LF と端の空行は [packet の Blank lines](./packet.ja.md#blank-lines)
に従います。
内部と閉じの列、保持する見出し前の prefix 全体も保ちます。
無視された YAML を有効な title・設定へ昇格させないためです。
安全な実 frontmatter だけ、guard 付き YAML 整形と正の最小字下げを使います。
packet の列には文法上の意味がないため、本文の `tabWidth: 0` は0桁です。
[fixture: packet/hidden-yaml/yaml-all-range-gaps]
[fixture: packet/hidden-yaml/yaml-suffix-space]
[fixture: packet/hidden-directives/hidden-common-suffixes]
[fixture: packet/hidden-directives/hidden-eof-padding]
[fixture: packet/retained-prefix/prefix-retain]
[fixture: packet/frontmatter-yaml/frontmatter-zero-min]
[fixture: packet/indentation/indent-zero]

共通の行値は外端を詰めますが、次の物理行から値を取りません。
共有の accessibility と説明配置は、空の形と trivia を保ちます。
普通の説明本文の行頭は[説明ブロックの字下げ](#説明ブロックの字下げ)に従い、
ほかの literal と hidden form の継続列は保ちます。
global directive は opaque な内容と接触を保ちます。
init の削除は行設定を変え得ます。
全セミコロンを残し、共有の segment 保護で交差する値・trivia と、
見出し・本文の組を保ちます。
選択セミコロンの削除や trigger の移動は Db を変え得るためです。
物理 EOL、BOM、末尾改行と Markdown 処理は共有です。
Markdown は payload 最終行の padding を trim します。
内部の hidden padding は引き続き必要です。 [fixture: packet/title/title-no-next]
[fixture: packet/accessibility-lines/a11y-empty-next]
[fixture: packet/description-blocks/description-columns]
[fixture: packet/global-directives/global-standalone]
[fixture: packet/semicolons/semicolons-trigger]
[fixture: packet/semicolons/semicolons-component]
[test: packet Markdown: hidden-boundary]
[test: packet Markdown: final-hidden-padding]

6つの[指定読み](./packet.ja.md#specified-readings)が、
keyword・整数の atomic cut、本文だけの frontmatter HTML、
opaque な埋め込みデータ、C4 検出と通過した bare percent trivia を扱います。
受理を変える本文の `packet.bitsPerRow` は指定の比較経路に従い、site 設定、
title と他の設定を残します。
raw 拒否には raw Db や、受理されたとみなす埋め込み効果はありません。
hidden form、空 label と空説明には新たな差異は不要です。
parser の失敗は standalone では出力せず構文エラーを報告し、
Markdown では埋め込みを辞退して payload を修復しません。
[corpus fixture: packet/directive-header-middle]
[corpus fixture: packet/div-selected-title-interior]
[corpus fixture: packet/config-frontmatter-fraction]
[corpus fixture: packet/config-frontmatter-overrides-site]
[corpus fixture: packet/c4container-label] [test: packet Markdown: rejected]

## architecture の値と hidden 境界

[architecture の規則](./architecture.ja.md)は、
角括弧ラベルの全 source 範囲を保ちます。
bare・quoted の kind、引用符の綴り、quoted の空値、escape、HTML、
entity も含みます。
ただし、タイトルや矢印のラベルの括弧に接する空白、タブ、
no-break space は除きます。
[Label content](./architecture.ja.md#label-content) を参照してください。
内側の空白や escape の変換は Db を変え得ます。
文字 icon は StringLiteral の source 全体、名前付き icon は名前を保ちます。
trim、decode、置き換えは mermaid.js の読みを変え得るためです。
`singleQuote` は icon とラベルを書き換えません。
矢印の marker は有無の flag から組み立てず、
逆向きの `>--<` も実際の文字を保ちます。
[fixture: architecture/label-forms/padded-quotes]
[fixture: architecture/label-content/bare-padding]
[fixture: architecture/label-content/html-entities]
[fixture: architecture/text-icons/double-quote]
[fixture: architecture/text-icons/padding]
[fixture: architecture/named-icons/unknown-name]
[fixture: architecture/arrow-lines/arrow-reversed-markers]

native hidden YAML・DIRECTIVE の source 全体を AST の owner に保ち、
範囲外で消費される LF と閉じの padding も保持します。
これらの境界が受理を決め得ます。
見出し自身の hidden form の直後だけ予備の LF は不要で、
見出し行の文は文としての境界を必要とします。
無視された YAML が有効な frontmatter に変わらないよう、
保持する prefix 全体を保ちます。
安全な実際の frontmatter だけを guarded YAML formatter に渡し、
共有の正の最小字下げ幅を使います。
作者のセミコロンはすべて共有の区間保護で保ちます。
選択された1個の削除が別の選択を生み、ラベルを変え得るためです。
source 順、繰り返す制約、空の共通代入も保ちます。
[fixture: architecture/hidden-forms/yaml-named-icon-title-and-parent-gaps]
[fixture: architecture/hidden-boundaries/header-and-statement]
[fixture: architecture/hidden-boundaries/suffix-space]
[fixture: architecture/frontmatter-yaml/prefix-leading-lf-keep]
[fixture: architecture/frontmatter-yaml/frontmatter-zero-minimum-block-scalar]
[fixture: architecture/semicolons/selection]
[fixture: architecture/source-order/authored-order]

既存の5個の[仕様の読み](./architecture.ja.md#specified-readings)を使います。
directive・選択されたセミコロンによる不可分 token の切断、frontmatter の HTML、
不透明な embedded data、通過した bare-percent trivia が対象です。
architecture に受理を決める設定キーはなく、C4 より前に検出するため、
C4 検出の例外は追加しません。
生の拒否から生の Db や架空の効果を作りません。
parser の失敗は単独では修復出力のない構文エラーとなり、
Markdown は埋め込みを辞退します。
Markdown host は payload 最終行の padding を除きますが、
内部の hidden padding は必要です。
[corpus fixture: architecture/div-directive-name]
[corpus fixture: architecture/div-semicolon-parent-id]
[corpus fixture: architecture/div-frontmatter-open-tag-icon]
[corpus fixture: architecture/div-frontmatter-invalid-yaml]
[corpus fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/label-content/hidden-looking]
[test: architecture Markdown: hidden-boundary]
[test: architecture Markdown: final-hidden-padding]
[test: architecture Markdown: rejected]

## radar の原文の群と hidden 境界

[radar の規則](./radar.ja.md)は axis・curve・options の群、entry 形式、
名前つき entry のコロンの有無、反復と原文順をすべて保ちます。
公開値が使わない余分な名前や重複 entry も残します。
数だけの curve と名前つき curve は区別します。
見出しのコロンの有無は保ち、前の普通の空白は gitgraph と同じく詰めます。
単純な十進表記の NumericLiteral の source span は最短の形で印字し、
その他は整数部の先頭のゼロ、丸められる精度、subnormal、underflow、
overflow を保ちます。
double 値から再出力しません。
option の値は作者のままです。
ticks の制限、min・max の並べ替え、描画設定からの置換はしません。
ラベルの StringLiteral は空・空白だけの文字列、escape、HTML、entity を保ち、
ラベルの中の空白とタブの連なりは空白 1 つで印字します。
`'` で囲むラベルは、
[同じに描かれる綴り](#同じに描かれる綴り)に従って `"` で囲んで印字し、
`singleQuote` は読みません。
空ラベルの削除は ID への fallback を変えます。
[fixture: radar/source-order/declaration-order-kept]
[fixture: radar/source-order/mixed-curve-forms]
[fixture: radar/header/join-separated-inline-alternative]
[fixture: radar/numbers/raw-number-forms]
[corpus fixture: radar/db-number-subnormal]
[corpus fixture: radar/db-number-underflow]
[corpus fixture: radar/db-number-overflow]
[fixture: radar/options/option-repetitions]
[fixture: radar/options/min-max-order-kept]
[fixture: radar/quotes/quotes-and-empty] [fixture: radar/quotes/padding-label]
[fixture: radar/quotes/escape-label] [fixture: radar/quotes/label-html-entity]
[fixture: radar/quotes/whitespace-only-labels]

共通行の trim は普通の値の外端だけに適用します。
trivia と semicolon の保護を優先します。
説明は共有のブロック配置を使います。
空白だけの内部は詰め、
普通の本文の字下げは
[説明ブロックの字下げ](#説明ブロックの字下げ)に従ってそろえます。
native hidden form は AST の owner で 1 回だけ印字します。
範囲外の消費 LF と closer 後の空白も残します。
群の最後の member が持つ suffix も、ほかの文と同じ境界規則に渡します。
見出し端の例外は見出し自身の hidden form だけに適用します。
保持された prefix は全体で残し、無視された YAML の frontmatter 昇格を防ぎます。
安全な real frontmatter だけ保護つき YAML 整形を使います。
すべての semicolon は共有の文字区間の保護下に残します。
保護区間内に字下げを足さず、継続列を保ちます。
複数行の文の終端行の semicolon も同じです。
style に似たラベルと結合すると、別の文の値が変わりうるためです。
[fixture: radar/title/title-edge-trim]
[fixture: radar/description-blocks/block-empty-fixed]
[fixture: radar/multiline-values/physical-value-columns]
[fixture: radar/hidden-forms/named-entry-hidden-owners]
[fixture: radar/hidden-boundaries/header-axis-suffix]
[fixture: radar/hidden-boundaries/hidden-title-space]
[fixture: radar/trailing-whitespace/trailing-hidden-eof-kept]
[fixture: radar/retained-prefix/retained-leading-lf]
[fixture: radar/frontmatter-yaml/frontmatter-safe]
[fixture: radar/semicolons/semicolon-selected-kept]
[fixture: radar/multi-line-statements/semicolon-terminal-line]

コメントや directive を含むリストは、ほかの entry の改行も保ちます。
ブロックとして読みやすく残し、独立した閉じ波括弧を文の段にそろえるためです。
コメントのないリストでは、普通の entry の改行は従来どおり結合します。
[fixture: radar/multi-line-statements/entry-comment-after-comma]
[fixture: radar/multi-line-statements/entry-global-lines]

radar は既存の 6 差異の読みを使います。
原子的な directive・除去対象 semicolon の切断は拒否します。
frontmatter の HTML は本文から読み、埋め込みデータは不透明なままです。
検出で通過した bare percent の trivia を保ちます。
C4 keyword で、選択された radar 図を置き換えません。
opaque 比較から除く radar 固有の受理設定 key はありません。
raw の拒否には raw Db がなく、受理された効果を作りません。
空ラベル、空説明、全体の hidden form はノードであり、新しい差異ではありません。
standalone の失敗は構文エラーにし、修復した出力を返しません。
Markdown は埋め込みを辞退します。
物理 CR・CRLF と先頭 BOM は共有 host の制限に従います。
LS・PS は lexer が値として読む場所では値の文字のままです。
Markdown host は最終行の空白を削ります。
途中の共通文 suffix で必要な空白は残します。
[corpus fixture: radar/directive-header-middle]
[corpus fixture: radar/div-semicolon-id]
[corpus fixture: radar/div-html-frontmatter-cross]
[corpus fixture: radar/frontmatter-invalid-keeps-config]
[corpus fixture: radar/bare-before-header-nbsp]
[corpus fixture: radar/c4-component-axis-label]
[corpus fixture: radar/db-empty-labels]
[corpus fixture: radar/common-block-empty-interleaved]
[test: radar/line-terminators-and-unicode/crlf-values]
[test: radar/line-terminators-and-unicode/unicode-values]
[test: radar/line-terminators-and-unicode/leading-bom-header]
[test: radar Markdown: hidden-boundary]
[test: radar Markdown: final-hidden-padding] [test: radar Markdown: rejected]

## treemap の親子と作者の値

[treemap の規則](./treemap.ja.md)は、AST の children にある森の順序を保ちます。
木は、space と tab を各 1 文字と数える、
行の割り当て済みの indent を反映しています。
leaf は section を閉じますが親にはならず、class と common の文は参加しません。
普通の根は設定の正の 1 段に置きます。
字下げが親子を決めるので、tabWidth 0 でも 1 段 1 文字以上です。
class 名と行が接する場合は接触を保ち、図全体の根の基準を 0 にします。
行末や空白行の字下げは、次の行へ一度だけ移します。
独立したコメント行は [Comments](./treemap.ja.md#comments) に従い、
次の文の桁にそろえ、末尾では最後の文の桁にそろえます。
[fixture: treemap/comments/aligned-depths]
[fixture: treemap/comments/aligned-final]
文の間では、裸の `%%`、directive ではない `%%{` の行、
独立した directive を第 1 列に置きます。
字下げすると mermaid.js が拒否するためです。
[fixture: treemap/comments/native-bare]
[fixture: treemap/comments/native-nonword]
[fixture: treemap/comments/unclosed-directive]
[fixture: treemap/comments/mixed-directives]
class のスタイル区切りの独立した trivia とスタイルの継続行は、
`classDef` より1段内側にそろえます。
スタイル本文と、複数行にわたる文の semicolon が保護する区間は変えません。
[fixture: treemap/style-gaps/css-comment]
[fixture: treemap/style-gaps/css-directive-tabs]
[fixture: treemap/style-gaps/css-comment-semicolon-kept]
semicolon が保護する行の境界は、本文の原文を保ちます。

[fixture: treemap/indentation/leaf-closes]
[fixture: treemap/indentation/common-and-class]
[fixture: treemap/indentation/zero] [fixture: treemap/indentation/glued-roots]
[fixture: treemap/carried-indentation/section-space]
[fixture: treemap/carried-indentation/whitespace-line]
[fixture: treemap/comments/carried-space] [fixture: treemap/directives/leading]
[fixture: treemap/semicolons/body-kept]

数は comma、underscore、dot、精度を含む source の綴りを保ちます。
ただし、単純な十進表記は最短の形で印字します。
[同じに描かれる綴り](#同じに描かれる綴り)を参照してください。
数値から印字し直すと、読みが変わったり拒否される構文になったりします。
名前は空名、backslash、entity、HTML、物理継続列を保ち、
名前の中の空白とタブの連なりは空白 1 つで印字します。
`'` で囲む名前は、同じ節に従って `"` で囲んで印字します。
class style は内部と末尾の padding を含め、作者の literal 全体として保ちます。
CSS としては整形しません。
class の再定義、空代入、未解決の selector、元順を保ちます。
common 値と説明ブロックは共有の外側の配置を使い、
内側の文字と trivia を保ちます。
全 semicolon を保ち、複数行にわたる文の保護区間の内部に字下げを足さず、
列を保ちます。

[fixture: treemap/numbers/underscore] [fixture: treemap/numbers/precision]
[fixture: treemap/names/quotes] [fixture: treemap/names/physical-columns]
[fixture: treemap/styles/written] [fixture: treemap/styles/trailing]
[fixture: treemap/source-order/repetitions]
[fixture: treemap/accessibility-lines/title-padding]
[fixture: treemap/description-blocks/continuation]
[fixture: treemap/semicolons/protected-class-column]

既存の 6 つの[指定読み](./treemap.ja.md#specified-readings)に従います。
atomic な directive と選ばれた semicolon の切断は拒否します。
frontmatter の HTML 引用符の影響を分離し、埋め込みを opaque とします。
検出で通過した bare percent の trivia は再読せず、後の C4 語で図種を変えません。
treemap に native hidden YAML や directive の node はありません。
opaque 比較で除く受理設定もありません。
拒否入力の修復出力は作りません。
raw で拒否された入力には raw Db がなく、
corpus が記録する受理された指定読みを比較に使います。
共有の host は CR と CRLF を正規化し、
実際の frontmatter YAML に guard を使います。
最後の Markdown コード行の padding は、style の末尾も含めて除かれえます。

[corpus fixture: treemap/directive-header-middle]
[corpus fixture: treemap/div-semicolon-number-atom]
[corpus fixture: treemap/div-html-frontmatter-reverse]
[corpus fixture: treemap/div-frontmatter-invalid]
[corpus fixture: treemap/bare-before-header-space]
[corpus fixture: treemap/c4-component-section]
[corpus fixture: treemap/hidden-yaml-body]
[fixture: treemap/frontmatter-yaml/html-guard]
[test: treemap/line-terminators-and-unicode/crlf-values]
[test: treemap Markdown: final-style-padding] [test: treemap Markdown: rejected]

## Treeview modes and authored values

[treeview の規則](./treeview.ja.md)は字下げモードの入力をそのモードに保ちます。
罫線の図は、file の親も含めて AST の children から森を読み、
普通の枝と案内線を固定の 4 列の部品で描き直します。
次の兄弟があれば `├── `、最後なら `└── `、続く祖先の段は `│   ` です。
枝付きや混在の根は全部に枝を付け、
それ以外は根と第 1 世代の枝を第 1 列に置きます。
誤った見た目の列、兄弟の印、太さと dash の数を、読む木の形に置き換えます。
同じ物理行のノードも原順で行を分け、その木から枝を描きます。

[fixture: treeview/statements-one-per-line/review159-box-quoted-line-rule-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-two]

[fixture: treeview/statements-one-per-line/review159-box-quoted-three]

[fixture: treeview/statements-one-per-line/review159-box-quoted-wide-gap]

[fixture: treeview/statements-one-per-line/review159-box-quoted-class]

[fixture: treeview/statements-one-per-line/review159-box-quoted-forest]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unbranched-root]

[fixture: treeview/statements-one-per-line/review159-box-quoted-inline-directive]

[fixture: treeview/statements-one-per-line/review159-box-quoted-directive-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-unselected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-protected-semicolon]

[fixture: treeview/statements-one-per-line/review159-box-quoted-comment-line]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-line]

[test: treeview/statements-one-per-line/review159-box-quoted-ls]

[test: treeview/statements-one-per-line/review159-box-quoted-unprefixed-leading-ps]

[test: treeview/statements-one-per-line/review159-box-quoted-ps]

[fixture: treeview/statements-one-per-line/review159-box-quoted-empty-block]

[test: treeview/tabs/review159-box-multiple-value-tab-retained]

[test: treeview/trailing-whitespace/review159-box-multiple-owned-tail-retained]

[fixture: treeview/branch-prefixes/rounding-half]
[fixture: treeview/branch-prefixes/first-positive]
[fixture: treeview/branch-prefixes/box-redraw-deep-jump]
[fixture: treeview/branch-prefixes/box-redraw-mixed-roots]
[fixture: treeview/branch-prefixes/box-redraw-heavy-to-light]

[corpus fixture: treeview/nested-box-directive-line]

[corpus fixture: treeview/nested-box-selected-semicolon]

[corpus fixture: treeview/nested-box-comment-line]

[corpus fixture: treeview/nested-box-empty-line]

[corpus fixture: treeview/nested-box-ls]

[corpus fixture: treeview/nested-box-ps]

[corpus fixture: treeview/nested-box-empty-block]

[corpus fixture: treeview/box-physical-directive-inline]

[corpus fixture: treeview/box-physical-directive-line]

[corpus fixture: treeview/box-physical-selected-semicolon]

[corpus fixture: treeview/box-physical-comment-line]

[corpus fixture: treeview/box-physical-empty-line]

[corpus fixture: treeview/box-physical-ls]

[corpus fixture: treeview/box-physical-ps]

[corpus fixture: treeview/box-physical-empty-description]

外側の装飾は続く案内線か空行にし、モードの選択に必要な装飾は残します。
`accDescr` の opener の gap にある唯一の選び手は gap だけを保ち、
それ以外の構造は説明ブロックの規則で整え、罫線モードの本文は元の列を保ちます。
共通文と native comment の prefix を外し、
コメントが運んだ枝はノードへ 1 回描きます。
枝付き注釈は、前に description が無く、
間に共有の trivia や選ばれる semicolon が無い場合だけ、原順で同じ行へ寄せます。
字下げモードの注釈の行は分けたままです。
comment region や除かれた directive の後の物理行から始まる注釈は、
前置の spaces を所有ノードの名前の列に揃え、最低 1 space を残します。
LF がつながっても注釈の印を前の名前と分けて読むためです。
名前、値、注釈の各出現、prefix の任意文字と共有の trivia は原文として保ちます。

[fixture: treeview/decorations/review159-sole-opener-selector-line-rule-semicolon]

[fixture: treeview/decorations/review159-sole-opener-selector]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-block]

[fixture: treeview/decorations/review159-sole-opener-selector-inline-directive]

[fixture: treeview/decorations/review159-sole-opener-selector-directive-line]

[fixture: treeview/decorations/review159-sole-opener-selector-comment]

[fixture: treeview/decorations/review159-sole-opener-selector-empty-line]

[test: treeview/decorations/review159-sole-opener-selector-ls]

[test: treeview/decorations/review159-sole-opener-selector-ps]

[fixture: treeview/decorations/review159-sole-opener-selector-value-prefix]

[test: treeview/annotation-lines/review159-region-line-rule-semicolon]

[test: treeview/annotation-lines/review159-region-class-ls-four]

[test: treeview/annotation-lines/review159-region-class-ps-four]

[test: treeview/annotation-lines/review159-region-class-ls-one]

[test: treeview/annotation-lines/review159-region-class-ps-one]

[test: treeview/annotation-lines/review159-region-class-ls-tab]

[test: treeview/annotation-lines/review159-region-class-ps-tab]

[test: treeview/annotation-lines/review159-region-icon-ls-four]

[test: treeview/annotation-lines/review159-region-icon-ps-four]

[test: treeview/annotation-lines/review159-region-icon-ls-one]

[test: treeview/annotation-lines/review159-region-icon-ps-one]

[test: treeview/annotation-lines/review159-region-icon-ls-tab]

[test: treeview/annotation-lines/review159-region-icon-ps-tab]

[test: treeview/annotation-lines/review159-region-description-ls-four]

[test: treeview/annotation-lines/review159-region-description-ps-four]

[test: treeview/annotation-lines/review159-region-description-ls-one]

[test: treeview/annotation-lines/review159-region-description-ps-one]

[test: treeview/annotation-lines/review159-region-description-ls-tab]

[test: treeview/annotation-lines/review159-region-description-ps-tab]

[test: treeview/annotation-lines/review159-region-unbranched-root-class-ls]

[test: treeview/annotation-lines/review159-region-unbranched-root-icon-ps]

[test: treeview/annotation-lines/review159-region-unbranched-root-description-ls]

[test: treeview/annotation-lines/review159-region-forest-class-ps]

[test: treeview/annotation-lines/review159-region-forest-icon-ls]

[test: treeview/annotation-lines/review159-region-forest-description-ps]

[test: treeview/annotation-lines/review159-region-unprefixed-quoted-ls]

[test: treeview/annotation-lines/review159-region-quoted-class-ls]

[test: treeview/annotation-lines/review159-region-quoted-icon-ps]

[test: treeview/annotation-lines/review159-region-quoted-description-ls]

[test: treeview/annotation-lines/review159-region-repeated-classes-ps]

[test: treeview/annotation-lines/review159-region-directive-inline]

[test: treeview/annotation-lines/review159-region-protected-semicolon]

[test: treeview/annotation-lines/review159-region-unselected-semicolon]

[test: treeview/annotation-lines/review159-region-empty-block]

[test: treeview/annotation-lines/review159-region-value-prefix-and-protected-row]

[fixture: treeview/decorations/box-redraw-decorations-guides]
[fixture: treeview/decorations/box-redraw-sole-selector-after-empty-block]
[fixture: treeview/comments/box-redraw-move-comment-prefix-once]
[fixture: treeview/annotation-lines/box-redraw-join-prefixed-class]
[fixture: treeview/annotation-lines/box-redraw-keep-after-description]
[fixture: treeview/annotation-lines/box-redraw-keep-comment-between]

[fixture: treeview/decorations/box-redraw-annotation-blank-repeat]

[fixture: treeview/decorations/box-redraw-annotation-blank-and-gap]

[fixture: treeview/decorations/box-redraw-annotation-blank-before-comment]

[fixture:
treeview/decorations/box-redraw-annotation-blank-before-directive-line]

[fixture:
treeview/decorations/box-redraw-annotation-blank-after-inline-directive]

[fixture: treeview/decorations/box-redraw-annotation-blank-at-eof]

[fixture: treeview/decorations/box-redraw-annotation-blank-with-protected-name]

[test: treeview/decorations/box-redraw-annotation-blank-ls]

[test: treeview/decorations/box-redraw-annotation-blank-ps]

prefix と装飾の trivia、prefix の任意文字、固定された行の境界、
危険な注釈の移動、モードの喪失や値の読みの変化があれば本文を保ちます。
行分けで名前の先頭の Unicode 空白が新しい枝なしの行に露出する場合も同じです。
値内の prefix と装飾は綴りを保ち、予定した最初の正の branch 列の幅でも、
その indent の読みが変わらないことを確認します。
枝の追加や除去で値の tab や末尾の読みも変えません。
共有の semicolon の保護とこれらの条件は重ねて適用します。
本文を保った図には見た目の不一致が残りえます。
見た目を強制するために作者の文字を捨てることはしません。

[fixture: treeview/branch-prefixes/box-redraw-arbitrary-and-value-width]
[fixture: treeview/multiline-values/box-redraw-value-width-changes]
[fixture: treeview/multiline-values/box-redraw-value-width-and-protected-line]
[fixture: treeview/semicolons/box-redraw-protected-value-on-enclosed-prefix-line]
[fixture: treeview/branch-prefixes/box-redraw-trivia-after-dashes-name]
[corpus fixture: treeview/box-tabs-after-selected-semicolon]

[fixture: treeview/annotation-lines/box-redraw-keep-inline-directive-between]

[fixture: treeview/annotation-lines/box-redraw-keep-directive-line-between]

[fixture: treeview/annotation-lines/box-redraw-keep-selected-semicolon-between]

[fixture:
treeview/branch-prefixes/box-redraw-prefix-trivia-and-value-protection]

[fixture: treeview/semicolons/box-redraw-arbitrary-prefix-on-protected-line]

[fixture: treeview/tabs/box-redraw-joined-description-value-tab-kept]

[fixture: treeview/tabs/box-redraw-joined-description-directive-tab]

既存の六つの[仕様上の読み](./treeview.ja.md#specified-readings)、
frontmatter の guard、
共有の CR・CRLF の処理と Markdown の最終行の trim は維持します。
拒否される単独入力は構文エラーのままとし、修復しません。

[corpus fixture: treeview/directive-header-inside]
[corpus fixture: treeview/semicolon-class-inside]
[corpus fixture: treeview/div-html-frontmatter-reject]
[corpus fixture: treeview/div-frontmatter-invalid]
[corpus fixture: treeview/bare-line-nbsp]
[corpus fixture: treeview/c4-container-bare]
[test: treeview Markdown: final-bare-padding]
[test: treeview Markdown: rejected]

## railroad の方言と書かれた値

[railroad の規則](./railroad.ja.md)は、選ばれた IR、EBNF、ABNF、PEG の見出し、
代入記号、EBNF の任意 comma、式の構造を保ちます。
正規化した Db が同じでも singleton の call と group は残します。
規則、選択肢、metadata の繰返しと空の reset を出現順に保ちます。
比較 Db は本文の title を除きますが、その内容を削除する許可にはなりません。
[fixture: railroad/assignment/ebnf-spellings]
[fixture: railroad/ebnf-sequences/mixed] [fixture: railroad/calls/ir-singletons]
[fixture: railroad/groups/peg-delimiters] [fixture:
railroad/source-order/ir-duplicates]
[fixture: railroad/source-order/ebnf-duplicates]
[fixture: railroad/source-order/abnf-duplicates] [fixture:
railroad/source-order/peg-duplicates] [fixture: railroad/title/ir-trim]

通常の IR 複合呼出しは、文法の階層を示すため、常に引数を入れ子の行にします。
`printWidth` や元の空白による改行には依存しません。
値は分割せず、末尾 comma は加えません。
通常の `terminal`、`nonterminal`、`special` は引用値とコンパクトにまとめます。
呼出しの境界にコメント、global directive、native hidden form があれば、
その leaf 呼出しも複数行にします。
呼出しの隙間では外側の空白を統一し、trivia の内容、内部の接触、
元の改行を保ちます。
native hidden form は内部の global directive も含めて全体を opaque
な項目として保ち、周囲の文法を構造に沿って字下げします。
constructor の後ろに改行があれば、両方の括弧を継続行として字下げし、
引数をさらに1段深く置きます。
値の中の semicolon は、この配置を妨げません。
`style` や `classDef` を含む行と無視される semicolon は、
保護した配置を使います。
EBNF、ABNF、PEG は平坦な配置を保ちます。
[fixture: railroad/comments/ir-leaf-value-comments]
[fixture: railroad/comments/ir-leaf-boundary-comments]
[fixture: railroad/hidden-forms/ir-call-global-inside-native]
[fixture: railroad/hidden-forms/ir-call-native-yaml]
[fixture: railroad/long-lines/ir-expression-grammar]
[fixture: railroad/long-lines/ir-written-breaks]
[fixture: railroad/long-lines/ir-unary-width]
[fixture: railroad/long-lines/ir-comments-kept]
[fixture: railroad/comments/ir-call-inline-spacing]
[fixture: railroad/comments/ir-call-comment-lines]
[fixture: railroad/comments/ir-call-constructor-nested]
[fixture: railroad/global-directives/ir-call-boundaries]
[fixture: railroad/long-lines/ir-directive-kept]
[fixture: railroad/long-lines/ir-hidden-kept]
[fixture: railroad/long-lines/ir-semicolon-kept]
[fixture: railroad/long-lines/ebnf-width]
[fixture: railroad/long-lines/abnf-width]
[fixture: railroad/long-lines/peg-width]

文字列は source span 全体を保ちます。
空値、空白だけの値、escape、HTML、entity、継続列も対象です。
`'` で囲む IR、EBNF、PEG の文字列は、
[同じに描かれる綴り](#同じに描かれる綴り)に従って `"` で囲んで印字し、
`singleQuote` は読みません。
ABNF は backslash を普通の文字として読み、他の3方言は escape として読みます。
ABNF の repeat は先頭ゼロ、上下限の省略、exact 形、巨大な整数を保ちます。
numeric value は base letter の大小、数字、dot、
hyphen を raw text として保ちます。
EBNF の special sequence は外端の空白も含め、span 全体を保ち、
内部の空白とタブの連なりは空白 1 つで印字します。
これらの表記の変換や値の reflow で Db が変わることがあります。
PEG predicate は公開 label から再構築せず、書かれた operand 全体を残します。
[fixture: railroad/quotes/ir-escape] [fixture:
railroad/quotes/ebnf-escape] [fixture: railroad/quotes/abnf-backslash] [fixture:
railroad/quotes/peg-escape] [fixture: railroad/quotes/ir-empty-and-text]
[fixture:
railroad/quotes/ebnf-empty-and-text] [fixture:
railroad/quotes/abnf-empty-and-text]
[fixture: railroad/quotes/peg-empty-and-text]
[fixture: railroad/repeats/abnf-spellings] [fixture:
railroad/repeats/abnf-zero] [fixture: railroad/repeats/abnf-large] [fixture:
railroad/numeric-values/abnf-spellings] [fixture:
railroad/special-sequences/ebnf-content] [fixture:
railroad/multiline-values/peg-columns] [fixture: railroad/predicates/peg-nested]

コメントの形と内容も書かれたままにします。
全方言の `%%`、IR の C comment、EBNF の C と ISO comment、
ABNF の semicolon 行コメント、PEG の hash 行コメントが対象です。
LS と PS は native line comment の内容として保ちます。
裸の ABNF `;` は句読点であり、終端の直後は LF または EOF にします。
規則の必須の可視 `;` は安全な場所で定義に付けます。
通常の IR 規則は、値の中の semicolon によって配置を固定しません。
その他の semicolon は共有の区間保護に従い、交差する値も保ちます。
保護した区間の最初の行は他の平坦な図種と同じく本文の1段に揃え、
2行目以降は書かれた列を保ちます。
global directive を除いた後に文字列 style または classDef を含む原文の行は、
すべての文、コメント、native hidden form、内部の空白を書かれたまま保ちます。
前後の行とは結合しません。
directive の除去で語が複数の行をまたいでできる場合は、その行をすべて保ちます。
[fixture: railroad/semicolons/ir-word-unclosed-directive-lines]
[fixture: railroad/semicolons/ebnf-word-unclosed-directive-lines]
[fixture: railroad/semicolons/abnf-word-unclosed-directive-lines]
[fixture: railroad/semicolons/peg-word-unclosed-directive-lines]
ここでいう行は、mermaid.js が1行として読む範囲全体です。
U+2028 や U+2029 の後の comment line が語を含む行の前、後、両方をつなぐ場合は、
つながる原文の行をすべて保ちます。
最初の行の字下げは本文の1段に揃え、中身と2行目以降の列は書かれたままです。
[test: railroad/semicolons/ir-style-comment-before-ls]
[test: railroad/semicolons/ir-style-comment-after-ls]
[test: railroad/semicolons/ir-style-comment-both-ls]
[test: railroad/semicolons/ir-classdef-comment-before-ps]
[test: railroad/semicolons/ir-classdef-comment-after-ps]
[test: railroad/semicolons/ir-classdef-comment-both-ps]
[test: railroad/semicolons/ebnf-style-comment-before-ls]
[test: railroad/semicolons/ebnf-style-comment-after-ls]
[test: railroad/semicolons/ebnf-style-comment-both-ls]
[test: railroad/semicolons/ebnf-classdef-comment-before-ps]
[test: railroad/semicolons/ebnf-classdef-comment-after-ps]
[test: railroad/semicolons/ebnf-classdef-comment-both-ps]
[test: railroad/semicolons/abnf-style-comment-before-ls]
[test: railroad/semicolons/abnf-style-comment-after-ls]
[test: railroad/semicolons/abnf-style-comment-both-ls]
[test: railroad/semicolons/abnf-classdef-comment-before-ps]
[test: railroad/semicolons/abnf-classdef-comment-after-ps]
[test: railroad/semicolons/abnf-classdef-comment-both-ps]
[test: railroad/semicolons/peg-style-comment-before-ls]
[test: railroad/semicolons/peg-style-comment-after-ls]
[test: railroad/semicolons/peg-style-comment-both-ls]
[test: railroad/semicolons/peg-classdef-comment-before-ps]
[test: railroad/semicolons/peg-classdef-comment-after-ps]
[test: railroad/semicolons/peg-classdef-comment-both-ps]
共有の kept-line 配置に従い、交差する文や不可分な値・trivia も全体を保ちます。
mermaid.js は、そのような行の最後の semicolon を無視し得ます。
railroad では規則の必須終端や ABNF のコメントの印がその対象になり得るため、
行を変えると規則が拒否されたり、コメントがコードとして読まれたりします。
原文を保つことで、移した後の行規則を予測せずに両方を守ります。
払うものは、名前、文字列、コメントにこれらの文字列を含む行が、
colon や hash がなくても整形されないことです。
その他の行は通常どおり整形します。
除かれる directive の中にしかない語は、行を保つ対象にしません。
[fixture: railroad/comments/ir-positions]
[fixture: railroad/comments/ebnf-positions]
[fixture: railroad/comments/abnf-positions] [fixture:
railroad/comments/peg-positions] [fixture:
railroad/comments/abnf-before-terminator] [fixture:
railroad/statements-one-per-line/abnf-terminators] [fixture:
railroad/semicolons/ir-value-last-line] [fixture:
railroad/semicolons/ebnf-special-last-line] [fixture:
railroad/semicolons/abnf-protected] [fixture:
railroad/semicolons/peg-value-last-line]
[fixture: railroad/semicolons/ir-style-call-close]
[fixture: railroad/semicolons/abnf-style-group-newline]
[fixture: railroad/semicolons/ir-protected-rule-indent]
[fixture: railroad/semicolons/ir-protected-multiline-indent]
[fixture: railroad/semicolons/ir-leading-c]
[fixture: railroad/semicolons/ebnf-leading-iso]
[fixture: railroad/semicolons/ebnf-leading-c]
[fixture: railroad/semicolons/abnf-leading-hidden]
[fixture: railroad/semicolons/peg-leading-hidden]
[fixture: railroad/semicolons/ir-leading-multiline-c]
[fixture: railroad/semicolons/ir-header-leading-c]
[fixture: railroad/semicolons/ir-leading-directive-c]
[fixture: railroad/semicolons/ir-after-rule]
[fixture: railroad/semicolons/ebnf-after-description]
[fixture: railroad/semicolons/abnf-after-description]
[fixture: railroad/semicolons/peg-after-rule-name]
[fixture: railroad/semicolons/ir-kept-description-hidden]
[fixture: railroad/semicolons/ebnf-comment-after-moved-rule]
[fixture: railroad/semicolons/abnf-removed-directive-word]
[fixture: railroad/semicolons/peg-directive-split-style]
[fixture: railroad/semicolons/ebnf-terminator-after-hash]
[fixture: railroad/semicolons/ir-assignment-after-word]
[fixture: railroad/semicolons/abnf-comment-marker-spaced]
[fixture: railroad/semicolons/abnf-comment-marker-multiline]
[fixture: railroad/semicolons/ir-word-multiple-statements]
[fixture: railroad/semicolons/abnf-word-multiple-statements]
[fixture: railroad/semicolons/peg-word-quoted]
[fixture: railroad/semicolons/ebnf-word-rule-name]
[fixture: railroad/semicolons/ir-word-comment-line]
[fixture: railroad/semicolons/ebnf-word-directive-lines]
[fixture: railroad/semicolons/abnf-word-neighbor-boundaries]
[fixture: railroad/semicolons/peg-word-middle-line]

common line と説明ブロックは共有の配置に従います。
hidden YAML と native directive は AST の owner ごとに RailroadIgnoredText の
span 全体を保ち、range 外の消費 LF と closing padding も残します。
見出し自身の form だけに header-edge の例外を使います。
本文の form は、見出しの行から文を移した後も共有の予備 LF 規則に従います。
保持 prefix 全体を保ち、無効だった YAML が frontmatter になるのを防ぎます。
安全な実際の frontmatter だけを guard 付き YAML 整形に通します。
物理 CR と CRLF、先頭 BOM、Markdown 本文末尾の padding は、
共有 host の制限に従います。 [fixture: railroad/description-blocks/ir-edges]
[fixture:
railroad/hidden-forms/ir-owners] [fixture: railroad/hidden-forms/ebnf-owners]
[fixture: railroad/hidden-forms/abnf-owners] [fixture:
railroad/hidden-forms/peg-owners] [fixture:
railroad/hidden-boundaries/ir-moved-before-hidden] [fixture:
railroad/hidden-boundaries/ebnf-moved-before-hidden] [fixture:
railroad/hidden-boundaries/abnf-moved-before-hidden] [fixture:
railroad/hidden-boundaries/peg-moved-before-hidden] [fixture:
railroad/retained-prefix/ir-leading] [fixture:
railroad/frontmatter-yaml/abnf-safe] [test:
railroad/line-terminators-and-unicode/ir-cr] [test:
railroad/line-terminators-and-unicode/ebnf-leading-bom]
[test: railroad Markdown:
abnf-final-hidden-padding]

既存の6つの[仕様による読み](./railroad.ja.md#仕様による読み)は、
atom 内の directive と選択された semicolon の分割を拒否し、
frontmatter の HTML quote の影響を分け、埋込みデータを opaque にし、
検出で通過した bare-percent trivia を保ち、後の C4 語でも railroad を保ちます。
opaque 比較から除く railroad の受理設定 key はありません。
空文字列は値として保ち、空 call は拒否し、新しい差異は加えません。
raw の拒否に raw Db や架空の受理効果はありません。
拒否される単体入力は修復出力なしで構文エラーを返し、
Markdown は埋込み整形を辞退します。 [corpus fixture:
railroad/ir-div-directive-header] [corpus fixture:
railroad/abnf-div-semicolon-repeat-number] [corpus fixture:
railroad/ebnf-div-html-frontmatter-rule-reject] [corpus fixture:
railroad/peg-config-init-fontfamily-number] [corpus fixture:
railroad/ir-bare-nbsp] [corpus fixture:
railroad/peg-c4-deployment-predicate] [corpus fixture:
railroad/ir-error-empty-call] [test: railroad Markdown: ir-rejected]

## Wardley の原文と必須の改行

[Wardley の規則](./wardley.ja.md)は名前、文字列、数の原綴、原順、
全出現を保ちます。
bare 名がちょうど `title` のときは、後続部品との接し方を保ちます。
空白を入れると component、link、evolve、
evolution stage が metadata に変わることがあるためです。
引用名と長い bare 名には普通の空白を置きます。
[fixture: wardley/name-boundaries/component-title-contact]
[fixture: wardley/name-boundaries/link-title-contact]
[fixture: wardley/name-boundaries/title-evolve-hidden]
[fixture: wardley/name-boundaries/stage-title-contact]
[fixture: wardley/name-boundaries/force-title-contact]
[fixture: wardley/name-boundaries/quoted-title]
[fixture: wardley/name-boundaries/title-prefix-safe]

flow の内部は空ラベル、backslash、継続行の列を含め、書かれたまま保ちます。
link の文法上のラベル開始 `;` は前の部品に付け、後ろは物理行末まで保ちます。
空白だけのラベルと末尾 padding も含み、裸の `;` は拒否されます。
共有の textual-prefix 保護はその開始印を除外します。
後続のセミコロンは区間と交差する値と trivia 全体を保護します。
Db に影響するのが片方だけでも、両ラベルと port を残します。
[fixture: wardley/flows/flow-ports-and-label]
[fixture: wardley/flows/flow-padding-escapes]
[fixture: wardley/multiline-values/multiline-flow-columns]
[fixture: wardley/semicolon-labels/label-exterior]
[fixture: wardley/semicolon-labels/label-whitespace]
[fixture: wardley/semicolon-labels/label-two-semicolons]
[corpus fixture: wardley/tail-link-empty-label]

global directive を除いた後でセミコロンと literal の `style` か `classDef`
の両方を含む原文行は、共有の行保護で文、コメント、
hidden form を含めて丸ごと保ちます。
そのセミコロンが選ばれなくても同じです。
セミコロンがない行では、
名前に `mystyle` を含む component や pipeline も通常どおり整形します。
[fixture: wardley/semicolons/style-no-semicolon-directive-lines]
[fixture: wardley/semicolons/style-pipeline-header]
[fixture: wardley/semicolons/style-pipeline-child]
最初の行は本文の段に揃え、中身と後続行の列は保ち、前後の行と結びません。
directive をまたぐ語と U+2028/U+2029 後の comment-region の結合も、
mermaid が 1 行として読む範囲で数えます。
行規則が文法上のラベル開始を無視して端点やラベルを変えることがあるため、
原文行を丸ごと保ち、移動後の効き方を予測する必要をなくします。
除去する global directive の内部だけにある語は、行を保護する理由にしません。
[fixture: wardley/semicolons/style-selected-delimiter]
[fixture: wardley/semicolons/style-delimiter-hash-after]
[fixture: wardley/semicolons/style-colon-space-nontrigger]
[fixture: wardley/semicolons/style-no-semicolon]
[fixture: wardley/semicolons/style-header-group]
[fixture: wardley/semicolons/style-directive-lines]
[test: wardley/semicolons/style-comment-before-connected]
[test: wardley/semicolons/style-comment-ls-connected]
[test: wardley/semicolons/style-comment-both-connected]
[fixture: wardley/semicolons/style-inside-global]

hidden form は木の owner で source span を保ち、
消費 LF と closing padding を共有規則で保護します。
pipeline の開き括弧と子文には、幅 0 でも可視 LF が必要です。
hidden form の LF では代用できません。
見出し自身の form だけに header-edge の例外を使います。
保持 prefix 全体を残し、無視する YAML が実フロントマターになるのを防ぎます。
安全な実 YAML だけを guarded 整形に通し、
説明ブロックも共有の layout を使います。
[fixture: wardley/pipeline/pipeline-zero]
[fixture: wardley/hidden-boundaries/hidden-pipeline-opening]
[fixture: wardley/hidden-boundaries/hidden-pipeline-child]
[fixture: wardley/hidden-boundaries/header-first-statement-hidden]
[fixture: wardley/frontmatter-yaml/retained-prefix]
[fixture: wardley/frontmatter-yaml/frontmatter-safe]
[fixture: wardley/accessibility/description-empty]

既存の 6 つの[仕様による読み](./wardley.ja.md#仕様による読み)を使います。
atom 内の directive と選択したセミコロンの分割、フロントマターの HTML、
不透明な埋め込みデータ、通過した bare-percent trivia、後の C4 語が対象です。
Wardley は差異と opaque な受理設定キーを足しません。
raw の拒否に raw Db はありません。
解析失敗は単独ファイルでは出力せず構文エラーにし、
Markdown では埋め込みを断ります。
CR/CRLF と先頭 BOM は共有の host 制限に従います。
Markdown は最後の code 行を trim します。
空白だけのラベルを落とすと裸の `;` が残り、受理された payload が拒否されます。
単独ファイルではその padding を保ちます。
[corpus fixture: wardley/directive-arrow-inside]
[corpus fixture: wardley/lex-selected-decimal-inside]
[corpus fixture: wardley/div-html-frontmatter-reject]
[corpus fixture: wardley/config-fontfamily-keeps-title]
[corpus fixture: wardley/bare-before-ls]
[corpus fixture: wardley/c4-component-component]
[test: wardley Markdown: rejected]
[test: wardley/line-terminators-and-unicode/crlf-string]
[test: wardley Markdown: final-whitespace-label]

## cynefin の書かれた領域と hidden の境界

native の suffix が行を保つ場合も、
semicolon で保護した prefix は一度だけ印字し、suffix の owner を保ちます。

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-directive]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-header-yaml]

[fixture: cynefin/hidden-boundaries/semicolon-hidden-body-yaml]

[cynefin の規則](./cynefin.ja.md)は見出しの二形、領域の再宣言と空領域、
項目の順と重複、自己遷移、空ラベル、共通文のリセットを残します。
領域と項目の行は木を示すもので、列が親を選ぶわけではありません。
有効な Db からの再構築は出現を失い、置換やリセットの読みを変え得ます。
文字列は空の値や native form に見える文字も含め、escape、内部の列を保ちます。
`'` で囲む文字列は、
[同じに描かれる綴り](#同じに描かれる綴り)に従って `"` で囲んで印字します。
[fixture: cynefin/empty-domains/empty-domain-last-reset]
[fixture: cynefin/redeclarations/domain-repeat-order]
[fixture: cynefin/transition-occurrences/transition-occurrences]
[fixture: cynefin/source-order/source-common-empty-resets]
[fixture: cynefin/strings/strings-quote-backslash]
[fixture: cynefin/multiline-values/multiline-string-columns]

native hidden form は各 AST owner に残します。
prefix、本文、名前の suffix、項目の先頭・末尾、遷移の隙間、
共通文の suffix です。
source は一度だけ印字し、内部と closer の列、範囲外の消費 LF、
必要な closing padding を保ちます。
遷移と共通文には可視 EOL が要り、領域と項目には不要です。
見出しの端の例外は見出し自身の form だけに適用します。
保つ行では項目の suffix form も含め、見出し、領域の開き、
項目に同じ判断を使います。
子の移動によって親の保護を失わないためです。
無視された YAML を有効な frontmatter にしないよう、
skip された prefix 全体を保ちます。
安全な real YAML と説明ブロックは共有 layout を使います。
[fixture: cynefin/hidden-forms/hidden-domain-name]
[fixture: cynefin/hidden-forms/hidden-between-items]
[fixture: cynefin/hidden-forms/hidden-body-after-last-item]
[fixture: cynefin/hidden-forms/hidden-transition-all-gaps]
[fixture: cynefin/hidden-boundaries/boundary-suffix-directive-spare]
[fixture: cynefin/hidden-boundaries/boundary-suffix-yaml-tab]
[fixture: cynefin/hidden-boundaries/boundary-header-body-suffix]
[fixture: cynefin/hidden-boundaries/header-inline-domain-item-directive]
[fixture: cynefin/hidden-boundaries/header-inline-domain-item-yaml]
[fixture: cynefin/retained-prefix/prefix-retained-yaml]
[fixture: cynefin/frontmatter-yaml/frontmatter-safe-yaml]
[fixture: cynefin/description-blocks/description-empty]

書かれた semicolon はすべて残します。
保持する `;` がある segment は、行の規則が無視する `;` が変わりうる場合を除き、
ほかと同じように整形します（[Semicolons](./cynefin.ja.md#semicolons)を参照）。
除去される directive と comment の結合を含め、
segment は mermaid の読みで決まります。
cynefin に文法上の semicolon はないため、
semicolon のない style・classDef の語の行も整形し、
語を含む行全体の保持は適用しません。
同じ印字行の中の Root directive は、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
文や項目を行に分ける所では directive を次の単位に付け、右側を保ち、
左側の接触は切れます。
native comment は LS・PS を内容に残します。
これらの境界は選択、値、受理を変え得るためです。
[fixture: cynefin/semicolons/semi-selected-before-arrow]
[fixture: cynefin/semicolons/semi-item-body-indentation]
[fixture: cynefin/semicolons/semi-plain-style-line-formats]
[fixture: cynefin/semicolons/semi-multiline-global-word]
[fixture: cynefin/global-directives/between-items-contact]
[test: cynefin/comments/comment-ls-native-content]
[test: cynefin/comments/comment-unicode-join]

既存の[六つの指定読み](./cynefin.ja.md#specified-readings)は、atom 内の cut、
frontmatter の HTML、opaque embedded data、passed bare-percent trivia、
C4 の語を扱います。
raw 拒否には raw Db がなく、
cynefin 固有の差異や acceptance-setting key は加えません。
単独の parse 失敗は構文エラーを通じてファイルを変えず、
Markdown は embedding を辞退します。
CR・CRLF と先頭 BOM は共有の host の制限に従います。
Markdown は最終 code line の hidden padding を削りますが、単独整形では保ち、
必要な内部の padding も保護します。
[corpus fixture: cynefin/directive-arrow-inside]
[corpus fixture: cynefin/semicolon-arrow-inside]
[test: cynefin/specified-readings/divergence-html-cross]
[test: cynefin/specified-readings/divergence-opaque-yaml]
[test: cynefin/specified-readings/divergence-c4-string]
[test: cynefin/specified-readings/divergence-bare-unicode]
[test: cynefin/line-terminators-and-unicode/eol-crlf-string]
[test: cynefin Markdown: final-hidden-padding]
[test: cynefin Markdown: rejected]

## Eventmodeling terminals and source boundaries

eventmodeling の[規則](./eventmodeling.ja.md)は、
[Data blocks](./eventmodeling.ja.md#data-blocks) の限定的な ASCII 空白 margin
変更を除き、inline data と block の内容を保ちます。
この変更は空でない本文行をすべて `tabWidth` 個、
通常の見出しの継続行が残る場合は `2 * tabWidth` 個の空白で字下げし、データ項目、
JSON、code の構造は解釈しません。
見出しへ結合される通常の LF や inline directive 内部の LF では段を増やさず、
native hidden を含む見出しは従来の本文の段を保ちます。
[fixture: eventmodeling/declarations-and-notes/header-directive-continuation]
[fixture: eventmodeling/declarations-and-notes/header-inline-multiline-directive]
[fixture: eventmodeling/declarations-and-notes/header-continuation-tabs]
[fixture: eventmodeling/declarations-and-notes/data-and-note-headers]
[fixture: eventmodeling/hidden-forms/hidden-data-tag-owners]

この変更は描画を保ちながら raw Db 値を変える場合がありますが、parser、仕様、
記録された Mermaid の読みは変えません。
ほかの payload の文字、引用符、波括弧、空行、行末の空白、
見かけの後続文は保ちます。
tag は引き続き整形できます。
block-data は直後の LF を消費し、それ以外の空白は lookahead です。
閉じの空白と LS・PS の境界は EOF でも保ちます。
block closer の字下げは拒否を、
lookahead の LF への置換は比較 Db の変更を起こす場合があります。
native data は埋め込まれた設定として評価せず、source から直接読みます。
[fixture: eventmodeling/data-blocks/body-overindented-first-line]
[fixture: eventmodeling/data-blocks/body-overindented-later-line]
[fixture: eventmodeling/inline-data/greedy-apparent-frames-kept]
[fixture: eventmodeling/data-blocks/block-closer-indent-unsafe]
[fixture: eventmodeling/data-boundaries/same-line-block-successor]
[test: eventmodeling/line-terminators-and-unicode/block-ls-boundary-stays-outside-value]
[fixture: eventmodeling/final-newline/final-block-padding-kept]

普通のトップレベルの文は第 1 列から始め、frame、model entity、data、
note の宣言を、無字下げ必須の閉じ波括弧と同じ段にそろえます。
GWT の clause と item は設定の字下げで入れ子にします。
margin の規則の対象外である data の本文は、原文の列を保ちます。
[fixture: eventmodeling/indentation/mixed-top-level-blocks]
[fixture: eventmodeling/indentation/gwt-four-spaces]
[fixture: eventmodeling/indentation/data-declaration-column-one]
[fixture: eventmodeling/indentation/note-column-one]

共通の EM terminal は keyword、delimiter、前置 ASCII 空白も値に含みます。
global directive と選ばれた semicolon を挟む場合も、
原文全体とその前方区間を保ちます。
通常の accessibility の空白と共有 description-block の圧縮は使いません。
空白だけの description も内部を保ちます。
共通文は見出し・先行文・消費 LF との元の接続に依存する場合があり、
普通の本文行へ置くと拒否される場合があります。
required identifier の `title` も、水平空白を足すと metadata になりうるため、
成立している LF や hidden の境界を保ちます。
[fixture: eventmodeling/header/accdescr-moved-to-line-start]
[fixture: eventmodeling/common-boundaries/common-retained-exact-leading-directive-gaps]
[fixture: eventmodeling/semicolons/metadata-across-selected-semicolon-gap-exact]
[fixture: eventmodeling/description-blocks/description-whitespace-literal-retained]
[fixture: eventmodeling/frame-components/hidden-before-required-title-identifier-keep-zero-indentation]

Eventmodeling の Db は、
source が `maxTextSize` （既定は UTF-16 コード単位で 50000）を超えない限り、
コメント行を残します。
通常の大きさでは、data block、note、description block、slash block comment、
hidden 形の内部の `%%` のコメント行は、その text の一部で、
許容されたブロック本文の margin 変更を除き、原文どおりに保ちます。
frontmatter と directive を除いた後の正規化した単位数が 50000 以上のときは、
図の text 全体とその終わりを保ちます。
それ未満のときは、印字する計画の長さも 50000 未満に収まる場合だけ、
通常の整形を行います。
字下げや末尾の改行で text が上限を越え、
そのコメント行が Db から消えるのを防ぐためです。
[fixture: eventmodeling/default-size-branches/size-utf16-surrogate]
[fixture: eventmodeling/default-size-branches/size-preserving-to-fallback-unsafe]
[fixture: eventmodeling/default-size-branches/size-below-planned-crossing]
[fixture: eventmodeling/comments/comment-line-inside-data-block-kept]

model entity、note、GWT、未使用・後続の同名 data、重複参照、型語、
参照と併記した inline data も、全出現を残します。
GWT の clause・item は範囲で終わる共有の本文経路を使います。
hidden YAML と native DIRECTIVE は元の owner で 1 回印字し、
消費 LF と閉じの空白は共有 hidden 規則で保護します。
見出し前の保持 form があれば prefix 全体を保ち、本物の frontmatter にしません。
安全な本物の frontmatter だけを guard 付き YAML formatter に通します。
[fixture: eventmodeling/source-order/all-occurrences-retained]
[fixture: eventmodeling/hidden-forms/hidden-gwt-clause-item-owners]
[fixture: eventmodeling/hidden-forms/gwt-required-source-and-given-hidden-gaps]
[fixture: eventmodeling/frontmatter-yaml/retained-prefix-whole]
[fixture: eventmodeling/frontmatter-yaml/safe-real-yaml]

子の本文の opening edge も含め、書かれた semicolon はすべて残します。
保持する `;` がある segment は、行の規則が無視する `;` が変わりうる場合を除き、
ほかと同じように整形します。
（[Semicolons](./eventmodeling.ja.md#semicolons)）。
値に属する空白は保ちます。
文法上の semicolon はなく、
style・classDef という語だけでは行全体を固定しません。
directive は同じ印字行では両側の接触を保ち、
単位を行に分けるときは次の単位へ付けます。
共通値の区間では原文保持を優先します。
comment は mark と内容を保ち、native 行 comment は LS・PS を含みます。
単位を行に分けるとき、間の inline comment と directive は原順で次側へ付けます。
共有の置き方に揃え、同じ comment を図種の間で同じように扱います。
[fixture: eventmodeling/comments/mixed-directive-order]
[fixture: eventmodeling/semicolons/gwt-protected-opening-kept]
[fixture: eventmodeling/semicolons/no-grammar-semicolon-style-word-line-formats]
[fixture: eventmodeling/global-directives/directive-follows-split-next-gwt-item]
[test: eventmodeling/comments/native-line-comment-ls-stays-content]
[test: eventmodeling/comments/comment-after-ls-gap-ends-at-lf]

既存の 5 つの [specified reading](./eventmodeling.ja.md#specified-readings)
に従い、差異は足しません。
対象は atomic な directive・semicolon の分断、frontmatter を跨ぐ HTML quote、
opaque な埋め込み設定、後出の C4 語です。
raw 拒否には raw Db がありません。
拒否ファイルは構文エラーを報告して書き換えず、
Markdown の拒否 payload は Prettier に任せます。
共有の CR・CRLF 変換と、
Markdown host が最後の code 行の空白を削る制限も適用します。
[corpus fixture: eventmodeling/directive-arrow-inside]
[corpus fixture: eventmodeling/lex-semicolon-frame-id-inside]
[corpus fixture: eventmodeling/div-html-frontmatter-value]
[corpus fixture: eventmodeling/div-frontmatter-invalid]
[corpus fixture: eventmodeling/c4-container-data]
[test: eventmodeling Markdown: rejected]
[test: eventmodeling Markdown: final-hidden-padding]

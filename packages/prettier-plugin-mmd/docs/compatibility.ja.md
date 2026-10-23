# mermaid.js との互換性

英語版: [compatibility.md](./compatibility.md)

このプラグインは、適合性コーパスに記録された mermaid.js 12.0.0 の結果で
確かめています。
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

ディレクティブ（`%%{ ... }%%`）と、行の規則が無視する `;`
（[`;` を含む行](#-を含む行)を参照）は、mermaid.js と同じく、
取り除いて前後のテキストをつないで読みます。
任意の 2 つのトークンの間、文字列、バッククォートの名前、
空白を含みうるテキスト（ラベルのテキスト、class のクラス名、
sequence 図の参加者の id）の中に置けます。
[fixture: flowchart/directives/touching-token-kept]
[fixture: flowchart/directives/compat-directive-in-string]
[fixture: state/directives/compat-directive-in-string]
[fixture: class/directives/compat-directive-in-backquoted-name]
[fixture: flowchart/directives/compat-directive-in-label]
[fixture: class/directives/kept]
[fixture: sequence/directives/compat-directive-in-participant-id]
[fixture: flowchart/semicolons/compat-ignored-semicolon-in-label]
[fixture: flowchart/semicolons/compat-ignored-semicolon-in-string]
[fixture:
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
キーワード `subgraph` として読み、
`A%%{init: {}}%%B-->C` を、ノード `AB` として読みます。
受理する入力では、ディレクティブは、
周りのテキストと一緒に、書かれたまま印字します。
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
[fixture: flowchart/directives/compat-malformed-directive-kept]
[fixture:
flowchart/whitespace-between-tokens/compat-unknown-shape-data-block-kept]
[fixture: sequence/whitespace-between-tokens/compat-malformed-data-block-kept]
[fixture: flowchart/frontmatter-yaml/malformed-kept]
[fixture: flowchart/frontmatter-yaml/compat-unknown-config-formatted]
[corpus fixture: common/directive-bad-json]
[corpus fixture: flowchart/div-data-unknown-shape]
[corpus fixture: flowchart/frontmatter-invalid-yaml]

ディレクティブとデータブロックは書かれたまま残します。
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
定義は、仕様の
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
定義は、仕様の
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
行に単独で書いたときや、同じ行の別の文の後に書いたときは
（`A accDescr {}` は頂点 A と空の description ブロックです）、
descriptionブロックの文です。
文字とtriviaのない通常の閉じたブロックの内側は、改行があっても`{}`です。
接する語は`accDescr{}`と接したままにします。
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
文の中にある空の説明ブロックがそうで、
`"" A --> B`、`class A``B`、`class A~~B` は構文エラーとして報告します。
[corpus fixture: class/div-empty-string-statement-start]
[corpus fixture: class/div-empty-backquoted-in-name]
[corpus fixture: class/div-empty-call]
[corpus fixture: class/div-empty-description-block-after-annotation]
[corpus fixture: class/div-empty-generic-in-name]
同じ行の別の文やヘッダーと並ぶ空の説明ブロックは、mermaid.js と同じく文です
（[空の説明ブロック](./class.ja.md#空の説明ブロック)を参照）。
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
`A->> accDescr {}+B: x` や `create accDescr {}participant A` のように
文の中にある空の説明ブロックは、構文エラーとして報告します。
[corpus fixture: sequence/div-empty-description-block-before-activation]
[corpus fixture: sequence/div-empty-description-block-after-create]
木に場所がある所の空の説明ブロックは、ほかの図と同じく文です。
[fixture:
sequence/statements-one-per-line/empty-description-block-moves-next-statement]

この違いは一方向だけです。
mermaid.js が拒否する入力を受理することはありません。

### 文字の直後のコメント

sequence 図では、コメントは `%%` から始まり、
`%%` の前の文字はその前のものに属します。
定義は、仕様の
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
定義は、仕様の
[`comment-takes-line-break`](../../spec/docs/known-divergences/comment-takes-line-break.ja.md)
にあります。
mermaid.js は、その後の改行を、空白だけの行までコメントの一部として読み、
次の行を同じ文の一部として読みます。
ここでは 2 つの文である、`A --> B %% c` と行 `class C` を拒否し、
`A --> B %% c` と行 `A : +int age` を、A から `BA` への関係と読みます。
このプラグインはコメントを動かさず、そうしたコメントの後の空白だけの行も残します
（[コメントの後の空白だけの行](#コメントの後の空白だけの行)を参照）。
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
定義は、仕様の
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

class 図では、バッククォートの名前やジェネリック型のテキストは、
`"`、`~`、`<<`、`>>`、`note` などのキーワードで始まってもかまいません。
定義は、仕様の
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
`href` の語の後の空白を、
改行も含めて語と一緒に読みます。
この読み方は、仕様の
[文の文脈](../../spec/docs/diagrams/flowchart.ja.md#文の文脈)と
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
そのため、`;` の印字と、`:` と `#` の間の空白
（接するか、空白 1 つ）は、同じ 1 つの答えで決めます。
`;` が文を区切る図種（flowchart、sequence 図、象限チャート、XY チャート）では、
行末の無視される `;` を落とし、その前の空白は通常どおり整形します。
そうでない図種（class 図、state 図、ブロック図など）では、
行を `;` とともに残し、隙間もそのままです。
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
整形が mermaid.js の保存するものを変えるのは、ここだけです。
テストは、末尾の空白を除いたスタイルを比べます。

取り除くと mermaid.js が文を拒否する箇所では、空白を保ちます。
`style A fill:#f00, ` のように、並びの末尾の `,` の後です。
[fixture: flowchart/style-trailing-whitespace/whitespace-only-value-kept]
[corpus fixture: flowchart/db-style-whitespace-only-value]
[スタイルの行末の空白](./flowchart.ja.md#スタイルの行末の空白)
を参照してください。

## ラベルの先頭の空白

mermaid.js は引用符のないラベルの先頭の空白を取り除き、整形も取り除きます。
ただし、取り除くとラベルの読み方が変わる場合は、空白 1 つとして残します。
ラベルが `/`、`\`、`-`、`"` のどれかで始まる場合と、
最初の語が `@` を含む場合です。
そのときは、ラベルの末尾にも空白 1 つを置きます。
[fixture: flowchart/label-inner-whitespace/trimmed]
[fixture: flowchart/label-inner-whitespace/leading-whitespace-kept]
[fixture: flowchart/label-inner-whitespace/compat-leading-backslash-kept]
たとえば、`A[ /x/]` はラベル `/x/` の rectangle ですが、
`A[/x/]` はラベル `x` の lean-right の形で、`A[x@]` は拒否されます。
[ラベルの内側の空白](./flowchart.ja.md#ラベルの内側の空白)を参照してください。

## トークンの間のディレクティブ

mermaid.js はディレクティブを取り除き、その両側のテキストをつないで読みます。
そのため整形は、ディレクティブの各側に空白が書かれていたかどうかを保ちます。
`flowchart %%{init: {}}%%LR` はそのまま残します。
`flowchart%%{init: {}}%%LR` は拒否されるからです。
[fixture: flowchart/directives/whitespace-on-each-side-kept]
[fixture: flowchart/directives/touching-token-kept]
[fixture: sequence/directives/compat-whitespace-on-one-side-of-directive-kept]
[fixture: class/directives/compat-whitespace-on-one-side-of-directive-kept]
[fixture: state/directives/compat-whitespace-on-one-side-of-directive-kept]
[ディレクティブ](./flowchart.ja.md#ディレクティブ)を参照してください。

## `;` を含む行

mermaid.js は、`style`、続いて空白をはさまずに `#` が後に続く `:`、
さらに `;` を含む行で、
最後の `;` を無視します
（仕様の
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)
）。
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
[fixture: flowchart/statements-one-per-line/line-with-semicolon-kept]
[fixture:
flowchart/statements-one-per-line/compat-semicolon-in-label-without-style-kept]
[fixture: sequence/comments/semicolon-after-comment-kept]
[fixture: class/labels/semicolon-line-kept]
[fixture: state/descriptions-and-labels/semicolon-line-kept]
[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照してください。

## `;` が終わらせる行

`;` は、行がどこで終わるか、
そして行の規則が無視する `;`（[`;` を含む行](#-を含む行)を参照）のときは、
どの `;` が無視されるかを決めています。
規則は `;` を、mermaid.js が読む前に本文から取り除き、
閉じていないディレクティブの走査は、引数の後の空白を、行送りも含めて取り、
`;` がそれを止めます。
行の上の `;` を落とすと、その 2 つのどちらかが変わるときは、
すべての図種で、行を、行の上にある文ごと、書かれたまま印字します。
次のものがある行です。

- 空白だけを挟んで、閉じていないディレクティブの後にある `;`。
  そのようなディレクティブの走査は、引数の後の空白を、行送りも含めて取り、
  `;` がそれを止めます。
  `%%{wrap foo;` と次の行 `participant D` は、
  `;` でディレクティブが終わりますが、
  `;` がないと、行送りと次の行まで、ディレクティブが取ります。
  [fixture:
  sequence/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [fixture:
  flowchart/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [fixture:
  state/statements-one-per-line/compat-unclosed-directive-semicolon-kept]
  [corpus fixture: sequence/ignored-semicolon-after-directive-06349fee]
  [corpus fixture: common/directive-word-argument-unclosed-next-line]
  `%%{init: {}`、U+2029、`;` も同じです
  （引数は U+2029 の手前で止まり、
  ディレクティブは U+2029 を空白として取ります）。
  [corpus fixture: flowchart/ignored-semicolon-after-directive-530d2c05]
- 空白とディレクティブだけを挟んで、別の `;` に接している、
  行の規則が無視する `;`。
  ディレクティブが先に取り除かれるので、規則にとって 2 つは隣り合い、
  規則が無視するのは行の最後の `;` だけです。
  最後の `;` を落とすと、その前の `;` が無視されるものになり、
  ディレクティブの後に `;;` があるメッセージのテキスト `style:#x` が、
  `style:` に変わります。
  [fixture:
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
[fixture: flowchart/semicolons/closed-directive-formatted]
[fixture:
sequence/statements-one-per-line/compat-closed-directive-semicolon-dropped]

sequence 図で、空白を読まない単位
（participant のデータブロックか `autonumber`）で
終わる文は、その後のディレクティブに続く `;` を残し、
行に U+2028 か U+2029 があるときは、行を書かれたまま印字します。
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
ディレクティブと一緒に取られます
（仕様の
[ディレクティブの位置](../../spec/docs/common.ja.md#ディレクティブの位置)
）。
そのため、次の行は、コメント行の後と同じく、ディレクティブの行の続きになります
（
[U+2028 か U+2029 の後のコメント行](#u2028-か-u2029-の後のコメント行)
を参照）。
その行は、その上にあるものごと、書かれたまま印字します。
そのために `;` は要りません。
[fixture: flowchart/directives/compat-unclosed-directive-joins-next-line]
[fixture: sequence/statements-one-per-line/compat-unclosed-directive-joins-line]
[fixture:
state/statements-one-per-line/compat-unclosed-directive-joins-next-line]
[fixture: class/directives/compat-unclosed-directive-joins-next-line]
[corpus fixture: common/directive-word-argument-unclosed-next-line]
`participant A@{ "style": "x:#y" };participant C%%{init: {}`、行送り、U+2029、
`;participant D` は、行の規則にとって 1 行で、
`participant C` を別の行に移すと、その `;` は無視されなくなります。
[corpus fixture: sequence/ignored-semicolon-after-directive-435fa018]
class 図と state 図では、その行送りの後の文は、
その段の字下げをせず、書かれたまま残します。
`state S {%%{wrap foo`、空行、`A` は、空行と `A` がその位置に残ります。
[fixture: state/composite-states/compat-unclosed-directive-joins-body-line]
[fixture: class/member-bodies/compat-unclosed-directive-joins-body-line]

`init` のような自由なテキストの引数を持ち、`}%%` で閉じないディレクティブは、
テキストの終わりまで続きます
（仕様の
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
その文字は、自由なテキストにとって空白ではなく、
ディレクティブは、その後の空白を取ります。
文字を空白にすると、引数がその先に届き、
続く文を、次の `}%%` かテキストの終わりまで取ってしまいます。
`class A%%{init: {}`、空白、U+2028、`class D`、`class B` は、
クラス `AclassD` と `B` を宣言し、U+2028 を空白にすると、`A` だけになります。
[corpus fixture: class/unclosed-directive-separator-whitespace-5cfdfca6]

## 方向のテキストを含む行

mermaid.js は、行の中で単位が始まる最初の位置で、
空白より先に方向の行を試します
（仕様の[文の文脈](../../spec/docs/diagrams/flowchart.ja.md#文の文脈)）。
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
[字下げ](./flowchart.ja.md#字下げ)を参照してください。

flowchart本文は共有の意味を持つ字下げの下限を使い、
`tabWidth: 0`でも1段に最低1つの空白を置きます。
字下げを落として、方向文が1桁目のaccessibilityやキーワードの優先順位を
取り戻さないようにするためです。
[fixture: flowchart/indentation/zero-direction-description-subgraph]
[fixture: flowchart/indentation/zero-direction-title]
[fixture: flowchart/indentation/zero-direction-title-tab]
[fixture: flowchart/indentation/zero-direction-description-block]
[fixture: flowchart/indentation/zero-direction-title-prefix]
[fixture: flowchart/indentation/zero-direction-directive]
[fixture: flowchart/indentation/zero-direction-style-prefix]
同じ下限を、幅0で読みが変わる
[mindmap](./mindmap.md#indentation)、[kanban](./kanban.md#indentation)、
[Venn](./venn.md#indentation)、[Ishikawa](./ishikawa.md#indentation)、
[Agentflow](./agentflow.md#indentation)、[class](./class.ja.md#字下げ)、
[YAML](#フロントマター)でも使います。

## 数か `title` の送り元からの sequence のメッセージ

sequence のメッセージは、矢印の両側に空白を 1 つずつ置きます。
ただし、送り元が、後に空白が続くと別の単位として読まれる id のときは除きます。
1 つは数で、`1->>2: x` の `1 ->>2: x` は拒否されます。
もう 1 つは大文字小文字によらない `title` で、
`title->>B: x` の `title ->> B: x` はタイトルです
（仕様の[文の文脈](../../spec/docs/diagrams/sequence.ja.md#文の文脈)）。
そうしたメッセージは、矢印の両側を接したままにします。
[fixture: sequence/arrow-spacing/touching-before-read-otherwise-kept]
[矢印の前後の空白](./sequence.ja.md#矢印の前後の空白)を参照してください。

## 複数行の sequence の文

sequence 図では、改行の前に空白があると、文は次の行に続きます。
そうした文は 1 行にまとめて印字します。
[fixture: sequence/multi-line-statements/joined]
コメントかディレクティブを含むものは、始まりから終わりまで書かれたまま残します。
mermaid.js がその行を 1 つの文として読むのは、行末の空白があるときだけで、
整形はその空白を出力しないので、1 行にまとめられません。
[fixture: sequence/multi-line-statements/comment-inside-kept]
`title` と本文の間にコメント行があるタイトルも同じです。
コメント行は mermaid.js がテキストを読む前に取り除かれるので、
その次の行がタイトルになります。
[fixture: sequence/title/comment-line-kept]
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
ただし、間に空白だけの行があるときは別です
（[後の改行を取り込むコメント](#後の改行を取り込むコメント)を参照）。
`A --> B %% c`、空白 2 つの行、`A : +int age` は関係とメンバーで、
空白がなければ A から `BA` への関係です。
行末の空白を消すエディターは、その空白も消し、
すると mermaid.js は図を違うものとして読みます。
[コメント](./class.ja.md#コメント)を参照してください。

## class のラベルとメンバーの行

class 図では、メンバーの行とジェネリック型は書かれたまま残します。
可視性の印の後の空白と、2 つの `~` の間の空白は Db の一部だからです。
[fixture: class/member-lines/kept]
[fixture: class/generic-types/kept]
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
別名の定義の 2 つ目の説明は、
mermaid.js が読む両端の空白ごと、書かれたまま残します。
[fixture: state/aliases/second-description-kept]
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
[1 行に 1 文](./state.ja.md#1-行に-1-文)、[複合状態](./state.ja.md#複合状態)
を参照してください。

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

- 最初に印字される行に `direction` と方向を含む
  `accTitle`、`accDescr:`、`accDescr {` の文。
  後の行に書かれたテキストは `:` の行に寄せます。
  行は、字句解析器が読む形、つまりディレクティブなしの形で判定します。
  字句解析器は、これらの文の規則より後に方向の行の規則を試すので、
  1 桁目ではタイトルか説明で、字下げの後では
  `direction` の前に `accTitle:` というテキストがある方向の行になり、
  タイトルが失われます。
  文は 1 桁目を保ちます。
  方向は、空行、コメント行、ディレクティブの後の行にあってもよく、
  字句解析器はそれらを読みません。
  [fixture: er/accessibility-statements/first-column-for-direction-text]
  [fixture: er/accessibility-statements/first-column-value-after-directive-line]
  [corpus fixture: er/lex-acc-title-direction]
  [corpus fixture: er/lex-acc-descr-block-direction]
- 実体 `1` の直後に、文字、数字、`_` で始まる別の文、subgraph の `end`、
  関係の単位が続く場合。間にディレクティブがあっても同じです。
  `1` の後に空白（改行を含む）とそのような文字が続くと、
  カーディナリティ `only-one` になる
  （diagrams/er.md、カーディナリティ、規則 11）ので、
  `1a` は行に残し、`1one to one B : x` は接したままにします。
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
  後ろに空白を置くと拒否されます。
  [fixture: er/relationship-spacing/md-parent]
  [corpus fixture: er/lex-md-parent-right-glued-name]
- `classDef` や `style` の文の末尾の空白。
  その後の改行を取り込み、次の行がスタイルの続きになります。
  [fixture: er/styles-and-classes/trailing-whitespace-takes-next-line]
  [corpus fixture: er/lex-classdef-space-before-line-feed]

## 空白で決まる Gantt 図の行

mermaid.js は、Gantt 図の一部の値の空白を持ち、
一部の行を、その行の空白で読みを決めます。
そのため、整形は書かれたまま残します。
[タスクのデータ](./gantt.ja.md#タスクのデータ)、
[設定](./gantt.ja.md#設定)、
[タイトルとセクション](./gantt.ja.md#タイトルとセクション)、
[リスト](./gantt.ja.md#リスト)を参照してください。

- `dateFormat`、`axisFormat`、`tickInterval`、`todayMarker`、`title`、
  `section` の値の両端の空白と、タスクの説明のテキストとコロンの間の空白。
  Db が持つので、空白 2 つの `dateFormat  YYYY-MM-DD` や、
  桁をそろえた `A task           :a1` は、空白を落とした形とは別のものです。
  コロンをそろえる空白も残ります。
  [fixture: gantt/settings/value-whitespace-kept]
  [fixture: gantt/titles-and-sections/value-whitespace-kept]
  [fixture: gantt/task-data/description-padding-kept]
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
- 呼び出しの名前と引数の、中の空白。
  `f ()`、`f( 1, 2 )`、`f(1,2)` は 3 つの別の呼び出しです。
  [fixture: gantt/click-statements/call-name-and-arguments-kept]
- `;` を含む行。
  mermaid.js の行の規則は行のテキストを読むので、その行の文を行に残します。
  [fixture: gantt/statements-one-per-line/ignored-semicolon-line-kept]
- `%%{` で始まりディレクティブでないコメント行と、
  その直前の印が `%` のコメント行。
  空白 1 文字の後に置きます。
  mermaid.js は、その `%%{` を、前の空白が 1 文字か、
  改行の後に 1 文字のときだけ読み、それより多いときや、
  空行の後で空白がないときは拒否します
  （既知の差異
  [`percent-brace-after-unit`](../../spec/docs/known-divergences/percent-brace-after-unit.ja.md)）。
  直接に読まれる印が `%` のコメントは後ろの改行を取ります
  （既知の差異
  [`comment-takes-line-break`](../../spec/docs/known-divergences/comment-takes-line-break.ja.md)）。
  ディレクティブはテキストを読む前に取り除かれるので、
  その前のディレクティブだけの行は、間に空行があってもなくても、1 桁目に置き、
  同じ行のディレクティブの間の空白も `%%{` の前の空白に数えます。
  mermaid.js と仕様が同じに読む入力
  （`%%{` の行が 1 桁目か、空白 1 つかタブ 1 つの後にあるもの）は、
  整形も、両者が同じに読む形に印字し、これらの差異の形には印字しません。
  [fixture: gantt/comments/percent-brace-line-after-blank-line]
  [fixture: gantt/comments/percent-comment-then-percent-brace-line]

## 空白で決まる journey の行

mermaid.js は、journey の一部の値の空白を持ち、
一部の行を、その行の空白で読みを決めます。
そのため、整形は書かれたまま残します。
[タスクのデータ](./journey.ja.md#タスクのデータ)と
[タイトルとセクション](./journey.ja.md#タイトルとセクション)を参照してください。

- `title` と `section` の値の両端の空白と、
  タスクの説明のテキストとコロンの間の空白。
  Db が持つので、空白 2 つの `title  T` や、
  桁をそろえた `Make tea  : 5` は、空白を落とした形とは別のものです。
  コロンをそろえる空白も残ります。
  [fixture: journey/titles-and-sections/value-whitespace-kept]
  [fixture: journey/task-data/description-padding-kept]
- `title` と `section` の後の `#` の前の空白。
  値の一部ですが、タスクのデータの後では値に入りません。
  [fixture: journey/titles-and-sections/whitespace-before-hash-is-the-value]
  [fixture: journey/task-data/hash-ends-the-data]
- 人の中の空白と、人の数。
  `Me  Two` は書かれたままの 1 人で、
  `a,` は `a` にない空の人を持ちます。
  [fixture: journey/task-data/people-inner-whitespace-kept]
  [fixture: journey/task-data/empty-people]
- 空白だけのデータを持つタスクの `:` の後の空白。
  mermaid.js はコロンの後にデータの 1 文字を要求するので、
  `A:` は拒否され、`A: ` はタスクであり、空白 1 文字を残します。
  [fixture: journey/task-data/whitespace-only-data]
- `;` を含む行。
  mermaid.js の行の規則は行のテキストを読むので、その行の文を行に残します。
  [fixture: journey/statements-one-per-line/ignored-semicolon-line-kept]

## 場所や空白で決まる requirement の行

mermaid.js は、requirement 図の名前や値の一部の空白を持ち、
一部の行を、その行の置かれた場所で読みを決めます。
そのため、整形は書かれたまま残します。
[名前](./requirement.ja.md#名前)、
[フィールド](./requirement.ja.md#フィールド)、
[スタイルとクラス](./requirement.ja.md#スタイルとクラス)、
[1 行に 1 文](./requirement.ja.md#1-行に-1-文)を参照してください。

- 引用符のない名前、値、クラスの中の空白と、文字列の引用符の間のすべて。
  Db が持つので、空白 2 つの `requirement spaced  name` や `id: a  b` は、
  空白 1 つの形とは別のものです。
  両端の空白は Db に入らないので落とします。
  [fixture: requirement/names/inner-whitespace-kept]
  [fixture: requirement/fields/value-inner-whitespace-kept]
  [fixture: requirement/class-lists/classes-with-spaces]
- 引用符のない名前や値の後ろの `#` と `%`。
  テキストの文字なので、`id: 1 #c` の値は `1 #c` で、
  コメントとして動かしません。
  [fixture: requirement/comments/in-unquoted-text-is-text]
- `style`・`classDef`・`class` 文の行末の文字列が始める文。
  字句解析器はそこでまだ style の文脈にあり、
  文字列の後の改行が文を続けるので、
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
- 印字する最初の行に `direction` と方向を含む
  `accTitle`、`accDescr:`、`accDescr {` の文は、
  ER 図と同じく 1 桁目を保ちます。
  [fixture: requirement/accessibility-statements/first-column-kept]
- `;` を含む行。
  mermaid.js の行の規則は行のテキストを読むので、その行の文を行に残します。
  複数行に書かれた文の最後の行に、後ろの文の `;` があるときも、
  1 行にした行が全体として読まれるので、書かれたまま残します。
  [fixture: requirement/statements-one-per-line/ignored-semicolon-line-kept]
  [fixture:
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
- U+2028 か U+2029 で終わる診断コメント。
  その後ろのテキストは新しい行なので、そこに改行を書きます。
  [test: U+2028 after a comment after a shape]
- mermaid.js が拒否する空行
  （既知の差異
  [`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.ja.md)）。
  ヘッダーの後のものは落とすので、出力は受理されます。
  ノードの間の診断コメントの後のものは、入力と同じく 1 つ残ります。
  [fixture: mindmap/blank-lines/after-the-header-dropped]
  [fixture: mindmap/blank-lines/after-a-comment-between-nodes-kept]

## 空白で決まる timeline の行

mermaid.js は、timeline の period、event、title、section の名前の空白を保ち、
いくつかの行を、置かれた場所で読みます。
そのため、整形はそれらを書かれたまま残します。
[period と event](./timeline.ja.md#period-と-event)、
[event の文](./timeline.ja.md#event-の文)、
[1 行 1 文](./timeline.ja.md#1-行-1-文)を参照してください。

- period と event の `:` の周りの空白。
  Db は、period の `:` の前の空白と、
  event の `:` の後ろの 1 文字を除く空白を保ちます。
  そのため `2004 : a` と `2004: a` は別の period で、
  `:` をそろえる空白は残ります。
  行末の空白もテキストの一部です。
  [fixture: timeline/periods-and-events/period-whitespace-kept]
  [fixture: timeline/periods-and-events/event-whitespace-kept]
  [fixture: timeline/periods-and-events/trailing-whitespace-kept]
- event を書く行。
  後ろの行の event を period の行に空白 1 つで寄せると、
  前の event のテキストに空白が加わります。
  行から event を分けると、前の空白が行末に残ります。
  [fixture: timeline/periods-and-events/events-on-both]
- section の同じ行にある event（`section T : Google`）。
  section の名前は `:` の前の空白を持つので、event は行に残します。
  空白がなければ（`section T: Google`）、event は自分の行に移します。
  [fixture:
  timeline/statements-one-per-line/section-with-trailing-whitespace-keeps-the-event]
  [fixture:
  timeline/statements-one-per-line/section-without-trailing-whitespace-moves-the-event]
- 行に `title` か `section` だけがあって period になるものの後ろの、
  指令だけの行。
  指令の前の空白が title や section のテキストになるので、1 列目に置きます。
  [fixture: timeline/periods-and-events/title-word-then-directive-line]
- 連結する改行にコメント行、指令、`;` がある文
  （`title` とそのテキストの間など）は、書かれたまま残します。
  `;` を含む行は、その行の文をまとめて残します。
  [fixture: timeline/multi-line-statements/comment-line-inside-kept]
  [fixture: timeline/statements-one-per-line/ignored-semicolon-line-kept]

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
- 文字列。
  中の空白と改行は Db に入り、引用符は書き手のものです。
  `"a b"` と `a b` は同じテキストではありません。
  [fixture: quotes/strings-as-written]
  [fixture: multi-line-values/string-with-line-breaks-kept]
- 分類と title の数字はテキストなので、`007` や `.5` は書かれたままです。
  範囲の数とプロットの値も、書き手のテキストとして残します。
  [fixture: numbers/categories-are-texts]
  [fixture: numbers/range-numbers-as-written]
- 閉じていない `accDescr {` ブロックは、テキストの最後まで続きます。
  mermaid.js はそのテキストを読まず、
  印字が `}` を足すとブロックが説明になってしまいます。
  [fixture: accessibility-statements/block-not-closed-kept-as-written]
- mermaid.js の行の規則が読む行は、文を 1 行に残し、`;` も書かれたままです。
  `style` か `classDef`、その後の `:`、
  `:` との間に空白のない `#`、その後の `;` を持つ行です。
  [fixture: statements-one-per-line/line-rule-line-kept-together]
  [fixture: multi-line-statements/semicolon-inside-kept]
- つなぐ改行にコメント行か指令がある文は、書かれたまま残します。
  [fixture: multi-line-statements/comment-line-inside-kept]
  [fixture: multi-line-statements/directive-inside-kept]
- コメントが前の単位に接しているかどうか。
  mermaid.js は、1 文字の単位に接した `%%` を、その文字と一緒に読みます
  （既知の差異 `comment-takes-character`）。
  印字はコメントが接しているかどうかを保ちます。
  [fixture: comments/comment-glued-to-a-one-character-word-kept]
  [fixture: comments/comment-takes-a-character-kept]
- 文の隙間にある U+2028 と U+2029 は、書かれたまま印字します。
  [test: U+2028 between the words of a title]
- 既知の差異 `title-digit-after-axis-statement` の入力は、
  仕様は受理し、mermaid.js は拒否します。
  文を別々の行に置くと、mermaid.js が結果を受理し、Db は仕様の読みのままです。
  [fixture: statements-one-per-line/axis-then-title-with-a-digit-split]
  [fixture: statements-one-per-line/axis-band-then-title-with-a-digit-split]

## テキスト、引用符、字句解析器で決まる象限チャートの行

象限チャートのテキストの中の空白は Db に入るので、
整形はテキストを書かれたまま残し、その周りの空白を変えます。
Db や字句解析器が読むものは変えません。
[キーワードとテキスト](./quadrant.ja.md#キーワードとテキスト)と
[引用符](./quadrant.ja.md#引用符)を参照してください。

- 引用符なしのテキスト、名前、title、アクセシビリティのテキストの中の空白。
  2 つの単語の間の空白の連なり、タブ、改ページは、テキストの文字です。
  文字列とその後の単語は、間の空白を保ちます。
  `"a" b` と `"a"b` は別のテキストだからです。
  [fixture: keywords-and-texts/inner-whitespace-kept]
  [fixture: keywords-and-texts/string-then-text-whitespace-kept]
  [fixture: points/name-inner-whitespace-kept]
  [fixture: titles-and-accessibility-statements/text-inner-whitespace-kept]
- キーワード `title` や `classDef` の後に、空白なしで続く単語は、
  それ自身が単語です。
  `title1: [0.3, 0.6]` は名前 `title1` の点で、空白を置くと title になります。
  [fixture: keywords-and-texts/word-after-title-keyword-is-a-point-name]
- 点の座標はテキストです。`0.30` は `0.3` ではありません。
  [fixture: points/coordinates-as-written]
- 後ろにテキストのない軸の矢印は、Db が左のテキストの一部として読みます。
  [fixture: axes/arrow-only]
- 文字列。
  中の空白と改行は Db に入り、引用符は書き手が選びます。
  文字列は引用符なしのテキストが持てないものを持てるので、引用符は外しません。
  [fixture: quotes/strings-as-written]
  [fixture: quotes/keywords-and-arrows-in-strings]
  [fixture: multi-line-values/string-with-line-breaks-kept]
- title とアクセシビリティのテキストの中の `;` はその文字で、
  title の中の空の説明ブロックは title の一部です。
  [fixture: statements-one-per-line/semicolon-in-a-title-is-text]
  [fixture: statements-one-per-line/empty-description-block-in-a-title-stays]
- mermaid.js の行の規則が読む行は、文を 1 行に残し、`;` も書かれたままです。
  `style` か `classDef`、その後の `:`、
  `:` との間に空白のない `#`、その後の `;` を持つ行です。
  [fixture: statements-one-per-line/line-rule-line-kept-together]
  [fixture: multi-line-statements/semicolon-on-the-last-line-kept]
- つなぐ改行にコメント行か指令がある文は、書かれたまま残します。
  [fixture: multi-line-statements/comment-line-inside-kept]
  [fixture: multi-line-statements/directive-inside-kept]
- コメントが前の単位に接しているかどうか。
  mermaid.js は、1 文字の単位に接した `%%` を、その文字と一緒に読みます
  （既知の差異 `comment-takes-character`）。
  印字はコメントが接しているかどうかを保ちます。
  [fixture: comments/comment-glued-to-a-one-character-word-kept]
  [fixture: comments/comment-takes-a-character-kept]
- U+2028、U+2029、U+00A0 は、
  テキスト、名前、title、アクセシビリティのテキストの中では単語の文字で、
  隙間にあっても書かれた場所に残ります。
  [test: U+2028 between the words of a text]
  [test: U+2028 around the arrow of an axis]

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
- `style` と `class` の空白。
  `,` の後のスタイル、`class` の id、クラス名の空白です。
  [fixture: styles/style-commas-as-written]
  [fixture: styles/class-ids-as-written]
  [fixture: styles/class-name-as-written]
  [fixture: styles/class-name-with-a-comma-as-written]
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
  分けると別の読みになります。
  [fixture: edges/chain-on-one-line]
- mermaid.js の行の規則が読む行は、文を 1 行に残し、`;` も書かれたままです。
  `style` か `classDef`、その後の `:`、
  `:` との間に空白のない `#`、その後の `;` を持つ行です。
  [fixture: multi-line-statements/line-rule-line-kept]
  [fixture: multi-line-statements/line-rule-line-kept-with-columns]
  [fixture: multi-line-statements/line-rule-line-kept-with-composite]
- つなぐ改行にコメント行か指令がある文は、書かれたまま残します。
  [fixture: multi-line-statements/comment-line-inside-kept]
  [fixture: multi-line-statements/directive-inside-kept]
- U+0085 は mermaid.js が空白として読まず、id の文字です。
  文の隙間にある U+2028 と U+2029 は、書かれたまま印字します。
  [test: U+0085 inside an id]
  [test: U+2028 between two statements of a row]

## U+2028 か U+2029 の後のコメント行

この共通の除去はagentflowのコメント保持サイズ分岐の外で適用します。
[Agentflowの値、コメント、既定のサイズ境界](#agentflowの値コメント既定のサイズ境界)を参照してください。

mermaid.js は、本文を読む前に、コメント行を取り除きます。
コメント行 `%%` は、その前の空白だけの行とディレクティブ、
そして行を終える改行と一緒に取り除かれます
（仕様の[コメント行](../../spec/docs/common.ja.md#コメント行)のコメント領域）。
領域が U+2028 か U+2029 の直後、
またはこの種の別の領域が終わる所に始まるとき、
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
そのようなコメント行が途中で切る図のコメントも、書かれたまま印字します
（[行区切り](./sequence.ja.md#行区切り)を参照）。
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
整形した YAML の行が `---` の行の形
（仕様の[フロントマター](../../spec/docs/common.ja.md#フロントマター)
）をしていて、
フロントマターを途中で終わらせるときは、YAML を書かれたまま残します。
Prettier はそうした行を印字します。
`%YAML` の指示子の後の `--- !!map` を `---` と `!!map` の 2 行に印字します。
[fixture: flowchart/frontmatter-yaml/indented-delimiters-kept]
[fixture: flowchart/frontmatter-yaml/delimiter-line-kept]

YAML が、`<` の後に ASCII の英字、数字、
`_` のいずれかが続く箇所を含むときは、YAML を書かれたまま残します。
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
  このプラグインは整形します。
  [corpus fixture: common/frontmatter-bom]

## 行末

mermaid.js は `\r\n` と単独の `\r` を、`\n` と同じく改行として読みます
（仕様の[行終端](../../spec/docs/common.ja.md#行終端)）。
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

## printer のない図種

このプラグインがまだ整形しない図種は、単独のファイルでは書かれたまま印字します。
変わりうるのは改行コードだけで、
他の言語と同じく Prettier の `endOfLine` オプションに従います。
Markdown では、コードブロックを Prettier に任せます。

## Kanban の字下げ、不透明な末尾、保持行

kanban のボードの Db は字下げを持たず、
ノードの字下げを最初のノードの字下げと比べて、セクションと項目を区別します。
そのため、印字は、セクションは 1 段、項目は 2 段の字下げを決め、
役割を決めるものを保ちます。
裸の id・ラベル・icon・class の空白は値として残します。
装飾はノードの桁に揃え、インラインディレクティブの行は、
ディレクティブと隣の隙間を保ち、最初のディレクティブの前の空白を印字が決めます。
[kanban の規則](./kanban.ja.md)を参照してください。
[fixture: kanban/indentation/sections-and-items]
[fixture: kanban/icons-and-classes/aligned]
[fixture: kanban/directives/leading-directive-indentation-decided]
[fixture: kanban/trailing-whitespace/class-trailing-trim]

データブロックは、中身と付着位置、
隣接するブロックや間のディレクティブも保ちます。
YAML 整形は、保護条件付きのフロントマターだけです。
図のコメント後の空行・コメントの隙間は、末尾も含め、
`blank-line-after-header-or-comments` のもとで全体を保ちます。
素の mermaid.js が拒否する入力に素の Db はなく、
コーパスは仕様の読み方を確かめます。
[fixture: kanban/data-blocks/adjacent]
[fixture: kanban/data-blocks/data-adjacent-directive]
[fixture: kanban/blank-lines/div-between-comment-blank]
[fixture: kanban/blank-lines/comment-blank-trailing]

共通の `style`・`classDef` の行規則で保持する行は、
区間全体、空白、コメント、ディレクティブを保ちます。
無視するセミコロンも含め `;` を残し、文の区切りとは扱いません。
削除やインラインコメントの移動で、最後に選ばれるセミコロンが変わり得るためです。
Unicode の区間境界とコメントの終わりは文字として残し、
CR・LF の変換は他図種と共通の設定に従います。
[fixture: kanban/line-rule-and-kept-lines/line-rule-comment-to-own-line]
[fixture: kanban/line-rule-and-kept-lines/line-rule-classdef-and-style]
[fixture: kanban/semicolons/values]
[test: kanban: line-rule-ls-segment]
[test: kanban: comment-ls-split-count]
[test: a kanban diagram with other line endings]

## C4 の引数の単位と物理行

C4 は書かれた引数の単位と位置をすべて保ちます。
空項目、空文字列、使われない添字と sprite、余分な引数、
隣接する単位も対象です。
裸と引用符付きの形は作者のままにし、
裸の引用符または `$` の前の非 ASCII 空白も保ちます。
その空白が裸の単位を選ぶためです。
引用符付き引数の後の空白だけの単位も残します。
[C4 の規則](./c4.ja.md)を参照してください。
[fixture: c4/argument-spacing/null-space-kept]
[fixture: c4/empty-entries/named-null-slots]
[fixture: c4/number-like-text/excess-kept]
[test: c4: tab-before-quote] [test: c4: bare-dollar-prefix]

空の説明ブロックは隣接したままにし、
二つの `beforeBody` の隙間も保ちます。
意味のある文も改行も供給しないためです。
複数行の値と名前付きキーの外側の改行は行と列を保ちます。
direction の文字の結合は、
先頭列でも受理される入力を拒否に変えうるためです。
[fixture: c4/empty-description-blocks/empty-header-gap]
[fixture: c4/empty-description-blocks/empty-boundary-next-gap]
[fixture: c4/empty-description-blocks/empty-on-close-line]
[fixture: c4/named-attributes/named-exterior-newline-kept]
[fixture: c4/direction-rejection/acc-colon-direction]

図のコメントの後は、
復帰用の空白行と末尾の隙間も含めて全体を保ちます。
コメントを移して `comment-takes-line-break` の差異を修復しません。
すべてのセミコロンと、
共有の `style` と `classDef` の行規則が守る接頭部を保ちます。
値のノードを分けず、
Unicode の区間境界も保ちます。
字下げと値の外の末尾空白は printer が整えます。
[fixture: c4/comments/comment-header]
[fixture: c4/blank-lines/comment-recovery]
[fixture: c4/final-newline/comment-eof-gap]
[fixture: c4/line-rule-and-semicolons/semicolon-inline-comment]
[fixture: c4/line-rule-and-semicolons/semicolon-suffix-spacing]
[fixture: c4/trailing-whitespace/semicolon-line]
[test: c4: ls-line-rule-segments]

## Venn の暗黙の text とテキストの行規則

Venn の本文は平らな一覧で、
対象を書かない text だけを字下げします。
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

名前、ラベル、サイズ、裸と引用符つきの style 全体、title、
重複と飲み込まれる断片は書かれたテキストのまま保ちます。
空の引用符つきの名前と style も値です。
裸の空白、引用符内の空白、空の引用符つきラベルの読み分けも保ちます。
全てのセミコロンを保ち、
最初の非空白から最後のセミコロンまでの接頭部を保護します。
端にかかる値と項目は全体を保ちます。
字下げと外側の末尾空白はプリンターの空白で、
安全な接尾部は通常どおり整形します。
コメントとディレクティブ内の Unicode 区切りは保持部分を切りません。
Venn の図コメントは LF か末尾まで続きます。

[fixture: venn/name-lists/empty-quoted-targets]
[fixture: venn/labels/labels-empty-kept]
[fixture: venn/style-properties/style-atoms-kept]
[fixture: venn/comments/ignored-fragment]
[fixture: venn/line-rule-and-kept-lines/line-rule-suffix-spacing]
[test: venn: ls-kept-comment-whitespace-line]
[test: venn: ps-kept-directive]

正規化するのは受理する役割の空白だけです。
通常の ASCII の隙間、設定の暗黙の字下げ、title の最初の区切りです。
CR と CRLF は共通の改行処理を使います。
値の Unicode 文字は保ち、
不正な通常の隙間は拒否のままです。
失敗、Markdown、frontmatter、最後の改行は共通の経路に従います。
仕様の単位境界の乖離は失敗のままで、
C4 の検出と不透明な YAML の乖離は仕様の読み方を使います。
生の拒否には生の Db はありません。

[fixture: venn/whitespace-characters/tab-gaps]
[fixture: venn/title/title-next-line]
[fixture: venn/header/div-c4-detector]
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
[fixture: ishikawa/trailing-whitespace/trailing-value-kept]
[test: ishikawa: joined-common-region]
[fixture: ishikawa/line-rule-and-kept-lines/line-rule-kept]

図コメントの Unicode 終端は、次の節点の深さの字下げに数える文字です。
共通コメント領域は、飲み込む接尾部と結合を保ちます。
図コメントの後の区切りも含め、普通の空行の連続は 1 つにします。
末尾の図コメントの隙間は全体を保ちます。
受理した差異は仕様の木を使い、失敗は修復しません。
生の拒否には生の Db はありません。
ガード付き frontmatter、設定の CR と LF への変換、
EOF の directive、Markdown のホストの処理は、共有の経路を使います。

[test: ishikawa: ls-comment-boundary]
[test: ishikawa: ps-comment-boundary]
[fixture: ishikawa/blank-lines/blank-comment-div]
[fixture: ishikawa/blank-lines/terminal-comment-complete-gap]
[fixture: ishikawa/node-text/div-c4]
[fixture: ishikawa/frontmatter-yaml/frontmatter-html-guard]
[test: ishikawa: eol-crlf]
[test: ishikawa Markdown: quote-list-clamped]

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
JSON の表データは不透明で、@ と波括弧の隙間、数とエスケープの綴り、
プロパティの順序も含みます。
効果を渡さない整形 fixture では、共有の Db 比較を null とし、原文を比較します。
コーパスは存在する記録済みの効果を使います。
CSS 宣言全体は、Mermaid が保存するコロンの両側と `--` の隙間を保ちます。
[fixture: usecase/native-metadata/metadata-inline]
[fixture: usecase/native-metadata/metadata-blank-lines-kept]
[fixture: usecase/json-tables/json-opaque]
[fixture: usecase/classes-and-styles/css-colon-padding]
[fixture: usecase/classes-and-styles/css-custom-gap]

共通コメント領域と改行の処理後、最後のプロパティから `}` までの、
末尾コンマと物理改行の合計は 2 個以下で、
コンマは改行の前にだけ置けます。
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
説明本文の行と列を保ち、独立した閉じ波括弧は文に揃えます。
[usecase の規則](./usecase.ja.md#direction-and-accessibility)を
参照してください。
[fixture: usecase/direction-and-accessibility/a11y-padding]
[fixture: usecase/direction-and-accessibility/a11y-closer-aligned]

stereotype の宣言接尾辞は、systemBoundary 内も含め、
`<<` の前と、各区切りの内側の空白の有無を保ちます。
空白があれば 1 個に縮め、なければ足しません。
Mermaid は内部の両端を除き、`<<` の前の空白は構造上の空白です。
内部のテキストは書かれたままです。
保護したセミコロンの接頭部と共通コメント領域は、値の全体を保ちます。
[class の文に付く注釈の規則](./class.ja.md#whitespace-between-tokens)を
再利用します。
[fixture: usecase/stereotypes/stereotype-padding]
[fixture: usecase/stereotypes/opener-gap-sides]
[test: usecase: stereotype-opener-tab]
[fixture: usecase/stereotypes/stereotype-inner-kept]
[fixture: usecase/stereotypes/side-padding]
[fixture: usecase/stereotypes/boundary-suffixes]
[fixture: usecase/stereotypes/semicolon-padding-kept]
[test: usecase: stereotype-comment-region-padding-kept]

ラベルと引用、境界タイトルの余白、継続列は、
除去や引用の変更で Db が等しい場合も書かれたままです。
共通コメント領域の結合と LS、PS を越える native コメントを保ちます。
セミコロンは文を区切らず、文字列の保持部分をすべて保護します。
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

[pie の規則](./pie.ja.md)は引用符、escape、数値の綴り、
値の継続列、重複と原文の順序を保ちます。
共通の title/accessibility 行の両端は C4 と同様に整えますが、
pie は次の物理行の値を結合しません。
空のラベルと説明 block も実際の構文です。
[fixture: pie/labels/label-quotes] [fixture: pie/numbers/number-spellings]
[fixture: pie/title/title-next-trivia]
[fixture: pie/description-blocks/block-empty]

Hidden YAML と hidden DIRECTIVE は PieIgnoredText であり、
先頭の frontmatter や Root の directive とは別です。
範囲外で消費する LF、余分な EOL、受理を決める閉じの空白も含め、
原文の位置に保ちます。
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
セミコロンをすべて残し、交差する値と trivia の prefix 全体を保護します。
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

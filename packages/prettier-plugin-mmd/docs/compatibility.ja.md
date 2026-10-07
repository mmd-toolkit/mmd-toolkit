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
図の中に `@{ ... }` で書くデータブロックは、解析しません。
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
description ブロックの文で、ほかのブロックと同じく整形します。
トークンの間の空白は
[トークンの間の空白](./flowchart.ja.md#トークンの間の空白)に従い、
ブロックの中の改行は保ち、`}` は `accDescr` と同じ段に置きます。
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
[fixture: sequence/statements-one-per-line/empty-description-block-moves-next-statement]

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

## U+2028 か U+2029 の後のコメント行

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

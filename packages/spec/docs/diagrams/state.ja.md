# State

英語版: [state.md](./state.md)

mermaid.js の中の正しさの源:

- [`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison)
- [`stateDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts)
- [`dataFetcher.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts)
- [`state/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state)
  のテスト（`*.spec.js`、`*.spec.ts`）

この文書は図種 `stateDiagram` を扱います。
木のノードは [ast/state.ja.md](../ast/state.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の 20 番がこの文法を選びます。
テキストが、空白の後に、
この大文字小文字のとおりの `stateDiagram` で始まるときです。
mermaid.js は、
2 つのヘッダー `stateDiagram` と `stateDiagram-v2` に 1 つの検出器を持ち、
どちらも同じ文法と同じ Db で読みます
（[`stateDetector-V2.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDetector-V2.ts#L7-L15)）。
[fixture: state/header-v1] [fixture: state/header-v2]

その後、字句解析器はヘッダーを、大文字小文字を区別せずに、
後に空白が続くものとして読み直します（[文の文脈](#文の文脈) を参照）。
そのため `stateDiagram-V2` はヘッダーで、
`stateDiagramX` と `stateDiagram-v3` は state 図として検出されて拒否されます。
ヘッダーの後の空白は、改行でもそうでなくてもかまいません。
文はヘッダーと同じ行に続けられ、ヘッダーだけでも受理されます。
その後に改行がなくても受理されます。
字句解析器は最後の文字の後に改行を読むからです
（[テキストの終わり](../common.ja.md#テキストの終わり) を参照）。
[fixture: state/header-v2-upper-case] [fixture:
state/header-word-after-keyword] [fixture: state/header-other-suffix]
[fixture: state/header-statement-same-line] [fixture: state/header-only]
[fixture: state/header-only-without-line-feed]

ヘッダーの前の `%%` だけの行や、ディレクティブではない `%%{ }%%` の行は
`%%` だけの行で、検出はそれを読んで通り過ぎてヘッダーを探し、
どの図種でも同じく、ここでは印 `%%` の図のコメントです
（[図種の検出](../common.ja.md#図種の検出) を参照）。
コメントはどのノードにも属さず、StateDiagram はヘッダーから始まります。
`%%` だけの行は mermaid.js も同じに読みます。
`%%{` で始まる行では mermaid.js は入力を拒否します。
state の字句解析器が `%%` を無視されるテキストとして読み、
文法は `{` を取らないからです。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
[fixture: state/header-after-bare-percent-line] [fixture:
state/header-after-empty-braces-line]

## 字句構造

字句解析器は、[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
行終端はそれぞれ `\n`、属性の引用符は `'`、
エンティティはその置き換えの文字として読み、
コメントの領域と、行の規則が無視する `;` は、ないものとして読み進めます。
字句解析器が最後の文字の後に読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は、
図のテキストの一部です。
この節は、図の独自の単位の規則、
[ソースの読み方](../common.ja.md#ソースの読み方) の 4 番を述べます。

この図の mermaid.js の字句解析器は、文字を大文字小文字を区別せずに比べます
（[表記](../common.ja.md#表記) を参照）。
`STATE A {`、`Note Left Of A : x`、`HIDE EMPTY DESCRIPTION` は、
小文字の語と同じに読まれます。
[fixture: state/lex-keyword-upper-case] [fixture: state/lex-note-mixed-case]
[fixture: state/lex-hide-upper-case]
下の**キーワード**は、大文字小文字を区別せずに一致する語で、
後に語の文字が続かないものです（[表記](../common.ja.md#表記) を参照）。
そのため `clickable` と `notes` は id で、
`click-x` では字句解析器はキーワード `click` を読みます。
[fixture: state/lex-keyword-prefix-of-id] [fixture:
state/lex-keyword-before-dash]

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれます。
各単位は、文法が使う名前と、**テキスト**、
つまり読んだ文字を変換した形で持ちます。

字句解析器は**文脈**のスタックを持ちます。
文の文脈から始めます。
規則は、文脈に入る（スタックの上に置く）か、
いまの文脈を出る（その下の文脈に戻る）ことがあります。
文の文脈を出ても、文の文脈のままです。
各位置で、字句解析器は、いまの文脈の規則のうち、
そこで一致する最初のものを当てます。
規則が読む空白は、規則が別に言わない限り、どの単位にも属しません。
いまの文脈のどの規則も一致しなければ、入力は拒否されます。
下の一覧はこれを繰り返しません。

テキストは、文の文脈で終わってもかまいません。
タイトル、説明、説明のブロックの文脈、`classDef` と `style` のスタイル、
`class` の CSS クラス、`as` の後の id の中で終わってもかまいません。
そのような文脈に入る単位のすぐ後で終わるときは、その値は空です。
テキストが、合成状態の本体、文字列、ノート、scale の文脈の中で終わると、
入力は拒否されます。
[fixture: state/lex-acc-title-at-end]
[fixture: state/db-acc-descr-empty-replaces] [fixture:
state/lex-acc-descr-block-unclosed] [fixture:
state/lex-classdef-without-styles] [fixture: state/lex-style-without-styles]
[fixture: state/lex-class-css-class-at-end]
[fixture: state/lex-alias-as-at-end] [fixture:
state/lex-floating-note-as-at-end] [fixture: state/lex-composite-unclosed]
[fixture: state/lex-alias-string-unclosed] [fixture:
state/lex-floating-note-string-unclosed] [fixture:
state/lex-note-unclosed-at-end] [fixture: state/lex-scale-at-end]

**id。**
いくつかの文脈で、同じ規則が id を読みます。
`:`、改行、空白、`-`、`{` 以外の 1 つ以上の文字を、できるだけ多く読むと、
`id` の単位になります。
読んだ文字が、最初の文字より後に `%%` を持つときは、
単位はその `%%` の前で終わり、
字句解析器は、規則が残した文脈で、その `%%` から読み続けます。
文の文脈、合成状態の本体の文脈、state の文脈では、
その `%%` は図のコメントを始めます
（[コメント](#コメント) を参照）。
一方、`note-id` の後のノートのテキストの文脈にはコメントの規則がなく、
`note left of A%% c : hi` は拒否されます。
[fixture: state/lex-note-id-percent]
そのため id は、`;`、`#`、`"`、`}`、1 つの `%` を持てます。
`A;B` と `A#1` は状態で、文の文脈の `}` だけのものも状態です。
[fixture: state/lex-semicolon-in-id] [fixture: state/lex-hash-in-id]
[fixture: state/lex-close-brace-as-id] [fixture:
state/lex-percent-comment-in-id]
下で id を読むと言うほかの規則も同じです。
文の文脈と合成状態の本体の文脈で単位が始まるところでは、
`%%` は `{` が続かなければコメントとして読まれ、
ディレクティブを始めない `{` の前の `%%` は、
文の文脈では `ignored-text` の単位で（規則 9）、
合成状態の本体の文脈では id です。
本体の文脈には `{` の規則がないので、そこでは入力は拒否されます。
どちらの文脈でも、方向の行が先に試されます。
`%%{}direction LR` の行は、本体の中でも方向を決めます。
[fixture: state/lex-direction-line-after-ignored-percent]
[fixture: state/lex-composite-direction-line-after-ignored-percent]
[fixture: state/lex-composite-direction-line-after-ignored-percent-space-brace]
[fixture: state/lex-composite-direction-line-after-emptied-directive]
[fixture: state/lex-composite-ignored-percent-rejected]
`floating-note-id` も `%%` で始まってかまいません。
`alias-id` と `note-id` は、最初の文字でも `%%` の前で終わります（下を参照）。

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを除いた後のテキストを読むように読みます。
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位に当てはまります。
テキストと文字列の単位の中のディレクティブは、
入力の mermaid.js の読み方を保ち、
名前の単位を含む、ほかの単位の中のディレクティブは、入力を拒否させます。
**名前の単位**は、
`id`、`state-name`、`class-name`、`note-id` の単位です。
**テキストの単位**は、
`description` の単位の `:` の後のテキスト、
`alias-id`、`second-description`、`pseudostate-name`、`note-text`、
`floating-note-text`、`floating-note-id`、`style-text`、`css-class` の単位、
`title-text`、`description-text`、`description-block-text` の単位、
`direction-text` と `ignored-text` の単位です。
**文字列の単位**は、`string` と `empty-string` の単位です。
[fixture: state/div-directive-in-state-name]
[fixture: state/div-directive-in-class-name]
[fixture: state/div-directive-in-note-id]
[fixture: state/div-directive-in-class-separator]
[fixture: state/div-directive-in-terminal]
[fixture: state/div-directive-in-pseudostate-mark]
[fixture: state/div-directive-in-divider]
[fixture: state/lex-directive-in-alias-id]
[fixture: state/lex-directive-in-second-description]
[fixture: state/lex-directive-in-pseudostate-name]
[fixture: state/lex-directive-in-floating-note-id]
[fixture: state/lex-directive-in-style-text]
[fixture: state/lex-directive-in-css-class]
[fixture: state/lex-directive-in-acc-title-text]
[fixture: state/lex-directive-in-acc-descr-text]
[fixture: state/lex-directive-in-acc-descr-block-text]
[fixture: state/lex-directive-in-direction-text]
[fixture: state/lex-directive-in-ignored-text]
[fixture: state/tokens-directive-note-spaces]

- `A : x%%{init: {}}%%y` は A に説明 `xy` を与え、
  `note "x%%{init: {}}%%y" as N` はテキスト `xy` の浮いたノートです。
  mermaid.js と同じです。
  [fixture: state/lex-directive-in-description] [fixture:
  state/lex-directive-in-floating-note-text]
- 2 つの単位の間のディレクティブは、その種類によらずかまいません。
  `A%%{init: {}}%%--> B` は遷移です。
  [fixture: state/lex-directive-between-units]
- 文字列の中のディレクティブは、単位の中のどこにあっても、
  mermaid.js の読み方を保ちます。
  `state "a%%{init: {}}%%b" as A` は A にラベル `ab` を与え、
  `state "a %%{init: {}}%% b" as A` はラベル `a`、空白 2 つ、`b` を与え、
  URL が `"u%%{init: {}}%%v"` の click の文は受理されます。
  [fixture: state/lex-directive-in-state-string] [fixture:
  state/lex-directive-in-state-string-spaces] [fixture:
  state/lex-directive-in-click-href-string]
  ディレクティブだけの文字列は空の文字列として読まれます。
  `state "%%{init: {}}%%" as A` は `state "" as A` と同じく拒否され、
  `state "%%{init: {}}%%" A` は `state "" A` と同じく受理されます。
  [fixture: state/lex-directive-in-state-string-only] [fixture:
  state/lex-directive-in-empty-string-before-name]
- `sta%%{init: {}}%%te A {`、`Fo%%{init: {}}%%o --> B`、
  `A -%%{init: {}}%%-> B` では、
  ディレクティブはキーワード、id、矢印の中にあり、入力は拒否されます。
  mermaid.js はそれを受理し、2 つ目では `Foo` からの遷移を持ちます
  （[既知の差異](#既知の差異) を参照）。
  [fixture: state/div-directive-in-keyword] [fixture: state/div-directive-in-id]
  [fixture: state/div-directive-in-arrow]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. キーワード `click`。`click` の単位。
   [fixture: state/lex-click-empty-strings]
2. キーワード `href`。`href` の単位。
   [fixture: state/gram-click-terminal]
3. `"`、改行を含む `"` 以外の 0 個以上の文字、`"`。`string` の単位。
   引用符の間に文字がなければ空です。
   [fixture: state/tokens-comment-region-in-alias-string]
   [fixture: state/gram-state-empty-string-before-name]
4. キーワード `default`。`default` の単位。
   [fixture: state/lex-keyword-default-as-id]
5. **方向の行**（下を参照）。
   [fixture: state/lex-direction-line-then-comment]
6. 1 つ以上の改行。`newline` の単位。
   [fixture: state/lex-blank-lines-between-statements]
7. 改行を含む 1 つ以上の空白。何も作りません。
   [fixture: state/lex-state-name-next-line]
8. `#` と、改行までのその行の残り。印が `#` の図のコメント
   （[コメント](#コメント) を参照）。
   [fixture: state/lex-hash-comment-after-statement]
9. `{` が続かない `%%` と、改行までのその行の残り。印が `%%` の図のコメント。
   ディレクティブを始めない `{` が続く `%%` は、
   mermaid.js が読まない `ignored-text` の単位です。
   [fixture: state/lex-percent-comment-after-statement]
   [fixture: state/lex-percent-before-brace-rejected]
10. `scale` と 1 つ以上の空白。`scale` の単位。scale の文脈に入ります。
    [fixture: state/gram-scale]
    [fixture: state/lex-scale-number-next-line]
11. `accTitle`、0 個以上の空白、`:`、0 個以上の空白。
    `accTitle` の単位と `:` の単位。タイトルの文脈に入ります。
    [fixture: state/lex-acc-title-at-end]
    [fixture: state/lex-acc-title-space-before-colon]
    [fixture: state/lex-acc-title-line-feed-before-colon]
    [fixture: state/lex-acc-title-no-whitespace]
12. `accDescr`、0 個以上の空白、`:`、0 個以上の空白。
    `accDescr` の単位と `:` の単位。説明の文脈に入ります。
    [fixture: state/db-acc-descr-empty-replaces]
    [fixture: state/lex-acc-descr-space-before-colon]
    [fixture: state/demo-state-26627e00]
    [fixture: state/lex-acc-descr-line-feed-before-colon]
13. `accDescr`、0 個以上の空白、`{`、0 個以上の空白。
    `accDescr` の単位と `{` の単位。説明のブロックの文脈に入ります。
    [fixture: state/db-acc-descr-block-replaces]
    [fixture: state/lex-acc-descr-block-line-feed-before-brace]
    [fixture: state/lex-acc-descr-block-no-whitespace]
14. `classDef` と 1 つ以上の空白。`classDef` の単位。classDef の文脈に入ります。
    [fixture: state/lex-classdef-without-styles]
    [fixture: state/lex-classdef-keyword-line-feed]
15. `class` と 1 つ以上の空白。`class` の単位。class の文脈に入ります。
    [fixture: state/db-class-before-state]
    [fixture: state/lex-class-keyword-line-feed]
16. `style` と 1 つ以上の空白。`style` の単位。style の文脈に入ります。
    [fixture: state/db-style-without-text]
    [fixture: state/lex-style-keyword-line-feed]
17. `state` と、改行を含む 1 つ以上の空白。`state` の単位。
    state の文脈に入ります。
    その後の、`empty-string` の単位でない最初の単位が、
    `{` の単位、`ignored-text` の単位、
    またはほかの `ignored-state` の単位のときは、
    代わりに `ignored-state` の単位です。
    mermaid.js は `state` にトークンを読まないので、
    その `{` はその前の文の本体を始めます
    （[合成状態、別名、疑似状態](#合成状態別名疑似状態) を参照）。
    [fixture: state/lex-state-without-body]
    [fixture: state/gram-ignored-state-before-body-next-line]
18. `{`。`{` の単位。合成状態の本体の文脈に入ります。
    [fixture: state/db-parent-set-by-later-composite]
19. `note` と 1 つ以上の空白。`note` の単位。ノートの文脈に入ります。
    [fixture: state/db-note-after-state-shape]
    [fixture: state/lex-note-keyword-line-feed]
20. `stateDiagram` と 1 つ以上の空白、
    または `stateDiagram-v2` と 1 つ以上の空白。
    `header` の単位。
    [fixture: state/header-v1]
    [fixture: state/header-v2]
21. 語の間に空白 1 つのキーワード `hide empty description`。
    `hide` の単位、`empty` の単位、`description-word` の単位。
    最後の名前は、`description` が説明の単位の名前だからです。
    `hide empty descriptionx` は 3 つの状態です。
    [fixture: state/lex-hide-then-word]
    空白は図のテキストで数え、
    その隣のディレクティブは 2 つの単位の間にあります。
    `hide%%{init: {}}%% empty description` と
    `hide empty%%{init: {}}%% description` はこの文で、
    `hide %%{init: {}}%% empty description` は空白が 2 つなので、
    3 つの状態 `hide`、`empty`、`description` です。
    どれも mermaid.js と同じです。
    [fixture: state/lex-directive-between-hide-and-empty] [fixture:
    state/lex-directive-between-empty-and-description] [fixture:
    state/lex-hide-directive-between-spaces]
22. `[*]`。`[*]` の単位。
    [fixture: state/db-root-start-shared]
23. id（[id](#単位と文脈) を参照）。
    [fixture: state/lex-keyword-prefix-of-id]
24. **説明**。0 個以上の空白、`:`、そして 1 つ以上の文字をできるだけ多く。
    その各文字は、`:`、`;`、改行以外の文字か、
    そのような文字が後に続く `:` です。
    `description` の単位。
    [fixture: state/lex-colon-in-description]
    [fixture: state/lex-description-without-space]
25. `-->`。`-->` の単位。
    [fixture: state/lex-semicolon-after-transition]
26. `:::`。`:::` の単位。
    [fixture: state/db-definition-css-class]
27. ほかの文字。`invalid` の単位。
    [fixture: state/lex-dash-in-id]

規則 10 から 21 の語は、この図のどこでもそうであるように、
大文字小文字を区別せずに比べます。
その後の改行を含む空白は、どの単位にも属しません。
`default`、click の文の外の `href`、click の文の外の `string`、
`invalid` の単位は、
文法のどの規則も取らないので、それを持つ入力は拒否されます。
[fixture: state/lex-keyword-default-as-id]
[fixture: state/lex-string-outside-click]
[fixture: state/lex-keyword-href-as-id]
[fixture: state/lex-dash-in-id]
この順から生じることがいくつかあります。

- ディレクティブは、`%%{` の後に 0 個以上の空白と名前（語）が続くときだけ始まり
  （[ディレクティブの位置](../common.ja.md#ディレクティブの位置) を参照）、
  コメントは、`{` が続かない `%%` でだけ始まります。
  そのため `%%{}` と `%%{ }` はどちらでもなく、
  その `%%` は、文法が本体の `{` の前でだけ取る `ignored-text` の単位です
  （[文法](#合成状態別名疑似状態) を参照）。
  `state X` の後の行 `%%{}`、`%%{ }`、`%%{}%%` は、空の本体を持つ合成状態 X で、
  `A` の後では `{` が拒否されます。
  `state X` の後の行 `%%{init: {}}%%` と、
  行 `A` が続く `%%{` はディレクティブで、
  `%% {}` はコメントなので、X は本体を持ちません。
  [fixture: state/gram-ignored-percent-before-body-next-line] [fixture:
  state/gram-ignored-percent-space-brace-before-body-next-line] [fixture:
  state/gram-ignored-percent-emptied-directive-next-line] [fixture:
  state/lex-percent-before-brace-rejected] [fixture:
  state/lex-directive-line-after-state-name] [fixture:
  state/lex-directive-name-next-line-after-state-name] [fixture:
  state/lex-comment-space-brace-after-state-name]
- キーワードは、単位が始まるところではどこでもキーワードです。
  `click`、`default`、`note` への遷移は拒否され、
  `clickable` と `notes` は id です。
  [fixture: state/lex-keyword-click-as-id] [fixture:
  state/lex-keyword-default-as-id] [fixture: state/lex-keyword-prefix-of-id]
- `-` は id の文字ではないので、`A-B` は拒否されます。
  `--` は合成状態の本体の中でだけ読まれます。
  [fixture: state/lex-dash-in-id] [fixture:
  state/lex-divider-outside-composite]
- `;` は区切りではなく id の文字です。
  `A --> B; B --> C` は、A から状態 `B;` への遷移と、
  B から C への遷移を持ちます。
  説明は `;` で終わり、その後は次の文として読まれます。
  `A : x;y` は A に説明 `x` を与え、状態 `;y` を加えます。
  [fixture: state/lex-semicolon-after-transition] [fixture:
  state/lex-semicolon-ends-description]
- 説明は 1 つの `:` を持てますが、2 つ続けては持てず、`:` で終われません。
  `A : x:y` は説明 `x:y` を持ち、`A : x::y` は拒否され、
  `A::c` は A に説明 `:c` を与えます。
  [fixture: state/lex-colon-in-description] [fixture:
  state/lex-two-colons-in-description] [fixture:
  state/lex-double-colon-description]
- 説明は `:` の後に文字が要ります。
  `A :` は拒否され、空白のある `A : ` は受理されます。
  [fixture: state/gram-description-colon-only] [fixture:
  state/gram-description-blank]
- 文字列は、click の文の文法が取るところでだけ読まれます。
  `A --> "B"` は拒否されます。
  [fixture: state/lex-string-outside-click]
- 改行の前の空白は、規則 7 で改行と一緒に読まれ、`newline` の単位を作りません。
  文法が `newline` の単位を要るのは click の文の後だけなので、
  `click A href "u"` の後に空白と改行があり、
  その後に別の文が続くものは拒否され、
  空白がなければ受理されます。
  [fixture: state/lex-click-spaces-before-line-feed] [fixture:
  state/lex-click-line-feed]

**方向の行。**
大文字小文字を区別せずに比べます。
いまの位置から、改行、U+2028、U+2029 を持たない文字の並びで、
後が続けられる最も長いもの、
`direction`、1 つ以上の空白、この順に試す `TB`、`BT`、`RL`、`LR` のどれか、
そして次の改行までのすべての文字です。
規則は、`direction` を `direction` の単位、値を `direction-value` の単位、
`direction` の前と値の後の文字を `direction-text` の単位として読み、
mermaid.js は `direction-text` の単位を読みません。
この規則は id の規則より前に試されるので、行の全体を取ります。
`B : x direction LR` は方向を決め、状態を持ちません。
`A --> B direction LR` も同じで、`Direction lr` は方向の行です。
この規則はコメントの規則より前にも試されるので、
値の後のテキストは `%%` を持てます。
`direction LR %% c` は方向 `LR` を決め、
`%% c` はコメントでなく `direction-text` の単位です。
値は語の境目で終わらなくてもかまいません。
`direction TBX` は `TB` を決め、`X` は `direction-text` の単位です。
値は書かれた順に試します。
行のどこかに `direction`、空白、`TB` があれば値は `TB` で、
なければ `BT` を試し、以下同様です。
値について、字句解析器はその値が続く並びの最後の `direction` を取ります。
そのため `direction TB x direction TB` は最後の `direction` で読まれ、
`direction TB x` は `direction-text` の単位です。
一方 `direction TB x direction LR` は `TB` を決めて最初の `direction` で読まれ、
`x direction LR` は `direction-text` の単位です。
[fixture: state/lex-direction-line-same-value-twice]
[fixture: state/lex-direction-line-two-values]
[fixture: state/lex-direction-line-in-description] [fixture:
state/lex-direction-line-same-line-transition] [fixture:
state/lex-direction-lower-case] [fixture: state/lex-direction-line-then-comment]
[fixture: state/lex-direction-line-value-then-text]
[fixture: state/lex-direction-line-after-line-separator]
[fixture: state/lex-direction-rl]
`direction` と値の間の空白は改行を含められます。
`direction`、改行、`LR` は方向の行です。
[fixture: state/lex-direction-value-next-line]

### 合成状態の本体の文脈

合成状態の本体の文脈には、文の文脈か state の文脈の `{` で入ります。
合成状態の文を読みます。

1. 改行以外の 1 つ以上の空白。何も作りません。
   [fixture: state/db-nested-terminals]
2. `#` とその行の残り。文の文脈の規則 8 と同じ図のコメント。
   [fixture: state/lex-composite-hash-comment]
3. `{` が続かない `%%` とその行の残り。文の文脈の規則 9 と同じ図のコメント。
   [fixture: state/lex-composite-percent-comment]
4. 文の文脈の規則 14 から 17。`classDef`、`class`、`style`、`state`。
   [fixture: state/db-nested-classdef]
   [fixture: state/db-nested-class-statement]
   [fixture: state/gram-ignored-states-in-composite-body]
   [fixture: state/db-nested-style-statement]
5. 方向の行。
   [fixture: state/lex-composite-direction-line]
6. `}`。`}` の単位。合成状態の本体の文脈を出ます。
   [fixture: state/db-nested-terminals]
7. 改行。何も作りません。
   [fixture: state/db-nested-terminals]
8. 文の文脈の規則 19。`note`。
   [fixture: state/db-note-in-composite]
9. `[*]`。`[*]` の単位。
   [fixture: state/db-nested-terminals]
10. id。
    [fixture: state/lex-composite-default-as-id]
11. 文の文脈の規則 24 と同じ説明。
    [fixture: state/tokens-composite-description-ignored-semicolon]
12. `-->`。`-->` の単位。
    [fixture: state/db-nested-terminals]
13. `--`。`--` の単位、つまり**区切り**。
    [fixture: state/lex-composite-divider]
14. `:::`。`:::` の単位。
    [fixture: state/lex-composite-class-separator]

文の文脈のほかの規則は、ここでは試されません。
`click`、`href`、`default`、`"`、`accTitle`、`accDescr`、`scale`、
`hide empty description`、ヘッダーです。
それらの語は、合成状態の本体では id です。
`click B href "u"` は 4 つの状態 `click`、`B`、`href`、`"u"` で、
`accTitle: x` は説明 `x` を持つ状態 `accTitle`、
`hide empty description` は 3 つの状態です。
[fixture: state/lex-composite-click-as-ids] [fixture:
state/lex-composite-acc-title-as-state] [fixture:
state/lex-composite-hide-as-states] [fixture:
state/lex-composite-string-as-id] [fixture: state/lex-composite-default-as-id]
ここでは改行は単位を作りません。
`state` の規則は方向の行より前にあるので、
本体の中の `state B direction LR` は state の文で、
`B : x direction LR` は方向の行です。
[fixture: state/lex-composite-state-before-direction] [fixture:
state/lex-composite-direction-line]

### state の文脈

state の文脈には `state` で入ります。
`state` の後の空白は改行を含められるので、名前は次の行でもかまいません。
[fixture: state/lex-state-name-next-line]

1. 改行以外の 1 つ以上の空白。何も作りません。
   [fixture: state/lex-state-two-names]
2. `#` とその行の残り。文の文脈の規則 8 と同じ図のコメント。
   [fixture: state/lex-state-name-hash-comment]
3. `{` が続かない `%%` とその行の残り。文の文脈の規則 9 と同じ図のコメント。
   [fixture: state/gram-ignored-state-after-comment-before-body]
4. **疑似状態の印**。
   `<<fork>>`、`<<join>>`、`<<choice>>`、`[[fork]]`、`[[join]]`、`[[choice]]` を
   この順に試し、次の改行、U+2028、U+2029 より前に最初に現れるものについて、
   いまの位置から、そこでのその最後の出現までのすべての文字を読みます。
   印の前の文字は、両端の空白を除いて、
   空でなければ `pseudostate-name` の単位で、
   印はそのテキストを名前とする単位です。state の文脈を出ます。
   [fixture: state/lex-fork-spaced-id]
5. `"`。state の文字列の文脈に入ります。
   [fixture: state/db-alias-blank-without-body]
6. 0 個以上の空白、`as`、改行を含む 1 つ以上の空白。
   `as` の単位。別名の id の文脈に入ります。
   [fixture: state/lex-alias-no-space-before-as]
   [fixture: state/lex-alias-id-percent-next-line]
7. 語、改行を含む 1 つ以上の空白、もう 1 つの語、
   そして改行、U+2028、U+2029 以外の 0 個以上の文字をできるだけ少なく、`{`。
   拒否されます。mermaid.js は「State name must be a single word」の
   エラーを投げます。
   ほかの規則と同じく、state の文脈で単位が始まりうるところで試されるので、
   最初の名前の後の各名前でも、もう一度試されます。
   [fixture: state/lex-state-two-names-body]
8. 改行、空白、`{` 以外の 1 つ以上の文字。`state-name` の単位。
   [fixture: state/lex-state-without-body]
9. 改行。state の文脈を出ます。
   [fixture: state/lex-state-name-state-then-composite]
10. `{`。`{` の単位。state の文脈を出て、合成状態の本体の文脈に入ります。
    [fixture: state/lex-state-brace-next-line]

この順から生じることがいくつかあります。

- 疑似状態の印の前のテキストは、空白を含めてその名前です。
  `state f 1 <<fork>>` は fork `f 1` で、
  `state "Some::call()" as one <<choice>>` は、
  choice `"Some::call()" as one` です。
  規則 4 が文字列より前にあるからです。
  印の前に何もなくてもかまいません。
  `state <<join>>` は空の id の join です。
  前の種類の印は、後にあっても勝ちます。
  `state a <<join>> b <<fork>>` は fork `a <<join>> b` です。
  [fixture: state/lex-pseudostate-first-mark-kind]
  印の後では、行は文の文脈で読まれます。
  `state x <<choice>> y` は choice x と状態 y を加えます。
  [fixture: state/lex-fork-spaced-id] [fixture:
  state/lex-choice-after-alias] [fixture: state/lex-join-empty-id] [fixture:
  state/lex-choice-then-state] [fixture: state/lex-choice-square-brackets]
  行の U+2028 の後の印は、その前からは見つかりません。
  `state a`、U+2028、`b <<fork>>` は、状態名 `a` と fork `b` です。
  [fixture: state/lex-pseudostate-mark-after-line-separator]
- `state-name` はそれぞれ 1 つの文で、本体がなければ何も加えません
  （[文法](#文法) を参照）。
  `state A` と `state a b` は何も加えず、`state` だけでも受理されます。
  [fixture: state/lex-state-without-body] [fixture: state/lex-state-two-names]
  [fixture: state/lex-state-keyword-alone]
- 規則 7 は、最後の語の行にある `{` の前の 2 つ以上の語を、
  語の間の空白が改行を持っていても拒否します。
  `state a b {`、`state a b c {`、`state a`、タブ、`b {`、
  そして `state a`、改行、`b {` は、間に空の行があっても拒否されます。
  `state a b`、改行、`C {` も拒否されます。
  `b` の行に `{` が続かないので、規則 7 は `a` では一致せず、
  `a` は `state-name` で、
  `b` でもう一度試された規則が、`b`、改行、`C`、`{` を読むからです。
  [fixture: state/lex-state-two-names-body-next-line] [fixture:
  state/lex-state-three-names-body] [fixture: state/lex-state-two-names-tab]
  [fixture: state/lex-state-name-blank-lines-then-brace] [fixture:
  state/lex-state-two-names-brace-next-line]
  この規則は、空白の両側の語と、2 つ目の語の行の `{` を要ります。
  `state a -b {` は状態名 `a` と合成状態 `-b`、
  `state a:b {` は合成状態 `a:b` です。
  `state a`、改行、`B` の後では、改行が state の文脈を出るので、
  後の行の `state D {` は合成状態の文です。
  [fixture: state/lex-state-dash-word-body] [fixture:
  state/lex-state-colon-name-body] [fixture:
  state/lex-state-name-lines-then-composite] [fixture:
  state/lex-state-name-state-then-composite]
  `state a`、改行、`B` の後の次の行の `C {` は、文の文脈で読まれ、
  文法は定義の文の後の `{` を取らないので、入力は拒否されます。
  [fixture: state/lex-state-name-lines-then-two-names]
  [issue #7091](https://github.com/mermaid-js/mermaid/issues/7091) は、
  最後の語だけが取られることを報告しました。
  ラベル `Type: Bug / Error` と `Status: Approved` を持ち、
  2026-06-04 に、この規則を足した
  [pull request #7570](https://github.com/mermaid-js/mermaid/pull/7570)
  で閉じられました。
  [fixture: state/lex-state-two-names-body]
- 改行は state の文脈を出し、文の文脈の `{` も合成状態の本体の文脈に入るので、
  本体の `{` は名前の次の行でもかまいません。
  [fixture: state/lex-state-brace-next-line]

**state の文字列の文脈。**
`"` は state の文字列の文脈を出ます。
`"` 以外の 1 つ以上の文字は、文字列のテキストです。
`"` から `"` までの文字列は、1 つの `string` の単位です。
2 つ目の `"` が最初の `"` のすぐ後に続くときは、
代わりに `empty-string` の単位です。
mermaid.js は、この文脈の文字列の引用符にはトークンを返さず、
そのテキストにだけ返すので、空の文字列を読みません
（[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L128-L132)）。
木は、文法がそれを取るところで、それを StateIgnoredText として持ちます
（[合成状態、別名、疑似状態](#合成状態別名疑似状態) を参照）。
空の文字列も単位なので、mermaid.js でその引用符がそうするように、
その前の単位を終わらせます。
`state ""`、改行、`A` では、改行が state の文脈を出て、`A` は状態ですが、
`state`、改行、`A` では、`state` の後の空白が改行を読み、`A` は状態名です。
`state x "" y {` では、空白の後に `"` が続くので、規則 7 は `x` で当たらず、
入力は文 x と合成状態 y ですが、`state x y {` は拒否されます。
[fixture: state/gram-state-empty-string-alone] [fixture:
state/gram-state-empty-string-then-line] [fixture:
state/gram-state-empty-string-between-names-before-body]
文法が空の文字列を取らないところでは、両方が入力を拒否します。
`as` の前に文字列が要る `state "" as A` と `state "" as`、
そして `state {` と同じく、本体のある `state "" {` です。
[fixture: state/lex-alias-empty-string] [fixture:
state/gram-state-empty-string-before-as-at-end] [fixture:
state/gram-state-empty-string-before-body]
単位の始まりの空の文字列でない引用符は、両方が同じに読みます。
`state "" <<fork>>` は、規則 4 が規則 5 より先なので、fork `""` です。
本体のある `state x"" {` は、規則 8 が引用符を名前の文字として読むので、
合成状態 `x""` です。
[fixture: state/lex-state-empty-string-before-pseudostate-mark] [fixture:
state/lex-state-name-ending-in-quotes]
`as` は文字列のすぐ後に続けられます。`state "d"as A`。
[fixture: state/lex-alias-no-space-before-as]

**別名の id の文脈。**
改行と `{` 以外の 0 個以上の文字は、両端の空白を除いて `alias-id` の単位です。
最初の `%%` の前で、それが最初の文字でも終わります。
別名の id の文脈を出るので、state の文脈が読み続け、
そこでは `%%` は、`{` が続かなければコメントを始めます。
そのため `as` の後の id は空白と `:` を持てます。
`state "d" as my id` は状態 `my id` を加えます。
id は `{` の前と `%%` の前で空でもかまいません。
`state "d" as %% c` と `state "d" as %%A` は、
空の id の別名の定義とその後のコメントで、状態を加えません。
[fixture: state/lex-alias-id-spaces]
[fixture: state/lex-alias-id-trailing-spaces]
[fixture: state/lex-alias-without-id]
[fixture: state/lex-alias-comment-after-id] [fixture:
state/lex-alias-id-percent-comment] [fixture: state/lex-alias-id-percent-word]
[fixture: state/lex-alias-id-percent-next-line]
テキストが `%%` で始まり、その行で `{` が続くときは、
`{` の前のテキストが、終わりの空白を除いて、
代わりに mermaid.js が読まない `ignored-text` の単位で、
`alias-id` はありません。
`state "d" as %%{}` と `state "d" as %% c {` は、
id がなく本体のある別名の定義です。
[fixture: state/lex-alias-id-ignored-percent-brace] [fixture:
state/lex-alias-id-ignored-percent-before-body]

別名の文が本体を持たないときは、
字句解析器は `alias-id` を最初の `:` で分けます。
その前のテキストが `alias-id`、その `:` が `:` の単位、
それと 2 つ目の `:` または終わりの間のテキストが `second-description` の単位
（空でも、空白だけでもかまいません）、
2 つ目の `:` からのテキストが `ignored-text` の単位で、
mermaid.js はそれを読みません
（[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L233-L243)）。
`alias-id` の後に、その行で、または、その行の改行と、
行の空白とコメント行だけの後で `{` が続き、
その間に、文法が本体の `{` の前に取る単位、
つまり空の説明ブロック、`ignored-state` の単位と空の文字列、
`{` のすぐ前の `%%` だけがあるとき、別名の文は本体を持ち、
`alias-id` は分けません
（[合成状態、別名、疑似状態](#合成状態別名疑似状態) を参照）。
そのため、行 `%%{}` か `accDescr {} %%{}` が続く `state "d" as A : x` は、
空の本体を持つ合成状態 `A : x` を定めます。
[fixture: state/lex-alias-colon-ignored-percent-before-body-next-line]
[fixture: state/lex-alias-colon-block-and-ignored-percent-before-body-next-line]
`state "d" as A : x {` と、行 `{` が続く `state "d" as A : x` は、
合成状態 `A : x` を定め、空の行の後の `{` は本体を始めず、入力は拒否されます。
空白だけの行は、文の文脈の規則 7 がその改行とともに読むので、
単位を作らず、何も変えません。
[fixture: state/lex-alias-colon-whitespace-line-before-body]
[fixture: state/lex-alias-colon-tab-line-before-body]
[fixture: state/lex-alias-colon-block-then-spaces-before-body]
[fixture: state/lex-alias-second-description] [fixture:
state/lex-alias-third-part]
[fixture: state/db-alias-colon-empty-second]
[fixture: state/db-alias-colon-spaces-second]
[fixture: state/lex-alias-colon-before-body]
[fixture: state/lex-alias-colon-before-body-next-line] [fixture:
state/lex-alias-colon-before-body-after-comment-line] [fixture:
state/lex-alias-colon-blank-line-before-brace]

### classDef、class、style の文脈

`classDef` は **classDef の文脈**に入ります。

1. `default` と 1 つ以上の空白。`default` の単位。
   文法はそれを取らないので、`classDef default …` は拒否されます。
   [fixture: state/lex-classdef-default]
2. 1 つ以上の語の文字と、改行を含む 1 つ以上の空白。
   空白を除いて `class-name` の単位。スタイルの文脈に入ります。
   [fixture: state/lex-classdef-styles-next-line]
   [fixture: state/lex-classdef-name-non-word]

`class` は **class の文脈**に入ります。

1. 1 つ以上の語の文字に、`,`、0 個以上の空白、
   1 つ以上の語の文字の 0 回以上の繰り返しが続くもの。
   語の文字の並びごとに `id` の単位、`,` ごとに `id-comma` の単位。
   クラス名の文脈に入ります。
   [fixture: state/lex-class-ids-space]
   [fixture: state/lex-class-ids-comma]

`style` は **style の文脈**に入ります。

1. 1 つ以上の語の文字と `,`、そして改行を含む 1 つ以上の空白。
   語の文字の並びごとに `id` の単位、`,` ごとに `id-comma` の単位。
   スタイルの文脈に入ります。
   [fixture: state/lex-style-empty-id]

これらの文脈は、その規則が読むと出ます。
その後、**スタイルの文脈**は、改行までのその行の残りを読み、
それを `,` ごとに、
両端の空白を除いた `style-text` の単位と `,` の単位に分けます。
**クラス名の文脈**は、その行の残りを、
両端の空白を除いた 1 つの `css-class` の単位として読みます。
どちらも空でもかまいません。どちらも、読むと出ます。

- `classDef default fill:#f00` は拒否されます。
  [fixture: state/lex-classdef-default]
- クラス名の後の空白は改行を含められるので、スタイルは次の行でもかまいません。
  `classDef a`、改行、`B` は、スタイル `B` を持つクラス `a` を定めます。
  `classDef a`、改行、`B --> C` は、スタイル `B --> C` を持つクラス `a` を定め、
  遷移を持ちません。
  [fixture: state/lex-classdef-styles-next-line] [fixture:
  state/db-classdef-without-styles-takes-transition]
- `class` の文の CSS クラスは、空白を含めてその行の残りです。
  `class A bad x` は `bad x` を当て、空でもかまいません。
  `class A` は受理されます。
  [fixture: state/lex-class-name-spaces] [fixture: state/lex-class-ids-space]
  [fixture: state/lex-class-without-name]
  `,` と空白の後の語はもう 1 つの id で、`,` の前の空白は id を終えます。
  `class A, c` は A と c に空の CSS クラスを当て、
  `class A ,B c` は A に `,B c` を当てます。
  [fixture: state/lex-class-comma-space-id] [fixture:
  state/lex-class-ids-then-comma]
- `style` の文の id は、終わりにも空の項目を持てます。
  `style A,,B fill:red` と `style A, fill:red` は受理されます。
  [fixture: state/lex-style-empty-id] [fixture:
  state/lex-style-ids-trailing-comma]
  id はその後の空白で終わるので、その空白の後の `,` は、
  `id-comma` ではなく、スタイルの `,` の単位です。
  `style A ,x` は A に空のスタイルと `x` を当て、
  `style A ,` は 2 つの空のスタイルを、
  `style A , ,x` は 2 つの空のスタイルと `x` を当てます。
  `style A,B , x` は A と B に空のスタイルと `x` を当て、
  `style A , B x` は A に空のスタイルと `B x` を当てます。
  [fixture: state/db-style-comma-after-space] [fixture:
  state/db-style-comma-only-after-space] [fixture:
  state/db-style-two-commas-after-space] [fixture:
  state/db-style-ids-then-comma-after-space] [fixture:
  state/db-style-comma-then-id-and-style]

### scale の文脈

`scale` は scale の文脈に入ります。
1 つ以上の ASCII の数字は `number` の単位で、
1 つ以上の空白に続くキーワード `width` は `width` の単位で、
scale の文脈を出ます。`scale 3 widthx` は拒否されます。
`scale 350 width` は受理され、`scale 350` は拒否されます。
[fixture: state/gram-scale] [fixture: state/gram-scale-without-width]
[fixture: state/lex-scale-width-then-word]
[fixture: state/lex-scale-non-ascii-digit]
`scale` の後の空白は改行を含められます。
`scale`、改行、`3 width` は scale の文です。
[fixture: state/lex-scale-number-next-line]

### ノートの文脈

`note` は**ノートの文脈**に入ります。

1. 語の間に空白 1 つのキーワード `left of` か `right of`、つまり**位置**。
   `left` か `right` の `position` の単位と、`of` の単位。
   ノートの id の文脈に入ります。
   [fixture: state/db-note-after-state-shape]
2. `"`。浮いたノートの文脈に入ります。
   [fixture: state/lex-floating-note]

空白 2 つの `note left  of A : x`、タブにしたもの、
`note over A : x` は拒否されます。
位置の後に語の文字が続く `note right ofx A`、`note left ofA : x`、
`note left of1 : x` も拒否されます。
`note right of#A : x` では、位置の後にノートの id `#A` が続きます。
[fixture: state/lex-note-two-spaces-in-position] [fixture:
state/lex-note-over] [fixture: state/lex-note-position-then-word] [fixture:
state/lex-note-position-then-id] [fixture: state/lex-note-position-then-digit]
[fixture: state/lex-note-position-then-hash] [fixture:
state/lex-note-tab-in-position]
空白は図のテキストで数え、その隣のディレクティブは 2 つの単位の間にあります。
`note left%%{init: {}}%% of A: t` と `note left %%{init: {}}%%of A: t` は
A のノートで、
`note left %%{init: {}}%% of A: t` は空白が 2 つなので拒否されます。
どれも mermaid.js と同じです。
[fixture: state/lex-directive-between-left-and-of] [fixture:
state/lex-directive-between-space-and-of] [fixture:
state/lex-note-position-directive-between-spaces]

**ノートの id の文脈**は、改行を含む 0 個以上の空白と、
`:`、改行、空白、`-` 以外の文字の id を読みます。
これは `note-id` の単位で、最初の `%%` の前で、それが最初の文字でも終わり、
そのときは空です。
そのような `%%` がなければ 1 文字以上が要るので、
`note left of : x` は拒否されます。
[fixture: state/lex-note-empty-id-before-colon]
ノートの id の文脈は、その後、
コメントの規則のない、ノートのテキストの文脈に入ります。
位置のすぐ後に、空白なしで `%%` が続くときは、
そこからの `:`、改行、空白、`-` 以外の文字が、
代わりに mermaid.js が読まない `ignored-text` の単位で、
ノートの id の文脈は読み続けます。
`note left of%%x A : t` は A のノートです。
[fixture: state/lex-note-id-ignored-percent-after-position]
そのため `note right of %% c S`、行 `x`、`end note` では、
ノートの id は空で、ノートのテキストは `%% c S`、改行、`x` です。
一方 `note right of %%S : x` は、
`%%S : x` がノートのテキストでないので拒否されます。
[fixture: state/lex-note-id-percent-block] [fixture:
state/lex-note-id-percent-after-space]
`note right of`、改行、`A : x` は A のノートで、
`note right of-A : x` は拒否されます。
[fixture: state/lex-note-position-then-line-feed] [fixture:
state/lex-note-position-then-dash]

**ノートのテキストの文脈**:

1. 0 個以上の空白、`:`、`:`・`;`・改行以外の 1 つ以上の文字をできるだけ多く。
   `:` の `:` の単位、`:` が `note-id` のすぐ後にあり、
   その後の文字が空白でなければ、mermaid.js が落とすその文字の
   `ignored-text` の単位（下を参照）、
   その後の文字の、両端の空白を除いた `note-text` の単位。
   ノートの文脈を出ます。
   [fixture: state/db-note-after-state-shape]
2. 改行を含む、できるだけ少ない任意の文字、改行、0 個以上の空白、
   キーワード `end note`。
   改行の前の文字の、両端の空白を除いた `note-text` の単位と、
   `end` の単位と `note` の単位。
   ノートの文脈を出ます。
   語の間が空白 2 つかタブなら、ノートはそこで終わりません。
   空白は図のテキストで数え、その隣のディレクティブは 2 つの単位の間にあります。
   `end%%{init: {}}%% note` と `end %%{init: {}}%%note` はノートを終え、
   空白が 2 つの `end %%{init: {}}%% note` では終わらず、入力は拒否されます。
   どれも mermaid.js と同じです。
   [fixture: state/lex-end-note-two-spaces] [fixture: state/lex-end-note-tab]
   [fixture: state/lex-directive-between-end-and-note] [fixture:
   state/lex-directive-between-space-and-note] [fixture:
   state/lex-end-note-directive-between-spaces]
   [fixture: state/lex-note-block]

- mermaid.js は、1 行のノートのテキストを、`note-id` のすぐ後から、
  最初の 2 文字と両端の空白を除いて読みます。
  その最初の文字は、空白か `:` です。
  `:` の前に空白が 2 つ以上あると、`:` は mermaid.js が読むテキストの文字です。
  `note left of A  :hi` のテキストは `:hi` です。
  `:` が `note-id` のすぐ後にあるとき、`:` の後の文字は、
  空白でなければ落とされ、規則 1 の `ignored-text` の単位です。
  `note left of A:hi` のテキストは `i` で、
  `note left of A:h` は空のテキストです。
  それ以外では、2 文字は `:` と空白で、テキストは `note-text` の単位です。
  [fixture: state/lex-note-two-spaces-before-colon] [fixture:
  state/lex-note-colon-without-space] [fixture:
  state/lex-note-colon-then-one-character]
- 1 行のノートのテキストは `:` か `;` で終わります。
  `note left of A : a:b` は拒否され、
  `note left of A : hi;x` では `;` の後の残りは状態 `;x` です。
  [fixture: state/lex-note-colon-in-text] [fixture:
  state/lex-note-semicolon]
- 何行かにわたるノートのテキストは、
  空白の後の最初の語が `end note` である最初の行で終わります。
  `send note` は終わりになりません。
  `end note` はキーワードなので、`end notex` も終わりになりません。
  [fixture: state/lex-note-end-note-then-word]
  [issue #7089](https://github.com/mermaid-js/mermaid/issues/7089) は、
  それが終わりになることを報告しました。
  ラベル `Type: Bug / Error` と `Status: Approved` を持ち、
  2026-04-14 に
  [pull request #7508](https://github.com/mermaid-js/mermaid/pull/7508)
  で閉じられました。
  [fixture: state/lex-note-block] [fixture: state/lex-note-block-upper-case]
  [fixture: state/lex-note-block-empty] [fixture:
  state/lex-note-end-note-in-word]

**浮いたノートの文脈**:

1. 0 個以上の空白、`as`、0 個以上の空白。
   `as` の単位。この文脈を出て、浮いたノートの id の文脈に入ります。
   [fixture: state/lex-floating-note]
2. `"`。`"` の単位。
   [fixture: state/lex-floating-note-extra-quote-before-text]
3. 改行を含む、`"` 以外の 1 つ以上の文字。`floating-note-text` の単位。
   [fixture: state/lex-floating-note]

`note` の後の `"` も `"` の単位です。
引用符は対になりません。
mermaid.js は、ここで `"` にはトークンを返さず、
ほかの文字の並びごとにトークンを返し
（[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L143-L146)）、
その文法は `as` の前のテキストを 1 つだけ取ります。
そのため浮いたノートは、`as` の前に、1 つ以上の `"` の単位、
1 つの `floating-note-text`、1 つ以上の `"` の単位を持ちます。
`note "x" as N`、`note ""x" as N`、`note "x"" as N`、
`note """x""" as N` のテキストは `x` で、
`note "" x" as N` のテキストも `x` です。
テキストは、`floating-note-text` の単位から両端の空白を除いたものです
（[StateFloatingNoteStatement](../ast/state.ja.md#statefloatingnotestatement)
を参照）。
[fixture: state/lex-floating-note-extra-quote-before-text] [fixture:
state/lex-floating-note-extra-quote-after-text] [fixture:
state/lex-floating-note-extra-quotes-around-text] [fixture:
state/lex-floating-note-text-after-quotes-and-space]
テキストは、`note " " as N` や、改行 1 つだけのテキストのように、
すべて空白でもよく、改行を持てます。
[fixture: state/lex-floating-note-whitespace-text] [fixture:
state/lex-floating-note-line-feed-text] [fixture:
state/lex-floating-note-line-feed]
テキストが 2 つあるか、ないときは、入力は拒否されます。
`note "a"b" as N`、引用符の間の空白が 2 つ目のテキストになる
`note "x" "" as N`、`note "" as N`、`note """ as N` です。
[fixture: state/lex-floating-note-two-texts] [fixture:
state/lex-floating-note-space-between-quoted-parts] [fixture:
state/lex-floating-note-empty-string] [fixture:
state/lex-floating-note-quotes-only]
規則 1 は単位が始まるところでいつも規則 3 より先に試され、
その `as` の後には空白が要らないので、
`as` で始まるテキストは、大文字小文字を問わず、
空白（改行を含む）の後でもそうでなくても `as` の単位として読まれ、
浮いたノートはテキストを持たず、入力は拒否されます。
`note "assume" as N`、`note "as you like" as N`、`note " as x" as N`、
`note "AS x" as N` です。
規則 3 はテキストを次の `"` まで読むので、その後ろの `as` はテキストの一部です。
`note "a as b" as N` と `note "x as" as N` です。
`as` は最後の `"` のすぐ後にも、次の行にも続けられます。
[fixture: state/lex-floating-note] [fixture:
state/lex-floating-note-text-starts-with-as] [fixture:
state/lex-floating-note-text-starts-with-as-word] [fixture:
state/lex-floating-note-text-starts-with-space-as] [fixture:
state/lex-floating-note-text-starts-with-upper-case-as] [fixture:
state/lex-floating-note-as-inside-text] [fixture:
state/lex-floating-note-text-ends-with-as] [fixture:
state/lex-floating-note-no-space-before-as] [fixture:
state/lex-floating-note-as-next-line]
**浮いたノートの id の文脈**は、その行の残りを id として読みます。
`floating-note-id` の単位で、空白を持て、
最初の文字より後の `%%` の前で終わります。
それを読むと、この文脈を出ます。
[fixture: state/lex-floating-note-id-spaces]

### アクセシビリティの値

タイトルの文脈と説明の文脈では、行の残り、
つまり改行以外の 0 個以上の文字が `title-text` か `description-text` の単位で、
文脈を出ます。
`#`、`;`、`%%` はその文字です。
`accTitle: a;b #c %% d` のタイトルは `a;b #c %% d` です。
`:` の後の空白は、改行も含めて `:` の単位と一緒に読まれるので
（文の文脈の規則 11 と 12）、テキストは次の行にあってもかまいません。
[fixture: state/lex-acc-title-semicolon]
[fixture: state/lex-acc-descr-semicolon] [fixture:
state/lex-acc-title-next-line]

説明のブロックの文脈では、`}` は `}` の単位で文脈を出て、
ほかの 1 つ以上の文字は `description-block-text` の単位です。
`{` の後の空白は `{` の単位と一緒に読まれるので（文の文脈の規則 13）、
`accDescr {  }` はテキストを持ちません。
[fixture: state/db-acc-descr-empty-block-keeps]

これらの文脈に入る規則は、文の文脈だけの規則です。
合成状態の本体では、`accTitle` と `accDescr` は id です
（[合成状態の本体の文脈](#合成状態の本体の文脈) を参照）。
テキストは、これらのどの文脈で終わってもかまいません
（[単位と文脈](#単位と文脈) を参照）。
[fixture: state/lex-composite-acc-title-as-state] [fixture:
state/lex-acc-title-at-end] [fixture: state/lex-acc-descr-block-unclosed]

### コメント

`#` と `%%` は、
いまの文脈のコメントの規則が単位の始まりより前に試されるところで、
図のコメントを始めます。
文の文脈、合成状態の本体の文脈、state の文脈の、単位の始まりと、
最初の文字より後の `%%` の前で終わる id と `floating-note-id` の後、
どの `%%` の前でも終わる `alias-id` の後です。
`note-id` の後のノートのテキストの文脈には、コメントの規則がありません。
文の後のコメントはそう読まれます。
`A --> B # c`、`A --> B %% c`、`A --> B%% c` は、
A から B への遷移とコメントを持ちます。
[fixture: state/lex-hash-comment-after-statement] [fixture:
state/lex-percent-comment-after-statement] [fixture:
state/lex-percent-comment-in-id] [fixture: state/lex-alias-comment-after-id]
[fixture: state/lex-floating-note-id-comment]

図のコメントは、その**印**から改行までです。
その行の U+2028 か U+2029 の後にコメント行があっても、それを越えて続き、
そのコメント領域が図のコメントを 2 つに切ります。
`A %% x`、U+2029、行 `%% end`、行 `B` の状態は A だけです。
[fixture: state/lex-diagram-comment-across-comment-line]
印は、`#` で始まるコメントでは `#`、`%%` で始まるコメントでは `%%` で、
値は印の後のテキストです。
`# c` と `%% c` の値は空白と `c` で、`%%% c` の値は `%`、空白、`c` です。
id の中のコメントは、id が終わる `%%` から始まります。
`B%% c` は状態 B と、値が空白と `c` のコメントです。
[fixture: state/lex-comment-percent-three]
印は、字句解析器が読むとおり、ディレクティブのないテキストで見つけ、
値は、ディレクティブを含めた、印の後のソースのテキストです。
`A --> B %%%{init: {}}%%% c` では、
ディレクティブのないテキストは `A --> B %% c` なので、
印は最初と最後の `%` で、値は空白と `c` です。
コメント `# x%%{init: {}}%%y` の値は、空白と `x%%{init: {}}%%y` です。
[fixture: state/lex-comment-directive-between-marks] [fixture:
state/lex-hash-comment-directive-inside]

ほかの単位の中では、`#` と `%%` はテキストの文字です。
説明、遷移のラベル、ノートのテキスト、`classDef` と `style` のスタイル、
`class` の CSS クラス、タイトル、説明、疑似状態の名前、文字列です。
`A : x %% c` は A に説明 `x %% c` を与え、
`A --> B : x %% c` はラベル `x %% c` を持ち、
`state "a%%b" as A` は説明 `a%%b` を持ちます。
[fixture: state/lex-percent-in-description] [fixture:
state/lex-hash-in-description] [fixture: state/lex-percent-in-label]
[fixture: state/lex-percent-in-note] [fixture: state/lex-classdef-percent]
[fixture: state/lex-alias-percent-in-string]
[fixture: state/lex-style-percent]
[fixture: state/lex-class-css-class-percent]
[fixture: state/lex-pseudostate-name-percent]
id の中では、`#` は文字です。`A#1` は状態です。
[fixture: state/lex-hash-in-id]
エンティティは、字句解析器がテキストを読む前に、
その置き換えの文字として読まれるので
（[エンティティ](../common.ja.md#エンティティ) を参照）、
`#amp;` はコメントを始めません。
`A --> B #amp; x` は状態 `ﬂ°amp¶ß` と `x` を加えます。
[fixture: state/lex-entity-in-id]

mermaid.js の文書は、
[Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/stateDiagram.md#L307-L320)
で、
「any text after their start to the next newline will be treated as a comment」
と書き、コメントは「can be on their own line or at the end of a statement」
と書いています。
説明、ラベル、ノートのテキストの後では、`%%` は代わりにテキストの一部です。
[issue #7090](https://github.com/mermaid-js/mermaid/issues/7090)
「state diagram: comments are not on their own line」は、
文書と字句解析器のそのような違いを挙げ、
その中に `s2: %% not a comment !!!` がありました。
2026-02-27 に collaborator が、bot が書いた印のある返信で、
コメントは遷移と同じ行で働くべきでないと答え、不具合として承認しました。
[pull request #7520](https://github.com/mermaid-js/mermaid/pull/7520) は、
初めはコメントをそれだけの行に限りました。
2026-04-13 に、bot が書いた印のある返信が、
代わりに `%%` を「both at the beginning of a line and inline
(anywhere on a line, outside of the `%%{...}%%` directive syntax)」で
コメントの始まりとして認めるよう求め、
この pull request は 2026-04-21 に、
id の後のコメントと上の文書とともにマージされました。
そのテストが確かめるのは、id の後のコメントだけです。
issue は閉じられています。

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字の代わりに単位の上で使います。
`id` のような単位の名前は、その名前の単位 1 つを表し、
二重引用符の中のテキストは、`"state"` や `"{"` のように、
そのテキストを名前とする単位を表します。
`end-of-text` はテキストの終わりを表します。
`string` は空でない `string` の単位を、
`string-or-empty` は空でもよい `string` の単位を表します。
文法は
[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L178-L352)
の文法を言い直したもので、同じ単位の並びを受理します。

下の各規則は、
[ast/state.ja.md](../ast/state.ja.md) で定める木のノードを作ります。

| 規則                                                                                          | ノード                                                                                                      |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                                     | StateDiagram                                                                                                |
| `definition-statement`                                                                        | StateDefinitionStatement                                                                                    |
| `transition-statement`                                                                        | StateTransitionStatement                                                                                    |
| `state-reference`                                                                             | StateReference。その `"[*]"` は StateTerminal                                                               |
| `composite-statement`                                                                         | StateCompositeStatement                                                                                     |
| `alias-statement`                                                                             | StateAliasDefinitionStatement                                                                               |
| `pseudostate-statement`                                                                       | StatePseudostateDefinitionStatement                                                                         |
| `ignored-statement`                                                                           | StateIgnoredStatement                                                                                       |
| `"--"`                                                                                        | StateDividerStatement                                                                                       |
| `note-statement`                                                                              | StateNoteStatement                                                                                          |
| `floating-note-statement`                                                                     | StateFloatingNoteStatement                                                                                  |
| `click-statement`                                                                             | StateClickStatement                                                                                         |
| `empty-description-block`                                                                     | テキストのない StateAccDescrBlockStatement。その前の文の後の文。本体の `{` の前では `textBeforeBody` の一部 |
| `class-def-statement`                                                                         | StateClassDefStatement                                                                                      |
| `class-statement`                                                                             | StateClassStatement                                                                                         |
| `style-statement`                                                                             | StateStyleStatement                                                                                         |
| `direction-statement`                                                                         | StateDirectionStatement。`direction-text` ごとに StateIgnoredText                                           |
| `accessibility-statement`                                                                     | StateAccTitleStatement、StateAccDescrStatement、StateAccDescrBlockStatement のどれか                        |
| `scale-statement`                                                                             | StateScaleStatement                                                                                         |
| `"hide" "empty" "description"`                                                                | StateHideEmptyDescriptionStatement                                                                          |
| `string` か `string-or-empty`                                                                 | StringLiteral                                                                                               |
| `number`                                                                                      | NumericLiteral                                                                                              |
| 下に挙げる名前                                                                                | Identifier                                                                                                  |
| 下に挙げる引用符のないテキスト                                                                | StateLiteral                                                                                                |
| 本体の `{` の前の、空の文字列、空の説明ブロック、`ignored-state` の単位、`ignored-text`       | 合わせて 1 つの StateIgnoredText で、その文の `textBeforeBody`                                              |
| `ignored-text`、`ignored-state`、またはほかの文の中のそれ以外の一続きの `empty-string` の単位 | StateIgnoredText                                                                                            |

名前は、`id`、`state-name`、`class-name`、`note-id` です。
引用符のないテキストは、`description` の `:` の後のテキスト、`alias-id`、
`second-description`、`pseudostate-name`、`note-text`、`floating-note-text`、
`floating-note-id`、`style-text`、`css-class`、
そして `title-text`、`description-text`、`description-block-text` です。
空白 2 つ以上の後では、
1 行のノートの `:` の単位とその後の `note-text` の単位は、
合わせて 1 つのテキストです。
`note left of A  :hi` の StateLiteral は `:hi` です
（[StateNoteStatement](../ast/state.ja.md#statenotestatement) を参照）。
[fixture: state/lex-note-two-spaces-before-colon] [fixture:
state/lex-note-three-spaces-before-colon]

### 図と文

```text
diagram    = newline* "header" line*
line       = statement | newline
statement  = definition-statement
           | transition-statement
           | composite-statement
           | alias-statement
           | pseudostate-statement
           | ignored-statement
           | "--"
           | note-statement
           | floating-note-statement
           | click-statement statement-end
           | class-def-statement
           | class-statement
           | style-statement
           | direction-statement
           | accessibility-statement
           | scale-statement
           | "hide" "empty" "description"
```

2 つの文を区切るものはありません。
文は別の文と同じ行に続けられ、
その間の `newline` の単位はそれだけで 1 つの `line` です。
`A --> B C --> D` は 2 つの遷移を持ち、`A B` は 2 つの状態を加えます。
[fixture: state/lex-two-transitions-one-line] [fixture:
state/lex-two-states-one-line]
`;` は区切りではなく id の文字です（[文の文脈](#文の文脈) を参照）。
`"--"` の単位は、合成状態の本体からだけ来ます
（[合成状態の本体の文脈](#合成状態の本体の文脈) を参照）。

### 区切りの前の空の説明ブロック

```text
statement-end           = empty-description-block* ( newline | end-of-text )
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位に、
`description-block-text` の単位なしで `}` の単位がすぐ続くものです。
区切りが要る文は `statement-end` で終わります。
文の最後の単位の後、区切りの前には、空の説明ブロックがいくつ来てもかまいません。
それぞれ、その文の後に続く、テキストのない説明ブロックの文で、何も変えません。
mermaid.js は空の説明ブロックにトークンを読まないので
（[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）、その文の後にすぐ区切りが続くものとして読みます。
テキストのある説明ブロックと、ほかの文は、区切りの前に置けません。

state では 2 つの文の間に何も要らず、文は各文のすぐ後で始まり、
区切り（改行かテキストの終わり）が要る文は click の文だけです
（[click の文](#click-の文) を参照）。
そのため `click A "u" "t" accDescr {}` は click の文と空の説明ブロックの文です。
ブロックの前の空白は単独で読まれるので、ブロックの後の改行が click の文の
`newline` の単位です。
`click A href "u"`、空白 2 つ、`accDescr {}`、改行は受理されますが、
ブロックがなければ、空白と改行が一緒に読まれて `newline` の単位が残らないので、
入力は拒否されます。
`click A "u" "t" accDescr {x}` と `click A "u" "t" accDescr {} B` は、
mermaid.js と同じく拒否されます。
[fixture: state/gram-click-empty-description-block-after] [fixture:
state/gram-click-empty-description-blocks-after] [fixture:
state/gram-click-spaces-then-empty-description-block] [fixture:
state/gram-click-after-statement-then-empty-description-block] [fixture:
state/gram-click-description-block-with-text-after] [fixture:
state/gram-click-empty-description-block-then-statement] [fixture:
state/lex-click-spaces-before-line-feed]

ヘッダーのすぐ後、その行で文が始まってもよいので
（[検出](#検出) を参照）、そこにある空の説明ブロックに固有の規則は要りません。
それは文が始まるところにあり、図の最初の文です。
`stateDiagram-v2 accDescr {}`、改行、`A --> B` は、
mermaid.js と同じく受理されます。
[fixture: state/header-empty-description-block]

### 状態と遷移

```text
definition-statement = state-reference description?
transition-statement = state-reference "-->" state-reference description?
state-reference      = ( id | "[*]" ) ( ":::" id )?
```

状態は、その id か、始まりまたは終わりを表す `[*]` で書きます。
状態の後の `description` はその説明で、遷移の後のものは遷移のラベルです。
遷移の 2 つ目の状態は、矢印の行にあります。
`A -->`、改行、`B` は拒否されます。
[fixture: state/gram-transition-line-feed-after-arrow]
`:::` と id は、状態にクラスを与えます。
`:::` の周りの空白はあってもなくてもかまいません。
[fixture: state/gram-style-separator-spaces] [fixture:
state/gram-style-separator-transition] [fixture:
state/gram-terminal-style-separator]
`[*]` だけでも文で、`[*]x` は `[*]` と状態 x です。
[fixture: state/gram-terminal-alone] [fixture: state/gram-terminal-then-id]

### 合成状態、別名、疑似状態

```text
composite-statement   = "state"
                                            | "state"? empty-string* state-name ( empty-string* empty-description-block* ( ignored-state empty-string* )* ignored-text? "{" line* "}" )?
ignored-statement     = empty-string+
alias-statement       = "state"? empty-string* string empty-string* "as" alias-id? ( ":" second-description? ignored-text? )? ( empty-description-block* ( ignored-state empty-string* )* ignored-text? "{" line* "}" )?
pseudostate-statement = "state"? pseudostate-name? pseudostate-mark
pseudostate-mark      = "<<fork>>" | "<<join>>" | "<<choice>>" | "[[fork]]" | "[[join]]" | "[[choice]]"
```

これらの文の単位は、`state` が入る state の文脈から来ます
（[state の文脈](#state-の文脈) を参照）。
`state` の単位は、state の文脈が読む最初の文に属し、
同じ文脈でその後に続く文は `state` を持ちません。
`state a b` は 2 つの合成状態の文で、2 つ目は `state` を持ちません。
[fixture: state/lex-state-two-names]
本体の `{` の前の `ignored-text` は、mermaid.js が読まない `%%` で、
名前の次の行か、`as` の後にあります
（[state の文脈](#state-の文脈) を参照）。
[fixture: state/gram-ignored-percent-before-body-next-line] [fixture:
state/gram-ignored-percent-before-alias-body-next-line] [fixture:
state/lex-alias-id-ignored-percent-before-body]
別名の文が `:`、`second-description`、その後の `ignored-text` を持つのは、
本体がないときだけです
（[別名の id の文脈](#state-の文脈) を参照）。

本体の `{` が名前か別名の id の次の行にあるとき、その行の `{` の前には、
周りの空白とともに空の説明ブロックが来てもかまいません。
そこの `%%` の前でも同じです。
mermaid.js はそれにトークンを読まないので、`{` はやはり本体を始めます。
それらは、そこの空の文字列と `%%` とともに、文の `textBeforeBody`、
つまり `{` の前の mermaid.js が読まないテキストの一部です。
そのため、`state "d" as A`、改行、本体のある `accDescr {} {` は受理され、
ブロックのない同じ入力の Db を持ちます。
ブロック 2 つ、`%%{}` が続くブロック、2 つの行の間のコメント行も同じです。
`accDescr {}{` が続く `state "d" as A : x` は、ブロックがないときと同じく、
`A : x` を分けません。
`state X ""` か `state X %% c` の後では、
次の行の `{` の前のブロックは X の `textBeforeBody` です。
ブロックは `{` の行になければなりません。
独立の行のブロックに行 `{` が続くものでは、ブロックは文で、
その後の `{` は本体を始めず、
別名の id の行では、ブロックは別名の id の一部です。
どちらの入力も、mermaid.js と同じく拒否されます。
`state X`、改行、`accDescr {} {` では、
state の文脈の規則 7 が `accDescr` を 2 つ目の語として読み、
mermaid.js と同じく入力を拒否します。
`{` の前のテキストのある説明ブロックは、両方が拒否します。
[fixture: state/gram-empty-description-block-before-alias-body-next-line]
[fixture: state/gram-empty-description-block-before-alias-colon-body-next-line]
[fixture: state/gram-empty-description-block-after-empty-string-before-body]
[fixture: state/gram-empty-description-block-after-comment-before-body]
[fixture: state/gram-empty-description-blocks-before-alias-body-next-line]
[fixture: state/gram-empty-description-block-before-ignored-percent-body]
[fixture: state/gram-empty-description-block-after-comment-line-before-body]
[fixture: state/gram-empty-description-block-before-body-second-word]
[fixture: state/gram-empty-description-block-line-before-body]
[fixture: state/gram-empty-description-block-same-line-before-alias-body]
[fixture: state/gram-description-block-with-text-before-body]

空の説明ブロックの後、その `{` の前には、
`ignored-state` の単位（文の文脈の規則 17）が、
その後の空の文字列とともに来てもよく、
これも `textBeforeBody` の一部です。
`state X ""`、`state X %% c`、`state "d" as A`、`state "d" as A : x` の後では、
行 `state {` はその文の本体を始めます。
`state "d" as A : x` は分けません。
`state` の後の空白は改行を含むので、
`state`、改行か空の行、`{` も同じで、行 `{` が続く `state %% c` も同じです。
mermaid.js はどれにもトークンを読まないので、
`ignored-state` の単位はいくつ続いてもかまいません。
`state "d" as A : x` の後の、行 `state %% c`、`state "" ""`、本体のある `{` は
A の本体を始め、`state %% c` と行 `state {` も同じです。
`state X` の後でも、合成状態の本体の中でも同じで、
行 `%%{ }%%{` の `%%` の前の `state` も同じです。
後に `{` がなければ、それらは `state` の文です。
それらの間の空の行は `newline` の単位で、その後では入力は拒否されます。
mermaid.js と同じです。
[fixture: state/gram-ignored-states-two-before-alias-body]
[fixture: state/gram-ignored-states-three-before-alias-body]
[fixture: state/gram-ignored-states-empty-strings-then-comment]
[fixture: state/gram-ignored-states-whitespace-line-between]
[fixture: state/gram-ignored-states-then-state-brace]
[fixture: state/gram-ignored-states-before-composite-body]
[fixture: state/gram-ignored-states-in-composite-body]
[fixture: state/gram-ignored-state-before-ignored-percent]
[fixture: state/gram-ignored-states-empty-line-between-rejected]
[fixture: state/gram-ignored-states-after-plain-name-rejected]
[fixture: state/gram-state-comment-lines-then-statement]
文の文脈では、名前の行の後の空の行は `newline` の単位で（規則 6）、
文法は本体の `{` の前に `newline` の単位を取らないので、
その後の `ignored-state` の単位はどの規則にも取られず、
mermaid.js と同じく入力は拒否されます。
空白だけの行は、規則 7 がその改行と、その後の空の行とともに読むので、
`newline` の単位ではなく、その後でも `{` や `state {` は本体を始めます。
`newline` の単位になるのは、名前の行のすぐ後の空の行だけです。
[fixture: state/gram-composite-whitespace-line-then-empty-line-before-body]
[fixture: state/gram-composite-empty-line-then-whitespace-line-before-body-rejected]
`state` の後のコメントと `{` の間の空の行は、
`state` の後の `newline` の単位なので、
そのとき `state` は `state` の単位で、入力は拒否されます。
改行が単位を作らない合成状態の本体の中では、名前の後の空の行は何も変えず、
一方、合成状態の本体の文脈には `{` の規則がありません。
名前の後の行の `{` は、間に何があっても拒否され、
そこで本体を始めるのは `state {` だけです。
[fixture: state/gram-composite-brace-next-line-in-composite-body-rejected]
`state X`、改行、`state {` の `state` は、state の文脈の規則 7 の 2 つ目の語で、
規則 7 が入力を拒否します。
[fixture: state/gram-ignored-state-before-body-next-line]
[fixture: state/gram-ignored-state-after-comment-before-body]
[fixture: state/gram-ignored-state-before-alias-body-next-line]
[fixture: state/gram-ignored-state-before-alias-colon-body-next-line]
[fixture: state/gram-ignored-state-after-empty-description-block]
[fixture: state/gram-ignored-state-empty-string-before-brace]
[fixture: state/gram-ignored-state-empty-body]
[fixture: state/gram-ignored-state-line-feed-before-brace]
[fixture: state/gram-ignored-state-blank-line-before-brace]
[fixture: state/gram-ignored-state-comment-before-brace]
[fixture: state/gram-ignored-state-in-composite-body]
[fixture: state/gram-ignored-state-blank-line-after-name-in-composite-body]
[fixture: state/gram-ignored-state-after-hash-comment-before-body]
[fixture: state/gram-ignored-state-directive-before-brace]
[fixture: state/gram-ignored-state-upper-case]
[fixture: state/gram-ignored-state-empty-strings-before-brace]
[fixture: state/gram-ignored-state-after-whitespace-line]
[fixture: state/gram-composite-whitespace-line-before-body]
[fixture: state/gram-ignored-state-empty-line-after-alias-in-composite-body]
[fixture: state/gram-ignored-state-after-plain-name-rejected]
[fixture: state/gram-ignored-state-blank-line-after-name-rejected]
[fixture: state/gram-ignored-state-comment-blank-line-rejected]
[fixture: state/gram-ignored-state-comment-blank-line-in-composite-body-rejected]
[fixture: state/gram-ignored-state-after-definition-rejected]
[fixture: state/gram-ignored-state-at-start-rejected]
[fixture: state/lex-state-glued-brace-rejected]

`empty-string` の単位も、state の文脈の、単位が始まるところから来ます
（[state の文字列の文脈](#state-の文脈) を参照）。
mermaid.js はそれを読まず、間に空白しかない一続きの `empty-string` の単位は、
木では 1 つのノード、つまり欄の StateIgnoredText か StateIgnoredStatement です。
名前の前では、ほかの文の後に続くときも、その合成状態の文の `textBeforeId` です。
[fixture: state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-strings-before-name] [fixture:
state/gram-state-empty-strings-adjacent] [fixture:
state/gram-state-empty-string-before-word-starting-with-as] [fixture:
state/gram-state-empty-string-before-name-with-body] [fixture:
state/gram-state-empty-string-between-names]
本体の `{` の前では `textBeforeBody` で、
`{` の前の次の行の `%%` も持ち、最初の空の文字列から `%%` までが
1 つの StateIgnoredText です。
[fixture: state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-state-empty-string-after-name-body-next-line] [fixture:
state/gram-state-empty-string-then-percent-before-body] [fixture:
state/gram-state-empty-strings-before-and-after-name]
別名の文の文字列の前と後では、その `textBeforeDescription` と
`textAfterDescription` です。
[fixture: state/gram-state-empty-string-before-alias-string] [fixture:
state/gram-state-empty-strings-before-alias-string] [fixture:
state/gram-state-empty-string-after-alias-string] [fixture:
state/gram-state-empty-string-after-alias-string-glued] [fixture:
state/gram-state-empty-strings-around-alias-string]
そして、`state` の後か文の後で、名前も文字列も本体の `{` も続かないときは、
`ignored-statement` で、StateIgnoredStatement です。
`state ""` は文 `state` とそのような文で、
`state x ""` も、文 x とそのような文です。
一方、`state x ""` か `state x "" %% c` の後に行 `{` が続くと、
空の文字列は x の `textBeforeBody` です。
名前、文字列、本体が後に続く一続きの空の文字列は、その文に属し、
`ignored-statement` にはなりません。
[fixture: state/gram-state-empty-string-alone] [fixture:
state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-before-comment] [fixture:
state/gram-state-empty-string-after-name-body-next-line] [fixture:
state/gram-state-empty-string-before-comment-body-next-line]
そのため、空の文字列は、state の文脈のどこにあっても、
mermaid.js と同じく受理され、Db を何も変えません。

### ノート

```text
note-statement          = "note" position "of" ignored-text? note-id? ( ":" ignored-text? note-text? | note-text? "end" "note" )
floating-note-statement = "note" '"'+ floating-note-text '"'+ "as" floating-note-id?
```

### click の文

```text
click-statement = "click" state-reference ( string-or-empty string-or-empty | "href" string-or-empty )
```

click の文は、後に改行か、テキストの終わりが要り、
その間には空の説明ブロックしか置けません
（[区切りの前の空の説明ブロック](#区切りの前の空の説明ブロック) を参照）。
`click A "u" "t" B` は拒否され、文字列のない `click A href` も拒否されます。
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href]
[fixture: state/gram-click-trailing-word] [fixture:
state/gram-click-href-at-end] [fixture: state/lex-click-at-end]
状態は `[*]` でもかまいません。
文字列は空でもかまいません。`click A "" ""` は受理されます。
[fixture: state/gram-click-terminal] [fixture: state/lex-click-empty-strings]
ほかの文と同じく、click の文は、その行のほかの文の後に続けられます。
`A click A href "u"`、`A --> B click A "u" "t"`、
`accDescr {} click A href "u"` は受理されます。
[fixture: state/gram-click-after-statement] [fixture:
state/gram-click-after-transition] [fixture:
state/gram-click-after-empty-description-block]

### ほかの文

```text
class-def-statement     = "classDef" class-name styles
class-statement         = "class" id ( id-comma id )* css-class?
style-statement         = "style" id? ( id-comma id? )* styles
styles                  = style-text? ( "," style-text? )*
direction-statement     = direction-text? "direction" direction-value direction-text?
accessibility-statement = "accTitle" ":" title-text?
                        | "accDescr" ":" description-text?
                        | "accDescr" "{" description-block-text? ( "}" | end-of-text )
scale-statement         = "scale" number "width"
```

`scale` と `hide empty description` は、Db を何も変えない文です。
[fixture: state/gram-scale] [fixture: state/gram-hide-empty-description]
2 つの文の間には何も要らないので、文は、`line` のテキストの始まりと、
各文のすぐ後（同じ行でも）で始まります。
文が始まるところの空の説明ブロックは、説明のブロックの文です。
`accDescr {}` の後の `A`、そして `A --> B accDescr {}`、`A accDescr {}`、
`[*] accDescr {}`、`accDescr {}accDescr {}` は、
説明のブロックの文が前か後にある文です。
ブロックの後の単位が、その前の文を続けるところでは、
ブロックは代わりに文の中にあり、入力は拒否されます
（[既知の差異](#既知の差異) を参照）。
状態の参照の後の `-->`、`:::`、説明がそうです。
間に空白しかない、続けて書いたブロックは、
最後のブロックの後の単位でまとめて決まります。
`A accDescr {} accDescr {} : x` と `A accDescr {} accDescr {} --> B` では、
2 つのブロックとも文 A の中にあります。
[fixture: state/div-empty-description-blocks-before-label] [fixture:
state/div-empty-description-blocks-before-arrow]
そのため `A accDescr {} --> B`、`A accDescr {} : x`、
`A accDescr {} :::c --> B`、`A --> B accDescr {} : x` は拒否され、
`A --> accDescr {} B` のように文の単位の間にあるブロックも拒否されます。
[fixture: state/gram-empty-description-block-statement] [fixture:
state/gram-empty-description-block-after-transition] [fixture:
state/gram-empty-description-block-after-definition] [fixture:
state/gram-empty-description-block-after-terminal] [fixture:
state/gram-empty-description-blocks-adjacent] [fixture:
state/gram-empty-description-block-after-transition-keeps] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-description] [fixture:
state/div-empty-description-block-before-class] [fixture:
state/div-empty-description-block-before-label] [fixture:
state/div-empty-description-block-after-arrow]

### 文法の外での拒否

- 本体があり、その状態に説明を与えるすべての文の説明を合わせて、
  説明が 2 つ以上の状態。文はどこにあっても数えます。
  mermaid.js は「Group nodes can only have label」を投げます。
  状態の文は、その状態が同じ **id** を持つ文です。
  状態の id は、その Identifier の名前か、その StateLiteral の値です。
  遷移の矢印の前か、定義の文にそれだけである StateTerminal は、
  それがある合成状態か区域の id、
  最上位なら `root` に `_start` を続けた id を持ちます。
  矢印の後なら `_end` を続けます。
  同じ id を持つ 2 つは 1 つの状態です。
  [fixture: state/gram-terminal-alone] [fixture: state/db-nested-terminals]
  [fixture: state/db-root-start-shared]
  合成状態の文、別名の定義、疑似状態の定義、ノートの文で、
  `[*]` という名前の状態は、
  そこで矢印の前の StateTerminal が持つ id を持ちます。
  本体を持つ `state [*] {` は合成状態 `root_start` を定め、
  Y の本体の中なら `Y_start` を定めます。
  `note left of [*] : x` は `root_start` のノートです。
  一方、`state [*]x {` は `[*]x` を定めます。
  [fixture: state/db-composite-id-terminal]
  [fixture: state/db-composite-id-terminal-nested]
  [fixture: state/db-composite-id-terminal-after-empty-string]
  [fixture: state/db-composite-id-terminal-then-transition]
  [fixture: state/db-alias-id-terminal]
  [fixture: state/db-pseudostate-id-terminal]
  [fixture: state/db-note-id-terminal]
  [fixture: state/db-note-id-terminal-block]
  [fixture: state/db-note-id-terminal-region]
  [fixture: state/db-composite-id-terminal-prefix]
  合成状態の本体は、区切りの文を持ち、最後の文が区切りの文でないとき、
  **分けられます**。
  そのとき、各区切りの文は、
  前の区切りの文か本体の始めからの文（ないこともある）の**区域**を閉じ、
  最後の区切りの文の後の文は、もう 1 つの区域です。
  コメントは文でなく、方向の文は文です。
  区域は本体を持つ状態で、StateTerminal が入っている合成状態か区域は、
  区域のこともあります。
  各区切りの文は、`divider-id-` に、テキストのすべての区切りの文の中での番号
  （ソースの順、1 から）を続けた id を持ちます。
  分けられない本体の中でも同じで、そこでは本体のない状態です。
  区切りの文が閉じる区域は、その区切りの文の id を持ちます。
  最後の区域の id は mermaid.js が無作為に作るもので、
  この仕様は、それを、テキストに書かれたどの状態の id でもないものとします。
  別名の定義で空白を含めて書いた id とも等しくなりません。
  そのため、`state X {` と、本体のある `state [*] {`、`--`、`C` では、
  内側の合成状態は `divider-id-1_start` で、
  最上位のその id の 2 つの別名の定義は入力を拒否させ、
  区域 `divider-id-1` の 2 つの別名の定義も同じです。
  X の前に区切りの文を持つ本体があれば、それが分けられなくても、
  X の区切りの文は `divider-id-2` です。
  最後の区域の中や、最後の文が区切りの文である本体の中の `[*]` は、
  どちらでもありません。
  [fixture: state/gram-region-terminal-composite-two-descriptions]
  [fixture: state/db-region-terminal-composite-one-description]
  [fixture: state/db-region-terminal-composite-other-number]
  [fixture: state/gram-region-terminal-composite-second-divider]
  [fixture: state/db-region-terminal-composite-first-divider-elsewhere]
  [fixture: state/gram-region-divider-number-undivided-body]
  [fixture: state/gram-region-two-descriptions]
  [fixture: state/db-region-one-description]
  [fixture: state/db-last-region-terminal-composite]
  [fixture: state/db-last-region-alias-with-spaces]
  [fixture: state/db-undivided-body-terminal-composite]
  [fixture: state/db-divider-state-two-descriptions]
  [fixture: state/lex-composite-divider]
  [fixture: state/db-divider-first-then-state]
  [fixture: state/db-divider-then-direction]
  [fixture: state/db-divider-last-in-body]
  [fixture: state/db-divider-then-comment-only]
  文は、説明が null でない定義の文か、別名の定義のとき、
  その状態に**説明を与えます**。
  ただし、本体も `:` もなく、
  両端の空白を除くと文字列が空になる別名の定義は除きます。
  `:` のある別名の定義は 2 つ与えます。
  ほかの文は説明を与えません。
  そのため、`:` の後に空白のある `A : ` と、`state " " as A` は説明を与えず、
  `state " " as A : y` と、本体のある `state " " as A` は与えます。
  [fixture: state/gram-description-blank] [fixture:
  state/db-description-blank-after-description] [fixture:
  state/db-alias-blank-without-body] [fixture:
  state/db-alias-blank-second-description] [fixture:
  state/db-alias-body-blank-description]
  そのため、本体のある `state [*] {` と、
  最上位の定義の文 `[*] : a` と `[*] : b` は拒否されますが、
  同じ 2 つがほかの合成状態の本体にあれば、その始まりの説明です。
  [fixture: state/db-composite-one-description]
  [fixture: state/db-composite-two-descriptions]
  [fixture: state/db-composite-one-description-then-body]
  [fixture: state/db-composite-alias-body-one-description]
  [fixture: state/db-composite-blank-description-then-description]
  [fixture: state/db-composite-blank-alias-then-description]
  [fixture: state/db-composite-terminal-descriptions-in-other-composite]
  [fixture: state/gram-composite-alias-colon-then-body]
  [fixture: state/gram-composite-blank-alias-colon-then-body]
  [fixture: state/gram-composite-descriptions-equal-to-id]
  [fixture: state/gram-composite-descriptions-after-body]
  [fixture: state/gram-composite-description-in-other-composite]
  [fixture: state/gram-composite-terminal-two-descriptions]
- `state` と `{` の間の 2 つの語（[state の文脈](#state-の文脈) を参照）。
  字句解析器が拒否します。
  [fixture: state/lex-state-two-names-body]

## 既知の差異

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  テキストの単位と文字列の単位のほかの単位の中のディレクティブは、
  この仕様では入力を拒否させ、
  mermaid.js はそれを受理します
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  キーワード、名前の単位、`:::`、`[*]`、疑似状態の印、仕切りの `--`、
  矢印の中のディレクティブがそうです。
  [fixture: state/div-directive-in-keyword] [fixture: state/div-directive-in-id]
  [fixture: state/div-directive-in-arrow]
  [fixture: state/div-directive-in-state-name]
  [fixture: state/div-directive-in-class-name]
  [fixture: state/div-directive-in-note-id]
  [fixture: state/div-directive-in-class-separator]
  [fixture: state/div-directive-in-terminal]
  [fixture: state/div-directive-in-pseudostate-mark]
  [fixture: state/div-directive-in-divider]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `style` の規則に当たる行で、
  テキストの単位と文字列の単位のほかの単位の中にある無視される `;` は、
  ここでは入力を拒否させ、mermaid.js はそれを受理します。
  `state` の後の名前は `style`、`:`、`#` を持てるので、
  本体があってもなくても、
  `state style:#x;B` の無視される `;` は名前の中にあります。
  本体があれば、mermaid.js は合成状態 `style:#xB` を読み、
  本体がなければ、何も足さない入力として受理します。
  [fixture: state/div-ignored-semicolon-in-state-name]
  [fixture: state/div-ignored-semicolon-in-state-name-without-body]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、`A : b="c">d` は A に、
  mermaid.js では説明 `b='c'>d` を、この仕様では `b="c">d` を与えます。
  [fixture: state/div-html-tag-starts-in-frontmatter-description]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  正しい YAML でないフロントマターは、この仕様では受理され、
  mermaid.js は拒否します。
  [fixture: state/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  文の中の空の説明ブロックは、この仕様では入力を拒否させます。
  mermaid.js はそれにトークンを読まず、入力を受理します。
  `A accDescr {} --> B`（ブロックの後の `-->` が文 `A` を続けるので、
  ブロックは遷移の中にある）と、それと同じ `A accDescr {} : x`、
  `A accDescr {} :::c --> B`、`A --> B accDescr {} : x`、
  `A --> B accDescr {} :::c`、そして `A --> accDescr {} B` がそうです。
  文が始まるところの空の説明ブロックは、同じ行の別の文のすぐ後でも、
  テキストのない説明のブロックの文で、何も変えません。
  `A --> B accDescr {}` は受理されます。
  名前の後の行の、本体の `{` の前のブロックは、
  その文の `textBeforeBody` の一部で、これも受理されます
  （[合成状態、別名、疑似状態](#合成状態別名疑似状態) を参照）。
  [fixture: state/div-empty-description-block-in-transition] [fixture:
  state/div-empty-description-block-after-arrow] [fixture:
  state/div-empty-description-block-before-description] [fixture:
  state/div-empty-description-block-before-class] [fixture:
  state/div-empty-description-block-before-label] [fixture:
  state/div-empty-description-block-before-target-class] [fixture:
  state/gram-empty-description-block-statement] [fixture:
  state/gram-empty-description-block-after-transition]
  `:::` とクラスの間、遷移の中の `[*]` の隣、
  そして `click A "u" accDescr {} "t"` のような click の文の中の
  ブロックも同じです
  （規則とほかの例は
  [tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
  を参照）。
  [fixture: state/div-empty-description-block-after-class-separator] [fixture:
  state/div-empty-description-block-terminal-before-arrow] [fixture:
  state/div-empty-description-block-before-terminal-target] [fixture:
  state/div-empty-description-block-in-click-before-id] [fixture:
  state/div-empty-description-block-in-click-before-url] [fixture:
  state/div-empty-description-block-in-click-after-href] [fixture:
  state/div-empty-description-block-in-click-before-tooltip]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかにある `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment`（状態の id、説明、遷移のラベルなど）は、
  mermaid.js ではテキストを C4 のパーサーに渡させ、拒否されます。
  ここではテキストは state 図です。
  [fixture: state/div-c4-keyword-as-state-id]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  ヘッダーの前の、ディレクティブではない `%%{ }%%` の行は、
  ここではコメントです。
  mermaid.js は入力を拒否します。
  state の字句解析器が `%%` を無視されるテキストとして読み、
  文法は `{` を取らないからです（[検出](#検出) を参照）。
  `%%` だけの行はどちらでもコメントです。
  [fixture: state/header-after-empty-braces-line] [fixture:
  state/header-after-bare-percent-line]

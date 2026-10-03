# State

英語版: [state.md](./state.md)

mermaid.js の中の正しさの源:

- [`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison)
- [`stateDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts)
- [`dataFetcher.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts)
- [`state/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state)
  のテスト（`*.spec.js`、`*.spec.ts`）

この文書は図種 `stateDiagram` を扱います。
木のノードとトークンは [ast/state.ja.md](../ast/state.ja.md) で定めます。

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

## 字句構造

字句解析器は、[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
行終端はそれぞれ `\n`、属性の引用符は `'`、
エンティティはその置き換えの文字として読み、
コメントの領域と、行の規則が無視する `;` は、ないものとして読み進めます。
字句解析器が最後の文字の後に読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は、
図のテキストの一部です。
この節は、図の独自のトークンの規則、
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
文法は単位の上に書かれ、木のトークンは単位から作られます
（[ast/state.ja.md](../ast/state.ja.md#トークン) を参照）。
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
[fixture: state/lex-acc-title-at-end] [fixture:
state/lex-acc-descr-block-unclosed] [fixture:
state/lex-classdef-without-styles] [fixture: state/lex-style-without-styles]
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
ディレクティブを始めない `{` の前の `%%` は `ignored-text` の単位です
（文の文脈の規則 9）。
`floating-note-id` も `%%` で始まってかまいません。
`alias-id` と `note-id` は、最初の文字でも `%%` の前で終わります（下を参照）。

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを除いた後のテキストを読むように読みます。
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位と、そこから作るトークン
（[ast/state.ja.md](../ast/state.ja.md#トークン)）に当てはまります。
`RawText` か `Identifier` の種類の単位の中のディレクティブは、
そのトークンを切り、
入力は mermaid.js の読み方を保ちます。
ほかの種類の単位の中のディレクティブは、入力を拒否させます。

- `Fo%%{init: {}}%%o --> B` は `Foo` からの遷移を持ち、
  `A : x%%{init: {}}%%y` は A に説明 `xy` を与え、
  `note "x%%{init: {}}%%y" as N` はテキスト `xy` の浮いたノートです。
  mermaid.js と同じです。
  [fixture: state/lex-directive-in-id] [fixture:
  state/lex-directive-in-description] [fixture:
  state/lex-directive-in-floating-note-text]
- 2 つの単位の間のディレクティブは、その種類によらずかまいません。
  `A%%{init: {}}%%--> B` は遷移です。
  [fixture: state/lex-directive-between-units]
- `sta%%{init: {}}%%te A {`、`A -%%{init: {}}%%-> B`、
  URL が `"u%%{init: {}}%%v"` の click の文では、
  ディレクティブはキーワード、矢印、文字列の中にあり、入力は拒否されます。
  mermaid.js はそれを受理します（[既知の差](#既知の差) を参照）。
  [fixture: state/div-directive-in-keyword] [fixture:
  state/div-directive-in-arrow] [fixture: state/div-directive-in-string]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. キーワード `click`。`click` の単位。
2. キーワード `href`。`href` の単位。
3. `"`、改行を含む `"` 以外の 0 個以上の文字、`"`。`string` の単位。
   引用符の間に文字がなければ空です。
4. キーワード `default`。`default` の単位。
5. **方向の行**（下を参照）。
6. 1 つ以上の改行。`newline` の単位。
7. 改行を含む 1 つ以上の空白。何も作りません。
8. `#` と、改行までのその行の残り。印が `#` の図のコメント
   （[コメント](#コメント) を参照）。
9. `{` が続かない `%%` と、改行までのその行の残り。印が `%%` の図のコメント。
   ディレクティブを始めない `{` が続く `%%` は、
   mermaid.js が読まない `ignored-text` の単位です。
10. `scale` と 1 つ以上の空白。`scale` の単位。scale の文脈に入ります。
11. `accTitle`、0 個以上の空白、`:`、0 個以上の空白。
    `accTitle` の単位と `:` の単位。タイトルの文脈に入ります。
12. `accDescr`、0 個以上の空白、`:`、0 個以上の空白。
    `accDescr` の単位と `:` の単位。説明の文脈に入ります。
13. `accDescr`、0 個以上の空白、`{`、0 個以上の空白。
    `accDescr` の単位と `{` の単位。説明のブロックの文脈に入ります。
14. `classDef` と 1 つ以上の空白。`classDef` の単位。classDef の文脈に入ります。
15. `class` と 1 つ以上の空白。`class` の単位。class の文脈に入ります。
16. `style` と 1 つ以上の空白。`style` の単位。style の文脈に入ります。
17. `state` と 1 つ以上の空白。`state` の単位。state の文脈に入ります。
18. `{`。`{` の単位。合成状態の本体の文脈に入ります。
19. `note` と 1 つ以上の空白。`note` の単位。ノートの文脈に入ります。
20. `stateDiagram` と 1 つ以上の空白、
    または `stateDiagram-v2` と 1 つ以上の空白。
    `header` の単位。
21. 語の間に空白 1 つのキーワード `hide empty description`。`hide` の単位。
    `hide empty descriptionx` は 3 つの状態です。
    [fixture: state/lex-hide-then-word]
22. `[*]`。`[*]` の単位。
23. id（[id](#単位と文脈) を参照）。
24. **説明**。0 個以上の空白、`:`、そして 1 つ以上の文字をできるだけ多く。
    その各文字は、`:`、`;`、改行以外の文字か、
    そのような文字が後に続く `:` です。
    `description` の単位。
25. `-->`。`-->` の単位。
26. `:::`。`:::` の単位。
27. ほかの文字。`invalid` の単位。

規則 10 から 21 の語は、この図のどこでもそうであるように、
大文字小文字を区別せずに比べます。
その後の改行を含む空白は、どの単位にも属しません。
`default`、click の文の外の `href`、click の文の外の `string`、
`invalid` の単位は、
文法のどの規則も取らないので、それを持つ入力は拒否されます。
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
いまの位置から、改行、U+2028、U+2029 を持たない文字の並び、
`direction`、1 つ以上の空白、この順に試す `TB`、`BT`、`RL`、`LR` のどれか、
そして次の改行までのすべての文字です。
`direction` の前と値の後の文字は `direction-text` の単位で、
mermaid.js はそれを読みません。
この規則は id の規則より前に試されるので、行の全体を取ります。
`B : x direction LR` は方向を決め、状態を持ちません。
`A --> B direction LR` も同じで、`Direction lr` は方向の行です。
この規則はコメントの規則より前にも試されるので、
値の後のテキストは `%%` を持てます。
`direction LR %% c` は方向 `LR` を決め、
`%% c` はコメントでなく `direction-text` の単位です。
値は語の境目で終わらなくてもかまいません。
`direction TBX` は `TB` を決め、`X` は `direction-text` の単位です。
[fixture: state/lex-direction-line-in-description] [fixture:
state/lex-direction-line-same-line-transition] [fixture:
state/lex-direction-lower-case] [fixture: state/lex-direction-line-then-comment]
[fixture: state/lex-direction-line-value-then-text]
`direction` と値の間の空白は改行を含められます。
`direction`、改行、`LR` は方向の行です。
[fixture: state/lex-direction-value-next-line]

### 合成状態の本体の文脈

合成状態の本体の文脈には、文の文脈か state の文脈の `{` で入ります。
合成状態の文を読みます。

1. 改行以外の 1 つ以上の空白。何も作りません。
2. `#` とその行の残り。文の文脈の規則 8 と同じ図のコメント。
3. `{` が続かない `%%` とその行の残り。文の文脈の規則 9 と同じ図のコメント。
4. 文の文脈の規則 14 から 17。`classDef`、`class`、`style`、`state`。
5. 方向の行。
6. `}`。`}` の単位。合成状態の本体の文脈を出ます。
7. 改行。何も作りません。
8. 文の文脈の規則 19。`note`。
9. `[*]`。`[*]` の単位。
10. id。
11. 文の文脈の規則 24 と同じ説明。
12. `-->`。`-->` の単位。
13. `--`。`--` の単位、つまり**区切り**。
14. `:::`。`:::` の単位。

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
2. `#` とその行の残り。文の文脈の規則 8 と同じ図のコメント。
3. `{` が続かない `%%` とその行の残り。文の文脈の規則 9 と同じ図のコメント。
4. **疑似状態の印**。
   `<<fork>>`、`<<join>>`、`<<choice>>`、`[[fork]]`、`[[join]]`、`[[choice]]` を
   この順に試し、次の改行、U+2028、U+2029 より前に最初に現れるものについて、
   いまの位置から、そこでのその最後の出現までのすべての文字を読みます。
   印の前の文字は、両端の空白を除いて、
   空でなければ `pseudostate-name` の単位で、
   印はそのテキストを名前とする単位です。state の文脈を出ます。
5. `"`。state の文字列の文脈に入ります。
6. 0 個以上の空白、`as`、改行を含む 1 つ以上の空白。
   `as` の単位。別名の id の文脈に入ります。
7. 語、改行を含む 1 つ以上の空白、もう 1 つの語、
   そして改行、U+2028、U+2029 以外の 0 個以上の文字をできるだけ少なく、`{`。
   拒否されます。mermaid.js は「State name must be a single word」の
   エラーを投げます。
   ほかの規則と同じく、state の文脈で単位が始まりうるところで試されるので、
   最初の名前の後の各名前でも、もう一度試されます。
8. 改行、空白、`{` 以外の 1 つ以上の文字。`state-name` の単位。
9. 改行。state の文脈を出ます。
10. `{`。`{` の単位。state の文脈を出て、合成状態の本体の文脈に入ります。

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
[fixture: state/lex-alias-id-spaces] [fixture: state/lex-alias-without-id]
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
空白とコメント行だけの後の次の行で `{` が続くとき、別名の文は本体を持ち、
`alias-id` は分けません。
次の行では、`{` の前のその行に、`textBeforeBody` が持てるもの、
つまり空白、空の説明ブロック、`{` のすぐ前の `%%` だけがあってもかまいません
（[合成状態、別名、疑似状態](#合成状態別名疑似状態) を参照）。
そのため、行 `%%{}` か `accDescr {} %%{}` が続く `state "d" as A : x` は、
空の本体を持つ合成状態 `A : x` を定めます。
[fixture: state/lex-alias-colon-ignored-percent-before-body-next-line]
[fixture: state/lex-alias-colon-block-and-ignored-percent-before-body-next-line]
`state "d" as A : x {` と、行 `{` が続く `state "d" as A : x` は、
合成状態 `A : x` を定め、空の行の後の `{` は本体を始めず、入力は拒否されます。
[fixture: state/lex-alias-second-description] [fixture:
state/lex-alias-third-part] [fixture: state/lex-alias-colon-before-body]
[fixture: state/lex-alias-colon-before-body-next-line] [fixture:
state/lex-alias-colon-before-body-after-comment-line] [fixture:
state/lex-alias-colon-blank-line-before-brace]

### classDef、class、style の文脈

`classDef` は **classDef の文脈**に入ります。

1. `default` と 1 つ以上の空白。`default` の単位。
   文法はそれを取らないので、`classDef default …` は拒否されます。
2. 1 つ以上の語の文字と、改行を含む 1 つ以上の空白。
   空白を除いて `class-name` の単位。スタイルの文脈に入ります。

`class` は **class の文脈**に入ります。

1. 1 つ以上の語の文字に、`,`、0 個以上の空白、
   1 つ以上の語の文字の 0 回以上の繰り返しが続くもの。
   語の文字の並びごとに `id` の単位、`,` ごとに `,` の単位。
   クラス名の文脈に入ります。

`style` は **style の文脈**に入ります。

1. 1 つ以上の語の文字と `,`、そして改行を含む 1 つ以上の空白。
   語の文字の並びごとに `id` の単位、`,` ごとに `,` の単位。
   スタイルの文脈に入ります。

これらの文脈は、その規則が読むと出ます。
その後、**スタイルの文脈**は、改行までのその行の残りを読み、
それを `,` ごとに、
両端の空白を除いた `style-text` の単位と `,` の単位に分けます。
**クラス名の文脈**は、その行の残りを、
両端の空白を除いた 1 つの `css-class` の単位として読みます。
どちらも空でもかまいません。

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

### scale の文脈

`scale` は scale の文脈に入ります。
1 つ以上の ASCII の数字は `number` の単位で、
1 つ以上の空白に続くキーワード `width` は `width` の単位で、
scale の文脈を出ます。`scale 3 widthx` は拒否されます。
`scale 350 width` は受理され、`scale 350` は拒否されます。
[fixture: state/gram-scale] [fixture: state/gram-scale-without-width]
[fixture: state/lex-scale-width-then-word]
`scale` の後の空白は改行を含められます。
`scale`、改行、`3 width` は scale の文です。
[fixture: state/lex-scale-number-next-line]

### ノートの文脈

`note` は**ノートの文脈**に入ります。

1. 語の間に空白 1 つのキーワード `left of` か `right of`。
   `position` の単位。ノートの id の文脈に入ります。
2. `"`。浮いたノートの文脈に入ります。

空白 2 つの `note left  of A : x` と、`note over A : x` は拒否されます。
位置の後に語の文字が続く `note right ofx A`、`note left ofA : x`、
`note left of1 : x` も拒否されます。
`note right of#A : x` では、位置の後にノートの id `#A` が続きます。
[fixture: state/lex-note-two-spaces-in-position] [fixture:
state/lex-note-over] [fixture: state/lex-note-position-then-word] [fixture:
state/lex-note-position-then-id] [fixture: state/lex-note-position-then-digit]
[fixture: state/lex-note-position-then-hash]

**ノートの id の文脈**は、改行を含む 0 個以上の空白と、
`:`、改行、空白、`-` 以外の文字の id を読みます。
これは `note-id` の単位で、最初の `%%` の前で、それが最初の文字でも終わり、
そのときは空です。
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
   `:` の `:` の単位と、その後の文字の、両端の空白を除いた `note-text` の単位。
   ノートの文脈を出ます。
2. 改行を含む、できるだけ少ない任意の文字、改行、0 個以上の空白、
   キーワード `end note`。
   改行の前の文字の、両端の空白を除いた `note-text` の単位と、
   `end note` の単位。
   ノートの文脈を出ます。

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
   `as` の単位。浮いたノートの id の文脈に入ります。
2. `"`。`"` の単位。
3. 改行を含む、`"` 以外の 1 つ以上の文字。`floating-note-text` の単位。

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
`note "" x" as N` のテキストは空白と `x` です。
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
[fixture: state/lex-floating-note-id-spaces]

### アクセシビリティの値

タイトルの文脈と説明の文脈では、行の残り、
つまり改行以外の 0 個以上の文字が `title-text` か `description-text` の単位で、
文脈を出ます。
`#`、`;`、`%%` はその文字です。
`accTitle: a;b #c %% d` のタイトルは `a;b #c %% d` です。
`:` の後の空白は、改行も含めて `:` の単位と一緒に読まれるので
（文の文脈の規則 11 と 12）、テキストは次の行にあってもかまいません。
[fixture: state/lex-acc-title-semicolon] [fixture:
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

図のコメントは、その**印**から改行までです。
その行の U+2028 か U+2029 の後にコメント行があっても、それを越えて続き、
そのコメント領域が図のコメントを 2 つに切ります
（[Comment](../ast.ja.md#comment) を参照）。
`A %% x`、U+2029、行 `%% end`、行 `B` の状態は A だけです。
[fixture: state/lex-diagram-comment-across-comment-line]
印は、`#` で始まるコメントでは `#`、`%%` で始まるコメントでは `%%` で、
値は印の後のテキストです（[Comment](../ast.ja.md#comment) を参照）。
`# c` と `%% c` の値は空白と `c` で、`%%% c` の値は `%`、空白、`c` です。
id の中のコメントは、id が終わる `%%` から始まります。
`B%% c` は状態 B と、値が空白と `c` のコメントです。
[fixture: state/lex-comment-percent-three]
印は、字句解析器が読むとおり、ディレクティブのないテキストで見つけ、
値は、ディレクティブを含めた、印の後のソースのテキストです。
`A --> B %%%{init: {}}%%% c` では、
ディレクティブのないテキストは `A --> B %% c` なので、
印は最初と最後の `%` で、値は空白と `c` です。
コメント `# x%%{init: {}}%%y` の値は `x%%{init: {}}%%y` です。
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

| 規則                                                               | ノード                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `diagram`                                                          | StateDiagram                                                                         |
| `definition-statement`                                             | StateDefinitionStatement                                                             |
| `transition-statement`                                             | StateTransitionStatement                                                             |
| `state-reference`                                                  | StateReference。その `"[*]"` は StateTerminal                                        |
| `composite-statement`                                              | StateCompositeStatement                                                              |
| `alias-statement`                                                  | StateAliasDefinitionStatement                                                        |
| `pseudostate-statement`                                            | StatePseudostateDefinitionStatement                                                  |
| `ignored-statement`                                                | StateIgnoredStatement                                                                |
| `"--"`                                                             | StateDividerStatement                                                                |
| `note-statement`                                                   | StateNoteStatement                                                                   |
| `floating-note-statement`                                          | StateFloatingNoteStatement                                                           |
| `click-statement`                                                  | StateClickStatement                                                                  |
| `empty-description-block`                                          | テキストのない StateAccDescrBlockStatement。その前の文の後の文                       |
| `class-def-statement`                                              | StateClassDefStatement                                                               |
| `class-statement`                                                  | StateClassStatement                                                                  |
| `style-statement`                                                  | StateStyleStatement                                                                  |
| `direction-statement`                                              | StateDirectionStatement。`direction-text` ごとに StateIgnoredText                    |
| `accessibility-statement`                                          | StateAccTitleStatement、StateAccDescrStatement、StateAccDescrBlockStatement のどれか |
| `scale-statement`                                                  | StateScaleStatement                                                                  |
| `"hide"`                                                           | StateHideEmptyDescriptionStatement                                                   |
| `string` か `string-or-empty`                                      | StringLiteral                                                                        |
| `number`                                                           | NumericLiteral                                                                       |
| 下に挙げる名前                                                     | Identifier                                                                           |
| 下に挙げる引用符のないテキスト                                     | StateLiteral                                                                         |
| `ignored-text`、またはほかの文の中の一続きの `empty-string` の単位 | StateIgnoredText                                                                     |

名前は、`id`、`state-name`、`class-name`、`note-id` です。
引用符のないテキストは、`description` の `:` の後のテキスト、`alias-id`、
`second-description`、`pseudostate-name`、`note-text`、`floating-note-text`、
`floating-note-id`、`style-text`、`css-class`、
そして `title-text`、`description-text`、`description-block-text` です。

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
           | "hide"
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
                      | "state"? empty-string* state-name ( empty-string* empty-description-block* ignored-text? "{" line* "}" )?
ignored-statement     = empty-string+
alias-statement       = "state"? empty-string* string empty-string* "as" alias-id? ( ":" second-description? ignored-text? )? ( empty-description-block* ignored-text? "{" line* "}" )?
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
note-statement          = "note" position ignored-text? note-id? ( ":" note-text? | note-text? "end note" )
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
class-statement         = "class" id ( "," id )* css-class?
style-statement         = "style" id? ( "," id? )* styles
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
（[既知の差](#既知の差) を参照）。
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

## Db の正規化

mermaid.js は、構文解析の間に、描くデータ、つまりノードの列と辺の列を作ります
（[`StateDB.extract`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/stateDb.ts#L249-L302)、
[`dataFetcher`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/dataFetcher.ts#L241-L477)）。
要約は、そのデータと、クラスの定義と、リンクから取ります。
値は、空白を含めて Db が持つとおりに保ちます。
変えるのは、
合成状態の最後の区域に mermaid.js が無作為に作る id だけです（下を参照）。

### 要約

| 欄            | 中身                                         |
| ------------- | -------------------------------------------- |
| `direction`   | 図の向き。                                   |
| `title`       | フロントマターのタイトルか、空のテキスト。   |
| `accTitle`    | アクセシビリティのタイトルか、空のテキスト。 |
| `accDescr`    | アクセシビリティの説明か、空のテキスト。     |
| `states`      | 状態。そのノードの順。                       |
| `notes`       | ノート。そのノードの順。                     |
| `transitions` | 遷移。ソースの順。                           |
| `classDefs`   | クラスの定義。最初の `classDef` の文の順。   |
| `links`       | 最上位の click の文。ソースの順。            |

状態は、`id`、`label`、`classes`、`styles` と、
設定されていれば `shape`、`description`、`parentId`、`dir` を持ちます
（[木から要約を作る](#木から要約を作る) を参照）。
ノートは、`state`、`position`、`text` を持ちます。
遷移は、`start`、`end`、`label` を持ちます。
クラスの定義は、`id` と `styles` を持ちます。
リンクは、`state`、`url`、`tooltip` を持ちます。

### 木から要約を作る

**id。**
状態の id は、その Identifier の名前か、その StateLiteral の値です。
遷移の矢印の前か、定義の文にそれだけである StateTerminal は、
それがある合成状態か区域の id、
最上位なら `root` に `_start` を続けた id を持ちます。
矢印の後なら `_end` を続けます。
同じ id を持つ 2 つは 1 つの状態です。
[fixture: state/gram-terminal-alone] [fixture: state/db-nested-terminals]
[fixture: state/db-root-start-shared]

**区域。**
合成状態の本体は、区切りを持ち、最後の文が区切りでないときに**分けられます**。
そのような本体の各区切りは、前の区切りか本体の始めからの文
（ないこともあります）を持つ**区域**を閉じ、
最後の区切りの後の文は、もう 1 つの区域です。
コメントは文でなく、方向の文は文です。
最後の文が区切りである本体は、分けられません。
各区切りは、`divider-id-` に、
テキストのすべての区切りの中でのその区切りの番号（ソースの順、
1 から）を続けた id を持ち、区切りが閉じる区域はその区切りの id を持ちます。
mermaid.js は最後の区域に無作為の id を与えます。
要約は、そのような区域の中でのその区域の番号（ノードの順、1 から）を
`generated-region-` に続けたものを、その id が現れるところすべてで持ちます。
[fixture: state/lex-composite-divider] [fixture:
state/db-divider-first-then-state] [fixture: state/db-divider-then-direction]
[fixture: state/db-divider-last-in-body] [fixture:
state/db-divider-then-comment-only]

**巡り。**
ノードと遷移は、本体の文を順に巡ることで作ります。
巡りは**親**を持ちます。
最上位では親はなく、それ以外では、本体を巡っている合成状態か区域が親です。
文は次のものを加えます。

- 定義の文は、その説明とともに、その状態を訪れます。
- 遷移の文は、`from` の状態と `to` の状態を訪れ、遷移を加えます。
  `start` と `end` はそれらの id、`label` はそのラベルの値か空のテキストです。
- 本体のある合成状態の文、別名の定義、疑似状態の定義は、その状態を訪れます。
  別名の定義の説明は、その文字列の値から両端の空白を除いたものです。
  本体があるときは、引用符の間の文字列のテキストで、空白を含みます。
  `:` のある別名の定義は、2 つ目の説明を持ちます。
  最初の `:` と、2 つ目の `:` または終わりの間のテキストで、空白を含み、
  空でも空白だけでも 2 つ目の説明です。
  `state "d" as A :` は、A に説明 `d` と空のテキストを与えます。
  木は空の 2 つ目の説明のノードを持たないので、ソースから読みます。
  疑似状態の定義は、その種類の形でその状態を訪れます。
  [fixture: state/db-alias-description-trimmed] [fixture:
  state/db-alias-body-description-untrimmed] [fixture:
  state/lex-alias-second-description] [fixture:
  state/db-alias-colon-empty-second] [fixture:
  state/db-alias-colon-spaces-second]
- ノートの文は、その状態を訪れ、ノートを加えます。
- 分けられた本体は、その区域として巡ります。
  各区域は、合成状態の状態として、形 `divider` で訪れられ、
  その文は区域を親として巡られます。
  ほかの本体はそのまま巡り、
  その中の各区切りの文は、本体なしでその id の状態を訪れます。
  そのため `state A {`、`B`、`--`、`}` は、B に親 A を与え、
  その後に、形 `divider` で `dir` のない状態 `divider-id-1` を、
  A の中に置きます。
  [fixture: state/db-divider-last-in-body] [fixture:
  state/db-dividers-each-last] [fixture: state/db-divider-alone-in-body]
- ほかの文はノードを加えません。
  本体のない合成状態の文、浮いたノート、click、classDef、class、style の文、
  方向の文、アクセシビリティの文、scale と hide の文です。
  どの文も訪れない id への click、class、style の文は、状態を加えません。
  [fixture: state/lex-state-without-body] [fixture: state/lex-floating-note]
  [fixture: state/gram-scale] [fixture: state/gram-hide-empty-description]
  [fixture: state/db-click-undefined-state] [fixture:
  state/db-class-undefined-state] [fixture: state/db-style-undefined-state]
  ノートの文はその状態を訪れるので、ほかの文が加えなくても状態を加えます。
  [fixture: state/db-note-undefined-state]

状態を訪れると、その id のノードがなければ列の終わりに加え、
あればそのノードをその場所で更新します。
id が空、`</choice>`、`</join></fork>` の状態は、ノードを作りません。
[fixture: state/lex-join-empty-id] [fixture: state/db-choice-close-tag-id]
[fixture: state/db-fork-close-tags-id]

その文が、空のテキストでない説明を状態に与えるとき、訪れは**説明を持ちます**。
説明が null でない定義の文と、別名の定義です。
ただし、本体も `:` もなく、
両端の空白を除くと文字列が空になる別名の定義は除きます。
ほかの訪れは説明を持ちません。
そのため、`:` の後に空白のある `A : ` と、`state " " as A` は説明を与えず、
`state " " as A : y` と、本体のある `state " " as A` は与えます。
[fixture: state/gram-description-blank] [fixture:
state/db-description-blank-after-description] [fixture:
state/db-alias-blank-without-body] [fixture:
state/db-alias-blank-second-description] [fixture:
state/db-alias-body-blank-description]
訪れると、次のものを決めます。

- `parentId`。親があるときは、その id で、
  その id が空でノードを作らないときも同じです。
  後で別の合成状態か区域の中で訪れると、状態はそこへ移り、
  後で最上位で訪れても、`parentId` はそのままです。
  [fixture: state/db-state-in-two-composites] [fixture:
  state/db-parent-kept-at-top-level] [fixture:
  state/db-parent-set-by-later-composite] [fixture: state/lex-alias-without-id]
- 状態の**説明**。初めはその id だけです。
  説明を持つ最初の訪れは、そのどれかが id と同じでも、
  それらを訪れの説明に置き換えます。
  説明を持つ後の訪れは、そのどれかが id やすでにあるものと同じでも、
  その説明をほかの後に加えます。
  [fixture: state/db-description-id-alone] [fixture:
  state/db-description-equal-to-id] [fixture:
  state/db-description-id-after-description] [fixture:
  state/db-description-twice-same]
- `shape`。
  最初の訪れが、StateTerminal には `stateStart` か `stateEnd`、
  疑似状態には `fork`、`join`、`choice`、区域と区切りの文には `divider`、
  ノートの文には何も決めず、
  それ以外には `rect` を決めます。
  後の訪れがそれをもう一度決めることはありません。
  説明のある訪れは、状態の説明が 2 つ以上なら `rectWithTitle`、
  そうでなければ、前の訪れが本体を持っていれば `roundedWithTitle`、
  なければ `rect` にします。
  そのため、説明のある始まりや fork は形 `rect` を持ちます。
  本体のある最初の訪れは、`roundedWithTitle`、区域なら `divider` にします。
  [fixture: state/db-terminal-description] [fixture:
  state/db-fork-description] [fixture: state/db-fork-two-descriptions]
  そのため、ノートの文が最初に訪れた状態は、
  説明か本体のある訪れまで形を持ちません。
  `note left of A : x` の後に、`A --> B`、`A`、`state A <<fork>>` が続けば、
  A は形を持たず、`A : d` が続けば形 `rect`、
  本体のある `state A {` が続けば `roundedWithTitle` を持ちます。
  一方、`A` の後にノートが続けば `rect` です。
  合成状態の本体の中のノートは、合成状態を親としてその状態を訪れます。
  [fixture: state/db-note-first-no-shape] [fixture:
  state/db-note-first-then-state] [fixture: state/db-note-first-then-fork]
  [fixture: state/db-note-first-then-description] [fixture:
  state/db-note-first-then-body] [fixture: state/db-note-after-state-shape]
  [fixture: state/db-note-in-composite]
- `dir`。本体のある最初の訪れが、その本体の最後の方向の文の向きか、
  `TB` を決めます。後の本体はそれを変えません。
  分けられた本体の方向の文はその区域の中にあるので、
  そのような合成状態は `TB` を持ち、
  各区域は、その中の最後の方向の文の向きか `TB` を持ちます。
  分けられない本体は方向の文をそのまま持ち、区切りの文は `dir` を持ちません。
  [fixture: state/lex-composite-state-before-direction] [fixture:
  state/db-dir-first-body] [fixture: state/db-composite-divider-dir]
  [fixture: state/db-divider-last-in-body-direction]

ノートは記録を加えます。
`state` は状態の id で、`note-id` が空なら空のテキストで、
そのときは状態を訪れません（上を参照）。
`position` は書かれたとおりの `position` の単位のテキストです。
`text` は、`note-id` のすぐ後から `note-text` の単位の終わりまでのテキストから、
最初の 2 文字と両端の空白を除いたものです。
何行かにわたるノートでは、`note-text` の値か、空のテキストです。
そのため `note left of A:hi` のテキストは `i` です。
[fixture: state/lex-note-mixed-case] [fixture:
state/lex-note-colon-without-space] [fixture:
state/lex-note-two-spaces-before-colon] [fixture: state/lex-note-block]
[fixture: state/lex-note-id-percent-block]

巡りの後、説明を持つ訪れを受けた状態は、その説明の最初のものを `label`、
ほかを `description` として持ちます。
説明が 1 つなら、`description` は空のリストです。
ほかの状態は、その id を `label` として持ち、`description` を持ちません。
区域と区切りの文は空のラベルを持ち、`description` を持ちません。
本体があり、説明が 2 つ以上の状態は拒否されます。
mermaid.js は「Group nodes can only have label」を投げます。
[fixture: state/db-composite-one-description] [fixture:
state/db-composite-two-descriptions] [fixture: state/lex-composite-divider]

**クラスとスタイル。**
状態の `classes` と `styles` は、最上位の文だけから来て、
その id の状態に、それがどこにあっても当たります。

- 遷移の中の StateReference の `cssClass` と、
  各 `class` の文のその各状態が、ソースの順にクラスを加えます。
  定義の文の `cssClass` は何も加えません。
  [fixture: state/db-classes-order] [fixture: state/db-definition-css-class]
  [fixture: state/db-class-before-state] [fixture:
  state/db-top-class-applies-nested]
- `style` の文は、その各状態のスタイルを、前のものを置き換えて決めます。
  その id の後の、行の終わりまでのテキストを `,` ごとに分け、
  各部分から各 `;` と両端の空白を除いたもので、空の部分も含みます。
  `style A x,,y` は `x`、空のテキスト、`y` を与え、
  空白が続く `style A` は空のスタイル 1 つを与えます。
  木は空の部分のノードを持たないので、部分はソースから読みます。
  [fixture: state/db-style-replaced] [fixture: state/db-style-semicolons]
  [fixture: state/db-style-empty-items] [fixture: state/db-style-blank]
  [fixture: state/db-style-trailing-comma]

合成状態の本体の中の `classDef`、`class`、`style` の文は何も変えません。
[fixture: state/db-nested-class-statement] [fixture:
state/db-nested-classdef]

**クラスの定義。**
最上位の各 `classDef` の文は、そのスタイルを、
その CSS クラスのクラスの定義に加えます。
定義がなければ加えます。
そのクラス名の後の、行の終わりまでのテキストを `,` ごとに分け、
各部分から最初の `;` と両端の空白を除いたもので、
`style` の文と同じく空の部分も含みます。
テキストが空か空白だけの文は、スタイルを加えませんが、
クラスの定義は加えます。
`classDef a x,,y` は `x`、空のテキスト、`y` を、
`classDef a ,` は空のスタイル 2 つを与えます。
[fixture: state/db-classdef-appended] [fixture:
state/db-classdef-semicolons] [fixture: state/db-classdef-empty-items]
[fixture: state/db-classdef-comma-only] [fixture:
state/db-classdef-trailing-comma] [fixture:
state/lex-classdef-without-styles]

**リンク。**
各 click の文はリンクを加えます。
`state` はその StateReference の id で、StateTerminal なら `[*]` です。
`url` と `tooltip` は、引用符を含むその文字列のテキストで、
`href` のある文では `tooltip` は空のテキストです。
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href]
[fixture: state/gram-click-terminal]

**そのほか。**
`direction` は、最上位の最後の方向の文の向きか、`TB` です。
タイトルはフロントマターのものです。行 `title T` は 2 つの状態です。
[fixture: state/db-direction-last] [fixture: state/db-title-frontmatter]
[fixture: state/db-title-line-states]

**アクセシビリティの文。**
`accTitle:` は、タイトルをその値にします。
`accDescr:` と `accDescr {` は、説明をその値にします。
そのとき、改行と、それに続く改行を含む空白を、1 つの改行に置き換えます。
後の文は、それぞれがどちらの形でも、前の文が決めた値を置き換えます。
`accTitle: first` の後に `accTitle: second` が続けばタイトルは `second` で、
`accDescr: x` の後に `accDescr { y }` が続けば説明は `y` で、
`accDescr { x }` の後に `accDescr: y` が続けば `y` です。
[fixture: state/spec-state-diagram-480eb00e] [fixture:
state/db-acc-title-replaces] [fixture:
state/db-acc-title-replaces-then-transition] [fixture:
state/db-acc-descr-replaces] [fixture: state/db-acc-descr-block-replaces]
[fixture: state/db-acc-descr-line-replaces-block]
閉じていない `accDescr {` のブロックは、テキストにかかわらず説明を空にします。
mermaid.js は、そのテキストを読んだ後、テキストの終わりで、
空のテキストを 2 つ目のブロックとして読むからです。
`accDescr: d` の後に、`accDescr {` と、テキストの終わりの行 `x` が続くと、
説明は空になり、タイトルはそのままです。
そのようなブロックはテキストの残りを取るので、
`A --> B` の後に、`accDescr {`、行 `never`、行 `C --> D` が続くものは、
状態 C と D を持ちません。
[fixture: state/db-acc-descr-block-unclosed-takes-lines] [fixture:
state/lex-acc-descr-block-unclosed] [fixture:
state/db-acc-descr-unclosed-replaces] [fixture:
state/db-acc-descr-unclosed-keeps-title]
それ以外では、値が null の文は空のテキストにし、
テキストのない閉じた説明のブロックは何も変えません。
`accTitle: x` の後にテキストの終わりの `accTitle:` が続けばタイトルは空で、
`accDescr:` も同じです。
`accDescr: x` の後に `accDescr {  }` が続いても `x` のままです。
[fixture: state/lex-acc-title-at-end] [fixture:
state/db-acc-title-empty-replaces] [fixture: state/db-acc-descr-empty-replaces]
[fixture: state/db-acc-descr-empty-block-keeps] [fixture:
state/db-acc-descr-empty-block-keeps-then-transition]

### 文法の外での拒否

- 説明が 2 つ以上の合成状態（上を参照）。
  [fixture: state/db-composite-two-descriptions]
- `state` と `{` の間の 2 つの語（[state の文脈](#state-の文脈) を参照）。
  字句解析器が拒否します。
  [fixture: state/lex-state-two-names-body]

## 既知の差

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  キーワード、矢印、文字列の中のディレクティブは、この仕様では入力を拒否させ、
  mermaid.js はそれを受理します
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  [fixture: state/div-directive-in-keyword] [fixture:
  state/div-directive-in-arrow] [fixture: state/div-directive-in-string]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、`A : b="c">d` は A に、
  mermaid.js では説明 `b='c'>d` を、この仕様では `b="c">d` を与えます。
  [fixture: state/div-html-tag-starts-in-frontmatter-description]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。
  **
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

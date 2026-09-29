# Sequence

英語版: [sequence.md](./sequence.md)

mermaid.js での正解の出どころ:

- [`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison)
- [`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts)
- [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)
  のテスト

この文書は、図種 `sequence` を扱います。
木のノードとトークンは [ast/sequence.ja.md](../ast/sequence.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 15 がこの文法を選びます。
テキストが、空白の後に、
ちょうどこの大文字小文字で `sequenceDiagram` から始まるときです。
[fixture: common/detect-minimal-sequence] [fixture:
common/detect-case-sensitive-sequence]

判定はテキストの始まりだけを見ます。
その後、文法はキーワード `sequenceDiagram` を、1 つの語としてもう一度読みます
（[文の文脈](#文の文脈) を参照）。
そのため、`sequenceDiagramX` は sequence と判定され、拒否されます。
最初の文は、キーワードと同じ行に続けてかまいません。
`sequenceDiagram A->>B: x` は、A から B へのメッセージを持ちます。
[fixture: sequence/header-word-after-keyword] [fixture:
sequence/header-statement-same-line]

判定は字句解析器より多くを除きます
（[図種の検出](../common.ja.md#図種の検出) を参照）。
`%%` だけの行や、ディレクティブではない `%%{ }%%` は、
キーワードの前にあってよく、
テキストはそれでも sequence と判定されます。
字句解析器は、そのような行を図のコメント（[文の文脈](#文の文脈) の規則 4）として、
その改行を `newline` の単位として読みます。
文法は、mermaid.js の文法と同じく、キーワードの前に `newline` の単位を許します
（[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L136-L140)）。
コメントは `Root.comments` に入り、
改行から読む `newline` の単位はトークンではなく、
SequenceDiagram はキーワードから始まります。
判定が除かない、キーワードの前のテキスト（`#` の行など）と、
キーワードと同じ行の `%%`（判定はキーワードごと除きます）では、
判定が失敗します。
判定は `;` を除かないので、
`;` から読む `newline` の単位がキーワードの前に来ることはありません。
`;` の行では判定が失敗し、`%%{ }%%;` の `;` はコメントの一部です。
[fixture: sequence/header-after-semicolon-line] [fixture:
sequence/header-after-empty-braces-semicolon]
[fixture: sequence/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
sequence/header-after-two-bare-percent-lines] [fixture:
sequence/header-after-hash-line] [fixture:
sequence/header-after-bare-percent-on-same-line]
flowchart では、同じ `%%` の行は、mermaid.js と同じく拒否されます
（[検出](./flowchart.ja.md#検出) を参照）。

## 字句構造

字句解析器は、[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをその置き換え文字として読み、
コメント領域と行単位の規則が無視する `;` は、ないかのように読み進めます。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は、
図のテキストの一部です。
この節は、図自身のトークンの規則を述べます。
[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 に当たります。

この図の mermaid.js の字句解析器は、大文字小文字を区別しません。
どの規則も、文字を大文字小文字を区別せずに比べます
（[表記](../common.ja.md#表記) を参照）。
そのため、`PARTICIPANT A` と `Note LEFT OF A: x` は、
`participant A` と `note left of A: x` として読まれます。
単位のテキストは書かれた大文字小文字を保ち、id は書かれたとおりに比べます。
`participant A` と `participant a` は、2 つの参加者を加えます。
[fixture: sequence/lex-keyword-upper-case] [fixture:
sequence/lex-keyword-mixed-case] [fixture: sequence/lex-id-case]

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれます。
各単位は、文法が使う名前と、
**テキスト**、つまりそれが読んだ文字を変換した形で持ちます。
字句解析器は**文脈**のスタックを持ち、文の文脈から始めます。
規則は、文脈に入る（スタックの上に積む）か、
今の文脈を出る（その下の文脈に戻る）ことがあります。
各位置で、字句解析器は、
今の文脈の規則のうち、そこで当たる最初のものを適用します。
どれも当たらなければ、入力は拒否されます。
規則が読む空白は、その規則が作る単位に属し、
単位を作らない規則ならどの単位にも属しません。
テキストの終わりで、字句解析器は止まります。

単位のほかに、字句解析器は**図のコメント**を読みます。
行の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
これは [common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器が読む前に除かれますが、
図のコメントは行の途中からも始まります。
図のコメントの**印**は、`#` で始まるものは `#`、`%%` で始まるものは `%%`、
それ以外は `%` で、その値は印の後のテキストです
（[Comment](../ast.ja.md#comment) を参照）。
`%% c` の値は、コメント行と同じく空白と `c` で、`% c` の値も同じです。
`%%% c` の値は `%`、空白、`c` です。
[fixture: sequence/lex-percent-comment-after-unit] [fixture:
sequence/lex-single-percent-comment] [fixture:
sequence/lex-percent-comment-three-percent]
印は、字句解析器が読むディレクティブを除いたテキストの上で見つけます。
値は、コメント行と同じく、ディレクティブを含む、印の後のソースのテキストです。
`autonumber %%%{a}%%%` は、
最初と最後の `%` を印 `%%` とし、値が空のコメントを持ちます。
`autonumber %%%{a}%% c` では、ディレクティブを除いたテキストは `% c` なので、
印は最初の `%` で、値は `%%{a}%% c` です。
[fixture: sequence/lex-diagram-comment-directive-between-marks] [fixture:
sequence/lex-diagram-comment-directive-after-single-mark]

下の**キーワード**は、字句解析器が大文字小文字を区別せずに読み、
後に語の文字が続かないところでだけ読む語です
（[表記](../common.ja.md#表記) を参照）。
`ender->>B: x` と `notes->>B: x` は参加者 `ender` と `notes` を持ちます。
一方、`loop-a->>B: x` では、`-` は語の文字でないので、
字句解析器はキーワード `loop` を読みます。
[fixture: sequence/lex-keyword-prefix-of-id] [fixture:
sequence/lex-keyword-before-dash]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むのと同じように、
読みます。
その後、
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位とそこから作るトークン
（[ast/sequence.ja.md](../ast/sequence.ja.md#トークン)）に当てはまります。
種類が `RawText` か `Identifier` の単位の中のディレクティブは、
そのトークンを切り、入力は mermaid.js の読み方を保ちます。
ほかの種類の単位の中のディレクティブは、入力を拒否させます。

- `A->>B: x%%{init: {}}%%y` のメッセージは `xy`、
  `Al%%{init: {}}%%ice->>B: x` の参加者は `Alice`、
  `participant A%%{init: {}}%%B` の参加者は `AB` で、
  どれも mermaid.js と同じです。
  [fixture: sequence/lex-directive-in-text] [fixture:
  sequence/lex-directive-in-id-run] [fixture:
  sequence/lex-directive-in-participant-id]
- `parti%%{init: {}}%%cipant A`、`A-%%{init: {}}%%>>B: x`、
  `autonumber 1%%{init: {}}%%0` では、
  ディレクティブがキーワード、矢印、数の中にあり、入力は拒否されます。
  mermaid.js はそれを受理します（[既知の差](#既知の差) を参照）。
  [fixture: sequence/div-directive-in-keyword] [fixture:
  sequence/div-directive-in-arrow] [fixture: sequence/div-directive-in-number]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. 1 個以上の改行: `newline` の単位。
2. 1 個以上の空白で、最初の 1 個が改行でないもの: 何もしない。
   この並びは、空白の後に続く改行も取るので、
   空白の後の改行は `newline` の単位になりません。
   ほかの文脈と、行の終わりまで読む規則は、改行を残します。
3. `#` と、改行の前までのその行の残り: 図のコメント。
4. 後に `{` が続かない `%` と、その行の残り: 図のコメント。
   `%` は 1 つで足ります。
   `autonumber % c` と、`% hello` の行はコメントです。
   一方、始まりに `%%` のある行は、
   [common.ja.md](../common.ja.md#コメント行) のコメント行で、
   字句解析器が読む前に除かれます。
   [fixture: sequence/lex-single-percent-comment] [fixture:
   sequence/lex-single-percent-comment-line]
5. **数**: 1 個以上の数字に、省略可能な `.` と 1 個か 2 個の数字が続くもの、
   または `.` と 1 個か 2 個の数字。
   その後に、読まずに、空白（U+0020）、改行、`%%` のどれかが、
   続かなければなりません。
   `number` の単位。
6. キーワード `box`: `box` の単位。行の文脈に入ります。
7. キーワード `participant` と `actor`: キーワードを名前とする単位。
   id の文脈に入ります。
8. キーワード `create`: `create` の単位。
9. キーワード `destroy`: `destroy` の単位。id の文脈に入ります。
10. キーワード `loop`、`rect`、`opt`、`alt`、`else`、`par`、`par_over`、`and`、
    `critical`、`option`、`break`: キーワードを名前とする単位。
    行の文脈に入ります。
11. キーワード `end`、2 語の間が空白 1 個の `left of` と `right of`、
    `links`、`link`、`properties`、`details`、`over`、`note`:
    キーワードを名前とする単位。
12. キーワード `activate` と `deactivate`: キーワードを名前とする単位。
    id の文脈に入ります。
13. `title`、改行でもよい 1 個の空白、`#`、`;`、改行以外の 1 個以上の文字:
    語と空白の `title` の単位と、残りの `title-text` の単位。
14. `title:`、1 個の空白、`#`、`;`、改行以外の 1 個以上の文字:
    同じように、`title:` の単位と `title-text` の単位。
15. `accTitle`、0 個以上の空白、`:`、0 個以上の空白:
    `accTitle` の単位と `:` の単位。タイトルの文脈に入ります。
16. `accDescr`、0 個以上の空白、`:`、0 個以上の空白:
    `accDescr` の単位と `:` の単位。説明の文脈に入ります。
17. `accDescr`、0 個以上の空白、`{`、0 個以上の空白:
    `accDescr` の単位と `{` の単位。説明のブロックの文脈に入ります。
18. キーワード `sequenceDiagram`、`autonumber`、`off`:
    キーワードを名前とする単位。
19. `,`: `,` の単位。
20. `;`: `newline` の単位。
21. **id の並び**: [id の並び](#id-の並び) で述べる文字の並び。
    `id` の単位で、そのテキストは並びから両端の空白を除いたものです。
22. 矢印。次のうち最初に当たるもの: `->>`、`<<->>`、`-->>`、`<<-->>`、
    `->`、`-->`、`-x`、`--x`、`-)`、`--)`、`--|\`、`--|/`、`--\\`、`--//`、
    `/|--`、`\|--`、`//--`、`\\--`、`-|\`、`-|/`、`-\\`、`-//`、`/|-`、`\|-`、
    `//-`、`\\-`。`arrow` の単位。
23. `:` と、`#`、`;`、改行の前までのその行の残り:
    `:` の単位と、その後の残りをテキスト部分として読んだもの
    （[テキスト部分](#テキスト部分) を参照）。
24. `+`、`-`、`()`: そのテキストを名前とする単位。
25. ほかの 1 文字: `invalid` の単位。

テキストの終わりで、字句解析器は `newline` の単位を読みます。

順序から生じることの例:

- `#` と `%` が図のコメントを始めるのは、単位が始まる位置だけです。
  id の並びの中では、`#` はその並びの文字です。
  `participant A # c` は参加者 `A # c` を加え、
  `A # c ->>B: x` のメッセージは `A # c` からです。
  テキストの中では、`%%` はテキストの一部で、`#` はテキストを終えます。
  `A->>B: y %% c` のメッセージは `y %% c` で、
  `A->>B: x # c` のメッセージは `x` です。
  [fixture: sequence/lex-hash-inside-id] [fixture:
  sequence/lex-hash-inside-id-run] [fixture: sequence/lex-percent-in-text]
  [fixture: sequence/lex-hash-ends-text] [fixture:
  sequence/lex-hash-comment-after-unit] [fixture:
  sequence/lex-percent-comment-after-unit]
- 図のコメントはその印から始まり、その前の単位は文字をすべて保ちます。
  数の後には `%%` が続いてよいので、
  `autonumber 5%% c` は `autonumber 5 %% c` と同じく 5 から始まり、
  `autonumber 10%% c` は 10 から始まります。
  数の後の `%` 1 つは数を終えません。
  そこでは字句解析器が id の並びを読むので、`autonumber 5% c` は拒否されます。
  id の並びの文字の後の `%%` は、その並びの文字です。
  行 `C%% c` は id の並び `C%% c` で、矢印のない文なので拒否されます。
  `:` の後では、テキストの文字です。
  `A->>B:%% c` のメッセージは `%% c` です。
  mermaid.js はこれらの入力を別に読みます（[既知の差](#既知の差) を参照）。
  [fixture: sequence/lex-percent-comment-takes-number] [fixture:
  sequence/lex-percent-comment-after-space] [fixture:
  sequence/div-comment-after-two-digit-number] [fixture:
  sequence/lex-number-before-single-percent] [fixture:
  sequence/div-comment-after-one-character-id] [fixture:
  sequence/div-comment-after-text-colon]
- 規則 2 によって、行末の空白は、`newline` の単位を要る文から改行を隠します。
  `autonumber`、空白 2 個、改行、`A->>B: y` は拒否され、
  空白のない同じものは受理されます。
  間にコメント行があっても同じです。
  コメント行は字句解析器が読む前に除かれるからです。
  `autonumber` と空白、コメント行、`actor Patient` は拒否されます。
  [issue #4293](https://github.com/mermaid-js/mermaid/issues/4293) は、
  この入力を報告していて、2026-10-01 の時点で未解決で、
  ラベルは `Type: Bug / Error` と `Status: Triage` です。
  [fixture: sequence/lex-trailing-space-hides-line-break] [fixture:
  sequence/lex-autonumber-line-break] [fixture:
  sequence/lex-autonumber-space-before-comment-line]
- 数の後には、空白、改行、`%%` のどれかが続かなければなりません。
  `autonumber 10.001` と、`autonumber 5`、タブ、`6` は拒否されます。
  字句解析器はそこで id の並びを読むからです。
  `1->>2: x` は参加者 `1` と `2` を持ちますが、`1 ->>2: x` は拒否されます。
  空白が続く `1` は数だからです。
  [fixture: sequence/spec-sequence-diagram-e6409a58] [fixture:
  sequence/lex-number-before-tab] [fixture: sequence/lex-number-as-id]
  [fixture: sequence/lex-number-before-space]
- `title` は、改行でもよい 1 個の空白と、次の行の残りを取ります。
  `title`、改行、`A->>B: x` のタイトルは `A->>B: x` で、メッセージはありません。
  `title x A->>B: y` のタイトルは `x A->>B: y` です。
  [fixture: sequence/lex-title-line-break] [fixture:
  sequence/lex-title-rest-of-line]
- `,`、`;`、規則 22 から 24 の文字は id の並びを終えます。
  そして `invalid` の単位の行は受理されます（[文法](#文法) を参照）。
  `)`、`/`、`\`、`<`、`>` だけの行は受理され、何も変えません。
  [fixture: sequence/lex-invalid-line-parenthesis] [fixture:
  sequence/lex-invalid-line-slash] [fixture:
  sequence/lex-invalid-line-two-units]

### id の並び

id の並びは、次のものからなる最長の文字の並びです。

1. `/`、`\`、`+`、`(`、`)`、`<`、`-`、`>`、`:`、`,`、`;`、
   改行以外の 1 個以上の文字。
   その後に、
2. 任意の数の続き。
   続きは、0 個以上の `-` の後に、
   `+`、`<`、`-`、`>`、`:`、`,`、`;`、
   改行以外の 1 個以上の文字が続いたものです。
   続きは、次のどれかが続く位置からは始まりません:
   `-x`、`-)`、`-\`、`-/`、`-|\`、`-|/`、`--`、`/|-`、`\|-`、`//-`、
   `\\-`、`()`。

そのため、id の並びは、空白、`#`、`=` を含められ、
最初の文字の後なら `/`、`\`、`(`、`)` も含められます。
1 個の `-` は部分をつなげますが、`--` と矢印の始まりは並びを終えます。
`Alice Smith->>Bob: hi` は参加者 `Alice Smith` を、
`A-B->>C: x` は参加者 `A-B` を、
`A/B->>C: x` と `A(B)->>C: x` は参加者 `A/B` と `A(B)` を持ちます。
一方、`A--B->>C: x` は拒否され、
`A-xB: x` は A から B への矢印 `-x` のメッセージです。
矢印の前の空白は並びの一部で、単位のテキストには入りません。
`A ->> B : x` は `A` から `B` へのメッセージです。
[fixture: sequence/lex-id-run-space] [fixture: sequence/lex-id-run-dash]
[fixture: sequence/lex-id-run-slash] [fixture:
sequence/lex-id-run-parentheses] [fixture: sequence/lex-id-run-double-dash]
[fixture: sequence/lex-id-run-cross-arrow] [fixture:
sequence/lex-id-run-spaces-around-arrow]

### id の文脈

id の文脈には、
`participant`、`actor`、`destroy`、`activate`、`deactivate` で入ります。
1 つの id を読みます。

1. 改行以外の空白: 何もしない。
2. `#` とその行の残り: 図のコメント。
3. `@{`: `@{` の単位。データの文脈に入ります。
4. `<`、`=`、`>`、`-`、`:`、`,`、`;`、`@`、空白、改行以外の 1 個以上の文字で、
   直後に `@{` が続くもの（`@{` は読まない）: `id` の単位。
5. `<`、`>`、`:`、`,`、`;`、`@`、空白、改行以外の 1 個以上の文字で、
   その後に空白、キーワード `as`、1 個の空白が続くもの（それらは読まない）:
   `id` の単位。別名の文脈に入ります。
6. `<`、`>`、`:`、`,`、`;`、`@`、改行以外の 1 個以上の文字の並びのうち、
   その後に 0 個以上の空白と、改行、`;`、`#` のどれかが続く最長のもの
   （それらは読まない）:
   `id` の単位で、そのテキストは並びから両端の空白を除いたもの。
   id の文脈を出ます。
7. `<`、`>`、`:`、`,`、`;`、`@`、改行以外の 0 個以上の文字、`<`、その行の残り:
   `invalid` の単位。id の文脈を出ます。
8. 改行以外の 1 個以上の文字: `invalid` の単位。id の文脈を出ます。

規則 6 の並びは `#` を含められ、行が許す最長のものです。
`participant A # c` は参加者 `A # c` を加えます。
並び全体の後に改行が続くからです。
`participant A # c <x` では、`c` までの並びの後には `<` が続くので、
並びは `A` で、`# c <x` は文の文脈の図のコメントです。
`participant A # b # c <x` は `A # b` を加えます。
[fixture: sequence/lex-hash-inside-id] [fixture:
sequence/lex-id-context-hash-before-invalid] [fixture:
sequence/lex-id-context-two-hashes-before-invalid]

そのため、`participant` の後の id は、空白、`#`、`=` を含められ、
行の終わり、`;`、`as` の前で終わります。
`participant A B` は参加者 `A B` を、`participant A=B` は参加者 `A=B` を加え、
`activate A B` は `A B` を活性化します。
`@{` の前の id は、空白、`-`、`=` を含められません。
`participant A-B@{ "type": "queue" }` は拒否されます。
`:` や `<` を含む id は拒否され、行の終わりの `participant` も拒否されます。
改行を読む規則がないからです。
[fixture: sequence/lex-id-context-space] [fixture:
sequence/lex-id-context-equals] [fixture: sequence/lex-activate-id-space]
[fixture: sequence/lex-id-before-data-dash] [fixture:
sequence/lex-id-context-colon] [fixture: sequence/lex-id-context-line-break]

### 別名の文脈

別名の文脈には、`as` が続く id の後と、`as` が続くデータブロックの後で入ります。

1. 改行以外の空白: 何もしない。
2. `#` とその行の残り: 図のコメント。
3. キーワード `as`: `as` の単位。
   別名の文脈と id の文脈を出て、行の文脈に入ります。
4. 改行のところで、何も読まない: 文字を読まない `newline` の単位。
   別名の文脈と id の文脈を出ます。

このキーワードは大文字小文字を区別せず、
その前後の空白は改行以外のどの空白でもかまいません。
`participant A AS B` とタブを使った同じものは、A に説明 `B` を与えます。
[fixture: sequence/lex-alias-upper-case] [fixture: sequence/lex-alias-tabs]

規則 4 は、id かデータブロックと `as` の間に改行があるときに当たります。
id の文脈の規則 5 とデータの文脈の規則 2 が、
`as` の前に探す空白は改行を含むので、
`participant A`、改行、`as ->> B: x` は、`A` の後で別名の文脈に入ります。
別名の文脈は改行の前に `as` を読まず、
文字のない `newline` の単位で、そこで文を終えます。
この単位はトークンではありません。
その後の改行は文の文脈の `newline` の単位で、
次の行は、前の行がないときと同じく読まれる 1 つの文で、
`as` から B へのメッセージです。
id の文脈に入るどのキーワードの後でも、id が `as` のときも、
データブロックの後でも、改行が何個あっても同じです。
`as B` や `as` だけのように、次の行が文でなければ、入力は拒否されます。
[fixture: sequence/lex-alias-lookahead-line-break-participant] [fixture:
sequence/lex-alias-lookahead-line-break-id-as] [fixture:
sequence/lex-alias-lookahead-line-break-activate] [fixture:
sequence/lex-alias-lookahead-line-break-deactivate] [fixture:
sequence/lex-alias-lookahead-line-break-destroy] [fixture:
sequence/lex-alias-lookahead-line-break-create] [fixture:
sequence/lex-alias-lookahead-line-break-data-block] [fixture:
sequence/lex-alias-lookahead-line-break-blank-line] [fixture:
sequence/lex-alias-lookahead-space-before-line-break] [fixture:
sequence/lex-alias-lookahead-line-break-as-text] [fixture:
sequence/lex-alias-lookahead-line-break-as-alone]

### 行の文脈

行の文脈には、`box`、`as`、ブロックのキーワード（文の文脈の規則 10）で入ります。
行の残りを読みます。

1. 改行以外の空白: 何もしない。
2. `#` とその行の残り: 図のコメント。
3. `box` の後の最初の単位としてだけ、**色の候補**。
   小文字の `rgb`、`rgba`、`hsl`、`hsla` のどれかに、0 個以上の空白、`(`、
   次の `#`、`;`、改行より前の最後の `)` までの文字が続くもの。
   そうでなければ、1 個以上の語の文字（ASCII の英字、数字、`_`）。
   `color-candidate` の単位。
4. `#`、`;`、改行以外の 0 個以上の文字:
   `box` の後では、すべて空白でなければ `text` の単位。
   それ以外では、テキスト部分として読みます
   （[テキスト部分](#テキスト部分) を参照）。
   行の文脈を出ます。

そのため、`loop x # c` のテキストは `x` と空白で、
`alt;B->>A: y` は空のテキストの `alt` のブロックと、それに続くメッセージです。
[fixture: sequence/spec-sequence-diagram-01f0c47f] [fixture:
sequence/spec-sequence-diagram-453b7670]

### データの文脈

データの文脈には、id の後の `@{` で入ります。

1. `}` 以外の 1 個以上の文字: `data-text` の単位。
2. 後に空白、キーワード `as`、1 個の空白が続く `}`（それらは読まない）:
   `}` の単位。データの文脈を出て、別名の文脈に入ります。
3. `}`: `}` の単位。データの文脈と id の文脈を出ます。

そのため、データブロックは最初の `}` で終わり、その中身は `}` を含められません。
[fixture: sequence/docs-syntax-sequence-diagram-1371ae9a] [fixture:
sequence/lex-data-block-nested-brace]

### アクセシビリティの値

タイトルの文脈と説明の文脈では、改行以外の 1 個以上の文字が
`title-text` か `description-text` の単位で、文脈を出ます。
そのため、これらは `#` と `;` を含めて行の残りを読みます。
説明のブロックの文脈では、`}` は `}` の単位で文脈を出て、
他の 1 個以上の文字は `description-block-text` の単位です。
[fixture: sequence/lex-acc-title-line-feed] [fixture:
sequence/lex-acc-title-hash]

### テキスト部分

**テキスト部分**は、`:` の後か、
`box` 以外の行の文脈に入るキーワードの後の、行の残りです。
その始まりの空白は、どの単位にも属しません。
その後が**折り返しの接頭辞**で始まるとき、
その接頭辞は `wrap-prefix` の単位です。
折り返しの接頭辞は `wrap:` か `nowrap:` で、前に `:` を 1 つ置いてもよく、
大文字小文字を区別して比べます。
残りは、すべて空白でなければ `text` の単位です。
mermaid.js は、テキスト部分を、テキストとその折り返しの設定として読みます。
テキストは、接頭辞と両端の空白を除いたものです。
`wrap:` の後なら折り返し、`nowrap:` の後なら折り返しません。
`A->>B: wrap:long` は折り返すメッセージ `long` を持ち、
`A->>B: :nowrap: x` は折り返さないメッセージ `x` を持ちます。
一方、`A->>B: WRAP:x` のメッセージは `WRAP:x` です。
テキスト部分は空でもかまいません。
`A->>B:` は空のメッセージを持ちます。
[fixture: sequence/lex-wrap-prefix] [fixture:
sequence/lex-nowrap-prefix-colon] [fixture:
sequence/lex-wrap-prefix-upper-case] [fixture: sequence/lex-empty-text]

`box` の後では、行の残りは、形だけで、色の候補と `text` の単位に分けられます。
どちらもないことがあります。
mermaid.js も、候補が色かを問い合わせる前に、同じように分けます。
`box aqua Group` は候補 `aqua` とテキスト `Group`、
`box rgb(1,2,3)x` は候補 `rgb(1,2,3)` とテキスト `x`、
`box rgb(1, 2, 3) a) b` は候補 `rgb(1, 2, 3) a)` とテキスト `b`、
`box rgb( a` は候補 `rgb` とテキスト `( a` を持ち、
`box -x` は候補を持たず、テキスト `-x` を持ちます。
分け方は答えに依らないので、どちらも単位で、したがってトークンです。
候補が色かどうかは答えに依り、折り返しの接頭辞の位置も依ります。
候補が色でなければ、接頭辞は候補と残りを合わせたテキストから読むからです。
そのため、`box` の後に `wrap-prefix` の単位はありません
（[箱の色](#箱の色) を参照）。
[fixture: sequence/spec-sequence-diagram-9f31df65] [fixture:
sequence/db-box-colour-without-space] [fixture:
sequence/db-box-colour-function-last-parenthesis] [fixture:
sequence/db-box-colour-function-unclosed] [fixture:
sequence/db-box-no-colour-candidate] [fixture:
sequence/db-box-wrap-without-colour]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の記法を、
文字ではなく単位の上で使います。
`id` のような単位の名前は、その名前の単位 1 つを表し、
二重引用符の中のテキストは、`"participant"` や `"+"` のように、
そのテキストを名前とする単位を表します。
`end-of-text` はテキストの終わりを表します。
この文法は
[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L136-L419)
の文法を述べ直したもので、同じ単位の並びを受理します。

次の各規則が、[ast/sequence.ja.md](../ast/sequence.ja.md) で定める、
木のノードを作ります。

| 規則                                                                              | ノード                                                                                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                         | SequenceDiagram                                                                                                                          |
| `participant` か `actor` の `participant-statement`                               | SequenceParticipantStatement                                                                                                             |
| `destroy` の `participant-statement`                                              | SequenceDestroyStatement                                                                                                                 |
| `data-block`                                                                      | SequenceDataBlock                                                                                                                        |
| `box-statement`                                                                   | SequenceBoxStatement                                                                                                                     |
| `box-text`                                                                        | SequenceBoxText。その `color-candidate` と `text` はそれぞれ SequenceLiteral                                                             |
| `message-statement`                                                               | SequenceMessageStatement                                                                                                                 |
| `arrow`                                                                           | SequenceArrow                                                                                                                            |
| `autonumber-statement`                                                            | SequenceAutonumberStatement                                                                                                              |
| `"activate" id newline`、`"deactivate" id newline`                                | SequenceActivateStatement、SequenceDeactivateStatement                                                                                   |
| `note-statement`                                                                  | SequenceNoteStatement                                                                                                                    |
| `"links"`、`"link"`、`"properties"`、`"details"` の文                             | SequenceLinksStatement、SequenceLinkStatement、SequencePropertiesStatement、SequenceDetailsStatement                                     |
| `title-statement`                                                                 | SequenceTitleStatement                                                                                                                   |
| `accessibility-statement`                                                         | SequenceAccTitleStatement、SequenceAccDescrStatement、SequenceAccDescrBlockStatement のどれか                                            |
| `loop`、`rect`、`opt`、`break` の `block-statement`                               | SequenceLoopStatement、SequenceRectStatement、SequenceOptStatement、SequenceBreakStatement                                               |
| `alt`、`par`、`par_over`、`critical` の `block-statement`                         | SequenceAltStatement、SequenceParStatement、SequenceParOverStatement、SequenceCriticalStatement。各 `text-part line*` に SequenceSection |
| `text-part`                                                                       | SequenceText。どちらの単位もなければ何も作らない                                                                                         |
| `id`                                                                              | Identifier                                                                                                                               |
| `number`                                                                          | NumericLiteral                                                                                                                           |
| テキスト部分の `text`、`title-text`、`description-text`、`description-block-text` | SequenceLiteral。すべて空白のタイトルなら null                                                                                           |
| 行としての `invalid`                                                              | SequenceIgnoredStatement                                                                                                                 |

### 図と文

```text
diagram             = newline* "sequenceDiagram" line*
line                = statement | newline | invalid
statement           = participant-statement
                    | "create" participant-statement
                    | box-statement
                    | message-statement newline
                    | autonumber-statement newline
                    | ( "activate" | "deactivate" ) id newline
                    | note-statement newline
                    | ( "links" | "link" | "properties" | "details" ) id ":" text-part newline
                    | title-statement
                    | accessibility-statement
                    | block-statement
```

`newline` で終わる文の後には、
改行、`;`、テキストの終わりのどれかが続かなければなりません。
ほかの文は区切りを要りません。
箱とブロックは `end` で終わり、
タイトルとアクセシビリティの文は行の終わりまで続くので、
`end` の後の同じ行に別の文を続けられます。
`loop x`、メッセージ、`end A->>B: z` は、ループの後にメッセージを持ちます。
[fixture: sequence/gram-statement-after-end]
`invalid` の単位の行は受理されて、木では SequenceIgnoredStatement になり、
Db の何も変えません。
`end` の後の同じ行でも同じです。
[fixture: sequence/lex-invalid-line-parenthesis] [fixture:
sequence/gram-invalid-after-end]
テキストが続くつもりだったメッセージの後の `)` の行も、そのような行です。
`A->>B: call(x`、改行、`)` のメッセージは `call(x` です。
[fixture: sequence/db-ignored-line-after-wrapped-message] [fixture:
sequence/db-wrapped-message-closed]

### 参加者と箱

```text
participant-statement = ( "participant" | "actor" ) id data-block? ( "as" text-part )? newline
                      | "destroy" id newline
data-block            = "@{" data-text? "}"
box-statement         = "box" box-text? ( participant-statement | newline )* "end"
box-text              = color-candidate text? | text
```

`as` とその後のテキストは、参加者に説明を与えます。
データブロックは埋め込みデータで、その中身は書かれたとおりに保たれ、読まれません
（[Db の中のデータブロック](#db-の中のデータブロック) を参照）。
`create` は、`destroy` を含め、どの参加者の文の前にも置けます。
`create destroy A` は `create` の付いた destroy の文で、
A を作られた参加者として加え、何も destroy しません
（[木から要約を作る](#木から要約を作る) を参照）。
[fixture: sequence/gram-create-destroy]
箱が持てるのは、参加者の文と空の行だけで、`create` もメッセージも置けません。
[fixture: sequence/gram-box-create-participant] [fixture:
sequence/gram-box-message-inside]

### メッセージ

```text
message-statement = id arrow ( "+" | "-" | "()" )? id ":" text-part
                  | id "()" arrow "()"? id ":" text-part
```

矢印の後の `+` は宛先を活性化し、`-` は送り手を非活性化します。
矢印の後か前、またはその両方の `()` は、中央の接続を表します。
`+` と `-` は `()` と組み合わせられません。
メッセージはテキストを要りますが、それは `:` の後が空でもかまいません。
`A->>B` は拒否され、`A->>B:` は受理されます。
[fixture: sequence/gram-message-without-text] [fixture:
sequence/lex-empty-text]

### ほかの文

```text
autonumber-statement    = "autonumber" ( number number? | "off" )?
note-statement          = "note" ( "left of" | "right of" ) id ":" text-part
                        | "note" "over" id ( "," id )? ":" text-part
text-part               = wrap-prefix? text?
title-statement         = ( "title" | "title:" ) title-text
accessibility-statement = "accTitle" ":" title-text?
                        | "accDescr" ":" description-text?
                        | "accDescr" "{" description-block-text? ( "}" | end-of-text )
```

### ブロック

```text
block-statement = ( "loop" | "rect" | "opt" | "break" ) text-part line* "end"
                | "alt" text-part line* ( "else" text-part line* )* "end"
                | ( "par" | "par_over" ) text-part line* ( "and" text-part line* )* "end"
                | "critical" text-part line* ( "option" text-part line* )* "end"
```

ブロックのテキストは空でもかまいません。
`loop`、改行、`end` は、空のテキストのループです。
[fixture: sequence/gram-block-empty-text]

## Db の正規化

フロントマターの図のタイトルと、設定に依る Db の値は、木からは来ません。
Db の値を確かめる側が、mermaid.js 自身の関数で求めます
（[設定（参考）](../common.ja.md#設定参考) を参照）。
ここでは、折り返しの接頭辞のないテキストが受け取る折り返しの設定がそれです。
設定の `wrap`、なければ `sequence.wrap`、なければ偽です。
[fixture: sequence/config-wrap-site] [fixture:
sequence/config-sequence-wrap-site] [fixture:
sequence/config-wrap-site-nowrap-prefix]

### 要約

fixture は、mermaid.js の Db を、次の欄を持つ要約として記録します。
要約を作るのは、`@mmd-toolkit/tests` の
[`normalizeSequence()`](../../../tests/src/normalizers/sequence.ts) です。

| 欄                | 中身                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| `title`           | タイトル。                                                                |
| `accTitle`        | アクセシビリティのタイトル。なければ空のテキスト。                        |
| `accDescr`        | アクセシビリティの説明。なければ空のテキスト。                            |
| `actors`          | 参加者。最初に加えた順。                                                  |
| `boxes`           | 箱。ソースの順。`name`、`wrap`、`fill`、`actorKeys`。                     |
| `createdActors`   | 作られた参加者。`id` と `messageIndex`。                                  |
| `destroyedActors` | destroy された参加者。`id` と `messageIndex`。                            |
| `messages`        | メッセージ、ノート、autonumber の設定、活性化、ブロックの始まりと終わり。 |

参加者は、`name`、`description`、`wrap`、`prevActor`、`nextActor`、
`links`、`properties`、`type`、`box`（その箱の `boxes` の中の位置）を持ちます。
Db が設定しない欄はありません。
要約は、描画だけが使うものを除きます。
文字列にした一覧の中のメッセージの位置、描画が埋める欄、
ノートの別の一覧（各ノートはメッセージでもある）、連番を表示するかどうかです。
テキストは、mermaid.js が HTML の無害化の前に持つとおりに記録します
（[サニタイザは無効にする](../../../tests/docs/expected-results.ja.md#サニタイザは無効にする)
を参照）。

### 木から要約を作る

文はソースの順に適用し、ブロックの自分の項目はその本体の前と後に適用します。
各文は次のとおりです。
下のテキスト部分の**テキスト**は、
その `text` の単位から両端の空白を除いたもので、
`text` の単位がなければ空のテキストです
（[テキスト部分](#テキスト部分) を参照）。
その**折り返し**は、`wrap:` の後なら真、`nowrap:` の後なら偽、
それ以外は設定の折り返しの設定です。

**参加者。**
id、説明、種類、データブロックを持つ参加者を加えると、次のようになります。

- 箱の中では、その id の参加者がすでにあって箱を持たなければ、
  参加者はその箱を持ち、
  ほかの箱を持っていれば、入力は拒否されます
  （[文法の外での拒否](#文法の外での拒否) を参照）。
  これは次の 2 つの項目より先に起こるので、
  ほかに何も変わらないときも起こります。
  [fixture: sequence/db-box-existing-participant-joins-box] [fixture:
  sequence/gram-box-participant-in-two-boxes]
- その id の参加者がすでにあり、文が説明を持たないときは、
  ほかに何も変わりません。
  `participant A as Alice` の後の `participant A` は、説明 `Alice` を保ちます。
  [fixture: sequence/db-participant-redeclared-without-alias]
- それ以外では、参加者を新しく記録します。
  `name` は id、`description` は説明かなければ id、`wrap` は説明の折り返し、
  `type` は種類、`links` と `properties` は空、
  `prevActor` は最後に加えた参加者の id（あれば）です。
  その参加者は `nextActor` にこの id を持ちます。
  すでにあった参加者は、`actors` の中の位置と箱を保ちます。
  その links と properties は空になり、`prevActor` は最後に加えた参加者で、
  それは自分自身のこともあります。
  `participant A`、`participant B`、`participant A as Alice` の後では、
  A は説明 `Alice` と `prevActor` B を持ち、B は `nextActor` A を持ちます。
  [fixture: sequence/db-participant-redeclared-with-alias] [fixture:
  sequence/db-participant-redeclared-after-links] [fixture:
  sequence/db-participant-redeclared-itself-previous]
- 箱の中で参加者を記録するときは、初めて記録する参加者はその箱を持ち、
  参加者を記録するたびに、箱は `actorKeys` の最後にその id を加えます。
  `box a`、`participant A`、`participant A as X`、`end` では、
  `actorKeys` は A を 2 回持ちます。
  `participant A` が 2 つなら 1 回です。
  箱の前と箱の中の `participant A` では、
  `actorKeys` は空で、A はその箱を持ちます。
  箱の外では、参加者は箱を保ちます。
  [fixture: sequence/spec-sequence-diagram-f1763a40] [fixture:
  sequence/db-box-participant-twice-with-alias] [fixture:
  sequence/db-box-participant-twice] [fixture:
  sequence/db-box-existing-participant-with-alias] [fixture:
  sequence/db-box-participant-redeclared-outside]

参加者の文は、その id を、`as` のテキストがあればそれを説明とし、
種類 `participant` か `actor` として加えます。
データブロックが設定する `type` と説明は、木からは求めません
（[Db の中のデータブロック](#db-の中のデータブロック) を参照）。
メッセージ、ノート、`links`、`link`、`properties`、`details` の文は、
まず、それが挙げる各 id を、説明なし、種類 `participant` で加えます。
そのため、すでにある id は変わりません。
`activate`、`deactivate`、`destroy` は何も加えません。
[fixture: sequence/lex-activate-id-space]

**create と destroy。**
参加者の文の前の `create` は、その id の参加者がすでにあれば拒否されます
（[文法の外での拒否](#文法の外での拒否) を参照）。
そうでなければ参加者を加え、その id を `createdActors` に記録します。
`messageIndex` は、それまでの `messages` の項目の数です。
`destroy` は、同じように id を `destroyedActors` に記録します。
[fixture: sequence/db-create-participant] [fixture:
sequence/db-destroy-participant] [fixture:
sequence/db-create-participant-before-message]
`create` の付いた destroy の文は、
その id で `create participant` と同じことをします。
種類が `participant` で、id を説明とする参加者を加え、
`createdActors` に記録します。
`destroyedActors` には何も記録せず、`create` の後の検査が当てはまります
（[文法の外での拒否](#文法の外での拒否) を参照）。
[fixture: sequence/gram-create-destroy] [fixture:
sequence/db-create-destroy-then-destroy] [fixture:
sequence/gram-create-destroy-without-message] [fixture:
sequence/gram-create-destroy-existing]

**メッセージ。**
メッセージの文は、`messages` に項目を 1 つ加えます。
`from` と `to` は 2 つの id、`message` はテキスト、`wrap` はその折り返し、
`type` は矢印の番号（[矢印](#矢印) を参照）で、
`activate` と `centralConnection` を持ちます。
その後は次のとおりです。

- `+` のとき: `activate` は真。その後に、宛先の型 17 の項目。
- `-` のとき: `activate` は偽。その後に、送り手の型 18 の項目。
- 矢印の後の `()` のとき: `activate` は真で、`centralConnection` は 59。
  その後に、宛先の型 59 の項目。
- 矢印の前の `()` のとき: `activate` は偽で、`centralConnection` は 60。
  その後に、送り手の型 60 の項目。
- 両方のとき: `activate` は真で、`centralConnection` は 61。
  その後に、宛先の型 59 の項目と、送り手の型 60 の項目。
- それ以外: `activate` は偽で、`centralConnection` は 0。

1 つの参加者の項目は、`from` にその id を持ち、`to` を持たず、
`message` は空、`wrap` は設定の折り返しの設定、`activate` は偽、
`centralConnection` は 0 です。
`activate` と `deactivate` は、そのような型 17 と型 18 の項目を加えます。
[fixture: sequence/db-message-activate-target] [fixture:
sequence/db-message-central-connection-target] [fixture:
sequence/db-message-central-connection-source] [fixture:
sequence/db-message-central-connection-both]

**ノート。**
ノートは項目を 1 つ加えます。
その項目は、`from` と `to` にその id（`,` のある `over` なら 2 つの id）を持ち、
`message` はテキスト、`wrap` はその折り返し、`type` は 2 です。
`placement` は、`left of` なら 0、`right of` なら 1、`over` なら 2 です。
[fixture: sequence/db-note-over-two] [fixture: sequence/db-note-left-of]

**autonumber。**
`autonumber` は、`message` が `visible` 真で、
数が続くときは `start` と `step` を持つ型 26 の項目を加えます。
`start` は 1 つ目の数で、`step` は 2 つ目の数、なければ 1 です。
`autonumber off` は、`visible` が偽で、数を持ちません。
その `wrap` は偽です。
[fixture: sequence/db-autonumber-bare] [fixture:
sequence/db-autonumber-start] [fixture: sequence/db-autonumber-start-step]
[fixture: sequence/db-autonumber-off]

**ブロック。**
ブロックは、始まりにテキストとその折り返しの項目を、
各 `else`、`and`、`option` にそのテキストの項目を、
`end` に空のテキストと設定の折り返しの設定の項目を加えます。
型は次のとおりです。

| ブロック   | 始まり | 節  | 終わり |
| ---------- | ------ | --- | ------ |
| `loop`     | 10     |     | 11     |
| `alt`      | 12     | 13  | 14     |
| `opt`      | 15     |     | 16     |
| `par`      | 19     | 20  | 21     |
| `rect`     | 22     |     | 23     |
| `critical` | 27     | 28  | 29     |
| `break`    | 30     |     | 31     |
| `par_over` | 32     | 20  | 21     |

ブロックの項目は、`from` と `to` を持たず、`activate` は偽、
`centralConnection` は 0 です。
`rect` のテキストは、描画が塗りの色として使います。
Db はそれをテキストとして持ちます。
[fixture: sequence/db-block-loop-wrap] [fixture: sequence/db-block-alt]
[fixture: sequence/db-block-opt] [fixture: sequence/db-block-rect] [fixture:
sequence/db-block-critical] [fixture: sequence/db-block-par] [fixture:
sequence/db-block-par-over] [fixture: sequence/db-block-break]

**箱。**
箱は、`actorKeys` が空の項目を `boxes` に加え、
その中の参加者の文がそれぞれの id を加えます。
その中の destroy の文は何も加えません。
[fixture: sequence/db-box-empty] [fixture: sequence/db-box-destroy-inside]
その `name`、`fill`、`wrap` は、テキストの始まりが色かどうかに依り、
mermaid.js はそれをブラウザに問い合わせます。
これらは木の外から与えます（[箱の色](#箱の色) を参照）。

**links と properties。**
`links` と `properties` は、テキストを JSON として読み、
その値の各キーを、参加者の `links` か `properties` に写します。
前の文のキーに加え、すでにあるキーは置き換えます。
JSON のオブジェクトのキーはその名前です。
JSON の配列は、各要素を 0 から数えた位置の下に与え、
JSON の文字列は、各 UTF-16 コード単位を 0 から数えた位置の下に与えます。
数、`true`、`false`、`null` は何も与えません。
JSON でないテキストは何も変えず、入力は受理されます。
Db を求める側は、その JSON を、木のテキストから、変換後の形で読みます。
変換後の形では、エンティティはプレースホルダです。
この JSON は、
[`embedded-data-opaque`](../known-divergences.ja.md#embedded-data-opaque)
の意味での埋め込みデータではありません。
mermaid.js はそれを理由に入力を拒否することがなく、
木はそれをほかのテキストと同じく保つからです。
[fixture: sequence/db-links-not-json] [fixture:
sequence/db-properties-not-json] [fixture: sequence/db-links-string-value]
[fixture: sequence/db-properties-string-value] [fixture:
sequence/db-links-array-value] [fixture: sequence/db-links-number-value]
[fixture: sequence/db-links-two-statements] [fixture: sequence/db-links-entity]
[fixture: sequence/db-links-object] [fixture: sequence/db-links-trailing-comma]
[fixture: sequence/db-properties-trailing-comma]
テキストのない文のテキストは空のテキストで、JSON ではありません。
`links A:` と `properties A:` は何も変えません。
[fixture: sequence/db-links-empty] [fixture: sequence/db-properties-empty]
[fixture:
sequence/db-links-proto-key] [fixture: sequence/db-properties-proto-key]
`link` は 1 つのリンクを設定します。
そのラベルは、最初の `@` より前のテキストから `@` の直前の 1 文字を除いたもの、
URL はその `@` より後のテキストで、それぞれ両端の空白を除きます。
`@` が最初の文字なら、その前に文字はなく、
ラベルはテキストから最後の 1 文字を除いたものです。
`@` が 2 番目の文字なら、ラベルは空です。
`@` がないときは、ラベルはテキストから最後の 2 文字を除いたもの、
URL はテキスト全体です。
`link A: Dash @ https://x` は `Dash` を、
`link A: Dash@https://x` は `Das` を、
`link A: @ https://alic` は `@ https://ali` に `https://alic` を設定し、
`link A: x@https://u` は空のラベルを設定し、
`link A: no at` は `no` に `no at` を設定します。
[fixture: sequence/db-link-label] [fixture: sequence/db-link-without-space]
[fixture: sequence/db-link-at-first] [fixture: sequence/db-link-at-second]
[fixture: sequence/db-link-at-only] [fixture: sequence/db-link-without-at]
[fixture: sequence/db-link-without-at-url]
テキストが空なら、`link A:` は `@` を持たず、空のラベルに空の URL を設定します。
[fixture: sequence/db-link-empty]
`details` は、テキストがなくても、何も変えません。
mermaid.js は、テキストを id とするページの要素を探しますが、
ページは図のテキストの一部ではなく、要約はそれのないページとして作ります。
[fixture: sequence/db-details-empty]

**タイトル。**
`title` は、タイトルを、`title-text` の単位のテキストに、
空白を含めて書かれたとおりに設定します。
`title`、空白 2 個、`x`、空白 2 個のタイトルは、空白、`x`、空白 2 個です。
`title:` も同じです。
`accTitle:` はアクセシビリティのタイトルを、
`accDescr:` と `accDescr {` は説明を設定します。
[flowchart.ja.md](./flowchart.ja.md#木から要約を作る) と同じく、
両端の空白を除き、各改行とその後の空白を 1 つの改行として読み、
後の文が前の文を置き換え、閉じていない `accDescr {` のブロックは説明を空にし、
テキストのない閉じたブロックは何も変えません。
[fixture: sequence/db-title-spaces] [fixture: sequence/db-title-legacy]
[fixture: sequence/db-acc-descr-block-lines] [fixture:
sequence/db-acc-descr-block-unclosed] [fixture:
sequence/db-acc-descr-line-alone] [fixture:
sequence/db-acc-descr-block-after-message]

文はブロックの中も含めてソースの順に適用され、
3 つの値はどれも最後に設定されたものを保ちます。
タイトルは、木からは来ないフロントマターのタイトルから始まり
（[Db の正規化](#db-の正規化) を参照）、`title` の文がそれを置き換えます。
フロントマターに `title: From frontmatter` があるとき、
`title From statement` のタイトルは `From statement` です。
`title first` と `title second` は `second` を与え、
`accTitle:` と `accDescr:` も、同じ種類の前の文を同じように置き換えます。
`accDescr:` の行は前のブロックの説明も置き換え、
ループの後の `accDescr: outer` は、
ループの中の `accDescr: inner` を置き換えます。
タイトルとアクセシビリティのタイトルは別の値です。
`title first` と `accTitle: second` は、
タイトル `first` とアクセシビリティのタイトル `second` を与えます。
テキストのない閉じたブロックは、空白、改行、コメント行だけを持つものも、
何も変えません。
`accDescr: x` の後の `accDescr {}` と `accDescr { }` は `x` を保ちます。
[fixture: sequence/db-title-replaces-frontmatter] [fixture:
sequence/db-title-replaces] [fixture: sequence/db-acc-title-replaces] [fixture:
sequence/db-acc-descr-replaces] [fixture:
sequence/db-acc-descr-line-replaces-block] [fixture:
sequence/db-acc-descr-outer-replaces-loop] [fixture:
sequence/db-title-and-acc-title] [fixture:
sequence/db-acc-descr-empty-block-keeps] [fixture:
sequence/db-acc-descr-spaces-block-keeps] [fixture:
sequence/db-acc-descr-comment-block-keeps] [fixture:
sequence/db-acc-descr-empty-block-after-message] [fixture:
sequence/db-acc-descr-empty-block-spaces-after-message] [fixture:
sequence/db-acc-descr-empty-block-lines-after-message] [fixture:
sequence/db-acc-descr-block-comment-only-after-message]

### 矢印

メッセージの `type` は、その矢印の線と記号から決まる番号です
（[SequenceArrow](../ast/sequence.ja.md#sequencearrow) を参照）。

- 半分の記号がないとき: 線 `solid` では、記号なしは 5、
  終わりの記号 `arrow` は 0、`cross` は 3、`open-arrow` は 24、
  始まりと終わりの記号 `arrow` は 33 です。
  線 `dotted` では 1 大きく、6、1、4、25、34 です。
- 終わりの記号が `half-arrow-top`、`half-arrow-bottom`、`half-stick-top`、
  `half-stick-bottom` のとき: 線 `solid` では 41、42、43、44、
  `dotted` では 51、52、53、54 です。
- そのような始まりの記号のとき: 線 `solid` では 45、46、47、48、
  `dotted` では 55、56、57、58 です。

そのため、`->>` は 0、`<<-->>` は 34、`-//` は 44、`//--` は 57 です。
[fixture: sequence/db-arrow-types]

### 文法の外での拒否

mermaid.js は、文法が受理する入力の一部を、Db を作る間に拒否します。
どれも、ソースの順の文から決まります。

- **活性化していない参加者の非活性化。**
  `deactivate` か、矢印の後の `-` による参加者の型 18 の項目は、
  その参加者のそれまでの型 17 の項目が型 18 の項目より多くないとき、
  拒否されます。
  [fixture: sequence/gram-deactivate-inactive] [fixture:
  sequence/gram-deactivate-after-message]
- **すでにある参加者の create。**
  参加者がすでに持つ id の `create`。
  [fixture: sequence/gram-create-existing]
- **`create` や `destroy` の後のメッセージ。**
  下を参照。
  [fixture: sequence/gram-create-without-message] [fixture:
  sequence/gram-destroy-without-message]
- **2 つの箱に入る参加者。**
  ほかの箱をすでに持つ参加者についての、箱の中の参加者の文。
  [fixture: sequence/gram-box-participant-in-two-boxes]

`create` と `destroy` の後のメッセージのために、
文を適用する間、2 つの場所を保ちます。
どちらも空か、1 つの id を持ちます。
**作られるのを待つ参加者**と、**destroy されるのを待つ参加者**です
（[`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L581-L645) を参照）。
どちらも空から始まります。

- `create` の付いた文は、`create` の付いた destroy の文も含め、
  その id を作られるのを待つ参加者に置き、そこにあったものを置き換えます。
  `create` のない destroy の文は、
  その id を destroy されるのを待つ参加者に置き、
  そこにあったものを置き換えます。
  そのため、`create destroy C` では、C は destroy ではなく作られるのを待ちます。
- メッセージの文は、その項目を加える前に検査されます。
  作られるのを待つ参加者があれば、メッセージはそこへ向かわなければならず、
  作られるのを待つ参加者は空になります。
  このとき、destroy されるのを待つ参加者は見ません。
  そうでなく、destroy されるのを待つ参加者があれば、
  メッセージはそこからか、そこへのものでなければならず、
  destroy されるのを待つ参加者は空になります。
  検査に合わないメッセージは、入力を拒否させます。
- ほかの文は、どちらの場所も見ず、変えません。
  作られるのを待つ参加者の上のノートはそれを満たさず、
  `activate` や `autonumber` なども満たしません。
  文はソースの順に適用されるので、ブロックとその節は関係しません。
- テキストの終わりでは何も検査しません。
  参加者が作られるのや destroy されるのを待ったままでもかまいません。

そのため、`create participant C` と `create participant E` の後では、
E だけが作られるのを待ち、次のメッセージは E へ向かわなければなりません。
`create participant C` と `destroy D` の後では、次のメッセージは C へ向かい、
その次のメッセージは D からか D へのものでなければなりません。
`destroy D` と `destroy E` の後では、
次のメッセージは E に関わらなければなりません。
[fixture: sequence/gram-create-two-last-waits] [fixture:
sequence/gram-create-two-first-rejected] [fixture:
sequence/gram-create-then-destroy-message-to-other] [fixture:
sequence/gram-create-then-destroy-message-to-destroyed] [fixture:
sequence/gram-destroy-then-create] [fixture:
sequence/gram-destroy-then-create-message-to-other] [fixture:
sequence/gram-destroy-two-last-waits] [fixture:
sequence/gram-destroy-two-first-rejected] [fixture:
sequence/gram-create-message-from-created] [fixture:
sequence/gram-create-self-message] [fixture:
sequence/gram-destroy-message-from-destroyed] [fixture:
sequence/gram-create-wait-across-other-statements] [fixture:
sequence/gram-create-wait-note-not-message] [fixture:
sequence/gram-create-wait-into-block] [fixture:
sequence/gram-create-wait-out-of-block] [fixture:
sequence/gram-create-wait-across-else] [fixture: sequence/gram-create-last]
[fixture: sequence/gram-destroy-last] [fixture:
sequence/gram-create-destroy-waits-for-creation] [fixture:
sequence/gram-create-destroy-message-to-other]

### 箱の色

mermaid.js は、箱のテキストを色の候補と残りに分け、
候補が色かどうかをブラウザに問い合わせます
（[`parseBoxData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)
を参照）。
その答えはテキストから来ないので、箱の `name`、`fill`、`wrap` は、
設定の値と同じく、木の外から与えます。

答えが与えられると、それらは SequenceBoxText から求まります
（[SequenceBoxText](../ast/sequence.ja.md#sequenceboxtext) を参照）。
色の候補が色なら、`fill` は候補で、名前は残りから来ます。
そうでなければ、`fill` は `transparent` で、名前はテキスト全体から来ます。
名前の始まりの折り返しの接頭辞は、テキスト部分と同じく `wrap` を決め
（[テキスト部分](#テキスト部分) を参照）、名前はその残りです。
名前が空のときや、箱がテキストを持たないときは、箱は `name` を持ちません。
ブラウザの答えでは、次のようになります。

- `box green Group 1` は fill `green` と名前 `Group 1` を、
  `box Group 1` は fill `transparent` と名前 `Group 1` を持ちます。
  [fixture: sequence/spec-sequence-diagram-f1763a40] [fixture:
  sequence/spec-sequence-diagram-1705b6f7]
- `box aqua` は fill `aqua` を持ち、名前を持ちません。
  テキストのない箱は fill `transparent` を持ち、名前を持ちません。
  [fixture: sequence/spec-sequence-diagram-9f31df65] [fixture:
  sequence/db-box-no-text]
- `box rgb(34, 56, 0) Group1` は fill `rgb(34, 56, 0)` を、
  `box Purple Alice & John` は fill `Purple` と名前 `Alice & John` を持ちます。
  [fixture: sequence/spec-sequence-diagram-97d37793] [fixture:
  sequence/docs-syntax-sequence-diagram-93d3c0ff] [fixture:
  sequence/demo-sequence-ec7c4269]
- `box red-team` は fill `red` と名前 `-team` を持ちます。
  [fixture: sequence/db-box-colour-candidate-word-prefix]
- `box RGB(0, 0, 255) Team` の候補は語 `RGB` で、
  `rgb (0, 0, 255)` は色ではありません。
  どちらの箱も、fill `transparent` を持ち、テキスト全体を名前とします。
  [fixture: sequence/db-box-colour-function-upper-case] [fixture:
  sequence/db-box-colour-function-space]
- `box aqua wrap:Group` は fill `aqua` を、
  `box wrap:Group` は fill `transparent` を持ちます。
  どちらも名前 `Group` と `wrap` 真を持ちます。
  [fixture: sequence/db-box-wrap-after-colour] [fixture:
  sequence/db-box-wrap-without-colour]
- `#` はテキストを終えます。`box aqua G # c` の名前は `G` です。
  [fixture: sequence/lex-box-hash-comment]

### Db の中のデータブロック

参加者の `@{ ... }` のブロックが設定する `type` と説明は、
`@mmd-toolkit/tests` の `dataBlockEffects` から来ます。
データブロックを持つ参加者の文ごとに 1 項目です
（[`dataBlockEffects`](../../../tests/docs/embedded-data.ja.md#datablockeffects)
を参照）。
`as` の説明は、ブロックの説明より優先します。
`participant A@{ "alias": "Q" } as R` は説明 `R` を持ちます。
[fixture: sequence/db-data-block-alias-and-as]

## 既知の差

[known-divergences.ja.md](../known-divergences.ja.md) の差のうち、
次のものが sequence に当てはまり、次のように現れます。

- **[`directive-as-token-boundary`](../known-divergences.ja.md#directive-as-token-boundary)。**
  キーワード、矢印、数、句読点の中のディレクティブは、
  ここでは入力を拒否させます。
  mermaid.js はそれを受理します。
  `parti%%{init: {}}%%cipant A`、`A-%%{init: {}}%%>>B: x`、
  `autonumber 1%%{init: {}}%%0` がそうです
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  [fixture: sequence/div-directive-in-keyword] [fixture:
  sequence/div-directive-in-arrow] [fixture: sequence/div-directive-in-number]
- **[`embedded-data-opaque`](../known-divergences.ja.md#embedded-data-opaque)。**
  参加者のデータブロックの中身は読みません。
  mermaid.js はそれを YAML として読み、正しい YAML でない中身を拒否しますが、
  ここでは受理します。
  [fixture: sequence/spec-sequence-diagram-b8d593b1] [fixture:
  sequence/spec-sequence-diagram-335c8c00]
- **[`html-tag-in-frontmatter`](../known-divergences.ja.md#html-tag-in-frontmatter)。**
  フロントマターに `title: <a` があると、
  `A-xB: b="c">d` のメッセージは、
  mermaid.js では `b='c'>d`、ここでは `b="c">d` です。
  mermaid.js のタグは `"c"` の後の `>` まで届きます。
  `A->>B: b="c">d` のように `>` を持つ矢印が間にあると、
  mermaid.js ではその `>` がタグを終え、両方が `b="c">d` を与えます。
  [fixture: sequence/div-html-tag-starts-in-frontmatter-message] [fixture:
  sequence/lex-html-tag-frontmatter-arrow-ends-tag]
- **[`tokenless-empty-forms`](../known-divergences.ja.md#tokenless-empty-forms)。**
  文を始めない空の説明ブロックは、ここでは入力を拒否させます。
  mermaid.js はそれにトークンを読まず、入力を受理します。
  `A->>accDescr {}B: x` と `note left of accDescr {} A: x` がそうです。
  文が始まる位置の空の説明ブロックは、テキストのない説明のブロックの文で、
  何も変えません。
  [fixture: sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/gram-acc-descr-block-empty-then-statement]
- **[`comment-takes-character`](../known-divergences.ja.md#comment-takes-character)。**
  数の直後か、文の文脈の規則が一致を始める空白でない文字の直後の `%%` は、
  ここではコメントを始め、その文字を保ちます。
  mermaid.js はその文字をコメントの一部として読み、`%%` の前に数を読みません。
  行 `C%% c` は、mermaid.js が受理し、ここでは拒否されます。
  `A->>B:%% c` と `autonumber 10%% c` は、
  mermaid.js が拒否し、ここでは受理されます。
  `autonumber 5%% c` は、ここでは 5 から始まり、
  mermaid.js では始まりを持ちません
  （[文の文脈](#文の文脈) を参照）。
  [fixture: sequence/div-comment-after-one-character-id] [fixture:
  sequence/div-comment-after-text-colon] [fixture:
  sequence/div-comment-after-two-digit-number] [fixture:
  sequence/lex-percent-comment-takes-number]

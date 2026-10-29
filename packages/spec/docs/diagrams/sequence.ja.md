# Sequence

英語版: [sequence.md](./sequence.md)

mermaid.js での正解の出どころ:

- [`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison)
- [`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts)
- [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)
  のテスト

この文書は、図種 `sequence` を扱います。
木のノードは [ast/sequence.ja.md](../ast/sequence.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 15 がこの文法を選びます。
テキストが、空白の後に、
ちょうどこの大文字小文字で `sequenceDiagram` から始まるときです。
[fixture: common/detect-minimal-sequence] [fixture:
common/detect-case-sensitive-sequence]
[fixture: sequence/docs-config-accessibility-6016a981]

検出は検出点だけを見ます（[図種の検出](../common.ja.md#図種の検出) を参照）。
その後、文法はキーワード `sequenceDiagram` を、
1 つの語としてもう一度読みます（[文の文脈](#文の文脈) を参照）。
そのため、`sequenceDiagramX` は sequence と判定され、拒否されます。
最初の文は、キーワードと同じ行に続けてかまいません。
`sequenceDiagram A->>B: x` は、 A から B へのメッセージを持ちます。
[fixture: sequence/header-word-after-keyword] [fixture:
sequence/header-statement-same-line]

`%%` だけの行や、ディレクティブではない `%%{ }%%` は、
キーワードの前にあってかまいません。
これは `%%` だけの行で、検出はそれを読んで通り過ぎてヘッダーを探し、
どの図種でも同じく、`%%` から行の終わりまでの、
印 `%%` の図のコメントです（[図種の検出](../common.ja.md#図種の検出) を参照）。
mermaid.js の字句解析器もそう読みます（[文の文脈](#文の文脈) の規則 4）。
コメントはどのノードにも属さず、SequenceDiagram はキーワードから始まります。
`%%{ }%%;` の `;` はコメントの一部で、
ディレクティブの始まらない `%%{` で始まる行の残り（`%%{ }%% x` や
`%%{-x}%%`）も同じで、その行にキーワードがあっても同じです。
1 行の `%%{ }%% sequenceDiagram` にはヘッダーが残らず、入力は拒否されます。
キーワードの前のそれ以外のテキスト（`#` や `;` の行、
キーワードと同じ行の `%%`）は検出点の図のテキストで、どの検出器も一致せず、
mermaid.js と同じく入力は拒否されます。
[fixture: sequence/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
sequence/header-after-empty-braces-semicolon] [fixture:
sequence/header-after-empty-braces-line-text] [fixture:
sequence/header-after-non-word-brace-line] [fixture:
sequence/header-after-empty-braces-then-keyword-same-line] [fixture:
sequence/header-after-non-word-brace-then-keyword-same-line] [fixture:
sequence/header-after-two-bare-percent-lines] [fixture:
sequence/header-after-hash-line] [fixture:
sequence/header-after-semicolon-line] [fixture:
sequence/header-after-bare-percent-on-same-line]
flowchart では、同じ `%%` の行は、
mermaid.js と同じく拒否されます（[検出](./flowchart.ja.md#検出) を参照）。

## 字句構造

字句解析器は、
[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをその置き換え文字として読み、
コメント領域と行単位の規則が無視する `;` は、ないかのように読み進めます。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は、
図のテキストの一部です。
この節は、図自身の単位の規則を述べます。
[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 に当たります。

この図の mermaid.js の字句解析器は、大文字小文字を区別しません。
どの規則も、
文字を大文字小文字を区別せずに比べます（[表記](../common.ja.md#表記) を参照）。
そのため、`PARTICIPANT A` と `Note LEFT OF A: x` は、
`participant A` と `note left of A: x` として読まれます。
単位のテキストは書かれた大文字小文字を保ち、id は書かれたとおりに比べます。
`participant A` と `participant a` は、 2 つの参加者を挙げます。
[fixture: sequence/lex-keyword-upper-case] [fixture:
sequence/lex-keyword-mixed-case] [fixture: sequence/lex-id-case]

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれます。
各単位は、文法が使う名前と、 **テキスト**、
つまりそれが読んだ文字を変換した形で持ちます。
字句解析器は**文脈**のスタックを持ち、文の文脈から始めます。
規則は、文脈に入る（スタックの上に積む）か、
今の文脈を出る（その下の文脈に戻る）ことがあります。
各位置で、字句解析器は、今の文脈の規則のうち、
そこで当たる最初のものを適用します。
どれも当たらなければ、入力は拒否されます。
規則が読む空白は、その規則が作る単位に属し、
単位を作らない規則ならどの単位にも属しません。
規則が 2 つの単位を作るとき、その間の空白はどちらにも属しません。
テキストの終わりで、字句解析器は止まります。

単位のほかに、字句解析器は**図のコメント**を読みます。
行の終わりまで続き、mermaid.js が何もないものとして読むテキストです。
その行は、行の U+2028 か U+2029 の後のコメント行を越えて続き、
そのコメント領域が図のコメントを 2 つに切ります。
`A->>B: y #c`、U+2029、行 `%% d`、行 `C->>D: z` のメッセージは、
A から B への 1 つだけです。
[fixture: sequence/lex-hash-comment-across-comment-line]
[fixture: sequence/tokens-sequence-hash-comment-alone-u2028-94dfcd06]
これは [common.ja.md](../common.ja.md#コメント行) のコメント行ではありません。
コメント行は字句解析器が読む前に除かれますが、
図のコメントは行の途中からも始まります。
図のコメントの**印**は、`#` で始まるものは `#`、`%%` で始まるものは `%%`、
それ以外は `%` で、その値は印の後のテキストです。
`%% c` の値は、コメント行と同じく空白と `c` で、`% c` の値も同じです。
`%%% c` の値は `%`、空白、 `c` です。
[fixture: sequence/lex-percent-comment-after-unit] [fixture:
sequence/lex-single-percent-comment] [fixture:
sequence/lex-percent-comment-three-percent]
印は、字句解析器が読むディレクティブを除いたテキストの上で見つけます。
値は、コメント行と同じく、ディレクティブを含む、印の後のソースのテキストです。
`autonumber %%%{a}%%%` は、最初と最後の `%` を印 `%%` とし、
値が空のコメントを持ちます。
`autonumber %%%{a}%% c` では、ディレクティブを除いたテキストは `% c` なので、
印は最初の `%` で、値は `%%{a}%% c` です。
[fixture: sequence/lex-diagram-comment-directive-between-marks] [fixture:
sequence/lex-diagram-comment-directive-after-single-mark]

下の**キーワード**は、字句解析器が大文字小文字を区別せずに読み、
後に語の文字が続かないところでだけ読む語です（[表記](../common.ja.md#表記)
を参照）。
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
の規則が、単位に当てはまります。
テキストと文字列の単位の中のディレクティブは、入力の mermaid.js の読み方を保ち、
名前の単位を含む、ほかの単位の中のディレクティブは、入力を拒否させます。
名前の単位はありません。
**テキストの単位**は、
空白を含みうる名前である
[SequenceIdentifier](../ast/sequence.ja.md#sequenceidentifier) の単位、
つまり `id` の単位と、 `text`、`color-candidate`、`title-text`、
`description-text`、 `description-block-text`、`data-text` の単位と、
`invalid` の単位です。
文字列の単位はありません。

- `A->>B: x%%{init: {}}%%y` のメッセージは `xy`、
  `Al%%{init: {}}%%ice->>B: x` の参加者は `Alice`、
  `participant A%%{init: {}}%%B` の参加者は `AB` で、
  どれも mermaid.js と同じです。 [fixture: sequence/lex-directive-in-text]
  [fixture:
  sequence/lex-directive-in-id-run] [fixture:
  sequence/lex-directive-in-participant-id]
  [fixture: sequence/lex-directive-in-title-text]
  [fixture: sequence/lex-directive-in-acc-descr-text]
  [fixture: sequence/lex-directive-in-acc-descr-block-text]
  ディレクティブの隣の空白は、
  1 つの単位である id
  に残ります（[SequenceIdentifier](../ast/sequence.ja.md#sequenceidentifier)
  を参照）。
  `participant A%%{init: {}}%% c%%B` の参加者は `A c%%B`、
  `Al%%{init: {}}%% c%%ice->>B: x` の参加者は `Al c%%ice`、
  `participant A %%{init: {}}%% B` の参加者は `A`、空白 2 つ、 `B` です。
  [fixture: sequence/lex-directive-in-id-before-space] [fixture:
  sequence/lex-directive-in-id-run-before-space] [fixture:
  sequence/tokens-directive-participant-spaces]
  無視される `;` も同じで、`style` の規則に当たる行では、
  `participant B;C` の参加者は `BC`、
  `B;C->>E: m` は `BC` からのメッセージです。
  [fixture: sequence/tokens-ignored-semicolon-in-participant-id] [fixture:
  sequence/tokens-ignored-semicolon-in-message-id]
- `parti%%{init: {}}%%cipant A`、`A-%%{init: {}}%%>>B: x`、
  `autonumber 1%%{init: {}}%%0`、`A->>B: wr%%{init: {}}%%ap:x` では、
  ディレクティブがキーワード、矢印、数、`wrap-prefix` の単位の中にあり、
  入力は拒否されます。
  mermaid.js はそれを受理します（[既知の差異](#既知の差異) を参照）。
  [fixture: sequence/div-directive-in-keyword] [fixture:
  sequence/div-directive-in-arrow] [fixture: sequence/div-directive-in-number]
  [fixture: sequence/div-directive-in-wrap-prefix]

### 文の文脈

文の文脈では、字句解析器は次の規則を順に試します。

1. 1 個以上の改行: `newline` の単位。
   [fixture: sequence/lex-autonumber-line-break]
2. 1 個以上の空白で、最初の 1 個が改行でないもの: 何もしない。
   この並びは、空白の後に続く改行も取るので、
   空白の後の改行は `newline` の単位になりません。
   ほかの文脈と、行の終わりまで読む規則は、改行を残します。
   [fixture: sequence/lex-trailing-space-hides-line-break]
3. `#` と、改行の前までのその行の残り: 図のコメント。
   [fixture: sequence/lex-hash-comment-after-unit]
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
   `number` の単位。 [fixture: sequence/db-autonumber-start]
   [fixture: sequence/db-autonumber-fraction]
   [fixture: sequence/lex-number-before-space]
   [fixture: sequence/lex-number-three-decimals]
   [fixture: sequence/spec-sequence-diagram-0c1ce079]
6. キーワード `box`: `box` の単位。
   行の文脈に入ります。 [fixture: sequence/db-box-empty]
7. キーワード `participant` と `actor`: キーワードを名前とする単位。
   id の文脈に入ります。 [fixture: sequence/lex-alias-tabs]
   [fixture: sequence/demo-sequence-6c40b039]
8. キーワード `create`: `create` の単位。
   [fixture: sequence/db-create-participant-before-message]
9. キーワード `destroy`: `destroy` の単位。
   id の文脈に入ります。 [fixture: sequence/gram-destroy-last]
10. キーワード `loop`、`rect`、`opt`、`alt`、`else`、`par`、`par_over`、`and`、
    `critical`、`option`、`break`: キーワードを名前とする単位。
    行の文脈に入ります。 [fixture: sequence/gram-block-empty-text]
    [fixture: sequence/db-block-rect] [fixture: sequence/db-block-opt]
    [fixture: sequence/db-block-alt] [fixture: sequence/db-block-par]
    [fixture: sequence/db-block-par-over] [fixture: sequence/db-block-critical]
    [fixture: sequence/db-block-break]
11. キーワード `end`、`over`、`note`: キーワードを名前とする単位。
    キーワード `links`、`link`、`properties`、
    `details`（`links` を `link` より先に試す）で、
    その後に 1 個以上の空白かタブと、 `/`、`\`、`+`、`(`、`)`、`<`、`>`、`:`、
    `,`、`;`、`-`、空白、
    改行以外の文字が続くもの（それらは読まない）: キーワードを名前とする単位。
    それ以外の所では、この 4 つの語は id の並びを始めます（規則 21）。
    `link->>B: x` と `link ->>B: x` は参加者 `link` からのメッセージで、
    `link <<->>B: x` も同じです。
    `links->>B: x`、`properties->>B: x`、`details->>B: x` は、
    それぞれの名前の参加者からのメッセージです。
    `A->>link: x` と `A->>link : x` は `link` へのメッセージで、
    `note over link, A: x` は `link` と A の上のノートで、
    `note over link : x` は `link` の上のノートです。
    `link`、タブ、`A: x` と、`link`、空白 2 個、`A: x` と、
    `link%%{init: {}}%% A: x` はリンクの文で、
    `link %%{init: {}}%%->>B: x` ではこの語は参加者 `link` です。
    `link`、U+2028、`A: x` は、id の並びの後にテキストが続くもので、
    拒否されます。
    行 `link %% c` も拒否されます。
    `link` の後に空白と `%` が続くのでキーワードで、
    その後に id が続かないからです。
    [fixture: sequence/lex-link-word-before-arrow]
    [fixture: sequence/lex-link-word-space-before-arrow]
    [fixture: sequence/lex-link-word-space-before-reverse-arrow]
    [fixture: sequence/lex-links-word-before-arrow]
    [fixture: sequence/lex-properties-word-before-arrow]
    [fixture: sequence/lex-details-word-before-arrow]
    [fixture: sequence/lex-link-word-message-target]
    [fixture: sequence/lex-link-word-note-over-comma]
    [fixture: sequence/lex-link-word-message-target-space-colon]
    [fixture: sequence/lex-link-word-note-over-space-colon]
    [fixture: sequence/lex-link-keyword-tab]
    [fixture: sequence/lex-link-keyword-two-spaces]
    [fixture: sequence/lex-link-keyword-directive]
    [fixture: sequence/lex-link-word-space-directive-before-arrow]
    [fixture: sequence/lex-link-word-line-separator]
    [fixture: sequence/lex-link-keyword-before-comment]
    2 語の間が空白 1 個のキーワード `left of` か `right of`: `left` か `right`
    の単位と、`of` の単位。
    語の間が空白 2 個かタブなら、入力は拒否されます。
    空白は図のテキストで数え、
    その隣のディレクティブや無視される `;` は 2 つの単位の間にあります。
    `Note left%%{init: {}}%% of A: t`、`Note left %%{init: {}}%%of A: t`、
    `Note right%%{init: {}}%% of A: t` はノートで、
    `style` の規則に当たる行の `Note left; of A: t` もそうです。
    `Note left %%{init: {}}%% of A: t` は空白が 2 個なので拒否されます。
    どれも mermaid.js と同じです。
    [fixture: sequence/lex-note-position-two-spaces] [fixture:
    sequence/lex-note-position-tab] [fixture:
    sequence/lex-directive-between-left-and-of] [fixture:
    sequence/lex-directive-between-space-and-of] [fixture:
    sequence/lex-directive-between-right-and-of] [fixture:
    sequence/tokens-ignored-semicolon-between-left-and-of] [fixture:
    sequence/tokens-ignored-semicolon-between-space-and-of] [fixture:
    sequence/lex-note-position-directive-between-spaces]
    [fixture: sequence/gram-statement-after-end]
    [fixture: sequence/db-links-empty] [fixture: sequence/db-link-without-at]
    [fixture: sequence/db-properties-empty] [fixture: sequence/db-details-empty]
    [fixture: sequence/db-note-over-two]
    [fixture: sequence/lex-keyword-mixed-case]
12. キーワード `activate` と `deactivate`: キーワードを名前とする単位。
    id の文脈に入ります。 [fixture: sequence/lex-activate-id-space]
    [fixture: sequence/db-deactivate-after-plus]
13. `title`、改行でもよい 1 個の空白、`#`、`;`、
    改行以外の 1 個以上の文字: 語と空白の `title` の単位と、
    残りの `title-text` の単位。 [fixture: sequence/lex-title-line-break]
    [fixture: sequence/lex-title-rest-of-line]
14. `title:`、1 個の空白、`#`、`;`、改行以外の 1 個以上の文字: 同じように、
    `title:` の単位と `title-text` の単位。 [fixture: sequence/db-title-legacy]
15. `accTitle`、0 個以上の空白、`:`、
    0 個以上の空白: `accTitle` の単位と `:` の単位。
    タイトルの文脈に入ります。 [fixture: sequence/lex-acc-title-line-feed]
    [fixture: sequence/lex-acc-title-directive-before-colon]
    [fixture: sequence/lex-acc-title-no-whitespace]
    [fixture: sequence/lex-acc-title-line-feed-before-colon]
16. `accDescr`、0 個以上の空白、`:`、
    0 個以上の空白: `accDescr` の単位と `:` の単位。
    説明の文脈に入ります。 [fixture: sequence/db-acc-descr-empty-replaces]
    [fixture: sequence/lex-acc-descr-no-whitespace]
    [fixture: sequence/lex-acc-descr-space-before-colon]
    [fixture: sequence/lex-acc-descr-line-feed-before-colon]
17. `accDescr`、0 個以上の空白、`{`、
    0 個以上の空白: `accDescr` の単位と `{` の単位。
    説明のブロックの文脈に入ります。
    [fixture: sequence/db-acc-descr-empty-block-after-message]
    [fixture: sequence/lex-acc-descr-block-no-whitespace]
    [fixture: sequence/lex-acc-descr-block-line-feed-before-brace]
18. キーワード `sequenceDiagram`、`autonumber`、
    `off`: キーワードを名前とする単位。
    [fixture: sequence/header-statement-same-line]
    [fixture: sequence/lex-autonumber-line-break]
    [fixture: sequence/db-autonumber-off]
19. `,`: `,` の単位。 [fixture: sequence/db-note-over-two]
20. `;`: `newline` の単位。 [fixture: sequence/spec-sequence-diagram-543d2299]
21. **id の並び**: [id の並び](#id-の並び) で述べる文字の並び。
    `id` の単位で、そのテキストは並びから両端の空白を除いたものです。
    [fixture: sequence/lex-id-run-space]
22. 矢印。
    次のうち最初に当たるもの: `->>`、`<<->>`、`-->>`、`<<-->>`、 `->`、`-->`、
    `-x`、`--x`、`-)`、`--)`、`--|\`、`--|/`、`--\\`、`--//`、 `/|--`、`\|--`、
    `//--`、`\\--`、`-|\`、`-|/`、`-\\`、`-//`、`/|-`、`\|-`、 `//-`、`\\-`。
    `arrow` の単位。 [fixture: sequence/db-arrow-types]
23. `:` と、`#`、`;`、改行の前までのその行の残り: `:` の単位と、その後の残りを、
    テキスト部分として読んだもの。 [fixture: sequence/lex-empty-text]
    [fixture: sequence/lex-hash-ends-text]
    [fixture: sequence/spec-sequence-diagram-543d2299]
    [テキスト部分](#テキスト部分) を参照してください。
24. `+`、`-`、 `()`: そのテキストを名前とする単位。
    [fixture: sequence/db-message-activate-target]
    [fixture: sequence/db-message-central-connection-both]
25. ほかの 1 文字: `invalid` の単位。
    [fixture: sequence/lex-invalid-line-parenthesis]

テキストの終わりで、字句解析器は、文の文脈にいれば `newline` の単位を読み、
ほかの文脈では何も読みません。
テキストの終わりの `accDescr {` や `accDescr { x` のように、
テキストが終える説明ブロックの後には `newline` の単位がなく、その文は、
テキストとともに終わります（産出規則 `accessibility-statement` を参照）。
[fixture: sequence/lex-acc-descr-block-unclosed-empty]
[fixture: sequence/db-acc-descr-block-unclosed]
[fixture: sequence/demo-sequence-6c40b039]
[fixture: sequence/spec-sequence-diagram-f9fe3428]
[fixture: sequence/lex-acc-title-at-end]
[fixture: sequence/db-acc-descr-empty-replaces]
[fixture: sequence/lex-alias-at-end] [fixture: sequence/lex-data-block-at-end]

順序から生じることの例:

- `#` と `%` が図のコメントを始めるのは、単位が始まる位置だけです。
  id の並びの中では、`#` はその並びの文字です。
  `participant A # c` は id `A # c` を持ち、
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
  mermaid.js はこれらの入力を別に読みます（[既知の差異](#既知の差異) を参照）。
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
  次の行の字下げはタイトルの一部です。
  `title`、改行、空白 2 個、`A->>B: x` のタイトルは、
  空白 2 個と `A->>B: x` です。
  `#` か `;` はタイトルを終えます。
  `title a;;` のタイトルは `a` で、
  その後のそれぞれの `;` は `newline` の単位です。
  [fixture: sequence/lex-title-line-break] [fixture:
  sequence/lex-title-rest-of-line] [fixture:
  sequence/db-title-next-line-indented] [fixture:
  sequence/gram-title-then-separators]
- id の並びは、[id の並び](#id-の並び) のとおりに終わります。
  id の並びも規則 22 から 24 の単位も始まらない文字は `invalid` の単位で、
  `invalid` の単位の行は受理されます（[文法](#文法) を参照）。
  `)`、`/`、`\`、`<`、 `>` だけの行は受理されます。
  [fixture: sequence/lex-invalid-line-parenthesis] [fixture:
  sequence/lex-invalid-line-slash] [fixture:
  sequence/lex-invalid-line-two-units]

### id の並び

id の並びは、左から右へ、2 つの手順で読みます。

1. `/`、`\`、`+`、`(`、`)`、`<`、`-`、`>`、`:`、`,`、`;`、改行以外の文字を、
   できるだけ多く（1 個以上）。
   その後に、 [fixture: sequence/lex-id-run-space]
2. 続きを、並びの終わりで始められる限り、次々に。
   続きは、0 個以上の `-` の後に、 `+`、`<`、`-`、`>`、`:`、`,`、`;`、
   改行以外の文字をできるだけ多く（1 個以上）読んだものです。
   続きは、次のどれかが続く位置からは始まりません: `-x`、`-)`、`-\`、`-/`、
   `-|\`、`-|/`、`--`、`/|-`、`\|-`、`//-`、 `\\-`、 `()`。
   最初の 11 個は矢印の始まりです。 [fixture: sequence/lex-id-run-dash]
   [fixture: sequence/db-arrow-types]

どちらの手順も、前の手順に文字を返しません。
`Alice()->>John: x` では、手順 1 が `Alice` を読み、
`()` の前では続きが始まらないので、並びは `Alice` で、その後に `()` が続きます。
`Alic` と続き `e()` の方が長い並びになりますが、そうは読みません。
`Al()ice->>B: x` は拒否されます。
`()` の例外は、続きが始まる位置でだけ見ます。
`A(x)()->>B: x` では、続き `(x)()` が `()` を含み、参加者は `A(x)()` です。
[fixture: sequence/lex-id-run-empty-parentheses-ends-run] [fixture:
sequence/lex-id-run-empty-parentheses-inside-rejected] [fixture:
sequence/lex-id-run-empty-parentheses-in-continuation]

そのため、id の並びは、空白、`#`、`=` を含められ、最初の文字の後なら `/`、`\`、
`(`、`)` も含められます。
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

id の文脈には、 `participant`、`actor`、`destroy`、`activate`、
`deactivate` で入ります。
1 つの id を読みます。

1. 改行以外の空白: 何もしない。 [fixture: sequence/lex-id-context-space]
2. `#` とその行の残り: 図のコメント。
   [fixture: sequence/lex-id-context-hash-comment]
3. `@{`: `@{` の単位。
   データの文脈に入ります。 [fixture: sequence/gram-data-block-line-break-only]
4. `<`、`>`、`:`、`,`、`;`、`@`、空白、改行以外の 1 個以上の文字で、
   その後に 0 個以上の空白（改行を含む）と `@{` が続くもの（それらは読まない）:
   `id` の単位。 [fixture: sequence/db-data-block-create-participant]
   [fixture: sequence/lex-id-before-data-dash]
   [fixture: sequence/lex-id-space-before-data]
5. `<`、`>`、`:`、`,`、`;`、`@`、空白、改行以外の 1 個以上の文字で、
   その後に空白、キーワード `as`、
   1 個の空白が続くもの（それらは読まない）: `id` の単位。
   別名の文脈に入ります。 [fixture: sequence/lex-alias-upper-case]
   [fixture: sequence/lex-id-context-line-separator-before-as]
6. `<`、`>`、`:`、`,`、`;`、`@`、改行以外の 1 個以上の文字の並びのうち、
   その後に 0 個以上の空白と、改行、`;`、
   `#` のどれかが続く最長のもの（それらは読まない）: `id` の単位で、
   そのテキストは並びから両端の空白を除いたもの。
   id の文脈を出ます。 [fixture: sequence/lex-id-context-space]
   [fixture: sequence/lex-id-context-line-separator-in-id]
7. `<`、`>`、`:`、`,`、`;`、`@`、改行以外の 0 個以上の文字、`<`、
   その行の残り: `invalid` の単位。
   id の文脈を出ます。 [fixture: sequence/lex-id-context-hash-before-invalid]
8. 改行以外の 1 個以上の文字: `invalid` の単位。
   id の文脈を出ます。 [fixture: sequence/lex-id-context-colon]

規則 6 の並びは `#` を含められ、行が許す最長のものです。
`participant A # c` は id `A # c` を持ちます。
並び全体の後に改行が続くからです。
`participant A # c <x` では、`c` までの並びの後には `<` が続くので、
並びは `A` で、`# c <x` は文の文脈の図のコメントです。
`participant A # b # c <x` は id `A # b` を持ちます。
[fixture: sequence/lex-hash-inside-id] [fixture:
sequence/lex-id-context-hash-before-invalid] [fixture:
sequence/lex-id-context-two-hashes-before-invalid]

そのため、`participant` の後の id は、空白、`#`、`=` を含められ、行の終わり、
`;`、`as` の前で終わります。
`participant A B` は id `A B` を、`participant A=B` は id `A=B` を、
`activate A B` は id `A B` を持ちます。
`@{` の前の id は空白を含められず、id と `@{` の間には空白を置けます。
`participant A-B@{ "type": "queue" }` は id `A-B` を、
`participant A=B@{ "type": "queue" }` は id `A=B` を持ちます。
`participant A` の後に、空白、タブ、U+2028、またはディレクティブと空白が続き、
その後に `@{ "type": "queue" }` が続くものは、 id `A` を持ちます。
一方、`participant A B@{ "type": "queue" }` は拒否され、
`@{` の前の改行も拒否されます。
id の文脈には改行を読む規則がないからです。
[fixture: sequence/lex-id-equals-before-data]
[fixture: sequence/lex-id-space-before-data]
[fixture: sequence/lex-id-tab-before-data]
[fixture: sequence/lex-id-line-separator-before-data]
[fixture: sequence/lex-id-space-directive-before-data]
[fixture: sequence/lex-id-two-words-before-data]
[fixture: sequence/lex-id-line-feed-before-data]
`:` や `<` を含む id は拒否され、行の終わりの `participant` も拒否されます。
改行を読む規則がないからです。 [fixture: sequence/lex-id-context-space]
[fixture:
sequence/lex-id-context-equals] [fixture: sequence/lex-activate-id-space]
[fixture: sequence/lex-id-before-data-dash] [fixture:
sequence/lex-id-context-colon] [fixture: sequence/lex-id-context-line-break]

### 別名の文脈

別名の文脈には、`as` が続く id の後と、`as` が続くデータブロックの後で入ります。

1. 改行以外の空白: 何もしない。 [fixture: sequence/lex-alias-tabs]
   [fixture: sequence/lex-alias-line-separator-after-as]
2. キーワード `as`: `as` の単位。
   別名の文脈と id の文脈を出て、行の文脈に入ります。
   [fixture: sequence/lex-alias-upper-case]
3. 改行のところで、何も読まない: 文字を読まない `newline` の単位。
   別名の文脈と id の文脈を出ます。
   [fixture: sequence/lex-alias-lookahead-line-break-participant]

このキーワードは大文字小文字を区別せず、
その前後の空白は改行以外のどの空白でもかまいません。
`participant A AS B` とタブを使った同じものは、 A に説明 `B` を与えます。
[fixture: sequence/lex-alias-upper-case] [fixture: sequence/lex-alias-tabs]

規則 3 は、id かデータブロックと `as` の間に改行があるときに当たります。
id の文脈の規則 5 とデータの文脈の規則 2 が、
`as` の前に探す空白は改行を含むので、 `participant A`、改行、`as ->> B: x` は、
`A` の後で別名の文脈に入ります。
別名の文脈は改行の前に `as` を読まず、文字のない `newline` の単位で、
そこで文を終えます。
その後の改行は文の文脈の `newline` の単位で、次の行は、
前の行がないときと同じく読まれる 1 つの文で、 `as` から B へのメッセージです。
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

1. 改行以外の空白。
   ただし色の候補の直後を除く: 何もしない。
   [fixture: sequence/spec-sequence-diagram-01f0c47f]
2. `#` とその行の残り: 図のコメント。
   [fixture: sequence/spec-sequence-diagram-01f0c47f]
3. `box` の後の最初の単位としてだけ、**色の候補**。
   小文字の `rgb`、`rgba`、`hsl`、`hsla` のどれかに、0 個以上の空白、`(`、
   次の `#`、`;`、改行より前の最後の `)` までの文字が続くもの。
   そうでなければ、1 個以上の語の文字（ASCII の英字、数字、`_`）。
   `color-candidate` の単位。 [fixture: sequence/db-box-colour-without-space]
   [fixture: sequence/db-box-colour-rgba] [fixture: sequence/db-box-colour-hsl]
   [fixture: sequence/db-box-colour-hsla]
4. `#`、`;`、改行以外の 0 個以上の文字: `box` の後では、
   すべて U+2028 と U+2029 のほかの空白でなければ `text` の単位。
   それ以外では、
   テキスト部分として読みます（[テキスト部分](#テキスト部分) を参照）。
   行の文脈を出ます。 [fixture: sequence/db-box-no-colour-candidate]

そのため、`loop x # c` のテキストは `x` と空白で、
`alt;B->>A: y` は空のテキストの `alt` のブロックと、それに続くメッセージです。
[fixture: sequence/spec-sequence-diagram-01f0c47f] [fixture:
sequence/spec-sequence-diagram-453b7670]
色の候補の後では、規則 4 が、候補の終わりから、空白を含めて行の残りを読みます。
mermaid.js は、`box` の後の空白を飛ばした後、
その後のテキスト全体を 1 つの単位として読むからです。
`box aqua`、空白 2 個、U+2028 は、候補 `aqua` と、
空白 2 個と U+2028 のテキストを持ち、空白 2 個が続く `box red-team` は、
テキスト `-team` と空白 2 個を持ちます。
[fixture: sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces]

### データの文脈

データの文脈には、id の後の `@{` で入ります。

1. `}` 以外の 1 個以上の文字: `data-text` の単位。
   [fixture: sequence/db-data-block-create-participant]
2. 後に空白、キーワード `as`、
   1 個の空白が続く `}`（それらは読まない）: `}` の単位。
   データの文脈を出て、別名の文脈に入ります。
   [fixture: sequence/db-data-block-alias-and-as]
3. `}`: `}` の単位。
   データの文脈と id の文脈を出ます。
   [fixture: sequence/db-data-block-create-participant]

そのため、データブロックは最初の `}` で終わり、その中身は `}` を含められません。
[fixture: sequence/docs-syntax-sequence-diagram-1371ae9a] [fixture:
sequence/lex-data-block-nested-brace]

### アクセシビリティの値

タイトルの文脈と説明の文脈では、
改行以外の 1 個以上の文字が `title-text` か `description-text` の単位で、
文脈を出ます。
そのため、これらは `#` と `;` を含めて行の残りを読みます。
説明のブロックの文脈では、`}` は `}` の単位で文脈を出て、
他の 1 個以上の文字は `description-block-text` の単位です。
[fixture: sequence/lex-acc-title-line-feed] [fixture:
sequence/lex-acc-title-hash]
[fixture: sequence/tokens-acc-descr-ignored-semicolon]
[fixture: sequence/tokens-acc-descr-block-ignored-semicolon]

### テキスト部分

**テキスト部分**は、`:` の後か、 `box` 以外の行の文脈に入るキーワードの後の、
行の残りです。
その始まりの空白は、どの単位にも属しません。
その後が**折り返しの接頭辞**で始まるとき、
その接頭辞は `wrap-prefix` の単位です。
それはテキストではないので、その中のディレクティブは入力を拒否させます。
一方、mermaid.js は `A->>B: wr%%{init: {}}%%ap:x` を受理し、
メッセージ `x` を折り返します。 [fixture: sequence/div-directive-in-wrap-prefix]
[単位の中のディレクティブ](#単位の中のディレクティブ) を参照してください。
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
`A->>B:` は空のメッセージを持ちます。 [fixture: sequence/lex-wrap-prefix]
[fixture:
sequence/lex-nowrap-prefix-colon] [fixture:
sequence/lex-wrap-prefix-upper-case]
[fixture: sequence/config-wrap-site-nowrap-prefix]
[fixture: sequence/db-block-loop-wrap] [fixture: sequence/lex-empty-text]
[fixture: sequence/lex-wrap-prefix-colon]
[fixture: sequence/lex-text-part-whitespace-only]
[fixture: sequence/lex-block-text-whitespace-only]

`box` の後では、行の残りは、形だけで、色の候補と `text` の単位に分けられます。
どちらもないことがあります。
mermaid.js も、候補が色かを問い合わせる前に、同じように分けます。
`box aqua Group` は候補 `aqua` とテキスト `Group`、
`box rgb(1,2,3)x` は候補 `rgb(1,2,3)` とテキスト `x`、
`box rgb(1, 2, 3) a) b` は候補 `rgb(1, 2, 3) a)` とテキスト `b`、
`box rgb( a` は候補 `rgb` とテキスト `( a` を持ち、 `box -x` は候補を持たず、
テキスト `-x` を持ちます。
分け方は答えに依らないので、どちらも単位です。
候補が色かどうかは答えに依り、折り返しの接頭辞の位置も依ります。
候補が色でなければ、接頭辞は候補と残りを合わせたテキストから読むからです。
そのため、 `box` の後に `wrap-prefix` の単位はありません。
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
[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L136-L422)
の文法を述べ直したもので、同じ入力を受理します。
jison の文法は、id を取る所で `link` の単位も取ります。
字句解析器は、文を完成させる所でその単位を作りません。
規則 11 は、空白かタブと、id の後に来うる単位が始まらない文字が続くときだけ、
`link` を単位として読むからです。
そのため、下の文法はそれを含めません。
`A->>link B: x` では `link` は `link` の単位で、
テキストが始まるべき所に `B` があるので、入力は拒否されます。
[fixture: sequence/gram-link-keyword-message-target]

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
| `"activate" id statement-end`、`"deactivate" id statement-end`                    | SequenceActivateStatement、SequenceDeactivateStatement                                                                                   |
| `note-statement`                                                                  | SequenceNoteStatement                                                                                                                    |
| `"links"`、`"link"`、`"properties"`、`"details"` の文                             | SequenceLinksStatement、SequenceLinkStatement、SequencePropertiesStatement、SequenceDetailsStatement                                     |
| `title-statement`                                                                 | SequenceTitleStatement                                                                                                                   |
| `accessibility-statement`                                                         | SequenceAccTitleStatement、SequenceAccDescrStatement、SequenceAccDescrBlockStatement のどれか                                            |
| `empty-description-block`                                                         | テキストのない SequenceAccDescrBlockStatement。箱の文、またはその前の文の後の文                                                          |
| `loop`、`rect`、`opt`、`break` の `block-statement`                               | SequenceLoopStatement、SequenceRectStatement、SequenceOptStatement、SequenceBreakStatement                                               |
| `alt`、`par`、`par_over`、`critical` の `block-statement`                         | SequenceAltStatement、SequenceParStatement、SequenceParOverStatement、SequenceCriticalStatement。各 `text-part line*` に SequenceSection |
| `text-part`                                                                       | SequenceText。どちらの単位もなければ何も作らない                                                                                         |
| `id`                                                                              | SequenceIdentifier                                                                                                                       |
| `number`                                                                          | NumericLiteral                                                                                                                           |
| テキスト部分の `text`、`title-text`、`description-text`、`description-block-text` | SequenceLiteral                                                                                                                          |
| 行としての `invalid`                                                              | SequenceIgnoredStatement                                                                                                                 |

### 図と文

```text
diagram             = newline* "sequenceDiagram" line*
line                = statement | newline | invalid
statement           = participant-statement
                    | "create" participant-statement
                    | box-statement
                    | message-statement statement-end
                    | autonumber-statement statement-end
                    | ( "activate" | "deactivate" ) id statement-end
                    | note-statement statement-end
                    | ( "links" | "link" | "properties" | "details" ) id ":" text-part statement-end
                    | title-statement
                    | accessibility-statement
                    | block-statement
```

`newline` で終わる文の後には、改行、`;`、
テキストの終わりのどれかが続かなければなりません。
ほかの文は区切りを要りません。
箱とブロックは `end` で終わり、
タイトルとアクセシビリティの文は行の終わりまで続くので、
`end` の後の同じ行に別の文を続けられます。
`loop x`、メッセージ、`end A->>B: z` は、ループの後にメッセージを持ちます。
[fixture: sequence/gram-statement-after-end]
[fixture: sequence/spec-sequence-diagram-543d2299]
[fixture: sequence/spec-sequence-diagram-8e03af61]
`invalid` の単位の行は受理されて、木では SequenceIgnoredStatement になります。
`end` の後の同じ行でも同じです。
[fixture: sequence/lex-invalid-line-parenthesis] [fixture:
sequence/gram-invalid-after-end]
テキストが続くつもりだったメッセージの後の `)` の行も、そのような行です。
`A->>B: call(x`、改行、 `)` のメッセージは `call(x` です。
[fixture: sequence/db-ignored-line-after-wrapped-message] [fixture:
sequence/db-wrapped-message-closed]

### 区切りの前の空の説明ブロック

```text
statement-end           = empty-description-block* newline
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位に、
`description-block-text` の単位なしで `}` の単位がすぐ続くものです。
区切りが要る文は `statement-end` で終わります。
文の最後の単位の後、区切りの前には、空の説明ブロックがいくつ来てもかまいません。
それぞれ、その文の後に続く、テキストのない説明ブロックの文です。
mermaid.js は空の説明ブロックにトークンを読まないので（詳しくは
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）、その文の後にすぐ区切りが続くものとして読みます。
テキストのある説明ブロックと、ほかの文は、区切りの前に置けません。

sequence で `newline` の単位が要る文は、参加者、destroy、メッセージ、
`autonumber`、 activate と deactivate、ノート、links、link、properties、
details の文です。
ブロックがそのような文の最後の単位と `newline` の間に置けるのは、
その単位がブロックと一緒に読まれないところだけです。
テキスト、id、`as` の後の説明では、
字句解析器は `accDescr {}` をそのテキストや id の一部として読みます。
そのため、ブロックが置けるのは、参加者か actor のデータブロックの後と、
`autonumber` の後です。
`participant A@{ "type": "actor" } accDescr {}`、空白なしの同じもの、
`autonumber accDescr {}` は受理されます。
[fixture: sequence/gram-empty-description-block-after-participant-data]
[fixture: sequence/gram-empty-description-block-after-actor-data-glued]
[fixture: sequence/gram-empty-description-block-after-autonumber]
[fixture: sequence/gram-empty-description-block-in-message-text]
[fixture: sequence/gram-empty-description-block-in-participant-id]
[fixture: sequence/gram-empty-description-block-in-alias-text]
ブロックの前の空白は単独で読まれるので、
ブロックの後の改行が文の `newline` の単位です。
`autonumber`、空白 2 つ、`accDescr {}`、改行は受理されますが、 `autonumber`、
空白 2 つ、改行は、
空白が改行を隠すので拒否されます（[文の文脈](#文の文脈) を参照）。
[fixture: sequence/gram-empty-description-block-after-autonumber-spaces]
[fixture: sequence/lex-trailing-space-hides-line-break]
同じ行でブロックの後にほかの文が続くと、mermaid.js と同じく拒否されます。
`autonumber accDescr {} A->>B: x` です。
[fixture: sequence/gram-empty-description-block-after-autonumber-then-message]

キーワード `sequenceDiagram` のすぐ後、
その行で文が始まってもよいので（[検出](#検出) を参照）、
そこにある空の説明ブロックに固有の規則は要りません。
それは文が始まるところにあり、図の最初の文です。
`sequenceDiagram accDescr {}`、改行、`A->>B: x` は、
mermaid.js と同じく受理されます。
[fixture: sequence/header-empty-description-block]

### 参加者と箱

```text
participant-statement = ( "participant" | "actor" ) id data-block? ( "as" text-part )? statement-end
                      | "destroy" id statement-end
data-block            = "@{" data-text "}"
box-statement         = "box" box-text? ( participant-statement | empty-description-block | newline )* "end"
box-text              = color-candidate text? | text
```

データブロックは埋め込みデータで、その中身は書かれたとおりに保たれ、
読まれません。
データブロックは中身を要します。
`participant A@{}` は mermaid.js と同じく拒否され、 `participant A@{ }` と、
波括弧の間に改行のあるものは受理されます。
[fixture: sequence/gram-data-block-empty]
[fixture: sequence/gram-data-block-line-break-only]
`create` は、`destroy` を含め、どの参加者の文の前にも置けます。
`create destroy A` は `create` の付いた destroy の文です。
[fixture: sequence/gram-create-destroy]
[fixture: sequence/spec-sequence-diagram-a7618b16]
[文法の外での拒否](#文法の外での拒否) を参照してください。
箱が持てるのは、参加者の文、空の説明ブロック、空の行だけで、
`create` もメッセージも置けません。
[fixture: sequence/gram-box-create-participant] [fixture:
sequence/gram-box-message-inside]
箱の中の空の説明ブロックは、ほかの文が始まる位置と同じく、
テキストのない説明のブロックの文です。
それだけの行にあっても、括弧の間が空白だけで何行かにわたっても、
同じ行に参加者の文や `end` が続いてもかまいません。
[fixture: sequence/gram-box-empty-description-block-line] [fixture:
sequence/gram-box-empty-description-block-lines] [fixture:
sequence/gram-box-empty-description-block-then-participant] [fixture:
sequence/gram-box-empty-description-block-before-end]
テキストのある説明のブロックと説明の文は箱の文ではなく、どちらも拒否します。
[fixture: sequence/gram-box-description-block-with-text] [fixture:
sequence/gram-box-description-line]

### メッセージ

```text
message-statement = id arrow ( "+" | "-" | "()" )? id ":" text-part
                  | id "()" arrow "()"? id ":" text-part
```

メッセージは、矢印の後に `+` か `-` を、矢印の後か前、
またはその両方に `()` を持てますが、 `+` と `-` は `()` と組み合わせられません。
メッセージはテキストを要りますが、それは `:` の後が空でもかまいません。
`A->>B` は拒否され、 `A->>B:` は受理されます。
[fixture: sequence/gram-message-without-text]
[fixture: sequence/db-message-central-connection-both]
[fixture: sequence/gram-message-activation-then-central-connection]
[fixture: sequence/gram-message-central-connection-then-activation] [fixture:
sequence/lex-empty-text]

### ほかの文

```text
autonumber-statement    = "autonumber" ( number number? | "off" )?
note-statement          = "note" ( "left" | "right" ) "of" id ":" text-part
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
どのキーワードもそれぞれの種類のブロックを始め、 `else`、`and`、`option` は、
`alt` のブロック、`par` か `par_over` のブロック、
`critical` のブロックの節を始めます。 [fixture: sequence/db-block-rect]
[fixture: sequence/gram-block-loop-else]
[fixture: sequence/gram-block-alt-option]
[fixture: sequence/gram-block-critical-and] [fixture: sequence/db-block-opt]
[fixture: sequence/db-block-break] [fixture: sequence/db-block-alt]
[fixture: sequence/db-block-par] [fixture: sequence/db-block-par-over]
[fixture: sequence/db-block-critical]

### 文法の外での拒否

mermaid.js は、文法が受理する入力の一部を、Db を作る間に拒否します。
どれも、ソースの順の文から決まります。

- **活性化していない参加者の非活性化。**
  参加者は、それについての `activate` の文と、
  矢印の後に `+` のあるメッセージ（その行き先について）で**活性化**し、
  それについての `deactivate` の文と、
  矢印の後に `-` のあるメッセージ（その出どころについて）で**非活性化**します。
  矢印の前か後の `()` は、どちらもしません。
  非活性化は、その前の、その参加者の活性化が非活性化より多くないとき、
  拒否されます。 [fixture: sequence/gram-deactivate-inactive]
  [fixture: sequence/gram-deactivate-after-message]
  [fixture: sequence/db-activation-plus-then-minus]
  [fixture: sequence/db-activation-twice-deactivation-twice]
  [fixture: sequence/gram-deactivate-after-activate-deactivate]
  [fixture: sequence/gram-deactivate-after-central-connection]
  [fixture: sequence/db-deactivate-after-plus]
  [fixture: sequence/db-minus-after-activate]
- **すでにある参加者の create。**
  それより前に**加えられた**参加者の id の `create`。
  参加者を加えるのは、参加者の文、`create` の付いた destroy の文、
  そしてメッセージ、ノート、`links`、`link`、`properties`、`details` の文で、
  それが挙げる各 id についてです。
  `activate`、`deactivate`、 `create` の付かない destroy の文は加えません。
  [fixture: sequence/gram-create-existing]
  [fixture: sequence/gram-create-after-message]
  [fixture: sequence/gram-create-after-note]
  [fixture: sequence/gram-create-after-links]
  [fixture: sequence/gram-create-after-link]
  [fixture: sequence/gram-create-after-properties]
  [fixture: sequence/gram-create-after-details]
  [fixture: sequence/gram-create-after-create-destroy]
  [fixture: sequence/gram-create-after-message-and-destroy]
  [fixture: sequence/db-create-after-activate]
  [fixture: sequence/db-create-after-destroy-only]
- **`create` や `destroy` の後のメッセージ。**
  下を参照。 [fixture: sequence/gram-create-without-message] [fixture:
  sequence/gram-destroy-without-message]
- **2 つの箱に入る参加者。**
  ほかの箱をすでに持つ参加者についての、箱の中の参加者の文。
  参加者は、箱を持たないときに箱の中の参加者の文が挙げると、
  **その箱を持ちます**。
  箱の外の参加者の文と、箱の中の destroy の文は、どの箱も変えません。
  [fixture: sequence/gram-box-participant-in-two-boxes]
  [fixture: sequence/gram-box-participant-added-by-message]
  [fixture: sequence/db-box-existing-participant-joins-box]
  [fixture: sequence/db-box-same-participant-twice]
  [fixture: sequence/db-box-participant-outside-after]
  [fixture: sequence/db-box-destroy-in-other-box]

`create` と `destroy` の後のメッセージのために、文を適用する間、
2 つの場所を保ちます。
どちらも空か、1 つの id を持ちます。
**作られるのを待つ参加者**と、**destroy されるのを待つ参加者**です。
[`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L581-L645)
を参照してください。
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
  そうでなく、destroy されるのを待つ参加者があれば、メッセージはそこからか、
  そこへのものでなければならず、 destroy されるのを待つ参加者は空になります。
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

## 既知の差異

[known-divergences.ja.md](../known-divergences.ja.md) の差異のうち、
次のものが sequence に当てはまり、次のように現れます。

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  テキストの単位のほかの単位、たとえばキーワード、区切り記号、矢印、
  数の中のディレクティブは、ここでは入力を拒否させます。
  mermaid.js はそれを受理します。
  `parti%%{init: {}}%%cipant A`、`A-%%{init: {}}%%>>B: x`、
  `autonumber 1%%{init: {}}%%0`、 `A->>B: wr%%{init: {}}%%ap:x` がそうです。
  [fixture: sequence/div-directive-in-keyword]
  [fixture: sequence/div-directive-in-arrow]
  [fixture: sequence/div-directive-in-number]
  [fixture: sequence/div-directive-in-wrap-prefix]
  [単位の中のディレクティブ](#単位の中のディレクティブ) を参照してください。
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  `participant Z@{ "style": "x:#y" };` の後のような、
  `style` の規則に当たる行で、数、キーワード、矢印の中の無視される `;` は、
  ここでは入力を拒否させ、mermaid.js はそれを受理します。
  `autonumber 1;0`、`autonumber 1 1;0`、`parti;cipant B`、
  `Note le;ft of A: t`、 `A-;>>B: m` がそうです。
  [fixture: sequence/div-ignored-semicolon-in-autonumber-start] [fixture:
  sequence/div-ignored-semicolon-in-autonumber-step] [fixture:
  sequence/div-ignored-semicolon-in-keyword] [fixture:
  sequence/div-ignored-semicolon-in-position-word] [fixture:
  sequence/div-ignored-semicolon-in-arrow]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.ja.md)。**
  参加者のデータブロックの中身は読みません。
  mermaid.js はそれを YAML として読み、正しい YAML でない中身を拒否しますが、
  ここでは受理します。 [fixture: sequence/spec-sequence-diagram-b8d593b1]
  [fixture:
  sequence/spec-sequence-diagram-335c8c00]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、 `A-xB: b="c">d` のメッセージは、
  mermaid.js では `b='c'>d`、ここでは `b="c">d` です。
  mermaid.js のタグは `"c"` の後の `>` まで届きます。
  `A->>B: b="c">d` のように `>` を持つ矢印が間にあると、
  mermaid.js ではその `>` がタグを終え、両方が `b="c">d` を与えます。
  [fixture: sequence/div-html-tag-starts-in-frontmatter-message] [fixture:
  sequence/lex-html-tag-frontmatter-arrow-ends-tag]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  文の始まりでも `newline` の前でもない、文の中の空の説明ブロックは、
  ここでは入力を拒否させます。
  mermaid.js はそれにトークンを読まず、入力を受理します。
  `A->>accDescr {}B: x` と `note left of accDescr {} A: x` がそうです。
  文が始まる位置の空の説明ブロックは、箱の中でも、
  テキストのない説明のブロックの文で、何も変えません。
  [fixture: sequence/gram-box-empty-description-block-line] [fixture:
  sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/gram-acc-descr-block-empty-then-statement]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.ja.md)。**
  空白でない文字の直後の `%%` は、
  ここでは [文の文脈](#文の文脈) のとおりに読みます。
  その前の文字は字句解析器がそこで読むものに残り、 `%%` は、
  数の後ではコメントを始め、 id の並びの文字の後と `:` の後では、
  id の並びかテキストの文字です。
  mermaid.js は、その前の文字をコメントの一部として読み、
  `%%` の前に数を読みません。
  行 `C%% c` は、mermaid.js が受理し、ここでは拒否されます。
  `A->>B:%% c` と `autonumber 10%% c` は、 mermaid.js が拒否し、
  ここでは受理されます。
  `autonumber 5%% c` は、ここでは 5 から始まり、
  mermaid.js では始まりを持ちません。
  [fixture: sequence/div-comment-after-one-character-id] [fixture:
  sequence/div-comment-after-text-colon] [fixture:
  sequence/div-comment-after-two-digit-number] [fixture:
  sequence/lex-percent-comment-takes-number]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかにある `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment`（参加者、メッセージのテキスト、ノートなど）は、
  mermaid.js ではテキストを C4 のパーサーに渡させ、拒否されます。
  ここではテキストは sequence 図です。 [fixture: common/detect-c4-anywhere]

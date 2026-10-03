# sequence のノード

英語版: [sequence.md](./sequence.md)

この文書は、図種 `sequence` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/sequence.ja.md](../diagrams/sequence.ja.md) で定めます。

この図種の本文は [SequenceDiagram](#sequencediagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める値の書かれたテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
mermaid.js が値の一部として読む空白は、
その書かれたテキストの一部です
（[ノード](../ast.ja.md#ノード) を参照）。
この図種では、タイトルの空白と、箱のテキストの U+2028 か U+2029 です
（[SequenceTitleStatement](#sequencetitlestatement) と
[SequenceBoxText](#sequenceboxtext) を参照）。
ほかの空白は、どの値にも入りません。

**参加者**は、図の生存線の 1 つで、id で名指されます。
mermaid.js はそれを actor と呼びます。
この文書では、actor という語を、
キーワード `actor` が宣言する参加者に取っておきます。

## ノード

### SequenceDiagram

| 欄     | 型                     | 意味             |
| ------ | ---------------------- | ---------------- |
| `body` | SequenceStatement の列 | 文。ソースの順。 |

子の欄: `body`。
キーワード `sequenceDiagram` は欄ではありません。

**SequenceStatement** は、SequenceParticipantStatement、
SequenceDestroyStatement、SequenceBoxStatement、SequenceMessageStatement、
SequenceAutonumberStatement、SequenceActivateStatement、
SequenceDeactivateStatement、SequenceNoteStatement、SequenceLinksStatement、
SequenceLinkStatement、SequencePropertiesStatement、SequenceDetailsStatement、
SequenceTitleStatement、SequenceAccTitleStatement、SequenceAccDescrStatement、
SequenceAccDescrBlockStatement、SequenceLoopStatement、SequenceRectStatement、
SequenceOptStatement、SequenceBreakStatement、SequenceAltStatement、
SequenceParStatement、SequenceParOverStatement、SequenceCriticalStatement、
SequenceIgnoredStatement のどれかです。

文を終える改行と `;` はどの文にも属さず、空の行はノードを作りません。
下のどのノードの子の欄もソースの順です（[ノード](../ast.ja.md#ノード) を参照）。

### SequenceParticipantStatement

`participant` か `actor` の文です。

| 欄        | 型                            | 意味                                                                    |
| --------- | ----------------------------- | ----------------------------------------------------------------------- |
| `kind`    | 文字列                        | `participant` か `actor`。キーワードを小文字にしたもの。                |
| `created` | 真偽値                        | キーワードの前に `create` があるかどうか。                              |
| `id`      | SequenceIdentifier            | id。                                                                    |
| `data`    | SequenceDataBlock または null | id の後のデータブロック。なければ null。                                |
| `alias`   | SequenceText または null      | `as` の後のテキスト。mermaid.js はそれを説明として読む。なければ null。 |

子の欄: `id`、`data`、`alias`。

### SequenceDestroyStatement

`destroy` の文です。

| 欄        | 型                 | 意味                                       |
| --------- | ------------------ | ------------------------------------------ |
| `created` | 真偽値             | キーワードの前に `create` があるかどうか。 |
| `id`      | SequenceIdentifier | `destroy` の後の id。                      |

子の欄: `id`。

### SequenceBoxStatement

| 欄     | 型                          | 意味                                                                                     |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| `text` | SequenceBoxText または null | `box` の後のテキスト。なければ null。                                                    |
| `body` | SequenceStatement の列      | `end` までの文。ソースの順。参加者の文、destroy の文、テキストのない説明のブロックの文。 |

子の欄: `text`、`body`。

### SequenceBoxText

`box` の後に書かれたテキストで、文法の `box-text` です。
mermaid.js はそこから色と名前を読みますが、どの部分が色かは、
mermaid.js がブラウザに問い合わせる問いの答えに依ります。
そのため、このノードは、テキストの全体と、
mermaid.js が問い合わせる前に分けるのと同じように字句解析器が分ける、
2 つの部分を持ちます。
最初の部分が色かどうかは述べません。

| 欄               | 型                          | 意味                                                                     |
| ---------------- | --------------------------- | ------------------------------------------------------------------------ |
| `value`          | 文字列                      | その書かれたテキスト。テキストの全体で、2 つの部分の間の空白を含む。     |
| `colorCandidate` | SequenceLiteral または null | `color-candidate` の単位。mermaid.js が問い合わせる部分。なければ null。 |
| `remainder`      | SequenceLiteral または null | 候補の後の `text` の単位。なければ null。                                |

子の欄: `colorCandidate`、`remainder`。
どちらの部分もそれぞれ 1 つの単位です
（[行の文脈](../diagrams/sequence.ja.md#行の文脈) を参照）。
mermaid.js は、テキストの分け方を変える U+2028 と U+2029 をすべて読み、
部分の両端のほかの空白を削ります。
そのため、箱のテキストでは、U+2028 と U+2029 は空白でない文字として数えます。
各 SequenceLiteral の書かれたテキストは、
その単位から両端のほかの空白を除いたもので、
箱のテキストは、最後の部分が終わる所で終わります。
2 つの部分の間の空白は、箱のテキストの値に入り、どちらの部分にも入りません。
[fixture: sequence/tokens-box-text-space-between-parts]
[fixture: sequence/tokens-box-text-directive-then-space-before-remainder]
U+2028 が続く `box red-team` の残りは、`-team` と U+2028 で、
U+2028 の前後に空白があれば、残りは `-team`、空白、U+2028 で、
その後の空白は外にあります。
`box aqua`、空白 2 個、U+2028 の残りは U+2028 だけで、空白だけの値です。
空白 2 個が続く `box red-team` の残りは `-team` です。
[fixture: sequence/db-box-line-separator-at-end] [fixture:
sequence/db-box-spaces-around-line-separator-at-end] [fixture:
sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces]
`box Gr%%{init: {}}%%oup` では、候補は `Group` です。
`box red%%{init: {}}%%-team` では、`box red-team` と同じく、
候補は `red` で、残りは `-team` です。
[fixture: sequence/tokens-box-text-directive-between-parts-without-space]
[fixture: sequence/tokens-box-text-directive-in-candidate]
[fixture: sequence/tokens-box-text-directive-in-remainder]
`box Purple Alice & John` では、候補は `Purple` で、残りは `Alice & John` です。
`box rgb(34, 56, 0) Group1` では、
候補は `rgb(34, 56, 0)` で、残りは `Group1` です。
`box red-team` では、候補は `red` で、残りは `-team` です。
`box RGB(0, 0, 255) Team` では、候補は `RGB` です。
`box -x` では、候補はなく、残りは `-x` です。
[fixture: sequence/docs-syntax-sequence-diagram-93d3c0ff] [fixture:
sequence/spec-sequence-diagram-97d37793] [fixture:
sequence/db-box-colour-candidate-word-prefix] [fixture:
sequence/db-box-colour-function-upper-case] [fixture:
sequence/db-box-no-colour-candidate]

### SequenceMessageStatement

| 欄                      | 型                       | 意味                                              |
| ----------------------- | ------------------------ | ------------------------------------------------- |
| `from`                  | SequenceIdentifier       | 矢印の前の id。                                   |
| `fromCentralConnection` | 真偽値                   | 送り手と矢印の間に `()` があるかどうか。          |
| `arrow`                 | SequenceArrow            | 矢印。                                            |
| `activation`            | 文字列または null        | 矢印の後の `+` か `-`。なければ null。            |
| `toCentralConnection`   | 真偽値                   | 矢印と宛先の間に `()` があるかどうか。            |
| `to`                    | SequenceIdentifier       | 矢印の後の id。                                   |
| `text`                  | SequenceText または null | `:` の後のテキスト。`:` の後が空白だけなら null。 |

子の欄: `from`、`arrow`、`to`、`text`。
どちらかの中央の接続が真のとき、`activation` は null です。
`:` は文のトークンで、どの欄にも属しません。

### SequenceArrow

メッセージの矢印です。

| 欄            | 型     | 意味                                   |
| ------------- | ------ | -------------------------------------- |
| `value`       | 文字列 | その書かれたテキスト。                 |
| `startMarker` | 文字列 | 送り手の側の端の記号。下の語のどれか。 |
| `line`        | 文字列 | `-` は `solid`、`--` は `dotted`。     |
| `endMarker`   | 文字列 | 宛先の側の端の記号。下の語のどれか。   |

子の欄はありません。
矢印は、省略できる始まりの記号、線（`-` か `--`）、終わりの記号の順に書きます。
終わりの記号がなければ、線の後に `>` が続きます（`->`、`-->`）。
ただし、始まりに半分の記号があるときは、線の後に何も続きません（`/|-`）。
26 個の矢印はどれも、これらの欄の組を 1 つずつ持ちます。
記号は次のとおりです。

- `none`: 記号なし。
- `arrow`: 終わりの `>>`、始まりの `<<`。
- `cross`: 終わりの `x`。
- `open-arrow`: 終わりの `)`。
- `half-arrow-top` と `half-arrow-bottom`: 終わりの `|\` と `|/`、
  始まりの `/|` と `\|`。
- `half-stick-top` と `half-stick-bottom`: 終わりの `\\` と `//`、
  始まりの `//` と `\\`。

上と下は、矢じりの半分を線のどちら側に描くかの名前です。
始まりでは文字が鏡に書かれるので、
`//` は、終わりでは `half-stick-bottom`、始まりでは `half-stick-top` です。
そのため、`->` と `-->` は記号を持たず、
`->>`、`-x`、`-)` は終わりの記号 `arrow`、`cross`、`open-arrow` を持ちます。
`<<->>` は始まりと終わりの記号 `arrow` を、
`-|\` は終わりの記号 `half-arrow-top` を、
`/|-` は始まりの記号 `half-arrow-top` を持ちます。
`-` の代わりに `--` を書いた同じものは、線 `dotted` を持ちます。
[fixture: sequence/db-arrow-types]

### SequenceAutonumberStatement

| 欄      | 型                         | 意味                             |
| ------- | -------------------------- | -------------------------------- |
| `start` | NumericLiteral または null | 1 つ目の数。なければ null。      |
| `step`  | NumericLiteral または null | 2 つ目の数。なければ null。      |
| `off`   | 真偽値                     | 文が `autonumber off` かどうか。 |

子の欄: `start`、`step`。
数は `1.5` のように小数を持てます。
`off` が真のとき、どちらの数も null です。

### SequenceActivateStatement と SequenceDeactivateStatement

| 欄   | 型                 | 意味                                  |
| ---- | ------------------ | ------------------------------------- |
| `id` | SequenceIdentifier | 活性化するか非活性化する参加者の id。 |

子の欄: `id`。

### SequenceNoteStatement

| 欄          | 型                       | 意味                                                   |
| ----------- | ------------------------ | ------------------------------------------------------ |
| `placement` | 文字列                   | `left of`、`right of`、`over`。小文字で、空白は 1 個。 |
| `ids`       | SequenceIdentifier の列  | id。`,` のある `over` なら 2 つの id。                 |
| `text`      | SequenceText または null | `:` の後のテキスト。`:` の後が空白だけなら null。      |

子の欄: `ids`、`text`。

### SequenceLinksStatement、SequenceLinkStatement、SequencePropertiesStatement、SequenceDetailsStatement

| 欄     | 型                       | 意味                                              |
| ------ | ------------------------ | ------------------------------------------------- |
| `id`   | SequenceIdentifier       | 参加者の id。                                     |
| `text` | SequenceText または null | `:` の後のテキスト。`:` の後が空白だけなら null。 |

子の欄: `id`、`text`。
`links` と `properties` のテキストは JSON で、木はそれを読みません。
`link` のテキストは、ラベル、`@`、URL です。
`details` のテキストは、ページの要素の id です。

### SequenceTitleStatement

| 欄      | 型              | 意味                                                                                 |
| ------- | --------------- | ------------------------------------------------------------------------------------ |
| `value` | SequenceLiteral | `title-text` の単位。`title` か `title:` と 1 個の空白の後のテキストで、空白を含む。 |

子の欄: `value`。
mermaid.js はタイトルを空白を含めて書かれたとおりに保つので、
値は `title-text` の単位の全体の書かれたテキストです。
`title`、空白 2 個、`x`、空白 2 個の値は、空白、`x`、空白 2 個で、
空白 4 個が続く `title` の値は空白 3 個で、
`title`、改行、空白 2 個、`A->>B: x` の値は、空白 2 個と `A->>B: x` です。
[fixture: sequence/db-title-spaces] [fixture:
sequence/db-title-whitespace-only] [fixture:
sequence/db-title-next-line-indented]

### SequenceAccTitleStatement

テキストを伴う `accTitle:` の文です。

| 欄      | 型                          | 意味                                                          |
| ------- | --------------------------- | ------------------------------------------------------------- |
| `value` | SequenceLiteral または null | `accTitle:` の後の、行の終わりまでのテキスト。なければ null。 |

子の欄: `value`。
`:` の後の空白は改行も含めて一緒に読まれるので、
値が null になるのはテキストの終わりだけです。
`#` と `;` はテキストの文字です。
[fixture: sequence/lex-acc-title-line-feed] [fixture:
sequence/lex-acc-title-at-end] [fixture: sequence/lex-acc-title-hash]

### SequenceAccDescrStatement

テキストを伴う `accDescr:` の文です。

| 欄      | 型                          | 意味                                                          |
| ------- | --------------------------- | ------------------------------------------------------------- |
| `value` | SequenceLiteral または null | `accDescr:` の後の、行の終わりまでのテキスト。なければ null。 |

子の欄: `value`。
`:` の後の空白は改行も含めて一緒に読まれるので、
値が null になるのはテキストの終わりだけです。
[fixture: sequence/db-acc-descr-empty-replaces]

### SequenceAccDescrBlockStatement

テキストと `}` を伴う `accDescr {` の文です。
テキストがブロックの中で終わるときは `}` を持ちません。

| 欄       | 型                          | 意味                                                                                                |
| -------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `value`  | SequenceLiteral または null | `accDescr {` と `}` の間のテキスト。ブロックが閉じていなければテキストの終わりまで。なければ null。 |
| `closed` | 真偽値                      | ブロックが `}` で終わるかどうか。テキストがブロックの中で終わるときは偽。                           |

子の欄: `value`。
テキストの終わりの `accDescr { x` の値は `x` です。
[fixture: sequence/db-acc-descr-block-unclosed]
テキストの終わりの `accDescr {` は、値が null で、閉じていません。
[fixture: sequence/lex-acc-descr-block-unclosed-empty]
`accDescr {  }` はテキストのない閉じたブロックで、値は null です。
`{` の後の空白は `{` と一緒に読まれます。
そのようなブロック、つまり空の説明ブロックは、
箱の本体の中も含めて、文が始まるところと、
文の最後の単位の後、`newline` の前で文になります。
文が始まるところであるキーワード `sequenceDiagram` のすぐ後では、
図の `body` の最初の文です
（[sequence.ja.md](../diagrams/sequence.ja.md#区切りの前の空の説明ブロック)
を参照）。
ほかの場所では入力は拒否されます
（[sequence.ja.md](../diagrams/sequence.ja.md#既知の差) を参照）。
[fixture: sequence/db-acc-descr-spaces-block-keeps] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] [fixture:
sequence/gram-box-empty-description-block-line] [fixture:
sequence/header-empty-description-block]

### SequenceLoopStatement、SequenceOptStatement、SequenceBreakStatement

| 欄     | 型                       | 意味                                      |
| ------ | ------------------------ | ----------------------------------------- |
| `text` | SequenceText または null | キーワードの後のテキスト。なければ null。 |
| `body` | SequenceStatement の列   | `end` までの文。ソースの順。              |

子の欄: `text`、`body`。

### SequenceRectStatement

| 欄      | 型                       | 意味                                                                   |
| ------- | ------------------------ | ---------------------------------------------------------------------- |
| `color` | SequenceText または null | `rect` の後のテキスト。描画はそれを塗りの色として使う。なければ null。 |
| `body`  | SequenceStatement の列   | `end` までの文。ソースの順。                                           |

子の欄: `color`、`body`。

### SequenceAltStatement、SequenceParStatement、SequenceParOverStatement、SequenceCriticalStatement

節を持つブロックです。
`alt` と `else`、`par` と `par_over` と `and`、`critical` と `option` です。

| 欄         | 型                   | 意味                                         |
| ---------- | -------------------- | -------------------------------------------- |
| `sections` | SequenceSection の列 | 節。ソースの順。最初の節はブロック自身の節。 |

子の欄: `sections`。
どの節も、テキストとその後の文という同じ形を持ちます。
そのため、ブロックのキーワードの後の最初の節も、
`else`、`and`、`option` の後の節と同じ節です。

### SequenceSection

| 欄     | 型                       | 意味                                                |
| ------ | ------------------------ | --------------------------------------------------- |
| `text` | SequenceText または null | 節を始めるキーワードの後のテキスト。なければ null。 |
| `body` | SequenceStatement の列   | 次の節か `end` までの文。ソースの順。               |

子の欄: `text`、`body`。

### SequenceIgnoredStatement

mermaid.js が 1 つの `invalid` の単位として読み、無視する行です。
`)` や `/` だけの行がそうです
（[文法](../diagrams/sequence.ja.md#文法) を参照）。

| 欄      | 型     | 意味                                                                           |
| ------- | ------ | ------------------------------------------------------------------------------ |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。その 1 文字。 |

子の欄はありません。

### SequenceIdentifier

参加者の id です。空白を含みうる名前です
（[id の並び](../diagrams/sequence.ja.md#id-の並び) と
[id の文脈](../diagrams/sequence.ja.md#id-の文脈) を参照）。

| 欄     | 型     | 意味                                                              |
| ------ | ------ | ----------------------------------------------------------------- |
| `name` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
id は 1 つの単位です。
その名前は両端に空白を持たず、
中の空白は、単位の中のディレクティブの隣にあっても名前の一部です。
`participant A B` の参加者は `A B` です。
`participant A%%{init: {}}%% c%%B` の参加者は `A c%%B` です。
[fixture: sequence/lex-id-context-space] [fixture:
sequence/lex-directive-in-id-before-space]

### SequenceText

テキスト部分です
（[テキスト部分](../diagrams/sequence.ja.md#テキスト部分) を参照）。
省略可能な折り返しの接頭辞を持つテキストです。

| 欄      | 型                          | 意味                                                                                                      |
| ------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `wrap`  | 文字列または null           | 接頭辞 `wrap:` なら `wrap`、`nowrap:` なら `nowrap`（前の `:` の有無を問わない）。接頭辞がなければ null。 |
| `value` | SequenceLiteral または null | 接頭辞の後のテキスト。なければ null。                                                                     |

子の欄: `value`。
接頭辞もテキストもないテキスト部分は、ノードを作りません。
それを持つはずの欄は null です。

### SequenceLiteral

文法が空白を含むことを許し、その終わりを決める位置に、
書き手が引用符なしで書くテキストです。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値が両端に空白を持つのは、mermaid.js がそれを読むところだけです。
タイトルと、U+2028 か U+2029 を空白に数えない箱のテキストの部分です
（[SequenceTitleStatement](#sequencetitlestatement) と
[SequenceBoxText](#sequenceboxtext) を参照）。

### SequenceDataBlock

| 欄      | 型     | 意味                                                     |
| ------- | ------ | -------------------------------------------------------- |
| `value` | 文字列 | `@{` と `}` の間のテキスト。空白を含めて書かれたとおり。 |

子の欄はありません。
木はその中身を読みません
（[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md) を参照）。

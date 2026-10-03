# sequence のノード

英語版: [sequence.md](./sequence.md)

この文書は、図種 `sequence` の木のノードとトークンを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/sequence.ja.md](../diagrams/sequence.ja.md) で定めます。

この図種の本文は [SequenceDiagram](#sequencediagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める範囲のテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではなく、
変換は [diagrams/sequence.ja.md](../diagrams/sequence.ja.md#木から要約を作る)
の Db の正規化が、値を使うところで行います。
ノードの範囲の外の空白は、その値に入りません。
それが Db に効くのはタイトルの 1 か所で、
そこでは Db の正規化がそれをソースから読みます。

**参加者**は、図の生存線の 1 つで、id で名指されます。
mermaid.js の Db では actor と呼ばれます。
この文書では、actor という語を、
キーワード `actor` が宣言する参加者に取っておきます。

## ノード

### SequenceDiagram

| 欄     | 型                     | 意味             |
| ------ | ---------------------- | ---------------- |
| `body` | SequenceStatement の列 | 文。ソースの順。 |

子の欄: `body`。
キーワード `sequenceDiagram` は欄ではありません。
範囲は、キーワードから図の最後のトークンまでです。

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
`create` があるときは、範囲は `create` から始まります。

### SequenceDestroyStatement

`destroy` の文です。

| 欄        | 型                 | 意味                                       |
| --------- | ------------------ | ------------------------------------------ |
| `created` | 真偽値             | キーワードの前に `create` があるかどうか。 |
| `id`      | SequenceIdentifier | `destroy` の後の id。                      |

子の欄: `id`。
`create` があるときは、範囲は `create` から始まります。
`created` が真なら、mermaid.js は参加者を destroy せずに作ります
（[木から要約を作る](../diagrams/sequence.ja.md#木から要約を作る) を参照）。

### SequenceBoxStatement

| 欄     | 型                          | 意味                                                                                     |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| `text` | SequenceBoxText または null | `box` の後のテキスト。なければ null。                                                    |
| `body` | SequenceStatement の列      | `end` までの文。ソースの順。参加者の文、destroy の文、テキストのない説明のブロックの文。 |

子の欄: `text`、`body`。

### SequenceBoxText

`box` の後に書かれたテキストで、文法の `box-text` です。
mermaid.js はそこから色と名前を読みますが、どの部分が色かは、
mermaid.js がブラウザに問い合わせる問いの答えに依ります
（[箱の色](../diagrams/sequence.ja.md#箱の色) を参照）。
そのため、このノードは、テキストの全体と、
mermaid.js が問い合わせる前に分けるのと同じように字句解析器が分ける、
2 つの部分を持ちます。
最初の部分が色かどうかは述べません。

| 欄               | 型                          | 意味                                                                     |
| ---------------- | --------------------------- | ------------------------------------------------------------------------ |
| `value`          | 文字列                      | その範囲のテキスト。                                                     |
| `colorCandidate` | SequenceLiteral または null | `color-candidate` の単位。mermaid.js が問い合わせる部分。なければ null。 |
| `remainder`      | SequenceLiteral または null | 候補の後の `text` の単位。なければ null。                                |

子の欄: `colorCandidate`、`remainder`。
どちらの部分もそれぞれ 1 つの単位です
（[行の文脈](../diagrams/sequence.ja.md#行の文脈) を参照）。
各 SequenceLiteral の範囲は、その単位から両端の空白を除いた範囲です。
部分は 1 つのトークンですが、
ディレクティブが同じ種類のトークンに切ることがあります
（[トークン](#トークン) を参照）。
`box Gr%%{init: {}}%%oup` では、候補は `Group` で、その範囲は、
`RawText` のトークン `Gr` と `oup` と、その間のディレクティブを覆います。
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
| `value`       | 文字列 | その範囲のテキスト。                   |
| `startMarker` | 文字列 | 送り手の側の端の記号。下の語のどれか。 |
| `line`        | 文字列 | `-` は `solid`、`--` は `dotted`。     |
| `endMarker`   | 文字列 | 宛先の側の端の記号。下の語のどれか。   |

子の欄はありません。
範囲はそのトークンです。
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

| 欄      | 型                          | 意味                                                      |
| ------- | --------------------------- | --------------------------------------------------------- |
| `value` | SequenceLiteral または null | `title` か `title:` の後のテキスト。すべて空白なら null。 |

子の欄: `value`。
Db のタイトルは、値の周りに書かれた空白を保ち、
Db の正規化はそれをソースから読みます。

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
Db への効果が `accDescr:` の文と違うので、別のノードの型にしています。
閉じていないブロックは、テキストにかかわらず説明を空にし、
テキストのない閉じたブロックは何も変えません
（[sequence.ja.md](../diagrams/sequence.ja.md#木から要約を作る) を参照）。

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
mermaid.js は最初の節に Db で別の型の項目を与えますが、
それは Db の正規化の事柄です。

### SequenceSection

| 欄     | 型                       | 意味                                                |
| ------ | ------------------------ | --------------------------------------------------- |
| `text` | SequenceText または null | 節を始めるキーワードの後のテキスト。なければ null。 |
| `body` | SequenceStatement の列   | 次の節か `end` までの文。ソースの順。               |

子の欄: `text`、`body`。
範囲は、節を始めるキーワードから始まり、その最後のトークンで終わります。
節を始めるキーワードは、`else`、`and`、`option`、
最初の節ならブロックのキーワードです。
`end` はブロックに属します。

### SequenceIgnoredStatement

mermaid.js が 1 つの `invalid` の単位として読み、無視する行です。
`)` や `/` だけの行がそうです
（[文法](../diagrams/sequence.ja.md#文法) を参照）。

| 欄      | 型     | 意味                              |
| ------- | ------ | --------------------------------- |
| `value` | 文字列 | その範囲のテキスト。その 1 文字。 |

子の欄はありません。

### SequenceIdentifier

参加者の id です。空白を含みうる名前です
（[id の並び](../diagrams/sequence.ja.md#id-の並び) と
[id の文脈](../diagrams/sequence.ja.md#id-の文脈) を参照）。

| 欄     | 型     | 意味                                                            |
| ------ | ------ | --------------------------------------------------------------- |
| `name` | 文字列 | その範囲のテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
id は 1 つの単位です。
その名前は両端に空白を持たず、
中の空白は、単位を切るディレクティブの隣にあっても名前の一部です。
そのトークンは `Identifier` のトークンで、1 つです。
単位の中のディレクティブが単位を切ると、それより多くなります
（[トークン](#トークン) を参照）。
`participant A B` の参加者は `A B` です。
`participant A%%{init: {}}%% c%%B` の参加者は `A c%%B` で、
その 1 つの単位はトークン `A` と `c%%B` に切られています。
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
範囲は、接頭辞（接頭辞がなければテキスト）から、テキストの終わりまでです。
接頭辞もテキストもないテキスト部分は、ノードを作りません。
それを持つはずの欄は null です。

### SequenceLiteral

文法が空白を含むことを許し、その終わりを決める位置に、
書き手が引用符なしで書くテキストです。

| 欄      | 型     | 意味                                                            |
| ------- | ------ | --------------------------------------------------------------- |
| `value` | 文字列 | その範囲のテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値は両端に空白を持ちません。

### SequenceDataBlock

| 欄      | 型     | 意味                                                     |
| ------- | ------ | -------------------------------------------------------- |
| `value` | 文字列 | `@{` と `}` の間のテキスト。空白を含めて書かれたとおり。 |

子の欄はありません。
木はその中身を読みません
（[embedded-data-opaque](../known-divergences/embedded-data-opaque.ja.md) を参照）。
範囲は `@{` から `}` までです。

## トークン

トークンは、
[diagrams/sequence.ja.md](../diagrams/sequence.ja.md#字句構造)
の単位から作ります。
すべて空白ではない各単位は 1 つのトークンで、その種類はこの表のとおりです。

| 種類         | 単位                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | キーワード: `sequenceDiagram`、`participant`、`actor`、`create`、`destroy`、`as`、`box`、`loop`、`rect`、`opt`、`alt`、`else`、`par`、`par_over`、`and`、`critical`、`option`、`break`、`end`、`note`、`left of`、`right of`、`over`、`links`、`link`、`properties`、`details`、`activate`、`deactivate`、`autonumber`、`off`。`title`、`title:`、`accTitle`、`accDescr` の単位。`wrap-prefix` の単位 |
| `Identifier` | `id` の単位。[SequenceIdentifier](#sequenceidentifier) の単位                                                                                                                                                                                                                                                                                                                                         |
| `Numeric`    | `number` の単位                                                                                                                                                                                                                                                                                                                                                                                       |
| `RawText`    | `text`、`color-candidate`、`title-text`、`description-text`、`description-block-text`、`data-text` の単位。`invalid` の単位                                                                                                                                                                                                                                                                           |
| `Punctuator` | `arrow` の単位。`+`、`-`、`()`、`,`、`:`、`{`、`}`、`@{`。`;` から読む `newline` の単位                                                                                                                                                                                                                                                                                                               |

トークンは、その単位から両端の空白を除いたものです。
改行から読む `newline` の単位は空白で、トークンになりません。
`RawText` か `Identifier` の単位の、
空白でない 2 つの文字の間にディレクティブがあれば、単位はそこで切られます。
各断片から両端の空白を除いたものがトークンで、
断片の間のディレクティブは `Directive` のトークンです
（[ast.ja.md](../ast.ja.md#directive) を参照）。
ほかの種類の単位の中のディレクティブは、入力を拒否させます
（[単位の中のディレクティブ](../diagrams/sequence.ja.md#単位の中のディレクティブ) を参照）。

- テキストの前の `:` と、`accTitle` と `accDescr` の後の `:` は、
  文の `Punctuator` のトークンで、どの欄にも属しません。
- テキストの折り返しの接頭辞（`wrap:` や `:nowrap:`）は、
  1 つの `Keyword` のトークンで、
  その [SequenceText](#sequencetext) の最初のトークンです。
- 文を終える `;` は、改行と同じく、
  どの文にも属さない `Punctuator` のトークンです。
- 行の規則が無視し、それだけで 1 つのトークンになる `;`
  （[トークン](../ast.ja.md#トークン) を参照）は、
  その位置の文脈が `;` に読む単位の種類を持ちます。
  文の文脈では `newline` の単位なので `Punctuator` で、
  そこで読む図のコメントの直後でも同じです（[Comment](../ast.ja.md#comment) を参照）。
  `loop style:#x;` では、テキスト `style:` が行の文脈を出て、
  `#x` は文の文脈のコメントで、その後の `;` は `Punctuator` のトークンです。
  題、説明、説明のブロック、データの文脈では、
  `;` をテキストとして読むので `RawText` です。
  `accTitle: style:#x;` では、題は `style:#x` で、
  その後の `;` は `RawText` のトークンです。
  `participant A@{ style:#x; }` では、
  `style:#x` の後の `;` は `RawText` のトークンで、
  その後の空白と `}` はその外にあります。
  `participant A@{ "style": "x:#y" }` の後の `;` は、
  `Punctuator` のトークンです。
  データブロックの中の `"x:#y;"` のように、トークンの文字の間にある `;` は、
  そのトークンの一部です。
  [fixture: sequence/tokens-acc-title-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-block-ignored-semicolon] [fixture:
  sequence/tokens-data-block-ignored-semicolon-alone] [fixture:
  sequence/tokens-data-block-then-ignored-semicolon] [fixture:
  sequence/tokens-loop-comment-then-ignored-semicolon] [fixture:
  sequence/tokens-comment-then-ignored-semicolon]

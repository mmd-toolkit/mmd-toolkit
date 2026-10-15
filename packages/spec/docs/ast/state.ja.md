# state のノード

英語版: [state.md](./state.md)

この文書は、図種 `stateDiagram` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/state.ja.md](../diagrams/state.ja.md) で定めます。

この図種の本文は [StateDiagram](#statediagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める値の書かれたテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
値が空白で始まるか終わるのは、値の単位がそれを自身の文字として持ち、
mermaid.js がそれを読むところだけです（[ノード](../ast.ja.md#ノード) を参照）。
この図種では、別名の 2 つ目の説明の空白です
（[StateAliasDefinitionStatement](#statealiasdefinitionstatement) を参照）。
ほかのところでは、値の両端の空白は値の外です。

**状態**は図の箱の 1 つで、その id で名指されます。
遷移は 1 つの状態から別の状態へ向かいます。
`[*]` は始まりか終わりを表します。

この図種の StringLiteral は常に閉じています。
空になるのは、`click A "" ""` のような
click の文の URL と tooltip のときだけです。
`state "" as A` のような空の説明は入力を拒否させ、
state の文脈の空の文字列は StringLiteral ではなく、
mermaid.js が読まないテキストです
（[state の文脈](../diagrams/state.ja.md#state-の文脈) を参照）。
[fixture: state/lex-click-empty-strings] [fixture: state/lex-alias-empty-string]
[fixture: state/gram-state-empty-string-alone]

## ノード

### StateDiagram

| 欄     | 型                  | 意味             |
| ------ | ------------------- | ---------------- |
| `body` | StateStatement の列 | 文。ソースの順。 |

子の欄: `body`。
ヘッダーのキーワードは欄ではありません。
`stateDiagram` と `stateDiagram-v2` は同じに読まれます
（[検出](../diagrams/state.ja.md#検出) を参照）。

**StateStatement** は、StateDefinitionStatement、StateTransitionStatement、
StateCompositeStatement、StateAliasDefinitionStatement、
StatePseudostateDefinitionStatement、StateDividerStatement、StateNoteStatement、
StateFloatingNoteStatement、StateIgnoredStatement、StateClickStatement、
StateClassDefStatement、StateClassStatement、StateStyleStatement、
StateDirectionStatement、
StateAccTitleStatement、StateAccDescrStatement、StateAccDescrBlockStatement、
StateScaleStatement、StateHideEmptyDescriptionStatement のどれかです。

改行はどの文にも属さず、空の行はノードを作りません。
下のすべてのノードの子の欄は、
ソースの順です（[ノード](../ast.ja.md#ノード) を参照）。

### StateDefinitionStatement

id だけか、説明とともに書いた状態です。
`A`、`A : text`、`[*]`、`A:::cls`。

| 欄            | 型                       | 意味                                                          |
| ------------- | ------------------------ | ------------------------------------------------------------- |
| `reference`   | StateReference           | 状態。                                                        |
| `description` | StateLiteral または null | `:` の後のテキスト。`:` がないか、その後が空白だけなら null。 |

子の欄: `reference`、`description`。
`A : ` は、Db と同じく説明を持たず、空白 4 個が続く `A :` も同じです。
mermaid.js は、空白だけの説明を、その量によらず説明のないものとして読むので、
その空白は値ではありません。
[fixture: state/gram-description-blank] [fixture:
state/gram-description-blank-spaces]

### StateTransitionStatement

| 欄      | 型                       | 意味                                            |
| ------- | ------------------------ | ----------------------------------------------- |
| `from`  | StateReference           | 矢印の前の状態。                                |
| `to`    | StateReference           | 矢印の後の状態。                                |
| `label` | StateLiteral または null | `:` の後のテキスト。ないか、空白だけなら null。 |

子の欄: `from`、`to`、`label`。
矢印 `-->` は単位で、ノードではありません。
state 図の矢印はこの 1 つだけで、端の印がなく、線の種類も 1 つなので、
矢印のノードには置く欄がありません。
[fixture: state/lex-percent-in-label]

### StateReference

| 欄         | 型                              | 意味                                     |
| ---------- | ------------------------------- | ---------------------------------------- |
| `state`    | Identifier または StateTerminal | 状態の id か `[*]`。                     |
| `cssClass` | Identifier または null          | `:::` の後の CSS クラス。なければ null。 |

子の欄: `state`、`cssClass`。
[fixture: state/gram-style-separator-transition] [fixture:
state/gram-terminal-style-separator]

### StateTerminal

`[*]`。欄はありません。
始まりか終わりかは、その位置から決まります。
遷移の矢印の前か、それだけのときは始まり、矢印の後なら終わりです。
[fixture: state/gram-terminal-alone]

### StateCompositeStatement

`state A { … }` と `state A`。

| 欄               | 型                               | 意味                                                                                         |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| `textBeforeId`   | StateIgnoredText または null     | 名前の前の空の文字列。なければ null。                                                        |
| `id`             | Identifier または null           | `state` の後の名前。`state` だけなら null。                                                  |
| `textBeforeBody` | StateIgnoredText または null     | 本体の `{` の前の空の文字列、空の説明ブロック、`ignored-state` の単位、`%%`。なければ null。 |
| `body`           | StateStatement の列、または null | `{` と `}` の間の文。本体がなければ null。                                                   |

子の欄: `textBeforeId`、`id`、`textBeforeBody`、`body`。
`textBeforeId` と `textBeforeBody` は、mermaid.js が読まないテキストを持ちます。
`textBeforeId` は、
名前の前の state の文脈の空の文字列（`state "" x` の `""`）です。
`textBeforeBody` は、名前の後の空の文字列と、
名前の次の行の、ディレクティブを始めない `{` の前の `%%` です。
`state x "" {` は空の文字列を、`state X` の後の行 `%%{}` は `%%` を持ち、
`state X ""` の後の行 `%%{}` は、空の文字列から `%%` までの
1 つの StateIgnoredText を持ちます。
名前の次の行の `{` の前の空の説明ブロックも持ち、
`state X ""` の後の行 `accDescr {} {` は、
空の文字列からブロックまでの 1 つの StateIgnoredText を持ちます。
`ignored-state` の単位、
つまり後の行の、mermaid.js がトークンを読まない各 `state` と、
その後の空の文字列も持ちます。
`state X ""` の後の行 `state {` は、空の文字列から `state` までの
1 つの StateIgnoredText を持ち、本体は X のものです。
[fixture: state/gram-ignored-state-before-body-next-line]
[fixture: state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-ignored-percent-before-body-next-line] [fixture:
state/gram-state-empty-string-then-percent-before-body] [fixture:
state/gram-empty-description-block-after-empty-string-before-body]
`state` の後か文の後の空の文字列で、名前も文字列も本体の `{` も続かないものは、
[StateIgnoredStatement](#stateignoredstatement) です。
`state x ""` は合成状態の文と無視される文ですが、
`state x ""` の後に行 `{` が続くと 1 つの合成状態の文で、
空の文字列はその `textBeforeBody` です。
[fixture: state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-body-next-line]
本体があれば、その文はその id の合成状態を定めます。
本体はなくてもかまいません。
`state A`、2 つのそのような文である `state a b`、`state` だけの文は、
本体を持ちません。
[fixture: state/lex-keyword-upper-case] [fixture:
state/lex-state-without-body] [fixture: state/lex-state-two-names] [fixture:
state/lex-state-keyword-alone]

### StateAliasDefinitionStatement

`state "説明" as A`、`state "説明" as A : もう 1 つ`、
`state "説明" as A { … }`。

| 欄                      | 型                               | 意味                                                                                                                   |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `textBeforeDescription` | StateIgnoredText または null     | 説明の前の空の文字列。なければ null。                                                                                  |
| `description`           | StringLiteral                    | 引用符の中の説明。                                                                                                     |
| `textAfterDescription`  | StateIgnoredText または null     | 説明の後、`as` の前の空の文字列。なければ null。                                                                       |
| `id`                    | StateLiteral または null         | `as` の後の id。空なら null。                                                                                          |
| `secondDescription`     | StateLiteral または null         | 本体がないとき、最初の `:` と 2 つ目の `:` または終わりの間の `second-description` の単位。空白を含む。なければ null。 |
| `textAfter`             | StateIgnoredText または null     | 本体がないとき、2 つ目の `:` からのテキスト。なければ null。                                                           |
| `textBeforeBody`        | StateIgnoredText または null     | 本体の `{` の前の空の説明ブロック、`ignored-state` の単位、空の文字列、`%%` からのテキスト。なければ null。            |
| `body`                  | StateStatement の列、または null | `{` と `}` の間の文。本体がなければ null。                                                                             |

子の欄: `textBeforeDescription`、`description`、`textAfterDescription`、
`id`、`secondDescription`、`textAfter`、`textBeforeBody`、`body`。
`textBeforeDescription` と `textAfterDescription` は、
説明の前後の state の文脈の空の文字列で、mermaid.js はそれを読みません。
`state "" "y" "" as A` は両方を持ちます。
[fixture: state/gram-state-empty-strings-around-alias-string]
`textBeforeBody` は、mermaid.js が読まないテキストです。
`as` の後の、`%%` からその行の `{` までのテキスト（終わりの空白を除く）で、
そのとき別名は id を持ちません（`state "d" as %% c {`）。
または、別名の次の行の、ディレクティブを始めない `{` の前の、
空の説明ブロックと `%%` です（行 `accDescr {} {` が続く `state "d" as A`）。
または、`ignored-state` の単位とその後の空の文字列です（いくつ続いてもよい）
（行 `state {` が続く `state "d" as A`）。
[fixture: state/gram-ignored-state-before-alias-body-next-line]
[fixture: state/lex-alias-id-ignored-percent-before-body] [fixture:
state/lex-alias-id-ignored-percent-brace] [fixture:
state/gram-ignored-percent-before-alias-body-next-line] [fixture:
state/gram-empty-description-block-before-alias-body-next-line]
id は空白を持て、本体の前では `:` も持てます。
`state "d" as my id` は `my id` を定め、
`state "d" as A : x {` は合成状態 `A : x` を定めます。
[fixture: state/lex-alias-id-spaces] [fixture:
state/lex-alias-second-description] [fixture: state/lex-alias-third-part]
[fixture: state/lex-alias-colon-before-body] [fixture:
state/lex-alias-without-id]
mermaid.js は 2 つ目の説明を、空白を含めて書かれたとおりに読むので、
`secondDescription` は、空白だけのときも単位の全体です。
`state "d" as A : x  : y` の値は、空白、`x`、空白 2 個で、
空白 2 個が続く `state "d" as A :` の値は空白 2 個です。
`:` がないときと、`:` の後に何もないときは null です。
後者では mermaid.js は状態に空の 2 つ目の説明を与え、
それは木のどの欄にも現れません。
行の規則が無視する `;` の後の空白は、その中に残ります。
空白 2 個が続く `state "d" as A style:#x;` は、別名の id `A style` と、
2 つ目の説明 `#x` と空白 2 個を持ちます。
[fixture: state/lex-alias-third-part] [fixture:
state/db-alias-colon-spaces-second] [fixture:
state/db-alias-colon-empty-second] [fixture:
state/tokens-alias-ignored-semicolon-then-spaces]

### StatePseudostateDefinitionStatement

`state f1 <<fork>>`、`state c1 [[choice]]`。

| 欄     | 型                       | 意味                                |
| ------ | ------------------------ | ----------------------------------- |
| `id`   | StateLiteral または null | 印の前のテキスト。空なら null。     |
| `kind` | 文字列                   | `fork`、`join`、`choice` のどれか。 |

子の欄: `id`。
id は空白を持てます。`state f 1 <<fork>>` は fork `f 1` です。
`state <<join>>` は id を持ちません。
[fixture: state/lex-fork-spaced-id] [fixture: state/lex-join-empty-id]
[fixture: state/lex-choice-square-brackets]

### StateDividerStatement

合成状態の本体の中の `--` で、本体を区域に分けます。欄はありません。
[fixture: state/lex-composite-divider]

### StateNoteStatement

`note left of A : テキスト`、そして `note right of A`、その後の行のテキスト、
`end note`。

| 欄                | 型                           | 意味                                                            |
| ----------------- | ---------------------------- | --------------------------------------------------------------- |
| `position`        | 文字列                       | `left` か `right`。                                             |
| `textBeforeState` | StateIgnoredText または null | 位置のすぐ後の `%%` からのテキスト。なければ null。             |
| `state`           | Identifier または null       | `of` の後の状態の id。空なら null。                             |
| `textBeforeText`  | StateIgnoredText または null | 1 行のとき、mermaid.js が落とす `:` の後の文字。なければ null。 |
| `text`            | StateLiteral または null     | mermaid.js が読むノートのテキスト。空か空白だけなら null。      |

子の欄: `textBeforeState`、`state`、`textBeforeText`、`text`。
`textBeforeState` は、mermaid.js が読まないテキストです。
位置のすぐ後に空白なしで続く `%%` と、
その後の `:`、改行、空白、`-` 以外の文字で、
その後にノートの id が続きます（`note left of%%x A : t`）。
[fixture: state/lex-note-id-ignored-percent-after-position]
ノートの id は、最初の文字でも `%%` の前で終わり、そのときは空です。
`note right of %% c S`、行 `x`、`end note` では、
`state` は null で、テキストは `%%` で始まります。
[fixture: state/lex-note-mixed-case] [fixture: state/lex-note-block]
[fixture: state/lex-note-block-empty] [fixture: state/lex-note-id-percent-block]

1 行のとき、mermaid.js は、ノートの id のすぐ後からのテキストを、
最初の 2 文字と両端の空白を除いて読みます
（[ノートの文脈](../diagrams/state.ja.md#ノートの文脈) を参照）。
`text` と `textBeforeText` はその読み方を示します。
`:` の前に空白が 2 つ以上あると、`:` はテキストの一部です。
`note left of A  :hi` のテキストは `:hi` です。
`:` がノートの id のすぐ後にあるとき、`:` の後の文字は、
空白でなければ `textBeforeText` です。
`note left of A:hi` ではそれが `h` でテキストは `i` で、
`note left of A:h` ではそれが `h` でテキストはありません。
[fixture: state/lex-note-two-spaces-before-colon] [fixture:
state/lex-note-colon-without-space] [fixture:
state/lex-note-colon-then-one-character]

### StateFloatingNoteStatement

`note "テキスト" as N1`。
[fixture: state/lex-floating-note]

| 欄     | 型                       | 意味                                               |
| ------ | ------------------------ | -------------------------------------------------- |
| `text` | StateLiteral または null | 引用符の間のテキスト。すべて空白なら null。        |
| `id`   | StateLiteral または null | `as` の後、行の終わりまでのテキスト。空なら null。 |

子の欄: `text`、`id`。
[fixture: state/lex-floating-note-id-spaces]
引用符は文の単位で、どの欄にも属しません。
テキストの前と後に、それぞれ 2 つ以上あることもあります
（[ノートの文脈](../diagrams/state.ja.md#ノートの文脈) を参照）。
[fixture: state/lex-floating-note-extra-quote-before-text] [fixture:
state/lex-floating-note-whitespace-text]

### StateClickStatement

`click A "url" "tooltip"`、`click A href "url"`。

| 欄          | 型                        | 意味                                     |
| ----------- | ------------------------- | ---------------------------------------- |
| `reference` | StateReference            | 状態。                                   |
| `url`       | StringLiteral             | URL。                                    |
| `tooltip`   | StringLiteral または null | ツールチップ。`href` のある文では null。 |

子の欄: `reference`、`url`、`tooltip`。
click の文とその改行の間の空の説明ブロックは、その一部ではなく、
その後の StateAccDescrBlockStatement です。
`click A "u" "t" accDescr {}` は 2 つの文です
（[click の文](../diagrams/state.ja.md#click-の文) を参照）。
[fixture: state/gram-click-empty-description-block-after]
[fixture: state/gram-click-tooltip] [fixture: state/gram-click-href]

### StateClassDefStatement

| 欄         | 型                               | 意味                                                            |
| ---------- | -------------------------------- | --------------------------------------------------------------- |
| `cssClass` | Identifier                       | `classDef` の後の CSS クラス。                                  |
| `styles`   | （StateLiteral または null）の列 | `,` の単位で区切ったスタイル。ソースの順。空のスタイルは null。 |

子の欄: `cssClass`、`styles`。
スタイルは、mermaid.js がテキストを各 `,` で分けた部分なので、
部分ごとに 1 つあり、
空か空白だけの部分は、mermaid.js が空のテキストとして読むもので、null です。
`classDef a x,,y` のスタイルは `x`、null、`y` で、
`classDef a ,` は null を 2 つ持ちます。
一方、テキストのない `classDef` の文は、mermaid.js がスタイルを加えないので、
スタイルを持ちません。
[fixture: state/lex-classdef-percent] [fixture:
state/lex-classdef-without-styles] [fixture: state/db-classdef-empty-items]
[fixture: state/db-classdef-comma-only]

### StateClassStatement

`class A,B cls`。

| 欄         | 型                       | 意味                                       |
| ---------- | ------------------------ | ------------------------------------------ |
| `states`   | Identifier の列          | 状態の id。ソースの順。                    |
| `cssClass` | StateLiteral または null | 行の残り、つまり CSS クラス。空なら null。 |

子の欄: `states`、`cssClass`。
[fixture: state/lex-class-ids-space] [fixture: state/lex-class-name-spaces]
[fixture: state/lex-class-without-name]

### StateStyleStatement

`style A,B fill:#f00`。

| 欄       | 型                               | 意味                                                       |
| -------- | -------------------------------- | ---------------------------------------------------------- |
| `states` | （Identifier または null）の列   | 状態の id。ソースの順。`,` の前、間、後の空の項目は null。 |
| `styles` | （StateLiteral または null）の列 | StateClassDefStatement と同じスタイル。                    |

子の欄: `states`、`styles`。
`style ,A,,B, fill:red` の states は、null、A、null、B、null です。
[fixture: state/tokens-style-empty-items]
スタイルは、空の部分を null とする StateClassDefStatement と同じものですが、
テキストのない `style` の文は、mermaid.js が空のスタイル 1 つを与えるので、
null のスタイルを 1 つ持ちます。
`style A x, ,y` のスタイルは `x`、null、`y` で、
`style A` は null のスタイル 1 つを持ちます。
id はその後の空白で終わります。
`style A ,x` は、状態 A 1 つと、スタイル null と `x` を持ちます。
[fixture: state/db-style-comma-after-space]
[fixture: state/lex-style-empty-id] [fixture:
state/lex-style-without-styles] [fixture: state/db-style-empty-items]
[fixture: state/db-style-whitespace-item] [fixture: state/db-style-without-text]

### StateDirectionStatement

| 欄           | 型                           | 意味                                                   |
| ------------ | ---------------------------- | ------------------------------------------------------ |
| `textBefore` | StateIgnoredText または null | 方向の行の `direction` の前のテキスト。なければ null。 |
| `direction`  | 文字列                       | `TB`、`BT`、`RL`、`LR` のどれか。                      |
| `textAfter`  | StateIgnoredText または null | 方向の行の値の後のテキスト。なければ null。            |

子の欄: `textBefore`、`textAfter`。
[fixture: state/lex-direction-line-in-description] [fixture:
state/lex-direction-lower-case]

### StateAccTitleStatement

テキストを伴う `accTitle:` の文です。

| 欄      | 型                       | 意味                                                          |
| ------- | ------------------------ | ------------------------------------------------------------- |
| `value` | StateLiteral または null | `accTitle:` の後の、行の終わりまでのテキスト。なければ null。 |

子の欄: `value`。
`:` の後の空白は改行も含めて一緒に読まれるので、
値が null になるのはテキストの終わりだけです。
`#`、`;`、`%%` はテキストの文字です。
[fixture: state/lex-acc-title-next-line] [fixture: state/lex-acc-title-at-end]
[fixture: state/lex-acc-title-semicolon]

### StateAccDescrStatement

テキストを伴う `accDescr:` の文です。

| 欄      | 型                       | 意味                                                          |
| ------- | ------------------------ | ------------------------------------------------------------- |
| `value` | StateLiteral または null | `accDescr:` の後の、行の終わりまでのテキスト。なければ null。 |

子の欄: `value`。
`:` の後の空白は改行も含めて一緒に読まれるので、
値が null になるのはテキストの終わりだけです。
[fixture: state/db-acc-descr-empty-replaces]

### StateAccDescrBlockStatement

テキストと `}` を伴う `accDescr {` の文です。
テキストがブロックの中で終わるときは `}` を持ちません。
Db への効果が `accDescr:` の文と違うので、別のノードの型にしています。
閉じていないブロックは、テキストにかかわらず説明を空にし、
テキストのない閉じたブロックは何も変えません。

| 欄       | 型                       | 意味                                                                                                |
| -------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `value`  | StateLiteral または null | `accDescr {` と `}` の間のテキスト。ブロックが閉じていなければテキストの終わりまで。なければ null。 |
| `closed` | 真偽値                   | ブロックが `}` で終わるかどうか。テキストがブロックの中で終わるときは偽。                           |

子の欄: `value`。
`accDescr {` の後に行 `x` が続いてテキストが終わるとき、値は `x` です。
[fixture: state/db-acc-descr-unclosed-replaces]
テキストの終わりの `accDescr {` は、値が null で、閉じていません。
[fixture: state/lex-acc-descr-block-unclosed]
`accDescr {  }` はテキストのない閉じたブロックで、値は null です。
`{` の後の空白は `{` と一緒に読まれます。
そのようなブロック、つまり空の説明ブロックが文になるのは、
文が始まるところだけで、同じ行の別の文のすぐ後もそうです。
`A --> B accDescr {}` は、遷移の文と StateAccDescrBlockStatement で、
click の文とその改行の間のブロックも同じです。
文が始まるところであるヘッダーのすぐ後では、図の `body` の最初の文です
（[state.ja.md](../diagrams/state.ja.md#区切りの前の空の説明ブロック) を参照）。
後の単位がその前の文を続けるブロックと、間に空白しかないブロックの連なりは、
`A accDescr {} --> B` や `A --> B accDescr {} : x` のようにその文の中にあり、
`A --> accDescr {} B` のように文の単位の間にあるブロックも同じです。
そのとき入力は拒否されます
（[state.ja.md](../diagrams/state.ja.md#ほかの文) を参照）。
[fixture: state/db-acc-descr-empty-block-keeps] [fixture:
state/gram-empty-description-block-statement] [fixture:
state/gram-empty-description-block-after-transition] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-label] [fixture:
state/div-empty-description-block-after-arrow] [fixture:
state/header-empty-description-block]

### StateScaleStatement

`scale 350 width`。

| 欄      | 型             | 意味 |
| ------- | -------------- | ---- |
| `width` | NumericLiteral | 数。 |

子の欄: `width`。
[fixture: state/gram-scale]

### StateHideEmptyDescriptionStatement

`hide empty description`。欄はありません。
[fixture: state/gram-hide-empty-description]

### StateIgnoredStatement

`state` の後か、行の中のほかの文の後の、
名前も文字列も本体も続かない state の文脈の空の文字列です。
`state ""` と `state x ""` の `""` がそうです
（[合成状態、別名、疑似状態](../diagrams/state.ja.md#合成状態別名疑似状態)
を参照）。
mermaid.js はそれを読まず、この文は Db に何も加えません。
[fixture: state/gram-state-empty-string-alone] [fixture:
state/gram-state-empty-string-after-name] [fixture:
state/gram-state-empty-string-after-name-before-comment]

| 欄      | 型     | 意味                                                                                                  |
| ------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。一続きの空の文字列と、その間の空白。 |

子の欄はありません。

### StateLiteral

空白を含められる、引用符のないテキストです。
説明、ラベル、`as` の後や疑似状態の印の前の id、ノートのテキスト、
浮いたノートのテキスト、スタイル、`class` の文の CSS クラス、
アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                           |
| ------- | ------ | -------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
値が空白で始まるか終わるのは、mermaid.js がそれを読む別名の 2 つ目の説明だけで、
そこでは空白だけのテキストはその空白の値です
（[StateAliasDefinitionStatement](#statealiasdefinitionstatement) を参照）。
ほかのところでは、mermaid.js がテキストの両端を削り、
その周りの空白は値の一部ではなく、
テキストが空白だけなら欄は代わりに null を持ちます。

### StateIgnoredText

書き手が書き、mermaid.js が読まないテキストです。
方向の行の `direction` の前と値の後のテキスト、
別名の定義の id の後の 2 つ目の `:` からのテキスト、
本体の `{` の前か、ノートの位置のすぐ後の、`%%` からのテキスト、
mermaid.js が落とすノートの `:` の後の文字、
名前の後の行の本体の `{` の前の空の説明ブロックと `ignored-state` の単位、
そして合成状態か別名の文の欄にある state の文脈の空の文字列です。
間に空白しかない一続きの空の文字列は 1 つのノードで、
名前の後の空の文字列と、同じ本体の前の `%%` も 1 つのノードです。
独立の文である空の文字列は、代わりに
[StateIgnoredStatement](#stateignoredstatement) です。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。

# state のノード

英語版: [state.md](./state.md)

この文書は、図種 `stateDiagram` の木のノードとトークンを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/state.ja.md](../diagrams/state.ja.md) で定めます。

この図種の本文は [StateDiagram](#statediagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める範囲のテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。

**状態**は図の箱の 1 つで、その id で名指されます。
遷移は 1 つの状態から別の状態へ向かいます。
`[*]` は始まりか終わりを表します。

## ノード

### StateDiagram

| 欄     | 型                  | 意味             |
| ------ | ------------------- | ---------------- |
| `body` | StateStatement の列 | 文。ソースの順。 |

子の欄: `body`。
ヘッダーのキーワードは欄ではありません。
`stateDiagram` と `stateDiagram-v2` は同じに読まれます
（[検出](../diagrams/state.ja.md#検出) を参照）。
範囲は、ヘッダーのキーワードから図の最後のトークンまでです。

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
Db にその id の状態がなければ状態を加え、その説明を加えます。

| 欄            | 型                       | 意味                                                          |
| ------------- | ------------------------ | ------------------------------------------------------------- |
| `reference`   | StateReference           | 状態。                                                        |
| `description` | StateLiteral または null | `:` の後のテキスト。`:` がないか、その後が空白だけなら null。 |

子の欄: `reference`、`description`。
`A : ` は、Db と同じく説明を持ちません。
[fixture: state/gram-description-blank]

### StateTransitionStatement

| 欄      | 型                       | 意味                                            |
| ------- | ------------------------ | ----------------------------------------------- |
| `from`  | StateReference           | 矢印の前の状態。                                |
| `to`    | StateReference           | 矢印の後の状態。                                |
| `label` | StateLiteral または null | `:` の後のテキスト。ないか、空白だけなら null。 |

子の欄: `from`、`to`、`label`。
矢印 `-->` は `Punctuator` のトークンで、ノードではありません。
state 図の矢印はこの 1 つだけで、端の印がなく、線の種類も 1 つなので、
矢印のノードには置く欄がありません。
[fixture: state/lex-percent-in-label]

### StateReference

| 欄         | 型                              | 意味                                                    |
| ---------- | ------------------------------- | ------------------------------------------------------- |
| `state`    | Identifier または StateTerminal | 状態の id か `[*]`。Identifier の名前が Db の id です。 |
| `cssClass` | Identifier または null          | `:::` の後の CSS クラス。なければ null。                |

子の欄: `state`、`cssClass`。
[fixture: state/gram-style-separator-transition] [fixture:
state/gram-terminal-style-separator]

### StateTerminal

`[*]`。欄はありません。
始まりか終わりかは、その位置から決まります。
遷移の矢印の前か、それだけのときは始まり、矢印の後なら終わりです。
Db でのその id は、それがある合成状態から作られます
（[diagrams/state.ja.md](../diagrams/state.ja.md) を参照）。
[fixture: state/gram-terminal-alone]

### StateCompositeStatement

`state A { … }` と `state A`。

| 欄               | 型                               | 意味                                                                 |
| ---------------- | -------------------------------- | -------------------------------------------------------------------- |
| `textBeforeId`   | StateIgnoredText または null     | 名前の前の空の文字列。なければ null。                                |
| `id`             | Identifier または null           | `state` の後の名前。`state` だけなら null。                          |
| `textBeforeBody` | StateIgnoredText または null     | 本体の `{` の前の空の文字列、空の説明ブロック、`%%`。なければ null。 |
| `body`           | StateStatement の列、または null | `{` と `}` の間の文。本体がなければ null。                           |

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
本体がなければ、Db に何も加えません。
`state A`、2 つのそのような文である `state a b`、`state` だけがそうです。
[fixture: state/lex-keyword-upper-case] [fixture:
state/lex-state-without-body] [fixture: state/lex-state-two-names] [fixture:
state/lex-state-keyword-alone]

### StateAliasDefinitionStatement

`state "説明" as A`、`state "説明" as A : もう 1 つ`、
`state "説明" as A { … }`。

| 欄                      | 型                               | 意味                                                                                   |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| `textBeforeDescription` | StateIgnoredText または null     | 説明の前の空の文字列。なければ null。                                                  |
| `description`           | StringLiteral                    | 引用符の中の説明。                                                                     |
| `textAfterDescription`  | StateIgnoredText または null     | 説明の後、`as` の前の空の文字列。なければ null。                                       |
| `id`                    | StateLiteral または null         | `as` の後の id。空なら null。                                                          |
| `secondDescription`     | StateLiteral または null         | 本体がないとき、最初の `:` と 2 つ目の `:` または終わりの間のテキスト。なければ null。 |
| `textAfter`             | StateIgnoredText または null     | 本体がないとき、2 つ目の `:` からのテキスト。なければ null。                           |
| `textBeforeBody`        | StateIgnoredText または null     | 本体の `{` の前の空の説明ブロックと、`%%` からのテキスト。なければ null。              |
| `body`                  | StateStatement の列、または null | `{` と `}` の間の文。本体がなければ null。                                             |

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
`secondDescription` は、`:` がないときと、
`:` の後のテキストが空か空白だけのときに null です。
mermaid.js は、後の 2 つの場合も状態に 2 つ目の説明を与えます。
文が `:` のトークンを持つとき、Db の手順はそれをソースから読みます
（[state.ja.md](../diagrams/state.ja.md#木から要約を作る) を参照）。
[fixture: state/db-alias-colon-empty-second] [fixture:
state/db-alias-colon-spaces-second]

### StatePseudostateDefinitionStatement

`state f1 <<fork>>`、`state c1 [[choice]]`。

| 欄     | 型                       | 意味                                |
| ------ | ------------------------ | ----------------------------------- |
| `id`   | StateLiteral または null | 印の前のテキスト。空なら null。     |
| `kind` | 文字列                   | `fork`、`join`、`choice` のどれか。 |

子の欄: `id`。
id は空白を持てます。`state f 1 <<fork>>` は fork `f 1` です。
`state <<join>>` は id を持たず、Db の id は空です。
[fixture: state/lex-fork-spaced-id] [fixture: state/lex-join-empty-id]
[fixture: state/lex-choice-square-brackets]

### StateDividerStatement

合成状態の本体の中の `--` で、本体を区域に分けます。欄はありません。
[fixture: state/lex-composite-divider]

### StateNoteStatement

`note left of A : テキスト`、そして `note right of A`、その後の行のテキスト、
`end note`。

| 欄                | 型                           | 意味                                                |
| ----------------- | ---------------------------- | --------------------------------------------------- |
| `position`        | 文字列                       | `left` か `right`。                                 |
| `textBeforeState` | StateIgnoredText または null | 位置のすぐ後の `%%` からのテキスト。なければ null。 |
| `state`           | Identifier または null       | `of` の後の状態の id。空なら null。                 |
| `text`            | StateLiteral または null     | ノートのテキスト。空か空白だけなら null。           |

子の欄: `textBeforeState`、`state`、`text`。
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

### StateFloatingNoteStatement

`note "テキスト" as N1`。Db に何も加えません。
[fixture: state/lex-floating-note]

| 欄     | 型                       | 意味                                                                      |
| ------ | ------------------------ | ------------------------------------------------------------------------- |
| `text` | StateLiteral または null | 引用符の間のテキスト。すべて空白なら null。                               |
| `id`   | StateLiteral または null | `as` の後、行の終わりまでのテキスト。空なら null。Db はそれを読みません。 |

子の欄: `text`、`id`。
[fixture: state/lex-floating-note-id-spaces]
引用符は文の `Punctuator` のトークンで、どの欄にも属しません。
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

| 欄         | 型                | 意味                                       |
| ---------- | ----------------- | ------------------------------------------ |
| `cssClass` | Identifier        | `classDef` の後の CSS クラス。             |
| `styles`   | StateLiteral の列 | `,` の単位で区切ったスタイル。ソースの順。 |

子の欄: `cssClass`、`styles`。
2 つの `,` の間の空のスタイルはノードを作りません。
Db の手順は、空のものも含めて、スタイルをソースから読みます
（[state.ja.md](../diagrams/state.ja.md#木から要約を作る) を参照）。
[fixture: state/lex-classdef-percent] [fixture:
state/lex-classdef-without-styles] [fixture: state/db-classdef-empty-items]

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

| 欄       | 型                             | 意味                                               |
| -------- | ------------------------------ | -------------------------------------------------- |
| `states` | （Identifier または null）の列 | 状態の id。ソースの順。`,` の間の空の項目は null。 |
| `styles` | StateLiteral の列              | StateClassDefStatement と同じスタイル。            |

子の欄: `states`、`styles`。
2 つの `,` の間の空のスタイルはノードを作らず、
StateClassDefStatement と同じく、Db の手順はスタイルをソースから読みます。
[fixture: state/lex-style-empty-id] [fixture:
state/lex-style-without-styles] [fixture: state/db-style-empty-items]

### StateDirectionStatement

| 欄           | 型                           | 意味                                                   |
| ------------ | ---------------------------- | ------------------------------------------------------ |
| `textBefore` | StateIgnoredText または null | 方向の行の `direction` の前のテキスト。なければ null。 |
| `direction`  | 文字列                       | `TB`、`BT`、`RL`、`LR` のどれか。                      |
| `textAfter`  | StateIgnoredText または null | 方向の行の値の後のテキスト。なければ null。            |

子の欄: `textBefore`、`textAfter`。
範囲は方向の行の全体です。
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
テキストのない閉じたブロックは何も変えません
（[state.ja.md](../diagrams/state.ja.md#木から要約を作る) を参照）。

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

`scale 350 width`。Db に何も加えません。

| 欄      | 型             | 意味 |
| ------- | -------------- | ---- |
| `width` | NumericLiteral | 数。 |

子の欄: `width`。
[fixture: state/gram-scale]

### StateHideEmptyDescriptionStatement

`hide empty description`。欄はありません。Db に何も加えません。
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

| 欄      | 型     | 意味                                                     |
| ------- | ------ | -------------------------------------------------------- |
| `value` | 文字列 | その範囲のテキスト。一続きの空の文字列と、その間の空白。 |

子の欄はありません。
範囲は、一続きの最初の `"` から最後の `"` までです。

### StateLiteral

空白を含められる、引用符のないテキストです。
説明、ラベル、`as` の後や疑似状態の印の前の id、ノートのテキスト、
浮いたノートのテキスト、スタイル、`class` の文の CSS クラス、
アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                         |
| ------- | ------ | ------------------------------------------------------------ |
| `value` | 文字列 | その範囲のテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
テキストの周りの空白は範囲の外なので、値は空白で始まらず、空白で終わりません。
テキストが空白だけのところでは、欄は代わりに null を持ちます。

### StateIgnoredText

書き手が書き、mermaid.js が読まないテキストです。
方向の行の `direction` の前と値の後のテキスト、
別名の定義の id の後の 2 つ目の `:` からのテキスト、
本体の `{` の前か、ノートの位置のすぐ後の、`%%` からのテキスト、
名前の次の行の本体の `{` の前の空の説明ブロック、
そして合成状態か別名の文の欄にある state の文脈の空の文字列です。
間に空白しかない一続きの空の文字列は 1 つのノードで、
名前の後の空の文字列と、同じ本体の前の `%%` も 1 つのノードです。
独立の文である空の文字列は、代わりに
[StateIgnoredStatement](#stateignoredstatement) です。

| 欄      | 型     | 意味                 |
| ------- | ------ | -------------------- |
| `value` | 文字列 | その範囲のテキスト。 |

子の欄はありません。
範囲は、それが持つ単位のトークンを、種類を問わず含み、
それぞれは [トークン](#トークン) がその単位に与える種類を持ちます。
空の文字列の `String` のトークン、`%%` の `RawText` のトークン、
空の説明ブロックの `Keyword` のトークン `accDescr` と、
`Punctuator` のトークン `{` と `}` です。
トークンの種類は単位で決まり、それを持つノードでは決まりません。
[fixture: state/gram-empty-description-block-before-alias-body-next-line]

## トークン

トークンは、
[diagrams/state.ja.md](../diagrams/state.ja.md#字句構造) の単位から作ります。
すべて空白でない単位は、
どれも [文法](../diagrams/state.ja.md#文法) の 1 つの**項目**に属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | `header` の単位。`state`、`as`、`note`、`position`、`end note`、`click`、`href`、`classDef`、`class`、`style`、`scale`、`width`、`hide`、`accTitle`、`accDescr` の単位。疑似状態の印。`direction` と `direction-value` の単位                                                                          |
| `Identifier` | `id`、`state-name`、`class-name`、`note-id` の単位                                                                                                                                                                                                                                                     |
| `Numeric`    | `number` の単位                                                                                                                                                                                                                                                                                        |
| `String`     | `string` か `empty-string` の単位                                                                                                                                                                                                                                                                      |
| `RawText`    | `description` の単位の `:` の後のテキスト。`alias-id`、`second-description`、`pseudostate-name`、`note-text`、`floating-note-text`、`floating-note-id`、`style-text`、`css-class` の単位。`title-text`、`description-text`、`description-block-text` の単位。`direction-text` と `ignored-text` の単位 |
| `Punctuator` | `description` の単位の `:`、別名の文の `:` の単位、1 行のノートの `:` の単位、`accTitle` と `accDescr` の後の `:`。`-->`、`--`、`:::`、`[*]`、`{`、`}`、`,`。浮いたノートの `"` の単位                                                                                                                 |

コメント領域が切る `String` のトークンは、`StringFragment` のトークンになります
（[Comment](../ast.ja.md#comment) を参照）。

**トークン**は、同じ項目で同じ種類の単位が、間に何も挟まずに続く最長の並び
（`RawText` の項目では、空白を挟んでもよい）です。
トークンは端に空白を持ちません。
そのような並びの、空白でない 2 つの文字の間にディレクティブがあるときは、
[ast.ja.md](../ast.ja.md#directive) のとおり、並びはディレクティブで切られます。

- `position` の単位は、語の間の空白を含めて 1 つの `Keyword` のトークンです。
  `left of`。
  `end note` と `hide empty description` も同じです。
- 説明は、その `:` からの 1 つの単位で、2 つのトークンです。
  `:` と、周りの空白を除いたテキストです。
- 浮いたノートの `"` の単位は、2 つが続くところでも、
  それぞれ 1 つの `Punctuator` のトークンです。
  `note ""x" as N` は 3 つの `"` のトークンを持ち、
  2 つは `RawText` のトークン `x` の前に、1 つはその後にあります。
  [fixture: state/lex-floating-note-extra-quote-before-text]
- 空の説明ブロックの単位は、文の `textBeforeBody` の中でも種類を保ちます。
  `Keyword` のトークン `accDescr` と、`Punctuator` のトークン `{` と `}` で、
  StateIgnoredText の範囲の中にあります
  （[StateIgnoredText](#stateignoredtext) を参照）。
- 行の規則が無視する `;` は、
  [ast.ja.md](../ast.ja.md#トークン) の規則に従います。
  あるトークンの文字がその両側にあれば、そのトークンの中にあり、
  そうでなければそれ自体がトークンです。
  そのトークンは、その場所の文脈が `;` について読む単位の種類を持ちます。
  `;` をテキストとして読む、別名の id、タイトル、説明、説明ブロック、
  スタイル、クラス名の文脈と、複数行のノートでは `RawText` のトークンで、
  `;` が id の文字である文の文脈と合成状態の本体では、
  `Identifier` のトークンです。
  `classDef c fill:#f00;` では、スタイルは `fill:#f00` で、
  その後の `;` は `RawText` のトークンです。
  `accTitle: style:#x;` と、複数行のノートの `style:#x` の後も同じです。
  `A : style:#x;` では、説明は `style:#x` で、
  その後の `;` は `Identifier` のトークンで、状態を加えません。
  一方、行の規則が変えない `A : x;` では、`;` は状態の id です。
  `A : style:#x; B` では、`;` は説明の文字の間にあり、
  説明は `style:#x B` で、`;` はそのトークンの一部です。
  [fixture: state/tokens-classdef-ignored-semicolon] [fixture:
  state/tokens-acc-title-ignored-semicolon] [fixture:
  state/tokens-note-block-ignored-semicolon] [fixture:
  state/tokens-alias-ignored-semicolon] [fixture:
  state/tokens-description-ignored-semicolon] [fixture:
  state/tokens-composite-description-ignored-semicolon] [fixture:
  state/lex-description-then-semicolon] [fixture:
  state/tokens-description-ignored-semicolon-inside] [fixture:
  state/tokens-class-ignored-semicolon]

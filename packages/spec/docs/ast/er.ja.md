# ER のノード

英語版: [er.md](./er.md)

この文書は、図種 `er` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、
ソースの読み方と、どの文法の規則がどのノードを作るかは
[diagrams/er.ja.md](../diagrams/er.ja.md) で定めます。

この図種の本体は [ErDiagram](#erdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
値が空白で始まったり終わったりするのは、
mermaid.js が読むとおりに、その単位が空白を自分の文字として持つところだけです
（[ノード](../ast.ja.md#ノード) を参照）。
この図種では、名前の文字である U+00A0 のような ASCII
の外の空白文字で終わる名前やロールがそうです
（[空白](../diagrams/er.ja.md#単位と文脈) を参照）。
それ以外では、値の両端の空白は値の外です。

**実体**は図の箱で、名前で名付けられます。
関係は 2 つの実体を結び、両端に濃度を、ロールを持ちます。

この図種の StringLiteral は常に閉じています。
空になるのは、`A ||--o{ B : ""` のようなロールと、属性のコメントのときだけです。
実体の名前としての空の文字列は入力を拒否させ、
空のバッククォートは StringLiteral ではありません
（[属性](../diagrams/er.ja.md#属性) を参照）。
[fixture: er/gram-role-string-empty] [fixture: er/gram-comment-empty] [fixture:
er/spec-er-diagram-f4c59d78] [fixture:
er/gram-empty-backquotes-between-attributes]

## ノード

### ErDiagram

| 欄     | 型                   | 意味                 |
| ------ | -------------------- | -------------------- |
| `body` | ErStatement のリスト | 文。ソースの順です。 |

子の欄: `body`。ヘッダーのキーワードは欄ではありません。

**ErStatement** は、ErEntityStatement、ErRelationshipStatement、
ErSubgraphStatement、ErDirectionStatement、ErClassDefStatement、
ErClassStatement、ErStyleStatement、ErAccTitleStatement、ErAccDescrStatement、
ErAccDescrBlockStatement のいずれかです。

改行はどの文にも属さず、空行はノードを作りません。
以下のどのノードの子の欄も
ソースの順です（[ノード](../ast.ja.md#ノード) を参照）。

### ErEntityStatement

名前で書いた実体で、別名、クラス、属性を持つものも持たないものもあります。
`A`、`p[Person]`、`A:::c1,c2`、`A { string name }`、`p[Person]:::c { … }` です。
Db にその名前の実体がなければ実体を足し、別名、クラス、属性を与えます。

| 欄           | 型                                                    | 意味                                                                                                   |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `name`       | ErIdentifier か StringLiteral                         | 実体の名前。                                                                                           |
| `alias`      | ErIdentifier、StringLiteral、または null              | `[` と `]` の間の別名。ないときは null。                                                               |
| `cssClasses` | ErIdentifier のリスト                                 | `:::` の後の、`,` の単位で区切ったクラス。ソースの順。`:::` がないときは空。                           |
| `attributes` | （ErAttribute か ErIgnoredText）のリスト、または null | `{` と `}` の間の属性ブロックの項目。ソースの順。項目のないブロックでは空、ブロックがないときは null。 |

子の欄: `name`、`alias`、`cssClasses`、`attributes`。
名前は、`name` か `number` の単位では ErIdentifier で、その `name` は `12` や
`2.5` を含めて単位のテキストです。
`quoted-name` の単位では StringLiteral です。
別名も同じです（[実体](../diagrams/er.ja.md#実体) を参照）。
`attributes` の ErIgnoredText は、2 つの属性の間、最初の属性の前、
または最後の属性の後の `empty-backquotes` の単位で、mermaid.js は読みません
（[属性](../diagrams/er.ja.md#属性) を参照）。
[fixture: er/lex-name-unicode-characters] [fixture: er/lex-name-number]
[fixture: er/lex-quoted-name] [fixture: er/gram-alias] [fixture:
er/gram-alias-string] [fixture: er/gram-entity-classes] [fixture:
er/gram-attribute] [fixture: er/gram-block-empty] [fixture:
er/gram-alias-class-block] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-alone]

### ErAttribute

実体の属性 1 つです。`string name`、`string? middleName`、
`int id PK, FK "the key"`。

| 欄         | 型                            | 意味                                                                                                                                          |
| ---------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `dataType` | ErIdentifier か StringLiteral | 型。1 つ目の属性の語。どのノードもノードの型の欄 `type` を持つので、`type` とは名付けません（[欄の書き方](../ast.ja.md#欄の書き方) を参照）。 |
| `optional` | 真偽値                        | 型の後に `?` が続くかどうか。                                                                                                                 |
| `name`     | ErIdentifier か StringLiteral | 名前。2 つ目の属性の語。                                                                                                                      |
| `keys`     | Identifier のリスト           | 名前の後の、`,` の単位で区切ったキー。ソースの順。ないときは空。                                                                              |
| `comment`  | StringLiteral か null         | 引用符の中のコメント。ないときは null。                                                                                                       |

子の欄: `dataType`、`name`、`keys`、`comment`。
属性の語は、`word` か `tilde-word` の単位では ErIdentifier で、
`backquoted-word` の単位では StringLiteral で、その
`value` はバッククォートの間のテキストです。
`?` は単位でノードではありません。Db は型を `?` を付けて読みます。
キーは Identifier で、その `name` は `pk` や `PK`
のように書かれたとおりのキーです。
コメントは空でもよく、その値は空の文字列で、
Dbはコメントのない属性をそう読みます。
[fixture: er/gram-attribute] [fixture: er/gram-optional-type] [fixture:
er/lex-tilde-word] [fixture: er/lex-backquote-word] [fixture:
er/gram-keys-comma-space] [fixture: er/lex-key-lower-case] [fixture:
er/gram-comment] [fixture: er/gram-comment-empty] [fixture:
er/gram-attributes-keys-comment]

### ErRelationshipStatement

`A ||--o{ B : has`、`A:::c one or more to zero or one B:::d : "has many"`。
Db にその名前の実体がなければ 2 つの実体を足し、関係を足します。

| 欄             | 型                            | 意味               |
| -------------- | ----------------------------- | ------------------ |
| `left`         | ErEntityReference             | 関係の前の実体。   |
| `relationship` | ErRelationship                | 濃度と線。         |
| `right`        | ErEntityReference             | 関係の後の実体。   |
| `role`         | StringLiteral か ErIdentifier | `:` の後のロール。 |

子の欄: `left`、`relationship`、`right`、`role`。
ロールは、`string` か `quoted-name` の単位では StringLiteral、
`name` の単位では ErIdentifier です。
`string` は空でもよく、その値は空の文字列です。
[fixture: er/gram-relationship-symbols] [fixture: er/gram-role-string]
[fixture: er/gram-role-string-empty] [fixture: er/lex-role-unicode] [fixture:
er/gram-relationship-both-classes]

### ErEntityReference

関係の端です。実体の名前と、そのクラス（ないこともあります）です。

| 欄           | 型                            | 意味                                                                         |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------- |
| `name`       | ErIdentifier か StringLiteral | 実体の名前。ErEntityStatement と同じです。                                   |
| `cssClasses` | ErIdentifier のリスト         | `:::` の後の、`,` の単位で区切ったクラス。ソースの順。`:::` がないときは空。 |

子の欄: `name`、`cssClasses`。
[fixture: er/gram-relationship-left-classes] [fixture:
er/gram-relationship-right-classes] [fixture:
er/gram-relationship-string-names] [fixture:
er/gram-relationship-number-names]

### ErRelationship

関係の 2 つの実体の間の 3 つの単位です。`||--o{`、
`one or more to zero or one`、`}|..|{`、`u--o{`。

| 欄                 | 型     | 意味                                 |
| ------------------ | ------ | ------------------------------------ |
| `leftCardinality`  | string | 左の実体側の濃度。下の語のいずれか。 |
| `line`             | string | `identifying` か `non-identifying`。 |
| `rightCardinality` | string | 右の実体側の濃度。下の語のいずれか。 |

子の欄はありません。
濃度の語は `zero-or-one`、`zero-or-more`、`one-or-more`、`only-one`、
`md-parent` で、
[文の文脈](../diagrams/er.ja.md#文の文脈) の単位の名前です。
単位のつづりによりません。
`|o`、`one or zero`、`zero or one` はどれも `zero-or-one` で、
`--` と `to` はどちらも `identifying` です。
このノードに `value` はありません。
単位の間には mermaid.js が読まない空白を置け、
単位のテキストはトークンにあります。
Db は左の濃度を `cardB`、右の濃度を `cardA` と名付けます。
[fixture: er/gram-relationship-symbols] [fixture: er/lex-cardinality-words]
[fixture: er/lex-cardinality-only-one-optionally-to] [fixture:
er/lex-md-parent] [fixture: er/lex-relationship-spaces-in-spec] [fixture:
er/spec-er-diagram-7b5988ee]

### ErSubgraphStatement

`subgraph S`、`subgraph S [Title words]`、本体の文、`end`。

| 欄      | 型                                                     | 意味                                                                       |
| ------- | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| `id`    | ErIdentifier か StringLiteral                          | `subgraph` の後の名前。ErEntityStatement と同じです。                      |
| `title` | （ErIdentifier か StringLiteral）のリスト、または null | `[` と `]` の間の実体の名前。ソースの順。タイトルがないときは null。       |
| `body`  | ErStatement のリスト                                   | `end` までの文。ソースの順。ヘッダーの行の空の説明ブロックが最初に来ます。 |

子の欄: `id`、`title`、`body`。
タイトルがリストなのは、文法がそこで 1 つ以上の実体の名前を、
間に空白があってもなくても読み、
mermaid.js がそのテキストを 1つの空白文字でつなぐからです。
間の空白は値ではありません（[subgraph](../diagrams/er.ja.md#subgraph) を参照）。
Db は id を、引用符付きの名前の両端の空白を除いて取り、
タイトルを描画器が無害化したものとして取ります。これはサイトの設定に依存します。
[fixture: er/gram-subgraph] [fixture: er/gram-subgraph-title] [fixture:
er/gram-subgraph-title-string] [fixture: er/gram-subgraph-string-id] [fixture:
er/db-subgraph-string-id-trimmed] [fixture: er/db-subgraph-title-html]
[fixture: er/gram-subgraph-header-blocks] [fixture: er/gram-subgraph-nested]

### ErDirectionStatement

| 欄           | 型                    | 意味                                                       |
| ------------ | --------------------- | ---------------------------------------------------------- |
| `textBefore` | ErIgnoredText か null | 方向の行の `direction` より前のテキスト。ないときは null。 |
| `direction`  | string                | `TB`、`BT`、`RL`、`LR` のいずれか。                        |
| `textAfter`  | ErIgnoredText か null | 方向の行の値より後のテキスト。ないときは null。            |

子の欄: `textBefore`、`textAfter`。
テキストは両端の空白を除いたもので、空白しかないところでは null です。
`  direction LR` には `textBefore` がなく、
`A ||--o{ B : x direction LR` の `textBefore` は `A ||--o{ B : x` です。
方向は値を大文字にしたものです。`direction lr` は `LR` です。
[fixture: er/gram-direction] [fixture: er/lex-direction-lower-case] [fixture:
er/lex-direction-leading-space] [fixture:
er/lex-direction-line-after-relationship] [fixture:
er/lex-direction-line-text-after] [fixture: er/lex-direction-value-glued]

### ErClassDefStatement

`classDef a,b fill:#f9f,stroke:#333`。

| 欄           | 型                    | 意味                                                          |
| ------------ | --------------------- | ------------------------------------------------------------- |
| `cssClasses` | ErIdentifier のリスト | `classDef` の後の、`,` の単位で区切ったクラス名。ソースの順。 |
| `styles`     | ErLiteral のリスト    | `,` の単位で区切ったスタイル。ソースの順。                    |

子の欄: `cssClasses`、`styles`。
クラス名は ErIdentifier で、その `name` は `style-text` の単位のテキストです。
スタイルは単位のテキストをつないだものです（[ErLiteral](#erliteral) を参照）。
スタイルのリストが空になることはありません。スタイルのない
`classDef` は拒否されます。
[fixture: er/gram-classdef] [fixture: er/gram-classdef-two-names] [fixture:
er/lex-classdef-style-spaces] [fixture: er/gram-classdef-without-styles]

### ErClassStatement

`class A,B c1,c2`。

| 欄           | 型                    | 意味                                                                     |
| ------------ | --------------------- | ------------------------------------------------------------------------ |
| `entities`   | ErIdentifier のリスト | `class` の後の、`,` の単位で区切った実体か subgraph の名前。ソースの順。 |
| `cssClasses` | ErIdentifier のリスト | `,` の単位で区切ったクラス。ソースの順。                                 |

子の欄: `entities`、`cssClasses`。
それぞれは `name` の単位の ErIdentifier なので、
どちらのリストも数や引用符付きの名前を持ちません。
[fixture: er/gram-class] [fixture: er/gram-class-two-lists] [fixture:
er/db-class-subgraph]

### ErStyleStatement

`style A,B fill:red,stroke:blue`。

| 欄         | 型                    | 意味                                                                     |
| ---------- | --------------------- | ------------------------------------------------------------------------ |
| `entities` | ErIdentifier のリスト | `style` の後の、`,` の単位で区切った実体か subgraph の名前。ソースの順。 |
| `styles`   | ErLiteral のリスト    | スタイル。ErClassDefStatement と同じです。                               |

子の欄: `entities`、`styles`。
名前は ErIdentifier で、その `name` は `style-text` の単位のテキストです。
[fixture: er/gram-style] [fixture: er/gram-style-two-names] [fixture:
er/db-style-subgraph]

### ErAccTitleStatement

`accTitle:` の文とそのテキストです。

| 欄      | 型        | 意味                                             |
| ------- | --------- | ------------------------------------------------ |
| `value` | ErLiteral | `accTitle:` の後、その行の終わりまでのテキスト。 |

子の欄: `value`。
`:` の後の空白は改行を含めて一緒に読まれるので、
テキストはそれのある最初の行で始まり、
値が null になることはありません。後ろに何もない `accTitle:` は拒否されます。
値は両端の空白を除いたテキストです。
[fixture: er/gram-acc-title] [fixture: er/lex-acc-title-blank-line-then-name]
[fixture: er/lex-acc-title-at-end] [fixture: er/db-acc-title-trailing-space]

### ErAccDescrStatement

`accDescr:` の文とそのテキストです。

| 欄      | 型        | 意味                                             |
| ------- | --------- | ------------------------------------------------ |
| `value` | ErLiteral | `accDescr:` の後、その行の終わりまでのテキスト。 |

子の欄: `value`。ErAccTitleStatement と同じく、
値が nullになることはありません。
[fixture: er/gram-acc-descr] [fixture: er/lex-acc-descr-at-end]

### ErAccDescrBlockStatement

`accDescr { … }` の文とそのテキスト、またはテキストのないもの、
つまり何も変えない空の説明ブロックです。
ブロックはつねに閉じています。テキストはその中で終われません。

| 欄      | 型                | 意味                                                                                  |
| ------- | ----------------- | ------------------------------------------------------------------------------------- |
| `value` | ErLiteral か null | `accDescr {` と `}` の間の、両端の空白を除いたテキスト。間に空白しかないときは null。 |

子の欄: `value`。
`accDescr {}`、`accDescr { }`、空行のブロックは値 null で、何も変えません。
そのようなブロックが文になるのは文が始まるところだけで、
文の中のブロックは入力を拒否させます
（[空の説明ブロック](../diagrams/er.ja.md#空の説明ブロック) を参照）。
[fixture: er/gram-acc-descr-block] [fixture: er/gram-acc-descr-block-multiline]
[fixture: er/gram-acc-descr-block-empty] [fixture:
er/db-acc-descr-block-whitespace-only] [fixture:
er/gram-empty-description-block-between-names] [fixture:
er/div-empty-description-block-in-relationship] [fixture:
er/lex-acc-descr-block-unclosed]

### ErIdentifier

引用符なしで書いた名前です。
実体の名前と別名、ロール、クラス名、`style` や `classDef` の後の名前、
属性の型と名前で、
`name`、`number`、`style-text`、`word`、`tilde-word` の単位です。

| 欄     | 型     | 意味                                                                       |
| ------ | ------ | -------------------------------------------------------------------------- |
| `name` | string | 書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。空白を含みます。 |

子の欄はありません。
[Identifier](../ast.ja.md#identifier) ではなく図の名前のノードなのは、
これらの位置が名前の中に空白を許すからです。
`name` と `style-text` は U+00A0 や U+2028 のような ASCII の外の空白文字を持て
（[空白](../diagrams/er.ja.md#単位と文脈) を参照）、
チルダの語はどの空白も持てます。
`A`、U+00A0、`B` は 1 つの実体で、`List~a b~ c` の型は `List~a b~`、
`12` は `name` が `12` の実体です。
`word` は ASCII の空白と U+00A0 を持ちませんが、
それ以外の ASCII の外の空白文字を最初の文字の後に持てます
（[属性ブロックの文脈](../diagrams/er.ja.md#属性ブロックの文脈) を参照）。
`string name` の型は `string` です。
[fixture: er/lex-name-nbsp] [fixture: er/lex-name-line-separator] [fixture:
er/lex-tilde-space-inside] [fixture: er/lex-name-number] [fixture:
er/gram-attribute] [fixture: er/lex-tilde-run-two-words]

### ErLiteral

空白を含みうる引用符なしのテキストです。スタイルと、
アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                                                                               |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `value` | string | 書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。スタイルでは、単位の書かれたテキストを順につないだもの。 |

子の欄はありません。
スタイルの値は、[Identifier](../ast.ja.md#identifier) の名前と同じく、
単位の書かれたテキストを順につないだものです。
mermaid.js はスタイルの単位の間の空白を落とすので、
`classDef a fill : #f9f` はスタイル `fill:#f9f` を持ち、
`classDef a fill:red stroke:blue` は 1 つのスタイル
`fill:redstroke:blue` を持ちます。
アクセシビリティのテキストは、mermaid.js が取り除く両端の空白なしで読まれ、
空白だけになることはありません。
[fixture: er/lex-classdef-style-spaces] [fixture: er/lex-classdef-styles-joined]
[fixture: er/gram-acc-title] [fixture: er/db-acc-title-trailing-space]
[fixture: er/lex-acc-descr-block-trailing-spaces]

### ErIgnoredText

書き手が書いたが mermaid.js が読まないテキストです。
方向の行の `direction` より前と値より後のテキスト、
および 2 つの属性の間、最初の属性の前、最後の属性の後にある属性ブロックの
`empty-backquotes` の単位です。
間に空白しかない `empty-backquotes` の単位の並びは 1 つのノードです。

| 欄      | 型     | 意味                                                          |
| ------- | ------ | ------------------------------------------------------------- |
| `value` | string | 書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
[fixture: er/lex-direction-line-text-before] [fixture:
er/lex-direction-line-text-after] [fixture:
er/gram-empty-backquotes-between-attributes] [fixture:
er/gram-empty-backquotes-twice]

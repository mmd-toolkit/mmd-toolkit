# class のノード

英語版: [class.md](./class.md)

この文書は、図種 `classDiagram` の木のノードとトークンを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/class.ja.md](../diagrams/class.ja.md) で定めます。

この図種の本文は [ClassDiagram](#classdiagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める範囲のテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではなく、
変換は [diagrams/class.ja.md](../diagrams/class.ja.md#木から要約を作る)
の Db の正規化が、値を使うところで行います。
ノードの範囲の外の空白は、その値に入りません。
それが Db に効くのは 3 か所で、
メンバーの名前の前の空白、注釈の行の中の空白、スタイルのテキストです。
そこでは Db の正規化がソースを読みます。

**クラス**は図の箱の 1 つで、クラスの名前で名指されます。
この語は CSS のクラスを指しません。
それは全体を通して CSS クラスと呼びます。

## ノード

### ClassDiagram

| 欄     | 型                  | 意味             |
| ------ | ------------------- | ---------------- |
| `body` | ClassStatement の列 | 文。ソースの順。 |

子の欄: `body`。
ヘッダーのキーワードは欄ではありません。
範囲は、ヘッダーのキーワードから図の最後のトークンまでです。

**ClassStatement** は、ClassDeclaration、ClassMemberStatement、
ClassNameStatement、ClassAnnotationStatement、ClassRelationStatement、
ClassNamespaceStatement、ClassNoteStatement、ClassCallbackStatement、
ClassLinkStatement、ClassStyleStatement、ClassCssClassStatement、
ClassClassDefStatement、ClassDirectionStatement、ClassAccTitleStatement、
ClassAccDescrStatement、ClassAccDescrBlockStatement のどれかです。

文を終える改行はどの文にも属さず、空の行はノードを作りません。
下のどのノードの子の欄もソースの順です（[ノード](../ast.ja.md#ノード) を参照）。

### ClassDeclaration

`class` の文です。

| 欄           | 型                            | 意味                                                                   |
| ------------ | ----------------------------- | ---------------------------------------------------------------------- |
| `name`       | ClassName                     | `class` の後のクラスの名前。                                           |
| `label`      | StringLiteral または null     | `[` と `]` の間の文字列。なければ null。                               |
| `cssClass`   | Identifier または null        | `:::` の後の CSS クラス。なければ null。                               |
| `annotation` | ClassAnnotation または null   | 名前の後の `<<` と `>>` の間の注釈。なければ null。                    |
| `members`    | ClassMember の列、または null | `{` と `}` の間の本体のメンバーの行。ソースの順。本体がなければ null。 |

**ClassMember** は、ClassMethod、ClassAttribute、ClassAnnotation のどれかです。

子の欄: `name`、`label`、`cssClass`、`annotation`、`members`。
`cssClass` と `annotation` は、多くとも一方だけが設定されます。
空白だけのメンバーの行はノードを作らないので、
`class A { }` は空の列を持ち、`class A` は null を持ちます。
[fixture: class/gram-class-css-class-blank-body] [fixture:
class/spec-class-diagram-4eb71456]

### ClassMemberStatement

メンバーを加える、ラベルのあるクラスの名前です。`A : +int x`。

| 欄       | 型                      | 意味                                                                    |
| -------- | ----------------------- | ----------------------------------------------------------------------- |
| `class`  | ClassName               | `:` の前のクラスの名前。                                                |
| `member` | ClassMember または null | `:` の後のメンバーの行。`A : ` のように `:` の後がすべて空白なら null。 |

子の欄: `class`、`member`。
`A : ` はクラス A を加え、メンバーを加えません。
[fixture: class/gram-member-statement] [fixture:
class/db-member-statement-blank]

### ClassNameStatement

ラベルなしで行にあるクラスの名前だけの文で、何も変えません。`Foo`。

| 欄     | 型        | 意味           |
| ------ | --------- | -------------- |
| `name` | ClassName | クラスの名前。 |

子の欄: `name`。
[fixture: class/gram-name-alone]

### ClassAnnotationStatement

`<<interface>> A`。

| 欄           | 型              | 意味                                            |
| ------------ | --------------- | ----------------------------------------------- |
| `annotation` | ClassAnnotation | `<<` から `>>` までの注釈。                     |
| `class`      | ClassName       | その後のクラスの名前。Db はそれに注釈を付ける。 |

子の欄: `annotation`、`class`。
[fixture: class/spec-class-diagram-280c04be]

### ClassRelationStatement

| 欄                | 型                        | 意味                                                                  |
| ----------------- | ------------------------- | --------------------------------------------------------------------- |
| `from`            | ClassName                 | 矢印の前のクラスの名前。                                              |
| `fromCardinality` | StringLiteral または null | `from` と矢印の間の文字列。なければ null。                            |
| `arrow`           | ClassArrow                | 矢印。                                                                |
| `toCardinality`   | StringLiteral または null | 矢印と `to` の間の文字列。なければ null。                             |
| `to`              | ClassName                 | 矢印の後のクラスの名前。                                              |
| `label`           | ClassLiteral または null  | `:` の後のラベルのテキスト。`:` は含まない。ないか空白だけなら null。 |

子の欄: `from`、`fromCardinality`、`arrow`、`toCardinality`、`to`、`label`。
多重度は空の文字列でもかまわず、Db はそれをないものとして読みます。
`A "" --> B` は、値が空の StringLiteral を持ちます。
[fixture: class/gram-cardinality-empty] [fixture:
class/spec-class-diagram-840a462d]

### ClassArrow

関係の矢印です。省略できる関係の端を持つ線です。

| 欄            | 型     | 意味                                       |
| ------------- | ------ | ------------------------------------------ |
| `value`       | 文字列 | そのトークンのテキストを順につないだもの。 |
| `startMarker` | 文字列 | 線の前の関係の端。下を参照。               |
| `line`        | 文字列 | `--` は `solid`、`..` は `dotted`。        |
| `endMarker`   | 文字列 | 線の後の関係の端。下を参照。               |

記号の語は、`<|` と `|>` は `triangle`、`*` は `filled-diamond`、
`o` は `hollow-diamond`、`<` と `>` は `arrow`、`()` は `lollipop`、
関係の端がなければ `none` です。
各関係の端と線は、それぞれ単位でありトークンで、間に空白を置けます。
範囲は最初のものから最後のものまでで、`value` は空白を含みません。
`A <|  --  * B` の値は `<|--*` で、始まりの記号は `triangle`、
線は `solid`、終わりの記号は `filled-diamond` です。
[fixture: class/gram-relation-spaces]
語は描かれる記号を表し、mermaid.js が関係を何と呼ぶかを表しません。
Db では `*` は composition、`o` は aggregation で、
`()` は、反対の端に関係の端がないとき、
自分の端の名前を、反対の端のクラスのインターフェースにします。
両方の端に関係の端があるときは、どちらの名前もクラスです
（[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
[fixture: class/docs-syntax-class-diagram-b06c5b3c] [fixture:
class/db-lollipop-both]
子の欄はありません。

### ClassNamespaceStatement

| 欄       | 型                                                                             | 意味                                                                                    |
| -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `prefix` | Identifier または null                                                         | [ClassName](#classname) と同じく、バッククォートの名前の前の名前の部分。なければ null。 |
| `name`   | Identifier または StringLiteral                                                | 名前空間の名前。その名前の部分か、そのバッククォートの名前。                            |
| `label`  | StringLiteral または null                                                      | `[` と `]` の間の文字列。なければ null。                                                |
| `body`   | （ClassDeclaration、ClassNoteStatement、ClassNamespaceStatement のどれか）の列 | 本体の項目。ソースの順。                                                                |

子の欄: `prefix`、`name`、`label`、`body`。
`namespace a.b` は Identifier `a.b` を持ちます。
[fixture: class/spec-class-diagram-95acf03b] [fixture:
class/db-namespace-nested]

### ClassNoteStatement

| 欄      | 型                    | 意味                                                      |
| ------- | --------------------- | --------------------------------------------------------- |
| `class` | ClassName または null | `note for` の後のクラスの名前。`note` のノートでは null。 |
| `text`  | StringLiteral         | ノートのテキスト。                                        |

子の欄: `class`、`text`。
[fixture: class/db-note-for-undefined-class] [fixture:
class/db-note-text-spaces]

### ClassCallbackStatement

`callback` の文か、`call` のある `click` の文です。

| 欄          | 型                              | 意味                                                                       |
| ----------- | ------------------------------- | -------------------------------------------------------------------------- |
| `class`     | ClassName                       | `callback` か `click` の後のクラスの名前。                                 |
| `callback`  | StringLiteral または Identifier | 関数名。クラスの名前の後の文字列か、`call` の後の `callback-name` の単位。 |
| `arguments` | ClassLiteral または null        | `call` の後の `(` と `)` の間のテキスト。なければ null。                   |
| `tooltip`   | StringLiteral または null       | 最後の文字列。なければ null。                                              |

子の欄: `class`、`callback`、`arguments`、`tooltip`。
どちらのキーワードを書いたかは、トークン（`callback` か `click`）で分かります。
`click A call fn()` では、`(` と `)` は文のトークンで、
`arguments` は null です。
[fixture: class/spec-class-diagram-6fe56b41] [fixture:
class/db-callback-names-comma]

### ClassLinkStatement

`link` の文か、`href` のある `click` の文です。

| 欄        | 型                        | 意味                                                                 |
| --------- | ------------------------- | -------------------------------------------------------------------- |
| `class`   | ClassName                 | `link` か `click` の後のクラスの名前。                               |
| `url`     | StringLiteral             | URL。                                                                |
| `tooltip` | StringLiteral または null | 2 つ目の文字列。なければ null。                                      |
| `target`  | 文字列または null         | 書いたとおりの `_self`、`_blank`、`_parent`、`_top`。なければ null。 |

子の欄: `class`、`url`、`tooltip`。
[fixture: class/db-click-href] [fixture: class/gram-link-tooltip-empty]

### ClassStyleStatement

| 欄       | 型                | 意味                                       |
| -------- | ----------------- | ------------------------------------------ |
| `id`     | Identifier        | `style` の後の語。                         |
| `styles` | ClassLiteral の列 | `,` の単位で区切ったスタイル。ソースの順。 |

子の欄: `id`、`styles`。
スタイルのラベルの中の `,` は、木では 2 つのスタイルを分けません。
Db がテキストを各 `,` で分けます
（[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
`style A fill:#f00,stroke:#333` は、
木では 1 つ、Db では 2 つのスタイルを持ちます。
[fixture: class/gram-style-dash-in-label] [fixture: class/db-style-spaces]

### ClassCssClassStatement

| 欄         | 型            | 意味                                                            |
| ---------- | ------------- | --------------------------------------------------------------- |
| `idList`   | StringLiteral | `cssClass` の後の文字列。Db が `,` で分けるクラスの名前の一覧。 |
| `cssClass` | Identifier    | CSS クラス。                                                    |

子の欄: `idList`、`cssClass`。
[fixture: class/db-css-class-list-space]

### ClassClassDefStatement

| 欄           | 型                | 意味                                    |
| ------------ | ----------------- | --------------------------------------- |
| `cssClasses` | Identifier の列   | `,` で区切った CSS クラス。ソースの順。 |
| `styles`     | ClassLiteral の列 | ClassStyleStatement と同じスタイル。    |

子の欄: `cssClasses`、`styles`。
[fixture: class/spec-class-diagram-styles-2057adab]

### ClassDirectionStatement

| 欄           | 型                           | 意味                                                                            |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------- |
| `textBefore` | ClassIgnoredText または null | 方向の行の、`direction` の前のテキスト。ない（空か、すべて空白の）ときは null。 |
| `direction`  | 文字列                       | `TB`、`BT`、`RL`、`LR` のどれか。                                               |
| `textAfter`  | ClassIgnoredText または null | 方向の行の、値の後のテキスト。ないときは null。                                 |

子の欄: `textBefore`、`textAfter`。
範囲は方向の行の全体です。
`class A direction LR` は `direction` の前のテキスト `class A` を、
`direction TBX` は値の後のテキスト `X` を持ちます。
[fixture: class/lex-direction-line-class-statement] [fixture:
class/lex-direction-line-value-then-text]

### ClassAccTitleStatement

| 欄      | 型           | 意味                                           |
| ------- | ------------ | ---------------------------------------------- |
| `value` | ClassLiteral | `accTitle:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。
`:` の後の空白は、改行も含めてそれと一緒に読まれるので、
テキストは次の行にあってもかまいません。
[fixture: class/lex-acc-title-next-line]

### ClassAccDescrStatement

`accDescr:` の文です。

| 欄      | 型           | 意味                                           |
| ------- | ------------ | ---------------------------------------------- |
| `value` | ClassLiteral | `accDescr:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。
[fixture: class/db-acc-title-spaces]

### ClassAccDescrBlockStatement

`accDescr {` の文です。

| 欄      | 型                       | 意味                                                   |
| ------- | ------------------------ | ------------------------------------------------------ |
| `value` | ClassLiteral または null | `{` と `}` の間のテキスト。空の説明ブロックでは null。 |

子の欄: `value`。
空の説明ブロックが文になるのは、文の始まりにあり、
同じ行に別の文が続くときだけです
（[空の説明ブロック](../diagrams/class.ja.md#空の説明ブロック) を参照）。
[fixture: class/spec-class-diagram-0926d7aa] [fixture:
class/gram-empty-description-block-then-statement]

### ClassName

クラスの名前です。
class の文、関係の両端、`note for`、`click`、`callback`、`link` の後にあります。

| 欄        | 型                              | 意味                                                                          |
| --------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `prefix`  | Identifier または null          | バッククォートの名前の前に書いた名前の部分。なければ null。                   |
| `name`    | Identifier または StringLiteral | 名前の部分か、バッククォートの名前。                                          |
| `generic` | ClassLiteral または null        | ジェネリクスの型の 2 つの `~` の間のテキスト。ないか、空か空白だけなら null。 |

子の欄: `prefix`、`name`、`generic`。
間に空白か `.` を置いた名前の部分は 1 つの Identifier で、
その名前は空白を含みません（[Identifier](../ast.ja.md#identifier) を参照）。
`class Foo Bar` は Identifier `FooBar` を、
`class a.b.C` は Identifier `a.b.C` を持ちます。
[fixture: class/gram-name-dots]
バッククォートの名前は StringLiteral です。
``class `Odd Name` `` は値が `Odd Name` の StringLiteral を持ちます。
バッククォートの名前の前に名前の部分があれば、それが `prefix` です。
``class A.`b c` `` は、prefix `A.` と StringLiteral `b c` を持ちます。
`class A~~` は 2 つの `~` のトークンを持ち、generic は持ちません。
[fixture: class/gram-name-spaces] [fixture:
class/docs-syntax-class-diagram-01f18827] [fixture:
class/gram-name-prefix-backquoted] [fixture: class/gram-generic-empty-at-end]
[fixture: class/db-generic-type]
Db のクラスの id は、どの欄でもありません。
それは、接頭を含めて、書かれた名前の最初の `~` の前までです
（[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
``class A.`b c` `` は名前 `b c` と id `A.b c` を、
``class `a~b` `` は名前 `a~b`、id `a`、型 `b` を持ちます。
[fixture: class/db-backquoted-name-tilde]
閉じていないバッククォートの名前は、閉じの引用符のない StringLiteral です
（[StringLiteral](../ast.ja.md#stringliteral) を参照）。
[fixture: class/lex-backquote-unclosed]

### ClassMethod

[メンバーの行](../diagrams/class.ja.md#メンバーの行) のとおりに分けた、
括弧のあるメンバーの行です。

| 欄           | 型                           | 意味                                                                                       |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------------ |
| `visibility` | 文字列                       | `+` は `public`、`-` は `private`、`#` は `protected`、`~` は `package`、なければ `none`。 |
| `name`       | ClassLiteral または null     | `member-name` の単位。なければ null。                                                      |
| `parameters` | ClassLiteral または null     | `parameters` の単位。なければ null。                                                       |
| `returnType` | ClassLiteral または null     | `return-type` の単位。なければ null。                                                      |
| `classifier` | 文字列                       | `$` は `static`、`*` は `abstract`、なければ `none`。                                      |
| `textBefore` | ClassIgnoredText または null | mermaid.js が読む部分の前のテキスト。下を参照。なければ null。                             |
| `textAfter`  | ClassIgnoredText または null | mermaid.js が読む部分の後のテキスト。下を参照。なければ null。                             |

子の欄: `textBefore`、`name`、`parameters`、`returnType`、`textAfter`。
可視性と分類子の記号、`(`、`)` は `Punctuator` のトークンで、欄の語になります。
`+foo(a: int) List~T~$` は、可視性 `public`、名前 `foo`、引数 `a: int`、
戻り値の型 `List~T~`、分類子 `static` を持ちます。
[fixture: class/tokens-method-fields] [fixture: class/lex-member-classifiers]
[fixture: class/lex-member-method-nested-parentheses]
読まれないテキストがあるのは、行が U+2028 か U+2029 を持つときだけです
（[メンバーの行](../diagrams/class.ja.md#メンバーの行) を参照）。
[fixture: class/lex-member-method-line-separator-before] [fixture:
class/lex-member-method-line-separator-after]

`name` と `returnType` の値は、端に空白を持ちません。
Db は、代わりに 2 つの空白の並びをソースから読みます。
メンバーの名前のテキストが空白で始まるときの名前の前の空白 1 つと、
戻り値の型とそれを終える分類子の記号の間の空白です
（[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
[fixture: class/lex-member-method-segment-space-before-name] [fixture:
class/db-method-return-type-space-before-classifier]

### ClassAttribute

括弧のないメンバーの行です。

| 欄           | 型                       | 意味                                  |
| ------------ | ------------------------ | ------------------------------------- |
| `visibility` | 文字列                   | ClassMethod と同じ。                  |
| `name`       | ClassLiteral または null | `member-name` の単位。なければ null。 |
| `classifier` | 文字列                   | ClassMethod と同じ。                  |

子の欄: `name`。
[fixture: class/db-member-name-space] [fixture:
class/lex-member-annotation-unclosed]

### ClassAnnotation

注釈です。`<<interface>>`。

| 欄     | 型                                    | 意味                                                 |
| ------ | ------------------------------------- | ---------------------------------------------------- |
| `name` | Identifier、ClassLiteral、または null | `<<` と `>>` の間のテキスト。空か空白だけなら null。 |

子の欄: `name`。
範囲は `<<` から `>>` までです。
class の文の名前の後と注釈の文では、
文法は `<<` と `>>` の間に名前の部分 1 つを許すので、名前は Identifier です。
メンバーの行としては、空白を含むどんなテキストでもよいので、ClassLiteral です。
本体の `<< y z >>` の名前は `y z` で、Db はその周りの空白を保ちます
（[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
[fixture: class/spec-class-diagram-280c04be] [fixture:
class/db-member-annotation-spaces]

### ClassLiteral

空白を含みうる、引用符のないテキストです。
関係のラベル、ジェネリクスの型、メンバーの行の部分、コールバックの引数、
スタイル、アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                         |
| ------- | ------ | ------------------------------------------------------------ |
| `value` | 文字列 | その範囲のテキスト（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
テキストの周りの空白は範囲の外なので、値は空白で始まらず、空白で終わりません。
flowchart と同じく、リテラルはいつもトークンを持ちます。
テキストがすべて空白のところでは、欄は代わりに null を持ち、
Db がその空白を要るところでは、単位から読みます
（[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
空白だけの関係のラベル、ジェネリクスの型、注釈は null です。
`A --> B : `、`class A~ ~`、本体の `<<  >>` がそうです。
空白だけの関係のラベルも、Db には空のタイトルを与え、
それは文の `:` のトークンが示します。
[fixture: class/tokens-relation-label-blank] [fixture:
class/tokens-generic-blank] [fixture: class/tokens-annotation-blank]

### ClassIgnoredText

書き手が書き、mermaid.js が読まないテキストです。
方向の行の `direction` の前と値の後のテキストと、
方法の行の、mermaid.js が読む部分の周りの部分です。

| 欄      | 型     | 意味                 |
| ------- | ------ | -------------------- |
| `value` | 文字列 | その範囲のテキスト。 |

子の欄はありません。

## トークン

トークンは、
[diagrams/class.ja.md](../diagrams/class.ja.md#字句構造)
の単位から作ります。
すべて空白でない単位は、
どれも [文法](../diagrams/class.ja.md#文法) の 1 つの**項目**に属し、
この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` の単位。`class`、`namespace`、`style`、`classDef`、`cssClass`、`callback`、`link`、`click`、`note for`、`note`、`href`、`call`、`accTitle`、`accDescr` の単位。`direction` と `direction-value` の単位。`link-target` の単位                                                                             |
| `Identifier` | バッククォートの名前の前にあるか、バッククォートの名前のない、クラスの名前や名前空間の名前の、名前の部分と `.` の単位。`style` の後の `word`。`classDef` の文の各 `word`。`cssClass` の文の `word`。文の `:::` の後や `<<` と `>>` の間の名前の部分。`callback-name` の単位                                       |
| `String`     | `string` と `backquoted` の単位                                                                                                                                                                                                                                                                                   |
| `RawText`    | `generic-text` の単位。`label` の単位の `:` の後のテキスト。`member-name`、`parameters`、`return-type`、`annotation-name` の単位。`callback-arguments` の単位。スタイル（そのすべての単位）。`title-text`、`description-text`、`description-block-text` の単位。`direction-text` の単位。方法の行の読まれない部分 |
| `Punctuator` | `label` の単位の `:` と、`accTitle` と `accDescr` の後の `:`。`{`、`}`、`[`、`]`、`:::`、`<<`、`>>`、`~`、`(`、`)`、`,`。各関係の端と線。`visibility` と `classifier` の単位                                                                                                                                      |

**トークン**は、同じ項目で同じ種類の単位が、間に何も挟まずに続く最長の並び
（スタイルとほかの `RawText` の項目では、空白を挟んでもよい）から、
両端の空白を除いたものです。
そのような並びの空白でない 2 つの文字の間にディレクティブがあれば、
並びはディレクティブのところで切られます。
各断片から両端の空白を除いたものがトークンで、
断片の間のディレクティブは、それ自体が `Directive` のトークンです
（[ast.ja.md](../ast.ja.md#directive) を参照）。
1 つの単位の中のディレクティブは、単位が `RawText` か `Identifier` でなければ、
入力を拒否させます
（[単位の中のディレクティブ](../diagrams/class.ja.md#単位の中のディレクティブ)
を参照）。

- 名前の部分からなるクラスの名前は、
  間に空白のない並びごとに 1 つのトークンです。
  `Foo-Bar` と `a.b.C` はそれぞれ 1 つのトークンで、
  `class Foo Bar` は 2 つのトークン `Foo` と `Bar` と、
  Identifier `FooBar` を持ちます。
  [fixture: class/gram-name-spaces] [fixture: class/gram-name-dash-spaces]
- ラベルは、その `:` から始まる 1 つの単位で、2 つのトークンです。
  `:` と、周りの空白を除いたテキストです。
  メンバーの文では、そのテキストはメンバーの行で、
  その部分のトークンに分かれます。
  [fixture: class/lex-label-percent] [fixture: class/gram-member-statement]
- スタイルは、中の空白を含めて 1 つの `RawText` のトークンで、
  `classDef` の文の各スタイルも同じです。
  `,` の単位は 2 つのスタイルを分けます。
  `style A bold,italic` は、スタイルのトークン `bold` と `italic` と、
  その間の `,` のトークンを持ちます。
  ラベルの中の `,` はスタイルの一部です。
  `style A fill : #f00 , stroke-width: 2px` は 1 つのスタイルのトークンです。
  `,` がラベル `: #f00 , stroke-width` の中にあるからで、
  Db はそのテキストを `,` で分けます。
  [fixture: class/tokens-style-comma-unit] [fixture: class/db-style-spaces]
- `call` のあるクリックの文では、`(` と `)` は文に属します。
  `call` のトークンと `(` と `)` のトークンは、その範囲の中にあります。
- ジェネリクスの型の 2 つの `~` は、間に何もなくても、
  ClassName の `Punctuator` のトークンです。
- 関係の端と線の単位は、間に空白がなくても、
  それぞれ 1 つの `Punctuator` のトークンです。
  `<|--` は 2 つのトークン `<|` と `--` です。
- 閉じていないバッククォートの名前は、
  ソースの、空白でも行終端でもない最後の文字までの、
  1 つの `String` のトークンです。
  その後の空白と改行はどのトークンにも属さず、Db はそれを単位から読みます
  （[木から要約を作る](../diagrams/class.ja.md#木から要約を作る) を参照）。
  [fixture: class/tokens-backquote-unclosed-trailing-whitespace]
- 行の規則が無視する `;` は、[ast.ja.md](../ast.ja.md#トークン) の規則に従います。
  あるトークンの文字がその両側にあれば、そのトークンの中にあり、
  そうでなければそれ自体がトークンです。
  そのトークンは、`;` をテキストとして読むタイトル、説明、説明ブロック、
  メンバーの文脈では `RawText` のトークンで、
  字句解析器のどの規則も `;` を読まないほかのところでは、
  `Punctuator` のトークンです。
  `style A fill:#f00;` と `classDef c fill:#f00;` では、
  スタイルは `fill:#f00` で、
  その後の `;` は、前に空白があっても `Punctuator` のトークンです。
  `accTitle: style:#x;` とメンバーの行 `+x style:#a;` では、
  テキストの後の `;` は `RawText` のトークンです。
  [fixture: class/tokens-style-ignored-semicolon] [fixture:
  class/tokens-style-space-ignored-semicolon] [fixture:
  class/tokens-class-def-ignored-semicolon] [fixture:
  class/tokens-acc-title-ignored-semicolon] [fixture:
  class/tokens-member-ignored-semicolon]

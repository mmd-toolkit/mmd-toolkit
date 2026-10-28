# class のノード

英語版: [class.md](./class.md)

この文書は、図種 `classDiagram` の木のノードを定めます。
木の共通の部分は [ast.ja.md](../ast.ja.md) で定めます。
ソースの読み方と、どの文法の規則がどのノードを作るかは、
[diagrams/class.ja.md](../diagrams/class.ja.md) で定めます。

この図種の本文は [ClassDiagram](#classdiagram) です。
欄の値は、[ast.ja.md](../ast.ja.md#ノード) が定める値の書かれたテキストとして、
書き手が書いたものを保ちます。
[common.ja.md](../common.ja.md#ソースの読み方) の変換した形ではありません。
値が空白で始まるか終わるのは、値の単位がそれを自身の文字として持ち、
mermaid.js がそれを読むところだけです（[ノード](../ast.ja.md#ノード) を参照）。
この図種では、ジェネリクスの型の空白、メンバーの行の注釈の空白、
空白で始まるメンバーの名前の始まりの空白、
戻り値の型を終える分類子の記号の前の空白、
閉じていないバッククォートの名前の終わりの空白、
`call` の後のコールバックの名前の終わりとその引数の両端の空白です（[ClassName](#classname)、
[ClassMethod](#classmethod)、 [ClassAnnotation](#classannotation)、
[ClassLiteral](#classliteral) を参照）。
ほかのところでは、値の両端の空白は値の外です。

**クラス**は図の箱の 1 つで、クラスの名前で名指されます。
この語は CSS のクラスを指しません。
それは全体を通して CSS クラスと呼びます。

この図種の StringLiteral は、
テキストがその中で終わるバッククォートの名前を除いて、
閉じています（[StringLiteral](../ast.ja.md#stringliteral) を参照）。
空になるのは、関係の多重度と tooltip のときだけです。
それ以外の空の文字列と、空のバッククォートの名前は、
入力を拒否させます（[既知の差異](../diagrams/class.ja.md#既知の差異) を参照）。 [fixture: class/lex-backquote-unclosed]
[fixture: class/gram-cardinality-empty]
[fixture: class/gram-link-tooltip-empty]
[fixture: class/gram-callback-tooltip-empty] [fixture:
class/gram-click-call-tooltip-empty] [fixture:
class/gram-click-href-tooltip-empty] [fixture:
class/div-empty-string-statement-start] [fixture:
class/div-empty-backquoted-in-name]

## ノード

### ClassDiagram

| 欄     | 型                  | 意味             |
| ------ | ------------------- | ---------------- |
| `body` | ClassStatement の列 | 文。ソースの順。 |

子の欄: `body`。
ヘッダーのキーワードは欄ではありません。

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
空白だけのメンバーの行は、
どんな空白を持っていても mermaid.js が何も加えないので、ノードを作りません。
そのため、`class A { }` は空の列を持ち、
`class A` は null を持ちます。 [fixture: class/gram-class-css-class-blank-body]
[fixture:
class/spec-class-diagram-4eb71456]

### ClassMemberStatement

ラベルのあるクラスの名前です。
`A : +int x`。

| 欄       | 型                      | 意味                                                                    |
| -------- | ----------------------- | ----------------------------------------------------------------------- |
| `class`  | ClassName               | `:` の前のクラスの名前。                                                |
| `member` | ClassMember または null | `:` の後のメンバーの行。`A : ` のように `:` の後がすべて空白なら null。 |

子の欄: `class`、`member`。
`A : ` はメンバーを持ちません。
空白 4 個が続く `A :` も同じです。
mermaid.js は、空白だけのラベルには、その量によらずメンバーを加えないので、
その空白は値ではありません。 [fixture: class/gram-member-statement] [fixture:
class/db-member-statement-blank] [fixture:
class/db-member-statement-blank-spaces]

### ClassNameStatement

ラベルなしで行にあるクラスの名前だけの文です。
`Foo`。

| 欄     | 型        | 意味           |
| ------ | --------- | -------------- |
| `name` | ClassName | クラスの名前。 |

子の欄: `name`。 [fixture: class/gram-name-alone]

### ClassAnnotationStatement

`<<interface>> A`。

| 欄           | 型              | 意味                        |
| ------------ | --------------- | --------------------------- |
| `annotation` | ClassAnnotation | `<<` から `>>` までの注釈。 |
| `class`      | ClassName       | その後のクラスの名前。      |

子の欄: `annotation`、`class`。 [fixture: class/spec-class-diagram-280c04be]

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
多重度は空の文字列でもかまいません。
`A "" --> B` は、
値が空の StringLiteral を持ちます。 [fixture: class/gram-cardinality-empty]
[fixture:
class/spec-class-diagram-840a462d]

### ClassArrow

関係の矢印です。
省略できる関係の端を持つ線です。

| 欄            | 型     | 意味                                           |
| ------------- | ------ | ---------------------------------------------- |
| `value`       | 文字列 | その単位の書かれたテキストを順につないだもの。 |
| `startMarker` | 文字列 | 線の前の関係の端。下を参照。                   |
| `line`        | 文字列 | `--` は `solid`、`..` は `dotted`。            |
| `endMarker`   | 文字列 | 線の後の関係の端。下を参照。                   |

記号の語は、`<|` と `|>` は `triangle`、`*` は `filled-diamond`、
`o` は `hollow-diamond`、`<` と `>` は `arrow`、`()` は `lollipop`、
関係の端がなければ `none` です。
各関係の端と線は、それぞれ単位で、間に空白を置けます。
`value` は空白を含みません。
`A <|  --  * B` の値は `<|--*` で、始まりの記号は `triangle`、線は `solid`、
終わりの記号は `filled-diamond` です。 [fixture: class/gram-relation-spaces]
語は描かれる記号を表し、mermaid.js が関係を何と呼ぶかを表しません。
子の欄はありません。

### ClassNamespaceStatement

| 欄       | 型                                                                             | 意味                                                                                    |
| -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `prefix` | ClassIdentifier または null                                                    | [ClassName](#classname) と同じく、バッククォートの名前の前の名前の部分。なければ null。 |
| `name`   | ClassIdentifier または StringLiteral                                           | 名前空間の名前。その名前の部分か、そのバッククォートの名前。                            |
| `label`  | StringLiteral または null                                                      | `[` と `]` の間の文字列。なければ null。                                                |
| `body`   | （ClassDeclaration、ClassNoteStatement、ClassNamespaceStatement のどれか）の列 | 本体の項目。ソースの順。                                                                |

子の欄: `prefix`、`name`、`label`、`body`。
`namespace a.b` は ClassIdentifier
`a.b` を持ちます。 [fixture: class/spec-class-diagram-95acf03b] [fixture:
class/db-namespace-nested]

### ClassNoteStatement

| 欄      | 型                    | 意味                                                      |
| ------- | --------------------- | --------------------------------------------------------- |
| `class` | ClassName または null | `note for` の後のクラスの名前。`note` のノートでは null。 |
| `text`  | StringLiteral         | ノートのテキスト。                                        |

子の欄: `class`、`text`。 [fixture: class/db-note-for-undefined-class] [fixture:
class/db-note-text-spaces]

### ClassCallbackStatement

`callback` の文か、`call` のある `click` の文です。

| 欄          | 型                                | 意味                                                                                                        |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `class`     | ClassName                         | `callback` か `click` の後のクラスの名前。                                                                  |
| `callback`  | StringLiteral または ClassLiteral | 関数名。クラスの名前の後の文字列か、`call` の後の `callback-name` の単位（ClassLiteral）。                  |
| `arguments` | ClassLiteral または null          | `call` の後の `(` と `)` の間のテキスト。両端のものも含めて空白と改行を保つ 1 つのテキスト。なければ null。 |
| `tooltip`   | StringLiteral または null         | 最後の文字列。なければ null。                                                                               |

子の欄: `class`、`callback`、`arguments`、`tooltip`。
どちらのキーワード（`callback` か `click`）を書いたかは、どの欄にも現れません。
`click A call fn()` では、`(` と `)` はどの欄にもない文の単位で、
`arguments` は null です。 [fixture: class/spec-class-diagram-6fe56b41]
[fixture:
class/db-callback-names-comma]

### ClassLinkStatement

`link` の文か、`href` のある `click` の文です。

| 欄        | 型                        | 意味                                                                 |
| --------- | ------------------------- | -------------------------------------------------------------------- |
| `class`   | ClassName                 | `link` か `click` の後のクラスの名前。                               |
| `url`     | StringLiteral             | URL。                                                                |
| `tooltip` | StringLiteral または null | 2 つ目の文字列。なければ null。                                      |
| `target`  | 文字列または null         | 書いたとおりの `_self`、`_blank`、`_parent`、`_top`。なければ null。 |

子の欄: `class`、`url`、`tooltip`。 [fixture: class/db-click-href]
[fixture: class/gram-link-tooltip-empty]

### ClassStyleStatement

| 欄       | 型                | 意味                                       |
| -------- | ----------------- | ------------------------------------------ |
| `id`     | Identifier        | `style` の後の語。                         |
| `styles` | ClassLiteral の列 | `,` の単位で区切ったスタイル。ソースの順。 |

子の欄: `id`、`styles`。
スタイルのラベルの中の `,` は、木では 2 つのスタイルを分けません。
`style A fill:#f00,stroke:#333` は 1 つのスタイルを持ちます。 [fixture: class/gram-style-dash-in-label]
[fixture: class/db-style-spaces]

### ClassCssClassStatement

| 欄         | 型            | 意味                      |
| ---------- | ------------- | ------------------------- |
| `idList`   | StringLiteral | `cssClass` の後の文字列。 |
| `cssClass` | Identifier    | CSS クラス。              |

子の欄: `idList`、`cssClass`。 [fixture: class/db-css-class-list-space]

### ClassClassDefStatement

| 欄           | 型                | 意味                                    |
| ------------ | ----------------- | --------------------------------------- |
| `cssClasses` | Identifier の列   | `,` で区切った CSS クラス。ソースの順。 |
| `styles`     | ClassLiteral の列 | ClassStyleStatement と同じスタイル。    |

子の欄: `cssClasses`、
`styles`。 [fixture: class/spec-class-diagram-styles-2057adab]

### ClassDirectionStatement

| 欄           | 型                           | 意味                                                                            |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------- |
| `textBefore` | ClassIgnoredText または null | 方向の行の、`direction` の前のテキスト。ない（空か、すべて空白の）ときは null。 |
| `direction`  | 文字列                       | `TB`、`BT`、`RL`、`LR` のどれか。                                               |
| `textAfter`  | ClassIgnoredText または null | 方向の行の、値の後のテキスト。ないときは null。                                 |

子の欄: `textBefore`、`textAfter`。
`class A direction LR` は `direction` の前のテキスト `class A` を、
`direction TBX` は値の後のテキスト `X` を持ちます。 [fixture: class/lex-direction-line-class-statement]
[fixture:
class/lex-direction-line-value-then-text]

### ClassAccTitleStatement

| 欄      | 型           | 意味                                           |
| ------- | ------------ | ---------------------------------------------- |
| `value` | ClassLiteral | `accTitle:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。
`:` の後の空白は、改行も含めてそれと一緒に読まれるので、
テキストは次の行にあってもかまいません。 [fixture: class/lex-acc-title-next-line]

### ClassAccDescrStatement

`accDescr:` の文です。

| 欄      | 型           | 意味                                           |
| ------- | ------------ | ---------------------------------------------- |
| `value` | ClassLiteral | `accDescr:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。 [fixture: class/db-acc-title-spaces]

### ClassAccDescrBlockStatement

`accDescr {` の文です。

| 欄      | 型                       | 意味                                                   |
| ------- | ------------------------ | ------------------------------------------------------ |
| `value` | ClassLiteral または null | `{` と `}` の間のテキスト。空の説明ブロックでは null。 |

子の欄: `value`。
空の説明ブロックが文になるのは、文の始まりにあり、
同じ行に別の文が続くとき（[空の説明ブロック](../diagrams/class.ja.md#空の説明ブロック) を参照）と、
文の最後の単位の後、改行の前にあるときです。
ヘッダーの後、その改行の前では、図の `body` の最初の文です。
[区切りの前の空の説明ブロック](../diagrams/class.ja.md#区切りの前の空の説明ブロック) を参照してください。 [fixture: class/spec-class-diagram-0926d7aa]
[fixture: class/gram-empty-description-block-then-statement]
[fixture: class/gram-empty-description-block-after-note]
[fixture: class/header-empty-description-block]

### ClassName

クラスの名前です。
class の文、関係の両端、`note for`、`click`、`callback`、`link` の後にあります。

| 欄        | 型                                   | 意味                                                                                        |
| --------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `prefix`  | ClassIdentifier または null          | バッククォートの名前の前に書いた名前の部分。なければ null。                                 |
| `name`    | ClassIdentifier または StringLiteral | 名前の部分か、バッククォートの名前。                                                        |
| `generic` | ClassLiteral または null             | ジェネリクスの型の 2 つの `~` の間の `generic-text` の単位。空白を含む。ないか空なら null。 |

子の欄: `prefix`、`name`、`generic`。
間に空白か `.` を置いた名前の部分は 1 つの [ClassIdentifier](#classidentifier) です。
`class Foo Bar` は ClassIdentifier `FooBar` を、
`class a.b.C` は ClassIdentifier
`a.b.C` を持ちます。 [fixture: class/gram-name-dots]
バッククォートの名前は StringLiteral です。
``class `Odd Name` `` は値が `Odd Name` の StringLiteral を持ちます。
バッククォートの名前の前に名前の部分があれば、それが `prefix` です。
``class A.`b c` `` は、prefix `A.` と StringLiteral `b c` を持ちます。
`class A~~` は 2 つの `~` の単位を持ち、generic は持ちません。
mermaid.js はジェネリクスの型を、空白と改行を含めて書かれたとおりに読むので、
generic は `generic-text` の単位の全体です。
`class A~ T ~` の generic は空白、`T`、空白で、
`class A~ ~` の generic は空白 1 つです。
`note for A~ T ~` は、
それをノートのクラスの名前に保ちます。 [fixture: class/db-generic-spaces]
[fixture: class/db-generic-blank] [fixture:
class/tokens-generic-blank] [fixture: class/db-note-for-generic-spaces]
[fixture: class/gram-name-spaces] [fixture:
class/docs-syntax-class-diagram-01f18827] [fixture:
class/gram-name-prefix-backquoted] [fixture: class/gram-generic-empty-at-end]
[fixture: class/db-generic-type]
クラスの id は、どの欄でもありません。
閉じていないバッククォートの名前は、閉じの引用符のない StringLiteral です。
[StringLiteral](../ast.ja.md#stringliteral) を参照してください。 [fixture: class/lex-backquote-unclosed]

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
可視性と分類子の記号、`(`、`)` はどのノードも持たない単位で、
欄はその記号の語を持ちます。
`+foo(a: int) List~T~$` は、可視性 `public`、名前 `foo`、引数 `a: int`、
戻り値の型 `List~T~`、
分類子 `static` を持ちます。 [fixture: class/tokens-method-fields]
[fixture: class/lex-member-classifiers]
[fixture: class/lex-member-method-nested-parentheses]
読まれないテキストがあるのは、行が U+2028 か U+2029 を持つときだけで、
そこが空白だけなら null です。
[メンバーの行](../diagrams/class.ja.md#メンバーの行) を参照してください。 [fixture: class/lex-member-method-line-separator-before]
[fixture: class/lex-member-method-line-separator-after]

mermaid.js はこれらの値の端で 2 つの空白の並びを読むので、
それらは `name` と `returnType` の中にあります（[メンバーの行](../diagrams/class.ja.md#メンバーの行) を参照）。
空白（U+0020）で始まるメンバーの名前のテキストの始まりの空白で、
mermaid.js はそれを空白 1 つにします。
もう 1 つは、戻り値の型とそれを終える分類子の記号の間の空白です。
`+ foo()` の名前は空白と `foo` で、
`+getInstance() Foo $` の戻り値の型は `Foo` と空白です。
端のほかの空白は外にあります。
`+` の後の空白をタブにすると、
名前は `foo` です。 [fixture: class/db-method-name-space] [fixture:
class/lex-member-method-segment-space-before-name] [fixture:
class/db-member-name-tab] [fixture:
class/db-method-return-type-space-before-classifier]

### ClassAttribute

括弧のないメンバーの行です。

| 欄           | 型                       | 意味                                  |
| ------------ | ------------------------ | ------------------------------------- |
| `visibility` | 文字列                   | ClassMethod と同じ。                  |
| `name`       | ClassLiteral または null | `member-name` の単位。なければ null。 |
| `classifier` | 文字列                   | ClassMethod と同じ。                  |

子の欄: `name`。 [fixture: class/db-member-name-space] [fixture:
class/lex-member-annotation-unclosed]

### ClassAnnotation

注釈です。
`<<interface>>`。

| 欄     | 型                                    | 意味                                       |
| ------ | ------------------------------------- | ------------------------------------------ |
| `name` | Identifier、ClassLiteral、または null | `<<` と `>>` の間のテキスト。空なら null。 |

子の欄: `name`。
class の文の名前の後と注釈の文では、
文法は `<<` と `>>` の間に名前の部分 1 つを許すので、名前は Identifier です。
mermaid.js はその名前を、周りの空白を除いて読みます。
`<< interface >> A` と `class A << interface >>` は、 Identifier
`interface` を持ちます。 [fixture: class/db-annotation-statement-spaces]
[fixture:
class/db-class-annotation-spaces]
本体の中かメンバーの文のメンバーの行としては、どんなテキストでもよく、
mermaid.js はそれを空白を含めて書かれたとおりに読むので、
`annotation-name` の単位の全体の ClassLiteral です。
本体の `<< y z >>` の名前は、空白、`y z`、空白で、
`<<  >>` の名前は空白 2 個で、
`A : <<  >>` でも同じです。 [fixture: class/tokens-annotation-blank] [fixture:
class/tokens-annotation-blank-label]
[fixture: class/spec-class-diagram-280c04be] [fixture:
class/db-member-annotation-spaces]

### ClassIdentifier

引用符なしで書いたクラスの名前か名前空間の名前です。
バッククォートの名前の前にあるか、バッククォートの名前のない、
間に空白か `.` を置いた名前の部分です（[クラスの名前](../diagrams/class.ja.md#クラスの名前) を参照）。

| 欄     | 型     | 意味                                                                                     |
| ------ | ------ | ---------------------------------------------------------------------------------------- |
| `name` | 文字列 | その単位の書かれたテキストを、順につないだもの（[ノード](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
mermaid.js が除くので、2 つの単位の間の空白は名前の一部ではありません。
`class Foo Bar` と `class Fo oBar` はどちらもクラス `FooBar` を宣言し、
`class Fo%%{init: {}}%%o` はクラス `Foo` を宣言します。 [fixture: class/gram-name-spaces]
[fixture:
class/gram-name-space-inside-word] [fixture: class/lex-directive-in-name]

### ClassLiteral

空白を含みうる、引用符のないテキストです。
関係のラベル、ジェネリクスの型、メンバーの行の部分、
`call` の後のコールバックの名前とその引数、スタイル、
アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                                                                                       |
| ------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。スタイルでは、その単位の書かれたテキストを順につないだもの。 |

子の欄はありません。
値が空白で始まるか終わるのは、mermaid.js がそれを読むところだけです。
ジェネリクスの型、メンバーの行の注釈、空白で始まるメンバーの名前、
分類子の記号の前の戻り値の型、
`call` の後のコールバックの名前とその引数です（[ClassName](#classname)、
[ClassAnnotation](#classannotation)、 [ClassMethod](#classmethod) を参照）。
コールバックの名前と引数は、mermaid.js が書かれたとおりに渡すので、
`click A call fn ()` の名前は `fn` と空白で、
`click A call f( x, y )` の引数は、空白、`x, y`、空白です。
mermaid.js は、その後、引数を引用符の外の `,` ごとに分けて、
それぞれの両端を削ります。 [fixture: class/tokens-callback-name-trailing-space]
[fixture: class/tokens-callback-arguments-spaces-at-ends]
[fixture: class/tokens-callback-arguments-line-feeds-at-ends]
そこでは、空白だけのテキストは、その空白の値です。
`class A~ ~` と、本体の `<<  >>` がそうです。
ほかのところでは、mermaid.js がテキストの両端を削り、
その周りの空白は値の一部ではなく、空白だけのテキストでは欄が null です。
`A --> B : ` はラベルを持ちません。
mermaid.js は、空白だけの関係のラベルも空のタイトルとして読み、
それは木のどの欄にも現れません。 [fixture: class/tokens-relation-label-blank]
[fixture:
class/tokens-generic-blank] [fixture: class/tokens-annotation-blank]
スタイルの値は、[Identifier](../ast.ja.md#identifier) の名前と同じく、
その単位の書かれたテキストを順につないだものです。
mermaid.js はスタイルの単位の間の空白を落とすので、
`style A fill : #f00` のスタイルは `fill: #f00` です。
一方、
flowchart と state 図はその空白を残します。 [fixture: class/db-style-spaces]
[fixture: class/tokens-style-words-joined]
[fixture: class/tokens-style-directive-inside-label]
[fixture: class/tokens-style-label-keeps-space-before-next-colon]
[fixture: class/tokens-style-label-space-before-directive]
[fixture: class/tokens-classdef-label-holds-comma]
[fixture: flowchart/db-style-space-before-colon-kept]
[fixture: state/db-style-space-before-colon-kept]

### ClassIgnoredText

書き手が書き、mermaid.js が読まないテキストです。
方向の行の `direction` の前と値の後のテキストと、方法の行の、
mermaid.js が読む部分の周りの部分です。

| 欄      | 型     | 意味                                                              |
| ------- | ------ | ----------------------------------------------------------------- |
| `value` | 文字列 | その書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。

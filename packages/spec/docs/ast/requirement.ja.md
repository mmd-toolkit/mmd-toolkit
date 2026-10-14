# Requirement のノード

英語版: [requirement.md](./requirement.md)

この文書は、図種 `requirement` の木のノードを定めます。
木の共通部分は [ast.ja.md](../ast.ja.md) で定め、
ソースの読み方と、どの文法の規則がどのノードを作るかは
[diagrams/requirement.ja.md](../diagrams/requirement.ja.md) で定めます。

この図種の本体は [RequirementDiagram](#requirementdiagram) です。
欄の値は、
[ast.ja.md](../ast.ja.md#ノード)が値の書かれたテキストを定めるとおり、
書き手が書いたものを保ち、
[common.ja.md](../common.ja.md#ソースの読み方) の変換後の形ではありません。
この図種で値が空白で始まったり終わったりするのは、引用符の中だけです。
引用符なしの名前や値は、その行の後ろの空白を読み、
mermaid.js が取り除くとおり、それを書かれたテキストから外します
（[名前と値](../diagrams/requirement.ja.md#単位と文脈) を参照）。
この図種の StringLiteral（名前、クラス、値）は、常に閉じていて空ではありません。
閉じる引用符のない `"` と空の文字列は、入力を拒否させます
（[文字列](../diagrams/requirement.ja.md#単位と文脈) を参照）。
[fixture: requirement/lex-string-unclosed] [fixture:
requirement/gram-requirement-name-empty-string] [fixture:
requirement/gram-requirement-value-empty-string] [fixture:
requirement/div-empty-string-before-value]

**要求**は図の箱で、id、テキスト、リスク、検証の方法を持ちます。
**要素**は図の箱で、型と文書の参照を持ちます。
どちらも名前で名付けられ、関係は 2 つの名前を結びます。

## ノード

### RequirementDiagram

| 欄     | 型                            | 意味                 |
| ------ | ----------------------------- | -------------------- |
| `body` | RequirementStatement のリスト | 文。ソースの順です。 |

子の欄: `body`。ヘッダーのキーワードは欄ではありません。

**RequirementStatement** は、RequirementRequirementStatement、
RequirementElementStatement、RequirementRelationshipStatement、
RequirementDirectionStatement、RequirementStyleStatement、
RequirementClassDefStatement、RequirementClassStatement、
RequirementClassShorthandStatement、RequirementAccTitleStatement、
RequirementAccDescrStatement、RequirementAccDescrBlockStatement
のいずれかです。

改行はどの文にも属さず、空行はノードを作りません。
以下のどのノードの子の欄も
ソースの順です（[ノード](../ast.ja.md#ノード) を参照）。

### RequirementRequirementStatement

本体を持つ要求です。
`requirement r {`、各行のフィールド、`}` や、
本体を持つ `functionalRequirement "my req":::c {` です。
Db にその名前の要求がなければ、フィールドの値とともに要求を足し、
Db にすでにあるときも、クラスをその名前の要求に与えます。

| 欄                | 型                                                                                                            | 意味                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `requirementType` | string                                                                                                        | 要求の種類。下の語のどれか。                                                 |
| `name`            | RequirementIdentifier か StringLiteral                                                                        | 要求の名前。                                                                 |
| `cssClasses`      | （RequirementIdentifier か StringLiteral）のリスト                                                            | `:::` の後の、`,` の単位で区切ったクラス。ソースの順。`:::` がないときは空。 |
| `body`            | （RequirementValueField、RequirementRiskField、RequirementVerifyMethodField、RequirementIgnoredText）のリスト | `{` と `}` の間の項目。ソースの順。項目のない本体では空。                    |

子の欄: `name`、`cssClasses`、`body`。
種類は、文を始めるキーワードで、`requirement`、`functionalRequirement`、
`interfaceRequirement`、`performanceRequirement`、`physicalRequirement`、
`designConstraint` のどれかです。書かれた大文字小文字にはよりません。
`REQUIREMENT r {` の種類は `requirement` です。
名前は、`unquoted-text` の単位では RequirementIdentifier、
`string` の単位では StringLiteral で、各クラスも同じです。
`body` の RequirementIgnoredText は、本体の行にある空の説明ブロックで、
mermaid.js は読みません
（[空の説明ブロック](../diagrams/requirement.ja.md#空の説明ブロック) を参照）。
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/spec-requirement-diagram-d1dc0373] [fixture:
requirement/spec-requirement-diagram-17e0a905] [fixture:
requirement/spec-requirement-diagram-f221edee] [fixture:
requirement/spec-requirement-diagram-0e21244e] [fixture:
requirement/spec-requirement-diagram-06f108a7] [fixture:
requirement/db-keywords-upper-case] [fixture:
requirement/db-requirement-defaults] [fixture:
requirement/docs-syntax-requirement-diagram-6aee0ba9] [fixture:
requirement/db-class-in-definition] [fixture:
requirement/gram-requirement-class-string] [fixture:
requirement/gram-requirement-separator-spaced] [fixture:
requirement/gram-empty-description-block-in-body]
[fixture: requirement/db-requirement-second-definition-classes]
[fixture:
requirement/db-requirement-name-repeated]

### RequirementValueField

要求の `id` か `text` のフィールドです。`id: 1.2`、`text: "a: b"` です。
その値は書かれたテキストで、ノードとして持ちます。
`risk` と `verifyMethod` は決まった語のどれかを取り、それはノードではないので、
別の型 RequirementRiskField と RequirementVerifyMethodField です。

| 欄      | 型                                  | 意味             |
| ------- | ----------------------------------- | ---------------- |
| `field` | string                              | `id` か `text`。 |
| `value` | RequirementLiteral か StringLiteral | `:` の後の値。   |

子の欄: `value`。
フィールドは、書かれた大文字小文字によらず、キーワードを小文字にした語です。
`ID: 1` のフィールドは `id` です。
値は、`unquoted-text` の単位では RequirementLiteral、
`string` の単位では StringLiteral です。
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/db-requirement-quoted-values] [fixture:
requirement/db-requirement-value-spaces] [fixture:
requirement/db-keywords-upper-case]

### RequirementRiskField

`risk` のフィールドです。`risk: high` です。

| 欄     | 型     | 意味                      |
| ------ | ------ | ------------------------- |
| `risk` | string | `low`、`medium`、`high`。 |

子の欄はありません。
リスクは、書かれた大文字小文字によらず、キーワードを小文字にした語です。
`risk: High` と `RISK: HIGH` のリスクは `high` です。
Db はそれを `Low`、`Medium`、`High` として読みます。
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/lex-risk-method-mixed-case] [fixture:
requirement/db-keywords-upper-case]

### RequirementVerifyMethodField

`verifyMethod` のフィールドです。`verifyMethod: test` です。

| 欄             | 型     | 意味                                                |
| -------------- | ------ | --------------------------------------------------- |
| `verifyMethod` | string | `analysis`、`demonstration`、`inspection`、`test`。 |

子の欄はありません。
方法は、書かれた大文字小文字によらず、キーワードを小文字にした語です。
`verifymethod: Test` の方法は `test` です。
Db はそれを `Analysis`、`Demonstration`、`Inspection`、`Test` として読みます。
[fixture: requirement/db-requirement-all-fields] [fixture:
requirement/lex-risk-method-mixed-case] [fixture:
requirement/spec-requirement-diagram-1e009b06]

### RequirementElementStatement

本体を持つ要素です。`element e {`、各行のフィールド、`}` です。
Db にその名前の要素がなければ、フィールドの値とともに要素を足し、
クラスを、その名前の要求があればその要求に、なければ要素に与えます。

| 欄           | 型                                                            | 意味                                                                         |
| ------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `name`       | RequirementIdentifier か StringLiteral                        | 要素の名前。                                                                 |
| `cssClasses` | （RequirementIdentifier か StringLiteral）のリスト            | `:::` の後の、`,` の単位で区切ったクラス。ソースの順。`:::` がないときは空。 |
| `body`       | （RequirementElementField か RequirementIgnoredText）のリスト | `{` と `}` の間の項目。ソースの順。項目のない本体では空。                    |

子の欄: `name`、`cssClasses`、`body`。
RequirementRequirementStatement と同じです。
[fixture: requirement/db-element-fields] [fixture:
requirement/db-element-defaults] [fixture:
requirement/db-class-in-definition] [fixture:
requirement/gram-empty-description-block-in-element-body]
[fixture: requirement/db-element-definition-with-class-of-requirement]
[fixture:
requirement/db-element-name-repeated]

### RequirementElementField

要素の `type` か `docref` のフィールドです。
`type: simulation`、`docRef: "http://x"` です。

| 欄      | 型                                  | 意味                 |
| ------- | ----------------------------------- | -------------------- |
| `field` | string                              | `type` か `docref`。 |
| `value` | RequirementLiteral か StringLiteral | `:` の後の値。       |

子の欄: `value`。
フィールドは、書かれた大文字小文字によらず、キーワードを小文字にした語です。
`docRef: d` のフィールドは `docref` です。
値は RequirementValueField と同じです。
[fixture: requirement/db-element-fields] [fixture:
requirement/gram-element-docref-quoted-url] [fixture:
requirement/db-keywords-upper-case]

### RequirementRelationshipStatement

`a - satisfies -> b`、`b <- copies - a` です。
関係を足します。名前は定義されていなくてもかまいません。

| 欄             | 型                                     | 意味                                                |
| -------------- | -------------------------------------- | --------------------------------------------------- |
| `left`         | RequirementIdentifier か StringLiteral | 関係の前の名前。                                    |
| `relationship` | string                                 | 関係の種類。下の語のどれか。                        |
| `arrow`        | string                                 | `- … ->` では `forward`、`<- … -` では `backward`。 |
| `right`        | RequirementIdentifier か StringLiteral | 関係の後の名前。                                    |

子の欄: `left`、`right`。
種類は `contains`、`copies`、`derives`、`satisfies`、`verifies`、
`refines`、`traces` のどれかで、書かれた大文字小文字によらず小文字です。
欄は名前が書かれた順を保ちます。
矢印は元から先を指すので、Db は、`forward` の関係では左の名前を元、
右の名前を先として読み、`backward` の関係ではその逆に読みます。
`b <- copies - a` は a から b への関係です。
[fixture: requirement/db-relationship-arrows] [fixture:
requirement/gram-relationship-backward-glued] [fixture:
requirement/lex-relationship-upper-case] [fixture:
requirement/db-relationship-quoted-names] [fixture:
requirement/db-relationship-undefined-names]

### RequirementDirectionStatement

| 欄           | 型                             | 意味                                                       |
| ------------ | ------------------------------ | ---------------------------------------------------------- |
| `textBefore` | RequirementIgnoredText か null | 方向の行の `direction` より前のテキスト。ないときは null。 |
| `direction`  | string                         | `TB`、`BT`、`RL`、`LR`。                                   |
| `textAfter`  | RequirementIgnoredText か null | 方向の行の値より後のテキスト。ないときは null。            |

子の欄: `textBefore`、`textAfter`。
テキストは両端の空白を除いたもので、空白しかないところでは null です。
`direction LR` はどちらも持たず、
`foo direction LR bar` は `textBefore` の `foo` と `textAfter` の `bar`
を持ちます。
方向は値を大文字にしたものです。`direction rl` は `RL` になります。
[fixture: requirement/spec-requirement-diagram-08cfba06] [fixture:
requirement/db-direction-lower-case] [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/lex-direction-value-suffix] [fixture:
requirement/lex-direction-in-relationship-line]

### RequirementStyleStatement

`style r,e fill:#f9f,stroke:#333` です。

| 欄       | 型                                                 | 意味                                                   |
| -------- | -------------------------------------------------- | ------------------------------------------------------ |
| `names`  | （RequirementIdentifier か StringLiteral）のリスト | `style` の後の、`,` の単位で区切った名前。ソースの順。 |
| `styles` | RequirementLiteral のリスト                        | `,` の単位で区切ったスタイル。ソースの順。             |

子の欄: `names`、`styles`。
名前は、`style-word` の単位では RequirementIdentifier、
`string` の単位では StringLiteral です。
スタイルは、その単位のテキストをつないだものです
（[RequirementLiteral](#requirementliteral) を参照）。
スタイルのリストは空になりません。
スタイルのない `style` の文は拒否されます。
[fixture: requirement/db-style-statement] [fixture:
requirement/lex-style-string-name] [fixture:
requirement/lex-style-without-style]

### RequirementClassDefStatement

`classDef a,b fill:#f9f,stroke:#333` です。

| 欄           | 型                                                 | 意味                                                          |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------- |
| `cssClasses` | （RequirementIdentifier か StringLiteral）のリスト | `classDef` の後の、`,` の単位で区切ったクラス名。ソースの順。 |
| `styles`     | RequirementLiteral のリスト                        | スタイル。RequirementStyleStatement と同じです。              |

子の欄: `cssClasses`、`styles`。
クラス名は RequirementStyleStatement の名前と同じです。
[fixture: requirement/db-class-def] [fixture:
requirement/lex-classdef-string-name] [fixture:
requirement/lex-classdef-without-style]

### RequirementClassStatement

`class r,e a,b` です。

| 欄           | 型                                                 | 意味                                                   |
| ------------ | -------------------------------------------------- | ------------------------------------------------------ |
| `names`      | （RequirementIdentifier か StringLiteral）のリスト | `class` の後の、`,` の単位で区切った名前。ソースの順。 |
| `cssClasses` | （RequirementIdentifier か StringLiteral）のリスト | `,` の単位で区切ったクラス。ソースの順。               |

子の欄: `names`、`cssClasses`。
名前とクラスは、`style-word` か `unquoted-text` の単位では
RequirementIdentifier、`string` の単位では StringLiteral です。
`unquoted-text` の単位がそこに来るのは、
文がその行を終える改行の後に続くときです
（[style の文脈](../diagrams/requirement.ja.md#style-の文脈) を参照）。
[fixture: requirement/db-class-statement] [fixture:
requirement/gram-class-string-class] [fixture:
requirement/lex-class-list-next-line]

### RequirementClassShorthandStatement

名前に `:::` とクラスが続いたものです。`r:::a,b` です。
RequirementClassStatement と同じく、
その名前の要求か要素にクラスを与えます。

| 欄           | 型                                                 | 意味                                                   |
| ------------ | -------------------------------------------------- | ------------------------------------------------------ |
| `name`       | RequirementIdentifier か StringLiteral             | `:::` の前の名前。                                     |
| `cssClasses` | （RequirementIdentifier か StringLiteral）のリスト | `:::` の後の、`,` の単位で区切ったクラス。ソースの順。 |

子の欄: `name`、`cssClasses`。
RequirementClassStatement ではないのは、書き方が違うからです。
名前は 1 つで、`class` がありません。
[fixture: requirement/db-class-colon-form] [fixture:
requirement/gram-class-shorthand-spaced] [fixture:
requirement/lex-style-string-then-shorthand]

### RequirementAccTitleStatement

テキスト付きの `accTitle:` の文。

| 欄      | 型                 | 意味                                           |
| ------- | ------------------ | ---------------------------------------------- |
| `value` | RequirementLiteral | `accTitle:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。`:` の後の空白は改行を含めて一緒に読まれるので、
テキストは最初にテキストのある行から始まり、値は null になりません。
後ろに何もない `accTitle:` は拒否されます。
値は両端の空白を除いたテキストです。
[fixture: requirement/db-acc-title-descr] [fixture:
requirement/gram-acc-title-line-feed-then-text] [fixture:
requirement/lex-acc-title-at-end]

### RequirementAccDescrStatement

テキスト付きの `accDescr:` の文。

| 欄      | 型                 | 意味                                           |
| ------- | ------------------ | ---------------------------------------------- |
| `value` | RequirementLiteral | `accDescr:` の後の、行の終わりまでのテキスト。 |

子の欄: `value`。
RequirementAccTitleStatement と同じく、値は null になりません。
[fixture: requirement/db-acc-title-descr] [fixture:
requirement/lex-acc-descr-at-end]

### RequirementAccDescrBlockStatement

テキスト付きの、またはテキストのない `accDescr { … }` の文。
テキストのないものは空の説明ブロックで、何も変えません。
ブロックは常に閉じています。テキストはその中では終われません。

| 欄      | 型                         | 意味                                                                                 |
| ------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `value` | RequirementLiteral か null | `accDescr {` と `}` の間の、両端の空白を除いたテキスト。間が空白だけなら null です。 |

子の欄: `value`。
`accDescr {}` と、ディレクティブだけを持つブロックは、
値 null を持ち、何も変えません。
そのようなブロックは、文が始まるところでは文で、
本体の行では本体の項目です。
文の中のブロックは入力を拒否させます
（[空の説明ブロック](../diagrams/requirement.ja.md#空の説明ブロック) を参照）。
[fixture: requirement/db-acc-descr-block] [fixture:
requirement/gram-acc-descr-block-empty] [fixture:
requirement/gram-acc-descr-block-directive-only] [fixture:
requirement/gram-empty-description-block-after-close-brace] [fixture:
requirement/div-empty-description-block-in-relationship] [fixture:
requirement/lex-acc-descr-block-unclosed]

### RequirementIdentifier

引用符なしで書いた名前です。
要求や要素の名前、関係の端、クラス名、
`style`、`classDef`、`class` の後の名前で、
`unquoted-text` か `style-word` の単位です。

| 欄     | 型     | 意味                                                                       |
| ------ | ------ | -------------------------------------------------------------------------- |
| `name` | string | 書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。空白を含みます。 |

子の欄はありません。
[Identifier](../ast.ja.md#identifier) ではなく図の名前のノードなのは、
`unquoted-text` の単位が文字の間に空白を持てるからです。
`requirement  spaced name  {` は要求 `spaced name` で、
`a`、U+00A0、`b` は 1 つの名前です。
その行の名前の後ろの空白は、U+00A0 を含めて単位と一緒に読まれ、
書かれたテキストには入りません。
[fixture: requirement/db-requirement-name-spaces] [fixture:
requirement/lex-whitespace-nbsp-in-name] [fixture:
requirement/lex-whitespace-nbsp-after-name] [fixture:
requirement/lex-whitespace-line-separator-in-name] [fixture:
requirement/gram-requirement-class-space] [fixture:
requirement/db-style-statement]

### RequirementLiteral

空白を含みうる引用符なしのテキストです。
フィールドの値、スタイル、アクセシビリティのテキストです。

| 欄      | 型     | 意味                                                                                                               |
| ------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `value` | string | 書かれたテキスト（[ノード](../ast.ja.md#ノード) を参照）。スタイルでは、単位の書かれたテキストを順につないだもの。 |

子の欄はありません。
フィールドの値は、その `unquoted-text` の単位の書かれたテキストで、
後ろの空白を含みません。
`id:   1  ` の id は `1`、`text:   spaced out   ` のテキストは
`spaced out` です。
スタイルの値は、[Identifier](../ast.ja.md#identifier) の名前と同じく、
単位の書かれたテキストを順につないだものです。
mermaid.js はスタイルの単位の間の空白を落とすので、
`style r fill: red , stroke : blue` はスタイル `fill:red` と
`stroke:blue` を持ち、
`style r fill:red stroke:blue` は 1 つのスタイル
`fill:redstroke:blue` を持ちます。
アクセシビリティのテキストは、mermaid.js が取り除く両端の空白なしで読まれ、
空白だけになることはありません。
[fixture: requirement/db-requirement-value-spaces] [fixture:
requirement/lex-style-spaces] [fixture: requirement/lex-style-no-comma]
[fixture: requirement/db-acc-title-descr] [fixture:
requirement/db-acc-descr-block]

### RequirementIgnoredText

書き手が書いたが mermaid.js が読まないテキストです。
方向の行の `direction` より前と値より後のテキスト、
および要求か要素の本体の行にある空の説明ブロックです。

| 欄      | 型     | 意味                                                          |
| ------- | ------ | ------------------------------------------------------------- |
| `value` | string | 書かれたテキスト（[ast.ja.md](../ast.ja.md#ノード) を参照）。 |

子の欄はありません。
本体の空の説明ブロックは、1 つずつが、
`accDescr {}`、`accDescr { }`、`accDescr {`・改行・`}` のような
ブロックのテキストを持つ 1 つのノードです。
行のどこにあっても同じで、
`{` の後、フィールドの前、値が文字列のフィールドの後、`}` の前にあります。
[fixture: requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/gram-empty-description-block-in-body] [fixture:
requirement/gram-empty-description-block-after-brace] [fixture:
requirement/gram-empty-description-block-before-field] [fixture:
requirement/gram-empty-description-block-after-string-value] [fixture:
requirement/gram-empty-description-block-before-close-brace] [fixture:
requirement/gram-empty-description-block-space-in-body]
[fixture: requirement/gram-empty-description-block-multiline-in-body]
[fixture:
requirement/gram-empty-description-blocks-adjacent-in-body]

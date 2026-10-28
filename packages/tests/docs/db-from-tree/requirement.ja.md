# requirement の Db を木から作る

英語版: [requirement.md](./requirement.md)

requirement 図の木から Db の要約を作る手順です。
`src/db-from-tree/requirement.ts` がこれを実装します（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、
仕様の [diagrams/requirement.ja.md](../../../spec/docs/diagrams/requirement.ja.md) と、
[ast/requirement.ja.md](../../../spec/docs/ast/requirement.ja.md) が定めます。
要約の欄は [db-summaries.ja.md](../db-summaries.ja.md#requirement) にあります。

mermaid.js は、構文解析の間に Db を作ります。
文法は、
文が終わるたびに Db のメソッドを呼びます（[`requirementDef`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L146-L149)、
[`elementDef`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L192-L195)、
[`relationshipDef`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L205-L209)、
[`classDefStatement` と `classStatement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L227-L234)、
[`styleStatement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/parser/requirementDiagram.jison#L243-L245)）。
Db は、
メソッドに渡されたものを保ちます（[`addRequirement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L126-L142)、
[`addElement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L172-L186)、
[`addRelationship`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L204-L210)、
[`setCssStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L226-L240)、
[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L242-L255)、
[`defineClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L257-L286)、
[`setDirection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L91-L93)、
[`setDiagramTitle`、`setAccTitle`、`setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)）。
要約も同じように作ります。
文を出現順に実行し、Db が持つ列がそのまま要約です。
レイアウトのデータではなく、
Db 自身の列から取ります（[db-summaries.ja.md](../db-summaries.ja.md#requirement) を参照）。
Db が出現順に実行しないものは、
requirement と element の本体だけです（**Requirements** を参照）。
値は、空白を含めて Db が持つとおりに保ちます。

## 木から要約を作る

**変換した形。**
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティは、名前の中でもテキストの中でもプレースホルダです。
`requirement a#amp; b {` は requirement `aﬂ°amp¶ß b` で、引用符付きの名前、
欄の id、text、type、参照、リレーションシップの名前、クラス名、
アクセシビリティのテキストでも同じです。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として読みます。
これは文字列と description ブロックの中でのことです。
各属性の引用符は `'` として読みます。
これはアクセシビリティのテキストの中でのことです。 [fixture: requirement/entity-placeholder-in-unquoted-name]
[fixture: requirement/entity-placeholder-in-unquoted-value]
[fixture: requirement/entity-placeholder-in-requirement-fields]
[fixture: requirement/entity-placeholder-in-element-fields]
[fixture: requirement/entity-placeholder-in-relationship]
[fixture: requirement/entity-placeholder-in-acc-title]
[fixture: requirement/entity-placeholder-in-acc-descr]
[fixture: requirement/entity-placeholder-in-acc-descr-block]
[fixture: requirement/lex-html-tag-in-string-value]
[fixture: requirement/header-crlf] [fixture: requirement/header-cr-only]
[fixture: requirement/db-acc-descr-block-crlf]
[fixture: requirement/db-acc-descr-block-lone-cr]
[fixture: requirement/lex-string-crlf]
[fixture: requirement/lex-string-lone-cr]
[fixture: requirement/lex-html-attribute-quote-in-acc-title]
[fixture: requirement/lex-html-attribute-quote-in-acc-descr]
[fixture: requirement/lex-html-attribute-quote-in-acc-descr-block]
[fixture: requirement/entity-placeholder-in-class-name]
[fixture: requirement/entity-placeholder-in-quoted-class-name]

**テキスト。**
木の葉ノードのテキストは、次のように読みます。

- RequirementIdentifier と RequirementLiteral は、
  その範囲の変換した形を持ちます。
  `value` がある場合、それは木が持つ書かれたとおりのテキストで、
  Db が持つのは mermaid.js が読むとおりのテキストです。
  そのため、`a`、U+00A0、`b` は、ノーブレークスペースを含む 1 つの名前です。
  行の上で名前や値の後ろにある空白は、
  その一部ではありません。 [fixture: requirement/db-requirement-name-spaces]
  [fixture: requirement/lex-whitespace-nbsp-in-name]
  [fixture: requirement/lex-whitespace-nbsp-after-name]
  [fixture: requirement/lex-whitespace-line-separator-in-name]
  [fixture: requirement/db-requirement-value-spaces]
- StringLiteral は、その範囲から引用符を除いた変換した形を持ちます。
  引用符の間の文字はすべて保ち、空白も改行も、
  引用符なしのテキストが持てない `#`、`%`、`:`、`,`、`-`、`{`、`}` も保ちます。
  引用符付きの名前と、同じテキストの引用符なしの名前は、
  1 つの名前です。 [fixture: requirement/db-requirement-quoted-values]
  [fixture: requirement/db-relationship-quoted-names]
  [fixture: requirement/lex-string-hash-percent]
  [fixture: requirement/lex-string-line-feed]
  [fixture: requirement/db-name-quoted-and-unquoted-same]
- ディレクティブがテキストの単位や文字列の中にあっても、変換した形にはないので、
  テキストにもありません。
  `text: a%%{init: {}}%%b` と `text: "a%%{init: {}}%%b"` の text は `ab`、
  `docref: a%%{init: {}}%%b` の参照は `ab`、
  `accTitle: a%%{init: {}}%%b` のタイトルは `ab`、
  `style r fi%%{init: {}}%%ll:red` の style は `fill:red`、
  `requirement a%%{init: {}}%%b {` の requirement は `ab`、
  `a - satisfies -> b%%{init: {}}%%c` の端は `bc`、
  `r:::c%%{init: {}}%%d` のクラスは `cd` です。
  ディレクティブの前の空白はテキストに残り、
  `text: a %%{init: {}}%%b` の text は `a b` です。
  description ブロックの中のコメント行も同じです。 [fixture: requirement/lex-directive-in-name]
  [fixture: requirement/lex-directive-in-target]
  [fixture: requirement/lex-directive-in-shorthand-class]
  [fixture: requirement/lex-directive-in-value]
  [fixture: requirement/lex-directive-after-space-in-value]
  [fixture: requirement/lex-directive-after-space-in-name]
  [fixture: requirement/lex-directive-after-space-in-direction-text]
  [fixture: requirement/lex-directive-in-string]
  [fixture: requirement/lex-directive-in-docref]
  [fixture: requirement/lex-directive-in-acc-title]
  [fixture: requirement/lex-directive-in-style]
  [fixture: requirement/tokens-comment-line-in-acc-block]
  [fixture: requirement/lex-directive-in-acc-descr]
  [fixture: requirement/lex-directive-in-acc-descr-block]
- 行規則が無視する `;` も、変換した形にありません。
  そのため `style r fill:#f00;` の style は `fill:#f00`、
  `accTitle: style:#x a;b` のタイトルは `style:#x ab`、
  `"style:#x" - satisfies -> b;c` の端は `bc` です。
  `style` の行でない行の `;` は、テキストの文字です。
  `id: 1;` の id は `1;`、
  `style r fill:red;` の style は `fill:red;` です。 [fixture: requirement/tokens-ignored-semicolon-in-style]
  [fixture: requirement/tokens-ignored-semicolon-in-acc-title]
  [fixture: requirement/tokens-ignored-semicolon-in-acc-descr]
  [fixture: requirement/tokens-ignored-semicolon-in-acc-descr-block]
  [fixture: requirement/tokens-ignored-semicolon-in-name]
  [fixture: requirement/lex-value-semicolon]
  [fixture: requirement/lex-style-semicolon]
- style の値は、
  その RequirementLiteral の中にあるトークンの変換した形をつないだものです。
  style の単位の間の空白はトークンではないので、値には含まれません。
  `style r fill: red , stroke : blue` の style は、`fill:red` と `stroke:blue`、
  `style r fill:red stroke:blue` の style は、
  1 つの `fill:redstroke:blue` です。 [fixture: requirement/lex-style-spaces]
  [fixture: requirement/lex-style-no-comma]
  [fixture: requirement/db-style-statement]
  [fixture: requirement/lex-style-hash-after-style]
  [fixture: requirement/lex-directive-in-style]
- アクセシビリティ文のテキストは、
  その RequirementLiteral の範囲の変換した形から、両端の空白を除いたものです。
  mermaid.js がそう trim します。 [fixture: requirement/db-acc-title-descr]
  [fixture: requirement/lex-acc-title-no-space]
  [fixture: requirement/lex-acc-title-directive-adjacent-whitespace]
  [fixture: requirement/lex-acc-title-trailing-nbsp]
  [fixture: requirement/gram-acc-title-line-feed-then-text]

**巡り。**
本体の文は出現順に実行し、文は、それがある時点で Db を変えます。
`class` の文が、そのクラスの `classDef` より前にあれば、
その時点でクラスの style は渡らず、
あとの `classDef` が渡します（**クラスと style** を参照）。
文と文の間のコメント行、ディレクティブの行、空行、空白だけの行は、
文ではありません。
`%%` だけの行は図のコメントで、これも文ではありません。
空の description ブロック、
つまりテキストのない RequirementAccDescrBlockStatement は、何も変えません。
そのまわりの文は、それがないものとして実行されます。
文が始まりうる場所ならどこでも同じで、
ヘッダーの後ろでも `}` の後ろでもそうです。 [fixture: requirement/db-class-statement-before-def]
[fixture: requirement/lex-bare-percent-line-after-statement]
[fixture: requirement/lex-percent-brace-line]
[fixture: requirement/lex-whitespace-line-separator-between-statements]
[fixture: requirement/gram-acc-descr-block-empty]
[fixture: requirement/gram-acc-descr-block-directive-only]
[fixture: requirement/header-empty-description-block]
[fixture: requirement/gram-empty-description-block-after-close-brace]
[fixture: requirement/db-comment-lines-between-statements]
[fixture: requirement/db-directive-line-between-statements]
[fixture: requirement/db-empty-description-block-keeps-acc-descr-line]
[fixture: requirement/db-empty-description-block-keeps-acc-descr-block]
[fixture: requirement/db-style-before-definition]

**既定値。**
文がなければ、Db の direction は `TB` で、
`accTitle` と `accDescr` は空のテキスト、
タイトルはフロントマターのタイトル（なければ空のテキスト）です。
requirement、element、リレーションシップ、
クラス定義はありません。 [fixture: requirement/header-only]
[fixture: requirement/db-frontmatter-title]

**direction、タイトル、アクセシビリティ。**
`direction` は、本体の最後の direction の文の direction で、
木は大文字で持ちます。
direction の文がなければ `TB` です。
direction の行は行全体で読みます。
`direction` の前と値の後ろのテキストは、Db にありません。
`a - satisfies -> direction LR` のような行は、direction を設定し、
リレーションシップを加えません。
タイトルはフロントマターのもので、文字の置き換え（下を参照）をします。
この図に、タイトルの文はありません。 [fixture: requirement/lex-title-statement]
`accTitle` は最後の `accTitle` の文のテキストに文字の置き換えをしたもので、
なければ空のテキストです。
`accDescr` は、最後の `accDescr` の文か、
テキストのある description ブロックのテキストです。
各改行は、その後ろの空白（改行も含む）とともに 1 つの改行に置き換え、
そのあと文字の置き換えをします。
テキストのない description ブロックは何も変えません。
テキストは後の行から始まってもかまいません。
`accTitle:` の次の行が `T` なら、
タイトルは `T` です。 [fixture: requirement/db-direction-last-wins]
[fixture: requirement/db-direction-lower-case]
[fixture: requirement/lex-direction-tb-first]
[fixture: requirement/lex-direction-line-text-before-and-after]
[fixture: requirement/lex-direction-value-suffix]
[fixture: requirement/lex-direction-in-relationship-line]
[fixture: requirement/lex-direction-line-before-classdef]
[fixture: requirement/spec-requirement-diagram-7522200d]
[fixture: requirement/spec-requirement-diagram-08cfba06]
[fixture: requirement/spec-requirement-diagram-34fcfcee]
[fixture: requirement/spec-requirement-diagram-6d165a76]
[fixture: requirement/db-frontmatter-title]
[fixture: requirement/db-acc-title-descr]
[fixture: requirement/db-acc-descr-block]
[fixture: requirement/gram-acc-title-line-feed-then-text]
[fixture: requirement/spec-requirement-diagram-e5ae8f38]
[fixture: requirement/spec-requirement-diagram-27be7222]
[fixture: requirement/db-acc-descr-line-then-block]
[fixture: requirement/db-acc-descr-block-then-line]
[fixture: requirement/db-acc-descr-block-blank-line]
[fixture: requirement/db-acc-descr-block-spaces-before-line-feed]

**Requirements。**
requirement の文は、その名前の requirement がなければ requirements に加え、
そのあと `:::` の後のクラスを、
その名前の対象に渡します（**クラスと style** を参照）。
requirement は名前で保ち、文が初めてその名前を挙げた順に並べます。

- requirement は、名前、kind が表す `type`、欄の `requirementId`、`text`、
  `risk`、`verifyMethod` を持ち、 style は持ちません。
  本体が設定しない欄は、空のテキストです。
  木の語に Db が与える名前は、次の表のとおりです。

  | 木の語                   | Db の名前                 |
  | ------------------------ | ------------------------- |
  | `requirement`            | `Requirement`             |
  | `functionalRequirement`  | `Functional Requirement`  |
  | `interfaceRequirement`   | `Interface Requirement`   |
  | `performanceRequirement` | `Performance Requirement` |
  | `physicalRequirement`    | `Physical Requirement`    |
  | `designConstraint`       | `Design Constraint`       |
  | `low`                    | `Low`                     |
  | `medium`                 | `Medium`                  |
  | `high`                   | `High`                    |
  | `analysis`               | `Analysis`                |
  | `demonstration`          | `Demonstration`           |
  | `inspection`             | `Inspection`              |
  | `test`                   | `Test`                    |

  [fixture: requirement/db-requirement-all-fields]
  [fixture: requirement/db-requirement-defaults]
  [fixture: requirement/db-requirement-order]
  [fixture: requirement/db-keywords-upper-case]
  [fixture: requirement/lex-risk-method-mixed-case]
  [fixture: requirement/spec-requirement-diagram-54ea0a9d]
  [fixture: requirement/spec-requirement-diagram-d1dc0373]
  [fixture: requirement/spec-requirement-diagram-17e0a905]
  [fixture: requirement/spec-requirement-diagram-f221edee]
  [fixture: requirement/spec-requirement-diagram-0e21244e]
  [fixture: requirement/spec-requirement-diagram-06f108a7]
  [fixture: requirement/spec-requirement-diagram-4a3ca536]
  [fixture: requirement/spec-requirement-diagram-f64fbd88]
  [fixture: requirement/spec-requirement-diagram-1a2f68fa]
  [fixture: requirement/spec-requirement-diagram-1e009b06]

- Db は本体の欄を後ろから前へ適用します。
  そのため、同じ種類の欄が複数あれば、最初のものが残ります。
  `id` が 2 つあれば、最初のものが id です。
  本体の項目のうち RequirementIgnoredText、つまり空の description ブロックは、
  どこにあっても欄ではありません。
  本体の中のコメント行、ディレクティブの行、空行、空白だけの行は、
  項目ではありません。 [fixture: requirement/db-requirement-fields-repeated]
  [fixture: requirement/gram-empty-description-block-in-body]
  [fixture: requirement/gram-empty-description-block-after-brace]
  [fixture: requirement/gram-empty-description-block-before-field]
  [fixture: requirement/gram-empty-description-block-after-string-value]
  [fixture: requirement/gram-empty-description-block-before-close-brace]
  [fixture: requirement/gram-empty-description-block-space-in-body]
  [fixture: requirement/gram-empty-description-blocks-adjacent-in-body]
  [fixture: requirement/tokens-comment-line-in-body]
  [fixture: requirement/tokens-comment-line-after-brace]
  [fixture: requirement/lex-blank-lines-in-body]
  [fixture: requirement/lex-directive-at-end-of-field-line]
  [fixture: requirement/lex-directive-line-in-body]
  [fixture: requirement/lex-whitespace-only-line-in-body]
- すでにある requirement と同じ名前の文は、kind が何であっても、
  その requirement の欄を、本体も含めて何も変えません。
  requirement と element は同じ名前を持てます。
  名前はどんな名前でもよく、
  `__proto__` や `constructor` も同じです。 [fixture: requirement/db-requirement-name-repeated]
  [fixture: requirement/db-requirement-and-element-same-name]
  [fixture: requirement/spec-requirement-diagram-7e4de658]
  [fixture: requirement/spec-requirement-diagram-dec8a0d9]
  [fixture: requirement/db-requirement-definition-again-with-class]
- `requirementId` と `text` は、
  最初の `id` の欄と最初の `text` の欄の値のテキストです。
  引用符付きの値は空白も含め、
  引用符なしの値は両端の空白を除いたものです。 [fixture: requirement/db-requirement-quoted-values]
  [fixture: requirement/db-requirement-value-spaces]

**Elements。**
element の文は、その名前の element がなければ elements に加え、
そのあと `:::` の後のクラスを、
その名前の対象に渡します（**クラスと style** を参照）。
element は、
最初の `type` の欄と最初の `docref` の欄の `type` と `docRef` を持ちます。
これらはどんなテキストでもよく、本体が設定しなければ空のテキストです。
すでにある名前は、本体も含めて element の欄を何も変えません。
本体は requirement の本体と同じように読みます。 [fixture: requirement/db-element-fields]
[fixture: requirement/db-element-defaults]
[fixture: requirement/db-element-fields-repeated]
[fixture: requirement/db-element-name-repeated]
[fixture: requirement/gram-empty-description-block-in-element-body]
[fixture: requirement/gram-element-docref-quoted-url]
[fixture: requirement/spec-requirement-diagram-aa701d4f]
[fixture: requirement/spec-requirement-diagram-20d637a1]
[fixture: requirement/spec-requirement-diagram-29c59902]
[fixture: requirement/db-element-definition-with-class-of-requirement]
[fixture: requirement/db-element-definition-again-with-class]

**リレーションシップ。**
リレーションシップの文は、リレーションシップを 1 つ加えます。
同じものがすでにあっても加えます。
`type` は、木のリレーションシップを小文字にしたものです。
`src` と `dst` は、arrow が `forward` なら左の名前と右の名前、
`backward` なら右の名前と左の名前です。
`b <- copies - a` は a から b へのリレーションシップです。
名前は requirement や element のものでなくてもよく、
文はどちらも加えません。 [fixture: requirement/db-relationship-arrows]
[fixture: requirement/gram-relationship-glued]
[fixture: requirement/gram-relationship-backward-glued]
[fixture: requirement/lex-relationship-upper-case]
[fixture: requirement/db-relationship-quoted-names]
[fixture: requirement/db-relationship-undefined-names]
[fixture: requirement/db-relationships-repeated]
[fixture: requirement/spec-requirement-diagram-ef787489]
[fixture: requirement/spec-requirement-diagram-50b3d65a]
[fixture: requirement/spec-requirement-diagram-7dfbfd0b]
[fixture: requirement/spec-requirement-diagram-bbf167e5]
[fixture: requirement/spec-requirement-diagram-d742a321]
[fixture: requirement/spec-requirement-diagram-3adb8f93]
[fixture: requirement/spec-requirement-diagram-3b9d9ff5]

**クラスと style。**
**名前の対象**は、その名前の requirement で、
requirement がなければその名前の element です。
どちらでもない名前に、対象はありません。
requirement と element は、どれも最初にクラス `default` を持ちます。
要約はそれを除くので、`default` を挙げる文は 2 つ目の `default` を与えます。

- `style` の文は、各名前の対象の `cssStyles` に、文の style を順に加えます。
  名前の順に進み、対象のない最初の名前で止まります。
  それより後ろの名前には何も渡りません。
  複数の文の style は積み重なります。
  requirement と element が同じ名前を持つときは、
  requirement が style を得ます。 [fixture: requirement/db-style-statement]
  [fixture: requirement/db-style-unknown-name]
  [fixture: requirement/db-class-statement-unknown-name-first]
  [fixture: requirement/db-requirement-and-element-same-name]
  [fixture: requirement/lex-style-string-name]
  [fixture: requirement/spec-requirement-diagram-5305b791]
  [fixture: requirement/spec-requirement-diagram-e39bdc99]
  [fixture: requirement/spec-requirement-diagram-5ee6d26d]
- `class` の文、クラスの省略形の文（`r:::a,b`）、
  requirement や element の頭にある `:::` の後ろのクラスは、
  各名前の対象の `classes` に、クラスを順に加えます。
  名前の順に進み、対象のない名前は飛ばして、
  それより後ろの名前にもクラスを渡します。
  クラスごとに、対象は、
  その時点でそのクラスが持つ style を `cssStyles` の後ろに加えます。
  クラスに `classDef` は要りません。
  同じクラスを 2 回挙げれば、
  2 回残ります。 [fixture: requirement/db-class-statement]
  [fixture: requirement/db-class-statement-unknown-name-first]
  [fixture: requirement/db-class-colon-form]
  [fixture: requirement/db-class-in-definition]
  [fixture: requirement/db-class-default-name]
  [fixture: requirement/gram-class-comma-spaces]
  [fixture: requirement/gram-class-shorthand-spaced]
  [fixture: requirement/gram-class-string-class]
  [fixture: requirement/lex-class-list-next-line]
  [fixture: requirement/lex-class-list-comma-next-line]
  [fixture: requirement/lex-class-strings-next-line]
  [fixture: requirement/spec-requirement-diagram-6bb10181]
  [fixture: requirement/spec-requirement-diagram-5128588b]
  [fixture: requirement/spec-requirement-diagram-a55d1b35]
  [fixture: requirement/spec-requirement-diagram-a8854583]
  [fixture: requirement/db-class-given-twice]
  [fixture: requirement/db-class-statements-same-class-twice]
- `classDef` の文は、各名前の定義に文の style を順に加えます。
  定義がなければ、一覧の最後に作ります。
  そのあと、
  その時点でそのクラスを持つすべての requirement と element の `cssStyles` にも、
  同じ style を加えます。
  クラス `default` もそうです。
  そのため、クラスが style を渡す機会は 2 つあります。
  メンバーがクラスに加わるとき、そのクラスがそれまでに定義されていれば、
  そしてクラスが定義されるとき、そのときのメンバーに対してです。
  同じ名前の 2 つ目の `classDef` は、最初の定義に style を足し、
  位置は動かしません。
  どの requirement も element も使わない定義も残ります。 [fixture: requirement/db-class-def]
  [fixture: requirement/db-class-def-default-all]
  [fixture: requirement/db-class-statement-before-def]
  [fixture: requirement/db-class-styles-order]
  [fixture: requirement/db-class-styles-order-defined-first]
  [fixture: requirement/lex-classdef-string-name]
  [fixture: requirement/spec-requirement-diagram-7ee9ffc8]
  [fixture: requirement/spec-requirement-diagram-f9464f3d]
  [fixture: requirement/spec-requirement-diagram-0799fd14]
  [fixture: requirement/db-class-def-id-twice]

**要約。**
要約は [db-summaries.ja.md](../db-summaries.ja.md#requirement) の欄を持ちます。
上の値と、列の順に並べた requirement、element、リレーションシップ、
クラス定義です。

## 文字の置き換え

Db が `sanitizeText` に通すテキストは 3 つで、タイトル、`accTitle`、
`accDescr` です。
`requirementDbOf()` は、
[db-from-tree.ja.md](../db-from-tree.ja.md#文字の置き換え)の置き換え `textReplacementOf(embedded.config)` を、
これらのテキストにだけ適用します。
名前、id、text、type、参照、リレーションシップの名前、クラス、style は、
書かれたとおりです。
フロントマターのタイトルは置き換えます。
`accDescr` は、行をつないだあとで置き換え、
ブロックも行と同じように置き換えます。 [fixture: requirement/config-security-level-other-title]
[fixture: requirement/config-security-level-other-acc-title]
[fixture: requirement/config-security-level-other-acc-descr]
[fixture: requirement/config-security-level-other-acc-descr-block]
[fixture: requirement/config-security-level-other-html-labels-false]
[fixture: requirement/config-security-level-other-names-as-written]

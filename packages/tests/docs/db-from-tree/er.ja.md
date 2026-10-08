# ER の Db を木から作る

英語版: [er.md](./er.md)

ER 図の木から Db の要約を作る手順です。
`src/db-from-tree/er.ts` がこれを実装します
（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、仕様の
[diagrams/er.ja.md](../../../spec/docs/diagrams/er.ja.md) と
[ast/er.ja.md](../../../spec/docs/ast/er.ja.md) が定めます。
要約の欄は [db-summaries.ja.md](../db-summaries.ja.md#er) にあります。

mermaid.js は、構文解析の間に Db を作ります。
文法は、文が終わるたびに Db のメソッドを呼びます
（[`addEntity`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L61-L81)、
[`addAttributes`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L95-L110)、
[`addRelationship`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L120-L154)、
[`addCssStyles`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L182-L207)、
[`addClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L209-L227)、
[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L229-L297)、
[`setClass`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/erDb.ts#L303-L319)）。
また、文の規則の動作は値を返し、
その値を、まわりの subgraph が並べることがあります
（[`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/er/parser/erDiagram.jison#L121-L198)）。
要約も同じように作ります。
文を出現順に実行し、Db が持つ列がそのまま要約です。
値は、空白を含めて Db が持つとおりに保ちます。
id を無作為に作ることはなく、レイアウトのデータから取る値もありません。

## 木から要約を作る

**変換した形。**
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティは、名前の中でもテキストの中でもプレースホルダです。
`A#amp; ||--o{ B : x` はエンティティ `Aﬂ°amp¶ß` からの関係を持ちます。
引用符付きの名前、別名、ロール（引用符付きでも、なくても）、
属性のコメントとバッククォートの語、クラス名、style、
subgraph の id と title、アクセシビリティのテキストでも同じです。
同じ形では、各行終端（`\r\n` と単独の `\r` も）を `\n` として読みます。
これはバッククォートの語、コメント、ロールの文字列の中でのことです。
各属性の引用符は `'` として読みます。
これは引用符付きの名前、ロールの文字列、コメントの中でのことです。
U+2028 は行終端ではなく、値の中にそのまま残ります。
[fixture: er/entity-placeholder-in-name]
[fixture: er/entity-placeholder-in-quoted-name] [fixture: er/db-alias-entity]
[fixture: er/db-role-entity] [fixture: er/db-role-quoted-entity]
[fixture: er/db-attribute-comment-entity]
[fixture: er/db-attribute-backquoted-entity] [fixture: er/db-class-name-entity]
[fixture: er/db-style-entity] [fixture: er/db-class-def-entity]
[fixture: er/db-subgraph-id-entity] [fixture: er/db-subgraph-title-entity]
[fixture: er/db-acc-title-entity] [fixture: er/db-acc-descr-entity]
[fixture: er/db-acc-descr-block-entity]
[fixture: er/db-attribute-backquoted-crlf]
[fixture: er/db-attribute-comment-crlf]
[fixture: er/db-attribute-comment-lone-cr] [fixture: er/db-role-string-crlf]
[fixture: er/db-entity-name-attribute-quote]
[fixture: er/db-role-attribute-quote]
[fixture: er/db-attribute-comment-attribute-quote]
[fixture: er/db-attribute-comment-line-separator]

**テキスト。**
木の葉ノードのテキストは、次のように読みます。

- ErIdentifier は、その範囲の変換した形を持ちます。
  `name` は木が持つ書かれたとおりのテキストで、
  Db が持つのは mermaid.js が読むとおりのテキストです。
  そのため、`A`、U+00A0、`B` は、ノーブレークスペースを含む 1 つの名前で、
  `12` や `2.5` のような数は、その数字の名前です。
  [fixture: er/db-entity-name-no-break-space]
  [fixture: er/db-entity-name-line-separator]
  [fixture: er/db-entity-name-numbers] [fixture: er/db-alias-line-separator]
- StringLiteral は、その範囲の変換した形から区切りを除いたものを持ちます。
  区切りは、引用符付きの名前、ロール、コメントの引用符と、
  属性の語のバッククォートです。
  そのため `"A B"` は名前 `A B` で、そのエンティティの id は
  `entity-A B-0` です。
  引用符付きの名前と、同じテキストの引用符なしの名前は、1 つのエンティティです。
  [fixture: er/db-entity-name-quoted-spaces]
  [fixture: er/db-entity-name-quoted-same-as-bare]
  [fixture: er/db-entity-name-quoted-line-separator]
  [fixture: er/db-role-quoted] [fixture: er/db-attribute-backquoted]
  [fixture: er/db-attribute-comment-spaces]
- ディレクティブが文字列の単位やテキストの単位の中にあっても、
  変換した形にはないので、テキストにもありません。
  ロール `x%%{init: {}}%%y` は `xy` です。
  文字列の中のコメント行も同じです。
  [fixture: er/lex-directive-in-role-string]
  [fixture: er/lex-directive-in-quoted-name]
  [fixture: er/lex-directive-in-comment-string]
  [fixture: er/lex-directive-in-backquoted-word]
  [fixture: er/lex-directive-in-tilde-word]
  [fixture: er/lex-directive-in-acc-title]
  [fixture: er/lex-directive-in-acc-descr-block]
  [fixture: er/tokens-comment-line-in-role-string]
  [fixture: er/tokens-comment-line-in-comment-string]
  [fixture: er/tokens-comment-line-in-backquoted-word]
- 行規則が無視する `;` も、文字列やテキストの中では変換した形にありません。
  そのため、引用符付きの名前、別名、コメント、ロール、
  subgraph の title は、それを除いたテキストを持ちます。
  名前、数、キー、属性ブロックの語では、`;` がその単位を切り、
  入力は拒否されます
  （[既知の差異](../../../spec/docs/diagrams/er.ja.md#既知の差異)を参照）。
  [fixture: er/db-entity-name-quoted-ignored-semicolon]
  [fixture: er/db-alias-ignored-semicolon]
  [fixture: er/db-subgraph-title-ignored-semicolon]
  [fixture: er/db-attribute-comment-ignored-semicolon]
  [fixture: er/tokens-ignored-semicolon-after-role]
  [fixture: er/tokens-ignored-semicolon-in-role-string]
  [fixture: er/div-ignored-semicolon-in-name]
  [fixture: er/div-ignored-semicolon-in-key]
  [fixture: er/div-ignored-semicolon-in-attribute-word]
- style の値は、その ErLiteral の中にあるトークンの変換した形を
  つないだものです。
  style の単位の間の空白はトークンではないので、値には含まれません。
  `classDef a fill : #f9f` は `fill:#f9f` を定義し、
  `classDef a fill:red stroke:blue` は 1 つの style `fill:redstroke:blue` を
  定義します。
  一方、U+2028 のように単位に属する空白文字は残ります。
  style の中のエンティティはそのプレースホルダで、
  行規則が無視する `;` は値にありません。
  [fixture: er/lex-classdef-style-spaces]
  [fixture: er/lex-classdef-styles-joined] [fixture: er/lex-style-styles-joined]
  [fixture: er/db-class-def-line-separator]
  [fixture: er/db-style-line-separator]
  [fixture: er/db-style-ignored-semicolon-last-only]
  [fixture: er/db-class-def-ignored-semicolon]
  [fixture: er/lex-directive-in-style-text]
- アクセシビリティ文のテキストは、その ErLiteral の範囲の変換した形から、
  両端の空白を除いたものです。mermaid.js がそう trim します。
  [fixture: er/db-acc-title-trailing-space] [fixture: er/db-acc-title-spaces]
  [fixture: er/lex-acc-descr-block-trailing-spaces]

**巡り。**
本体の文は出現順に実行します。
文は Db を変え、値を返します。
返された値が効くのは subgraph だけです（**Subgraphs** を参照）。
subgraph は、本体の文の値を並べます。
エンティティ文は名前を返します。
リレーションシップ文は、左のエンティティの名前、次に右のものを返します。
subgraph 文は自分の id を返します。
`classDef`、`class`、`style` の文は、書かれたままのキーワードを返します。
これは文の最初のトークンのテキストです。
`accTitle` と `accDescr` の文と、テキストのある description ブロックは、
両端の空白を除いたテキストを返します。
direction 文と、テキストのない description ブロックは、何も返しません。
文の間のコメント行、ディレクティブ行、空行、空白だけの行は、文ではありません。
2 つのエンティティの間の空の description ブロックがあっても、
両方とも実行されます。
[fixture: er/db-comment-line] [fixture: er/db-directive-line]
[fixture: er/db-empty-line] [fixture: er/db-whitespace-line]
[fixture: er/gram-empty-description-block-between-names]
[fixture: er/header-empty-description-block]

**エンティティ。**
エンティティは名前で持ち、文が最初に名前を出した順に並べます。

- エンティティ文は、その名前のエンティティがなければ追加し、
  次に別名を与え、次に属性を追加し、次にクラスを追加します。
  リレーションシップ文は、左の名前のエンティティ、次に右の名前のエンティティを
  追加し、次にリレーションシップを追加し、
  次に左のエンティティのクラス、次に右のもののクラスを追加します。
  `class` 文、`style` 文、`classDef` 文は、エンティティを追加しません。
  [fixture: er/db-name-twice] [fixture: er/db-class-undefined-entity]
  [fixture: er/db-style-undefined-entity] [fixture: er/db-class-def-unused]
- 新しいエンティティの `id` は `entity-<name>-<number>` で、
  number はそれを作ったときに存在したエンティティの数です。
  0 から、最初に現れた順に番号を付けます。
  現れる場所は、リレーションシップ、別名・クラス・ブロックのあるエンティティ文、
  subgraph の本体のどこでもかまいません。
  名前は大文字と小文字を区別します。
  [fixture: er/basic-entity] [fixture: er/db-entity-ids-first-appearance]
  [fixture: er/db-entity-ids-statement-kinds] [fixture: er/db-entity-names-case]
- エンティティから自分自身へのリレーションシップは、両端が同じ `id` です。
  [fixture: er/db-entity-relationship-self] [fixture: er/db-relationship-self]
- エンティティは subgraph の名前を持ってもよく、その前でも後でも、
  両方が存在します。
  [fixture: er/db-subgraph-id-as-name-after]
  [fixture: er/db-subgraph-id-as-name-before]
- `alias` は文の別名のテキストか、空のテキストです。
  文は、別名のないエンティティに別名を加えます。
  リレーションシップが作ったエンティティにも加えます。
  別名のあるエンティティの別名は、決して変えません。
  別名のない文は何も変えません。
  [fixture: er/db-alias-first-kept] [fixture: er/db-alias-set-after-entity]
  [fixture: er/db-alias-after-relationship] [fixture: er/db-alias-after-plain]
  [fixture: er/db-alias-second-ignored] [fixture: er/db-alias-forms]
  [fixture: er/db-alias-with-attributes] [fixture: er/db-alias-with-class]
  [fixture: er/db-alias-empty-block]
  [fixture: er/db-alias-first-kept-directive-line]

**属性。**
ブロックのあるエンティティ文は、ブロックの属性を、書かれた順に、
エンティティがすでに持つ属性の後ろに加えます。
同じエンティティの 2 つのブロックの属性は足し合わされ、
同じ名前の属性も同様です。
属性のないブロックは何も加えません。
ブロックの項目のうち ErIgnoredText、つまり `empty-backquotes` の単位は、
属性ではありません。
ブロックの中のコメント行、ディレクティブ行、空行、空白だけの行はテキストでは
なく、ブロックの中の `direction RL` は属性です。
[fixture: er/db-attribute-order] [fixture: er/db-attribute-blocks-add-up]
[fixture: er/db-block-twice] [fixture: er/db-attribute-block-empty]
[fixture: er/db-attribute-block-empty-after-attributes]
[fixture: er/db-attribute-block-entity-from-relationship]
[fixture: er/db-attribute-block-one-line]
[fixture: er/db-attribute-blocks-add-up-comment-line]
[fixture: er/gram-empty-backquotes-between-attributes]
[fixture: er/gram-empty-backquotes-before-first]
[fixture: er/gram-empty-backquotes-after-last]
[fixture: er/gram-empty-backquotes-alone]
[fixture: er/gram-empty-backquotes-twice]
[fixture: er/db-attribute-block-comment-line]
[fixture: er/db-attribute-block-directive-line]
[fixture: er/db-attribute-block-empty-line]
[fixture: er/db-attribute-block-whitespace-line]
[fixture: er/db-attribute-block-crlf] [fixture: er/db-attribute-block-cr]
[fixture: er/db-attribute-block-direction-text]

属性は次の 4 つの値を持ちます。

- `type` は `dataType` のテキストで、`optional` が true なら `?` を後ろに
  付けます。
  語は、長さ、ジェネリクスの印、角括弧、`_`、`-`、`.` を持てます。
  チルダの語は中の空白を保ちます。
  バッククォートの語はバッククォートを持たず、空白を含められます。
  語の中の U+2028 は残ります。
  [fixture: er/db-attribute-type-question-mark]
  [fixture: er/db-attribute-type-length] [fixture: er/db-attribute-type-generic]
  [fixture: er/db-attribute-type-brackets]
  [fixture: er/db-attribute-name-characters]
  [fixture: er/db-attribute-backquoted]
  [fixture: er/db-attribute-name-line-separator]
  [fixture: er/lex-backquote-optional]
  [fixture: er/lex-tilde-then-optional-mark]
  [fixture: er/lex-tilde-space-inside]
- `name` は `name` のテキストです。
  [fixture: er/db-attribute-order] [fixture: er/db-attribute-backquoted]
- `keys` はキーのテキストを、順に、書かれたままで並べたものです。
  繰り返したキーは 2 回現れ、キーがなければ空のリストです。
  [fixture: er/db-attribute-keys] [fixture: er/db-attribute-keys-case]
  [fixture: er/db-attribute-defaults]
- `comment` は引用符の間のコメントのテキストで、空白を含みます。
  コメントが空なら空のテキストで、コメントがなくても空のテキストです。
  [fixture: er/db-attribute-comment-with-keys]
  [fixture: er/db-attribute-comment-spaces]
  [fixture: er/db-attribute-comment-empty] [fixture: er/db-attribute-defaults]

**クラスと style。**
文は、**名前の対象**にクラスや style を加えます。
名前の対象は、その時点で Db にその名前のエンティティがあればそのエンティティと、
その時点で Db にその名前の subgraph があればその subgraph です。
どちらでもない名前には何も加えず、その名前を作ることもありません。
エンティティや subgraph より前にある文は、それらに対して何も変えません。
2 つの subgraph が同じ id を持つときは、
文より前に終わった、最後のほうの subgraph です。
どちらでもある名前は、エンティティと subgraph の両方でクラスを得ます。
名前は、そのノードのテキストとして読みます。
subgraph の id は、trim したテキストです（**Subgraphs** を参照）。

- エンティティ文のクラス（`A:::c1,c2`）と、
  リレーションシップ文の左のエンティティのクラスと右のもののクラスは、
  そのエンティティ名の対象に、この順で、クラスの順に加えます。
  `class` 文は、そのクラスを、順に、各名前の対象へ、名前の順に加えます。
  2 回与えたクラスは 2 回残ります。`classDef` は要りません。
  [fixture: er/db-class-separator]
  [fixture: er/db-class-separator-relationship-first]
  [fixture: er/db-class-separator-relationship-second]
  [fixture: er/db-class-separator-relationship-both]
  [fixture: er/db-class-separator-relationship-same-entity]
  [fixture: er/db-class-separator-block] [fixture: er/db-class-statement-ids]
  [fixture: er/db-class-statement-repeat] [fixture: er/db-class-twice]
  [fixture: er/db-class-without-class-def] [fixture: er/db-class-list-spaces]
  [fixture: er/db-class-named-default]
  [fixture: er/db-class-name-line-separator]
  [fixture: er/db-class-undefined-entity] [fixture: er/db-class-before-entity]
  [fixture: er/db-subgraph-class-statement]
  [fixture: er/db-subgraph-class-before-definition]
  [fixture: er/db-subgraph-same-id-class-last]
  [fixture: er/db-subgraph-entity-and-subgraph-style]
  [fixture: er/db-class-subgraph]
- `style` 文は、その style を、順に、各名前の対象の `cssStyles` に加えます。
  複数の文の style は足し合わされます。
  [fixture: er/db-style-statement] [fixture: er/db-style-twice]
  [fixture: er/db-style-id-list-spaces] [fixture: er/db-style-undefined-entity]
  [fixture: er/db-style-before-entity] [fixture: er/db-style-non-ascii]
  [fixture: er/db-style-semicolon-separator]
  [fixture: er/db-style-ignored-semicolon]
  [fixture: er/db-style-ignored-semicolon-two-statements]
  [fixture: er/db-style-subgraph] [fixture: er/db-subgraph-style-statement]
  [fixture: er/db-subgraph-class-before-definition]

**リレーションシップ。**
リレーションシップ文は、リレーションシップを 1 つ加えます。

- `entityA` と `entityB` は、左と右の名前について、
  その時点で Db にその id の subgraph があればその名前そのものです。
  なければ、その名前のエンティティの `id` です。
  subgraph は `end` を読んだときに加わるので、
  自分の本体の中のリレーションシップや、それより前のものはエンティティを指し、
  後のものは subgraph を指します。エンティティはどちらにしても作られます。
  名前は trim しません。`" S "` は subgraph `S` ではありません。
  ノードのない subgraph も数えます。
  [fixture: er/db-relationship-to-subgraph-after]
  [fixture: er/db-relationship-to-subgraph-before]
  [fixture: er/db-subgraph-relationship-after]
  [fixture: er/db-subgraph-relationship-before]
  [fixture: er/db-subgraph-relationship-inside]
  [fixture: er/db-subgraph-relationship-two-subgraphs]
  [fixture: er/db-subgraph-relationship-empty-subgraph]
  [fixture: er/db-subgraph-id-trimmed]
  [fixture: er/db-relationship-quoted-entities]
  [fixture: er/db-relationship-source-order]
- `roleA` はロールのテキストです。名前、引用符付きの名前、
  または文字列で、文字列は空でもかまいません。
  [fixture: er/db-role-word] [fixture: er/db-role-quoted]
  [fixture: er/db-role-quoted-empty] [fixture: er/db-role-quoted-percent]
  [fixture: er/db-role-non-ascii] [fixture: er/db-role-line-separator]
  [fixture: er/db-role-quoted-line-separator]
- `cardA` はリレーションシップの `rightCardinality` の名前、
  `cardB` は `leftCardinality` の名前です。
  線が `relType` を与えます。
  名前は、`-` を `_` にした大文字で、次の表に書き出します。

  | 木の語            | Db の名前         |
  | ----------------- | ----------------- |
  | `zero-or-one`     | `ZERO_OR_ONE`     |
  | `zero-or-more`    | `ZERO_OR_MORE`    |
  | `one-or-more`     | `ONE_OR_MORE`     |
  | `only-one`        | `ONLY_ONE`        |
  | `md-parent`       | `MD_PARENT`       |
  | `identifying`     | `IDENTIFYING`     |
  | `non-identifying` | `NON_IDENTIFYING` |

  [fixture: er/db-cardinality-sides]
  [fixture: er/db-cardinality-symbol-either-side]
  [fixture: er/db-cardinality-symbols-zero-or-one]
  [fixture: er/db-cardinality-symbols-zero-or-more]
  [fixture: er/db-cardinality-symbols-one-or-more]
  [fixture: er/db-cardinality-symbols-only-one]
  [fixture: er/db-cardinality-parent] [fixture: er/db-cardinality-words-case]
  [fixture: er/db-relationship-type-to] [fixture: er/db-relationship-type-dots]
  [fixture: er/db-relationship-type-dot-dash]
  [fixture: er/db-relationship-type-dash-dot]
  [fixture: er/db-relationship-type-optionally-to]

**クラスの定義。**
`classDef` 文は、その style を、順に、各名前の定義に加えます。
定義がなければ、列の末尾に作ります。
同じ名前の 2 つ目の `classDef` は、
style を最初の定義に加え、位置は動かしません。
どのエンティティも使わない定義も残り、名前 `default` もほかの名前と同じです。
style は文の style のテキストで、`color` を含むものも含みます。
[fixture: er/db-class-def-styles] [fixture: er/db-class-def-several-styles]
[fixture: er/db-class-def-twice] [fixture: er/db-class-def-twice-empty-line]
[fixture: er/db-class-def-ids] [fixture: er/db-class-def-unused]
[fixture: er/db-class-def-default] [fixture: er/db-classdef-twice]
[fixture: er/db-classdef-color-style]
[fixture: er/db-class-def-semicolon-separator]

**Subgraphs。**
subgraph 文は、本体を実行してから subgraph を加え、その id を返します。
内側の subgraph は、まわりの subgraph より先に加わります。
subgraph は次の値を持ちます。

- `id` は id のテキストから両端の空白を除いたもので、
  その空白には U+2028 を含みます。
  引用符付きの id は中の空白を保ちます。
  2 つの subgraph が同じ id を持ってもかまいません。
  [fixture: er/db-subgraph-id-quoted] [fixture: er/db-subgraph-id-trimmed]
  [fixture: er/db-subgraph-string-id-trimmed]
  [fixture: er/db-subgraph-id-line-separator]
  [fixture: er/db-subgraph-same-id-twice]
  [fixture: er/db-subgraph-nested-same-id]
- `title` は、角括弧の中の名前のテキストを 1 つの空白でつないだもの、
  角括弧がなければ id のテキストです。
  それに文字の置き換え（下を参照）をして、両端の空白を除きます。
  [fixture: er/db-subgraph-title-words] [fixture: er/db-subgraph-title-quoted]
  [fixture: er/db-subgraph-title-spaces-collapse]
  [fixture: er/db-subgraph-title-quoted-and-bare]
  [fixture: er/db-subgraph-title-trimmed]
  [fixture: er/db-subgraph-title-line-separator]
  [fixture: er/db-subgraph-no-title] [fixture: er/db-subgraph-id-quoted]
- `nodes` は、本体の文が返した値を順に並べたものです。
  空白だけの値と、trim したテキストが先の値の trim したテキストと
  等しい値は除きます。
  そのあと、先の subgraph が並べた値を、そのままの形で比べて除きます。
  値は空白を含めてそのまま残ります。
  空の subgraph は何も持ちません。
  入れ子の subgraph は先に終わるので、それが並べた名前は、
  まわりの subgraph のノードではありません。
  [fixture: er/db-subgraph-empty] [fixture: er/db-subgraph-nested]
  [fixture: er/db-subgraph-nodes-relationship]
  [fixture: er/db-subgraph-nodes-block] [fixture: er/db-subgraph-nodes-alias]
  [fixture: er/db-subgraph-nodes-class-separator]
  [fixture: er/db-subgraph-nodes-untrimmed]
  [fixture: er/db-subgraph-nodes-trimmed-then-untrimmed]
  [fixture: er/db-subgraph-nodes-two-untrimmed]
  [fixture: er/db-subgraph-nodes-blank-name]
  [fixture: er/db-subgraph-nodes-quoted-name]
  [fixture: er/db-subgraph-nodes-line-separator]
  [fixture: er/db-subgraph-entity-twice]
  [fixture: er/db-subgraph-member-repeated]
  [fixture: er/db-subgraph-member-in-earlier]
  [fixture: er/db-subgraph-same-entity-two-subgraphs]
  [fixture: er/db-subgraph-member-nested-and-outer]
  [fixture: er/db-subgraph-nested-entity-in-both]
- ほかの文の値は、`class`、`classDef`、`style` 文のキーワード（書かれたままの
  大文字小文字）と、アクセシビリティ文の trim したテキストです。
  後者は、置き換えも、行送りでの連結もしません。
  [fixture: er/db-subgraph-nodes-class-statement]
  [fixture: er/db-subgraph-nodes-class-def-statement]
  [fixture: er/db-subgraph-nodes-style-statement]
  [fixture: er/db-subgraph-class-inside]
  [fixture: er/db-subgraph-classdef-inside]
  [fixture: er/db-subgraph-style-inside]
  [fixture: er/db-subgraph-nodes-keywords-upper-case]
  [fixture: er/db-subgraph-nodes-acc-title]
  [fixture: er/db-subgraph-nodes-acc-descr-line]
  [fixture: er/db-subgraph-nodes-acc-descr-block]
  [fixture: er/db-subgraph-acc-title-inside]
  [fixture: er/db-subgraph-acc-descr-inside]
  [fixture: er/db-subgraph-acc-descr-block-inside]
  [fixture: er/db-subgraph-nodes-acc-descr-block-lines]
  [fixture: er/config-security-level-other-subgraph-node-acc-title]
  [fixture: er/db-subgraph-nodes-all-statements]
- direction 文はノードを与えません。
  空の description ブロックも何も与えず、何も変えません。
  本体の中でも、ヘッダーの後の本体の先頭でも同じです。
  [fixture: er/db-subgraph-direction-only]
  [fixture: er/db-subgraph-nodes-empty-description-block]
  [fixture: er/gram-empty-description-block-first-in-subgraph]
  [fixture: er/gram-subgraph-header-blocks]
- 本体の中のコメント行、ディレクティブ行、空行、空白だけの行は、
  文ではありません。
  [fixture: er/db-subgraph-nodes-comment-line]
  [fixture: er/db-subgraph-nodes-directive-line]
  [fixture: er/db-subgraph-nodes-empty-line]
  [fixture: er/db-subgraph-nodes-whitespace-line]
- `classes` と `cssStyles` は空で始まり、subgraph の終わりより後の文が
  満たします（**クラスと style** を参照）。
- `dir` は、本体の文のうち最後の direction 文の方向です。
  入れ子の subgraph の direction 文は数えません。
  なければありません。
  [fixture: er/db-subgraph-direction] [fixture: er/db-subgraph-direction-nested]
  [fixture: er/db-direction-in-subgraph-twice]

**方向、title、アクセシビリティ。**
`direction` は、図の本体の文のうち最後の direction 文の方向で、
subgraph の中のものは数えません。なければ `TB` です。
title はフロントマターのもので、文字の置き換えをします。
行 `title T` は 2 つのエンティティです。
[fixture: er/db-direction-values] [fixture: er/db-direction-case]
[fixture: er/db-direction-twice] [fixture: er/db-subgraph-direction-top-level]
[fixture: er/db-direction-line-text-before]
[fixture: er/db-direction-line-text-after] [fixture: er/db-title-frontmatter]
[fixture: er/db-title-frontmatter-quoted]
[fixture: er/db-title-line-is-entities]

`accTitle` は、最後の accTitle 文のテキストで、subgraph の中のものも数え、
文字の置き換えをします。なければ空のテキストです。
`accDescr` は、最後の `accDescr` 文か、テキストのある description ブロックの
テキストです。
各行送りを、その後ろの空白（行送りを含む）とともに 1 つの行送りに置き換え、
そのあと文字の置き換えをします。
テキストのない description ブロックは何も変えません。
テキストは次の行から始まってもかまいません。
`accTitle:` の次の行が `A` なら、title は `A` です。
`accTitle: style:#x;y;` では、最後の `;` が無視され、`#x;` はエンティティです。
[fixture: er/db-acc-title-line] [fixture: er/db-acc-title-spaces]
[fixture: er/db-acc-title-replaces] [fixture: er/db-acc-title-twice]
[fixture: er/db-acc-title-empty-takes-next-line]
[fixture: er/db-acc-title-directive-in-text]
[fixture: er/db-acc-title-ignored-semicolon] [fixture: er/db-acc-descr-line]
[fixture: er/db-acc-descr-line-separator] [fixture: er/db-acc-descr-block]
[fixture: er/db-acc-descr-replaces] [fixture: er/db-acc-descr-twice]
[fixture: er/db-acc-descr-then-block]
[fixture: er/db-acc-descr-block-then-empty]
[fixture: er/db-acc-descr-block-whitespace-only]
[fixture: er/db-acc-descr-block-empty-line]
[fixture: er/db-acc-descr-block-whitespace-line]
[fixture: er/db-acc-descr-block-comment-line]
[fixture: er/db-acc-descr-block-directive-line]
[fixture: er/db-acc-descr-block-line-separator]
[fixture: er/db-acc-descr-block-ignored-semicolon]
[fixture: er/db-subgraph-nodes-acc-title]

## 文字の置き換え

Db が `sanitizeText` に通すテキストは 4 つで、
title、`accTitle`、`accDescr`、subgraph の title です。
`erDbOf()` は、
[db-from-tree.ja.md](../db-from-tree.ja.md#文字の置き換え) の置き換え
`textReplacementOf(embedded.config)` を、この 4 つに対してだけ行います。
名前、別名、属性、ロール、id、ノード、クラス、style は、書かれたままです。
subgraph の title は、語をつないだ後、trim する前に置き換えます。
角括弧がなければ id のテキストです。
subgraph のノードは置き換えません。
本体の中の `accTitle` は、図に置き換えた title を与え、
subgraph にはノードとして書かれたままのテキストを与えます。
`accDescr` は、行をつないだ後に置き換えます。
[fixture: er/config-security-level-other-diagram-title]
[fixture: er/config-security-level-other-acc-title]
[fixture: er/config-security-level-other-acc-descr]
[fixture: er/config-security-level-other-acc-descr-block]
[fixture: er/config-security-level-other-subgraph-title]
[fixture: er/config-security-level-other-subgraph-title-words]
[fixture: er/config-security-level-other-subgraph-title-trimmed]
[fixture: er/config-security-level-other-subgraph-title-html-labels-false]
[fixture: er/config-security-level-other-names-as-written]
[fixture: er/config-security-level-other-subgraph-node-acc-title]
[fixture: er/config-security-level-strict-subgraph-title]
[fixture: er/config-security-level-loose-subgraph-title]
[fixture: er/config-security-level-antiscript-subgraph-title]
[fixture: er/config-security-level-sandbox-subgraph-title]
[fixture: er/config-look-classic] [fixture: er/config-look-hand-drawn]
[fixture: er/config-look-neo]

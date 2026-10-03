# class の Db を木から作る

英語版: [class.md](./class.md)

class 図の木から Db の要約を作る手順です。
`src/db-from-tree/class.ts` がこれを実装します
（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、仕様の
[diagrams/class.ja.md](../../../spec/docs/diagrams/class.ja.md) と
[ast/class.ja.md](../../../spec/docs/ast/class.ja.md) が定めます。

フロントマターの図のタイトルは、木から来ません。
Db の値を確かめる人は、それを mermaid.js 自身の関数で求めます
（[設定（参考）](../configuration.ja.md#設定参考) を参照）。
[fixture: class/docs-syntax-class-diagram-2f728b32]

## 木から要約を作る

文はソースの順に当て、名前空間の項目はその中の順に当てます。
各文は次のとおりです。
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
実体はプレースホルダで、属性の引用符は `'` です。
``class `a#amp;b` `` はクラス `aﬂ°amp¶ßb` を宣言し、
`style A fill:#f00,x:<a b="c">y</a>` は A に
スタイル `fill:#f00` と `x:<a b='c'>y</a>` を与えます。
[fixture: class/db-backquoted-name-entity] [fixture: class/db-member-entity]
[fixture: class/db-member-attribute-quote] [fixture: class/db-note-entity]
[fixture: class/db-cardinality-entity] [fixture: class/db-acc-title-entity]
[fixture: class/db-style-attribute-quote]
[fixture: class/db-class-def-attribute-quote]

**名前。**
クラス名の名前のテキスト、書いた名前、id は、
[文法の外での拒否](../../../spec/docs/diagrams/class.ja.md#文法の外での拒否)
が定めるものです。
空白だけのジェネリクスの型も書いた名前に数えます。
そのため、`class A~ ~` は型が空白 1 つの A を、
`class A~ T ~` は型が空白、`T`、空白の A を宣言し、
`class A~~` は型のない A を宣言します。
[fixture: class/db-generic-blank] [fixture: class/db-generic-spaces]
書いた名前の**型**は、`~` を持ち、その最初の `~` が最初の文字でないとき、
最初の `~` と 2 つ目の `~` の間（なければ終わりまで）のテキストで、
そうでなければ空です。
そのため、`class Map~K, V~` は型 `K, V` の `Map` を宣言し、
``class `a~b` `` は型 `b` の `a` を宣言しますが、
最初の `~` が最初の文字である ``class `~a~b` `` は、
型のない `~a~b` を宣言します。
[fixture: class/db-generic-type] [fixture: class/db-backquoted-name-tilde]
[fixture: class/db-backquoted-name-unclosed]
[fixture: class/div-backquote-starts-with-tilde-and-type]

**クラスを加える。**
クラスを加える文は、
[文法の外での拒否](../../../spec/docs/diagrams/class.ja.md#文法の外での拒否)
の注釈の項が挙げるものです。
書いた名前でクラスを加えるとき、その id のクラスがあれば、何もしません。
なければ、その id と型のクラスを加えます。
`label` は id、
`text` は id に、型が空でなければ `&lt;`、型、`&gt;` を続けたもの、
`cssClasses` は `default` で、一覧は空です。
そのため、クラスの型は、最初に加えられたところで書いたものです。
`class A` の後の `class A~T~` は、A に型を与えません。
[fixture: class/db-class-type-first-added]

**class の文。**
class の文は、そのクラスを加え、それから次のことをします。

- ラベルは、`label` を文字列のテキストにし、
  `text` を、そのテキストに、
  クラスに型があれば `<`、型、`>` を続けたものにします。
  後のラベルは前のラベルを置き換え、
  ラベルのない class の文は、クラスが持つラベルを保ちます。
  [fixture: class/db-class-label-type] [fixture:
  class/db-class-label-redefined] [fixture:
  class/db-class-label-kept-without-label]
- `:::` は、クラスにその名前の部分の CSS クラスを与えます
  （下の **CSS クラス** を参照）。
- 注釈は、その名前の部分を `annotations` に加えます。
- メンバーの行は、CSS クラスや注釈の後に、メンバーの文と同じく順に加えます。
  クラスがすでに持つメンバーに加えるので、
  同じクラスの本体のある 2 つのクラスの文は、両方のメンバーを順に与えます。
  `+int x` を持つ `class A {` と `+int y` を持つ `class A {` は、
  A にメンバー `int x` と `int y` を与えます。
  [fixture: class/db-class-members-added]

**メンバーの文とメンバーの行。**
ラベルのあるメンバーの文は、そのクラスを加え、
それからラベルのメンバーの行を加えます。
メンバーの行は、クラスに次のものを加えます。

- 注釈の行は、その名前の値を空白を含めて、名前がなければ空のテキストを、
  `annotations` に。
  [fixture: class/db-member-annotation-spaces] [fixture:
  class/tokens-annotation-blank] [fixture: class/tokens-annotation-blank-label]
- 方法の行は `methods` に。
  `visibility` は可視性の記号か空のテキスト、
  `classifier` は分類子の記号か空のテキスト、`id` はメンバーの名前、
  `parameters` は、その単位のテキストか空のテキストです。
  `returnType` は、戻り値の型の値か空のテキストで、
  それを終える分類子の記号の前の空白を持ちます
  （[メンバーの行](../../../spec/docs/diagrams/class.ja.md#メンバーの行)
  の項目 5）。
  `+getInstance() Foo $` の戻り値の型は `Foo` と空白 1 つで、
  `+foo(a) a b`、タブ、`*` の戻り値の型は `a b` とタブです。
  [fixture: class/db-method-return-type-space-before-classifier] [fixture:
  class/db-method-return-type-tab-before-classifier]
- 属性の行は、同じように `members` に。
  `parameters` と `returnType` は持ちません。
- 空白だけのメンバーの行は、何も加えません。

メンバーの名前は、名前の値の始まりの空白を空白 1 つにしたもので、
名前がなければ空のテキストです。
値が空白で始まるのは、メンバーの名前のテキストが空白で始まるときだけです
（[メンバーの行](../../../spec/docs/diagrams/class.ja.md#メンバーの行) を参照）。
`+  spaced name  ` の id は空白 1 つと `spaced name` で、
`+ foo()` の id は空白 1 つと `foo` です。
`x`、U+2028、` b(c)` の id は空白 1 つと `b` で、
`x`、U+2028、` (c)` の id は空白 1 つです。
最後のものの空白をタブにすると、id は空です。
[fixture: class/db-member-name-space] [fixture: class/db-method-name-space]
[fixture: class/lex-member-method-segment-space-before-name] [fixture:
class/lex-member-method-segment-space-only-name] [fixture:
class/lex-member-method-segment-tab-only-name]

**注釈の文。**
注釈の文は、その名前の部分を、
クラスの名前の id のクラスの `annotations` に加えます。
そのクラスは存在しなければなりません
（[文法の外での拒否](../../../spec/docs/diagrams/class.ja.md#文法の外での拒否) を参照）。

**関係。**
関係の文は、そのクラスの名前の 2 つの書いた名前を持ち、
その関係から `type1`、`type2`、`lineType` を持ちます。
関係の端の `o` は 0、`<|` と `|>` は 1、`*` は 2、`<` と `>` は 3、`()` は 4、
端がなければテキスト `none` です。
線の `--` は 0、`..` は 1 です。
`type1` が 4 で `type2` が `none` のとき、文は 2 つ目の書いた名前のクラスと、
インターフェースを加えます。
インターフェースは、
id が `interface` にそれより前のインターフェースの数を続けたもの、
`label` が 1 つ目の書いた名前、`classId` が 2 つ目の書いた名前で、
その id が 1 つ目のクラスの名前の代わりになります。
`type2` が 4 で `type1` が `none` のときは、
2 つの名前を入れ替えて同じことをします。
それ以外では、両方の書いた名前のクラスを、1 つ目から加えます。
それから関係を加えます。
`id1` と `id2` は 2 つの名前の id かインターフェースの id、
`relationTitle1` と `relationTitle2` は、
文字列のテキストから両端の空白を除いたもので、
文字列がないか空なら `none`、
`label` の単位があれば、`title` は、
`:` の後のラベルのテキストから両端の空白を除いたものです。
空白だけのラベルは、木では null ですが
（[ClassRelationStatement](../../../spec/docs/ast/class.ja.md#classrelationstatement) を参照）、
空のタイトルを与えます。
`A --> B : ` のタイトルは空のテキストで、`A --> B` はタイトルを持ちません。
[fixture: class/tokens-relation-label-blank]
[fixture: class/db-relation-types] [fixture:
class/docs-syntax-class-diagram-bc06236e] [fixture:
class/docs-syntax-class-diagram-b06c5b3c] [fixture: class/db-lollipop-both]
[fixture: class/db-cardinality-spaces] [fixture: class/db-relation-label-quotes]

**名前空間。**
名前空間の名前の**名前のテキスト**は、クラスの名前と同じように作ります。
名前空間の文は、その名前のテキストの**修飾された id** を持ちます。
それは、それを含む名前空間の文の修飾された id、`.`、名前のテキストで、
いちばん外では名前のテキストだけです。
修飾された id の名前空間があれば、それは明示されたものになり、
ラベルはその `label` を置き換えます。
なければ、修飾された id と、その `.` の前の各部分について、最初のものから、
その id の名前空間がなければ加えます。
`label` は最後の `.` の後の部分で、修飾された id 自身ではラベルのテキスト、
`parent` は 1 つ短い id、
`explicit` は修飾された id 自身では真、その前の部分では偽です。
修飾された id の名前空間がすでにあれば、明示されたものになります。
そのような名前空間は、それぞれ親の `children` に加えます。
それから本体の項目を当て、その後、本体の各 class の文は、
そのクラスの `parent` を修飾された id にし、
クラスの id を名前空間の `classes` に加えます。
本体の各ノートの文は、そのノートについて同じことをします。
[fixture: class/spec-class-diagram-95acf03b] [fixture:
class/db-namespace-nested] [fixture: class/db-namespace-redeclared-label]
[fixture: class/db-namespace-moves-class]

**ノート。**
ノートの文はノートを加えます。
`id` は `note` にそれより前のノートの数を続けたもの、
`text` は書いたとおりの文字列のテキストで、
`note for` の後では `class` が書いた名前です。
クラスは加えません。
[fixture: class/db-note-text-spaces] [fixture:
class/db-note-for-undefined-class]

**クリックの文。**
これらの文では、クラスの名前の書いた名前は、`,` で区切った名前の一覧で、
各手順は各名前に順に当てます。

- `callback` と、`call` の `click` は、各名前の id のクラスがあれば、
  その `haveCallback` を設定し、それから CSS クラス `clickable` を与えます
  （**CSS クラス** を参照）。
- `link` と、`href` の `click` は、各名前のクラスがあれば、その `link` を、
  URL から両端の空白を除いたものにし、それが空なら設定しません。
  `linkTarget` はリンクのターゲットか `_blank` にします。
  それから CSS クラス `clickable` を与えます。
  ASCII の数字で始まる名前は、CSS クラスと同じく、
  `classId-` に名前を続けたもので探します。
- 空でないツールチップは、その後、
  各名前の id のクラスがあれば、その `tooltip` を設定します。

そのため、存在しないクラスへのクリックの文は、何も変えません。
コールバックの関数名と引数は、要約に含まれません。
[fixture: class/db-click-href] [fixture: class/db-click-link-as-written]
[fixture: class/spec-class-diagram-6fe56b41] [fixture:
class/db-callback-names-comma] [fixture: class/db-link-url-spaces] [fixture:
class/db-link-undefined-class] [fixture: class/db-click-undefined-class]
[fixture: class/db-callback-undefined-class]

**CSS クラス。**
`:::`、`cssClass`、クリックの文から書いた名前に CSS クラスを与えるときは、
書いた名前を各 `,` で分けます。
各名前について、ASCII の数字で始まる名前は、
`classId-` に名前を続けたもので探し、
その id のクラスがあれば、その `cssClasses` に空白と CSS クラスを加えます。
そのため、`class 1A:::c` は、CSS クラス `c` のない `1A` を宣言します。
`,` の後の空白は次の名前の一部です。
`cssClass "A, B" c` は、A にだけ `c` を与えます。
[fixture: class/db-css-class-digit] [fixture:
class/db-css-class-statement-digit] [fixture: class/db-css-class-list-space]
クラスのない名前への CSS クラスは、何も変えません。
[fixture: class/db-css-class-undefined-class]

**スタイル。**
スタイルのテキストは、その値です
（[ClassLiteral](../../../spec/docs/ast/class.ja.md#classliteral) を参照）。
スタイルの文の**スタイルの値**は、
そのスタイルのテキストを各 `,` で分けたものです。
`style` は、それを、id がその語のクラスがあれば、その `styles` に加えます。
そのため、クラスを加える文より前の `style` の文は、何も変えません。
[fixture: class/db-style-before-class]
`classDef` は、それを、その名前ごとに順に、
`cssClasses` がその名前をどこかに含むクラスの `styles` に加えます。
より長い CSS クラスの中に含むものも数えます。
`classDef fo fill:red` は CSS クラス `foo` のクラスに当てはまり、
`classDef default fill:red` はすべてのクラスに当てはまります。
当てはまるのは、その時点でその CSS クラスを持つクラスだけです。
後でそれを得たクラスはスタイルを得ません。
[fixture: class/db-style-spaces] [fixture: class/db-style-undefined-class]
[fixture: class/db-class-def-substring] [fixture:
class/db-class-def-default] [fixture: class/db-class-def-order]

**ほかの文。**
方向の文は、`direction` をその値にします。
`accTitle:` はアクセシビリティのタイトルを、
`accDescr:` と `accDescr {` は説明を設定します。
[flowchart.ja.md](./flowchart.ja.md#木から要約を作る) と同じく、
両端の空白を除き、各改行とその後の空白を 1 つの改行として読み、
後の文が前の文を置き換えます。
`accDescr:` の行がブロックを置き換えるのも同じです。
[fixture: class/db-acc-title-spaces] [fixture:
class/spec-class-diagram-0926d7aa] [fixture: class/db-acc-title-replaces]
[fixture: class/db-acc-descr-replaces] [fixture:
class/db-acc-descr-line-replaces-block]
テキストのない説明ブロックの文は、
ほかの文の区切りの前にあるものも、何も変えません。
[fixture: class/gram-empty-description-block-after-note]
ラベルのないクラスの名前だけの文は、何も変えません。
`Foo` の行はクラスを宣言せず、名前 `ClassA` である `Class A` も同じです
（[字句構造](../../../spec/docs/diagrams/class.ja.md#字句構造) を参照）。
[fixture: class/gram-name-alone] [fixture: class/lex-keyword-upper-case]

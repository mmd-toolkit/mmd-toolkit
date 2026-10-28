# class の Db を木から作る

英語版: [class.md](./class.md)

class 図の木から Db の要約を作る手順です。
`src/db-from-tree/class.ts` がこれを実装します（[db-from-tree.ja.md](../db-from-tree.ja.md) を参照）。
構文と木は、
仕様の [diagrams/class.ja.md](../../../spec/docs/diagrams/class.ja.md) と [ast/class.ja.md](../../../spec/docs/ast/class.ja.md) が定めます。

フロントマターの図のタイトルは、木から来ません。
Db の値を確かめる人は、それを mermaid.js 自身の関数で求めます。
[設定（参考）](../configuration.ja.md#設定参考) を参照。 [fixture: class/docs-syntax-class-diagram-2f728b32]

## 木から要約を作る

文はソースの順に当て、名前空間の項目はその中の順に当てます。
各文は次のとおりです。 [fixture: class/db-style-class-def-source-order]
どの値も[変換した形](../../../spec/docs/common.ja.md#ソースの読み方)で読むので、
エンティティはプレースホルダで、属性の引用符は `'`、行終端は改行で、
行単位の規則が無視する `;` は除かれます。
``class `a#amp;b` `` はクラス `aﬂ°amp¶ßb` を宣言し、
`style A fill:#f00,x:<a b="c">y</a>` は A に、
スタイル `fill:#f00` と `x:<a b='c'>y</a>` を与えます。 [fixture: class/db-backquoted-name-entity]
[fixture: class/db-member-entity]
[fixture: class/db-member-attribute-quote] [fixture: class/db-note-entity]
[fixture: class/db-cardinality-entity] [fixture: class/db-acc-title-entity]
[fixture: class/db-style-attribute-quote]
[fixture: class/db-class-def-attribute-quote]
[fixture: class/db-note-attribute-quote]
[fixture: class/db-backquoted-name-attribute-quote]
[fixture: class/db-note-line-terminators]
[fixture: class/db-callback-arguments-crlf]
[fixture: class/db-note-ignored-semicolon]

**名前。**
クラス名の名前のテキスト、書いた名前、id は、
[文法の外での拒否](../../../spec/docs/diagrams/class.ja.md#文法の外での拒否) が定めるものです。
空白だけのジェネリクスの型も書いた名前に数えます。
そのため、`class A~ ~` は型が空白 1 つの A を、 `class A~ T ~` は型が空白、`T`、
空白の A を宣言し、 `class A~~` は型のない A を宣言します。
ジェネリクスの型の中のディレクティブは、その一部ではありません。
`class A~T%%{init: {}}%%U~` は型 `TU` の A を、
`class A~ %%{init: {}}%% ~` は型が空白 2 つの A を、
`class A~%%{init: {}}%%~` は型のない A を宣言します。 [fixture: class/db-generic-blank]
[fixture: class/db-generic-spaces]
[fixture: class/db-generic-blank-line-feed]
[fixture: class/db-generic-blank-directive-between-spaces]
[fixture: class/db-generic-directive-only]
[fixture: class/db-generic-directive-in-text]
書いた名前の**型**は、`~` を持ち、その最初の `~` が最初の文字でないとき、
最初の `~` と 2 つ目の `~` の間（なければ終わりまで）のテキストで、
そうでなければ空です。
そのため、`class Map~K, V~` は型 `K, V` の `Map` を宣言し、
``class `a~b` `` は型 `b` の `a` を宣言しますが、
最初の `~` が最初の文字である ``class `~a~b` `` は、
型のない `~a~b` を宣言します。
同様に、``class `a~b~c` `` は型 `b` の `a` を、
``class `a~` `` は型のない `a` を宣言し、 ``class `a~b`~T~ `` は、
書いた名前が `a~b~T~` なので、
型 `b` の `a` を宣言します。 [fixture: class/db-generic-type]
[fixture: class/db-backquoted-name-tilde]
[fixture: class/db-backquoted-name-unclosed]
[fixture: class/div-backquote-starts-with-tilde-and-type]
[fixture: class/db-backquoted-name-two-tildes]
[fixture: class/db-backquoted-name-tilde-at-end]
[fixture: class/db-backquoted-name-tilde-and-generic]

**クラスを加える。**
クラスを加える文は、
[文法の外での拒否](../../../spec/docs/diagrams/class.ja.md#文法の外での拒否) の注釈の項が挙げるものです。
書いた名前でクラスを加えるとき、その id のクラスがあれば、何もしません。
なければ、その id と型のクラスを加えます。
`label` は id、 `text` は id に、型が空でなければ `&lt;`、型、
`&gt;` を続けたもの、 `cssClasses` は `default` で、一覧は空です。
型の中の `<` は変わりません。
`class A~a<b~` の `text` は `A&lt;a<b&gt;` です。
そのため、クラスの型は、最初に加えられたところで書いたものです。
`class A` の後の `class A~T~` は、A に型を与えません。
ラベルのあるメンバーの文も、同じようにクラスを加えます。
`A~T~ : x` は型 `T` の A を宣言します。
U+2028 は行終端ではないので、 `class A`、U+2028、
`class B` は 1 つの class の文で、
クラス `AclassB` を加えます。 [fixture: class/db-class-type-first-added]
[fixture: class/db-generic-type-angle-brackets]
[fixture: class/db-class-type-member-statement]
[fixture: class/db-class-statement-line-separator]

**class の文。**
class の文は、そのクラスを加え、それから次のことをします。

- ラベルは、`label` を文字列のテキストにし、 `text` を、そのテキストに、
  クラスに型があれば `<`、型、`>` を続けたものにします。
  後のラベルは前のラベルを置き換え、ラベルのない class の文は、
  クラスが持つラベルを保ちます。
  型は、文に書いた型ではなく、クラスの型です。
  `class A` の後の `class A~T~["L"]` は、
  A の `text` を `L` にします。 [fixture: class/db-class-label-type] [fixture:
  class/db-class-label-redefined] [fixture:
  class/db-class-label-kept-without-label] [fixture:
  class/db-class-label-type-of-class]
  ラベルは、同じ id のクラスのラベルを置き換えます。
  片方の文に型があり、もう片方にないときも、
  片方が namespace の中にあるときも同じです（クラスは `parent` を保ちます）。
  `class A~T~["First"]` の後の `class A["Second"]` は、
  A の `label` を `Second`、`text` を `Second<T>` にします。
  同じラベルを 2 度書いても、
  何も変わりません。 [fixture: class/db-class-label-same-twice]
  [fixture: class/db-class-label-redefined-generic]
  [fixture: class/db-class-label-redefined-in-namespace]
- `:::` は、
  クラスにその名前の部分の CSS クラスを与えます（下の **CSS クラス** を参照）。
- 注釈は、その名前の部分を `annotations` に加えます。
  クラスがすでに持っていても加えます。 [fixture: class/db-annotation-twice]
- メンバーの行は、CSS クラスや注釈の後に、メンバーの文と同じく順に加えます。
  クラスがすでに持つメンバーに加えるので、
  同じクラスの本体のある 2 つのクラスの文は、両方のメンバーを順に与えます。
  `+int x` を持つ `class A {` と `+int y` を持つ `class A {` は、
  A にメンバー `int x` と `int y` を与えます。
  そのため、`class A <<first>> {` の注釈は、
  その本体の注釈の行 `<<second>>` より前になります。
  本体の中の独立した行のディレクティブは、
  メンバーの行を作りません。 [fixture: class/db-class-members-added] [fixture:
  class/db-class-annotation-then-member-annotation] [fixture:
  class/db-class-members-directive-line]

**メンバーの文とメンバーの行。**
ラベルのあるメンバーの文は、そのクラスを加え、
それからラベルのメンバーの行を加えます。
ラベルはその行の残りで、
`A : x %% c` はメンバー `x %% c` を加えます。 [fixture: class/db-member-statement-percent]
メンバーの行は、クラスに次のものを加えます。

- 注釈の行は、その名前の値を空白を含めて、名前がなければ空のテキストを、
  `annotations` に。 [fixture: class/db-member-annotation-spaces] [fixture:
  class/tokens-annotation-blank] [fixture: class/tokens-annotation-blank-label]
  [fixture: class/db-member-annotation-empty]
- 方法の行は `methods` に。
  `visibility` は可視性の記号か空のテキスト、
  `classifier` は分類子の記号か空のテキスト、`id` はメンバーの名前、
  `parameters` は、その単位のテキストか空のテキストです。
  `returnType` は、戻り値の型の値か空のテキストで、
  それを終える分類子の記号の前の空白を持ちます（[メンバーの行](../../../spec/docs/diagrams/class.ja.md#メンバーの行) の項目 5）。
  `+getInstance() Foo $` の戻り値の型は `Foo` と空白 1 つで、 `+foo(a) a b`、
  タブ、
  `*` の戻り値の型は `a b` とタブです。 [fixture: class/db-method-return-type-space-before-classifier]
  [fixture:
  class/db-method-return-type-tab-before-classifier] [fixture:
  class/db-method-visibility-classifier]
- 属性の行は、同じように `members` に。
  `parameters` と `returnType` は持ちません。 [fixture: class/db-attribute-visibility-classifier]
- 空白だけのメンバーの行は、何も加えません。

メンバーの名前は、名前の値の始まりの空白を空白 1 つにしたもので、
名前がなければ空のテキストです。
値が空白で始まるのは、
メンバーの名前のテキストが空白で始まるときだけです（[メンバーの行](../../../spec/docs/diagrams/class.ja.md#メンバーの行) を参照）。
`+  spaced name  ` の id は空白 1 つと `spaced name` で、
`+ foo()` の id は空白 1 つと `foo` です。
`x`、U+2028、` b(c)` の id は空白 1 つと `b` で、 `x`、U+2028、
` (c)` の id は空白 1 つです。
最後のものの空白をタブにすると、id は空です。
名前のテキストの始まりの U+2028 も空白です。
`+`、U+2028、`int x` の id は `int x` で、 `+`、空白、U+2028、
`int y` の id は空白 1 つと `int y` です。 [fixture: class/db-member-name-line-separator]
[fixture: class/db-member-name-space] [fixture: class/db-method-name-space]
[fixture: class/lex-member-method-segment-space-before-name] [fixture:
class/lex-member-method-segment-space-only-name] [fixture:
class/lex-member-method-segment-tab-only-name]

**注釈の文。**
注釈の文は、その名前の部分を、
クラスの名前の id のクラスの `annotations` に加えます。
そのクラスは存在しなければなりません（[文法の外での拒否](../../../spec/docs/diagrams/class.ja.md#文法の外での拒否) を参照）。

**関係。**
関係の文は、そのクラスの名前の 2 つの書いた名前を持ち、その関係から `type1`、
`type2`、`lineType` を持ちます。
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
文字列のテキストから両端の空白を除いたもので、文字列がないか空なら `none`、
`label` の単位があれば、`title` は、
`:` の後のラベルのテキストから両端の空白を除いたものです。
空白だけのラベルは、
木では null ですが（[ClassRelationStatement](../../../spec/docs/ast/class.ja.md#classrelationstatement) を参照）、
空のタイトルを与えます。
`A --> B : ` のタイトルは空のテキストで、
`A --> B` はタイトルを持ちません。 [fixture: class/tokens-relation-label-blank]
[fixture: class/db-relation-types] [fixture:
class/docs-syntax-class-diagram-bc06236e] [fixture:
class/docs-syntax-class-diagram-b06c5b3c] [fixture: class/db-lollipop-both]
[fixture: class/db-cardinality-spaces] [fixture: class/db-relation-label-quotes]
[fixture: class/db-lollipop-other-end-second]
[fixture: class/db-lollipop-written-names]
[fixture: class/db-lollipop-strings-and-label]
[fixture: class/db-relation-label-spaces]
[fixture: class/db-relation-whitespace-kinds]
[fixture: class/db-cardinality-empty-second]
[fixture: class/db-relation-written-name-tilde]

**名前空間。**
名前空間の名前の**名前のテキスト**は、クラスの名前と同じように作ります。
名前空間の文は、その名前のテキストの**修飾された id** を持ちます。
それは、それを含む名前空間の文の修飾された id、`.`、名前のテキストで、
いちばん外では名前のテキストだけです。
修飾された id の名前空間があれば、それは明示されたものになり、
ラベルはその `label` を置き換えます。
ラベルのない名前空間の文は、見つけたものの `label` を保ちます。
なければ、修飾された id と、その `.` の前の各部分について、最初のものから、
その id の名前空間がなければ加えます。
`label` は最後の `.` の後の部分で、修飾された id 自身ではラベルのテキスト、
`parent` は 1 つ短い id、 `explicit` は修飾された id 自身では真、
その前の部分では偽です。
修飾された id の名前空間がすでにあれば、明示されたものになります。
そのような名前空間は、それぞれ親の `children` に加えます。
それから本体の項目を当て、その後、本体の各 class の文は、
そのクラスの `parent` を修飾された id にし、クラスの id を、まだなければ、
名前空間の `classes` に加えます。
本体の各ノートの文は、そのノートについて同じことをします。
そのため、`namespace A` の中の 2 つの `class C` の文は、
A の `classes` に `C` を 1 回だけ与えます。 [fixture: class/spec-class-diagram-95acf03b]
[fixture:
class/db-namespace-nested] [fixture: class/db-namespace-redeclared-label]
[fixture: class/db-namespace-moves-class]
[fixture: class/db-namespace-redeclared-label-kept]
[fixture: class/db-namespace-new-dotted-label]
[fixture: class/db-namespace-dotted-in-nested]
[fixture: class/db-namespace-name-parts]
[fixture: class/db-namespace-backquoted-dot]
[fixture: class/db-namespace-class-repeated]
[fixture: class/db-namespace-class-redeclared-outside]
[fixture: class/db-namespace-outer-class-after-nested]

**ノート。**
ノートの文はノートを加えます。
`id` は `note` にそれより前のノートの数を続けたもの、 `text` は、
両端を削らない文字列のテキストで、
`note for` の後では `class` が書いた名前です。
クラスは加えません。
文字列の中の独立した行のディレクティブは除かれ、その前後の改行は残ります。
`note "a`、`%%{init: {}}%%` の行、`b"` の `text` は、 `a`、改行 2 つ、`b` です。
コメント行は、その改行とともに除かれます。 [fixture: class/db-note-text-spaces]
[fixture:
class/db-note-for-undefined-class]
[fixture: class/db-note-directive-line-inside]
[fixture: common/comment-in-string]
[fixture: class/tokens-comment-region-in-click-string]
[fixture: class/db-note-comment-line-inside-string]
後の文が宣言するクラスへの note は、書かれた名前を保ちます。
`class A` の前の `note for A "x"` の `class` は `A` です。 [fixture: class/db-note-for-before-class]

**クリックの文。**
これらの文では、クラスの名前の書いた名前は、`,` で区切った名前の一覧で、
各手順は各名前に順に当てます。 [fixture: class/db-link-names-comma]
[fixture: class/db-click-call-names-comma]

- `callback` と、`call` の `click` は、各名前の id のクラスがあれば、
  その `haveCallback` を設定し、
  それから CSS クラス `clickable` を与えます（**CSS クラス** を参照）。
  CSS クラスは、
  ASCII の数字で始まる名前を `classId-` に名前を続けたもので探しますが、
  `haveCallback` は id で設定します。
  `callback 1A "fn" "t"` は、
  クラス `1A` の `haveCallback` とツールチップを設定し、
  クラス `classId-1A` に `clickable` を与えます。 [fixture: class/db-callback-digit-split-lookup]
- `link` と、`href` の `click` は、各名前のクラスがあれば、その `link` を、
  URL から両端の空白を除いたものにし、それが空なら取り除きます。
  クラスがすでにリンクを持っていても同じです。
  `link A "u"` の後の `link A "  " _self` は、 A から `link` をなくし、
  `linkTarget` を `_self` にします。
  `linkTarget` はリンクのターゲット（`_blank`、`_self`、`_parent`、`_top`）か、
  ターゲットがなければ `_blank` にします。
  それから CSS クラス `clickable` を与えます。
  ASCII の数字で始まる名前は、CSS クラスと同じく、
  `classId-` に名前を続けたもので探します。
  そのため、`link 1A "u"` は、クラス `classId-1A` の `link` を設定し、
  ほかのクラスの `link` は設定しません。 [fixture: class/db-link-url-blank]
  [fixture:
  class/db-link-url-blank-after-link] [fixture: class/db-link-targets]
  [fixture: class/db-link-digit-prefixed-class]
- 空でないツールチップは、その後、各名前の id のクラスがあれば、
  その `tooltip` を、空白も含め書いたとおりに設定します。
  ツールチップは id で設定するので、`link 1A "u" "t"` は、
  クラス `1A` の `tooltip` だけを設定します。 [fixture: class/db-link-tooltip-spaces]
  [fixture:
  class/db-link-digit-tooltip]

そのため、存在しないクラスへのクリックの文は、何も変えません。
ただし、`callback` と、`call` の `click` は、クラスかどうかにかかわらず、
各名前についてクリックの呼び出しを記録します。
`id` は名前、`name` は `callback` の StringLiteral か ClassLiteral の `value`、
`args` は `arguments` の `value`（なければ null）です。
要約は、
呼び出しがあるときだけ `clickCalls` を持ちます。 [fixture: class/tokens-callback-name-trailing-space]
[fixture: class/db-click-href] [fixture: class/db-click-link-as-written]
[fixture: class/spec-class-diagram-6fe56b41] [fixture:
class/db-callback-names-comma] [fixture: class/db-link-url-spaces] [fixture:
class/db-link-undefined-class] [fixture: class/db-click-undefined-class]
[fixture: class/db-callback-undefined-class]
[fixture: class/db-callback-names-comma-one-undefined]
[fixture: class/db-click-call-undefined-class]
後で加わるクラスについても同じです。
クラスを加える文より前のクリックの文は何も変えず、
関係がクラスを宣言した後のクリックの文は、
そのクラスに効きます。 [fixture: class/db-click-before-class]
[fixture: class/db-link-before-class]
[fixture: class/db-callback-before-class]
[fixture: class/db-click-after-relation]

**CSS クラス。**
`:::`、`cssClass`、クリックの文から書いた名前に CSS クラスを与えるときは、
書いた名前を各 `,` で分けます。
各名前について、ASCII の数字で始まる名前は、
`classId-` に名前を続けたもので探し、その id のクラスがあれば、
その `cssClasses` に空白と CSS クラスを加えます。
そのクラスがすでにその CSS クラスを持っていても加えます。
そのため、`class 1A:::c` は、CSS クラス `c` のない `1A` を宣言し、
クラス `classId-1A` があれば、それに `c` を与えます。
``class `A,B`:::c`` は、CSS クラス `c` のないクラス `A,B` を宣言し、
A と B に `c` を与えます。
`,` の前後の空白は名前の一部です。
`cssClass "A, B" c` は、A にだけ `c` を与え、 `cssClass "A ,B" c` は、
B にだけ `c` を与えます。 [fixture: class/db-css-class-digit] [fixture:
class/db-css-class-statement-digit] [fixture: class/db-css-class-list-space]
[fixture: class/db-css-class-digit-prefixed-class]
[fixture: class/db-css-class-colon-digit-prefixed-class]
[fixture: class/db-css-class-colon-names-comma]
[fixture: class/db-css-class-added-twice]
[fixture: class/db-css-class-ids-space-before-comma]
クラスのない名前への CSS クラスは、
何も変えません。 [fixture: class/db-css-class-undefined-class]
後で加わるクラスについても同じです。
`class A` の前の `cssClass "A" c` は、
何も変えません。 [fixture: class/db-css-class-before-class]

**スタイル。**
スタイルのテキストは、
その値です（[ClassLiteral](../../../spec/docs/ast/class.ja.md#classliteral) を参照）。
スタイルの文の**スタイルの値**は、
そのスタイルのテキストを各 `,` で分けたものです。
そのため、`,` で終わるスタイルは、最後の値が空のテキストです。
`style A fill:red,` の値は `fill:red` と空のテキストです。 [fixture: class/db-style-empty-value]
`style` は、それを、id がその語のクラスがあれば、
そのクラスがすでに持つ `styles` の後に加えます。
そのため、クラスを加える文より前の `style` の文は、何も変えません。
ASCII の数字で始まる語は、
`classId-` を付けて探しません。 [fixture: class/db-style-before-class]
[fixture: class/db-style-twice]
[fixture: class/db-style-digit-id]
クラスを加える文が namespace の中にあるときも同じです。
関係やメンバーの文が宣言したクラスは、それ以後クラスなので、
その後の `style` や、
namespace の中の `class` の文の後の `style` は効きます。 [fixture: class/db-style-before-class-in-namespace]
[fixture: class/db-style-after-relation]
[fixture: class/db-style-after-member-statement]
[fixture: class/db-style-after-class-in-namespace]
`classDef` は、それを、その名前ごとに順に、
`cssClasses` がその名前をどこかに含むクラスの `styles` に加えます。
より長い CSS クラスの中に含むものも数えます。
`classDef fo fill:red` は CSS クラス `foo` のクラスに当てはまり、
`classDef default fill:red` はすべてのクラスに当てはまります。
名前を 2 つ持つクラスは、値を 2 回得ます。
当てはまるのは、その時点でその CSS クラスを持つクラスだけです。
後でそれを得たクラスはスタイルを得ません。 [fixture: class/db-style-spaces]
[fixture: class/db-style-undefined-class]
[fixture: class/db-class-def-substring] [fixture:
class/db-class-def-default] [fixture: class/db-class-def-order]
[fixture: class/db-class-def-names]

**ほかの文。**
方向の文は、`direction` をその値にし、
後の文が前の文を置き換えます。 [fixture: class/db-direction-bt]
[fixture: class/db-direction-tb-after-lr]
`accTitle:` はアクセシビリティのタイトルを、
`accDescr:` と `accDescr {` は説明を設定します。
[flowchart.ja.md](./flowchart.ja.md#木から要約を作る) と同じく、
両端の空白を除き、各改行とその後の空白を 1 つの改行として読み、
後の文が前の文を置き換えます。
`accDescr:` の行がブロックを置き換えるのも同じです。 [fixture: class/db-acc-title-spaces]
[fixture:
class/spec-class-diagram-0926d7aa] [fixture: class/db-acc-title-replaces]
[fixture: class/db-acc-descr-replaces] [fixture:
class/db-acc-descr-line-replaces-block]
[fixture: class/db-acc-descr-block-collapse]
[fixture: class/db-acc-whitespace-kinds]
[fixture: class/db-acc-descr-block-replaces-line]
[fixture: class/db-acc-descr-block-replaces-block]
テキストのない `accTitle:` と `accDescr:` は、その行のテキストとして、
テキストを持つ次の行を取ります。
空行、コメント行、ディレクティブの行を越え、改行が LF でも CR LF でも、
コロンの後に U+2028 があっても同じです。
その行は文ではないので、`accDescr:` の後の `class A` は、説明を `class A` にし、
クラスを宣言しません。 [fixture: class/db-acc-title-line-empty-takes-next-after-comment]
[fixture: class/db-acc-title-line-empty-takes-next-after-directive]
[fixture: class/db-acc-descr-line-empty-takes-next-lines]
[fixture: class/db-acc-descr-line-empty-takes-next-after-comment]
[fixture: class/db-acc-descr-line-empty-takes-next-after-directive]
[fixture: class/db-acc-descr-line-empty-takes-next-line-crlf]
[fixture: class/db-acc-descr-line-separator-then-text]
テキストのない説明ブロックの文は、ほかの文の区切りの前にあるものも、
何も変えません。 [fixture: class/gram-empty-description-block-after-note]
[fixture: class/db-acc-descr-empty-block-keeps-line]
[fixture: class/db-acc-descr-empty-block-before-separator-keeps-block]
ラベルのないクラスの名前だけの文は、何も変えません。
`Foo` の行はクラスを宣言せず、名前 `ClassA` である `Class A` も同じです。
[字句構造](../../../spec/docs/diagrams/class.ja.md#字句構造) を参照。 [fixture: class/gram-name-alone]
[fixture: class/lex-keyword-upper-case]

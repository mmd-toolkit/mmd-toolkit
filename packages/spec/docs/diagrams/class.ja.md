# Class

英語版: [class.md](./class.md)

mermaid.js での正解の出どころ:

- [`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison)
- [`classDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/classDb.ts)
- [`classTypes.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/classTypes.ts)
- [`class/`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class)
  のテスト（`*.spec.ts`）

この文書は、図種 `classDiagram` を扱います。
木のノードは [ast/class.ja.md](../ast/class.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 9 がこの文法を選びます。
テキストが、空白の後に、
ちょうどこの大文字小文字で `classDiagram` から始まるときです。
[fixture: common/detect-minimal-class-diagram] [fixture:
common/detect-case-sensitive-class]

検出は検出点だけを見ます（[図種の検出](../common.ja.md#図種の検出) を参照）。
その後、文法はヘッダーのキーワード `classDiagram-v2` か `classDiagram` を、
後に語の文字が続かないものとしてもう一度読み（[文の文脈](#文の文脈) を参照）、
その後に `newline` の単位を読みます。
そのため、`classDiagram-v2` は同じ図のヘッダーです。
一方、`classDiagramX`、`classDiagram-v3`、`classDiagram class A` は、
class 図と判定され、拒否されます。
ヘッダーだけの入力も拒否されます。
文法は少なくとも 1 つの文を求めるからです。 [fixture: class/header-v2] [fixture:
class/header-word-after-keyword] [fixture: class/header-other-suffix] [fixture:
class/header-statement-same-line] [fixture: class/header-only]

`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
ヘッダーの前にあってかまいません。
これは `%%` だけの行で、検出はそれを読んで通り過ぎてヘッダーを探し、
どの図種でも同じく、`%%` から行の終わりまでの、
印 `%%` のコメントです（[図種の検出](../common.ja.md#図種の検出) を参照）。
mermaid.js の字句解析器もそう読み、
コメントだけの行として行に数えません（[文の文脈](#文の文脈) の規則 2）。
コメントはどのノードにも属さず、ClassDiagram はヘッダーから始まります。
そのような行とヘッダーの間の空白、行終端、コメント領域、ディレクティブは、
どの図種でも同じく、ここではトリビアです。
mermaid.js は、
コメント領域に入らない空白だけの行（空でない行）がそこにあると入力を拒否します。
class の字句解析器がその行を `newline` の単位として読み、
文法はヘッダーの前でそれを取らないからです（文の間と同じです。下を参照）。
既知の差異 [`bare-percent-line-before-header`](#既知の差異) です。
ディレクティブを除くと空白だけになる行もそう数え、前に空白のない、
1 行だけのディレクティブはどちらでもトリビアです。
[fixture: class/header-after-bare-percent-then-whitespace-line] [fixture:
class/header-after-empty-braces-then-whitespace-line] [fixture:
class/header-after-bare-percent-then-indented-directive-line] [fixture:
class/header-after-bare-percent-then-directive-line] [fixture:
class/header-after-bare-percent-then-whitespace-line-then-comment-line]
[fixture: class/header-after-bare-percent-then-empty-line]
[fixture: class/header-after-bare-percent-line] [fixture:
class/header-after-empty-braces-line] [fixture:
class/header-after-non-word-brace-line]
文の間でも、そのような行は同じく受理されます。
一方、その後の空白だけの行はそれだけで `newline` の単位になり、
mermaid.js と同じく入力は拒否されます。
[fixture: class/lex-bare-percent-line-between-statements] [fixture:
class/lex-bare-percent-line-then-blank-line] [fixture:
class/lex-bare-percent-line-then-spaces-line]
ヘッダーの前のそれ以外のテキスト（`#` の行など）は検出点の図のテキストで、
どの検出器も一致せず、 mermaid.js と同じく入力は拒否されます。
[fixture: class/header-after-hash-line]

## 字句構造

字句解析器は、
[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをその置き換え文字として読み、
コメント領域と行単位の規則が無視する `;` は、ないかのように読み進めます。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は、
図のテキストの一部です。
この節は、図自身の単位の規則を述べます。
[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 に当たります。

この図の mermaid.js の字句解析器は、
文字を書かれたとおりの大文字小文字で比べます。
`Class A` は class の文ではなく、名前 `ClassA` だけの文で、
`Note "x"` は拒否されます。 [fixture: class/lex-keyword-upper-case]
[fixture: class/lex-note-upper-case]
下の**キーワード**は、
後に語の文字が続かない語です（[表記](../common.ja.md#表記) を参照）。
`class classA` はクラス `classA` を宣言します。
一方、`class-A` では、`-` は語の文字でないので、
字句解析器はキーワード `class` を読み、その後に名前 `-A` を読みます。
[fixture: class/lex-keyword-prefix-of-name] [fixture:
class/lex-keyword-before-dash]

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれます。
各単位は、文法が使う名前と、 **テキスト**、
つまりそれが読んだ文字を変換した形で持ちます。

字句解析器は**文脈**のスタックを持ち、文の文脈から始めます。
規則は、文脈に入る（スタックの上に積む）か、
今の文脈を出る（その下の文脈に戻る）ことがあります。
文の文脈を出ても、文の文脈のままです。
各位置で、字句解析器は、今の文脈の規則のうち、
そこで当たる最初のものを適用します。
規則が読む空白は、規則がそう述べない限り、どの単位にも属しません。

各文脈の規則を下に挙げます。
今の文脈のどの規則も当たらなければ、入力は拒否されます。
一覧ではこれを繰り返しません。
文の文脈、クラスの文脈、名前空間の文脈、名前空間の本体の文脈は、
**共有の規則**で終わります。
ほかの文脈は、どの文字も自身の規則で読みます。

テキストの終わりで、字句解析器は、文の文脈と、
閉じていないバッククォートの名前の後で止まります。
[文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
を参照してください。
ほかの文脈では、入力は拒否されます。
テキストが終わるときに閉じていないメンバーの本体、名前空間の本体、
ジェネリクスの型、コールバックの名前やその引数、タイトル、説明、
説明ブロックです。 [fixture: class/lex-member-body-unclosed] [fixture:
class/lex-namespace-body-unclosed] [fixture: class/lex-generic-unclosed]
[fixture: class/lex-callback-name-unclosed] [fixture:
class/lex-callback-arguments-unclosed] [fixture: class/lex-acc-title-at-end]
[fixture: class/lex-acc-descr-at-end]
[fixture: class/lex-acc-descr-block-unclosed]
タイトルの文脈には、`accTitle:` の後の空白を改行も含めて読んだ後で入るので、
後に空白しかない `accTitle:` は、テキストの終わりで拒否されます。
説明の文脈も同じで、`accDescr:` の後に空行だけ、コメント行だけ、
ディレクティブの行だけが続いてテキストが終わると、拒否されます。
[fixture: class/lex-acc-descr-then-empty-lines-only]
[fixture: class/lex-acc-descr-then-comment-only]
[fixture: class/lex-acc-descr-then-directive-only]

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むのと同じように、
読みます。
その後、
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位に当てはまります。
テキストと文字列の単位の中のディレクティブは、入力の mermaid.js の読み方を保ち、
名前の単位を含む、ほかの単位の中のディレクティブは、入力を拒否させます。
**名前の単位**は、 `style` の後の `word`、`classDef` の文の各 `word`、
`cssClass` の文の `word`、文の `:::` の後や `<<` と `>>` の間の名前の部分です。
**テキストの単位**は、バッククォートの名前の前にあるか、
バッククォートの名前のない、クラスの名前や名前空間の名前の、
間に空白を置ける名前の部分と `.` の単位、 `generic-text` の単位、
`label` の単位の `:` の後のテキスト、 `member-name`、`parameters`、
`return-type`、`annotation-name` の単位、
`callback-name` か `callback-arguments` の単位、スタイルのすべての単位、
`title-text`、`description-text`、`description-block-text` の単位、
`direction-text` の単位、方法の行の読まれない部分です。
**文字列の単位**は、 `string` と `backquoted` の単位です。
[fixture: class/div-directive-in-style-id]
[fixture: class/div-directive-in-class-def-name]
[fixture: class/div-directive-in-css-class-name]
[fixture: class/div-directive-in-css-class-shorthand]
[fixture: class/div-directive-in-annotation-statement-name]
[fixture: class/lex-directive-in-generic]
[fixture: class/lex-directive-in-parameters]
[fixture: class/lex-directive-in-return-type]
[fixture: class/lex-directive-in-member-annotation]
[fixture: class/lex-directive-in-callback-name]
[fixture: class/lex-directive-in-callback-arguments]
[fixture: class/lex-directive-in-acc-title-text]
[fixture: class/lex-directive-in-acc-descr-text]
[fixture: class/lex-directive-in-acc-descr-block-text]
[fixture: class/lex-directive-in-ignored-method-part]

- `class Fo%%{init: {}}%%o` は `Foo` を、
  `class A%%{init: {}}%%.B` はクラス `A.B` を、
  `namespace Fo%%{init: {}}%%o {` は名前空間 `Foo` を宣言し、
  `A : +fo%%{init: {}}%%o()` は方法 `foo` を持ち、
  `A --> B : x%%{init: {}}%%y` はラベル `xy` を持ちます。
  どれも mermaid.js と同じです。
  無視される `;` も同じで、多重度 `"style:#x"` の後の、
  `A "style:#x" --> B;C` は、 `BC` への関係を持ちます。
  [fixture: class/lex-directive-in-name]
  [fixture: class/lex-directive-in-dotted-name]
  [fixture: class/lex-directive-in-namespace-name]
  [fixture: class/lex-directive-in-member]
  [fixture: class/lex-directive-in-label]
  [fixture: class/tokens-style-directive-inside-label]
  [fixture: class/tokens-ignored-text-directive-after-direction]
  [fixture: class/tokens-ignored-semicolon-in-relation-name]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `A <|%%{init: {}}%%-- B` は extension です。
  [fixture: class/lex-directive-between-relation-end-and-line]
- 文字列とバッククォートの名前の中のディレクティブは、単位の中のどこにあっても、
  mermaid.js の読み方を保ちます。
  `note "a%%{init: {}}%%b"` のノートは `ab`、
  `note "a %%{init: {}}%% b"` のノートは `a`、空白 2 つ、`b` で、
  ``class `a %%{init: {}}%% b` `` は `a`、空白 2 つ、`b` のクラスを宣言し、
  ``class `%%{init: {}}%%a` `` と、``class `a%%{init: {}}%%` `` は、
  クラス `a` を宣言します。 [fixture: class/lex-directive-in-note-string]
  [fixture: class/lex-directive-in-string-spaces]
  [fixture: class/lex-directive-in-backquoted-name]
  [fixture: class/lex-directive-in-backquoted-name-spaces]
  [fixture: class/lex-directive-in-backquoted-name-after-open]
  [fixture: class/lex-directive-in-backquoted-name-before-close]
  [fixture: class/lex-directive-in-backquoted-name-with-quotes]
  クラスのノートの文字列、多重度、リンクの URL、コールバックのツールチップ、
  関係の中と名前空間のバッククォートの名前も同じです。
  [fixture: class/lex-directive-in-note-for-string] [fixture:
  class/lex-directive-in-cardinality] [fixture:
  class/lex-directive-in-link-string] [fixture:
  class/lex-directive-in-callback-tooltip-string] [fixture:
  class/lex-directive-in-backquoted-relation-end] [fixture:
  class/lex-directive-in-backquoted-namespace]
  ディレクティブだけの文字列とバッククォートの名前は、空のものとして読まれます。
  `note "%%{init: {}}%%"` と ``class `%%{init: {}}%%` `` は、
  区切りの間に何もないときと同じく拒否され、 `A "%%{init: {}}%%" --> B` は、
  `A "" --> B` と同じく空の多重度を持ちます。
  [fixture: class/lex-directive-in-string-only] [fixture:
  class/lex-directive-in-backquoted-name-only] [fixture:
  class/lex-directive-in-empty-cardinality]
- `cla%%{init: {}}%%ss A`、`A -%%{init: {}}%%-> B`、
  `class A:%%{init: {}}%%::c` では、ディレクティブはキーワード、線、
  `:::` の中にあり、入力は拒否されます。
  mermaid.js はそれを受理します（[既知の差異](#既知の差異) を参照）。
  [fixture: class/div-directive-in-keyword] [fixture:
  class/div-directive-in-line] [fixture: class/div-directive-in-triple-colon]

### 文の文脈

文の文脈で、字句解析器は次の規則を順に試します。

1. **方向の行**（下を参照）。 [fixture: class/db-direction-bt]
2. `%%` と、改行までの行の残り: 図のコメント。
   その印は `%%` で、値は印の後のテキストです。
   `%%` の前が空白だけの行のほとんどは、
   [common.ja.md](../common.ja.md#コメント行) のコメント行で、
   字句解析器が読む前に除かれます。
   そのため、この規則が当たるのは、単位の後の `%%` と、
   `%%` の後に何もないか `{` が続くためにコメント行でない行です。
   空白とそのようなコメントだけの行が、**コメントだけの行**です。
   コメントだけの行は、行として数えず、その直後の空の行も数えません。
   それらの改行には `newline` の単位を読まず、改行はどの単位にも属しません。
   その後の空白だけの行は、行として数えます。
   単位の後のコメントは行の終わりで終わり、
   その後の改行は `newline` の単位です（[既知の差異](#既知の差異) を参照）。
   [fixture: class/db-member-statement-percent]
3. `accTitle`、0 個以上の空白、`:`、
   0 個以上の空白: `accTitle` の単位と `:` の単位。
   タイトルの文脈に入る。 [fixture: class/lex-acc-title-hash-semicolon]
   [fixture: class/lex-acc-title-space-before-colon]
   [fixture: class/lex-acc-title-no-whitespace]
   [fixture: class/lex-acc-title-line-feed-before-colon]
4. `accDescr`、0 個以上の空白、`:`、
   0 個以上の空白: `accDescr` の単位と `:` の単位。
   説明の文脈に入る。 [fixture: class/lex-acc-descr-hash-semicolon]
   [fixture: class/lex-acc-descr-space-before-colon]
   [fixture: class/lex-acc-descr-no-whitespace]
   [fixture: class/lex-acc-descr-line-feed-before-colon]
5. `accDescr`、0 個以上の空白、`{`、
   0 個以上の空白: `accDescr` の単位と `{` の単位。
   説明ブロックの文脈に入る。
   [fixture: class/gram-empty-description-block-then-statement]
   [fixture: class/gram-acc-descr-block-with-text]
   [fixture: class/lex-acc-descr-block-no-whitespace]
   [fixture: class/lex-acc-descr-block-line-feed-before-brace]
6. 0 個以上の空白と、それに続く 1 個以上の改行。
   最後に読む文字が改行になるよう、できるだけ多く読む: `newline` の単位。
   空の行や空白だけの行も、その一部です。 [fixture: class/gram-blank-lines]
   [fixture: class/lex-spaces-only-line-between-statements]
7. 1 個以上のほかの空白: 何も作らない。 [fixture: class/gram-name-spaces]
8. キーワード `classDiagram-v2` と `classDiagram`: `header` の単位。
   [fixture: common/detect-minimal-class-diagram] [fixture: class/header-v2]
9. `[*]`: `[*]` の単位。 [fixture: class/lex-edge-state-in-statement]
10. `call` と、
    その後に続く空白のすべて（1 文字以上。行終端を含む）: `call` の単位。
    コールバック名の文脈に入る。 [fixture: class/lex-call-prefix]
    [fixture: class/lex-callback-name-multi-line]
    [fixture: class/lex-call-two-spaces]
11. `"`: 文字列。 [fixture: class/lex-string-multi-line]
    [文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
    を参照してください。
12. キーワード `style` と `classDef`: キーワードの名前の単位。
    [fixture: class/db-style-undefined-class]
    [fixture: class/db-class-def-default]
13. キーワード `namespace`: `namespace` の単位。
    名前空間の文脈に入る。 [fixture: class/gram-namespace-empty]
14. キーワード `class`: `class` の単位。
    クラスの文脈に入る。 [fixture: class/lex-keyword-prefix-of-name]
15. 共有の規則。
    文の文脈では、句読点の規則より前の共有の規則が読まない `:`、`,`、`#` は、
    そのテキストの名前の単位です。 [fixture: class/gram-member-statement]
    [fixture: class/lex-hash-in-statement]

単位 `[*]`、`=`、`+`、`punctuation` は、文法のどの規則も取らないので、
それを持つ入力は拒否されます。 [fixture: class/lex-edge-state-in-statement]
[fixture: class/lex-equals-in-name] [fixture: class/lex-plus-in-name]
[fixture: class/lex-punctuation-in-name]
順番から生じることの例:

- キーワードは、単位が始まるところならどこでもキーワードです。
  `class note`、`class link`、`class o`、`class _self` は拒否され、
  `note` への関係も拒否されます。
  一方、`class noteX` と `class order` は、 `noteX` と `order` を宣言します。
  [fixture: class/lex-keyword-note-as-name] [fixture:
  class/lex-keyword-link-as-name] [fixture: class/lex-keyword-o-as-name]
  [fixture: class/lex-keyword-link-target-as-name] [fixture:
  class/lex-keyword-prefix-of-note] [fixture: class/lex-keyword-o-prefix]
  [fixture: class/lex-keyword-note-relation-end]
- `o` が関係の端になるのは、後に語の文字が続かないときだけです。
  `A --o B` は集約で、 `A --oB` は、A からクラス `oB` への、端のない関係です。
  [fixture: class/lex-aggregation-end] [fixture: class/lex-o-before-word]
- `call` がキーワードになるのは、後に空白があるときだけです。
  `class callX` は `callX` を宣言し、 `A --> call` は拒否されます。
  [fixture: class/lex-call-prefix] [fixture: class/lex-call-at-end]
- ラベル（共有の規則 9）は、`:`、`;`、改行で終わります。
  ラベルの中の `%%` はその一部です。
  `A --> B : x %% c` のラベルは `x %% c` です。
  2 つ目の `:` は 2 つ目のラベルを始め、文法はそれを取りません。
  `A --> B : x : y` と `A : foo(a: int)` は拒否されます。
  `;` はどの規則にも当たらないので、 `A : x;y` は拒否されます。
  [fixture: class/lex-label-percent] [fixture: class/lex-label-two-colons]
  [fixture: class/lex-label-colon-in-member] [fixture:
  class/lex-label-semicolon]
- `;`、`{`、`}`、`|`、`)` の続かない `(`、`)`、`@`、`^` は、
  文の文脈のどの規則にも当たりません。
  `class A; class B`、`A | B`、 `A@B --> C` は拒否されます。
  [fixture: class/lex-semicolon] [fixture: class/lex-pipe] [fixture:
  class/lex-at]
- エンティティは、
  その置き換え文字として読まれます（[エンティティ](../common.ja.md#エンティティ)
  を参照）。
  その最初の文字は文字の規則の文字ですが、2 文字目を読む規則はないので、
  名前の中のエンティティは拒否されます。
  ラベル、文字列、メンバーの中では、テキストの一部です。
  [fixture: class/lex-entity-in-name] [fixture: class/lex-entity-in-label]
  [fixture: class/lex-entity-in-note] [fixture: class/lex-entity-in-member]

**方向の行。**
今の位置から、改行、U+2028、U+2029 を含まない文字の並びで、
後が続けられる最も長いもの、 `direction`、改行を含む 1 個以上の空白、 `TB`、
`BT`、`RL`、`LR` のどれか、
そして次の改行の手前までのすべての文字です（改行は含みません）。
規則は、`direction` の前の文字を `direction-text` の単位、
`direction` を `direction` の単位、値を `direction-value` の単位、
値の後の文字をもう 1 つの `direction-text` の単位として読みます。
空か空白だけになる `direction-text` の単位は作りません。
mermaid.js は `direction-text` の単位を読みません。
値は書いた順に試します。
行のどこかに `TB` が続く `direction` があれば、値は `TB` です。
なければ `BT` を試し、以下同じです。
値ごとに、字句解析器は、それが続く並びの最後の `direction` を取り、
単位は値のある行の終わりで終わります。
そのため、`direction TB x direction TB` は最後の `direction` で読まれ、
`direction TB x` は `direction-text` の単位です。
[fixture: class/lex-direction-line-same-value-twice]
これは flowchart の方向の行（そちらの [文の文脈](./flowchart.ja.md#文の文脈)
を参照）から、値 `TD` を除いたものです。
ここでは最初の規則なので、文の文脈の各行の始まりで試され、行の全体を取ります。

- `class A direction LR` は class の文ではなく方向の行で、
  `A --> B : set direction LR now` も関係の文ではなく方向の行です。
  [fixture: class/lex-direction-line-class-statement] [fixture:
  class/lex-direction-line-in-label]
- 引用符は規則を妨げません。
  `note "x direction TB"` と、URL に `direction TB` を含むリンクは、
  方向の行です。 [fixture: class/lex-direction-line-in-note] [fixture:
  class/lex-direction-line-in-url]
- ヘッダーの行も取ります。
  `classDiagram direction LR` はヘッダーを持たず、拒否されます。
  [fixture: class/header-direction-line]
- `direction LR direction TB` の値は `TB` です。
  `direction TBX` の値は `TB` で、その後のテキストは `X` です。
  `direction`、改行、`LR` の値は `LR` です。
  `direction lr` は方向の行ではなく、名前 `directionlr` です。
  [fixture: class/lex-direction-line-two-values] [fixture:
  class/lex-direction-line-value-then-text] [fixture:
  class/lex-direction-line-value-next-line] [fixture:
  class/lex-direction-lower-case]
- `direction` の前や値の後の空の説明ブロックと、値の後の `;` は、
  mermaid.js が読まない `direction-text` の単位です。
  値の後の閉じたディレクティブはディレクティブで、
  その行は値の後にテキストを持ちません。
  [fixture: class/lex-direction-line-after-empty-description-block]
  [fixture: class/lex-direction-line-then-empty-description-block]
  [fixture: class/lex-direction-line-value-then-semicolon]
  [fixture: class/lex-direction-line-then-directive]
- ほかの文脈ではこの規則を試しません。
  名前空間の本体では `direction LR` は拒否され、メンバーの本体ではメンバーです。
  [fixture: class/lex-direction-in-namespace] [fixture:
  class/lex-direction-in-member-body]

### 共有の規則

1. 2 語の間に空白 1 つのキーワード `note for`: `note` の単位と `for` の単位。
   キーワード `cssClass`、`callback`、`link`、`click`、
   `note`: キーワードの名前の単位。 [fixture: class/db-note-for-undefined-class]
   [fixture: class/db-css-class-undefined-class]
   [fixture: class/docs-syntax-class-diagram-500154a2]
   [fixture: class/db-link-undefined-class] [fixture: class/db-click-href]
   [fixture: class/lex-string-multi-line]
2. `<<` と `>>`: そのテキストの名前の単位。
   [fixture: class/spec-class-diagram-280c04be]
3. キーワード `href`: `href` の単位。 [fixture: class/db-click-href]
4. `~`: `~` の単位。
   ジェネリクスの文脈に入る。 [fixture: class/lex-generic-multi-line]
5. `` ` ``: バッククォートの名前。
   [fixture: class/gram-name-word-then-backquoted]
   [文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
   を参照してください。
6. キーワード `_self`、`_blank`、`_parent`、 `_top`: `link-target` の単位。
   [fixture: class/lex-keyword-link-target-as-name]
   [fixture: class/spec-class-diagram-ab0cb6e2]
   [fixture: class/spec-class-diagram-3b723e23]
   [fixture: class/spec-class-diagram-81c8965e]
7. **関係の端**: `<|`、`|>`、`>`、`<`、`*`、後に語の文字が続かない `o`、`()`。
   そのテキストの名前の単位。 [fixture: class/db-relation-types]
   [fixture: class/spec-class-diagram-e8e66ff2]
   [fixture: class/spec-class-diagram-231ff139]
   [fixture: class/lex-aggregation-end] [fixture: class/db-lollipop-both]
8. **線**: `--` か `..`。
   そのテキストの名前の単位。 [fixture: class/db-relation-types]
9. `:` と、`:`、`;`、改行以外の 1 個以上の文字をできるだけ多く: `label` の単位。
   [fixture: class/gram-member-statement] [fixture: class/lex-label-percent]
10. `:::`: `:::` の単位。 [fixture: class/db-css-class-digit]
11. `-`、`.`、`+`、`%`、 `=`: そのテキストの名前の単位。
    [fixture: class/gram-name-dash-spaces] [fixture: class/gram-name-dots]
    [fixture: class/gram-member-statement] [fixture: class/lex-plus-in-name]
    [fixture: class/lex-equals-in-name] [fixture: class/lex-percent-in-name]
12. 1 個以上の ASCII の英字、ASCII の数字、 `_`: `word` の単位。
    [fixture: class/gram-name-digits]
13. `[` と `]`: そのテキストの名前の単位。 [fixture: class/db-class-label-type]
14. `!`、`$`、`&`、`'`、`?`、`\`、`/` のどれか、
    および文の文脈の外では `,` と `#`: `punctuation` の単位。
    [fixture: class/lex-punctuation-in-name]
15. flowchart と同じ Unicode
    の文字（[Unicode の文字](./flowchart.ja.md#unicode-の文字) を参照）: 1
    文字の `letter` の単位。 [fixture: class/lex-unicode-letter-name]

`note for` には、ちょうど 1 つの空白が要ります。
空白 2 つの `note  for A "x"` と、タブにしたものは拒否されます。
[fixture: class/lex-note-for-two-spaces] [fixture: class/lex-note-for-tab]
空白は図のテキストで数え、その隣のディレクティブは 2 つの単位の間にあります。
`note%%{init: {}}%% for A "t"` と `note %%{init: {}}%%for A "t"` は A
のノートで、 `note %%{init: {}}%% for A "t"` は空白が 2 つなので拒否されます。
どれも mermaid.js と同じです。
[fixture: class/lex-directive-between-note-and-for] [fixture:
class/lex-directive-between-space-and-for] [fixture:
class/lex-note-for-directive-between-spaces]

### クラスの文脈

クラスの文脈には `class` で入り、行の残りを読みます。

1. `"`: 文字列。 [fixture: class/db-class-label-type]
2. 文の文脈の規則 6 と同じく、0 個以上の空白と、
   それに続く 1 個以上の改行: `newline` の単位。
   クラスの文脈を出る。 [fixture: class/gram-blank-lines]
3. 1 個以上のほかの空白: 何も作らない。
   [fixture: class/lex-member-body-one-line]
4. `}`: `}` の単位。
   クラスの文脈と、その下の文脈を出る。
   [fixture: class/lex-class-closes-namespace]
5. `{`: `{` の単位。
   メンバーの文脈に入る。 [fixture: class/lex-member-body-one-line]
6. 共有の規則。 [fixture: class/lex-keyword-prefix-of-name]

文の文脈自身の規則はここでは当てはまりません。
`class A %% c` と `class A : x` は拒否されます。
[fixture: class/lex-class-comment] [fixture: class/lex-class-label]
`}` は 2 つの文脈を出るので、名前空間の本体では、
`class C }` が名前空間を終えます。 [fixture: class/lex-class-closes-namespace]

### メンバーの文脈

メンバーの文脈には、クラスの文脈の `{` で入り、クラスの本体を行ごとに読みます。

1. `{` の直後か改行の後の `"`: 文字列。
   [fixture: class/lex-member-quote-at-start]
2. `}`: `}` の単位。
   メンバーの文脈を出る。 [fixture: class/lex-member-body-close-on-member-line]
3. `[*]`: `[*]` の単位。 [fixture: class/lex-member-edge-state]
4. `{`: `{` の単位。 [fixture: class/lex-member-open-brace]
5. 改行: 何も作らない。 [fixture: class/lex-member-body-close-on-member-line]
6. `{`、`}`、改行以外の 1 個以上の文字: **メンバーの行**。
   [メンバーの行](#メンバーの行) で述べるとおりに単位に分ける。
   [fixture: class/lex-member-body-one-line]

そのため、メンバーの行は改行、`{`、`}` で終わります。
`class A { +x }` はメンバー `+x` を持ち、 `class A {+x`、改行、
`+y}` はメンバー `+x` と `+y` を持ちます。
[fixture: class/lex-member-body-one-line] [fixture:
class/lex-member-body-close-on-member-line]
`"` が文字列を始めるのはメンバーが始まるところだけで、
文法はそこで文字列を取りません。
メンバーの行 `"x"` は拒否され、 `+foo "bar"` は引用符を含むメンバーです。
[fixture: class/lex-member-quote-at-start] [fixture:
class/lex-member-quote-inside]
メンバーの行の中の `%%`、`;`、`[*]`、`~` は、その行の文字です。
`+x %% c` はメンバー `x %% c` です。 [fixture: class/lex-member-percent]
[fixture: class/lex-member-semicolon]
`{` か改行のすぐ後の `[*]` は `[*]` の単位で、文法はそれを取りません。
そのため、本体の中のそれだけの行の `[*]` と `[*] x` は拒否され、
本体の中の `{` も拒否されます。
この文脈には空白の規則がないので、前に空白のある `  [*]` はメンバーの行で、
属性 `[*]` です。 [fixture: class/lex-member-edge-state]
[fixture: class/lex-member-edge-state-then-text]
[fixture: class/lex-member-open-brace]
[fixture: class/lex-member-edge-state-indented]

### メンバーの行

mermaid.js は、メンバーの行を 1 つのテキストとして読み、メンバーを加えるときに、
それを部分に分けます（mermaid.js の
[`addMember`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/classDb.ts#L277-L297)、
[`ClassMember`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/classTypes.ts#L80-L134)）。
分け方はテキストだけで決まるので、字句解析器が分け、各部分は単位になります。
行の両端の空白はどの単位にも属しません。
空白だけの行は `blank-member` の単位を作り、それを持つノードはありません。
残り、つまり**メンバーのテキスト**は、次のうち最初に当てはまるもので分けます。

1. メンバーのテキストが `<<` で始まり `>>` で終わる: **注釈の行**。
   `<<` と `>>` はそのテキストの名前の単位で、その間のテキストは、空でなければ、
   空白を含めて `annotation-name` の単位です。
   [fixture: class/spec-class-diagram-4eb71456]
   [fixture: class/lex-member-annotation-empty]
2. メンバーのテキストが `)` を持ち、
   その最初の `)` が最初の文字でない: **方法の行**。
   `)x()` と `)+login()` は、テキスト全体を名前とする属性の行で、
   `x)y()` は方法の行です。
   [fixture: class/lex-member-parenthesis-first-attribute] [fixture:
   class/lex-member-parenthesis-first-visibility] [fixture:
   class/lex-member-parenthesis-later-method]
3. それ以外: **属性の行**。 [fixture: class/lex-member-classifiers]

**可視性の記号**は、方法の行や属性の行の始まりの `+`、`-`、`#`、`~` のどれかで、
**分類子の記号**は `$` か `*` です。
[fixture: class/spec-class-diagram-3f4d248a]
[fixture: class/lex-member-classifiers]
[fixture: class/lex-member-attribute-star-classifier]
[fixture: class/lex-member-attribute-dollar-classifier]

属性の行の**メンバーの名前のテキスト**は、メンバーのテキストの、
可視性の記号またはその始めから、分類子の記号またはその終わりまでのテキストです。
方法の行のものは、分けた区間かメンバーのテキストの、
分けて置いた可視性の記号の後、またはその始めから、
開き括弧までのテキストです（下を参照）。
その `member-name` の単位は、メンバーの名前のテキストから、終わりの空白と、
最初の文字が空白（U+0020）でなければ始まりの空白を、除いたものです。
空白だけのメンバーの名前のテキストは、空白で始まればそれが単位で、
そうでなければ単位を作りません。
空のメンバーの名前のテキストも単位を作りません。
行の終わりの空白はどの単位にも属さないので、空白 1 つが続くメンバーの行 `+` は、
空のメンバーの名前のテキストを持ち、名前を持たず、メンバーの id は空です。
一方、`+`、空白、`$` のメンバーの名前のテキストは空白 1 つで、それが単位で、
メンバーの id は空白 1 つです。 [fixture: class/db-member-visibility-then-space]
[fixture:
class/db-member-visibility-space-then-classifier]
理由は、mermaid.js がメンバーの名前のテキストを空白ごと取り、
その始まりの空白を、最初の文字が空白なら空白 1 つにし、
そうでなければ除くからです。
mermaid.js のメンバーの名前は書かれたテキストの範囲にならないので、
名前の値は書かれた範囲です。
`+  spaced name` の名前は空白 2 個と `spaced name` で、
メンバーの名前は空白 1 つと `spaced name` です。
[fixture: class/db-member-name-space] [fixture:
class/db-member-name-space-then-tab] [fixture: class/db-member-name-tab]

属性の行は、始まりの可視性の記号の `visibility` の単位、
終わりの分類子の記号の `classifier` の単位、
そのメンバーの名前のテキストの `member-name` の単位に分けます。

方法の行は、次のように分けます。
まず、行が可視性の記号で始まれば、それを離し、残りを分けます。
残りを分けられなければ、可視性の記号を離さず、
メンバーのテキストの全体を分けます。
テキストは、その**開き括弧**と**閉じ括弧**で分けます。
開き括弧は、最初の文字でなく、後のどこかに `)` がある `(` のうち最後のもので、
閉じ括弧は最後の `)` です。
開き括弧がなければ、テキストは分けられません。
単位は次の順です。

1. 離した可視性の記号の `visibility` の単位。
   [fixture: class/spec-class-diagram-3f4d248a]
2. メンバーの名前のテキスト、つまり開き括弧の前のテキストの、
   `member-name` の単位。 [fixture: class/db-member-name-space]
3. `(` の単位、2 つの括弧の間のテキストから両端の空白を除いた、
   空でないものの `parameters` の単位、 `)` の単位。
   [fixture: class/lex-member-method-blank-parameters]
   [fixture: class/lex-directive-in-parameters]
4. 閉じ括弧の直後の文字が分類子の記号なら、その `classifier` の単位。
   [fixture: class/lex-member-classifiers]
5. 残りから両端の空白を除いた、空でないものの `return-type` の単位。
   それが分類子の記号で終わり、項目 4 が何も見つけていなければ、
   その記号は `classifier` の単位で、`return-type` の単位は、
   残りの空白でない最初の文字から、記号の前の空白を含めて記号の前までの、
   空でないものです。
   mermaid.js は、戻り値の型の両端を削ってから記号を除くからです。
   [fixture: class/db-method-return-type-space-before-classifier] [fixture:
   class/db-method-return-type-blank-before-classifier]

mermaid.js は、方法の行を、文字が U+2028 と U+2029 に合わないパターンで分け、
行の 1 つの部分を読みます。
方法の行がそのどちらかを持つと、それらの間にあるメンバーのテキストの部分が、
その**区間**です。
上の分け方は、メンバーのテキストの全体ではなく、分けられる最初の区間に当てます。
区間は、始めの空白を含めて、書かれたとおりに分けます。
可視性の記号は、区間の最初の文字のときだけ分けて置かれ、
その空白の後の `(` は最初の文字ではありません。
`x`、U+2028、`+b(c)` は可視性 `+` を持つ方法 `b` ですが、 `x`、U+2028、
` +b(c)` は可視性のない方法 `+b` で、 `x`、U+2028、` (c)` は、
`(` の前の空白を名前とする方法です。
[fixture: class/lex-member-method-segment-visibility-first] [fixture:
class/lex-member-method-segment-space-before-visibility] [fixture:
class/lex-member-method-segment-space-only-name]
戻り値の型は、その区間の終わりまで続きます。
閉じ括弧が区間の最後の文字なら、次の区間の終わりまで続きます。
区間の前のテキストと、戻り値の型の後のテキストは、
それぞれ両端の空白を除いて何かが残るとき、`ignored-text` の単位で、
mermaid.js はそれを読みません。
空白だけのテキストは単位にならないので、 `+b(c) in`、U+2028、空白は、
戻り値の型 `in` を持ち、後のテキストを持ちません。
[fixture: class/tokens-member-method-ignored-text-blank]
`+a`、U+2028、`b(c) int` は、可視性のない方法 `b` で、
その前に読まれないテキスト `+a` があります。
`+b(c) in`、U+2028、`t` は、戻り値の型 `in` を持ち、
その後に読まれないテキスト `t` があります。
[fixture: class/lex-member-method-line-separator-before] [fixture:
class/lex-member-method-line-separator-after] [fixture:
class/lex-member-method-line-separator-after-parenthesis]
属性の行と注釈の行は、そのようなパターンを使わずに分けるので、
U+2028 と U+2029 はほかの文字と同じくその文字です。
`+a`、U+2028、`b$` は、名前が `a`、U+2028、 `b` の属性です。
[fixture: class/lex-member-attribute-line-separator] [fixture:
class/lex-member-annotation-line-separator]

分けられる区間がなければ、入力は拒否されます。
括弧が 2 つの区間にあるときもそうです。
[fixture: class/lex-member-method-line-separator-in-parameters]
U+2028 と U+2029 がなければ、これは、
残りもメンバーのテキストの全体も分けられないとき、入力は拒否される、
ということです。
`x)` と `(a)` は、mermaid.js と同じく拒否されます。
mermaid.js は、文法が受理した後に、それらに対して、
エラーを投げます（[文法の外での拒否](#文法の外での拒否) を参照）。
[fixture: class/lex-member-method-without-opening]
[fixture: class/lex-member-method-parenthesis-first]

- `+foo(a(b)) int` は、引数 `b)` と戻り値の型 `int` を持つ方法 `foo(a` です。
  [fixture: class/lex-member-method-nested-parentheses]
- `+(a)` は方法 `+` です。
  可視性の記号を離すと、 `(` が最初の文字になるからです。
  [fixture: class/lex-member-method-visibility-as-name]
- `+foo()$ int` は分類子 `$` と戻り値の型 `int` を持ち、
  `-bar() int$` は戻り値の型 `int` と分類子 `$` を持ちます。
  [fixture: class/lex-member-classifiers]
- `<<x)>>` は注釈で、 `<<x>` は属性です。
  [fixture: class/lex-member-annotation-with-parenthesis] [fixture:
  class/lex-member-annotation-unclosed]

### 名前空間の文脈

名前空間の文脈には `namespace` で入り、その `{` までの名前空間の名前を読みます。

1. `"`: 文字列。 [fixture: class/lex-namespace-string-name]
2. キーワード `namespace`: `namespace` の単位。
   名前空間の文脈に入る。 [fixture: class/lex-namespace-keyword-in-name]
3. 0 個以上の空白と、それに続く 1 個以上の改行: `newline` の単位。
   名前空間の文脈を出る。 [fixture: class/lex-namespace-brace-next-line]
4. 1 個以上のほかの空白: 何も作らない。 [fixture: class/gram-namespace-empty]
5. `{`: `{` の単位。
   名前空間の本体の文脈に入る。 [fixture: class/gram-namespace-empty]
6. `}`: `}` を読まずに名前空間の文脈を出る。
   `}` はその下の文脈が読む。 [fixture: class/lex-namespace-close-in-name]
7. 共有の規則。 [fixture: class/lex-directive-in-namespace-name]

`{` は名前の行に要ります。
`namespace A`、改行、 `{` は拒否されます。
[fixture: class/lex-namespace-brace-next-line]

### 名前空間の本体の文脈

1. `"`: 文字列。 [fixture: class/lex-namespace-body-string]
2. キーワード `namespace`: `namespace` の単位。
   名前空間の文脈に入る。 [fixture: class/lex-namespace-two-closing-braces]
3. `}`: `}` の単位。
   名前空間の本体の文脈を出る。 [fixture: class/gram-namespace-empty]
4. 0 個以上の空白と、それに続く 1 個以上の改行: `newline` の単位。
   [fixture: class/lex-namespace-two-closing-braces]
5. 1 個以上のほかの空白: 何も作らない。
   [fixture: class/lex-namespace-two-closing-braces]
6. `[*]`: `[*]` の単位。 [fixture: class/lex-namespace-body-edge-state]
7. キーワード `class`: `class` の単位。
   クラスの文脈に入る。 [fixture: class/lex-class-closes-namespace]
8. 共有の規則。 [fixture: class/gram-namespace-note]

本体の `}` の後、字句解析器は名前空間の文脈に戻り、
`}` の後の改行がその文脈を出ます。
文の文脈自身の規則は、本体の中では当てはまりません。
そこでは、ノートの後のコメントは拒否され、 `style` と方向の行も拒否されます。
[fixture: class/lex-namespace-body-comment] [fixture:
class/lex-namespace-body-style] [fixture: class/lex-direction-in-namespace]
2 つの名前空間は 1 つの行で閉じてかまいません。
`}}` は内側と外側の名前空間を閉じます。
[fixture: class/lex-namespace-two-closing-braces]

### 文字列、バッククォートの名前、ジェネリクスの型

`"`（文の文脈の規則 11 と、クラス、メンバー、名前空間、
名前空間の本体の文脈の規則 1）は文字列を始めます。
`"`、改行を含む次の `"` までの文字、その `"` が、`string` の単位です。
引用符の間に何もなければ、文字列は**空**です。
文字列は複数の行にわたってよく、`;` と `#` はその文字です。
テキストに、最初のものの後の `"` がなければ、入力は拒否されます。
[fixture: class/lex-string-multi-line] [fixture: class/lex-string-semicolon]
[fixture: class/lex-string-unclosed] [fixture: class/db-class-label-type]

`` ` ``（共有の規則 5）は、同じようにバッククォートの名前を始めます。
`` ` ``、改行を含む次の `` ` `` までの文字、その `` ` `` が、
`backquoted` の単位で、バッククォートの間に何もなければ**空**です。
テキストに、最初のものの後の `` ` `` がなければ、単位はテキストの残りを取り、
字句解析器はその終わりで止まります。
名前は閉じていません。 [fixture: class/lex-backquote-unclosed] [fixture:
class/lex-backquote-unclosed-takes-lines]
[fixture: class/div-empty-backquoted-in-name]
`class A.` の後や、`A -->` の後の閉じないバッククォートの名前も同じで、
その名前は残りのテキストを取ります。
名前空間には `{` が要るので、
`namespace` の後の閉じないバッククォートの名前は拒否されます。
[fixture: class/lex-backquote-unclosed-after-prefix]
[fixture: class/lex-backquote-unclosed-relation-end]
[fixture: class/lex-backquote-unclosed-namespace]
その残りの、名前の空白でない最後の文字の後にあるディレクティブは、
mermaid.js がどこでも除くもので、
その後に名前の空白か行終端が続くときは名前の中にあり、
そうでなければ名前の後にあります。
`class`、`` `x``、改行、`%%{init: {}}%%`、改行は、
`x` に改行 3 つが続くクラスを宣言し、
ディレクティブが `x` のすぐ後と空行の後にあり、その後に改行が続く形も、
それぞれの空白を持って同じです。
`` `b`` と空白の後のテキストの終わりにあるときは、クラスは `b`、空白、改行です。
名前の空白でない 2 つの文字の間のディレクティブも、名前の中にあります。
`class`、`` `x``、ディレクティブ、`y`、改行は、
`xy` に改行 2 つが続くクラスを宣言します。
[fixture: class/lex-backquote-unclosed-directive-inside]
[fixture: class/lex-backquote-unclosed-directive-after-line-break] [fixture:
class/lex-backquote-unclosed-directive-right-after-name] [fixture:
class/lex-backquote-unclosed-directive-after-empty-line] [fixture:
class/lex-backquote-unclosed-directive-at-end]

`~`（共有の規則 4）は `~` の単位で、ジェネリクスの文脈に入ります。
そこでは、`~` は `~` の単位で文脈を出て、
改行を含むほかの 1 個以上の文字は `generic-text` の単位です。
[fixture: class/lex-generic-multi-line]

バッククォートの名前とジェネリクスの型のテキストは、
どの文字で始まってもかまいません。
mermaid.js の字句解析器は、バッククォートの状態とジェネリクスの状態で、 `"`、
（バッククォートでは）`~`、`<<` と `>>`、キーワード `cssClass`、`callback`、
`link`、`click`、`note`、`href` の規則を、
テキストの規則より先に試します（mermaid.js の
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L89-L112)）。
テキストがそのどれかで始まると（キーワードでは、後に語の文字が続かないとき）、
mermaid.js は名前の代わりにその単位を読み、テキストはその後で読みます。
これらの入力は既知の差異 `name-start-reads-unit` です（[既知の差異](#既知の差異)
を参照）。
そのため、
キーワード `note` をバッククォートでクラスの名前として書いた ``class `note` ``
は、ここではクラス `note` を宣言し、mermaid.js は拒否します。
`` class `"x` `` と `class A~note x~` は、
ここでは名前 `"x` と型 `note x` で受理されます。
[fixture: class/div-backquote-keyword-escaped] [fixture:
class/div-backquote-starts-with-quote] [fixture:
class/div-backquote-starts-with-tilde] [fixture:
class/div-backquote-starts-with-keyword] [fixture:
class/div-generic-starts-with-quote] [fixture:
class/div-generic-starts-with-keyword]
[fixture: class/div-backquote-starts-with-double-less-than]
[fixture: class/div-backquote-starts-with-double-greater-than]
[fixture: class/div-generic-starts-with-double-less-than]
[fixture: class/div-generic-starts-with-double-greater-than]
[fixture: class/div-backquote-keyword-css-class]
[fixture: class/div-backquote-keyword-callback]
[fixture: class/div-backquote-keyword-link]
[fixture: class/div-backquote-keyword-click]
[fixture: class/div-backquote-keyword-href]
テキストのほかの位置と、キーワードの後に語の文字が続くときは、
どちらも同じに読みます。
`` class `notex` ``、`` class `x note` ``、`class A~linkx~`、
`class A~ note~` はどちらも受理し、
`` class A`~T~` `` はどちらでも A に型 `T` を与えます。
[fixture: class/lex-backquote-keyword-prefix] [fixture:
class/lex-backquote-keyword-later] [fixture: class/lex-generic-keyword-prefix]
[fixture: class/lex-generic-space-before-keyword] [fixture:
class/lex-backquote-around-generic]

### コールバックの文脈

コールバック名の文脈には `call` で入ります。

1. `(`、0 個以上の空白、`)`: `(` の単位と `)` の単位。
   文脈を出る。 [fixture: class/lex-callback-blank-parentheses]
   [fixture: class/gram-click-call-empty-parentheses]
2. `(`: `(` の単位。
   文脈を出て、コールバックの引数の文脈に入る。
   [fixture: class/lex-callback-arguments-multi-line]
3. 改行を含む、 `(` 以外の 1 個以上の文字: `callback-name` の単位。
   [fixture: class/lex-callback-name-multi-line]

コールバックの引数の文脈では、`)` は `)` の単位で文脈を出て、
改行を含むほかの 1 個以上の文字は `callback-arguments` の単位です。
そのため、コールバック名とその引数は、複数の行にわたってかまいません。
[fixture: class/lex-callback-name-multi-line] [fixture:
class/lex-callback-arguments-multi-line]

### アクセシビリティの値

タイトルの文脈と説明の文脈では、空でもよい行の残りが、
`title-text` か `description-text` の単位で、文脈を出ます。
`#` と `;` はその文字です。
説明ブロックの文脈では、`}` は `}` の単位で文脈を出て、
ほかの 1 個以上の文字は `description-block-text` の単位です。
[fixture: class/lex-acc-title-hash-semicolon]
[fixture: class/lex-acc-descr-hash-semicolon]
[fixture: class/gram-acc-descr-block-with-text] [fixture:
class/lex-acc-title-next-line]

## 文法

文法は [common.ja.md](../common.ja.md#表記) の表記を、
文字ではなく単位の上で使います。
`word` のような単位の名前はその名前の単位 1 つを表し、
二重引用符の中のテキストは、`"class"` や `"{"` のように、
そのテキストの名前の単位を表します。
`string` は空でない `string` の単位を、
`string-or-empty` は空でもよい `string` の単位を表します。
`end-of-text` はテキストの終わりを表します。
この文法は
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L221-L438)
の文法を言い換えたもので、同じ単位の並びを受理します。

下の各規則は、
[ast/class.ja.md](../ast/class.ja.md) で定める木のノードを作ります。

| 規則                                                 | ノード                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `diagram`                                            | ClassDiagram                                                                |
| `class-statement`                                    | ClassDeclaration                                                            |
| ラベルのある `member-statement`                      | ClassMemberStatement                                                        |
| ラベルのない `member-statement`                      | ClassNameStatement                                                          |
| `annotation-statement`                               | ClassAnnotationStatement                                                    |
| ラベルを含む `relation-statement`                    | ClassRelationStatement                                                      |
| `relation`                                           | ClassArrow                                                                  |
| `namespace-statement`                                | ClassNamespaceStatement                                                     |
| `note-statement`                                     | ClassNoteStatement                                                          |
| `callback` か `call` の `click-statement`            | ClassCallbackStatement                                                      |
| `link` か `href` の `click-statement`                | ClassLinkStatement                                                          |
| `style-statement`                                    | ClassStyleStatement                                                         |
| `css-class-statement`                                | ClassCssClassStatement                                                      |
| `class-def-statement`                                | ClassClassDefStatement                                                      |
| `direction-statement`                                | ClassDirectionStatement。各 `direction-text` は ClassIgnoredText            |
| `accessibility-statement`、`empty-description-block` | ClassAccTitleStatement、ClassAccDescrStatement、ClassAccDescrBlockStatement |
| `class-name`                                         | ClassName                                                                   |
| `annotation-line` と `"<<" name-part ">>"`           | ClassAnnotation                                                             |
| `method-line`、`attribute-line`                      | ClassMethod、ClassAttribute。`blank-member` はノードを作らない              |
| `string`、`string-or-empty`、`"backquoted"`          | StringLiteral                                                               |
| クラスの名前と名前空間の名前（下に挙げる）           | ClassIdentifier                                                             |
| 名前（下に挙げる）                                   | Identifier                                                                  |
| 引用符のないテキスト（下に挙げる）                   | ClassLiteral                                                                |
| `ignored-text`                                       | ClassIgnoredText                                                            |

クラスの名前と名前空間の名前は、バッククォートの名前の前にあるか、
バッククォートの名前のない、クラスの名前や名前空間の名前の、
名前の部分と `.` の単位です。
名前は次のものです。
文の `:::` の後や `<<` と `>>` の間の名前の部分。
`style` の後の `word`、`classDef` の文のスタイルの前の `word` の単位、
`cssClass` の文の `word`。
引用符のないテキストは次のものです。
`generic-text`、`:` の後の `label` のテキスト、メンバーの行の `member-name`、
`parameters`、`return-type`、`annotation-name`、
`callback-name` と `callback-arguments`、`style-text`、 `title-text`、
`description-text`、`description-block-text`。

### 図と文

```text
diagram    = "header" empty-description-block* newline statement ( statement-end statement )* empty-description-block* newline? end-of-text
statement  = relation-statement label?
           | member-statement
           | class-statement
           | annotation-statement
           | namespace-statement
           | note-statement
           | click-statement
           | style-statement
           | css-class-statement
           | class-def-statement
           | direction-statement
           | accessibility-statement
           | empty-description-block statement
```

文は `newline` の単位で区切られ、その単位は空の行を含んでかまいません。
ほかのもので区切ることはできず、
`class A; class B` は拒否されます（[文の文脈](#文の文脈) を参照）。
[fixture: class/lex-semicolon] [fixture: class/gram-blank-lines]

### 区切りの前の空の説明ブロック

```text
statement-end           = empty-description-block* newline
empty-description-block = "accDescr" "{" "}"
```

`empty-description-block` は、`accDescr` の単位と `{` の単位に、
`description-block-text` の単位なしで `}` の単位がすぐ続くものです。
区切りが要る文は `statement-end` で終わります。
文の最後の単位の後、区切りの前には、空の説明ブロックがいくつ来てもかまいません。
それぞれ、その文の後に続く、テキストのない説明ブロックの文です。
mermaid.js は空の説明ブロックにトークンを読まないので（詳しくは
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.ja.md)
を参照）、その文の後にすぐ区切りが続くものとして読みます。
テキストのある説明ブロックと、ほかの文は、区切りの前に置けません。

class では、文は改行で区切られ、最後の文はテキストの終わりで終わってもよく、
そこでもブロックがその前に来ます（`diagram` の
`empty-description-block* newline? end-of-text`）。
そのため、文がそれを別に読むところを除いて、ブロックは文の後に置けます。
`note for A "x" accDescr {}`、`note for A "x" accDescr {} accDescr {}`、
`A <|-- B accDescr {}`、`click A href "u" accDescr {}`、
`cssClass "A" c accDescr {}` は受理され、テキストの終わりでも同じです。
ここでは、ブロックの前の空白は単位ではありません。
[fixture: class/gram-empty-description-block-after-note] [fixture:
class/gram-empty-description-blocks-after-note] [fixture:
class/gram-empty-description-block-after-relation] [fixture:
class/gram-empty-description-block-after-click] [fixture:
class/gram-empty-description-block-after-css-class] [fixture:
class/gram-empty-description-block-after-statement-at-end]
class の文とメンバーの文は、mermaid.js と同じく、それを別に読みます。
`class A accDescr {}` では、`accDescr` はクラスの名前の名前の部分、
`{}` はその空の本体で、クラスは `AaccDescr` です。
`A : x accDescr {}` では、ラベルがそれをメンバーのテキストに含めます。
[fixture: class/gram-description-block-words-after-class-name] [fixture:
class/gram-description-block-words-after-member]
同じ行でブロックの後にほかの文が続くと、mermaid.js と同じく拒否されます。
`A <|-- B accDescr {} class C` です。
[fixture: class/gram-empty-description-block-after-relation-then-statement]
文が始まるところでは、ブロックは、
同じ行に別の文が続く文です（[空の説明ブロック](#空の説明ブロック) を参照）。

ヘッダーの後にも改行が要り、区切りの前と同じく、
その改行の前には空の説明ブロックが来てもかまいません（`diagram` の
`"header" empty-description-block* newline`）。
それぞれ、図の最初の文です。
`classDiagram accDescr {}`、改行、`class A` は受理され、
ブロックのない同じ入力と同じに読まれます。
ブロックが 2 つでも同じです。
`classDiagram accDescr {} class A` は、ブロックのない同じ入力と同じく拒否され、
ブロックにテキストのある `classDiagram accDescr {x}` と、
`classDiagram accDescr {}` だけのものも拒否されます。
後者は `classDiagram` だけのものと同じで、
文法はヘッダーの改行の後に文を求めるからです。
mermaid.js もこれらを同じに読みます。
[fixture: class/header-empty-description-block] [fixture:
class/header-empty-description-blocks] [fixture:
class/header-empty-description-block-then-statement] [fixture:
class/header-description-block-with-text] [fixture:
class/header-empty-description-block-only]

### クラスの名前

```text
class-name     = ( name-part "."? )* ( name-part | "backquoted" ) generic?
name-part      = word | "-" | letter
generic        = "~" generic-text? "~"
namespace-name = ( name-part "."? )* ( name-part | "backquoted" )
```

クラスの名前は、間に空白か `.` を置いた名前の部分からなり、
バッククォートの名前とジェネリクスの型で終わってかまいません。
部分の間の空白は名前の一部ではありません。
`class Foo Bar` はクラス `FooBar` を宣言し、
`A - B --> C` は `A-B` からの関係を持ちます。 [fixture: class/gram-name-spaces]
[fixture: class/gram-name-dash-spaces]
`.` は、前後に空白があっても名前の一部で、
名前を始めることも終えることもできません。
`class A . B` は `A.B` を宣言し、 `class A.` と `class .A` は拒否されます。
[fixture: class/gram-name-dot-spaces] [fixture: class/gram-name-dot-end]
[fixture: class/gram-name-dot-start]
ジェネリクスの型は名前を終えます。
`class A~T~ B` は拒否されます。 [fixture: class/gram-name-after-generic]
語は数字で始まってかまいません。
`class 12ab` は `12ab` を宣言します。 [fixture: class/gram-name-digits]
そのため、クラスの名前と名前空間の名前は、次の 3 つの形のどれかです。
名前の部分、バッククォートの名前、
名前の部分とそれに続くバッククォートの名前です。
クラスの名前は、
どの形でもジェネリクスの型で終わってかまいません（mermaid.js の
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L244-L258)）。
``class A.`b c` `` は `A.b c` を、``class A`b c` `` は `Ab c` を宣言します。
バッククォートの名前は名前を終えます。
``class `b c`A `` と、 2 つのバッククォートの名前からなる名前は拒否されます。
[fixture: class/gram-name-prefix-backquoted] [fixture:
class/gram-name-word-then-backquoted] [fixture:
class/gram-name-backquoted-then-word] [fixture: class/gram-name-two-backquoted]

### クラスの文

```text
class-statement = "class" class-name class-label? class-tail?
class-label     = "[" string "]"
class-tail      = member-body
                | ":::" name-part ( "{" member-line+ "}" )?
                | "<<" name-part ">>" member-body?
member-body     = "{" member-line* "}"
member-line     = annotation-line | method-line | attribute-line | "blank-member"
```

ラベルは空でない文字列です。
class の文は、CSS クラス（`:::`）と注釈のうち、多くとも 1 つを持ち、
どちらも名前の部分 1 つです。
`class A <<x>> <<y>>`、`class A <<x>>:::c`、`class A:::my-class`、
`class A <<abstract class>>` は拒否されます。
[fixture: class/gram-class-label-empty] [fixture:
class/gram-class-two-annotations] [fixture:
class/gram-class-annotation-then-css-class] [fixture:
class/gram-class-css-class-dash] [fixture:
class/gram-class-annotation-two-words]
`:::` の後のメンバーの本体には、少なくとも 1 つのメンバーの行が要り、
空白だけの行も数えます。
`class A:::c {}` は拒否され、 `class A:::c { }` は受理されます。
[fixture: class/gram-class-css-class-empty-body] [fixture:
class/gram-class-css-class-blank-body]
[fixture: class/spec-class-diagram-b5349b23]
[fixture: class/db-member-name-space]

### メンバーと注釈

```text
member-statement     = class-name label?
annotation-statement = "<<" name-part ">>" class-name
annotation-line      = "<<" annotation-name? ">>"
method-line          = ignored-text? visibility? member-name? "(" parameters? ")" classifier? return-type? classifier? ignored-text?
attribute-line       = visibility? member-name? classifier?
```

ラベルのあるメンバーの文では、ラベルの `:` の後のテキストはメンバーの行で、
[メンバーの行](#メンバーの行) で述べるとおりに分けます。
それが空白だけのとき（`A : ` など）は、空白だけのメンバーの行で、
ノードを作りません。
ラベルのないメンバーの文は、クラスの名前だけの文です。
`Foo` の行がそうです。
class 図には title の文がなく、 `title Animals` もそのような行で、
クラスの名前 `titleAnimals` です。 [fixture: class/gram-member-statement]
[fixture:
class/db-member-statement-blank] [fixture: class/gram-name-alone] [fixture:
class/gram-title-not-statement]
クラスの名前だけの文は、
同じ行の前後にディレクティブや空の説明ブロックがあってもかまいません。
`%%{init: {}}%% Foo`、`accDescr {} Foo`、`Foo accDescr {}` は、
クラスの名前だけの文です。 [fixture: class/gram-directive-then-name-alone]
[fixture: class/gram-empty-description-block-then-name-alone]
[fixture: class/gram-name-alone-then-empty-description-block]
方法の行は、多くとも 1 つの `classifier` の単位を持ちます。

### 関係

```text
relation-statement = class-name string-or-empty? relation string-or-empty? class-name
relation           = relation-end? line relation-end?
relation-end       = "<|" | "|>" | "<" | ">" | "*" | "o" | "()"
line               = "--" | ".."
```

関係の前と後の文字列は、その 2 つの端の多重度で、空でもかまいません。
関係の単位の間には空白を置けます。
`A <|  --  * B` は、両端に `<|` と `*` を持つ線 `--` です。
[fixture: class/gram-relation-spaces] [fixture: class/gram-cardinality-empty]
`:` の後に何もない `A --> B :` は拒否されます。
ラベルには `:` の後に 1 文字以上が要るからです。
[fixture: class/gram-relation-colon-only]

### 名前空間

```text
namespace-statement = "namespace" namespace-name class-label? "{" newline? namespace-item ( newline namespace-item )* newline? "}"
namespace-item      = class-statement | note-statement | namespace-statement
```

名前空間は、class の文、ノート、名前空間を、少なくとも 1 つ持ちます。
`namespace A {` の次の行に `}` があるものと、名前空間の中の関係は拒否されます。
[fixture: class/gram-namespace-empty] [fixture: class/gram-namespace-relation]
[fixture: class/gram-namespace-note]
[fixture: class/db-namespace-redeclared-label]
[fixture: class/lex-namespace-two-closing-braces]

### ほかの文

```text
note-statement          = "note" "for" class-name string | "note" string
click-statement         = "callback" class-name string string-or-empty?
                        | "link" class-name string string-or-empty? "link-target"?
                        | "click" class-name "call" callback-name "(" callback-arguments? ")" string-or-empty?
                        | "click" class-name "href" string string-or-empty? "link-target"?
style-statement         = "style" word styles
class-def-statement     = "classDef" word ( "," word )* styles
css-class-statement     = "cssClass" string word
styles                  = style-text ( "," style-text )*
style-text              = ( word | ":" | "#" | "%" | "style" | label )+
direction-statement     = "direction-text"? "direction" "direction-value" "direction-text"?
accessibility-statement = "accTitle" ":" title-text
                        | "accDescr" ":" description-text
                        | "accDescr" "{" description-block-text "}"
```

ノートのテキスト、リンクの URL、`callback` の関数名、`cssClass` の id は、
空でない文字列です。
クリックの文の 2 つ目の文字列、つまりツールチップは、空でもかまいません。
[fixture: class/gram-note-empty] [fixture: class/gram-link-url-empty]
[fixture: class/gram-callback-name-empty] [fixture:
class/gram-css-class-ids-empty] [fixture: class/gram-link-target]
[fixture: class/gram-click-call-tooltip] [fixture: class/gram-class-def-names]
[fixture: class/gram-link-tooltip-empty] [fixture: class/db-click-href]
[fixture: class/docs-syntax-class-diagram-500154a2]
[fixture: class/tokens-style-comma-unit]
`call` には、関数名の後に括弧が要ります。
`click A call fn` は拒否されます。 [fixture: class/lex-callback-name-unclosed]

`style` の後の id と `classDef` の後の名前は、それぞれ 1 語です。
`style A-B fill:red` は拒否されます。
スタイルは、語、`:`、`#`、`%`、キーワード `style`、ラベルからなります。
ラベルの外の `-` はその一部でないので、
`style A stroke-width:2px` は拒否されます。
一方、`style A fill:#f00,stroke-width:2px` は受理されます。
`-` がラベル `:#f00,stroke-width` の中にあるからです。
[fixture: class/gram-style-id-dash] [fixture:
class/gram-style-dash-outside-label] [fixture: class/gram-style-dash-in-label]

### 空の説明ブロック

`accDescr` の単位と `{` の単位の直後に `}` の単位が続き、
`description-block-text` の単位がないものが、**空の説明ブロック**です。
文の始まりでは、テキストのない説明ブロックの文で、
同じ行に別の文が続かなければなりません。
`accDescr {} class A` は A を宣言します。
一方、`accDescr {}` だけの行は、mermaid.js と同じく拒否されます。
mermaid.js は、そのブロックにトークンを読まず、
その後に `newline` を 2 つ読むからです。
flowchart と sequence では、空の説明ブロックだけの行は受理されます。
[fixture: class/gram-empty-description-block-then-statement] [fixture:
class/gram-empty-description-block-alone]

### 文法の外での拒否

mermaid.js は、文法が受理した後に、次の入力を拒否します。
この仕様も拒否します。

- 存在しないクラスへの注釈の文。
  A を加える文より前の `<<interface>> A` は拒否されます（mermaid.js の
  [`addAnnotation`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/class/classDb.ts#L263-L266)）。
  `class A` の後なら受理されます。
  クラスを**加える**のは、クラスの文、ラベルのあるメンバーの文、関係の文で、
  その各クラス名について、名前空間の本体の中でも加えます。
  ただし、端が `()` だけの関係の、`()` の側の名前はインターフェースを指し、
  クラスを加えません。
  クラス名だけの文、ノート、click、`cssClass`、スタイルの文は加えません。
  注釈の文が指し、文が加えるのは、そのクラス名の **id** のクラスです。
  クラス名の**名前のテキスト**は、ジェネリクスの型の前にある単位のテキストを、
  バッククォートの名前のバッククォートを除いてつないだものです。
  単位の間の空白はその一部ではありません。
  バッククォートの名前が閉じていなければ、
  そのテキストはテキストの終わりまで続き、名前のテキストは改行で終わります。
  字句解析器が最後の文字の後に読む改行です。
  **書いた名前**は、名前のテキストに、クラス名が generic を持つとき、`~`、
  その値（空白を含む）、
  `~` を続けたものです（[ClassName](../ast/class.ja.md#classname) を参照）。
  その id は、`~` を持ち、その最初の `~` が最初の文字でないとき、
  最初の `~` の前のテキストで、そうでなければ書いた名前です。
  そのため、`class A~T~` と ``class `A~T` `` はクラス `A` を加え、
  `<<interface>> A` と `<<interface>> A~T~` はそれを指しますが、
  ``class `~A` `` はクラス `~A` を加え、`` <<interface>> `~A` `` はそれを指し、
  `<<interface>> A` は指しません。
  mermaid.js は、`~` で始まるバッククォートの名前を拒否します。
  [`name-start-reads-unit`](../known-divergences/name-start-reads-unit.ja.md)
  を参照してください。
  `class A~T~` はクラス `T` を加えません。
  [fixture: class/db-annotation-after-generic-class]
  [fixture: class/db-annotation-generic-after-generic-class]
  [fixture: class/db-annotation-generic-after-class]
  [fixture: class/db-annotation-after-backquoted-tilde-class]
  [fixture: class/div-annotation-after-backquoted-leading-tilde-class]
  [fixture: class/div-annotation-backquoted-leading-tilde-class]
  [fixture: class/gram-annotation-for-generic-type]
  [fixture: class/db-backquoted-name-unclosed]
  [fixture: class/db-annotation-statement-undefined-class]
  [fixture: class/spec-class-diagram-280c04be]
  [fixture: class/db-annotation-after-member-statement]
  [fixture: class/db-annotation-after-relation]
  [fixture: class/db-annotation-after-lollipop-class]
  [fixture: class/db-annotation-after-namespace-class]
  [fixture: class/gram-annotation-after-lollipop-interface]
  [fixture: class/gram-annotation-after-note-for]
  [fixture: class/gram-annotation-after-style]
  [fixture: class/gram-annotation-after-name-statement]
  [fixture: class/gram-annotation-after-css-class]
  [fixture: class/gram-annotation-after-click]
- 分けられない方法の行。
  `x)` など（[メンバーの行](#メンバーの行) を参照）。
  [fixture: class/lex-member-method-without-opening]

## 既知の差異

[known-divergences.ja.md](../known-divergences.ja.md) の次の差異が、
class 図に当てはまり、次のように表れます。

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  テキストの単位と文字列の単位のほかの単位、たとえばキーワード、空白のない名前、
  区切り記号、矢印の中のディレクティブは、ここでは入力を拒否にし、
  mermaid.js はそれを受理します。
  `cla%%{init: {}}%%ss A`、`A -%%{init: {}}%%-> B`、
  `class A:%%{init: {}}%%::c` です。 [fixture: class/div-directive-in-keyword]
  [fixture: class/div-directive-in-line]
  [fixture: class/div-directive-in-triple-colon]
  [単位の中のディレクティブ](#単位の中のディレクティブ) を参照してください。
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.ja.md)。**
  多重度 `"style:#x"` の後では行が `style` の規則に当たり、
  関係の線か端の中の無視される `;` は、ここでは入力を拒否させ、
  mermaid.js はそれを受理します。
  `A "style:#x" -;-> B` と `A "style:#x" <;|-- B` がそうです。
  [fixture: class/div-ignored-semicolon-in-relation-line] [fixture:
  class/div-ignored-semicolon-in-relation-end]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.ja.md)。**
  フロントマターに `title: <a` があると、`A : b="c">d` は、
  mermaid.js ではメンバー `b='c'>d` を加えます。
  そのタグは `"c"` の後の `>` まで届くからです。
  ここでは `b="c">d` です。
  `A --> B : b="c">d` の矢印のように、間に `>` があれば、
  mermaid.js ではその `>` がタグを終え、どちらもラベル `b="c">d` を持ちます。
  [fixture: class/div-html-tag-starts-in-frontmatter-member] [fixture:
  class/lex-html-tag-frontmatter-arrow-ends-tag]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.ja.md)。**
  文法が文字列を取らないか、空でない文字列だけを取るところの空の文字列、
  空のバッククォートの名前、クラスの名前を終えない空のジェネリクスの型、
  空の呼び出し、文の始まりでも、文やヘッダーの改行の前でもない、
  文の中の空の説明ブロックは、ここでは入力を拒否にします。
  mermaid.js はそれらにトークンを読まず、入力を受理します。
  `"" A --> B`、`class A""B`、`class A``B`、`class A~~B`、 `A call () --> B`、
  `A accDescr {} --> B` です。
  多重度やツールチップの空の文字列は、どちらも受理します。
  クラスの名前の終わりの空のジェネリクスの型もそうで、
  `class A~~` は型のない A を宣言します。 [fixture:
  class/div-empty-string-statement-start] [fixture:
  class/div-empty-string-in-name] [fixture: class/div-empty-backquoted-in-name]
  [fixture: class/div-empty-generic-in-name] [fixture: class/div-empty-call]
  [fixture: class/div-empty-description-block-in-statement] [fixture:
  class/gram-cardinality-empty] [fixture: class/gram-link-tooltip-empty]
  [fixture: class/gram-generic-empty-at-end]
- **[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.ja.md)。**
  行の中で単位の後にある図のコメントは、この仕様ではその行の終わりで終わり、
  その後の改行は `newline` の単位です。
  mermaid.js は、コメントの後の改行をコメントに取り込み、
  次の行を同じ文の一部として読みます。
  そのため、`classDiagram %% c` に文が続くものと、
  `A --> B %% c` の次の行が `class C` のものは、 mermaid.js は拒否し、
  この仕様は受理します。
  `A --> B %% c` の次の行が `A : +int age` だと、
  mermaid.js では A から `BA` への関係を持つ 1 つの文、
  この仕様では関係とメンバーです。
  `A --> %% c` の次の行が `B` だと、 mermaid.js では A から B への関係、
  この仕様では拒否です。
  空白だけの行は mermaid.js が改行を取るのを止めるので、
  それがコメントの後にあれば、どちらも 2 つの文を読みます。
  ただし、`%%` の後に文字のあるコメント行がその行のすぐ後に来るときは別です。
  mermaid.js は、テキストを読む前に、そのようなコメント行を、
  すぐ前の空白だけの行と一緒に除き（mermaid.js の
  [`cleanupComments`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)）、
  次の行をまたつなぎます。
  `A --> B %% c`、空白の行、`%% x`、`A : +int age` は、
  mermaid.js では A から `BA` への関係です。
  `%% x` の代わりに行 `%%` があるときや、
  `%% x` の後にもう 1 つ空白の行があるときは、どちらも 2 つの文を読みます。
  [fixture: class/div-comment-then-spaces-line-then-comment-line]
  [fixture: class/div-comment-then-two-spaces-lines-then-comment-line] [fixture:
  class/lex-comment-then-spaces-line-then-bare-comment] [fixture:
  class/lex-comment-line-then-spaces-line]
  タブだけの行、U+2028 だけの行、CRLF の改行の空白だけの行でも同じで、
  `%% x` の代わりにディレクティブの行があるときも、
  それはコメント行ではないので、どちらも 2 つの文を読みます。
  [fixture: class/lex-comment-then-tab-line]
  [fixture: class/lex-comment-then-line-separator-line]
  [fixture: class/lex-comment-then-spaces-line-crlf]
  [fixture: class/lex-comment-then-spaces-line-then-directive-line]
  コメントだけの行は、
  どちらでも行として数えません（[文の文脈](#文の文脈) を参照）。
  [fixture: class/div-comment-on-header-line] [fixture:
  class/div-comment-joins-lines] [fixture:
  class/div-comment-before-statement-line] [fixture:
  class/div-comment-in-relation] [fixture: class/lex-comment-blank-line-after]
- **[`headerless-empty-ending`](../known-divergences/headerless-empty-ending.ja.md)。**
  最初の語が、
  `classDiagram` に ASCII の語の文字が続くもの（`classDiagramX`
  など）のテキストは、ヘッダーを持たず、ここでは拒否されます。
  mermaid.js は、テキストが、空のタイトル、説明、説明ブロック、`click A call`、
  `callback`、`link`、`click` の文の終わりで開いた文字列で終わるとき、
  それを受理します。
  `classDiagramX` の次の行が `accTitle:` のものがそうです。
  [fixture: class/div-headerless-empty-title] [fixture:
  class/div-headerless-empty-call] [fixture: class/div-headerless-empty-string]
  [fixture: class/div-headerless-repeated-header]
  [fixture: class/div-headerless-empty-description-block]
  [fixture: class/div-headerless-link-string-opened]
  [fixture: class/div-headerless-click-string-opened]
- **[`name-start-reads-unit`](../known-divergences/name-start-reads-unit.ja.md)。**
  `"`、（バッククォートでは）`~`、`<<` か `>>`、キーワード `cssClass`、
  `callback`、`link`、`click`、`note`、`href` のどれかで始まる、
  バッククォートの名前やジェネリクスの型のテキストは、ここでは名前や型です。
  mermaid.js は代わりにその単位を読みます。
  [文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
  を参照してください。
  ``class `note` `` は、ここではクラス `note` を宣言し、
  mermaid.js は拒否します。
  ``A `"1"` --> B`` は、ここでは `A"1"` からの関係、
  mermaid.js では多重度 `1` です。
  [fixture: class/div-backquote-keyword-escaped] [fixture:
  class/div-backquote-around-string]
  [fixture: class/div-backquote-starts-with-double-less-than]
  [fixture: class/div-backquote-starts-with-double-greater-than]
  [fixture: class/div-generic-starts-with-double-less-than]
  [fixture: class/div-generic-starts-with-double-greater-than]
  [fixture: class/div-backquote-keyword-css-class]
  [fixture: class/div-backquote-keyword-callback]
  [fixture: class/div-backquote-keyword-link]
  [fixture: class/div-backquote-keyword-click]
  [fixture: class/div-backquote-keyword-href]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.ja.md)。**
  ヘッダーの後のどこかにある `C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment`（クラス名、メンバー、ラベルなど）は、
  mermaid.js ではテキストを C4 のパーサーに渡させ、拒否されます。
  ここではテキストは class 図です。
  [fixture: class/div-c4-keyword-as-class-name]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.ja.md)。**
  `%%` だけの行とヘッダーの間の空白だけの行（空でない行）は、
  ここではトリビアです。
  mermaid.js は入力を拒否します。
  class の字句解析器がその行を `newline` の単位として読み、
  文法はヘッダーの前でそれを取らないからです（[検出](#検出) を参照）。
  コメント行の直前の空白だけの行はコメント領域に入り、どちらでもトリビアです。
  1 行だけのディレクティブもどちらでもトリビアです。
  ディレクティブを除くと空白だけになる行は、空白だけの行と数えます。
  [fixture: class/header-after-bare-percent-then-whitespace-line] [fixture:
  class/header-after-empty-braces-then-whitespace-line] [fixture:
  class/header-after-bare-percent-then-indented-directive-line] [fixture:
  class/header-after-bare-percent-then-directive-line] [fixture:
  class/header-after-bare-percent-then-whitespace-line-then-comment-line]

# Class

英語版: [class.md](./class.md)

mermaid.js での正解の出どころ:

- [`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison)
- [`classDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts)
- [`classTypes.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classTypes.ts)
- [`class/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class)
  のテスト（`*.spec.ts`）

この文書は、図種 `classDiagram` を扱います。
木のノードとトークンは [ast/class.ja.md](../ast/class.ja.md) で定めます。

## 検出

[detection.ja.md](../detection.ja.md) の項目 9 がこの文法を選びます。
テキストが、空白の後に、
ちょうどこの大文字小文字で `classDiagram` から始まるときです。
[fixture: common/detect-minimal-class-diagram] [fixture:
common/detect-case-sensitive-class]

判定はテキストの始まりだけを見ます。
その後、文法はヘッダーのキーワード `classDiagram-v2` か `classDiagram` を、
後に語の文字が続かないものとしてもう一度読み
（[文の文脈](#文の文脈) を参照）、その後に `newline` の単位を読みます。
そのため、`classDiagram-v2` は同じ図のヘッダーです。
一方、`classDiagramX`、`classDiagram-v3`、`classDiagram class A` は、
class 図と判定され、拒否されます。
ヘッダーだけの入力も拒否されます。
文法は少なくとも 1 つの文を求めるからです。
[fixture: class/header-v2] [fixture:
class/header-word-after-keyword] [fixture: class/header-other-suffix] [fixture:
class/header-statement-same-line] [fixture: class/header-only]

判定は字句解析器より多くを除きます
（[図種の検出](../common.ja.md#図種の検出) を参照）。
`%%` だけの行や、ディレクティブではない `%%{ }%%` の行は、
ヘッダーの前にあってよく、テキストはそれでも class 図と判定されます。
そのような行はコメントだけの行で、行として数えません
（[文の文脈](#文の文脈) の規則 2）。
コメントは `Root.comments` に入り、ClassDiagram はヘッダーから始まります。
文の間でも、そのような行は同じく受理されます。
一方、その後の空白だけの行はそれだけで `newline` の単位になり、
mermaid.js と同じく入力は拒否されます。
[fixture: class/lex-bare-percent-line-between-statements] [fixture:
class/lex-bare-percent-line-then-blank-line] [fixture:
class/lex-bare-percent-line-then-spaces-line]
判定が除かない、ヘッダーの前のテキスト（`#` の行など）では、
判定が失敗します。
[fixture: class/header-after-bare-percent-line] [fixture:
class/header-after-empty-braces-line] [fixture: class/header-after-hash-line]

## 字句構造

字句解析器は、[図のテキスト](../common.ja.md#ソースの読み方) を
[変換した形](../common.ja.md#ソースの読み方) で読みます。
各行終端を `\n` として、各属性の引用符を `'` として、
各エンティティをその置き換え文字として読み、
コメント領域と行単位の規則が無視する `;` は、ないかのように読み進めます。
最後の文字の後に字句解析器が読む `\n`
（[テキストの終わり](../common.ja.md#テキストの終わり)）は、
図のテキストの一部です。
この節は、図自身のトークンの規則を述べます。
[ソースの読み方](../common.ja.md#ソースの読み方) の項目 4 に当たります。

この図の mermaid.js の字句解析器は、
文字を書かれたとおりの大文字小文字で比べます。
`Class A` は class の文ではなく、何も宣言しない名前 `ClassA` だけの文で、
`Note "x"` は拒否されます。
[fixture: class/lex-keyword-upper-case] [fixture: class/lex-note-upper-case]
下の**キーワード**は、後に語の文字が続かない語です
（[表記](../common.ja.md#表記) を参照）。
`class classA` はクラス `classA` を宣言します。
一方、`class-A` では、`-` は語の文字でないので、
字句解析器はキーワード `class` を読み、その後に名前 `-A` を読みます。
[fixture: class/lex-keyword-prefix-of-name] [fixture:
class/lex-keyword-before-dash]

### 単位と文脈

字句解析器は、図のテキストを**単位**に分けます。
文法は単位の上に書かれ、木のトークンは単位から作られます
（[ast/class.ja.md](../ast/class.ja.md#トークン) を参照）。
各単位は、文法が使う名前と、
**テキスト**、つまりそれが読んだ文字を変換した形で持ちます。

字句解析器は**文脈**のスタックを持ち、文の文脈から始めます。
規則は、文脈に入る（スタックの上に積む）か、
今の文脈を出る（その下の文脈に戻る）ことがあります。
文の文脈を出ても、文の文脈のままです。
各位置で、字句解析器は、
今の文脈の規則のうち、そこで当たる最初のものを適用します。
規則が読む空白は、規則がそう述べない限り、どの単位にも属しません。

各文脈の規則を下に挙げます。
今の文脈のどの規則も当たらなければ、入力は拒否されます。
一覧ではこれを繰り返しません。
文の文脈、クラスの文脈、名前空間の文脈、名前空間の本体の文脈は、
**共有の規則**で終わります。
ほかの文脈は、どの文字も自身の規則で読みます。

テキストの終わりで、字句解析器は、文の文脈と、
閉じていないバッククォートの名前の後で止まります
（[文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
を参照）。
ほかの文脈では、入力は拒否されます。
テキストが終わるときに閉じていないメンバーの本体、名前空間の本体、
ジェネリクスの型、コールバックの名前やその引数、タイトル、説明、
説明ブロックです。
[fixture: class/lex-member-body-unclosed] [fixture:
class/lex-namespace-body-unclosed] [fixture: class/lex-generic-unclosed]
[fixture: class/lex-callback-name-unclosed] [fixture:
class/lex-callback-arguments-unclosed] [fixture: class/lex-acc-title-at-end]
[fixture: class/lex-acc-descr-block-unclosed]
タイトルの文脈には、`accTitle:` の後の空白を改行も含めて読んだ後で入るので、
後に空白しかない `accTitle:` は、テキストの終わりで拒否されます。

### 単位の中のディレクティブ

字句解析器は、ディレクティブのない図のテキストを、
mermaid.js がディレクティブを取り除いた後のテキストを読むのと同じように、
読みます。
その後、
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
の規則が、単位とそこから作るトークン
（[ast/class.ja.md](../ast/class.ja.md#トークン)）に当てはまります。
種類が `RawText` か `Identifier` の単位の中のディレクティブは、
そのトークンを切り、入力は mermaid.js の読み方を保ちます。
ほかの種類の単位の中のディレクティブは、入力を拒否にします。

- `class Fo%%{init: {}}%%o` は `Foo` を宣言し、
  `A : +fo%%{init: {}}%%o()` は方法 `foo` を加え、
  `A --> B : x%%{init: {}}%%y` はラベル `xy` を持ちます。
  どれも mermaid.js と同じです。
  [fixture: class/lex-directive-in-name] [fixture:
  class/lex-directive-in-member] [fixture: class/lex-directive-in-label]
- 2 つの単位の間のディレクティブは、単位の種類によらず許されます。
  `A <|%%{init: {}}%%-- B` は extension です。
  [fixture: class/lex-directive-between-relation-end-and-line]
- `cla%%{init: {}}%%ss A`、`A -%%{init: {}}%%-> B`、
  `note "a%%{init: {}}%%b"`、`class A:%%{init: {}}%%::c` では、
  ディレクティブはキーワード、線、文字列、`:::` の中にあり、
  入力は拒否されます。mermaid.js はそれを受理します
  （[既知の差](#既知の差) を参照）。
  [fixture: class/div-directive-in-keyword] [fixture:
  class/div-directive-in-line] [fixture: class/div-directive-in-string]
  [fixture: class/div-directive-in-triple-colon]

### 文の文脈

文の文脈で、字句解析器は次の規則を順に試します。

1. **方向の行**（下を参照）。
2. `%%` と、改行までの行の残り: 図のコメント。
   その印は `%%` で、値は印の後のテキストです
   （[Comment](../ast.ja.md#comment) を参照）。
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
   その後の改行は `newline` の単位です（[既知の差](#既知の差) を参照）。
3. `accTitle`、0 個以上の空白、`:`、0 個以上の空白:
   `accTitle` の単位と `:` の単位。タイトルの文脈に入る。
4. `accDescr`、0 個以上の空白、`:`、0 個以上の空白:
   `accDescr` の単位と `:` の単位。説明の文脈に入る。
5. `accDescr`、0 個以上の空白、`{`、0 個以上の空白:
   `accDescr` の単位と `{` の単位。説明ブロックの文脈に入る。
6. 0 個以上の空白と、それに続く 1 個以上の改行。
   最後に読む文字が改行になるよう、できるだけ多く読む: `newline` の単位。
   空の行や空白だけの行も、その一部です。
7. 1 個以上のほかの空白: 何も作らない。
8. キーワード `classDiagram-v2` と `classDiagram`: `header` の単位。
9. `[*]`: `[*]` の単位。
10. `call` と 1 個以上の空白: `call` の単位。コールバック名の文脈に入る。
11. `"`: 文字列
    （[文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
    を参照）。
12. キーワード `style` と `classDef`: キーワードの名前の単位。
13. キーワード `namespace`: `namespace` の単位。名前空間の文脈に入る。
14. キーワード `class`: `class` の単位。クラスの文脈に入る。
15. 共有の規則。
    文の文脈では、句読点の規則より前の共有の規則が読まない `:`、`,`、`#` は、
    そのテキストの名前の単位です。

単位 `[*]`、`=`、`+`、`punctuation` は、文法のどの規則も取らないので、
それを持つ入力は拒否されます。
順番から生じることの例:

- キーワードは、単位が始まるところならどこでもキーワードです。
  `class note`、`class link`、`class o`、`class _self` は拒否され、
  `note` への関係も拒否されます。
  一方、`class noteX` と `class order` は、`noteX` と `order` を宣言します。
  [fixture: class/lex-keyword-note-as-name] [fixture:
  class/lex-keyword-link-as-name] [fixture: class/lex-keyword-o-as-name]
  [fixture: class/lex-keyword-link-target-as-name] [fixture:
  class/lex-keyword-prefix-of-note] [fixture: class/lex-keyword-o-prefix]
- `o` が関係の端になるのは、後に語の文字が続かないときだけです。
  `A --o B` は集約で、
  `A --oB` は、A からクラス `oB` への、端のない関係です。
  [fixture: class/lex-aggregation-end] [fixture: class/lex-o-before-word]
- `call` がキーワードになるのは、後に空白があるときだけです。
  `class callX` は `callX` を宣言し、`A --> call` は拒否されます。
  [fixture: class/lex-call-prefix] [fixture: class/lex-call-at-end]
- ラベル（共有の規則 9）は、`:`、`;`、改行で終わります。
  ラベルの中の `%%` はその一部です。
  `A --> B : x %% c` のラベルは `x %% c` です。
  2 つ目の `:` は 2 つ目のラベルを始め、文法はそれを取りません。
  `A --> B : x : y` と `A : foo(a: int)` は拒否されます。
  `;` はどの規則にも当たらないので、`A : x;y` は拒否されます。
  [fixture: class/lex-label-percent] [fixture: class/lex-label-two-colons]
  [fixture: class/lex-label-colon-in-member] [fixture:
  class/lex-label-semicolon]
- `;`、`{`、`}`、`|`、`)` の続かない `(`、`)`、`@`、`^` は、
  文の文脈のどの規則にも当たりません。
  `class A; class B`、`A | B`、`A@B --> C` は拒否されます。
  [fixture: class/lex-semicolon] [fixture: class/lex-pipe] [fixture:
  class/lex-at]
- エンティティは、その置き換え文字として読まれます
  （[エンティティ](../common.ja.md#エンティティ) を参照）。
  その最初の文字は文字の規則の文字ですが、2 文字目を読む規則はないので、
  名前の中のエンティティは拒否されます。
  ラベル、文字列、メンバーの中では、テキストの一部です。
  [fixture: class/lex-entity-in-name] [fixture: class/lex-entity-in-label]
  [fixture: class/lex-entity-in-note] [fixture: class/lex-entity-in-member]

**方向の行。**
今の位置から、改行、U+2028、U+2029 を含まない文字の並び、
`direction`、改行を含む 1 個以上の空白、
`TB`、`BT`、`RL`、`LR` のどれか、
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
これは flowchart の方向の行（そちらの [文の文脈](./flowchart.ja.md#文の文脈)
を参照）から、値 `TD` を除いたものです。
ここでは最初の規則なので、文の文脈の各行の始まりで試され、行の全体を取ります。

- `class A direction LR` は方向の行で、クラスを宣言しません。
  `A --> B : set direction LR now` も方向の行で、関係を持ちません。
  [fixture: class/lex-direction-line-class-statement] [fixture:
  class/lex-direction-line-in-label]
- 引用符は規則を妨げません。
  `note "x direction TB"` と、URL に `direction TB` を含むリンクは、
  方向の行です。
  [fixture: class/lex-direction-line-in-note] [fixture:
  class/lex-direction-line-in-url]
- ヘッダーの行も取ります。
  `classDiagram direction LR` はヘッダーを持たず、拒否されます。
  [fixture: class/header-direction-line]
- `direction LR direction TB` の値は `TB` です。
  `direction TBX` の値は `TB` で、その後のテキストは `X` です。
  `direction`、改行、`LR` の値は `LR` です。
  `direction lr` は方向の行ではなく、何も宣言しない名前 `directionlr` です。
  [fixture: class/lex-direction-line-two-values] [fixture:
  class/lex-direction-line-value-then-text] [fixture:
  class/lex-direction-line-value-next-line] [fixture:
  class/lex-direction-lower-case]
- ほかの文脈ではこの規則を試しません。
  名前空間の本体では `direction LR` は拒否され、
  メンバーの本体ではメンバーです。
  [fixture: class/lex-direction-in-namespace] [fixture:
  class/lex-direction-in-member-body]

### 共有の規則

1. キーワード `cssClass`、`callback`、`link`、`click`、
   2 語の間に空白 1 つの `note for`、`note`: キーワードの名前の単位。
2. `<<` と `>>`: そのテキストの名前の単位。
3. キーワード `href`: `href` の単位。
4. `~`: `~` の単位。ジェネリクスの文脈に入る。
5. `` ` ``: バッククォートの名前
   （[文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
   を参照）。
6. キーワード `_self`、`_blank`、`_parent`、`_top`: `link-target` の単位。
7. **関係の端**: `<|`、`|>`、`>`、`<`、`*`、後に語の文字が続かない `o`、`()`。
   そのテキストの名前の単位。
8. **線**: `--` か `..`。そのテキストの名前の単位。
9. `:` と、`:`、`;`、改行以外の 1 個以上の文字をできるだけ多く: `label` の単位。
10. `:::`: `:::` の単位。
11. `-`、`.`、`+`、`%`、`=`: そのテキストの名前の単位。
12. 1 個以上の ASCII の英字、ASCII の数字、`_`: `word` の単位。
13. `[` と `]`: そのテキストの名前の単位。
14. `!`、`$`、`&`、`'`、`?`、`\`、`/` のどれか、
    および文の文脈の外では `,` と `#`: `punctuation` の単位。
15. flowchart と同じ Unicode の文字
    （[Unicode の文字](./flowchart.ja.md#unicode-の文字) を参照）:
    1 文字の `letter` の単位。

`note for` には、ちょうど 1 つの空白が要ります。
空白 2 つの `note  for A "x"` と、タブにしたものは拒否されます。
[fixture: class/lex-note-for-two-spaces] [fixture: class/lex-note-for-tab]

### クラスの文脈

クラスの文脈には `class` で入り、行の残りを読みます。

1. `"`: 文字列。
2. 文の文脈の規則 6 と同じく、0 個以上の空白と、それに続く 1 個以上の改行:
   `newline` の単位。クラスの文脈を出る。
3. 1 個以上のほかの空白: 何も作らない。
4. `}`: `}` の単位。クラスの文脈と、その下の文脈を出る。
5. `{`: `{` の単位。メンバーの文脈に入る。
6. 共有の規則。

文の文脈自身の規則はここでは当てはまりません。
`class A %% c` と `class A : x` は拒否されます。
[fixture: class/lex-class-comment] [fixture: class/lex-class-label]
`}` は 2 つの文脈を出るので、
名前空間の本体では、`class C }` が名前空間を終えます。
[fixture: class/lex-class-closes-namespace]

### メンバーの文脈

メンバーの文脈には、クラスの文脈の `{` で入り、クラスの本体を行ごとに読みます。

1. `{` の直後か改行の後の `"`: 文字列。
2. `}`: `}` の単位。メンバーの文脈を出る。
3. `[*]`: `[*]` の単位。
4. `{`: `{` の単位。
5. 改行: 何も作らない。
6. `{`、`}`、改行以外の 1 個以上の文字: **メンバーの行**。
   [メンバーの行](#メンバーの行) で述べるとおりに単位に分ける。

そのため、メンバーの行は改行、`{`、`}` で終わります。
`class A { +x }` はメンバー `+x` を持ち、
`class A {+x`、改行、`+y}` はメンバー `+x` と `+y` を持ちます。
[fixture: class/lex-member-body-one-line] [fixture:
class/lex-member-body-close-on-member-line]
`"` が文字列を始めるのはメンバーが始まるところだけで、
文法はそこで文字列を取りません。
メンバーの行 `"x"` は拒否され、`+foo "bar"` は引用符を含むメンバーです。
[fixture: class/lex-member-quote-at-start] [fixture:
class/lex-member-quote-inside]
メンバーの行の中の `%%`、`;`、`[*]`、`~` は、その行の文字です。
`+x %% c` はメンバー `x %% c` です。
[fixture: class/lex-member-percent] [fixture: class/lex-member-semicolon]
`[*]` だけのメンバーの行と、本体の中の `{` は拒否されます。
[fixture: class/lex-member-edge-state] [fixture: class/lex-member-open-brace]

### メンバーの行

mermaid.js は、メンバーの行を 1 つのテキストとして読み、
メンバーを Db に加えるときに、それを部分に分けます
（[`addMember`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L277-L297)、
[`ClassMember`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classTypes.ts#L80-L134)）。
分け方はテキストだけで決まるので、字句解析器が分け、各部分は単位になります。
行の両端の空白はどの単位にも属しません。
空白だけの行は `blank-member` の単位を作り、それを持つトークンはありません。
残り、つまり**メンバーのテキスト**は、次のうち最初に当てはまるもので分けます。

1. メンバーのテキストが `<<` で始まり `>>` で終わる: **注釈の行**。
   `<<` と `>>` はそのテキストの名前の単位で、
   その間のテキストは、空でなければ、空白を含めて `annotation-name` の単位です。
2. メンバーのテキストが `)` を持ち、その最初の `)` が最初の文字でない:
   **方法の行**。
   `)x()` と `)+login()` は、テキスト全体を名前とする属性の行で、
   `x)y()` は方法の行です。
   [fixture: class/lex-member-parenthesis-first-attribute] [fixture:
   class/lex-member-parenthesis-first-visibility] [fixture:
   class/lex-member-parenthesis-later-method]
3. それ以外: **属性の行**。

**可視性の記号**は、方法の行や属性の行の始まりの `+`、`-`、`#`、`~` のどれかで、
**分類子の記号**は `$` か `*` です。

属性の行は、始まりの可視性の記号の `visibility` の単位、
終わりの分類子の記号の `classifier` の単位、
その間のテキストから両端の空白を除いた、
空でないものの `member-name` の単位に分けます。

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
2. 開き括弧の前のテキストから両端の空白を除いた、
   空でないものの `member-name` の単位。
3. `(` の単位、2 つの括弧の間のテキストから両端の空白を除いた、
   空でないものの `parameters` の単位、`)` の単位。
4. 閉じ括弧の直後の文字が分類子の記号なら、その `classifier` の単位。
5. 残りから両端の空白を除いた、空でないものの `return-type` の単位。
   それが分類子の記号で終わり、項目 4 が何も見つけていなければ、
   その記号は `classifier` の単位で、`return-type` の単位は、
   その前の空白を除いて、その前で終わります。

mermaid.js は、方法の行を、文字が U+2028 と U+2029 に合わないパターンで分け、
行の 1 つの部分を読みます。
方法の行がそのどちらかを持つと、
それらの間にあるメンバーのテキストの部分が、その**区間**です。
上の分け方は、メンバーのテキストの全体ではなく、分けられる最初の区間に当てます。
区間は、始めの空白を含めて、書かれたとおりに分けます。
可視性の記号は、区間の最初の文字のときだけ分けて置かれ、
その空白の後の `(` は最初の文字ではありません。
`x`、U+2028、`+b(c)` は可視性 `+` を持つ方法 `b` ですが、
`x`、U+2028、` +b(c)` は可視性のない方法 `+b` で、
`x`、U+2028、` (c)` は名前のない方法です。
[fixture: class/lex-member-method-segment-visibility-first] [fixture:
class/lex-member-method-segment-space-before-visibility] [fixture:
class/lex-member-method-segment-space-only-name]
戻り値の型は、その区間の終わりまで続きます。
閉じ括弧が区間の最後の文字なら、次の区間の終わりまで続きます。
区間の前のテキストと、戻り値の型の後のテキストは、
それぞれ両端の空白を除いて `ignored-text` の単位で、
mermaid.js はそれを読みません。
`+a`、U+2028、`b(c) int` は、可視性のない方法 `b` で、
その前に読まれないテキスト `+a` があります。
`+b(c) in`、U+2028、`t` は、戻り値の型 `in` を持ち、
その後に読まれないテキスト `t` があります。
[fixture: class/lex-member-method-line-separator-before] [fixture:
class/lex-member-method-line-separator-after] [fixture:
class/lex-member-method-line-separator-after-parenthesis]
属性の行と注釈の行は、そのようなパターンを使わずに分けるので、
U+2028 と U+2029 はほかの文字と同じくその文字です。
`+a`、U+2028、`b$` は、名前が `a`、U+2028、`b` の属性です。
[fixture: class/lex-member-attribute-line-separator] [fixture:
class/lex-member-annotation-line-separator]

分けられる区間がなければ、入力は拒否されます。
括弧が 2 つの区間にあるときもそうです。
[fixture: class/lex-member-method-line-separator-in-parameters]
U+2028 と U+2029 がなければ、これは、
残りもメンバーのテキストの全体も分けられないとき、入力は拒否される、
ということです。
`x)` と `(a)` は、mermaid.js と同じく拒否されます。
mermaid.js では、その Db がそれらに対してエラーを投げます
（[文法の外での拒否](#文法の外での拒否) を参照）。
[fixture: class/lex-member-method-without-opening] [fixture:
class/lex-member-method-parenthesis-first]

- `+foo(a(b)) int` は、引数 `b)` と戻り値の型 `int` を持つ方法 `foo(a` です。
  [fixture: class/lex-member-method-nested-parentheses]
- `+(a)` は方法 `+` です。可視性の記号を離すと、`(` が最初の文字になるからです。
  [fixture: class/lex-member-method-visibility-as-name]
- `+foo()$ int` は分類子 `$` と戻り値の型 `int` を持ち、
  `-bar() int$` は戻り値の型 `int` と分類子 `$` を持ちます。
  [fixture: class/lex-member-classifiers]
- `<<x)>>` は注釈で、`<<x>` は属性です。
  [fixture: class/lex-member-annotation-with-parenthesis] [fixture:
  class/lex-member-annotation-unclosed]

### 名前空間の文脈

名前空間の文脈には `namespace` で入り、その `{` までの名前空間の名前を読みます。

1. `"`: 文字列。
2. キーワード `namespace`: `namespace` の単位。名前空間の文脈に入る。
3. 0 個以上の空白と、それに続く 1 個以上の改行: `newline` の単位。
   名前空間の文脈を出る。
4. 1 個以上のほかの空白: 何も作らない。
5. `{`: `{` の単位。名前空間の本体の文脈に入る。
6. `}`: `}` を読まずに名前空間の文脈を出る。`}` はその下の文脈が読む。
7. 共有の規則。

`{` は名前の行に要ります。
`namespace A`、改行、`{` は拒否されます。
[fixture: class/lex-namespace-brace-next-line]

### 名前空間の本体の文脈

1. `"`: 文字列。
2. キーワード `namespace`: `namespace` の単位。名前空間の文脈に入る。
3. `}`: `}` の単位。名前空間の本体の文脈を出る。
4. 0 個以上の空白と、それに続く 1 個以上の改行: `newline` の単位。
5. 1 個以上のほかの空白: 何も作らない。
6. `[*]`: `[*]` の単位。
7. キーワード `class`: `class` の単位。クラスの文脈に入る。
8. 共有の規則。

本体の `}` の後、字句解析器は名前空間の文脈に戻り、
`}` の後の改行がその文脈を出ます。
文の文脈自身の規則は、本体の中では当てはまりません。
そこでは、ノートの後のコメントは拒否され、`style` と方向の行も拒否されます。
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
[fixture: class/lex-string-unclosed]

`` ` ``（共有の規則 5）は、同じようにバッククォートの名前を始めます。
`` ` ``、改行を含む次の `` ` `` までの文字、その `` ` `` が、
`backquoted` の単位で、バッククォートの間に何もなければ**空**です。
テキストに、最初のものの後の `` ` `` がなければ、
単位はテキストの残りを取り、字句解析器はその終わりで止まります。
名前は閉じていません。
[fixture: class/lex-backquote-unclosed] [fixture:
class/lex-backquote-unclosed-takes-lines]

`~`（共有の規則 4）は `~` の単位で、ジェネリクスの文脈に入ります。
そこでは、`~` は `~` の単位で文脈を出て、
改行を含むほかの 1 個以上の文字は `generic-text` の単位です。
[fixture: class/lex-generic-multi-line]

バッククォートの名前とジェネリクスの型のテキストは、
どの文字で始まってもかまいません。
mermaid.js の字句解析器は、バッククォートの状態とジェネリクスの状態で、
`"`、（バッククォートでは）`~`、`<<` と `>>`、
キーワード `cssClass`、`callback`、`link`、`click`、`note`、`href` の規則を、
テキストの規則より先に試します
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L89-L112)）。
テキストがそのどれかで始まると（キーワードでは、後に語の文字が続かないとき）、
mermaid.js は名前の代わりにその単位を読み、テキストはその後で読みます。
これらの入力は既知の差 `name-start-reads-unit` です（[既知の差](#既知の差) を参照）。
そのため、キーワード `note` をバッククォートでクラスの名前として書いた
``class `note` `` は、ここではクラス `note` を宣言し、mermaid.js は拒否します。
`` class `"x` `` と `class A~note x~` は、
ここでは名前 `"x` と型 `note x` で受理されます。
[fixture: class/div-backquote-keyword-escaped] [fixture:
class/div-backquote-starts-with-quote] [fixture:
class/div-backquote-starts-with-tilde] [fixture:
class/div-backquote-starts-with-keyword] [fixture:
class/div-generic-starts-with-quote] [fixture:
class/div-generic-starts-with-keyword]
テキストのほかの位置と、キーワードの後に語の文字が続くときは、
どちらも同じに読みます。
`` class `notex` ``、`` class `x note` ``、`class A~linkx~`、`class A~ note~` は
どちらも受理し、`` class A`~T~` `` はどちらでも A に型 `T` を与えます。
Db が名前のテキスト `A~T~` をその `~` で分けるからです。
[fixture: class/lex-backquote-keyword-prefix] [fixture:
class/lex-backquote-keyword-later] [fixture: class/lex-generic-keyword-prefix]
[fixture: class/lex-generic-space-before-keyword] [fixture:
class/lex-backquote-around-generic]

### コールバックの文脈

コールバック名の文脈には `call` で入ります。

1. `(`、0 個以上の空白、`)`: `(` の単位と `)` の単位。文脈を出る。
2. `(`: `(` の単位。文脈を出て、コールバックの引数の文脈に入る。
3. 改行を含む、`(` 以外の 1 個以上の文字: `callback-name` の単位。

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
[fixture: class/lex-acc-title-hash-semicolon] [fixture:
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
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L221-L438)
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
| 名前（下に挙げる）                                   | Identifier                                                                  |
| 引用符のないテキスト（下に挙げる）                   | ClassLiteral                                                                |
| `ignored-text`                                       | ClassIgnoredText                                                            |

名前は次のものです。
バッククォートの名前の前にあるか、バッククォートの名前のない、
クラスの名前や名前空間の名前の名前の部分。
文の `:::` の後や `<<` と `>>` の間の名前の部分。
`style` の後の `word`、`classDef` の文のスタイルの前の `word` の単位、
`cssClass` の文の `word`、`callback-name`。
引用符のないテキストは次のものです。
`generic-text`、`:` の後の `label` のテキスト、
メンバーの行の `member-name`、`parameters`、`return-type`、`annotation-name`、
`callback-arguments`、`style`、
`title-text`、`description-text`、`description-block-text`。

### 図と文

```text
diagram    = "header" newline statement ( newline statement )* newline? end-of-text
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
ほかのもので区切ることはできず、`class A; class B` は拒否されます
（[文の文脈](#文の文脈) を参照）。
[fixture: class/lex-semicolon] [fixture: class/gram-blank-lines]

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
`A - B --> C` は `A-B` からの関係を持ちます。
[fixture: class/gram-name-spaces] [fixture: class/gram-name-dash-spaces]
`.` は、前後に空白があっても名前の一部で、
名前を始めることも終えることもできません。
`class A . B` は `A.B` を宣言し、`class A.` と `class .A` は拒否されます。
[fixture: class/gram-name-dot-spaces] [fixture: class/gram-name-dot-end]
[fixture: class/gram-name-dot-start]
ジェネリクスの型は名前を終えます。
`class A~T~ B` は拒否されます。
[fixture: class/gram-name-after-generic]
語は数字で始まってかまいません。
`class 12ab` は `12ab` を宣言します。
[fixture: class/gram-name-digits]
そのため、クラスの名前と名前空間の名前は、次の 3 つの形のどれかです。
名前の部分、バッククォートの名前、
名前の部分とそれに続くバッククォートの名前です。
クラスの名前は、どの形でもジェネリクスの型で終わってかまいません
（[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L244-L258)）。
``class A.`b c` `` は `A.b c` を、``class A`b c` `` は `Ab c` を宣言します。
バッククォートの名前は名前を終えます。
``class `b c`A `` と、2 つのバッククォートの名前からなる名前は拒否されます。
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
`class A:::c {}` は拒否され、`class A:::c { }` は受理されます。
[fixture: class/gram-class-css-class-empty-body] [fixture:
class/gram-class-css-class-blank-body]

### メンバーと注釈

```text
member-statement     = class-name label?
annotation-statement = "<<" name-part ">>" class-name
annotation-line      = "<<" annotation-name? ">>"
method-line          = ignored-text? visibility? member-name? "(" parameters? ")" classifier? return-type? classifier? ignored-text?
attribute-line       = visibility? member-name? classifier?
```

ラベルのあるメンバーの文は、メンバーを加えます。
ラベルの `:` の後のテキストはメンバーの行で、
[メンバーの行](#メンバーの行) で述べるとおりに分けます。
それが空白だけのとき（`A : ` など）は、文はクラスを加え、メンバーを加えません。
ラベルがなければ、何も変えません。
`Foo` の行はクラスを宣言しません。
class 図には title の文がなく、
`title Animals` もそのような行で、クラスの名前 `titleAnimals` です。
[fixture: class/gram-member-statement] [fixture:
class/db-member-statement-blank] [fixture: class/gram-name-alone] [fixture:
class/gram-title-not-statement]
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

### 名前空間

```text
namespace-statement = "namespace" namespace-name class-label? "{" newline? namespace-item ( newline namespace-item )* newline? "}"
namespace-item      = class-statement | note-statement | namespace-statement
```

名前空間は、class の文、ノート、名前空間を、少なくとも 1 つ持ちます。
`namespace A {` の次の行に `}` があるものと、名前空間の中の関係は拒否されます。
[fixture: class/gram-namespace-empty] [fixture: class/gram-namespace-relation]

### ほかの文

```text
note-statement          = "note for" class-name string | "note" string
click-statement         = "callback" class-name string string-or-empty?
                        | "link" class-name string string-or-empty? "link-target"?
                        | "click" class-name "call" callback-name "(" callback-arguments? ")" string-or-empty?
                        | "click" class-name "href" string string-or-empty? "link-target"?
style-statement         = "style" word styles
class-def-statement     = "classDef" word ( "," word )* styles
css-class-statement     = "cssClass" string word
styles                  = style ( "," style )*
style                   = ( word | ":" | "#" | "%" | "style" | label )+
direction-statement     = "direction-text"? "direction" "direction-value" "direction-text"?
accessibility-statement = "accTitle" ":" title-text
                        | "accDescr" ":" description-text
                        | "accDescr" "{" description-block-text "}"
empty-description-block = "accDescr" "{" "}"
```

ノートのテキスト、リンクの URL、`callback` の関数名、`cssClass` の id は、
空でない文字列です。
クリックの文の 2 つ目の文字列、つまりツールチップは、空でもかまいません。
[fixture: class/gram-note-empty] [fixture: class/gram-link-url-empty]
[fixture: class/gram-callback-name-empty] [fixture:
class/gram-css-class-ids-empty] [fixture: class/gram-link-tooltip-empty]
`call` には、関数名の後に括弧が要ります。
`click A call fn` は拒否されます。
[fixture: class/lex-callback-name-unclosed]

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

mermaid.js は、文法が受理した後に、Db の中で次の入力を拒否します。
この仕様も拒否します。

- 存在しないクラスへの注釈の文。
  A を加える文より前の `<<interface>> A` は拒否されます
  （[`addAnnotation`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/classDb.ts#L263-L266)）。
  `class A` の後なら受理されます。
  [fixture: class/db-annotation-statement-undefined-class] [fixture:
  class/spec-class-diagram-280c04be]
- 分けられない方法の行。`x)` など（[メンバーの行](#メンバーの行) を参照）。

## Db の正規化

フロントマターの図のタイトルは、木から来ません。
Db の値を確かめる人は、それを mermaid.js 自身の関数で求めます
（[設定（参考）](../common.ja.md#設定参考) を参照）。
[fixture: class/docs-syntax-class-diagram-2f728b32]

### 要約

fixture は、mermaid.js の Db を、次の欄を持つ要約として記録します。
`@mmd-toolkit/tests` の
[`normalizeClass()`](../../../tests/src/normalizers/class.ts) が作ります。

| 欄           | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| `direction`  | 方向。方向の文が設定しなければ `TB`。                 |
| `title`      | フロントマターのタイトル。なければ空のテキスト。      |
| `accTitle`   | アクセシビリティのタイトル。なければ空のテキスト。    |
| `accDescr`   | アクセシビリティの説明。なければ空のテキスト。        |
| `classes`    | クラス。最初に加えられた順。                          |
| `relations`  | 関係。ソースの順。                                    |
| `notes`      | ノート。ソースの順。                                  |
| `namespaces` | 名前空間。最初に加えられた順。                        |
| `interfaces` | lollipop の関係が加えるインターフェース。ソースの順。 |

クラスは、`id`、`type`、`label`、`text`、いつも `classBox` の `shape`、
`cssClasses`、`methods`、`members`、`annotations`、`styles` と、
設定されていれば `parent`、`link`、`linkTarget`、`haveCallback`、
`tooltip` を持ちます。
方法は、`memberType`（`method`）、`visibility`、`classifier`、`id`、
`parameters`、`returnType` を持ちます。
属性は `members` にあり、`memberType`（`attribute`）、`visibility`、
`classifier`、`id` を持ちます。
関係は、`id1`、`id2`、`type1`、`type2`、`lineType` を持つ `relation`、
`relationTitle1`、`relationTitle2` と、ラベルがあれば `title` を持ちます。
ノートは、`id`、`text` と、設定されていれば `class` と `parent` を持ちます。
名前空間は、`id`、`label`、その `classes`、`notes`、`children` の id、
`explicit` と、あれば `parent` を持ちます。
インターフェースは、`id`、`label`、`classId` を持ちます。
要約は、描画だけが使うものを除きます。
DOM の id、メンバーの表示のテキスト、ノートの id の中の番号、
クラスの定義そのもの（それが変えるものはクラスの `styles` に表れます）、
クリックのコールバック、各スタイルの終わりの空白です。
テキストは、mermaid.js が HTML のサニタイズの前に持つとおりに記録します
（[サニタイザは無効にする](../../../tests/docs/expected-results.ja.md#サニタイザは無効にする)
を参照）。

### 木から要約を作る

文はソースの順に当て、名前空間の項目はその中の順に当てます。
各文は次のとおりです。

**名前。**
クラスの名前の**名前のテキスト**は、ジェネリクスの型の前にある単位のテキストを、
バッククォートの名前のバッククォートを除いてつないだものです。
単位の間の空白はその一部ではありません。
バッククォートの名前が閉じていなければ、そのテキストはテキストの終わりまで続き、
名前のテキストは改行で終わります。
字句解析器が最後の文字の後に読む改行です。
**書いた名前**は、名前のテキストに、
クラスの名前が `generic-text` の単位を持つとき、
`~`、その単位のテキスト（空白を含む）、`~` を続けたものです。
空白だけのジェネリクスの型は、木ではノードを持ちませんが
（[ClassName](../ast/class.ja.md#classname) を参照）、これも数えます。
そのため、`class A~ ~` は型が空白 1 つの A を、
`class A~ T ~` は型が空白、`T`、空白の A を宣言し、
`class A~~` は型のない A を宣言します。
[fixture: class/db-generic-blank] [fixture: class/db-generic-spaces]
書いた名前の **id** と**型**は、
`~` を持ち、その最初の `~` が最初の文字でないとき、最初の `~` の前のテキストと、
最初の `~` と 2 つ目の `~` の間（なければ終わりまで）のテキストです。
そうでなければ、id は書いた名前で、型は空です。
最初の `~` が最初の文字である ``class `~a~b` `` は、
型のない `~a~b` を宣言します。
[fixture: class/div-backquote-starts-with-tilde-and-type]
そのため、`class Map~K, V~` は型 `K, V` の `Map` を宣言し、
``class `a~b` `` は型 `b` の `a` を宣言します。
[fixture: class/db-generic-type] [fixture: class/db-backquoted-name-tilde]
[fixture: class/db-backquoted-name-unclosed]

**クラスを加える。**
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

- 注釈の行は、`<<` と `>>` の間のテキストを、空白を含めて `annotations` に。
  空か空白だけで、木では null のときも同じです。
  [fixture: class/db-member-annotation-spaces] [fixture:
  class/tokens-annotation-blank] [fixture: class/tokens-annotation-blank-label]
- 方法の行は `methods` に。
  `visibility` は可視性の記号か空のテキスト、
  `classifier` は分類子の記号か空のテキスト、`id` はメンバーの名前、
  `parameters` は、その単位のテキストか空のテキストです。
  `returnType` は、その単位のテキストか空のテキストで、
  分類子の記号が戻り値の型を終えるとき（[メンバーの行](#メンバーの行) の項目 5）は、
  その後に、単位とその記号の間の空白が続きます。
  `+getInstance() Foo $` の戻り値の型は `Foo` と空白 1 つで、
  `+foo(a) a b`、タブ、`*` の戻り値の型は `a b` とタブです。
  [fixture: class/db-method-return-type-space-before-classifier] [fixture:
  class/db-method-return-type-tab-before-classifier]
- 属性の行は、同じように `members` に。
  `parameters` と `returnType` は持ちません。
- 空白だけのメンバーの行は、何も加えません。

メンバーの名前は、`member-name` の単位のテキストか空のテキストで、
その**メンバーの名前のテキスト**が空白（U+0020）で始まるなら、
その前に空白が 1 つ付きます。
方法の行のメンバーの名前のテキストは、分けた区間かメンバーのテキストの、
分けて置いた可視性の記号の後、またはその始めから、開き括弧までのテキストです。
属性の行のメンバーの名前のテキストは、メンバーのテキストの、
可視性の記号またはその始めから、分類子の記号またはその終わりまでのテキストです。
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
（[文法の外での拒否](#文法の外での拒否) を参照）。

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
（[ClassRelationStatement](../ast/class.ja.md#classrelationstatement) を参照）、
空のタイトルを与えます。
`A --> B : ` のタイトルは空のテキストで、`A --> B` はタイトルを持ちません。
`:` の後に何もない `A --> B :` は拒否されます。
ラベルには `:` の後に 1 文字以上が要るからです。
[fixture: class/tokens-relation-label-blank] [fixture:
class/gram-relation-colon-only]
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
スタイルのテキストは、その単位のテキストを、間の空白を除いてつないだものです。
ラベルの中の空白は残ります。
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

## 既知の差

[known-divergences.ja.md](../known-divergences.ja.md) の次の差が、
class 図に当てはまり、
次のように表れます。

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.ja.md)。**
  キーワード、線、文字列、`:::` の中のディレクティブは、
  ここでは入力を拒否にし、mermaid.js はそれを受理します。
  `cla%%{init: {}}%%ss A`、`A -%%{init: {}}%%-> B`、
  `note "a%%{init: {}}%%b"`、`class A:%%{init: {}}%%::c` です
  （[単位の中のディレクティブ](#単位の中のディレクティブ) を参照）。
  [fixture: class/div-directive-in-keyword] [fixture:
  class/div-directive-in-line] [fixture: class/div-directive-in-string]
  [fixture: class/div-directive-in-triple-colon]
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
  空の呼び出し、文を始めない空の説明ブロックは、
  ここでは入力を拒否にします。
  mermaid.js はそれらにトークンを読まず、入力を受理します。
  `"" A --> B`、`class A""B`、`class A``B`、`class A~~B`、
  `A call () --> B`、`A accDescr {} --> B` です。
  多重度やツールチップの空の文字列は、どちらも受理します。
  クラスの名前の終わりの空のジェネリクスの型もそうで、
  `class A~~` は型のない A を宣言します。
  [fixture:
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
  `A --> B %% c` の次の行が `class C` のものは、
  mermaid.js は拒否し、この仕様は受理します。
  `A --> B %% c` の次の行が `A : +int age` だと、
  mermaid.js では A から `BA` への関係を持つ 1 つの文、
  この仕様では関係とメンバーです。
  `A --> %% c` の次の行が `B` だと、
  mermaid.js では A から B への関係、この仕様では拒否です。
  空白だけの行は mermaid.js が改行を取るのを止めるので、
  それがコメントの後にあれば、どちらも 2 つの文を読みます。
  ただし、`%%` の後に文字のあるコメント行がその行のすぐ後に来るときは別です。
  mermaid.js は、テキストを読む前に、そのようなコメント行を、
  すぐ前の空白だけの行と一緒に除き
  （[`cleanupComments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)）、
  次の行をまたつなぎます。
  `A --> B %% c`、空白の行、`%% x`、`A : +int age` は、
  mermaid.js では A から `BA` への関係です。
  `%% x` の代わりに行 `%%` があるときや、
  `%% x` の後にもう 1 つ空白の行があるときは、
  どちらも 2 つの文を読みます。
  [fixture: class/div-comment-then-spaces-line-then-comment-line] [fixture:
  class/lex-comment-then-spaces-line-then-bare-comment] [fixture:
  class/lex-comment-line-then-spaces-line]
  コメントだけの行は、どちらでも行として数えません
  （[文の文脈](#文の文脈) を参照）。
  [fixture: class/div-comment-on-header-line] [fixture:
  class/div-comment-joins-lines] [fixture:
  class/div-comment-before-statement-line] [fixture:
  class/div-comment-in-relation] [fixture: class/lex-comment-blank-line-after]
- **[`headerless-empty-ending`](../known-divergences/headerless-empty-ending.ja.md)。**
  最初の語が、`classDiagram` に ASCII の語の文字が続くもの
  （`classDiagramX` など）のテキストは、ヘッダーを持たず、ここでは拒否されます。
  mermaid.js は、テキストが、空のタイトル、説明、説明ブロック、`click A call`、
  `callback`、`link`、`click` の文の終わりで開いた文字列で終わるとき、
  それを受理します。
  `classDiagramX` の次の行が `accTitle:` のものがそうです。
  [fixture: class/div-headerless-empty-title] [fixture:
  class/div-headerless-empty-call] [fixture: class/div-headerless-empty-string]
  [fixture: class/div-headerless-repeated-header]
- **[`name-start-reads-unit`](../known-divergences/name-start-reads-unit.ja.md)。**
  `"`、（バッククォートでは）`~`、`<<` か `>>`、
  キーワード `cssClass`、`callback`、`link`、`click`、`note`、`href` の
  どれかで始まる、
  バッククォートの名前やジェネリクスの型のテキストは、ここでは名前や型です。
  mermaid.js は代わりにその単位を読みます
  （[文字列、バッククォートの名前、ジェネリクスの型](#文字列バッククォートの名前ジェネリクスの型)
  を参照）。
  ``class `note` `` は、ここではクラス `note` を宣言し、
  mermaid.js は拒否します。
  ``A `"1"` --> B`` は、ここでは `A"1"` からの関係、
  mermaid.js では多重度 `1` です。
  [fixture: class/div-backquote-keyword-escaped] [fixture:
  class/div-backquote-around-string]

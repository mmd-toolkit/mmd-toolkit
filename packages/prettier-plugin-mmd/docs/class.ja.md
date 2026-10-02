# class 図の整形規則

英語版: [class.md](./class.md)

prettier-plugin-mmd が class 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
変えると読み方が変わる箇所は書かれたまま残し、規則にその箇所を書きます。
flowchart と同じ規則はそう書き、理由は [flowchart.ja.md](./flowchart.ja.md) にあります。

各規則には、flowchart と同じく、
[`tests/fixtures/class/`](../tests/fixtures/class) の下に、
規則の見出しを名前にした例のフォルダーがあります。
各例は入力と整形した出力のファイルの組で、
テストは、プラグインがその出力を印字することと、
mermaid.js が入力と出力から同じ図を読むことの両方を確かめます。
この文書の例はそれらのファイルの写しで、テストが同じであることを確かめます。

## 規則

### 字下げ

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
namespace の `{` は、空白 1 つの後に、その名前の行に置きます。
namespace の文は、それを開く行より 1 段深く置き、
その `}` は、その行と同じ段に、行に単独で置きます。
namespace が 1 行に書かれていても同じです。
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。
入力に書かれた字下げは保ちません。
行頭の空白は、mermaid.js にとって何でもないからです。

入力 ([indentation/namespaces-input.mmd](../tests/fixtures/class/indentation/namespaces-input.mmd)):

```mmd
classDiagram
namespace Shapes {
class Triangle
    namespace Inner {
class Square
}
}
namespace One { class A }
```

出力 ([indentation/namespaces-output.mmd](../tests/fixtures/class/indentation/namespaces-output.mmd)):

```mmd
classDiagram
  namespace Shapes {
    class Triangle
    namespace Inner {
      class Square
    }
  }
  namespace One {
    class A
  }
```

### メンバーの本体

クラスのメンバーの本体の `{` は、空白 1 つの後に、クラスの行に残します。
メンバーの行は、それぞれ 1 段深く、行に単独で置きます。
`}` は、クラスと同じ段に、行に単独で置きます。
`class Duck { +swim() }` のように 1 行に書かれた本体も、そのように分けます。
mermaid.js は、メンバーの行を改行、`{`、`}` で終えるので、
同じメンバーを読みます。
括弧の間に空白しかない空の本体は、どう書かれていても、
クラスの行に `{ }` と印字します。
`{}`、`{   }`、2 行に分けた括弧は、どれもメンバーのないクラスを宣言します。
CSS クラスの後では、本体にメンバーの行が要り、空白だけの行もそれに数えるので、
`class C:::c {}` は拒否され、`class C:::c { }` は受理されます。
`{ }` は、どこでも成り立つ形です。
CSS クラスの後の、空白だけの行を中に持つ本体も `{ }` にします。
その例は `member-bodies/empty-whitespace-line-unified` で、
空白が行末にあるので、ここには載せません
（[フォルダー](../tests/fixtures/class/member-bodies)を参照）。
メンバーがなく、コメントかディレクティブを持つ本体は、それを残します。
1 行なら本体をクラスの行に残し、複数行なら本体として印字します。

入力 ([member-bodies/split-input.mmd](../tests/fixtures/class/member-bodies/split-input.mmd)):

```mmd
classDiagram
class Animal{
+int age
        +isMammal()
}
class Duck { +swim() }
class Fish {+name
+swim()}
```

出力 ([member-bodies/split-output.mmd](../tests/fixtures/class/member-bodies/split-output.mmd)):

```mmd
classDiagram
  class Animal {
    +int age
    +isMammal()
  }
  class Duck {
    +swim()
  }
  class Fish {
    +name
    +swim()
  }
```

入力 ([member-bodies/empty-unified-input.mmd](../tests/fixtures/class/member-bodies/empty-unified-input.mmd)):

```mmd
classDiagram
class A {}
class B {   }
class C:::c { }
class D {
}
class E {

}
class F { %%{init: {}}%% }
```

出力 ([member-bodies/empty-unified-output.mmd](../tests/fixtures/class/member-bodies/empty-unified-output.mmd)):

```mmd
classDiagram
  class A { }
  class B { }
  class C:::c { }
  class D { }
  class E { }
  class F { %%{init: {}}%% }
```

### 空行

flowchart と同じです。
空行の連続は 1 つにし、
namespace とメンバーの本体の先頭と末尾の空行は取り除きます。

入力 ([blank-lines/collapsed-input.mmd](../tests/fixtures/class/blank-lines/collapsed-input.mmd)):

```mmd
classDiagram


class A



class B {

+x


+y

}
```

出力 ([blank-lines/collapsed-output.mmd](../tests/fixtures/class/blank-lines/collapsed-output.mmd)):

```mmd
classDiagram
  class A

  class B {
    +x

    +y
  }
```

### トークンの間の空白

行の中で、2 つのトークンの間の空白とタブの連続は空白 1 つにし、
接しているトークンは接したまま残します。
flowchart と同じです。
クラス名の名前の部分の間も同じです。
`class Foo Bar` はクラス `FooBar` を宣言し、
書かれたとおり `class Foo Bar` と印字します。
部分をつなぐとキーワードになることがあるからです。
例えば `class no te` は `note` を宣言しますが、`class note` は拒否されます。
名前の後の注釈や CSS クラス、角括弧のラベル、
`note for`、`click`、`style`、`cssClass` の文の語の間も同じです。
クラス名だけの行は何も宣言しませんが、周りの文と同じ段に残します。

入力 ([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/class/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
classDiagram
class   Foo   Bar
class A  <<interface>>
class B["Label"]
class C:::highlight
note for   C   "a note"
click   C   href "https://example.com"  "tip"
style   C   fill:#f9f
cssClass  "A,B"  highlight
Foo   Bar
A - B --> C
```

出力 ([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/class/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
classDiagram
  class Foo Bar
  class A <<interface>>
  class B["Label"]
  class C:::highlight
  note for C "a note"
  click C href "https://example.com" "tip"
  style C fill:#f9f
  cssClass "A,B" highlight
  Foo Bar
  A - B --> C
```

### 矢印の前後の空白

関係の矢印の前後と、各カーディナリティの両側には、
mermaid.js のドキュメントの書き方のとおり、空白を 1 つずつ置きます。
`Customer"1"-->"*"Ticket` は `Customer "1" --> "*" Ticket` になります。
矢印の関係の端と線はそれぞれトークンで、間に空白を書けますが、
1 つの矢印として接した形で印字します。
`A <|  --  * B` は `A <|--* B` になります。

入力 ([arrow-spacing/spaced-input.mmd](../tests/fixtures/class/arrow-spacing/spaced-input.mmd)):

```mmd
classDiagram
Animal<|--Duck
Customer "1"-->"*" Ticket
A <|  --  * B
C..>D
```

出力 ([arrow-spacing/spaced-output.mmd](../tests/fixtures/class/arrow-spacing/spaced-output.mmd)):

```mmd
classDiagram
  Animal <|-- Duck
  Customer "1" --> "*" Ticket
  A <|--* B
  C ..> D
```

矢印は木が読むとおりに印字するので、
矢印が名前に接した関係を mermaid.js がどう読むかが、印字に見えます。
`o` は、後に語の文字が続かないときだけ関係の端です。
`A --oB` は端のないクラス `oB` への関係で、`A -- oB` と印字します。
`A --- B` の 3 つ目の `-` はクラス `-B` の名前の部分で、
`A -- - B` と印字します。

入力 ([arrow-spacing/read-as-written-input.mmd](../tests/fixtures/class/arrow-spacing/read-as-written-input.mmd)):

```mmd
classDiagram
A --o B
A --oB
A --- B
```

出力 ([arrow-spacing/read-as-written-output.mmd](../tests/fixtures/class/arrow-spacing/read-as-written-output.mmd)):

```mmd
classDiagram
  A --o B
  A -- oB
  A -- - B
```

### ラベル

関係やクラス名の後のラベルの `:` の両側には、
mermaid.js のドキュメントの書き方のとおり、空白を 1 つずつ置きます。
`A-->B:x` は `A --> B : x` に、`A:+int x` は `A : +int x` になります。
sequence 図では `:` を前のものに接して書きます
（[sequence.ja.md](./sequence.ja.md#コロン)を参照）。
どちらも、その図種のドキュメントの書き方に従っています。
`accTitle` と `accDescr` の後の `:` は、flowchart と同じく、
キーワードに接し、後に空白を 1 つ置きます。
ラベルのテキストは書かれたまま残します。

入力 ([labels/spaced-input.mmd](../tests/fixtures/class/labels/spaced-input.mmd)):

```mmd
classDiagram
A-->B:x
A --> B :x  y
A:+int x
A  :  -bar() int
```

出力 ([labels/spaced-output.mmd](../tests/fixtures/class/labels/spaced-output.mmd)):

```mmd
classDiagram
  A --> B : x
  A --> B : x  y
  A : +int x
  A : -bar() int
```

空白だけのラベルは、`:` の後の空白を残します。
`A --> B : ` は関係に空の題を与えますが、`A --> B` は題を与えません。
`A : ` はクラス A を足しますが、`A :` は拒否されます。
その例は、空白が行末にあるので、ここには載せません
（[フォルダー](../tests/fixtures/class/labels)の `labels/blank-kept` を参照）。

`;` を含む行では、ラベルの `:` の後に空白が書かれているかどうかを保ちます。
mermaid.js の行単位の規則は、テキスト `style` の後の `:` に、
空白のないテキストを経て `#` が続く行で、最後の `;` を無視します
（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
`styleA fill:#f00;` はクラス `styleAfill` にメンバー `#f00` を足し、
`:` の後に空白を入れると、`;` がメンバーの一部になります。

入力 ([labels/semicolon-line-kept-input.mmd](../tests/fixtures/class/labels/semicolon-line-kept-input.mmd)):

```mmd
classDiagram
styleA fill:#f00;
styleA fill: #f00;
```

出力 ([labels/semicolon-line-kept-output.mmd](../tests/fixtures/class/labels/semicolon-line-kept-output.mmd)):

```mmd
classDiagram
  styleA fill :#f00;
  styleA fill : #f00;
```

### メンバーの行

本体の中の、またはクラス名の `:` の後のメンバーの行は、
最初の文字から最後の文字まで書かれたまま残します。
mermaid.js はメンバーの行をそのテキストで部分に分け、
可視性の印の後の空白は名前の一部になるからです。
`+ foo()` の名前は空白の付いた ` foo` で、`+foo()` の名前は `foo` です。
注釈の行 `<< y z >>` は、テキストの周りの空白も Db に残ります。

入力 ([member-lines/kept-input.mmd](../tests/fixtures/class/member-lines/kept-input.mmd)):

```mmd
classDiagram
class A {
+ spaced  name
  +foo( a ,  b )   int$
<< y  z >>
}
A :  -  bar()
```

出力 ([member-lines/kept-output.mmd](../tests/fixtures/class/member-lines/kept-output.mmd)):

```mmd
classDiagram
  class A {
    + spaced  name
    +foo( a ,  b )   int$
    << y  z >>
  }
  A : -  bar()
```

### 総称型

総称型は、最初の `~` から 2 つ目の `~` まで書かれたまま残します。
その間の空白は Db の型の一部で、`List~ T ~` の型は `T` だからです。

入力 ([generic-types/kept-input.mmd](../tests/fixtures/class/generic-types/kept-input.mmd)):

```mmd
classDiagram
class Map~K, V~
class List~ T ~
Map~K, V~ --> List~ T ~
```

出力 ([generic-types/kept-output.mmd](../tests/fixtures/class/generic-types/kept-output.mmd)):

```mmd
classDiagram
  class Map~K, V~
  class List~ T ~
  Map~K, V~ --> List~ T ~
```

### コメント

行に単独のコメントは、周りの文、本体の中ではメンバーの行と同じ段に置き、
本文は書かれたまま残します。
文の後のコメントはその行に残し、
`%%` の前に空白が書かれているかどうかは、sequence 図と同じく保ちます。

入力 ([comments/kept-input.mmd](../tests/fixtures/class/comments/kept-input.mmd)):

```mmd
classDiagram
%% a comment line
class A
A --> B %% after a relation
A --> C%%touching
class B {
        %% in a body
+x
}
```

出力 ([comments/kept-output.mmd](../tests/fixtures/class/comments/kept-output.mmd)):

```mmd
classDiagram
  %% a comment line
  class A
  A --> B %% after a relation
  A --> C%%touching
  class B {
    %% in a body
    +x
  }
```

mermaid.js は、文の後のコメントの後の改行をコメントの一部として読み、
次の行をその文の一部として読みます。
ただし、間に空白だけの行があるときは別です。
これは既知の差 `comment-takes-line-break` です
（[compatibility.ja.md](./compatibility.ja.md#コメントの後の空白だけの行)を参照）。
そうした行は、空白 1 つの行として印字します。
空行にすると、mermaid.js が次の文をコメントのある文の一部として読むからです。
その例は、空白が行末にあるので、ここには載せません
（[フォルダー](../tests/fixtures/class/comments)の `comments/whitespace-line-kept` を参照）。

### ディレクティブ

flowchart と同じです。
行に単独のディレクティブは周りの文と同じ段に置き、
文の行にあるディレクティブは、両側に書かれた空白を保ちます。

入力 ([directives/kept-input.mmd](../tests/fixtures/class/directives/kept-input.mmd)):

```mmd
classDiagram
%%{init: {}}%%
class A {
%%{init: {}}%%
+x
}
class Fo%%{init: {}}%%o
```

出力 ([directives/kept-output.mmd](../tests/fixtures/class/directives/kept-output.mmd)):

```mmd
classDiagram
  %%{init: {}}%%
  class A {
    %%{init: {}}%%
    +x
  }
  class Fo%%{init: {}}%%o
```

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は、安全なときに Prettier の YAML 整形にかけます
（[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。

入力 ([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/class/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
classDiagram
class A
```

出力 ([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/class/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
classDiagram
  class A
```

### 複数行の値

flowchart と同じです。
`accDescr { ... }` のブロックの行は書かれたまま残し、
その `}` は文と同じ段に置きます。
複数行に書かれた文字列、バッククォートの名前、総称型も、書かれたまま残します。

入力 ([multi-line-values/kept-input.mmd](../tests/fixtures/class/multi-line-values/kept-input.mmd)):

```mmd
classDiagram
accDescr {
  one
    two
      }
note "line one
  line two"
class A~T,
  U~
```

出力 ([multi-line-values/kept-output.mmd](../tests/fixtures/class/multi-line-values/kept-output.mmd)):

```mmd
classDiagram
  accDescr {
  one
    two
  }
  note "line one
  line two"
  class A~T,
  U~
```

### 複数行の文

複数行に書かれた文は、1 行にまとめて印字します。
class 図では、改行は文を終えます。
ただし、`direction` の後では値が次の行にあってよく、
`accTitle` と `accDescr` の `:` の後ではテキストが次の行にあってよいので、
`direction`、改行、`LR` は `direction LR` と印字します。
コメントかディレクティブを含む複数行の文は、sequence 図と同じく、
始まりから終わりまで書かれたまま残します
（[複数行の文](./sequence.ja.md#複数行の文)を参照）。

入力 ([multi-line-statements/joined-input.mmd](../tests/fixtures/class/multi-line-statements/joined-input.mmd)):

```mmd
classDiagram
accTitle:
A title
direction
LR
```

出力 ([multi-line-statements/joined-output.mmd](../tests/fixtures/class/multi-line-statements/joined-output.mmd)):

```mmd
classDiagram
  accTitle: A title
  direction LR
```

入力 ([multi-line-statements/comment-inside-kept-input.mmd](../tests/fixtures/class/multi-line-statements/comment-inside-kept-input.mmd)):

```mmd
classDiagram
direction
%% c
LR
```

出力 ([multi-line-statements/comment-inside-kept-output.mmd](../tests/fixtures/class/multi-line-statements/comment-inside-kept-output.mmd)):

```mmd
classDiagram
  direction
%% c
LR
```

### 方向の行

`direction` と値のある行は、どこにあっても方向の行で、
mermaid.js は `direction` の前のテキストと値の後のテキストを読みません。
そのテキストは書かれたまま残します。
それと `direction` の間、`direction` と値の間の空白は空白 1 つにし、
値に接したテキストは接したまま残します。

入力 ([direction-lines/text-kept-input.mmd](../tests/fixtures/class/direction-lines/text-kept-input.mmd)):

```mmd
classDiagram
direction    LR
class A   direction RL
direction TBX
```

出力 ([direction-lines/text-kept-output.mmd](../tests/fixtures/class/direction-lines/text-kept-output.mmd)):

```mmd
classDiagram
  direction LR
  class A direction RL
  direction TBX
```

### 空の説明ブロック

空の説明ブロック `accDescr {}` は、同じ行に別の文が続くときだけ文になります。
`accDescr {} class A` は A を宣言し、行に単独の `accDescr {}` は拒否されます。
そうした行は、2 つの文を一緒に残します。

入力 ([empty-description-blocks/kept-with-statement-input.mmd](../tests/fixtures/class/empty-description-blocks/kept-with-statement-input.mmd)):

```mmd
classDiagram
accDescr {}   class A
```

出力 ([empty-description-blocks/kept-with-statement-output.mmd](../tests/fixtures/class/empty-description-blocks/kept-with-statement-output.mmd)):

```mmd
classDiagram
  accDescr {} class A
```

### 閉じていないバッククォートの名前

閉じていないバッククォートの名前はテキストの終わりまで続き、
mermaid.js はテキストの終わりの空白と改行もその一部として読みます。
その名前はテキストの終わりまで書かれたまま印字し、後に改行を足しません。
その例は、行末にあるものが要点なので、ここには載せません
（[フォルダー](../tests/fixtures/class/unclosed-backquoted-names)を参照）。

## 書かれたまま残すもの

次のテキストは常に書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキスト。文字列、バッククォートの名前、ラベルのテキスト、スタイル、
  `accTitle` と `accDescr` のテキスト。
- メンバーの行と、`~` から `~` までの総称型。
- 空白だけのラベルの `:` の後の空白と、
  `;` を含む行のラベルの `:` の後に空白があるかどうか。
- 文の後のコメントの `%%` の前に空白があるかどうかと、
  そうしたコメントの後の空白だけの行。後者は空白 1 つにする。
- 方向の行の、`direction` の前と値の後のテキスト。
- コメントかディレクティブを含む複数行の文。
- 閉じていないバッククォートの名前。テキストの終わりまで。
- ヘッダーの綴り。`classDiagram` か `classDiagram-v2`。

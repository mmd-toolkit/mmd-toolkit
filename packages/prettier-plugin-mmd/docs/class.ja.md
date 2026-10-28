# class 図の整形規則

英語版: [class.md](./class.md)

prettier-plugin-mmd が class 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
flowchart と同じ規則はそう書き、
理由は [flowchart の整形規則](./flowchart.ja.md) にあります。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### 字下げ

ヘッダーの後の文は、
ヘッダーより 1 段深く置きます。 [fixture: indentation/written-indentation-dropped]
[fixture: indentation/header-v2-kept]
namespace の `{` は、空白 1 つの後に、その名前の行に置きます。
namespace の文は、それを開く行より 1 段深く置き、その `}` は、その行と同じ段に、
行に単独で置きます。
`{` の前の空白 1 つは、メンバーの本体の `{` と同じで、
mermaid.js の文書の書き方でもあります。
namespace が 1 行に書かれていても同じです。 [fixture: indentation/namespaces]
[fixture: indentation/namespace-brace-after-one-space]
[fixture: indentation/namespace-closing-brace-own-line]
[fixture: member-bodies/in-namespace-indented]
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。 [fixture: indentation/namespaces]
[fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
入力の字下げは、構造に応じた字下げに置き換えます。
本文の字下げは、`tabWidth: 0` でも最低 1 文字にします。
`[*]` のようなメンバー行は、字下げがあれば属性ですが、
列 0 では mermaid.js とパーサーが拒否するからです。
そのため、
幅 0 では `"class Zero {\n  [*]\n}"` を `" class Zero {\n  [*]\n }"` と印字します。
`useTabs` は 1 段にタブ 1 つを使います。 [fixture: indentation/member-edge-state-zero-width]
[fixture: indentation/member-edge-state-zero-width-tabs]
[corpus fixture: class/lex-member-edge-state-indented]
桁で読みが変わる [flowchart](./flowchart.ja.md#字下げ) と同じ、
共有の下限を使います。 [fixture: indentation/namespaces]
[fixture: indentation/written-indentation-dropped]

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
`{` の前の空白 1 つは、mermaid.js の文書の書き方です。
ただし、行の `}` の前にディレクティブがあるときは、
書かれたまま残します（`%%{init: {}}%% }`）。 [fixture: member-bodies/directive-on-closing-brace-line-kept]
[fixture: member-bodies/split]
[fixture: member-bodies/opening-brace-after-one-space]
[fixture: member-bodies/in-namespace-indented]
`class Duck { +swim() }` のように 1 行に書かれた本体も、そのように分けます。
mermaid.js は、メンバーの行を改行、`{`、`}` で終えるので、
同じメンバーを読みます。 [fixture: member-bodies/split]
[corpus fixture: class/lex-member-body-one-line]
[corpus fixture: class/lex-member-body-close-on-member-line]
括弧の間に空白しかない空の本体は、どう書かれていても、
クラスの行に `{ }` と印字します。
`{}`、`{   }`、2 行に分けた括弧は、
どれもメンバーのないクラスを宣言します。 [fixture: member-bodies/empty-unified]
[fixture: member-bodies/empty-other-forms-unified]
[fixture: member-bodies/in-namespace-indented]
CSS クラスの後では、本体にメンバーの行が要り、空白だけの行もそれに数えるので、
`class C:::c {}` は拒否され、`class C:::c { }` は受理されます。
`{ }` は、どこでも成り立つ形です。 [fixture: member-bodies/empty-unified]
[corpus fixture: class/gram-class-css-class-empty-body]
[corpus fixture: class/gram-class-css-class-blank-body]
CSS クラスの後の、空白だけの行を中に持つ本体も `{ }` にします。
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"classDiagram\nclass E:::c {\n  \n\n}\n"` は `"classDiagram\n  class E:::c { }\n"` と印字します（fixture
`empty-whitespace-line-unified` は、
[フォルダー](../tests/fixtures/class/member-bodies)にあります）。 [fixture: member-bodies/empty-whitespace-line-unified]
メンバーがなく、ディレクティブを持つ本体は、それを残します。
1 行なら本体をクラスの行に残します。
コメントは単独の行に置くもので（`{` の行の `%%` はメンバーです）、
コメントだけの本体は複数行に書かれ、本体として印字します。
ディレクティブだけで複数行に書かれた本体も、
本体として印字します。 [fixture: member-bodies/empty-unified]
[fixture: member-bodies/comment-only-over-lines-kept]
[fixture: member-bodies/directive-only-over-lines-kept]
[fixture: member-bodies/percent-member-kept]
[corpus fixture: class/lex-member-percent]

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
namespace とメンバーの本体の先頭と末尾の空行は取り除きます。 [fixture: blank-lines/collapsed]
[fixture: blank-lines/namespace-edges-dropped]
[fixture: blank-lines/edges-around-comment-and-directive-lines-dropped]
[fixture: blank-lines/around-comment-and-directive-lines-collapsed]
[fixture: blank-lines/end-of-text-dropped]
[fixture: multi-line-statements/empty-line-inside-joined]
[fixture: empty-description-blocks/followed-by-empty-lines-collapsed]

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
flowchart と同じです。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: generic-types/whitespace-before-collapsed-inside-kept]
クラス名の名前の部分の間も同じです。
`class Foo Bar` はクラス `FooBar` を宣言し、
書かれたとおり `class Foo Bar` と印字します。
部分をつなぐとキーワードになることがあるからです。
例えば `class no te` は `note` を宣言しますが、
`class note` は拒否されます。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/name-parts-keyword-kept]
名前の後の注釈や CSS クラス、角括弧のラベル、 `note for`、`click`、`style`、
`cssClass` の文の語の間も同じです。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/after-name-collapsed]
[fixture: whitespace-between-tokens/words-collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]
クラス名だけの行は何も宣言しませんが、
周りの文と同じ段に残します。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]

クラスの本体や namespace を閉じる `}` の後の U+2028 と U+2029 は、
mermaid.js にとって空白なので、
行末の空白と一緒に落とします。 [test: U+2029 after the `}` of a class body]
[test: U+2028 after the `}` of a namespace]

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

`call` の後の関数名と、その後の `(` の間の空白は、括弧と引数と一緒に、
書かれたまま残します。
mermaid.js は、名前を `(` の前まで、空白も含めて読むので、
`click A call fn  ()` は、`fn` と 2 つの空白を名前とする関数を呼びます。
そこにある改行も残り、
文は 2 行のままです。 [fixture: whitespace-between-tokens/callback-name-kept]
[fixture: whitespace-between-tokens/callback-name-tab-kept]
[fixture: whitespace-between-tokens/callback-name-directive-kept]
[fixture: whitespace-between-tokens/callback-name-comment-line-kept]
[corpus fixture: class/lex-callback-name-multi-line]

入力 ([whitespace-between-tokens/callback-name-kept-input.mmd](../tests/fixtures/class/whitespace-between-tokens/callback-name-kept-input.mmd)):

```mmd
classDiagram
class A
class B
click A call fn  ( x )
click B call gn
(y)
click B call hn   ()
```

出力 ([whitespace-between-tokens/callback-name-kept-output.mmd](../tests/fixtures/class/whitespace-between-tokens/callback-name-kept-output.mmd)):

```mmd
classDiagram
  class A
  class B
  click A call fn  ( x )
  click B call gn
(y)
  click B call hn   ()
```

### 矢印の前後の空白

関係の矢印の前後と、各多重度の両側には、
mermaid.js のドキュメントの書き方のとおり、空白を 1 つずつ置きます。
`Customer"1"-->"*"Ticket` は `Customer "1" --> "*" Ticket` になります。 [fixture: arrow-spacing/spaced]
[fixture: arrow-spacing/cardinality-on-one-side]
[fixture: arrow-spacing/whitespace-runs-collapsed]
矢印の関係の端と線はそれぞれトークンで、間に空白を書けますが、
1 つの矢印として接した形で印字します。
`A <|  --  * B` は `A <|--* B` になります。 [fixture: arrow-spacing/spaced]
[fixture: arrow-spacing/end-or-line-apart-joined]
[fixture: arrow-spacing/directive-between-arrow-tokens-kept]

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

出力を見ると、mermaid.js が名前に接した矢印をどう解釈するか分かります。
`o` は、後に語の文字が続かないときだけ関係の端です。
`A --oB` は、矢印の終端記号を持たない、クラス `oB` への関係として扱われ、
`A -- oB` と出力します。
`A --- B` の 3 つ目の `-` はクラス `-B` の名前の部分で、
`A -- - B` と印字します。 [fixture: arrow-spacing/read-as-written]

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

`call` の後に空白が続くとキーワードになり、字句解析は、
単位が始まる位置でそれを読みます（仕様の[文の文脈](../../spec/docs/diagrams/class.ja.md#文の文脈)の規則 10）。
そのため、単語 `call` で終わる名前に接した矢印とラベルの `:` は、
接したまま残します。
前に空白を置くと、`A call()--> B` はクラス A のコールバックに、
`call-->C` はコールバックの始まりになるからです。 [fixture: arrow-spacing/touching-call-kept]
[fixture: arrow-spacing/touching-call-colon-kept]
[corpus fixture: class/lex-call-prefix]

入力 ([arrow-spacing/touching-call-kept-input.mmd](../tests/fixtures/class/arrow-spacing/touching-call-kept-input.mmd)):

```mmd
classDiagram
A call()--> B
call-->C
D call--|>E
```

出力 ([arrow-spacing/touching-call-kept-output.mmd](../tests/fixtures/class/arrow-spacing/touching-call-kept-output.mmd)):

```mmd
classDiagram
  A call()--> B
  call--> C
  D call--|> E
```

### ラベル

関係やクラス名の後のラベルの `:` の両側には、
mermaid.js のドキュメントの書き方のとおり、空白を 1 つずつ置きます。
`A-->B:x` は `A --> B : x` に、
`A:+int x` は `A : +int x` になります。 [fixture: labels/spaced]
[fixture: labels/directive-around-colon-kept]
sequence 図では `:` を前のものに接して書きます（[sequence 図の整形規則のコロン](./sequence.ja.md#コロン)を参照）。
どちらも、その図種のドキュメントの書き方に従っています。
`accTitle` と `accDescr` の後の `:` は、他の図種と mermaid.js の文書と同じく、
キーワードに接し、
後に空白を 1 つ置きます。 [fixture: labels/accessibility-text-kept]
[fixture: multi-line-statements/joined]
[fixture: multi-line-statements/acc-descr-joined]
ラベルのテキストは書かれたまま残します。 [fixture: labels/spaced]
[fixture: labels/accessibility-text-kept]

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
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"classDiagram\nA --> B : \nA :  \n"` は `"classDiagram\n  A --> B : \n  A :  \n"` と印字します（fixture
`blank-kept` は [フォルダー](../tests/fixtures/class/labels) にあります）。 [fixture: labels/blank-kept]
[fixture: labels/blank-tab-kept]

`;` を含む行では、ラベルの `:` の後に空白が書かれているかどうかを保ちます。
mermaid.js の行単位の規則は、テキスト `style` の後の `:` に、
空白のないテキストを経て `#` が続く行で、
最後の `;` を無視します（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
`styleA fill:#f00;` はクラス `styleAfill` にメンバー `#f00` を足し、
`:` の後に空白を入れると、
`;` がメンバーの一部になります。 [fixture: labels/semicolon-line-kept]
[fixture: labels/semicolon-line-with-directive-kept]
[fixture: directives/ignored-semicolon-next-to-another-kept]

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
最初の文字から最後の文字まで書かれたまま残します。 [fixture: member-lines/kept]
[fixture: member-lines/percent-text-kept]
[fixture: member-lines/trailing-whitespace-dropped]
[fixture: member-lines/directive-inside-kept]
[corpus fixture: class/lex-member-percent]
mermaid.js はメンバーの行をそのテキストで部分に分け、
可視性の印の後の空白は名前の一部になるからです。
`+ foo()` の名前は空白の付いた ` foo` で、
`+foo()` の名前は `foo` です。 [fixture: member-lines/kept]
[corpus fixture: class/gram-member-visibility-whitespace-body-0184dca2]
注釈の行 `<< y z >>` は、
テキストの周りの空白も Db に残ります。 [fixture: member-lines/kept]

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

### ジェネリック型

ジェネリック型は、最初の `~` から 2 つ目の `~` まで書かれたまま残します。
その間の空白は Db の型の一部で、 `List~ T ~` の型は、
`T` の両側に空白がある `" T "` だからです（文字列として書いています）。 [fixture: generic-types/kept]
[fixture: generic-types/class-with-body-kept]
[fixture: generic-types/in-member-and-note-kept]
[fixture: generic-types/directive-inside-kept]
[fixture: generic-types/whitespace-before-collapsed-inside-kept]
[fixture: generic-types/empty-kept]

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
本文は書かれたまま残します。 [fixture: comments/kept]
[fixture: comments/before-header]
[fixture: comments/in-namespace] [fixture: comments/last-in-body]
[fixture: comments/text-kept]
[fixture: member-bodies/comment-only-over-lines-kept]
文の後のコメントはその行に残し、 `%%` の前に空白が書かれているかどうかは、
sequence 図と同じく保ちます。 [fixture: comments/kept]
[fixture: comments/whitespace-run-before-collapsed]
[fixture: comments/after-header-touching-kept]
[fixture: comments/after-last-statement-without-line-break]

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
これは既知の差異 `comment-takes-line-break` です（ [互換性の、コメントの後の空白だけの行](./compatibility.ja.md#コメントの後の空白だけの行) を参照）。
そうした行は、空白 1 つの行として印字します。
空行にすると、mermaid.js が次の文をコメントのある文の一部として読むからです。
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"classDiagram\nA --> B %% c\n  \nA : +int age\n"` は `"classDiagram\n  A --> B %% c\n \n  A : +int age\n"` と印字します（fixture
`whitespace-line-kept` は [フォルダー](../tests/fixtures/class/comments) にあります）。
ヘッダーと文を持つ行のコメントの後も同じです。
例は `classDiagram accDescr {} %% c` で、
その fixture は `comments/whitespace-line-after-header-comment-kept` です。 [fixture: comments/whitespace-line-kept]
[fixture: comments/whitespace-line-after-header-comment-kept]
[fixture: comments/whitespace-line-after-empty-line-kept]
[fixture: comments/whitespace-line-after-comment-line-kept]
[fixture: comments/whitespace-line-after-directive-line-kept]
[fixture: comments/whitespace-line-before-comment-line-kept]
[fixture: comments/whitespace-lines-run-kept-as-one]
[fixture: comments/whitespace-line-at-end-of-text-dropped]
[fixture: comments/empty-line-after-comment-kept]

### ディレクティブ

flowchart と同じです。
行に単独のディレクティブは周りの文と同じ段に置き、文の行にあるディレクティブは、
両側に空白が書かれているかどうかを保ちます。
書かれていればそこに空白 1 つを置き、
トークンに接していれば接したまま残します。 [fixture: directives/kept]
[fixture: directives/before-header]
[fixture: directives/in-namespace]
[fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides-collapsed]
[fixture: directives/whitespace-before-collapsed-at-end]
[fixture: directives/touching-one-side-kept]
[fixture: directives/after-braces-on-same-line]
[fixture: member-bodies/directive-only-over-lines-kept]
[fixture: arrow-spacing/directive-between-arrow-tokens-kept]

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

`%%` だけの行や、ディレクティブではないのに `%%{` で始まる行は、
文の間にあっても受理されますが、
その後の空白だけの行はそれだけで 1 つの単位になり、
入力は拒否されます（[コメント](#コメント)を参照）。
そのような行の後、またはそのような行と、
mermaid.js が取り除くコメント行の後のディレクティブだけの行は、字下げせず、
書かれたまま残します。 [fixture: directives/bare-marker]
[fixture: directives/bare-marker-then-comment-line]
[fixture: directives/bare-marker-then-comment-lines-and-directives]
[fixture: directives/bare-marker-several-directive-lines-unindented]
[fixture: directives/bare-marker-then-empty-line]
[fixture: directives/bare-marker-with-braces]
[fixture: directives/bare-marker-at-end-of-text]
[corpus fixture: class/lex-bare-percent-line-between-statements]
ディレクティブは空白ではないので、 mermaid.js にとって、
その行は空白だけの行ではありませんが、字下げすると空白だけの行になります。
行送りを取るコメントの後では、空白だけの行が、
コメントが取るものを終わらせます（[コメント](#コメント)を参照）。
そこにあるディレクティブだけの行は、書かれた字下げのまま残し、
本文の終わりでも同じです。
別の字下げにすると、ディレクティブが残す空白だけの行が、できたり、
なくなったりするからです。 [fixture: directives/after-comment]
[fixture: directives/after-comment-indentation-kept]
[fixture: directives/after-comment-at-end-of-text-kept]

入力 ([directives/bare-marker-input.mmd](../tests/fixtures/class/directives/bare-marker-input.mmd)):

```mmd
classDiagram
A
%%
%%{init: {}}%%
class C
```

出力 ([directives/bare-marker-output.mmd](../tests/fixtures/class/directives/bare-marker-output.mmd)):

```mmd
classDiagram
  A
  %%
%%{init: {}}%%
  class C
```

入力 ([directives/after-comment-input.mmd](../tests/fixtures/class/directives/after-comment-input.mmd)):

```mmd
classDiagram
A --> B %% c
%%{init: {}}%%
A : +int age
```

出力 ([directives/after-comment-output.mmd](../tests/fixtures/class/directives/after-comment-output.mmd)):

```mmd
classDiagram
  A --> B %% c
%%{init: {}}%%
  A : +int age
```

`;` を落とすと、行の規則が無視する `;` が変わる行は、書かれたまま印字します。
語の引数で終わるディレクティブの後の `;`（`%%{wrap foo;`）、
別の `;` に接する無視される `;` がある行です（詳しくは、
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。 [fixture: directives/semicolon-after-word-argument-directive-kept]
[fixture: directives/ignored-semicolon-next-to-another-kept]
自由なテキストの引数を持つ閉じていないディレクティブはテキストの終わりまで続き、
その後の `;` はその一部です。
それが連れていく行は、
書かれたまま印字します。 [fixture: directives/semicolon-after-unclosed-directive-kept]
[fixture: directives/semicolon-on-next-line-after-unclosed-directive-kept]

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は、
安全なときに Prettier の YAML 整形にかけます（詳しくは、
[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。 [fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/indented-delimiters-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/html-tag-kept]
[fixture: frontmatter-yaml/less-than-before-other-formatted]
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

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
サブグラフの外では、その行の桁は Db に入らないので、残すのは選択で、
理由は flowchart にあります（[複数行の値](./flowchart.ja.md#複数行の値)を参照）。
複数行に書かれた文字列、バッククォートの名前、ジェネリック型も、
書かれたまま残します。 [fixture: multi-line-values/kept]
[fixture: multi-line-values/block-text-on-opening-line-spaced]
[fixture: multi-line-values/block-comment-line-kept]
[fixture: multi-line-values/block-empty-line-kept]
[fixture: multi-line-values/backquoted-name-kept]
[fixture: multi-line-values/label-string-kept]
[fixture: multi-line-values/generic-in-relation-kept]

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

通常の複数行の文は、1行にまとめて印字します。
class 図では、改行は文を終えます。
ただし、`direction` の後では値が次の行にあってよく、
`accTitle` と `accDescr` の `:` の後ではテキストが次の行にあってよいので、
`direction`、改行、
`LR` は `direction LR` と印字します。 [fixture: multi-line-statements/joined]
[fixture: multi-line-statements/acc-descr-joined]
[fixture: multi-line-statements/empty-line-inside-joined]
[corpus fixture: class/lex-direction-line-value-next-line]
コメントかディレクティブを含む複数行の文は、sequence 図と同じく、
始まりから終わりまで、
書かれたまま残します（[複数行の文](./sequence.ja.md#複数行の文)を参照）。 [fixture: multi-line-statements/comment-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/comment-inside-title-kept]

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

`accTitle:`と`accDescr:`の次行の値は、結合で貪欲な方向行の規則が現れる場合、
改行を保ちます。
小文字の`direction`、空白、大文字のTB・BT・LR・RLの並びで、
長い文字列の一部でも同じです。
従来の複数行の配置で値を語より1段深く置き、
値が方向文として読まれるのを防ぎます。 [fixture: multi-line-statements/title-next-direction-tb]
[fixture: multi-line-statements/title-next-direction-bt]
[fixture: multi-line-statements/title-next-direction-lr]
[fixture: multi-line-statements/title-next-direction-rl]
[fixture: multi-line-statements/description-next-direction-tb]
[fixture: multi-line-statements/description-next-direction-bt]
[fixture: multi-line-statements/description-next-direction-lr]
[fixture: multi-line-statements/description-next-direction-rl]
[fixture: multi-line-statements/direction-value-with-prefix]
TDとほかの大小文字はその方向行の規則ではないので、
通常の次行の値をつなぎます。 [fixture: multi-line-statements/title-next-direction-td]
[fixture: multi-line-statements/description-next-direction-td]
[fixture: multi-line-statements/lower-case-direction-value]
`tabWidth: 0`と`useTabs`でも設定の継続幅を使い、
CRも正規化後に同じ判断をします。 [fixture: multi-line-statements/direction-value-zero-width]
[fixture: multi-line-statements/direction-value-tabs]
[test: accessibility revisions: class direction-value-cr]

入力（エスケープ表記）:
`"classDiagram\nclass A11y\naccTitle:\n direction LR"`。

出力 ([multi-line-statements/title-next-direction-lr-output.mmd](../tests/fixtures/class/multi-line-statements/title-next-direction-lr-output.mmd)):

```mmd
classDiagram
  class A11y
  accTitle:
    direction LR
```

### 方向の行

`direction` と値のある行は、
文の文脈が読む所では方向の行で（その文脈の最初の規則で、
どの行の始まりでも試されます）、
メンバーの本体の中では `direction LR` はメンバーの行で、
namespace の本体の中では拒否されます。
mermaid.js は `direction` の前のテキストと値の後のテキストを読みません。
そのテキストは書かれたまま残します。
それと `direction` の間、`direction` と値の間の空白は空白 1 つにし、
値に接したテキストは接したまま残します。 [fixture: direction-lines/text-kept]
[fixture: direction-lines/text-after-value-separated]
[fixture: direction-lines/text-before-touching-kept]
[fixture: direction-lines/text-before-collapsed]
[fixture: direction-lines/in-namespace]
[fixture: direction-lines/values-and-tabs]
[fixture: direction-lines/directive-around-value-kept]
[fixture: direction-lines/comment-after-value-kept]
[corpus fixture: class/lex-direction-in-namespace]
[corpus fixture: class/lex-direction-in-member-body]

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

内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
接した keyword は接したまま、
`accDescr{  }` は `accDescr{}` にします。 [fixture: empty-description-blocks/empty-whitespace-interiors]
[test: class Unicode and tab interiors]
コメントや directive があるブロックの配置は従来どおり保ちます。

空の説明ブロック `accDescr {}` は、同じ行の別の文やヘッダーと並ぶとき、
その前でも後でも、文になります。
`accDescr {} class A` は A を宣言し、
`classDiagram accDescr {}` や `note for A "x" accDescr {}` も受理されますが、
行に単独の `accDescr {}` は、mermaid.js と同じく拒否されます。
そうした行は、文を一緒に残します。
その行に本体を持つクラスは、ほかのクラスと同じように印字し、
メンバーは 1 段深く、
`}` はその行と同じ段に置きます。 [fixture: empty-description-blocks/before-class-with-body-indented]
[fixture: empty-description-blocks/kept-with-statement]
[fixture: empty-description-blocks/after-statement]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/two-blocks-kept]
[fixture: empty-description-blocks/directive-between-kept]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/followed-by-empty-lines-collapsed]
[corpus fixture: class/gram-empty-description-block-alone]
[corpus fixture: class/header-empty-description-block-then-statement]

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

入力 ([empty-description-blocks/after-statement-input.mmd](../tests/fixtures/class/empty-description-blocks/after-statement-input.mmd)):

```mmd
classDiagram accDescr {}
class A
note for A "x"   accDescr {}
```

出力 ([empty-description-blocks/after-statement-output.mmd](../tests/fixtures/class/empty-description-blocks/after-statement-output.mmd)):

```mmd
classDiagram accDescr {}
  class A
  note for A "x" accDescr {}
```

複数行に書かれたブロックは、その後に続く文を、閉じ波括弧の隣に残します。
空白だけのブロックは 1 行に結合し、コメントを含むブロックは改行を保ちます。
`accDescr`、改行、`{} class A` はクラス A を宣言しますが、
`class A` を独立した行に置くと、ブロックが単独になり、
入力が拒否されるからです。 [fixture: empty-description-blocks/over-lines-joined]
[fixture: empty-description-blocks/over-lines-empty-line-joined]
[fixture: empty-description-blocks/over-lines-comment-line-kept]

入力 ([empty-description-blocks/over-lines-joined-input.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-joined-input.mmd)):

```mmd
classDiagram
accDescr
{} class A
accDescr {
} class B
```

出力 ([empty-description-blocks/over-lines-joined-output.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-joined-output.mmd)):

```mmd
classDiagram
  accDescr {} class A
  accDescr {} class B
```

### 閉じていないバッククォートの名前

閉じていないバッククォートの名前はテキストの終わりまで続き、
mermaid.js はテキストの終わりの空白と改行もその一部として読みます。
その名前はテキストの終わりまで書かれたまま印字し、後に改行を足しません。
要点は行末にあるものなので、例は、`\n` を改行とする文字列で書きます。
``"classDiagram\nclass A\nclass `x y  \n\n"`` は ``"classDiagram\n  class A\n  class `x y  \n\n"`` と印字し、
`y` の後の 2 つの空白と改行は残ります（fixture
`kept` は [フォルダー](../tests/fixtures/class/unclosed-backquoted-names)にあります）。 [fixture: unclosed-backquoted-names/kept]
[fixture: unclosed-backquoted-names/at-end-of-text-kept]
[fixture: unclosed-backquoted-names/over-lines-kept]
[fixture: unclosed-backquoted-names/in-relation-kept]

## 書かれたまま残すもの

次のテキストは常に書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキスト。
  文字列、バッククォートの名前、ラベルのテキスト、スタイル、
  `accTitle` と `accDescr` のテキスト。 [fixture: whitespace-between-tokens/style-values-kept]
  [fixture: labels/accessibility-text-kept]
- メンバーの行と、`~` から `~` までのジェネリック型。
- 空白だけのラベルの `:` の後の空白と、
  `;` を含む行のラベルの `:` の後に空白があるかどうか。
- 文の後のコメントの後の空白だけの行。
  空白 1 つにする。
- 方向の行の、`direction` の前と値の後のテキスト。
- コメントかディレクティブを含む複数行の文。
- 閉じていないバッククォートの名前。
  テキストの終わりまで。
- ヘッダーの綴り。
  `classDiagram` か `classDiagram-v2`。 [fixture: indentation/header-v2-kept]

次のものは、どちらの形でも Db が同じなので、選択として書かれたまま残します。
文の後のコメントの印の前に空白が書かれているかどうかは、
既知の差異（`comment-takes-character`、`percent-brace-after-unit`）の場所では、
mermaid.js がコメントを、接するものによって読むからです。
場所の一覧よりも、1 つの規則のほうが単純です。

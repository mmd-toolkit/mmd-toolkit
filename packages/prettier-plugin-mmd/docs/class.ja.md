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

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
[fixture: indentation/written-indentation-dropped]
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
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]
入力の字下げは、構造に応じた字下げに置き換えます。
本文の字下げは、`tabWidth: 0` でも最低 1 文字にします。
`[*]` のようなメンバー行は、字下げがあれば属性ですが、
列 0 では mermaid.js とパーサーが拒否するからです。
そのため、
幅 0 では `"class Zero {\n  [*]\n}"` を `" class Zero {\n  [*]\n }"`
と印字します。
`useTabs` は 1 段にタブ 1 つを使います。
[fixture: indentation/member-edge-state-zero-width]
[fixture: indentation/member-edge-state-zero-width-tabs]
[corpus fixture: class/lex-member-edge-state-indented]
桁で読みが変わる [flowchart](./flowchart.ja.md#字下げ) と同じ、
共有の下限を使います。 [fixture: indentation/namespaces]
[fixture: indentation/written-indentation-dropped]

namespace またはメンバー本体を開く行を、
U+2028 または U+2029 の後のコメント領域が分ける場合は、
書かれた行と空白を保ちます。
mermaid.js が、除いたコメントの前後の文字を結合するためです。
[test: class: ls-comment-in-namespace-opening]
[test: class: ps-comment-in-member-opening]

入力
([indentation/namespaces-input.mmd](../tests/fixtures/class/indentation/namespaces-input.mmd)):

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

出力
([indentation/namespaces-output.mmd](../tests/fixtures/class/indentation/namespaces-output.mmd)):

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
書かれたまま残します（`%%{init: {}}%% }`）。
[fixture: member-bodies/directive-on-closing-brace-line-kept]
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
`{}`、`{   }`、2 行に分けた括弧は、どれもメンバーのないクラスを宣言します。
[fixture: member-bodies/empty-unified]
[fixture: member-bodies/empty-other-forms-unified]
[fixture: member-bodies/in-namespace-indented]
CSS クラスの後では、本体にメンバーの行が要り、空白だけの行もそれに数えるので、
`class C:::c {}` は拒否され、`class C:::c { }` は受理されます。
`{ }` は、どこでも成り立つ形です。 [fixture: member-bodies/empty-unified]
[corpus fixture: class/gram-class-css-class-empty-body]
[corpus fixture: class/gram-class-css-class-blank-body]
CSS クラスの後の、空白だけの行を中に持つ本体も `{ }` にします。
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"classDiagram\nclass E:::c {\n  \n\n}\n"` は
`"classDiagram\n  class E:::c { }\n"` と印字します（fixture
`empty-whitespace-line-unified` は、
[フォルダー](../tests/fixtures/class/member-bodies)にあります）。
[fixture: member-bodies/empty-whitespace-line-unified]
メンバーがなく、ディレクティブを持つ本体は、それを残します。
1 行なら本体をクラスの行に残します。
コメントは単独の行に置くもので（`{` の行の `%%` はメンバーです）、
コメントだけの本体は複数行に書かれ、本体として印字します。
ディレクティブだけで複数行に書かれた本体も、本体として印字します。
[fixture: member-bodies/empty-unified]
[fixture: member-bodies/comment-only-over-lines-kept]
[fixture: member-bodies/directive-only-over-lines-kept]
[fixture: member-bodies/percent-member-kept]
[corpus fixture: class/lex-member-percent]

入力
([member-bodies/split-input.mmd](../tests/fixtures/class/member-bodies/split-input.mmd)):

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

出力
([member-bodies/split-output.mmd](../tests/fixtures/class/member-bodies/split-output.mmd)):

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

入力
([member-bodies/empty-unified-input.mmd](../tests/fixtures/class/member-bodies/empty-unified-input.mmd)):

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

出力
([member-bodies/empty-unified-output.mmd](../tests/fixtures/class/member-bodies/empty-unified-output.mmd)):

```mmd
classDiagram
  class A { }
  class B { }
  class C:::c { }
  class D { }
  class E { }
  class F { %%{init: {}}%%}
```

### 空行

flowchart と同じです。
空行の連続は 1 つにし、
namespace とメンバーの本体の先頭と末尾の空行は取り除きます。
[fixture: blank-lines/collapsed] [fixture: blank-lines/namespace-edges-dropped]
[fixture: blank-lines/edges-around-comment-and-directive-lines-dropped]
[fixture: blank-lines/around-comment-and-directive-lines-collapsed]
[fixture: blank-lines/end-of-text-dropped]
[fixture: multi-line-statements/empty-line-inside-joined]
[fixture: empty-description-blocks/followed-by-empty-lines-collapsed]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/class/blank-lines/collapsed-input.mmd)):

```mmd
classDiagram


class A



class B {

+x


+y

}
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/class/blank-lines/collapsed-output.mmd)):

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
ただし、以下に挙げる場合は例外です。
前のものに続く文字列、バッククォートで囲んだ名前、`call` キーワードと、
ラベルの `[`、ジェネリック型の `~` がそれに当たります。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: generic-types/whitespace-before-collapsed-inside-kept]
クラス名の名前の部分の間も同じです。
`class Foo Bar` はクラス `FooBar` を宣言し、
書かれたとおり `class Foo Bar` と印字します。
部分をつなぐとキーワードになることがあるからです。
例えば `class no te` は `note` を宣言しますが、`class note` は拒否されます。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/name-parts-keyword-kept]
クラスの `:::` は、前の名前にも後ろの CSS クラスにも接します。
`class A :::c` と `class A ::: c` は `class A:::c` になります。
ER 図と同じです。
mermaid.js はどの書き方も同じクラスとして読むので、形を強いるものはありません。
mermaid.js の文書の例 4 件は、本体なしと本体ありで `class Animal:::someclass`、
`class Animal:::pink`、`class Animal:::styleClass` と書いています。
その範囲は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L780-L833)
にあります。 [fixture: whitespace-between-tokens/css-class-touches-separator]
隙間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおりに置きます。
U+2028 と U+2029 は、そのまま残します。
[test: U+2028 before the `:::` of a class]
[test: U+2029 after the `:::` of a class]
クラスの注釈 `<<interface>>` は、
`<<` の前（クラスの前にあるときは `>>` の後）に空白を 1 つ置き、
区切りの内側には何も置きません。
`class S<<i>>` と `class S <<  i  >>` は `class S <<i>>` に、
`<<interface>>Class01` と `<< interface>>Class01` は `<<interface>> Class01`
になります。
本体の外の注釈は mermaid.js が文字を trim するので、
どの書き方も同じ Db になります。
mermaid.js の文書は、両方の置き場所をこの空白で書いています。
`class Shape <<interface>>` は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L544)
にあります。
`<<interface>> Shape` は、
[ここ](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L552)
にあります。 [fixture: whitespace-between-tokens/annotation-spaced-once]
隙間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: whitespace-between-tokens/annotation-beside-directive-runs]
本体の中の注釈の行は、この種類の注釈ではありません。
文字が Db に入るので、
書かれたままにします（[メンバーの行](#メンバーの行)を参照）。
U+2028 と U+2029 は、そのまま残します。
[test: U+2028 before the `<<` of a class annotation]
以下は、角括弧のラベル、`note for`、`click`、`style`、
`cssClass` の文の語の間も同じです。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/after-name-collapsed]
[fixture: whitespace-between-tokens/words-collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]
クラス名だけの行は何も宣言しませんが、周りの文と同じ段に残します。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/tabs-collapsed]

`class`、`namespace`、`note`、`link`、`click`、`cssClass` の文では、文字列、
バッククォートで囲んだ名前、`call` キーワードが前のものに接していても、
間に空白を 1 つ置きます。
`note"n"` は `note "n"` に、`note for A"n"` は `note for A "n"` に、
`` class`C D` `` と ``namespace`N M` {`` はキーワードの後に空白を置いて、
`link A"u""t"` は `link A "u" "t"` に、
`click B href"u""t"_self` は `click B href "u" "t" _self` に、
`cssClass"A,B"c` は `cssClass "A,B" c` に、
`click C call f()"t"` は `click C call f() "t"` に、
`click C~T~call f()` は `click C~T~ call f()` と印字します。
mermaid.js はどの書き方も同じ文として読むので、形を強いるものはありません。
その文書では、
各文字列の前に空白を書いています
([`note "…"` と `note for MyClass "…"`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L639-L640)、
[`link Shape "…" "…"` と `click Shape2 href "…" "…"`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L650-L652)、
[`cssClass "nodeId1,nodeId2" className`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L773))。
[fixture: whitespace-between-tokens/note-and-name-strings-touching-spaced]
[fixture: whitespace-between-tokens/link-strings-touching-spaced]
[fixture: whitespace-between-tokens/call-after-generic-touching-spaced]
隙間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおりに置きます。
U+2028 と U+2029 はそのまま残します。
[fixture: whitespace-between-tokens/strings-beside-directive]
[test: U+2028 between the note keyword and its string]
[test: U+2029 between the class of a note and its string]
[test: U+2028 between the class keyword and a backquoted name]
[test: U+2029 between a link and its URL]
[test: U+2028 between the URL and the tooltip of a link]
[test: U+2029 between the tooltip and the target of a link]
[test: U+2028 between the cssClass keyword and its string]
[test: U+2029 between a callback and its tooltip]
[test: U+2028 between a generic type and the call of a callback]

`classDef` 文の名前を区切る `,` は、両側の名前に接します。
`classDef c1 , c2 fill:#f00` は `classDef c1,c2 fill: #f00` になります。
ER、requirement、
usecase
の一覧と同じです（[スタイルとクラス](./er.ja.md#スタイルとクラス)を参照）。
mermaid.js はどの書き方も同じ文として読むので、形を強いるものはありません。
mermaid.js の文書にある例 1 件は、接する形で書かれています。
その例は、
[`classDef firstClassName,secondClassName`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L761)
です。 [fixture: whitespace-between-tokens/classdef-names-touching]
隙間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおりに置きます。
`,` の隣の隙間には空白を置かないので、ディレクティブは名前と `,` に接します。
[fixture: whitespace-between-tokens/classdef-names-beside-directive]
[fixture: whitespace-between-tokens/classdef-names-beside-directive-runs]
文を終わらせる `;` や `#` は、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)に従います。
[fixture: whitespace-between-tokens/classdef-names-touching-before-terminator]
`,` の後ろの U+2028 と U+2029 は、そのまま残します。
[test: U+2028 after the comma of a classDef statement]
[test: U+2029 after the comma of a classDef statement]

`classDef` 文と `style` 文では、各スタイルの最初の `:` の前に空白を置かず、
値が空でなければ、後ろに空白を 1 つ置きます。
スタイルの間の `,` の前に空白を置かず、後ろに空白を 1 つ置きます。
`style C fill:#f9f  ,  stroke:#333` は、
`style C fill: #f9f, stroke: #333` になります。
スタイルの語と語の間の空白とタブの連続は、空白 1 つで印字します。
`style C border:1px   solid` は `style C border: 1px solid` と印字します。
コメントの中と `url(` の括弧の中の連続は、CSS が値の一部として読むので、
書かれたまま残します。
mermaid.js は余白と語の間の空白の連続を Db に残しますが、描かれる図は同じです。
詳しくは [同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)
を参照してください。 [fixture: whitespace-between-tokens/style-colon-spaced]
[fixture: whitespace-between-tokens/style-value-words-spaced]
[fixture: whitespace-between-tokens/style-url-runs-kept]
[fixture: whitespace-between-tokens/style-comment-runs-kept]
`:` のない語だけのスタイルでも同じです。
mermaid.js はこれらを独立したトークンとして読み、
`style A bold ,italic` は `style A bold, italic` と印字し、
`style A fill   #f00` は `style A fill #f00` と印字します。
語と語の間に空白があるかどうかは、書かれたまま残します。
mermaid.js は語をつなぐので、`fill #f00` と `fill#f00` は同じスタイルです。
接する語は、ほかの隙間と同じように接したままです。
[ディレクティブ](#ディレクティブ)を参照してください。
語をつなぐと、どこで語が終わるかが見えなくなるからです。
[fixture: whitespace-between-tokens/style-words-comma-spaced]
[fixture: whitespace-between-tokens/style-words-as-written]
[fixture: whitespace-between-tokens/style-words-run-spaced]
語の間にコメントやディレクティブがある文は、書かれたまま残します。
[fixture: whitespace-between-tokens/style-words-directive-kept]
ここではバックスラッシュは `,` をエスケープしません。
`fill:a\,b ,stroke:c` は `fill: a\, b, stroke: c` と印字します。
[fixture: whitespace-between-tokens/style-backslash-before-comma]
最後のスタイルがバックスラッシュで終わる `style` は、
その後に空白があるかないかを保ち、空白の連続は最初の 1 文字にします。
文末でも同じです。
mermaid.js がクラスのスタイルを書かれたまま `;` でつなぎ、
バックスラッシュが `;` をエスケープするからです。
（[同じに描かれるスタイル](./compatibility.ja.md#同じに描かれるスタイル)）。
`style A fill:abc\  ,stroke:green` は、
`style A fill: abc\ , stroke: green` と印字します。
[fixture: whitespace-between-tokens/style-backslash-space-kept]
[fixture: whitespace-between-tokens/style-backslash-at-end-kept]
`classDef` も空白の有無を保ちます。
適用先のクラスより後に書かれていると、
mermaid.js はスタイルをクラスのスタイルへ書かれたまま足します。
前に書かれていると空白を取り除き、画素は同じですが、文の順序で決まるので、
プリンターはどちらの順序でも書かれたまま保ちます。
`classDef c fill:abc\  ,stroke:green` は、
`classDef c fill: abc\ , stroke: green` と印字します。
[fixture: whitespace-between-tokens/class-def-backslash-space-kept]
[fixture: whitespace-between-tokens/class-def-backslash-at-end-kept]
コメントやディレクティブがある文、空白だけのスタイルがある文、
スタイルに改行があるか、行に保つ `;` がある文は、書かれたままにします。
[fixture: whitespace-between-tokens/style-comma-before-dropped]
[fixture: whitespace-between-tokens/style-comma-beside-directive-kept]
[fixture: whitespace-between-tokens/style-colon-and-comma-spaced]
スタイルの間に U+2028 や U+2029 があれば、文を書かれたままにします。
[test: U+2028 before the comma of a class style statement]

クラスの本体や namespace を閉じる `}` の後の U+2028 と U+2029 は、
mermaid.js にとって空白なので、行末の空白と一緒に落とします。
[test: U+2029 after the `}` of a class body]
[test: U+2028 after the `}` of a namespace]

入力
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/class/whitespace-between-tokens/collapsed-input.mmd)):

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

出力
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/class/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
classDiagram
  class Foo Bar
  class A <<interface>>
  class B["Label"]
  class C:::highlight
  note for C "a note"
  click C href "https://example.com" "tip"
  style C fill: #f9f
  cssClass "A,B" highlight
  Foo Bar
  A - B --> C
```

`call` の後の関数名と、その後の `(` の間の空白は、書かれたまま残します。
mermaid.js は、名前を `(` の前まで、空白も含めて読むので、
`click A call fn  ()` は、`fn` と 2 つの空白を名前とする関数を呼びます。
そこにある改行も残り、文は 2 行のままです。
引数の両端と `,` の前には空白を置かず、後ろに空白を 1 つ置きます。
`click A call f(  "x" ,y )` は `click A call f("x", y)` と印字します。
mermaid.js は引用符の外の `,` で引数を分け、各部分の両端の空白を除き、
同じ引数で関数を呼ぶからです。
（[同じに描かれる呼び出しの引数](./compatibility.ja.md#同じに描かれる呼び出しの引数)）。
引用符の中の空白は残し、空の部分を含む引数も書かれたままにします。
[fixture: whitespace-between-tokens/callback-arguments-spaced]
mermaid.js の行の規則が読むかもしれない引数の間の隙間は、
空白があるかないかを保ちます。
`click A call f(style:x,#b;c)` は書かれたまま残します。
`,` の後に空白を置くと、規則が無視する最後の `;` が変わるからです。
（[同じに描かれる呼び出しの引数](./compatibility.ja.md#同じに描かれる呼び出しの引数)）。
[fixture: whitespace-between-tokens/callback-arguments-line-rule-kept]
引数が空白だけの呼び出しの括弧は互いに接し、
`click A call f( )` は `click A call f()` になります。
mermaid.js はどちらも引数のない同じ呼び出しとして読むからです。
括弧の間のディレクティブは、[ディレクティブ](#ディレクティブ)のとおり、
両側の括弧に接します。
[fixture: whitespace-between-tokens/callback-blank-parentheses-touch]
括弧の間に改行があっても同じで、そこにあるコメント行は 1 行のまま残ります。
[fixture: whitespace-between-tokens/callback-blank-parentheses-lines]
括弧の間の U+2028 と U+2029 は、そのまま残します。
[test: U+2028 between the parentheses of a blank class callback]
[test: U+2029 between the parentheses of a blank class callback]
コメント行やディレクティブを含む引数は、`)` まで書かれたまま印字します。
`)` の前の空白は Db では引数の一部なので、`)` の前にコメント行があっても、
字下げしてはいけないからです。
[fixture: whitespace-between-tokens/callback-args-comment-line-kept]
[fixture: whitespace-between-tokens/callback-name-kept]
[fixture: whitespace-between-tokens/callback-name-tab-kept]
[fixture: whitespace-between-tokens/callback-name-directive-kept]
[fixture: whitespace-between-tokens/callback-name-comment-line-kept]
[corpus fixture: class/lex-callback-name-multi-line]

入力
([whitespace-between-tokens/callback-name-kept-input.mmd](../tests/fixtures/class/whitespace-between-tokens/callback-name-kept-input.mmd)):

```mmd
classDiagram
class A
class B
click A call fn  ( x )
click B call gn
(y)
click B call hn   ()
```

出力
([whitespace-between-tokens/callback-name-kept-output.mmd](../tests/fixtures/class/whitespace-between-tokens/callback-name-kept-output.mmd)):

```mmd
classDiagram
  class A
  class B
  click A call fn  (x)
  click B call gn
(y)
  click B call hn   ()
```

### 矢印の前後の空白

関係の矢印の前後と、各多重度の両側には、
mermaid.js のドキュメントの書き方のとおり、空白を 1 つずつ置きます。
`Customer"1"-->"*"Ticket` は `Customer "1" --> "*" Ticket` になります。
[fixture: arrow-spacing/spaced] [fixture: arrow-spacing/cardinality-on-one-side]
[fixture: arrow-spacing/whitespace-runs-collapsed]
矢印の関係の端と線はそれぞれトークンで、間に空白を書けますが、
1 つの矢印として接した形で印字します。
`A <|  --  * B` は `A <|--* B` になります。 [fixture: arrow-spacing/spaced]
[fixture: arrow-spacing/end-or-line-apart-joined]
[fixture: arrow-spacing/directive-between-arrow-tokens]

入力
([arrow-spacing/spaced-input.mmd](../tests/fixtures/class/arrow-spacing/spaced-input.mmd)):

```mmd
classDiagram
Animal<|--Duck
Customer "1"-->"*" Ticket
A <|  --  * B
C..>D
```

出力
([arrow-spacing/spaced-output.mmd](../tests/fixtures/class/arrow-spacing/spaced-output.mmd)):

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

入力
([arrow-spacing/read-as-written-input.mmd](../tests/fixtures/class/arrow-spacing/read-as-written-input.mmd)):

```mmd
classDiagram
A --o B
A --oB
A --- B
```

出力
([arrow-spacing/read-as-written-output.mmd](../tests/fixtures/class/arrow-spacing/read-as-written-output.mmd)):

```mmd
classDiagram
  A --o B
  A -- oB
  A -- - B
```

`call` の後に空白が続くとキーワードになり、字句解析は、
単位が始まる位置でそれを読みます（仕様の
[文の文脈](../../spec/docs/diagrams/class.ja.md#文の文脈) の規則 10）。
そのため、単語 `call` で終わる名前に接した矢印とラベルの `:` は、
接したまま残します。
前に空白を置くと、`A call()--> B` はクラス A のコールバックに、
`call-->C` はコールバックの始まりになるからです。
[fixture: arrow-spacing/touching-call-kept]
[fixture: arrow-spacing/touching-call-colon-kept]
[corpus fixture: class/lex-call-prefix]

ASCII の単語の中では、英字、数字、`_` の後の `call` はキーワードを始めないので、
通常の矢印の空白を適用します。 [fixture:
arrow-spacing/call-inside-ascii-word]

入力
([arrow-spacing/touching-call-kept-input.mmd](../tests/fixtures/class/arrow-spacing/touching-call-kept-input.mmd)):

```mmd
classDiagram
A call()--> B
call-->C
D call--|>E
```

出力
([arrow-spacing/touching-call-kept-output.mmd](../tests/fixtures/class/arrow-spacing/touching-call-kept-output.mmd)):

```mmd
classDiagram
  A call()--> B
  call--> C
  D call--|> E
```

### ラベル

関係やクラス名の後のラベルの `:` の両側には、
mermaid.js のドキュメントの書き方のとおり、空白を 1 つずつ置きます。
`A-->B:x` は `A --> B : x` に、`A:+int x` は `A : +int x` になります。
[fixture: labels/spaced] [fixture: labels/directive-around-colon]
sequence 図では `:` を前のものに接して書きます（詳しくは、
[sequence 図の整形規則のコロン](./sequence.ja.md#コロン) を参照）。
どちらも、その図種のドキュメントの書き方に従っています。
`accTitle` と `accDescr` の後の `:` は、他の図種と mermaid.js の文書と同じく、
キーワードに接し、後に空白を 1 つ置きます。
[fixture: labels/accessibility-text-runs-collapsed]
[fixture: multi-line-statements/joined]
[fixture: multi-line-statements/acc-descr-joined]
関係の後のラベルのテキストは書かれたまま残します。
折り返すラベルは連なりを描くので、連なりは空白 1 つではないからです。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
[fixture: labels/spaced]
`accDescr` のテキストの中の空白とタブの連なりは、空白 1 つで印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
`accTitle` はブラウザがツールチップとして表示するので、
その連なりは書かれたまま残します。
[fixture: labels/accessibility-text-runs-collapsed]
[fixture: labels/acc-block-runs-collapsed]
クラスや namespace の角括弧の間の文字列は、括弧との間に何も置きません。
名前と `[` の間にも何も置きません。
`namespace Auth ["x"]` は `namespace Auth["x"]` に、
`namespace Auth[ "x" ]` は `namespace Auth["x"]` に、
`class A["x" ]` は `class A["x"]` になります。
mermaid.js はどの書き方も同じラベルとして読みます。
その文書では `[` を名前に接して書いており、
flowchart の subgraph や agentflow の見出しも同じ形で印字します
([`namespace Auth["Authentication Service"]`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L404))。
[fixture: labels/bracket-touches-name]
文字列の隣にディレクティブがあれば、隙間に空白を置かないので、
括弧と文字列に接します。
`class D[ %%{x}%% "x" ]` は `class D[%%{x}%%"x"]` になります。
`]` の前の U+2028 と U+2029 は残します。
[fixture: labels/bracket-directive-at-edge]
[test: U+2028 inside the brackets of a class label]
[test: U+2029 inside the brackets of a class label]
[test: U+2028 between a class name and its label]
[fixture: labels/bracket-padding-dropped]

入力
([labels/spaced-input.mmd](../tests/fixtures/class/labels/spaced-input.mmd)):

```mmd
classDiagram
A-->B:x
A --> B :x  y
A:+int x
A  :  -bar() int
```

出力
([labels/spaced-output.mmd](../tests/fixtures/class/labels/spaced-output.mmd)):

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
`"classDiagram\nA --> B : \nA :  \n"` は
`"classDiagram\n  A --> B : \n  A :  \n"` と印字します（fixture `blank-kept` は
[フォルダー](../tests/fixtures/class/labels) にあります）。
[fixture: labels/blank-kept] [fixture: labels/blank-tab-kept]

`;` を含む行では、ラベルの `:` の後に空白が書かれているかどうかを保ちます。
mermaid.js の行単位の規則は、テキスト `style` の後の `:` に、
空白のないテキストを経て `#` が続く行で、
最後の `;` を無視します（[1 行に 1 文](./flowchart.ja.md#1-行に-1-文)を参照）。
`styleA fill:#f00;` はクラス `styleAfill` にメンバー `#f00` を足し、
`:` の後に空白を入れると、`;` がメンバーの一部になります。
[fixture: labels/semicolon-line-kept]
[fixture: labels/semicolon-line-with-directive-kept]
[fixture: directives/ignored-semicolon-next-to-another-kept]

入力
([labels/semicolon-line-kept-input.mmd](../tests/fixtures/class/labels/semicolon-line-kept-input.mmd)):

```mmd
classDiagram
styleA fill:#f00;
styleA fill: #f00;
```

出力
([labels/semicolon-line-kept-output.mmd](../tests/fixtures/class/labels/semicolon-line-kept-output.mmd)):

```mmd
classDiagram
  styleA fill :#f00;
  styleA fill : #f00;
```

### メンバーの行

通常のメソッドでは、括弧の直前と内側の外周の空白を除き、
空でない戻り値型の前に空白を 1 つ置きます。
フィールドの中の空白とタブの連なりは、空白 1 つで印字します。
可視性記号の後の空白 1 つは、名前の一部なので残します。
trivia、無視される文字、物理・Unicode の改行、
セミコロン行の保護があるメソッドは原文全体を保ちます。
[fixture: member-lines/method-padding]
[fixture: member-lines/method-values-and-classifiers-runs-collapsed]
[fixture: member-lines/method-trivia-and-semicolon-kept]

mermaid.js の文書と同じく、属性の classifier はそのテキストに接します。
`+attr string *` は `+attr string*` と印字します。
[fixture: member-lines/attribute-classifier-touches]
属性と注釈の行は、本体内でもクラス名の `:` の後でも、
内部の空白とタブの連なりを除き、中身を保ちます。
メソッドの名前・引数・戻り値の中身も、連なりを除いて保ちます。
generic のつづりと classifier に伴う末尾も保ちます。
[fixture: member-lines/runs-collapsed]
[fixture: member-lines/percent-text-runs-collapsed]
[fixture: member-lines/trailing-whitespace-dropped]
[fixture: member-lines/directive-inside-kept]
[corpus fixture: class/lex-member-percent]
mermaid.js はメンバーの行をそのテキストで部分に分け、
可視性の印の後の空白は名前の一部になるからです。
`+ foo()` の名前は空白の付いた ` foo` で、`+foo()` の名前は `foo` です。
[fixture: member-lines/runs-collapsed]
[corpus fixture: class/gram-member-visibility-whitespace-body-0184dca2]
注釈の行 `<< y z >>` は、テキストの周りの空白も Db に残ります。
[fixture: member-lines/runs-collapsed]

入力
([member-lines/runs-collapsed-input.mmd](../tests/fixtures/class/member-lines/runs-collapsed-input.mmd)):

```mmd
classDiagram
class A {
+ spaced  name
  +foo( a ,  b )   int$
<< y  z >>
}
A :  -  bar()
```

出力
([member-lines/runs-collapsed-output.mmd](../tests/fixtures/class/member-lines/runs-collapsed-output.mmd)):

```mmd
classDiagram
  class A {
    + spaced name
    +foo(a , b) int$
    << y  z >>
  }
  A : - bar()
```

### ジェネリック型

ジェネリック型は、最初の `~` から 2 つ目の `~` まで書かれたまま残します。
その間の空白は Db の型の一部で、`List~ T ~` の型は、
`T` の両側に空白がある `" T "` だからです（文字列として書いています）。
[fixture: generic-types/kept] [fixture: generic-types/class-with-body-kept]
[fixture: generic-types/in-member-and-note-kept]
[fixture: generic-types/directive-inside-kept]
[fixture: generic-types/whitespace-before-collapsed-inside-kept]
[fixture: generic-types/empty-kept]
ジェネリック型の最初の `~` は、そこにどんな空白が書かれていても、
前の名前に接します。
`class A ~T~` は `class A~T~` に、
`A ~T~ --> B ~U~` は `A~T~ --> B~U~` と印字します。
名前と `~` の間の空白は Db に入らず、
mermaid.js の文書ではどのジェネリック型も名前に接して書いています
([`class Square~Shape~{` と `List~int~ position`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/classDiagram.md#L227-L231))。
[fixture: generic-types/touches-name]
[fixture: generic-types/whitespace-before-collapsed-inside-kept]
[test: U+2029 between a class name and its generic type]

入力
([generic-types/kept-input.mmd](../tests/fixtures/class/generic-types/kept-input.mmd)):

```mmd
classDiagram
class Map~K, V~
class List~ T ~
Map~K, V~ --> List~ T ~
```

出力
([generic-types/kept-output.mmd](../tests/fixtures/class/generic-types/kept-output.mmd)):

```mmd
classDiagram
  class Map~K, V~
  class List~ T ~
  Map~K, V~ --> List~ T ~
```

### コメント

行に単独のコメントは、周りの文、本体の中ではメンバーの行と同じ段に置き、
本文は書かれたまま残します。 [fixture: comments/kept]
[fixture: comments/before-header] [fixture: comments/in-namespace]
[fixture: comments/last-in-body] [fixture: comments/text-kept]
[fixture: member-bodies/comment-only-over-lines-kept]
文の後のコメントはその行に残し、`%%` の前に空白が書かれているかどうかは、
sequence 図と同じく保ちます。 [fixture: comments/kept]
[fixture: comments/whitespace-run-before-collapsed]
[fixture: comments/after-header-touching-kept]
[fixture: comments/after-last-statement-without-line-break]

入力
([comments/kept-input.mmd](../tests/fixtures/class/comments/kept-input.mmd)):

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

出力
([comments/kept-output.mmd](../tests/fixtures/class/comments/kept-output.mmd)):

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
これは既知の差異 `comment-takes-line-break` です（詳しくは、
[互換性の、コメントの後の空白だけの行](./compatibility.ja.md#コメントの後の空白だけの行)
を参照）。
そうした行は、空白 1 つの行として印字します。
空行にすると、mermaid.js が次の文をコメントのある文の一部として読むからです。
空白が行末にあるので、例は、`\n` を改行とする文字列で書きます。
`"classDiagram\nA --> B %% c\n  \nA : +int age\n"` は
`"classDiagram\n  A --> B %% c\n \n  A : +int age\n"` と印字します（fixture
`whitespace-line-kept` は [フォルダー](../tests/fixtures/class/comments)
にあります）。
ヘッダーと文を持つ行のコメントの後も同じです。
例は `classDiagram accDescr {} %% c` で、
その fixture は `comments/whitespace-line-after-header-comment-kept` です。
[fixture: comments/whitespace-line-kept]
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
行に単独のディレクティブは周りの文と同じ段に置きます。
文の行の中では、flowchart と同じく、隙間をディレクティブがないものとして印字し、
ディレクティブをその空白の後ろに置いて、後ろの単位に接します。
[fixture: directives/kept] [fixture: directives/before-header]
[fixture: directives/in-namespace]
[fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides]
[fixture: directives/whitespace-before-collapsed-at-end]
[fixture: directives/touching-one-side]
[fixture: directives/count-sensitive-unit]
[fixture: directives/after-braces-on-same-line]
[fixture: member-bodies/directive-only-over-lines-kept]
[fixture: arrow-spacing/directive-between-arrow-tokens]

入力
([directives/kept-input.mmd](../tests/fixtures/class/directives/kept-input.mmd)):

```mmd
classDiagram
%%{init: {}}%%
class A {
%%{init: {}}%%
+x
}
class Fo%%{init: {}}%%o
```

出力
([directives/kept-output.mmd](../tests/fixtures/class/directives/kept-output.mmd)):

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
ディレクティブは空白ではないので、mermaid.js にとって、
その行は空白だけの行ではありませんが、字下げすると空白だけの行になります。
行送りを取るコメントの後では、空白だけの行が、
コメントが取るものを終わらせます（[コメント](#コメント)を参照）。
そこにあるディレクティブだけの行は、書かれた字下げのまま残し、
本文の終わりでも同じです。
別の字下げにすると、ディレクティブが残す空白だけの行が、できたり、
なくなったりするからです。 [fixture: directives/after-comment]
[fixture: directives/after-comment-indentation-kept]
[fixture: directives/after-comment-at-end-of-text-kept]

入力
([directives/bare-marker-input.mmd](../tests/fixtures/class/directives/bare-marker-input.mmd)):

```mmd
classDiagram
A
%%
%%{init: {}}%%
class C
```

出力
([directives/bare-marker-output.mmd](../tests/fixtures/class/directives/bare-marker-output.mmd)):

```mmd
classDiagram
  A
  %%
%%{init: {}}%%
  class C
```

入力
([directives/after-comment-input.mmd](../tests/fixtures/class/directives/after-comment-input.mmd)):

```mmd
classDiagram
A --> B %% c
%%{init: {}}%%
A : +int age
```

出力
([directives/after-comment-output.mmd](../tests/fixtures/class/directives/after-comment-output.mmd)):

```mmd
classDiagram
  A --> B %% c
%%{init: {}}%%
  A : +int age
```

`;` を落とすと、行の規則が無視する `;` が変わる行は、書かれたまま印字します。
語の引数で終わるディレクティブの後の `;`（`%%{wrap foo;`）、
別の `;` に接する無視される `;` がある行です（詳しくは、
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照）。
[fixture: directives/semicolon-after-word-argument-directive-kept]
[fixture: directives/ignored-semicolon-next-to-another-kept]
自由なテキストの引数を持つ閉じていないディレクティブはテキストの終わりまで続き、
その後の `;` はその一部です。
それが連れていく行は、書かれたまま印字します。
[fixture: directives/semicolon-after-unclosed-directive-kept]
[fixture: directives/semicolon-on-next-line-after-unclosed-directive-kept]

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は、
安全なときに Prettier の YAML 整形にかけます（詳しくは、
[フロントマターの YAML](./flowchart.ja.md#フロントマターの-yaml)を参照）。
[fixture: frontmatter-yaml/formatted] [fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/indented-delimiters-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/html-tag-kept]
[fixture: frontmatter-yaml/less-than-before-other-formatted]
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/class/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
classDiagram
class A
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/class/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
classDiagram
  class A
```

### 複数行の値

[flowchart のトップレベルの説明](./flowchart.ja.md#複数行の値)と同じく、
`accDescr { ... }` の本文行は文より 1 段深くそろえ、
独立した `}` は文と同じ段に置きます。
Mermaid が説明からこの字下げを除くためです。
複数行に書かれた文字列、バッククォートの名前、ジェネリック型も、
書かれたまま残します。 [fixture: multi-line-values/kept]
[fixture: multi-line-values/block-text-on-opening-line-spaced]
[fixture: multi-line-values/block-comment-line-kept]
[fixture: multi-line-values/block-empty-line-kept]
[fixture: multi-line-values/backquoted-name-kept]
[fixture: multi-line-values/label-string-kept]
[fixture: multi-line-values/generic-in-relation-kept]

1 行のブロックの文字は、両側に空白を 1 つずつ置きます。
これは、
[flowchart のアクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)
と同じ形です。
`accDescr {a b}`、`accDescr {  a b  }`、`accDescr {  a b}`、
`accDescr {a b  }` は、どれも `accDescr { a b }` になります。
mermaid.js は文字を trim するので、両端の空白に意味はありません。
文字の中にディレクティブがあるブロックは、書かれたままにします。
`;` を残す行にあるブロックは、空白を足しませんが、
端の空白の連なりは空白 1
つにします（[セミコロン](./flowchart.ja.md#セミコロン)を参照）。
[fixture: multi-line-values/block-text-on-one-line-padded]

入力
([multi-line-values/kept-input.mmd](../tests/fixtures/class/multi-line-values/kept-input.mmd)):

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

出力
([multi-line-values/kept-output.mmd](../tests/fixtures/class/multi-line-values/kept-output.mmd)):

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

### スタイル文の末尾のセミコロン

`classDef` または `style` 文の行末の `;` は、
[mermaid.js の行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
が無視するときに削除します。
`:` と後の `#` の間に空白がない形です。
この終端を削除しても Db は変わらず、スタイルが複数でも同じです。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
削除する `;` の直前の空白も一緒に削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/space-before-terminator]
その行は、スタイルの空白を含め、その `;` がない行として整形します。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
文の前後の空行とコメント行は、通常の配置に従います。
[fixture: semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines]
メンバーのセミコロンはスタイル文の外なので保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/member-semicolons-kept]

同じ行でセミコロンの後にディレクティブが続く場合は、`;` を保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
同じ行で `%%` のテキストが続く場合も保ちます。
ここではスタイルの文字列の一部です。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
無視される `;` が別の `;` の隣にある場合は、行の規則の選択を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]
閉じていないディレクティブの後の `;` は、その停止位置を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
U+2028 と U+2029 の前も同じように保護します。
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
[test: style semicolons: class before U+2028]
[test: style semicolons: class before U+2029]
文と無視される終端の間にある閉じたディレクティブは残し、`;` は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

出力
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/class/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
classDiagram
  class A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### 複数行の文

通常の複数行の文は、1行にまとめて印字します。
class 図では、改行は文を終えます。
ただし、`direction` の後では値が次の行にあってよく、
`accTitle` と `accDescr` の `:` の後ではテキストが次の行にあってよいので、
`direction`、改行、`LR` は `direction LR` と印字します。
[fixture: multi-line-statements/joined]
[fixture: multi-line-statements/acc-descr-joined]
[fixture: multi-line-statements/empty-line-inside-joined]
[corpus fixture: class/lex-direction-line-value-next-line]
コメントかディレクティブの隣の改行は残し、
構造の続きの行と間の注釈を 1
段深く置きます（[複数行の文](./sequence.ja.md#複数行の文)を参照）。
[fixture: multi-line-statements/breaks-decided-one-by-one]
値の中の空白は変えません。
各隙間の最初の改行の前の空白は保ちます。
コメントで結合される領域では、文全体を原文のまま残します。
`;` があるだけでは、複数行に書かれた文をつなぐ妨げにはなりません。
class では文の区切りに `;` を使えず、
そのような文の最初の行にはキーワードしかないので、行をつないでも、
行の規則が無視する `;` は変わりません。
[fixture: multi-line-statements/semicolon-value-joined]
[fixture: multi-line-statements/comment-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/comment-inside-title-kept]
U+2028 か U+2029 の後のコメント行を含む文は、結合される領域です。
mermaid.js はそのコメント行を除き、
前後のテキストを 1 行として読むので（詳しくは、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
を参照）、その文は、
各部分の間隔と後の行のインデントも含めて書かれたまま残します。
[test: class: ls-comment-in-class-statement]
[test: class: ps-comment-in-relation-statement]

入力
([multi-line-statements/joined-input.mmd](../tests/fixtures/class/multi-line-statements/joined-input.mmd)):

```mmd
classDiagram
accTitle:
A title
direction
LR
```

出力
([multi-line-statements/joined-output.mmd](../tests/fixtures/class/multi-line-statements/joined-output.mmd)):

```mmd
classDiagram
  accTitle: A title
  direction LR
```

入力
([multi-line-statements/comment-inside-kept-input.mmd](../tests/fixtures/class/multi-line-statements/comment-inside-kept-input.mmd)):

```mmd
classDiagram
direction
%% c
LR
```

出力
([multi-line-statements/comment-inside-kept-output.mmd](../tests/fixtures/class/multi-line-statements/comment-inside-kept-output.mmd)):

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
値が方向文として読まれるのを防ぎます。
[fixture: multi-line-statements/title-next-direction-tb]
[fixture: multi-line-statements/title-next-direction-bt]
[fixture: multi-line-statements/title-next-direction-lr]
[fixture: multi-line-statements/title-next-direction-rl]
[fixture: multi-line-statements/description-next-direction-tb]
[fixture: multi-line-statements/description-next-direction-bt]
[fixture: multi-line-statements/description-next-direction-lr]
[fixture: multi-line-statements/description-next-direction-rl]
[fixture: multi-line-statements/direction-value-with-prefix]
TDとほかの大小文字はその方向行の規則ではないので、通常の次行の値をつなぎます。
[fixture: multi-line-statements/title-next-direction-td]
[fixture: multi-line-statements/description-next-direction-td]
[fixture: multi-line-statements/lower-case-direction-value]
`tabWidth: 0`と`useTabs`でも設定の継続幅を使い、CRも正規化後に同じ判断をします。
[fixture: multi-line-statements/direction-value-zero-width]
[fixture: multi-line-statements/direction-value-tabs]
[test: accessibility revisions: class direction-value-cr]

入力（escape 表記）: `"classDiagram\nclass A11y\naccTitle:\n direction LR"`。

出力
([multi-line-statements/title-next-direction-lr-output.mmd](../tests/fixtures/class/multi-line-statements/title-next-direction-lr-output.mmd)):

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
[fixture: direction-lines/directive-around-value]
[fixture: direction-lines/comment-after-value-kept]
[corpus fixture: class/lex-direction-in-namespace]
[corpus fixture: class/lex-direction-in-member-body]
`directionLR` のように `direction` で始まり値に接している語は、
方向の行ではなくクラスの名前です。
mermaid.js が `direction` をキーワードとして読むのは、
後ろに空白がある場合だけなので、書かれたまま残します。
[fixture: direction-lines/no-whitespace-is-a-class-kept]

入力
([direction-lines/text-kept-input.mmd](../tests/fixtures/class/direction-lines/text-kept-input.mmd)):

```mmd
classDiagram
direction    LR
class A   direction RL
direction TBX
```

出力
([direction-lines/text-kept-output.mmd](../tests/fixtures/class/direction-lines/text-kept-output.mmd)):

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
キーワードと開始括弧の間には空白を 1 つ置きます。
`accDescr{  }` は `accDescr {}` にします。
[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: class Unicode and tab interiors]
コメントや directive の内容と改行は保ち、
本文の字下げは[複数行の値](#複数行の値)に従います。

空の説明ブロック `accDescr {}` は、同じ行の別の文やヘッダーと並ぶとき、
その前でも後でも、文になります。
`accDescr {} class A` は A を宣言し、
`classDiagram accDescr {}` や `note for A "x" accDescr {}` も受理されますが、
行に単独の `accDescr {}` は、mermaid.js と同じく拒否されます。
そうした行は、文を一緒に残します。
その行に本体を持つクラスは、ほかのクラスと同じように印字し、
メンバーは 1 段深く、`}` はその行と同じ段に置きます。
[fixture: empty-description-blocks/before-class-with-body-indented]
[fixture: empty-description-blocks/kept-with-statement]
[fixture: empty-description-blocks/after-statement]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/two-blocks-kept]
[fixture: empty-description-blocks/directive-between-kept]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/followed-by-empty-lines-collapsed]
[corpus fixture: class/gram-empty-description-block-alone]
[corpus fixture: class/header-empty-description-block-then-statement]

入力
([empty-description-blocks/kept-with-statement-input.mmd](../tests/fixtures/class/empty-description-blocks/kept-with-statement-input.mmd)):

```mmd
classDiagram
accDescr {}   class A
```

出力
([empty-description-blocks/kept-with-statement-output.mmd](../tests/fixtures/class/empty-description-blocks/kept-with-statement-output.mmd)):

```mmd
classDiagram
  accDescr {} class A
```

入力
([empty-description-blocks/after-statement-input.mmd](../tests/fixtures/class/empty-description-blocks/after-statement-input.mmd)):

```mmd
classDiagram accDescr {}
class A
note for A "x"   accDescr {}
```

出力
([empty-description-blocks/after-statement-output.mmd](../tests/fixtures/class/empty-description-blocks/after-statement-output.mmd)):

```mmd
classDiagram accDescr {}
  class A
  note for A "x" accDescr {}
```

複数行に書かれたブロックは、その後に続く文を、閉じ波括弧の隣に残します。
空白だけのブロックは 1 行に結合し、コメントを含むブロックは改行を保ちます。
`accDescr`、改行、`{} class A` はクラス A を宣言しますが、
`class A` を独立した行に置くと、ブロックが単独になり、入力が拒否されるからです。
[fixture: empty-description-blocks/over-lines-joined]
[fixture: empty-description-blocks/over-lines-empty-line-joined]
[fixture: empty-description-blocks/over-lines-comment-line-kept]

入力
([empty-description-blocks/over-lines-joined-input.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-joined-input.mmd)):

```mmd
classDiagram
accDescr
{} class A
accDescr {
} class B
```

出力
([empty-description-blocks/over-lines-joined-output.mmd](../tests/fixtures/class/empty-description-blocks/over-lines-joined-output.mmd)):

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
``"classDiagram\nclass A\nclass `x y  \n\n"`` は
``"classDiagram\n  class A\n  class `x y  \n\n"`` と印字し、
`y` の後の 2 つの空白と改行は残ります（fixture `kept` は
[フォルダー](../tests/fixtures/class/unclosed-backquoted-names)にあります）。
[fixture: unclosed-backquoted-names/kept]
[fixture: unclosed-backquoted-names/at-end-of-text-kept]
[fixture: unclosed-backquoted-names/over-lines-kept]
[fixture: unclosed-backquoted-names/in-relation-kept]

## 書かれたまま残すもの

[複数行の値](#複数行の値)の説明本文の字下げを除き、
次のテキストは書かれたまま残します。
変えると図が変わるか、入力が拒否されるからです。

- 値のテキスト。
  文字列、バッククォートの名前、ラベルのテキスト、
  スタイル（最初の `:` と `,` の前後の空白を除きます）、`accTitle` のテキスト。
  [fixture: whitespace-between-tokens/style-colon-and-comma-spaced]
  [fixture: labels/accessibility-text-runs-collapsed]
- 属性と注釈の中身、メソッドの各フィールドの中身、
  `~` から `~` までのジェネリック型。
- 空白だけのラベルの `:` の後の空白と、
  `;` を含む行のラベルの `:` の後に空白があるかどうか。
- 文の後のコメントの後の空白だけの行。
  空白 1 つにする。
- 方向の行の、`direction` の前と値の後のテキスト。
- セミコロン行かコメントで結合される領域の保護対象の文。
- 注釈を含む隙間の最初の改行の前の空白。
- 閉じていないバッククォートの名前。
  テキストの終わりまで。
- ヘッダーの綴り。
  `classDiagram` か `classDiagram-v2`。 [fixture: indentation/header-v2-kept]

次のものは、どちらの形でも Db が同じなので、選択として書かれたまま残します。
文の後のコメントの印の前に空白が書かれているかどうかです。
その空白の連なりは、空白 1 つで印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
[fixture: comments/mark-run-one-space]
既知の差異（`comment-takes-character`、`percent-brace-after-unit`）の場所では、
mermaid.js がコメントを、接するものによって読むからです。
場所の一覧よりも、1 つの規則のほうが単純です。

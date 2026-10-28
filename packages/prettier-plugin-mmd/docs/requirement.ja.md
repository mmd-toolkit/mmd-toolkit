# requirement 図の整形規則

英語版: [requirement.md](./requirement.md)

prettier-plugin-mmd が requirement 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
ER 図と同じ規則はそう書き、理由は [ER 図の整形規則](./er.ja.md) にあります。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
requirement と element のフィールドは、その文の行より 1 段深く、
1 行に 1 つ置き、本体を閉じる `}` は、その行と同じ段に、
行に単独で置きます。 [fixture: indentation/statements-and-bodies]
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、
既定は空白 2 つです。 [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
入力に書かれたインデントは残しません。
行頭の空白は mermaid.js にとって無だからです。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。 [fixture: indentation/written-indentation-dropped]
ヘッダーは、
前に空白が書かれていても 1 桁目に置きます。 [fixture: indentation/header-leading-whitespace]
書かれたまま残すテキスト（`accDescr` ブロックの行など）は、行ごとの桁を保ち、
ブロックを閉じる `}` は文と同じ段に置きます。 [fixture: indentation/description-block-lines-kept]
例外は、方向を含む `accTitle` と `accDescr` の文で、
1 桁目を保ちます（[アクセシビリティの文](#アクセシビリティの文)を参照）。

入力 ([indentation/statements-and-bodies-input.mmd](../tests/fixtures/requirement/indentation/statements-and-bodies-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
text: t
}
element e {
type: t
}
r - satisfies -> e
style r fill:red
```

出力 ([indentation/statements-and-bodies-output.mmd](../tests/fixtures/requirement/indentation/statements-and-bodies-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: t
  }
  element e {
    type: t
  }
  r - satisfies -> e
  style r fill:red
```

入力 ([indentation/tab-width-4-input.mmd](../tests/fixtures/requirement/indentation/tab-width-4-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
r - satisfies -> r
```

出力 ([indentation/tab-width-4-output.mmd](../tests/fixtures/requirement/indentation/tab-width-4-output.mmd)):

```mmd
requirementDiagram
    requirement r {
        id: 1
    }
    r - satisfies -> r
```

### 本体

requirement と element の `{` は、種類のキーワード、名前、クラスの行に、
書かれ方によらず空白 1 つの後に置きます。
フィールドは次の行から 1 行に 1 つ置き、`}` は行に単独で置きます。
`{` の前の空白 1 つは、ER の属性ブロックと同じで、
mermaid.js の文書の書き方でもあります。
引用符のない名前では空白がどのみち要るので、
文の形は 1 つになります。 [fixture: bodies/opening-brace-after-one-space]
requirement の種類は 6 つあり、
書かれた大文字小文字のまま残します。 [fixture: bodies/kinds]
`}` の後ろに同じ行で続く文は、
それぞれの行に移します。 [fixture: bodies/statement-after-closing-brace]
[fixture: statements-one-per-line/closing-brace-then-statement]

mermaid.js は `{` の後に改行を要するので、
フィールドのない本体は `{` と `}` を 2 行に置き、
間の空行は落とします。 [fixture: bodies/empty-body-on-two-lines]
本体の先頭と末尾の空行も落とします（[空行](#空行)を参照）。 [fixture: bodies/blank-lines-at-edges-dropped]

入力 ([bodies/empty-body-on-two-lines-input.mmd](../tests/fixtures/requirement/bodies/empty-body-on-two-lines-input.mmd)):

```mmd
requirementDiagram
requirement r {
}
element e {


}
requirement s {

}
```

出力 ([bodies/empty-body-on-two-lines-output.mmd](../tests/fixtures/requirement/bodies/empty-body-on-two-lines-output.mmd)):

```mmd
requirementDiagram
  requirement r {
  }
  element e {
  }
  requirement s {
  }
```

入力 ([bodies/statement-after-closing-brace-input.mmd](../tests/fixtures/requirement/bodies/statement-after-closing-brace-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
} element e {
type: t
} r - satisfies -> e
```

出力 ([bodies/statement-after-closing-brace-output.mmd](../tests/fixtures/requirement/bodies/statement-after-closing-brace-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: t
  }
  r - satisfies -> e
```

### フィールド

フィールドは 1 行に、キーワード、キーワードに接する `:`、
空白 1 つの後に値を置きます。
書かれ方によりません。
mermaid.js の文書がフィールドをそう書き、
journey も値の前に空白 1 つを置きます。 [fixture: fields/colon-touches-keyword]
[fixture: fields/spaces-around-colon-and-value]
[fixture: fields/value-after-one-space]
引用符のない値の両端の空白は Db に入らないので落とします。
値の中の空白は Db に入り、
文字列は引用符の間のすべてが Db に入ります。 [fixture: fields/value-outer-whitespace-dropped]
[fixture: fields/value-inner-whitespace-kept]
[fixture: fields/string-values-kept]
引用符のない値の中の `#`、`%`、`;` は値の文字で、
コメントの始まりではありません。 [fixture: fields/special-characters-in-values]

フィールドは書かれた順に置きます。
同じフィールドが 2 回書かれていても同じで、
mermaid.js は最初のものを読みます。 [fixture: fields/order-kept]
[fixture: fields/same-field-twice]
フィールド、risk、verifyMethod の値のキーワードは、
書かれた大文字小文字のまま残します。
mermaid.js はどの大文字小文字でも読み、Db は同じです。
大文字小文字は強制されないので、作者が選んだものとして、
書き換えません。 [fixture: fields/field-keywords-case-kept]
[fixture: fields/keyword-values-case-kept]
複数行に書かれたフィールドは、
字句解析器が改行を空白として読む所で 1 行にします。
空白の後の改行がそうです（[複数行の文](#複数行の文)を参照）。 [fixture: fields/over-lines-joined]

入力 ([fields/spaces-around-colon-and-value-input.mmd](../tests/fixtures/requirement/fields/spaces-around-colon-and-value-input.mmd)):

```mmd
requirementDiagram
requirement r {
id:1
text :   the test text.
risk :high
verifyMethod:    inspection
}
element e {
type  :t
docref:   d
}
```

出力 ([fields/spaces-around-colon-and-value-output.mmd](../tests/fixtures/requirement/fields/spaces-around-colon-and-value-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: the test text.
    risk: high
    verifyMethod: inspection
  }
  element e {
    type: t
    docref: d
  }
```

入力 ([fields/string-values-kept-input.mmd](../tests/fixtures/requirement/fields/string-values-kept-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: "1"
text: " a:  b, c "
}
element e {
type: "a  b"
docref: "http://x.test/a-b"
}
```

出力 ([fields/string-values-kept-output.mmd](../tests/fixtures/requirement/fields/string-values-kept-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: "1"
    text: " a:  b, c "
  }
  element e {
    type: "a  b"
    docref: "http://x.test/a-b"
  }
```

### 名前

名前は、引用符の有無を含め、書かれたまま印字します。
mermaid.js は `"r"` と `r` を同じ名前として読みますが、
引用符は書き換えません。 [fixture: names/quoted-and-unquoted-kept]
引用符のない名前は、語の間に空白を持てます。
それは名前の一部なので書かれたまま残し、
両端の空白は名前に入らないので落とします。 [fixture: names/inner-whitespace-kept]
[fixture: names/outer-whitespace-dropped]
文字列は `-`、`:`、`,`、`{` など、どの文字も含められます。
引用符のない名前は、最初の文字の後に `#`、`.`、
`}` を含められます。 [fixture: names/string-names-with-special-characters]
[fixture: names/special-characters-in-unquoted-names]

入力 ([names/quoted-and-unquoted-kept-input.mmd](../tests/fixtures/requirement/names/quoted-and-unquoted-kept-input.mmd)):

```mmd
requirementDiagram
requirement "r" {
}
requirement s {
}
"r" - satisfies -> s
s - satisfies -> "r"
style "r" fill:red
```

出力 ([names/quoted-and-unquoted-kept-output.mmd](../tests/fixtures/requirement/names/quoted-and-unquoted-kept-output.mmd)):

```mmd
requirementDiagram
  requirement "r" {
  }
  requirement s {
  }
  "r" - satisfies -> s
  s - satisfies -> "r"
  style "r" fill:red
```

入力 ([names/string-names-with-special-characters-input.mmd](../tests/fixtures/requirement/names/string-names-with-special-characters-input.mmd)):

```mmd
requirementDiagram
requirement "a - b: c, d {" {
}
"x  y" - satisfies -> "z"
```

出力 ([names/string-names-with-special-characters-output.mmd](../tests/fixtures/requirement/names/string-names-with-special-characters-output.mmd)):

```mmd
requirementDiagram
  requirement "a - b: c, d {" {
  }
  "x  y" - satisfies -> "z"
```

### 関係文の空白

関係文は、左の名前、`-` または `<-`、関係、`->` または `-`、右の名前の間を、
書かれ方によらず空白 1 つにします。
単位を離す書き方は mermaid.js の文書の形で、
ER 図の関係文も単位の間は空白 1 つです。
引用符のない名前は `-` の前で終わるので、
空白で名前は変わりません。 [fixture: relationship-spacing/spaces-and-touching]
[fixture: relationship-spacing/one-space-between-units]
[fixture: relationship-spacing/string-names]
矢印の向きは書かれたまま残します。
`a - copies -> b` と `b <- copies - a` は書き方が違うからです。
関係の語の大文字小文字も書かれたままです。 [fixture: relationship-spacing/relation-case-kept]
[fixture: relationship-spacing/every-relation]
引用符のない名前の中の空白は名前の一部です。 [fixture: relationship-spacing/multi-word-names]
単位の間のディレクティブは、その場に残し、
両側に書かれた空白も残します。 [fixture: relationship-spacing/directive-between-units-kept]
空白の後で改行して複数行に書かれた関係文は、
1 行にします。 [fixture: relationship-spacing/over-lines-joined]

入力 ([relationship-spacing/spaces-and-touching-input.mmd](../tests/fixtures/requirement/relationship-spacing/spaces-and-touching-input.mmd)):

```mmd
requirementDiagram
a-satisfies->b
a  -  satisfies  ->  b
b<-satisfies-a
b  <-  copies  -  a
```

出力 ([relationship-spacing/spaces-and-touching-output.mmd](../tests/fixtures/requirement/relationship-spacing/spaces-and-touching-output.mmd)):

```mmd
requirementDiagram
  a - satisfies -> b
  a - satisfies -> b
  b <- satisfies - a
  b <- copies - a
```

入力 ([relationship-spacing/directive-between-units-kept-input.mmd](../tests/fixtures/requirement/relationship-spacing/directive-between-units-kept-input.mmd)):

```mmd
requirementDiagram
a -%%{init: {}}%%satisfies  ->  b
a  %%{init: {}}%% - contains -> b
```

出力 ([relationship-spacing/directive-between-units-kept-output.mmd](../tests/fixtures/requirement/relationship-spacing/directive-between-units-kept-output.mmd)):

```mmd
requirementDiagram
  a -%%{init: {}}%%satisfies -> b
  a %%{init: {}}%% - contains -> b
```

### クラスの並び

requirement、element、名前とクラスだけの文で、`:::` の後に書くクラスは、
`:::` に接し、クラスを区切る `,` は両側のクラスに接します。
`requirement r ::: a , b {` は `requirement r:::a,b {` と印字します。
これは ER 図のクラスと同じで、
mermaid.js の文書の書き方でもあります。 [fixture: class-lists/in-requirement-and-element]
[fixture: class-lists/shorthand]
クラスは、文字列か、語の間に空白を持てる引用符のない文字列です。
その空白はクラスの一部です。 [fixture: class-lists/string-classes]
[fixture: class-lists/classes-with-spaces]
各部の間のディレクティブは、
その場に残します。 [fixture: class-lists/directive-between-parts-kept]

入力 ([class-lists/in-requirement-and-element-input.mmd](../tests/fixtures/requirement/class-lists/in-requirement-and-element-input.mmd)):

```mmd
requirementDiagram
requirement r ::: a , b {
id: 1
}
element e:::c{
}
requirement s:::a,b,c {
}
```

出力 ([class-lists/in-requirement-and-element-output.mmd](../tests/fixtures/requirement/class-lists/in-requirement-and-element-output.mmd)):

```mmd
requirementDiagram
  requirement r:::a,b {
    id: 1
  }
  element e:::c {
  }
  requirement s:::a,b,c {
  }
```

入力 ([class-lists/string-classes-input.mmd](../tests/fixtures/requirement/class-lists/string-classes-input.mmd)):

```mmd
requirementDiagram
requirement r:::"a b" , "c" {
}
r ::: "d"
```

出力 ([class-lists/string-classes-output.mmd](../tests/fixtures/requirement/class-lists/string-classes-output.mmd)):

```mmd
requirementDiagram
  requirement r:::"a b","c" {
  }
  r:::"d"
```

### スタイルとクラス

`classDef` 文の名前と、`style` 文と `class` 文の名前とクラスは、
両側の名前に接する `,` で区切ります。
`classDef a ,b ,  c fill:red` は `classDef a,b,c fill:red` と印字します。 [fixture: styles-and-classes/class-def-names]
[fixture: styles-and-classes/style-names]
[fixture: styles-and-classes/class-lists]
最初のスタイルは空白 1 つの後に置き、
`class` 文の 2 つのリストは空白 1 つで区切ります。
スタイルの中の空白は書かれたまま印字します。
mermaid.js はスタイルのテキストをつなげて間の空白を落とすので、
`stroke-dasharray: 5 5` はスタイル `stroke-dasharray:55` であり、
空白は作者が置いた所に残します。
2 つのスタイルの間の `,` の周りの空白は、
トークンの間の空白と同じに 1 つにします。 [fixture: styles-and-classes/styles-as-written]
文の末尾の空白は落とします。
style の文脈は、
改行を文の終わりとして読むからです。 [fixture: styles-and-classes/trailing-whitespace-dropped]
キーワードは書かれた大文字小文字のまま残します。 [fixture: styles-and-classes/keyword-case-kept]

スタイルの末尾の `;` は、スタイルの文字か、
mermaid.js の行の規則が無視する `;` です（diagrams/requirement.md、 The style
context と Comments）。
最後のスタイルとの間に書かれたものも含め、
書かれたまま残します。 [fixture: styles-and-classes/ending-semicolon-kept]
[fixture: styles-and-classes/ignored-semicolon-kept]

`class` 文は、途中で改行して続けられます。
改行の前の名前は style の文脈で読まれ、
引用符のない名前は `style-word` です（diagrams/requirement.md、 The style
context、規則 1）。
改行の後の名前は文の文脈で読まれ、
引用符のない名前は空白やほかの文字を含められます。
最初の改行の後の名前がすべて、
文字列か `style-word` として読める引用符のない名前のときは、文を 1 行にします。
そのような名前は、
1 行にしても字句解析器が同じに読みます。 [fixture: styles-and-classes/class-over-lines-joined]
それ以外のときは改行を残し、
続きの行は 1 段深く置きます。 [fixture: styles-and-classes/class-over-lines-kept]
コメント行を含む文は、
書かれたまま残します。 [fixture: styles-and-classes/class-over-lines-with-comment-line-kept]

入力 ([styles-and-classes/class-def-names-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-def-names-input.mmd)):

```mmd
requirementDiagram
classDef a ,b ,  c fill:red
classDef default fill:#f9f,stroke-width:4px
classDef "d" fill:red
```

出力 ([styles-and-classes/class-def-names-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-def-names-output.mmd)):

```mmd
requirementDiagram
  classDef a,b,c fill:red
  classDef default fill:#f9f,stroke-width:4px
  classDef "d" fill:red
```

入力 ([styles-and-classes/styles-as-written-input.mmd](../tests/fixtures/requirement/styles-and-classes/styles-as-written-input.mmd)):

```mmd
requirementDiagram
style r fill : #f9f , stroke:#333
style r stroke-dasharray: 5 5
style r fill:red   ,   stroke:blue
style r   fill: red;
```

出力 ([styles-and-classes/styles-as-written-output.mmd](../tests/fixtures/requirement/styles-and-classes/styles-as-written-output.mmd)):

```mmd
requirementDiagram
  style r fill : #f9f , stroke:#333
  style r stroke-dasharray: 5 5
  style r fill:red , stroke:blue
  style r fill: red;
```

入力 ([styles-and-classes/class-over-lines-joined-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-joined-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
class r
c
class r c
,d
class r
c,d
class r c ,
d
```

出力 ([styles-and-classes/class-over-lines-joined-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-joined-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  class r c
  class r c,d
  class r c,d
  class r c,d
```

入力 ([styles-and-classes/class-over-lines-kept-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-kept-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
class r
c d
class r
c.d
class r
c#d
```

出力 ([styles-and-classes/class-over-lines-kept-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-kept-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  class r
    c d
  class r
    c.d
  class r
    c#d
```

### 方向

方向の行は、`direction` とその値、
その前後にある mermaid.js が読まないテキストからなります。
テキストは書かれたまま残します。
テキストと `direction` の間は、離れて書かれていれば空白 1 つ、
`direction` と値の間も空白 1 つにし、
値は書かれた大文字小文字のまま残します。 [fixture: direction/spacing]
[fixture: direction/spaces-around]
[fixture: direction/text-kept]
[fixture: direction/case-kept]
次の行に書かれた値は、
`direction` の後ろに寄せて 1 行にします。 [fixture: direction/value-on-next-line-joined]
ディレクティブやコメント行を含む方向の行は、
書かれたまま残します。 [fixture: direction/directive-and-comment-line-kept]
字句解析器の方向の行の規則は行全体を取るので、 `direction LR` で終わる関係文は、
前にテキストを持つ方向の行です。 [fixture: direction/after-relationship]

入力 ([direction/text-kept-input.mmd](../tests/fixtures/requirement/direction/text-kept-input.mmd)):

```mmd
requirementDiagram
x   direction  RL   y  z
foo direction LR %% c
direction LR;
direction LRX
```

出力 ([direction/text-kept-output.mmd](../tests/fixtures/requirement/direction/text-kept-output.mmd)):

```mmd
requirementDiagram
  x direction RL y  z
  foo direction LR %% c
  direction LR;
  direction LRX
```

入力 ([direction/case-kept-input.mmd](../tests/fixtures/requirement/direction/case-kept-input.mmd)):

```mmd
requirementDiagram
DIRECTION lr
Direction Tb
```

出力 ([direction/case-kept-output.mmd](../tests/fixtures/requirement/direction/case-kept-output.mmd)):

```mmd
requirementDiagram
  DIRECTION lr
  Direction Tb
```

### 1 行に 1 文

requirement の図には文を区切るものがなく、
mermaid.js は同じ行に続く文を読みます。
各文は 1 行に 1 つ置きます。
1 行に 2 つの文があると読みにくく、ほかの図種も 1 行に 1 つの文を印字します。
`}` の後ろの文、
ヘッダーの後ろや `}` か文字列で終わる文の後ろの空の説明ブロック、
`style`・`classDef`・`class` 文の行末の文字列が始める文が、
それぞれの行に移ります。 [fixture: statements-one-per-line/header-then-empty-description-block]
[fixture: statements-one-per-line/after-closing-brace]
[fixture: statements-one-per-line/after-string-name]
[fixture: statements-one-per-line/empty-description-blocks]
2 つの文の間のディレクティブは、
後ろの文と一緒に動きます。 [fixture: statements-one-per-line/directive-after-statement]

`style`・`classDef`・`class` 文の後も字句解析器は style の文脈にあるので、
その行の文字列が次の文を始め、その後の改行は `newline` ではなく、
その文を続けます。
`style r fill:red "r"` と、次の行の `:::c` は、r にクラス c を与えます。
この文は、各部を 1 行にして、
自分の行に置きます。 [fixture: statements-one-per-line/string-continued-after-styles]
このような文がコメント行やディレクティブを含むときは、1 行にできないので、
前の文の行に残します。
`;` を含む行にあるときも同じで、その行は文を一緒に残すからです（下を参照）。
その行を、最初の文から 2 つ目の文の終わりまで、
書かれたまま印字します。 [fixture: statements-one-per-line/continued-with-comment-line-kept]
[fixture: statements-one-per-line/continued-with-directive-kept]
[fixture: statements-one-per-line/continued-on-semicolon-line-kept]
[fixture: statements-one-per-line/continued-on-ignored-semicolon-line-kept]

`;` を含む行は、その行の文をそのまま一緒に残します。
mermaid.js の行の規則は、`style`、その後の `:`、
その後の `#` を含む行の最後の `;` を取り除くので、文を別の行に移すと、
規則が `;` を無視しなくなったり、別の `;` を無視したりするからです。
`a - satisfies -> "style:#x" accDescr {} e - satisfies -> f;g` では、
2 つ目の関係の右は `fg` ですが、 `f;g` が単独の行にあると、右は `f;g` です。
そのため、そのような行の文は同じ行に残し、文の間の空白はほかと同じに整形し、
`;` は書かれたまま残します。 [fixture: statements-one-per-line/semicolon-line-kept]
[fixture: statements-one-per-line/ignored-semicolon-line-kept]

入力 ([statements-one-per-line/header-then-empty-description-block-input.mmd](../tests/fixtures/requirement/statements-one-per-line/header-then-empty-description-block-input.mmd)):

```mmd
requirementDiagram accDescr {}
requirement r {
id: 1
}
```

出力 ([statements-one-per-line/header-then-empty-description-block-output.mmd](../tests/fixtures/requirement/statements-one-per-line/header-then-empty-description-block-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
```

入力 ([statements-one-per-line/string-continued-after-styles-input.mmd](../tests/fixtures/requirement/statements-one-per-line/string-continued-after-styles-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
style r fill:red "r"
:::c
classDef c fill:red "r"
:::c
class r c "r"
- satisfies -> b
class r c "r"
:::d
```

出力 ([statements-one-per-line/string-continued-after-styles-output.mmd](../tests/fixtures/requirement/statements-one-per-line/string-continued-after-styles-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  style r fill:red
  "r":::c
  classDef c fill:red
  "r":::c
  class r c
  "r" - satisfies -> b
  class r c
  "r":::d
```

入力 ([statements-one-per-line/semicolon-line-kept-input.mmd](../tests/fixtures/requirement/statements-one-per-line/semicolon-line-kept-input.mmd)):

```mmd
requirementDiagram
a - satisfies -> "style:#x" accDescr {}   e - satisfies -> f;g
```

出力 ([statements-one-per-line/semicolon-line-kept-output.mmd](../tests/fixtures/requirement/statements-one-per-line/semicolon-line-kept-output.mmd)):

```mmd
requirementDiagram
  a - satisfies -> "style:#x" accDescr {} e - satisfies -> f;g
```

### 空行

連続する空行は 1 つにし、図の先頭と末尾、本体の先頭と末尾の空行は落とします。
他の図種と同じ規則です。 [fixture: blank-lines/collapsed]
[fixture: blank-lines/between-fields-collapsed]
[fixture: blank-lines/header-and-end-of-text-dropped]
[fixture: blank-lines/body-edges-dropped]
コメント行とディレクティブの行の前後の空行も、
同じに扱います。 [fixture: blank-lines/around-comment-and-directive-lines]

入力 ([blank-lines/collapsed-input.mmd](../tests/fixtures/requirement/blank-lines/collapsed-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}



element e {
}


a - satisfies -> b
```

出力 ([blank-lines/collapsed-output.mmd](../tests/fixtures/requirement/blank-lines/collapsed-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }

  element e {
  }

  a - satisfies -> b
```

入力 ([blank-lines/between-fields-collapsed-input.mmd](../tests/fixtures/requirement/blank-lines/between-fields-collapsed-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1



text: t
}
```

出力 ([blank-lines/between-fields-collapsed-output.mmd](../tests/fixtures/requirement/blank-lines/between-fields-collapsed-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1

    text: t
  }
```

### 空の説明ブロック

空のブロック `accDescr {}` は何も変えません。
文の始まる所では独立した文で、
requirement と element の本体の行では本体の項目です。
`{` の直後、フィールドの前、文字列かキーワードの値の後、`}` の前、
単独の行にあるものがそうです。
どれも自分の行に置きます。
ER 図が mermaid.js の読まないテキストをブロックの中の自分の行に置き、
本体のフィールドが 1 行に 1 つなのと同じです。 [fixture: empty-description-blocks/as-statement]
[fixture: empty-description-blocks/after-header]
[fixture: empty-description-blocks/in-body-own-lines]
[fixture: empty-description-blocks/in-body-before-closing-brace]
[fixture: empty-description-blocks/in-body-alone]

内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
接した keyword は接したまま、
`accDescr{  }` は `accDescr{}` にします。 [fixture: empty-description-blocks/empty-whitespace-interiors]
[test: requirement Unicode and tab interiors]
[test: requirement body Unicode and tab interiors]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/inner-whitespace-joined]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/in-body-over-lines-joined]
ディレクティブかコメント行を含むブロックは、
書かれたまま印字します。 [fixture: empty-description-blocks/with-directive-or-comment-line-kept]
[fixture: empty-description-blocks/in-body-with-comment-line-kept]
[fixture: empty-description-blocks/in-body-with-directive-kept]

入力 ([empty-description-blocks/in-body-own-lines-input.mmd](../tests/fixtures/requirement/empty-description-blocks/in-body-own-lines-input.mmd)):

```mmd
requirementDiagram
requirement r { accDescr {}
id: "1" accDescr {}
accDescr {} text: t
risk: low accDescr {   }
}
```

出力 ([empty-description-blocks/in-body-own-lines-output.mmd](../tests/fixtures/requirement/empty-description-blocks/in-body-own-lines-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    accDescr {}
    id: "1"
    accDescr {}
    accDescr {}
    text: t
    risk: low
    accDescr {}
  }
```

入力 ([empty-description-blocks/inner-whitespace-joined-input.mmd](../tests/fixtures/requirement/empty-description-blocks/inner-whitespace-joined-input.mmd)):

```mmd
requirementDiagram
accDescr {     }
accDescr {


}
accDescr   {}
```

出力 ([empty-description-blocks/inner-whitespace-joined-output.mmd](../tests/fixtures/requirement/empty-description-blocks/inner-whitespace-joined-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  accDescr {}
  accDescr {}
```

### アクセシビリティの文

`accTitle` と `accDescr` の `:` はキーワードに接し、後ろに空白 1 つを置きます。
テキストの両端の空白は落とし、
中の空白はテキストの一部なので残します。 [fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/title-and-description]
[fixture: accessibility-statements/inner-whitespace-kept]
テキストの中の `;`、`#`、
`%%` は文字です。 [fixture: accessibility-statements/special-characters-in-text]
後の行に書かれたテキストは、`:` の後ろに寄せて 1 行にします。
その前にコメント行があるときは、
文を書かれたまま残します。 [fixture: accessibility-statements/text-on-next-line-joined]
[fixture: accessibility-statements/text-with-comment-line-kept]

`accDescr { ... }` ブロックの行は、必要からではなく選択として、
書かれたまま残します。
行頭の空白は Db に入らず、 `a`、改行、`b` と、
`b` の前に空白がある形は同じ説明です。
行は作者のテキストで、印字は整形しないからです。
`}` は文と同じ段に置きます。
`{` と同じ行にテキストがあるときは、
離れて書かれていれば波括弧の内側に空白 1 つを置きます。 [fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-text-on-opening-line]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]

字句解析器は、続く文の規則より前に、
`accTitle` と `accDescr` の後に方向の行を読みます。
1 桁目の `accTitle: direction LR` はタイトルで、字下げすると、
`direction` の前にテキスト `accTitle:` を持つ方向の行です。
そのため、`accTitle`、`accDescr:`、`accDescr {` の文で、
印字する最初の行に `direction` と、1 つ以上の空白と、`TB`、`BT`、`RL`、
`LR` のどれか（大文字小文字は問わない）があるものは、1 桁目を保ちます。
行は、
ディレクティブとコメント行を除いて字句解析器が読むとおりに判断します。 [fixture: accessibility-statements/first-column-kept]
そのような方向を含まない行は、
ほかの文と同じに字下げします。 [fixture: accessibility-statements/first-column-not-needed]

入力 ([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/requirement/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
requirementDiagram
accTitle : My title
accDescr:My description
ACCTITLE :T
```

出力 ([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/requirement/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
requirementDiagram
  accTitle: My title
  accDescr: My description
  ACCTITLE: T
```

入力 ([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/requirement/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
requirementDiagram
accDescr {
  first
    second
}
accDescr {
}
```

出力 ([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/requirement/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
requirementDiagram
  accDescr {
  first
    second
  }
  accDescr {}
```

入力 ([accessibility-statements/first-column-kept-input.mmd](../tests/fixtures/requirement/accessibility-statements/first-column-kept-input.mmd)):

```mmd
requirementDiagram
accTitle: direction LR
accDescr: direction  TB
accDescr { direction RL }
accDescr {
 direction BT
}
```

出力 ([accessibility-statements/first-column-kept-output.mmd](../tests/fixtures/requirement/accessibility-statements/first-column-kept-output.mmd)):

```mmd
requirementDiagram
accTitle: direction LR
accDescr: direction  TB
accDescr { direction RL }
  accDescr {
 direction BT
  }
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、
字句解析器が改行を空白として読む所で 1 行にして印字します。
空白の後の改行は空白です。
requirement のキーワードと名前の間、関係文の単位の間、フィールドの `:` の前後、
`accTitle` と `accDescr` の `:` の前後、 `direction` と値の間が、
それにあたります。
`style`・`classDef`・`class` 文の行末の文字列が始める文は、
style の文脈の改行の後で続きます。 [fixture: multi-line-statements/kind-and-name-joined]
[fixture: multi-line-statements/relationship-joined]
[fixture: multi-line-statements/direction-value-joined]
[fixture: multi-line-statements/accessibility-joined]
[fixture: multi-line-statements/string-continued-joined]
コメント行かディレクティブを含む文は、コメント行がその行の残りを取り、
ディレクティブのある行の空白はディレクティブと一緒に読まれるので、
書かれたまま残します。
`;` を含む文も、行の規則が決めるので、
書かれたまま残します。 [fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/semicolon-kept]

最後の行に、後ろの文の `;` がある文も、書かれたまま残します。
1 行にした行を、行の規則が行全体として読むからです。
`"style:#q" - satisfies` と、改行の後の `-> "b" e - satisfies -> f;g` では、
2 つ目の関係の右は `f;g` ですが、
1 行にした `"style:#q" - satisfies -> "b" e - satisfies -> f;g` では `fg` になります。
その行の文は、
その行に残します。 [fixture: multi-line-statements/relationship-last-line-semicolon-kept]
[fixture: multi-line-statements/class-last-line-semicolon-kept]
[fixture: multi-line-statements/string-continued-last-line-semicolon-kept]
文の最初の行にある、前の文の `;` は、規則にとって何も変えないので、
文は 1 行にします。 [fixture: multi-line-statements/relationship-first-line-semicolon-joined]
[fixture: multi-line-statements/class-first-line-semicolon-joined]
[fixture: multi-line-statements/accessibility-first-line-semicolon-joined]

入力 ([multi-line-statements/string-continued-joined-input.mmd](../tests/fixtures/requirement/multi-line-statements/string-continued-joined-input.mmd)):

```mmd
requirementDiagram
style r fill:red "r"
:::c
class r c "r"
- satisfies -> b
```

出力 ([multi-line-statements/string-continued-joined-output.mmd](../tests/fixtures/requirement/multi-line-statements/string-continued-joined-output.mmd)):

```mmd
requirementDiagram
  style r fill:red
  "r":::c
  class r c
  "r" - satisfies -> b
```

入力 ([multi-line-statements/accessibility-joined-input.mmd](../tests/fixtures/requirement/multi-line-statements/accessibility-joined-input.mmd)):

```mmd
requirementDiagram
accTitle:
T
accDescr
: D
```

出力 ([multi-line-statements/accessibility-joined-output.mmd](../tests/fixtures/requirement/multi-line-statements/accessibility-joined-output.mmd)):

```mmd
requirementDiagram
  accTitle: T
  accDescr: D
```

### トークンの間の空白

上のどの規則も当てはまらない所では、
文の中の 2 つのトークンの間の空白は 1 つの空白にし、
接しているトークンは接したままにします。
空の説明ブロックの波括弧がそうです。 [fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/touching-kept]
行末の空白は落とします。 [fixture: whitespace-between-tokens/trailing-whitespace-dropped]

入力 ([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/requirement/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
requirementDiagram
accDescr   {   }
requirement r {
id: 1
}
style   r   fill:red
class   r   c
```

出力 ([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/requirement/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
  style r fill:red
  class r c
```

入力 ([whitespace-between-tokens/touching-kept-input.mmd](../tests/fixtures/requirement/whitespace-between-tokens/touching-kept-input.mmd)):

```mmd
requirementDiagram
accDescr{}
accDescr{ }
accDescr {}
```

出力 ([whitespace-between-tokens/touching-kept-output.mmd](../tests/fixtures/requirement/whitespace-between-tokens/touching-kept-output.mmd)):

```mmd
requirementDiagram
  accDescr{}
  accDescr{}
  accDescr {}
```

### キーワードの大文字小文字

キーワードは、書かれた大文字小文字のまま残します。
mermaid.js はどの大文字小文字でも読み、Db は同じです。
大文字小文字は強制されないので、作者が選んだものとして、
書き換えません。 [fixture: keyword-case/keywords-kept]
ヘッダーは、
小文字の `requirement` で始まるときだけ検出されます（diagrams/requirement.md、
Detection）。

入力 ([keyword-case/keywords-kept-input.mmd](../tests/fixtures/requirement/keyword-case/keywords-kept-input.mmd)):

```mmd
requirementdiagram
REQUIREMENT r {
ID: 1
RISK: HIGH
}
ELEMENT e {
}
r - SATISFIES -> e
DIRECTION lr
STYLE r fill:red
```

出力 ([keyword-case/keywords-kept-output.mmd](../tests/fixtures/requirement/keyword-case/keywords-kept-output.mmd)):

```mmd
requirementdiagram
  REQUIREMENT r {
    ID: 1
    RISK: HIGH
  }
  ELEMENT e {
  }
  r - SATISFIES -> e
  DIRECTION lr
  STYLE r fill:red
```

### コメント

コメントは、単位の始まる所の `%%`、`#`、`%` で始まり、行末まで続きます。
単独の行のコメントは、後ろの文と同じ段に置き、
本体の中ではフィールドと同じ段に置きます。
テキストと印は書かれたまま残します。 [fixture: comments/lines-at-statement-level]
[fixture: comments/single-mark-lines-kept]
ヘッダーの前のコメント行は 1 桁目に置き、
本体の末尾とテキストの末尾のコメント行は、
単独の行に残します。 [fixture: comments/before-header]
[fixture: comments/last-in-body]

ヘッダーの後ろ、本体の `{` と `}` の後ろ、キーワードか文字列の値の後ろ、
文字列の名前かクラスの後ろのコメントは、その行に書かれたまま残します。
空白が書かれていれば空白 1 つを置き、
接していれば接したままにします。 [fixture: comments/after-header]
[fixture: comments/after-header-glued]
[fixture: comments/after-opening-brace]
[fixture: comments/after-closing-brace]
[fixture: comments/after-keyword-and-string-values]
[fixture: comments/after-string-name]
引用符のない名前や値の後ろの `#` と `%` はテキストの文字で、
方向の値の後ろのものは mermaid.js が読まないテキストです。
どちらもそのまま残します。 [fixture: comments/in-unquoted-text-is-text]
[fixture: comments/after-direction-is-text]
アクセシビリティのテキストと文字列の中の `%%` は、
テキストの文字です。 [fixture: comments/percent-in-values-kept]

ディレクティブでない `%%{` で始まるコメント行は、
requirement の図では mermaid.js がどの字下げでも読むので、
特別な字下げは保ちません。 [fixture: comments/percent-brace-lines]

入力 ([comments/lines-at-statement-level-input.mmd](../tests/fixtures/requirement/comments/lines-at-statement-level-input.mmd)):

```mmd
requirementDiagram
%% c1
requirement r {
      %% c2
id: 1
%% c3
}
   %% c4
element e {
}
```

出力 ([comments/lines-at-statement-level-output.mmd](../tests/fixtures/requirement/comments/lines-at-statement-level-output.mmd)):

```mmd
requirementDiagram
  %% c1
  requirement r {
    %% c2
    id: 1
    %% c3
  }
  %% c4
  element e {
  }
```

入力 ([comments/after-keyword-and-string-values-input.mmd](../tests/fixtures/requirement/comments/after-keyword-and-string-values-input.mmd)):

```mmd
requirementDiagram
requirement r {
risk: low %c
verifyMethod: test#c
id: "1" #c
text: "t"%c
}
```

出力 ([comments/after-keyword-and-string-values-output.mmd](../tests/fixtures/requirement/comments/after-keyword-and-string-values-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    risk: low %c
    verifyMethod: test#c
    id: "1" #c
    text: "t"%c
  }
```

入力 ([comments/in-unquoted-text-is-text-input.mmd](../tests/fixtures/requirement/comments/in-unquoted-text-is-text-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1 #c
text: a %c
}
a - satisfies -> b #c
```

出力 ([comments/in-unquoted-text-is-text-output.mmd](../tests/fixtures/requirement/comments/in-unquoted-text-is-text-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1 #c
    text: a %c
  }
  a - satisfies -> b #c
```

### ディレクティブ

単独の行のディレクティブは、周りの文と同じ段に置き、
本体の中ではフィールドと同じ段に置きます。
文の行にあるディレクティブは、両側に空白が書かれているかを残します。
あれば空白 1 つを置き、
トークンに接していれば接したままにします。 [fixture: directives/kept]
[fixture: directives/in-body]
[fixture: directives/before-header]
[fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides-collapsed]
[fixture: directives/after-statement-at-end-of-line]

文の 2 つの単位の間のディレクティブは、その場に残し、
両側に書かれた空白も残します。
テキストの中のディレクティブは、
テキストの一部です。 [fixture: directives/between-units-kept]
[fixture: directives/inside-values-kept]
閉じられていないディレクティブはテキストの残りを取り、
書かれたまま残します。 [fixture: directives/unclosed-at-end-of-text-kept]
[fixture: directives/unclosed-after-statement-kept]

入力 ([directives/kept-input.mmd](../tests/fixtures/requirement/directives/kept-input.mmd)):

```mmd
requirementDiagram
%%{init: {'theme': 'dark'}}%%
requirement r {
id: 1
}
    %%{wrap}%%
element e {
}
```

出力 ([directives/kept-output.mmd](../tests/fixtures/requirement/directives/kept-output.mmd)):

```mmd
requirementDiagram
  %%{init: {'theme': 'dark'}}%%
  requirement r {
    id: 1
  }
  %%{wrap}%%
  element e {
  }
```

入力 ([directives/between-units-kept-input.mmd](../tests/fixtures/requirement/directives/between-units-kept-input.mmd)):

```mmd
requirementDiagram
a -%%{init: {}}%% satisfies -> b
requirement r%%{init: {}}%%{
id:%%{init: {}}%% 1
}
```

出力 ([directives/between-units-kept-output.mmd](../tests/fixtures/requirement/directives/between-units-kept-output.mmd)):

```mmd
requirementDiagram
  a -%%{init: {}}%% satisfies -> b
  requirement r%%{init: {}}%%{
    id:%%{init: {}}%% 1
  }
```

### フロントマターの YAML

フローチャートと同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整形し、 `---` の行は、
行末の空白とタブも含め、
書かれたまま残します。 [fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
Prettier が YAML を読めないときは、
書かれたまま残します。 [fixture: frontmatter-yaml/malformed-kept]
フロントマターとヘッダーの間のコメント行は残します。 [fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力 ([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/requirement/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    theme:   dark
---
requirementDiagram
requirement r {
id: 1
}
```

出力 ([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/requirement/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  theme: dark
---
requirementDiagram
  requirement r {
    id: 1
  }
```

### 行区切り文字

U+2028 と U+2029 は、requirement の図の単位の間の空白であり、名前、値、
文字列の文字でもあります。
文の間では、どの空白とも同じ改行として扱い、文はそれぞれの行に移ります。
文の中で、これを含む間隔は書かれたまま印字し、名前、クラス、値、
アクセシビリティのテキストの中のものも書かれたまま残します。
例は文字列で書かれていて、`\u2028` は U+2028、
`\n` は改行です。 [test: U+2028 after the closing brace of a body]
[test: U+2028 inside a name]
[test: U+2028 inside a class]
[test: U+2028 after the keyword of a requirement]
[test: U+2028 inside a value]
[test: U+2029 inside a string]
[test: U+2028 before the colon of a field]
[test: U+2028 before the arrow of a relationship]
[test: U+2028 after the name of a relationship]
[test: U+2028 between direction and its value]
[test: U+2028 after the colon of accTitle]
[test: U+2028 inside an accessibility text]

### 空白の文字

U+00A0 と U+FEFF は、字句解析器にとって単位の間の空白であり、
名前や値の文字でもあります。
字句解析器が単位の間の空白を読む所には空白 1 つを置き、
名前や値の中のものはテキストの文字なので残します。
例は文字列で書かれていて、`\u00a0` は U+00A0、
`\ufeff` は U+FEFF です。 [test: U+00A0 around the name of a requirement]
[test: U+00A0 around the value of a field]
[test: U+00A0 around the colon of a field]
[test: U+00A0 around the units of a relationship]
[test: U+00A0 around the comma of a list of classes]
[test: U+00A0 inside a name]
[test: U+00A0 inside a value]
[test: U+00A0 between direction and its value]
[test: U+00A0 after the closing brace of a body]
[test: U+FEFF before the opening brace]
[test: U+FEFF before a statement]

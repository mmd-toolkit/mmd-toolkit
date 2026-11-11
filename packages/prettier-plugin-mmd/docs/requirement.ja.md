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
1 行に 1 つ置き、本体を閉じる `}` は、その行と同じ段に、行に単独で置きます。
[fixture: indentation/statements-and-bodies]
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、既定は空白 2 つです。
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]
入力に書かれたインデントは残しません。
行頭の空白は mermaid.js にとって無だからです。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。
[fixture: indentation/written-indentation-dropped]
ヘッダーは、前に空白が書かれていても 1 桁目に置きます。
[fixture: indentation/header-leading-whitespace]
書かれたまま残すテキスト（`accDescr` ブロックの行など）は、行ごとの桁を保ち、
ブロックを閉じる `}` は文と同じ段に置きます。
[fixture: indentation/description-block-lines-kept]
例外は、方向を含む `accTitle` と `accDescr` の文で、
1 桁目を保ちます（[アクセシビリティの文](#アクセシビリティの文)を参照）。

入力
([indentation/statements-and-bodies-input.mmd](../tests/fixtures/requirement/indentation/statements-and-bodies-input.mmd)):

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

出力
([indentation/statements-and-bodies-output.mmd](../tests/fixtures/requirement/indentation/statements-and-bodies-output.mmd)):

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
  style r fill: red
```

入力
([indentation/tab-width-4-input.mmd](../tests/fixtures/requirement/indentation/tab-width-4-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
r - satisfies -> r
```

出力
([indentation/tab-width-4-output.mmd](../tests/fixtures/requirement/indentation/tab-width-4-output.mmd)):

```mmd
requirementDiagram
    requirement r {
        id: 1
    }
    r - satisfies -> r
```

### 本体

trivia を挟んで見出しが続く場合、開始括弧のある行を最初のキーワードにそろえ、
本文がさらに 1 段深く見えるようにします。
その行をまたぐ値や保護された原文の境界は変えません。
[fixture: bodies/header-completion-after-comment]
[fixture: multi-line-statements/header-directive-continuation]

requirement と element の `{` は、種類のキーワード、名前、クラスの行に、
空白 1 つの後に置きます。
フィールドは次の行から 1 行に 1 つ置き、`}` は行に単独で置きます。
コメントかディレクティブを含むヘッダーは改行を残し、
構造の続きの行をキーワードより 1 段深く置きます。
[fixture: multi-line-statements/header-directive-continuation]
`{` の前の空白 1 つは、ER の属性ブロックと同じで、
mermaid.js の文書の書き方でもあります。
引用符のない名前では空白がどのみち要るので、文の形は 1 つになります。
[fixture: bodies/opening-brace-after-one-space]
requirement の種類のキーワードは 6 つあり、
mermaid.js の文書の例が使う大文字小文字で印字します。
`FUNCTIONALREQUIREMENT` は `functionalRequirement` にします。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
[fixture: bodies/kinds] [fixture: keyword-case/types-one-form]
`}` の後ろに同じ行で続く文は、それぞれの行に移します。
[fixture: bodies/statement-after-closing-brace]
[fixture: statements-one-per-line/closing-brace-then-statement]

mermaid.js は `{` の後に改行を要するので、
フィールドのない本体は `{` と `}` を 2 行に置き、間の空行は落とします。
[fixture: bodies/empty-body-on-two-lines]
本体の先頭と末尾の空行も落とします（[空行](#空行)を参照）。
[fixture: bodies/blank-lines-at-edges-dropped]

入力
([bodies/empty-body-on-two-lines-input.mmd](../tests/fixtures/requirement/bodies/empty-body-on-two-lines-input.mmd)):

```mmd
requirementDiagram
requirement r {
}
element e {


}
requirement s {

}
```

出力
([bodies/empty-body-on-two-lines-output.mmd](../tests/fixtures/requirement/bodies/empty-body-on-two-lines-output.mmd)):

```mmd
requirementDiagram
  requirement r {
  }
  element e {
  }
  requirement s {
  }
```

入力
([bodies/statement-after-closing-brace-input.mmd](../tests/fixtures/requirement/bodies/statement-after-closing-brace-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
} element e {
type: t
} r - satisfies -> e
```

出力
([bodies/statement-after-closing-brace-output.mmd](../tests/fixtures/requirement/bodies/statement-after-closing-brace-output.mmd)):

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
mermaid.js の文書がフィールドをそう書き、journey も値の前に空白 1 つを置きます。
コメントかディレクティブがあれば改行を残し、
構造の続きの行と間の注釈をフィールドより 1 段深く置きます。
[fixture: fields/comment-and-directive-continuations]
[fixture: fields/colon-touches-keyword]
[fixture: fields/spaces-around-colon-and-value]
[fixture: fields/value-after-one-space]
引用符のない値の両端の空白は Db に入らないので落とします。
値の中や文字列の引用符の間の空白とタブの連なりは Db に入りますが、
空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
[fixture: fields/value-outer-whitespace-dropped]
[fixture: fields/value-inner-runs-collapsed]
[fixture: fields/string-values-runs-collapsed]
引用符で囲まれた `id`、`text`、`type`、`docRef` の値が、英字、数字、
`_` からなる語を空白で区切ったもので、最初の語が図のキーワードでなければ、
引用符なしで印字します。
`text: "the test text"` は `text: the test text` と印字し、
`text: "risk high"` は引用符を残します。
値は印字される形で判定するので、
文字の間にタブがある `text: "a b"` は `text: a b` と印字しますが、
図に `white-space` がある場合は値の連なりを保つので、引用符も残します。
[fixture: fields/plain-values-without-quotes]
[fixture: fields/string-values-tabs-collapsed]
[fixture: fields/string-values-tabs-kept-with-white-space]
引用符のない値の中の `#`、`%`、`;` は値の文字で、
コメントの始まりではありません。 [fixture: fields/special-characters-in-values]

フィールドは書かれた順に置きます。
同じフィールドが 2 回書かれていても同じで、mermaid.js は最初のものを読みます。
[fixture: fields/order-kept] [fixture: fields/same-field-twice]
フィールド、risk、verifyMethod の値のキーワードは、
mermaid.js の文書の例が使う大文字小文字で印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
mermaid.js はどの大文字小文字でも読み、Db は同じです。
[fixture: fields/field-keywords-case-one-form]
[fixture: fields/keyword-values-case-one-form]
[fixture: fields/keyword-values-low-test-analysis-case-one-form]
複数行に書かれたフィールドは、
字句解析器が改行を空白として読む所で 1 行にします。
空白の後の改行がそうです（[複数行の文](#複数行の文)を参照）。
[fixture: fields/over-lines-joined]

入力
([fields/spaces-around-colon-and-value-input.mmd](../tests/fixtures/requirement/fields/spaces-around-colon-and-value-input.mmd)):

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

出力
([fields/spaces-around-colon-and-value-output.mmd](../tests/fixtures/requirement/fields/spaces-around-colon-and-value-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: the test text.
    risk: high
    verifymethod: inspection
  }
  element e {
    type: t
    docRef: d
  }
```

入力
([fields/string-values-runs-collapsed-input.mmd](../tests/fixtures/requirement/fields/string-values-runs-collapsed-input.mmd)):

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

出力
([fields/string-values-runs-collapsed-output.mmd](../tests/fixtures/requirement/fields/string-values-runs-collapsed-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: " a: b, c "
  }
  element e {
    type: a b
    docRef: "http://x.test/a-b"
  }
```

### 名前

引用符で囲まれた名前が平易な 1 語なら、引用符なしで印字します。
mermaid.js は `"r"` と `r` を同じ名前として読み、
その文書の例は名前を引用符なしで書いています。
（[テキストの引用符](./compatibility.ja.md#テキストの引用符)を参照）。
図のキーワードである名前や、`-` など、英字、数字、`_` 以外の文字を含む名前は、
引用符を残します。
`direction` で終わる名前と、`TB`、`BT`、`RL`、`LR` で始まる名前も、
大文字小文字を問わず引用符を残します。
字句解析器は、`direction`、空白（改行も含みます）、向きの名前を 1 行として読み、
引用符を外した名前は、前の行か後の行と結ばれるためです。
[fixture: names/plain-names-without-quotes]
[fixture: names/names-that-need-quotes]
[fixture: names/names-next-to-a-direction-line]
引用符のない名前は、語の間に空白を持てます。
それは名前の一部なので書かれたまま残し、
両端の空白は名前に入らないので落とします。
[fixture: names/inner-whitespace-kept] [fixture: names/outer-whitespace-dropped]
文字列は `-`、`:`、`,`、`{` など、どの文字も含められます。
引用符のない名前は、最初の文字の後に `#`、`.`、`}` を含められます。
[fixture: names/string-names-with-special-characters]
[fixture: names/special-characters-in-unquoted-names]

入力
([names/plain-names-without-quotes-input.mmd](../tests/fixtures/requirement/names/plain-names-without-quotes-input.mmd)):

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

出力
([names/plain-names-without-quotes-output.mmd](../tests/fixtures/requirement/names/plain-names-without-quotes-output.mmd)):

```mmd
requirementDiagram
  requirement r {
  }
  requirement s {
  }
  r - satisfies -> s
  s - satisfies -> r
  style r fill: red
```

入力
([names/string-names-with-special-characters-input.mmd](../tests/fixtures/requirement/names/string-names-with-special-characters-input.mmd)):

```mmd
requirementDiagram
requirement "a - b: c, d {" {
}
"x  y" - satisfies -> "z"
```

出力
([names/string-names-with-special-characters-output.mmd](../tests/fixtures/requirement/names/string-names-with-special-characters-output.mmd)):

```mmd
requirementDiagram
  requirement "a - b: c, d {" {
  }
  "x  y" - satisfies -> z
```

### 関係文の空白

関係文は、左の名前、`-` または `<-`、関係、`->` または `-`、右の名前の間を、
書かれ方によらず空白 1 つにします。
単位を離す書き方は mermaid.js の文書の形で、
ER 図の関係文も単位の間は空白 1 つです。
引用符のない名前は `-` の前で終わるので、空白で名前は変わりません。
[fixture: relationship-spacing/spaces-and-touching]
[fixture: relationship-spacing/one-space-between-units]
[fixture: relationship-spacing/string-names]
矢印の向きは書かれたまま残します。
`a - copies -> b` と `b <- copies - a` は書き方が違うからです。
関係の語は、mermaid.js の文書の例と同じく、小文字で印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
[fixture: relationship-spacing/relation-case-one-form]
[fixture: relationship-spacing/relations-case-one-form]
[fixture: relationship-spacing/every-relation]
引用符のない名前の中の空白は名前の一部です。
空白の連なりが違うと別の名前になるので、書かれたまま残します。
[fixture: relationship-spacing/multi-word-names]
単位の間のディレクティブは、その場に残し、
[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: relationship-spacing/directive-between-units]
[fixture: relationship-spacing/directive-between-units-runs]
空白の後で改行して複数行に書かれた関係文は、
コメントやディレクティブが結合を妨げる場合を除き、1 行にします。
結合しない場合は、
後続の構造部分と独立した trivia を関係文の内側に 1 段字下げします。
関係文を続ける空白の連続は LF より前から始まる必要があるため、
各 gap の最初の行の末尾を保ちます。
複数行のディレクティブ全体と名前の内部も保ちます。
[fixture: relationship-spacing/over-lines-joined]
[fixture: relationship-spacing/comment-continuation-with-multiline-names]
[fixture: relationship-spacing/directive-continuation-four-spaces]
[fixture: relationship-spacing/multiline-directive-line-tail]
改行をつなぐと行の規則が無視する `;` が変わりうる場合と、
最後の行を `;` が終える場合は、その改行を残します。
物理行を結ぶコメント領域は、元の配置を保ちます。
[fixture: multi-line-statements/relationship-last-line-semicolon-kept]
[test: requirement/relationship-spacing/comment-region-continuation-kept]

入力
([relationship-spacing/spaces-and-touching-input.mmd](../tests/fixtures/requirement/relationship-spacing/spaces-and-touching-input.mmd)):

```mmd
requirementDiagram
a-satisfies->b
a  -  satisfies  ->  b
b<-satisfies-a
b  <-  copies  -  a
```

出力
([relationship-spacing/spaces-and-touching-output.mmd](../tests/fixtures/requirement/relationship-spacing/spaces-and-touching-output.mmd)):

```mmd
requirementDiagram
  a - satisfies -> b
  a - satisfies -> b
  b <- satisfies - a
  b <- copies - a
```

入力
([relationship-spacing/directive-between-units-input.mmd](../tests/fixtures/requirement/relationship-spacing/directive-between-units-input.mmd)):

```mmd
requirementDiagram
a -%%{init: {}}%%satisfies  ->  b
a  %%{init: {}}%% - contains -> b
```

出力
([relationship-spacing/directive-between-units-output.mmd](../tests/fixtures/requirement/relationship-spacing/directive-between-units-output.mmd)):

```mmd
requirementDiagram
  a - %%{init: {}}%%satisfies -> b
  a %%{init: {}}%%- contains -> b
```

### クラスの並び

requirement、element、名前とクラスだけの文で、`:::` の後に書くクラスは、
`:::` に接し、クラスを区切る `,` は両側のクラスに接します。
`requirement r ::: a , b {` は `requirement r:::a,b {` と印字します。
これは ER 図のクラスと同じで、mermaid.js の文書の書き方でもあります。
[fixture: class-lists/in-requirement-and-element]
[fixture: class-lists/shorthand]
クラスは、文字列か、語の間に空白を持てる引用符のない文字列です。
その空白はクラスの一部です。 [fixture: class-lists/string-classes]
[fixture: class-lists/classes-with-spaces]
各部の間のディレクティブは、その場に残します。
[fixture: class-lists/directive-between-parts]

入力
([class-lists/in-requirement-and-element-input.mmd](../tests/fixtures/requirement/class-lists/in-requirement-and-element-input.mmd)):

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

出力
([class-lists/in-requirement-and-element-output.mmd](../tests/fixtures/requirement/class-lists/in-requirement-and-element-output.mmd)):

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

入力
([class-lists/string-classes-input.mmd](../tests/fixtures/requirement/class-lists/string-classes-input.mmd)):

```mmd
requirementDiagram
requirement r:::"a b" , "c" {
}
r ::: "d"
```

出力
([class-lists/string-classes-output.mmd](../tests/fixtures/requirement/class-lists/string-classes-output.mmd)):

```mmd
requirementDiagram
  requirement r:::"a b",c {
  }
  r:::"d"
```

### スタイルとクラス

名前とクラスのリストでは、名前に接する comma を使います。
`class` の 2 つのリストは、空白 1 つで区切ります。
style の文脈が LF で終わる場合、文の末尾の空白は落とします。
最初のスタイルは空白 1 つの後に置きます。
`style` と `classDef` の、通常の 1 行のプロパティと値からなるスタイルでは、
最初の `:` の前を詰め、空でない値の前に空白を 1 つ置きます。
[fixture: styles-and-classes/empty-style-value]
スタイル間は `,` とその後の空白 1 つで区切ります。
`:` のあるスタイルでも、ないスタイルでも、語と語の間の空白かタブの連続は、
空白 1 つで印字します。
`stroke-dasharray:  5    5` は `stroke-dasharray: 5 5` に、
`4px    wide` は `4px wide` になります。
語と語の間に空白があるかどうかは、書かれたまま残します。
ほかの隙間と同じように、接する語は接したままです。
そのため、`fill #f00` と `fill#f00` は区別して残します。
[ディレクティブ](#ディレクティブ)を参照してください。
語をつなぐと、どこで語が終わるかが見えなくなるからです。
Mermaid は、区切る空白にかかわらずスタイルの単位をつなげて読むため、
`stroke-dasharray: 5 5` は引き続き `stroke-dasharray:55` で、Db は変わりません。
`fill   : navy, stroke  : black` は `fill: navy, stroke: black` にします。
`:` で始まるスタイルも、ほかのスタイルと同じく、`:` の前に空白を置かず、
後ろに空白を 1 つ置きます。
`style r :  red   x` は `style r : red x` と印字します。
[fixture: styles-and-classes/style-colon-first-run-spaced]
通常はつなげる見出しや外側の改行があっても、最初の整形で同じ間隔にします。
スタイル内部の改行区切り、所有する trivia、
同じ物理行に保持するセミコロンがある場合は、既存のスタイルの配置を保ちます。
キーワード `style` と `classDef` は、書かれた大文字小文字を保ちます。
（[大文字小文字をそろえるキーワード](./compatibility.ja.md#大文字小文字をそろえるキーワード)）。
[fixture: styles-and-classes/style-unit-padding]
[fixture: styles-and-classes/class-def-names]
[fixture: styles-and-classes/style-names]
[fixture: styles-and-classes/class-lists]
[fixture: styles-and-classes/styles-as-written]
[fixture: styles-and-classes/style-words-run-spaced]
[fixture: styles-and-classes/style-words-touching-kept]
[fixture: styles-and-classes/style-words-directive-kept]
[fixture: styles-and-classes/trailing-whitespace-dropped]
[fixture: styles-and-classes/keyword-case-kept]
[fixture: styles-and-classes/keyword-case-semicolon-line-kept]

行の規則が無視しないスタイル末尾の `;` は、スタイルの文字です。
削除すると Db が変わるので残します。
[fixture: styles-and-classes/ending-semicolon-kept]
無視されるセミコロンは、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)に従います。
[fixture: styles-and-classes/ignored-style-terminator-dropped]

`:` を含まないスタイル（`4px` など）は、プロパティと値の組ではないので、
語の間の空白の連続を空白 1 つで印字するほかは、書かれたまま残します。
文のほかのスタイルは、通常どおり間隔を整えます。
[fixture: styles-and-classes/style-without-colon]

`class` 文は、途中で改行して続けられます。
改行の前の名前は style の文脈で読まれ、
引用符のない名前は `style-word` です（diagrams/requirement.md、
The style context、規則 1）。
改行の後の名前は文の文脈で読まれ、
引用符のない名前は空白やほかの文字を含められます。
最初の改行の後の名前がすべて、
文字列か `style-word` として読める引用符のない名前のときは、文を 1 行にします。
そのような名前は、1 行にしても字句解析器が同じに読みます。
[fixture: styles-and-classes/class-over-lines-joined]
[fixture: styles-and-classes/class-uppercase-digit-next-line]
それ以外のときは改行を残し、続きの行は 1 段深く置きます。
[fixture: styles-and-classes/class-over-lines-kept]
ディレクティブを含む名前は `style-word` ではありません。
style の文脈では、単位の中のディレクティブを拒否するからです。
[fixture: styles-and-classes/class-name-with-directive-kept]
コメント行の隣の改行は残し、コメントと構造の続きの行を 1 段深く置きます。
[fixture: styles-and-classes/class-over-lines-with-comment-line-kept]

入力
([styles-and-classes/class-def-names-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-def-names-input.mmd)):

```mmd
requirementDiagram
classDef a ,b ,  c fill:red
classDef default fill:#f9f,stroke-width:4px
classDef "d" fill:red
```

出力
([styles-and-classes/class-def-names-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-def-names-output.mmd)):

```mmd
requirementDiagram
  classDef a,b,c fill: red
  classDef default fill: #f9f, stroke-width: 4px
  classDef d fill: red
```

入力
([styles-and-classes/styles-as-written-input.mmd](../tests/fixtures/requirement/styles-and-classes/styles-as-written-input.mmd)):

```mmd
requirementDiagram
style r fill : #f9f , stroke:#333
style r stroke-dasharray: 5 5
style r fill:red   ,   stroke:blue
style r   fill: red;
```

出力
([styles-and-classes/styles-as-written-output.mmd](../tests/fixtures/requirement/styles-and-classes/styles-as-written-output.mmd)):

```mmd
requirementDiagram
  style r fill: #f9f, stroke: #333
  style r stroke-dasharray: 5 5
  style r fill: red, stroke: blue
  style r fill: red;
```

入力
([styles-and-classes/class-over-lines-joined-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-joined-input.mmd)):

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

出力
([styles-and-classes/class-over-lines-joined-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-joined-output.mmd)):

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

入力
([styles-and-classes/class-over-lines-kept-input.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-kept-input.mmd)):

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

出力
([styles-and-classes/class-over-lines-kept-output.mmd](../tests/fixtures/requirement/styles-and-classes/class-over-lines-kept-output.mmd)):

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
`direction` と値の間も空白 1 つにし、値の `lr` は `LR` と印字します。
例が `LR` だけを使うので、ほかの値は書かれた大文字小文字のまま残します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
[fixture: direction/spacing] [fixture: direction/spaces-around]
[fixture: direction/text-kept] [fixture: direction/case-one-form]
次の行に書かれた値は、`direction` の後ろに寄せて 1 行にします。
[fixture: direction/value-on-next-line-joined]
ディレクティブやコメント行を含む方向の行は改行を残し、
構造の続きの行を 1 段深く置きます。
[fixture: direction/directive-and-comment-line-kept]
字句解析器の方向の行の規則は行全体を取るので、`direction LR` で終わる関係文は、
前にテキストを持つ方向の行です。 [fixture: direction/after-relationship]

入力
([direction/text-kept-input.mmd](../tests/fixtures/requirement/direction/text-kept-input.mmd)):

```mmd
requirementDiagram
x   direction  RL   y  z
foo direction LR %% c
direction LR;
direction LRX
```

出力
([direction/text-kept-output.mmd](../tests/fixtures/requirement/direction/text-kept-output.mmd)):

```mmd
requirementDiagram
  x direction RL y  z
  foo direction LR %% c
  direction LR;
  direction LRX
```

入力
([direction/case-one-form-input.mmd](../tests/fixtures/requirement/direction/case-one-form-input.mmd)):

```mmd
requirementDiagram
DIRECTION lr
Direction Tb
```

出力
([direction/case-one-form-output.mmd](../tests/fixtures/requirement/direction/case-one-form-output.mmd)):

```mmd
requirementDiagram
  direction LR
  direction Tb
```

### 1 行に 1 文

requirement の図には文を区切るものがなく、
mermaid.js は同じ行に続く文を読みます。
各文は 1 行に 1 つ置きます。
1 行に 2 つの文があると読みにくく、ほかの図種も 1 行に 1 つの文を印字します。
`}` の後ろの文、
ヘッダーの後ろや `}` か文字列で終わる文の後ろの空の説明ブロック、
`style`・`classDef`・`class` 文の行末の文字列が始める文が、
それぞれの行に移ります。
[fixture: statements-one-per-line/header-then-empty-description-block]
[fixture: statements-one-per-line/after-closing-brace]
[fixture: statements-one-per-line/after-string-name]
[fixture: statements-one-per-line/empty-description-blocks]
2 つの文の間のディレクティブは、後ろの文と一緒に動きます。
[fixture: statements-one-per-line/directive-after-statement]

`style`・`classDef`・`class` 文の後も字句解析器は style の文脈にあるので、
その行の文字列が次の文を始め、その後の改行は `newline` ではなく、
その文を続けます。
`style r fill:red "r"` と、次の行の `:::c` は、r にクラス c を与えます。
この文は、各部を 1 行にして、自分の行に置きます。
[fixture: statements-one-per-line/string-continued-after-styles]
このような文がコメント行やディレクティブを含むときは、1 行にできないので、
前の文の行に残します。
`;` を含む行にあるときも同じで、その行は文を一緒に残すからです（下を参照）。
その行を、最初の文から 2 つ目の文の終わりまで、書かれたまま印字します。
[fixture: statements-one-per-line/continued-with-comment-line-kept]
[fixture: statements-one-per-line/continued-with-directive-kept]
[fixture: statements-one-per-line/continued-on-semicolon-line-kept]
[fixture: statements-one-per-line/continued-on-ignored-semicolon-line-kept]

保持する `;` を含む行は、その行の文をそのまま一緒に残します。
mermaid.js の行の規則は、`style`、その後の `:`、
その後の `#` を含む行の最後の `;` を取り除くので、文を別の行に移すと、
規則が `;` を無視しなくなったり、別の `;` を無視したりするからです。
`a - satisfies -> "style:#x" accDescr {} e - satisfies -> f;g` では、
2 つ目の関係の右は `fg` ですが、`f;g` が単独の行にあると、右は `f;g` です。
そのため、そのような行の文は同じ行に残し、文の間の空白はほかと同じに整形し、
保持する `;` は書かれたまま残します。
スタイルの終端を削除した行では、
前のブロックの閉じ括弧とスタイルを別の行にします。
[fixture: statements-one-per-line/semicolon-line-kept]
[fixture: statements-one-per-line/dropped-style-terminator-splits-line]

入力
([statements-one-per-line/header-then-empty-description-block-input.mmd](../tests/fixtures/requirement/statements-one-per-line/header-then-empty-description-block-input.mmd)):

```mmd
requirementDiagram accDescr {}
requirement r {
id: 1
}
```

出力
([statements-one-per-line/header-then-empty-description-block-output.mmd](../tests/fixtures/requirement/statements-one-per-line/header-then-empty-description-block-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
```

入力
([statements-one-per-line/string-continued-after-styles-input.mmd](../tests/fixtures/requirement/statements-one-per-line/string-continued-after-styles-input.mmd)):

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

出力
([statements-one-per-line/string-continued-after-styles-output.mmd](../tests/fixtures/requirement/statements-one-per-line/string-continued-after-styles-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  style r fill: red
  "r":::c
  classDef c fill: red
  "r":::c
  class r c
  r - satisfies -> b
  class r c
  "r":::d
```

入力
([statements-one-per-line/semicolon-line-kept-input.mmd](../tests/fixtures/requirement/statements-one-per-line/semicolon-line-kept-input.mmd)):

```mmd
requirementDiagram
a - satisfies -> "style:#x" accDescr {}   e - satisfies -> f;g
```

出力
([statements-one-per-line/semicolon-line-kept-output.mmd](../tests/fixtures/requirement/statements-one-per-line/semicolon-line-kept-output.mmd)):

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
コメント行とディレクティブの行の前後の空行も、同じに扱います。
[fixture: blank-lines/around-comment-and-directive-lines]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/requirement/blank-lines/collapsed-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}



element e {
}


a - satisfies -> b
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/requirement/blank-lines/collapsed-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }

  element e {
  }

  a - satisfies -> b
```

入力
([blank-lines/between-fields-collapsed-input.mmd](../tests/fixtures/requirement/blank-lines/between-fields-collapsed-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1



text: t
}
```

出力
([blank-lines/between-fields-collapsed-output.mmd](../tests/fixtures/requirement/blank-lines/between-fields-collapsed-output.mmd)):

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
本体のフィールドが 1 行に 1 つなのと同じです。
[fixture: empty-description-blocks/as-statement]
[fixture: empty-description-blocks/after-header]
[fixture: empty-description-blocks/in-body-own-lines]
[fixture: empty-description-blocks/in-body-before-closing-brace]
[fixture: empty-description-blocks/in-body-alone]

内側が空白だけなら、タブ、改行、Unicode の空白を含めて `{}` と印字します。
囲む空白を要する本文がないためです。
すでに空の内側は空のままです。
キーワードと開始括弧の間には空白を 1 つ置きます。
`accDescr{  }` は `accDescr {}` にします。
[fixture: empty-description-blocks/empty-whitespace-interiors]
[test: requirement Unicode and tab interiors]
[test: requirement body Unicode and tab interiors]
[fixture: empty-description-blocks/inner-whitespace-collapsed]
[fixture: empty-description-blocks/inner-whitespace-joined]
[fixture: empty-description-blocks/touching-kept]
[fixture: empty-description-blocks/in-body-over-lines-joined]
ディレクティブかコメント行を含むブロックは、その内容と改行を保ちます。
独立した注釈をブロックの 1 段内側に置き、
独立した `}` は `accDescr` にそろえます。
requirement と element の本文にある空のブロックも同じです。
[fixture: empty-description-blocks/in-body-with-directive-line]
[fixture: empty-description-blocks/with-directive-or-comment-line-kept]
[fixture: empty-description-blocks/in-body-with-comment-line-kept]
[fixture: empty-description-blocks/in-body-with-directive-kept]

入力
([empty-description-blocks/in-body-own-lines-input.mmd](../tests/fixtures/requirement/empty-description-blocks/in-body-own-lines-input.mmd)):

```mmd
requirementDiagram
requirement r { accDescr {}
id: "1" accDescr {}
accDescr {} text: t
risk: low accDescr {   }
}
```

出力
([empty-description-blocks/in-body-own-lines-output.mmd](../tests/fixtures/requirement/empty-description-blocks/in-body-own-lines-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    accDescr {}
    id: 1
    accDescr {}
    accDescr {}
    text: t
    risk: low
    accDescr {}
  }
```

入力
([empty-description-blocks/inner-whitespace-joined-input.mmd](../tests/fixtures/requirement/empty-description-blocks/inner-whitespace-joined-input.mmd)):

```mmd
requirementDiagram
accDescr {     }
accDescr {


}
accDescr   {}
```

出力
([empty-description-blocks/inner-whitespace-joined-output.mmd](../tests/fixtures/requirement/empty-description-blocks/inner-whitespace-joined-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  accDescr {}
  accDescr {}
```

### アクセシビリティの文

`accTitle` と `accDescr` の `:` はキーワードに接し、後ろに空白 1 つを置きます。
テキストの両端の空白は落とします。
`accDescr` のテキストの中の空白とタブの連なりは、空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
`accTitle` はブラウザがツールチップとして表示するので、
その連なりは書かれたまま残します。
[fixture: accessibility-statements/colon-touches-keyword]
[fixture: accessibility-statements/title-and-description]
[fixture: accessibility-statements/inner-runs-collapsed]
テキストの中の `;`、`#`、`%%` は文字です。
[fixture: accessibility-statements/special-characters-in-text]
後の行に書かれたテキストは、`:` の後ろに寄せて 1 行にします。
その前にコメント行があるときは、文を書かれたまま残します。
[fixture: accessibility-statements/text-on-next-line-joined]
[fixture: accessibility-statements/text-with-comment-line-kept]

`accDescr { ... }` ブロックの後続の本文行は、文の内側に 1 段字下げし、
LF 直後の ASCII 空白とタブだけを置き換えます。
説明の setter がこの字下げを捨てるためです。
改行、行末空白、ディレクティブの内部は保ちます。
`}` は文と同じ段に置きます。
[fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]

1 行のブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
[fixture: accessibility-statements/block-text-on-opening-line]

字句解析器は、続く文の規則より前に、
`accTitle` と `accDescr` の後に方向の行を読みます。
1 桁目の `accTitle: direction LR` はタイトルで、字下げすると、
`direction` の前にテキスト `accTitle:` を持つ方向の行です。
そのため、`accTitle`、`accDescr:`、`accDescr {` の文で、
印字する最初の行に `direction` と、1 つ以上の空白と、`TB`、`BT`、`RL`、
`LR` のどれか（大文字小文字は問わない）があるものは、1 桁目を保ちます。
行は、ディレクティブとコメント行を除いて字句解析器が読むとおりに判断します。
[fixture: accessibility-statements/first-column-kept]
そのような方向を含まない行は、ほかの文と同じに字下げします。
[fixture: accessibility-statements/first-column-not-needed]
行全体で判断します。
同じ行にほかの文が続く場合（`accDescr {x}; title direction RL`）も、
字句解析器は行頭から行全体を読むので、その文にある `direction` も数えます。
[fixture: accessibility-statements/semicolon-line-with-direction-text-first-column]

入力
([accessibility-statements/colon-touches-keyword-input.mmd](../tests/fixtures/requirement/accessibility-statements/colon-touches-keyword-input.mmd)):

```mmd
requirementDiagram
accTitle : My title
accDescr:My description
ACCTITLE :T
```

出力
([accessibility-statements/colon-touches-keyword-output.mmd](../tests/fixtures/requirement/accessibility-statements/colon-touches-keyword-output.mmd)):

```mmd
requirementDiagram
  accTitle: My title
  accDescr: My description
  ACCTITLE: T
```

入力
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/requirement/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
requirementDiagram
accDescr {
  first
    second
}
accDescr {
}
```

出力
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/requirement/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
requirementDiagram
  accDescr {
    first
    second
  }
  accDescr {}
```

入力
([accessibility-statements/first-column-kept-input.mmd](../tests/fixtures/requirement/accessibility-statements/first-column-kept-input.mmd)):

```mmd
requirementDiagram
accTitle: direction LR
accDescr: direction  TB
accDescr { direction RL }
accDescr {
 direction BT
}
```

出力
([accessibility-statements/first-column-kept-output.mmd](../tests/fixtures/requirement/accessibility-statements/first-column-kept-output.mmd)):

```mmd
requirementDiagram
accTitle: direction LR
accDescr: direction TB
accDescr: direction RL
  accDescr {
    direction BT
  }
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
空の description block も通常の配置に従い、スタイルの終端は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/empty-description-block]

行の規則が無視しないセミコロンは、スタイルの文字として残します。
`classDef c fill:red;` と `style r fill:red;` では、
削除すると Db が変わるためです。
[fixture: semicolons-at-the-end-of-a-style-statement/style-text-kept]

同じ行でセミコロンの後にディレクティブが続く場合は、`;` を保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
閉じていないディレクティブの後の `;` は、その停止位置を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
U+2028 と U+2029 の前も同じように保護します。
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
[test: style semicolons: requirement before U+2028]
[test: style semicolons: requirement before U+2029]
文と無視される終端の間にある閉じたディレクティブは残し、`;` は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

出力
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/requirement/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
requirementDiagram
  classDef c fill: #f00
  style r fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style r fill: #0f0, stroke: #00f
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、
字句解析器が改行を空白として読む所で 1 行にして印字します。
空白の後の改行は空白です。
requirement のキーワードと名前の間、関係文の単位の間、フィールドの `:` の前後、
`accTitle` と `accDescr` の `:` の前後、`direction` と値の間が、
それにあたります。
`style`・`classDef`・`class` 文の行末の文字列が始める文は、
style の文脈の改行の後で続きます。
[fixture: multi-line-statements/breaks-decided-one-by-one]
[fixture: multi-line-statements/line-rule-first-hash-after-colon-kept]
[fixture: multi-line-statements/kind-and-name-joined]
[fixture: multi-line-statements/relationship-joined]
[fixture: multi-line-statements/direction-value-joined]
[fixture: multi-line-statements/accessibility-joined]
[fixture: multi-line-statements/string-continued-joined]
コメントやディレクティブがあれば改行を保ち、
構造の続きの行と間の注釈を 1 段深く置きます。
ブロックのヘッダー、フィールド、関係文、ほかの文も同じです。
値の中の空白と、各隙間の最初の改行の前の空白は保ちます。
コメントで結合される領域では、文全体を原文のまま残します。
改行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合と、最後の行を `;` が終える場合は、
その改行を残します。
それ以外の改行は、`;` を含む文でも通常どおりつなぎます。
改行が残る文は、スタイルも書かれたままにします。
[test: requirement/multi-line-statements/header-and-field-comment-regions-ls]
[test: requirement/multi-line-statements/header-and-field-comment-regions-ps]
[fixture: multi-line-statements/header-directive-continuation]
[fixture: fields/comment-and-directive-continuations]
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
[fixture: multi-line-statements/semicolon-joined]

最後の行の `;` が後ろの文のものでも、同じ判定をします。
つないだ行を、行の規則が行全体として読むからです。
`"style:#q" - satisfies` と、改行の後の `-> "b" e - satisfies -> f;g` では、
2 つ目の関係の右は `f;g` ですが、
1 行にした `"style:#q" - satisfies -> "b" e - satisfies -> f;g` では `fg`
になります。
その行の文は、その行に残します。
[fixture: multi-line-statements/relationship-last-line-semicolon-kept]
[fixture: multi-line-statements/class-last-line-semicolon-kept]
文の最初の行にある、前の文の `;` は、規則にとって何も変えないので、
文は 1 行にします。
[fixture: multi-line-statements/relationship-first-line-semicolon-joined]
[fixture: multi-line-statements/class-first-line-semicolon-joined]
[fixture: multi-line-statements/accessibility-first-line-semicolon-joined]
`;` のない行の文は、プリンタが 1 行ずつに分けて置くので、規則は、
ほかの文を除いた文として読みます。
`style r fill:#q "r"` と、
改行の後の `- satisfies -> "b" e - satisfies -> f;g` も、1 行にします。
[fixture: multi-line-statements/string-continued-last-line-semicolon-joined]

入力
([multi-line-statements/string-continued-joined-input.mmd](../tests/fixtures/requirement/multi-line-statements/string-continued-joined-input.mmd)):

```mmd
requirementDiagram
style r fill:red "r"
:::c
class r c "r"
- satisfies -> b
```

出力
([multi-line-statements/string-continued-joined-output.mmd](../tests/fixtures/requirement/multi-line-statements/string-continued-joined-output.mmd)):

```mmd
requirementDiagram
  style r fill: red
  "r":::c
  class r c
  r - satisfies -> b
```

入力
([multi-line-statements/accessibility-joined-input.mmd](../tests/fixtures/requirement/multi-line-statements/accessibility-joined-input.mmd)):

```mmd
requirementDiagram
accTitle:
T
accDescr
: D
```

出力
([multi-line-statements/accessibility-joined-output.mmd](../tests/fixtures/requirement/multi-line-statements/accessibility-joined-output.mmd)):

```mmd
requirementDiagram
  accTitle: T
  accDescr: D
```

### トークンの間の空白

上のどの規則も当てはまらない所では、
文の中の 2 つのトークンの間の空白は 1 つの空白にし、
接しているトークンは接したままにします。
空の説明ブロックの波括弧がそうです。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/touching-kept]
行末の空白は落とします。
[fixture: whitespace-between-tokens/trailing-whitespace-dropped]

入力
([whitespace-between-tokens/collapsed-input.mmd](../tests/fixtures/requirement/whitespace-between-tokens/collapsed-input.mmd)):

```mmd
requirementDiagram
accDescr   {   }
requirement r {
id: 1
}
style   r   fill:red
class   r   c
```

出力
([whitespace-between-tokens/collapsed-output.mmd](../tests/fixtures/requirement/whitespace-between-tokens/collapsed-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
  style r fill: red
  class r c
```

入力
([whitespace-between-tokens/touching-kept-input.mmd](../tests/fixtures/requirement/whitespace-between-tokens/touching-kept-input.mmd)):

```mmd
requirementDiagram
accDescr{}
accDescr{ }
accDescr {}
```

出力
([whitespace-between-tokens/touching-kept-output.mmd](../tests/fixtures/requirement/whitespace-between-tokens/touching-kept-output.mmd)):

```mmd
requirementDiagram
  accDescr {}
  accDescr {}
  accDescr {}
```

### キーワードの大文字小文字

キーワードは、参照先の表に示す大文字小文字で印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
`style` と `classDef` は表になく、書かれた大文字小文字を保ちます。
（[大文字小文字をそろえるキーワード](./compatibility.ja.md#大文字小文字をそろえるキーワード)）。
mermaid.js は表のキーワードをどの大文字小文字でも読み、Db は同じです。
[fixture: keyword-case/keywords-one-form] [fixture: keyword-case/types-one-form]
ヘッダーは、
小文字の `requirement` で始まるときだけ検出されます（diagrams/requirement.md、
Detection）。

入力
([keyword-case/keywords-one-form-input.mmd](../tests/fixtures/requirement/keyword-case/keywords-one-form-input.mmd)):

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

出力
([keyword-case/keywords-one-form-output.mmd](../tests/fixtures/requirement/keyword-case/keywords-one-form-output.mmd)):

```mmd
requirementdiagram
  requirement r {
    id: 1
    risk: high
  }
  element e {
  }
  r - satisfies -> e
  direction LR
  STYLE r fill: red
```

### コメント

コメントは、単位の始まる所の `%%`、`#`、`%` で始まり、行末まで続きます。
単独の行のコメントは、後ろの文と同じ段に置き、
本体の中ではフィールドと同じ段に置きます。
テキストと印は書かれたまま残します。
[fixture: comments/lines-at-statement-level]
[fixture: comments/single-mark-lines-kept]
ヘッダーの前のコメント行は 1 桁目に置き、
本体の末尾とテキストの末尾のコメント行は、単独の行に残します。
[fixture: comments/before-header] [fixture: comments/last-in-body]

ヘッダーの後ろ、本体の `{` と `}` の後ろ、キーワードか文字列の値の後ろ、
文字列の名前かクラスの後ろのコメントは、その行に書かれたまま残します。
空白が書かれていれば空白 1 つを置き、接していれば接したままにします。
[fixture: comments/after-header] [fixture: comments/after-header-glued]
[fixture: comments/after-opening-brace] [fixture: comments/after-closing-brace]
[fixture: comments/after-keyword-and-string-values]
[fixture: comments/after-string-name]
引用符のない名前や値の後ろの `#` と `%` はテキストの文字で、
方向の値の後ろのものは mermaid.js が読まないテキストです。
どちらもそのまま残します。 [fixture: comments/in-unquoted-text-is-text]
[fixture: comments/after-direction-is-text]
アクセシビリティのテキストと文字列の中の `%%` は、テキストの文字です。
[fixture: comments/percent-in-values-kept]

ディレクティブでない `%%{` で始まるコメント行は、
requirement の図では mermaid.js がどの字下げでも読むので、
特別な字下げは保ちません。 [fixture: comments/percent-brace-lines]

入力
([comments/lines-at-statement-level-input.mmd](../tests/fixtures/requirement/comments/lines-at-statement-level-input.mmd)):

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

出力
([comments/lines-at-statement-level-output.mmd](../tests/fixtures/requirement/comments/lines-at-statement-level-output.mmd)):

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

入力
([comments/after-keyword-and-string-values-input.mmd](../tests/fixtures/requirement/comments/after-keyword-and-string-values-input.mmd)):

```mmd
requirementDiagram
requirement r {
risk: low %c
verifyMethod: test#c
id: "1" #c
text: "t"%c
}
```

出力
([comments/after-keyword-and-string-values-output.mmd](../tests/fixtures/requirement/comments/after-keyword-and-string-values-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    risk: low %c
    verifymethod: test#c
    id: "1" #c
    text: "t"%c
  }
```

入力
([comments/in-unquoted-text-is-text-input.mmd](../tests/fixtures/requirement/comments/in-unquoted-text-is-text-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1 #c
text: a %c
}
a - satisfies -> b #c
```

出力
([comments/in-unquoted-text-is-text-output.mmd](../tests/fixtures/requirement/comments/in-unquoted-text-is-text-output.mmd)):

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
文の行の中では、flowchart と同じく、隙間をディレクティブがないものとして印字し、
ディレクティブをその空白の後ろに置いて、後ろの単位に接します。
[fixture: directives/kept] [fixture: directives/in-body]
[fixture: directives/before-header]
[fixture: directives/after-header-on-same-line]
[fixture: directives/whitespace-on-both-sides]
[fixture: directives/after-statement-at-end-of-line]

文の 2 つの単位の間のディレクティブは、その場に残し、
[ディレクティブ](#ディレクティブ)のとおりに置きます。
テキストの中のディレクティブは、テキストの一部です。
[fixture: directives/between-units] [fixture: directives/between-units-runs]
[fixture: directives/inside-values-kept]
閉じられていないディレクティブはテキストの残りを取り、書かれたまま残します。
[fixture: directives/unclosed-at-end-of-text-kept]
[fixture: directives/unclosed-after-statement-kept]

入力
([directives/kept-input.mmd](../tests/fixtures/requirement/directives/kept-input.mmd)):

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

出力
([directives/kept-output.mmd](../tests/fixtures/requirement/directives/kept-output.mmd)):

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

入力
([directives/between-units-input.mmd](../tests/fixtures/requirement/directives/between-units-input.mmd)):

```mmd
requirementDiagram
a -%%{init: {}}%% satisfies -> b
requirement r%%{init: {}}%%{
id:%%{init: {}}%% 1
}
```

出力
([directives/between-units-output.mmd](../tests/fixtures/requirement/directives/between-units-output.mmd)):

```mmd
requirementDiagram
  a - %%{init: {}}%%satisfies -> b
  requirement r %%{init: {}}%%{
    id: %%{init: {}}%%1
  }
```

### 色

スタイルの色は、mermaid.js の文書の例と Prettier の CSS 整形と同じく、
小文字で印字します。
`style r fill:#F9F,stroke:#ABCDEF` は `style r fill: #f9f, stroke: #abcdef`
と印字します。
requirement 図の `style`、`classDef` 文のスタイルの色が対象です。
色は、スタイルの値の中で単独で立つ、`#` と 3、4、6、8 桁の 16 進数です。
色を短くすることはなく、色でないテキストは書かれたままにします。
（[同じに描かれる色](./compatibility.ja.md#同じに描かれる色)を参照）。
[fixture: colors/colors-in-lower-case]
[fixture: colors/words-that-are-not-colors-as-written]

入力
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/requirement/colors/colors-in-lower-case-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
text: t
risk: low
verifymethod: test
}
requirement q {
id: 2
text: u
risk: low
verifymethod: test
}
r - satisfies -> q
style r fill:#F9F,stroke:#ABCDEF,color:#C0FFEE
classDef c fill:#DEADBE,stroke:#ABCDEF
class q c
```

出力
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/requirement/colors/colors-in-lower-case-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
    text: t
    risk: low
    verifymethod: test
  }
  requirement q {
    id: 2
    text: u
    risk: low
    verifymethod: test
  }
  r - satisfies -> q
  style r fill: #f9f, stroke: #abcdef, color: #c0ffee
  classDef c fill: #deadbe, stroke: #abcdef
  class q c
```

入力
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/requirement/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
requirementDiagram
requirement r {
id: 1
}
style r fill:#ABCDE,stroke:#ABCDEF1
classDef c fill:#ABC-x,stroke:x#ABC
```

出力
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/requirement/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
requirementDiagram
  requirement r {
    id: 1
  }
  style r fill: #ABCDE, stroke: #ABCDEF1
  classDef c fill: #ABC-x, stroke: x#ABC
```

### フロントマターの YAML

フローチャートと同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整形し、`---` の行は、
行末の空白とタブも含め、書かれたまま残します。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
Prettier が YAML を読めないときは、書かれたまま残します。
[fixture: frontmatter-yaml/malformed-kept]
フロントマターとヘッダーの間のコメント行は残します。
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/requirement/frontmatter-yaml/formatted-input.mmd)):

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

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/requirement/frontmatter-yaml/formatted-output.mmd)):

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
例は文字列で書かれていて、`\u2028` は U+2028、`\n` は改行です。
[test: U+2028 after the closing brace of a body] [test: U+2028 inside a name]
[test: U+2028 inside a class] [test: U+2028 after the keyword of a requirement]
[test: U+2028 inside a value] [test: U+2029 inside a string]
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
例は文字列で書かれていて、`\u00a0` は U+00A0、`\ufeff` は U+FEFF です。
[test: U+00A0 around the name of a requirement]
[test: U+00A0 around the value of a field]
[test: U+00A0 around the colon of a field]
[test: U+00A0 around the units of a relationship]
[test: U+00A0 around the comma of a list of classes]
[test: U+00A0 inside a name] [test: U+00A0 inside a value]
[test: U+00A0 between direction and its value]
[test: U+00A0 after the closing brace of a body]
[test: U+FEFF before the opening brace] [test: U+FEFF before a statement]

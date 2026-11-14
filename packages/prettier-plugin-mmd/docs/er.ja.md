# ER 図の整形規則

英語版: [er.md](./er.md)

prettier-plugin-mmd が ER 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
class 図と同じ規則はそう書き、
理由は [class 図の整形規則](./class.ja.md) にあります。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### 字下げ

ヘッダーの後の文は、ヘッダーより 1 段深く置きます。
[fixture: indentation/written-indentation-dropped]
subgraph の文は、subgraph の行より 1 段深く置き、その `end` は、
その行と同じ段に、行に単独で置きます。
文の後に書かれていても同じです。 [fixture: indentation/nested-subgraphs]
[fixture: subgraphs/end-on-the-line-of-a-statement]
実体の属性は、実体の行より 1 段深く置き、その `}` は、その行と同じ段に置きます。
subgraph の中でも同じです。 [fixture: indentation/attribute-blocks-in-subgraphs]
1 段は Prettier の `useTabs` と `tabWidth` のオプションが決め、
既定は空白 2 つです。 [fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
入力に書かれた字下げは保ちません。
行頭の空白は、mermaid.js にとって何でもないためです。
字下げは構造だけで決められるので、1 つの規則で、
入力の字下げによらず同じテキストになります。
[fixture: indentation/written-indentation-dropped]
例外は、direction を含む `accTitle` と `accDescr` の文で、
1 桁目を保ちます（[アクセシビリティの文](#アクセシビリティの文)を参照）。

入力
([indentation/nested-subgraphs-input.mmd](../tests/fixtures/er/indentation/nested-subgraphs-input.mmd)):

```mmd
erDiagram
subgraph Outer
A
subgraph Inner [Title]
B ||--o{ C : x
end
D
end
E
```

出力
([indentation/nested-subgraphs-output.mmd](../tests/fixtures/er/indentation/nested-subgraphs-output.mmd)):

```mmd
erDiagram
  subgraph Outer
    A
    subgraph Inner[Title]
      B ||--o{ C : x
    end
    D
  end
  E
```

### 属性ブロック

属性ブロックの `{` は、空白 1 つの後に、実体の行に置きます。
各属性は、1 段深く、行に 1 つずつ置き、`}` は、実体と同じ段に、
行に単独で置きます。 [fixture: attribute-blocks/opening-brace-after-one-space]
[fixture: attribute-blocks/split]
1 行に書かれたブロックや、最初の属性が `{` の行に、
最後の属性が `}` の行にあるブロックも、こう分けます。
mermaid.js は属性ブロックを改行に関係なく読むので、同じ属性を読みます。
[fixture: attribute-blocks/split] [corpus fixture: er/gram-attributes-one-line]
[corpus fixture: er/gram-attribute-split-lines]
`}` の後に同じ行で続く文は、行に単独で置きます。
[fixture: attribute-blocks/entity-after-closing-brace]
[corpus fixture: er/gram-block-then-name-one-line]
`{` の前の名前、別名、クラスは、[実体](#実体)と同じに整形します。
[fixture: attribute-blocks/alias-and-classes]

空白しかない空のブロックは、どう書かれていても、
実体の行に `{ }` として印字します。
`{}` も `{   }` も、別々の行の波括弧も、属性のない実体を宣言します。
`{ }` は他の図種と同じ形です。 [fixture: attribute-blocks/empty-unified]
[corpus fixture: er/gram-block-empty]
[corpus fixture: er/gram-block-empty-space]
[corpus fixture: er/gram-block-empty-line-feed]
[corpus fixture: er/gram-block-blank-lines]
書かれたまま残る行（[1 行に 1 文](#1-行に-1-文)と
[複数行の文](#複数行の文)を参照）では、1 行にあるブロックは、
その行と一緒に書かれたままにします。
複数行にまたがるブロックは、`}` が、書かれたまま残らない行にあるとき、
ブロックとして印字します。
行の文は、その行に一緒に残し、文の単位の間の空白は通常どおり整形します。
ただし、mermaid.js がその行をどう読むかを決める空白は書かれたまま残します。
`1` と次の名前の接触、空白でもタブでもない空白文字、`class` の後の隙間です。
コメント行がつなぐ行も例外で、
`{` までを書かれたままにします（[複数行の文](#複数行の文)を参照）。
空でないブロックでは、`{` の後ろにあるものは、その行に書かれたまま残し、
その後の属性と `}` は、ほかの実体と同じに置きます。
そのため、複数行にまたがる空のブロックは、`{` の後ろに何があっても（空白、タブ、
U+2028）、波括弧の間に何があっても、行の終わりが ` { }` になります。
ただし、`}` と閉じる行の残りが `{` の行につながると、別の読みになるときは別で、
行を離したままにします。
mermaid.js の行の規則（[セミコロン](#スタイル文の末尾のセミコロン)を参照）は、
規則に合う行の最後の `;` を無視するので、つないだ行では、
2 つの行のときと別の `;` を無視することがあります。
`"style:#x"; B {`、改行、`} A["x;y"]` は、
最初の行では `"style:#x"` の後ろの `;` を無視しますが、
つないだ行では `A["x;y"]` の中の `;` を無視し、最初の `;` が区切りとして残って、
mermaid.js が拒否します。
規則が、どちらでも同じ `;` を無視するときは、`"style:#x"; B {`、改行、
`}` のように、行をつなぎます。
`{` の前の同じ行に、属性ブロックの中の `~` があり、書かれたまま残る行も、
行を離したままにします。
数える版のうち最も古いものは、そのような `~` の後ろの行の残りを、
行が長いほど時間がかかる規則で読むので、その版が描ける行が、
描けない行になりかねません。
引用符の名前やディレクティブの中の `~` は、そのような規則に読まれないので、
行をつなぎます。
`A["x;~y"] B {`、改行、`}` は、`A["x;~y"] B { }` です。
行を離したままにするとき、波括弧の間に空白とタブと改行だけがあれば、
文は `{` までを書かれたまま印字し、改行を 1 つ置き、
実体の字下げに `}` を置きます。
行末の `{` の後ろの空白と、波括弧の間の空行は何も描かず、
つないだ形の `{ }` でも落とすからです。
波括弧の間に、
空白でもタブでもない空白文字（たとえば U+00A0 や U+2028）があるときは、
文は書かれたままにします。
ただし `}` の前の同じ行に空白とタブだけがあれば、`}` は実体の字下げに置きます。
`{` の行を、その行の文と一緒に書かれたまま印字するときも、
ブロックは同じに印字します。
行の印字については
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
`}` は実体の字下げに置き、波括弧の間に空白とタブと改行だけがあれば、
`{` の後ろの空白と、波括弧の間の空行は、ほかの所と同じく落とします。
行を書かれたままにしているのは、行の規則が無視する `;` と、
その後ろの U+2028 か U+2029 の位置、または行が読まれる位置です。
行末の `{` の後ろ、波括弧の間、後の行にある `}` の前の空白は、
そのどれにも入りません。
`"style:#x"; B {`、U+2029、改行、空白 4 つ、`} A["x;y"]` は、
`}` を実体の字下げ（空白 2 つ）の後ろに置いて印字します。
`1a B {`、空白 2 つ、改行 2 つ、`} A["x;y"]` は、`1a B {`、改行、
`} A["x;y"]` に印字します。
`end` の行が書かれたまま残るサブグラフは、全体を書かれたまま印字し、
中の行は書かれた字下げを保ちます。
ヘッダーだけがブロックの字下げに立ちます。
その本体にある空のブロックも、どの深さでも同じです。
`}` は、実体が始まる行の、書かれた字下げに置きます。
[test: an empty ER attribute block in a subgraph whose end line stays as written, with spaces after its opening brace, an empty line, and four spaces before its closing brace]
[test: an empty ER attribute block in a subgraph whose end line stays as written, after two spaces of indentation]
[test: an empty ER attribute block in a subgraph whose end line stays as written, in a subgraph after a tab]
[test: an empty ER attribute block in a subgraph whose end line stays as written, with two empty blocks after a statement]
[test: an empty ER attribute block in a subgraph whose end line stays as written, and a block with an attribute]
[test: an empty ER attribute block in a subgraph whose end line stays as written, and U+00A0 before the closing brace]
[fixture: attribute-blocks/written-line-empty-block-ignored-semicolon-both-lines]
[fixture: attribute-blocks/written-line-empty-block-ignored-semicolon-closing-line-ends]
[fixture: attribute-blocks/written-line-empty-block-ignored-semicolon-in-subgraph]
[fixture: attribute-blocks/empty-block-joined-where-the-lines-read-the-same]
[fixture: attribute-blocks/written-line-tilde-line]
[fixture: attribute-blocks/written-line-tilde-line-closing-remainder]
[fixture: attribute-blocks/empty-block-joined-where-the-tilde-is-not-in-an-attribute-block]
[fixture: attribute-blocks/written-line-empty-block-tilde-attribute-on-a-semicolon-line]
[fixture: attribute-blocks/written-line-empty-block-tilde-in-a-string-of-an-attribute]
[fixture: attribute-blocks/written-line-empty-block-closing-brace-at-the-indentation-of-the-entity]
[fixture: attribute-blocks/written-line-empty-block-spaces-after-the-brace-dropped]
[fixture: attribute-blocks/written-line-empty-block-tab-after-the-brace-dropped]
[fixture: attribute-blocks/written-line-empty-block-empty-line-dropped]
[fixture: attribute-blocks/written-line-empty-block-whitespace-only-line-dropped]
[fixture: attribute-blocks/written-line-empty-block-tilde-whitespace-and-empty-line-dropped]
[fixture: attribute-blocks/written-line-empty-block-in-subgraph-whitespace-dropped]
[test: an empty ER attribute block that stays over several lines with U+00A0 after its opening brace]
[test: an empty ER attribute block that stays over several lines with U+2028 after its opening brace]
[test: an empty ER attribute block that stays over several lines with a U+00A0 line between its braces]
[test: an empty ER attribute block that stays over several lines with U+2029 after its opening brace, after a semicolon that the line rule ignores]
[test: an empty ER attribute block that stays over several lines with U+2028 on a line between its braces, after a semicolon that the line rule ignores]
[test: an empty ER attribute block that stays over several lines with U+2029 after its opening brace, after a semicolon that the line rule ignores, and four spaces before its closing brace]
[test: an empty ER attribute block that stays over several lines with U+2029 after its opening brace, after a semicolon that the line rule ignores, and a tab before its closing brace]
[test: an empty ER attribute block that stays over several lines with U+2028 after its opening brace, after a semicolon that the line rule ignores, and U+00A0 before its closing brace]
[test: an empty ER attribute block that stays over several lines with spaces after its opening brace and an empty line before its closing brace, after a semicolon that the line rule ignores and U+2028]
[test: an empty ER attribute block that stays over several lines with U+2029 after its opening brace, after a semicolon that the line rule ignores, in a subgraph]
[test: an empty ER attribute block that stays over several lines with U+2029 after its opening brace, after a semicolon that the line rule ignores, before a closing line that a semicolon ends]
[test: an empty ER attribute block that stays over several lines with U+2028 after its opening brace, after a tilde in an attribute block]
[test: an empty ER attribute block that stays over several lines with U+2029 after its opening brace, after a tilde in an attribute block]
[test: an empty ER attribute block that stays over several lines with U+2028 after its opening brace, after a tilde in an attribute block, in a subgraph]
`}` が、書かれたまま残る行にあるブロックは、`A {`、改行、`}1b` のように、
属性があれば、その行と一緒に書かれたままにします。
空のブロックは、上と同じに印字します。
[fixture: attribute-blocks/written-line-empty-block-closing-brace-on-a-line-read-by-its-place]
[fixture: attribute-blocks/written-line-empty-block-spaces-and-empty-line-dropped-on-a-line-read-by-its-place]
`;` を含み、ほかに書かれたまま残る理由がない行は整形します。
空の description ブロックがある subgraph の見出しの行も、
テキストを `:` に寄せると `direction` を持つ `accTitle` と `accDescr` の行も、
同じです。
そのような行の文は、行に一緒に残ります。
その行にあるブロックはブロックとして印字します。
`{` の行にある属性は、その行が上の行のどれかであれば、そこに残ります。
`{` と属性の間に空白があれば、空白とタブの連なりは 1 つの空白になり、
接していれば接したままです。
行末にある `{` の後ろの空白とタブは落とします。
1 行に書かれたブロックは 1 行のままで、
`}` の前に空白が 1 つ入ります（`T {int a}` は `T {int a }` です）。
ただし `;` を含む行では `}` が単独の行に移ります。
[fixture: attribute-blocks/semicolon-line-spaces-after-brace]
[fixture: attribute-blocks/block-on-one-line-space-before-the-closing-brace]
[fixture: attribute-blocks/subgraph-header-line-spaces-after-brace]
[fixture: attribute-blocks/accessibility-line-spaces-after-brace]
[fixture: attribute-blocks/written-line-number-name]
[fixture: attribute-blocks/written-line-tilde-line]
[fixture: attribute-blocks/written-line-unclosed-directive]
[fixture: attribute-blocks/written-line-closing-brace]
[fixture: attribute-blocks/semicolon-line]
[test: an empty attribute block over several lines after a comment line after
U+2028 inside the name of an ER entity]
[test: an empty attribute block on one line after a comment line after U+2028
inside the name of an ER entity]
[test: an empty attribute block over several lines after a name in quotes and
U+2028]
[test: an empty attribute block over several lines after a name in quotes and
U+2029]
[test: an empty attribute block over several lines after a name in quotes and
U+2028 in a subgraph]
[test: an empty attribute block with an empty line before its closing brace
after a name in quotes and U+2028]
[test: an empty attribute block with U+2028 after its opening brace after a name
in quotes and U+2028]
[test: an empty attribute block on one line after a name in quotes and U+2028]
[test: an empty attribute block over several lines after U+2028 and class]
[test: an empty attribute block over several lines after a semicolon that the
line rule ignores and U+2028]
[test: an empty attribute block with U+2028 after its opening brace after a
semicolon that the line rule ignores]
[test: an empty attribute block with U+2028 after its opening brace after the ER
entity 1 that touches a letter]
[test: an attribute block over several lines after a name in quotes and U+2028]
[test: U+2028 and an attribute block after a name in quotes]
[test: an attribute block over several lines after U+2028 and class]
[test: an attribute block over several lines after a semicolon that the line
rule ignores and U+2028]
[test: an attribute block over several lines after the ER entity 1 that touches
a letter and U+2028 after its opening brace]
[test: an attribute block of an entity after the end of an ER subgraph and U+2028, and a comment line after U+2028 after its closing brace]
[test: an empty attribute block of an entity after the end of an ER subgraph and U+2028, and a comment line after U+2028 after its closing brace]
[test: an attribute block of an entity after the end of an ER subgraph and U+2028, and a comment line after U+2028 at the end of the text]
[test: an attribute block of an entity after the end of an ER subgraph and U+2029, and a comment line after U+2029 after its closing brace]
[fixture: attribute-blocks/written-line-closing-line-kinds]
[fixture: attribute-blocks/written-line-unclosed-directive-semicolon]
[test: an empty attribute block over several lines before a name that is a no-break space and a comment line]
[test: an attribute block over several lines before a name that is a no-break space and a comment line]
[test: an attribute block over several lines of an entity after a statement, before a name that is a no-break space and a comment line]
波括弧と同じ行にディレクティブがある属性のないブロックは、
ディレクティブをその行に書かれたまま残します。
コメント行や、行に単独で置かれたディレクティブがあるブロックは、
ブロックとして印字します。 [fixture: attribute-blocks/empty-with-directive-kept]
[fixture: attribute-blocks/empty-with-comment-line-over-lines]
[fixture: attribute-blocks/empty-with-directive-line-over-lines]

mermaid.js が読まないテキスト、つまり間に何もない 2 つのバッククォートは、
2 つの属性の間、最初の前、最後の後、またはブロックに 1 つだけあるとき、
ブロックの項目です。
行に単独で、書かれたまま置きます。
間に空白だけがある単位の並びは 1 つの項目です。
[fixture: attribute-blocks/ignored-text-own-line]
[fixture: attribute-blocks/ignored-text-run-kept]
[corpus fixture: er/gram-empty-backquotes-between-attributes]
[corpus fixture: er/gram-empty-backquotes-twice]
`}` の行で `}` の前にあるディレクティブはそこに書かれたまま残し、
`}` の後にあるものは、その前に書かれた空白を保ちます。
[fixture: attribute-blocks/directive-on-closing-line-kept]
[fixture: attribute-blocks/directive-after-closing-brace-kept]
ブロックの中のコメント行と空行は、
ほかのブロックと同じに扱います（[コメント](#コメント)と[空行](#空行)を参照）。
[fixture: attribute-blocks/comment-lines-and-blank-lines]

入力
([attribute-blocks/split-input.mmd](../tests/fixtures/er/attribute-blocks/split-input.mmd)):

```mmd
erDiagram
CAR{
string registrationNumber PK
        string make
}
PERSON { string firstName string lastName }
HOUSE {string address
int number}
```

出力
([attribute-blocks/split-output.mmd](../tests/fixtures/er/attribute-blocks/split-output.mmd)):

```mmd
erDiagram
  CAR {
    string registrationNumber PK
    string make
  }
  PERSON {
    string firstName
    string lastName
  }
  HOUSE {
    string address
    int number
  }
```

入力
([attribute-blocks/ignored-text-own-line-input.mmd](../tests/fixtures/er/attribute-blocks/ignored-text-own-line-input.mmd)):

```mmd
erDiagram
A { int a `` string b }
B {
``
}
C {
`` int c
}
D {
int d ``
}
```

出力
([attribute-blocks/ignored-text-own-line-output.mmd](../tests/fixtures/er/attribute-blocks/ignored-text-own-line-output.mmd)):

```mmd
erDiagram
  A {
    int a
    ``
    string b
  }
  B {
    ``
  }
  C {
    ``
    int c
  }
  D {
    int d
    ``
  }
```

入力
([attribute-blocks/directive-on-closing-line-kept-input.mmd](../tests/fixtures/er/attribute-blocks/directive-on-closing-line-kept-input.mmd)):

```mmd
erDiagram
A {
int a
%%{init: {}}%% }
```

出力
([attribute-blocks/directive-on-closing-line-kept-output.mmd](../tests/fixtures/er/attribute-blocks/directive-on-closing-line-kept-output.mmd)):

```mmd
erDiagram
  A {
    int a
  %%{init: {}}%% }
```

### 属性の空白

属性は 1 行に印字します。
型、名前、キー、コメントの間は空白 1 つで、
2 つの部分の間の空白とタブの連続は空白 1 つにします。
[fixture: attribute-spacing/parts-collapsed]
属性は列にそろえません。
そろえると、属性を 1 つ変えただけでブロックの全行が変わり、
名前の幅は文字数で数えられず、mermaid.js の文書の例もそろえていないからです。
空白 1 つと、型に接する `?` は、その例の形です。
省略可能な型の `?` は、どう書かれていても型に接します。
[fixture: attribute-spacing/optional-touching]
キーは、前に空白を置かない `,` と空白 1 つで区切り、
書かれた大文字小文字を保ちます。
Db が保つからです。 [fixture: attribute-spacing/keys-comma-space]
[fixture: attribute-spacing/keys-case-kept]
コメントは、名前やキーに接して書かれていても、空白 1 つの後に置きます。
[fixture: attribute-spacing/comment-one-space]
型や名前のテキストは書かれたまま残します。
ただし、チルダの語やバッククォートの語の中の空白とタブの連なりは、
空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
コメントのテキストは保ちます。
[fixture: attribute-spacing/tilde-word-runs-collapsed]
[fixture: attribute-spacing/backquoted-word-runs-collapsed]

複数行に書かれた属性は 1 行に印字します。
属性ブロックは改行に関係なく読まれるからです。
[fixture: attribute-spacing/over-lines-joined]
[corpus fixture: er/gram-attribute-split-lines]
[corpus fixture: er/gram-name-then-key-next-line]
部分の間にコメント行かディレクティブがある属性は、改行を保ちます。
後続の構造部分と独立した注釈類行は、subgraph の中でも、
属性の内側に 1 段字下げします。
型、名前、引用符付きコメントの内部は書かれたまま残します。
[fixture: attribute-spacing/comment-line-inside-kept]
[fixture: attribute-spacing/directive-inside-kept]
[fixture: attribute-spacing/comment-continuation-with-multiline-value]
[fixture: attribute-spacing/directive-continuation-tabs]
セミコロンがあるだけでは、継続行をそろえる妨げにはなりません。
[fixture: attribute-spacing/semicolon-continuation-aligned]
物理行を結ぶコメント領域は、元の配置を保ちます。
[test: er/attribute-spacing/comment-region-continuation-kept]
属性の部分の間にあるディレクティブは、同じ印字行での接触を保ち、
2 つの属性の間で行に単独で置かれたディレクティブは、その間に残します。
同じ行に書かれた 2 つの属性の間のディレクティブは、各属性が単独の行に立つので、
後ろの属性と一緒に次の行へ移ります。
[fixture: attribute-spacing/directive-between-attributes-on-a-line]
[fixture: attribute-spacing/directive-inside-kept]
[fixture: attribute-spacing/directive-and-line-break-kept]

入力
([attribute-spacing/keys-comma-space-input.mmd](../tests/fixtures/er/attribute-spacing/keys-comma-space-input.mmd)):

```mmd
erDiagram
A {
int a PK,FK
int b PK , FK
int c UK  ,  PK  ,  FK
}
```

出力
([attribute-spacing/keys-comma-space-output.mmd](../tests/fixtures/er/attribute-spacing/keys-comma-space-output.mmd)):

```mmd
erDiagram
  A {
    int a PK, FK
    int b PK, FK
    int c UK, PK, FK
  }
```

入力
([attribute-spacing/optional-touching-input.mmd](../tests/fixtures/er/attribute-spacing/optional-touching-input.mmd)):

```mmd
erDiagram
A {
string? a
string  ?  b
`x` ? c
List~int~ ? d
}
```

出力
([attribute-spacing/optional-touching-output.mmd](../tests/fixtures/er/attribute-spacing/optional-touching-output.mmd)):

```mmd
erDiagram
  A {
    string? a
    string? b
    `x`? c
    List~int~? d
  }
```

入力
([attribute-spacing/over-lines-joined-input.mmd](../tests/fixtures/er/attribute-spacing/over-lines-joined-input.mmd)):

```mmd
erDiagram
A {
int
  a
int b
  PK
int c PK ,
 FK
int d
"comment"
}
```

出力
([attribute-spacing/over-lines-joined-output.mmd](../tests/fixtures/er/attribute-spacing/over-lines-joined-output.mmd)):

```mmd
erDiagram
  A {
    int a
    int b PK
    int c PK, FK
    int d "comment"
  }
```

### 1 行に 1 文

ER 図の 2 つの文を区切るものはなく、
mermaid.js は 1 行に続けて書かれた文も読みます。
1 行に 2 つの文があると読みにくいため、各文は行に単独で置きます。
flowchart、sequence、class、state も 1 行に 1 つの文を印字します。
`A B` は実体 A と B で、関係は 1 行に、その役割の後の実体は次の行に置き、
属性ブロックの `}`、subgraph の `end`、ヘッダーの後に続く文も、
次の行に置きます。 [fixture: statements-one-per-line/entities]
[fixture: statements-one-per-line/relationships]
[fixture: statements-one-per-line/role-then-entity]
[fixture: statements-one-per-line/subgraph-end-then-entity]
[fixture: statements-one-per-line/class-and-accessibility]
[fixture: statements-one-per-line/header-line]
[fixture: statements-one-per-line/header-line-spaces]
[corpus fixture: er/gram-two-relationships-one-line]
[corpus fixture: er/lex-role-then-name]
何も変えない空の説明ブロックは、文が始まる所ならどこでも文で、
行に単独で印字します。
[fixture: statements-one-per-line/empty-description-blocks]
[corpus fixture: er/gram-empty-description-block-between-names]
2 つの文の間のディレクティブは、後ろの文と一緒に置きます。
[fixture: statements-one-per-line/directive-after-statement]

無視される `;` は、行規則がそれを無視する根拠となる行に残します。
`"style:#x" end;` の `end` は、前の実体と同じ行に、大文字でも残します。
`class` や `subgraph` と最初の名前の間に無視される `;` があるときは、
隙間全体を書かれたまま残します。
`class;-A a`、`subgraph;-x`、`subgraph;é` は、
行規則が `;` を取り除いた後の接し方を保ちます。
subgraph の名前の前に U+2028 や U+2029 があるときも同じです。
[fixture: statements-one-per-line/closing-end-ignored-semicolon-kept]
[fixture: statements-one-per-line/closing-uppercase-end-ignored-semicolon-kept]
[fixture: statements-one-per-line/class-ignored-semicolon-before-dash-kept]
[fixture: statements-one-per-line/subgraph-ignored-semicolon-before-dash-kept]
[fixture: statements-one-per-line/subgraph-ignored-semicolon-before-non-ascii-kept]
[test: er/statements-one-per-line/R44-er-subgraph-LS-c-before]
[test: er/statements-one-per-line/R44-er-subgraph-PS-c-before]

いくつかの場合は、文を 1 行に残します。
実体 `1` の直後に、空白なしで、またはディレクティブだけを挟んで、別の文や、
その subgraph の `end` が続くときは、そのままにします。
`1a` は実体 `1` と `a` ですが、`1` と文字を 2 行に分けたり、
間に空白を置いたりすると、
カーディナリティ `only-one` と名前になるからです（diagrams/er.md、
カーディナリティ、数、関係の線、規則 11）。
2 桁以上の数の名前の実体も、直後に名前が続く文字（英字、`_`、`-`、`*`、
ASCII 外の文字）があれば、その行に残します。
`12a` は、固定した版では実体 `12` と `a` ですが、
対象にする版の一部では 1 つの名前で、2 行に分けると違って描くからです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
数とその文字の間にディレクティブがあっても、変わりません。
mermaid.js は、テキストを読む前にディレクティブを取り除くからです。
`2.5x` のようなほかの数は、後ろの文と分けます。
そのような実体の行は書かれたまま印字し、その行で終わる subgraph も、
ヘッダーから `end` まで、行ごとの 1 段の字下げなしで書かれたまま印字します。
[fixture: statements-one-per-line/number-name-then-name-kept]
[fixture: statements-one-per-line/number-name-before-uppercase]
[fixture: statements-one-per-line/number-name-before-non-ascii]
[fixture: statements-one-per-line/number-name-in-subgraph-kept]
[fixture: statements-one-per-line/number-name-before-end-kept]
[fixture: statements-one-per-line/number-name-before-directive-kept]
[fixture: statements-one-per-line/number-name-then-name-split]
[corpus fixture: er/lex-name-number-then-letter]
[corpus fixture: er/lex-name-number2-then-letter]
`subgraph` キーワードと名前の間に ASCII 外の文字か、
空白とタブ以外の空白文字（U+2028、U+2029、U+00A0、U+3000 など。diagrams/er.md、
空白）があれば、書かれたままにします。
`end` の後にそうした文字が続く文も、`end` の行に、
隙間を書かれたままにして残します。
`endé` は、固定した版ではキーワード `end` と実体 `é` ですが、
対象にする版の一部では 1 つの名前だからです。
`end` の行の終わりにある同じ種類の空白文字は、1 回だけ残します。
コメントやディレクティブの前や、空行を挟んで別の文が続くときも同じです。
[test: er/statements-one-per-line/R63-er-ascii-after-LS-e]
[test: er/statements-one-per-line/R44-er-after-separator-LS-e]
[test: er/statements-one-per-line/R44-er-after-separator-PS-e]
[test: er/statements-one-per-line/R74-er-LS-g-comment]
[test: er/statements-one-per-line/R74-er-LS-g-directive]
[test: er/statements-one-per-line/R74-er-PS-g-comment]
[test: er/statements-one-per-line/R74-er-PS-g-directive]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R63-er-ascii-after-LS-e]
[test: U+3000 in place of the separator: er/statements-one-per-line/R63-er-ascii-after-LS-e]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R44-er-after-separator-LS-e]
[test: U+3000 in place of the separator: er/statements-one-per-line/R44-er-after-separator-LS-e]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R74-er-LS-g-directive]
[test: U+3000 in place of the separator: er/statements-one-per-line/R74-er-LS-g-directive]
そうした文字で始まる文も、対象にする版の一部がテキストを、
空白の終わりから `class` の文、または方向の行として読む場合は、
後ろの文と一緒に残します。
固定した版は、その文字を最初の名前の一部として読みますが、
対象にする版のその一部は、キーワードの前の空白として読むからです。
`class A a` は、キーワードの後ろに名前が 2 つあるので、行にわたって続きます。
どちらの名前の前の空白も、改行以外の空白で始まる場合は、改行を越えて続きます。
この場合は、2 番目の名前までの両方の隙間を、コメント行、ディレクティブ、
空行を含めて書かれたまま残します。
キーワードや最初の名前の直後にある改行は、class の文を続けません。
[test: er/statements-one-per-line/R45-er-class-LS-d]
[test: er/statements-one-per-line/R45-er-class-LS-e]
[test: er/statements-one-per-line/R45-er-class-PS-d]
[test: er/statements-one-per-line/R45-er-class-PS-e]
[test: er/statements-one-per-line/R45-er-second-name-LS-d]
[test: er/statements-one-per-line/R45-er-second-name-LS-e]
[test: er/statements-one-per-line/R45-er-nonascii-name-LS-d]
[test: er/statements-one-per-line/R45-er-nonascii-name-LS-e]
[test: er/statements-one-per-line/R45-er-second-name-PS-d]
[test: er/statements-one-per-line/R45-er-second-name-PS-e]
[test: er/statements-one-per-line/R45-er-nonascii-name-PS-d]
[test: er/statements-one-per-line/R45-er-nonascii-name-PS-e]
[test: er/statements-one-per-line/class-names-after-directive-ls]
[test: er/statements-one-per-line/class-second-name-after-directive-ps]
`A direction LR` と `A B direction LR` は、その版では方向の行で、
`direction` の前にある文も含めます。
`direction LR B` や、値が次の行にある `direction` も、
値の後ろに文が続くときは同じで、その文は値のある行に残します。
ほかの語（`classes`、`directionX`、名前）で始まる文、名前が 1 つの `class`、
値だけが続く `direction` は、後ろの文と分けます。
そうした `end` の後の引用符つきの名前は、引用符を残します。
キーワードとその後ろの間にディレクティブがあっても、変わりません。
ディレクティブが U+2028 や U+2029 の前にあっても、ASCII 外の文字に接していても、
同じです。 [fixture: statements-one-per-line/end-then-name-outside-ascii-kept]
[fixture: statements-one-per-line/subgraph-then-name-outside-ascii-kept]
[fixture: statements-one-per-line/end-directive-then-name-outside-ascii-kept]
[fixture: statements-one-per-line/subgraph-directive-then-name-outside-ascii-kept]
[corpus fixture: er/lex-keyword-end-then-e-acute]
[corpus fixture: er/lex-keyword-subgraph-then-e-acute]
[corpus fixture: er/db-subgraph-direction-after-nested-end-line-separator]
[test: U+2028 between the end of an ER subgraph and the next entity]
[test: a directive between the end of an ER subgraph and a U+2028]
[test: a directive between the end of an ER subgraph and a U+2029 and a name in quotes]
[test: a directive between the keyword of an ER subgraph and a U+2028]
[test: a directive between an ER number name and a U+2028]
[test: a line of two ER statements that starts with U+2028]
[test: a line that starts with U+2029 and class, and two more statements]
[test: a line that starts with U+2028 and direction, and two more statements]
[test: a statement with U+2028 and class after a space, and two more statements]
[test: a line that starts with U+2028 and a name, and one more statement]
[test: a line that starts with U+2028 and a word that starts like class]
[test: a line that starts with U+2028 and a word that starts like direction]
[test: a line that starts with U+2028, a name, and a direction line]
[test: a line that starts with U+2029, two names, and a direction line]
[test: a line that starts with U+2028, a relationship, and a direction line]
[test: a direction line after a name and a name that starts with U+2028]
[test: a line that starts with U+2028 and direction, and a value on the next line that a statement follows]
[test: a line that starts with U+2028, a name, and a direction line with a directive before its value]
[test: a line that starts with U+2028, a name, and a direction line in upper case]
[test: a line that starts with U+2028, class and a character outside ASCII, and one more statement]
[test: a line that starts with U+2028 and CLASS in upper case, and two more statements]
[test: a line in an ER subgraph that starts with U+2028, a name, and a direction line]
[test: a line that starts with U+2028 and direction, and its value alone]
[test: a line that starts with U+2028 and a name that ends with direction, and its value alone]
[test: a line that starts with U+2028 and direction, and a value glued to a letter]
[test: a line that starts with U+2028 and direction, and a relationship that starts with its value]
[test: a line that starts with U+2028, a name, and direction without a direction]
[test: a line that starts with U+2028, a name, a second U+2028, and a direction line]
[test: a line that starts with U+2028 and direction, its value, and a statement on the next line]
[test: a line that starts with U+2028 and a name, and a directive that holds a direction]
[test: a line that starts with U+2028 and class, and one more statement]
[test: a line that starts with U+2028 and class, and a name on the next line]
[test: a line that starts with U+2028 and class, and two names in quotes]
[test: a line that starts with U+2028 and class, and a name with a class]
[test: a line that starts with U+2028, a space, and class]
[test: a line that starts with U+2028, a space, a name, and a direction line]
[test: U+00A0 in place of the separator: er/statements-one-per-line/class-names-after-directive-ls]
[test: U+3000 in place of the separator: er/statements-one-per-line/class-names-after-directive-ls]
[test: U+00A0 in place of the separator: er/statements-one-per-line/class-second-name-after-directive-ps]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R45-er-class-LS-d]
[test: U+3000 in place of the separator: er/statements-one-per-line/R45-er-class-LS-d]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R45-er-class-LS-e]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R45-er-second-name-LS-d]
[test: U+3000 in place of the separator: er/statements-one-per-line/R45-er-second-name-LS-d]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R45-er-second-name-LS-e]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R45-er-nonascii-name-LS-d]
[test: U+00A0 in place of the separator: er/statements-one-per-line/R45-er-nonascii-name-LS-e]
[test: U+00A0 in place of the separator: a line of two ER statements that starts with U+2028]
[test: U+3000 in place of the separator: a line of two ER statements that starts with U+2028]
[test: U+00A0 in place of the separator: a line that starts with U+2029 and class, and two more statements]
[test: U+3000 in place of the separator: a line that starts with U+2029 and class, and two more statements]
[test: U+00A0 in place of the separator: a statement with U+2028 and class after a space, and two more statements]
[test: U+00A0 in place of the separator: a line that starts with U+2028, class and a character outside ASCII, and one more statement]
[test: U+00A0 in place of the separator: a line that starts with U+2028 and CLASS in upper case, and two more statements]
[test: U+00A0 in place of the separator: U+2028 between the end of an ER subgraph and the next entity]
[test: U+3000 in place of the separator: U+2028 between the end of an ER subgraph and the next entity]
[test: U+00A0 in place of the separator: U+2029 between the end of an ER subgraph and a relationship]
[test: U+00A0 in place of the separator: U+2028 after the end of an ER subgraph that nothing follows]
[test: U+3000 in place of the separator: U+2028 after the end of an ER subgraph that nothing follows]
[test: U+00A0 in place of the separator: a name in quotes after the end of an ER subgraph and a U+2028]
[test: U+3000 in place of the separator: a name in quotes after the end of an ER subgraph and a U+2028]
[test: U+00A0 in place of the separator: a directive between the end of an ER subgraph and a U+2028]
[test: U+00A0 in place of the separator: a directive between the end of an ER subgraph and a U+2029 and a name in quotes]
空白とタブ以外の空白文字（U+2028、U+2029、
その前に置かれたノーブレークスペース）で始まる文は、同じ行のほかの文の後にあり、
その空白の後に、空白、改行、ディレクティブだけを挟んでコメントが続くとき、
その行に残します。
mermaid.js は、その空白を実体の名前として読み、その実体を描きます。
その空白だけを 1 行に置くと、空白はコメント行のものになり、実体は描かれません。
コメント行は、`%%` の前の空白と改行を一緒に取るからです。
行の末尾にあって次がディレクティブのときは、ほかの文と同じく、
前の文から分けます。
行の先頭にあるときは、コメントの前の空白です。
[test: U+2028 alone after a name in quotes, before a comment]
[test: U+2029 alone after a name in quotes and a space, before a comment]
[test: U+2028 alone after the block of an accessibility description, before a comment]
[test: two U+2028 alone after a name in quotes, before a comment]
[test: U+00A0 and U+2028 after a name in quotes, before a comment]
[test: U+00A0 after a name in quotes at the end of its line, and U+2028 and a comment on the next line]
[test: U+2028 alone after a name in quotes, at the end of its line]
[test: U+2028 alone after a name in quotes, before a directive]
[test: U+2028 alone at the start of its line, before a comment]
最初の実体の名前が空白とタブ以外の空白文字だけ（U+2028、U+2029、U+00A0、U+3000、
U+FEFF などが 1 つか複数）の文が、同じ行のほかの文の後にあり、その名前の後に、
属性ブロック、別名、CSS のクラス、関係が続くときも、
その行に残します（`"Alpha"`、その文字、`{ int x }`）。
対象にする版のうち、最も古いいくつかの版は、その文字を空白として読み、
残りを前の文の一部として読むので、残りが行を始めることはできないからです。
その文字の後の 2 つ目の名前は、分けます。
その文字とほかの文字からなる名前（`LR`）も、行を始めるので、分けます。
[test: U+2028 and an attribute block after a name in quotes]
[test: U+2028 and an attribute block touching it after a name in quotes]
[test: U+2028, a directive, and an attribute block after a name in quotes]
[test: U+2029 and a relationship after a name in quotes]
[test: U+2028 and an alias after a name in quotes]
[test: U+2028 and a CSS class after a name in quotes]
[test: U+2028 and a second name after a name in quotes]
[test: U+00A0 in place of the separator: U+2028 and an attribute block after a name in quotes]
[test: U+3000 in place of the separator: U+2028 and an attribute block after a name in quotes]
[test: U+00A0 in place of the separator: U+2028 and an attribute block touching it after a name in quotes]
[test: U+3000 in place of the separator: U+2028 and an attribute block touching it after a name in quotes]
[test: U+00A0 in place of the separator: U+2028, a directive, and an attribute block after a name in quotes]
[test: U+3000 in place of the separator: U+2028, a directive, and an attribute block after a name in quotes]
[test: U+00A0 in place of the separator: U+2029 and a relationship after a name in quotes]
[test: U+3000 in place of the separator: U+2029 and a relationship after a name in quotes]
[test: U+00A0 in place of the separator: U+2028 and an alias after a name in quotes]
[test: U+3000 in place of the separator: U+2028 and an alias after a name in quotes]
[test: U+00A0 in place of the separator: U+2028 and a CSS class after a name in quotes]
[test: U+3000 in place of the separator: U+2028 and a CSS class after a name in quotes]
[test: U+00A0, U+2028, and an attribute block after a name in quotes]
[test: U+3000, U+2028, and an attribute block after a name in quotes]
[test: U+FEFF and an attribute block after a name in quotes]
[test: U+2003 and an attribute block after a name in quotes]
[test: U+3000 and an attribute block after a name in quotes]
[test: U+00A0 and a second name after a name in quotes]
複数の属性がある行は、その行の後ろの属性が、
`int a List~int~ b` のように `~` を 2 つ持つときに、書かれたまま印字します。
対象にする版のうち最も古い版が、ジェネリクスの型を、
属性の先頭から行の残りを越えて 2 つ目の `~` まで続く規則で読むからです。
`~` が文字列かディレクティブの中にしかない行と、
自分の型が `~` を 2 つ持つ属性は、分けます。
ディレクティブは、mermaid.js がテキストを読む前に取り除くからです。
[fixture: attribute-spacing/attributes-with-tilde-on-one-line-kept]
[fixture: attribute-spacing/attributes-with-generic-type-later-on-one-line-kept]
[fixture: attribute-spacing/attributes-with-generic-type-first-on-one-line-split]
[fixture: attribute-spacing/attributes-with-tilde-in-quotes-on-one-line-split]
[fixture: attribute-spacing/attributes-with-tilde-in-directive-on-one-line-split]
[corpus fixture: er/lex-tilde-after-quoted]
書かれたまま残るこれらの行のどれでも、複数行の属性ブロックを持つ実体は、
[属性ブロック](#属性ブロック)と同じに、ブロックとして印字します。
行の文はその行に一緒に残り、文の単位の間の空白は、
mermaid.js が行をどう読むかを決めないかぎり通常どおり整形します。
空でないブロックでは、`{` の後ろにあるものは書かれたまま残り、
属性と `}` はほかの実体と同じに置きます。
そのため、`1A {`、改行、`}` は、`1A { }` になります。
[fixture: attribute-blocks/written-line-number-name]
[fixture: attribute-blocks/written-line-tilde-line]
[fixture: attribute-blocks/written-line-unclosed-directive]
[fixture: attribute-blocks/written-line-closing-brace]
[fixture: attribute-blocks/semicolon-line]
[test: an empty attribute block over several lines after U+2028 and class]
[test: an attribute block over several lines after U+2028 and class]
[test: an empty attribute block over several lines after a name in quotes and U+2028]
[test: an attribute block over several lines after a name in quotes and U+2028]
[test: an empty attribute block over several lines after a name in quotes and U+2029]
[test: an empty attribute block over several lines after a semicolon that the line rule ignores and U+2028]
[test: an attribute block over several lines after a semicolon that the line rule ignores and U+2028]
[test: an attribute block over several lines of an entity after a statement that starts with U+2028 and a comment line]
[test: an empty attribute block over several lines of an entity after a statement that starts with U+2028 and a comment line]
`end` の後ろにあって、`end` の行に残る実体は、
その前の隙間だけを書かれたままにし、ブロックはほかの行と同じに印字します。
[test: an attribute block over several lines of an entity after the end of an ER subgraph and U+2028]
[test: an empty attribute block over several lines of an entity after the end of an ER subgraph and U+2028]
このように前の隙間を書かれたままにする文は、その行が書かれたまま残るとき、
後ろに続くテキストと一緒にその行に残り、単独の行には移りません。
行が書かれたまま残る理由は、何であっても同じです。
次の行をつなぐ U+2028 の後のコメント行、引用符つきの名前の中の `;`、
文字に接する実体 `1`、1 行の属性ブロックにある一対の `~`、
閉じていないディレクティブがその例です。
その行にあるブロックは、上と同じに印字します。
[test: an ER statement attached to a class name after U+00A0, and a comment line after U+2028 and a statement]
[test: an ER statement attached to a class name after U+00A0, and a comment line after U+2028 and an attribute block on one line]
[test: an ER statement attached to a class name after U+00A0, and a comment line after U+2028 and an empty attribute block over several lines]
[test: an ER statement attached to a class name after U+2028, and a comment line after U+2028 and a statement]
[test: an ER statement attached to a class name after U+00A0, and a name in quotes that holds a semicolon]
[test: an ER statement attached to a class name after U+00A0, and the entity 1 that touches a letter]
[test: an ER statement attached to a class name after U+00A0, and an attribute block with a pair of tildes on one line]
[test: an ER statement attached to a class name after U+00A0, and a directive that is not closed]
[test: an ER statement after the end of a subgraph and U+2028, and a comment line after U+2028 and a statement]
[test: an ER statement that touches the end of a subgraph with a dash, and a comment line after U+2028 and a statement]
また、保持する `;` がある行は、その文を一緒に残します。
mermaid.js の行の規則は行のテキストを読み、テキストを別の行に動かすと、
規則に合う行と、規則が無視する `;` が、
変わるからです（[スタイルとクラス](#スタイルとクラス)を参照）。
[fixture: statements-one-per-line/semicolon-line-kept]
[fixture: statements-one-per-line/ignored-semicolon-line-kept]
そのような行にある属性ブロックの `}` や subgraph の `end` が、
行の上で後ろに文を従えているときは、`}` や `end` が単独の行に移り、
文は `;` のない行に残ってしまうので、行に残し、
行はトークンの間の空白を通常どおりにして印字します。
後ろに文がなければ、ほかのブロックと同じく単独の行に置きますが、
同じ行の後ろに行の規則が無視する `;` が続く場合は例外です。
`"Alpha" { int x "style:#x" };` のように、
その `;` は同じ行の前のテキストによって無視されるので、`}` もその行に残します。
`}` の前で改行すると、`;` がそのテキストのない行に残り、構文エラーになります。
[fixture: statements-one-per-line/semicolon-line-block-kept]
[fixture: statements-one-per-line/semicolon-line-subgraph-end-kept]
[fixture: statements-one-per-line/semicolon-after-block-closing-kept]

入力
([statements-one-per-line/entities-input.mmd](../tests/fixtures/er/statements-one-per-line/entities-input.mmd)):

```mmd
erDiagram
A B C
D:::c E[Entity] F { int f } G
```

出力
([statements-one-per-line/entities-output.mmd](../tests/fixtures/er/statements-one-per-line/entities-output.mmd)):

```mmd
erDiagram
  A
  B
  C
  D:::c
  E[Entity]
  F {
    int f
  }
  G
```

入力
([statements-one-per-line/relationships-input.mmd](../tests/fixtures/er/statements-one-per-line/relationships-input.mmd)):

```mmd
erDiagram
A ||--o{ B : x C ||--o{ D : y
E }|..|{ F : "z" G
```

出力
([statements-one-per-line/relationships-output.mmd](../tests/fixtures/er/statements-one-per-line/relationships-output.mmd)):

```mmd
erDiagram
  A ||--o{ B : x
  C ||--o{ D : y
  E }|..|{ F : z
  G
```

入力
([statements-one-per-line/number-name-then-name-kept-input.mmd](../tests/fixtures/er/statements-one-per-line/number-name-then-name-kept-input.mmd)):

```mmd
erDiagram
1a
1"x"
B
12a
```

出力
([statements-one-per-line/number-name-then-name-kept-output.mmd](../tests/fixtures/er/statements-one-per-line/number-name-then-name-kept-output.mmd)):

```mmd
erDiagram
  1a
  1"x"
  B
  12a
```

### 空行

class 図と同じです。
連続する空行は 1 つにし、図、属性ブロック、
subgraph の先頭と末尾の空行は落とします。 [fixture: blank-lines/collapsed]
[fixture: blank-lines/block-edges-dropped]
[fixture: blank-lines/header-and-end-of-text-dropped]
[fixture: blank-lines/between-attributes-collapsed]
[fixture: blank-lines/around-comment-and-directive-lines]

入力
([blank-lines/block-edges-dropped-input.mmd](../tests/fixtures/er/blank-lines/block-edges-dropped-input.mmd)):

```mmd
erDiagram
A {


int a

int b


}
subgraph S


B

C


end
```

出力
([blank-lines/block-edges-dropped-output.mmd](../tests/fixtures/er/blank-lines/block-edges-dropped-output.mmd)):

```mmd
erDiagram
  A {
    int a

    int b
  }
  subgraph S
    B

    C
  end
```

入力
([blank-lines/between-attributes-collapsed-input.mmd](../tests/fixtures/er/blank-lines/between-attributes-collapsed-input.mmd)):

```mmd
erDiagram
A {
int a


int b
}
```

出力
([blank-lines/between-attributes-collapsed-output.mmd](../tests/fixtures/er/blank-lines/between-attributes-collapsed-output.mmd)):

```mmd
erDiagram
  A {
    int a

    int b
  }
```

### トークンの間の空白

行の中では、2 つのトークンの間の空白とタブの連続は空白 1 つにし、
接しているトークンは、以下の規則が別に定めるものを除き、接したままにします。
[fixture: whitespace-between-tokens/collapsed]
[fixture: whitespace-between-tokens/touching-kept]
キーワード（`SUBGRAPH`、`END`、`DIRECTION`、`CLASS`、`CLASSDEF`、`STYLE`）は、
書かれた大文字小文字を保ちます。
（[大文字小文字をそろえるキーワード](./compatibility.ja.md#大文字小文字をそろえるキーワード)）。
Db がそのまま保つ属性のキーも同じです。
関係の語は記号として印字します（[関係の空白](#関係の空白)を参照）。
[fixture: whitespace-between-tokens/keyword-case-kept]
[fixture: relationship-spacing/cardinality-words-case-one-form]

`class` と `subgraph` のキーワードに `-` で始まる単位が接する場合と、
`end` に `-` で始まる文が接する場合は、接したままにします。
`class-A a` は `class -A a` と印字しません。
対象にする版の 1 つが拒否するためです。
`subgraph-x` と `end-x` は分けません。
対象にする版にエンティティとして読むものがあるためです。
詳しくは
[置かれた場所や空白で読みが決まる ER の行](./compatibility.ja.md#置かれた場所や空白で読みが決まる-er-の行)
と
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
キーワードと `-` の間のディレクティブは、2 つを分けません。
mermaid.js が、テキストを読む前にディレクティブを取り除くからです。
`class%%{init: {}}%%-A a` はそのまま残ります。
`classDef` と `style` は対象外で、`classDef-x` は `classDef -x` と印字します。
行の規則が無視する `;` も、キーワードと `-` を分けません。
[fixture: whitespace-between-tokens/class-then-dash-ignored-semicolon-kept]
[fixture: whitespace-between-tokens/class-then-dash-directive-kept]
[fixture: whitespace-between-tokens/subgraph-then-dash-directive-kept]
[fixture: whitespace-between-tokens/end-then-dash-directive-kept]
[fixture: whitespace-between-tokens/keyword-then-dash-touching-kept]
[fixture: whitespace-between-tokens/keyword-upper-then-dash-touching-kept]
[fixture: whitespace-between-tokens/subgraph-then-dash-touching-kept]
[fixture: whitespace-between-tokens/end-then-dash-touching-kept]
[fixture: whitespace-between-tokens/classdef-style-then-dash-spaced]
[fixture: whitespace-between-tokens/keyword-then-dash-apart]

入力
([whitespace-between-tokens/touching-kept-input.mmd](../tests/fixtures/er/whitespace-between-tokens/touching-kept-input.mmd)):

```mmd
erDiagram
A:::c
p[P]
accDescr{ D }
A ||--u-B : x
1one to one B : x
```

出力
([whitespace-between-tokens/touching-kept-output.mmd](../tests/fixtures/er/whitespace-between-tokens/touching-kept-output.mmd)):

```mmd
erDiagram
  A:::c
  p[P]
  accDescr: D
  A ||--u-B : x
  1 ||--|| B : x
```

入力
([whitespace-between-tokens/keyword-case-kept-input.mmd](../tests/fixtures/er/whitespace-between-tokens/keyword-case-kept-input.mmd)):

```mmd
erDiagram
SUBGRAPH S
A
END
CLASSDEF a fill:red
CLASS A a
STYLE A fill:red
DIRECTION lr
ACCTITLE: T
ACCDESCR: D
ACCDESCR { D }
A ONE OR MORE TO MANY B : x
A {
int a PK
}
```

出力
([whitespace-between-tokens/keyword-case-kept-output.mmd](../tests/fixtures/er/whitespace-between-tokens/keyword-case-kept-output.mmd)):

```mmd
erDiagram
  SUBGRAPH S
    A
  END
  CLASSDEF a fill: red
  CLASS A a
  STYLE A fill: red
  DIRECTION lr
  ACCTITLE: T
  ACCDESCR: D
  ACCDESCR: D
  A }|--o{ B : x
  A {
    int a PK
  }
```

### 関係の空白

関係は、左の実体と関係の間、関係と右の実体の間、役割の `:` の両側に、
どう書かれていても空白 1 つを置きます。
このコロンは、関係とその役割の間に立つ記号とも読めるので、コロンの前の空白は、
mermaid.js の文書の例が、ほかのどの形よりも 2 倍以上の頻度で書く形です。
例では、コロンの後に空白がある関係の行 40 行のすべてが、コロンの前に空白を持ち、
実体に接する行はありません。
数え方は
[コロンの前の空白を決める例](./compatibility.ja.md#コロンの前の空白を決める例)
を参照してください。
役割は名前、文字列、引用符つきの名前のどれでも同じです。
[fixture: relationship-spacing/around-units-and-role]
[fixture: relationship-spacing/names-and-classes]
[fixture: relationship-spacing/role-forms]
[corpus fixture: er/lex-relationship-no-spaces]
[corpus fixture: er/lex-colon-no-space]
実体の最初のクラスは `:::` に接し、クラスの間の `,` は前のクラスに接して、
後ろに空白を 1 つ置きます。 [fixture: relationship-spacing/names-and-classes]

関係のカーディナリティと線は、語と記号のどちらが書かれていても、
記号で印字します。
mermaid.js は `only one`、`zero or more`、`many(0)`、`to` などの語を `||`、
`}o`、`o{`、`--` の記号として読み、その文書の例は記号を 84 回、
語とほかの形を 6 回使うためです。
（[ER 図の関係](./compatibility.ja.md#er-図の関係)を参照）。
[fixture: relationship-spacing/words-to-symbols]
[fixture: relationship-spacing/cardinality-words-case-one-form]
[fixture: relationship-spacing/words-spaced]
関係の 3 つの単位、つまり両側のカーディナリティとその間の線は、互いに接します。
文書の例は記号を接して書くためです。
`A || -- o{ B` は `A ||--o{ B` に、`A ||--only one B` は `A ||--|| B` にします。
[fixture: relationship-spacing/symbols-touch]
[fixture: relationship-spacing/symbols-and-words]
[corpus fixture: er/lex-relationship-spaces-in-spec]
`u` は記号として扱い、書かれたまま残します。
`many(0)` の中に空白を置くと拒否されます。
逆の側に書かれた記号は、その側の記号として印字します。
左の `o|` は `|o` です。
[fixture: relationship-spacing/symbols-on-the-other-side]
[corpus fixture: er/lex-many-space-before-parenthesis]
単位の間にディレクティブがある関係は、書かれた語を保ちます。
[fixture: relationship-spacing/directive-between-word-units-kept]

3 つの場合は、注意が必要です。
空白や綴りを変えると mermaid.js が別の単位を読むからです。
右のカーディナリティ `u` は、名前の直前でだけ `md-parent` なので、
右の実体に接したままにします。 [fixture: relationship-spacing/md-parent]
[corpus fixture: er/lex-md-parent-right-glued-name]
実体 `1` は、文字、数字、`_` で始まる形で印字するカーディナリティに接します。
`1` の後に、改行を含む 1 つ以上の空白と、ASCII の文字、`_`、`"`、`'`、
ASCII の数字が続くと、カーディナリティ `only-one` だからです（diagrams/er.md、
カーディナリティ、数、関係の線、規則 11）。
記号として印字する語の前には、空白を置きます。
`1one to one B` は `1 ||--|| B` と印字します。
[fixture: relationship-spacing/number-name-before-unit-kept]
[corpus fixture: er/lex-one-space-letter]
実体 `only` は、`one` で始まるカーディナリティの前でも実体のままです。
空白がちょうど 1 つの `only one` はカーディナリティ `only one`（規則 9）で、
複数の語のキーワードは語の間の空白がちょうど 1 つなので、
空白 2 つやタブなら `only` は実体です（diagrams/er.md、文の文脈、
キーワードとその後ろ）。
カーディナリティは、その記号として印字します。
`only  one to one B` は `only ||--|| B` と印字します。
[fixture: relationship-spacing/entity-only-before-one-kept]
[fixture: relationship-spacing/entity-only-before-cardinality]
[corpus fixture: er/lex-only-one-two-spaces]
関係の単位の間にあるディレクティブは、その位置に残し、
[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: relationship-spacing/directive-between-units]
[fixture: relationship-spacing/directive-between-units-runs]

入力
([relationship-spacing/symbols-and-words-input.mmd](../tests/fixtures/er/relationship-spacing/symbols-and-words-input.mmd)):

```mmd
erDiagram
A one or more--|{ B : x
A one or more -- |{ B : x
A ||--only one B : x
A ||-- only one B : x
A ||to|| B : x
A || to || B : x
A 1 to 1 B : x
A many(0) to one B : x
```

出力
([relationship-spacing/symbols-and-words-output.mmd](../tests/fixtures/er/relationship-spacing/symbols-and-words-output.mmd)):

```mmd
erDiagram
  A }|--|{ B : x
  A }|--|{ B : x
  A ||--|| B : x
  A ||--|| B : x
  A ||--|| B : x
  A ||--|| B : x
  A ||--|| B : x
  A }o--|| B : x
```

入力
([relationship-spacing/md-parent-input.mmd](../tests/fixtures/er/relationship-spacing/md-parent-input.mmd)):

```mmd
erDiagram
A u--o{ B : x
A ||--u-B : x
A ||--u.B : x
A u--u-B : x
A U..U-B : x
```

出力
([relationship-spacing/md-parent-output.mmd](../tests/fixtures/er/relationship-spacing/md-parent-output.mmd)):

```mmd
erDiagram
  A u--o{ B : x
  A ||--u-B : x
  A ||--u.B : x
  A u--u-B : x
  A U..U-B : x
```

入力
([relationship-spacing/words-spaced-input.mmd](../tests/fixtures/er/relationship-spacing/words-spaced-input.mmd)):

```mmd
erDiagram
A one or more   to   zero or more B : x
A only one to one B : x
A zero or one optionally to one or zero B : x
A ONE OR MORE TO MANY B : x
A many to one B : x
```

出力
([relationship-spacing/words-spaced-output.mmd](../tests/fixtures/er/relationship-spacing/words-spaced-output.mmd)):

```mmd
erDiagram
  A }|--o{ B : x
  A ||--|| B : x
  A |o..o| B : x
  A }|--o{ B : x
  A }o--|| B : x
```

### 実体

実体の別名は、名前に接し、角括弧の中に何も置きません。
`p [ Person ]` は `p[Person]` にします。 [fixture: entities/alias-tight]
`:::` の後の最初のクラスは `:::` に接し、クラスは、
前のクラスに接して後ろに空白を 1 つ置く `,` で区切ります。
Prettier のコンマの印字と同じ形で、mermaid.js が一覧を同じに読むからです。
`A ::: c1 , c2` は `A:::c1, c2` にします。
別名をこのように書く例が、mermaid.js の文書の例の多くです。
[fixture: entities/classes-tight] [fixture: entities/alias-and-classes]
属性ブロックの `{` は空白 1
つの後に置きます（[属性ブロック](#属性ブロック)を参照）。
引用符で囲まれた名前、役割、subgraph の id が平易な 1 語なら、
mermaid.js の文書の例に合わせて引用符なしで印字します。
[テキストの引用符](./compatibility.ja.md#テキストの引用符) を参照してください。
`"A"[B]` は `A[B]` に、`C ||--o{ D : "has"` は `C ||--o{ D : has` にします。
英字で始まり、部分の間に 1 つの `-` を置いた語（`LINE-ITEM`、
`a-1`）も平易なものとします。
文書の例は、`LINE-ITEM` や `NAMED-DRIVER` などのこのような名前を、
引用符なしで 20 回使い、引用符付きでは一度も使わないので、
`"LINE-ITEM"` は `LINE-ITEM` と印字します。
名前は `_` で始まってもよく、`"_x"` は `_x` と印字します。
文書の例には、`_` で始まる名前が、引用符の有無を問わず一つもありませんが、
対象にする版はすべて、どちらの形も同じに読みます。
`-` はキーワードを終わらせるので（`"end-x"` は `end` と `-x`）、
最初の `-` より前の部分を、字句解析器が独立した単位として読む語と比較します。
ASCII 以外の文字を含む名前（`"Zoë"`）は、
対象にする版に引用符なしで拒否するものがあるので、引用符を残します。
`.` を含む名前（`"a.b"`）も、対象にする版に引用符なしで拒否するものがあるので、
引用符を残します。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
ほかの名前は、引用符の有無も数も含めて、書かれたまま残します。
先頭か末尾に `-` がある名前と、`-` が 2 つ続く名前も、そのまま残します。
`direction` で終わる名前と、`TB`、`BT`、`RL`、`LR` で始まる名前も、
大文字小文字を問わず書かれたまま残します。
字句解析器は、`direction`、空白（改行も含みます）、向きの名前を 1 行として読み、
引用符を外した名前は、前の行か後の行と結ばれるためです。
[fixture: entities/plain-names-without-quotes]
[fixture: entities/hyphenated-names-without-quotes]
[fixture: entities/names-that-need-quotes]
[fixture: entities/name-with-dot-kept]
[fixture: entities/names-next-to-a-direction-line]
[fixture: entities/names-kept]
実体の部分の間にあるディレクティブは、
[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: entities/directive-between-parts]
[fixture: entities/directive-between-parts-runs]

入力
([entities/alias-tight-input.mmd](../tests/fixtures/er/entities/alias-tight-input.mmd)):

```mmd
erDiagram
p [ Person ]
p ["Per son"] {
int a
}
12 [ P ]
"A" [ B ]
p[Person]
```

出力
([entities/alias-tight-output.mmd](../tests/fixtures/er/entities/alias-tight-output.mmd)):

```mmd
erDiagram
  p[Person]
  p["Per son"] {
    int a
  }
  12[P]
  A[B]
  p[Person]
```

入力
([entities/classes-tight-input.mmd](../tests/fixtures/er/entities/classes-tight-input.mmd)):

```mmd
erDiagram
A ::: c1 , c2
"A B" ::: c
A:::é,b-c
B ::: d
```

出力
([entities/classes-tight-output.mmd](../tests/fixtures/er/entities/classes-tight-output.mmd)):

```mmd
erDiagram
  A:::c1, c2
  "A B":::c
  A:::é, b-c
  B:::d
```

入力
([entities/hyphenated-names-without-quotes-input.mmd](../tests/fixtures/er/entities/hyphenated-names-without-quotes-input.mmd)):

```mmd
erDiagram
"LINE-ITEM" ||--o{ "ORDER-LINE" : "has-items"
"A-B-C" {
int id
}
"p-q"[Alias]
subgraph "my-group"
"x-y"
end
"_a-b" ||--o{ "_c-d" : "_e-f"
```

出力
([entities/hyphenated-names-without-quotes-output.mmd](../tests/fixtures/er/entities/hyphenated-names-without-quotes-output.mmd)):

```mmd
erDiagram
  LINE-ITEM ||--o{ ORDER-LINE : has-items
  A-B-C {
    int id
  }
  p-q[Alias]
  subgraph my-group
    x-y
  end
  _a-b ||--o{ _c-d : _e-f
```

### subgraph

subgraph の名前は空白 1 つの後に置き、タイトルの `[` は名前に接します。
`subgraph S [t]` は `subgraph S[t]` になります。
同じ語で同じタイトルの形が逆になる理由がないので、
[flowchart](./flowchart.ja.md#subgraph-のヘッダー)と同じ形です。
mermaid.js は、どちらの書き方も同じ subgraph として読みます。
角括弧の中には何も置きません。
タイトルの名前は、接して書かれていても空白 1 つで区切ります。
mermaid.js が空白 1 つで結ぶからです。 [fixture: subgraphs/header-spacing]
[fixture: subgraphs/title-touches-name] [fixture: subgraphs/title-names-spaced]
[fixture: subgraphs/quoted-and-number-ids]
本体の文は 1 段深く置き、`end` は、subgraph と同じ段に行に単独で置き、
書かれた大文字小文字のまま印字します。
本体の `class`、`classDef`、`style` 文のキーワードは、subgraph の外と同じく、
書かれたまま残します。
mermaid.js は、それを書かれたまま subgraph のノードに並べます。
[fixture: subgraphs/statement-keywords-case-kept]
`end` の後に同じ行で続く文は、次の行に置きます。
[fixture: subgraphs/end-on-the-line-of-a-statement]
[fixture: subgraphs/end-case-kept] [fixture: subgraphs/entity-after-end]
文のない subgraph は、`end` を次の行に置いて印字します。
[fixture: subgraphs/empty]

名前と `[` の間のディレクティブは、
[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: subgraphs/title-beside-directive]
[fixture: subgraphs/title-beside-directive-runs]
そこにある U+2028 と U+2029 は、そのまま残します。
[test: U+2028 between an ER subgraph name and its title]
[test: U+2029 between an ER subgraph name and its title]

名前やタイトルの後、見出しの行にある空の説明ブロックは、本体の最初の文で、
見出しの行に書かれたまま残します。
[fixture: subgraphs/header-description-blocks-kept]
[corpus fixture: er/gram-subgraph-header-blocks]
subgraph の中で行に単独で置かれたコメントとディレクティブは、
その文と同じ段に置き、`end` の前にあるディレクティブは、その行に残します。
[fixture: subgraphs/directive-and-comment-lines]

入力
([subgraphs/title-names-spaced-input.mmd](../tests/fixtures/er/subgraphs/title-names-spaced-input.mmd)):

```mmd
erDiagram
subgraph S ["T 1"x]
A
end
subgraph U [a"b"]
B
end
subgraph V [12 3.5]
C
end
```

出力
([subgraphs/title-names-spaced-output.mmd](../tests/fixtures/er/subgraphs/title-names-spaced-output.mmd)):

```mmd
erDiagram
  subgraph S["T 1" x]
    A
  end
  subgraph U[a "b"]
    B
  end
  subgraph V[12 3.5]
    C
  end
```

入力
([subgraphs/header-description-blocks-kept-input.mmd](../tests/fixtures/er/subgraphs/header-description-blocks-kept-input.mmd)):

```mmd
erDiagram
subgraph S accDescr {} accDescr {}
A
end
subgraph T [Title]   accDescr { }
B
end
subgraph U
accDescr {}
C
end
```

出力
([subgraphs/header-description-blocks-kept-output.mmd](../tests/fixtures/er/subgraphs/header-description-blocks-kept-output.mmd)):

```mmd
erDiagram
  subgraph S accDescr {} accDescr {}
    A
  end
  subgraph T[Title] accDescr {}
    B
  end
  subgraph U
    accDescr {}
    C
  end
```

### 方向

方向の行は、`direction` とその値と、前後の mermaid.js が読まないテキストです。
テキストは書かれたまま残します。
テキストと `direction` の間（離して書かれていれば）と、
`direction` と値の間には空白 1 つを置き、値は書かれた大文字小文字を保ちます。
`lr` は `lr` のままです。
対象にする版の一部はその行をエンティティとして読み、
`direction tb` と `direction TB` を別に描くためです。
詳しくは
[大文字小文字をそろえるキーワード](./compatibility.ja.md#大文字小文字をそろえるキーワード)
と
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。 [fixture: direction/spacing] [fixture: direction/text-kept]
[fixture: direction/case-kept] [fixture: direction/case-bt-rl-kept]
後の行に書かれた値は、`direction` の後に 1 行で印字します。
[fixture: direction/value-on-next-line-joined]
[corpus fixture: er/lex-direction-value-next-line]
ディレクティブやコメント行がある方向の行は改行を残し、
構造の続きの行を 1 段深く置きます。
[fixture: direction/directive-and-comment-line-kept]

入力
([direction/text-kept-input.mmd](../tests/fixtures/er/direction/text-kept-input.mmd)):

```mmd
erDiagram
x   direction  RL   y  z
A ||--o{ B : x direction LR
direction LR %% c
direction LR;
direction LRX
```

出力
([direction/text-kept-output.mmd](../tests/fixtures/er/direction/text-kept-output.mmd)):

```mmd
erDiagram
  x direction RL y  z
  A ||--o{ B : x direction LR
  direction LR %% c
  direction LR;
  direction LRX
```

入力
([direction/case-kept-input.mmd](../tests/fixtures/er/direction/case-kept-input.mmd)):

```mmd
erDiagram
DIRECTION lr
Direction Tb
```

出力
([direction/case-kept-output.mmd](../tests/fixtures/er/direction/case-kept-output.mmd)):

```mmd
erDiagram
  DIRECTION lr
  Direction Tb
```

### スタイルとクラス

名前とクラスのリストでは、
前の名前に接して後ろに空白を 1 つ置くコンマを使います。
Prettier のコンマの印字と同じ形で、mermaid.js が一覧を同じに読むからです。
最初のスタイルは空白 1 つの後に置きます。
`style` と `classDef` の、通常の 1 行のプロパティと値からなるスタイルでは、
最初の `:` の前を詰め、空でない値の前に空白を 1 つ置きます。
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
通常はつなげる見出しや外側の改行があっても、最初の整形で同じ間隔にします。
スタイル内部の改行区切り、所有する注釈類、
同じ物理行に保持するセミコロンがある場合は、既存のスタイルの配置を保ちます。
キーワード `style` と `classDef` は、書かれた大文字小文字を保ちます。
（[大文字小文字をそろえるキーワード](./compatibility.ja.md#大文字小文字をそろえるキーワード)）。
[fixture: styles-and-classes/style-unit-padding]
[fixture: styles-and-classes/class-def-names]
[fixture: styles-and-classes/style-names]
[fixture: styles-and-classes/class-lists]
[fixture: styles-and-classes/styles-as-written]
[fixture: styles-and-classes/style-inner-whitespace-collapsed]
[fixture: styles-and-classes/style-words-run-spaced]
[fixture: styles-and-classes/style-words-touching-kept]
[fixture: styles-and-classes/style-words-directive-kept]

`:` で始まるスタイルも、ほかのスタイルと同じく、`:` の後に空白を 1 つ置き、
語と語の間の空白とタブの連続は空白 1 つで印字します。
`style A :  red   x` は `style A : red x` と印字します。
[fixture: styles-and-classes/style-colon-first-run-spaced]

[fixture: styles-and-classes/keyword-case-kept]
[fixture: styles-and-classes/keyword-case-semicolon-line-kept]

キーワードや名前の後の空白が改行を取り込んで、
複数行に書かれた `classDef` と `style` の文は、1 行に印字します。
[fixture: styles-and-classes/over-lines-joined]
最後のスタイルの末尾の空白はその後の改行を取り込み、
次の行がスタイルの続きになります。
`classDef a fill:red `、改行、`A` は、スタイル `fill:redA` を定義し、
実体 A は作りません。
そのため、そのような文は、空白と取り込まれる行を含めて、書かれたまま残し、
その行は書かれた桁のままです。
2 行を 1 行にする（`classDef a fill:red A`）と、
Db は同じで mermaid.js の読みも見えますが、作者が書いた空白が消えます。
印字は文を解釈しません。
[fixture: styles-and-classes/trailing-whitespace-takes-next-line]
[fixture: styles-and-classes/directive-before-next-line]
[fixture: styles-and-classes/comment-line-inside-kept]
[corpus fixture: er/lex-classdef-space-before-line-feed]
[corpus fixture: er/lex-style-tab-before-line-feed]
最後のスタイルの末尾の垂直タブと改ページも、
スタイル文脈が空白の文字をすべて単位の間として読むので、
同じようにその後の改行を取り込み、文は同じように書かれたまま残します。
[test: keeps a vertical tab and a form feed at the end of the classDef of an ER diagram]

行末のセミコロンは、
[スタイル文の末尾のセミコロン](#スタイル文の末尾のセミコロン)に従います。
最後のスタイルとの間にディレクティブがある終端の単位は、
その間の内容と一緒に残します。
[fixture: styles-and-classes/ending-semicolon-rules]
行の規則は、`:` と `#` の間に空白がないときだけ `;` を無視します。
規則が適用されないときは `#f00;` が実体参照になり、
`;` の削除で Db が変わるので、
`style A fill: #f00;` は空白とセミコロンを保ちます。
[fixture: styles-and-classes/space-after-colon-before-hash-kept]

入力
([styles-and-classes/class-def-names-input.mmd](../tests/fixtures/er/styles-and-classes/class-def-names-input.mmd)):

```mmd
erDiagram
classDef a ,b ,  c fill:red
classDef default fill:#f9f,stroke-width:4px
```

出力
([styles-and-classes/class-def-names-output.mmd](../tests/fixtures/er/styles-and-classes/class-def-names-output.mmd)):

```mmd
erDiagram
  classDef a, b, c fill: red
  classDef default fill: #f9f, stroke-width: 4px
```

入力
([styles-and-classes/styles-as-written-input.mmd](../tests/fixtures/er/styles-and-classes/styles-as-written-input.mmd)):

```mmd
erDiagram
classDef a fill : #f9f , stroke:#333
style id1 fill:#bbf,stroke:#f66,stroke-dasharray: 5 5
style  id2   fill:red   ,   stroke:blue
```

出力
([styles-and-classes/styles-as-written-output.mmd](../tests/fixtures/er/styles-and-classes/styles-as-written-output.mmd)):

```mmd
erDiagram
  classDef a fill: #f9f, stroke: #333
  style id1 fill: #bbf, stroke: #f66, stroke-dasharray: 5 5
  style id2 fill: red, stroke: blue
```

入力
([styles-and-classes/ending-semicolon-rules-input.mmd](../tests/fixtures/er/styles-and-classes/ending-semicolon-rules-input.mmd)):

```mmd
erDiagram
classDef a fill:red;
A
classDef b fill:red ;
B
style C fill:blue;
style D fill:blue%%{init: {}}%%;
```

出力
([styles-and-classes/ending-semicolon-rules-output.mmd](../tests/fixtures/er/styles-and-classes/ending-semicolon-rules-output.mmd)):

```mmd
erDiagram
  classDef a fill: red
  A
  classDef b fill: red
  B
  style C fill: blue
  style D fill:blue%%{init: {}}%%;
```

### アクセシビリティの文

説明ブロックの後で行の規則が無視する `;` があっても、
コロンを使う 1 行の形にでき、書かれた `;` は説明の後に残します。
[fixture: accessibility-statements/block-trailing-ignored-semicolon]

`accTitle` と `accDescr` の `:` は、キーワードに接し、後に空白 1 つを置きます。
テキストは両端の空白を除きます。
[fixture: accessibility-statements/title-and-description]
後の行に書かれたテキストは、`:` の後に 1 行で印字します。
その前にコメント行がある文は、書かれたまま残します。
[fixture: accessibility-statements/text-on-next-line-joined]
[fixture: accessibility-statements/text-with-comment-line-kept]
[corpus fixture: er/lex-acc-title-line-feed-after-colon]

通常の `accDescr { ... }` ブロックの後続の本文行は、文の内側に 1 段字下げし、
LF 直後の ASCII 空白とタブだけを置き換えます。
説明の設定関数がこの字下げを捨てるためです。
改行、行末空白、ディレクティブの内部は保ちます。
subgraph 内では、生の説明がその所属の読みにも使われるため、
本文の元の列を保ちます。
[corpus fixture: er/db-subgraph-nodes-acc-descr-block-lines]
`}` は文と同じ段に置きます。
[fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]

1 行のブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。
[fixture: accessibility-statements/block-text-on-opening-line]

空のブロックは文の 1 つで、前の説明を Db に残します。
内側は `{}` と印字し、`accDescr { }` は `accDescr {}` になります。
空白の連続、改行、NBSP だけの内側も同じです。
すでに空の内側は空のままです。
キーワードと開始括弧の間には空白を 1 つ置きます。
空白で囲む本文がないので、Db が同じ形の選択は、
[flowchart のアクセシビリティの行](./flowchart.ja.md#アクセシビリティの行)、
agentflow、usecase に合わせます。
[test: accessibility revisions: er empty-description-nbsp]
コメントやディレクティブがあるブロックは、改行と完全な内容を保ち、
普通の独立した注釈類はブロックの内側にそろえます。
[fixture: accessibility-statements/empty-blocks]
[fixture: accessibility-statements/empty-block-with-directive-or-comment-line]
[corpus fixture: er/gram-acc-descr-block-empty]

字句解析器は、続く文の規則より先に方向の行の規則を試しますが、
`accTitle` と `accDescr` の規則はその前に試します。
1 桁目の `accTitle: direction LR` はタイトルで、
字下げの後では `direction` の前に `accTitle:` というテキストがある方向の行です。
そのため、最初に印字される行に `direction`、改行を含む 1 つ以上の空白、
方向（`TB`、`BT`、`RL`、`LR`。大文字小文字は問わない）を含む `accTitle`、
`accDescr:`、`accDescr {` の文は、
subgraph の中でも 1 桁目を保ちます（diagrams/er.md、方向の行）。
行は、字句解析器が読む形、
つまり mermaid.js が字句解析の前に取り除くディレクティブなしの形で判定します。
`dir%%{init: {}}%%ection LR` は `direction LR` で、
`direction` と値の間のディレクティブは空白ではないので、
`direction%%{init: {}}%%LR` は `directionLR` であり、方向の行ではありません。
方向の後に語の境界は要らず、方向は後の行にあってもよく、その場合、
文には含まれません。
数えるのは最初に印字される行です。
後の行に書かれたテキストは `:`
の行に寄せるので（[複数行の文](#複数行の文)を参照）、`accTitle:`、改行、
`direction LR` は、`accTitle:` が字下げの後に書かれていた場合も、
1 桁目の `accTitle: direction LR` として印字します。
書かれた文はタイトルで、
字下げした `accTitle: direction LR` は方向の行になるためです。
`direction` と方向の間のコメント行とディレクティブは、
字句解析器がそれらなしにテキストを読むので、飛ばし（diagrams/er.md、
単位の間のトリビア）、空行も同じです。
方向が続かなければ、その文はほかの文と同じに字下げします。
行全体で判断します。
同じ行にほかの文が続く場合（`accDescr {x}; accDescr {direction RL}`）も、
字句解析器は行頭から行全体を読むので、その文にある `direction` も数えます。
[fixture: accessibility-statements/semicolon-line-with-direction-text-first-column]
[fixture: accessibility-statements/first-column-for-direction-text]
[fixture: accessibility-statements/first-column-direction-case-insensitive]
[fixture: accessibility-statements/first-column-value-touching-text]
[fixture: accessibility-statements/first-column-tab-before-value]
[fixture: accessibility-statements/first-column-value-on-next-line]
[fixture: accessibility-statements/first-column-value-after-comment-line]
[fixture: accessibility-statements/first-column-value-after-directive-line]
[fixture: accessibility-statements/first-column-value-after-blank-line]
[fixture: accessibility-statements/first-column-text-brought-to-the-colon]
[fixture: accessibility-statements/first-column-text-brought-to-the-colon-in-subgraph]
[fixture: accessibility-statements/first-column-text-brought-to-the-colon-from-indentation]
[fixture: accessibility-statements/first-column-text-brought-to-the-colon-from-indentation-directive]
[fixture: accessibility-statements/first-column-directive-inside-direction]
[fixture: accessibility-statements/first-column-directive-over-lines-before-direction]
[fixture: accessibility-statements/indented-when-directive-takes-the-space-before-value]
[fixture: accessibility-statements/first-column-block-directive-inside-direction]
[fixture: accessibility-statements/first-column-block-directive-over-lines-before-direction]
[fixture: accessibility-statements/indented-block-when-directive-takes-the-space-before-value]
[fixture: accessibility-statements/first-column-description-directive-over-lines-before-direction]
[fixture: accessibility-statements/indented-when-no-direction-follows]
[fixture: accessibility-statements/direction-text-on-later-line-indented]
[corpus fixture: er/lex-acc-title-direction]
[corpus fixture: er/lex-acc-descr-block-direction]
[corpus fixture: er/lex-direction-lower-case]
[corpus fixture: er/lex-direction-value-glued]
[corpus fixture: er/lex-direction-value-tab]
[corpus fixture: er/lex-direction-value-next-line]

入力
([accessibility-statements/text-on-next-line-joined-input.mmd](../tests/fixtures/er/accessibility-statements/text-on-next-line-joined-input.mmd)):

```mmd
erDiagram
accTitle:
T
accDescr:

  D
```

出力
([accessibility-statements/text-on-next-line-joined-output.mmd](../tests/fixtures/er/accessibility-statements/text-on-next-line-joined-output.mmd)):

```mmd
erDiagram
  accTitle: T
  accDescr: D
```

入力
([accessibility-statements/block-lines-kept-input.mmd](../tests/fixtures/er/accessibility-statements/block-lines-kept-input.mmd)):

```mmd
erDiagram
accDescr {
  one
    two
      }
subgraph S
accDescr {
  three
}
end
```

出力
([accessibility-statements/block-lines-kept-output.mmd](../tests/fixtures/er/accessibility-statements/block-lines-kept-output.mmd)):

```mmd
erDiagram
  accDescr {
    one
    two
  }
  subgraph S
    accDescr: three
  end
```

入力
([accessibility-statements/first-column-for-direction-text-input.mmd](../tests/fixtures/er/accessibility-statements/first-column-for-direction-text-input.mmd)):

```mmd
erDiagram
accTitle: direction LR
accDescr: a direction TB
accDescr { direction RL }
subgraph S
accTitle: direction BT
A
end
```

出力
([accessibility-statements/first-column-for-direction-text-output.mmd](../tests/fixtures/er/accessibility-statements/first-column-for-direction-text-output.mmd)):

```mmd
erDiagram
accTitle: direction LR
accDescr: a direction TB
accDescr: direction RL
  subgraph S
accTitle: direction BT
    A
  end
```

### コメント

コメント行、つまり行頭の `%%` は、周りの文と同じ段に置き、
テキストは書かれたまま残します。
この図にほかのコメントはありません（diagrams/er.md、コメント）。
[fixture: comments/kept] [fixture: comments/in-blocks]
[fixture: comments/last-in-body] [fixture: comments/text-kept]
ヘッダーより前のコメント行は 1 桁目に置きます。
[fixture: comments/before-header]
テキストの末尾のコメント行は、行に単独で置き、改行を足します。
[fixture: comments/after-last-statement-without-line-break]
[fixture: comments/after-header-without-line-break]

入力
([comments/in-blocks-input.mmd](../tests/fixtures/er/comments/in-blocks-input.mmd)):

```mmd
erDiagram
A {
%% c1
int a
      %% c2
}
subgraph S
%% c3
B
%% c4
end
```

出力
([comments/in-blocks-output.mmd](../tests/fixtures/er/comments/in-blocks-output.mmd)):

```mmd
erDiagram
  A {
    %% c1
    int a
    %% c2
  }
  subgraph S
    %% c3
    B
    %% c4
  end
```

入力
([comments/last-in-body-input.mmd](../tests/fixtures/er/comments/last-in-body-input.mmd)):

```mmd
erDiagram
A
%% c1

%% c2
```

出力
([comments/last-in-body-output.mmd](../tests/fixtures/er/comments/last-in-body-output.mmd)):

```mmd
erDiagram
  A
  %% c1

  %% c2
```

### ディレクティブ

行に単独で置かれたディレクティブは、周りの文と同じ段に置きます。
同じ印字行の中では、flowchart と同じく、
隙間をディレクティブがないものとして印字し、
ディレクティブをその空白の後ろに置いて、後ろの単位に接します。
[fixture: directives/kept] [fixture: directives/before-header]
[fixture: directives/after-header-on-same-line]
[fixture: directives/after-header-touching-kept]
[fixture: directives/whitespace-on-both-sides]
[fixture: directives/touching-one-side]
[fixture: directives/after-statement-at-end-of-line]
[fixture: directives/in-blocks]
閉じていないディレクティブはテキストの残りを取り込むので、書かれたまま残します。
[fixture: directives/unclosed-at-end-of-text-kept]
[fixture: directives/unclosed-after-statement-kept]

元は同じ行にあった単位を別の行へ分けるときは、
間の directive を次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。

[fixture: er/directives/whitespace-on-both-sides]

入力
([directives/kept-input.mmd](../tests/fixtures/er/directives/kept-input.mmd)):

```mmd
erDiagram
%%{init: {'theme': 'dark'}}%%
A
    %%{wrap}%%
B
```

出力
([directives/kept-output.mmd](../tests/fixtures/er/directives/kept-output.mmd)):

```mmd
erDiagram
  %%{init: {'theme': 'dark'}}%%
  A
  %%{wrap}%%
  B
```

入力
([directives/touching-one-side-input.mmd](../tests/fixtures/er/directives/touching-one-side-input.mmd)):

```mmd
erDiagram
A %%{init: {}}%%||--o{ B : x
A||--o{ %%{init: {}}%%B : y
```

出力
([directives/touching-one-side-output.mmd](../tests/fixtures/er/directives/touching-one-side-output.mmd)):

```mmd
erDiagram
  A %%{init: {}}%%||--o{ B : x
  A ||--o{ %%{init: {}}%%B : y
```

入力
([directives/whitespace-on-both-sides-input.mmd](../tests/fixtures/er/directives/whitespace-on-both-sides-input.mmd)):

```mmd
erDiagram
A   %%{init: {}}%%    ||--o{ B : x
C  %%{init: {}}%%  D
```

出力
([directives/whitespace-on-both-sides-output.mmd](../tests/fixtures/er/directives/whitespace-on-both-sides-output.mmd)):

```mmd
erDiagram
  A %%{init: {}}%%||--o{ B : x
  C
  %%{init: {}}%% D
```

### 色

スタイルの色は、mermaid.js の文書の例と Prettier の CSS 整形と同じく、
小文字で印字します。
`style CUSTOMER fill:#F9F,stroke:#ABCDEF` は
`style CUSTOMER fill: #f9f, stroke: #abcdef` と印字します。
ER 図の `style`、`classDef` 文のスタイルの色が対象です。
色は、スタイルの値の中で単独で立つ、`#` と 3、4、6、8 桁の 16 進数です。
色を短くすることはなく、色でないテキストは書かれたままにします。
（[同じに描かれる色](./compatibility.ja.md#同じに描かれる色)を参照）。
[fixture: colors/colors-in-lower-case]
[fixture: colors/words-that-are-not-colors-as-written]

入力
([colors/colors-in-lower-case-input.mmd](../tests/fixtures/er/colors/colors-in-lower-case-input.mmd)):

```mmd
erDiagram
CUSTOMER ||--o{ ORDER : places
style CUSTOMER fill:#F9F,stroke:#ABCDEF,color:#C0FFEE
classDef c fill:#DEADBE,stroke:#ABCDEF
class ORDER c
```

出力
([colors/colors-in-lower-case-output.mmd](../tests/fixtures/er/colors/colors-in-lower-case-output.mmd)):

```mmd
erDiagram
  CUSTOMER ||--o{ ORDER : places
  style CUSTOMER fill: #f9f, stroke: #abcdef, color: #c0ffee
  classDef c fill: #deadbe, stroke: #abcdef
  class ORDER c
```

入力
([colors/words-that-are-not-colors-as-written-input.mmd](../tests/fixtures/er/colors/words-that-are-not-colors-as-written-input.mmd)):

```mmd
erDiagram
CUSTOMER
style CUSTOMER fill:#ABCDE,stroke:#ABCDEF1
classDef c fill:#ABC-x,stroke:x#ABC
```

出力
([colors/words-that-are-not-colors-as-written-output.mmd](../tests/fixtures/er/colors/words-that-are-not-colors-as-written-output.mmd)):

```mmd
erDiagram
  CUSTOMER
  style CUSTOMER fill: #ABCDE, stroke: #ABCDEF1
  classDef c fill: #ABC-x, stroke: x#ABC
```

### フロントマター YAML

flowchart と同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整形し、`---` の行は、
各行末の空白とタブも含めて、書かれたまま残します。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/config-formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
Prettier が読めない YAML、字下げされた `---` の行、
整形後の YAML の行が `---` の行になる場合、および、`<` の後に文字、数字、
`_` が続く YAML は、書かれたまま残します。
引用符を変えると mermaid.js の読みが変わりうるからです。
[fixture: frontmatter-yaml/malformed-kept]
[fixture: frontmatter-yaml/indented-delimiters-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[fixture: frontmatter-yaml/html-tag-kept]
[fixture: frontmatter-yaml/less-than-before-other-formatted]
フロントマターとヘッダーの間のコメント行は残します。
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/er/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
---
erDiagram
A
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/er/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
---
erDiagram
  A
```

入力
([frontmatter-yaml/delimiter-line-kept-input.mmd](../tests/fixtures/er/frontmatter-yaml/delimiter-line-kept-input.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
erDiagram
A
```

出力
([frontmatter-yaml/delimiter-line-kept-output.mmd](../tests/fixtures/er/frontmatter-yaml/delimiter-line-kept-output.mmd)):

```mmd
---
%YAML 1.2
--- !!map
title: x
---
erDiagram
  A
```

### 複数行の値

引用符で書かれた役割、属性のコメント、バッククォートの語は、
複数行に書かれていれば、値の一部なので、
中の改行と空白も含めて書かれたまま残します。
[fixture: multi-line-values/role-string-kept]
[fixture: multi-line-values/attribute-strings-kept]
[corpus fixture: er/lex-role-string-line-feed]
[corpus fixture: er/lex-comment-line-feed]
そのような文字列の中のコメント行は文字列の一部で、文字列は書かれたまま残します。
[fixture: multi-line-values/comment-line-inside-string-kept]
[corpus fixture: er/tokens-comment-line-in-role-string]
`accDescr` ブロックの行は、
[アクセシビリティの文](#アクセシビリティの文) の字下げと文脈の保護に従います。
[fixture: multi-line-values/description-block-lines-kept]

入力
([multi-line-values/role-string-kept-input.mmd](../tests/fixtures/er/multi-line-values/role-string-kept-input.mmd)):

```mmd
erDiagram
A ||--o{ B : "line one
   line two"
C
```

出力
([multi-line-values/role-string-kept-output.mmd](../tests/fixtures/er/multi-line-values/role-string-kept-output.mmd)):

```mmd
erDiagram
  A ||--o{ B : "line one
   line two"
  C
```

入力
([multi-line-values/attribute-strings-kept-input.mmd](../tests/fixtures/er/multi-line-values/attribute-strings-kept-input.mmd)):

```mmd
erDiagram
A {
int a "line one
   line two"
`x
  y` b
}
```

出力
([multi-line-values/attribute-strings-kept-output.mmd](../tests/fixtures/er/multi-line-values/attribute-strings-kept-output.mmd)):

```mmd
erDiagram
  A {
    int a "line one
   line two"
    `x
  y` b
  }
```

### スタイル文の末尾のセミコロン

`classDef` または `style` 文の行末の `;` は、
[mermaid.js の行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
が無視するときに削除します。
`:` と後の `#` の間に空白がない形です。
この終端を削除しても Db は変わらず、スタイルが複数でも同じです。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
その行は、スタイルの空白を含め、その `;` がない行として整形します。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-terminators]
文の前後の空行とコメント行は、通常の配置に従います。
[fixture: semicolons-at-the-end-of-a-style-statement/blank-and-comment-lines]
空の説明ブロックも通常の配置に従い、スタイルの終端は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/empty-description-block]

文に `#` がない場合は、文を終える `;` の単位も、直前の空白と一緒に削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/unit-terminators]
最後のスタイルとその単位の間にディレクティブがある場合は、
その間の内容と `;` を書かれたまま残します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-unit-kept]
`#` があって行の規則が適用されない場合は、`;` を残します。
`#f00;` は実体参照なので、終端を削除すると Db が変わるためです。
[fixture: semicolons-at-the-end-of-a-style-statement/hash-outside-line-rule-kept]

同じ行でセミコロンの後にディレクティブが続く場合は、`;` を保ちます。
[fixture: semicolons-at-the-end-of-a-style-statement/trailing-items-kept]
無視される `;` が別の `;` の隣にある場合は、行の規則の選択を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/adjacent-semicolons-kept]
閉じていないディレクティブの後の `;` は、その停止位置を保つために残します。
[fixture: semicolons-at-the-end-of-a-style-statement/unclosed-directive-kept]
U+2028 と U+2029 の前も同じように保護します。
[`;` が終わらせる行](./compatibility.ja.md#-が終わらせる行)を参照してください。
[test: style semicolons: er before U+2028]
[test: style semicolons: er before U+2029]
文と無視される終端の間にある閉じたディレクティブは残し、`;` は削除します。
[fixture: semicolons-at-the-end-of-a-style-statement/directive-before-terminator]

出力
([semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd](../tests/fixtures/er/semicolons-at-the-end-of-a-style-statement/hash-terminators-output.mmd)):

```mmd
erDiagram
  A
  classDef c fill: #f00
  style A fill: #f00
  classDef d fill: #0f0, stroke: #00f
  style A fill: #0f0, stroke: #00f
```

### 複数行の文

mermaid.js が複数行にわたって読む文は、改行が、
その文の字句解析器にとって空白である所では 1 行に印字します。
その場所は、仕様の[文の文脈](../../spec/docs/diagrams/er.ja.md#文の文脈)、
[属性ブロックの文脈](../../spec/docs/diagrams/er.ja.md#属性ブロックの文脈)、
[style の文脈](../../spec/docs/diagrams/er.ja.md#style-の文脈)が定めます。
`accTitle` と `accDescr` の `:` の前後、`accDescr` の `{` の前後、
`direction` と値の間、属性の単位の間、
空白の後の `classDef` と `style` の文の中です。
[fixture: multi-line-statements/acc-colon-and-brace-joined]
[fixture: multi-line-statements/acc-descr-brace-joined]
[fixture: multi-line-statements/attribute-over-lines-joined]
[fixture: multi-line-statements/breaks-decided-one-by-one]
[fixture: multi-line-statements/line-rule-first-hash-after-colon-kept]
[fixture: multi-line-statements/accessibility-text-joined]
[fixture: multi-line-statements/direction-value-joined]
[fixture: multi-line-statements/style-over-lines-joined]
コメント行やディレクティブがある文は改行を残し、
構造の続きの行と間の注釈を 1 段深く置きます。
値の中の空白と、各隙間の最初の改行の前の空白は保ちます。
コメントで結合される領域は、それがつなぐ行を原文のまま残します（下を参照）。
改行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合と、最後の行を `;` が終える場合は、
その改行を残します。
それ以外の改行は、`;` を含む文でも通常どおりつなぎます。
改行が残る文は、スタイルも書かれたままにします。
[fixture: multi-line-statements/semicolon-joining-changes-kept]
[fixture: multi-line-statements/style-comment-continuation]
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]
コメントで結合される領域をまたいで続く名前も、そのような文の一部です。
`A`、U+2028、`%% c`、行 `Bar` は、1 つの名前 `A`、U+2028、`Bar` です。
名前がどこにあっても同じです。
エンティティ、関係の端、属性の名前と型、サブグラフの名前と題、`class`、
`classDef`、`style` の文の中の名前が、これにあたります。
[test: a comment line after U+2028 inside the name of an ER entity]
[test: a comment line after U+2029 inside the name of an ER entity]
[test: two comment lines after U+2028 inside the name of an ER entity]
[test: a directive and a comment line after U+2028 inside the name of an ER
entity]
[test: a comment line after U+2028 inside the name of an ER entity that follows
a name in quotes]
[test: an indented line after a comment line after U+2028 inside the name of an
ER entity]
[test: a comment line after U+2028 inside the name of an ER entity with an
alias]
[test: a comment line after U+2028 inside the name of an ER entity with an
attribute block on one line]
[test: a comment line after U+2028 inside the name of an ER entity with a CSS
class] [test: a comment line after U+2028 inside the first entity of an ER
relationship]
[test: a comment line after U+2028 inside the second entity of an ER
relationship]
[test: a comment line after U+2028 inside both entities of an ER relationship]
[test: a comment line after U+2028 inside the name of an ER attribute]
[test: a comment line after U+2028 inside the type of an ER attribute]
[test: a comment line after U+2028 inside the name of an ER subgraph]
[test: a comment line after U+2028 inside the title of an ER subgraph]
[test: a comment line after U+2028 inside the name of an ER class statement]
[test: a comment line after U+2028 inside the name of an ER class definition]
[test: a comment line after U+2028 inside the name of an ER style statement]
行に載るものと行の終わりは、
[U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
のとおりです。
行が終わった所では、次の行は、
字下げされた別の文（属性ブロックの中では別の属性）になります。
改行の後も文が続く所、つまり字句解析器がその改行を文の中の空白と読む所では、
この節の初めに挙げた場所のどこでも、次の行は文の残りで、書かれたまま印字します。
[test: an empty line after a comment line after U+2028 inside the name of an ER
entity]
[test: a line of only whitespace after a comment line after U+2028 inside the
name of an ER entity]
[test: a directive line after a comment line after U+2028 inside the name of an
ER entity]
[test: a comment line after U+2028 at the end of the text of an ER diagram]
[test: an empty line after a comment line after U+2028 after the colon of
accTitle, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the colon of
accTitle, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the colon of
accDescr, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the colon of
accDescr, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after direction, and the
rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after direction, and
the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after a style that a
comma ends, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after a style that a
comma ends, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the keyword of
classDef, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the keyword of
classDef, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2029 after the colon of
accTitle, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the colon of
accDescr, with CRLF line breaks]
[test: an empty line after a comment line after U+2028 before the colon of accTitle, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 before the colon of accTitle, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 before the colon of accDescr, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 before the colon of accDescr, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 before the opening brace of accDescr, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 before the opening brace of accDescr, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the opening brace of accDescr, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the opening brace of accDescr, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the keyword of style, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the keyword of style, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after a name that a comma ends in a style statement, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after a name that a comma ends in a style statement, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the name of a style statement, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the name of a style statement, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 before the colon of a style, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 before the colon of a style, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 after the colon of a style, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 after the colon of a style, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 between the type and the name of an attribute, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 between the type and the name of an attribute, and the rest of the statement on the next line]
[test: an empty line after a comment line after U+2028 between the name and the key of an attribute, and the rest of the statement on the next line]
[test: a directive line after a comment line after U+2028 between the name and the key of an attribute, and the rest of the statement on the next line]
その行にある `;` は、何であっても、その場所に残ります。
`style` や `classDef` の文を終わらせる `;`（`Bar fill:red;`）、
コメント行の後の行に `style` と `:#` があるために行の規則が無視する `;`
（`style fill:#f00;`）、文字実体の `;`（`Bar fill:#f00;`）のどれも同じです。
[test: a character entity at the end of an ER style statement, after a comment
line after U+2028 inside its name]
[test: a semicolon that ends an ER style statement, after a comment line after
U+2028 inside its name]
[test: a semicolon that ends an ER class definition, after a comment line after
U+2028 inside its name]
[test: a semicolon that the line rule ignores, after a comment line after U+2028
inside the name of an ER style statement]
[test: a semicolon that the line rule ignores, after a comment line after U+2028
inside the name of an ER class definition]
空でない複数行の属性ブロックを持つエンティティでは、書かれたまま印字するのは、
ブロックを開く行で、`{` の後ろにあるものと、そこで始まる属性が続く行も含みます。
その後の属性と `}` は、通常どおり、属性は 1 段深く、`}` は文の位置に置きます。
ただし `}` が、U+2028 か U+2029 の後のコメント行が始まる行にあるときは、
ブロックはその行と一緒に書かれたままにします。
`}` が書かれたまま残るどの行にあるときも、同じです。
[属性ブロック](#属性ブロック)を参照してください。
行をつなげられるとき、複数行の空のブロックは、行の終わりが `{ }` になります。
`{` の後ろに空白、タブ、U+2028 があっても同じで、ほかの空のブロックと同じです。
1 行の空のブロックは、その行と一緒に書かれたままにします。
[test: a comment line after U+2028 inside the name of an ER entity with an
attribute block over several lines]
[test: an attribute on the line of the opening brace after a comment line after
U+2028 inside the name of an ER entity]
[test: two attributes, the first on the line of the opening brace, after a
comment line after U+2028 inside the name of an ER entity]
[test: an empty attribute block over several lines after a comment line after
U+2028 inside the name of an ER entity]
[test: an empty attribute block with an indented closing brace after a comment
line after U+2028 inside the name of an ER entity]
[test: an empty attribute block with an empty line before its closing brace
after a comment line after U+2028 inside the name of an ER entity]
[test: an empty attribute block on one line after a comment line after U+2028
inside the name of an ER entity]
[test: an empty attribute block over several lines after a comment line after
U+2028 and a space]
[test: an empty attribute block with spaces after its opening brace after a
comment line after U+2028 inside the name of an ER entity]
[test: an empty attribute block with a tab after its opening brace after a
comment line after U+2028 inside the name of an ER entity]
[test: an empty attribute block with U+2028 after its opening brace after a
comment line after U+2028 inside the name of an ER entity]
[test: an attribute block of an entity that starts the line, and a comment line after U+2028 after its closing brace]
[test: an empty attribute block of an entity that starts the line, and a comment line after U+2028 after its closing brace]
[test: an attribute that starts on the line of the opening brace and goes on over the next line, after a comment line after U+2028 inside the name of an ER entity]
[test: an attribute that starts on the line of the opening brace and goes on over an empty line, after a comment line after U+2028 inside the name of an ER entity]
[test: an attribute that starts on the line of the opening brace and goes on over a directive line, after a comment line after U+2028 inside the name of an ER entity]
[test: an attribute that starts on the line of the opening brace and goes on over a comment line after U+2028, after a comment line after U+2028 inside the name of an ER entity]
[test: an attribute that starts on the line of the opening brace and goes on over two lines, after a comment line after U+2028 inside the name of an ER entity]
[test: an attribute that goes on over a line, and an attribute after it, after a comment line after U+2028 inside the name of an ER entity]
同じ行で別の文の後に立つエンティティと、行が続く名前の後に立つエンティティも、
同じように印字します。
`{` までは、その前の隙間と一緒に書かれたままで、属性と `}` は、
ほかのエンティティと同じ位置に置きます。
ただし `}` が、書かれたまま残る行にあるときは、
ブロックはその行と一緒に書かれたままにします。
行を始めるエンティティと同じです。
[test: an attribute block of an entity that follows another entity on the line,
after a comment line after U+2028]
[test: an attribute block of an entity after a statement on its line, with a
comment line after U+2028 inside its name]
[test: an attribute block of an entity after a name in quotes, with a comment
line after U+2028 inside its name]
[test: an empty attribute block of an entity that follows another entity on the
line, after a comment line after U+2028]
[test: an empty attribute block of an entity after a statement on its line,
after a comment line after U+2028 and a space]
[test: an attribute and a closing brace with other indentation of an entity that
follows another entity on the line, after a comment line after U+2028]
[test: a statement after the closing brace of an entity that follows another
entity on the line, after a comment line after U+2028]
[test: an attribute block on one line of an entity that follows another entity
on the line, after a comment line after U+2028]
[test: an attribute block inside a subgraph, of an entity that follows another
entity on the line, after a comment line after U+2028]
[test: an attribute block of an entity that follows a name that a comment line cuts, and a comment line after U+2028 after its closing brace]
[test: an empty attribute block of an entity that follows a name that a comment line cuts, and a comment line after U+2028 after its closing brace]
[test: an empty attribute block with an empty line before its closing brace, of an entity that follows a name that a comment line cuts, and a comment line after U+2028 after its closing brace]
[test: an attribute block of an entity that follows a name that a comment line cuts, and a comment line after U+2028 at the end of the text]
[test: an attribute block of an entity that follows a name that a comment line cuts, and two comment lines after U+2028 after its closing brace]
[test: an attribute block of an entity that follows a name that a comment line cuts, and a comment line after U+2029 after its closing brace]
[test: an attribute block of an entity that follows a name that a comment line cuts, and a statement touching its closing brace]
[test: an attribute block of an entity that follows a name that a comment line cuts, with an indented closing brace and a comment line after U+2028]
[test: two attribute blocks of entities that follow a name that a comment line cuts, with a comment line after U+2028 between them]
[test: two spaces before the opening brace of an entity that follows a name that a comment line cuts]
[test: two spaces before the opening brace of an empty attribute block of an entity that follows a name that a comment line cuts]
[test: a tab before the opening brace of an entity that follows a name that a comment line cuts]
[test: an alias with spaces before the opening brace of an entity that follows a name that a comment line cuts]
[test: CSS classes with spaces before the opening brace of an entity that follows a name that a comment line cuts]
[test: a directive before the opening brace of an entity that follows a name that a comment line cuts]
[test: two spaces before the opening brace of an entity that starts the line, after a comment line after U+2028]
[test: an attribute that starts on the line of the opening brace and goes on over the next line, of an entity that follows a name that a comment line cuts]

入力
([multi-line-statements/accessibility-text-joined-input.mmd](../tests/fixtures/er/multi-line-statements/accessibility-text-joined-input.mmd)):

```mmd
erDiagram
accTitle:
T
accDescr:

 D
```

出力
([multi-line-statements/accessibility-text-joined-output.mmd](../tests/fixtures/er/multi-line-statements/accessibility-text-joined-output.mmd)):

```mmd
erDiagram
  accTitle: T
  accDescr: D
```

入力
([multi-line-statements/directive-inside-kept-input.mmd](../tests/fixtures/er/multi-line-statements/directive-inside-kept-input.mmd)):

```mmd
erDiagram
direction
%%{init: {}}%%
LR
accTitle:
%%{init: {}}%%
T
```

出力
([multi-line-statements/directive-inside-kept-output.mmd](../tests/fixtures/er/multi-line-statements/directive-inside-kept-output.mmd)):

```mmd
erDiagram
  direction
    %%{init: {}}%%
    LR
  accTitle:
    %%{init: {}}%%
    T
```

### 行区切り文字

U+2028 や U+2029 を含む空白は、トークンの間で書かれたまま残し、
それを含む名前も同じです。
ER 図では、空白そのものを読む規則を除き、これらは名前の文字です。
文字が見えないので、例は文字列で書き、`\u2028` を U+2028、`\n` を改行とします。
[test: U+2028 inside an entity name] [test: U+2029 inside a role name]
[test: U+2028 before the colon of a role]
[test: U+2028 between direction and its value]
[test: U+2028 in the text after a direction]
[test: U+2028 inside an attribute name]

実体のヘッダー、subgraph のヘッダー、クラス定義で、
U+2028 や U+2029 の後にコメント行がある範囲は書かれたまま残します。
mermaid.js がコメント行とその前の空白を除き、
後続の行を区切り文字の前のテキストにつなぐためです。
[test: a comment line after U+2028 in an ER entity header]
[test: a comment line after U+2029 in an ER entity header]
[test: a comment line after U+2028 in an ER subgraph header]
[test: a comment line after U+2029 in an ER subgraph header]
[test: a comment line after U+2028 in an ER class definition]
[test: a comment line after U+2029 in an ER class definition]

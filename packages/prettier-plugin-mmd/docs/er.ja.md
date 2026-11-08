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
属性は列にそろえません。
そろえると、属性を 1 つ変えただけでブロックの全行が変わり、
名前の幅は文字数で数えられず、mermaid.js の文書の例もそろえていないからです。
空白 1 つと、型に接する `?` は、その例の形です。
[fixture: attribute-spacing/tilde-word-runs-collapsed]
[fixture: attribute-spacing/backquoted-word-runs-collapsed]

複数行に書かれた属性は 1 行に印字します。
属性ブロックは改行に関係なく読まれるからです。
[fixture: attribute-spacing/over-lines-joined]
[corpus fixture: er/gram-attribute-split-lines]
[corpus fixture: er/gram-name-then-key-next-line]
部分の間にコメント行かディレクティブがある属性は、改行を保ちます。
後続の構造部分と独立した trivia 行は、subgraph の中でも、
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
[fixture: attribute-spacing/directive-inside-kept]
[fixture: attribute-spacing/directive-and-line-break-kept]
同じ行に書かれた 2 つの属性の間のディレクティブは、各属性が単独の行に立つので、
後ろの属性と一緒に次の行へ移ります。
[fixture: attribute-spacing/directive-between-attributes-on-a-line]

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
各文は行に単独で置きます。
1 行に 2 つの文があると読みにくく、flowchart、sequence、class、
state も 1 行に 1 つの文を印字します。
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

2 つの場合は、文を 1 行に残します。
実体 `1` の直後に、空白なしで、またはディレクティブだけを挟んで、別の文や、
その subgraph の `end` が続くときは、そのままにします。
`1a` は実体 `1` と `a` ですが、`1` と文字を 2 行に分けたり、
間に空白を置いたりすると、
カーディナリティ `only-one` と名前になるからです（diagrams/er.md、
カーディナリティ、数、関係の線、規則 11）。
ほかの数は、後ろの文と分けます。
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
後ろに文がなければ、ほかのブロックと同じく単独の行に置きます。
[fixture: statements-one-per-line/semicolon-line-block-kept]
[fixture: statements-one-per-line/semicolon-line-subgraph-end-kept]

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
  E }|..|{ F : "z"
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
  12
  a
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
表にあるキーワードは、そこで示す大文字小文字で印字します。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
`SUBGRAPH` は `subgraph`、`END` は `end` です。
ほかのキーワード（`CLASS`、`CLASSDEF`、`STYLE`）は、
書かれた大文字小文字を保ちます。
（[大文字小文字をそろえるキーワード](./compatibility.ja.md#大文字小文字をそろえるキーワード)）。
Db がそのまま保つ属性のキーも同じです。
関係の語は記号として印字します（[関係の空白](#関係の空白)を参照）。
[fixture: whitespace-between-tokens/keyword-case-one-form]
[fixture: relationship-spacing/cardinality-words-case-one-form]

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
  accDescr { D }
  A ||--u-B : x
  1 ||--|| B : x
```

入力
([whitespace-between-tokens/keyword-case-one-form-input.mmd](../tests/fixtures/er/whitespace-between-tokens/keyword-case-one-form-input.mmd)):

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
([whitespace-between-tokens/keyword-case-one-form-output.mmd](../tests/fixtures/er/whitespace-between-tokens/keyword-case-one-form-output.mmd)):

```mmd
erDiagram
  subgraph S
    A
  end
  CLASSDEF a fill: red
  CLASS A a
  STYLE A fill: red
  direction LR
  ACCTITLE: T
  ACCDESCR: D
  ACCDESCR { D }
  A }|--o{ B : x
  A {
    int a PK
  }
```

### 関係の空白

関係は、左の実体と関係の間、関係と右の実体の間、役割の `:` の両側に、
どう書かれていても空白 1 つを置きます。
これは mermaid.js の文書の形で、役割は名前、文字列、
引用符つきの名前のどれでも同じです。
[fixture: relationship-spacing/around-units-and-role]
[fixture: relationship-spacing/names-and-classes]
[fixture: relationship-spacing/role-forms]
[corpus fixture: er/lex-relationship-no-spaces]
[corpus fixture: er/lex-colon-no-space]
実体のクラスは、`:::` と、その間の `,` に両側で接します。
[fixture: relationship-spacing/names-and-classes]

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
`:::` の後のクラスは `:::` に接し、両側のクラスに接する `,` で区切ります。
`A ::: c1 , c2` は `A:::c1,c2` にします。
別名と `:::` を接する書き方が、mermaid.js の文書の例の多くです。
[fixture: entities/classes-tight] [fixture: entities/alias-and-classes]
属性ブロックの `{` は空白 1
つの後に置きます（[属性ブロック](#属性ブロック)を参照）。
名前は、引用符の有無も数も含めて、書かれたまま残します。
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
  "A"[B]
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
  A:::c1,c2
  "A B":::c
  A:::é,b-c
  B:::d
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
名前と `[` の間のディレクティブは、
[ディレクティブ](#ディレクティブ)のとおりに置きます。
[fixture: subgraphs/title-beside-directive]
[fixture: subgraphs/title-beside-directive-runs]
そこにある U+2028 と U+2029 は、そのまま残します。
[test: U+2028 between an ER subgraph name and its title]
[test: U+2029 between an ER subgraph name and its title]
本体の文は 1 段深く置き、`end` は、subgraph と同じ段に行に単独で置き、
どの大文字小文字でも `end` と印字します。
本体の `class`、`classDef`、`style` 文のキーワードは、subgraph の外と同じく、
書かれたまま残します。
mermaid.js は、それを書かれたまま subgraph のノードに並べます。
[fixture: subgraphs/statement-keywords-case-kept]
`end` の後に同じ行で続く文は、次の行に置きます。
[fixture: subgraphs/end-on-the-line-of-a-statement]
[fixture: subgraphs/end-case-one-form] [fixture: subgraphs/entity-after-end]
文のない subgraph は、`end` を次の行に置いて印字します。
[fixture: subgraphs/empty]

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
`direction` と値の間には空白 1 つを置き、値は大文字で印字します。
`lr` は `LR` です。
mermaid.js の文書の例で使う形です。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
[fixture: direction/spacing] [fixture: direction/text-kept]
[fixture: direction/case-one-form] [fixture: direction/case-bt-rl-one-form]
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
([direction/case-one-form-input.mmd](../tests/fixtures/er/direction/case-one-form-input.mmd)):

```mmd
erDiagram
DIRECTION lr
Direction Tb
```

出力
([direction/case-one-form-output.mmd](../tests/fixtures/er/direction/case-one-form-output.mmd)):

```mmd
erDiagram
  direction LR
  direction TB
```

### スタイルとクラス

名前とクラスのリストでは、名前に接する comma を使います。
最初のスタイルは空白 1 つの後に置きます。
`style` と `classDef` の、通常の 1 行のプロパティと値からなるスタイルでは、
最初の `:` の前を詰め、空でない値の前に空白を 1 つ置きます。
スタイル間は `,` とその後の空白 1 つで区切ります。
プロパティと値の内部は、値の語の間の連続空白も含めて保ちます。
Mermaid はスタイルの単位をつなげて読むため、
`stroke-dasharray: 5 5` は引き続き `stroke-dasharray:55` です。
`fill   : navy, stroke  : black` は `fill: navy, stroke: black` にします。
`stroke-dasharray:  5    5` は、値の間の空白 4 つを保ちます。
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
[fixture: styles-and-classes/style-inner-whitespace-kept]

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
  classDef a,b,c fill: red
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
説明の setter がこの字下げを捨てるためです。
改行、行末空白、ディレクティブの内部は保ちます。
subgraph 内では、生の説明がその所属の読みにも使われるため、
本文の元の列を保ちます。
[corpus fixture: er/db-subgraph-nodes-acc-descr-block-lines]
`}` は文と同じ段に置きます。
`{` の行にあるテキストは、括弧に接して書かれていても、
波括弧の内側に空白を 1 つずつ置きます。
[fixture: accessibility-statements/block-lines-kept]
[fixture: accessibility-statements/block-comment-and-empty-lines-kept]
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
普通の独立した trivia はブロックの内側にそろえます。
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
`direction LR` は、1 桁目の `accTitle: direction LR` として印字します。
`direction` と方向の間のコメント行とディレクティブは、
字句解析器がそれらなしにテキストを読むので、飛ばし（diagrams/er.md、
単位の間のトリビア）、空行も同じです。
方向が続かなければ、その文はほかの文と同じに字下げします。
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
    accDescr {
  three
    }
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
accDescr { direction RL }
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
空の description block も通常の配置に従い、スタイルの終端は削除します。
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

mermaid.js が複数行にわたって読む文は、
改行が字句解析器にとって空白である所では 1 行に印字します。
`accTitle` と `accDescr` の `:` の後、`direction` と値の間、
空白の後の `classDef` と `style` の文の中です。
[fixture: multi-line-statements/breaks-decided-one-by-one]
[fixture: multi-line-statements/line-rule-first-hash-after-colon-kept]
[fixture: multi-line-statements/accessibility-text-joined]
[fixture: multi-line-statements/direction-value-joined]
[fixture: multi-line-statements/style-over-lines-joined]
コメント行やディレクティブがある文は改行を残し、
構造の続きの行と間の注釈を 1 段深く置きます。
値の中の空白と、各隙間の最初の改行の前の空白は保ちます。
コメントで結合される領域では、文全体を原文のまま残します。
改行を空白 1 つか何も挟まずにつなぐと、
行の規則が無視する `;` が変わりうる場合と、最後の行を `;` が終える場合は、
その改行を残します。
それ以外の改行は、`;` を含む文でも通常どおりつなぎます。
改行が残る文は、スタイルも書かれたままにします。
[fixture: multi-line-statements/semicolon-joining-changes-kept]
[fixture: multi-line-statements/style-comment-continuation]
[fixture: multi-line-statements/comment-line-inside-kept]
[fixture: multi-line-statements/directive-inside-kept]

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

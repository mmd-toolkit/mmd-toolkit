# kanban の整形規則

英語版: [kanban.md](./kanban.md)
prettier-plugin-mmd が kanban のボードをどう整形するかを説明します。
以下の各規則は、mermaid.js がボードから読むものを保ちます。
整形によってボードの解釈が変わる箇所は、入力をそのまま残します。
各規則でその条件を説明します。
mindmap と同じ規則はそう書き、理由は mindmap の規則にあります。
kanban のボードは、行の平らなリストです
（[kanban の木](../../spec/docs/ast/kanban.ja.md)を参照）。
Db は、ノードごとに、セクションかどうかと、どのセクションに属するかを持ち、
字下げは持ちません。
最初の行のノードがセクションの字下げを決めます。
その字下げに書かれたノードはセクションで、
ほかのノードは、どれだけ深く書かれていても、直前のセクションの項目です。
深い行は直前の行の子ではありません。
そのため、印字は、どの行もリストの中の場所と役割を保ち、字下げは印字が決めます
（[インデント](#インデント)を参照）。
以下の規則では、次の言葉を使います。

- **ノード行**は、セクションか項目を持つ行です。
  id、省略できる形、省略できるデータブロックでできていて、
  `Todo`、`a[Write docs]`、`a[x]@{ticket: T-1}` などです。
- **飾り行**は、アイコンの行（`::icon(fa fa-star)`）か、
  クラスの行（`:::urgent`）です。
  直前に書かれたノード行を、字下げに関係なく飾ります。
- **ディレクティブ**は `%%{ ... }%%` です。
  mermaid.js はこれを、インデントとテキストを読む前に取り除くので、
  ディレクティブの隣の空白は、字下げかテキストの一部になります。
- **コメント行**は、`%% note` のように、`%%` の後にテキストを持つ行です。
  mermaid.js は、テキストを読む前に、その改行ごと取り除きます。
  **図のコメント**は、図の字句解析器が自分で読むコメントで、
  `%%` だけの行、`%%{ }%%` の行、
  ヘッダー、形、アイコン、データブロックの後の `%%`（`S[x] %% note`）です。
  既知の差異
  [`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.ja.md)
  が両方を定義しています。
- **保つ行**は、`;` を持つ行です。
  ノードのテキストは書かれたまま残します
  （[行の規則と保つ行](#行の規則と保つ行)を参照）。
  パーサーが拒否するボードについて、プラグインは構文エラーを報告し、
  テキストをそのまま残します。
  印字は何も直しません
  （[整形しない場合](../README.ja.md#整形しない場合)を参照）。
  適合性コーパスの拒否される入力は、`corpus.test.ts` が確かめます。
  各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
  例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
  Markdown で示せない空白は、テストの中でエスケープして書きます。
  fixture の置き方と確かめ方は、
  [文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ノード行の字下げは、セクションと項目を区別するだけのものです。
Db は、ノードごとに、セクションかどうかと、どのセクションに属するかを持ち、
字下げは持ちません。
最初のノードの字下げに書かれたノードはセクションで、ほかのノードは、
字下げに関係なく、
直前のセクションの項目です。
最初のノードより浅い最後の行も項目です
（diagrams/kanban.md）。
そのため、[mindmap](./mindmap.ja.md#インデント)と同じく、
書かれた字下げは Db を読む側に残るものを持たず、印字が字下げを決めます。
セクションはヘッダーより 1 段深く、項目は、書かれた深さに関係なく、
2 段深く置きます。
`kanban`、`      S`、`          A`、`             B`、`      T` は、
`S` と `T` を空白 2 つで、`A` と `B` を空白 4 つで印字します。
[fixture: indentation/sections-and-items]
[fixture: indentation/written-indentation-dropped]
[fixture: indentation/first-section-at-the-first-column]
[fixture: indentation/items-at-any-depth]

1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、既定は空白 2 つ、
`useTabs` ではタブ 1 つです。
ノードの前の空白文字は、タブ、U+00A0、U+3000、U+FEFF も含め、
どれも字下げの 1 文字で
（[空白文字](#空白文字)を参照）、印字はオプションの文字だけを書くので、
どの行の字下げも 1 種類の文字になります。
[fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]
[test: kanban: tab-one-space]
[test: kanban: indent-whitespace-kind]
[test: kanban: ls-indent-one-space]
[test: kanban: ps-indent-count]

一部を書かれたまま印字する行も、字下げは印字が決めます。
Db は、ノードの字下げを最初のノードの字下げと比べるので、
数える文字は正しく保ちます。
テキストの前にディレクティブのある行では、ディレクティブの後の空白も字下げで、
ディレクティブは数えないので（[ディレクティブ](#ディレクティブ)を参照）、
その行は、ほかの行と同じく、役割の字下げを持ちます。
`;` を持つ行（[行の規則と保つ行](#行の規則と保つ行)を参照）では、
テキストの前の空白を同じように決めます。
U+2028 か U+2029 で終わる図のコメントの後では、
区切りが次のノードの字下げの 1 文字で、
そのまま残し（[空行](#空行)を参照）、その後の空白が残りを作ります。
[fixture: directives/leading-directive-indentation-decided]
[fixture: directives/wide-whitespace-after-directive]
[fixture: directives/leading-directive-gap-shortened]
[fixture: line-rule-and-kept-lines/kept-line-indentation-decided]
[fixture: blank-lines/div-between-comment-blank]

入力
([indentation/sections-and-items-input.mmd](../tests/fixtures/kanban/indentation/sections-and-items-input.mmd)):

```mmd
kanban
      S
          A
             B
      T
```

出力
([indentation/sections-and-items-output.mmd](../tests/fixtures/kanban/indentation/sections-and-items-output.mmd)):

```mmd
kanban
  S
    A
    B
  T
```

入力
([indentation/items-at-any-depth-input.mmd](../tests/fixtures/kanban/indentation/items-at-any-depth-input.mmd)):

```mmd
kanban
 S
   A
      B
  C
 T
```

出力
([indentation/items-at-any-depth-output.mmd](../tests/fixtures/kanban/indentation/items-at-any-depth-output.mmd)):

```mmd
kanban
  S
    A
    B
    C
  T
```

### ヘッダー

ヘッダー `kanban` は 1 桁目に置きます。
ヘッダーの行の `kanban` の後のテキストは、
間の空白を字下げとするノード行として読まれます。
`kanban   S[x]` のノード `S[x]` は最初のノードで、セクションです。
印字は、これを自分の行に移し、ほかのセクションと同じに字下げします。
`kanban`、改行、`  S[x]` となります。
ノードがヘッダーに接している `kanban[S]` や `kanban-x` でも同じです
（`  [S]`、`  -x`）。
`kanban` の後にあるものは、ノードのテキストである `%%` も含め、
すべて一緒に動きます
（`kanban S %% literal` は、行 `  S %% literal` になります）。
ディレクティブを持つヘッダーの行は、ノードとディレクティブを一緒に動かします
（[ディレクティブ](#ディレクティブ)を参照）。
`;` を持つヘッダーの行も例外ではありません。
単語 `kanban` には行の規則が読むものがないので、ノードは `;` と一緒に動きます
（`kanban S;T` は `kanban` と `  S;T` になります。
[行の規則と保つ行](#行の規則と保つ行)を参照）。
[fixture: header/inline-count]
[fixture: header/header-column]
[fixture: header/header-touching-shape]
[fixture: header/header-touching-dash]
[fixture: header/header-percent-in-text]
[fixture: header/header-line-with-semicolon-moved]
[fixture: header/header-directive-with-semicolon]
[fixture: header/header-line-with-semicolon-then-sections-and-items]
[test: kanban: header-tab-inline]
[test: kanban: header-nbsp-count]
[test: kanban: header-bom-count]

後に何もないヘッダーは、`kanban` と改行のままです。
`kanban` の後の空白は落とします（[空行](#空行)を参照）。
`kanban` の後に改行のない図は拒否されます
（[整形しない場合](../README.ja.md#整形しない場合)を参照）。
[fixture: header/header-only-lf]
[fixture: header/header-space-only]

入力
([header/inline-count-input.mmd](../tests/fixtures/kanban/header/inline-count-input.mmd)):

```mmd
kanban   S[x]
     A
```

出力
([header/inline-count-output.mmd](../tests/fixtures/kanban/header/inline-count-output.mmd)):

```mmd
kanban
  S[x]
    A
```

### ノードは 1 行に 1 つ

ボードのノードは平らなリストです。
最初の行のノードがセクションの字下げを決め、
その字下げのノードがセクションを始め、
ほかのノードは、どれだけ深く書かれていても、直前のセクションの項目です。
前の項目より深く書かれた項目（`A` の後の、より深い `B`）は、
その子ではありません。
そのため、印字は、ノードを書かれた順に 1 行ずつ出し、
入れ子にも、まとめることも、並べ替えることも、つなぐこともしません。
同じ id の 2 つのセクションは 2 つのままで、
どの深さの項目も項目の 1 つの深さで印字し、
最初のセクションより浅い最後の行は項目として印字します
（[インデント](#インデント)を参照）。
入れ子、まとめ、並べ替え、つなぐことは、
mermaid.js が作るボードを変えるからです。
[fixture: nodes-one-per-line/flat-order]
[fixture: nodes-one-per-line/deeper-to-regular-items]
[fixture: nodes-one-per-line/repeated-ids]
[fixture: nodes-one-per-line/shallower-last]

入力
([nodes-one-per-line/flat-order-input.mmd](../tests/fixtures/kanban/nodes-one-per-line/flat-order-input.mmd)):

```mmd
kanban
 S
   A
     B
   C
 T
```

出力
([nodes-one-per-line/flat-order-output.mmd](../tests/fixtures/kanban/nodes-one-per-line/flat-order-output.mmd)):

```mmd
kanban
  S
    A
    B
    C
  T
```

### 形

形の開きと閉じは、書かれたまま印字します。
閉じは開きと合っていなくてもよく、`S[x)` は受理されます。
`S[x]` と書き換えても Db は同じですが、
書き手が書いたものを書き換えることになります
（[mindmap](./mindmap.ja.md#形)も同じです）。
どの形の族も同じです。
`S[x]`、`A(y)`、`B((z))`、`C{{q}}`、`D)w(`、`E))v((`、
ダッシュの書き方 `F-)"bang"(-` と `G(-"cloud"-)` です。
id のない形（`[S]`）も同じです。
[fixture: shapes/mismatched]
[fixture: shapes/matching-closer]
[fixture: shapes/shape-families]
[fixture: shapes/shape-alone]
[fixture: shapes/db-shape-square]
[fixture: shapes/db-shape-round]
[fixture: shapes/db-shape-circle]
[fixture: shapes/db-shape-hexagon]
[fixture: shapes/db-shape-bang]
[fixture: shapes/db-shape-bang-alt]
[fixture: shapes/db-shape-cloud]
[fixture: shapes/db-shape-cloud-alt]
[fixture: shapes/db-shape-mismatched]
[fixture: shapes/lex-shape-dash-bare]
[fixture: shapes/lex-shape-dash-string]

裸の id と形の間の空白は残します。
Db は裸の id の末尾の空白を保つので、`S [x]` の id は空白を含む `S ` です。
[fixture: shapes/id-before-shape]

入力
([shapes/mismatched-input.mmd](../tests/fixtures/kanban/shapes/mismatched-input.mmd)):

```mmd
kanban
 S[x)
   A(y]
   B))z((
   C{{q}}
```

出力
([shapes/mismatched-output.mmd](../tests/fixtures/kanban/shapes/mismatched-output.mmd)):

```mmd
kanban
  S[x)
    A(y]
    B))z((
    C{{q}}
```

### ラベル

ラベルは、書かれた形のまま印字します。
裸（`A[x y]`）、引用符つき（`B["x y"]`）、markdown（`C["`x y`"]`）です。
ラベルの中の空白は Db に入るので残します。
空白だけのラベル（`S[ ]`、`A[" "]`）と、裸のラベルの両端の空白
（`S[  x  ]`）も同じです。
引用符が文字列の始まりになるのは、開きの直後だけなので、
`D[ "x" ]` のテキストは、引用符とその両側の空白を含む裸のテキスト `"x"` で、
印字はそれらを動かしません。
実体（`a#35;b`）と HTML の属性（`<a href="x">`）はテキストで、そのまま残ります。
形の外に書かれた `""` や `"``"` のノードも同じです。
[fixture: labels/forms]
[fixture: labels/inner-whitespace-trim]
[fixture: labels/leading-space-quote]
[fixture: labels/whitespace-only-forms]
[fixture: labels/bare-empty-spellings]
[fixture: labels/lex-style-entity-two-semicolons]
[fixture: labels/db-grid-html-attribute-item-label-quoted]
[fixture: labels/db-grid-entity-item-label-quoted]

印字は、ラベルに引用符をつけることも、外すことも、削ることも、足すことも、
符号化することも、戻すこともしません。
`A[x y]` と `A["x y"]` の Db は同じですが、書き方は書き手のものです。
文字列の閉じ引用符の後の空白（`S["x" ]`）は拒否されるので、
印字する形にはなりません
（[整形しない場合](../README.ja.md#整形しない場合)を参照）。
[fixture: labels/bare-to-quoted]
[fixture: labels/space-after-string-invalid]

入力
([labels/forms-input.mmd](../tests/fixtures/kanban/labels/forms-input.mmd)):

```mmd
kanban
 S
   A[x y]
   B["x y"]
   C["`x y`"]
   D[ "x" ]
```

出力
([labels/forms-output.mmd](../tests/fixtures/kanban/labels/forms-output.mmd)):

```mmd
kanban
  S
    A[x y]
    B["x y"]
    C["`x y`"]
    D[ "x" ]
```

### アイコンとクラス

飾り行は、直前に書かれたノード行を、字下げに関係なく飾るので、
字下げは Db に入りません。
印字は、どの飾り行も、飾るノード行の桁に置き、付いている先が見えるようにします
（mermaid.js の文書の書き方で、[mindmap](./mindmap.ja.md#飾り行)も同じです）。
` S`、`   A`、1 桁目の `::icon(x)` では、アイコンは `A` を飾り、
項目の字下げ 4 文字で印字します。
最初のノードより浅く、やはり項目であるノード行の後では、
アイコンはそのノード行に従います
（`    S`、`  A`、` ::icon(x)` は、`A` とアイコンを字下げ 4 文字で印字します）。
[fixture: icons-and-classes/aligned]
[fixture: icons-and-classes/decorations-align]
[fixture: icons-and-classes/gram-shallower-then-decoration]
[fixture: icons-and-classes/db-decoration-icon-section]
[fixture: icons-and-classes/gram-decoration-then-child]

飾りのテキストは書かれたまま残します。
マーカーの大文字小文字（`::ICON(y)`）、アイコンの中の空白（`::icon( x )`）、
クラスの中の空白（`::: c  ` の末尾の空白はクラスの一部です）、
空白だけのアイコンとクラス、最初の後の 2 つめのアイコンやクラスです。
後のアイコンは Db で前のものを置き換えますが、
印字は何も落とさないので両方を残します。
飾りをノードの行へ動かすことはしません。
ボードが変わるからです。
裸のノードの後ろでは、アイコンは括弧のテキストが丸い形になり、
残りが id の一部になります
（`A ::icon(x)` はラベル `x` のノード `A ::icon` です）。
クラスは id の一部になります（`A :::c` の id は `A :::c` です）。
形の後ろでは、どちらも拒否されます
（`S[x] ::icon(star)`。
[整形しない場合](../README.ja.md#整形しない場合)を参照）。
クラスとセクションのアイコンは、テストが比べる Db には現れませんが、
書き手が書いたテキストなので、同じように残します。
[fixture: icons-and-classes/icon-after-bare]
[fixture: icons-and-classes/class-after-bare]
[fixture: icons-and-classes/icon-appended-to-bare-is-a-shape]
[fixture: icons-and-classes/class-appended-to-bare-is-the-id]
[fixture: icons-and-classes/icon-after-shape]
[fixture: icons-and-classes/class-after-shape]
[fixture: icons-and-classes/icon-value-trim]
[fixture: icons-and-classes/class-value-trim-summary-only]
[fixture: icons-and-classes/gram-whitespace-class]
[fixture: icons-and-classes/gram-whitespace-icon]
[fixture: icons-and-classes/db-decoration-icon-twice]
[fixture: icons-and-classes/db-decoration-class-twice]

入力
([icons-and-classes/aligned-input.mmd](../tests/fixtures/kanban/icons-and-classes/aligned-input.mmd)):

```mmd
kanban
 S
   A
 ::icon(x)
       :::hot
```

出力
([icons-and-classes/aligned-output.mmd](../tests/fixtures/kanban/icons-and-classes/aligned-output.mmd)):

```mmd
kanban
  S
    A
    ::icon(x)
    :::hot
```

### データブロック

データブロック `@{ ... }` は、mermaid.js がノードの属性
（`ticket` や `assigned`）の YAML として読む、
埋め込みのテキストです。
印字は、これを不透明なものとして、区切り、中身、改行を、書かれたまま残します。
YAML を整形することも、ブロックをまとめることも、分けることも、
並べ替えることも、
折り返すことも、直すこともしません。
ブロックが空（`A@{}`）でも、キーが未知か重複（`A@{ticket: X, ticket: Y}`）でも、
YAML として正しくなくても（`A@{assigned: [a}`）、複数行にわたっても同じです。
Db が変わらない書き換えでも、書き手が埋め込んだテキストを変えることになります。
[fixture: data-blocks/data-opaque]
[fixture: data-blocks/empty-data]
[fixture: data-blocks/data-invalid-yaml]
[fixture: data-blocks/data-unknown-duplicate]
[fixture: data-blocks/gram-metadata-ticket-duplicate]
[fixture: data-blocks/data-multiline]
[fixture: data-blocks/gram-metadata-empty-multiline]
[fixture: data-blocks/db-metadata-comment-line]
[fixture: data-blocks/db-metadata-ticket-false]
[fixture: data-blocks/db-metadata-assigned-zero]
[fixture: data-blocks/db-metadata-quoted-brace]
[fixture: data-blocks/data-line-rule-gap]

ブロックが付く場所は構文の一部です。
ブロックは形の閉じに接し（`A[x]@{ticket: X}`）、そこに空白があると拒否されます。
裸の id の後では、ブロックの前の空白は id の一部なので、
`A  @{ticket: X}` の id は `A  ` です。
続くブロックは接し
（`A[x]@{ticket: X,}@{assigned: Ada}`。mermaid.js は中身をつなぎます）、
間に置けるのはディレクティブだけで
（`A@{ticket: X,}%%{init: {}}%%@{assigned: Ada}`）、
2 つのブロックの間の空白は拒否されます。
印字は、これらを書かれたまま残します。
[fixture: data-blocks/data-space-after-shape]
[fixture: data-blocks/data-space-after-bare]
[fixture: data-blocks/data-space-before-kept]
[fixture: data-blocks/adjacent]
[fixture: data-blocks/data-adjacent-gap]
[fixture: data-blocks/data-adjacent-directive]
[fixture: data-blocks/data-empty-adjacent]

入力
([data-blocks/adjacent-input.mmd](../tests/fixtures/kanban/data-blocks/adjacent-input.mmd)):

```mmd
kanban
 S
   A[x]@{ticket: X,}@{assigned: Ada}
```

出力
([data-blocks/adjacent-output.mmd](../tests/fixtures/kanban/data-blocks/adjacent-output.mmd)):

```mmd
kanban
  S
    A[x]@{ticket: X,}@{assigned: Ada}
```

### 空行

ヘッダーの後の、空行、コメント行、図のコメントは、
ノードの間でも、飾りの前でも、ボードの終わりでも、Db を変えません
（diagrams/kanban.md、Blank lines）。
文の間の空行の並びは 1 つの空行にし、空白だけの行は空行とみなし、
ボードの始まりと終わりの空行は、ほかの図種と同じに落とします。
`kanban`、空行 2 つ、` S` は、`kanban` と `  S` になります。
ほかに何もないヘッダーの行の `kanban` の後の空白は、
空白、タブ、U+00A0、U+3000、U+FEFF、改ページ、垂直タブ、U+2028、
U+2029 のどれでも落とします。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/blank-body-end]
[fixture: blank-lines/gram-grid-lf-header-line]
[fixture: blank-lines/decoration-blank-runs-collapsed]
[fixture: blank-lines/gram-blank-before-icon]
[fixture: blank-lines/div-header-space-node]
[test: kanban: blank-whitespace]
[test: kanban: header-tab-trailing]
[test: kanban: header-bom-trailing]
[test: kanban: header-crlf-trailing]
[test: kanban: header-ff-trailing]
[test: kanban: header-ideographic-trailing]
[test: kanban: header-ls-trailing]
[test: kanban: header-nbsp-trailing]
[test: kanban: header-ps-trailing]
[test: kanban: header-vt-trailing]
[test: kanban: lex-tab-whitespace-first]
[test: kanban: lex-bom-whitespace-first]
[test: kanban: lex-cr-whitespace-first]
[test: kanban: lex-crlf-whitespace-first]
[test: kanban: lex-ideographic-whitespace-first]
[test: kanban: lex-ls-whitespace-first]
[test: kanban: lex-nbsp-whitespace-first]
[test: kanban: lex-ps-whitespace-first]

mermaid.js は、仕様が受理するこれらの置き方の一部を拒否します
（既知の差異
[`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.ja.md)）。
受理されるかどうかは、2 つの文の間にある図のコメントと空行の数で決まります。
たとえば、`S`、`%%` の行、空行、`   A` は、mermaid.js が拒否し、
仕様が受理します。
印字はそれを直しません。
図のコメントの後に空行、別のコメント、U+2028 か U+2029 が続く隙間は、
書かれたまま、全体を残します。
空行とコメントを、次の文の字下げの前までです。
字下げは印字が決めます（[インデント](#インデント)を参照）。
コメント行だけの隙間（`S`、`%% note`、空行、`A`）は通常どおり整形し、
コメント行を揃えます（[コメント](#コメント)を参照）。
[fixture: blank-lines/div-between-comment-blank]
[fixture: blank-lines/div-comment-blank-before-icon]
[fixture: blank-lines/div-comment-blank-before-class]
[fixture: blank-lines/blank-comment-accepted]
[fixture: blank-lines/comment-blank-trailing]
[fixture: blank-lines/blank-comment-text-accepted]
[fixture: blank-lines/common-comment-after-directive]

ヘッダーの直後では、mermaid.js は `kanban` の後の空行と、
ヘッダーの行の末尾の空白を拒否し、
仕様はそれらを受理します。
印字はそれらを落とすので、mermaid.js は出力を受理し、Db は仕様の Db です。
ヘッダーの後の図のコメントの後の空行は、上の規則で残ります。
`kanban`、`%%`、`%%`、空行、`S` は、mermaid.js が入力も出力も拒否し、
`%%` が 1 つなら両方が受理するので、隙間を保ちます。
拒否されるテキストに mermaid.js の Db はないので、
これらは Db の前後の比較ではありません。
[fixture: blank-lines/div-header-comments-blank]
[fixture: blank-lines/header-header-comment-blank]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/kanban/blank-lines/collapsed-input.mmd)):

```mmd
kanban
 S


   A



 T
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/kanban/blank-lines/collapsed-output.mmd)):

```mmd
kanban
  S

    A

  T
```

入力
([blank-lines/div-between-comment-blank-input.mmd](../tests/fixtures/kanban/blank-lines/div-between-comment-blank-input.mmd)):

```mmd
kanban
 S
%%

   A
```

出力
([blank-lines/div-between-comment-blank-output.mmd](../tests/fixtures/kanban/blank-lines/div-between-comment-blank-output.mmd)):

```mmd
kanban
  S
%%

    A
```

### コメント

単独のコメントは、コメント行（`%% note`）、`%%` だけの行、`%%{ }%%` の行です。
後ろの文の桁に置き、ボードの終わりでは最後の文の桁に、
ヘッダーの前では 1 桁目に置きます。
印字は、印とテキストを書かれたまま残します。
コメントがどの文についてのものかが見えるようになります
（[mindmap](./mindmap.ja.md#コメント)も同じです）。
`kanban`、`%% c1`、` S`、`       %% c2`、`   A`、`%% c3` では、
コメントは字下げ 2、4、4 文字で、`S` と `A` の字下げに置きます。
複数行のラベルやデータブロックの中のコメント行は、mermaid.js が取り除き、
そのまま残ります。
空行、別のコメント、U+2028 か U+2029 が続く図のコメントは、
後ろの隙間と一緒に書かれたまま残します
（[空行](#空行)を参照）。
[fixture: comments/comments-align]
[fixture: comments/bare-brace-comments-aligned]
[fixture: comments/header-leading-comment]
[fixture: comments/comment-line-in-value]

ヘッダー、形、アイコン、データブロックの後の図のコメントは、その行に残します。
空白が書かれていれば前に空白 1 つを置き、接していれば接したままにします。
コメントの前の空白は Db に入らないので、この形は選択です。
空白の連なりは 1 つにし、空白があるかどうかは保ちます。
コメントが前のものに接するかどうかは書き手が決めるからです
（[mindmap](./mindmap.ja.md#コメント)も同じ選択です）。
`S[x]   %% c` は `S[x] %% c` になり、`A[y]%% d` は変わりません。
裸の id の後、ラベルの中、クラスの中の `%%` はテキストの文字で
（`S %% x`、`A[%% y]`、`:::c %% z`）、
`#` や 1 つの `%` で始まる行はノードのテキストです。
印字はこれらに触りません。
コメント行は、改行までのテキストと一緒に取り除かれ、
そこにある U+2028 や U+2029 でも終わりません。
区切りの後のテキストも、取り除かれるコメントの一部で、印字はそこに残します。
[fixture: comments/inline]
[fixture: comments/header-comment-gap]
[fixture: comments/comment-after-data-gap]
[fixture: comments/comment-after-icon-gap]
[fixture: comments/percent-values]
[test: kanban: comment-line-ls-taken]

入力
([comments/inline-input.mmd](../tests/fixtures/kanban/comments/inline-input.mmd)):

```mmd
kanban
 S[x]   %% c
   A[y]%% d
```

出力
([comments/inline-output.mmd](../tests/fixtures/kanban/comments/inline-output.mmd)):

```mmd
kanban
  S[x] %% c
    A[y]%% d
```

### ディレクティブ

mermaid.js はディレクティブをインデントとテキストを読む前に取り除くので、
ディレクティブの両側の空白は、そのノード行の字下げか、テキストの一部になります。
そのため、ディレクティブのある行（ディレクティブ行）は、
最初のディレクティブから、ディレクティブと隣の隙間を含めて、
書かれたまま印字します。
字下げは印字が決めます。
ノードのテキストの前の空白はすべて字下げで、ディレクティブの後の空白も含み、
ディレクティブは数えないので、その行は、ほかの行と同じく、
役割の字下げを持ちます。
印字は最初のディレクティブの前の空白を書き、
各ディレクティブの後の空白は、全体が収まるうちは書かれた文字数のまま残し、
収まらないときは、最後のディレクティブから順に縮めます。
隙間は、書き手がディレクティブの隣に書いたものなので、
できるだけ大きさを保ちます。
収まらない分は、Db が読むものを持ちません。
`kanban`、` S`、`      %%{init: {}}%%  A` では、ノード `A` は項目で、
字下げは 8 文字（ディレクティブの前に 6、後に 2）ですが、
4 文字になり、ディレクティブの前に 2、後ろに 2 です。
`    %%{a}%%  %%{b}%%   A` では隙間が 2 と 3 で、`A` は 4 を得るので、
最後の隙間を 2 に縮め、最初のディレクティブの前には何も置きません。
行の 2 つの単位の間（`A  %%{init: {}}%%  B[x]`）、データブロックの間、
id、アイコン、クラス、markdown ラベルの中のディレクティブ、
閉じていないディレクティブと、それがつなぐ行は、書かれたまま残します。
[fixture: directives/leading-directive-kept]
[fixture: directives/leading-directive-with-semicolon]
[fixture: directives/two-leading-directives]
[fixture: directives/leading-directive-then-empty-data]
[fixture: directives/leading-directive-before-icon]
[fixture: directives/leading-directive-after-empty-lines]
[fixture: directives/id-directive-kept]
[fixture: directives/unclosed-directive]
[fixture: directives/db-grid-directive-item-label-markdown]
[fixture: directives/db-grid-directive-item-icon]
[fixture: directives/db-grid-directive-item-class]
[fixture: directives/db-metadata-directive]
[test: kanban: unicode-inline-directive-indentation]
[test: kanban: directive-before-unicode-comment]
[test: kanban: directive-after-unicode-comment]

単独の行のディレクティブは、単独のコメントと同じに、後ろの文の桁に揃えます。
ヘッダーの行では、ノードは `kanban` の後のものすべて
（ディレクティブも）と一緒に自分の行へ移り、
最初のディレクティブかノードから、書かれたまま印字します。
`kanban %%{init: {}}%%  S[x]` は `kanban` と `%%{init: {}}%%  S[x]` になります。
ヘッダーより前のディレクティブは 1 桁目に置きます。
[fixture: directives/standalone]
[fixture: directives/standalone-directive-align]
[fixture: directives/header-directive-inline]
[fixture: directives/directive-before-header]

入力
([directives/standalone-input.mmd](../tests/fixtures/kanban/directives/standalone-input.mmd)):

```mmd
kanban
 S
       %%{init: {}}%%
   A
```

出力
([directives/standalone-output.mmd](../tests/fixtures/kanban/directives/standalone-output.mmd)):

```mmd
kanban
  S
    %%{init: {}}%%
    A
```

入力
([directives/leading-directive-indentation-decided-input.mmd](../tests/fixtures/kanban/directives/leading-directive-indentation-decided-input.mmd)):

```mmd
kanban
 S
      %%{init: {}}%%  A
```

出力
([directives/leading-directive-indentation-decided-output.mmd](../tests/fixtures/kanban/directives/leading-directive-indentation-decided-output.mmd)):

```mmd
kanban
  S
  %%{init: {}}%%  A
```

### 行の規則と保つ行

mermaid.js は、小文字の単語 `style`、続いて `:`、
`:` との間に空白のない `#`、続いて `;` を持つ行の、最後の `;` を無視します。
次の処理が `classDef` について同じことをします
（仕様の
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)）。
この規則は行のテキストを読むので、ラベル、データブロック、コメントと、
その間にあるものも含みます。
kanban の文ではありません。
そのテキストを動かしたり折り返したりすると、
規則が別の `;` を無視することがあります。
`S["style:#x ;y"]%% note;` のラベルは `style:#x ;y` です。
無視されるのはコメントの `;` だからです。
コメントを単独の行に移すと、ラベルの中の `;` が無視され、
ラベルは `style:#x y` になります。
[fixture: line-rule-and-kept-lines/line-rule-comment-after-label-kept]
[fixture: line-rule-and-kept-lines/line-rule-comment-on-its-own-line]
[fixture: line-rule-and-kept-lines/line-rule-comment-to-own-line]
[fixture: line-rule-and-kept-lines/line-rule-comment-move]
[fixture: line-rule-and-kept-lines/line-rule-classdef-and-style]
[fixture: line-rule-and-kept-lines/line-rule-two-semicolons]

そのため、`;` を持つ行は保つ行です。
ノードのテキストと、行の中のコメントやディレクティブは、
それらの間の隙間と、`:` と `#` の間の空白も含めて、書かれたまま残します。
`;` が id（`astyle:#x;y`）、ラベル、アイコン（`::icon(style:#x;y)`）、クラス、
データブロック、コメント、ディレクティブのどこにあっても同じで、
規則が行に当てはまるかどうかにも関係しません。
大文字の `style`（`aStyle`）、空白をはさむ `:` と `#`（`style: #x;`）、
`#` がない行、
複数行のラベルの別の行にある `;` は、規則を当てはめませんが、
テキストは同じように保ちます。
[fixture: line-rule-and-kept-lines/style-segment]
[fixture: line-rule-and-kept-lines/line-rule-kept]
[fixture: line-rule-and-kept-lines/line-rule-wrap]
[fixture: line-rule-and-kept-lines/line-rule-colon-space]
[fixture: line-rule-and-kept-lines/line-rule-directive-kept]
[fixture: line-rule-and-kept-lines/line-rule-id]
[fixture: line-rule-and-kept-lines/line-rule-data]
[fixture: line-rule-and-kept-lines/line-rule-icon]
[fixture: line-rule-and-kept-lines/line-rule-class]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-upper]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-no-hash]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-space]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-other-line]
[fixture: line-rule-and-kept-lines/lex-label-style-rule-two-semicolons]
[test: kanban: line-rule-ls-segment]

行のそれ以外は、ほかの行と同じく、印字が決めます。
規則が見るのは、単語 `style` か `classDef`、`:`、`#`、`;` と、その間の空白です。
行の前の字下げと、形、アイコン、データブロックの後の行末の空白は、それに入らず、
なくても Db は同じです。
前にタブ 2 つ、後に空白 3 つのある `A[style:#x;y]` と、
前に空白 2 つのある `A[style:#x;y]` は、
同じに読まれます。
そのため、字下げは印字が決め（[インデント](#インデント)を参照）、
行末の空白は Db に入らない所で落とします（[行末の空白](#行末の空白)を参照）。
`kanban`、` S` と、その行は、`  S` と、
空白 4 つで字下げした `A[style:#x;y]` を出力し、
後ろには何もありません。
[fixture: line-rule-and-kept-lines/kept-line-whitespace-decided]
[fixture: line-rule-and-kept-lines/kept-line-indentation-decided]
[fixture: line-rule-and-kept-lines/kept-line-data-trailing-whitespace]
[fixture: line-rule-and-kept-lines/kept-line-after-kept-gap]
[fixture: line-rule-and-kept-lines/kept-line-ignored-semicolon]
[fixture: line-rule-and-kept-lines/kept-line-unclosed-directive]
[fixture: line-rule-and-kept-lines/kept-line-use-tabs]
[test: kanban: semicolon-line-crlf-trailing-whitespace]

入力
([line-rule-and-kept-lines/style-segment-input.mmd](../tests/fixtures/kanban/line-rule-and-kept-lines/style-segment-input.mmd)):

```mmd
kanban
 S
   A[style:#x;] %% c;
```

出力
([line-rule-and-kept-lines/style-segment-output.mmd](../tests/fixtures/kanban/line-rule-and-kept-lines/style-segment-output.mmd)):

```mmd
kanban
  S
    A[style:#x;] %% c;
```

### 行末の空白

行末の空白は、Db に入らない所では落とします。
形の後（`S[x]   `）、アイコンの後（`::icon(z)  `）、データブロックの後
（`A[y]@{ticket: X}   `）、
閉じた文字列の後（`A["Work"]  `）です。
Db が保つ所では残します。
裸の id の後（`S   ` は id `S   ` で、形やデータブロックの前の空白も同じです）、
クラスの中（`:::c   `）、コメントの中、
ラベル、アイコン、データブロック、ディレクティブの中、複数行の値の続きの行です。
これは [mindmap](./mindmap.ja.md#ノードのテキスト) の区別で、
データブロックを加えたものです。
保つ行でも同じです。
[test: kanban: bare-trailing-trim]
[test: kanban: closed-trailing-trim]
[test: kanban: closed-whitespace-trim]
[fixture: trailing-whitespace/class-trailing-trim]
[fixture: trailing-whitespace/lex-after-quoted-spaces]
[fixture: trailing-whitespace/kept-line-kept]

### 改行

CRLF と単独の CR は、LF と同じく mermaid.js にとって改行で
（仕様の[行終端文字](../../spec/docs/common.ja.md#行終端)）、
ラベル、アイコン、ディレクティブ、データブロックの中でも同じです。
Prettier は、プラグインがテキストを読む前にそれらを変換し、
出力は `endOfLine` オプションの改行コードで、行は同じです。
印字にこのための独自の規則はありません。
[test: kanban: crlf-to-lf]
[test: kanban: cr-to-lf]
[test: kanban: multiline-data-crlf]
[test: kanban: multiline-data-cr]
[test: kanban: crlf-in-multiline-values]
[test: a kanban diagram with other line endings]

### 空白文字

通常の行の字下げでは、タブ、U+00A0、U+FEFF、U+3000、垂直タブ、改ページ、U+2028、
U+2029 は、
どれも 1 文字で、それぞれ空白 1 つ（`useTabs` ではタブ 1 つ）に置き換えます
（[インデント](#インデント)を参照）。
ラベル、アイコン、データブロック、裸の id、クラスの中では、テキストの文字で、
そのまま残ります
（`A\u00a0B[x\ufeff\t\u3000y]`）。
U+0085 は空白でなくテキストで、そのまま残ります。
U+2028 と U+2029 は改行ではありません。
`S[x\u2028y]` は 1 つのノードです。
U+FEFF で始まるファイルはそれを残します。
Prettier がプラグインより前に扱うからです。
[test: kanban: whitespace-values]
[test: kanban: nel-is-text]
[test: kanban: ls-is-value]
[test: kanban: ps-is-value]
[test: kanban: ls-bare-value]
[test: kanban: ls-data-value]
[test: kanban: ps-icon-value]
[test: kanban: leading-bom]

図のコメントは、改行と同じく U+2028 か U+2029 で終わり、
区切りとその後の空白は、次のノードの字下げと数えます
（`S[x]%% c\u2028   A` では `A` の字下げは 4 文字で、区切りと空白 3 つです）。
印字は、そのようなコメントと区切りを書かれたまま残し、
区切りの後に、ノードの字下げになる空白を書きます
（[インデント](#インデント)を参照）。
`;` を持つ行でも同じで、区切りの後のノードは行の始まりです。
`S[x]%% c;`、U+2028、` T` は、コメント、区切り、項目としての `T` を印字し、
コメントの中の `;` は `T` を行につなぎません。
コメント行（`%% c\u2029   A`）は、改行までのテキストと一緒に取り除かれるので、
その `A` はコメントの一部です。
印字はコメント行を揃え、テキストは残します。
クラスのテキストの後で改行の前にある区切りは、値の外でクラスを終わらせ、
落とします
（`:::c\u2028`）。
[test: kanban: comment-ls-split-count]
[test: kanban: div-between-real-comments-ls-node]
[test: kanban: div-between-real-comments-ps-node]
[test: kanban: div-header-comment-ls-node]
[test: kanban: div-header-comment-ps-node]
[test: kanban: lex-icon-comment-ls]
[test: kanban: db-metadata-comment-ls]
[test: kanban: shape-comment-ps]
[test: kanban: common-comment-ps-swallows-suffix]
[test: kanban: class-separator-empty-tail]
[test: kanban: comment-ls-then-item-on-semicolon-line]
[test: kanban: semicolon-line-comment-ps-then-directive-line]
[test: kanban: semicolon-line-comment-ls-then-empty-line]
[test: kanban: semicolon-line-two-comments-then-item]
[test: kanban: semicolon-line-comment-ls-then-semicolon-node]
[test: kanban: semicolon-line-empty-data-then-comment-ls]
[test: kanban: semicolon-line-icon-comment-ls-then-item]
[test: kanban: semicolon-line-comment-ls-between-items]
[test: kanban: comment-ps-then-section-on-semicolon-line]
[test: kanban: semicolon-in-a-comment-with-text-after-it]

### セミコロン

kanban のボードでは、`;` はテキストの文字で、文を区切る `;` はありません。
`S;T` は id `S;T` の 1 つのノードで、`A["x;y"]` のラベルには `;` があり、
`;` だけの行もノードで、`:::c;d` のクラスにも `;` があります。
印字は、mermaid.js の行の規則が無視する `;` も含め、すべての `;` を残します
（[行の規則と保つ行](#行の規則と保つ行)を参照）。
落としたり、そこで行を分けたりすると、書かれたテキストか、その読みが変わります。
形のすぐ後の `;` は形の一部でなく、拒否されます（`S[x];`）。
[fixture: semicolons/values]
[fixture: semicolons/semicolon-remove]

入力
([semicolons/values-input.mmd](../tests/fixtures/kanban/semicolons/values-input.mmd)):

```mmd
kanban
 S;T
   A["x;y"]
   ;
   :::c;d
```

出力
([semicolons/values-output.mmd](../tests/fixtures/kanban/semicolons/values-output.mmd)):

```mmd
kanban
  S;T
    A["x;y"]
    ;
    :::c;d
```

### キーワードの大文字小文字

ボードは小文字の `kanban` で検出されます。
`KANBAN` は拒否されます
（[整形しない場合](../README.ja.md#整形しない場合)を参照）。
アイコンのマーカーはどの大文字小文字でも読まれ、
印字は書かれた大文字小文字を残します
（`::ICON(x)`、`::Icon(y)`）。
ほかの図種で文になる単語、`title`、`accTitle`、`accDescr`、`style`、`classDef`、
`columns`、`space`、`end` と、C4 の単語（`C4Container`）は、
ここでは普通のノードのテキストで、書かれたまま印字します。
大文字小文字は何も変えません
（[mindmap](./mindmap.ja.md#キーワードの大文字小文字)も同じです）。
[fixture: keyword-case/icon-case]
[fixture: keyword-case/case-lower-icon]
[fixture: keyword-case/lower-case-header]
[fixture: keyword-case/keywords-ordinary]
[fixture: keyword-case/lex-c4-c4container-id]

入力
([keyword-case/icon-case-input.mmd](../tests/fixtures/kanban/keyword-case/icon-case-input.mmd)):

```mmd
kanban
 S
   A
 ::ICON(x)
 ::Icon(y)
```

出力
([keyword-case/icon-case-output.mmd](../tests/fixtures/kanban/keyword-case/icon-case-output.mmd)):

```mmd
kanban
  S
    A
    ::ICON(x)
    ::Icon(y)
```

### フロントマターの YAML

`---` の行の間の YAML は Prettier の YAML 整形で整形し、
`---` の行は書かれたまま残します。
ほかの図種と同じです
（[フロントマター](./compatibility.ja.md#フロントマター)を参照）。
正しい YAML でないフロントマター、`---` の行が字下げされたもの、
HTML タグを始めうる `<` を含むもの、
整形した YAML が `---` の行を含むことになるものは、
書かれたまま残します。
閉じの `---` の後の空白も残します。
フロントマターとヘッダーの間のコメントやディレクティブは残し、
その後のボードは通常どおり整形します。
整形してよいのはフロントマターだけで、データブロックは書かれたまま残します
（[データブロック](#データブロック)を参照）。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/frontmatter-malformed]
[fixture: frontmatter-yaml/frontmatter-indented-kept]
[fixture: frontmatter-yaml/frontmatter-html-tag-kept]
[fixture: frontmatter-yaml/delimiter-line-kept]
[test: kanban: closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/comment-and-directive]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/kanban/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:    T
config: {kanban: {ticketBaseUrl: "https://example.com/#TICKET#"}}
---
kanban
 S
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/kanban/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { kanban: { ticketBaseUrl: "https://example.com/#TICKET#" } }
---
kanban
  S
```

### 複数行の値

ラベル、アイコン、データブロックは複数行にわたってよく、
その中の改行と空白は Db に入ります
（`A["x`、改行、` y"]` のラベルは改行と空白を持ちます）。
印字は、そのような値のどの行も、続きの行の桁、中のコメント行やディレクティブ、
中の空行も含め、
書かれたまま残します。
飾りでそろえるのは最初の行だけです
（[アイコンとクラス](#アイコンとクラス)を参照）。
行をつなぐことはしません。
値の中の改行はその文字で、つなぐと Db が変わるか、別のノードになるからです。
[fixture: multi-line-values/labels-and-icon]
[fixture: multi-line-values/multiline-join]
[fixture: multi-line-values/multiline-icon-trim-unsafe]
[fixture: multi-line-values/lex-label-empty-line]
[fixture: multi-line-values/lex-label-directive-line]
[fixture: multi-line-values/lex-metadata-blank-line]

`printWidth` は効きません。
長い裸のノード（`This is a deliberately long kanban item ...`）も、
長いラベルも、その行に残します。
裸のノードを折り返すと別のノードになり、値はテキストだからです。
[fixture: multi-line-values/long-line-kept]
[fixture: multi-line-values/small-print-width]

入力
([multi-line-values/labels-and-icon-input.mmd](../tests/fixtures/kanban/multi-line-values/labels-and-icon-input.mmd)):

```mmd
kanban
 S
   A[x
 y]
   B["p
 q"]
   C["`r
 s`"]
 ::icon(fa
  fa-star)
```

出力
([multi-line-values/labels-and-icon-output.mmd](../tests/fixtures/kanban/multi-line-values/labels-and-icon-output.mmd)):

```mmd
kanban
  S
    A[x
 y]
    B["p
 q"]
    C["`r
 s`"]
    ::icon(fa
  fa-star)
```

### 末尾の改行

出力は、最後の行の後に、`endOfLine` オプションの改行 1 つで終わります。
最後の改行のない `kanban`、改行、` S` は、`  S` と改行を出力します。
空のボードは `kanban` と改行です。
最後の裸の id の末尾の空白は id の一部なので残ります
（`S   ` は空白つきで印字し、その後に改行が来ます）。
閉じていないディレクティブがテキストの終わりまで届くときは、残りを取るので、
印字はその後ろに何も足しません。
Markdown では、コードフェンスやリスト項目の字下げはホストの字下げで、
ボードの字下げには入りません。
[fixture: final-newline/accepted]
[fixture: final-newline/no-final-lf]
[fixture: final-newline/empty-board]
[fixture: final-newline/open-directive-at-eof]

入力
([final-newline/empty-board-input.mmd](../tests/fixtures/kanban/final-newline/empty-board-input.mmd)):

```mmd
kanban
```

出力
([final-newline/empty-board-output.mmd](../tests/fixtures/kanban/final-newline/empty-board-output.mmd)):

```mmd
kanban
```

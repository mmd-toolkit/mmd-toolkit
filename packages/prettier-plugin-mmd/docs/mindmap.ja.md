# mindmap の整形規則

英語版: [mindmap.md](./mindmap.md)

prettier-plugin-mmd が mindmap をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
他の図種と同じ規則はそう書きます。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

mindmap では、ノードの字下げがそのまま Db の level です。
Db は、ノードの level を、
そのノードの字下げから根の字下げを引いた文字数として読みます。
そのため、ノードとその子の間の段の幅は図の一部です
（diagrams/mindmap.md、Indentation and parents）。
段の幅が 4 文字の図と 2 文字の図は Db が違い、
1 つの図の中で段の幅が違ってもかまいません。
印字は、どの段の幅も書かれたまま残し、
以下の規則は Db に入らないものだけを変えます。
[fixture: indentation/step-widths-kept]
[fixture: indentation/tree-from-the-indentation]
[fixture: indentation/siblings-after-deeper-nodes]

根の字下げは Db に入りません。
根は、どの図種の文とも同じく、ヘッダーより 1 段深く置きます。
ほかのノードは、根より書かれた文字数だけ深く置くので、level は変わりません。
それ以上に、入力に書かれた字下げは残しません。
[fixture: indentation/root-shifted-to-one-level]
[fixture: indentation/root-at-the-first-column]
[fixture: indentation/written-indentation-dropped]
1 段は Prettier の `useTabs` と `tabWidth` の指定どおりで、既定は空白 2 つです。
[fixture: indentation/tab-width-4]

ノードの前の空白文字は、タブ、U+00A0、U+3000 も含め、どれも字下げの 1 文字で、
数だけが意味を持ちます。
印字は、字下げの文字をオプションの文字（空白、`useTabs` ならタブ）にし、
文字数は変えません。
`useTabs` では、n 文字の段の幅は n 個のタブになります。
[fixture: indentation/use-tabs]
[fixture: indentation/characters-replaced]

入力
([indentation/step-widths-kept-input.mmd](../tests/fixtures/mindmap/indentation/step-widths-kept-input.mmd)):

```mmd
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
```

出力
([indentation/step-widths-kept-output.mmd](../tests/fixtures/mindmap/indentation/step-widths-kept-output.mmd)):

```mmd
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
```

入力
([indentation/root-shifted-to-one-level-input.mmd](../tests/fixtures/mindmap/indentation/root-shifted-to-one-level-input.mmd)):

```mmd
mindmap
      root((mindmap))
          Origins
             Long history
          Research
```

出力
([indentation/root-shifted-to-one-level-output.mmd](../tests/fixtures/mindmap/indentation/root-shifted-to-one-level-output.mmd)):

```mmd
mindmap
  root((mindmap))
      Origins
         Long history
      Research
```

入力
([indentation/tab-width-4-input.mmd](../tests/fixtures/mindmap/indentation/tab-width-4-input.mmd)):

```mmd
mindmap
  root
    a
      b
```

出力
([indentation/tab-width-4-output.mmd](../tests/fixtures/mindmap/indentation/tab-width-4-output.mmd)):

```mmd
mindmap
    root
      a
        b
```

### ヘッダーの行の根

最初のノードである根は、ヘッダーと同じ行に書けます。
その字下げは、ヘッダーの後ろの空白の文字数で、`mindmap((x))` では 0 です。
根は自分の行に、ヘッダーより 1 段深く置き、
その下のノードは根からの段の幅を保ちます
（[インデント](#インデント)を参照）。
Db は同じです。
[fixture: root-on-header-line/moved-to-its-own-line]
[fixture: root-on-header-line/shape-glued-to-the-header]
[fixture: root-on-header-line/text-after-spaces]
[fixture: root-on-header-line/after-a-tab]
根のテキストの後ろの `%%` は、コメントではなくテキストの一部です。
[fixture: root-on-header-line/text-with-percent]

入力
([root-on-header-line/moved-to-its-own-line-input.mmd](../tests/fixtures/mindmap/root-on-header-line/moved-to-its-own-line-input.mmd)):

```mmd
mindmap root((x))
   a
```

出力
([root-on-header-line/moved-to-its-own-line-output.mmd](../tests/fixtures/mindmap/root-on-header-line/moved-to-its-own-line-output.mmd)):

```mmd
mindmap
  root((x))
    a
```

入力
([root-on-header-line/shape-glued-to-the-header-input.mmd](../tests/fixtures/mindmap/root-on-header-line/shape-glued-to-the-header-input.mmd)):

```mmd
mindmap((x))
 a
```

出力
([root-on-header-line/shape-glued-to-the-header-output.mmd](../tests/fixtures/mindmap/root-on-header-line/shape-glued-to-the-header-output.mmd)):

```mmd
mindmap
  ((x))
   a
```

### 飾り行

icon の行と class の行は、直前に書かれたノードを飾ります。
字下げによらないので、字下げは Db に入りません。
飾る先のノードと同じ列に置きます。
mermaid.js の文書の例の書き方と同じです。
[fixture: decorations/at-the-column-of-the-node]
[fixture: decorations/before-and-after-children]
2 つ目の class の行（icon の行も同じ）は Db では最初のものに置き換わりますが、
どちらも書かれたまま残します。
[fixture: decorations/second-class-kept]

icon と class のテキストは、両端と中の空白を Db が持つので残します。
icon の閉じ括弧の後ろの空白は Db に入らないので落とします。
[fixture: decorations/whitespace-in-icon-and-class-kept]
[fixture: decorations/trailing-whitespace-after-icon-dropped]

入力
([decorations/at-the-column-of-the-node-input.mmd](../tests/fixtures/mindmap/decorations/at-the-column-of-the-node-input.mmd)):

```mmd
mindmap
  root
      a
  ::icon(fa fa-book)
          :::big
      b
```

出力
([decorations/at-the-column-of-the-node-output.mmd](../tests/fixtures/mindmap/decorations/at-the-column-of-the-node-output.mmd)):

```mmd
mindmap
  root
      a
      ::icon(fa fa-book)
      :::big
      b
```

入力
([decorations/before-and-after-children-input.mmd](../tests/fixtures/mindmap/decorations/before-and-after-children-input.mmd)):

```mmd
mindmap
  root
  ::icon(x)
    a
      b
    ::icon(y)
  :::c
```

出力
([decorations/before-and-after-children-output.mmd](../tests/fixtures/mindmap/decorations/before-and-after-children-output.mmd)):

```mmd
mindmap
  root
  ::icon(x)
    a
      b
      ::icon(y)
      :::c
```

### ノードのテキスト

ノードのテキストは、末尾の空白を id の一部として Db が持つので残します。
`root` の後ろに空白 3 つがあれば、ノードは `root   ` で、
`a (x)` の id は `a ` なので、形の前の空白も残ります。
[fixture: node-text/trailing-whitespace-kept]
[fixture: node-text/space-before-a-shape-kept]
ノードのテキストは、`]`、`:`、`#`、`"`、`%%`、`:::` を文字として含み、
単独の `%` で始まる行はコメントではなくノードのテキストです。
[fixture: node-text/special-characters]
[fixture: node-text/percent-in-text]
[fixture: node-text/keywords-in-text]

入力
([node-text/special-characters-input.mmd](../tests/fixtures/mindmap/node-text/special-characters-input.mmd)):

```mmd
mindmap
  root
    a: b # c
    a]b
    a:::b
    ::x
    -x
```

出力
([node-text/special-characters-output.mmd](../tests/fixtures/mindmap/node-text/special-characters-output.mmd)):

```mmd
mindmap
  root
    a: b # c
    a]b
    a:::b
    ::x
    -x
```

入力
([node-text/space-before-a-shape-kept-input.mmd](../tests/fixtures/mindmap/node-text/space-before-a-shape-kept-input.mmd)):

```mmd
mindmap
  root
    a (x)
    b  [y]
```

出力
([node-text/space-before-a-shape-kept-output.mmd](../tests/fixtures/mindmap/node-text/space-before-a-shape-kept-output.mmd)):

```mmd
mindmap
  root
    a (x)
    b  [y]
```

### 形

形の開きと閉じは、書かれたまま印字します。
閉じは開きに合わなくてよく、`[text)` は rectangle、`((x)` は circle です。
合う閉じに直すと、作者が書いたテキストを書き換えることになります。
[fixture: shapes/openers-and-closers-kept]
[fixture: shapes/mismatched-closers-kept]
形はノードのテキストなしに単独でも書けます。
[fixture: shapes/shape-alone]

形のテキストは、空白を Db が持つので残します。
文字列は開きの直後だけが文字列で、
`a[ "x" ]` のテキストは引用符を含む `"x"` です。
`a["x"]` と `a[x]` のテキストは同じですが、どちらも書き換えません。
[fixture: shapes/inner-whitespace-kept]
[fixture: shapes/text-and-string-forms]
[fixture: shapes/markdown-string]
形の後ろの空白は Db に入らないので落とします。
[fixture: shapes/trailing-whitespace-dropped]

入力
([shapes/mismatched-closers-kept-input.mmd](../tests/fixtures/mindmap/shapes/mismatched-closers-kept-input.mmd)):

```mmd
mindmap
  root((x)
    a[y)
    b(z]
    c)w(
```

出力
([shapes/mismatched-closers-kept-output.mmd](../tests/fixtures/mindmap/shapes/mismatched-closers-kept-output.mmd)):

```mmd
mindmap
  root((x)
    a[y)
    b(z]
    c)w(
```

入力
([shapes/text-and-string-forms-input.mmd](../tests/fixtures/mindmap/shapes/text-and-string-forms-input.mmd)):

```mmd
mindmap
  root
    a[x y]
    b["x y"]
    c[ "x" ]
    d["x"]
```

出力
([shapes/text-and-string-forms-output.mmd](../tests/fixtures/mindmap/shapes/text-and-string-forms-output.mmd)):

```mmd
mindmap
  root
    a[x y]
    b["x y"]
    c[ "x" ]
    d["x"]
```

### 複数行のテキスト

形のテキスト、文字列、markdown 文字列、icon は、複数行にまたがれます。
後の行の行頭の空白は字下げではなくテキストの一部なので、
行は書かれたまま印字します。
その下のノードは、上の規則のとおり段の幅を保ちます。
[fixture: multi-line-texts/shape-text]
[fixture: multi-line-texts/string]
[fixture: multi-line-texts/markdown-string]
[fixture: multi-line-texts/icon]
[fixture: multi-line-texts/rest-of-the-tree-shifted]

入力
([multi-line-texts/shape-text-input.mmd](../tests/fixtures/mindmap/multi-line-texts/shape-text-input.mmd)):

```mmd
mindmap
  root
    a[x
 y]
    b
```

出力
([multi-line-texts/shape-text-output.mmd](../tests/fixtures/mindmap/multi-line-texts/shape-text-output.mmd)):

```mmd
mindmap
  root
    a[x
 y]
    b
```

入力
([multi-line-texts/rest-of-the-tree-shifted-input.mmd](../tests/fixtures/mindmap/multi-line-texts/rest-of-the-tree-shifted-input.mmd)):

```mmd
mindmap
      root[x
  y]
          a[p
   q]
```

出力
([multi-line-texts/rest-of-the-tree-shifted-output.mmd](../tests/fixtures/mindmap/multi-line-texts/rest-of-the-tree-shifted-output.mmd)):

```mmd
mindmap
  root[x
  y]
      a[p
   q]
```

### 空行

空行、コメント行、診断コメントは、
ヘッダーの後のどこにあっても Db に影響しません。
連続する空行は 1 つにし、本体の先頭と末尾の空行は落とします。
[fixture: blank-lines/collapsed]
[fixture: blank-lines/body-edges-dropped]
[fixture: blank-lines/before-a-comment]
[fixture: blank-lines/around-comment-lines-and-directives]

仕様は受理しても mermaid.js が拒否する入力があります。
mermaid.js の字句解析器は、診断コメントを前の空白と一緒に読むからです
（既知の差異 `blank-line-after-header-or-comments`）。
ヘッダーの後の空行と、差異が挙げる場所の診断コメントの後の空行がそうです。
印字は、2 つ目の種類を直しません。
ヘッダーの後の空行は、ヘッダーの行末の空白と同じく落とすので、
出力は mermaid.js に受理されます。
[fixture: blank-lines/after-the-header-dropped]
[fixture: blank-lines/header-trailing-whitespace-dropped]
[fixture: blank-lines/whitespace-line-dropped-at-the-start]
ノードの間の診断コメントの後や、ヘッダーの後のコメントの後の空行は、
1 つに畳んで残します。
mermaid.js は、入力を拒否したのと同じく、出力も拒否します。
[fixture: blank-lines/after-two-comments-after-the-header]
[fixture: blank-lines/after-a-comment-between-nodes-kept]
[fixture: blank-lines/after-a-comment-between-nodes-collapsed]
[fixture: blank-lines/after-a-trailing-comment-kept]
mermaid.js が空行を受理する形では、出力も受理します。
[fixture: blank-lines/after-one-comment-after-the-header]
[fixture: blank-lines/after-two-comments-between-nodes]

入力
([blank-lines/collapsed-input.mmd](../tests/fixtures/mindmap/blank-lines/collapsed-input.mmd)):

```mmd
mindmap
  root


    a



    b
```

出力
([blank-lines/collapsed-output.mmd](../tests/fixtures/mindmap/blank-lines/collapsed-output.mmd)):

```mmd
mindmap
  root

    a

    b
```

入力
([blank-lines/after-the-header-dropped-input.mmd](../tests/fixtures/mindmap/blank-lines/after-the-header-dropped-input.mmd)):

```mmd
mindmap

  root
    a
```

出力
([blank-lines/after-the-header-dropped-output.mmd](../tests/fixtures/mindmap/blank-lines/after-the-header-dropped-output.mmd)):

```mmd
mindmap
  root
    a
```

入力
([blank-lines/after-a-comment-between-nodes-kept-input.mmd](../tests/fixtures/mindmap/blank-lines/after-a-comment-between-nodes-kept-input.mmd)):

```mmd
mindmap
  root
    a
%%

    b
```

出力
([blank-lines/after-a-comment-between-nodes-kept-output.mmd](../tests/fixtures/mindmap/blank-lines/after-a-comment-between-nodes-kept-output.mmd)):

```mmd
mindmap
  root
    a
    %%

    b
```

### コメント

コメント行、`%%` だけの行、`%%{ }%%` の行は、後ろの行と同じ段に置き、
本体の末尾では最後の行と同じ段に置きます。
字下げは Db に入らず、mermaid.js の受理にも影響しません。
`%%{` の行に特別な字下げは要りません。
テキストと印は書かれたまま残します。
[fixture: comments/lines-at-the-level-of-the-next-line]
[fixture: comments/at-the-end]
[fixture: comments/bare-and-brace-lines]
[fixture: comments/only-comments]
ヘッダーの前のコメント行は 1 桁目に置きます。
[fixture: comments/before-the-header]

ヘッダー、形、icon の後ろのコメントは、その行に書かれたまま残します。
空白が書かれていれば空白 1 つを置き、接していれば接したままにします。
[fixture: comments/after-the-header]
[fixture: comments/after-the-header-touching]
[fixture: comments/after-a-shape]
[fixture: comments/after-an-icon]
ノードのテキストの後ろと class の中の `%%` は、テキストの文字です。
[fixture: comments/in-text-is-text]
[fixture: comments/single-percent-is-text]

入力
([comments/lines-at-the-level-of-the-next-line-input.mmd](../tests/fixtures/mindmap/comments/lines-at-the-level-of-the-next-line-input.mmd)):

```mmd
mindmap
%% c1
  root
          %% c2
    a
 %% c3
      ::icon(x)
```

出力
([comments/lines-at-the-level-of-the-next-line-output.mmd](../tests/fixtures/mindmap/comments/lines-at-the-level-of-the-next-line-output.mmd)):

```mmd
mindmap
  %% c1
  root
    %% c2
    a
    %% c3
    ::icon(x)
```

入力
([comments/after-a-shape-input.mmd](../tests/fixtures/mindmap/comments/after-a-shape-input.mmd)):

```mmd
mindmap
  root
    a[x] %% c
    b[y]%% d
    c((z))   %%  e
```

出力
([comments/after-a-shape-output.mmd](../tests/fixtures/mindmap/comments/after-a-shape-output.mmd)):

```mmd
mindmap
  root
    a[x] %% c
    b[y]%% d
    c((z)) %%  e
```

### ディレクティブ

単独の行のディレクティブは、後ろの行と同じ段に置きます。
ノードの行にあるディレクティブは、両側に空白が書かれているかを残します。
あれば空白 1 つを置き、接していれば接したままにします。
[fixture: directives/kept]
[fixture: directives/between-nodes]
[fixture: directives/before-the-header]
[fixture: directives/after-the-header-on-the-same-line]
[fixture: directives/after-the-header-touching]
[fixture: directives/after-a-shape]

2 つの単位の間のディレクティブは、その場に残します。
テキストの中のディレクティブは、テキストの一部です。
[fixture: directives/between-units]
[fixture: directives/inside-a-text]
閉じられていないディレクティブはテキストの残りを取り、書かれたまま残します。
[fixture: directives/unclosed]
[fixture: directives/unclosed-after-a-node]

行頭のディレクティブの後ろの空白は、ノードの字下げの数に入ります。
Db は字下げを、ディレクティブを除いたテキストで読むからです。
そのような行は、ディレクティブから書かれたまま印字し、
ディレクティブの前の空白は、
その段の幅に必要な字下げの文字数になるよう印字が決めます。
[fixture: directives/before-a-node-on-its-line]
[fixture: directives/before-a-node-after-spaces]
[fixture: directives/before-the-root]

入力
([directives/between-nodes-input.mmd](../tests/fixtures/mindmap/directives/between-nodes-input.mmd)):

```mmd
mindmap
  root
      %%{wrap}%%
    a
          %%{init: {}}%%
    b
```

出力
([directives/between-nodes-output.mmd](../tests/fixtures/mindmap/directives/between-nodes-output.mmd)):

```mmd
mindmap
  root
    %%{wrap}%%
    a
    %%{init: {}}%%
    b
```

入力
([directives/before-a-node-on-its-line-input.mmd](../tests/fixtures/mindmap/directives/before-a-node-on-its-line-input.mmd)):

```mmd
mindmap
root
 %%{init: {}}%% a
```

出力
([directives/before-a-node-on-its-line-output.mmd](../tests/fixtures/mindmap/directives/before-a-node-on-its-line-output.mmd)):

```mmd
mindmap
  root
   %%{init: {}}%% a
```

### キーワードの大文字小文字

キーワードは、書かれた大文字小文字のまま残します。
mermaid.js は `::icon(` をどの大文字小文字でも読み、Db は同じです。
ヘッダーは小文字でだけ検出されます。
[fixture: keyword-case/icon-keyword]

入力
([keyword-case/icon-keyword-input.mmd](../tests/fixtures/mindmap/keyword-case/icon-keyword-input.mmd)):

```mmd
mindmap
  root
  ::ICON(x)
  ::Icon(y)
```

出力
([keyword-case/icon-keyword-output.mmd](../tests/fixtures/mindmap/keyword-case/icon-keyword-output.mmd)):

```mmd
mindmap
  root
  ::ICON(x)
  ::Icon(y)
```

### フロントマターの YAML

フローチャートと同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整形し、
`---` の行は、行末の空白とタブも含め、書かれたまま残します。
[fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
Prettier が YAML を読めないときは、書かれたまま残します。
[fixture: frontmatter-yaml/malformed-kept]
フロントマターとヘッダーの間のコメント行は残します。
[fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/mindmap/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    theme:   dark
---
mindmap
  root
```

出力
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/mindmap/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  theme: dark
---
mindmap
  root
```

### 行区切り文字

mindmap の診断コメントは U+2028 か U+2029 で終わり、その後ろのテキストは、
この文字から字下げが始まる新しい行です。
そのため印字は、そこに改行を書き、その後ろの行には、
区切り文字を 1 文字と数えて Db が読む字下げを付けます。
ノードのテキスト、形のテキスト、icon の中では、これらは文字で、
そのまま残します。
例は文字列で書かれていて、`\u2028` は U+2028、`\n` は改行です。
[test: U+2028 after a comment on the header line]
[test: U+2028 after a comment after a shape]
[test: U+2028 after a comment after an icon]
[test: U+2028 after a bare comment between nodes]
[test: U+2028 inside a node text]
[test: U+2029 inside a shape text]
[test: U+2028 inside an icon]
[test: U+2028 after the header]

### 空白の文字

U+00A0、U+3000、U+FEFF は、字句解析器にとって空白です。
ノードの前では、どれも字下げの 1 文字で、
印字は、その場所にオプションの字下げ文字を置き、文字数は保ちます。
形の後ろでは落とし、コメントの前では空白 1 つにします。
ノードのテキストと形のテキストの中では、テキストの文字なので残します。
例は文字列で書かれていて、`\u00a0` は U+00A0、`\u3000` は U+3000、
`\ufeff` は U+FEFF です。
[test: U+00A0 in the indentation]
[test: U+3000 in the indentation]
[test: U+FEFF in the indentation]
[test: U+00A0 after the header]
[test: U+00A0 inside a node text]
[test: U+00A0 inside a shape text]
[test: U+00A0 and U+3000 after a shape]
[test: U+00A0 before a comment after a shape]

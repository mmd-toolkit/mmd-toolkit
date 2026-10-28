# sankey の整形規則

英語版: [sankey.md](./sankey.md)

prettier-plugin-mmd が sankey 図をどう整形するかを説明します。
以下の各規則は、mermaid.js が図から読むものを保ちます。
整形によって図の解釈が変わる箇所は、入力をそのまま残します。
各項目でその条件を説明します。
sankey は CSV の形の記録の並びなので規則は少なく、その規則も狭いものです。
mermaid.js は、タブ、ASCII 外の文字、引用符の隣の空白を拒否します。

各規則では、整形前のテキストと、プラグインが出力するテキストを、例で示します。
例はテストが確かめる fixture で、各例の上のリンクはそのファイルへのものです。
fixture の置き方と確かめ方は、
[文書と fixture](./development.ja.md#文書と-fixture)にあります。

## 規則

### インデント

ヘッダー、記録、コメント行、指令の行は、
`useTabs` と `tabWidth` の指定に関わらず、すべて 1 列目に置きます。
sankey は CSV の形の記録の並びで、その行のうち 2 種類は字下げできません。
mermaid.js は引用符の前の空白を拒否するので、
文字列で始まる記録は字下げできません。
指令だけの行は、指令を取り除くと空白だけの行になり、
それはコンマのない欄として拒否されます（diagrams/sankey.md、
Characters と Diagram and records）。
タブはどこでも拒否されるので、ほかの行をタブで字下げすることもできません。
すべての行を 1 列目にすれば、
列が混ざりません。 [fixture: indentation/header-and-records-at-the-first-column]
[fixture: indentation/quoted-first-record-at-the-first-column]
[fixture: indentation/written-indentation-dropped]
[fixture: indentation/tab-width-4]
[fixture: indentation/use-tabs]

コメント行の字下げは Db に入らないので残すこともできますが、それも落として、
すべての行を 1 列目にそろえます。
指令の行はどの場合も 1 列目です。 [fixture: indentation/comment-lines-at-the-first-column]
[fixture: indentation/directive-lines-at-the-first-column]

入力 ([indentation/header-and-records-at-the-first-column-input.mmd](../tests/fixtures/sankey/indentation/header-and-records-at-the-first-column-input.mmd)):

```mmd
  sankey-beta
   a,b,1
  c,d,2
```

出力 ([indentation/header-and-records-at-the-first-column-output.mmd](../tests/fixtures/sankey/indentation/header-and-records-at-the-first-column-output.mmd)):

```mmd
sankey-beta
a,b,1
c,d,2
```

入力 ([indentation/quoted-first-record-at-the-first-column-input.mmd](../tests/fixtures/sankey/indentation/quoted-first-record-at-the-first-column-input.mmd)):

```mmd
sankey
"a",b,1
   c,d,2
```

出力 ([indentation/quoted-first-record-at-the-first-column-output.mmd](../tests/fixtures/sankey/indentation/quoted-first-record-at-the-first-column-output.mmd)):

```mmd
sankey
"a",b,1
c,d,2
```

### コンマ

引用符のない欄は、両端の空白を除いて読まれます。
そのため、コンマの周りの空白をどこに置いても Db は同じです（行の規則が読む行の、
`:` と後の `#` の間を除く）。
コンマは両側の欄に接し、周りの空白は落とします。
それを選ぶ理由は Db にはありません。
mermaid.js は引用符の隣の空白を拒否するので、
文字列の前には空白を置けません（`a, "b",1` は拒否されます）。
コンマの後に空白を置く規則にすると、1 つの記録の中で、
引用符のない欄の前には空白があり、文字列の前にはない、
という 2 つの形が混ざります。
コンマが接する形なら規則は 1 つで、mermaid.js の文書の例と同じです。
欄の中の空白は残します。 [fixture: commas/spaces-around-commas-dropped]
[fixture: commas/space-after-comma-dropped]
[fixture: commas/spaces-inside-fields-kept]
コンマの隣の指令は、
隣に空白が書かれていれば空白 1 つを残し（[指令](#指令)を参照）、
空白だけの欄は空白 1 つにするので、2 つが並ぶことがあります。
`a,   %%{init: {}}%%,1` は `a,  %%{init: {}}%%,1` になり、
空白は 2 つです。 [fixture: directives/next-to-commas]
mermaid.js は引用符の隣の空白を拒否するので、文字列はコンマに接します。
文字列の後のコンマの後の空白は、次の欄の空白として読まれるので、
落とします。 [fixture: commas/quoted-fields-touch-commas]

空白だけの欄は、テキストが空の欄です。
空の欄は拒否されるので、空白 1 つにして印字します。
空白の数は Db に入らず、1 つが欄を保つ最小だからです。
空白だけの値が別の記録の前にあるときは、
その空白で行が終わります。 [fixture: commas/spaces-only-field-is-one-space]
[fixture: commas/spaces-only-value-before-another-record]
[fixture: commas/spaces-only-value-then-comment-line]
[fixture: blank-lines/after-a-value-of-spaces-only]
記録の末尾の空白は落とします。 [fixture: commas/trailing-whitespace-dropped]

`;` は欄の文字です。
mermaid.js の行の規則は、`style` か `classDef` と、その後ろの `:`、
さらに後ろの `#`、その後ろの `;` を含む行で、
`:` と `#` の間に空白がないときだけ、行の最後の `;` を無視します。
そのため、そのような行の `:` とその後の `#` の間の空白は、
コンマの周りにあっても、あるかないかを保ち、あるところは空白 1 つにします。
規則が問うのは空白があるかどうかで、いくつあるかではないからです。
行のそれ以外の空白は、
どの `;` が無視されるかを変えません。 [fixture: commas/semicolon-fields]
[fixture: commas/style-line]
[fixture: commas/style-line-in-another-field]
[fixture: commas/style-line-colon-and-hash-in-two-fields-kept]
[fixture: commas/style-line-colon-and-hash-touching-kept]
[fixture: commas/style-line-spaces-between-colon-and-hash-become-one]
行の最後の `;` を規則が無視しているときは、その `;` を残します。
落とすと行の最後の `;` が別の `;` になり、
`style:#x,b;c,1;` の右は `b;c` ですが、
`style:#x,b;c,1` の右は `bc` だからです。 [fixture: commas/ignored-semicolon-at-the-end-kept]
`;` を落とすと行の終わりが変わる行は、コンマの周りの空白も含めて、
書かれたまま印字します。
別の `;` に接する無視される `;` がそうです。 [fixture: commas/semicolon-ends-the-line-kept]

入力 ([commas/spaces-around-commas-dropped-input.mmd](../tests/fixtures/sankey/commas/spaces-around-commas-dropped-input.mmd)):

```mmd
sankey
a , b , 1
c  ,  d  ,  2
```

出力 ([commas/spaces-around-commas-dropped-output.mmd](../tests/fixtures/sankey/commas/spaces-around-commas-dropped-output.mmd)):

```mmd
sankey
a,b,1
c,d,2
```

入力 ([commas/quoted-fields-touch-commas-input.mmd](../tests/fixtures/sankey/commas/quoted-fields-touch-commas-input.mmd)):

```mmd
sankey
"a", b,"1"
a,"b",  1
```

出力 ([commas/quoted-fields-touch-commas-output.mmd](../tests/fixtures/sankey/commas/quoted-fields-touch-commas-output.mmd)):

```mmd
sankey
"a",b,"1"
a,"b",1
```

入力 ([commas/style-line-input.mmd](../tests/fixtures/sankey/commas/style-line-input.mmd)):

```mmd
sankey
style:#x;y , b , 1
```

出力 ([commas/style-line-output.mmd](../tests/fixtures/sankey/commas/style-line-output.mmd)):

```mmd
sankey
style:#x;y,b,1
```

### 引用符

欄の引用符は、書かれたまま印字します。
`"a"` と `a`、`" a"` と `a` は Db で同じ id ですが、作者が書いたテキストです。
文字列には、引用符のない欄に書けないコンマや二重の引用符を書けます。
引用符の間のテキストは値で、空白も残します。 [fixture: quotes/quotes-kept]
[fixture: quotes/unneeded-quotes-kept]
[fixture: quotes/comma-and-doubled-quotes-kept]
[fixture: quotes/spaces-inside-quotes-kept]

入力 ([quotes/comma-and-doubled-quotes-kept-input.mmd](../tests/fixtures/sankey/quotes/comma-and-doubled-quotes-kept-input.mmd)):

```mmd
sankey
Pumped heat  ,"Heating and cooling, ""homes""",   193.026
```

出力 ([quotes/comma-and-doubled-quotes-kept-output.mmd](../tests/fixtures/sankey/quotes/comma-and-doubled-quotes-kept-output.mmd)):

```mmd
sankey
Pumped heat,"Heating and cooling, ""homes""",193.026
```

### 値

リンクの値は、書かれたまま印字します。
mermaid.js は値を数として読むので、`1.0`、`1e0`、`+1`、`.5` は `1` と同じ値で、
`abc` も受理されますが、どれも書き換えません。
綴りは作者のもので、どの綴りでも Db は同じだからです。
値の後ろの `%%` や `#` は、コメントではなく欄の文字で、
欄と一緒に残します。 [fixture: values/value-forms-kept]
[fixture: values/text-after-the-value-kept]

入力 ([values/text-after-the-value-kept-input.mmd](../tests/fixtures/sankey/values/text-after-the-value-kept-input.mmd)):

```mmd
sankey
a,b,1 %% c
d,e,2 # f
```

出力 ([values/text-after-the-value-kept-output.mmd](../tests/fixtures/sankey/values/text-after-the-value-kept-output.mmd)):

```mmd
sankey
a,b,1 %% c
d,e,2 # f
```

### 複数行の文字列

文字列は複数行にわたることがあります。
その行は文字列の一部で、後ろの行の行頭の空白は値の一部です。
中の空行やコメント行も、書かれたまま印字します。
文字列は整形しない 1 つの塊です。
周りの欄は、
ほかと同じに整えます。 [fixture: multi-line-strings/string-over-lines]
[fixture: multi-line-strings/empty-line-in-string]
[fixture: multi-line-strings/comment-line-in-string]
[fixture: multi-line-strings/comma-and-fields-after-the-string]
[fixture: multi-line-strings/second-field-string-over-lines]
[fixture: multi-line-strings/directive-line-in-string]
[fixture: multi-line-strings/style-line-after-a-string]

入力 ([multi-line-strings/string-over-lines-input.mmd](../tests/fixtures/sankey/multi-line-strings/string-over-lines-input.mmd)):

```mmd
sankey
"a
  b",c,1
d , e , 2
```

出力 ([multi-line-strings/string-over-lines-output.mmd](../tests/fixtures/sankey/multi-line-strings/string-over-lines-output.mmd)):

```mmd
sankey
"a
  b",c,1
d,e,2
```

### 空行

連続する空行は 1 つにし、本体の先頭と末尾の空行は落とします。
ヘッダーの直後も同じです。 [fixture: blank-lines/collapsed]
[fixture: blank-lines/after-the-header-dropped]
[fixture: blank-lines/end-of-text-dropped]
コメント行と指令の行の周りの空行も、
同じに扱います。 [fixture: blank-lines/around-comment-lines]
[fixture: blank-lines/around-directive-lines]
これらは他の図種の規則と同じで、sankey だけの規則を足さないためです。
mermaid.js の文書がヘッダーの後に書く空行も、本体の先頭の空行として落とします。

入力 ([blank-lines/collapsed-input.mmd](../tests/fixtures/sankey/blank-lines/collapsed-input.mmd)):

```mmd
sankey
a,b,1



c,d,2
```

出力 ([blank-lines/collapsed-output.mmd](../tests/fixtures/sankey/blank-lines/collapsed-output.mmd)):

```mmd
sankey
a,b,1

c,d,2
```

### ヘッダー

ヘッダーの `sankey` と `sankey-beta` は、書かれた大文字小文字のまま残します。
mermaid.js はどちらも同じ図種として読みます。
どちらの綴りも同じ図種で Db が同じなので、強制はなく、
作者が書いた綴りを残します。
ヘッダーは 1 列目に置き、その行には何も続けません。
mermaid.js は、指令とコメント行以外が続くと拒否します。 [fixture: header/sankey]
[fixture: header/sankey-beta]
[fixture: header/upper-case-beta]
[fixture: header/leading-whitespace-dropped]
ヘッダーに接した指令は、
接したままです。 [fixture: header/directive-glued-to-the-header]
ヘッダーの前のコメント行と指令の行、後ろのコメント行は、
その場所に残します。 [fixture: header/comment-line-before-the-header]
[fixture: header/directive-line-before-the-header]
[fixture: header/comment-lines-after-the-header]

入力 ([header/leading-whitespace-dropped-input.mmd](../tests/fixtures/sankey/header/leading-whitespace-dropped-input.mmd)):

```mmd
   sankey
a,b,1
```

出力 ([header/leading-whitespace-dropped-output.mmd](../tests/fixtures/sankey/header/leading-whitespace-dropped-output.mmd)):

```mmd
sankey
a,b,1
```

入力 ([header/comment-line-before-the-header-input.mmd](../tests/fixtures/sankey/header/comment-line-before-the-header-input.mmd)):

```mmd
%% c
  sankey
a,b,1
```

出力 ([header/comment-line-before-the-header-output.mmd](../tests/fixtures/sankey/header/comment-line-before-the-header-output.mmd)):

```mmd
%% c
sankey
a,b,1
```

### コメント

コメントは `%%` で始まる行で、mermaid.js がテキストを読む前に取り除かれます。
テキストと印は書かれたまま残し、
ほかの行と同じく 1 列目に置きます。 [fixture: comments/lines-at-the-first-column]
[fixture: comments/text-kept]
[fixture: comments/comment-line-only-in-the-body]
記録の中の `%%` や `#` は、コメントではなく欄の文字で、
欄と一緒に残します。 [fixture: comments/percent-in-fields-kept]
[fixture: comments/hash-in-fields-kept]

入力 ([comments/lines-at-the-first-column-input.mmd](../tests/fixtures/sankey/comments/lines-at-the-first-column-input.mmd)):

```mmd
sankey
  %% one
a,b,1
     %% two
c,d,2
    %% three
```

出力 ([comments/lines-at-the-first-column-output.mmd](../tests/fixtures/sankey/comments/lines-at-the-first-column-output.mmd)):

```mmd
sankey
%% one
a,b,1
%% two
c,d,2
%% three
```

### 指令

単独の行にある指令は、1 列目に置きます。
前に空白があると、指令を取り除いた後に空白だけの行が残り、
mermaid.js に拒否されるからです。 [fixture: directives/kept]
値の後ろの指令は、前に空白が書かれているかを残します。
空白があれば空白 1 つを置き、接していれば接したままにします。
他の図種と同じ規則です。
記録の始まりの指令は、記録との間に空白が書かれているかを残します。
接していれば接したまま、
空白があれば空白 1 つにします。 [fixture: directives/after-the-value]
[fixture: directives/at-the-start-of-a-record]
コンマの隣の指令は、隣に空白が書かれていれば、
空白 1 つを残します（空白だけの欄は[コンマ](#コンマ)を参照）。 [fixture: directives/next-to-commas]

欄や文字列の中の指令は、テキストの一部なので残します。
閉じていない指令はテキストの残りを取り、
書かれたまま残します。 [fixture: directives/inside-fields-kept]
[fixture: directives/unclosed-at-the-end-kept]

入力 ([directives/after-the-value-input.mmd](../tests/fixtures/sankey/directives/after-the-value-input.mmd)):

```mmd
sankey
a,b,1 %%{init: {}}%%
c,d,2%%{init: {}}%%
e,f,3    %%{init: {}}%%
```

出力 ([directives/after-the-value-output.mmd](../tests/fixtures/sankey/directives/after-the-value-output.mmd)):

```mmd
sankey
a,b,1 %%{init: {}}%%
c,d,2%%{init: {}}%%
e,f,3 %%{init: {}}%%
```

### フロントマターの YAML

flowchart と同じです。
`---` の行の間の YAML は Prettier の YAML 整形で整え、`---` の行は、
行末の空白とタブも含め、
書かれたまま残します。 [fixture: frontmatter-yaml/formatted]
[fixture: frontmatter-yaml/closing-delimiter-whitespace-kept]
[fixture: frontmatter-yaml/sankey-settings]
Prettier が読めない YAML は、
書かれたまま残します。 [fixture: frontmatter-yaml/malformed-kept]
フロントマターとヘッダーの間のコメント行は残します。 [fixture: frontmatter-yaml/comment-after-frontmatter-before-header]

入力 ([frontmatter-yaml/sankey-settings-input.mmd](../tests/fixtures/sankey/frontmatter-yaml/sankey-settings-input.mmd)):

```mmd
---
config:
  sankey:
    showValues:   false
---
sankey
a,b,1
```

出力 ([frontmatter-yaml/sankey-settings-output.mmd](../tests/fixtures/sankey/frontmatter-yaml/sankey-settings-output.mmd)):

```mmd
---
config:
  sankey:
    showValues: false
---
sankey
a,b,1
```

### 空白文字

mermaid.js が受理するタブ、U+00A0、U+3000、U+2028、U+2029、U+FEFF は、
テキストの末尾にあるものだけです。
テキストの末尾では、空白は読む前に落とされます。
出力ではそれらを落とし、テキストは最後の記録の後の改行で終わります。
例は文字列で書き、`\u00a0` は U+00A0、`\u3000` は U+3000、
`\n` は改行です。 [test: U+00A0 at the end of the text]
[test: U+3000 at the end of the text without a line feed]
[test: U+2028 at the end of the text without a line feed]
[test: U+2029 at the end of the text]
[test: U+FEFF at the end of the text without a line feed]
[test: a tab at the end of the text without a line feed]
[test: U+00A0 on a line of its own at the end of the text]
テキスト末尾のコメント行は、U+00A0 も含め、
コメントがほかの場所でそうであるように、
文字を残します。 [test: U+00A0 at the end of the last comment line of the text]

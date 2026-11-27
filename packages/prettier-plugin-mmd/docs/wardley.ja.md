# Wardley の整形規則

英語版: [wardley.md](./wardley.md)

採用した 35 項目に従い、
[Wardley の木](../../spec/docs/ast/wardley.ja.md)を印字します。
最上位と pipeline の本文は共有生成処理の同じ関数を通します。
保持する原文と mermaid.js との差は
[互換性](./compatibility.ja.md#wardley-の原文と必須の改行)に記録します。

## 規則

### 見出し

見出し wardley-beta は原綴のまま第 1 列に置き、
普通の最初の文を次の行へ移します。
図種を見つけやすくするためです。
文をどの行に置くかは、規則 1 の場所ではないので、
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)が決めます。
[architecture](./architecture.ja.md#header)、[cynefin](./cynefin.ja.md#header)、
[radar](./radar.ja.md#header)も、見出しを 1 行に置き、
普通の最初の文を次の行へ移して印字します。
mermaid.js は見出しの後のコロンを拒否するので、コロンは足しません。
読み飛ばす構文、保持前置部分、保護行には共有の境界規則を使います。
空の本文には文を足しません。

[fixture: wardley/header/header-glued]

[fixture: wardley/header/header-inline]

[fixture: wardley/header/header-empty]

[fixture: radar/header/bare-inline] [fixture: cynefin/header/header-bare-inline]
[fixture: treemap/header/stable]
[fixture: architecture/header/header-inline-accessibility]
[corpus fixture: wardley/header-punctuation]

入力（エスケープ表記）: `"wardley-betacomponentHeader[0.3,0.6]"`

出力
([header/header-glued-output.mmd](../tests/fixtures/wardley/header/header-glued-output.mmd)):

```mmd
wardley-beta
  component Header [0.3, 0.6]
```

### 字下げ

[規則 1](./printed-form.ja.md#1-記号の横の空白)により、普通の文、メタデータ、
独立した注釈は、見出しより設定の 1 段だけ深く置きます。
Prettier がブロックの中の行をそう印字するためです。
既定は空白 2 つ、`tabWidth` 4 は 4 つ、0 は 0 です。
列に文法上の意味がないためです。
`useTabs` は幅 0 でもタブを使います。
1 段の幅は、Prettier の `useTabs` と `tabWidth` の設定どおりです。
Prettier は、
CSS の規則の宣言と JavaScript のブロックの文を 1 段内側に印字します。
既定は空白 2 つ、`tabWidth` 4 は 4 つ、0 は 0 で、`useTabs` はタブで、
幅 0 でもタブです。
[規則 1](./printed-form.ja.md#1-記号の横の空白)により、
見出しの後の文は 1 段深く置きます。
Prettier がブロックの中の行をそう印字するためです。
保護区間の最初の行は本文の段に揃え、内部と後続行の列は保ちます。

[fixture: wardley/indentation/indent-two]

[fixture: wardley/indentation/indent-four]

[fixture: wardley/indentation/indent-zero]

[fixture: wardley/indentation/indent-tabs]

[fixture: wardley/indentation/indent-zero-tabs]

[fixture: flowchart/indentation/statements]
[fixture: radar/indentation/indent-two]
[fixture: architecture/indentation/indent-two]
[fixture: pie/indentation/indent-default]

入力（エスケープ表記）: `"wardley-beta\n component Indent [0.3,0.6]"`

出力
([indentation/indent-two-output.mmd](../tests/fixtures/wardley/indentation/indent-two-output.mmd)):

```mmd
wardley-beta
  component Indent [0.3, 0.6]
```

### pipeline

pipeline Parent { と印字し、
子文はさらに 1 段深く、} は親の文と同じ段に置きます。
規則 1 は、
ブロックを開く `{` の前に空白 1 つを置きます（`class A{}` は `class A {}`
と印字します）。
`}` は単独の行に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)により、
pipeline の子文を親の文より 1 段深く置き、`}` を親の文と同じ段に置きます。
Prettier がブロックの中の行を印字する形です。
閉じる行は開く行と同じ段です。
{ と各子文の後の可視 LF は、幅 0 でも文法に必要なので保ちます。
座標や生成 ID を足さず、書かれた親子の区切りを示します。

[fixture: wardley/pipeline/pipeline-depth]

[fixture: wardley/pipeline/pipeline-zero]

[fixture: wardley/pipeline/pipeline-tab]

[fixture: class/indentation/namespaces]
[fixture: er/indentation/attribute-blocks-in-subgraphs]
[fixture: state/indentation/composite-states]

入力（エスケープ表記）:
`"wardley-beta\ncomponent Parent[0.4,0.5]\npipelineParent{\n component Child[0.6]label[-1,2]\n      }"`

出力
([pipeline/pipeline-depth-output.mmd](../tests/fixtures/wardley/pipeline/pipeline-depth-output.mmd)):

```mmd
wardley-beta
  component Parent [0.4, 0.5]
  pipeline Parent {
    component "Child" [0.6] label [-1, 2]
  }
```

### 文を 1 行ずつにする

普通の文は 1 行ずつにして、必須の EOL を保ちます。
mermaid.js は、文と同じ行にある、空白の後の 2 つ目の文と、
U+2028 や U+2029（改行ではありません）の後の 2 つ目の文と、
パイプラインを開く `{` と同じ行にある文と、リンク、タイトル、`accTitle` の行、
`accDescr` の行以外の文の後の `;` を拒否します。
リンクの後の `;` は、
ラベルを開きます（[セミコロンのラベル](#セミコロンのラベル)を参照）。
ほかの 3 つの後の `;` は、そのテキストの一部です。
Wardley のセミコロンは文の区切りではないので足しません。
値の内部の見かけの文は、木が区別した値のテキストとして残します。

[fixture: wardley/statements-one-per-line/statement-eol]
[corpus fixture: wardley/line-ls-gap] [corpus fixture: wardley/line-ps-gap]
[corpus fixture: wardley/gram-anchor-component-one-line]
[corpus fixture: wardley/gram-pipeline-inline]
[corpus fixture: wardley/tail-component-semicolon]
[corpus fixture: wardley/tail-anchor-semicolon]
[corpus fixture: wardley/tail-note-semicolon]
[corpus fixture: wardley/tail-evolve-semicolon]
[corpus fixture: wardley/tail-evolution-semicolon]
[corpus fixture: wardley/tail-size-semicolon]
[corpus fixture: wardley/tail-annotation-semicolon]
[corpus fixture: wardley/tail-annotations-semicolon]
[corpus fixture: wardley/tail-accelerator-semicolon]
[corpus fixture: wardley/tail-deaccelerator-semicolon]
[corpus fixture: wardley/tail-pipeline-semicolon]
[corpus fixture: wardley/tail-child-semicolon]
[corpus fixture: wardley/tail-block-semicolon]
[corpus fixture: wardley/tail-link-empty-label]
[corpus fixture: wardley/tail-link-spaced-label]
[corpus fixture: wardley/tail-common-semicolons]

入力（エスケープ表記）:
`"wardley-beta\nanchor Sep [0.8,0.2]\ncomponent Step [0.2,0.4]"`

出力
([statements-one-per-line/statement-eol-output.mmd](../tests/fixtures/wardley/statements-one-per-line/statement-eol-output.mmd)):

```mmd
wardley-beta
  anchor Sep [0.8, 0.2]
  component Step [0.2, 0.4]
```

### 部品間の空白

命令語と最初の完全な名前、数、文字列、括弧の間は空白 1 つにします。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、括弧の前も含めて、
この空白を与えます。
Prettier は、
キーワードとそれが取るものの間に空白 1 つを印字し（`return  x` を `return x;`
と印字する）、
キーワードが取る値を開く `[` の前も同じです（`return  [800, 600]` を
`return [800, 600];` と印字する）。
pipeline も含め、接したキーワードにも同じ規則を使います。
キーワードに末尾境界がなく、木が名前と区別しているためです。
注釈と読み飛ばす部分の境界には普通の空白規則を当てません。

[fixture: wardley/component-spacing/keyword-anchor]

[fixture: wardley/component-spacing/keyword-component]

[fixture: wardley/component-spacing/keyword-evolve]

[fixture: wardley/component-spacing/keyword-note]

[fixture: wardley/component-spacing/keyword-annotations]

[fixture: wardley/component-spacing/keyword-annotation]

[fixture: wardley/component-spacing/keyword-accelerator]

[fixture: wardley/component-spacing/keyword-deaccelerator]

[fixture: wardley/component-spacing/keyword-evolution]

入力（エスケープ表記）: `"wardley-beta\nanchorUser[0.8,0.3]"`

出力
([component-spacing/keyword-anchor-output.mmd](../tests/fixtures/wardley/component-spacing/keyword-anchor-output.mmd)):

```mmd
wardley-beta
  anchor User [0.8, 0.3]
```

[corpus fixture: wardley/keywords-all-glued]

### 名前と引用

component、anchor、link、`evolve` 文、pipeline、evolution の段階の名前は、
引用符なしで読める場合に引用符なしで印字し、accelerator、deaccelerator、
pipeline の component の名前は、
mermaid.js の文書の例と同じく引用符で囲んで印字します。
（[テキストの引用符](./compatibility.ja.md#テキストの引用符)を参照）。
`component "Customer"` は `component Customer` と印字し、
`accelerator Market` は `accelerator "Market"` と印字します。
引用符なしで読める名前は、ASCII の英字で始まり、ASCII の英字、数字、
`_` からなる語を空白 1 つで区切った形で、
字句解析器が命令か戦略として読む小文字の語（`build`、`component`、
`title` など）で始まらないものです。
`-` を含む名前は、引用符を残します。
この図種を初めて含む版は、引用符なしでは拒否するためです。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
矢印のない link（`"A" "B"`）の名前と、
読み飛ばす YAML ブロックの `---` に接する名前は、引用符を残します。
引用符がなければ、2 つの名前は 1 つの名前として読まれ、
`---` は名前に結びつくからです。
詳しくは [テキストの引用符](./compatibility.ja.md#テキストの引用符)
を参照してください。

[fixture: names-and-quotes/plain-names-without-quotes]
[fixture: names-and-quotes/names-that-need-quotes]

それ以外では、
`WardleyIdentifier` と `StringLiteral` を原文の範囲のまま印字します。
内部の空白とタブ、ハイフン、括弧、`&`、エスケープ、
空と空白だけの文字列も保ちます。
ただし、link のラベルは除き、中の空白とタブの連なりは空白 1 つにして印字します。
（[セミコロンのラベル](#セミコロンのラベル)を参照）。
component の名前は Db の id で、pipeline は同じ id で component を探します。
そのため、空白の連なりが違う名前は別の名前です。
Db は書かれたとおりの空白を持つ id を保ち、mermaid.js は、
名前の空白がタブかスペースかで component と違う pipeline を拒否します。
名前が空白の連なりだけ違う 2 つの component は、描かれる図も違います。
対象にする版の mermaid.js のすべてが、連なりを残せば component を 2 つ描き、
連なりをそろえると 1 つしか描きません。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
名前の文字列が `'` で囲まれていれば、`"` で囲んで印字しますが、内容に `'`、`"`、
バックスラッシュ、改行、U+2028、U+2029、バッククォート、`&`、`#`、
`<` が含まれる場合は書かれたままにします。
（[同じに描かれる綴り](./compatibility.ja.md#同じに描かれる綴り)を参照）。
`singleQuote` は読みません。
[規則 3](./printed-form.ja.md#3-綴り)は `"` を選びます。
mermaid.js の文書の例は、両方の引用符を読む 10 の図種の文字列 409 個のうち、
408 個を `"` で書いています。
link のラベル（`+'moving'>`）は `'` で囲んだままにします。
mermaid.js がその場所で読む引用符は、それだけだからです。

[fixture: names-and-quotes/single-quote-sensitive-kept]

[corpus fixture: wardley/space-name-values]
[corpus fixture: wardley/gram-reference-same-whitespace]

名前の空白を畳むことと文字列の両端の空白の除去は Db を変えます。
エスケープの別の解釈が必要になる引用符への変更はしません。

[fixture: wardley/names-and-quotes/name-spaces]
[fixture: wardley/names-and-quotes/names-differing-by-a-run]

[fixture: wardley/names-and-quotes/name-parenthesis-ampersand]

[fixture: wardley/names-and-quotes/name-quotes-empty]

[fixture: wardley/names-and-quotes/string-escape]

[fixture: wardley/names-and-quotes/name-hyphen]

入力（エスケープ表記）: `"wardley-beta\ncomponent Foo  Bar\tBaz [0.3,0.6]"`

出力
([names-and-quotes/name-spaces-output.mmd](../tests/fixtures/wardley/names-and-quotes/name-spaces-output.mmd)):

```mmd
wardley-beta
  component Foo  Bar	Baz [0.3, 0.6]
```

### 名前の境界

普通の名前と後続部品の間は空白 1 つにします。
ただし引用符のない名前がちょうど title のときは、座標、pipeline の括弧、
evolve の数、矢印、port、@、/ との接し方を保ちます。
この空白 1 つは、キーワードの後なら[部品間の空白](#部品間の空白)、
`{` の前なら[pipeline](#pipeline)、
矢印の前後なら[link](#link) の各節と同じ隙間です。
evolve の数の前の空白は、[規則 1](./printed-form.ja.md#1-記号の横の空白) が、
並んで続く値の間に与える空白 1 つです。
Prettier が CSS の `margin: 1px    2px;` を印字すると、
`margin: 1px 2px;` になるのと同じです。
詳しくは [evolve](#evolve) を参照してください。
座標の組の `[` の前の空白は、[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
文が取る値を開く `[` の前に与える空白です。
名前や文字列の後でも同じで、座標は文が取る値であり、名前のラベルではありません。

title の後に空白があると、名前でなくメタデータとして読まれます。
引用した "title" と引用符なしの titlex は普通に空白を置きます。
大文字の名前は名前のままです。

[fixture: wardley/name-boundaries/component-title-contact]

[fixture: wardley/name-boundaries/anchor-title-contact]

[fixture: wardley/name-boundaries/force-title-contact]

[fixture: wardley/name-boundaries/pipeline-title-contact]

[fixture: wardley/name-boundaries/link-title-contact]

[fixture: wardley/name-boundaries/stage-title-contact]

[fixture: wardley/name-boundaries/title-prefix-safe]

[fixture: wardley/name-boundaries/quoted-title]

[fixture: wardley/name-boundaries/title-link-port]

[fixture: wardley/name-boundaries/title-stage-slash]

[fixture: wardley/name-boundaries/title-evolve-hidden]

入力（エスケープ表記）: `"wardley-beta\ncomponent title[0.3,0.6]"`

出力
([name-boundaries/component-title-contact-output.mmd](../tests/fixtures/wardley/name-boundaries/component-title-contact-output.mmd)):

```mmd
wardley-beta
  component title[0.3, 0.6]
```

[corpus fixture: wardley/evolution-upper]

### 座標

座標は [a, b] とし、内端とコンマの前は詰め、後は空白 1 つにします。
Db が同じ空白の形から、Prettier がコンマの隣に印字する形を選びます。
visibility、evolution の順と整数・小数の原綴を保ちます。
読み飛ばす部分と大域的な注釈の隙間には共有規則を使います。

[fixture: wardley/coordinates/coordinates-decimal]

[fixture: wardley/coordinates/coordinates-integer]

入力（エスケープ表記）: `"wardley-beta\nanchor Coord [ 0.3 \t,\t 0.6 ]"`

出力
([coordinates/coordinates-decimal-output.mmd](../tests/fixtures/wardley/coordinates/coordinates-decimal-output.mmd)):

```mmd
wardley-beta
  anchor Coord [0.3, 0.6]
```

### 数

`NumericLiteral` は倍精度浮動小数点数の値を文字列化せず、
原文の範囲を印字します。
小数の先頭と末尾のゼロ、精度、丸められる境界、非正規化数、小さすぎる値の丸め、
受理される桁あふれを保ちます。
01.00 を 1 にすると、小数必須の位置で拒否されます。
百分率への変換は行いません。
拒否される先頭ゼロの整数は修復しません。

[fixture: wardley/numbers/decimal-leading-zero]

[fixture: wardley/numbers/integer-precision]

[corpus fixture: wardley/db-number-overflow]

[corpus fixture: wardley/db-number-subnormal]

[corpus fixture: wardley/db-number-underflow]

[corpus fixture: wardley/db-coordinate-double-one]

[corpus fixture: wardley/db-coordinate-double-hundred]

入力（エスケープ表記）: `"wardley-beta\ncomponent Digits [000.30,01.00]"`

出力
([numbers/decimal-leading-zero-output.mmd](../tests/fixtures/wardley/numbers/decimal-leading-zero-output.mmd)):

```mmd
wardley-beta
  component Digits [000.30, 01.00]
```

[corpus fixture: wardley/number-int-leading-zero]

### 装飾

ラベルの位置のずれ、戦略、inertia は書かれたものを文法上の順に保ちます。
装飾の外側は空白 1 つ、括弧の内側は詰めます。
括弧の内側に空白を置かないのは、
Prettier と同じです（[規則 1](./printed-form.ja.md#1-記号の横の空白)）。
ラベルの位置のずれの角括弧は、キーワード `label` が取る角括弧なので、
その前の空白は[規則 1](./printed-form.ja.md#1-記号の横の空白)が与えます。
詳しくは[部品間の空白](#部品間の空白)を参照してください。
装飾は並んで続く値なので、`]` と、
その後ろの `label` や括弧なしの `inertia` の間、括弧の中の戦略の `)` と、
その後ろの括弧なしの `inertia` の間に、
[規則 1](./printed-form.ja.md#1-記号の横の空白)が空白 1 つを与えます。
Prettier が CSS の `margin: 1px    2px;` を `margin: 1px 2px;`
と印字するのと同じです。
ここに挙げたのは、ディレクティブのない隙間です。
隙間にディレクティブがあるときは、その前に空白 1 つを置き、
後ろの単位に接して印字します。
`label [1, 2] %%{x}%% (build)` は `label [1, 2] %%{x}%%(build)` になります。
`]` や `)` の後にある `(` の前の隙間（括弧の中の戦略と `(inertia)`）には、
それがありません。
ほかの図の印字器の文書は、そのような隙間を挙げておらず、
ほかの図の印字済みのフィクスチャにも `] (` と `) (` はありません。
[ER](./er.ja.md#属性の空白) が属性のキーとコメントの間に置く空白 1 つは、
`(` ではなく引用符つきの文字列の前にあります。
そのため、`(` の前の隙間は、リリース済みの版が印字する空白 1 つの形を、
隙間が決まるまで保ちます。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
括弧なしの `inertia` と `(inertia)`、`build`、`buy`、`outsource`、
`market` を保ちます。
inertia の両形は Db が同じになる場合があります。
既定値は補いません。

[fixture: wardley/decorations/decorations-all]
[fixture: wardley/decorations/decorations-spaced]
[fixture: wardley/decorations/decorations-touching]
[fixture: quadrant/styles/styles-after-one-space]
[fixture: class/member-lines/method-padding]
[fixture: xychart/directives/directive-between-keyword-and-bracket]
[fixture: wardley/decorations/decoration-directive-in-the-gap]

[fixture: wardley/decorations/decorations-bare]

[fixture: wardley/decorations/decorations-strategies]

[fixture: wardley/decorations/label-only]

[fixture: wardley/decorations/bare-inertia-only]

[fixture: wardley/decorations/parenthesized-inertia-only]

[fixture: wardley/decorations/label-strategy]

[fixture: wardley/decorations/label-bare-inertia]

[fixture: wardley/decorations/label-parenthesized-inertia]

[fixture: wardley/decorations/strategy-parenthesized-inertia]

[fixture: wardley/decorations/label-strategy-bare-inertia]

入力（エスケープ表記）:
`"wardley-beta\ncomponent Decor[0.3,0.6]label[1,-2]( build )( inertia )"`

出力
([decorations/decorations-all-output.mmd](../tests/fixtures/wardley/decorations/decorations-all-output.mmd)):

```mmd
wardley-beta
  component Decor [0.3, 0.6] label [1, -2] (build) (inertia)
```

### label offset

label [-1, 2] とし、普通のマイナスは符号なし整数の大きさに付けます。
-0 も符号を残し、数の原綴を保ちます。
符号を離しても Db は同じですが、符号は数に接します。
Prettier が単項のマイナスを印字する形です。
符号と数の間の読み飛ばす部分と大域的な注釈の境界は保ちます。

[fixture: wardley/label-offsets/offset-sign-gap]

[fixture: wardley/label-offsets/offset-negative-zero]

入力（エスケープ表記）:
`"wardley-beta\ncomponent Sign[0.3,0.6]label[ - 1 , -\t2 ]"`

出力
([label-offsets/offset-sign-gap-output.mmd](../tests/fixtures/wardley/label-offsets/offset-sign-gap-output.mmd)):

```mmd
wardley-beta
  component Sign [0.3, 0.6] label [-1, -2]
```

### link

木の完全な名前、port、矢印の間は、矢印のない link も空白 1 つにします。
port と矢印の原綴は保ちます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が矢印の前後の空白を決めます。
矢印は 2 つのものの間の記号で、flowchart は `A-->B` を `A --> B` と印字し、
Prettier は `x = a+b` を `x = a + b;` と印字します。
A-->B は名前 A- と矢印 -> ですが、図を持つ最初の版は、`-` を含む名前を拒否して、
同じテキストを名前 A と矢印 --> として読みます。
そのため、`-` で終わる名前と矢印の間は空けません。
A-->B は A--> B と印字し、A- -> B とは印字しません。
どの版も、`A--> B` を `A-->B` と同じに描きます。
詳しくは
[wardley の原文と必須の改行](./compatibility.ja.md#wardley-の原文と必須の改行)
を参照してください。
名前と矢印の間のディレクティブは、2 つを分けません。
mermaid.js が、テキストを読む前にディレクティブを取り除くからです。
A-%%{init: {}}%%->B は A-%%{init: {}}%%-> B と印字します。

[fixture: wardley/links/link-glued-directive-between]

原文の字面から矢印を探しません。
A -->B の矢印は --> のままです。
解析済みの部品に従った空白です。

[fixture: wardley/links/link-short]

[fixture: wardley/links/link-long-glued]

[fixture: wardley/links/link-name-dashes-glued]

[fixture: wardley/links/link-name-dash-spaced]

[fixture: wardley/links/link-long-spaced]

[fixture: wardley/links/link-dotted]

[fixture: wardley/links/link-minimal]

[fixture: wardley/links/link-quoted-long]

[fixture: wardley/links/link-no-arrow]

[fixture: wardley/links/link-source-forward]

[fixture: wardley/links/link-source-backward]

[fixture: wardley/links/link-source-both]

[fixture: wardley/links/link-target-no-arrow]

[fixture: wardley/links/link-both-ports]

[fixture: wardley/links/link-multiword]

入力（エスケープ表記）: `"wardley-beta\nAlpha->Beta"`

出力
([links/link-short-output.mmd](../tests/fixtures/wardley/links/link-short-output.mmd)):

```mmd
wardley-beta
  Alpha -> Beta
```

### flow

+'label'>、+'label'<、+'label'<> の内側は書かれたまま保ちます。
空ラベル、余白、バックスラッシュ、継続行の列も含みます。
Db はラベルを書かれたまま持ちます。
バックスラッシュはその中で普通の文字で、エスケープとしては読まれません。
`A +'a\n\q'> B` のラベルは `a\n\q` です。
複数行にわたるラベルは、複数行にわたるどのテキストとも同じく、
書かれたまま残します。
詳しくは
[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)
を参照してください。
完全な部品間の大域的なディレクティブの境界も保ちます。
普通の空白を挿入すると複合単位が拒否されます。
対象にする版の mermaid.js のすべてが、`Alpha+ ' F  G\n\q ' >Beta` を拒否します。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
両端の空白の除去は Db を変えます。
flow の優先順位で見えなくても、両 port とセミコロンラベルを残します。

[test: wardley/flows/unicode-flow] [fixture: wardley/flows/flow-forward]

[fixture: wardley/flows/flow-backward]

[fixture: wardley/flows/flow-both]

[fixture: wardley/flows/flow-empty]

[fixture: wardley/flows/flow-padding-escapes]

[fixture: wardley/flows/flow-derived-direction]

[fixture: wardley/flows/flow-derived-dotted]

[fixture: wardley/flows/flow-ports-and-label]

[corpus fixture: wardley/lex-link-flow-raw-escapes]

入力（エスケープ表記）: `"wardley-beta\nAlpha+'moving'>Beta"`

出力
([flows/flow-forward-output.mmd](../tests/fixtures/wardley/flows/flow-forward-output.mmd)):

```mmd
wardley-beta
  Alpha +'moving'> Beta
```

### セミコロンのラベル

文法上のラベル開始 ; は前の部品に付け、
後ろは物理行末まで原文の範囲のまま印字します。
どの規則も、この付け方を与えません。
[規則 1](./printed-form.ja.md#1-記号の横の空白)の `;` の行は、
文を終える `;` のもので（`a ;` は `a;` になります）、
この `;` はリンクのラベルを開き、ラベルは行末まで続くので、
文の終わりではないためです。
`;` の前に空白がある形とない形は、Db が同じです。
リリース済みの版は `;` を前の文字に接して印字し（`Alpha ->Beta ;label` は
`Alpha -> Beta;label` になります）、決まるまでその形を残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
余白を足したり両端の空白を除いたりしません。; の後が空白なら、
空白だけのラベルとして受理され、
裸の ; は対象にする版の mermaid.js のすべてで拒否されます。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
後続のセミコロンには共有の前置部分保護を使います。
図種固有の構文に見える形と `%` テキストもラベルのままです。
リンクのラベルでは、`;` の後や flow の引用符の間の空白とタブの連なりは、
空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
component の名前はそのままです。

[fixture: wardley/flows/flow-padding-escapes]
[fixture: wardley/flows/flow-ports-and-label]
[fixture: wardley/semicolon-labels/label-exterior]

[fixture: wardley/semicolon-labels/label-whitespace]

[fixture: wardley/semicolon-labels/label-two-semicolons]

[fixture: wardley/semicolon-labels/label-apparent-syntax]

[fixture: wardley/semicolon-labels/label-comment-native]

入力（エスケープ表記）: `"wardley-beta\nAlpha->Beta;; extra"`

出力
([semicolon-labels/label-two-semicolons-output.mmd](../tests/fixtures/wardley/semicolon-labels/label-two-semicolons-output.mmd)):

```mmd
wardley-beta
  Alpha->Beta;; extra
```

### evolve

evolve Name 0.80 とし、部品間は空白 1 つにします。
[規則 1](./printed-form.ja.md#1-記号の横の空白) が、
キーワードとその名前の間を空白 1 つにします。
Prettier が `return  x` を `return x;` と印字するためです。
詳しくは[部品間の空白](#部品間の空白)を参照してください。
名前と数の間も、並んで続く値として、空白 1 つにします。
Prettier が CSS の `margin: 1px    2px;` を印字すると、
`margin: 1px 2px;` になるためです。
書かれた参照と小数、空の引用名、未反映の対象を保ちます。
ID が存在しなくても文を消しません。
引用符のない名前と数を結ぶと拒否されることがあります。

[fixture: wardley/evolves/evolve-numeric-gap]

[fixture: wardley/evolves/evolve-empty-name]

入力（エスケープ表記）:
`"wardley-beta\ncomponent Motion[0.3,0.6]\nevolveMotion\t0.80"`

出力
([evolves/evolve-numeric-gap-output.mmd](../tests/fixtures/wardley/evolves/evolve-numeric-gap-output.mmd)):

```mmd
wardley-beta
  component Motion [0.3, 0.6]
  evolve Motion 0.80
```

### note と annotation

note、annotations、annotation、force の部品間は空白 1 つにします。
annotation の外側のコンマも前を詰め、後を空白 1 つにします。
列を揃えず、座標の句読法と同じ選択にします。
キーワードと文字列の間の空白は、[部品間の空白](#部品間の空白)の空白と同じです。
文字列の後の `[` の前の空白と、`annotations` の後の `[` の前の空白は、
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
文が取る値を開く `[`
の前に与える空白です（[部品間の空白](#部品間の空白)を参照）。
コンマは、Prettier がコンマの横に印字する空白です。
詳しくは [規則 1](./printed-form.ja.md#1-記号の横の空白) を参照してください。
空文字、番号 0、整数と小数の座標、後続の検査されない box を保ちます。

[fixture: wardley/notes-and-annotations/note-spacing]

[fixture: wardley/notes-and-annotations/annotation-spacing]

[fixture: wardley/notes-and-annotations/annotation-empty]

[fixture: wardley/notes-and-annotations/annotations-later]

[fixture: wardley/notes-and-annotations/force-spacing]

入力（エスケープ表記）: `"wardley-beta\nnote\t\"Body\"[ 0.3 ,0.6 ]"`

出力
([notes-and-annotations/note-spacing-output.mmd](../tests/fixtures/wardley/notes-and-annotations/note-spacing-output.mmd)):

```mmd
wardley-beta
  note "Body" [0.3, 0.6]
```

### evolution

@ は両側を詰め、/ と段階の矢印 -> の左右は空白 1 つにします。
`/` と `->` は 2 つのものの間の記号なので、
[規則 1](./printed-form.ja.md#1-記号の横の空白)がその左右の空白を与えます。
[link](#link) と同じです。
Prettier は `x = a/b` を `x = a / b;` と印字します。
任意の境界と第 2 名、空の引用名、段階の原順を保ちます。
付属する印は詰め、選択肢どうしは分け、欠けた値は補いません。
引用符なしの title には名前の境界を適用します。

[fixture: wardley/evolution/stage-all-gaps]

[fixture: wardley/evolution/stage-no-boundary]

[fixture: wardley/evolution/stage-partial-boundary]

[fixture: wardley/evolution/stage-empty-names]

[fixture: wardley/evolution/stage-long-arrow-glued]

[fixture: wardley/evolution/stage-title-arrow]

入力（エスケープ表記）:
`"wardley-beta\nevolution  Early  @ 0.20/ Concept->Late@1.00 / Utility"`

出力
([evolution/stage-all-gaps-output.mmd](../tests/fixtures/wardley/evolution/stage-all-gaps-output.mmd)):

```mmd
wardley-beta
  evolution Early@0.20 / Concept -> Late@1.00 / Utility
```

### size

size [800, 600] とし、座標と同じ括弧の形にします。
2 つの整数の原文の範囲を保ち、0 も残します。
実効的な描画寸法で文を置き換えず、数の組の表記を揃えます。
コンマと括弧は[座標](#座標)と同じです。
括弧の内側は詰め、コンマの前は詰めて後に空白 1 つにします。
詳しくは [規則 1](./printed-form.ja.md#1-記号の横の空白) を参照してください。
`size` と `[` の間の空白は、[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
キーワードが取る値を開く `[`
の前に与える空白です（[部品間の空白](#部品間の空白)を参照）。

[fixture: wardley/size/size-spacing]

[fixture: wardley/size/size-zero]

入力（エスケープ表記）: `"wardley-beta\nsize[ 800 \t,\t 600 ]"`

出力
([size/size-spacing-output.mmd](../tests/fixtures/wardley/size/size-spacing-output.mmd)):

```mmd
wardley-beta
  size [800, 600]
```

### title

共通の行の配置を、
下の段落と[セミコロン](#セミコロン)の節が述べるところを除いて使い、
空でない値の前は空白 1 つにします。
外端の通常の共通空白は除き、閉じない引用符も内部の文字として保ちます。
ただし、値の中の空白とタブの連なりは空白 1 つにして印字します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
空の title は空のままで、次の行を値にしません。
[規則 1](./printed-form.ja.md#1-記号の横の空白) が、
`title` と空でない値の間に空白 1 つを与えます。
Prettier が `return  x` を `return x;` と印字するためです。
値を引用文字列として扱わず、Db が同じ端の形にします。

両端の空白を除く理由については、
[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)
を参照してください。
title のテキストは改行の前で終わるので、空の title は次の行から値を取りません。
title の中の引用符は、閉じていなくてもテキストの文字です。
詳しくは
[Wardley の仕様の共通メタデータの値](../../spec/docs/diagrams/wardley.ja.md#共通メタデータの値)
を参照してください。
題にテキストがあり、そのテキストの前にも中にもディレクティブがなく、
テキストの中に U+2028 も U+2029 もないとき、題の終わりのディレクティブは、
その前と後に何があるかで、次のように印字します。
ただし、未決の行は除きます。
未決の行とは、ディレクティブのある行のうち、ディレクティブのほかに、
`;`（ディレクティブの中のものも、コメントの中のものも）が行のどこかにある行、
最初のディレクティブの中か後に U+2028 か U+2029 がある行、
ディレクティブが改行を含む行、または次の文までの間の行に、
コメントかディレクティブの中の `;` がある行です。
幅のある空白は、U+000B、U+000C、U+00A0、U+1680、U+2000 から U+200A、U+202F、
U+205F、U+3000、U+FEFF のどれかです。
項目 6 が行を分けるときは、ほかの項目はその行に当たりません。

- ディレクティブの前が空白とタブだけ、または何もなく、その前のテキストにも、
  どのディレクティブの中にも `;` がなく、どのディレクティブも改行、U+2028、
  U+2029 を含まず、最後のディレクティブの後が空白とタブだけのときは、
  それぞれのディレクティブの前に空白かタブがあれば空白 1 つを置き、
  行末の空白とタブの有無にかかわらず、
  最後のディレクティブの後の空白とタブを除いて印字します。
- ディレクティブの前に幅のある空白があり、ディレクティブが互いに接して、
  最後のディレクティブに行末かコメントが接するときは、その文字を、
  同じ連なりの残りとともに空白 1 つで印字します。
- ディレクティブの前に幅のある空白があり、最初のディレクティブの後に、
  空白かタブと、別のディレクティブかコメントが続くときは、その文字は残り、
  その後ろからディレクティブかコメントまでの、空白とタブの連なりを、
  それぞれ空白 1 つで印字します。
- ディレクティブの前に U+2028 か U+2029 があり、ディレクティブが互いに接して、
  最後のディレクティブに行末が接するときは、空白 1 つで印字します。
- ディレクティブの前に U+2028 か U+2029 があり、
  最後のディレクティブにコメントが続かず、
  最後のディレクティブの後に空白かタブが続くとき、
  または最初のディレクティブの後に空白かタブと別のディレクティブが続くときは、
  行を書かれたままにします。
- ディレクティブの前に U+2028 か U+2029 があり、
  最後のディレクティブの後にコメントが続くときは、
  コメント領域が次の行を結びます。
  詳しくは
  [U+2028 か U+2029 の後のコメント行](./compatibility.ja.md#u2028-か-u2029-の後のコメント行)
  にあります。
  コメント行は、その前の空行、空白だけの行、
  ディレクティブの行とともに取り除かれ、残った最初の行が決めます。
  それが文か空白だけの行なら、その行まで書かれたままにします。
  それが空行かディレクティブの行のとき、または残る行がないときは、
  U+2028 か U+2029 を落とし、ディレクティブとコメントを別の行に置き、
  それらの間の隙間は、どの空白文字でも空白 1 つで印字します。
  後ろにコメント行が続かないとき、ディレクティブの行は、ディレクティブだけが、
  前にも間にも後にも空白なしで並ぶ行です（`%%{y}%%`、`%%{y}%%%%{z}%%`）。
  字下げのあるディレクティブ、後ろに空白が続くディレクティブ、
  空白が間にあるディレクティブ、後ろに文字が続くディレクティブは、
  そこでは文です。
  コメント行は、コメントを含む行です（`%% d`、`  %% d`、`%%{y}%% %% e`）。
  空白だけの行は、空白、タブ、幅のある空白、U+2028、U+2029 だけの行です。
  U+0085 と U+180E は空白ではなく、それを含む行は文です。
  コメント行の前にある行は、空白、ディレクティブ、コメントだけを含むときは、
  その並び方によらずコメント行とともに取り除かれます。
  空行、空白だけの行、ディレクティブの行、字下げのあるディレクティブ、
  後ろに空白が続くディレクティブ、空白が間にあるディレクティブ（`%%{y}%%`、
  空白 2 つ、`%%{z}%%`）は取り除かれ、文字、U+0085、U+180E、
  コメントとディレクティブの外の `;` を含む行は文です。
- 幅のある空白がディレクティブの間にあるときは、
  最後のディレクティブの後に何が続いても、行を書かれたままにします。
- 最後のディレクティブの後に幅のある空白があるときは、
  その前に空白やタブがあっても、その後に何が続いても、行を書かれたままにします。
  テキストの中にディレクティブのある題も、書かれたままです。

最後のディレクティブの後にコメントが続き、
テキストとコメントの間に U+2028 も U+2029 もなく、行が未決でなく、
項目 7 と 8 のどちらにも当たらないときは、
それぞれのディレクティブの前とコメントの前の空白とタブの連なりを、
空白 1 つで印字します。
（[同じに描かれるキーワードの後のテキスト
](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
同じ行の何かの後ろにあるコメントの前に空白 1 つを与えます。
Prettier が `x = 1;   // c` を `x = 1; // c` と印字する形です。

[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
Prettier が行末に空白を残さないのと同じく、行末の空白を除きます（項目 1）。
ほかの項目は、規則が決めない隙間と文字について、
リリース済みの版が印字する形を述べています。
ほかの図の種類が違う形で印字する形は、決まるまでそのまま残します。
（[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)）。

テキストの中に U+2028 か U+2029 があるとき、または値がディレクティブだけで、
行が未決でないときは、
最後のディレクティブの後に空白かタブが続けば（その後が行末でもコメントでも）、
またはディレクティブの間に空白かタブがあれば、行を書かれたままにし、
項目 3 は適用しません。
どちらでもなければ、ほかの項目が、
ほかのテキストの行を印字するのと同じに印字するので、
ディレクティブの前の空白とタブの連なり（キーワードの後のものも）はそれぞれ空白 1
つになります。

未決の行は述べません。
そこでは出力が、`;` と U+2028 か U+2029 の両側の文字ごとに決まり、
規則 1 はこれらの隙間の印を挙げず、図の種類も同じには印字しません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
コメントの中の `;` も行を未決にします。
Wardley はそのような行を書かれたままにするからです。
整形が投げる行は、そこでは述べません。

`;` があってディレクティブのない題は、
最後の `;` までを書かれたままにします（行に `style` も `classDef` もなく、
最後の `;` がコメントの外にあって、その後が空白とタブだけで、
行に U+2028 も U+2029 もないとき）。
最後の `;` の後の空白とタブは除きます（`title   T;` と `title A   B;`
は変わらず、`title T;` の後ろの空白は除かれます）。
`;` があってディレクティブのないほかの行は述べません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
ただし `style` か `classDef` のある行は、
[セミコロン](#セミコロン)の節が述べます。

題のテキストが、キーワードの後の空白 1 つかタブ 1 つの後で、ディレクティブか、
互いに接するディレクティブで始まり、行のそれ以外の部分にディレクティブ、
コメント、`;`、幅のある空白、U+2028、U+2029 がなく、行が未決でないときは、
ディレクティブとそれ以外のテキストの間の空白とタブを除き、
行末の空白とタブも除きます（`title %%{x}%%  T  ` は `title %%{x}%%T` に、
`title %%{x}%%%%{y}%%  T  ` は `title %%{x}%%%%{y}%%T` になります）。
mermaid.js はテキストを読む前にディレクティブを除き、
題をその先頭の空白なしで描きます。
（[同じに描かれるキーワードの後のテキスト](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
ディレクティブがテキストの前にあるほかの題は述べません。
ディレクティブがキーワードに接する題、
最初のディレクティブの前に空白文字が 2 つ続く題、
2 つのディレクティブの間に空白がある題、行のほかの所にディレクティブ、コメント、
`;`、幅のある空白、U+2028、U+2029 がある題、
テキストがディレクティブで始まる `accTitle:` と `accDescr:` の行です。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。

[fixture: title/title-directives-end-blanks-dropped]
[fixture: title/title-directives-end-tabs-dropped]
[fixture: title/title-directives-in-the-text-kept]
[fixture: title/title-directives-end-before-comment-line-and-empty-line]
[fixture: title/title-directives-then-comment]
[fixture: title/title-directives-end-at-the-end-of-the-text]
[fixture: wardley/title/title-trim]
[test: a no-break space after the last directive of a title of a Wardley map]
[test: U+3000 after the last directive of a title of a Wardley map]
[test: U+2028 after the last directive of a title of a Wardley map]
[test: U+2029 after the last directive of a title of a Wardley map]
[test: a space and a no-break space after the last directive of a title of a Wardley map]
[test: a no-break space after the last of two directives of a title of a Wardley map]
[test: a no-break space before the directive that ends a title of a Wardley map]
[test: U+3000 before the directive that ends a title of a Wardley map]
[test: a space, a no-break space, and a space before the directive that ends a title of a Wardley map]
[test: a no-break space before two directives that touch and end a title of a Wardley map]
[test: a no-break space before a directive that a comment touches in a title of a Wardley map]
[test: U+2028 before the directive that ends a title of a Wardley map]
[test: U+2029 before the directive that ends a title of a Wardley map]
[test: a no-break space before a directive that a space and another directive follow in a title of a Wardley map]
[test: U+3000 before a directive that a space and a comment follow in a title of a Wardley map]
[test: a tab and a no-break space after the last directive of a title of a Wardley map]
[test: U+3000 before a directive that a comment touches in a title of a Wardley map]
[test: U+3000 before two directives that touch and end a title of a Wardley map]
[test: U+3000 before a directive that a space and another directive follow in a title of a Wardley map]
[test: a no-break space before a directive that a space and a comment follow in a title of a Wardley map]
[test: a no-break space between two directives that end a title of a Wardley map]
[test: U+3000 between two directives that end a title of a Wardley map]
[test: a no-break space between two directives, spaces after the last, in a title of a Wardley map]
[test: U+3000 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2028 before two directives that touch and end a title of a Wardley map]
[test: U+2029 before two directives that touch and end a title of a Wardley map]
[test: U+2028 before the last directive, a space and a tab after it, in a title of a Wardley map]
[test: U+2029 before the last directive, a space and a tab after it, in a title of a Wardley map]
[test: U+2028 before a directive that a space and another directive follow in a title of a Wardley map]
[test: U+2029 before a directive that a space and another directive follow in a title of a Wardley map]
[test: U+2028 between two directives that end a title of a Wardley map]
[test: U+2029 between two directives that end a title of a Wardley map]
[test: U+2028 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2029 between two directives, spaces after the last, in a title of a Wardley map]
[test: a space, a tab, and a no-break space after the last directive of a title of a Wardley map]
[test: a space, a tab, and U+3000 after the last directive of a title of a Wardley map]
[test: a space, a tab, and U+2028 after the last directive of a title of a Wardley map]
[test: a space, a tab, and U+2029 after the last directive of a title of a Wardley map]
[test: a semicolon before the directive of a title of a Wardley map, spaces after it]
[test: a semicolon and spaces before the directive that ends a title of a Wardley map]
[test: a semicolon after the last directive of a title of a Wardley map, spaces around it]
[test: a semicolon before the directive of a title of a Wardley map, a tab after it]
[test: a semicolon and a no-break space before the directive of a title of a Wardley map, spaces after it]
[test: a semicolon and a no-break space before the directive that ends a title of a Wardley map]
[test: a semicolon touching the last directive of a title of a Wardley map]
[test: U+000B before the directive that ends a title of a Wardley map]
[test: U+000C before the directive that ends a title of a Wardley map]
[test: U+1680 before the directive that ends a title of a Wardley map]
[test: U+2000 before the directive that ends a title of a Wardley map]
[test: U+2001 before the directive that ends a title of a Wardley map]
[test: U+2002 before the directive that ends a title of a Wardley map]
[test: U+2003 before the directive that ends a title of a Wardley map]
[test: U+2004 before the directive that ends a title of a Wardley map]
[test: U+2005 before the directive that ends a title of a Wardley map]
[test: U+2006 before the directive that ends a title of a Wardley map]
[test: U+2007 before the directive that ends a title of a Wardley map]
[test: U+2008 before the directive that ends a title of a Wardley map]
[test: U+2009 before the directive that ends a title of a Wardley map]
[test: U+200A before the directive that ends a title of a Wardley map]
[test: U+202F before the directive that ends a title of a Wardley map]
[test: U+205F before the directive that ends a title of a Wardley map]
[test: U+FEFF before the directive that ends a title of a Wardley map]
[test: U+000B before two directives that touch and end a title of a Wardley map]
[test: U+000B before a directive that a comment touches in a title of a Wardley map]
[test: U+000B between two directives that end a title of a Wardley map]
[test: U+000B after the last directive of a title of a Wardley map]
[test: a semicolon and U+000B before the directive that ends a title of a Wardley map]
[test: U+000C before two directives that touch and end a title of a Wardley map]
[test: U+000C before a directive that a comment touches in a title of a Wardley map]
[test: U+000C between two directives that end a title of a Wardley map]
[test: U+000C after the last directive of a title of a Wardley map]
[test: a semicolon and U+000C before the directive that ends a title of a Wardley map]
[test: U+1680 before two directives that touch and end a title of a Wardley map]
[test: U+1680 before a directive that a comment touches in a title of a Wardley map]
[test: U+1680 between two directives that end a title of a Wardley map]
[test: U+1680 after the last directive of a title of a Wardley map]
[test: a semicolon and U+1680 before the directive that ends a title of a Wardley map]
[test: U+2000 before two directives that touch and end a title of a Wardley map]
[test: U+2000 before a directive that a comment touches in a title of a Wardley map]
[test: U+2000 between two directives that end a title of a Wardley map]
[test: U+2000 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2000 before the directive that ends a title of a Wardley map]
[test: U+2001 before two directives that touch and end a title of a Wardley map]
[test: U+2001 before a directive that a comment touches in a title of a Wardley map]
[test: U+2001 between two directives that end a title of a Wardley map]
[test: U+2001 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2001 before the directive that ends a title of a Wardley map]
[test: U+2002 before two directives that touch and end a title of a Wardley map]
[test: U+2002 before a directive that a comment touches in a title of a Wardley map]
[test: U+2002 between two directives that end a title of a Wardley map]
[test: U+2002 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2002 before the directive that ends a title of a Wardley map]
[test: U+2003 before two directives that touch and end a title of a Wardley map]
[test: U+2003 before a directive that a comment touches in a title of a Wardley map]
[test: U+2003 between two directives that end a title of a Wardley map]
[test: U+2003 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2003 before the directive that ends a title of a Wardley map]
[test: U+2004 before two directives that touch and end a title of a Wardley map]
[test: U+2004 before a directive that a comment touches in a title of a Wardley map]
[test: U+2004 between two directives that end a title of a Wardley map]
[test: U+2004 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2004 before the directive that ends a title of a Wardley map]
[test: U+2005 before two directives that touch and end a title of a Wardley map]
[test: U+2005 before a directive that a comment touches in a title of a Wardley map]
[test: U+2005 between two directives that end a title of a Wardley map]
[test: U+2005 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2005 before the directive that ends a title of a Wardley map]
[test: U+2006 before two directives that touch and end a title of a Wardley map]
[test: U+2006 before a directive that a comment touches in a title of a Wardley map]
[test: U+2006 between two directives that end a title of a Wardley map]
[test: U+2006 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2006 before the directive that ends a title of a Wardley map]
[test: U+2007 before two directives that touch and end a title of a Wardley map]
[test: U+2007 before a directive that a comment touches in a title of a Wardley map]
[test: U+2007 between two directives that end a title of a Wardley map]
[test: U+2007 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2007 before the directive that ends a title of a Wardley map]
[test: U+2008 before two directives that touch and end a title of a Wardley map]
[test: U+2008 before a directive that a comment touches in a title of a Wardley map]
[test: U+2008 between two directives that end a title of a Wardley map]
[test: U+2008 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2008 before the directive that ends a title of a Wardley map]
[test: U+2009 before two directives that touch and end a title of a Wardley map]
[test: U+2009 before a directive that a comment touches in a title of a Wardley map]
[test: U+2009 between two directives that end a title of a Wardley map]
[test: U+2009 after the last directive of a title of a Wardley map]
[test: a semicolon and U+2009 before the directive that ends a title of a Wardley map]
[test: U+200A before two directives that touch and end a title of a Wardley map]
[test: U+200A before a directive that a comment touches in a title of a Wardley map]
[test: U+200A between two directives that end a title of a Wardley map]
[test: U+200A after the last directive of a title of a Wardley map]
[test: a semicolon and U+200A before the directive that ends a title of a Wardley map]
[test: U+202F before two directives that touch and end a title of a Wardley map]
[test: U+202F before a directive that a comment touches in a title of a Wardley map]
[test: U+202F between two directives that end a title of a Wardley map]
[test: U+202F after the last directive of a title of a Wardley map]
[test: a semicolon and U+202F before the directive that ends a title of a Wardley map]
[test: U+205F before two directives that touch and end a title of a Wardley map]
[test: U+205F before a directive that a comment touches in a title of a Wardley map]
[test: U+205F between two directives that end a title of a Wardley map]
[test: U+205F after the last directive of a title of a Wardley map]
[test: a semicolon and U+205F before the directive that ends a title of a Wardley map]
[test: a semicolon and U+3000 before the directive that ends a title of a Wardley map]
[test: U+FEFF before two directives that touch and end a title of a Wardley map]
[test: U+FEFF before a directive that a comment touches in a title of a Wardley map]
[test: U+FEFF between two directives that end a title of a Wardley map]
[test: U+FEFF after the last directive of a title of a Wardley map]
[test: a semicolon and U+FEFF before the directive that ends a title of a Wardley map]
[test: a semicolon and U+2028 before the directive that ends a title of a Wardley map]
[test: a semicolon and U+2029 before the directive that ends a title of a Wardley map]
[test: a semicolon and a tab before the directive that ends a title of a Wardley map]
[test: a semicolon that the line rule ignores and spaces before the directive that ends a title of a Wardley map]
[test: a semicolon that the line rule ignores before the directive of a title of a Wardley map, spaces after it]
[test: a semicolon before the directive of a title of a Wardley map, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in a title of a Wardley map]
[test: a comment that ends with a semicolon after the last directive of a title of a Wardley map]
[test: a comment that has a space before its semicolon after the last directive of a title of a Wardley map]
[test: a comment that starts with a semicolon after the last directive of a title of a Wardley map]
[test: a semicolon inside the directive that ends a title, spaces after it, of a Wardley map]
[test: a semicolon inside the directive that ends a title, spaces and a comment after it, of a Wardley map]
[test: a semicolon inside the directive that ends a title, a space and a comment after it, of a Wardley map]
[test: a semicolon inside the last of two directives that end a title, spaces after it, of a Wardley map]
[test: a semicolon inside the first of two directives that end a title, spaces between them, of a Wardley map]
[test: a semicolon inside the first of two directives that end a title, a space between them, of a Wardley map]
[test: a semicolon inside the only directive that ends a title, spaces before it, of a Wardley map]
[test: a semicolon inside the last of two directives that end a title, spaces before both, of a Wardley map]
[test: a semicolon inside a directive that a comment touches in a title, spaces before the directive, of a Wardley map]
[test: a semicolon inside the first of two directives that touch in a title, spaces before them, of a Wardley map]
[test: a semicolon inside the directive that ends a title, a no-break space before it, of a Wardley map]
[test: a semicolon inside the directive that ends a title, U+2028 before it, of a Wardley map]
[test: a semicolon in the text, two directives with spaces between them, a title, of a Wardley map]
[test: a semicolon in the text, two directives with a space between them, a title, of a Wardley map]
[test: a semicolon and a space before two directives with spaces between them, a title, of a Wardley map]
[test: a semicolon in the text, two directives with a tab between them, a title, of a Wardley map]
[test: a semicolon in the text, two directives that touch, spaces before them, a title, of a Wardley map]
[test: a semicolon that touches two directives in a title, of a Wardley map]
[test: a semicolon that touches the second of two directives in a title, of a Wardley map]
[test: a semicolon that touches the first of two directives in a title, of a Wardley map]
[test: a semicolon between two directives in a title, spaces around it, of a Wardley map]
[test: a semicolon touching the last of two directives in a title, of a Wardley map]
[test: a semicolon after the last of two directives in a title, spaces around it and a comment after it, of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, spaces and a directive after them, in a title of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, a directive and spaces after them, in a title of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, a directive touching them, in a title of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, a directive that a comment touches, in a title of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, a directive and a space and a comment, in a title of a Wardley map]
[test: spaces and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of a Wardley map]
[test: a space and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of a Wardley map]
[test: a tab and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of a Wardley map]
[test: a no-break space and a second semicolon after the semicolon that the line rule ignores, a directive after them, in a title of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, a no-break space and a directive after them, in a title of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, U+2028 and a directive after them, in a title of a Wardley map]
[test: two semicolons after the semicolon that the line rule ignores, a directive after them, in a title of a Wardley map]
[test: U+2028 and a directive after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: U+2029 and a directive after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: U+2028, a directive and spaces after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: two semicolons that the line rule does not ignore, spaces and a directive after them, in a title of a Wardley map]
[test: text and a semicolon after the semicolon that the line rule does not ignore, spaces and a directive after them, in a title of a Wardley map]
[test: a tab and a directive after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: a no-break space and a directive after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: spaces and a directive that a comment touches after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: spaces and two directives with spaces between them after the semicolon that the line rule ignores, in a title of a Wardley map]
[test: a semicolon at the end of a title with whitespace around its text, of a Wardley map]
[test: a semicolon in the text of a title, spaces and a directive after it, of a Wardley map]
[test: spaces around a semicolon in the text of a title, a directive after it, of a Wardley map]
[test: U+000B between two directives, spaces after the last, in a title of a Wardley map]
[test: U+000B after the last directive and spaces of a title of a Wardley map]
[test: U+000C between two directives, spaces after the last, in a title of a Wardley map]
[test: U+000C after the last directive and spaces of a title of a Wardley map]
[test: a no-break space after the last directive and spaces of a title of a Wardley map]
[test: U+1680 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+1680 after the last directive and spaces of a title of a Wardley map]
[test: U+2000 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2000 after the last directive and spaces of a title of a Wardley map]
[test: U+2001 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2001 after the last directive and spaces of a title of a Wardley map]
[test: U+2002 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2002 after the last directive and spaces of a title of a Wardley map]
[test: U+2003 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2003 after the last directive and spaces of a title of a Wardley map]
[test: U+2004 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2004 after the last directive and spaces of a title of a Wardley map]
[test: U+2005 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2005 after the last directive and spaces of a title of a Wardley map]
[test: U+2006 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2006 after the last directive and spaces of a title of a Wardley map]
[test: U+2007 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2007 after the last directive and spaces of a title of a Wardley map]
[test: U+2008 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2008 after the last directive and spaces of a title of a Wardley map]
[test: U+2009 between two directives, spaces after the last, in a title of a Wardley map]
[test: U+2009 after the last directive and spaces of a title of a Wardley map]
[test: U+200A between two directives, spaces after the last, in a title of a Wardley map]
[test: U+200A after the last directive and spaces of a title of a Wardley map]
[test: U+202F between two directives, spaces after the last, in a title of a Wardley map]
[test: U+202F after the last directive and spaces of a title of a Wardley map]
[test: U+205F between two directives, spaces after the last, in a title of a Wardley map]
[test: U+205F after the last directive and spaces of a title of a Wardley map]
[test: U+3000 after the last directive and spaces of a title of a Wardley map]
[test: U+FEFF between two directives, spaces after the last, in a title of a Wardley map]
[test: U+FEFF after the last directive and spaces of a title of a Wardley map]
[test: U+2028 after the last directive and spaces of a title of a Wardley map]
[test: U+2029 after the last directive and spaces of a title of a Wardley map]
[test: a no-break space between two directives, a comment touching the last, in a title of a Wardley map]
[test: a no-break space between two directives, a space and a comment after the last, in a title of a Wardley map]
[test: a no-break space between two directives, spaces and a comment after the last, in a title of a Wardley map]
[test: a no-break space after the last directive, a comment touching it, in a title of a Wardley map]
[test: a no-break space after the last directive, spaces and a comment after it, in a title of a Wardley map]
[test: a no-break space after the last directive and spaces, spaces and a comment after it, in a title of a Wardley map]
[test: a no-break space after the last directive and a tab, spaces and a comment after it, in a title of a Wardley map]
[test: U+2003 between two directives, a comment touching the last, in a title of a Wardley map]
[test: U+2003 between two directives, a space and a comment after the last, in a title of a Wardley map]
[test: U+2003 between two directives, spaces and a comment after the last, in a title of a Wardley map]
[test: U+2003 after the last directive, a comment touching it, in a title of a Wardley map]
[test: U+2003 after the last directive, spaces and a comment after it, in a title of a Wardley map]
[test: U+2003 after the last directive and spaces, spaces and a comment after it, in a title of a Wardley map]
[test: U+2003 after the last directive and a tab, spaces and a comment after it, in a title of a Wardley map]
[test: a semicolon in the text, a no-break space between two directives, in a title of a Wardley map]
[test: a semicolon in the text, a no-break space after the last directive, in a title of a Wardley map]
[test: a semicolon inside the directive, a no-break space after it, in a title of a Wardley map]
[test: U+000B before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+000B before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+000B before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+000C before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+000C before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+000C before a directive that spaces and a comment follow in a title of a Wardley map]
[test: a no-break space before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+1680 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+1680 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+1680 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2000 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2000 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2000 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2001 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2001 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2001 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2002 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2002 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2002 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2003 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2003 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2003 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2004 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2004 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2004 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2005 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2005 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2005 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2006 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2006 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2006 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2007 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2007 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2007 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2008 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2008 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2008 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+2009 before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2009 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2009 before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+200A before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+200A before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+200A before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+202F before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+202F before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+202F before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+205F before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+205F before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+205F before a directive that spaces and a comment follow in a title of a Wardley map]
[test: U+3000 before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+FEFF before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+FEFF before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+FEFF before a directive that spaces and a comment follow in a title of a Wardley map]
[test: a run before the directive after a U+2028 inside the text of a title of a Wardley map]
[test: spaces after the directive after a U+2028 inside the text of a title of a Wardley map]
[test: spaces after the directive after a U+2029 inside the text of a title of a Wardley map]
[test: spaces between two directives after a U+2028 inside the text of a title of a Wardley map]
[test: a tab after the directive after a U+2028 inside the text of a title of a Wardley map]
[test: a run before two directives that touch after a U+2028 inside the text of a title of a Wardley map]
[test: spaces after the last semicolon of a title, no directive, of a Wardley map]
[test: a tab after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: a no-break space after the last semicolon of a title, no directive, of a Wardley map]
[test: spaces after the semicolon that the line rule ignores, no directive, in a title of a Wardley map]
[test: a tab after the semicolon that the line rule ignores, no directive, in a title of a Wardley map]
[test: released output that the document does not state: a semicolon inside a comment after the text of a title, no directive, of a Wardley map]
[test: released output that the document does not state: spaces after a semicolon inside a comment after the text of a title, no directive, of a Wardley map]
[test: U+000B and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+000C and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: a no-break space and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+1680 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2000 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2001 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2002 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2003 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2004 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2005 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2006 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2007 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2008 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+2009 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+200A and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+202F and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+205F and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+3000 and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: U+FEFF and spaces before the first of two directives that spaces separate, in a title of a Wardley map]
[test: a no-break space and a tab before the first of two directives that a space separates, in a title of a Wardley map]
[test: a no-break space before the first of two directives that a tab separates, in a title of a Wardley map]
[test: U+2003 and a tab before the first of two directives that a space separates, in a title of a Wardley map]
[test: U+2003 before the first of two directives that a tab separates, in a title of a Wardley map]
[test: U+2028 before the first of two directives that a tab separates, in a title of a Wardley map]
[test: U+2029 before the first of two directives that a tab separates, in a title of a Wardley map]
[test: a U+2028 inside the directive that ends a title, spaces before it, of a Wardley map]
[test: a U+2028 inside the directive that ends a title, spaces after it, of a Wardley map]
[test: a U+2029 inside the directive that ends a title, spaces before it, of a Wardley map]
[test: a U+2029 inside the directive that ends a title, spaces after it, of a Wardley map]
[test: a line break inside the directive that ends a title, spaces before it, of a Wardley map]
[test: a line break inside the directive that ends a title, spaces after it, of a Wardley map]
[test: a U+2028 inside the first of two directives that spaces separate, in a title of a Wardley map]
[test: a U+2028 inside the last of two directives, spaces before both, in a title of a Wardley map]
[test: a U+2028 inside the first of two directives that touch, spaces before them, in a title of a Wardley map]
[test: a U+2028 inside the directive that ends a title, a no-break space before it, of a Wardley map]
[test: a U+2028 inside a directive that a comment touches in a title, spaces before it, of a Wardley map]
[test: a U+2028 inside a directive that spaces and a comment follow in a title, of a Wardley map]
[test: a line break inside the first of two directives that spaces separate, in a title of a Wardley map]
[test: a line break inside the last of two directives, spaces before both, in a title of a Wardley map]
[test: a line break inside the first of two directives that touch, spaces before them, in a title of a Wardley map]
[test: a line break inside the directive that ends a title, a no-break space before it, of a Wardley map]
[test: a line break inside a directive that a comment touches in a title, spaces before it, of a Wardley map]
[test: a line break inside a directive that spaces and a comment follow in a title, of a Wardley map]
[test: a tab between the keyword and the directive of a title of directives only of a Wardley map]
[test: spaces between the keyword and the directive of a title of directives only of a Wardley map]
[test: spaces after the directive of a title of directives only of a Wardley map]
[test: spaces on both sides of the directive of a title of directives only of a Wardley map]
[test: two directives that spaces separate, a title of directives only of a Wardley map]
[test: two directives that touch, spaces before them, a title of directives only of a Wardley map]
[test: a comment that touches the directive of a title of directives only of a Wardley map]
[test: a space and a comment after the directive of a title of directives only of a Wardley map]
[test: released output that the document does not state: U+000B after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+000B between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+000C after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+000C between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: a no-break space between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+1680 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+1680 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2000 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2000 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2001 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2001 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2002 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2002 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2003 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2003 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2004 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2004 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2005 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2005 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2006 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2006 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2007 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2007 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2008 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2008 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2009 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2009 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+200A after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+200A between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+202F after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+202F between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+205F after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+205F between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+3000 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+3000 between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+FEFF after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+FEFF between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: U+2028 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: U+2029 after the last semicolon of a title, no directive, of a Wardley map]
[test: released output that the document does not state: spaces between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: released output that the document does not state: a tab between the last semicolon of a title and a comment, no directive, of a Wardley map]
[test: a wide space before two directives that spaces separate, one space before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, a run of spaces before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, a tab before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, U+2028 before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, U+2029 before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, a no-break space between the two directives, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, U+2028 between the two directives, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, U+2029 between the two directives, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the first directive holds a line break inside, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the last directive holds a line break inside, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, a comment touching the last directive, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, a value of directives only, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, one space before the first directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a run of spaces before the first directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a tab before the first directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, one space after the last directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a tab after the last directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a no-break space after the last directive, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the first directive holds a line break inside, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a second directive touching the first, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a second directive after a space, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, a value of directives only, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, one space before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, a run of spaces before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, a tab before the first directive, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, one space after the last directive, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, a tab after the last directive, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, a no-break space after the last directive, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the first directive holds a line break inside, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the last directive holds a line break inside, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, a value of directives only, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, one space before the first directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a run of spaces before the first directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a tab before the first directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, one space after the last directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a run of spaces after the last directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a tab after the last directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a no-break space after the last directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, U+2028 after the last directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, U+2029 after the last directive, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the first directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the last directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, a value of directives only, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, one space before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, a run of spaces before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, a tab before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, U+2029 before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, one space after the last directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, a tab after the last directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, a no-break space after the last directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, U+2028 after the last directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, U+2029 after the last directive, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the first directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, a second directive after a space, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, a no-break space between the two directives, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, U+2028 between the two directives, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, U+2029 between the two directives, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the first directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the last directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, one space before the first directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, a tab before the first directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, U+2028 before the first directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, U+2029 before the first directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, one space after the last directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, a tab after the last directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, a no-break space after the last directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, U+2028 after the last directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, U+2029 after the last directive, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, a second directive after a space, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, a value of directives only, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, one space before the first directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, a tab before the first directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, U+2028 before the first directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, U+2029 before the first directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, one space after the last directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, a tab after the last directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, a no-break space after the last directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, U+2028 after the last directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, U+2029 after the last directive, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, a second directive after a space, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, a value of directives only, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, one space before the first directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a tab before the first directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a no-break space before the first directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, U+2028 before the first directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, U+2029 before the first directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, one space after the last directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a tab after the last directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a no-break space after the last directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, U+2028 after the last directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, U+2029 after the last directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, the first directive holds a line break inside, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a second directive touching the first, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a second directive after a space, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a comment touching the last directive, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, a value of directives only, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, a tab before the first directive, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, one space after the last directive, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, a tab after the last directive, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, a no-break space after the last directive, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, U+2028 after the last directive, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, U+2029 after the last directive, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, the first directive holds a line break inside, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, a second directive touching the first, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, a second directive after a space, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, one space before the first directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a tab before the first directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a no-break space before the first directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, U+2028 before the first directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, U+2029 before the first directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, one space after the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a tab after the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a no-break space after the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, U+2028 after the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, U+2029 after the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, the first directive holds a line break inside, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a second directive touching the first, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a second directive after a space, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a comment touching the last directive, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, a value of directives only, in a title of a Wardley map]
[test: a `;` and no directive, in a title of a Wardley map]
[test: a `;` and no directive, one space after the last `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, one space after the last `;`, a comment follows, in a title of a Wardley map]
[test: a `;` and no directive, one space between the text and the `;`, in a title of a Wardley map]
[test: a `;` and no directive, a run of spaces between the text and the `;`, in a title of a Wardley map]
[test: a `;` and no directive, a run of spaces between the keyword and the text, in a title of a Wardley map]
[test: a `;` and no directive, a tab between the text and the `;`, in a title of a Wardley map]
[test: a `;` and no directive, a no-break space between the text and the `;`, in a title of a Wardley map]
[test: a `;` and no directive, a no-break space between the keyword and the text, in a title of a Wardley map]
[test: a `;` and no directive, U+3000 between the text and the `;`, in a title of a Wardley map]
[test: a `;` and no directive, U+3000 between the keyword and the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, U+2028 between the text and the `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, U+2028 between the keyword and the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, U+2029 between the text and the `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, U+2029 between the keyword and the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a comment touching the `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a `;` in a comment after the text, no `;` before, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a `;` in a comment after the `;`, in a title of a Wardley map]
[test: a `;` and no directive, two `;`, in a title of a Wardley map]
[test: a `;` and no directive, two `;` that spaces separate, in a title of a Wardley map]
[test: a `;` and no directive, the `;` that the line rule ignores, in a title of a Wardley map]
[test: a `;` and no directive, the `;` that the line rule ignores, a no-break space after, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, one space before the first directive, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, one space after the last directive, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, U+2028 after the last directive, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, U+2029 after the last directive, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, a tab before the first directive, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, a no-break space before the first directive, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, U+2028 before the first directive, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, U+2029 before the first directive, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, a tab between the two directives, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, U+2028 between the two directives, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, U+2029 between the two directives, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the last directive holds a line break inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, a comment touching the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, one space before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a tab before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a no-break space before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, U+2028 before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, U+2029 before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, one space after the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a run of spaces after the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a tab after the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a no-break space after the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, U+2028 after the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, U+2029 after the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the last directive holds a line break inside, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, one directive only, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a comment touching the last directive, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, a value of directives only, in a title of a Wardley map]
[test: a `;` after the last directive, one space before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a tab before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a no-break space before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, U+2028 before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, U+2029 before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` after the last directive, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` after the last directive, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` after the last directive, a second directive touching the first, in a title of a Wardley map]
[test: a `;` after the last directive, a second directive after a space, in a title of a Wardley map]
[test: a `;` after the last directive, a comment touching the last directive, in a title of a Wardley map]
[test: a `;` after the last directive, a value of directives only, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, one space before the first directive, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a tab before the first directive, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a no-break space before the first directive, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a value of directives only, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, one space before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a tab before the first directive, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a value of directives only, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, spaces and a U+2028 after the last `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and spaces after the last `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, spaces, a U+2028, and spaces after the last `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a no-break space, a U+2028, and a no-break space after the last `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a tab after the last `;`, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and a no-break space after the last `;`, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, one space before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a run of spaces before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a tab before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a no-break space before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, U+2029 before the first directive, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a second directive touching the first, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a second directive after a space, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, no comment, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, a value of directives only, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, one space before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a run of spaces before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a tab before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a no-break space before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, U+2029 before the first directive, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the first directive holds a line break inside, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the last directive holds a line break inside, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the first directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the last directive holds a `;` inside, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the first directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the last directive holds a U+2028 inside, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, no comment, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, a value of directives only, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, one space after the last directive, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a tab after the last directive, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, no comment, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, one space between the two directives, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a run of spaces between the two directives, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a tab between the two directives, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a no-break space between the two directives, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, no comment, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a space stand before the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a tab stand before the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and two spaces stand before the text, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a no-break space stand before the text, in a title of a Wardley map]
[test: a directive, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a space, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a tab, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a no-break space, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, U+3000, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a vertical tab, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a form feed, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, U+2028, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, U+2029, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a space, U+2028, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, U+2028, a space, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a space, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a tab, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a no-break space, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, U+3000, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, U+2028, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, U+2029, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a space, U+2028, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a space, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a tab, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a no-break space, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, U+3000, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a vertical tab, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, U+2028, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, U+2029, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a space, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a tab, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a no-break space, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, in a title of directives only of a Wardley map]
[test: a directive, a `;`, two spaces, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a comment, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a space, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a comment, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a comment, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a tab, a comment, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a `;`, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, a `;`, in a title of directives only of a Wardley map]
[test: a directive, a `;`, two spaces, a `;`, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a `;`, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a directive, a `;`, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, a `;`, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a `;`, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a directive, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, two spaces, a directive, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a directive, a `;`, in a title of directives only of a Wardley map]
[test: a `;`, a directive, in a title of directives only of a Wardley map]
[test: a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, two spaces, a `;`, two spaces, in a title of directives only of a Wardley map]
[test: a `;` in the comment after the last directive, two spaces around the `;` between two directives, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a no-break space, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a no-break space, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, U+2028, a `;`, a directive, in a title of directives only of a Wardley map]
[test: a directive, two spaces, a `;`, two spaces, a no-break space, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, a `;`, a no-break space, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: a directive, U+2028, a `;`, two spaces, a `;`, two spaces, a directive, in a title of directives only of a Wardley map]
[test: two U+2028 before the directive that ends a title, of a Wardley map]
[test: two U+2029 before the directive that ends a title, of a Wardley map]
[test: U+2028 and U+2029 before the directive that ends a title, of a Wardley map]
[test: two U+2028 before the directive that ends a title, spaces after it, of a Wardley map]
[test: U+2029 and U+2028 before the directive that ends a title, spaces after it, of a Wardley map]
[test: two U+2028 before two directives that touch and end a title, of a Wardley map]
[test: two U+2028 before a directive that a space and another directive follow in a title, of a Wardley map]
[test: a U+2028 inside the directive that ends a title, spaces before it, a comment after two spaces, of a Wardley map]
[test: a U+2028 inside the directive of a title of directives only, spaces before and after it, of a Wardley map]
[test: a directive that starts the text of a title, two spaces and a text after it, spaces at the end, of a Wardley map]
[test: a directive that starts the text of a title, a space and a text after it, of a Wardley map]
[test: two directives that touch and start the text of a title, two spaces and a text after them, spaces at the end, of a Wardley map]
[test: two directives that touch and start the text of a title, a tab and a text after them, of a Wardley map]
[test: a directive that starts the text of a title, a text with a run of spaces inside it, spaces at the end, of a Wardley map]
[test: a directive that starts the text of a title, a text with a tab inside it, a tab at the end, of a Wardley map]
[test: two spaces before the directive that starts the text of a title, of a Wardley map]
[test: two directives with spaces between them that start the text of a title, of a Wardley map]
[test: a directive that starts the text of a title and a directive that ends it, of a Wardley map]
[test: a U+2028 inside the directive that starts the text of a title, two spaces and a text after it, spaces at the end, of a Wardley map]
[test: a line break inside the directive that starts the text of a title, two spaces and a text after it, spaces at the end, of a Wardley map]
[test: a `;` inside the directive that starts the text of a title, two spaces and a text after it, spaces at the end, of a Wardley map]
[test: a `;` at the end of a title, spaces after the keyword, of a Wardley map]
[test: a `;` at the end of a title, a run of spaces inside the text, of a Wardley map]
[test: a `;` after spaces at the end of a title, spaces after it, of a Wardley map]
[test: released output that the document does not state: a text after the `;` of a title, spaces at the end, of a Wardley map]
[test: released output that the document does not state: a U+2028 in the text of a title that ends with a `;`, of a Wardley map]
[test: a comment after the text of a title, spaces before it, of a Wardley map]
[test: a run of spaces inside the text of a title, of a Wardley map]
[test: a run of tabs inside the text of a title, spaces at the end, of a Wardley map]
[test: a run of spaces inside a quoted string in a title, of a Wardley map]
[test: a run of spaces beside a directive inside the text of a title, of a Wardley map]
[test: text after the `;` that the line rule ignores in a title, runs before and after it, of a Wardley map]
[test: text touching the `;` that the line rule ignores in a title, a run before it, of a Wardley map]
[test: text and a run after the `;` that the line rule ignores in a title, spaces at the end, of a Wardley map]
[test: two touching `;` that the line rule reads in a title, a run before them, of a Wardley map]
[test: two `;` with spaces between them that the line rule reads in a title, a run before them, of a Wardley map]
[test: text after the last of two `;` that the line rule reads in a title, runs around them, of a Wardley map]
[test: text after the `;` that the line rule ignores after classDef in a title, of a Wardley map]
[test: nothing after the `;` that the line rule ignores in a title, runs before it, of a Wardley map]
[test: a run inside the stretch of the line rule, nothing after the `;` in a title, spaces at the end, of a Wardley map]
[test: nothing after the last of two `;` that the line rule reads in a title, of a Wardley map]
[test: a comment after the `;` that the line rule ignores in a title, of a Wardley map]
[test: released output that the document does not state: a `;` inside the comment at the end of a title, a run and spaces at the end, of a Wardley map]
[test: nothing after the `;` that the line rule ignores in a title, spaces at the end, of a Wardley map]
[test: a run after the keyword of a title, nothing after the `;` that the line rule ignores, of a Wardley map]
[test: the literal style without the trigger and a `;` at the end of a title, spaces at the end, of a Wardley map]
[test: the word Style with a capital and a `;` at the end of a title, spaces at the end, of a Wardley map]
[test: a tab after the `;` that the line rule ignores in a title, runs before it, of a Wardley map]
[test: a classDef trigger with nothing after the `;` in a title, runs before it, of a Wardley map]
[test: the literal classDef and a `;` at the end of a title, spaces at the end, of a Wardley map]
[test: the literal style inside a word and a `;` at the end of a title, spaces at the end, of a Wardley map]
[test: the word classdef in lower case and a `;` at the end of a title, spaces at the end, of a Wardley map]
[test: U+2028 before a directive that a comment touches, a line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, the text ends, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, an empty line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, a line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, an empty line follows, in a title of a Wardley map]
[test: U+2029 before a directive that a comment touches, a line follows, in a title of a Wardley map]
[test: U+2029 before a directive that a comment touches, the text ends, in a title of a Wardley map]
[test: U+2029 before a directive that a comment touches, an empty line follows, in a title of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, a line follows, in a title of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, an empty line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, a comment line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, a line of whitespace follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, a directive line follows, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, a directive line and a comment line follow, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, an empty line and a comment line follow, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, a directive line, an empty line, and a comment line follow, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, an empty line and a directive line follow, in a title of a Wardley map]
[test: U+2028 before a directive that a comment touches, a directive line follows and the text ends, in a title of a Wardley map]
[test: U+2028 before two directives with spaces between them that a comment touches, the text ends, in a title of a Wardley map]
[test: U+2028 before two directives with a tab between them that a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2029 before a directive that a comment touches, a directive line and a comment line follow, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a comment line follows, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a line of whitespace follows, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line follows, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line and a comment line follow, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, an empty line and a comment line follow, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line, an empty line, and a comment line follow, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, an empty line and a directive line follow, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a directive line follows and the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, an empty line follows, in a title of a Wardley map]
[test: U+2028 after the last directive, spaces and a comment after it, a line follows, in a title of a Wardley map]
[test: U+2029 after the last directive, spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, a comment touching it, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, a comment touching it, a directive line follows, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a comment line follows, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a line of whitespace follows, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a directive line follows, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a directive line and a comment line follow, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, an empty line and a comment line follow, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a directive line, an empty line, and a comment line follow, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, an empty line and a directive line follow, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a directive line follows and the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, an empty line follows, in a title of a Wardley map]
[test: U+2028 between two directives, spaces and a comment after it, a line follows, in a title of a Wardley map]
[test: U+2029 between two directives, spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, a comment touching it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, a comment touching it, a directive line follows, in a title of a Wardley map]
[test: U+2028 after the last directive and spaces, spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: a U+2028 inside the text, a directive, and a comment after spaces, in a title of a Wardley map]
[test: a U+2028 inside the text, a directive that a comment touches, in a title of a Wardley map]
[test: a wide space before two directives that spaces separate, the text ends, in a title of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the text ends, in a title of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the text ends, in a title of a Wardley map]
[test: a U+2028 before two directives that touch, the text ends, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the text ends, in a title of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the text ends, in a title of a Wardley map]
[test: a directive that holds a line break, spaces before it, the text ends, in a title of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, the text ends, in a title of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, the text ends, in a title of a Wardley map]
[test: a value of directives only, spaces after the directive, the text ends, in a title of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, the text ends, in a title of a Wardley map]
[test: a `;` and no directive, the text ends, in a title of a Wardley map]
[test: a `;` and no directive, the text ends, in a title of a Wardley map]
[test: a `;` in the text, spaces before the directive, the text ends, in a title of a Wardley map]
[test: a `;` in the text, spaces between two directives, the text ends, in a title of a Wardley map]
[test: a `;` between two directives, spaces around it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, the text ends, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, the text ends, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, the text ends, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, the text ends, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in a title of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the text ends, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the text ends, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, the text ends, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, the text ends, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in a title of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a space stand before the text, the text ends, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a tab stand before the text, the text ends, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and two spaces stand before the text, the text ends, in a title of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a no-break space stand before the text, the text ends, in a title of a Wardley map]
[test: a line of a directive, two spaces before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of two spaces, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a tab, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a directive, a tab before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a no-break space, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a directive, a no-break space before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a directive, two spaces, a directive before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a directive, U+2028 before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a directive, a space, a comment before a comment line after a U+2028 before two directives, the text ends, in a title of a Wardley map]
[test: a line of a tab before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a no-break space before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of U+3000 before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a vertical tab before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a form feed before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of U+2028 before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of U+2029 before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of U+0085 before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of U+180E before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment touches it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2029 between two directives and after the last, a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2029 between two directives and U+2028 after the last, a comment follows after a tab, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after a no-break space, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a statement follows, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, an empty line and a statement follow, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a directive line and a statement follow, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a comment line and a statement follow, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a comment line follows and the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, a directive line follows and the text ends, in a title of a Wardley map]
[test: U+2028 between the first and the second of three directives, between the second and the third, and after the third, a comment touches it, the text ends, in a title of a Wardley map]
[test: U+2028 before the directives, between two directives, and after the last, a comment touches it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives of a title of directives only and after the last, a comment follows after spaces, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, a no-break space and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, a no-break space and a comment after the last, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, U+3000 and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, U+3000 and a comment after the last, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, a space and a no-break space and a comment after it, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, a space and a no-break space and a comment after the last, the text ends, in a title of a Wardley map]
[test: U+2028 after the last directive, a no-break space and a comment after it, a statement follows, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, two spaces after the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a tab after the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a no-break space after the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, U+3000 after the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, two spaces before the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a tab before the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a no-break space before the first, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2029 between two directives, two spaces after it, and U+2028 after the last, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives of a title of directives only, two spaces after it, and U+2028 after the last, a comment touches the last U+2028, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, two spaces after it, and U+2028 after the last, a comment touches the last U+2028, a statement follows, in a title of a Wardley map]
[test: U+2028 between two directives, two spaces after it, a comment touches the last directive, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, two spaces after it, a comment follows the last directive after spaces, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, a no-break space before the comment, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives, two spaces after it, a comment touches the last directive, a statement follows, in a title of a Wardley map]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, the text ends, in a title of a Wardley map]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment touches the third, the text ends, in a title of a Wardley map]
[test: U+2029 between the first and the second of three directives and between the second and the third, a comment follows the third after two spaces, the text ends, in a title of a Wardley map]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, a statement follows, in a title of a Wardley map]
[test: U+2028 between the first and the second of three directives and between the second and the third of a title of directives only, a comment follows the third after a space, the text ends, in a title of a Wardley map]
[test: U+2028 between two directives and after the last, a comment line stands between the last U+2028 and a statement, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, U+2029 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, U+2029 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, a space and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, a space and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, U+2028 and a space after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, U+2028 and a space after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, a no-break space and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, a no-break space and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, U+2028 and a no-break space after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, U+2028 and a no-break space after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, U+2028, a space, and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, U+2028, a space, and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, two spaces and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, two spaces and U+2028 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, a no-break space after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, a no-break space after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, touching the directive, U+3000 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces after the directive, U+3000 after it, the text ends, in a title of a Wardley map]
[test: a `;` after the last directive, U+2028 after it, a statement follows, in a title of a Wardley map]
[test: a `;` after the last directive, two spaces and U+2028 after it, a statement follows, in a title of a Wardley map]
[test: a `;` after the last directive, a no-break space after it, a statement follows, in a title of a Wardley map]
[test: a `;`, two spaces, a `;`, and U+2028 after the last directive, the text ends, in a title of a Wardley map]
[test: a line of a directive and a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a `;` and a comment before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a comment that holds a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a directive and a comment that holds a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a line of a directive that holds a `;` before a comment line after a U+2028 before a directive, the text ends, in a title of a Wardley map]
[test: a `;` before the U+2028 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: a `;` before the U+2028 between two directives, two spaces after the U+2028, a comment follows the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: a `;` between two directives, a U+2028 after the last directive, two spaces and a comment after it, the text ends, in a title of a Wardley map]
[test: a `;` after the U+2028 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: a `;` before the U+2028 between two directives, two spaces after the U+2028, a comment follows the last directive after two spaces, a statement follows, in a title of a Wardley map]
[test: two U+2028 with two spaces on each side between two directives, a comment follows the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: two U+2029 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: U+2028 and U+2029 between two directives, a comment follows the last directive after two spaces, the text ends, in a title of a Wardley map]
[test: two U+2028 after the last directive, a comment touches the second, the text ends, in a title of a Wardley map]
[test: U+2028 and U+2029 with two spaces on each side after the last directive, a comment follows the second after two spaces, the text ends, in a title of a Wardley map]
[test: two U+2028 with two spaces on each side after a single directive, a comment follows after two spaces, the text ends, in a title of a Wardley map]
[test: a `;` inside the comment after the last directive, two spaces before the comment, the text ends, in a title of a Wardley map]
[test: a U+2028 between the text and a directive, a U+2028 between the directive and the comment, an empty line and a statement follow, in a title of a Wardley map]
[test: a U+2028 after the last directive of a title of directives only, two spaces before and after it, a comment follows, the text ends, in a title of a Wardley map]
[test: two U+2028 before a directive that a comment touches, an empty line and a statement follow, in a title of a Wardley map]
[test: two U+2028 before a directive that a comment follows after spaces, an empty line and a statement follow, in a title of a Wardley map]
[test: U+2029 and U+2028 before a directive that a comment touches, the text ends, in a title of a Wardley map]
[test: two U+2028 before a directive that a comment touches, a comment line follows, in a title of a Wardley map]
[test: two U+2028 before a directive that a comment touches, a line of whitespace follows, in a title of a Wardley map]
[test: two U+2028 before a directive that a comment touches, a directive line follows, in a title of a Wardley map]
[test: a comment after the last directive after two spaces, a comment line that holds a `;` and an empty line follow, a statement follows, in a title of a Wardley map]
[test: a U+2028 before a directive that a comment follows after two spaces, a comment line that holds a `;` follows, a statement follows, in a title of a Wardley map]
[test: a comment after the last directive after two spaces, a directive line that holds a `;` and an empty line follow, a statement follows, in a title of a Wardley map]
[test: a directive that starts the text, two spaces and a text after it, spaces at the end, the text ends, in a title of a Wardley map]
[test: two directives that touch and start the text, a text after them, spaces at the end, the text ends, in a title of a Wardley map]
[test: a directive that starts the text, two spaces and a text after it, spaces at the end, a statement follows, in a title of a Wardley map]
[test: a directive that starts the text, two spaces and a text after it, a statement whose label holds a `;` follows, in a title of a Wardley map]

[fixture: wardley/title/title-empty]

[fixture: wardley/title/title-quotes]

[fixture: wardley/title/title-next-line]

入力（エスケープ表記）: `"wardley-beta\ntitle\t  A  subject \t"`

出力
([title/title-trim-output.mmd](../tests/fixtures/wardley/title/title-trim-output.mmd)):

```mmd
wardley-beta
  title A subject
```

### アクセシビリティ

accTitle: Value と accDescr: Value は、下の段落と、
[ディレクティブが前にある題](#title)と、
[セミコロン](#セミコロン)の節が述べるところを除いて、共有の行配置を使います。
空の代入も残します。
`accDescr` の値の中の空白とタブの連なりは空白 1 つにして印字し、
`accTitle` の連なりはブラウザがツールチップとして表示するので、
書かれたまま残します。
（[同じに描かれるテキスト中の空白の連なり](./compatibility.ja.md#同じに描かれるテキスト中の空白の連なり)）。
`accTitle` と `accDescr` のコロンはキーのコロンなので、
[規則 1](./printed-form.ja.md#1-記号の横の空白)が `accTitle: text`
の形を与えます。
コロンの前に空白を置かず、後ろに空白を 1 つ置きます。

値にテキストがあり、そのテキストの前にも中にもディレクティブがなく、
テキストの中に U+2028 も U+2029 もないとき、値の終わりのディレクティブは、
その前と後に何があるかで、次のように印字します。
ただし、[題の一覧](#title)が述べる未決の行は除きます。
幅のある空白は、U+000B、U+000C、U+00A0、U+1680、U+2000 から U+200A、U+202F、
U+205F、U+3000、U+FEFF のどれかです。
ディレクティブの前に U+2028 か U+2029 があり、
最後のディレクティブの後にコメントが続くときは、
未決でない行を題の一覧の項目 6 と同じに印字し、
題の一覧の項目 6 が行を分けるときは、以下の項目はその行に当たりません。
コロンはキーワードに接するので、コロンの前の隙間は、
行を書かれたままにするときも、隙間なしで印字します。

- ディレクティブの前が空白とタブだけ、または何もなく、その前のテキストにも、
  どのディレクティブの中にも `;` がなく、どのディレクティブも改行、U+2028、
  U+2029 を含まず、最後のディレクティブの後が空白とタブだけのときは、
  それぞれのディレクティブの前に空白かタブがあれば空白 1 つを置き、
  行末の空白とタブの有無にかかわらず、
  最後のディレクティブの後の空白とタブを除いて印字します。
- ディレクティブの前に幅のある空白があり、ディレクティブが互いに接して、
  最後のディレクティブに行末かコメントが接するときは、その文字を、
  同じ連なりの残りとともに空白 1 つで印字します。
  U+2028 か U+2029 が前にあり、
  最後のディレクティブに行末が接するときも同じです。
- ディレクティブの前に幅のある空白があり、最初のディレクティブの後に、
  空白かタブと、別のディレクティブかコメントが続くときは、その文字は残り、
  その後ろからディレクティブかコメントまでの、空白とタブの連なりを、
  それぞれ空白 1 つで印字します。
- ディレクティブの前に U+2028 か U+2029 があり、
  最後のディレクティブにコメントが続かず、
  最後のディレクティブの後に空白かタブが続くとき、
  または最初のディレクティブの後に空白かタブと別のディレクティブが続くときは、
  行を書かれたままにします。
- 幅のある空白がディレクティブの間にあるときは、
  最後のディレクティブの後に何が続いても、行を書かれたままにします。
- 最後のディレクティブの後に幅のある空白があるときは、
  その前に空白やタブがあっても、その後に何が続いても、行を書かれたままにします。
  テキストの中にディレクティブのある値も、書かれたままです。

最後のディレクティブの後にコメントが続き、
テキストとコメントの間に U+2028 も U+2029 もなく、行が未決でなく、
項目 5 と 6 のどちらにも当たらないときは、
それぞれのディレクティブの前とコメントの前の空白とタブの連なりを、
空白 1 つで印字します。
（[同じに描かれるキーワードの後のテキスト
](./compatibility.ja.md#同じに描かれるキーワードの後のテキスト)）。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
同じ行の何かの後ろにあるコメントの前に空白 1 つを与えます。
Prettier が `x = 1;   // c` を `x = 1; // c` と印字する形です。

[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
Prettier が行末に空白を残さないのと同じく、行末の空白を除きます（項目 1）。
ほかの項目は、規則が決めない隙間と文字について、
リリース済みの版が印字する形を述べています。
ほかの図の種類が違う形で印字する形は、決まるまでそのまま残します。
（[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)）。

テキストの中に U+2028 か U+2029 があるとき、または値がディレクティブだけで、
行が未決でないときは、
最後のディレクティブの後に空白かタブが続けば（その後が行末でもコメントでも）、
またはディレクティブの間に空白かタブがあれば、行を書かれたままにし、
項目 3 は適用しません。
どちらでもなければ、ほかの項目が、
ほかのテキストの行を印字するのと同じに印字するので、
ディレクティブの前の空白とタブの連なり（キーワードの後のものも）はそれぞれ空白 1
つになります。

未決の行は述べません。
そこでは出力が、`;` と U+2028 か U+2029 の両側の文字ごとに決まり、
規則 1 はこれらの隙間の印を挙げず、図の種類も同じには印字しません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
コメントの中の `;` も行を未決にします。
Wardley はそのような行を書かれたままにするからです。
整形が投げる行は、そこでは述べません。

`;` があってディレクティブのない `accTitle:` や `accDescr:` の行は、
最後の `;` までを書かれたままにします（コロンの前の隙間も同じです。
行に `style` も `classDef` もなく、最後の `;` がコメントの外にあって、
その後が空白とタブだけで、行に U+2028 も U+2029 もないとき）。
最後の `;` の後の空白とタブは除きます（`accTitle : T;` と `accDescr:   A   B;`
は変わりません）。
`;` があってディレクティブのないほかの行は述べません。
そこでリリース済みの版が印字する形は、
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
のとおり、決めるまでそのままです。
ただし `style` か `classDef` のある行は、
[セミコロン](#セミコロン)の節が述べます。

[fixture: accessibility/acc-directives-end-blanks-dropped]
[fixture: accessibility/acc-directives-end-tabs-dropped]
[fixture: accessibility/acc-directives-in-the-text-kept]
[fixture: accessibility/acc-directives-then-comment]
[fixture: accessibility/acctitle-directives-end-at-the-end-of-the-text]
[fixture: accessibility/accdescr-directives-end-at-the-end-of-the-text]
[fixture: accessibility/acc-directives-end-before-comment-line-and-empty-line]
[fixture: wardley/accessibility/access-lines]
[fixture: wardley/accessibility/access-empty]
[fixture: wardley/accessibility/access-colon-touching]
[test: a no-break space after the last directive of an accTitle line of a Wardley map]
[test: a no-break space before the directive that ends an accTitle line of a Wardley map]
[test: a no-break space after the last directive of an accDescr line of a Wardley map]
[test: a no-break space before the directive that ends an accDescr line of a Wardley map]
[test: U+2028 before the directive that ends an accTitle line of a Wardley map]
[test: a no-break space before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: the gap before the colon of an accTitle line with a no-break space after its last directive of a Wardley map]
[test: U+3000 after the last directive of an accTitle line of a Wardley map]
[test: U+2028 after the last directive of an accTitle line of a Wardley map]
[test: U+2029 after the last directive of an accTitle line of a Wardley map]
[test: U+3000 before the directive that ends an accTitle line of a Wardley map]
[test: U+2029 before the directive that ends an accTitle line of a Wardley map]
[test: U+3000 after the last directive of an accDescr line of a Wardley map]
[test: U+2028 after the last directive of an accDescr line of a Wardley map]
[test: U+2029 after the last directive of an accDescr line of a Wardley map]
[test: U+3000 before the directive that ends an accDescr line of a Wardley map]
[test: U+2028 before the directive that ends an accDescr line of a Wardley map]
[test: U+2029 before the directive that ends an accDescr line of a Wardley map]
[test: a no-break space before a directive that a space and a comment follow in an accTitle line of a Wardley map]
[test: U+2028 before the last directive, a space and a tab after it, in an accTitle line of a Wardley map]
[test: U+2029 before the last directive, a space and a tab after it, in an accTitle line of a Wardley map]
[test: a space, a tab, and a no-break space after the last directive of an accTitle line of a Wardley map]
[test: a space, a tab, and U+3000 after the last directive of an accTitle line of a Wardley map]
[test: the gap before the colon of an accTitle line with U+3000 after its last directive of a Wardley map]
[test: a space, a tab, and U+2028 after the last directive of an accTitle line of a Wardley map]
[test: the gap before the colon of an accTitle line with U+2028 after its last directive of a Wardley map]
[test: a space, a tab, and U+2029 after the last directive of an accTitle line of a Wardley map]
[test: the gap before the colon of an accTitle line with U+2029 after its last directive of a Wardley map]
[test: a semicolon before the directive of an accTitle line of a Wardley map, spaces after it]
[test: a semicolon and spaces before the directive that ends an accTitle line of a Wardley map]
[test: a semicolon after the last directive of an accTitle line of a Wardley map, spaces around it]
[test: U+2028 before the last directive, a space and a tab after it, in an accDescr line of a Wardley map]
[test: U+2029 before the last directive, a space and a tab after it, in an accDescr line of a Wardley map]
[test: a space, a tab, and a no-break space after the last directive of an accDescr line of a Wardley map]
[test: the gap before the colon of an accDescr line with a no-break space after its last directive of a Wardley map]
[test: a space, a tab, and U+3000 after the last directive of an accDescr line of a Wardley map]
[test: the gap before the colon of an accDescr line with U+3000 after its last directive of a Wardley map]
[test: a space, a tab, and U+2028 after the last directive of an accDescr line of a Wardley map]
[test: the gap before the colon of an accDescr line with U+2028 after its last directive of a Wardley map]
[test: a space, a tab, and U+2029 after the last directive of an accDescr line of a Wardley map]
[test: the gap before the colon of an accDescr line with U+2029 after its last directive of a Wardley map]
[test: a semicolon before the directive of an accDescr line of a Wardley map, spaces after it]
[test: a semicolon and spaces before the directive that ends an accDescr line of a Wardley map]
[test: a semicolon after the last directive of an accDescr line of a Wardley map, spaces around it]
[test: a semicolon before the directive of an accTitle line of a Wardley map, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in an accTitle line of a Wardley map]
[test: a comment that ends with a semicolon after the last directive of an accTitle line of a Wardley map]
[test: a comment that has a space before its semicolon after the last directive of an accTitle line of a Wardley map]
[test: a comment that starts with a semicolon after the last directive of an accTitle line of a Wardley map]
[test: a semicolon before the directive of an accDescr line of a Wardley map, a space and a comment after it]
[test: a semicolon and spaces before a directive that a comment touches in an accDescr line of a Wardley map]
[test: a comment that ends with a semicolon after the last directive of an accDescr line of a Wardley map]
[test: a comment that has a space before its semicolon after the last directive of an accDescr line of a Wardley map]
[test: a comment that starts with a semicolon after the last directive of an accDescr line of a Wardley map]
[test: U+3000 before a directive that a space and a comment follow in an accTitle line of a Wardley map]
[test: the gap before the colon of an accTitle line with U+2028 before the last directive, a space and a tab after it of a Wardley map]
[test: the gap before the colon of an accTitle line with U+2029 before the last directive, a space and a tab after it of a Wardley map]
[test: the gap before the colon of an accTitle line with a semicolon before the directive, spaces after it of a Wardley map]
[test: the gap before the colon of an accTitle line with a semicolon and spaces before the directive that ends it of a Wardley map]
[test: the gap before the colon of an accTitle line with a semicolon after the last directive of a Wardley map]
[test: the gap before the colon of an accTitle line with a space, a tab, and a no-break space after the last directive of a Wardley map]
[test: the gap before the colon of an accTitle line with a space, a tab, and U+3000 after the last directive of a Wardley map]
[test: the gap before the colon of an accTitle line with a space, a tab, and U+2028 after the last directive of a Wardley map]
[test: the gap before the colon of an accTitle line with a space, a tab, and U+2029 after the last directive of a Wardley map]
[test: a semicolon that the line rule ignores before the directive of an accTitle line of a Wardley map, spaces after it]
[test: U+3000 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: the gap before the colon of an accDescr line with U+2028 before the last directive, a space and a tab after it of a Wardley map]
[test: the gap before the colon of an accDescr line with U+2029 before the last directive, a space and a tab after it of a Wardley map]
[test: the gap before the colon of an accDescr line with a semicolon before the directive, spaces after it of a Wardley map]
[test: the gap before the colon of an accDescr line with a semicolon and spaces before the directive that ends it of a Wardley map]
[test: the gap before the colon of an accDescr line with a semicolon after the last directive of a Wardley map]
[test: the gap before the colon of an accDescr line with a space, a tab, and a no-break space after the last directive of a Wardley map]
[test: the gap before the colon of an accDescr line with a space, a tab, and U+3000 after the last directive of a Wardley map]
[test: the gap before the colon of an accDescr line with a space, a tab, and U+2028 after the last directive of a Wardley map]
[test: the gap before the colon of an accDescr line with a space, a tab, and U+2029 after the last directive of a Wardley map]
[test: a semicolon that the line rule ignores before the directive of an accDescr line of a Wardley map, spaces after it]
[test: a semicolon that the line rule ignores and spaces before the directive that ends an accTitle line of a Wardley map]
[test: a semicolon that the line rule ignores and spaces before the directive that ends an accDescr line of a Wardley map]
[test: the gap before the colon of an accTitle line that holds only `a;` of a Wardley map]
[test: the gap before the colon of an accDescr line that holds only `a;` of a Wardley map]
[test: the gap before the colon of an accTitle line that holds only `style:#x;` of a Wardley map]
[test: the gap before the colon of an accTitle line with a semicolon inside the directive, spaces after it, of a Wardley map]
[test: the gap before the colon of an accDescr line with a semicolon inside the directive that ends it, of a Wardley map]
[test: a semicolon inside the directive of an accDescr line, spaces and a comment after it, of a Wardley map]
[test: a semicolon inside the directive that ends an accTitle line, spaces before it, of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, a tab and a directive after them, in an accTitle line of a Wardley map]
[test: spaces and a second semicolon after the semicolon that the line rule ignores, a directive after them, in an accTitle line of a Wardley map]
[test: a second semicolon touching the semicolon that the line rule ignores, spaces and a directive after them, in an accDescr line of a Wardley map]
[test: U+2029 and a directive after the semicolon that the line rule ignores, in an accTitle line of a Wardley map]
[test: U+2028 and a directive after the semicolon that the line rule ignores, in an accDescr line of a Wardley map]
[test: a no-break space and a directive after the semicolon that the line rule ignores, in an accDescr line of a Wardley map]
[test: a tab before the text of a title that ends with a semicolon, of a Wardley map]
[test: spaces before the text of an accTitle line that ends with a semicolon, of a Wardley map]
[test: no gap before the text of an accTitle line that ends with a semicolon, of a Wardley map]
[test: a tab before the text of an accDescr line that ends with a semicolon, of a Wardley map]
[test: the gap before the colon of an accTitle line that ends with a semicolon, of a Wardley map]
[test: the gap before the colon of an accDescr line with a semicolon inside the last of two directives, of a Wardley map]
[test: U+000B before the directive that ends an accTitle line of a Wardley map]
[test: U+000B before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+000B after the last directive of an accTitle line of a Wardley map]
[test: U+000B after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+000C before the directive that ends an accTitle line of a Wardley map]
[test: U+000C before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+000C after the last directive of an accTitle line of a Wardley map]
[test: U+000C after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: a no-break space after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+1680 before the directive that ends an accTitle line of a Wardley map]
[test: U+1680 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+1680 after the last directive of an accTitle line of a Wardley map]
[test: U+1680 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2000 before the directive that ends an accTitle line of a Wardley map]
[test: U+2000 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2000 after the last directive of an accTitle line of a Wardley map]
[test: U+2000 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2001 before the directive that ends an accTitle line of a Wardley map]
[test: U+2001 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2001 after the last directive of an accTitle line of a Wardley map]
[test: U+2001 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2002 before the directive that ends an accTitle line of a Wardley map]
[test: U+2002 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2002 after the last directive of an accTitle line of a Wardley map]
[test: U+2002 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2003 before the directive that ends an accTitle line of a Wardley map]
[test: U+2003 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2003 after the last directive of an accTitle line of a Wardley map]
[test: U+2003 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2004 before the directive that ends an accTitle line of a Wardley map]
[test: U+2004 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2004 after the last directive of an accTitle line of a Wardley map]
[test: U+2004 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2005 before the directive that ends an accTitle line of a Wardley map]
[test: U+2005 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2005 after the last directive of an accTitle line of a Wardley map]
[test: U+2005 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2006 before the directive that ends an accTitle line of a Wardley map]
[test: U+2006 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2006 after the last directive of an accTitle line of a Wardley map]
[test: U+2006 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2007 before the directive that ends an accTitle line of a Wardley map]
[test: U+2007 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2007 after the last directive of an accTitle line of a Wardley map]
[test: U+2007 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2008 before the directive that ends an accTitle line of a Wardley map]
[test: U+2008 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2008 after the last directive of an accTitle line of a Wardley map]
[test: U+2008 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+2009 before the directive that ends an accTitle line of a Wardley map]
[test: U+2009 before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+2009 after the last directive of an accTitle line of a Wardley map]
[test: U+2009 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+200A before the directive that ends an accTitle line of a Wardley map]
[test: U+200A before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+200A after the last directive of an accTitle line of a Wardley map]
[test: U+200A after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+202F before the directive that ends an accTitle line of a Wardley map]
[test: U+202F before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+202F after the last directive of an accTitle line of a Wardley map]
[test: U+202F after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+205F before the directive that ends an accTitle line of a Wardley map]
[test: U+205F before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+205F after the last directive of an accTitle line of a Wardley map]
[test: U+205F after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+3000 after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: U+FEFF before the directive that ends an accTitle line of a Wardley map]
[test: U+FEFF before a directive that a space and a comment follow in an accDescr line of a Wardley map]
[test: U+FEFF after the last directive of an accTitle line of a Wardley map]
[test: U+FEFF after the last directive and spaces of an accDescr line, spaces after it, of a Wardley map]
[test: a no-break space after the last directive of an accTitle line, a comment touching it, of a Wardley map]
[test: a no-break space after the last directive of an accDescr line, spaces and a comment after it, of a Wardley map]
[test: U+2003 after the last directive of an accTitle line, a comment touching it, of a Wardley map]
[test: U+2003 after the last directive of an accDescr line, spaces and a comment after it, of a Wardley map]
[test: a semicolon in the text, two directives with spaces between them, an accTitle line, of a Wardley map]
[test: a semicolon in the text, two directives that touch, spaces before them, an accTitle line, of a Wardley map]
[test: a semicolon inside the first of two directives, a space between them, an accDescr line, of a Wardley map]
[test: a semicolon inside the last of two directives, spaces after it, an accDescr line, of a Wardley map]
[test: a semicolon inside the last of two directives that end an accTitle line, spaces before both, of a Wardley map]
[test: a semicolon that touches two directives in an accTitle line, of a Wardley map]
[test: a semicolon after the last of two directives in an accDescr line, spaces around it and a comment after it, of a Wardley map]
[test: a semicolon in the text, a no-break space after the last directive, an accTitle line, of a Wardley map]
[test: a semicolon inside the directive, a no-break space after it, an accDescr line, of a Wardley map]
[test: U+000B before two directives that touch and end an accTitle line of a Wardley map]
[test: U+000C before two directives that touch and end an accTitle line of a Wardley map]
[test: a no-break space before two directives that touch and end an accTitle line of a Wardley map]
[test: U+1680 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2000 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2001 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2002 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2003 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2004 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2005 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2006 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2007 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2008 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2009 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+200A before two directives that touch and end an accTitle line of a Wardley map]
[test: U+202F before two directives that touch and end an accTitle line of a Wardley map]
[test: U+205F before two directives that touch and end an accTitle line of a Wardley map]
[test: U+3000 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+FEFF before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2028 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+2029 before two directives that touch and end an accTitle line of a Wardley map]
[test: U+000B before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+000B before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+000C before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+000C before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: a no-break space before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: a no-break space before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+1680 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+1680 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2000 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2000 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2001 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2001 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2002 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2002 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2003 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2003 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2004 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2004 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2005 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2005 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2006 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2006 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2007 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2007 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2008 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2008 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2009 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2009 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+200A before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+200A before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+202F before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+202F before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+205F before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+205F before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+3000 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+3000 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+FEFF before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+FEFF before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2028 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2028 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2029 before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2029 before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+000B between two directives that end an accTitle line of a Wardley map]
[test: U+000B between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+000C between two directives that end an accTitle line of a Wardley map]
[test: U+000C between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: a no-break space between two directives that end an accTitle line of a Wardley map]
[test: a no-break space between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+1680 between two directives that end an accTitle line of a Wardley map]
[test: U+1680 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2000 between two directives that end an accTitle line of a Wardley map]
[test: U+2000 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2001 between two directives that end an accTitle line of a Wardley map]
[test: U+2001 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2002 between two directives that end an accTitle line of a Wardley map]
[test: U+2002 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2003 between two directives that end an accTitle line of a Wardley map]
[test: U+2003 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2004 between two directives that end an accTitle line of a Wardley map]
[test: U+2004 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2005 between two directives that end an accTitle line of a Wardley map]
[test: U+2005 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2006 between two directives that end an accTitle line of a Wardley map]
[test: U+2006 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2007 between two directives that end an accTitle line of a Wardley map]
[test: U+2007 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2008 between two directives that end an accTitle line of a Wardley map]
[test: U+2008 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2009 between two directives that end an accTitle line of a Wardley map]
[test: U+2009 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+200A between two directives that end an accTitle line of a Wardley map]
[test: U+200A between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+202F between two directives that end an accTitle line of a Wardley map]
[test: U+202F between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+205F between two directives that end an accTitle line of a Wardley map]
[test: U+205F between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+3000 between two directives that end an accTitle line of a Wardley map]
[test: U+3000 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+FEFF between two directives that end an accTitle line of a Wardley map]
[test: U+FEFF between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2028 between two directives that end an accTitle line of a Wardley map]
[test: U+2028 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: U+2029 between two directives that end an accTitle line of a Wardley map]
[test: U+2029 between two directives, spaces after the last, in an accDescr line of a Wardley map]
[test: a no-break space between two directives, a comment touching the last, in an accTitle line of a Wardley map]
[test: a no-break space between two directives, a space and a comment after the last, in an accTitle line of a Wardley map]
[test: a no-break space between two directives, spaces and a comment after the last, in an accTitle line of a Wardley map]
[test: U+2003 between two directives, a comment touching the last, in an accTitle line of a Wardley map]
[test: U+2003 between two directives, a space and a comment after the last, in an accTitle line of a Wardley map]
[test: U+2003 between two directives, spaces and a comment after the last, in an accTitle line of a Wardley map]
[test: a run before the directive after a U+2028 inside the text of an accTitle line of a Wardley map]
[test: spaces after the directive after a U+2028 inside the text of an accTitle line of a Wardley map]
[test: spaces after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: a tab after the last semicolon of an accDescr line, no directive, of a Wardley map]
[test: spaces after the semicolon that the line rule ignores, no directive, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a semicolon inside a comment after the text of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: a semicolon inside a comment after the text of an accDescr line, no directive, of a Wardley map]
[test: U+000B before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+000C before a directive that a comment touches in an accTitle line of a Wardley map]
[test: a no-break space before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+1680 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2000 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2001 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2002 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2003 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2004 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2005 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2006 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2007 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2008 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+2009 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+200A before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+202F before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+205F before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+3000 before a directive that a comment touches in an accTitle line of a Wardley map]
[test: U+FEFF before a directive that a comment touches in an accTitle line of a Wardley map]
[test: a no-break space and spaces before a directive that a comment touches in an accTitle line of a Wardley map]
[test: a no-break space and a tab before the directive that ends an accTitle line of a Wardley map]
[test: U+000B and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+000C and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: a no-break space and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+1680 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2000 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2001 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2002 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2003 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2004 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2005 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2006 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2007 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2008 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+2009 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+200A and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+202F and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+205F and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+3000 and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: U+FEFF and spaces before the first of two directives that spaces separate, in an accTitle line of a Wardley map]
[test: a no-break space and a tab before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: a no-break space before the first of two directives that a tab separates, in an accTitle line of a Wardley map]
[test: U+2003 and a tab before the first of two directives that a space separates, in an accTitle line of a Wardley map]
[test: U+2003 before the first of two directives that a tab separates, in an accTitle line of a Wardley map]
[test: U+2028 before the first of two directives that a tab separates, in an accTitle line of a Wardley map]
[test: U+2029 before the first of two directives that a tab separates, in an accTitle line of a Wardley map]
[test: a U+2028 inside the directive that ends an accTitle line, spaces before it, of a Wardley map]
[test: a U+2028 inside the directive that ends an accTitle line, spaces after it, of a Wardley map]
[test: a U+2029 inside the directive that ends an accTitle line, spaces before it, of a Wardley map]
[test: a U+2029 inside the directive that ends an accTitle line, spaces after it, of a Wardley map]
[test: a line break inside the directive that ends an accTitle line, spaces before it, of a Wardley map]
[test: a line break inside the directive that ends an accTitle line, spaces after it, of a Wardley map]
[test: a U+2028 inside the directive that ends an accDescr line, spaces before it, of a Wardley map]
[test: a U+2028 inside the directive that ends an accDescr line, spaces after it, of a Wardley map]
[test: a U+2029 inside the directive that ends an accDescr line, spaces before it, of a Wardley map]
[test: a U+2029 inside the directive that ends an accDescr line, spaces after it, of a Wardley map]
[test: a line break inside the directive that ends an accDescr line, spaces before it, of a Wardley map]
[test: a line break inside the directive that ends an accDescr line, spaces after it, of a Wardley map]
[test: U+000B between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+000C between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: a no-break space between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+1680 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2000 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2001 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2002 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2003 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2004 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2005 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2006 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2007 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2008 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+2009 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+200A between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+202F between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+205F between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+3000 between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: U+FEFF between the colon and the directive of an accTitle line of directives only of a Wardley map]
[test: a directive that touches the keyword of a title of directives only of a Wardley map]
[test: the gap before the colon of an accDescr line of directives only of a Wardley map]
[test: spaces after the directive of an accDescr line of directives only of a Wardley map]
[test: spaces between two directives after a U+2028 inside the text of an accTitle line of a Wardley map]
[test: spaces after the directive after a U+2029 inside the text of an accTitle line of a Wardley map]
[test: a run before the directive after a U+2029 inside the text of an accTitle line of a Wardley map]
[test: a run before two directives that touch after a U+2028 inside the text of an accTitle line of a Wardley map]
[test: spaces between two directives after a U+2028 inside the text of an accDescr line of a Wardley map]
[test: spaces after the directive after a U+2029 inside the text of an accDescr line of a Wardley map]
[test: a run before the directive after a U+2029 inside the text of an accDescr line of a Wardley map]
[test: a run before two directives that touch after a U+2028 inside the text of an accDescr line of a Wardley map]
[test: released output that the document does not state: U+000B after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+000C after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: a no-break space after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+1680 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2000 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2001 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2002 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2003 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2004 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2005 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2006 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2007 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2008 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2009 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+200A after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+202F after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+205F after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+3000 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+FEFF after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2028 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: U+2029 after the last semicolon of an accTitle line, no directive, of a Wardley map]
[test: released output that the document does not state: spaces between the last semicolon of an accDescr line and a comment, no directive, of a Wardley map]
[test: a wide space before two directives that spaces separate, in an accDescr line of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, in an accTitle line of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that touch, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces follow, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that spaces separate, in an accDescr line of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, in an accDescr line of a Wardley map]
[test: a value of directives only, spaces after the directive, in an accTitle line of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, in an accTitle line of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, in an accDescr line of a Wardley map]
[test: a `;` and no directive, in an accTitle line of a Wardley map]
[test: a `;` and no directive, in an accDescr line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accTitle is a space, in an accTitle line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accTitle is a tab, in an accTitle line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accDescr is a space, in an accDescr line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accDescr is a tab, in an accDescr line of a Wardley map]
[test: a `;` in the text, spaces between two directives, in an accDescr line of a Wardley map]
[test: a `;` between two directives, spaces around it, in an accTitle line of a Wardley map]
[test: a `;` between two directives, spaces around it, in an accDescr line of a Wardley map]
[test: a `;` after the last directive, in an accTitle line of a Wardley map]
[test: a `;` after the last directive, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, the gap before the colon of accTitle is a space, a U+2028 stands before the text, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 stands before the text of accTitle, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, the gap before the colon of accDescr is a space, a U+2028 stands before the text, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 stands before the text of accDescr, in an accDescr line of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, in an accTitle line of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, in an accDescr line of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, in an accTitle line of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a space stand before the text of accTitle, the gap before the colon is a space, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and two spaces stand before the text of accTitle, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a space stand before the text of accDescr, the gap before the colon is a space, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and two spaces stand before the text of accDescr, in an accDescr line of a Wardley map]
[test: two U+2028 before the directive that ends an accTitle line, of a Wardley map]
[test: U+2029 and U+2028 before the directive that ends an accDescr line, of a Wardley map]
[test: two U+2028 before the directive that ends an accTitle line, spaces after it, of a Wardley map]
[test: two U+2029 before a directive that a space and another directive follow in an accDescr line, of a Wardley map]
[test: a U+2028 inside the directive that ends an accDescr line, spaces before it, a comment after two spaces, of a Wardley map]
[test: a line break inside the directive that ends an accTitle line, a comment after two spaces, of a Wardley map]
[test: a directive that starts the text of a title, tabs before and after it, of a Wardley map]
[test: a directive that touches the keyword of a title, a space and a text after it, of a Wardley map]
[test: a directive that touches the colon of an accTitle line, a space and a text after it, of a Wardley map]
[test: a directive that starts the text of an accTitle line, two spaces and a text after it, spaces at the end, of a Wardley map]
[test: a directive that starts the text of an accDescr line, two spaces and a text after it, spaces at the end, of a Wardley map]
[test: a `;` at the end of a title, a tab after the keyword, spaces after the `;`, of a Wardley map]
[test: a `;` at the end of an accDescr line, a run of spaces inside the text, of a Wardley map]
[test: a `;` at the end of an accTitle line, a tab after the colon, spaces after the `;`, of a Wardley map]
[test: a `;` at the end of an accDescr line, a gap before the colon, of a Wardley map]
[test: a comment after the text of an accTitle line, spaces before it, of a Wardley map]
[test: a comment after the text of an accDescr line, spaces before it, of a Wardley map]
[test: a run of spaces inside the text of an accDescr line, of a Wardley map]
[test: a run of spaces inside the text of an accTitle line, of a Wardley map]
[test: a run of spaces inside a quoted string in an accDescr line, of a Wardley map]
[test: text after the `;` that the line rule ignores in an accDescr line, runs before and after it, of a Wardley map]
[test: nothing after the `;` that the line rule ignores in an accDescr line, runs before it, of a Wardley map]
[test: two touching `;` that the line rule reads in an accDescr line, a run before them, of a Wardley map]
[test: text after the `;` that the line rule ignores in an accTitle line, of a Wardley map]
[test: released output that the document does not state: a `;` inside the comment at the end of an accTitle line, a gap before the colon, spaces at the end, of a Wardley map]
[test: a gap before and after the colon of an accTitle line, nothing after the `;` that the line rule ignores, of a Wardley map]
[test: U+2028 before a directive that a comment touches, a line follows, in an accTitle line of a Wardley map]
[test: U+2028 before a directive that a comment touches, the text ends, in an accTitle line of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, a line follows, in an accTitle line of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, the text ends, in an accTitle line of a Wardley map]
[test: U+2029 before a directive that a comment touches, a line follows, in an accTitle line of a Wardley map]
[test: U+2029 before a directive that a comment touches, the text ends, in an accTitle line of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, a line follows, in an accTitle line of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, the text ends, in an accTitle line of a Wardley map]
[test: U+2028 before a directive that a comment touches, a line follows, in an accDescr line of a Wardley map]
[test: U+2028 before a directive that a comment touches, the text ends, in an accDescr line of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, a line follows, in an accDescr line of a Wardley map]
[test: U+2028 before a directive that a comment follows after spaces, the text ends, in an accDescr line of a Wardley map]
[test: U+2029 before a directive that a comment touches, a line follows, in an accDescr line of a Wardley map]
[test: U+2029 before a directive that a comment touches, the text ends, in an accDescr line of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, a line follows, in an accDescr line of a Wardley map]
[test: U+2029 before a directive that a comment follows after spaces, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 inside the text, a directive, and a comment after spaces, in an accTitle line of a Wardley map]
[test: a U+2028 inside the text, a directive that a comment touches, in an accTitle line of a Wardley map]
[test: a U+2029 inside the text, a directive, and a comment after spaces, in an accDescr line of a Wardley map]
[test: a U+2028 inside the text, two directives that touch, and a comment after spaces, in an accDescr line of a Wardley map]
[test: a wide space before two directives that spaces separate, the text ends, in an accTitle line of a Wardley map]
[test: a wide space before two directives that spaces separate, the text ends, in an accDescr line of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the text ends, in an accTitle line of a Wardley map]
[test: a wide space before a directive that spaces and a comment follow, the text ends, in an accDescr line of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the text ends, in an accTitle line of a Wardley map]
[test: a wide space before two directives that touch and a comment that touches the last, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that touch, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that touch, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces follow, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that spaces separate, the text ends, in an accDescr line of a Wardley map]
[test: a directive that holds a line break, spaces before it, the text ends, in an accTitle line of a Wardley map]
[test: a directive that holds a line break, spaces before it, the text ends, in an accDescr line of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, the text ends, in an accTitle line of a Wardley map]
[test: a directive that holds a U+2028, spaces before it, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 inside the text, spaces before the directive, the text ends, in an accDescr line of a Wardley map]
[test: a value of directives only, spaces after the directive, the text ends, in an accTitle line of a Wardley map]
[test: a value of directives only, spaces after the directive, the text ends, in an accDescr line of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, the text ends, in an accTitle line of a Wardley map]
[test: a directive inside the text, spaces before and after the last directive, the text ends, in an accDescr line of a Wardley map]
[test: a `;` and no directive, the text ends, in an accTitle line of a Wardley map]
[test: a `;` and no directive, the text ends, in an accDescr line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accTitle is a space, the text ends, in an accTitle line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accTitle is a tab, the text ends, in an accTitle line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accDescr is a space, the text ends, in an accDescr line of a Wardley map]
[test: a `;` and no directive, the gap before the colon of accDescr is a tab, the text ends, in an accDescr line of a Wardley map]
[test: a `;` in the text, spaces before the directive, the text ends, in an accTitle line of a Wardley map]
[test: a `;` in the text, spaces before the directive, the text ends, in an accDescr line of a Wardley map]
[test: a `;` in the text, spaces between two directives, the text ends, in an accTitle line of a Wardley map]
[test: a `;` in the text, spaces between two directives, the text ends, in an accDescr line of a Wardley map]
[test: a `;` between two directives, spaces around it, the text ends, in an accTitle line of a Wardley map]
[test: a `;` between two directives, spaces around it, the text ends, in an accDescr line of a Wardley map]
[test: a `;` after the last directive, the text ends, in an accTitle line of a Wardley map]
[test: a `;` after the last directive, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of whitespace follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an empty line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of whitespace follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an empty line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of whitespace follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an empty line and a statement follow, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, the gap before the colon of accTitle is a space, a U+2028 stands before the text, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 stands before the text of accTitle, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, the gap before the colon of accDescr is a space, a U+2028 stands before the text, the text ends, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 stands before the text of accDescr, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and spaces follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, two directives that touch follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a directive and a comment on a line follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a no-break space follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, a line of a tab follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that spaces and a comment follow, an indented comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and spaces follow, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, two directives that touch follow, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a directive and a comment on a line follow, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a no-break space follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, a line of a tab follows, in an accDescr line of a Wardley map]
[test: a U+2028 before two directives that a wide space separates, a comment after them, an indented comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and spaces follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, two directives that touch follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a directive and a comment on a line follow, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a no-break space follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, a line of a tab follows, in an accDescr line of a Wardley map]
[test: a U+2028 before a directive that a wide space and a comment follow, an indented comment line follows, in an accDescr line of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the text ends, in an accTitle line of a Wardley map]
[test: a `;` after the last directive, a U+2028 before the directives, a comment after it, the text ends, in an accDescr line of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the text ends, in an accTitle line of a Wardley map]
[test: a `;` between two directives, a U+2028 before the directives, a comment after them, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line follows, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a line of whitespace follows, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, a comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 after the last directive that spaces and a comment follow, an empty line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, the text ends, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line follows, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line follows, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a line of whitespace follows, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a directive line follows, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, a comment line and a statement follow, in an accDescr line of a Wardley map]
[test: a U+2028 between two directives, spaces and a comment after the last one, an empty line and a statement follow, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a space stand before the text of accTitle, the gap before the colon is a space, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and two spaces stand before the text of accTitle, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2028 and a space stand before the text of accDescr, the gap before the colon is a space, the text ends, in an accDescr line of a Wardley map]
[test: released output that the document does not state: a `;` and no directive, a U+2029 and two spaces stand before the text of accDescr, the text ends, in an accDescr line of a Wardley map]
[test: a directive that two spaces follow, before a comment line after a U+2028 before a directive, the text ends, in an accTitle line of a Wardley map]
[test: a directive that two spaces follow, before a comment line after a U+2028 before a directive, the text ends, in an accDescr line of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, the text ends, in an accTitle line of a Wardley map]
[test: U+2028 between two directives and after the last, a comment follows after spaces, the text ends, in an accDescr line of a Wardley map]
[test: U+2028 between two directives and after the last, two spaces after the first, a comment touches the last U+2028, the text ends, in an accTitle line of a Wardley map]
[test: U+2028 between two directives and after the last, two spaces after the first, a comment touches the last U+2028, the text ends, in an accDescr line of a Wardley map]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, the text ends, in an accTitle line of a Wardley map]
[test: U+2028 between the first and the second of three directives and between the second and the third, a comment follows the third after a space, the text ends, in an accDescr line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a `;` before a U+2028, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a `;` after the U+2028, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accDescr with a gap before the colon, a `;` before a U+2028, the text ends, in an accDescr line of a Wardley map]
[test: released output that the document does not state: accDescr with a gap before the colon, a `;` after the U+2028, the text ends, in an accDescr line of a Wardley map]
[test: accTitle with a gap before the colon, a `;` inside a directive that touches the text, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a `;` inside a comment after the text, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a `;` right after the colon and a U+2028 after it, the text ends, in an accTitle line of a Wardley map]
[test: a `;` before the U+2028 between two directives, a comment follows the last directive after two spaces, the text ends, in an accTitle line of a Wardley map]
[test: two U+2028 with two spaces on each side between two directives, a comment follows the last directive after two spaces, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a U+2028 before a `;`, and a second U+2028 after the `;`, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accDescr with a gap before the colon, a U+2028 before a `;`, and a second U+2028 after the `;`, the text ends, in an accDescr line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a `;` before two U+2028, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a `;` inside a directive that a U+2028 follows, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a `;` inside a comment that a U+2028 follows, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and a `;` after it inside the same directive, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and no `;`, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a U+2028 inside a directive and a `;` inside a directive after it, the text ends, in an accTitle line of a Wardley map]
[test: released output that the document does not state: accTitle with a gap before the colon, a U+2028 inside a comment and a `;` after it in the comment, the text ends, in an accTitle line of a Wardley map]
[test: accTitle with a gap before the colon, a U+2028 inside a comment and no `;`, the text ends, in an accTitle line of a Wardley map]
[test: a U+2028 between the text and a directive, a U+2028 between the directive and the comment, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a comment follows after two spaces, an empty line and a statement follow, in an accTitle line of a Wardley map]
[test: a U+2028 before a directive that a comment follows after two spaces, a comment line follows, in an accTitle line of a Wardley map]
[test: a comment after the last directive after two spaces, a comment line that holds a `;` follows, in an accTitle line of a Wardley map]

1 行の説明ブロックは、
[1 行の説明ブロック](./compatibility.ja.md#1-行の説明ブロック) に従います。

[fixture: wardley/accessibility/description-tight]
[fixture: wardley/accessibility/description-edges]
[fixture: wardley/accessibility/description-opener-newline]

波括弧を保つブロックでは、キーワードと `{` が接して書かれていても、
間を通常の空白 1 つで区切ります。
空白だけの内部は、囲むテキストがないため `{}` にします。
キーワードと開始括弧の間が空白だけなら同じ行にまとめます。
独立した行の `}` は文と同じ段に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、この深さを与えます。
閉じる行を `{` のある行と同じ段に置く形で、
Prettier がブロックを閉じる行を印字する形です。
`{` のある行は、`accDescr` の行か、
`{` の前にコメントかディレクティブがあるときは、文と同じ段の後の行です。

[fixture: wardley/accessibility/brace-on-a-later-line]

[fixture: wardley/accessibility/description-empty]

コメントやディレクティブの後の `{` を持つ行は、文と同じ段に置きます。
ほかの図の種類のうちこの形を受け付ける 23 種類では、c4、class、er、flowchart、
gantt、journey、quadrant、requirement、sequence、state、timeline、xychart は、
コメントの行と同じく 1 段深く置きます。
architecture、cynefin、gitgraph、info、ishikawa、packet、pie、radar、railroad、
treemap、treeview は、文と同じ段に置きます。
規則 2 はこの形を 1 つに決めないので、決まるまで公開版の形を残します。

[fixture: wardley/accessibility/description-opener-comment-line]

保護された注釈とセミコロンの配置では、隙間を保ちます。
通常の説明本文と独立したコメント行は文より 1 段深くそろえます。
Db で LF 後の字下げが取り除かれるためです。
テキストのあるブロックの行の間のディレクティブの行も、文より 1 段深く置きます。
[quadrant](./quadrant.ja.md#title-とアクセシビリティの文)も、
そのようなブロックの本文を同じに字下げします。
改行と内部の空行は保ちます。
行末の空白は、テキストの最後の行のものを除いて保ちます。
空白だけの行は空行にします。
最後のテキスト行の行末の空白は、閉じ括弧が自分の行にあるときは落とし、
同じ行で閉じ括弧が続くときは空白 1 つで印字します。
ディレクティブと共有処理で取り除かれるコメント領域は、
ディレクティブだけを含むブロックでも原文全体を保ちます。
注釈は共有の継続行の配置を保ちます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
コメント行だけのブロックでも、説明ブロックのコメント行を、
ブロックの内側に 1 段深く置きます。
mermaid.js が字下げを描かない、ブロックの中の行だからです。
`}` は `accDescr` と同じ段に置きます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
Prettier がブロックの閉じ行を開始行と同じ段に印字するのと同じく、
この閉じ行の段を与えます。
`{` のある行は、文の行か、`{` の前にコメントかディレクティブがあるときは、
文と同じ段の後の行です。
ディレクティブのあるブロックの内側は、どの規則も与えません。
[flowchart](./flowchart.ja.md#複数行の値)、
[xychart](./xychart.ja.md#空の説明ブロック)、
[quadrant](./quadrant.ja.md#空の説明ブロック)は、その内容と改行を残しますが、
どの文書もこの形に理由を書いておらず、決まっていない形の一覧（D34）の問いです。
そのため、その印字は決まった形ではなく、決まるまでリリース済みの形を残します。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。

[fixture: wardley/accessibility/brace-on-a-later-line]

[fixture: wardley/accessibility/description-closer]
[fixture: wardley/accessibility/description-comment-only]
[fixture: wardley/accessibility/description-directive-only]
[fixture: wardley/accessibility/block-trailing-whitespace]
[fixture: wardley/accessibility/block-trailing-whitespace-closer-on-the-text-line]
[fixture: wardley/accessibility/description-directive-line]

入力（エスケープ表記）:
`"wardley-beta\naccTitle \t:  A  B \t\naccDescr\t:  C  D \t"`

出力
([accessibility/access-lines-output.mmd](../tests/fixtures/wardley/accessibility/access-lines-output.mmd)):

```mmd
wardley-beta
  accTitle: A  B
  accDescr: C D
```

### hidden form

`WardleyIgnoredText` は木の所属先で、範囲の原文を 1 回だけ印字します。
保持前置部分、本文、部品の隙間、pipeline の開き部と本文、後続部分が対象です。
value は共通除去を省くため、それから再構築しません。
読み飛ばす YAML とディレクティブの内部と閉じ記号の列は保ちます。
先に読む文字列と値の内部はその値、失敗した図種固有の形はコメントのままです。
3 つの区切りを含む一致、別々の一致、後の適格な閉じ記号も保ちます。

[fixture: wardley/hidden-forms/hidden-body-directive]

[fixture: wardley/hidden-forms/hidden-body-yaml]

[fixture: wardley/hidden-forms/hidden-keyword-name]

[fixture: wardley/hidden-forms/hidden-coordinate]

[fixture: wardley/hidden-forms/hidden-sign]

[fixture: wardley/hidden-forms/hidden-stage]

[fixture: wardley/hidden-forms/hidden-pipeline-body]

[fixture: wardley/hidden-forms/hidden-three-fences]

[fixture: wardley/hidden-forms/hidden-two-yaml]

[fixture: wardley/hidden-forms/hidden-later-closer]

[fixture: wardley/hidden-forms/hidden-failed-comment]

[corpus fixture: wardley/hidden-all-unit-gaps]

入力（エスケープ表記）:
`"wardley-beta\n%%{!native}%%\ncomponent HiddenBody[0.3,0.6]"`

出力
([hidden-forms/hidden-body-directive-output.mmd](../tests/fixtures/wardley/hidden-forms/hidden-body-directive-output.mmd)):

```mmd
wardley-beta
  %%{!native}%%
  component HiddenBody [0.3, 0.6]
```

[corpus fixture: wardley/hidden-directive-string]

[corpus fixture: wardley/hidden-yaml-string]

[corpus fixture: wardley/hidden-yaml-block]

[corpus fixture: wardley/directive-native-opener-split]

[corpus fixture: wardley/lex-hidden-yaml-comment-region]

### hidden の境界

範囲外で消費する LF、行内の接触、閉じ記号後の空白とタブには、
共有の `hidden-gap` と block 規則を使い、EOF の余白も保ちます。
後続部分が LF を消費したら次の文に予備の可視 LF が必要です。
閉じ記号の余白があれば最初の LF が可視のままになります。
見出しに可視 EOL が不要な例外は、見出し自身の形だけに適用します。
最初の文が同じ行に残っても、その文には本文側の規則を使います。
pipeline の開始記号と子文にも可視 LF を保ちます。
可視 EOL 後の形は本文の項目です。
複数後続部分と YAML の境界を保ち、保護テキストの中に段を足しません。
読み飛ばす構文が見出し行を保つときは、pipeline の開きもその行に保ちます。

[fixture: wardley/hidden-boundaries/meeting-inline-directive-directive]

[fixture: wardley/hidden-boundaries/meeting-inline-directive-yaml]

[fixture: wardley/hidden-boundaries/meeting-directive-only-line-directive]

[fixture: wardley/hidden-boundaries/meeting-directive-only-line-yaml]

[fixture: wardley/hidden-boundaries/meeting-unselected-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-unselected-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-ignored-value-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-ignored-value-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-selected-gap-semicolon-directive]

[fixture: wardley/hidden-boundaries/meeting-selected-gap-semicolon-yaml]

[fixture: wardley/hidden-boundaries/meeting-comment-line-directive]

[fixture: wardley/hidden-boundaries/meeting-comment-line-yaml]

[test: wardley/hidden-boundaries/meeting-ls-in-form-directive]

[test: wardley/hidden-boundaries/meeting-ls-in-form-yaml]

[test: wardley/hidden-boundaries/meeting-ps-in-form-directive]

[test: wardley/hidden-boundaries/meeting-ps-in-form-yaml]

[fixture: wardley/hidden-boundaries/native-child-value]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-opening-directive]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-opening-yaml]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-child-directive]

[fixture: wardley/hidden-boundaries/header-inline-pipeline-child-yaml]

[fixture: wardley/hidden-boundaries/hidden-spare-lf]

[fixture: wardley/hidden-boundaries/hidden-closing-space]

[fixture: wardley/hidden-boundaries/hidden-header-no-spare]

[fixture: wardley/hidden-boundaries/hidden-pipeline-opening]

[fixture: wardley/hidden-boundaries/hidden-pipeline-child]

[fixture: wardley/hidden-boundaries/hidden-eof-space]

[fixture: wardley/hidden-boundaries/yaml-suffix-space]

[fixture: wardley/hidden-boundaries/yaml-suffix-spare]

[fixture: wardley/hidden-boundaries/hidden-after-visible-eol]

[fixture: wardley/hidden-boundaries/hidden-two-suffixes]

[fixture: wardley/hidden-boundaries/header-hidden-spare]

[fixture: wardley/hidden-boundaries/header-first-statement-hidden]

[fixture: wardley/hidden-boundaries/pipeline-opening-space]

[fixture: wardley/hidden-boundaries/pipeline-child-space]

[fixture: wardley/hidden-boundaries/pipeline-after-close]

[fixture: wardley/hidden-boundaries/pipeline-opening-yaml]

[fixture: wardley/hidden-boundaries/pipeline-child-yaml]

[fixture: wardley/hidden-boundaries/pipeline-body-before-close]

入力（エスケープ表記）:
`"wardley-beta\ncomponent Spare[0.3,0.6]%%{!end}%%\n\ncomponent After[0.4,0.7]"`

出力
([hidden-boundaries/hidden-spare-lf-output.mmd](../tests/fixtures/wardley/hidden-boundaries/hidden-spare-lf-output.mmd)):

```mmd
wardley-beta
  component Spare [0.3, 0.6]%%{!end}%%

  component After [0.4, 0.7]
```

[fixture: wardley/hidden-boundaries/hidden-closing-tab]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-selected-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-child-before-closer]

[fixture: wardley/hidden-boundaries/wardley-pipeline-closer-semicolon]

[fixture: wardley/hidden-boundaries/wardley-pipeline-opening-hidden-spare-lf]

[fixture: wardley/hidden-boundaries/wardley-pipeline-closer-hidden-spare-lf]

### global directive

大域的なディレクティブの原文、順、所属先を保ちます。
同じ印字行の中のディレクティブは、
[ディレクティブ](./flowchart.ja.md#ディレクティブ)のとおりに置きます。
元は同じ行にあった単位を別の行へ分けるときは、
間のディレクティブを次の単位に付けます。
右側の接触・分離は保ち、左側の接触は切れます。
`component%%{wrap}%%Glued` は `component %%{wrap}%%Glued` と印字します。
普通の独立行は本文の段に揃えます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
図の本文の中の独立したディレクティブ行の深さを与えます。
Prettier がブロックの中の行をそう印字するためです。
[規則 1](./printed-form.ja.md#1-記号の横の空白)により、
pipeline の同じ深さの 2 つの子文の間のディレクティブ行を、
それらの子文と同じ段に置きます。
Prettier がブロックの中で、同じ深さの 2 行の間のコメント行を印字する形です。
[規則 1](./printed-form.ja.md#1-記号の横の空白)により、
pipeline の先頭や末尾の単独のディレクティブ行を、子文と同じ段に置きます。
Prettier がブロックの中の行をそう印字するためです。
複数行の内部と EOF に達する未完の終端は保ちます。
JSON 整形や順の入れ替えはしません。
共通除去が両側の文字を結び、受理や値を変えることがあるためです。
固有の読み飛ばすディレクティブは別のノードです。

[fixture: wardley/global-directives/header-to-body]

[fixture: wardley/global-directives/global-keyword-contact]

[fixture: wardley/global-directives/global-separated]

[fixture: wardley/global-directives/global-value]

[fixture: wardley/global-directives/global-flow-components]

[fixture: wardley/global-directives/global-coordinate-sign]

[fixture: wardley/global-directives/global-standalone]

[fixture: wardley/global-directives/global-right-separated]

[fixture: wardley/global-directives/global-left-separated]

[fixture: wardley/global-directives/global-multiline]

[fixture: wardley/global-directives/global-unclosed]

[fixture: flowchart/directives/touching-token]
[fixture: sequence/directives/whitespace-on-each-side]

入力（エスケープ表記）: `"wardley-beta\ncomponent%%{wrap}%%Glued[0.3,0.6]"`

出力
([global-directives/global-keyword-contact-output.mmd](../tests/fixtures/wardley/global-directives/global-keyword-contact-output.mmd)):

```mmd
wardley-beta
  component %%{wrap}%%Glued [0.3, 0.6]
```

### コメント

普通の独立コメントは所属する本文の段、見出し前は第 1 列に揃えます。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が、
図の本文の中の独立したコメント行の深さを与えます。
Prettier がブロックの中の行をそう印字するためです。
行内コメントは同じ行に残します。
接するコメントは接したまま残します。
[規則 1](./printed-form.ja.md#1-記号の横の空白)は、
同じ行の何かの後ろにあるコメントの前に空白 1 つを与えます。
Prettier が `x = 1;   // c` を `x = 1; // c` と印字する形です。
印、本文、末尾余白を保ち、pipeline 内では子文の段にします。
[規則 1](./printed-form.ja.md#1-記号の横の空白)により、
pipeline の同じ深さの 2 つの子文の間のコメント行を、
それらの子文と同じ段に置きます。
Prettier がブロックの中で、同じ深さの 2 行の間のコメント行を印字する形です。
[規則 1](./printed-form.ja.md#1-記号の横の空白)により、
pipeline の先頭や末尾の単独のコメント行を、子文と同じ段に置きます。
Prettier がブロックの中の行をそう印字するためです。
pipeline の中の文は子文です。
子文の前のコメントも、最後の子文の後のコメントも、子文の段に置きます。
`accDescr` と `{` の間のコメント行は例外で、文の中の 1 段深い所に置き、
続く `{` の行より深くなります。
文字列、flow、link ラベルの `%` テキストはその値に残します。
共通のコメント領域の結合は原文の列を保ち、所属先の変化を防ぎます。

[test: wardley/comments/native-separators]
[fixture: wardley/comments/comment-standalone]
[fixture: wardley/accessibility/description-opener-comment-line]

[fixture: wardley/comments/comment-inline-contact]

[fixture: wardley/comments/comment-inline-separated]
[fixture: wardley/comments/inline-gap-run-before-comment]

[fixture: wardley/comments/comment-pipeline]
[fixture: wardley/comments/comment-pipeline-after-last-child]
[fixture: wardley/comments/comment-after-pipeline-end]
[fixture: wardley/comments/comment-line-after-pipeline-end]
[fixture: wardley/comments/comment-at-end-of-text]

[fixture: wardley/comments/comment-triple-bare]

[fixture: flowchart/comments/before-header]
[fixture: xychart/comments/comment-line-before-the-header]

入力（エスケープ表記）:
`"wardley-beta\ncomponent InlineSpace[0.3,0.6] \t%% tail"`

出力
([comments/comment-inline-separated-output.mmd](../tests/fixtures/wardley/comments/comment-inline-separated-output.mmd)):

```mmd
wardley-beta
  component InlineSpace [0.3, 0.6] %% tail
```

### 空行

普通の ASCII 空行は文と注釈の間で最大 1 行にします。
文書と本文の端の余分な空行と、空白だけの余白は落とします。
pipeline の端も必須の可視 LF を残して空行を除きます。
余分な間隔を増やしません。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
[flowchart](./flowchart.ja.md#空行)、[pie](./pie.ja.md#blank-lines)、
[radar](./radar.ja.md#blank-lines)は、空行の連なりを 1 行にし、
本文の先頭と末尾の空行を落として印字します。
Prettier は、JavaScript、CSS、YAML で、空行の連なりを 1 行にします。
ファイルの先頭と末尾の空行は 3 つとも落とし、
ブロックの先頭と末尾の空行は JavaScript と CSS で落とします。
値、読み飛ばす部分とディレクティブの内部、保持前置部分、保護区間、
読み飛ばす構文の必須 LF には、それぞれの保持規則を使います。

[fixture: wardley/blank-lines/blanks-collapse]

[fixture: wardley/blank-lines/blanks-pipeline]

[fixture: wardley/blank-lines/blanks-comments]

[fixture: flowchart/blank-lines/single-kept]
[fixture: radar/blank-lines/blanks-ordinary]

入力（エスケープ表記）:
`"\n\nwardley-beta\n\n\ncomponent GroupA[0.3,0.6]\n \t\n\n\ncomponent GroupB[0.4,0.7]\n\n"`

出力
([blank-lines/blanks-collapse-output.mmd](../tests/fixtures/wardley/blank-lines/blanks-collapse-output.mmd)):

```mmd
wardley-beta
  component GroupA [0.3, 0.6]

  component GroupB [0.4, 0.7]
```

### 行末の空白

見出し、完結した構造、説明の閉じ記号の外の無害な ASCII 余白は落とします。
Prettier は JavaScript、CSS、YAML で行末に空白を印字せず、
[radar](./radar.ja.md#trailing-whitespace)、
[pie](./pie.ja.md#trailing-whitespace)、
[gitgraph](./gitgraph.ja.md#trailing-whitespace)も、
見出しや文の後に空白を印字しません。
所属先ごとに判断し、link ラベルの末尾、文字列と flow、コメント、ディレクティブ、
読み飛ばす部分の内部、閉じ記号後の必須の余白、保護区間は保ちます。
物理行の両端の空白を一律に除くと、Db が変わるか、
対象にする版の mermaid.js のすべてで空白だけのラベルが拒否されます。
詳しくは
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
を参照してください。
引用符で囲んだノートの行末の空白やタブも残します。
mermaid.js はそれをノートのテキストに持ち、ノートは同じに描かれますが、
Db のその変化を認める例外の種類はありません（同じ表を参照してください）。

[fixture: wardley/trailing-whitespace/trailing-exterior]

[fixture: wardley/trailing-whitespace/trailing-string]

[fixture: wardley/trailing-whitespace/trailing-blank-label-keep]

[fixture: radar/trailing-whitespace/trailing-safe]
[fixture: pie/trailing-whitespace/trailing-exterior]
[fixture: gitgraph/trailing-whitespace/trailing-safe]

入力（エスケープ表記）:
`"wardley-beta \t\ncomponent Tail[0.3,0.6] \t\naccDescr { End } \t"`

出力
([trailing-whitespace/trailing-exterior-output.mmd](../tests/fixtures/wardley/trailing-whitespace/trailing-exterior-output.mmd)):

```mmd
wardley-beta
  component Tail [0.3, 0.6]
  accDescr: End
```

### セミコロン

大域的なディレクティブを除いた後でセミコロンと文字列 `style` か `classDef`
の両方を含む原文行は、共有の行保護で丸ごと保ちます。
規則が発火しない語の行でも、セミコロンがあれば保護します。
`mystyle` のような名前だけでは、
通常の component や pipeline の空白整形を妨げません。
文、コメント、読み飛ばす構文を同じ行に残し、前後の行と結びません。
最初の行は本文の段に揃え、中身と後続行の列は保ちます。
ディレクティブをまたぐ語と U+2028/U+2029 後のコメント領域も、
mermaid が 1 行として読む範囲で数えます。
行規則が文法上のラベル開始も無視しうるため、行全体を保つことで、
移動後の選択を予測する必要をなくします。
書かれたセミコロンはすべて保ちます。
文法上のラベル開始だけは共有のテキストの前置部分保護から除きます。
ほかのセミコロンは区間の最後のセミコロンまでと、
交差する値と注釈全体を原文のまま保護します。
除去される大域的なディレクティブの内部だけにある語は、
行全体を保護する理由にしません。
ヘッダの前にある大域的なディレクティブも同じように除かれ、その後の本文の行は、
従来どおり保護するか整形します。

語の行の `;` の前後の空白は、mermaid.js の行の読み方を変えるので、
書かれたまま残します。
行末の `A -> B;` は拒否されますが、
その後に空白がある `A -> B;` は受理されるので、
mermaid.js が別の読み方をする形を印字しません。

[fixture: wardley/semicolons/word-line-semicolon-whitespace-kept]
[fixture: wardley/semicolons/style-label]

[fixture: wardley/semicolons/style-selected-delimiter]

[fixture: wardley/semicolons/classdef-selected-delimiter]

[fixture: wardley/semicolons/style-classdef-two-passes]

[fixture: wardley/semicolons/style-colon-space-nontrigger]

[fixture: wardley/semicolons/style-uppercase-nontrigger]

[fixture: wardley/semicolons/style-no-semicolon]

[fixture: wardley/semicolons/style-no-semicolon-directive-lines]

[fixture: wardley/semicolons/style-inside-global]

[fixture: wardley/semicolons/style-directive-rejoined]

[fixture: wardley/semicolons/style-directive-lines]

[fixture: wardley/semicolons/style-header-group]

[fixture: wardley/semicolons/style-header-delimiter]

[fixture: wardley/semicolons/style-hidden-value-last-line]

[test: wardley/semicolons/style-comment-ls-connected]

[test: wardley/semicolons/classdef-comment-ps-connected]

[fixture: wardley/semicolons/semicolon-value-no-style]

[fixture: wardley/semicolons/style-name-semicolon-padding]

[fixture: wardley/semicolons/style-delimiter-hash-after]

[fixture: wardley/semicolons/classdef-unclosed-directive]

[test: wardley/semicolons/style-comment-both-connected]

[test: wardley/semicolons/style-comment-before-connected]

[test: wardley/semicolons/classdef-comment-both-connected]

[test: wardley/semicolons/classdef-comment-before-connected]

[fixture: wardley/semicolons/style-pipeline-header]

[fixture: wardley/semicolons/style-pipeline-child]

[fixture: wardley/semicolons/style-trivia-line]

[fixture: wardley/semicolons/style-after-leading-directive]

入力（エスケープ表記）: `"wardley-beta\nAlpha  -> Beta; style:#tone;"`

出力
([semicolons/style-label-output.mmd](../tests/fixtures/wardley/semicolons/style-label-output.mmd)):

```mmd
wardley-beta
  Alpha  -> Beta; style:#tone;
```

### 複数行の値

`printWidth` では折り返しません。
flowchart も折り返しません（[折り返し](./flowchart.ja.md#折り返し)を参照）。
これは、
[規則 4](./printed-form.ja.md#4-どの決まりも形を決めない所)で決めた形です。
[規則 2](./printed-form.ja.md#2-prettier-にない種類の隙間)がその形を与えます。
文字列と flow の物理的な中身、継続行の列、内部の空行を保ちます。
説明本文は前述の共有の字下げを使います。
普通の文の部品間の可視 LF は拒否され、値の継続行の字下げは Db を変えます。
長い component と evolution の行も折り返しません。
説明の開始記号と閉じ記号にはアクセシビリティを使います。

[fixture: wardley/multiline-values/long-component]

[fixture: wardley/multiline-values/long-evolution]

[fixture: wardley/multiline-values/multiline-string-columns]

[fixture: wardley/multiline-values/multiline-flow-columns]

入力（エスケープ表記）:
`"wardley-beta\ncomponent A very long component name with repeated words[0.123456789012345,0.987654321098765]label[-13,24](build)inertia"`

設定: `{"printWidth":20}`

出力
([multiline-values/long-component-output.mmd](../tests/fixtures/wardley/multiline-values/long-component-output.mmd)):

```mmd
wardley-beta
  component A very long component name with repeated words [0.123456789012345, 0.987654321098765] label [-13, 24] (build) inertia
```

### フロントマターの YAML

安全な実フロントマターだけ、共有の保護条件付きの YAML 整形処理を使います。
YAML は、Prettier の YAML 整形処理で整形します。
Prettier が整形するどのファイルの YAML も同じです。
`title: 'Map'` は `title: "Map"` に、
`config: {wardley: {width: 600}}` は `config: { wardley: { width: 600 } }`
に印字します。
不正な YAML、字下げした囲みの区切り、区切りの余白、HTML の危険、
整形で囲みの区切りを作る本文は書かれたまま保ちます。
[フロントマター](./compatibility.ja.md#フロントマター)は、
HTML の危険の理由（mermaid.js は HTML タグの中の `="..."` を、
YAML を読む前に書き換えます）と、
囲みの区切りを作る本文の理由（`%YAML 1.2` の後の `--- !!map` は、
対象にする版のすべてが受理し、分けると拒否します）を述べます。
字下げした囲みの区切りは、決まるまで書かれたまま保ちます。
詳しくは
[どの決まりも形を決めない所](./printed-form.ja.md#4-どの決まりも形を決めない所)
を参照してください。
YAML は幅 0 でも共有の正の最小字下げを使います。
YAML は字下げでブロックスカラーと入れ子の値を表すので、幅 0 では、
対象にする版のすべてがブロックスカラーを拒否し、
入れ子でなくなった `config` の値では図が違って描かれます。
詳しくは [フロントマター](./compatibility.ja.md#フロントマター)と、
[対象にする版の mermaid.js のために残す形](./compatibility.ja.md#対象にする版の-mermaidjs-のために残す形)
の行を参照してください。
`textBeforeHeader` があれば、先頭 LF、通過した注釈、2 回目の走査で読む形、
実形と保持形の順を含め、完全な前置部分を保ちます。
共有の `keepsPrefix` により、
無視する YAML が実フロントマターになって設定や title を変えることを防ぎます。

[fixture: wardley/frontmatter-yaml/frontmatter-safe]

[fixture: wardley/frontmatter-yaml/retained-prefix]

[fixture: wardley/frontmatter-yaml/frontmatter-html-keep]

[fixture: wardley/frontmatter-yaml/prefix-secondscan]

[fixture: wardley/frontmatter-yaml/frontmatter-indented-keep]

[fixture: wardley/frontmatter-yaml/frontmatter-scalar-minimum]

[fixture: wardley/frontmatter-yaml/frontmatter-malformed]

[fixture: wardley/frontmatter-yaml/frontmatter-padding]

[fixture: wardley/frontmatter-yaml/frontmatter-fence-guard]

入力（エスケープ表記）:
`"---\ntitle: 'Map'\nconfig: {wardley: {width: 600}}\n---\nwardley-beta\ncomponent Fm[0.3,0.6]"`

出力
([frontmatter-yaml/frontmatter-safe-output.mmd](../tests/fixtures/wardley/frontmatter-yaml/frontmatter-safe-output.mmd)):

```mmd
---
title: "Map"
config: { wardley: { width: 600 } }
---
wardley-beta
  component Fm [0.3, 0.6]
```

### 改行と Unicode

共有の呼び出し側方針で CR/CRLF を LF として読み、設定の改行で印字します。
値と読み飛ばす構文の内部も同様です。
mermaid.js は CR と CRLF を LF と同じく読み、
Prettier は `endOfLine` オプションの改行を印字します。
ほかの言語でも同じです（[行末](./compatibility.ja.md#行末)を参照）。
LS/PS/NBSP/BOM は字句上の役割を保ちます。
例外は共通値の外端の空白除去と、通常の説明ブロックの開始記号の前の空白です。
一般の余白に変えると、Db を変えるか拒否入力を修復してしまいます。
先頭 BOM は Prettier が除去・復元するため、
元のフロントマターの判定とバイト一致は保証しません。

[test: wardley/line-terminators-and-unicode/cr-structure]

[test: wardley/line-terminators-and-unicode/crlf-string]

[test: wardley/line-terminators-and-unicode/output-crlf]

[test: wardley/line-terminators-and-unicode/output-cr]

[test: wardley/line-terminators-and-unicode/unicode-values]

[test: wardley/line-terminators-and-unicode/unicode-common-trim]

[test: wardley/line-terminators-and-unicode/hidden-crlf]

[test: wardley/line-terminators-and-unicode/leading-bom]

[corpus fixture: wardley/space-nbsp-body]

### 原順

文、子文、段階、装飾、参照、空の代入を、全出現とともに原順で保ちます。
繰り返した宣言と pipeline、未反映の evolve、最初の annotations box、
最後の size、evolution、共通代入も書かれたまま残します。
実効 Db から再構築しません。
並べ替えや削除は読みを変えるためです。

[fixture: wardley/source-order/order-repeated-components]

[fixture: wardley/source-order/order-common-reset]

[fixture: wardley/source-order/order-pipeline-stages]

入力（エスケープ表記）:
`"wardley-beta\ncomponent Zorder[0.3,0.6]\ncomponent Aorder[0.4,0.7]\ncomponent Zorder[0.5,0.8]"`

出力
([source-order/order-repeated-components-output.mmd](../tests/fixtures/wardley/source-order/order-repeated-components-output.mmd)):

```mmd
wardley-beta
  component Zorder [0.3, 0.6]
  component Aorder [0.4, 0.7]
  component Zorder [0.5, 0.8]
```

[corpus fixture: wardley/db-pipeline-duplicates]

[corpus fixture: wardley/db-singletons-last]

[corpus fixture: wardley/db-trend-missing]

### 最終改行

普通の受理ファイルは設定の改行 1 個で終え、末尾の普通の空行を落とします。
[規則 1](./printed-form.ja.md#1-記号の横の空白)が与える形です。
[radar](./radar.ja.md#final-newline)、[pie](./pie.ja.md#final-newline)、
[gitgraph](./gitgraph.ja.md#final-newline)は、テキストを改行 1 個で終えます。
Prettier は、JavaScript、CSS、YAML で、ファイルを改行 1 個で終え、
最後の文の後の空行を落とします。
見出しだけ、コメント、閉じた読み飛ばす構文も同じ終端に揃えます。
EOF に達する大域的な終端、保持前置部分の境界、保護テキスト、
読み飛ばす構文の閉じ記号後の必須の余白を優先します。
ラベルの余白は値であり、末尾の余分な空行として落としません。

[corpus fixture: wardley/header-only]

[fixture: wardley/final-newline/final-comment]

[fixture: wardley/final-newline/final-hidden]

[fixture: radar/final-newline/final-comment]
[fixture: pie/final-newline/final-newline]
[fixture: gitgraph/final-newline/final-commit]

入力（エスケープ表記）: `"wardley-beta\n%% final"`

出力
([final-newline/final-comment-output.mmd](../tests/fixtures/wardley/final-newline/final-comment-output.mmd)):

```mmd
wardley-beta
  %% final
```

### 仕様による読み

既存の 6 差異を適用します。
directive-as-token-boundary、ignored-semicolon-as-token-boundary、
html-tag-in-frontmatter、embedded-data-opaque、bare-percent-line-before-header、
c4-keyword-anywhere です。
Wardley 固有の内容を解釈しない受理設定キーはありません。
素の mermaid.js が拒否した場合、素の Db はなく、
利用できる仕様で定める読み方と埋め込み効果を使います。
単独ファイルの解析失敗は出力せず構文エラーにし、
Markdown では埋め込みを断ります。
拒否構文は修復しません。

[test: wardley/specified-readings/passed-unicode]
[corpus fixture: wardley/directive-arrow-inside]

[corpus fixture: wardley/lex-selected-decimal-inside]

[corpus fixture: wardley/div-html-frontmatter-reject]

[corpus fixture: wardley/config-fontfamily-keeps-title]

[corpus fixture: wardley/bare-before-ls]

[corpus fixture: wardley/c4-component-component]

[corpus fixture: wardley/number-int-leading-zero]

[corpus fixture: wardley/directive-keyword-middle]

[corpus fixture: wardley/gram-replaced-invalid-node]

### Markdown のフェンス

共有の Markdown 接続で、段を除いた図のテキストに同じ規則を適用します。
囲みの区切り、リスト、引用の列は呼び出し側が付け、
最後のコード行の余白を落とします。
特に HostSource -> HostTarget; の後の空白だけのラベルを落とすと、裸の ; が残り、
Wardley が図のテキストを拒否します。
単独ファイルではその余白を保ちます。
ラベルを書き換える規則は加えず、既存の Markdown 側の制限として記録します。
単独のテキストでその余白を除くと、
対象にする版のすべてが拒否します（[行末の空白](#行末の空白)を参照）。
実際の呼び出し側出力と 3 回の冪等性は、
単独の図のテキストの Db 比較とは別に検査します。

[test: wardley Markdown: top-level]

[test: wardley Markdown: list]

[test: wardley Markdown: quote]

[test: wardley Markdown: zero]

[test: wardley Markdown: tabs]

[test: wardley Markdown: hidden-boundary]

[test: wardley Markdown: prefix]

[test: wardley Markdown: frontmatter]

[test: wardley Markdown: final-whitespace-label]

[test: wardley Markdown: final-hidden-padding]

[test: wardley Markdown: rejected]

入力:

````markdown
```mermaid
wardley-betacomponentFenced[0.3,0.6]
```
````

出力:

````markdown
```mermaid
wardley-beta
  component Fenced [0.3, 0.6]
```
````

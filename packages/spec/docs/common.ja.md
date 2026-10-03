# 共通要素

英語版: [common.md](./common.md)

図ごとの文法が適用される前に、すべての図種のテキストがどう読まれるかを定めます。

mermaid.js は、決まった順序の正規表現による書き換えでテキストを準備します。
改行を正規化し、フロントマター、ディレクティブ、コメント行を取り除き、
エンティティを置き換えてから、書き換えたテキストを図のパーサーに渡します。
書き換えたテキストの位置は、元のソースの位置と一致しなくなります。
この仕様は、それぞれの書き換えを、字句解析器が元のソースに、
それが効く位置で直接適用する規則として述べ直します。
書き換えたテキストは作らないので、どの実装も、
書き換え後の位置から元の位置への対応表を持つ必要がありません。
各規則は次の 4 種類のどれかです。

- **トリビアの規則**: ソースのどの部分が図のトークンでないかを定めます。
  フロントマター、ディレクティブ、コメント行、空白です。
- **字句の規則**: 字句解析器が 1 文字、
  または短い文字の並びをどう読むかを定めます。
  改行、HTML 属性の引用符、エンティティです。
  どれも他の文字を動かしません。
- **変換**: ソースのテキストを、Db に入るテキストとしてどう読むかを定めます。
  これは字句解析器の読み方で、木の値ではありません。
  木は書き手が書いたものを保ちます（[ast.ja.md](./ast.ja.md#ノード) を参照）。
- **行単位の規則**: 行区間全体を見て、
  そのどの文字を字句解析器が読み飛ばすかを決めます。
  共通のものは、`style` 行と `classDef` 行の `;` の規則だけです。

結果は、受理・拒否のすべての判断とすべての Db の値で mermaid.js と同じです。
例外は、[known-divergences.ja.md](./known-divergences.ja.md)
で定める意図的な違いです。

mermaid.js のソースへの参照は、
[index.ja.md](./index.ja.md#pin-した-mermaidjs)
に記録したコミットへのリンクです。
主張を示す fixture は `[fixture: <区分>/<名前>]` と書き、
[`@mmd-toolkit/tests`](../../tests/fixtures) の
`packages/tests/fixtures/<区分>/<名前>/` にあります。
区分は図種か、ここで述べる挙動については `common` です。
`common` の fixture は、試す図として flowchart を使います。
例外は、`error` 疑似図種についての主張、
図の本文がまったくないテキストについての主張、
他の図種の検出器についての主張
（[detection.ja.md](./detection.ja.md) を参照）です。

## 表記

- **文字**は、Unicode のコードポイントです。
  BMP の外の文字は 1 文字で、
  単独のサロゲート（サロゲートペアの一部でないサロゲートのコード単位）も 1
  文字です。
  単独のサロゲートは、整形式のテキストでは有効なコードポイントではありませんが、
  それでも 1 文字として数えます。
- **空白**は、U+0009〜U+000D、U+0020、U+00A0、U+1680、U+2000〜U+200A、U+2028、
  U+2029、U+202F、U+205F、U+3000、U+FEFF のどれかです。
  バイトオーダーマークを含みます。
  mermaid.js のパターンが空白として扱う集合と同じです。
- **行終端**は、`\r\n`、単独の `\r`、単独の `\n` です。
  U+2028 と U+2029 は行終端ではありません。
- **行内の空白**は、行終端の一部でない空白です。
- **行**は、行終端を含まない最長の文字の並びです。**空白だけの行**は、空の行か、
  行内の空白だけからなる行です。
- **語の文字**は、ASCII の英字（`A`〜`Z`、`a`〜`z`）、ASCII の数字（`0`〜`9`）、
  `_` です。**語**は、語の文字の最長の並びです。
  他の文字や数字は、語の文字ではありません。
- **行区間**は、行終端、U+2028、U+2029 を含まない最長の文字の並びです。
- 2 つの文字は、同じ文字であるとき、
  または両方が基本多言語面（BMP、U+0000〜U+FFFF）にあって正準形が等しいとき、
  **大文字小文字を区別せずに一致**します。
  BMP の文字の正準形は、
  言語に固有の規則を使わない Unicode の完全な大文字化の対応による大文字が BMP の
  1 文字であればその大文字、そうでなければその文字自身です。
  ただし例外として、ASCII の外の文字で、大文字が ASCII の文字になるものは、
  その文字自身を正準形とします。
  そのため、`a` は `A` と、`é` は `É` と一致します。
  一方、`ß` は `S` とも `SS` とも一致せず、
  U+017F（LATIN SMALL LETTER LONG S）は `s` とも `S` とも一致せず
  （大文字が ASCII の `S` のため）、
  U+212A（KELVIN SIGN）は `k` と一致せず
  （`k` は `K` になり、U+212A はそのまま）、
  BMP の外の文字は他の文字と一致しません。
  mermaid.js の大文字小文字を区別しない検出器は、この方法で比べます。
  [fixture: common/detect-case-kelvin-sign] [fixture: common/detect-case-long-s]
- 文法の規則は次の表記を使います。
  規則は、名前、`=`、定義の順に書きます。
  二重引用符で囲んだ文字列は、そのままの文字列です。
  二重引用符そのものは単一引用符で囲んで書きます。
  並べて書いた項目は、その順に続きます。
  `|` は選択肢を区切ります。
  項目の後の `?` は省略可能、`*` は 0 回以上の繰り返し、
  `+` は 1 回以上の繰り返しを表します。
  丸括弧は項目をまとめます。
  規則に別の記述がなければ、`*` と `+` はできるだけ多く繰り返します。
- すべての規則は、[行終端](#行終端) の規則を適用した状態でソースを読みます。
  そのため、どの行終端も 1 つの改行として数えます。

規則は文字を数えます。
mermaid.js は、パターンを文字ではなく UTF-16 のコード単位に適用しますが、
ここのどの規則でも、2 つの読み方は同じ結果になります。

- 規則が名前を挙げる文字の集合（空白、語の文字、行終端、各規則の記号）は、
  どれもサロゲートでない BMP の文字だけからなります。
  そのため、どちらの読み方でも、BMP の外の文字も単独のサロゲートも、
  そのような集合には入りません。
- 「… 以外の任意の文字」は、BMP の外の文字と単独のサロゲートを含みます。
  mermaid.js はペアの 2 つのコード単位を続けて取るので、
  一致がその間で終わることはありません。
- 読み方の違いが現れるのは、大文字小文字を区別しない比較だけです。
  mermaid.js はコード単位ごとに比べるので、上の定義のとおり、
  BMP の外の文字はそれ自身としか一致しません。

長さや位置を測る箇所では、単位は UTF-16 のコード単位で、本文でそう述べます。
[ast.ja.md](./ast.ja.md#位置) の位置と、下の `maxTextSize` の上限です。

## mermaid.js とこの仕様

[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91)、
[`Diagram.fromText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L19-L85)、
[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)
は、次の段階をこの順に適用します。
最後の列は、この仕様がそれぞれをどう述べ直しているかです。

| 段階 | mermaid.js                                                                 | この仕様                                                                                                             |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | `\r\n` と単独の `\r` が `\n` になる。                                      | 字句の規則と変換: [行終端](#行終端)                                                                                  |
| 2    | `<tag ...>` の中で、`="..."` が `='...'` になる。                          | 字句の規則と変換: [HTML 属性の引用符](#html-属性の引用符)。フロントマターの後のテキストで                            |
| 3    | 先頭の YAML ブロックを解析し、取り除く。                                   | トリビアの規則: [フロントマター](#フロントマター)。本文は解析しない。                                                |
| 4    | すべての `%%{ ... }%%` を、どこにあっても設定として解析し、取り除く。      | トリビアの規則: [ディレクティブ](#ディレクティブ)。引数は解析しない。                                                |
| 5    | コメント行を取り除き、先頭の空白を削る。                                   | トリビアの規則: [コメント行](#コメント行) と [先頭の空白](#先頭の空白)                                               |
| 6    | 登録された検出器のうち、最初に一致したものが図種を選ぶ。                   | [図種の検出](#図種の検出)                                                                                            |
| 7    | 一部の `style` 行から `;` を 1 つ落とし、`#name;` をプレースホルダにする。 | 行単位の規則: [`style` 行と `classDef` 行](#style-行と-classdef-行)。字句の規則と変換: [エンティティ](#エンティティ) |
| 8    | `\n` を末尾に足す。                                                        | 字句の規則: [テキストの終わり](#テキストの終わり)                                                                    |
| 9    | 一部の図は、字句解析の前にテキストをもう一度書き換える。                   | 各図の文書で述べる                                                                                                   |

mermaid.js では、各段階が前の段階の出力を書き換えます。
この仕様は、これらの段階をすべて、
字句解析器がソースを左から右へ 1
回読む間に適用する規則として定めます
（[ソースの読み方](#ソースの読み方) を参照）。
規則は、既知の差を除いて、段階と同じトークンと値を与えます。
後の規則が読むための書き換えたテキストを作る規則はありません。
規則がソース以外のテキスト（たとえば検出器が見るテキスト）に触れるとき、
そのテキストは規則を述べるための言い方で、
実装が作らなければならない結果ではありません。
段階 3 と 4 で mermaid.js が設定をどう求めるかは、
参考として [設定（参考）](#設定参考) で述べます。

段階 1〜4、6、8 は、すべての図種で同じです。
図の Db が `preserveCommentsWhenParsing` を設定している場合、
段階 5 はパーサーへの入力には適用されず、
検出にだけ適用されます
（[`Diagram.fromText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L66-L77)）。
そのとき段階 7 は、パーサーが受け取るテキストに対して働くので、
コメント行と先頭の空白も見ます。
pin した mermaid.js でそうしているのは agentflow の Db だけです。
そのパーサーは、コメント行と先頭の空白を受け取ります。
ただし、フロントマターの後のソースから、ディレクティブを除き、
`\r\n` を 1 つと数えたものが `maxTextSize` UTF-16 コード単位より長い場合は、
段階 5 がいつもどおり適用されます。
`maxTextSize` はサイト設定でしか設定できず（[有効な設定](#有効な設定) を参照）、
既定値は 50000 です。
agentflow の文書で、その字句解析器がこれらをどう扱うかを述べます。

### ソースの読み方

字句解析器は、ソースを左から右へ 1 回読みます。
書き換えたテキストは作りません。
以下の各規則は、それが効く位置で適用します。

オフセット 0 で、
字句解析器はソースがフロントマターで始まるかを決めます
（[フロントマター](#フロントマター)）。
始まるなら、フロントマターは木の `Frontmatter` で、その後から読み進めます。
フロントマターのトリビアの後のソース、
フロントマターがなければソース全体を、**テキスト**と呼びます。
この文書の規則は、テキストに適用します。
そこからは、各位置で次のものを順に試します。

1. **コメント領域**。
   コメント開始位置で試します（[コメント行](#コメント行)）。
   字句解析器は、空白、行終端、ディレクティブを越えて先を見ます。
   コメントに行き着けば、コメント開始位置から、
   そのコメントの行を終える行終端（あれば）までがコメント領域で、トリビアです。
2. **行単位の規則**。
   行区間の先頭で試します
   （[`style` 行と `classDef` 行](#style-行と-classdef-行)）。
   字句解析器は行区間の終わりまで先を見て、
   そのどの `;` を規則が無視するかを決めます。
3. この位置で始まる**ディレクティブ**
   （[ディレクティブの位置](#ディレクティブの位置)）。
   木の 1 つの `Directive` で、中の行終端は行を終えません。
   ディレクティブはどこでも始まりえます。
   コメント行の中でも、トークンの途中でも始まり、
   その場合はそのトークンを分けるか、
   入力を拒否させます
   （[ディレクティブはトークンの境界](#ディレクティブはトークンの境界)）。
   コメント領域の中のディレクティブは、その領域の一部で（項目 1）、
   そのどちらもしません。
4. **図のトークンの規則**。
   それに一致させる間、字句解析器は、行終端を `\n` として（[行終端](#行終端)）、
   属性の引用符を `'` として（[HTML 属性の引用符](#html-属性の引用符)）、
   エンティティをそのプレースホルダとして
   （[エンティティ](#エンティティ)）読みます。
   コメント領域、行単位の規則が無視する `;`、ディレクティブは、
   ないかのように読み進めます。
   その後、コメント領域をまたぐトークンは、そこで切られ
   （[コメント行](#コメント行)）、
   空白でない 2 つの文字の間にディレクティブを持つトークンは、
   分けられるか、
   入力を拒否させます
   （[ディレクティブはトークンの境界](#ディレクティブはトークンの境界)）。

図の字句解析器が読む文字、
つまりテキストのうちディレクティブとコメント領域の外にあり、
行単位の規則が無視する `;` でない文字を、**図のテキスト**と呼びます。
図のテキストは、図がトークンの間のトリビアとする空白や行終端も含みます。
agentflow では、字句解析器がコメント行を自分で読むので、
コメント領域の文字も図のテキストです
（[mermaid.js とこの仕様](#mermaidjs-とこの仕様) を参照）。

図のテキストの**変換した形**は、字句解析器が読むとおりのテキストです。
行終端は `\n`、属性の引用符は `'`、エンティティはそのプレースホルダになります。
これは字句解析器の読み方で、図の Db の正規化がテキストを使うときの形です。
木の値は変換した形ではなく、
書き手が書いたとおりのテキストを保ちます
（[ast.ja.md](./ast.ja.md#ノード) を参照）。

図の字句解析器の最初の単位より前の空白、行終端、ディレクティブ、
コメント領域はトリビアです（[先頭の空白](#先頭の空白)）。
ソースの最後の文字の後には、
`\n` をもう 1 つ読みます（[テキストの終わり](#テキストの終わり)）。
上の段階 9 の追加の書き換えを含め、図がほかに何をするかは、
その図の文書で述べます。

位置の周りの文字だけでは決まらない規則が 2 つあります。
どちらも、それ自身の規則として述べます。

- **図種の検出**。
  図種がどの字句解析器で読むかを決めるので、図種を最初に、
  ソース全体から作る検出テキストで求めます（[図種の検出](#図種の検出)）。
  これは入力を拒否することがあります。
- **HTML 属性の引用符**。
  `"` を `'` として読むかどうかは、ずっと前で、コメント行の中でも始まりえて、
  複数行にわたりうるタグによって決まります。
  タグは、
  テキスト全体を左から右へ読んで見つけます
  （[HTML 属性の引用符](#html-属性の引用符)）。

それ以外の規則は、位置の周りの文字で決まります。
ディレクティブはその `%%{` からの文字で、
コメント領域はコメント開始位置からそのコメントの行の終わりまでで、
行単位の規則はその行区間で、エンティティは `#`、語、`;` で決まります。

agentflow では、項目 1 は字句解析器には適用されません。
字句解析器がコメント行と先頭の空白を自分で読み、
行単位の規則とエンティティもそれらに適用されます。
上で述べたとおりです。

フロントマターの本文、ディレクティブの引数、図の `@{ ... }` のデータブロックは、
決して解析しません。
Db の値が設定に依存する場合は、その図の Db の正規化がそう述べ、
その設定は mermaid.js が求めるものです（[設定（参考）](#設定参考)）。

検出が図種を選び、字句解析器が読んだものを図の文法と Db が受け入れるとき、
入力は受理されます。

## 行終端

字句の規則: 字句解析器は、`\r\n` と単独の `\r` を `\n` として読みます。
そのため、単独の `\r` はフロントマターやディレクティブの中を含め、
どこでも改行です。
[fixture: common/cr-only] [fixture: common/crlf] [fixture:
common/frontmatter-lone-cr] [fixture: common/directive-spans-lone-cr]

`\r` の後に `\n` が続くかどうかは、何かを除く前に、ソースの上で決めます。
間にディレクティブかコメント領域がある `\r` と `\n` は、どの規則でも、
検出テキストでも、2 つの行終端です。
mermaid.js は、ディレクティブとコメント行を取り除く前に行終端を読むからです。
そのため、`A[a`、単独の `\r`、ディレクティブ、`\n`、`b]` の Db のラベルは、`a`、
改行 2 つ、`b` です。
[fixture: flowchart/lex-lone-cr-directive-lf-label]

変換: テキストの変換した形では、行終端はどれも `\n` です。
木の値は、行終端を書かれたとおりに保ちます。

U+2028 と U+2029 は行終端ではなく、行内の空白です。
`A-->B` U+2028 `C-->D` は 1 行で、拒否されます。
[fixture: common/u2028-is-not-newline]

## HTML 属性の引用符

字句の規則。
HTML タグを、テキストの中から左から順に探します。

```text
html-tag        = "<" tag-name attribute-part ">"
tag-name        = word-character+
attribute-part  = (any character except ">")*
```

属性部は行をまたいでよく、最初の `>` で終わります。
後に語の文字が続かない `<` や、
テキストのその後のどこにも `>` がない `<` はタグを始めず、
探索は次の `<` から続きます。
タグどうしは重なりません。
探索は直前のタグの終わりの後から続きます。

各属性部の中で、引用符付きの属性値を左から順に探します。

```text
quoted-value    = "=" '"' (any character except '"')* '"'
```

字句解析器は、引用符付きの属性値の 2 つの `"` を `'` として読みます。
置き換えは長さが変わらないので、他の文字は動きません。
タグと引用符付きの値は、書かれたとおりのテキストの文字の中で探します。
ディレクティブ、コメント行、行単位の規則が無視する `;` も含みます。
フロントマターの中は探しません。

変換: 同じ文字は、テキストの変換した形では `'` です。
`A[<a href="u">t</a>]` のラベルは、Db では `<a href='u'>t</a>` で、
木の値は `"` を保ちます。
[fixture: common/html-attribute-quotes]

`"` を `'` として読むことは、受理にも効きます。
flowchart ではラベルの文字列の中の `"` が引用符付き文字列を始めるので、
この規則がなければ同じラベルは拒否されます。

mermaid.js は、文法を変えずにラベルの中の HTML の属性値に `"` を使えるように、
この置き換えを
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
で行い、フロントマター、ディレクティブ、
コメント行を取り除く前にソース全体に適用します。
フロントマターの中を除いて
（[`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md) を参照）、
この仕様は、その帰結も含めて意図的にそのまま従います。

- タグはコメント行の中で始まりえます。
  `A[b="c">d]` の前のコメント行 `%% <a` はタグを始め、
  その属性部は `>` まで届くので、ラベルは `b='c'>d` です。
  同じコメント行が `accTitle: b="c">d` の前にあると、
  アクセシビリティのタイトルは `b='c'>d` になります。
  [fixture: flowchart/html-tag-starts-in-comment-line] [fixture:
  flowchart/html-tag-starts-in-comment-line-acc-title]
- タグはディレクティブをまたぎえます。
  `A[<a %%{init: {}}%% href="u">t]` のラベルは `<a  href='u'>t` です。
  [fixture: flowchart/html-tag-attributes-cross-directive]
- コメント行の中の `>` はタグを終えます。
  `A[<b]`、コメント行 `%% >`、`B[c="d">e]` では、
  タグ `<b` はコメント行で終わるので、`B` の `"` は残り、
  flowchart の文法がそれを拒否します。
  [fixture: flowchart/html-tag-closed-in-comment-line]
- コメント行の中の `"` は、引用符付きの値を終えることも始めることもあります。
  `A[<a b="c`、コメント行 `%% "`、`d">e]` では、
  値 `="c` はコメント行で終わるので、`d` の後の `"` は残り、
  flowchart の文法がそれを拒否します。
  `A[<a`、コメント行 `%% x="`、`y" z>e]` では、値はコメント行の `="` で始まり、
  `y` の後の `"` で終わるので、ラベルは `<a`、改行、`y' z>e` です。
  [fixture: flowchart/html-tag-value-closed-in-comment-line] [fixture:
  flowchart/html-tag-value-opened-in-comment-line]
- 行単位の規則が無視する `;` も数に入ります。
  `A[<a style:#x=;"u">t]` では、
  `=;"u"` は引用符付きの値ではないので `"` が残り、
  flowchart の文法がそれを拒否します。
  [fixture: flowchart/html-tag-ignored-semicolon-in-value]

## フロントマター

トリビアの規則。
出どころは
[`extractFrontMatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69)です。
次の条件がすべて成り立つとき、ソースはフロントマターを持ちます。

1. **開始行**はソースの最初の行です。_字下げ_（0 個以上の行内の空白）、`---`、
   省略可能な行内の空白からなり、行終端で終わります。
   前に改行があるとフロントマターになりません。
   バイトオーダーマークは行内の空白なので、字下げの一部になります。
   [fixture: common/frontmatter-leading-newline] [fixture:
   common/frontmatter-bom] [fixture: common/frontmatter-bom-both-delimiters]
2. `----` は「`---` の後に行内の空白」ではないので、フロントマターを始めません。
   [fixture: common/frontmatter-four-dashes]
3. **区切り行**は、開始行とまったく同じ字下げ、`---`、
   省略可能な行内の空白からなり、行終端で終わる行です。
   字下げは開始行の字下げと 1 文字ずつ一致しなければなりません。
   そのため、
   YAML のブロックスカラーの中の字下げされた `---` はフロントマターを閉じず、
   開始の区切りの前にバイトオーダーマークがあれば、
   閉じる区切りの前にも同じものが必要です。
   `---` の後に文字がある行や、テキストの最後にあって行終端のない行は、
   区切り行ではありません。
   [fixture: common/frontmatter-indented] [fixture:
   common/frontmatter-indent-mismatch] [fixture:
   common/frontmatter-nested-dashes] [fixture:
   common/frontmatter-closing-trailing-text] [fixture:
   common/frontmatter-no-newline-after] 区切りが空白 2 つで字下げされていれば、
   本文のブロックスカラーの中の空白 6 つで字下げした `---` は区切り行ではなく、
   タイトルは `---` と改行です。
   本文を 0 桁にし、ブロックスカラーの `---` を空白 2 つで字下げすると、
   その行がフロントマターを閉じ、入力は拒否されます。
   [fixture: common/frontmatter-indented-block-scalar-dashes] [fixture:
   common/frontmatter-indented-closing-in-body] `--- !!map`
   は区切り行ではないので、`---`、`%YAML 1.2`、`--- !!map`、`title: x`、
   `---` はタイトルが `x` のフロントマターです。
   `--- !!map` を `---` と `!!map` に分けると、
   `%YAML 1.2` の後の `---` の行がフロントマターを閉じ、入力は拒否されます。
   [fixture: common/frontmatter-yaml-document-marker-with-tag] [fixture:
   common/frontmatter-yaml-document-marker-split]
4. 開始行の後で最初の、
   空白だけの行ではない行を、**最初の内容行**と呼びます。
   **終了行**は最初の内容行より後の最初の区切り行で、
   **本文**は最初の内容行から終了行の手前までの行です。
   開始行と最初の内容行の間の空白だけの行は、フロントマターの一部ですが、
   本文には含まれません。
   たとえば、`---`、空白だけの行、`---`、`---` はフロントマターで、
   本文は 3 行目、終了行は 4 行目です。
   [fixture: common/frontmatter-blank-line-then-two-delimiters]
5. 最初の内容行より後に区切り行がなくても、最初の内容行自身が区切り行で、
   開始行との間に空白だけの行が 1 行以上あれば、最初の内容行が終了行になり、
   本文はそれらの空白だけの行のうち最後の 1 行です。
   これにより、`---`、空行、`---` は本文が空のフロントマターになり、`---`、
   空白の行、`---` はその行を本文とするフロントマターになります。
   [fixture: common/frontmatter-blank-line-then-delimiter-only]
   それ以外の場合はフロントマターではありません。
   特に、`---` の直後に `---` が続く場合はフロントマターではありません。
   [fixture: common/frontmatter-empty-body] [fixture:
   common/frontmatter-adjacent-delimiters]

フロントマターのトリビアは、ソースの先頭から、終了行の行終端までと、
その後の空白だけの行（それぞれの行終端を含む）までです。
ソースの最後にある、行終端のない空白だけの行は含みません。
その次の、空白だけではない行の字下げは含みません。

この仕様は本文を解析しません。
木は本文を書かれたとおりに保持し
（[ast.ja.md](./ast.ja.md#frontmatter) を参照）、
本文に何が書かれていても入力は受理されます。
mermaid.js は本文を YAML として解析し、
入力を拒否することがあります
（[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md) を参照）。
mermaid.js が本文をどう読むかは、
[フロントマターの本文の読み方](#フロントマターの本文の読み方) で述べます。

これらの条件が成り立たない場合、フロントマターはなく、
`---` のブロックはテキストです。
その後どうなるかは、成り立たなかった理由によります。

- ブロックの前にトリビア（先頭の改行やディレクティブ）が
  あったことだけが理由の場合、
  検出は自分が見るテキストの先頭でブロックを再び見つけ、
  無視します（[図種の検出](#図種の検出) を参照）。
  本文の図種が検出され、`---` の行はその図の文法に渡されます。
  flowchart の文法はこれを拒否します。
  一方、テキストを読まないパーサーを持つ `error` 疑似図種は受理します。
  [fixture: common/frontmatter-leading-newline] [fixture:
  common/directive-before-frontmatter]
- 開始の区切りだけが字下げされ、閉じる区切りが字下げされていない場合も同じです。
  開始の区切りの前にだけバイトオーダーマークがある場合を含みます。
  検出は先頭の空白を除いたテキストを見るので、
  そこでは区切りの字下げがそろいます。
  [fixture: common/frontmatter-indent-mismatch] [fixture:
  common/frontmatter-bom] [fixture: common/frontmatter-bom-error]
- それ以外の場合は、検出もブロックを認識せず、
  `---` 疑似図種がテキストを引き受けて拒否します。
  `----`、閉じる `---` の後の文字、
  テキストの最後にある行終端のない閉じる `---`、隣り合う区切り、
  閉じる区切りの欠落、先頭の空白を除いてもそろわない字下げがこれに当たります。
  最後のものは、
  開始の区切りが字下げされておらず閉じる区切りだけが字下げされている場合と、
  空でない異なる字下げが 2 つある場合です。
  [fixture: common/frontmatter-indent-closing-only] [fixture:
  common/frontmatter-indent-different-depths] [fixture:
  common/frontmatter-four-dashes] [fixture:
  common/frontmatter-closing-trailing-text] [fixture:
  common/frontmatter-no-newline-after] [fixture:
  common/frontmatter-adjacent-delimiters] [fixture: common/frontmatter-unclosed]

そのため、先頭の `---` のブロックを許す文法を持つ図は、
このような入力を受理しえます。
pin した mermaid.js では、Langium で定義された図のいくつかがそうです
（pie、info、gitGraph、packet、radar、architecture で確認）。
それぞれの文書で記録します。
どの場合も、ブロックの `title` と `config` は適用されません。
フロントマターではないからです。

## ディレクティブ

トリビアの規則。
この仕様はディレクティブの引数を解析しません。
mermaid.js は一部のディレクティブを設定のために読みます。
[設定の走査](#設定の走査) を参照してください。

### ディレクティブの位置

ディレクティブは、フロントマターの後のソースのあらゆる位置で、左から順に、
[`removeDirectives()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)と同じように探します。
ディレクティブは、`%%{` の後に 0 個以上の空白と語の文字が続くところで始まり、
次の規則が届くところまで伸びます。

```text
directive  = "%%{" whitespace* name (whitespace* ":")? whitespace* argument? whitespace* "}%%"?
name       = word
argument   = word
           | free-text
free-text  = (any character except U+2028 and U+2029)*
```

- 空白は行終端を含むので、どの `whitespace*` も改行をまたげます。
- 名前の後の `whitespace* ":"` は、
  名前とその後の空白の後に `:` が続くときに取られます。
  そうでなければ、ディレクティブはコロンを持ちません。
- 空白の後の最初の文字が語の文字なら、引数は `word` です。
  そうでなければ `free-text` で、最初の `}%%` の手前、U+2028 か U+2029 の手前、
  テキストの終わりのうち最も早いところで止まります。
  空でもかまいません。
  [fixture: common/directive-u2028]
- 引数の後の `whitespace*` は、続く空白を改行も含めてすべて取ります。
  その後に閉じる `}%%` が続けば、それも取ります。
  そのため、自由形式の引数が U+2028 か U+2029 の手前で止まった場合、
  その文字は空白として取られ、直後の `}%%` はディレクティブを閉じます。
  `%%{init: {'theme':'dark'}` U+2028 `}%%` は、
  テーマを設定する 1 つの閉じたディレクティブです。
  [fixture: common/directive-u2028-before-closing]

ディレクティブの後、探索はそれが終わったところから続きます。
ディレクティブどうしは重なりません。
後に 0 個以上の空白と語の文字が続かない `%%{` はディレクティブを始めず、
探索は次の文字から続きます。
[行終端](#行終端) の規則が適用されるので、
ディレクティブは mermaid.js とまったく同じように単独の `\r` や `\r\n`
をまたげます。
mermaid.js は、ディレクティブを取り除く前に改行を正規化するからです。
[fixture: common/directive-spans-lone-cr]

ある位置でディレクティブが始まるかどうかは、図の構文にも、字句解析器の文脈にも、
コメントにも依存しません。
ディレクティブは、コメント行の中でも、
それがなければ 1 つのトークンになるものの途中でも始まりえます。
mermaid.js で確かめた帰結は次のとおりです。

- 閉じる `}%%` は省略できます。
  自由形式の引数を持ち `}%%` のないディレクティブは、
  テキストの終わりまで伸びます。
  [fixture: common/directive-unclosed] ヘッダーの直後にあれば、
  図の残りを取ります。
  `flowchart LR`、`%%{init: {"theme": "dark"}}`、`A-->B` は、
  頂点も辺も持ちません。
  [fixture: common/directive-unclosed-after-header]
- `%%{` の後に語が続けば、意図していなくてもディレクティブが始まります。
  行末の `%%{wrap` の次の行に `A-->B` があると、
  引数の前の空白が改行をまたぐので、`A` が語の引数になります。
  [fixture: common/directive-name-only-unclosed] `A-->B` の後の `%%{wrap` と
  `C-->D` の行では、ディレクティブは引数 `C` を取り、
  その行の残りの `-->D` は前のリンクに続きます。
  辺は A から B と、B から D です。
  [fixture: common/directive-word-argument-unclosed-next-line]
- 引数が語の文字で始まる場合、引数はその語だけです。
  `%%{init: dark foo}%%` は `dark ` の後で終わり、
  `foo}%%` は通常のテキストになります。
  [fixture: common/directive-word-argument-then-more]
- `%%{ }%%` や `%%{-x}%%` のように、
  `%%{` の後に語が続かないものはディレクティブではありません。
  コメント行でもないので（後述）、[図のテキスト](#ソースの読み方) になり、
  各図の字句解析器が読みます。
  頂点の後の行の `%%{}` を、flowchart は拒否し、
  sequence と class は図のコメントとして読み、
  state はその `%%` を mermaid.js が読まないテキストとして読みます。
  [fixture: common/directive-empty-braces] [fixture:
  flowchart/lex-percent-brace-line-after-vertex] [fixture:
  sequence/lex-percent-brace-line-after-message] [fixture:
  class/lex-percent-brace-line-after-class] [fixture:
  common/directive-non-word-start]
- 名前も、その大文字小文字も関係ありません。
  `%%{INIT: ...}%%` も `%%{init: ...}%%` と同じくディレクティブです。
  [fixture: common/directive-uppercase]

### ディレクティブはトークンの境界

ディレクティブはトリビアで、図のテキストではありません。
ディレクティブの走査より後のすべての規則は、ディレクティブのないテキストを読み、
そこではディレクティブの前の文字と後の文字が続いています。
mermaid.js がディレクティブを取り除いた後と同じです。
[コメント行](#コメント行)、[先頭の空白](#先頭の空白)、
[図種の検出](#図種の検出)、
[`style` 行と `classDef` 行](#style-行と-classdef-行) の規則、
[エンティティ](#エンティティ)、図の字句解析器と文法がそうです。
ディレクティブの中の行終端はディレクティブと一緒に除かれるので、
複数行にまたがるディレクティブは行を終えません。
唯一の例外は [HTML 属性の引用符](#html-属性の引用符) です。
mermaid.js はディレクティブを取り除く前にそれを探すので、
書かれたとおりのテキストで、ディレクティブも含めて探します。
[fixture: flowchart/html-tag-attributes-cross-directive]

そのため、図の字句解析器が読む単位、トークン、値は、
ディレクティブのないテキストのものです。
行単位の規則に当てはまる並び、エンティティ、コメントの `%%` は、
2 つの文字の間にディレクティブを持つことがあります。
それでも、ディレクティブがほかのトークンの中にあることはありません。
どのトークンとコメントの外にあるディレクティブは、
それ自体が `Directive` のトークンです
（[ast.ja.md](./ast.ja.md#directive) を参照）。

- **単位**は、図の字句解析器の 1 つの規則が一度に読むものです。
  各図の文書が単位を定め、
  すべて空白ではない各単位はトークンの種類を持ちます（flowchart については
  [単位と文脈](./diagrams/flowchart.ja.md#単位と文脈) と
  [トークン](./ast/flowchart.ja.md#トークン) を参照）。
  種類が `RawText` か `Identifier` の単位は、
  空白でない 2 つの文字の間にディレクティブを持ってかまいません。
  キーワード、矢印、文字列のような他の種類の単位は持てず、入力は拒否されます。
  2 つの単位の間のディレクティブは、常に許されます。
  `error` 疑似図種では、どのトークンも `RawText` なので、
  ディレクティブはどこにあってもかまいません。
- 空白でない 2 つの文字の間にディレクティブを持つトークンは、
  ディレクティブのところで切られます。
  各断片から両端の空白を除いたものが、同じ種類のトークンで、
  すべて空白の断片はトークンになりません。
  断片の間のディレクティブは `Directive` のトークンです。
  ラベルや id の値のように、元のトークンが表していたものは変わりません。
  ディレクティブの隣の空白は関係ありません。
  `A[x %%{init: {}}%% y]` のラベルはトークン `x` と `y` を持ち、その値は `x`、
  空白 2 つ、`y` です。
- コメント領域の中のディレクティブは、
  字句解析器が領域全体を読み進めるので（[コメント行](#コメント行) を参照）、
  領域と一緒に読み進められます。
  1 つの単位の読む中にある領域でも同じで、領域はその単位のトークンを切ります。
  コメントの `%%` の後のディレクティブはコメントの一部で、
  その前のディレクティブは `Directive` のトークンです
  （[ast.ja.md](./ast.ja.md#directive) を参照）。
  [fixture: common/comment-region-directive-in-string] [fixture:
  common/comment-directive-in-string]

トークンの間や、トークンの端の空白の中にあるディレクティブは、
mermaid.js とまったく同じに振る舞います。
[fixture: common/directive-mid-line] [fixture: common/directive-after-link]
[fixture: common/comment-after-directive] [fixture:
common/directive-joins-lines]

字句解析器はディレクティブのないテキストを読むので、
`RawText` や `Identifier` の単位の中のディレクティブも、
mermaid.js と同じ結果になります。
flowchart では、`A[x%%{init: {}}%%y]` のラベルは `xy` で、
`end%%{init: {}}%%x` はキーワード `end` ではなく頂点 `endx` です。
`flowchart%%{init: {}}%%LR` は、テキストが `flowchartLR` なので、
mermaid.js と同じく拒否されます。
[fixture: common/directive-in-label-text] [fixture:
common/directive-keyword-followed-by-text] [fixture:
common/directive-between-header-and-direction] 2
つのトークンの間の空白の中のディレクティブは、何も変えません。
`flowchart %%{init: {}}%%LR` は方向 `LR` を持ち、
`style A %%{init: {}}%%fill:red` のスタイルは `fill:red` です。
一方、`style A%%{init: {}}%%fill:red` は、
テキストが `style Afill:red` なので拒否されます。
[fixture: common/directive-in-header-whitespace] [fixture:
common/directive-after-style-space] [fixture:
common/directive-between-id-and-style] `A[mysty%%{init: {}}%%le:#x;]`
のラベルは、行が `style` の規則に当てはまるので `mystyle:#x` で、
`A[a#qu%%{init: {}}%%ot;b]` のラベルはエンティティ `#quot;`
のプレースホルダを持ちます。
どちらも mermaid.js と同じです。
[fixture: common/directive-in-style-rule] [fixture: common/directive-in-entity]
矢印、キーワード、文字列のような、他の種類の単位の中のディレクティブは、
入力を拒否させます。
mermaid.js はそれを受理します。
[`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md)
を見てください。

コメント行の上のディレクティブは、
コメントの一部です（[コメント行](#コメント行) を参照）。
各図の文書は、この規則を、その字句解析器が読むものに当てはめます。
flowchart については
[単位の中のディレクティブ](./diagrams/flowchart.ja.md#単位の中のディレクティブ)
を参照してください。

## コメント行

トリビアの規則。
出どころは
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)です。

**コメント開始位置**は、テキストの先頭、またはディレクティブの一部でない行終端、
U+2028、U+2029 の直後の位置です。**コメント**は、
ディレクティブのないテキストの `%%`、
つまりディレクティブの一部でない 2 つの `%` で、
間にディレクティブしかないもののうち、次の 2 つの条件を満たすものです。

1. その前の最も近いコメント開始位置から `%%` までの間に、
   空白とディレクティブしかない。
   行の中でほかのテキストの後にある `%%` はコメントではなく、
   テキストに残ります。
   `subgraph S %% group` のタイトルは `S %% group`、
   `accTitle: Title %% note` のタイトルは `Title %% note`、
   `style A fill:red %% red` のスタイルは `fill:red %% red` です。
   [fixture: common/comment-mid-line-subgraph-name] [fixture:
   common/comment-mid-line-acc-title] [fixture: common/comment-mid-line-style]
2. `%%` の後の、ディレクティブの一部でない最初の文字が存在し、`{` でなく、
   行終端の一部でもない。
   そのため `%%` だけの行はコメント行でなく、何行かにわたるテキストの中では、
   そのテキストの一部です。
   flowchart の `A -->|a`、行 `%%`、`b| B` の辺のテキストは、
   `a`、行 `%%`、`b` で、
   同じように書いた subgraph のタイトルも同じです。
   [fixture: flowchart/lex-percent-line-in-edge-label] [fixture:
   flowchart/lex-percent-line-in-subgraph-title]

コメントは、その `%%` の最初の `%` から行の終わり、
つまりディレクティブの一部でない次の行終端まで伸びます。
U+2028 と U+2029 はコメントを終えません。
行終端は、ディレクティブの走査が取るもの（引数の後の空白を含む）の中にあるとき、
ディレクティブの一部です
（[ディレクティブの位置](#ディレクティブの位置) を参照）。
そのため、コメントの中のディレクティブは、
コメントを改行の先まで続けることがあります。
`X` の後の行 `%% %%{wrap`、`A`、`B --> C` は 1 つのコメントです。
ディレクティブが `A` とその後の改行を取るからで、
mermaid.js は `A` も `B --> C` も読みません。
[fixture: common/comment-directive-word-argument-takes-next-lines]
ディレクティブの一部でない行終端が後に続かないとき、
コメントはテキストの終わりまで伸びます。
そのとき、その範囲は、終わりにあってディレクティブが取った空白を、
ディレクティブの範囲と同じく除きます（[Comment](./ast.ja.md#comment) を参照）。
コメントを含む行を**コメント行**と呼びます。

コメントの**コメント領域**は、
空白とディレクティブだけを通って `%%`
に至れる最も早いコメント開始位置から始まり、
コメントを終える行終端があればその後で終わります。
そのため、コメント行の直前の空白だけの行を含みます。
字句解析器は、そのコメント開始位置で領域を見つけます。
そこから空白、行終端、ディレクティブを越えて先を見て、コメントに行き着けば、
先を見始めた位置から領域が始まります。
コメント領域は重なりません。
領域全体がトリビアです。
木に現れるのは、そのディレクティブとコメントだけで、
`Root.directives` と `Root.comments` に並びます。
空白と行終端はトークンにもノードにもなりません
（[ast.ja.md](./ast.ja.md#トークン) を参照）。
領域はそれら以上の意味を持ちます。
その行終端は図のトークンではなく、
トークンの中では字句解析器が領域全体を読み進めます。
後で述べるとおりです。

- コメント行は、任意の行内の空白で字下げしてよい。
  [fixture: common/comment-indented]
- 同じ行の、他の文字の後にある `%%` はコメントではありません。
  `A-->B %% note` の `%% note` は図の文法に渡され、flowchart では拒否されます。
  [fixture: common/comment-trailing]
- U+2028 と U+2029 は、行終端ではありませんがコメント開始位置です。
  `A-->B` U+2028 `%% note` では、`%% note` はコメントで、
  その前の文は受理されます。
  U+2029 でも同じです。
  [fixture: common/comment-after-u2028] [fixture: common/comment-after-u2029]
  `%%` までに空白しかなければ、コメント領域は U+2028 の直後から始まります。
  `error`、U+2028、空白 2 つ、`%% c` では、領域は空白 2 つとコメントです。
  `%%` の前に空白と 2 つ目の U+2028 があるときは、
  領域は最も早いコメント開始位置、つまり最初の U+2028 の直後から始まります。
  [fixture: common/whitespace-cut-at-comment-region] [fixture:
  common/whitespace-cut-at-earliest-comment-start]
- `%%` だけの行はコメント行ではありません。
  コメントには `%%` の後の文字が要るからです。
  flowchart では `%%` という名前のノードを宣言します。
  `%%` の後に空白が続く行はコメント行です。
  [fixture: common/comment-bare] [fixture: common/comment-bare-with-space]
  そのため、コメントにした行の間の `%%` の行は文です。
  `A-->B` の後の `%% C-->D`、`%%`、`%% D-->E` の行は、
  2 つのコメントのほかに頂点 `%%` を作ります。
  一方、`%%` の行の代わりに空行や、`%%` と空白の行を置くと、すべてコメントです。
  [fixture: common/comment-bare-between-comment-lines] [fixture:
  common/comment-bare-between-comment-lines-empty] [fixture:
  common/comment-bare-between-comment-lines-space] ラベルの中では、
  そのような行はテキストに残ります。
  `A[a`、改行、`%%`、改行、`b]` のラベルは、`a`、改行、`%%`、改行、`b` です。
  [fixture: common/comment-bare-line-in-label] 文字列の中でも同じです。
  `A["first`、改行、`%%`、改行、`third"]` のラベルは、`first`、改行、`%%`、
  改行、`third` です。
  一方、`%%` と空白だけの行は、ラベルの中でもコメント行です。
  `A[a`、改行、`%%` と空白、改行、`b]` のラベルは、`a`、改行、`b` です。
  [fixture: common/comment-bare-line-in-string-label] [fixture:
  common/comment-percent-space-line-in-label]
  説明のブロック（コメント行の後でも）、ツールチップの文字列、
  `accTitle:` の次の行のタイトルにも、同じく残ります。
  [fixture: flowchart/lex-acc-descr-block-bare-marker-line-after-comment-line]
  [fixture: flowchart/lex-tooltip-bare-marker-line] [fixture:
  flowchart/lex-acc-title-bare-marker-next-line]
- コメント行だけからなるテキストはトークンを持たず、検出で拒否されます。
  [fixture: common/comment-only]
- ディレクティブは除かれるので、`%%{init: {}}%% %% c` の行は、
  ディレクティブとその後のコメントです。
  `%%%{init: {}}%%% c` はコメント行で、その `%%` は最初と最後の `%` で、
  間にディレクティブがあります。
  mermaid.js と同じです。
  `%%%%{init: {}}%%` の行はコメント行ではありません。
  ディレクティブを除くと、その `%%` の後に何もないからです。
  flowchart では、mermaid.js と同じく、ノード `%%` を宣言します。
  コメント行の `%%` の後にあるディレクティブは、コメント行の一部です。
  [fixture: common/comment-after-directive] [fixture:
  common/comment-percent-joined-by-directive] [fixture:
  flowchart/comment-percent-before-directive] [fixture:
  common/directive-in-comment]
- `%%{` で始まり、ディレクティブではない行も、コメント行ではありません。
  `%%` の後の文字が `{` だからです。

コメント行は、図の構文にも字句解析器の文脈にも依存せずに認識されます。
字句解析器は、コメント領域がないかのように読み通します。
複数行の引用符付きラベルのように、
テキストがコメント領域をまたいで続く単位は 1 つの単位で、
その値は領域の前後のテキストをつないだものです。
ただし、コメント領域はどのトークンの中にもありません。
そのような単位のトークンは領域で断片に切られ、
文字列の断片は `StringFragment` のトークンです
（[Comment](./ast.ja.md#comment) を参照）。
[fixture: common/comment-in-string] [fixture:
common/comment-blank-line-before-in-string]

これにより、トークンの中で特別な意味を持つ文字がコメント行に含まれていても、
受理は mermaid.js と同じになります。
例は、引用符付きラベルの中のコメント行にある `"` です。
[fixture: common/comment-with-quote-in-string]

コメント領域は、図のコメント、
つまり図自身の字句解析器が行の終わりまで読むコメントも、
同じように切ります（[Comment](./ast.ja.md#comment) を参照）。
図のコメントの行は、その行の U+2028 か U+2029 の後のコメント行を越えて続きます。
mermaid.js は、コメント行を除いたテキストを読むからです。
state で、`A %% x`、U+2029、行 `%% end`、行 `B` の後では、
図のコメントは `B` に続き、mermaid.js は `B` を読みません。
[fixture: state/lex-diagram-comment-across-comment-line]

## 先頭の空白

トリビアの規則。
mermaid.js は、
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
の中で、コメント行を取り除いた直後に先頭の空白を取り除きます。
図の字句解析器の最初の単位より前の空白、行終端、ディレクティブ、
コメント領域はトリビアで、
図の文法からは見えません。

## 図種の検出

検出は、ソース全体から作るテキスト、**検出テキスト**を見ます。
フロントマターの後のソースから、ディレクティブ、コメント領域、
先頭の空白を除いたものです。
`\r` と `\n` の間のディレクティブやコメント領域を除いても、
ソースの各行終端はその中で 1 つの行終端のままです（[行終端](#行終端) を参照）。
改行、`---`、単独の `\r`、ディレクティブ、改行、`---`、改行、
`error` は `error` 疑似図種で、
ディレクティブの代わりにコメント行があっても同じです。
一方、`\r\n` を続けて書いたテキストは、mermaid.js と同じく拒否されます。
[fixture: common/detect-lone-cr-directive-lf] [fixture:
common/detect-lone-cr-comment-lf] [fixture:
common/detect-crlf-no-directive]
検出した図種がどの字句解析器で読むかを決めるので、
検出テキストは図の字句解析器が読み始める前に作ります。
ディレクティブを除くので、`err%%{init: {}}%%or` は、
mermaid.js と同じく `error` 疑似図種です。
[fixture: common/error-split-by-directive] 検出は、検出テキストからさらに、
[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)
と同じく、3 つを取り除きます。

- 先頭のフロントマターのブロック。
  [フロントマター](#フロントマター) の条件でもう一度探します。
- ディレクティブ。
  [ディレクティブ](#ディレクティブの位置) と同じように、
  左から右への 1 回の走査でもう一度探します。
  この走査は、1 回目が見つけなかったディレクティブを見つけることがあります。
  コメント領域とディレクティブを除いて初めて、
  `%%{` の後に空白を挟んで語が続くようになる場合、
  その `%%{` からディレクティブが始まります。
  `%%{`、改行、コメント行、`kanban` はそのようなディレクティブを含み、`%%{`、
  改行、`%%{wrap}%%`、改行、`error` も含みます。
  取り除いた後に走査をやり直すことはありません。
  それぞれ 1 行ずつの `%%{`、`%%{`、`%%{wrap}%%`、`flowchart LR` では、
  走査が見つけるディレクティブが 2 つ目の `%%{` から始まるので、
  最初の `%%{` は残ります。
  [fixture: common/detect-directive-across-comment-line] [fixture:
  common/detect-directive-across-directive] [fixture:
  common/detect-directive-across-directive-closed] [fixture:
  common/detect-directive-second-scan-once] この走査は、
  ディレクティブを除くことで `%%{` ができるディレクティブも見つけます。
  テキストの最後の `error %%%%{wrap}%%{x}%%` では、
  `%%` と `{x}%%` がつながって `%%{x}%%` になり、この走査がそれを取り除くので、
  テキストは mermaid.js と同じく `error` 疑似図種です。
  これは木のディレクティブを変えません。
  木のディレクティブは、1 回目の走査がソースの上で見つけます。
  [fixture: common/detect-directive-joined-by-directive]
- `%%` の並び。
  [`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L46-L73)と同じように取り除きます。
  後ろのどこかに改行がある `%%` について、左から順に、
  `%%` の直前の空白、`%%`、その後の次の改行までとその改行を、
  1 つの改行に置き換えます。
  直前の空白は、それより前の改行をまたいでさかのぼってよいですが、
  すでに取り除いたテキストには入りません。
  後に改行がない `%%` はそのまま残り、その後のテキストもすべて残ります。
  ディレクティブを除くことでできた `%%` も、ほかと同じように取り除きます。
  `%%%{a}%%%` の後に行 `error` が続くものは `error` 疑似図種です。
  その `%%` はコメントではなく（後に何もない）、
  この除去が改行と一緒に取り除くからです。
  `error`、`%%{`、`%%%%{x}%%`、`ERROR ` の 4 行では、
  除去の後に `error` と `ERROR ` の 2 行が残り、
  入力は mermaid.js と同じく拒否されます。
  [fixture: common/detect-percent-joined-by-directive] [fixture:
  common/error-percent-before-directive]

これらを取り除くのは検出のためだけで、図の文法はこれを見ません。
テキストに init ディレクティブがあるときは、
mermaid.js は別の作り方をしたテキストで検出器をもう一度走らせ、
それが入力を拒否することがあります。
この仕様はそれを走らせません（[init ディレクティブ](#init-ディレクティブ) と
[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md) を参照）。

その後、検出器を登録順に試します。
条件が最初に成り立ったものが図種を選びます。
どの検出器も一致しなければ、テキストは `UnknownDiagramError` で拒否されます。
[fixture: common/empty] 39 個の検出器すべての順序と条件は、
[detection.ja.md](./detection.ja.md) にあります。

すべての実際の図より前に、2 つの疑似図種が登録されています。

- `error`: 検出器が見るテキストを小文字にして前後を削ったものが `error`
  に等しい。
  受理され、パーサーはテキストを読まず、Db の内容は生じません。
  一致は、[表記](#表記) の意味で大文字小文字を区別しません。
  検出器は上の `%%` の除去の後のテキストを見るので、
  `error %% x` の後に改行があれば受理され、
  テキストの最後にある `error %% x` は受理されません。
  [fixture: common/error-pseudo-diagram] [fixture: common/error-uppercase]
  [fixture: common/error-trailing-percent] [fixture:
  common/error-trailing-percent-at-end]
- `---`: 検出器が見るテキストを小文字にして先頭の空白を削ったものが `---`
  で始まる。
  そのパーサーは常に例外を投げるので、入力は拒否されます。
  検出器は上の 2 回目のフロントマターの探索の後のテキストを見るので、
  これが引き受けるのは、フロントマターでもなく、
  その探索でも認識されない `---`
  のブロックだけです（[フロントマター](#フロントマター) を参照）。

各図の文書は、
その検出の節で [detection.ja.md](./detection.ja.md) の該当する項目を参照します。

## `style` 行と `classDef` 行

行単位の規則で、すべての図種に適用します。
出どころは
[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917)です。
1 つの行区間ごとに適用し、字句解析器は各行区間の先頭で、
その終わりまで先を見て適用します。
この規則では、行区間はディレクティブの一部でない行終端、U+2028、
U+2029 の間にわたり、行区間はディレクティブを除いて、
ディレクティブの前の文字と後の文字が続いているものとして読み、
コメント領域はどの行区間にも属しません。
agentflow ではコメント領域を除かないので
（[mermaid.js とこの仕様](#mermaidjs-とこの仕様) を参照）、
この規則はコメント行にも適用されます。

行区間が次のものをこの順に含むとき、
その行区間は **`style` の規則に一致**します。

1. 文字列 `style`
2. その後の `:` で、空白でない文字が 0 個以上続き、その後に `#` があるもの
3. その `#` より後の `;`

一致した行区間では、字句解析器は最後の `;` を無視します。
つまり、その `;` をないかのように読み進め、文法はそれを見ません。
その後、`style` の規則が無視した `;` を除いた行区間に対して、
項目 1 の `style` を `classDef` に替えて同じことを行います。
mermaid.js は、
[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L895-L917)
でそのような `;` をテキストから取り除きます。
この仕様は、それをソースに残したまま無視するだけです。

この規則は、`style` 行や `classDef` 行の `#f00;` のような CSS の色が、
エンティティにならないようにするためのものです。
純粋にテキスト上の規則なので、次のようになります。

- 行のどこにある `style` にも一致し、ラベルの中でも一致します。
  `A[mystyle:#x;]` は一致するので `;` が無視され、
  ラベルは `mystyle:#x` になります。
  一方 `A[mystyle: #x;]` は一致せず（`:` と `#` の間に空白がある）、
  ラベルは `mystyle: ﬂ°x¶ß` です。
  [fixture: common/entity-style-in-label] [fixture:
  common/entity-style-in-label-space] 空白でなければ、
  `:` と `#` の間にほかの文字があってもかまいません。
  `A[style:a#b;]` は当てはまり、ラベルは `style:a#b` です。
  一方、`A[style:a #b;]` は当てはまらず、ラベルは `style:a`、空白、
  `#b;` のプレースホルダです。
  [fixture: common/entity-style-colon-text-before-hash] [fixture:
  common/entity-style-colon-space-before-hash] ラベルの HTML の `style`
  属性もこれに当たります。
  `A[<span style='color:#f00;font-weight:bold;'>x</span>]` は当てはまるので、
  最後の `;` が無視され、`#f00;` はエンティティです。
  `A[<span style='color:red;background:#fff;'>x</span>];`
  は区切りが無視されるので `#fff;` はエンティティです。
  一方、区切りがなければ、最後の `;` は `#fff` の後のもので、
  ラベルは `#fff` を保ちます。
  [fixture: common/entity-css-in-label] [fixture:
  common/entity-css-in-label-separator-ignored] [fixture:
  common/entity-css-in-label-last-semicolon-ignored] ラベルが文字列
  `A["<span style='color:#f00;font-weight:bold;'>x</span>"]` のときも、
  リンクのテキスト
  `A-- <span style='color:#f00;font-weight:bold;'>t</span> -->B` でも同じです。
  [fixture: common/entity-css-in-string-label] [fixture:
  common/entity-css-in-link-text] `:` の後に `#` がなければ行は当てはまらず、
  `A[<span style='color:red;font-size:12px'>x</span>]` は 2 つの `;`
  を保ちます。
  `A[<span style='color:#35;f00;font-weight:bold'>x</span>]`
  では行が当てはまるので、`f00` の後の `;` が無視され、
  `#35;` はエンティティです。
  ラベルは、そのプレースホルダに `f00font-weight:bold` が続くものです。
  [fixture: common/entity-css-in-label-no-hash] [fixture:
  common/entity-css-numeric-entity-then-semicolon]
- 無視するのは行の最後の `;` だけです。
  `style A fill:#f00;B-->C` では、無視される `;` は 2 つの文を区切るものです。
  `style A fill:#fff;color:#000;` は `#fff;`
  を残してそれがエンティティになります。
  flowchart の文法はどちらも拒否します。
  [fixture: common/entity-style-semicolon-separator] [fixture:
  common/entity-style-two-colours] `style A fill:#f00; style B fill:#0f0` は、
  ただ 1 つの `;` が無視されるので、1 つの文です。
  A は 1 つのスタイル `fill:#f00 style B fill:#0f0` を持ち、
  B はスタイルを持ちません。
  [fixture: common/entity-style-semicolon-between-statements] 1 行の 2
  つのラベルは、無視される 1 つの `;` を共有します。
  `A[<span style='color:#f00;'>a</span>] --> B[<span style='color:#00f;'>b</span>]`
  では、それは B のラベルの中のものなので、
  A のラベルの `#f00;` はエンティティです。
  2 行に分けると、どちらのラベルもエンティティを持ちません。
  無視される `;` は、
  `A[<span style='color:#333;font-size:12px'>x</span>]` のように 2
  つの宣言の間にあることもあり、
  そのラベルは `color:#333font-size:12px` を持ちます。
  `classDef c fill:#f00;stroke:#0f0` のように 2
  つのスタイルの間にあることもあり、
  そのスタイルは 1 つの `fill:#f00stroke:#0f0` です。
  `style A fill:#f00;stroke:#0f0;` は最後の `;` だけを無視するので、
  `#f00;` はエンティティで、スタイルはそれを拒否します。
  [fixture: common/entity-css-two-labels-one-line] [fixture:
  common/entity-css-two-labels-two-lines] [fixture:
  common/entity-css-semicolon-between-declarations] [fixture:
  common/entity-style-last-semicolon-only-ignored] [fixture:
  common/entity-classdef-semicolon-between-styles] 無視される `;` は 2
  つのスタイルの間にあることもあります。
  `style A fill:#f00;stroke:#0f0` は 1 つのスタイル `fill:#f00stroke:#0f0`
  を持ちます。
  [fixture: common/entity-style-semicolon-between-styles]
- 大文字小文字を区別します。
  `linkStyle 0 stroke:#f00;` は `style` に一致しないので、
  `#f00;` はエンティティになり、flowchart の文法はその行を拒否します。
  最後の `;` がない場合や、その前の色が `#` で始まらない場合は、
  同じ行が受理されます。
  [fixture: common/entity-linkstyle-colour] [fixture:
  common/entity-linkstyle-colour-no-semicolon] [fixture:
  common/entity-linkstyle-named-colour-semicolon]
- 最後の `;` は、ラベルの後の区切りであることもあります。
  `A[style:#x;];` では区切りが無視されるので、ラベルの中の `;` は残り、
  `#x;` はエンティティで、ラベルは `style:` とプレースホルダです。
  ラベルが文字列 `"style:#x;"` でも同じです。
  一方、`A[style:#x;]` ではラベルの中の `;` が無視され、
  ラベルは `style:#x` です。
  アクセシビリティの文の行もほかの行と同じで、
  `accTitle: style:#x;y;` のタイトルは `style:`、プレースホルダ、`y` です。
  [fixture: common/entity-style-separator-ignored] [fixture:
  common/entity-style-label-semicolon-ignored] [fixture:
  common/entity-style-separator-ignored-string] [fixture:
  common/entity-style-acc-title]

木の中では、無視される `;` はトークンに含まれます。
前後のトークンの中にあるか、
単独のトークンです（[ast.ja.md](./ast.ja.md#トークン) を参照）。

## エンティティ

エンティティは、コメント領域の外で
（agentflow では、行単位の規則と同じくコメント領域を除きません）、
ディレクティブのないテキストの中で、左から順に探します。
ディレクティブの前の文字と後の文字は続いているので、
エンティティは 2 つの文字の間にディレクティブを持つことがあります。
そのディレクティブはエンティティを含む単位の中にあり、
[ディレクティブはトークンの境界](#ディレクティブはトークンの境界)
の規則が当てはまります。
`RawText` の単位の中なら、トークンを切り、値はプレースホルダを持ちます。
文字列の中なら、入力は拒否されます。
[fixture: common/directive-in-entity] エンティティは、
次の連続した文字からなります。
ただし、その `;` は上の行単位の規則が無視するものではありません。

```text
entity = "#" word ";"
```

エンティティどうしは重なりません。

字句の規則: 字句解析器は、エンティティをそのプレースホルダとして読みます。
語が ASCII の数字だけからなる場合、`#` _語_ `;` を `ﬂ°°` _語_ `¶ß` として読み、
そうでなければ `ﬂ°` _語_ `¶ß` として読みます。
文字は U+FB02、U+00B0、U+00B6、U+00DF です。
字句解析器は、
エンティティのソース上の文字の代わりに、
プレースホルダの文字に対してトークンの規則を照合します。
プレースホルダは、エンティティのソースの文字の全体を表し、そのどの文字も、
ソースの特定の 1 文字から読まれるものではありません。
そのため、図の字句解析器の規則が 1 文字ずつ読み、
プレースホルダの各文字を順に同じ名前の単位として読むはずのところでは、
その規則はプレースホルダの全体を、その名前の 1 つの単位として読みます。
その単位は、エンティティのソースの文字をすべて持ちます。
そこではプレースホルダの中で当たる規則がないので、これで受理は変わりません。
flowchart では、そのような規則は、リンクテキストの文脈と楕円の文脈の規則です。
プレースホルダの最初の文字だけを読む規則は変わりません。
flowchart では、文字の規則は U+FB02 を読みますが、
その後の U+00B0 を読む規則はないので、`A#x;-->B` は拒否されます。
[fixture: flowchart/lex-link-text-entity-dash] [fixture:
flowchart/lex-ellipse-entity-start] [fixture:
flowchart/lex-entity-in-vertex-id]プレースホルダの文字がどこで許されるかは、
図の字句解析器によります。
flowchart ではラベルの文字列の中で許され、
ノード ID やスタイルの値の中では拒否されます。
各図の文書を見てください。

変換: テキストの変換した形では、エンティティはそのプレースホルダです。
mermaid.js はプレースホルダを図を描画するときにだけ HTML
エンティティに戻すので、Db はプレースホルダの形を持ちます。
`A[a #amp; b]` のラベルは、Db では `a ﬂ°amp¶ß b` で、木の値は `a #amp; b` です。
[fixture: common/entity-named] [fixture: common/entity-numeric]

`#+123;` はエンティティではありません。
`+` は語の文字ではないからです。
[fixture: common/entity-plus]

エンティティは、行単位の規則が当てはまるかどうかにかかわらず、
ラベルのテキストの中で見つかります。
`A[Issue #123; fixed]` は数字のエンティティ `#123;` のプレースホルダを持ち、
行単位の規則が当てはまらない
`A[<span style='color: #f00; font-weight: bold'>x</span>]` は `#f00;`
のプレースホルダを持ちます。
一方、`A[<span style='color:#f00'>x</span>]` のように `;` のない `#f00` は、
書かれたままです。
[fixture: common/entity-css-in-label-spaces] [fixture:
common/entity-css-in-label-no-semicolon] [fixture:
common/entity-numeric-in-label-text] タグの外でも同じで、
`A[color: #f00; is red]` は `#f00;` のプレースホルダを持ちます。
[fixture: common/entity-in-label-outside-tag]

## テキストの終わり

字句の規則: mermaid.js は、解析の前にテキストの末尾に `\n` を足します。
そのため、図の文法にとって、テキストの終わりは行終端のように振る舞います。
最後の文の後に改行がない図も、改行があるものとして読まれます。
足した `\n` はソースの一部ではないので、木にノードを加えません。

## 空白

どの文字を空白とみなすかは、図の字句解析器がそれぞれ決めます。
mermaid.js のパターンから作った字句解析器は、
たいてい [表記](#表記) で定めた空白をすべて、
U+00A0 や U+FEFF も含めて空白として扱います。
[fixture: common/nbsp-as-space] [fixture: common/bom-mid-text]

## 設定（参考）

この節は参考です。
入力が受理されるかどうかや、その木がどうなるかの判定には関わりません。
この仕様の実装は、
フロントマターの本文とディレクティブの引数を書かれたとおりに保持し、
解析も検査もしません（[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md) を参照）。
この節は、
mermaid.js がフロントマターとディレクティブから設定をどう求めるかを述べます。
一部の図の Db がその設定を読むからです。
各図の Db の正規化は設定を考慮し、Db の値を検査する側は、
mermaid.js 自身の関数で設定を求めます。
設定を求める途中で mermaid.js が入力を拒否する場合は、以下でそう述べます。
この仕様は、そのような入力を受理します。

求め方は、
[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L58-L91)、
[`detectInit()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L98-L130)
と
[`detectDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198)、
[`addDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L277-L290)、
[`updateCurrentConfig()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L109-L143)、
[`sanitizeDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils/sanitizeDirective.ts#L38-L98)
に従います。

設定の値は JSON の値です。
null、真偽値、数、文字列、リスト、マッピングのどれかです。
フロントマターの値も同じ種類として読みます。**入れ物**は、
リストかマッピングです。
値が null、偽、ゼロ、非数、空文字列のどれかであるとき、その値は**空**です。

値の**文字列形**は次のとおりです。
文字列はそれ自身です。
真は `true` です。
数は、ECMA-262 の Number::toString が与える 10 進の形です
（`1.0` は `1`、`1e21` は `1e+21`、YAML の `.inf` は `Infinity` になります）。
リストは、要素の文字列形を `,` でつないだものです。
null の要素は空文字列になります。
マッピングは `[object Object]` です。

段階は小節の順に行います。
ある段階で mermaid.js が入力を拒否すると、その後の段階は行いません。

### フロントマターの本文の読み方

[`extractFrontMatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69)
は、本文から字下げを取り除き（[フロントマター](#フロントマター) を参照）、
その結果を YAML 1.2 として、
pin した mermaid.js に同梱された js-yaml 4.3.0 がその JSON
スキーマ（`JSON_SCHEMA`）で読むのと同じように読みます。

- YAML の構文エラーがあると、mermaid.js は入力を `YAMLException` で拒否します。
  同じキーを 2 回持つマッピングと、YAML の文書を 2 つ以上含む本文は、
  構文エラーです。
  [fixture: common/frontmatter-yaml-error] [fixture:
  common/frontmatter-duplicate-key] [fixture: common/frontmatter-two-documents]
- 本文がマッピングでない場合（例: 単なるスカラー）は、
  空のマッピングとして扱います。
  [fixture: common/frontmatter-scalar]
- 引用符付きのスカラーは文字列です。
  引用符のないスカラーは、次の種類のうち、その形を持つ最初のものとして読み、
  どれでもなければ文字列として読みます。
  これらの形の英字は ASCII の英字で、
  示した大文字小文字の組み合わせだけが許されます。
  - null: 空のスカラー、`~`、`null`、`Null`、`NULL`。
  - 真偽値: `true`、`True`、`TRUE`、`false`、`False`、`FALSE`。
  - 整数: 省略可能な `+` か `-` の後に、`0b` と 1 個以上の 2 進数字、
    `0o` と 1 個以上の 8 進数字、`0x` と 1 個以上の 16 進数字、
    または 1 個以上の 10 進数字が続くもの
    （先頭のゼロは許され、8 進を意味しません）。
    値は最も近い倍精度の数です。
    `-0` はゼロで、負のゼロではありません。
    値が無限大になる形は整数ではありません。
  - 浮動小数点数: 省略可能な符号、1 個以上の 10 進数字、
    省略可能な `.` と 0 個以上の数字、
    省略可能な指数（`e` か `E`、省略可能な符号、1 個以上の数字）が続くもの。
    または、`.`、1 個以上の数字、省略可能な指数が続くもの。
    または、省略可能な符号と `.inf`、`.Inf`、`.INF` のどれか。
    または、符号のない `.nan`、`.NaN`、`.NAN` のどれか。
    最初の 2 つの種類の形で、値が無限大になるものは浮動小数点数ではありません。

その結果が**フロントマターのマッピング**です。
そのキーのうち使われるのは `title`、`config`、`displayMode` の 3 つだけです。

### フロントマターの設定

[`processFrontmatter()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L19-L31)
は、フロントマターのマッピングを次のように使います。
フロントマターがなければ、フロントマターのマッピングは空です。

- フロントマターのマッピングの `title` が空でなければ、
  その文字列形が図の**タイトル**です。
  タイトルは設定ではなく Db の値で、設定に依存する Db の値と同じく、
  木からは出ません。
  Db の値を検査する側が、mermaid.js 自身の関数で求めます。
  [`renderDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L577-L579)
  は、タイトルを図のタイトルとして Db に渡します。
  Db がそれをどう持つかは、各図の文書で述べます。
  `title: [1, 2]` はタイトル `1,2` に、`title: 1.0` は `1` に、
  `title: {a: 1}` は `[object Object]` になります。
  mermaid.js は、
  [`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
  が HTML タグの中の `="..."` を書き換えた後の本文を読むので、
  `title: <b class="x">T</b>` はタイトル `<b class='x'>T</b>` になります。
  一方、`title: "<a b=\"c\">"` のタグには `="` がないので、
  タイトルは `<a b="c">` です。
  [fixture: flowchart/frontmatter-title-html-attribute] [fixture:
  common/frontmatter-title-escaped-quotes-in-tag] 引用符のないスカラーでは、
  `0x1F` は `31`、`017` は `17`、`TRUE` は `true` になり、
  `1e400` は文字列 `1e400` のままで、`~` は null なのでタイトルはありません。
  [fixture: common/config-title-list] [fixture: common/config-title-number]
  [fixture: common/config-title-mapping] [fixture: common/config-title-hex]
  [fixture: common/config-title-leading-zero] [fixture:
  common/config-title-bool-uppercase] [fixture:
  common/config-title-float-overflow] [fixture: common/config-title-null-tilde]
- フロントマターのマッピングの `config` が空でなければ、
  それが**フロントマターの設定**です。
  そうでなければ、フロントマターの設定は空のマッピングです。
  書いたとおりに適用されます。
  たとえば、その中の `flowchart` のマッピングは flowchart を設定します。
  [fixture: flowchart/config-inherit-dir-frontmatter]
- フロントマターのマッピングの `displayMode` が空でなければ、
  その文字列形をフロントマターの設定にコピーします。
  - フロントマターの設定が文字列、数、真のどれかなら、
    mermaid.js は入力を `TypeError` で拒否します。
    空でない `displayMode` がなければ、
    そのようなフロントマターの設定も mermaid.js は受理します。
    [fixture: common/frontmatter-display-mode-primitive-config] [fixture:
    common/frontmatter-primitive-config]
  - フロントマターの設定がマッピングなら、まずその `gantt` の項目が、
    ないか空であれば、空のマッピングに置き換えられます。
    その後 `gantt` が文字列、数、真のどれかであれば、
    mermaid.js は入力を `TypeError` で拒否します。
    そうでなければ、`gantt` の `displayMode` に文字列形を入れます。
    [fixture: common/config-display-mode-gantt-primitive]
  - フロントマターの設定がリストなら、何もコピーされず、
    そのリストは何ももたらしません（[テキストの設定](#テキストの設定) を参照）。
    `config: null` と `displayMode` の組は受理されます。
    null の `config` は空だからです。
    [fixture: common/config-display-mode-list-config] [fixture:
    common/config-display-mode-null-config]

### 設定の走査

mermaid.js は、図を設定するディレクティブを、
`Directive` のトリビアを見つける走査ではなく、専用の走査で見つけます。
この走査は、フロントマターの後のソースから始めます。
行終端は `\n` に正規化し、HTML タグの中の `="..."` は、
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L6-L17)
と同じく、フロントマターを含むソース全体で `='...'` に書き換えた状態です。
そこから、次の順に準備します。
このうち、見つかるディレクティブを変えうるのは 2 番目だけです。

1. 先頭と末尾の空白を取り除きます。
2. すべての**閉じ記号の行**を取り除きます。
   閉じ記号の行は、直後に `}%%` が続く `%%` から始まり、
   次の行終端までを含みます。
   ただし、その `%%` と行終端の間に U+2028 も U+2029 もない場合に限ります。
   閉じ記号の行は左から右へ見つけ、重なりません。
   後に行終端がない `%%}%%` や、
   次の行終端までの間に U+2028 か U+2029 がある `%%}%%` は、
   閉じ記号の行を始めません。
3. すべての `'` を `"` として読みます。
   そのため、単一引用符のキーや文字列を使った引数も、正しい JSON になります。
   [fixture: common/directive-single-quotes]

その結果の中で、
[ディレクティブの位置](#ディレクティブの位置)
と同じようにディレクティブを見つけます。
この走査はコメント行を見ないので、コメント行の上のディレクティブも、
他のディレクティブと同じように図を設定します。
[fixture: common/directive-in-comment] [fixture:
common/config-directive-in-comment] 一方、閉じ記号の行の上のディレクティブは、
行と一緒に取り除かれます。
`%%}%% %%{init: ...}%%` は、何も設定しないコメント行です。
ディレクティブと `%%}%%` の間に U+2028 があると、行は取り除かれず、
ディレクティブが適用されます。
[fixture: common/config-closing-marker-line] [fixture:
common/config-closing-marker-line-u2028]

ディレクティブの**引数の値**は、引数が語であればその語の文字列で、
ディレクティブに引数がないか、自由テキストの引数が空であれば null です。
空でない自由テキストの引数は、
先頭と末尾の空白を取り除いてから JSON として解析します。
オブジェクトに同じキーが 2 回あれば、後の値が効きます。
解析は、以下の段階が見るディレクティブについてだけ行います。

### init ディレクティブ

**init ディレクティブ**は、
名前が `init` か `initialize` で終わるディレクティブです。
完全に一致するかで比べます。
`init`、`initialize`、`myinit`、`reinitialize` は init ディレクティブで、
`INIT`、`Init`、`init2` は違います。
`wrap` やその他の名前も違います。
[fixture: common/config-init-name-suffix] [fixture:
common/config-init-name-reinitialize] [fixture:
common/config-init-name-uppercase] [fixture:
common/config-init-name-capitalized] [fixture:
common/config-init-name-digit-after] [fixture: common/directive-unknown-name]

init ディレクティブはソースの順に取ります。
そのどれかの引数が正しい JSON でなければ、走査はそのディレクティブで止まり、
init の設定はまったくありません。
それより前の init ディレクティブも適用されません。
mermaid.js は入力を受理します。
[fixture: common/directive-bad-json] [fixture:
common/config-bad-json-drops-other-inits] 閉じる `}` の前のカンマも正しい JSON
ではありません。
`%%{init: {"flowchart": {"inheritDir": true},}}%%` は init の設定を与えません。
[fixture: common/config-init-trailing-comma] 正しい JSON を持つ閉じた init
ディレクティブは、
`flowchart LR` と `A-->B` の前の `%%{init: {"theme": "dark"}}%%` のように、
図のテキストの読み方を何も変えません。
[fixture: common/directive-init-theme] そうでなければ、**init
の設定**は次のとおりです。

- init ディレクティブがなければ、ありません。
- init ディレクティブが 1 つなら、その引数の値です。
  ただし、それが空なら、ありません。
  値はマッピングでなくてもかまいません。
  語の引数は文字列なので、`%%{init: 5}%%` は文字列 `5` になります。
- 2 つ以上なら、マッピングです。
  各引数の値にまずキーの絞り込み（[テキストの設定](#テキストの設定) を参照）
  を適用し、その後、値をソースの順に、
  深さを限った合成
  （[有効な設定](#有効な設定) を参照）で空のマッピングに合成します。
  入れ物でない値は何ももたらさず、リストはその要素を 1 つずつもたらします。
  [fixture: common/config-two-inits-merged] [fixture:
  common/directive-two-primitive-inits-wrap]

init の設定があるときは、mermaid.js は検出器をもう一度、
専用のテキストで試します。
フロントマターの後のソースに、
[図種の検出](#図種の検出) の 3 つの除去
（先頭のフロントマターのブロック、ディレクティブ、`%%` の並び）
を適用したテキストです。
ただし、その前にコメント領域と先頭の空白を取り除くことはしません。
どの検出器もこのテキストに一致しなければ、
[図種の検出](#図種の検出) の検出が成功する場合でも、
mermaid.js は入力を `UnknownDiagramError` で拒否します。
`error`、改行、テキストの最後の `%% x` は `error` 疑似図種ですが、
その前に init ディレクティブがあると、mermaid.js は拒否します。
ここでは `%%` の後に改行がないので、`%%` の除去はそれを残すからです。
この仕様は、この 2 回目の検出を行いません。
[fixture: common/error-trailing-comment-line] [fixture:
common/config-init-detection-rejects]

検出器が一致し、init の設定が `config` の項目を持つマッピングであれば、
その項目は、検出された id の名前のキーに移り、そこにあった項目を置き換えます。
キーは id そのものですが、`flowchart-v2` は `flowchart` になります。
init ディレクティブが 2 つ以上のときは、
キーの絞り込みがすでに `config` を取り除いているので、何も移りません。
[fixture: common/config-key-moves-to-diagram] [fixture:
common/config-key-dropped-with-two-inits]

### wrap ディレクティブ

**wrap ディレクティブ**は、名前が `wrap` を含むディレクティブです。
完全に一致するかで比べます。
wrap ディレクティブは準備したテキストの先頭から取ります。
ただし、init の走査が JSON のエラーで止まったときは、
止まったディレクティブの後からだけ取ります。
そのどれかの引数が正しい JSON でなければ、wrap フラグはありません。
そうでなければ、次のとおりです。

- wrap ディレクティブがちょうど 1 つなら、
  その名前が `wrap` のとき **wrap フラグ**は真で、
  他の名前ならフラグはありません。
- 2 つ以上なら、名前のどれかが `wrap` のときフラグは真で、そうでなければ偽です。

**ディレクティブの設定**は init の設定です。
init の設定がなければ、空のマッピングです。
wrap フラグがあるとき、ディレクティブの設定がマッピングなら、
フラグをその `wrap` の項目にします。
ディレクティブの設定が文字列、数、真のどれかなら、
mermaid.js は入力を `TypeError` で拒否します。
リストなら、何も変わりません。
そのため、mermaid.js は、`%%{init: 5}%%` と `%%{wrap}%%` の組を拒否し、
`%%{init: 5}%%` と `%%{nowrap}%%` だけなら受理し、
`%%{init: 5}%%` と `%%{nowrap}%%` と `%%{wrapper}%%` の組を拒否します。
[fixture: common/directive-primitive-init-wrap] [fixture:
common/directive-primitive-init-nowrap] [fixture:
common/directive-primitive-init-two-wrap-substrings]

### テキストの設定

**テキストの設定**は、空のマッピングに、
[`cleanAndMerge()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L861-L863)
がフロントマターの設定を、
次にディレクティブの設定を、
**深い合成**（es-toolkit の `merge`）で合成したものです。
入れ物でない合成元は、何ももたらしません。
合成元の入れ物を合成先の入れ物に合成するには、
合成元の各項目（リストでは各位置）を、合成先の同じキーの項目と組にして、
次のようにします。

- 合成元の項目がリストなら、合成先の項目は、
  合成先の項目がリストであればその複製に、そうでなければ新しい空のリストに、
  合成元の項目を合成したものになります。
- そうでなく、両方の項目が入れ物なら、合成元の項目を合成先の項目に合成します。
  マッピングをリストに合成しても、リストの要素は変わりません。
- そうでなく、合成先の項目がないか null で、合成元の項目がマッピングなら、
  合成先の項目は、新しい空のマッピングに合成元の項目を合成したものになります。
- それ以外では、前が何であっても、合成先の項目は合成元の項目になります。

そのため、ディレクティブがフロントマターに勝ち、
ディレクティブの設定の文字列や数は、
フロントマターの設定のマッピングを置き換えます。
テキストの設定そのものにリストを合成すると、キー `0`、`1` などができ、
キーの絞り込みがそれらを取り除きます。
そのため、フロントマターの設定やディレクティブの設定がリストだと、
何ももたらしません。
[fixture: common/config-directive-after-frontmatter] [fixture:
common/config-primitive-replaces-frontmatter-mapping]

その後、テキストの設定を 3 つの段階で処理します。

**1.
キーの絞り込み**
（[`sanitizeDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils/sanitizeDirective.ts#L38-L98)）。
テキストの設定に適用し、リストには各要素に適用することで適用します。
マッピングでは、各項目を順に見ます。

- キーが `__` で始まるか、`proto` を含むか、`constr` を含むか、
  設定のキーでないとき、または値が null のとき、項目を取り除きます。
  ある名前が、pin した mermaid.js の既定の設定のどこかの深さで、
  リストでない値のキーとして現れるとき、
  その名前は**設定のキー**です
  （[`configKeys`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/defaultConfig.ts#L346-L356)。
  [既定の設定](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/defaultConfig.ts#L18-L343)
  から求め、
  その値は
  [`config.schema.yaml`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/schemas/config.schema.yaml)
  と既定のテーマの変数から取ります）。
- 値が入れ物なら、それにも絞り込みを適用します。
  キー `nodeColors`、`filenameIcons`、
  `extensionIcons` は別の方法で絞り込みます。
  その各項目は、キーが `__` で始まるか、`proto` を含むか、`constr` を含むとき、
  または値が許される形の文字列でないとき、取り除かれます。
  `nodeColors` で許される形は、ASCII の英字の大文字小文字を区別せずに比べて、
  次のどれかです。
  `#` の後に 16 進数字が 3〜8 個続くもの。
  `rgb(` か `hsl(` の後に、ASCII の数字、空白、`%`、`,`、
  `.` のどれかである文字が 1 個以上続き、`)` で終わるもの。
  ASCII の英字が 1 個以上並んだもの。
  `filenameIcons` と `extensionIcons` で許される形は、
  語の文字か `-` である文字が 1 個以上並び、その後に省略可能な `:` と、
  同じ種類の文字の 1 個以上の並びが続くものです。
- 値が入れ物でなく、キーが `themeCSS`、`fontFamily`、
  `altFontFamily` のどれかを含む（完全に一致するかで比べます）とき、
  値は文字列でなければなりません。
  数や真偽値なら、mermaid.js は入力を `TypeError` で拒否します。
  波括弧がつり合っていない文字列は、
  テキスト `{ /* ERROR: Unbalanced CSS */ }` に置き換えられます。
  文字列の `{` と `}` の数が違うとき、
  または文字列のある先頭部分で `}` が `{` より多いとき、
  波括弧は**つり合っていません**。
  [fixture: common/config-css-key-not-string]

項目の後で、マッピングが空でない `themeVariables` を持つなら、
`themeVariables` の中の文字列のうち、空であるか、ASCII の英字、ASCII の数字、
空白（U+0020）、`"`、`#`、`%`、`(`、`)`、`,`、`.`、`;` 以外の文字を含むものを、
空文字列に置き換えます。
対象は、マッピングの項目の値と、リストの要素です。
`themeVariables` そのものが文字列で、そのような文字を含むときは、
mermaid.js は入力を `TypeError` で拒否します。
[fixture: common/config-theme-variables-string-rejected]

**2.
フォントファミリー**
（[`addDirective()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L277-L290)）。
テキストの設定の `fontFamily` が空でなく、
テキストの設定の `themeVariables` が空でない `fontFamily` を持たないとき、
`themeVariables` は新しいマッピングになります。
そのマッピングは、元の項目を持ち、
`fontFamily` にテキストの設定の `fontFamily` の値を持ちます。
元の項目は、元の値がマッピングならその項目、文字列ならその文字を位置ごとに、
リストならその要素を位置ごとに並べたもので、その他の値なら何もありません。

**3.
安全のための絞り込み**
（[`sanitize()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.ts#L235-L270)）。
テキストの設定の中のすべての入れ物に、上から順に適用します。
それぞれで、まずキー `secure` と、
サイト設定の `secure` の項目に挙げられたキーを取り除き、
次に `__` で始まるキーを取り除き、次に `<`、`>`、
`url(data:` のどれかを含む文字列の値をすべて取り除きます。
リストから取り除いた文字列は、その位置を空けたままにし、
後の合成はその位置を飛ばします。
[既定の `secure`
の一覧](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/schemas/config.schema.yaml#L334-L347)
は、`secure`、`securityLevel`、`startOnLoad`、`maxTextSize`、
`suppressErrorRendering`、`maxEdges` です。
`secure` 自身が含まれるので、テキストはこの一覧を変えられません。
[fixture: common/config-secure-key-ignored]

その結果がテキストの設定です。
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
が `config` として返すものと同じです。

### 有効な設定

**サイト設定**は、pin した mermaid.js の既定の設定に、
[`mermaid.initialize()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L702-L740)
に渡した設定を加えたものです。
サイト設定が必要な fixture は、
それを `expected.json` の `config` 欄に記録します。

**有効な設定**は、サイト設定の複製に、
テキストの設定を**深さを限った合成**
（[`assignWithDepth()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/assignWithDepth.ts#L30-L91)）で合成したものです。
まずテキストの設定を空のマッピングに合成し、その結果を複製に合成します。
合成元の値を合成先の値に、深さ（2 から始まります）を付けて合成するには、
次のようにします。

- 合成元がリストで合成先がリストでなければ、合成元の各要素を順に、
  同じ深さで合成先に合成します。
- どちらもリストなら、合成元の要素のうち、
  まだ合成先の要素でないものを合成先の末尾に加えます。
  入れ物は、すでに要素であることはありません。
- そうでなく、合成先がないか null であるか、深さが 0 なら、次のようにします。
  どちらも入れ物であれば、合成元の各項目を合成先にコピーし、そこにあった項目を、
  合成せずに置き換えます。
  そうでなければ、合成元が合成先を置き換えます。
- そうでなく、どちらも入れ物なら、合成元の各項目を、
  同じキーの合成先の項目に合成します。
  null の合成元の項目は飛ばします。
  合成元の項目が入れ物なら、
  合成先にない項目はまず同じ種類の新しい空の入れ物になり、
  入れ物か null である合成先の項目は、
  深さを 1 減らして合成元の項目をそれに合成したものになります。
  文字列、数、真偽値の合成先の項目はそのままです。
  合成元の項目が入れ物でなければ、合成先の項目が入れ物か null でない限り、
  合成元の項目がそれを置き換えます。
- それ以外では、合成先はそのままです。

そのため、テキストの値が既定値を変えるのは、両方が入れ物で合成されるときと、
どちらも入れ物でなく置き換えるときだけです。
`%%{init: {"flowchart": {"inheritDir": {"a": 1}}}}%%` は、
`flowchart.inheritDir` を既定値のままにします。
[fixture: common/config-mapping-does-not-replace-default]

有効な設定からは、テーマやその他の見た目の設定も導かれます。
これらは描画に影響するものですが、
導く処理で mermaid.js が入力を拒否することがあります。
mermaid.js は `themeVariables` から色の値を読み、
解析できない値があると入力を拒否します。
`%%{init: {"themeVariables": {"primaryColor": "notacolor"}}}%%` がその例です。
[fixture: common/config-theme-colour-rejected]

[`renderDiagram()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L477-L680)
は、解析の前にテキストの設定とタイトルを適用します。
`mermaid.parse()` は同じ設定を適用しますが、タイトルは適用しません。
fixture は `renderDiagram()` に従います。

## 既知の差

[known-divergences.ja.md](./known-divergences.ja.md) で定める差のうち、
次のものがこの文書で定めることに関わります。

- [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md):
  `RawText` でも `Identifier` でもない単位の中のディレクティブ。
- [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md):
  フロントマターの中で始まる HTML タグ。
- [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md):
  この仕様が解析も検査もしない埋め込みデータ。

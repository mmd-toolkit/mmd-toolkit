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

長さを測る箇所では、単位は UTF-16 のコード単位で、本文でそう述べます。
下の `maxTextSize` の上限です。

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
参考として
[設定（参考）](../../tests/docs/configuration.ja.md#設定参考) で述べます。

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
`maxTextSize` はサイト設定でしか設定できず
（[有効な設定](../../tests/docs/configuration.ja.md#有効な設定) を参照）、
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
   コメント行の中でも、単位の途中でも始まり、
   その場合、その単位は mermaid.js の読み方を保つか、
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
   その後、中にディレクティブを持つ単位は、
   mermaid.js の読み方を保つか、
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
これは字句解析器の読み方で、mermaid.js が Db にテキストを持つときの形です。
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
Db の値が設定に依存する場合、
その設定は mermaid.js が求めるものです
（[設定（参考）](../../tests/docs/configuration.ja.md#設定参考)）。

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
[フロントマターの本文の読み方](../../tests/docs/configuration.ja.md#フロントマターの本文の読み方) で述べます。

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
[設定の走査](../../tests/docs/configuration.ja.md#設定の走査) を参照してください。

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

- **単位**は、図の字句解析器の 1 つの規則が一度に読むものです。
  各図の文書が単位を定め、
  その字句解析器が読む空白のない名前の単位、つまり**名前の単位**と、
  引用符のないテキストと空白を含みうる名前の単位、つまり**テキストの単位**と、
  引用符で囲んだ文字列とバッククォートの名前の単位、
  つまり**文字列の単位**を挙げます
  （flowchart については
  [単位と文脈](./diagrams/flowchart.ja.md#単位と文脈) と
  [単位の中のディレクティブ](./diagrams/flowchart.ja.md#単位の中のディレクティブ) を参照）。
  テキストの単位と文字列の単位は、
  どの 2 つの文字の間にもディレクティブを持ってかまいません。
  名前の単位、キーワード、`:::` のような区切り記号、矢印、数のような、
  ほかの単位は持てず、
  入力は拒否されます。
  2 つの単位の間のディレクティブは許されます。
  ただし、flowchart で円を開く 2 つの `(` のように、
  図の文書が合わせて 1 つの名前か 1 つの区切り記号とする
  2 つの単位の間は除きます。
  そのディレクティブはその名前か区切り記号の中にあり、入力は拒否されます。
  `error` 疑似図種では、文字の並びはどれもテキストなので、
  ディレクティブはどこにあってもかまいません。

- コメント領域の中のディレクティブは、
  字句解析器が領域全体を読み進めるので（[コメント行](#コメント行) を参照）、
  領域と一緒に読み進められます。
  1 つの単位の読む中にある領域でも同じで、領域はその単位のトークンを切ります。
  コメントの `%%` の後のディレクティブはコメントの一部で、
  その前のディレクティブはコメントの一部ではありません。
  [fixture: common/comment-region-directive-in-string] [fixture:
  common/comment-directive-in-string]

トークンの間や、トークンの端の空白の中にあるディレクティブは、
mermaid.js とまったく同じに振る舞います。
[fixture: common/directive-mid-line] [fixture: common/directive-after-link]
[fixture: common/comment-after-directive] [fixture:
common/directive-joins-lines]

字句解析器はディレクティブのないテキストを読むので、
テキストの単位と文字列の単位の中のディレクティブも、
mermaid.js と同じ結果になります。
flowchart では、`A[x%%{init: {}}%%y]` のラベルは `xy` です。
`flowchart%%{init: {}}%%LR` は、テキストが `flowchartLR` なので、
mermaid.js と同じく拒否されます。
[fixture: common/directive-in-label-text] [fixture:
common/directive-between-header-and-direction]
文字列の中では、ディレクティブの周りの空白が残ります。
`A["a %%{init: {}}%% b"]` のラベルは `a`、空白 2 つ、`b` で、
文字列の中のディレクティブの引用符は、文字列を終えません。
[fixture: common/directive-in-string] [fixture:
flowchart/lex-directive-in-string-with-quotes]
2 つのトークンの間の空白の中のディレクティブは、何も変えません。
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
名前、キーワード、区切り記号、矢印、数の中のディレクティブは、
入力を拒否させます。
mermaid.js はそれを受理します。
mermaid.js は `end%%{init: {}}%%x` をキーワード `end` でなく頂点 `endx` と読み、
ここではディレクティブは名前の中にあります。
[fixture: common/directive-keyword-followed-by-text]
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
ディレクティブの範囲と同じく除きます。
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
木に現れるのは、そのディレクティブだけで、`Root.directives` に並びます。
空白と行終端は、どのノードにも属しません。
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
[fixture: common/comment-in-string] [fixture:
common/comment-blank-line-before-in-string]

これにより、トークンの中で特別な意味を持つ文字がコメント行に含まれていても、
受理は mermaid.js と同じになります。
例は、引用符付きラベルの中のコメント行にある `"` です。
[fixture: common/comment-with-quote-in-string]

コメント領域は、図のコメント、
つまり図自身の字句解析器が行の終わりまで読むコメントも、
同じように切ります。
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
この仕様はそれを走らせません
（[init ディレクティブ](../../tests/docs/configuration.ja.md#init-ディレクティブ) と
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
無視される `;` は、ディレクティブと同じく、テキストと文字列の中と、
2 つの単位の間にあってかまいません
（[ディレクティブはトークンの境界](#ディレクティブはトークンの境界) を参照）。
名前、数、キーワード、矢印、区切り記号の中なら入力を拒否させ、
mermaid.js はそれを受理します。
mermaid.js では、`A[style:#x] --> B;b` は頂点 `Bb` を、
`A[style:#x] -;-> B` は辺 `-->` を持ちます。
[`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.ja.md)
を見てください。
[fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
flowchart/div-ignored-semicolon-in-arrow]

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

## エンティティ

エンティティは、コメント領域の外で
（agentflow では、行単位の規則と同じくコメント領域を除きません）、
ディレクティブのないテキストの中で、左から順に探します。
ディレクティブの前の文字と後の文字は続いているので、
エンティティは 2 つの文字の間にディレクティブを持つことがあります。
そのディレクティブはエンティティを含む単位の中にあり、
[ディレクティブはトークンの境界](#ディレクティブはトークンの境界)
の規則が当てはまります。
テキストの単位の中でも文字列の中でも、
エンティティは mermaid.js と同じに読まれます。
[fixture: common/directive-in-entity] [fixture:
flowchart/lex-directive-in-string-entity]
エンティティは、
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

## 既知の差

[known-divergences.ja.md](./known-divergences.ja.md) で定める差のうち、
次のものがこの文書で定めることに関わります。

- [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md):
  名前、キーワード、区切り記号、矢印、数の中のディレクティブ。
- [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md):
  フロントマターの中で始まる HTML タグ。
- [`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.ja.md):
  名前、数、キーワード、矢印、区切り記号の中の無視される `;`。
- [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md):
  この仕様が解析も検査もしない埋め込みデータ。

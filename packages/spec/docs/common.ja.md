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

- **トリビアの規則**: ソースのどの部分が図のテキストでないかを定めます。
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
例外は、
[known-divergences.ja.md](./known-divergences.ja.md) で定める意図的な違いです。

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
他の図種の検出器についての主張（[detection.ja.md](./detection.ja.md)
を参照）です。

## 表記

- **文字**は、Unicode のコードポイントです。
  BMP の外の文字は 1 文字で、単独のサロゲート（サロゲートペアの一部でない、
  サロゲートのコード単位）も、1 文字です。
  単独のサロゲートは、整形式のテキストでは有効なコードポイントではありませんが、
  それでも 1 文字として数えます。
- **空白**は、U+0009〜U+000D、U+0020、U+00A0、U+1680、U+2000〜U+200A、U+2028、
  U+2029、U+202F、U+205F、U+3000、U+FEFF のどれかです。
  バイトオーダーマークを含みます。
  mermaid.js のパターンが空白として扱う集合と同じです。
  [fixture: common/whitespace-characters]
  [fixture: sequence/lex-whitespace-characters-around-text]
- **行終端**は、`\r\n`、単独の `\r`、単独の `\n` です。
  U+2028 と U+2029 は行終端ではありません。
- **行内の空白**は、行終端の一部でない空白です。
- **行**は、行終端を含まない最長の文字の並びです。
  **空白だけの行**は、空の行か、行内の空白だけからなる行です。
- **語の文字**は、ASCII の英字（`A`〜`Z`、`a`〜`z`）、ASCII の数字（`0`〜`9`）、
  `_` です。
  **語**は、語の文字の最長の並びです。
  他の文字や数字は、語の文字ではありません。
- **行区間**は、行終端、U+2028、U+2029 を含まない最長の文字の並びです。
- 2 つの文字は、同じ文字であるとき、または両方が基本多言語面（BMP、
  U+0000〜U+FFFF）にあって正準形が等しいとき、
  **大文字小文字を区別せずに一致**します。
  BMP の文字の正準形は、言語に固有の規則を使わない、
  Unicode の完全な大文字化の対応による大文字が、
  BMP の 1 文字であればその大文字、そうでなければその文字自身です。
  ただし例外として、ASCII の外の文字で、大文字が ASCII の文字になるものは、
  その文字自身を正準形とします。
  そのため、`a` は `A` と、`é` は `É` と一致します。
  一方、`ß` は `S` とも `SS` とも一致せず、
  U+017F（LATIN SMALL LETTER LONG S）は `s` とも `S` とも一致せず（大文字が
  ASCII の `S` のため）、
  U+212A（KELVIN SIGN）は `k` と一致せず（`k` は `K` になり、
  U+212A はそのまま）、 BMP の外の文字は他の文字と一致しません。
  mermaid.js の大文字小文字を区別しない検出器は、この方法で比べます。
  [fixture: common/detect-case-kelvin-sign] [fixture: common/detect-case-long-s]
- **トークン**は、字句解析器がテキストから切り出して文法に渡すものの一般名です。
  「mermaid.js は空の文字列にトークンを読まない」のように使います。
  この仕様の規則は、
  トークンでなく単位を読みます（[用語](./index.ja.md#用語) を参照）。
  この語は、実装が記録するものを指しません。
- 文法の規則は次の表記を使います。
  規則は、名前、`=`、定義の順に書きます。
  二重引用符で囲んだ文字列は、そのままの文字列です。
  二重引用符そのものは単一引用符で囲んで書きます。
  並べて書いた項目は、その順に続きます。
  `|` は選択肢を区切り、選択肢は順に試すものではありません。
  入力は、文法の残りもそれを読める選択肢で読みます。
  state 図で、`statement` の最初の選択肢 `definition-statement` は、
  `A --> B` の `A` を読みますが、次に読む規則のない `-->` を残すので、
  `A --> B` は `transition-statement` です。
  [fixture: state/lex-two-transitions-one-line]
  2 つの選択肢が同じ単位を読めるところでは、どちらで読むかを図の文書が述べます。
  項目の後の `?` は省略可能、`*` は 0 回以上の繰り返し、
  `+` は 1 回以上の繰り返しを表します。
  丸括弧は項目をまとめます。
  規則に別の記述がなければ、`*` と `+` はできるだけ多く繰り返します。
- 図の字句解析器の規則は、文章で書きます。
  そのような規則が、
  「…以外の 1 個以上の文字」や「0 個以上の空白」のような繰り返しを、
  いくつ読むかを書かずに読むときは、規則の残りがそこで一致する範囲で、
  できるだけ多くの文字を読みます。
  できるだけ少なく読む規則は、そう書きます。
  1 つの規則が繰り返しを 2 つ以上読むときは、左から順に、それぞれを、
  規則の残りが一致する範囲でできるだけ多く読みます。
  前の繰り返しが読めるものを、後の繰り返しに回すことはしません。
  flowchart の `click A call cb(1, "x")` は、
  文法が 1 回だけ取る `callback-arguments` の単位 `1, "x"` を 1 つ持ちます。
  state の複数行のノートのテキストは、
  その後の最初の `end note` の行で終わります。
  その規則は、できるだけ少なく読むからです。
  `note right of A`、`x`、`end note`、`B`、`note left of B`、`y`、
  `end note` の 7 行は 2 つのノートで、 A の `x` と B の `y` です。
  [fixture: flowchart/gram-click-call] [fixture: state/lex-note-block-two-notes]
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
下の `maxTextSize` の上限と、
treeview の [branch の列](./diagrams/treeview.ja.md)です。
[fixture: treeview/box-column-nonbmp-discriminating]

## mermaid.js とこの仕様

[`preprocessDiagram()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/preprocess.ts#L58-L91)、
[`Diagram.fromText()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/Diagram.ts#L19-L85)、
[`detectType()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/detectType.ts#L36-L51)
は、次の段階をこの順に適用します。
最後の列は、この仕様がそれぞれをどう述べ直しているかです。

| 段階 | mermaid.js                                                                 | この仕様                                                                                                             |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | `\r\n` と単独の `\r` が `\n` になる。                                      | 字句の規則と変換: [行終端](#行終端)                                                                                  |
| 2    | `<tag ...>` の中で、`="..."` が `='...'` になる。                          | 字句の規則と変換: [HTML 属性の引用符](#html-属性の引用符)。フロントマターの後のテキストで                            |
| 3    | 先頭の YAML ブロックを解析し、取り除く。                                   | トリビアの規則: [フロントマター](#フロントマター)。本文は解析しない。                                                |
| 4    | すべての `%%{ ... }%%` を、どこにあっても設定として解析し、取り除く。      | トリビアの規則: [ディレクティブ](#ディレクティブ)。引数は解析しない。                                                |
| 5    | コメント行を取り除き、先頭の空白を削る。                                   | トリビアの規則: [コメント行](#コメント行) と [先頭の空白](#先頭の空白)                                               |
| 6    | 登録された検出器のうち、最初に一致したものが図種を選ぶ。                   | [図種の検出](#図種の検出)。図のテキストの最初の単位で決める                                                          |
| 7    | 一部の `style` 行から `;` を 1 つ落とし、`#name;` をプレースホルダにする。 | 行単位の規則: [`style` 行と `classDef` 行](#style-行と-classdef-行)。字句の規則と変換: [エンティティ](#エンティティ) |
| 8    | `\n` を末尾に足す。                                                        | 字句の規則: [テキストの終わり](#テキストの終わり)                                                                    |
| 9    | 一部の図は、字句解析の前にテキストをもう一度書き換える。                   | 各図の文書で述べる                                                                                                   |

mermaid.js では、各段階が前の段階の出力を書き換えます。
この仕様は、これらの段階をすべて、
字句解析器がソースを左から右へ 1 回読む間に適用する規則として定めます。
[ソースの読み方](#ソースの読み方) を参照してください。
規則は、既知の差異を除いて、段階と同じ単位と値を与えます。
後の規則が読むための書き換えたテキストを作る規則はなく、
ソース以外のテキストを読む規則もありません。
mermaid.js が書き換えたテキストの上で何かを決めるとき（図種がそうです）、
この仕様はその規則をソースの上で述べ、
それによって違って読まれる入力を既知の差異とします。
段階 3 と 4 で mermaid.js が設定をどう求めるかは、
参考として [設定（参考）](../../tests/docs/configuration.ja.md#設定参考)
で述べます。

段階 1〜4、6、8 は、すべての図種で同じです。
図の Db が `preserveCommentsWhenParsing` を設定している場合、
段階 5 はパーサーへの入力には適用されず、
検出にだけ適用されます（mermaid.js の
[`Diagram.fromText()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/Diagram.ts#L66-L77)）。
そのとき段階 7 は、パーサーが受け取るテキストに対して働くので、
コメント行と先頭の空白も見ます。
pin した mermaid.js でそうしているのは agentflow と eventmodeling の Db です。
そのパーサーは、コメント行と先頭の空白を受け取ります。
ただし、大きさはフロントマターの完全なトリビアの後のソースで測ります。
閉じの --- の行の後に続く空白だけの行も、そのトリビアに含めます。
ディレクティブを除き、`\r\n` を 1 つと数えます。
その長さが `maxTextSize` UTF-16 コード単位を超える場合は、
段階 5 がいつもどおり適用されます。
[fixture: agentflow/comment-default-size-equal-crlf]
[fixture: agentflow/comment-default-size-above-crlf]
[fixture: agentflow/comment-default-size-equal-inline-directive]
[fixture: agentflow/comment-default-size-above-inline-directive]
[fixture: agentflow/comment-default-size-equal-frontmatter]
[fixture: agentflow/comment-default-size-above-frontmatter]
[fixture: agentflow/frontmatter-extra-trivia-below]
[fixture: agentflow/frontmatter-extra-trivia-boundary]
[fixture: agentflow/frontmatter-extra-whitespace-line-boundary]
[fixture: agentflow/frontmatter-extra-trivia-above]
[fixture: eventmodeling/comment-default-size-equal]
[fixture: eventmodeling/comment-default-size-above]
[fixture: eventmodeling/comment-default-size-equal-crlf]
[fixture: eventmodeling/comment-default-size-above-crlf]
[fixture: eventmodeling/comment-default-size-equal-inline-directive]
[fixture: eventmodeling/comment-default-size-above-inline-directive]
[fixture: eventmodeling/comment-default-size-equal-frontmatter]
[fixture: eventmodeling/comment-default-size-above-frontmatter]
[fixture: eventmodeling/frontmatter-extra-trivia-below]
[fixture: eventmodeling/frontmatter-extra-trivia-boundary]
[fixture: eventmodeling/frontmatter-extra-trivia-above]
[fixture: eventmodeling/frontmatter-extra-whitespace-line-boundary]
`maxTextSize` はサイト設定でしか設定できず（詳しくは
[有効な設定](../../tests/docs/configuration.ja.md#有効な設定) を参照）、
既定値は 50000 です。
agentflow と eventmodeling の文書で、
その字句解析器がこれらをどう扱うかを述べます。

### ソースの読み方

字句解析器は、ソースを左から右へ 1 回読みます。
書き換えたテキストは作りません。
以下の各規則は、それが効く位置で適用します。

オフセット 0 で、
字句解析器はソースがフロントマターで始まるかを決めます（詳しくは
[フロントマター](#フロントマター) を参照）。
始まるなら、フロントマターは木の `Frontmatter` で、その後から読み進めます。
フロントマターのトリビアの後のソース、フロントマターがなければソース全体を、
**テキスト**と呼びます。
この文書の規則は、テキストに適用します。
そこからは、各位置で次のものを順に試します。

1. **コメント領域**。
   コメント開始位置で試します（[コメント行](#コメント行)）。
   字句解析器は、空白、行終端、ディレクティブを越えて先を見ます。
   コメントに行き着けば、コメント開始位置から、
   そのコメントの行を終える行終端（あれば）までがコメント領域で、トリビアです。
2. **行単位の規則**。
   行区間の先頭で試します。
   [`style` 行と `classDef` 行](#style-行と-classdef-行) を参照してください。
   字句解析器は行区間の終わりまで先を見て、
   そのどの `;` を規則が無視するかを決めます。
3. この位置で始まる**ディレクティブ**
   （[ディレクティブの位置](#ディレクティブの位置)）。
   木の 1 つの `Directive` で、中の行終端は行を終えません。
   ディレクティブはどこでも始まりえます。
   コメント行の中でも、単位の途中でも始まり、その場合、
   その単位は mermaid.js の読み方を保つか、入力を拒否させます。
   [ディレクティブはトークンの境界](#ディレクティブはトークンの境界)
   を参照してください。
   コメント領域の中のディレクティブは、その領域の一部で（項目 1）、
   そのどちらもしません。
4. **図の単位の規則**。
   それに一致させる間、字句解析器は、行終端を `\n` として（[行終端](#行終端)）、
   属性の引用符を `'` として（[HTML 属性の引用符](#html-属性の引用符)）、
   エンティティを、
   そのプレースホルダとして（[エンティティ](#エンティティ)）読みます。
   コメント領域、行単位の規則が無視する `;`、ディレクティブは、
   ないかのように読み進めます。
   その後、中にディレクティブを持つ単位は、 mermaid.js の読み方を保つか、
   入力を拒否させます。
   [ディレクティブはトークンの境界](#ディレクティブはトークンの境界)
   を参照してください。

図の字句解析器が読む文字、
つまりテキストのうちディレクティブとコメント領域の外にあり、
行単位の規則が無視する `;` でない文字を、**図のテキスト**と呼びます。
図のテキストは、図が単位の間のトリビアとする空白や行終端も含みます。
agentflow と eventmodeling では、字句解析器がコメント行を自分で読むので、
コメント領域の文字も図のテキストです。
[mermaid.js とこの仕様](#mermaidjs-とこの仕様) を参照してください。

図のテキストの**変換した形**は、字句解析器が読むとおりのテキストです。
行終端は `\n`、属性の引用符は `'`、エンティティはそのプレースホルダになります。
これは字句解析器の読み方で、mermaid.js が Db にテキストを持つときの形です。
木の値は変換した形ではなく、
書き手が書いたとおりのテキストを保ちます（[ast.ja.md](./ast.ja.md#ノード)
を参照）。

先頭の空白、行終端、ディレクティブ、
コメント領域はトリビアです（[先頭の空白](#先頭の空白)）。
検出が図種と図の字句解析器を選びます（[図種の検出](#図種の検出)）。
これは入力を拒否することがあります。
検出は、ヘッダーの前の先頭以外のフロントマター形のブロックを、
1 つ通過させる場合があります。
ブロックは図のテキストのままです。
pie、gitgraph、info、packet、architecture、radar、railroad、wardley、cynefin、
eventmodeling は隠れた YAML の規則を適用します。
以下で引用する拒否例の範囲は、その fixture の図種です。
共通のフロントマターやトリビアではありません。
[fixture: pie/frontmatter-nonleading-comment]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: info/frontmatter-nonleading-comment]
[fixture: packet/detect-one-block]
[fixture: pie/lex-yaml-leading-config-not-applied]
[fixture: common/directive-before-frontmatter]
[fixture: common/frontmatter-nonleading-sequence]
[fixture: common/frontmatter-nonleading-class]
[fixture: common/frontmatter-nonleading-state]
[fixture: agentflow/db-frontmatter-after-comment]
[fixture: block/gram-frontmatter-comment-before]
[fixture: ishikawa/frontmatter-after-comment]
[fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before]
[fixture: radar/retained-yaml-control]
[fixture: wardley/detect-block-after-directive]
[fixture: cynefin/detect-block-after-directive]
[fixture: eventmodeling/detect-real-retained-secondscan]

ソースの最後の文字の後には、
`\n` をもう 1 つ読みます（[テキストの終わり](#テキストの終わり)）。
上の段階 9 の追加の書き換えを含め、図がほかに何をするかは、
その図の文書で述べます。

位置の周りの文字だけでは決まらない規則が 1 つあり、
それ自身の規則として述べます。
**HTML 属性の引用符**です。
`"` を `'` として読むかどうかは、ずっと前で、コメント行の中でも始まりえて、
複数行にわたりうるタグによって決まります。
タグは、テキスト全体を、
左から右へ読んで見つけます（[HTML 属性の引用符](#html-属性の引用符)）。

それ以外の規則は、位置の周りの文字で決まります。
ディレクティブはその `%%{` からの文字で、
コメント領域はコメント開始位置からそのコメントの行の終わりまでで、
図種は「図種の検出」で定める通過後の図のテキストで、行単位の規則はその行区間で、
エンティティは `#`、語、`;` で決まります。

agentflow と eventmodeling では、項目 1 は字句解析器には適用されません。
字句解析器がコメント行と先頭の空白を自分で読み、
行単位の規則とエンティティもそれらに適用されます。
上で述べたとおりです。

フロントマターの本文、ディレクティブの引数、図の `@{ ... }` のデータブロックは、
決して解析しません。
Db の値が設定に依存する場合、
その設定は mermaid.js が求めるものです（詳しくは
[設定（参考）](../../tests/docs/configuration.ja.md#設定参考) を参照）。

検出が図種を選び、字句解析器が読んだものを図の文法と Db が受け入れるとき、
入力は受理されます。

Wardley も残存 YAML と真の第 2 scan の directive を、
WardleyDiagram.textBeforeHeader の WardleyIgnoredText として読み、
残存 YAML の properties は適用しません。
通した裸の行と伴う trivia は残存形の間も再読せず、
native の閉じ境界は適用します。
[検出規則](./diagrams/wardley.ja.md#検出)が一つの block の skip、停止条件、
prefix の両順序を区別し、 [木](./ast/wardley.ja.md)が所有を定めます。
[fixture: wardley/detect-block-after-directive]
[fixture: wardley/detect-real-before-retained-secondscan]
[fixture: wardley/detect-retained-two]
[fixture: wardley/prefix-yaml-after-secondscan]
[fixture: wardley/prefix-yaml-before-secondscan]
[fixture: wardley/detect-secondscan-glued]
[fixture: wardley/detect-retained-secondscan-bare-ascii]
[fixture: wardley/detect-retained-secondscan-bare-ls]

Cynefin は、retained YAML と本物の二度目の走査の directive を、
CynefinDiagram.textBeforeHeader の CynefinIgnoredText として読みます。
retained YAML の属性は設定になりません。
通過した裸の行と一緒に通過した空白と改行は、
retained な形の間でも共有の Comment と trivia となり、
native の閉じの境目は依然必要です。
[検出の規則](./diagrams/cynefin.ja.md#検出)が一つのブロックの飛ばし、停止条件、
接頭の両順序を区別し、 [木](./ast/cynefin.ja.md)が名前つきの所有者を定めます。
[fixture: cynefin/detect-real-before-retained-secondscan]
[fixture: cynefin/detect-retained-yaml-properties]
[fixture: cynefin/prefix-yaml-before-secondscan]
[fixture: cynefin/prefix-yaml-after-secondscan]
[fixture: cynefin/detect-retained-two]
[fixture: cynefin/detect-secondscan-glued]
[fixture: cynefin/detect-retained-secondscan-bare-ascii]
[fixture: cynefin/detect-retained-secondscan-bare-ls]

eventmodeling は common grammar を import しませんが、固有の native YAML、
directive、percent/slash comment の規則を持ちます。
[検出の規則](./diagrams/eventmodeling.ja.md#検出)が本当の frontmatter、
一つの retained block の通過、裸の行の通過、二度目の directive 走査を区別し、
[木](./ast/eventmodeling.ja.md#gap-の所有)が retained form の所有者を定めます。
native の一般空白が LS と PS を含むため、
引用した裸の行の有無の対照は両方受理します。
EM_* metadata の規則は共通 metadata converter を使いません。
[fixture: eventmodeling/detect-real-retained-secondscan]
[fixture: eventmodeling/detect-retained-two]
[fixture: eventmodeling/detect-secondscan-yaml]
[fixture: eventmodeling/detect-yaml-secondscan]
[fixture: eventmodeling/detect-secondscan-glued]
[fixture: eventmodeling/detect-retained-bare-ls-line]
[fixture: eventmodeling/detect-retained-no-bare-ls-line]
[fixture: eventmodeling/common-inline]
[fixture: eventmodeling/common-line-keywords]

treeview は共通文法を import せず、
native YAML と hidden directive の規則を持ちません。
見出し前に保持された YAML は拒否し、
1 行の 2 回目の scan の形は native Comment になりえます。
通過した裸の行と付随する trivia は再び読みません。
[罫線の直接規則](./diagrams/treeview.ja.md)は原文の行の prefix と装飾を、
引用名や accessibility block の中でも読みます。
[木](./ast/treeview.ja.md)では名前つき owner または包む葉にそれらを保ちます。
[fixture: treeview/detect-block-after-directive]
[fixture: treeview/detect-secondscan-singleline]
[fixture: treeview/detect-secondscan-bare-ascii]
[fixture: treeview/box-written-tree] [fixture: treeview/box-multiline-quoted]
[fixture: treeview/box-block-decoration]

## 行終端

字句の規則: 字句解析器は、`\r\n` と単独の `\r` を `\n` として読みます。
そのため、単独の `\r` はフロントマターやディレクティブの中を含め、
どこでも改行です。 [fixture: common/cr-only] [fixture: common/crlf] [fixture:
common/frontmatter-lone-cr] [fixture: common/directive-spans-lone-cr]

`\r` の後に `\n` が続くかどうかは、何かを除く前に、ソースの上で決めます。
間にディレクティブかコメント領域がある `\r` と `\n` は、どの規則でも、
2 つの行終端です。
mermaid.js は、ディレクティブとコメント行を取り除く前に行終端を読むからです。
そのため、`A[a`、単独の `\r`、ディレクティブ、`\n`、`b]` の Db のラベルは、`a`、
改行 2 つ、`b` です。 [fixture: flowchart/lex-lone-cr-directive-lf-label]

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
[fixture: common/html-attribute-quotes-no-word-after-lt]
[fixture: common/html-attribute-quotes-digit-tag-name]
[fixture: common/html-attribute-quotes-no-closing-gt]
[fixture: common/html-attribute-quotes-tag-over-lines]
[fixture: common/html-attribute-quotes-two-tags]

各属性部の中で、引用符付きの属性値を左から順に探します。

```text
quoted-value    = "=" '"' (any character except '"')* '"'
```

字句解析器は、引用符付きの属性値の 2 つの `"` を `'` として読みます。
置き換えは長さが変わらないので、他の文字は動きません。
タグと引用符付きの値は、書かれたとおりのテキストの文字の中で探します。
ディレクティブ、コメント行、行単位の規則が無視する `;` も含みます。
フロントマターの中は探しません。
[fixture: flowchart/html-tag-starts-in-frontmatter]
[fixture: common/html-attribute-quotes-space-around-equals]

変換: 同じ文字は、テキストの変換した形では `'` です。
`A[<a href="u">t</a>]` のラベルは、Db では `<a href='u'>t</a>` で、
木の値は `"` を保ちます。 [fixture: common/html-attribute-quotes]

`"` を `'` として読むことは、受理にも効きます。
flowchart ではラベルの文字列の中の `"` が引用符付き文字列を始めるので、
この規則がなければ同じラベルは拒否されます。

mermaid.js は、文法を変えずにラベルの中の HTML の属性値に `"` を使えるように、
この置き換えを
[`cleanupText()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/preprocess.ts#L6-L17)
で行い、フロントマター、ディレクティブ、
コメント行を取り除く前にソース全体に適用します。
フロントマターの中を除いて（詳しくは
[`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md)
を参照）、この仕様は、その帰結も含めて意図的にそのまま従います。

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
  `y` の後の `"` で終わるので、ラベルは `<a`、改行、 `y' z>e` です。
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
[`extractFrontMatter()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/frontmatter.ts#L24-L69)
です。
次の条件がすべて成り立つとき、ソースはフロントマターを持ちます。

1. **開始行**はソースの最初の行です。
   _字下げ_（0 個以上の行内の空白）、`---`、省略可能な行内の空白からなり、
   行終端で終わります。
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
   区切り行ではありません。 [fixture: common/frontmatter-indented] [fixture:
   common/frontmatter-indent-mismatch] [fixture:
   common/frontmatter-nested-dashes] [fixture:
   common/frontmatter-closing-trailing-text] [fixture:
   common/frontmatter-no-newline-after]
   区切りが空白 2 つで字下げされていれば、
   本文のブロックスカラーの中の空白 6 つで字下げした `---` は区切り行ではなく、
   タイトルは `---` と改行です。
   本文を 0 桁にし、ブロックスカラーの `---` を空白 2 つで字下げすると、
   その行がフロントマターを閉じ、入力は拒否されます。
   [fixture: common/frontmatter-indented-block-scalar-dashes] [fixture:
   common/frontmatter-indented-closing-in-body]
   `--- !!map` は区切り行ではないので、`---`、`%YAML 1.2`、`--- !!map`、
   `title: x`、 `---` はタイトルが `x` のフロントマターです。
   `--- !!map` を `---` と `!!map` に分けると、
   `%YAML 1.2` の後の `---` の行がフロントマターを閉じ、入力は拒否されます。
   [fixture: common/frontmatter-yaml-document-marker-with-tag] [fixture:
   common/frontmatter-yaml-document-marker-split]
4. 開始行の後で最初の、空白だけの行ではない行を、**最初の内容行**と呼びます。
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
   空白の行、 `---` はその行を本文とするフロントマターになります。
   [fixture: common/frontmatter-blank-line-then-delimiter-only]
   それ以外の場合はフロントマターではありません。
   特に、 `---` の直後に `---` が続く場合はフロントマターではありません。
   [fixture: common/frontmatter-empty-body] [fixture:
   common/frontmatter-adjacent-delimiters]

フロントマターのトリビアは、ソースの先頭から、終了行の行終端までと、
その後の空白だけの行（それぞれの行終端を含む）までです。
ソースの最後にある、行終端のない空白だけの行は含みません。
その次の、空白だけではない行の字下げは含みません。
[fixture: common/frontmatter-blank-lines-after-closing]
[fixture: common/frontmatter-whitespace-line-at-end]
[fixture: common/frontmatter-indented-line-after]

この仕様は本文を解析しません。
木は本文を書かれたとおりに保持し（[ast.ja.md](./ast.ja.md#frontmatter)
を参照）、本文に何が書かれていても入力は受理されます。
mermaid.js は本文を YAML として解析し、入力を拒否することがあります。
[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md)
を参照してください。
mermaid.js が本文をどう読むかは、
[フロントマターの本文の読み方](../../tests/docs/configuration.ja.md#フロントマターの本文の読み方)
で述べます。

これらの条件が成り立たなければ、フロントマターはなく、
ブロックは図のテキストです。
検出点では、`%%` だけの行を通り過ぎる前に、
上のフロントマターの形を持つブロックを 1 つ通過させ、後のヘッダーを探します。
図の字句解析器が読むテキストからブロックを除くわけではありません。
ブロックの前にトリビアがあると、pie、gitgraph、info、packet、architecture、
radar、railroad、wardley、cynefin、eventmodeling は、
残されたテキストに隠れた YAML の規則を適用します。
一致すれば PieIgnoredText、GitgraphIgnoredText、InfoIgnoredText、
PacketIgnoredText、ArchitectureIgnoredText、RadarIgnoredText、
RailroadIgnoredText、WardleyIgnoredText、CynefinIgnoredText、
EventmodelingIgnoredText に持ち、YAML のタイトルも設定も適用しません。
以下の拒否例で、ほかのすべての図種の拒否を主張するものではありません。
先頭の空白、開始の区切りだけのバイトオーダーマーク、コメント行、
ディレクティブは、この場合を生じさせます。
両方の区切りで一致するバイトオーダーマークは、
代わりに本来のフロントマターの規則を満たす場合があります。
[fixture: pie/frontmatter-nonleading-comment]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: info/frontmatter-nonleading-comment]
[fixture: packet/detect-one-block]
[fixture: pie/lex-yaml-leading-config-not-applied]
[fixture: pie/lex-yaml-after-leading-lf]
[fixture: pie/lex-yaml-bom-opening-only] [fixture: pie/lex-yaml-bom-both-fences]
[fixture: pie/lex-yaml-after-directive-line]
[fixture: pie/lex-yaml-after-directive-glued]
[fixture: common/frontmatter-leading-newline]
[fixture: common/directive-before-frontmatter] [fixture: common/frontmatter-bom]
[fixture: common/frontmatter-indent-mismatch]
[fixture: common/frontmatter-nonleading-sequence]
[fixture: common/frontmatter-nonleading-class]
[fixture: common/frontmatter-nonleading-state]
[fixture: agentflow/db-frontmatter-after-comment]
[fixture: block/gram-frontmatter-comment-before]
[fixture: ishikawa/frontmatter-after-comment]
[fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before]
[fixture: radar/retained-yaml-control]
[fixture: wardley/detect-block-after-directive]
[fixture: cynefin/detect-block-after-directive]
[fixture: eventmodeling/detect-real-retained-secondscan]

この飛ばしは、裸の行の通過やディレクティブの再走査の前に、1 回だけ試します。
2 つ目のブロックや、再走査のディレクティブの後のブロックは飛ばしません。
先にブロックを飛ばし、その後でディレクティブを再走査する場合は通ります。
本来の先頭のフロントマターの後に、この別の保持するブロックを置けます。
検出点の先頭の字下げはトリビアなので、
先頭以外の両方の区切りの字下げが等しければ、閉じだけに字下げが残り、
飛ばしを妨げます。 [fixture: pie/detect-two-nonleading-blocks]
[fixture: pie/detect-block-after-real-frontmatter]
[fixture: pie/detect-second-scan-directive-before-block]
[fixture: pie/detect-block-before-second-scan-directive]
[fixture: pie/detect-block-equally-indented-fences]

その形を満たさないブロックは通過させません。
本文の行がない隣り合う `---`、閉じる区切りの欠落、
開始は字下げがなく閉じる区切りだけが字下げされる形、異なる空でない字下げ、
4 個のダッシュ、閉じる区切りの後の文字、後に改行のない閉じる区切りは、
検出点に `---` を残し、拒否する `---` 疑似図種を選びます。
一致するブロックの前に裸の `%%` の行がある場合も、ブロックは検出点にないため、
この 1 回の通過を妨げます。
ディレクティブが始まらないパーセントと波括弧の行も含みます。
[fixture: common/frontmatter-indent-closing-only]
[fixture: common/frontmatter-indent-different-depths]
[fixture: common/frontmatter-four-dashes]
[fixture: common/frontmatter-closing-trailing-text]
[fixture: common/frontmatter-no-newline-after]
[fixture: common/frontmatter-adjacent-delimiters]
[fixture: common/frontmatter-unclosed]
[fixture: pie/lex-yaml-after-comment-adjacent-fences]
[fixture: pie/frontmatter-unclosed] [fixture: pie/lex-yaml-after-bare-comment]
[fixture: common/frontmatter-after-bare-percent-flowchart]
[fixture: pie/detect-block-after-bare-brace-line]

`error` 疑似図種も、改行、バイトオーダーマーク、コメント行の後に、
一致するブロックと `error` が続く入力を受理します。
その条件はブロックを除きます。
そこでもブロックのタイトルと設定は適用しません。
[fixture: common/frontmatter-bom-error]
[fixture: common/detect-lone-cr-directive-lf]
[fixture: common/detect-lone-cr-comment-lf]
[fixture: common/detect-frontmatter-after-line-break-error]
[fixture: common/detect-frontmatter-after-comment-line-error]
[fixture: common/detect-crlf-no-directive]

## ディレクティブ

トリビアの規則。
この仕様はディレクティブの引数を解析しません。
mermaid.js は一部のディレクティブを設定のために読みます。
[設定の走査](../../tests/docs/configuration.ja.md#設定の走査)
を参照してください。

### ディレクティブの位置

ディレクティブは、フロントマターの後のソースのあらゆる位置で、左から順に、
[`removeDirectives()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L200-L202)
と同じように探します。
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
  [fixture: common/directive-whitespace-before-name]
  [fixture: common/directive-line-feed-before-name]
- 名前の後の `whitespace* ":"` は、
  名前とその後の空白の後に `:` が続くときに取られます。
  そうでなければ、ディレクティブはコロンを持ちません。
  [fixture: sequence/config-wrap-directive]
  [fixture: common/directive-whitespace-before-colon]
  [fixture: common/directive-whitespace-before-colon-applies]
  [fixture: common/directive-line-feed-before-colon-applies]
- 空白の後の最初の文字が語の文字なら、引数は `word` です。
  そうでなければ `free-text` で、最初の `}%%` の手前、U+2028 か U+2029 の手前、
  テキストの終わりのうち最も早いところで止まります。
  空でもかまいません。 [fixture: common/directive-u2028]
  [fixture: common/directive-empty-argument]
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
探索は次の文字から続きます。 [fixture: common/directive-non-word-start]
[行終端](#行終端) の規則が適用されるので、
ディレクティブは mermaid.js とまったく同じように単独の `\r` や `\r\n`
をまたげます。
mermaid.js は、ディレクティブを取り除く前に改行を正規化するからです。
[fixture: common/directive-spans-lone-cr]

ある位置でディレクティブが始まるかどうかは、図の構文にも、字句解析器の文脈にも、
コメントにも依存しません。
ディレクティブは、コメント行の中でも、
それがなければ 1 つの単位になるものの途中でも始まりえます。
mermaid.js で確かめた帰結は次のとおりです。

- 閉じる `}%%` は省略できます。
  自由形式の引数を持ち `}%%` のないディレクティブは、
  テキストの終わりまで伸びます。 [fixture: common/directive-unclosed]
  ヘッダーの直後にあれば、図の残りを取ります。
  `flowchart LR`、`%%{init: {"theme": "dark"}}`、`A-->B` は、
  頂点も辺も持ちません。 [fixture: common/directive-unclosed-after-header]
- `%%{` の後に語が続けば、意図していなくてもディレクティブが始まります。
  行末の `%%{wrap` の次の行に `A-->B` があると、
  引数の前の空白が改行をまたぐので、 `A` が語の引数になります。
  [fixture: common/directive-name-only-unclosed]
  `A-->B` の後の `%%{wrap` と `C-->D` の行では、
  ディレクティブは引数 `C` を取り、
  その行の残りの `-->D` は前のリンクに続きます。
  辺は A から B と、 B から D です。
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
  sequence と class は図のコメントとして読みます。
  state は、状態の後の行ではそれを拒否し、 `state X` の後の行では、
  その `%%` を本体の前の mermaid.js が読まないテキスト、
  `{}` を X の空の本体として読みます。 [fixture: common/directive-empty-braces]
  [fixture:
  flowchart/lex-percent-brace-line-after-vertex] [fixture:
  sequence/lex-percent-brace-line-after-message] [fixture:
  class/lex-percent-brace-line-after-class] [fixture:
  state/lex-percent-brace-line-after-reference] [fixture:
  state/lex-percent-brace-line-after-state] [fixture:
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

そのため、図の字句解析器が読む単位と値は、
ディレクティブのないテキストのものです。
行単位の規則に当てはまる並び、エンティティ、コメントの `%%` は、
2 つの文字の間にディレクティブを持つことがあります。

- **単位**は、図の字句解析器の 1 つの規則が一度に読むものです。
  各図の文書が単位を定め、その字句解析器が読む空白のない名前の単位、
  つまり**名前の単位**と、引用符のないテキストと空白を含みうる名前の単位、
  つまり**テキストの単位**と、引用符で囲んだ文字列とバッククォートの名前の単位、
  つまり**文字列の単位**を挙げます。
  flowchart については、[単位と文脈](./diagrams/flowchart.ja.md#単位と文脈) と、
  [単位の中のディレクティブ](./diagrams/flowchart.ja.md#単位の中のディレクティブ)
  を参照してください。
  テキストの単位と文字列の単位は、
  どの 2 つの文字の間にもディレクティブを持ってかまいません。
  名前の単位、キーワード、`:::` のような区切り記号、矢印、数のような、
  ほかの単位は持てず、入力は拒否されます。
  2 つの単位の間のディレクティブは許されます。
  ただし、flowchart で円を開く 2 つの `(` のように、
  図の文書が合わせて 1 つの名前か 1 つの区切り記号とする、
  2 つの単位の間は除きます。
  そのディレクティブはその名前か区切り記号の中にあり、入力は拒否されます。
  `error` 疑似図種では、文字の並びはどれもテキストなので、
  ディレクティブはどこにあってもかまいません。
  単位がその始まりか終わりで読む空白の中のディレクティブと、
  `space` や `newline` の単位のような空白だけの単位の中のディレクティブは、
  単位の中にあるものとしません。
  空白は、それがあってもなくても同じに読まれるからです。
  矢印の単位がその前後の空白を読む `A --> %%{init: {}}%% B` と、
  sequence の `accTitle %%{init: {}}%% : x` がそうです。
  [fixture: flowchart/lex-directive-after-arrow] [fixture:
  flowchart/db-subgraph-id-directive-in-statement-space] [fixture:
  sequence/lex-acc-title-directive-before-colon]

- コメント領域の中のディレクティブは、
  字句解析器が領域全体を読み進めるので（[コメント行](#コメント行) を参照）、
  領域と一緒に読み進められます。
  1 つの単位の読む中にある領域でも同じです。
  コメントの `%%` の後のディレクティブはコメントの一部で、
  その前のディレクティブはコメントの一部ではありません。
  [fixture: common/comment-region-directive-in-string] [fixture:
  common/comment-directive-in-string]

2 つの単位の間や、単位がその始まりか終わりで読む空白の中にあるディレクティブは、
mermaid.js とまったく同じに振る舞います。 [fixture: common/directive-mid-line]
[fixture: common/directive-after-link] [fixture: common/comment-after-directive]
[fixture:
common/directive-joins-lines]

字句解析器はディレクティブのないテキストを読むので、
テキストの単位と文字列の単位の中のディレクティブも、
mermaid.js と同じ結果になります。
flowchart では、`A[x%%{init: {}}%%y]` のラベルは `xy` です。
`flowchart%%{init: {}}%%LR` は、テキストが `flowchartLR` なので、
mermaid.js と同じく拒否されます。 [fixture: common/directive-in-label-text]
[fixture:
common/directive-between-header-and-direction]
文字列の中では、ディレクティブの周りの空白が残ります。
`A["a %%{init: {}}%% b"]` のラベルは `a`、空白 2 つ、`b` で、
文字列の中のディレクティブの引用符は、文字列を終えません。
[fixture: common/directive-in-string] [fixture:
flowchart/lex-directive-in-string-with-quotes]
2 つの単位の間の空白の中のディレクティブは、何も変えません。
`flowchart %%{init: {}}%%LR` は方向 `LR` を持ち、
`style A %%{init: {}}%%fill:red` のスタイルは `fill:red` です。
一方、`style A%%{init: {}}%%fill:red` は、
テキストが `style Afill:red` なので拒否されます。
[fixture: common/directive-in-header-whitespace] [fixture:
common/directive-after-style-space] [fixture:
common/directive-between-id-and-style]
`A[mysty%%{init: {}}%%le:#x;]` のラベルは、
行が `style` の規則に当てはまるので `mystyle:#x` で、
`A[a#qu%%{init: {}}%%ot;b]` のラベルはエンティティ `#quot;`
のプレースホルダを持ちます。
どちらも mermaid.js と同じです。 [fixture: common/directive-in-style-rule]
[fixture: common/directive-in-entity]
名前、キーワード、区切り記号、矢印、数の中のディレクティブは、
入力を拒否させます。
mermaid.js はそれを受理します。
mermaid.js は `end%%{init: {}}%%x` をキーワード `end` でなく頂点 `endx` と読み、
ここではディレクティブは名前の中にあります。
[fixture: common/directive-keyword-followed-by-text]
[`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md)
を見てください。

コメント行の上で `%%` の後にあるディレクティブはコメントの一部で、
`%%` の前にあるものはそうではありません（[コメント行](#コメント行) を参照）。
各図の文書は、この規則を、その字句解析器が読むものに当てはめます。
flowchart については
[単位の中のディレクティブ](./diagrams/flowchart.ja.md#単位の中のディレクティブ)
を参照してください。

## コメント行

トリビアの規則。
出どころは
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
です。

**コメント開始位置**は、テキストの先頭、またはディレクティブの一部でない行終端、
U+2028、U+2029 の直後の位置です。
**コメント**は、ディレクティブのないテキストの `%%`、
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
   flowchart の `A -->|a`、行 `%%`、`b| B` の辺のテキストは、 `a`、行 `%%`、
   `b` で、同じように書いた subgraph のタイトルも同じです。
   [fixture: flowchart/lex-percent-line-in-edge-label] [fixture:
   flowchart/lex-percent-line-in-subgraph-title]

コメントは、その `%%` の最初の `%` から行の終わり、
つまりディレクティブの一部でない次の行終端まで伸びます。
U+2028 と U+2029 はコメントを終えません。
[fixture: common/comment-line-separator-inside-comment-line]
行終端は、ディレクティブの走査が取るもの（引数の後の空白を含む）の中にあるとき、
ディレクティブの一部です（[ディレクティブの位置](#ディレクティブの位置)
を参照）。
そのため、コメントの中のディレクティブは、
コメントを改行の先まで続けることがあります。
`X` の後の行 `%% %%{wrap`、`A`、`B --> C` は 1 つのコメントです。
ディレクティブが `A` とその後の改行を取るからで、
mermaid.js は `A` も `B --> C` も読みません。
[fixture: common/comment-directive-word-argument-takes-next-lines]
ディレクティブの一部でない行終端が後に続かないとき、
コメントはテキストの終わりまで伸びます。
そのとき、コメントは、終わりにあってディレクティブが取った空白を、
ディレクティブと同じく含みません（[Directive](./ast.ja.md#directive) を参照）。
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
領域全体がトリビアです。 [fixture: common/comment-blank-line-before-in-string]
木に現れるのは、そのディレクティブだけで、`Root.directives` に並びます。
空白と行終端は、どのノードにも属しません。
領域はそれら以上の意味を持ちます。
その行終端は図のテキストではなく、
単位の中では字句解析器が領域全体を読み進めます。
後で述べるとおりです。

- コメント行は、任意の行内の空白で字下げしてよい。
  [fixture: common/comment-indented]
- 同じ行の、他の文字の後にある `%%` はコメントではありません。
  `A-->B %% note` の `%% note` は図の文法に渡され、 flowchart では拒否されます。
  [fixture: common/comment-trailing]
- U+2028 と U+2029 は、行終端ではありませんがコメント開始位置です。
  `A-->B` U+2028 `%% note` では、`%% note` はコメントで、
  その前の文は受理されます。
  U+2029 でも同じです。 [fixture: common/comment-after-u2028]
  [fixture: common/comment-after-u2029]
  `%%` までに空白しかなければ、コメント領域は U+2028 の直後から始まります。
  `error`、U+2028、空白 2 つ、`%% c` では、領域は空白 2 つとコメントです。
  `%%` の前に空白と 2 つ目の U+2028 があるときは、
  領域は最も早いコメント開始位置、つまり最初の U+2028 の直後から始まります。
  [fixture: common/whitespace-cut-at-comment-region] [fixture:
  common/whitespace-cut-at-earliest-comment-start]
- `%%` だけの行はコメント行ではありません。
  コメントには `%%` の後の文字が要るからです。
  flowchart では `%%` という名前のノードを宣言します。
  `%%` の後に空白が続く行はコメント行です。 [fixture: common/comment-bare]
  [fixture: common/comment-bare-with-space]
  そのため、コメントにした行の間の `%%` の行は文です。
  `A-->B` の後の `%% C-->D`、`%%`、`%% D-->E` の行は、
  2 つのコメントのほかに頂点 `%%` を作ります。
  一方、`%%` の行の代わりに空行や、`%%` と空白の行を置くと、すべてコメントです。
  [fixture: common/comment-bare-between-comment-lines] [fixture:
  common/comment-bare-between-comment-lines-empty] [fixture:
  common/comment-bare-between-comment-lines-space]
  ラベルの中では、そのような行はテキストに残ります。
  `A[a`、改行、`%%`、改行、`b]` のラベルは、`a`、改行、`%%`、改行、 `b` です。
  [fixture: common/comment-bare-line-in-label]
  文字列の中でも同じです。
  `A["first`、改行、`%%`、改行、`third"]` のラベルは、`first`、改行、`%%`、
  改行、`third` です。
  一方、`%%` と空白だけの行は、ラベルの中でもコメント行です。
  `A[a`、改行、`%%` と空白、改行、`b]` のラベルは、`a`、改行、 `b` です。
  [fixture: common/comment-bare-line-in-string-label] [fixture:
  common/comment-percent-space-line-in-label]
  説明のブロック（コメント行の後でも）、ツールチップの文字列、
  `accTitle:` の次の行のタイトルにも、同じく残ります。
  [fixture: flowchart/lex-acc-descr-block-bare-marker-line-after-comment-line]
  [fixture: flowchart/lex-tooltip-bare-marker-line] [fixture:
  flowchart/lex-acc-title-bare-marker-next-line]
- コメント行だけからなるテキストは図のテキストを持たず、検出で拒否されます。
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
  `%%` の後の文字が `{` だからです。 [fixture: common/directive-empty-braces]

コメント行は、図の構文にも字句解析器の文脈にも依存せずに認識されます。
字句解析器は、コメント領域がないかのように読み通します。
複数行の引用符付きラベルのように、
テキストがコメント領域をまたいで続く単位は 1 つの単位で、
その値は領域の前後のテキストをつないだものです。
[fixture: common/comment-in-string] [fixture:
common/comment-blank-line-before-in-string]

これにより、単位の中で特別な意味を持つ文字がコメント行に含まれていても、
受理は mermaid.js と同じになります。
例は、引用符付きラベルの中のコメント行にある `"` です。
[fixture: common/comment-with-quote-in-string]

コメント領域は、図のコメント、
つまり図自身の字句解析器が行の終わりまで読むコメントも、同じように切ります。
図のコメントの行は、その行の U+2028 か U+2029 の後のコメント行を越えて続きます。
mermaid.js は、コメント行を除いたテキストを読むからです。
state で、`A %% x`、U+2029、行 `%% end`、行 `B` の後では、
図のコメントは `B` に続き、 mermaid.js は `B` を読みません。
[fixture: state/lex-diagram-comment-across-comment-line]

## 先頭の空白

トリビアの規則。
mermaid.js は、
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
の中で、コメント行を取り除いた直後に先頭の空白を取り除きます。
図の字句解析器の最初の単位より前の空白、行終端、ディレクティブ、
コメント領域はトリビアで、図の文法からは見えません。
[fixture: common/leading-whitespace-before-header]
[fixture: common/leading-trivia-before-header]

## 図種の検出

検出は、図のテキストから図種を選びます。
**検出点**は、テキストの中で先頭のトリビアでない最初の位置です。
空白でも行終端でもなく、ディレクティブの中でも、
コメント領域の中でもない位置です（[先頭の空白](#先頭の空白)）。
その点のブロックが [フロントマター](#フロントマター) の形を満たせば、検出は、
`%%` だけの行を探す前に、ブロックを 1 回通過させます。
ブロックは、選んだ図が読む図のテキストのままです。
pie、gitgraph、info、packet、architecture、radar、railroad、wardley、cynefin、
eventmodeling と、拒否する対照例は、フロントマターの節にあります。
[fixture: pie/frontmatter-nonleading-comment]
[fixture: gitgraph/lex-yaml-after-comment]
[fixture: info/frontmatter-nonleading-comment]
[fixture: packet/detect-one-block]
[fixture: pie/lex-yaml-leading-config-not-applied]
[fixture: common/directive-before-frontmatter]
[fixture: common/frontmatter-nonleading-sequence]
[fixture: common/frontmatter-nonleading-class]
[fixture: common/frontmatter-nonleading-state]
そこから、検出は、 **`%%` だけの行**があればそれを読んで通り過ぎます。
`%%` だけの行とは、行の空白の後の図のテキストが、`%%` と、それに続く行終端、
テキストの終わり、またはディレクティブの始まらない `{`（ソースでも、
下のもう一度の読みでも始まらない）で始まる行です。
行の残りに何があっても、ヘッダーがあっても、行全体を飛ばします。
1 行の `%%{ }%% sequenceDiagram` にはヘッダーが残らず、テキストは拒否されます。
この行はコメント行でもディレクティブでもありません（[コメント行](#コメント行)
を参照）。
`%%` だけの行の間の空白、行終端、ディレクティブ、コメント領域はトリビアで、
一緒に通り過ぎます。
`%%` だけの行は字下げされていてもよく、どの行終端で終わってもかまいません。
ディレクティブを除くと、1 行の `%%%%{init: {}}%%` は `%%` だけの行で、
`%%%` はコメント行です。
`%%` だけの行しかないテキストにはヘッダーがなく、どの検出器も一致しません。
検出は、たどり着いた各位置で、
まず [ディレクティブの位置](#ディレクティブの位置) の規則をもう一度、
そこからの図のテキストに当てます。
単位を読むときと同じように、
ソースのディレクティブとコメント領域を読み飛ばして当てます。
それらを除いたことで `%%{`、空白、
語が並ぶようになったところではディレクティブが始まり、
検出はそれを規則の及ぶ所まで飛ばします。
その行が `%%` だけの行かどうかを問うのは、その後です。
`%%{`、コメント行、`wrap}%%sequenceDiagram`、`A->>B: x` では、
閉じたディレクティブを飛ばして検出がヘッダーに届きます。
逆の順番なら 1 行目を `%%` だけの行として飛ばし、
`wrap}%%` にヘッダーが見つからないことになります。
`%%{`、コメント行、`sequenceDiagram` はそのようなディレクティブを含み、
このディレクティブはキーワードを名前として、次の行の `A` を引数として取るので、
ヘッダーが残らず、テキストは mermaid.js と同じく拒否されます。
mermaid.js の 2 回目のディレクティブの走査が、
同じディレクティブを見つけるからです。 [fixture: radar/detect-secondscan-native]
[fixture: radar/detect-secondscan-native-glued]
[fixture: wardley/detect-block-after-directive]
[fixture: cynefin/detect-block-after-directive]
[fixture: eventmodeling/detect-real-retained-secondscan]

flowchart、sequence、class、state では、このディレクティブは木になく、
入力を拒否させます。
以下で引用するほかの図種の入力も、この形を拒否します。
ディレクティブが閉じていてヘッダーが続くとき（`%%{`、行 `%%{wrap}%%`、
`x}%%flowchart LR`）、検出はヘッダーに届き、以下で引用する拒否の対照例は、
この入力を拒否します。
mermaid.js と同じで、
その字句解析器はヘッダーの前の `%%{` と `x}%%` をテキストとして読みます。
[fixture: flowchart/detect-directive-across-directive]
[fixture: sequence/detect-directive-across-directive]
[fixture: class/detect-directive-across-directive]
[fixture: state/detect-directive-across-directive]
[fixture: agentflow/detect-directive-second-scan-preheader]
[fixture: block/detect-directive-second-scan-preheader]
[fixture: ishikawa/detect-directive-second-scan-preheader]
[fixture: usecase/detect-directive-second-scan-preheader]
[fixture: venn/detect-directive-second-scan-preheader]

pie、gitgraph、info、packet、architecture、radar、railroad、wardley、cynefin、
eventmodeling は、
検出の 2 回目の走査でだけ見つかるディレクティブを隠れた DIRECTIVE として読み、
textBeforeHeader の PieIgnoredText、GitgraphIgnoredText、InfoIgnoredText、
PacketIgnoredText、ArchitectureIgnoredText、RadarIgnoredText、
RailroadIgnoredText、WardleyIgnoredText、CynefinIgnoredText、
EventmodelingIgnoredText に持ちます。
`%%{`、`%% gap`、`wrap}%%`、`pie` の各行は受理します。
閉じの直後に `pie` を接着すると、隠れた形の閉じの境界を満たさず、拒否します。
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture: pie/lex-hidden-directive-second-detection-scan-glued]
[fixture: gitgraph/lex-hidden-directive-second-scan]
[fixture: gitgraph/lex-hidden-directive-second-scan-glued]
[fixture: info/detect-second-scan-directive]
[fixture: info/detect-second-scan-glued]
[fixture: packet/detect-second-scan-directive]
[fixture: packet/detect-second-scan-glued]
[fixture: radar/detect-secondscan-native]
[fixture: radar/detect-secondscan-native-glued]
[fixture: wardley/prefix-secondscan] [fixture: wardley/detect-secondscan-glued]
[fixture: cynefin/prefix-two-secondscans]
[fixture: eventmodeling/detect-real-retained-secondscan]

たどり着いた位置で、[detection.ja.md](./detection.ja.md) の検出器を登録順に、
図のテキスト（[ソースの読み方](#ソースの読み方)）、つまりそこからの文字から、
ディレクティブとコメント領域を除いたものに対して試します。
条件が最初に成り立った検出器が図種を選びます。
図の字句解析器は、残したフロントマター形のブロックがあればそれを読み、pie、
gitgraph、info、packet、architecture、radar、railroad、wardley、cynefin、
eventmodeling は、上記の隠れた DIRECTIVE も読みます。
たどり着いた位置からのテキストも読みます。
検出が通過させた `%%` だけの行と、一緒に通過した空白・改行は、
ここでは読み直しません。
空白と改行は trivia です。
`%%` だけの行はそれぞれ、どの図種でも、`%%` から行の終わりまでの、
印 `%%` の図のコメントです。
mermaid.js はこの行を検出した図の字句解析器で読み、その一部は拒否します。
flowchart は `%%` をヘッダーの前の id として読み、
state は `%%{` で始まる行の `{` を取らず、
class はそのような行の後の空白だけの行を `newline` の単位として読み、
文法はヘッダーの前でそれを取りません。
これらの入力は既知の差異
[`bare-percent-line-before-header`](./known-divergences/bare-percent-line-before-header.ja.md)
です。
どの検出器も一致しなければ、テキストは `UnknownDiagramError` で拒否されます。
図のテキストがまったくないテキスト（空のテキストや、
コメント行だけのテキスト）も同じです。
最初の単位がヘッダーでないテキスト（`#` や `;` の行、
ヘッダーと同じ行の `%%`。これは `%%` だけの行ではありません）も同じです。
ディレクティブやコメント行がヘッダーを取るテキストも同じです。
`%%{`、改行、`sequenceDiagram` ではディレクティブがキーワードを名前として取り、
`%%`、U+2028、`sequenceDiagram` ではコメント行がキーワードを含みます。
最初の単位が、
ヘッダーの前の空の説明ブロック `accDescr {}` であるテキストも同じです。
[fixture: common/empty] [fixture: common/comment-only]
[fixture: common/bare-percent-line-only]
[fixture: gitgraph/div-detect-retained-directive-bare-bom]
[fixture: gitgraph/div-lex-preheader-bare-between-retained-unicode]
[fixture: packet/div-detect-yaml-bare-directive-ls]
[fixture: common/bare-percent-line-only-with-line-feed]
[fixture: sequence/header-after-indented-bare-percent-line]
[fixture: sequence/header-after-bare-percent-crlf]
[fixture: sequence/header-after-bare-percent-cr]
[fixture: sequence/header-after-bare-percent-lines-with-blank-and-comment]
[fixture: sequence/header-after-bare-percent-lines-with-directive]
[fixture: sequence/header-after-bare-percent-then-directive]
[fixture: sequence/header-after-bare-percent-then-whitespace-line]
[fixture: class/header-after-bare-percent-then-empty-line]
[fixture: class/header-after-bare-percent-then-whitespace-line]
[fixture: sequence/header-after-empty-braces-no-space]
[fixture: sequence/header-after-empty-braces-then-keyword-same-line]
[fixture: sequence/header-after-non-word-brace-then-keyword-same-line]
[fixture: flowchart/header-after-acc-descr-block]
[fixture: sequence/header-after-triple-percent-line]
[fixture: sequence/header-after-percent-joined-by-directive-line]
[fixture: sequence/header-after-empty-braces-line-text]
[fixture: sequence/header-after-non-word-brace-line]
[fixture: class/header-after-non-word-brace-line]
[fixture: state/header-after-empty-braces-line]
[fixture: flowchart/header-after-empty-braces-line]
[fixture: sequence/header-after-unclosed-brace-line]
[fixture: sequence/header-after-unclosed-brace-and-comment-line]
[fixture: common/detect-directive-across-comment-line]
[fixture: common/detect-directive-second-scan-once]
[fixture: sequence/detect-directive-across-comment-line-closed]
[fixture: flowchart/detect-directive-across-directive]
[fixture: sequence/detect-directive-across-directive]
[fixture: class/detect-directive-across-directive]
[fixture: state/detect-directive-across-directive]
[fixture: sequence/header-after-percent-line-separator]
[fixture: sequence/header-after-bare-percent-line]
[fixture: sequence/header-after-empty-braces-line]
[fixture: sequence/header-after-empty-braces-semicolon]
[fixture: sequence/header-after-two-bare-percent-lines]
[fixture: class/header-after-bare-percent-line]
[fixture: class/header-after-empty-braces-line]
[fixture: state/header-after-bare-percent-line]
[fixture: flowchart/header-after-bare-percent-line]
[fixture: sequence/header-after-hash-line]
[fixture: sequence/header-after-semicolon-line]
[fixture: sequence/header-after-bare-percent-on-same-line]
[fixture: class/header-after-hash-line]
39 個の検出器すべての順序と条件は [detection.ja.md](./detection.ja.md) にあり、
各図の文書はその検出の節で該当する項目を参照します。
[fixture: radar/retained-yaml-control] [fixture: wardley/prefix-secondscan]
[fixture: wardley/detect-secondscan-glued]
[fixture: cynefin/prefix-two-secondscans]
[fixture: eventmodeling/detect-real-retained-secondscan]

検出器が読むのは、キーワードとその次の文字までです。
下の `error` 疑似図種の検出器だけは別で、
その条件がその疑似図種の文法のすべてです。
キーワードの先は図の文法が読みます。
図のテキストはディレクティブとコメント領域を除いたものなので、検出点の前、
ヘッダーの行、ヘッダーの直前、キーワードの中のディレクティブと、
ヘッダーの前の行区切り、段落区切り、バイトオーダーマーク（行の空白です）と、
ヘッダーの前の単独の `\r` や `\r\n`（行終端です）は、
どの検出器が一致するかを変えません。
これは、ディレクティブの走査より後のどの規則とも同じです。
[ディレクティブはトークンの境界](#ディレクティブはトークンの境界)
を参照してください。
4 行の `  %% c`、空行、`%%{init: {}}%%`、`  flowchart LR` は flowchart で、
`flowchart %%{init: {}}%%LR` は flowchart、
`%%{init: {}}%%sequenceDiagram` は sequence です。
`flow%%{init: {}}%%chart LR` は flowchart として検出され、その後、
ディレクティブがヘッダーのキーワードの中にあるために拒否されます。
[fixture: common/leading-trivia-before-header]
[fixture: common/leading-whitespace-before-header]
[fixture: common/detect-line-separator-before-header]
[fixture: common/detect-paragraph-separator-before-header]
[fixture: common/detect-bom-before-header]
[fixture: common/detect-cr-before-header]
[fixture: common/detect-crlf-before-header]
[fixture: common/directive-in-header-whitespace]
[fixture: common/detect-directive-adjacent-before-header]
[fixture: common/directive-in-header-keyword]
[`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md)
を参照してください。

すべての実際の図より前に、2 つの疑似図種が登録されています。

- `error`: この疑似図種に文法はありません。
  パーサーはテキストを読まず、入力は受理され、Db の内容は生じません。
  どのテキストがこの疑似図種かは、その条件だけで決まります。
  検出点からの図のテキストから、次の 3 つを除いたものが、
  語 `error`（[表記](#表記) の意味で大文字小文字を区別しない）で、
  テキストの終わりまで、その後に空白と行終端しか続かないことです。
  3 つは、mermaid.js の検出が比べる前に取り除くもの（下を参照）です。
  検出点で [フロントマター](#フロントマター)
  の条件を満たすブロック（ソースの先頭にないので、
  フロントマターではありません）。
  [ディレクティブの位置](#ディレクティブの位置) の規則を、
  図のテキストにもう一度当てて見つかる、
  ディレクティブ（ソースのディレクティブを除いたことで、`%%{`、語、
  `}%%` が並ぶようになったもの）。
  そして**疑似図種のコメント**、つまり後ろのどこかに行終端がある `%%` から、
  その前の行の空白を含めて、その行の終わりまで（`%%` だけの行はこれであり、
  行の中で他のテキストの後にある `%% x` も、後に行終端があればこれです）。
  木はすべてをテキストとして持ちます（[ErrorDiagram](./ast.ja.md#errordiagram)
  を参照）。
  この疑似図種ではすべての文字の並びがテキストなので、
  ディレクティブはどこにあってもよく、`err%%{init: {}}%%or` は `error` です。
  1 行の `error x` は拒否されます。
  テキストの最後にある `error %% x` も、
  `%%` の後に行終端がなくコメントが始まらないので拒否され、
  後に改行があれば受理されます。
  改行、バイトオーダーマーク、
  コメント行の後の `---` のブロックと `error` は受理され、
  `---` の直後の `---` はそのようなブロックではないので、
  そのテキストは拒否されます。
  ブロックの前に `%%` だけの行があるものも拒否されます。
  検出点はその行（図のテキストです）にあり、ブロックは検出点にないからです。
  `%%{`、行 `%%{wrap}%%`、`x}%%error` は受理されます。
  図のテキスト `%%{`、改行 2 つ、`x}%%error` がディレクティブを含むからです。
  `x}%%error` の代わりに `error` だと、
  ディレクティブが `error` を語の引数として取り、テキストは拒否されます。
  [fixture: common/error-pseudo-diagram] [fixture: common/error-uppercase]
  [fixture: common/error-trailing-comment-line] [fixture:
  common/error-trailing-blank-lines] [fixture:
  common/error-directive-adjacent] [fixture: common/error-split-by-directive]
  [fixture: common/whitespace-cut-at-comment-region] [fixture:
  common/whitespace-cut-at-earliest-comment-start] [fixture:
  common/error-word-after] [fixture: common/error-trailing-percent-at-end]
  [fixture: common/error-trailing-percent] [fixture:
  common/error-comment-inside] [fixture: common/error-directive-inside]
  [fixture: common/error-style-semicolon-inside] [fixture:
  common/error-style-semicolon-trailing] [fixture:
  common/error-bare-percent-line] [fixture:
  common/detect-percent-joined-by-directive] [fixture:
  common/error-percent-before-directive] [fixture:
  common/detect-frontmatter-after-line-break-error] [fixture:
  common/frontmatter-bom-error] [fixture: common/detect-lone-cr-directive-lf]
  [fixture: common/detect-lone-cr-comment-lf] [fixture:
  common/detect-frontmatter-after-comment-line-error] [fixture:
  common/detect-crlf-no-directive] [fixture:
  common/error-bare-percent-line-then-frontmatter-block] [fixture:
  common/detect-directive-across-directive-closed] [fixture:
  common/detect-directive-joined-by-directive] [fixture:
  common/detect-directive-across-directive]
- `---`: `error` 以外のどの検出器とも同じく、
  たどり着いた位置の図のテキストが `---` で始まる。
  そのパーサーは常に例外を投げるので、入力は拒否されます。
  フロントマターでない `---`
  のブロックはこうなります（[フロントマター](#フロントマター) を参照）。
  `%%` だけの行の後でも同じです。
  `%%`、`---`、`a: b`、`---`、`error` では、
  たどり着いた位置は最初の `---` にあり、
  `error` の条件は検出点から見るのでブロックは検出点になく、除かれません。
  検出がもう一度の読みで見つけるディレクティブの後でも同じです（`%%{`、
  コメント行、 `wrap}%%---`）。 [fixture: common/frontmatter-four-dashes]
  [fixture:
  common/frontmatter-leading-newline] [fixture:
  common/error-bare-percent-line-then-frontmatter-block] [fixture:
  common/detect-dashes-after-directive-found-once-more]

mermaid.js は、先に書き換えたテキストの上で図種を決めます。
[`detectType()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/detectType.ts#L36-L51)
は、フロントマター、ディレクティブ、コメント行、先頭の空白を除いた後に、
先頭のフロントマターのブロックをもう一度除き、
ディレクティブをもう一度走査して除き、後ろのどこかに改行がある `%%` を、
その前の空白と行の残りごと除きます（mermaid.js の
[`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/regexes.ts#L49-L76)）。
その後で検出器が残りを見ます。
C4 の検出器は、5 つのキーワードのうち 4 つをその中のどこにでも探します。
検出した図の字句解析器は、この最後の除去をしていないテキストを読みます。
文法を持つ図では、上の規則は同じ結果を与えます。
`%%` だけの行は、
mermaid.js の字句解析器がコメントとして読むところではどちらでもコメントで、
そうでないところでだけ両者が分かれます（上の既知の差異）。
2 回目の走査でだけ見つかるディレクティブは、どちらでも検出が通り過ぎ、
以下で引用する図種の対照例では、どちらでも拒否されます。
[fixture: flowchart/detect-directive-across-directive]
[fixture: sequence/detect-directive-across-directive]
[fixture: class/detect-directive-across-directive]
[fixture: state/detect-directive-across-directive]
[fixture: agentflow/detect-directive-second-scan-preheader]
[fixture: block/detect-directive-second-scan-preheader]
[fixture: ishikawa/detect-directive-second-scan-preheader]
[fixture: usecase/detect-directive-second-scan-preheader]
[fixture: venn/detect-directive-second-scan-preheader]

一致する先頭以外の `---` ブロックは、どちらでも検出が通過させ、
選んだ図が読みます。
pie、gitgraph、info、packet、architecture、radar、railroad、wardley、cynefin、
eventmodeling は、隠れた YAML の規則を適用し、
一致したブロックを無視するテキストとして持ちます。
以下で引用するほかの図種の対照例は拒否します。
[フロントマター](#フロントマター) で述べたとおりです。
[fixture: common/directive-before-frontmatter]
[fixture: common/frontmatter-indent-mismatch] [fixture: common/frontmatter-bom]
[fixture: agentflow/db-frontmatter-after-comment]
[fixture: block/gram-frontmatter-comment-before]
[fixture: ishikawa/frontmatter-after-comment]
[fixture: usecase/frontmatter-after-comment]
[fixture: venn/frontmatter-comment-before] [fixture: packet/detect-one-block]
[fixture: radar/retained-yaml-control]
[fixture: wardley/detect-block-after-directive]
[fixture: cynefin/detect-block-after-directive]
[fixture: eventmodeling/detect-real-retained-secondscan]

`error` 疑似図種では、その条件が除く 3 つがこの除去です。

mermaid.js がこの段階を通して検出し、この仕様が別に読む入力は 1 つで、
既知の差異
[`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.ja.md) です。
ヘッダーが別の図のもので、その後の図のテキストに `C4Container`、 `C4Component`、
`C4Dynamic`、`C4Deployment` のどれかを持つテキストを、
mermaid.js は C4 のパーサーに渡し、この仕様はヘッダーの図として読みます。
`C4Context` は両者とも先頭でだけ数えます。 [fixture: common/detect-c4-anywhere]
[fixture:
common/detect-c4context-only-at-start]

テキストに init ディレクティブがあるときは、
mermaid.js は別の作り方をしたテキストで検出器をもう一度走らせ、
それが入力を拒否することがあります。
この仕様はそれを走らせません。
[init ディレクティブ](../../tests/docs/configuration.ja.md#init-ディレクティブ)
と、
[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md)
を参照してください。

architecture も残存する YAML と 2 回目の scan の directive を読み、
ArchitectureDiagram.textBeforeHeader の ArchitectureIgnoredText に持ちます。
通した裸の行と付随する空白・改行は読み直しません。
残存する形の native な閉じの境界は維持します。
[fixture: architecture/detect-retained-before-second-scan]
[fixture: architecture/detect-two-second-scan-forms]
[fixture: architecture/detect-second-scan-glued]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/retained-yaml-no-bare]

radar も残存する YAML と第 2 scan の directive を読み、
RadarDiagram.textBeforeHeader の RadarIgnoredText に保ちます。
検出で通した裸の行と付随する空白・改行は読み直しません。
残存する形には native の閉じの境界を要求します。
[fixture: radar/detect-yaml-before-secondscan-native]
[fixture: radar/detect-secondscan-before-yaml-native]
[fixture: radar/detect-secondscan-native-twice]
[fixture: radar/div-detect-yaml-bare-secondscan-native-ls]
[fixture: radar/detect-retained-no-bare-control]

treemap に native YAML・DIRECTIVE の規則はありません。
検出が通す残存 YAML の形の block も拒否します。
第 2 scan の directive が一行に収まれば native Comment とし、
後の閉じの行が comment でなければ読めません。
その Comment 内のソースの directive は共有 Directive のままとし、
別の ignored-text node は作りません。
通した裸の行と付随する空白は前述と同じ規則で Comment・trivia とします。
treemap の可視の字下げは、
Mermaid が再び読む gap が Unicode だけでなく ASCII の場合も拒否し得ます。
[fixture: treemap/detect-retained-body-yaml-no-native]
[fixture: treemap/detect-second-scan-single-line-comment]
[fixture: treemap/detect-second-scan-multiline-rejected]
[fixture: treemap/div-bare-retained-ascii-header]
[fixture: treemap/div-bare-retained-unicode-header]

railroad の 4 id は、残る YAML と真の第二走査 directive を、
RailroadDiagram.textBeforeHeader の RailroadIgnoredText として保ちます。
通過した bare line は共有 Comment、伴う空白と改行は trivia で、再び読みません。
YAML の 1 回の skip は bare line と第二走査より先で、
残る形は native の closing boundary を満たす必要があります。
[Railroad の検出](./diagrams/railroad.ja.md#検出)が停止する場合を、
[木](./ast/railroad.ja.md#gap-の所有)が所有を定めます。
[fixture: railroad/ir-yaml-before-secondscan-real]
[fixture: railroad/ebnf-yaml-before-secondscan-real]
[fixture: railroad/abnf-yaml-before-secondscan-real]
[fixture: railroad/peg-yaml-before-secondscan-real]
[fixture: railroad/ir-secondscan-before-yaml-real]
[fixture: railroad/ir-secondscan-glued]
[fixture: railroad/ir-retained-bare-secondscan-unicode]
[fixture: railroad/ir-yaml-unicode-no-bare]

## `style` 行と `classDef` 行

行単位の規則で、すべての図種に適用します。
出どころは
[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L895-L917)
です。
1 つの行区間ごとに適用し、字句解析器は各行区間の先頭で、
その終わりまで先を見て適用します。
この規則では、行区間はディレクティブの一部でない行終端、U+2028、
U+2029 の間にわたり、行区間はディレクティブを除いて、
ディレクティブの前の文字と後の文字が続いているものとして読み、
コメント領域はどの行区間にも属しません。
ディレクティブが空白として取り込む U+2028 と U+2029
は（[ディレクティブの位置](#ディレクティブの位置) を参照）、
ディレクティブの一部で、行区間を終えません。
sequence の行 `participant A@{ "style": "x:#y" };participant C%%{init: {}`、
U+2029、`;participant D` は 1 つの行区間で、
U+2029 の後のその最後の `;` が無視されるので、この行は、
mermaid.js と同じく参加者 A と `Cparticipant D` を宣言します。
[fixture: sequence/tokens-directive-paragraph-separator-keeps-segment]
[fixture: sequence/tokens-directive-paragraph-separator-then-semicolon]

行 `participant A@{ "style": "x:#y" };participant C;participant E`、区切り、
`;participant D`、行 `A->>B: y` では、
どの `;` が無視されるかが参加者に表れます。

- 行終端、U+2028、U+2029 は、閉じたディレクティブの直後でも行区間を終え、
  コメント行の前の改行も同じです。
  1 行目の最後の `;`、つまり `C` と `participant E` の間のものが無視され、
  参加者は A、`Cparticipant E`、D、 B です。
  [fixture: sequence/tokens-ignored-semicolon-separator-line-feed] [fixture:
  sequence/tokens-ignored-semicolon-separator-carriage-return] [fixture:
  sequence/tokens-ignored-semicolon-separator-crlf] [fixture:
  sequence/tokens-ignored-semicolon-separator-line-separator] [fixture:
  sequence/tokens-ignored-semicolon-separator-paragraph-separator] [fixture:
  sequence/tokens-ignored-semicolon-separator-closed-directive-line-separator]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-closed-directive-paragraph-separator]
  [fixture: sequence/tokens-ignored-semicolon-separator-comment-line]
- 区切りがないとき、閉じたディレクティブのとき、
  そして閉じていないディレクティブの引数が U+2028 か U+2029 の前で終わり、
  ディレクティブがそれを空白として取り込むときは、行区間は続き、
  区切りの後の `;` が無視されます。
  参加者は A、C、`Eparticipant D`、 B です。
  [fixture: sequence/tokens-ignored-semicolon-separator-none] [fixture:
  sequence/tokens-ignored-semicolon-separator-closed-directive] [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-line-separator]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-paragraph-separator]
- 自由なテキストの引数が行終端に出会う閉じていないディレクティブは、
  テキストの残りを取ります。
  名前か `:` の直後の U+2028 か U+2029 を空白として取り込み、
  その後から自由なテキストの引数が始まるディレクティブも同じです。
  `%%{wrap`、U+2028、`;participant D` では、
  引数は `;participant D` とその後のすべてです。
  このとき行区間の最後の `;` は `C` と `participant E` の間のもので、
  参加者は A と `Cparticipant E` です。 [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-line-feed]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-carriage-return]
  [fixture:
  sequence/tokens-ignored-semicolon-separator-unclosed-directive-name-line-separator]

agentflow と eventmodeling
ではコメント領域を除かないので（[mermaid.js とこの仕様](#mermaidjs-とこの仕様)
を参照）、この規則はコメント行にも適用されます。
[fixture: eventmodeling/comment-line-ignored-semicolon-in-data]
[fixture: eventmodeling/tokens-comment-line-ignored-semicolon]
[fixture: eventmodeling/tokens-comment-line-semicolon-before-text]

行区間が次のものをこの順に含むとき、
その行区間は **`style` の規則に一致**します。

1. 文字列 `style`
2. その後の `:` で、空白でない文字が 0 個以上続き、その後に `#` があるもの
3. その `#` より後の `;`

一致した行区間では、字句解析器は最後の `;` を無視します。
つまり、その `;` をないかのように読み進め、文法はそれを見ません。
その後、`style` の規則が無視した `;` を除いた行区間に対して、
項目 1 の `style` を `classDef` に替えて同じことを行います。
[fixture: common/entity-style-then-classdef-rule]
mermaid.js は、
[`encodeEntities()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L895-L917)
でそのような `;` をテキストから取り除きます。
この仕様は、それをソースに残したまま無視するだけです。
無視される `;` は、ディレクティブと同じく、テキストと文字列の中と、
2 つの単位の間にあってかまいません。
[ディレクティブはトークンの境界](#ディレクティブはトークンの境界)
を参照してください。
名前、数、キーワード、矢印、区切り記号の中なら入力を拒否させ、
mermaid.js はそれを受理します。
mermaid.js では、`A[style:#x] --> B;b` は頂点 `Bb` を、
`A[style:#x] -;-> B` は辺 `-->` を持ちます。
[`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.ja.md)
を見てください。 [fixture: flowchart/div-ignored-semicolon-in-id] [fixture:
flowchart/div-ignored-semicolon-in-arrow]

この規則は、`style` 行や `classDef` 行の `#f00;` のような CSS の色が、
エンティティにならないようにするためのものです。
純粋にテキスト上の規則なので、次のようになります。

- 行のどこにある `style` にも一致し、ラベルの中でも一致します。
  `A[mystyle:#x;]` は一致するので `;` が無視され、
  ラベルは `mystyle:#x` になります。
  一方 `A[mystyle: #x;]` は一致せず（`:` と `#` の間に空白がある）、
  ラベルは `mystyle: ﬂ°x¶ß` です。 [fixture: common/entity-style-in-label]
  [fixture:
  common/entity-style-in-label-space]
  空白でなければ、 `:` と `#` の間にほかの文字があってもかまいません。
  `A[style:a#b;]` は当てはまり、ラベルは `style:a#b` です。
  一方、`A[style:a #b;]` は当てはまらず、ラベルは `style:a`、空白、
  `#b;` のプレースホルダです。
  [fixture: common/entity-style-colon-text-before-hash] [fixture:
  common/entity-style-colon-space-before-hash]
  ラベルの HTML の `style` 属性もこれに当たります。
  `A[<span style='color:#f00;font-weight:bold;'>x</span>]` は当てはまるので、
  最後の `;` が無視され、`#f00;` はエンティティです。
  `A[<span style='color:red;background:#fff;'>x</span>];`
  は区切りが無視されるので `#fff;` はエンティティです。
  一方、区切りがなければ、最後の `;` は `#fff` の後のもので、
  ラベルは `#fff` を保ちます。 [fixture: common/entity-css-in-label] [fixture:
  common/entity-css-in-label-separator-ignored] [fixture:
  common/entity-css-in-label-last-semicolon-ignored]
  ラベルが文字列 `A["<span style='color:#f00;font-weight:bold;'>x</span>"]`
  のときも、
  リンクのテキスト
  `A-- <span style='color:#f00;font-weight:bold;'>t</span> -->B` でも同じです。
  [fixture: common/entity-css-in-string-label] [fixture:
  common/entity-css-in-link-text]
  `:` の後に `#` がなければ行は当てはまらず、
  `A[<span style='color:red;font-size:12px'>x</span>]` は 2 つの `;`
  を保ちます。
  `A[<span style='color:#35;f00;font-weight:bold'>x</span>]`
  では行が当てはまるので、 `f00` の後の `;` が無視され、
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
  common/entity-style-two-colours]
  `style A fill:#f00; style B fill:#0f0` は、ただ 1 つの `;` が無視されるので、
  1 つの文です。
  A は 1 つのスタイル `fill:#f00 style B fill:#0f0` を持ち、
  B はスタイルを持ちません。
  [fixture: common/entity-style-semicolon-between-statements]
  1 行の 2 つのラベルは、無視される 1 つの `;` を共有します。
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
  common/entity-classdef-semicolon-between-styles]
  無視される `;` は 2 つのスタイルの間にあることもあります。
  `style A fill:#f00;stroke:#0f0` は、
  1 つのスタイル `fill:#f00stroke:#0f0` を持ちます。
  [fixture: common/entity-style-semicolon-between-styles]
- 大文字小文字を区別します。
  `linkStyle 0 stroke:#f00;` は `style` に一致しないので、
  `#f00;` はエンティティになり、flowchart の文法はその行を拒否します。
  最後の `;` がない場合や、その前の色が `#` で始まらない場合は、
  同じ行が受理されます。 [fixture: common/entity-linkstyle-colour] [fixture:
  common/entity-linkstyle-colour-no-semicolon] [fixture:
  common/entity-linkstyle-named-colour-semicolon]
- 最後の `;` は、ラベルの後の区切りであることもあります。
  `A[style:#x;];` では区切りが無視されるので、ラベルの中の `;` は残り、
  `#x;` はエンティティで、ラベルは `style:` とプレースホルダです。
  ラベルが文字列 `"style:#x;"` でも同じです。
  一方、`A[style:#x;]` ではラベルの中の `;` が無視され、
  ラベルは `style:#x` です。
  アクセシビリティの文の行もほかの行と同じで、
  `accTitle: style:#x;y;` のタイトルは `style:`、プレースホルダ、 `y` です。
  [fixture: common/entity-style-separator-ignored] [fixture:
  common/entity-style-label-semicolon-ignored] [fixture:
  common/entity-style-separator-ignored-string] [fixture:
  common/entity-style-acc-title]

## エンティティ

エンティティは、コメント領域の外で（agentflow と eventmodeling では、
行単位の規則と同じくコメント領域を除きません。
[fixture: eventmodeling/comment-line-entity-in-data]）、
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
エンティティは、次の連続した文字からなります。
ただし、その `;` は上の行単位の規則が無視するものではありません。

```text
entity = "#" word ";"
```

エンティティどうしは重なりません。
`#` は語の文字ではないので、
`#a#b;` が持つエンティティは 2 つ目の `#` からの `#b;` の 1 つで、
`##a;` は `#a;` を持ち、最初の `#` はテキストです。
行終端も語の文字ではないので、行末の `#a` と後の行の `b;` や `;` は、
間にコメント行があってもなくても、エンティティになりません。
`#a`、U+2028、`b;` も、`-` が語の文字でない `#a-b;` も、
エンティティになりません。
一方 `_` は語の文字なので、`#_;` はエンティティです。
`#` の直後や `;` の直前のディレクティブはエンティティの中にあり、
エンティティはディレクティブを除いたテキストで読まれます。
`;` の直前に 2 つのディレクティブがあっても同じです。
このようなエンティティの `;` は、`;` が文を終える場所でも区切りになりません。
sequence では、`A->>B: x #a`、ディレクティブ、
`;B->>A: y` は 1 つのメッセージで、`x`、`#a;` のプレースホルダ、
`B->>A: y` からなります。
`#` の直後や、語の 2 つの文字の間にディレクティブがあっても同じです。
一方、`#a`、コメント行、`;B->>A: y` はエンティティにならず、
メッセージは `x` と `y` です。
sequence では、メッセージのテキストは `#` の手前で終わり、
`#` からは行の残りを取る図のコメントになるからです。
[fixture: common/entity-hash-inside-word-second-hash-starts]
[fixture: common/entity-double-hash]
[fixture: common/entity-cut-by-line-terminator]
[fixture: common/entity-not-across-comment-line]
[fixture: common/entity-semicolon-after-comment-line]
[fixture: common/entity-cut-by-line-separator]
[fixture: common/entity-hyphen-not-word]
[fixture: common/entity-underscore-word]
[fixture: common/entity-directive-after-hash]
[fixture: common/entity-directive-before-semicolon]
[fixture: common/entity-directive-in-word-in-message]
[fixture: common/entity-directive-after-hash-in-message]
[fixture: common/entity-directive-before-semicolon-in-message]
[fixture: common/entity-two-directives-before-semicolon-in-message]
[fixture: common/entity-not-across-comment-line-in-message]
[文の文脈](./diagrams/sequence.ja.md#文の文脈) を参照してください。

字句の規則: 字句解析器は、エンティティをそのプレースホルダとして読みます。
語が ASCII の数字だけからなる場合、`#` _語_ `;` を `ﬂ°°` _語_ `¶ß` として読み、
そうでなければ `ﬂ°` _語_ `¶ß` として読みます。
文字は U+FB02、U+00B0、U+00B6、U+00DF です。
字句解析器は、エンティティのソース上の文字の代わりに、
プレースホルダの文字に対して単位の規則を照合します。
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
その後の U+00B0 を読む規則はないので、 `A#x;-->B` は拒否されます。
[fixture: flowchart/lex-link-text-entity-dash] [fixture:
flowchart/lex-ellipse-entity-start] [fixture:
flowchart/lex-entity-in-vertex-id]
プレースホルダの文字がどこで許されるかは、図の字句解析器によります。
flowchart ではラベルの文字列の中で許され、
ノード ID やスタイルの値の中では拒否されます。
各図の文書を見てください。

変換: テキストの変換した形では、エンティティはそのプレースホルダです。
mermaid.js はプレースホルダを、
図を描画するときにだけ HTML エンティティに戻すので、
Db はプレースホルダの形を持ちます。
`A[a #amp; b]` のラベルは、Db では `a ﬂ°amp¶ß b` で、木の値は `a #amp; b` です。
[fixture: common/entity-named] [fixture: common/entity-numeric]

`#+123;` はエンティティではありません。
`+` は語の文字ではないからです。 [fixture: common/entity-plus]

エンティティは、行単位の規則が当てはまるかどうかにかかわらず、
ラベルのテキストの中で見つかります。
`A[Issue #123; fixed]` は数字のエンティティ `#123;` のプレースホルダを持ち、
行単位の規則が当てはまらない
`A[<span style='color: #f00; font-weight: bold'>x</span>]` は `#f00;`
のプレースホルダを持ちます。
一方、`A[<span style='color:#f00'>x</span>]` のように `;` のない `#f00` は、
書かれたままです。 [fixture: common/entity-css-in-label-spaces] [fixture:
common/entity-css-in-label-no-semicolon] [fixture:
common/entity-numeric-in-label-text]
タグの外でも同じで、
`A[color: #f00; is red]` は `#f00;` のプレースホルダを持ちます。
[fixture: common/entity-in-label-outside-tag]

## テキストの終わり

字句の規則: mermaid.js は、解析の前にテキストの末尾に `\n` を足します。
そのため、図の文法にとって、テキストの終わりは行終端のように振る舞います。
最後の文の後に改行がない図も、改行があるものとして読まれます。
[fixture: flowchart/header-only-no-line-break] [fixture: common/cr-only]
足した `\n` はソースの一部ではないので、木にノードを加えません。

## 空白

どの文字を空白とみなすかは、図の字句解析器がそれぞれ決めます。
mermaid.js のパターンから作った字句解析器は、
たいてい [表記](#表記) で定めた空白をすべて、
U+00A0 や U+FEFF も含めて空白として扱います。 [fixture: common/nbsp-as-space]
[fixture: common/bom-mid-text]

## 既知の差異

[known-divergences.ja.md](./known-divergences.ja.md) で定める差異のうち、
次のものがこの文書で定めることに関わります。

- [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.ja.md):
  名前、キーワード、区切り記号、矢印、数の中のディレクティブ。
- [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.ja.md):
  フロントマターの中で始まる HTML タグ。
- [`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.ja.md):
  名前、数、キーワード、矢印、区切り記号の中の無視される `;`。
- [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md):
  この仕様が解析も検査もしない埋め込みデータ。
- [`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.ja.md):
  別の図種のヘッダーの後の C4 のキーワード。
- [`bare-percent-line-before-header`](./known-divergences/bare-percent-line-before-header.ja.md):
  ヘッダーの前の `%%` だけの行のうち、 mermaid.js の字句解析器が拒否するもの。

# 木のトークン

英語版: [tokens.md](./tokens.md)

この文書は、`@mmd-toolkit/parser` が作る木のトークンと、根の一覧を定めます。
木の形は、仕様の [`ast.ja.md`](../../spec/docs/ast.ja.md) が定めます。
位置は [positions.ja.md](./positions.ja.md) が定めます。

## 設計の目標

- **トークンとコメントの一覧**: ESLint と同じく、
  根はすべてのトークンをソースの順に `tokens` に、
  すべてのコメントを `comments` に持つ。
  空白でも行終端でもない文字は、どれもトークンかコメントに含まれる。
  ESLint のために作られた道具はそれを前提にする。
  ディレクティブも種類 `Directive` のトークンであり、
  フロントマターの区切りと本文もトークンである。
  根は、ディレクティブとフロントマターを、それ自身の欄を持つ記録としても、
  `directives` と `frontmatter` に持つ。
  コメントはトークンではない。

## トークン

トークンは、図の字句解析器が読む、図の 1 つの字句の単位か、
ディレクティブか、フロントマターの一部です
（[ディレクティブとフロントマター](../../spec/docs/ast.ja.md#ディレクティブとフロントマター)
を参照）。
トークンは `Root.tokens` に並びます。
トークンはノードではなく、ノードの欄の値にもなりません。

| 欄      | 型             | 意味                                         |
| ------- | -------------- | -------------------------------------------- |
| `type`  | 文字列         | トークンの種類。下の一覧のどれか。           |
| `value` | 文字列         | `range` のソースのテキスト。書かれたとおり。 |
| `range` | オフセットの組 | ソースの中のトークンの場所。                 |
| `loc`   | 場所           | 同じ場所を行と列で表したもの。               |

`value` は、ESLint のトークンと同じく、トークンの範囲のソースのテキストです。
[common.ja.md](../../spec/docs/common.ja.md) の変換は適用しません。
行終端を `\n` として、属性の引用符を `'` として、
エンティティをそのプレースホルダとして読むこともしません。
[fixture: flowchart/lex-lone-cr-directive-lf-label]
[fixture: class/db-class-def-attribute-quote]
[fixture: class/db-acc-title-entity]
[fixture: class/tokens-string-crlf-in-note]
コメント領域と、行単位の規則が無視する `;` は、どのトークンの中にもなく、
中にあることになるトークンを切ります
（[Comment](#comment) と下を参照）。
[fixture: flowchart/tokens-comment-region-after-opening-quote]
[fixture: common/entity-css-in-string-label]
ノードの値はそれらを飛ばしますが、変換はしません
（[ノード](../../spec/docs/ast.ja.md#ノード) を参照）。

トークンの種類は次のものだけです。
各図の文書が、そのトークンがどの種類かを述べます。
種類は、図が必要とするときにここに加えます。

| 種類               | 使うもの                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 意味                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`          | [flowchart](./tokens/flowchart.ja.md#トークン)、[sequence](./tokens/sequence.ja.md#トークン)、[class](./tokens/class.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)、[er](./tokens/er.ja.md#トークン)、[gantt](./tokens/gantt.ja.md#トークン)、[journey](./tokens/journey.ja.md#トークン)、[requirement](./tokens/requirement.ja.md#トークン)、[mindmap](./tokens/mindmap.ja.md#トークン)、[timeline](./tokens/timeline.ja.md#トークン)、[sankey](./tokens/sankey.ja.md#トークン)                                                                                                                        | その位置で決まった意味を持つ語。                                                                                                                                                                                 |
| `Identifier`       | [flowchart](./tokens/flowchart.ja.md#トークン)、[class](./tokens/class.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)、[er](./tokens/er.ja.md#トークン)、[gantt](./tokens/gantt.ja.md#トークン)、[requirement](./tokens/requirement.ja.md#トークン)                                                                                                                                                                                                                                                                                                                                                      | 書き手が選ぶ名前。                                                                                                                                                                                               |
| `Numeric`          | [flowchart](./tokens/flowchart.ja.md#トークン)、[sequence](./tokens/sequence.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 数。                                                                                                                                                                                                             |
| `String`           | [flowchart](./tokens/flowchart.ja.md#トークン)、[class](./tokens/class.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)、[er](./tokens/er.ja.md#トークン)、[gantt](./tokens/gantt.ja.md#トークン)、[requirement](./tokens/requirement.ja.md#トークン)、[mindmap](./tokens/mindmap.ja.md#トークン)、[sankey](./tokens/sankey.ja.md#トークン)                                                                                                                                                                                                                                                                | 引用符付きの文字列。引用符を含む。                                                                                                                                                                               |
| `StringFragment`   | [flowchart](./tokens/flowchart.ja.md#トークン)、[class](./tokens/class.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)、[er](./tokens/er.ja.md#トークン)、[gantt](./tokens/gantt.ja.md#トークン)、[requirement](./tokens/requirement.ja.md#トークン)、[mindmap](./tokens/mindmap.ja.md#トークン)、[sankey](./tokens/sankey.ja.md#トークン)                                                                                                                                                                                                                                                                | コメント領域、無視される `;`、ディレクティブのどれかが切った、引用符付きの文字列の断片。その前か後のテキストで、閉じの引用符か開きの引用符を持たない（[Comment](#comment) と、`;` とディレクティブは下を参照）。 |
| `RawText`          | すべての図（フロントマターの本文）、`error` 疑似図種（[ErrorDiagram](../../spec/docs/ast.ja.md#errordiagram) を参照）、[flowchart](./tokens/flowchart.ja.md#トークン)、[sequence](./tokens/sequence.ja.md#トークン)、[class](./tokens/class.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)、[er](./tokens/er.ja.md#トークン)、[gantt](./tokens/gantt.ja.md#トークン)、[journey](./tokens/journey.ja.md#トークン)、[requirement](./tokens/requirement.ja.md#トークン)、[mindmap](./tokens/mindmap.ja.md#トークン)、[timeline](./tokens/timeline.ja.md#トークン)、[sankey](./tokens/sankey.ja.md#トークン) | パーサーが中の構造を読まずに 1 つの内容として扱う文字の並びで、引用符で囲まれていないもの（囲まれていれば `String`）。ラベルのテキストやスタイルなど。                                                           |
| `Punctuator`       | すべての図（フロントマターの区切り）、[flowchart](./tokens/flowchart.ja.md#トークン)、[sequence](./tokens/sequence.ja.md#トークン)、[class](./tokens/class.ja.md#トークン)、[state](./tokens/state.ja.md#トークン)、[er](./tokens/er.ja.md#トークン)、[gantt](./tokens/gantt.ja.md#トークン)、[journey](./tokens/journey.ja.md#トークン)、[requirement](./tokens/requirement.ja.md#トークン)、[mindmap](./tokens/mindmap.ja.md#トークン)、[timeline](./tokens/timeline.ja.md#トークン)、[sankey](./tokens/sankey.ja.md#トークン)                                                                                  | `[` や `-->` のような、区切り、区切り記号、演算子。                                                                                                                                                              |
| `Directive`        | すべての図                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ディレクティブ（[Directive](../../spec/docs/ast.ja.md#directive) を参照）。                                                                                                                                      |
| `IgnoredSemicolon` | すべての図、`error` 疑似図種                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | [`style` 行と `classDef` 行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行) が無視する `;`。mermaid.js はそれをテキストから除き、どの文法も読まない。                                                |

どの文字がトークンになり、それがどの種類かは、各図の文書が定めます。
ただし、`Directive` のトークン、`StringFragment` のトークン、
`IgnoredSemicolon` のトークン、フロントマターのトークンは、どの図でも同じです。
閉じていない文字列の `String` のトークンは、閉じの引用符を持ちません
（[StringLiteral](../../spec/docs/ast.ja.md#stringliteral) を参照）。
文字列が両方の引用符を持つかは、トークンの種類ではなく、
その StringLiteral の `closed` の欄で分かります。
[fixture: class/lex-backquote-unclosed-alone]

空白と行終端が単独でトークンになるのは、
mermaid.js がそれを値として読むところと、
ディレクティブ、コメント領域、無視される `;` が値を切る 2 つの所の間か、
そのような所と値の端の間で、値の一部として読むところだけです（下を参照）。
[fixture: class/db-generic-blank]
[fixture: flowchart/tokens-directives-label-space-between]
[fixture: sequence/tokens-title-directive-then-spaces]
[fixture: state/tokens-alias-ignored-semicolon-then-spaces]
[fixture: flowchart/comment-lines-after-separator-0e277222]
図の文法が行終端に意味を与える場所、たとえば文の終わりでは、
字句解析器はそれを読みますが、そのためのトークンもノードも作りません。
それが区切ったものは、文の並びのような木の構造に現れます。
[fixture: common/crlf]
ラベルの本文や複数行の引用符付き文字列のように、
空白や行終端がトークンの範囲の中にある場合は、そのトークンの一部です。
[fixture: flowchart/db-subgraph-title-inner-spaces]
[fixture: class/lex-string-multi-line]
字句解析器が行終端をどう読むかは
[行終端](../../spec/docs/common.ja.md#行終端) の規則で、
トークンの問題ではありません。

値のトークンは、mermaid.js がその値として読むテキストを覆います。
最初のトークンはそのテキストの始まりから始まり、
最後のトークンはその終わりで終わります。
そのため、mermaid.js が値の始まりか終わりで読む空白と行終端は、
値のトークンの一部です。
[fixture: class/db-generic-spaces]
[fixture: class/tokens-callback-arguments-line-feeds-at-ends]
mermaid.js が空白だけとして読む値は、その空白のトークンを持ち、
その種類は、図がその位置の値に与える種類です。
[fixture: class/db-generic-blank]
キーワードの周りや、mermaid.js が両端を削る値の周りのもののように、
mermaid.js が値の一部として読まない空白と行終端は、どのトークンにも属しません。
[fixture: state/db-label-trimmed]
ディレクティブ、コメント領域、無視される `;` が値を切るところでも同じです。
切れ目の隣の空白と行終端のうち、mermaid.js が値の一部として読むものは、
隣の断片に属します。
そのため、mermaid.js が値の一部として読む文字は、
どれもトークンの外にありません。
class 図の `style A fill:#f00,color ;:blue` は、
後ろの空白を含む `fill:#f00,color`、`IgnoredSemicolon` のトークン、
`:blue` をトークンに持ち、`classDef c fill:#f00,color ;:blue` も同じです。
[fixture: class/tokens-style-ignored-semicolon-after-space]
[fixture: class/tokens-class-def-ignored-semicolon-after-space]
これは、mermaid.js が値として読むテキストについての決まりです。
StateIgnoredText のような、mermaid.js が読まないテキストのノード
（[ノード](../../spec/docs/ast.ja.md#ノード) を参照）は、
その単位のトークンを持ち、単位の間の空白と行終端は、
値の一部ですが、どのトークンにも入りません。
`state "d" as A`、行 `state %% c`、行 `state {` の `textBeforeBody` は、
`Keyword` のトークン `state` と `state` を持ち、その間にコメントがあります。
値は `state`、空白、改行、空白 2 つ、`state` です。
[fixture: state/tokens-ignored-text-comment-between-units]
mermaid.js が値として読むテキストを位置ごとに述べるのは、図の文書です。
この文書は、値のトークンがそれを覆うことだけを述べます。

字句解析器は、
[`style` 行と `classDef` 行の規則](../../spec/docs/common.ja.md#style-行と-classdef-行)
が無視する `;` を、ないかのように読み進めます。
そのため、その前後のトークンは、`;` がないものとして見つかります。
そのうえで `;` 自身は、どの図でも、
種類が `IgnoredSemicolon` の単独のトークンで、
ほかのトークンはそれをまたぎません。
1 つのトークンの文字がその前後にあるときは、
コメント領域と同じく（[Comment](#comment) を参照）、
`;` はそのトークンを同じ種類の断片に切ります。
`String` のトークンの断片は `StringFragment` のトークンです。
このように切られてよいのは、`RawText` と `String` のトークンだけです。
ほかの種類のトークン、
つまり名前、数、キーワード、矢印、ほかの区切り記号の内側では、
`;` は入力を拒否させ
（[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)
を参照）、
エラーはその `;` にあります
（[既知の差異](./error-positions.ja.md#既知の差異) を参照）。
[fixture: flowchart/div-ignored-semicolon-in-id]
[fixture: sequence/div-ignored-semicolon-in-autonumber-start]
[fixture: flowchart/div-ignored-semicolon-in-keyword]
[fixture: flowchart/div-ignored-semicolon-in-arrow]
[fixture: flowchart/div-ignored-semicolon-in-triple-colon]
flowchart の `A["<span style='color:#f00;font-weight:bold;'>x</span>"]` では、
行の規則が `bold` の後の `;` を無視し、ラベルは `StringFragment` のトークン
`"<span style='color:#f00;font-weight:bold` と `'>x</span>"` を持ち、
その間に `IgnoredSemicolon` のトークンがあります。
[fixture: common/entity-css-in-string-label]
`IgnoredSemicolon` のトークンは、どのノードのトークンでもなく、
ノードの 2 つのトークンの間、つまりその範囲の中にあることがあります
（[ノード](../../spec/docs/ast.ja.md#ノード) を参照）。
値の書かれたテキストはそれを除くので、どのノードの値もそれを持ちません。
種類によって、無視される `;` と、文法が読む `;` を区別できます。
flowchart では、`style A fill:#f00;` は、行の規則が無視する
`IgnoredSemicolon` のトークン `;` で終わり、
`style A fill:red;` は、
文の区切りである `Punctuator` のトークン `;` で終わります。
[fixture: flowchart/tokens-style-semicolon-ignored] [fixture:
flowchart/tokens-style-semicolon-separator] 文法は無視される `;`
を読まないので、それがノードを作ることはありません。
flowchart では、文法が 1 つの行として読む `;` だけが空の文を作ります。
たとえば `error` 疑似図種では、
行末の `style:#f;` は `RawText` のトークン `style:#f` と、
それに続く `IgnoredSemicolon` のトークン `;` で、
`style:#f;x` は `RawText` のトークン `style:#f` と `x` と、
その間の `IgnoredSemicolon` のトークンです
（[ErrorDiagram](../../spec/docs/ast.ja.md#errordiagram) を参照）。
[fixture: common/error-style-semicolon-trailing] [fixture:
common/error-style-semicolon-inside]

## 根の一覧

`Root` は、
[`ast.ja.md`](../../spec/docs/ast.ja.md#root) の欄のほかに、次の欄を持ちます。

| 欄         | 型           | 意味                                                                                   |
| ---------- | ------------ | -------------------------------------------------------------------------------------- |
| `comments` | Comment の列 | すべてのコメント。ソースの順。                                                         |
| `tokens`   | Token の列   | すべてのトークン。`Directive` のトークンとフロントマターのトークンを含む。ソースの順。 |

`comments` と `tokens` は一覧で、子の欄ではありません。
空白でも行終端でもない文字は、どれも `tokens` か `comments` に入ります。
そのため、
ESLint の `SourceCode` のようにトークンとコメントを合わせてたどる道具は、
ディレクティブやフロントマターのところに隙間を見ません。
[fixture: common/config-directive-after-frontmatter]

## コメント

コメントは、記録として `Root.comments` に並びます。
どのノードもそれを持たず、木をたどる道具はそれを訪れません。
コメント、ディレクティブ、フロントマターのどの記録も `range` と `loc` を持ち、
そのテキストは範囲のソースのテキストです。
コメントはトークンではありません。
どのトークンとコメントの外にもあるディレクティブは、
`Root.tokens` の中のトークンでもあり、
その種類は `Directive`、範囲は記録と同じです。
フロントマターは 2 つか 3 つのトークンで、それらがその範囲を分けます
（[フロントマターのトークン](#フロントマターのトークン) を参照）。
`Identifier` がノードとトークンの種類の両方の名前であるのと同じく、
ディレクティブの記録とトークンは同じ名前を持ちます。
ただし、`value` に持つものは違います。
記録は中身を持ち
（[Directive](../../spec/docs/ast.ja.md#directive) を参照）、
トークンは、どのトークンとも同じく、範囲のソースのテキストを持ちます。
[fixture: common/comment-after-directive]
[fixture: common/config-directive-after-frontmatter]

### Comment

`type` は `Comment` です。

| 欄      | 型                                   | 意味                                                                                     |
| ------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `mark`  | `%%`、`#`、`%` のどれか、または null | コメントの印。コメント行は `%%`、図のコメントはその印。コメント領域の後の断片では null。 |
| `value` | 文字列                               | 印の後のソースのテキスト。印のない断片では、その範囲のソースのテキスト。                 |

`mark` は印の文字を持ちます。
それは、いつも範囲の先頭のソースのテキストとは限りません。
`%%%{init: {}}%%% c` では、印は最初と最後の `%` からなる `%%` で、
その間にディレクティブがあります。
印は次の 3 つです。
コメント行と一部の図のコメントの `%%`、図のコメントの `#` と `%` です。
コメントがほかの印を持つ図種は、それをこれに足します。
図種の図のコメントがどの印を持つかは、その図の文書が定めます。
[sequence](../../spec/docs/diagrams/sequence.ja.md#単位と文脈)
の `#`、`%%`、`%` がそうです。
ツールは、コメントが印を持つかどうか、どの印を持つかを、この欄から読みます。
[fixture: common/comment-percent-joined-by-directive] [fixture:
sequence/lex-single-percent-comment] [fixture:
state/lex-diagram-comment-across-comment-line]

コメント行は `Comment` になり、**図のコメント**も `Comment` になります。
図のコメントは、図自身の字句解析器がコメントとして読むテキストで、
図の文書が定めます。
[sequence](../../spec/docs/diagrams/sequence.ja.md#文の文脈) の、
行の途中の `#` や `%%` がそうです。
範囲は印から始まり、行終端の手前で終わります。
図の文書が、図のコメントを行の区間の終わりで終えると定めるところでは、
その区間を終える U+2028 や U+2029 の手前で終わります
（[mindmap](../../spec/docs/diagrams/mindmap.ja.md#コメント) がそうです）。
印は、コメント行の `%%` の最初の `%` か、図のコメントの印です。
コメントは印から始まり、印より前の文字はコメントに含まれません。
[fixture: common/comment-after-directive]
[fixture: sequence/lex-hash-ends-text]
[fixture: sequence/lex-percent-comment-after-unit]
[fixture: mindmap/lex-comment-ends-at-line-separator]
例外は、コメント領域の後の図のコメントの断片です（下を参照）。
コメント領域が覆う空白だけの行と行終端は、空白と行終端です。
[fixture: common/comment-blank-line-before-in-string]
コメントの中のディレクティブは、その後の行終端を取ることがあり、
そのときコメントはその先まで続きます
（[コメント行](../../spec/docs/common.ja.md#コメント行) を参照）。
ディレクティブがテキストの終わりまでをすべて取るところでは、
コメントはディレクティブが終わるところで終わります。
ディレクティブの走査が引数の後に取る空白は、ディレクティブの範囲の外にあり
（[Directive](../../spec/docs/ast.ja.md#directive) を参照）、
コメントの範囲の外にもあるので、
行終端で終わるコメントはありません。
テキストの終わりで、空白と空行が続く `%% %%{init: {}` では、
ディレクティブが `%%{init: {}` であるのと同じく、
コメントは `%% %%{init: {}` です。
終わりに改行があるときも、`%% %%{wrap`、行 `A`、空白の行のときも同じです。
閉じたディレクティブの後では、走査は空白を取らないので、
空白 2 つと改行が続く `%% %%{init: {}}%%` は、空白 2 つを持つコメントです。
どのコメントも、行終端の前の空白を持つのと同じです。
[fixture: common/comment-directive-unclosed-trailing-blank-lines] [fixture:
common/comment-directive-unclosed-line-feed-at-end] [fixture:
common/comment-directive-word-argument-trailing-blank-line] [fixture:
common/comment-directive-closed-then-spaces]
図のコメントは、トークンと同じく、
行の規則が無視する `;` がないものとして見つけます
（[トークン](#トークン) を参照）。
そのような `;` は、その両側にコメントの文字があればコメントの中にあり、
そうでなければ `IgnoredSemicolon` のトークンです。
sequence の `A->>B: x #style:#x;` の終わりでは、
コメントは `#style:#x` で、その後の `;` は `IgnoredSemicolon` のトークンです。
agentflow 以外の図では、
行の規則がコメント領域を行の区間から除くので、
コメント行がそのような `;` を持つことはありません
（[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)
を参照）。
[fixture: sequence/tokens-comment-then-ignored-semicolon]
Db が
[`preserveCommentsWhenParsing`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L66-L76)
を設定している図（pin した mermaid.js では agentflow）は、
パーサーの入力でコメント行を受け取ります。
それを木でどう表すかは、その図の文書で述べます。
文の後ろにある `%%` や `%%` だけの行のように、
コメント行でない `%%` は
[図のテキスト](../../spec/docs/common.ja.md#ソースの読み方) で、
図の字句解析器が読みます。
それはトークンの一部か、class の `%%` だけの行のように、
図の文書が図のコメントとするところでは図のコメントです。
[fixture: common/comment-mid-line-style]
[fixture: common/comment-bare]
[fixture: class/lex-bare-percent-line-between-statements]
ヘッダーの前では、そうした行は `%%` だけの行で、
検出が読んで通り過ぎ、図の字句解析器は読み直しません。
どの図種でも、印 `%%` の図のコメントで、
`%%` から行の終わりまでです
（[図種の検出](../../spec/docs/common.ja.md#図種の検出) を参照）。
[fixture: sequence/header-after-bare-percent-line]
[fixture: class/header-after-empty-braces-line]
[fixture: state/header-after-bare-percent-line]
[fixture: flowchart/header-after-bare-percent-line]

コメント領域は、行の終わりまで続く図のコメントの中にあることもあります。
その行の U+2028 か U+2029 の後のコメント行は、
mermaid.js が読むときにはないので、
行はコメント行の後に続きます。
領域は、トークンと同じく、図のコメントを切ります
（[トークンの中のコメント領域](#トークンの中のコメント領域) を参照）。
それぞれの断片、つまり領域の前か後のテキストから、
領域の側の空白と行終端を除いたものが `Comment` で、
空か空白だけの断片は `Comment` になりません。
最後の断片は、どのコメントとも同じく、行終端の前の空白を持ちます。
state の `state X ""` に ` %% c`、U+2028、行 `%% d`、
`x` と空白の行が続くと、コメントは `%% c`、`%% d`、空白のついた `x` です。
U+2028 の前の空白や、領域の後の行の初めの空白 2 つは、
どのコメントにも入りません。
[fixture: state/tokens-ignored-text-comment-cut-fragment-trailing-space]
[fixture: state/tokens-ignored-text-comment-cut-space-before-separator]
[fixture: state/tokens-ignored-text-comment-cut-spaces-after-region]
領域の後の断片は印を持たず、その `mark` は null です。
その範囲は最初の文字から始まり、値はその範囲のソースのテキストです。
state の `A %% x`、U+2029、行 `%% end`、行 `B` は、
`%% x`、`%% end`、`B` のコメントをこの順に持ち、状態は A だけです。
`B` の前に空行があると、
図のコメントは `%% end` の後の改行で終わり、B は状態です。
コメント行がなければ、`A %% x`、U+2029、`B` は 1 つのコメントです。
U+2029 は図のコメントを終えないからです。
[fixture: state/lex-diagram-comment-across-comment-line] [fixture:
state/lex-hash-comment-across-comment-line] [fixture:
state/lex-diagram-comment-across-comment-line-after-line-separator] [fixture:
state/lex-diagram-comment-across-two-comment-lines] [fixture:
state/lex-diagram-comment-across-blank-and-comment-line] [fixture:
state/lex-diagram-comment-across-init-comment-line] [fixture:
sequence/lex-hash-comment-across-comment-line] [fixture:
state/lex-diagram-comment-empty-line-after-comment-line] [fixture:
state/lex-diagram-comment-paragraph-separator-without-comment-line]
行の規則が無視する `;` が図のコメントの中にあるか（上を参照）は、
領域が切る前のコメント全体で、1 回だけ決めます。
`;` の両側に、空白を含めてコメントの文字があれば、中にあります。
その行の領域の後の文字と、領域の前の U+2028 か U+2029 も、その文字に入ります。
その後で、領域がコメントを切ります。
そのため state の `A %% style:#x;`、U+2029、行 `%% end` は、
`;` を含むコメント `%% style:#x;` を持ちます。
空白 2 つが続く `A %% style:#x;` と同じです。
`;` の前に空白があれば、コメントは `%% style:#x ;` です。
[fixture: state/tokens-ignored-semicolon-in-comment-before-comment-line]
[fixture:
state/tokens-ignored-semicolon-after-space-in-comment-before-comment-line]
[fixture: state/tokens-ignored-semicolon-in-comment-across-comment-line]
[fixture: state/tokens-ignored-semicolon-in-comment-before-spaces]

コメント行の `%%`
より後にあるディレクティブは、コメントの範囲の中にあり、
mermaid.js はそれも設定のために読みます
（[設定の走査](../../tests/docs/configuration.ja.md#設定の走査) を参照）。
[fixture: common/directive-in-comment] `%%{init: {}}%% %% note` のように、
コメントの `%%` より前にあるディレクティブは、コメントの外にあります。
コメントはその `%%` から始まるからです。
[fixture: common/comment-after-directive] `%%%{init: {}}%%% c` では、
コメントの `%%` は最初と最後の `%` なので、
その間のディレクティブはコメントの範囲の中にあり、
コメントの `value` は空白 1 つと `c` です。
[fixture: common/comment-percent-joined-by-directive]
印が `%%` の図のコメントも同じです。
その印はディレクティブを除いたテキストの上で見つけ、
その 2 つの `%` の間にディレクティブがあってもよく、
`value` は、ディレクティブを含む、印の後のソースのテキストです
（[sequence](../../spec/docs/diagrams/sequence.ja.md#単位と文脈) を参照）。
[fixture: sequence/lex-diagram-comment-directive-between-marks] [fixture:
sequence/lex-diagram-comment-directive-after-single-mark]
どの図のコメントでも、印の後のディレクティブはコメントの範囲の中にあり、
`Directive` のトークンを持ちません。
sequence の `A->>B: x #c %%{init: {}}%%` の終わりでは、
コメントは `#` から閉じの `%%` まで続き、
state の `A --> B %% c %%{init: {}}%%` でも `%%` から同じです。
[fixture: sequence/tokens-diagram-comment-directive-at-end] [fixture:
state/tokens-diagram-comment-directive-at-end]

## トークンの中のコメント領域

コメントは、どのトークンの外にもあります。
複数行の引用符付きラベルの中の `%%` のコメント行のように、
コメント領域が 1 つの単位の読む中にあることがあります。
字句解析器は領域を読み進めるので、単位はその後も続きますが
（[コメント行](../../spec/docs/common.ja.md#コメント行) を参照）、
そのトークンは領域で切られます。
各**断片**は、領域の前か後のトークンのテキストで、
領域の前の行終端のように、領域の隣の空白と行終端のうち、
mermaid.js が値の一部として読むものを含みます
（[トークン](#トークン) を参照）。
領域は、その空白だけの行と、そのコメントを終える行終端とともに、
どのトークンの外にもあります。
空の断片はトークンになりません。
[fixture: flowchart/tokens-rawtext-comment-line-then-closing-bracket]
空白と行終端だけの断片も、mermaid.js が値の一部として読まないもの、
たとえば mermaid.js が両端を削るラベルの始まりにあるものは、
トークンになりません。
1 つのトークンの中に領域がいくつもあれば、それぞれで切ります。
[fixture: flowchart/tokens-string-two-comment-lines]
[fixture: flowchart/tokens-rawtext-two-comment-lines]
コメント領域を持ちうるのは、
単位が行をまたぎうる `String` と `RawText` のトークンだけです。
`String` のトークンの断片は `StringFragment` のトークンです。
`RawText` のトークンの断片は、
ディレクティブが切るトークンの断片が元の種類を持つのと同じく、
`RawText` のトークンです
（[Directive](../../spec/docs/ast.ja.md#directive) を参照）。
ラベル、StringLiteral、リテラルなど、単位のノードは断片と領域にまたがり、
その値は、これまでどおり領域の前と後のテキストをつないだものです。
`A["one`、行 `%% two`、行 `three"]` では、ラベルは `StringFragment` のトークン
`"one` とその後の改行、そして `three"` を持ち、その間にコメントがあり、
値は `one`、改行、`three` です。
`A["`、行 `%% c`、行 `b"]` では、断片は `"` と改行、そして `b"` です。
`A[`、行 `%% c`、行 `b]` では、領域の前のテキストはラベルの始まりの改行で、
mermaid.js はそれをラベルの一部として読まないので、
ラベルは `RawText` のトークン `b` だけを持ちます。
[fixture: common/comment-in-string] [fixture:
common/comment-blank-line-before-in-string] [fixture:
flowchart/tokens-comment-region-after-opening-quote] [fixture:
flowchart/tokens-comment-region-at-label-start]
`%%` だけの行はコメント行ではない
（[コメント行](../../spec/docs/common.ja.md#コメント行)を参照）ので、
断片の中に残ります。
`A[a`、行 `%% c`、行 `%%`、行 `b]` では、
断片は `a` と改行、そして `%%`、改行、`b` のテキストです。
`%%` の行がコメント行の前にあるときは、
断片は `a`、改行、`%%`、改行と、`b` です。
文字列の `A["a`、行 `%% c`、行 `%%`、行 `b"]` では、
断片は `StringFragment` のトークン `"a` と改行、そして `%%`、改行、`b"` です。
[fixture: flowchart/tokens-comment-region-then-bare-marker-line] [fixture:
flowchart/tokens-comment-region-after-bare-marker-line] [fixture:
flowchart/tokens-comment-region-then-bare-marker-line-in-string]
そのような領域は、引用符付きの文字列、ラベルと辺のテキスト、説明のブロック、
データブロック、`call` の後のコールバックの名前、バッククォートの名前、
何行かにわたるノートの中にあります。
[fixture: flowchart/tokens-string-literal-comment-line] [fixture:
flowchart/tokens-comment-region-in-subgraph-title-string] [fixture:
flowchart/tokens-comment-region-in-edge-text] [fixture:
flowchart/tokens-comment-region-in-dashed-edge-text] [fixture:
flowchart/tokens-comment-region-in-acc-descr-block] [fixture:
flowchart/tokens-comment-region-in-data-block] [fixture:
flowchart/tokens-comment-region-in-callback-name] [fixture:
sequence/tokens-comment-region-in-acc-descr-block] [fixture:
class/tokens-comment-region-in-acc-descr-block] [fixture:
class/tokens-comment-region-in-click-string] [fixture:
class/tokens-comment-region-in-backquoted-name] [fixture:
class/tokens-comment-region-in-callback-name] [fixture:
state/tokens-comment-region-in-alias-string] [fixture:
state/tokens-comment-region-in-note-block] [fixture:
state/tokens-comment-region-in-acc-descr-block]

## ディレクティブのトークン

ディレクティブはトークンの境界なので
（[common.ja.md](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)
を参照）、
ほかのトークンの中にはありません。
コメントの中のディレクティブは、`Directive` のトークンを持たず、
その文字はそのコメントに含まれます。
[fixture: common/directive-in-comment]
コメント領域の中で、コメントの `%%` より前にあるディレクティブは、
領域が 1 つの単位の読む中にあるときも、
領域がその単位のトークンを切るので
（[Comment](#comment) を参照）、
どのトークンとコメントの外にもあり、`Directive` のトークンです。
[fixture: common/comment-region-directive-in-string] [fixture:
common/comment-directive-in-string]

## フロントマターのトークン

フロントマターの記録は、
[`ast.ja.md`](../../spec/docs/ast.ja.md#frontmatter) の欄のほかに、
次の欄を持ちます。

| 欄           | 型             | 意味                          |
| ------------ | -------------- | ----------------------------- |
| `valueRange` | オフセットの組 | ソースの中の `value` の場所。 |

範囲は、開始の区切りの行の `---` から、閉じる `---` までです。
開始の `---` の前の字下げと、閉じる区切りの後の空白と空行は、
フロントマターの規則も覆いますが、空白と行終端です。
[fixture: common/frontmatter-indented]
[fixture: flowchart/demo-flowchart-4301e540]

フロントマターの範囲は、次のトークンをこの順に持ちます。
開始の `---` で、`Punctuator` のトークン。
本文がすべて空白でなければ本文で、
本文の空白でない最初の文字から最後の文字までの `RawText` のトークン。
閉じる `---` で、`Punctuator` のトークン。
[fixture: common/frontmatter-empty-body]
[fixture: common/frontmatter-indented]
範囲のほかの部分は空白と行終端です。
各 `---` の後の同じ行の空白、本文の前の空白だけの行、
本文の始まりと終わりの空白がそうで、本文の最初の行の字下げも含みます。
[fixture: common/frontmatter-blanks-after-delimiters]
[fixture: common/frontmatter-blank-line-before-body]
本文のほかの行の字下げは本文のトークンの中にあり、
`value` は字下げをすべて含む本文を持ちます。
[fixture: common/config-directive-after-frontmatter]
区切りの行は、字下げ、`---`、行の空白しか持たないので、
ほかのトークンはその行にありません。
`---` の後の U+2028 は行の空白です。
[fixture: common/frontmatter-indented] [fixture:
flowchart/frontmatter-title-crlf] [fixture:
common/frontmatter-bom-both-delimiters]
[fixture: common/frontmatter-blank-line-then-delimiter-only] [fixture:
common/frontmatter-line-separator-after-opening] [fixture:
common/frontmatter-line-separator-end-of-body] [fixture:
common/frontmatter-line-separator-inside-body]

区切りと本文が別のトークンなのは、それらが別の行だからです。
その間の改行と字下げは配置で、
道具は、図のトークンの間と同じく、空白として読みます。
ディレクティブは 1 つのトークンです。
1 つの続いたテキストで、その名前と引数は記録が持つからです。
どのトークンとも同じく、フロントマターのトークンはどのノードにも属しません。
開始の区切りの `Punctuator` のトークン `---` は、
図の範囲にある flowchart の `---` の辺ではありません。

## 文字列のトークン

StringLiteral のトークンは、引用符を含む 1 つの `String` のトークンで、
範囲はそのトークンの範囲なので、
`raw` はそのトークンの `value` に等しくなります。
[fixture: flowchart/gram-label-space-string]
コメント領域、無視される `;`、ディレクティブがそれを切るときは、
そのトークンは `StringFragment` のトークンで、
範囲はその最初から最後までで、
領域、`IgnoredSemicolon` のトークン、`Directive` のトークンを含みます
（[トークンの中のコメント領域](#トークンの中のコメント領域)、
[トークン](#トークン)、
[ディレクティブが切るトークン](#ディレクティブが切るトークン) を参照）。
`click A "u" "one`、改行、`%% c`、改行、`two"` では、
ツールチップのトークンは `StringFragment` のトークン `"one` と `two"` です。
`click A href "u%%{init: {}}%%v"` では、
URL のトークンは `StringFragment` のトークン `"u` と `v"` で、
その間に `Directive` のトークンがあります。
[fixture: flowchart/tokens-string-literal-comment-line]
[fixture: flowchart/lex-directive-in-click-href-string]
[fixture: common/entity-css-in-string-label]

閉じていない文字列のトークンと範囲は、その書かれたテキストの終わりまで続きます
（[StringLiteral](../../spec/docs/ast.ja.md#stringliteral) を参照）。
その終わりの後のディレクティブは、
どのノードのトークンでもないので、範囲の外にあります。
テキストの終わりの `A --> `、`` `b``、空白、`%%{init: {}}%%` は、
`` `b`` と空白の 1 つの `String` のトークンを持ちます。
[fixture: class/lex-backquote-unclosed-directive-at-end]
その中のディレクティブは、
範囲にディレクティブを持つことになるどのトークンとも同じく、それを切ります
（[ディレクティブが切るトークン](#ディレクティブが切るトークン) を参照）。
閉じた文字列と同じく、範囲の中のどのディレクティブもそうです。
`class`、`` `a %%{init: {}}%% b``、改行は、
バッククォート、`a`、空白の `StringFragment` のトークンと、
空白、`b`、改行のトークンを持ち、
その間に `Directive` のトークンがあります。
[fixture: class/tokens-backquote-unclosed-directive-between-spaces]
class 図で、テキストの終わりの `class`、`` `x%%{init: {}}%%y``、改行は、
`StringFragment` のトークン `` `x`` と、改行を含む `y` を持ちます。
[fixture: class/lex-backquote-unclosed-directive-inside]
`class`、`` `x``、改行、`%%{init: {}}%%`、改行は、
`StringFragment` のトークン、`` `x`` とその後の改行、
そして最後の改行を持ちます。
どちらでも、その間に `Directive` のトークンがあります。
[fixture: class/lex-backquote-unclosed-directive-after-line-break]

## 数のトークン

NumericLiteral のトークンは、1 つの `Numeric` のトークンです。
範囲はそのトークンの範囲なので、`raw` はそのトークンのソースのテキストです。
[fixture: state/gram-scale]
数の中のディレクティブと、行の規則が無視する `;` は、入力を拒否させます
（[ディレクティブはトークンの境界](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)、
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)
を参照）。
[fixture: sequence/div-directive-in-number]
[fixture: sequence/div-ignored-semicolon-in-autonumber-start]

## error 疑似図種のトークン

`Directive` のトークンとフロントマターのトークンのほかのトークンは、
ディレクティブとコメント領域を除いたテキストの中の、
空白でも行終端でもない文字の最長の並びから作り、
どれも `RawText` のトークンです。
[fixture: common/error-trailing-percent]
並びは空白や行終端で終わり、並びの 2 つの文字の間のディレクティブは、
どのトークンとも同じく、
並びを切ります
（[common.ja.md](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)
を参照）。
[fixture: common/error-split-by-directive]
行単位の規則が無視する `;` は、
どの図とも同じく `IgnoredSemicolon` のトークンです
（[トークン](#トークン) を参照）。
それはどの並びにも含まれず、
中にある並びを 2 つの `RawText` のトークンに切ります。
[fixture: common/error-style-semicolon-inside]
ノードのトークンはその `RawText` のトークンで、
範囲はその最初の始まりから最後の終わりまでです
（[ノード](../../spec/docs/ast.ja.md#ノード) を参照）。
それは必ず 1 つ以上あります。
検出が見つけた `error` の文字が、1 つのトークンにあるか、
ディレクティブに切られて複数のトークンにあるからです（下を参照）。
[fixture: common/error-directive-adjacent]
[fixture: common/error-split-by-directive]

並びは、[図のテキスト](../../spec/docs/common.ja.md#ソースの読み方) ではなく、
テキストの文字からなります。
行単位の規則が無視する `;` は図のテキストではありませんが、
トークンです。
[fixture: common/error-style-semicolon-trailing]
コメントは必ずトークンの外にあります。
コメント領域はコメント開始位置、つまりテキストの先頭か、行終端、U+2028、
U+2029 の直後から始まり、それらはどれも並びを切るからです。
[fixture: common/error-comment-inside]

検出器は、検出の追加の除去の後でしかテキストを見ないので、
トークンは語 `error` だけとは限りません。

- `%%`、改行、`error` のトークンは、`%%` と `error` です。
  [fixture: common/error-bare-percent-line]
- 後に改行がある `error %% x` のトークンは、`error`、`%%`、`x` です。
  `%% x` はコメント行ではないのでコメントではなく、検出だけがそれを除きます。
  [fixture: common/error-trailing-percent]
- `error%%{wrap}%%` のトークンは `error` の 1 つで、
  その後にディレクティブの `Directive` のトークンが続きます。
  [fixture: common/error-directive-adjacent]
- 後に改行がある `error %%{init: {}}%% %% x` のトークンは、`error`、`%%`、
  `x` で、最初の 2 つの間に、ディレクティブの `Directive` のトークンがあります。
  [fixture: common/error-directive-inside]
- `error`、改行、`%% c`、改行、後に改行がある `%%{ }` のトークンは、`error`、
  `%%{`、`}` で、最初の 2 つの間の、トークンの外にコメント `%% c` があります。
  `%%{ }` はディレクティブでもコメント行でもないからです。
  [fixture: common/error-comment-inside]
- 後に改行がある `error %% style:#f;` のトークンは、`error`、`%%`、`style:#f`、
  `;` です。
  行単位の規則が `;` を無視するので、`;` は `IgnoredSemicolon` のトークンです。
  `error %% style:#f;x` のトークンは、`error`、`%%`、`style:#f`、`;`、`x` です。
  無視される `;` が、並び `style:#f;x` を切ります。
  [fixture: common/error-style-semicolon-trailing] [fixture:
  common/error-style-semicolon-inside]

`err%%{init: {}}%%or` のように語の中にあるディレクティブは、検出では除かれ、
検出は `error` を見るので、入力は mermaid.js と同じく `error` 疑似図種です。
ディレクティブは並びを切り、トークンは `err` と `or` になり、
その間にディレクティブの `Directive` のトークンがあります。
[fixture: common/error-split-by-directive]

## Identifier のトークン

`Identifier` は、ESTree や ESLint と同じく、トークンの種類の名前でもありますが、
ノードとトークンは別のものです。
ノードは `Root.body` から子の欄をたどって届き、
その `name` は、その単位のテキストを順につないだものです
（[Identifier](../../spec/docs/ast.ja.md#identifier) を参照）。
トークンは `Root.tokens` にだけあり、その `value` は範囲のソースのテキストです。

Identifier のトークンは 1 つの `Identifier` のトークンで、
その範囲はノードの範囲です。
単位の中にも単位の間にも空白はなく、
その内側にディレクティブか、行の規則が無視する `;` があると、入力を拒否します
（[ディレクティブはトークンの境界](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)
を参照）。
`A%%{init: {}}%%B-->C` は、そのディレクティブのところで拒否します。
[fixture: flowchart/div-directive-in-id]
[fixture: flowchart/div-ignored-semicolon-in-id]

空白を含みうる名前は、代わりに図種の名前のノードです
（[共通の葉のノード](../../spec/docs/ast.ja.md#共通の葉のノード) を参照）。
そのトークンは `RawText` のトークンで、
どのテキストとも同じく、ディレクティブや無視される `;` が切ってかまいません。

- class 図では、ClassIdentifier は、
  間に空白のない単位の並びごとに 1 つの `RawText` のトークンを持ちます。
  2 つの並びの間の空白は、mermaid.js が読まないので、
  どのトークンにも入りません。
  `class Foo Bar` が宣言するクラスは `FooBar` で、
  トークンは `Foo` と `Bar` です。
  `class Foo%%{init: {}}%% Bar` も同じです。
  `class A%%{init: {}}%%.B` が宣言するクラスは `A.B` で、
  トークンは `A` と `.B`、その間に `Directive` のトークンがあります。
  無視される `;` も同じように切ります。
  `A "style:#x" --> B;C` のクラス `BC` は、トークン `B` と `C` を持ち、
  その間に `IgnoredSemicolon` のトークンがあります。
  [fixture: class/gram-name-spaces] [fixture:
  class/lex-directive-between-name-parts] [fixture:
  class/lex-directive-in-dotted-name]
  [fixture: class/tokens-ignored-semicolon-in-relation-name]
- sequence 図では、SequenceIdentifier は、
  その単位の 1 つの `RawText` のトークンを持ち、
  mermaid.js が名前の一部として読む、中の空白もそのトークンに入ります。
  `participant A%%{init: {}}%% c%%B` の参加者は `A c%%B` で、
  トークンは `A` と ` c%%B`、その間に `Directive` のトークンがあります。
  無視される `;` も同じように切ります。
  `participant Z@{ "style": "x:#y" };participant B;C` の参加者 `BC` の
  トークンは `B` と `C` です。
  [fixture: sequence/lex-directive-in-id-before-space]
  [fixture: sequence/tokens-ignored-semicolon-in-participant-id]

## ディレクティブが切るトークン

- 範囲の中にディレクティブを持つトークンは、ディレクティブのところで切られます。
  単位の中にディレクティブを持つトークン、
  複数の単位からなり、そのうち 2 つの間にディレクティブがあるトークン、
  閉じていない class のバッククォートの名前のように、
  ディレクティブを越えて値の終わりの空白まで続くトークンです
  （[文字列、バッククォートの名前、ジェネリクスの型](../../spec/docs/diagrams/class.ja.md#文字列バッククォートの名前ジェネリクスの型)
  を参照）。
  [fixture: common/directive-in-string]
  [fixture: class/lex-directive-in-dotted-name]
  [fixture: class/lex-backquote-unclosed-directive-after-line-break]
  切ってよいのは `RawText` と `String` のトークンだけで、
  ほかの種類のトークンの内側のディレクティブは、入力を拒否させます
  （[ディレクティブはトークンの境界](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)
  を参照）。
  `A(%%{init: {}}%%(x))` では、
  円の 2 つの `(` が 1 つの `Punctuator` のトークンなので、拒否します。
  [fixture: flowchart/div-directive-in-circle-opening]
  [fixture: flowchart/div-directive-in-id]
  [fixture: sequence/div-directive-in-number]
  [fixture: flowchart/div-directive-in-keyword-href]
  [fixture: flowchart/div-directive-in-arrow-length]
  各断片は、ディレクティブの隣の空白と行終端のうち、
  mermaid.js が値の一部として読むものを含めて、同じ種類のトークンです
  （[トークン](#トークン) を参照）。
  `String` のトークンの断片だけは、`StringFragment` のトークンです。
  空白と行終端だけの断片も、2 つのディレクティブの間のように、
  mermaid.js が値の一部として読むならトークンで、
  そうでなければトークンになりません。
  断片の間のディレクティブは `Directive` のトークンです。
  ラベルや参加者の id の値のように、元のトークンが表していたものは変わりません。
  `A[x%%{init: {}}%% y]` のラベルはトークン `x` と ` y` を持ち、
  その値は `x`、空白、`y` です。
  2 つのディレクティブの間に空白がある
  `A[x %%{init: {}}%% %%{init: {}}%% y]` では、
  その空白が 1 つのトークンです。
  `A["a %%{init: {}}%% b"]` のラベルは、
  `StringFragment` のトークン `"a ` と ` b"` を持ち、
  その値は `a`、空白 2 つ、`b` です。
  [fixture: flowchart/tokens-directive-label-space-after] [fixture:
  flowchart/tokens-directives-label-space-between] [fixture:
  common/directive-in-string]

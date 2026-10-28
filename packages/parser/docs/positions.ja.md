# 木の位置

英語版: [positions.md](./positions.md)

この文書は、`@mmd-toolkit/parser` が作る木の位置を定めます。
ノード、トークン、コメント、ディレクティブ、フロントマターの `range` と `loc`、
ノードの範囲、不変条件です。
木の形、つまりノードの型、欄、値は、
仕様の [`ast.ja.md`](../../spec/docs/ast.ja.md) が定めます。
トークンと根の一覧は [tokens.ja.md](./tokens.ja.md) が定めます。

## 設計の目標

- **位置を持つ**: どのノード、トークン、コメント、ディレクティブ、
  フロントマターも、ESTree の慣習に従って `range` と `loc` を持つ。
- **無損失**: 木は入力を何も失わない。
  入力のどの文字も、トークンかコメントに含まれるか、
  [表記](../../spec/docs/common.ja.md#表記) で定めた空白か、
  行終端である（[不変条件](#不変条件) を参照）。
  ソースのテキストと範囲があれば、入力がそのまま再現される。

## 欄の型

- **オフセットの組**は、2 つの整数で、開始オフセットと終了オフセットです。
  [位置](#位置) で述べます。
- **位置**と**場所**は、[位置](#位置) で述べる記録です。

## 位置

- オフセットは、ESTree や Prettier と同じく、UTF-16 のコード単位で数えます。
  `range` の 2 つのオフセットの間のソースのテキストが、それを持つノード、
  トークン、コメント、ディレクティブ、
  フロントマターのテキストです。 [fixture: sequence/lex-text-after-non-bmp-character]
- `range` はオフセットの組です。
  0 から数える開始オフセットと、
  含まない終了オフセットです。 [fixture: common/crlf]
- `loc` は場所です。
  `start` と `end` の位置を持ちます。
  各位置は、1 から数える `line` と、
  UTF-16 のコード単位で 0 から数える `column` を持ちます。 [fixture: common/crlf]
  [fixture: sequence/lex-text-after-non-bmp-character]
- `\r\n`、単独の `\r`、`\n` は、どれも行を終えます。
  mermaid.js が `\n` に正規化するのがこれらの並びだからです（[行終端](../../spec/docs/common.ja.md#行終端) を参照）。
  U+2028 と U+2029 は行を終えません。 [fixture: common/crlf]
  [fixture: common/directive-spans-lone-cr]
  [fixture: common/comment-after-u2028]
  [fixture: common/comment-after-u2029]

| 記録 | 欄       | 型   | 意味                                   |
| ---- | -------- | ---- | -------------------------------------- |
| 位置 | `line`   | 整数 | 1 から数える行番号。                   |
| 位置 | `column` | 整数 | UTF-16 のコード単位で 0 から数える列。 |
| 場所 | `start`  | 位置 | 最初の文字の位置。                     |
| 場所 | `end`    | 位置 | 最後の文字の直後の位置。               |

この仕様は、意図して 2 つの単位を使います。
[common.ja.md](../../spec/docs/common.ja.md) の規則は文字について述べ、
文字は Unicode のコードポイントです（[表記](../../spec/docs/common.ja.md#表記) を参照）。
位置は UTF-16 のコード単位で数えます。
基本多言語面の外の文字は、1 文字ですが 2 コード単位なので、
`range` のオフセットと `column` を 2 進めます。 [fixture: sequence/lex-text-after-non-bmp-character]

## ノードの範囲

どのノードも、 [`ast.ja.md`](../../spec/docs/ast.ja.md#ノード) の欄のほかに、
次の欄を持ちます。

| 欄      | 型             | 意味                           |
| ------- | -------------- | ------------------------------ |
| `range` | オフセットの組 | ソースの中のノードの場所。     |
| `loc`   | 場所           | 同じ場所を行と列で表したもの。 |

ノードの範囲は通常、そのノードの最初のトークンの始まりから、
最後のトークンの終わりまでです。
ノードの型が、ソースの EOF まで範囲を広げると明示する場合もあります。
`Root.range` は常に入力全体を覆います。
ノードのトークンは、そのノードが表す構文のトークンです。
`Directive` のトークンとフロントマターのトークンは、
どのノードのトークンでもありません。
ただし、`Directive` のトークンが、ノードの 2 つのトークンの間、
つまりその範囲の中にあることはあります。
それが自明でない場合は、各ノードの型がどれかを述べます。
区切りのように 2 つのノードの間にあるトークンは、
どちらにも属さないことがあります。 [fixture: flowchart/tokens-label-string-directive-then-text]
[fixture: flowchart/tokens-diagram-trailing-separator]
どの文法も読まない `IgnoredSemicolon` のトークンも、同じく、
どのノードのトークンでもなく、ノードの 2 つのトークンの間、
つまりその範囲の中にあることがあります。 [fixture: common/entity-css-in-string-label]
そのため、`Root.body` のノードのトークンは、
`Directive` と `IgnoredSemicolon` のトークンを除く、
図のテキストのすべてのトークンで、最初のものから最後のものまでです。
その範囲は、最後の文の後の区切りのように、
どの文にも属さないトークンも覆いますが、
そのトークンの最後のものの後のディレクティブや無視される `;` は、
通常は覆いません。
ただし、EOF で終わる子によって、図の範囲がそれらの後まで延びる場合があります。
flowchart の `A;` の図の範囲は、区切りである `;` の後で終わり、
最後の行が `classDef c fill:#f00;` の class 図の範囲は、
行の規則が無視する `;` の前で終わります。 [fixture: flowchart/tokens-diagram-trailing-separator]
[fixture:
class/tokens-class-def-ignored-semicolon]
[fixture: flowchart/gram-separator-before-directive]
ノードの範囲は、その子のノードの範囲をすべて覆います。
位置からノードを探す道具や、コメントを割り当てる道具のように、
ESTree の木をたどる道具はこれを前提にします。
構文のトークンだけではそうならないところでは、
ノードの型が範囲の広げ方を述べます。
未閉鎖の AgentflowAccDescrBlockStatement とそれを含む図は、
末尾の空白や directive を含めてソースの EOF までを覆います。
読み飛ばした trivia のためにトークンを追加することはありません。 [fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]

`Root.range` は `[0, input.length]` です。 [fixture: common/crlf]

## 不変条件

どの木も、次の条件を満たします。

- 入力のどの文字も、トークンかコメントに含まれるか、空白か行終端である。
  空白は [表記](../../spec/docs/common.ja.md#表記) で定めた集合で、 U+00A0、
  U+FEFF、U+2028、 U+2029 を含む。 [fixture: common/whitespace-characters]
  [fixture: common/nbsp-as-space]
  [fixture: common/bom-mid-text]
  [fixture: common/comment-after-u2028]
  [fixture: common/comment-after-u2029]
- どのトークン、コメント、ディレクティブ、フロントマターのテキストも、
  その範囲のソースのテキストと一致する。
  トークンでは、
  そのテキストが `value` である。 [fixture: common/directive-spans-lone-cr]
- `Root.tokens` はソースの順に並び、
  そのトークンは互いに重ならない。 [fixture: flowchart/tokens-label-string-directive-then-text]
- トークンが空白や行終端で始まるか終わるのは、それが、
  mermaid.js が値として読むテキストの始まりか終わりにあるところ、
  そのテキストを切るディレクティブ、コメント領域、
  無視される `;` の隣にあるところ、
  前のトークンが始めた値を続けるトークンの始まりだけである。
  最後のものは、flowchart のラベルが始める文字列の後のテキストなどである。
  [トークン](./tokens.ja.md#トークン) と、
  [flowchart のトークン](./tokens/flowchart.ja.md#トークン) を参照。 [fixture: class/db-generic-spaces]
  [fixture: flowchart/tokens-directive-label-space-after]
  [fixture: common/comment-in-string]
  [fixture: class/tokens-style-ignored-semicolon-after-space]
  [fixture: flowchart/gram-label-string-then-text]
  空白だけのトークンは、それが属する値に属するトークンが直後に続くところでも、
  空白で終わりうる。
  sequence の箱のテキストの、色の候補と残りの間の空白がそうである。
  [sequence のトークン](./tokens/sequence.ja.md#トークン) を参照。 [fixture: sequence/tokens-box-text-space-between-parts]
  [fixture: sequence/db-box-colour-then-spaces-and-line-separator]
- コメントは、どのトークンの外にもある。 [fixture: common/comment-in-string]
- ディレクティブは、ほかのどのトークンの中にもない。
  コメントの中、つまりその印の後か、 `%%` の印の 2 つの `%` の間にはありうる。
  どのトークンとコメントの外にもある各ディレクティブには、
  その範囲を持つ `Directive` のトークンがちょうど 1 つあり、
  どの `Directive` のトークンも、
  そのようなディレクティブのものである。 [fixture: common/directive-in-comment]
  [fixture: common/comment-percent-joined-by-directive]
  [fixture: common/comment-after-directive]
- 行単位の規則が無視し、どのコメントの外にもある各 `;` には、
  その範囲を持つ `IgnoredSemicolon` のトークンがちょうど 1 つあり、
  どの `IgnoredSemicolon` のトークンも、
  そのような `;` のものである。 [fixture: common/entity-css-in-string-label]
  [fixture: sequence/tokens-comment-then-ignored-semicolon]
  [fixture: state/tokens-ignored-semicolon-in-comment-before-comment-line]
- コメントどうし、
  ディレクティブどうしは重ならない。 [fixture: common/comment-after-directive]
  [fixture: flowchart/tokens-string-two-comment-lines]
  [fixture: flowchart/tokens-directives-label-space-between]
- フロントマターがあるとき、最初のトークンは、その範囲の中のトークンである。
  開始の `---`、すべて空白でなければ本文、
  閉じる `---` がそうである（[Frontmatter](../../spec/docs/ast.ja.md#frontmatter) を参照）。
  それらはすべてのコメントとディレクティブより前にある。 [fixture: common/config-directive-after-frontmatter]
  [fixture: common/frontmatter-empty-body]
- ソースの EOF まで明示的に延びる型と、それを含むノードを除き、
  ノードの範囲は最初のトークンの始まりから最後のトークンの終わりまでである。
  `Root.range` は入力全体を覆う。
  `Root` を除いて、この文書で定めるどのノードも 1 つ以上のトークンを持つ。
  `ErrorDiagram` は、
  `error` の文字を持つ 1 つ以上のトークンを持ち（[error 疑似図種のトークン](./tokens.ja.md#error-疑似図種のトークン) を参照）、
  すべて空白の [FlowchartLabel](../../spec/docs/ast/flowchart.ja.md#flowchartlabel) は、
  その空白のトークンを持つ。
  [flowchart のトークン](./tokens/flowchart.ja.md#トークン) を参照。 [fixture: common/error-split-by-directive]
  [fixture: flowchart/gram-label-space]
- ノードの範囲は、その子のノードの範囲を覆う。
  ノードの子のノードは重ならない。
  文書がそうでないと述べるノードを除き、子の欄の順に、
  各一覧はその中の順に取ると、子のノードはソースの順に並ぶ。
  [ノード](../../spec/docs/ast.ja.md#ノード) を参照。 [fixture: flowchart/gram-data-consecutive-blocks]
  [fixture: flowchart/gram-pipe-label-space-after]
  [fixture: flowchart/db-arrow-dash-head-length]
- `raw` を持つノード、つまり StringLiteral と NumericLiteral の `raw` は、
  その範囲のソースのテキストに等しい。 [fixture: flowchart/gram-label-space-string]
  [fixture: state/gram-scale]
- どのトークン、コメント、ディレクティブも、空の範囲を持たない。
  mermaid.js が空として読む値はトークンを持たず、
  空の断片はトークンにもコメントにもならず、
  コメントとディレクティブは少なくともその印を含む。
  空として読む値でトークンを持つのは、sankey 図の空白だけの欄だけである。
  これはノードを作るので、その空白のトークンを持つ。
  [sankey のトークン](./tokens/sankey.ja.md#トークン) を参照。 [fixture: flowchart/gram-acc-title-empty-at-end]
  [fixture: flowchart/tokens-rawtext-comment-line-then-closing-bracket]
  [fixture: class/lex-bare-percent-line-between-statements]
  [fixture: common/directive-empty-argument]
  [fixture: sankey/db-spaces-only-target-id]

2 つ目の条件はソースのテキストについてのものです。
`Token.value` と、どのコメント、ディレクティブ、フロントマターのテキストも、
その範囲の入力と一致します。
コメント領域、ディレクティブ、行単位の規則が無視する `;` を除いたノードの値は、
この条件の対象ではありません。

packet の範囲は [packet](./positions/packet.ja.md#範囲) で定めます。

architecture の範囲は [architecture](./positions/architecture.ja.md#範囲) で定めます。

radar の範囲は [radar](./positions/radar.ja.md#範囲) で定めます。

Treemap の範囲は [treemap](./positions/treemap.ja.md#範囲)で定義する。

Railroad の範囲は [railroad](./positions/railroad.ja.md#範囲)で定めます。

Wardley の範囲は [wardley](./positions/wardley.ja.md#範囲)で定める。

Cynefin の範囲は [cynefin](./positions/cynefin.ja.md#範囲)に従います。

Eventmodeling の範囲は [eventmodeling](./positions/eventmodeling.ja.md#範囲)に従います。

Treeview の範囲は [treeview](./positions/treeview.ja.md#範囲)に従う。

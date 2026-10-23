# パーサーの開発

英語版: [development.md](./development.md)

パーサーのテストについては [`testing.ja.md`](./testing.ja.md)。

## パーサーは仕様の参照実装である

- すべての挙動は、[`@mmd-toolkit/spec`](../../spec) の仕様から来ます。
  仕様は [`common.md`](../../spec/docs/common.ja.md)、
  [`ast.md`](../../spec/docs/ast.ja.md)、
  [`detection.md`](../../spec/docs/detection.ja.md) と、
  [`diagrams/`](../../spec/docs/diagrams) の下の各図の文書です。
- 木のトークンと位置は、このパッケージの
  [`tokens.md`](./tokens.ja.md) と [`positions.md`](./positions.ja.md)
  が定めます。
- [`@mmd-toolkit/tests`](../../tests) の fixture も仕様の一部です。
- mermaid.js のソースは、このパッケージの挙動の出どころではありません。
- 仕様に書かれていないことは、ここで埋めずに仕様へ報告します。

## 実装済みのもの

すべての図に共通の部分を、仕様から実装済みです。
どれも元のソースのテキストから直接読みます。

- 行終端子
- HTML 属性の引用符
- フロントマター
- ディレクティブ
- コメント行
- 先頭の空白
- `style` と `classDef` の行の規則
- 実体参照
- テキストの終わり
- 図種の検出（mermaid.js 12.0.0 のすべての図種）

図の本体は、今のところ `error` 疑似図種と、
flowchart（`flowchart-v2`、`flowchart-elk`、`swimlane`）と、
シーケンス図（`sequence`）と、クラス図（`classDiagram`）と、
状態図（`stateDiagram`）と、ER 図（`er`）と、Gantt チャート（`gantt`）と、
journey 図（`journey`）と、要求図（`requirement`）と、
mindmap（`mindmap`）と、timeline（`timeline`）と、
sankey 図（`sankey`）と、XY チャート（`xychart`）と、
四象限チャート（`quadrantChart`）と、ブロック図（`block`）と、
kanban 図（`kanban`）と、C4 図（`c4`）と、venn 図（`venn`）と、
Ishikawa 図（`ishikawa`）と、agentflow（`agentflow`）と、
usecase 図（`usecase`）と、円グラフ（`pie`）です。
ほかの図種を検出すると `UnsupportedDiagramError` を投げます。

## 図のパーサーの作り

各図のパーサーは、その図の文書、
[`diagrams/flowchart.md`](../../spec/docs/diagrams/flowchart.ja.md)、
[`diagrams/sequence.md`](../../spec/docs/diagrams/sequence.ja.md)、
[`diagrams/class.md`](../../spec/docs/diagrams/class.ja.md)、
[`diagrams/state.md`](../../spec/docs/diagrams/state.ja.md)、
[`diagrams/er.md`](../../spec/docs/diagrams/er.ja.md)、
[`diagrams/gantt.md`](../../spec/docs/diagrams/gantt.ja.md)、
[`diagrams/journey.md`](../../spec/docs/diagrams/journey.ja.md)、
[`diagrams/requirement.md`](../../spec/docs/diagrams/requirement.ja.md)、
[`diagrams/mindmap.md`](../../spec/docs/diagrams/mindmap.ja.md)、
[`diagrams/timeline.md`](../../spec/docs/diagrams/timeline.ja.md)、
[`diagrams/sankey.md`](../../spec/docs/diagrams/sankey.ja.md)、
[`diagrams/xychart.md`](../../spec/docs/diagrams/xychart.ja.md)、
[`diagrams/quadrant.md`](../../spec/docs/diagrams/quadrant.ja.md)、
[`diagrams/block.md`](../../spec/docs/diagrams/block.ja.md)、
[`diagrams/kanban.md`](../../spec/docs/diagrams/kanban.ja.md)、
[`diagrams/c4.md`](../../spec/docs/diagrams/c4.ja.md)、
[`diagrams/venn.md`](../../spec/docs/diagrams/venn.ja.md)、
[`diagrams/ishikawa.md`](../../spec/docs/diagrams/ishikawa.ja.md)、
[`diagrams/agentflow.md`](../../spec/docs/diagrams/agentflow.ja.md)、
[`diagrams/usecase.md`](../../spec/docs/diagrams/usecase.ja.md)、
[`diagrams/pie.md`](../../spec/docs/diagrams/pie.ja.md)
のどれかに従います。
3 つの部分からなります。

- 図のテキストを単位に分ける字句解析器（`src/diagrams/<図種>/units.ts`）
- 単位の上の再帰下降パーサー（`src/diagrams/<図種>/grammar.ts`）
- 単位から記録する、図のトークンの文書が定めるトークン
  （[`tokens/flowchart.md`](./tokens/flowchart.ja.md) など）

どの図の字句解析器とパーサーも同じように行うことは、それぞれ 1 か所にあります。
単位とその読み方は `src/diagram-units.ts` にあります。
字句解析器の文脈のスタック、
各場所で現在の文脈の最初に合う規則を当てること、
終わってはいけない文脈でテキストが終わったときのエラーは、
`src/unit-lexer.ts` の `UnitLexer` にあります。
単位の読み進め、ノードの位置、値の書かれたテキスト、共通の葉のノード、
文法の項目のトークンは、`src/unit-grammar.ts` の `UnitGrammar` にあります。
`tokenless-empty-forms` の空の形は `src/empty-forms.ts` にあります。
複数の図の文書が共有する規則も 1 か所にあります。
flowchart とクラス図と状態図と ER 図と要求図の方向の行は
`src/direction-line.ts` にあり、
状態図と ER 図と要求図はその語を大文字と小文字を区別せずに比べます。
flowchart とクラス図の文字の規則の Unicode の文字は
`src/unicode-letters.ts` にあります。
シーケンス図の字句解析器が `#` と `%` を、
クラス図の字句解析器が `%%` を、
状態図の字句解析器が `#` と `%%` を、
Gantt チャートの字句解析器が `%` を、
journey 図と要求図と timeline の字句解析器が `#` と `%` を、
mindmap、kanban 図、C4 図、venn 図、Ishikawa 図の字句解析器が
`%%` を読むように、
図のコメントを読む図は、それを共通の部分に渡し、
共通の部分が `Root.comments` に記録します。
中にコメント領域があれば、トークンと同じく、そこで切ります。
mermaid.js が Db を作るときに行う拒否は、パーサーが文法の後で行います。
flowchart では `subgraph-members.ts`、
シーケンス図とクラス図と状態図では `db-rejections.ts` です。
Gantt チャートでは、`topAxis` の文がノードを作らないので、
文法がその文を読んだところで 2 つの拒否を行います。
mindmap では、文法がノードを読むときに字下げで木の中に置くので、
その行を読んだところで 2 つの拒否を行います。
kanban 図の文法は、平坦なノードの行の並びを保ちつつ、
行を読んだところで 2 つの拒否を行います。
timeline では、文法が event の文を読んだところで 1 つの拒否を行います。
クラス図の字句解析器は、各メンバーの行を、
[メンバーの行](../../spec/docs/diagrams/class.ja.md#メンバーの行)
の手順で部分に分けます。
その手順は `src/diagrams/class/member-lines.ts` にあります。
クラスの本体でも、メンバーの文のラベルでも同じで、
分けられないメソッドの行は拒否します。

flowchart の subgraph の Db の id は、1 か所で作ります。
`src/diagrams/flowchart/subgraph-ids.ts` が、単位から、
名前のテキストの範囲と、
[文法の外での拒否](../../spec/docs/diagrams/flowchart.ja.md#文法の外での拒否)
の subgraph の id の規則で作ります。
文法は、mermaid.js が Db を作るときに行う拒否のために、
subgraph の要素についてこれを読みます。

図のテキストは、ディレクティブを除いて読みます。
トークンは、記録するときに、
ディレクティブと、行の規則が無視する `;` のところで切ります
（[ディレクティブはトークンの境界](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)、
[`style` 行と `classDef` 行](../../spec/docs/common.ja.md#style-行と-classdef-行)）。
単位が読み通すコメントの領域のところでも切ります
（[`tokens.md` の Comment](./tokens.ja.md#comment)）。
そのため、領域の中のコメントの `%%` より前のディレクティブは、
どのトークンの外にもあります。
`String` のトークンの断片は、`StringFragment` のトークンです。
切ってよいのは、`RawText` と `String` のトークンだけです。
ほかの種類のトークンの内側にディレクティブや無視される `;` があれば、
そのディレクティブか `;` のところで入力を拒否します。
これは、すべての図種について、`SourceLexer.recordTokens` が 1 か所で決めます。
トークンとコメントの外にある各ディレクティブは、
それだけで 1 つの `Directive` のトークンとして記録します。
フロントマターは最初に、
開く `---`、本文、閉じる `---` のトークンとして記録します
（[`ast.md` の Frontmatter](../../spec/docs/ast.ja.md#frontmatter)）。

C4 の文法は、消費する引数の位置にある `__proto__` キーを検査し、
更新先の有無を判断するために、別名と関係の端点だけを保持します。

venn の字句解析器は、行の始まりをまたいで暗黙の text モードを保持します。
文法は、変換した set 名を保持して union の要素を先行する宣言と照合し、
木は書かれた値を保持します。

Ishikawa の文法は書かれた字下げを保ち、根の字下げにはよらず、
最初の原因の字下げを使って親を選びます。
[fixture: ishikawa/db-indent-clamped] [fixture: ishikawa/db-indent-root-deeper]

## 道具

`tools/` には、パーサーの作業に使うスクリプトがあります。
ビルドも公開もされません。
`package.json` のスクリプトは、`node --conditions=source` で動かします。
テストと同じく、`@mmd-toolkit/tests` をそのソースから読むためです。
`packages/parser` で実行します。

- `pnpm run show-trees <図種> <fixture>...`:
  各 fixture の入力と、`ast.json` の木を出します。
  ノードは 1 行に 1 つで、親の下に字下げします。
  行には、ノードの方向や矢印の記号のような欄を出します。
  書かれた値を持つノードでは、値と範囲も出し、
  範囲のテキストが値と違うときは、そのテキストも出します。
  その後にトークンを出します。
  パーサーが拒否する fixture では、`parse-error.json` のエラーを出します。
  メッセージ、範囲、範囲のソースのテキストです。
- `pnpm run diff-trees <写し> <図種>`:
  `<写し>` は、変更の前に取った `packages/tests/fixtures/<図種>` の写しです。
  パースの結果、つまり `ast.json` と `parse-error.json` を比べます。
  新しくできたファイルと、なくなったファイルを出します。
  たとえば、いま拒否される入力は `new: <fixture>/parse-error.json` です。
  次に、違いの種類ごとに、それを持つ fixture の数を出します。
  違いの種類は、リストの位置を除いた、同じノードの型の同じ欄か、
  エラーの同じ欄です。
  その後に、違いを 1 つずつ、前と後の値とともに出します。

agentflow の lexer と文法は `src/diagrams/agentflow/`
に独自のファイルを持ちます。
flowchart と共通の字句規則には、`src/graph-unit-lexer.ts` の
`GraphUnitLexer` を使います。
data・shape・callback などの共通生成規則には、`src/graph-grammar.ts` の
`GraphGrammar` を使います。
各図種は独自の AST ノードを構築し、矢印の語彙、コメント規則、
名前の文法、波括弧の変換をそれぞれ持ちます。
既存の共通 reader、方向行規則、Unicode 文字の補助も使います。
テキストのラッパーは、終了波括弧後の最初の LF に直結する行空白だけを畳みます。
[fixture: agentflow/lex-brace-string-keeps-blank-line]
[fixture: agentflow/lex-brace-line-whitespace-ls]
[fixture: agentflow/lex-brace-ls-without-lf]

frontmatter と directive の除去後、正規化した長さが UTF-16 で 50000
単位以下なら、
SourceLexer は共通コメント領域を除去せずに行区間を読みます。
agentflow が先頭の trivia と独自のコメントを読みます。
上限を超える場合は共通のコメント除去経路を使います。
[fixture: agentflow/comment-default-size-equal-crlf]
[fixture: agentflow/comment-default-size-above-crlf]
[fixture: agentflow/comment-default-size-equal-inline-directive]
[fixture: agentflow/comment-default-size-above-frontmatter]

usecase の字句解析器は、通常の規則を仕様の順で試し、
JSON とステレオタイプには排他的な文脈を使います。
文法は書かれた出現を保ち、
ネイティブ metadata のプロパティと CSS 宣言を読みます。
名前空間、宣言の互換性、端点の種類、最終 metadata の検査は、
`src/diagrams/usecase/rejections.ts` が行います。
JSON table の本文は不透明で、
仕様の波括弧と文字列の釣り合いだけで終わりを探します。
[fixture: usecase/db-all-fields]
[fixture: usecase/lex-keyword-longer-number]
[fixture: usecase/gram-native-final-invalid-then-valid]
[fixture: usecase/div-json-balanced-invalid-array]

pie の字句解析器は、仕様の優先順位で、最初に一致した規則を採ります。
共通の複合形式と、
直後の LF を 1 つ消費する隠し YAML/DIRECTIVE 形式を含みます。
文法は、保持する形式を指定されたソースの隙間に所有させます。
セクションの値は、double 変換後にゼロ未満なら拒否します。
検出はフロントマター形のブロックを 1 回だけ通過し、pie のために保持します。
pie は 2 回目の走査のディレクティブも読みます。
検出が通過した裸の行はコメントのままです。
[fixture: pie/db-all-fields]
[fixture: pie/frontmatter-nonleading-comment]
[fixture: pie/lex-hidden-directive-second-detection-scan]
[fixture:
pie/lex-hidden-before-colon-lf]
[fixture: pie/review-hidden-directive-after-title]
[fixture: pie/number-negative]
[fixture: pie/number-negative-zero]

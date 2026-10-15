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
mindmap（`mindmap`）です。
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
[`diagrams/mindmap.md`](../../spec/docs/diagrams/mindmap.ja.md)
のどれかに従います。
3 つの部分からなります。

- 図のテキストを単位に分ける字句解析器（`src/diagrams/<図種>/units.ts`）
- 単位の上の再帰下降パーサー（`src/diagrams/<図種>/grammar.ts`）
- 単位から記録する、図のトークンの文書が定めるトークン
  （[`tokens/flowchart.md`](./tokens/flowchart.ja.md) など）

どの図の字句解析器とパーサーも同じように行うことは、それぞれ 1 か所にあります。
単位とその読み方は `src/diagram-units.ts` にあります。
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
journey 図と要求図の字句解析器が `#` と `%` を、
mindmap の字句解析器が `%%` を読むように、
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

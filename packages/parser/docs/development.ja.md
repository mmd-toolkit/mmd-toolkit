# パーサーの開発

英語版: [development.md](./development.md)

パーサーのテストについては [`testing.ja.md`](./testing.ja.md)。

## パーサーは仕様の参照実装である

- すべての挙動は、[`@mmd-toolkit/spec`](../../spec) の仕様から来ます。
  仕様は [`common.md`](../../spec/docs/common.ja.md)、
  [`ast.md`](../../spec/docs/ast.ja.md)、
  [`detection.md`](../../spec/docs/detection.ja.md) と、
  [`diagrams/`](../../spec/docs/diagrams) の下の各図の文書です。
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
シーケンス図（`sequence`）と、クラス図（`classDiagram`）です。
ほかの図種を検出すると `UnsupportedDiagramError` を投げます。

## 図のパーサーの作り

各図のパーサーは、その図の文書、
[`diagrams/flowchart.md`](../../spec/docs/diagrams/flowchart.ja.md)、
[`diagrams/sequence.md`](../../spec/docs/diagrams/sequence.ja.md)、
[`diagrams/class.md`](../../spec/docs/diagrams/class.ja.md) のどれかに従います。
3 つの部分からなります。

- 図のテキストを単位に分ける字句解析器（`src/diagrams/<図種>/units.ts`）
- 単位の上の再帰下降パーサー（`src/diagrams/<図種>/grammar.ts`）
- 単位から記録する、図の木の文書のトークン
  （[`ast/flowchart.md`](../../spec/docs/ast/flowchart.ja.md) など）

どの図の字句解析器とパーサーも同じように行うことは、それぞれ 1 か所にあります。
単位とその読み方は `src/diagram-units.ts` にあります。
単位の読み進め、ノードの位置、範囲のテキスト、共通の葉のノード、
文法の項目のトークンは、`src/unit-grammar.ts` の `UnitGrammar` にあります。
`tokenless-empty-forms` の空の形は `src/empty-forms.ts` にあります。
2 つの図の文書が共有する規則も 1 か所にあります。
flowchart とクラス図の方向の行は `src/direction-line.ts`、
両者の文字の規則の Unicode の文字は `src/unicode-letters.ts` にあります。
シーケンス図の字句解析器が `#` と `%` を、
クラス図の字句解析器が `%%` を読むように、
図のコメントを読む図は、それを共通の部分に渡し、
共通の部分が `Root.comments` に記録します。
mermaid.js が Db を作るときに行う拒否は、パーサーが文法の後で行います。
flowchart では `subgraph-members.ts`、
シーケンス図とクラス図では `db-rejections.ts` です。
クラス図の字句解析器は、各メンバーの行を、
[メンバーの行](../../spec/docs/diagrams/class.ja.md#メンバーの行)
の手順で部分に分けます。
その手順は `src/diagrams/class/member-lines.ts` にあります。
クラスの本体でも、メンバーの文のラベルでも同じで、
分けられないメソッドの行は拒否します。

図のテキストは、ディレクティブを除いて読みます。
種類が `RawText` と `Identifier` 以外の単位の内側にディレクティブがあれば、
入力を拒否します。
トークンは、記録するときにディレクティブのところで切ります
（[ディレクティブはトークンの境界](../../spec/docs/common.ja.md#ディレクティブはトークンの境界)）。
トークンとコメントの外にある各ディレクティブは、
それだけで 1 つの `Directive` のトークンとして記録します。
フロントマターは最初に、
開く `---`、本文、閉じる `---` のトークンとして記録します
（[`ast.md` の Frontmatter](../../spec/docs/ast.ja.md#frontmatter)）。

## 道具

`tools/` には、パーサーの作業に使うスクリプトがあります。
ビルドも公開もされません。
`packages/parser` で実行します。

- `pnpm run compare-with-mermaid <ファイル>`:
  `<ファイル>` は、入力の文字列の JSON の配列です。
  入力ごとに、入力と、`parse()` と pin した mermaid.js が一致するかを出します。
  `same: accepted, same Db`、`same: rejected`、または `DIFF:` と、
  2 つの受理・拒否か 2 つの Db の要約です。
  `parse()` が `ParseError` 以外を投げたとき、
  または木が木の検査を通らないときは、`BUG or broken tree:` を出します。
  木の Db の要約は fixture のテストと同じに作るので、
  既知の差異に当たる入力は `DIFF` になります。
- `pnpm run show-trees <図種> <fixture>...`:
  各 fixture の入力と、`ast.json` の木を出します。
  ノードは 1 行に 1 つで、親の下に字下げします。
  行には、ノードの方向や矢印の記号のような欄を出します。
  書かれた値を持つノードでは、値と範囲も出し、
  範囲のテキストが値と違うときは、そのテキストも出します。
  その後にトークンを出します。
- `pnpm run diff-trees <写し> <図種>`:
  `<写し>` は、変更の前に取った `packages/tests/fixtures/<図種>` の写しです。
  パースの結果、つまり `ast.json` と `parse-error.json` を比べます。
  新しくできたファイルと、なくなったファイルを出します。
  たとえば、いま拒否される入力は `new: <fixture>/parse-error.json` です。
  次に、違いの種類ごとに、それを持つ fixture の数を出します。
  違いの種類は、リストの位置を除いた、同じノードの型の同じ欄か、
  エラーの同じ欄です。
  その後に、違いを 1 つずつ、前と後の値とともに出します。

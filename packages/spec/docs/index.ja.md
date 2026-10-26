# Mermaid 構文仕様

英語版: [index.md](./index.md)

## 範囲

この仕様は、mermaid.js が受理するテキストの構文を記述します。
どの入力が受理され、どの入力が拒否され、受理された入力がどんな構造を表すかです。
描画とレイアウトは扱いません。
埋め込みデータは解析も検査もしません。
フロントマターの本文、ディレクティブの引数、
`@{ ... }`
のデータブロックは書かれたとおりに保持します
（[`embedded-data-opaque`](./known-divergences/embedded-data-opaque.ja.md)
を参照）。
mermaid.js が設定をどう求めるかは、この仕様の範囲の外です。

この文書のすべての記述は、pin した版の mermaid.js の挙動を基準にしています。
pin した版は [`@mmd-toolkit/tests`](../../tests) に記録されています。

## pin した mermaid.js

pin した版は mermaid 12.0.0 です。
そのタグはコミット
[`98a0945418c76238f15df2afaddbba4272656c3b`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b)
を指し、この仕様が mermaid.js のソースを参照するときは、
すべてこのコミットへのリンクにします。

gitgraph の定義は [構文](./diagrams/gitgraph.ja.md) と
[木](./ast/gitgraph.ja.md) にあります。
[fixture: gitgraph/header-only]
[fixture: gitgraph/gram-all-fields]

info の定義は [構文](./diagrams/info.ja.md) と [木](./ast/info.ja.md) にありま
す。
[fixture: info/header-lf] [fixture: info/common-all]

packet の定義は [構文](./diagrams/packet.ja.md) と
[木](./ast/packet.ja.md) にあります。
[fixture: packet/gram-mixed]
[fixture: packet/spec-packet-c4580507]

architecture の定義は [構文](./diagrams/architecture.ja.md) と
[木](./ast/architecture.ja.md) にあります。 [fixture: architecture/header-beta]
[fixture: architecture/db-mixed]

radar の定義は [構文](./diagrams/radar.ja.md) と
[木](./ast/radar.ja.md) にあります。
[fixture: radar/header-colon-inline]
[fixture: radar/gram-written-tree]

treemap の定義は [構文](./diagrams/treemap.ja.md) と
[木](./ast/treemap.ja.md) にあります。
[fixture: treemap/gram-written-tree] [fixture: treemap/header-beta]

railroad の定義は 4 方言を扱い、
[構文](./diagrams/railroad.ja.md) と [木](./ast/railroad.ja.md) にあります。
[fixture: railroad/ir-gram-written-tree]
[fixture: railroad/ebnf-gram-written-tree]
[fixture: railroad/abnf-gram-written-tree]
[fixture: railroad/peg-gram-written-tree]

wardley の定義は[構文](./diagrams/wardley.ja.md)と[木](./ast/wardley.ja.md)の文
書にあります。
[fixture: wardley/header-only] [fixture: wardley/db-all-fields]

cynefin の定義は[構文](./diagrams/cynefin.ja.md)と[木](./ast/cynefin.ja.md)にあ
ります。 [fixture: cynefin/header-only] [fixture: cynefin/db-all-fields]

eventmodeling
は[構文](./diagrams/eventmodeling.ja.md)と[木](./ast/eventmodeling.ja.md)の文書
で定義します。 [fixture: eventmodeling/header-only]
[fixture: eventmodeling/gram-written-tree]

treeview の定義は[構文](./diagrams/treeview.ja.md)と
[木](./ast/treeview.ja.md)の文書にあります。
[fixture: treeview/gram-written-tree] [fixture: treeview/box-written-tree]

## 元にしたもの

仕様は、mermaid.js のリポジトリにある次の 3 つを元にしています。

- [`diagrams/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams)
  の下の各図のディレクトリにある文法（例:
  [`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison)）
  とその字句状態。Langium の図では、
  [language/](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language)
  の下の文法とインポート先。例は
  [pie.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/pie/pie.langium)
  と
  [common.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium)。
- 各図の `Db` クラス。
  解析の一部はここで行われます（例:
  [`flowDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts)
  の
  [`destructLink()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L915-L946)）。
- パーサーのテスト（`*.spec.js`）。
  適合性の fixture として [`@mmd-toolkit/tests`](../../tests) に取り込みます。

## 適合

この仕様の実装は、ソーステキストを読み、次の 2 つを行います。

1. この仕様が受理するときに限って、ソースを受理する。
   それは mermaid.js が受理するときです。
   例外は、
   [known-divergences.ja.md](./known-divergences.ja.md) で定める入力です。
   flowchart の辺の数の上限のように、受理が設定に依存する場合、
   その検査は設定を持つ側が行います。
   テキストだけではそれは決まりません。
2. 受理したソースについて、[ast.ja.md](./ast.ja.md) と、
   `ast/` の下のその図種の文書で定める木を作る。
   木はソースを何も失わない。
   どの文字も、単位、コメント、ディレクティブ、フロントマター、
   図の無視するテキストのノード、
   行単位の規則が無視する `;` のどれかに含まれるか
   （[common.ja.md](./common.ja.md) と図の文書で定めます）、
   [表記](./common.ja.md#表記) で定めた空白か、行終端である。

実装が記録するトークン、木の位置、
そして木を mermaid.js の Db が持つ値と照らす確かめ方は、この仕様の範囲の外です。
`[fixture: <区分>/<名前>]` の形で示す fixture は、
受理と木を具体的な入力で示します。
`expected.json` は、mermaid.js が入力を受理するか、検出された id、
正規化した Db を記録しています。

## 用語

- **ソース**: 与えられたままの入力テキスト全体。
- **図種**: flowchart や sequence 図のような、図の種類。
  [detection.ja.md](./detection.ja.md) の検出器が選び、
  `flowchart-v2` や `sequence` のように mermaid.js が報告する id
  で呼びます（[ast.ja.md](./ast.ja.md#root) の DiagramType）。
- **トリビア**: ソースのうち、単位の書かれたテキストに入らない部分
  （[ノード](./ast.ja.md#ノード) を参照）。
  フロントマター、ディレクティブ、コメント、行単位の規則が無視する `;`、
  それらの書かれたテキストの外にある空白と行終端で、
  [common.ja.md](./common.ja.md) と
  [ast.ja.md](./ast.ja.md#ディレクティブとフロントマター) で定めます。
- **単位**と**文脈**: 図の文書は、字句解析器を、図のテキストを単位ごとに読み、
  単位が文脈に入ったり出たりするものとして述べます。
  mermaid.js は多くの図を、
  排他的な状態を切り替える Jison の字句解析器で解析します。
  文脈は、その状態を 1 つずつなぞらずに、状態が行うことを述べ直したものです。
- **Db**: mermaid.js が解析中に値を入れていく、図ごとのオブジェクト。
  構文上の判断の一部（例: 矢印の文字列をどう分解するか）は、
  文法ではなく Db の中で行われます。

## 図ごとの文書の読み方

`diagrams/` の下の文書は、どれも同じ節を持ちます。

1. **検出**（Detection）: 図種がどう認識されるか。
2. **字句構造**（Lexical structure）: 字句解析器が図のテキストを、どの文脈で、
   どう単位に分けるか。
3. **文法**（Grammar）: 図の文と、その組み立て方。
   文法が受理した後で mermaid.js が拒否する入力も述べます。
4. **既知の差異**（Known divergences）:
   [known-divergences.ja.md](./known-divergences.ja.md) で定める差異のうち、
   その図種に当てはまるものと、それがその図種でどう現れるか。
   差異は、この仕様が意図して mermaid.js と異なる入力のまとまりで、
   差異の識別子で名前を付け、該当する fixture がその識別子を持ちます。
   mermaid.js の挙動が意外なだけのところは、他の節で述べ、それに従います。

`ast/` の下の各文書は、
1 つの図種の木のノードを、その欄と子の欄とともに定めます。
どの規則がどのノードを作るかは、図の文書の文法の節が述べます。

## 書き方の約束

- 不可視の文字や見分けにくい文字を、文書に直接書かない。
  対象は、タブ、改行、復帰以外の制御文字、
  U+00A0、U+00AD、U+FEFF、U+200B〜U+200F、U+2028、U+2029、
  その他の Unicode の空白文字。
  `U+XXXX` の形で名前を書く。
  fixture の入力（`input.mmd`）には、意図どおり実際の文字を入れる。
- 仕様にプログラミング言語のコードを書かない。
  正規表現も、TypeScript やその他の言語の型定義も書かない。
  抽象構文木のようなデータ構造は、
  型を言葉で書いた欄の表で定める（[ast.ja.md](./ast.ja.md#欄の書き方) を参照）。
  [common.ja.md](./common.ja.md#表記) の文法表記は仕様の一部なので使ってよい。
  Mermaid のテキストの例や fixture の入力は、そのまま示してよい。
- 記号を導入しない。
  ものに 1 文字の名前や略号を付けず、
  斜体の 1 文字や添字のような数式風の記法も使わない。
  対象は毎回言葉で書く（「検出点」「キーワード」「最初の内容行」）。
  語句が長くなる場合は、
  節の冒頭で意味の分かる語句で名前を付け
  （「**検出点**は、…の最初の位置である」）、
  その名前を使う。
- mermaid.js のソースは、
  pin したコミット
  （[pin した mermaid.js](#pin-した-mermaidjs) を参照）へのリンクで参照する。
  形式は
  `https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/<パス>#L<開始>-L<終了>`
  です。
  リンクの文字列は関数名かファイル名にする（例:
  [`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)）。
  行の範囲は、指す内容にちょうど合わせ、
  書く前にそのコミットのファイルで確かめる。
  ファイル全体やディレクトリへのリンクには行の範囲を付けない。
  1 つの節の中では、関数の最初の言及にリンクを付け、以降は名前だけでもよい。
  mermaid.js のファイル名や関数名を、リンクなしで残さない。
- 特に、正規表現を書かない。
  mermaid.js が規則を正規表現で実装していても、何を受理するかを文で書き、
  必要なら [common.ja.md](./common.ja.md#表記) の文法表記で書く。
  パターンが暗黙に決めている境界の挙動を明示する。
  どの文字を語の文字や空白とみなすか、
  繰り返しができるだけ多く取るか少なく取るか、一致がどこまで届かないか、
  などです。
  mermaid.js のソースファイル名や関数名の参照は書いてよい。

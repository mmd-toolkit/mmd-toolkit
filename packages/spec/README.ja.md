# @mmd-toolkit/spec

英語版: [README.md](./README.md)

Mermaid の図の記法（`.mmd`）を、mermaid.js が読むとおりに定めた仕様です。
図のテキストについて、mermaid.js が受理するかどうか、受理するテキストの構文木、
mermaid.js がそれについて記録する値を定めます。
パーサーを実装する人や、Mermaid のテキストを扱うツールを書く人に向けたものです。

mermaid-js とは関係のない、第三者のプロジェクトです。
このパッケージは npm に公開しません。
仕様は [`docs/`](./docs) の下の文書です。

## mermaid.js の版

この仕様は、
コミット
[`1fb7869`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b)
の mermaid 12.2.0 に従います。
仕様とその版が食い違う場合は mermaid.js が正しく、仕様に誤りがあります。
ただし、
[既知の差異](./docs/known-divergences.ja.md) に挙げた意図的な違いは除きます。

## どこから読むか

1. [`docs/index.ja.md`](./docs/index.ja.md): 範囲、適合する実装がすること、
   用語、ほかの文書の構成
2. [`docs/common.ja.md`](./docs/common.ja.md): フロントマター、ディレクティブ、
   コメント、行終端など、全図種に共通すること
3. [`docs/detection.ja.md`](./docs/detection.ja.md): 図種の選び方。
   mermaid.js のすべての図種について
4. [`docs/ast.ja.md`](./docs/ast.ja.md): 全図種に共通する構文木。
   入力を何も失わない
5. [`docs/known-divergences.ja.md`](./docs/known-divergences.ja.md):
   仕様が意図して mermaid.js と異なる入力
6. 図種ごとの 2 つの文書。
   下の表を参照

## 図種

| 図種          | テキストの読み方                                                           | 木のノード                                                       |
| ------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| flowchart     | [`docs/diagrams/flowchart.ja.md`](./docs/diagrams/flowchart.ja.md)         | [`docs/ast/flowchart.ja.md`](./docs/ast/flowchart.ja.md)         |
| sequence      | [`docs/diagrams/sequence.ja.md`](./docs/diagrams/sequence.ja.md)           | [`docs/ast/sequence.ja.md`](./docs/ast/sequence.ja.md)           |
| class         | [`docs/diagrams/class.ja.md`](./docs/diagrams/class.ja.md)                 | [`docs/ast/class.ja.md`](./docs/ast/class.ja.md)                 |
| state         | [`docs/diagrams/state.ja.md`](./docs/diagrams/state.ja.md)                 | [`docs/ast/state.ja.md`](./docs/ast/state.ja.md)                 |
| er            | [`docs/diagrams/er.ja.md`](./docs/diagrams/er.ja.md)                       | [`docs/ast/er.ja.md`](./docs/ast/er.ja.md)                       |
| journey       | [`docs/diagrams/journey.ja.md`](./docs/diagrams/journey.ja.md)             | [`docs/ast/journey.ja.md`](./docs/ast/journey.ja.md)             |
| gantt         | [`docs/diagrams/gantt.ja.md`](./docs/diagrams/gantt.ja.md)                 | [`docs/ast/gantt.ja.md`](./docs/ast/gantt.ja.md)                 |
| pie           | [`docs/diagrams/pie.ja.md`](./docs/diagrams/pie.ja.md)                     | [`docs/ast/pie.ja.md`](./docs/ast/pie.ja.md)                     |
| quadrant      | [`docs/diagrams/quadrant.ja.md`](./docs/diagrams/quadrant.ja.md)           | [`docs/ast/quadrant.ja.md`](./docs/ast/quadrant.ja.md)           |
| requirement   | [`docs/diagrams/requirement.ja.md`](./docs/diagrams/requirement.ja.md)     | [`docs/ast/requirement.ja.md`](./docs/ast/requirement.ja.md)     |
| usecase       | [`docs/diagrams/usecase.ja.md`](./docs/diagrams/usecase.ja.md)             | [`docs/ast/usecase.ja.md`](./docs/ast/usecase.ja.md)             |
| gitgraph      | [`docs/diagrams/gitgraph.ja.md`](./docs/diagrams/gitgraph.ja.md)           | [`docs/ast/gitgraph.ja.md`](./docs/ast/gitgraph.ja.md)           |
| c4            | [`docs/diagrams/c4.ja.md`](./docs/diagrams/c4.ja.md)                       | [`docs/ast/c4.ja.md`](./docs/ast/c4.ja.md)                       |
| mindmap       | [`docs/diagrams/mindmap.ja.md`](./docs/diagrams/mindmap.ja.md)             | [`docs/ast/mindmap.ja.md`](./docs/ast/mindmap.ja.md)             |
| timeline      | [`docs/diagrams/timeline.ja.md`](./docs/diagrams/timeline.ja.md)           | [`docs/ast/timeline.ja.md`](./docs/ast/timeline.ja.md)           |
| sankey        | [`docs/diagrams/sankey.ja.md`](./docs/diagrams/sankey.ja.md)               | [`docs/ast/sankey.ja.md`](./docs/ast/sankey.ja.md)               |
| xychart       | [`docs/diagrams/xychart.ja.md`](./docs/diagrams/xychart.ja.md)             | [`docs/ast/xychart.ja.md`](./docs/ast/xychart.ja.md)             |
| block         | [`docs/diagrams/block.ja.md`](./docs/diagrams/block.ja.md)                 | [`docs/ast/block.ja.md`](./docs/ast/block.ja.md)                 |
| packet        | [`docs/diagrams/packet.ja.md`](./docs/diagrams/packet.ja.md)               | [`docs/ast/packet.ja.md`](./docs/ast/packet.ja.md)               |
| kanban        | [`docs/diagrams/kanban.ja.md`](./docs/diagrams/kanban.ja.md)               | [`docs/ast/kanban.ja.md`](./docs/ast/kanban.ja.md)               |
| architecture  | [`docs/diagrams/architecture.ja.md`](./docs/diagrams/architecture.ja.md)   | [`docs/ast/architecture.ja.md`](./docs/ast/architecture.ja.md)   |
| radar         | [`docs/diagrams/radar.ja.md`](./docs/diagrams/radar.ja.md)                 | [`docs/ast/radar.ja.md`](./docs/ast/radar.ja.md)                 |
| eventmodeling | [`docs/diagrams/eventmodeling.ja.md`](./docs/diagrams/eventmodeling.ja.md) | [`docs/ast/eventmodeling.ja.md`](./docs/ast/eventmodeling.ja.md) |
| treemap       | [`docs/diagrams/treemap.ja.md`](./docs/diagrams/treemap.ja.md)             | [`docs/ast/treemap.ja.md`](./docs/ast/treemap.ja.md)             |
| venn          | [`docs/diagrams/venn.ja.md`](./docs/diagrams/venn.ja.md)                   | [`docs/ast/venn.ja.md`](./docs/ast/venn.ja.md)                   |
| ishikawa      | [`docs/diagrams/ishikawa.ja.md`](./docs/diagrams/ishikawa.ja.md)           | [`docs/ast/ishikawa.ja.md`](./docs/ast/ishikawa.ja.md)           |
| wardley       | [`docs/diagrams/wardley.ja.md`](./docs/diagrams/wardley.ja.md)             | [`docs/ast/wardley.ja.md`](./docs/ast/wardley.ja.md)             |
| cynefin       | [`docs/diagrams/cynefin.ja.md`](./docs/diagrams/cynefin.ja.md)             | [`docs/ast/cynefin.ja.md`](./docs/ast/cynefin.ja.md)             |
| treeview      | [`docs/diagrams/treeview.ja.md`](./docs/diagrams/treeview.ja.md)           | [`docs/ast/treeview.ja.md`](./docs/ast/treeview.ja.md)           |
| agentflow     | [`docs/diagrams/agentflow.ja.md`](./docs/diagrams/agentflow.ja.md)         | [`docs/ast/agentflow.ja.md`](./docs/ast/agentflow.ja.md)         |
| info          | [`docs/diagrams/info.ja.md`](./docs/diagrams/info.ja.md)                   | [`docs/ast/info.ja.md`](./docs/ast/info.ja.md)                   |
| railroad      | [`docs/diagrams/railroad.ja.md`](./docs/diagrams/railroad.ja.md)           | [`docs/ast/railroad.ja.md`](./docs/ast/railroad.ja.md)           |

## 例

仕様の各記述は、例を `[fixture: <区分>/<名前>]` の形で挙げます。
例は [`packages/tests/fixtures`](../tests/fixtures) にあり、それぞれ入力と、
mermaid.js がそれをどう扱うかを持ちます。

仕様を mermaid.js からどう導いたかは、
[`docs/index.ja.md`](./docs/index.ja.md#元にしたもの) にあります。

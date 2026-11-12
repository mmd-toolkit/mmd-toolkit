# 規則ごとに `recommended` に入れるか（記録）

[SKILL.ja.md](../SKILL.ja.md) の 7 節の基準による規則ごとの判定と、
基準ごとに調べたことである。
ここで番号で指す基準は、SKILL.ja.md の 7 節の基準である。
検索の仕方は、SKILL.ja.md の 7 節にある。

判定は下の表に記録し、入れない規則には理由を書く。
規則のファイルは、この表から `recommended` を設定する。
表の後の注に、基準ごとに調べたことを書く。
共通の規則は入れる。
どれも、すべての図種で基準を満たし（すべての図種で実行）、
その文書はすべての図種を書いている。

判定:

| 規則                                        | 入れるか | 入れない理由                                                             |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| flowchart-no-ignored-text                   | 入れる   |                                                                          |
| flowchart-no-unclosed-description-block     | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| flowchart-no-empty-description-block        | 入れる   |                                                                          |
| flowchart-no-duplicate-description          | 入れる   |                                                                          |
| flowchart-no-duplicate-title                | 入れる   |                                                                          |
| flowchart-no-redefined-vertex               | 入れる   |                                                                          |
| flowchart-no-undef                          | 入れる   |                                                                          |
| flowchart-no-duplicate-direction            | 入れる   |                                                                          |
| flowchart-no-redefined-subgraph             | 入れる   |                                                                          |
| flowchart-no-spaced-stroke                  | 入れない | 基準 1、3: [#7974](https://github.com/mermaid-js/mermaid/pull/7974)      |
| no-unclosed-directive                       | 入れる   |                                                                          |
| no-invalid-init-directive                   | 入れる   |                                                                          |
| no-duplicate-init-key                       | 入れる   |                                                                          |
| sequence-no-create-destroy                  | 入れる   |                                                                          |
| sequence-no-duplicate-description           | 入れる   |                                                                          |
| sequence-no-duplicate-title                 | 入れる   |                                                                          |
| sequence-no-empty-description-block         | 入れる   |                                                                          |
| sequence-no-ignored-text                    | 入れる   |                                                                          |
| sequence-no-invalid-json                    | 入れる   |                                                                          |
| sequence-no-link-without-separator          | 入れる   |                                                                          |
| sequence-no-unclosed-description-block      | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| class-no-bare-class-name                    | 入れる   |                                                                          |
| class-no-duplicate-description              | 入れる   |                                                                          |
| class-no-duplicate-title                    | 入れる   |                                                                          |
| class-no-ignored-text                       | 入れる   |                                                                          |
| class-no-inline-comment                     | 入れない | 基準 1 と 3                                                              |
| class-no-redefined-class                    | 入れる   |                                                                          |
| class-no-unclosed-backquote                 | 入れる   |                                                                          |
| class-no-undef                              | 入れる   |                                                                          |
| state-no-duplicate-description              | 入れる   |                                                                          |
| state-no-duplicate-title                    | 入れる   |                                                                          |
| state-no-empty-description-block            | 入れる   |                                                                          |
| state-no-ignored-text                       | 入れる   |                                                                          |
| state-no-unclosed-description-block         | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| state-no-undef                              | 入れる   |                                                                          |
| er-no-duplicate-description                 | 入れる   |                                                                          |
| er-no-duplicate-title                       | 入れる   |                                                                          |
| er-no-empty-description-block               | 入れる   |                                                                          |
| er-no-ignored-text                          | 入れない | 基準 3: [#8364](https://github.com/mermaid-js/mermaid/pull/8364)（open） |
| er-no-redefined-entity                      | 入れる   |                                                                          |
| er-no-unclosed-description-block            | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| er-no-undef                                 | 入れる   |                                                                          |
| gantt-no-duplicate-description              | 入れる   |                                                                          |
| gantt-no-duplicate-id                       | 入れる   |                                                                          |
| gantt-no-duplicate-setting                  | 入れる   |                                                                          |
| gantt-no-duplicate-title                    | 入れる   |                                                                          |
| gantt-no-empty-description-block            | 入れる   |                                                                          |
| gantt-no-undef                              | 入れる   |                                                                          |
| gantt-no-unknown-exclude                    | 入れる   |                                                                          |
| gantt-no-invalid-tag                        | 入れる   |                                                                          |
| journey-no-duplicate-description            | 入れる   |                                                                          |
| journey-no-duplicate-title                  | 入れる   |                                                                          |
| journey-no-empty-description-block          | 入れる   |                                                                          |
| journey-no-empty-person                     | 入れる   |                                                                          |
| journey-no-ignored-text                     | 入れる   |                                                                          |
| journey-no-invalid-score                    | 入れる   |                                                                          |
| requirement-no-duplicate-description        | 入れる   |                                                                          |
| requirement-no-duplicate-field              | 入れる   |                                                                          |
| requirement-no-duplicate-name               | 入れる   |                                                                          |
| requirement-no-duplicate-title              | 入れる   |                                                                          |
| requirement-no-empty-description-block      | 入れる   |                                                                          |
| requirement-no-ignored-text                 | 入れる   |                                                                          |
| requirement-no-unclosed-description-block   | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| requirement-no-undef                        | 入れる   |                                                                          |
| mindmap-no-duplicate-decoration             | 入れる   |                                                                          |
| mindmap-no-mismatched-shape                 | 入れる   |                                                                          |
| timeline-no-duplicate-title                 | 入れる   |                                                                          |
| timeline-no-duplicate-description           | 入れる   |                                                                          |
| timeline-no-empty-description-block         | 入れる   |                                                                          |
| sankey-no-invalid-value                     | 入れる   |                                                                          |
| sankey-no-empty-node                        | 入れる   |                                                                          |
| xychart-no-duplicate-title                  | 入れる   |                                                                          |
| xychart-no-duplicate-description            | 入れる   |                                                                          |
| xychart-no-empty-description-block          | 入れる   |                                                                          |
| xychart-no-unclosed-description-block       | 入れる   |                                                                          |
| xychart-no-invalid-orientation              | 入れる   |                                                                          |
| xychart-no-redefined-axis                   | 入れる   |                                                                          |
| xychart-no-extra-value                      | 入れる   |                                                                          |
| quadrant-no-duplicate-title                 | 入れる   |                                                                          |
| quadrant-no-duplicate-description           | 入れる   |                                                                          |
| quadrant-no-empty-description-block         | 入れる   |                                                                          |
| quadrant-no-redefined-axis                  | 入れる   |                                                                          |
| quadrant-no-redefined-quadrant              | 入れる   |                                                                          |
| quadrant-no-redefined-class                 | 入れる   |                                                                          |
| quadrant-no-undef                           | 入れる   |                                                                          |
| quadrant-no-duplicate-style                 | 入れる   |                                                                          |
| quadrant-no-invalid-coordinate              | 入れる   |                                                                          |
| quadrant-no-invalid-color                   | 入れる   |                                                                          |
| block-no-edge-chain                         | 入れる   |                                                                          |
| block-no-edge-in-composite-head             | 入れる   |                                                                          |
| block-no-duplicate-block                    | 入れる   |                                                                          |
| block-no-spaced-class-id                    | 入れる   |                                                                          |
| block-no-undef                              | 入れる   |                                                                          |
| block-no-duplicate-columns                  | 入れる   |                                                                          |
| block-no-redefined-style                    | 入れる   |                                                                          |
| block-no-mismatched-shape                   | 入れる   |                                                                          |
| block-no-mismatched-edge                    | 入れる   |                                                                          |
| block-no-useless-width                      | 入れる   |                                                                          |
| block-no-invalid-direction                  | 入れる   |                                                                          |
| kanban-no-invalid-metadata-key              | 保留     |                                                                          |
| kanban-no-invalid-priority                  | 保留     |                                                                          |
| kanban-no-duplicate-section                 | 入れる   |                                                                          |
| c4-no-undef                                 | 入れる   |                                                                          |
| c4-no-invalid-attribute-key                 | 入れる   |                                                                          |
| c4-no-useless-argument                      | 入れる   |                                                                          |
| c4-no-duplicate-title                       | 入れる   |                                                                          |
| c4-no-duplicate-description                 | 入れる   |                                                                          |
| c4-no-redefined-element                     | 入れる   |                                                                          |
| c4-no-duplicate-style                       | 入れる   |                                                                          |
| venn-no-duplicate-title                     | 入れる   |                                                                          |
| venn-no-duplicate-subset                    | 入れる   |                                                                          |
| venn-no-duplicate-style                     | 入れる   |                                                                          |
| venn-no-invalid-style-key                   | 入れる   |                                                                          |
| venn-no-undef                               | 入れる   |                                                                          |
| venn-no-ignored-text                        | 入れる   |                                                                          |
| agentflow-no-duplicate-title                | 入れる   |                                                                          |
| agentflow-no-duplicate-description          | 入れる   |                                                                          |
| agentflow-no-empty-description-block        | 入れる   |                                                                          |
| agentflow-no-unclosed-description-block     | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| agentflow-no-ignored-text                   | 入れる   |                                                                          |
| agentflow-no-redefined-vertex               | 入れる   |                                                                          |
| agentflow-no-redefined-connector            | 入れる   |                                                                          |
| agentflow-no-redefined-flow                 | 入れる   |                                                                          |
| agentflow-no-duplicate-direction            | 入れる   |                                                                          |
| agentflow-no-undef                          | 入れる   |                                                                          |
| agentflow-no-spaced-stroke                  | 入れない | 基準 1、3: [#7974](https://github.com/mermaid-js/mermaid/pull/7974)      |
| usecase-no-duplicate-title                  | 入れる   |                                                                          |
| usecase-no-duplicate-description            | 入れる   |                                                                          |
| usecase-no-empty-description-block          | 入れる   |                                                                          |
| usecase-no-unclosed-description-block       | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| usecase-no-duplicate-direction              | 入れる   |                                                                          |
| usecase-no-duplicate-metadata               | 入れる   |                                                                          |
| usecase-no-redefined-class                  | 入れる   |                                                                          |
| pie-no-duplicate-label                      | 入れる   |                                                                          |
| pie-no-duplicate-title                      | 入れる   |                                                                          |
| pie-no-duplicate-description                | 入れる   |                                                                          |
| pie-no-empty-description-block              | 入れる   |                                                                          |
| gitgraph-no-duplicate-option                | 入れる   |                                                                          |
| gitgraph-no-redefined-commit                | 入れる   |                                                                          |
| gitgraph-no-duplicate-title                 | 入れる   |                                                                          |
| gitgraph-no-duplicate-description           | 入れる   |                                                                          |
| gitgraph-no-empty-description-block         | 入れる   |                                                                          |
| packet-no-duplicate-title                   | 入れる   |                                                                          |
| packet-no-duplicate-description             | 入れる   |                                                                          |
| packet-no-empty-description-block           | 入れる   |                                                                          |
| architecture-no-duplicate-title             | 入れる   |                                                                          |
| architecture-no-duplicate-description       | 入れる   |                                                                          |
| architecture-no-empty-description-block     | 入れる   |                                                                          |
| architecture-no-reversed-marker             | 入れる   |                                                                          |
| architecture-no-ungrouped-modifier          | 入れる   |                                                                          |
| radar-no-undef                              | 入れる   |                                                                          |
| radar-no-duplicate-entry                    | 入れる   |                                                                          |
| radar-no-mismatched-entry-count             | 入れる   |                                                                          |
| radar-no-duplicate-option                   | 入れる   |                                                                          |
| radar-no-reversed-range                     | 入れる   |                                                                          |
| radar-no-duplicate-title                    | 入れる   |                                                                          |
| radar-no-duplicate-description              | 入れる   |                                                                          |
| radar-no-empty-description-block            | 入れる   |                                                                          |
| radar-no-unclosed-description-block         | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| treemap-no-invalid-value                    | 入れる   |                                                                          |
| treemap-no-duplicate-title                  | 入れる   |                                                                          |
| treemap-no-duplicate-description            | 入れる   |                                                                          |
| treemap-no-empty-description-block          | 入れる   |                                                                          |
| railroad-no-duplicate-title                 | 入れる   |                                                                          |
| railroad-no-duplicate-description           | 入れる   |                                                                          |
| railroad-no-empty-description-block         | 入れる   |                                                                          |
| cynefin-no-redefined-domain                 | 入れる   |                                                                          |
| cynefin-no-duplicate-title                  | 入れる   |                                                                          |
| cynefin-no-duplicate-description            | 入れる   |                                                                          |
| cynefin-no-empty-description-block          | 入れる   |                                                                          |
| wardley-no-duplicate-title                  | 入れる   |                                                                          |
| wardley-no-duplicate-description            | 入れる   |                                                                          |
| wardley-no-empty-description-block          | 入れる   |                                                                          |
| wardley-no-undef                            | 入れる   |                                                                          |
| wardley-no-redefined-node                   | 入れる   |                                                                          |
| wardley-no-duplicate-evolve                 | 入れる   |                                                                          |
| wardley-no-duplicate-pipeline               | 入れる   |                                                                          |
| wardley-no-duplicate-size                   | 入れる   |                                                                          |
| wardley-no-duplicate-evolution              | 入れる   |                                                                          |
| wardley-no-duplicate-annotations            | 入れる   |                                                                          |
| wardley-no-ignored-link-label               | 入れる   |                                                                          |
| eventmodeling-no-undef                      | 入れる   |                                                                          |
| eventmodeling-no-redefined-data             | 入れる   |                                                                          |
| eventmodeling-no-duplicate-title            | 入れる   |                                                                          |
| eventmodeling-no-duplicate-description      | 入れる   |                                                                          |
| eventmodeling-no-empty-description-block    | 入れる   |                                                                          |
| eventmodeling-no-unclosed-description-block | 入れない | 基準 1: `{` の後に、自分の `}` で終わる説明                              |
| treeview-no-duplicate-annotation            | 入れる   |                                                                          |
| treeview-no-duplicate-title                 | 入れる   |                                                                          |
| treeview-no-duplicate-description           | 入れる   |                                                                          |
| treeview-no-empty-description-block         | 入れる   |                                                                          |
| treeview-no-unclosed-description-block      | 入れる   |                                                                          |

注は、規則ごとに、または場合を共有する規則の組ごとに、
基準 1 から 4 について調べたことを、その順に書く。
基準 1 の読み方は、文書が書いているものである。
「実行」は、この判定のために mermaid.js で実行した読み方を示す。
検索は mermaid-js/mermaid の issue と PR に対して行う。
検索語は引用符で示し、検索が見つけたものは、この文書が変えると言うもののほか、
読み方を変えない。

タイトルと説明の規則、つまり flowchart、sequence、class、state、er、gantt、
journey、
requirement の `<diagram>-no-duplicate-title` と
`<diagram>-no-duplicate-description`:

1. 報告するどの文も、前に設定した値を置き換える。
   行の形とブロックの形。
   テキストのない `accTitle:` や `accDescr:` は、
   テキストのある次の行を取る（class と er では、テキストの終わりで拒否する）。
   サブグラフの中（flowchart、er）やブロックの中（sequence）の文は、
   図全体の値を設定する。
   journey では、タスクのつもりで、
   どの大文字小文字でも `title` で始まる行（`Title page: 5: Me`）。
   `title` と `accTitle` は別に数える（sequence、gantt、journey）。
   state では、合成状態の中の文は状態であり、数えない。
   図がすでに持つ値を、mermaid.js が持つとおりに比べて設定する文は、何も失わず、
   報告しない。
2. なし。
   2 つ目の値をわざと書けば、最初の値は役目を失う。
   サブグラフのためのつもりで、サブグラフの中に書いた文は、
   報告する誤りそのものである。
3. 「accTitle multiple」「title twice」「accDescr
   multiple」「accTitle」「accDescr」。
   見つかったものは、
   ほかの図種にこれらの文を足す
   [#8437](https://github.com/mermaid-js/mermaid/pull/8437) と
   [#8140](https://github.com/mermaid-js/mermaid/pull/8140) か、
   C4 についての [#8040](https://github.com/mermaid-js/mermaid/issues/8040)
   である。
4. 文を 1 つ残す。
   flowchart の規則は、どちらかを除く提案を出す。

空のブロックの規則、つまり flowchart、sequence、state、er、gantt、journey、
requirement の `<diagram>-no-empty-description-block`:

1. ブロックは効かない。
   説明の後では、ブロックはその説明を残し、前に説明がなければ、
   説明は空のままである。
   コメント行だけのブロックは報告しない。
2. なし。
   後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
   中にコメントを書き、規則はそれを報告しない。
   文書もそう書いている。
3. 「accDescr empty」「empty accDescr」「accDescr empty block」「accDescr」。
4. 説明を書くか、ブロックを除く。

閉じていないブロックの規則、つまり flowchart、sequence、state、er、
requirement の `<diagram>-no-unclosed-description-block`:

1. 形、データブロック、本体、JSON の `}` が閉じるブロックは、
   そこまでの行を取り、`}` のないブロック（flowchart、sequence、state）は、
   説明を空にする。
   `{` を持ち、後の行の自分の `}` で終わる説明も報告し、
   mermaid.js はそれを書いたとおりに読む。
   その説明は、flowchart と sequence では `accDescr {` の後の `a {b }`、state、
   er、requirement では `accDescr {`、`uses { here`、`}` である。
   文書もそう書いている。
   入れない。
2. 同じ説明。
3. 「accDescr unclosed」「accDescr brace」。
4. ブロックを閉じる。
   flowchart は、どこで閉じるかを提案する。

方向の行の規則、つまり flowchart-no-ignored-text、class-no-ignored-text、
state-no-ignored-text、er-no-ignored-text、requirement-no-ignored-text:

1. 方向の行の上の文、方向の値に続けて書いたテキスト、
   state と er では文書が挙げるほかのテキストを、捨てる。
   state では、`note left of A:hi` のように、
   ノートの `:` の後で mermaid.js が捨てる文字を報告する。
   mermaid.js の文書は `:` の後に空白を置いてノートを書き、
   `note left of A : hi` のようにそう書けば、
   何も捨てられない（実行）（「state note colon character」「note first
   character missing」「state note text」、題名の「note state」。
   それについてのものはない）。
2. なし。
   `direction TB // vertical` のように、
   書き手がほかの言語の書き方のコメントのつもりで書いた、方向の後のテキストは、
   mermaid.js のコメントでなく、捨てられる（実行。5 つの図種のそれぞれ）。
   報告はそれを、書き手のつもりの推定なしに言う。
3. 「direction subgraph same line」「direction statement ignored」「subgraph
   direction」「classDiagram direction」「stateDiagram direction」「erDiagram
   direction」「requirement direction」「direction label」「direction keyword
   node」。
   見つかったものは、
   [#8066](https://github.com/mermaid-js/mermaid/issues/8066) のように、
   方向をどう配置するかについてのものである。
   er では、[#8364](https://github.com/mermaid-js/mermaid/pull/8364) （open、
   "fix(er): parse keywords and numbers as unquoted relationship
   labels"）が関係の `:` の後のテキストを役割として読むので、
   今は関係を作らない `A ||--o{ B : direction TB`（実行）は、
   方向の行でなくなる（基準 3）。
   er-no-ignored-text は、その PR が閉じたときに決め直す。
4. 文をそれだけの行に書く。
   flowchart は、行を分ける提案を出す。

sequence-no-ignored-text: (1) その文字を捨てる。
(2) なし。
(3) 「sequence message newline parenthesis」。
(4) メッセージの終わりをその行に書く。

journey-no-ignored-text: (1) 3 つ目のコロンの後の人を捨てる。
(2) なし。
人はコンマで区切る。
(3) 「journey colon」「journey」。
(4) 人をコンマで区切る。

flowchart-no-undef: (1) `style` は書き手が書かなかった頂点を作り、
`class` と `click` は何もしない。
(2) なし。
(3) 「style undefined node」「class nonexistent node」「style node」。
[#7040](https://github.com/mermaid-js/mermaid/issues/7040) （closed、
approved）はエラーを求め、
[#7441](https://github.com/mermaid-js/mermaid/pull/7441) （merged、
固定版に入っている）は、警告を出し、頂点はなお作る。
(4) id を直す。
id なしで書いたリンクに mermaid.js が与える `L_A_B_0` のような id は、
図の id である（実行: `class L_A_B_0 hot` はリンクにクラスを与える）。
それは名指すものに届くので、使っても報告しない。
リンクが変わるとそのような id も変わることは、出力の事実ではない。

class-no-undef: (1) 文は何も変えないか、注釈が線を持たない。
(2) なし。
(3) 「cssClass not applied」「classDiagram style nonexistent」「cssClass」「note
for class」。
[#2234](https://github.com/mermaid-js/mermaid/issues/2234) （open、
"Status: Awaiting PR"）は、エラーか、`link` がクラスを宣言することを求め、
どちらでも、書き間違えた名前は誤りのままである。
(4) 名前を直す。

state-no-undef: (1) `style`、`class`、`click` は何も変えず、
ほかのどの文も書かない状態の注釈は、その状態を加える。
(2) なし。
注釈だけで書いた状態の注釈は、どの文も書かない状態を加え、報告はそれを言う。
(3) 「state note nonexistent」。
(4) 名前を直すか、状態を書く。

er-no-undef: (1) 文は何も変えず、別名は名前でない。
(2) なし。
(3) 「erDiagram style class」。
(4) 実体の名前を使う。

gantt-no-undef: (1) どのタスクもリンクにならず、開始や終わりは今日の日付になる。
(2) なし。
(3) 「gantt after nonexistent」「gantt after today」「after gantt」。
[#8254](https://github.com/mermaid-js/mermaid/pull/8254)（merged）は、
警告を出し、今日の日付を保つ。
[#6376](https://github.com/mermaid-js/mermaid/pull/6376)（open）は、
`after` と `until` に遅れを足す。
[#8359](https://github.com/mermaid-js/mermaid/pull/8359)（open）は、
ページの前のチャートの id が見つかるのを止める。
[#4424](https://github.com/mermaid-js/mermaid/issues/4424)（open）は、
後に書いた id についてのもので、規則はそれを報告しない。
(4) id を直す。

requirement-no-undef: (1) 文は何も変えず、関係はその端に箱を持たない。
(2) なし。
(3) 「requirement relationship missing」「requirement」。
(4) 名前を直す。

flowchart-no-redefined-vertex: (1) 後の形やラベルは、前のものを置き換える。
改行だけが違うラベルは報告せず、ラベルはそのほかは書いたとおりに比べるので、
mermaid.js が同じに保つ、HTML の属性の引用符だけが違う 2 つのラベルは、
規則は書いた値を比べるので、文書が言うとおり報告する。
subgraph は、先に終わった subgraph が持つメンバーを除く。
そのため、後の subgraph の文で、リンク、クラス、データブロックがなく、
前に書いた頂点について新しいことを言わないもの、つまり id だけか、名前、
プロパティ、ラベルが同じで、2 つのラベルがどちらもマークダウンか、
どちらもそうでない形だけのものは報告する。
後の subgraph は頂点を持たない（実行。
`subgraph a` の中の `A` の後の `subgraph b` の中の `A` は、`A` を a に残す）。
引用符付きのラベルと引用符のないラベルは、ここでは 1 つとして数える。
`A[x]` の後の `A["x"]` が変えるのは Db の `labelType` を `text` から `string`
にすることだけで、これは、
整形ツールの文書（`packages/prettier-plugin-mmd/docs/printed-form.ja.md`）が、
Db を変えても同じに描かれる整形の種類として挙げている違いである。
整形ツールはラベルを 2 つの形のどちらかにそろえるので、別に数えると、
整形しただけで報告が変わる。
`A["x"]` は `A[x]` と同じく報告し、``A["`**x**`"]`` は、
マークダウンのラベルが違う描かれ方をするので報告しない（実行）。
プロパティは別で、整形ツールはそれを変えないので、
`A[x]` の後の `A[|borders:lt|x]` は新しいことを言うままである。
ただし、前の subgraph が後の subgraph の中に入れ子であるときと、
同じ id であるときは、何も失われないので報告しない。
そうした文の頂点は、1 つずつ数える。
a が `A` だけを持つときの b の中の `A & B` は `A` を報告する。
`A` は新しいことを言わず、`B` は b に入るからである。
`A & B --> C` はどちらも報告しない（実行）。
前のどの subgraph も持たないときの b の中の `A` は b に入り、
`A --> B` は辺を描く。
`A[y]`、`A:::c`、`A[x]` の後の ``A["`**x**`"]``、
`A[|borders:lt|x]` は Db を変える。
前の subgraph の名前にすぎない素の `c` は、新しい頂点を書く。
どれもこの報告をしない（実行）。
これは、block-no-duplicate-block と同じく、同じ文に書いた、
もう一度書いた id というこの規則の誤りである。
(2) なし。
文書の例はこれを書いていない（`flowchart.md` と `swimlanes.md` で実行）。
(3) 「node label overwritten」「redefine node label」「node label」「subgraph
node two subgraphs」「node multiple subgraphs」「subgraph duplicate node」「node
belongs subgraph」「subgraph members same node」。
[#3789](https://github.com/mermaid-js/mermaid/issues/3789) （open、
Type: Enhancement）は、ラベルのための別の文を提案している。
[#2567](https://github.com/mermaid-js/mermaid/issues/2567)（open、
Type: Enhancement）は subgraph の間でノードを共有することを求めており、
PR はない。
[#8503](https://github.com/mermaid-js/mermaid/pull/8503)（open）は、
自分を囲む subgraph を挙げる subgraph だけを変える。
(4) 別の id を使うか、ラベルを 1 度だけ書き、頂点を 1 つの subgraph に書く。

flowchart-no-duplicate-direction: (1) subgraph の本体の後の `direction` 文は、
subgraph の方向を置き換える（`flowchart`、`flowchart-elk`、
`swimlane-beta` で実行）。
同じ id の 2 つの subgraph は、
最初のものの方向で 1 つとして描かれる（`getData` を読んだ）。
`getData` は、subgraph を最後のものから最初のものの順にレイアウトに与え、
レイアウトは id ごとに 1 つの節点を保つ。
そのため、後のものの違う方向は失われ、報告する。
Db は、同じ id の宣言を最初のものに合わせ、最初のものがその題、方向、
位置を保つ（`addSubGraph` を読んだ。実行）。
文書が言うとおり、`TD` と `TB` は 1 つの方向である。
(2) なし。
(3) 上の方向の規則の検索。
(4) subgraph ごとに `direction` 文を 1 つ書く。

flowchart-no-redefined-subgraph: (1) 同じ subgraph の id の宣言は、
最初のものに合わさる。
最初のものがその題、方向、位置を保つので、
後の宣言に書いた題は失われる（`addSubGraph` を読んだ。実行）。
`subgraph S [One]` と `subgraph S [Two]` は、
両方のメンバーを持つ題 `One` の subgraph `S` 1 つになり、
`subgraph S` と `subgraph S [Two]` は題 `S` の 1 つになる。
(2) なし。
題のない後の宣言と、subgraph が持つ題と同じ題の後の宣言は、メンバーを足し、
何も失わない。
subgraph が持つ題は、最初の宣言に書いた題、その宣言が題を書かないときは、
それが書く名前である。
mermaid.js はその名前を題として示し、mermaid.js が生成する id ではない（実行。
`subgraph S` は題 `S` を持ち、
id が `subGraph0` になる `subgraph a b` は題 `a b` を持つ）。
題は、flowchart-no-redefined-vertex のラベルと同じく、書いたとおりに比べる。
fixture: `subgraph a b` の後の `subgraph subGraph0 [a b]`（報告しない。
題は `a b` のまま）と、
`subgraph a b` の後の `subgraph subGraph0 [subGraph0]`（報告する。
`subGraph0` が失われる。実行）。
(3) 「duplicate subgraph」「subgraph same id」「subgraph redeclare」「subgraph
title overwritten」。
[#8326](https://github.com/mermaid-js/mermaid/issues/8326)（closed）と
[#8337](https://github.com/mermaid-js/mermaid/pull/8337)（merged、
固定版に入っている）は、dagre と 11.x と同じく、
どのレイアウトでも宣言を合わせる。
そのため、メンバーを足すために subgraph をもう一度書くのは、1 つの書き方である。
(4) 題を最初の宣言に書くか、別の id を使う。

flowchart-no-spaced-stroke と agentflow-no-spaced-stroke: (1)
リンクに届くスタイルは、そのクラスのもの、`linkStyle default` のもの、
そのリンク自身の `linkStyle` のものの順である。
線は、CSS のとおり、`stroke` という名前の最後の宣言を取る。
一方、mermaid.js は矢じりの色を、
それらの中の最初の `stroke:` という文字から取り、
`text-stroke:` のような長い名前の中のものも数える。
その文字の後が空白だけなら、矢じりに色を付けない（読んだのは、
[`edges.js`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L956-L957)
と
[`edgeMarker.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edgeMarker.ts#L105-L127)。
実行）。
そのため、`:` の前に空白を置いて書いた小文字の `stroke` で、
リンクの線に色を与え、
そのリンクのスタイルでそれより前に `stroke:` という文字がないものは、
矢じりにその色を付けさせない（実行。
`linkStyle 0 stroke :#f00` は赤い線とテーマの色の矢じりを描く）。
[SKILL.ja.md](../SKILL.ja.md) の 2 節の例外により、
規則は `linkStyle` と `classDef` のそうした `stroke` を、
いま何も失われないところでもすべて報告する。
後の `stroke` が線に色を与える場合も報告する。
`linkStyle default stroke :#f00` の後に `linkStyle 0 stroke:#00f` があると、
両方が青になる（実行）。
`stroke:#00f,stroke :#f00` のように、
前の `stroke:` という文字が矢じりに色を与える場合も報告する。
CSS が読む、頂点だけが取る `classDef` と、
リンクのない図の `linkStyle default` も報告する（実行）。
`style` は報告しない。
`style` は頂点か subgraph にスタイルを付け、
リンクには付けない（`addVertex` を読んだ。実行。
`A e1@--> B` の後の `style e1 stroke:#f00` はリンクを変えない）。
そのため mermaid.js はその `stroke:` という文字を読まない。
CSS はそこの `stroke :#f00` を `stroke:#f00` と同じに読む（実行）。
そこのほかの名前の `:` の前の空白は、どの規則も報告しない。
`stroke` で終わる別の名前（`text-stroke :#f00` はどの線にも色を付けず、
空白なしなら矢じりだけに色を付ける。実行）と、
名前の大文字小文字の違い（`Stroke :#f00`。空白を消しても助けにならない。
読んだ）は報告しない。
usecase の図の関係のスタイルは、読んだだけなので含めない。
(2) なし。
mermaid.js の文書は `linkStyle 3 stroke:#ff3,stroke-width:4px,color:red;` と、
`note left of A:hi` と同じく、そこに空白を置かずに書く。
(3) 「linkStyle stroke arrowhead color」「arrowhead color linkStyle」「marker
color stroke linkStyle」「edge marker stroke color」。
[#7974](https://github.com/mermaid-js/mermaid/pull/7974)（open）は印に
`context-stroke` を与え、対応するブラウザでは矢じりが線の stroke を取る。
同じことを、
[#1236](https://github.com/mermaid-js/mermaid/issues/1236)（open）も求めている。
規則は、mermaid.js がつもりどおりに読むものも報告し（基準 1）、
その変更が開いている（基準 3）ので、入れない。
(4) 空白を取り除く。

class-no-redefined-class: (1) 前のラベルは失われる。
(2) なし。
(3) 「class label redefine」。
(4) 別の名前を使うか、ラベルを 1 度だけ書く。

er-no-redefined-entity: (1) 後の別名は無視される。
(2) なし。
(3) 「entity alias」「alias erDiagram」。
(4) 別の名前を使うか、別名を 1 度だけ書く。

no-unclosed-directive: (1) 指令が取る行の文、
または `%%{wrap` の後の語が失われる（すべての図種で実行）。
(2) なし。
名前と引数の JSON のオブジェクトや配列は複数の行にわたってよく、
テキストの終わりにある指令や U+2028 か U+2029 で終わる指令は何も取らず、
閉じた指令と同じ Db と設定を与えるので報告しない（実行）。
後の指令の `}%%` に閉じられた指令も報告する。
(3) 「directive not closed」「unclosed directive」「directive」。
見つかったものは設定についてのもので、mermaid.js の文書は、
merged の [#7989](https://github.com/mermaid-js/mermaid/pull/7989) で、
指令をフロントマターに置き換えているが、読み方は変わらない。
(4) 指令を `}%%` で閉じる。
規則は共通である。
共通の前処理がどの図種の字句解析よりも前に指令を取り除き、
残りを受理しない図種は報告を与えない（検出の表のすべてのヘッダーで実行）。

no-invalid-init-directive: (1) どの init の指令の設定も捨てられるか、
大文字小文字の違う名前ではその指令の設定が捨てられる（すべての図種で実行）。
mermaid.js は、JSON を読む前に、すべての `'` を `"` に変える（読んだのは、
[`detectDirective`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L159-L198)）。
そのため、変えた後の JSON として正しければ、
`{'theme": "dark"}` のように 2 種類の引用符が混ざっていても読む。
どちらの引用符の文字列でも、
中の `\'` は `"` として読む（その手順を Node で実行）。
変えた後の JSON が壊れていて、
末尾の `,` のほかは書かれた引用符どおりに読めば正しいときは、
その差になる文字（`"` で囲んだ文字列の中の `'`、
`'` で囲んだ文字列の中のエスケープしていない `"`）と末尾の `,` を 1 つずつ、
修正を付けて報告する。
文字列の中の `\'` も、修正を付けて報告する。
1 回の `--fix` ですべて直る。
それ以外で変えた後の JSON が壊れていれば、invalid として 1 件、
修正なしで報告する。
(2) なし。
`{'theme': 'dark'}` や `{"fontFamily": "Arial'}` のように変えた後の JSON
として正しいものと、`\u0027` は報告しない。
[#3640](https://github.com/mermaid-js/mermaid/issues/3640)（open）は、
引用符に関するものである。
語の引数やなしは構文を知らないことによる。
その行の `%%}%%` の後の指令は、後に文字があれば自分の設定だけを捨て、
最後の行ではすべての init の指令の設定を捨て、文書がそれを述べる。
(3) 「init trailing comma」「init directive ignored」「directive case
sensitive」「init json」「json5」「trailing comma init」。
(4) JSON を直すか、文字列の中の `'` を `\u0027`、`"` を `\"` と書くか、
名前を小文字で書く。
名前は ESLint に合わせる。
ESLint は、
正しく書かれておらず意図どおりに働かない形を invalid と呼び（no-invalid-regexp、
valid-typeof）、報告する形はそれに当たる。

no-duplicate-init-key: (1) JSON の 1 つのオブジェクトが 2 度持つキーでは、
前の値が失われる（すべての図種で実行）。
(2) なし。
同じ値でもう一度書いたキーと、
文書が各キーの最後の値で合わせる 2 つの init の指令のキーは報告せず、
mermaid.js が読む JSON だけを調べる。
(3) 「init duplicate key」「init json」。
(4) 2 つのメンバーの 1 つを残す。

class-no-inline-comment: これらの注の後の段落を参照。

sequence-no-create-destroy: (1) 何も破棄として記録しない。
(2) なし。
(3) 「create destroy」。
[#4833](https://github.com/mermaid-js/mermaid/issues/4833)（open）は、
`create` を置く場所についてのものである。
(4) `create` と `destroy` を 2 つの文に書く。

sequence-no-invalid-json: (1) JSON のオブジェクトでないテキストは、
何も与えないか、文字列や配列の文字や要素を与える。
フラグメントのある URL のように、
`#` とその後を含めて JSON のオブジェクトであるテキストは報告しない。
mermaid.js は正しい JSON のオブジェクトを `#` で切るからである。
(2) なし。
`links A:` と `properties A:` は何も与えず、後で埋めるために残す場面もない。
(3) 「links json」「properties sequence json」「links」「links hash」「links
fragment」、題名の「hash sequence」。
[#5419](https://github.com/mermaid-js/mermaid/issues/5419) （open、
Type: Bug / Error）は、`#` が sequence 図のテキストを空にすると報告している。
(4) JSON のオブジェクトを書く。

sequence-no-link-without-separator: (1) ラベルは最後の 2 文字を失い、
`link A:` は空のリンクを与える。
(2) なし。
`link->>B: x` のように参加者の id に使った `link` はメッセージで、
リンクの文ではないので報告しない（`packages/spec/docs/diagrams/sequence.ja.md`
の文の文脈の規則 11。`link` がキーワードになるのは、後に空白かタブと、
`/\+()<>:,;-` と空白のほかの文字が続くときだけである）。
(3) 「link @ sequence menu」「link sequence」。
(4) 文書は `label @ url` の形を挙げている。

class-no-bare-class-name: (1) 文は何も宣言しない。
(2) なし。
(3) 「classDiagram direction lowercase」「classDiagram title」「class diagram
title」。
(4) 文書は、`class Foo`、関係、メンバー、
そしてタイトルにはフロントマターを挙げている。

class-no-unclosed-backquote: (1) テキストの残りが 1 つの名前になる。
(2) なし。
(3) 「class name backtick」「backtick」。
(4) 逆引用符を閉じる。

gantt-no-duplicate-id: (1) id は後のタスクを名指す。
(2) なし。
(3) 「gantt duplicate id」「gantt id」。
(4) タスクに別の id を与える。

gantt-no-duplicate-setting: (1) 後の値は、
チャート全体について前の値を置き換える。
mermaid.js が持つとおりに比べて同じ値を繰り返す文は、報告しない。
(2) なし。
(3) 「gantt dateFormat twice」「gantt multiple dateFormat」「dateFormat」。
(4) 文を 1 つ残す。

gantt-no-unknown-exclude: (1) その語は何も除かない。
(2) なし。
(3) 「excludes weekend」「gantt excludes」「excludes weekdays」。
見つかったものは、
[#7038](https://github.com/mermaid-js/mermaid/pull/7038) のように、
除く日をまたぐタスクの終わりの日付についてのものと、
セクションごとの excludes
（[#5680](https://github.com/mermaid-js/mermaid/issues/5680)）である。
(4) `weekends` か、曜日の完全な名前を書く。

gantt-no-invalid-tag: (1) 開始や終わりの場所の語は、
日付として読まれるが日付でなく、チャートは描かれないか、
タスクは長さを持たない（実行）。
mermaid.js はそこのどんな語も id として読むので、id は調べない。
(2) なし。
(3) 「gantt tag case」「gantt done crit」。
[#4165](https://github.com/mermaid-js/mermaid/issues/4165)（open）は、
開始の前のコンマが抜けた場合についてのものである。
(4) 文書は、先頭に小文字で書き、コンマを続ける、という形を挙げている。
gantt-no-invalid-tag、xychart-no-invalid-orientation、
block-no-invalid-direction の名前は、
no-invalid-init-directive と同じく invalid を使う。
どれも、正しく書かれていない値（別の大文字小文字、コンマなし、空白、
置けない位置）を報告する。

journey-no-empty-person: (1) ジャーニーとその凡例が、名前の空の人を持つ。
(2) なし。
人を後で書くつもりの `Make tea: 5:` は、
書いていない人をジャーニーとその凡例に加える。
人のないタスクは `Make tea: 5` と書く。
(3) 「journey actor empty」「journey」。
(4) コンマを除くか、名前を書く。

journey-no-invalid-score: (1) 数でない score は、
その中に書いた人とともに失われる。
目盛りの外の数は効かない。
mermaid.js の文書は、score を、顔を目盛りの上に置く 1 から 5 の数と定める。
空の score は、書いていない score 0 を加える。
(2) なし。
`Make tea: : Me` のように、score を後で決めるつもりの空の score は、
書いていない score 0 を、目盛りの外に加える。
(3) 「journey score」「journey」。
[#6262](https://github.com/mermaid-js/mermaid/issues/6262) （open、
approved）は、尺度の外の顔をどう描くかについてのもので、
[#4248](https://github.com/mermaid-js/mermaid/issues/4248) （open、
Type: Enhancement、Status: Triage）は、自分の尺度を求めており、PR はない。
(4) 文書は、最初と 2 つ目のコロンの間の、1 から 5 の数というスコアを挙げている。

requirement-no-duplicate-field: (1) 最初の値を残し、
mermaid.js が持つとおりに比べて同じ値の後のフィールドは報告しない。
(2) なし。
長いテキストを続けるつもりの 2 つ目の `text:` は、報告する誤りである。
(3) 「requirement field」「requirement duplicate」。
(4) 欄を 1 つ残す。

requirement-no-duplicate-name: (1) 同じ種類の後の文は、種類や、
残る文が持たない値の欄を失う。
違う種類の文はその名前の 2 つ目の箱を作り、両方が残るので、報告しない（実行。
2 つのノード `x`）。
(2) なし。
(3) 「requirement duplicate」「requirement」。
(4) どちらかに別の名前を与える。

mindmap-no-duplicate-decoration: (1)
最後のアイコンの行と最後のクラスの行を残し、
ノードがすでに持つ値の行は報告しない。
(2) なし。
最初のアイコンを置き換えるために 2 つ目のアイコンの行を書く書き手はおらず、
2 つのクラスのための 2 つのクラスの行は、報告する誤りである。
(3) 「mindmap icon class」「mindmap」。
[#7025](https://github.com/mermaid-js/mermaid/pull/7025)（open）と
[#7615](https://github.com/mermaid-js/mermaid/issues/7615)（open）は、
アイコンをどう描くかについてのものである。
(4) 文書は、`:::urgent large` のような 1 つのクラスの行を挙げている。

mindmap-no-mismatched-shape: (1) ノードは開きの形を持つ。
(2) なし。
(3) 「mindmap shape」「mindmap」。
(4) 開きに合う閉じを書く。

timeline の規則、つまり timeline-no-duplicate-title、
timeline-no-duplicate-description、timeline-no-empty-description-block は、
上のタイトル、説明、空のブロックの規則の注を持つ。
場合は journey のものに、行の終わりの `title` が次の行の全体を取るタイトルと、
年や出来事の前の空のブロックを加えたものである（実行）。
検索は「timeline title」「timeline section」「timeline accTitle」「timeline
colon」「timeline hash」。

sankey-no-invalid-value: (1) 先頭に数のない値は `NaN` で、
リンクは大きさを持たない。
数の後のテキストは捨てられ、`"1,234"` は 1 になる（実行）。
数の後の `%%` で始まるテキストは報告しない。
(2) なし。
`5 TWh` のような数の後の単位は捨てられ、報告はそれを言う。
(3) 「sankey value」「sankey NaN」「sankey number」「sankey comma」「sankey
parseFloat」、題名の「sankey」。
[#5995](https://github.com/mermaid-js/mermaid/issues/5995)（open）は、
負の値の描き方を求めるもので、規則はそれを報告しない。
(4) 桁区切りや単位を付けずに数だけを書く。

sankey-no-empty-node: (1) 引用符の中も含め、空白だけの source や target は、
名前のないノードを、そこへのリンクとともに加える（実行）。
(2) なし。
空白を残して名前を消したものは、journey-no-empty-person と同じく、
報告する誤りである。
(3) 題名の「sankey」。
(4) 名前を書くか、レコードを除く。

XY チャートの規則。
検索は題名と本文の「xychart」。

- xychart-no-duplicate-title、xychart-no-duplicate-description、
  xychart-no-empty-description-block: 上のタイトル、説明、
  空のブロックの規則の注を持つ。
  語のタイトルは mermaid.js がつなぐとおりに比べ、
  テキストの終わりの `accTitle:` は空のタイトルを設定する（実行）。
- xychart-no-unclosed-description-block: (1)
  ブロックはテキストの終わりまで続き、後の文を取り、説明を空にする（実行）。
  規則は `}` のないブロックだけを報告するので、
  mermaid.js が書いたとおりに読む説明は報告しない。
  (2) なし。
  (4) ブロックを閉じる。
- xychart-no-invalid-orientation: (1) `Horizontal` と `HORIZONTAL` は、
  設定 `chartOrientation: horizontal` があっても、
  縦向きのチャートを与える（実行）。
  (2) なし。
  どの大文字小文字の `vertical` も報告しない。
  (4) 文書は小文字の `horizontal` を挙げている。
- xychart-no-redefined-axis: (1) 軸の後の文は、タイトルを、
  なければ空のタイトルに置き換え、データを持てばデータを置き換える（実行）。
  軸が持たないものを足すだけの文は報告しない。
  (2) なし。
  (4) 軸ごとに 1 つの文を書く。
- xychart-no-extra-value: (1) カテゴリーを超える値は捨てられる（実行）。
  (2) なし。
  (3) [#7798](https://github.com/mermaid-js/mermaid/pull/7798)（open）は、
  最後の `x-axis` より前のプロットに最後の x 軸を与えるので、規則は、
  いまもその変更の後も読み方が同じ、その後のプロットだけを調べる。
  (4) カテゴリーと同じ数の値を書く。

四象限チャートの規則。
検索は題名と本文の「quadrant」と「quadrantChart」で、point、classDef、
coordinates、x-axis、range、lexer、comma、number、NaN、hex、
radius の語も添えた。
open の [#8084](https://github.com/mermaid-js/mermaid/pull/8084) は、
描くときのテキストの折り返しだけを変え、
[#7608](https://github.com/mermaid-js/mermaid/issues/7608)（open）は、
軸のほかの範囲を求めている。

- quadrant-no-duplicate-title、quadrant-no-duplicate-description、
  quadrant-no-empty-description-block: 上のタイトル、説明、
  空のブロックの規則の注を持つ。
  タイトルは引用符と行の残りを持ち、閉じていない説明のブロックは拒否されるので、
  それを報告する規則はない（実行）。
- quadrant-no-redefined-axis、quadrant-no-redefined-quadrant: (1) 後の文は、
  設定するそれぞれのテキストを置き換える（実行）。
  空だったテキストは、失われたと数えない。
  (2) なし。
  (4) 軸ごと、象限ごとに 1 つの文を書く。
- quadrant-no-redefined-class: (1) クラスは、併合なしに、
  最後の定義のスタイルだけを持つ（実行）。
  後の定義が落とすか変えるスタイルは失われ、
  足すスタイルは何も失わない（usecase-no-redefined-class と同じ）。
  (2) なし。
  (4) スタイルを 1 つの定義に書く。
- quadrant-no-undef: (1) クラス名は点に残り、
  その名前のクラスは定義されない（実行）。
  配置はそのクラスを見つけず、
  描いた点はその名前の CSS クラスを持たない（読んだ）。
  (2) なし。
  (4) クラスを定義するか、名前を直す。
- quadrant-no-duplicate-style: (1)
  スタイルの後の値が前の値を置き換える（実行）。
  (2) なし。
  点のスタイルとそのクラスのスタイルは比べない。
  (4) スタイルをそれぞれ 1 度だけ与える。
- quadrant-no-invalid-coordinate: (1) 座標は書いたとおりに持たれ（実行）、
  配置は d3 の線形の尺度でそれを変換する。
  尺度は `0,3` に数を与えず、`0x5` に 5 を与える（d3-scale 4.0.2 で実行）。
  規則は、数でない座標と 0 から 1 の外の数の座標だけを報告するので、
  その位置に描かれる `0e5`（0）と `0b1`（1）は報告しない。
  数のない円は `cx` も `cy` も持たない（読んだ）。
  (2) なし。
  mermaid.js の文書は、座標を小数点のある 0 から 1 の数で書く。
  (3) #7608 はほかの範囲を求めているが、それで `0,3` が数になることはない。
  (4) 小数点を書く。
- quadrant-no-invalid-color: (1) 点は自分のスタイルを取り、
  次にそのクラスの最後の `classDef` のスタイルを取る。
  どちらも色を与えなければテーマの色で、
  どちらも幅を与えなければ幅 0px の縁で描かれる（`quadrantBuilder.ts`
  を読んだ）。
  `#` のない 3 桁か 6 桁の 16 進の `color` や `stroke-color` は、
  `#` を省いてよい mermaid.js の検査を通り、
  `fill="f00"` や `stroke="f00"` と描かれる。
  ブラウザはそれを色として読まないので、点はテーマの色のままで、
  縁は色を持たない（`validateHexCode` と `parseStyles` を読んだ。実行。
  `stroke-color` は `stroke-width: 4px` と一緒に）。
  `color: red` は受理されない。
  そうした値は、点がそれで描かれるところで報告する。
  文の中の同じ名前の後の値が置き換えるとき（それは quadrant-no-duplicate-style
  が報告する）、どの点も取らない `classDef` の値と、
  点自身のスタイルが置き換える `classDef` の値は報告しない（実行）。
  `stroke-color` は、点が 0px より広い縁で描かれるときだけ報告する。
  (2) なし。
  mermaid.js の文書は、どの色も `#` で書く。
  (3) 「quadrant point color hex」「quadrant color without #」、
  「validateHexCode」「quadrantChart point color」。
  (4) `#` を書く。

ブロック図の規則。
検索は題名と本文の「block」で、chain、composite、class、styles、columns、shape、
arrow、redefined、whitespace、duplicate、comma、width、edge、before、direction、
label、link の語も添えた。
open の [#8279](https://github.com/mermaid-js/mermaid/pull/8279) は、
どのブロックも持たない id への `style`（いまは拒否される）を変え、
[#8310](https://github.com/mermaid-js/mermaid/pull/8310)（open）は、
アクセシビリティの文を足す。
[#5588](https://github.com/mermaid-js/mermaid/issues/5588)（open、triage）は、
2 つの複合ブロックで id を使い回すことを求めており、
mermaid.js はそれを 1 度描く。
変えると言ったメンテナーはいない。

- block-no-edge-chain、
  block-no-edge-in-composite-head: (1)
  連なりは最後のリンクだけを始点なしに残し、最初のブロックを置かない。
  リンクのある頭は、id も辺もない複合ブロックを与える（実行）。
  (2) なし。
  mermaid.js の文書は、辺に 1 つのリンクを書き、
  `block:` の後にリンクを書かない。
  (4) リンクごとに辺を書き、複合ブロックは `end` の後でつなぐ。
- block-no-duplicate-block: (1) もう一度書いたブロックは何も置かず、
  もう一度書いたラベルや形は最初のものを置き換え、幅、子、
  `columns` は失われる（実行）。
  (2) ブロックに最初の形を与える文は、ラベルと形を与えるので報告せず、
  ただしその方法では向きを得ないブロック矢印は報告する。
  形を繰り返す辺も報告しない。
  (4) ブロックごとに自分の id を与え、テキストはラベルに書く。
- block-no-spaced-class-id、
  block-no-invalid-direction: (1) 空白を含む id
  はブロックを見つけずに新しいものを作り、
  コンマの前の空白は行の残りをクラスの名前にし、
  空白を含む向きは描画が読まない（Db は実行、描画は `blockArrow.ts` を読んだ）。
  (2) なし。
  mermaid.js の文書は、
  何も失わない `class Backend,Database back` と `(x, down)` を書くので、
  その空白は `note left of A:hi` と同じく、文書が示さない書き方である。
  (4) そこに空白を書かない。
- block-no-undef: (1) クラスは置かれない新しいブロックに行く（実行）。
  (2) なし。
  `class` の文の後で宣言した id は報告せず、
  `classDef` のないクラスの名前は確かめない。
  (4) id を直す。
- block-no-duplicate-columns、
  block-no-redefined-style: (1) 最後の `columns` がブロック全体の数を設定し、
  後の `style` は並び全体を置き換える（実行）。
  (2) なし。
  同じ数と、CSS が空白を読むとおり（両端とコロンの前後はなし、
  連なりは 1 つ）に比べてスタイルを残す並びは報告しない。
  (4) ブロックごとに 1 つの `columns` と、
  すべてのスタイルを持つ 1 つの `style` を書く。
- block-no-mismatched-shape、block-no-mismatched-edge、
  block-no-useless-width: (1) ブロックは形を持たず、
  辺は線と印をラベルの後の矢印だけから取り、
  リンクの前の幅はリンクとともに捨てられる（実行）。
  (2) なし。
  文書の組、両側の同じ線、ブロックが持つ幅と同じ幅は報告しない。
  (4) 形をその組で閉じ、両側に同じ線と 2 つ目の矢印の始まりの印を書き、
  幅はブロックを単独で宣言するところに書く。
  block-no-useless-width の名前は ESLint に合わせる。
  ESLint では、書いたが効かない値を useless（no-useless-assignment、
  no-useless-backreference）、宣言したが読まれないものを unused と呼ぶ。
  幅は文法が読み（`node SIZE`）、
  辺の動作（`nodeStatement link node`）がブロックに入れない。

カンバン図の規則。
検索は題名と本文の「kanban」で、metadata、priority、duplicate、
icon の語も添えた。
[#8117](https://github.com/mermaid-js/mermaid/issues/8117)（open）はキー
`status` を提案しているが、mermaid.js はいまそれを読まない。

- kanban-no-invalid-metadata-key、kanban-no-invalid-priority: (1) `assigned`、
  `ticket`、`priority`、`icon`、`label`、`shape` 以外のキーは何も設定しない。
  別の大文字小文字のキーと、
  YAML が 1 つのキーと読む空白のない `ticket:DOC-1` も同じである。
  `Very High`、`High`、`Medium`、`Low`、`Very Low` 以外の priority は、
  持たれるが色なしに描かれる（Db は実行、描画は `kanbanItem.ts` を読んだ）。
  (2) なし。
  文書は 4 つの値しか挙げないが描画が扱う `Medium` と、
  空のままの priority は報告しない。
  (4) キーと値を、文書が書くとおりに書く。
  どちらの規則も、木が書いたとおりに持つメタデータの YAML を、
  mermaid.js が読むとおり（js-yaml の JSON_SCHEMA）に読む。
  文書と fixture を書くための条件は次のとおりである。
  キーの規則は、列か項目のメタデータのキーのうち、6 つのどれでもないものを、
  YAML が読んだ後のキー（引用符の中のキーも）を、
  大文字小文字を区別して比べて報告する。
  1 つのノードのブロックは、mermaid.js がつなぐとおりに 1 つとして読む。
  priority の規則は、項目の priority のうち 5 つのどれでもないもの（`high`、
  `" High "`、`Urgent`、`0`、ほかの数、リスト）を報告し、ないもの、`null`、
  `false`、空のもの、mermaid.js が持たない列の priority は報告しない。
  どちらもリリースの後まで保留する。
  採らないのではない。
  文書と fixture はリポジトリになく、この注と mermaid.js の実行から書く。
  YAML を読むには plugin の依存が要り、
  リリース前の lint の規則はおもに木の形を確かめるためにあるので、
  依存を足すかはリリースの後に決める。
  足すときの依存は yaml-eslint-parser である。
  flowchart のノードのデータのキーの綴り違い（`A@{ shpe: circle }` は、
  エラーなしにノードに形を与えない。実行）も同じ種類の候補であり、
  同じく保留する。
- kanban-no-duplicate-section: (1) 同じ id のどの列も、
  その id のすべての項目を並べるので、項目は列ごとに描かれる（実行）。
  (2) なし。
  項目のない同じ id の列は報告しない。
  (4) 列ごとに自分の id を与える。

C4 図の規則。
検索は題名の「C4」と、duplicate、undefined、UpdateLayoutConfig、
UpdateElementStyle before、attribute case、accTitle、sprite、offset の語。

- c4-no-duplicate-title、
  c4-no-duplicate-description: 上のタイトルと説明の規則の注を持つ。
  `accTitle:` は、mermaid.js の不具合で見える題名を設定するので、比べない。
- c4-no-undef: (1) 読まれるときに対象のないスタイル更新は、
  対象より前に書いたものも、何も変えない（実行）。
  (2) なし。
  mermaid.js の文書は更新を図の終わりに書くので、
  対象より前の更新は文書が示すとおりに書かれていない。
  順について文書が何も言わない flowchart の、頂点より前の `class` とは違う。
  知らない alias への関係は、描くときにエラーで止まるので報告しない。
  (4) alias を直すか、更新を対象の後へ移す。
- c4-no-invalid-attribute-key、
  c4-no-useless-argument: (1)
  大文字小文字の違うスタイルのキーは別の欄として持たれ、
  呼び出しの引数を超える引数は持たれない（実行）。
  (2) なし。
  ほかの知らないキーと、引数を超える空の項目は報告しない。
  (4) キーをその大文字小文字で書き、値をその引数に書く。
- c4-no-redefined-element: (1) alias の後の宣言は、要素のラベルと種類、
  境界のラベルと型を置き換える（実行）。
  (2) なし。
  同じラベルの繰り返し、最初のラベル、要素を足すために書き直した境界、
  誰も書いていない既定の型は報告しない。
  (4) 要素と境界ごとに自分の alias を与える。
- c4-no-duplicate-style: (1)
  欄をもう一度与える後のスタイル更新や同じ更新の後の引数は、
  空の引数の空の値でも、前の値を置き換える（実行）。
  (2) なし。
  欄が持つ値を与えるもの、対象がまだ持たない欄、`$alias`、`$from`、`$to`、
  宣言の値は報告しない。
  (3) 「UpdateElementStyle」「UpdateRelStyle」:
  [#8087](https://github.com/mermaid-js/mermaid/pull/8087)（open）は、
  色を検査するが、どの値が保たれるかは変えない。
  (4) 欄はそれぞれ 1 度与え、1 つの欄には名前付きの属性を使う。

venn 図の規則。
検索は題名の「venn」と「venn-beta」と、「venn」に style、stroke-width、text、
title、duplicate、comment、union label、px の語を加えたもの。
open の [#8089](https://github.com/mermaid-js/mermaid/pull/8089) は、
描画がスタイルや領域を探す前に対象の名前を並べ替えるが、
Db はすでに並べ替えている。
open の [#8471](https://github.com/mermaid-js/mermaid/pull/8471) は、
集合のない図をエラーにする。
[#8076](https://github.com/mermaid-js/mermaid/issues/8076) と
[#7692](https://github.com/mermaid-js/mermaid/issues/7692)（open）は、
文字と円を置く場所についてである。
描画は `vennRenderer.ts` と @upsetjs/venn.js 2.0.0 で読み、
そのレイアウトを例の Db で実行もした（SVG は描いていない）。

- venn-no-duplicate-title: 上のタイトルの規則の注を持つ。
  タイトルは引用符と行の残りを持ち、フロントマターのタイトルは比べない。
- venn-no-duplicate-subset: (1) 描画は文ごとに 1 度領域を描く。
  もう一度書いた集合は次の色の 2 つ目の円になり、後のラベルは前のラベルを、
  集合の後の大きさは前の大きさを置き換え、
  和の 2 つの大きさはその間の重なりを与える（大きさは実行、
  円とラベルは読んだ）。
  (2) なし。
  字下げした `text` を続けるためにもう一度書いた集合は、2 度描かれるので報告し、
  文書はそのために行の初めの `text A A3` を示す。
  (4) 領域はそれぞれ 1 度宣言する。
  subset は、
  木（VennSubsetStatement）と mermaid.js の Db（`getSubsetData`）と同じく、
  `set` 文か `union` 文である。
- venn-no-duplicate-style、venn-no-invalid-style-key: (1) プロパティの後の値は、
  1 つの文の中で（実行）、
  また 1 つの対象の文どうしで（`buildStyleByKey` を読んだ）、
  前の値を置き換える。
  描画は文書が挙げる 5 つのプロパティだけを読み、
  mermaid.js はほかのものを書いたとおりの名前で持つ（Db は実行、描画は読んだ）。
  (2) なし。
  対象がすでに持つ値、まだ持たないプロパティ、5 つのプロパティは報告しない。
  (4) プロパティはそれぞれ 1 度与え、5 つのどれかを書く。
  venn-no-invalid-style-key の名前は、上の名前と同じく invalid を使う。
- venn-no-undef: (1) どの文も宣言しない領域の文字のノードは置かれず、
  そのスタイルは何にも付かない（レイアウトの領域は実行、
  `renderTextNodes` とスタイルの探し方は読んだ）。
  (2) なし。
  後で宣言する領域、より大きな和が足す組、
  名前が 1 つのスタイルに対する文字のノードの id は報告しない。
  (4) 名前を直すか、領域を宣言する。
- venn-no-ignored-text: (1) その文字はコメントとともに捨てられる（実行）。
  (2) なし。
  `%%` の前の空白と、ラベルや引用符の付いた名前の中の `%%` は報告しない。
  (4) その文字を取り除くか、文を書き終える。

agentflow の規則。
検索は題名の「agentflow」と「agentflow-beta」と、「agentflow」に connector、
flow title、direction、accDescr、duplicate、shape の語を加えたもの。
[#8443](https://github.com/mermaid-js/mermaid/pull/8443)（merged、
固定版に入っている）は、`[/…/]` を入力として描く。

- agentflow-no-duplicate-title、agentflow-no-duplicate-description、
  agentflow-no-empty-description-block、
  agentflow-no-unclosed-description-block、
  agentflow-no-ignored-text: 上の flowchart の規則の注を持ち、
  agentflow の読みの違いは次のとおりである。
  `accTitle:` と `accDescr:` の後とブロックの中では、
  コメント行は文字である（実行）。
  そのため、コメントだけのブロックは空ではなく、説明を設定する。
  flow や connector の名前の中と `click` の欄の前の空のブロックは、
  説明を設定せず、これも報告する（実行）。
  閉じないブロックの規則は flowchart の規則の条件を持ち、同じ理由で入れない。
- agentflow-no-redefined-vertex、
  agentflow-no-redefined-connector: (1) 形を付けた頂点や connector の宣言は id
  が持っていたラベル、描かれる形、種類を置き換え、
  connector の最初の宣言はその id の頂点を置き換える（実行）。
  形は描かれるとおりに、ひし形、六角形、サブルーチン、`[/…/]` を別に、
  ほかの括弧の形を角の丸い長方形として比べる。
  `getTypeFromVertex` と `normaliseNodeShapes` を読んだ。
  種類は agentflow が導くとおりに比べる。
  その種類は task、input、decision、action、tool、connector である。
  既定のテーマ `redux-color` は、
  種類ごとの色で描く（`deriveVertexKind` と `styles.ts` を読んだ）。
  種類は agentflow の既定の描画の一部なので、比べる。
  (2) なし。
  タイトルのない connector が示す id、参照、データブロック、同じラベル、
  描かれる形、種類は報告しない。
  (4) 要素ごとに自分の id を与える。
  2 つの規則は id ごとの 1 つの記録を共有し、報告する文で分かれる。
  agentflow-no-redefined-vertex は、flowchart-no-redefined-vertex の条件で、
  形は上のとおり描かれるとおりに比べて、
  後の flow にもう一度書いた頂点も報告する（実行）。
  `A[x]` の後の `A(x)` は、
  Db の `type` が `square` と `round` で違っても報告する（実行）。
  ただし、`global` のブロックの頂点は最上位に残るので報告しない。
  文書は、flow の間で共有するノードにそのブロックを示す。
  条件は、connector のタイトルをマークダウンでないものとして読む。
  mermaid.js はどう書いても `text` と記録し、タイトルつきで宣言し直しても、
  頂点の文が要素に付けたマークダウンのラベルとプロパティは変わらない（実行）。
  前の flow が持つ connector はそのメンバーとして数える。
  agentflow-no-redefined-connector も同じように、後の flow の宣言で、
  メタデータがなく、タイトルがないか要素が持つタイトルのものを報告する。
  `flow a` の中の `connector C` の後の `flow b` の中の `connector C` は、
  `C` を a に残し、何も変えない（実行）。
  別のタイトルは、タイトルについて報告する。
  前の flow の素の `C` の後の宣言は、`C` が connector になるので効く。
  前のどの flow も持たないときの b の中の `connector C` は b に入る（実行）。
- agentflow-no-redefined-flow: (1) 同じ id の flow は合わされ、
  空でない後のタイトルが前のものを、flow が終わる順に置き換える（実行）。
  (2) なし。
  メンバーを足すためにタイトルなしでもう一度書いた flow は報告しない。
  (4) id ごとにタイトルを 1 つ書く。
- agentflow-no-duplicate-direction: (1) flow の本体の中か、
  その id の後の宣言の中の後の方向は、前の方向を置き換える（実行）。
  flowchart の文書が言うとおり、`TD` と `TB` は 1 つの方向である。
  (2) なし。
  (4) flow ごとに方向を 1 つ書く。
  flowchart の 1 つの subgraph の 2 つの `direction`
  文も同じに振る舞い（実行）、
  flowchart-no-duplicate-direction がそれを報告する。
- agentflow-no-undef: flowchart-no-undef の注を持つ。
  flow と connector の名前は id であり、
  mermaid.js が自分で与える id （`subGraph0`、`L_A_B_0`）も図の id で、
  名指すものに届くので報告しない（実行）。

usecase の規則。
検索は題名の「usecase」と「use case」と、「usecase」に duplicate、classDef、
metadata、direction、accDescr、animate、animation の語を加えたもの。
[#8392](https://github.com/mermaid-js/mermaid/issues/8392)（closed）と、
[#8402](https://github.com/mermaid-js/mermaid/pull/8402)（merged、
固定版に入っている）は、include と extend のギュメを描く。

- usecase-no-duplicate-title、usecase-no-duplicate-description、
  usecase-no-empty-description-block、
  usecase-no-unclosed-description-block: 上の flowchart の規則の注を持ち、
  usecase の読みの違いは次のとおりである。
  mermaid.js はタイトルと説明の両端の空白を除き、
  説明の各改行の後の空白を除く（visitor と `setAccDescription` を読んだ）。
  ブロックの中のコメント行は取り除かれるので、
  コメント行だけのブロックは空の説明を設定する（実行）。
  それは、説明の後では usecase-no-duplicate-description が報告し、単独では、
  後で埋めるために残したブロックとして報告しない。
  どの `}` も閉じないブロックは受理されず、
  後のメタデータや JSON のオブジェクトの `}` が閉じるブロックは、
  そこまでの行を取る（実行）。
  閉じないブロックの規則は、それを flowchart の規則の条件で報告し、
  同じ理由で入れない。
- usecase-no-duplicate-direction: (1) 最後の `direction` 文が方向を設定し、
  `TD` は `TB` として記録される（`usecaseModelBuilder` を読んだ。実行）。
  (2) なし。
  (4) `direction` 文を 1 つ書く。
- usecase-no-duplicate-metadata: (1) キーの更新は、前の更新がアクター、
  ユースケース、境界、関係に与えた値を置き換える（実行）。
  境界の見出しのメタデータは書いた順に加わり、見出しの後の更新は報告しない。
  文書は見出しの型を変えるためにそれを書くからである。
  更新はアクターやユースケースの宣言のメタデータに、どこにあっても勝ち、
  それは文書がそれを変えるために書く方法なので、
  そのメタデータは比べない（実行）。
  (2) なし。
  `animate` は比べない。
  `animation: slow` の後の `animate: false` はアニメーションして描かれ、
  mermaid.js の不具合だからである。
  mermaid.js が 1 つの id に変える名前（`"Place order"` と `Place_order`）は、
  書いたとおりに比べ、文書がそれを述べる（実行）。
  (4) 要素のキーごとに値を 1 つ与える。
- usecase-no-redefined-class: (1) 後の `classDef`
  はクラスの定義全体を置き換え（`applyClassDefinitions` を読んだ）、
  描画はその中の各プロパティの最後の値を取る（`getCompiledStyles` を読んだ。
  実行）。
  そのため、後の定義が落とすか変えるスタイルは失われ、
  足すスタイルは何も失わない。
  flowchart、ブロック図、agentflow では、
  代わりに CSS が決める（[SKILL.ja.md](../SKILL.ja.md) の 2 節を見る）。
  プロパティの名前は書いたとおりに比べる。
  描画は書いた名前でスタイルをラベルか図形に与えるからである（`styles2String`
  を読んだ）。
  値は CSS が読むとおりに、引用符で囲んだ文字列の文字を保って比べる（実行）。
  (2) なし。
  スタイルを足すか、別の順に書く定義は報告しない。
  (4) クラスごとに `classDef` を 1 つ書く。

pie の規則。
検索は「pie duplicate label」「pie same label」、題名の「pie」と title、
「pie accDescr」「populateCommonDb」。
[#6485](https://github.com/mermaid-js/mermaid/pull/6485)（closed、未マージ）は、
Langium のパーサーではタイトルの最後の値だけを取るのが意図どおりだとしている。
[#7855](https://github.com/mermaid-js/mermaid/pull/7855)（open）は、
pie のパーサーを、今のパーサーとバイト単位で同じ値を与える Chevrotain に移す。
規則が拠る振る舞いを直すものではないので、基準 3 で規則を止めず、
それがもたらす変化は、固定した mermaid.js を更新するときに扱う。

- pie-no-duplicate-label: (1) ラベルの後の区分は足されず、
  扇形は最初の区分の値を保つ（`addSection` を読んだ。実行）。
  (2) なし。
  最初の区分と数として同じ値を与える区分は報告しない。
  (4) ラベルごとに区分を 1 つ書く。
- pie-no-duplicate-title、pie-no-duplicate-description、
  pie-no-empty-description-block: 上のタイトル、説明、
  空のブロックの規則の注を持ち、pie の読みの違いは次のとおりである。
  パーサーは最後の `title`、`accTitle`、`accDescr` を保ち、
  `populateCommonDb` は空でないときだけそれを設定するので、
  最後に書いた空のものは値を空にするか、
  フロントマターのタイトルを与える（実行）。
  ブロックの中のコメント行は取り除かれるので、
  コメント行だけのブロックは説明を空にする（実行）。
  それは、usecase と同じく、説明の後では pie-no-duplicate-description が報告し、
  単独では報告しない。
  値は値の変換が保つとおりに比べる（`valueConverter.ts` を読んだ。実行）。
  フロントマターは読まず、そこから来ることはタイトルの文書が述べる。

gitgraph の規則。
検索は「gitGraph duplicate」「gitGraph commit id」「gitGraph id」「gitGraph
parent」「gitGraph message」「gitGraph tag」「gitGraph title」。
下の #6707 のほかは、
マージ（open の [#7950](https://github.com/mermaid-js/mermaid/pull/7950)
はより多くの親を持つマージを足す）、配置、クリックに関するものである。

- gitgraph-no-duplicate-option: (1) 文法は `id`、`type`、
  `parent` にそれぞれ 1 つの値を当てるので、最後に書いたものが保たれ、
  前のものは、
  mermaid.js が受理しなかったはずの値でも失われる（`gitGraph.langium` を読んだ。
  実行）。
  (2) なし。
  もう一度与えた同じ値、足されるタグ、描画が示さないメッセージは報告しない。
  (4) オプションごとに値を 1 つ与える。
- gitgraph-no-redefined-commit: (1) id
  の後のコミットはコミットの順で前のものの場所を取り、
  前のコミットとそのタグと型は失われ、コミットの親が変わる（実行）。
  `merge` の id を持つ `commit` はそのマージを置き換える（実行）。
  mermaid.js は `Commit ID A already exists` を、
  レベル `warn` でログに書く（`commit()` を読んだ）。
  このログは、
  merged の [#6707](https://github.com/mermaid-js/mermaid/pull/6707) が、
  繰り返した id が描画を壊した
  [#4838](https://github.com/mermaid-js/mermaid/issues/4838)
  を閉じるために足した。
  既定の `logLevel` の `fatal` はそれを示さないので、
  その入力は黙って受理される。
  [#7441](https://github.com/mermaid-js/mermaid/pull/7441) が警告を足した
  flowchart-no-undef と同じである。
  [文書](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/gitgraph.md#L485-L504)
  の鉄道の例は `commit id:"Boston"` を 2 度書き、2 つ目が 1 つ目を置き換える。
  これは #4838 が報告した振る舞いであり、文書が意図して示す書き方ではない。
  (2) なし。
  文の最後の `id:` がその id であり、mermaid.js が作る id は比べない。
  (4) コミットごとに自分の id を与える。
- gitgraph-no-duplicate-title、gitgraph-no-duplicate-description、
  gitgraph-no-empty-description-block: gitgraph
  はタイトルと説明を同じに読むので、
  上の pie の規則の注を持つ（`gitGraphParser.ts` を読んだ。実行）。

packet の規則は、packet がタイトルと説明を同じに読み、タイトルを描くので、
上の pie の規則の注を持つ（packet の `parser.ts` と `db.ts` を読んだ。実行）。
検索は「packet title」「packet accDescr」「packet accTitle」「packet duplicate
label」「packet contiguous」「packet」と題名の「packet」。

architecture の規則。
検索は「architecture title」「architecture arrow」「architecture group
edge」「architecture group」「architecture-beta group」「architecture diagram
title」「architecture accTitle」「architecture accDescr」。
[#7211](https://github.com/mermaid-js/mermaid/issues/7211)（open）は、
別の group を囲む group からの辺に、
[#7313](https://github.com/mermaid-js/mermaid/issues/7313)（closed）は、
矢印の長さに関するものである。

- architecture-no-duplicate-title、architecture-no-duplicate-description、
  architecture-no-empty-description-block: architecture
  はタイトルと説明を同じに読むので、
  上の pie の規則の注を持つ（`architectureParser.ts` を読んだ。実行）。
  `title` は描かれない（`architectureRenderer.ts` を読んだ）ので、
  タイトルの規則は、タイトルを描かない図種のタイトルの規則と同じく、
  `accTitle` だけを比べる。
- architecture-no-reversed-marker: (1) 文法は `<` と `>` を、
  どちらもそれが立つ端の矢じりとして読む（`architecture.langium`
  を読んだ）ので、`>--<` は `<-->` として描かれ、
  矢じりは書いたのと逆を向く（実行）。
  (2) なし。
  文書は左に `<`、右に `>` を書き、ラベルの中の `<` や `>` は文字である。
  (4) 左に `<`、右に `>` を書く。
- architecture-no-ungrouped-modifier: (1) group に属さない端では、
  `{group}` は辺の端を group の余白と 4 だけ動かすので、
  辺は service に届かずに止まり、group は描かれない（`svgDraw.ts` を読んだ。
  実行）。
  Db は 1 つの group の 2 つの service の間の `{group}` を受理しないが、
  group に属さない端のものは受理する（`architectureDb.ts` を読んだ）。
  (2) なし。
  文書は group の中の service にだけ `{group}` を認め、
  辺の前でも後でも group の中に宣言した端は報告しない。
  (4) `{group}` を取り除くか、service をその group の中に宣言する。

radar の規則。
検索は「radar curve」「radar entry」「radar duplicate」「radar ticks」「radar
min max」「radar title」「radar accDescr」「radar axis」。
[#8522](https://github.com/mermaid-js/mermaid/pull/8522)（open）は、
等しい上下限を中心に描き、
最大値より大きい最小値はそのままにする（その変更を読んだ）。
[#8301](https://github.com/mermaid-js/mermaid/pull/8301) と、
[#6481](https://github.com/mermaid-js/mermaid/pull/6481)（open）は、
範囲の値と輪のラベルを足す。

- radar-no-undef、
  radar-no-duplicate-entry: (1)
  曲線は宣言した軸ごとにそれを名指す最初の値を取るので、
  どの軸も持たない名前の値と、
  軸の後の値は除かれる（`computeCurveEntries` を読んだ。実行）。
  (2) なし。
  名前はラベルではなく id で、曲線の後に宣言した軸も数え、
  最初の値と同じ値の後の値は報告しない。
  (4) 名前を直すか、軸ごとに値を 1 つ与える。
  radar-no-undef の名前は、何も宣言しない名前についての、
  ほかの図種の `<diagram>-no-undef` の規則にならう。
- radar-no-mismatched-entry-count: (1)
  値の数が軸の数でない値の曲線はまったく描かれず、
  凡例の項目だけが残る（`drawCurves` を読んだ。実行）。
  (2) なし。
  すべての軸を数え、軸の名前を持つ曲線はほかの規則に任せる。
  (4) 軸ごとに値を 1 つ与える。
- radar-no-duplicate-option: (1) オプションごとに最後の値が使われる（読んだのは
  [`setOptions`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/radar/db.ts#L93-L117)
  で、実行して確かめた）。
  (2) なし。
  もう一度与えた同じ値は報告せず、mermaid.js は輪を 32 までしか描かないので、
  32 を越える `ticks` は 32 として比べる。
  (4) オプションごとに値を 1 つ与える。
- radar-no-reversed-range: (1) 最小値が最大値より大きいと、
  すべての点が外側の輪に描かれる（`relativeRadius` を読んだ。実行）。
  (2) なし。
  等しい最小値、値を切る範囲、描かれる曲線のない図は報告しない。
  `max` がないとき、mermaid.js が値から取る最大値を規則は計算せず、
  文書がそれを述べる。
  (4) `max` より小さい `min` を書く。
  名前は、逆に書いた値についての、architecture-no-reversed-marker にならう。
- radar-no-duplicate-title、radar-no-duplicate-description、
  radar-no-empty-description-block、
  radar-no-unclosed-description-block: radar はタイトルと説明を同じに読み、
  タイトルを描くので、
  上の pie の規則の注を持つ（radar の `parser.ts` と `renderer.ts` を読んだ。
  実行）。
  どの曲線も `}` を持つので、閉じていないブロックは次の曲線で閉じ、
  そこまでの軸と曲線を取る（実行）。
  閉じないブロックの規則はそれを usecase の規則の条件で報告し、
  同じ理由で入れない。

treemap の規則。
検索は「treemap number」「treemap value」「treemap title」「treemap
accDescr」「treemap classDef」「treemap whitespace」。

- treemap-no-invalid-value: (1) 値の変換はカンマを除き、
  残りを `parseFloat` で読むので、`1_000` は 1、`1.2.3` は 1.2、
  `.` は数でない（treemap の `valueConverter.ts` を読んだ。実行）。
  値は数字、`_`、`.`、`,` だけを持つので、条件の `_`、2 つ以上の `.`、
  数字がないことは、全体を読まれない値とちょうど一致する。
  小数点のつもりのカンマも除かれる（`0,5` は 5、`1.234,5` は 1.2345。
  実行）ので、後に数字の続く `.` の後のカンマと、
  数字が続く最後のカンマの後が 3 桁でないカンマも報告する。
  西洋式でもインド式（`1,00,000`）でも、
  桁区切りはそこにカンマを置かないからである。
  (2) なし。
  `.5`、`5.`、桁区切りのカンマ、
  `.` の後も含めて後に数字の続かないカンマは報告しない。
  `1.5,` は 1.5 と読まれる（実行）。
  桁区切りと同じ書き方の `0,125` は 125 と読まれるが報告せず、
  文書がそれを述べる。
  (4) 数は、数字と 1 つの `.` と、桁区切りのカンマで書く。
  名前は、同じ `parseFloat` の読みを報告する sankey-no-invalid-value にならう。
- treemap-no-duplicate-title、treemap-no-duplicate-description、
  treemap-no-empty-description-block: treemap はタイトルと説明を同じに読み、
  タイトルを描くので、
  上の pie の規則の注を持つ（treemap の `parser.ts` を読んだ。実行）。
  ブロックの U+2028 は mermaid.js が保つので、
  前のブロックと改行の代わりの U+2028 だけが違うブロックはそれを置き換え、
  報告する（実行）。

railroad の規則は、タイトルと説明について上の architecture の規則の注を持つ。
4 つの方言はタイトルと説明を同じに読み（4 つの方言のパーサーを読んだ。実行）、
描画は `title` を示さない（`railroadRenderer.ts` を読んだ）ので、
タイトルの規則は `accTitle` だけを比べ、
どの規則も railroad の 4 つの図種に当てる。
検索は「railroad title」「railroad accTitle」「railroad accDescr」「railroad
duplicate」「railroad repeat」「railroad」。

cynefin の規則。
検索は「cynefin」「cynefin domain」「cynefin title」「cynefin duplicate」。
[#7922](https://github.com/mermaid-js/mermaid/pull/7922)（open）は、
枠組みの中心と境界を変え、
領域の保ち方と共通の値はそのままにする（その変更を読んだ）。

- cynefin-no-redefined-domain: (1) Db は領域の項目をその名前の下に、
  前に保った項目の上から保つので、
  後の文が繰り返さない項目は Db と描画から失われる（`cynefinDb.ts` を読んだ。
  実行）。
  (2) なし。
  項目を足したり並べ替えたりしても、すべての項目を保つ文は報告せず、
  2 度書いた項目は 2 つと数える。
  項目は、pie のラベルと同じくエスケープも書いたとおりに比べ、
  描画が数としてしか示さない `confusion` の 3 つ目より後の項目の変化も報告し、
  文書がその両方を述べる。
  (4) 領域はそれぞれ 1 度書く。
  名前は、後の定義が前を置き換える `<diagram>-no-redefined-*` の規則にならう。
- cynefin-no-duplicate-title、cynefin-no-duplicate-description、
  cynefin-no-empty-description-block: cynefin はタイトルと説明を同じに読み、
  タイトルを描くので、上の pie の規則の注を持つ（実行）。

wardley の規則。
検索は「wardley」「wardley link label」「wardley pipeline」「wardley
evolve」「wardley annotations」「wardley title」。
[#7767](https://github.com/mermaid-js/mermaid/pull/7767)（open）は、
求めに応じてラベルを置き、
[#8379](https://github.com/mermaid-js/mermaid/pull/8379)（open）は、
設定に関するものである。

- wardley-no-undef: (1) ノードでない名前へのリンクは保たれるが描かれず、
  どのノードの id でもない名前の `evolve` は、
  矢印を足さない（`resolveNodeId` とパーサーを読んだ。実行）。
  (2) なし。
  文書が示すとおりリンクは pipeline の子をラベルで名指してよく、
  後に宣言したノードも数える。
  名前は書いたとおりに比べ、エスケープを解くか HTML の属性の引用符を変えて、
  mermaid.js が 1 つにする名前は、文書が述べる限界である。
  (4) 名前を直す。
- wardley-no-redefined-node: (1) もう一度宣言したノードは、anchor、component、
  pipeline の子の順に、前の位置、戦略、
  慣性を置き換える（パーサーと `addNode` を読んだ。実行）。
  (2) なし。
  同じ値、小数の代わりの百分率、省いたラベルのずれは報告せず、
  pipeline の親の進化の向きの位置は、親が子の上に描かれるので比べない（実行）。
  (4) ノードごとに自分の id を与える。
- wardley-no-duplicate-evolve、wardley-no-duplicate-pipeline、
  wardley-no-duplicate-size、
  wardley-no-duplicate-evolution: (1) ノードの後の `evolve`、親の後の pipeline、
  後の `size` や `evolution` は、前のものを置き換える（`addTrend`、
  `startPipeline`、パーサーを読んだ。実行）。
  (2) なし。
  同じ値は報告せず、子は順によらずに、段階の境界は描かれるとおりに比べる。
  (4) それぞれ 1 度書く。
- wardley-no-duplicate-annotations: (1) 最初の `annotations` だけが枠を置き、
  後のものは効果を持たない（パーサーを読んだ。実行）。
  (2) なし。
  最初の位置の後のものと、注釈の文字のないマップのものは報告しない。
  mermaid.js は端を越える枠を内側に動かすので、
  端の近くの 2 つの位置は 1 つの枠を与えることがあり、文書がそれを述べる。
  (4) `annotations` は 1 つ書く。
- wardley-no-ignored-link-label: (1) 矢印の中のラベルが `;`
  の後のラベルを置き換え、後者は失われる（パーサーを読んだ。実行）。
  (2) なし。
  同じラベル、空白だけのラベル、何も描かないリンクは報告しない。
  矢印がラベルを持つと知らずに `;` の後のラベルを足す書き手もいるが、
  どちらでもラベルは失われるので、規則はつもりの推測を要しない。
  (4) ラベルは 1 つ書く。
- wardley-no-duplicate-title、wardley-no-duplicate-description、
  wardley-no-empty-description-block: wardley はタイトルと説明を同じに読み、
  タイトルを描くので、上の pie の規則の注を持つ（実行）。

Event Modeling の規則。
検索は「eventmodeling」「eventmodeling accDescr」「eventmodeling
accTitle」「eventmodeling data block」「eventmodeling source
frame」「eventmodeling duplicate」。
[#8288](https://github.com/mermaid-js/mermaid/issues/8288)（closed）と、
[#8296](https://github.com/mermaid-js/mermaid/pull/8296)（merged、
固定版に入っている）は、reset frame の明示した source を描く。
[#8287](https://github.com/mermaid-js/mermaid/issues/8287)（closed）と、
[#8297](https://github.com/mermaid-js/mermaid/pull/8297)（merged、
固定版に入っている）は、2 度書いたフレームの名前を受理しない。
[#7935](https://github.com/mermaid-js/mermaid/issues/7935)（open）は、
インラインのデータの最後の文字に関するものである。
[#8290](https://github.com/mermaid-js/mermaid/issues/8290)（open）は、
ほかの参照と矢印を提案する。
[#7588](https://github.com/mermaid-js/mermaid/pull/7588)（merged）は validator
を足し、公開の parse はそれを走らせない。

- eventmodeling-no-undef: (1) どのフレームも名指さない source は関係を描かず、
  source を持つフレームは前のフレームからの関係を推さない。
  どのデータブロックも名指さないデータの参照はデータを示さないか、
  ブロックの代わりにインラインのデータを示す（`getState` と `calculateTextProps`
  を読んだ。実行）。
  (2) なし。
  後に宣言したフレームやブロックも数え、名前は書いたとおりに比べ、
  `note` と `gwt` が名指すフレームは、mermaid.js がどれも描かないので調べない。
  reset frame の source は time frame のものと同じく調べる。
  mermaid.js は、フレームを名指す明示した source からは関係を描き、
  どのフレームも名指さない source
  からは描かないからである（`decidePositionRelation` を読んだ）。
  source のない reset frame は関係を推さない。
  インラインのデータのある参照も、参照が効果を持たず何も名指さないので報告する。
  (4) 名前を直す。
- eventmodeling-no-redefined-data: (1)
  フレームはその名前の最初のデータブロックを示し、
  その名前の後のブロックは決して示されない（`calculateTextProps` を読んだ。
  実行）。
  (2) なし。
  どのフレームも参照しない名前と同じ中身は報告せず、データの型は比べない。
  mermaid.js は空白と行を書いたとおりに示すので、
  中身はコメント行も含めて書いたとおりに比べ（mermaid.js
  はブロックの値にコメント行を保つ。実行）、
  後の空のブロックも空白の違いも報告し、文字参照は文書が述べる限界である。
  (4) 中身ごとに名前を与える。
- eventmodeling-no-duplicate-title、
  eventmodeling-no-duplicate-description: (1) パーサーは最後の `accTitle`
  と最後の `accDescr` を保ち、
  mermaid.js はキーワードを含めた文全体を保ってそれが空にならないので、
  `populateCommonDb` はそれを設定する（終端記号と `populateCommonDb` を読んだ。
  実行）。
  (2) なし。
  前の文字が空なら何も失われない。
  文字は共通の helper で語として比べるので、
  1 つの文字の行の形とブロックの形は 1 つの説明であり、
  mermaid.js が値にキーワードを保つことは比べない。
  ブロックの中のコメント行は説明の文字であり、一緒に比べる。
  そのため、コメント行だけのブロックはその行を説明にする。
  `accDescr: First` の後では、そのブロックがそれを置き換え、
  後の `accDescr: Second` がブロックを置き換え、どちらも報告する（実行）。
  mermaid.js は `title` を描かないので、それは比べない（実行）。
  (4) 文は 1 つにする。
- eventmodeling-no-empty-description-block: (1) ブロックは `accDescr {}`
  のような文の文字を説明として設定し、前の説明を取り除く（実行）。
  (2) なし。
  コメント行を持つブロックは報告しない。
  mermaid.js はコメント行を説明の文字として保つので（実行）、
  ブロックは空でないからである。
  `accDescr` とその `{` の間のコメント行は拒まれ、
  その形はこの規則の入力にならない。
  そのことは `packages/spec/docs/diagrams/eventmodeling.ja.md`
  の共通の文が書いている。
  `accDescr {} %% later` のように行で `}` の後にあるコメントはコメントであり、
  報告を防がない（実行）。
  (4) 説明を書くか、ブロックを取り除く。
- eventmodeling-no-unclosed-description-block: フレームのインラインのデータは、
  その行に `}` を持つので、閉じ忘れたブロックはそれに閉じられ、
  そこまでのフレームを取る（実行）。
  規則はそれを usecase の規則の条件で報告し、同じ理由で有効にしない。
  データブロックの `}` は行に単独であり、
  それが閉じるブロックは報告しないことを文書が述べる。
  usecase と同じく、コメント行の中の `{` は数えない。
  書き手は、
  後の `}`
  が閉じるものをコメントで開くつもりはないからである（`accDescr { first`、
  `%% see {x`、`second }`、インラインのデータを持つフレームの順では、
  `second }` で閉じ、フレームは書いたとおりに読まれる。報告しない。実行）。
  usecase と違い、コメント行の中の `}` はブロックを閉じる。
  コメント行はブロックの文字だからである（`accDescr { first`、`%% note }`、
  フレームの順では、説明はその `}` までになり、
  フレームは書いたとおりに読まれる。実行）。
  そうしたブロックは、後の何も取らないので報告しない。
  説明に残るコメントの文字は、
  [adoption.ja.md](adoption.ja.md) の表の不具合である。

ツリービューの規則。
検索は「treeView」「treeview annotation」「treeview icon」「treeview
accDescr」「treeview description」「treeview trailing whitespace」「treeview
class」。
[#7527](https://github.com/mermaid-js/mermaid/pull/7527)（merged）は、
注釈とアイコンを隠すことを足し、
[#7840](https://github.com/mermaid-js/mermaid/pull/7840)（merged）は、
iconify と `defaultIconPack` でアイコンを解決し、
[#7721](https://github.com/mermaid-js/mermaid/pull/7721)（merged）は、
罫線の形を足す。

- treeview-no-duplicate-annotation: (1) ある種類の後の注釈は、
  後の行にあっても前のものを置き換える（文法と `populate` を読んだ。実行）。
  (2) なし。
  3 つの種類は別であり、前の空の説明は何も失わない。
  アイコンは `getNodeIcon` が設定なしに解決するとおりに比べるので、
  `icon()` と `icon(none)` は 1 つで、`file` は `mermaid-treeview:file` である。
  アイコンを隠すことも値なので、`icon()` の後のアイコンは報告する。
  規則は設定を読まず、`defaultIconPack` が解決する名前は文書が述べる限界である。
  (4) 注釈は種類ごとに 1 つにする。
  名前は、それを注釈と呼ぶ文書に従う。
- treeview-no-duplicate-title、treeview-no-duplicate-description、
  treeview-no-empty-description-block: ツリービューは、
  タイトルと説明を同じに読むので、上の pie の規則の注を持つ（実行）。
  `title` は描かれず、比べない。
  ブロックの行の先頭の罫線の文字と、それで始まる行のタブは、
  文書が述べる限界である。
- treeview-no-unclosed-description-block: (1) `}` のないブロックは、
  ブロックの文字を名前とするノードとして読まれ、
  説明は空のままである（終端記号を読んだ。実行）。
  (2) なし。
  条件は、`accDescr`、省ける空白かタブ、`{` の順で始まる引用符のない名前であり、
  普通の名前はそうならないので、規則を有効にする。
  引用符の名前は報告しない。
  (4) ブロックを閉じる。

class-no-inline-comment: コメントの後に空白だけの行があり、
その行の後にコメント行がないとき、
mermaid.js は次の行を書き手のつもりどおりに別に読むが、
規則はそこでもコメントを報告する（基準 1）。
mermaid.js が変わるかは定まっていない。
[#1646](https://github.com/mermaid-js/mermaid/issues/1646)（closed）の返信は、
行末のコメントに対応すべきだとし、
[#6401](https://github.com/mermaid-js/mermaid/issues/6401) は、
その振る舞いを意図どおりとしている（基準 3）。

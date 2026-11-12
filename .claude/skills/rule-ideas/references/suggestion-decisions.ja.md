# 規則ごとの提案と自動修正（記録）

[SKILL.ja.md](../SKILL.ja.md) の 8 節で決めた、規則ごとの書き換えと、
どの書き換えを自動修正にするかである。
ここで番号で指す基準は SKILL.ja.md の 8 節の基準で、書き換えの種類ごとの条件は、
そこの「書き換えの種類」にある。
検索の仕方は、SKILL.ja.md の 8 節にある。

## 規則

下の各規則は、そこに挙げる書き換えを、
SKILL.ja.md の 8 節の「書き換えの種類」にある、その種類の条件で出す。
提案を付けないとある規則は、何も出さない。

- agentflow、architecture、cynefin、er、eventmodeling、flowchart、gantt、
  gitgraph、journey、packet、pie、quadrant、radar、railroad、requirement、
  sequence、state、timeline、treemap、treeview、usecase、venn（タイトルだけ）、
  wardley の `<diagram>-no-duplicate-description` と
  `<diagram>-no-duplicate-title`: この文を消す。
  前の文を消す。
  見えるようにしうるもの: テキストのない文が隠していた、
  後の文での同じ規則（`title First`、`title`、`title Third`。実行）。
- agentflow、architecture、cynefin、er、eventmodeling、flowchart、gantt、
  gitgraph、journey、packet、pie、quadrant、radar、railroad、requirement、
  sequence、state、timeline、treemap、treeview、usecase、
  wardley の `<diagram>-no-empty-description-block`: 空のブロックを消す。
- agentflow、flowchart、sequence、state、
  xychart の `<diagram>-no-unclosed-description-block`:
  テキストの終わりで閉じる。
  er、eventmodeling、radar、requirement、treeview、
  usecase のものは提案を付けない（基準 3。ありうる閉じ方は行を戻す。
  ブロックがノードになる treeview では、名前を閉じることも行を戻す）。
- class: class-no-duplicate-description、class-no-duplicate-title、
  class-no-bare-class-name、class-no-ignored-text、
  class-no-unclosed-backquote は提案を付けない。
  class では、行でほかの文字の後にあるコメントは、
  mermaid.js で改行も取る（既知の差異 `comment-takes-line-break`）。
  そのため、そうした行の後では、
  どの書き換えも mermaid.js がその行につなげる行を変え（`A %%` の後の `B`
  は受理され、`B` の前に `class ` を書くと拒まれる。実行）、
  書き換えを正しく保つにはその差異の判定が要るからである。
  `;` で分けることと、逆引用符の名前を閉じることは行を戻す（基準 3）。
  class-no-inline-comment は、
  コメントをそれだけの行に移す（その invalid の fixture は、
  どれもコメントの行を除いたときと同じに読まれる。実行）。
  この書き換えにその判定は要らない。
  前の行のほかの文字の後のコメントも、同じ規則が報告し、
  同じ通しで移すからである。
  class-no-redefined-class は提案を付けない。
  ありうる直しは 2 つのクラスの一方の新しい id だからである（基準 1。
  flowchart-no-redefined-vertex と同じ）。
  class-no-undef は提案を付けない。
  どのクラスのつもりかをテキストは示さないからである。
- c4: c4-no-duplicate-description、c4-no-duplicate-title、
  c4-no-invalid-attribute-key は、
  class と同じ理由で提案を付けない（comment-takes-line-break は c4
  でも成り立つ）。
  c4-no-duplicate-style は提案を付けない。
  場所で決まる引数はほかを動かさずに消せず、空の引数は空の値を与えるからである。
  c4-no-redefined-element は提案を付けない。
  宣言はほかの値も与えるからである。
  c4-no-useless-argument と c4-no-undef は提案を付けない。
- xychart: xychart-no-duplicate-description、xychart-no-duplicate-title、
  xychart-no-empty-description-block は提案を付けない。
  行を消すと軸の文の後の行終端が 1 つ減り、
  それが mermaid.js の字句解析の状態を変えて、
  受理していたタイトルを拒むことがある（既知の差異
  `title-digit-after-axis-statement`。`x-axis A; line [1]`、`title B`、
  `title Q1` で `title B` を消すと拒まれ、`x-axis A; line [1]; line [2]`、
  `accDescr: a`、`accDescr: b`、
  `title Q1` で `accDescr: a` か `accDescr: b` の行を消すと拒まれる。
  `bar [2]` でも同じ。実行）。
  どの結果が拒まれるかは、仕様が述べないその字句解析の手順で決まるからである。
  xychart-no-invalid-orientation は、向きを小文字で書く（実行）。
  xychart-no-extra-value は提案を付けない。
  余分な値に当てるつもりのカテゴリーはテキストにないからである。
  xychart-no-redefined-axis は提案を付けない。
  文が軸の一部だけを設定することがあり、どちらかを消すと、
  他方が設定しない部分が変わるからである。
- flowchart: flowchart-no-ignored-text は提案を付けない（基準 3。
  分けると行を戻す）。
  flowchart-no-redefined-vertex は提案を付けない。
  ありうる直しは新しい id である（基準 1）。
  flowchart-no-undef は提案を付けない。
  どの id のつもりかが分からない（基準 1）。
  flowchart-no-redefined-subgraph は提案を付けない。
  ありうる直しは 1 つの題か別の id である（基準 1）。
  flowchart-no-spaced-stroke と agentflow-no-spaced-stroke は、
  `stroke` の `:` の前の空白を消す（実行）。
  ただし、それが届くどのリンクのスタイルでも、後に `stroke` がないときに限る。
  これはどの修正も変えない。
  そうでないと、そのリンクの矢じりはこの色を取り、線は後の色を取るので（実行）、
  書き換えを出さない。
  mermaid.js がスタイルから `;` を落とすときも、書き換えを出さない。
  `classDef hot stroke :#f00;fill:none` の 1 つのスタイルは
  `stroke :#f00fill:none` である。
  空白を消すと `stroke:#f00fill:none` になり、前と同じく、
  線にも矢じりにも色を付けない（実行）。
  そのため、この書き換えは規則を黙らせるだけである（基準 2）。
  スタイルの中の directive は、その場に残す。
  名前と `:` の間の空白を消し、その間の directive は残すので、
  `linkStyle 0 stroke %%{init: {}}%%:#f00` は
  `linkStyle 0 stroke%%{init: {}}%%:#f00` になる。
  名前や値の中の directive（`s%%{init: {}}%%troke :#f00`、
  `stroke :#f%%{init: {}}%%00`）も、そのまま残す。
  どの結果も、矢じりに線の色を与える（実行。flowchart と agentflow）。
  リンクのスタイルで、このスタイルの前に `stroke:` という文字がないとき、
  この書き換えはそのリンクの矢じりに、テーマの色の代わりに線の色を与える（実行。
  `linkStyle 0 stroke :#f00`）。
  それ以外では、どのリンクも取らないスタイルを含め、
  描かれるものを何も変えない（実行。`stroke:#00f,stroke :#f00`）。
  この書き換えを自動修正にする（「自動修正」の項に挙げる）のは、
  書き手が矢じりをテーマの色のままにするつもりではなかった、という前提による。
  この前提は 2 つの事実に拠る。
  1 つは、リンクのスタイルでは、mermaid.js の文書が示す形が、
  矢じりに線の色を与えることである（実行。
  文書の例を最初のリンクにした
  `linkStyle 0 stroke:#ff3,stroke-width:4px,color:red;`）。
  そのため、色を付けた線とテーマの色の矢じりは、そこでは、この形のような、
  文書が示さない形でしか書けない。
  もう 1 つは、この形を意図して書くときは規則を無効にする、
  と規則の文書が書いていることである。
- flowchart、agentflow、usecase: 3 つの `<diagram>-no-duplicate-direction` は、
  この文か、方向が違う相手の文を消す（flowchart の、
  同じ id の後の subgraph では、最初の subgraph の最後のもの）。
  行にほかの文字がある方向の文は、その文字も消えるので消さない。
  同じ id の後の subgraph は、
  最初のものが方向を持たないときも方向を失う（実行）。
  1 つを消すと、
  同じ方向を与えていた後の文が見えるようになることがある（`direction LR`、
  `direction TD`、`direction TB`。実行）。
  agentflow-no-ignored-text は提案を付けない（基準 3）。
  agentflow-no-redefined-vertex、agentflow-no-redefined-connector、
  agentflow-no-redefined-flow は提案を付けない。
  ありうる直しは 2 つの要素かフローの一方の新しい id だからである（基準 1）。
  usecase-no-duplicate-metadata は、venn-no-duplicate-style と同じく、
  このプロパティか前のプロパティを消す（実行）。
  fixture: `actor A` の後の `A@{ type: hollow }`、`A@{ type: hollow }`、
  `A@{ type: awesome }`（3 つ目を消すものは出し、2 つ目を消すものは出さない。
  最初の `hollow` がなお置き換えられるからである。
  パーサーも mermaid.js も受理する。実行。アクターは `normal`、`hollow`、
  `awesome` を取る。`packages/spec/docs/diagrams/usecase.ja.md`）。
  usecase-no-redefined-class は、この `classDef` か前のものを消す。
  ほかのクラスも定義する文は消さない（実行）。
  agentflow-no-undef は提案を付けない。
- sequence: sequence-no-ignored-text は、`)` だけが間に何もなく並ぶ行を、
  すぐ前の行の終わりにある `:` の後のテキストの終わりにつなげる。
  そのテキストが、
  後の `)` が閉じない `(`
  を少なくとも同じ数だけ持つときに限る（`A ->> B: call(x` の後の `)`
  はメッセージ `call(x)` になる。実行）。
  文字は消さない。
  書き手がそこに何も書かないつもりだったとはテキストは示さないからである。
  sequence-no-invalid-json は、文字列の外の `,` で、
  後の `}` か `]` と空白だけで隔たるものを、
  それで `#` の前のテキストが JSON のオブジェクトになるとき、
  それぞれ消す（実行）。
  sequence-no-link-without-separator は、
  テキストが 2 語以上で最後の語が `://` を持つとき、
  最後の語の前に `@` と空白を足す（実行）。
  sequence-no-create-destroy は提案を付けない。
  どのメッセージで参加者を破棄するつもりかをテキストは示さず、
  `participant` のない `create A` は拒まれるからである（実行）。
- state: state-no-ignored-text は、1 行に書いたノートの `:` の後に、
  mermaid.js の文書の書き方のとおり空白を足す（`note left of A:hi`。実行）。
  ほかのテキストには提案を付けない（`;` で分けると行を戻す）。
  state-no-undef は、class-no-undef と同じ理由で提案を付けない。
- er: er-no-ignored-text は提案を付けない（基準 3）。
  er-no-redefined-entity は提案を付けない。
  ありうる直しは 2 つの実体の一方の新しい名前だからである（基準 1）。
  er-no-undef は、class-no-undef と同じ理由で提案を付けない。
- gantt: gantt-no-duplicate-setting は、この文か、
  前の同じ設定の文を消す（mermaid.js はチャート全体に最後の値を使う。実行）。
  gantt-no-invalid-tag は、2 つの項目の開始の語を小文字で、
  `,` で区切って書く（`b : done crit, 1d` はタグを得て 1 日続く。実行）。
  3 つの項目の開始には出さない。
  タグを id の前に移すことになるからである。
  終わりにも出さない。
  gantt-no-unknown-exclude は、
  3 文字以上の項目がその始まりである語を書く（`weekend`、`sat`。実行）。
  `weekdays` には出さない。
  gantt-no-duplicate-id は提案を付けない。
  タスクの一方に当てるつもりの id はテキストになく、
  id を消すと参照が名指すタスクが変わるからである。
  gantt-no-undef は提案を付けない。
- journey: journey-no-empty-person は、空の人を隣の `,` と一緒に消す。
  すべての人が空なら、人の前のコロンをそれらと一緒に消す。
  タスクが 3 つ目のコロンの後にテキストを持つときは出さない。
  そのテキストが人になるからである（実行）。
  journey-no-invalid-score は、
  1 から 5 の score の後に空白か `,` とほかのテキストが続くとき、
  score の後に `: ` を書く。
  タスクが人を持たず、
  残りが `%%` や文を始めるキーワードで始まらないときに限る（`A: 5 accDescr {}`
  は人 `accDescr {}` を得てしまう。実行）。
  journey-no-ignored-text は、
  ディレクティブの外の 3 つ目からの各コロンに `,` を書く。
  空の部分がないときに限る（実行）。
- requirement: requirement-no-duplicate-field は、このフィールドか、
  mermaid.js が値を保つ同じ種類の最初のものを消す。
  後者は、その後規則がこのフィールドを報告しないときだけ出す（`id: 1`、`id: 2`、
  `id: 3`。実行）。
  最初のものを消すと、後のフィールドの値が見えるようになることがある。
  requirement-no-ignored-text は提案を付けない（基準 3）。
  requirement-no-duplicate-name は提案を付けない。
  1 つの requirement か 2 つかをテキストは示さず、どちらの文を消しても、
  クラスを含めてその文が持つものを失うからである。
  requirement-no-undef は提案を付けない。
- mindmap: mindmap-no-duplicate-decoration は、この行か、
  そのノードの前の同じ種類の行を消す（実行）。
  mindmap-no-mismatched-shape は、開く記号の閉じる記号か、
  閉じる記号の開く記号を書く。
  `-)` には出さない（どちらの組もその形に描かれる。実行）。
- sankey: sankey-no-invalid-value は、別の大文字小文字の `Infinity`、
  `_` で区切った数字、`0x` の 16 進の整数、3 桁の前にない小数の `,` に、
  その数を書く（`"1,234"` は千の区切りかもしれない。実行）。
  sankey-no-empty-node は提案を付けない。
- treemap: treemap-no-invalid-value は、sankey-no-invalid-value と同じく、
  `_` で区切った数字と、3 桁の前にない小数の `,` に、その数を書く（実行）。
- quadrant: quadrant-no-duplicate-style は、一覧のこのスタイルか、
  前の同じ名前のものを、隣の `,` と一緒に消す。
  quadrant-no-redefined-class と quadrant-no-redefined-quadrant は、
  この文か前の文を消す（実行）。
  quadrant-no-invalid-color は、値の前に `#` を書く（実行）。
  ただし、値の後に `;` が続くときは、
  間に directive だけがあるとき（`color: f00%%{init: {}}%%;`）も含め、出さない。
  `#f00;` は文字参照として読まれ、入力が受理されないからである（実行。両方）。
  スタイルの中の directive はその場に残し、`#` は値の最初の文字の直前に書く。
  `color: f%%{init: {}}%%00`、`color: %%{init: {}}%%f00`、
  `co%%{init: {}}%%lor: f00` は、`color: #f%%{init: {}}%%00`、
  `color: %%{init: {}}%%#f00`、`co%%{init: {}}%%lor: #f00` になり、
  点はその色で描かれる（実行）。
  quadrant-no-invalid-coordinate は、小数の `,` の代わりに `.` を書く（実行）。
  `,` を持つ座標はいつも `0`、`,`、
  数字である（`packages/spec/docs/diagrams/quadrant.ja.md` の座標。
  `1,5` は拒まれる）。
  そのため結果はいつも 0 から 1 の数で、この書き換えに条件は要らない。
  fixture: `A: [0,3, 0,6]`（両方の座標に出す）。
  quadrant-no-redefined-axis は、
  xychart-no-redefined-axis と同じ理由で提案を付けない。
  quadrant-no-undef は提案を付けない。
- block: block-no-duplicate-columns と block-no-redefined-style は、
  この文か前の文を消す（実行）。
  block-no-edge-chain は、連鎖を 1 つずつのリンクの辺に分ける。
  各辺はそれだけの行にあり、リンクの前のブロックの id で始まる（実行）。
  block-no-edge-in-composite-head は、
  1 つのリンクを `G --> B` のように `end` の後に移す（実行）。
  リンクが 2 つ以上の見出しには出さない。
  移したリンクが連鎖になるからである。
  block-no-invalid-direction は、方向を空白なしで書く（実行）。
  報告する方向はもとから小文字である。
  大文字の方向は拒まれるからである（`packages/spec/docs/diagrams/block.ja.md`
  のブロック矢印）。
  fixture: `( left )`（出す。`(left)`）。
  block-no-mismatched-edge は、開く矢印をラベルの後の矢印の線で書くか、
  その矢印を開く矢印の線で書き、
  開く矢印の始めの矢じりをラベルの後の矢印に移す（実行）。
  block-no-mismatched-shape は、開く記号の閉じる記号を書く（実行）。
  開く記号 `[/` と `[\` には、閉じる記号が 2 つずつある。
  `[/` は `/]` で右に傾いた形、`\]` で台形として閉じ、
  `[\` は `\]` で左に傾いた形、`/]` で逆の台形として閉じる。
  この 2 つの開く記号には、閉じる記号を両方とも出し、
  それぞれのメッセージは書く閉じる記号を名指す（``Close with `/]`.``、
  ``Close with `\]`.``）。
  どちらも書き手が書こうとした形でありえ、
  テキストはどちらとも決めないからである。
  fixture: 報告する形の `block/db-closer-slash-open-with-bracket` と
  `block/db-closer-backslash-open-with-bracket`、
  結果の `block/db-shape-lean-right`、`block/db-shape-trapezoid`、
  `block/db-shape-lean-left`、`block/db-shape-inv-trapezoid`。
  block-no-spaced-class-id は、id の `,` の前後の空白を、
  そこのディレクティブの後のものも含めて消す（実行）。
  block-no-useless-width は、幅を消すか、
  ほかの辺がそのブロックの幅を書いていないとき、
  それだけで書いたブロックの最初の宣言に幅を移す。
  そうでないとほかの辺が報告される（実行）。
  block-no-duplicate-block と block-no-undef は提案を付けない。
- kanban: kanban-no-duplicate-section は提案を付けない。
  1 つの列か、違う id の 2 つの列かがテキストから決まらないからである。
- venn: venn-no-duplicate-style は、同じ対象のこのプロパティか前のものを、
  隣の `,` と一緒に、またはただ 1 つのプロパティならその文と一緒に消す（実行）。
  venn-no-invalid-style-key は、小文字にした名前が 5 つの 1 つのとき、
  名前を小文字で書く。
  そのとき venn-no-duplicate-style が報告することがある（実行）。
  venn-no-ignored-text は提案を付けない。
  コメントの前に空白を置くと、その文字は読まれて拒まれ（`set A: %% c`。実行）、
  消すと書き手の書いたものを失うからである。
  venn-no-duplicate-subset と venn-no-undef は提案を付けない。
- architecture: architecture-no-reversed-marker は、
  印を mermaid.js が描くとおりに、線の前の `>` を `<`、
  線の後の `<` を `>` と書く（実行）。
  architecture-no-ungrouped-modifier は `{group}` を消す（実行）。
  service を group の中で宣言するには、group の名前が要る。
- cynefin、gitgraph、radar、treeview、wardley: cynefin-no-redefined-domain、
  gitgraph-no-duplicate-option、radar-no-duplicate-option、
  treeview-no-duplicate-annotation、wardley-no-duplicate-annotations、
  wardley-no-duplicate-evolution、wardley-no-duplicate-evolve、
  wardley-no-duplicate-size は、この文、オプション、注釈か、
  その値を置き換えられた前のもの（mermaid.js が最初のものを保つ
  wardley-no-duplicate-annotations では最初のもの）を消す。
  仕様は拒まれる結果を挙げており、それらの書き換えは出さない。
  gitgraph では、
  `merge` と `cherry-pick` の実際の `id:` と `parent:`
  が拒否を決める（`packages/spec/docs/diagrams/gitgraph.ja.md` の拒否の表。
  コミットを名指す merge の id、知らない cherry-pick の元、
  直接の親でない parent）。
  そのため、この 2 つの文の `id:` と `parent:` のオプションを消すものは出さず、
  `type:` のオプションと `commit`
  のすべてのオプションを消すものは出す（`id: "B"` のない
  `cherry-pick id: "missing" id: "B"` は拒まれる。実行）。
  wardley では、
  最初の `annotations`
  の座標だけを調べる（`packages/spec/docs/diagrams/wardley.ja.md`。
  1 以下の値は 100 倍し、0 未満か 100 を超える結果は拒まれる）。
  そのため、最初の `annotations` を消すものは、
  次のものの座標がその検査を通るときだけ出す。
  地図の外の注釈の位置が最初に残ると拒まれるからである（実行）。
  fixture: `merge` で繰り返した `id:` と `type:`、
  `cherry-pick` で繰り返した `id:`（`type:` は出し、`id:` は出さない）。
  地図の中と外の後の `annotations`（出すものと出さないもの）。
  radar のオプションを消すと、
  それが隠していた逆の範囲が見えるようになることがある（`min 10, max 5` の後の
  `min 0`。実行）。
  radar-no-reversed-range は、最後の `min` と `max` の値を入れ替える（実行）。
  wardley-no-ignored-link-label は、
  `;` の後のラベルか矢印の中のラベルを消す（`+>` は受理される。実行）。
  radar-no-mismatched-entry-count、radar-no-undef、
  gitgraph-no-redefined-commit、
  wardley-no-duplicate-pipeline（pipeline は子も宣言する）、
  wardley-no-redefined-node（宣言はほかの値も与える）、
  wardley-no-undef は提案を付けない。
- pie、radar、eventmodeling: pie-no-duplicate-label、radar-no-duplicate-entry、
  eventmodeling-no-redefined-data は提案を付けない。
  ありうる直しは、新しいラベル、ほかの軸の名前、
  新しい名前だからである（基準 1）。
  eventmodeling-no-undef は提案を付けない。
- 共通の規則: no-unclosed-directive は提案を付けない（基準 3。
  ディレクティブを閉じると、それが取っていた行が戻る）。
  no-invalid-init-directive は、報告した `'` と `\'` のそれぞれに `\u0027` を、
  報告した `"` のそれぞれに `\"` を書き、
  報告した末尾の `,` を 1 つずつ消す（報告は
  [recommended-decisions.ja.md](recommended-decisions.ja.md) のその注のとおり。
  その手順を Node で実行）。
  さらに、別の大文字小文字でだけ `init` か `initialize` で終わる名前を、
  引数がないか、語か、mermaid.js が読める JSON（構造の誤りも、末尾の `,` も、
  壊す引用符もないもの）のとき、小文字で書く。
  引数がないか語なら、mermaid.js は JSON を読まない（読んだのは、
  [`directiveRegex`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagram-api/regexes.ts#L12-L13)）。
  壊れた JSON のときに小文字にすると、
  mermaid.js はそのディレクティブから設定を読まない（実行）。
  no-duplicate-init-key は、このメンバーか、前の同じキーのものを消す（実行）。

## 自動修正

- 次の書き換えは自動修正である。
  どれも、
  テキストがもう書いているものを mermaid.js
  が読む形で書き（読む大文字小文字の同じ語、同じ数、
  書き手が書き落とした区切りや空白、それぞれの行に分けた同じ文）、
  どれも自分の文で決まる。
  - block-no-invalid-direction（空白なしの方向）、
    block-no-spaced-class-id（`,` の前後の空白を消す）、
    block-no-edge-chain（連鎖を 1 つずつのリンクの辺に分ける）。
  - class-no-inline-comment（コメントをそれだけの行に移す）。
  - gantt-no-invalid-tag、
    gantt-no-unknown-exclude（項目で始まる `excludes` の語は 1 つだけである）、
    quadrant-no-invalid-color（`#`）、quadrant-no-invalid-coordinate、
    xychart-no-invalid-orientation。
  - flowchart-no-spaced-stroke と agentflow-no-spaced-stroke（`:`
    の前の空白を消す）。
  - no-invalid-init-directive（3 つの書き換えすべて）、
    sequence-no-invalid-json、sequence-no-ignored-text、
    sequence-no-link-without-separator、
    state-no-ignored-text（ノートの `:` の後の空白）。
  - sankey-no-invalid-value と treemap-no-invalid-value の、
    別の大文字小文字の `Infinity`（sankey）、`_` で区切った数字、
    `0x` の 16 進の整数（sankey）。
  - venn-no-invalid-style-key で、同じ対象のどの文のほかのプロパティも、
    同じ属性を設定しないとき（大文字小文字を問わない名前で）。
    この条件は差し止めるだけである。
    属性の新しい名前を書く修正はないので、
    ほかの修正がこの条件を誤りにすることはない。
- 次の書き換えは提案である。
  理由はそれぞれに添える。
  - この文、オプション、部分か、
    前のものを消す（2 つの削除を持つすべての規則）: 書き手が 2
    つの値のどちらを残すつもりかをテキストは示さない。
    この文だけを消せるときも、前の値を残すのは推測である。
  - 空のブロックを消す（`<diagram>-no-empty-description-block`）と、
    journey-no-empty-person: 空のブロックや空の人は、
    後で埋める場所であることがあり、
    書き手がそこに何も書かないつもりだったとはテキストは示さない。
  - ブロックをテキストの終わりで閉じる:
    ブロックがどこで終わるつもりだったかをテキストは示さず、
    ブロックのテキストとして残る後の行は、文のつもりだったかもしれない。
  - block-no-mismatched-shape、block-no-mismatched-edge、
    mindmap-no-mismatched-shape: 2
    つの括弧か矢印のどちらが誤りかをテキストは示さない。
  - block-no-useless-width: 幅を消すと書き手が書いたものを失い、
    どこへ移すかは選ぶことである。
  - wardley-no-ignored-link-label: 2
    つのラベルのどちらのつもりかをテキストは示さない。
  - block-no-edge-in-composite-head: 辺は、
    宣言するブロックを辺の位置に置くので、
    `end` の後へ移すとそれらも動くことがある。
  - architecture-no-reversed-marker: 描画を保ってテキストを変えるが、
    書き手はテキストの向きのつもりだったかもしれない。
  - architecture-no-ungrouped-modifier: `{group}` を消すと、
    書き手のつもりだったグループ分けを失う。
    それには group の名前が要る。
  - radar-no-reversed-range: 順でなく、2 つの数のどちらかが誤りかもしれない。
  - journey-no-ignored-text: 3
    つ目からのコロンは人の名前のものかもしれない（`Meet at 10:30`）。
  - journey-no-invalid-score: score
    の後の文字はタスクのものかもしれない（`Write: 2 drafts` は人 `drafts`
    を得てしまう）。
  - sankey-no-invalid-value と treemap-no-invalid-value の小数の `,`: `1,5` は
    1.5 か 15 かが分からない。
  - venn-no-invalid-style-key で、
    ほかのプロパティが同じ属性を設定するとき: mermaid.js が使う値が変わり、
    書き手がそのつもりだったとはテキストは示さない。

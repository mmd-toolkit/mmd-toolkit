---
name: rule-ideas-suggestions
description: >-
  Decide whether a kept rule of @mmd-toolkit/eslint-plugin offers suggestions or
  a fix, and which, and keep the record of each rule. Use when the suggestions
  or the fix of a kept rule are decided or rechecked, and when a suggestion or a
  fix is implemented with the eslint-plugin-rules skill, together with the
  rule-ideas skill.
---

# 規則の提案の決め方（rule-ideas-suggestions）

SKILL [rule-ideas](../rule-ideas/SKILL.ja.md) の 1 節、2 節、
4 節（この手順の範囲と進め方、採否の基準、
mermaid と parse() で確かめる手順）は、この手順にも当たる。
先に読む。

## 1. 提案

持つ規則に、提案か自動修正を付けるかと、その中身を決める。
提案は、エディタで利用者が選んだときだけ適用される書き換えである。
書き換えの候補は、次の 5 つの基準を満たすときだけ提案にする。

提案を付けないことは、守りを要する提案を付けるより良い。
候補は、それが正しい条件を仕様の文 1〜2 文で書けるときだけ出す。
結果の parse、既知の差異ごとの判定、
図種ごとの例外がないと成り立たない候補は出さず、候補を守るために条件を足さない。
1 つの規則の中でも同じで、そうした文が言える場合（行を独り占めする文だけを消す、
コメントのない範囲だけを詰める）にだけ書き換えを出し、ほかの場合は出さない。

1. **候補が、報告した書き方から決まる少数である（1〜3）。**
   書き換えが書くものは、木とそのトークンの位置と、ノードの値から決まる。
   新しい名前が要る書き換え（打ち間違えた id を別の id に、
   使い回した id を新しい id に変える）は候補にしない。
   どの名前のつもりかをテキストは示さないからである。
2. **どの候補も、書き手のつもりでありうる。**
   結果は、その誤りをした書き手が書こうとした形の 1 つである。
   書き手のつもりにかかわらず、規則を黙らせるだけの書き換えは候補にしない。
3. **条件を仕様の文から書き、規則がその場所をもう報告せず、
   書き換えが新しい誤りを書かない。**
   どの書き換えも、規則を走らせるときに結果を parse しない。
   1 行に約 0.04 ms かかるので、1,000 行の図に報告が 100 あると、
   lint のたびに約 9 秒かかる。
   ブロック、ディレクティブ、逆引用符、
   名前が取っていた行を文に戻す書き換え（ブロックを `{` の行の終わりで閉じる、
   treeview の名前を閉じる、ディレクティブを閉じる、逆引用符の名前を閉じる）と、
   `;` で行を分ける書き換えは出さない。
   それらの行が文に戻るか、mermaid.js がそれをどう読むかは、
   結果の全文を parse し、既知の差異について調べないと分からず、その差異は、
   仕様が述べない mermaid.js の字句解析の手順を写すことになるからである。
   空のまま閉じていないブロックを閉じる書き換えは候補にしない。
   空のブロックを書き、no-empty-description-block がそれを報告するからである。
   ほかの規則が結果を報告してよいのは、書き手のテキストがもう持っていた誤りを、
   書き換えが見えるようにするときだけである。
   前の説明の後の閉じていないブロックを閉じると、
   テキストが説明を 2 度設定していることが見え、
   no-duplicate-description がそれを報告する。
   規則のテストは、その提案がこのように見えるようにしうる規則を、
   それぞれが示す誤りとともに挙げ、結果にほかの規則の報告があれば失敗する。
   それは規則の文書でなく、
   この節と
   [references/suggestion-decisions.ja.md](references/suggestion-decisions.ja.md)
   が記録し、fixture が示す。
4. **結果を mermaid.js がどう読むかが分かっている。**
   この節と
   [references/suggestion-decisions.ja.md](references/suggestion-decisions.ja.md)
   の記録、fixture がその読み方を持ち、
   例を mermaid.js で走らせて確かめる（実行）。
   提案のメッセージは、
   読み方でなく書き換えだけを言う（``Remove this `accTitle` statement.``、
   ``Remove the earlier `accTitle` statement.``、`Remove the empty block.`、
   `Close the block at the end of the text.`）。
   読み方は結果が示し、それを言う節は、
   同じ値を設定する 3 つの文の 2 つ目では偽になる。
5. **結果が、見えない空白に頼らない。**
   行末の空白でだけ読み方が変わる書き換え（`%%`
   の後に空白を足す）は候補にしない。
   エディタが保存のときに行末の空白を消すと元に戻るからである。

書き換えを提案でなく自動修正（`meta.fixable`。
`eslint --fix` とエディタが保存のときに当てる）にするのは、
次の 2 つがともに成り立つときだけである。
1 つ目に、結果が書き手のつもりだと疑いなく言え、
mermaid.js がそれをつもりどおりに読む。
テキストが許す書き換えがこの 1 つで、
書き手が別のつもりで書いたかもしれないものを、消しも足しもしない。
2 つ目に、書き換えを決めるものが、書き換える範囲と自分の文の中にある。
`--fix` は、同じテキストで見つけたすべての規則の修正のうち、
範囲が重ならないものを 1 回の通しでまとめて当て、それから lint し直し、
それを 10 回まで繰り返す（ESLint の `lib/linter/source-code-fixer.js` と
`MAX_AUTOFIX_PASSES`）。
そのため、ほかの行を読む条件を持つ修正は、
同じ通しのほかの規則の修正で誤りになりうる。
修正を差し止めるだけの条件は、その条件が探す形をどの修正も作らないなら、
ほかの行を読んでよい。
修正は後の通しで当たる。
自動修正を出す報告は、同じ書き換えの提案を出さない。
自動修正の条件が成り立たない報告では、その書き換えを提案として出す。
どの書き換えを自動修正にするかは、
[references/suggestion-decisions.ja.md](references/suggestion-decisions.ja.md)
の「自動修正」に挙げる。

規則の文書の本文は、
提案に触れない（SKILL `eslint-plugin` の
[3 節](../eslint-plugin/SKILL.ja.md#3-文書の形)）。
提案や自動修正があることは生成する告知が言い、
それぞれのメッセージはその書き換えを言う。
書き換えごとに何を変えるか、どんな条件で出すか、結果を mermaid.js がどう読むか、
何を見えるようにしうるか、規則が提案を付けない理由、
それを説明する mermaid.js のソースへのパーマリンクは、
この節と
[references/suggestion-decisions.ja.md](references/suggestion-decisions.ja.md)
に記録する。
実装はこの記録に従い、規則のテストがそれを確かめる。
読み方は、各規則の invalid の fixture で確かめた（実行）。

### 書き換えの種類

どの書き換えも、ディレクティブを一緒に消さない。
消すか置き換える範囲の中にディレクティブがあるときは、書き換えを出さない。
ディレクティブの設定も一緒に消えるからである。
sankey の `a,b,1%%{init: {"theme":"dark"}}%%_000` を `a,b,1000` と書き換えると、
受理されるが（実行）、ディレクティブは消え、それとともにテーマも消える。
範囲の隣のディレクティブはそのまま残る（block-no-spaced-class-id が消す、
ディレクティブの後の空白）。
ディレクティブの中の書き換え（no-invalid-init-directive、
no-duplicate-init-key）は、その引数だけを変える。
fixture: 上の sankey の値（出さない）と、
ディレクティブのない同じ規則の値（出す）。

- 文を消す: 文を、その行と行終端と一緒に消す。
  文が行を独り占めするときに限る。
  最初の行で前に、最後の行で後に、空白のほかの文字もコメントもなく、ほかの文、
  `;`、コメントが行を分け合わないときである。
  flowchart の、
  テキストを次の行に書いた `accTitle:` のように複数の行にわたる文は、
  そのすべての行と一緒に消す。
  ほかの文、`;`、コメントと行を分け合う文は消さない。
  `A --> B; accTitle: x` と `accTitle: style:#b;` はその行を保つ。
  重複では、mermaid.js は残った最後の説明かタイトルを使う（実行）。
  subgraph の中の説明は、Db では subgraph のメンバーでもあるので、
  消すとメンバーも変わる（実行）。
  fixture: それだけの行の文（出す）。
  行で後にほかの文がある文、`;` の後の文、行で後にコメントがある文（出さない）。
  テキストが次の行にある `accTitle:`（出す。両方の行を消す）。
- 前の文を消す: その後規則がこの文を報告しないときだけ出す（`accTitle: A`、
  `accTitle: A`、`accTitle: B` で 2 つ目の `A` を消すと、
  `B` が最初のものを置き換えたままで、基準 3 に反する。実行）。
  部分では、前の部分について同じである。
- eventmodeling の行の文を消す: `accTitle:` や `accDescr:` の行の形は、
  ふつう行でほかの文の後に書く（`eventmodeling accTitle: First`、
  `tf 01 evt Bought accTitle: Second`）。
  そうした行の文は前の ASCII の空白かタブを取り、
  その文字は行末か最初の `%%`
  までなので（`packages/spec/docs/diagrams/eventmodeling.ja.md` の共通の形）、
  前の文はその空白の前で終わる。
  そこでは、行でその文の後に何もないとき、その文を、前の空白とタブと一緒に、
  行終端を除いて行末まで消す。
  後に `%%` があるときは出さない。
  規則の invalid の fixture と eventmodeling のコーパスにある、
  そうした文をそう消すと、どれもパーサーと mermaid.js が受理し、
  mermaid.js はタイトルと説明のほかを前と同じに読む（実行）。
  fixture: ヘッダーの後（出す）、frame の後（出す）、
  後にコメントがあるもの（出さない）。
- 文の一部を消す（gitgraph-no-duplicate-option、radar-no-duplicate-option、
  quadrant-no-duplicate-style、venn-no-duplicate-style、
  usecase-no-duplicate-metadata、treeview-no-duplicate-annotation、
  no-duplicate-init-key、journey-no-empty-person）: その部分を、
  隣の区切り 1 つと一緒に消す。
  区切りが単独で残らず、一覧がその形を保つようにするためである。
  部分を `,` で区切る一覧（radar のオプション、quadrant と venn のスタイル、
  usecase の metadata、JSON のオブジェクトのメンバー、journey の人）では、
  その部分の前の `,` を消し、最初の部分ではその後の `,` を消す。
  どちらも、部分の側の隣の空白と一緒に消す。
  部分を空白で区切る一覧（gitgraph のオプション、
  ノードの行の treeview の注釈）では、その部分の前の空白を消す。
  文のただ 1 つの部分は、部分としては消さない。
  代わりに、文の条件で文を消す（radar のオプション、venn のプロパティ、
  usecase の更新）。
  `systemBoundary` の usecase の見出しでは、代わりに metadata のブロックを消す。
  境界の metadata はなくてよいと `packages/spec/docs/ast/usecase.ja.md`
  が書くので、文法はそれを許す。
  それだけの行にある treeview の注釈は、文の条件で、行ごと消す。
  結果は、それぞれの一覧の文法が許す形なので、ほかの確かめは要らない。
  gitgraph には、
  [references/suggestion-decisions.ja.md](references/suggestion-decisions.ja.md)
  のその規則に書く条件がある。
  fixture: 一覧の最初、途中、最後の部分（どれも区切りと一緒に出す）。
  文のただ 1 つの部分（文を消すか、文が行を分け合うなら出さない）。
  ノードの行の treeview の注釈と、それだけの行の注釈。
- 行終端をまたいで消すか詰める: 行終端を持つ範囲を消すか 1
  行に詰める書き換え（区切りの前後や括弧の中の、行をまたぐ空白、
  行をまたぐ文の一部、つなぐ行の前の改行）は、範囲にコメントがなく、
  範囲の最初と最後の行のほかの行が空か空白だけのときだけ出す。
  そうでないと、端の行をつなげたとき、コメントが後の文字を取るか、
  間の行が値に入ることがある。
  fixture: block-no-invalid-direction の `A<["x"]>(right`、`%% c`、
  `down)`（出さない。パーサーも mermaid.js も受理する。実行）と、
  `A<["x"]>(right ,`、空の行、` down)`（出す）。
- 空のブロックを消す: 文の条件で消す。
  flowchart では、空のブロックを消しても Db は変わらない（実行）。
  ディレクティブを持つブロックは、上のディレクティブの規則により消さない（実行。
  消すと、subgraph が `inheritDir` で得た方向を失う）。
  ブロックが説明を空にする図種（architecture、cynefin、gitgraph、packet、pie、
  radar、railroad、treemap、treeview、usecase、wardley）と、
  自分の文字を説明にする図種（eventmodeling）では、
  mermaid.js はそれから最後に残った説明を使い（実行）、
  no-duplicate-description が後の文を報告することがある。
  eventmodeling では、行の文と同じく、ブロックは行でほかの文の後にあり、
  後にほかの文が続くこともある（`eventmodeling accDescr {} tf 01 evt Bought`）。
  行の始めのブロックは拒否される（実行）。
  ただし `---` のブロックの後では行を独り占めし、文の条件が当たる。
  そこでは、ブロックを行で前にある空白とタブと一緒に消し、後にあるものは残す。
  規則の invalid の fixture と eventmodeling のコーパスにあるものと、
  問いから書いた入力（ヘッダーの後、frame の後、後に frame、`accTitle:`、
  コメントがあるもの、テキストの終わり、
  行をまたぐブロック）のブロックをそう消すと、
  どれもパーサーと mermaid.js が受理し、
  mermaid.js は説明のほかを前と同じに読む（実行）。
  fixture: それだけの行の空のブロック（出す）と、eventmodeling のほかで、
  行で文の後にあるもの（出さない）。
- ブロックをテキストの終わりで閉じる: `}`
  のないブロックが受理される図種（agentflow、flowchart、sequence、state、
  xychart）で、最後の行の後に `}` の行を足す。
  ブロックが `{` の行より後の行にテキストを持つときに限る。
  この書き換えは行を戻さない。
  閉じていないディレクティブを持つブロックには出さない。
  そのディレクティブから後は、
  ディレクティブが mermaid.js の読み方を決めるからである（実行。`d`、
  `more %%{wrap`、`A --> B` を持つブロックをテキストの終わりで閉じると、
  説明 `d` と `more --> B` になる）。
  テキストの終わりで開いたままの、`Long` と `text` の行を持つブロックは、
  テキストの終わりで閉じると、その 2 行を説明に持つ（実行）。
  見えるようにしうるもの: ブロックの前で説明を設定したときの
  no-duplicate-description（`accDescr: d` の後の `accDescr { x` を閉じると `x`
  になる。実行）。
  後の `}` が閉じるブロックも報告し、提案は出さない。
  `accDescr { first` の後の `B --> C`、`A{y}`、`D` の行は、説明 `first`、
  `B --> C`、`A{y` と頂点 `D` だけになる。
  `A{y}` の `}` がブロックを閉じるからである（実行）。
  条件は、ブロックのテキストが、ブロックの `{` より後の行に `{` を持ち、
  閉じる `}` がその行に単独でないことで、ブロックを閉じる `}` は、
  その行の形かデータブロックのもの（行をまたぐものも含む。`B{` の後の `y}`。
  実行）である。
  `}` の前にその行で空白とディレクティブしかないとき、後に何があっても、
  `}` はその行に単独である（`};`、`} C`。実行）。
  `accDescr {`、`uses { here`、`}` は書き手の `}` で閉じる。
  `{` の行の `}`（`accDescr { a { b }` は `a { b` になる）と、
  行に単独の `}`（`accDescr { x {` の後の `}` は `x {` になる）は、
  書いたとおりにブロックを閉じ、報告しない（実行）。

### 規則

規則ごとの書き換えと、どの書き換えを自動修正にするかは、
[references/suggestion-decisions.ja.md](references/suggestion-decisions.ja.md)
にある。
規則のものは、そのファイルを規則の名前と、
規則のまとまりの項目が図種の一覧とともに使う `<diagram>-<名前>` の形で検索し、
その図種の項目（`- class:`）も読む。

報告が、別の値のためにもう一度書いた要素、ラベル、名前で、
ありうる直しが新しい id や名前である規則は、基準 1 により提案を付けない。
2 つのつもりだったとき、2 つの一方を消すのは規則を黙らせるだけだからである。
報告が、1 つの要素にもう一度書いた設定、スタイル、オプションである規則は、
2 つの削除を付ける。

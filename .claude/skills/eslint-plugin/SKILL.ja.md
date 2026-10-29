---
name: eslint-plugin
description:
  Write, change, or remove the rule documents of @mmd-toolkit/eslint-plugin
  under packages/eslint-plugin/docs/rules/, and update them when a diagram type
  is added. Use when a rule has been decided and needs its document, when a
  document must follow a change of the tree or the fixtures, or when a diagram
  type is supported. Which rules exist is decided with the rule-ideas skill.
---

# 規則の文書の書き方（eslint-plugin）

`@mmd-toolkit/eslint-plugin` は、
Mermaid の図のテキストのための ESLint の言語プラグインである。
その規則の文書を、すべての主張を mermaid.js、 `@mmd-toolkit/parser` の木、
fixture で確かめて書く手順。
会話の履歴や記憶がなくても、この文書だけで同じ文書を書けるように書く。
規則の実装は、SKILL `eslint-plugin-rules` で扱う。
文書はそれぞれ `src/rules/` の規則のファイルに属し、それは 6 節で扱う。

## 方針と基準

パッケージ `packages/eslint-plugin` について成り立つこと:

- 規則は、図種ごとに、その図種の木が落ち着いたら実装し、
  リリースの前にすべてを実装する。
  規則の実装は、道具が使う形で木を試すことになる。
  規則が木から読めないものは、そのときに、木か parser を変えて解決し、
  規則の中でテキストを読み直すことでは解決しない。
  規則のほかに、規則に依らないもの（パッケージ、ESLint に木を渡す言語、
  それらのテスト）を持つ。
- どの規則も、`docs/rules/` に、規則の利用者のための文書を 1 つ持ち、
  `src/rules/` に規則のファイルを持つ。
  このファイルが、名前、説明、推奨かどうかを持ち、
  `docs/rules/index.md` の規則の一覧と、規則の文書の生成する部分は、
  このファイルから書く（`pnpm run update`）。
  `pnpm run lint:docs` は、規則のファイルと文書が食い違うと失敗する。
  まだ実装していない規則は、規則のアイディアである。
  その規則のファイルは何も報告せず、 `docs/rule-notes/` の文書が、
  実装に要ること、つまり、規則が報告するものが木にどう現れるかと、
  mermaid.js の読み方を記録した fixture を持つ。
  規則を実装したら、条件は規則のコードに、fixture は規則のテストに移り、
  その文書は取り除く。
- ESLint の言語プラグイン（プラグインの `languages`）であり、
  カスタムパーサーではない。
  `@mmd-toolkit/parser` の木、トークンとコメント、
  visitor keys を ESLint に渡す。
- 規則は木とトークンを読み、テキストを字句解析し直さない。
  規則が報告するものが木にどう現れるかは、
  条件を `parse()` の結果に当てて確かめる。

## 1. 最初に読むもの

1. 上の「方針と基準」の節と、
   rule-ideas の SKILL （`.claude/skills/rule-ideas/SKILL.md`）の基準。
   このパッケージが持つ規則と持たない規則、規則を共通にする条件。
   基準は変わるので、毎回読む。
2. SKILL `conventions`（`.claude/skills/conventions/SKILL.md`）。
   英語の文書と日本語の対、見えない文字を書かないこと、
   Prettier による文章の折り返し、
   Mermaid のテキストのコードブロックの info string は `mmd`、
   mermaid.js のソースへのリンクの書き方。
3. 木の定義: `packages/spec/docs/ast.md` と `packages/spec/docs/ast/<図種>.md`。
   規則の条件は、ここにあるノードの型、欄、トークンの種類で書く。
4. `packages/eslint-plugin/docs/rules/index.md` と、同じ種類の既存の文書 1 つ。
5. `packages/eslint-plugin/docs/development.md` の「Rules and their
   documents」の節。
   規則のファイル、文書のうちそれから生成する部分、
   コマンド `update` と `check:docs` が書いてある。

規則の採否、名前、範囲は、
先に rule-ideas の
SKILL（`.claude/skills/rule-ideas/SKILL.md`）の手順と基準で決める。
この手順は、そうして決めた規則の文書を書く。
確かめた結果、条件が成り立たない、木とトークンから見つけられない、
例が mermaid.js に拒否される、などが分かったら、
その規則は決めたとおりには書けない。
文書を書かずに、その根拠を持って規則の判断に戻る。

## 2. 文書の置き場所と規則の id

- 共通の規則: `docs/rules/<名前>.md` と `<名前>.ja.md`。
  id は `@mmd-toolkit/<名前>`。
- 図種の規則: 名前は図種で始める（`<図種>-<規則>`）。
  文書は、共通の規則と同じく `docs/rules/<名前>.md` と `<名前>.ja.md`。
  id は `@mmd-toolkit/<名前>`。
  `<図種>` は文書 `packages/spec/docs/ast/<図種>.md` の名前で、
  図種の id ではない。
  名前が `flowchart-` で始まる規則が、`flowchart-v2`、`flowchart-elk`、
  `swimlane` の規則である。
- 2 つの図種に同じ種類の問題があっても、構文とノードが違えば、
  それぞれの図種の接頭辞を付けて、同じ規則名の規則を 1 つずつ置く。

## 3. 文書の形

規則の文書は、規則を使う人のための文書で、文書サイトが公開する。
使う人が知りたいことに答える。
規則が何を報告するか、なぜそれが誤りか、似ていても報告しない形はどれかである。
形は、ESLint の規則の文書のものにする。
`no-unsafe-negation` や `no-unused-vars` の文書がそうである。
1 行の説明、短い動機、Rule Details、Options、あるときだけの節が、この順に並ぶ。
Rule Details は、文の後に、反するコードと従うコードの例を持つ。
形の各部分は、この前例から取る。
規則を実装するのに要ること（木での条件と fixture）は、規則を実装するまで、
もう 1 つの文書である規則の覚え書きに書く。
英語の規則の文書:

    # @mmd-toolkit/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Disallow ….

    <!-- begin auto-generated rule notice -->
    …
    <!-- end auto-generated rule notice -->

    <動機。1 段落>

    ## Rule Details

    <少数の短い文>

    Examples of **incorrect** code for this rule:

    ```mmd
    %% eslint @mmd-toolkit/<name>: error
    …
    ```

    Examples of **correct** code for this rule:

    ```mmd
    %% eslint @mmd-toolkit/<name>: error
    …
    ```

    ## Options

    This rule has no options.

    ## When Not To Use It               （本当に言うことがあるときだけ）

    ## Related Rules                    （関連する規則があるときだけ）

    - [<name>](./<name>.md)

    ## Further Reading                  （リンクがあるときだけ）

    - [<mermaid.js の文書の頁、issue、PR>](<link>)

    ## Resources                        （生成する。実装した規則だけ）

英語の規則の覚え書き。
規則の文書と同じ名前で、
`docs/rule-notes/` の下に置く（`docs/rule-notes/<name>.md`）。

    # @mmd-toolkit/<name>

    Japanese version: [<name>.ja.md](./<name>.ja.md)

    Notes for implementing the rule
    [@mmd-toolkit/<name>](../rules/<name>.md).

    The rule is not implemented yet. These notes are for implementing it.

    ## How the tree shows it

    ## Fixtures

日本語の規則の文書は同じ部分を持つ。
`英語版: [<名前>.md](./<名前>.md)`、`…を禁止する。`、`## 規則の詳細`、
`この規則に**反する**コードの例:`、`この規則に**従う**コードの例:`、
`この規則にはオプションがない。` を持つ `## オプション`、`## 使わないとき`、
`## 関連する規則`、`## 参考` である。
日本語の規則の覚え書きは、`英語版: [<名前>.md](./<名前>.md)`、
`規則 [@mmd-toolkit/<名前>](…) を実装するための覚え書き。`、
`この規則はまだ実装していない。` と `ここには、実装するときに要ることを書く。`、
`## 木での現れ方`、`## fixture` を持つ。
日本語の文書からほかの文書へのリンクは、その日本語版（`.ja.md`）に向ける。
英語版へのリンクの行が 80 列を超えるときは、「英語版:」の後ろで折る。

各部分の書き方:

- 題は完全な規則の id（共通の規則は `# @mmd-toolkit/<名前>`）。
  題が id を持つので、規則の id の行は置かない。
  題は生成する。
  新しい文書を書いたときも、1 行目は `update` が置き換える（6 節）。
- ほかの言語へのリンクの行は、リポジトリで読む人のためのもので、
  文書サイトはこれを出さない。
- 言語のリンクの行の次の段落は、
  Disallow で始まる短い 1 文（日本語では `…を禁止する。`）で、
  ESLint の規則の説明と同じ形にする。
  英語の文は、規則の `meta.docs.description` と一字一句同じにする。
  2 つが違うと、`check:docs` が失敗する。
  日本語の文は、`index.ja.md` での規則の説明になる。
  題とこの文の間には、箇条書きなど、ほかのものを置かない。
- 告知: 最初の段落の後の、
  `<!-- begin auto-generated rule notice -->` から
  `<!-- end auto-generated rule notice -->` までの部分で、
  `recommended` の設定がこの規則を有効にするかどうかと、
  自動修正を持つかどうかと、修正候補を出すかどうかを書く。
  これは生成する部分で、手で書いたり変えたりしない。
  新しい文書には `update` が入れる。
- 動機: 書き手が何を書き、mermaid.js がそれをエラーなしにどう扱い、
  なぜそれが誤りかを、平易な語で 1 段落に書く。
- 例: 規則の詳細の文の後に、「この規則に**反する**コードの例:」と、
  「この規則に**従う**コードの例:」を置き、それぞれの後に、
  info string が `mmd` のコードブロックを、1 つのブロックに 1 つの例で書く。
  共通の規則では、その前に、
  どの図種の例かを書く（「例は flowchart である。」）。
  例は、その誤りの普通の書き方にする。
  振る舞いを見るためだけに足した前置き（空の説明の前の説明など）は、例に入れず、
  fixture に記録する。
  行末の空白が要る例は、コードブロックに残らないので、文で書く。
  従う例には、条件の境界を示すものを選ぶ。
  正しい書き方と、条件が当たらない最も近いテキストである。
  従う例や、これらの例の組の外にあるものも含め、
  すべての `mmd` のコードブロックを `%% eslint @mmd-toolkit/<名前>: error`
  で始める。
  そのページが説明する規則の id を使い、字下げせず、
  図のヘッダーや Mermaid のディレクティブより前に置く。
  サイトで `twoslash-eslint` の診断を有効にするためで、読む人がコードを指すと、
  サイトが報告を見せる。
  `eslint-check` の fence マーカーや、表示側の既定の規則設定に頼らない。
  この先頭のコメントがないか違うと、英日とも `check:docs` が失敗する。
  このコメントより後は、fixture の入力を整形したもの（4 節の手順 4）にし、
  本文で例を引くときは、コードブロックのとおりに書く。
  フォーマッターが空白を入れるところは、`A-->B` ではなく `A --> B` と書く。
  行を指すときは、数えずに、その行が持つもので指す。
- 例はテストのケースである。
  規則のテストは英語の文書を読む。
  「Examples of **incorrect** code for this rule:」の行から「Examples of
  **correct** code for this rule:」の行までの `mmd` のコードブロックが、
  報告されるケースである。
  後の行から次の `## ` の見出し（`## Options`）までのものが、
  報告されないケースである。
  そのため、この 2 行は一字一句このとおりに、それぞれ 1 行で書き、
  反する例を先に置き、前の行から次の `## ` の見出しまでに、
  ほかの `mmd` のコードブロックを置かない。
  例の前に `###` の見出しも置かない。
  例がその小節に属して見えるからである。
  コードブロックは、ちょうど ` ```mmd ` である行で始め、
  ちょうど ` ``` ` である行で閉じる。
  日本語の文書の `mmd` のコードブロックが、
  英語の文書のものと同じ順に同じでないと、`check:docs` が失敗する。
  例の中でも外でも、Mermaid の例は、両方の文書に同じものを置く。
- 規則の詳細: 例の前に、少数の短い文で、規則を使う人の言葉で書く。
  - 対象の図種を、「この規則は、
    <名前>（<ヘッダー>）に当てる。」の 1 つの形で書く。
    名前は下の表のものである。
    ヘッダーには、仕様の図種の文書が定めるすべてのヘッダーを、「、」で並べる。
    その文書は `packages/spec/docs/diagrams/<diagram>.ja.md` である。
    「この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
    `swimlane-beta`）に当てる。」、「この規則は、クラス図（`classDiagram`、
    `classDiagram-v2`）に当てる。」のようにする。
    ヘッダーは、
    検出の一覧（`packages/spec/docs/detection.ja.md`）からは取らない。
    一覧が示すのは図種を選ぶ接頭辞で、`requirement` は要求図を選ぶが、
    ヘッダーは `requirementDiagram` である。
    `flowchart-v2` や `swimlane` のような、ヘッダーでない図種の id は使わない。
    共通の規則は「この規則は、すべての図種に当てる。」と書く。

    | 図種          | 名前                 |
    | ------------- | -------------------- |
    | agentflow     | agentflow 図         |
    | architecture  | アーキテクチャ図     |
    | block         | ブロック図           |
    | c4            | C4 図                |
    | class         | クラス図             |
    | cynefin       | Cynefin 図           |
    | er            | ER 図                |
    | eventmodeling | イベントモデリング図 |
    | flowchart     | フローチャート       |
    | gantt         | ガントチャート       |
    | gitgraph      | Git グラフ           |
    | journey       | ユーザージャーニー図 |
    | kanban        | カンバン             |
    | mindmap       | マインドマップ       |
    | packet        | パケット図           |
    | pie           | 円グラフ             |
    | quadrant      | 象限チャート         |
    | radar         | レーダーチャート     |
    | railroad      | レールロード図       |
    | requirement   | 要求図               |
    | sankey        | Sankey 図            |
    | sequence      | シーケンス図         |
    | state         | 状態図               |
    | timeline      | タイムライン         |
    | treemap       | ツリーマップ         |
    | treeview      | ツリービュー         |
    | usecase       | ユースケース図       |
    | venn          | ベン図               |
    | wardley       | Wardley マップ       |
    | xychart       | XY チャート          |

  - 規則が報告するもの。
  - 報告しない形のうち、規則を使う人が書きうるものと、その理由。
  - テキストの直し方は、それだけの部分にしない。
    従う例が示す。
    従う例で示せないときだけ、規則の詳細の文に含め、
    mermaid.js で確かめたものだけを書く。
  - 自動修正と修正候補には触れない。
    自動修正や修正候補があることは生成する告知が言い、候補が何をするかは、
    エディターが出す候補のメッセージが言う。
  - 図種によって言うことがある共通の規則は、規則の詳細の中の箇条に、
    そうした図種ごとに 1 項目で、見出しもコードブロックもなしに書く。
    図種に対応したら、要るところにその項目を足す（7 節）。
- オプション: オプションのない規則は「この規則にはオプションがない。」。
  この節は、規則がいま持つものだけを書く。
  後で足すかもしれないオプションは、規則の文書でなく、
  rule-ideas の SKILL に決定とともに記録する。
- 使わないとき（When Not To Use It）: 本当に言うことがあるときだけ書く。
  どの規則にも当てはまる文だけの節は作らない。
- 関連する規則: 関連する規則があるときだけ、リンクの箇条で書く。
- 参考（Further Reading）: 規則を使う人が読めるもの、
  つまり mermaid.js の文書の頁、issue、PR へのリンクの一覧だけを、
  散文なしで書く。
  mermaid.js のソースの permalink は、使う人向けではないので規則の文書に置かず、
  rule-ideas の SKILL の規則の記録に置く。
  そうしたリンクのない規則には、参考の節を置かない。
- どの文をどこに置くか。
  mermaid.js がすることについての文を、次に順に当てる。
  - 規則を使う人が書きうる形の中で、報告するものとしないものを分ける文は、
    規則の詳細に残す。
    一覧の各 id を見ること、
    mermaid.js が無名のリンクに付ける id を定義済みと数えること、
    頂点より前の文を報告しないこと、数を数として比べること、
    数を mermaid.js が描く上限までで比べること、などである。
  - mermaid.js の文書の頁、issue、PR は、参考にリンクとして置く。
    ソースの permalink は、rule-ideas の SKILL の規則の記録に置く。
  - ほかは消す。
    報告する形としない形を分けない mermaid.js の仕組みの説明、
    例が示すことの言い直し、規則を使う人が書かない形についての文、
    「It applies to <図種の id>」の定型である。
    そうした文が書いていた振る舞いは、規則の fixture とテストに残る。
- 語: 規則の文書は、mermaid.js がすることを、書き手が見るもので書く。
  何かを描く、何かを無視する、エラーを出す、である。
  「Db」「木」「トークン」と、mmd-toolkit のパーサーを主語にする文は使わない。
  木のノードの型、欄、トークンの種類は名指ししない。
  それらは規則の覚え書きに書く。
  mmd-toolkit がすることを書くときは、全体は mmd-toolkit、
  整形はフォーマッターと書き、「この道具」とは書かない。
  mermaid.js が誤りに対してすることは、「何も言わない」でなく、
  「エラーを出さない」のように書く。
  仕様の既知の差異へのリンクは、規則を使う人がその差異に出会う規則にだけ書く。
- 文は短くし、1 段落は 3〜4 文までにする。
- 規則の覚え書き: 「この規則はまだ実装していない。」と「ここには、
  実装するときに要ることを書く。」で始める。
  覚え書きは、規則を実装するまでのものである。
  実装したら、条件は規則のコードに、fixture は規則のテストに移るので、
  規則を実装する変更の中で、覚え書きを（英日とも）消す。
  覚え書きの一覧の fixture は、
  規則の fixture のディレクトリ `tests/fixtures/rules/<名前>/` に、
  `valid/<図種>/` か `invalid/<図種>/` の下の写しとして移る。
  写しの名前は fixture の名前による（`<名前>-input.mmd`）。
  テストは、写しが fixture の入力とバイト単位で同じことを確かめる。
  規則のためだけに書く入力は、`valid/` か `invalid/` の直下に置く。
  fixture のファイルに、
  `pnpm run lint:chars` が調べる文字は入れない（一覧は
  `packages/spec/docs/index.ja.md`）。
  それが要るコーパスの fixture は写さない。
  テストが不可視文字を含む入力を要するときは、
  テストのコードか JSON の fixture に、エスケープで書く。
  実際の文字を含む `.mmd` のファイルは置かない。
  規則が実装済みであるのは、次の 3 つの事実がそろうときである。
  `meta.messages` が空でないこと、
  テスト `tests/rules/<名前>.test.ts` があること、覚え書きが英日ともないこと。
  実装していない規則は、英日の覚え書きを両方持つ。
  これらが食い違うと、`check:docs` が失敗する。
  例は規則の文書に残り、テストは文書から例を読む。
- リソース: 実装した規則について、`update` が、
  規則のソースとテストへのリンクを置く節を、生成の印の間に書く。
  ESLint の規則の文書の Resources の節に当たる。
  手で書かない。
  index では、どの規則を実装したかを、規則の一覧の生成する列が示す。
  冒頭の文では述べない。
- 木での現れ方（規則の覚え書き）: 条件を、ノードの型、欄、トークンの種類と値、
  範囲で書く。
  共通の規則は、すべての図種が共有する木の部分（Root、そのトークン、コメント、
  ディレクティブ、共通の葉のノード）だけを使う。
  図種が補うものが要るときは、何が要るかをこの節に書き、その中身は、
  規則の詳細の図種の箇条に書く。
  木とトークンの外に出る部分は、そうと名指しし、それが生む設計上の論点を書く。
  ソースを読む（空白は木にない）、値を解釈する（ラベルの中の HTML）、
  埋め込みデータを読む（ディレクティブの引数）、
  Db の導き方を繰り返す（subgraph の id）、などである。
  木とトークンからまったく見つけられないときは、字句解析し直す方法を書かない。
  木がもっと示す必要があるなら、それは木の仕様の変更（spec の SKILL）であり、
  そうでなければ、その規則は持たない（rule-ideas の SKILL）。
- fixture（規則の覚え書き）: 「規則が依拠する mermaid.js の読み方は、
  `@mmd-toolkit/tests` の次の fixture に記録されている。」の後に、
  主張と例を裏付ける fixture を並べる。

## 4. 書く前と書いた後に確かめること

mermaid.js を動かし、テキストを parse し、整形するスクリプトは、
rule-ideas の SKILL（`.claude/skills/rule-ideas/SKILL.md`）の 4 節にある。
リポジトリの外に置き、`node <ファイル>` で動かす。
mermaid.js の呼び出しは直列で遅いので、入力が多いときは、
バックグラウンドで動かし、出力をファイルに書く。

1. mermaid.js の読み方: 各例を `packages/tests/src/mermaid.ts` の
   `runMermaid(text)` に掛ける。
   どの例も受理されなければならない（拒否される入力は構文エラーで、
   規則は報告しない）。
   Db の値は、文書に書いたとおりでなければならない。
2. 木での条件: 「木での現れ方」の条件を、
   `packages/parser/src/index.ts` の `parse(text)` の結果（`traverseNodes`、
   `root.tokens`、`root.comments`、`root.directives`）に当てるコードにして、
   反する例すべてに当たり、従う例のどれにも当たらないことを確かめる。
   境界の入力も足す。
   空白の有無、`\n` と `\r\n`、同じ行と次の行、ディレクティブ、コメント行、
   文字列の中、subgraph の中、`;` で区切った 1 行の複数の文である。
3. 整形: 反する例をすべて、整形のスクリプトで整形し、
   出力に mermaid.js の読み方が現れないことを確かめる。
   フォーマッターがすでに見えるようにするものの規則は、
   持たないからである（rule-ideas の SKILL の基準）。
   プラグインが import する `@mmd-toolkit/parser` は、ソースではなく、
   ビルドした `packages/parser/lib` に解決される。
   parser のソースが変わっていたら、
   先に `pnpm --filter @mmd-toolkit/parser run build` で lib を作り直す。
   作り直さないと、例が古い parser で整形される。
   反する例それぞれの整形の結果は、作業の結果（9 節）に含める。
4. 例と fixture: 各例の図の部分は、
   すべて `packages/tests/fixtures` の fixture から取り、
   その fixture の `input.mmd` を、
   prettier-plugin-mmd（既定のオプション）で整形した出力から、
   末尾に行終端子があればそれを除いたものにする。
   閉じていないディレクティブの中でテキストが終わるときは、
   出力は行終端子で終わらない。
   SKILL `conventions` は、
   Mermaid の例をフォーマッターが印字する形で書くとしている。
   整形は Db を変えないので、その fixture は、
   例を mermaid.js がどう読むかを記録している。
   示したいテキストを入力に持つ fixture を選び、
   その入力を整形のスクリプトで整形し、出力をそのまま使う。
   フォーマッターが行を書いたまま残すところも、出力のとおりにする。
   確かめ方は、fixture の入力を整形し、
   例の先頭の ESLint 設定コメントだけを除いて、出力と比べること。
   公開する例を parser やサイトの表示処理で確かめるときは、コメントも残す。
   スナップショットのテストヘルパーだけは、このコメントを除く。
   テスターが同じ規則を `rule-to-test/` の下で有効にするため、
   `@mmd-toolkit/` の下でも有効にすると、すべての報告が二重になるからである。
   公開する例の一部であり、コーパスの fixture の一部ではない。
   このコメントを足すために fixture を変更しない。
   例外は、空白の有無そのものが要点で、わざと書いたまま残す例だけで、
   そのときは文書にそう書く。
   prettier-plugin-mmd にその図種の printer がまだないときは、例を、
   その図種について決めた整形の方針の形で手で書き、 printer ができたら、
   その出力と例を比べる。
   方針がまだ決まっていなければ、
   flowchart の printer の形（ヘッダーの後の文を 1 段下げる）に合わせる。
   挙げる fixture の `expected.json` が文書の主張どおりであることを確かめる。
   例にする fixture は、従う例も含めて、 `accepted` が true のものだけにする。
   fixture のない例と主張には、SKILL `tests` の手順で fixture を足す。
   それを示す最小の入力と、その fixture が答える規則の文書の主張を添え、
   `pnpm run fixtures:add` で足して、
   mermaid.js
   の結果を記録する（`packages/tests/docs/maintaining-fixtures.md`）。
   そのうえで、parser に木を記録する（SKILL `parser`）。
   その `expected.json` を読み、規則の覚え書きの一覧に入れる。
   実装した規則には覚え書きがないので、規則のテストに入れる。
   文書の変更は、fixture ができるまで終わらない。

## 5. 書いた後の検査

1. 書いた文書に `npx prettier --write` を 2 回かけ、
   2 回目で何も変わらないことを確かめる。
2. `pnpm --filter @mmd-toolkit/eslint-plugin run update` を実行する（6 節）。
3. `pnpm run lint:docs`、`pnpm run format:check`、
   `pnpm run lint:chars` が通ること。
   `lint:docs` は、日本語の対と `check:docs` を確かめる。
   `check:docs` は、生成する部分、規則と文書の対応、
   英語の最初の段落と `meta.docs.description` の一致を確かめる。
4. 日本語の文書の改行は、書き手が書く。
   Prettier は書かれた改行を保つからである。
   `*.ja.md` は `proseWrap: "preserve"` である（SKILL `conventions`）。
   1 文を 1 行に書き、長い文は意味の切れ目の `、` の後で改行して、
   文章のどの行も 80 桁（全角は 2 桁と数える）を超えないようにする。
   表、コードブロック、切れ目のない長いリンクは数えない。
   規則の文書の最初の段落も、同じ決まりで書く。
   index は、行の切れ目に依らずにそれを読む。
5. 英語と日本語の文書で、コードブロックと fixture の一覧が同じであること。
   両方から、コードブロックの行と fixture を挙げた行を抜き出して比べる。
6. 挙げた fixture がすべて `packages/tests/fixtures` にあり、
   相対リンクの先がすべてあること。
7. 文書だけの変更では、この検査を動かし、
   テストは回さない（SKILL `conventions` の「テストの実行」）。
   例外は、テストが読むものを変えたときである。
   つまり、例（3 節の 2 行の後のコードブロック）か規則のファイルである。
   そのときは、
   `tests/rule-cases.test.ts` と規則のテスト `tests/rules/<名前>.test.ts`
   を回し、最初の段落と生成する部分のために `pnpm run check:docs` を動かす。
   どの変更にどのテストが対応するかは、
   SKILL `eslint-plugin-rules` の 4 節にある。

## 6. 規則のファイルと、生成する部分

文書はそれぞれ `src/rules/` の規則のファイルに属する。
2 つは、`docs/development.md` の「Rules and their documents」の節のとおり、
一緒に足し、名前を変え、消す。
まだ実装していない規則は、何も報告しない骨組みである。

- 規則のファイルから来るもの: 規則があること、その名前、
  英語の説明（`meta.docs.description`）、
  `recommended` の設定がそれを有効にするかどうか。
  規則を足す、名前を変える、消す、英語の文書の最初の段落を変える、のどれも、
  規則のファイルを変える。
- 実装していない規則のファイルでは、`recommended` は `false` である。
  規則を実装するときに、rule-ideas の SKILL の 7 節の判定から設定する。
  そこの判定がいったんの案なら、先に決め直す。
- `pnpm --filter @mmd-toolkit/eslint-plugin run update` が書くもの:
  すべての文書の題と告知。
  実装した規則の文書の末尾の、
  `<!-- begin auto-generated rule resources -->` から
  `<!-- end auto-generated rule resources -->` までのリソースの節。
  `index.md` と `index.ja.md` の、
  `<!-- begin auto-generated rules list -->` から
  `<!-- end auto-generated rules list -->` までのすべて。
  そこには共通の規則の表と図種ごとの表があり、行は英語の説明、
  日本語の文書の最初の段落、 `recommended` が有効にする規則の ✅、
  自動修正を持つ規則の 🔧、修正候補を出す規則の 💡、
  まだ実装していない規則の 🚧 を持つ。
  これらは手で書かない。
  日本語の文書の最初の段落を変えたら、`update` を実行する。
- index のうち手で書くもの: 生成する一覧より前の部分で、
  `recommended` が ✅ を付けた規則を有効にすると述べる文を持つ冒頭と、
  規則の id の節である。
  `recommended` に入れる基準は、index でなく `docs/development.md` に書く。
  どの規則を実装したかは、文ではなく、生成する一覧の 🚧 の列が示す。
- 文書を消したら、ほかの文書から参照が残っていないことを `grep` で確かめる。
- 規則は、SKILL `eslint-plugin-rules` で実装する。
  それは `docs/development.md` の「Writing a rule」の節に従う。

## 7. 図種に対応したとき

1. 規則の名前を、`packages/spec/docs/ast/<図種>.md` の名前 `<図種>-` で始める。
   index の図種の表は、その規則ができると `update` が生成する（6 節）。
   図種を `tools/rule-docs.ts` の `DIAGRAM_ORDER` に足す。
   場所は、
   サイトがサイドバーに使う `packages/docs/.vitepress/documents.js` の
   `diagramOrder` での位置である。
   2 つの順序が違うと `tests/rule-docs.test.ts` が失敗し、
   `DIAGRAM_ORDER` にない図種の規則があると `update` が失敗する。
2. 共通の規則ごとに、新しい図種の普通の書き方の例を mermaid.js に掛ける。
   ほかの図種と同じに振る舞い、その規則がその図種について言うことがあるなら、
   規則の詳細の図種の箇条に 1 項目（そこで起きること）を足し、
   その fixture を規則のテストに足す。
   振る舞いが違う、または木の共通の部分の 1 つの定義で扱えなくなったなら、
   その規則は共通の規則の条件（rule-ideas の SKILL の基準）を満たさない。
   図種の規則に移すのは規則についての判断なので、
   先に mermaid.js の結果を根拠に rule-ideas の SKILL で決め、
   それから文書を移す（8 節）。
3. その図種の規則の文書は、上の手順で書く。

## 8. 文書を消す、移す

- `rm` と普通の `mv` を使う。
  これに git（`git mv`、`git rm`、ステージの変更）を使わない。
  ステージはユーザーが行う。
- 文書を移すときは、規則の名前が変わる（6 節）。
  当たる図種を書いた規則の詳細の文と相対リンクを直し、`update` を実行する。
  題と index の行は `update` が書く。
- 規則の覚え書きは、規則の文書と一緒に移し、一緒に消す。
  移したら、その中の規則の文書へのリンクを直す。
  `update` と `check:docs` は `docs/rules/` だけを読み、覚え書きには触らない。

## 9. 作業の結果

作業の結果として次を示す。
書いたファイル、例ごとの条件の結果（当たる、当たらない）、
報告する例それぞれの整形の結果、足した fixture。
主張ごとに、実行して確かめたか、読んで確かめたか、確かめていないかを書く。

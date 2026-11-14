---
name: spec
description:
  Write and maintain the syntax specification under packages/spec/docs/ (the
  diagram documents, the tree documents, and the shared documents) and the
  fixtures that back its claims. Use when a diagram type is added, when a gap in
  the specification is found, for example while implementing the parser, when
  fixtures are needed to back a claim or a rule idea, and when mermaid.js is
  upgraded. Adding a diagram type has a skill of its own, spec-diagram-type,
  that uses this one.
---

# 仕様の書き方（spec）

`packages/spec/docs/` の仕様を、
すべての主張を pin した mermaid.js と fixture で確かめて書く手順。
図種を足すことは SKILL [spec-diagram-type](../spec-diagram-type/SKILL.ja.md)
にあり、この SKILL の節を使う。

## 方針と基準

`packages/spec`:

- 抽象構文木を定義する。
  `docs/ast.md` には、全図種に共通する部分を書く。
  トークン、コメント、ディレクティブの一覧を持つルート、トークンの種類、
  書き手が書いた値を持つ葉のノード、不変条件である。
  `docs/ast/<図>.md` には、図種ごとに 1 文書で、その図のノードを書く。
  図種のノード型の名前は、すべてその図種の名前で始める（`FlowchartVertex`、
  `FlowchartLink`）。
  ノード型は全図種で 1 つの名前空間を共有し、
  他の図種も同じ素の名前を使いたくなるため。
  トークンの種類と、共通の葉のノードは、どの図種でも同じ形なので、
  接頭辞を付けない。
  共通の葉のノードは、空白を含まない名前や引用符のない 1 語の `Identifier`、
  引用符で囲んだ文字列の `StringLiteral`、数の `NumericLiteral` である。
  空白を含みうる引用符なしのテキストは、図種ごとに読み方が違うので、
  図種のリテラルのノード（`FlowchartLiteral`）にする。
  空白を含みうる名前は、図種の名前のノード（`SequenceIdentifier`）にする。
  欄がどれを持つかは、その位置で文法が何を許すかで決まり、
  1 つの例の見た目では決めない。
  ESTree と同じく、書き手が書いた名前と値は、自分の範囲を持つ葉のノードにする。
  ツールがトークンを探さずに、それについて報告や書き換えをできるようにするため。
  文字列の欄にするのは、決まった集合の語（方向、形の名前、矢印の端の記号）だけ。
  矢印は、それ自体をノードにする（`FlowchartArrow`、`SequenceArrow`）。
  端の記号と線の種類をそのような欄として持ち、
  ツールが矢印の文字を読み直さずに済むようにする。
  ノードの型は、そのノードが何であるかを表し、
  テキストがどう字句解析されたかを表さない。
  トークンの種類ごとの型も、受け皿の型も作らない。
  ノードは汎用の `children` を持たない。
  句読点とキーワードはトークンとしてだけ現れる。
  書き手が書いて mermaid.js が読まないテキストは、
  ノードにできるところでは木のノードにする（`FlowchartIgnoredText`）。
  ノードにすることが、入力を拒否することより先で、
  そのようなテキストを理由に入力を拒否するのは、
  木の中に自分の置き場所がないときだけ。
  定義の出どころはここで、実装はこれに従う。
- 図種ごとに `docs/diagrams/<図>.md` の 4 節（判定、字句、文法と文法の外の拒否、
  既知の差異）を、mermaid の文法定義と Db クラスから書く。
  入力を受理するかどうかを決めるものは、ここで定める。
  mermaid.js が Db を組み立てる途中で決めるものも同じ。
- 仕様が定めるのは、構文と木の形（ノードの型、欄、値）である。
  木がトークンと位置をどう持つかは、
  parser の仕様（`packages/parser/docs`）である。
  記録した木を mermaid.js の Db とどう照らすかは、
  tests の文書（`packages/tests/docs`）である。
  仕様の文書は、parser のトークンと位置の仕様に言及しない。
  参照は、parser の文書から仕様への一方向である。
- 仕様の文書は、mermaid.js が入力を Db にどう読むかを書かない。
  既定値、値がどの項目に付くか、数や型の読み方、文が Db に何を足すか、
  Db での名前を書かず、
  tests パッケージの要約（`packages/tests/docs/db-summaries.md`、
  `packages/tests/docs/db-from-tree.md`）を引く。
  残すのは、入力を受理するかどうかを決める文（比較値と状態の更新を含む）、
  木の型と欄の値とその理由、字句の読みである。
- 仕様の主張ごとに fixture を用意する。
  fixture の追加は tests パッケージの生成器を使う。
- 仕様には版がある。
  `packages/spec` を変えたら、
  同じ pull request に `@mmd-toolkit/spec` の changeset を含める。
  版の上げ方は changesets スキルに従う。
- 仕様では一文字の記号や略号を導入しない。
  「_T_ をテキストとする」のような書き方、斜体の一文字の名前、添字を使わない。
  対象は毎回言葉で書くか、節の冒頭で意味の分かる語句に名前を付ける。
  一文字の記号は、文を読みにくくするだけである。
- 仕様にはプログラミング言語のコードを書かない。
  正規表現も TypeScript の型定義も書かない。
  mermaid.js の実装が正規表現であっても、受理条件は文と文法で書く。
  AST は表と文で定義し、型は言語に依存しない語（整数、文字列、
  ノードの列）で書く。

## 1. 最初に読むもの

1. 「方針と基準」の節、AGENTS.md（Project、Principles、Shared interfaces）、
   SKILL `conventions`。
   木は共有のインターフェースである。
   木を変えた結果には、parser、prettier-plugin、eslint-plugin が直す点を書く。
2. 作業の結果では、主張ごとに、実行して確かめたか（mermaid.js、parser）、
   読んで確かめたか（mermaid.js のソース、文書）、
   確かめていないかを区別して示す。
3. `packages/spec/docs/index.md` （適合、図種の文書の 4 節、書き方の約束、
   pin した commit）、`common.md`、`ast.md`、
   ほかの図種の `diagrams/<図種>.md` と `ast/<図種>.md`。
   木の原則とその理由は、`ast.md` の「設計の目標」と「共通の葉のノード」にある。
4. `packages/tests/docs/maintaining-fixtures.md`（fixture のコマンドと規則）と
   `packages/tests/README.md`（fixture の形）。

この SKILL と SKILL `spec-diagram-type` の手順が書くのは、`packages/spec/` と、
`@mmd-toolkit/tests` の道具を通した fixture である。
ほかのパッケージ（その文書、parser、フォーマッター）を直す必要が出たら、
そのパッケージの SKILL の手順で直す。

## 2. 道具

### 2.1 mermaid.js で入力を確かめる

pin した mermaid.js を入力の一覧に流すスクリプトは、入力の書き方と、
parser の結果と比べる仕方とともに、
[references/probe-scripts.ja.md](references/probe-scripts.ja.md) にある。
スクリプトの置き方と動かし方も、そこにある。

### 2.2 既存の fixture を探す

入力にあるテキストを含む fixture を挙げるスクリプトは、
[references/probe-scripts.ja.md](references/probe-scripts.ja.md) にある。

### 2.3 fixture を足す

`packages/tests` で（コマンドの全体は maintaining-fixtures.md）:

```sh
pnpm run -s fixtures:add-many <図種> <file.json> --dry-run
pnpm run -s fixtures:add-many <図種> <file.json>
pnpm run -s fixtures:set-note <notes.json>
pnpm run -s fixtures:set-divergence <divergences.json>
pnpm run -s fixtures:check
```

`<file.json>` は `{ "fixtures": [ { "name", "input", "accepted", "note" } ] }`。

- `accepted` には、確かめた結果を書く。
  mermaid.js と違っても止まらず、mermaid.js の結果が記録され、
  「disagree with the observation」として一覧に出る。
  出力は必ず最後まで読む。
- 同じ入力の fixture が既にあれば、その項目は飛ばされる。
- `note` は、仕様のどの節のどの規則の例か（`flowchart.md Strings: …`）と、
  何が起きるかを書く。
  理由まで仕様と照らし、注記は `fixtures:set-note` で直す。
- 共通の規則の例は `common`、図種の例は図種のディレクトリに置く。
  名前は、規則の種類と、入力が示すことで付ける。
  規則の種類は、`lex-`、`gram-`、`db-`、`tokens-`、`config-`、`entity-`、
  `comment-`、`directive-` など、既存の名前に合わせる。

### 2.4 仕様の文書を確かめる

書いた後に毎回、
リポジトリのルートで次を通す（SKILL `conventions`
の「[テストの実行](../conventions/SKILL.ja.md#テストの実行)」）。

```sh
npx prettier --write packages/spec
npx prettier --check packages/spec
pnpm run -s lint:md
pnpm run -s lint:docs
pnpm run -s lint:chars
```

`pnpm run lint:md` は、リンクかそのアンカーが何も指さないときに失敗する。
`pnpm run lint:docs` は、
仕様と parser と tests の文書の fixture の引用が何も指さないとき、
これらの文書と整形ツールの文書で、
引用が引用の段落か `Fixtures` のセルの外にあるとき、
mermaid.js へのリンクが pin した commit を指さないとき、
英語の原本のない `.ja.md` があるときに失敗する。
pin した commit は `packages/spec/docs/index.md` に記録してある。
検査は、順に `scripts/check-doc-citations.mjs`、
`scripts/check-mermaid-links.mjs`、`scripts/check-ja-docs.mjs` にある。
引用の検査は `[fixture:` の後で折り返された引用も読み、
行ごとの検索はそれを取りこぼす。
日本語版が無い文書、英語版より古い日本語版、
引用か見出しの構造が違う日本語版（behind）は、一覧するだけである。
仕様の文書がそうなら、そのとき日本語版を、同じ引用と見出しの構造で書く。

`packages/tests` で `pnpm run -s fixtures:check` も通す（fixture
を足したとき）。
すべての fixture を mermaid.js で読み直し、
記録した結果と違うものがあれば失敗する。

ほかのパッケージのテストは回さない。
`packages/parser/tests/types.test.ts` は `docs/known-divergences/`
の文書を並べるので、それを足したか除いたときは、出力（7 節）にそう書く。

### 2.5 文書を書き換えるスクリプト

長い段落の書き換えは、
リポジトリの外の作業用のディレクトリに置いた Python のスクリプトで行い、
英語と日本語を同じスクリプトで直す。

- Prettier が文章を 80 桁で折り返すので、置き換えの目印は、
  語の間の空白を「1 個以上の空白（改行を含む）」として照合する。
  目印がちょうど 1 か所に当たることを確かめ、当たらなければ何も書かずに止める。
- ファイルごとに、すべての置き換えが済んでから書く。
  途中で止まったときは、どのファイルが書かれたかを確かめ、
  書かれたファイルの分を外してから流し直す（二重に足さない）。
- バッククォートを含む例のコードスパンは、
  2 重のバッククォートで囲む（``A["`x`"]``）。
  1 重のままだと、Prettier が前後の空白を詰めて壊す。
  書いた後に、描画した形を一度確かめる。

## 3. mermaid.js を読む

ソースは、pin した版のタグの mermaid.js の clone で読む。
作り方は `tools/README.md` にある。
仕様からのリンクは、
すべて `packages/spec/docs/index.md` に記録した commit の permalink にする。

文法は、
図種のエンジンに合った手順で読む:
[references/reading-jison.ja.md](references/reading-jison.ja.md)、
[references/reading-chevrotain.ja.md](references/reading-chevrotain.ja.md)、
[references/reading-langium.ja.md](references/reading-langium.ja.md)。

## 4. 木のノードを足す

`docs/ast/<図種>.md` と `.ja.md`。

図種名とノードの接頭辞は、
[conventions](../conventions/SKILL.ja.md#コード) の規則に従う。

1. 各ノードの型について、欄の表（型は言語に依らない言葉で書く。セルは短く、
   長い説明は表の下）、子の欄（たどる順）、範囲を書く。
   範囲は各ノード自身の書かれた形で述べ、
   そのノードが許す始まりと終わりだけを書く。
   子の欄は `ast.md` の Nodes の 2 つの文のどちらかで書く。
   英語では ``Child fields: `a`, `b`.`` か `No child fields.`、
   日本語では ``子の欄: `a`、`b`。`` か `子の欄はありません。` である。
2. 葉のノードの型は、その位置で文法が許すもので決める（「方針と基準」の節、
   ast.md の Shared leaf nodes）。
3. ノードの形は、書く前に、図種の全体について 1 回で決める。
   まず、リポジトリの外に案を書く。
   案には、すべてのノードの型とその欄と、判断が要る点を挙げる。
   判断が要る点は、次のように分ける。
   名前、mermaid.js が読まないテキストをノードにするか拒否するか、
   既知の差異の候補、共通の部分（`ast.md`、`common.md`、
   共通の葉のノード）の変更。
   共通の部分の変更は、[10 節](#10-共通の木を変えるとき) のとおりに行う。
   原則と、木を使う側（parser、prettier-plugin、eslint-plugin）への影響を、
   全体で見て決める。
   原則は、「方針と基準」の節と、
   `ast.md` の「設計の目標」と「共通の葉のノード」にある。
   原則が選択を残すところでは、選択肢と例、根拠（原則、mermaid.js の読み方、
   fixture）、推奨を示して決定を求め、選ばれた形を書く。
   決めたら、すべての欄を原則と照らす。
   決めた形が原則や mermaid.js と食い違うと分かったら、
   変える前に根拠を添えてそれを示す。
4. 値は範囲のテキストで、値のトークンと範囲は、
   mermaid.js が値として読むテキストを、
   mermaid.js が読む空白を含めて覆う（ast.md の Nodes と Tokens）。
   sequence のタイトル、class のジェネリクスの型、
   flowchart の `,` の後のスタイルは、その空白を持つ。
   mermaid.js が読むものがほかのノードをまたぐために、
   どのトークンも持てないところだけ、`ast/<diagram>.md` の欄の説明に理由を書く。
   Db がそれをソースから読むことは、
   `@mmd-toolkit/tests` の `docs/db-from-tree/<図種>.md` が書く。
   それは tests-tree-checks のスキルの手順で書く。
   flowchart の例: subgraph の名前のすぐ後の空の説明ブロックの間の空白。

## 5. 主張と fixture を対応させる

主張を 1 つ書くたびに:

1. mermaid.js で確かめる（2.1）。
2. 既存の fixture を探す（2.2）。
   同じ入力か、同じことを記録する入力があれば、それを引く。
   そう判断するときは、`expected.json` と、
   差異が必要とする `specified.json` の `accepted` と値まで読む。
   入力の見た目だけで判断しない。
3. なければ足す（2.3）。
   対照の例（規則が当たらない最も近い入力）も足す。
4. 仕様の文の後ろの、その文の引用の段落に、
   `[fixture: <category>/<name>]` で引く（スキル conventions の「文書」）。
   英語と日本語の両方に、同じ集合を引く。
5. mermaid.js と仕様の判断が違う入力（Known divergences）には、
   `fixtures:set-divergence` で識別子を付ける。
   どの識別子かは、known-divergences.md の定義に当てはめて決め、
   同じ種類の既存の fixture に合わせる。
6. ほかのパッケージの作業が corpus の場合を要るときは、
   入力を別の fixture に写さず、既存の fixture を引用する。

## 6. 規則を確かめる

手で書いた、規則のふつうの形の例だけで規則を決めない。
仕様の文が分ける場合から決める。

1. 文ごとに場合を挙げる。
   ふるまいを定める文ごとに、その文が分ける場合と、
   その文が名指す場所で接するほかの規則の場合を挙げる。
   接する規則は、
   [AGENTS.md の「行動原則」](../../../AGENTS.ja.md#行動原則) が挙げるもの。
   場合ごとに、文についての 1 つの問いに答える入力を 1 つ書く。
   場所と文字列の積は書かず、乱数や数（シード、件数）で入力を選ばない。
2. 場合ごとに、mermaid.js と、
   parser の `parse()` と `dbOf()` で 1 回確かめる（2.1）。
   parser がまだ読まない図種では、mermaid.js の結果を、文が言うことと比べる。
   そのうえで、場合ごとに、文が引く fixture を持たせる（5 節）。
   場合ごとに少なくとも 1 つを引き、同じ場合の fixture を全部は引かない。
3. 文が説明しない場合を種類に分け、種類ごとに 1 つの規則で説明する。
   例外を足していく形ではなく、mermaid.js の仕組みを 1 つの規則として書く。
   flowchart の例: mermaid.js がトークンを読まず、木に置く場所もない空の文字列、
   空の呼び出し、空の説明ブロックは、それらが現れるどの場所についても、
   場所ごとの規則ではなく、1 つの既知の差異として扱う。
4. 受理・拒否は 1 つの基準で決める（AGENTS.md の Project 1
   と「方針と基準」の節）。
   mermaid.js が受理・拒否するものを受理・拒否し、
   受理した入力には mermaid.js の Db を与える。
   書き手が書き、mermaid.js が読まないか、書き手の意図と違って読むテキストは、
   ノードで持ち（8 節の項目 2）、入力を受理する。
   sequence の例: `title` の後に改行があると、次の行を題として読む。
   `create destroy A` は A を作る。
   そのような入力は、mermaid.js の結果とともに lint の規則の候補として挙げる。
   mermaid.js の読み方が何から来るにせよ、ノードで持てないところだけ、
   入力を拒否するか、違って読む直接の規則を書き、
   既知の差異として提案する（8 節）。
   sequence の例: `%%` から始まるコメントは、その前の文字を取らない。
5. 形を新しい場所で受理する前と、規則を一般化する前に、
   規則が当たるところを挙げ、それから書く。
   挙げるものと、書く前に確かめることは、
   [references/accepting-a-form-in-new-places.ja.md](references/accepting-a-form-in-new-places.ja.md)
   にある。

6. 仕様の規則が、不具合に見える mermaid.js の挙動に依るとき（既知の差異や、
   意外な読み方）は、
   mermaid-js/mermaid の issue と PR を `gh` で（サンドボックスの外で）探す。
   検索語は 2〜3 語の短いものにする。
   長いと何も見つからない。
   見つかったものは番号で引き、事実だけを書く（題、状態、ラベル、
   報告している内容、確かめた日付）。
   状態は、ラベルと返信の事実で書く。
   `Type: Bug / Error` のような、報告の書式が付けるラベルを、
   メンテナーの判断として書かない。
   承認された、不具合だ、と書くのは、`Status: Approved` のラベルがあるか、
   メンテナーの返信がそう述べるときだけにする。
   見つからなければ、使った検索語とともに報告し、仕様には挙動だけを書く。

## 7. 出力

作業の結果として、変えた節、足した fixture の名前、parser が直す点（受理、
トークン、Db の導出）、parser に `ast.json` が要る fixture を示す。

出力には、ほかのパッケージの次の手順も示す。

- `checkTree` は、[tests-tree-checks](../tests-tree-checks/SKILL.ja.md)に従う。
- 差異の形の検査は、
  [parser §6](../parser/SKILL.ja.md#6-fixture-が足されたとき規則が変わったとき)
  に従う。
- printer の作業は、[prettier-plugin](../prettier-plugin/SKILL.ja.md)に従う。
- Db に載らない構文は Db の一致では保持を確かめられないため、
  独立した木の検査と、整形の期待出力全体を比べる fixture を求める。

## 8. 既知の差異を提案するとき

既知の差異の提案には、新しい識別子でも、既存の識別子への入力の追加でも、
次の 4 つの答えを書く（AGENTS.md の Project 1）。
答えのない提案は、決めない。

1. **テキスト。**
   mermaid.js が読まない、捨てる、書かれたものと違う意味で読むテキストは何か。
   その範囲（どこからどこまで）も書く。
2. **ノード。**
   木がそれをどう持つか。
   どのノードのどの欄か、ほかのどの形か。
   木にすでにある形は次のとおり。
   - 読まれないテキストのノードを持つ欄: 方向の文と、
     `ClassMethod` の `textBefore` と `textAfter`、
     state の文の `textBefore…` と `textAfter…` の欄（`textBeforeId`、
     `textAfterDescription`、state の別名の `textAfter` など）。
   - 文: 文が始まるところか、文の区切りの前の空の説明ブロックと、
     `StateIgnoredStatement` や `SequenceIgnoredStatement` のような、
     読まれないテキストの文。
   - どの値にも入らない文字: 行の規則が無視する `;`。
   - トークンを断片に切るトリビア: `String` のトークンを `StringFragment`
     のトークンに、
     `RawText` のトークンを `RawText` のトークンに切るコメントの領域と、
     `String` か `RawText` のトークンの中の、
     それを同じように切るディレクティブ。
3. **確かめ。**
   そう持ったとき、受理・拒否と Db が mermaid.js と一致するかを、
   テキストが分ける場合ごとの fixture で確かめる。
   入力での mermaid.js と、そのテキストを除いた入力での mermaid.js を比べるか、
   木が読むとおりに mermaid.js が読む、ほかの参照の入力と比べる。
4. **妨げ。**
   ノードで持てないところだけ書く。
   木の言葉での理由（テキストを置ける位置がない、値を変えることになる）か、
   mermaid.js と一致する規則が、そのパイプラインの順の写しになる理由。
   誰も書かないこと、mermaid.js が読まないことは、答えにならない。

新しい差異は、それだけの文書 `known-divergences/<識別子>.md` と、
その `.ja.md` で定め、known-divergences.md の表に行を足す。
文書は、known-divergences.md が挙げる部分を持つ（構文、例のある差異、
書き手にとっての結果、mermaid.js がそう読む理由、規則とその理由、
見つかったときの mermaid.js の文書と issue）。

- 差異の文書に図種の段落を足すときは、「mermaid.js の文書と issue」の節にも、
  その図種の項を足す。
- `embedded-data-opaque` は、
  [比較する Db](../../../packages/spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)
  と、
  [DIVERGENCE_PROPERTIES](../../../packages/tests/src/fixture-acceptance.ts)
  に従う。

差異の文書（`known-divergences/<identifier>.md`）は、「この仕様の規則と、
その理由」の節で、そのテキストをノードで持たない理由を述べる。

## 9. 仕様の欠落が見つかったとき

手順と、fixture だけが要るときに示すものは、
[references/gaps.ja.md](references/gaps.ja.md) にある。

## 10. 共通の木を変えるとき

木の共通の部分（`ast.md` の根、トークンの種類、コメント、ディレクティブ、
フロントマター、共通の葉のノード、不変条件）の変更は、すべての図種と、
木を読むすべてのパッケージに効く。
[references/changing-the-shared-tree.ja.md](references/changing-the-shared-tree.ja.md)
の手順で、1 回で行う。

## 11. mermaid.js を更新するとき

手順は [references/upgrading-mermaid.ja.md](references/upgrading-mermaid.ja.md)
にある。

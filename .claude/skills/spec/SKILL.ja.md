---
name: spec
description:
  Write and maintain the syntax specification under packages/spec/docs/ (the
  diagram documents, the tree documents, and the shared documents) and the
  fixtures that back its claims. Use when a diagram type is added (step 3 of the
  plan), when a gap in the specification is found, for example while
  implementing the parser, when fixtures are needed to back a claim or a rule
  idea, and when mermaid.js is upgraded.
---

# 仕様の書き方（spec）

`packages/spec/docs/` の仕様を、
すべての主張を pin した mermaid.js と fixture で確かめて書く手順。
会話の履歴や記憶がなくても、この文書だけで同じ品質で進められるように書く。
方針と基準はここに書かず、AGENTS.md と仕様の文書を指す。

## 1. 最初に読むもの

基準は変わるので、作業を始めるたびに読む。

1. AGENTS.md
   - Project: 正しさの基準と、Known divergences の例外。
   - `packages/spec` の節: 木の定義の原則
     （ノードの型の名前、共通の葉のノード、型は位置で文法が許すもので決める）、
     5 節、すべての主張に fixture、
     記号を作らない、仕様にコードを書かない。
   - Principles: 日英の対、見えない文字、Prettier の折り返し、
     Mermaid のテキストのコードブロックは `mmd`、
     mermaid.js のソースへの permalink。
   - Shared interfaces: 木の定義は parser、prettier-plugin、
     eslint-plugin が使う。
     そのため、変えることはそれらのパッケージの変更でもあり、作業の結果に、
     それぞれが直す点を書く。
2. 作業の結果では、主張ごとに、実行して確かめたか（mermaid.js、parser）、
   読んで確かめたか（mermaid.js のソース、文書）、
   確かめていないかを区別して示す。
3. `packages/spec/docs/index.md`
   （文書の構成、図種の文書の 5 節、書き方の約束、pin した commit）、
   `common.md`、`ast.md`、
   既存の図種の `diagrams/<図種>.md` と `ast/<図種>.md`。
   木の原則とその理由は、`ast.md` の「設計の目標」と「共通の葉のノード」にある。
4. `packages/tests/docs/maintaining-fixtures.md`（fixture のコマンドと規則）と
   `packages/tests/README.md`（fixture の形）。

この SKILL の手順が書くのは、`packages/spec/` と、
`@mmd-toolkit/tests` の道具を通した fixture である。
ほかのパッケージ（その文書、parser、フォーマッター）を直す必要が出たら、
そのパッケージの SKILL の手順で直す。

作業ツリーをほかの作業と共有しているときは、
git の操作（コミット、ステージ、ステージを戻す、`git mv`）をせず、
ほかの作業が編集中のファイルに触らず、
追跡されているファイルを一時的に書き換えない。

## 2. 道具

スクリプトはリポジトリの外の作業用のディレクトリに拡張子 `.mts` で置き、
`node <ファイル>` で動かす。
Node は TypeScript をそのまま、どのディレクトリからでも実行する。
リポジトリの外からはパッケージ名が解決されないので、
スクリプトはソースファイルを絶対パスで import する。
下のスクリプトの `<repo>` は、リポジトリのルートの絶対パスに置き換える。
Node は消せる型だけを取り除く。
型だけの import は `import type` で書き、
`enum`、`namespace`、引数のプロパティは使わない。
mermaid.js の呼び出しは直列で遅い
（1 件に数十ミリ秒、fixtures:check の全件で 1〜2 分）。
入力が多いときはバックグラウンドで動かし、出力をファイルに書く。

### 2.1 mermaid.js で入力を確かめる

```ts
// Runs the pinned mermaid.js on each input of a JSON file of the form
// { "<key>": "<input>" } and prints whether it is accepted, with the Db summary
// or the error:
//   node <this file> <inputs.json>
import { readFileSync } from "node:fs"
import { runMermaid } from "<repo>/packages/tests/src/mermaid.ts"

const inputs: Record<string, string> = JSON.parse(
  readFileSync(process.argv[2]!, "utf8"),
)
for (const [key, input] of Object.entries(inputs)) {
  const outcome = await runMermaid(input)
  const result = outcome.accepted
    ? JSON.stringify(outcome.db)
    : `rejected: ${outcome.error.name}: ${outcome.error.message.split("\n")[0]}`
  console.log(`${key}\t${JSON.stringify(input)}\n  ${result}`)
}
```

入力の JSON は、手で書かずにスクリプトで書く。
行末の空白、タブ、`\r` が正確に入る。
書いた後、`od -c` でバイトを確かめる。

木と Db の導出（parser の側）と比べるときは、
`<repo>/packages/parser/src/index.ts` の `parse` と
`<repo>/packages/parser/tests/helpers/db.ts` の `dbOf`
を同じスクリプトから読み込む（読むだけ。parser のファイルは編集しない）。
`dbOf` には、同じテキストについて
`<repo>/packages/tests/src/mermaid.ts` の `resolveEmbeddedData` が返す値を渡す
mermaid.js がテキストを拒否するときは、それは undefined を返す。

### 2.2 既存の fixture を探す

```ts
// Lists the fixtures whose input contains a text, with what mermaid.js did:
//   node <this file> "<text>"
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

// The fixture directories; add a diagram type here when its directory exists.
const diagrams: DiagramType[] = ["common", "flowchart"]

const wanted = process.argv[2]!
for (const diagram of diagrams) {
  for (const fixture of await loadFixtures(diagram)) {
    if (!fixture.input.includes(wanted)) continue
    const outcome = fixture.expected.accepted
      ? `accepted ${JSON.stringify(fixture.expected.db)}`
      : `rejected ${fixture.expected.error.name}`
    const divergence = fixture.knownDivergence ?? "none"
    console.log(
      `${diagram}/${fixture.name} (divergence: ${divergence})\n  ${JSON.stringify(fixture.input)}\n  ${outcome}`,
    )
  }
}
```

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
  理由まで仕様と照らす（7 節）。
- 共通の規則の例は `common`、図種の例は図種のディレクトリに置く。
  名前は、規則の種類と、入力が示すことで付ける。
  規則の種類は、`lex-`、`gram-`、`db-`、`tokens-`、`config-`、`entity-`、
  `comment-`、`directive-` など、既存の名前に合わせる。

### 2.4 仕様の文書を確かめる

書いた後に毎回、リポジトリのルートで次を通す。

```sh
npx prettier --write packages/spec
npx prettier --check packages/spec
pnpm run -s lint:docs
pnpm run -s lint:chars
```

`pnpm run lint:docs` は、日英の対のほかに、仕様の文書のリンク、アンカー、
fixture の引用（`[fixture:` の後で行が折り返されたものも読む）、
日英の引用の集合、見出しの構造を確かめる（`scripts/check-spec-docs.mjs`）。
検査の対象の文書の mermaid.js へのリンクが、
すべて `packages/spec/docs/index.md` に記録した commit
を指していることも確かめる（`scripts/check-mermaid-links.mjs`）。

`packages/tests` で `pnpm run -s fixtures:check` も通す
（fixture を足したとき）。

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
- 書いた後に `npx prettier --write` で折り返し直す。
- Write ツールとシェルのヒアドキュメントは `\uXXXX`
  を実際の文字に変えることがある。
  見えない文字は文書に書かない（AGENTS.md）。
  書いた後に `pnpm run lint:chars` を通す。
- バッククォートを含む例のコードスパンは、
  2 重のバッククォートで囲む（``A["`x`"]``）。
  1 重のままだと、Prettier が前後の空白を詰めて壊す。
  書いた後に、描画した形を一度確かめる。

## 3. 図種を足すとき（工程 3）

入力: その図種の工程 1 と 2
（Db の正規化関数と、fixture の収集。tests の SKILL）が済んでいる。

### 3.1 mermaid.js を読む

pin した版の mermaid.js のソースを、リポジトリの外に置く。
pin した版のタグで clone する。
手順は、tools/README.md の、入力を集めるための clone の手順と同じ。
仕様からのリンクは、
すべて `packages/spec/docs/index.md` に記録した commit の permalink にする。

#### Jison の図

1. 文法の定義（`*.jison`）の字句の規則を、上から順に読む。
   決めることは次のとおり。
   - 排他状態（`%x`）と、状態を書かない規則（初期状態だけで当たる）、
     `<*>` の規則。
     `<*>` の規則はすべての状態で当たるが、
     ファイルでそれより前にある、その状態の規則が先に当たる。
     flowchart の例: 文字列の規則 `<*>["]` は、
     click の状態と dir の状態でも当たった（仕様の欠落になった）。
   - トークンを返さない規則。
     flowchart の例: `"click"[\s]+` は状態に入るだけで、
     語 `click` は文法に見えない。
     仕様ではそれを `click` の単位にし、クリックの文を始めるだけにした。
     mermaid.js がそれをほかの位置で、何もないものとして、
     あるいはたまたま文法が受け付けるクリックの id として読む入力は、
     既知の差 `click-reserved-word`（known-divergences.md）にした。
     `""`、空の括弧の付いた `call`、`accDescr {}` の規則も、
     トークンを返さないので、
     mermaid.js はこれらの空の形を多くの場所で受理する。
     これらは値の中にも、どの 2 つの単位の間にも現れ、
     木にはそこにそれらを置く場所がない。
     そのため、仕様では、文法が受け付けない単位として読み、
     既知の差 `tokenless-empty-forms` にした。
     読まれないことは、拒否する理由にならない。
     方向の文の周りで mermaid.js が捨てるテキストは、
     FlowchartIgnoredText のノードで、
     文が始まる位置の空の説明ブロックは文である。
   - 空の文字列に一致しうる規則（`[^\s\n]*` など）。
     テキストの終わりで空のトークンを返し、入力を拒否させる。
   - `[\s]+` のように改行を含む空白の規則。
     mermaid.js が末尾に足す改行まで取る（common.md の End of text）。
2. 文法の規則と、各規則の動作（Db の関数の呼び出し）を読む。
3. Db のクラスを読む。
   素のオブジェクトをキーの集合として使う箇所（`hasOwnProperty`、`__proto__`）、
   `Object.assign` とスプレッドの違い、正規表現による書き換え、
   例外を投げる箇所（文法の外の拒否）を探す。
   テキストではなくブラウザに依る値（`window.CSS` や `document`）も探す。
   sequence の例: box の色。
   そのような値は木では決めず、サイトの設定と同じく、
   外から与える値として Db の正規化に書く。
4. 前処理の順序（common.md の Reading a source）と、
   検出（detection.md）を確かめる。

#### Langium の図

pie のときに書く。

### 3.2 図種の文書を書く

`docs/diagrams/<図種>.md` と `.ja.md` を、
index.md の「How to read a diagram document」の 5 節で書く。

1. Detection: detection.md の該当の検出器を指す。
2. Lexical structure: 単位と文脈を、各文脈の規則の一覧（適用する順）で書く。
   flowchart.md の「Units and contexts」が形の例。
3. Grammar: common.md の Notation で書く。
   各規則がどのノードを作るかを表にする。
4. Db normalization: tests の正規化関数の項目と一致させる。
   値ごとに、木のどの欄とソースのどこから導くかを書く。
5. Known divergences: known-divergences.md の識別子のうち、
   この図種に当たるものと、
   それがこの図種でどう現れるか。
   新しい差は known-divergences.md で定め、その表に行を足す。

### 3.3 木のノードを足す

`docs/ast/<図種>.md` と `.ja.md`。

1. 各ノードの型について、
   欄の表（型は言語に依らない言葉で書く。セルは短く、長い説明は表の下）、
   子の欄（たどる順）、範囲、トークンを書く。
2. トークンの表で、文法のすべての単位に、トークンの種類と項目を与える。
3. 葉のノードの型は、
   その位置で文法が許すもので決める（AGENTS.md、ast.md の Shared leaf nodes）。
4. ノードの形は、書く前に、図種の全体について 1 回で決める。
   まず、リポジトリの外に案を書く。
   案には、すべてのノードの型とその欄と、判断が要る点を挙げる。
   判断が要る点は、次の 4 つに分ける。
   名前、mermaid.js が読まないテキストをノードにするか拒否するか、
   既知の差の候補、
   共通の部分（`ast.md`、`common.md`、共通の葉のノード）の変更。
   原則と、木を使う側（parser、prettier-plugin、eslint-plugin）への影響を、
   全体で見て決める。
   原則は、AGENTS.md の `packages/spec` の節と、
   `ast.md` の「設計の目標」と「共通の葉のノード」にある。
   原則が選択を残すところでは、
   選択肢と例、根拠（原則、mermaid.js の読み方、fixture）、
   推奨を示して決定を求め、選ばれた形を書く。
   決めたら、すべての欄を原則と照らす。
   決めた形が原則や mermaid.js と食い違うと分かったら、
   変える前に根拠を添えてそれを示す。
5. 値は範囲のテキスト（ast.md の Nodes）。
   範囲の外の空白が mermaid.js の結果に効く箇所は、値に入れず、
   Db の手順がソースから読むと書く。
   flowchart の例: スタイルの Db のテキスト、
   subgraph の名前のテキスト（名前の前と後の空白）。

### 3.4 主張と fixture を対応させる

主張を 1 つ書くたびに:

1. mermaid.js で確かめる（2.1）。
2. 既存の fixture を探す（2.2）。
   同じ入力か、同じことを記録する入力があれば、それを引く。
   そう判断するときは、`expected.json` の `accepted` と値まで読む。
   入力の見た目だけで判断しない。
3. なければ足す（2.3）。
   対照の例（規則が当たらない最も近い入力）も足す。
4. 仕様の文に `[fixture: <区分>/<名前>]` で引く。
   英語と日本語の両方に、同じ集合を引く。
5. mermaid.js と仕様の判断が違う入力（Known divergences）には、
   `fixtures:set-divergence` で識別子を付ける。
   どの識別子かは、known-divergences.md の定義に当てはめて決め、
   同じ種類の既存の fixture に合わせる。

### 3.5 規則を確かめる

手で書いた例だけで規則を決めない。

1. 規則の境界に当たる小さな部品を組み合わせた入力を、数百から数千件生成する。
   部品は、空白、タブ、改行、空の文字列、ディレクティブ、コメント行、`;`、
   キーワード、文字列、テキストの終わり。
2. mermaid.js と、parser の `parse()` と `dbOf()` に掛け、
   受理・拒否と値の違いを集める。
   parser がまだ読まない図種では、mermaid.js の結果を、
   仕様に書いた規則が言うことと比べる。
   parser がその図種を読むようになったら、parser でもう一度比べる。
3. 違いを種類に分け、種類ごとに 1 つの規則で説明する。
   例外を足していく形ではなく、
   mermaid.js の仕組みを 1 つの規則として書く。
   flowchart の例: mermaid.js がトークンを読まず、木に置く場所もない
   空の文字列、空の呼び出し、空の説明ブロックは、
   それらが現れるどの場所についても、場所ごとの規則ではなく、
   1 つの既知の差として扱った。
4. 受理・拒否は 1 つの基準で決める
   （AGENTS.md の Project 1 と `packages/spec` の節）。
   mermaid.js が受理・拒否するものを受理・拒否し、
   受理した入力には mermaid.js の Db を与える。
   mermaid.js が受理する入力を拒否するには、2 つの事実が要る。
   mermaid.js が受理すること、そして書かれたものを置く場所が木にないことである。
   そのため、書き手が書き、mermaid.js が読まない形を見つけたら、
   まず、木にそれをノードとして置く場所があるかを調べる。
   置き場所は、FlowchartIgnoredText のような図の葉のノードか、
   文が始まる位置の空の説明ブロックのような文である。
   置く場所がないところだけ、入力を既知の差として拒否し、
   木に置く場所がない理由を仕様に書く。
   mermaid.js が受理するが、書き手が意図しない読み方をする入力も、
   同じように受理する。
   木は書かれたものを示し、Db は mermaid.js のものである。
   sequence の例: `title` の後に改行があると、次の行を題として読む。
   `create destroy A` は A を作る。
   そのような入力は mermaid.js の結果とともに一覧にし、
   lint の規則の候補として報告する。
   書かれたものと違う意味になることは、拒否する理由にならない。
   mermaid.js の読み方が、構文の規則ではなく、
   字句解析器の規則の順番やパイプラインから生じるときは、
   直接の規則を書き、
   両方が受理して読み方が違う入力を、参照の入力とともに既知の差に挙げる。
   sequence の例: `%%` から始まるコメントは、その前の文字を取らない。
5. 規則を一般化するときは、その規則が当たる場所をすべて列挙し、
   受理が変わらないことを確かめる。
   flowchart の例: エンティティの置き換え文字を 1 単位として読む規則は、
   文字の規則 23 に当てると受理が変わるので、範囲を限った。
   また、どの `click` の単位も読み飛ばす規則は、
   2 つのクリックの文脈が読んだクリックの id をつなぎ、
   mermaid.js が拒否する入力を受理したので、規則を狭めた。
6. 仕様の規則が、不具合に見える mermaid.js の挙動に依るとき
   （既知の差や、意外な読み方）は、
   mermaid-js/mermaid の issue と PR を `gh` で（サンドボックスの外で）探す。
   検索語は 2〜3 語の短いものにする。長いと何も見つからない。
   見つかったものは番号で引き、事実だけを書く
   （題、状態、ラベル、報告している内容、確かめた日付）。
   状態は、ラベルと返信の事実で書く。
   `Type: Bug / Error` のような、報告の書式が付けるラベルを、
   保守者の判断として書かない。
   承認された、不具合だ、と書くのは、`Status: Approved` のラベルがあるか、
   保守者の返信がそう述べるときだけにする。
   見つからなければ、使った検索語とともに報告し、仕様には挙動だけを書く。

### 3.6 出力

作業の結果として、変えた節、足した fixture の名前、parser が直す点
（受理、トークン、Db の導出）、parser に `ast.json` が要る fixture を示す。

## 4. 仕様の欠落が見つかったとき

入力: 仕様が決めていない入力、または mermaid.js と違って決めている入力。
parser、フォーマッター、規則を実装するとき、レビューするとき、
仕様を書くときに見つかる。

1. その入力を、mermaid.js と parser で再現する。
2. mermaid.js のソースで原因を読む（3.1）。
3. 3.5 の手順で、同じ種類の入力を生成して列挙する。
4. 規則を書く。
   木の定義に関わるときは、3.3 の 4 に従う。
5. fixture を足し（3.4）、対照の例も足す。
6. 3.6 のとおり結果を示す。

fixture の追加だけが要るとき（規則のアイディアの根拠など）は、3.4
を項目ごとに行い、項目ごとに「足した名前」か「既存で足りる名前と、
その `accepted` と値」を示す。

## 5. 共通の木を変えるとき

木の共通の部分（`ast.md` の根、トークンの種類、コメント、ディレクティブ、
フロントマター、共通の葉のノード、不変条件）の変更は、
すべての図種と、木を読むすべてのパッケージに効く。
1 回で行う。

1. 変更のきっかけの文だけでなく、共通の部分を全体として見直す。
   変わるものに依っている文を、`ast.md`、`common.md`、
   すべての `ast/<図種>.md` と `diagrams/<図種>.md` から洗い出し、
   それぞれがどう変わるかを書く。
2. 案をリポジトリの外に書く。
   判断が要る各点の選択肢と推奨、木を読むパッケージへの影響を挙げ、決定を待つ。
3. 改訂を、英語と日本語で 1 回の変更として書く。
   変えた文が引く fixture が、その文の言うことを今も記録しているかを確かめる。
4. 木を読むパッケージへの変更点の一覧を、リポジトリの外に 1 つ書く。
   パッケージごとに変えるもの、変わる記録や範囲、
   `ast.json` が変わる fixture の見つけ方、木の検査が確かめる不変条件を挙げる。

## 6. mermaid.js を更新するとき

入力: mermaid.js の pin が上がり、
`fixtures:check` の差分が分類されている（tests の SKILL）。

1. index.md の pin した版と commit を直す（記録は 1 か所）。
2. すべての permalink を新しい commit に直す。
   古い commit の URL を文書から抜き出し、各リンクについて、
   新しい版の同じファイルで関数を探し、行の範囲を合わせる。
   関数が動いた、消えた、名前が変わったものは、その主張を読み直す。
   直した後、`pnpm run lint:docs` を通す。
   ほかの commit を指すままの mermaid.js へのリンクがあれば、
   この検査が知らせる。
3. 差分のある fixture ごとに、それを引く主張を読み直し、
   mermaid.js の新しい読み方に合わせる。
4. Known divergences の各識別子が、まだ成り立つかを確かめる。
5. detection.md の検出器の順序と一覧を、新しい版と照らす。
6. 3.6 のとおり結果を示す。

## 7. flowchart でつまずいた点

- 例を手で書いて規則を決め、境界の入力で外れた。
  → 3.5 の生成した入力で確かめる。
- 既存の fixture を、入力の先頭だけ見て「足りる」とし、それは拒否の例だった。
  → `accepted` と値を読む。
- 文書の折り返しで `[fixture:` が行をまたぎ、
  行ごとの検索で 3 分の 2 の引用を読めていなかった。
  → 行ごとに検索せず、`pnpm run lint:docs` の検査（2.4）を使う。
- fixture の注記に書いた理由が、規則の順序と合っていなかった。
  → 注記も仕様の主張として確かめ、`fixtures:set-note` で直す。
- 検査の作業ファイルをリポジトリの中に書いた。
  → 出力先はすべて、リポジトリの外の作業用のディレクトリの絶対パスにする。
- `add-many` が `accepted` の不一致で止まると思い込んでいた。
  → 出力の一覧を読む。
- 追跡されているファイルを一時的に書き換えて試さない。
  試すときは、リポジトリの外の作業用のディレクトリに写してから書き換える。

## 8. Jison と Langium

3.1 の Jison の節は flowchart で書いた。
Langium の図（pie など）の手順は、
pie のときに 3.1 の Langium の節に書き、3.2 から 3.5 で違うところを足す。

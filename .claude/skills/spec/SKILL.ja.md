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
パッケージの方針と基準は「方針と基準」の節にある。
どのパッケージにも当たるものは、AGENTS.md と SKILL `conventions` にある。

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
  既知の差異）を、 mermaid の文法定義と Db クラスから書く。
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
- 仕様では一文字の記号や略号を導入しない。
  「_T_ をテキストとする」のような書き方、斜体の一文字の名前、添字を使わない。
  対象は毎回言葉で書くか、節の冒頭で意味の分かる語句に名前を付ける。
  一文字の記号は、文を読みにくくするだけである。
- 仕様にはプログラミング言語のコードを書かない。
  正規表現も TypeScript の型定義も書かない。
  mermaid.js の実装が正規表現であっても、受理条件は文と文法で書く。
  AST は表と文で定義し、型は言語に依存しない語（整数、文字列、
  ノードの列）で書く。
  parser の `ast.ts` はその定義の実装であって、定義の出どころではない。
  仕様は実装言語に依存しない文書にする。

## 1. 最初に読むもの

基準は変わるので、作業を始めるたびに読む。

1. 方針と基準。
   - この文書の「方針と基準」の節: 木の定義の原則（ノードの型の名前、
     共通の葉のノード、型は位置で文法が許すもので決める）、 4 節、
     すべての主張に fixture、記号を作らない、仕様にコードを書かない。
   - AGENTS.md の Project: 正しさの基準と、Known divergences の例外。
   - AGENTS.md の Principles。
   - SKILL `conventions`: 日英の対、見えない文字、Prettier の折り返し、
     Mermaid のテキストのコードブロックは `mmd`、
     mermaid.js のソースへの permalink。
   - AGENTS.md の Shared interfaces: 木の定義は parser、prettier-plugin、
     eslint-plugin が使う。
     そのため、変えることはそれらのパッケージの変更でもあり、作業の結果に、
     それぞれが直す点を書く。
2. 作業の結果では、主張ごとに、実行して確かめたか（mermaid.js、parser）、
   読んで確かめたか（mermaid.js のソース、文書）、
   確かめていないかを区別して示す。
3. `packages/spec/docs/index.md` （適合、図種の文書の 4 節、書き方の約束、
   pin した commit）、 `common.md`、`ast.md`、
   既存の図種の `diagrams/<図種>.md` と `ast/<図種>.md`。
   木の原則とその理由は、`ast.md` の「設計の目標」と「共通の葉のノード」にある。
4. `packages/tests/docs/maintaining-fixtures.md`（fixture のコマンドと規則）と
   `packages/tests/README.md`（fixture の形）。

この SKILL の手順が書くのは、`packages/spec/` と、
`@mmd-toolkit/tests` の道具を通した fixture である。
ほかのパッケージ（その文書、parser、フォーマッター）を直す必要が出たら、
そのパッケージの SKILL の手順で直す。

ユーザーが言わないかぎり、git の操作（コミット、ステージ、ステージを戻す、
`git mv`）をせず、追跡されているファイルを一時的に書き換えない。

## 2. 道具

スクリプトはリポジトリの外の作業用のディレクトリに拡張子 `.mts` で置き、
`node <ファイル>` で動かす。
Node は TypeScript をそのまま、どのディレクトリからでも実行する。
リポジトリの外からはパッケージ名が解決されないので、
スクリプトはソースファイルを絶対パスで import する。
下のスクリプトの `<repo>` は、リポジトリのルートの絶対パスに置き換える。
Node は消せる型だけを取り除く。
型だけの import は `import type` で書き、 `enum`、`namespace`、
引数のプロパティは使わない。
mermaid.js の呼び出しは直列で遅い（1 件に数十ミリ秒、
fixtures:check の全件で 1〜2 分）。
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
`<repo>/packages/parser/src/index.ts` の `parse` と、
`<repo>/packages/parser/tests/helpers/db.ts` の `dbOf` を、
同じスクリプトから読み込む（読むだけ。parser のファイルは編集しない）。
`dbOf` には、同じテキストについて、
`<repo>/packages/tests/src/mermaid.ts` の `resolveEmbeddedData` が返す値を渡す。
mermaid.js がテキストを拒否するときは、それは undefined を返す。

### 2.2 既存の fixture を探す

```ts
// Lists the fixtures whose input contains a text, with what mermaid.js did:
//   node <this file> "<text>"
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

// The fixture directories; add a diagram type here when its directory exists.
const diagrams: DiagramType[] = ["common", "flowchart", "sequence", "class"]

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

仕様の文書と fixture の変更は、
次のように確かめる（SKILL `conventions` の「テストの実行」を参照）。
書いた後に毎回、リポジトリのルートで次を通す。

```sh
npx prettier --write packages/spec
npx prettier --check packages/spec
pnpm run -s lint:docs
pnpm run -s lint:chars
```

`pnpm run lint:docs` は、日英の対のほかに、仕様の文書と、
parser と tests の文書（`packages/parser/docs`、
`packages/tests/docs`）のリンク、アンカー、
fixture の引用（`[fixture:` の後で行が折り返されたものも読む）、
日英の引用の集合、見出しの構造を確かめる（`scripts/check-doc-citations.mjs`）。
検査の対象の文書の mermaid.js へのリンクが、
すべて `packages/spec/docs/index.md` に記録した commit を指していることも、
`scripts/check-mermaid-links.mjs` で確かめる。

`packages/tests` で `pnpm run -s fixtures:check` も通す（fixture
を足したとき）。
すべての fixture を mermaid.js で読み直し、
記録した結果と違うものがあれば失敗する。

ほかのパッケージのテストは回さない。
parser、整形器、lint は、変更を取り込むときに自分のテストを回す。
仕様を読む parser のテストが 1 つある。
`packages/parser/tests/types.test.ts` は `docs/known-divergences/`
の文書を並べるので、既知の差異の文書を足したか除いたときは、
作業の結果（3.6）にそう書く。
3.5 の場合は、文を書くときに mermaid.js で 1 回確かめて fixture にし、
`fixtures:check` がそれをもう一度回す。
入力を生成するテストやコマンドはない。

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
  見えない文字は文書に書かない（SKILL `conventions`）。
  書いた後に `pnpm run lint:chars` を通す。
- バッククォートを含む例のコードスパンは、
  2 重のバッククォートで囲む（``A["`x`"]``）。
  1 重のままだと、Prettier が前後の空白を詰めて壊す。
  書いた後に、描画した形を一度確かめる。

## 3. 図種を足すとき（工程 3）

入力: その図種の工程 1 と 2（tests の SKILL）。
Db の正規化関数と、収集した fixture。
mermaid.js を読むこと（3.1）と木の案（3.3 の項目 4）は fixture が要らないので、
収集の間に始めてよい。
主張は、そのために書いた入力で確かめ（2.1）、
収集した fixture が届いてから fixture にする。
収集にすでにある入力に、主張のための 2 つ目の fixture を作らないためである。

### 3.1 mermaid.js を読む

ソースは、pin した版のタグの mermaid.js の clone で読む。
作り方は `tools/README.md` にある。
仕様からのリンクは、
すべて `packages/spec/docs/index.md` に記録した commit の permalink にする。

#### Jison の図

1. 文法の定義（`*.jison`）の字句の規則を、上から順に読む。
   決めることは次のとおり。
   - 排他状態（`%x`）と、状態を書かない規則（初期状態だけで当たる）、
     `<*>` の規則。
     `<*>` の規則はすべての状態で当たるが、ファイルでそれより前にある、
     その状態の規則が先に当たる。
     flowchart の例: 文字列の規則 `<*>["]` は、
     click の状態と dir の状態でも当たる。
   - トークンを返さない規則。
     flowchart の例: `"click"[\s]+` は状態に入るだけで、
     語 `click` は文法に見えない。
     仕様ではそれを `click` の単位とし、クリックの文を始めるだけとする。
     mermaid.js がそれをほかの位置で、何もないものとして、
     あるいはたまたま文法が受け付けるクリックの id として読む入力は、
     既知の差異 `click-reserved-word`（known-divergences.md）である。
     `""`、空の括弧の付いた `call`、`accDescr {}` の規則も、
     トークンを返さないので、
     mermaid.js はこれらの空の形を多くの場所で受理する。
     これらは値の中にも、どの 2 つの単位の間にも現れ、
     木にはそこにそれらを置く場所がない。
     そのため、仕様では、文法が受け付けない単位として読み、
     既知の差異 `tokenless-empty-forms` とする。
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
   そのような値は木では決めない。
   サイトの設定と同じく外から与える値として、
   `@mmd-toolkit/tests` の `docs/db-from-tree/<図種>.md` が書く。
   それは tests のスキルの手順で書く。
4. 前処理の順序（common.md の Reading a source）と、
   検出（detection.md）を確かめる。

#### Chevrotain の図

Chevrotain の図では、使用中の各 mode の token 配列を順に読み、 custom matcher、
読み飛ばす単位、category、push/pop、
明示した `longer_alt` を含めて字句規則とする。
最長一致や、配列外の宣言順による優先順位は仮定しない。
parser の規則メソッド、gate、先読みを文法、
visitor/model の検証を受理条件とする。
複合 token の書かれた構成要素を区別して、
directive と無視するセミコロンの境界を定める。
mode ごとの空白とコメント、custom matcher の失敗、category と正確な単位の受理、
長い代替の対照例を調べる。
Jison の自動的な語境界は適用しない。
入力全体の消費と wrapper のエラー処理を調べる。
最初の字句エラーは構文エラーより先に報告され、
回復した CST が受理されるとは限らない。

#### Langium の図

1. 入口の規則、すべてのインポート先の文法、到達可能な規則を読む。
   生成した文法、service の module、token builder をたどり、
   実際の terminal 配列を調べる。
   継承した terminal、custom keyword matcher、長い代替を含め、優先順を記録する。
   宣言順だけや、一般的な最長一致の仮定では、その順は決まらない。
   インポートされても到達しない terminal を挙げ、
   mermaid.js の `packages/parser` と `packages/mermaid/src/diagrams/<図種>`
   の両方の固定したテストを読む。
2. 実際の keyword matcher と境界の検査を読む。
   境界を満たす文字を正確に述べ、単位間で読み飛ばす空白と区別する。
   境界は、共通のディレクティブと、
   共通の行規則が選ぶセミコロンを除いた図のテキストで判断する。
   キーワードの直後と次の構成要素の間に接着した共通のディレクティブを、
   tests パッケージの Mermaid runner で調べる。
   除いた後に有効な境界が残る場合と、2 つの構成要素が結び付く場合を比べる。
   Jison の語境界の規則を持ち込まない。
   同じ場所で競うキーワードと terminal を調べ、
   キーワードと値を一緒に読む複合した行の形も含める。
   custom matcher を使うキーワードと、
   それを使わない句読点付きの綴りを別々に調べ、語と句読点の構成要素を区別する。
3. 隠れた terminal を、flag と一致の終わりを含めて優先順に読む。
   共通の前処理と区別する。
   後の LF を取るか、境界として見るだけか、EOF で足した LF を取るかを調べる。
   同じテキストを囲む先の terminal、隠れた形の失敗後のコメントへの切り替え、
   完全な単位間の一致と原子内の一致を調べる。
   まず、読み飛ばす形をそれぞれ木のどこに持てるかを問う。
   隠れていることだけで差異を提案しない。
   最も近い閉じで終わると仮定せず、隣り合う区切りを使い、
   各 terminal 内の選択肢の順と貪欲・非貪欲な一致を確かめる。
   保持する各形の所有者と範囲を決め、消費する後続の LF はその範囲の外に置く。
4. 図の module から、図固有、共通、既定の value converter をたどる。
   各変換の分岐を、実際に呼ぶ文法の規則名と照合する。
   使われない分岐は挙動ではない。
   文字列のエスケープ、数の変換、両端の空白の除去、空白の圧縮を別々に記録する。
   木の書かれた値と変換した Db の値を区別し、3.3 に従い木が保つ綴りを定める。
   代入される構文、上書きされる構文、代入のない構文を、
   生成した model と結果の公開までたどり、
   Mermaid の model や Db に現れなくても、書かれたすべての出現を保つ。
   受理で比較する値を、エンティティの置換、引用符とエスケープの復号、
   空白の扱い、設定に依るエスケープまでたどり、
   書き換えの順と中間のテキストが生む重なりを確かめる。
5. 公開の parse wrapper と図の adapter を、
   完全な消費とすべてのエラー検査までたどる。
   回復した木に付いたものを含め、
   字句エラーや構文エラーが結果の公開を妨げるか確かめる。
   変換後の model の検証と Db による拒否も読む。
   回復した木があることや文法だけから、受理を判断しない。
   最後の option の選択後に到達する意味の検査を挙げ、その検査が使う状態の更新、
   同一性、置換を含める。
   adapter が何も公開しない場合や意味の検査がない場合は、
   公開の処理や欄を作らず、その不在を記録する。
6. [common.md](../../../packages/spec/docs/common.ja.md)
   の共通の前処理と検出の規則を読む。
   「ソースの読み方」「フロントマター」「先頭の空白」と、
   「図種の検出」が対象である。
   [detection.md](../../../packages/spec/docs/detection.ja.md)
   の図種の検出器も読む。
   3.2 の Detection を書く前に、次を直接の文と固定した場合で記録する。
   - 本物の先頭のフロントマターと、
     検出点で保持する 1 つのフロントマター形のブロックを区別する。
     ブロックを飛ばすのは 1 つだけで、
     裸の `%%` の行とディレクティブの再走査より前であることを記録する。
   - 飛ばしが止まる場合を記録する。
     本文の行がない隣り合う区切り、閉じの欠落、字下げの不一致、 4 個のダッシュ、
     閉じる区切りの後の文字、後に改行のない閉じ、前にある裸の `%%` の行である。
     2 つ目のブロック、ブロックと再走査のディレクティブの両方の順、
     保持するブロックの前の本物のフロントマター、
     どの区切りが一致するかを変える先頭の字下げも調べる。
   - 検出点と、たどり着いたヘッダーの位置を区別する。
     図の字句解析器が検出点からなお読む保持した形を、
     図固有の terminal の境界と受理の門に従って記録する。
     検出が通過させ、字句解析器が読み直さない裸の `%%` の行と、
     それに伴う空白と改行を記録する。
     裸の行は共通の Comment、伴う空白と改行はトリビアである。
     検出点より前の先頭トリビアと、その後で図がなお読む空白を区別する。
   - 固定した例として、保持した形が通過させた裸の行の前や間にある場合と、
     通過させた行とトリビアが保持した形の間にある場合を挙げる。
     通過させた行の後の Unicode 空白を、その行がない同じ空白、
     ASCII 空白とタブ、LF の対照例と比べる。
     ヘッダー直前の空白と、空白だけの行を含める。
     場合ごとに、検出が通過させるものと保持するもの、
     一致すべき terminal の境界、受理と木での所有を、3.4〜3.5 に従って記録する。
   - ほかの図種がある形を拒否するという共通の主張は、
     その図種の現在の規則と固定した fixture で確かめ直す。
     その証拠が支える範囲だけを述べ、過去の図種の一覧を引き継がない。
7. 求めた検出規則、順序つきの単位、書かれた構成要素、隠れた形、変換、
   受理の門に、3.2〜3.5 を適用する。
   差異を考える前に、直接の文と木を書く。
   文ごとに、名指す境界と規則の交点の明示した場合を、
   tests パッケージの Mermaid runner で調べる。
   隠れた形の所有、区切り、取られる LF、EOF、差異の逆方向を含める。
   文が区別する場合だけを fixture CLI で加え、入力を生成しない。
   見出し・flag・文の隙間と EOL の条件は、先行する図の配置を使わず、
   この図の入口と fragment の規則から求める。

### 3.2 図種の文書を書く

`docs/diagrams/<図種>.md` と `.ja.md` を、
index.md の「How to read a diagram document」の 4 節で書く。

1. Detection: detection.md の該当の検出器を指す。
2. Lexical structure: 単位と文脈を、各文脈の規則の一覧（適用する順）で書く。
   flowchart.md の「Units and contexts」が形の例。
3. Grammar: common.md の Notation で書く。
   各規則がどのノードを作るかを表にする。
   文法が受理した後で mermaid.js が拒否する入力を、
   それを決めるものすべてとともに書く（Rejections outside the grammar）。
   意味上の受理条件を、書かれた文に対する直接の規則で述べ、
   各条件の判断に要る比較値と状態の変化を含め、
   受理に不要な派生値だけを tests の要約に委ねる。
   テキストの外のサイト設定に依る条件は、既定値と、
   変更された設定を持つ側がそれを適用し、残りは木だけで決めることを述べる。
4. Known divergences: known-divergences.md の識別子のうち、
   この図種に当たるものと、それがこの図種でどう現れるか。
   新しい差異は、それだけの文書 `known-divergences/<識別子>.md` と、
   その `.ja.md` で定め、 known-divergences.md の表に行を足す。
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

図種の Db の要約と、それを木から作る手順は、
`@mmd-toolkit/tests` の文書（`docs/db-summaries.md` と
`docs/db-from-tree/<図種>.md`）である。
そこに要るものは、tests のスキルの手順で書く。

### 3.3 木のノードを足す

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
2. 各単位のトークンの種類は、
   parser が `packages/parser/docs/tokens/<diagram>.md` で定め、
   仕様の文書はそれに言及しない。
   仕様は字句構造と文法の単位を挙げ、
   parser はそれから各単位に種類を与える（3.7 の項目 1）。
3. 葉のノードの型は、その位置で文法が許すもので決める（「方針と基準」の節、
   ast.md の Shared leaf nodes）。
4. ノードの形は、書く前に、図種の全体について 1 回で決める。
   まず、リポジトリの外に案を書く。
   案には、すべてのノードの型とその欄と、判断が要る点を挙げる。
   判断が要る点は、次の 4 つに分ける。
   名前、mermaid.js が読まないテキストをノードにするか拒否するか、
   既知の差異の候補、共通の部分（`ast.md`、`common.md`、
   共通の葉のノード）の変更。
   原則と、木を使う側（parser、prettier-plugin、eslint-plugin）への影響を、
   全体で見て決める。
   原則は、「方針と基準」の節と、
   `ast.md` の「設計の目標」と「共通の葉のノード」にある。
   原則が選択を残すところでは、選択肢と例、根拠（原則、mermaid.js の読み方、
   fixture）、推奨を示して決定を求め、選ばれた形を書く。
   決めたら、すべての欄を原則と照らす。
   決めた形が原則や mermaid.js と食い違うと分かったら、
   変える前に根拠を添えてそれを示す。
5. 値は範囲のテキストで、値のトークンと範囲は、
   mermaid.js が値として読むテキストを、
   mermaid.js が読む空白を含めて覆う（ast.md の Nodes と Tokens）。
   sequence のタイトル、class のジェネリクスの型、
   flowchart の `,` の後のスタイルは、その空白を持つ。
   mermaid.js が読むものがほかのノードをまたぐために、
   どのトークンも持てないところだけ、
   `ast/<diagram>.md` の欄の説明に理由を書く。
   Db がそれをソースから読むことは、
   `@mmd-toolkit/tests` の `docs/db-from-tree/<図種>.md` が書く。
   それは tests のスキルの手順で書く。
   flowchart の例: subgraph の名前のすぐ後の空の説明ブロックの間の空白。

### 3.4 主張と fixture を対応させる

主張を 1 つ書くたびに:

1. mermaid.js で確かめる（2.1）。
2. 既存の fixture を探す（2.2）。
   同じ入力か、同じことを記録する入力があれば、それを引く。
   そう判断するときは、`expected.json` と、
   差異が必要とする `specified.json` の `accepted` と値まで読む。
   入力の見た目だけで判断しない。
3. なければ足す（2.3）。
   対照の例（規則が当たらない最も近い入力）も足す。
4. 仕様の文に `[fixture: <category>/<name>]` で引く。
   英語と日本語の両方に、同じ集合を引く。
5. mermaid.js と仕様の判断が違う入力（Known divergences）には、
   `fixtures:set-divergence` で識別子を付ける。
   どの識別子かは、known-divergences.md の定義に当てはめて決め、
   同じ種類の既存の fixture に合わせる。
6. corpus の場合を他パッケージへ渡すときは、入力を別の fixture に写さず、
   既存の fixture を引用する。

### 3.5 規則を確かめる

手で書いた、規則のふつうの形の例だけで規則を決めない。
仕様の文が分ける場合から決める。

1. 文ごとに場合を挙げる。
   ふるまいを定める文ごとに、その文が分ける場合と、
   その文が名指す場所で接するほかの規則の場合を挙げる。
   接する規則は、ディレクティブ、無視される `;`、コメント行、空行、
   行区切り（U+2028 か U+2029）、空の説明ブロック、テキストの終わり。
   場合ごとに、文についての 1 つの問いに答える入力を 1 つ書く。
   場所と文字列の積は書かず、乱数や数（シード、件数）で入力を選ばない。
2. 場合ごとに、mermaid.js と、
   parser の `parse()` と `dbOf()` で 1 回確かめる（2.1）。
   parser がまだ読まない図種では、mermaid.js の結果を、文が言うことと比べる。
   そのうえで、場合ごとに、文が引く fixture を持たせる（3.4）。
   その場合を記録した既存の fixture か、新しく足した fixture である。
   場合ごとに少なくとも 1 つを引き、同じ場合の fixture を全部は引かない。
3. 文が説明しない場合を種類に分け、種類ごとに 1 つの規則で説明する。
   例外を足していく形ではなく、 mermaid.js の仕組みを 1 つの規則として書く。
   flowchart の例: mermaid.js がトークンを読まず、木に置く場所もない空の文字列、
   空の呼び出し、空の説明ブロックは、それらが現れるどの場所についても、
   場所ごとの規則ではなく、 1 つの既知の差異として扱った。
4. 受理・拒否は 1 つの基準で決める（AGENTS.md の Project 1
   と「方針と基準」の節）。
   mermaid.js が受理・拒否するものを受理・拒否し、
   受理した入力には mermaid.js の Db を与える。
   mermaid.js が受理する入力を拒否するには、2 つの事実が要る。
   mermaid.js が受理すること、そして書かれたものを置く場所が木にないことである。
   そのため、書き手が書き、mermaid.js が読まない形を見つけたら、まず、
   木にそれをノードとして置く場所があるかを調べる。
   置き場所は、FlowchartIgnoredText のような図の葉のノードか、
   文が始まる位置の空の説明ブロックのような文である。
   置く場所がないところだけ、入力を既知の差異として拒否し、
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
   字句解析器の規則の順番やパイプラインから生じるときも、
   ノードで持てるかを先に問う。
   ノードで持てないところだけ、直接の規則を書き、それで読み方が違う入力を、
   3.8 のとおりに既知の差異として提案する。
   sequence の例: `%%` から始まるコメントは、その前の文字を取らない。
5. 形を新しい場所で受理する前と、規則を一般化する前に、
   規則が当たるところを次のとおり挙げ、それから書く。
   1. その形が現れうる位置。
      各図種の文法のすべての規則をたどって挙げ、行の終わりだけを見ない。
      ヘッダーの後、本体を持つ文の見出しの後（subgraph の名前、箱、名前空間、
      合成状態）、空白の前と後、`;` の前、テキストの終わり。
   2. 値を単位からではなく範囲のテキストから取るところ。
      名前の後に空の説明ブロックが続くときソースから読む、
      flowchart の subgraph の名前のテキストなどで、
      その形がそのような範囲の中に入りうるかを確かめる。
   3. 1 で挙げた位置の種類ごとの fixture。
      それぞれに、規則が分ける、形の周りの空白の種類（なし、空白、
      後の改行）を付け、受理と、2 の値を含む Db を mermaid.js で確かめる。

   ある場所で受理を変えると、同じ形の別の場所の受理と Db も変わりうる。
   そのため、ほかのところで受理が変わらないことも確かめる。
   flowchart の例: エンティティの置き換え文字をどこでも 1 単位として読むと、
   文字の規則 23 のもとで受理が変わるので、その規則の範囲は限ってある。
   また、どの `click` の単位も読み飛ばすと、
   2 つのクリックの文脈が読んだクリックの id がつながり、
   mermaid.js が拒否する入力を受理するので、
   規則はどの `click` の単位も読み飛ばすことはしない。

6. 仕様の規則が、不具合に見える mermaid.js の挙動に依るとき（既知の差異や、
   意外な読み方）は、
   mermaid-js/mermaid の issue と PR を `gh` で（サンドボックスの外で）探す。
   検索語は 2〜3 語の短いものにする。
   長いと何も見つからない。
   見つかったものは番号で引き、事実だけを書く（題、状態、ラベル、
   報告している内容、確かめた日付）。
   状態は、ラベルと返信の事実で書く。
   `Type: Bug / Error` のような、報告の書式が付けるラベルを、
   保守者の判断として書かない。
   承認された、不具合だ、と書くのは、`Status: Approved` のラベルがあるか、
   保守者の返信がそう述べるときだけにする。
   見つからなければ、使った検索語とともに報告し、仕様には挙動だけを書く。

### 3.6 出力

作業の結果として、変えた節、足した fixture の名前、parser が直す点（受理、
トークン、Db の導出）、parser に `ast.json` が要る fixture を示す。

引き継ぎには、次の責務を含める。

- `checkTree` は、[tests §6](../tests/SKILL.ja.md#6-langium-の図)に従う。
- 差異の形の検査は、
  [parser §6](../parser/SKILL.ja.md#6-fixture-が足されたとき規則が変わったとき)
  に従う。
- printer の作業は、[prettier-plugin](../prettier-plugin/SKILL.ja.md)に従う。
- Db に載らない構文は Db の一致では保持を確かめられないため、
  独立した木の検査と、整形の期待出力全体を比べる fixture を求める。

### 3.7 parser が仕様を読む前の点検

parser は仕様だけを源として読む。
図種の文書を渡す前に、その図種について次の点検をする。
各点検の結果を出力に書く（3.6）。

1. **単位の名前。**
   字句構造と文法の単位の名前を、文法の規則の名前も含めて一覧にする。
   1 つの名前は 1 つの単位を指す。
   キーワードの単位とテキストの単位が名前を共有しない（state では、
   キーワードが `style`、スタイルのテキストが `style-text`）。
2. **どの文字もどれかの単位に入る。**
   どの文脈でも、空白でない文字は、単位、コメント、述べた拒否のどれかに入る。
   1 行のノートや別名の `:` のような区切り、行の規則が無視する `;`、
   mermaid.js の規則が読んでトークンを返さないテキスト（`processId` が落とす
   id、空の説明ブロック）も同じ。
   parser は `packages/parser/docs/tokens/<diagram>.md` で、
   各単位にトークンの種類を、無視される `;` に文脈ごとの種類を与える。
   仕様は、それができるように各単位に名前を付ける。
3. **文法がすべての単位を取る。**
   字句構造に挙げた単位は、記号も含めて、どれも文法のどれかの規則に現れ、
   規則の単位は、どれも字句構造のどれかの規則から来る。
4. **コメント。**
   各図のコメントについて、その印（`#`、`%%`）と値を、例とともに書く。
   id の中のコメント、文の後のコメント、
   印の文字の間や値の中のディレクティブの例。
5. **閉じていない形。**
   閉じる部分なしに受理される形のノード（テキストの終わりの説明ブロック）は、
   前の図種と同じく `closed` の欄を持つ。
6. **木の文書はそれだけで読める。**
   各ノードは、`ast/<diagram>.md` に自分の節と欄の表を持つ。
   「`<OtherDiagram>Node` と同じ」と書いた節を作らない。
   欄が null になる条件と空の形は、表かその下に書く。
7. **要約を欄ごとに。**
   要約の各記録の各欄について、図種のすべての fixture で、キーがない、値が空、
   値がある、の 3 つの場合を数える。
   現れた場合は、どれも tests の `docs/db-from-tree/<図種>.md` の文で説明され、
   fixture を持つ。
   説明する文のない場合の文は、tests のスキルの手順で書く。
   最初の訪れでだけ決まるもの、積み重なるもの、
   更新がそのまま残すもの（`Object.assign`
   は新しいオブジェクトにないキーを残す）を、 Db のクラスで探す。
8. **値の外で Db が読むもの。**
   木は Db を変えるものを持つ。
   値として（mermaid.js が読む空白。空白だけの値も）、
   列の null の要素として（`,` の間の空の項目）、
   トークンとして（`:` があるかどうか）持つ。
   どのノードもトークンも持てないところだけ、
   `ast/<diagram>.md` のその欄の説明がその理由を述べ、
   Db がそれをソースから読むことは、
   tests の `docs/db-from-tree/<図種>.md` が述べる。
9. **範囲。**
   「任意の文字」は、どれも、改行、U+2028、U+2029 を含むかどうか、
   できるだけ多く読むか少なく読むか、
   規則がどこでもう一度試されるかを述べる（規則は、
   その文脈のどの位置でも試され、文脈を出ない単位の後でも試される）。
10. **空の単位。**
    文字列とテキストの各単位について、空でもよいかどうかと、
    文法が空のものをどこで取るか（`string` と `string-or-empty`）を述べる。
11. **列の空の終わり。**
    各列（本体の文、`,` の間の項目、行、本体の区切り）について、
    最後の区切りの後に何もないときにどうなるかを述べる。
    区切りで終わる本体、`,` で終わる id やスタイルの列、
    キーワードのすぐ後で終わるテキストなど。
    どれも mermaid.js と Db のクラスで確かめる。
    最後の部分が空のとき、mermaid.js は違う形を作ることが多い（state は、
    最後の文が区切りである本体を分けない）。
12. **キーワードの後に続くもの。**
    各キーワードについて、語の文字、数字、`-`、`:`、`#`、`%`、`{`、`"`、改行、
    テキストの終わりが続くときにどうなるかを mermaid.js で確かめ、
    キーワードの後に語の文字が続いてよいかを規則に書く。
    jison では、`"left of"` のように語の文字で終わる型の規則は、
    終わりに `\b` を持ち、 `\s+` や `\s*` で終わる規則は持たない。
13. **既知の差異。**
    図種の既知の差異の入力は、新しい識別子でも既存の識別子でも、
    どれも 3.8 の 4 つの答えが書かれている。

7 の集計。
要約の、オブジェクトのリストである記録について:

```ts
// node <this file> <diagram> — 要約の各記録の各欄について、
// キーがない fixture、値が空の fixture、値がある fixture を 1 つずつ示す。
import { loadFixtures } from "<repo>/packages/tests/src/index.ts"
import type { DiagramType } from "<repo>/packages/tests/src/index.ts"

function kind(value: unknown): "missing" | "empty" | "set" {
  if (value === undefined) return "missing"
  if (value === "" || (Array.isArray(value) && value.length === 0))
    return "empty"
  return "set"
}

const fixtures = (await loadFixtures(process.argv[2] as DiagramType)).filter(
  (fixture) => fixture.expected.accepted,
)
// すべての fixture にわたる、各記録の欄。
const fields = new Map<string, Set<string>>()
for (const fixture of fixtures) {
  for (const [record, items] of Object.entries(fixture.expected.db)) {
    if (!Array.isArray(items)) continue
    const names = fields.get(record) ?? new Set<string>()
    for (const item of items)
      for (const name of Object.keys(item)) names.add(name)
    fields.set(record, names)
  }
}
const tally = new Map<string, Map<string, string>>()
for (const fixture of fixtures) {
  for (const [record, names] of fields) {
    for (const item of fixture.expected.db[record] as Record<
      string,
      unknown
    >[]) {
      for (const name of names) {
        const cases =
          tally.get(`${record}.${name}`) ?? new Map<string, string>()
        if (!cases.has(kind(item[name])))
          cases.set(kind(item[name]), fixture.name)
        tally.set(`${record}.${name}`, cases)
      }
    }
  }
}
for (const [key, cases] of tally) console.log(key, Object.fromEntries(cases))
```

fixture でキーがないことが一度もない欄も、ある入力ではないことがある。
値が `undefined` になりうる各欄は、Db のクラスで読む。

### 3.8 既知の差異を提案するとき

既知の差異は、AGENTS.md の Project 1 の 1 つ目の問いに答えた後でだけ提案する。
新しい識別子でも、既存の識別子への入力の追加でも、
提案には次の 4 つの答えを書く。
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

差異の文書（`known-divergences/<identifier>.md`）は、「この仕様の規則と、
その理由」の節で、そのテキストをノードで持たない理由を述べる。

## 4. 仕様の欠落が見つかったとき

入力: 仕様が決めていない入力、または mermaid.js と違って決めている入力。
parser、フォーマッター、規則を実装するとき、レビューするとき、
仕様を書くときに見つかる。

1. その入力を、mermaid.js と parser で再現する。
2. mermaid.js のソースで原因を読む（3.1）。
3. 3.5 の手順で、その入力が関わる文の場合を挙げ、
   それぞれを mermaid.js で 1 回確かめる。
4. 規則を書く。
   木の定義に関わるときは、3.3 の 4 に従う。
5. fixture を足し（3.4）、対照の例も足す。
6. 3.6 のとおり結果を示す。

fixture の追加だけが要るとき（規則のアイディアの根拠など）は、
3.4 を項目ごとに行い、項目ごとに「足した名前」か「既存で足りる名前と、
その `accepted` と値」を示す。

## 5. 共通の木を変えるとき

木の共通の部分（`ast.md` の根、トークンの種類、コメント、ディレクティブ、
フロントマター、共通の葉のノード、不変条件）の変更は、すべての図種と、
木を読むすべてのパッケージに効く。
1 回で行う。

1. 変更のきっかけの文だけでなく、共通の部分を全体として見直す。
   変わるものに依っている文を、`ast.md`、`common.md`、
   すべての `ast/<図種>.md` と `diagrams/<図種>.md` から洗い出し、
   それぞれがどう変わるかを書く。
   変更が形を新しい場所で受理するときは、先に 3.5 の項目 5 のとおり、
   その位置と範囲から読む値を挙げる。
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

## 7. 避ける誤り

- 例を手で書いて決めた規則は、境界の入力で外れる。
  → 3.5 のとおり、文ごとの場合と接する規則の場合を挙げ、
  それぞれに fixture を持たせる。
- 入力の先頭が合う既存の fixture でも、拒否の例でありうる。
  → 足りるとする前に、`accepted` と値を読む。
- Prettier は `[fixture:` の後で引用を折り返すので、
  行ごとの検索は引用を取りこぼす。
  → 行ごとに検索せず、`pnpm run lint:docs` の検査（2.4）を使う。
- fixture の注記に書いた理由が、規則の順序と合わないことがある。
  → 注記も仕様の主張として確かめ、`fixtures:set-note` で直す。
- 検査の作業ファイルをリポジトリの中に書くと、
  あるいは追跡されているファイルを一時的に書き換えると、作業ツリーが変わる。
  → 出力先はすべて、リポジトリの外の作業用のディレクトリの絶対パスにする。
  書き換えを試すときは、そのディレクトリに写してから書き換える。
- `add-many` は、`accepted` が合わなくても止まらない。
  → 出力の一覧を読む。

## 8. Jison、Langium、Chevrotain

3.1 の該当する手順を使う。
Langium では、[Langium の図](#langium-の図) の項目 6 で、
3.2 の Detection を書く前に、共通の前処理と検出の境界を確定する。
実際の terminal の優先順とキーワード境界、隠れた terminal の範囲と LF の消費、
使われる value converter、 wrapper の受理の門を確定し、
書かれた構文と結果の公開や意味の検査を区別する。
それを 3.2〜3.7 の文、木、明示した fixture の場合、引き継ぎに適用する。
回復した木は受理の根拠ではなく、
Db が空でも書かれた構文を捨てる根拠にはならない。
処理系固有の調査はこの手順に置き、
Mermaid のソースを見ずに実装が従える直接の規則を渡す。

Chevrotain は、その手順と、mode、順序つきの一致、`longer_alt`、書かれた境界、
エラー処理の確認を使う。
実際の処理系を調べる。
Jison の境界も Langium の service の構成も、自動的に適用されるわけではない。

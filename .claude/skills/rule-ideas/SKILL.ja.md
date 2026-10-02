---
name: rule-ideas
description:
  Find ideas for the rules of eslint-plugin-mmd and decide which rules to keep
  (adoption, name, scope). Use when looking for new rule candidates, reviewing
  proposed candidates, or rechecking existing rules against the adoption
  criteria.
---

# 規則のアイディアの探し方と採否の決め方（rule-ideas）

`eslint-plugin-mmd`
（Mermaid の図のテキストのための ESLint の言語プラグイン）について、
規則の候補を探し、持つかどうか、名前、範囲を決める手順。
会話の履歴や記憶がなくても、この文書だけで同じ判断ができるように書く。
採否の基準そのものは AGENTS.md にあり、この文書には基準の当て方を書く。

## 1. この手順の範囲と進め方

- この手順が決めるのは、規則の採否、名前、範囲。
  決めた結果は、6 節の形で示す。
- この手順そのものは、リポジトリのファイルを書かない。
  作業用のスクリプトとその結果は、リポジトリの外の作業用ディレクトリに置く。
- 決めた結果をリポジトリに残すのは、次の手順で行う。
  同じ人が続けて行ってよい。
  - 規則の文書（`packages/eslint-plugin-mmd/docs/rules/`）は、
    eslint-plugin の SKILL の手順で書く。
    文書はそれぞれ、
    `packages/eslint-plugin-mmd/src/rules/` の規則のファイルに属する。
    規則は、eslint-plugin の SKILL のとおり、
    文書と一緒に足し、名前を変え、消す。
    落とした規則の文書が既にあれば、
    同じ手順で、規則のファイルと一緒に削除する。
  - 根拠の fixture が足りなければ、
    tests の生成器で足す（`packages/tests/docs/maintaining-fixtures.md`）。
- 主張ごとに、【実行】（動かして確かめた）、【読解】（読んで確かめた）、
  未確認を区別して示す。
  誤りと分かったら、その言葉で撤回する。
- 仕様は変わることがある。
  根拠にする前に、いまのファイルを読み直す。
  古い版を根拠にして、
  誤った判断をした例がある（subgraph 名の `click` のトークンの種類）。
- 作業ツリーをほかの作業と共有しているとき:
  - ほかの作業者が編集中のファイルに触らない。
    2 人が同じファイルを触ると、片方の変更が消える。
    編集が止まるのを待っても防げない。
  - 削除や置き換えの前に、対象の中身を読む。
  - git のステージを変えない。
    git mv、git rm も使わない。

## 2. 採否の基準の当て方

基準は AGENTS.md の `packages/eslint-plugin-mmd` の節にある。
判断の前に毎回読む。
この節では、その当て方を例で示す。

### 判断の例（2026-10-01 の判断。mermaid 12.0.0 で【実行】）

残したもの（書き手の側の誤りを、mermaid が黙って受け入れるもの）:

| 入力                                                               | mermaid の結果                                           | 規則                                                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 複数行のコメントアウトの中の空の `%%` 行                           | 頂点 `%%` ができる                                       | flowchart/no-bare-comment-marker（不具合とも読めるが残した。境界の例）                               |
| `%%{init: {...}}`（最後の `%%` を書き忘れ）                        | 文の終わりまでがディレクティブになり、図が空             | no-unclosed-directive（共通）                                                                        |
| `%%{init: {"flowchart": {"inheritDir": true},}}%%`（末尾のカンマ） | init の設定がすべて捨てられる                            | no-ignored-init-directive（共通）                                                                    |
| `A[Start]-->B` の後に `C-->A[End]`                                 | A のラベルが End に置き換わる                            | flowchart/no-redefined-vertex                                                                        |
| `style C fill:red`（C の打ち間違い）                               | スタイル付きの頂点 C が増える                            | flowchart/no-style-unknown-id                                                                        |
| `accDescr {` の閉じ忘れ                                            | 説明が空になる                                           | flowchart/no-unclosed-description-block                                                              |
| 説明のない図の `accDescr {}`（空白だけや 2 行に分けた形も）        | 何も起きない（説明は空のまま）                           | flowchart/no-empty-description-block                                                                 |
| `accDescr: first` の後の `accDescr: second`                        | 説明が黙って `second` に置き換わる                       | flowchart/no-duplicate-description                                                                   |
| `accTitle: first` の後の `accTitle: second`                        | タイトルが黙って `second` に置き換わる                   | flowchart/no-duplicate-title                                                                         |
| subgraph の中の `A-->B; direction TB`（`;` で区切っても同じ）      | 方向の文の行のほかのテキストが捨てられ、A、B、辺が消える | flowchart/no-ignored-text（方向の文は単独の行に書くもの。同じ行に書いた文を mermaid が黙って捨てる） |

落としたもの:

| 入力                                                                                                                                                                                      | 落とした理由                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A[ ]`、`style A fill:#f00, `、`click-->B`、`A[ /x/]`、最後のメンバーの `hasOwnProperty`                                                                                                  | 文体の規則。mermaid は書いたとおりに読み、後の編集で壊れるだけ（`A[ ]` と `A[" "]` は同じ空のラベル）                                                                                                                                                                                                          |
| `A%%{init: {}}%%B-->C`、`A[style:#x;]`                                                                                                                                                    | 意図して分かりにくく書かないと起きない                                                                                                                                                                                                                                                                         |
| `A&B-->C`                                                                                                                                                                                 | 意図した書き方と区別できない。`R&D-->X` も同じく頂点 `R&D` で、`&` を含む id を意図して書いた場合と同じ形                                                                                                                                                                                                      |
| `A[Issue #123; fixed]`（`{` になる）                                                                                                                                                      | 意図した書き方と区別できない。数字のエンティティ（`#9829;`）は文書化された使い方                                                                                                                                                                                                                               |
| `A"Start"-->B`（`[ ]` の書き忘れ）                                                                                                                                                        | 構文を知らないことから起きる。`[ ]` でラベルを囲むのは文法の定義                                                                                                                                                                                                                                               |
| `style A fill:red;stroke:blue`                                                                                                                                                            | 構文を知らないことから起きる。スタイルの区切りが `,` なのは文法の定義                                                                                                                                                                                                                                          |
| subgraph の外の `direction LR`                                                                                                                                                            | 構文を知らないことから起きる。subgraph の外では何も変えないと仕様にある                                                                                                                                                                                                                                        |
| `subgraph S %% group`、`accTitle: T %% note`                                                                                                                                              | 構文を知らないことから起きる。行の途中の `%%` はコメントでないと仕様にある                                                                                                                                                                                                                                     |
| `%%{config: ...}%%`                                                                                                                                                                       | 構文を知らないことから起きる。`config` はフロントマターのキーで、ディレクティブの名前ではない                                                                                                                                                                                                                  |
| `A---orders`（矢印 `---o` と頂点 `rders`）                                                                                                                                                | フォーマッターで見える。整形すると `A ---o rders` になる。規則にするとフォーマッターと二重に保守することになる                                                                                                                                                                                                 |
| 空のまま残した `accTitle:` の次の行に `A-->B`（タイトルが `A-->B` になる）                                                                                                                | フォーマッターで見える。整形すると `A-->B` が `accTitle:` の続きとして字下げされる                                                                                                                                                                                                                             |
| `A[<span style='color:#f00;font-weight:bold'>x</span>]`（`#` の色の後の `;` が取り除かれ `color:#f00font-weight:bold` になる。`style` 文の行のための書き換えが、`style=` 属性にも当たる） | mermaid の不具合のように見える。正しい CSS を mermaid の書き換えが壊す                                                                                                                                                                                                                                         |
| `subgraph Handle click events`、改行、`A`（mermaid ではタイトル `Handle eventsA`）                                                                                                        | 構文エラーなので規則の対象外。`click` は予約語で、クリックの文の始まりにしか書けない                                                                                                                                                                                                                           |
| `A-->""B`（空の文字列）                                                                                                                                                                   | 構文エラーなので規則の対象外。空の文字列は受理しない                                                                                                                                                                                                                                                           |
| 説明の行をコメントにした `accDescr {`、`%% old description`、`}`                                                                                                                          | 意図した書き方にも当たる。ブロックを何もしないようにするつもりで、mermaid もそう読む（前の説明が残る）                                                                                                                                                                                                         |
| `subgraph Front end`、改行、`A`、改行、`end`（名前に `A` が入り、メンバーなし）                                                                                                           | mermaid の不具合のように見える。ふつうの名前を正しく書いており、その最後の語 `end` が後ろの改行を取る。事実: flowchart の文書はページの冒頭で小文字の `end` について警告し、[#1444](https://github.com/mermaid-js/mermaid/issues/1444)（closed。Type: Enhancement）はマークアップの作りによる制限としている    |
| `box red-team`（箱が赤くなり、名前が `-team` になる）                                                                                                                                     | mermaid の不具合のように見える。文書は色のない名前だけの書き方を認めており、その名前が `-` で分けられる                                                                                                                                                                                                        |
| `link A: Dash@https://x.example`（ラベルが `Das` になる）                                                                                                                                 | mermaid の不具合のように見える。空白が 1 つないだけで、ラベルの最後の文字が落ちる。事実: 文書は `<ラベル> @ <URL>` の形だけを示す                                                                                                                                                                              |
| `subgraph a `（行末の空白で id が subGraph0 になる）                                                                                                                                      | mermaid の不具合のように見える。見えない行末の空白で id が変わる。事実: 保守者は [#3252](https://github.com/mermaid-js/mermaid/issues/3252)（closed。Type: Bug / Error、Status: Approved、P1）で不具合と認めており、12.0.0 でも起きる                                                                          |
| `class 1A:::c`（数字で始まる名前）、`class C` より前の `style C fill:red`、CSS クラス `foo` に効く `classDef fo`                                                                          | この道具の範囲の外。CSS クラスやスタイルが付くかどうかは描かれた図にしか現れず、この道具は図を描かない。mermaid の不具合かどうかは判定せず、mermaid にも報告しない                                                                                                                                             |
| `` class `a~b` ``（id `a`、型 `b`。図では `a<b>`）                                                                                                                                        | 文書から見て mermaid の不具合。バッククォートは特別な文字を逃がすとされる（[syntax/classDiagram.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L161-L168)）が、その中の `~` も総称型を始める。ふつうの書き方ではまれ |
| `class A~T~` の後の `note for A~T~ "x"`（総称型つきで書いたクラスへのノート）                                                                                                             | mermaid の不具合のように見える。ノートは名前 `A~T~` を持ち、クラスは `A` なので、線なしで描かれる。`note for A "x"` ならクラスが見つかる                                                                                                                                                                       |
| `+foo(a(b)) int`（Db ではメソッドの名前が `foo(a`、引数が `b)`）                                                                                                                          | 利用者に見える誤りがない。描かれた図は `+foo(a(b)) : int` を示す                                                                                                                                                                                                                                               |
| `A x-->B`、`A o-- t -->B`（始まりの印が終わりの印と違う）                                                                                                                                 | mermaid の不具合で、すでに認められている。mermaid-js/mermaid#1665（Open、Approved）が、両端の印が違う矢印は動かないとしている。`A x-->B` は長いふつうの矢印、`A o-- t -->B` はふつうの矢印として描かれる                                                                                                       |
| `A x-- t x--x B`（始まりの印を開く矢印と閉じる矢印の両方に書く）                                                                                                                          | 構文を知らないことから起きる。仕様は、この辺を `INVALID`（ふつうの矢印として描く）としている。書き方は `A x-- t --x B`                                                                                                                                                                                         |

### 迷ったときの問い

1. その入力を書くのは、普通に図を書いている人か。
   仕様の珍しい例をなぞっていないか。
2. mermaid は、いま、書かれたものと違う結果を出すか。
   後の編集で壊れるだけなら文体の規則。
3. 規則の条件は、文書化された正しい書き方や、
   意図して書いた書き方にも当たらないか。
   当たるなら、誤検出なしに報告できないので持たない。
   報告しない例として、意図した書き方を必ず 1 つ mermaid で動かす。
4. その書き方が別の意味になると、仕様の文法や本文に書いてあるか。
   書いてあり、構文を知っていれば書かないなら、当面は持たない。
   書いてあっても、構文を知っている人がうっかり起こすものは残す。
   閉じ忘れ、打ち間違い、id の使い回しなど。
5. 報告する例をフォーマッターで整形すると、mermaid の読み方が見える形になるか。
   なるなら持たない（フォーマッターと二重に保守することになる）。
   フォーマッターは Db を変えないので誤りを直すわけではないが、
   整形すれば書き手が気づける。
   整形の手順は 4 節。
   字下げのずれや空白の付き方の違いのような弱い手がかりしか出ないものは、
   見える形とはしない。
6. 書き手は正しく意味の通る書き方をしているのに、
   mermaid がそれを誤って読んでいないか。
   ふつうに考えて不具合のような挙動なら、規則にしない。
   mermaid の保守者が不具合と認めたか、文書に書かれているか、
   直される見込みがあるかは、この判定を決めない。
   それらは、判定とともに事実として記録する。
   規則にするのは、書き手の側の誤りを mermaid が黙って受け入れるもの。
   mermaid に報告するかどうかは別の決定で、
   根拠を示せるものについて、ユーザーが決める。
   事実の記録のために、次の 3 つをする。
   (a) mermaid の文書の、その構文の節と、ページの冒頭の警告を読む。
   (b) issue と PR を、題（`in:title`）と本文の両方で、語を別々にして探し、
   探した語を記録する。
   (c) 誤った結果が、Db の値だけでなく、描かれた図で利用者に見えるかを言う。
   境界にあるもの（空の `%%` 行、行末の空白）は、
   両方の理由を付けて決定を求める。
7. 決めきれないときは、両方の理由を付けて決定を求める。

## 3. 材料の探し方

- 仕様: `packages/spec/docs/common.md` と
  `packages/spec/docs/diagrams/<図種>.md`。
  規則の「帰結」として書かれた、受理されるが意外な読み方の例を拾う。
- fixture: `packages/tests/fixtures/<図種>/` の
  `input.mmd`、`expected.json`、`ast.json`。
  名前が `lex-`、`gram-`、`db-` で始まるものに、意外な読み方の記録が多い。
- フォーマッターの制限: `packages/prettier-plugin-mmd/docs/<図種>.md` と
  `docs/compatibility.md`。
  空白 1 つや `;` 1 つで意味が変わる箇所が並んでいる。
- 既存の規則: `packages/eslint-plugin-mmd/docs/rules/`。
  同じものを出さない。
- 自分で探す: 書き手の側の誤りから始めて、mermaid を動かす。
  閉じ忘れ、打ち間違い、id の使い回し、壊れた設定の JSON、
  コメントアウトの残りなど。
  仕様の珍しい例から始めると、意図して分かりにくい入力ばかりになりやすい。
  普通の書き方を mermaid が誤って読む例が見つかったら、それは規則でなく、
  mermaid の不具合の候補として結果に示す。
  たとえば、subgraph の名前の普通の英単語 `end` が改行を取り込む例。

## 4. mermaid と parse() で確かめる手順

次のスクリプトを、リポジトリの外の作業用ディレクトリに `probe.mts` として置く。
`<repo>` は、リポジトリのルートの絶対パスに置き換える。
リポジトリの外のファイルからはパッケージ名が解決されないので、
ソースファイルを絶対パスで import する。
拡張子は `.mts` にする（top-level の `await` を使うため）。
Node は型の注記を取り除いて実行するので、
型だけの import は `import type` で書き、
`enum`、`namespace`、引数のプロパティは使わない。

```ts
import { readFileSync } from "node:fs"
import { parse } from "<repo>/packages/parser/src/index.ts"
import type { Root } from "<repo>/packages/parser/src/index.ts"
import { runMermaid } from "<repo>/packages/tests/src/mermaid.ts"

const casesPath = process.argv[2]
if (casesPath === undefined) throw new Error("usage: probe.mts <cases.json>")
const inputs: string[] = JSON.parse(readFileSync(casesPath, "utf8"))

function withoutPositions(key: string, value: unknown): unknown {
  return key === "loc" || key === "range" ? undefined : value
}

for (const input of inputs) {
  console.log("INPUT", JSON.stringify(input))
  const outcome = await runMermaid(input)
  if (outcome.accepted) {
    console.log(
      "MERMAID accepted",
      outcome.diagramType,
      JSON.stringify(outcome.db),
    )
  } else {
    console.log("MERMAID rejected", outcome.error.message.split("\n")[0])
  }
  let root: Root
  try {
    root = parse(input)
  } catch (error) {
    console.log(
      "PARSER error",
      error instanceof Error ? error.message.split("\n")[0] : String(error),
    )
    continue
  }
  console.log(
    "TOKENS",
    root.tokens
      .map((token) => `${token.type}:${JSON.stringify(token.value)}`)
      .join(" "),
  )
  console.log(
    "COMMENTS",
    JSON.stringify(root.comments.map((comment) => comment.value)),
  )
  console.log(
    "DIRECTIVES",
    JSON.stringify(
      root.directives.map((directive) => ({
        name: directive.name,
        closed: directive.closed,
      })),
    ),
  )
  console.log("BODY", JSON.stringify(root.body, withoutPositions))
}
```

- 入力の一覧は JSON のファイルにする。
  シェルで直接書くと `\n` や引用符を誤るので、
  Python などで `json.dump` して作る。
  行末の空白が要る入力も、こうすれば正確に作れる。
- `node <作業用ディレクトリ>/probe.mts <cases.json>` で実行する。
  どのディレクトリから実行してもよい。
  結果はファイルに書き出してから読む。
  マシンが混んでいると、起動に数分かかることがある。
- 1 つの候補につき、次の 3 つを同時に流す。
  - 報告する例（普通の書き方）
  - 報告しない例（直した書き方）
  - 意図した書き方（2 節の問い 3。例: `#9829;`、`R&D`）
- `runMermaid` の Db の要約は、
  正規化関数のある図種（いまは flowchart）にしかない。
  ほかの図種では `db` が null になる。
  `parse()` も、対応していない図種では、
  `Diagram type "<id>" is not supported yet` で失敗する。
  ほかの図種で結果が変わるかは、受理と拒否の比較と、5 節の読解で判断する。
- 木での現れ方は、`parse()` の結果に条件を当てて確かめる。
  条件は、ノードの欄、トークンの種類と値、`Root.comments`、
  `Root.directives` で書く。
  テキストを字句解析し直す条件は書かない。
  葉のノードの値の中を探す必要があるときは、そう明記する。
  木とトークンから見つけられないなら、そう書く。

### 整形して確かめる（2 節の問い 5）

報告する例をフォーマッターに通し、mermaid の読み方が見える形になるかを見る。
次のスクリプトを作業用ディレクトリに `format.mts` として置き、
`<repo>` をリポジトリのルートの絶対パスに置き換えて、
probe と同じように実行する。
prettier は、プラグインのパッケージが依存として持つものを、
絶対パスで import する。
プラグインが import する `@mmd-toolkit/parser` は、
ソースではなく、ビルド済みの `packages/parser/lib` に解決される。
parser のソースが変わっていたら、スクリプトを動かす前に、
`pnpm --filter @mmd-toolkit/parser run build` で lib を作り直す。
作り直さないと、古い parser で整形される。
parser のソースを直接 import する probe は、この影響を受けない。

```ts
import { readFileSync } from "node:fs"
import { format } from "<repo>/packages/prettier-plugin-mmd/node_modules/prettier/index.mjs"
import plugin from "<repo>/packages/prettier-plugin-mmd/src/index.ts"

const casesPath = process.argv[2]
if (casesPath === undefined) throw new Error("usage: format.mts <cases.json>")
const inputs: string[] = JSON.parse(readFileSync(casesPath, "utf8"))

for (const input of inputs) {
  const formatted = await format(input, {
    parser: "mermaid",
    plugins: [plugin],
  })
  console.log("INPUT    ", JSON.stringify(input))
  console.log("FORMATTED", JSON.stringify(formatted))
}
```

例: `A---orders` は `A ---o rders` になる【実行】。

## 5. 共通の規則か、図種の規則か

条件は AGENTS.md の `packages/eslint-plugin-mmd` の節にある。
共通の構文（`common.md` の規則）が原因でも、
図種の字句解析器が吸収したり拒否したりするなら、共通にしない。

確かめ方:

1. 全図種の一覧を、仕様の `packages/spec/docs/detection.md` の表から取る。
   表には、検出の順の全エントリーと、各図種の先頭の語が並んでいる。
   手で書いた一覧は使わない。
2. 図種ごとに、その先頭の語で始まる最小の図を作り、
   mermaid が受理することを確かめる。
   次の 22 の図は、mermaid 12.0.0 での受理を確かめた【実行】。
   括弧内は、mermaid が返した図種の id。
   表にない図種は、その都度作って確かめる。
   - `sequenceDiagram`、改行、`A->>B: hi`（sequence）
   - `classDiagram`、改行、`class A`（classDiagram）
   - `stateDiagram-v2`、改行、`[*] --> A`（stateDiagram）
   - `erDiagram`、改行、`A ||--o{ B : has`（er）
   - `gantt`、改行、`title T`、改行、`section S`、改行、
     `Task :a1, 2024-01-01, 1d`（gantt）
   - `pie`、改行、`"a" : 1`（pie）
   - `journey`、改行、`title T`、改行、`section S`、改行、
     `Task: 5: Me`（journey）
   - `gitGraph`、改行、`commit`（gitGraph）
   - `mindmap`、改行、`root`、改行、`  A`（mindmap）
   - `timeline`、改行、`title T`、改行、`2020 : a`（timeline）
   - `quadrantChart`、改行、`x-axis Low --> High`（quadrantChart）
   - `requirementDiagram`、改行、`requirement r {`、改行、`id: 1`、改行、
     `}`（requirement）
   - `block`、改行、`A`（block）
   - `xychart`、改行、`x-axis [a, b]`、改行、`bar [1, 2]`（xychart）
   - `sankey`、改行、`A,B,1`（sankey）
   - `packet`、改行、`0-15: "A"`（packet）
   - `kanban`、改行、`todo`、改行、`  a`（kanban）
   - `architecture-beta`、改行、`service a(server)[A]`（architecture）
   - `C4Context`、改行、`Person(a, "A")`（c4）
   - `radar-beta`、改行、`axis a, b, c`、改行、`curve c1{1,2,3}`（radar）
   - `treemap-beta`、改行、`"A"`、改行、`  "B": 1`（treemap）
   - `info`（info）
3. 同じ構文を各図に入れて mermaid に通し、受理と拒否を図種ごとに比べる。
   拒否する図種では規則は要らない。
4. 受理する図種で結果が変わるかは、pin した mermaid のビルドで、
   その図種の字句規則を読んで確かめる。
   - 場所は
     `node_modules/.pnpm/mermaid@<版>/node_modules/mermaid/dist/chunks/mermaid.core/`。
     ファイル名は図種によって次のどれかになる。
     - `<名前>Diagram-*.mjs`（sequenceDiagram、pieDiagram など）
     - `<名前>-definition-*.mjs`（timeline、mindmap、kanban）
     - 名前のない `diagram-*.mjs`（packet、radar、treemap など）。
       図種の id で `grep -l` して探す。
   - jison の図の字句規則は `/^(?:...)/` の形の正規表現で並んでいるので、
     `grep -o` で該当する規則を抜き出す。
   - Langium の図の chunk には、jison の字句規則がない。
     pie、gitGraph、info、architecture で、その形の規則が 0 件だった【実行】。
     受理と拒否の比較だけでは Db の変化が分からないので、未確認として扱う。
5. 例: `%%` だけの行。
   - flowchart-v2 だけが頂点 `%%` を作る【実行】。
   - er と sankey は拒否する【実行】。
   - sequence、classDiagram、stateDiagram、gantt、journey、timeline、
     mindmap、kanban、c4、quadrantChart、xychart には、
     `%%` で始まる行をコメントとして読む字句規則がある。
     grep で抜き出して確かめた【実行】。
   - そのため、この規則は flowchart の規則にした。

## 6. 決定として示すもの

決めた規則ごとに、次を示す。

- 規則の名前（`<図種>/<名前>`、共通なら `<名前>`）と、共通か図種か。
- 何を報告するか（1 文）。
- 理由: mermaid がどう読むか、なぜ普通の書き方で起き、
  書かれたものと違う結果になるか。
- 報告する例、報告しない例、意図した書き方の例。
  それぞれ mermaid の結果を付ける【実行】。
  受理される入力であること。
  例は、普通の書き方にする。
  振る舞いを確かめるために足した前置き（前の説明など）は、
  例に入れず、理由の文と fixture で示す。
- 木での現れ方: どのノード、欄、トークンで見つけるか。
  `parse()` で確かめた結果【実行】。
- 根拠の fixture: 既にあれば名前。
  なければ、足すべき最小の入力と対照例。

落とすと決めたものも示す。
名前と、AGENTS.md の基準のどれで落としたかを書く。

規則の文書を書く途中で、新しい候補、範囲や名前の変更の必要、
木から見つけられないことが分かったら、同じ基準で決め直し、
その結果を同じ形で示す。

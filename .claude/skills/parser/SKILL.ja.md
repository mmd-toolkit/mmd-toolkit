---
name: parser
description:
  Implement a diagram type in @mmd-toolkit/parser from the specification and the
  fixtures only. This covers its node types, its hand-written lexer and
  recursive-descent parser, the four layers of tests, and the AST snapshots. It
  also covers recording and checking the parse result of each fixture (its tree
  in ast.json, or its error in parse-error.json), finding gaps in the
  specification, and fixing the parser when the pinned mermaid.js is updated.
  Use when a diagram type is added to the parser, when fixtures are added or a
  rule of the specification changes, or when mermaid.js is updated.
---

# 図種のパーサーを足す（parser）

`@mmd-toolkit/parser` の作業の手順。
図種を仕様だけから実装すること、足された fixture と変わった規則への追従、
pin した mermaid.js の更新を扱う。
図種の実装は、字句解析器、再帰下降パーサー、4 層のテスト、
スナップショットからなる。
これまでの作業の履歴がなくても、同じ品質に届くように書く。
パッケージの方針と基準は「方針と基準」の節にある。
どのパッケージにも当たるものは、AGENTS.md と SKILL `conventions` にある。
例は flowchart のもので、手順そのものは図種によらない。

## 方針と基準

`packages/parser`:

- 仕様の参照実装である。
  実装する挙動は、すべて仕様と fixture から取る。
  仕様は `docs/common.md`、`docs/ast.md`、`docs/ast/*.md`、
  `docs/diagrams/*.md` である。
  mermaid.js のソースは仕様の記述を確かめるために読んでよいが、
  実装する挙動の出どころにしてはならない。
  仕様に書かれていないことは mermaid のコードから補わず、
  仕様の所有者に不足として上げる。
- AST を、同じノード名と欄名で TypeScript の型として実装する。
  `docs/ast.md` の共通部は `ast.ts` に、
  `docs/ast/<図>.md` の図種ごとのノードは `ast/<図>.ts` に置く。
- 図種の検出と、図種ごとのパーサーへの振り分け。
- トークン、コメント、ディレクティブ、frontmatter がその範囲の入力を保持し、
  その外には空白と行終端子しかないことを検査するテスト用の補助を持つ。
  公開 API にはしない。
- 図種ごとのパーサーは手書きの字句解析器と再帰下降パーサー。
  ジェネレータは使わない。
- 4 層のテスト: 受理・拒否の一致、Db 相当 JSON の一致、
  トークンと trivia による入力の被覆、変異差分テスト。
  AST のスナップショットを保存する。

## 1. 最初に読むもの

1. 方針と基準。基準は変わるので、作業のたびに読む。
   - この文書の「方針と基準」の節。
     仕様だけから実装することと、
     mermaid.js のソースを挙動の出どころにしないことがある。
   - AGENTS.md の「Shared interfaces」と「Principles」。
     読みやすさとあるべき形がある。
   - SKILL `conventions`。
     正規表現を使わないこと、見えない文字、文書の決まりがある。
2. `packages/parser/docs/development.md`（パーサーの作りと道具）、
   `docs/testing.md`（テストが何を確かめるか）、
   `docs/error-positions.md`（`ParseError` の位置）。
3. 仕様: `packages/spec/docs/common.md`、`ast.md`、`detection.md`、
   `diagrams/<図種>.md`、`ast/<図種>.md`。
   それと `packages/tests/fixtures/<図種>/` の fixture。
   実装する挙動は、ここにあるものだけ。

## 2. 作業ツリー

- この SKILL の手順が書くのは、`packages/parser` と、
  スナップショットのテストが書く
  `packages/tests/fixtures/<図種>/<fixture 名>/` の
  `ast.json` と `parse-error.json` だけ。
  fixture のほかのファイル、仕様、ほかのパッケージは書かない。
  それらを直す必要が出たら、そのパッケージの SKILL の手順で直す。
  spec、tests、prettier-plugin の SKILL である。
- ルートの設定は、すべてのパッケージが使う。
  変える前に、ほかのパッケージへの影響を確かめる。
  ルートの設定とは、`package.json`、`pnpm-lock.yaml`、`tsconfig.json`、
  `eslint.config.mjs`、`prettier.config.js`、`vitest.config.ts`、
  `.github/workflows/`、`scripts/` である。
- コミット、ステージの変更、`git mv`、`stash`、`checkout`、`reset` はしない。
  ファイルの移動と削除は、通常の `mv` と `rm` で行う。
- 確かめ方を変えるために、追跡されているファイルを一時的に書き換えない
  （テストの入力の件数など）。
  作業ツリーをほかの作業と共有しているときは、
  その状態でステージされることがあり、
  途中で止まった実行は元に戻さない。
  差分のテストの件数は、環境変数で変える（4.8 節）。
- Write ツールとシェルのヒアドキュメントは、`\u00a0` のようなエスケープを、
  実際の文字に変えることがある。
  `packages/parser` のソースとテストは ASCII だけで書かれている
  （それ以外の文字は、すべてエスケープで書く）。
  書いたら、リポジトリのルートで次の 2 つを実行して確かめる。
  どちらも何も出さなければよい。

  ```sh
  grep -rnP '[^\x00-\x7e]' packages/parser/src packages/parser/tests packages/parser/tools
  node scripts/check-invisible-chars.mjs
  ```

- `eslint --fix` の結果は必ず読む。
  空の JSDoc や、意味のないコメントが入ることがある。
  lint の規則を `eslint-disable` で外すのは、
  規則の意図に照らして正しい場合だけにし、
  理由を書く（`eslint-comments/require-description` が求める）。
- テストは重い。
  負荷が高いと（`uptime` の load average が CPU の数を超えると）、
  mermaid.js を動かすテストが時間切れになる。
  時間切れが出たら、そのファイルだけを単独で走らせ直してから判断する。
  時間の長い確かめ（4.8 節の大きい件数）は、バックグラウンドで動かし、
  出力をリポジトリの外のファイルに書く。
  作業ツリーをほかの作業と共有しているときは、自分が始めたものだけを、
  タスクの ID か PID で止める。
  名前で止めない（`pkill -f vitest` は、ほかの作業の実行も止める）。

## 3. 確かめ方（すべての作業で）

- 挙動についての主張は、自分のものも、ほかから来たものも、
  mermaid.js を動かして確かめてから書く。
  入力を JSON の文字列の配列にして、リポジトリの外のファイルに置き、
  `packages/parser` で次を実行する。

  ```sh
  pnpm run compare-with-mermaid <ファイル>
  ```

  入力ごとに、`parse()`、木の検査、Db が mermaid.js と一致するかを出す
  （`docs/development.md` の「道具」）。
  既知の差異に当たる入力は `DIFF` になるので、
  仕様の Known divergences と照らして読む。

- 手で書いた例だけで確かめない。
  境界が問題になる規則は、
  文字や単位を全位置に置いた入力を生成して比べる（4.6 節）。
  flowchart では、テストのために手で書いた例が、
  行終端子で click の文脈を出るために、
  mermaid.js に拒否されていた。
  テストやコメントに例を書くときも、上のコマンドに掛けてから書く。
- 結果では、主張ごとに、実行して確かめたか、コードや文書を読んで確かめたか、
  確かめていないかを区別して示す。
- 変更が影響しうるものだけを回す（SKILL `conventions` の「テストの実行」）。
  作業の途中では、変えたコードの部分に対応するテストのファイルを、
  `packages/parser` で `npx vitest run <ファイル>` として回す。
  `tests/fixtures.test.ts` の図種の部分だけを回すなら、
  `-t "<図種> fixtures"` を付ける。

  | 変えた部分                                                                      | テストのファイル                                                                                                                                               |
  | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `src/diagrams/<図種>/`                                                          | `tests/<図種>.test.ts`、`tests/fixtures.test.ts`、`tests/parse-result-snapshots.test.ts`                                                                       |
  | `src/ast.ts`、`src/ast/<図種>.ts`、`src/visitor-keys*`                          | `tests/types.test.ts`、`tests/traverse.test.ts`、`tests/ast-<図種>-examples.test.ts`、`tests/union-docs.test.ts`、flowchart では `tests/ast-flowchart.test.ts` |
  | `src/unit-grammar.ts`、`src/empty-forms.ts`、`src/diagram-*.ts`                 | すべての図種の `tests/<図種>.test.ts`、`tests/diagram-parsing.test.ts`、`tests/fixtures.test.ts`                                                               |
  | 共通の規則（`src/source-lexer.ts`、`directives.ts`、`entities.ts` など）        | 同じ名前のテストのファイル、`tests/fixtures.test.ts`、`tests/differential/common-invariants.test.ts`                                                           |
  | `src/db-ids.ts`、`src/db-texts.ts`、`src/diagrams/flowchart/subgraph-ids.ts`    | `tests/db-ids.test.ts`、`tests/db-texts.test.ts`、`tests/fixtures.test.ts`                                                                                     |
  | `src/parse.ts`、`src/index.ts`                                                  | `tests/parse.test.ts`、`tests/readme-example.test.ts`                                                                                                          |
  | `tests/helpers/<図種>-db.ts`、`<図種>-source.ts`、`check-tree.ts`               | `tests/fixtures.test.ts`、`tests/check-tree.test.ts`                                                                                                           |
  | `tests/helpers/reference-inputs.ts`、`tests/differential/mermaid-comparison.ts` | `tests/reference-inputs.test.ts`、`tests/fixtures.test.ts`、既定の件数の差分のテスト                                                                           |

  文書を読むテストは、その文書だけを変えたときにも回す。
  `tests/readme-example.test.ts`（`README.md` と `README.ja.md` の例）、
  `tests/types.test.ts`（`packages/spec/docs/known-divergences/` の文書）、
  `src/ast.ts` と `src/ast/*.ts` のコメントの例と union を読むテスト
  （`tests/ast-<図種>-examples.test.ts`、`tests/union-docs.test.ts`）である。
  既定の件数での全体と、全件の差分のテストは、4.8 節のとおりに回す。

## 4. 図種を足すとき（Jison の図）

### 4.1 入力

- その図種の仕様が書かれている。
  `packages/spec/docs/diagrams/<図種>.md` の 5 節に「To be written」がなく、
  `packages/spec/docs/ast/<図種>.md` がある（spec の SKILL）。
- その図種の fixture と正規化関数が `packages/tests` にある（tests の SKILL）。

### 4.2 仕様を読み、欠落を先に扱う

1. `diagrams/<図種>.md` と `ast/<図種>.md` を通して読み、
   実装の単位の一覧をリポジトリの外に作る。
   字句の規則、文法の生成規則、Db normalization の項目、ノードの欄、
   トークンの種類である。
2. 一覧の各行について、仕様の文と fixture だけで、
   実装が 1 通りに決まるかを確かめる。
   決まらないもの、仕様と fixture が食い違うもの、
   mermaid.js（3 節）と仕様が食い違うものは、仕様の欠落である。
   mermaid.js のソースから埋めず、入力と mermaid.js の結果を添えて、
   先に仕様を直す
   （spec の SKILL の「When a gap in the specification is found」）。
   flowchart の例:
   1 文字ずつ読む文脈での実体参照、
   subgraph の名前の中の `click` のトークンの種類、
   文の文脈の `,` と同じ単位の名前だった、click の文脈の `,`。
3. 欠落が残っている間は、それに関わらない部分を実装する。
4. 仕様は作業の間にも変わり、作ったものに関わることもある
   （class では作業の間に、ノードの 2 つの欄の名前が変わり、1 つがなくなった）。
   読んだときの文書の写しをリポジトリの外に取っておき、
   4.8 節の確かめの前に、文書を写しと比べて、変わったところを実装する。

### 4.3 ノードの型とつなぎ込み

次の順に足す。
flowchart のファイルが手本になる。

1. `src/ast/<図種>.ts`: `ast/<図種>.md` のノードを、同じ名前と欄で書く。
   各型の JSDoc は仕様の節を名指しし、構文の例と、
   ノードの範囲を示す `^` の行を持つ。
   図種のノードの合併型（flowchart では `FlowchartNode`）を置く。
2. `src/ast.ts`: `DiagramBody` に図の本体のノードを足す。
3. `src/visitor-keys/<図種>.ts` を書き、`src/visitor-keys.ts` で展開する。
4. `src/index.ts`: 型を公開する。
   `parse()` の API は共有のインターフェースなので（AGENTS.md）、
   公開した型を結果に示す。
   prettier-plugin と eslint-plugin がその型の上に作る。
5. `src/parse.ts`: 図種 ID の `case` から、その図種のパーサーを呼ぶ。
   1 つのパーサーを複数の図種 ID が使うことがある
   （flowchart は `flowchart-v2`、`flowchart-elk`、`swimlane`）。
   これ以後、テストがその図種を未対応の図種として扱っていた所でも、
   図種が parse される。
   `tests/parse.test.ts` の未対応の図種の例は、まだ未対応の別の図種に替える。
   共通の差分テスト（`tests/differential/common-mermaid.test.ts`）の変異のうち、
   その図種のものは木として比べられる。
   そこでの不一致は図種の違いであり、4.2 の手順 2 のとおりに読む。

### 4.4 字句解析器

1. 入口を `src/diagrams/<図種>/index.ts` に、
   `parse<図種>Diagram(input: DiagramInput): Root` として置く。
   `openDiagramText(input)` で図のテキストを開き、字句解析器で単位に分け、
   文法で文とトークンを作り、`finishDiagram()` に渡す。
   最も小さい手本は `src/diagrams/error.ts`。
   `finishDiagram()` が、単位とトークンの約束の検査、
   単位の内側のディレクティブの拒否、
   `Directive` のトークンとフロントマターのトークンを含むトークンの記録、
   `Root` の組み立てを行う。
   `ignoredSemicolonKindAt` は、`ast/<図種>.md` の Tokens の節から書く。
   行の規則が無視する、単独の `;` の、その位置での種類である。
   図種がそのような `;` をすべて同じ種類にするなら 1 つの値
   （flowchart は `Punctuator`）、
   位置で種類が変わるなら位置による。
   sequence では、文脈が `;` をテキストとして読む所で `RawText` になり、
   字句解析器が単位から答える。
   class では、その `;` を読み越えた字句解析器の一歩の文脈から答える。
2. 共通の規則は、`DiagramTextReader` が各位置で適用済み。
   共通の規則とは、ディレクティブ、コメント領域、
   `style` と `classDef` の行の規則、実体参照、行終端子、
   HTML 属性の引用符である。
   図種の字句解析器は、それが返す位置を 1 つずつ読む。
   共通の規則を図種の側で書き直さない。
   図種の文書がテキストの読み方の規則を足していれば、
   `DiagramText` の形の読み手で包む
   （flowchart では、`}` の後の空白を読む `FlowchartText`）。
   ディレクティブを除いたテキストのような派生テキストを、
   中間結果として作らない。
   flowchart では、mermaid.js の前処理を層ごとのパスで模した構造を作り、
   作り直した。
3. ほかの図種の文書も述べる規則は、実装を 1 つにして両方で使う。
   flowchart と class の方向の行は、
   それぞれの値の一覧で `src/direction-line.ts` を使う。
   2 つ目の図種が必要になったときに最初の図種から移し、書き直さない。
4. 仕様の Lexical structure の文脈ごとに、規則を仕様の順に、
   規則 1 つにメソッド 1 つで書く
   （flowchart では `readInClickContext`、`readArrow`）。
   JSDoc で節と規則を名指しする。
   Jison の開始条件は、文脈のスタックにする。
   文字は、`src/code-points.ts` の定数と、
   `src/character-classes.ts`、`src/scanning.ts` で比べる。
   正規表現は使わない。
5. 単位は仕様の名前を持つ。
   単位は `src/diagram-units.ts` の `readUnit` で作る。
   図種の `Unit` は `DiagramUnit<UnitName>` で、
   図種が要るときだけ自分の欄を足す
   （flowchart では、文字列の単位が中身の範囲を持つ）。
   字句解析器が単位を読むときに決め、ノードが持つものは、単位に載せる。
   文法がテキストを別の読み方で読み直さないためである。
   矢印の単位は、矢印の記号と線を持ち、
   flowchart ではさらに線の文字の数を持つ。
6. 字句解析器が大文字小文字を区別しないとき（sequence ではすべての規則）は、
   語を `src/scanning.ts` の `matchWordIgnoringCase` と
   `matchWholeWordIgnoringCase` で比べる。
   これらは Notation に従う。
   小文字にしてから比べることはしない。
7. 図種の字句解析器が自分のコメントを読むとき
   （図のコメント。sequence では、行の終わりまでの `#` と `%`）は、
   その範囲と値の始まりを返し、
   入口がそれを `DiagramAnalysis.comments` として `finishDiagram()` に渡す。
   共通の部分が、中のディレクティブとともに `Root.comments` に記録する。
   図のコメントの印は、図種の文書が定める。
8. テストのヘルパーが同じ単位を読めるように、
   公開しない入口 `lex<図種>(input)` を置く。
   ヘルパーが要るもの（図のテキスト、単位、文脈を出た位置など）を返す
   （flowchart では `lexFlowchart`）。
   sequence の `lexSequence` は、
   `comment-takes-character` の場所を求めるために、
   文の文脈の規則が一致を始める位置も返す。
9. 1 文字ずつ読む規則がある文脈では、
   実体参照のプレースホルダーを 1 単位として読む
   （common.md の Entities。flowchart では `afterOneCharacter`）。
10. どの規則も一致しない位置では、その 1 文字を範囲にして `ParseError` を投げる
    （`docs/error-positions.md`）。
    テキストが終わるためにだけ一致しないときは、
    代わりにその文脈でのテキストの終わりを、
    その文脈に入ったものの位置で報告する。
    後に空白しかないときがそうで、
    字句解析器が最後の文字の後に読む改行もその空白に入る。
    state では、`scale 3` を、テキストの後の改行での空の範囲の
    「予期しない文字」として報告していた。
    テキストが終わってはいけない文脈とそのメッセージは、
    すべての文脈を並べた 1 つの表にまとめる
    （state では `END_OF_TEXT_MESSAGES`）。

### 4.5 文法

1. 単位の上の再帰下降で、仕様の Grammar の生成規則 1 つにメソッド 1 つで書く。
   JSDoc で生成規則を名指しする。
   文法は `src/unit-grammar.ts` の `UnitGrammar` を継ぐ。
   `UnitGrammar` は、単位の読み進め（`take`、`takeIf`、`peek`）、
   ノードの位置（`placeOf`、`placeFrom`）、範囲のテキスト、
   共通の葉のノード、項目のトークン（`addItem`）、
   空の形と、読めない単位のエラー（`unexpected()`）を受け持つ。
   図種は、生成規則と `knownDivergenceAt()` を足す。
   `knownDivergenceAt()` は、既知の差異が名指す原因を探す。
   flowchart では `space` の単位の後の `click` と空の形、
   sequence では空の形、
   class では空の形か、空のジェネリクスの型の後の単位である。
   単位の空白を除いた範囲は、
   `src/diagram-units.ts` の `significantRangeOf` で求める。
   項目のトークンがどこで切れるかは `breaksRun()` が決める。
   ほかの項目の単位の間で切れる。
   空白がどの単位にも属さない図種では、
   2 つの単位の間に文字があるところでも切れる
   （class では、内側の空白をトークンに含む `RawText` の項目は除く）。
2. 文法は、ノード、
   空白だけでない単位それぞれのトークンの種類（`UnitWithKind`）、
   トークン（`PendingToken`）を作る。
   トークンの種類は、`ast/<図種>.md` の Tokens の節から取る。
3. 文法はすべての単位を読み、読み飛ばす単位はない。
   mermaid.js が読まないテキストも、木に置き場所があればノードにする。
   その位置に書けない単位は、どの規則も取らないので、入力を拒否し、
   エラーはその形と、そこに書けないことを示す。
   flowchart では、`tokenless-empty-forms` の空の形、
   つまり空の文字列、空の呼び出し、文を始めない空の説明のブロックである。
   空の形は、どの図種の文法とテストのヘルパーも共有する 1 か所、
   `src/empty-forms.ts` で求める。
   sequence では、空の説明のブロックだけがこれに当たる。
   単位が、どの欄にも属さないまま、ノードの範囲に入ることはある
   （flowchart では、click 文の中の、コールバックの `call` と括弧）。
   どこで入るかは、仕様が書いている。
4. 葉のノードの値は、範囲のテキストから、ディレクティブ、コメント領域、
   行の規則が無視する `;` を除いたもの
   （`ast.md` の Nodes。`SourceLexer.textOfRange`）。
   何も変換しない。
   `StringLiteral` と `NumericLiteral` は `raw` も持つ。
   `Identifier` の名前は、そのトークンのテキストをつないだもので、
   間の空白を含まない。
   `identifierOf` は、項目の断片を `SourceLexer.piecesOf` から取る。
   トークンを記録するときの断片と同じものである。
5. 仕様が文法の外の拒否（Db を作るときの拒否）を挙げていれば、
   それもパーサーが行う。
   flowchart では、`hasOwnProperty` の後に続く subgraph のメンバーを、
   文法が見つける（`subgraph-members.ts`）。
   sequence では、文法の後に文を辿り、
   参加者について Db が持つものを追う（`db-rejections.ts`）。
   待っている文が複数あるとき、どれに検査を当てるかを仕様が言っていなければ
   （sequence では、1 つのメッセージの前の 2 つの `create`）、
   mermaid.js で確かめ（3 節）、欠落として知らせる。
6. 新しい種類の拒否には、`ParseError` の範囲を決め、
   `docs/error-positions.md` とその `.ja.md` に 1 行足す。

### 4.6 テスト

flowchart のテストが手本になる。
足す、または図種の `case` を足すファイル:

| ファイル                                    | 足すもの                          |
| ------------------------------------------- | --------------------------------- |
| `tests/helpers/node-types.ts`               | 図種のすべてのノード型の `Record` |
| `tests/types.test.ts`                       | `Node` の合併型                   |
| `tests/helpers/db.ts`                       | `dbOf()` の `case`                |
| `tests/helpers/<図種>-db.ts`                | Db normalization の手順           |
| `tests/helpers/<図種>-source.ts`            | 単位を読むヘルパー                |
| `tests/helpers/check-tree.ts`               | 図種の木の検査                    |
| `tests/check-tree.test.ts`                  | 壊した木                          |
| `tests/fixtures.test.ts`                    | 図種の fixture の `describe`      |
| `tests/parse-result-snapshots.test.ts`      | `diagrams` の一覧                 |
| `tests/differential/<図種>-mermaid.test.ts` | 第 4 層                           |
| `tests/ast-<図種>-examples.test.ts`         | ノード型のコメントの例            |
| `tests/helpers/reference-inputs.ts`         | 参照入力のための図種の単位        |
| `tests/<図種>.test.ts`                      | 木とトークンの単体テスト          |

手順:

1. 第 1 層から第 3 層は、`tests/fixtures.test.ts` が行う。
   Db の要約は、`tests/helpers/<図種>-db.ts` が木から作る。
   仕様の Db normalization の項目を、1 項目ずつ、仕様の順に書く。
   値は変換した形で読む（`tests/helpers/converted-text.ts`）。
   これには図種の字句解析器の読み手を渡す。
   flowchart では `FlowchartText`、sequence では図のテキストそのもの。
   複数の図種が共有する手順は `tests/helpers/db-values.ts` にある。
   埋め込みデータから来る値は、引数の `embedded` から取る。
   仕様が木の外から与えるとし、埋め込みデータでもない値
   （sequence では、box の色の候補が色かどうか）は、
   `@mmd-toolkit/tests` が mermaid.js に与えるものから取る。
   公開されていなければ依頼し、代役は書かない。
   どの欄も持たないトークンに Db が依るとき
   （sequence では、何も続かない `as` が空の説明を与える）は、
   そのトークンを読み、仕様に知らせる。
2. ヘルパーは、字句の判断をすべてパーサーの単位から取る
   （`<図種>Source`。flowchart では `FlowchartSource`）。
   字句の判断とは、文字列の中身がどこか、どの文字列が空か、
   文がどこで終わるか、などである。
   独自の規則で決めると、単位の誤りが隠れ、
   ヘルパーの誤りが mermaid.js との違いに見える。
   flowchart では、ヘルパーが文字列の中身などを独自の規則で読んでいたので、
   単位から取る形に作り直した。
   ヘルパーがソースを自分で読むのは、
   mermaid.js との比較で確かめられないもの（`loc` とコメントの値）だけ。
   `docs/testing.md` の「テストがソースから自分で読むもの」に書いてある。
3. ノードの範囲の外のテキストが Db に効く場所を探す。
   Db normalization の項目ごとに、
   読むテキストがノードの範囲の内側にあるかを確かめ、
   外側にあるものは、その境界を単位から取る。
   flowchart の例:
   subgraph の名前のテキストは、名前の始まりから `[` まで
   （名前の後の空白を含む）と、
   文の最初のスタイルが始まる `space` の単位の終わり。
   それぞれの境界に、空白、ディレクティブ、コメント行、`click` を置き、
   mermaid.js と比べ（3 節）、入力をテストに入れる
   （flowchart では `tests/differential/flowchart-source-reading.test.ts`）。
   入力は生成する。
   それぞれを、文の各位置に置く
   （class では `tests/differential/class-source-reading.test.ts`）。
   Db が境界で読む文字は、ソースからでなく変換した形で読む。
   class では、ヘルパーが可視性の印の後の文字をソースから読んでいた。
   印の後に置いたディレクティブ（mermaid.js は除く）が、それを示した。
   文の終わりにある、すべて空白の単位は、文の範囲の後にある。
   文の範囲は最後のトークンで終わるからである。
   そうした単位は、範囲の内側からでなく、文の単位の隣から探す
   （state では、すべて空白の、別名の 2 つ目の説明と 1 行の note のテキスト）。
4. 第 3 層は `tests/helpers/check-tree.ts`。
   共通の不変条件はすでにある。
   `ast/<図種>.md` が木について述べること
   （値のノードとトークンの関係、固定の語の欄とそのトークン）を、
   図種の検査として足す。
   検査そのものには、`tests/check-tree.test.ts` で壊した木を与える。
5. 第 4 層は `tests/differential/<図種>-mermaid.test.ts`。
   fixture の変異を mermaid.js と比べる。
   比べ方は `tests/differential/mermaid-comparison.ts` にある。
6. 境界が問題になる規則には、生成した入力のテストを足す。
   flowchart の例: `tests/differential/entity-units.test.ts` は、
   実体参照を、リンクのテキストと楕円のラベルの全位置に置く。
7. 一度誤った入力は、回帰の入力としてテストに残す。

### 4.7 スナップショット

すべての fixture のパースの結果を、入力と並べて記録する。
受理する入力の木は `ast.json` に、
拒否する入力の `ParseError` の `message`、`range`、`loc` は、
`parse-error.json` に置く
（`docs/testing.md` の「パースの結果のスナップショット」）。
拒否も木と同じだけ記録される。
パーサーが拒否を報告する位置も、結果の一部である。

1. これらのファイルを書いて読むのは、規則を実装した fixture だけにする。
   先に走らせると、いまのパーサーの誤った結果が書かれ、
   スナップショットとして通ってしまう。
2. スナップショットのテストを、CI の外で 1 回、`packages/parser` で、
   `-u` を付けずに走らせる。
   足りないファイルが書かれる（CI では、足りないファイルは失敗になる）。
   `-u` は、既存の結果が変わる変更のときだけ使う（手順 4）。

   ```sh
   pnpm run test tests/parse-result-snapshots.test.ts
   ```

3. 新しい結果を、仕様と照らして読む（`packages/parser` で）。

   ```sh
   pnpm run show-trees <図種> <fixture 名> <fixture 名>
   ```

   ノードごとに、固定の語の欄、値、範囲、
   範囲のテキストが値と違うときはそのテキストを出し、その後にトークンを出す
   （`docs/development.md` の「道具」）。
   新しい `parse-error.json` は、そのまま読む。
   その `range` は、
   `docs/error-positions.md` が拒否を置く位置でなければならない。
   既知の差異なら原因の形で、メッセージは原因を示す。
   結果の見込みが分かっているときは、
   結果に、fixture ごとに見込みと結果を並べて示す。
   受理されるはずの fixture が拒否される、またはその逆なら、
   そのファイルを残さずに、それを示す。

4. `-u` を使うのは、既存の結果が変わる変更のときだけ。
   その変更の前に、fixture をリポジトリの外に写す。
   変更の後に `pnpm run test:update` で書き直し、違いを分類する
   （`packages/parser` で）。
   このスクリプトは、スナップショットのテストだけを `-u` 付きで走らせる。

   ```sh
   rm -rf <ディレクトリ>/ast-before && cp -R ../tests/fixtures/<図種> <ディレクトリ>/ast-before
   pnpm run test:update
   pnpm run diff-trees <ディレクトリ>/ast-before <図種>
   ```

   新しくできたファイルとなくなったファイル、
   違いの種類ごとの fixture の数を出し
   （違いの種類は、同じノードの型の同じ欄か、エラーの同じ欄）、
   その後に違いを 1 つずつ出す。
   違いの種類がすべて、変更で説明できなければならない。
   説明できない種類があれば、`-u` の結果を受け入れずに調べる。
   変更で拒否されるようになった fixture には `parse-error.json` が書かれ、
   古い `ast.json` が残る。
   取り残しを探すテストがそれを挙げるので、`rm` で消す
   （受理されるようになった fixture では、その逆）。
   `-u` は、結果のファイルのないすべての fixture にも書き、
   その間に足された、まだ実装していない規則の fixture にも書く。
   `new:` の行は、規則を実装した fixture だけでなければならず、
   それ以外の fixture のファイルは消す（手順 1）。
   結果には、種類ごとの fixture の数を示す。
   fixture のテストが通るときも、これを行う。
   Db を何も変えないノードの誤った変化は、ここにしか現れない。
   state では、浮いた note の id が、
   不注意な編集で最初の文字で終わるようになったことが、ここで分かった。

### 4.8 終える前の確かめ

`packages/parser` で:

```sh
CI=true pnpm run test
```

リポジトリのルートで:

```sh
npx tsc --noEmit -p tsconfig.json
npx eslint packages/parser
pnpm --filter @mmd-toolkit/parser build
pnpm run lint
pnpm run format:check
```

全体は、作業を終えたと報告する前に 1 回だけ回し、変更のたびには回さない。
差分のテストの全件は、計画の工程を終えたと報告する前か、
review に出す前に 1 回、`packages/parser` で、バックグラウンドで、
出力をファイルに書いて走らせる。
件数は環境変数で決まる。
既定より小さい件数では、比較が空振りしていないことを確かめる検査が失敗するので、
既定（種ごとに 300 の入力、fixture ごとに 1 つの変異）以上にする。

```sh
MMD_DIFFERENTIAL_COUNT=5000 CI=true npx vitest run tests/differential/common-mermaid.test.ts
MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/flowchart-mermaid.test.ts
MMD_COMMENT_INPUTS=1000000 MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/sequence-mermaid.test.ts
MMD_COMMENT_INPUTS=1000000 MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/class-mermaid.test.ts
MMD_COMMENT_INPUTS=1000000 MMD_MUTANTS_PER_FIXTURE=20 CI=true npx vitest run tests/differential/state-mermaid.test.ts
```

隣の `<図種>-source-reading.test.ts` は、`<図種>-mermaid.test.ts` と一緒に回す。

各確かめの時間の上限は、入力の数とともに増える
（`tests/differential/run-size.ts` の `timeoutFor`）。
それでも高い負荷のもとで時間切れになる確かめは、
負荷が下がってから走らせ直し、それから判断する。

すべての fixture が 4 層を通り、変異のテストで新しい不一致が出なければ、
作業は終わり。

### 4.9 文書

`.md` と `.ja.md` を同じ変更で直す。

- `packages/parser/README.md`: 対応している図種、型の説明の仕様へのリンク。
- `docs/development.md`: 実装済みのもの、その図種のパーサーの作り。
- `docs/testing.md`: fixture の一覧、図種の木の検査。
- `docs/error-positions.md`: その図種の位置。

`npx prettier --write` をかけ、
`pnpm run lint:docs` と `pnpm run format:check` を通す。
`.ja.md` の改行は、SKILL `conventions` のとおりに書く。

### 4.10 出力

結果として、次を示す。
実装したもの（ファイルごと）、見つけた仕様の欠落と、そのうち残っているもの、
テストの件数と結果、
スナップショットの数（新しいもの、変わったものの種類ごとの数）、
公開した型、直した文書。
主張ごとに、実行して確かめたか、読んで確かめたか、確かめていないかを示す。

## 5. Langium の図

最初の Langium の図である pie のときに書く。
字句解析器（4.4 節）と文法（4.5 節）の手順は、
Langium の文法定義に合わせて変わる見込み。

## 6. fixture が足されたとき、規則が変わったとき

- fixture が足された: 4.7 節の手順 1 から 3 を行う。
  fixture の規則がまだ実装されていなければ、先に実装する。
- 作業中に仕様が変わる:
  変更は、変えた文、欄、fixture の名前とともに知らされてから取り込む。
  作業ツリーは共有なので、書きかけの文書が途中の状態で見える。
  それを読んで実装を変えたり、仮の実装を取り消したりしない。
  state では、既知の差異の草稿を読んで別名の規則を取り消したが、
  その草稿は後で逆に決まった。
  class でも、同じことが先にあった。
- 仕様の規則が変わった、または欠落が埋まった:
  変わった節を読み、4.2 節の手順 2 で確かめてから実装する。
  既存の木が変わるなら、4.7 節の手順 4 を行う。
  報告の前に 4.8 節で確かめ、4.10 節の形で結果を示す。
- 拒否していた形を受理に変える変更や、形を置ける位置を変える変更:
  実装の前に、その形が置ける位置をすべて挙げる。
  その位置で前後に来うる単位も挙げる。
  空白、区切り、コメント、同じ種類の形、ヘッダーである。
  その形を含みうるようになる、範囲からテキストを取る所
  （subgraph の名前のテキスト、スタイルの Db テキストなど）も挙げる。
  挙げたものすべてについて、生成した入力を mermaid.js と比べ、
  食い違いは 1 回でまとめて仕様に知らせる。
  区切りの前の空の説明ブロックを、このようにせず 1 か所ずつ受理に変えたときは、
  subgraph の名前の後の置き場、ブロックのまわりの空白、スタイルの Db テキスト、
  ヘッダーの行、ブロックの後のコメント、文の中のブロックの連なりが、
  1 つずつ後から見つかった。
- ほかの作業の途中で仕様の欠落が見つかった:
  先に仕様を直し（4.2 節の手順 2）、それから上を行う。
- 既知の差異が足された
  （文書は `known-divergences/<識別子>.md`。known-divergences.md が一覧）:
  パーサーは差異を区別しないので、テストが区別する。
  `tests/fixtures.test.ts` の検査にその分岐を足し、
  参照の読み方を、仕様の定義のとおりに書いて、
  「marked fixtures differ only by their divergence」で確かめる。
  参照の読み方は、`tests/helpers/reference-inputs.ts` の参照入力か、
  字句解析器からその差異を除いた mermaid.js である。
  後者は、`comment-takes-character` と同じく、
  `@mmd-toolkit/tests/mermaid` の `withoutDivergences` で、
  tests パッケージが用意するので、頼む。
  `tests/differential/mermaid-comparison.ts` と差分テストに、
  その申告と、申告した違いの確かめを、空振りを防ぐ検査とともに足す。
  参照入力と申告の字句の判断は、すべてパーサーの単位から取る（4.6 節の手順 2）。
  `docs/testing.md` の「既知の差異」と、README の違いの一覧に足す。
- 仕様が、参照の読み方ですべての違いを説明できると主張するときは
  （sequence の `comment-takes-character`）、
  fixture だけでなく生成した入力でもその主張を確かめる（4.6 節の手順 6）。
  受理される fixture の各位置にその形を置き、
  各入力の `parse()` と、参照の読み方の mermaid.js を、
  件数を環境変数で増やせる差分テスト（`MMD_COMMENT_INPUTS`）で比べる。
  ほかの既知の差異は、そこでもほかと同じく申告して確かめる。
  残った種類は、例と mermaid.js の結果と件数を添えて、仕様に報告する。

## 7. mermaid.js を更新するとき

入力: 新しい版で生成し直した fixture と、分類した差分（tests の SKILL）、
それに合わせて直した仕様（spec の SKILL）。
パーサーは、仕様が変わる前に挙動を変えない。

1. 仕様の変わった節を読み、変わった規則ごとに、4.2 節の手順 2 で確かめる。
2. 版に結び付いた箇所を直す。
   `grep -rn '12\.0\.0' packages/parser` で見つかる。
   README、`docs/development.md`、`docs/testing.md`、
   `tests/differential/common-inputs.ts` のコメントで、
   それぞれ `.ja.md` もある。
3. 図種 ID が増えた、または変わった:
   仕様の `detection.md` と `ast.md` の DiagramType に従って、
   `src/detection.ts`、`src/ast.ts` の `DiagramType`、
   `tests/types.test.ts` の `allDiagramTypes`、`tests/detection.test.ts`、
   `tests/differential/common-inputs.ts` の見出しを直す。
4. 仕様の一覧を写した表が、仕様と一致するかを確かめる。
   flowchart と class では、
   両者が共有する `src/unicode-letters.ts` の文字の範囲である。
5. 4.7 節の手順 4 で木の違いを分類し、4.8 節で確かめる。
6. 結果として、直したもの、木の違いの種類ごとの数、残る不一致を示す。

この節の手順は、まだ実際の更新を通していない。
最初の更新のときに、書いてあるとおりに進め、合わないところを直す。

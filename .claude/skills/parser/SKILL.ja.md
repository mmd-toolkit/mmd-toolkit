---
name: parser
description:
  Implement a diagram type in @mmd-toolkit/parser from the specification and the
  fixtures only. This covers its node types, its hand-written lexer and
  recursive-descent parser, the tests on the fixtures, and the recorded trees.
  It also covers recording and checking the parse result of each fixture (its
  tree in ast.json, or its error in parse-error.json), finding gaps in the
  specification, and fixing the parser when the pinned mermaid.js is updated.
  Use when a diagram type is added to the parser, when fixtures are added or a
  rule of the specification changes, or when mermaid.js is updated.
---

# 図種のパーサーを足す（parser）

`@mmd-toolkit/parser` の作業の手順。
図種を仕様だけから実装すること、足された fixture と変わった規則への追従、
pin した mermaid.js の更新を扱う。
図種の実装は、字句解析器、再帰下降パーサー、fixture に対するテスト、
記録した木からなる。
パッケージの方針と基準は「方針と基準」の節にある。
どのパッケージにも当たるものは、AGENTS.md と SKILL `conventions` にある。
手順は図種によらない。

## 方針と基準

`packages/parser`:

- 仕様の参照実装である。
  実装する挙動は、すべて仕様と fixture から取る。
  仕様は `docs/common.md`、`docs/ast.md`、`docs/ast/*.md`、
  `docs/diagrams/*.md` である。
  mermaid.js のソースは仕様の記述を確かめるために読んでよいが、
  実装する挙動の出どころにしてはならない。
  仕様に書かれていないことは mermaid のコードから補わず、
  仕様の欠落として扱う（4.2 節の手順 2）。
- AST を、同じノード名と欄名で TypeScript の型として実装する。
  `docs/ast.md` の共通部は `ast.ts` に、
  `docs/ast/<図>.md` の図種ごとのノードは `ast/<図>.ts` に置く。
- 図種の検出と、図種ごとのパーサーへの振り分け。
- 図種ごとのパーサーは手書きの字句解析器と再帰下降パーサー。
  ジェネレータは使わない。
- fixture に対するテスト: 各 fixture のパースの結果が、
  その隣に記録したもの（`ast.json` か `parse-error.json`）と同じであること、
  受理・拒否が、既知の差異の印の求めるとおりに mermaid.js と合うこと。
  記録した木は `@mmd-toolkit/tests` が確かめる。
  木の条件（`checkTree`）と、
  木から組んだ Db を各 fixture が記録した Db と比べることである。
  テストは mermaid.js も生成した入力も動かさず、
  このパッケージのどのコマンドも動かさない。
  パーサーの文書の、挙動を定める各文は、その場合ごとに fixture を持つ（3 節）。

## 1. 最初に読むもの

1. この文書の「方針と基準」の節（仕様だけから実装し、
   mermaid.js のソースを挙動の出どころにしない）、
   AGENTS.md の「Shared interfaces」と「Principles」（読みやすさ、あるべき形）、
   SKILL `conventions`（正規表現を使わない、見えない文字、文書の決まり）。
   基準は変わるので、作業のたびに読む。
2. `packages/parser/docs/development.md`（パーサーの作りと道具）、
   `docs/tokens.md` と `docs/positions.md`（木のトークン、位置、不変条件）、
   `docs/testing.md`（テストが何を確かめるか）、
   `docs/error-positions.md`（`ParseError` の位置）。
3. 仕様: `packages/spec/docs/common.md`、`ast.md`、`detection.md`、
   `diagrams/<図種>.md`、`ast/<図種>.md`。
   それと `packages/tests/fixtures/<図種>/` の fixture。
   実装する挙動は、ここにあるものだけ。

## 2. 作業ツリー

- この SKILL の手順が書くのは、`packages/parser` と、
  fixture のテストが書く `packages/tests/fixtures/<図種>/<fixture 名>/` の
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
- 確かめ方を変えるために、
  追跡されているファイルを一時的に書き換えない（テストの入力の件数など）。
  途中で止まった実行は元に戻さず、その状態でコミットされることがある。
- Write ツールとシェルのヒアドキュメントは、`\u00a0` のようなエスケープを、
  実際の文字に変えることがある。
  `packages/parser` のソースとテストは ASCII
  だけで書かれている（それ以外の文字は、すべてエスケープで書く）。
  例外は、`src/code-points.ts` のコメントで、
  定数がどの文字かを示す読める文字（`// À`）。
  書いたら、リポジトリのルートで次の 2 つを実行して確かめる。
  1 つ目はそのコメントだけを出し、2 つ目は何も出さなければよい。

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
  テストのファイルが時間切れになることがある。
  時間切れが出たら、そのファイルだけを単独で走らせ直してから判断する。
  時間の長い確かめは、バックグラウンドで動かし、
  出力をリポジトリの外のファイルに書く。
  自分が始めたものだけを、タスクの ID か PID で止める。
  名前で止めない（`pkill -f vitest` は、自分が始めていない実行も止める）。

## 3. 確かめ方（すべての作業で）

- mermaid.js の挙動についての主張は、自分のものも、ほかから来たものも、
  書く前に、リポジトリの外（scratchpad）の probe で確かめる。
  probe は `node --conditions=source` で走らせるスクリプトで、
  `packages/tests` のソースから `runMermaidWithEmbeddedData` と `dbFromTree`
  を読み込む。
  前者は入力に対する mermaid.js の受理と Db を、
  後者は同じ入力のパーサーの木から作った Db を返す。
  probe で分かったことは、コーパスと文に落とし、probe は残さない。
  文が必要とする入力は fixture にする。
  入力と文を tests パッケージに渡して足してもらうか（tests の SKILL）、
  fixtures CLI で自分で足して tests パッケージに知らせる。

  ```sh
  pnpm --filter @mmd-toolkit/tests run fixtures:add <diagram> <name> --note "<the sentence and the case>" < input.mmd
  ```

  テストやコメントに書く例も、そうした入力である。
  flowchart では、`click A`、改行、`cb` は click 文 `click A cb` になるが、
  次の行を `  cb` のように字下げすると拒否される（fixture の
  `flowchart/lex-click-line-feed` と
  `flowchart/lex-click-line-feed-indented`）。

- パーサーの文書の、挙動を定める文を書くか変えるときは、その文が分ける場合と、
  その文の名指す場所で接するほかの規則（ディレクティブ、無視される `;`、
  コメント行、空行、行区切り、空の説明ブロック）を挙げ、
  コーパスに欠けている場合ごとに fixture を頼む（AGENTS.md の Principles）。
  fixture のある場合に入力を足さない。
- 結果では、主張ごとに、実行して確かめたか、コードや文書を読んで確かめたか、
  確かめていないかを区別して示す。
- 新しく対応した図や既存のパーサーの性能レビューを依頼されたら、
  [parser-performance-review](../parser-performance-review/SKILL.ja.md) を使う。
- 変更が影響しうるものだけを回す（SKILL `conventions` の「テストの実行」）。
  作業の途中では、変えたコードの部分に対応するテストのファイルを、
  `packages/parser` で `npx vitest run <ファイル>` として回す。
  `tests/fixtures.test.ts` の図種の部分だけを回すなら、
  `-t "<図種> fixtures"` を付ける。

  | 変えた部分                                                                | テストのファイル                                                                                                                                               |
  | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `src/diagrams/<図種>/`                                                    | `tests/<図種>.test.ts`、`tests/fixtures.test.ts`                                                                                                               |
  | `src/ast.ts`、`src/ast/<図種>.ts`、`src/visitor-keys*`                    | `tests/types.test.ts`、`tests/traverse.test.ts`、`tests/ast-<図種>-examples.test.ts`、`tests/union-docs.test.ts`、flowchart では `tests/ast-flowchart.test.ts` |
  | `src/unit-grammar.ts`、`src/empty-forms.ts`、`src/diagram-*.ts`           | すべての図種の `tests/<図種>.test.ts`、`tests/diagram-parsing.test.ts`、`tests/fixtures.test.ts`                                                               |
  | 共通の規則（`src/source-lexer.ts`、`directives.ts`、`entities.ts` など）  | 同じ名前のテストのファイル、`tests/fixtures.test.ts`                                                                                                           |
  | `src/diagrams/flowchart/subgraph-ids.ts`                                  | `tests/fixtures.test.ts`                                                                                                                                       |
  | `src/parse.ts`、`src/index.ts`                                            | `tests/parse.test.ts`、`tests/readme-example.test.ts`                                                                                                          |
  | `tests/helpers/reference-inputs.ts`、`tests/helpers/known-divergences.ts` | `tests/reference-inputs.test.ts`、`tests/fixtures.test.ts`                                                                                                     |

  文書を読むテストは、その文書だけを変えたときにも回す。
  `tests/readme-example.test.ts`（`README.md` と `README.ja.md` の例）、
  `tests/types.test.ts`（`packages/spec/docs/known-divergences/` の文書）、
  `src/ast.ts` と `src/ast/*.ts` のコメントの例と union
  を読むテスト（`tests/ast-<図種>-examples.test.ts`、
  `tests/union-docs.test.ts`）である。
  全体は、4.8 節のとおりに回す。

## 4. 図種を足すとき

### 4.1 入力

- その図種の仕様が書かれている。
  `packages/spec/docs/diagrams/<図種>.md` の節に「To be written」がない。
  節は、Detection、Lexical structure、文法の外の拒否を含む Grammar、
  Known divergences である。
  `packages/spec/docs/ast/<図種>.md` がある（spec の SKILL）。
- その図種の fixture、
  Db の要約（`packages/tests/docs/db-from-tree/<図種>.md`）、
  記録した木の検査が、`packages/tests` にある（tests の SKILL）。

### 4.2 仕様を読み、欠落を先に扱う

1. `diagrams/<図種>.md` と `ast/<図種>.md` を通して読み、
   実装の単位の一覧をリポジトリの外に作る。
   字句の規則、文法の生成規則、ノードの欄、トークンの種類である。
2. 一覧の各行について、仕様の文と fixture だけで、
   実装が 1 通りに決まるかを確かめる。
   決まらないもの、仕様と fixture が食い違うもの、
   mermaid.js（3 節）と仕様が食い違うものは、仕様の欠落である。
   mermaid.js のソースから埋めず、入力と mermaid.js の結果を添えて、
   先に仕様を直す（spec の SKILL の「When a gap in the specification is
   found」）。
   仕様が決めなければならないことの、
   flowchart の例: 1 文字ずつ読む文脈での実体参照の読み方、
   subgraph の名前の中の `click` のトークンの種類、
   click の文脈の `,` と文の文脈の `,` に、それぞれ別の単位の名前を付けること。
3. 欠落が残っている間は、それに関わらない部分を実装する。
4. 仕様は作業の間にも変わり、
   作ったものに関わることもある（ノードの欄の名前が変わったり、
   欄がなくなったりする）。
   読んだときの文書の写しをリポジトリの外に取っておき、 4.8 節の確かめの前に、
   文書を写しと比べて、変わったところを実装する。

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
   1 つのパーサーを複数の図種 ID が使うことがある（flowchart は `flowchart-v2`、
   `flowchart-elk`、`swimlane`）。
   その `switch` の `default` は、
   `DiagramType` のどの ID にも `case` があることを `satisfies never`
   で確かめる。
   そのため、図種 ID を `DiagramType` に足すこと（7 節の手順 3）は、
   その `case` と同じ変更で行う。
   その後、図種の fixture を記録する（4.7 節）。

### 4.4 字句解析器

1. 入口を `src/diagrams/<図種>/index.ts` に、
   `parse<図種>Diagram(input: DiagramInput): Root` として置く。
   `openDiagramText(input)` で図のテキストを開き、字句解析器で単位に分け、
   文法で文とトークンを作り、`finishDiagram()` に渡す。
   最も小さい手本は `src/diagrams/error.ts`。
   `finishDiagram()` が、トークンの約束の検査、
   `Directive` のトークンとフロントマターのトークンを含むトークンの記録、
   `Root` の組み立てを行う。
   行の規則が無視する `;` は、どの図種でも `IgnoredSemicolon` のトークンである。
   共通の字句解析器が記録し、図種はその種類を決めない。
   共通の字句解析器は、
   トークンの中のディレクティブとそのような `;` のところでトークンを切り、
   切ってはならない種類（`RawText` と `String` 以外のすべて）のトークンなら、
   入力を拒否する（`SourceLexer.recordTokens`）。
   図種はこれを決め直さない。
2. 共通の規則は、`DiagramTextReader` が各位置で適用済み。
   共通の規則とは、ディレクティブ、コメント領域、
   `style` と `classDef` の行の規則、実体参照、行終端子、
   HTML 属性の引用符である。
   図種の字句解析器は、それが返す位置を 1 つずつ読む。
   共通の規則を図種の側で書き直さない。
   図種の文書がテキストの読み方の規則を足していれば、
   `DiagramText` の形の読み手で包む（flowchart では、
   `}` の後の空白を読む `FlowchartText`）。
   ディレクティブを除いたテキストのような派生テキストを、
   中間結果として作らない。
   そうしたテキストは mermaid.js の前処理のパスを繰り返すもので、
   仕様はその代わりに直接の規則を述べている（AGENTS.md の Principles）。
3. ほかの図種の文書も述べる規則は、実装を 1 つにして両方で使う。
   flowchart と class の方向の行は、
   それぞれの値の一覧で `src/direction-line.ts` を使う。
   2 つ目の図種が必要になったときに最初の図種から移し、書き直さない。
4. 仕様の Lexical structure の文脈ごとに、規則を仕様の順に、
   規則 1 つにメソッド 1 つで書く（flowchart では `readInClickContext`、
   `readArrow`）。
   JSDoc で節と規則を名指しする。
   仕様の字句文脈は、スタックで表す。
   字句解析器は `src/unit-lexer.ts` の `UnitLexer` を拡張する。
   `UnitLexer` はスタックを持ち、テキストの終わりまで現在の文脈の規則を当て、
   終わってはいけない文脈でテキストが終わるとエラーを投げる。
   どの図種も、`UnitLexer` が受け取る `END_OF_TEXT_MESSAGES` を与える。
   これは、文脈ごとにそのエラーのメッセージか null を持つ表である。
   図種はほかに、`addUnit` と `readInContext` を与える。
   図種には、その文書が違うと言うことだけを残し、
   同じことの別の書き方は残さない。
   文字は、`src/code-points.ts` の定数と、 `src/character-classes.ts`、
   `src/scanning.ts` で比べる。
   正規表現は使わない。
5. 単位は仕様の名前を持つ。
   単位は `src/diagram-units.ts` の `readUnit` で作る。
   図種の `Unit` は `DiagramUnit<UnitName>` で、
   図種が要るときだけ自分の欄を足す（flowchart では、
   文字列の単位が中身の範囲を持つ）。
   字句解析器が単位を読むときに決め、ノードが持つものは、単位に載せる。
   文法がテキストを別の読み方で読み直さないためである。
   矢印の単位は、矢印の記号と線を持ち、 flowchart ではさらに線の文字の数を持つ。
6. 字句解析器が大文字小文字を区別しないとき（sequence ではすべての規則）は、
   語を `src/scanning.ts` の `matchWordIgnoringCase` と
   `matchWholeWordIgnoringCase` で比べる。
   これらは Notation に従う。
   小文字にしてから比べることはしない。
7. 図種の字句解析器が自分のコメントを読むとき（図のコメント。 sequence では、
   行の終わりまでの `#` と `%`）は、その範囲と値の始まりを返し、
   入口がそれを `DiagramAnalysis.comments` として `finishDiagram()` に渡す。
   共通の部分が、中のディレクティブとともに `Root.comments` に記録する。
   図のコメントの印は、図種の文書が定める。
8. テストのヘルパーが同じ単位を読めるように、
   公開しない入口 `lex<図種>(input)` を置く。
   ヘルパーが要るもの（図のテキスト、単位、
   文脈を出た位置など）を返す（flowchart では `lexFlowchart`）。
   sequence の `lexSequence` は、
   `comment-takes-character` の場所を求めるために、
   文の文脈の規則が一致を始める位置も返す。
9. 1 文字ずつ読む規則がある文脈では、
   実体参照のプレースホルダーを 1 単位として読む（common.md の Entities、
   flowchart では `afterOneCharacter`）。
10. どの規則も一致しない位置では、
    その 1 文字を範囲にして `ParseError` を投げる（`docs/error-positions.md`）。
    テキストが終わるためにだけ一致しないときは、
    代わりにその文脈でのテキストの終わりを、
    その文脈に入ったものの位置で報告する。
    後に空白しかないときがそうで、
    字句解析器が最後の文字の後に読む改行もその空白に入る。
    そうしないと、state の `scale 3` は、
    テキストの後の改行での空の範囲の「予期しない文字」として報告される。
    テキストが終わってはいけない文脈とそのメッセージは、
    図種の `END_OF_TEXT_MESSAGES` にまとめる。
    これは、`UnitLexer` が受け取る、すべての文脈を並べた表である（手順 4）。

### 4.5 文法

1. 単位の上の再帰下降で、仕様の Grammar の生成規則 1 つにメソッド 1 つで書く。
   JSDoc で生成規則を名指しする。
   文法は `src/unit-grammar.ts` の `UnitGrammar` を継ぐ。
   `UnitGrammar` は、単位の読み進め（`take`、`takeIf`、`peek`）、
   ノードの位置（`placeOf`、`placeFrom`）、値の書かれたテキスト、
   共通の葉のノード、項目のトークン（`addItem`）、空の形と、
   読めない単位のエラー（`unexpected()`）を受け持つ。
   図種は、生成規則と `knownDivergenceAt()` を足す。
   `knownDivergenceAt()` は、既知の差異が名指す原因を探す。
   flowchart では `space` の単位の後の `click` と空の形、 sequence では空の形、
   class では空の形か、空のジェネリクスの型の後の単位である。
   単位のトークンの範囲は、
   `src/diagram-units.ts` の `significantRangeOf` で求める。
   ふつうは単位から空白を除いた範囲である。
   mermaid.js が値の一部として読む空白をトークンが持つ単位は、
   字句解析器がほかの `UnitEnds` で読む。
   そうした単位は、パーサーの `docs/tokens/<図種>.md` の Tokens の節が挙げる。
   sequence では `title` の `title-text` の単位と、箱のテキストである。
   class では、ジェネリクスのテキスト、閉じない逆引用符の名前、
   メンバーの行の各部分で、部分の範囲はメンバーの行の分け方が決める。
   項目のトークンがどこで切れるかは `breaksRun()` が決める。
   ほかの項目の単位の間で切れる。
   空白がどの単位にも属さない図種では、
   2 つの単位の間に文字があるところでも切れる。
   state では、内側の空白をトークンに含む `RawText` の項目は除く。
   class では、トークンが空白のない並びである項目、
   つまりスタイルと名前の部分からなる名前は、
   その並びを `runsWithNothingBetween()` から取る。
2. 文法は、ノードと、項目ごとの種類を持つトークン（`PendingToken`）を作る。
   トークンの種類は、パーサーの `docs/tokens/<図種>.md` の Tokens の節から取る。
3. 文法はすべての単位を読み、読み飛ばす単位はない。
   mermaid.js が読まないテキストも、木に置き場所があればノードにする。
   その位置に書けない単位は、どの規則も取らないので、入力を拒否し、
   エラーはその形と、そこに書けないことを示す。
   flowchart では、`tokenless-empty-forms` の空の形、つまり空の文字列、
   空の呼び出し、文を始めない空の説明のブロックである。
   空の形は、どの図種の文法とテストのヘルパーも共有する 1 か所、
   `src/empty-forms.ts` で求める。
   sequence では、空の説明のブロックだけがこれに当たる。
   単位が、どの欄にも属さないまま、
   ノードの範囲に入ることはある（flowchart では、click 文の中の、
   コールバックの `call` と括弧）。
   どこで入るかは、仕様が書いている。
4. 葉のノードの値は、その書かれたテキストである。
   値のソースのテキストから、ディレクティブ、コメント領域、
   行の規則が無視する `;`、
   文としての空の説明のブロックを除いたもの（`ast.md` の Nodes。
   `SourceLexer.textOfRange`）。
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
   待っている文が複数あるとき、
   どれに検査を当てるかを仕様が言っていなければ（sequence では、
   1 つのメッセージの前の 2 つの `create`）、 mermaid.js で確かめ（3 節）、
   欠落として知らせる。
6. 新しい種類の拒否には、`ParseError` の範囲を決め、
   `docs/error-positions.md` とその `.ja.md` に 1 行足す。

### 4.6 テスト

コーパスに基づく構造、トークンの綴り、
範囲の検査は `tests/usecase.test.ts` を手本にする。
保持する無視されたテキストは `tests/agentflow.test.ts`、
ノードのコメントの例は `tests/ast-usecase-examples.test.ts` を手本にする。
足す、または図種の `case` を足すファイル:

| ファイル                             | 足すもの                          |
| ------------------------------------ | --------------------------------- |
| `tests/helpers/node-types.ts`        | 図種のすべてのノード型の `Record` |
| `tests/types.test.ts`                | `Node` の合併型                   |
| `tests/helpers/recorded-diagrams.ts` | `RECORDED_DIAGRAMS` への図種      |
| `tests/ast-<図種>-examples.test.ts`  | ノード型のコメントの例            |
| `tests/helpers/reference-inputs.ts`  | 参照入力のための図種の単位        |
| `tests/<図種>.test.ts`               | 木とトークンの単体テスト          |

記録前の probe（4.7 節）と `tests/fixtures.test.ts` は、
受理の判定に `@mmd-toolkit/tests` の `fixtureAccepts` を使う。
共有の `DIVERGENCE_PROPERTIES` 表が、
各識別子の受理の方向と指定の読みの要否を定める。
必須の `specified.json` がなければエラーとなり、probe やテストを失敗させる。
指定の読みがあれば受理の判定に使う。
印のない fixture は `expected.json` を使う。

`embedded-data-opaque` は受理のどちらの方向でも指定の読みに従い、
Db 比較のために与えられた、導出済みの title と影響を受けない埋め込みの値を保つ。

parser のテストが Db を比べるのは、記録が木を持たない参照入力だけである。
`expectDivergenceForm` が確かめる、トークンを切る形の参照の読みと、
`tests/fixtures.test.ts` の「marked fixtures differ only by their
divergence」の参照入力がそれに当たる。
参照入力の木の Db を、
mermaid.js が fixture の入力に与えた Db （`fixture.expected.db`）と、
`embeddedValuesOf(fixture, fixture.expected)` と `dbOfTree` を使って比べる。
mermaid.js が入力に Db を与えなかった（`db` が null の）ときは、何も比べない。
仕様が除かれると定める secure な鍵を含め、この導出済みの値を、
書かれた埋め込みの設定で置き換えない。

共通の fixture ループは、
対応するすべての図種で `tests/helpers/divergence-form.ts` の
expectDivergenceForm を呼び、宣言された形とトークンを切る形の参照の読みを、
受理の判定と独立に確かめる。

コーパスに基づく場合のテストは、入力と期待結果をローカルの fixture 群に写さず、
fixture を図種と名前で引用して読み込む。

手順:

1. パースの結果を記録に書いて比べ、上の共通の受理検査を使うのは、
   `tests/fixtures.test.ts` だけにする（4.7 節）。
   記録された木が木の条件を満たし、mermaid.js の Db を与えることは、
   コーパスの検査であり、 `@mmd-toolkit/tests` が、
   すべての記録木で確かめる（`check-tree-corpus.test.ts`、
   `db-from-tree.test.ts`）。
   parser のテストは、それを確かめるために fixture をパースし直さない。
   図種のテストは、確かめる場合の fixture を名前で指し、
   その木が持つものを述べる。
   `tests/helpers/tree-problems.ts` は、
   そうしたテストのために木の条件の検査（`checkTree`）を包む。
   記録された木について、受理する読みに Db を組む埋め込みの値がなく、
   `db-from-tree.test.ts` が失敗したときは、入力と記録された読みを添え、
   仕様に知らせる。
2. ノードの範囲の外のテキストが読み方を決める場所を探す。
   flowchart の例: subgraph の名前のテキストは区切りまで続き、
   名前の後に空の説明ブロックが続く所では、
   その間の空白はどのノードにも入らない。
   文の終わりにある、すべて空白の単位は、文の範囲の後にある。
   文の範囲は最後のトークンで終わるからである。
   そうした単位は、範囲の内側からでなく、文の単位の隣から探す。
   そうした場所は、それぞれ範囲を定める文の場合である。
   そこに空白、ディレクティブ、コメント行、
   `click` を置いた fixture を頼む（3 節）。
3. 一度誤った入力は、コーパスの fixture にする。
   失敗の注をつけて、tests パッケージに渡す（tests の SKILL）。

### 4.7 記録したパースの結果

すべての fixture のパースの結果を、入力と並べて記録する。
受理する入力の木は `ast.json` に、拒否する入力の `ParseError` の `message`、
`range`、`loc` は、
`parse-error.json` に置く（`docs/testing.md` の「記録したパースの結果」）。
fixture のテストが、各結果をそのファイルと比べる。
パーサーが拒否を報告する位置も、結果の一部である。

記録は既定の parse(text) の結果とし、
`outcomeOf(fixture.input, fixture.config)` は、
外部のサイト設定だけを受理に適用し、
parse() に設定の引数やオプションを足さない。

1. これらのファイルを書いて読むのは、規則を実装した fixture だけにする。
   先に書くと、いまのパーサーの誤った結果が記録され、記録として通ってしまう。
   書く前に、loadFixtures、fixtureAccepts、embeddedValuesOf、dbFromTree で、
   図種の固定 fixture と該当する common の検出 fixture を probe に通し、
   各文が区別する場合の木とトークンを仕様に照らして読む（4.6 節）。
   決まらない入力は、それぞれ入力と質問を報告し、記録しない。
2. 足りない記録を一覧にし、`packages/parser` で 1 回、
   `pnpm run test:record` で書く。
   これは `tests/fixtures.test.ts` だけを `--update=new` 付きで走らせる。
   パッケージのテストをほかの形で走らせると、足りない記録で失敗し、
   何も書かない。
   `-u` は、既存の結果が変わる変更のときだけ使う（手順 4）。

   ```sh
   pnpm run test:record
   ```

   `-t "<図種> fixtures"` で probe 済みの図種に実行を絞り、
   追跡されたテストを一時的に変えない。

3. 新しい結果を、仕様と照らして読む（`packages/parser` で）。

   ```sh
   pnpm run show-trees <図種> <fixture 名> <fixture 名>
   ```

   ノードごとに、固定の語の欄、値、範囲、
   範囲のテキストが値と違うときはそのテキストを出し、
   その後にトークンを出す（`docs/development.md` の「道具」）。
   新しい `parse-error.json` はそのまま読む。
   その `range` は、
   `docs/error-positions.md` が拒否を置く位置でなければならない。
   既知の差異なら原因の形で、メッセージは原因を示す。
   結果の見込みが分かっているときは、結果に、
   fixture ごとに見込みと結果を並べて示す。
   受理されるはずの fixture が拒否される、またはその逆なら、
   そのファイルを残さずに、それを示す。

4. `-u` を使うのは、既存の結果が変わる変更のときだけ。
   その変更の前に、fixture をリポジトリの外の新しいディレクトリに写す。
   変更の後に、
   `tests/fixtures.test.ts` だけを `-u` 付きで走らせる `pnpm run test:update`
   で書き直し、 `packages/parser` で違いを分類する。

   ```sh
   cp -R ../tests/fixtures/<図種> <ディレクトリ>/ast-before
   pnpm run test:update
   pnpm run diff-trees <ディレクトリ>/ast-before <図種>
   ```

   生の木と読み込んだ JSON ではなく、
   シリアライズした記録かバイト列のハッシュを比べ、新規・変更・削除を分ける。

   新しくできたファイルとなくなったファイル、
   違いの種類ごとの fixture の数を出し（違いの種類は、同じノードの型の同じ欄か、
   エラーの同じ欄）、その後に違いを 1 つずつ出す。
   違いの種類がすべて、変更で説明できなければならない。
   説明できない種類があれば、`-u` の結果を受け入れずに調べる。
   変更で拒否されるようになった fixture には `parse-error.json` が書かれ、
   古い `ast.json` が残る。
   取り残しを探すテストがそれを挙げるので、
   `rm` で消す（受理されるようになった fixture では、その逆）。
   `-u` は、結果のファイルのないすべての fixture にも書き、その間に足された、
   まだ実装していない規則の fixture にも書く。
   `new:` の行は、規則を実装した fixture だけでなければならず、
   それ以外の fixture のファイルは消す（手順 1）。
   結果には、種類ごとの fixture の数を示す。
   Db が読まない欄を持つノードの誤った変化は、ここにしか現れない。
   state では、浮いた note の id を最初の文字で終わらせる編集が、
   そうした変化である。
   葉のノードの値の文字列と、状態図の note の位置が、そうした欄である。
   記録との比較だけでは再現性しか確かめないため、
   書き直すときも木の条件と Db の独立した検査を保つ。
   lib を参照する検査は、パーサーのビルドが完了してから始める。
   その後、`packages/tests` でコーパスの検査を行う。

   ```sh
   npx vitest run tests/check-tree-corpus.test.ts tests/db-from-tree.test.ts
   ```

### 4.8 終える前の確かめ

`packages/parser` で:

```sh
CI=true pnpm run test
```

`packages/tests` で、記録した木へのコーパスの確かめ（4.7 節の手順 4）:

```sh
npx vitest run tests/check-tree-corpus.test.ts tests/db-from-tree.test.ts
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

すべての fixture が fixture のテストを通り、
記録した木が `@mmd-toolkit/tests` の木の検査を通って、
コーパスが記録した Db を与え、作業で書いたか変えた文のすべてが、
その場合ごとに fixture を持てば（3 節）、作業は終わり。

### 4.9 文書

`.md` と `.ja.md` を同じ変更で直す。

- `packages/parser/README.md`: 「対応している図」の表の、その図の行。
  図種 id、ヘッダー、ノードの文書を書く。
- `docs/development.md`: その図種のパーサーの作り。
- `docs/testing.md`: fixture の一覧、図種のテストが確かめること。
- `docs/error-positions.md`: その図種の位置。

`npx prettier --write` をかけ、
`pnpm run lint:docs` と `pnpm run format:check` を通す。
`.ja.md` の改行は、SKILL `conventions` のとおりに書く。

### 4.10 出力

結果として、次を示す。
実装したもの（ファイルごと）、見つけた仕様の欠落と、そのうち残っているもの、
テストの件数と結果、記録した結果の数（新しいもの、変わったものの種類ごとの数）、
公開した型、直した文書。

## 5. 最初の一致を採る字句規則、隠れた形式、意味による受理条件

この節は、隠れた形式を含む字句規則を、
最初に一致したものを採る優先順位の一覧として仕様が定める図種に使い、
意味による受理の手順は、その条件を仕様が定める場合だけ当てる。
入力、つなぎ込み、テスト、記録は 4 節の手順を使う。

1. 図種名は [conventions](../conventions/SKILL.ja.md#コード) に従い、
   内部のモジュールとヘルパーは、実装する規則で名付ける。
2. 字句規則を仕様の優先順位で最初に一致する順に実装し、
   複合した一致は書かれた構成要素の境界で分け、文脈のスタック、最長一致、
   回復処理は仕様が定める場合だけ使う。
   共通の変換は共有の読み手から読み、検出が図のために残したものを保ち、
   通過済みの裸の行と、それに伴う trivia は再び読まない。
3. 隠れた形式は、指定された種類と元の綴りで、
   名指しされた AST のすべての隙間に保持する。
   見出しの前や任意の見出し欄の前も、置き場があれば含む。
   消費した直後の LF はノードの範囲の外に置き、
   EOF で EOL を満たすのは仕様が定める場合だけとする。
4. 意味による受理の検査は、必要な初期状態と文ごとの状態遷移も含め、
   共通の変換と文法の後に仕様の直接の文から適用し、
   足りない規則ごとに入力と質問を報告し、その fixture は記録しない。
5. 引用符とエスケープの解釈、実体参照、空白と大文字小文字、置換の順、
   重なりの扱い、置換結果を再び読むかの比較規則を明文で求め、
   AST の値は元の綴りを保つ。
   元の綴りを保つ葉から比較値を得られなければ、
   字句解析時の比較値を意味の検査まで持ち渡す。
   数値は他の図種の前提を持ち込まず、その図種の仕様の変換と境界条件を適用する。
6. 受理は仕様が名指す既定値で評価し、
   フロントマターの設定と init の引数を不透明に保ち、
   外部のサイト設定だけを 4.7 節のとおりその所有者に任せ、
   公開の parse(text) のインターフェースを変えない。
7. 記録の前に、4.6 節の受理・Db・宣言された形の共通検査を使い、
   4.7 節のとおり仕様が区別する場合の木を読む。
   記録と受理の検査は `tests/fixtures.test.ts` に置く。

## 6. fixture が足されたとき、規則が変わったとき

- fixture が足された: 4.7 節の手順 1 から 3 を行う。
  fixture の規則がまだ実装されていなければ、先に実装する。
- 作業中に仕様が変わる: 変更は、変えた文、欄、fixture の名前を、
  変更の記録（commit の説明や、変更を渡す依頼）で示したときに取り込む。
  取り込むのは、そこに示されたものである。
  示される前の文書は何も決めていない。
  それを読んで実装を変えたり、仮の実装を取り消したりしない。
  書きかけの文書の規則は、書き終わるまでに取り下げられたり、逆に決まったりする。
- 仕様の規則が変わった、または欠落が埋まった: 変わった節を読み、
  4.2 節の手順 2 で確かめてから実装する。
  既存の木が変わるなら、4.7 節の手順 4 を行う。
  報告の前に 4.8 節で確かめ、4.10 節の形で結果を示す。
- 共通検査を集約するときは、前後で `(fixture, check)` の対象と実行回数を比べ、
  減った重複呼び出しと増えた場合を説明し、
  回数を合わせるための図種の除外は作らない。
- 拒否していた形を受理に変える変更や、形を置ける位置を変える変更: 実装の前に、
  その形が置ける位置をすべて挙げる。
  その位置で前後に来うる単位も挙げる。
  空白、区切り、コメント、同じ種類の形、ヘッダーである。
  その形を含みうるようになる、
  範囲からテキストを取る所（subgraph の名前のテキスト、
  スタイルのテキストなど）も挙げる。
  挙げたものは、それぞれその形を受理する文の場合である。
  それぞれの fixture を頼み（3 節）、食い違いは 1 回でまとめて仕様に知らせる。
  区切りの前の空の説明ブロックなら、一覧には、subgraph の名前の後の置き場、
  ブロックのまわりの空白、スタイルのテキスト、ヘッダーの行、
  ブロックの後のコメント、文の中のブロックの連なりが入る。
  1 か所ずつ受理に変えると、残りの場合が読まれないまま残る。
- ほかの作業の途中で仕様の欠落が見つかった: 先に仕様を直し（4.2 節の手順 2）、
  それから上を行う。
- 既知の差異が足された（文書は `known-divergences/<識別子>.md`、
  一覧は known-divergences.md）: パーサーは差異を区別しないので、
  テストが区別する。
  既存の識別子には `fixtureAccepts` を再利用する（4.6 節）。
  図種を足すことで、受理の表や図種専用のヘルパーを足さない。
  新しい識別子では、tests パッケージに、
  方向と指定の読みの要否を共有の `DIVERGENCE_PROPERTIES` 表に足し、
  検査を行うよう頼む。
  `tests/helpers/divergence-form.ts` の expectDivergenceForm を通じて、
  宣言された形の共通検査を広げ、
  対応するすべての図種で共通の fixture ループから呼ぶ。
  一方向の差異で、`fixture.expected` が受理を記録し、Db が null でない場合は、
  `tests/helpers/reference-inputs.ts` に、
  Db が記録された Db と一致する参照入力を置く。
  共有の表が指定の読みを必須とする場合は、tests パッケージに、
  共通の指定の読みの経路でコーパスの `specified.json` を作るよう頼む。
  申告を `tests/helpers/known-divergences.ts` に足す。
  参照入力と申告の字句の判断は、独自の規則でなく、すべてパーサーの単位から取る。
  `docs/testing.md` の「既知の差異」と、README の違いの一覧に足す。
- 仕様が、
  参照の読み方ですべての違いを説明できると主張するときは（sequence の
  `comment-takes-character`）、その形を置ける各場所が、その主張の場合である。
  それぞれの fixture を頼み（3 節）、読み方で説明できない場合は、
  入力と mermaid.js の結果を添えて仕様に報告する。

## 7. mermaid.js を更新するとき

入力: 新しい版で生成し直した fixture と、分類した差分（tests の SKILL）、
それに合わせて直した仕様（spec の SKILL）。
パーサーは、仕様が変わる前に挙動を変えない。

1. 仕様の変わった節を読み、変わった規則ごとに、4.2 節の手順 2 で確かめる。
2. 版に結び付いた箇所を直す。
   `packages/parser` で古い版の番号を `grep -rn` すると、
   README と `docs/development.md` に見つかり、それぞれ `.ja.md` もある。
   mermaid.js のソースへのリンクは、固定した commit の permalink である。
   仕様の更新が出す、古いリンクと新しいリンクの表に従って、
   それぞれを新しい commit のリンクに置き換え、
   `node scripts/check-mermaid-links.mjs` で確かめる。
3. 図種 ID が増えた、
   または変わった: 仕様の `detection.md` と `ast.md` の DiagramType に従って、
   `src/detection.ts`、`src/ast.ts` の `DiagramType`、
   `tests/types.test.ts` の `allDiagramTypes`、
   `tests/detection.test.ts` を直す。
   増えた ID は、
   まず `tests/fixtures.test.ts` の `DIAGRAM_TYPES_WITHOUT_BODY` に入れる。
   次に本体を書き（4 節）、本体を足す変更で、上の箇所を直し、ID を一覧から消す。
4. 仕様の一覧を写した表が、仕様と一致するかを確かめる。
   flowchart と class では、
   両者が共有する `src/unicode-letters.ts` の文字の範囲である。
5. 4.7 節の手順 4 で木の違いを分類し、4.8 節で確かめる。
6. 結果として、直したもの、木の違いの種類ごとの数、残る不一致を示す。

更新のときに合わない手順があれば、それを直す。

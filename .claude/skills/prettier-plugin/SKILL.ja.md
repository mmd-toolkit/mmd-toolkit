---
name: prettier-plugin
description:
  Add the printer of a diagram type to prettier-plugin-mmd, or update the
  printers after mermaid.js is updated. Use when the parser supports a new
  diagram type and its formatting is to be decided and implemented, or when the
  pinned mermaid.js changes. It covers deciding the formatting choices, the
  printer, the fixtures, and the documents.
---

# 図種の printer を足す（prettier-plugin）

`prettier-plugin-mmd` に図種の printer を足す手順と、
mermaid.js の更新のときに printer を直す手順。
会話の履歴や記憶がなくても、この文書だけで同じ品質で進められるように書く。
パッケージの方針と基準は「方針と基準」の節にある。
どのパッケージにも当たるものは、AGENTS.md と SKILL `conventions` にある。

## 方針と基準

`packages/prettier-plugin-mmd`:

- 図種ごとの printer への振り分け。
- 解析に失敗した入力は変更せず返す。
- Markdown 内の mermaid フェンスを対象にし、テストする。
- 図種ごとの printer は、項目ごとに明示的に決めた整形方針に従う。
- 4 点のテスト: 冪等、整形前後の Db 一致、失敗時は無変更、
  Markdown 内のフェンス。

## 1. 最初に読むもの

1. この文書の「方針と基準」の節、AGENTS.md の Principles、SKILL `conventions`。
   1 つ目には、このパッケージの責任と 4 点のテストがある。
   2 つ目には、正しい形と、コミットしないことがある。
   3 つ目には、正規表現を使わないこと、autofix の結果を読むこと、
   見えない文字、英語と日本語の文書の対、文章の折り返し、
   Mermaid のテキストのコードブロックの info string は `mmd` であることがある。
   基準は変わるので、毎回読む。
2. 図種の仕様: `packages/spec/docs/diagrams/<図種>.md`
   （字句の規則、文法、Db の組み立て）と、
   木の定義 `packages/spec/docs/ast.md` と `packages/spec/docs/ast/<図種>.md`。
   printer の規則は、ここにあるノードの型、欄、トークンの種類で書く。
3. このパッケージの文書。
   `docs/development.md` は、テストと fixture の構成、printer の作りを書く。
   `docs/<既存の図種>.md`（例: `docs/flowchart.md`）は、
   整形の規則とその理由を書く。
   これが決定の置き場所であり、項目の立て方と、制限の書き方の手本になる。
   `docs/compatibility.md` は、mermaid.js と違う箇所と、
   書かれたまま残す箇所をどう書くかの手本になる。

この手順が書くのは `packages/prettier-plugin-mmd` と、この SKILL だけ。
ほかのパッケージを直す必要が出たら、
そのパッケージの SKILL の手順で直す。
仕様の欠落は spec の SKILL、木の変更は parser の SKILL、
fixture は tests の SKILL で直す。
コミットとプッシュは、求められたときだけ行う（AGENTS.md）。
ステージを変えず、`git mv` を使わない。
作業ツリーを共有しているとき、ステージされた内容はほかの作業のものかもしれない。
ファイルの移動と削除は `mv` と `rm` で行う。

## 2. 始める条件（入力）

- parser が図種を実装し、
  その木の型 `packages/parser/src/ast/<図種>.ts` と、
  `visitorKeys` を公開している（parser の SKILL の出力）。
  木が定まるまで、木に依存するコードを書かない。
- `@mmd-toolkit/tests` に、
  図種のコーパス（`packages/tests/fixtures/<図種>/`）と Db の要約関数がある。

## 3. 整形方針を決める

printer の規則は、項目ごとに選ばれた選択肢で決まる。
printer を書く前に、選択肢の一覧を作り、決定を求める。

1. 仕様の文法と木から、整形で変えうる箇所を列挙する。
   flowchart で項目にしたものの種類は次のとおり（例であり、図種で増減する）:
   - 字下げの単位、入れ子の字下げ
   - 文の区切り（`;`）、1 行に複数の文、空行
   - トークンの間の空白、演算子（矢印など）の前後の空白
   - 値の内側の空白（ラベルの両端など）、値の書き方（ラベルの形式など）
   - 長い行の折り返し、複数行に書かれた文と値
   - コメントとディレクティブの位置
   - フロントマターの YAML
   - 書かれたまま残すもの（Db に効くもの）
2. 各項目に、選択肢、例（整形の前と後）、推奨とその理由を付ける。
   Db が変わる選択肢は、そうと書く。
3. 選択肢ごとに、整形の前と後のテキストを mermaid.js に掛け、
   Db が変わらないことを確かめる。
   手で書いた 1〜2 例で済ませず、
   選択肢が分ける場合ごとに fixture を置く（6 節）。
   確かめた結果を【実行】として添える。
4. 一覧を示して決定を求め、選ばれた選択肢を実装する。
5. 決定は、規則の文書 `docs/<図種>.md`（英日）に、規則とその理由として書く。
   Db に効くために書かれたまま残すものと、mermaid.js と違う箇所は、
   `docs/compatibility.md` にも書く。
   決定を残す場所は、この 2 つの文書だけにする。

## 4. printer を書く

構成は次のとおり（`src/printers/` の下）:

- `index.ts` の `diagramPrinters` に、図種の本体のノードの型と printer を足す。
  dispatch は型で決まる。
- すべての図種に共通の部分は、共通のモジュールにある。
  それを使い、図種の printer に写さない。
  `blocks.ts` は、ブロックの文、その間のコメントとディレクティブ、
  文を区切る `;`、空行、ブロックを開く行と閉じる行を印字する
  （`printBlock`、`printDiagramBlock`、`printClosedBlock`、`openingLine`）。
  `atoms.ts` と `layout.ts` は、印字する単位（原子）と、
  その間の隙間の規則で文を組み立てる
  （`printAtoms`、`collectAtoms`、`collectValueNodes`、`accDescr` のブロック）。
  `kept-lines.ts` は、自分の `;` を持つ行と、行の始まりと終わりを決める。
  `source.ts` の `isStructural` は、
  どのトークンがノードの構造に属するかを決める。
  図種が、共通のモジュールがしないことを要するときは、それを広げ、
  1 つの判定を 1 か所に保つ。
- 図種ごとに、次のファイルがある。
  printer（`<図種>.ts`）は、ノードの型で振り分け、
  `blocks.ts` に `BlockRules` を渡す。
  `BlockRules` は、保つ行、文の印字の終わり、文を持つ文、
  トップレベルで落とす文と、
  コメントの後の空白だけの行を残すかどうかを伝える。
  文とブロックの見出しの配置と、決まった項目の隙間の規則は
  `<図種>-layout.ts` に、保つ行は `<図種>-kept-lines.ts` に置く。
  `BlockRules` は図種の文の型をとるので、その関数にキャストは要らない。
  図種の文に種類があるときは、その種類を 1 つの関数で決める。
  種類とは、1 つの本体を持つブロック、節を持つブロック、
  ほかの文を持たない文などである。
  その関数の switch は、文の型をすべて挙げ、各 case を種類の型と照らし、
  最後の `satisfies` の検査で、挙げ忘れた文の型を捕まえる
  （`sequence-layout.ts` の `classifySequenceStatement`）。
  ほかの所は型の一覧を持たず、その関数に問う。
- 値のノード（`Identifier`、`StringLiteral`、ラベルなど）は、
  範囲のテキストをそのまま印字する。
  値の一覧は図種ごとにある。
  flowchart は `flowchart-layout.ts` の `valueNodeTypes`、
  sequence は `sequence-layout.ts` の `sequenceValueNodeTypes` である。
  `tests/value-nodes.test.ts` がそれを、図種の木の型
  （名前が図種の名前で始まる型と、共有する葉のノード）と結ぶ。
  そこに新しい葉のノードの型が足されたら、このテストが失敗するので、
  値か例外かを決めて一覧に足す。
  新しい図種は、その一覧をこのテストに足す。
- 隙間（`gap.ts`）: 原子の間にあるコメント、ディレクティブ、
  行単位の規則が無視する `;` は、項目として書かれたまま印字し、
  項目の各側に空白があったかどうかを保つ。
  空白を足す・消す規則は、項目のない隙間にだけ使う。
  隙間の読み方は `readGapElement` の 1 か所にあり、ほかの走査もこれを使う。
- 図種によらない共通の部分は、`root.ts`、`frontmatter-yaml.ts`、
  `parser.ts`、`printer.ts` にある。
  フロントマター、本文の前のコメントとディレクティブ、ファイル末尾の改行、
  Markdown のコードブロックがそれに当たる。
  図種の printer は本文から末尾までを印字する。

書くときの手順:

1. 決まった項目ごとに、規則を木から決める形で書く。
   トークンのテキストを字句解析し直さない。
   木にない字句の事実が要るときは、仕様の字句の節で見つけ、
   fixture を置き（6 節）、
   仕様の節を指すコメントを付けた明示の規則にする（5 節）。
2. 実行時に整形の結果を parser で読み直して比べる仕組みは作らない。
   規則の欠けを隠すだけで、規則にならない。
3. 1 つの判定は 1 か所に置く。
   例は、行の始まりと終わりの定義、隙間の要素の読み方、保つ行の判定。
   呼び出し側が守るべき暗黙の約束を残さない。
4. `eslint --fix` などの autofix の結果は、差分を読んで確かめる。
   空の JSDoc や雛形が入ることがある。
5. コメントの説明は、何をなぜするかを書き、仕様の節と、
   規則の文書の見出しを指す。
   例: `(docs/flowchart.md, Label inner whitespace)`。

## 5. 規則を足したり変えたりしたとき

決定の後に欠けが見つかり、規則を足したり変えたりするときは、
同じ変更の中で、規則の文書 `docs/<図種>.md` の該当の規則に、
規則とその理由、例を足す。
必要なら `docs/compatibility.md` にも足す。
結果として、規則の文面、再現する入力、mermaid.js の結果（整形の前と後）、
仕様の根拠を示す。
決定した選択肢を変える規則なら、実装する前に、その根拠を示して決定を求める。
文書より先に実装だけが残ると、決定と実装がずれる。

狭い例外（例: 斜めの形の閉じ `?]` と `=]` の前には空白を置かない）も、
同じように文書に書く。

## 6. テスト

4 点のテスト（「方針と基準」の節）に、次を加える。
構成は `docs/development.md` にある。

- fixture 形式: 規則ごとに 1 つのフォルダー。
  ファイルは `tests/fixtures/<図種>/<規則>/<例>-input.mmd` と `-output.mmd`、
  必要なら `-options.json`。
  出力は `pnpm --filter prettier-plugin-mmd run test:update` で書き出し、
  差分を読んで意図した整形かを確かめる。
  `tests/format.test.ts` が、出力の一致、冪等、
  木が表す Db の一致、埋め込みデータが書かれたままであることを確かめる。
  U+2028 や U+2029 のような不可視文字を含むテキストは、
  この package の fixture にしない。
  `tests/line-separators.test.ts` のように、テストのコードにエスケープで書き、
  書いた後にファイルのバイト列を確かめる。
  その文字をそのまま持つのは、`packages/tests/fixtures/` のコーパスだけ。
- Db の保ち方（`tests/db-reading.ts`。fixture、コーパス、
  line-separators のテストが使う）: mermaid.js は動かさない。
  `dbOfText` が、テキストの木から、`@mmd-toolkit/tests` の `dbFromTree` で
  Db を作る。入力の埋め込みデータから mermaid.js が導く値を使い、
  コーパスの fixture はそれ（`embeddedValuesOf`）と入力の Db を記録していて、
  整形後のテキストはその Db を持たなければならない。
  ほかのテキストは既定の値で、自分の整形後のテキストと比べる。
  入力の値を使うので、`writtenEmbeddedTexts`（ディレクティブとデータブロックの
  書かれたテキスト）が整形の前後で同じであること、
  フロントマターは書かれたままか Prettier の YAML 整形の出力であること
  （`describeFrontmatterChange`）も確かめる。
  データブロックを持つテキストは、mermaid.js の効果がないと Db が作れないので、
  書かれたテキストだけを確かめる。
  データブロックのノードの型は、`@mmd-toolkit/tests` の
  `DATA_BLOCK_NODE_TYPES` で、仕様の AST の文書と同じであることは
  そちらのテストが保つ。
- unit 形式: dispatch、失敗の扱い、Markdown のコードブロック。
  ファイルは `tests/dispatch.test.ts`、`failure.test.ts`、
  `markdown.test.ts`、`markdown-flowchart.test.ts`。
  図種を足したら、Markdown の中で実際に整形される例を足す。
- コーパス: `tests/corpus.test.ts` が、
  `@mmd-toolkit/tests` の図種の fixture のうち整形するものすべてで、
  冪等と Db の一致を確かめる。
  読み込む図種を足す。
- 見つけて直した失敗の入力は、コーパスの fixture にする。
  コーパスのテストが毎回整形する（例外を出さず、冪等で、
  Db と埋め込みデータを保つ）。
  直した失敗は、その fixture が守る。
  コーパスの fixture は `@mmd-toolkit/tests` で作る。
- fixture は文に答える。
  規則の文書（`docs/<図種>.md`、`docs/compatibility.md`）の
  振る舞いを定める文ごとに、その文が分ける場合のそれぞれと、
  その文が名指す場所で接するほかの規則のそれぞれ
  （ディレクティブ、無視される `;`、コメント行、空行、行区切り
  （U+2028、U+2029）、空の説明ブロック、その文の言葉が名指すもの）に、
  整形の fixture を置く。
  fixture は文と一緒に書き、mermaid.js で 1 回確かめる。
  どこで見つかった失敗も、fixture と、欠けていた文で閉じる。
  テストもコマンドも入力を生成せず、入力を乱数や数（seed、件数）で選ばない。
- 文書のテスト（`tests/docs.test.ts`）: 規則の文書ごとに、その見出しと、
  図種の fixture のフォルダー、
  例のコードブロックと fixture のファイルが一致することを確かめる。
  新しい規則の文書は、そこの `ruleDocuments` に足す。

どのテストを回すか。
全パッケージの決まりは SKILL `conventions` の「テストの実行」にあり、
ここにはこのパッケージに固有のことを書く。

- コードの部分と、その変更が影響しうるテストのファイル。
  作業の途中は、
  `pnpm vitest run --project prettier-plugin-mmd <ファイル>` で回す。
  `-t <図種>`（小文字）で絞れるのは、
  テストの名前に図種が入る 2 つのファイルだけである。
  `format` と `corpus`（名前が `<図種>/` で始まる）。
  `-t` を付けると、ほかのファイルは丸ごと飛ばされ、何も失敗しない。
  そのため、ほかのファイルは `-t` なしで回す。
  - 共有のモジュール: `blocks.ts`、`atoms.ts`、`gap.ts`、`layout.ts`、
    `lines.ts`、`source.ts`、`kept-lines.ts`。
    すべての図種のテスト、つまりパッケージ全体。
  - `flowchart*.ts`: `format`、`corpus` を `-t flowchart` で。
    `-t` なしで `markdown-flowchart`、`value-nodes`。
  - `sequence*.ts`: `format` と `corpus` を `-t sequence` で。
    `-t` なしで `line-separators`、`sequence-layout`、
    `markdown-sequence`、`value-nodes`。
  - `class*.ts`: `format` と `corpus` を `-t class` で。
    `-t` なしで `markdown-class`、`value-nodes`。
  - `state*.ts`: `format` と `corpus` を `-t state` で。
    `-t` なしで `line-separators`、`markdown-state`、
    `value-nodes`。
  - `er*.ts`: `format` と `corpus` を `-t er` で。
    `-t` なしで `line-separators`、`markdown-er`、
    `value-nodes`。
  - `gantt*.ts`: `format` と `corpus` を `-t gantt` で。
    `-t` なしで `line-separators`、`markdown-gantt`、
    `value-nodes`。
  - `journey*.ts`: `format` と `corpus` を `-t journey` で。
    `-t` なしで `line-separators`、`markdown-journey`、
    `value-nodes`。
  - `requirement*.ts`: `format` と `corpus` を `-t requirement` で。
    `-t` なしで `line-separators`、`markdown-requirement`、
    `value-nodes`。
  - `statement-rules.ts`、`accessibility-lines.ts`:
    それを使う図種、ER と requirement のテスト。
  - `index.ts`、`parser.ts`、`printer.ts`、`root.ts`、`frontmatter-yaml.ts`:
    `dispatch`、`failure`、`markdown`、`plugin`と、
    図種ごとのファイル。
  - `tests/db-reading.ts`、`tests/helpers.ts`:
    それを import するすべてのテスト。
- 文書を読むテスト: `tests/docs.test.ts` は、
  規則の文書（`docs/<図種>.md`。英語と日本語）、README、
  fixture のフォルダーを読む。
  これらのどれかを変えたら、文書だけの変更でも回す。
  ほかに文書を読むテストはない。
- 既定の実行は `pnpm vitest run --project prettier-plugin-mmd` で、
  fixture、コーパス、単体テスト。
  完了を報告する前に 1 回回す。

作業ツリーやマシンをほかの作業と共有しているとき:

- 負荷が高いと、コーパスのテストが 5 秒の上限を過ぎて失敗することがある。
  そのテストだけを単独で走らせ直し、通れば負荷による失敗とする。
- ワークスペースの lint やテストが、
  ほかの作業が編集中のファイルで失敗することがある。
  このパッケージの外のファイルには触らず、結果にそう書く。
- 実行を止めるときは、自分の実行をプロセスの id で止める。
  名前で `pkill` しない（ほかの作業の実行も止まる）。

## 7. 文書

- `docs/<図種>.md` と `.ja.md`: 規則ごとに `###` の見出し、規則の説明、例。
  見出しを小文字にし、空白を `-` にしたものが fixture のフォルダーの名前。
  説明は、mermaid.js がどう読むから、そうするのかを書く。
  例は fixture のファイルへのリンクの行と、その中身の `mmd` のコードブロックで、
  `tests/docs.test.ts` が一致を確かめる。
  行末の空白が要る例は、コードブロックに残らないので載せず、
  フォルダーを指す（例のない規則は `docs.test.ts` の一覧に足す）。
- 例のコードブロックを手で写すと、fixture とずれる。
  下書き（見出しと文と、例を置く場所の印）から、
  fixture の中身を差し込んで文書を作り、
  `npx prettier --write` を掛ける（文章は 80 桁で折り返される）。
- `docs/compatibility.md` と `.ja.md`: mermaid.js と違う箇所と、
  整形が書かれたまま残す箇所を、理由とともに書く。
- `README.md` と `.ja.md`: 対応する図種、保証と制限。
  見出し `Guarantees and limitations` は、ルートの README からリンクされている。
  変えるときは、ルートの README のリンクも直す。
- 書いたら `pnpm run format:check`、`pnpm run lint:docs`、
  `pnpm run lint:chars` を通す。

## 8. 確かめ方と出力

- パッケージのテストが、報告の前に 1 回通る。
  あわせて `npx tsc --noEmit`（ルート）、自分のパッケージの `npx eslint`、
  上の文書の検査が通る。
- 何を回し、何を回していないかを書く。
- 結果として、項目（決定の項目、所見）ごとに次を示す: 変えたファイルと内容、
  再現例の結果（受理の維持、Db の一致、冪等、例外なし）、
  足した fixture。
  主張ごとに、実行して確かめたか（【実行】）、
  読んで確かめたか（【読解】）を区別して示す。

## 9. つまずいた点（手順として）

- 例を 1〜2 個手で書いて確かめると、場合を見落とす。
  規則の文が分ける場合と、それに接する規則を列挙し、
  それぞれに fixture を置いてから、規則を直す。
- 木の範囲の外の空白が Db に効く場所がある。
  flowchart の例: スタイルの並びの最後の、空白だけのスタイル（範囲の外にある）、
  subgraph の名前の後の空白（id が変わる）、ラベルの先頭の空白（形が変わる）、
  ディレクティブの後の、最初のスタイルの始まりの空白。
  範囲の外を印字するときは、仕様の「範囲のテキスト」の定義を読み、
  ディレクティブと無視される `;` の扱いを確かめる。
- 範囲の端と、ほかの項目の範囲を混同しない。
  保つ範囲がノードの範囲を途中で切ると、
  そのテキストを二度印字する（`collectAtoms` は、そのとき例外を投げる）。
  ディレクティブは複数行にまたがるので、行の終わりを改行の位置だけで決めない。
- 字句の事実で、木に現れないものは、
  整形の結果を読み直して防ぐのではなく、仕様の節を指す明示の規則にする。
  flowchart の例は、改行も一緒に読む語の後の `;`、字下げで方向の行になる行、
  行単位の規則が無視する `;`。
- Prettier について:
  - `hardline` は行末の空白を消す。
    行末の空白を残すときは `literalline` と、明示の字下げを使う。
  - Markdown の埋め込みは、結果の末尾の改行を消し、
    エラーを黙って捨てる（`PRETTIER_DEBUG` を設定すると投げる）。
    書かれたまま返すときは、パーサーで投げて辞退する。
  - Prettier は、BOM を取り除いてからパーサーに渡し、CRLF を LF にする。
  - Prettier は一番上のノードの `comments` を読んで、コメントの付着を試みる。
    木の `comments` は文書のノードで包んで渡す。
  - `embed` は、扱わないノードで `null` を返す。
  - `printDocToString` は `endOfLine` を見る。
- Write ツールと bash の heredoc は `\uXXXX` を実際の文字に変える。
  書いた後に非 ASCII の文字を grep し、エスケープに直す。
- 追跡されているファイルを、確かめのために一時的に書き換えない。
  作業ツリーに一時のテストファイルを置かない。
  作業ツリーを共有していると、ほかの作業のテストの実行に入るからである。
  確かめのスクリプトは作業用のディレクトリに置き、絶対パスで import する。
  plugin のソースを import して Node で動かすスクリプトは、テストと違い、
  `@mmd-toolkit/parser` と `@mmd-toolkit/tests` を `lib/` のビルドから読む。
  そのため、先に `pnpm --filter @mmd-toolkit/parser run build` と
  `pnpm --filter @mmd-toolkit/tests run build` で作り直す。
- 文書の例を下書きから作り直すときは、
  下書きが最新か（ほかの人が文書を直接直していないか）を、作り直す前に確かめる。

## 10. mermaid.js の更新のとき

1. mermaid.js の pin の更新、fixture の再生成、差分の分類は、
   tests の SKILL の手順で先に行う。
   その結果を入力にする。
2. 通常のテスト一式を回す。
3. 失敗を分類する:
   - コーパスや fixture の Db が、
     整形の前後で違う: mermaid.js の字句や文法が変わり、
     printer の規則の前提（仕様の節）が変わった。
     仕様を先に直し（spec の SKILL）、それから規則を直す。
   - 整形の前の入力の受理や Db が変わった: printer の問題ではない。
     fixture の出力を書き出し直し、差分を読む。
   - 例外や冪等でない出力: printer の欠け。
4. 規則を変えるときは 5 節のとおり文書に書き、fixture、規則の文書、
   `docs/compatibility.md`、README を合わせる。
5. 規則のコメントが指す仕様の節と mermaid.js のリンクが、
   新しい版でも合っているかを確かめる。

## 11. Jison の図と Langium の図

- Jison の図（flowchart など）: 上の手順のとおり。
  字句の規則は仕様の「字句の規則」の節にあり、
  木に現れない字句の事実は、その節にある。
- Langium の図（pie など）: pie のときに書く。

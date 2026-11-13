---
name: prettier-plugin
description:
  Add the printer of a diagram type to prettier-plugin-mmd, or update the
  printers after mermaid.js is updated. Use when the parser supports a new
  diagram type and its formatting is to be decided and implemented, when the
  pinned mermaid.js changes, or when the plugin's entry changes (index.ts,
  parser.ts, printer.ts, its options, or its languages). It covers deciding the
  formatting choices, the printer, the fixtures, and the documents; mmdfmt, the
  command-line tool that formats with the plugin, has a skill of its own.
---

# 図種の printer を足す（prettier-plugin）

`prettier-plugin-mmd` に図種の printer を足す手順と、
mermaid.js の更新のときに printer を直す手順。

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
2. 図種の仕様: `packages/spec/docs/diagrams/<図種>.md` と、
   木の定義 `packages/spec/docs/ast.md` と `packages/spec/docs/ast/<図種>.md`。
   printer の規則は、ここにあるノードの型、欄、トークンの種類で書く。
3. このパッケージの文書。
   `docs/development.md` は、テストと fixture の構成、printer の作りを書く。
   `docs/<既存の図種>.md`（例: `docs/flowchart.md`）は、
   整形の規則とその理由を書く。
   決定はここに置く。
   項目の立て方と制限の書き方の手本にもなる。
   `docs/compatibility.md` は、mermaid.js と違う箇所と、
   書かれたまま残す箇所の書き方の手本になる。

図種名は `conventions` の規則に従い、
パスと fixture の分類では小文字の ASCII 英数字の 1 語、
ノードの型の接頭辞ではその語の先頭を大文字にした形を使い、
mermaid.js 自身のテキスト・値・設定の鍵・ソースのパスを持つ所だけ、
mermaid.js の綴りを使う。

この手順が書くのは `packages/prettier-plugin-mmd` と、この SKILL だけ。
ほかのパッケージを直す必要が出たら、そのパッケージの SKILL の手順で直す。
仕様の欠落は spec の SKILL、木の変更は parser の SKILL、
fixture は tests の SKILL で直す。
作業ツリーは、
スキル conventions の
[作業ツリーの扱い](../conventions/SKILL.ja.md#作業ツリーの扱い) のとおりに扱う。

## 2. 始める条件（入力）

- parser が図種を実装して `visitorKeys` を公開し、
  `@mmd-toolkit/ast` がその木の型 `packages/ast/src/ast/<図種>.ts`
  を公開している（parser の SKILL の出力）。
  木が定まるまで、木に依存するコードを書かない。
- `@mmd-toolkit/tests` に、
  図種のコーパス（`packages/tests/fixtures/<図種>/`）と Db の要約がある。
- `checkTree` は木の条件（欄・範囲・トークン）を確かめ、
  受理は parser の木・エラーの結果と、
  `@mmd-toolkit/tests` の `fixtureAccepts` を比べて確かめる。
- 宣言した差異の印の字句の形は、受理とは別に、
  parser の共有の `expectDivergenceForm` の経路で確かめ、
  図種ごとの printer のテストには写さない。

## 3. 整形方針を決める

各項目の印字する形は、
整形ツールの文書
[印字する形の決め方](../../../packages/prettier-plugin-mmd/docs/printed-form.ja.md)
の決まりが、その順に決める。
記号の隣の空白（コロンは、どの種類かを決める 3 つの手順）、
次にほかの図の種類が同じ種類の隙間に印字する形、次に綴り、の順である。
決まりは、どの形がいちばん読みやすいかを定めたものである。
印字する形は、読みやすさのためにある。
決まりを順に当てるのは、判断する人によって形が変わらないようにするためである。
どの決まりも形を決めない所では、公開済みの版の出力を、
作業をしている人の判断だけで変えない。
より読みやすいと考える形は、書かれた文と両方の出力を付けて利用者に提案し、
決まったことをこれらの決まりに足す。

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
2. 各項目について、その文書の決まりのうち、その形を決める決まりを順に探し、
   その決まりが要る事実を集める。
   事実とは、Prettier が同じ種類の記号の隣に印字する空白、
   ほかの図の種類が同じ隙間に印字する形、
   固定した mermaid.js の文書の例での各形の数、のいずれかである。
   選択肢の形に、例（整形の前と後）、決める決まり、事実を付ける。
   Db が変わる形は、そうと書く。
3. 選択肢の形ごとに、整形の前と後のテキストを、
   固定した mermaid.js と対象にする版（その文書を参照）に掛け、
   Db が変わらないこと、
   それらのどの版もその形を受け付けて同じに描くことを確かめる。
   どれかが拒否するか違って描く形は、印字しない。
   選択肢が分ける場合ごとに fixture を置く（6 節）。
   確かめた結果を【実行】として添える。
4. 決まりが決めた形を実装する。
   公開済みの版が印字した出力を変える形と、
   どの決まりも形を与えない所でよりよく見える形は、先に利用者に示す。
   書かれた文、古い出力と新しい出力、新しい形を与える決まり（あれば）、
   推奨を添え、利用者が決め、決まったことを決まりに足す。
5. 決定は、規則の文書 `docs/<図種>.md`（英日）に、規則とその理由として書く。
   理由は、その形を決めたその文書の決まりと、その決まりが要る事実である。
   「読みやすいから」とだけ書いた理由は、読む人に何も伝えない。
   なぜ読みやすいかを言う決まりを、名指しして書く。
   決まりを当てた形が、描くものが同じになる別の形より読みにくいときは、
   そう書いて、この節の手順 4 のとおり、別の形を利用者に提案する。
   決まりの方が誤っているからである。
   Db に効くために書かれたまま残すものと、mermaid.js と違う箇所は、
   `docs/compatibility.md` にも書く。
   決定を残す場所は、この 2 つの文書だけにする。

## 4. printer を書く

構成は次のとおり（`src/printers/` の下）:

- `index.ts` の `diagramPrinters` に、図種の本体のノードの型と printer を足す。
  表には、parser の本体の型のすべてに項目があるので、
  新しい図種の printer を足し忘れると型検査が失敗する。
- すべての図種に共通の部分は、共通のモジュールにある。
  それを使い、図種の printer に写さない。
  `blocks.ts` は、ブロックの文、その間のコメントとディレクティブ、
  文を区切る `;`、空行、ブロックを開く行と閉じる行を印字する（`printBlock`、
  `printDiagramBlock`、`printClosedBlock`、`openingLine`）。
  `atoms.ts` と `layout.ts` は、印字する単位（原子）と、
  その間の隙間の規則で文を組み立てる（`printAtoms`、`collectAtoms`、
  `collectValueNodes`、`accDescr` のブロック）。
  説明ブロックは共有の `layoutDescriptionBlock` を通し、
  空白だけの内側を `{}` にする決定を全図種で共有し、詰めを試み、
  できなければ元の layout に戻す判断は共有の
  `layoutCompactEmptyDescriptionBlockWithFallback` に置き、
  図種の printer に独自の空ブロックの判断を書かない。
  graph 系（flowchart・agentflow）だけは、
  `graph-layout.ts` で文書が定める行の例外を先に判定してから共有の
  `layoutCompactEmptyDescriptionBlock` を呼び、
  詰められなければ通常の文の配置に戻す。
  `kept-lines.ts` は、自分の `;` を持つ行と、行の始まりと終わりを決める。
  `source.ts` の `isStructural` は、
  どのトークンがノードの構造に属するかを決める。
  図種が、共通のモジュールがしないことを要するときは、それを広げる。
- 図種ごとに、次のファイルがある。
  printer（`<図種>.ts`）は、ノードの型で振り分け、
  `blocks.ts` に `BlockRules` を渡す。
  `BlockRules` は、保つ行、文の印字の終わり、文を持つ文、
  トップレベルで落とす文と、コメントの後の空白だけの行を残すかどうかを伝える。
  文とブロックの見出しの配置と、
  決まった項目の隙間の規則は `<図種>-layout.ts` に置き、
  図種固有の処理が残る場合だけ、保つ行を `<図種>-kept-lines.ts` に置く。
  隠れた形を保つ平らな本文は、
  `flat-hidden-diagram.ts` の `createFlatHiddenDiagramPrinter`
  に図種と無視するノードの型、見出し・文の layout を渡して印字し、
  見出しの契約は最初の atom がヘッダーの語から始まることを定める。
  この関数は `keepsPrefix` も返すので、
  `src/printers/index.ts` の `diagramTextRules` に登録する。
  `BlockRules` は図種の文の型か、
  1 行に残る文をまとめた単位（ブロック図）をとるので、
  その関数にキャストは要らない。
  図種の文に種類があるときは、その種類を 1 つの関数で決める。
  種類とは、1 つの本体を持つブロック、節を持つブロック、
  ほかの文を持たない文などである。
  その関数の switch は、文の型をすべて挙げ、各 case を種類の型と照らし、
  最後の `satisfies` の検査で、
  挙げ忘れた文の型を捕まえる（`sequence-layout.ts` の
  `classifySequenceStatement`）。
  ほかの所は型の一覧を持たず、その関数に問う。
- 値のノード（`Identifier`、`StringLiteral`、ラベルなど）は、
  範囲のテキストをそのまま印字する。
  値の一覧は図種ごとにある。
  flowchart は `flowchart-layout.ts` の `valueNodeTypes`、
  sequence は `sequence-layout.ts` の `sequenceValueNodeTypes` である。
  `tests/value-nodes.test.ts` がそれを、
  図種の木の型（名前が図種の名前で始まる型と、共有する葉のノード）と結ぶ。
  そこに新しい葉のノードの型が足されたら、このテストが失敗するので、
  値か例外かを決めて一覧に足す。
  新しい図種は、その一覧をこのテストに足す。
- 隙間（`gap.ts`）: 原子の間にあるコメント、ディレクティブ、
  行単位の規則が無視する `;` は、項目として書かれたまま印字し、
  項目の各側に空白があったかどうかを保つ。
  空白を足す・消す規則は、項目のない隙間にだけ使う。
  隙間の読み方は `readGapElement` の 1 か所にあり、ほかの走査もこれを使う。
- 図種によらない共通の部分は、`root.ts`、`frontmatter-yaml.ts`、`parser.ts`、
  `printer.ts` にある。
  フロントマター、本文の前のコメントとディレクティブ、ファイル末尾の改行、
  Markdown のコードブロックがそれに当たる。
  図種の printer は本文から末尾までを印字する。

書くときの手順:

1. 決まった項目ごとに、規則を木から決める形で書く。
   トークンのテキストを字句解析し直さない。
   木にない字句の事実が要るときは、仕様の字句の節で見つけ、
   fixture を置き（6 節）、
   仕様の節を指すコメントを付けた明示の規則にする（このスキルの 5 節）。
2. 実行時に整形の結果を parser で読み直して比べる仕組みは作らない。
   規則の欠けを隠すだけである。
3. 1 つの判定は 1 か所に置く。
   例は、行の始まりと終わりの定義、隙間の要素の読み方、保つ行の判定。
   呼び出し側が守るべき暗黙の約束を残さない。
4. `eslint --fix` などの autofix の結果は、差分を読んで確かめる。
   空の JSDoc や雛形が入ることがある。
5. コメントの説明は、何をなぜするかを書き、仕様の節と、
   規則の文書の見出しを指す。
   例: `(docs/flowchart.md, Label inner whitespace)`。

## 5. 規則を足したり変えたりしたとき

決定の後に規則を足したり変えたりするときは、同じ変更の中で、
規則の文書 `docs/<図種>.md` の該当の規則に、規則とその理由、例を足す。
必要なら `docs/compatibility.md` にも足す。
結果として、規則の文面、再現する入力、mermaid.js の結果（整形の前と後）、
仕様の根拠を示す。
決定した選択肢を変える規則なら、実装する前に、その根拠を示して決定を求める。

狭い例外（例: 斜めの形の閉じ `?]` と `=]` の前には空白を置かない）も、
同じように文書に書く。

## 6. テスト

4 点のテスト（「方針と基準」の節）に、次を加える。
構成は `docs/development.md` にある。

- fixture 形式: 規則ごとに 1 つのフォルダー。
  ファイルは `tests/fixtures/<図種>/<規則>/<例>-input.mmd` と `-output.mmd`、
  必要なら `-options.json`。
  出力は `pnpm --filter prettier-plugin-mmd run test:update` で書き出し、
  差分を読む。
  `tests/format.test.ts` が、出力の一致、冪等、木が表す Db の一致、
  埋め込みデータが書かれたままであることを確かめる。
  U+2028 や U+2029 のような不可視文字を含むテキストは、
  この package の fixture にしない。
  `tests/line-separators.test.ts` のように、テストのコードにエスケープで書き、
  書いた後にファイルのバイト列を確かめる。
- Db の保ち方（`tests/db-reading.ts`。fixture、コーパス、
  line-separators のテストが使う）: mermaid.js は動かさない。
  `dbOfText` が、テキストの木から、
  `@mmd-toolkit/tests` の `dbFromTree` で Db を作る。
  入力の埋め込みデータから mermaid.js が導く値を使い、
  コーパスの fixture はそれ（`embeddedValuesOf`）と入力の Db を記録していて、
  整形後のテキストはその Db を持たなければならない。
  ほかのテキストは既定の値で、自分の整形後のテキストと比べる。
  入力の値を使うので、
  `writtenEmbeddedTexts`（ディレクティブとデータブロックの書かれたテキスト）が、
  整形の前後で同じであること、フロントマターは、
  書かれたままか Prettier の YAML
  整形の出力であること（`describeFrontmatterChange`）も確かめる。
  データブロックを持つテキストは、mermaid.js の効果がないと Db が作れないので、
  書かれたテキストだけを確かめる。
- 記録との比較では `reading = fixture.specified ?? fixture.expected` と
  `embeddedValuesOf(fixture, reading)` を使い、読みが受理で、Db が null でなく、
  埋め込み値があるときだけ Db を比べる。
- `embedded-data-opaque` は仕様の
  [比較する Db](../../../packages/spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)
  に、
  リポジトリのルートの `tools/src/specified-reading.ts` の共有の
  `specifiedRunOf` の経路で従い、拒否の原因の埋め込みブロックか、
  受理条件が名指す設定の鍵だけを除き、Mermaid が導くタイトルと、
  ほかの設定を保つ。
- 整形されるが比べる Db のない場合はテストと報告に明示し、
  共有の冪等と原文の検査はその場合にも当てる。
- `tests/format.test.ts` と共有の `tests/corpus.ts` は、
  全図種に `tests/db-reading.ts` の `writtenTextKeptUpToSeparators` を当て、
  フロントマターと空白の外のテキストを、入力の `;` と、
  複数行に印字するデータブロックの項目間の `,` の削除だけを認めて比べ、
  Db を比べられない場合も確かめる。
  この共有の検査は値の中の空白や `;` の保持と、
  削除された `,` が項目の区切りで文字列の一部でないことを証明しないので、
  その規則には出力全体を比べる fixture を置き、mermaid.js で確かめる。
- unit 形式: dispatch、失敗の扱い、Markdown のコードブロック。
  ファイルは `tests/dispatch.test.ts`、`failure.test.ts`、`markdown.test.ts`、
  `markdown-flowchart.test.ts`。
  図種を足したら、Markdown の中で実際に整形される例を足す。
- コーパス: `tests/corpus.test.ts` は `@mmd-toolkit/tests` の共通の fixture
  を読み、
  `tests/corpus/<diagram>.test.ts` は同パッケージのその図種の fixture を読む。
  それぞれ `tests/corpus.ts` の `testCorpus` を呼び、整形する fixture すべてで、
  例外を出さず、冪等で、Db と埋め込みデータを保つことを確かめる。
  新しい図種にはファイルを足す。
- 整形の失敗は、コーパスの fixture が守る。
  コーパスの fixture は `@mmd-toolkit/tests` で作る。
  `pnpm run lint`
  が締め出す失敗（[`conventions`](../conventions/SKILL.ja.md#コード) の SKILL
  にある、呼び出しの引数への配列の展開）は、代わりにその規則が守る。
- fixture は文に答える。
  規則の文書（`docs/<図種>.md`、
  `docs/compatibility.md`）の振る舞いを定める文ごとに、
  その文が分ける場合のそれぞれと、
  その文が名指す場所で接するほかの規則のそれぞれに、整形の fixture を置く。
  接する規則は、
  [AGENTS.md の「行動原則」](../../../AGENTS.ja.md#行動原則) が挙げるもの。
  fixture は文と一緒に書き、mermaid.js で 1 回確かめる。
  失敗は、fixture と、欠けている規則を述べる文で閉じる。
  テストもコマンドも入力を生成せず、入力を乱数や数（seed、件数）で選ばない。
- fixture は規則の文が分ける場合から作り、corpus の入力を写さない。
  異なる場合ごとに最小の入力を書き、同じ場合を示すものはまとめ、
  corpus の入力は `[corpus fixture: ...]` で引用する。
  ファイルとエスケープで書いた入力の両方を corpus 全入力とバイトで比べて、
  写しが残っていないことを確かめる。
- `rejected-inputs`フォルダーを作らない。
  受理する差異の入力は規則のフォルダーへ置き、拒否はcorpusテストで確認する。
- 文書のテスト（`tests/docs.test.ts`）: 規則の文書ごとに、その見出しと、
  図種の fixture のフォルダー、
  例のコードブロックと fixture のファイルが一致することを確かめる。
  新しい規則の文書は、そこの `ruleDocuments` に足す。

どのテストを回すか。
全パッケージの決まりは SKILL `conventions`
の「[テストの実行](../conventions/SKILL.ja.md#テストの実行)」にあり、
ここにはこのパッケージに固有のことを書く。

- コードの部分と、その変更が影響しうるテストのファイル。
  作業の途中は、
  `pnpm vitest run --project prettier-plugin-mmd <ファイル>` で回す。
  `-t <図種>`（小文字）は、
  名前が `<図種>/` で始まる `format` と `corpus` の各ファイルの fixture を絞る。
  コーパスだけを回す場合は `tests/corpus/<diagram>.test.ts` を渡す（共通の
  fixture は `tests/corpus.test.ts`）。
  `-t` を付けると、ほかのファイルは丸ごと飛ばされ、何も失敗しない。
  そのため、ほかのファイルは `-t` なしで回す。

  ソースのファイルごとのテストのファイルは、
  [references/tests-by-changed-file.ja.md](references/tests-by-changed-file.ja.md)
  にある。
  変えたファイルの名前で検索する。
  図種のファイルはその図種の名前で始まり（`flowchart*.ts`）、共有のモジュール、
  `error.ts`、`index.ts`、テストの補助は、その名前で挙げてある。

- 文書を読むテスト: `tests/docs.test.ts` は、規則の文書（`docs/<図種>.md`。
  英語と日本語）、README、fixture のフォルダーを読む。
  これらのどれかを変えたら、文書だけの変更でも回す。
- 既定の実行は `pnpm vitest run --project prettier-plugin-mmd` で、fixture、
  コーパス、単体テスト。
  完了を報告する前に 1 回回す。
- 共有の印字を切り出す・変えるときは、
  既存の呼び出し元すべての fixture・エスケープの例・corpus を、
  既定と `tabWidth: 0` の両方で前後のバイト列で比べ、拒否の結果も残す。

マシンの負荷が高いとき、
またはワークスペースにこの作業と関係のない失敗があるとき:

- 負荷が高いと、コーパスのテストが 5 秒の上限を過ぎることがある。
  単独で走らせ直し、通れば負荷による失敗とする。
- ワークスペースの lint やテストが、
  このパッケージの外のファイルで失敗することがある。
  このパッケージの外のファイルには触らず、結果にそう書く。

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
  fixture の中身を差し込んで文書を作り、`npx prettier --write` を掛ける。
- `docs/compatibility.md` と `.ja.md`: mermaid.js と違う箇所と、
  整形が書かれたまま残す箇所を、理由とともに書く。
- `README.md` と `.ja.md`: 対応する図種、保証と制限。
  見出し `Guarantees and limitations` は、ルートの README からリンクされている。
  変えるときは、ルートの README のリンクも直す。
- 書いたら `pnpm run format:check`、`pnpm run lint:docs`、
  `pnpm run lint:chars` を通す。

## 8. 確かめ方と出力

- 報告の前に、`npx tsc --noEmit`（ルート）、自分のパッケージの `npx eslint`、
  上の文書の検査が通る。
- 何を回し、何を回していないかを書く。
- 結果として、項目（決定の項目、所見）ごとに次を示す: 変えたファイルと内容、
  再現例の結果（受理の維持、Db の一致、冪等、例外なし）、足した fixture。
  主張ごとに、実行して確かめたか（【実行】）、
  読んで確かめたか（【読解】）を区別して示す。

## 9. 避ける誤り

- 規則の文が分ける場合は、手で書いた 1〜2 個の例が示す場合より多い。
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
- 字句の事実で、木に現れないものは、整形の結果を読み直して防ぐのではなく、
  仕様の節を指す明示の規則にする。
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
- 作業ツリーの扱いと、確かめのスクリプトの書き方は、
  スキル conventions の
  [作業ツリーの扱い](../conventions/SKILL.ja.md#作業ツリーの扱い) と
  [リポジトリの外で動かすスクリプト](../conventions/SKILL.ja.md#リポジトリの外で動かすスクリプト)
  のとおりにする。
- 文書の例を下書きから作り直すときは、
  下書きが最新か（文書に直接の修正が入っていないか）を、作り直す前に確かめる。

## 10. mermaid.js の更新のとき

手順は [references/updating-mermaid.ja.md](references/updating-mermaid.ja.md)
にある。

## 11. Jison の図と Langium の図

- Jison の図（flowchart など）: 上の手順のとおり。
  木に現れない字句の事実は、仕様の「字句の規則」の節にある。
- Langium の図: 上の手順のとおり、仕様の AST から印字する。
  エンジン自体は印字の規則を変えない。
  図種の仕様で次を確かめる。
  - 最初の一致の優先順と、キーワード・構成要素の境界。
  - 意味による受理条件: 文法を満たしていても拒否する条件は、既定値、サイト設定、
    テキスト内の設定の扱いを含め、仕様の直接の文を要する。
  - 比較値: 仕様が定める変換の順と等値の規則を、
    printer が保持する書かれた綴りと分けて読む。
  - 字句規則が定める場合の、隠れた YAML・ディレクティブ。
    保持する各ノードは、
    仕様が定める AST のフィールドか本体の要素に原文のまま保持する。
    規則が node の範囲外で消費する LF と、閉じの後の空白も保持する。
    どちらも受理を決める場合がある。
    atom 間のこれらの隙間には、
    `hidden-forms.ts` の `protectHiddenGaps` で `writtenGapsBefore` を設定する。
  - 検出がヘッダーに達する前に読み飛ばしたテキスト。
    先頭の空行やコメントを整えると無視された YAML がフロントマターになる場合は、
    4 節の printer の `keepsPrefix` で前置き全体を保つ。
  - 行の値: 文法が次行の値を読まない場所では結合しない。
  - 図種のコーパスが印を付けた差異の識別子: その識別子の仕様の読みを使い、
    テキスト内の設定が受理を変える場合は、
    `embedded-data-opaque` の両方向を確かめる。

## 12. mmdfmt

- プラグインの `languages`、拒否したテキストの扱い、オプションを変えるときは、
  同じ変更でツールも、スキル [mmdfmt](../mmdfmt/SKILL.ja.md) で直す。
- プラグインの `index.ts`、`parser.ts`、`printer.ts` を変えたときも、
  `pnpm vitest run --project mmdfmt` を走らせる。

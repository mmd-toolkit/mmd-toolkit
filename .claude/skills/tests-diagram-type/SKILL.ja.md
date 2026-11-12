---
name: tests-diagram-type
description: >-
  Add a diagram type to @mmd-toolkit/tests: read mermaid.js's grammar and Db for
  it, write its Db normalizer and its section of docs/db-summaries.md, and
  collect and hand-write its fixtures. Use when a diagram type is added, before
  its specification is written, and when another step refers to the table of
  summary fields or to docs/db-summaries.md, together with the tests skill.
---

# 図種を足すとき（tests-diagram-type）

SKILL [tests](../tests/SKILL.ja.md) の 1〜4 の節（方針と基準、最初に読むもの、
作業ツリーの扱い、確かめ方）は、この手順にも当たる。
先に読む。

図種は 1 つずつ足し、1 つの図種を、正規化関数と fixture（この SKILL）、
仕様（spec-diagram-type と spec の SKILL）、parser（parser の SKILL）、
printer（prettier-plugin の SKILL）の順に終えてから次の図種に進む。
後の作業は前の作業の結果を使う。
仕様と parser は要約の欄の一覧（`docs/db-summaries.ja.md`）を参照し、
仕様の主張と parser のテストは fixture を使う。
木から要約を作る手順は、仕様の木の文書の後に、
SKILL [tests-tree-checks](../tests-tree-checks/SKILL.ja.md) のとおり、
`docs/db-from-tree/<図種>.ja.md` と `src/db-from-tree/<図種>.ts` に書く。

Chevrotain の図種にも同じ手順を適用し、トークン定義を字句規則として読む。
単位を決めるのはトークンの順序、有効な mode、明示的な `longer_alt` であり、
一般的な最長一致ではない。
パーサーが木を回復しても、字句エラーは構文エラーより先に入力を拒否する。
パーサーの rule メソッドを文法規則、model builder の検証を受理条件として読む。
それぞれを区別する場合を集め、
トークン数だけでは確かめられない mode の切替と優先順位の組合せも含める。

Langium の図種では、
先に [references/reading-langium.ja.md](references/reading-langium.ja.md)
の手順で、mermaid.js の文法を読む。

## 1. 入力

- 足す図種の名前と、同じ Db を使う図種 ID の一覧。
  図種 ID は、mermaid.js の検出器の一覧と、図種の定義の `db` から分かる。
  1 つの検出器が、いくつもの宣言の語を受け持つことがある。
  `classDiagram` と `classDiagram-v2` は、
  どちらも `classDiagram` として検出される。
  図種の fixture は、図種 ID がいくつあっても 1 つのディレクトリに置く。
  図種名の規則は [conventions](../conventions/SKILL.ja.md#コード) にある。
- pin した版のタグの mermaid.js の clone。
  作り方は `tools/README.md` にある。

## 2. 正規化関数

1. clone の中で、文法、AST から Db への adapter があればそれ、Db の実装、
   renderer を開く。
   private・closure 内の状態と、
   公開の呼出しを全部挙げる（Jison の `yy.` 呼出しか、
   上で導いた adapter の呼出し）。
   Db がブラウザのグローバル（`window`、`document`、`Option`、
   `CSS`）を読む箇所をすべて探し、それが mermaid の解析中に動くのか、
   描画の後にだけ動くのかを確かめる。
   class の click のコールバックと tooltip は描画の後に動くので、何も要らない。
2. 要約に含める欄の案を、欄ごとに、renderer が読む所、構文が決めるか、
   含める理由、落とすものと理由の表にする。
   ほかの Db メソッドが読むというだけで、解析・検証用の状態を残さず、
   値を代入しない keyword、捨てる AST の値、build 定数から欄を作らない。
   空の要約も正しい結果である。
   次のものは落とす候補として必ず問う（括弧の中は flowchart と sequence
   での例）。
   - 描画から導く値、描画が埋める値（`domId`、
     sequence の `actorCnt` と `rectData`）。
   - ほかの欄から一意に導ける値（`textStyles`、
     sequence のメッセージの `id` とノートの一覧）。
   - サイト設定でだけ変わる値（`securityLevel: loose` のときだけ付く
     `haveCallback`）。
     構文が決める欄で、サイト設定でも変わるものは含める。
     Db のパッチが、ほかの設定のときの値を記録する（class のリンクの target は、
     `securityLevel: sandbox` のときに `_top` になる）。
     `securityLevel` を変えて全件を流し、要約が変わらないことを確かめる。
   - 値に残る空白（style の値の末尾の空白）。
     描く側のコードがそれを読まないと示せたときだけ落とす。
     整形が変えることは、落とす理由にならない。
     整形したテキストは同じ Db を作らなければならず、Db を変える整形は、
     それ自身の例外である（AGENTS.md の 4）。
     辺を描くコードは style の値の末尾の空白を読み（矢じりの色は、style のうち、
     後ろに 1 文字以上ある最初の `stroke:` の値を `trim()` して取る）、
     sequence の空白だけの題は題として場所を取るので、どちらも残す。
   - `@{ ... }` のデータブロックだけが設定する欄。
     これは要約に含め、
     `dataBlockEffects` で実装に渡す（`docs/embedded-data.md`）。
   - 利用者が書いたキーを持つオブジェクト。
     データブロックの中身、`[|field:value|]` の props、
     sequence の links と properties がそれに当たる。
     `__proto__` のようなキーがどうなるかを、fixture で確かめる。
     own property として残る（flowchart）か、
     プロトタイプを置き換える（sequence の links と properties）。
     後者は `toJson` が拒むので、
     プロトタイプを最初の項目 `__proto__` として記録する。
   - Db が読んだものを 2 つ以上の形で持つときの、要約の元。
     各要素を 1 度ずつ、それに当たるものとともに持つ形を取る。
     たいていは描画が読むもの。
     ほかの形を取らない理由を書き残す（state: 文の木は何も変えない文を持ち、
     状態の表は最上位だけを持つので、
     要約はレイアウトのデータ `getData()` から取る）。
     collection の走査順、置換の位置、生成の順序を区別し、
     renderer がそれぞれを必要とする場合だけ残す。
   - mermaid.js が無作為に作る id（state の、最後の `--` の後の領域）。
     綴りから推測せず、公開時に、書かれた id と生成 id のどちらかを記録する。
     生成された同一性・参照と証明できる位置だけを、定めた生成順で置き換え、
     後の文に書かれたものも含め、著者の placeholder 名を予約する。
     著者のテキストから id に見える部分文字列を探さない。
     記録が変換より前で、公開が変換後に由来を決めるなら、converter を写さず、
     記録が依る同値性を明記してテストする。
     拒否後の reset と、生成の 2 回の安定を確かめる。
   - テキストではなく、実行の時刻や偶然に依る値（gantt は日付を、
     プロセスのタイムゾーンで計算し、
     タスクでない id の後ろの開始では今日の日付を読む）。
     これまでの結果の貯蔵庫（`docs/expected-results.md`）は、
     別の日に作った結果を返す。
     そのため、そうした値は要約から落とすか、その図種の結果を貯めないか、
     依るものを貯蔵庫の鍵に入れる。
     gantt の要約は日付を持たない。
     Db が日付を計算するのは図を描くときだけだからである。
     確かめは、すべての fixture を別の日、別のタイムゾーン（`TZ=...`）、
     別の順で動かし直し、`expected.json` と比べて行う。
3. 表を決めてから書く。
   決める根拠は、
   AGENTS.md の正しさの基準（受理する入力の Db は mermaid.js と一致する）と、
   要約は構文が決める情報だけを持つこと（`docs/db-summaries.md`）、
   使う側への影響（仕様の Db の正規化の節、parser が Db を導く方法）。
   分からない形（データブロックの記録など）は、
   リポジトリの外の作業用のディレクトリで試作して確かめてから決める。
4. `packages/tests/src/normalizers/<図種>.ts` に正規化関数を書き、
   `src/normalizers/index.ts` に、同じ Db を使う図種 ID をすべて登録する。
   Db のパッチが要るか（リンクを `utils.formatUrl()` で保存する、
   データブロックを持つ）を確かめ、
   要るなら同じファイルに書いて `dbPatches` に登録する。
   登録には、mermaid が受理し、
   その図種 ID として検出するテキストを添える（`classDiagram`
   だけでは拒否されるので、class の見本は class を 1 つ持つ）。
   `runMermaid()` は、どの入力を解析するよりも前に、
   すべての Db クラスにパッチを当てる。
   Db のメソッドが、Node にないブラウザの関数（`window`、`document`、
   `Option`）を呼ぶと、`MermaidEnvironmentError` になる。
   そのときは、パッチがその呼び出しの間だけ、
   その関数の代役を与える（`src/normalizers/browser-stand-ins.ts`）。
   mermaid の処理は書き写さない。
   代役が何を答えるかは、実装が比べる相手を決める。
   そのため、選択肢と推奨を示して決定を求め、
   決まったものを `docs/expected-results.md` に書く。
   データブロックの効果は、`data-blocks.ts` の `blockEffect` で、
   ブロックのない状態とある状態の要素の要約を比べて記録する。
   比べ方は、文法がブロックをどう渡すかで決まる。
   別の呼び出しで渡すなら、その呼び出しの前後を比べる（flowchart）。
   要素を足すのと同じ呼び出しで渡すなら、
   ブロックなしで 1 回実行して Db の一覧を元に戻し、
   本来の呼び出しと比べる（sequence）。
   すべての図が共有する 1 つのオブジェクトで、
   状態をモジュールの変数に持つ Db は、クラスを持たない（gantt）。
   そのパッチは `appliedTo: "object"` で登録してオブジェクトを受け取り、
   パッチが記録するものは、Db の `clear()` に合わせて初期化する。
   生成された構文解析器は、オブジェクトの性質の写しに対してメソッドを呼ぶので、
   パッチしたメソッドの中の `this` は Db ではない。
5. `src/index.ts` の `DiagramType` と、
   `tools/src/diagrams.ts` の `diagramIds` に図種を足す。
   `tests/fixtures.test.ts` の、図種ごとの読み込みのテストと、
   全件を読むテストの一覧にも足す。
   normalizer のファイルを、
   `packages/tests/src/mermaid-run-store.ts` の `RESULT_FILES` に足す。
   `codeIdentityOf` はこの一覧を使って結果の識別を作る。
   他パッケージの図種の一覧は、
   そのパッケージのスキルの手順で変える（SKILL
   [tests](../tests/SKILL.ja.md#3-作業ツリーの扱い) の 3 の節）。
   ここでは編集しない。
6. `tests/` にテストを足す。
   確かめるのは、落とした欄が出ないこと、パッチが要約を変えないこと、
   データブロックの効果。
   corpus に基づくテストでは入力文字列を写さず、fixture を名前で読み、
   足りない入力は probe 後に CLI で足す。
   新しい図種を要約のない見本として使うテストを探し、その assertion を、
   確かめた別の要約のない fixture に移す。
7. `pnpm --filter @mmd-toolkit/tests run fixtures:generate` を実行する。
   変わるのは、`common/` の fixture のうち、
   その図種を載せたもの（`db: null` が要約になる）だけのはず。
   それ以外が変われば、理由を調べる。
   それらの fixture は要約を持ち、木を持たない。
   `tests/db-from-tree.test.ts` の `DIAGRAM_TYPES_WITHOUT_RECORDED_TREES`
   にその図種を足し、parser が木を記録したら外して、
   builder を記録した木で走らせるよう、同じファイルの `DIAGRAMS` に足す。
   その図種のノードの型の接頭辞（`Requirement`）も、
   `tests/check-tree-recorded.ts` の `NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES`
   に足す。
   ノードの型ごとに記録した木を求めるテストはこの接頭辞の型を除く。
   これも同じときに外す。
   外すときは、その図種の値の欄の行（`VALUE_FIELD_REPORTS` ほか、
   欄と値のテストの表）を書いておく。
   この一覧は図種の間は空のままにする。
8. `docs/db-summaries.md` と `.ja.md` に、その図種の節（何を落とし、
   なぜか）を書く。
9. 結果として、要約の欄の一覧と、落とした欄とその理由を示す。

## 3. fixture

手順 1 から 8 は、mermaid.js のテスト、docs、demos から入力を集め、
fixture として足す。
[references/collecting-fixtures.ja.md](references/collecting-fixtures.ja.md)
にある。

9. 手書きの入力。
   各入力は、note の 1 行で 1 つの問いに答える。
   書く前に、これまでの図種で必要になった場合の種類を、
   新しい図種の文と fixture に先に当てる。
   一覧にして当て、当てはまらない種類は、省かずに理由を書く。
   どの種類でも、構文のテキストを持つ場所すべて（欄、名前、文字列、ブロック。
   引用符の内外、最初の行とあとの行）を mermaid.js で確かめる。
   入力は、一覧の文言からでなく、これまでの図種の fixture の名前から取る。
   近い 2 つの図種の手書きの fixture の名前を `ls` で一覧にし、名前ごとに、
   新しい図種での対応か、対応しない理由を書く。
   一覧は次の種類を持つ。
   - `style` 行と `classDef` 行の行の規則が届く値。
     `style`、その後ろの `:` と `#` を持つ行の最後の `;` が、
     その行のどのテキストからも落ちる。
     語の大文字小文字が違う、`:` と `#` の間に空白がある、`#` がない、
     `;` が別の行にある場合は `;` が残り、
     `;` が 2 つあれば最初の `;` が文字参照を終える。
     引用符の中の行は、それだけで 1 つの行。
   - キーワードと値の間のコメント行、ディレクティブの行、空行。
     また、行にテキストのないキーワードが、
     後の行を値に取る場合（アクセシビリティのテキスト）は、取られる行そのもの。
     図の文の行であっても、
     そのまま値になる（xychart の `accTitle:` の次に `line [1]`）。
   - キーワードの別の大文字小文字と、その後ろにくっついた文字、語の文字、`-`、
     ASCII の外の文字。
     ヘッダーにも、各文のキーワードにも。
   - `Object.prototype` の名前（`__proto__`、`constructor`）を名前や id にする。
   - 同じ名前の 2 つ目、3 つ目の定義。
     どれが残るか、文法のアクションのほかの呼び出しが働くか。
     3 つ目は、相手が最初の定義でない組み合わせにする。
   - 空の説明ブロック（またはテキストのない文）が、前の値を保つこと。
   - CRLF、単独の CR、U+2028、U+2029。
     行末として、値や引用符の中で、テキストの末尾で。
   - 空白の種類のタブと U+FEFF。
     行の先頭、値の中、行とテキストの末尾で。
   - 文字参照。
     すべてのテキストと引用符の中で、
     また文字参照の `#` はコメントを始めないこと。
   - ディレクティブで切れる値。
     値の中、その先頭と末尾、引用符の中、ヘッダーの行、キーワードに続けて、
     閉じないもの（次の行の先頭の語か、テキストの残りを取る）。
   - 閉じない文脈の中でテキストが終わる場合。
     `accTitle:` で終わる、終わりのないブロック、閉じない引用符。
   - 各文の形の後ろの行末。
     ` ;`、`;`、`;;`、コメント、閉じたディレクティブ、閉じないディレクティブ。
   - 値、行、テキストの末尾の空白。
     ノーブレークスペースと U+3000 を含む。
     空白だけの行。
   - 複数の行にまたがる値の途中にあるコメント行とディレクティブの行。
   - Db がテキストから読む数。
     符号、`-0`（Db は -0 で、JSON は 0 と書く）、`NaN`、`Infinity`、
     倍精度に収まらない大きな数、数の後ろのテキスト。
   - Db が読む埋め込み設定の値。
   - `html-tag-in-frontmatter` の受理の両方向と値だけの違い。
   - 文の直後の hidden の形（本文の `---` ブロック、`%%{...}%%`）。
     消費した LF の後に文が続く場合、空行が余分の LF を与える場合、
     閉じの後の空白が LF を残す場合、EOF を確かめる。
     開きをテキストとして取り込む行の値も含める。
   - hidden ブロックの隣接する fence。
     本文のある選択肢を空の fallback より先に試し、
     後に適合する閉じがある場合とない場合、EOF と閉じの空白も含める。
   - 省略可能なヘッダーのフラグの後に、同じ行で文が続く場合。
   - 重複した定義の 2 度目に、`-0` のような意味上の境目の値を置く場合。
     両方の順で、どの値が残るか、
     意味上の拒否が重複を捨てる前に起きるかを調べる。
   - C4 検出の語（`C4Container`、`C4Component`、`C4Dynamic`、
     `C4Deployment`）を、すべてのテキストの欄に置く場合。
     label、title、accTitle、accDescr の行とブロックを含める。
     文の後とヘッダーの行で、EOF で終わるコメントにも置く。
     LF で終わる対照も含める。
   - 通過した裸の `%%` 行とヘッダーの間の空白。
     VT、FF、NBSP、BOM、U+1680、U+2000〜U+200A、U+202F、U+205F、U+3000、LS、
     PS をそれぞれ空白だけの行とヘッダーの直前に置く。
     ASCII の空白・タブの対照も含める。
   - 検出がブロックを 1 つ飛ばす場合。
     2 つ目のブロック、裸の `%%{` 行の後、本物の frontmatter の後、
     二度目の directive 読みの前と後を別々に、
     開きと閉じが同じ字下げの形を調べる。
   - keyword の直後に global な directive が接着し、
     その後に次の keyword や値が接着する場合。
     境界は、global な directive と選ばれたセミコロンを除いた文で判定する。
   - 各図種の atom（固定語、ヘッダーの keyword、矢印、共通の keyword、
     空白を含められない class 名や icon の値）の中と、
     作者が書いた部品の間にある global な directive と選ばれたセミコロン。
     atom の中を割り、mermaid.js が受理する場合は、
     `directive-as-token-boundary` または `ignored-semicolon-as-token-boundary`
     の印を付ける。
     keyword の直後に接着する場合は atom の末尾に接するだけで、
     atom 自体は割らない。

   この一覧にない種類が必要になったら、それが必要になった変更でここに足す。

10. 結果として、出どころごとの件数（受理・拒否）、標準外の拒否の内訳、
    印を付けた fixture、
    `fixtures:generate` と `fixtures:check` の所要時間を示す。

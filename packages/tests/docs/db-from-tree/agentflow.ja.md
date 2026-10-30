# 木から Agentflow の Db を組み立てる

English version: [agentflow.md](./agentflow.md)

`src/db-from-tree/agentflow.ts` は、
[ast/agentflow.ja.md](../../../spec/docs/ast/agentflow.ja.md) の木から、
[diagrams/agentflow.ja.md](../../../spec/docs/diagrams/agentflow.ja.md) に従い、
[db-summaries.ja.md](../db-summaries.ja.md#agentflow) の要約を組み立てる。
仕様が同じ読みを参照する箇所では、変換、入れ子の文字列、図形名、スタイル、
辺数のヘルパーを flowchart と共有する。
どちらのビルダーも、もう一方のビルダーを import しない。
`src/db-from-tree/graph.ts` に、共有の入れ子文字列の読みと、番号つき linkStyle、
class、click の Db 手順を置く。

## 木から要約を組み立てる

**変換したテキスト。**
範囲を共通の変換で読む。
directive と選ばれた無視されるセミコロンを除き、CR/CRLF を正規化し、
文字参照をプレースホルダーに置き換える。
HTML 属性の引用符は frontmatter 後の本文全体を文脈として変換する。
書かれた値は別途検査し、ソースの綴りを保つ。 [fixture: agentflow/lex-cr]
[fixture: agentflow/lex-crlf] [fixture: agentflow/entity-label-contexts]
[fixture: agentflow/html-attribute-quotes]
[fixture: agentflow/directive-in-string]
[fixture: agentflow/lex-style-preprocessing-semicolon]

Agentflow で共通のコメント領域と先頭空白を取り除くのは、
既定の 50000 UTF-16 単位を超える場合だけである。
frontmatter の trivia 全体の後から、directive を除き、CRLF を一つと数える。
この trivia は閉じ区切り後の空行や空白だけの行を含む。
本文の最初の空でない行の字下げは測定に残す。
[fixture: agentflow/frontmatter-extra-trivia-boundary]
[fixture: agentflow/frontmatter-extra-trivia-below]
[fixture: agentflow/frontmatter-extra-whitespace-line-boundary]
[fixture: agentflow/frontmatter-extra-trivia-above]
[fixture: agentflow/frontmatter-extra-trivia-indent-above]
上限以下では、木に記録された実際の図のコメントだけを除く。
文字列、コールバック、アクセシビリティ、
データ内のコメント風テキストは内容である。
パーサーはサイトの maxTextSize を受け取らない。
[fixture: agentflow/comment-default-size-equal]
[fixture: agentflow/comment-default-size-fallback]
[fixture: agentflow/comment-default-size-equal-crlf]
[fixture: agentflow/comment-default-size-above-crlf]
[fixture: agentflow/comment-default-size-equal-inline-directive]
[fixture: agentflow/comment-default-size-above-inline-directive]
[fixture: agentflow/comment-default-size-equal-frontmatter]
[fixture: agentflow/comment-default-size-above-frontmatter]
[fixture: agentflow/comment-quoted-label]
[fixture: agentflow/comment-split-edge-label]
[fixture: agentflow/lex-accessibility-block-comment]
[fixture: agentflow/db-metadata-comment-directive-body]
[fixture: agentflow/div-data-percent-line-is-content]

`}` の直後の行内空白と最初の LF だけを、その LF にまとめる。
後の空行と、LF が続かない空白は保つ。
文字列と markdown 文字列の区切りは、共有する入れ子の文脈で取り除く。
[fixture: agentflow/lex-brace-string-keeps-blank-line]
[fixture: agentflow/lex-brace-ls-without-lf]
[fixture: agentflow/gram-target-data-trailing-space]
[fixture: agentflow/gram-flow-name-string-bare-tail]
[fixture: agentflow/gram-split-edge-string-bare-tail]

**共通の文字列と方向。**
frontmatter のタイトルは `embedded` から取り、なければ空にする。
[db-from-tree.ja.md](../db-from-tree.ja.md#文字の置き換え) の
`textReplacementOf(embedded.config)` でサニタイズする。
ヘッダー方向がなければ TB、TD は TB、`>` は LR、`<` は RL、 `v` は TB、
`^` は BT にする。
BR を含め、ほかの綴られた方向はそのまま使う。
方向文が変えるのは、図全体でなく、それを直接含む flow の方向だけである。
[fixture: agentflow/frontmatter-title]
[fixture: agentflow/db-frontmatter-null-title] [fixture: agentflow/header-only]
[fixture: agentflow/header-td] [fixture: agentflow/header-br]
[fixture: agentflow/header-right-symbol] [fixture: agentflow/header-left-symbol]
[fixture: agentflow/header-down-symbol] [fixture: agentflow/header-up-symbol]
[fixture: agentflow/gram-direction-in-flow]

**頂点の処理。**
初出 id の順を保つ。
裸の出現は、以前のテキストがなければ id をテキストにする。
図形は text、labelType、括弧図形の type を置き換える。
ラベルを trim してサニタイズし、外側の一組の引用符を除く。
メタデータの別名は、書かれた図形ノードを変えない。
スタイルを追加し、クラスを保ち、空でも `props` を作る。
同じプロパティは値を置き換える。
最初から own property だった `__proto__` は残るが、
既存の空の props に後からそのキーを加えても残らない。
[fixture: agentflow/gram-node-three-definitions]
[fixture: agentflow/gram-bracket-shapes]
[fixture: agentflow/gram-props-repeated]
[fixture: agentflow/db-props-proto-after-bare]
[fixture: agentflow/db-props-proto-repeated]
[fixture: agentflow/db-data-block-aliases]

既存の辺の id なら、頂点の処理は何も変えない。
予約 id `connectors` は、スタイルやメタデータの出現でも通常の頂点を作らない。
[fixture: agentflow/db-generated-edge-id-metadata-target]
[fixture: agentflow/db-data-block-reserved-connectors]
[fixture: agentflow/spec-agentflow-metadata-no-validation-92cc9f70]

**グループとリンク。**
各グループの頂点を書かれた順に読む。
クラス接尾辞は、その id をカンマで分けた各部分へ適用する。
隣接データは次のメンバーを作った後、最後のメンバーならグループの末尾で適用する。
リンクの辺を作る前に、対象グループを読む。
始点の各頂点と終点の各頂点をその順に組み合わせる。
鎖では、前の対象グループが次の始点となる。 [fixture: agentflow/gram-group-data]
[fixture: agentflow/gram-style-suffix] [fixture: agentflow/gram-group-spaces]
[fixture: agentflow/gram-edge-chain] [fixture: agentflow/db-data-block-routing]

sequence、failure、reference の矢印はそれぞれ、 `arrow_point`/normal、
`arrow_cross`/normal、`arrow_open`/dotted になる。
実線の Db の長さはダッシュ数から一を引き、reference はドット数を使う。
どちらも十で止め、木の長さは制限しない。
ラベルは変換、trim、サニタイズと外側の引用符の除去を行い、書かれた kind を使う。
ラベルがなければ空のテキストと kind text にする。
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/db-edge-length-cap]
[fixture: agentflow/lex-reference-long-length-at-cap]
[fixture: agentflow/gram-reference-quoted-pipe-label]
[fixture: agentflow/lex-edge-whitespace-label]

書かれた辺 id が未使用なら、最後の始点と最初の終点の組へ与える。
それ以外は `L_<source>_<target>_0` を作り、
同じ端点の先行する辺に応じて接尾辞を 2、3 と進める。
後に作る辺は、その時点の既定の補間を取る。 [fixture: agentflow/gram-edge-id]
[fixture: agentflow/db-edge-id-repeated]
[fixture: agentflow/gram-linkstyle-interpolate-default]

**名前と flow。**
Name は正規化された一つのラベルではない。
Label の parts だけを変換し、初期文字列の区切りを除いて連結する。
消される click と空形式、click 文脈の断片外の一空白単位は何も加えない。
連結結果を trim して id にする。
`flow click A` の次に `B` があると AB になり、
`Handle click events` の次の `B` は `Handle eventsB` になる。
[fixture: agentflow/lex-flow-name-click-state]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/gram-flow-name-space-between-empty-blocks]
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-directive-in-name-empty-block-padding]

AgentflowIgnoredText.kind は、
認識された消される形式や direction 行のテキストを、木の検査のために記録する。
Db ビルダーはこれらのノードの kind も value も読まない。
名前は Label の parts、方向文は direction フィールド、
click の手順はオペランドを使う。 [fixture: agentflow/lex-flow-name-click-state]
[fixture: agentflow/lex-direction-line-greedy]
[fixture: agentflow/gram-empty-description-before-href]

入れ子のコンテナーを含む本文の後に flow を完成させる。
無名 id は `subGraph` と、それ以前に完成した宣言の数である。
同じ id の再宣言も数える。
タイトルのない名前付き flow は空タイトルと labelType text、
無名 flow は空タイトルと labelType markdown を使う。
明示タイトルは trim とサニタイズを行ったテキストと、書かれた kind を使う。
同じ id は最初のレコードへ新しい所属をそれぞれ一度だけ足し、
空でないタイトルと与えられた方向を置き換える。
最初の labelType とマップ内の位置は保つ。
[fixture: agentflow/gram-flow-all-forms]
[fixture: agentflow/gram-nested-unnamed-flow]
[fixture: agentflow/db-flow-three-definitions]
[fixture: agentflow/db-duplicate-flow-empty-last-title]
[fixture: agentflow/db-flow-repeat-before-unnamed]

頂点文はグループを後ろから前へ、各グループ内は書かれた順で id を寄与する。
入れ子の flow と connector は読んだ id、
空でないアクセシビリティ値は trim した値、
EmptyStatement はセミコロンを寄与する。
ほかの文は何も寄与しない。
各宣言の候補列から、空白だけの所属、重複、自分自身の id、global id、
先に完成した flow が獲得した id を除くが、
その列の `__proto__` の出現はすべて保つ。
初回の宣言はその列を保つ。
同じ id の再宣言は、`__proto__` の重複も含めて既存の所属を保ち、
候補がまだ存在しない場合だけ追加する。
そのため、3 回目の宣言も含め、再宣言は新しい `__proto__` を最大一つ追加し、
初回の宣言にあった重複はまとめない。
レイアウトが折り畳みや循環のため調整した記録でなく、元の端点と所属を保つ。
[fixture: agentflow/gram-group-spaces]
[fixture: agentflow/lex-accessibility-scope]
[fixture: agentflow/gram-flow-hasownproperty-before-empty-statement]
[fixture: agentflow/lex-flow-prototype-members]
[fixture: agentflow/db-flow-self-reference]
[fixture: agentflow/gram-flow-nested] [fixture: agentflow/db-flow-collapse]
[fixture: agentflow/db-diagnostics-containment-cycle]

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1187-L1265)
は、候補の重複を通常の object のキーで除くが、
既存の所属列への統合には `includes()` を使う。
object の `__proto__` に真偽値を代入しても own key ができないため、
最初の処理ではすべての出現が残る。
統合は、その途中ですでに追加した所属も検査する。
[fixture: agentflow/db-flow-proto-initial-repeated]
[fixture: agentflow/db-flow-proto-redefinition]
[fixture: agentflow/db-flow-ordinary-redefinition]
[fixture: agentflow/db-flow-proto-initial-then-redefinition]
[fixture: agentflow/db-flow-proto-third-definition]
[fixture: agentflow/db-flow-proto-second-then-third]
[fixture: agentflow/db-flow-proto-claimed-by-other]
[fixture: agentflow/db-flow-proto-merge-order]

直接の方向文の最後の値が flow の `dir` になる。
入れ子の方向は含めない。
なければ、有効な `flowchart.inheritDir` が truthy のとき図全体の方向を継ぐ。
既定値は false である。
global はコンテナーも外側への所属も寄与しない。
寄与した空でない id を global とし、既存と後の flow の所属から外す。
[fixture: agentflow/gram-direction-in-flow]
[fixture: agentflow/config-inherit-site] [fixture: agentflow/gram-global-nested]
[fixture: agentflow/gram-global-after-flow]
[fixture: agentflow/db-global-flow-id]
[fixture: agentflow/db-global-connector-membership]

**コネクター。**
読んだ id が空白だけなら何も作らない。
それ以外は labelType text、空の styles/classes、props なしの頂点を作る。
テキストは trim とサニタイズ後の空でないタイトルか、id である。
宣言は同じ id の通常の頂点を置き換える。
既存の connector のメタデータ、スタイル、クラスは保ち、
空でないタイトルがあるときだけテキストを変える。
後の通常の頂点の出現で props が付くこともある。
[fixture: agentflow/gram-connector-name-whitespace-only]
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-connector-markdown-title]
[fixture: agentflow/db-metadata-before-connector]
[fixture: agentflow/db-connector-three-definitions]
[fixture: agentflow/db-connector-repeated-without-title]

**クラスとスタイル。**
クラスの適用は各 id の頂点、最初の辺、flow があれば、
それぞれのクラスへ追加する。
style 文はカンマを含む一つの id で頂点の処理を行い、未定義の頂点も作る。
classDef は各名前のスタイルへ追加し、null を空テキストにし、
エスケープされたカンマをカンマにする。
ほかのスタイルのカンマは区切りである。
要約ではスタイル末尾の空白だけを除く。 [fixture: agentflow/db-all-fields]
[fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-classdef-multi]
[fixture: agentflow/gram-classdef-escaped-comma]
[fixture: agentflow/gram-style-whitespace-after-comma]
[fixture: agentflow/db-node-style-first-leading-spaces]

番号付き linkStyle は、指定された補間と、存在するスタイルを各辺へ置き換える。
`fill` で始まるスタイルがなければ `fill:none` を足す。
この判定では先頭空白も見る。
スタイルがなければ以前のスタイルを保つ。
default 形式は指定された edgeDefaults のフィールドだけを置き換える。
そのスタイルへ `fill:none` を足さず、既存の辺のスタイルも置き換えない。
[fixture: agentflow/db-style-leading-whitespace]
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/gram-linkstyle-default]
[fixture: agentflow/gram-linkstyle-interpolate-default]

**click とアクセシビリティ。**
コールバックは未定義の id も含め、各 id の `{id, name, args}` を追加する。
変換した名前と引数の余白を保ち、引数がなければ null にする。
URL は既存の各頂点の trim したリンクと target を設定する。
空または存在しないものは取り除く。
どちらも clickable クラスを適用する。
ツールチップは trim せずサニタイズし、id ごとに置き換え、最初の id 順を保つ。
textBeforeUrl/textBeforeTooltip は Db の値を変えない。
[fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/db-click-missing-id]
[fixture: agentflow/db-trailing-click-url-whitespace]
[fixture: agentflow/db-tooltip-three-definitions]
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]

アクセシビリティ文は flow 内も含め、ソース順で共通のタイトルと説明を置き換える。
説明の LF と続く空白は一つの LF にする。
行の値がなければ空テキスト、閉じた空ブロックなら何も変更しない。
閉じていないブロックは、保持されたテキストにかかわらず説明を空にする。
[fixture: agentflow/lex-accessibility-scope]
[fixture: agentflow/db-accessibility-repeated]
[fixture: agentflow/db-accessibility-whitespace-block]
[fixture: agentflow/db-acctitle-eof]
[fixture: agentflow/db-accessibility-empty-block]
[fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]

**不透明なデータの効果。**
隣接ブロックごとに一つの `dataBlockEffects` を消費する。
一ブロックごとではなく、文法が Db を呼ぶ順である。
頂点グループは上記の順、flow の見出しデータは本文の完成後に適用する。
同じ id の既存の flow、connector、最初の辺、頂点の順に優先し、
効果の own フィールドを設定する。
無視される予約 id `connectors` と空のコネクター id は、
要素なしで空の効果を持つことがある。
各エントリーの id が一致し、すべて一度ずつ消費されることを検査する。
YAML の解析やメタデータのキーの再構築はしない。
[fixture: agentflow/db-data-block-adjacent] [fixture: agentflow/gram-group-data]
[fixture: agentflow/gram-flow-inline-data]
[fixture: agentflow/db-data-block-routing]
[fixture: agentflow/db-connector-edge-id-collision]
[fixture: agentflow/db-flow-connector-collision]
[fixture: agentflow/db-data-block-reserved-connectors]
[fixture: agentflow/db-connector-empty-id-data]

効果には props、未知のメタデータ、エイリアスのコピー、
再帰的な非有限数のテキスト `Infinity`、`-Infinity`、`NaN` が記録済みである。
YAML の構文をノードにはしない。
診断と描画用の派生フィールドは組み立てない。
[fixture: agentflow/db-metadata-yaml-shared-alias]
[fixture: agentflow/db-data-block-recursive-prototype-keys]
[fixture: agentflow/db-metadata-nested-map-infinity]
[fixture: agentflow/db-metadata-nested-nan]
[fixture: agentflow/db-data-block-presentation-metadata]
[fixture: agentflow/db-diagnostics-no-semantic-checks]

## 記録との比較

`specified.json` があればそれを、なければ `expected.json` と比較する。
frontmatter の HTML を本文の文脈に含めない読みと、
ヘッダー前のパーセント行は記録された specified の読みを使う。
不透明な内容による拒否に、受理された Db の記録がなければ木だけを検査する。
単位の境界と tokenless-empty-forms の拒否は、
単位の再構築や無視する文の新設なしで検査する。
`divergence-removals.ts` に Agentflow の登録は不要である。
flowchart の登録もなく、
この六つの識別子は既存の共通の specified-reading 経路か、木の受理規則で扱う。
[fixture: agentflow/div-frontmatter-attribute-blocks-body-tag]
[fixture: agentflow/div-percent-braces-before-header]
[fixture: agentflow/db-data-block-invalid-yaml]
[fixture: agentflow/div-metadata-yaml-self-alias]
[fixture: agentflow/div-directive-in-arrow]
[fixture: agentflow/div-ignored-semicolon-in-arrow]
[fixture: agentflow/div-empty-string-statement]

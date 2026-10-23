# Agentflow のノード

英語版: [agentflow.md](./agentflow.md)

`agentflow` の木を定義する。
共通の root の記録と葉は [ast.md](../ast.ja.md)、
構文と受理の条件は [diagrams/agentflow.md](../diagrams/agentflow.ja.md) にある。
Db の値と変換は
[tests パッケージの要約](../../../tests/docs/db-summaries.ja.md#agentflow)
にある。

body は AgentflowDiagram である。
id の反復や global の中の宣言を含め、書かれた出現をソース順に別々に保つ。
推定した親、生成 id、実効の形、診断、配置の端点は木に持たない。
[fixture: agentflow/gram-node-three-definitions]
[fixture: agentflow/db-flow-three-definitions]
[fixture: agentflow/gram-global-after-flow]
[fixture: agentflow/db-flow-collapse]

値は[書かれたテキスト](../ast.ja.md#ノード)を保つ。
自身の生成規則が読むソースの表記、エンティティ、空白を含む。
内容に含めない文字列の区切りは各欄で定め、値を変換後の図のテキストにはしない。
共通の葉は Identifier、StringLiteral、NumericLiteral だけであり、
図固有のノードには Agentflow を付ける。
[fixture: agentflow/lex-quoted-crlf] [fixture: agentflow/entity-label-contexts]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/gram-style-whitespace-after-comma]

以下の子の欄の順が訪問順である。
Link だけはソース順の例外で、どちらの書き方でもラベルより先に矢印を訪れる。
null を許す欄は省略せず null とし、書かれない列は空の列とする。

## ノード

### AgentflowDiagram

| 欄          | 型                      | 意味                                    |
| ----------- | ----------------------- | --------------------------------------- |
| `direction` | 文字列または null       | 書かれたヘッダーの方向。なければ null。 |
| `body`      | AgentflowStatement の列 | ソース順の文。                          |

子の欄: `body`。
範囲: ヘッダーのキーワードから本文の最後の単位まで。
文がなくてもヘッダーを含む。
[fixture: agentflow/header-only] [fixture: agentflow/header-empty-document]
[fixture: agentflow/header-br] [fixture: agentflow/gram-global]

**AgentflowStatement** は AgentflowEmptyStatement、AgentflowVertexStatement、
AgentflowFlowStatement、AgentflowGlobalStatement、AgentflowConnectorStatement、
AgentflowStyleStatement、AgentflowClassDefStatement、AgentflowClassStatement、
AgentflowLinkStyleStatement、AgentflowDefaultLinkStyleStatement、
AgentflowClickCallbackStatement、AgentflowClickUrlStatement、
AgentflowDirectionStatement、AgentflowAccTitleStatement、
AgentflowAccDescrStatement、AgentflowAccDescrBlockStatement のいずれかである。

### AgentflowEmptyStatement

| 欄       | 型   | 意味               |
| -------- | ---- | ------------------ |
| （なし） | なし | 図固有の欄はない。 |

子の欄はない。
範囲: 文として読む 1 つのセミコロン。
区切りと共通の行規則が無視するものは含まない。
[fixture: agentflow/gram-class-double-semicolon]
[fixture: agentflow/gram-data-double-semicolon]
[fixture: agentflow/gram-tail-node-semicolons]

### AgentflowFlowStatement

| 欄      | 型                         | 意味                                  |
| ------- | -------------------------- | ------------------------------------- |
| `name`  | AgentflowName または null  | 書かれた名前。名前のない形だけ null。 |
| `title` | AgentflowLabel または null | 角括弧の題。なければ null。           |
| `data`  | AgentflowDataBlock の列    | 見出しのデータブロックを別々に保つ。  |
| `body`  | AgentflowStatement の列    | 閉じる end までの文。                 |

子の欄: `name`, `title`, `data`, `body`。
範囲: flow から閉じる end まで。
後続の空白は含まない。
[fixture: agentflow/gram-flow-all-forms]
[fixture: agentflow/gram-flow-inline-data] [fixture: agentflow/gram-flow-empty]
[fixture: agentflow/gram-flow-name-whitespace-only]
[fixture: agentflow/gram-empty-description-after-flow-name]
[fixture: agentflow/gram-empty-description-after-flow-title]

名前のない flow に名前のノードや生成 id の欄はない。
空白だけの名前は空白の Label を持つ Name である。
名前の中で読む空の説明ブロックは、
kind が empty-description-block の AgentflowIgnoredText として Name に保ち、
明示の角括弧の題の後では body の先頭の文とする。
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-flow-all-forms]
[fixture: agentflow/gram-flow-inline-data] [fixture: agentflow/gram-flow-empty]
[fixture: agentflow/gram-flow-name-whitespace-only]
[fixture: agentflow/gram-empty-description-after-flow-name]
[fixture: agentflow/gram-empty-description-after-flow-title]

[fixture: agentflow/gram-nested-unnamed-flow]

### AgentflowGlobalStatement

| 欄     | 型                      | 意味             |
| ------ | ----------------------- | ---------------- |
| `body` | AgentflowStatement の列 | ソース順の本文。 |

子の欄: `body`。
範囲: global から閉じる end まで。
後続の空白は含まない。
[fixture: agentflow/gram-global] [fixture: agentflow/gram-global-data]
[fixture: agentflow/gram-global-nested]
[fixture: agentflow/gram-global-in-global]
[fixture: agentflow/gram-flow-inside-global]
[fixture: agentflow/gram-empty-description-after-global]
[fixture: agentflow/gram-empty-description-global-semicolon]

名前、題、metadata の欄はない。
見出しの後の閉じた空の説明ブロックは body の先頭の文とする。
global の中にも global と flow を書ける。
[fixture: agentflow/gram-global] [fixture: agentflow/gram-global-data]
[fixture: agentflow/gram-global-nested]
[fixture: agentflow/gram-global-in-global]
[fixture: agentflow/gram-flow-inside-global]
[fixture: agentflow/gram-empty-description-after-global]
[fixture: agentflow/gram-empty-description-global-semicolon]

### AgentflowConnectorStatement

| 欄      | 型                         | 意味                                 |
| ------- | -------------------------- | ------------------------------------ |
| `name`  | AgentflowName              | 必須の書かれた名前。                 |
| `title` | AgentflowLabel または null | 角括弧の題。なければ null。          |
| `data`  | AgentflowDataBlock の列    | 見出しのデータブロックを別々に保つ。 |

子の欄: `name`, `title`, `data`。
範囲: connector から見出しの最後の単位まで。
区切りは含まない。
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-connector-name-whitespace-only]
[fixture: agentflow/gram-empty-description-after-connector-name]
[fixture: agentflow/gram-empty-description-after-connector-title]
[fixture: agentflow/lex-empty-description-in-connector-name]

body と閉じる end はない。
空白だけの名前も保つ。
名前の中の空の説明ブロックは、
kind が empty-description-block の IgnoredText の part とし、
角括弧の題の後の末尾のブロックは後続の文とする。
[fixture: agentflow/gram-connector-all-forms]
[fixture: agentflow/gram-connector-name-whitespace-only]
[fixture: agentflow/gram-empty-description-after-connector-name]
[fixture: agentflow/gram-empty-description-after-connector-title]
[fixture: agentflow/lex-empty-description-in-connector-name]

### AgentflowName

| 欄      | 型                                                        | 意味                                   |
| ------- | --------------------------------------------------------- | -------------------------------------- |
| `parts` | (AgentflowLabel または AgentflowIgnoredText) の空でない列 | 名前の断片と、空の形も含む消される形。 |

子の欄: `parts`。
範囲: 最初の part から最後の part まで。
間のソースの空白と捨てられた区切りも含む。
[fixture: agentflow/lex-flow-name-click-state]
[fixture: agentflow/lex-connector-name-click-state]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/lex-connector-name-click-mixed]
[fixture: agentflow/lex-flow-name-click-after-string]
[fixture: agentflow/gram-flow-name-space-between-empty-blocks]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/lex-flow-name-click-fragment-comma]

Label の part が少なくとも 1 つ必要であり、消される形だけでは名前にならない。
通常は Label が 1 つである。
通常の断片は最長とし、名前の生成規則が読む空白を両端も含めて保つ。
消される click（kind は click）、
閉じた空の説明ブロック（kind は empty-description-block）、
認識した消される空の文字列（kind は empty-string）、
空の markdown 文字列（kind は empty-markdown-string）、
空の call（kind は empty-call）、click の文脈の断片の終わりでだけ分ける。
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
その文脈を抜ける終端の空白はちょうど 1 つの空白文字で、断片に含めない。
さらに続く通常の空白は次の断片に含める。
先頭の文字列や markdown の断片は、mermaid.js が text と読む場合も、
書かれた kind を保つ。
後続の通常の断片は text とする。
[fixture: agentflow/lex-name-click-exit-tab]
[fixture: agentflow/lex-name-click-exit-nbsp]
[fixture: agentflow/lex-name-click-exit-ls]
[fixture: agentflow/lex-name-click-exit-ps]
[fixture: agentflow/lex-name-click-exit-crlf]
[fixture: agentflow/lex-name-click-exit-extra-space]
[fixture: agentflow/lex-name-click-initial-string]
[fixture: agentflow/lex-name-click-initial-markdown]
[fixture: agentflow/lex-name-markdown-before-click]
[fixture: agentflow/lex-name-click-empty-block]
[fixture: agentflow/lex-name-repeated-click]
[fixture: agentflow/lex-flow-name-click-state]
[fixture: agentflow/lex-connector-name-click-state]
[fixture: agentflow/lex-flow-name-click-mixed]
[fixture: agentflow/lex-connector-name-click-mixed]
[fixture: agentflow/lex-flow-name-click-after-string]
[fixture: agentflow/gram-flow-name-space-between-empty-blocks]
[fixture: agentflow/gram-flow-name-quoted-padding]
[fixture: agentflow/lex-flow-name-click-fragment-comma]

名前の part は解決後の id ではない。
kind が empty-description-block の空の説明ブロックの両側の空白を保ち、
前後の断片を正規化した値に結合しない。
空白だけの part も空ではない。
断片の種類は文法が定める。
既に始まった通常の名前の単位の中の引用符は、
IgnoredText ではなく Label のテキストに残す。
[fixture: agentflow/lex-empty-quote-spelling-inside-name-unit]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/lex-empty-description-in-connector-name]
[fixture: agentflow/gram-flow-name-double-space]
[fixture: agentflow/gram-flow-name-whitespace-only]

保持する空のブロック（kind は empty-description-block）、
認識した消される空の文字列（kind は empty-string）、
空の markdown 文字列（kind は empty-markdown-string）、
空の call（kind は empty-call）は、
先頭の通常の断片や引用した断片の前にも置ける。
その形は IgnoredText の part であり、後続の Label の断片の kind を変えない。
[fixture: agentflow/lex-empty-string-before-quoted-flow-name]
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
[fixture: agentflow/gram-empty-description-before-flow-name]
[fixture: agentflow/gram-empty-description-before-connector-string]
[fixture: agentflow/gram-empty-description-no-flow-name]

Name の断片では、キーワードや数値の形の name-piece もテキストであり、
構造のキーワードや NumericLiteral の位置にはしない。
その内部のディレクティブも許す。
[fixture: agentflow/lex-directive-in-name-keyword-text]
[fixture: agentflow/lex-directive-in-name-number-text]

名前の click の文脈は、Label の断片を寄与せず、
空の文字列（kind は empty-string）や、
空の markdown 文字列（kind は empty-markdown-string）を認識することもある。
click（kind は click）と空の形を、
別々の AgentflowIgnoredText の part として保つ。
必要な Label は flow click "" A のように後から来てもよく、
connector F click "" のように click より前にあってもよい。
文脈を抜けた後、空の文字列（kind は empty-string）と、
後続の名前のテキストの間に空の call（kind は empty-call）も置ける。
[fixture: agentflow/lex-name-click-empty-string-before-text]
[fixture: agentflow/lex-name-click-empty-markdown-before-text]
[fixture: agentflow/lex-name-click-empty-string-then-call]
[fixture: agentflow/lex-connector-name-click-empty-string-tail]
[fixture: agentflow/lex-name-click-empty-string-before-string]

flow の名前では、flow click ""A と、
空の markdown 文字列に替えた同じ隣接形を拒否する。
[fixture: agentflow/gram-name-click-empty-string-adjacent-text]
[fixture: agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

connector の名前では、click の後で認識した消される空の文字列や、
空の markdown 文字列に、名前のテキストを直接続けられる。
空の形はそれぞれ別々の AgentflowIgnoredText の part として保つ。
kind は、空の文字列なら empty-string、
空の markdown 文字列なら empty-markdown-string とする。
後続のテキストは kind が text の AgentflowLabel の part として保つ。
空の文字列に空の markdown 文字列を直接続けてから、名前のテキストを置いてもよい。
後続のテキストはセミコロンで始まってもよく、
前に Label がないときは必要な Label を供給し、
末尾のセミコロン 1 つだけでもよい。
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-string-adjacent-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
[fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
[fixture:
agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
[fixture: agentflow/lex-connector-name-click-empty-string-then-markdown]

後で何も認識しない消される click は、既に名前の断片があっても、
EOF に末尾の印だけを残せない。
ソースが connector click で終わる形は、末尾に LF があってもなくても拒否する。
connector F click で終わる形も mermaid.js が拒否し、差異の印は付けない。
[fixture: agentflow/gram-connector-name-click-only-eof]
[fixture: agentflow/gram-connector-name-click-only-newline]
[fixture: agentflow/gram-connector-name-terminal-click-eof]

### AgentflowVertexStatement

| 欄      | 型                   | 意味                     |
| ------- | -------------------- | ------------------------ |
| `first` | AgentflowVertexGroup | 最初の群。               |
| `links` | AgentflowLink の列   | リンクとその行き先の群。 |

子の欄: `first`, `links`。
範囲: 最初の頂点から最後の頂点、クラスの接尾部、データブロックまで。
区切りは含まない。
[fixture: agentflow/gram-bare-node] [fixture: agentflow/gram-group-spaces]
[fixture: agentflow/gram-edge-chain]
[fixture: agentflow/gram-node-three-definitions]

頂点や群だけなら links は空の列である。
頂点の反復した出現も別々に保つ。
リンクの始点は first または前のリンクの target であり、別の子として複製しない。
[fixture: agentflow/gram-bare-node] [fixture: agentflow/gram-group-spaces]
[fixture: agentflow/gram-edge-chain]
[fixture: agentflow/gram-node-three-definitions]

### AgentflowVertexGroup

| 欄         | 型                           | 意味               |
| ---------- | ---------------------------- | ------------------ |
| `vertices` | AgentflowVertex の空でない列 | 書かれた順の頂点。 |

子の欄: `vertices`。
範囲: 最初の頂点から最後の頂点まで。
群の頂点に付くデータも含む。
[fixture: agentflow/gram-group-spaces] [fixture: agentflow/gram-group-data]

### AgentflowVertex

| 欄         | 型                         | 意味                            |
| ---------- | -------------------------- | ------------------------------- |
| `id`       | Identifier                 | コンマも含む書かれた id。       |
| `shape`    | AgentflowShape または null | 括弧の形。なければ null。       |
| `cssClass` | Identifier または null     | ::: の後の名前。なければ null。 |
| `data`     | AgentflowDataBlock の列    | 隣接する各データブロック。      |

子の欄: `id`, `shape`, `cssClass`, `data`。
範囲: id から自身の最後の形、クラスの接尾部、データブロックまで。
[fixture: agentflow/gram-style-suffix]
[fixture: agentflow/gram-id-numbers-unicode]
[fixture: agentflow/db-data-block-routing]
[fixture: agentflow/db-generated-edge-id-metadata-target]

metadata だけの出現もこのノードで記録する。
後の宣言や metadata の対象によって置き換えない。
id、クラスの接尾部、形のプロパティの両辺は、
数字のような表記でも Identifier とする。
[fixture: agentflow/gram-style-suffix]
[fixture: agentflow/gram-id-numbers-unicode]
[fixture: agentflow/db-data-block-routing]
[fixture: agentflow/db-generated-edge-id-metadata-target]

### AgentflowShape

| 欄         | 型                                 | 意味                                        |
| ---------- | ---------------------------------- | ------------------------------------------- |
| `name`     | 文字列                             | 形の表の完全な名前。                        |
| `property` | AgentflowShapeProperty または null | [\| の長方形のプロパティ。それ以外は null。 |
| `label`    | AgentflowLabel                     | 内側に書かれたラベル。                      |

子の欄: `property`, `label`。
範囲: 形を開く区切りから閉じる区切りまで。
[fixture: agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props]
[fixture: agentflow/db-data-block-aliases]

名前と区切りは [Shapes](../diagrams/flowchart.ja.md#形) の表のとおりであり、
rectangle、rounded、framed-rectangle、trapezoid-bottom、lean-right、
ellipse などを使う。
metadata の形の名前は不透明なデータに保ち、この欄を置き換えない。
[fixture: agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props]
[fixture: agentflow/db-data-block-aliases]

### AgentflowShapeProperty

| 欄      | 型         | 意味               |
| ------- | ---------- | ------------------ |
| `name`  | Identifier | コロンの前の名前。 |
| `value` | Identifier | コロンの後の値。   |

子の欄: `name`, `value`。
範囲: 最初の項から次の項まで。
コロンを含み、囲む縦棒は含まない。
[fixture: agentflow/gram-props] [fixture: agentflow/gram-props-repeated]

### AgentflowLink

| 欄        | 型                                | 意味                                      |
| --------- | --------------------------------- | ----------------------------------------- |
| `id`      | Identifier または null            | @ を除く辺の id。なければ null。          |
| `opening` | AgentflowOpeningArrow または null | 分割形の開く矢印。なければ null。         |
| `arrow`   | AgentflowArrow                    | 閉じた矢印または閉じる矢印。              |
| `label`   | AgentflowLabel または null        | 縦棒または分割形のラベル。なければ null。 |
| `target`  | AgentflowVertexGroup              | 行き先の群。                              |

子の欄: `id`, `opening`, `arrow`, `label`, `target`。
範囲: 辺の id または最初の矢印から行き先の群の終わりまで。
[fixture: agentflow/gram-reference-edge-id]
[fixture: agentflow/gram-edge-id] [fixture: agentflow/gram-split-edge-id]
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-reference-quoted-pipe-label]
[fixture: agentflow/gram-split-edge-string-bare-tail]

どちらのラベルの書き方でも、訪問順は arrow、label とする。
分割形のラベルはソースでは閉じる矢印より前にある。
edgeSemantic の欄は作らず、矢印の欄で 3 種を区別する。
reference のラベルも保つ。
[fixture: agentflow/gram-edge-id] [fixture: agentflow/gram-split-edge-id]
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-reference-quoted-pipe-label]
[fixture: agentflow/gram-split-edge-string-bare-tail]

### AgentflowArrow

| 欄            | 型     | 意味                            |
| ------------- | ------ | ------------------------------- |
| `value`       | 文字列 | 周囲の空白を除く書かれた矢印。  |
| `startMarker` | 文字列 | 常に none。                     |
| `line`        | 文字列 | solid または dotted。           |
| `length`      | 整数   | 書かれたダッシュまたは点の数。  |
| `endMarker`   | 文字列 | arrow、cross、none のいずれか。 |

子の欄はない。
範囲: 矢印の文字。
周囲の空白は含まない。
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-edge-extended-length]
[fixture: agentflow/db-edge-length-cap]
[fixture: agentflow/gram-reference-quoted-pipe-label]

solid の矢印では全ダッシュを数え、末尾は > または x とする。
reference の矢印では必須の両側のダッシュを数えず、点だけを数え、
endMarker は none とする。
Db の長さの上限を適用せず、書かれた数を保つ。
[fixture: agentflow/gram-three-edge-kinds]
[fixture: agentflow/gram-edge-extended-length]
[fixture: agentflow/db-edge-length-cap]
[fixture: agentflow/gram-reference-quoted-pipe-label]

### AgentflowOpeningArrow

| 欄            | 型     | 意味          |
| ------------- | ------ | ------------- |
| `value`       | 文字列 | 書かれた --。 |
| `startMarker` | 文字列 | 常に none。   |
| `line`        | 文字列 | 常に solid。  |

子の欄はない。
範囲: 2 つのダッシュ。
周囲の空白は含まない。
[fixture: agentflow/gram-split-sequence-label]
[fixture: agentflow/gram-split-failure-label]

独立した長さや末尾の印はない。
閉じる矢印は solid で、末尾を > または x とする。
[fixture: agentflow/gram-split-sequence-label]
[fixture: agentflow/gram-split-failure-label]

### AgentflowLabel

| 欄      | 型     | 意味                                |
| ------- | ------ | ----------------------------------- |
| `kind`  | 文字列 | text、string、markdown のいずれか。 |
| `value` | 文字列 | 書かれた内容。                      |

子の欄はない。
範囲: ラベルまたは名前の断片全体。
先頭に文字列があればその区切りも含む。
[fixture: agentflow/gram-node-quoted-padding]
[fixture: agentflow/lex-edge-whitespace-label]
[fixture: agentflow/gram-label-whitespace-only]
[fixture: agentflow/gram-flow-name-string-bare-tail]
[fixture: agentflow/gram-split-edge-string-bare-tail]
[fixture: agentflow/gram-flow-name-quoted-padding]

kind は先頭の形を記録する。
value は先頭の文字列の内容と後続の裸のテキスト、または裸のテキストである。
内部の空白を保つ。
外側の余白は除くが、引用した内容、空白だけのラベル、
Name の断片が読む空白は保つ。
値は空ではなく、空白だけならその空白とする。
[fixture: agentflow/gram-node-quoted-padding]
[fixture: agentflow/lex-edge-whitespace-label]
[fixture: agentflow/gram-label-whitespace-only]
[fixture: agentflow/gram-flow-name-string-bare-tail]
[fixture: agentflow/gram-split-edge-string-bare-tail]
[fixture: agentflow/gram-flow-name-quoted-padding]

### AgentflowLiteral

| 欄      | 型     | 意味                       |
| ------- | ------ | -------------------------- |
| `value` | 文字列 | その値の書かれたテキスト。 |

子の欄はない。
範囲: 値のテキスト。
値の外側の空白は含まない。
[fixture: agentflow/db-style-leading-whitespace]
[fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/gram-style-whitespace-after-comma]

style、call の後のコールバック名と引数、アクセシビリティのテキストに使う。
これらの位置は、例が 1 語でも空白を許す。
style のコンマ直後の空白、コールバック名から開き括弧までの余白、
引数の余白を保つ。
任意の literal がないか空白だけなら null とし、
空白だけの style は列の null 要素とする。
[fixture: agentflow/db-style-leading-whitespace]
[fixture: agentflow/db-call-name-space-before-parentheses]
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/gram-style-whitespace-after-comma]

### AgentflowDataBlock

| 欄      | 型     | 意味                         |
| ------- | ------ | ---------------------------- |
| `value` | 文字列 | @{ と } の間の書かれた内容。 |

子の欄はない。
範囲: @{ から閉じる波括弧までの 1 ブロック全体。
[fixture: agentflow/db-data-block-empty-multiline]
[fixture: agentflow/db-data-block-recursive-prototype-keys]
[fixture: agentflow/gram-data-null-document]
[fixture: agentflow/gram-data-adjacent-multiline-blocks]

空のブロックと隣接するブロックもノードとして保つ。
値を木の YAML やプロパティの列にはせず、prototype のキー、alias、
書かれた形の表記を保つ。
各付加は書かれた出現に属する。
[fixture: agentflow/db-data-block-empty-multiline]
[fixture: agentflow/db-data-block-recursive-prototype-keys]
[fixture: agentflow/gram-data-null-document]
[fixture: agentflow/gram-data-adjacent-multiline-blocks]

### AgentflowIgnoredText

| 欄      | 型     | 意味                                             |
| ------- | ------ | ------------------------------------------------ |
| `kind`  | 文字列 | 認識した形。以下の 6 種のいずれか。              |
| `value` | 文字列 | 空の形の区切りも含む、書かれた空でないテキスト。 |

子の欄はない。
範囲: 保持する無視された文字。
外側の端の空白は含まない。
[fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/lex-direction-unclosed-bracket-prefix]
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-empty-description-before-href]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/lex-empty-description-in-connector-name]

kind は必須で、認識した字句の形により、次の 6 種のいずれかとする。

- click: Name や click の前置欄で消される予約語 click。
  [fixture: agentflow/lex-flow-name-click-state]
- empty-string: 認識した消される空の文字列。
  [fixture: agentflow/lex-empty-string-in-flow-name]
- empty-markdown-string: 認識した消される空の markdown 文字列。
  [fixture: agentflow/lex-empty-markdown-in-flow-name]
- empty-call: 認識した消される空の call。
  [fixture: agentflow/lex-empty-call-in-flow-name]
- empty-description-block: Name や click の前置欄で認識した、
  閉じた空の説明ブロック。
  [fixture: agentflow/lex-empty-description-in-flow-name]
- direction-text: 方向の行の無視される前後のテキスト。
  [fixture: agentflow/lex-direction-swallows-shape-and-edge]

Name の part と click の前置欄では最初の 5 種を使い、
方向の前後のテキストには direction-text を使う。
空の形は区切りと内部の空白も含めた全体の表記を保ち、
文字列や call の内容が空でも value は空ではない。
[fixture: agentflow/lex-empty-string-in-flow-name]
[fixture: agentflow/lex-empty-call-in-flow-name]
[fixture: agentflow/lex-empty-markdown-in-flow-name]
[fixture: agentflow/lex-empty-string-in-connector-name]
[fixture: agentflow/lex-empty-call-in-connector-name]
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
独立の文や一般の不正なテキストのノードにはしない。
[fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/lex-direction-unclosed-bracket-prefix]
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-empty-description-before-href]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/lex-empty-description-in-connector-name]

### AgentflowStyleStatement

| 欄       | 型                                          | 意味                        |
| -------- | ------------------------------------------- | --------------------------- |
| `id`     | Identifier                                  | コンマも含む id。           |
| `styles` | (AgentflowLiteral または null) の空でない列 | 書かれた style ごとの要素。 |

子の欄: `id`, `styles`。
範囲: style から文の最後の記述単位まで。
区切りと末尾の余白は含まない。
単独の null の style では id までとし、
コンマの後の末尾の null の style ではそのコンマまでとする。
[fixture: agentflow/gram-style-all-null]
[fixture: agentflow/gram-style-whitespace-only]
[fixture: agentflow/db-style-leading-whitespace]
[fixture: agentflow/gram-style-whitespace-after-comma]
[fixture: agentflow/gram-style-backslash-before-comma]

style は前のコンマの直後から始まり、先頭の空白を保つ。
末尾の余白は値の外に置く。
最初の style は必須の 1 つの space のキーワードと id の間隔の後に続き、
追加の先頭の style の空白を保つ。
[fixture: agentflow/db-node-style-first-leading-spaces]
[fixture: agentflow/db-node-style-first-leading-tab]
[fixture: agentflow/db-node-style-tab-gaps-leading-tab]
最後のコンマの後も含め、空白だけの style は null とする。
[fixture: agentflow/gram-style-whitespace-only]
[fixture: agentflow/db-style-leading-whitespace]
[fixture: agentflow/gram-style-whitespace-after-comma]
[fixture: agentflow/gram-style-backslash-before-comma]

### AgentflowClassDefStatement

| 欄           | 型                                          | 意味                     |
| ------------ | ------------------------------------------- | ------------------------ |
| `cssClasses` | (Identifier または null) の空でない列       | コンマで分けたクラス名。 |
| `styles`     | (AgentflowLiteral または null) の空でない列 | 書かれた style。         |

子の欄: `cssClasses`, `styles`。
範囲: classDef から文の最後の記述単位まで。
区切りと末尾の余白は含まない。
単独の null の style ではクラス名の列の最後の単位までとし、
コンマの後の末尾の null の style ではそのコンマまでとする。
[fixture: agentflow/gram-classdef-all-null]
[fixture: agentflow/gram-classdef-trailing-null-style]
[fixture: agentflow/gram-classdef-escaped-comma]
[fixture: agentflow/gram-classdef-trailing-empty-name]
[fixture: agentflow/gram-classdef-escaped-comma-whitespace-tail]
[fixture: agentflow/gram-style-backslash-before-comma]

コンマの後の末尾も含め、空のクラス名は null とする。
バックスラッシュ直後のコンマは、style と linkStyle の文とは異なり、
1 つの style の値に残す。
木ではエスケープを解かない。
[fixture: agentflow/gram-classdef-escaped-comma]
[fixture: agentflow/gram-classdef-trailing-empty-name]
[fixture: agentflow/gram-classdef-escaped-comma-whitespace-tail]
[fixture: agentflow/gram-style-backslash-before-comma]

### AgentflowClassStatement

| 欄         | 型                                    | 意味                       |
| ---------- | ------------------------------------- | -------------------------- |
| `ids`      | (Identifier または null) の空でない列 | コンマ間の対象 id。        |
| `cssClass` | Identifier                            | コンマも含む 2 番目の id。 |

子の欄: `ids`, `cssClass`。
範囲: class から 2 番目の id の終わりまで。
[fixture: agentflow/gram-class-target-empty-ends]
[fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-empty-description-after-class-glued]

先頭と末尾も含め、空の対象 id は null とする。
2 番目の id はコンマの列ではなく 1 つの Identifier とする。
[fixture: agentflow/gram-class-target-empty-ends]
[fixture: agentflow/gram-class-semicolon]
[fixture: agentflow/gram-empty-description-after-class-glued]

### AgentflowLinkStyleStatement

| 欄            | 型                                  | 意味                                    |
| ------------- | ----------------------------------- | --------------------------------------- |
| `indices`     | NumericLiteral の空でない列         | 書かれたリンクの番号。                  |
| `interpolate` | Identifier または null              | interpolate の後の名前。なければ null。 |
| `styles`      | (AgentflowLiteral または null) の列 | style。なければ空の列。                 |

子の欄: `indices`, `interpolate`, `styles`。
範囲: linkStyle から文の最後の記述単位まで。
区切りと末尾の余白は含まない。
補間名がなく style が単独の null なら、最後の番号までとする。
コンマの後の末尾の null の style ではそのコンマまでとする。
[fixture: agentflow/gram-linkstyle-all-null]
[fixture: agentflow/gram-linkstyle-trailing-null-style]
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/lex-linkstyle-leading-zero]
[fixture: agentflow/gram-empty-description-splits-interpolate-spaces]

interpolate と styles の少なくとも一方がある。
NumericLiteral は raw の表記を保ち、受理の条件は別途、正規の番号を要求する。
末尾の空の説明ブロックが空白の単位を分ける場合も、
空白だけの style は null とする。
[fixture: agentflow/gram-linkstyle-interpolate-index]
[fixture: agentflow/lex-linkstyle-leading-zero]
[fixture: agentflow/gram-empty-description-splits-interpolate-spaces]

### AgentflowDefaultLinkStyleStatement

| 欄            | 型                                  | 意味                    |
| ------------- | ----------------------------------- | ----------------------- |
| `interpolate` | Identifier または null              | 補間名。なければ null。 |
| `styles`      | (AgentflowLiteral または null) の列 | style。なければ空の列。 |

子の欄: `interpolate`, `styles`。
範囲: linkStyle から文の最後の記述単位まで。
区切りと末尾の余白は含まない。
補間名がなく style が単独の null なら、default のキーワードまでとする。
コンマの後の末尾の null の style ではそのコンマまでとする。
[fixture: agentflow/gram-default-linkstyle-all-null]
[fixture: agentflow/gram-default-linkstyle-trailing-null-style]
[fixture: agentflow/gram-linkstyle-default]
[fixture: agentflow/gram-linkstyle-interpolate-default]

固定の default の選択肢を表し、数値の indices は持たない。
interpolate と styles の少なくとも一方がある。
[fixture: agentflow/gram-linkstyle-default]
[fixture: agentflow/gram-linkstyle-interpolate-default]

### AgentflowClickCallbackStatement

| 欄                  | 型                                    | 意味                                                |
| ------------------- | ------------------------------------- | --------------------------------------------------- |
| `ids`               | (Identifier または null) の空でない列 | コンマ間の click の id。                            |
| `callback`          | Identifier または AgentflowLiteral    | 裸のコールバック id または call の後の名前。        |
| `arguments`         | AgentflowLiteral または null          | 引数のテキスト。なければ、または空白だけなら null。 |
| `textBeforeTooltip` | AgentflowIgnoredText の列             | 空の形も含む、tooltip の前で消される形。            |
| `tooltip`           | StringLiteral または null             | tooltip の文字列。なければ null。                   |

子の欄: `ids`, `callback`, `arguments`, `textBeforeTooltip`, `tooltip`。
範囲: 最初の click から最後のコールバックの単位または tooltip まで。
区切りは含まない。
[fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/gram-click-callback-blank-args]
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-callback-arguments-after-second-call]
[fixture: agentflow/gram-click-id-empty-ends]

空の id は null とする。
call の後の名前は空白と改行を許すので Literal、
裸のコールバックは Identifier とする。
名前の LF、CRLF、U+2028、U+2029 は書かれたまま保つ。
[fixture: agentflow/lex-callback-name-lf]
[fixture: agentflow/lex-callback-name-crlf]
[fixture: agentflow/lex-callback-name-u2028]
[fixture: agentflow/lex-callback-name-u2029]
引数は余白を保つ 1 つの不透明な literal とする。
最初の括弧が空なら、2 度目の call の後に引数が続けられる。
前置欄は、後続の tooltip の前で認識した、
消される click（kind は click）、
閉じた空の説明ブロック（kind は empty-description-block）、
空の文字列（kind は empty-string）、
空の markdown 文字列（kind は empty-markdown-string）、
空の call（kind は empty-call）を別々に保つ。
そのような前置がない場合や tooltip が null の場合は、空の列とする。
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/gram-click-callback-forms]
[fixture: agentflow/gram-click-callback-blank-args]
[fixture: agentflow/gram-click-callback-space-args]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-callback-arguments-after-second-call]
[fixture: agentflow/gram-click-id-empty-ends]

[fixture: agentflow/gram-empty-description-before-callback-tooltip]

### AgentflowClickUrlStatement

| 欄                  | 型                                    | 意味                                        |
| ------------------- | ------------------------------------- | ------------------------------------------- |
| `ids`               | (Identifier または null) の空でない列 | コンマ間の click の id。                    |
| `textBeforeUrl`     | AgentflowIgnoredText の列             | 空の形も含む、URL の前で消される形。        |
| `url`               | StringLiteral                         | URL の文字列。                              |
| `textBeforeTooltip` | AgentflowIgnoredText の列             | 空の形も含む、tooltip の前で消される形。    |
| `tooltip`           | StringLiteral または null             | tooltip。なければ null。                    |
| `target`            | 文字列または null                     | _self、_blank、_parent、_top、または null。 |

子の欄: `ids`, `textBeforeUrl`, `url`, `textBeforeTooltip`, `tooltip`。
範囲: 最初の click から最後の文字列または target まで。
区切りは含まない。
[fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-url-tooltip]
[fixture: agentflow/gram-click-erased-after-href]
[fixture: agentflow/gram-empty-description-before-href]
[fixture: agentflow/gram-url-tooltip-whitespace-only]
[fixture: agentflow/gram-empty-description-after-url-glued]

前置欄は、認識した消される click（kind は click）、
閉じた空の説明ブロック（kind は empty-description-block）、
空の文字列（kind は empty-string）、
空の markdown 文字列（kind は empty-markdown-string）、
空の call（kind は empty-call）を別々に保つ。
[fixture: agentflow/lex-empty-call-before-href]
[fixture: agentflow/lex-empty-string-before-url]
[fixture: agentflow/lex-empty-markdown-before-href]
[fixture: agentflow/lex-empty-string-before-url-tooltip]
[fixture: agentflow/lex-empty-call-before-url-tooltip]
[fixture: agentflow/lex-empty-markdown-before-callback-tooltip]
[fixture: agentflow/lex-mixed-empty-forms-before-url-tooltip]
textBeforeUrl は href の前後の形を保持し、
href 自身は親のキーワードの単位とする。
URL と tooltip の StringLiteral は閉じており空ではない。
空白だけの文字列も含む。
URL の後の末尾の空の説明ブロックは前置ではなく後続の文とする。
tooltip が null なら textBeforeTooltip は空の列とする。
target の前のブロックに前置の欄はなく、後続の文にできなければ拒否する。
[fixture: agentflow/gram-click-link-forms]
[fixture: agentflow/gram-click-erased-before-url]
[fixture: agentflow/gram-click-erased-before-url-tooltip]
[fixture: agentflow/gram-click-erased-after-href]
[fixture: agentflow/gram-empty-description-before-href]
[fixture: agentflow/gram-url-tooltip-whitespace-only]
[fixture: agentflow/gram-empty-description-after-url-glued]

URL とコールバックの tooltip の前の閉じた空のブロックは、
kind を empty-description-block とし、
消される click（kind は click）と同じ textBeforeTooltip に置く。
[fixture: agentflow/gram-click-erased-before-url-tooltip]
[fixture: agentflow/gram-click-erased-before-callback-tooltip]
[fixture: agentflow/gram-empty-description-before-url-tooltip]
[fixture: agentflow/gram-empty-description-before-callback-tooltip]
[fixture: agentflow/div-empty-description-before-link-target]

### AgentflowDirectionStatement

| 欄           | 型                               | 意味                                              |
| ------------ | -------------------------------- | ------------------------------------------------- |
| `textBefore` | AgentflowIgnoredText または null | direction の前のテキスト。空か空白だけなら null。 |
| `direction`  | 文字列                           | TB、BT、RL、LR、TD のいずれか。                   |
| `textAfter`  | AgentflowIgnoredText または null | 値の後のテキスト。空か空白だけなら null。         |

子の欄: `textBefore`, `textAfter`。
範囲: 方向の行の最初の非空白文字から最後の非空白文字まで。
[fixture: agentflow/lex-direction-value-priority]
[fixture: agentflow/lex-direction-last-selected-occurrence]
[fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/gram-direction-value-next-line]
[fixture: agentflow/lex-direction-unclosed-bracket-prefix]

null でない textBefore と textAfter のノードは、kind を direction-text とする。
閉じない形や完全なリンクのように見えても、無視される前後のテキストを保つ。
direction と値の間の改行も文の範囲に含む。
[fixture: agentflow/lex-direction-value-priority]
[fixture: agentflow/lex-direction-last-selected-occurrence]
[fixture: agentflow/lex-direction-swallows-shape-and-edge]
[fixture: agentflow/gram-direction-value-next-line]
[fixture: agentflow/lex-direction-unclosed-bracket-prefix]

### AgentflowAccTitleStatement

| 欄      | 型                           | 意味                                  |
| ------- | ---------------------------- | ------------------------------------- |
| `value` | AgentflowLiteral または null | 書かれた題のテキスト。なければ null。 |

子の欄: `value`。
範囲: accTitle からコロンまたは値の最後の文字まで。
[fixture: agentflow/db-acctitle-next-line]
[fixture: agentflow/lex-title-inline-percent-content]
[fixture: agentflow/db-acctitle-comment-next-line]
[fixture: agentflow/db-acctitle-eof]

コロンの後の空白には改行も含むため、次の物理行が値になり得る。
値の内部のセミコロンと percent の対はテキストに保つ。
[fixture: agentflow/db-acctitle-next-line]
[fixture: agentflow/lex-title-inline-percent-content]
[fixture: agentflow/db-acctitle-comment-next-line]
[fixture: agentflow/db-acctitle-eof]

### AgentflowAccDescrStatement

| 欄      | 型                           | 意味                                    |
| ------- | ---------------------------- | --------------------------------------- |
| `value` | AgentflowLiteral または null | 書かれた説明のテキスト。なければ null。 |

子の欄: `value`。
範囲: accDescr からコロンまたは値の最後の文字まで。
[fixture: agentflow/db-accdescr-eof] [fixture: agentflow/db-accdescr-next-line]
[fixture: agentflow/lex-accessibility-semicolon-value]

行の値の規則はアクセシビリティの題と同じであり、
ブロックの文とは別のノードとする。
[fixture: agentflow/db-accdescr-eof] [fixture: agentflow/db-accdescr-next-line]
[fixture: agentflow/lex-accessibility-semicolon-value]

### AgentflowAccDescrBlockStatement

| 欄       | 型                           | 意味                           |
| -------- | ---------------------------- | ------------------------------ |
| `value`  | AgentflowLiteral または null | 書かれた内容。なければ null。  |
| `closed` | 真偽値                       | 閉じる波括弧が書かれているか。 |

子の欄: `value`。
範囲: accDescr から閉じる波括弧まで。
閉じなければソースの末尾まで。
[fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]
[fixture: agentflow/lex-empty-description-before-node]
[fixture: agentflow/gram-empty-description-after-vertex]
[fixture: agentflow/gram-empty-description-after-header-direction]
[fixture: agentflow/gram-empty-description-after-flow-title]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-empty-description-before-href]

閉じないブロックの内容は、mermaid.js が使わなくても EOF まで保つ。
閉じた空のブロックは value が null、closed が true である。
文の位置なら別の文として保ち、
Name と click の前置欄では、全表記を、
kind が empty-description-block の IgnoredText に保つ。
[fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]
[fixture: agentflow/lex-empty-description-before-node]
[fixture: agentflow/gram-empty-description-after-vertex]
[fixture: agentflow/gram-empty-description-after-header-direction]
[fixture: agentflow/gram-empty-description-after-flow-title]
[fixture: agentflow/lex-empty-description-in-flow-name]
[fixture: agentflow/gram-empty-description-before-href]

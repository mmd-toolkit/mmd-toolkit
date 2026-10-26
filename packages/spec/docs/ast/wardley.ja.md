# Wardley の node

英語版: [wardley.md](./wardley.md)

この文書は Wardley の原文の木を定義する。[ast.md](../ast.ja.md) が共有 node と不
変
条件を、[diagrams/wardley.md](../diagrams/wardley.ja.md) が構文と受理を定める。
任意の欄は未記載なら null、無いリストは空にし、リストは source order を保つ。
各欄表は独立した node の定義で、子の欄は訪問順を示す。
[fixture: wardley/db-all-fields] [fixture: wardley/db-empty-texts]
[fixture: wardley/db-singletons-last] [fixture: wardley/common-repeat-empty]

名前の位置は空白を許すため、id-name として読んだ場合や一語で書いた場合も、bare
name は常に WardleyIdentifier。
引用した名や text は共有 StringLiteral であり、raw は quote とすべての source の
文字、value は共通 trivia を除いた未変換の中身を持ち、closed は true。flow label
の比較変換は異なるが、
原文の葉は同じ。NumericLiteral.raw は書いた unsigned の数、value は百分率化前の
double を持つ。
[fixture: wardley/db-id-underscore] [fixture: wardley/db-unquoted-names]
[fixture: wardley/lex-string-conversion]
[fixture: wardley/directive-every-field]
[fixture: wardley/lex-link-flow-raw-escapes] [fixture: wardley/db-empty-texts]
[fixture: wardley/number-leading-zero]
[fixture: wardley/db-number-int-precision] [fixture: wardley/db-number-overflow]

native の無視される形は whole WardleyIgnoredText node。
以下の textBefore/textAfter の gap の欄はその node のリストであり、空白、
共有 Comment、global Directive は要素にしない。
名前つき gap は各 whole match を一度だけ所有する。
消費した後続改行は ignored node の範囲の外。
特記がなければ無関係な外側の padding と可視 EOL も範囲に含めず、
内部の source の改行と padding は囲む範囲に残す。
[fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/lex-hidden-directive-cr] [fixture: wardley/hidden-yaml-crlf]
[fixture: wardley/lex-hidden-after-visible-eol]
[fixture: wardley/tail-all-comments]
[fixture: wardley/tail-all-global-directives]

## node

### WardleyDiagram

| 欄                 | 型                          | 意味                                 |
| ------------------ | --------------------------- | ------------------------------------ |
| `textBeforeHeader` | WardleyIgnoredText のリスト | 見出しの前に残る形。                 |
| `body`             | list of WardleyBodyItem     | 原文の全ての文と本文の hidden form。 |

子の欄: textBeforeHeader、body。範囲: 見出しの前の最初の残存形から、
無ければ見出しから、最後に書いた見出し/本文の形まで。
別の header node や alias の欄は作らず、Root.diagramType は wardley。
[fixture: wardley/header-only] [fixture: wardley/header-glued-statement]
[fixture: wardley/detect-real-before-retained-secondscan]
[fixture: wardley/db-all-fields]

WardleyBodyItem は
WardleyAnchorStatement、WardleyComponentStatement、WardleyLinkStatement、WardleyEvolveStatement、WardleyPipelineStatement、WardleyNoteStatement、WardleyAnnotationsStatement、WardleyAnnotationStatement、WardleyAcceleratorStatement、WardleyDeacceleratorStatement、WardleyEvolutionStatement、WardleySizeStatement、下の共通の 4 文、または WardleyIgnoredText。置換される size/evolution/共通文、後の box、missing evolve、宣言の重複も全出現を保つ。有効値や merge 後の node を合成しない。空行/comment だけの行は body item を作らない。
[fixture: wardley/db-all-fields] [fixture: wardley/db-singletons-last]
[fixture: wardley/common-repeat-empty] [fixture: wardley/db-later-invalid-box]
[fixture: wardley/db-trend-missing] [fixture: wardley/db-node-duplicates]
[fixture: wardley/space-lines] [fixture: wardley/tail-all-comments]

textBeforeHeader は検出から残る native YAML と第 2 scan の directive を native
の境界どおり所有する。通した裸の行は共有 Comment、
伴って通した空白/改行は残存形の間も trivia であり、ignored node の範囲を広げな
い。見出しの後、文の前、可視 EOL の後の hidden form は body item。
[fixture: wardley/detect-real-before-retained-secondscan]
[fixture: wardley/detect-secondscan-glued]
[fixture: wardley/detect-two-secondscans]
[fixture: wardley/detect-retained-secondscan-bare-ascii]
[fixture: wardley/detect-retained-secondscan-bare-ls]
[fixture: wardley/retained-directive-between-bares]
[fixture: wardley/lex-hidden-header-no-eol]
[fixture: wardley/lex-hidden-after-visible-eol]

### WardleyAnchorStatement

| 欄                      | 型                                 | 意味                               |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| `textBeforeName`        | WardleyIgnoredText のリスト        | keyword の後の形。                 |
| `name`                  | WardleyIdentifier or StringLiteral | 書いた宣言名。                     |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト        | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates                 | 書いた visibility/evolution の組。 |
| `textAfter`             | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。          |

子の欄: textBeforeName、name、textBeforeCoordinates、coordinates、textAfter。
範囲: anchor から座標の閉じ bracket までで、最後の textAfter があればそこまで。
[fixture: wardley/spec-wardley-parser-04b27e33]
[fixture: wardley/db-empty-texts] [fixture: wardley/hidden-all-unit-gaps]

name は引用した空名も含め必須で、coordinates も必須。textBeforeName は anchor の
後、textBeforeCoordinates は座標の開きの前、textAfter は閉じの後から最初の可視
EOL の前まで。anchor に原文の decoration や class の欄はない。
[fixture: wardley/db-empty-texts] [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/tail-anchor-open-directive]
[fixture: wardley/db-pipeline-anchor-parent]
[fixture: wardley/gram-anchor-decoration-rejected]

### WardleyComponentStatement

| 欄                      | 型                                 | 意味                               |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| `textBeforeName`        | WardleyIgnoredText のリスト        | keyword の後の形。                 |
| `name`                  | WardleyIdentifier or StringLiteral | 書いた宣言名。                     |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト        | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates                 | 書いた visibility/evolution の組。 |
| `decorations`           | list of WardleyDecoration          | 書いた順の装飾。                   |
| `textAfter`             | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。          |

子の欄:
textBeforeName、name、textBeforeCoordinates、coordinates、decorations、textAfter。範囲: component から最後の装飾までで、無ければ座標の閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/db-inertia-forms]
[fixture: wardley/hidden-yaml-component-gaps]

WardleyDecoration は
WardleyLabelOffsetDecoration、WardleySourceStrategyDecoration、WardleyInertiaDecoration、WardleyParenthesizedInertiaDecoration。無記載なら空リストで、文法は label offset、strategy、inertia の一方の形をこの順で一つずつ許す。実在する各装飾は前の native form を固有の textBefore に所有し、次の装飾がなければ component の textAfter に置く。宣言の反復は別の文に保ち、有効な inertia/strategy/class の欄は作らない。
[fixture: wardley/db-inertia-forms] [fixture: wardley/gram-label-order]
[fixture: wardley/gram-decorator-order]
[fixture: wardley/gram-component-inertia-duplicate]
[fixture: wardley/gram-component-strategy-duplicate]
[fixture: wardley/gram-component-class-unsupported]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/db-node-duplicates] [fixture: wardley/lex-hidden-two-suffixes]

### WardleyLinkStatement

| 欄                   | 型                                 | 意味                              |
| -------------------- | ---------------------------------- | --------------------------------- |
| `from`               | WardleyIdentifier or StringLiteral | 書いた始点の参照。                |
| `textBeforeFromPort` | WardleyIgnoredText のリスト        | 書いた始点 port の前の形。        |
| `fromPort`           | string or null                     | 書いた始点 port の向き。          |
| `textBeforeArrow`    | WardleyIgnoredText のリスト        | 書いた arrow の前の形。           |
| `arrow`              | WardleyArrow or null               | 書いた arrow（あれば）。          |
| `textBeforeTo`       | WardleyIgnoredText のリスト        | 終点の参照の前の形。              |
| `to`                 | WardleyIdentifier or StringLiteral | 書いた終点の参照。                |
| `textBeforeToPort`   | WardleyIgnoredText のリスト        | 書いた終点 port の前の形。        |
| `toPort`             | string or null                     | 書いた終点 port の向き。          |
| `textBeforeLabel`    | WardleyIgnoredText のリスト        | 書いた semicolon label の前の形。 |
| `label`              | WardleyLiteral or null             | semicolon の後の原文。            |
| `textAfter`          | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。         |

子の欄:
from、textBeforeFromPort、textBeforeArrow、arrow、textBeforeTo、to、textBeforeToPort、textBeforeLabel、label、textAfter。範囲: from から最後に書いた label、終点 port、to のいずれかまで。textAfter があればそこまで。
[fixture: wardley/db-link-forms] [fixture: wardley/db-bare-link]
[fixture: wardley/lex-link-target-port-no-arrow]
[fixture: wardley/hidden-all-unit-gaps]

fromPort/toPort は +> で forward、+< で backward、+<> で bidirectional、port が
なければ null。
最終 flow ではなく書いた向きである。arrow は arrow がなければ null。
ない任意部品の直前 gap は空にし、to へ向かう残りの形は textBeforeTo に置く。
最後に書いた部品から可視 EOL までの形は textAfter に置く。
名前は未解決や label による参照も含め書いた形を保つ。
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins]
[fixture: wardley/lex-link-target-port-no-arrow] [fixture: wardley/db-bare-link]
[fixture: wardley/hidden-all-unit-gaps] [fixture: wardley/db-link-resolution]
[fixture: wardley/db-link-unresolved-duplicates]

label は semicolon label 全体が無い場合だけ null。literal は semicolon 直後から
始まり、padding と空白だけの中身を保つ。中身のない semicolon は拒否する。
実在する link-label は native に見える形も行末まで取るため、label があれば
textAfter は空。導出時の優先順位で隠れても両 label と両 port を保つ。
[fixture: wardley/tail-link-empty-label]
[fixture: wardley/tail-link-spaced-label]
[fixture: wardley/tail-link-double-label] [fixture: wardley/space-link-label]
[fixture: wardley/lex-hidden-directive-multiline-label]
[fixture: wardley/db-link-forms] [fixture: wardley/lex-flow-port-wins]

### WardleyEvolveStatement

| 欄                    | 型                                 | 意味                      |
| --------------------- | ---------------------------------- | ------------------------- |
| `textBeforeComponent` | WardleyIgnoredText のリスト        | evolve の後の形。         |
| `component`           | WardleyIdentifier or StringLiteral | 書いた component の参照。 |
| `textBeforeTarget`    | WardleyIgnoredText のリスト        | target の数の前の形。     |
| `target`              | NumericLiteral                     | 書いた decimal target。   |
| `textAfter`           | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。 |

子の欄: textBeforeComponent、component、textBeforeTarget、target、textAfter。
範囲: evolve から target まで。textAfter があればそこまで。
[fixture: wardley/db-trend-duplicates] [fixture: wardley/db-trend-missing]
[fixture: wardley/hidden-all-unit-gaps]

ID が存在しなくても component と target は必須で、
解決した node ID や正規化した target に置き換えない。textAfter は最初の可視 EOL
より前だけを所有する。反復・未公開の evolve も別の node として残す。
[fixture: wardley/db-trend-missing]
[fixture: wardley/gram-evolve-missing-label-invalid]
[fixture: wardley/gram-evolve-exact-child-invalid]
[fixture: wardley/db-trend-duplicates]
[fixture: wardley/tail-evolve-open-directive]

### WardleyPipelineStatement

| 欄                 | 型                                 | 意味                                 |
| ------------------ | ---------------------------------- | ------------------------------------ |
| `textBeforeParent` | WardleyIgnoredText のリスト        | pipeline の後の形。                  |
| `parent`           | WardleyIdentifier or StringLiteral | 書いた親の参照。                     |
| `textBeforeBody`   | WardleyIgnoredText のリスト        | 開き brace の前の形。                |
| `textAfterOpen`    | WardleyIgnoredText のリスト        | brace の後、最初の可視 LF の前の形。 |
| `body`             | list of WardleyPipelineBodyItem    | 原文の子と hidden form。             |
| `textAfter`        | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。            |

子の欄:
textBeforeParent、parent、textBeforeBody、textAfterOpen、body、textAfter。
範囲: pipeline から閉じ brace まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/lex-hidden-pipeline-open-spare]

WardleyPipelineBodyItem は WardleyPipelineComponent または WardleyIgnoredText
で、component を一つ以上持つ。
開始後、textAfterOpen が所有するのは必須の最初の可視 LF より前の形だけで、hidden
の終わりの消費はその LF を供給しない。その後、子の前、子の可視 EOL の後、
閉じ brace の前の形は body item。textAfter は閉じ brace の後から pipeline 固有の
EOL の前まで。空行/comment だけの行は要素を作らない。
[fixture: wardley/gram-empty-pipeline]
[fixture: wardley/hidden-pipeline-open-gap]
[fixture: wardley/lex-hidden-pipeline-open-spare]
[fixture: wardley/lex-hidden-pipeline-before-close]
[fixture: wardley/lex-hidden-pipeline-child-spare]
[fixture: wardley/gram-pipeline-blank-before-first]
[fixture: wardley/tail-pipeline-open-directive]

parent は原文の参照であり、解決した label や有効な親の record ではない。
反復した pipeline と元の body を保ち、
生成した子の ID を挿入したり子の宣言を他の親へ移したりしない。
[fixture: wardley/db-pipeline-duplicates]
[fixture: wardley/db-pipeline-collision]
[fixture: wardley/db-pipeline-nested-parent]
[fixture: wardley/db-empty-pipeline-names]

### WardleyPipelineComponent

| 欄                    | 型                                   | 意味                            |
| --------------------- | ------------------------------------ | ------------------------------- |
| `textBeforeName`      | WardleyIgnoredText のリスト          | keyword の後の形。              |
| `name`                | WardleyIdentifier or StringLiteral   | 書いた宣言名。                  |
| `textBeforeOpen`      | WardleyIgnoredText のリスト          | 一値の bracket の前の形。       |
| `textBeforeEvolution` | WardleyIgnoredText のリスト          | 開き bracket の後の形。         |
| `evolution`           | NumericLiteral                       | 書いた単独の evolution。        |
| `textBeforeClose`     | WardleyIgnoredText のリスト          | 閉じ bracket の前の形。         |
| `labelOffset`         | WardleyLabelOffsetDecoration or null | 書いた label offset（あれば）。 |
| `textAfter`           | WardleyIgnoredText のリスト          | 最初の可視 EOL の前の形。       |

子の欄:
textBeforeName、name、textBeforeOpen、textBeforeEvolution、evolution、textBeforeClose、labelOffset、textAfter。範囲: component から、label offset を書いた場合はその閉じ bracket、無ければ位置の閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/spec-wardley-parser-2c2c9064]
[fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/db-pipeline-label-inheritance]

継承する visibility、
座標 pair、synthetic ID は加えない。labelOffset は無記載のときだけ null で、
実在する装飾は前の gap を所有する。装飾がなければ残る形は textAfter。
子は固有の EOL を保ち、source strategy や inertia の装飾は持てない。
[fixture: wardley/hidden-all-unit-gaps] [fixture: wardley/hidden-pipeline-eol]
[fixture: wardley/lex-hidden-pipeline-child-spare]
[fixture: wardley/db-pipeline-collision]
[fixture: wardley/db-pipeline-label-inheritance]
[fixture: wardley/gram-pipeline-child-strategy-rejected]

### WardleyNoteStatement

| 欄                      | 型                          | 意味                               |
| ----------------------- | --------------------------- | ---------------------------------- |
| `textBeforeText`        | WardleyIgnoredText のリスト | note の後の形。                    |
| `text`                  | StringLiteral               | 必須の引用した note の text。      |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates          | 書いた visibility/evolution の組。 |
| `textAfter`             | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。          |

子の欄: textBeforeText、text、textBeforeCoordinates、coordinates、textAfter。
範囲: note から座標の閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/db-empty-texts]
[fixture: wardley/hidden-all-unit-gaps]

text は空や複数行の string でもよい。coordinates は原文の visibility/evolution
の組で、string 内の native に見える文字は別の子ではなく中身。
[fixture: wardley/db-empty-texts] [fixture: wardley/lex-string-multiline]
[fixture: wardley/hidden-yaml-string] [fixture: wardley/hidden-directive-string]
[fixture: wardley/line-string-values]

### WardleyAnnotationsStatement

| 欄                      | 型                          | 意味                               |
| ----------------------- | --------------------------- | ---------------------------------- |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates          | 書いた visibility/evolution の組。 |
| `textAfter`             | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。          |

子の欄: textBeforeCoordinates、coordinates、textAfter。
範囲: annotations から座標の閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/db-later-invalid-box]
[fixture: wardley/hidden-all-unit-gaps]

後の全出現も含め、
書いた annotations box の文。coordinates は構文で定義する integer/decimal の形を
許す。複数の文を最初の有効な box に置き換えず、
その範囲検査を後の node に当てない。
[fixture: wardley/db-singletons-last] [fixture: wardley/db-later-invalid-box]
[fixture: wardley/gram-box-first-invalid]
[fixture: wardley/db-coordinate-boundary]

### WardleyAnnotationStatement

| 欄                      | 型                          | 意味                               |
| ----------------------- | --------------------------- | ---------------------------------- |
| `textBeforeNumber`      | WardleyIgnoredText のリスト | annotation の後の形。              |
| `number`                | NumericLiteral              | 書いた unsigned の注釈番号。       |
| `textBeforeComma`       | WardleyIgnoredText のリスト | 最初の comma の前の形。            |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates          | 書いた visibility/evolution の組。 |
| `textBeforeText`        | WardleyIgnoredText のリスト | 引用 text の前の形。               |
| `text`                  | StringLiteral               | 必須の引用した注釈 text。          |
| `textAfter`             | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。          |

子の欄:
textBeforeNumber、number、textBeforeComma、textBeforeCoordinates、coordinates、textBeforeText、text、textAfter。範囲: annotation から text の閉じ quote まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/db-array-duplicates]

textBeforeCoordinates は最初の comma の後から bracket の前。number と text は必
須で、番号 zero、空 string、
番号の反復も原文の node に保つ。coordinates は visibility が先の integer/decimal
の組。
[fixture: wardley/hidden-all-unit-gaps] [fixture: wardley/db-empty-texts]
[fixture: wardley/db-array-duplicates] [fixture: wardley/db-coordinate-boundary]
[fixture: wardley/db-number-int-precision]

### WardleyAcceleratorStatement

| 欄                      | 型                                 | 意味                               |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| `textBeforeName`        | WardleyIgnoredText のリスト        | keyword の後の形。                 |
| `name`                  | WardleyIdentifier or StringLiteral | 書いた宣言名。                     |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト        | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates                 | 書いた visibility/evolution の組。 |
| `textAfter`             | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。          |

子の欄: textBeforeName、name、textBeforeCoordinates、coordinates、textAfter。
範囲: accelerator から座標の閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/db-array-duplicates]
[fixture: wardley/hidden-all-unit-gaps]

name は bare、引用名、
引用した空名でもよい。coordinates は原文の visibility/evolution 順の必須の
decimal の組。同名を merge せず全出現を保つ。
[fixture: wardley/accelerator-letter] [fixture: wardley/db-empty-texts]
[fixture: wardley/db-array-duplicates] [fixture: wardley/line-every-text]

### WardleyDeacceleratorStatement

| 欄                      | 型                                 | 意味                               |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| `textBeforeName`        | WardleyIgnoredText のリスト        | keyword の後の形。                 |
| `name`                  | WardleyIdentifier or StringLiteral | 書いた宣言名。                     |
| `textBeforeCoordinates` | WardleyIgnoredText のリスト        | 開き bracket の前の形。            |
| `coordinates`           | WardleyCoordinates                 | 書いた visibility/evolution の組。 |
| `textAfter`             | WardleyIgnoredText のリスト        | 最初の可視 EOL の前の形。          |

子の欄: textBeforeName、name、textBeforeCoordinates、coordinates、textAfter。
範囲: deaccelerator から座標の閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/db-all-fields] [fixture: wardley/db-array-duplicates]
[fixture: wardley/hidden-all-unit-gaps]

引用した空名も含め name と coordinates は必須で、coordinates は decimal の
visibility/evolution の組のまま。宣言の反復は力の合成値にせず別の node に保つ。
[fixture: wardley/deaccelerator-letter] [fixture: wardley/db-empty-texts]
[fixture: wardley/db-array-duplicates] [fixture: wardley/space-every-text]

### WardleyEvolutionStatement

| 欄       | 型                            | 意味                     |
| -------- | ----------------------------- | ------------------------ |
| `stages` | list of WardleyEvolutionStage | 書いた stage。二つ以上。 |

子の欄: stages。
範囲: evolution から最後の stage の suffix まで。stage separator の -> は句読点
であり、link の arrow にはしない。
[fixture: wardley/db-stages-boundaries] [fixture: wardley/db-singletons-last]
[fixture: wardley/lex-hidden-evolution-members]

最後の代入だけでなく全 evolution 文を保つ。stages は source order と、
各 boundary を書いた stage への結び付きを保ち、label/boundary の並行した二つのリ
ストや既定値を導出しない。stage のない末尾の arrow は拒否する。
[fixture: wardley/db-singletons-last] [fixture: wardley/db-stages-boundaries]
[fixture: wardley/gram-stage-trailing-arrow]
[fixture: wardley/gram-evolution-single]

### WardleyEvolutionStage

| 欄                         | 型                                         | 意味                                        |
| -------------------------- | ------------------------------------------ | ------------------------------------------- |
| `textBefore`               | WardleyIgnoredText のリスト                | evolution または stage separator の後の形。 |
| `name`                     | WardleyIdentifier or StringLiteral         | 書いた第 1 の stage 名。                    |
| `textBeforeBoundaryMark`   | WardleyIgnoredText のリスト                | 書いた @ の前の形。                         |
| `textBeforeBoundary`       | WardleyIgnoredText のリスト                | @ の後、数の前の形。                        |
| `boundary`                 | NumericLiteral or null                     | 書いた boundary の数。                      |
| `textBeforeSecondNameMark` | WardleyIgnoredText のリスト                | 書いた slash の前の形。                     |
| `textBeforeSecondName`     | WardleyIgnoredText のリスト                | slash の後、名前の前の形。                  |
| `secondName`               | WardleyIdentifier or StringLiteral or null | 書いた第 2 の stage 名。                    |
| `textAfter`                | WardleyIgnoredText のリスト                | 次の separator または EOL の前の形。        |

子の欄:
textBefore、name、textBeforeBoundaryMark、textBeforeBoundary、boundary、textBeforeSecondNameMark、textBeforeSecondName、secondName、textAfter。範囲: 最初の textBefore から、無ければ name から、最後に書いた secondName/boundary/name まで。textAfter があればそこまで。
[fixture: wardley/lex-hidden-evolution-members]
[fixture: wardley/db-stages-boundaries]
[fixture: wardley/db-stage-empty-second-name]

boundary は @ の節全体が無いときだけ、secondName は slash の節全体が無いときだけ
null。どちらの名前の位置も空 string は StringLiteral のまま。
ない節の gap は空にする。boundary がなければ書いた slash の前の形は
textBeforeSecondNameMark、両方の節がなければ name 後は textAfter。
最後の stage も EOL 前の suffix を所有する。trim や二つの名を結合した綴りで葉を
置き換えない。
[fixture: wardley/lex-hidden-evolution-members]
[fixture: wardley/db-stage-empty-second-name]
[fixture: wardley/db-stages-boundaries]
[fixture: wardley/lex-number-boundary-integer]

### WardleySizeStatement

| 欄                 | 型                          | 意味                             |
| ------------------ | --------------------------- | -------------------------------- |
| `textBeforeOpen`   | WardleyIgnoredText のリスト | size の後、bracket の前の形。    |
| `textBeforeWidth`  | WardleyIgnoredText のリスト | 開き bracket の後の形。          |
| `width`            | NumericLiteral              | 書いた unsigned integer の幅。   |
| `textBeforeComma`  | WardleyIgnoredText のリスト | comma の前の形。                 |
| `textBeforeHeight` | WardleyIgnoredText のリスト | comma の後、高さの前の形。       |
| `height`           | NumericLiteral              | 書いた unsigned integer の高さ。 |
| `textBeforeClose`  | WardleyIgnoredText のリスト | 閉じ bracket の前の形。          |
| `textAfter`        | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。        |

子の欄:
textBeforeOpen、textBeforeWidth、width、textBeforeComma、textBeforeHeight、height、textBeforeClose、textAfter。範囲: size から閉じ bracket まで。textAfter があればそこまで。
[fixture: wardley/hidden-all-unit-gaps] [fixture: wardley/db-singletons-last]
[fixture: wardley/db-number-overflow]

両数は必須で、構文が許す zero や overflow の値も含む。
後に別の size が続いても書いた文を残し、
描画の寸法や正規化した数の綴りへ置き換えない。
[fixture: wardley/db-singletons-last] [fixture: wardley/db-number-overflow]
[fixture: wardley/db-number-int-precision]
[fixture: wardley/lex-number-size-decimal]
[fixture: wardley/gram-size-trailing-comma] [fixture: wardley/gram-size-zero]

### WardleyCoordinates

| 欄                     | 型                          | 意味                            |
| ---------------------- | --------------------------- | ------------------------------- |
| `textBeforeVisibility` | WardleyIgnoredText のリスト | 開き bracket の後の形。         |
| `visibility`           | NumericLiteral              | 書いた第 1 の座標。             |
| `textBeforeComma`      | WardleyIgnoredText のリスト | comma の前の形。                |
| `textBeforeEvolution`  | WardleyIgnoredText のリスト | comma の後、第 2 の値の前の形。 |
| `evolution`            | NumericLiteral              | 書いた第 2 の座標。             |
| `textBeforeClose`      | WardleyIgnoredText のリスト | 閉じ bracket の前の形。         |

子の欄:
textBeforeVisibility、visibility、textBeforeComma、textBeforeEvolution、evolution、textBeforeClose。範囲: 開き bracket から対応する閉じ bracket まで。
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/hidden-yaml-component-gaps]

この具体的な組は
anchor/component/note/annotations/annotation/accelerator/deaccelerator の文が使
う。
入れ替えや百分率化をせず visibility、evolution の順を保つ。annotation と box の
位置だけは decimal に加え integer の葉も許す。pipeline の子は一つの evolution の
葉を持ち、この組を合成しない。
[fixture: wardley/db-all-fields] [fixture: wardley/db-coordinate-boundary]
[fixture: wardley/number-integer-coordinate]
[fixture: wardley/spec-wardley-parser-2c2c9064]
[fixture: wardley/directive-coordinate-parts]

### WardleyLabelOffsetDecoration

| 欄                | 型                          | 意味                                 |
| ----------------- | --------------------------- | ------------------------------------ |
| `textBefore`      | WardleyIgnoredText のリスト | label の前の形。                     |
| `textBeforeOpen`  | WardleyIgnoredText のリスト | label と bracket の間の形。          |
| `textBeforeX`     | WardleyIgnoredText のリスト | bracket の後、符号または数の前の形。 |
| `negativeX`       | boolean                     | 第 1 の minus を書いたか。           |
| `textAfterXSign`  | WardleyIgnoredText のリスト | 書いた第 1 の minus の後の形。       |
| `offsetX`         | NumericLiteral              | 書いた unsigned の第 1 の大きさ。    |
| `textBeforeComma` | WardleyIgnoredText のリスト | comma の前の形。                     |
| `textBeforeY`     | WardleyIgnoredText のリスト | comma の後、符号または数の前の形。   |
| `negativeY`       | boolean                     | 第 2 の minus を書いたか。           |
| `textAfterYSign`  | WardleyIgnoredText のリスト | 書いた第 2 の minus の後の形。       |
| `offsetY`         | NumericLiteral              | 書いた unsigned の第 2 の大きさ。    |
| `textBeforeClose` | WardleyIgnoredText のリスト | 閉じ bracket の前の形。              |

子の欄:
textBefore、textBeforeOpen、textBeforeX、textAfterXSign、offsetX、textBeforeComma、textBeforeY、textAfterYSign、offsetY、textBeforeClose。範囲: 最初の textBefore から、無ければ label から、閉じ bracket まで。
[fixture: wardley/db-all-fields] [fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/hidden-all-unit-gaps]

大きさの両葉は必須の unsigned integer。negative の flag は -0 も含め minus を書
いたときだけ true で、minus の句読点は NumericLiteral.raw の外。minus が無ければ
対応する textAfterXSign/textAfterYSign は空で、textBeforeX/textBeforeY が数の前
の全形を所有する。minus があれば textBeforeX/Y がその
前、textAfterXSign/textAfterYSign がその後。
有効な符号付き offset でこれらの欄を置き換えない。
[fixture: wardley/number-offset-negative-zero]
[fixture: wardley/lex-number-offset-separated-minus]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/directive-offset-sign]
[fixture: wardley/lex-selected-offset-sign]
[fixture: wardley/lex-number-offset-decimal]
[fixture: wardley/db-node-duplicates]

### WardleySourceStrategyDecoration

| 欄                | 型                          | 意味                        |
| ----------------- | --------------------------- | --------------------------- |
| `textBefore`      | WardleyIgnoredText のリスト | 開き parenthesis の前の形。 |
| `textBeforeValue` | WardleyIgnoredText のリスト | 開き parenthesis の後の形。 |
| `value`           | string                      | 書いた固定の strategy。     |
| `textBeforeClose` | WardleyIgnoredText のリスト | 閉じ parenthesis の前の形。 |

子の欄: textBefore、textBeforeValue、textBeforeClose。
範囲: 最初の textBefore から、無ければ開き parenthesis から、
閉じ parenthesis まで。
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/hidden-all-unit-gaps] [fixture: wardley/db-inertia-forms]

value は build/buy/outsource/market で、Identifier の葉ではない。
両 parenthesis は必須で、形全体がなければ装飾リストにも node がない。
共有 trivia は原文の部品を分けられるが固定語を分割できない。
[fixture: wardley/db-inertia-forms]
[fixture: wardley/spec-wardley-parser-95189f48]
[fixture: wardley/directive-strategy-parts]
[fixture: wardley/directive-strategy-inside]
[fixture: wardley/lex-selected-strategy-parts]
[fixture: wardley/lex-selected-strategy-inside]

### WardleyInertiaDecoration

| 欄           | 型                          | 意味                    |
| ------------ | --------------------------- | ----------------------- |
| `textBefore` | WardleyIgnoredText のリスト | 裸の inertia の前の形。 |

子の欄: textBefore。範囲: 最初の textBefore から、無ければ inertia から、
裸の keyword の末尾まで。
[fixture: wardley/db-all-fields] [fixture: wardley/db-inertia-forms]
[fixture: wardley/lex-hidden-bare-inertia-suffix]

この node は裸の inertia だけを表し、内部 gap、有効な boolean 値、
括弧の欄は加えない。その後から EOL 前までの形は component の textAfter に置く。
[fixture: wardley/db-inertia-forms] [fixture: wardley/inertia-letter]
[fixture: wardley/gram-component-inertia-duplicate]
[fixture: wardley/lex-hidden-bare-inertia-suffix]

### WardleyParenthesizedInertiaDecoration

| 欄                  | 型                          | 意味                        |
| ------------------- | --------------------------- | --------------------------- |
| `textBefore`        | WardleyIgnoredText のリスト | 開き parenthesis の前の形。 |
| `textBeforeInertia` | WardleyIgnoredText のリスト | 開き parenthesis の後の形。 |
| `textBeforeClose`   | WardleyIgnoredText のリスト | 閉じ parenthesis の前の形。 |

子の欄: textBefore、textBeforeInertia、textBeforeClose。
範囲: 最初の textBefore から、無ければ開き parenthesis から、
閉じ parenthesis まで。
[fixture: wardley/db-inertia-forms]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/hidden-all-unit-gaps]

両 parenthesis と完全な inertia の語を必要とする。
内部の形は上の二つの所有欄に置く。
裸の inertia、source strategy の装飾とは別に保ち、
閉じの後の形は component の suffix に置く。
[fixture: wardley/db-inertia-forms]
[fixture: wardley/hidden-yaml-component-gaps]
[fixture: wardley/hidden-all-unit-gaps]
[fixture: wardley/lex-hidden-parenthesized-inertia-suffix]
[fixture: wardley/directive-parenthesized-inertia-parts]
[fixture: wardley/lex-selected-parenthesized-inertia-parts]

### WardleyArrow

| 欄            | 型                    | 意味                        |
| ------------- | --------------------- | --------------------------- |
| `value`       | string                | arrow 全体の原文。          |
| `kind`        | string                | dependency または flow。    |
| `line`        | string                | glyph による solid/dotted。 |
| `startMarker` | string                | 書いた左の marker の有無。  |
| `label`       | StringLiteral or null | flow の引用した label。     |
| `endMarker`   | string                | 書いた右の marker の有無。  |

子の欄: label。
範囲: dependency-arrow/link-arrow の最初の glyph の文字から最後まで、
または plus から flow の最後の marker まで。
[fixture: wardley/db-link-forms] [fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]

kind は ->/-->/-.->/> で dependency、
それ以外で flow。line は書いた glyph が -.-> のときだけ dotted、
それ以外は > 単独も含め solid。dependency の startMarker は none、endMarker は
arrow。flow の末尾 < は arrow/none、> は none/arrow、<> は arrow/arrow。
これらは原文の glyph を表し、label の中身に影響される導出 flow/dashed の値ではな
い。
[fixture: wardley/db-link-forms]
[fixture: wardley/lex-flow-label-changes-direction]
[fixture: wardley/lex-flow-label-changes-bidirectional]
[fixture: wardley/lex-flow-label-changes-dashed]
[fixture: wardley/lex-flow-label-changes-dashed-short]

label は dependency で null、flow では空も含め必須の閉じた
StringLiteral。range/raw は single quote を含む。value は label の
quote、escape、内部の source の改行も含む arrow 全体の原文で、
共有 trivia を除き range は跨ぐ。native hidden は部品の間に入れず、
許された global trivia から別の hidden child も作らない。
[fixture: wardley/db-link-forms] [fixture: wardley/lex-link-flow-raw-escapes]
[fixture: wardley/line-every-text]
[fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]
[fixture: wardley/directive-every-field]
[fixture: wardley/lex-link-native-flow-components]
[fixture: wardley/lex-selected-flow-after-label]

### WardleyTitleStatement

| 欄          | 型                          | 意味                      |
| ----------- | --------------------------- | ------------------------- |
| `value`     | WardleyLiteral or null      | 原文の共通値。            |
| `textAfter` | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。 |

子の欄: value、textAfter。
範囲: title から値の最後の文字、null なら keyword まで。textAfter があればそこま
で。
[fixture: wardley/common-title-eof] [fixture: wardley/common-title-two-spaces]
[fixture: wardley/common-title-tabs] [fixture: wardley/hidden-directive-title]

value は title とちょうど一つの ASCII space/tab の separator の後から。
残る行の値の padding を全て保ち、separator や残る中身がなければ null、
二つ目の separator は空白の中身。
行の値の後から最初の可視 EOL の前の native form は textAfter、
その後は body item。
[fixture: wardley/common-title-eof] [fixture: wardley/common-title-two-spaces]
[fixture: wardley/common-title-tabs] [fixture: wardley/hidden-directive-title]
[fixture: wardley/lex-hidden-title-suffix]
[fixture: wardley/lex-hidden-title-after-visible-eol]

### WardleyAccTitleStatement

| 欄          | 型                          | 意味                      |
| ----------- | --------------------------- | ------------------------- |
| `value`     | WardleyLiteral or null      | 原文の共通値。            |
| `textAfter` | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。 |

子の欄: value、textAfter。
範囲: accTitle から値の最後の文字、null なら colon まで。textAfter があればそこ
まで。
[fixture: wardley/common-acctitle-eof] [fixture: wardley/common-repeat-empty]
[fixture: wardley/lex-hidden-common-prefix-eol]

value は colon 直後の行の原文で、両端の padding も保つ。
残る中身がないときだけ null、空白だけは literal。
最初の可視 EOL の前の native suffix は textAfter、その後の形は body item。
[fixture: wardley/common-acctitle-eof] [fixture: wardley/common-line-whitespace]
[fixture: wardley/common-empty-literals]
[fixture: wardley/lex-hidden-common-prefix-eol]
[fixture: wardley/lex-hidden-acctitle-after-visible-eol]

### WardleyAccDescrStatement

| 欄          | 型                          | 意味                      |
| ----------- | --------------------------- | ------------------------- |
| `value`     | WardleyLiteral or null      | 原文の共通値。            |
| `textAfter` | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。 |

子の欄: value、textAfter。
範囲: accDescr から行の値の最後の文字、null なら colon まで。textAfter があれば
そこまで。
[fixture: wardley/common-description-eof] [fixture: wardley/common-repeat]
[fixture: wardley/hidden-yaml-description]

value は colon 直後から始まり行の padding を保つ。空白だけでなく、
残る中身がない場合だけ null。中身に brace があっても line の形。
可視 EOL 前の native suffix は textAfter、その後は body item。
[fixture: wardley/common-description-eof]
[fixture: wardley/common-empty-literals] [fixture: wardley/common-quoted-values]
[fixture: wardley/common-description-colon-braces]
[fixture: wardley/hidden-yaml-description]
[fixture: wardley/lex-hidden-description-suffix]

### WardleyAccDescrBlockStatement

| 欄          | 型                          | 意味                      |
| ----------- | --------------------------- | ------------------------- |
| `value`     | WardleyLiteral or null      | 原文の共通値。            |
| `textAfter` | WardleyIgnoredText のリスト | 最初の可視 EOL の前の形。 |

子の欄: value、textAfter。
範囲: accDescr から必須の最初の閉じ brace まで。textAfter があればそこまで。
[fixture: wardley/common-empty-interleaved]
[fixture: wardley/common-block-whitespace]
[fixture: wardley/common-block-first-close]
[fixture: wardley/hidden-after-block]

value は brace の内部の両端から共通 whitespace だけを除いた原文で、
共有の除去後に中身が残らなければ null。内部の字下げ、source の改行、
裸の percent 行、quote、escape を保つ。空 block もこの node を作る。
閉じは必須なので closed の欄は不要。最初の可視 EOL 前の suffix は textAfter、
その後の形は body。
[fixture: wardley/common-empty-literals]
[fixture: wardley/common-block-whitespace]
[fixture: wardley/common-block-comment]
[fixture: wardley/common-block-directive]
[fixture: wardley/common-block-bare-percent]
[fixture: wardley/common-block-first-close]
[fixture: wardley/common-block-escaped-close]
[fixture: wardley/common-block-open] [fixture: wardley/line-block-values]

### WardleyIdentifier

| 欄     | 型     | 意味               |
| ------ | ------ | ------------------ |
| `name` | string | 原文の bare name。 |

子の欄: なし。範囲: 名前として読む原文の最初から最後の文字まで。
内部の space/tab は含み、外側の padding は除く。
[fixture: wardley/db-id-underscore] [fixture: wardley/db-unquoted-names]
[fixture: wardley/lex-native-after-name-space]
[fixture: wardley/lex-name-trailing-space]

name は共通 Directive、comment region、
選ばれた semicolon を除いた原文を連ね、range は内部の共有 trivia を跨ぐ。
比較変換をせず、大文字小文字、ampersand、丸括弧、hyphen、内部空白を保つ。
その名に空白がなくても共有 Identifier に変えない。native hidden は二つの名をこの
葉へ接合しない。
[fixture: wardley/directive-name-inside] [fixture: wardley/db-unquoted-names]
[fixture: wardley/lex-name-inner-keyword] [fixture: wardley/db-id-underscore]
[fixture: wardley/lex-native-between-name-chunks]
[fixture: wardley/lex-native-after-name-space]

### WardleyLiteral

| 欄      | 型     | 意味                             |
| ------- | ------ | -------------------------------- |
| `value` | string | 非空の共通値/link-label の原文。 |

子の欄: なし。範囲: 所有する文が定める原文の値の最初から最後まで。
内部の共通 trivia を跨ぐ。
[fixture: wardley/common-title-tabs] [fixture: wardley/common-line-whitespace]
[fixture: wardley/common-block-whitespace] [fixture: wardley/space-link-label]

value から共通 Directive、comment region、
選ばれた semicolon を除き、source の改行、
空白、quote、entity、escape の綴りを含め他の全ての文字を保つ。escape の解釈や空
白の縮約はしない。null の値から空の literal は作らない。link-label の値は
semicolon の後からで、共通値は上の 4 文固有の範囲に従う。
[fixture: wardley/directive-every-field] [fixture: wardley/common-block-comment]
[fixture: wardley/style-every-text] [fixture: wardley/common-line-ls-ps]
[fixture: wardley/line-link-label-values] [fixture: wardley/entity-texts]
[fixture: wardley/common-open-quote] [fixture: wardley/common-empty-literals]
[fixture: wardley/tail-link-spaced-label]

### WardleyIgnoredText

| 欄      | 型     | 意味                              |
| ------- | ------ | --------------------------------- |
| `kind`  | string | yaml-block または directive。     |
| `value` | string | 非空の whole hidden form の原文。 |

子の欄: なし。範囲: 3 本 dash または percent-brace の開始から適格な閉じまで。
前の padding と直後に消費した後続改行は除く。
[fixture: wardley/lex-hidden-directive-cr] [fixture: wardley/lex-hidden-yaml-cr]
[fixture: wardley/hidden-yaml-crlf] [fixture: wardley/hidden-directive-eof]
[fixture: wardley/hidden-yaml-eof]

内部の padding と source の改行を保ち、追加 LF は value/range に含めない。
両 kind は閉じを必要とするため closed の欄はない。
本文が空でも fence を含む値は非空。許された句読点の接合も含め、
共有 Directive、comment region、
選ばれた semicolon は value から除き、range は跨ぐ。
内部の global directive は固有の効果を保ち、native の形自体には設定/frontmatter
の効果はない。
[fixture: wardley/hidden-yaml-adjacent-eof]
[fixture: wardley/hidden-directive-adjacent]
[fixture: wardley/lex-hidden-yaml-common-directive]
[fixture: wardley/lex-hidden-yaml-comment-region]
[fixture: wardley/directive-native-opener-split]
[fixture: wardley/directive-native-yaml-closer]
[fixture: wardley/lex-selected-native-yaml-opener]
[fixture: wardley/lex-selected-native-directive-opener]
[fixture: wardley/detect-block-after-directive]

各 whole match は textBeforeHeader、body、member の名前つき gap、
文の suffix の一箇所に置く。[字句の選択肢](../diagrams/wardley.ja.md)に従
い、YAML
の本文ありの選択肢は 3 本の fence を一つの node にできる一方、
非空の block 二つは別に保つ。native directive が失敗すれば共有 Comment になり得
る。
先の string や値が囲む native に見える文字を所有し、ignored node として重複させ
ない。
[fixture: wardley/hidden-yaml-adjacent-later]
[fixture: wardley/hidden-yaml-nested]
[fixture: wardley/lex-hidden-comment-fallback-with-hidden]
[fixture: wardley/lex-hidden-string-with-hidden]
[fixture: wardley/lex-hidden-link-label-with-hidden]
[fixture: wardley/lex-hidden-description-with-hidden]
[fixture: wardley/lex-hidden-after-visible-eol]
[fixture: wardley/lex-hidden-evolution-members]
[fixture: wardley/lex-hidden-pipeline-before-close]

## 例

次の原文の例は導出 Db の record でなく木を示す。座標は書いた順を保ち、
符号付き offset は unsigned の数の葉と別の minus flag を持つ。body は
annotations box、pipeline、link、evolve、書いた共通の形を source order に残す。
二つの inertia の形と flow label の形は補足の引用にも示す。
[fixture: wardley/db-all-fields] [fixture: wardley/db-inertia-forms]
[fixture: wardley/db-link-forms]

```mmd
wardley-beta
title T
accTitle: A
accDescr { D
 E }
size [900,600]
evolution " G "@0.3 / C -> P@1.0
anchor User [0.9,0.8]
component A [0.4,0.5] label [-0,-2] (build) inertia
component B [20.0,30.0]
pipeline A {
component Child [0.6]
}
User -> Child; label
evolve A 0.9
annotations [10,20]
annotation 1,[30,40] "Text"
note "N" [0.1,0.2]
accelerator X [0.2,0.3]
deaccelerator Y [0.3,0.4]
```

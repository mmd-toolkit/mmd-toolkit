# directive-as-token-boundary

英語版: [directive-as-token-boundary.md](./directive-as-token-boundary.md)

図種: すべて。
これは、
この仕様の mermaid.js との [既知の差異](../known-divergences.ja.md) の 1
つです。

## 構文

ディレクティブは、`%%{init: {}}%%` のような、`%%{` と名前で、
その後に引数が続くことがあり、ふつうは `}%%` で閉じます。
それは図に設定を与えます（[ディレクティブ](../common.ja.md#ディレクティブ)
を参照）。
ふつうは、ヘッダーの前の、それだけの行に書きます。

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

この例は見出しの前に `init` ディレクティブを置きます。
[fixture: common/directive-init-theme]

mermaid.js は、図を読む前に、
どこにあってもすべてのディレクティブをテキストから除き、
その前と後のテキストをつなぎます。
この仕様も同じに読みます。
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
を参照してください。
例外が 1 つあり、この文書はそれについてのものです。
名前、
キーワード（sequence 図のメッセージの `wrap:` のような折り返しの接頭辞を含む）、
`:::` のような区切り記号、矢印、数の中のディレクティブです。
ここでの名前は、空白を含みうるかどうかにかかわらず、
図の文書が名前の単位と数えるものです。
U+00A0 を含みうる ER の実体の名前も、gantt の click の id も、その 1 つです。
sequence 図の参加者の id、クラスの名前、 `~` を使って書いた ER の属性の語、
gantt のタスクの説明、要求図の引用符なしの名前のように、
図の文書がテキストの単位と数える名前は、テキストとして読まれます。
[fixture: sequence/div-directive-in-wrap-prefix]
[fixture: sequence/lex-directive-in-participant-id]
[fixture: class/lex-directive-in-name] [fixture: er/div-directive-in-name]
[fixture: er/lex-directive-in-tilde-word]
[fixture: gantt/div-directive-in-click-id]
[fixture: gantt/lex-directive-in-task-text]
[fixture: requirement/lex-directive-in-name]

kanban では `kanban`、形の開きと閉じ、`::icon(`、`:::`、
データの開き `@{` の中のディレクティブは拒否します。
mermaid.js は前後をつないで受理します。
[fixture: kanban/header-directive-inside] [fixture: kanban/div-directive-opener]
[fixture: kanban/div-directive-closer]
[fixture: kanban/div-directive-icon-marker]
[fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker]

ノード本文、形の本文、icon 本文、class 本文、文字列、データ本文には、
ディレクティブを置けます。 [fixture: kanban/db-grid-directive-item-id]
[fixture: kanban/db-grid-directive-item-label-bare]
[fixture: kanban/db-grid-directive-item-icon]
[fixture: kanban/db-grid-directive-item-class]
[fixture: kanban/lex-label-directive-line]
[fixture: kanban/db-metadata-directive]

完全なデータブロックの間にはディレクティブを置けます。
[fixture: kanban/db-metadata-adjacent-directive]
[単位の中のディレクティブ](../diagrams/kanban.ja.md#単位の中のディレクティブ)
を参照してください。

C4 では見出し語、呼び出し語、`accTitle`、`accDescr` の内部の、
ディレクティブを拒否し、 mermaid.js は前後をつなぎます。
[fixture: c4/lex-directive-keyword] [fixture: c4/div-directive-header]
[fixture: c4/div-acc-title-directive]
[fixture: c4/div-acc-block-marker-directive]

裸の引数と名前付きキーはテキスト単位なので、
引用引数やタイトル・説明のテキストと同様に、内部にディレクティブを置けます。
[fixture: c4/lex-directive-bare-alias] [fixture: c4/lex-directive-named-key]
[fixture: c4/lex-directive-quoted] [fixture: c4/lex-title-directive-value]

名前付き値の等号と開き引用符は別の区切りなので、
その間のディレクティブを許します。
[fixture: c4/lex-directive-named-equals-quote]

venn では、見出し、文のキーワード、名前、size、数値の text id、
裸の style 値の識別子か数の中のディレクティブをここでは拒否します。
[fixture: venn/header-directive-inside] [fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value]
[fixture: venn/div-directive-union-target] [fixture: venn/div-directive-text-id]
[fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]
[fixture: venn/lex-unterminated-directive-next-line]
[fixture: venn/lex-unterminated-colon-directive-next-line]

mermaid.js はその前後を連結します。 [fixture: venn/header-directive-inside]
[fixture: venn/lex-directive-in-set] [fixture: venn/lex-directive-in-union]
[fixture: venn/lex-directive-in-text] [fixture: venn/lex-directive-in-style]
[fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value]
[fixture: venn/div-directive-union-target] [fixture: venn/div-directive-text-id]
[fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]
[fixture: venn/lex-unterminated-directive-next-line]
[fixture: venn/lex-unterminated-colon-directive-next-line]

venn の文字列、ラベルの内容、タイトルの内容、色全体は、
ディレクティブを含められます。 [fixture: venn/lex-identifier-directive-middle]
[fixture: venn/db-grid-directive-label-bare]
[fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-style-directive-middle]
[fixture: venn/lex-title-directive-middle]
[fixture: venn/lex-directive-style-value-color]
[fixture: venn/lex-style-value-rgb-directive-in-comma]
[fixture: venn/lex-directive-label-delimiter-gap]

ラベルの角括弧と引用符は別の区切りです。
[fixture: venn/lex-identifier-directive-middle]
[fixture: venn/db-grid-directive-label-bare]
[fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-style-directive-middle]
[fixture: venn/lex-title-directive-middle]
[fixture: venn/lex-directive-style-value-color]
[fixture: venn/lex-style-value-rgb-directive-in-comma]
[fixture: venn/lex-directive-label-delimiter-gap]

Ishikawa で、
選ばれた `ishikawa` や `ishikawa-beta` のキーワードを分断する directive
は拒否します。
完全な beta の見出しの `-beta` の直前も同じです。
mermaid.js は前後をつないでこれらを受理します。
[fixture: ishikawa/directive-in-header]
[fixture: ishikawa/directive-in-beta-header]
[fixture: ishikawa/div-directive-beta-prefix]

beta の単語境界が合わなければ、通常の見出しの後の接尾部は節点のテキストです。
その中や `-betaX` の直前に directive を置けます。
数に見える節点のテキストにも directive を置けます。
これらは両者が受理し、差異の印を付けません。
[fixture: ishikawa/lex-directive-before-beta-fallback-text]
[fixture: ishikawa/lex-directive-in-beta-fallback-text]
[fixture: ishikawa/lex-directive-in-numeric-looking-text]

節点のテキストは、引用符も含めて散文です。
directive を含められ、値からは除きます。
[fixture: ishikawa/directive-root-middle]
[fixture: ishikawa/directive-in-quoted-root]
[fixture: ishikawa/directive-child-middle]

## 差異

どの例も、図の全体です。

1. キーワードの中のディレクティブ:

   ```mmd
   sequenceDiagram
     parti%%{init: {}}%%cipant A
   ```

2. 区切り記号の中のディレクティブ:

   ```mmd
   flowchart LR
     A::%%{init: {}}%%:c
     classDef c fill:#f00
   ```

3. 名前の中のディレクティブ:

   ```mmd
   flowchart LR
     A%%{init: {}}%%B-->C
   ```

4. 矢印の中のディレクティブ:

   ```mmd
   flowchart LR
     A-%%{init: {}}%%-->B
   ```

5. 数の中のディレクティブ:

   ```mmd
   sequenceDiagram
     autonumber 1%%{init: {}}%%0
     A->>B: x
   ```

6. 文字列の中のディレクティブ:

   ```mmd
   flowchart LR
     A["a %%{init: {}}%% b"] --> B
   ```

7. ラベルのテキストの中のディレクティブ:

   ```mmd
   flowchart LR
     A[x%%{init: {}}%%y]
   ```

| 例  | mermaid.js                              | この仕様 |
| --- | --------------------------------------- | -------- |
| 1   | 参加者 A                                | 拒否     |
| 2   | クラス c を持つ頂点 A                   | 拒否     |
| 3   | 頂点 `AB` から C への辺                 | 拒否     |
| 4   | `A--->B` と同じ、A から B への辺        | 拒否     |
| 5   | 10 から始まるメッセージの番号           | 拒否     |
| 6   | ラベル `a`、空白 2 つ、`b` を持つ頂点 A | 同じ     |
| 7   | ラベル `xy` を持つ頂点 A                | 同じ     |

表で比較した読みを次の fixture が記録します。
[fixture: sequence/div-directive-in-keyword]
[fixture: flowchart/div-directive-in-style-separator]
[fixture: flowchart/div-directive-in-id]
[fixture: flowchart/div-directive-in-arrow-length]
[fixture: sequence/div-directive-in-number]
[fixture: common/directive-in-string] [fixture: common/directive-in-label-text]

つまり mermaid.js は、どの入力も、ディレクティブを除いたテキストとして読みます。
この仕様もそうしますが、名前、キーワード、区切り記号、矢印、数は、
中にディレクティブを持てません。
そのような入力は拒否されます。
ディレクティブを除いたテキストを mermaid.js が拒否するときは、
どちらも入力を拒否します。
`flow%%{init: {}}%%chart LR` の後に行 `A-->` が続くものは、
mermaid.js では flowchart の文法が拒否し、この仕様では、
ディレクティブがヘッダーのキーワードの中にあるので拒否します。
[fixture: common/directive-splits-header-keyword]

同じヘッダーの後に行 `A-->B` が続けば、mermaid.js では flowchart になり、
この仕様では拒否されます。 [fixture: common/directive-in-header-keyword]

差異は一方向だけです。
この仕様は、mermaid.js が拒否する入力を受理することはなく、
どちらも受理する入力には、すべて同じ Db を与えます。

各図の文書は、これに当たるその図の単位を、既知の差異の節に挙げています。
[flowchart](../diagrams/flowchart.ja.md#既知の差異)、
[sequence](../diagrams/sequence.ja.md#既知の差異)、
[class](../diagrams/class.ja.md#既知の差異)、
[state](../diagrams/state.ja.md#既知の差異) です。

## 書き手にとっての結果

名前、キーワード、区切り記号、矢印、数の中のディレクティブは、
mmd-toolkit のパーサーでは拒否されます。
mermaid.js はそれを受理し、ディレクティブがないものとしてテキストを読みます。
どちらも同じに読む図を書くには、ディレクティブを独立した行に書きます。

## mermaid.js がそう読む理由

mermaid.js は、図を読む前に、1 回のテキストの置き換えで、
テキスト全体からすべてのディレクティブを除きます（mermaid.js の
[`processDirectives`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/preprocess.ts#L33-L45)、
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.ts#L200-L202)）。
各図種の字句解析器は、その後に残ったテキストを読み、
ディレクティブがどこにあったかを知りません。
キーワードや矢印の途中にディレクティブを挟めるのは、この処理の順から生じます。

## この仕様の規則と、その理由

この仕様では、ディレクティブはトークンの境界です。
その前と後のテキストは、mermaid.js と同じく、
つながっているものとして読まれるので、テキスト、文字列、
空白を含みうる名前はディレクティブを持てます。
名前、キーワード、区切り記号、矢印、数は、そのテキスト全体を表し、
その中のディレクティブは入力を拒否にします。

文字列は、もともと断片に切られることがあります。
コメント領域が文字列の中にあることがあり、そのとき文字列は、
領域の前と後の断片として読まれます。
文字列の中のディレクティブも同じように持たれ、文字列の値は、
コメント領域と同じく、それを除きます（[ノード](../ast.ja.md#ノード) を参照）。
テキストは散文で、空白を含みうる名前も同じです。
その中のディレクティブも同じように持たれます。
この仕様は、名前、数、矢印、キーワード、区切り記号を、
ディレクティブで切りません。
どれも、そのテキスト全体として読まれます。
mermaid.js がその中のディレクティブを読めるのは、
読む前の段階としてディレクティブを除くからで、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2
つ目の理由に当たります（[known-divergences.ja.md](../known-divergences.ja.md)
を参照）。

### Agentflow

agentflow では、全体の単位の規則を beta のヘッダー、flow、connector、global、
end、3 種の矢印、開く矢印、辺の id、形とプロパティの区切り、click の id、
補間名、linkStyle の番号にも適用します。
消したディレクティブの両側にその表記があります。
Identifier や矢印の隣のノードでは、
値や区切りを変えずに内部のテキストを保てません。
不可分の単位を再構築せず、理由 2 を適用します。
[fixture: agentflow/div-directive-in-header]
[fixture: agentflow/div-directive-in-flow-keyword]
[fixture: agentflow/div-directive-in-connector-keyword]
[fixture: agentflow/div-directive-in-global-keyword]
[fixture: agentflow/div-directive-in-end-keyword]
[fixture: agentflow/div-directive-in-arrow-reference]
[fixture: agentflow/div-directive-in-opening-arrow]
[fixture: agentflow/div-directive-in-edge-id]
[fixture: agentflow/div-directive-in-props-field]
[fixture: agentflow/div-directive-in-linkstyle-number]

flow と connector の Name の断片、ラベル、style、アクセシビリティ、
コールバック、文字列、不透明なデータの内部は、
既にディレクティブを共通の trivia として保てます。
特に metadata のキーはデータのテキストです。
完全な縦棒の境界も受理します。
これらに印は不要であり、結合後も mermaid.js が拒否する入力にも不要です。
[fixture: agentflow/lex-directive-in-flow-name-text]
[fixture: agentflow/lex-directive-in-classdef-value]
[fixture: agentflow/lex-directive-in-metadata-key]
[fixture: agentflow/lex-directive-in-pipe-boundary]
[fixture: agentflow/lex-directive-joins-invalid-linkstyle-index]

### Usecase

usecase で対象となるテキストは、ヘッダーや文のキーワード、方向語、id、辺 id、
class 名、native metadata の裸キーと値、CSS プロパティ名の語、矢印、
連続する `@{`、`:::`、`<<`、`>>` の内部の directive です。
Root.directives に directive は残せますが、
原子的な綴りの子や兄弟に置いて完全な単位を保つことはできません。
mermaid は結合した綴りを受理しますが、前処理を写さない完全な単位の規則により、
理由 2 で拒否します。
この規則による逆方向の受理はありません。
[fixture: usecase/div-directive-in-header]
[fixture: usecase/div-directive-in-id]
[fixture: usecase/div-directive-splits-operator]
[fixture: usecase/div-lex-directive-in-metadata-key]
[fixture: usecase/div-directive-in-native-boolean]
[fixture: usecase/div-directive-stereotype-closer]
[fixture: usecase/div-directive-raw-json-id]
[fixture: usecase/div-directive-explicit-edge-id]
[fixture: usecase/lex-stereotype-closer-control]
[fixture: usecase/gram-json-prefix-id-control]
[fixture: usecase/gram-explicit-edge-id-control]

CSS プロパティ名は `-- color` の内部 HWS も含められる名前の単位です。
その HWS 内の directive は trivia として受理します。
文字列や raw text の節点と同じく、名前の節点に前後のテキストを保持できます。
mermaid は directive の有無にかかわらず `--` と後の語を別々の単位に読みます。
結合するものがないので理由 2 は適用しません。
[fixture: usecase/lex-directive-css-name-gap]
[fixture: usecase/lex-class-property-custom-gap]
`co%%{init: {}}%%lor` のような語内の directive はこの差異のままです。
[fixture: usecase/div-directive-css-property]

CSS 値、引用した native metadata のキーと値、ラベル、stereotype、JSON 内容は、
書かれたテキストを保持して trivia による分断を許します。
[fixture: usecase/lex-directive-css-number]
[fixture: usecase/lex-directive-native-quoted-key]
json-prefix が json、id、@ をまとめても、それぞれは別の構成要素です。
完全な id と @ の間や @ と { の間の directive は許します。
native の `@{` は原子的です。
[fixture: usecase/lex-directive-whole-json-prefix-boundary]
[fixture: usecase/lex-directive-in-json-declaration-at]

### Pie

PieIgnoredText は、値の後の改行を取るものも含め、
単位の境界の隠れた DIRECTIVE を持てます。
共通の Directive は、書かれた完全な構成要素の間のディレクティブを持ちます。
どちらも `pie`、`showData`、`title`、`accTitle`、`accDescr`、
1 個の数の固定した綴りの中には置けません。
mermaid.js がディレクティブを除いて断片をつなぐ場合に、
直接の境界規則はその入力を拒否します。
完全な `accTitle` とコロン、`accDescr` と波括弧の間は構成要素の境界です。
引用したラベルや共通の文の値の中のディレクティブは、トリビアとして許します。
隠れた形は自分の書かれたテキストを保ち、数の断片をつなぎません。
これらの受理する形は差異ではありません。
下の差異の fixture はすべて mermaid.js が受理し、この仕様が拒否します。
この規則は、この仕様だけが受理する pie の入力を加えません。
閉じない共通のディレクティブを両者が拒否するときは印を付けません。
[fixture: pie/div-directive-in-header] [fixture: pie/div-directive-in-showdata]
[fixture: pie/div-directive-in-title-keyword]
[fixture: pie/div-directive-in-acctitle-keyword]
[fixture: pie/div-directive-in-accdescr-keyword]
[fixture: pie/div-directive-number]
[fixture: pie/div-review-directive-number-sign]
[fixture: pie/div-review-directive-number-decimal]
[fixture: pie/review-directive-acc-title-colon]
[fixture: pie/review-directive-acc-descr-block-opener]
[fixture: pie/directive-label-middle] [fixture: pie/directive-title-middle]
[fixture: pie/lex-hidden-eof-extra-lf]
[fixture: pie/review-directive-open-inside-header]
[fixture: pie/div-directive-in-accdescr-block-keyword]

### Gitgraph

隠れた完全な形には GitgraphIgnoredText の所有者があり、
共通の trivia は文字列や共通のリテラルを分割できます。
キーワードの語、方向・type の語、整数、裸の参照の内部のディレクティブは、
綴りをつなぎ直さずに別の完全な構成要素として持てません。
直接の単位の規則により、Mermaid が受理する入力を理由 2 の差異として拒否します。
この仕様だけが受理する逆方向の入力はありません。
option の語とコロンの間や引用文字列の中は許し、
両方が拒否する接着した境界の例には印を付けません。
[fixture: gitgraph/div-directive-in-header]
[fixture: gitgraph/div-directive-in-commit]
[fixture: gitgraph/div-directive-in-option-keyword]
[fixture: gitgraph/div-directive-in-type]
[fixture: gitgraph/div-directive-in-number]
[fixture: gitgraph/div-directive-in-reference]
[fixture: gitgraph/lex-option-global-before-colon]
[fixture: gitgraph/directive-in-string]
[fixture: gitgraph/directive-after-header-glued]

### Info

共通の Directive レコードは大域的なディレクティブを、
InfoIgnoredText は完全な隠れた形を持ちます。
どちらも固定キーワードの内部の独立した構成要素にはなりません。
直接の原子的な規則は info、showInfo、title、accTitle、
accDescr 内のディレクティブを拒否しますが、Mermaid は断片を結合します。
これは理由 2 で、逆方向の受理は加えません。
完全な構成要素の境界や値・隠れたテキストでは許し、
結合後も不正な入力は両方が拒否します。
[fixture: info/div-directive-header-middle]
[fixture: info/div-directive-flag-middle]
[fixture: info/div-directive-title-middle]
[fixture: info/div-directive-acctitle-middle]
[fixture: info/div-directive-accdescr-middle]
[fixture: info/div-directive-accdescr-line-keyword]
[fixture: info/directive-acctitle-colon] [fixture: info/directive-block-brace]
[fixture: info/lex-yaml-opener-global]
[fixture: info/lex-directive-rejected-tail]

### Packet

共有 Directive がテキストを保持するが、
固定語と整数の内部に構成要素の境界はない。
理由 2 の直接の単位規則で分割形を拒否する。
完全な keyword/colon・keyword/brace の境界と、
値のテキストは差異のない対照である。 [fixture: packet/directive-header-middle]
[fixture: packet/directive-beta-middle] [fixture: packet/directive-title-middle]
[fixture: packet/directive-acctitle-middle]
[fixture: packet/directive-accdescr-middle]
[fixture: packet/directive-number-middle]
[fixture: packet/directive-acctitle-colon]
[fixture: packet/directive-accdescr-brace]
[fixture: packet/directive-label-middle]

### Architecture

architecture は、括弧と完全な icon 名の間、
modifier の brace と完全な group の語の間に共通 directive を許す。
id、icon 名、keyword、double-dash の線の内部では不可分な構成要素を切り、
ignored-text の位置を持てない。
mermaid は断片をつなぐが、本仕様は拒否する。
text/string の値は directive を除いた原文を持てるため受理する。
宣言 id と後続 text をつなぐ未閉鎖 directive も同じ名前の境界規則に従う。
[fixture: architecture/directive-icon-delimiters]
[fixture: architecture/directive-group-delimiters]
[fixture: architecture/div-directive-name]
[fixture: architecture/div-directive-icon-name]
[fixture: architecture/div-directive-group-word]
[fixture: architecture/div-directive-line]
[fixture: architecture/directive-fields]
[fixture: architecture/end-group-unclosed-directive]
[fixture: architecture/end-junction-unclosed-directive]

### Radar

radar は id・数・固定語の内部の global directive を拒否します。
true/false・circle/polygon・common keyword の内部も含みます。
まず木に持てるかを考えると、
native hidden form 全体は RadarIgnoredText に保てますが、
不可分な atom の内部には node の置き場所がありません。
残る差異は、前処理で atom の断片を連結せず、境界の直接の規則に従うものです。
[fixture: radar/directive-header-middle] [fixture: radar/directive-axis-name]
[fixture: radar/directive-curve-name] [fixture: radar/directive-number]
[fixture: radar/directive-reference] [fixture: radar/div-directive-boolean-atom]
[fixture: radar/div-directive-graticule-atom]
[fixture: radar/div-directive-common-keyword]

作者の完全な部品の境界には global directive を許します。
見出しの語と colon、common keyword と colon/brace、label の bracket と string、
entry の名前・省略可能な colon・数、member と comma の間が該当します。
除去後にも正しい字句境界を要求します。
native な形は名前つき gap/body に、
global directive は共有 root のリストに保ちます。
string・common 値・native な形の内容にも、 atom を割らずに置けます。
[fixture: radar/gram-directive-composite-header]
[fixture: radar/directive-common-colon]
[fixture: radar/common-block-directive-gap] [fixture: radar/directive-common]
[fixture: radar/directive-label-before-open]
[fixture: radar/directive-label-after-open]
[fixture: radar/directive-label-before-close]
[fixture: radar/directive-entry-before-colon]
[fixture: radar/directive-entry-before-value]
[fixture: radar/directive-list-comma] [fixture: radar/directive-curve-brace]
[fixture: radar/directive-entry-no-colon-joins]
[fixture: radar/directive-header-glued] [fixture: radar/directive-header-space]
[fixture: radar/directive-option-space-control]
[fixture: radar/directive-title-space-control]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/lex-hidden-yaml-opener-global]
[fixture: radar/lex-hidden-yaml-closer-global]
[fixture: radar/lex-hidden-native-opener-global]
[fixture: radar/lex-hidden-native-closer-global]

### Treemap

treemap は複合 terminal の中でも、書かれた構成要素を区別します。
原子である見出し、classDef・共通の keyword、class 名、selector、数、
`:::` は内部の directive を一つの原子の綴りとして持てず、
ignored text を足してもその原子を復元できません。
string・共通 text・class style 全体は directive をまたぐ値を持てるため、
そこに拒否を加えません。
必須の空白を残す完全な構成要素の間では directive を許します。
Mermaid の directive 除去後の読みと印付きの受理 fixture が差異を示し、
空白不足や不正な接尾辞の対照は両方で拒否します。
[fixture: treemap/directive-header-middle]
[fixture: treemap/div-directive-beta-header]
[fixture: treemap/directive-class-keyword]
[fixture: treemap/directive-class-name]
[fixture: treemap/directive-common-keyword] [fixture: treemap/directive-number]
[fixture: treemap/directive-selector]
[fixture: treemap/div-directive-style-marker] [fixture: treemap/directive-style]
[fixture: treemap/directive-name-middle]
[fixture: treemap/directive-common-colon]
[fixture: treemap/directive-class-keyword-name-gap]
[fixture: treemap/directive-class-keyword-missing-space]
[fixture: treemap/directive-invalid-number-suffix-control]

### Railroad

[railroad の字句規則](../diagrams/railroad.ja.md#共通-directive-とセミコロンの境界)
は、見出し、名前、IR constructor、metadata keyword、十進 count、
複合の代入記号をそれぞれ書かれた atom とします。
その内部の共通 directive は atom を分断し、拒否します。
metadata の keyword、colon/brace、値は別の部品です。
ABNF repeat は bound と star を別部品とし、
percent numeric value は text 単位とします。
完成した repeat の部品の間や string/text の値の内部の directive は許します。
[fixture: railroad/ir-div-directive-header]
[fixture: railroad/ir-directive-keyword-glued]
[fixture: railroad/ir-directive-name]
[fixture: railroad/ir-directive-description-keyword]
[fixture: railroad/ebnf-div-directive-assignment]
[fixture: railroad/peg-directive-operator]
[fixture: railroad/abnf-directive-repeat-number]
[fixture: railroad/abnf-directive-repeat]
[fixture: railroad/abnf-directive-repeat-star]
[fixture: railroad/abnf-directive-numval-prefix]
[fixture: railroad/abnf-directive-numval-digits]

木は native YAML と nonword の native directive を RailroadIgnoredText、
通常の comment を Comment に保てるので、それらの入力は受理します。
分断した atom の source も共有 Directive record に残せますが、
式や ignored-text の兄弟ノードでは、それを 1 個の書かれた単位として表せません。
第 2 の問いの答えは理由 2 です。
Mermaid の削除して接合する順序の代わりに、直接の境界規則を使います。
新しい差異の識別子は作りません。 [fixture: railroad/ir-native-ownership]
[fixture: railroad/ebnf-native-ownership]
[fixture: railroad/abnf-native-ownership]
[fixture: railroad/peg-native-ownership]
[fixture: railroad/ir-directive-keyword-glued]

### Wardley

global directive は共有 Directive に持ち、構文が text を許す所の残りの原文は、
WardleyIdentifier、StringLiteral、WardleyLiteral、
WardleyIgnoredText に保持できます。
固定語、数、ID 形の名前、不可分の arrow/port/marker には、
作者の内部 gap がありません。
原文を保存できても断片を接合するには異なる字句規則が要るため、
既存の理由 2 の直接の境界規則でその分割を拒否します。
[fixture: wardley/directive-keyword-middle]
[fixture: wardley/directive-header-inside]
[fixture: wardley/directive-id-inside]
[fixture: wardley/directive-strategy-inside]
[fixture: wardley/directive-arrow-inside]
[fixture: wardley/directive-port-inside]
[fixture: wardley/directive-flow-marker-inside]
[fixture: wardley/directive-number]

座標・符号つき offset・括弧つき装飾の作者の部品の間は境界です。
label つき flow にも plus・引用した label・終端 marker があります。
global directive は完全な部品の間、文字列や空白を含む名の text、
native hidden の記号内に置けます。
複合 flow の中へ通常の padding や native hidden を許す規則ではありません。
Mermaid が座標や装飾全体を一つの terminal で読むことだけを理由に、
不可分にはしません。 [fixture: wardley/directive-coordinate-parts]
[fixture: wardley/directive-offset-sign]
[fixture: wardley/directive-strategy-parts]
[fixture: wardley/directive-parenthesized-inertia-parts]
[fixture: wardley/directive-flow-before-label]
[fixture: wardley/directive-flow-after-label]
[fixture: wardley/directive-name-inside]
[fixture: wardley/directive-native-opener-split]
[fixture: wardley/lex-link-native-flow-components]

### Cynefin

共有の directive のレコードにソースを持てても、固定の見出し、領域、
共通の語や分割しない矢印には内部の作者の gap が無い。
その atom 内の共通 directive を拒否する。
完全な部品の境目と文字の内部は許す。
native hidden な形はすでに node を持ち、差異を要しない。
[fixture: cynefin/directive-header-inside]
[fixture: cynefin/directive-domain-inside]
[fixture: cynefin/directive-arrow-inside]
[fixture: cynefin/directive-common-keyword]
[fixture: cynefin/directive-title-inside]
[fixture: cynefin/directive-block-inside]
[fixture: cynefin/directive-clear-inside]
[fixture: cynefin/directive-transition-parts]
[fixture: cynefin/directive-description-brace]
[fixture: cynefin/directive-native-yaml-components]
[fixture: cynefin/directive-native-directive-components]
[fixture: cynefin/directive-every-field]

[pin の文法](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30)
と、
[公開の adapter](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19)
は、共通の前処理と検出の結果を読みます。
[Cynefin の構文](../diagrams/cynefin.ja.md)に直接の規則を定め、
[木](../ast/cynefin.ja.md)に書かれた形を保ちます。
[fixture: cynefin/db-all-fields]

### eventmodeling

eventmodeling では各見出し・文・共通文の keyword、entity/data type の語、
単一の identifier segment、frame-name の数字列、->>、[[、]] を atom とします。
除いた directive は Root.directives に持てても、
二つの atom の綴りを一つの書かれた単位として結合できません。
Mermaid は割れた atom を受理しますが、この仕様は既存の境界規則で拒否します。
type tag の backtick・型の語・本文、修飾名の dot・segment、
参照の delimiter・名前は別の部品なので、
残る字句の text が有効なら部品の境目を許します。
native comment の mark と無視さ れる fence は全体を Comment/IgnoredText に持て、
hidden であるだけでは拒否しませ ん。
[fixture: eventmodeling/directive-header-inside]
[fixture: eventmodeling/directive-id-inside]
[fixture: eventmodeling/directive-number-inside]
[fixture: eventmodeling/directive-arrow-inside]
[fixture: eventmodeling/directive-reference-inside]
[fixture: eventmodeling/directive-reference-close-inside]
[fixture: eventmodeling/directive-json-inside]
[fixture: eventmodeling/directive-qualified]
[fixture: eventmodeling/directive-reference]
[fixture: eventmodeling/directive-tag]
[fixture: eventmodeling/lex-hidden-yaml-fence-directive]
[fixture: eventmodeling/comment-mark-directive]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70)
が単位を、 [図の構文](../diagrams/eventmodeling.ja.md)が直接の境目を定義します。

### Treeview

treeview は、正確な見出し、共通 keyword、語 `icon`、`:::`、`##`、class 名、
icon 参照全体の内側の directive を拒否します。
icon 参照は colon も含みます。
除かれる字は共有 Directive に保持できますが、
その両側で原子の綴りを結ぶ読みは直接の境目の規則に反します。
bare 名などの text/string の内側は断片を持て、完成部品の間も許します。
branch と各 dash は別の部品なので、その間の directive も許します。
[treeView.langium](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/parser/src/language/treeView/treeView.langium#L15-L64)
に基づく境目を、 [図の構文](../diagrams/treeview.ja.md) が定めます。
[fixture: treeview/directive-header-inside]
[fixture: treeview/directive-class-inside]
[fixture: treeview/directive-description-inside]
[fixture: treeview/directive-class-value-inside]
[fixture: treeview/directive-icon-value-inside]
[fixture: treeview/icon-pack-name-directive]
[fixture: treeview/directive-bare-middle]
[fixture: treeview/directive-class-value-parts]
[fixture: treeview/directive-icon-parts-parts]
[fixture: treeview/icon-name-close-directive]
[fixture: treeview/box-branch-directive-parts]
[fixture: treeview/box-dash-directive-inside]

## mermaid.js の文書と issue

- [ディレクティブ](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/config/directives.md)
  の文書は、どのディレクティブもそれだけの行に示し、
  トークンの中のディレクティブについては何も書いていません。
- mermaid.js のテストは、どのディレクティブもそれだけの行に置いています。
  固定した版の 287 の `*.spec.ts` と `*.spec.js` のファイルにある、
  37 の `%%{` のうち、34 はテストの入力にあり、どれも、字下げの後の、
  入力のその行の最初のものです。
  残りの 3 つは

[`agentflow-comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/agentflow/parser/agentflow-comments.spec.ts)
のコードのコメントにあります。
テストの入力は、

[`utils.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/utils.spec.ts)、

[`mermaidAPI.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/mermaidAPI.spec.ts)、

[`comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagram-api/comments.spec.ts)、

[`config.appearance.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/config.appearance.spec.ts)、

[`dagre/index.spec.js`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.spec.js)、

[`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)、

[`radar.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/radar/radar.spec.ts)、

[`exampleConfig.spec.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/.vitepress/theme/exampleConfig.spec.ts)
にあります。
mermaid.js の flowchart のパーサーのテストには、
ディレクティブが 1 つもありません。

- 固定した版の

[C4 の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/c4.md#L148-L157)
は呼び出しと名前付き引数の例を示し、
見出しや呼び出し語の内部のディレクティブを説明していません。
`mermaid-js/mermaid` の issue と pull request を、
2026-10-21 に `C4 directive`、 `C4 directive in:title,body`、
`C4 directive keyword in:title,body`、
`"Add directive support" in:title` で検索し、
この形式についての報告は見つかりませんでした。
[PR #4759](https://github.com/mermaid-js/mermaid/pull/4759)
は全図種の解析前にディレクティブ、フロントマター、
コメントを除く前処理を導入しています。

- ピン留めした

[venn の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/venn.md)
は完全なキーワードと名前を示し、その内部のディレクティブは示していません。
2026-10-21 に `mermaid-js/mermaid` の issue と PR を
`venn directive in:title,body` で検索しましたが、 venn のキーワード、名前、
数の内部のディレクティブに関する報告は見つかりませんでした。

- ピン留めした

[Ishikawa の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
は完全な `ishikawa-beta` の見出しと字下げした節点のテキストを示しますが、
見出しの内部の directive は示していません。
[issue #4784](https://github.com/mermaid-js/mermaid/issues/4784) は mindmap
と同様の構文を提案しています。
2026-10-21 に `mermaid-js/mermaid` の issue と PR を `ishikawa` と
`ishikawa directive in:title,body` で検索し、
Ishikawa の見出しを分割する directive の報告は見つかりませんでした。

- pin の
  [usecase 文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  は native metadata と CSS を説明します。
  2026-10-22 に mermaid-js/mermaid の issue と PR を `usecase directive`
  で検索し、この受理挙動を保守者が欠陥と判断したと示す報告は、
  調べた結果にはありませんでした。
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048) は Type:
  Enhancement で、2026-08-14 にマージ済みで閉じています。
  Chevrotain parser、モデル検証、JSON の表を導入します。
  この差異は共有の直接の規則に従うもので、
  bug ラベルを文法変更の承認とは読みません。

- pie の pin した
  [構文文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/pie.md)
  はヘッダー、区分、タイトルを述べ、その綴りの中のディレクティブは述べません。
  2024-02-11 にマージされた
  [PR #4751](https://github.com/mermaid-js/mermaid/pull/4751) は Langium
  の文法と、読み飛ばす YAML、ディレクティブ、コメントを導入しました。
  2026-10-23 に `mermaid-js/mermaid` の issue と PR を `pie`、`pie directive`、
  `pie Langium` で検索しましたが、
  この原子の中のディレクティブを欠陥とする保守者の判断は見つかりませんでした。
  境界規則は直接の構文上の選択で、そのような判断ではありません。

gitgraph の
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/gitgraph.md)
は、見出しと各コマンドを説明します。
2026-10-23 に issue・PR を `gitGraph`、`gitGraph directive`、 `gitGraph YAML`、
`gitGraph semicolon`、`gitGraph keyword`、 `gitGraph duplicate`、
`gitGraph cherry-pick` で検索しました。
確認した結果には、この共通の境界を決定するものはありませんでした。
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) は終了済みで Status:
Approved が付き、
merge 済みの [#6707](https://github.com/mermaid-js/mermaid/pull/6707) は重複 ID
の警告を加えます。
これらから追加の差異は作りません。

- info には専用の構文ページがなく、
  pin した
  [構文の参照](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/intro/syntax-reference.md)
  は図種の宣言と percent コメントを説明します。
  2026-10-23 に `info showInfo`、`info directive`、`info semicolon`、
  `info accTitle` で issue と PR を検索しました。
  [#7601](https://github.com/mermaid-js/mermaid/issues/7601) は info/showInfo
  の描画を報告し、 open、Type: Bug / Error、Status: Triage でした。
  検査した結果には、この構文の拒否を決める info 固有の保守者の判断はありません。
  この節は既存の直接の規則に従います。

- pin の
  [packet の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  は単一位置・範囲・相対 count を示します。
  この前処理の境界については定めていません。
  2026-10-25 に `packet bitsPerRow`、`packet fractional`、
  `packet maxPacketSize` で公式 repository の issue・PR を検索しましたが、
  ここでの差異に関する maintainer の判断を示す結果は見つかりませんでした。

- pinned の
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175)
  は見出し・宣言・辺を説明するが、この共通の前処理の境界を定義しない。
  2026-10-25 に公式の issue/PR を architecture group undefined、
  architecture quotes title、architecture reverse、architecture unclosed、
  architecture align で検索した。
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) は Open、
  Status: Approved で、外側の親 group の辺を扱う報告である。
  今回の共通境界に対する maintainer の判断とはしない。

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/radar.md#L66-L166)
  は軸・曲線・option を説明します。
  2026-10-25 に公式の issue/PR を radar directive、radar semicolon、
  radar entries で調べましたが、
  上記の境界を不具合とする判断は見つかりませんでした。
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) は閉じられた
  Status: Approved の文書報告です。
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) は、
  文書例の comma の修正で、
  末尾 comma の文法上の対応を追加したものではありません。

- Treemap: pin した
  [treemap の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/treemap.md#L24-L115)
  は引用した row・字下げ・class 定義を説明し、
  この共通の前処理の境界は定めていません。
  2026-10-25 に公式 repository の issue・PR を `treemap directive`
  で検索しました。
  調べた結果に、この差異を maintainer が判断した根拠は見つかりませんでした。
  [#6590](https://github.com/mermaid-js/mermaid/pull/6590) は treemap を導入し、
  2025-06-27 に merge された PR で、この境界を判断したものではありません。

- Railroad:
  [pin した構文の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/railroad.md#L1-L280)
  は 4 記法、 EBNF の例外、ABNF のセミコロンの comment、
  PEG の predicate を説明します。
  native の残る YAML と frontmatter を跨ぐ HTML の引用符の文脈は定義しません。
  2026-10-26 に公式 repository の issue と PR を railroad frontmatter、
  railroad directive、railroad semicolon、railroad comment で検索しました。
  [#7979](https://github.com/mermaid-js/mermaid/issues/7979) は demo
  の見出し名の報告（closed、 Triage）、
  [#6620](https://github.com/mermaid-js/mermaid/issues/6620) は ABNF
  の図種の提案（open、 Discussion Needed）です。
  どちらも、これらの前処理の境界について、
  保守者が defect と判断した事実ではありません。
  この差異はその判断でなく既存の共通規則に従います。
  調べた結果だけで、ほかに関連する issue がないとは断定しません。

- Wardley: pin した
  [構文の文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/wardley.md#L1-L461)
  は座標・装飾・flow を示しますが、この共通の境界を定義しません。
  2026-10-26 に公式 repository の issue/PR を wardley directive、
  wardley semicolon、wardley flow で検索しました。
  [#7642](https://github.com/mermaid-js/mermaid/pull/7642) は hyphen の名、
  [#7726](https://github.com/mermaid-js/mermaid/pull/7726) は不要な sanitization
  の修正で、いずれも pin に反映済みです。
  [#8379](https://github.com/mermaid-js/mermaid/pull/8379) は設定保持に関する
  open PR でした。
  確認した結果はこの境界を不具合と認める判断を示さず、
  既存の直接の規則を適用します。
  検索の網羅性は主張しません。
- Cynefin の
  [pin の構文文書](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/cynefin.md#L21-L111)
  は固定の領域、引用符つきの項目、ラベルつきの遷移を説明し、
  [注記](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/cynefin.md#L203-L210)
  は自己遷移を無視すると述べます。
  [PR #7535](https://github.com/mermaid-js/mermaid/pull/7535) は図を加えて merge
  されました。
  2026-10-26 に cynefin parser、cynefin directive、cynefin semicolon、
  cynefin frontmatter で検索し、
  この境目について調べた範囲で maintainer の判断は見つかりませんでした。
  [Issue #7921](https://github.com/mermaid-js/mermaid/issues/7921) は open、
  Status: Triage で、framework の名前と描画の変更を求めるもので、
  この字句の規則の判断ではありません。

### eventmodeling

pin した
[eventmodeling.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/eventmodeling.md#L37-L336)
は frame、 data、tag を説明しますが、共有の前処理の境目を定義しません。
2026-10-26 に公式 issue と PR を eventmodeling title、eventmodeling parser、
event modeling data、eventmodeling accTitle、
eventmodeling validator で検索しました。
2026-04-16 に merged となった
[PR #7588](https://github.com/mermaid-js/mermaid/pull/7588) は validator
の登録を追加し、この境目に関する保守者の判断ではありません。
確認した結果にはその判断はなく、既存の直接の規則を適用します。
網羅的な検索だとはしません。

### Treeview

固定版の
[treeView.md](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/treeView.md#L1-L277)
は字下げ・引用名・注釈・罫線を説明します。
この共通の境目を定義してはいません。
2026-10-26 に公式 issue/PR を `treeView quoted`、`treeView indentation`、
`treeView box`、 `treeView quotes`、`treeView whitespace`、
`treeView accDescr` で検索しました。
[PR #7721](https://github.com/mermaid-js/mermaid/pull/7721) は罫線を追加した
merged の PR、
[Issue #8014](https://github.com/mermaid-js/mermaid/issues/8014) は header
省略を提案する open の Enhancement/Triage です。
調べた結果はこの共通の境目を defect と認める maintainer の判断を示しません。
既存の直接規則を適用するもので、網羅的な検索という主張ではありません。

# directive-as-token-boundary

英語版: [directive-as-token-boundary.md](./directive-as-token-boundary.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

ディレクティブは、`%%{init: {}}%%` のような、`%%{` と名前で、
その後に引数が続くことがあり、ふつうは `}%%` で閉じます。
それは図に設定を与えます
（[ディレクティブ](../common.ja.md#ディレクティブ) を参照）。
ふつうは、ヘッダーの前の、それだけの行に書きます。

```mmd
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

[fixture: common/directive-init-theme]

mermaid.js は、図を読む前に、
どこにあってもすべてのディレクティブをテキストから除き、
その前と後のテキストをつなぎます。
この仕様も同じに読みます
（
[ディレクティブはトークンの境界](../common.ja.md#ディレクティブはトークンの境界)
を参照）。
例外が 1 つあり、この文書はそれについてのものです。
名前、キーワード
（sequence 図のメッセージの `wrap:` のような折り返しの接頭辞を含む）、
`:::` のような区切り記号、矢印、数の中のディレクティブです。
ここでの名前は、空白を含みうるかどうかにかかわらず、
図の文書が名前の単位と数えるものです。
U+00A0 を含みうる ER の実体の名前も、gantt の click の id も、その 1 つです。
sequence 図の参加者の id、クラスの名前、
`~` を使って書いた ER の属性の語、gantt のタスクの説明、
要求図の引用符なしの名前のように、
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
[fixture: kanban/header-directive-inside]
[fixture: kanban/div-directive-opener] [fixture: kanban/div-directive-closer]
[fixture: kanban/div-directive-icon-marker]
[fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker]

ノード本文、形の本文、icon 本文、class 本文、文字列、データ本文には、
ディレクティブを置けます。
[fixture: kanban/db-grid-directive-item-id]
[fixture: kanban/db-grid-directive-item-label-bare]
[fixture: kanban/db-grid-directive-item-icon]
[fixture: kanban/db-grid-directive-item-class]
[fixture: kanban/lex-label-directive-line]
[fixture: kanban/db-metadata-directive]

完全なデータブロックの間にはディレクティブを置けます
（[単位の中のディレクティブ](../diagrams/kanban.ja.md#単位の中のディレクティブ)
を参照）。
[fixture: kanban/db-metadata-adjacent-directive]

C4 では見出し語、呼び出し語、`accTitle`、`accDescr` の内部の、
ディレクティブを拒否し、mermaid.js は前後をつなぎます。
[fixture: c4/lex-directive-keyword] [fixture: c4/div-directive-header]
[fixture: c4/div-acc-title-directive]
[fixture: c4/div-acc-block-marker-directive]

裸の引数と名前付きキーはテキスト単位なので、
引用引数やタイトル・説明のテキストと同様に、
内部にディレクティブを置けます。
[fixture: c4/lex-directive-bare-alias] [fixture: c4/lex-directive-named-key]
[fixture: c4/lex-directive-quoted] [fixture: c4/lex-title-directive-value]

名前付き値の等号と開き引用符は別の区切りなので、
その間のディレクティブを許します。
[fixture: c4/lex-directive-named-equals-quote]

venn では、
見出し、文のキーワード、名前、size、数値の text id、
裸の style 値の識別子か数の中のディレクティブをここでは拒否します。
[fixture: venn/header-directive-inside] [fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value]
[fixture: venn/div-directive-union-target]
[fixture: venn/div-directive-text-id]
[fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]
[fixture: venn/lex-unterminated-directive-next-line]
[fixture: venn/lex-unterminated-colon-directive-next-line]

mermaid.js はその前後を連結します。
[fixture: venn/header-directive-inside] [fixture: venn/lex-directive-in-set]
[fixture: venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text]
[fixture: venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title]
[fixture: venn/db-grid-directive-identifier-bare]
[fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key]
[fixture: venn/db-grid-directive-text-number]
[fixture: venn/db-grid-directive-style-value]
[fixture: venn/div-directive-union-target]
[fixture: venn/div-directive-text-id]
[fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word]
[fixture: venn/div-directive-style-value-number]
[fixture: venn/lex-unterminated-directive-next-line]
[fixture: venn/lex-unterminated-colon-directive-next-line]

venn の文字列、ラベルの内容、タイトルの内容、色全体は、
ディレクティブを含められます。
[fixture: venn/lex-identifier-directive-middle]
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

Ishikawa で、選ばれた `ishikawa` や `ishikawa-beta` のキーワードを
分断する directive は拒否します。
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

[fixture: sequence/div-directive-in-keyword]
[fixture: flowchart/div-directive-in-style-separator]
[fixture: flowchart/div-directive-in-id]
[fixture: flowchart/div-directive-in-arrow-length]
[fixture: sequence/div-directive-in-number]
[fixture: common/directive-in-string]
[fixture: common/directive-in-label-text]

つまり mermaid.js は、どの入力も、ディレクティブを除いたテキストとして読みます。
この仕様もそうしますが、
名前、キーワード、区切り記号、矢印、数は、
中にディレクティブを持てません。
そのような入力は拒否されます。
ディレクティブを除いたテキストを mermaid.js が拒否するときは、
どちらも入力を拒否します。
`flow%%{init: {}}%%chart LR` の後に行 `A-->` が続くものは、
mermaid.js では flowchart の文法が拒否し、
この仕様では、ディレクティブがヘッダーのキーワードの中にあるので拒否します。
[fixture: common/directive-splits-header-keyword]

同じヘッダーの後に行 `A-->B` が続けば、mermaid.js では flowchart になり、
この仕様では拒否されます。
[fixture: common/directive-in-header-keyword]

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
テキスト全体からすべてのディレクティブを除きます
（
[`processDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/preprocess.ts#L33-L45)、
[`removeDirectives`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L200-L202)）。
各図種の字句解析器は、その後に残ったテキストを読み、
ディレクティブがどこにあったかを知りません。
キーワードや矢印の途中にディレクティブを挟めるのは、
この処理の順から生じます。

## この仕様の規則と、その理由

この仕様では、ディレクティブはトークンの境界です。
その前と後のテキストは、mermaid.js と同じく、
つながっているものとして読まれるので、
テキスト、文字列、空白を含みうる名前はディレクティブを持てます。
名前、キーワード、区切り記号、矢印、数は、そのテキスト全体を表し、
その中のディレクティブは入力を拒否にします。

文字列は、もともと断片に切られることがあります。
コメント領域が文字列の中にあることがあり、
そのとき文字列は、領域の前と後の断片として読まれます。
文字列の中のディレクティブも同じように持たれ、
文字列の値は、コメント領域と同じく、それを除きます
（[ノード](../ast.ja.md#ノード) を参照）。
テキストは散文で、空白を含みうる名前も同じです。
その中のディレクティブも同じように持たれます。
この仕様は、名前、数、矢印、キーワード、区切り記号を、
ディレクティブで切りません。
どれも、そのテキスト全体として読まれます。
mermaid.js がその中のディレクティブを読めるのは、
読む前の段階としてディレクティブを除くからで、
仕様が構文の規則として述べるものではありません。
これは既知の差異の 2 つ目の理由に当たります
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。

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
理由 2 で拒否します。この規則による逆方向の受理はありません。
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

## mermaid.js の文書と issue

- [ディレクティブ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md)
  の文書は、どのディレクティブもそれだけの行に示し、
  トークンの中のディレクティブについては何も書いていません。
- mermaid.js のテストは、どのディレクティブもそれだけの行に置いています。
  固定した版の 287 の `*.spec.ts` と `*.spec.js` のファイルにある、
  37 の `%%{` のうち、34 はテストの入力にあり、
  どれも、字下げの後の、入力のその行の最初のものです。
  残りの 3 つは

  [`agentflow-comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow-comments.spec.ts)
  のコードのコメントにあります。
  テストの入力は、

  [`utils.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.spec.ts)、

  [`mermaidAPI.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.spec.ts)、

  [`comments.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.spec.ts)、

  [`config.appearance.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/config.appearance.spec.ts)、

  [`dagre/index.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/rendering-util/layout-algorithms/dagre/index.spec.js)、

  [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)、

  [`radar.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/radar.spec.ts)、

  [`exampleConfig.spec.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/.vitepress/theme/exampleConfig.spec.ts)
  にあります。
  mermaid.js の flowchart のパーサーのテストには、
  ディレクティブが 1 つもありません。

- 固定した版の

  [C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L148-L157)
  は呼び出しと名前付き引数の例を示し、
  見出しや呼び出し語の内部のディレクティブを説明していません。
  `mermaid-js/mermaid` の issue と pull request を、
  2026-10-21 に `C4 directive`、
  `C4 directive in:title,body`、
  `C4 directive keyword in:title,body`、
  `"Add directive support" in:title` で検索し、
  この形式についての報告は見つかりませんでした。
  [PR #4759](https://github.com/mermaid-js/mermaid/pull/4759)
  は全図種の解析前にディレクティブ、
  フロントマター、
  コメントを除く前処理を導入しています。

- ピン留めした

  [venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  は完全なキーワードと名前を示し、
  その内部のディレクティブは示していません。
  2026-10-21 に `mermaid-js/mermaid` の issue と PR を
  `venn directive in:title,body` で検索しましたが、
  venn のキーワード、名前、数の内部のディレクティブに関する報告は
  見つかりませんでした。

- ピン留めした

  [Ishikawa の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
  は完全な `ishikawa-beta` の見出しと字下げした節点のテキストを示しますが、
  見出しの内部の directive は示していません。
  [issue #4784](https://github.com/mermaid-js/mermaid/issues/4784)
  は mindmap と同様の構文を提案しています。
  2026-10-21 に `mermaid-js/mermaid` の issue と PR を
  `ishikawa` と `ishikawa directive in:title,body` で検索し、
  Ishikawa の見出しを分割する directive の報告は見つかりませんでした。

- pin の
  [usecase 文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  は native metadata と CSS を説明します。
  2026-10-22 に mermaid-js/mermaid の issue と PR を
  `usecase directive` で検索し、
  この受理挙動を保守者が欠陥と判断したと示す報告は、
  調べた結果にはありませんでした。
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048) は
  Type: Enhancement で、2026-08-14 にマージ済みで閉じています。
  Chevrotain parser、モデル検証、JSON の表を導入します。
  この差異は共有の直接の規則に従うもので、
  bug ラベルを文法変更の承認とは読みません。

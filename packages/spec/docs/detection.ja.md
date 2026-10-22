# 図種の検出

英語版: [detection.md](./detection.md)

図種を選ぶ検出器を、mermaid.js が試す順に並べます。
検出器がどこを見るかは、
common.ja.md の [図種の検出](./common.ja.md#図種の検出) で定めています。
ここでも同じ 2 つの言葉を使います。
**検出点**は、先頭のトリビアでないテキストの最初の位置、
**たどり着いた位置**は、検出点から、検出が飛ばす `%%` だけの行と
ディレクティブの先へ進んだ位置です。
検出器はたどり着いた位置からの図のテキストを見ます。
ただし `error` 疑似図種の検出器の条件は、検出点から述べます。
条件が最初に成り立った検出器が図種を選び、
その id が木の `diagramType` にもなります
（[ast.ja.md](./ast.ja.md#root) を参照）。
どの条件も成り立たなければ、入力は `UnknownDiagramError` で拒否されます。
[fixture: common/empty]

登録の順は
[`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L44-L126)
にあり、
各検出器は
[`diagrams/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams)
の下の各図のディレクトリにあります。

## 一覧の読み方

各検出器は、たどり着いた位置に**キーワード**を探します。

- **位置**は、キーワードがどこになければならないかです。
  - **先頭**: たどり着いた位置からの図のテキストが、キーワードで始まる。
  - **テキスト全体**: [図種の検出](./common.ja.md#図種の検出) にある `error`
    疑似図種の条件。
    検出点からの図のテキストからその条件が除くものを除いたものが
    キーワードであり（大文字小文字を区別しない）、テキストの終わりまで、
    空白と行終端しか続かない。
- **大文字小文字**は、キーワードをどう比べるかです。**区別する**か、
  [表記](./common.ja.md#表記) の意味で**区別しない**かです。
- **キーワードの後**は、キーワードの直後に何が来てよいかです。
  - **何が続いてもよい**: 検出器は、キーワードの後の文字に条件を付けません。
    たとえば `flowchartLR` は `flowchart` で始まります。
  - **語の文字以外か、終わり**: キーワードの後の文字が語の文字でないか、
    図のテキストがキーワードの後で終わる。
  - その他の項目は、続いてよい文字を挙げています。
- 空白、語の文字、文字は、[表記](./common.ja.md#表記) で定めたものです。

各図の文書は、ここの該当する項目を参照し、その図に固有のことだけを書き足します。

## 検出器

| #   | id              | キーワード                                                             | 位置         | 大文字小文字 | キーワードの後            |
| --- | --------------- | ---------------------------------------------------------------------- | ------------ | ------------ | ------------------------- |
| 1   | `error`         | `error`                                                                | テキスト全体 | 区別しない   | 何も続かない              |
| 2   | `---`           | `---`                                                                  | 先頭         | 区別する     | 何が続いてもよい          |
| 3   | `flowchart-elk` | `flowchart-elk`                                                        | 先頭         | 区別する     | 何が続いてもよい          |
| 4   | `mindmap`       | `mindmap`                                                              | 先頭         | 区別する     | 何が続いてもよい          |
| 5   | `architecture`  | `architecture`                                                         | 先頭         | 区別する     | 何が続いてもよい          |
| 6   | `agentflow`     | `agentflow-beta`                                                       | 先頭         | 区別する     | 語の文字以外か、終わり    |
| 7   | `c4`            | `C4Context`、`C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` | 先頭         | 区別する     | 何が続いてもよい          |
| 8   | `kanban`        | `kanban`                                                               | 先頭         | 区別する     | 何が続いてもよい          |
| 9   | `classDiagram`  | `classDiagram`                                                         | 先頭         | 区別する     | 何が続いてもよい          |
| 10  | `er`            | `erDiagram`                                                            | 先頭         | 区別する     | 何が続いてもよい          |
| 11  | `gantt`         | `gantt`                                                                | 先頭         | 区別する     | 何が続いてもよい          |
| 12  | `info`          | `info`                                                                 | 先頭         | 区別する     | 何が続いてもよい          |
| 13  | `pie`           | `pie`                                                                  | 先頭         | 区別する     | 何が続いてもよい          |
| 14  | `requirement`   | `requirement`                                                          | 先頭         | 区別する     | 何が続いてもよい          |
| 15  | `sequence`      | `sequenceDiagram`                                                      | 先頭         | 区別する     | 何が続いてもよい          |
| 16  | `swimlane`      | `swimlane-beta`                                                        | 先頭         | 区別する     | 語の文字以外か、終わり    |
| 17  | `flowchart-v2`  | `graph`、`flowchart`                                                   | 先頭         | 区別する     | 何が続いてもよい          |
| 18  | `timeline`      | `timeline`                                                             | 先頭         | 区別する     | 何が続いてもよい          |
| 19  | `gitGraph`      | `gitGraph`                                                             | 先頭         | 区別する     | 何が続いてもよい          |
| 20  | `stateDiagram`  | `stateDiagram`                                                         | 先頭         | 区別する     | 何が続いてもよい          |
| 21  | `journey`       | `journey`                                                              | 先頭         | 区別する     | 何が続いてもよい          |
| 22  | `quadrantChart` | `quadrantChart`                                                        | 先頭         | 区別する     | 何が続いてもよい          |
| 23  | `sankey`        | `sankey`                                                               | 先頭         | 区別する     | 何が続いてもよい          |
| 24  | `packet`        | `packet`                                                               | 先頭         | 区別する     | 何が続いてもよい          |
| 25  | `xychart`       | `xychart`                                                              | 先頭         | 区別する     | 何が続いてもよい          |
| 26  | `block`         | `block`                                                                | 先頭         | 区別する     | 何が続いてもよい          |
| 27  | `eventmodeling` | `eventmodeling`                                                        | 先頭         | 区別する     | 何が続いてもよい          |
| 28  | `treeView`      | `treeView-beta`                                                        | 先頭         | 区別する     | 何が続いてもよい          |
| 29  | `radar`         | `radar-beta`                                                           | 先頭         | 区別する     | 何が続いてもよい          |
| 30  | `ishikawa`      | `ishikawa`                                                             | 先頭         | 区別しない   | 語の文字以外か、終わり    |
| 31  | `treemap`       | `treemap`                                                              | 先頭         | 区別する     | 何が続いてもよい          |
| 32  | `railroad`      | `railroad-beta`                                                        | 先頭         | 区別しない   | 何が続いてもよい          |
| 33  | `railroadEbnf`  | `railroad-ebnf-beta`                                                   | 先頭         | 区別しない   | 何が続いてもよい          |
| 34  | `railroadAbnf`  | `railroad-abnf-beta`                                                   | 先頭         | 区別しない   | 何が続いてもよい          |
| 35  | `railroadPeg`   | `railroad-peg-beta`                                                    | 先頭         | 区別しない   | 何が続いてもよい          |
| 36  | `venn`          | `venn-beta`                                                            | 先頭         | 区別する     | 何が続いてもよい          |
| 37  | `wardley`       | `wardley-beta`                                                         | 先頭         | 区別しない   | 何が続いてもよい          |
| 38  | `cynefin`       | `cynefin-beta`                                                         | 先頭         | 区別する     | 空白、`:`、終わりのどれか |
| 39  | `usecase`       | `usecase-beta`                                                         | 先頭         | 区別する     | 空白か、終わり            |

項目 2 を除く各項目には、
mermaid.js がその id として受理する最小の入力があります。
図の文法が見出しの行だけを受理する場合はその行だけ、
そうでなければ見出しの行と最小の 1 文です。
[fixture: common/error-pseudo-diagram]
[fixture: common/detect-minimal-flowchart-elk]
[fixture: common/detect-minimal-mindmap]
[fixture: common/detect-minimal-architecture]
[fixture: common/detect-minimal-agentflow] [fixture: common/detect-minimal-c4]
[fixture: common/detect-minimal-kanban]
[fixture: common/detect-minimal-class-diagram]
[fixture: common/detect-minimal-er] [fixture: common/detect-minimal-gantt]
[fixture: common/detect-minimal-info] [fixture: common/detect-minimal-pie]
[fixture: common/detect-minimal-requirement]
[fixture: common/detect-minimal-sequence]
[fixture: common/detect-minimal-swimlane]
[fixture: common/detect-minimal-flowchart-v2]
[fixture: common/detect-minimal-timeline]
[fixture: common/detect-minimal-git-graph]
[fixture: common/detect-minimal-state-diagram]
[fixture: common/detect-minimal-journey]
[fixture: common/detect-minimal-quadrant-chart]
[fixture: common/detect-minimal-sankey]
[fixture: common/detect-minimal-packet]
[fixture: common/detect-minimal-xychart]
[fixture: common/detect-minimal-block]
[fixture: common/detect-minimal-eventmodeling]
[fixture: common/detect-minimal-tree-view]
[fixture: common/detect-minimal-radar]
[fixture: common/detect-minimal-ishikawa]
[fixture: common/detect-minimal-treemap]
[fixture: common/detect-minimal-railroad]
[fixture: common/detect-minimal-railroad-ebnf]
[fixture: common/detect-minimal-railroad-abnf]
[fixture: common/detect-minimal-railroad-peg]
[fixture: common/detect-minimal-venn] [fixture: common/detect-minimal-wardley]
[fixture: common/detect-minimal-cynefin]
[fixture: common/detect-minimal-usecase]

項目 7 では、他の 4 つのキーワードも先頭にあれば `c4` を選びます。
大文字小文字の違うキーワードは、比較が完全一致なので何も選びません。
後に語の文字が続くキーワードは、何が続いてもよいので `c4` として検出され、
その後 C4 の文法が拒否します。
別の語の後のキーワードは先頭にありません。
[fixture: common/detect-minimal-c4-container]
[fixture: common/detect-minimal-c4-component]
[fixture: common/detect-minimal-c4-dynamic]
[fixture: common/detect-minimal-c4-deployment]
[fixture: common/detect-c4-case] [fixture: common/detect-c4-word-after]
[fixture: common/detect-c4-keyword-after-word]

第 6 項の
[`afDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/afDetector.ts#L7-L11)
は、
小文字を区別する `agentflow-beta` の検出器であり、C4 より先です。
直後の ASCII の文字、数字、アンダースコアは検出を妨げます。
ハイフンと非 ASCII の文字は検出を通りますが、
agentflow の文法はこれらの接尾部の形を拒否します。
安定版の `agentflow` のヘッダーや大文字小文字の同一視はありません。
本文の C4 の語も検出を上書きしません。
[fixture: agentflow/header-only] [fixture: agentflow/header-without-beta]
[fixture: agentflow/header-upper] [fixture: agentflow/detect-letter-suffix]
[fixture: agentflow/detect-digit-suffix]
[fixture: agentflow/detect-underscore-suffix]
[fixture: agentflow/detect-hyphen-suffix]
[fixture: agentflow/detect-non-ascii-suffix]
[fixture: agentflow/lex-detect-c4-component-id]

項目 39 の
[`usecaseDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/usecaseDetector.ts#L1-L14)
は、正確な小文字の `usecase-beta` の後に空白かテキストの終わりを要求します。
コロン、ハイフン、英字、数字、underscore は検出を妨げます。
Unicode 空白は検出を通っても usecase 文法に失敗する場合があります。
C4 より後なので、本体に `c4-keyword-anywhere` を適用します。
[fixture: usecase/header-lf] [fixture: usecase/header-uppercase]
[fixture: usecase/header-letter-suffix]
[fixture: usecase/header-unicode-suffix] [fixture: usecase/header-semicolon]
[fixture: usecase/header-u2028-eof] [fixture: usecase/lex-header-emspace-eof]
[fixture: usecase/div-detect-c4-label]

## 注記

- **疑似図種**: 項目 1 と 2 は、
  すべての実際の図より前に登録されます
  （[`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L51-L83)）。
  `error` は受理され、Db の内容を持ちません。
  `---` は必ず拒否されるので、DiagramType ではありません。
  どちらも [common.ja.md](./common.ja.md#図種の検出) を参照してください。
  項目 1 で mermaid.js は、
  テキスト全体を Unicode の完全な小文字化の対応で小文字にします。
  ASCII の外の文字で、小文字が ASCII の英字になるのは U+212A だけで、
  これは `k` になります。
  `error` には `k` がないので、
  結果は [表記](./common.ja.md#表記)
  の意味で大文字小文字を区別しない比較と同じです。
  [fixture: common/error-pseudo-diagram] [fixture: common/error-uppercase]

- **大きな機能のときだけ登録される項目**: 項目 3〜5 は、
  mermaid.js が

  [`includeLargeFeatures`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L87)
  を付けてビルドされたときだけ登録されます。
  npm パッケージの既定の入口はそのようにビルドされているので、
  この仕様はこれらを含め、この位置に置きます。
  疑似図種の後で、他のすべての検出器より前です。
  項目 3 はレイアウトの設定も `elk` にしますが、これは描画にだけ影響します。

- **順序が効く**: 項目 3 は項目 17 より前にあるので、
  `flowchart-elk` は `flowchart` でも始まりますが、`flowchart-elk` を選びます。
  これ以外に条件が重なる組はありません。
- **mermaid.js の項目 7**: mermaid.js は項目 7 の条件を 5
  つの選択肢として書いていて、
  テキストの先頭に固定されているのは最初の `C4Context` だけです
  （[`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10)）。
  そこでは、`C4Container`、`C4Component`、`C4Dynamic`、
  `C4Deployment` をどこかに含むテキストは、
  ノードの ID やメッセージの本文に含む場合も、
  項目 1〜6 が先に一致しない限り C4 図になり、
  メッセージが `C4Container` の sequence 図は C4 のパーサーに渡され、
  拒否されます。
  この仕様はたどり着いた位置だけを見るので、
  そのようなテキストをヘッダーの図として読みます。
  既知の差異
  [`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.ja.md)
  です。
  `C4Context` は両者とも先頭にあるときだけ数えます。
  [fixture: common/detect-c4-anywhere]
  [fixture: common/detect-c4context-only-at-start]

- **何が続いてもよい**: ほとんどのキーワードでは、検出器は次の文字を見ません。
  `flowchartLR` は `flowchart-v2` として検出され、
  その後 flowchart の文法が拒否します。
  `graphTD` も同じです。
  [fixture: common/detect-no-boundary-flowchart]
  [fixture: common/detect-no-boundary-graph]

- **語の文字以外か、終わり**: 項目 6、16、30 では、
  キーワードの後に語の文字が続いてはいけません。
  `swimlane-betaX` は検出されず、他のどの検出器も一致しません。
  項目 30 の条件は `ishikawa` の直後に適用されるので、
  `ishikawa-beta` だけでなく `ishikawa-betaX` も検出され、
  `ishikawaX` は検出されません。
  [fixture: common/detect-boundary-swimlane]
  [fixture: common/detect-ishikawa-beta-suffix]
  [fixture: common/detect-ishikawa-word-after]

ASCII
の外の文字は語の文字ではありません（[表記](./common.ja.md#表記) を参照）。
`ishikawa` の後に U+017F や `é` が続くものは ishikawa
として検出されて受理され、
`swimlane-beta` の後に `é` が続くものは swimlane として検出され、
その文法が拒否します。
[fixture: common/detect-boundary-ishikawa-long-s]
[fixture: common/detect-boundary-ishikawa-e-acute]
[fixture: common/detect-boundary-swimlane-e-acute]

[Ishikawa の文法](./diagrams/ishikawa.ja.md#単位と文脈)は、
完全な beta の見出しと通常の見出しへの切り替えを区別します。
`ishikawa-beta-x` は `-x` から節点のテキストを始め、
`ishikawa-betaX` は `-betaX` から始めます。
[fixture: ishikawa/header-beta-dash-suffix]
[fixture: ishikawa/header-beta-letter-suffix]

- **キーワードの後の特定の文字**: 項目 38 は `cynefin-beta` の後の `:` を認め、
  項目 39 は `usecase-beta` の後の `:` を認めません。
  [fixture: common/detect-cynefin-colon] [fixture: common/detect-usecase-colon]

- **大文字小文字**: 項目 30、32〜35、37 は大文字小文字を区別しません。
  `ISHIKAWA` も `IsHiKaWa` も ishikawa を選びます。
  比べ方は [表記](./common.ja.md#表記) の大文字小文字を区別しない比べ方で、
  大文字が ASCII の英字になる ASCII の外の文字はそれ自身のままなので、
  `K` の代わりの U+212A や、`s` の代わりの U+017F は検出されません。
  それ以外の検出器は完全に一致するかで比べます。
  `sequencediagram` は検出されません。
  大文字のキーワードをその図の文法が受理するかどうかは、その文法によるので、
  その図の文書で述べます。
  [fixture: common/detect-case-insensitive-ishikawa]
  [fixture: common/detect-case-mixed-ishikawa]
  [fixture: common/detect-case-kelvin-sign] [fixture: common/detect-case-long-s]
  [fixture: common/detect-case-sensitive-sequence]

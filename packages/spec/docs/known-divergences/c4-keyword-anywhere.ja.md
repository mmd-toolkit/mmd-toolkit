# c4-keyword-anywhere

英語版: [c4-keyword-anywhere.md](./c4-keyword-anywhere.md)

図種: C4 より後に検出されるすべて。
この仕様と mermaid.js の [既知の差異](../known-divergences.ja.md) の 1 つです。

## 対象の構文

C4 図は、5 つのキーワード `C4Context`、`C4Container`、`C4Component`、
`C4Dynamic`、`C4Deployment` のどれかで始まります。
これらは C4 図の 5 つの種類の名前です（[detection.ja.md](../detection.ja.md) の項目 7）。

```mmd
C4Container
  Container(a, "A")
```

この例は `C4Container` で始まります。 [fixture: common/detect-minimal-c4-container]

mermaid.js の C4 の検出器は、`C4Context` をテキストの先頭に、
他の 4 つのキーワードを、検出に残るテキストのどこにでも探します。
この仕様は図種を図のテキストの最初の単位で決めるので（[図種の検出](../common.ja.md#図種の検出) を参照）、
5 つとも先頭にだけ探します。
差異は、ヘッダーが別の図のもので、
その後の検出に残るテキストに 4 つのキーワードのどれかを持つものです。
mermaid.js は mindmap の検出器を C4 のものより先に試すので、
マインドマップにはそうしたテキストはありません。
`C4Container` は、
どちらでもノードのテキストです。 [fixture: mindmap/lex-c4-keyword-as-node-text]

kanban ではノードの id、ラベル、データ本文の 4 つの語は、
kanban の位置で読みます。
mermaid.js は C4 を選び入力を拒否します。 [fixture: kanban/lex-c4-c4component-id]
[fixture: kanban/lex-c4-c4component-label]
[fixture: kanban/lex-c4-c4component-metadata]
[fixture: kanban/lex-c4-c4container-id]
[fixture: kanban/lex-c4-c4container-label]
[fixture: kanban/lex-c4-c4container-metadata]
[fixture: kanban/lex-c4-c4deployment-id]
[fixture: kanban/lex-c4-c4deployment-label]
[fixture: kanban/lex-c4-c4deployment-metadata]
[fixture: kanban/lex-c4-c4dynamic-id]
[fixture: kanban/lex-c4-c4dynamic-label]
[fixture: kanban/lex-c4-c4dynamic-metadata]

kanban のノード名 `C4Context` は両者で検出を変えません。 [fixture: kanban/lex-c4-c4context-id]

除かれるコメントとフロントマターの中の `C4Container` は、
両者で検出を変えません。 [fixture: kanban/lex-c4-c4container-comment]
[fixture: kanban/lex-c4-c4container-frontmatter]

venn では、裸か引用の set の名前、ラベル、裸か引用の style 値、
タイトルの中の `C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` を、
ここでは venn の位置で読みます。 [fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style]
[fixture: venn/lex-c4-c4container-title]
[fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4component-style]
[fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4dynamic-identifier]
[fixture: venn/lex-c4-c4dynamic-label]
[fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4dynamic-title]
[fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label]
[fixture: venn/lex-c4-c4deployment-style]
[fixture: venn/lex-c4-c4deployment-title]

mermaid.js は C4 を選び、
入力を拒否します。 [fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style]
[fixture: venn/lex-c4-c4container-title]
[fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4component-style]
[fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4dynamic-identifier]
[fixture: venn/lex-c4-c4dynamic-label]
[fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4dynamic-title]
[fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label]
[fixture: venn/lex-c4-c4deployment-style]
[fixture: venn/lex-c4-c4deployment-title]
[fixture: venn/div-c4-bare-identifier]
[fixture: venn/div-c4-bare-style-value]

venn の見出しより後の `C4Context` と、
除かれるコメントか frontmatter 内の C4 語は、
どちらの読みでも検出を変えません。 [fixture: venn/lex-c4-c4context-identifier]
[fixture: venn/lex-c4-c4context-label]
[fixture: venn/lex-c4-c4context-style]
[fixture: venn/lex-c4-c4context-title]
[fixture: venn/lex-c4-c4container-comment]
[fixture: venn/lex-c4-c4container-frontmatter]

Ishikawa の節点のテキスト内の `C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment` は、この仕様では Ishikawa のテキストです。
引用されたようなテキストや、より長い語の中でも同じです。
その語が検出するテキストに残ると、
mermaid.js は C4 を選んで拒否します。 [fixture: ishikawa/detect-c4-container-text]
[fixture: ishikawa/detect-c4-component-root]
[fixture: ishikawa/detect-c4-dynamic-quoted]
[fixture: ishikawa/detect-c4-deployment-suffix]

`C4Context`、frontmatter 内の C4 の語、
共通のコメントや directive として除かれる語は、
どちらの検出も変えません。 [fixture: ishikawa/detect-c4-context-text]
[fixture: ishikawa/detect-c4-frontmatter]
[fixture: ishikawa/detect-c4-comment]
[fixture: ishikawa/detect-c4-in-directive]

行内の `R %% C4Container` は、`%` の接尾部の後に物理行終端があれば、
両者が受理します（「[行終端](../common.ja.md#行終端)」）。
検出ではその接尾部を除きますが、
Ishikawa は節点のテキスト全体を保ちます。 [fixture: ishikawa/detect-inline-comment-c4-text]
[fixture: ishikawa/detect-inline-comment-c4-cr]

EOF では、接尾部の後が U+2028 や U+2029 だけの形も含め、
検出で接尾部を除きません。
mermaid.js は C4 を選んで拒否しますが、
この仕様はこの識別子の下で Ishikawa のテキストとして受理します。 [fixture: ishikawa/div-c4-inline-percent-eof]
[fixture: ishikawa/div-c4-inline-percent-ls-eof]
[fixture: ishikawa/div-c4-inline-percent-ps-eof]

## 差異

どの例も、それぞれが図全体です。

1. メッセージのテキストの中のキーワード:

   ```mmd
   sequenceDiagram
     A ->> B: C4Container
   ```

2. ラベルとしてのキーワード:

   ```mmd
   flowchart LR
     A[C4Component]
   ```

3. クラス名としてのキーワード:

   ```mmd
   classDiagram
     class C4Dynamic
   ```

4. 状態の id としてのキーワード:

   ```mmd
   stateDiagram-v2
     [*] --> C4Deployment
   ```

5. ヘッダーの後の `C4Context`:

   ```mmd
   flowchart LR
     A --> C4Context
   ```

6. コメント行の中のキーワード:

   ```mmd
   flowchart LR
     %% C4Container
     A --> B
   ```

| 例  | mermaid.js                        | この仕様                                       |
| --- | --------------------------------- | ---------------------------------------------- |
| 1   | C4 のパーサーに渡され、拒否       | メッセージ `C4Container` を持つ sequence 図    |
| 2   | C4 のパーサーに渡され、拒否       | ラベル `C4Component` の頂点 A を持つ flowchart |
| 3   | C4 のパーサーに渡され、拒否       | クラス `C4Dynamic` を持つ class 図             |
| 4   | C4 のパーサーに渡され、拒否       | 状態 `C4Deployment` を持つ state 図            |
| 5   | 頂点 `C4Context` を持つ flowchart | 同じ                                           |
| 6   | 頂点 A と B を持つ flowchart      | 同じ                                           |

表で比較した読みを次の fixture が記録します。 [fixture: common/detect-c4-anywhere]
[fixture: flowchart/div-c4-keyword-in-label]
[fixture: class/div-c4-keyword-as-class-name]
[fixture: state/div-c4-keyword-as-state-id]
[fixture: common/detect-c4context-only-at-start]
[fixture: flowchart/detect-c4-keyword-on-comment-line]

差異は一方向です。
この仕様は、mermaid.js が拒否するテキストをヘッダーの図として受理します。
C4 のパーサーは別の図種のヘッダーを受理しないからです。
両者が C4 図として読むテキストと、両者が拒否するテキストには影響しません。
コメント行の中やディレクティブの中のキーワードは、両者とも検出の前に除くので、
例 6 のようなものは同じに読まれます。

## 書き手にとっての意味

別の図種の図が `C4Container`、`C4Component`、`C4Dynamic`、
`C4Deployment` をラベル、メッセージ、名前など、
検出に残るテキストのどこかに含むとき、このツールキットはヘッダーの図として読み、
mermaid.js は C4 図として読んで失敗します。
両者が同じに読む図を書くには、別の図種の図でこの 4 語を使わないことです。
`C4Context` は安全です。

## mermaid.js がそう読む理由

C4 の検出器（ [`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10)）は 5 つの選択肢を持つ 1 つの正規表現で、
テキストの先頭に固定されているのは最初の `C4Context` だけです。
他の 4 つはどこにでも一致します。
検出器は、フロントマター、ディレクティブ、
コメント行を除いた後のテキスト全体に対して動き（ [`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)）、
C4 の検出器は、`flowchart-elk`、`mindmap`、`architecture`、`agentflow` を除く、
独自の文法を持つすべての図種の検出器より前に登録されています（ [`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L44-L126)）。
そのため、ヘッダーの図種の検出器が試される前に、
そのようなテキストを引き受けます。

検出時に inline `%%` 接尾部を除くのは、LF がそれを終える場合だけです。
EOF では、
[`stripAnyComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/regexes.ts#L40-L72) のとおり、
その接尾部が、
検出器に見えるまま残ります。 [fixture: usecase/lex-c4-inline-percent-with-lf]
[fixture: usecase/div-c4-inline-percent-eof]

## この仕様の規則とその理由

この仕様は図種を図のテキストの最初の単位で決め、そのために先を読みません。
テキストのどこかにある語を探す検出器は、テキスト全体の上でしか述べられません。
mermaid.js は、どの字句解析器がソースを読むよりも前に、
書き換えたテキストの上で検出を行うので、テキスト全体を手にしています。
ソースを左から右へ 1 回読む仕様は、検出を最初の単位の規則として述べます。
これは既知の差異の理由の 2 つ目です（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
違って読まれる入力は、別のヘッダーの後に 4 つのキーワードのどれかを持つもので、
この仕様はそれをヘッダーの図として読みます。

### Usecase

usecase は C4 より後に登録されます。
対象の C4Container、C4Component、C4Dynamic、C4Deployment は、 UsecaseLabel、
UsecaseLiteral、UsecaseJsonDataBlock にそのまま保てます。
その語が検出に残る場合、pin の検出器は C4 を選んで例を拒否します。
その検出だけを除けば同じ入力を usecase として受理します。
欠落テキストの節点は不要です。
既存の pipeline 順序の逆方向の基準によりヘッダーの文法を選び、
この理由で mermaid が受理する入力を拒否することはありません。
C4Context と、frontmatter、directive、コメントと共に除く語は、
差異ではなく対照例です。 [fixture: usecase/div-detect-c4-label]
[fixture: usecase/div-c4-component-label]
[fixture: usecase/div-c4-dynamic-json]
[fixture: usecase/div-c4-deployment-stereotype]
[fixture: usecase/gram-detect-c4-context-label]
[fixture: usecase/gram-detect-c4-frontmatter]
[fixture: usecase/detect-c4-directive]
[fixture: usecase/detect-c4-comment]

usecase はラベル内の inline `%%` を保ちます。
`A(C4Context %% C4Container)` の行が LF で終わると、
検出はパーセント接尾部を除いて usecase を選び、
ラベルには書かれた全文を保ちます。
EOF では検出がその接尾部を残すので、C4 を選んで拒否します。
この仕様は既存の逆方向の基準により、
同じラベルを usecase として受理します。 [fixture: usecase/lex-c4-inline-percent-with-lf]
[fixture: usecase/div-c4-inline-percent-eof]

### Pie

StringLiteral のラベル、PieLiteral のタイトル、
アクセシビリティの行の値と説明ブロック、PieIgnoredText の YAML ブロック、
共通の Comment は、 C4 の語を書かれたまま持てます。
コメントの場合は、区分の後の EOF とヘッダー行の EOF を含みます。
そのため木は pie のヘッダーを読み、この入力を受理します。
mermaid.js は、検出の見るテキストに残る、
先頭に限定しない 4 語のいずれかで C4 を選び、これらの入力を拒否します。
これは逆方向の差異で、mermaid.js が拒否するものをこの仕様が受理します。
この規則は、受理された pie の入力を拒否しません。
対照の fixture の、除去するディレクティブの中の C4 の語は、検出器に見えず、
印を持ちません。 [fixture: pie/div-detect-c4-label]
[fixture: pie/div-detect-c4-title]
[fixture: pie/div-yaml-body-c4-hidden]
[fixture: pie/detect-c4-directive-control]
[fixture: pie/div-detect-c4-acctitle]
[fixture: pie/div-detect-c4-accdescr-line]
[fixture: pie/div-detect-c4-accdescr-block]
[fixture: pie/div-detect-c4-section-comment-eof]
[fixture: pie/div-detect-c4-header-comment-eof]

ラベル `C4Context %% C4Container` の後に最後の LF があれば、
検出は行中のパーセント接尾部を除いて pie を選び、
ラベルは書かれた全文を保ちます。
EOF ではその接尾部が検出のテキストに残るため、Mermaid は C4 を選んで拒否します。
この仕様は、既存の逆方向の基準により、同じ pie のラベルを受理します。
ラベル内の `C4Context` 単独では C4 を選びません。 [fixture: pie/lex-c4-inline-percent-with-lf]
[fixture: pie/div-c4-inline-percent-eof]
[fixture: pie/lex-c4context-label]

### Gitgraph

参照・文字列・共通のリテラル・無視するテキスト・Comment は、
C4 の語を書かれたまま持てます。
理由 2 の逆方向として見出しだけで検出し、後のテキストの `C4Container`、
`C4Component`、`C4Dynamic`、`C4Deployment` により Mermaid が拒否する入力も、
ここでは受理します。
Mermaid が受理する入力をこの規則で拒否することはありません。
後の `C4Context` や、
LF で終わるコメントの対照例は一致します。 [fixture: gitgraph/div-detect-c4container-id]
[fixture: gitgraph/div-detect-c4component-branch]
[fixture: gitgraph/div-detect-c4dynamic-message]
[fixture: gitgraph/div-detect-c4deployment-tag]
[fixture: gitgraph/div-detect-c4container-title]
[fixture: gitgraph/div-detect-c4component-acctitle]
[fixture: gitgraph/div-detect-c4dynamic-accdescr]
[fixture: gitgraph/div-detect-c4deployment-block]
[fixture: gitgraph/div-detect-c4container-comment-eof]
[fixture: gitgraph/div-detect-c4component-header-comment-eof]
[fixture: gitgraph/detect-c4context-id]
[fixture: gitgraph/detect-c4container-comment-lf]

### Info

InfoLiteral・InfoIgnoredText・共有 Comment は C4 の語を書かれたまま持ちます。
既存の逆方向の処理順の規則は見出しの文法を選びます。
検出テキストの後の位置にある 4 個のアンカーのない C4 の語は、
Mermaid が拒否してもここでは info として受理できます。
Mermaid が受理する入力を拒否しません。
C4Context、除いたフロントマター・ディレクティブ、
LF で終わるコメントの対照例は一致し、
別の理由で不正な info の本文は引き続き拒否します。 [fixture: info/div-c4container-title]
[fixture: info/div-c4component-acctitle] [fixture: info/div-c4dynamic-line]
[fixture: info/div-c4deployment-block]
[fixture: info/div-c4container-header-comment-eof]
[fixture: info/div-c4component-flag-comment-eof]
[fixture: info/c4container-header-comment-lf]
[fixture: info/c4component-flag-comment-lf] [fixture: info/div-c4-hidden-yaml]
[fixture: info/div-c4-hidden-directive] [fixture: info/div-c4-retained-yaml]
[fixture: info/div-c4-retained-directive] [fixture: info/lex-c4context-common]
[fixture: info/lex-c4-removed-directive] [fixture: info/lex-c4-frontmatter]
[fixture: info/lex-c4-invalid-info]

### Packet

文字列、共通 literal、ignored text、Comment は C4 語を保持できる。
理由 2 の逆方向の見出しだけの選択により、
Mermaid が C4 へ切り替えて拒否する後続の C4 語を受理する。
Mermaid が受理する入力は拒否しない。
LF 終端の接尾辞と検出が通過した残存 YAML は差異のない対照である。 [fixture: packet/c4container-label]
[fixture: packet/c4component-title]
[fixture: packet/c4deployment-block]
[fixture: packet/c4dynamic-header-comment-eof]
[fixture: packet/div-c4-hidden-yaml]
[fixture: packet/div-c4-hidden-suffix-eof]
[fixture: packet/c4-hidden-suffix-lf]
[fixture: packet/c4-retained-preheader-yaml]

### Radar

radar の見出しは、その後の title、label、参照に C4Container、C4Component、
C4Dynamic、C4Deployment があっても radar を選びます。
まず木に持てるかを考えると、RadarLiteral・StringLiteral・Identifier に、
C4 として解釈せず原文を保てます。
新しい無視するテキストの node も拒否も不要です。
残る逆方向の受理の差異は、先行する C4 の全体 scan に代わる、
見出しによる直接の選択規則です。 [fixture: radar/c4-container-title]
[fixture: radar/c4-component-axis-label]
[fixture: radar/c4-dynamic-reference]
[fixture: radar/c4-deployment-line]

C4Context はこの全体一致をしません。
他の 4 語を持つ LF 終了の先頭 comment は、
終端がなく C4 の検出に語を露出する comment とは異なる検出の対照例です。
差異のある radar 入力には同じ共有識別子を付け、
仕様の受理結果を記録します。 [fixture: radar/c4-context-title]
[fixture: radar/c4-container-header-lf]
[fixture: radar/c4-container-header-eof]
[fixture: radar/c4-component-header-lf]
[fixture: radar/c4-component-header-eof]
[fixture: radar/c4-dynamic-header-lf]
[fixture: radar/c4-dynamic-header-eof]
[fixture: radar/c4-deployment-header-lf]
[fixture: radar/c4-deployment-header-eof]

### Treemap

treemap の見出しがあれば、後の引用した名前や共通値が C4Container、C4Component、
C4Dynamic、C4Deployment を含んでも、見出しによって treemap を選びます。
StringLiteral・TreemapLiteral はその text を書かれたまま持てるため、 ignored
node や拒否は要りません。
残る差異は、先に試す C4 の anywhere 一致の代わりに使う直接の見出しの規則です。
先頭・見出しの native comment が LF で終わる場合は差異のない対照とし、
終端がなければ C4 scan が C4 を選ぶ場合があります。
既存の受理する specified を保ち、
これらの対照と区別します。 [fixture: treemap/c4-container-section]
[fixture: treemap/c4-component-leaf]
[fixture: treemap/c4-dynamic-title] [fixture: treemap/c4-deployment-block]
[fixture: treemap/c4-component-header-eof]
[fixture: treemap/c4-component-header-lf]

### Railroad

選んだ railroad の見出しが IR、EBNF、ABNF、PEG を決め、
後の図の text に C4Container、C4Component、C4Dynamic、
C4Deployment があっても変えません。
C4Context だけの場合も通常の値です。
印のある例は、Mermaid が C4 を選ぶのに対し、
specified の railroad の結果は受理です。 [fixture: railroad/ir-c4-container-terminal]
[fixture: railroad/ebnf-c4-component-special]
[fixture: railroad/abnf-c4-dynamic-string]
[fixture: railroad/peg-c4-deployment-predicate]

第 1 の問いでは、書かれた規則名、文字列、metadata、 special
sequence がこれらの語を自然に保てるため、 ignored-text の node は要りません。
その原文の木で表せないのは、見出しにかかわらず図全体を C4 へ切り替えることです。
第 2 の問いの答えは理由 2 で、
detector の登録順の代わりに見出しを選ぶ直接の規則を使います。
4
id は引き続き 1 個の RailroadDiagram を共有します。 [fixture: railroad/ir-c4-container-terminal]
[fixture: railroad/ebnf-c4-component-special]
[fixture: railroad/abnf-c4-dynamic-string]
[fixture: railroad/peg-c4-deployment-predicate]

### Wardley

Wardley は検出の登録順で C4 より後です。
名前・文字列・literal・native hidden は書いた C4 語を保持できますが、
Wardley の木が同時に横取りした C4 図種でもあることはできません。
既存の理由 2 の直接の見出し選択規則は先頭の見出しで Wardley を選びます。
そのため後続の C4Container・C4Component・C4Dynamic・C4Deployment により、
Mermaid が拒否し、この仕様が受理する場合があります。
検出前に除かれる通常の LF 終端のコメントは差異がなく、
EOF のコメントは同じ control ではありません。 [fixture: wardley/c4-component-component]
[fixture: wardley/c4-dynamic-flow-label] [fixture: wardley/c4-container-title]
[fixture: wardley/c4-component-header-eof]
[fixture: wardley/c4-component-header-lf]

### Cynefin

後の値に C4 の検出の語があっても見出しから cynefin を選ぶ。
値は Cynefin の node を持つが、
同じ木に置き換わった C4 の図種も持つことはできない。
検出用に除去する通常の LF つきコメントは差異の無い対照である。 [fixture: cynefin/c4-component-item]
[fixture: cynefin/c4-container-title]
[fixture: cynefin/c4-component-header-eof]
[fixture: cynefin/c4-component-header-lf]

[pin の文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30) と、
[公開の adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19) は、
共通の前処理と検出の結果を読みます。
[Cynefin の構文](../diagrams/cynefin.ja.md)に直接の規則を定め、
[木](../ast/cynefin.ja.md)に書かれた形を保ちます。 [fixture: cynefin/db-all-fields]

### eventmodeling

eventmodeling は C4 の検出より後です。
書かれた identifier、 参照、inline/block data、note、GWT、
共通の値には C4Container、C4Component、C4Dynamic、C4Deployment を持てます。
後の語から C4 を選ぶと、それらの node を変えるのでなく、
書かれた見出しの図を置き換えます。
見出しから選ぶ規則に従い、 印付きの例は Mermaid では拒否、
指定の eventmodeling の読みでは受理します。
LF で終わる percent comment の対照で はその検出の差がなく、
両方拒否する場合も印を足しません。 [fixture: eventmodeling/c4-container-data]
[fixture: eventmodeling/c4-component-identifier]
[fixture: eventmodeling/c4-dynamic-gwt]
[fixture: eventmodeling/c4-deployment-reference]
[fixture: eventmodeling/c4-component-header-lf]
[fixture: eventmodeling/prefix-directive-c4]
[fixture: eventmodeling/prefix-yaml-c4]
[fixture: eventmodeling/prefix-yaml-between-bares-c4]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70) が単位を、
[図の構文](../diagrams/eventmodeling.ja.md)が直接の境目を定義します。

### Treeview

treeview は C4 より後に登録されます。
後の名前・共通値・description・コメント・directive に C4Container、C4Component、
C4Dynamic、C4Deployment が入りえます。
木にその字を置く場所があり、
既存の直接の検出規則に従って見出しからこの図種を選びます。
specified の treeview の読みが、先の検出器からまだ見える、
終端改行の無い percent-comment の対照も含めて、比較を記録します。
[構文](../diagrams/treeview.ja.md)は検出と文法の受理を分けます。 [fixture: treeview/c4-container-bare]
[fixture: treeview/c4-component-header-eof] [fixture: treeview/c4-dynamic-title]
[fixture: treeview/c4-deployment-block]
[fixture: treeview/c4-component-header-lf]

## mermaid.js の文書と issue

- [C4 図の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md) は、
  5 つの種類の図をそのキーワードとともに挙げ、
  どの例も 1 行目がそのキーワードで始まります。
- [構文のリファレンス](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md) は、
  すべての図の定義は図種の宣言で始まると述べています。
- 4 つのキーワードがどこにでも一致することについての mermaid.js の issue と pull
  request は見つかりませんでした（2026-10-07 に `C4Container detect`、
  `c4Detector`、`C4 detector anywhere`、`C4Container regex`、`detected as C4`、
  `C4Component sequence`、`C4 detection`、`C4Dynamic`、`C4Deployment`、
  `wrong diagram type detected`、`detectType C4` で検索）。
  open の issue
  [mermaid-js/mermaid#4542](https://github.com/mermaid-js/mermaid/issues/4542) は、
  図のキーワードを標準化する提案で、C4 の 5 つを `c4 context`、
  `c4 container` などにすることを含みますが、
  キーワードをどこに探すかには触れていません。

- ピン留めした

[venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md) は図を `venn-beta` で始めます。
2026-10-21 に、`mermaid-js/mermaid` の issue と PR を、
`C4Container detection in:title,body` と、
`C4 detection in:title,body` で検索し、すべての C4 語を先頭に限定する提案の、
[PR #8501](https://github.com/mermaid-js/mermaid/pull/8501) と、
[PR #8504](https://github.com/mermaid-js/mermaid/pull/8504) が見つかりました。
ピン留めした検出器は四つの語を任意の位置で照合します。 [fixture: venn/lex-c4-c4container-identifier]
[fixture: venn/lex-c4-c4component-label]
[fixture: venn/lex-c4-c4dynamic-style]
[fixture: venn/lex-c4-c4deployment-title]

- ピン留めした

[Ishikawa の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38) は例を `ishikawa-beta` で始めます。
[issue #4784](https://github.com/mermaid-js/mermaid/issues/4784) は mindmap と同様の構文を提案し、
節点のテキスト内で C4 を検出する規則は述べていません。
2026-10-21 に `mermaid-js/mermaid` の issue と PR を `ishikawa` と `ishikawa C4 in:title,body` で検索し、
C4 語が Ishikawa の見出しを上書きする報告は見つかりませんでした。

- pin の [usecase 文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589) は beta ヘッダーを説明します。
  2026-10-22 に mermaid-js/mermaid の issue と PR を `usecase` で検索し、
  この受理挙動を保守者が欠陥と判断したと示す報告は、
  調べた結果にはありませんでした。
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048) は Type:
  Enhancement で、2026-08-14 にマージ済みで閉じています。
  Chevrotain parser、モデル検証、JSON の表を導入します。
  この差異は共有の直接の規則に従うもので、
  bug ラベルを文法変更の承認とは読みません。

- pie の pin した [構文文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md) は、
  図を `pie` で始めます。
  2026-10-23 に `pie` と `C4 detection` を検索しましたが、
  pie 固有の例外は見つかりませんでした。
  [PR #8501](https://github.com/mermaid-js/mermaid/pull/8501) と [PR #8504](https://github.com/mermaid-js/mermaid/pull/8504) は、
  C4 のすべての選択肢を先頭に限定する提案です。
  この事実は共通の検出規則を支えますが、
  pin した版には先頭に限定しない選択肢が残っています。

gitgraph の [gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md) は、
見出しと各コマンドを説明します。
2026-10-23 に issue・PR を `gitGraph`、`gitGraph directive`、 `gitGraph YAML`、
`gitGraph semicolon`、`gitGraph keyword`、 `gitGraph duplicate`、
`gitGraph cherry-pick` で検索しました。
確認した結果には、この共通の境界を決定するものはありませんでした。
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) は終了済みで Status:
Approved が付き、
merge 済みの [#6707](https://github.com/mermaid-js/mermaid/pull/6707) は重複 ID の警告を加えます。
これらから追加の差異は作りません。

- info には専用の構文ページがなく、
  pin した [構文の参照](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md) は図種の宣言と percent コメントを説明します。
  2026-10-23 に `info showInfo`、`info directive`、`info semicolon`、
  `info accTitle` で issue と PR を検索しました。
  [#7601](https://github.com/mermaid-js/mermaid/issues/7601) は info/showInfo の描画を報告し、
  open、Type: Bug / Error、Status: Triage でした。
  検査した結果には、この構文の拒否を決める info 固有の保守者の判断はありません。
  この節は既存の直接の規則に従います。

- pin の [packet の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28) は単一位置・範囲・相対 count を示します。
  この前処理の境界については定めていません。
  2026-10-25 に `packet bitsPerRow`、`packet fractional`、
  `packet maxPacketSize` で公式 repository の issue・PR を検索しましたが、
  ここでの差異に関する maintainer の判断を示す結果は見つかりませんでした。

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/radar.md#L66-L166) は軸・曲線・option を説明します。
  2026-10-25 に公式の issue/PR を radar directive、radar semicolon、 radar
  entries で調べましたが、上記の境界を不具合とする判断は見つかりませんでした。
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) は閉じられた Status:
  Approved の文書報告です。
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) は、
  文書例の comma の修正で、
  末尾 comma の文法上の対応を追加したものではありません。

- Treemap:
  pin した [treemap の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treemap.md#L24-L115) は引用した row・字下げ・class 定義を説明し、
  この共通の前処理の境界は定めていません。
  2026-10-25 に公式 repository の issue・PR を `treemap C4` で検索しました。
  調べた結果に、この差異を maintainer が判断した根拠は見つかりませんでした。
  [#6590](https://github.com/mermaid-js/mermaid/pull/6590) は treemap を導入し、
  2025-06-27 に merge された PR で、この境界を判断したものではありません。

- Railroad:
  [pin した構文の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/railroad.md#L1-L280) は 4 記法、
  EBNF の例外、ABNF のセミコロンの comment、 PEG の predicate を説明します。
  native の残る YAML と frontmatter を跨ぐ HTML の引用符の文脈は定義しません。
  2026-10-26 に公式 repository の issue と PR を railroad frontmatter、 railroad
  directive、railroad semicolon、railroad comment で検索しました。
  [#7979](https://github.com/mermaid-js/mermaid/issues/7979) は demo の見出し名の報告（closed、
  Triage）、
  [#6620](https://github.com/mermaid-js/mermaid/issues/6620) は ABNF の図種の提案（open、
  Discussion Needed）です。
  どちらも、これらの前処理の境界について、
  保守者が defect と判断した事実ではありません。
  この差異はその判断でなく既存の共通規則に従います。
  調べた結果だけで、ほかに関連する issue がないとは断定しません。

- Wardley:
  pin した[構文の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/wardley.md#L1-L461)は座標・装飾・flow を示しますが、
  この共通の境界を定義しません。
  2026-10-26 に公式 repository の issue/PR を wardley directive、wardley
  semicolon、wardley flow で検索しました。
  [#7642](https://github.com/mermaid-js/mermaid/pull/7642) は hyphen の名、
  [#7726](https://github.com/mermaid-js/mermaid/pull/7726) は不要な sanitization の修正で、
  いずれも pin に反映済みです。
  [#8379](https://github.com/mermaid-js/mermaid/pull/8379) は設定保持に関する open
  PR でした。
  確認した結果はこの境界を不具合と認める判断を示さず、
  既存の直接の規則を適用します。
  検索の網羅性は主張しません。
- Cynefin の[pin の構文文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L21-L111)は固定の領域、
  引用符つきの項目、ラベルつきの遷移を説明し、
  [注記](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L203-L210)は自己遷移を無視すると述べます。
  [PR #7535](https://github.com/mermaid-js/mermaid/pull/7535) は図を加えて merge されました。
  2026-10-26 に cynefin parser、cynefin directive、cynefin semicolon、cynefin
  frontmatter で検索し、
  この境目について調べた範囲で maintainer の判断は見つかりませんでした。
  [Issue #7921](https://github.com/mermaid-js/mermaid/issues/7921) は open、
  Status: Triage で、framework の名前と描画の変更を求めるもので、
  この字句の規則の判断ではありません。

### eventmodeling

pin した [eventmodeling.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L37-L322) は frame、
data、tag を説明しますが、共有の前処理の境目を定義しません。
2026-10-26 に公式 issue と PR を eventmodeling title、eventmodeling parser、
event modeling data、eventmodeling accTitle、 eventmodeling
validator で検索しました。
2026-04-16 に merged となった [PR #7588](https://github.com/mermaid-js/mermaid/pull/7588) は validator の登録を追加し、
この境目に関する保守者の判断ではありません。
確認した結果にはその判断はなく、既存の直接の規則を適用します。
網羅的な検索だとはしません。

### Treeview

固定版の [treeView.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treeView.md#L1-L277) は字下げ・引用名・注釈・罫線を説明します。
この共通の境目を定義してはいません。
2026-10-26 に公式 issue/PR を `treeView quoted`、`treeView indentation`、
`treeView box`、 `treeView quotes`、`treeView whitespace`、
`treeView accDescr` で検索しました。
[PR #7721](https://github.com/mermaid-js/mermaid/pull/7721) は罫線を追加した merged の PR、
[Issue #8014](https://github.com/mermaid-js/mermaid/issues/8014) は header 省略を提案する open の Enhancement/Triage です。
調べた結果はこの共通の境目を defect と認める maintainer の判断を示しません。
既存の直接規則を適用するもので、網羅的な検索という主張ではありません。

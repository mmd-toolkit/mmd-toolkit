# c4-keyword-anywhere

英語版: [c4-keyword-anywhere.md](./c4-keyword-anywhere.md)

図種: C4 より後に検出されるすべて。
この仕様と mermaid.js の [既知の差異](../known-divergences.ja.md) の 1 つです。

## 対象の構文

C4 図は、5 つのキーワード `C4Context`、`C4Container`、`C4Component`、
`C4Dynamic`、`C4Deployment` のどれかで始まります。
これらは C4 図の 5 つの種類の名前です
（[detection.ja.md](../detection.ja.md) の項目 7）。

```mmd
C4Container
  Container(a, "A")
```

[fixture: common/detect-minimal-c4]

mermaid.js の C4 の検出器は、`C4Context` をテキストの先頭に、
他の 4 つのキーワードをテキストのどこにでも探します。
この仕様は図種を図のテキストの最初の単位で決めるので
（[図種の検出](../common.ja.md#図種の検出) を参照）、
5 つとも先頭にだけ探します。
差異は、ヘッダーが別の図のもので、その後に 4 つのキーワードのどれかを持つ
テキストです。
mermaid.js は mindmap の検出器を C4 のものより先に試すので、
マインドマップにはそうしたテキストはありません。
`C4Container` は、どちらでもノードのテキストです。
[fixture: mindmap/lex-c4-keyword-as-node-text]

kanban ではノードの id、ラベル、データ本文の 4 つの語は、
kanban の位置で読みます。
mermaid.js は C4 を選び入力を拒否します。
[fixture: kanban/lex-c4-c4component-id]
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

kanban のノード名 `C4Context` は両者で検出を変えません。
[fixture: kanban/lex-c4-c4context-id]
除かれるコメントとフロントマターの中の `C4Container` は、
両者で検出を変えません。
[fixture: kanban/lex-c4-c4container-comment]
[fixture: kanban/lex-c4-c4container-frontmatter]

venn では、
裸か引用の set の名前、ラベル、裸か引用の style 値、
タイトルの中の
`C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` を、
ここでは venn の位置で読みます。
[fixture: venn/lex-c4-c4container-identifier]
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
mermaid.js は C4 を選び、入力を拒否します。
[fixture: venn/lex-c4-c4container-identifier]
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
どちらの読みでも検出を変えません。
[fixture: venn/lex-c4-c4context-identifier]
[fixture: venn/lex-c4-c4context-label]
[fixture: venn/lex-c4-c4context-style]
[fixture: venn/lex-c4-c4context-title]
[fixture: venn/lex-c4-c4container-comment]
[fixture: venn/lex-c4-c4container-frontmatter]

## 差異

どの例も、それぞれが図全体です。

1. メッセージのテキストの中のキーワード:

   ```mmd
   sequenceDiagram
     A->>B: C4Container
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
     A-->C4Context
   ```

6. コメント行の中のキーワード:

   ```mmd
   flowchart LR
     %% C4Container
     A-->B
   ```

| 例  | mermaid.js                        | この仕様                                       |
| --- | --------------------------------- | ---------------------------------------------- |
| 1   | C4 のパーサーに渡され、拒否       | メッセージ `C4Container` を持つ sequence 図    |
| 2   | C4 のパーサーに渡され、拒否       | ラベル `C4Component` の頂点 A を持つ flowchart |
| 3   | C4 のパーサーに渡され、拒否       | クラス `C4Dynamic` を持つ class 図             |
| 4   | C4 のパーサーに渡され、拒否       | 状態 `C4Deployment` を持つ state 図            |
| 5   | 頂点 `C4Context` を持つ flowchart | 同じ                                           |
| 6   | 頂点 A と B を持つ flowchart      | 同じ                                           |

[fixture: common/detect-c4-anywhere] [fixture:
flowchart/div-c4-keyword-in-label] [fixture:
class/div-c4-keyword-as-class-name] [fixture:
state/div-c4-keyword-as-state-id] [fixture:
common/detect-c4context-only-at-start] [fixture:
flowchart/detect-c4-keyword-on-comment-line]

差異は一方向です。
この仕様は、mermaid.js が拒否するテキストをヘッダーの図として受理します。
C4 のパーサーは別の図種のヘッダーを受理しないからです。
両者が C4 図として読むテキストと、両者が拒否するテキストには影響しません。
コメント行の中やディレクティブの中のキーワードは、
両者とも検出の前に除くので、例 6 のようなものは同じに読まれます。

## 書き手にとっての意味

別の図種の図が `C4Container`、`C4Component`、`C4Dynamic`、`C4Deployment` を
ラベル、メッセージ、名前など、テキストのどこかに含むとき、
このツールキットはヘッダーの図として読み、mermaid.js は C4 図として読んで
失敗します。
両者が同じに読む図を書くには、別の図種の図でこの 4 語を使わないことです。
`C4Context` は安全です。

## mermaid.js がそう読む理由

C4 の検出器
（[`c4Detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Detector.ts#L10)）
は 5 つの選択肢を持つ 1 つの正規表現で、
テキストの先頭に固定されているのは最初の `C4Context` だけです。
他の 4 つはどこにでも一致します。
検出器は、フロントマター、ディレクティブ、コメント行を除いた後の
テキスト全体に対して動き
（[`detectType()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/detectType.ts#L36-L48)）、
C4 の検出器は、`flowchart-elk`、`mindmap`、`architecture`、`agentflow`
を除く、独自の文法を持つすべての図種の検出器より前に登録されています
（[`addDiagrams()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L44-L126)）。
そのため、ヘッダーの図種の検出器が試される前に、
そのようなテキストを引き受けます。

## この仕様の規則とその理由

この仕様は図種を図のテキストの最初の単位で決め、そのために先を読みません。
テキストのどこかにある語を探す検出器は、テキスト全体の上でしか述べられません。
mermaid.js は、どの字句解析器がソースを読むよりも前に、
書き換えたテキストの上で検出を行うので、テキスト全体を手にしています。
ソースを左から右へ 1 回読む仕様は、検出を最初の単位の規則として述べます。
これは既知の差異の理由の 2 つ目です
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
違って読まれる入力は、別のヘッダーの後に 4 つのキーワードのどれかを持つもので、
この仕様はそれをヘッダーの図として読みます。

## mermaid.js の文書と issue

- [C4 図の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md)
  は、5 つの種類の図をそのキーワードとともに挙げ、
  どの例も 1 行目がそのキーワードで始まります。
- [構文のリファレンス](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  は、すべての図の定義は図種の宣言で始まると述べています。
- 4 つのキーワードがどこにでも一致することについての mermaid.js の issue と
  pull request は見つかりませんでした（2026-10-07 に `C4Container detect`、
  `c4Detector`、`C4 detector anywhere`、`C4Container regex`、`detected as C4`、
  `C4Component sequence`、`C4 detection`、`C4Dynamic`、`C4Deployment`、
  `wrong diagram type detected`、`detectType C4` で検索）。
  open の issue
  [mermaid-js/mermaid#4542](https://github.com/mermaid-js/mermaid/issues/4542)
  は、図のキーワードを標準化する提案で、C4 の 5 つを `c4 context`、
  `c4 container` などにすることを含みますが、
  キーワードをどこに探すかには触れていません。

- ピン留めした
  [venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  は図を `venn-beta` で始めます。
  2026-10-21 に `mermaid-js/mermaid` の issue と PR を
  `C4Container detection in:title,body` と
  `C4 detection in:title,body` で検索し、
  すべての C4 語を先頭に限定する提案の
  [PR #8501](https://github.com/mermaid-js/mermaid/pull/8501) と
  [PR #8504](https://github.com/mermaid-js/mermaid/pull/8504) が見つかりました。
  ピン留めした検出器は四つの語を任意の位置で照合します。
  [fixture: venn/lex-c4-c4container-identifier]
  [fixture: venn/lex-c4-c4component-label]
  [fixture: venn/lex-c4-c4dynamic-style]
  [fixture: venn/lex-c4-c4deployment-title]

# @mmd-toolkit/agentflow-no-redefined-vertex

英語版: [agentflow-no-redefined-vertex.md](./agentflow-no-redefined-vertex.md)

その id に前に書いたラベルや形を置き換える頂点を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`A[End]` のように形を付けて書いた頂点は、その id のラベルと形を設定する。
前の文が同じ id にそれらを書いていると、
mermaid.js は後のものをエラーなしに使い、前のラベルや形は失われる。

## 規則の詳細

この規則は、形を付けて書いた頂点のうち、同じ id にその前に書いたものとラベル、
描かれる形、種類のどれかが違うものを報告する。
対象の図種は `agentflow` である。

`A[Start] --> B` の後の行 `C --> A[End]` は頂点 `A` にラベル `End` を与え、
ラベル `Start` は失われる。
`A --> C` のように形を付けずに頂点をもう一度書くと、ラベルと形を保ち、
報告しない。
頂点がすでに持つラベルと形を書くことも報告しない。
`A[x]` と `A[y]` の後の 3 つ目の `A[y]` は何も変えず、報告しない。

要素は、ラベルと、描画が示すとおりの形と種類で比べる。
agentflow は、ひし形 `{ }`、六角形 `{{ }}`、
サブルーチン `[[ ]]` を書いたとおりに、
ほかの括弧の形はどれも角の丸い長方形として描く。
また、要素ごとに種類を与え、既定のテーマ `redux-color` は種類ごとの色で描く。
サブルーチンは tool、ひし形は decision、六角形は action、`[/ /]` は input、
connector は connector、ほかの括弧の形は task である。
そのため、
どちらも角の丸い task である `A[x]` の後の `A(x)` は何も変えず報告しないが、
`A(x)` の後の `A{x}` と、 `A[x]` の後の input の `A[/x/]` は報告する。

同じ id の connector と頂点は、mermaid.js では 1 つの要素である。
`connector C[API]` の後に形を付けて書いた頂点は、
connector にそのラベルと形を与え、要素は connector の種類を保つ。
`C[Other]` はタイトル `API` を、`C{API}` は角の丸い長方形を置き換え、
どちらも報告する。
タイトルなしで宣言した connector は、誰も書いていない id をラベルとして持ち、
その後の頂点はそのラベルについては報告しない。
頂点を置き換える connector の宣言は [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.ja.md) が報告する。

すでにあるリンクの id や予約 id `connectors` を持つ通常の頂点の出現は、
何も変えず、比べない。
その出現は、比べる履歴の前のラベルや形も置き換えない。
リンクの対象はそのリンクが辺を作る前に読むので、形付きの対象は、
その id がリンクの id になる前なら頂点を置き換える。

`A@{ shape: decision }` のようにデータブロックが設定するラベルや形は、
id の 2 つの頂点の間にあっても比べない。
ラベルの種類（文字、文字列、マークダウン文字列）は比べない。
ラベルは、mermaid.js が取り除く両端の空白を除き、ほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
ラベルを読む前にほかの文字に変えるので、それだけが違う 2 つのラベルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

頂点ごとに自分の id を与え、そのラベルと形は 1 度だけ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A[Start] --> B
  C --> A[End]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  github["create_issue"] --> done
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  A[Start] --> B
  A --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-vertex: error
agentflow-beta TB
  connector github["GitHub API"]
  create["create_issue"] --> done
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-redefined-connector](./agentflow-no-redefined-connector.ja.md)

## 背景

[`addVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L347-L565) は、
connector を含めて、その id の既存の要素のラベルと型を設定する。
[`getTypeFromVertex`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1571-L1587) は型の形を描画に与え、
[`normaliseNodeShapes`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/shapes.ts#L113-L147) は長方形と、
agentflow が認めないすべての形を、角の丸い長方形として描く。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-vertex.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-vertex.test.ts)

<!-- end auto-generated rule resources -->

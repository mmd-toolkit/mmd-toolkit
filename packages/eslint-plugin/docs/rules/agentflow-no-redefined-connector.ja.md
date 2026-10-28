# @mmd-toolkit/agentflow-no-redefined-connector

英語版:
[agentflow-no-redefined-connector.md](./agentflow-no-redefined-connector.md)

その id に前に書いたタイトルや頂点を置き換える connector の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`connector C["Title"]` は connector とそのタイトルを宣言する。
別のタイトルでもう一度宣言すると、connector はエラーなしに後のタイトルを取り、
前のものは失われる。
頂点の id で宣言すると、connector はその頂点を置き換える。

## 規則の詳細

この規則は、前に宣言した connector のタイトルか、
前に形を付けて書いた頂点のラベル、描かれる形、
種類を変える connector の宣言を報告する。
対象の図種は `agentflow` である。

`connector C[First]` の後の宣言 `connector C[Second]` は connector にタイトル `Second` を与え、
`First` は失われる。
タイトルなしの宣言と空白だけのタイトルの宣言は、
connector が持つタイトルを保ち、報告しない。
connector がすでに持つタイトルの宣言も報告しない。
`connector C[First]` と `connector C[Second]` の後の 3 つ目の `connector C[First]` は、
`Second` を置き換えるので報告する。
最初にタイトルなしで宣言した connector は、
誰も書いていない id をタイトルとして持ち、後のタイトルは報告しない。

同じ id の connector と頂点は、mermaid.js では 1 つの要素である。
connector の最初の宣言は、その id の頂点を置き換える。
`C[Ordinary] --> B` の後の宣言 `connector C[API]` は、
要素 `C` にタイトル `API`、connector の形つまり角の丸い長方形、
connector の種類を与え、報告する。
形を付けて書いた頂点は connector ではないので、
connector の最初の宣言はその id のそのような頂点をどれも置き換え、
`C[API] --> B` の後の `connector C[API]` も、
task が connector になるので報告する。
タイトルがないと、connector は id をラベルとして取るので、
そこでは `connector C` も報告する。
`A --> C` の `C` のように参照されるだけの頂点は、
誰かが書いたラベルや形を持たず、その id の connector は報告しない。
形と種類は [agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.ja.md) が比べるとおりに比べ、
connector のタイトルを置き換える頂点はその規則が報告する。

両端の空白を除いた名前が空の connector は何も作らず、比べない。
すでにあるリンクの id や `connectors` のために無視される通常の頂点の出現は、
同じ id の実際の connector 宣言の前後でも、置き換えの履歴を書かない。

connector の id は、両端の空白と mermaid.js が消す部分を除いたその名前である。
`C@{ label: API }` のようにデータブロックが設定するタイトルやラベルは、
2 つの宣言の間にあっても比べない。
タイトルは、mermaid.js が取り除く両端の空白を除き、ほかは書いたとおりに比べる。
mermaid.js は、`#35;` のような文字参照と HTML の属性の引用符を、
タイトルを読む前にほかの文字に変えるので、それだけが違う 2 つのタイトルは、
mermaid.js には 1 つで、この規則には 2 つのことがある。

connector ごとに自分の id を与え、そのタイトルは 1 度だけ書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  connector C[First]
  connector C[Second]
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  github["create_issue"] --> done
  connector github["GitHub API"]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  connector C[First]
  connector C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-connector: error
agentflow-beta TB
  create["create_issue"] --> done
  connector github["GitHub API"]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.ja.md)

## 背景

[`addConnector`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1380-L1411) は、
id の最初の宣言をその id の頂点の代わりに新しい要素として保ち、
後には空でないタイトルだけを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-connector.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-connector.test.ts)

<!-- end auto-generated rule resources -->

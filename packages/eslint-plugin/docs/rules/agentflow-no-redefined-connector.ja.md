# @mmd-toolkit/agentflow-no-redefined-connector

英語版:
[agentflow-no-redefined-connector.md](./agentflow-no-redefined-connector.md)

その id に前に書いたタイトルや頂点を置き換える connector の宣言を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

別のタイトルでもう一度宣言した connector は、エラーなしに後のタイトルを取り、
前のタイトルは失われる。
頂点の id で宣言すると、その頂点を置き換える。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
前の connector のタイトルを変える宣言と、
形を付けて書いた頂点を置き換える宣言を報告する。
同じラベルでも、頂点が connector になるので報告する。
`A --> C` の `C` のように id で参照するだけの頂点は、
同じ id で connector を宣言しても報告しない。
その頂点のラベルや形は誰も書いていないからである。
タイトルのない宣言も、形を付けて書いた頂点を置き換えるので報告する。
connector の後に同じ id で形を付けて書いた頂点を報告するのは、
この規則ではなく
[agentflow-no-redefined-vertex](./agentflow-no-redefined-vertex.ja.md) である。

connector の再宣言は、タイトルがないとき、空白だけのとき、
現在と同じときは報告しない。
最初にタイトルなしで宣言した connector は id をタイトルに持ち、
その後にタイトルを付けても報告しない。

予約 id `connectors` の頂点は、前のラベルや形として数えない。
`C@{ label: API }` のようなデータブロックが設定するタイトルやラベルは、
宣言の間にあっても比べない。

タイトルは両端の空白を除き、そのほかは書いたとおりに比べるので、
文字参照や HTML の属性の引用符の違いは、
mermaid.js が同じタイトルとして読んでも報告することがある。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-redefined-connector.ts)
- [テストのソース](../../tests/rules/agentflow-no-redefined-connector.test.ts)

<!-- end auto-generated rule resources -->

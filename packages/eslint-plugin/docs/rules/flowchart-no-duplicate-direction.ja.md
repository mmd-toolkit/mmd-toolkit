# @mmd-toolkit/flowchart-no-duplicate-direction

英語版:
[flowchart-no-duplicate-direction.md](./flowchart-no-duplicate-direction.md)

その subgraph の方向を置き換える `direction` 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

subgraph の中の `direction` 文は subgraph の方向を設定する。
同じ subgraph の後の `direction` 文は、エラーなしにそれを置き換え、
前の方向は失われる。

## 規則の詳細

この規則は、subgraph の `direction` 文のうち、
同じ subgraph の前の `direction` 文が与えた方向と違う方向を与えるものを報告する。
対象の図種は `flowchart-v2`、`flowchart-elk`、`swimlane` である。

`subgraph S` の後の `direction LR`、`A`、`direction BT`、`end` では、
subgraph は方向 `BT` を取り、`LR` は失われる。
`direction` 文は、それが直接その本体にある subgraph について数え、
その外側の subgraph については数えない。
mermaid.js は、同じ id の 2 つの subgraph を、
最初のものの方向で 1 つとして描く。
その id の後の subgraph の `direction` 文は、
最初の subgraph が持つ方向と違う方向を与えると、
最初のものが方向を持たないときも含めて失われ、報告する。
`direction` と方向の値を持つ行は、
`A-->B; direction BT` のようにほかの文字があっても方向の文であり、これも比べる。
ほかの文字は [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md) が報告する。

subgraph がすでに持つ方向を与える文は報告しない。
[mermaid.js の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100) が言うとおり、
`TD` と `TB` は同じ上から下への方向であり、
`direction TD` の後の `direction TB` は報告しない。
`direction LR` と `direction BT` の後の 3 つ目の `direction LR` は、
`BT` を置き換えるので報告する。

subgraph ごとに `direction` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-direction: error
flowchart TB
  subgraph S
    direction LR
    A --> B
    direction BT
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-direction: error
flowchart TB
  subgraph S
    direction LR
    A --> B
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)

## 背景

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L674-L746) は、
subgraph の本体の最後の `direction` 文をその方向とする。
[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1210-L1255) は subgraph を最後のものから最初のものの順にレイアウトに与え、
レイアウトは id ごとに、最後に与えられた 1 つの節点を保つ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-duplicate-direction.ts)
- [テストのソース](../../tests/rules/flowchart-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->

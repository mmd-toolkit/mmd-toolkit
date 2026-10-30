# @mmd-toolkit/flowchart-no-duplicate-direction

英語版:
[flowchart-no-duplicate-direction.md](./flowchart-no-duplicate-direction.md)

その subgraph の方向を置き換える `direction` 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`direction` 文は、その subgraph の方向を設定する。
同じ subgraph の後の文は、エラーなしにそれを置き換え、前の方向は失われる。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
同じ subgraph の前の文が設定した方向を変える `direction` 文を報告する。
ほかのテキストもある方向の行を含め、文は、
それが直接その本体にある subgraph について数える。

mermaid.js は、同じ id の subgraph を、最初のものの方向で 1 つとして描く。
同じ id の後の subgraph の方向は、最初のものの方向と違うとき、
最初のものが方向を持たないときも含めて報告する。

現在の方向の繰り返しは報告せず、`TD` と `TB` はどちらも上から下を表す。
前の方向に戻す文は報告する。
`direction LR` と `direction BT` の後の 3 つ目の `direction LR` は報告する。

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

## 参考

- [flowchart の方向](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-duplicate-direction.ts)
- [テストのソース](../../tests/rules/flowchart-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->

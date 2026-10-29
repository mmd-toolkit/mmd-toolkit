# @mmd-toolkit/agentflow-no-duplicate-direction

英語版:
[agentflow-no-duplicate-direction.md](./agentflow-no-duplicate-direction.md)

その flow の方向を置き換える `direction` 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`direction` 文は、その flow の方向を設定する。
同じ flow の後の文は、エラーなしにそれを置き換え、前の方向は失われる。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
同じ flow に前の文が設定した方向を変える `direction` 文を報告する。
文は、それが直接その本体にある flow について数える。

同じ id の宣言は 1 つの flow なので、その方向も比べる。
名前のない 2 つの flow は別の flow で、その方向は比べない。

現在の方向の繰り返しは報告せず、`TD` と `TB` はどちらも上から下を表す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-direction: error
agentflow-beta TB
  flow F
    direction LR
    A
    direction BT
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-direction: error
agentflow-beta TB
  flow F
    direction LR
    A
  end
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [agentflow-no-redefined-flow](./agentflow-no-redefined-flow.ja.md)
- [agentflow-no-ignored-text](./agentflow-no-ignored-text.ja.md)

## 参考

- [flowchart の方向](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-duplicate-direction.ts)
- [テストのソース](../../tests/rules/agentflow-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->

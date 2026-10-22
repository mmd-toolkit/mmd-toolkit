# @mmd-toolkit/agentflow-no-duplicate-direction

英語版:
[agentflow-no-duplicate-direction.md](./agentflow-no-duplicate-direction.md)

その flow の方向を置き換える `direction` 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

flow の中の `direction` 文は flow の方向を設定する。
同じ flow の後の `direction` 文は、エラーなしにそれを置き換え、
前の方向は失われる。

## 規則の詳細

この規則は、flow の `direction` 文のうち、
前の `direction` 文が flow に与えた方向と違う方向を与えるものを報告する。
対象の図種は `agentflow` である。

`flow F` の後の `direction LR`、`A`、`direction BT`、`end` では、
flow は方向 `BT` を取り、`LR` は失われる。
同じ id の flow は 1 つの flow であり、
`F` の後の宣言の `direction` 文も、前の宣言が与えた方向を置き換える。
名前のない flow は、`subGraph` に、それより前に完了した
flow 宣言の数を続けた id を得る。同じ id の再宣言も数える。
名前のない 2 つの flow の id は異なる。
名前のない flow と、その生成 id を名前に持つ flow は合わされ、
その方向も比べる。
`direction` 文は、それが直接その本体にある flow について数え、
その外側の flow については数えない。

flow がすでに持つ方向を与える文は報告しない。
[flowchart の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)
が言うとおり、`TD` と `TB` は同じ上から下への方向であり、
`direction TD` の後の `direction TB` は報告しない。
mermaid.js は flow の `end` に達したときに方向を設定するので、
ほかの flow の中に書いた flow が先に設定され、その文はその順で比べる。

flow ごとに `direction` 文は 1 つにする。

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

## 背景

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1175-L1284)
は、flow の本体の最後の `direction` 文を取り、
同じ id の前の flow に後のものの方向を与える。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-duplicate-direction.ts)
- [テストのソース](../../tests/rules/agentflow-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->

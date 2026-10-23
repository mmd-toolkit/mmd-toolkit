# @mmd-toolkit/usecase-no-duplicate-direction

英語版: [usecase-no-duplicate-direction.md](./usecase-no-duplicate-direction.md)

前に設定した方向を置き換える `direction` 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ユースケース図は方向を 1 つ持つ。
後の `direction` 文は、前のものをエラーなしに置き換え、前の方向は失われる。

## 規則の詳細

この規則は、前の `direction` 文が与えた方向と違う方向を与える
`direction` 文を報告する。
対象の図種は `usecase` である。

`direction LR` と `direction BT` の後では、図は下から上へ描かれる。
どの文も方向を与えないときに図が持つ方向 `LR` は、書かれておらず、比べない。

図がすでに持つ方向を与える文は報告しない。
`TD` と `TB` は上から下への同じ方向で、
mermaid.js は `TD` を `TB` として読むので、
`direction TD` の後の `direction TB` は報告しない。
`direction LR` と `direction BT` の後の 3 つ目の `direction LR` は、
`BT` を置き換えるので報告する。

`direction` 文は 1 つにする。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-direction: error
usecase-beta
  direction LR
  direction BT
  A
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-direction: error
usecase-beta
  direction LR
  A
```

## オプション

この規則にはオプションがない。

## 背景

[`setDirection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L237-L239)
は `TD` を `TB` として各方向を記録し、
[モデル](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L350-L350)
は最後のものを取る。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-direction.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->

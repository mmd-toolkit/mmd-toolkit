# @mmd-toolkit/usecase-no-duplicate-direction

英語版: [usecase-no-duplicate-direction.md](./usecase-no-duplicate-direction.md)

前に設定した方向を置き換える `direction` 文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

ユースケース図は方向を 1 つ持つ。
mermaid.js は後の `direction` 文をエラーなしに受理し、前の方向を置き換える。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
前の文が与えた方向を変える `direction` 文を報告する。
現在の方向の繰り返しは報告しない。
最初の `direction` は、既定の `LR` を変えても報告しない。

`TD` と `TB` は上から下への同じ方向なので、
`direction TD` の後の `direction TB` は報告しない。
`direction LR` と `direction BT` の後の `direction LR` は、
`BT` を置き換えるので報告する。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-duplicate-direction.ts)
- [テストのソース](../../tests/rules/usecase-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->

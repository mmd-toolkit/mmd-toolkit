# @mmd-toolkit/block-no-edge-chain

英語版: [block-no-edge-chain.md](./block-no-edge-chain.md)

2 つ以上のリンクを持つ辺の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

辺の文は、`A --> B` のように 2 つのブロックをつなぐ。
mermaid.js は `A --> B --> C` もエラーなしに受理するが、
始点のない最後のリンクだけを残す。
意図したどちらの辺も描かれず、`A` も `B` も置かれない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
2 つ以上のリンクを持つ辺の文を、文ごとに 1 度報告する。
次の行のリンクも文を続けるので、`A --> B` の後の `--> C` も報告する。

ブロックを前に宣言していても、連なりは前のリンクを失うので報告する。
`A --> B B --> C` のように同じ行にあっても、別々の辺の文は報告しない。
複合ブロックの頭の連なりは、
[block-no-edge-in-composite-head](./block-no-edge-in-composite-head.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-edge-chain: error
block
  A --> B --> C
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-edge-chain: error
block
  A --> B
  B --> C
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-edge-in-composite-head](./block-no-edge-in-composite-head.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-edge-chain.ts)
- [テストのソース](../../tests/rules/block-no-edge-chain.test.ts)

<!-- end auto-generated rule resources -->

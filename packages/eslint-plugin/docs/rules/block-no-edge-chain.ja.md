# @mmd-toolkit/block-no-edge-chain

英語版: [block-no-edge-chain.md](./block-no-edge-chain.md)

2 つ以上のリンクを持つ辺の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

ブロック図の辺の文は、`A --> B` のように 2 つのブロックをつなぐ。
mermaid.js は `A --> B --> C` のようなリンクの連なりもエラーなしに受理するが、
最後のリンクだけを残し、そのリンクは始点を持たない。
連なりは `A` から `B` への辺も `B` から `C` への辺も描かず、
`A` も `B` も置かない。

## 規則の詳細

この規則は、2 つ以上のリンクを持つ辺の文を、文ごとに 1 度報告する。
対象の図種は `block` である。

ブロックを前に置いていても、連なりは前のリンクを失う。
`A B C` の後の連なり `A --> B --> C` は、始点のない `C` への辺を 1 本描く。
次の行に書いたリンクは文を続けるので、
`A --> B` の後の行 `--> C` も連なりである。
2 行に書いても、`A --> B B --> C` のように 1 行に書いても、
2 つの辺の文は両方の辺を描く。

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

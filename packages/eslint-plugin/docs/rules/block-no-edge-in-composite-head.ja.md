# @mmd-toolkit/block-no-edge-in-composite-head

英語版:
[block-no-edge-in-composite-head.md](./block-no-edge-in-composite-head.md)

複合ブロックの頭のリンクを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

複合ブロックは、`block:G`、そのブロック、`end` で書く。
mermaid.js は `block:G --> B` のような id の後のリンクも
エラーなしに受理するが、複合ブロックは id を持たず、リンクは失われる。
ブロック `G` はなく、辺は描かれず、`B` は置かれない。

## 規則の詳細

この規則は、1 つ以上のリンクを持つ複合ブロックの頭を、頭ごとに 1 度報告する。
対象の図種は `block` である。

頭のラベルや幅も id を残さない。
`block:G["Group"]:2 --> B` も、id もラベルもない複合ブロックを与える。
`block:G` の次の行のリンクも、`block:G` の後の行 `--> B` のように頭に属する。
複合ブロックをつなぐには、`G --> B` のように `end` の後に辺を書き、
複合ブロックの中のブロックの間の辺は、その本体に書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-edge-in-composite-head: error
block
  block:G --> B
    A
  end
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-edge-in-composite-head: error
block
  block:G
    A
  end
  G --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-edge-chain](./block-no-edge-chain.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-edge-in-composite-head.ts)
- [テストのソース](../../tests/rules/block-no-edge-in-composite-head.test.ts)

<!-- end auto-generated rule resources -->

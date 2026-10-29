# @mmd-toolkit/block-no-edge-in-composite-head

英語版:
[block-no-edge-in-composite-head.md](./block-no-edge-in-composite-head.md)

複合ブロックの頭のリンクを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

複合ブロックは、`block:G`、そのブロック、`end` で書く。
mermaid.js は `block:G --> B` のような id の後のリンクもエラーなしに受理する。
複合ブロックは id とリンクを失い、ブロック `G` はなく、辺は描かれず、
`B` は置かれない。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
1 つ以上のリンクを持つ複合ブロックの頭を、頭ごとに 1 度報告する。
ラベルや幅があっても、
`block:G["Group"]:2 --> B` は id とラベルを失うので報告する。

`block:G` の次の行のリンクも頭に属し、報告する。

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

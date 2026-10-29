# @mmd-toolkit/block-no-useless-width

英語版: [block-no-useless-width.md](./block-no-useless-width.md)

辺の最初のブロックの幅を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`A:2` のようなブロックの後の幅は、ブロックを 2 列にまたがらせる。
mermaid.js は `A:2 --> B`
のような辺の最初のブロックの幅もエラーなしに受理するが、捨てる。
ブロックは持っている幅のまま、または 1 列である。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
辺のリンクの前の幅が、ブロックが保つ幅と違うときに報告する。
保つ幅は最初の宣言の幅で、その宣言が辺のときや幅がないときは 1 列である。

`A:2` の後の `A:2 --> B` は幅を繰り返すので報告せず、
`A:3 --> B` と `A:1 --> B` は報告し、幅は 2 のままである。
ブロックが 1 列のときは、`A:1 --> B` を報告しない。
幅は数として比べるので、`A:02` は 2 列である。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-useless-width: error
block
  A:2 --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-useless-width: error
block
  columns 3
  A:2 B
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-duplicate-block](./block-no-duplicate-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-useless-width.ts)
- [テストのソース](../../tests/rules/block-no-useless-width.test.ts)

<!-- end auto-generated rule resources -->

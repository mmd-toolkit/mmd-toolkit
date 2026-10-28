# @mmd-toolkit/block-no-useless-width

英語版: [block-no-useless-width.md](./block-no-useless-width.md)

辺の最初のブロックの幅を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`A:2` のようなブロックの後の幅は、ブロックを 2 列にまたがらせる。
mermaid.js は `A:2 --> B` のような辺の最初のブロックの幅もエラーなしに受理するが、
リンクとともに捨てる。
ブロックは持っている幅のまま、または 1 列である。

## 規則の詳細

この規則は、辺のリンクの前の幅を、ブロックが持つ幅、
つまり最初の宣言の幅か 1 列と違うときに報告する。
対象の図種は `block` である。

`A:2` の後の辺 `A:2 --> B` は幅を繰り返し、報告しない。
`A:3 --> B` は報告し、幅は 2 のままである。
`A:1 --> B` は、ブロックがどのみち持つ幅を与え、報告しない。
幅は数として比べるので、`A:02` は 2 列である。
ブロックに幅を与えるには、辺の前で、`A:2` のように単独で宣言するところに書く。

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

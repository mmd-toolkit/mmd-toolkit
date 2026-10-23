# @mmd-toolkit/block-no-redefined-style

英語版: [block-no-redefined-style.md](./block-no-redefined-style.md)

前の `style` の文のスタイルを失わせる `style` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style A fill:#f00` は、ブロック `A` にスタイルを与える。
mermaid.js は同じブロックの 2 つ目の `style` をエラーなしに受理し、
それは並び全体を置き換える。
`style A fill:#f00` と `style A stroke:#00f` の後、ブロックは線だけを持ち、
塗りは失われる。

## 規則の詳細

この規則は、ブロックの `style` の文を、
ブロックが持つ並びのスタイルがその並びにないときに報告する。
対象の図種は `block` である。

スタイルを別の順で繰り返す並びや、スタイルを足す並びは、何も失わず、報告しない。
id の後に何もない `style` は何も変えず、比べない。
`style A ,` のような空の部分の並びは、スタイルを空のものに置き換え、報告する。
スタイルは、CSS が空白を読むとおりに比べる。
両端とコロンの前後の空白を除き、値の中の空白の連なりは 1 つの空白とする。
そのため `fill: #f00` はスタイル `fill:#f00`、
`border:1px  solid red` は `border:1px solid red` であり、
`style A fill:#f00, stroke:#00f` の後の `style A fill:#f00,stroke:#00f` は、
報告しない。
ほかの書き方は書いたとおりに比べ、`fill:#f00` の後の `fill:#F00` は報告する。
ブロックの `style` の文は、複合ブロックの中も含めてどこにあっても比べ、
`classDef` のスタイルは比べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-redefined-style: error
block
  A
  style A fill:#f00
  style A stroke:#00f
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/block-no-redefined-style: error
block
  A
  style A fill:#f00,stroke:#00f
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [block-no-duplicate-block](./block-no-duplicate-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/block-no-redefined-style.ts)
- [テストのソース](../../tests/rules/block-no-redefined-style.test.ts)

<!-- end auto-generated rule resources -->

# @mmd-toolkit/block-no-redefined-style

英語版: [block-no-redefined-style.md](./block-no-redefined-style.md)

前の `style` の文のスタイルを失わせる `style` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`style` は、ブロックにスタイルの一覧を与える。
mermaid.js は同じブロックの別の `style` をエラーなしに受理し、
一覧全体を置き換える。
後の線の指定で、前の塗りが失われることがある。

## 規則の詳細

この規則は、ブロック図（`block-beta`、`block`）に当てる。
ブロックがその時点で持つスタイルを一覧から落とす `style` の文を報告する。
スタイルの並べ替えや追加は報告しない。

id の後に何もない `style` は何も変えず、比べない。
`style A fill:#f00` の後の `style A ,` は、
空の部分が塗りを置き換えるので報告する。
比較では、両端とコロンの前後の空白を除き、
値の中の空白の連なりは 1 つの空白とする。
ほかの書き方は書いたとおりに比べるので、
`fill:#f00` の後の `fill:#F00` は報告する。

同じブロックの文は、複合ブロックをまたいで比べる。
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

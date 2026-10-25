# @mmd-toolkit/architecture-no-reversed-marker

英語版:
[architecture-no-reversed-marker.md](./architecture-no-reversed-marker.md)

逆の向きに書いた辺の矢じりを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

辺は、線の前の `<` で左の端へ、線の後の `>` で右の端へ向かう矢じりを持つ。
mermaid.js は線の前の `>` と線の後の `<` を、エラーなしに同じ矢じりとして読み、
矢じりは書いたのと逆の向きに描かれる。

## 規則の詳細

この規則は、線の前に `>` を持つか、線の後に `<` を持つ辺を報告する。
対象の図種は `architecture` で、ラベルのある辺もない辺も対象である。
両方を持つ辺は 1 度報告する。

`api:R >--< L:db` は、
両端へ向かう矢じりを持つ `api:R <--> L:db` として描かれる。
`api:R >-- L:db` は `api` へ向かう矢じりを持つ `api:R <-- L:db` として、
`api:R --< L:db` は `db` へ向かう矢じりを持つ `api:R --> L:db` として描かれる。

線の前の `<` と線の後の `>` は報告せず、
`api:R -[> -- <]- L:db` のような辺のラベルの中の `<` や `>` も、
文字なので報告しない。

左の端へ向かう矢じりは線の前に `<` で、
右の端へ向かう矢じりは線の後に `>` で書く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/architecture-no-reversed-marker: error
architecture-beta
  service api(server)[API]
  service db(database)[Database]
  api:R >--< L:db
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/architecture-no-reversed-marker: error
architecture-beta
  service api(server)[API]
  service db(database)[Database]
  api:R <--> L:db
```

## オプション

この規則にはオプションがない。

## 背景

[文法](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/architecture/architecture.langium#L31-L57)
は `<` と `>` を、どちらもそれが立つ端の矢じりとして読み、
[文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L99-L109)
は左に `<`、右に `>` を書く。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/architecture-no-reversed-marker.ts)
- [テストのソース](../../tests/rules/architecture-no-reversed-marker.test.ts)

<!-- end auto-generated rule resources -->

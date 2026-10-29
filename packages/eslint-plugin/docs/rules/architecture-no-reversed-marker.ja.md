# @mmd-toolkit/architecture-no-reversed-marker

英語版:
[architecture-no-reversed-marker.md](./architecture-no-reversed-marker.md)

逆の向きに書いた辺の矢じりを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

辺は、線の前の `<` で左の端へ、線の後の `>` で右の端へ向かう矢じりを持つ。
mermaid.js は線の前の `>` と線の後の `<` を、エラーなしに同じ矢じりとして読み、
矢じりは書いたのと逆の向きに描かれる。

## 規則の詳細

この規則は、アーキテクチャ図（`architecture-beta`）に当てる。
ラベルの有無によらず、線の前に `>` を持つか線の後に `<` を持つ辺を報告する。
両方を持つ辺は 1 度報告する。

線の前の `<` と線の後の `>` は報告しない。
辺のラベルの中の `<` や `>` も、文字なので報告しない。

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

## 参考

- [architecture の構文: 辺](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L99-L109)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/architecture-no-reversed-marker.ts)
- [テストのソース](../../tests/rules/architecture-no-reversed-marker.test.ts)

<!-- end auto-generated rule resources -->

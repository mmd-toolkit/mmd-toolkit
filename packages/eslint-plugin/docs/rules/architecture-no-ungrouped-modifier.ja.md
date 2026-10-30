# @mmd-toolkit/architecture-no-ungrouped-modifier

英語版:
[architecture-no-ungrouped-modifier.md](./architecture-no-ungrouped-modifier.md)

group に属さない辺の端の `{group}` 修飾子を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

辺の端の id の後の `{group}` は、
辺がその service の group の境界で group を出入りするようにし、
mermaid.js の文書は group の中の service にだけそれを認める。
group に属さない service や junction では、mermaid.js はエラーなしに受理し、
辺の端を group の境界があるはずの場所へ動かす。
辺は service に届かずに止まり、group は描かれない。

## 規則の詳細

この規則は、アーキテクチャ図（`architecture-beta`）に当てる。
`in` なしに宣言した service や junction の辺の端にある `{group}` を報告する。
そのような端が 2 つある辺は 2 度報告する。

group の中に宣言した service や junction の `{group}` は、
宣言が辺の後でも報告しない。
もう一方の端が group に属することは数えない。
辺のラベルの中の `{group}` は文字なので報告しない。
同じ group の 2 つの service や junction の間の辺の `{group}` も、
mermaid.js がエラーを出すので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/architecture-no-ungrouped-modifier: error
architecture-beta
  service api(server)[API]
  service db(database)[Database]
  api{group}:R --> L:db
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/architecture-no-ungrouped-modifier: error
architecture-beta
  group backend(cloud)[Backend]
  service api(server)[API] in backend
  service db(database)[Database]
  api{group}:R --> L:db
```

## オプション

この規則にはオプションがない。

## 参考

- [architecture の構文: group の辺](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/architecture.md#L111-L126)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/architecture-no-ungrouped-modifier.ts)
- [テストのソース](../../tests/rules/architecture-no-ungrouped-modifier.test.ts)

<!-- end auto-generated rule resources -->

# @mmd-toolkit/architecture-no-ungrouped-modifier

英語版:
[architecture-no-ungrouped-modifier.md](./architecture-no-ungrouped-modifier.md)

group に属さない辺の端の `{group}` 修飾子を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

辺の端の id の後の `{group}` は、
辺がその service の group の境界で group を出入りするようにし、
mermaid.js の文書は group の中の service にだけそれを認める。
group に属さない service や junction では、mermaid.js はエラーなしに受理し、
辺の端を group の境界があるはずの場所へ動かす。
辺は service に届かずに止まり、group は描かれない。

## 規則の詳細

この規則は、
`in` なしに宣言した service や junction の辺の端にある `{group}` を報告する。
対象の図種は `architecture` である。
そのような 2 つの端に `{group}` を持つ辺は 2 度報告する。

`api` がどの group にも属さない `api{group}:R --> L:db` では、
辺は `api` の右へ、group の余白に 4 を足した距離だけ離れて始まる。

group の中に宣言した service や junction の `{group}` は、
宣言が辺の後にあっても報告しない。
もう一方の端が group に属することは数えない。
辺のラベルの中の `{group}` は文字であり、報告しない。

辺を service につなぐには `{group}` を取り除き、
または `in` で service をその group の中に宣言する。

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

## 背景

[文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L111-L126) は、
group の中の service にだけ `{group}` を認める。
[Db](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/architectureDb.ts#L225-L236) は、
1 つの group の 2 つの service の間の辺の `{group}` を受理しないが、
group に属さない端のものは受理し、
[描画](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/architecture/svgDraw.ts#L54-L71) は `{group}` を持つすべての端を group の余白と 4 だけ動かす。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/architecture-no-ungrouped-modifier.ts)
- [テストのソース](../../tests/rules/architecture-no-ungrouped-modifier.test.ts)

<!-- end auto-generated rule resources -->

# @mmd-toolkit/gantt-no-duplicate-id

英語版: [gantt-no-duplicate-id.md](./gantt-no-duplicate-id.md)

前のタスクがすでに持つタスクの id を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

タスクの id は、`after`、`until`、`click` のために、1 つのタスクを名指す。
2 つのタスクが同じ id を持つとき、mermaid.js はエラーを出さず、
id は後のタスクを名指す。
最初のタスクに続けるつもりのタスクが、2 つ目のタスクに続く。
id の使い回しは、たいてい、タスクの行を写した残りである。

## 規則の詳細

この規則は、ガントチャート（`gantt`）に当てる。
前のタスクがすでに持つタスクの id を報告する。
タグの後の 3 つの項目の最初に書いた id だけを比べる。
id は大文字小文字を区別するので、`x` と `X` は異なる。

id を書いていないタスクに mermaid.js が付ける、
`task1` や `task2` のような id は比べない。
たとえば、`a : 1d` の後の `b : task1, 2024-01-01, 1d` は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-id: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :des1, 2024-01-09, 5d
  Test :after des1, 2d
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-id: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :des2, 2024-01-09, 5d
  Test :after des1, 2d
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [gantt-no-undef](./gantt-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-duplicate-id.ts)
- [テストのソース](../../tests/rules/gantt-no-duplicate-id.test.ts)

<!-- end auto-generated rule resources -->

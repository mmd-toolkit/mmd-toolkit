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

この規則は、前のタスクが同じ id を持つとき、タスクの id を報告する。
対象の図種は `gantt` である。

`Design :des1, 2024-01-06, 3d` と `Build :des1, 2024-01-09, 5d` の後、
`Test :after des1, 2d` は `Build` の後に始まり、
`click des1 href "…"` は `Build` だけをリンクにする。
データが 1 つの項目を持つタスクは、その前のタスクの終わりに始まり、
mermaid.js はその前のタスクも id で探す。
`a : x, 2024-01-01, 1d` の後のタスク `b : 1d` は、
`a` の終わりでなく、後に書いた `c : x, 2024-03-01, 1d` の終わりに始まる。

比べる id は、タグの後の 3 つの項目の最初に書いたものである。
mermaid.js が id のないタスクに与える `task1`、`task2` のような id は比べない。
`a : 1d` の後の `b : task1, 2024-01-01, 1d` は報告しない。
id は大文字小文字も含めて比べる。
`x` と `X` は 2 つの id である。

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

## 背景

mermaid.js は id ごとに 1 つのタスクを持ち、
それぞれのタスクは、同じ id で前に持っていたタスクを置き換える
（[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L588-L590)）。
データが 1 つの項目を持つタスクは、その前のタスクの id を持ち、
チャートを描くときにその id を探す
（[`compileTasks`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L624-L625)）。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-duplicate-id.ts)
- [テストのソース](../../tests/rules/gantt-no-duplicate-id.test.ts)

<!-- end auto-generated rule resources -->

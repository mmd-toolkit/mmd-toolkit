# @mmd-toolkit/gantt-no-undef

英語版: [gantt-no-undef.md](./gantt-no-undef.md)

どのタスクの id でもない id を指す `click`、`after`、`until` を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`click` はリンクにするタスクを、`after` はその後にタスクを始めるタスクを、
`until` はその開始でタスクを終えるタスクを、id で名指す。
id がどのタスクのものでもないとき、mermaid.js はエラーを出さない。
`click` はどのタスクもリンクにせず、
`after` と `until` はタスクの開始や終わりを今日の日付にする。
id を書き間違えると、タスクは今日に動く。

## 規則の詳細

この規則は、ガントチャート（`gantt`）に当てる。
`click`、`after`、`until` の各 id のうち、
チャートのどのタスクも持たないものを報告する。

明示したタスクの id と、
mermaid.js が付ける `task1` のような id を定義済みと数え、
大文字小文字を区別して比べる。
タグの後の項目が 3 つなら最初が id で、
1 つか 2 つなら mermaid.js がテキストの順に `task1`、
`task2` のような id を付ける。
データの項目が 4 つ以上のタスクは id を持たない。

`after` は開始の項目（2 つの最初か 3 つの 2 つ目）、
`until` は終了の項目（1 つから 3 つの最後）で調べる。
どちらも小文字で、その後に空白が必要である。
id は ASCII の英字、数字、`_`、`-`、空白からなり、空白で分ける。
`after a.1` は `a` を名指し、`a.1` という id のタスクがあっても報告する。
`after a設計` も同じで、id の間のタブは一覧を終える。

`after 設計` のように空白の後にそうした文字がない項目は報告しない。
mermaid.js はその項目を日付として読み、読めずにチャートを描かない。
`After a2`、`Until b1`、項目が 4 つ以上のデータも調べない。
後で定義するタスクは `click` でも定義済みと数えるが、
mermaid.js はタスクより前の `click` では何もしない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  click des2 href "https://example.com"
```

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :after des2, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Review :2024-01-01, until des2
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :after des1, 5d
  click des1 href "https://example.com"
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-undef](./flowchart-no-undef.ja.md)
- [gantt-no-duplicate-id](./gantt-no-duplicate-id.ja.md)

## 参考

- [Issue #4424: gantt の `after` が考慮されないことがある](https://github.com/mermaid-js/mermaid/issues/4424)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-undef.ts)
- [テストのソース](../../tests/rules/gantt-no-undef.test.ts)

<!-- end auto-generated rule resources -->

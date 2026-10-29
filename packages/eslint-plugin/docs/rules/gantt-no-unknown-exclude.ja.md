# @mmd-toolkit/gantt-no-unknown-exclude

英語版: [gantt-no-unknown-exclude.md](./gantt-no-unknown-exclude.md)

`weekends` でも曜日の名前でもない `excludes` の語を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

`excludes` は、タスクのかかる時間から日を除く。
`weekends`、`sunday` のような曜日、日付である。
mermaid.js はそこにどんな語も受理し、どれでもない語は、
エラーなしに何の日も除かない。
`weekend` のように語を書き間違えると、タスクは週末を通して続く。

## 規則の詳細

この規則は、ガントチャート（`gantt`）に当てる。
`excludes` の項目のうち、数字を持たず、
`weekends` でも曜日の英語名 `monday` から `sunday`
の完全な形でもないものを報告する。
`sat` のような略記と、語 `weekdays` は報告する。
大文字小文字は区別しないので、`WeekEnds` と `Friday` は報告しない。

数字を持つ項目は日付として読まれ、調べない。
`dateFormat YYYY-MM-DD` での `excludes 06-01-2024` のように、
どの日も除かなくても同じである。
`includes` の項目も調べない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes weekend
  Design :2024-01-05, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes sat, sun
  Design :2024-01-05, 3d
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes weekends
  Design :2024-01-05, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes saturday, sunday, 2024-01-08
  Design :2024-01-05, 3d
```

## オプション

この規則にはオプションがない。

## 参考

- [ガントチャートの構文: excludes](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L131)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-unknown-exclude.ts)
- [テストのソース](../../tests/rules/gantt-no-unknown-exclude.test.ts)

<!-- end auto-generated rule resources -->

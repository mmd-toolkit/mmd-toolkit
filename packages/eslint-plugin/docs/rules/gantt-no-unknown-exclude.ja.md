# @mmd-toolkit/gantt-no-unknown-exclude

英語版: [gantt-no-unknown-exclude.md](./gantt-no-unknown-exclude.md)

`weekends` でも曜日の名前でもない `excludes` の語を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`excludes` は、タスクのかかる時間から日を除く。
`weekends`、`sunday` のような曜日、日付である。
mermaid.js はそこにどんな語も受理し、どれでもない語は、
エラーなしに何の日も除かない。
`weekend` のように語を書き間違えると、タスクは週末を通して続く。

## 規則の詳細

この規則は、`excludes` の文の項目のうち、数字を持たず、
大文字小文字を問わず `weekends` でも、
曜日の名前（`monday` から `sunday`）でもないものを報告する。
対象の図種は `gantt` である。

`excludes weekend` の後、タスク `Design :2024-01-05, 3d` は、
1 月 5 日の金曜日から週末を含めた 3 日を取る。
`excludes weekends` の後は、週末を飛ばして火曜日に終わる。
`excludes sat, sun` も同じで、`sat` と `sun` の両方を報告する。
mermaid.js の文書が取らない語として挙げる `excludes weekdays` も同じである。
大文字小文字は問わない。
`excludes WeekEnds, Friday` は週末と金曜日を除く。

数字を持つ項目は日付で、mermaid.js はそれを、`YYYY-MM-DD` と、
`dateFormat` の形で書いたチャートの日付と比べる。
規則は日付を調べない。
`dateFormat YYYY-MM-DD` での `excludes 06-01-2024` はどの日も除かないが、
報告しない。
`includes` の項目も報告しない。

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

## 背景

mermaid.js は `excludes` の項目を小文字にし、一覧が `weekends` を持ち、
その日が週末にあるとき、その日の英語の名前を持つとき、
`dateFormat` の形か `YYYY-MM-DD` で書いたその日の日付を持つときに、
その日を除く（[`isInvalidDate`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L183-L201)）。
その文書（[syntax/gantt.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L131)）は、
`excludes` が `YYYY-MM-DD` の日付、曜日、`weekends` を取り、
語 `weekdays` は取らないと言う。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-unknown-exclude.ts)
- [テストのソース](../../tests/rules/gantt-no-unknown-exclude.test.ts)

<!-- end auto-generated rule resources -->

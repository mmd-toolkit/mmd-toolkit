# @mmd-toolkit/gantt-no-duplicate-setting

英語版: [gantt-no-duplicate-setting.md](./gantt-no-duplicate-setting.md)

設定をもう一度設定する設定の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`dateFormat`、`axisFormat`、`tickInterval`、`todayMarker`、`weekday`、
`weekend` は、それぞれチャート全体に 1 つの値を設定する。
mermaid.js はそうした文をすべて受理し、
それぞれが前に設定した値を、その前に書いたタスクの分も、黙って置き換える。
2 つ目の文は、たいてい、一部分を 2 回貼り付けた残りか、
後のタスクの設定を変えるつもりで書いたものである。

## 規則の詳細

この規則は、これら 6 つの設定の文のうち、
同じ設定の最初のものより後のものをすべて報告する。
対象の図種は `gantt` である。

`dateFormat DD-MM-YYYY`、`Design :01-02-2024, 3d`、`dateFormat YYYY-MM-DD`、
`Build :2024-02-05, 5d` の後、mermaid.js は両方のタスクの日付を
`YYYY-MM-DD` で読む。
`01-02-2024` はその形の日付でなく、
mermaid.js はそれを JavaScript の `Date` に渡し、
Node.js ではそれを 2 月 1 日でなく 2024 年 1 月 2 日と読む。
ほかの設定も同じように置き換わる。
`axisFormat %m-%d` と `axisFormat %d` の後、軸は日だけを示す。
同じ値を繰り返す文も報告する。

`excludes` と `includes` は報告しない。
mermaid.js は、そうした文のすべての項目を合わせる。
2 つ目の `inclusiveEndDates` も、何も変えないので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat DD-MM-YYYY
  Design :01-02-2024, 3d
  dateFormat YYYY-MM-DD
  Build :2024-02-05, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat YYYY-MM-DD
  axisFormat %m-%d
  axisFormat %d
  Design :2024-01-06, 3d
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat YYYY-MM-DD
  axisFormat %m-%d
  Design :2024-02-01, 3d
  Build :2024-02-05, 5d
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [gantt-no-duplicate-title](./gantt-no-duplicate-title.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-duplicate-setting.ts)
- [テストのソース](../../tests/rules/gantt-no-duplicate-setting.test.ts)

<!-- end auto-generated rule resources -->

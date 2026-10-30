# @mmd-toolkit/gantt-no-duplicate-setting

英語版: [gantt-no-duplicate-setting.md](./gantt-no-duplicate-setting.md)

設定をもう一度設定する設定の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`dateFormat`、`axisFormat`、`tickInterval`、`todayMarker`、`weekday`、
`weekend` は、それぞれチャート全体に 1 つの値を設定する。
mermaid.js は後の設定をエラーなしに受理し、それより前のタスクにも適用するので、
前の設定は失われる。

## 規則の詳細

この規則は、ガントチャート（`gantt`）に当てる。
`dateFormat`、`axisFormat`、`tickInterval`、`todayMarker`、`weekday`、
`weekend` の文が、その設定の現在の値を別の値に置き換えるときに報告する。
現在の値を繰り返しても報告しない。

値は、キーワードとその後の空白 1 つより後のテキストを、空白も含めて比べる。
`weekday` と `weekend` は小文字にして比べるので、
`weekday monday` の後の `weekday Monday` は報告しない。
別の値の後で以前の値に戻しても報告する。
`dateFormat DD-MM-YYYY` の後の `dateFormat YYYY-MM-DD` は、
前に `YYYY-MM-DD` を使っていても、それを置き換える。

`excludes` と `includes` は、mermaid.js が項目を合わせるので報告しない。
`inclusiveEndDates` の繰り返しも、何も変えないので報告しない。

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

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-02-01, 3d
  dateFormat YYYY-MM-DD
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

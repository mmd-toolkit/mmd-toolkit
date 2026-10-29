# @mmd-toolkit/gantt-no-invalid-tag

英語版: [gantt-no-invalid-tag.md](./gantt-no-invalid-tag.md)

タスクのデータの中で、mermaid.js がタグとして読まないタグを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

タグ `active`、`done`、`crit`、`milestone`、`vert` がタスクに印を付けるのは、
データの先頭に小文字で書き、コンマを付けたときだけである。
タスクの開始や終了の場所に、違う大文字小文字（`DONE`）や、
タグの間のコンマなし（`done crit`）や、
ほかの項目の後（`a : 2024-01-01, done`）で書いたタグの語は、日付として読まれ、
タスクは開始や終了を失う。

## 規則の詳細

この規則は、ガントチャート（`gantt`）に当てる。
タスクのデータの開始か終了の項目で、最初の語が大文字小文字を問わず `active`、
`done`、`crit`、`milestone`、`vert` のものを報告する。
データの先頭に、それぞれ小文字でコンマを付けて書いたタグは、
前後に空白があっても報告しない。

タグの後の項目が 1 つなら終了、2 つなら開始と終了、
3 つなら id と開始と終了である。
id は調べないので、3 つの項目の最初の `Done` や `done crit` は報告しない。
4 つ以上の項目のデータは、mermaid.js がそれでチャートを描けないので調べない。
`criteria` のようにタグで始まるだけの語は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :DONE, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :done crit, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, done
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, crit, des1, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :Done, 2024-01-06, 3d
```

## オプション

この規則にはオプションがない。

## 参考

- [ガントチャートの構文: タグ](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L69)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-invalid-tag.ts)
- [テストのソース](../../tests/rules/gantt-no-invalid-tag.test.ts)

<!-- end auto-generated rule resources -->

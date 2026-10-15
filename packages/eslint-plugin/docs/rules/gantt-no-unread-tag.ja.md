# @mmd-toolkit/gantt-no-unread-tag

英語版: [gantt-no-unread-tag.md](./gantt-no-unread-tag.md)

タスクのデータの中で、mermaid.js がタグとして読まないタグを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

タスクの開始や終わりの場所にあるタグは、タグとして読まれない。
mermaid.js はその語を日付として読むが、それは日付でなく、
タスクは開始や終わりを失う。
これが起きるのは、`DONE` のように違う大文字小文字で書いたタグ、
`done crit` のように間のコンマなしに書いたタグ、
`a : 2024-01-01, done` のように、ほかの項目の後に書いたタグである。
タグ `active`、`done`、`crit`、`milestone`、`vert` がタスクに印を付けるのは、
データの先頭で、それぞれ小文字で、後にコンマを付けて書いたときだけである。

## 規則の詳細

この規則は、タスクのデータの項目のうち、
タスクの開始か終わりであり、
最初の語が大文字小文字を問わずタグであるものを報告する。
対象の図種は `gantt` である。

タスクのデータは、タグの後に 1 つから 3 つの項目を持つ。
終わり、開始と終わり、id と開始と終わり、のどれかである。
`b : DONE, 1d` の開始は `DONE` であり、
`b : done crit, 1d` の開始は `done crit` である。
mermaid.js はその開始を読めず、チャートを描かない。
`a : 2024-01-01, done` の終わりは `done` で、
タスクは始まったところで終わり、長さを持たない。
項目が 1 つの `b : Done` では、その項目が終わりで、同じである。

id は調べない。
`Design :Done, 2024-01-06, 3d` は id が `Done` のタスクであり、
`Design :done crit, 2024-01-06, 3d` は id が `done crit` のタスクである。
どちらも書いたとおりの開始と終わりを持ち、
mermaid.js は最初の項目を、どんな語でもよい id として読むので、
規則は報告しない。

4 つ以上の項目のデータは調べない。
mermaid.js はその項目をどれも読まず、チャートを描けない。
`A :a1, crit, 2024-01-01, 1d` がそうである。

先頭に、コンマを付けて書いたタグは、タグとして読まれ、報告しない。
`a :  done , crit ,1d` のように、まわりに空白があっても同じである。
タグの文字で始まるだけの語はタグでない。
終わり `criteria` は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :DONE, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :done crit, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, done
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, crit, des1, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :Done, 2024-01-06, 3d
```

## オプション

この規則にはオプションがない。

## 背景

mermaid.js は、端の空白を除いた最初の項目が小文字のそれらの語のどれかである間、
データの先頭からタグを取る
（[`getTaskTags`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L846-L860)）。
その文書
（[syntax/gantt.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L69)）
は、タグ `active`、`done`、`crit`、`milestone` を小文字で挙げ、
タグを最初に書くと言う。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-unread-tag.ts)
- [テストのソース](../../tests/rules/gantt-no-unread-tag.test.ts)

<!-- end auto-generated rule resources -->

# @mmd-toolkit/gantt-no-unread-tag

英語版: [gantt-no-unread-tag.md](./gantt-no-unread-tag.md)

タスクのデータの中で、mermaid.js がタグとして読まないタグを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

タグ `active`、`done`、`crit`、`milestone`、`vert` は、タスクに印を付ける。
タグはデータの先頭に、それぞれ小文字で、後にコンマを付けて書く。
ほかの大文字小文字で書くか、コンマを落とすか、ほかの項目の後に書くと、
タグは項目として読まれる。
mermaid.js はエラーを出さず、タスクに印は付かず、
その項目が id、開始、終わりのどれかの場所を取る。

## 規則の詳細

この規則は、タスクのデータの項目のうち、
最初の語が大文字小文字を問わずタグであり、
mermaid.js がタグとして読まないものを報告する。
対象の図種は `gantt` である。

`Design :Done, 2024-01-06, 3d` は id が `Done` のタスクで、
済んでいないタスクとして描かれる。
`Design :done crit, 2024-01-06, 3d` は id が `done crit` でタグを持たず、
`Design :done des1, 2024-01-06, 3d` は id が `done des1` でタグを持たない。
項目が 2 つなら、その語は開始の場所を取る。
`a : DONE, 1d` の開始は `DONE` で、これは日付でない。
ほかの項目の後のタグも、項目である。
`a : 1d, done` では `done` が終わりになる。

4 つ以上の項目のデータは調べない。
mermaid.js はその項目をどれも読まず、チャートを描けない。
`A :a1, crit, 2024-01-01, 1d` がそうである。

先頭に、コンマを付けて書いたタグは、タグとして読まれ、報告しない。
`a :  done , crit ,1d` のように、まわりに空白があっても同じである。
タグの文字で始まるだけの語はタグでない。
id `critical` は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :Done, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done crit, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done des1, 2024-01-06, 3d
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

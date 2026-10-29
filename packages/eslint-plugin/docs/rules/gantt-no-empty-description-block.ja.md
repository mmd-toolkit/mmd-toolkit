# @mmd-toolkit/gantt-no-empty-description-block

英語版:
[gantt-no-empty-description-block.md](./gantt-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

`accDescr` のブロックは、図に説明を与えるために書く。
何も持たないか空白だけを持つと、mermaid.js はエラーなしに受理し、
説明を変えない。

## 規則の詳細

この規則は、ガントチャート（`gantt`）に当てる。
何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。

コメントだけを持つブロックは、何もしない意図をコメントが示すので報告しない。
コメント行とディレクティブを持つブロックも報告しない。

`accDescr {} a : 1d` のように、ほかの文の行にある空のブロックも報告する。
タイトル、設定、タスクのテキストの中やタスクのデータの中の `accDescr {}` は、
そのテキストの一部なので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr {}
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr { }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr { y }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr {
    %% old description
  }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [gantt-no-duplicate-description](./gantt-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/gantt-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/gantt-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

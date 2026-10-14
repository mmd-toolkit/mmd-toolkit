# @mmd-toolkit/gantt-no-empty-description-block

英語版:
[gantt-no-empty-description-block.md](./gantt-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、チャートに説明を与えるために書く。
ブロックが何も持たないか、空白しか持たないとき、
mermaid.js はそれを受理して何もしないので、ブロックは効果を持たない。

## 規則の詳細

この規則は、何も持たないか空白しか持たない `accDescr` のブロックを報告する。
対象の図種は `gantt` である。
ブロックの中の指令はテキストでない。
指令しか持たないブロックも報告し、mermaid.js はその設定をなお適用する。

説明は、ブロックの前のままである。
`accDescr: a` の後のブロック `accDescr {}` は、説明を `a` のままにする。

コメントしか持たないブロックは報告しない。
説明の行をコメントにした書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
コメント行を持つブロックは、ほかに指令を持つときも報告しない。
mermaid.js はその設定を適用する。

空のブロックは、ほかの文の行にも書ける。
`gantt accDescr {}` のようにヘッダーの後、
`accDescr {} a : 1d` のようにタスクの前、`click` の文の後、
そしてほかの空のブロックの隣である。
そこでも説明を設定せず、規則はどのブロックも同じように報告する。
タイトル、設定、タスクのテキストの中と、タスクのデータの中では、
`accDescr {}` はそのテキストの一部であり、規則は報告しない。

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

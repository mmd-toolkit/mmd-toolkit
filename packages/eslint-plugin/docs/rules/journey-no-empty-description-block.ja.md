# @mmd-toolkit/journey-no-empty-description-block

英語版:
[journey-no-empty-description-block.md](./journey-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、ジャーニーに説明を与えるために書く。
ブロックが何も持たないか、空白しか持たないとき、
mermaid.js はそれを受理して何もしないので、ブロックは効果を持たない。

## 規則の詳細

この規則は、何も持たないか空白しか持たない `accDescr` のブロックを報告する。
対象の図種は `journey` である。
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
`journey accDescr {}` のようにヘッダーの後、
`accDescr {} A: 5` のようにタスクの前、ほかのブロックの後、
そしてほかの空のブロックの隣である。
そこでも説明を設定せず、規則はどのブロックも同じように報告する。
タイトル、セクション、タスクのテキストの中と、タスクのデータの中では、
`accDescr {}` はそのテキストの一部であり、規則は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr {}
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr { }
  section Work
    Make tea: 5: Me
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr { y }
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr {
    %% old description
  }
  section Work
    Make tea: 5: Me
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.ja.md)
- [journey-no-duplicate-description](./journey-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/journey-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/journey-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

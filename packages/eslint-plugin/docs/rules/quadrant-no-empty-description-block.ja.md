# @mmd-toolkit/quadrant-no-empty-description-block

英語版:
[quadrant-no-empty-description-block.md](./quadrant-no-empty-description-block.md)

説明を持たない説明のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

説明のブロックは、チャートに説明を与えるために書く。
ブロックが何も持たないか空白しか持たないとき、
mermaid.js はそれを受理して何もしないので、ブロックは効かない。

## 規則の詳細

この規則は、`accDescr` のブロックのうち、
何も持たないか、空白だけか、改行だけを持つものを報告する。
対象の図種は `quadrantChart` である。
ブロックの中の指令はテキストでない。
指令しか持たないブロックも報告し、mermaid.js はその設定をなお適用する。
キーワードは大文字小文字を問わず読む。

説明は、ブロックの前のままである。
`accDescr: d` の後のブロック `accDescr {}` は、説明を `d` のままにする。

コメントしか持たないブロックは報告しない。
説明の行をコメントにした書き手は、ブロックが何もしないことを意図しており、
mermaid.js もそう読む。
後で埋めるために残すブロックは、`accDescr {`、`%% TODO`、`}` のように、
中にコメントを書く。
そうしたブロックは報告しない。

空のブロックは、`accDescr {} A: [0.3, 0.6]` や `A: [0.3, 0.6] accDescr {}`
のように、点の行の、その前にも後にも書ける。
そこでも説明を設定せず、規則は同じように報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr {}
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr { }
  A: [0.3, 0.6]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr {
    Campaigns by reach
  }
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr {
    %% TODO
  }
  A: [0.3, 0.6]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-duplicate-description](./quadrant-no-duplicate-description.ja.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/quadrant-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

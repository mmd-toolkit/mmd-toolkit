# @mmd-toolkit/quadrant-no-empty-description-block

英語版:
[quadrant-no-empty-description-block.md](./quadrant-no-empty-description-block.md)

説明を持たない説明のブロックを禁止する。

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

この規則は、象限チャート（`quadrantChart`）に当てる。
何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を適用する。
キーワードは大文字小文字を問わず読む。

コメントだけを持つブロックは、何もしない意図をコメントが示すので報告しない。

同じ行の点の前や後の空のブロックも報告する。

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

# @mmd-toolkit/pie-no-empty-description-block

英語版: [pie-no-empty-description-block.md](./pie-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、空の `accDescr {}` のブロックをエラーなしに受理する。
最初に書くと何も変えず、説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、円グラフ（`pie`）に当てる。
括弧の間に何もないか、空白だけがある `accDescr` のブロックを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を当てる。

括弧の間にコメント行を持つブロックは、この規則では報告しない。
説明の後では、そのブロックも説明を空にし、
[pie-no-duplicate-description](./pie-no-duplicate-description.ja.md)
が報告する。
`accDescr {} %% later` のような括弧の外のコメントは、報告を防がない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-empty-description-block: error
pie
  accDescr {}
  "A" : 1
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/pie-no-empty-description-block: error
pie
  accDescr {
    Revenue by product
  }
  "A" : 1
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [pie-no-duplicate-description](./pie-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/pie-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/pie-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

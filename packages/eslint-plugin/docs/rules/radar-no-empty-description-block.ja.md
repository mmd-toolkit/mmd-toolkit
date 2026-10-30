# @mmd-toolkit/radar-no-empty-description-block

英語版:
[radar-no-empty-description-block.md](./radar-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、何もない `accDescr {}` のブロックをエラーなしに受理する。
そのブロックは説明を空にし、最初に書くと何も変えず、
説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、レーダーチャート（`radar-beta`）に当てる。
括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブは説明の文字ではないので、
ディレクティブだけのブロックも報告するが、mermaid.js はその設定を当てる。

括弧の間にコメント行を持つブロックは報告しない。
コメント行だけのブロックは前の説明を空にし、
空でない説明の後では
[radar-no-duplicate-description](./radar-no-duplicate-description.ja.md)
が報告する。
`accDescr {} %% later` のような括弧の外のコメントは、報告を防がない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-empty-description-block: error
radar-beta
  accDescr {}
  axis A, B, C
  curve sales{1, 2, 3}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/radar-no-empty-description-block: error
radar-beta
  accDescr {
    Sales by region
  }
  axis A, B, C
  curve sales{1, 2, 3}
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [radar-no-duplicate-description](./radar-no-duplicate-description.ja.md)
- [radar-no-unclosed-description-block](./radar-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/radar-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/radar-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

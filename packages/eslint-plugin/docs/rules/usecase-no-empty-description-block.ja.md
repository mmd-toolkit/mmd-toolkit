# @mmd-toolkit/usecase-no-empty-description-block

英語版:
[usecase-no-empty-description-block.md](./usecase-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、閉じた空の `accDescr {}` のブロックをエラーなしに受理する。
最初に書くと何も変えず、説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
何もないか空白だけがある、閉じた `accDescr` のブロックを報告する。
ディレクティブだけを持つブロックも報告するが、mermaid.js はその設定を当てる。

コメント行だけを持つブロックは、この規則では報告しない。
説明の後では、そのブロックも説明を空にし、
[usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md)
が報告する。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-empty-description-block: error
usecase-beta
  A
  accDescr {}
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-empty-description-block: error
usecase-beta
  A
  accDescr {
    The steps of a sign-in
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/usecase-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

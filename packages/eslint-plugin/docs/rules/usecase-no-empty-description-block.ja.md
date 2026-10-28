# @mmd-toolkit/usecase-no-empty-description-block

英語版:
[usecase-no-empty-description-block.md](./usecase-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、何もない閉じた `accDescr { }` のブロックをエラーなしに受理する。
そのブロックは空の説明を設定し、最初に書くと何も変えず、
説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、何も持たないか空白だけを持つ閉じた `accDescr` のブロックを報告する。
対象の図種は `usecase` である。
ブロックの中の指示子は文字ではない。
指示子だけを持つブロックも報告し、mermaid.js はその設定を当てる。

`accDescr: x` の後のブロック `accDescr { }` は空の説明を残し、`x` は失われる。
前に説明がなければ説明は空のままで、ブロックは何も変えない。

コメント行だけを持つブロックは報告しない。
後で埋めるブロックは、 `accDescr {`、`%% TODO`、
`}` のようにコメントを入れて書き、最初に書くと何も変えない。
説明の後では、そのようなブロックもそれを取り除き、
[usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md) が報告する。

説明を書くか、ブロックを取り除く。

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

## 背景

[`accDescr` 文](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L132-L140) はブロックに括弧の間の文字を与え、
空のブロックではそれは空であり、
[モデル](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L243-L245) はそれを説明として保つ。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/usecase-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

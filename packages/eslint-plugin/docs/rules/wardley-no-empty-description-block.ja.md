# @mmd-toolkit/wardley-no-empty-description-block

英語版:
[wardley-no-empty-description-block.md](./wardley-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、何もない `accDescr { }` のブロックをエラーなしに受理する。
そのブロックは説明を空にし、最初に書くと何も変えず、
説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを
報告する。
対象の図種は `wardley` である。
ブロックの中の指示子は文字ではない。
指示子だけを持つブロックも報告し、mermaid.js はその設定を当てる。

`accDescr: x` の後のブロック `accDescr { }` は説明を空にし、`x` は失われる。
前に説明がなければ説明は空のままで、ブロックは何も変えない。

括弧の間にコメント行を持つブロックは報告しない。
後で埋めるブロックは、
`accDescr {`、`%% TODO`、`}` のようにコメントを入れて書き、
最初に書くと何も変えない。
説明の後では、そのようなブロックもそれを取り除き、
[wardley-no-duplicate-description](./wardley-no-duplicate-description.ja.md)
が報告する。
`accDescr {} %% later` のように `{` の前や `}` の後にあるコメントは
ブロックの中になく、そのブロックは報告する。

説明を書くか、ブロックを取り除く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-empty-description-block: error
wardley-beta
  accDescr {}
  component API [0.6, 0.7]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/wardley-no-empty-description-block: error
wardley-beta
  accDescr {
    The parts of a service
  }
  component API [0.6, 0.7]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [wardley-no-duplicate-description](./wardley-no-duplicate-description.ja.md)

## 背景

[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L61-L68)
は、空のブロックに空の説明を与える。
パーサーは最後の説明を保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
は空でない説明だけを設定するので、最後に書いた空のブロックは説明を空にする。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/wardley-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/wardley-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

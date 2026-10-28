# @mmd-toolkit/eventmodeling-no-empty-description-block

英語版:
[eventmodeling-no-empty-description-block.md](./eventmodeling-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、何もない `accDescr { }` のブロックをエラーなしに受理する。
そのブロックは自分の説明を与えない。
mermaid.js は `accDescr {}` のような文の文字を説明として設定し、
説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、
括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
対象の図種は `eventmodeling` である。
ブロックの中の指示子は文字ではない。
指示子だけを持つブロックも報告し、mermaid.js はその設定を当てる。

`accDescr: x` の後のブロック `accDescr {}` は、説明をブロックの文字、
つまり前に空白の付いた `accDescr {}` で置き換え、`x` は失われる。
前に説明がなくても、説明はその文字になり、キーワードと括弧だけで、
書き手の説明はない。

括弧の間にコメント行を持つブロックは報告しない。
後で埋めるブロックは、 `accDescr {`、`%% TODO`、
`}` のようにコメントを入れて書く。
説明の後では、そのようなブロックもそれを取り除き、
[eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.ja.md) が報告する。
`accDescr {} %% later` のように `}` の後にあるコメントはブロックの中になく、
そのブロックは報告する。

説明を書くか、ブロックを取り除く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-empty-description-block: error
eventmodeling accDescr {}
  tf 01 evt Bought
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-empty-description-block: error
eventmodeling accDescr { Checkout flow }
  tf 01 evt Bought
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-empty-description-block: error
eventmodeling accDescr {
%% TODO
}
  tf 01 evt Bought
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.ja.md)

## 背景

`accDescr` の [終端記号](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L60) は、
空のブロックでも文全体を取り、
[値の変換](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L41) はそれを変換しない。
パーサーは最後の説明を保ち、
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14) は、
それが空になることはないので、それを設定する。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

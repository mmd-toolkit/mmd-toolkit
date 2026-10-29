# @mmd-toolkit/eventmodeling-no-empty-description-block

英語版:
[eventmodeling-no-empty-description-block.md](./eventmodeling-no-empty-description-block.md)

説明を持たない `accDescr` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、何もない `accDescr {}` のブロックをエラーなしに受理する。
そのブロックは自分の説明を与えない。
mermaid.js は `accDescr {}` のような文の文字を説明として設定し、
説明の後に書くとその説明を取り除く。

## 規則の詳細

この規則は、イベントモデリング図（`eventmodeling`）に当てる。
括弧の間に何も持たないか空白だけを持つ `accDescr` のブロックを報告する。
ディレクティブは説明の文字ではないので、
ディレクティブだけのブロックも報告するが、mermaid.js はその設定を当てる。

括弧の間にコメント行を持つブロックは報告しない。
コメント行だけのブロックは前の説明を取り除き、
説明の後では
[eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.ja.md)
が報告する。
`accDescr {} %% later` のような括弧の外のコメントは、報告を防がない。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-empty-description-block.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->

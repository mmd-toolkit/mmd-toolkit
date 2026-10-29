# @mmd-toolkit/usecase-no-unclosed-description-block

英語版:
[usecase-no-unclosed-description-block.md](./usecase-no-unclosed-description-block.md)

後の文のために書いた `}` が閉じる `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`accDescr {` のブロックは、その `{` の後の最初の `}` まで続く。
自分の `}` がなく、
`actor C@{ type: hollow }` のメタデータのように後の文が `}` を持つと、
mermaid.js はエラーなしにそこでブロックを閉じ、
そこまでの文は説明になって消える。

## 規則の詳細

この規則は、後の文の `}` が閉じる `accDescr {` のブロックを報告する。
対象の図種は `usecase` である。
どの `}` も閉じないブロックは mermaid.js が受理せず、この規則はそれを見ない。

ブロックの `{` の後の最初の `}` までのすべての文字は、
`{` も含めてその文字である。
`accDescr { first` の後の行 `A --> B`、`actor C@{ type: hollow }`、`D` は、
説明 `first`、`A --> B`、`actor C@{ type: hollow` と、
ユースケース `D` だけを与え、関係とアクターは失われる。
ブロックの中のコメント行は文字ではなく、その中の `}` は何も閉じない。

この規則は、ブロックの `{` より後の行に `{` を持つブロックを報告する。
ただし、ブロックを閉じる `}` がその行に単独であるものは除く。
そうでなければブロックを閉じるのは、その `{` の後の最初の `}`、
つまりメタデータか JSON のオブジェクトの `}` である。
`accDescr { a { b }` のように `{` の行にある `}` と、行に単独である `}` は、
書いたとおりにブロックを閉じ、報告しない。
`}` は、その行で前に空白と指示子しかないとき、行に単独である。
そのため、複数の行に書いたメタデータの `}` が行に単独であり、
それがブロックを閉じるものは報告しない。
`accDescr {` の後の `a {b }` のように、`{` を持ち、
後の行の自分の `}` で終わる説明も報告する。
この規則は、その `}` をメタデータの `}` と見分けないからである。
これが、`recommended` の設定がこの規則を有効にしない理由である。

説明が終わるところでブロックを閉じる。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr { first
  A --> B
  actor C@{ type: hollow }
  D
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr { first }
  A --> B
  actor C@{ type: hollow }
  D
```

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr {
    uses { here
  }
  A
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [usecase-no-empty-description-block](./usecase-no-empty-description-block.ja.md)
- [usecase-no-duplicate-description](./usecase-no-duplicate-description.ja.md)

## 背景

[ブロックの字句解析](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts#L70-L80)
は、その `{` の後の最初の `}` でブロックを終え、それのないブロックには合わない。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/usecase-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

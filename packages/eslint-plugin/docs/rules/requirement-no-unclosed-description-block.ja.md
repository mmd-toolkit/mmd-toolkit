# @mmd-toolkit/requirement-no-unclosed-description-block

英語版:
[requirement-no-unclosed-description-block.md](./requirement-no-unclosed-description-block.md)

ほかのもののために書いた `}` が閉じる `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

説明のブロックは、`{` の後の最初の `}` で終わる。
ブロックの `}` が落ちていて、requirement や element の本体のように、
後の文が `}` を持つと、mermaid.js はそこで説明のブロックを閉じ、
そこまでの行を説明として、エラーなしに読む。
後に `}` がなければ、mermaid.js はテキストを拒否する。

## 規則の詳細

この規則は、ブロックの `{` より後の行に、
テキストの `{` がある説明のブロックを報告する。
対象の図種は `requirement` である。

最初の `}` までの文字は、`{` も含めて、ブロックのテキストである（仕様の
[アクセシビリティの値](../../../spec/docs/diagrams/requirement.ja.md#アクセシビリティの値)）。
`accDescr { x` の後の行 `requirement r {`、`id: 1`、`}` では、
説明は `x`、`requirement r {`、`id: 1` になり、requirement `r` はできない。
element の本体でも同じである。
`accDescr {`、`uses { here`、`}` のように、
`{` を持ち、後の行の自分の `}` で終わる説明も報告する。
規則はその `}` を本体の `}` と見分けず、そうした説明はまれだからである。
`accDescr { a {b }` のように `{` の行にある `}` は、
書いたとおりにブロックを閉じるので、報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-unclosed-description-block: error
requirementDiagram
  accDescr { x
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-unclosed-description-block: error
requirementDiagram
  accDescr { x }
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-unclosed-description-block](./er-no-unclosed-description-block.ja.md)
- [requirement-no-empty-description-block](./requirement-no-empty-description-block.ja.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/requirement-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

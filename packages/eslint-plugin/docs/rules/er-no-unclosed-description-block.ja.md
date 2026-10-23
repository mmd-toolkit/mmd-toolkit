# @mmd-toolkit/er-no-unclosed-description-block

英語版:
[er-no-unclosed-description-block.md](./er-no-unclosed-description-block.md)

ほかのもののために書いた `}` が閉じる `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

説明のブロックは、`{` の後の最初の `}` で終わる。
ブロックの `}` がなく、実体の属性ブロックのように後の文が `}` を持つと、
mermaid.js はそこで説明のブロックを閉じ、
そこまでの行をエラーなしに説明として読む。
後に `}` がなければ、mermaid.js はテキストを拒否する。

## 規則の詳細

この規則は、ブロックの `{` より後の行に、
テキストの `{` がある説明のブロックを報告する。
対象の図種は `er` である。

最初の `}` までの文字は、`{` も含めて、ブロックのテキストである（仕様の
[アクセシビリティの値](../../../spec/docs/diagrams/er.ja.md#アクセシビリティの値)）。
`accDescr { x` の後の行 `A {`、`string name`、`}` では、
説明は `x`、`A {`、`string name` になり、実体 `A` はできない。
属性ブロックの `}` のように、ブロックを閉じる `}` が行にひとりでも報告する。
`accDescr {`、`uses { here`、`}` のように、
`{` を持ち、後の行の自分の `}` で終わる説明も報告する。
規則はその `}` を属性ブロックの `}` と見分けず、そうした説明はまれだからである。
`accDescr { a { b }` のように `{` の行にある `}` は、
書いたとおりにブロックを閉じるので、報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-unclosed-description-block: error
erDiagram
  accDescr { x
  A {
    string name
  }
  B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-unclosed-description-block: error
erDiagram
  accDescr { x }
  A {
    string name
  }
  B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)
- [er-no-empty-description-block](./er-no-empty-description-block.ja.md)
- [er-no-duplicate-description](./er-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/er-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

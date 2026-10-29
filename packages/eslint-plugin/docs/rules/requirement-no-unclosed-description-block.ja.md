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
後に `}` がなければ、mermaid.js はエラーを出す。

## 規則の詳細

この規則は、要求図（`requirementDiagram`）に当てる。
開く `{` より後の行のテキストに `{` がある説明のブロックを報告する。
意図してその `{` を含め、自分の `}` で閉じる説明も、
規則がその `}` を本体の `}` と見分けられないので報告する。
開く行に閉じる `}` があるブロックは、その行に別の `{` があっても報告しない。

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

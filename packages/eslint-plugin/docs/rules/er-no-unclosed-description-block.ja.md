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
後に `}` がなければ、mermaid.js はエラーを出す。

## 規則の詳細

この規則は、ER 図（`erDiagram`）に当てる。
開く `{` より後の行のテキストに `{` がある説明のブロックを報告する。
意図してその `{` を含め、自分の `}` で閉じる説明も、
規則がその `}` を属性ブロックの `}` と見分けられないので報告する。

開く行に閉じる `}` があるブロックは、その行に別の `{` があっても報告しない。
後の行に `{` があるブロックは、
属性ブロックの終わりのように閉じる `}` が自分の行にひとりでも報告する。

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

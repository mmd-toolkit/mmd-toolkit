# @mmd-toolkit/eventmodeling-no-unclosed-description-block

英語版:
[eventmodeling-no-unclosed-description-block.md](./eventmodeling-no-unclosed-description-block.md)

後の文のために書いた `}` が閉じる `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`accDescr {` のブロックは、その `{` の後の最初の `}` まで続く。
自分の `}` がなく、
`tf 02 cmd Buy { item }`
のようなインラインのデータを持つフレームのように後の文が `}` を持つと、
mermaid.js はエラーなしにそこでブロックを閉じ、
そこまでの文は説明になって消える。

## 規則の詳細

この規則は、イベントモデリング図（`eventmodeling`）に当てる。
`accDescr {` のブロックの `{` より後の行に `{` があり、
閉じる `}` がその行に単独でないブロックを報告する。
`}` は、その行で前に空白しかないとき、単独と数える。
コメント行の中の `{` は数えず、その中の `}` は何も閉じない。

開始の `{` の行で閉じるブロックは報告しない。
行に単独である `}` が閉じるブロックも、
`data` ブロックの `}` が閉じるものを含めて報告しない。
`accDescr {` の後の `a {b }` のような説明は、
その `}` が意図した終わりでも報告する。
この規則はそれをフレームのインラインのデータの `}` と見分けないからである。

閉じる `}` のないブロックは、mermaid.js がエラーを出すので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-unclosed-description-block: error
eventmodeling accDescr { first
  tf 01 ui Cart
  tf 02 cmd Buy { item }
  tf 03 evt Bought
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-unclosed-description-block: error
eventmodeling accDescr { first }
  tf 01 ui Cart
  tf 02 cmd Buy { item }
  tf 03 evt Bought
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-unclosed-description-block: error
eventmodeling accDescr {
  uses { here
}
  tf 01 cmd Buy { item }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.ja.md)
- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/eventmodeling-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/eventmodeling-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

# @mmd-toolkit/usecase-no-unclosed-description-block

英語版:
[usecase-no-unclosed-description-block.md](./usecase-no-unclosed-description-block.md)

後の文のために書いた `}` が閉じる `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

`accDescr {` のブロックは、開く括弧の後の最初の `}` まで続く。
自分の `}` がないと、mermaid.js は後の文の `}` でエラーなしに閉じることがある。
間の文は説明の文字になり、図から消える。

## 規則の詳細

この規則は、ユースケース図（`usecase-beta`）に当てる。
開く括弧より後の行に `{` を含む `accDescr` のブロックを、
閉じる `}` がその行に単独である場合を除いて報告する。
閉じる括弧は、その行で前に空白しかないとき、単独とする。
閉じる `}` がないブロックは、mermaid.js がエラーを出すので報告しない。

コメント行の中の `{` は数えず、コメント行の中の `}` はブロックを閉じない。
`accDescr { a { b }` のように同じ行で閉じる形は報告しない。
後のメタデータの閉じる括弧が行に単独であれば、誤って説明を閉じても報告しない。

`accDescr {` の後の `a {b }` のように意図して書いた説明も、
この規則がその括弧をメタデータと見分けられないため報告する。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/usecase-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/usecase-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

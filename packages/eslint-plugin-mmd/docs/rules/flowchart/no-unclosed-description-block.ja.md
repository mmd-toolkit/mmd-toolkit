# mmd/flowchart/no-unclosed-description-block

英語版: [no-unclosed-description-block.md](./no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

<!-- end auto-generated rule notice -->

mermaid.js は、閉じていない説明のブロックを受理する。
図の残りはブロックのテキストとして読まれ、
ブロックの中身にかかわらず、説明は空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

ブロックの前に書いた説明も、空のものに置き換わる。

この規則に**反する**コードの例:

```mmd
flowchart LR
  A
  accDescr { x
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  A
  accDescr { y }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-empty-description-block](./no-empty-description-block.ja.md)
- [no-duplicate-description](./no-duplicate-description.ja.md)

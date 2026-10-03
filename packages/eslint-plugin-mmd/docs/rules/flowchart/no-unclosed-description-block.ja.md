# mmd/flowchart/no-unclosed-description-block

英語版: [no-unclosed-description-block.md](./no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡 この規則は、[エディタの提案](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)で手で直せる。

<!-- end auto-generated rule notice -->

mermaid.js は、閉じていない説明のブロックを受理する。
図の残りはブロックのテキストとして読まれ、
ブロックの中身にかかわらず、説明は空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
`flowchart-v2`、`flowchart-elk`、`swimlane` に当たる。

ブロックの前に書いた説明も、空のものに置き換わる。
ブロックの後の文は、ブロックのテキストになる。
`accDescr { x` の後の行 `B --> C` は、リンクを作らない。

報告ごとに、規則はブロックを閉じる書き換えを提案する。

- `{` のある行の終わりで閉じる。
  その行で `{` の後にテキストがあるときに出す。
  mermaid.js は、そのテキストを説明として読み、後の行を文として読む。
- テキストの終わりで閉じる。
  ブロックの、`{` の行より後の行にテキストがあるときに出す。
  mermaid.js は、`{` の後のテキストすべてを説明として読む。

`{` の後に何もないブロックには、提案を出さない。
そこで閉じると、空のブロックになるからである。
ディレクティブはテキストではないので、`{` の後にディレクティブしかなければ、
行の終わりで閉じる提案は出さない。
閉じていないディレクティブがあるブロックには、提案を出さない。
そのディレクティブから後を mermaid.js がどう読むかは、
ブロックをどこで閉じても、ディレクティブで決まるからである。
`accDescr { d }` の後の行 `more %%{init: {}` と `A --> B` からは、
A から B への辺ができず、
`%%{init: {}` の代わりに `%%{wrap` があると、
ディレクティブの直前でブロックを閉じても拒否される。
ブロックの前に説明があるときは、閉じたブロックがそれを置き換え、
[no-duplicate-description](./no-duplicate-description.ja.md)
がそのブロックを報告する。
テキストが説明を 2 度設定しているからである。

この規則に**反する**コードの例:

```mmd
flowchart LR
  A
  accDescr { x
```

```mmd
flowchart LR
  A --> B
  accDescr { x
  B --> C
```

この規則に**従う**コードの例:

```mmd
flowchart LR
  A
  accDescr { y }
```

```mmd
flowchart LR
  A --> B
  accDescr { x }
  B --> C
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [no-empty-description-block](./no-empty-description-block.ja.md)
- [no-duplicate-description](./no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../../src/rules/flowchart/no-unclosed-description-block.ts)
- [テストのソース](../../../tests/rules/flowchart/no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

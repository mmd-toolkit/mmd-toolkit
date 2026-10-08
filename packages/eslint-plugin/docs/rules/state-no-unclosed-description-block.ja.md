# @mmd-toolkit/state-no-unclosed-description-block

英語版:
[state-no-unclosed-description-block.md](./state-no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、`}` のない説明のブロックを受理する。
`{` の後の最初の `}` で、それがなければテキストの終わりでブロックを閉じ、
そこまでの行をブロックのテキストとして読む。
`}` がなければ、ブロックの中身にかかわらず、説明は空になる。

## 規則の詳細

この規則は、`}` で閉じていない `accDescr {` のブロックを報告する。
対象の図種は `stateDiagram` である。

ブロックの前に書いた説明も、空のものに置き換わる。
ブロックの後の文は、ブロックのテキストになる。
`accDescr { x` の後の行 `A --> B` は、遷移を作らない。

規則は、ほかのもののために書いた `}` が閉じるブロックも報告する。
説明のブロックは、`{` の後の最初の `}` で終わり、
そこまでのほかの文字は、`{` も含めて、そのテキストである（仕様の
[アクセシビリティの値](../../../spec/docs/diagrams/state.ja.md#アクセシビリティの値)）。
合成状態の本体は自分の `}` で終わるので、
`accDescr { x` の後の行 `state B {`、`C`、`}` では、
説明は `x`、`state B {`、`C` になり、状態 `B` も `C` もできない。
規則は、ブロックの `{` より後の行に、テキストの `{` があるブロックを報告する。
本体の `}` のように、ブロックを閉じる `}` が行にひとりでも報告する。
`accDescr {`、`uses { here`、`}` のように、
`{` を持ち、後の行の自分の `}` で終わる説明も報告する。
規則はその `}` を本体の `}` と見分けず、そうした説明はまれだからである。
`accDescr { a { b }` のように `{` の行にある `}` は、
書いたとおりにブロックを閉じるので、報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  A --> B
  accDescr { x
```

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  accDescr { x
  state B {
    C
  }
  D --> E
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  A --> B
  accDescr { x }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.ja.md)
- [state-no-empty-description-block](./state-no-empty-description-block.ja.md)
- [state-no-duplicate-description](./state-no-duplicate-description.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-unclosed-description-block.ts)
- [テストのソース](../../tests/rules/state-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->

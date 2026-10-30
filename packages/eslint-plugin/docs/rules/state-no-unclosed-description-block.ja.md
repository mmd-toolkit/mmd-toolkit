# @mmd-toolkit/state-no-unclosed-description-block

英語版:
[state-no-unclosed-description-block.md](./state-no-unclosed-description-block.md)

閉じる `}` のない `accDescr {` のブロックを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

mermaid.js は、閉じる `}` のない `accDescr {` のブロックをエラーなしに受理する。
最初の `}` かテキストの終わりまで、後の行を説明のテキストとして読む。
`}` がなければ説明は空になる。

## 規則の詳細

この規則は、状態図（`stateDiagram`、`stateDiagram-v2`）に当てる。
閉じる `}` のない `accDescr {` のブロックを報告する。

開く `{` より後の行に `{` がある閉じたブロックも、
閉じる `}` が自分の行にひとりでも報告する。
合成状態の閉じる `}` が代わりに説明を閉じ、
その中の状態を説明に取り込むことがある。

後の行に意図して `{` を含めた説明も、
規則がその `}` を合成状態のものと見分けられないので報告する。
`accDescr { a { b }` のように、開く `{` の行で閉じるものは報告しない。

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

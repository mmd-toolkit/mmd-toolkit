# @mmd-toolkit/state-no-ignored-text

英語版: [state-no-ignored-text.md](./state-no-ignored-text.md)

mermaid.js が捨てるテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
ほかのテキストも同じ行にあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。
状態図には、ほかにもテキストを捨てる場所がある。

## 規則の詳細

この規則は、状態図（`stateDiagram`、`stateDiagram-v2`）に当てる。
同じ行の `direction` より前か、その方向の値より後にあるテキストを、
`B : x direction LR` のように状態の説明の中に書いた `direction`
も含めて報告する。
方向の後の `%%` で始まるテキストは、コメントのつもりで書かれ、
mermaid.js が意図どおりに捨てるので報告しない。

次のものも報告する。

- 別名の定義の 2 つ目の `:` からのテキスト。
  `state "d" as A : x : y` の `: y` などが当たる。
- 本体の `{` の前の `%%`。
  `state "d" as %% c {` では、別名は id を持たない。
- 1 行のノートの `:` の直後の文字。
  `note left of A:hi` の `h` などが当たる。
  ノートのテキスト全体を保つには、`:` の後に空白を書く。
- `state x ""` の `""` のように mermaid.js が飛ばす空の文字列と、
  後の行の本体の `{` の前にある空の説明のブロックや 2 つ目の `state`。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  A --> B direction LR
```

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  direction TBX
  A --> B
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  direction LR
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  direction LR %% c
  A --> B
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.ja.md)
- [class-no-ignored-text](./class-no-ignored-text.ja.md)

## 参考

- [状態図のノート](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/stateDiagram.md#L263)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-ignored-text.ts)
- [テストのソース](../../tests/rules/state-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->

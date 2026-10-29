# @mmd-toolkit/state-no-ignored-text

英語版: [state-no-ignored-text.md](./state-no-ignored-text.md)

mermaid.js が捨てるテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
その行にほかのテキストもあると、 mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。
state 図には、同じようにテキストを捨てる所がほかにもいくつかある。

## 規則の詳細

この規則は、mermaid.js が捨てるテキストを報告する。
対象の図種は `stateDiagram` である。

`A --> B direction LR` は方向を `LR` にし、遷移も状態も作らない。
`direction TBX` は方向を `TB` にし、`X` は捨てられる。
方向の文のつもりでない行も、方向の文になる。
`B : x direction LR` では、状態 `B` も説明もできない。

`direction LR %% c` のように、方向の後の `%%` で始まるテキストは報告しない。
書き手はそれをコメントのつもりで書いており、
mermaid.js も書き手の意図どおりにそれを捨てる。

規則は、mermaid.js が捨てるほかのテキストも報告する。

- 別名の定義の 2 つ目の `:` からのテキスト。
  `state "d" as A : x : y` は、A に、両端に空白のある 2 つ目の説明 `x` を与え、
  `: y` は捨てられる。
- 本体の `{` の前の `%%`。
  `state "d" as %% c {` では、別名は id を持たず、その本体の状態は、
  どの合成状態にも入らない。
- 1 行に書いたノートの `:` の直後の 1 文字。
  `note left of A:hi` は、ノートのテキストを `i` にする。
  [mermaid.js の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/stateDiagram.md#L263)
  は、`note left of State2 : This is the note to the left.` のように、
  `:` の後に空白を置いてそうしたノートを書く。
  `note left of A : hi` のようにそう書けば、何も捨てられない。
- mermaid.js が飛ばす空の文字列（`state x ""` の `""` など）と、
  後の行の本体の `{` の前にある空の説明のブロックと 2 つ目の `state`。

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

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/state-no-ignored-text.ts)
- [テストのソース](../../tests/rules/state-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->

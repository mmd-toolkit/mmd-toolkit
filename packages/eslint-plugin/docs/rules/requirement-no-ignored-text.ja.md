# @mmd-toolkit/requirement-no-ignored-text

英語版: [requirement-no-ignored-text.md](./requirement-no-ignored-text.md)

mermaid.js が読まないテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
その行にほかのテキストもあると、
mermaid.js は行全体を方向の文として読み、残りをエラーなしに捨てる。

## 規則の詳細

この規則は、方向の行で mermaid.js が読まないテキストを報告する。
対象の図種は `requirement` である。

`r - satisfies -> e direction LR` は方向を `LR` にし、関係を作らない。
`direction LR x` は方向を `LR` にし、`x` は捨てられ、
`foo direction LR bar` は両方の語を捨てる。
`mydirection RL` のように `direction` に付けた語も捨てられる。
`direction LR accDescr {}` のように方向の後に書いた空の説明のブロックも、
行の残りとともに捨てられる。

`direction LR %% c` や `direction LR # c` のように、
方向の後の、要求図のコメントの印（`%%`、`%`、`#`）で始まるテキストは報告しない。
書き手はそれをコメントのつもりで書いており、
mermaid.js も書き手の意図どおりにそれを捨てる。
`# direction LR` のように `#` や `%` でコメントにした方向の行は、
なお方向を設定し、規則はその前の印を報告する。
`%% direction LR` のようなコメント行は、何も設定しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  direction LR x
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
  r - satisfies -> e direction LR
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  direction LR
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  direction LR %% c
  requirement r {
    id: 1
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-ignored-text](./er-no-ignored-text.ja.md)
- [requirement-no-empty-description-block](./requirement-no-empty-description-block.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-ignored-text.ts)
- [テストのソース](../../tests/rules/requirement-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->

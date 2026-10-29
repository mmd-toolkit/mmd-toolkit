# @mmd-toolkit/requirement-no-ignored-text

英語版: [requirement-no-ignored-text.md](./requirement-no-ignored-text.md)

mermaid.js が捨てるテキストを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`direction` の文は、それだけで 1 行に書く。
その行にほかのテキストもあると、mermaid.js は行全体を方向の文として読み、
残りをエラーなしに捨てる。

## 規則の詳細

この規則は、要求図（`requirementDiagram`）に当てる。
方向の行で、`direction` の前か方向の値の後にあるテキストを、
`direction` に付けた語や、値の後の空の説明のブロックも含めて報告する。
値の後の `%%`、`%`、`#` で始まるテキストは、書き手がコメントのつもりで書き、
mermaid.js もそのとおりに捨てるので、報告しない。

`# direction LR` のように先頭に `#` や `%` のある方向の行は、なお方向を設定し、
前の印を報告する。
`%% direction LR` のように `%%` で始まるコメント行は、
方向を設定しないので報告しない。

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

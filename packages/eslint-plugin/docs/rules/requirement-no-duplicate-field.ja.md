# @mmd-toolkit/requirement-no-duplicate-field

英語版: [requirement-no-duplicate-field.md](./requirement-no-duplicate-field.md)

requirement や element の本体がすでに持つフィールドを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

requirement のフィールド `id`、`text`、`risk`、`verifyMethod` と、
element のフィールド `type`、`docRef` は、それぞれ 1 つの値を持つ。
本体が同じフィールドを 2 回書くと、mermaid.js は最初の値を残し、
後のものをエラーなしに捨てる。

## 規則の詳細

この規則は、本体のフィールドのうち、同じフィールドの最初のものより後のものを
すべて報告する。
対象の図種は `requirement` である。

`id: 1` の後の 2 つ目の `id: 2` は、id を `1` のままにする。
ほかのフィールドも同じで、
`risk: low` と `risk: high` の後、risk は `Low` である。
キーワードは大文字小文字を問わず読むので、`id: 1` の後の `ID: 2` も報告する。
後のフィールドはそれぞれ報告し、同じフィールドが 3 つなら 2 つ報告する。
間に空の説明のブロックがあっても同じである。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-field: error
requirementDiagram
  requirement r {
    id: 1
    id: 2
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-field: error
requirementDiagram
  requirement r {
    id: 1
    text: second
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [requirement-no-duplicate-name](./requirement-no-duplicate-name.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-duplicate-field.ts)
- [テストのソース](../../tests/rules/requirement-no-duplicate-field.test.ts)

<!-- end auto-generated rule resources -->

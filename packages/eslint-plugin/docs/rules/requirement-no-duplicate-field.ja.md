# @mmd-toolkit/requirement-no-duplicate-field

英語版: [requirement-no-duplicate-field.md](./requirement-no-duplicate-field.md)

requirement や element の本体がすでに持つフィールドを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

💡
[エディターの修正候補](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions)
を選んで適用できる。

<!-- end auto-generated rule notice -->

requirement のフィールド `id`、`text`、`risk`、`verifyMethod` と、
element のフィールド `type`、`docRef` は、それぞれ 1 つの値を持つ。
本体が同じフィールドを 2 回書くと、mermaid.js は最初の値を残し、
後のものをエラーなしに捨てる。

## 規則の詳細

この規則は、要求図（`requirementDiagram`）に当てる。
requirement や element の本体で繰り返すフィールドのうち、
同じ本体のそのフィールドの最初の値と違うものを、それぞれ報告する。
フィールドのキーワードは、大文字小文字を問わず読む。

値は周囲の空白と文字列の引用符を除いて比べ、
`risk` と `verifyMethod` は大文字小文字も区別しない。
最初の値を繰り返すフィールドは報告しない。
`id: 1`、`id: 2`、`id: 1` は 1 つ、`id: 1`、`id: 2`、`id: 3` は 2 つ報告する。
フィールドの間の空の説明のブロックは、比較に影響しない。

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

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-field: error
requirementDiagram
  requirement r {
    id: 1
    risk: low
    risk: Low
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

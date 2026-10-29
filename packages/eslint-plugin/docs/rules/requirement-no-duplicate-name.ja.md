# @mmd-toolkit/requirement-no-duplicate-name

英語版: [requirement-no-duplicate-name.md](./requirement-no-duplicate-name.md)

前のものの名前を使い回す requirement や element を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、名前ごとに最初の requirement と最初の element を持つ。
requirement の名前の後の requirement や、element の名前の後の element は、
エラーにならず、その種類とフィールドは捨てられ、クラスだけが効く。
名前の使い回しは、たいてい、ブロックを写した残りである。

## 規則の詳細

この規則は、要求図（`requirementDiagram`）に当てる。
名前を使い回す requirement や element のうち、
種類かフィールドの値が失われるものを報告する。
その名前の最初の requirement と種類が違う場合か、
最初の文が同じ値では持たないフィールドがある場合である。
requirement と element は、同じ名前の最初のものと別々に比べる。

何かを失う後の文は、それぞれ 1 つの報告になる。

保たれる値のフィールドを繰り返すだけの後の文は報告しない。
値は周囲の空白と文字列の引用符を除いて比べ、
`risk` と `verifyMethod` は大文字小文字を区別しない。
名前は大文字小文字を区別するが、名前を囲む引用符は名前を変えない。

同じ名前の requirement と element は、mermaid.js が両方を保つので報告しない。
フィールドのない同じ種類の後の文は、クラスを与えるだけなので報告しない。
そのクラスは、その名前の requirement があればそれに行く。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement r {
    id: 1
  }
  requirement r {
    text: second
  }
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement r {
    id: 1
  }
  requirement s {
    text: second
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement r {
    id: 1
  }
  r:::important
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-name: error
requirementDiagram
  requirement x {
    id: 1
  }
  element x {
    type: module
  }
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-redefined-entity](./er-no-redefined-entity.ja.md)
- [requirement-no-undef](./requirement-no-undef.ja.md)
- [requirement-no-duplicate-field](./requirement-no-duplicate-field.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-duplicate-name.ts)
- [テストのソース](../../tests/rules/requirement-no-duplicate-name.test.ts)

<!-- end auto-generated rule resources -->

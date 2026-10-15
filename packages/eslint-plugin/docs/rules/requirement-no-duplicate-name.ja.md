# @mmd-toolkit/requirement-no-duplicate-name

英語版: [requirement-no-duplicate-name.md](./requirement-no-duplicate-name.md)

前のものの名前を使い回す requirement や element を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

mermaid.js は、名前ごとに最初の requirement と最初の element を持つ。
同じ名前の後のものはエラーにならず、その種類とフィールドは捨てられ、
クラスだけが効く。
名前の使い回しは、たいてい、ブロックを写した残りである。

## 規則の詳細

この規則は、2 つの場合に、requirement や element の名前を報告する。
mermaid.js は requirement と element を別々に持つので、
requirement は前の requirement と、element は前の element と比べる。
そのどれかが同じ名前を持つとき、後の文は、フィールドを持つか、
requirement なら種類が違えば報告する。
どれも持たず、ほかの種類の文がその名前を持つときは、
後の文はその名前の 2 つ目の箱を作り、報告する。
対象の図種は `requirement` である。

`id: 1` を持つ `requirement r` の後、
`id: 2` と `text: second` を持つ 2 つ目の `requirement r` は、
`r` を id `1`、テキストなしのままにし、
2 つ目の `functionalRequirement r` は、その種類を `requirement` のままにする。
requirement の名前の element や、element の名前の requirement は、
その名前の 2 つ目の箱になる。
その名前を持つ `style`、`class`、`:::` の後のクラスは requirement に行く。
`element x` と `requirement x` の後、
`id: 2` を持つ 3 つ目の `requirement x` は報告し、
その id は捨てられる。
フィールドを持たない 3 つ目の `requirement x` は報告しない。
`requirement x` と `element x` の後の `element x:::c` は報告せず、
クラス `c` を requirement に与える。
引用符で囲んだ名前は同じ名前である。
`requirement r` の後の `requirement "r"` は報告する。
名前は大文字小文字で区別する。
`requirement r` と `requirement R` は 2 つの requirement である。
報告する文はそれぞれ数え、フィールドを持つ `requirement r` が 3 つなら
2 つ報告する。

`requirement r:::c {` と `}` のように、
フィールドを持たない同じ種類の後の文はクラスを与えるだけで、報告しない。
`r:::c` も同じことを書く。

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

## オプション

この規則にはオプションがない。

## 関連する規則

- [er-no-redefined-entity](./er-no-redefined-entity.ja.md)
- [requirement-no-undef](./requirement-no-undef.ja.md)
- [requirement-no-duplicate-field](./requirement-no-duplicate-field.ja.md)

## 背景

mermaid.js は、その名前のものがないときだけ requirement や element を加え、
その後、そのために読んだフィールドを忘れる
（[`addRequirement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L126-L141) と
[`addElement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/requirement/requirementDb.ts#L172-L185)）。

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/requirement-no-duplicate-name.ts)
- [テストのソース](../../tests/rules/requirement-no-duplicate-name.test.ts)

<!-- end auto-generated rule resources -->

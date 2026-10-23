# @mmd-toolkit/er-no-redefined-entity

英語版: [er-no-redefined-entity.md](./er-no-redefined-entity.md)

実体に 2 つ目の別名を与える実体の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

実体は何度でも書けて、最初に書いた別名が使われる。
別名を持つ名前を、新しい実体のつもりなどで別の別名とともにもう一度書くと、
mermaid.js は 2 つ目の別名をエラーなしに無視する。

## 規則の詳細

この規則は、前の実体の文が同じ実体に別の別名を与えていたときに、
別名を持つ実体の文を報告する。
対象の図種は `er` である。

`p[Person]` の後の文 `p[Human]` は、実体 `p` の別名を `Person` のまま残す。
無視されるのは別名だけで、後の文のクラスと属性は効く。
まだ別名のない実体に与える別名は設定される。
`p` の後や、`p` を名指す関係の後の `p[Human]` は、`p` に別名 `Human` を与え、
報告しない。
同じ別名をもう一度書くことも報告しない。
`p["Person"]` と `p[Person]` のように、
引用符のあるものとないものでも同じである。
subgraph の中の文と外の文は、同じ実体を名指す。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-redefined-entity: error
erDiagram
  p[Person]
  p[Human]
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-redefined-entity: error
erDiagram
  p[Person]
  p
  q
  q[Order]
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.ja.md)
- [class-no-redefined-class](./class-no-redefined-class.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-redefined-entity.ts)
- [テストのソース](../../tests/rules/er-no-redefined-entity.test.ts)

<!-- end auto-generated rule resources -->

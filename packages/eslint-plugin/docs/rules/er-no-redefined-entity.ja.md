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

この規則は、ER 図（`erDiagram`）に当てる。
すでに別名を持つ実体に、別の別名を与える実体の文を報告する。
クラスや属性を加える文も報告する。
mermaid.js はそれらを適用し、別名だけを無視する。

関係で初めて名指したものも含め、別名のない実体に与える別名は報告しない。
引用符の有無にかかわらず、同じ別名の繰り返しも報告しない。
subgraph の中と外の文は、同じ実体を名指す。

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

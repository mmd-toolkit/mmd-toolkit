# @mmd-toolkit/er-no-undef

英語版: [er-no-undef.md](./er-no-undef.md)

どの実体も subgraph も名指さない `style` と `class` の文を禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

`style` と `class` は、実体か subgraph を名指す。
その名前がどれのものでもないとき、mermaid.js はその文を受理して何もしない。
名前を打ち間違えても、エラーにならない。

## 規則の詳細

この規則は、ER 図（`erDiagram`）に当てる。
`style` と `class` の各名前のうち、
図のどこにも実体の名前や subgraph の id としてないものを報告する。
関係で名指す実体や、どの subgraph の中で名指す実体も、定義済みと数える。

別名は名前と数えず、`p[Person]` の後の `style Person fill:red` は報告する。
実体の名前を囲む引用符は名前を変えないので、`style A` は `"A"` を名指せる。
名指す実体や subgraph より前の文は、mermaid.js がそこで何もしなくても、
図の実体や subgraph を正しく名指しているので報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-undef: error
erDiagram
  A
  style Z fill:red
```

```mmd
%% eslint @mmd-toolkit/er-no-undef: error
erDiagram
  p[Person]
  style Person fill:red
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/er-no-undef: error
erDiagram
  A
  style A fill:red
  class A c
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [flowchart-no-undef](./flowchart-no-undef.ja.md)
- [class-no-undef](./class-no-undef.ja.md)
- [state-no-undef](./state-no-undef.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/er-no-undef.ts)
- [テストのソース](../../tests/rules/er-no-undef.test.ts)

<!-- end auto-generated rule resources -->

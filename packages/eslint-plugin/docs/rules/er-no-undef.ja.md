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

この規則は、`style` と `class` の文の名前のうち、図のどの実体の名前でも、
どの subgraph の id でもないものを報告する。
対象の図種は `er` である。

図の実体は、実体の文か関係が名指すもので、図のどこにあっても、
どの subgraph の中にあってもよい。
`A` の後の `style Z fill:red` と `class Z c` は、何も変えない。
一覧は名前ごとに確かめる。
`style Z,A fill:red` は `A` にスタイルを付け、`Z` を報告する。
別名は名前ではない。
`p[Person]` の後の `style Person fill:red` は何も変えず、報告する。
`"A"` のように引用符で書いた実体は、`style A` で名指せる。

名指す実体や subgraph より前に書いた文も、mermaid.js では何も変えない。
`A` より前の `style A fill:red` は、`A` にスタイルを付けない。
こうした文は、正しく書いた図の実体を名指しているので、規則は報告しない。

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
